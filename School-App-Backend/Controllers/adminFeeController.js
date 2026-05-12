const Fee = require("../Models/feeSchema");
const Student = require("../Models/studentSchema");
const Notification = require("../Models/notificationSchema");
const Parent = require("../Models/parentSchema");

// 🔥 Internal helper for fine calculation
const calculateDynamicFine = (dueDate, status) => {
  const today = new Date();
  if (status === "paid" || today <= dueDate) return 0;
  const diffDays = Math.ceil(Math.abs(today - dueDate) / (1000 * 60 * 60 * 24));
  return diffDays * 10;
};

// ═══════════════════════════════════════════════════════════════════
// API: GET /api/admin/fees/stats
// ═══════════════════════════════════════════════════════════════════
exports.getFeeStats = async (req, res) => {
  try {
    const fees = await Fee.find();
    let totalCollected = 0;
    let totalPending = 0;
    let totalFines = 0;

    fees.forEach(f => {
      const fine = calculateDynamicFine(f.dueDate, f.status);
      totalCollected += f.paidAmount;
      const baseTotal = f.tuitionFee + f.transportFee + f.developmentFee;
      totalPending += (baseTotal + fine) - f.paidAmount;
      totalFines += fine;
    });

    res.json({
      success: true,
      data: {
        totalCollected,
        totalPending,
        totalFines,
        totalInvoices: fees.length,
        paidCount: fees.filter(f => f.status === "paid").length,
        pendingCount: fees.filter(f => f.status !== "paid").length,
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ═══════════════════════════════════════════════════════════════════
// API: GET /api/admin/fees/all
// ═══════════════════════════════════════════════════════════════════
exports.getAllFees = async (req, res) => {
  try {
    const fees = await Fee.find()
      .populate("student", "name class section rollNumber")
      .sort({ createdAt: -1 });

    const processedFees = fees.map(f => {
      const fine = calculateDynamicFine(f.dueDate, f.status);
      const baseTotal = f.tuitionFee + f.transportFee + f.developmentFee;
      return {
        ...f.toObject(),
        fine,
        totalPayable: baseTotal + fine,
        isOverdue: new Date() > f.dueDate && f.status !== "paid"
      };
    });

    res.json({ success: true, data: processedFees });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ═══════════════════════════════════════════════════════════════════
// API: POST /api/admin/fees/send-reminders
// ═══════════════════════════════════════════════════════════════════
exports.sendGlobalFeeReminders = async (req, res) => {
  try {
    const unpaidFees = await Fee.find({ status: { $ne: "paid" } }).populate("student");
    let count = 0;

    for (const fee of unpaidFees) {
      const student = fee.student;
      if (!student || !student.parent) continue;

      const fine = calculateDynamicFine(fee.dueDate, fee.status);
      const message = `Reminder: School fee for ${student.name} (${fee.month}) is pending. Current fine: ₹${fine}. Please pay immediately to avoid further charges.`;

      // Find Parent User
      const parentProfile = await Parent.findById(student.parent);
      if (parentProfile && parentProfile.user) {
        await Notification.create({
          recipient: parentProfile.user,
          recipientModel: "parent",
          title: "⚠️ Fee Payment Reminder",
          message,
          type: "general"
        });
        count++;
      }
    }

    res.json({ success: true, message: `Reminders sent to ${count} parents.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
