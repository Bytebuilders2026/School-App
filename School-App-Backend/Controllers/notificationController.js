const Notification = require("../Models/notificationSchema");
const Student = require("../Models/studentSchema");

// GET /api/notifications/mine
exports.getMyNotifications = async (req, res) => {
  try {
    const { id, role } = req.user;
    let profileId = null;

    if (role === "student") {
      const p = await Student.findOne({ user: id });
      if (p) profileId = p._id;
    } else if (role === "parent") {
      const p = await require("../Models/parentSchema").findOne({ user: id });
      if (p) profileId = p._id;
    } else if (role === "teacher") {
      const p = await require("../Models/TeacherSchema").findOne({ user: id });
      if (p) profileId = p._id;
    }

    if (!profileId) return res.status(404).json({ error: "User profile not found" });

    const notifications = await Notification.find({ recipient: profileId }).sort({ createdAt: -1 }).limit(20);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const { id, role } = req.user;
    let profileId = null;

    if (role === "student") {
      const p = await Student.findOne({ user: id });
      if (p) profileId = p._id;
    } else if (role === "parent") {
      const p = await require("../Models/parentSchema").findOne({ user: id });
      if (p) profileId = p._id;
    } else if (role === "teacher") {
      const p = await require("../Models/TeacherSchema").findOne({ user: id });
      if (p) profileId = p._id;
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: profileId },
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ error: "Notification not found" });
    res.json({ success: true, notification });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/notifications/read-all
exports.markAllAsRead = async (req, res) => {
  try {
    const { id, role } = req.user;
    let profileId = null;

    if (role === "student") {
      const p = await Student.findOne({ user: id });
      if (p) profileId = p._id;
    } else if (role === "parent") {
      const p = await require("../Models/parentSchema").findOne({ user: id });
      if (p) profileId = p._id;
    } else if (role === "teacher") {
      const p = await require("../Models/TeacherSchema").findOne({ user: id });
      if (p) profileId = p._id;
    }

    await Notification.updateMany(
      { recipient: profileId, isRead: false },
      { isRead: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// POST /api/notifications/auto-trigger
exports.triggerAutoPerformanceAlerts = async (req, res) => {
  try {
    const Student = require("../Models/studentSchema");
    const Teacher = require("../Models/TeacherSchema");
    const { calculatePerformance } = require("./performanceController"); // We'll need to export this
    const Notification = require("../Models/notificationSchema");

    const students = await Student.find({ isActive: true });
    let totalTriggered = 0;

    for (const student of students) {
      const perf = await calculatePerformance(student._id);

      // Condition: attendance < 75 OR marks drop > 15% OR homework missing > 3
      const isCritical = 
        perf.attendancePercentage < 75 || 
        (perf.marksTrend.direction === "down" && perf.marksTrend.change > 15) || 
        perf.missingHomeworkCount > 3;

      if (isCritical) {
        totalTriggered++;
        const alertTitle = "📉 AI Performance Alert";
        const alertMsg = `Observation for ${student.name}: ${perf.riskReasons.join(", ") || "Performance drop detected"}.`;

        // 1. Notify Student
        await Notification.create({
          recipient: student._id, recipientModel: "student",
          title: alertTitle, message: alertMsg, type: "performance_alert"
        });

        // 2. Notify Parent
        if (student.parent) {
          await Notification.create({
            recipient: student.parent, recipientModel: "parent",
            title: alertTitle, message: `Academic alert for your child ${student.name}: ${alertMsg}`,
            type: "performance_alert"
          });
        }

        // 3. Notify Teachers of this class
        const teachers = await Teacher.find({ "classes": { $elemMatch: { class: student.class, section: student.section } } });
        for (const teacher of teachers) {
           await Notification.create({
             recipient: teacher._id, recipientModel: "teacher",
             title: `Alert: Student Risk (${student.name})`,
             message: `${student.name} from Class ${student.class}-${student.section} is showing performance risks.`,
             type: "performance_alert"
           });
        }
      }
    }

    res.json({ success: true, message: `Analyzed students. Triggered alerts for ${totalTriggered} cases.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
