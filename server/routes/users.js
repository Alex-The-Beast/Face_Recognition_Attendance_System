// // import express from "express"
// // import { body } from "express-validator"
// // import * as userController from "../controllers/userController.js"
// // import { authenticate, authorize, isOwnerOrAdmin } from "../middleware/auth.js"

// // const router = express.Router()

// // // Get all users (admin only)
// // router.get("/", authenticate, authorize("admin"), userController.getAllUsers)

// // // Get user by ID
// // router.get("/:id", authenticate, isOwnerOrAdmin, userController.getUserById)

// // // Create user (admin only)
// // router.post(
// //   "/",
// //   authenticate,
// //   authorize("admin"),
// //   [
// //     body("name").notEmpty().withMessage("Name is required"),
// //     body("email").isEmail().withMessage("Please enter a valid email"),
// //     body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
// //     body("role").isIn(["student", "teacher", "admin"]).withMessage("Invalid role"),
// //   ],
// //   userController.createUser,
// // )

// // // Update user
// // router.put(
// //   "/:id",
// //   authenticate,
// //   isOwnerOrAdmin,
// //   [
// //     body("name").optional(),
// //     body("email").optional().isEmail().withMessage("Please enter a valid email"),
// //     body("role").optional().isIn(["student", "teacher", "admin"]).withMessage("Invalid role"),
// //   ],
// //   userController.updateUser,
// // )

// // // Delete user (admin only)
// // router.delete("/:id", authenticate, authorize("admin"), userController.deleteUser)

// // // Change password
// // router.put(
// //   "/:id/change-password",
// //   authenticate,
// //   isOwnerOrAdmin,
// //   [
// //     body("currentPassword").notEmpty().withMessage("Current password is required"),
// //     body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters"),
// //   ],
// //   userController.changePassword,
// // )

// // export default router
// import express from "express"
// import { body } from "express-validator"
// import * as userController from "../controllers/userController.js"
// import { authenticate, authorize } from "../middleware/auth.js"

// const router = express.Router()

// // Get all users (admin only)
// router.get("/", authenticate, authorize("admin"), userController.getAllUsers)

// // Get user by ID
// router.get("/:id", authenticate, userController.getUserById)

// // Create user (admin only) - FIXED LINE
// router.post(
//   "/",
//   authenticate,
//   authorize("admin"),
//   [
//     body("name").notEmpty().withMessage("Name is required"),
//     body("email").isEmail().withMessage("Please enter a valid email"),
//     body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
//     body("role").isIn(["student", "teacher", "admin"]).withMessage("Invalid role"),
//   ],
//   userController.createUser,
// )
// // Update user
// router.put(
//   "/:id",
//   authenticate,
//   [
//     body("name").optional(),
//     body("email").optional().isEmail().withMessage("Please enter a valid email"),
//     body("role").optional().isIn(["student", "teacher", "admin"]).withMessage("Invalid role"),
//   ],
//   userController.updateUser,
// )

// // Delete user (admin only)
// router.delete("/:id", authenticate, authorize("admin"), userController.deleteUser)

// // Change password
// router.put(
//   "/:id/change-password",
//   authenticate,
//   [
//     body("currentPassword").notEmpty().withMessage("Current password is required"),
//     body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters"),
//   ],
//   userController.changePassword,
// )

// // Reset password (admin only)
// router.put("/:id/reset-password", authenticate, authorize("admin"), userController.resetPassword)

// // Get user profile
// router.get("/profile/me", authenticate, userController.getUserProfile)

// // Update user profile
// router.put("/profile/me", authenticate, userController.updateUserProfile)

// export default router


// // ... rest of the routes remain unchanged



import express from "express"
import { authenticate, authorize } from "../middleware/auth.js"
import * as userController from "../controllers/userController.js"

const router = express.Router()

// Get current user profile
router.get("/profile", authenticate, userController.getUserProfile)

// Update current user profile
router.put("/profile", authenticate, userController.updateUserProfile)

// Change password
router.post("/change-password", authenticate, userController.changePassword)

// Get all users (admin only)
router.get("/", authenticate, authorize("admin"), userController.getAllUsers)

// Get user by ID
router.get("/:id", authenticate, userController.getUserById)

// Create user (admin only)
router.post("/", authenticate, authorize("admin"), userController.createUser)

// Update user
router.put("/:id", authenticate, userController.updateUser)

// Delete user (admin only)
router.delete("/:id", authenticate, authorize("admin"), userController.deleteUser)

export default router
