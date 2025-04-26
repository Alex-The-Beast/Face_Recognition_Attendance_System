"use client"
import { Link } from "react-router-dom"
import { ArrowLeft, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-error-100">
            <AlertCircle className="h-12 w-12 text-error-600" />
          </div>
          <h1 className="mt-6 text-3xl font-extrabold text-gray-900">Page Not Found</h1>
          <p className="mt-2 text-sm text-gray-600">Sorry, we couldn't find the page you're looking for.</p>
        </motion.div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center"
        >
          <p className="text-gray-700 mb-6">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Go back home
            </Link>

            <Link
              to="/login"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Go to login
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default NotFoundPage
