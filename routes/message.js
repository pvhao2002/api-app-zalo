const express = require("express");
const router = express.Router();

const {} = require("../controllers/chat");
const { isAuth } = require("../middlewares/auth");

router.post("/createChat", isAuth, createChat);
router.post("/accessChat", isAuth, accessChat);
router.get("/getChats", isAuth, getChats);
router.post("/group/create", isAuth, createGroup);
router.put("/group/rename", isAuth, renameGroup);
router.put("/group/add-user", isAuth, addUserToGroup);
router.put("/group/remove-user", isAuth, removeUserFromGroup);

module.exports = router;
