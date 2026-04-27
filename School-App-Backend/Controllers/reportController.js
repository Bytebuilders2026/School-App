const Student = require("../Models/studentSchema");
const Marks = require("../Models/resultSchema");
const Attendance = require("../Models/attendenceSchema");
const Fee = require("../Models/feeSchema");
const FeePayment = require("../Models/feePaymentSchema");

// GET /api/reports/overview  — School-level summary stats
exports.getOverview = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments({ isActive: true });

    // Class-wise student count
    const classWise = await Student.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$class", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Marks average per subject (all exams)
    const subjectAvg = await Marks.aggregate([
      {
        $group: {
          _id: "$subject",
          avgMarks: { $avg: { $multiply: [{ $divide: ["$marksObtained", "$totalMarks"] }, 100] } },
          count: { $sum: 1 }
        }
      },
      { $sort: { avgMarks: -1 } }
    ]);

    // Top 5 performers (highest avg %)
    const topPerformers = await Marks.aggregate([
      {
        $group: {
          _id: "$student",
          avgPct: { $avg: { $multiply: [{ $divide: ["$marksObtained", "$totalMarks"] }, 100] } },
          totalExams: { $sum: 1 }
        }
      },
      { $sort: { avgPct: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "students",
          localField: "_id",
          foreignField: "_id",
          as: "student"
        }
      },
      { $unwind: "$student" },
      {
        $project: {
          name: "$student.name",
          class: "$student.class",
          section: "$student.section",
          rollNumber: "$student.rollNumber",
          avgPct: { $round: ["$avgPct", 1] },
          totalExams: 1
        }
      }
    ]);

    // Exam-type distribution
    const examDist = await Marks.aggregate([
      { $group: { _id: "$examType", count: { $sum: 1 } } }
    ]);

    // Pass/Fail analysis (pass = >= 40%)
    const passFailRaw = await Marks.aggregate([
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
          total: { $sum: 1 }
        }
      }
    ]);

    const passFailStats = passFailRaw[0] || { pass: 0, fail: 0, total: 0 };

    // Grade distribution
    const gradeDist = await Marks.aggregate([
      {
        $addFields: {
          pct: { $multiply: [{ $divide: ["$marksObtained", "$totalMarks"] }, 100] },
          grade: {
            $switch: {
              branches: [
                { case: { $gte: ["$pct", 90] }, then: "A+" },
                { case: { $gte: ["$pct", 80] }, then: "A" },
                { case: { $gte: ["$pct", 70] }, then: "B+" },
                { case: { $gte: ["$pct", 60] }, then: "B" },
                { case: { $gte: ["$pct", 50] }, then: "C" },
                { case: { $gte: ["$pct", 40] }, then: "D" },
              ],
              default: "F"
            }
          }
        }
      },
      { $group: { _id: "$grade", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      totalStudents,
      classWise,
      subjectAvg,
      topPerformers,
      examDist,
      passFailStats,
      gradeDist
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/reports/class/:className  — Class-wise detailed report
exports.getClassReport = async (req, res) => {
  try {
    const { className } = req.params;
    const { examType } = req.query;

    const filter = { class: className };
    if (examType) filter.examType = examType;

    const allMarks = await Marks.find(filter).populate("student", "name rollNumber section");

    // Group by student
    const studentMap = {};
    allMarks.forEach(m => {
      const sid = m.student?._id?.toString();
      if (!sid) return;
      if (!studentMap[sid]) {
        studentMap[sid] = {
          name: m.student.name,
          rollNumber: m.student.rollNumber,
          section: m.student.section,
          subjects: []
        };
      }
      const pct = ((m.marksObtained / m.totalMarks) * 100).toFixed(1);
      studentMap[sid].subjects.push({
        subject: m.subject,
        marksObtained: m.marksObtained,
        totalMarks: m.totalMarks,
        percentage: parseFloat(pct),
        grade: m.grade || autoGrade(parseFloat(pct))
      });
    });

    const students = Object.values(studentMap).map(s => {
      const avg = s.subjects.length
        ? (s.subjects.reduce((a, b) => a + b.percentage, 0) / s.subjects.length).toFixed(1)
        : 0;
      return { ...s, average: parseFloat(avg) };
    });

    students.sort((a, b) => b.average - a.average);

    res.json({ className, examType: examType || "All", students });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

function autoGrade(pct) {
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B+";
  if (pct >= 60) return "B";
  if (pct >= 50) return "C";
  if (pct >= 40) return "D";
  return "F";
}
