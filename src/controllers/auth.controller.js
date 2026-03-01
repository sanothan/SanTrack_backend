const bcrypt = require("bcryptjs");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { generateToken } = require("../services/token.service");

const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(400, "Email already in use");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role: "community",
    phone,
  });

  res.status(201).json({
    message: "User registered successfully",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const token = generateToken(user);

  res.status(200).json({
    message: "Login successful",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, address, bio, currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) throw new ApiError(404, "User not found");

  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (address !== undefined) user.address = address;
  if (bio !== undefined) user.bio = bio;

  if (newPassword) {
    if (!currentPassword) throw new ApiError(400, "Current password is required to set a new password");
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) throw new ApiError(401, "Current password is incorrect");
    user.password = await bcrypt.hash(newPassword, 10);
  }

  await user.save();

  const updatedUser = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    address: user.address,
    bio: user.bio,
  };

  res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
});

const deleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;
  if (!password) throw new ApiError(400, "Password is required to delete your account");

  const user = await User.findById(req.user.id);
  if (!user) throw new ApiError(404, "User not found");

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) throw new ApiError(401, "Incorrect password");

  await User.findByIdAndDelete(req.user.id);
  res.status(200).json({ message: "Account deleted successfully" });
});

module.exports = {
  register,
  login,
  updateProfile,
  deleteAccount,
};
