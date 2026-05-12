const DocRequest = require("../Models/docRequestSchema");
const Student = require("../Models/studentSchema");
const Teacher = require("../Models/TeacherSchema");
const Notification = require("../Models/notificationSchema");

// Student: Create a new request
exports.createRequest = async (req, res) => {
  try {
    const studentProfile = await Student.findOne({ user: req.user.id });
    if (!studentProfile) return res.status(404).json({ error: "Student profile not found" });

    const { teacherId, docType, reason } = req.body;

    const request = await DocRequest.create({
      student: studentProfile._id,
      teacher: teacherId,
      docType,
      reason,
    });

    // Notify Teacher
    await Notification.create({
      recipient: teacherId,
      recipientModel: "teacher",
      title: "📄 New Document Request",
      message: `Student ${studentProfile.name} has requested a ${docType}.`,
      type: "general",
    });

    res.status(201).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Student: Get their own requests
exports.getStudentRequests = async (req, res) => {
  try {
    const studentProfile = await Student.findOne({ user: req.user.id });
    if (!studentProfile) return res.status(404).json({ error: "Student profile not found" });

    const requests = await DocRequest.find({ student: studentProfile._id })
      .populate("teacher", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Teacher: Get requests assigned to them
exports.getTeacherRequests = async (req, res) => {
  try {
    const teacherProfile = await Teacher.findOne({ user: req.user.id });
    if (!teacherProfile) return res.status(404).json({ error: "Teacher profile not found" });

    const requests = await DocRequest.find({ teacher: teacherProfile._id })
      .populate("student", "name rollNumber class section")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Teacher: Update request status and upload document
exports.updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, documentUrl, teacherNote } = req.body;

    const request = await DocRequest.findByIdAndUpdate(
      id,
      { status, documentUrl, teacherNote },
      { new: true }
    );

    if (!request) return res.status(404).json({ error: "Request not found" });

    // Notify Student
    let message = `Your request for ${request.docType} is now ${status}.`;
    if (status === "completed") message = `Your ${request.docType} has been uploaded and is ready to view.`;

    await Notification.create({
      recipient: request.student,
      recipientModel: "student",
      title: `📄 Document Request Update`,
      message,
      type: "general",
    });

    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Common: Get list of teachers
exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find({ isActive: true }, "name _id subjects");
    res.json({ success: true, data: teachers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await DocRequest.find()
      .populate("student", "name rollNumber class section")
      .populate("teacher", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
