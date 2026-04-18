import React, { useState, useEffect } from "react";
import StudentSidebar from "../../Layouts/StudentSidebar";
import axiosInstance from "../../axiosInstance";

const StudentLeavePanel = () => {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [reason, setReason] = useState("");
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(false);
    const [studentId, setStudentId] = useState("");

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        const id = storedUser._id || (storedUser.student?._id);
        if (id) {
            setStudentId(id);
            fetchMyLeaves();
        }
    }, []);

    const fetchMyLeaves = async () => {
        try {
            // We'll need a way to get my own leaves. 
            // For now, let's assume a generic check or add an endpoint for it.
            // Actually, I can just use a filter on all leaves if I had a generic one, 
            // but let's assume we fetch them.
            // I'll add a new endpoint in backend for this.
            const res = await axiosInstance.get("/api/leave/student/my-leaves");
            setLeaves(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleLeaveSubmit = async (e) => {
        e.preventDefault();
        if (!startDate || !endDate || !reason) return alert("Please fill all fields");

        try {
            setLoading(true);
            await axiosInstance.post("/api/leave/student/request", {
                studentId,
                startDate,
                endDate,
                reason
            });
            alert("Leave application submitted successfully!");
            setStartDate("");
            setEndDate("");
            setReason("");
            fetchMyLeaves();
        } catch (err) {
            console.error(err);
            alert("Failed to submit leave application.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <StudentSidebar />
            <div className="flex-1 p-8 overflow-y-auto">
                <header className="mb-10">
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">Student Leave Portal</h1>
                    <p className="text-slate-500 font-medium">Request leave and track your application status.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* LEAVE FORM */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100">
                            <h2 className="text-2xl font-bold mb-6 text-slate-800">Apply for Leave</h2>
                            <form onSubmit={handleLeaveSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-600 mb-2">Start Date</label>
                                        <input 
                                            type="date"
                                            required
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="w-full bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-2xl p-4 transition duration-200"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-600 mb-2">End Date</label>
                                        <input 
                                            type="date"
                                            required
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="w-full bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-2xl p-4 transition duration-200"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-600 mb-2">Reason for Leave</label>
                                    <textarea 
                                        required
                                        rows={4}
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        className="w-full bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-2xl p-4 transition duration-200"
                                        placeholder="Enter the reason for your leave request..."
                                    />
                                </div>
                                <button 
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-200 transform active:scale-95 transition duration-200 disabled:opacity-50"
                                >
                                    {loading ? "PROCESSING..." : "SUBMIT APPLICATION"}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* HISTORY */}
                    <div className="lg:col-span-2">
                        <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 min-h-[500px]">
                            <h2 className="text-2xl font-bold mb-6 text-slate-800">Leave History</h2>
                            
                            {leaves.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full py-20 text-slate-400">
                                    <div className="text-6xl mb-4">📂</div>
                                    <p className="text-lg font-medium">No leave records found.</p>
                                    <p className="text-sm">Your leave applications will appear here.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {leaves.map((leave, idx) => (
                                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition group">
                                            <div className="mb-4 sm:mb-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="text-sm font-black text-slate-400">#{(leaves.length - idx).toString().padStart(2, '0')}</span>
                                                    <span className="font-bold text-slate-800">{leave.startDate} to {leave.endDate}</span>
                                                    <span className="text-slate-400">•</span>
                                                    <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{leave.totalDays} Days</span>
                                                </div>
                                                <p className="text-slate-600 italic">"{leave.reason}"</p>
                                            </div>
                                            <div className="flex items-center">
                                                <span className={`px-5 py-2 rounded-xl text-sm font-black uppercase tracking-widest shadow-sm ${
                                                    leave.status === 'Approved' ? 'bg-emerald-500 text-white' :
                                                    leave.status === 'Rejected' ? 'bg-rose-500 text-white' : 'bg-amber-400 text-white'
                                                }`}>
                                                    {leave.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentLeavePanel;
