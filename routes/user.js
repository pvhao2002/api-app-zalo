const express = require("express");
const {
  create,
  signIn,
  verifyPhone,
  resendPhoneVerificationToken,
  forgetPassword,
  resetPassword,
  sendResetPasswordTokenStatus,
  addFriend,
  getAllRequestAddFriend,
  answerRequestAddFriend,
} = require("../controllers/user");
const { uploadImage } = require("../middlewares/multer");
const { isAuth } = require("../middlewares/auth");
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
router.post("/add-friend", isAuth, addFriend);
router.get("/request-add-friends", isAuth, getAllRequestAddFriend);
router.post("/answer-request-add-friend", isAuth, answerRequestAddFriend);
router.get("/is-auth", isAuth, (req, res) => {
  const { user } = req;
  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      role: user.role,
    },
  });
});
module.exports = router;
