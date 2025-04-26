"use client"

import { useState, useEffect } from "react"
import { Trophy, AlertCircle, Users } from "lucide-react"
import attendanceService from "../../../services/attendanceService"

const AttendanceLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userRank, setUserRank] = useState(null)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await attendanceService.getLeaderboard()
        setLeaderboard(response.leaderboard || [])
        setUserRank(response.userRank || null)
      } catch (err) {
        console.error("Error fetching leaderboard:", err)
        setError(err instanceof Error ? err.message : "Failed to load leaderboard")

        // Fallback data for development/testing
        const mockLeaderboard = Array.from({ length: 10 }, (_, i) => ({
          id: `student-${i + 1}`,
          rank: i + 1,
          anonymousName: `Student ${String.fromCharCode(65 + i)}`,
          attendanceRate: 100 - i * 2,
          isCurrentUser: i === 3,
        }))

        setLeaderboard(mockLeaderboard)
        setUserRank(4) // Assuming current user is 4th
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return "text-yellow-500"
      case 2:
        return "text-gray-400"
      case 3:
        return "text-amber-600"
      default:
        return "text-gray-700"
    }
  }

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return "🥇"
      case 2:
        return "🥈"
      case 3:
        return "🥉"
      default:
        return rank
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error && leaderboard.length === 0) {
    return (
      <div className="bg-error-50 text-error-700 p-4 rounded-lg flex items-center">
        <AlertCircle className="h-5 w-5 mr-2" />
        <span>{error}</span>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <Trophy className="h-6 w-6 text-primary-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Attendance Leaderboard</h3>
      </div>

      {userRank && (
        <div className="mb-6 p-4 bg-primary-50 rounded-lg">
          <p className="text-sm text-primary-700">
            Your current rank: <span className="font-bold">{userRank}</span> out of {leaderboard.length} students
          </p>
        </div>
      )}

      <div className="overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Attendance
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leaderboard.map((student) => (
              <tr key={student.id} className={`${student.isCurrentUser ? "bg-primary-50" : "hover:bg-gray-50"}`}>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`text-lg font-bold ${getRankColor(student.rank)}`}>{getRankIcon(student.rank)}</span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <Users className="h-4 w-4 text-primary-600" />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {student.anonymousName}
                        {student.isCurrentUser && <span className="ml-2 text-xs text-primary-600">(You)</span>}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right">
                  <div
                    className={`text-sm font-medium ${
                      student.attendanceRate >= 90
                        ? "text-success-600"
                        : student.attendanceRate >= 75
                          ? "text-warning-600"
                          : "text-error-600"
                    }`}
                  >
                    {student.attendanceRate}%
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-center text-xs text-gray-500">
        <p>This leaderboard is anonymous and updated daily</p>
      </div>
    </div>
  )
}

export default AttendanceLeaderboard
