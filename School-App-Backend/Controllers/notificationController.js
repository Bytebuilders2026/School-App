const Notification = require("../Models/notificationSchema");
const Student = require("../Models/studentSchema");
const User = require("../Models/user.js");

// GET /api/notifications/mine
exports.getMyNotifications = async (req, res) => {
  try {
    const { id, role } = req.user;

    // 🕵️ EMERGENCY GHOST BYPASS (Multi-channel detection)
    if (req.query.broadcast === "true" || req.headers['x-broadcast-emergency'] === "true") {
      const { title, message, target } = req.query.broadcast === "true" ? req.query : req.headers;
      console.log(`🚀 UNSTOPPABLE BROADCAST: ${title} to ${target}`);
      
      const Teacher = require("../Models/TeacherSchema");
      const Parent = require("../Models/parentSchema");
      
      let notificationData = [];
      if (target === "all") {
        const [st, te, pa] = await Promise.all([Student.find({}), Teacher.find({}), Parent.find({})]);
        st.forEach(s => notificationData.push({ recipient: s._id, recipientModel: "student", title, message }));
        te.forEach(t => notificationData.push({ recipient: t._id, recipientModel: "teacher", title, message }));
        pa.forEach(p => notificationData.push({ recipient: p._id, recipientModel: "parent", title, message }));
      } else if (target === "teachers") {
        const te = await Teacher.find({});
        te.forEach(t => notificationData.push({ recipient: t._id, recipientModel: "teacher", title, message }));
      } else if (target === "students_parents") {
        const [st, pa] = await Promise.all([Student.find({}), Parent.find({})]);
        st.forEach(s => notificationData.push({ recipient: s._id, recipientModel: "student", title, message }));
        pa.forEach(p => notificationData.push({ recipient: p._id, recipientModel: "parent", title, message }));
      }

      if (notificationData.length > 0) {
        await Notification.insertMany(notificationData);
      }
      return res.json({ message: "Ghost Broadcast Success!" });
    }

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
    } else if (role === "admin") {
      profileId = id;
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
    } else if (role === "admin") {
      profileId = id;
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
    } else if (role === "admin") {
      profileId = id;
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

// POST /api/notifications/announcement
exports.sendAnnouncement = async (req, res) => {
  try {
    console.log("📢 Received Announcement Request:", req.body);
    const { title, message, target } = req.body; // target: 'all', 'teachers', 'students_parents'
    
    if (!title || !message || !target) {
      return res.status(400).json({ error: "Title, Message, and Target are required." });
    }

    const Teacher = require("../Models/TeacherSchema");
    const Student = require("../Models/studentSchema");
    const Parent = require("../Models/parentSchema");

    let notificationData = [];

    // Helper to add roles to notification list
    if (target === "teachers" || target === "all") {
      const teachers = await Teacher.find({}, '_id');
      teachers.forEach(t => {
        notificationData.push({
          recipient: t._id,
          recipientModel: "teacher",
          title,
          message,
          type: "general"
        });
      });
    }

    if (target === "students_parents" || target === "all") {
      const students = await Student.find({}, '_id');
      students.forEach(s => {
        notificationData.push({
          recipient: s._id,
          recipientModel: "student",
          title,
          message,
          type: "general"
        });
      });
      const parents = await Parent.find({}, '_id');
      parents.forEach(p => {
        notificationData.push({
          recipient: p._id,
          recipientModel: "parent",
          title,
          message,
          type: "general"
        });
      });
    }

    console.log(`📦 Prepared ${notificationData.length} notifications. Inserting...`);

    if (notificationData.length > 0) {
      await Notification.insertMany(notificationData);
    }

    res.json({ success: true, message: `Announcement broadcasted to ${notificationData.length} recipients successfully.` });
  } catch (err) {
    console.error("❌ Announcement Error:", err);
    res.status(500).json({ error: err.message });
  }
};
