"use client"

import { useState, useContext, useEffect } from "react"
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom"
import { Menu, X, LayoutDashboard, Users, BookOpen, CalendarCheck, FileText, LogOut, User } from "lucide-react"
import AuthContext from "../../contexts/AuthContext"
import NotificationBell from "../common/NotificationBell"

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { currentUser, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     const fetchUserProfile = async () => {
//       try {
//         setLoading(true)

//         // Fetch user profile from API
//         const response = await fetch("/api/auth/profile", {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
//           },
//         })

//         const text = await response.text()
// console.log("Raw profile response:", text)

// try {
//   const data = JSON.parse(text)
//   console.log("Parsed data:", data)
//   setUserProfile(data.user || data) // fallback
// } catch (err) {
//   console.error("Error parsing JSON:", err)
// }


//         if (!response.ok) {
//           throw new Error(`Failed to fetch profile: ${response.statusText}`)
//         }

//         console.log(response)

//         const data = await response.json()
        
//         setUserProfile(data.user)
//       } catch (err) {
//         console.error("Error fetching user profile:", err)
//         // Continue with currentUser from context as fallback
//       } finally {
//         setLoading(false)
//       }
//     }

//     if (currentUser) {
//       fetchUserProfile()
//     }
//   }, [currentUser])

useEffect(() => {
  const fetchUserProfile = async () => {
    try {
      setLoading(true)

      // Fetch user profile from API
      const response = await fetch("/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Profile data received:", data)

      // Check if user data exists and set it to state
      if (data.success && data.user) {
        setUserProfile(data.user)
      } else {
        console.error("User data is missing or invalid:", data)
      }
    } catch (err) {
      console.error("Error fetching user profile:", err)
      // Fallback to currentUser from context as fallback
      setUserProfile(currentUser)  // Optional fallback
    } finally {
      setLoading(false)
    }
  }

  if (currentUser) {
    fetchUserProfile()
  }
}, [currentUser])


  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleLogout = () => {
    logout()
  }

  // Navigation links based on user role
  const getNavLinks = () => {
    if (currentUser) {
      if (currentUser.role === "admin") {
        return [
          { to: "/admin", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
          { to: "/admin/users", label: "User Management", icon: <Users size={20} /> },
          { to: "/admin/classes", label: "Classes", icon: <BookOpen size={20} /> },
          { to: "/admin/profile", label: "Profile", icon: <User size={20} /> },
        ]
      } else if (currentUser.role === "teacher") {
        return [
          { to: "/teacher", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
          { to: "/teacher/take-attendance", label: "Take Attendance", icon: <CalendarCheck size={20} /> },
          { to: "/teacher/records", label: "Attendance Records", icon: <FileText size={20} /> },
          { to: "/teacher/profile", label: "Profile", icon: <User size={20} /> },
        ]
      } else if (currentUser.role === "student") {
        return [
          { to: "/student", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
          { to: "/student/attendance", label: "My Attendance", icon: <FileText size={20} /> },
          { to: "/student/profile", label: "Profile", icon: <User size={20} /> },
        ]
      }
    }

    return []
  }

  const navLinks = getNavLinks()

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-0 left-0 z-40 w-full bg-white shadow-sm p-4 flex items-center justify-between">
        <button onClick={toggleSidebar} className="p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none">
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <span className="text-xl font-semibold text-primary-600">AttendEase</span>
        <div className="flex items-center">
          <NotificationBell />
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-30 h-screen w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <Link to="/" className="flex items-center space-x-2">
              <CalendarCheck className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-800">AttendEase</span>
            </Link>
          </div>

          {/* User info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                <User className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{userProfile?.name || currentUser?.name || "User"}</p>
                <p className="text-xs text-gray-500 capitalize">{userProfile?.role || currentUser?.role || ""}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <ul className="space-y-2">
              {navLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.to}
                    className={`flex items-center p-2 text-base font-medium rounded-lg group transition-colors ${
                      location.pathname === link.to
                        ? "bg-primary-50 text-primary-700"
                        : "text-gray-700 hover:bg-primary-50 hover:text-primary-700"
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <div
                      className={`${
                        location.pathname === link.to
                          ? "text-primary-600"
                          : "text-gray-500 group-hover:text-primary-600"
                      } transition-colors`}
                    >
                      {link.icon}
                    </div>
                    <span className="ml-3">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center p-2 text-base font-medium rounded-lg text-red-600 hover:bg-red-50 group transition-colors"
            >
              <LogOut className="h-5 w-5 text-red-500" />
              <span className="ml-3">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={`transition-all duration-300 ease-in-out ${sidebarOpen ? "lg:ml-64" : "lg:ml-64"}`}>
        <div className="pt-16 lg:pt-0 min-h-screen">
          {/* Top bar for desktop */}
          <div className="hidden lg:flex items-center justify-end h-16 px-8 bg-white border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <NotificationBell />
              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                <User className="h-4 w-4 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden" onClick={toggleSidebar}></div>
      )}
    </div>
  )
}

export default DashboardLayout
