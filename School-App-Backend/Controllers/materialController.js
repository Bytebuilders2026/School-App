const Material = require("../Models/materialSchema");
const Teacher = require("../Models/TeacherSchema");
const Student = require("../Models/studentSchema");
const Timetable = require("../Models/TimeTableSchema");
const path = require("path");
const fs = require("fs");

// ➤ Teacher: Upload material for a class
exports.uploadMaterial = async (req, res) => {
  try {
    const userId = req.user.id;
    const teacher = await Teacher.findOne({ user: userId });
    if (!teacher) return res.status(404).json({ message: "Teacher profile not found" });

    const { title, description, subject, class: cls, section, externalLink } = req.body;

    if (!title || !cls || !section || !subject) {
      return res.status(400).json({ message: "Title, class, section and subject are required" });
    }

    const materialData = {
      title,
      description: description || "",
      subject,
      class: cls,
      section,
      teacher: teacher._id,
    };

    // File upload (via multer)
    if (req.file) {
      materialData.fileName = req.file.originalname;
      materialData.filePath = req.file.path;
      materialData.fileType = req.file.mimetype;
      materialData.fileSize = req.file.size;
    } else if (externalLink) {
      materialData.externalLink = externalLink;
    } else {
      return res.status(400).json({ message: "Please upload a file or provide a link" });
    }

    const material = await Material.create(materialData);
    res.status(201).json({ message: "Material uploaded successfully", material });
  } catch (err) {
    console.error("Upload material error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ➤ Teacher: Get all materials they uploaded (optionally filter by class/section)
exports.getMyMaterials = async (req, res) => {
  try {
    const userId = req.user.id;
    const teacher = await Teacher.findOne({ user: userId });
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    const filter = { teacher: teacher._id };
    if (req.query.class) filter.class = req.query.class;
    if (req.query.section) filter.section = req.query.section;

    const materials = await Material.find(filter)
      .populate("teacher", "name")
      .sort({ createdAt: -1 });

    res.json(materials);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ➤ Teacher: Delete a material
exports.deleteMaterial = async (req, res) => {
  try {
    const userId = req.user.id;
    const teacher = await Teacher.findOne({ user: userId });
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    const material = await Material.findOne({ _id: req.params.id, teacher: teacher._id });
    if (!material) return res.status(404).json({ message: "Material not found" });

    // Delete physical file if exists
    if (material.filePath && fs.existsSync(material.filePath)) {
      fs.unlinkSync(material.filePath);
    }

    await Material.findByIdAndDelete(req.params.id);
    res.json({ message: "Material deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ➤ Teacher: Get classes they teach (from timetable)
exports.getTeacherClasses = async (req, res) => {
  try {
    const userId = req.user.id;
    const teacher = await Teacher.findOne({ user: userId });
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    const timetableEntries = await Timetable.find({ "periods.teacher": teacher._id });
    const classSet = new Map();

    timetableEntries.forEach((entry) => {
      const key = `${entry.class}-${entry.section}`;
      if (!classSet.has(key)) {
        const subjects = entry.periods
          .filter((p) => p.teacher?.toString() === teacher._id.toString())
          .map((p) => p.subject);
        classSet.set(key, {
          class: entry.class,
          section: entry.section,
          subjects: [...new Set(subjects)],
        });
      } else {
        const existing = classSet.get(key);
        const moreSubjects = entry.periods
          .filter((p) => p.teacher?.toString() === teacher._id.toString())
          .map((p) => p.subject);
        existing.subjects = [...new Set([...existing.subjects, ...moreSubjects])];
      }
    });

    res.json([...classSet.values()]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ➤ Student: Get materials for their class
exports.getStudentMaterials = async (req, res) => {
  try {
    const userId = req.user.id;
    const student = await Student.findOne({ user: userId });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const filter = { class: student.class, section: student.section };
    if (req.query.subject) filter.subject = req.query.subject;

    const materials = await Material.find(filter)
      .populate("teacher", "name")
      .sort({ createdAt: -1 });

    res.json(materials);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ➤ Download/Serve a file
exports.downloadMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material || !material.filePath) {
      return res.status(404).json({ message: "File not found" });
    }

    const absPath = path.resolve(material.filePath);
    if (!fs.existsSync(absPath)) {
      return res.status(404).json({ message: "File no longer exists on server" });
    }

    res.download(absPath, material.fileName);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
