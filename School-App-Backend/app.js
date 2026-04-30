require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const teacherRoutes = require("./Routes/adminTeacherRoute");
const timetableRoutes = require("./Routes/adminTimetableRoute");

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected: schoolApp"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err.message));

// 🔍 Global Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Middleware to check database connection
app.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: "Database is offline. Please start MongoDB service." });
  }
  next();
});

app.use("/api/auth", require("./Routes/authRoute"));
app.use("/api/students", require("./Routes/adminStudentRoute"));
app.use("/api/admin/teachers", teacherRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/autotimetable", require("./Routes/autoTimetableRoute"));
app.use("/api/attendance", require("./Routes/adminAttendeceRoute"));
app.use("/api/teacher", require("./Routes/teacherDashboardRoute"));
app.use("/api/homework", require("./Routes/homeworkRoute"));
app.use("/api/admin/parents", require("./Routes/adminParentRoute"));
app.use("/api/student", require("./Routes/studentPortalRoute"));
app.use("/api/performance", require("./Routes/performanceRoute"));
app.use("/api/marks", require("./Routes/resultRoute"));
app.use("/api/syllabus", require("./Routes/syllabusRoute"));
app.use("/api/datesheet", require("./Routes/datesheetRoute"));
app.use("/api/notifications", require("./Routes/notificationRoute"));

app.use("/api/doc-requests", require("./Routes/docRequestRoute"));
app.use("/api/parent-portal", require("./Routes/parentPortalRoute"));
app.use("/api/admin/fees", require("./Routes/adminFeeRoute"));
app.use("/api/gatepass", require("./Routes/gatePassRoute"));
app.use("/api/leave", require("./Routes/leaveRoute"));
app.use("/api/reports", require("./Routes/reportRoute"));
app.use("/api/messages", require("./Routes/messageRoute"));
app.use("/api/materials", require("./Routes/materialRoute"));

// Serve uploaded files statically
const path = require("path");
app.use("/uploads", require("express").static(path.join(__dirname, "uploads")));



// 🔹 Global Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err : {}
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => console.log(`Server running on ${PORT}`));
