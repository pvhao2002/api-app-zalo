const jwt = require("jsonwebtoken");
const User = require("../models/user");
const PhoneVerificationToken = require("../models/phoneVerificationToken");
const PasswordResetToken = require("../models/passwordResetToken");
const {
  sendError,
  uploadImageToCloud,
  generateRandomByte,
} = require("../utils/helper");
const { isValidObjectId } = require("mongoose");
const { generateOTP, generatePhoneTransporter } = require("../utils/phone");

exports.create = async (req, res) => {
  const { name, phone, password } = req.body;
  // const { file } = req;

  const oldUser = await User.findOne({ phone });

  if (oldUser) return sendError(res, "This phone is already in use!");

  const newUser = new User({ name, phone, password });

  // if (file) {
  //   const { url, public_id } = await uploadImageToCloud(file.path);
  //   newUser.avatar = { url, public_id };
  // }

  const url =
    "https://res.cloudinary.com/myshop-it/image/upload/v1679623840/ufe5mhdfffpudxehvgvl.png";
  const public_id = "ufe5mhdfffpudxehvgvl";

  newUser.avatar = { url, public_id };

  await newUser.save();

  let OTP = generateOTP();

  const newPhoneVerificationToken = new PhoneVerificationToken({
    owner: newUser._id,
    token: OTP,
  });

  await newPhoneVerificationToken.save();

  // let publishTextPromise = generatePhoneTransporter(newUser.phone, OTP);
  // publishTextPromise
  //   .then(function (data) {
  //     res.end(JSON.stringify({ MessageID: data.MessageId }));
  //   })
  //   .catch(function (err) {
  //     res.end(JSON.stringify({ Error: err }));
  //   });

  res.status(201).json({
    user: {
      id: newUser._id,
      name: newUser.name,
      phone: newUser.phone,
      avatar: newUser.avatar?.url,
    },
  });
};

exports.verifyPhone = async (req, res) => {
  const { userId, OTP } = req.body;

  if (!isValidObjectId(userId)) return sendError(res, "Invalid user!");
  const user = await User.findById(userId);
  if (!user) return sendError(res, "User not found!", 404);

  if (user.isVerified) return sendError(res, "User is already verified!");

  const token = await PhoneVerificationToken.findOne({ owner: userId });
  if (!token) return sendError(res, "Token not found!");

  const isMatched = await token.compareToken(OTP);
  if (!isMatched) return sendError(res, "Please submit a valid OTP!");

  user.isVerified = true;
  await user.save();

  await PhoneVerificationToken.findByIdAndDelete(token._id);

  const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
  res.json({
    user: {
      id: user._id,
      name: user.name,
      phone: user.phone,
      token: jwtToken,
      isVerified: user.isVerified,
      role: user.role,
    },
    message: "Your phone is verified.",
  });
};

exports.resendPhoneVerificationToken = async (req, res) => {
  const { userId } = req.body;

  const user = await User.findById(userId);
  if (!user) return sendError(res, "user not found!");

  if (user.isVerified)
    return sendError(res, "This phone id is already verified!");

  const alreadyHasToken = await PhoneVerificationToken.findOne({
    owner: userId,
  });

  if (alreadyHasToken)
    return sendError(
      res,
      "Only after one hour you can request for another token!"
    );

  let OTP = generateOTP();

  const newPhoneVerificationToken = new PhoneVerificationToken({
    owner: user._id,
    token: OTP,
  });

  await newPhoneVerificationToken.save();

  // let publishTextPromise = generatePhoneTransporter(user.phone, OTP);
  // publishTextPromise
  //   .then(function (data) {
  //     res.end(JSON.stringify({ MessageID: data.MessageId }));
  //   })
  //   .catch(function (err) {
  //     res.end(JSON.stringify({ Error: err }));
  //   });

  res.json({
    message: "New OTP has been sent to your phone.",
  });
};

exports.forgetPassword = async (req, res) => {
  const { phone } = req.body;

  if (!phone) return sendError(res, "Phone is missing!");

  const user = await User.findOne({ phone });
  if (!user) return sendError(res, "User not found!", 404);

  const alreadyHasToken = await PasswordResetToken.findOne({ owner: user._id });
  if (alreadyHasToken)
    return sendError(
      res,
      "Only after one hour you can request for another token!"
    );

  let OTP = generateOTP();

  const newPasswordResetToken = await PasswordResetToken({
    owner: user._id,
    token: OTP,
  });
  await newPasswordResetToken.save();

  // let publishTextPromise = generatePhoneTransporter(user.phone, OTP);
  // publishTextPromise
  //   .then(function (data) {
  //     res.end(JSON.stringify({ MessageID: data.MessageId }));
  //   })
  //   .catch(function (err) {
  //     res.end(JSON.stringify({ Error: err }));
  //   });

  res.json({
    id: user._id,
    message: "OTP has been sent to your phone.",
  });
};

exports.sendResetPasswordTokenStatus = (req, res) => {
  res.json({ valid: true });
};

exports.resetPassword = async (req, res) => {
  const { newPassword, userId } = req.body;

  const user = await User.findById(userId);
  const matched = await user.comparePassword(newPassword);
  if (matched)
    return sendError(
      res,
      "The new password must be different from the old one!"
    );

  user.password = newPassword;
  await user.save();

  await PasswordResetToken.findByIdAndDelete(req.resetToken._id);

  res.json({
    message: "Password reset successfully, now you can use new password.",
  });
};

exports.signIn = async (req, res) => {
  const { phone, password } = req.body;

  const user = await User.findOne({ phone });
  if (!user) return sendError(res, "Phone not exist");

  const matched = await user.comparePassword(password);
  if (!matched) return sendError(res, "Phone/Password mismatch!");

  const { _id, name, role, isVerified, avatar } = user;

  const jwtToken = jwt.sign({ userId: _id }, process.env.JWT_SECRET);

  res.json({
    id: _id,
    name,
    phone,
    role,
    token: jwtToken,
    isVerified,
    avatar,
  });
};
