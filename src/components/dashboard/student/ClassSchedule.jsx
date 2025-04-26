"use client"

import { useState, useEffect } from "react"
import { Clock, BookOpen, MapPin, AlertCircle } from "lucide-react"

const ClassSchedule = ({ date, userId }) => {
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedDate, setSelectedDate] = useState(date || new Date().toISOString().split("T")[0])

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true)
        setError(null)

        // Build query parameters
        const params = new URLSearchParams()
        params.append("date", selectedDate)
        if (userId) params.append("userId", userId)

        // Fetch schedule from API
        const response = await fetch(`/api/classes/schedule?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch schedule: ${response.statusText}`)
        }

        const data = await response.json()
        setSchedule(data.schedule || [])
      } catch (err) {
        console.error("Error fetching schedule:", err)
        setError(err instanceof Error ? err.message : "Failed to load class schedule")

        // Fallback data for development/testing
        const now = new Date()
        const currentHour = now.getHours()
        const currentMinute = now.getMinutes()

        const mockSchedule = [
          {
            id: "class1",
            name: "Mathematics",
            startTime: "09:00",
            endTime: "10:30",
            teacher: "Dr. Robert Chen",
            location: "Room 101",
            status:
              currentHour < 9
                ? "upcoming"
                : currentHour === 9 || (currentHour === 10 && currentMinute < 30)
                  ? "ongoing"
                  : "completed",
          },
          {
            id: "class2",
            name: "Physics",
            startTime: "11:00",
            endTime: "12:30",
            teacher: "Dr. Sarah Johnson",
            location: "Room 203",
            status:
              currentHour < 11
                ? "upcoming"
                : currentHour === 11 || (currentHour === 12 && currentMinute < 30)
                  ? "ongoing"
                  : "completed",
          },
          {
            id: "class3",
            name: "Computer Science",
            startTime: "14:00",
            endTime: "15:30",
            teacher: "Prof. Michael Torres",
            location: "Lab 305",
            status:
              currentHour < 14
                ? "upcoming"
                : currentHour === 14 || (currentHour === 15 && currentMinute < 30)
                  ? "ongoing"
                  : "completed",
          },
        ]

        setSchedule(mockSchedule)
      } finally {
        setLoading(false)
      }
    }

    fetchSchedule()
  }, [selectedDate, userId])

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value)
  }

  const formatTime = (time) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours, 10)
    const ampm = hour >= 12 ? "PM" : "AM"
    const formattedHour = hour % 12 || 12
    return `${formattedHour}:${minutes} ${ampm}`
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "upcoming":
        return "bg-primary-100 text-primary-800"
      case "ongoing":
        return "bg-success-100 text-success-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading && schedule.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error && schedule.length === 0) {
    return (
      <div className="bg-error-50 text-error-700 p-4 rounded-lg flex items-center">
        <AlertCircle className="h-5 w-5 mr-2" />
        <span>{error}</span>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Class Schedule</h3>
        <div className="mt-2 md:mt-0">
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {schedule.length === 0 ? (
        <div className="text-center py-8">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No classes scheduled for this day</p>
        </div>
      ) : (
        <div className="space-y-4">
          {schedule.map((session) => (
            <div
              key={session.id}
              className={`p-4 border rounded-lg ${
                session.status === "ongoing" ? "border-success-300 bg-success-50" : "border-gray-200"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-gray-900">{session.name}</h4>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      <span>
                        {formatTime(session.startTime)} - {formatTime(session.endTime)}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <BookOpen className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{session.teacher}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{session.location}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 md:mt-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                    {session.status === "upcoming"
                      ? "Upcoming"
                      : session.status === "ongoing"
                        ? "Ongoing"
                        : "Completed"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ClassSchedule
