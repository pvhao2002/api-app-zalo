const Chat = require("../models/chat");
const User = require("../models/user");
const { sendError } = require("../utils/helper");
const { isValidObjectId } = require("mongoose");

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
    select: "name phone isVerified role avatar",
  });

  res.json(isChat);
};

exports.getChats = async (req, res) => {
  let chats = await Chat.find({
    users: { $elemMatch: { $eq: req.user._id } },
  })
    .populate("users", "-password")
    .populate("owner", "-password")
    .populate("latestMessage")
    .sort({ updatedAt: -1 });

  if (!chats) return sendError(res, "Chat not found!");

  chats = await User.populate(chats, {
    path: "latestMessage.sender",
    select: "name phone isVerified role avatar",
  });

  res.json({ chats });
};

exports.createGroup = async (req, res) => {};

exports.renameGroup = async (req, res) => {};

exports.addUserToGroup = async (req, res) => {};

exports.removeUserFromGroup = async (req, res) => {};
