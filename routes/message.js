const express = require("express");
const router = express.Router();

const {} = require("../controllers/chat");
const { sendMessage, getAllMessages } = require("../controllers/message");
const { isAuth } = require("../middlewares/auth");

router.post("/send-message", isAuth, sendMessage);
router.get("/", isAuth, getAllMessages);

module.exports = router;
