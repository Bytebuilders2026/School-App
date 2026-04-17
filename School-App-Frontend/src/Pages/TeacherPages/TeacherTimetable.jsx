import { useState, useEffect } from "react";
import axios from "axios";
import TeacherSidebar from "../../Layouts/TeacherSidebar";
import { BookOpen, Calendar, CalendarClock, Inbox } from "lucide-react";
import { API_BASE_URL } from "../../apiConfig";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function TeacherTimetable() {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`${API_BASE_URL}/teacher/timetable`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTimetable(res.data.timetable || []);
    } catch (err) {
      setError("Failed to load timetable.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Build a map: { "Monday": [ { period, class, section, subject, startTime, endTime } ] }
  const buildDayMap = () => {
    const map = {};
    DAYS.forEach((d) => (map[d] = []));

    timetable.forEach((entry) => {
      const day = entry.day;
      if (!map[day]) map[day] = [];
      entry.periods.forEach((p) => {
        map[day].push({
          subject: p.subject,
          class: entry.class,
          section: entry.section,
          startTime: p.startTime,
          endTime: p.endTime,
        });
      });
      // Sort by startTime within each day
      map[day].sort((a, b) => (a.startTime > b.startTime ? 1 : -1));
    });

    return map;
  };

  // Collect all unique time slots across all days
  const getAllTimeSlots = (dayMap) => {
    const slots = new Set();
    Object.values(dayMap).forEach((periods) =>
      periods.forEach((p) => slots.add(`${p.startTime} - ${p.endTime}`))
    );
    return Array.from(slots).sort();
  };

  if (loading) {
    return (
      <TeacherSidebar>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#89D4FF] border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">Loading timetable...</p>
          </div>
        </div>
      </TeacherSidebar>
    );
  }

  if (error) {
    return (
      <TeacherSidebar>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">{error}</p>
        </div>
      </TeacherSidebar>
    );
  }

  const dayMap = buildDayMap();
  const timeSlots = getAllTimeSlots(dayMap);

  return (
    <TeacherSidebar>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Timetable</h1>
            <p className="text-sm text-gray-400 mt-1">Your weekly schedule assigned by admin</p>
          </div>
          <div className="bg-[#89D4FF]/10 border border-[#89D4FF]/30 text-[#3aabf0] text-sm font-medium px-4 py-2 rounded-xl">
            📅 Weekly View
          </div>
        </div>

        {/* Empty State */}
        {timetable.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center py-20 gap-4">
            <Inbox size={64} className="text-gray-300" strokeWidth={1} />
            <h2 className="text-xl font-semibold text-gray-700">No Timetable Assigned</h2>
            <p className="text-gray-400 text-sm">Ask your admin to assign you a timetable.</p>
          </div>
        ) : (
          /* Timetable Grid */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse">
                {/* Table Head — Days */}
                <thead>
                  <tr>
                    {/* Time column header */}
                    <th className="bg-[#1e1e2e] text-white text-sm font-semibold px-5 py-4 text-left w-40 sticky left-0 z-10">
                      🕐 Time
                    </th>
                    {DAYS.map((day) => {
                      const isToday =
                        new Date().toLocaleString("en-US", { weekday: "long" }) === day;
                      return (
                        <th
                          key={day}
                          className={`text-sm font-semibold px-5 py-4 text-center border-l border-gray-100 ${
                            isToday
                              ? "bg-[#89D4FF] text-white"
                              : "bg-[#1e1e2e] text-gray-300"
                          }`}
                        >
                          {day}
                          {isToday && (
                            <span className="block text-[10px] font-normal text-white/70 mt-0.5">
                              Today
                            </span>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                {/* Table Body — Time Slots as Rows */}
                <tbody>
                  {timeSlots.map((slot, rowIdx) => {
                    const [start, , end] = slot.split(" ");
                    return (
                      <tr
                        key={slot}
                        className={rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50/60"}
                      >
                        {/* Time Label */}
                        <td className="px-5 py-4 sticky left-0 bg-inherit z-10 border-r border-gray-100">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-800">
                              {start}
                            </span>
                            <span className="text-[11px] text-gray-400">to {end}</span>
                          </div>
                        </td>

                        {/* Period Cell for each Day */}
                        {DAYS.map((day) => {
                          const isToday =
                            new Date().toLocaleString("en-US", { weekday: "long" }) === day;
                          const period = dayMap[day]?.find(
                            (p) => `${p.startTime} - ${p.endTime}` === slot
                          );

                          return (
                            <td
                              key={day}
                              className={`px-3 py-3 border-l border-gray-100 text-center align-middle`}
                            >
                              {period ? (
                                <div
                                  className={`rounded-xl px-3 py-3 text-left ${
                                    isToday
                                      ? "bg-[#89D4FF]/15 border border-[#89D4FF]/40"
                                      : "bg-blue-50 border border-blue-100"
                                  }`}
                                >
                                  <p
                                    className={`text-sm font-bold ${
                                      isToday ? "text-[#1a8fc7]" : "text-blue-700"
                                    }`}
                                  >
                                    {period.subject}
                                  </p>
                                  <p className="text-[11px] text-gray-500 mt-0.5">
                                    Class {period.class} — {period.section}
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

            {/* Legend */}
            <div className="flex items-center gap-6 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-[#89D4FF]" />
                <span className="text-xs text-gray-500">Today's classes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-blue-100 border border-blue-200" />
                <span className="text-xs text-gray-500">Other days</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-300 text-sm font-bold">—</span>
                <span className="text-xs text-gray-500">No class</span>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        {timetable.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SummaryCard
              label="Total Classes / Week"
              value={timetable.reduce((acc, e) => acc + e.periods.length, 0)}
              icon={<BookOpen size={32} />}
              color="blue"
            />
            <SummaryCard
              label="Today's Classes"
              value={
                dayMap[new Date().toLocaleString("en-US", { weekday: "long" })]?.length || 0
              }
              icon={<Calendar size={32} />}
              color="sky"
            />
            <SummaryCard
              label="Active Days"
              value={DAYS.filter((d) => dayMap[d]?.length > 0).length}
              icon={<CalendarClock size={32} />}
              color="indigo"
            />
          </div>
        )}
      </div>
    </TeacherSidebar>
  );
}

function SummaryCard({ label, value, icon, color }) {
  const colorMap = {
    blue: "bg-blue-50 border-blue-100 text-blue-700",
    sky: "bg-sky-50 border-sky-100 text-sky-700",
    indigo: "bg-indigo-50 border-indigo-100 text-indigo-700",
  };
  return (
    <div className={`rounded-2xl border p-5 flex items-center gap-4 shadow-sm ${colorMap[color]}`}>
      <div className="opacity-80">{icon}</div>
      <div>
        <p className="text-2xl font-black leading-none">{value}</p>
        <p className="text-[11px] font-bold opacity-70 mt-1 uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}
