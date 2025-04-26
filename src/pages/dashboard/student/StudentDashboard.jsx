"use client"

import { useState, useEffect, useContext } from "react"
import { BookOpen, CalendarCheck, BarChart, Clock, AlertCircle } from "lucide-react"
import AuthContext from "../../../contexts/AuthContext"
import AttendanceStats from "../../../components/common/AttendanceStats"
import ClassSchedule from "../../../components/dashboard/student/ClassSchedule"
import AttendanceCalendar from "../../../components/common/AttendanceCalendar"

const StudentDashboard = () => {
  const { currentUser } = useContext(AuthContext)
  const [stats, setStats] = useState({
    totalClasses: 0,
    attendedClasses: 0,
    attendanceRate: 0,
    upcomingClasses: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [recentAttendance, setRecentAttendance] = useState([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch dashboard statistics
        const statsResponse = await fetch("/api/students/dashboard-stats", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        })

        if (!statsResponse.ok) {
          throw new Error(`Failed to fetch dashboard stats: ${statsResponse.statusText}`)
        }

        const statsData = await statsResponse.json()
        setStats(statsData)

        // Fetch recent attendance records
        const attendanceResponse = await fetch("/api/attendance/recent", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        })

        if (!attendanceResponse.ok) {
          throw new Error(`Failed to fetch recent attendance: ${attendanceResponse.statusText}`)
        }

        const attendanceData = await attendanceResponse.json()
        setRecentAttendance(attendanceData.attendanceRecords || [])
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError(err instanceof Error ? err.message : "Failed to load dashboard data")

        // Fallback data for development/testing
        setStats({
          totalClasses: 45,
          attendedClasses: 38,
          attendanceRate: 84.4,
          upcomingClasses: 3,
        })

        setRecentAttendance([
          {
            _id: "1",
            className: "Mathematics",
            date: new Date().toISOString().split("T")[0],
            time: "09:00",
            status: "present",
          },
          {
            _id: "2",
            className: "Physics",
            date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
            time: "11:00",
            status: "present",
          },
          {
            _id: "3",
            className: "Computer Science",
            date: new Date(Date.now() - 172800000).toISOString().split("T")[0],
            time: "14:00",
            status: "absent",
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    if (currentUser) {
      fetchDashboardData()
    }
  }, [currentUser])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  if (loading && !stats.totalClasses) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Student Dashboard</h1>

      {error && (
        <div className="mb-6 p-4 bg-error-50 text-error-700 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-primary-500">
              <BarChart className="h-6 w-6 text-white" />
            </div>
            <span className="text-3xl font-bold text-gray-900">{stats.attendanceRate}%</span>
          </div>
          <h3 className="text-lg font-medium text-gray-700">Attendance Rate</h3>
          {stats.attendanceRate < 75 && (
            <div className="mt-2 p-2 bg-error-50 text-error-700 text-xs rounded">Below required 75%</div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-success-500">
              <CalendarCheck className="h-6 w-6 text-white" />
            </div>
            <span className="text-3xl font-bold text-gray-900">{stats.attendedClasses}</span>
          </div>
          <h3 className="text-lg font-medium text-gray-700">Classes Attended</h3>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-secondary-500">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <span className="text-3xl font-bold text-gray-900">{stats.totalClasses}</span>
          </div>
          <h3 className="text-lg font-medium text-gray-700">Total Classes</h3>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-accent-500">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <span className="text-3xl font-bold text-gray-900">{stats.upcomingClasses}</span>
          </div>
          <h3 className="text-lg font-medium text-gray-700">Upcoming Classes</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <ClassSchedule userId={currentUser?.id} />
        </div>

        <div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Attendance</h3>
            {recentAttendance.length === 0 ? (
              <div className="text-center py-8">
                <CalendarCheck className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No recent attendance records</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentAttendance.map((record) => (
                  <div
                    key={record._id}
                    className={`p-3 border rounded-lg ${
                      record.status === "present" ? "border-success-200" : "border-error-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            record.status === "present" ? "bg-success-100" : "bg-error-100"
                          }`}
                        >
                          <BookOpen
                            className={`h-5 w-5 ${record.status === "present" ? "text-success-600" : "text-error-600"}`}
                          />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{record.className}</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(record.date)} • {record.time}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          record.status === "present"
                            ? "bg-success-100 text-success-800"
                            : "bg-error-100 text-error-800"
                        }`}
                      >
                        {record.status === "present" ? "Present" : "Absent"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AttendanceStats userId={currentUser?.id} />
        </div>
        <div>
          <AttendanceCalendar userId={currentUser?.id} />
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard
