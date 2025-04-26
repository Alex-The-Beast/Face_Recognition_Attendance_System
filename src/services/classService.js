import axios from "axios"

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

const classService = {
  // Get all classes
  getAllClasses: async () => {
    try {
      const response = await api.get("/classes")
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get class by ID
  getClassById: async (classId) => {
    try {
      const response = await api.get(`/classes/${classId}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Create class (admin only)
  createClass: async (classData) => {
    try {
      const response = await api.post("/classes", classData)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Update class (admin only)
  updateClass: async (classId, classData) => {
    try {
      const response = await api.put(`/classes/${classId}`, classData)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Delete class (admin only)
  deleteClass: async (classId) => {
    try {
      const response = await api.delete(`/classes/${classId}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Add student to class (admin or teacher)
  addStudentToClass: async (classId, studentId) => {
    try {
      const response = await api.post(`/classes/${classId}/students`, { studentId })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Remove student from class (admin or teacher)
  removeStudentFromClass: async (classId, studentId) => {
    try {
      const response = await api.delete(`/classes/${classId}/students/${studentId}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get students in class
  getClassStudents: async (classId) => {
    try {
      const response = await api.get(`/classes/${classId}/students`)
      return response.data
    } catch (error) {
      throw error
    }
  },
}

export default classService
