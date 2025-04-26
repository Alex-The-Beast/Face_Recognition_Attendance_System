import express from "express"
import { body } from "express-validator"
import * as attendanceController from "../controllers/attendanceController.js"
import { authenticate, authorize } from "../middleware/auth.js"

const router = express.Router()

// Mark attendance (teacher only)
router.post(
  "/mark",
  authenticate,
  authorize("teacher", "admin"),
  [
    body("classId").notEmpty().withMessage("Class ID is required"),
    body("date").notEmpty().withMessage("Date is required"),
    body("studentIds").isArray().withMessage("Student IDs must be an array"),
  ],
  attendanceController.markAttendance,
)

// Get student's attendance records
router.get("/my", authenticate, attendanceController.getMyAttendance)

// Get class attendance records (teacher only)
router.get("/class/:classId", authenticate, authorize("teacher", "admin"), attendanceController.getClassAttendance)

// Export attendance as CSV
router.get("/export", authenticate, authorize("teacher", "admin"), attendanceController.exportAttendance)

// Get attendance statistics
router.get("/stats", authenticate, attendanceController.getAttendanceStats)

// Generate attendance report
router.get("/report", authenticate, authorize("teacher", "admin"), attendanceController.generateReport)

// Export attendance report as CSV
router.get("/report/export", authenticate, authorize("teacher", "admin"), attendanceController.exportReport)

export default router
