const express = require("express");
const {
  create,
  signIn,
  verifyPhone,
  resendPhoneVerificationToken,
  forgetPassword,
  resetPassword,
  sendResetPasswordTokenStatus,
} = require("../controllers/user");
const { uploadImage } = require("../middlewares/multer");
const { isValidPassResetToken } = require("../middlewares/user");

const router = express.Router();

router.post("/create", uploadImage.single("avatar"), create);
router.post("/sign-in", signIn);
router.post("/verify-phone", verifyPhone);
router.post("/resend-phone-verification-token", resendPhoneVerificationToken);
router.post("/forget-password", forgetPassword);
router.post(
  "/verify-pass-reset-token",
  isValidPassResetToken,
  sendResetPasswordTokenStatus
);
router.post("/reset-password", isValidPassResetToken, resetPassword);
module.exports = router;
