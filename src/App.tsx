import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import ProtectedRoute from "./components/auth/ProtectedRoute"

// Layouts
import MainLayout from "./components/layouts/MainLayout"
import DashboardLayout from "./components/layouts/DashboardLayout"

// Pages
import LandingPage from "./pages/LandingPage"
import LoginPage from "./pages/auth/LoginPage"
import RegisterPage from "./pages/auth/RegisterPage"
import NotFoundPage from "./pages/NotFoundPage"
import ProfilePage from "./pages/ProfilePage"

// Dashboard Pages
import AdminDashboard from "./pages/dashboard/admin/AdminDashboard"
import TeacherDashboard from "./pages/dashboard/teacher/TeacherDashboard"
import StudentDashboard from "./pages/dashboard/student/StudentDashboard"
import UserManagement from "./pages/dashboard/admin/UserManagement"
import ClassManagement from "./pages/dashboard/admin/ClassManagement"
import TakeAttendance from "./pages/dashboard/teacher/TakeAttendance"
import AttendanceRecords from "./pages/dashboard/teacher/AttendanceRecords"
import StudentAttendance from "./pages/dashboard/student/StudentAttendance"

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="classes" element={<ClassManagement />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Teacher Routes */}
          <Route
            path="/teacher"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<TeacherDashboard />} />
            <Route path="take-attendance" element={<TakeAttendance />} />
            <Route path="records" element={<AttendanceRecords />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Student Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<StudentDashboard />} />
            <Route path="attendance" element={<StudentAttendance />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Special Routes */}
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
