const Attendance = require("../Models/attendenceSchema");
const Student = require("../Models/studentSchema");
const Teacher = require("../Models/TeacherSchema");
const FeePayment = require("../Models/feePaymentSchema");

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
    
    // For Last 7 days attendance
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);

    // For Last 6 months fees
    const sixMonthsAgo = new Date(today);
    sixMonthsAgo.setMonth(today.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const [
      totalStudents,
      totalTeachers,
      presentToday,
      totalMarkedToday,
      classWise,
      recentStudents,
      recentTeachers,
      genderStatsRaw,
      attendanceAnalysis,
      feesGraphData
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
      
      // Graph 1: Gender
      Student.aggregate([
        { $match: { isActive: { $ne: false } } },
        { $group: { _id: { $ifNull: ["$gender", "Other"] }, count: { $sum: 1 } } }
      ]),
      
      // Graph 2: 7 Days Attendance Analysis
      Attendance.aggregate([
        { $match: { date: { $gte: sevenDaysAgo, $lt: tomorrow } } },
        { $group: { 
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            present: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } },
            total: { $sum: 1 }
        }},
        { $sort: { "_id": 1 } }
      ]),

      // Graph 3: 6 Months Fee Collections
      FeePayment.aggregate([
        { $match: { paymentDate: { $gte: sixMonthsAgo } } },
        { $group: { 
            _id: { $dateToString: { format: "%Y-%m", date: "$paymentDate" } },
            amount: { $sum: "$amount" }
        }},
        { $sort: { "_id": 1 } }
      ])
    ]);

    const attendancePercent = totalStudents > 0 ? ((presentToday / totalStudents) * 100).toFixed(1) : 0;
    const absentToday = totalMarkedToday - presentToday;

    // Format Gender Data
    const genderData = [
      { name: "Male", value: 0 },
      { name: "Female", value: 0 }
    ];
    let maleCount = 0; let femaleCount = 0;
    genderStatsRaw.forEach(g => {
      if(g._id === 'Male') { maleCount += g.count; genderData[0].value = g.count; }
      else if(g._id === 'Female') { femaleCount += g.count; genderData[1].value = g.count; }
    });
    // In case there is no data at all, provide a fallback or ensure zero values

    // Format Attendance Data
    const attendanceChartData = attendanceAnalysis.map(item => ({
      date: item._id,
      percent: item.total > 0 ? Math.round((item.present / item.total) * 100) : 0
    }));

    // Format Fee Data
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const feeChartData = feesGraphData.map(item => {
      const [year, month] = item._id.split('-');
      return {
        month: monthNames[parseInt(month, 10) - 1] + " '" + year.slice(2),
        amount: item.amount
      }
    });

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
        graphs: {
          genderData,
          attendanceChartData,
          feeChartData
        }
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};
