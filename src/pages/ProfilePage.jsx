// "use client"

// import { useState, useEffect, useRef } from "react"
// import { useAuth } from "../contexts/AuthContext"
// import { toast } from "react-toastify"
// import { User, Mail, Key, Save, Camera, AlertCircle } from "lucide-react"
// import faceService from "../services/faceService"
// import  userService from "../services/userService"
// // import userService from "../services/userService"
// const { getUserProfile,updateUserProfile } = userService
// // import  {getUserProfile, updateUserProfile}  from "../services/userService"


// const ProfilePage = () => {
//   const { currentUser, updateUser } = useAuth()
//   const [profile, setProfile] = useState({
//     name: currentUser?.name || "",
//     email: currentUser?.email || "",
//     role: currentUser?.role || "",
//     department: "",
//     studentId: "",
//     employeeId: "",
//   })
//   const [isLoading, setIsLoading] = useState(true)
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [showFaceRegistration, setShowFaceRegistration] = useState(false)
//   const [profilePhoto, setProfilePhoto] = useState(null)
//   const [loading, setLoading] = useState(false)
//   const [message, setMessage] = useState({ type: "", text: "" })
//   const [faceRegistered, setFaceRegistered] = useState(false)
//   const [showCamera, setShowCamera] = useState(false)
//   const [stream, setStream] = useState(null)
//   const [capturedImage, setCapturedImage] = useState(null)
//   const [passwordData, setPasswordData] = useState({
//     currentPassword: "",
//     newPassword: "",
//     confirmPassword: "",
//   })
//   const [passwordError, setPasswordError] = useState("")

//   const videoRef = useRef(null)
//   const canvasRef = useRef(null)

//   useEffect(() => {
//     const fetchProfile = async () => {
//       try {
//         setIsLoading(true)

//         // Try to get user profile from API
//         try {
//           const userData = await getUserProfile()
//           setProfile({
//             name: userData.name || currentUser?.name || "",
//             email: userData.email || currentUser?.email || "",
//             role: userData.role || currentUser?.role || "",
//             department: userData.department || "",
//             studentId: userData.studentId || "",
//             employeeId: userData.employeeId || "",
//           })

//           if (userData.profilePhoto) {
//             setProfilePhoto(userData.profilePhoto)
//           }
//           setFaceRegistered(!!userData.faceData)
//         } catch (error) {
//           console.error("Error fetching profile from API:", error)
//           // Fallback to currentUser from context
//           if (currentUser) {
//             setProfile({
//               name: currentUser.name || "",
//               email: currentUser.email || "",
//               role: currentUser.role || "",
//               department: "",
//               studentId: "",
//               employeeId: "",
//             })
//           }
//         }
//       } catch (error) {
//         console.error("Error in profile setup:", error)
//         toast.error("Failed to load profile data")
//       } finally {
//         setIsLoading(false)
//       }
//     }

//     fetchProfile()

//     // Clean up function
//     return () => {
//       if (stream) {
//         stream.getTracks().forEach((track) => track.stop())
//       }
//     }
//   }, [currentUser])

//   const handleChange = (e) => {
//     const { name, value } = e.target
//     setProfile((prev) => ({
//       ...prev,
//       [name]: value,
//     }))
//   }

//   const handlePasswordChange = (e) => {
//     const { name, value } = e.target
//     setPasswordData((prev) => ({
//       ...prev,
//       [name]: value,
//     }))
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()

//     try {
//       setIsSubmitting(true)
//       setMessage({ type: "", text: "" })

//       // Call API to update profile
//       try {
//         await updateUserProfile(profile)

//         // Update user in context
//         updateUser({
//           name: profile.name,
//           email: profile.email,
//         })

//         setMessage({ type: "success", text: "Profile updated successfully!" })
//         toast.success("Profile updated successfully!")
//       } catch (error) {
//         console.error("Error updating profile:", error)
//         setMessage({ type: "error", text: "Failed to update profile." })
//         toast.error("Failed to update profile.")
//       }
//     } catch (error) {
//       console.error("Error in form submission:", error)
//       setMessage({ type: "error", text: "An unexpected error occurred." })
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   const handlePasswordSubmit = async (e) => {
//     e.preventDefault()
//     setPasswordError("")

//     // Validate passwords
//     if (passwordData.newPassword !== passwordData.confirmPassword) {
//       setPasswordError("New passwords don't match")
//       return
//     }

//     if (passwordData.newPassword.length < 6) {
//       setPasswordError("Password must be at least 6 characters")
//       return
//     }

//     try {
//       setLoading(true)

//       // Call API to change password
//       const response = await fetch("/api/users/change-password", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
//         },
//         body: JSON.stringify({
//           currentPassword: passwordData.currentPassword,
//           newPassword: passwordData.newPassword,
//         }),
//       })

//       if (response.ok) {
//         toast.success("Password changed successfully")
//         setPasswordData({
//           currentPassword: "",
//           newPassword: "",
//           confirmPassword: "",
//         })
//       } else {
//         const data = await response.json()
//         setPasswordError(data.message || "Failed to change password")
//         toast.error(data.message || "Failed to change password")
//       }
//     } catch (error) {
//       console.error("Error changing password:", error)
//       setPasswordError("An error occurred while changing password")
//       toast.error("An error occurred while changing password")
//     } finally {
//       setLoading(false)
//     }
//   }

//   const startCamera = async () => {
//     try {
//       setMessage({ type: "", text: "" })
//       const mediaStream = await navigator.mediaDevices.getUserMedia({
//         video: {
//           width: { ideal: 640 },
//           height: { ideal: 480 },
//           facingMode: "user",
//         },
//       })

//       setStream(mediaStream)
//       setShowCamera(true)
//       setCapturedImage(null)

//       if (videoRef.current) {
//         videoRef.current.srcObject = mediaStream
//       }
//     } catch (error) {
//       console.error("Error accessing camera:", error)
//       setMessage({
//         type: "error",
//         text: "Failed to access camera. Please check permissions.",
//       })
//     }
//   }

//   const captureImage = () => {
//     if (!videoRef.current || !canvasRef.current) return

//     const video = videoRef.current
//     const canvas = canvasRef.current

//     canvas.width = video.videoWidth
//     canvas.height = video.videoHeight

//     const context = canvas.getContext("2d")
//     context.drawImage(video, 0, 0, canvas.width, canvas.height)

//     const imageData = canvas.toDataURL("image/jpeg")
//     setCapturedImage(imageData)
//   }

//   const registerFace = async () => {
//     if (!capturedImage || !currentUser?.id) return

//     try {
//       setLoading(true)
//       setMessage({ type: "", text: "" })

//       const response = await faceService.registerFace(currentUser.id, profile.name || currentUser.name, capturedImage)

//       if (response.success) {
//         setMessage({
//           type: "success",
//           text: "Face registered successfully",
//         })
//         setFaceRegistered(true)
//         setShowCamera(false)
//         setProfilePhoto(capturedImage)

//         // Stop camera stream
//         if (stream) {
//           stream.getTracks().forEach((track) => track.stop())
//           setStream(null)
//         }

//         toast.success("Face registered successfully")
//       } else {
//         throw new Error(response.message || "Failed to register face")
//       }
//     } catch (error) {
//       console.error("Error registering face:", error)
//       setMessage({
//         type: "error",
//         text: error.message || "Failed to register face",
//       })
//       toast.error(error.message || "Failed to register face")
//     } finally {
//       setLoading(false)
//     }
//   }

//   const retakePhoto = () => {
//     setCapturedImage(null)
//   }

//   const closeCamera = () => {
//     setShowCamera(false)
//     setCapturedImage(null)

//     // Stop camera stream
//     if (stream) {
//       stream.getTracks().forEach((track) => track.stop())
//       setStream(null)
//     }
//   }

//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     )
//   }

//   return (
//     <div className="max-w-4xl mx-auto p-6">
//       <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

//       {message.text && (
//         <div
//           className={`mb-6 p-4 rounded-md ${
//             message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
//           }`}
//         >
//           {message.type === "error" ? (
//             <div className="flex items-center">
//               <AlertCircle className="h-5 w-5 mr-2" />
//               <span>{message.text}</span>
//             </div>
//           ) : (
//             message.text
//           )}
//         </div>
//       )}

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//         {/* Profile Information */}
//         <div className="bg-white rounded-lg shadow-md p-6">
//           <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
//           <form onSubmit={handleSubmit}>
//             <div className="mb-4">
//               <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
//                 Full Name
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <User className="h-5 w-5 text-gray-400" />
//                 </div>
//                 <input
//                   id="name"
//                   type="text"
//                   name="name"
//                   value={profile.name}
//                   onChange={handleChange}
//                   className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
//                 />
//               </div>
//             </div>

//             <div className="mb-4">
//               <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
//                 Email Address
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Mail className="h-5 w-5 text-gray-400" />
//                 </div>
//                 <input
//                   id="email"
//                   type="email"
//                   name="email"
//                   value={profile.email}
//                   onChange={handleChange}
//                   className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
//                 />
//               </div>
//             </div>

//             <div className="mt-6">
//               <button
//                 type="submit"
//                 disabled={isSubmitting}
//                 className="flex items-center justify-center w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
//               >
//                 {isSubmitting ? (
//                   <span className="flex items-center">
//                     <svg
//                       className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
//                       xmlns="http://www.w3.org/2000/svg"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                     >
//                       <circle
//                         className="opacity-25"
//                         cx="12"
//                         cy="12"
//                         r="10"
//                         stroke="currentColor"
//                         strokeWidth="4"
//                       ></circle>
//                       <path
//                         className="opacity-75"
//                         fill="currentColor"
//                         d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                       ></path>
//                     </svg>
//                     Updating...
//                   </span>
//                 ) : (
//                   <span className="flex items-center">
//                     <Save className="h-5 w-5 mr-2" />
//                     Save Changes
//                   </span>
//                 )}
//               </button>
//             </div>
//           </form>
//         </div>

//         {/* Face Registration */}
//         <div className="bg-white rounded-lg shadow-md p-6">
//           <h2 className="text-xl font-semibold text-gray-900 mb-4">Face Recognition</h2>

//           {!showCamera ? (
//             <div className="text-center">
//               <div className="mb-4">
//                 {profilePhoto ? (
//                   <div className="mb-4">
//                     <img
//                       src={profilePhoto || "/placeholder.svg"}
//                       alt="Profile"
//                       className="w-32 h-32 rounded-full mx-auto object-cover border-2 border-gray-200"
//                     />
//                   </div>
//                 ) : null}

//                 {faceRegistered ? (
//                   <div className="p-4 bg-success-50 text-success-700 rounded-md">
//                     <p>Your face has been registered for attendance.</p>
//                   </div>
//                 ) : (
//                   <div className="p-4 bg-gray-50 text-gray-700 rounded-md">
//                     <p>Register your face to use the facial recognition attendance system.</p>
//                   </div>
//                 )}
//               </div>
//               <button
//                 onClick={startCamera}
//                 className="flex items-center justify-center mx-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
//               >
//                 <Camera className="h-5 w-5 mr-2" />
//                 {faceRegistered ? "Update Face Data" : "Register Face"}
//               </button>
//             </div>
//           ) : (
//             <div className="text-center">
//               {!capturedImage ? (
//                 <>
//                   <div className="relative mb-4 bg-black rounded-lg overflow-hidden">
//                     <video
//                       id="camera-feed"
//                       autoPlay
//                       playsInline
//                       ref={videoRef}
//                       className="w-full h-64 object-cover"
//                     ></video>
//                   </div>
//                   <div className="flex justify-center space-x-4">
//                     <button
//                       onClick={captureImage}
//                       className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
//                     >
//                       Capture
//                     </button>
//                     <button
//                       onClick={closeCamera}
//                       className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 </>
//               ) : (
//                 <>
//                   <div className="mb-4 bg-black rounded-lg overflow-hidden">
//                     <img
//                       src={capturedImage || "/placeholder.svg"}
//                       alt="Captured"
//                       className="w-full h-64 object-cover"
//                     />
//                   </div>
//                   <div className="flex justify-center space-x-4">
//                     <button
//                       onClick={registerFace}
//                       disabled={loading}
//                       className="px-4 py-2 bg-success-600 text-white rounded-md hover:bg-success-700 focus:outline-none focus:ring-2 focus:ring-success-500"
//                     >
//                       {loading ? "Processing..." : "Register"}
//                     </button>
//                     <button
//                       onClick={retakePhoto}
//                       className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
//                     >
//                       Retake
//                     </button>
//                   </div>
//                 </>
//               )}
//             </div>
//           )}

//           <canvas ref={canvasRef} className="hidden" />
//         </div>

//         {/* Change Password */}
//         <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
//           <h2 className="text-xl font-semibold text-gray-900 mb-4">Change Password</h2>
//           {passwordError && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">{passwordError}</div>}
//           <form onSubmit={handlePasswordSubmit}>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div>
//                 <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
//                   Current Password
//                 </label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <Key className="h-5 w-5 text-gray-400" />
//                   </div>
//                   <input
//                     id="currentPassword"
//                     name="currentPassword"
//                     type="password"
//                     value={passwordData.currentPassword}
//                     onChange={handlePasswordChange}
//                     className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
//                   New Password
//                 </label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <Key className="h-5 w-5 text-gray-400" />
//                   </div>
//                   <input
//                     id="newPassword"
//                     name="newPassword"
//                     type="password"
//                     value={passwordData.newPassword}
//                     onChange={handlePasswordChange}
//                     className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
//                   Confirm Password
//                 </label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <Key className="h-5 w-5 text-gray-400" />
//                   </div>
//                   <input
//                     id="confirmPassword"
//                     name="confirmPassword"
//                     type="password"
//                     value={passwordData.confirmPassword}
//                     onChange={handlePasswordChange}
//                     className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
//                   />
//                 </div>
//               </div>
//             </div>

//             <div className="mt-6">
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
//               >
//                 {loading ? "Updating..." : "Change Password"}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default ProfilePage


"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import userService from "../services/userService"
import { toast } from "react-toastify"
import { User, Mail, Key, Save, Camera, AlertCircle } from 'lucide-react'
import faceService from "../services/faceService"

const ProfilePage = () => {
  const { currentUser, updateUser } = useAuth()
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    role: "",
    department: "",
    studentId: "",
    employeeId: "",
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [profilePhoto, setProfilePhoto] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })
  const [faceRegistered, setFaceRegistered] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [stream, setStream] = useState(null)
  const [capturedImage, setCapturedImage] = useState(null)
  const [passwordError, setPasswordError] = useState("")

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true)
        if (!currentUser || !currentUser.id) {
          console.error("No current user found")
          return
        }

        const userData = await userService.getUserProfile()
        setProfile({
          name: userData.name || "",
          email: userData.email || "",
          role: userData.role || "",
          department: userData.department || "",
          studentId: userData.studentId || "",
          employeeId: userData.employeeId || "",
        })

        if (userData.profilePhoto) {
          setProfilePhoto(userData.profilePhoto)
        }
        setFaceRegistered(!!userData.faceData)
      } catch (error) {
        console.error("Error fetching profile:", error)
        toast.error("Failed to load profile data")
      } finally {
        setIsLoading(false)
      }
    }

    if (currentUser) {
      fetchProfile()
    }
  }, [currentUser])

  const handleChange = (e) => {
    const { name, value } = e.target
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setIsSubmitting(true)
      await userService.updateUserProfile(profile)
      updateUser({
        name: profile.name,
        email: profile.email,
      })
      toast.success("Profile updated successfully!")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordError("")

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New password and confirmation do not match")
      return
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long")
      return
    }

    try {
      setIsChangingPassword(true)
      await userService.changePassword(passwordData)
      toast.success("Password changed successfully!")
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      console.error("Error changing password:", error)
      setPasswordError(error.response?.data?.message || "Failed to change password")
    } finally {
      setIsChangingPassword(false)
    }
  }

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true })
      setStream(mediaStream)
      setShowCamera(true)
      setCapturedImage(null)
    } catch (error) {
      console.error("Error accessing camera:", error)
      setMessage({
        type: "error",
        text: "Failed to access camera. Please check permissions.",
      })
    }
  }

  const captureImage = () => {
    const video = document.getElementById("camera-feed")
    if (!video) {
      console.error("Video element not found")
      return
    }
    
    const canvas = document.createElement("canvas")
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height)

    const imageDataUrl = canvas.toDataURL("image/jpeg")
    setCapturedImage(imageDataUrl)
  }

  const registerFace = async () => {
    if (!capturedImage || !currentUser || !currentUser.id) return

    try {
      setLoading(true)
      setMessage({ type: "", text: "" })

      const response = await faceService.registerFace(currentUser.id, capturedImage)

      if (response.success) {
        setMessage({
          type: "success",
          text: "Face registered successfully",
        })
        setFaceRegistered(true)
        setShowCamera(false)

        // Stop camera stream
        if (stream) {
          stream.getTracks().forEach((track) => track.stop())
          setStream(null)
        }
      }
    } catch (error) {
      console.error("Error registering face:", error)
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to register face",
      })
    } finally {
      setLoading(false)
    }
  }

  const retakePhoto = () => {
    setCapturedImage(null)
  }

  const closeCamera = () => {
    setShowCamera(false)
    setCapturedImage(null)

    // Stop camera stream
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      {message.text && (
        <div
          className={`mb-6 p-4 rounded-md ${
            message.type === "success" ? "bg-success-50 text-success-700" : "bg-error-50 text-error-700"
          }`}
        >
          {message.type === "error" ? (
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{message.text}</span>
            </div>
          ) : (
            message.text
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Updating...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Save className="h-5 w-5 mr-2" />
                    Save Changes
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Face Registration */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Face Recognition</h2>

          {!showCamera ? (
            <div className="text-center">
              <div className="mb-4">
                {faceRegistered ? (
                  <div className="p-4 bg-success-50 text-success-700 rounded-md">
                    <p>Your face has been registered for attendance.</p>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 text-gray-700 rounded-md">
                    <p>Register your face to use the facial recognition attendance system.</p>
                  </div>
                )}
              </div>
              <button
                onClick={startCamera}
                className="flex items-center justify-center mx-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Camera className="h-5 w-5 mr-2" />
                {faceRegistered ? "Update Face Data" : "Register Face"}
              </button>
            </div>
          ) : (
            <div className="text-center">
              {!capturedImage ? (
                <>
                  <div className="relative mb-4 bg-black rounded-lg overflow-hidden">
                    <video
                      id="camera-feed"
                      autoPlay
                      playsInline
                      ref={(videoElement) => {
                        if (videoElement && stream) {
                          videoElement.srcObject = stream
                        }
                      }}
                      className="w-full h-64 object-cover"
                    ></video>
                  </div>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={captureImage}
                      className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      Capture
                    </button>
                    <button
                      onClick={closeCamera}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-4 bg-black rounded-lg overflow-hidden">
                    <img
                      src={capturedImage || "/placeholder.svg"}
                      alt="Captured"
                      className="w-full h-64 object-cover"
                    />
                  </div>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={registerFace}
                      disabled={loading}
                      className="px-4 py-2 bg-success-600 text-white rounded-md hover:bg-success-700 focus:outline-none focus:ring-2 focus:ring-success-500"
                    >
                      {loading ? "Processing..." : "Register"}
                    </button>
                    <button
                      onClick={retakePhoto}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Retake
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Change Password</h2>
          {passwordError && (
            <div className="mb-4 p-3 bg-error-50 text-error-700 rounded-md flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{passwordError}</span>
            </div>
          )}
          <form onSubmit={handlePasswordSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="currentPassword"
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="newPassword"
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={isChangingPassword}
                className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {isChangingPassword ? "Updating..." : "Change Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
