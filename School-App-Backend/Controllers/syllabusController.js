const Syllabus = require("../Models/syllabusSchema");

// POST /api/syllabus/add
exports.addSyllabus = async (req, res) => {
  try {
    const { class: className, subject, title, description, fileUrl } = req.body;
    const syllabus = await Syllabus.create({
      class: className,
      subject,
      title,
      description,
      fileUrl,
      addedBy: req.user.id
    });
    res.status(201).json({ success: true, syllabus });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET /api/syllabus/class/:className
exports.getSyllabus = async (req, res) => {
  try {
    const { className } = req.params;
    const syllabi = await Syllabus.find({ class: className }).sort({ createdAt: -1 });
    res.json(syllabi);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/syllabus/:id
exports.deleteSyllabus = async (req, res) => {
  try {
    await Syllabus.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Syllabus deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
