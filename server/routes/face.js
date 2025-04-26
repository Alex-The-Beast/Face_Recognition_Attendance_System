// // import express from "express"
// // import multer from "multer"
// // import { body } from "express-validator"
// // import * as faceController from "../controllers/faceController.js"
// // import { authenticate, authorize } from "../middleware/auth.js"

// // const router = express.Router()

// // // Configure multer for memory storage
// // const storage = multer.memoryStorage()
// // const upload = multer({
// //   storage,
// //   limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
// // })

// // // Register face
// // router.post(
// //   "/register",
// //   authenticate,
// //   [
// //     body("userId").notEmpty().withMessage("User ID is required"),
// //     body("image").notEmpty().withMessage("Image data is required"),
// //   ],
// //   faceController.registerFace,
// // )

// // // Verify face
// // router.post("/verify", [body("image").notEmpty().withMessage("Image data is required")], faceController.verifyFace)

// // // Check if user has registered face
// // router.get("/check/:userId", authenticate, faceController.checkFaceRegistration)

// // // Delete face data
// // router.delete("/delete/:userId", authenticate, faceController.deleteFaceData)

// // // Admin route to train the face recognition model
// // router.post("/train", authenticate, authorize("admin"), faceController.trainModel)

// // export default router



// import express from "express"
// import multer from "multer"
// import { body } from "express-validator"
// import * as faceController from "../controllers/faceController.js"
// import { authenticate, authorize } from "../middleware/auth.js"

// const router = express.Router()

// // Configure multer for memory storage
// const storage = multer.memoryStorage()
// const upload = multer({
//   storage,
//   limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
// })

// // Register face
// router.post(
//   "/register",
//   authenticate,
//   [
//     body("userId").notEmpty().withMessage("User ID is required"),
//     body("image").notEmpty().withMessage("Image data is required"),
//   ],
//   faceController.registerFace,
// )

// // Verify face
// router.post("/verify", [body("image").notEmpty().withMessage("Image data is required")], faceController.verifyFace)

// // Check if user has registered face
// router.get("/check/:userId", authenticate, faceController.checkFaceRegistration)

// // Delete face data
// router.delete("/delete/:userId", authenticate, faceController.deleteFaceData)

// // Admin route to train the face recognition model
// router.post("/train", authenticate, authorize("admin"), faceController.trainModel)

// // Get model statistics
// router.get("/model-stats", authenticate, authorize("admin"), faceController.getModelStats)

// // Upload profile photo
// router.post("/profile-photo/:userId", authenticate, faceController.uploadProfilePhoto)

// // Get attendance photos for a class and date
// router.get("/attendance-photos/:classId/:date", authenticate, faceController.getAttendancePhotos)

// // Check liveness
// router.post("/liveness", [body("image").notEmpty().withMessage("Image data is required")], faceController.checkLiveness)

// // Batch register faces
// router.post(
//   "/batch-register",
//   authenticate,
//   authorize("admin"),
//   upload.single("file"),
//   faceController.batchRegisterFaces,
// )

// export default router


import express from "express"
import multer from "multer"
import { body } from "express-validator"
import * as faceController from "../controllers/faceController.js"
import { authenticate, authorize } from "../middleware/auth.js"

const router = express.Router()

// Configure multer for memory storage
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
})

// Register face
router.post(
  "/register",
  authenticate,
  [
    body("userId").notEmpty().withMessage("User ID is required"),
    body("image").notEmpty().withMessage("Image data is required"),
  ],
  faceController.registerFace,
)

// Verify face
router.post(
  "/verify",
  authenticate,
  [
    body("image").notEmpty().withMessage("Image data is required"),
    body("classId").notEmpty().withMessage("Class ID is required"),
    body("date").notEmpty().withMessage("Date is required"),
    body("time").notEmpty().withMessage("Time is required"),
  ],
  faceController.verifyFace,
)

// Check if user has registered face
router.get("/check/:userId", authenticate, faceController.checkFaceRegistration)

// Delete face data
router.delete("/delete/:userId", authenticate, faceController.deleteFaceData)

// Admin route to train the face recognition model
router.post("/train", authenticate, authorize("admin"), faceController.trainModel)

// Upload profile photo
router.post("/profile-photo/:userId", authenticate, upload.single("profilePhoto"), faceController.uploadProfilePhoto)

// Get attendance photos for a class and date
router.get("/attendance-photos/:classId/:date", authenticate, faceController.getAttendancePhotos)

// Batch register faces
router.post(
  "/batch-register",
  authenticate,
  authorize("admin"),
  upload.single("file"),
  faceController.batchRegisterFaces,
)

export default router
