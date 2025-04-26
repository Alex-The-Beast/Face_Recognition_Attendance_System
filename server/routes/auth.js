import express from "express"
import { body } from "express-validator"
import * as authController from "../controllers/authController.js"
import { authenticate } from "../middleware/auth.js"

const router = express.Router()

// Register user
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("role").isIn(["student", "teacher", "admin"]).withMessage("Invalid role"),
  ],
  authController.register,
)

// Login user
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  authController.login,
)

// Refresh token
router.post(
  "/refresh",
  [body("refreshToken").notEmpty().withMessage("Refresh token is required")],
  authController.refreshToken,
)

// Get user profile (protected)
router.get("/profile", authenticate, authController.getProfile)

// Update user profile (protected)
router.put(
  "/profile",
  authenticate,
  [body("name").optional(), body("email").optional().isEmail().withMessage("Please enter a valid email")],
  authController.updateProfile,
)

// Change password (protected)
router.put(
  "/change-password",
  authenticate,
  [
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters"),
  ],
  authController.changePassword,
)

export default router
