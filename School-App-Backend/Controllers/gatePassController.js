const GatePass = require("../Models/GatePassSchema");
const Student = require("../Models/studentSchema");
const Parent = require("../Models/parentSchema");
const Teacher = require("../Models/TeacherSchema");
const Notification = require("../Models/notificationSchema");
const StudentLeave = require("../Models/StudentLeaveSchema");
const crypto = require("crypto");

// Fetch student & parent by roll number
exports.getStudentByRollNo = async (req, res) => {
  try {
    const { rollNo } = req.params;
    const student = await Student.findOne({ rollNumber: rollNo }).populate("parent");
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }
    res.status(200).json({ success: true, student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Request Gate Pass
exports.requestGatePass = async (req, res) => {
  try {
    const { rollNo, visitorName, visitorPhone, purpose } = req.body;
    
    const student = await Student.findOne({ rollNumber: rollNo });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    if (!student.parent) {
      return res.status(400).json({ success: false, message: "No parent linked to this student" });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const newGatePass = new GatePass({
      visitorName,
      visitorPhone,
      purpose,
      student: student._id,
      parent: student.parent,
      otp,
    });

    await newGatePass.save();

    // In a real scenario, send OTP via SMS/WhatsApp here.
    console.log(`[Gate Pass] OTP for ${visitorName} (${visitorPhone}) is ${otp}`);

    res.status(201).json({
      success: true,
      message: "OTP sent to visitor phone",
      gatePassId: newGatePass._id,
      // Sending OTP in response for demo purposes
      otp: process.env.NODE_ENV === "development" ? otp : otp 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { id, otp } = req.body;
    
    const gatePass = await GatePass.findById(id).populate("parent").populate("student");
    if (!gatePass) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    if (gatePass.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // Generate secure token for parent approval
    const approvalToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    gatePass.otpVerified = true;
    gatePass.approvalToken = approvalToken;
    gatePass.tokenExpiresAt = tokenExpiresAt;
    
    await gatePass.save();

    // Simulate sending email/WhatsApp to parent
    const approvalLink = `http://localhost:5173/gate-pass/action/${approvalToken}`;
    console.log(`[Gate Pass] Notification sent to Parent ${gatePass.parent.name} (${gatePass.parent.phone})`);
    console.log(`[Gate Pass] Approval Link: ${approvalLink}`);

    res.status(200).json({
      success: true,
      message: "OTP verified. Notification sent to parent for approval.",
      approvalLink: approvalLink // For demo purposes
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Parent Approve
exports.approveGatePass = async (req, res) => {
  try {
    const { token } = req.params;
    
    const gatePass = await GatePass.findOne({ approvalToken: token });
    
    if (!gatePass) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }

    if (new Date() > gatePass.tokenExpiresAt) {
      return res.status(400).json({ success: false, message: "Token expired" });
    }

    gatePass.status = "Approved";
    gatePass.approvalToken = null;
    gatePass.tokenExpiresAt = null;
    
    await gatePass.save();

    // 🔔 Notify Teacher(s)
    try {
      const populatedGP = await GatePass.findById(gatePass._id).populate("student");
      if (populatedGP && populatedGP.student) {
        const teachers = await Teacher.find({
          "classes.class": populatedGP.student.class,
          "classes.section": populatedGP.student.section
        });

        for (const teacher of teachers) {
          await Notification.create({
            recipient: teacher._id,
            recipientModel: "teacher",
            title: "Gate Pass Approved by Parent",
            message: `Visitor ${populatedGP.visitorName} is here to pick up ${populatedGP.student.name} (${populatedGP.student.class}-${populatedGP.student.section}). Parent has approved. Please acknowledge.`,
            type: "gate_pass"
          });
        }

        // 📝 Auto-create Student Leave Request
        await StudentLeave.create({
          student: populatedGP.student._id,
          class: populatedGP.student.class,
          section: populatedGP.student.section,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          totalDays: 1,
          reason: `Early leave via Gate Pass (Visitor: ${populatedGP.visitorName}). Parent Approved.`,
          status: "Pending"
        });
      }
    } catch (notifyError) {
      console.error("Failed to notify teacher:", notifyError);
    }

    res.status(200).json({ success: true, message: "Gate pass approved successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Parent Reject
exports.rejectGatePass = async (req, res) => {
  try {
    const { token } = req.params;
    
    const gatePass = await GatePass.findOne({ approvalToken: token });
    
    if (!gatePass) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }

    if (new Date() > gatePass.tokenExpiresAt) {
      return res.status(400).json({ success: false, message: "Token expired" });
    }

    gatePass.status = "Rejected";
    gatePass.approvalToken = null;
    gatePass.tokenExpiresAt = null;
    
    await gatePass.save();

    res.status(200).json({ success: true, message: "Gate pass rejected successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Gate Pass Status
exports.getGatePassStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const gatePass = await GatePass.findById(id).populate("student", "name rollNumber").populate("parent", "name");
    
    if (!gatePass) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    res.status(200).json({ success: true, gatePass });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Gate Passes (Admin/Guard)
exports.getAllGatePasses = async (req, res) => {
  try {
    const gatePasses = await GatePass.find()
      .populate("student", "name rollNumber class section")
      .populate("parent", "name phone")
      .sort({ createdAt: -1 });
      
    res.status(200).json({ success: true, gatePasses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Guard Complete Verification
exports.completeGatePass = async (req, res) => {
  try {
    const { id } = req.params;
    
    const gatePass = await GatePass.findById(id);
    if (!gatePass) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    if (gatePass.status !== "Approved") {
      return res.status(400).json({ success: false, message: "Gate pass is not approved" });
    }

    gatePass.status = "Completed";
    await gatePass.save();

    res.status(200).json({ success: true, message: "Visitor entry verified and completed" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// Get Pending Requests for Parent
exports.getPendingForParent = async (req, res) => {
  try {
    const parent = await Parent.findOne({ user: req.user._id });
    if (!parent) return res.status(404).json({ success: false, message: "Parent not found" });

    const gatePasses = await GatePass.find({ 
      parent: parent._id,
      status: "Pending",
      otpVerified: true 
    }).populate("student", "name rollNumber class section");

    res.status(200).json({ success: true, gatePasses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Parent Approve Direct (from dashboard)
exports.approveDirect = async (req, res) => {
  try {
    const { id } = req.params;
    const gatePass = await GatePass.findById(id);
    if (!gatePass) return res.status(404).json({ success: false, message: "Request not found" });

    gatePass.status = "Approved";
    gatePass.approvalToken = null;
    gatePass.tokenExpiresAt = null;
    await gatePass.save();

    // 🔔 Notify Teacher(s)
    try {
      const populatedGP = await GatePass.findById(gatePass._id).populate("student");
      if (populatedGP && populatedGP.student) {
        const teachers = await Teacher.find({
          "classes.class": populatedGP.student.class,
          "classes.section": populatedGP.student.section
        });

        for (const teacher of teachers) {
          await Notification.create({
            recipient: teacher._id,
            recipientModel: "teacher",
            title: "Gate Pass Approved by Parent",
            message: `Visitor ${populatedGP.visitorName} is here to pick up ${populatedGP.student.name} (${populatedGP.student.class}-${populatedGP.student.section}). Parent has approved. Please acknowledge.`,
            type: "gate_pass"
          });
        }

        // 📝 Auto-create Student Leave Request
        await StudentLeave.create({
          student: populatedGP.student._id,
          class: populatedGP.student.class,
          section: populatedGP.student.section,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          totalDays: 1,
          reason: `Early leave via Gate Pass (Visitor: ${populatedGP.visitorName}). Parent Approved.`,
          status: "Pending"
        });
      }
    } catch (notifyError) {
      console.error("Failed to notify teacher:", notifyError);
    }

    res.status(200).json({ success: true, message: "Gate pass approved" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Parent Reject Direct
exports.rejectDirect = async (req, res) => {
  try {
    const { id } = req.params;
    const gatePass = await GatePass.findById(id);
    if (!gatePass) return res.status(404).json({ success: false, message: "Request not found" });

    gatePass.status = "Rejected";
    gatePass.approvalToken = null;
    gatePass.tokenExpiresAt = null;
    await gatePass.save();

    res.status(200).json({ success: true, message: "Gate pass rejected" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
