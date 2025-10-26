import express from "express";
import { 
  login, 
  logout, 
  register, 
  refreshToken, 
  forgotPassword, 
  resetPassword 
} from "../controllers/auth.controller.js";
import { 
  validateUserRegistration, 
  validateUserLogin 
} from "../middleware/validation.js";

const router = express.Router();

// Public routes
router.post("/register", validateUserRegistration, register);
router.post("/login", validateUserLogin, login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
