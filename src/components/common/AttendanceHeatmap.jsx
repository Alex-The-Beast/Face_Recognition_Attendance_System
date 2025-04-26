"use client"

import { useState, useEffect, useRef } from "react"
import { AlertCircle } from "lucide-react"
import attendanceService from "../../services/attendanceService"

const AttendanceHeatmap = ({ userId, classId, period = "month" }) => {
  const [heatmapData, setHeatmapData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    const fetchHeatmapData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Prepare filters
        const filters = { period }
        if (userId) filters.userId = userId
        if (classId) filters.classId = classId

        // Fetch heatmap data
        const data = await attendanceService.getAttendanceHeatmap(filters)
        setHeatmapData(data.heatmap || null)
      } catch (err) {
        console.error("Error fetching heatmap data:", err)
        setError(err instanceof Error ? err.message : "Failed to load attendance heatmap")

        // Fallback data for development/testing
        const mockData = {
          days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
          times: ["9:00", "11:00", "14:00"],
          values: [
            [95, 85, 100, 90, 75],
            [80, 90, 85, 100, 90],
            [70, 80, 75, 85, 100],
          ],
        }
        setHeatmapData(mockData)
      } finally {
        setLoading(false)
      }
    }

    fetchHeatmapData()
  }, [userId, classId, period])

  // Render heatmap on canvas
  useEffect(() => {
    if (heatmapData && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Set dimensions
      const cellWidth = 60
      const cellHeight = 40
      const headerHeight = 30
      const headerWidth = 80

      // Draw headers
      ctx.fillStyle = "#f3f4f6"
      ctx.fillRect(0, 0, headerWidth, canvas.height)
      ctx.fillRect(0, 0, canvas.width, headerHeight)

      // Draw day headers
      ctx.fillStyle = "#111827"
      ctx.font = "12px Arial"
      ctx.textAlign = "center"

      heatmapData.days.forEach((day, i) => {
        ctx.fillText(day, headerWidth + (i + 0.5) * cellWidth, headerHeight / 2 + 5)
      })

      // Draw time headers
      ctx.textAlign = "right"
      heatmapData.times.forEach((time, i) => {
        ctx.fillText(time, headerWidth - 10, headerHeight + (i + 0.5) * cellHeight + 5)
      })

      // Draw heatmap cells
      heatmapData.values.forEach((row, rowIndex) => {
        row.forEach((value, colIndex) => {
          // Calculate color based on value (0-100)
          const green = Math.floor((value / 100) * 255)
          const red = Math.floor(((100 - value) / 100) * 255)
          ctx.fillStyle = `rgb(${red}, ${green}, 100)`

          // Draw cell
          ctx.fillRect(headerWidth + colIndex * cellWidth, headerHeight + rowIndex * cellHeight, cellWidth, cellHeight)

          // Draw value text
          ctx.fillStyle = value > 50 ? "#ffffff" : "#000000"
          ctx.textAlign = "center"
          ctx.fillText(
            `${value}%`,
            headerWidth + colIndex * cellWidth + cellWidth / 2,
            headerHeight + rowIndex * cellHeight + cellHeight / 2 + 5,
          )
        })
      })
    }
  }, [heatmapData])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error && !heatmapData) {
    return (
      <div className="bg-error-50 text-error-700 p-4 rounded-lg flex items-center">
        <AlertCircle className="h-5 w-5 mr-2" />
        <span>{error}</span>
      </div>
    )
  }

  if (!heatmapData) return null

  // Calculate canvas dimensions
  const canvasWidth = 80 + heatmapData.days.length * 60
  const canvasHeight = 30 + heatmapData.times.length * 40

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Heatmap</h3>
      <div className="flex justify-center">
        <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} className="border border-gray-200 rounded" />
      </div>
      <div className="mt-4 flex justify-center items-center">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 rounded-sm"></div>
          <span className="text-xs text-gray-600">Low Attendance</span>
        </div>
        <div className="mx-4 text-gray-300">|</div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
          <span className="text-xs text-gray-600">High Attendance</span>
        </div>
      </div>
    </div>
  )
}

export default AttendanceHeatmap
