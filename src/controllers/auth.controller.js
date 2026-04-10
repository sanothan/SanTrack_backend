const bcrypt = require("bcryptjs");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { generateToken } = require("../services/token.service");
const { verifyGoogleToken } = require("../services/googleAuth.service");

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

const ensureAccountIsActive = async (user) => {
  if (user.accountStatus !== "deactivated") return;

  if (user.scheduledDeletionAt && user.scheduledDeletionAt <= new Date()) {
    await User.findByIdAndDelete(user._id);
    throw new ApiError(401, "This account has been permanently deleted after the deactivation period.");
  }

  const deletionDate = user.scheduledDeletionAt
    ? new Date(user.scheduledDeletionAt).toLocaleDateString()
    : "in 1 year";

  throw new ApiError(403, `This account is deactivated and will be permanently deleted on ${deletionDate}.`);
};

// Register a new user with email and password
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

//Login user with email and password
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  await ensureAccountIsActive(user);

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
      phone: user.phone,
      address: user.address,
      bio: user.bio,
    },
  });
});

// Get currently authenticated user profile
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.status(200).json({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    address: user.address,
    bio: user.bio,
    accountStatus: user.accountStatus,
    scheduledDeletionAt: user.scheduledDeletionAt,
  });
});

// Verify current password for authenticated user
const verifyCurrentPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new ApiError(401, "Current password is incorrect");
  }

  res.status(200).json({ message: "Current password verified" });
});

// Update user profile (name, phone, address, bio) and optionally change password
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
    accountStatus: user.accountStatus,
    scheduledDeletionAt: user.scheduledDeletionAt,
  };

  res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
});

// Delete user account (requires password confirmation)
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

// Deactivate account for one year before permanent deletion
const deactivateAccount = asyncHandler(async (req, res) => {
  const { reason, password } = req.body;

  if (!reason) throw new ApiError(400, "Please select a reason for deactivation");

  const user = await User.findById(req.user.id);
  if (!user) throw new ApiError(404, "User not found");

  if (user.accountStatus === "deactivated") {
    throw new ApiError(400, "Account is already deactivated");
  }

  if (user.provider !== "google") {
    if (!password) throw new ApiError(400, "Password is required to deactivate your account");
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new ApiError(401, "Incorrect password");
  }

  const now = new Date();
  const scheduledDeletionAt = new Date(now.getTime() + ONE_YEAR_MS);

  user.accountStatus = "deactivated";
  user.deactivationReason = reason;
  user.deactivatedAt = now;
  user.scheduledDeletionAt = scheduledDeletionAt;
  await user.save();

  res.status(200).json({
    message: `Account is deactivated. It will be permanently deleted on ${scheduledDeletionAt.toLocaleDateString()}.`,
    scheduledDeletionAt,
  });
});

const googleLogin = asyncHandler(async (req, res) => {
  const { credential } = req.body;

  // Verify the Google ID token server-side — never trust raw frontend data
  const { googleId, email, name, picture } = await verifyGoogleToken(credential);

  // Find existing user by email
  let user = await User.findOne({ email: email.toLowerCase() });
  let isNewUser = false;

  if (!user) {
   
    user = await User.create({
      name,
      email: email.toLowerCase(),
      provider: "google",
      googleId,
      role: "community",
    });
    isNewUser = true;
  }

  await ensureAccountIsActive(user);

  const token = generateToken(user);

  res.status(200).json({
    message: isNewUser ? "Account created successfully" : "Login successful",
    token,
    isNewUser,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      bio: user.bio,
    },
  });
});

module.exports = {
  register,
  login,
  getProfile,
  verifyCurrentPassword,
  updateProfile,
  deleteAccount,
  deactivateAccount,
  googleLogin,
};
