const express = require("express");
const { create, signIn } = require("../controllers/user");

const router = express.Router();

router.post("/create", create);
router.post("/sign-in", signIn);

module.exports = router;
