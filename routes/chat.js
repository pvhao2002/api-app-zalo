const express = require("express");
const router = express.Router();

const {
  createChat,
  getChats,
  accessChat,
  createGroup,
  renameGroup,
  addUserToGroup,
  removeUserFromGroup,
} = require("../controllers/chat");
const { isAuth } = require("../middlewares/auth");

router.post("/create-chat", isAuth, createChat);
router.post("/access-chat", isAuth, accessChat);
router.get("/get-chat", isAuth, getChats);
router.post("/group/create", isAuth, createGroup);
router.put("/group/rename", isAuth, renameGroup);
router.put("/group/add-user", isAuth, addUserToGroup);
router.put("/group/remove-user", isAuth, removeUserFromGroup);

module.exports = router;
