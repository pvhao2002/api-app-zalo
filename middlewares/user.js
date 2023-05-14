const { isValidObjectId } = require("mongoose");
const PasswordResetToken = require("../models/passwordResetToken");
const PhoneVerificationToken = require("../models/phoneVerificationToken");
const { sendError } = require("../utils/helper");
const User = require("../models/user");

exports.isValidPassResetToken = async (req, res, next) => {
  const { token, userId } = req.body;

  if (!token.trim() || !isValidObjectId(userId))
    return sendError(res, "Invalid request!");

  const resetToken = await PasswordResetToken.findOne({ owner: userId });
  if (!resetToken)
    return sendError(res, "Unauthorized access, invalid request!");

  const matched = await resetToken.compareToken(token);
  if (!matched) return sendError(res, "Unauthorized access, invalid request!");

  req.resetToken = resetToken;
  next();
};

exports.checkCurrentPassword = async (req, res, next) => {
  const { currentPassword } = req.body;

  const user = await User.findById(req.user._id);
  const matched = await user.comparePassword(currentPassword);
  if (!matched) return sendError(res, "The current password is not correct");

  next();
};
