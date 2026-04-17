const Parent = require("../Models/parentSchema");
const Student = require("../Models/studentSchema");
const Attendance = require("../Models/attendenceSchema");
const Marks = require("../Models/resultSchema");
const Remark = require("../Models/remarkSchema");
const Fee = require("../Models/feeSchema");
const Notification = require("../Models/notificationSchema");

// ═══════════════════════════════════════════════════════════════════
// 🔥 UTILITY: Calculate Dynamic Fee & Fine
// ═══════════════════════════════════════════════════════════════════
const calculateFeeWithFine = (fee) => {
  const today = new Date();
  const dueDate = new Date(fee.dueDate);
  
  let fine = 0;
  if (fee.status !== "paid" && today > dueDate) {
    // Total days difference
    const diffTime = Math.abs(today - dueDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    fine = diffDays * 10;
  }

  const baseTotal = fee.tuitionFee + fee.transportFee + fee.developmentFee;
  const totalWithFine = baseTotal + fine;
  const remaining = totalWithFine - fee.paidAmount;

  return {
    ...fee.toObject(),
    baseTotal,
    fine,
    totalWithFine,
    remaining,
    isOverdue: today > dueDate && fee.status !== "paid"
  };
};

// ═══════════════════════════════════════════════════════════════════
// API: GET /api/parent-portal/dashboard
// ═══════════════════════════════════════════════════════════════════
exports.getParentDashboard = async (req, res) => {
  try {
    const parent = await Parent.findOne({ user: req.user.id }).populate({
      path: "children",
      select: "name class section rollNumber profileImage"
    });

    if (!parent) return res.status(404).json({ message: "Parent profile not found" });

    const childrenData = [];

    for (const st of parent.children) {
      // 1. Attendance Summary
      const attTotal = await Attendance.countDocuments({ student: st._id });
      const attPresent = await Attendance.countDocuments({ student: st._id, status: "present" });
      const attendancePercentage = attTotal > 0 ? Math.round((attPresent / attTotal) * 100) : 100;

      // 2. Recent Fee Status
      const latestFee = await Fee.findOne({ student: st._id }).sort({ createdAt: -1 });
      const feeInfo = latestFee ? calculateFeeWithFine(latestFee) : null;

      // 3. Last Remark
      const lastRemark = await Remark.findOne({ student: st._id }).sort({ createdAt: -1 }).populate("teacher", "name");

      childrenData.push({
        _id: st._id,
        name: st.name,
        class: st.class,
        section: st.section,
        attendancePercentage,
        feeStatus: feeInfo?.status || "n/a",
        isFeeOverdue: feeInfo?.isOverdue || false,
        lastRemark: lastRemark?.message || "No remarks yet",
      });
    }

    res.json({
      success: true,
      data: {
        parentName: parent.name,
        children: childrenData
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ═══════════════════════════════════════════════════════════════════
// API: GET /api/parent-portal/child/:id
// ═══════════════════════════════════════════════════════════════════
exports.getChildFullDetails = async (req, res) => {
  try {
    const { id: studentId } = req.params;
    
    // Verify parent has access to this student
    const parent = await Parent.findOne({ user: req.user.id, children: studentId });
    if (!parent) return res.status(403).json({ message: "Unauthorized access to student record" });

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const attendance = await Attendance.find({ student: studentId }).sort({ date: -1 }).limit(15);
    const marks = await Marks.find({ student: studentId }).sort({ createdAt: -1 });
    const remarks = await Remark.find({ student: studentId }).populate("teacher", "name profileImage").sort({ createdAt: -1 });
    const fees = await Fee.find({ student: studentId }).sort({ createdAt: -1 });

    const feesWithFine = fees.map(f => calculateFeeWithFine(f));

    res.json({
      success: true,
      data: {
        profile: student,
        attendance,
        marks,
        remarks,
        fees: feesWithFine
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ═══════════════════════════════════════════════════════════════════
// API: POST /api/parent-portal/pay-fee/:feeId
// ═══════════════════════════════════════════════════════════════════
exports.simulateFeePayment = async (req, res) => {
  try {
    const { feeId } = req.params;
    const { method, transactionId, amount } = req.body;

    const fee = await Fee.findById(feeId);
    if (!fee) return res.status(404).json({ message: "Fee record not found" });

    const calc = calculateFeeWithFine(fee);
    
    // Create Payment Record
    const FeePayment = require("../Models/feePaymentSchema");
    const payment = await FeePayment.create({
      student: fee.student,
      amount: amount || calc.remaining,
      method,
      transactionId: transactionId || "SIM-" + Date.now(),
    });

    // Update Fee Status
    fee.paidAmount += payment.amount;
    fee.status = fee.paidAmount >= calc.totalWithFine ? "paid" : "partial";
    fee.payments.push(payment._id);
    await fee.save();

    // Notify Parent & Admin
    await Notification.create({
      recipient: req.user.id,
      recipientModel: "parent",
      title: "💰 Fee Payment Successful",
      message: `Payment of ₹${payment.amount} for ${fee.month} ${fee.year} has been received.`,
      type: "general"
    });

    res.json({ success: true, message: "Payment processed", data: fee });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
