import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminSidebar from "../../Layouts/AdminSidebar";
import { Calendar, Users, Search, ChevronRight, BookOpen, Clock } from "lucide-react";
import { API_BASE_URL } from "../../apiConfig";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function AdminTeacherTimetable() {
  const [teachers, setTeachers] = useState([]);
  const [allTimetables, setAllTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teachersRes, timetableRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/admin/teachers/all`),
          axios.get(`${API_BASE_URL}/timetable/all`)
        ]);
        setTeachers(teachersRes.data);
        setAllTimetables(timetableRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getTeacherTimetable = (teacherId) => {
    return allTimetables.map(entry => {
      const teacherPeriods = entry.periods.filter(p => 
        (p.teacher?._id === teacherId || p.teacher === teacherId) || p.subject === "Recess"
      );
      if (teacherPeriods.length > 0) {
        return {
          day: entry.day,
          class: entry.class,
          section: entry.section,
          periods: teacherPeriods
        };
      }
      return null;
    }).filter(Boolean);
  };

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.employeeId?.toLowerCase().includes(search.toLowerCase())
  );

  const buildDayMap = (timetable) => {
    const map = {};
    DAYS.forEach(d => map[d] = []);
    timetable.forEach(entry => {
      entry.periods.forEach(p => {
        map[entry.day].push({
          subject: p.subject,
          class: entry.class,
          section: entry.section,
          startTime: p.startTime,
          endTime: p.endTime
        });
      });
    });
    // Sort periods by start time
    Object.keys(map).forEach(day => {
      map[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
    return map;
  };

  const getAllTimeSlots = (dayMap) => {
    const slots = new Set();
    Object.values(dayMap).forEach(dayPeriods => {
      dayPeriods.forEach(p => slots.add(`${p.startTime} - ${p.endTime}`));
    });
    return Array.from(slots).sort();
  };

  return (
    <AdminSidebar>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="text-[#89D4FF]" /> Teacher-wise Weekly Timetable
            </h1>
            <p className="text-sm text-gray-400 mt-1">View and manage weekly schedules for all faculties</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Teacher List */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search faculty..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#89D4FF] transition"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <div key={i} className="h-16 bg-gray-50 animate-pulse rounded-xl" />
                  ))
                ) : filteredTeachers.length === 0 ? (
                  <p className="text-center py-10 text-gray-400 text-sm">No teachers found</p>
                ) : (
                  filteredTeachers.map(teacher => (
                    <div
                      key={teacher._id}
                      onClick={() => setSelectedTeacher(teacher)}
                      className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition ${
                        selectedTeacher?._id === teacher._id 
                          ? "bg-[#89D4FF] text-white shadow-md shadow-blue-100" 
                          : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                          selectedTeacher?._id === teacher._id ? "bg-white/20" : "bg-white text-[#89D4FF]"
                        }`}>
                          {teacher.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold truncate max-w-[150px]">{teacher.name}</p>
                          <p className={`text-[10px] ${selectedTeacher?._id === teacher._id ? "text-white/80" : "text-gray-400"}`}>
                            ID: {teacher.employeeId}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${selectedTeacher?._id === teacher._id ? "text-white" : "text-gray-300"}`} />
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Quick Stats */}
            {selectedTeacher && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
                <h3 className="text-sm font-bold text-gray-800">Summary</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                    <p className="text-[10px] text-blue-500 font-semibold uppercase tracking-wider">Lectures</p>
                    <p className="text-xl font-bold text-blue-700">
                      {getTeacherTimetable(selectedTeacher._id).reduce((acc, curr) => acc + curr.periods.length, 0)}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-xl border border-purple-100">
                    <p className="text-[10px] text-purple-500 font-semibold uppercase tracking-wider">Days</p>
                    <p className="text-xl font-bold text-purple-700">
                      {new Set(getTeacherTimetable(selectedTeacher._id).map(t => t.day)).size}/6
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Weekly Grid */}
          <div className="lg:col-span-8">
            {!selectedTeacher ? (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm h-full min-h-[500px] flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-10 h-10 text-[#89D4FF]" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Select a Teacher</h2>
                <p className="text-sm text-gray-400 mt-2 max-w-xs">
                  Choose a faculty from the left panel to view their complete weekly lecture schedule.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="px-6 py-5 border-b border-gray-100 bg-[#1e1e2e]">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#89D4FF] flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
                      {selectedTeacher.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">{selectedTeacher.name}</h2>
                      <p className="text-xs text-gray-400">Weekly Lecture Schedule • ID: {selectedTeacher.employeeId}</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-x-auto p-6">
                  {getTeacherTimetable(selectedTeacher._id).length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                      <BookOpen className="w-12 h-12 mb-3 opacity-20" />
                      <p>No lectures assigned to this teacher yet.</p>
                    </div>
                  ) : (
                    <div className="min-w-[800px]">
                      <div className="grid grid-cols-7 gap-4 mb-4">
                        <div className="font-bold text-xs text-gray-400 uppercase tracking-widest pl-2">Time Slot</div>
                        {DAYS.map(day => (
                          <div key={day} className="font-bold text-xs text-gray-400 uppercase tracking-widest text-center">
                            {day.slice(0, 3)}
                          </div>
                        ))}
                      </div>

                      <div className="space-y-3">
                        {(() => {
                          const dayMap = buildDayMap(getTeacherTimetable(selectedTeacher._id));
                          const timeSlots = getAllTimeSlots(dayMap);
                          
                          return timeSlots.map(slot => (
                            <div key={slot} className="grid grid-cols-7 gap-4 items-stretch group">
                              <div className="flex items-center bg-gray-50 rounded-2xl px-3 py-3 border border-gray-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition">
                                <Clock className="w-3.5 h-3.5 text-gray-400 mr-2 group-hover:text-blue-500" />
                                <span className="text-[11px] font-bold text-gray-600 group-hover:text-blue-700">{slot}</span>
                              </div>
                              
                              {DAYS.map(day => {
                                const period = dayMap[day].find(p => `${p.startTime} - ${p.endTime}` === slot);
                                return (
                                  <div key={day} className="h-full">
                                    {period ? (
                                      <div className={`h-full p-3 rounded-2xl flex flex-col justify-center relative overflow-hidden group/card hover:shadow-lg transition-all duration-300 ${
                                        period.subject === "Recess" 
                                          ? "bg-emerald-50 border border-emerald-100 items-center text-center" 
                                          : "bg-blue-50 border border-blue-100 hover:shadow-blue-500/10"
                                      }`}>
                                        {period.subject !== "Recess" && (
                                          <div className="absolute top-0 right-0 w-12 h-12 bg-[#89D4FF]/10 rounded-bl-full -mr-4 -mt-4 group-hover/card:scale-150 transition-transform duration-500" />
                                        )}
                                        <p className={`text-xs font-black mb-0.5 relative z-10 ${
                                          period.subject === "Recess" ? "text-emerald-700 uppercase tracking-widest text-[10px]" : "text-blue-700"
                                        }`}>
                                          {period.subject}
                                        </p>
                                        {period.subject !== "Recess" && (
                                          <div className="flex items-center gap-1.5 opacity-70">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">
                                              {period.class} – {period.section}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="h-full rounded-2xl border border-dashed border-gray-100 flex items-center justify-center group-hover:border-gray-200 transition">
                                        <span className="text-[10px] font-medium text-gray-300 uppercase tracking-widest">Free</span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-[11px] text-gray-400">
                    <p>Total periods found: <span className="font-bold text-gray-600">{getTeacherTimetable(selectedTeacher._id).reduce((acc, curr) => acc + curr.periods.length, 0)}</span></p>
                    <p className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-400" /> Assigned Period
                        <span className="w-2 h-2 rounded-full bg-gray-200 ml-3" /> Free Slot
                    </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </AdminSidebar>
  );
}
