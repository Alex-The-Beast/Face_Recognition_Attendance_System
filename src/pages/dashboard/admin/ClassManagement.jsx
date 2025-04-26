"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { BookOpen, Search, Plus, Edit2, Trash2, Users, X, AlertCircle, CheckCircle } from "lucide-react"
import classService from "../../../services/classService"
import userService from "../../../services/userService"

const ClassManagement = () => {
  const [classes, setClasses] = useState([])
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [editingClass, setEditingClass] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClass, setSelectedClass] = useState(null)
  const [students, setStudents] = useState([])
  const [availableStudents, setAvailableStudents] = useState([])

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm()

  // Load classes and teachers
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch classes
        const classesResponse = await classService.getAllClasses()
        setClasses(classesResponse.classes || [])
        

        // Fetch teachers
        const usersResponse = await userService.getAllUsers()
        const teachersList = (usersResponse.users || []).filter((user) => user.role === "teacher")
        setTeachers(teachersList)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(err.response?.data?.message || "Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Load students for selected class
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClass) return

      try {
        setLoading(true)

        // Fetch students in the class
        const studentsResponse = await classService.getClassStudents(selectedClass._id)
        setStudents(studentsResponse.students || [])

        // Fetch all students to find available ones
        const usersResponse = await userService.getAllUsers()
        const allStudents = (usersResponse.users || []).filter((user) => user.role === "student")

        // Filter out students already in the class
        const classStudentIds = (studentsResponse.students || []).map((student) => student._id)
        const availableStudentsList = allStudents.filter((student) => !classStudentIds.includes(student._id))

        setAvailableStudents(availableStudentsList)
      } catch (err) {
        console.error("Error fetching students:", err)
        setError(err.response?.data?.message || "Failed to load students")
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [selectedClass])

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      // Format schedule data
      const formattedData = {
        ...data,
        schedule: {
          days: Array.isArray(data.days) ? data.days : [data.days],
          startTime: data.startTime,
          endTime: data.endTime,
        },
      }

      // Remove individual schedule fields
      delete formattedData.days
      delete formattedData.startTime
      delete formattedData.endTime

      let response

      if (editingClass) {
        // Update existing class
        response = await classService.updateClass(editingClass._id, formattedData)

        // Update the class in the state
        setClasses(classes.map((c) => (c._id === editingClass._id ? response.class : c)))
        setSuccess("Class updated successfully")
      } else {
        // Create new class
        response = await classService.createClass(formattedData)

        // Add the new class to the state
        setClasses([...classes, response.class])
        setSuccess("Class created successfully")
      }

      // Reset form and state
      reset()
      setEditingClass(null)
      setShowForm(false)
    } catch (err) {
      console.error("Error saving class:", err)
      setError(err.response?.data?.message || "Failed to save class")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (classItem) => {
    setEditingClass(classItem)
    setShowForm(true)

    // Set form values
    setValue("name", classItem.name)
    setValue("description", classItem.description)
    setValue("teacherId", classItem.teacherId)
    setValue("days", classItem.schedule.days)
    setValue("startTime", classItem.schedule.startTime)
    setValue("endTime", classItem.schedule.endTime)
    setValue("isActive", classItem.isActive)
  }

  const handleDelete = async (id) => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      await classService.deleteClass(id)

      // Remove the class from the state
      setClasses(classes.filter((c) => c._id !== id))
      setShowDeleteConfirm(null)
      setSuccess("Class deleted successfully")
    } catch (err) {
      console.error("Error deleting class:", err)
      setError(err.response?.data?.message || "Failed to delete class")
    } finally {
      setLoading(false)
    }
  }

  const handleAddStudent = async (studentId) => {
    if (!selectedClass) return

    try {
      setLoading(true)
      setError(null)

      await classService.addStudentToClass(selectedClass._id, studentId)

      // Refresh students list
      const studentsResponse = await classService.getClassStudents(selectedClass._id)
      setStudents(studentsResponse.students || [])

      // Update available students
      setAvailableStudents(availableStudents.filter((student) => student._id !== studentId))

      setSuccess("Student added to class successfully")
    } catch (err) {
      console.error("Error adding student:", err)
      setError(err.response?.data?.message || "Failed to add student to class")
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveStudent = async (studentId) => {
    if (!selectedClass) return

    try {
      setLoading(true)
      setError(null)

      await classService.removeStudentFromClass(selectedClass._id, studentId)

      // Find the removed student
      const removedStudent = students.find((student) => student._id === studentId)

      // Update students list
      setStudents(students.filter((student) => student._id !== studentId))

      // Add to available students if found
      if (removedStudent) {
        setAvailableStudents([...availableStudents, removedStudent])
      }

      setSuccess("Student removed from class successfully")
    } catch (err) {
      console.error("Error removing student:", err)
      setError(err.response?.data?.message || "Failed to remove student from class")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setEditingClass(null)
    setShowForm(false)
    reset()
  }

  const handleViewClass = (classItem) => {
    setSelectedClass(classItem)
  }

  const handleBackToClasses = () => {
    setSelectedClass(null)
  }

  // Filter classes based on search term
  const filteredClasses = classes.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  // Find teacher name by ID
  const getTeacherName = (teacherId) => {
    const teacher = teachers.find((t) => t._id === teacherId)
    return teacher ? teacher.name : "Unknown"
  }

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
      {selectedClass ? (
        // Class Detail View
        <div>
          <div className="flex justify-between items-center mb-6">
            <button onClick={handleBackToClasses} className="flex items-center text-primary-600 hover:text-primary-700">
              <X className="h-5 w-5 mr-1" />
              Back to Classes
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{selectedClass.name}</h1>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-error-50 text-error-700 rounded-md flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-success-50 text-success-700 rounded-md flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 col-span-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Class Information</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="text-gray-900">{selectedClass.description || "No description"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Teacher</p>
                  <p className="text-gray-900">{getTeacherName(selectedClass.teacherId)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Schedule</p>
                  <p className="text-gray-900">
                    {selectedClass.schedule.days.join(", ")} <br />
                    {selectedClass.schedule.startTime} - {selectedClass.schedule.endTime}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      selectedClass.isActive ? "bg-success-100 text-success-800" : "bg-error-100 text-error-800"
                    }`}
                  >
                    {selectedClass.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 col-span-1 lg:col-span-2">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Students</h2>

              {students.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No students in this class</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students.map((student) => (
                        <tr key={student._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                <Users className="h-5 w-5 text-primary-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{student.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{student.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleRemoveStudent(student._id)}
                              className="text-error-600 hover:text-error-900"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {availableStudents.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Add Students</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableStudents.map((student) => (
                      <div key={student._id} className="border rounded-md p-3 flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{student.name}</p>
                          <p className="text-xs text-gray-500">{student.email}</p>
                        </div>
                        <button
                          onClick={() => handleAddStudent(student._id)}
                          className="p-1 bg-primary-50 text-primary-600 rounded-full hover:bg-primary-100"
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Classes List View
        <div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Class Management</h1>
            <button
              onClick={() => {
                setShowForm(true)
                setEditingClass(null)
                reset()
              }}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Class
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-error-50 text-error-700 rounded-md flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-success-50 text-success-700 rounded-md flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              {success}
            </div>
          )}

          {showForm && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">{editingClass ? "Edit Class" : "Add New Class"}</h2>
                <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Class Name*
                    </label>
                    <input
                      id="name"
                      type="text"
                      {...register("name", { required: "Class name is required" })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                    {errors.name && <p className="mt-1 text-sm text-error-600">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="teacherId" className="block text-sm font-medium text-gray-700 mb-1">
                      Teacher*
                    </label>
                    <select
                      id="teacherId"
                      {...register("teacherId", { required: "Teacher is required" })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select a teacher</option>
                      {teachers.map((teacher) => (
                        <option key={teacher._id} value={teacher._id}>
                          {teacher.name}
                        </option>
                      ))}
                    </select>
                    {errors.teacherId && <p className="mt-1 text-sm text-error-600">{errors.teacherId.message}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      rows={3}
                      {...register("description")}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    ></textarea>
                  </div>

                  <div>
                    <label htmlFor="days" className="block text-sm font-medium text-gray-700 mb-1">
                      Days*
                    </label>
                    <select
                      id="days"
                      multiple
                      {...register("days", { required: "Days are required" })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="Monday">Monday</option>
                      <option value="Tuesday">Tuesday</option>
                      <option value="Wednesday">Wednesday</option>
                      <option value="Thursday">Thursday</option>
                      <option value="Friday">Friday</option>
                      <option value="Saturday">Saturday</option>
                      <option value="Sunday">Sunday</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple days</p>
                    {errors.days && <p className="mt-1 text-sm text-error-600">{errors.days.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                        Start Time*
                      </label>
                      <input
                        id="startTime"
                        type="time"
                        {...register("startTime", { required: "Start time is required" })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      />
                      {errors.startTime && <p className="mt-1 text-sm text-error-600">{errors.startTime.message}</p>}
                    </div>

                    <div>
                      <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                        End Time*
                      </label>
                      <input
                        id="endTime"
                        type="time"
                        {...register("endTime", { required: "End time is required" })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      />
                      {errors.endTime && <p className="mt-1 text-sm text-error-600">{errors.endTime.message}</p>}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="isActive"
                      type="checkbox"
                      {...register("isActive")}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                      Active
                    </label>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="mr-4 px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    {loading ? "Saving..." : "Save Class"}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="relative">
                  <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search classes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 w-full sm:w-64"
                  />
                </div>
              </div>
            </div>

            {filteredClasses.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No classes found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Class Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Teacher
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Schedule
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredClasses.map((classItem) => (
                      <tr key={classItem._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <BookOpen className="h-5 w-5 text-primary-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{classItem.name}</div>
                              <div className="text-sm text-gray-500">
                                {classItem.description
                                  ? classItem.description.substring(0, 30) + "..."
                                  : "No description"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{getTeacherName(classItem.teacherId)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{classItem.schedule.days.join(", ")}</div>
                          <div className="text-sm text-gray-500">
                            {classItem.schedule.startTime} - {classItem.schedule.endTime}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              classItem.isActive ? "bg-success-100 text-success-800" : "bg-error-100 text-error-800"
                            }`}
                          >
                            {classItem.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleViewClass(classItem)}
                              className="p-1 hover:bg-gray-100 rounded-full"
                              title="View Details"
                            >
                              <Users className="h-4 w-4 text-primary-500" />
                            </button>
                            <button
                              onClick={() => handleEdit(classItem)}
                              className="p-1 hover:bg-gray-100 rounded-full"
                              title="Edit"
                            >
                              <Edit2 className="h-4 w-4 text-gray-500" />
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(classItem._id)}
                              className="p-1 hover:bg-gray-100 rounded-full"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4 text-error-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
                <p className="text-gray-500 mb-6">
                  Are you sure you want to delete this class? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(showDeleteConfirm)}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-error-600 hover:bg-error-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-error-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ClassManagement
