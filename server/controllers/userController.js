// // // import User from "../models/User.js"
// // // import { validationResult } from "express-validator"

// // // // Get all users (admin only)
// // // export const getAllUsers = async (req, res) => {
// // //   try {
// // //     const users = await User.find().select("-password -faceData")

// // //     res.status(200).json({
// // //       success: true,
// // //       users,
// // //     })
// // //   } catch (error) {
// // //     res.status(500).json({ message: "Server error", error: error.message })
// // //   }
// // // }

// // // // Get user by ID
// // // export const getUserById = async (req, res) => {
// // //   try {
// // //     const user = await User.findById(req.params.id).select("-password -faceData")

// // //     if (!user) {
// // //       return res.status(404).json({ message: "User not found" })
// // //     }

// // //     res.status(200).json({
// // //       success: true,
// // //       user,
// // //     })
// // //   } catch (error) {
// // //     res.status(500).json({ message: "Server error", error: error.message })
// // //   }
// // // }

// // // // Create user (admin only)
// // // export const createUser = async (req, res) => {
// // //   try {
// // //     const errors = validationResult(req)
// // //     if (!errors.isEmpty()) {
// // //       return res.status(400).json({ errors: errors.array() })
// // //     }

// // //     const { name, email, password, role } = req.body

// // //     // Check if user already exists
// // //     const userExists = await User.findOne({ email })

// // //     if (userExists) {
// // //       return res.status(400).json({ message: "User already exists" })
// // //     }

// // //     // Create new user
// // //     const user = await User.create({
// // //       name,
// // //       email,
// // //       password,
// // //       role,
// // //     })

// // //     res.status(201).json({
// // //       success: true,
// // //       user: {
// // //         id: user._id,
// // //         name: user.name,
// // //         email: user.email,
// // //         role: user.role,
// // //       },
// // //     })
// // //   } catch (error) {
// // //     res.status(500).json({ message: "Server error", error: error.message })
// // //   }
// // // }

// // // // Update user
// // // export const updateUser = async (req, res) => {
// // //   try {
// // //     const errors = validationResult(req)
// // //     if (!errors.isEmpty()) {
// // //       return res.status(400).json({ errors: errors.array() })
// // //     }

// // //     const { name, email, role } = req.body

// // //     // Find user
// // //     const user = await User.findById(req.params.id)

// // //     if (!user) {
// // //       return res.status(404).json({ message: "User not found" })
// // //     }

// // //     // Check if email is being changed and if it's already in use
// // //     if (email && email !== user.email) {
// // //       const emailExists = await User.findOne({ email })

// // //       if (emailExists) {
// // //         return res.status(400).json({ message: "Email already in use" })
// // //       }

// // //       user.email = email
// // //     }

// // //     // Update user
// // //     if (name) user.name = name
// // //     if (role && req.user.role === "admin") user.role = role

// // //     await user.save()

// // //     res.status(200).json({
// // //       success: true,
// // //       user: {
// // //         id: user._id,
// // //         name: user.name,
// // //         email: user.email,
// // //         role: user.role,
// // //       },
// // //     })
// // //   } catch (error) {
// // //     res.status(500).json({ message: "Server error", error: error.message })
// // //   }
// // // }

// // // // Delete user (admin only)
// // // export const deleteUser = async (req, res) => {
// // //   try {
// // //     const user = await User.findById(req.params.id)

// // //     if (!user) {
// // //       return res.status(404).json({ message: "User not found" })
// // //     }

// // //     await user.remove()

// // //     res.status(200).json({
// // //       success: true,
// // //       message: "User deleted successfully",
// // //     })
// // //   } catch (error) {
// // //     res.status(500).json({ message: "Server error", error: error.message })
// // //   }
// // // }

// // // // Change password
// // // export const changePassword = async (req, res) => {
// // //   try {
// // //     const errors = validationResult(req)
// // //     if (!errors.isEmpty()) {
// // //       return res.status(400).json({ errors: errors.array() })
// // //     }

// // //     const { currentPassword, newPassword } = req.body

// // //     // Find user
// // //     const user = await User.findById(req.params.id).select("+password")

// // //     if (!user) {
// // //       return res.status(404).json({ message: "User not found" })
// // //     }

// // //     // Check if current password matches
// // //     const isMatch = await user.comparePassword(currentPassword)

// // //     if (!isMatch) {
// // //       return res.status(401).json({ message: "Current password is incorrect" })
// // //     }

// // //     // Update password
// // //     user.password = newPassword
// // //     await user.save()

// // //     res.status(200).json({
// // //       success: true,
// // //       message: "Password updated successfully",
// // //     })
// // //   } catch (error) {
// // //     res.status(500).json({ message: "Server error", error: error.message })
// // //   }
// // // }


// // import User from "../models/User.js"
// // import Class from "../models/Class.js"
// // import Attendance from "../models/Attendance.js"
// // import { validationResult } from "express-validator"
// // import bcrypt from "bcryptjs"

// // // Get all users (admin only)
// // export const getAllUsers = async (req, res) => {
// //   try {
// //     const { role, search, status, page = 1, limit = 10 } = req.query

// //     // Build query
// //     const query = {}

// //     // Filter by role
// //     if (role && ["student", "teacher", "admin"].includes(role)) {
// //       query.role = role
// //     }

// //     // Filter by status
// //     if (status === "active") {
// //       query.isActive = true
// //     } else if (status === "inactive") {
// //       query.isActive = false
// //     }

// //     // Search by name or email
// //     if (search) {
// //       query.$or = [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }]
// //     }

// //     // Calculate pagination
// //     const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

// //     // Get users with pagination
// //     const users = await User.find(query)
// //       .select("-password")
// //       .populate("classId", "name code")
// //       .skip(skip)
// //       .limit(Number.parseInt(limit))
// //       .sort({ createdAt: -1 })

// //     // Get total count
// //     const total = await User.countDocuments(query)

// //     res.status(200).json({
// //       success: true,
// //       users,
// //       pagination: {
// //         total,
// //         page: Number.parseInt(page),
// //         limit: Number.parseInt(limit),
// //         pages: Math.ceil(total / Number.parseInt(limit)),
// //       },
// //     })
// //   } catch (error) {
// //     console.error("Get all users error:", error)
// //     res.status(500).json({ message: "Server error", error: error.message })
// //   }
// // }

// // // Get user by ID
// // export const getUserById = async (req, res) => {
// //   try {
// //     const user = await User.findById(req.params.id).select("-password").populate("classId", "name code")

// //     if (!user) {
// //       return res.status(404).json({ message: "User not found" })
// //     }

// //     // Get attendance statistics
// //     const attendanceStats = await Attendance.aggregate([
// //       { $match: { studentId: user._id } },
// //       {
// //         $group: {
// //           _id: "$status",
// //           count: { $sum: 1 },
// //         },
// //       },
// //     ])

// //     // Format attendance stats
// //     const stats = {
// //       present: 0,
// //       absent: 0,
// //       late: 0,
// //       excused: 0,
// //       total: 0,
// //     }

// //     attendanceStats.forEach((stat) => {
// //       stats[stat._id] = stat.count
// //       stats.total += stat.count
// //     })

// //     // Calculate percentage
// //     stats.percentage = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0

// //     res.status(200).json({
// //       success: true,
// //       user: {
// //         ...user.toObject(),
// //         attendanceStats: stats,
// //       },
// //     })
// //   } catch (error) {
// //     console.error("Get user by ID error:", error)
// //     res.status(500).json({ message: "Server error", error: error.message })
// //   }
// // }

// // // Create user (admin only)
// // export const createUser = async (req, res) => {
// //   try {
// //     const errors = validationResult(req)
// //     if (!errors.isEmpty()) {
// //       return res.status(400).json({ errors: errors.array() })
// //     }

// //     const { name, email, password, role, classId } = req.body

// //     // Check if user already exists
// //     const userExists = await User.findOne({ email })

// //     if (userExists) {
// //       return res.status(400).json({ message: "User already exists" })
// //     }

// //     // Validate class ID if provided
// //     if (classId) {
// //       const classExists = await Class.findById(classId)
// //       if (!classExists) {
// //         return res.status(400).json({ message: "Class not found" })
// //       }
// //     }

// //     // Create new user
// //     const user = await User.create({
// //       name,
// //       email,
// //       password,
// //       role,
// //       classId: classId || null,
// //     })

// //     res.status(201).json({
// //       success: true,
// //       user: {
// //         id: user._id,
// //         name: user.name,
// //         email: user.email,
// //         role: user.role,
// //         classId: user.classId,
// //         profilePhoto: user.profilePhoto,
// //         isActive: user.isActive,
// //       },
// //     })
// //   } catch (error) {
// //     console.error("Create user error:", error)
// //     res.status(500).json({ message: "Server error", error: error.message })
// //   }
// // }

// // // Update user
// // export const updateUser = async (req, res) => {
// //   try {
// //     const errors = validationResult(req)
// //     if (!errors.isEmpty()) {
// //       return res.status(400).json({ errors: errors.array() })
// //     }

// //     const { name, email, role, classId, isActive } = req.body

// //     // Find user
// //     const user = await User.findById(req.params.id)

// //     if (!user) {
// //       return res.status(404).json({ message: "User not found" })
// //     }

// //     // Check if email is being changed and if it's already in use
// //     if (email && email !== user.email) {
// //       const emailExists = await User.findOne({ email })

// //       if (emailExists) {
// //         return res.status(400).json({ message: "Email already in use" })
// //       }

// //       user.email = email
// //     }

// //     // Validate class ID if provided
// //     if (classId) {
// //       const classExists = await Class.findById(classId)
// //       if (!classExists) {
// //         return res.status(400).json({ message: "Class not found" })
// //       }
// //       user.classId = classId
// //     }

// //     // Update user
// //     if (name) user.name = name
// //     if (role && req.user.role === "admin") user.role = role
// //     if (isActive !== undefined && req.user.role === "admin") user.isActive = isActive

// //     await user.save()

// //     res.status(200).json({
// //       success: true,
// //       user: {
// //         id: user._id,
// //         name: user.name,
// //         email: user.email,
// //         role: user.role,
// //         classId: user.classId,
// //         profilePhoto: user.profilePhoto,
// //         isActive: user.isActive,
// //       },
// //     })
// //   } catch (error) {
// //     console.error("Update user error:", error)
// //     res.status(500).json({ message: "Server error", error: error.message })
// //   }
// // }

// // // Delete user (admin only)
// // export const deleteUser = async (req, res) => {
// //   try {
// //     const user = await User.findById(req.params.id)

// //     if (!user) {
// //       return res.status(404).json({ message: "User not found" })
// //     }

// //     // Delete user's attendance records
// //     await Attendance.deleteMany({ studentId: user._id })

// //     // Delete user
// //     await User.findByIdAndDelete(req.params.id)

// //     res.status(200).json({
// //       success: true,
// //       message: "User deleted successfully",
// //     })
// //   } catch (error) {
// //     console.error("Delete user error:", error)
// //     res.status(500).json({ message: "Server error", error: error.message })
// //   }
// // }

// // // Change password
// // export const changePassword = async (req, res) => {
// //   try {
// //     const errors = validationResult(req)
// //     if (!errors.isEmpty()) {
// //       return res.status(400).json({ errors: errors.array() })
// //     }

// //     const { currentPassword, newPassword } = req.body

// //     // Find user
// //     const user = await User.findById(req.params.id).select("+password")

// //     if (!user) {
// //       return res.status(404).json({ message: "User not found" })
// //     }

// //     // Check if current password matches
// //     const isMatch = await user.comparePassword(currentPassword)

// //     if (!isMatch) {
// //       return res.status(401).json({ message: "Current password is incorrect" })
// //     }

// //     // Update password
// //     user.password = newPassword
// //     await user.save()

// //     res.status(200).json({
// //       success: true,
// //       message: "Password updated successfully",
// //     })
// //   } catch (error) {
// //     console.error("Change password error:", error)
// //     res.status(500).json({ message: "Server error", error: error.message })
// //   }
// // }

// // // Reset password (admin only)
// // export const resetPassword = async (req, res) => {
// //   try {
// //     const { newPassword } = req.body

// //     if (!newPassword || newPassword.length < 6) {
// //       return res.status(400).json({ message: "Password must be at least 6 characters" })
// //     }

// //     // Find user
// //     const user = await User.findById(req.params.id)

// //     if (!user) {
// //       return res.status(404).json({ message: "User not found" })
// //     }

// //     // Update password
// //     const salt = await bcrypt.genSalt(10)
// //     user.password = await bcrypt.hash(newPassword, salt)
// //     await user.save()

// //     res.status(200).json({
// //       success: true,
// //       message: "Password reset successfully",
// //     })
// //   } catch (error) {
// //     console.error("Reset password error:", error)
// //     res.status(500).json({ message: "Server error", error: error.message })
// //   }
// // }

// // // Get user profile
// // export const getUserProfile = async (req, res) => {
// //   try {
// //     const user = await User.findById(req.user.id).select("-password").populate("classId", "name code")

// //     if (!user) {
// //       return res.status(404).json({ message: "User not found" })
// //     }

// //     res.status(200).json({
// //       success: true,
// //       user,
// //     })
// //   } catch (error) {
// //     console.error("Get user profile error:", error)
// //     res.status(500).json({ message: "Server error", error: error.message })
// //   }
// // }

// // // Update user profile
// // export const updateUserProfile = async (req, res) => {
// //   try {
// //     const { name, email } = req.body

// //     // Find user
// //     const user = await User.findById(req.user.id)

// //     if (!user) {
// //       return res.status(404).json({ message: "User not found" })
// //     }

// //     // Check if email is being changed and if it's already in use
// //     if (email && email !== user.email) {
// //       const emailExists = await User.findOne({ email })

// //       if (emailExists) {
// //         return res.status(400).json({ message: "Email already in use" })
// //       }

// //       user.email = email
// //     }

// //     // Update user
// //     if (name) user.name = name

// //     await user.save()

// //     res.status(200).json({
// //       success: true,
// //       user: {
// //         id: user._id,
// //         name: user.name,
// //         email: user.email,
// //         role: user.role,
// //         classId: user.classId,
// //         profilePhoto: user.profilePhoto,
// //       },
// //     })
// //   } catch (error) {
// //     console.error("Update user profile error:", error)
// //     res.status(500).json({ message: "Server error", error: error.message })
// //   }
// // }


// import User from "../models/User.js"
// import Class from "../models/Class.js"
// import Attendance from "../models/Attendance.js"
// import { validationResult } from "express-validator"
// import bcrypt from "bcryptjs"

// // Get all users (admin only)
// export const getAllUsers = async (req, res) => {
//   try {
//     const { role, search, status, page = 1, limit = 10 } = req.query

//     // Build query
//     const query = {}

//     // Filter by role
//     if (role && ["student", "teacher", "admin"].includes(role)) {
//       query.role = role
//     }

//     // Filter by status
//     if (status === "active") {
//       query.isActive = true
//     } else if (status === "inactive") {
//       query.isActive = false
//     }

//     // Search by name or email
//     if (search) {
//       query.$or = [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }]
//     }

//     // Calculate pagination
//     const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

//     // Get users with pagination
//     const users = await User.find(query)
//       .select("-password")
//       .populate("classId", "name code")
//       .skip(skip)
//       .limit(Number.parseInt(limit))
//       .sort({ createdAt: -1 })

//     // Get total count
//     const total = await User.countDocuments(query)

//     res.status(200).json({
//       success: true,
//       users,
//       pagination: {
//         total,
//         page: Number.parseInt(page),
//         limit: Number.parseInt(limit),
//         pages: Math.ceil(total / Number.parseInt(limit)),
//       },
//     })
//   } catch (error) {
//     console.error("Get all users error:", error)
//     res.status(500).json({ message: "Server error", error: error.message })
//   }
// }

// // Get user by ID
// export const getUserById = async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id).select("-password").populate("classId", "name code")

//     if (!user) {
//       return res.status(404).json({ message: "User not found" })
//     }

//     // Get attendance statistics
//     const attendanceStats = await Attendance.aggregate([
//       { $match: { studentId: user._id } },
//       {
//         $group: {
//           _id: "$status",
//           count: { $sum: 1 },
//         },
//       },
//     ])

//     // Format attendance stats
//     const stats = {
//       present: 0,
//       absent: 0,
//       late: 0,
//       excused: 0,
//       total: 0,
//     }

//     attendanceStats.forEach((stat) => {
//       stats[stat._id] = stat.count
//       stats.total += stat.count
//     })

//     // Calculate percentage
//     stats.percentage = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0

//     res.status(200).json({
//       success: true,
//       user: {
//         ...user.toObject(),
//         attendanceStats: stats,
//       },
//     })
//   } catch (error) {
//     console.error("Get user by ID error:", error)
//     res.status(500).json({ message: "Server error", error: error.message })
//   }
// }

// // Create user (admin only)
// export const createUser = async (req, res) => {
//   try {
//     const errors = validationResult(req)
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() })
//     }

//     const { name, email, password, role, classId } = req.body

//     // Check if user already exists
//     const userExists = await User.findOne({ email })

//     if (userExists) {
//       return res.status(400).json({ message: "User already exists" })
//     }

//     // Validate class ID if provided
//     if (classId) {
//       const classExists = await Class.findById(classId)
//       if (!classExists) {
//         return res.status(400).json({ message: "Class not found" })
//       }
//     }

//     // Create new user
//     const user = await User.create({
//       name,
//       email,
//       password,
//       role,
//       classId: classId || null,
//     })

//     res.status(201).json({
//       success: true,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         classId: user.classId,
//         profilePhoto: user.profilePhoto,
//         isActive: user.isActive,
//       },
//     })
//   } catch (error) {
//     console.error("Create user error:", error)
//     res.status(500).json({ message: "Server error", error: error.message })
//   }
// }

// // Update user
// export const updateUser = async (req, res) => {
//   try {
//     const errors = validationResult(req)
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() })
//     }

//     const { name, email, role, classId, isActive } = req.body

//     // Find user
//     const user = await User.findById(req.params.id)

//     if (!user) {
//       return res.status(404).json({ message: "User not found" })
//     }

//     // Check if email is being changed and if it's already in use
//     if (email && email !== user.email) {
//       const emailExists = await User.findOne({ email })

//       if (emailExists) {
//         return res.status(400).json({ message: "Email already in use" })
//       }

//       user.email = email
//     }

//     // Validate class ID if provided
//     if (classId) {
//       const classExists = await Class.findById(classId)
//       if (!classExists) {
//         return res.status(400).json({ message: "Class not found" })
//       }
//       user.classId = classId
//     }

//     // Update user
//     if (name) user.name = name
//     if (role && req.user.role === "admin") user.role = role
//     if (isActive !== undefined && req.user.role === "admin") user.isActive = isActive

//     await user.save()

//     res.status(200).json({
//       success: true,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         classId: user.classId,
//         profilePhoto: user.profilePhoto,
//         isActive: user.isActive,
//       },
//     })
//   } catch (error) {
//     console.error("Update user error:", error)
//     res.status(500).json({ message: "Server error", error: error.message })
//   }
// }

// // Delete user (admin only)
// export const deleteUser = async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id)

//     if (!user) {
//       return res.status(404).json({ message: "User not found" })
//     }

//     // Delete user's attendance records
//     await Attendance.deleteMany({ studentId: user._id })

//     // Delete user
//     await User.findByIdAndDelete(req.params.id)

//     res.status(200).json({
//       success: true,
//       message: "User deleted successfully",
//     })
//   } catch (error) {
//     console.error("Delete user error:", error)
//     res.status(500).json({ message: "Server error", error: error.message })
//   }
// }

// // Change password
// export const changePassword = async (req, res) => {
//   try {
//     const errors = validationResult(req)
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() })
//     }

//     const { currentPassword, newPassword } = req.body

//     // Find user
//     const user = await User.findById(req.params.id).select("+password")

//     if (!user) {
//       return res.status(404).json({ message: "User not found" })
//     }

//     // Check if current password matches
//     const isMatch = await user.comparePassword(currentPassword)

//     if (!isMatch) {
//       return res.status(401).json({ message: "Current password is incorrect" })
//     }

//     // Update password
//     user.password = newPassword
//     await user.save()

//     res.status(200).json({
//       success: true,
//       message: "Password updated successfully",
//     })
//   } catch (error) {
//     console.error("Change password error:", error)
//     res.status(500).json({ message: "Server error", error: error.message })
//   }
// }

// // Reset password (admin only)
// export const resetPassword = async (req, res) => {
//   try {
//     const { newPassword } = req.body

//     if (!newPassword || newPassword.length < 6) {
//       return res.status(400).json({ message: "Password must be at least 6 characters" })
//     }

//     // Find user
//     const user = await User.findById(req.params.id)

//     if (!user) {
//       return res.status(404).json({ message: "User not found" })
//     }

//     // Update password
//     const salt = await bcrypt.genSalt(10)
//     user.password = await bcrypt.hash(newPassword, salt)
//     await user.save()

//     res.status(200).json({
//       success: true,
//       message: "Password reset successfully",
//     })
//   } catch (error) {
//     console.error("Reset password error:", error)
//     res.status(500).json({ message: "Server error", error: error.message })
//   }
// }

// // Get user profile
// export const getUserProfile = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select("-password").populate("classId", "name code")

//     if (!user) {
//       return res.status(404).json({ message: "User not found" })
//     }

//     res.status(200).json({
//       success: true,
//       user,
//     })
//   } catch (error) {
//     console.error("Get user profile error:", error)
//     res.status(500).json({ message: "Server error", error: error.message })
//   }
// }

// // Update user profile
// export const updateUserProfile = async (req, res) => {
//   try {
//     const { name, email } = req.body

//     // Find user
//     const user = await User.findById(req.user.id)

//     if (!user) {
//       return res.status(404).json({ message: "User not found" })
//     }

//     // Check if email is being changed and if it's already in use
//     if (email && email !== user.email) {
//       const emailExists = await User.findOne({ email })

//       if (emailExists) {
//         return res.status(400).json({ message: "Email already in use" })
//       }

//       user.email = email
//     }

//     // Update user
//     if (name) user.name = name

//     await user.save()

//     res.status(200).json({
//       success: true,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         classId: user.classId,
//         profilePhoto: user.profilePhoto,
//       },
//     })
//   } catch (error) {
//     console.error("Update user profile error:", error)
//     res.status(500).json({ message: "Server error", error: error.message })
//   }
// }


import User from "../models/User.js"

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password")
    res.status(200).json({ success: true, users })
  } catch (error) {
    console.error("Error getting users:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    res.status(200).json({ success: true, user })
  } catch (error) {
    console.error("Error getting user:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get current user profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    res.status(200).json(user)
  } catch (error) {
    console.error("Error getting user profile:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Update current user profile
export const updateUserProfile = async (req, res) => {
  try {
    const { name, email, department, studentId, employeeId } = req.body

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } })
      if (existingUser) {
        return res.status(400).json({ message: "Email is already taken" })
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        email,
        department,
        studentId,
        employeeId,
      },
      { new: true, runValidators: true },
    ).select("-password")

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" })
    }

    res.status(200).json(updatedUser)
  } catch (error) {
    console.error("Error updating user profile:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" })
    }

    // Get user with password
    const user = await User.findById(req.user.id).select("+password")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Check if current password is correct
    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" })
    }

    // Update password
    user.password = newPassword
    await user.save()

    res.status(200).json({ message: "Password updated successfully" })
  } catch (error) {
    console.error("Error changing password:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Create user (admin only)
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, classId } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" })
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role,
      classId,
    })

    await user.save()

    res.status(201).json({ success: true, user: user.toJSON() })
  } catch (error) {
    console.error("Error creating user:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Update user
export const updateUser = async (req, res) => {
  try {
    const { name, email, role, classId, isActive } = req.body

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.params.id } })
      if (existingUser) {
        return res.status(400).json({ message: "Email is already taken" })
      }
    }

    // Only allow admin to update role or admin to update other users
    if (role && req.user.role !== "admin" && req.user.id !== req.params.id) {
      return res.status(403).json({ message: "Not authorized to update role" })
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        role,
        classId,
        isActive,
      },
      { new: true, runValidators: true },
    ).select("-password")

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" })
    }

    res.status(200).json({ success: true, user: updatedUser })
  } catch (error) {
    console.error("Error updating user:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Delete user (admin only)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    res.status(200).json({ success: true, message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
