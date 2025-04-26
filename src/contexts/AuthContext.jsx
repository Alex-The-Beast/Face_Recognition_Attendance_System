"use client"

import { createContext, useState, useEffect, useCallback, useContext } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { jwtDecode } from "jwt-decode"
import authService from "../services/authService"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Initialize navigate function for redirects
  const navigate = useNavigate()

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken")

        if (accessToken) {
          // Check if token is expired
          const decodedToken = jwtDecode(accessToken)
          const currentTime = Date.now() / 1000

          if (decodedToken.exp < currentTime) {
            // Token expired, try to refresh
            const refreshToken = localStorage.getItem("refreshToken")
            if (refreshToken) {
              try {
                const result = await authService.refreshToken(refreshToken)
                if (result.accessToken) {
                  localStorage.setItem("accessToken", result.accessToken)
                  localStorage.setItem("refreshToken", result.refreshToken)

                  // Set user from new token
                  const user = jwtDecode(result.accessToken)
                  setCurrentUser(user)
                } else {
                  // Failed to refresh token
                  logout()
                }
              } catch (err) {
                console.error("Failed to refresh token:", err)
                logout()
              }
            } else {
              // No refresh token, clear auth
              logout()
            }
          } else {
            // Token valid, set user
            const user = jwtDecode(accessToken)
            setCurrentUser(user)
          }
        }

        setLoading(false)
      } catch (err) {
        console.error("Error loading user:", err)
        setError("Failed to authenticate user")
        setLoading(false)
        logout()
      }
    }

    loadUser()
  }, [])

  // Setup axios interceptor for token handling
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config

        // If error is 401 and not already retrying
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            const refreshToken = localStorage.getItem("refreshToken")
            const result = await authService.refreshToken(refreshToken)

            if (result.accessToken) {
              localStorage.setItem("accessToken", result.accessToken)
              localStorage.setItem("refreshToken", result.refreshToken)

              // Update auth header and retry
              axios.defaults.headers.common["Authorization"] = `Bearer ${result.accessToken}`
              return axios(originalRequest)
            } else {
              // Failed to refresh, logout
              logout()
              return Promise.reject(error)
            }
          } catch (err) {
            console.error("Failed to refresh token in interceptor:", err)
            logout()
            return Promise.reject(err)
          }
        }

        return Promise.reject(error)
      },
    )

    // Clean up interceptor on unmount
    return () => {
      axios.interceptors.response.eject(interceptor)
    }
  }, [])

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true)
      setError(null)

      const result = await authService.login(email, password)

      if (result.accessToken) {
        localStorage.setItem("accessToken", result.accessToken)
        localStorage.setItem("refreshToken", result.refreshToken)

        const user = jwtDecode(result.accessToken)
        setCurrentUser(user)

        // Redirect based on role
        if (user.role === "admin") {
          navigate("/admin")
        } else if (user.role === "teacher") {
          navigate("/teacher")
        } else if (user.role === "student") {
          navigate("/student")
        }

        return true
      } else {
        setError("Login failed")
        return false
      }
    } catch (err) {
      console.error("Login error:", err)
      setError(err.response?.data?.message || "Failed to login")
      return false
    } finally {
      setLoading(false)
    }
  }

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true)
      setError(null)

      const result = await authService.register(userData)

      if (result.accessToken) {
        localStorage.setItem("accessToken", result.accessToken)
        localStorage.setItem("refreshToken", result.refreshToken)

        const user = jwtDecode(result.accessToken)
        setCurrentUser(user)

        // Redirect based on role
        if (user.role === "admin") {
          navigate("/admin")
        } else if (user.role === "teacher") {
          navigate("/teacher")
        } else if (user.role === "student") {
          navigate("/student")
        }

        return true
      } else {
        setError("Registration failed")
        return false
      }
    } catch (err) {
      console.error("Registration error:", err)
      setError(err.response?.data?.message || "Failed to register")
      return false
    } finally {
      setLoading(false)
    }
  }

  // Update user function
  const updateUser = (userData) => {
    setCurrentUser((prev) => ({
      ...prev,
      ...userData,
    }))
  }

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    setCurrentUser(null)
    navigate("/login")
  }, [navigate])

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)

export default AuthContext
