"use client"

import { useState, useEffect } from "react"
import { CalendarIcon, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react"

const AttendanceCalendar = ({ userId, classId, onDayClick }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [attendanceData, setAttendanceData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedDay, setSelectedDay] = useState(null)

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Calculate month range
        const year = currentMonth.getFullYear()
        const month = currentMonth.getMonth()
        const startDate = new Date(year, month, 1).toISOString().split("T")[0]
        const endDate = new Date(year, month + 1, 0).toISOString().split("T")[0]

        // Build query parameters
        const params = new URLSearchParams()
        if (userId) params.append("userId", userId)
        if (classId) params.append("classId", classId)
        params.append("startDate", startDate)
        params.append("endDate", endDate)

        // Fetch attendance data from API
        const response = await fetch(`/api/attendance/calendar?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch attendance data: ${response.statusText}`)
        }

        const data = await response.json()
        setAttendanceData(data.attendanceDays || [])
      } catch (err) {
        console.error("Error fetching attendance data:", err)
        setError(err instanceof Error ? err.message : "Failed to load attendance data")

        // Fallback data for development/testing
        generateMockData()
      } finally {
        setLoading(false)
      }
    }

    const generateMockData = () => {
      const year = currentMonth.getFullYear()
      const month = currentMonth.getMonth()
      const daysInMonth = new Date(year, month + 1, 0).getDate()

      const mockData = []

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day)

        // Skip weekends
        if (date.getDay() === 0 || date.getDay() === 6) continue

        // Random status
        const rand = Math.random()
        const status = rand > 0.2 ? "present" : "absent"

        mockData.push({
          date: date.toISOString().split("T")[0],
          status,
          classes: [
            {
              id: "class1",
              name: "Mathematics",
              time: "09:00 AM",
              status,
            },
            {
              id: "class2",
              name: "Physics",
              time: "11:00 AM",
              status,
            },
          ],
        })
      }

      setAttendanceData(mockData)
    }

    fetchAttendanceData()
  }, [currentMonth, userId, classId])

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const handleDayClick = (day) => {
    setSelectedDay(day)
    if (onDayClick) onDayClick(day)
  }

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    // Get first day of month and number of days
    const firstDayOfMonth = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    // Create array for calendar days
    const days = []

    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-12"></div>)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dateString = date.toISOString().split("T")[0]

      // Find attendance data for this day
      const dayData = attendanceData.find((d) => d.date === dateString) || {
        date: dateString,
        status: "none",
      }

      // Determine day style based on attendance status
      let dayClass = "cursor-pointer hover:bg-gray-100"
      if (dayData.status === "present") {
        dayClass += " bg-success-50 hover:bg-success-100"
      } else if (dayData.status === "absent") {
        dayClass += " bg-error-50 hover:bg-error-100"
      }

      // Check if this is the selected day
      if (selectedDay && selectedDay.date === dateString) {
        dayClass += " border-2 border-primary-500"
      }

      days.push(
        <div
          key={day}
          className={`h-12 flex items-center justify-center rounded-md ${dayClass}`}
          onClick={() => handleDayClick(dayData)}
        >
          <span className="text-sm">{day}</span>
        </div>,
      )
    }

    return days
  }

  if (loading && attendanceData.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error && attendanceData.length === 0) {
    return (
      <div className="bg-error-50 text-error-700 p-4 rounded-lg flex items-center">
        <AlertCircle className="h-5 w-5 mr-2" />
        <span>{error}</span>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2 text-primary-500" />
          Attendance Calendar
        </h3>
        <div className="flex items-center space-x-2">
          <button onClick={handlePrevMonth} className="p-2 rounded-md hover:bg-gray-100">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm font-medium">
            {currentMonth.toLocaleString("default", { month: "long", year: "numeric" })}
          </span>
          <button onClick={handleNextMonth} className="p-2 rounded-md hover:bg-gray-100">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="h-8 flex items-center justify-center">
            <span className="text-xs font-medium text-gray-500">{day}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">{generateCalendarDays()}</div>

      <div className="mt-6 flex items-center justify-center space-x-6">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-success-100 rounded-sm mr-2"></div>
          <span className="text-xs text-gray-600">Present</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-error-100 rounded-sm mr-2"></div>
          <span className="text-xs text-gray-600">Absent</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-white border border-gray-200 rounded-sm mr-2"></div>
          <span className="text-xs text-gray-600">No Class</span>
        </div>
      </div>

      {selectedDay && selectedDay.classes && selectedDay.classes.length > 0 && (
        <div className="mt-6 border-t pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Classes on {new Date(selectedDay.date).toLocaleDateString()}
          </h4>
          <div className="space-y-2">
            {selectedDay.classes.map((cls) => (
              <div key={cls.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                <div>
                  <span className="text-sm font-medium">{cls.name}</span>
                  <span className="text-xs text-gray-500 ml-2">{cls.time}</span>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    cls.status === "present" ? "bg-success-100 text-success-800" : "bg-error-100 text-error-800"
                  }`}
                >
                  {cls.status === "present" ? "Present" : "Absent"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AttendanceCalendar
