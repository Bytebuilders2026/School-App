const Homework = require("../Models/homeworkSchema");
const Teacher = require("../Models/TeacherSchema");

// ➤ Create Homework (Teacher Only)
exports.createHomework = async (req, res) => {
  try {
    const teacherId = req.user?.id; // Logged in user ID

    // Find the teacher profile associated with this user
    const teacherProfile = await Teacher.findOne({
      $or: [{ user: teacherId }, { _id: teacherId }],
    });

    if (!teacherProfile) {
      return res.status(404).json({ message: "Teacher profile not found" });
    }

    const { title, description, class: cls, section, subject, dueDate, attachments } = req.body;

    if (!title || !cls || !section || !subject || !dueDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const homework = await Homework.create({
      title,
      description,
      class: cls,
      section,
      subject,
      dueDate,
      attachments: attachments || [],
      assignedBy: teacherProfile._id,
    });

    // 🔹 Notify Students & Parents
    const Student = require("../Models/studentSchema");
    const Notification = require("../Models/notificationSchema");
    
    // Using Regex and trim to prevent trailing space or case mismatches
    const studentsInClass = await Student.find({ 
      class: { $regex: new RegExp('^' + (cls || '').trim() + '$', 'i') }, 
      section: { $regex: new RegExp('^' + (section || '').trim() + '$', 'i') } 
    });

    const notifications = [];
    studentsInClass.forEach(st => {
       notifications.push({
          recipient: st._id,
          recipientModel: "student",
          title: "📚 New Homework Assigned",
          message: `New homework for ${subject}: "${title}". Due: ${new Date(dueDate).toDateString()}`,
          type: "assignment"
       });
       
       if (st.parent) {
          notifications.push({
             recipient: st.parent,
             recipientModel: "parent",
             title: "📚 Homework Alert",
             message: `Homework assigned to ${st.name} in ${subject}. Due date: ${new Date(dueDate).toDateString()}`,
             type: "assignment"
          });
       }
    });

    if (notifications.length > 0) {
       try {
           await Notification.insertMany(notifications, { ordered: false });
       } catch (err) {
           console.error("Warning: Some notifications could not be sent", err);
       }
    }

    res.status(201).json({ success: true, message: "Homework assigned and notifications sent", homework });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ➤ Get Homework Assigned by the Logged In Teacher
exports.getTeacherHomework = async (req, res) => {
  try {
    const teacherId = req.user?.id;
    const Student = require("../Models/studentSchema");
    const Notification = require("../Models/notificationSchema");

    const teacherProfile = await Teacher.findOne({
      $or: [{ user: teacherId }, { _id: teacherId }],
    });

    if (!teacherProfile) {
      return res.status(404).json({ message: "Teacher profile not found" });
    }

    const homeworks = await Homework.find({ assignedBy: teacherProfile._id })
      .sort({ createdAt: -1 });

    const homeworksObj = [];
    for (let hw of homeworks) {
      const clsEscaped = (hw.class || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const secEscaped = (hw.section || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const totalStudents = await Student.countDocuments({
        class: { $regex: new RegExp('^' + clsEscaped.trim() + '$', 'i') },
        section: { $regex: new RegExp('^' + secEscaped.trim() + '$', 'i') }
      });
      homeworksObj.push({ ...hw.toObject(), totalStudents, completedCount: hw.completedBy.length });
    }

    // --- 3-DAY CONTINUOUS HOMEWORK MISSED CHECK ---
    const pastHomeworks = homeworks.filter(h => new Date(h.dueDate) < new Date(new Date().setHours(23,59,59,999))).slice(0, 3);
    if (pastHomeworks.length === 3) {
       const latestClass = pastHomeworks[0].class;
       const latestSec = pastHomeworks[0].section;
       
       if (pastHomeworks.every(h => h.class === latestClass && h.section === latestSec)) {
          const clsEscaped = (latestClass || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const secEscaped = (latestSec || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const students = await Student.find({
            class: { $regex: new RegExp('^' + clsEscaped.trim() + '$', 'i') },
            section: { $regex: new RegExp('^' + secEscaped.trim() + '$', 'i') }
          });
          
          for (let st of students) {
             const missedAll = pastHomeworks.every(h => !h.completedBy.includes(st._id));
             if (missedAll) {
                const alreadyNotified = await Notification.findOne({
                  recipient: teacherProfile.user,
                  type: "homework_alert",
                  message: { $regex: st.name },
                  createdAt: { $gte: new Date(Date.now() - 86400000) } // Cooldown 1 day
                });
                
                if (!alreadyNotified) {
                   await Notification.create({
                      recipient: teacherProfile.user, recipientModel: "User",
                      title: "⚠️ Continuous Missing Homework Alert",
                      message: `Student ${st.name} (Roll: ${st.rollNumber}) has missed completing the last 3 consecutive assignments in ${latestClass}-${latestSec}.`,
                      type: "homework_alert"
                   });
                }
             }
          }
       }
    }

    res.json({ success: true, homeworks: homeworksObj });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ➤ Delete Homework (Can be deleted by assigning teacher or admin)
exports.deleteHomework = async (req, res) => {
  try {
    const { id } = req.params;
    await Homework.findByIdAndDelete(id);
    res.json({ success: true, message: "Homework deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ➤ Get All Homework (Admin view - filterable by class/section)
exports.getAllHomework = async (req, res) => {
  try {
    const { class: cls, section } = req.query;
    
    // Build filter
    let filter = {};
    if (cls) filter.class = cls;
    if (section) filter.section = section;

    const homeworks = await Homework.find(filter)
      .populate("assignedBy", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, homeworks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ➤ Mark Homework as Complete (Student Only)
exports.markAsComplete = async (req, res) => {
  try {
    const Student = require("../Models/studentSchema");
    const student = await Student.findOne({ user: req.user.id });
    if (!student) return res.status(404).json({ error: "Student profile not found" });

    const homework = await Homework.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { completedBy: student._id } },
      { new: true }
    );
    res.json({ success: true, homework });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
