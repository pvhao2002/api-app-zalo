const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { sendError, uploadImageToCloud } = require("../utils/helper");
const { isValidObjectId } = require("mongoose");

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

  res.status(201).json({
    user: {
      id: newUser._id,
      name: newUser.name,
      phone: newUser.phone,
      avatar: newUser.avatar?.url,
    },
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

  // res.json(
  //   JSON.stringify({
  //     id: _id,
  //     name,
  //     email,
  //     role,
  //     token: jwtToken,
  //     isVerified,
  //   })
  // );
  // res.json({
  //   user: { id: _id, name, email, role, token: jwtToken, isVerified },
  // });

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
