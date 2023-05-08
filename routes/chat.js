const express = require("express");
const chats = require("../utils/chats");
const router = express.Router();

const {
  getChats,
  accessChat,
  createGroup,
  renameGroup,
  addUserToGroup,
  removeUserFromGroup,
} = require("../controllers/chat");
const { isAuth } = require("../middlewares/auth");

router.post("/", isAuth, accessChat);
router.get("/", isAuth, getChats);
router.post("/group/create", isAuth, createGroup);
router.put("/group/rename", isAuth, renameGroup);
router.put("/group/add-user", isAuth, addUserToGroup);
router.put("/group/remove-user", isAuth, removeUserFromGroup);

module.exports = router;
