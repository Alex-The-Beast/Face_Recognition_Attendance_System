// import User from "../models/User.js"
// import axios from "axios"
// import { fileURLToPath } from "url"
// import { dirname } from "path"

// // Get the directory name
// const __filename = fileURLToPath(import.meta.url)
// const __dirname = dirname(__filename)

// // Python face recognition service URL
// const FACE_SERVICE_URL = process.env.FACE_SERVICE_URL || "http://localhost:5001"

// // Register face
// export const registerFace = async (req, res) => {
//   try {
//     const { userId, image } = req.body

//     // Check if user exists
//     const user = await User.findById(userId)
//     if (!user) {
//       return res.status(404).json({ message: "User not found" })
//     }

//     // Check if the requesting user is the same as the target user or an admin
//     if (req.user.id !== userId && req.user.role !== "admin") {
//       return res.status(403).json({ message: "Not authorized to register face for this user" })
//     }

//     // Send image to Python service for face registration
//     const response = await axios.post(`${FACE_SERVICE_URL}/register`, {
//       user_id: userId,
//       name: user.name,
//       image_data: image,
//     })

//     // Update user in database with face data flag
//     user.faceData = true
//     await user.save()

//     res.status(200).json({
//       success: true,
//       message: "Face registered successfully",
//     })
//   } catch (error) {
//     console.error("Face registration error:", error)

//     // Handle specific errors from Python service
//     if (error.response) {
//       return res.status(error.response.status).json({
//         message: error.response.data.message || "Face registration failed",
//       })
//     }

//     res.status(500).json({ message: "Server error", error: error.message })
//   }
// }

// // Verify face
// export const verifyFace = async (req, res) => {
//   try {
//     const { image, classId, date, time } = req.body

//     // Send image to Python service for face verification
//     const response = await axios.post(`${FACE_SERVICE_URL}/verify`, {
//       image_data: image,
//       class_id: classId,
//       date,
//       time,
//     })

//     // Return verification results
//     res.status(200).json({
//       success: true,
//       recognizedStudents: response.data.recognized_students || [],
//       emotionData: response.data.emotion_data || null,
//       attentionData: response.data.attention_data || null,
//       message: "Face verification completed",
//     })
//   } catch (error) {
//     console.error("Face verification error:", error)

//     // Handle specific errors from Python service
//     if (error.response) {
//       return res.status(error.response.status).json({
//         message: error.response.data.message || "Face verification failed",
//       })
//     }

//     res.status(500).json({ message: "Server error", error: error.message })
//   }
// }

// // Check if user has registered face
// export const checkFaceRegistration = async (req, res) => {
//   try {
//     const { userId } = req.params

//     // Check if user exists
//     const user = await User.findById(userId)
//     if (!user) {
//       return res.status(404).json({ message: "User not found" })
//     }

//     // Check if the requesting user is the same as the target user or an admin
//     if (req.user.id !== userId && req.user.role !== "admin") {
//       return res.status(403).json({ message: "Not authorized to check face registration for this user" })
//     }

//     res.status(200).json({
//       success: true,
//       hasFaceData: !!user.faceData,
//     })
//   } catch (error) {
//     console.error("Check face registration error:", error)
//     res.status(500).json({ message: "Server error", error: error.message })
//   }
// }

// // Delete face data
// export const deleteFaceData = async (req, res) => {
//   try {
//     const { userId } = req.params

//     // Check if user exists
//     const user = await User.findById(userId)
//     if (!user) {
//       return res.status(404).json({ message: "User not found" })
//     }

//     // Check if the requesting user is the same as the target user or an admin
//     if (req.user.id !== userId && req.user.role !== "admin") {
//       return res.status(403).json({ message: "Not authorized to delete face data for this user" })
//     }

//     // Send request to Python service to delete face data
//     const response = await axios.delete(`${FACE_SERVICE_URL}/delete/${userId}`)

//     // Update user in database
//     user.faceData = false
//     await user.save()

//     res.status(200).json({
//       success: true,
//       message: "Face data deleted successfully",
//     })
//   } catch (error) {
//     console.error("Delete face data error:", error)

//     // Handle specific errors from Python service
//     if (error.response) {
//       return res.status(error.response.status).json({
//         message: error.response.data.message || "Failed to delete face data",
//       })
//     }

//     res.status(500).json({ message: "Server error", error: error.message })
//   }
// }

// // Train face recognition model (admin only)
// export const trainModel = async (req, res) => {
//   try {
//     // Send request to Python service to train the model
//     const response = await axios.post(`${FACE_SERVICE_URL}/train`)

//     res.status(200).json({
//       success: true,
//       message: "Face recognition model trained successfully",
//     })
//   } catch (error) {
//     console.error("Train model error:", error)

//     // Handle specific errors from Python service
//     if (error.response) {
//       return res.status(error.response.status).json({
//         message: error.response.data.message || "Failed to train model",
//       })
//     }

//     res.status(500).json({ message: "Server error", error: error.message })
//   }
// }


// import User from "../models/User.js"
// import Attendance from "../models/Attendance.js"
// import axios from "axios"
// import fs from "fs"
// import path from "path"
// import { fileURLToPath } from "url"
// import { dirname } from "path"
// import multer from "multer"
// import { v4 as uuidv4 } from "uuid"

// // Get the directory name
// const __filename = fileURLToPath(import.meta.url)
// const __dirname = dirname(__filename)

// // Create uploads directory if it doesn't exist
// const uploadsDir = path.join(__dirname, "../uploads")
// const profilePhotosDir = path.join(uploadsDir, "profile-photos")
// const attendancePhotosDir = path.join(uploadsDir, "attendance-photos")

// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir, { recursive: true })
// }
// if (!fs.existsSync(profilePhotosDir)) {
//   fs.mkdirSync(profilePhotosDir, { recursive: true })
// }
// if (!fs.existsSync(attendancePhotosDir)) {
//   fs.mkdirSync(attendancePhotosDir, { recursive: true })
// }

// // Configure storage for profile photos
// const profilePhotoStorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, profilePhotosDir)
//   },
//   filename: function (req, file, cb) {
//     const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`
//     cb(null, uniqueFilename)
//   },
// })

// export const profilePhotoUpload = multer({
//   storage: profilePhotoStorage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype.startsWith("image/")) {
//       cb(null, true)
//     } else {
//       cb(new Error("Only image files are allowed"), false)
//     }
//   },
// }).single("profilePhoto")

// // Python face recognition service URL
// const FACE_SERVICE_URL = process.env.FACE_SERVICE_URL || "http://localhost:5001"

// // Register face
// export const registerFace = async (req, res) => {
//   try {
//     const { userId, image } = req.body

//     // Check if user exists
//     const user = await User.findById(userId)
//     if (!user) {
//       return res.status(404).json({ message: "User not found" })
//     }

//     // Check if the requesting user is the same as the target user or an admin
//     if (req.user.id !== userId && req.user.role !== "admin") {
//       return res.status(403).json({ message: "Not authorized to register face for this user" })
//     }

//     // Send image to Python service for face registration
//     const response = await axios.post(`${FACE_SERVICE_URL}/register`, {
//       user_id: userId,
//       name: user.name,
//       image_data: image,
//     })

//     // Update user in database with face data flag
//     user.faceData = true
//     await user.save()

//     res.status(200).json({
//       success: true,
//       message: "Face registered successfully",
//     })
//   } catch (error) {
//     console.error("Face registration error:", error)

//     // Handle specific errors from Python service
//     if (error.response) {
//       return res.status(error.response.status).json({
//         message: error.response.data.message || "Face registration failed",
//       })
//     }

//     res.status(500).json({ message: "Server error", error: error.message })
//   }
// }

// // Verify face
// export const verifyFace = async (req, res) => {
//   try {
//     const { image, classId, date, time } = req.body

//     // Send image to Python service for face verification
//     const response = await axios.post(`${FACE_SERVICE_URL}/verify`, {
//       image_data: image,
//       class_id: classId,
//       date,
//       time,
//     })

//     // Save the attendance photo URL for each recognized student
//     if (response.data.recognized_students && response.data.recognized_students.length > 0) {
//       // Create directory for class attendance photos if it doesn't exist
//       const classAttendanceDir = path.join(attendancePhotosDir, classId, date)
//       if (!fs.existsSync(classAttendanceDir)) {
//         fs.mkdirSync(classAttendanceDir, { recursive: true })
//       }

//       // Save the image
//       const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
//       const photoFilename = `attendance_${timestamp}.jpg`
//       const photoPath = path.join(classAttendanceDir, photoFilename)
      
//       // Convert base64 to image and save
//       const base64Data = image.replace(/^data:image\/\w+;base64,/, "")
//       fs.writeFileSync(photoPath, Buffer.from(base64Data, "base64"))
      
//       // Create relative URL for the photo
//       const photoUrl = `/uploads/attendance-photos/${classId}/${date}/${photoFilename}`
      
//       // Update attendance records with photo URL
//       for (const studentId of response.data.recognized_students) {
//         await Attendance.findOneAndUpdate(
//           { studentId, classId, date },
//           { 
//             photoUrl,
//             emotion: response.data.emotion_data?.[studentId] || null,
//             attention: response.data.attention_data?.[studentId] || null
//           },
//           { new: true }
//         )
//       }
//     }

//     // Return verification results
//     res.status(200).json({
//       success: true,
//       recognizedStudents: response.data.recognized_students || [],
//       emotionData: response.data.emotion_data || null,
//       attentionData: response.data.attention_data || null,
//       message: "Face verification completed",
//     })
//   } catch (error) {
//     console.error("Face verification error:", error)

//     // Handle specific errors from Python service
//     if (error.response) {
//       return res.status(error.response.status).json({
//         message: error.response.data.message || "Face verification failed",
//       })
//     }

//     res.status(500).json({ message: "Server error", error: error.message })
//   }
// }

// // Check if user has registered face
// export const checkFaceRegistration = async (req, res) => {
//   try {
//     const { userId } = req.params

//     // Check if user exists
//     const user = await User.findById(userId)
//     if (!user) {
//       return res.status(404).json({ message: "User not found" })
//     }

//     // Check if the requesting user is the same as the target user or an admin
//     if (req.user.id !== userId && req.user.role !== "admin") {
//       return res.status(403).json({ message: "Not authorized to check face registration for this user" })
//     }

//     res.status(200).json({
//       success: true,
//       hasFaceData: !!user.faceData,
//       userName: user.name
//     })
//   } catch (error) {
//     console.error("Check face registration error:", error)
//     res.status(500).json({ message: "Server error", error: error.message })
//   }
// }

// // Delete face data
// export const deleteFaceData = async (req, res) => {
//   try {
//     const { userId } = req.params

//     // Check if user exists
//     const user = await User.findById(userId)
//     if (!user) {
//       return res.status(404).json({ message: "User not found" })
//     }

//     // Check if the requesting user is the same as the target user or an admin
//     if (req.user.id !== userId && req.user.role !== "admin") {
//       return res.status(403).json({ message: "Not authorized to delete face data for this user" })
//     }

//     // Send request to Python service to delete face data
//     const response = await axios.delete(`${FACE_SERVICE_URL}/delete/${userId}`)

//     // Update user in database
//     user.faceData = false
//     await user.save()

//     res.status(200).json({
//       success: true,
//       message: "Face data deleted successfully",
//     })
//   } catch (error) {
//     console.error("Delete face data error:", error)

//     // Handle specific errors from Python service
//     if (error.response) {
//       return res.status(error.response.status).json({
//         message: error.response.data.message || "Failed to delete face data",
//       })
//     }

//     res.status(500).json({ message: "Server error", error: error.message })
//   }
// }

// // Train face recognition model (admin only)
// export const trainModel = async (req, res) => {
//   try {
//     // Send request to Python service to train the model
//     const response = await axios.post(`${FACE_SERVICE_URL}/train`)

//     res.status(200).json({
//       success: true,
//       message: "Face recognition model trained successfully",
//       modelVersion: response.data.model_version,
//       numFaces: response.data.num_faces
//     })
//   } catch (error) {
//     console.error("Train model error:", error)

//     // Handle specific errors from Python service
//     if (error.response) {
//       return res.status(error.response.status).json({
//         message: error.response.data.message || "Failed to train model",
//       })
//     }

//     res.status(500).json({ message: "Server error", error: error.message })
//   }
// }

// // Get model statistics
// export const getModelStats = async (req, res) => {
//   try {
//     // Send request to Python service to get model stats
//     const response = await axios.get(`${FACE_SERVICE_URL}/model-stats`)

//     res.status(200).json({
//       success: true,
//       stats: response.data
//     })
//   } catch (error) {
//     console.error("Get model stats error:", error)

//     // Handle specific errors from Python service
//     if (error.response) {
//       return res.status(error.response.status).json({
//         message: error.response.data.message || "Failed to get model stats",
//       })
//     }

//     res.status(500).json({ message: "Server error", error: error.message })
//   }
// }

// // Upload profile photo
// export const uploadProfilePhoto = async (req, res) => {
//   try {
//     profilePhotoUpload(req, res, async function(err) {
//       if (err) {
//         return res.status(400).json({ message: err.message })
//       }

//       if (!req.file) {
//         return res.status(400).json({ message: "No file uploaded" })
//       }

//       const userId = req.params.userId

//       // Check if user exists
//       const user = await User.findById(userId)
//       if (!user) {
//         return res.status(404).json({ message: "User not found" })
//       }

//       // Check if the requesting user is the same as the target user or an admin
//       if (req.user.id !== userId && req.user.role !== "admin") {
//         return res.status(403).json({ message: "Not authorized to upload profile photo for this user" })
//       }

//       // Delete old profile photo if exists
//       if (user.profilePhoto) {
//         const oldPhotoPath = path.join(__dirname, "..", user.profilePhoto)
//         if (fs.existsSync(oldPhotoPath)) {
//           fs.unlinkSync(oldPhotoPath)
//         }
//       }

//       // Update user with new profile photo
//       const profilePhotoUrl = `/uploads/profile-photos/${req.file.filename}`
//       user.profilePhoto = profilePhotoUrl
//       await user.save()

//       res.status(200).json({
//         success: true,
//         message: "Profile photo uploaded successfully",
//         profilePhotoUrl
//       })
//     })
//   } catch (error) {
//     console.error("Upload profile photo error:", error)
//     res.status(500).json({ message: "Server error", error: error.message })
//   }
// }

// // Get attendance photos
// export const getAttendancePhotos = async (req, res) => {
//   try {
//     const { classId, date } = req.params

//     // Check if directory exists
//     const classAttendanceDir = path.join(attendancePhotosDir, classId, date)
//     if (!fs.existsSync(classAttendanceDir)) {
//       return res.status(200).json({
//         success: true,
//         photos: []
//       })
//     }

//     // Get attendance records for the class and date
//     const attendanceRecords = await Attendance.find({ 
//       classId, 
//       date,
//       photoUrl: { $ne: null } 
//     }).populate("studentId", "name email profilePhoto")

//     // Map records to include photo URLs
//     const photos = attendanceRecords.map(record => ({
//       id: record._id,
//       studentId: record.studentId._id,
//       studentName: record.studentId.name,
//       studentEmail: record.studentId.email,
//       studentPhoto: record.studentId.profilePhoto,
//       photoUrl: record.photoUrl,
//       time: record.time,
//       emotion: record.emotion,
//       attention: record.attention
//     }))

//     res.status(200).json({
//       success: true,
//       photos
//     })
//   } catch (error) {
//     console.error("Get attendance photos error:", error)
//     res.status(500).json({ message: "Server error", error: error.message })
//   }
// }

// // Check liveness
// export const checkLiveness = async (req, res) => {
//   try {
//     const { image } = req.body

//     // Send image to Python service for liveness check
//     const response = await axios.post(`${FACE_SERVICE_URL}/liveness`, {
//       image_data: image
//     })

//     res.status(200).json({
//       success: true,
//       isLive: response.data.is_live,
//       livenessScore: response.data.liveness_score,
//       threshold: response.data.threshold
//     })
//   } catch (error) {
//     console.error("Liveness check error:", error)

//     // Handle specific errors from Python service
//     if (error.response) {
//       return res.status(error.response.status).json({
//         message: error.response.data.message || "Liveness check failed",
//       })
//     }

//     res.status(500).json({ message: "Server error", error: error.message })
//   }
// }

// // Batch register faces
// export const batchRegisterFaces = async (req, res) => {
//   try {
//     // Check if user is admin
//     if (req.user.role !== "admin") {
//       return res.status(403).json({ message: "Not authorized to batch register faces" })
//     }

//     const { file } = req

//     if (!file) {
//       return res.status(400).json({ message: "No file uploaded" })
//     }

//     // Send file to Python service for batch registration
//     const formData = new FormData()
//     formData.append("file", new Blob([file.buffer]), file.originalname)

//     const response = await axios.post(`${FACE_SERVICE_URL}/batch-register`, formData, {
//       headers: {
//         "Content-Type": "multipart/form-data"
//       }
//     })

//     // Update users in database
//     for (const userId of response.data.registered_users) {
//       await User.findByIdAndUpdate(userId, { faceData: true })
//     }

//     res.status(200).json({
//       success: true,
//       message: "Batch registration completed",
//       registeredUsers: response.data.registered_users,
//       failedUsers: response.data.failed_users
//     })
//   } catch (error) {
//     console.error("Batch register faces error:", error)

//     // Handle specific errors from Python service
//     if (error.response) {
//       return res.status(error.response.status).json({
//         message: error.response.data.message || "Batch registration failed",
//       })
//     }

//     res.status(500).json({ message: "Server error", error: error.message })
//   }
// }


import User from "../models/User.js"
import Attendance from "../models/Attendance.js"
import Class from "../models/Class.js"
import axios from "axios"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { dirname } from "path"
import multer from "multer"
import { v4 as uuidv4 } from "uuid"

// Get the directory name
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../uploads")
const profilePhotosDir = path.join(uploadsDir, "profile-photos")
const attendancePhotosDir = path.join(uploadsDir, "attendance-photos")

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}
if (!fs.existsSync(profilePhotosDir)) {
  fs.mkdirSync(profilePhotosDir, { recursive: true })
}
if (!fs.existsSync(attendancePhotosDir)) {
  fs.mkdirSync(attendancePhotosDir, { recursive: true })
}

// Configure storage for profile photos
const profilePhotoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profilePhotosDir)
  },
  filename: (req, file, cb) => {
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`
    cb(null, uniqueFilename)
  },
})

export const profilePhotoUpload = multer({
  storage: profilePhotoStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true)
    } else {
      cb(new Error("Only image files are allowed"), false)
    }
  },
}).single("profilePhoto")

// Python face recognition service URL
const FACE_SERVICE_URL = process.env.FACE_SERVICE_URL || "http://localhost:5001"

// Register face
export const registerFace = async (req, res) => {
  try {
    const { userId, image } = req.body

    // Check if user exists
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Check if the requesting user is the same as the target user or an admin
    if (req.user.id !== userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to register face for this user" })
    }

    // Send image to Python service for face registration
    const response = await axios.post(`${FACE_SERVICE_URL}/register`, {
      user_id: userId,
      name: user.name,
      image_data: image,
    })

    // Update user in database with face data flag and profile photo
    user.faceData = true
    if (response.data.profile_photo) {
      user.profilePhoto = response.data.profile_photo
    }
    await user.save()

    res.status(200).json({
      success: true,
      message: "Face registered successfully",
      profilePhoto: user.profilePhoto,
    })
  } catch (error) {
    console.error("Face registration error:", error)

    // Handle specific errors from Python service
    if (error.response) {
      return res.status(error.response.status).json({
        message: error.response.data.message || "Face registration failed",
      })
    }

    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Verify face
export const verifyFace = async (req, res) => {
  try {
    const { image, classId, date, time } = req.body

    // Validate class ID
    if (!classId) {
      return res.status(400).json({ message: "Class ID is required" })
    }

    // Check if class exists
    const classObj = await Class.findById(classId)
    if (!classObj) {
      return res.status(404).json({ message: "Class not found" })
    }

    // Send image to Python service for face verification
    const response = await axios.post(`${FACE_SERVICE_URL}/verify`, {
      image_data: image,
      class_id: classId,
      date,
      time,
    })

    // If verification successful, mark attendance for recognized students
    if (response.data.success && response.data.recognized_students.length > 0) {
      const recognizedStudents = response.data.recognized_students
      const emotionData = response.data.emotion_data || {}
      const attentionData = response.data.attention_data || {}
      const photoUrl = response.data.photo_url

      // Mark attendance for each recognized student
      const attendancePromises = recognizedStudents.map(async (studentId) => {
        try {
          // Check if student exists
          const student = await User.findById(studentId)
          if (!student) {
            return { studentId, error: "Student not found" }
          }

          // Check if student is enrolled in the class
          if (student.classId && student.classId.toString() !== classId) {
            return { studentId, error: "Student not enrolled in this class" }
          }

          // Create or update attendance record
          const attendance = await Attendance.findOneAndUpdate(
            { studentId, classId, date },
            {
              time,
              status: "present",
              verifiedBy: req.user ? req.user.id : null,
              verificationMethod: "face",
              photoUrl,
              emotion: emotionData[studentId] || null,
              attention: attentionData[studentId] || null,
            },
            { upsert: true, new: true },
          )

          // Update student's attendance stats
          await User.findByIdAndUpdate(studentId, {
            $inc: {
              "attendanceStats.present": 1,
              "attendanceStats.total": 1,
            },
          })

          return { studentId, attendance }
        } catch (err) {
          console.error(`Error marking attendance for student ${studentId}:`, err)
          return { studentId, error: err.message }
        }
      })

      const attendanceResults = await Promise.all(attendancePromises)

      // Return verification results with attendance details
      res.status(200).json({
        success: true,
        recognizedStudents,
        emotionData,
        attentionData,
        photoUrl,
        attendanceResults,
        message: "Face verification and attendance marking completed",
      })
    } else {
      // Return verification results without marking attendance
      res.status(200).json({
        success: true,
        recognizedStudents: response.data.recognized_students || [],
        emotionData: response.data.emotion_data || {},
        attentionData: response.data.attention_data || {},
        photoUrl: response.data.photo_url,
        message: "Face verification completed, no students recognized",
      })
    }
  } catch (error) {
    console.error("Face verification error:", error)

    // Handle specific errors from Python service
    if (error.response) {
      return res.status(error.response.status).json({
        message: error.response.data.message || "Face verification failed",
      })
    }

    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Check if user has registered face
export const checkFaceRegistration = async (req, res) => {
  try {
    const { userId } = req.params

    // Check if user exists
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Check if the requesting user is the same as the target user or an admin
    if (req.user.id !== userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to check face registration for this user" })
    }

    res.status(200).json({
      success: true,
      hasFaceData: !!user.faceData,
      profilePhoto: user.profilePhoto,
      userName: user.name,
    })
  } catch (error) {
    console.error("Check face registration error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Delete face data
export const deleteFaceData = async (req, res) => {
  try {
    const { userId } = req.params

    // Check if user exists
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Check if the requesting user is the same as the target user or an admin
    if (req.user.id !== userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete face data for this user" })
    }

    // Send request to Python service to delete face data
    const response = await axios.delete(`${FACE_SERVICE_URL}/delete/${userId}`)

    // Update user in database
    user.faceData = false
    await user.save()

    res.status(200).json({
      success: true,
      message: "Face data deleted successfully",
    })
  } catch (error) {
    console.error("Delete face data error:", error)

    // Handle specific errors from Python service
    if (error.response) {
      return res.status(error.response.status).json({
        message: error.response.data.message || "Failed to delete face data",
      })
    }

    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Train face recognition model (admin only)
export const trainModel = async (req, res) => {
  try {
    // Send request to Python service to train the model
    const response = await axios.post(`${FACE_SERVICE_URL}/train`)

    res.status(200).json({
      success: true,
      message: "Face recognition model trained successfully",
      modelVersion: response.data.model_version,
      numFaces: response.data.num_faces,
    })
  } catch (error) {
    console.error("Train model error:", error)

    // Handle specific errors from Python service
    if (error.response) {
      return res.status(error.response.status).json({
        message: error.response.data.message || "Failed to train model",
      })
    }

    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Upload profile photo
export const uploadProfilePhoto = async (req, res) => {
  try {
    profilePhotoUpload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message })
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" })
      }

      const userId = req.params.userId

      // Check if user exists
      const user = await User.findById(userId)
      if (!user) {
        return res.status(404).json({ message: "User not found" })
      }

      // Check if the requesting user is the same as the target user or an admin
      if (req.user.id !== userId && req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to upload profile photo for this user" })
      }

      // Delete old profile photo if exists
      if (user.profilePhoto) {
        const oldPhotoPath = path.join(__dirname, "..", user.profilePhoto)
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath)
        }
      }

      // Update user with new profile photo
      const profilePhotoUrl = `/uploads/profile-photos/${req.file.filename}`
      user.profilePhoto = profilePhotoUrl
      await user.save()

      res.status(200).json({
        success: true,
        message: "Profile photo uploaded successfully",
        profilePhotoUrl,
      })
    })
  } catch (error) {
    console.error("Upload profile photo error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get attendance photos
export const getAttendancePhotos = async (req, res) => {
  try {
    const { classId, date } = req.params

    // Check if class exists
    const classObj = await Class.findById(classId)
    if (!classObj) {
      return res.status(404).json({ message: "Class not found" })
    }

    // Get attendance records with photos for the class and date
    const attendanceRecords = await Attendance.find({
      classId,
      date,
      photoUrl: { $ne: null },
    }).populate("studentId", "name email profilePhoto")

    // Get photos from Python service
    const pythonResponse = await axios.get(`${FACE_SERVICE_URL}/attendance-photos/${classId}/${date}`)
    const pythonPhotos = pythonResponse.data.photos || []

    // Combine attendance records with photos
    const photos = attendanceRecords.map((record) => {
      // Find matching photo from Python service
      const pythonPhoto = pythonPhotos.find((p) => p.url.includes(record.photoUrl))

      return {
        id: record._id,
        studentId: record.studentId._id,
        studentName: record.studentId.name,
        studentEmail: record.studentId.email,
        studentPhoto: record.studentId.profilePhoto,
        photoUrl: record.photoUrl,
        photoData: pythonPhoto ? pythonPhoto.data : null,
        time: record.time,
        emotion: record.emotion,
        attention: record.attention,
      }
    })

    res.status(200).json({
      success: true,
      photos,
    })
  } catch (error) {
    console.error("Get attendance photos error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Batch register faces
export const batchRegisterFaces = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to batch register faces" })
    }

    const { file } = req

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" })
    }

    // Send file to Python service for batch registration
    const formData = new FormData()
    formData.append("file", new Blob([file.buffer]), file.originalname)

    const response = await axios.post(`${FACE_SERVICE_URL}/batch-register`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    // Update users in database
    const updatePromises = response.data.registered.map(async (userId) => {
      await User.findByIdAndUpdate(userId, { faceData: true })
    })

    await Promise.all(updatePromises)

    res.status(200).json({
      success: true,
      message: "Batch registration completed",
      registered: response.data.registered,
      failed: response.data.failed,
    })
  } catch (error) {
    console.error("Batch register faces error:", error)

    // Handle specific errors from Python service
    if (error.response) {
      return res.status(error.response.status).json({
        message: error.response.data.message || "Batch registration failed",
      })
    }

    res.status(500).json({ message: "Server error", error: error.message })
  }
}
