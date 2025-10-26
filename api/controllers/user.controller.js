import bcrypt from "bcrypt";
import prisma from "../lib/prisma.js";
import logger from "../lib/logger.js";

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        phone: true,
        role: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            properties: true,
            savedProperties: true,
            reviews: true,
            messages: true,
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error("Get user profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user profile"
    });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, phone, avatar } = req.body;

    // Don't allow updating sensitive fields
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (avatar !== undefined) updateData.avatar = avatar;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        phone: true,
        role: true,
        isVerified: true,
        updatedAt: true,
      }
    });

    logger.info(`User profile updated: ${updatedUser.username}`);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser
    });
  } catch (error) {
    logger.error("Update user profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating profile"
    });
  }
};

export const deleteUserAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user info for logging
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true, email: true }
    });

    // Delete user and all related data (cascade delete)
    await prisma.user.delete({
      where: { id: userId }
    });

    logger.info(`User account deleted: ${user.username} (${user.email})`);

    res.status(200).json({
      success: true,
      message: "Account deleted successfully"
    });
  } catch (error) {
    logger.error("Delete user account error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting account"
    });
  }
};

export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      userId,
      ...(unreadOnly === 'true' && { isRead: false })
    };

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.notification.count({ where })
    ]);

    res.status(200).json({
      success: true,
      data: {
        notifications,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit),
        }
      }
    });
  } catch (error) {
    logger.error("Get user notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching notifications"
    });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });

    res.status(200).json({
      success: true,
      message: "Notification marked as read"
    });
  } catch (error) {
    logger.error("Mark notification as read error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating notification"
    });
  }
};

// Admin functions
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(role && { role }),
      ...(search && {
        OR: [
          { username: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
        ]
      })
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true,
          avatar: true,
          phone: true,
          role: true,
          isActive: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              properties: true,
              savedProperties: true,
              reviews: true,
              messages: true,
            }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit),
        }
      }
    });
  } catch (error) {
    logger.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users"
    });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['USER', 'AGENT', 'ADMIN'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role"
      });
    }

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        updatedAt: true,
      }
    });

    logger.info(`User role updated: ${updatedUser.username} -> ${role} by ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      data: updatedUser
    });
  } catch (error) {
    logger.error("Update user role error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating user role"
    });
  }
};

export const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Cannot deactivate your own account"
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        updatedAt: true,
      }
    });

    logger.info(`User deactivated: ${updatedUser.username} by ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: "User deactivated successfully",
      data: updatedUser
    });
  } catch (error) {
    logger.error("Deactivate user error:", error);
    res.status(500).json({
      success: false,
      message: "Error deactivating user"
    });
  }
};
