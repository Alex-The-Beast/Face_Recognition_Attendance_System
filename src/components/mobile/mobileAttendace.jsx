"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Camera, Users, Calendar, Clock, Check, X } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import classService from "../../services/classService"
import attendanceService from "../../services/attendanceService"
import FaceRecognition from "../common/FaceRecognition"

const MobileAttendance = () => {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCamera, setShowCamera] = useState(false)
  const [recognizedStudents, setRecognizedStudents] = useState([])
  const [attendanceDate] = useState(new Date().toISOString().split("T")[0])
  const [attendanceTime] = useState(new Date().toTimeString().split(" ")[0])
  const [attendanceMarked, setAttendanceMarked] = useState(false)

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true)
        const response = await classService.getAllClasses()
        setClasses(response.classes || [])
      } catch (error) {
        console.error("Error fetching classes:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchClasses()
  }, [])

  const handleClassSelect = (cls) => {
    setSelectedClass(cls)
    setShowCamera(true)
  }

  const handleRecognition = (result) => {
    setRecognizedStudents(result.recognizedStudents || [])
    setShowCamera(false)

    // Mark attendance automatically
    markAttendance(result.recognizedStudents || [])
  }

  const markAttendance = async (studentIds) => {
    try {
      setLoading(true)

      await attendanceService.markAttendance({
        classId: selectedClass._id,
        date: attendanceDate,
        time: attendanceTime,
        studentIds,
        method: "face",
      })

      setAttendanceMarked(true)
    } catch (error) {
      console.error("Error marking attendance:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    if (showCamera) {
      setShowCamera(false)
    } else if (selectedClass) {
      setSelectedClass(null)
      setRecognizedStudents([])
      setAttendanceMarked(false)
    } else {
      navigate("/dashboard")
    }
  }

  const handleDone = () => {
    navigate("/dashboard")
  }

  if (loading && classes.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-primary-600 text-white p-4 flex items-center justify-between">
        <button onClick={handleBack} className="text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold">Mobile Attendance</h1>
        <div className="w-6"></div> {/* Spacer for alignment */}
      </div>

      <div className="p-4">
        {!selectedClass ? (
          <>
            <h2 className="text-lg font-semibold mb-4">Select a Class</h2>
            <div className="space-y-3">
              {classes.map((cls) => (
                <div
                  key={cls._id}
                  className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between"
                  onClick={() => handleClassSelect(cls)}
                >
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium">{cls.name}</h3>
                      <p className="text-sm text-gray-500">{cls.code}</p>
                    </div>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              ))}
            </div>
          </>
        ) : showCamera ? (
          <FaceRecognition
            onRecognition={handleRecognition}
            classId={selectedClass._id}
            date={attendanceDate}
            time={attendanceTime}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary-600" />
              </div>
              <div className="ml-3">
                <h3 className="font-medium">{selectedClass.name}</h3>
                <p className="text-sm text-gray-500">{selectedClass.code}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4 text-sm">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                <span>{attendanceDate}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-gray-500 mr-1" />
                <span>{attendanceTime}</span>
              </div>
            </div>

            {attendanceMarked ? (
              <div className="bg-success-50 border border-success-200 rounded-lg p-4 mb-4">
                <div className="flex items-center text-success-700">
                  <Check className="h-5 w-5 mr-2" />
                  <span>Attendance marked successfully!</span>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <Camera className="h-5 w-5 mr-2 text-gray-500" />
                  <span>Recognition complete</span>
                </div>
              </div>
            )}

            <div className="mb-4">
              <h4 className="font-medium mb-2">Recognized Students ({recognizedStudents.length})</h4>
              {recognizedStudents.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {recognizedStudents.map((studentId) => {
                    const student = selectedClass.students?.find((s) => s._id === studentId) || {
                      name: "Unknown Student",
                    }
                    return (
                      <div key={studentId} className="flex items-center bg-gray-50 p-2 rounded">
                        <Check className="h-4 w-4 text-success-600 mr-2" />
                        <span>{student.name}</span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-4 bg-gray-50 rounded">
                  <X className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No students recognized</p>
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setShowCamera(true)}
                className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                <Camera className="h-5 w-5 inline-block mr-1" />
                Retake
              </button>
              <button
                onClick={handleDone}
                className="flex-1 py-2 px-4 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MobileAttendance
