"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  FileText,
  Search,
  Download,
  Calendar,
  Users,
  BarChart2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import classService from "../../../services/classService"
import attendanceService from "../../../services/attendanceService"

const AttendanceRecords = () => {
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState(null)
  const [attendanceData, setAttendanceData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [attendanceStats, setAttendanceStats] = useState(null)

  const navigate = useNavigate()
  const recordsPerPage = 10

  // Load teacher's classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await classService.getAllClasses()
        setClasses(response.classes || [])
      } catch (err) {
        console.error("Error fetching classes:", err)
        setError(err.response?.data?.message || "Failed to load classes")
      } finally {
        setLoading(false)
      }
    }

    fetchClasses()
  }, [])

  // Load attendance data when a class is selected
  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!selectedClass) return

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

        // Fetch attendance records
        const response = await attendanceService.getClassAttendance(selectedClass._id, filters)

        setAttendanceData(response.attendanceRecords || [])
        setTotalPages(Math.ceil(response.total / recordsPerPage) || 1)

        // Calculate attendance statistics
        calculateAttendanceStats(response.attendanceRecords || [])
      } catch (err) {
        console.error("Error fetching attendance data:", err)
        setError(err.response?.data?.message || "Failed to load attendance records")
      } finally {
        setLoading(false)
      }
    }

    fetchAttendanceData()
  }, [selectedClass, currentPage, dateFilter, statusFilter])

  const calculateAttendanceStats = (records) => {
    if (!records.length) {
      setAttendanceStats(null)
      return
    }

    // Group by date
    const recordsByDate = {}
    records.forEach((record) => {
      if (!recordsByDate[record.date]) {
        recordsByDate[record.date] = []
      }
      recordsByDate[record.date].push(record)
    })

    // Calculate statistics
    const totalStudents = selectedClass.students.length
    const dateStats = Object.entries(recordsByDate).map(([date, dateRecords]) => {
      const presentCount = dateRecords.filter((r) => r.status === "present").length
      const absentCount = totalStudents - presentCount
      const attendanceRate = totalStudents > 0 ? (presentCount / totalStudents) * 100 : 0

      return {
        date,
        presentCount,
        absentCount,
        attendanceRate: Math.round(attendanceRate),
      }
    })

    // Calculate overall statistics
    const totalRecords = records.length
    const presentRecords = records.filter((r) => r.status === "present").length
    const overallAttendanceRate = totalRecords > 0 ? (presentRecords / totalRecords) * 100 : 0

    setAttendanceStats({
      dateStats,
      overallAttendanceRate: Math.round(overallAttendanceRate),
    })
  }

  const handleClassSelect = (classId) => {
    const selected = classes.find((c) => c._id === classId)
    setSelectedClass(selected)
    setCurrentPage(1)
    setDateFilter("")
    setStatusFilter("")
    setSearchTerm("")
  }

  const handleExport = async () => {
    if (!selectedClass) return

    try {
      setLoading(true)

      // Prepare filters
      const filters = {}
      if (dateFilter) filters.date = dateFilter
      if (statusFilter) filters.status = statusFilter

      // Export attendance data
      const blob = await attendanceService.exportAttendance({
        classId: selectedClass._id,
        ...filters,
      })

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `attendance_${selectedClass.name}_${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()

      // Clean up
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error("Error exporting attendance data:", err)
      setError(err.response?.data?.message || "Failed to export attendance data")
    } finally {
      setLoading(false)
    }
  }

  const handleTakeAttendance = () => {
    navigate("/teacher/take-attendance")
  }

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
    setSearchTerm("")
    setCurrentPage(1)
  }

  // Filter attendance data based on search term
  const filteredAttendance = attendanceData.filter((record) =>
    record.studentName?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading && classes.length === 0) {
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Attendance Records</h1>

      {error && (
        <div className="mb-6 p-4 bg-error-50 text-error-700 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {/* Class Selection */}
      {!selectedClass ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Select a Class</h2>

          {classes.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No classes found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.map((classItem) => (
                <div
                  key={classItem._id}
                  onClick={() => handleClassSelect(classItem._id)}
                  className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center mb-2">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary-600" />
                    </div>
                    <h3 className="ml-3 text-lg font-medium text-gray-900">{classItem.name}</h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{classItem.schedule.days.join(", ")}</p>
                  <p className="text-sm text-gray-500">
                    {classItem.schedule.startTime} - {classItem.schedule.endTime}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Attendance Records Interface
        <div>
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => setSelectedClass(null)}
              className="flex items-center text-primary-600 hover:text-primary-700"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Back to Classes
            </button>
            <h2 className="text-xl font-semibold text-gray-900">{selectedClass.name} - Attendance Records</h2>
          </div>

          {/* Attendance Statistics */}
          {attendanceStats && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Attendance Overview</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-primary-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Overall Attendance Rate</p>
                      <p className="text-2xl font-bold text-primary-700">{attendanceStats.overallAttendanceRate}%</p>
                    </div>
                    <BarChart2 className="h-10 w-10 text-primary-400" />
                  </div>
                </div>

                <div className="bg-success-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Students</p>
                      <p className="text-2xl font-bold text-success-700">{selectedClass.students.length}</p>
                    </div>
                    <Users className="h-10 w-10 text-success-400" />
                  </div>
                </div>

                <div className="bg-accent-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Records Period</p>
                      <p className="text-lg font-bold text-accent-700">
                        {attendanceStats.dateStats.length > 0
                          ? `${attendanceStats.dateStats[0].date} - ${attendanceStats.dateStats[attendanceStats.dateStats.length - 1].date}`
                          : "N/A"}
                      </p>
                    </div>
                    <Calendar className="h-10 w-10 text-accent-400" />
                  </div>
                </div>
              </div>

              {attendanceStats.dateStats.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Present
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Absent
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Attendance Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {attendanceStats.dateStats.map((stat, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stat.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stat.presentCount}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stat.absentCount}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                  className="bg-primary-600 h-2.5 rounded-full"
                                  style={{ width: `${stat.attendanceRate}%` }}
                                ></div>
                              </div>
                              <span className="ml-2 text-sm text-gray-900">{stat.attendanceRate}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Filters and Actions */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search student..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 w-full"
                  />
                </div>

                <div className="flex gap-2">
                  <div>
                    <input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => {
                        setDateFilter(e.target.value)
                        handleFilterChange()
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value)
                        handleFilterChange()
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">All Status</option>
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                    </select>
                  </div>

                  {(dateFilter || statusFilter) && (
                    <button
                      onClick={clearFilters}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleExport}
                  disabled={loading || attendanceData.length === 0}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Export CSV
                </button>

                <button
                  onClick={handleTakeAttendance}
                  className="flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  Take Attendance
                </button>
              </div>
            </div>
          </div>

          {/* Attendance Records Table */}
          <div className="bg-white rounded-lg shadow-md">
            {filteredAttendance.length === 0 ? (
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
                          Student
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
                          Emotion
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Attention
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredAttendance.map((record) => (
                        <tr key={record._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                <Users className="h-5 w-5 text-primary-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{record.studentName}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.time}</td>
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
                            {record.emotion || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.attention ? `${record.attention}%` : "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
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
                        <ChevronLeft className="h-4 w-4" />
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
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AttendanceRecords
