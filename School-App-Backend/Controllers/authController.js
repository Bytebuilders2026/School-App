const User = require("../Models/user");
const Student = require("../Models/studentSchema");
const Teacher = require("../Models/TeacherSchema");
const Parent = require("../Models/parentSchema");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "SchoolAppSuperSecretKey"; // hardcoded for simple implementation without dotenv

exports.login = async (req, res) => {
  try {
    const { identifier, password, role } = req.body;

    let user = null;

    // 🔹 Step 1: Find user based on role
    if (role === "student") {
      const studentProfile = await Student.findOne({ 
        $or: [
          { rollNumber: identifier },
          { email: identifier }
        ] 
      }).populate("user");
      if (studentProfile) {
        user = studentProfile.user;
      }
    } else if (role === "parent") {
      // Parents might use phone number to log in (as per frontend)
      const parentProfile = await Parent.findOne({ phone: identifier }).populate("user");
      if (parentProfile) {
        user = parentProfile.user;
      } else {
        // Fallback to email
        user = await User.findOne({ email: identifier });
      }
    } else {
      user = await User.findOne({ email: identifier });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔹 Step 2: Check password using our schema method
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Wrong password" });
    }

    let profile = null;

    // 🔹 Step 3: Get profile based on role
    if (user.role === "student") {
      profile = await Student.findOne({ user: user._id }).populate("parent");
    }

    if (user.role === "teacher") {
      profile = await Teacher.findOne({ user: user._id });
    }

    if (user.role === "parent") {
      profile = await Parent.findOne({ user: user._id }).populate("children");
    }

    // 🔹 Step 4: Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: "1d" } // Session expires in 1 day
    );

    res.json({
      message: "Login success",
      token,
      role: user.role,
      user,
      profile,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
