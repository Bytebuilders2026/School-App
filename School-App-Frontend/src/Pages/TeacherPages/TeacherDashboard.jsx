import React, { useEffect, useState } from "react";
import axios from "axios";
import TeacherSidebar from "../../Layouts/TeacherSidebar";
import { AlertCircle, TrendingDown } from "lucide-react";

import { API_BASE_URL } from "../../apiConfig";

axios.defaults.baseURL = API_BASE_URL;

const TeacherDashboard = () => {
  const [data, setData] = useState(null);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("TOKEN:", token);

      const res = await axios.get("/teacher/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setData(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (!data) return <p className="p-6 font-bold text-gray-500">Loading AI insights...</p>;

  const { stats, timetable, recentAttendance, atRiskStudents = [], lowAttendanceStudents = [] } = data;

  return (
    <TeacherSidebar>
      <div className="space-y-6">
        
        {/* 🔥 STATS SCROLLABLE / GRID */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
          <Card title="Students" value={stats.totalStudents} color="text-blue-500" />
          <Card title="Classes" value={stats.totalClassesToday} color="text-indigo-500" />
          <Card title="Present" value={stats.present} color="text-green-500" />
          <Card title="Marked" value={stats.totalMarked} color="text-purple-500" />
          <div className="col-span-2 md:col-span-1">
             <Card title="Pending HW" value={stats.pendingHomework} color="text-orange-500" />
          </div>
        </div>

        {/* 🔥 MAIN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* 📅 TIMETABLE */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-700 mb-4">Today's Timetable</h2>

            {timetable.length === 0 ? (
              <p className="text-sm text-gray-400">No classes assigned for today.</p>
            ) : (
              <div className="space-y-3">
                {timetable.map((t, i) => (
                  <div key={i} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-800 text-sm">{t.startTime}</span>
                      <span className="text-[10px] text-gray-400 font-semibold">{t.endTime}</span>
                    </div>
                    <div className="flex-1 text-right">
                      <span className="font-bold text-[#21a8f3] text-sm block">{t.subject}</span>
                      <span className="text-[11px] text-gray-500 font-semibold bg-white border px-2 py-0.5 rounded-full inline-block mt-1">
                        Class {t.class} – {t.section}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 🧑‍🎓 ATTENDANCE */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-700 mb-4">Recent Attendance</h2>

            {recentAttendance.length === 0 ? (
               <p className="text-sm text-gray-400">No recent activity.</p>
            ) : (
              <div className="space-y-2">
                {recentAttendance.map((a) => (
                  <div key={a._id} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                    <span className="font-semibold text-gray-700 text-sm">{a.student?.name}</span>
                    <span className={`text-[11px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
                        a.status === "present" ? "bg-green-100 text-green-600" : 
                        a.status === "absent" ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-600"
                    }`}>
                      {a.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* 🔥 HACKATHON ADDITIONS: AI PERFORMANCE RISK PANEL */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* AT-RISK STUDENTS */}
          <div className="bg-red-50 p-5 rounded-2xl shadow-sm border border-red-100 flex flex-col">
            <h2 className="font-bold text-red-700 mb-4 flex items-center gap-2">
              <AlertCircle size={18} /> High & Medium Risk Students
            </h2>

            {atRiskStudents.length === 0 ? (
               <p className="text-sm text-red-400">All assigned students are performing well.</p>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[250px]">
                {atRiskStudents.map((st, i) => (
                  <div key={i} className="flex flex-col bg-white p-3 rounded-xl border border-red-100">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-gray-800 text-sm">{st.name} <span className="text-[10px] text-gray-400 font-normal">({st.rollNumber})</span></span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${st.risk === "HIGH" ? "bg-red-500 text-white" : "bg-orange-500 text-white"}`}>
                        {st.risk} RISK
                      </span>
                    </div>
                    <div className="flex text-xs text-gray-500 font-semibold mt-2 gap-3">
                      <span>Att: {st.attendance}%</span>
                      <span>Avg Marks: {st.avgMarks}%</span>
                      <span>Class {st.class}-{st.section}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* LOW ATTENDANCE STUDENTS */}
          <div className="bg-orange-50 p-5 rounded-2xl shadow-sm border border-orange-100 flex flex-col">
            <h2 className="font-bold text-orange-700 mb-4 flex items-center gap-2">
              <TrendingDown size={18} /> Low Attendance Alert (&lt; 75%)
            </h2>

            {lowAttendanceStudents.length === 0 ? (
               <p className="text-sm text-orange-400">No students fall under critical attendance threshold.</p>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[250px]">
                {lowAttendanceStudents.map((st, i) => (
                  <div key={i} className="flex justify-between items-center bg-white p-3 rounded-xl border border-orange-100">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-800 text-sm">{st.name}</span>
                      <span className="text-[10px] text-gray-400 font-semibold">Class {st.class}-{st.section} | Roll: {st.rollNumber}</span>
                    </div>
                    <span className="text-sm text-red-500 font-black">{st.attendance}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </TeacherSidebar>
  );
};

const Card = ({ title, value, color }) => (
  <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-50 flex flex-col justify-center items-center text-center">
    <h2 className={`text-2xl md:text-3xl font-black ${color}`}>{value}</h2>
    <p className="text-[11px] md:text-xs font-semibold text-gray-400 uppercase tracking-widest mt-1">{title}</p>
  </div>
);

export default TeacherDashboard;
