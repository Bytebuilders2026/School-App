import React, { useState, useEffect } from "react";
import axios from "axios";
import TeacherSidebar from "../../Layouts/TeacherSidebar";

const TeacherLeavePanel = () => {
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  // Usually this would come from Auth Context
  const [teacherId, setTeacherId] = useState(""); 
  const [substitutions, setSubstitutions] = useState([]);

  useEffect(() => {
    // We assume teacher ID is stored in localStorage by AuthController
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    if(storedUser._id) {
      setTeacherId(storedUser._id);
      fetchSubstitutions(storedUser._id);
    }
  }, []);

  const fetchSubstitutions = async (id) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/autotimetable/substitutions/${id}`);
      setSubstitutions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/autotimetable/leave/request", {
        teacherId,
        date,
        reason
      });
      alert("Leave successfully requested! It is now pending admin approval.");
      setDate("");
      setReason("");
    } catch (err) {
      console.error(err);
      alert("Failed to submit leave request.");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <TeacherSidebar collapse={false} />
      <div className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6 text-indigo-700">Leave & Adjustment Hub</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Leave Request Form */}
          <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-indigo-500">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Request Leave</h2>
            <form onSubmit={handleLeaveSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Leave</label>
                <input 
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 rounded-md shadow-sm p-3 border"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <textarea 
                  required
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 rounded-md shadow-sm p-3 border"
                  placeholder="Explain why you are requesting leave..."
                />
              </div>
              
              <button 
                type="submit"
                className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded hover:bg-indigo-700 transition shadow-md"
              >
                Submit Leave Application
              </button>
            </form>
          </div>

          {/* Assigned Substitutions */}
          <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-green-500">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">My Substitution Schedule</h2>
            <p className="text-gray-500 mb-4 text-sm">Classes where you have been assigned to cover for absent teachers.</p>
            
            {substitutions.length === 0 ? (
              <div className="p-4 bg-gray-50 text-gray-600 rounded-lg text-center font-medium border border-gray-200">
                You have no assigned substitutions.
              </div>
            ) : (
              <div className="space-y-4">
                {substitutions.map(sub => (
                  <div key={sub._id} className="border border-green-200 rounded-lg p-4 bg-green-50 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-green-800 text-lg">
                        Class {sub.class}-{sub.section}
                      </div>
                      <div className="bg-white text-green-700 px-2 py-1 rounded text-xs font-bold border border-green-200">
                        {sub.date} • {sub.periodStartTime} to {sub.periodEndTime}
                      </div>
                    </div>
                    <div className="text-green-700 text-sm">
                      <span className="font-semibold">Subject:</span> {sub.subject}
                    </div>
                    <div className="text-green-700 text-sm mt-1">
                      <span className="font-semibold">Covering for:</span> {sub.absentTeacher?.name || "N/A"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default TeacherLeavePanel;
