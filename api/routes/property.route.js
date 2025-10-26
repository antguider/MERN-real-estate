import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { validateProperty, validateSearch, validateId } from "../middleware/validation.js";
import {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  searchProperties,
  getFeaturedProperties,
  getUserProperties,
  saveProperty,
  unsaveProperty,
  getSavedProperties,
} from "../controllers/property.controller.js";

const router = express.Router();

// Public routes
router.get("/", validateSearch, searchProperties);
router.get("/featured", getFeaturedProperties);
router.get("/:id", validateId, getPropertyById);

// Protected routes
router.use(authenticate);

router.post("/", validateProperty, createProperty);
router.put("/:id", validateId, validateProperty, updateProperty);
router.delete("/:id", validateId, deleteProperty);

// User-specific routes
router.get("/user/my-properties", getUserProperties);
router.post("/:id/save", validateId, saveProperty);
router.delete("/:id/unsave", validateId, unsaveProperty);
router.get("/user/saved", getSavedProperties);

export default router;
