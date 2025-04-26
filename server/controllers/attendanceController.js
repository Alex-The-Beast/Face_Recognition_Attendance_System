import Attendance from "../models/Attendance.js"
import User from "../models/User.js"
import Class from "../models/Class.js"
import { validationResult } from "express-validator"
import { createObjectCsvStringifier } from "csv-writer"

// Mark attendance
export const markAttendance = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { classId, date, studentIds, status = "present", time, method = "manual" } = req.body

    // Validate class
    const classObj = await Class.findById(classId)
    if (!classObj) {
      return res.status(404).json({ message: "Class not found" })
    }

    // Get all students in the class
    const students = await User.find({ classId, role: "student" })

    // Create or update attendance records
    const attendancePromises = students.map(async (student) => {
      const isPresent = studentIds.includes(student._id.toString())

      return Attendance.findOneAndUpdate(
        { studentId: student._id, classId, date },
        {
          time: time || new Date().toTimeString().split(" ")[0],
          status: isPresent ? status : "absent",
          verifiedBy: req.user.id,
          verificationMethod: method,
        },
        { upsert: true, new: true },
      )
    })

    const attendanceRecords = await Promise.all(attendancePromises)

    // Update student attendance stats
    for (const student of students) {
      const totalAttendance = await Attendance.countDocuments({ studentId: student._id, classId })
      const presentAttendance = await Attendance.countDocuments({
        studentId: student._id,
        classId,
        status: "present",
      })

      const percentage = totalAttendance > 0 ? (presentAttendance / totalAttendance) * 100 : 0

      await User.findByIdAndUpdate(student._id, {
        "attendanceStats.total": totalAttendance,
        "attendanceStats.present": presentAttendance,
        "attendanceStats.percentage": percentage,
      })
    }

    res.status(200).json({
      success: true,
      message: "Attendance marked successfully",
      attendanceRecords,
    })
  } catch (error) {
    console.error("Mark attendance error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get student's attendance records
export const getMyAttendance = async (req, res) => {
  try {
    const { page = 1, limit = 10, date, status, classId, search } = req.query

    // Build query
    const query = { studentId: req.user.id }

    if (date) query.date = date
    if (status) query.status = status
    if (classId) query.classId = classId

    // Calculate pagination
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    // Get attendance records with pagination
    let attendanceRecords = await Attendance.find(query)
      .populate("classId", "name code")
      .populate("verifiedBy", "name")
      .skip(skip)
      .limit(Number.parseInt(limit))
      .sort({ date: -1, time: -1 })

    // If search is provided, filter by class name
    if (search) {
      attendanceRecords = attendanceRecords.filter((record) =>
        record.classId.name.toLowerCase().includes(search.toLowerCase()),
      )
    }

    // Format records for response
    const formattedRecords = attendanceRecords.map((record) => ({
      _id: record._id,
      date: record.date,
      time: record.time,
      status: record.status,
      className: record.classId.name,
      classCode: record.classId.code,
      verifiedByName: record.verifiedBy ? record.verifiedBy.name : "System",
      verificationMethod: record.verificationMethod,
      emotion: record.emotion,
      attention: record.attention,
      photoUrl: record.photoUrl,
    }))

    // Get total count
    const total = await Attendance.countDocuments(query)

    res.status(200).json({
      success: true,
      attendanceRecords: formattedRecords,
      total,
      page: Number.parseInt(page),
      limit: Number.parseInt(limit),
      pages: Math.ceil(total / Number.parseInt(limit)),
    })
  } catch (error) {
    console.error("Get my attendance error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get class attendance records (teacher only)
export const getClassAttendance = async (req, res) => {
  try {
    const { classId } = req.params
    const { date, studentId } = req.query

    // Validate class
    const classObj = await Class.findById(classId)
    if (!classObj) {
      return res.status(404).json({ message: "Class not found" })
    }

    // Check if user is authorized to view this class's attendance
    if (req.user.role !== "admin" && classObj.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to view this class's attendance" })
    }

    // Build query
    const query = { classId }
    if (date) query.date = date
    if (studentId) query.studentId = studentId

    // Get attendance records
    const attendanceRecords = await Attendance.find(query)
      .populate("studentId", "name email profilePhoto")
      .sort({ date: -1, time: -1 })

    res.status(200).json({
      success: true,
      attendanceRecords,
    })
  } catch (error) {
    console.error("Get class attendance error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Export attendance as CSV
export const exportAttendance = async (req, res) => {
  try {
    const { classId, startDate, endDate, studentId } = req.query

    // Build query
    const query = {}
    if (classId) query.classId = classId
    if (studentId) query.studentId = studentId
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate }
    } else if (startDate) {
      query.date = { $gte: startDate }
    } else if (endDate) {
      query.date = { $lte: endDate }
    }

    // Get attendance records
    const attendanceRecords = await Attendance.find(query)
      .populate("studentId", "name email")
      .populate("classId", "name code")
      .populate("verifiedBy", "name")
      .sort({ date: -1, time: -1 })

    // Format records for CSV
    const records = attendanceRecords.map((record) => ({
      Date: record.date,
      Time: record.time,
      Student: record.studentId ? record.studentId.name : "Unknown",
      Email: record.studentId ? record.studentId.email : "Unknown",
      Class: record.classId ? record.classId.name : "Unknown",
      ClassCode: record.classId ? record.classId.code : "Unknown",
      Status: record.status,
      VerifiedBy: record.verifiedBy ? record.verifiedBy.name : "System",
      Method: record.verificationMethod,
      Emotion: record.emotion || "N/A",
      Attention: record.attention ? `${record.attention}%` : "N/A",
    }))

    // Create CSV
    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: "Date", title: "Date" },
        { id: "Time", title: "Time" },
        { id: "Student", title: "Student" },
        { id: "Email", title: "Email" },
        { id: "Class", title: "Class" },
        { id: "ClassCode", title: "Class Code" },
        { id: "Status", title: "Status" },
        { id: "VerifiedBy", title: "Verified By" },
        { id: "Method", title: "Method" },
        { id: "Emotion", title: "Emotion" },
        { id: "Attention", title: "Attention" },
      ],
    })

    const csvString = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records)

    // Set headers for file download
    res.setHeader("Content-Type", "text/csv")
    res.setHeader("Content-Disposition", `attachment; filename=attendance_export_${new Date().toISOString()}.csv`)

    // Send CSV
    res.send(csvString)
  } catch (error) {
    console.error("Export attendance error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get attendance statistics
export const getAttendanceStats = async (req, res) => {
  try {
    const { userId, classId, period } = req.query

    // Determine date range based on period
    const today = new Date()
    let startDate = new Date()

    switch (period) {
      case "day":
        startDate = today
        break
      case "week":
        startDate.setDate(today.getDate() - 7)
        break
      case "month":
        startDate.setMonth(today.getMonth() - 1)
        break
      case "semester":
        startDate.setMonth(today.getMonth() - 6)
        break
      default:
        startDate.setMonth(today.getMonth() - 1) // Default to last month
    }

    // Format dates for query
    const formattedStartDate = startDate.toISOString().split("T")[0]
    const formattedEndDate = today.toISOString().split("T")[0]

    // Build query
    const query = {
      date: { $gte: formattedStartDate, $lte: formattedEndDate },
    }

    if (userId) query.studentId = userId
    if (classId) query.classId = classId

    // Get attendance records
    const attendanceRecords = await Attendance.find(query)

    // Calculate statistics
    const totalRecords = attendanceRecords.length
    const presentRecords = attendanceRecords.filter((record) => record.status === "present").length
    const absentRecords = attendanceRecords.filter((record) => record.status === "absent").length
    const lateRecords = attendanceRecords.filter((record) => record.status === "late").length
    const excusedRecords = attendanceRecords.filter((record) => record.status === "excused").length

    const attendanceRate = totalRecords > 0 ? (presentRecords / totalRecords) * 100 : 0

    // Get class-wise statistics if userId is provided
    let classStats = []
    if (userId) {
      // Get all classes the user is enrolled in
      const userClasses = await Class.find({ students: userId })

      // Calculate stats for each class
      classStats = await Promise.all(
        userClasses.map(async (cls) => {
          const classAttendance = await Attendance.find({
            studentId: userId,
            classId: cls._id,
            date: { $gte: formattedStartDate, $lte: formattedEndDate },
          })

          const totalClassRecords = classAttendance.length
          const presentClassRecords = classAttendance.filter((record) => record.status === "present").length
          const classAttendanceRate = totalClassRecords > 0 ? (presentClassRecords / totalClassRecords) * 100 : 0

          return {
            classId: cls._id,
            className: cls.name,
            classCode: cls.code,
            total: totalClassRecords,
            present: presentClassRecords,
            absent: totalClassRecords - presentClassRecords,
            attendanceRate: classAttendanceRate,
          }
        }),
      )
    }

    res.status(200).json({
      success: true,
      stats: {
        period,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        total: totalRecords,
        present: presentRecords,
        absent: absentRecords,
        late: lateRecords,
        excused: excusedRecords,
        attendanceRate,
      },
      classStats,
    })
  } catch (error) {
    console.error("Get attendance stats error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Generate attendance report
export const generateReport = async (req, res) => {
  try {
    const { classId, startDate, endDate, type = "summary" } = req.query

    // Validate class
    const classObj = await Class.findById(classId)
    if (!classObj) {
      return res.status(404).json({ message: "Class not found" })
    }

    // Check if user is authorized to view this class's attendance
    if (req.user.role !== "admin" && classObj.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to view this class's attendance" })
    }

    // Get all students in the class
    const students = await User.find({ classId, role: "student" })

    // Build query for date range
    const dateQuery = {}
    if (startDate && endDate) {
      dateQuery.$gte = startDate
      dateQuery.$lte = endDate
    } else if (startDate) {
      dateQuery.$gte = startDate
    } else if (endDate) {
      dateQuery.$lte = endDate
    }

    // Generate report based on type
    let reportData = {}

    if (type === "summary") {
      // Get attendance records for the class in the date range
      const attendanceRecords = await Attendance.find({
        classId,
        date: dateQuery,
      })

      // Calculate summary statistics
      const totalStudents = students.length
      const totalDates = new Set(attendanceRecords.map((record) => record.date)).size
      const totalRecords = attendanceRecords.length
      const presentRecords = attendanceRecords.filter((record) => record.status === "present").length
      const averageAttendance = totalRecords > 0 ? (presentRecords / totalRecords) * 100 : 0

      reportData = {
        totalStudents,
        totalClasses: totalDates,
        totalRecords,
        presentRecords,
        absentRecords: totalRecords - presentRecords,
        averageAttendance: Math.round(averageAttendance * 100) / 100,
      }
    } else if (type === "detailed") {
      // Get all dates in the range
      const dates = []
      const currentDate = new Date(startDate)
      const endDateObj = new Date(endDate)

      while (currentDate <= endDateObj) {
        dates.push(currentDate.toISOString().split("T")[0])
        currentDate.setDate(currentDate.getDate() + 1)
      }

      // Get attendance data for each date
      const dateStats = await Promise.all(
        dates.map(async (date) => {
          const dateAttendance = await Attendance.find({
            classId,
            date,
          })

          const totalStudents = students.length
          const presentStudents = dateAttendance.filter((record) => record.status === "present").length
          const absentStudents = totalStudents - presentStudents
          const attendancePercentage = totalStudents > 0 ? (presentStudents / totalStudents) * 100 : 0

          return {
            date,
            total: totalStudents,
            present: presentStudents,
            absent: absentStudents,
            percentage: Math.round(attendancePercentage * 100) / 100,
          }
        }),
      )

      reportData = {
        dates: dateStats,
      }
    } else if (type === "student") {
      // Get attendance data for each student
      const studentStats = await Promise.all(
        students.map(async (student) => {
          const studentAttendance = await Attendance.find({
            studentId: student._id,
            classId,
            date: dateQuery,
          })

          const totalClasses = studentAttendance.length
          const presentClasses = studentAttendance.filter((record) => record.status === "present").length
          const absentClasses = totalClasses - presentClasses
          const attendancePercentage = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0

          return {
            id: student._id,
            name: student.name,
            email: student.email,
            total: totalClasses,
            present: presentClasses,
            absent: absentClasses,
            percentage: Math.round(attendancePercentage * 100) / 100,
          }
        }),
      )

      reportData = {
        students: studentStats,
      }
    }

    res.status(200).json({
      success: true,
      data: reportData,
    })
  } catch (error) {
    console.error("Generate report error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Export attendance report as CSV
export const exportReport = async (req, res) => {
  try {
    const { classId, startDate, endDate, type = "summary" } = req.query

    // Validate class
    const classObj = await Class.findById(classId)
    if (!classObj) {
      return res.status(404).json({ message: "Class not found" })
    }

    // Check if user is authorized to view this class's attendance
    if (req.user.role !== "admin" && classObj.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to view this class's attendance" })
    }

    // Get all students in the class
    const students = await User.find({ classId, role: "student" })

    // Build query for date range
    const dateQuery = {}
    if (startDate && endDate) {
      dateQuery.$gte = startDate
      dateQuery.$lte = endDate
    } else if (startDate) {
      dateQuery.$gte = startDate
    } else if (endDate) {
      dateQuery.$lte = endDate
    }

    let csvStringifier
    const records = []

    if (type === "detailed") {
      // Get all dates in the range
      const dates = []
      const currentDate = new Date(startDate)
      const endDateObj = new Date(endDate)

      while (currentDate <= endDateObj) {
        dates.push(currentDate.toISOString().split("T")[0])
        currentDate.setDate(currentDate.getDate() + 1)
      }

      // Get attendance data for each date
      for (const date of dates) {
        const dateAttendance = await Attendance.find({
          classId,
          date,
        }).populate("studentId", "name email")

        // Create record for each student
        for (const record of dateAttendance) {
          records.push({
            Date: date,
            StudentName: record.studentId ? record.studentId.name : "Unknown",
            StudentEmail: record.studentId ? record.studentId.email : "Unknown",
            Status: record.status,
            Time: record.time,
            VerificationMethod: record.verificationMethod,
            Emotion: record.emotion || "N/A",
            Attention: record.attention ? `${record.attention}%` : "N/A",
          })
        }
      }

      csvStringifier = createObjectCsvStringifier({
        header: [
          { id: "Date", title: "Date" },
          { id: "StudentName", title: "Student Name" },
          { id: "StudentEmail", title: "Student Email" },
          { id: "Status", title: "Status" },
          { id: "Time", title: "Time" },
          { id: "VerificationMethod", title: "Verification Method" },
          { id: "Emotion", title: "Emotion" },
          { id: "Attention", title: "Attention" },
        ],
      })
    } else if (type === "student") {
      // Get attendance data for each student
      for (const student of students) {
        const studentAttendance = await Attendance.find({
          studentId: student._id,
          classId,
          date: dateQuery,
        })

        const totalClasses = studentAttendance.length
        const presentClasses = studentAttendance.filter((record) => record.status === "present").length
        const absentClasses = totalClasses - presentClasses
        const attendancePercentage = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0

        records.push({
          StudentName: student.name,
          StudentEmail: student.email,
          TotalClasses: totalClasses,
          Present: presentClasses,
          Absent: absentClasses,
          AttendancePercentage: `${Math.round(attendancePercentage * 100) / 100}%`,
        })
      }

      csvStringifier = createObjectCsvStringifier({
        header: [
          { id: "StudentName", title: "Student Name" },
          { id: "StudentEmail", title: "Student Email" },
          { id: "TotalClasses", title: "Total Classes" },
          { id: "Present", title: "Present" },
          { id: "Absent", title: "Absent" },
          { id: "AttendancePercentage", title: "Attendance Percentage" },
        ],
      })
    } else {
      // Summary report - create a single record with overall statistics
      const attendanceRecords = await Attendance.find({
        classId,
        date: dateQuery,
      })

      const totalStudents = students.length
      const totalDates = new Set(attendanceRecords.map((record) => record.date)).size
      const totalRecords = attendanceRecords.length
      const presentRecords = attendanceRecords.filter((record) => record.status === "present").length
      const averageAttendance = totalRecords > 0 ? (presentRecords / totalRecords) * 100 : 0

      records.push({
        ClassName: classObj.name,
        ClassCode: classObj.code,
        StartDate: startDate || "N/A",
        EndDate: endDate || "N/A",
        TotalStudents: totalStudents,
        TotalClasses: totalDates,
        TotalRecords: totalRecords,
        PresentRecords: presentRecords,
        AbsentRecords: totalRecords - presentRecords,
        AverageAttendance: `${Math.round(averageAttendance * 100) / 100}%`,
      })

      csvStringifier = createObjectCsvStringifier({
        header: [
          { id: "ClassName", title: "Class Name" },
          { id: "ClassCode", title: "Class Code" },
          { id: "StartDate", title: "Start Date" },
          { id: "EndDate", title: "End Date" },
          { id: "TotalStudents", title: "Total Students" },
          { id: "TotalClasses", title: "Total Classes" },
          { id: "TotalRecords", title: "Total Records" },
          { id: "PresentRecords", title: "Present Records" },
          { id: "AbsentRecords", title: "Absent Records" },
          { id: "AverageAttendance", title: "Average Attendance" },
        ],
      })
    }

    const csvString = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records)

    // Set headers for file download
    res.setHeader("Content-Type", "text/csv")
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=attendance_report_${classObj.code}_${new Date().toISOString()}.csv`,
    )

    // Send CSV
    res.send(csvString)
  } catch (error) {
    console.error("Export report error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
