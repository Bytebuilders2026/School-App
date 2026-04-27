import React, { useEffect, useState } from "react";
import axios from "axios";
import StudentSidebar from "../../Layouts/StudentSidebar";
import { User, Activity, BookOpen, Clock } from "lucide-react";

import { API_BASE_URL } from "../../apiConfig";

import axiosInstance from "../../axiosInstance";

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await axiosInstance.get("/student/dashboard");
      setData(res.data);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <StudentSidebar>
      <div className="flex justify-center items-center h-[70vh]">
        <div className="w-10 h-10 border-4 border-[#8884d8] border-t-transparent rounded-full animate-spin" />
      </div>
    </StudentSidebar>
  );

  if (errorMsg || !data || !data.student) return (
    <StudentSidebar>
      <div className="flex justify-center items-center h-[70vh]">
        <div className="bg-red-50 text-red-500 p-6 rounded-2xl border border-red-100 text-center">
          <p className="font-bold text-lg mb-2">Error loading dashboard</p>
          <p className="text-sm">{errorMsg}</p>
        </div>
      </div>
    </StudentSidebar>
  );

  const { student, todayClasses, recentHomework } = data;

  return (
    <StudentSidebar>
      <div className="space-y-6">
        
        {/* 🔥 WELCOME BANNER */}
        <div className="bg-gradient-to-r from-[#8884d8] to-[#9b89ff] rounded-3xl p-6 md:p-8 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-black mb-1">Welcome back, {student.name}</h1>
            <p className="text-white/80 text-sm md:text-base font-medium">Class {student.class} - {student.section} | Roll No: {student.rollNumber}</p>
          </div>
          {/* Decorative shapes */}
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="absolute right-20 bottom-0 w-24 h-24 bg-white/10 rounded-full blur-xl -mb-10"></div>
        </div>

        {/* 🔥 STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card title="Attendance" value={`${student.attendancePercentage}%`} icon={<Activity size={24} />} color="text-green-500" />
          <Card title="Classes Today" value={todayClasses.length} icon={<Clock size={24} />} color="text-indigo-500" />
          <div className="col-span-2 md:col-span-2">
            <Card title="New Homework" value={recentHomework.length} icon={<BookOpen size={24} />} color="text-orange-500" />
          </div>
        </div>

        {/* 🔥 MAIN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* 📅 TIMETABLE */}
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-700 text-lg">Today's Classes</h2>
              <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full">{new Date().toLocaleString("en-US", { weekday: "short" })}</span>
            </div>

            {todayClasses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-400 font-medium">No classes today. Enjoy your day! 🎉</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayClasses.map((t, i) => (
                  <div key={i} className="flex gap-4 items-center bg-gray-50/80 p-3.5 rounded-2xl border border-gray-50 transition hover:border-[#8884d8]/30">
                    <div className="flex flex-col min-w-[70px] text-center border-r border-gray-200 pr-3">
                      <span className="font-black text-gray-800 text-sm hidden md:block">{t.startTime}</span>
                      <span className="font-black text-gray-800 text-xs md:hidden">{t.startTime.replace(':00', '')}</span>
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider hidden md:block">{t.endTime}</span>
                    </div>
                    <div className="flex-1">
                      <span className="font-bold text-[#7169c9] text-base block">{t.subject}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 📚 RECENT HOMEWORK */}
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-700 text-lg mb-5">Recent Assignment</h2>

            {recentHomework.length === 0 ? (
               <div className="text-center py-8">
                 <p className="text-sm text-gray-400 font-medium">No homework assigned yet.</p>
               </div>
            ) : (
              <div className="space-y-3">
                {recentHomework.slice(0,3).map((hw) => (
                  <div key={hw._id} className="flex flex-col bg-[#8884d8]/5 border border-[#8884d8]/20 p-4 rounded-2xl">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-gray-800 text-sm md:text-base line-clamp-1">{hw.title}</h3>
                      <span className="text-[10px] font-bold bg-[#8884d8] text-white px-2 py-0.5 rounded-md">{hw.subject}</span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium line-clamp-1 mt-1 mb-3">{hw.description || "No description."}</p>
                    <div className="flex justify-between items-center mt-auto border-t border-[#8884d8]/10 pt-2">
                       <span className="text-[10px] text-gray-400 font-semibold uppercase">Assigned: {new Date(hw.createdAt).toLocaleDateString()}</span>
                       <span className="text-[10px] text-red-500 font-bold uppercase">Due: {new Date(hw.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </StudentSidebar>
  );
};

const Card = ({ title, value, color, icon }) => (
  <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-50 flex items-center gap-4">
    <div className={`w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center ${color}`}>
      {icon}
    </div>
    <div>
      <h2 className={`text-2xl font-black ${color}`}>{value}</h2>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{title}</p>
    </div>
  </div>
);

export default StudentDashboard
