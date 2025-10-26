import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import prisma from "../lib/prisma.js";
import logger from "../lib/logger.js";
import { generateToken, generateRefreshToken } from "../middleware/auth.js";

export const register = async (req, res) => {
  const { username, email, password, firstName, lastName } = req.body;
  
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email 
          ? "Email already registered" 
          : "Username already taken"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create new user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        verificationToken,
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isVerified: true,
        createdAt: true,
      }
    });

    // Generate tokens
    const token = generateToken({ id: user.id });
    const refreshToken = generateRefreshToken({ id: user.id });

    // Set HTTP-only cookies
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    logger.info(`New user registered: ${user.username} (${user.email})`);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user,
    });
  } catch (err) {
    logger.error("Registration error:", err);
    res.status(500).json({
      success: false,
      message: "Error creating the user"
    });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // Find user by username or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email: username }
        ]
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated"
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Generate tokens
    const token = generateToken({ id: user.id });
    const refreshToken = generateRefreshToken({ id: user.id });

    // Set HTTP-only cookies
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    // Update last login (you might want to add this field to your schema)
    await prisma.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() }
    });

    logger.info(`User logged in: ${user.username}`);

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        role: user.role,
        isVerified: user.isVerified,
      }
    });
  } catch (error) {
    logger.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login"
    });
  }
};

export const logout = (req, res) => {
  try {
    res.clearCookie("token");
    res.clearCookie("refreshToken");
    
    logger.info("User logged out");
    
    res.status(200).json({
      success: true,
      message: "Logout successful"
    });
  } catch (error) {
    logger.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Error during logout"
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not provided"
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, isActive: true }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token"
      });
    }

    const newToken = generateToken({ id: user.id });
    const newRefreshToken = generateRefreshToken({ id: user.id });

    res.cookie("token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully"
    });
  } catch (error) {
    logger.error("Token refresh error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid refresh token"
    });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires,
      }
    });

    // TODO: Send email with reset link
    logger.info(`Password reset requested for: ${email}`);

    res.status(200).json({
      success: true,
      message: "Password reset instructions sent to your email"
    });
  } catch (error) {
    logger.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Error processing password reset request"
    });
  }
};

export const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  
  try {
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      }
    });

    logger.info(`Password reset completed for user: ${user.username}`);

    res.status(200).json({
      success: true,
      message: "Password reset successfully"
    });
  } catch (error) {
    logger.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Error resetting password"
    });
  }
};
