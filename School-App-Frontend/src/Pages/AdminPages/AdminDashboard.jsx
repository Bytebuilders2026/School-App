import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../Layouts/AdminSidebar";
import { Users, GraduationCap, CheckCircle, XCircle, UserPlus, Calendar, ClipboardCheck } from "lucide-react";

import { API_BASE_URL } from "../../apiConfig";

const API = API_BASE_URL;

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color, bg }) {
  return (
    <div className={`${bg} rounded-2xl p-5 border ${color} flex items-center gap-4`}>
      <div className="text-4xl">{icon}</div>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-3xl font-bold text-gray-800 mt-0.5">{value ?? "—"}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Attendance Progress Bar ──────────────────────────────────────────────────
function AttendanceBar({ label, percent, color }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium text-gray-600">{label}</span>
        <span className="text-xs font-bold text-gray-700">{percent}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-700`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [perfData, setPerfData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    // Fetch attendance data
    axios.get(`${API}/attendance/admin/dashboard`, { headers })
      .then(res => setData(res.data.data))
      .catch(err => console.error("Attendance fetch error:", err));

    // Fetch performance/risk data
    axios.get(`${API}/performance/admin/stats`, { headers })
      .then(res => setPerfData(res.data.data))
      .catch(err => console.error("Performance fetch error:", err));

    // Stop loading after a short delay to allow both calls to resolve
    setTimeout(() => setLoading(false), 1500);
  }, []);

  const todayName = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  if (loading) {
    return (
      <AdminSidebar>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#89D4FF] border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Loading dashboard...</p>
          </div>
        </div>
      </AdminSidebar>
    );
  }

  return (
    <AdminSidebar>
      <div className="space-y-6">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-sm text-gray-400 mt-0.5">{todayName}</p>
          </div>
          <div className="bg-[#89D4FF]/10 border border-[#89D4FF]/30 text-[#1a8fc7] text-sm font-semibold px-4 py-2 rounded-xl">
           Admin Panel
          </div>
        </div>

        {/* ── Stat Cards Row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Students" value={data?.totalStudents}
            sub="Active students" bg="bg-blue-50" color="border-blue-100"
            icon={<Users className="text-blue-500" size={32} />}
          />
          <StatCard
           label="Total Teachers" value={data?.totalTeachers}
            sub="Active staff" bg="bg-indigo-50" color="border-indigo-100"
            icon={<GraduationCap className="text-indigo-500" size={32} />}
          />
          <StatCard
             label="Present Today" value={data?.presentToday}
            sub={`${data?.attendancePercent}% attendance`} bg="bg-green-50" color="border-green-100"
            icon={<CheckCircle className="text-green-500" size={32} />}
          />
          <StatCard
             label="Alerts & Risk" value={perfData?.highRiskCount}
            sub="High Risk Students" bg="bg-red-50" color="border-red-100"
            icon={<XCircle className="text-red-500" size={32} />}
          />
        </div>

        {/* ── Middle Row: Performance Analytics ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
           {/* Class-wise Performance Trends */}
           <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-hidden">
             <h2 className="font-bold text-gray-700 text-sm mb-4 flex items-center gap-2"><GraduationCap className="text-[#89D4FF]" size={18}/> Class Performance Grades</h2>
             <div className="space-y-4 max-h-60 overflow-y-auto">
               {perfData?.classWisePerformance.map((c, i) => (
                  <div key={i} className="flex justify-between items-center bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                     <span className="font-bold text-gray-700">Class {c.class}</span>
                     <div className="flex gap-4 items-center text-sm">
                        <span className="font-bold text-[#89D4FF]">Avg: {c.avgScore}%</span>
                        <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${c.highRisk > 0 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                           {c.highRisk} at Risk
                        </span>
                     </div>
                  </div>
               ))}
             </div>
           </div>

           {/* Recent Performance Alerts */}
           <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-hidden">
             <h2 className="font-bold text-gray-700 text-sm mb-4 flex items-center gap-2"><ClipboardCheck className="text-[#89D4FF]" size={18}/> Intelligent Alerts</h2>
             <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
               {perfData?.recentAlerts?.length > 0 ? perfData.recentAlerts.map((alert) => (
                  <div key={alert._id} className="flex items-start gap-3 bg-red-50/50 p-3 rounded-xl border border-red-100">
                     <div className="mt-1 w-2 h-2 rounded-full bg-red-500 shrink-0"></div>
                     <div>
                        <p className="text-xs font-bold text-gray-800">{alert.title}</p>
                        <p className="text-[10px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">{alert.message}</p>
                     </div>
                  </div>
               )) : <p className="text-gray-400 text-sm text-center py-8 hover:opacity-100 opacity-60">No recent risk alerts.</p>}
             </div>
           </div>
        </div>

        {/* ── Middle Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Attendance Overview */}
          <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <h2 className="font-bold text-gray-700 text-sm">Today's Attendance Overview</h2>
            <div className="flex items-center justify-center py-4">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#f0f0f0" strokeWidth="12" />
                  <circle
                    cx="60" cy="60" r="50" fill="none" stroke="#89D4FF" strokeWidth="12"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - (data?.attendancePercent || 0) / 100)}`}
                    strokeLinecap="round" className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-2xl font-bold text-gray-800">{data?.attendancePercent}%</p>
                  <p className="text-[10px] text-gray-400">Present</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <AttendanceBar label="Present" percent={data?.attendancePercent || 0} color="bg-green-400" />
              <AttendanceBar
                label="Absent"
                percent={data?.totalStudents > 0 ? ((data?.absentToday / data?.totalStudents) * 100).toFixed(1) : 0}
                color="bg-red-400"
              />
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
              {[
                { l: "Present", v: data?.presentToday, c: "text-green-600" },
                { l: "Absent", v: data?.absentToday, c: "text-red-500" },
                { l: "Unmarked", v: (data?.totalStudents - data?.totalMarkedToday), c: "text-gray-400" },
              ].map((s) => (
                <div key={s.l} className="text-center">
                  <p className={`text-lg font-bold ${s.c}`}>{s.v ?? 0}</p>
                  <p className="text-[10px] text-gray-400">{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Class-wise Attendance */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-700 text-sm mb-4">Class-wise Attendance Today</h2>
            {!data?.classWise?.length ? (
              <div className="flex items-center justify-center h-40 text-gray-400 text-sm">No attendance marked today</div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {data.classWise.map((c) => {
                  const pct = c.total > 0 ? Math.round((c.present / c.total) * 100) : 0;
                  return (
                    <div key={`${c._id.class}-${c._id.section}`} className="flex items-center gap-4">
                      <div className="w-20 shrink-0">
                        <span className="text-xs font-bold text-gray-600">
                          {c._id.class} – {c._id.section}
                        </span>
                      </div>
                      <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${pct >= 75 ? "bg-green-400" : pct >= 50 ? "bg-yellow-400" : "bg-red-400"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-gray-700 w-10 text-right">{pct}%</span>
                      <span className="text-[11px] text-gray-400 w-16 text-right">{c.present}/{c.total}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Bottom Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Recent Students */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-700 text-sm">Recent Students</h2>
              <span className="text-xs text-gray-400">Last 5 added</span>
            </div>
            {!data?.recentStudents?.length ? (
              <p className="text-sm text-gray-400 text-center py-8">No students yet</p>
            ) : (
              <div className="space-y-3">
                {data.recentStudents.map((s) => (
                  <div key={s._id} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-blue-600 text-sm shrink-0">
                      {s.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-700 truncate">{s.name}</p>
                      <p className="text-[11px] text-gray-400">Class {s.class} – {s.section} · Roll {s.rollNumber}</p>
                    </div>
                    <span className="text-[10px] text-gray-300 shrink-0">
                      {new Date(s.createdAt).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Teachers */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-700 text-sm">Recent Teachers</h2>
              <span className="text-xs text-gray-400">Last 5 added</span>
            </div>
            {!data?.recentTeachers?.length ? (
              <p className="text-sm text-gray-400 text-center py-8">No teachers yet</p>
            ) : (
              <div className="space-y-3">
                {data.recentTeachers.map((t) => (
                  <div key={t._id} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-sm shrink-0">
                      {t.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-700 truncate">{t.name}</p>
                      <p className="text-[11px] text-gray-400 truncate">
                        ID: {t.employeeId} · {t.subjects?.slice(0, 2).join(", ") || "—"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Quick Links ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-700 text-sm mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
            {[
              { label: "Add Student", path: "/admin/admissions", color: "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-100", icon: <UserPlus size={28} /> },
              { label: "Add Teacher", path: "/admin/teachers", color: "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-100", icon: <GraduationCap size={28} /> },
              { label: "View Timetable",  path: "/admin/timetable", color: "bg-sky-50 hover:bg-sky-100 text-sky-700 border-sky-100", icon: <Calendar size={28} /> },
              { label: "Attendance", path: "/admin/attendance", color: "bg-green-50 hover:bg-green-100 text-green-700 border-green-100", icon: <ClipboardCheck size={28} /> },
            ].map((q) => (
              <a
                key={q.label}
                href={q.path}
                className={`${q.color} border rounded-xl p-4 flex flex-col items-center gap-2 text-center transition cursor-pointer`}
              >
                <div>{q.icon}</div>
                <span className="text-xs font-semibold">{q.label}</span>
              </a>
            ))}
          </div>
        </div>

      </div>
    </AdminSidebar>
  );
}
