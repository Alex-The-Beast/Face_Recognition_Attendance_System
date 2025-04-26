"use client"

import { useState } from "react"
import { Calendar, AlertCircle, CheckCircle, FileText } from "lucide-react"

const LeaveApplicationForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    reason: "",
    type: "sick",
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
      if (!formData.startDate) {
        throw new Error("Start date is required")
      }

      if (!formData.reason) {
        throw new Error("Reason is required")
      }

      // Create form data for file upload
      const data = new FormData()
      data.append("startDate", formData.startDate)
      data.append("endDate", formData.endDate || formData.startDate)
      data.append("reason", formData.reason)
      data.append("type", formData.type)

      if (attachment) {
        data.append("attachment", attachment)
      }

      // Submit form
      const response = await fetch("/api/leave-applications", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: data,
      })

      if (!response.ok) {
        throw new Error(`Failed to submit leave application: ${response.statusText}`)
      }

      const result = await response.json()

      setSuccess("Leave application submitted successfully")

      // Call onSubmit callback
      if (onSubmit) {
        onSubmit(result)
      }

      // Reset form after 2 seconds
      setTimeout(() => {
        setFormData({
          startDate: "",
          endDate: "",
          reason: "",
          type: "sick",
          attachmentUrl: "",
        })
        setAttachment(null)
        setSuccess(null)
      }, 2000)
    } catch (err) {
      console.error("Error submitting leave application:", err)
      setError(err instanceof Error ? err.message : "Failed to submit leave application")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave Application</h3>

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              End Date (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Leave Type *
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
          >
            <option value="sick">Sick Leave</option>
            <option value="personal">Personal Leave</option>
            <option value="family">Family Emergency</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
            Reason *
          </label>
          <textarea
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
          ></textarea>
        </div>

        <div className="mb-6">
          <label htmlFor="attachment" className="block text-sm font-medium text-gray-700 mb-1">
            Attachment (Optional)
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
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default LeaveApplicationForm
