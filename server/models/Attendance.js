// import mongoose from "mongoose"

// const attendanceSchema = new mongoose.Schema(
//   {
//     studentId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     classId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Class",
//       required: true,
//     },
//     date: {
//       type: String,
//       required: true,
//     },
//     time: {
//       type: String,
//       required: true,
//     },
//     status: {
//       type: String,
//       enum: ["present", "absent", "late", "excused"],
//       default: "absent",
//     },
//     verifiedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },
//     verificationMethod: {
//       type: String,
//       enum: ["face", "manual", "system"],
//       default: "system",
//     },
//     notes: {
//       type: String,
//       default: "",
//     },
//     emotion: {
//       type: String,
//       default: null,
//     },
//     attention: {
//       type: Number,
//       default: null,
//     },
//     photoUrl: {
//       type: String,
//       default: null,
//     },
//     dispute: {
//       isDisputed: {
//         type: Boolean,
//         default: false,
//       },
//       reason: {
//         type: String,
//         default: "",
//       },
//       status: {
//         type: String,
//         enum: ["pending", "approved", "rejected"],
//         default: "pending",
//       },
//       resolvedBy: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//       },
//       resolvedAt: {
//         type: Date,
//       },
//     },
//   },
//   {
//     timestamps: true,
//   }
// )

// // Create compound index for student, class, and date
// attendanceSchema.index({ studentId: 1, classId: 1, date: 1 }, { unique: true })

// const Attendance = mongoose.model("Attendance", attendanceSchema)

// export default Attendance



import mongoose from "mongoose"

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["present", "absent", "late", "excused"],
      default: "absent",
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    verificationMethod: {
      type: String,
      enum: ["face", "manual", "system"],
      default: "system",
    },
    photoUrl: {
      type: String,
      default: null,
    },
    emotion: {
      type: String,
      default: null,
    },
    attention: {
      type: Number,
      default: null,
    },
    notes: {
      type: String,
      default: "",
    },
    dispute: {
      isDisputed: {
        type: Boolean,
        default: false,
      },
      reason: {
        type: String,
        default: "",
      },
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
      resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      resolvedAt: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
  },
)

// Create compound index for student, class, and date
attendanceSchema.index({ studentId: 1, classId: 1, date: 1 }, { unique: true })

const Attendance = mongoose.model("Attendance", attendanceSchema)

export default Attendance
