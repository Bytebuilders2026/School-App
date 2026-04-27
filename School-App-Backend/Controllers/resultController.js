const Marks = require("../Models/resultSchema");
const Student = require("../Models/studentSchema");
const Notification = require("../Models/notificationSchema");

// GET /api/marks/top-students?limit=10&examType=Midterm
// Returns top performers across ALL classes with full student details
exports.getTopStudents = async (req, res) => {
  try {
    const { examType, limit = 10 } = req.query;
    const filter = {};
    if (examType && examType !== "All") filter.examType = examType;

    // Aggregate top students across all classes
    const pipeline = [
      ...(Object.keys(filter).length ? [{ $match: filter }] : []),
      {
        $group: {
          _id: "$student",
          totalObtained: { $sum: "$marksObtained" },
          totalMax: { $sum: "$totalMarks" },
          subjectCount: { $sum: 1 },
          class: { $first: "$class" },
          section: { $first: "$section" },
          subjects: {
            $push: {
              subject: "$subject",
              examType: "$examType",
              marksObtained: "$marksObtained",
              totalMarks: "$totalMarks",
              grade: "$grade"
            }
          }
        }
      },
      {
        $addFields: {
          avgPct: {
            $multiply: [{ $divide: ["$totalObtained", "$totalMax"] }, 100]
          }
        }
      },
      { $sort: { avgPct: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: "students",
          localField: "_id",
          foreignField: "_id",
          as: "studentInfo"
        }
      },
      { $unwind: "$studentInfo" },
      {
        $project: {
          _id: 1,
          name: "$studentInfo.name",
          rollNumber: "$studentInfo.rollNumber",
          email: "$studentInfo.email",
          class: "$studentInfo.class",
          section: "$studentInfo.section",
          avgPct: { $round: ["$avgPct", 1] },
          totalObtained: 1,
          totalMax: 1,
          subjectCount: 1,
          subjects: 1
        }
      }
    ];

    const topStudents = await Marks.aggregate(pipeline);
    res.json(topStudents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/marks/realtime-analysis
// Returns live school-wide result stats
exports.getRealtimeAnalysis = async (req, res) => {
  try {
    const [
      totalMarksEntries,
      passFailRaw,
      subjectAvg,
      gradeDist,
      classAvg,
      recentMarks
    ] = await Promise.all([
      Marks.countDocuments(),
      Marks.aggregate([
        {
          $addFields: {
            pct: { $multiply: [{ $divide: ["$marksObtained", "$totalMarks"] }, 100] }
          }
        },
        {
          $group: {
            _id: null,
            pass: { $sum: { $cond: [{ $gte: ["$pct", 40] }, 1, 0] } },
            fail: { $sum: { $cond: [{ $lt: ["$pct", 40] }, 1, 0] } },
            total: { $sum: 1 },
            overallAvg: { $avg: "$pct" }
          }
        }
      ]),
      Marks.aggregate([
        {
          $group: {
            _id: "$subject",
            avg: { $avg: { $multiply: [{ $divide: ["$marksObtained", "$totalMarks"] }, 100] } },
            count: { $sum: 1 }
          }
        },
        { $sort: { avg: -1 } }
      ]),
      Marks.aggregate([
        {
          $addFields: {
            pct: { $multiply: [{ $divide: ["$marksObtained", "$totalMarks"] }, 100] },
            grade: {
              $switch: {
                branches: [
                  { case: { $gte: [{ $multiply: [{ $divide: ["$marksObtained", "$totalMarks"] }, 100] }, 90] }, then: "A+" },
                  { case: { $gte: [{ $multiply: [{ $divide: ["$marksObtained", "$totalMarks"] }, 100] }, 80] }, then: "A" },
                  { case: { $gte: [{ $multiply: [{ $divide: ["$marksObtained", "$totalMarks"] }, 100] }, 70] }, then: "B+" },
                  { case: { $gte: [{ $multiply: [{ $divide: ["$marksObtained", "$totalMarks"] }, 100] }, 60] }, then: "B" },
                  { case: { $gte: [{ $multiply: [{ $divide: ["$marksObtained", "$totalMarks"] }, 100] }, 50] }, then: "C" },
                  { case: { $gte: [{ $multiply: [{ $divide: ["$marksObtained", "$totalMarks"] }, 100] }, 40] }, then: "D" },
                ],
                default: "F"
              }
            }
          }
        },
        { $group: { _id: "$grade", count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Marks.aggregate([
        {
          $group: {
            _id: "$class",
            avg: { $avg: { $multiply: [{ $divide: ["$marksObtained", "$totalMarks"] }, 100] } },
            students: { $addToSet: "$student" }
          }
        },
        {
          $addFields: {
            studentCount: { $size: "$students" }
          }
        },
        { $sort: { avg: -1 } }
      ]),
      Marks.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("student", "name class section rollNumber")
    ]);

    const pf = passFailRaw[0] || { pass: 0, fail: 0, total: 0, overallAvg: 0 };

    res.json({
      totalMarksEntries,
      passRate: pf.total > 0 ? Math.round((pf.pass / pf.total) * 100) : 0,
      failRate: pf.total > 0 ? Math.round((pf.fail / pf.total) * 100) : 0,
      overallAvg: Math.round(pf.overallAvg || 0),
      passCount: pf.pass,
      failCount: pf.fail,
      totalEntries: pf.total,
      subjectAvg,
      gradeDist,
      classAvg,
      recentMarks
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/marks/class/:className/section/:section?examType=Midterm
exports.getClassMarks = async (req, res) => {
  try {
    const { className, section } = req.params;
    const { examType, subject } = req.query;

    const filter = { class: className, section };
    if (examType) filter.examType = examType;
    if (subject) filter.subject = subject;

    const marks = await Marks.find(filter).populate("student", "name rollNumber");
    res.json(marks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/marks/add
// Expects: { class, section, subject, examType, marksData: [{ studentId, marksObtained, totalMarks, grade }] }
exports.addMarks = async (req, res) => {
  try {
    const teacherId = req.user?.id;
    const Teacher = require("../Models/TeacherSchema");
    const teacherProfile = await Teacher.findOne({ user: teacherId });
    if (!teacherProfile) return res.status(403).json({ error: "Only teachers can add marks." });

    const { class: className, section, subject, examType, marksData } = req.body;
    
    if (!className || !subject || !examType || !marksData) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const bulkOps = marksData.map((record) => ({
      updateOne: {
        filter: { 
          student: record.studentId, 
          subject: subject,
          examType: examType 
        },
        update: {
          $set: {
            class: className,
            section: section,
            marksObtained: record.marksObtained,
            totalMarks: record.totalMarks || 100,
            grade: record.grade || "",
            addedBy: teacherProfile._id,
          }
        },
        upsert: true
      }
    }));

    await Marks.bulkWrite(bulkOps);

    // 🔹 Notify Students & Analysis
    for (let record of marksData) {
       let obt = Number(record.marksObtained) || 0;
       let tot = Number(record.totalMarks) || 100;
       const stInfo = await Student.findById(record.studentId);
       
       if (stInfo) {
          // 1. Alert Student
          await Notification.create({
              recipient: stInfo._id,
              recipientModel: "student",
              title: "🎓 New Marks Uploaded",
              message: `Your results for ${subject} (${examType}) are out. Score: ${obt}/${tot}.`,
              type: "result"
          });

          // 2. High Risk Alert for Parent/Teacher if < 40%
          if ((obt / tot) * 100 < 40) {
              await Notification.create({
                  recipient: teacherProfile._id,
                  recipientModel: "teacher",
                  title: "⚠️ Performance Drop Alert",
                  message: `Low performance: ${stInfo.name} scored ${obt}/${tot} in ${subject}.`,
                  type: "performance_alert"
              });

              if (stInfo.parent) {
                  await Notification.create({
                      recipient: stInfo.parent,
                      recipientModel: "parent",
                      title: "⚠️ Results Warning",
                      message: `Your child ${stInfo.name} has scored below 40% in ${subject}. Check academic result section.`,
                      type: "performance_alert"
                  });
              }
          }
       }
    }

    res.json({ success: true, message: "Marks saved and notifications sent" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
