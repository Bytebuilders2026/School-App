import React, { useState, useEffect } from "react";
import axios from "axios";
import TeacherSidebar from "../../Layouts/TeacherSidebar";
import axiosInstance from "../../axiosInstance";

const TeacherLeavePanel = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [teacherId, setTeacherId] = useState(""); 
  const [substitutions, setSubstitutions] = useState([]);
  const [studentLeaves, setStudentLeaves] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const id = storedUser._id || (storedUser.user?._id);
    if(id) {
      setTeacherId(id);
      fetchSubstitutions(id);
      fetchStudentLeaves();
    }
  }, []);

  const fetchSubstitutions = async (id) => {
    try {
      const res = await axiosInstance.get(`/api/autotimetable/substitutions/${id}`);
      setSubstitutions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudentLeaves = async () => {
    try {
      const res = await axiosInstance.get("/api/leave/student/all");
      setStudentLeaves(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axiosInstance.post("/api/leave/teacher/request", {
        teacherId,
        startDate,
        endDate,
        reason
      });
      alert("Leave successfully requested! It is now pending admin approval.");
      setStartDate("");
      setEndDate("");
      setReason("");
    } catch (err) {
      console.error(err);
      alert("Failed to submit leave request.");
    } finally {
      setLoading(false);
    }
  };

  const approveStudentLeave = async (leaveId) => {
    try {
      await axiosInstance.post("/api/leave/student/approve", { leaveId });
      alert("Leave Approved!");
      fetchStudentLeaves();
    } catch (err) {
      console.error(err);
      alert("Approval failed");
    }
  };

  const rejectStudentLeave = async (leaveId) => {
    try {
      await axiosInstance.post("/api/leave/reject", { leaveId, type: 'student' });
      alert("Leave Rejected!");
      fetchStudentLeaves();
    } catch (err) {
      console.error(err);
      alert("Rejection failed");
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <TeacherSidebar />
      <div className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8">
            <h1 className="text-4xl font-extrabold text-indigo-900">Leave & Student Requests</h1>
            <p className="text-indigo-600 font-medium">Manage your leaves and monitor student attendance requests.</p>
        </header>
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* TEACHER LEAVE FORM */}
          <div className="xl:col-span-1">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-indigo-100">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                    <span className="bg-indigo-100 p-2 rounded-lg mr-3">📝</span> Apply For Leave
                </h2>
                <form onSubmit={handleLeaveSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">From Date</label>
                            <input 
                                type="date"
                                required
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full bg-gray-50 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl p-4 transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">To Date</label>
                            <input 
                                type="date"
                                required
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full bg-gray-50 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl p-4 transition"
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Reason</label>
                        <textarea 
                            required
                            rows={4}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full bg-gray-50 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl p-4 transition"
                            placeholder="Briefly explain your leave..."
                        />
                    </div>
                    
                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 text-white font-bold py-4 rounded-xl hover:shadow-lg transform hover:-translate-y-1 transition duration-300 disabled:opacity-50"
                    >
                        {loading ? "Submitting..." : "Submit Application"}
                    </button>
                </form>
            </div>

            {/* MY SUBSTITUTIONS */}
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-emerald-100 mt-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                    <span className="bg-emerald-100 p-2 rounded-lg mr-3">🔄</span> My Substitution Schedule
                </h2>
                
                {substitutions.length === 0 ? (
                    <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        No active substitution tasks.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {substitutions.map(sub => (
                            <div key={sub._id} className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
                                <div className="flex justify-between font-bold text-emerald-900 mb-1">
                                    <span>Class {sub.class}-{sub.section}</span>
                                    <span className="text-xs">{sub.date}</span>
                                </div>
                                <div className="text-sm text-emerald-800">
                                    <p><b>{sub.subject}</b> • {sub.periodStartTime} - {sub.periodEndTime}</p>
                                    <p className="mt-1 opacity-75 italic">For: {sub.absentTeacher?.name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
          </div>

          {/* STUDENT LEAVE REQUESTS */}
          <div className="xl:col-span-2">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-amber-100 h-full">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                        <span className="bg-amber-100 p-2 rounded-lg mr-3">🎓</span> Student Leave Requests
                    </h2>
                    <span className="bg-amber-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-sm">
                        {studentLeaves.filter(l => l.status === "Pending").length} New
                    </span>
                </div>

                <div className="overflow-hidden">
                    {studentLeaves.length === 0 ? (
                        <div className="text-center py-20 text-gray-500">
                            <p className="text-xl">Everything is quiet!</p>
                            <p>No student leave requests found for your classes.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {studentLeaves.map(leave => (
                                <div key={leave._id} className={`p-5 rounded-2xl border transition ${leave.status === 'Pending' ? 'bg-amber-50 border-amber-200 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-75'}`}>
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-extrabold text-gray-900 uppercase tracking-tight">{leave.student?.name}</h3>
                                            <p className="text-xs text-gray-500">Roll: {leave.student?.rollNumber} • Class: {leave.class}-{leave.section}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                            leave.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                            leave.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-200 text-amber-800'
                                        }`}>
                                            {leave.status}
                                        </span>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl mb-4 text-sm text-gray-700 border border-gray-100">
                                        <p className="font-semibold text-indigo-600 mb-1">{leave.startDate} to {leave.endDate} ({leave.totalDays} Days)</p>
                                        <p className="italic">"{leave.reason}"</p>
                                    </div>
                                    
                                    {leave.status === 'Pending' && (
                                        <div className="flex gap-2 mt-4">
                                            <button 
                                                onClick={() => approveStudentLeave(leave._id)}
                                                className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition"
                                            >
                                                Approve
                                            </button>
                                            <button 
                                                onClick={() => rejectStudentLeave(leave._id)}
                                                className="flex-1 bg-white text-red-600 border border-red-200 py-2 rounded-lg font-bold hover:bg-red-50 transition"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default TeacherLeavePanel;

