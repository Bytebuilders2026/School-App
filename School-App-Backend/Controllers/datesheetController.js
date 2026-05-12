const Datesheet = require("../Models/datesheetSchema");

// POST /api/datesheet/add
exports.addDatesheet = async (req, res) => {
  try {
    const { class: className, examType, schedule } = req.body;
    
    // Check if one exists for this class and exam type
    let datesheet = await Datesheet.findOne({ class: className, examType });

    if (datesheet) {
      datesheet.schedule = schedule;
      await datesheet.save();
    } else {
      datesheet = await Datesheet.create({
        class: className,
        examType,
        schedule,
        addedBy: req.user.id
      });
    }

    res.status(201).json({ success: true, datesheet });

    // 🔹 Notify Students
    const Student = require("../Models/studentSchema");
    const Notification = require("../Models/notificationSchema");
    const students = await Student.find({ class: className });

    const notifications = students.map(st => ({
       recipient: st._id,
       recipientModel: "student",
       title: "📅 Exams Datesheet Released",
       message: `The datesheet for ${examType} has been ${datesheet.isNew ? "released" : "updated"}. Check the Datesheet section for details.`,
       type: "datesheet"
    }));

    if (notifications.length > 0) {
       await Notification.insertMany(notifications);
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET /api/datesheet/class/:className
exports.getDatesheet = async (req, res) => {
  try {
    const { className } = req.params;
    const datesheets = await Datesheet.find({ class: className }).sort({ createdAt: -1 });
    res.json(datesheets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/datesheet/:id
exports.deleteDatesheet = async (req, res) => {
  try {
    await Datesheet.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Datesheet deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
