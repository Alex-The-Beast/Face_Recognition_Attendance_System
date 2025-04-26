// "use client"

// import { useState, useEffect, useContext } from "react"
// import { Link } from "react-router-dom"
// import { Users, Calendar, Clock, BookOpen, Camera, BarChart2, AlertCircle } from "lucide-react"
// import AuthContext from "../../../contexts/AuthContext"
// import classService from "../../../services/classService"
// import attendanceService from "../../../services/attendanceService"
// import photoService from "../../../services/photoService"
// import NotificationBell from "../../../components/common/NotificationBell"

// const TeacherDashboard = () => {
//   const { currentUser } = useContext(AuthContext)
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)
//   const [classes, setClasses] = useState([])
//   const [recentAttendance, setRecentAttendance] = useState([])
//   const [stats, setStats] = useState({
//     totalStudents: 0,
//     totalClasses: 0,
//     attendanceRate: 0,
//     pendingDisputes: 0,
//   })
//   const [todayClasses, setTodayClasses] = useState([])

//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       try {
//         setLoading(true)
//         setError(null)

//         // Fetch teacher's classes
//         const classesResponse = await classService.getAllClasses()
//         setClasses(classesResponse.classes || [])

//         // Calculate total students across all classes
//         const totalStudents = classesResponse.classes.reduce((total, cls) => total + (cls.students?.length || 0), 0)

//         // Fetch recent attendance records
//         const today = new Date().toISOString().split("T")[0]
//         const recentAttendancePromises = classesResponse.classes.map((cls) =>
//           attendanceService.getClassAttendance(cls._id, { date: today }),
//         )

//         const attendanceResponses = await Promise.all(recentAttendancePromises)
//         const allRecentAttendance = attendanceResponses.flatMap((response) => response.attendanceRecords || [])

//         setRecentAttendance(allRecentAttendance)

//         // Calculate attendance rate
//         const presentCount = allRecentAttendance.filter((record) => record.status === "present").length
//         const attendanceRate = allRecentAttendance.length > 0 ? (presentCount / allRecentAttendance.length) * 100 : 0

//         // Get today's classes
//         const dayOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][
//           new Date().getDay()
//         ]
//         const todayClasses = classesResponse.classes.filter((cls) => cls.schedule?.days?.includes(dayOfWeek))

//         setTodayClasses(todayClasses)

//         // Set stats
//         setStats({
//           totalStudents,
//           totalClasses: classesResponse.classes.length,
//           attendanceRate,
//           pendingDisputes: 0, // This would come from a separate API call in a real implementation
//         })
//       } catch (err) {
//         console.error("Error fetching dashboard data:", err)
//         setError(err.response?.data?.message || "Failed to load dashboard data")
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchDashboardData()
//   }, [currentUser])

//   const formatTime = (timeString) => {
//     return timeString
//   }

//   if (loading) {
//     return (
//       <div className="p-6">
//         <div className="flex justify-center items-center h-64">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="p-6">
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
//           <p className="text-gray-600">Welcome back, {currentUser?.name}</p>
//         </div>
//         <div className="mt-4 md:mt-0">
//           <NotificationBell />
//         </div>
//       </div>

//       {error && (
//         <div className="mb-6 p-4 bg-error-50 text-error-700 rounded-md flex items-center">
//           <AlertCircle className="h-5 w-5 mr-2" />
//           {error}
//         </div>
//       )}

//       {/* Stats Overview */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         <div className="bg-white rounded-lg shadow-md p-6">
//           <div className="flex items-center">
//             <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
//               <Users className="h-6 w-6 text-primary-600" />
//             </div>
//             <div className="ml-4">
//               <h2 className="text-sm font-medium text-gray-500">Total Students</h2>
//               <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow-md p-6">
//           <div className="flex items-center">
//             <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
//               <BookOpen className="h-6 w-6 text-primary-600" />
//             </div>
//             <div className="ml-4">
//               <h2 className="text-sm font-medium text-gray-500">Total Classes</h2>
//               <p className="text-2xl font-bold text-gray-900">{stats.totalClasses}</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow-md p-6">
//           <div className="flex items-center">
//             <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
//               <BarChart2 className="h-6 w-6 text-primary-600" />
//             </div>
//             <div className="ml-4">
//               <h2 className="text-sm font-medium text-gray-500">Attendance Rate</h2>
//               <p className="text-2xl font-bold text-gray-900">{stats.attendanceRate.toFixed(1)}%</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow-md p-6">
//           <div className="flex items-center">
//             <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
//               <AlertCircle className="h-6 w-6 text-primary-600" />
//             </div>
//             <div className="ml-4">
//               <h2 className="text-sm font-medium text-gray-500">Pending Disputes</h2>
//               <p className="text-2xl font-bold text-gray-900">{stats.pendingDisputes}</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Today's Classes */}
//       <div className="mb-8">
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-lg font-semibold text-gray-900">Today's Classes</h2>
//           <Link to="/teacher/take-attendance" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
//             Take Attendance
//           </Link>
//         </div>

//         <div className="bg-white rounded-lg shadow-md overflow-hidden">
//           {todayClasses.length === 0 ? (
//             <div className="p-6 text-center">
//               <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
//               <p className="text-gray-500">No classes scheduled for today</p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Class
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Time
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Students
//                     </th>
//                     <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Action
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {todayClasses.map((cls) => (
//                     <tr key={cls._id}>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="flex items-center">
//                           <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
//                             <BookOpen className="h-5 w-5 text-primary-600" />
//                           </div>
//                           <div className="ml-4">
//                             <div className="text-sm font-medium text-gray-900">{cls.name}</div>
//                             <div className="text-xs text-gray-500">{cls.code}</div>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="flex items-center text-sm text-gray-900">
//                           <Clock className="h-4 w-4 text-gray-400 mr-1" />
//                           {formatTime(cls.schedule?.startTime)} - {formatTime(cls.schedule?.endTime)}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm text-gray-900">{cls.students?.length || 0} students</div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                         <Link
//                           to={`/teacher/take-attendance?classId=${cls._id}`}
//                           className="text-primary-600 hover:text-primary-900"
//                         >
//                           Take Attendance
//                         </Link>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Recent Attendance Photos */}
//       <div className="mb-8">
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-lg font-semibold text-gray-900">Recent Attendance Photos</h2>
//           <Link to="/teacher/records" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
//             View All Records
//           </Link>
//         </div>

//         {recentAttendance.length === 0 ? (
//           <div className="bg-white rounded-lg shadow-md p-6 text-center">
//             <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
//             <p className="text-gray-500">No recent attendance records</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {recentAttendance.slice(0, 6).map((record) => (
//               <div key={record._id} className="bg-white rounded-lg shadow-md overflow-hidden">
//                 {record.photoUrl ? (
//                   <div className="h-48 bg-gray-200">
//                     <img
//                       src={record.photoUrl || "/placeholder.svg"}
//                       alt={`Attendance for ${record.studentName}`}
//                       className="w-full h-full object-cover"
//                     />
//                   </div>
//                 ) : (
//                   <div className="h-48 bg-gray-200 flex items-center justify-center">
//                     <Camera className="h-12 w-12 text-gray-400" />
//                   </div>
//                 )}
//                 <div className="p-4">
//                   <div className="flex items-center mb-2">
//                     <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
//                       <Users className="h-5 w-5 text-primary-600" />
//                     </div>
//                     <div>
//                       <h3 className="font-medium text-gray-900">{record.studentName}</h3>
//                       <p className="text-xs text-gray-500">
//                         {record.date} • {record.time}
//                       </p>
//                     </div>
//                   </div>
//                   <div className="flex justify-between mt-2">
//                     <span
//                       className={`px-2 py-1 text-xs rounded-full ${
//                         record.status === "present" ? "bg-success-100 text-success-800" : "bg-error-100 text-error-800"
//                       }`}
//                     >
//                       {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
//                     </span>
//                     <Link
//                       to={`/teacher/attendance-photos/${record.classId}/${record.date}`}
//                       className="text-primary-600 hover:text-primary-700 text-sm"
//                     >
//                       View Details
//                     </Link>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* My Classes */}
//       <div>
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-lg font-semibold text-gray-900">My Classes</h2>
//           <Link to="/teacher/classes" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
//             View All Classes
//           </Link>
//         </div>

//         {classes.length === 0 ? (
//           <div className="bg-white rounded-lg shadow-md p-6 text-center">
//             <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-2" />
//             <p className="text-gray-500">No classes found</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {classes.slice(0, 6).map((cls) => (
//               <div key={cls._id} className="bg-white rounded-lg shadow-md p-6">
//                 <div className="flex items-center mb-4">
//                   <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
//                     <BookOpen className="h-6 w-6 text-primary-600" />
//                   </div>
//                   <div className="ml-4">
//                     <h3 className="text-lg font-medium text-gray-900">{cls.name}</h3>
//                     <p className="text-sm text-gray-500">{cls.code}</p>
//                   </div>
//                 </div>
//                 <div className="mb-4">
//                   <div className="flex items-center text-sm text-gray-600 mb-1">
//                     <Calendar className="h-4 w-4 mr-2" />
//                     <span>{cls.schedule?.days?.join(", ")}</span>
//                   </div>
//                   <div className="flex items-center text-sm text-gray-600">
//                     <Clock className="h-4 w-4 mr-2" />
//                     <span>
//                       {formatTime(cls.schedule?.startTime)} - {formatTime(cls.schedule?.endTime)}
//                     </span>
//                   </div>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <span className="text-sm text-gray-600">{cls.students?.length || 0} students</span>
//                   <Link
//                     to={`/teacher/class/${cls._id}`}
//                     className="text-primary-600 hover:text-primary-700 text-sm font-medium"
//                   >
//                     View Details
//                   </Link>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// export default TeacherDashboard

// "use client"

// import { useState, useEffect, useContext } from "react"
// import { Link } from "react-router-dom"
// import { Users, Calendar, Clock, BookOpen, Camera, BarChart2, AlertCircle } from "lucide-react"
// import AuthContext from "../../../contexts/AuthContext"
// import classService from "../../../services/classService"
// import attendanceService from "../../../services/attendanceService"
// import photoService from "../../../services/photoService"
// import NotificationBell from "../../../components/common/NotificationBell"

// const TeacherDashboard = () => {
//   const { currentUser } = useContext(AuthContext)
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)
//   const [classes, setClasses] = useState([])
//   const [recentAttendance, setRecentAttendance] = useState([])
//   const [stats, setStats] = useState({
//     totalStudents: 0,
//     totalClasses: 0,
//     attendanceRate: 0,
//     pendingDisputes: 0,
//   })
//   const [todayClasses, setTodayClasses] = useState([])
//   const [attendancePhotos, setAttendancePhotos] = useState([])

//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       try {
//         setLoading(true)
//         setError(null)

//         // Fetch teacher's classes
//         const classesResponse = await classService.getAllClasses()
//         setClasses(classesResponse.classes || [])

//         // Calculate total students across all classes
//         const totalStudents = classesResponse.classes.reduce((total, cls) => total + (cls.students?.length || 0), 0)

//         // Fetch recent attendance records
//         const today = new Date().toISOString().split("T")[0]
//         const recentAttendancePromises = classesResponse.classes.map((cls) =>
//           attendanceService.getClassAttendance(cls._id, { date: today }),
//         )

//         const attendanceResponses = await Promise.all(recentAttendancePromises)
//         const allRecentAttendance = attendanceResponses.flatMap((response) => response.attendanceRecords || [])

//         setRecentAttendance(allRecentAttendance)

//         // Calculate attendance rate
//         const presentCount = allRecentAttendance.filter((record) => record.status === "present").length
//         const attendanceRate = allRecentAttendance.length > 0 ? (presentCount / allRecentAttendance.length) * 100 : 0

//         // Get today's classes
//         const dayOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][
//           new Date().getDay()
//         ]
//         const todayClasses = classesResponse.classes.filter((cls) => cls.schedule?.days?.includes(dayOfWeek))

//         setTodayClasses(todayClasses)

//         // Fetch attendance photos for today
//         if (classesResponse.classes.length > 0) {
//           const photosPromises = classesResponse.classes.map((cls) =>
//             attendanceService.getAttendancePhotos(cls._id, today),
//           )

//           const photosResponses = await Promise.all(photosPromises)
//           const allPhotos = photosResponses.flatMap((response) => response.photos || [])
//           setAttendancePhotos(allPhotos)
//         }

//         // Set stats
//         setStats({
//           totalStudents,
//           totalClasses: classesResponse.classes.length,
//           attendanceRate,
//           pendingDisputes: 0, // This would come from a separate API call in a real implementation
//         })
//       } catch (err) {
//         console.error("Error fetching dashboard data:", err)
//         setError(err.response?.data?.message || "Failed to load dashboard data")
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchDashboardData()
//   }, [currentUser])

//   const formatTime = (timeString) => {
//     return timeString
//   }

//   if (loading) {
//     return (
//       <div className="p-6">
//         <div className="flex justify-center items-center h-64">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="p-6">
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
//           <p className="text-gray-600">Welcome back, {currentUser?.name}</p>
//         </div>
//         <div className="mt-4 md:mt-0">
//           <NotificationBell />
//         </div>
//       </div>

//       {error && (
//         <div className="mb-6 p-4 bg-error-50 text-error-700 rounded-md flex items-center">
//           <AlertCircle className="h-5 w-5 mr-2" />
//           {error}
//         </div>
//       )}

//       {/* Stats Overview */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         <div className="bg-white rounded-lg shadow-md p-6">
//           <div className="flex items-center">
//             <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
//               <Users className="h-6 w-6 text-primary-600" />
//             </div>
//             <div className="ml-4">
//               <h2 className="text-sm font-medium text-gray-500">Total Students</h2>
//               <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow-md p-6">
//           <div className="flex items-center">
//             <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
//               <BookOpen className="h-6 w-6 text-primary-600" />
//             </div>
//             <div className="ml-4">
//               <h2 className="text-sm font-medium text-gray-500">Total Classes</h2>
//               <p className="text-2xl font-bold text-gray-900">{stats.totalClasses}</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow-md p-6">
//           <div className="flex items-center">
//             <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
//               <BarChart2 className="h-6 w-6 text-primary-600" />
//             </div>
//             <div className="ml-4">
//               <h2 className="text-sm font-medium text-gray-500">Attendance Rate</h2>
//               <p className="text-2xl font-bold text-gray-900">{stats.attendanceRate.toFixed(1)}%</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow-md p-6">
//           <div className="flex items-center">
//             <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
//               <AlertCircle className="h-6 w-6 text-primary-600" />
//             </div>
//             <div className="ml-4">
//               <h2 className="text-sm font-medium text-gray-500">Pending Disputes</h2>
//               <p className="text-2xl font-bold text-gray-900">{stats.pendingDisputes}</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Today's Classes */}
//       <div className="mb-8">
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-lg font-semibold text-gray-900">Today's Classes</h2>
//           <Link to="/teacher/take-attendance" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
//             Take Attendance
//           </Link>
//         </div>

//         <div className="bg-white rounded-lg shadow-md overflow-hidden">
//           {todayClasses.length === 0 ? (
//             <div className="p-6 text-center">
//               <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
//               <p className="text-gray-500">No classes scheduled for today</p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Class
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Time
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Students
//                     </th>
//                     <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Action
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {todayClasses.map((cls) => (
//                     <tr key={cls._id}>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="flex items-center">
//                           <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
//                             <BookOpen className="h-5 w-5 text-primary-600" />
//                           </div>
//                           <div className="ml-4">
//                             <div className="text-sm font-medium text-gray-900">{cls.name}</div>
//                             <div className="text-xs text-gray-500">{cls.code}</div>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="flex items-center text-sm text-gray-900">
//                           <Clock className="h-4 w-4 text-gray-400 mr-1" />
//                           <span>
//                             {formatTime(cls.schedule?.startTime)} - {formatTime(cls.schedule?.endTime)}
//                           </span>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm text-gray-900">{cls.students?.length || 0} students</div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                         <Link
//                           to={`/teacher/take-attendance?classId=${cls._id}`}
//                           className="text-primary-600 hover:text-primary-900"
//                         >
//                           Take Attendance
//                         </Link>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Recent Attendance Photos */}
//       <div className="mb-8">
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-lg font-semibold text-gray-900">Recent Attendance Photos</h2>
//           <Link to="/teacher/records" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
//             View All Records
//           </Link>
//         </div>

//         {attendancePhotos.length === 0 ? (
//           <div className="bg-white rounded-lg shadow-md p-6 text-center">
//             <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
//             <p className="text-gray-500">No recent attendance photos</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {attendancePhotos.slice(0, 6).map((photo) => (
//               <div key={photo.id} className="bg-white rounded-lg shadow-md overflow-hidden">
//                 <div className="h-48 bg-gray-200">
//                   <img
//                     src={photo.photoData || photoService.getAttendancePhotoUrl(photo.photoUrl) || "/placeholder.svg"}
//                     alt={`Attendance for ${photo.studentName}`}
//                     className="w-full h-full object-cover"
//                   />
//                 </div>
//                 <div className="p-4">
//                   <div className="flex items-center mb-2">
//                     <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center mr-3 overflow-hidden">
//                       {photo.studentPhoto ? (
//                         <img
//                           src={photoService.getProfilePhotoUrl(photo.studentId) || "/placeholder.svg"}
//                           alt={photo.studentName}
//                           className="h-10 w-10 object-cover"
//                         />
//                       ) : (
//                         <Users className="h-5 w-5 text-primary-600" />
//                       )}
//                     </div>
//                     <div>
//                       <h3 className="font-medium text-gray-900">{photo.studentName}</h3>
//                       <p className="text-xs text-gray-500">
//                         {new Date().toISOString().split("T")[0]} • {photo.time}
//                       </p>
//                     </div>
//                   </div>
//                   <div className="flex justify-between mt-2">
//                     {photo.emotion && (
//                       <span className="px-2 py-1 text-xs rounded-full bg-primary-100 text-primary-800">
//                         {photo.emotion}
//                       </span>
//                     )}
//                     <Link
//                       to={`/teacher/attendance-photos/${photo.classId}/${new Date().toISOString().split("T")[0]}`}
//                       className="text-primary-600 hover:text-primary-700 text-sm"
//                     >
//                       View Details
//                     </Link>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* My Classes */}
//       <div>
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-lg font-semibold text-gray-900">My Classes</h2>
//           <Link to="/teacher/classes" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
//             View All Classes
//           </Link>
//         </div>

//         {classes.length === 0 ? (
//           <div className="bg-white rounded-lg shadow-md p-6 text-center">
//             <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-2" />
//           </div>
//         )}
//       </div>
//     );
//   };

//   export default TeacherDashboard;


// "use client"

// import { useState, useEffect, useContext } from "react"
// import { Link } from "react-router-dom"
// import { Users, Calendar, Clock, BookOpen, Camera, BarChart2, AlertCircle } from "lucide-react"
// import AuthContext from "../../../contexts/AuthContext"
// import classService from "../../../services/classService"
// import attendanceService from "../../../services/attendanceService"
// import photoService from "../../../services/photoService"
// import NotificationBell from "../../../components/common/NotificationBell"

// const TeacherDashboard = () => {
//   const { currentUser } = useContext(AuthContext)
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)
//   const [classes, setClasses] = useState([])
//   const [recentAttendance, setRecentAttendance] = useState([])
//   const [stats, setStats] = useState({
//     totalStudents: 0,
//     totalClasses: 0,
//     attendanceRate: 0,
//     pendingDisputes: 0,
//   })
//   const [todayClasses, setTodayClasses] = useState([])
//   const [attendancePhotos, setAttendancePhotos] = useState([])

//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       try {
//         setLoading(true)
//         setError(null)

//         // Fetch teacher's classes
//         const classesResponse = await classService.getAllClasses()
//         const validClasses = classesResponse.classes || []
//         setClasses(validClasses)

//         // Calculate total students across all classes
//         const totalStudents = validClasses.reduce(
//           (total, cls) => total + (cls.students?.length || 0),
//           0
//         )

//         // Fetch recent attendance records
//         const today = new Date().toISOString().split("T")[0]
//         const recentAttendancePromises = validClasses.map((cls) =>
//           attendanceService.getClassAttendance(cls._id, { date: today })
//         )
//         const attendanceResponses = await Promise.all(recentAttendancePromises)
//         const allRecentAttendance = attendanceResponses.flatMap(
//           (response) => response.attendanceRecords || []
//         )
//         setRecentAttendance(allRecentAttendance)

//         // Calculate attendance rate
//         const presentCount = allRecentAttendance.filter(
//           (record) => record.status === "present"
//         ).length
//         const attendanceRate = allRecentAttendance.length > 0 
//           ? (presentCount / allRecentAttendance.length) * 100 
//           : 0

//         // Get today's classes
//         const dayOfWeek = [
//           "sunday", "monday", "tuesday", "wednesday",
//           "thursday", "friday", "saturday"
//         ][new Date().getDay()]
//         const todayClasses = validClasses.filter((cls) =>
//           cls.schedule?.days?.includes(dayOfWeek)
//         )
//         setTodayClasses(todayClasses)

//         // Fetch attendance photos for today
//         if (validClasses.length > 0) {
//           const photosPromises = validClasses.map((cls) =>
//             attendanceService.getAttendancePhotos(cls._id, today)
//           )
//           const photosResponses = await Promise.all(photosPromises)
//           const allPhotos = photosResponses.flatMap((response) => response.photos || [])
//           setAttendancePhotos(allPhotos)
//         }

//         // Set stats
//         setStats({
//           totalStudents,
//           totalClasses: validClasses.length,
//           attendanceRate,
//           pendingDisputes: 0,
//         })

//       } catch (err) {
//         console.error("Error fetching dashboard data:", err)
//         setError(err.response?.data?.message || "Failed to load dashboard data")
//       } finally {
//         setLoading(false)
//       }
//     }

//     if (currentUser) {
//       fetchDashboardData()
//     }
//   }, [currentUser])

//   const formatTime = (timeString) => {
//     if (!timeString) return "--:--"
//     try {
//       const [hours, minutes] = timeString.split(":")
//       const date = new Date()
//       date.setHours(parseInt(hours))
//       date.setMinutes(parseInt(minutes))
//       return date.toLocaleTimeString([], { 
//         hour: '2-digit', 
//         minute: '2-digit',
//         hour12: true
//       })
//     } catch {
//       return timeString
//     }
//   }

//   if (loading) {
//     return (
//       <div className="p-6">
//         <div className="flex justify-center items-center h-64">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="p-6">
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
//           <p className="text-gray-600">Welcome back, {currentUser?.name}</p>
//         </div>
//         <div className="mt-4 md:mt-0">
//           <NotificationBell />
//         </div>
//       </div>

//       {error && (
//         <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md flex items-center">
//           <AlertCircle className="h-5 w-5 mr-2" />
//           {error}
//         </div>
//       )}

//       {/* Stats Overview */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         <div className="bg-white rounded-lg shadow-md p-6">
//           <div className="flex items-center">
//             <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
//               <Users className="h-6 w-6 text-blue-600" />
//             </div>
//             <div className="ml-4">
//               <h2 className="text-sm font-medium text-gray-500">Total Students</h2>
//               <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow-md p-6">
//           <div className="flex items-center">
//             <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
//               <BookOpen className="h-6 w-6 text-green-600" />
//             </div>
//             <div className="ml-4">
//               <h2 className="text-sm font-medium text-gray-500">Total Classes</h2>
//               <p className="text-2xl font-bold text-gray-900">{stats.totalClasses}</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow-md p-6">
//           <div className="flex items-center">
//             <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
//               <BarChart2 className="h-6 w-6 text-purple-600" />
//             </div>
//             <div className="ml-4">
//               <h2 className="text-sm font-medium text-gray-500">Attendance Rate</h2>
//               <p className="text-2xl font-bold text-gray-900">
//                 {stats.attendanceRate.toFixed(1)}%
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow-md p-6">
//           <div className="flex items-center">
//             <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
//               <AlertCircle className="h-6 w-6 text-yellow-600" />
//             </div>
//             <div className="ml-4">
//               <h2 className="text-sm font-medium text-gray-500">Pending Disputes</h2>
//               <p className="text-2xl font-bold text-gray-900">{stats.pendingDisputes}</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Today's Classes */}
//       <div className="mb-8">
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-lg font-semibold text-gray-900">Today's Classes</h2>
//           <Link 
//             to="/teacher/take-attendance" 
//             className="text-blue-600 hover:text-blue-700 text-sm font-medium"
//           >
//             Take Attendance
//           </Link>
//         </div>

//         <div className="bg-white rounded-lg shadow-md overflow-hidden">
//           {todayClasses.length === 0 ? (
//             <div className="p-6 text-center">
//               <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
//               <p className="text-gray-500">No classes scheduled for today</p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Class
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Time
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Students
//                     </th>
//                     <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Action
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {todayClasses.map((cls) => (
//                     <tr key={cls._id}>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="flex items-center">
//                           <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
//                             <BookOpen className="h-5 w-5 text-blue-600" />
//                           </div>
//                           <div className="ml-4">
//                             <div className="text-sm font-medium text-gray-900">{cls.name}</div>
//                             <div className="text-xs text-gray-500">{cls.code}</div>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="flex items-center text-sm text-gray-900">
//                           <Clock className="h-4 w-4 text-gray-400 mr-1" />
//                           <span>
//                             {formatTime(cls.schedule?.startTime)} - {formatTime(cls.schedule?.endTime)}
//                           </span>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm text-gray-900">
//                           {cls.students?.length || 0} students
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                         <Link
//                           to={`/teacher/take-attendance?classId=${cls._id}`}
//                           className="text-blue-600 hover:text-blue-900"
//                         >
//                           Take Attendance
//                         </Link>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Recent Attendance Photos */}
//       <div className="mb-8">
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-lg font-semibold text-gray-900">Recent Attendance Photos</h2>
//           <Link 
//             to="/teacher/records" 
//             className="text-blue-600 hover:text-blue-700 text-sm font-medium"
//           >
//             View All Records
//           </Link>
//         </div>

//         {attendancePhotos.length === 0 ? (
//           <div className="bg-white rounded-lg shadow-md p-6 text-center">
//             <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
//             <p className="text-gray-500">No recent attendance photos</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {attendancePhotos.slice(0, 6).map((photo) => (
//               <div key={photo.id} className="bg-white rounded-lg shadow-md overflow-hidden">
//                 <div className="h-48 bg-gray-200">
//                   <img
//                     src={photo.photoData || photoService.getAttendancePhotoUrl(photo.photoUrl) || "/placeholder.svg"}
//                     alt={`Attendance for ${photo.studentName}`}
//                     className="w-full h-full object-cover"
//                     onError={(e) => {
//                       e.target.src = "/placeholder.svg"
//                     }}
//                   />
//                 </div>
//                 <div className="p-4">
//                   <div className="flex items-center mb-2">
//                     <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 overflow-hidden">
//                       {photo.studentPhoto ? (
//                         <img
//                           src={photoService.getProfilePhotoUrl(photo.studentId) || "/placeholder.svg"}
//                           alt={photo.studentName}
//                           className="h-10 w-10 object-cover"
//                         />
//                       ) : (
//                         <Users className="h-5 w-5 text-blue-600" />
//                       )}
//                     </div>
//                     <div>
//                       <h3 className="font-medium text-gray-900">{photo.studentName}</h3>
//                       <p className="text-xs text-gray-500">
//                         {new Date().toISOString().split("T")[0]} • {photo.time}
//                       </p>
//                     </div>
//                   </div>
//                   <div className="flex justify-between mt-2">
//                     {photo.emotion && (
//                       <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
//                         {photo.emotion}
//                       </span>
//                     )}
//                     <Link
//                       to={`/teacher/attendance-photos/${photo.classId}/${new Date().toISOString().split("T")[0]}`}
//                       className="text-blue-600 hover:text-blue-700 text-sm"
//                     >
//                       View Details
//                     </Link>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* My Classes */}
//       <div>
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-lg font-semibold text-gray-900">My Classes</h2>
//           <Link 
//             to="/teacher/classes" 
//             className="text-blue-600 hover:text-blue-700 text-sm font-medium"
//           >
//             View All Classes
//           </Link>
//         </div>

//         {classes.length === 0 ? (
//           <div className="bg-white rounded-lg shadow-md p-6 text-center">
//             <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-2" />
//             <p className="text-gray-500">No classes found</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {classes.map((cls) => (
//               <div key={cls._id} className="bg-white rounded-lg shadow-md p-4">
//                 <div className="flex items-center mb-2">
//                   <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
//                     <BookOpen className="h-5 w-5 text-blue-600" />
//                   </div>
//                   <div className="ml-3">
//                     <h3 className="font-medium text-gray-900">{cls.name}</h3>
//                     <p className="text-sm text-gray-500">{cls.code}</p>
//                   </div>
//                 </div>
//                 <div className="mt-2 text-sm text-gray-600">
//                   <p>{cls.students?.length || 0} students</p>
//                   {cls.schedule?.days && (
//                     <p className="mt-1">Meets: {cls.schedule.days.join(", ")}</p>
//                   )}
//                 </div>
//                 <div className="mt-4 text-right">
//                   <Link
//                     to={`/teacher/classes/${cls._id}`}
//                     className="text-blue-600 hover:text-blue-700 text-sm"
//                   >
//                     View Details
//                   </Link>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// export default TeacherDashboard




"use client"

import { useState, useEffect, useContext } from "react"
import { Link } from "react-router-dom"
import { Users, Calendar, Clock, BookOpen, Camera, BarChart2, AlertCircle } from "lucide-react"
import AuthContext from "../../../contexts/AuthContext"
import classService from "../../../services/classService"
import attendanceService from "../../../services/attendanceService"
import photoService from "../../../services/photoService"
import NotificationBell from "../../../components/common/NotificationBell"

const TeacherDashboard = () => {
  const { currentUser } = useContext(AuthContext)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [classes, setClasses] = useState([])
  const [recentAttendance, setRecentAttendance] = useState([])
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClasses: 0,
    attendanceRate: 0,
    pendingDisputes: 0,
  })
  const [todayClasses, setTodayClasses] = useState([])
  const [attendancePhotos, setAttendancePhotos] = useState([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch teacher's classes
        const classesResponse = await classService.getAllClasses()
        const validClasses = classesResponse.classes || []
        setClasses(validClasses)

        // Calculate total students across all classes
        const totalStudents = validClasses.reduce(
          (total, cls) => total + (cls.students?.length || 0),
          0
        )

        // Fetch recent attendance records
        const today = new Date().toISOString().split("T")[0]
        const recentAttendancePromises = validClasses.map((cls) =>
          attendanceService.getClassAttendance(cls._id, { date: today })
        )
        const attendanceResponses = await Promise.all(recentAttendancePromises)
        const allRecentAttendance = attendanceResponses.flatMap(
          (response) => response.attendanceRecords || []
        )
        setRecentAttendance(allRecentAttendance)

        // Calculate attendance rate
        const presentCount = allRecentAttendance.filter(
          (record) => record.status === "present"
        ).length
        const attendanceRate = allRecentAttendance.length > 0 
          ? (presentCount / allRecentAttendance.length) * 100 
          : 0

        // Get today's classes
        const dayOfWeek = [
          "sunday", "monday", "tuesday", "wednesday",
          "thursday", "friday", "saturday"
        ][new Date().getDay()]
        const todayClasses = validClasses.filter((cls) =>
          cls.schedule?.days?.includes(dayOfWeek)
        )
        setTodayClasses(todayClasses)

        // Fetch attendance photos for today
        if (validClasses.length > 0) {
          const photosPromises = validClasses.map((cls) =>
            attendanceService.getAttendancePhotos(cls._id, today)
          )
          const photosResponses = await Promise.all(photosPromises)
          const allPhotos = photosResponses.flatMap((response) => response.photos || [])
          setAttendancePhotos(allPhotos)
        }

        // Set stats
        setStats({
          totalStudents,
          totalClasses: validClasses.length,
          attendanceRate,
          pendingDisputes: 0, // You can adjust this if you have a real count of disputes
        })

      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError(err.message || "Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    if (currentUser) {
      fetchDashboardData()
    }
  }, [currentUser])

  const formatTime = (timeString) => {
    if (!timeString) return "--:--"
    try {
      const [hours, minutes] = timeString.split(":")
      const date = new Date()
      date.setHours(parseInt(hours))
      date.setMinutes(parseInt(minutes))
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      })
    } catch {
      return timeString
    }
  }

  if (loading) {
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
          <p className="text-gray-600">Welcome back, {currentUser?.name}</p>
        </div>
        <div className="mt-4 md:mt-0">
          <NotificationBell />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Total Students</h2>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Total Classes</h2>
              <p className="text-2xl font-bold text-gray-900">{stats.totalClasses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <BarChart2 className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Attendance Rate</h2>
              <p className="text-2xl font-bold text-gray-900">
                {stats.attendanceRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Pending Disputes</h2>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingDisputes}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Classes */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Today's Classes</h2>
          <Link 
            to="/teacher/take-attendance" 
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Take Attendance
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {todayClasses.length === 0 ? (
            <div className="p-6 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No classes scheduled for today</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      End Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {todayClasses.map((cls) => (
                    <tr key={cls._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {cls.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTime(cls.schedule?.startTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTime(cls.schedule?.endTime)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Attendance Photos */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Attendance Photos</h2>
        {attendancePhotos.length === 0 ? (
          <div className="text-center p-6">
            <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No attendance photos available for today</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {attendancePhotos.map((photo, index) => (
              <div key={index} className="relative">
                <img
                  src={photo.url || "/placeholder.svg"}
                  alt={photo.studentName}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1">
                  {photo.studentName}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default TeacherDashboard
