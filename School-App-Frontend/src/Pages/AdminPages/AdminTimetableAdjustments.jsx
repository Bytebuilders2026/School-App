import React, { useState, useEffect } from "react";
import AdminSidebar from "../../Layouts/AdminSidebar";
import axiosInstance from "../../axiosInstance";

const AdminTimetableAdjustments = () => {
    const [leaves, setLeaves] = useState([]);
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [currentDaySuggestions, setCurrentDaySuggestions] = useState(null);
    const [allSubstitutions, setAllSubstitutions] = useState([]); // Array of all assigned subs across dates
    const [datesToHandle, setDatesToHandle] = useState([]);
    const [currentDateIndex, setCurrentDateIndex] = useState(0);
    const [mapping, setMapping] = useState({});

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        try {
            const res = await axiosInstance.get("/api/leave/teacher/all");
            setLeaves(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const getDatesInRange = (startDate, endDate) => {
        const dates = [];
        let currDate = new Date(startDate);
        const lastDate = new Date(endDate);
        while (currDate <= lastDate) {
            dates.push(new Date(currDate).toISOString().split('T')[0]);
            currDate.setDate(currDate.getDate() + 1);
        }
        return dates;
    };

    const handleReview = async (leave) => {
        const dates = getDatesInRange(leave.startDate, leave.endDate);
        setDatesToHandle(dates);
        setCurrentDateIndex(0);
        setSelectedLeave(leave);
        setAllSubstitutions([]);
        fetchSuggestionsForDate(dates[0], leave._id);
    };

    const fetchSuggestionsForDate = async (date, leaveId) => {
        try {
            // We'll reuse the suggestion logic but pass the specific date
            // I'll need to update the backend to accept a date in getSuggestions
            const res = await axiosInstance.get(`/api/autotimetable/leave/${leaveId}/suggestions?date=${date}`);
            setCurrentDaySuggestions(res.data.affectedPeriods);
            const initialMapping = {};
            res.data.affectedPeriods.forEach((_, i) => initialMapping[i] = "");
            setMapping(initialMapping);
        } catch (err) {
            console.error(err);
        }
    };

    const handleNextDate = () => {
        // Save current substitutions
        const dailySubs = currentDaySuggestions.map((ap, i) => ({
            date: datesToHandle[currentDateIndex],
            class: ap.class,
            section: ap.section,
            startTime: ap.startTime,
            endTime: ap.endTime,
            subject: ap.subject,
            substituteTeacherId: mapping[i]
        }));

        setAllSubstitutions([...allSubstitutions, ...dailySubs]);

        if (currentDateIndex < datesToHandle.length - 1) {
            const nextIdx = currentDateIndex + 1;
            setCurrentDateIndex(nextIdx);
            fetchSuggestionsForDate(datesToHandle[nextIdx], selectedLeave._id);
        } else {
            // All dates done, finalize
            finalizeApproval([...allSubstitutions, ...dailySubs]);
        }
    };

    const finalizeApproval = async (finalSubs) => {
        try {
            await axiosInstance.post("/api/leave/teacher/approve", {
                leaveId: selectedLeave._id,
                substitutions: finalSubs
            });
            alert("Teacher leave approved and all substitutions assigned!");
            setSelectedLeave(null);
            setDatesToHandle([]);
            fetchLeaves();
        } catch (err) {
            console.error(err);
            alert("Failed to finalize approval");
        }
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <AdminSidebar />
            <div className="flex-1 p-8 overflow-y-auto">
                <header className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-900">Teacher Leave Hub</h1>
                    <p className="text-slate-500">Review teacher leave applications and synchronize substitution logic.</p>
                </header>

                {!selectedLeave ? (
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-xl font-bold text-slate-800">Pending Requests</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-black">
                                    <tr>
                                        <th className="p-6">Teacher</th>
                                        <th className="p-6">Duration</th>
                                        <th className="p-6">Days</th>
                                        <th className="p-6">Reason</th>
                                        <th className="p-6">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {leaves.filter(l => l.status === "Pending").map(leave => (
                                        <tr key={leave._id} className="hover:bg-slate-50/80 transition">
                                            <td className="p-6">
                                                <div className="font-bold text-slate-800">{leave.teacher?.name}</div>
                                                <div className="text-xs text-slate-400">{leave.teacher?.employeeId}</div>
                                            </td>
                                            <td className="p-6 text-slate-600 font-medium text-sm">
                                                {leave.startDate} <span className="mx-2 text-slate-300">→</span> {leave.endDate}
                                            </td>
                                            <td className="p-6">
                                                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-black">
                                                    {leave.totalDays} DAYS
                                                </span>
                                            </td>
                                            <td className="p-6 max-w-xs">
                                                <p className="text-sm text-slate-500 truncate">{leave.reason}</p>
                                            </td>
                                            <td className="p-6">
                                                <button 
                                                    onClick={() => handleReview(leave)}
                                                    className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition"
                                                >
                                                    Process Leave
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {leaves.filter(l => l.status === "Pending").length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="p-20 text-center text-slate-400 font-medium">
                                                No pending leave requests found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
                        <div className="p-8 bg-indigo-600 text-white">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-3xl font-black">Leave Adjustment</h2>
                                    <p className="opacity-90 font-medium">Reviewing for {selectedLeave.teacher?.name}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-black">{datesToHandle[currentDateIndex]}</div>
                                    <div className="text-sm font-bold opacity-75">STEP {currentDateIndex + 1} OF {datesToHandle.length}</div>
                                </div>
                            </div>
                            <div className="w-full bg-indigo-800/30 rounded-full h-2">
                                <div 
                                    className="bg-white h-2 rounded-full transition-all duration-500" 
                                    style={{ width: `${((currentDateIndex + 1) / datesToHandle.length) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="flex items-center gap-4 mb-8 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                <span className="text-2xl">💡</span>
                                <p className="text-sm text-amber-800 font-medium">
                                    Assign substitutes for lectures on this date. If a period is left empty, the class will be marked as self-study.
                                </p>
                            </div>

                            <div className="space-y-6">
                                {currentDaySuggestions?.map((period, index) => (
                                    <div key={index} className="flex flex-col md:flex-row md:items-center gap-6 p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition">
                                        <div className="md:w-1/3">
                                            <div className="text-xs font-black text-slate-400 mb-1">CLASS & SECTION</div>
                                            <div className="font-bold text-slate-800 text-lg">Class {period.class}-{period.section}</div>
                                            <div className="text-indigo-600 text-sm font-bold mt-1 bg-white inline-block px-2 py-1 rounded-md border border-indigo-50 shadow-sm">
                                                {period.startTime} - {period.endTime}
                                            </div>
                                        </div>
                                        <div className="md:w-1/3">
                                            <div className="text-xs font-black text-slate-400 mb-1">SUBJECT</div>
                                            <div className="font-bold text-slate-700">{period.subject}</div>
                                        </div>
                                        <div className="md:w-1/3">
                                            <div className="text-xs font-black text-slate-400 mb-1">ASSIGN SUBSTITUTE</div>
                                            <select 
                                                className="w-full bg-white border-slate-200 rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-indigo-100 transition"
                                                value={mapping[index]}
                                                onChange={(e) => setMapping({ ...mapping, [index]: e.target.value })}
                                            >
                                                <option value="">No Substitute</option>
                                                {period.suggestions.highPriority.map(t => (
                                                    <option key={t.id} value={t.id}>⭐ {t.name} (Recommended)</option>
                                                ))}
                                                {period.suggestions.fallback.map(t => (
                                                    <option key={t.id} value={t.id}>{t.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                ))}
                                {currentDaySuggestions?.length === 0 && (
                                    <div className="text-center py-10 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 font-bold">
                                        No lectures scheduled for this teacher on this day.
                                    </div>
                                )}
                            </div>

                            <div className="mt-10 flex justify-between items-center pt-8 border-t border-slate-100">
                                <button 
                                    onClick={() => setSelectedLeave(null)}
                                    className="text-slate-400 font-bold hover:text-slate-600 transition"
                                >
                                    CANCEL PROCESS
                                </button>
                                <button 
                                    onClick={handleNextDate}
                                    className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm tracking-widest hover:bg-black shadow-xl transition active:scale-95"
                                >
                                    {currentDateIndex < datesToHandle.length - 1 ? "NEXT DATE" : "FINISH & APPROVE"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminTimetableAdjustments;

