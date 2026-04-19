import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminSidebar from "../../Layouts/AdminSidebar";
import { Calendar, Users, BarChart3, Inbox } from "lucide-react";
import { API_BASE_URL } from "../../apiConfig";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const CLASSES = ["Pre-Nursery", "Nursery", "KG", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];
const SECTIONS = ["A", "B", "C", "D"];

// ─── build time-slot based grid from day-based timetable ────────────────────
function buildGrid(timetable) {
  const dayMap = {};
  DAYS.forEach((d) => (dayMap[d] = []));
  timetable.forEach((entry) => {
    if (dayMap[entry.day]) {
      entry.periods.forEach((p) =>
        dayMap[entry.day].push({ ...p, _entryId: entry._id })
      );
      dayMap[entry.day].sort((a, b) => (a.startTime > b.startTime ? 1 : -1));
    }
  });
  const slots = new Set();
  Object.values(dayMap).forEach((ps) => ps.forEach((p) => slots.add(`${p.startTime} - ${p.endTime}`)));
  return { dayMap, timeSlots: Array.from(slots).sort() };
}

// ─── Student Detail Popup ────────────────────────────────────────────────────
function StudentDetailPopup({ student, onClose }) {
  const [att, setAtt] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/students/attendance/${student._id}`)
      .then((r) => setAtt(r.data))
      .catch(() => setAtt({ total: 0, present: 0, absent: 0, leave: 0, percentage: 0, records: [] }));
  }, [student._id]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-800">{student.name}</h2>
            <p className="text-sm text-gray-400">Roll No: {student.rollNumber}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 text-xl">✕</button>
        </div>
        <div className="p-6 space-y-5">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Admission No", value: student.admissionNumber || "—" },
              { label: "Class", value: `${student.class} – ${student.section}` },
              { label: "Phone", value: student.phone || "—" },
              { label: "Email", value: student.email || "—" },
              { label: "Address", value: student.address || "—" },
              { label: "Status", value: student.isActive ? "Active" : "Inactive" },
            ].map((item) => (
              <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-[11px] text-gray-400 mb-0.5">{item.label}</p>
                <p className="text-sm font-semibold text-gray-700">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Attendance Stats */}
          {att && (
            <>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><BarChart3 size={16} /> Attendance (Last 30 Days)</h3>
                <div className="grid grid-cols-4 gap-3 mb-3">
                  {[
                    { label: "Total", value: att.total, color: "bg-gray-100 text-gray-700" },
                    { label: "Present", value: att.present, color: "bg-green-50 text-green-700" },
                    { label: "Absent", value: att.absent, color: "bg-red-50 text-red-600" },
                    { label: "Leave", value: att.leave, color: "bg-yellow-50 text-yellow-600" },
                  ].map((s) => (
                    <div key={s.label} className={`${s.color} rounded-xl p-3 text-center`}>
                      <p className="text-xl font-bold">{s.value}</p>
                      <p className="text-[11px] font-medium mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
                {/* Progress Bar */}
                <div className="bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full bg-green-400 rounded-full transition-all duration-700"
                    style={{ width: `${att.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1.5 text-right">{att.percentage}% attendance</p>
              </div>

              {/* Recent Records */}
              {att.records.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Recent Records</h3>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {att.records.map((r) => (
                      <div key={r._id} className="flex justify-between items-center text-xs bg-gray-50 rounded-lg px-3 py-2">
                        <span className="text-gray-500">{new Date(r.date).toLocaleDateString("en-IN")}</span>
                        <span className={`font-semibold capitalize px-2 py-0.5 rounded-full text-[11px] ${
                          r.status === "present" ? "bg-green-100 text-green-700" :
                          r.status === "absent" ? "bg-red-100 text-red-600" :
                          "bg-yellow-100 text-yellow-600"
                        }`}>{r.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Add Timetable Modal ─────────────────────────────────────────────────────
function AddTimetableModal({ cls, section, teachers, onClose, onSave }) {
  const [day, setDay] = useState("");
  const [periods, setPeriods] = useState([{ subject: "", teacher: "", startTime: "", endTime: "" }]);
  const [saving, setSaving] = useState(false);

  const handleChange = (i, field, value) => {
    const updated = [...periods];
    updated[i][field] = value;
    setPeriods(updated);
  };

  const handleSubmit = async () => {
    if (!day) return alert("Select a day");
    setSaving(true);
    try {
      await axios.post(`${API_BASE_URL}/timetable/create`, { class: cls, section, day, periods });
      onSave();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to save");
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-base font-bold text-gray-800">Add Timetable — {cls} / {section}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 text-xl">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Day</label>
            <select
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#89D4FF]"
              onChange={(e) => setDay(e.target.value)}
            >
              <option value="">Select day</option>
              {DAYS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>

          {/* Periods */}
          <div>
            <div className="grid grid-cols-4 gap-2 mb-2 px-1">
              {["Subject", "Teacher", "Start", "End"].map((l) => (
                <span key={l} className="text-xs font-semibold text-gray-400">{l}</span>
              ))}
            </div>
            {periods.map((p, i) => (
              <div key={i} className="grid grid-cols-4 gap-2 mb-2">
                <input placeholder="Subject" className="border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#89D4FF]"
                  onChange={(e) => handleChange(i, "subject", e.target.value)} />
                <select className="border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#89D4FF]"
                  onChange={(e) => handleChange(i, "teacher", e.target.value)}>
                  <option value="">Teacher</option>
                  {teachers.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
                <input type="time" className="border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#89D4FF]"
                  onChange={(e) => handleChange(i, "startTime", e.target.value)} />
                <input type="time" className="border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#89D4FF]"
                  onChange={(e) => handleChange(i, "endTime", e.target.value)} />
              </div>
            ))}
            <button onClick={() => setPeriods([...periods, { subject: "", teacher: "", startTime: "", endTime: "" }])}
              className="mt-1 text-xs text-[#89D4FF] border border-[#89D4FF]/40 px-3 py-1.5 rounded-lg hover:bg-[#89D4FF]/10 transition">
              + Add Period
            </button>
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-5 py-2 text-sm border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="px-5 py-2 text-sm bg-[#89D4FF] text-white rounded-xl hover:bg-[#6ac0f0] disabled:opacity-50">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function AdminTimetable() {
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [timetable, setTimetable] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [viewStudent, setViewStudent] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/admin/teachers/all`).then((r) => setTeachers(r.data));
  }, []);

  const fetchTimetable = async (cls, sec) => {
    const r = await axios.get(`${API_BASE_URL}/timetable/get?class=${cls}&section=${sec}`);
    setTimetable(r.data);
  };

  const fetchStudents = async (cls, sec) => {
    const r = await axios.get(`${API_BASE_URL}/students/by-class?cls=${cls}&section=${sec}`);
    setStudents(r.data);
  };

  const handleSelectSection = (sec) => {
    setSelectedSection(sec);
    setTimetable([]);
    setStudents([]);
    fetchTimetable(selectedClass, sec);
    fetchStudents(selectedClass, sec);
  };

  const { dayMap, timeSlots } = buildGrid(timetable);

  return (
    <AdminSidebar>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          {selectedClass && (
            <button onClick={() => { setSelectedClass(null); setSelectedSection(null); }}
              className="text-sm text-[#89D4FF] hover:underline">← All Classes</button>
          )}
          {selectedSection && (
            <>
              <span className="text-gray-300">/</span>
              <button onClick={() => setSelectedSection(null)}
                className="text-sm text-[#89D4FF] hover:underline">{selectedClass}</button>
            </>
          )}
          <div className="ml-auto flex gap-3">
            {!selectedSection && (
              <button 
                onClick={() => navigate("/admin/teacher-timetable")}
                className="bg-indigo-50 text-indigo-600 text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-indigo-100 transition border border-indigo-100 flex items-center gap-2"
              >
                <Users size={16} /> Teacher-wise View
              </button>
            )}
            {selectedSection && (
              <button onClick={() => setShowAdd(true)}
                className="bg-[#89D4FF] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#6ac0f0] transition shadow-sm">
                + Add Timetable
              </button>
            )}
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-800">
          {!selectedClass && "Timetable"}
          {selectedClass && !selectedSection && selectedClass}
          {selectedSection && `${selectedClass} — Section ${selectedSection}`}
        </h1>

        {/* STEP 1: Class Grid */}
        {!selectedClass && (
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
            {CLASSES.map((cls) => (
              <div key={cls} onClick={() => setSelectedClass(cls)}
                className="group cursor-pointer bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-6 text-center">
                <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-[#89D4FF]/15 flex items-center justify-center group-hover:bg-[#89D4FF]/30 transition">
                  <span className="text-[#89D4FF] font-bold text-sm">{cls}</span>
                </div>
                <p className="text-xs text-gray-400">View schedule</p>
              </div>
            ))}
          </div>
        )}

        {/* STEP 2: Section Grid */}
        {selectedClass && !selectedSection && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {SECTIONS.map((sec) => (
              <div key={sec} onClick={() => handleSelectSection(sec)}
                className="group cursor-pointer bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-8 text-center">
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-[#89D4FF]/15 flex items-center justify-center group-hover:bg-[#89D4FF]/30 transition">
                  <span className="text-[#89D4FF] font-bold text-2xl">{sec}</span>
                </div>
                <h3 className="font-semibold text-gray-700">Section {sec}</h3>
                <p className="text-xs text-gray-400 mt-1">View schedule</p>
              </div>
            ))}
          </div>
        )}

        {/* STEP 3: Timetable Grid + Students */}
        {selectedClass && selectedSection && (
          <div className="space-y-6">
            {/* Timetable Grid */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-700 flex items-center gap-2"><Calendar size={20} /> Weekly Timetable</h2>
                <p className="text-xs text-gray-400 mt-0.5">Class {selectedClass} — Section {selectedSection}</p>
              </div>

              {timetable.length === 0 ? (
                <div className="text-center py-14 text-gray-400">
                  <div className="flex justify-center mb-3"><Inbox className="w-12 h-12 text-gray-300" /></div>
                  <p className="text-sm">No timetable added yet.</p>
                  <button onClick={() => setShowAdd(true)} className="mt-4 text-sm text-[#89D4FF] underline">Add one now</button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] border-collapse text-sm">
                    <thead>
                      <tr>
                        <th className="bg-[#1e1e2e] text-white px-5 py-3 text-left text-xs font-semibold w-36 sticky left-0">🕐 Time</th>
                        {DAYS.map((day) => {
                          const isToday = new Date().toLocaleString("en-US", { weekday: "long" }) === day;
                          return (
                            <th key={day} className={`px-4 py-3 text-xs font-semibold border-l border-gray-700 text-center ${isToday ? "bg-[#89D4FF] text-white" : "bg-[#1e1e2e] text-gray-300"}`}>
                              {day.slice(0, 3)}{isToday && <span className="block text-[10px] font-normal opacity-80">Today</span>}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {timeSlots.map((slot, idx) => (
                        <tr key={slot} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                          <td className="px-5 py-3 sticky left-0 bg-inherit border-r border-gray-100 text-xs font-semibold text-gray-600">{slot}</td>
                          {DAYS.map((day) => {
                            const isToday = new Date().toLocaleString("en-US", { weekday: "long" }) === day;
                            const p = dayMap[day]?.find((x) => `${x.startTime} - ${x.endTime}` === slot);
                            return (
                              <td key={day} className="px-3 py-3 border-l border-gray-100 text-center">
                                {p ? (
                                  <div className={`rounded-xl px-2.5 py-2 text-left h-full flex flex-col justify-center ${
                                    p.subject === "Recess" 
                                    ? "bg-emerald-50 border border-emerald-100 items-center text-center" 
                                    : (isToday ? "bg-[#89D4FF]/15 border border-[#89D4FF]/40" : "bg-blue-50 border border-blue-100")
                                  }`}>
                                    <div>
                                      <p className={`text-xs font-bold ${
                                        p.subject === "Recess" ? "text-emerald-700 uppercase tracking-widest text-[10px]" : (isToday ? "text-[#1a8fc7]" : "text-blue-700")
                                      }`}>{p.subject}</p>
                                      {p.subject !== "Recess" && (
                                        <p className="text-[10px] text-gray-400 mt-0.5">{p.teacher?.name || "—"}</p>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-gray-200">—</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Students List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-gray-700 flex items-center gap-2"><Users size={20} /> Students</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{students.length} students in this class</p>
                </div>
              </div>

              {students.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">No students in this class-section.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">#</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Name</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Roll No</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Adm No</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Phone</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Status</th>
                        <th className="px-6 py-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((s, i) => (
                        <tr key={s._id} className="border-b border-gray-50 hover:bg-gray-50/60 transition">
                          <td className="px-6 py-3 text-xs text-gray-400">{i + 1}</td>
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-[#89D4FF]/20 flex items-center justify-center text-[#89D4FF] font-bold text-sm shrink-0">
                                {s.name?.charAt(0)}
                              </div>
                              <span className="font-semibold text-gray-700">{s.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-3 text-gray-500 text-xs">{s.rollNumber}</td>
                          <td className="px-6 py-3 text-gray-500 text-xs">{s.admissionNumber || "—"}</td>
                          <td className="px-6 py-3 text-gray-500 text-xs">{s.phone || "—"}</td>
                          <td className="px-6 py-3">
                            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${s.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                              {s.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-3">
                            <button onClick={() => setViewStudent(s)}
                              className="text-xs text-[#1a8fc7] font-semibold bg-[#89D4FF]/10 px-3 py-1.5 rounded-lg hover:bg-[#89D4FF]/20 transition">
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAdd && (
        <AddTimetableModal
          cls={selectedClass}
          section={selectedSection}
          teachers={teachers}
          onClose={() => setShowAdd(false)}
          onSave={() => { setShowAdd(false); fetchTimetable(selectedClass, selectedSection); }}
        />
      )}
      {viewStudent && <StudentDetailPopup student={viewStudent} onClose={() => setViewStudent(null)} />}
    </AdminSidebar>
  );
}
