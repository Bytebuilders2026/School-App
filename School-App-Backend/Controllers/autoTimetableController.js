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
    const { date: queryDate } = req.query;
    const leave = await TeacherLeave.findById(leaveId).populate("teacher");
    if (!leave) return res.status(404).json({ error: "Leave not found" });

    const absentTeacher = leave.teacher;
    const dateOfSubstitution = queryDate || leave.date || leave.startDate;
    const dateObj = new Date(dateOfSubstitution);
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

      const highPriority = availableTeachers.filter(t => 
        t.subjects && t.subjects.some(s => s.toLowerCase() === ac.subject.toLowerCase())
      );
      const fallback = availableTeachers.filter(t => 
        !t.subjects || !t.subjects.some(s => s.toLowerCase() === ac.subject.toLowerCase())
      );

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
    const { class: cls, section, days, periodsPerDay } = req.body;

    if (!cls || !section || !days || !periodsPerDay) {
      return res.status(400).json({ error: "class, section, days and periodsPerDay are required." });
    }

    const numPeriods = parseInt(periodsPerDay);
    if (isNaN(numPeriods) || numPeriods < 1 || numPeriods > 12) {
      return res.status(400).json({ error: "periodsPerDay must be between 1 and 12." });
    }

    // ─── STEP 1: Get all active teachers ────────────────────────────────────
    let teachers = await Teacher.find({ isActive: true, "classes.class": cls });
    let usedFallback = false;

    if (teachers.length === 0) {
      teachers = await Teacher.find({ isActive: true, subjects: { $exists: true, $not: { $size: 0 } } });
      usedFallback = true;
    }
    if (teachers.length === 0) {
      teachers = await Teacher.find({ isActive: true });
    }
    if (teachers.length === 0) {
      return res.status(404).json({ error: "No active teachers found in the system." });
    }

    // ─── STEP 2: Build teacher assignment pool ───────────────────────────────
    // Each entry: { subject, teacher: ObjectId, teacherIdStr }
    const assignments = [];
    for (const teacher of teachers) {
      const subjects = teacher.subjects && teacher.subjects.length > 0
        ? teacher.subjects : ["General"];
      for (const subject of subjects) {
        assignments.push({
          subject,
          teacher: teacher._id,
          teacherIdStr: teacher._id.toString(),
          teacherName: teacher.name
        });
      }
    }

    // ─── STEP 3: Load existing timetables to build a BUSY MAP ───────────────
    // busyMap[day][slotKey] = Set of teacher IDs that are already busy
    const existingTimetables = await Timetable.find({
      day: { $in: days },
      $or: [{ class: { $ne: cls } }, { section: { $ne: section } }]
    });

    // busyMap is mutable — we update it as we assign new periods
    const busyMap = {};
    for (const tt of existingTimetables) {
      if (!busyMap[tt.day]) busyMap[tt.day] = {};
      for (const period of tt.periods) {
        if (!period.teacher) continue;
        const key = `${period.startTime}-${period.endTime}`;
        if (!busyMap[tt.day][key]) busyMap[tt.day][key] = new Set();
        busyMap[tt.day][key].add(period.teacher.toString());
      }
    }

    // ─── STEP 4: Build time slots ────────────────────────────────────────────
    const PERIOD_MINUTES = 45;
    const RECESS_MINUTES = 20;
    const RECESS_AFTER = Math.ceil(numPeriods / 2);
    let currentHour = 8, currentMin = 0;
    const pad = (n) => String(n).padStart(2, "0");
    const addMins = (h, m, mins) => {
      m += mins; h += Math.floor(m / 60); m %= 60;
      return { h, m };
    };

    const slots = [];
    for (let p = 1; p <= numPeriods; p++) {
      const s = `${pad(currentHour)}:${pad(currentMin)}`;
      const e = addMins(currentHour, currentMin, PERIOD_MINUTES);
      const eStr = `${pad(e.h)}:${pad(e.m)}`;
      slots.push({ startTime: s, endTime: eStr, isRecess: false });
      currentHour = e.h; currentMin = e.m;
      if (p === RECESS_AFTER) {
        const rs = `${pad(currentHour)}:${pad(currentMin)}`;
        const re = addMins(currentHour, currentMin, RECESS_MINUTES);
        slots.push({ startTime: rs, endTime: `${pad(re.h)}:${pad(re.m)}`, isRecess: true });
        currentHour = re.h; currentMin = re.m;
      }
    }

    // ─── STEP 5: Delete old timetable for this class+section ─────────────────
    await Timetable.deleteMany({ class: cls, section });

    // ─── STEP 6: Conflict-aware generation ───────────────────────────────────
    const generated = [];
    const conflicts = [];
    let assignCursor = 0; // tracks round-robin start position across days

    for (const day of days) {
      if (!busyMap[day]) busyMap[day] = {};
      const periods = [];

      for (const slot of slots) {
        if (slot.isRecess) {
          periods.push({ subject: "Recess", teacher: null, startTime: slot.startTime, endTime: slot.endTime });
          continue;
        }

        const slotKey = `${slot.startTime}-${slot.endTime}`;
        const busyIds = busyMap[day][slotKey] || new Set();

        // Find the next free teacher (round-robin, skipping busy ones)
        let assigned = null;
        let tried = 0;
        while (tried < assignments.length) {
          const candidate = assignments[(assignCursor + tried) % assignments.length];
          if (!busyIds.has(candidate.teacherIdStr)) {
            assigned = candidate;
            assignCursor = (assignCursor + tried + 1) % assignments.length;
            break;
          }
          tried++;
        }

        if (assigned) {
          // Mark teacher as busy for this day+slot in the live busyMap
          if (!busyMap[day][slotKey]) busyMap[day][slotKey] = new Set();
          busyMap[day][slotKey].add(assigned.teacherIdStr);

          periods.push({
            subject: assigned.subject,
            teacher: assigned.teacher,
            startTime: slot.startTime,
            endTime: slot.endTime
          });
        } else {
          // All teachers busy at this slot — leave unassigned
          conflicts.push(`${day} ${slotKey}: all teachers busy`);
          periods.push({ subject: "TBD", teacher: null, startTime: slot.startTime, endTime: slot.endTime });
        }
      }

      await Timetable.create({ class: cls, section, day, periods });
      generated.push({
        day,
        periodsCount: periods.filter(p => p.subject !== "Recess" && p.subject !== "TBD").length,
        unassigned: periods.filter(p => p.subject === "TBD").length
      });
    }

    const hasConflicts = conflicts.length > 0;
    res.json({
      message: `✅ Conflict-free timetable generated for Class ${cls}-${section} — ${days.length} day(s), ${numPeriods} periods/day.${
        hasConflicts ? ` ⚠️ ${conflicts.length} slot(s) left unassigned (all teachers were busy).` : ""
      }${usedFallback ? " (Used all active teachers — no class-specific assignments found.)" : ""}`,
      generated: true,
      summary: generated,
      teachersUsed: teachers.length,
      conflicts: hasConflicts ? conflicts : []
    });
  } catch (err) {
    console.error("Auto-generate error:", err);
    res.status(500).json({ error: err.message || "Internal server error during timetable generation." });
  }
};

