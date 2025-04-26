import Class from "../models/Class.js"
import User from "../models/User.js"
import { validationResult } from "express-validator"

// Get all classes
export const getAllClasses = async (req, res) => {
  try {
    let classes

    // If user is admin, return all classes
    if (req.user.role === "admin") {
      classes = await Class.find()
    }
    // If user is teacher, return only their classes
    else if (req.user.role === "teacher") {
      classes = await Class.find({ teacherId: req.user.id })
    }
    // If user is student, return classes they are enrolled in
    else {
      classes = await Class.find({ students: req.user.id })
    }

    res.status(200).json({
      success: true,
      classes,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get class by ID
export const getClassById = async (req, res) => {
  try {
    const classObj = await Class.findById(req.params.id)

    if (!classObj) {
      return res.status(404).json({ message: "Class not found" })
    }

    // Check if user is authorized to view this class
    if (req.user.role !== "admin" && req.user.role !== "teacher" && !classObj.students.includes(req.user.id)) {
      return res.status(403).json({ message: "Not authorized to view this class" })
    }

    res.status(200).json({
      success: true,
      class: classObj,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Create class (admin only)
export const createClass = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { name, description, teacherId, schedule, isActive } = req.body

    // Check if teacher exists and is a teacher
    const teacher = await User.findById(teacherId)
    if (!teacher || teacher.role !== "teacher") {
      return res.status(400).json({ message: "Invalid teacher ID" })
    }

    // Create new class
    const newClass = await Class.create({
      name,
      description,
      teacherId,
      schedule,
      isActive: isActive !== undefined ? isActive : true,
    })

    res.status(201).json({
      success: true,
      class: newClass,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Update class (admin only)
export const updateClass = async (req, res) => {
  try {
    const { name, description, teacherId, schedule, isActive } = req.body

    // Find class
    const classObj = await Class.findById(req.params.id)

    if (!classObj) {
      return res.status(404).json({ message: "Class not found" })
    }

    // Check if teacher exists and is a teacher
    if (teacherId) {
      const teacher = await User.findById(teacherId)
      if (!teacher || teacher.role !== "teacher") {
        return res.status(400).json({ message: "Invalid teacher ID" })
      }
      classObj.teacherId = teacherId
    }

    // Update class
    if (name) classObj.name = name
    if (description !== undefined) classObj.description = description
    if (schedule) classObj.schedule = schedule
    if (isActive !== undefined) classObj.isActive = isActive

    await classObj.save()

    res.status(200).json({
      success: true,
      class: classObj,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Delete class (admin only)
export const deleteClass = async (req, res) => {
  try {
    const classObj = await Class.findById(req.params.id)

    if (!classObj) {
      return res.status(404).json({ message: "Class not found" })
    }

     await classObj.deleteOne();


    res.status(200).json({
      success: true,
      message: "Class deleted successfully",
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Add student to class (admin or teacher)
export const addStudentToClass = async (req, res) => {
  try {
    const { studentId } = req.body

    // Find class
    const classObj = await Class.findById(req.params.id)

    if (!classObj) {
      return res.status(404).json({ message: "Class not found" })
    }

    // Check if student exists and is a student
    const student = await User.findById(studentId)
    if (!student || student.role !== "student") {
      return res.status(400).json({ message: "Invalid student ID" })
    }

    // Check if student is already in class
    if (classObj.students.includes(studentId)) {
      return res.status(400).json({ message: "Student already in class" })
    }

    // Add student to class
    classObj.students.push(studentId)
    await classObj.save()

    // Update student's classId
    student.classId = classObj._id
    await student.save()

    res.status(200).json({
      success: true,
      message: "Student added to class successfully",
      class: classObj,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Remove student from class (admin or teacher)
export const removeStudentFromClass = async (req, res) => {
  try {
    const { studentId } = req.params

    // Find class
    const classObj = await Class.findById(req.params.id)

    if (!classObj) {
      return res.status(404).json({ message: "Class not found" })
    }

    // Check if student is in class
    if (!classObj.students.includes(studentId)) {
      return res.status(400).json({ message: "Student not in class" })
    }

    // Remove student from class
    classObj.students = classObj.students.filter((id) => id.toString() !== studentId)
    await classObj.save()

    // Update student's classId
    const student = await User.findById(studentId)
    if (student && student.classId && student.classId.toString() === req.params.id) {
      student.classId = null
      await student.save()
    }

    res.status(200).json({
      success: true,
      message: "Student removed from class successfully",
      class: classObj,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get students in class
export const getClassStudents = async (req, res) => {
  try {
    const classObj = await Class.findById(req.params.id)

    if (!classObj) {
      return res.status(404).json({ message: "Class not found" })
    }

    // Check if user is authorized to view this class
    if (req.user.role !== "admin" && req.user.role !== "teacher" && !classObj.students.includes(req.user.id)) {
      return res.status(403).json({ message: "Not authorized to view this class" })
    }

    // Get students
    const students = await User.find({
      _id: { $in: classObj.students },
      role: "student",
    }).select("-password -faceData")

    res.status(200).json({
      success: true,
      students,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
