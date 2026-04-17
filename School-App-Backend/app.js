const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const teacherRoutes = require("./Routes/adminTeacherRoute");
const timetableRoutes = require("./Routes/adminTimetableRoute");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/schoolApp")

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

// 🔹 Global Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err : {}
  });
});

app.listen(5000, "0.0.0.0", () => console.log("Server running on 5000"));
