const express = require("express");
const { create, signIn } = require("../controllers/user");
const { uploadImage } = require("../middlewares/multer");

const router = express.Router();

router.post("/create", uploadImage.single("avatar"), create);
router.post("/sign-in", signIn);

module.exports = router;
