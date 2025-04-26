import jwt from "jsonwebtoken"
import User from "../models/User.js"
import dotenv from "dotenv"

dotenv.config()

// Authentication middleware
export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Access denied. No token provided." })
    }

    const token = authHeader.split(" ")[1]

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Find user by id
    const user = await User.findById(decoded.id)

    if (!user) {
      return res.status(401).json({ message: "Invalid token. User not found." })
    }

    // Add user to request object
    req.user = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    }

    next()
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired." })
    }

    return res.status(401).json({ message: "Invalid token." })
  }
}

// Role-based authorization middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required." })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied. Not authorized." })
    }

    next()
  }
}

// Middleware to check if user is owner or admin
export const isOwnerOrAdmin = (req, res, next) => {
  if (req.user.role === "admin" || req.user.id.toString() === req.params.id) {
    return next()
  }

  return res.status(403).json({ message: "Access denied. Not authorized." })
}

// Middleware to check if user is class teacher or admin
export const isTeacherOrAdmin = async (req, res, next) => {
  try {
    const classId = req.params.id || req.body.classId

    if (!classId) {
      return res.status(400).json({ message: "Class ID is required." })
    }

    if (req.user.role === "admin") {
      return next()
    }

    const classObj = await Class.findById(classId)

    if (!classObj) {
      return res.status(404).json({ message: "Class not found." })
    }

    if (classObj.teacherId.toString() === req.user.id.toString()) {
      return next()
    }

    return res.status(403).json({ message: "Access denied. Not authorized." })
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message })
  }
}
