import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../Layouts/AdminSidebar";
import { Search, X, Users, Phone, Mail, MapPin, BookOpen, Calendar, BarChart3, UserCheck, GraduationCap, ChevronRight } from "lucide-react";
import { API_BASE_URL } from "../../apiConfig";

const CLASSES = ["Pre-Nursery","Nursery","KG","1st","2nd","3rd","4th","5th","6th","7th","8th","9th","10th","11th","12th"];
const SECTIONS = ["A","B","C","D"];

function StatBadge({ label, value, color }) {
  return (
    <div className={`rounded-xl p-3 text-center ${color}`}>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-[11px] font-medium mt-0.5">{label}</p>
    </div>
  );
}

function StudentDetailDrawer({ student, onClose }) {
  const [att, setAtt] = useState(null);
  const [loadingAtt, setLoadingAtt] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get(`${API_BASE_URL}/students/attendance/${student._id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => setAtt(r.data))
      .catch(() => setAtt({ total: 0, present: 0, absent: 0, leave: 0, percentage: 0, records: [] }))
      .finally(() => setLoadingAtt(false));
  }, [student._id]);

  const infoRow = (label, value, icon) => (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{label}</p>
        <p className="text-sm font-semibold text-gray-700 break-words">{value || "—"}</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-end z-50">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#89D4FF] to-indigo-400 px-6 py-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/25 flex items-center justify-center text-white font-bold text-2xl">
                {student.name?.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold">{student.name}</h2>
                <p className="text-blue-100 text-sm mt-0.5">Class {student.class} – Section {student.section}</p>
                <p className="text-blue-100 text-xs mt-0.5">Roll No: {student.rollNumber}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition">
              <X size={16} />
            </button>
          </div>
          {/* Status badge */}
          <div className="mt-4 flex items-center gap-2">
            <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${student.isActive !== false ? "bg-green-400/30 text-white" : "bg-red-400/30 text-white"}`}>
              {student.isActive !== false ? "● Active" : "● Inactive"}
            </span>
            {student.admissionNumber && (
              <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-white/20">
                Adm #{student.admissionNumber}
              </span>
            )}
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Student Info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
              <GraduationCap size={15} className="text-[#89D4FF]" />
              <h3 className="text-sm font-bold text-gray-700">Student Information</h3>
            </div>
            <div className="px-4 py-1">
              {infoRow("Email", student.email, <Mail size={13} className="text-gray-400" />)}
              {infoRow("Phone", student.phone, <Phone size={13} className="text-gray-400" />)}
              {infoRow("Address", student.address, <MapPin size={13} className="text-gray-400" />)}
              {infoRow("Class & Section", `${student.class} – ${student.section}`, <BookOpen size={13} className="text-gray-400" />)}
              {infoRow("Date Enrolled", student.createdAt ? new Date(student.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—", <Calendar size={13} className="text-gray-400" />)}
            </div>
          </div>

          {/* Parent Info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-indigo-50 border-b border-indigo-100 flex items-center gap-2">
              <Users size={15} className="text-indigo-500" />
              <h3 className="text-sm font-bold text-indigo-700">Parent / Guardian</h3>
            </div>
            {student.parent ? (
              <div className="px-4 py-1">
                {infoRow("Name", student.parent.name, <UserCheck size={13} className="text-indigo-400" />)}
                {infoRow("Phone", student.parent.phone, <Phone size={13} className="text-indigo-400" />)}
                {infoRow("Email", student.parent.email, <Mail size={13} className="text-indigo-400" />)}
                {infoRow("Occupation", student.parent.occupation, <BookOpen size={13} className="text-indigo-400" />)}
                {infoRow("Address", student.parent.address, <MapPin size={13} className="text-indigo-400" />)}
              </div>
            ) : (
              <div className="px-4 py-6 text-center text-gray-400 text-sm italic">
                No parent account linked to this student.
              </div>
            )}
          </div>

          {/* Attendance */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
              <BarChart3 size={15} className="text-green-500" />
              <h3 className="text-sm font-bold text-gray-700">Attendance (Last 30 days)</h3>
            </div>
            <div className="p-4">
              {loadingAtt ? (
                <div className="flex justify-center py-4">
                  <div className="w-6 h-6 border-2 border-[#89D4FF] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : att ? (
                <>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    <StatBadge label="Total" value={att.total} color="bg-gray-100 text-gray-700" />
                    <StatBadge label="Present" value={att.present} color="bg-green-50 text-green-700" />
                    <StatBadge label="Absent" value={att.absent} color="bg-red-50 text-red-600" />
                    <StatBadge label="Leave" value={att.leave} color="bg-yellow-50 text-yellow-700" />
                  </div>
                  <div className="bg-gray-100 rounded-full h-2.5 overflow-hidden mb-1">
                    <div className="h-full bg-green-400 rounded-full transition-all duration-700" style={{ width: `${att.percentage}%` }} />
                  </div>
                  <p className="text-xs text-gray-500 text-right font-semibold">{att.percentage}% attendance</p>
                </>
              ) : null}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function AdminStudents() {
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterSection, setFilterSection] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchStudents("");
    axios.get(`${API_BASE_URL}/students/total`).then(r => setTotal(r.data.total)).catch(() => {});
  }, []);

  const fetchStudents = async (q) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/students/search?query=${q}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(res.data || []);
    } catch {
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => fetchStudents(search);

  const filtered = students.filter(s => {
    const matchClass = !filterClass || s.class === filterClass;
    const matchSec = !filterSection || s.section === filterSection;
    return matchClass && matchSec;
  });

  return (
    <AdminSidebar>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Students Directory</h1>
            <p className="text-sm text-gray-400 mt-0.5">Search, view, and manage student profiles with parent details</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Total Enrolled</p>
            <h2 className="text-3xl font-bold text-[#89D4FF] leading-none">{total}</h2>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
            <input
              placeholder="Search by name, roll number, admission no..."
              className="w-full pl-11 pr-10 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#89D4FF]/40 focus:outline-none"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
            />
            {search && (
              <button onClick={() => { setSearch(""); fetchStudents(""); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-400">
                <X size={15} />
              </button>
            )}
          </div>

          <select value={filterClass} onChange={e => setFilterClass(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:border-[#89D4FF] bg-gray-50">
            <option value="">All Classes</option>
            {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select value={filterSection} onChange={e => setFilterSection(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:border-[#89D4FF] bg-gray-50">
            <option value="">All Sections</option>
            {SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
          </select>

          <button onClick={handleSearch}
            className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl text-sm transition">
            Search
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <h2 className="font-bold text-gray-700 text-sm">
              {search ? "Search Results" : "All Students"}
            </h2>
            <span className="text-xs text-gray-400">{filtered.length} record(s)</span>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="w-8 h-8 border-4 border-[#89D4FF] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Users size={44} className="mx-auto text-gray-200 mb-3" strokeWidth={1} />
              <p className="text-sm">No students found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white border-b border-gray-100 text-gray-400">
                    <th className="text-left px-5 py-3.5 font-semibold text-xs tracking-wider">STUDENT</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-xs tracking-wider">CLASS</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-xs tracking-wider">ROLL / ADM NO</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-xs tracking-wider">PARENT</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-xs tracking-wider">STATUS</th>
                    <th className="px-5 py-3.5" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(s => (
                    <tr key={s._id} className="border-b border-gray-50 hover:bg-gray-50/60 transition cursor-pointer" onClick={() => setSelected(s)}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#89D4FF]/20 flex items-center justify-center text-[#89D4FF] font-bold text-sm shrink-0">
                            {s.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-700">{s.name}</p>
                            <p className="text-[11px] text-gray-400">{s.email || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-xs font-semibold">
                          {s.class} — {s.section}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs">
                        <p>Roll: <span className="font-semibold text-gray-700">{s.rollNumber}</span></p>
                        <p>Adm: {s.admissionNumber || "—"}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        {s.parent ? (
                          <div>
                            <p className="font-semibold text-gray-700 text-xs">{s.parent.name}</p>
                            <p className="text-[11px] text-gray-400">{s.parent.phone}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Not linked</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${s.isActive !== false ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                          {s.isActive !== false ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button className="text-[#89D4FF] hover:text-indigo-600 transition">
                          <ChevronRight size={18} />
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

      {/* Side Drawer */}
      {selected && <StudentDetailDrawer student={selected} onClose={() => setSelected(null)} />}
    </AdminSidebar>
  );
}
