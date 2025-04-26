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

const authService = {
  // Login user
  login: async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Register user
  register: async (userData) => {
    try {
      const response = await api.post("/auth/register", userData)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    try {
      const response = await api.post("/auth/refresh", { refreshToken })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get("/auth/profile")
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Update user profile
  updateProfile: async (userData) => {
    try {
      const response = await api.put("/auth/profile", userData)
      return response.data
    } catch (error) {
      throw error
    }
  },
}

export default authService
