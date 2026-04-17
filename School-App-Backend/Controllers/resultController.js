const Marks = require("../Models/resultSchema");
const Student = require("../Models/studentSchema");
const Notification = require("../Models/notificationSchema");

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
