import { useState, useEffect } from "react";
import axios from "axios";
import StudentSidebar from "../../Layouts/StudentSidebar";
import { ClipboardCheck, Activity } from "lucide-react";

import { API_BASE_URL } from "../../apiConfig";

const API = API_BASE_URL;

export default function StudentAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/student/attendance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAttendance(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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

  const presents = attendance.filter(a => a.status === 'present').length;
  const absents = attendance.filter(a => a.status === 'absent').length;
  const leaves = attendance.filter(a => a.status === 'leave').length;
  const total = attendance.length;
  const percentage = total > 0 ? Math.round((presents / total) * 100) : 0;

  return (
    <StudentSidebar>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Attendance</h1>
            <p className="text-sm text-gray-400 mt-1">Your check-in history for the past 30 days</p>
          </div>
        </div>

        {total === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center py-24 gap-4">
            <ClipboardCheck size={64} className="text-gray-300" strokeWidth={1} />
            <h2 className="text-xl font-semibold text-gray-700">No Attendance Records</h2>
            <p className="text-gray-400 text-sm">You do not have any recorded attendance yet.</p>
          </div>
        ) : (
          <>
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Overall Presence" value={`${percentage}%`} color="text-[#8884d8]" bg="bg-[#8884d8]/10" />
              <StatCard label="Present Days" value={presents} color="text-green-500" bg="bg-green-50" />
              <StatCard label="Absent Days" value={absents} color="text-red-500" bg="bg-red-50" />
              <StatCard label="Leave Days" value={leaves} color="text-yellow-600" bg="bg-yellow-50" />
            </div>

            {/* List */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex items-center gap-3">
                <Activity size={18} className="text-gray-500" />
                <h3 className="font-bold text-gray-700 text-sm">Recent Activity Log</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {attendance.map((record, i) => {
                  const date = new Date(record.date);
                  return (
                    <div key={i} className="flex items-center justify-between p-4 md:px-6 hover:bg-gray-50/50 transition">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex flex-col items-center justify-center border border-gray-100">
                          <span className="text-xs font-bold text-gray-500 uppercase">{date.toLocaleString('en-US', { month: 'short' })}</span>
                          <span className="text-lg font-black text-gray-800 leading-none">{date.getDate()}</span>
                        </div>
                        <div>
                          <p className="font-bold text-gray-700 text-sm">{date.toLocaleString('en-US', { weekday: 'long' })}</p>
                          <p className="text-xs text-gray-400 font-medium">Recorded at EOD</p>
                        </div>
                      </div>
                      
                      <div className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest ${
                        record.status === 'present' ? 'bg-green-100 text-green-700' :
                        record.status === 'absent' ? 'bg-red-100 text-red-600' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {record.status}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </StudentSidebar>
  );
}

function StatCard({ label, value, color, bg }) {
  return (
    <div className="bg-white border p-5 flex flex-col justify-center items-center text-center rounded-3xl shadow-sm">
      <h2 className={`text-3xl font-black ${color}`}>{value}</h2>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{label}</p>
    </div>
  );
}
