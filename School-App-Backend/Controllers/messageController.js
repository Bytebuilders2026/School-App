const Message = require("../Models/messageSchema");
const User = require("../Models/user");
const Student = require("../Models/studentSchema");
const Teacher = require("../Models/TeacherSchema");
const Timetable = require("../Models/TimeTableSchema");

// ➤ Send Message
exports.sendMessage = async (req, res) => {
  try {
    const { conversationType, receiverId, groupId, message } = req.body;
    const senderId = req.user.id;

    if (!message || !message.trim()) return res.status(400).json({ message: "Message cannot be empty" });

    const msgData = {
      sender: senderId,
      conversationType,
      message: message.trim(),
    };

    if (conversationType === "personal") {
      if (!receiverId) return res.status(400).json({ message: "receiverId required for personal chat" });
      msgData.receiver = receiverId;
    } else {
      if (!groupId) return res.status(400).json({ message: "groupId required for group chat" });
      msgData.groupId = groupId;
    }

    const newMessage = await Message.create(msgData);

    // Populate sender details for immediate response
    const senderUser = await User.findById(senderId, "role");
    let senderProfile = null;
    if (senderUser?.role === "student") {
      senderProfile = await Student.findOne({ user: senderId }, "name profileImage");
    } else if (senderUser?.role === "teacher") {
      senderProfile = await Teacher.findOne({ user: senderId }, "name profileImage");
    }

    res.status(201).json({
      ...newMessage.toObject(),
      senderDetails: senderProfile ? { name: senderProfile.name, profileImage: senderProfile.profileImage } : { name: "Unknown" },
    });
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ➤ Get Messages for a conversation
exports.getMessages = async (req, res) => {
  try {
    const { type, id } = req.params;
    const userId = req.user.id;

    let query = {};
    if (type === "personal") {
      query = {
        conversationType: "personal",
        $or: [
          { sender: userId, receiver: id },
          { sender: id, receiver: userId },
        ],
      };
    } else {
      query = {
        conversationType: "group",
        groupId: id,
      };
    }

    const messages = await Message.find(query).sort({ createdAt: 1 });

    // Populate sender details
    const populatedMessages = await Promise.all(
      messages.map(async (msg) => {
        const msgObj = msg.toObject();
        const senderUser = await User.findById(msg.sender, "role");
        let senderProfile = null;
        if (senderUser?.role === "student") {
          senderProfile = await Student.findOne({ user: msg.sender }, "name profileImage");
        } else if (senderUser?.role === "teacher") {
          senderProfile = await Teacher.findOne({ user: msg.sender }, "name profileImage");
        }
        msgObj.senderDetails = senderProfile
          ? { name: senderProfile.name, profileImage: senderProfile.profileImage }
          : { name: "Unknown" };
        return msgObj;
      })
    );

    res.json(populatedMessages);
  } catch (err) {
    console.error("Get messages error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ➤ Get Conversation List
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let groups = [];
    let personalChats = [];

    if (role === "student") {
      // ── STUDENT: find their class group + all teachers teaching them ──
      const student = await Student.findOne({ user: userId });
      if (student) {
        const cls = student.class;
        const sec = student.section;

        // 1) Class group
        groups.push({
          id: `${cls}-${sec}`,
          name: `Class ${cls} - ${sec}`,
          type: "group",
        });

        // 2) Find all unique teacher IDs from timetable for this class/section
        const timetableEntries = await Timetable.find({ class: cls, section: sec });
        const teacherIdSet = new Set();
        timetableEntries.forEach((entry) => {
          entry.periods.forEach((p) => {
            if (p.teacher) teacherIdSet.add(p.teacher.toString());
          });
        });

        // 3) Fetch teacher profiles + their user._id
        for (let teacherId of teacherIdSet) {
          const teacher = await Teacher.findById(teacherId, "name profileImage user");
          if (teacher && teacher.user) {
            personalChats.push({
              id: teacher.user.toString(),
              name: teacher.name,
              type: "personal",
              role: "teacher",
              profileImage: teacher.profileImage || null,
              lastMessage: "Tap to start a conversation",
              lastTime: null,
            });
          }
        }
      }
    } else if (role === "teacher") {
      // ── TEACHER: find all class groups they teach ──
      const teacher = await Teacher.findOne({ user: userId });
      if (teacher) {
        const timetableEntries = await Timetable.find({ "periods.teacher": teacher._id });
        const classSet = new Set();
        timetableEntries.forEach((entry) => {
          const key = `${entry.class}-${entry.section}`;
          if (!classSet.has(key)) {
            classSet.add(key);
            groups.push({
              id: key,
              name: `Class ${entry.class} - ${entry.section}`,
              type: "group",
            });
          }
        });
      }
    }

    // ── BOTH: fetch recent personal message history ──
    const recentMessages = await Message.find({
      conversationType: "personal",
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .sort({ createdAt: -1 })
      .limit(50);

    // Build a set of user IDs already in personalChats (to avoid duplicates)
    const seenIds = new Set(personalChats.map((c) => c.id.toString()));

    for (let msg of recentMessages) {
      if (!msg.sender || !msg.receiver) continue;
      const otherUserId =
        msg.sender.toString() === userId.toString()
          ? msg.receiver.toString()
          : msg.sender.toString();

      if (seenIds.has(otherUserId)) {
        // Update last message for already-listed contacts
        const idx = personalChats.findIndex((c) => c.id.toString() === otherUserId);
        if (idx !== -1 && !personalChats[idx].lastTime) {
          personalChats[idx].lastMessage = msg.message;
          personalChats[idx].lastTime = msg.createdAt;
        }
        continue;
      }

      seenIds.add(otherUserId);
      const otherUser = await User.findById(otherUserId, "role");
      if (!otherUser) continue;

      let profile = null;
      if (otherUser.role === "student") {
        profile = await Student.findOne({ user: otherUserId }, "name profileImage");
      } else if (otherUser.role === "teacher") {
        profile = await Teacher.findOne({ user: otherUserId }, "name profileImage");
      }

      if (profile) {
        personalChats.push({
          id: otherUserId,
          name: profile.name,
          type: "personal",
          role: otherUser.role,
          profileImage: profile.profileImage || null,
          lastMessage: msg.message,
          lastTime: msg.createdAt,
        });
      }
    }

    res.json({ groups, personalChats });
  } catch (err) {
    console.error("Get conversations error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ➤ Search Users to Start New Chat
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.user.id;
    const role = req.user.role;

    if (!query || query.length < 1) return res.json([]);

    const regex = new RegExp(query, "i");
    let results = [];

    if (role === "student") {
      // Students can only search teachers
      const teachers = await Teacher.find({ name: regex }, "name user profileImage").limit(15);
      results = teachers
        .filter((t) => t.user && t.user.toString() !== userId.toString())
        .map((t) => ({ id: t.user, name: t.name, role: "teacher", profileImage: t.profileImage }));
    } else if (role === "teacher") {
      // Teachers can search both students and teachers
      const students = await Student.find({ name: regex }, "name user profileImage").limit(10);
      const teachers = await Teacher.find({ name: regex }, "name user profileImage").limit(10);
      results = [
        ...students
          .filter((s) => s.user && s.user.toString() !== userId.toString())
          .map((s) => ({ id: s.user, name: s.name, role: "student", profileImage: s.profileImage })),
        ...teachers
          .filter((t) => t.user && t.user.toString() !== userId.toString())
          .map((t) => ({ id: t.user, name: t.name, role: "teacher", profileImage: t.profileImage })),
      ];
    }

    res.json(results);
  } catch (err) {
    console.error("Search users error:", err);
    res.status(500).json({ message: err.message });
  }
};
