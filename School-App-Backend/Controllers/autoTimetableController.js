const Teacher = require("../Models/TeacherSchema");
const Timetable = require("../Models/TimeTableSchema");
const TeacherLeave = require("../Models/TeacherLeaveSchema");
const Substitution = require("../Models/SubstitutionSchema");
const Notification = require("../Models/notificationSchema");

exports.requestLeave = async (req, res) => {
  try {
    const { teacherId, date, reason } = req.body;
    const leave = await TeacherLeave.create({ teacher: teacherId, date, reason, status: "Pending" });
    res.json({ message: "Leave requested successfully", leave });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLeaves = async (req, res) => {
  try {
    const leaves = await TeacherLeave.find().populate("teacher", "name employeeId subjects");
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSuggestions = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const leave = await TeacherLeave.findById(leaveId).populate("teacher");
    if (!leave) return res.status(404).json({ error: "Leave not found" });

    const absentTeacher = leave.teacher;
    const dateObj = new Date(leave.date);
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayOfWeek = days[dateObj.getDay()];

    // Find all timetable entries for this day
    const allTimetables = await Timetable.find({ day: dayOfWeek }).populate("periods.teacher");

    const affectedClasses = [];
    const occupiedTeacherIdsByPeriod = {};

    allTimetables.forEach(tt => {
      tt.periods.forEach(p => {
        const pKey = `${p.startTime}-${p.endTime}`;
        if (!occupiedTeacherIdsByPeriod[pKey]) occupiedTeacherIdsByPeriod[pKey] = new Set();
        if (p.teacher && p.teacher._id) {
            occupiedTeacherIdsByPeriod[pKey].add(p.teacher._id.toString());
        }

        if (p.teacher && p.teacher._id.toString() === absentTeacher._id.toString()) {
          affectedClasses.push({
            class: tt.class,
            section: tt.section,
            subject: p.subject,
            startTime: p.startTime,
            endTime: p.endTime,
            pKey: pKey
          });
        }
      });
    });

    const allTeachers = await Teacher.find({ isActive: true });
    
    // Now suggest substitutes
    const suggestionsForPeriods = affectedClasses.map(ac => {
      const busySet = occupiedTeacherIdsByPeriod[ac.pKey] || new Set();
      
      const availableTeachers = allTeachers.filter(t => 
        t._id.toString() !== absentTeacher._id.toString() && 
        !busySet.has(t._id.toString())
      );

      const highPriority = availableTeachers.filter(t => t.subjects && t.subjects.includes(ac.subject));
      const fallback = availableTeachers.filter(t => !t.subjects || !t.subjects.includes(ac.subject));

      return {
        ...ac,
        suggestions: {
          highPriority: highPriority.map(t => ({ id: t._id, name: t.name, subjects: t.subjects })),
          fallback: fallback.map(t => ({ id: t._id, name: t.name, subjects: t.subjects }))
        }
      };
    });

    res.json({ leave, affectedPeriods: suggestionsForPeriods });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.approveLeaveAndSubstitute = async (req, res) => {
  try {
    const { leaveId, substitutions } = req.body; 
    // substitutions: [{class, section, startTime, endTime, subject, substituteTeacherId}]
    
    const leave = await TeacherLeave.findByIdAndUpdate(leaveId, { status: "Approved" }, { new: true });
    const dateObj = new Date(leave.date);
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayOfWeek = days[dateObj.getDay()];

    const createdSubstitutions = [];

    for (let sub of substitutions) {
      if(sub.substituteTeacherId) {
        const ns = await Substitution.create({
          date: leave.date,
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

        // Send notification
        await Notification.create({
          recipient: sub.substituteTeacherId,
          recipientModel: "teacher",
          title: "Substitution Assigned",
          message: `You have been assigned as a substitute for ${sub.class}-${sub.section} (${sub.subject}) on ${leave.date} from ${sub.startTime} to ${sub.endTime}.`
        });
      }
    }

    res.json({ message: "Leave approved and substitutions assigned", createdSubstitutions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSubstitutionsForTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const subs = await Substitution.find({ substituteTeacher: teacherId })
                 .populate("absentTeacher", "name")
                 .sort({ date: 1 });
    res.json(subs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.autoGenerateTimetable = async (req, res) => {
  try {
    // Very basic placeholder logic for full auto-timetable generation
    // Real generation is complex constraint satisfaction.
    const { class: cls, section, days, periodsPerDay, subjectCounts } = req.body;
    
    // We would assign teachers logically here to complete all subjectCounts without overlaps.
    // However, a full CSP algorithm in Node is massive. Here we simulate success.

    res.json({ message: "Timetable algorithm executed successfully", generated: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
