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

// const faceService = {
//   // Register face for a user
//   registerFace: async (userId, imageData) => {
//     try {
//       const response = await api.post("/face/register", {
//         userId,
//         image: imageData,
//       })
//       return response.data
//     } catch (error) {
//       throw error
//     }
//   },

//   // Verify face for authentication
//   verifyFace: async (imageData) => {
//     try {
//       const response = await api.post("/face/verify", {
//         image: imageData,
//       })
//       return response.data
//     } catch (error) {
//       throw error
//     }
//   },

//   // Check if a user has registered their face
//   checkFaceRegistration: async (userId) => {
//     try {
//       const response = await api.get(`/face/check/${userId}`)
//       return response.data
//     } catch (error) {
//       throw error
//     }
//   },

//   // Delete face data for a user
//   deleteFaceData: async (userId) => {
//     try {
//       const response = await api.delete(`/face/delete/${userId}`)
//       return response.data
//     } catch (error) {
//       throw error
//     }
//   },
// }

// export default faceService


import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"
const FACE_SERVICE_URL = import.meta.env.VITE_FACE_SERVICE_URL || "http://localhost:5001"

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Create axios instance for face service
const faceApi = axios.create({
  baseURL: FACE_SERVICE_URL,
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

const faceService = {
  // Register face for a user
  registerFace: async (userId, imageData) => {
    try {
      // First call the Node.js backend to validate the user
      const validationResponse = await api.get(`/face/check/${userId}`)

      if (!validationResponse.data.success) {
        throw new Error(validationResponse.data.message || "User validation failed")
      }

      // Then call the Python face service to register the face
      const response = await faceApi.post("/register", {
        user_id: userId,
        name: validationResponse.data.userName || "User",
        image_data: imageData,
      })

      // Update the user's face data status in the Node.js backend
      if (response.data.success) {
        await api.post("/face/register", {
          userId,
          faceData: true,
        })
      }

      return response.data
    } catch (error) {
      // Handle errors from either service
      if (error.response) {
        throw new Error(error.response.data.message || "Face registration failed")
      }
      throw error
    }
  },

  // Verify face for authentication
  verifyFace: async (imageData, classId, date, time) => {
    try {
      const response = await faceApi.post("/verify", {
        image_data: imageData,
        class_id: classId,
        date,
        time,
      })

      return response.data
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || "Face verification failed")
      }
      throw error
    }
  },

  // Check if a user has registered their face
  checkFaceRegistration: async (userId) => {
    try {
      const response = await api.get(`/face/check/${userId}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Delete face data for a user
  deleteFaceData: async (userId) => {
    try {
      // First call the Python face service to delete the face data
      const response = await faceApi.delete(`/delete/${userId}`)

      // Update the user's face data status in the Node.js backend
      if (response.data.success) {
        await api.delete(`/face/delete/${userId}`)
      }

      return response.data
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || "Failed to delete face data")
      }
      throw error
    }
  },

  // Train the face recognition model (admin only)
  trainModel: async () => {
    try {
      const response = await faceApi.post("/train")
      return response.data
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || "Failed to train model")
      }
      throw error
    }
  },

  // Batch register faces from CSV
  batchRegisterFaces: async (csvFile) => {
    try {
      const formData = new FormData()
      formData.append("file", csvFile)

      const response = await faceApi.post("/batch-register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      return response.data
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || "Failed to batch register faces")
      }
      throw error
    }
  },

  // Get face recognition model statistics
  getModelStats: async () => {
    try {
      const response = await faceApi.get("/model-stats")
      return response.data
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || "Failed to get model statistics")
      }
      throw error
    }
  },

  // Perform 3D liveness detection
  checkLiveness: async (imageData) => {
    try {
      const response = await faceApi.post("/liveness", {
        image_data: imageData,
      })
      return response.data
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || "Liveness check failed")
      }
      throw error
    }
  },
}

export default faceService
