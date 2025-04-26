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

const photoService = {
  // Upload profile photo
  uploadProfilePhoto: async (userId, file) => {
    try {
      const formData = new FormData()
      formData.append("profilePhoto", file)

      const response = await api.post(`/face/profile-photo/${userId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get attendance photos for a class and date
  getAttendancePhotos: async (classId, date) => {
    try {
      const response = await api.get(`/face/attendance-photos/${classId}/${date}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get profile photo URL
  getProfilePhotoUrl: (userId) => {
    return `${API_URL}/face/profile-photo/${userId}`
  },

  // Get attendance photo URL
  getAttendancePhotoUrl: (photoPath) => {
    if (!photoPath) return null
    return `${API_URL}${photoPath}`
  },
}

export default photoService
