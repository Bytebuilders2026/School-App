const Student = require("../Models/studentSchema");
const User = require("../Models/user");
const Attendance = require("../Models/attendenceSchema");

// ➤ Add Student
exports.addStudent = async (req, res) => {
  try {
    const { 
      email, password, rollNumber, 
      parentName, parentPhone, parentEmail,
      parentOccupation, parentAddress,
      ...studentData 
    } = req.body;

    // 🔹 check rollNumber
    const existingStudent = await Student.findOne({ rollNumber });
    if (existingStudent) {
      return res.status(400).json({ message: "Roll Number already exists" });
    }

    if (!parentName || !parentPhone) {
      return res.status(400).json({ message: "Parent Name and Phone are required." });
    }

    // 🔹 Manage Parent Resolution
    const Parent = require("../Models/parentSchema");
    let resolvedParent = await Parent.findOne({ phone: parentPhone });

    if (!resolvedParent) {
      // Create User Auth for New Parent
      const parentUser = await User.create({ 
        email: parentEmail || `${parentPhone}@school.com`, 
        password: parentPhone, 
        role: "parent" 
      });

      // Create Parent Profile
      resolvedParent = await Parent.create({
        user: parentUser._id,
        name: parentName,
        phone: parentPhone,
        email: parentEmail,
        password: parentPhone,
        occupation: parentOccupation,
        address: parentAddress,
        children: []
      });
    }

    let user;
    if (email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        // 🔥 prevent duplicate profile
        const alreadyLinked = await Student.findOne({ user: existingUser._id });
        if (alreadyLinked) {
          return res.status(400).json({ message: "Student already exists for this email" });
        }
        user = existingUser;
      } else {
        user = await User.create({ email, password, role: "student" });
      }
    } else {
      return res.status(400).json({ message: "Email is required to create a user profile" });
    }

    // 🔹 create student profile linked to parent
    const student = await Student.create({
      user: user._id,
      parent: resolvedParent._id,
      email,
      password,
      rollNumber,
      ...studentData
    });

    // 🔹 Map student back to parent
    resolvedParent.children.push(student._id);
    await resolvedParent.save();

    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


// ➤ Get Total Students
exports.getTotalStudents = async (req, res) => {
  try {
    const count = await Student.countDocuments();
    res.json({ total: count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ➤ Search Student
exports.searchStudent = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
       // Return recent students if no query provided
       const students = await Student.find()
         .populate("parent", "name phone email occupation")
         .sort({ createdAt: -1 })
         .limit(50);
       return res.json(students);
    }

    const regex = new RegExp(query, "i"); // Case-insensitive regex
    
    // Check if query is numeric (for strictly roll number comparison if needed) but regex works fine for stringified numbers too
    const students = await Student.find({
      $or: [
        { name: regex },
        { rollNumber: regex },
        { admissionNumber: regex },
      ],
    }).populate("parent", "name phone email occupation").limit(50); // limit results for safety

    res.json(students);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ➤ Get Students by Class + Section
exports.getStudentsByClass = async (req, res) => {
  try {
    const { cls, section } = req.query;
    const students = await Student.find({ class: cls, section }).sort({ rollNumber: 1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ➤ Get Student Attendance stats
exports.getStudentAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const records = await Attendance.find({ student: studentId })
      .sort({ date: -1 })
      .limit(30);

    const total = records.length;
    const present = records.filter((r) => r.status === "present").length;
    const absent = records.filter((r) => r.status === "absent").length;
    const leave = records.filter((r) => r.status === "leave").length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    res.json({ total, present, absent, leave, percentage, records });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};