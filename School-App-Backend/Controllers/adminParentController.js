const Parent = require("../Models/parentSchema");
const Student = require("../Models/studentSchema");
const User = require("../Models/user");

// ➤ Get all parents with their children populated
exports.getAllParents = async (req, res) => {
  try {
    const parents = await Parent.find()
      .populate("children", "name class section rollNumber admissionNumber")
      .sort({ createdAt: -1 });
    res.json(parents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ➤ Add new parent & assign children
exports.addParent = async (req, res) => {
  try {
    const { name, email, password, phone, address, occupation, childrenIds } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ error: "Missing required fields (name, email, password, phone)" });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      const existingParent = await Parent.findOne({ user: user._id });
      if (existingParent) {
        return res.status(400).json({ error: "Parent profile already exists for this email" });
      }
    } else {
      user = await User.create({ email, password, role: "parent" });
    }

    // Create Parent profile
    const parent = await Parent.create({
      user: user._id,
      name,
      email,
      password, // Note: plain text currently based on logic structure, user.js pre-saves the correct hash for auth
      phone,
      address,
      occupation,
      children: childrenIds || []
    });

    // Link backwards from the selected students to this parent
    if (childrenIds && childrenIds.length > 0) {
      await Student.updateMany(
        { _id: { $in: childrenIds } },
        { $set: { parent: parent._id } }
      );
    }

    // Fetch newly created parent populated to return
    const populatedParent = await Parent.findById(parent._id)
      .populate("children", "name class section rollNumber admissionNumber");

    res.status(201).json(populatedParent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ➤ Delete parent
exports.deleteParent = async (req, res) => {
  try {
    const { id } = req.params;
    const parent = await Parent.findById(id);
    if (!parent) return res.status(404).json({ error: "Parent not found" });

    // Unlink children
    await Student.updateMany(
      { parent: parent._id },
      { $unset: { parent: 1 } }
    );

    // Remove user account auth
    if (parent.user) {
      await User.findByIdAndDelete(parent.user);
    }

    // Remove profile
    await Parent.findByIdAndDelete(id);

    res.json({ message: "Parent deleted and children unlinked successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ➤ Get Unassigned Students (Helper for dropdown)
exports.getUnassignedStudents = async (req, res) => {
  try {
    // Find students where parent field does not exist or is null
    const students = await Student.find({ parent: { $exists: false } })
      .select("name class section rollNumber admissionNumber")
      .sort({ createdAt: -1 })
      .limit(100);

    // Also get ones where it might be explicitly null if unset
    const studentsNull = await Student.find({ parent: null })
        .select("name class section rollNumber admissionNumber")
        .sort({ createdAt: -1 })
        .limit(100);

    // Merge and deduplicate
    const combined = [...students, ...studentsNull];
    const uniqueIds = new Set();
    const finalStudents = [];
    for (const student of combined) {
        if (!uniqueIds.has(student._id.toString())) {
            uniqueIds.add(student._id.toString());
            finalStudents.push(student);
        }
    }

    res.json(finalStudents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
