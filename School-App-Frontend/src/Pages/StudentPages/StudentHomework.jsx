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

  const groupedBySubject = homeworks.reduce((acc, hw) => {
    if (!acc[hw.subject]) acc[hw.subject] = [];
    acc[hw.subject].push(hw);
    return acc;
  }, {});

  const pendingSubjects = Object.keys(groupedBySubject).filter(subj => 
    groupedBySubject[subj].some(hw => !hw.completed)
  );

  return (
    <StudentSidebar>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Homework</h1>
            <p className="text-sm text-gray-400 mt-1">Track and manage your assignments</p>
          </div>
        </div>

        {/* 🔹 Subject Summary List */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
           <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">Pending Subjects</h2>
           <div className="flex flex-wrap gap-2">
              {pendingSubjects.length > 0 ? pendingSubjects.map(subj => (
                <div key={subj} className="bg-orange-50 text-orange-600 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border border-orange-100">
                   <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                   {subj}
                </div>
              )) : (
                <div className="bg-green-50 text-green-600 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border border-green-100 font-bold">
                   <CheckCircle size={14} /> All subjects completed!
                </div>
              )}
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
            {/* 🔹 Categorized Subject View */}
            {Object.keys(groupedBySubject).map(subject => (
              <div key={subject}>
                <h2 className="text-lg font-bold text-gray-700 mb-4 px-2 flex items-center gap-2">
                   <div className="w-2 h-6 bg-[#8884d8] rounded-full" />
                   {subject} Assignments
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {groupedBySubject[subject].map(hw => {
                    const isPastDue = new Date(hw.dueDate) < new Date() && !hw.completed;
                    return (
                      <div key={hw._id} className={`bg-white rounded-3xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition flex flex-col relative overflow-hidden ${hw.completed ? 'opacity-60' : ''}`}>
                        <div className={`absolute top-0 left-0 w-full h-1.5 ${hw.completed ? 'bg-green-400' : isPastDue ? 'bg-red-400' : 'bg-[#8884d8]'}`}></div>
                        
                        <div className="flex justify-between items-start mb-3 mt-1">
                          <span className="text-[10px] font-bold bg-gray-50 text-gray-500 uppercase tracking-widest px-3 py-1 rounded-full">
                            {hw.completed ? 'COMPLETED' : 'ASSIGNED'}
                          </span>
                          {hw.completed && <CheckCircle size={18} className="text-green-500" />}
                        </div>

                        <h3 className={`font-bold text-gray-800 text-lg mb-2 line-clamp-2 ${hw.completed ? 'line-through text-gray-400' : ''}`}>{hw.title}</h3>
                        <p className="text-xs text-gray-500 line-clamp-2 mb-4 bg-gray-50 p-2 rounded-xl italic">{hw.description || "No specific instructions."}</p>
                        
                        <div className="flex items-center justify-between mt-auto pt-2">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Due Date</span>
                            <span className={`text-xs font-bold ${hw.completed ? 'text-gray-400' : isPastDue ? 'text-red-500' : 'text-orange-500'}`}>
                              {new Date(hw.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                          {!hw.completed && (
                            <button onClick={() => handleMarkComplete(hw._id)} className="bg-[#8884d8] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#7169c9] transition flex items-center gap-1 shadow-sm">
                              Confirm Completion
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </StudentSidebar>
  );
}
