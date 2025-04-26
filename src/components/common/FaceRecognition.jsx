"use client"

import { useState, useRef, useEffect } from "react"
import { Camera, Upload, RefreshCw, Check, AlertCircle, Users } from "lucide-react"
import faceService from "../../services/faceService"

const FaceRecognition = ({
  onRecognition,
  classId,
  date = new Date().toISOString().split("T")[0],
  time = new Date().toTimeString().split(" ")[0],
}) => {
  const [activeTab, setActiveTab] = useState("camera")
  const [cameraStream, setCameraStream] = useState(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [capturedImage, setCapturedImage] = useState(null)
  const [recognitionResult, setRecognitionResult] = useState(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [facesDetected, setFacesDetected] = useState(0)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState("")

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)

  // Start camera when component mounts or tab changes to camera
  useEffect(() => {
    if (activeTab === "camera") {
      startCamera()
    } else {
      stopCamera()
    }

    return () => {
      stopCamera()
    }
  }, [activeTab])

  const startCamera = async () => {
    try {
      setErrorMessage("")
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })

      setCameraStream(stream)

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      setErrorMessage("Could not access camera. Please ensure camera permissions are granted and try again.")
    }
  }

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop())
      setCameraStream(null)
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return

    setIsCapturing(true)

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert canvas to base64 image
    const imageData = canvas.toDataURL("image/jpeg")
    setCapturedImage(imageData)
    setIsCapturing(false)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setSelectedFile(file)

    // Create preview URL
    const reader = new FileReader()
    reader.onload = () => {
      setPreviewUrl(reader.result)
      setCapturedImage(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const processImage = async () => {
    if (!capturedImage) return

    try {
      setIsProcessing(true)
      setErrorMessage("")

      // Process the image with face recognition service
      const result = await faceService.verifyFace(capturedImage, classId, date, time)

      setRecognitionResult(result)
      setFacesDetected(result.recognized_students?.length || 0)

      if (onRecognition) {
        onRecognition({
          recognizedStudents: result.recognized_students || [],
          emotionData: result.emotion_data || {},
          attentionData: result.attention_data || {},
          imageData: capturedImage,
          photoUrl: result.photo_url,
        })
      }
    } catch (error) {
      console.error("Error processing image:", error)
      setErrorMessage(error.message || "Failed to process image")
    } finally {
      setIsProcessing(false)
    }
  }

  const resetCapture = () => {
    setCapturedImage(null)
    setRecognitionResult(null)
    setFacesDetected(0)
    setErrorMessage("")

    if (activeTab === "camera") {
      startCamera()
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Face Recognition Attendance</h2>

      {/* Tabs */}
      <div className="flex border-b mb-4">
        <button
          className={`px-4 py-2 ${activeTab === "camera" ? "border-b-2 border-primary-600 text-primary-600" : "text-gray-500"}`}
          onClick={() => setActiveTab("camera")}
        >
          <Camera className="h-5 w-5 inline-block mr-1" />
          Camera
        </button>
        <button
          className={`px-4 py-2 ${activeTab === "upload" ? "border-b-2 border-primary-600 text-primary-600" : "text-gray-500"}`}
          onClick={() => setActiveTab("upload")}
        >
          <Upload className="h-5 w-5 inline-block mr-1" />
          Upload Photo
        </button>
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-error-50 text-error-700 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Camera view */}
      {activeTab === "camera" && !capturedImage && (
        <div className="mb-4">
          <div className="relative bg-black rounded-lg overflow-hidden mb-4" style={{ minHeight: "320px" }}>
            <video ref={videoRef} autoPlay playsInline className="w-full h-auto" style={{ maxHeight: "480px" }} />
          </div>
          <button
            onClick={captureImage}
            disabled={!cameraStream || isCapturing}
            className={`w-full py-2 px-4 rounded-md ${!cameraStream || isCapturing ? "bg-gray-400" : "bg-primary-600 hover:bg-primary-700"} text-white`}
          >
            {isCapturing ? "Capturing..." : "Capture Photo"}
          </button>
        </div>
      )}

      {/* Upload view */}
      {activeTab === "upload" && !capturedImage && (
        <div className="mb-4">
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-500 mb-2">Click to upload or drag and drop</p>
            <p className="text-xs text-gray-400">PNG, JPG or JPEG (max. 5MB)</p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/jpg"
              className="hidden"
            />
          </div>
        </div>
      )}

      {/* Captured image */}
      {capturedImage && (
        <div className="mb-4">
          <div className="relative bg-black rounded-lg overflow-hidden mb-4">
            <img
              src={capturedImage || "/placeholder.svg"}
              alt="Captured"
              className="w-full h-auto"
              style={{ maxHeight: "480px" }}
            />
          </div>

          {!recognitionResult ? (
            <div className="flex space-x-2">
              <button
                onClick={resetCapture}
                className="flex-1 py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-md"
              >
                <RefreshCw className="h-5 w-5 inline-block mr-1" />
                Retake
              </button>
              <button
                onClick={processImage}
                disabled={isProcessing}
                className={`flex-1 py-2 px-4 ${isProcessing ? "bg-primary-400" : "bg-primary-600 hover:bg-primary-700"} text-white rounded-md`}
              >
                {isProcessing ? "Processing..." : "Recognize Faces"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2 flex items-center">
                  <Users className="h-5 w-5 mr-1 text-primary-600" />
                  Recognition Results
                </h3>

                {facesDetected > 0 ? (
                  <div className="text-sm">
                    <p className="text-success-600 flex items-center">
                      <Check className="h-4 w-4 mr-1" />
                      Recognized {facesDetected} student{facesDetected !== 1 ? "s" : ""}
                    </p>
                    {recognitionResult.emotion_data && Object.keys(recognitionResult.emotion_data).length > 0 && (
                      <p className="mt-1">
                        Emotions detected: {Object.values(recognitionResult.emotion_data).join(", ")}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No students recognized in this image.</p>
                )}
              </div>

              <button
                onClick={resetCapture}
                className="w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-md"
              >
                <RefreshCw className="h-5 w-5 inline-block mr-1" />
                Take Another Photo
              </button>
            </div>
          )}
        </div>
      )}

      {/* Hidden canvas for capturing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

export default FaceRecognition
