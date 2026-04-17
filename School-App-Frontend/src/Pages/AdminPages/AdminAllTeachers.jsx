import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../Layouts/AdminSidebar";

import { API_BASE_URL } from "../../apiConfig";

const baseUrl = API_BASE_URL;
axios.defaults.baseURL = baseUrl;

const API = `${API_BASE_URL}/admin/teachers`;
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// ─── Helper: build day→periods map from timetable array ─────────────────────
function buildDayMap(timetable) {
  const map = {};
  DAYS.forEach((d) => (map[d] = []));
  timetable.forEach((entry) => {
    const d = entry.day;
    if (!map[d]) map[d] = [];
    entry.periods.forEach((p) =>
      map[d].push({ subject: p.subject, class: entry.class, section: entry.section, startTime: p.startTime, endTime: p.endTime })
    );
    map[d].sort((a, b) => (a.startTime > b.startTime ? 1 : -1));
  });
  return map;
}

function getAllTimeSlots(dayMap) {
  const slots = new Set();
  Object.values(dayMap).forEach((ps) => ps.forEach((p) => slots.add(`${p.startTime} - ${p.endTime}`)));
  return Array.from(slots).sort();
}

// ─── Teacher Detail Popup ────────────────────────────────────────────────────
function TeacherDetailPopup({ teacher, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/detail/${teacher._id}`).then((r) => {
      setDetail(r.data);
      setLoading(false);
    });
  }, [teacher._id]);

  const dayMap = detail ? buildDayMap(detail.timetable) : {};
  const timeSlots = detail ? getAllTimeSlots(dayMap) : [];
  const activeDays = DAYS.filter((d) => dayMap[d]?.length > 0);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{teacher.name}</h2>
            <p className="text-sm text-gray-400">Emp ID: {teacher.employeeId}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 text-xl transition">✕</button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#89D4FF] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="p-8 space-y-8">
            {/* Basic Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: "Email", value: detail.teacher.user?.email || "—" },
                { label: "Phone", value: detail.teacher.phone || "—" },
                { label: "Qualification", value: detail.teacher.qualification || "—" },
                { label: "Experience", value: detail.teacher.experience ? `${detail.teacher.experience} yrs` : "—" },
                { label: "Status", value: detail.teacher.isActive ? "Active" : "Inactive" },
                { label: "Subjects", value: detail.teacher.subjects?.join(", ") || "—" },
              ].map((item) => (
                <div key={item.label} className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                  <p className="text-sm font-semibold text-gray-700">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{detail.timetable.reduce((a, e) => a + e.periods.length, 0)}</p>
                <p className="text-xs text-blue-500 mt-1">Total Lectures / Week</p>
              </div>
              <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-sky-600">{activeDays.length}</p>
                <p className="text-xs text-sky-500 mt-1">Working Days</p>
              </div>
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-indigo-600">
                  {DAYS.length - activeDays.length}
                </p>
                <p className="text-xs text-indigo-500 mt-1">Free Days</p>
              </div>
            </div>

            {/* Weekly Timetable Grid */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">📅 Weekly Timetable</h3>
              {detail.timetable.length === 0 ? (
                <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-xl">No timetable assigned yet.</div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table className="w-full min-w-[700px] border-collapse text-sm">
                    <thead>
                      <tr>
                        <th className="bg-[#1e1e2e] text-white px-4 py-3 text-left text-xs font-semibold w-32 sticky left-0">🕐 Time</th>
                        {DAYS.map((day) => (
                          <th key={day} className="bg-[#1e1e2e] text-gray-300 px-4 py-3 text-center text-xs font-semibold border-l border-gray-700">
                            {day.slice(0, 3)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {timeSlots.map((slot, idx) => (
                        <tr key={slot} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                          <td className="px-4 py-3 sticky left-0 bg-inherit border-r border-gray-100 text-xs font-medium text-gray-600">{slot}</td>
                          {DAYS.map((day) => {
                            const p = dayMap[day]?.find((x) => `${x.startTime} - ${x.endTime}` === slot);
                            return (
                              <td key={day} className="px-3 py-3 border-l border-gray-100 text-center">
                                {p ? (
                                  <div className="bg-blue-50 border border-blue-100 rounded-lg px-2 py-1.5 text-left">
                                    <p className="text-xs font-bold text-blue-700">{p.subject}</p>
                                    <p className="text-[10px] text-gray-400">{p.class} – {p.section}</p>
                                  </div>
                                ) : (
                                  <span className="text-xs text-green-400 font-medium">Free</span>
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
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Edit Teacher Popup ──────────────────────────────────────────────────────
function EditTeacherPopup({ teacher, onClose, onSave }) {
  const [form, setForm] = useState({
    name: teacher.name || "",
    phone: teacher.phone || "",
    qualification: teacher.qualification || "",
    experience: teacher.experience || "",
    subjects: teacher.subjects?.join(", ") || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/update/${teacher._id}`, {
        ...form,
        subjects: form.subjects.split(",").map((s) => s.trim()).filter(Boolean),
      });
      onSave();
    } catch (err) {
      alert(err.response?.data?.error || "Update failed");
    }
    setSaving(false);
  };

  const fields = [
    { key: "name", label: "Full Name", type: "text" },
    { key: "phone", label: "Phone", type: "text" },
    { key: "qualification", label: "Qualification", type: "text" },
    { key: "experience", label: "Experience (years)", type: "number" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Edit Teacher</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 text-xl transition">✕</button>
        </div>
        <div className="p-6 space-y-4">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">{f.label}</label>
              <input
                type={f.type}
                value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#89D4FF] transition"
              />
            </div>
          ))}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Subjects (comma separated)</label>
            <input
              type="text"
              value={form.subjects}
              onChange={(e) => setForm({ ...form, subjects: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#89D4FF] transition"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-5 py-2 text-sm border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-5 py-2 text-sm bg-[#89D4FF] text-white rounded-xl hover:bg-[#6ac0f0] transition disabled:opacity-50">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Add Teacher Popup ───────────────────────────────────────────────────────
function AddTeacherPopup({ onClose, onAdd }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", employeeId: "", phone: "", qualification: "", experience: "", subjects: "" });
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    setSaving(true);
    try {
      await axios.post(`${API}/create`, {
        ...form,
        subjects: form.subjects.split(",").map((s) => s.trim()).filter(Boolean),
      });
      onAdd();
    } catch (err) {
      alert(err.response?.data?.error || "Error adding teacher");
    }
    setSaving(false);
  };

  const fields = [
    { key: "name", label: "Full Name", type: "text" },
    { key: "email", label: "Email", type: "email" },
    { key: "password", label: "Password", type: "password" },
    { key: "employeeId", label: "Employee ID", type: "text" },
    { key: "phone", label: "Phone", type: "text" },
    { key: "qualification", label: "Qualification", type: "text" },
    { key: "experience", label: "Experience (years)", type: "number" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-gray-800">Add New Teacher</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 text-xl transition">✕</button>
        </div>
        <div className="p-6 space-y-4">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">{f.label}</label>
              <input
                type={f.type}
                value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#89D4FF] transition"
              />
            </div>
          ))}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Subjects (comma separated)</label>
            <input
              type="text"
              value={form.subjects}
              onChange={(e) => setForm({ ...form, subjects: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#89D4FF] transition"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-5 py-2 text-sm border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition">Cancel</button>
          <button onClick={handleAdd} disabled={saving} className="px-5 py-2 text-sm bg-[#89D4FF] text-white rounded-xl hover:bg-[#6ac0f0] transition disabled:opacity-50">
            {saving ? "Adding..." : "Add Teacher"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function AdminAllTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewTeacher, setViewTeacher] = useState(null);
  const [editTeacher, setEditTeacher] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchTeachers = () => {
    setLoading(true);
    axios.get(`${API}/all`).then((r) => { setTeachers(r.data); setLoading(false); });
  };

  useEffect(() => { fetchTeachers(); }, []);

  const handleDelete = async (id) => {
    await axios.delete(`${API}/delete/${id}`);
    setDeleteConfirm(null);
    fetchTeachers();
  };

  const filtered = teachers.filter((t) =>
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.employeeId?.toLowerCase().includes(search.toLowerCase()) ||
    t.subjects?.some((s) => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AdminSidebar>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Teachers</h1>
            <p className="text-sm text-gray-400 mt-0.5">{teachers.length} teachers registered</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-[#89D4FF] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#6ac0f0] transition shadow-sm"
          >
            + New Teacher
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, Emp ID or subject..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#89D4FF] transition shadow-sm"
          />
        </div>

        {/* Teacher Cards Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#89D4FF] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400 bg-white rounded-2xl">No teachers found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((t) => (
              <div key={t._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition p-5">
                {/* Card Top */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#89D4FF]/20 flex items-center justify-center text-[#89D4FF] font-bold text-lg shrink-0">
                    {t.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 truncate">{t.name}</h3>
                    <p className="text-xs text-gray-400">ID: {t.employeeId}</p>
                    <p className="text-xs text-gray-400 truncate">{t.user?.email}</p>
                  </div>
                </div>

                {/* Subjects */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {t.subjects?.slice(0, 3).map((s) => (
                    <span key={s} className="text-[11px] bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                  {t.subjects?.length > 3 && (
                    <span className="text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">+{t.subjects.length - 3}</span>
                  )}
                </div>

                {/* Info Row */}
                <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-gray-500">
                  <span>📞 {t.phone || "—"}</span>
                  <span>🎓 {t.qualification || "—"}</span>
                  <span>⏳ {t.experience ? `${t.experience} yrs` : "—"}</span>
                  <span className={`font-medium ${t.isActive ? "text-green-500" : "text-red-400"}`}>
                    ● {t.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => setViewTeacher(t)}
                    className="flex-1 py-2 text-xs font-semibold bg-[#89D4FF]/10 text-[#1a8fc7] rounded-xl hover:bg-[#89D4FF]/20 transition"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => setEditTeacher(t)}
                    className="flex-1 py-2 text-xs font-semibold bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(t)}
                    className="py-2 px-3 text-xs font-semibold bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Popups */}
      {viewTeacher && <TeacherDetailPopup teacher={viewTeacher} onClose={() => setViewTeacher(null)} />}
      {editTeacher && (
        <EditTeacherPopup
          teacher={editTeacher}
          onClose={() => setEditTeacher(null)}
          onSave={() => { setEditTeacher(null); fetchTeachers(); }}
        />
      )}
      {showAdd && (
        <AddTeacherPopup
          onClose={() => setShowAdd(false)}
          onAdd={() => { setShowAdd(false); fetchTeachers(); }}
        />
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-96 shadow-2xl text-center">
            <div className="text-5xl mb-4">🗑️</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Teacher?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm._id)} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition">Delete</button>
            </div>
          </div>
        </div>
      )}
    </AdminSidebar>
  );
}
