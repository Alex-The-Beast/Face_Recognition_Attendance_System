"use client"

import { useState, useRef } from "react"
import { Upload, FileText, Check, X, AlertCircle, Download } from "lucide-react"
import faceService from "../../services/faceService"

const BatchFaceRegistration = () => {
  const [file, setFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState(null)
  const [errorMessage, setErrorMessage] = useState("")
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile)
      setErrorMessage("")
    } else {
      setFile(null)
      setErrorMessage("Please select a valid CSV file")
    }
  }

  const handleUpload = async () => {
    if (!file) return

    try {
      setIsUploading(true)
      setErrorMessage("")
      setUploadResult(null)

      const result = await faceService.batchRegisterFaces(file)

      setUploadResult(result)
    } catch (error) {
      console.error("Error uploading batch registration:", error)
      setErrorMessage(error.message || "Failed to process batch registration")
    } finally {
      setIsUploading(false)
    }
  }

  const downloadTemplate = () => {
    // Create CSV template content
    const templateContent =
      "user_id,name,image_data\n" +
      "user123,John Doe,base64_encoded_image_data\n" +
      "user456,Jane Smith,base64_encoded_image_data\n" +
      "\nNote: Replace base64_encoded_image_data with actual base64 encoded image data"

    // Create blob and download
    const blob = new Blob([templateContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "face_registration_template.csv"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Batch Face Registration</h2>

      {errorMessage && (
        <div className="mb-4 p-3 bg-error-50 text-error-700 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          Upload a CSV file containing user IDs, names, and base64-encoded face images for batch registration.
        </p>
        <button
          onClick={downloadTemplate}
          className="text-primary-600 hover:text-primary-700 text-sm flex items-center"
        >
          <Download className="h-4 w-4 mr-1" />
          Download CSV Template
        </button>
      </div>

      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 transition-colors mb-4"
        onClick={() => fileInputRef.current?.click()}
      >
        {file ? (
          <div className="flex items-center justify-center">
            <FileText className="h-8 w-8 text-primary-600 mr-2" />
            <div className="text-left">
              <p className="text-primary-600 font-medium">{file.name}</p>
              <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
            </div>
          </div>
        ) : (
          <>
            <Upload className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-500 mb-2">Click to upload or drag and drop</p>
            <p className="text-xs text-gray-400">CSV file with user data and face images</p>
          </>
        )}
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />
      </div>

      <button
        onClick={handleUpload}
        disabled={!file || isUploading}
        className={`w-full py-2 px-4 rounded-md ${
          !file || isUploading ? "bg-gray-400" : "bg-primary-600 hover:bg-primary-700"
        } text-white mb-4`}
      >
        {isUploading ? "Processing..." : "Upload and Process"}
      </button>

      {uploadResult && (
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-2">Registration Results</h3>
          <div className="space-y-2">
            <div className="flex items-center text-success-600">
              <Check className="h-5 w-5 mr-1" />
              <span>Successfully registered: {uploadResult.registered?.length || 0} users</span>
            </div>
            {uploadResult.failed && uploadResult.failed.length > 0 && (
              <div>
                <div className="flex items-center text-error-600 mb-1">
                  <X className="h-5 w-5 mr-1" />
                  <span>Failed: {uploadResult.failed.length} users</span>
                </div>
                <div className="max-h-40 overflow-y-auto bg-gray-50 p-2 rounded text-sm">
                  {uploadResult.failed.map((failure, index) => (
                    <div key={index} className="mb-1">
                      <span className="font-medium">{failure.user_id || "Unknown"}:</span> {failure.reason}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default BatchFaceRegistration
