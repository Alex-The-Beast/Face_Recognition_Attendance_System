// import axios from "axios"

// const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

// // Create axios instance with base URL
// const api = axios.create({
//   baseURL: API_URL,
//   headers: {
//     "Content-Type": "application/json",
//   },
// })

// // Add request interceptor to include auth token
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("accessToken")
//     if (token) {
//       config.headers["Authorization"] = `Bearer ${token}`
//     }
//     return config
//   },
//   (error) => {
//     return Promise.reject(error)
//   },
// )

//  export const  userService = {
//   // Get all users (admin only)
//   getAllUsers: async () => {
//     try {
//       const response = await api.get("/users")
//       // console.log(response)
//       return response.data
    
//     } catch (error) {
//       throw error
//     }
//   },

//   // Get user by ID
//   getUserById: async (userId) => {
//     try {
//       const response = await api.get(`/users/${userId}`)
//       return response.data
//     } catch (error) {
//       throw error
//     }
//   },

//   // Get current user profile
//   getUserProfile: async () => {
//     try {
//       const response = await api.get("/users/me")
//       console.log(response)
//       return response.data
//     } catch (error) {
//       throw error
//     }
//   },

//   // Update current user profile
//   updateUserProfile: async (userData) => {
//     try {
//       const response = await api.put("/users/profile", userData)
//       return response.data
//     } catch (error) {
//       throw error
//     }
//   },

//   // Create user (admin only)
//   createUser: async (userData) => {
//     try {
//       const response = await api.post("/users", userData)
//       return response.data
//     } catch (error) {
//       throw error
//     }
//   },

//   // Update user
//   updateUser: async (userId, userData) => {
//     try {
//       const response = await api.put(`/users/${userId}`, userData)
//       return response.data
//     } catch (error) {
//       throw error
//     }
//   },

//   // Delete user (admin only)
//   deleteUser: async (userId) => {
//     try {
//       const response = await api.delete(`/users/${userId}`)
//       return response.data
//     } catch (error) {
//       throw error
//     }
//   },

//   // Change password
//   changePassword: async (passwordData) => {
//     try {
//       const response = await api.post("/users/change-password", passwordData)
//       return response.data
//     } catch (error) {
//       throw error
//     }
//   },

//   // Upload profile photo
//   uploadUserPhoto: async (photoData) => {
//     try {
//       const formData = new FormData()
//       formData.append("photo", photoData)

//       const response = await api.post("/users/profile-photo", formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       })
//       return response.data
//     } catch (error) {
//       throw error
//     }
//   }
// }

// export default userService


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

const userService = {
  // Get all users (admin only)
  getAllUsers: async () => {
    try {
      const response = await api.get("/users")
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get user by ID
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get current user profile
  getUserProfile: async () => {
    try {
      const response = await api.get("/users/profile/me")
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Update current user profile
  updateUserProfile: async (userData) => {
    try {
      const response = await api.put("/users/profile/me", userData)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await api.post("/users/change-password", passwordData)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Create user (admin only)
  createUser: async (userData) => {
    try {
      const response = await api.post("/users", userData)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Update user
  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(`/users/${userId}`, userData)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Delete user (admin only)
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/users/${userId}`)
      return response.data
    } catch (error) {
      throw error
    }
  },
}

export default userService
