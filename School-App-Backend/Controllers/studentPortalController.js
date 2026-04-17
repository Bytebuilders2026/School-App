const Student = require("../Models/studentSchema");
const Attendance = require("../Models/attendenceSchema");
const Timetable = require("../Models/TimeTableSchema");
const Homework = require("../Models/homeworkSchema");

// Middleware helper to get the student doc
const getStudentDoc = async (userId) => {
  const student = await Student.findOne({ user: userId });
  if (!student) throw new Error("Student profile not found");
  return student;
};

// ➤ Get Dashboard Overview
exports.getDashboard = async (req, res) => {
  try {
    const student = await getStudentDoc(req.user.id);

    // Get today's timetable
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const todayStr = days[new Date().getDay()];

    let todayClasses = [];
    const timetable = await Timetable.findOne({ class: student.class, section: student.section, day: todayStr });
    if (timetable) {
      todayClasses = timetable.periods;
    }

    // Get recent homework
    const recentHomework = await Homework.find({ class: student.class, section: student.section })
      .sort({ createdAt: -1 })
      .limit(5);

    // Get Attendance Stats
    const totalRecords = await Attendance.countDocuments({ student: student._id });
    const presentRecords = await Attendance.countDocuments({
      student: student._id,
      status: "present"
    });
    
    let attendancePercentage = 0;
    if (totalRecords > 0) {
      attendancePercentage = Math.round((presentRecords / totalRecords) * 100);
    }

    res.json({
      student: {
        name: student.name,
        rollNumber: student.rollNumber,
        class: student.class,
        section: student.section,
        attendancePercentage
      },
      todayClasses,
      recentHomework,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ➤ Get My Timetable
exports.getTimetable = async (req, res) => {
  try {
    const student = await getStudentDoc(req.user.id);
    const timetable = await Timetable.find({ class: student.class, section: student.section });
    res.json(timetable);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ➤ Get My Homework
exports.getHomework = async (req, res) => {
  try {
    const student = await getStudentDoc(req.user.id);
    const homework = await Homework.find({ class: student.class, section: student.section })
      .populate("teacher", "name")
      .sort({ createdAt: -1 });

    const mappedHomework = homework.map(hw => {
      // Check if student._id is in completedBy
      const isCompleted = hw.completedBy?.includes(student._id);
      return { ...hw._doc, completed: isCompleted };
    });

    res.json(mappedHomework);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ➤ Get My Attendance
exports.getAttendance = async (req, res) => {
  try {
    const student = await getStudentDoc(req.user.id);
    // Find all attendance docs for this student
    const records = await Attendance.find({ student: student._id })
      .sort({ date: -1 })
      .limit(30); // Last 30 working days

    // Extract status
    const studentAttendance = records.map(record => ({
      date: record.date,
      status: record.status
    }));

    res.json(studentAttendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ➤ Get My Marks / Result
exports.getMarks = async (req, res) => {
  try {
    const student = await getStudentDoc(req.user.id);
    const Marks = require("../Models/resultSchema");
    
    const results = await Marks.find({ student: student._id })
      .sort({ createdAt: -1 });

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
