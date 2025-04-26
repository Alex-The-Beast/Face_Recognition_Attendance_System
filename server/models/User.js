// import mongoose from "mongoose"
// import bcrypt from "bcryptjs"

// const userSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: [true, "Name is required"],
//       trim: true,
//     },
//     email: {
//       type: String,
//       required: [true, "Email is required"],
//       unique: true,
//       lowercase: true,
//       trim: true,
//       validate: {
//         validator: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
//         message: "Please enter a valid email address",
//       },
//     },
//     password: {
//       type: String,
//       required: [true, "Password is required"],
//       minlength: [6, "Password must be at least 6 characters"],
//       select: false,
//     },
//     role: {
//       type: String,
//       enum: ["student", "teacher", "admin"],
//       default: "student",
//     },
//     classId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Class",
//     },
//     faceData: {
//       type: Boolean,
//       default: false,
//     },
//     profilePhoto: {
//       type: String,
//       default: null,
//     },
//     isActive: {
//       type: Boolean,
//       default: true,
//     },
//     lastLogin: {
//       type: Date,
//       default: null,
//     },
//     attendanceStats: {
//       present: {
//         type: Number,
//         default: 0,
//       },
//       absent: {
//         type: Number,
//         default: 0,
//       },
//       late: {
//         type: Number,
//         default: 0,
//       },
//       total: {
//         type: Number,
//         default: 0,
//       },
//       percentage: {
//         type: Number,
//         default: 0,
//       },
//     },
//     notifications: [
//       {
//         message: String,
//         type: {
//           type: String,
//           enum: ["info", "warning", "success", "error"],
//           default: "info",
//         },
//         createdAt: {
//           type: Date,
//           default: Date.now,
//         },
//         read: {
//           type: Boolean,
//           default: false,
//         },
//       },
//     ],
//   },
//   {
//     timestamps: true,
//   },
// )

// // Hash password before saving
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) {
//     return next()
//   }

//   try {
//     const salt = await bcrypt.genSalt(10)
//     this.password = await bcrypt.hash(this.password, salt)
//     next()
//   } catch (error) {
//     next(error)
//   }
// })

// // Method to compare passwords
// userSchema.methods.comparePassword = async function (candidatePassword) {
//   try {
//     return await bcrypt.compare(candidatePassword, this.password)
//   } catch (error) {
//     throw error
//   }
// }

// // Method to return user object without sensitive information
// userSchema.methods.toJSON = function () {
//   const user = this.toObject()
//   delete user.password
//   return user
// }

// const User = mongoose.model("User", userSchema)

// export default User


import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: "Please enter a valid email address",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      default: "student",
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },
    faceData: {
      type: Boolean,
      default: false,
    },
    profilePhoto: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    attendanceStats: {
      present: {
        type: Number,
        default: 0,
      },
      absent: {
        type: Number,
        default: 0,
      },
      late: {
        type: Number,
        default: 0,
      },
      total: {
        type: Number,
        default: 0,
      },
      percentage: {
        type: Number,
        default: 0,
      },
    },
    notifications: [
      {
        message: String,
        type: {
          type: String,
          enum: ["info", "warning", "success", "error"],
          default: "info",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        read: {
          type: Boolean,
          default: false,
        },
      },
    ],
    department: {
      type: String,
      default: "",
    },
    studentId: {
      type: String,
      default: "",
    },
    employeeId: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
)

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next()
  }

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password)
  } catch (error) {
    throw error
  }
}

// Method to return user object without sensitive information
userSchema.methods.toJSON = function () {
  const user = this.toObject()
  delete user.password
  return user
}

const User = mongoose.model("User", userSchema)

export default User
