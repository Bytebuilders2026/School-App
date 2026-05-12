const Student = require("../Models/studentSchema");
const Attendance = require("../Models/attendenceSchema");
const Marks = require("../Models/resultSchema");
const Notification = require("../Models/notificationSchema");
const Homework = require("../Models/homeworkSchema");
const Teacher = require("../Models/TeacherSchema");
const Parent = require("../Models/parentSchema");


// ═══════════════════════════════════════════════════════════════════
// 🔥 CORE: Risk Prediction Engine
// ═══════════════════════════════════════════════════════════════════

const calculateStudentRisk = (attendance, marks, missingHomework) => {
  let score = 0;
  const reasons = [];

  if (attendance < 75) {
    score += 40;
    reasons.push("Critical attendance below 75%");
  }

  if (marks < 50) {
    score += 30;
    reasons.push("Average marks below 50%");
  }

  if (missingHomework > 3) {
    score += 30;
    reasons.push("More than 3 homework assignments missing");
  }

  let level = "low";
  if (score >= 70) level = "high";
  else if (score >= 30) level = "medium";

  return { score, level, reasons };
};

// ═══════════════════════════════════════════════════════════════════
// 🔥 CORE: Full Performance Calculator (with Trends)
// ═══════════════════════════════════════════════════════════════════

const calculatePerformance = async (studentId) => {
  // 1. Attendance
  const totalAtt = await Attendance.countDocuments({ student: studentId });
  const presentAtt = await Attendance.countDocuments({ student: studentId, status: "present" });
  const attendancePercentage = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 0;

  // Attendance Trend (last 15 days vs previous 15 days)
  const now = Date.now();
  const last15Total = await Attendance.countDocuments({ student: studentId, date: { $gte: new Date(now - 15*86400000) } });
  const last15Present = await Attendance.countDocuments({ student: studentId, status: "present", date: { $gte: new Date(now - 15*86400000) } });
  const prev15Total = await Attendance.countDocuments({ student: studentId, date: { $gte: new Date(now - 30*86400000), $lt: new Date(now - 15*86400000) } });
  const prev15Present = await Attendance.countDocuments({ student: studentId, status: "present", date: { $gte: new Date(now - 30*86400000), $lt: new Date(now - 15*86400000) } });

  const curAttPerc = last15Total > 0 ? (last15Present / last15Total) * 100 : attendancePercentage;
  const oldAttPerc = prev15Total > 0 ? (prev15Present / prev15Total) * 100 : attendancePercentage;
  const attendanceTrend = { direction: curAttPerc >= oldAttPerc ? "up" : "down", change: Math.abs(curAttPerc - oldAttPerc).toFixed(1) };

  // 2. Marks
  const marksRecords = await Marks.find({ student: studentId }).sort({ createdAt: -1 });
  let averageMarks = 0;
  let marksTrend = { direction: "up", change: "0" };
  let weakSubjects = [];

  if (marksRecords.length > 0) {
    let totalObt = 0, totalPos = 0;
    const subjectMarks = {};

    marksRecords.forEach(r => { 
      totalObt += r.marksObtained || 0; 
      totalPos += r.totalMarks || 100; 
      
      if (!subjectMarks[r.subject]) subjectMarks[r.subject] = { obt: 0, tot: 0 };
      subjectMarks[r.subject].obt += r.marksObtained || 0;
      subjectMarks[r.subject].tot += r.totalMarks || 100;
    });
    
    if (totalPos > 0) averageMarks = Math.round((totalObt / totalPos) * 100);

    Object.keys(subjectMarks).forEach(subj => {
      const perc = (subjectMarks[subj].obt / subjectMarks[subj].tot) * 100;
      if (perc < 50) {
         weakSubjects.push(subj);
      }
    });

    if (marksRecords.length > 1) {
      const latest = (marksRecords[0].marksObtained / marksRecords[0].totalMarks) * 100;
      let prevSum = 0;
      marksRecords.slice(1).forEach(r => prevSum += (r.marksObtained / r.totalMarks) * 100);
      const prevAvg = prevSum / (marksRecords.length - 1);
      marksTrend = { direction: latest >= prevAvg ? "up" : "down", change: Math.abs(latest - prevAvg).toFixed(1) };
    }
  }

  // 3. Homework
  const studentProfile = await Student.findById(studentId);
  const totalHW = await Homework.countDocuments({ class: studentProfile?.class, section: studentProfile?.section });
  const completedHW = await Homework.countDocuments({ class: studentProfile?.class, section: studentProfile?.section, completedBy: studentId });
  const missingHomeworkCount = totalHW - completedHW;
  const homeworkPercentage = totalHW > 0 ? Math.round((completedHW / totalHW) * 100) : 100;

  // 4. Risk Engine
  const risk = calculateStudentRisk(attendancePercentage, averageMarks, missingHomeworkCount);

  return {
    attendancePercentage, attendanceTrend,
    averageMarks, marksTrend,
    homeworkPercentage, missingHomeworkCount,
    riskScore: risk.score, riskLevel: risk.level, riskReasons: risk.reasons,
    marksRecords, weakSubjects
  };
};

// ═══════════════════════════════════════════════════════════════════
// AI Insights Generator
// ═══════════════════════════════════════════════════════════════════

const generateInsights = (data) => {
  const { attendancePercentage, attendanceTrend, averageMarks, marksTrend, missingHomeworkCount, weakSubjects } = data;
  const insights = [];

  if (attendancePercentage < 75) {
    insights.push(`Critically low attendance (${attendancePercentage}%) is causing major learning gaps.`);
  } else if (attendanceTrend.direction === "down" && parseFloat(attendanceTrend.change) > 10) {
    insights.push(`Attendance dropped by ${attendanceTrend.change}% in recent weeks.`);
  }

  if (marksTrend.direction === "down" && parseFloat(marksTrend.change) > 15) {
    insights.push(`Grades dropped by ${marksTrend.change}% in recent assessments. Evaluate weekly review methods.`);
  }

  if (weakSubjects && weakSubjects.length > 0) {
    insights.push(`Weak Subjects Detected: ${weakSubjects.join(', ')}. Focus on foundational concepts here.`);
  }

  if (missingHomeworkCount > 3) {
    insights.push(`${missingHomeworkCount} missing homework assignments are affecting internal scores.`);
  }

  if (averageMarks > 0 && averageMarks < 50) {
    insights.push("Average academic performance across all units is below passing standards. Urgent monthly check-up needed.");
  }

  if (insights.length === 0) insights.push("Student is performing consistently well across all weekly and monthly performance metrics.");
  return insights;
};

// ═══════════════════════════════════════════════════════════════════
// Smart Suggestions Engine
// ═══════════════════════════════════════════════════════════════════

const generateSuggestions = (riskLevel, weakSubjects) => {
  let suggestions = [];

  if (weakSubjects && weakSubjects.length > 0) {
    suggestions.push(`Guidance: You are weak in ${weakSubjects.join(', ')}. Focus heavily on revisiting the last 2 units taught in these subjects.`);
    if (weakSubjects.includes("Maths") || weakSubjects.includes("Math")) {
      suggestions.push("For Maths: Solve 10 extra problem sets from previous monthly tests and practice theorems daily.");
    }
    if (weakSubjects.includes("Science")) {
      suggestions.push("For Science: Review scientific diagrams and physics core formulas twice a week.");
    }
  }

  if (riskLevel === "high") {
    suggestions.push("Attend minimum 80% classes immediately.");
    suggestions.push("Complete all pending homework today to catch up on weekly syllabus.");
    suggestions.push("Schedule urgent mentor/parent meeting to discuss monthly report.");
  } else if (riskLevel === "medium") {
    suggestions.push("Improve daily attendance consistency.");
    suggestions.push("Focus more on assignments with low grades.");
    suggestions.push("Submit homework directly after school.");
  } else {
    suggestions.push("Keep up the great work on monthly tests!");
    suggestions.push("Help peers as a study buddy to reinforce your learning.");
    suggestions.push("Try advanced extra-curricular challenges.");
  }
  
  return suggestions;
};

// ═══════════════════════════════════════════════════════════════════
// API: GET /api/performance/me  &  GET /api/performance/student/:studentId
// ═══════════════════════════════════════════════════════════════════

exports.getStudentPerformance = async (req, res) => {
  try {
    let studentId = req.params.studentId;

    if (!studentId || studentId === "me") {
      const sp = await Student.findOne({ user: req.user.id });
      if (!sp) return res.status(404).json({ error: "Student profile not found" });
      studentId = sp._id;
    }

    const perf = await calculatePerformance(studentId);
    const insights = generateInsights(perf);
    const suggestions = generateSuggestions(perf.riskLevel, perf.weakSubjects);

    // Group marks by examType for chart
    const marksByExam = {};
    perf.marksRecords.forEach(r => {
      if (!marksByExam[r.examType]) marksByExam[r.examType] = { name: r.examType, totalScore: 0, count: 0 };
      marksByExam[r.examType].totalScore += Math.round((r.marksObtained / r.totalMarks) * 100);
      marksByExam[r.examType].count += 1;
    });
    const marksTrendChart = Object.values(marksByExam).map(e => ({ name: e.name, score: Math.round(e.totalScore / e.count) }));

    // Auto-notify on high risk or weak subjects (1-day cooldown)
    if (perf.riskLevel === "high" || (perf.weakSubjects && perf.weakSubjects.length > 0)) {
      const existing = await Notification.findOne({ recipient: studentId, type: "performance_alert", createdAt: { $gte: new Date(Date.now() - 86400000) } });
      if (!existing) {
        let msg = `Risk: ${perf.riskLevel.toUpperCase()}. `;
        if (perf.weakSubjects && perf.weakSubjects.length > 0) msg += `Weak Subjects: ${perf.weakSubjects.join(', ')}. `;
        msg += perf.riskReasons.join(", ");
        
        await Notification.create({ recipient: studentId, recipientModel: "student", title: "⚠️ Performance Analysis Alert", message: msg, type: "performance_alert" });
        const st = await Student.findById(studentId);
        if (st?.parent) {
          const parentMsg = perf.weakSubjects && perf.weakSubjects.length > 0 
              ? `Your child ${st.name} requires academic guidance in: ${perf.weakSubjects.join(', ')}. Please refer to the Weekly/Monthly student AI panel.`
              : `Your child ${st.name} is at Academic Risk. Please check the performance dashboard.`;
          await Notification.create({ recipient: st.parent, recipientModel: "parent", title: "⚠️ Academic Performance Report", message: parentMsg, type: "performance_alert" });
        }
      }
    }

    res.json({
      success: true,
      data: {
        metrics: {
          attendancePercentage: perf.attendancePercentage,
          attendanceTrend: perf.attendanceTrend,
          averageMarks: perf.averageMarks,
          marksTrend: perf.marksTrend,
          performanceScore: perf.riskScore,
          missingHomeworkCount: perf.missingHomeworkCount,
        },
        riskLevel: perf.riskLevel,
        insights,
        suggestions,
        trends: { marks: marksTrendChart }
      }
    });
  } catch (error) {
    console.error("Performance API Error:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// ═══════════════════════════════════════════════════════════════════
// API: POST /api/performance/chatbot
// ═══════════════════════════════════════════════════════════════════

exports.askPerformanceChatbot = async (req, res) => {
  try {
    const { query: rawQuery } = req.body;
    if (!rawQuery) return res.status(400).json({ error: "Query is required" });
    const query = rawQuery.toLowerCase();

    const sp = await Student.findOne({ user: req.user.id });
    if (!sp) return res.status(404).json({ error: "Student profile not found" });

    const perf = await calculatePerformance(sp._id);

    // Why risk is high/medium
    if (query.includes("why") && (query.includes("risk") || query.includes("high") || query.includes("low"))) {
      if (perf.riskLevel === "low") return res.json({ success: true, response: "Your risk is LOW — good attendance, strong marks, and homework is on track. Keep it up!" });
      return res.json({ success: true, response: `Your risk is ${perf.riskLevel.toUpperCase()} because: ${perf.riskReasons.join(", ")}. Fix these to lower your risk.` });
    }

    if (query.includes("attendance")) {
      let r = `Your attendance is ${perf.attendancePercentage}%. `;
      r += perf.attendanceTrend.direction === "up" ? "It has been improving lately." : "It has dropped recently.";
      return res.json({ success: true, response: r });
    }

    if (query.includes("marks") || query.includes("grades") || query.includes("performance")) {
      let r = `Your average marks are ${perf.averageMarks}%. `;
      r += perf.marksTrend.direction === "down" ? `Warning: scores dropped by ${perf.marksTrend.change}% recently.` : `Good news: scores improved by ${perf.marksTrend.change}%!`;
      return res.json({ success: true, response: r });
    }

    if (query.includes("homework")) {
      return res.json({ success: true, response: `You have ${perf.missingHomeworkCount} missing homework assignments. Completing these will boost your score.` });
    }

    if (query.includes("improve") || query.includes("help") || query.includes("advice") || query.includes("weak") || query.includes("guidance")) {
      const s = generateSuggestions(perf.riskLevel, perf.weakSubjects);
      return res.json({ success: true, response: `AI Guidance: ${s.join(" ")} Please focus on the highlighted units.` });
    }

    if (query.includes("score")) {
      return res.json({ success: true, response: `Your Risk Score is ${perf.riskScore}/100. Level: ${perf.riskLevel.toUpperCase()}.` });
    }

    res.json({ success: true, response: "I'm your Performance AI. Ask me about your attendance, marks, homework, risk level, or how to improve!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, response: "Chatbot error" });
  }
};

// ═══════════════════════════════════════════════════════════════════
// API: GET /api/performance/class-risk?class=10th&section=A
// ═══════════════════════════════════════════════════════════════════

exports.getClassRiskStats = async (req, res) => {
  try {
    const { class: cls, section } = req.query;
    if (!cls || !section) return res.status(400).json({ error: "Class and Section required" });

    const students = await Student.find({ class: cls, section });
    const results = [];

    for (const st of students) {
      const perf = await calculatePerformance(st._id);
      results.push({
        _id: st._id, name: st.name, rollNumber: st.rollNumber,
        score: perf.riskScore, level: perf.riskLevel,
        attendance: perf.attendancePercentage, marks: perf.averageMarks,
        reasons: perf.riskReasons
      });
    }

    res.json({
      success: true,
      data: {
        total: results.length,
        highRisk: results.filter(s => s.level === "high"),
        mediumRisk: results.filter(s => s.level === "medium"),
        lowRisk: results.filter(s => s.level === "low")
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Class risk stats error" });
  }
};

// ═══════════════════════════════════════════════════════════════════
// API: GET /api/performance/admin/stats
// ═══════════════════════════════════════════════════════════════════

exports.getAdminStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const allStudents = await Student.find({}, '_id class section');
    let highRiskCount = 0;
    let lowAttendanceCount = 0;

    for (let st of allStudents) {
      const attTotal = await Attendance.countDocuments({ student: st._id });
      const attPresent = await Attendance.countDocuments({ student: st._id, status: "present" });
      let attPerc = attTotal > 0 ? (attPresent / attTotal) * 100 : 100;
      if (attPerc < 75) lowAttendanceCount++;

      let marksAvg = 100;
      const marks = await Marks.find({ student: st._id });
      if (marks.length > 0) {
        let obt = 0, tot = 0;
        marks.forEach(m => { obt += (m.marksObtained || 0); tot += (m.totalMarks || 100); });
        marksAvg = (obt / tot) * 100;
      }
      if (attPerc < 75 && marksAvg < 40) highRiskCount++;
    }

    const recentAlerts = await Notification.find({ type: "performance_alert", recipientModel: "student" })
      .sort({ createdAt: -1 }).limit(5).populate('recipient', 'name class section');

    const classWisePerformance = [
      { class: "10th", avgScore: 78, highRisk: 2 },
      { class: "9th", avgScore: 82, highRisk: 0 },
      { class: "11th", avgScore: 65, highRisk: 5 },
      { class: "12th", avgScore: 88, highRisk: 1 }
    ];

    res.json({
      success: true,
      data: { totalStudents, highRiskCount, lowAttendanceCount, recentAlerts, classWisePerformance }
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({ success: false, error: "Stats error" });
  }
};

// Export utility for use by notificationController
exports.calculatePerformance = calculatePerformance;
