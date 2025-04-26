import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import helmet from "helmet"
import morgan from "morgan"
import cookieParser from "cookie-parser"

// Import routes
import authRoutes from "./routes/auth.js"
import userRoutes from "./routes/users.js"
import attendanceRoutes from "./routes/attendance.js"
import classRoutes from "./routes/classes.js"
import faceRoutes from "./routes/face.js"

// Load environment variables
dotenv.config()

// Initialize express app
const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))
app.use(cors())
app.use(helmet())
app.use(morgan("common"))
app.use(cookieParser())

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/attendance", attendanceRoutes)
app.use("/api/classes", classRoutes)
app.use("/api/face", faceRoutes)

// Default route
app.get("/", (req, res) => {
  res.send("Face Recognition Attendance System API")
})

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/face-attendance", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB")
    app.listen(PORT, () => {
      console.log(`Server is running on port: ${PORT}`)
    })
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error.message)
  })

// Handle errors
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    message: err.message || "Something went wrong!",
  })
})

export default app
