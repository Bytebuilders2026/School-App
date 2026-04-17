const Attendance = require("../Models/attendenceSchema");
const Student = require("../Models/studentSchema");
const Teacher = require("../Models/TeacherSchema");

const getTodayRange = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  return { today, tomorrow };
};

// ✅ DASHBOARD STATS
exports.getDashboardStats = async (req, res) => {
  try {
    const { today, tomorrow } = getTodayRange();

    const totalStudents = await Student.countDocuments({ isActive: { $ne: false } });

    const present = await Attendance.countDocuments({
      date: { $gte: today, $lt: tomorrow },
      status: "present",
    });

    const totalMarked = await Attendance.countDocuments({
      date: { $gte: today, $lt: tomorrow },
    });

    res.json({
      success: true,
      data: {
        totalStudents,
        present,
        totalMarked,
        percentage:
          totalStudents > 0 ? ((present / totalStudents) * 100).toFixed(1) : 0,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

// ✅ CLASS-WISE (NOW WILL WORK — because class exists in Attendance)
exports.getClassWiseAttendance = async (req, res) => {
  try {
    const { today, tomorrow } = getTodayRange();

    const data = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: today, $lt: tomorrow },
        },
      },
      {
        $group: {
          _id: {
            class: "$class",
            section: "$section",
          },
          total: { $sum: 1 },
          present: {
            $sum: {
              $cond: [{ $eq: ["$status", "present"] }, 1, 0],
            },
          },
        },
      },
      {
        $sort: {
          "_id.class": 1,
          "_id.section": 1,
        },
      },
    ]);

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

// ✅ STUDENT LIST
exports.getClassStudentsAttendance = async (req, res) => {
  try {
    const { className, section } = req.query;
    const { today, tomorrow } = getTodayRange();

    const data = await Attendance.find({
      class: className,
      section,
      date: { $gte: today, $lt: tomorrow },
    }).populate("student", "name rollNumber");

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

// ✅ FULL ADMIN DASHBOARD — one call, all data
exports.getAdminDashboard = async (req, res) => {
  try {
    const { today, tomorrow } = getTodayRange();

    const [
      totalStudents,
      totalTeachers,
      presentToday,
      totalMarkedToday,
      classWise,
      recentStudents,
      recentTeachers,
    ] = await Promise.all([
      Student.countDocuments({ isActive: { $ne: false } }),
      Teacher.countDocuments({ isActive: { $ne: false } }),
      Attendance.countDocuments({ date: { $gte: today, $lt: tomorrow }, status: "present" }),
      Attendance.countDocuments({ date: { $gte: today, $lt: tomorrow } }),
      Attendance.aggregate([
        { $match: { date: { $gte: today, $lt: tomorrow } } },
        { $group: { _id: { class: "$class", section: "$section" }, total: { $sum: 1 }, present: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } } } },
        { $sort: { "_id.class": 1, "_id.section": 1 } },
        { $limit: 6 },
      ]),
      Student.find({ isActive: { $ne: false } }).sort({ createdAt: -1 }).limit(5).select("name rollNumber class section createdAt"),
      Teacher.find({ isActive: { $ne: false } }).sort({ createdAt: -1 }).limit(5).select("name employeeId subjects"),
    ]);

    const attendancePercent = totalStudents > 0 ? ((presentToday / totalStudents) * 100).toFixed(1) : 0;
    const absentToday = totalMarkedToday - presentToday;

    res.json({
      success: true,
      data: {
        totalStudents,
        totalTeachers,
        presentToday,
        absentToday,
        totalMarkedToday,
        attendancePercent,
        classWise,
        recentStudents,
        recentTeachers,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};
