import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { validateId } from "../middleware/validation.js";
import {
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
  getUserNotifications,
  markNotificationAsRead,
  getAllUsers,
  updateUserRole,
  deactivateUser,
} from "../controllers/user.controller.js";

const router = express.Router();

// Public routes (none for users)

// Protected routes
router.use(authenticate);

// User profile routes
router.get("/profile", getUserProfile);
router.put("/profile", updateUserProfile);
router.delete("/account", deleteUserAccount);

// Notification routes
router.get("/notifications", getUserNotifications);
router.put("/notifications/:id/read", validateId, markNotificationAsRead);

// Admin routes
router.use(authorize('ADMIN'));

router.get("/", getAllUsers);
router.put("/:id/role", validateId, updateUserRole);
router.put("/:id/deactivate", validateId, deactivateUser);

export default router;