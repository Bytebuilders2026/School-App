import { useState, useEffect } from "react";
import axios from "axios";
import StudentSidebar from "../../Layouts/StudentSidebar";
import { BookOpen, Calendar, Inbox } from "lucide-react";

import { API_BASE_URL } from "../../apiConfig";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function StudentTimetable() {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/student/timetable`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTimetable(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Build a map: { "Monday": [ { period, subject, startTime, endTime } ] }
  const buildDayMap = () => {
    const map = {};
    DAYS.forEach((d) => (map[d] = []));

    timetable.forEach((entry) => {
      const day = entry.day;
      if (!map[day]) map[day] = [];
      entry.periods.forEach((p) => {
        map[day].push({
          subject: p.subject,
          startTime: p.startTime,
          endTime: p.endTime,
        });
      });
      map[day].sort((a, b) => (a.startTime > b.startTime ? 1 : -1));
    });
    return map;
  };

  const getAllTimeSlots = (dayMap) => {
    const slots = new Set();
    Object.values(dayMap).forEach((periods) =>
      periods.forEach((p) => slots.add(`${p.startTime} - ${p.endTime}`))
    );
    return Array.from(slots).sort();
  };

  if (loading) {
    return (
      <StudentSidebar>
        <div className="flex items-center justify-center h-[70vh]">
          <div className="w-10 h-10 border-4 border-[#8884d8] border-t-transparent rounded-full animate-spin" />
        </div>
      </StudentSidebar>
    );
  }

  const dayMap = buildDayMap();
  const timeSlots = getAllTimeSlots(dayMap);

  return (
    <StudentSidebar>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Class Timetable</h1>
            <p className="text-sm text-gray-400 mt-1">Your weekly lecture schedule</p>
          </div>
          <div className="bg-[#8884d8]/10 text-[#7169c9] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl">
            Weekly View
          </div>
        </div>

        {timetable.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center py-20 gap-4">
            <Inbox size={64} className="text-gray-300" strokeWidth={1} />
            <h2 className="text-xl font-semibold text-gray-700">No Timetable Available</h2>
            <p className="text-gray-400 text-sm">Your class schedule has not been assigned yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse">
                <thead>
                  <tr>
                    <th className="bg-gray-50 text-gray-600 border-b border-gray-100 text-sm font-semibold px-5 py-4 text-left w-40 sticky left-0 z-10">
                      Time Slot
                    </th>
                    {DAYS.map((day) => {
                      const isToday = new Date().toLocaleString("en-US", { weekday: "long" }) === day;
                      return (
                        <th
                          key={day}
                          className={`text-sm font-semibold px-5 py-4 text-center border-l border-b border-gray-100 ${
                            isToday ? "bg-[#8884d8] text-white" : "bg-gray-50 text-gray-600"
                          }`}
                        >
                          {day}
                          {isToday && (
                            <span className="block text-[10px] font-bold opacity-80 mt-0.5 uppercase tracking-wider">
                              Today
                            </span>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                <tbody>
                  {timeSlots.map((slot, rowIdx) => {
                    const [start, , end] = slot.split(" ");
                    return (
                      <tr key={slot} className="hover:bg-gray-50/50 transition border-b border-gray-100 last:border-0">
                        <td className="px-5 py-4 sticky left-0 bg-white z-10 border-r border-gray-100 align-middle">
                          <div className="flex flex-col justify-center">
                            <span className="text-sm font-bold text-gray-800">{start}</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase">{end}</span>
                          </div>
                        </td>

                        {DAYS.map((day) => {
                          const isToday = new Date().toLocaleString("en-US", { weekday: "long" }) === day;
                          const period = dayMap[day]?.find((p) => `${p.startTime} - ${p.endTime}` === slot);

                          return (
                            <td key={day} className="px-3 py-3 border-l border-gray-100 text-center align-middle">
                              {period ? (
                                <div className={`rounded-2xl px-3 py-3 text-center ${isToday ? "bg-[#8884d8]/10" : "bg-gray-50"}`}>
                                  <p className={`text-sm font-bold ${isToday ? "text-[#7169c9]" : "text-gray-700"}`}>
                                    {period.subject}
                                  </p>
                                </div>
                              ) : (
                                <span className="text-gray-200 text-lg">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </StudentSidebar>
  );
}
