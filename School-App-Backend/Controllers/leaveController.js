const TeacherLeave = require("../Models/TeacherLeaveSchema");
const StudentLeave = require("../Models/StudentLeaveSchema");
const Attendance = require("../Models/attendenceSchema");
const Student = require("../Models/studentSchema");
const Teacher = require("../Models/TeacherSchema");
const Timetable = require("../Models/TimeTableSchema");
const Substitution = require("../Models/SubstitutionSchema");
const Notification = require("../Models/notificationSchema");

const getDatesInRange = (startDate, endDate) => {
  const dates = [];
  let currDate = new Date(startDate);
  const lastDate = new Date(endDate);
  while (currDate <= lastDate) {
    dates.push(new Date(currDate).toISOString().split('T')[0]);
    currDate.setDate(currDate.getDate() + 1);
  }
  return dates;
};

// Student Leave Request
exports.requestStudentLeave = async (req, res) => {
  try {
    const { studentId, startDate, endDate, reason } = req.body;
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ error: "Student not found" });

    const dates = getDatesInRange(startDate, endDate);
    const leave = await StudentLeave.create({
      student: studentId,
      class: student.class,
      section: student.section,
      startDate,
      endDate,
      totalDays: dates.length,
      reason,
      status: "Pending"
    });
    res.json({ message: "Leave requested successfully", leave });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Teacher Leave Request
exports.requestTeacherLeave = async (req, res) => {
  try {
    const { teacherId, startDate, endDate, reason } = req.body;
    const dates = getDatesInRange(startDate, endDate);
    const leave = await TeacherLeave.create({
      teacher: teacherId,
      startDate,
      endDate,
      totalDays: dates.length,
      reason,
      status: "Pending"
    });
    res.json({ message: "Leave requested successfully", leave });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Student Leaves (For Teachers of that class)
exports.getStudentLeavesForTeacher = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const teacher = await Teacher.findOne({ $or: [{ user: teacherId }, { _id: teacherId }] });
    if (!teacher) return res.status(404).json({ error: "Teacher profile not found" });

    const orConditions = (teacher.classes || []).map(cs => ({
      class: cs.class,
      section: cs.section
    }));

    if (orConditions.length === 0) return res.json([]);

    const leaves = await StudentLeave.find({ $or: orConditions }).populate("student", "name rollNumber");
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Teacher Leaves (For Admin)
exports.getTeacherLeavesForAdmin = async (req, res) => {
  try {
    const leaves = await TeacherLeave.find().populate("teacher", "name employeeId subjects");
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Approve Student Leave (Marks Attendance Automatically)
exports.approveStudentLeave = async (req, res) => {
  try {
    const { leaveId } = req.body;
    const teacherId = req.user.id;
    const teacher = await Teacher.findOne({ $or: [{ user: teacherId }, { _id: teacherId }] });

    const leave = await StudentLeave.findByIdAndUpdate(leaveId, { 
      status: "Approved", 
      approvedBy: teacher ? teacher._id : null 
    }, { new: true });

    if (!leave) return res.status(404).json({ error: "Leave not found" });

    // Mark attendance as 'leave' for all dates in range
    const dates = getDatesInRange(leave.startDate, leave.endDate);
    const bulkOps = dates.map(date => ({
      updateOne: {
        filter: { student: leave.student, date: new Date(date).setHours(0,0,0,0) },
        update: { 
          $set: { 
            class: leave.class, 
            section: leave.section, 
            status: "leave", 
            markedBy: teacher ? teacher._id : null 
          } 
        },
        upsert: true
      }
    }));

    if (bulkOps.length > 0) {
        await Attendance.bulkWrite(bulkOps);
    }

    res.json({ message: "Leave approved and attendance marked", leave });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Approve Teacher Leave (Triggers Substitution Logic)
exports.approveTeacherLeave = async (req, res) => {
  try {
    const { leaveId, substitutions } = req.body; 
    // substitutions: Array of [{date, class, section, startTime, endTime, subject, substituteTeacherId}]
    
    const leave = await TeacherLeave.findByIdAndUpdate(leaveId, { status: "Approved" }, { new: true });
    if (!leave) return res.status(404).json({ error: "Leave not found" });

    const createdSubstitutions = [];
    if (substitutions && Array.isArray(substitutions)) {
        const daysArr = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        
        for (let sub of substitutions) {
          if(sub.substituteTeacherId) {
            const dateObj = new Date(sub.date);
            const dayOfWeek = daysArr[dateObj.getDay()];

            const ns = await Substitution.create({
              date: sub.date,
              day: dayOfWeek,
              class: sub.class,
              section: sub.section,
              periodStartTime: sub.startTime,
              periodEndTime: sub.endTime,
              subject: sub.subject,
              absentTeacher: leave.teacher,
              substituteTeacher: sub.substituteTeacherId
            });
            createdSubstitutions.push(ns);

            // Send notification to substitute teacher
            await Notification.create({
              recipient: sub.substituteTeacherId,
              recipientModel: "teacher",
              title: "Substitution Assigned",
              message: `You have been assigned as a substitute for ${sub.class}-${sub.section} (${sub.subject}) on ${sub.date} from ${sub.startTime} to ${sub.endTime}.`
            });
          }
        }
    }

    res.json({ message: "Teacher leave approved and substitutions assigned", leave, createdSubstitutions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get My Leaves (For Student)
exports.getMyLeavesForStudent = async (req, res) => {
    try {
        const studentId = req.user.id;
        const student = await Student.findOne({ $or: [{ user: studentId }, { _id: studentId }] });
        if (!student) return res.status(404).json({ error: "Student not found" });

        const leaves = await StudentLeave.find({ student: student._id }).sort({ createdAt: -1 });
        res.json(leaves);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Reject Leave
exports.rejectLeave = async (req, res) => {
    try {
        const { leaveId, type } = req.body; // type: 'student' or 'teacher'
        if (type === 'student') {
            await StudentLeave.findByIdAndUpdate(leaveId, { status: "Rejected" });
        } else {
            await TeacherLeave.findByIdAndUpdate(leaveId, { status: "Rejected" });
        }
        res.json({ message: "Leave rejected" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
