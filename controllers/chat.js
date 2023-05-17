const Chat = require("../models/chat");
const User = require("../models/user");
const { sendError } = require("../utils/helper");
const { isValidObjectId } = require("mongoose");

exports.createChat = async (req, res) => {
  const { userId } = req.body;

  if (!isValidObjectId(userId)) return sendError(res, "Invalid request!");

  const user = await User.findById(userId);
  const newChat = await Chat({
    name: user.name,
    users: [req.user._id, userId],
    isGroup: false,
  });
  await newChat.save();

  const fullChat = await Chat.findOne({ _id: newChat._id }).populate(
    "users",
    "-password"
  );

  if (!fullChat) return sendError(res, "Chat is not created");

  res.json(fullChat);
};

exports.accessChat = async (req, res) => {
  const { userId } = req.body;
  if (!isValidObjectId(userId)) return sendError(res, "Invalid request!");

  let isChat = await Chat.findOne({
    isGroup: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  if (!isChat) return sendError(res, "Chat not found!");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name phone isVerified avatar",
  });

  res.json(isChat);
};

exports.getChats = async (req, res) => {
  let chats = await Chat.find({
    users: { $elemMatch: { $eq: req.user._id } },
  })
    .populate("users", "-password")
    .populate("owner", "-password")
    .populate("messages")
    .sort({ updatedAt: -1 });

  if (!chats) return sendError(res, "Chat not found!");

  chats = await User.populate(chats, {
    path: "messages.sender",
    select: "name phone isVerified avatar",
  });

  chats = await Chat.populate(chats, {
    path: "messages.chat",
    select: "name",
  });

  res.json(chats);
};

exports.createGroup = async (req, res) => {
  const { users, name } = req.body;

  if (!name || !users) return sendError(res, "Please fill name and users");

  const pUsers = JSON.parse(users);

  if (pUsers.length < 2)
    return sendError(res, "More than 2 user is required to create group");

  pUsers.push(req.user);

  const newGroupChat = await Chat({
    name,
    users: pUsers,
    owner: req.user,
    isGroup: true,
  });
  await newGroupChat.save();

  const fullGroupChat = await Chat.findOne({ _id: newGroupChat._id })
    .populate("users", "-password")
    .populate("owner", "-password");

  res.json(fullGroupChat);
};

exports.renameGroup = async (req, res) => {
  const { id, name } = req.body;

  if (!isValidObjectId(id)) return sendError(res, "Invalid chat!");

  const chat = await Chat.findByIdAndUpdate(id, { name }, { new: true })
    .populate("users", "-password")
    .populate("owner", "-password");

  if (!chat) return sendError(res, "Chat not found");
  res.json(chat);
};

exports.addUserToGroup = async (req, res) => {
  const { chatId, userId } = req.body;
  if (!isValidObjectId(userId) || !isValidObjectId(chatId))
    return sendError(res, "Invalid request!");

  const chat = await Chat.findByIdAndUpdate(
    chatId,
    { $push: { users: userId } },
    { new: true }
  )
    .populate("users", "-password")
    .populate("owner", "-password");

  if (!chat) return sendError(res, "Chat not found");
  res.json(chat);
};

exports.removeUserFromGroup = async (req, res) => {
  const { chatId, userId } = req.body;
  if (!isValidObjectId(userId) || !isValidObjectId(chatId))
    return sendError(res, "Invalid request!");

  const chat = await Chat.findByIdAndUpdate(
    chatId,
    { $pull: { users: userId } },
    { new: true }
  )
    .populate("users", "-password")
    .populate("owner", "-password");

  if (!chat) return sendError(res, "Chat not found");
  res.json(chat);
};
