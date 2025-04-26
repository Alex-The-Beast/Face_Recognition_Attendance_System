"use client"

import { useState, useEffect } from "react"
import { BarChart, Users, BookOpen, CalendarCheck } from "lucide-react"

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalAttendance: 0,
  })

  useEffect(() => {
    // TODO: Fetch real data from API
    setStats({
      totalStudents: 150,
      totalTeachers: 12,
      totalClasses: 8,
      totalAttendance: 450,
    })
  }, [])

  const cards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: Users,
      color: "bg-primary-500",
    },
    {
      title: "Total Teachers",
      value: stats.totalTeachers,
      icon: BookOpen,
      color: "bg-secondary-500",
    },
    {
      title: "Active Classes",
      value: stats.totalClasses,
      icon: CalendarCheck,
      color: "bg-accent-500",
    },
    {
      title: "Today's Attendance",
      value: stats.totalAttendance,
      icon: BarChart,
      color: "bg-success-500",
    },
  ]

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${card.color}`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{card.value}</span>
            </div>
            <h3 className="text-lg font-medium text-gray-700">{card.title}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">New student registered</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <button className="text-sm text-primary-600 hover:text-primary-700">View</button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
              <Users className="h-6 w-6 text-primary-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">Add User</span>
            </button>
            <button className="p-4 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors">
              <BookOpen className="h-6 w-6 text-secondary-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">Create Class</span>
            </button>
            <button className="p-4 bg-accent-50 rounded-lg hover:bg-accent-100 transition-colors">
              <CalendarCheck className="h-6 w-6 text-accent-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">View Schedule</span>
            </button>
            <button className="p-4 bg-success-50 rounded-lg hover:bg-success-100 transition-colors">
              <BarChart className="h-6 w-6 text-success-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">Export Reports</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
