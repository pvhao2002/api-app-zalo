const mongoose = require("mongoose");

const requestAddFriendSchema = mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: "waiting",
    enum: ["waiting", "yes", "no"],
  },
});

module.exports = mongoose.model("RequestAddFriend", requestAddFriendSchema);
