import { useState, useEffect } from "react";
import axios from "axios";
import StudentSidebar from "../../Layouts/StudentSidebar";
import { BookOpen, Calendar, Inbox, CheckCircle } from "lucide-react";

import { API_BASE_URL } from "../../apiConfig";

const API = API_BASE_URL;

export default function StudentHomework() {
  const [homeworks, setHomeworks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeworks();
  }, []);

  const fetchHomeworks = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/student/homework`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHomeworks(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`${API}/homework/${id}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchHomeworks();
    } catch (err) {
      console.error(err);
      alert("Failed to mark complete.");
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

  return (
    <StudentSidebar>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Homework</h1>
            <p className="text-sm text-gray-400 mt-1">Track and manage your assignments</p>
          </div>
        </div>

        {homeworks.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center py-24 gap-4">
            <BookOpen size={64} className="text-gray-300" strokeWidth={1} />
            <h2 className="text-xl font-semibold text-gray-700">No Homework!</h2>
            <p className="text-gray-400 text-sm">You are all caught up. Great job!</p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Active Homework */}
            <div>
              <h2 className="text-lg font-bold text-gray-700 mb-4 px-2">Active Assignments</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {homeworks.filter(hw => !hw.completed && new Date(hw.dueDate) >= new Date(new Date().setHours(0,0,0,0))).map(hw => {
                  const isPastDue = new Date(hw.dueDate) < new Date();
                  return (
                    <div key={hw._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition flex flex-col relative overflow-hidden">
                      <div className={`absolute top-0 left-0 w-full h-1.5 ${isPastDue ? 'bg-red-400' : 'bg-[#8884d8]'}`}></div>
                      <div className="flex justify-between items-start mb-3 mt-1">
                        <span className="text-[10px] font-bold bg-[#8884d8]/10 text-[#7169c9] uppercase tracking-widest px-3 py-1 rounded-full">
                          {hw.subject}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-800 text-lg mb-2 line-clamp-2">{hw.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4 bg-gray-50 p-2 rounded-xl">{hw.description || "No specific instructions."}</p>
                      
                      <div className="flex items-center justify-between mt-auto pt-2">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Due Date</span>
                          <span className={`text-xs font-bold ${isPastDue ? 'text-red-500' : 'text-orange-500'}`}>
                            {new Date(hw.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                        <button onClick={() => handleMarkComplete(hw._id)} className="bg-[#8884d8] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#7169c9] transition flex items-center gap-1">
                          <CheckCircle size={14} /> Done
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {homeworks.filter(hw => !hw.completed && new Date(hw.dueDate) >= new Date(new Date().setHours(0,0,0,0))).length === 0 && (
                <p className="text-gray-400 text-sm pl-2">No active assignments.</p>
              )}
            </div>

            {/* Past Homework */}
            <div>
              <h2 className="text-lg font-bold text-gray-400 mb-4 px-2">Past & Completed</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 opacity-70 hover:opacity-100 transition duration-300">
                {homeworks.filter(hw => hw.completed || new Date(hw.dueDate) < new Date(new Date().setHours(0,0,0,0))).map(hw => {
                  return (
                    <div key={hw._id} className="bg-gray-50 rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1.5 bg-green-400"></div>
                      <div className="flex justify-between items-start mb-3 mt-1">
                        <span className="text-[10px] font-bold bg-gray-200 text-gray-600 uppercase tracking-widest px-3 py-1 rounded-full">
                          {hw.subject}
                        </span>
                        {hw.completed && <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-lg">Completed</span>}
                      </div>
                      <h3 className="font-bold text-gray-600 text-lg mb-2 line-clamp-2">{hw.title}</h3>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Due Date</span>
                          <span className={`text-xs font-bold text-gray-400`}>
                            {new Date(hw.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentSidebar>
  );
}
