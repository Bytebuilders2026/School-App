const Teacher = require("../Models/TeacherSchema");
const User = require("../Models/user");
const Timetable = require("../Models/TimeTableSchema");

exports.createTeacher = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      employeeId,
      qualification,
      experience,
      subjects,
      classes,
    } = req.body;

    // 🔹 check employeeId
    const existingTeacher = await Teacher.findOne({ employeeId });
    if (existingTeacher) {
      return res.status(400).json({ message: "Employee ID already exists" });
    }

    let user;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // 🔥 prevent duplicate teacher profile
      const alreadyLinked = await Teacher.findOne({
        user: existingUser._id,
      });

      if (alreadyLinked) {
        return res
          .status(400)
          .json({ message: "Teacher already exists for this user" });
      }

      user = existingUser;
    } else {
      user = await User.create({
        email,
        password,
        role: "teacher",
      });
    }

    const teacher = await Teacher.create({
      user: user._id,
      name,
      phone,
      employeeId,
      qualification,
      experience,
      subjects,
      classes,
    });

    res.json({ message: "Teacher created", teacher });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ GET ALL TEACHERS
exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find().populate("user");

    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ DELETE TEACHER
exports.deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;

    const teacher = await Teacher.findById(id);

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    await User.findByIdAndDelete(teacher.user);
    await Teacher.findByIdAndDelete(id);

    res.json({ message: "Teacher deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.searchTeacher = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Search query required" });
    }

    // 🔥 search by employeeId OR name
    const teacher = await Teacher.findOne({
      $or: [{ employeeId: query }, { name: { $regex: query, $options: "i" } }],
    }).populate("user");

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    res.json(teacher);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ UPDATE TEACHER
exports.updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, qualification, experience, subjects } = req.body;

    const teacher = await Teacher.findByIdAndUpdate(
      id,
      { name, phone, qualification, experience, subjects },
      { new: true }
    ).populate("user");

    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    res.json({ message: "Updated", teacher });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ GET TEACHER DETAIL + TIMETABLE
exports.getTeacherDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const teacher = await Teacher.findById(id).populate("user");
    if (!teacher) return res.status(404).json({ message: "Not found" });

    // Get all timetable entries where this teacher has periods
    const allEntries = await Timetable.find({ "periods.teacher": teacher._id });

    const timetable = allEntries.map((entry) => ({
      _id: entry._id,
      class: entry.class,
      section: entry.section,
      day: entry.day,
      periods: entry.periods.filter(
        (p) => p.teacher?.toString() === teacher._id.toString()
      ),
    }));

    res.json({ teacher, timetable });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const teacher = await Teacher.findOne({ user: userId });
        if (!teacher) return res.status(404).json({ message: "Teacher profile not found" });
        res.json(teacher);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
