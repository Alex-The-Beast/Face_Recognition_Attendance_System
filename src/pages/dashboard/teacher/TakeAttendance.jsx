"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import classService from "../../../services/classService"
import attendanceService from "../../../services/attendanceService"
import FaceRecognition from "../../../components/common/FaceRecognition"
import { toast } from "react-toastify"
import { format } from "date-fns"

const  { getClassById }=classService
const  { markAttendance, getAttendanceByClassAndDate }=attendanceService

const TakeAttendance = () => {
  const { classId } = useParams()
  const navigate = useNavigate()
  const [classData, setClassData] = useState(null)
  const [students, setStudents] = useState([])
  const [attendanceDate, setAttendanceDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [attendanceStatus, setAttendanceStatus] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [existingAttendance, setExistingAttendance] = useState(null)
  const [showFaceRecognition, setShowFaceRecognition] = useState(false)
  const [capturedPhotos, setCapturedPhotos] = useState([])

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        setIsLoading(true)
        const data = await getClassById(classId)
        console.log("Fetched class data:", data)
        setClassData(data)
        setStudents(data.students || [])

        // Initialize attendance status for all students as 'absent'
        const initialStatus = {}
        data.students.forEach((student) => {
          initialStatus[student._id] = "absent"
        })
        setAttendanceStatus(initialStatus)

        // Check if attendance already exists for this date
        const existingData = await getAttendanceByClassAndDate(classId, attendanceDate)
        if (existingData && existingData.length > 0) {
          setExistingAttendance(existingData[0])

          // Update attendance status from existing data
          const updatedStatus = { ...initialStatus }
          existingData[0].records.forEach((record) => {
            updatedStatus[record.student] = record.status
          })
          setAttendanceStatus(updatedStatus)

          // Set captured photos if available
          if (existingData[0].photos && existingData[0].photos.length > 0) {
            setCapturedPhotos(existingData[0].photos)
          }
        }
      } catch (error) {
        console.error("Error fetching class data:", error)
        toast.error("Failed to load class data")
      } finally {
        setIsLoading(false)
      }
    }

    if (classId) {
      fetchClassData()
    }
  }, [classId, attendanceDate])

  const handleStatusChange = (studentId, status) => {
    setAttendanceStatus((prev) => ({
      ...prev,
      [studentId]: status,
    }))
  }

  const handleDateChange = (e) => {
    setAttendanceDate(e.target.value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setIsSaving(true)

      // Format attendance records
      const records = students.map((student) => ({
        student: student._id,
        status: attendanceStatus[student._id] || "absent",
      }))

      // Submit attendance
      await markAttendance({
        classId,
        date: attendanceDate,
        records,
        photos: capturedPhotos,
        existingId: existingAttendance?._id,
      })

      toast.success("Attendance saved successfully")
      navigate(`/dashboard/teacher/attendance-records/${classId}`)
    } catch (error) {
      console.error("Error saving attendance:", error)
      toast.error("Failed to save attendance")
    } finally {
      setIsSaving(false)
    }
  }

  const handleFaceRecognition = (recognitionData) => {
    // Update attendance status based on recognized students
    const { recognizedStudents, imageData } = recognitionData

    if (recognizedStudents && recognizedStudents.length > 0) {
      const updatedStatus = { ...attendanceStatus }

      // Mark recognized students as present
      recognizedStudents.forEach((studentId) => {
        if (updatedStatus.hasOwnProperty(studentId)) {
          updatedStatus[studentId] = "present"
        }
      })

      setAttendanceStatus(updatedStatus)

      // Add captured photo to the list
      if (imageData) {
        setCapturedPhotos((prev) => [
          ...prev,
          {
            imageData,
            timestamp: new Date().toISOString(),
            recognizedStudents,
          },
        ])
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!classData) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-red-600">Class not found</h2>
        <p className="mt-2">The requested class could not be found.</p>
        <button
          onClick={() => navigate("/dashboard/teacher")}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{classData.name} - Take Attendance</h1>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <span>Date:</span>
              <input
                type="date"
                value={attendanceDate}
                onChange={handleDateChange}
                className="border rounded px-2 py-1"
              />
            </label>
            <button
              onClick={() => setShowFaceRecognition(!showFaceRecognition)}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              {showFaceRecognition ? "Hide Face Recognition" : "Use Face Recognition"}
            </button>
          </div>
        </div>

        {existingAttendance && (
          <div className="mb-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 rounded">
            <p className="text-yellow-700">
              Attendance for this date already exists. Any changes will update the existing record.
            </p>
          </div>
        )}

        {showFaceRecognition && (
          <div className="mb-6">
            <FaceRecognition onRecognition={handleFaceRecognition} classId={classId} />
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border text-left">Student ID</th>
                  <th className="py-2 px-4 border text-left">Name</th>
                  <th className="py-2 px-4 border text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border">{student.studentId || student._id}</td>
                    <td className="py-2 px-4 border">{student.name}</td>
                    <td className="py-2 px-4 border">
                      <select
                        value={attendanceStatus[student._id] || "absent"}
                        onChange={(e) => handleStatusChange(student._id, e.target.value)}
                        className="border rounded px-2 py-1 w-full"
                      >
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                        <option value="excused">Excused</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {capturedPhotos.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Captured Photos ({capturedPhotos.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {capturedPhotos.map((photo, index) => (
                  <div key={index} className="border rounded-lg overflow-hidden">
                    <img
                      src={photo.imageData || "/placeholder.svg"}
                      alt={`Captured photo ${index + 1}`}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-2 bg-gray-100 text-xs">
                      <p>Time: {new Date(photo.timestamp).toLocaleTimeString()}</p>
                      <p>Recognized: {photo.recognizedStudents?.length || 0} students</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => navigate("/dashboard/teacher")}
              className="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className={`${isSaving ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"} text-white px-4 py-2 rounded`}
            >
              {isSaving ? "Saving..." : "Save Attendance"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TakeAttendance
