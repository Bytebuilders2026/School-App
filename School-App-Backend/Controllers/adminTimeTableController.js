const Timetable = require("../Models/TimeTableSchema");

exports.createTimetable = async (req, res) => {
  try {
    const { class: cls, section, day, periods } = req.body;

    const exists = await Timetable.findOne({ class: cls, section, day });

    if (exists) {
      return res.status(400).json({ error: "Already exists" });
    }

    const timetable = await Timetable.create({
      class: cls,
      section,
      day,
      periods,
    });

    res.json({ message: "Created", timetable });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTimetable = async (req, res) => {
  try {
    const { class: cls, section } = req.query;

    const data = await Timetable.find({
      class: cls,
      section,
    }).populate({
      path: "periods.teacher",
      select: "name",
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteTimetable = async (req, res) => {
  try {
    const { id } = req.params;

    await Timetable.findByIdAndDelete(id);

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllTimetables = async (req, res) => {
  try {
    const data = await Timetable.find({}).populate({
      path: "periods.teacher",
      select: "name",
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
