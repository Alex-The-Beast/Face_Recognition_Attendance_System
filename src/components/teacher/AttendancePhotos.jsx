// "use client"

// import { useState, useEffect } from "react"
// import { useParams } from "react-router-dom"
// import { Calendar, Clock, User, AlertCircle, Camera, Heart, Brain } from "lucide-react"
// import attendanceService from "../../../services/attendanceService"

// const AttendancePhotos = () => {
//   const { classId, date } = useParams()
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)
//   const [photos, setPhotos] = useState([])
//   const [selectedPhoto, setSelectedPhoto] = useState(null)
//   const [showModal, setShowModal] = useState(false)

//   useEffect(() => {
//     const fetchAttendancePhotos = async () => {
//       try {
//         setLoading(true)
//         setError(null)

//         const response = await attendanceService.getAttendancePhotos(classId, date)
//         setPhotos(response.photos || [])
//       } catch (err) {
//         console.error("Error fetching attendance photos:", err)
//         setError(err.response?.data?.message || "Failed to load attendance photos")
//       } finally {
//         setLoading(false)
//       }
//     }

//     if (classId && date) {
//       fetchAttendancePhotos()
//     }
//   }, [classId, date])

//   const handlePhotoClick = (photo) => {
//     setSelectedPhoto(photo)
//     setShowModal(true)
//   }

//   const closeModal = () => {
//     setShowModal(false)
//     setSelectedPhoto(null)
//   }

//   const formatDate = (dateString) => {
//     const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
//     return new Date(dateString).toLocaleDateString(undefined, options)
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

//   if (error) {
//     return (
//       <div className="p-6">
//         <div className="bg-error-50 text-error-700 p-4 rounded-md flex items-center">
//           <AlertCircle className="h-5 w-5 mr-2" />
//           {error}
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="p-6">
//       <div className="mb-6">
//         <h1 className="text-2xl font-bold text-gray-900">Attendance Photos</h1>
//         <div className="flex items-center mt-2 text-gray-600">
//           <Calendar className="h-5 w-5 mr-2" />
//           <span>{formatDate(date)}</span>
//         </div>
//       </div>

//       {photos.length === 0 ? (
//         <div className="bg-white rounded-lg shadow-md p-8 text-center">
//           <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//           <p className="text-gray-500">No attendance photos available for this date</p>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {photos.map((photo) => (
//             <div
//               key={photo.id}
//               className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
//               onClick={() => handlePhotoClick(photo)}
//             >
//               <div className="relative h-48 bg-gray-200">
//                 <img
//                   src={photo.photoUrl || "/placeholder.svg"}
//                   alt={`Attendance for ${photo.studentName}`}
//                   className="w-full h-full object-cover"
//                 />
//                 <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
//                   <div className="flex items-center">
//                     <Clock className="h-4 w-4 mr-1" />
//                     <span className="text-sm">{photo.time}</span>
//                   </div>
//                 </div>
//               </div>
//               <div className="p-4">
//                 <div className="flex items-center mb-2">
//                   <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
//                     {photo.studentPhoto ? (
//                       <img
//                         src={photo.studentPhoto || "/placeholder.svg"}
//                         alt={photo.studentName}
//                         className="h-10 w-10 rounded-full object-cover"
//                       />
//                     ) : (
//                       <User className="h-5 w-5 text-primary-600" />
//                     )}
//                   </div>
//                   <div>
//                     <h3 className="font-medium text-gray-900">{photo.studentName}</h3>
//                     <p className="text-sm text-gray-500">{photo.studentEmail}</p>
//                   </div>
//                 </div>

//                 <div className="flex justify-between mt-3 text-sm">
//                   {photo.emotion && (
//                     <div className="flex items-center text-gray-600">
//                       <Heart className="h-4 w-4 mr-1" />
//                       <span>{photo.emotion}</span>
//                     </div>
//                   )}

//                   {photo.attention && (
//                     <div className="flex items-center text-gray-600">
//                       <Brain className="h-4 w-4 mr-1" />
//                       <span>{Math.round(photo.attention * 100)}% attention</span>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Photo Detail Modal */}
//       {showModal && selectedPhoto && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
//             <div className="flex justify-between items-center p-4 border-b">
//               <h3 className="text-lg font-medium">Attendance Photo Details</h3>
//               <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
//                 <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               </button>
//             </div>

//             <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="bg-black rounded-lg overflow-hidden">
//                 <img
//                   src={selectedPhoto.photoUrl || "/placeholder.svg"}
//                   alt={`Attendance for ${selectedPhoto.studentName}`}
//                   className="w-full h-auto max-h-[60vh] object-contain"
//                 />
//               </div>

//               <div>
//                 <div className="mb-6">
//                   <h4 className="text-sm font-medium text-gray-500 mb-1">Student</h4>
//                   <div className="flex items-center">
//                     <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center mr-3">
//                       {selectedPhoto.studentPhoto ? (
//                         <img
//                           src={selectedPhoto.studentPhoto || "/placeholder.svg"}
//                           alt={selectedPhoto.studentName}
//                           className="h-12 w-12 rounded-full object-cover"
//                         />
//                       ) : (
//                         <User className="h-6 w-6 text-primary-600" />
//                       )}
//                     </div>
//                     <div>
//                       <p className="font-medium text-gray-900">{selectedPhoto.studentName}</p>
//                       <p className="text-sm text-gray-500">{selectedPhoto.studentEmail}</p>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="mb-6">
//                   <h4 className="text-sm font-medium text-gray-500 mb-1">Date & Time</h4>
//                   <div className="flex items-center">
//                     <Calendar className="h-5 w-5 text-gray-400 mr-2" />
//                     <span>{formatDate(date)}</span>
//                   </div>
//                   <div className="flex items-center mt-1">
//                     <Clock className="h-5 w-5 text-gray-400 mr-2" />
//                     <span>{selectedPhoto.time}</span>
//                   </div>
//                 </div>

//                 {(selectedPhoto.emotion || selectedPhoto.attention) && (
//                   <div className="mb-6">
//                     <h4 className="text-sm font-medium text-gray-500 mb-1">Analysis</h4>

//                     {selectedPhoto.emotion && (
//                       <div className="flex items-center mb-2">
//                         <Heart className="h-5 w-5 text-gray-400 mr-2" />
//                         <span>
//                           Emotion: <span className="font-medium">{selectedPhoto.emotion}</span>
//                         </span>
//                       </div>
//                     )}

//                     {selectedPhoto.attention && (
//                       <div className="flex items-center">
//                         <Brain className="h-5 w-5 text-gray-400 mr-2" />
//                         <span>
//                           Attention: <span className="font-medium">{Math.round(selectedPhoto.attention * 100)}%</span>
//                         </span>
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// export default AttendancePhotos


"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { Calendar, Clock, User, AlertCircle, Camera, Heart, Brain } from "lucide-react"
import attendanceService from "../../../services/attendanceService"
import photoService from "../../../services/photoService"

const AttendancePhotos = () => {
  const { classId, date } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [photos, setPhotos] = useState([])
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const fetchAttendancePhotos = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await attendanceService.getAttendancePhotos(classId, date)
        setPhotos(response.photos || [])
      } catch (err) {
        console.error("Error fetching attendance photos:", err)
        setError(err.response?.data?.message || "Failed to load attendance photos")
      } finally {
        setLoading(false)
      }
    }

    if (classId && date) {
      fetchAttendancePhotos()
    }
  }, [classId, date])

  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedPhoto(null)
  }

  const formatDate = (dateString) => {
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
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

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-error-50 text-error-700 p-4 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Attendance Photos</h1>
        <div className="flex items-center mt-2 text-gray-600">
          <Calendar className="h-5 w-5 mr-2" />
          <span>{formatDate(date)}</span>
        </div>
      </div>

      {photos.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No attendance photos available for this date</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handlePhotoClick(photo)}
            >
              <div className="relative h-48 bg-gray-200">
                <img
                  src={photo.photoData || photoService.getAttendancePhotoUrl(photo.photoUrl) || "/placeholder.svg"}
                  alt={`Attendance for ${photo.studentName}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="text-sm">{photo.time}</span>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center mb-2">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                    {photo.studentPhoto ? (
                      <img
                        src={photoService.getProfilePhotoUrl(photo.studentId) || "/placeholder.svg"}
                        alt={photo.studentName}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 text-primary-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{photo.studentName}</h3>
                    <p className="text-sm text-gray-500">{photo.studentEmail}</p>
                  </div>
                </div>

                <div className="flex justify-between mt-3 text-sm">
                  {photo.emotion && (
                    <div className="flex items-center text-gray-600">
                      <Heart className="h-4 w-4 mr-1" />
                      <span>{photo.emotion}</span>
                    </div>
                  )}

                  {photo.attention && (
                    <div className="flex items-center text-gray-600">
                      <Brain className="h-4 w-4 mr-1" />
                      <span>{Math.round(photo.attention * 100)}% attention</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Photo Detail Modal */}
      {showModal && selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-medium">Attendance Photo Details</h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-black rounded-lg overflow-hidden">
                <img
                  src={
                    selectedPhoto.photoData ||
                    photoService.getAttendancePhotoUrl(selectedPhoto.photoUrl) ||
                    "/placeholder.svg"
                  }
                  alt={`Attendance for ${selectedPhoto.studentName}`}
                  className="w-full h-auto max-h-[60vh] object-contain"
                />
              </div>

              <div>
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Student</h4>
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                      {selectedPhoto.studentPhoto ? (
                        <img
                          src={photoService.getProfilePhotoUrl(selectedPhoto.studentId) || "/placeholder.svg"}
                          alt={selectedPhoto.studentName}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-6 w-6 text-primary-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{selectedPhoto.studentName}</p>
                      <p className="text-sm text-gray-500">{selectedPhoto.studentEmail}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Date & Time</h4>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <span>{formatDate(date)}</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <Clock className="h-5 w-5 text-gray-400 mr-2" />
                    <span>{selectedPhoto.time}</span>
                  </div>
                </div>

                {(selectedPhoto.emotion || selectedPhoto.attention) && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Analysis</h4>

                    {selectedPhoto.emotion && (
                      <div className="flex items-center mb-2">
                        <Heart className="h-5 w-5 text-gray-400 mr-2" />
                        <span>
                          Emotion: <span className="font-medium">{selectedPhoto.emotion}</span>
                        </span>
                      </div>
                    )}

                    {selectedPhoto.attention && (
                      <div className="flex items-center">
                        <Brain className="h-5 w-5 text-gray-400 mr-2" />
                        <span>
                          Attention: <span className="font-medium">{Math.round(selectedPhoto.attention * 100)}%</span>
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AttendancePhotos
