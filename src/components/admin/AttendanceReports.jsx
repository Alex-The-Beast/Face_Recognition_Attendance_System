"use client"

import { useState, useEffect } from "react"
import { Calendar, Download, BarChart2, Users } from "lucide-react"
import attendanceService from "../../services/attendanceService"
import classService from "../../services/classService"

const AttendanceReports = () => {
  const [loading, setLoading] = useState(true)
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState("")
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  })
  const [reportData, setReportData] = useState(null)
  const [reportType, setReportType] = useState("summary") // summary, detailed, student

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await classService.getAllClasses()
        setClasses(response.classes || [])
        if (response.classes && response.classes.length > 0) {
          setSelectedClass(response.classes[0]._id)
        }
      } catch (error) {
        console.error("Error fetching classes:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchClasses()
  }, [])

  const generateReport = async () => {
    if (!selectedClass) return

    try {
      setLoading(true)

      const params = {
        classId: selectedClass,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        type: reportType,
      }

      const response = await attendanceService.generateReport(params)
      setReportData(response.data)
    } catch (error) {
      console.error("Error generating report:", error)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = async () => {
    if (!selectedClass) return

    try {
      setLoading(true)

      const params = {
        classId: selectedClass,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        type: reportType,
      }

      await attendanceService.exportReport(params)
    } catch (error) {
      console.error("Error exporting report:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Attendance Reports</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Select Class</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
          <div className="flex space-x-2">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
            <span className="flex items-center text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="summary">Summary Report</option>
            <option value="detailed">Detailed Report</option>
            <option value="student">Student-wise Report</option>
          </select>
        </div>
      </div>

      <div className="flex space-x-2 mb-6">
        <button
          onClick={generateReport}
          disabled={loading || !selectedClass}
          className={`px-4 py-2 rounded-md ${
            loading || !selectedClass ? "bg-gray-400" : "bg-primary-600 hover:bg-primary-700"
          } text-white flex items-center`}
        >
          <BarChart2 className="h-5 w-5 mr-2" />
          Generate Report
        </button>

        <button
          onClick={exportReport}
          disabled={loading || !selectedClass}
          className={`px-4 py-2 rounded-md ${
            loading || !selectedClass ? "bg-gray-400" : "bg-success-600 hover:bg-success-700"
          } text-white flex items-center`}
        >
          <Download className="h-5 w-5 mr-2" />
          Export to CSV
        </button>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      )}

      {!loading && reportData && (
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4">
            {reportType === "summary"
              ? "Attendance Summary"
              : reportType === "detailed"
                ? "Detailed Attendance Report"
                : "Student-wise Attendance Report"}
          </h3>

          {reportType === "summary" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-primary-100 rounded-full">
                    <Users className="h-6 w-6 text-primary-600" />
                  </div>
                  <span className="text-2xl font-bold">{reportData.totalStudents}</span>
                </div>
                <p className="text-gray-600">Total Students</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-success-100 rounded-full">
                    <Calendar className="h-6 w-6 text-success-600" />
                  </div>
                  <span className="text-2xl font-bold">{reportData.totalClasses}</span>
                </div>
                <p className="text-gray-600">Total Classes</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-warning-100 rounded-full">
                    <BarChart2 className="h-6 w-6 text-warning-600" />
                  </div>
                  <span className="text-2xl font-bold">{reportData.averageAttendance}%</span>
                </div>
                <p className="text-gray-600">Average Attendance</p>
              </div>
            </div>
          )}

          {reportType === "detailed" && (
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
                      Attendance %
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.dates.map((date) => (
                    <tr key={date.date}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{date.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{date.present}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{date.absent}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{date.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {reportType === "student" && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Present
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Absent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendance %
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.students.map((student) => (
                    <tr key={student.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            <div className="text-sm text-gray-500">{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.present}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.absent}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AttendanceReports
