const jwt = require("jsonwebtoken");
const User = require("../models/user");
const PhoneVerificationToken = require("../models/phoneVerificationToken");
const PasswordResetToken = require("../models/passwordResetToken");
const RequestAddFriend = require("../models/requestAddFriend");
const {
  sendError,
  uploadImageToCloud,
  generateRandomByte,
  formatUser,
} = require("../utils/helper");
const { isValidObjectId } = require("mongoose");
const { generateOTP, generatePhoneTransporter } = require("../utils/phone");
const cloudinary = require("../cloud");

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
    "https://res.cloudinary.com/myshop-it/image/upload/v1669052876/nnldaw9n0z6ayopgjvy8.jpg";
  const public_id = "nnldaw9n0z6ayopgjvy8";

  newUser.avatar = { url, public_id };

  await newUser.save();

  let OTP = generateOTP();
  console.log(OTP);
  const newPhoneVerificationToken = await PhoneVerificationToken({
    owner: newUser._id,
    token: OTP,
  });

  await newPhoneVerificationToken.save();

  // generatePhoneTransporter(phone, OTP);

  res.status(201).json({
    user: {
      id: newUser._id,
      name: newUser.name,
      phone: newUser.phone,
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
      avatar: user.avatar,
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

  const newPhoneVerificationToken = await PhoneVerificationToken({
    owner: user._id,
    token: OTP,
  });

  await newPhoneVerificationToken.save();

  // generatePhoneTransporter(phone, OTP);

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
  console.log(OTP);

  const newPasswordResetToken = await PasswordResetToken({
    owner: user._id,
    token: OTP,
  });
  await newPasswordResetToken.save();

  // generatePhoneTransporter(phone, OTP);

  res.json({
    id: user._id,
    message: "OTP has been sent to your phone.",
  });
};

exports.sendResetPasswordTokenStatus = (req, res, next) => {
  res.json({ valid: true });
};

exports.changePassword = async (req, res) => {
  const { newPassword } = req.body;

  const user = await User.findById(req.user._id);
  const matched = await user.comparePassword(newPassword);
  if (matched)
    return sendError(
      res,
      "The new password must be different from the old one!"
    );

  user.password = newPassword;
  await user.save();

  res.json({
    message: "Password is changed successfully, now you can use new password.",
  });
};

exports.resetPassword = async (req, res) => {
  const { newPassword, userId } = req.body;

  if (!isValidObjectId(userId)) return sendError(res, "Invalid user");

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

exports.deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.user._id);

  res.json({ message: "Account is deleted" });
};

exports.uploadImageUser = async (req, res) => {
  const { file } = req;
  const user = await User.findById(req.user._id);
  const public_id = user.avatar?.public_id;

  if (public_id && file) {
    const { result } = await cloudinary.uploader.destroy(public_id);
    if (result !== "ok") {
      return sendError(res, "Could not remove image from cloud!");
    }
  }

  if (file) {
    const { url, public_id } = await uploadImageToCloud(file.path);
    user.avatar = { url, public_id };
  }

  await user.save();
  res.status(201).json({ user: formatUser(user) });
};

exports.signIn = async (req, res) => {
  const { phone, password } = req.body;

  const user = await User.findOne({ phone });
  if (!user) return sendError(res, "Phone not exist");

  const matched = await user.comparePassword(password);
  if (!matched) return sendError(res, "Phone/Password mismatch!");

  const { _id, name, isVerified, avatar } = user;

  const jwtToken = jwt.sign({ userId: _id }, process.env.JWT_SECRET);

  res.json({
    id: _id,
    name,
    phone,
    token: jwtToken,
    isVerified,
    avatar,
  });
};

exports.searchUser = async (req, res) => {
  const { name } = req.body;

  if (!name.trim()) return sendError(res, "Not found name");

  const result = await User.find({
    name: { $regex: name, $options: "i" },
  });

  const users = result.map((user) => formatUser(user));
  res.json({ results: users });
};

exports.addFriend = async (req, res) => {
  const { userId } = req.body;

  const requestAddFriend = await RequestAddFriend({
    owner: req.user,
    receiver: userId,
  });
  await requestAddFriend.save();

  res.json(requestAddFriend);
};

exports.getAllRequestAddFriend = async (req, res) => {
  const request = await RequestAddFriend.find({
    receiver: req.user._id,
  });

  res.json(request);
};

exports.answerRequestAddFriend = async (req, res) => {
  const { answer, requestId } = req.body;
  const user = await User.findById(req.user._id);
  const request = await RequestAddFriend.findById({
    _id: requestId,
    receiver: req.user._id,
  });

  if (answer === "yes") {
    user.friends.push(request.owner);
    await user.save();
    await request.delete();
  } else {
    await request.delete();
  }

  res.json({ message: "Answered request" });
};
