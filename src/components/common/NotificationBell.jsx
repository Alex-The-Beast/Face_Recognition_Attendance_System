// "use client"

// import { useState, useEffect, useRef } from "react"
// import { Bell } from "lucide-react"

// const NotificationBell = () => {
//   const [notifications, setNotifications] = useState([])
//   const [unreadCount, setUnreadCount] = useState(0)
//   const [showNotifications, setShowNotifications] = useState(false)
//   const notificationRef = useRef(null)

//   useEffect(() => {
//     const fetchNotifications = async () => {
//       try {
//         const response = await fetch("/api/notifications", {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
//           },
//         })

//         if (!response.ok) {
//           throw new Error(`Failed to fetch notifications: ${response.statusText}`)
//         }

//         const data = await response.json()
//         setNotifications(data.notifications || [])
//         setUnreadCount(data.notifications?.filter((n) => !n.read).length || 0)
//       } catch (err) {
//         console.error("Error fetching notifications:", err)

//         // Fallback data for development/testing
//         const mockNotifications = [
//           {
//             id: "1",
//             title: "Low Attendance Warning",
//             message: "Your attendance in Mathematics is below 75%. Please improve your attendance.",
//             type: "warning",
//             date: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
//             read: false,
//           },
//           {
//             id: "2",
//             title: "Attendance Marked",
//             message: "Your attendance has been marked for Physics class today.",
//             type: "info",
//             date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
//             read: false,
//           },
//           {
//             id: "3",
//             title: "Perfect Attendance",
//             message: "Congratulations! You have maintained 100% attendance in Chemistry this month.",
//             type: "success",
//             date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
//             read: true,
//           },
//         ]

//         setNotifications(mockNotifications)
//         setUnreadCount(mockNotifications.filter((n) => !n.read).length)
//       }
//     }

//     fetchNotifications()

//     // Set up WebSocket connection for real-time notifications
//     const socket = new WebSocket(
//       `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/ws/notifications`,
//     )

//     socket.onmessage = (event) => {
//       try {
//         const data = JSON.parse(event.data)
//         if (data.type === "notification") {
//           // Add new notification to the list
//           setNotifications((prev) => [data.notification, ...prev])
//           setUnreadCount((prev) => prev + 1)

//           // Show browser notification if supported
//           if ("Notification" in window && Notification.permission === "granted") {
//             new Notification(data.notification.title, {
//               body: data.notification.message,
//               icon: "/logo.png",
//             })
//           }
//         }
//       } catch (error) {
//         console.error("Error processing WebSocket message:", error)
//       }
//     }

//     socket.onclose = () => {
//       console.log("WebSocket connection closed")
//       // Attempt to reconnect after 5 seconds
//       setTimeout(() => {
//         fetchNotifications()
//       }, 5000)
//     }

//     // Set up polling for new notifications as fallback
//     const intervalId = setInterval(fetchNotifications, 60000) // Poll every minute

//     // Request notification permission
//     if ("Notification" in window && Notification.permission !== "denied") {
//       Notification.requestPermission()
//     }

//     return () => {
//       clearInterval(intervalId)
//       if (socket.readyState === WebSocket.OPEN) {
//         socket.close()
//       }
//     }
//   }, [])

//   useEffect(() => {
//     // Handle clicks outside the notification panel to close it
//     const handleClickOutside = (event) => {
//       if (notificationRef.current && !notificationRef.current.contains(event.target)) {
//         setShowNotifications(false)
//       }
//     }

//     document.addEventListener("mousedown", handleClickOutside)
//     return () => document.removeEventListener("mousedown", handleClickOutside)
//   }, [])

//   const handleNotificationClick = async (notification) => {
//     if (!notification.read) {
//       try {
//         // Mark notification as read
//         await fetch(`/api/notifications/${notification.id}/read`, {
//           method: "PUT",
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
//           },
//         })

//         // Update local state
//         setNotifications(notifications.map((n) => (n.id === notification.id ? { ...n, read: true } : n)))
//         setUnreadCount((prev) => Math.max(0, prev - 1))
//       } catch (err) {
//         console.error("Error marking notification as read:", err)

//         // Update local state anyway for better UX
//         setNotifications(notifications.map((n) => (n.id === notification.id ? { ...n, read: true } : n)))
//         setUnreadCount((prev) => Math.max(0, prev - 1))
//       }
//     }
//   }

//   const markAllAsRead = async () => {
//     try {
//       // Mark all notifications as read
//       await fetch("/api/notifications/read-all", {
//         method: "PUT",
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
//         },
//       })

//       // Update local state
//       setNotifications(notifications.map((n) => ({ ...n, read: true })))
//       setUnreadCount(0)
//     } catch (err) {
//       console.error("Error marking all notifications as read:", err)

//       // Update local state anyway for better UX
//       setNotifications(notifications.map((n) => ({ ...n, read: true })))
//       setUnreadCount(0)
//     }
//   }

//   const getTimeAgo = (dateString) => {
//     const date = new Date(dateString)
//     const now = new Date()
//     const diffMs = now.getTime() - date.getTime()
//     const diffSec = Math.floor(diffMs / 1000)
//     const diffMin = Math.floor(diffSec / 60)
//     const diffHour = Math.floor(diffMin / 60)
//     const diffDay = Math.floor(diffHour / 24)

//     if (diffDay > 0) {
//       return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`
//     } else if (diffHour > 0) {
//       return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`
//     } else if (diffMin > 0) {
//       return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`
//     } else {
//       return "Just now"
//     }
//   }

//   const getNotificationColor = (type) => {
//     switch (type) {
//       case "info":
//         return "bg-primary-100 text-primary-800"
//       case "warning":
//         return "bg-warning-100 text-warning-800"
//       case "error":
//         return "bg-error-100 text-error-800"
//       case "success":
//         return "bg-success-100 text-success-800"
//       default:
//         return "bg-gray-100 text-gray-800"
//     }
//   }

//   return (
//     <div className="relative" ref={notificationRef}>
//       <button
//         onClick={() => setShowNotifications(!showNotifications)}
//         className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
//       >
//         <Bell className="h-6 w-6 text-gray-600" />
//         {unreadCount > 0 && (
//           <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-error-600 rounded-full">
//             {unreadCount > 9 ? "9+" : unreadCount}
//           </span>
//         )}
//       </button>

//       {showNotifications && (
//         <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 overflow-hidden">
//           <div className="p-3 border-b flex justify-between items-center">
//             <h3 className="font-medium text-gray-900">Notifications</h3>
//             {unreadCount > 0 && (
//               <button onClick={markAllAsRead} className="text-xs text-primary-600 hover:text-primary-800">
//                 Mark all as read
//               </button>
//             )}
//           </div>

//           <div className="max-h-96 overflow-y-auto">
//             {notifications.length === 0 ? (
//               <div className="p-4 text-center text-gray-500">No notifications</div>
//             ) : (
//               notifications.map((notification) => (
//                 <div
//                   key={notification.id}
//                   className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${!notification.read ? "bg-gray-50" : ""}`}
//                   onClick={() => handleNotificationClick(notification)}
//                 >
//                   <div className="flex justify-between items-start">
//                     <span
//                       className={`inline-block w-2 h-2 rounded-full ${!notification.read ? "bg-primary-600" : "bg-transparent"}`}
//                     ></span>
//                     <div className="flex-1 ml-2">
//                       <div className="flex justify-between">
//                         <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
//                         <span className="text-xs text-gray-500">{getTimeAgo(notification.date)}</span>
//                       </div>
//                       <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
//                       <div className="mt-1">
//                         <span className={`text-xs px-2 py-1 rounded-full ${getNotificationColor(notification.type)}`}>
//                           {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>

//           <div className="p-2 border-t text-center">
//             <button onClick={() => setShowNotifications(false)} className="text-xs text-gray-500 hover:text-gray-700">
//               Close
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// export default NotificationBell


"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Bell } from "lucide-react"

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const notificationRef = useRef(null)
  const isMounted = useRef(false)

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })

      if (!response.ok) throw new Error("Failed to fetch notifications")

      const data = await response.json()
      if (isMounted.current) {
        setNotifications(data.notifications || [])
        setUnreadCount(data.notifications?.filter((n) => !n.read).length || 0)
        setIsLoading(false)
      }
    } catch (err) {
      console.error("Error fetching notifications:", err)
      if (process.env.NODE_ENV === "development") {
        // Development fallback
        const mockNotifications = getMockNotifications()
        setNotifications(mockNotifications)
        setUnreadCount(mockNotifications.filter((n) => !n.read).length)
      }
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    isMounted.current = true
    fetchNotifications()

    // Real-time updates setup
    let socket = null
    try {
      const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:"
      socket = new WebSocket(
        `${wsProtocol}//${window.location.host}/ws/notifications?token=${localStorage.getItem("accessToken")}`,
      )

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === "notification") {
            setNotifications((prev) => [data.notification, ...prev])
            setUnreadCount((prev) => prev + 1)
            showBrowserNotification(data.notification)
          }
        } catch (error) {
          console.error("Error processing WebSocket message:", error)
        }
      }

      socket.onerror = (error) => {
        console.error("WebSocket error:", error)
      }

      socket.onclose = () => {
        console.log("WebSocket connection closed")
      }
    } catch (error) {
      console.error("Error setting up WebSocket:", error)
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") fetchNotifications()
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    const intervalId = setInterval(fetchNotifications, 60000)

    // Request notification permission
    if ("Notification" in window && Notification.permission !== "denied") {
      Notification.requestPermission()
    }

    return () => {
      isMounted.current = false
      clearInterval(intervalId)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      if (socket && socket.readyState === WebSocket.OPEN) socket.close()
    }
  }, [fetchNotifications])

  const showBrowserNotification = (notification) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(notification.title, {
        body: notification.message,
        icon: "/logo.png",
      })
    }
  }

  const handleClickOutside = (event) => {
    if (notificationRef.current && !notificationRef.current.contains(event.target)) {
      setShowNotifications(false)
    }
  }

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      try {
        await fetch(`/api/notifications/${notification.id}/read`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        })

        setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)))
        setUnreadCount((prev) => Math.max(0, prev - 1))
      } catch (err) {
        console.error("Error marking notification as read:", err)
      }
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications/read-all", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error("Error marking all as read:", err)
    }
  }

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date

    const minute = 60 * 1000
    const hour = 60 * minute
    const day = 24 * hour

    if (diffMs < minute) return "Just now"
    if (diffMs < hour) return `${Math.floor(diffMs / minute)}m ago`
    if (diffMs < day) return `${Math.floor(diffMs / hour)}h ago`
    return `${Math.floor(diffMs / day)}d ago`
  }

  const getNotificationColor = (type) => {
    const colors = {
      info: "bg-blue-100 text-blue-800",
      warning: "bg-yellow-100 text-yellow-800",
      error: "bg-red-100 text-red-800",
      success: "bg-green-100 text-green-800",
    }
    return colors[type] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="relative" ref={notificationRef}>
      <button
        aria-label="Notifications"
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <Bell className="h-6 w-6 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div role="menu" className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="p-3 border-b flex justify-between items-center">
            <h3 className="font-medium text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:text-blue-800">
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No notifications</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${!notification.read ? "bg-gray-50" : ""}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={`shrink-0 mt-1 w-2 h-2 rounded-full ${
                        !notification.read ? "bg-blue-600" : "bg-transparent"
                      }`}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                        <span className="text-xs text-gray-500">{getTimeAgo(notification.date)}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
                      <div className="mt-2">
                        <span
                          className={`inline-block text-xs px-2 py-1 rounded-full ${getNotificationColor(
                            notification.type,
                          )}`}
                        >
                          {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Helper function for mock data
const getMockNotifications = () => [
  {
    id: "1",
    title: "Low Attendance Warning",
    message: "Your attendance in Mathematics is below 75%",
    type: "warning",
    date: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    read: false,
  },
  {
    id: "2",
    title: "Attendance Marked",
    message: "Your attendance has been marked for Physics class today.",
    type: "info",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    read: false,
  },
  {
    id: "3",
    title: "Perfect Attendance",
    message: "Congratulations! You have maintained 100% attendance in Chemistry this month.",
    type: "success",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    read: true,
  },
]

export default NotificationBell
