"use client"

import { useState, useEffect, useContext } from "react"
import { Calendar, Clock, Users, AlertCircle, FileText, Filter, Download, Search } from "lucide-react"
import AuthContext from "../../../contexts/AuthContext"
import attendanceService from "../../../services/attendanceService"
import AttendanceStats from "../../../components/common/AttendanceStats"
import AttendanceCalendar from "../../../components/common/AttendanceCalendar"

const StudentAttendance = () => {
  const { currentUser } = useContext(AuthContext)
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dateFilter, setDateFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [classFilter, setClassFilter] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [classes, setClasses] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState("month")
  const [attendanceHeatmap, setAttendanceHeatmap] = useState(null)

  const recordsPerPage = 10

  // Load attendance records
  useEffect(() => {
    const fetchAttendanceRecords = async () => {
      try {
        setLoading(true)
        setError(null)

        // Prepare filters
        const filters = {
          page: currentPage,
          limit: recordsPerPage,
        }

        if (dateFilter) filters.date = dateFilter
        if (statusFilter) filters.status = statusFilter
        if (classFilter) filters.classId = classFilter
        if (searchTerm) filters.search = searchTerm

        // Fetch attendance records
        const response = await attendanceService.getMyAttendance(filters)

        setAttendanceRecords(response.attendanceRecords || [])
        setTotalPages(Math.ceil(response.total / recordsPerPage) || 1)
      } catch (err) {
        console.error("Error fetching attendance records:", err)
        setError(err instanceof Error ? err.message : "Failed to load attendance records")

        // Fallback data for development/testing
        const mockRecords = Array.from({ length: 15 }, (_, i) => ({
          _id: `record-${i}`,
          className: ["Mathematics", "Physics", "Computer Science", "Chemistry", "Biology"][i % 5],
          date: new Date(Date.now() - 1000 * 60 * 60 * 24 * i).toISOString().split("T")[0],
          time: ["09:00", "11:00", "14:00"][i % 3],
          status: i % 4 === 0 ? "absent" : "present",
          verifiedByName: ["Dr. Robert Chen", "Dr. Sarah Johnson", "System"][i % 3],
          emotion: ["Happy", "Neutral", "Focused", null][i % 4],
          attention: i % 4 === 0 ? null : 75 + (i % 25),
        }))

        setAttendanceRecords(mockRecords.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage))
        setTotalPages(Math.ceil(mockRecords.length / recordsPerPage))
      } finally {
        setLoading(false)
      }
    }

    if (currentUser) {
      fetchAttendanceRecords()
    }
  }, [currentUser, currentPage, dateFilter, statusFilter, classFilter, searchTerm])

  // Load classes for filter
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch("/api/classes/my-classes", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch classes: ${response.statusText}`)
        }

        const data = await response.json()
        setClasses(data.classes || [])
      } catch (err) {
        console.error("Error fetching classes:", err)

        // Fallback data for development/testing
        setClasses([
          { id: "class1", name: "Mathematics" },
          { id: "class2", name: "Physics" },
          { id: "class3", name: "Computer Science" },
          { id: "class4", name: "Chemistry" },
          { id: "class5", name: "Biology" },
        ])
      }
    }

    if (currentUser) {
      fetchClasses()
    }
  }, [currentUser])

  // Load attendance heatmap data
  useEffect(() => {
    const fetchAttendanceHeatmap = async () => {
      try {
        const response = await fetch("/api/attendance/heatmap", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch heatmap data: ${response.statusText}`)
        }

        const data = await response.json()
        setAttendanceHeatmap(data.heatmap || null)
      } catch (err) {
        console.error("Error fetching heatmap data:", err)

        // Fallback data for development/testing
        const mockHeatmap = {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
          datasets: [
            {
              label: "9 AM",
              data: [95, 85, 100, 90, 75],
            },
            {
              label: "11 AM",
              data: [80, 90, 85, 100, 90],
            },
            {
              label: "2 PM",
              data: [70, 80, 75, 85, 100],
            },
          ],
        }
        setAttendanceHeatmap(mockHeatmap)
      }
    }

    if (currentUser) {
      fetchAttendanceHeatmap()
    }
  }, [currentUser])

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  const handleFilterChange = () => {
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setDateFilter("")
    setStatusFilter("")
    setClassFilter("")
    setSearchTerm("")
    setCurrentPage(1)
  }

  const exportAttendance = async () => {
    try {
      setLoading(true)

      // Prepare filters
      const filters = {}
      if (dateFilter) filters.date = dateFilter
      if (statusFilter) filters.status = statusFilter
      if (classFilter) filters.classId = classFilter

      // Export attendance data
      const blob = await attendanceService.exportAttendance(filters)

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `attendance_${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()

      // Clean up
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error("Error exporting attendance data:", err)
      setError(err instanceof Error ? err.message : "Failed to export attendance data")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  // Initialize heatmap visualization
  useEffect(() => {
    if (attendanceHeatmap && document.getElementById("attendance-heatmap")) {
      // This would normally use a charting library like Chart.js
      // For this example, we'll just log that we would render the heatmap
      console.log("Rendering attendance heatmap with data:", attendanceHeatmap)

      // In a real implementation, you would use code like:
      // new Chart(document.getElementById('attendance-heatmap'), {
      //   type: 'heatmap',
      //   data: attendanceHeatmap,
      //   options: { ... }
      // })
    }
  }, [attendanceHeatmap])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Attendance</h1>

      {error && (
        <div className="mb-6 p-4 bg-error-50 text-error-700 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <AttendanceStats userId={currentUser?.id} period={selectedPeriod} showDetails={false} />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Period</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSelectedPeriod("day")}
              className={`p-2 rounded-md text-sm font-medium ${
                selectedPeriod === "day"
                  ? "bg-primary-100 text-primary-700 border border-primary-200"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setSelectedPeriod("week")}
              className={`p-2 rounded-md text-sm font-medium ${
                selectedPeriod === "week"
                  ? "bg-primary-100 text-primary-700 border border-primary-200"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setSelectedPeriod("month")}
              className={`p-2 rounded-md text-sm font-medium ${
                selectedPeriod === "month"
                  ? "bg-primary-100 text-primary-700 border border-primary-200"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setSelectedPeriod("semester")}
              className={`p-2 rounded-md text-sm font-medium ${
                selectedPeriod === "semester"
                  ? "bg-primary-100 text-primary-700 border border-primary-200"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Semester
            </button>
          </div>

          <div className="mt-6">
            <button
              onClick={exportAttendance}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Attendance
            </button>
          </div>
        </div>
      </div>

      {/* Attendance Heatmap */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Heatmap</h3>
        <div className="h-64" id="attendance-heatmap">
          {/* Heatmap will be rendered here by Chart.js or similar library */}
          {!attendanceHeatmap ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              Attendance heatmap visualization would be rendered here with a charting library
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          {/* Attendance Records Table */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="relative">
                  <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search classes..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      handleFilterChange()
                    }}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 w-full md:w-64"
                  />
                </div>

                <div className="flex items-center">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </button>
                </div>
              </div>

              {showFilters && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      id="dateFilter"
                      type="date"
                      value={dateFilter}
                      onChange={(e) => {
                        setDateFilter(e.target.value)
                        handleFilterChange()
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      id="statusFilter"
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value)
                        handleFilterChange()
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">All Status</option>
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="classFilter" className="block text-sm font-medium text-gray-700 mb-1">
                      Class
                    </label>
                    <select
                      id="classFilter"
                      value={classFilter}
                      onChange={(e) => {
                        setClassFilter(e.target.value)
                        handleFilterChange()
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">All Classes</option>
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-3 flex justify-end">
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              )}
            </div>

            {loading && attendanceRecords.length === 0 ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
              </div>
            ) : attendanceRecords.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No attendance records found</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Class
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Verified By
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Details
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {attendanceRecords.map((record) => (
                        <tr key={record._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                <Users className="h-5 w-5 text-primary-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{record.className}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-900">{formatDate(record.date)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-900">{record.time}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                record.status === "present"
                                  ? "bg-success-100 text-success-800"
                                  : "bg-error-100 text-error-800"
                              }`}
                            >
                              {record.status === "present" ? "Present" : "Absent"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.verifiedByName || "System"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">
                              {record.emotion && (
                                <span className="inline-block px-2 py-1 mr-2 bg-gray-100 text-gray-800 rounded-md text-xs">
                                  Emotion: {record.emotion}
                                </span>
                              )}
                              {record.attention && (
                                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 rounded-md text-xs">
                                  Attention: {record.attention}%
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Showing page {currentPage} of {totalPages}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`px-3 py-1 border border-gray-300 rounded-md text-sm font-medium ${
                            currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className={`px-3 py-1 border border-gray-300 rounded-md text-sm font-medium ${
                            currentPage === totalPages
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div>
          <AttendanceCalendar userId={currentUser?.id} />
        </div>
      </div>
    </div>
  )
}

export default StudentAttendance
