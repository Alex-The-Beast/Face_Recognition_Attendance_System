"use client"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import  faceService from "../../services/faceService"
import userService from "../../services/userService"
import { toast } from "react-toastify"

const { registerFace} = faceService
const {updateUserPhoto}=userService

const FaceRegistration = ({ onSuccess, userId, userName }) => {
  const { currentUser } = useAuth()
  const [isCapturing, setIsCapturing] = useState(false)
  const [capturedImage, setCapturedImage] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [registrationStatus, setRegistrationStatus] = useState("idle")
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  // Use provided userId or fallback to current user
  const targetUserId = userId || currentUser?.id
  const targetUserName = userName || currentUser?.name

  useEffect(() => {
    return () => {
      // Clean up video stream when component unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  // const startCamera = async () => {
  //   try {
  //     const stream = await navigator.mediaDevices.getUserMedia({
  //       video: {
  //         width: { ideal: 640 },
  //         height: { ideal: 480 },
  //         facingMode: "user",
  //       },
  //     })

  //     if (videoRef.current) {
  //       videoRef.current.srcObject = stream
  //       streamRef.current = stream
  //       setIsCapturing(true)
  //     }
  //   } catch (err) {
  //     console.error("Error accessing camera:", err)
  //     toast.error("Could not access camera. Please check permissions.")
  //   }
  // }

  // const startCamera = async () => {
  //   try {
  //     const stream = await navigator.mediaDevices.getUserMedia({
  //       video: {
  //         width: { ideal: 640 },
  //         height: { ideal: 480 },
  //         facingMode: "user",
  //       },
  //     })
  
  //     if (videoRef.current) {
  //       videoRef.current.srcObject = stream
  //       streamRef.current = stream
  
  //       videoRef.current.onloadedmetadata = () => {
  //         videoRef.current.play()
  //         setIsCapturing(true)
  //       }
  //     }
  //   } catch (err) {
  //     console.error("Error accessing camera:", err)
  //     toast.error("Could not access camera. Please check permissions.")
  //   }
  // }
  
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
        audio: false, // Disable audio to avoid permission prompts
      })
  
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
  
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play()
          setIsCapturing(true)
        }
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
      toast.error("Could not access camera. Please check permissions.")
    }
  }
  

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
      setIsCapturing(false)
    }
  }

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const context = canvas.getContext("2d")
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      const imageData = canvas.toDataURL("image/jpeg")
      setCapturedImage(imageData)
      stopCamera()
    }
  }

  const retakeImage = () => {
    setCapturedImage(null)
    startCamera()
  }

  const uploadImage = async () => {
    if (!capturedImage || !targetUserId) return

    setIsUploading(true)
    setRegistrationStatus("registering")

    try {
      // Register face with the face recognition service
      const result = await registerFace(targetUserId, targetUserName, capturedImage)

      if (result.success) {
        // Update user profile with the photo
        await updateUserPhoto(targetUserId, capturedImage)

        toast.success("Face registered successfully!")
        setRegistrationStatus("success")

        if (onSuccess) {
          onSuccess(capturedImage)
        }
      } else {
        toast.error(result.message || "Failed to register face")
        setRegistrationStatus("error")
      }
    } catch (error) {
      console.error("Error registering face:", error)
      toast.error("An error occurred while registering your face")
      setRegistrationStatus("error")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Face Registration</h2>

      <div className="mb-4 rounded-lg overflow-hidden bg-gray-100 relative">
        {isCapturing ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-auto"
            style={{ maxHeight: "320px", objectFit: "cover" }}
          />
        ) : capturedImage ? (
          <img
            src={capturedImage || "/placeholder.svg"}
            alt="Captured face"
            className="w-full h-auto"
            style={{ maxHeight: "320px", objectFit: "cover" }}
          />
        ) : (
          <div className="flex items-center justify-center h-64 bg-gray-200">
            <p className="text-gray-500">Camera is off</p>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex flex-col space-y-3">
        {!isCapturing && !capturedImage ? (
          <button
            onClick={startCamera}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
          >
            Start Camera
          </button>
        ) : isCapturing ? (
          <button
            onClick={captureImage}
            className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition"
          >
            Capture Photo
          </button>
        ) : (
          <>
            <div className="flex space-x-3">
              <button
                onClick={retakeImage}
                className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition flex-1"
              >
                Retake
              </button>
              <button
                onClick={uploadImage}
                disabled={isUploading}
                className={`${
                  isUploading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                } text-white py-2 px-4 rounded-md transition flex-1`}
              >
                {isUploading ? "Processing..." : "Register Face"}
              </button>
            </div>
          </>
        )}
      </div>

      {registrationStatus === "registering" && (
        <div className="mt-4 text-center text-blue-600">
          <p>Registering your face...</p>
        </div>
      )}

      {registrationStatus === "success" && (
        <div className="mt-4 text-center text-green-600">
          <p>Face registered successfully!</p>
        </div>
      )}

      {registrationStatus === "error" && (
        <div className="mt-4 text-center text-red-600">
          <p>Failed to register face. Please try again.</p>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500">
        <p>Please ensure:</p>
        <ul className="list-disc pl-5 mt-1">
          <li>Your face is clearly visible</li>
          <li>The lighting is good</li>
          <li>You're looking directly at the camera</li>
          <li>No other faces are in the frame</li>
        </ul>
      </div>
    </div>
  )
}

export default FaceRegistration
