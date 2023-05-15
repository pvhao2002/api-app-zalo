const Message = require("../models/message");
const Chat = require("../models/chat");
const User = require("../models/user");
const { sendError } = require("../utils/helper");
const { isValidObjectId } = require("mongoose");

exports.sendMessage = async (req, res) => {
  const { content, chatId } = req.body;

  if (!content) return sendError(res, "Content is not empty");
  if (!isValidObjectId(chatId)) return sendError(res, "Chat is not found");
  const message = await Message({
    sender: req.user._id,
    content: content,
    chat: chatId,
  });

  await message.save();

  const chat = await Chat.findByIdAndUpdate(
    chatId,
    { $push: { messages: message._id } },
    { new: true }
  );

  let fullMessage = await Message.findOne({ _id: message._id })
    .populate("sender", "name phone isVerified avatar")
    .populate("chat");

  fullMessage = await User.populate(fullMessage, {
    path: "chat.users",
    select: "name phone isVerified avatar",
  });

  if (!fullMessage) return sendError(res, "Message is invalid");

  res.json(fullMessage);
};

exports.getAllMessages = async (req, res) => {
  const { chatId } = req.body;
  if (!isValidObjectId(chatId)) return sendError(res, "Chat is not found");

  let chat = await Chat.findById(chatId).populate("messages");

  chat = await User.populate(chat, {
    path: "messages.sender",
    select: "name phone isVerified avatar",
  });

  res.json(
    chat.messages.map((c) => ({
      _id: c._id,
      content: c.content,
      sender: {
        _id: c.sender._id,
        name: c.sender.name,
        phone: c.sender.phone,
        isVerified: c.sender.isVerified,
        friends: c.sender.friends,
        avatar: c.sender.avatar,
      },
    }))
  );
};
