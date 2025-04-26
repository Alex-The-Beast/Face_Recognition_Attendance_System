"use client"

import { useState } from "react"
import { AlertCircle, CheckCircle, FileText } from "lucide-react"
import attendanceService from "../../services/attendanceService"

const AttendanceDisputeForm = ({ attendanceId, className, date, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    reason: "",
    attachmentUrl: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [attachment, setAttachment] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAttachment(file)

      // Create a preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          attachmentUrl: reader.result,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)
      setError(null)

      // Validate form
      if (!formData.reason) {
        throw new Error("Reason is required")
      }

      // Submit dispute
      await attendanceService.submitDispute(attendanceId, formData.reason)

      setSuccess("Attendance dispute submitted successfully")

      // Call onSubmit callback
      if (onSubmit) {
        onSubmit()
      }

      // Reset form after 2 seconds
      setTimeout(() => {
        setFormData({
          reason: "",
          attachmentUrl: "",
        })
        setAttachment(null)
        setSuccess(null)
      }, 2000)
    } catch (err) {
      console.error("Error submitting attendance dispute:", err)
      setError(err instanceof Error ? err.message : "Failed to submit attendance dispute")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Dispute</h3>

      <div className="mb-4 p-3 bg-gray-50 rounded-md">
        <p className="text-sm text-gray-700">
          <span className="font-medium">Class:</span> {className}
        </p>
        <p className="text-sm text-gray-700">
          <span className="font-medium">Date:</span> {new Date(date).toLocaleDateString()}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-error-50 text-error-700 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-success-50 text-success-700 rounded-md flex items-center">
          <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
            Reason for Dispute *
          </label>
          <textarea
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
            placeholder="Please explain why you believe this attendance record is incorrect..."
          ></textarea>
        </div>

        <div className="mb-6">
          <label htmlFor="attachment" className="block text-sm font-medium text-gray-700 mb-1">
            Supporting Evidence (Optional)
          </label>
          <div className="flex items-center">
            <label className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
              <FileText className="h-5 w-5 mr-2" />
              <span>Upload File</span>
              <input
                type="file"
                id="attachment"
                name="attachment"
                onChange={handleFileChange}
                className="sr-only"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
            </label>
            {formData.attachmentUrl && (
              <span className="ml-3 text-sm text-gray-500">{attachment?.name || "File uploaded"}</span>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">Accepted file types: PDF, JPG, PNG, DOC, DOCX (max 5MB)</p>
        </div>

        <div className="flex justify-end space-x-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {loading ? "Submitting..." : "Submit Dispute"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AttendanceDisputeForm
