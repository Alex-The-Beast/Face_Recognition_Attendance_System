import axios from "axios"
import { saveOfflineAttendance, syncOfflineAttendance } from "../utils/offlineStorage"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken")
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

const attendanceService = {
  // Mark attendance (teacher only)
  markAttendance: async (data) => {
    try {
      const response = await api.post("/attendance/mark", data)
      return response.data
    } catch (error) {
      // If offline or network error, save data locally
      if (!navigator.onLine || error.message === "Network Error") {
        await saveOfflineAttendance(data)
        return {
          success: true,
          message: "Attendance saved offline. Will sync when online.",
          offline: true,
        }
      }
      throw error
    }
  },
  // Get attendance by class and date
getAttendanceByClassAndDate: async (classId, date) => {
  try {
    const response = await api.get(`/attendance/class/${classId}/date/${date}`)
    return response.data
  } catch (error) {
    throw error
  }
},


  // Sync offline attendance data
  syncOfflineAttendance: async () => {
    try {
      return await syncOfflineAttendance()
    } catch (error) {
      console.error("Error syncing offline attendance:", error)
      throw error
    }
  },

  // Get student's attendance records
  getMyAttendance: async (params = {}) => {
    try {
      const response = await api.get("/attendance/my", { params })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get class attendance records (teacher only)
  getClassAttendance: async (classId, params = {}) => {
    try {
      const response = await api.get(`/attendance/class/${classId}`, { params })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Export attendance as CSV (admin/teacher)
  exportAttendance: async (params = {}) => {
    try {
      const response = await api.get("/attendance/export", {
        params,
        responseType: "blob",
      })

      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]))

      // Create a link element and trigger download
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", "attendance.csv")
      document.body.appendChild(link)
      link.click()

      // Clean up
      window.URL.revokeObjectURL(url)
      document.body.removeChild(link)

      return { success: true }
    } catch (error) {
      throw error
    }
  },

  // Edit attendance record (admin only)
  editAttendance: async (attendanceId, data) => {
    try {
      const response = await api.put(`/attendance/${attendanceId}`, data)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Verify and mark attendance using face recognition
  verifyAndMarkAttendance: async (data) => {
    try {
      const response = await api.post("/face/verify", data)
      return response.data
    } catch (error) {
      // If offline or network error, save data locally
      if (!navigator.onLine || error.message === "Network Error") {
        await saveOfflineAttendance({
          classId: data.classId,
          date: data.date,
          time: data.time,
          studentIds: [], // Will be filled when online
          method: "face",
          pendingVerification: true,
          imageData: data.image,
        })
        return {
          success: true,
          message: "Image saved offline. Will process when online.",
          offline: true,
        }
      }
      throw error
    }
  },

  // Get attendance statistics
  getAttendanceStats: async (params = {}) => {
    try {
      const response = await api.get("/attendance/stats", { params })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Submit attendance dispute
  submitDispute: async (attendanceId, data) => {
    try {
      const response = await api.post(`/attendance/${attendanceId}/dispute`, data)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Resolve attendance dispute (teacher/admin only)
  resolveDispute: async (attendanceId, data) => {
    try {
      const response = await api.put(`/attendance/${attendanceId}/dispute`, data)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get attendance photos for a class and date (teacher/admin only)
  getAttendancePhotos: async (classId, date) => {
    try {
      const response = await api.get(`/face/attendance-photos/${classId}/${date}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get attendance calendar data
  getAttendanceCalendar: async (month, year) => {
    try {
      const response = await api.get("/attendance/calendar", {
        params: { month, year },
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get attendance leaderboard
  getAttendanceLeaderboard: async (classId) => {
    try {
      const response = await api.get(`/attendance/leaderboard/${classId}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Generate attendance report
  generateReport: async (params = {}) => {
    try {
      const response = await api.get("/attendance/report", { params })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Export attendance report as CSV
  exportReport: async (params = {}) => {
    try {
      const response = await api.get("/attendance/report/export", {
        params,
        responseType: "blob",
      })

      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]))

      // Create a link element and trigger download
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `attendance_report_${new Date().toISOString().split("T")[0]}.csv`)
      document.body.appendChild(link)
      link.click()

      // Clean up
      window.URL.revokeObjectURL(url)
      document.body.removeChild(link)

      return { success: true }
    } catch (error) {
      throw error
    }
  },
}

export default attendanceService
