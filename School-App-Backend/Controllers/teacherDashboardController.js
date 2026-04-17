const Attendance = require("../Models/attendenceSchema");
const Student = require("../Models/studentSchema");
const Timetable = require("../Models/TimeTableSchema");
const Homework = require("../Models/homeworkSchema");

const getTodayRange = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  return { today, tomorrow };
};

exports.getTeacherDashboard = async (req, res) => {
  try {
    const teacherId = req.user?.id;
    if (!teacherId) return res.status(401).json({ message: "Unauthorized" });

    const Teacher = require("../Models/TeacherSchema");
    const teacherProfile = await Teacher.findOne({ $or: [{ user: teacherId }, { _id: teacherId }] });
    if (!teacherProfile) return res.status(404).json({ message: "Teacher not found" });

    const { today, tomorrow } = getTodayRange();
    const totalStudents = await Student.countDocuments({ isActive: { $ne: false } });

    const daysArr = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const serverDate = new Date();
    const todayDay = daysArr[serverDate.getDay()];

    const allTimetables = await Timetable.find({ "periods.teacher": teacherProfile._id, day: todayDay });

    const timetable = allTimetables.map((t) => {
      const teacherPeriods = t.periods.filter(p => p.teacher?.toString() === teacherProfile._id.toString());
      return teacherPeriods.map((p) => ({
        class: t.class,
        section: t.section,
        subject: p.subject,
        startTime: p.startTime,
        endTime: p.endTime,
      }));
    }).flat().sort((a, b) => a.startTime > b.startTime ? 1 : -1);

    const totalMarked = await Attendance.countDocuments({ markedBy: teacherProfile._id, date: { $gte: today, $lt: tomorrow } });
    const present = await Attendance.countDocuments({ markedBy: teacherProfile._id, status: "present", date: { $gte: today, $lt: tomorrow } });
    const pendingHomework = await Homework.countDocuments({ teacher: teacherProfile._id, checked: false });

    const recentAttendance = await Attendance.find({ markedBy: teacherProfile._id, date: { $gte: today, $lt: tomorrow } })
      .populate("student", "name")
      .limit(5)
      .sort({ createdAt: -1 });

    // 🔹 DYNAMIC RISK DISCOVERY
    const tSets = new Set();
    const allT = await Timetable.find({ "periods.teacher": teacherProfile._id });
    allT.forEach(t => tSets.add(`${t.class}|${t.section}`));
    const combinedClasses = Array.from(new Set([...tSets, ...(teacherProfile.classes || []).map(cs => `${cs.class}|${cs.section}`)]));

    let atRiskStudents = [];
    let lowAttendanceStudents = [];

    if (combinedClasses.length > 0) {
      const orConditions = combinedClasses.map(str => {
         const [c, s] = str.split('|');
         return { class: c, section: s };
      });
      const myStudents = await Student.find({ $or: orConditions });
      const Marks = require("../Models/resultSchema");

      for (let st of myStudents) {
         const stAttTotal = await Attendance.countDocuments({ student: st._id });
         const stAttPresent = await Attendance.countDocuments({ student: st._id, status: "present" });
         let attPerc = stAttTotal > 0 ? (stAttPresent/stAttTotal)*100 : 100;
         
         if (attPerc < 75) lowAttendanceStudents.push({ name: st.name, rollNumber: st.rollNumber, attendance: Math.round(attPerc), class: st.class, section: st.section });

         let marksAvg = 0;
         const marks = await Marks.find({ student: st._id });
         if (marks.length > 0) {
            let obt = 0; let tot = 0;
            marks.forEach(m => { obt+= (m.marksObtained||0); tot += (m.totalMarks||100); });
            marksAvg = Math.round((obt/tot)*100);
         } else { marksAvg = 100; }

         let risk = "LOW";
         if (attPerc < 75 && marksAvg < 40) risk = "HIGH";
         else if (attPerc < 85 || marksAvg < 60) risk = "MEDIUM";

         if (risk === "HIGH" || risk === "MEDIUM") {
            atRiskStudents.push({ name: st.name, rollNumber: st.rollNumber, class: st.class, section: st.section, attendance: Math.round(attPerc), avgMarks: marksAvg, risk: risk });
         }
      }
    }

    res.json({
      success: true,
      data: {
        stats: { totalStudents, present, totalMarked, pendingHomework, totalClassesToday: timetable.length },
        timetable, recentAttendance, atRiskStudents, lowAttendanceStudents
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

exports.getTeacherMe = async (req, res) => {
  try {
    const Teacher = require("../Models/TeacherSchema");
    const Timetable = require("../Models/TimeTableSchema");
    const teacherProfile = await Teacher.findOne({ user: req.user.id });
    if (!teacherProfile) return res.status(404).json({ error: "Teacher profile not found" });

    const allEntries = await Timetable.find({ "periods.teacher": teacherProfile._id });
    const assignedClasses = new Set();
    const assignedSubjects = new Set(teacherProfile.subjects || []);

    allEntries.forEach(entry => {
       const hasPeriod = entry.periods.some(p => p.teacher?.toString() === teacherProfile._id.toString());
       if (hasPeriod) {
          assignedClasses.add(`${entry.class}|${entry.section}`);
          entry.periods.forEach(p => { if (p.teacher?.toString() === teacherProfile._id.toString()) assignedSubjects.add(p.subject); });
       }
    });

    const dynamicClasses = Array.from(assignedClasses).map(str => { const [c, s] = str.split('|'); return { class: c, section: s }; });
    const finalClasses = dynamicClasses.length > 0 ? dynamicClasses : teacherProfile.classes;
    const finalSubjects = Array.from(assignedSubjects);

    res.json({ ...teacherProfile.toObject(), classes: finalClasses, subjects: finalSubjects });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTeacherTimetable = async (req, res) => {
  try {
    const teacherId = req.user?.id;
    const Teacher = require("../Models/TeacherSchema");
    const teacherProfile = await Teacher.findOne({ user: teacherId });
    if (!teacherProfile) return res.status(404).json({ message: "Teacher profile not found" });
    const allEntries = await Timetable.find({ "periods.teacher": teacherProfile._id });
    const filtered = allEntries.map((entry) => ({
      _id: entry._id, class: entry.class, section: entry.section, day: entry.day,
      periods: entry.periods.filter((p) => p.teacher?.toString() === teacherProfile._id.toString()),
    }));
    res.json({ success: true, timetable: filtered });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.markAttendance = async (req, res) => {
  try {
    const teacherId = req.user?.id;
    const Teacher = require("../Models/TeacherSchema");
    const teacherProfile = await Teacher.findOne({ user: teacherId });
    if (!teacherProfile) return res.status(404).json({ message: "Teacher not found" });

    const { class: className, section, date, attendanceData } = req.body;
    if (!className || !section || !date || !attendanceData || !Array.isArray(attendanceData)) return res.status(400).json({ message: "Invalid data" });

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const bulkOps = attendanceData.map((record) => ({
      updateOne: {
        filter: { student: record.studentId, date: attendanceDate },
        update: { $set: { class: className, section, status: record.status, markedBy: teacherProfile._id } },
        upsert: true
      }
    }));

    await Attendance.bulkWrite(bulkOps);

    // 🔹 Notify Students & Parents (Risk based) + 3-Day Absent Trigger
    const Notification = require("../Models/notificationSchema");
    const Student = require("../Models/studentSchema");

    for (let record of attendanceData) {
       // --- 3-DAY CONTINUOUS ABSENCE CHECK ---
       if (record.status === "absent") {
          const last3Days = await Attendance.find({ student: record.studentId })
              .sort({ date: -1 })
              .limit(3);
          
          // Verify if exactly the last 3 days all have status 'absent'
          const is3DaysAbsent = last3Days.length === 3 && last3Days.every(a => a.status === "absent");
          
          if (is3DaysAbsent) {
             const stInfo = await Student.findById(record.studentId);
             if (stInfo) {
                const title = "🚨 3-Day Absence Alert";
                // Notify Parent
                if (stInfo.parent) {
                   await Notification.create({
                      recipient: stInfo.parent, recipientModel: "parent",
                      title, message: `SEVERE ALERT: Your child ${stInfo.name} has been continuously ABSENT for 3 days without an official leave application. Please contact the class teacher immediately.`,
                      type: "attendance_alert"
                   });
                }
                // Notify Teacher
                await Notification.create({
                   recipient: teacherProfile._id, recipientModel: "teacher",
                   title, message: `ALERT: Student ${stInfo.name} (Roll: ${stInfo.rollNumber}) has been ABSENT for 3 consecutive days without leave.`,
                   type: "attendance_alert"
                });
             }
          }
       }

       // --- STANDARD ATTENDANCE RISK ---
       if (record.status === "absent" || record.status === "leave") {
          const stAttTotal = await Attendance.countDocuments({ student: record.studentId });
          const stAttPresent = await Attendance.countDocuments({ student: record.studentId, status: "present" });
          let attPerc = stAttTotal > 0 ? (stAttPresent/stAttTotal)*100 : 100;

          if (attPerc < 85) {
             const stInfo = await Student.findById(record.studentId);
             if (stInfo) {
                const isCritical = attPerc < 75;
                const title = isCritical ? "⚠️ Critical Attendance Alert" : "📉 Low Attendance Warning";
                
                // Student
                await Notification.create({
                   recipient: stInfo._id, recipientModel: "student",
                   title, message: `Your attendance is ${Math.round(attPerc)}% (${isCritical ? "Low" : "Medium"} risk). Please attend classes regularly.`,
                   type: "performance_alert"
                });

                // Parent
                if (stInfo.parent) {
                   await Notification.create({
                      recipient: stInfo.parent, recipientModel: "parent",
                      title, message: `Your child ${stInfo.name}'s attendance: ${Math.round(attPerc)}%. Reach out if needed.`,
                      type: "performance_alert"
                   });
                }
             }
          }
       }
    }

    res.json({ success: true, message: "Attendance marked successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};
