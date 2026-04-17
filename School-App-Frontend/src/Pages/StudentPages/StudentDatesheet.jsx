import { useState, useEffect } from "react";
import axios from "axios";
import StudentSidebar from "../../Layouts/StudentSidebar";
import { CalendarDays, Clock } from "lucide-react";

import { API_BASE_URL } from "../../apiConfig";

const API = API_BASE_URL;

export default function StudentDatesheet() {
  const [datesheets, setDatesheets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fallback testing logic. The logged in student should ideally have Class stored, but let's assume "10th" for demo if not found
  const studentClass = localStorage.getItem("studentClass") || "10th";

  useEffect(() => {
    fetchDatesheets();
  }, []);

  const fetchDatesheets = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/datesheet/class/${studentClass}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDatesheets(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StudentSidebar>
      <div className="space-y-6">
        <div>
           <h1 className="text-2xl font-bold text-gray-800">Exam Datesheets</h1>
           <p className="text-sm text-gray-400 mt-1">Upcoming assessments and timeline</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
             <div className="w-10 h-10 border-4 border-[#8884d8] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : datesheets.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-gray-100 text-gray-400">
             <CalendarDays size={48} strokeWidth={1} className="mb-4 text-gray-300" />
             <p className="font-medium text-[15px]">No upcoming exams scheduled right now.</p>
          </div>
        ) : (
          <div className="space-y-6">
             {datesheets.map((ds) => (
                <div key={ds._id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                   <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 p-6 flex justify-between items-center">
                      <div>
                         <span className="text-[10px] font-black uppercase tracking-widest text-[#8884d8]">Schedule</span>
                         <h2 className="font-bold text-gray-800 text-xl mt-1">{ds.examType}</h2>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-[#8884d8]/10 flex items-center justify-center text-[#8884d8]">
                         <CalendarDays size={24} />
                      </div>
                   </div>
                   
                   <div className="divide-y divide-gray-50">
                      {ds.schedule.sort((a,b) => new Date(a.date) - new Date(b.date)).map((item, idx) => (
                         <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-5 px-6 hover:bg-gray-50/50 transition">
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                              <span className="font-black text-gray-700 md:w-32 tracking-tight text-lg">
                                 {new Date(item.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                              </span>
                              <div>
                                 <span className="font-bold text-[#8884d8] text-lg block">{item.subject}</span>
                                 {item.syllabusInfo && <span className="text-sm text-gray-400 font-medium">{item.syllabusInfo}</span>}
                              </div>
                            </div>
                            <div className="mt-4 md:mt-0 font-bold text-gray-600 bg-gray-100 px-4 py-2 rounded-xl text-xs flex items-center gap-2 border border-gray-200">
                               <Clock size={14} className="text-gray-400" />
                               {item.startTime} — {item.endTime}
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
             ))}
          </div>
        )}
      </div>
    </StudentSidebar>
  );
}
