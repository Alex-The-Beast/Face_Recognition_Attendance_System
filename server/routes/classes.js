import express from "express"
import { body } from "express-validator"
import * as classController from "../controllers/classController.js"
import { authenticate, authorize, isTeacherOrAdmin } from "../middleware/auth.js"

const router = express.Router()

// Get all classes
router.get("/", authenticate, classController.getAllClasses)

// Get class by ID
router.get("/:id", authenticate, classController.getClassById)

// Create class (admin only)
router.post(
  "/",
  authenticate,
  authorize("admin"),
  [
    body("name").notEmpty().withMessage("Class name is required"),
    body("teacherId").notEmpty().withMessage("Teacher ID is required"),
    body("schedule.days").isArray().withMessage("Schedule days must be an array"),
    body("schedule.startTime").notEmpty().withMessage("Start time is required"),
    body("schedule.endTime").notEmpty().withMessage("End time is required"),
  ],
  classController.createClass,
)

// Update class (admin only)
router.put("/:id", authenticate, authorize("admin"), classController.updateClass)

// Delete class (admin only)
router.delete("/:id", authenticate, authorize("admin"), classController.deleteClass)

// Add student to class (admin or teacher)
router.post(
  "/:id/students",
  authenticate,
  isTeacherOrAdmin,
  [body("studentId").notEmpty().withMessage("Student ID is required")],
  classController.addStudentToClass,
)

// Remove student from class (admin or teacher)
router.delete("/:id/students/:studentId", authenticate, isTeacherOrAdmin, classController.removeStudentFromClass)

// Get students in class
router.get("/:id/students", authenticate, classController.getClassStudents)

export default router
