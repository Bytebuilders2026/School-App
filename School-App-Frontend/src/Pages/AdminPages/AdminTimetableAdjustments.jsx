import React, { useState, useEffect } from "react";
import AdminSidebar from "../../Layouts/AdminSidebar";
import axiosInstance from "../../axiosInstance";
import { 
  Calendar, 
  ChevronRight, 
  UserCheck, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ArrowLeft,
  Search,
  Users
} from "lucide-react";

const AdminTimetableAdjustments = () => {
    const [leaves, setLeaves] = useState([]);
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [currentDaySuggestions, setCurrentDaySuggestions] = useState(null);
    const [allSubstitutions, setAllSubstitutions] = useState([]);
    const [datesToHandle, setDatesToHandle] = useState([]);
    const [currentDateIndex, setCurrentDateIndex] = useState(0);
    const [mapping, setMapping] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get("/leave/teacher/all");
            setLeaves(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
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
            setLoading(true);
            const res = await axiosInstance.get(`/autotimetable/leave/${leaveId}/suggestions?date=${date}`);
            setCurrentDaySuggestions(res.data.affectedPeriods);
            const initialMapping = {};
            res.data.affectedPeriods.forEach((_, i) => initialMapping[i] = "");
            setMapping(initialMapping);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleNextDate = () => {
        const dailySubs = currentDaySuggestions.map((ap, i) => ({
            date: datesToHandle[currentDateIndex],
            class: ap.class,
            section: ap.section,
            startTime: ap.startTime,
            endTime: ap.endTime,
            subject: ap.subject,
            substituteTeacherId: mapping[i]
        }));

        const updatedAllSubs = [...allSubstitutions, ...dailySubs];
        setAllSubstitutions(updatedAllSubs);

        if (currentDateIndex < datesToHandle.length - 1) {
            const nextIdx = currentDateIndex + 1;
            setCurrentDateIndex(nextIdx);
            fetchSuggestionsForDate(datesToHandle[nextIdx], selectedLeave._id);
        } else {
            finalizeApproval(updatedAllSubs);
        }
    };

    const finalizeApproval = async (finalSubs) => {
        try {
            setLoading(true);
            await axiosInstance.post("/leave/teacher/approve", {
                leaveId: selectedLeave._id,
                substitutions: finalSubs
            });
            alert("Success! Leave approved and substitution notifications sent.");
            setSelectedLeave(null);
            setDatesToHandle([]);
            fetchLeaves();
        } catch (err) {
            console.error(err);
            alert("Failed to finalize approval");
        } finally {
            setLoading(false);
        }
    };

    const handleQuickApprove = async (leave) => {
        if(!window.confirm("Approve this leave with 'Self Study' for all periods?")) return;
        try {
            setLoading(true);
            await axiosInstance.post("/leave/teacher/approve", {
                leaveId: leave._id,
                substitutions: [] 
            });
            alert("Leave approved with Self Study mode.");
            fetchLeaves();
        } catch (err) {
            console.error(err);
            alert("Quick approval failed");
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async (leave) => {
        if(!window.confirm("Reject this leave application?")) return;
        try {
            setLoading(true);
            await axiosInstance.post("/leave/reject", {
                leaveId: leave._id,
                type: 'teacher'
            });
            alert("Leave application rejected.");
            fetchLeaves();
        } catch (err) {
            console.error(err);
            alert("Rejection failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-[#F8FAFC]">
            <AdminSidebar />
            <div className="flex-1 p-8 overflow-y-auto">
                <header className="mb-10 flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Substitution Hub</h1>
                        <p className="text-slate-500 mt-2 text-lg font-medium">Coordinate teaching staff for approved leave periods.</p>
                    </div>
                    {selectedLeave && (
                        <button 
                            onClick={() => setSelectedLeave(null)}
                            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold transition-all"
                        >
                            <ArrowLeft size={18} /> Back to Requests
                        </button>
                    )}
                </header>

                {!selectedLeave ? (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Pending Approvals</p>
                                    <h3 className="text-3xl font-black text-slate-800 mt-1">{leaves.filter(l => l.status === "Pending").length}</h3>
                                </div>
                                <div className="bg-orange-100 p-3 rounded-2xl text-orange-600">
                                    <Clock size={24} />
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Active Substitutions</p>
                                    <h3 className="text-3xl font-black text-slate-800 mt-1">{leaves.filter(l => l.status === "Approved").length}</h3>
                                </div>
                                <div className="bg-blue-100 p-3 rounded-2xl text-blue-600">
                                    <Users size={24} />
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Completion Rate</p>
                                    <h3 className="text-3xl font-black text-slate-800 mt-1">94%</h3>
                                </div>
                                <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600">
                                    <CheckCircle2 size={24} />
                                </div>
                            </div>
                        </div>

                        {/* Leave Table */}
                        <div className="bg-white rounded-[32px] shadow-xl border border-slate-200/60 overflow-hidden">
                            <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
                                <h2 className="text-2xl font-black text-slate-800">Leave Applications</h2>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input 
                                        type="text" 
                                        placeholder="Search teacher..." 
                                        className="pl-10 pr-6 py-2.5 bg-white border border-slate-200 rounded-full text-sm focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all w-64"
                                    />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50/50 text-slate-400 uppercase text-[11px] font-black tracking-[0.1em]">
                                        <tr>
                                            <th className="px-8 py-5 text-left">Teacher Profile</th>
                                            <th className="px-8 py-5 text-left">Period Range</th>
                                            <th className="px-8 py-5 text-center">Duration</th>
                                            <th className="px-8 py-5 text-left">Primary Reason</th>
                                            <th className="px-8 py-5 text-center">Coordination</th>
                                            <th className="px-8 py-5 text-right whitespace-nowrap">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {leaves.filter(l => l.status === "Pending").map(leave => (
                                            <tr key={leave._id} className="hover:bg-blue-50/30 transition-colors group">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-blue-100 uppercase">
                                                            {leave.teacher?.name?.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-extrabold text-slate-900 text-base">{leave.teacher?.name}</div>
                                                            <div className="text-xs font-bold text-slate-400">ID: {leave.teacher?.employeeId}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2 text-slate-600 font-bold text-sm bg-white border border-slate-100 px-4 py-2 rounded-2xl w-fit shadow-sm">
                                                        {leave.startDate} <ChevronRight size={14} className="text-slate-300" /> {leave.endDate}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <span className="bg-slate-900 text-white px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase">
                                                        {leave.totalDays} Days
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 max-w-xs">
                                                    <p className="text-sm text-slate-500 font-medium line-clamp-1 italic">"{leave.reason}"</p>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <button 
                                                        onClick={() => handleReview(leave)}
                                                        className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black tracking-widest uppercase hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-200 transition-all font-bold"
                                                    >
                                                        Review & Adjust
                                                    </button>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button 
                                                            onClick={() => handleQuickApprove(leave)}
                                                            className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl hover:bg-emerald-200 transition-colors"
                                                            title="Approve without substitutions (Self Study)"
                                                        >
                                                            <CheckCircle2 size={18} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleReject(leave)}
                                                            className="p-3 bg-rose-100 text-rose-600 rounded-2xl hover:bg-rose-200 transition-colors"
                                                            title="Reject Application"
                                                        >
                                                            <Clock className="rotate-45" size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {leaves.filter(l => l.status === "Pending").length === 0 && (
                                            <tr>
                                                <td colSpan="6" className="p-24 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                                            <AlertCircle size={32} className="text-slate-300" />
                                                        </div>
                                                        <p className="text-slate-400 font-bold text-lg">No pending leave requests found.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom duration-500">
                        {/* Stepper Header */}
                        <div className="bg-white rounded-[32px] shadow-2xl overflow-hidden border border-slate-200/60 transition-all">
                            <div className="p-10 bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden">
                                <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                                <div className="absolute left-0 bottom-0 w-48 h-48 bg-blue-400/20 rounded-full -ml-10 -mb-10 blur-2xl"></div>
                                
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="flex items-center gap-6">
                                            <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-3xl border border-white/30">
                                                {selectedLeave.teacher?.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-4xl font-black tracking-tighter">{selectedLeave.teacher?.name}</div>
                                                <div className="text-blue-100 font-bold flex items-center gap-2 mt-1">
                                                    <Calendar size={16} /> 
                                                    Day {currentDateIndex + 1} of {datesToHandle.length} — {datesToHandle[currentDateIndex]}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-black text-blue-100 uppercase tracking-widest mb-1">Process Status</div>
                                            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl font-black text-xl border border-white/20">
                                                {Math.round(((currentDateIndex + 1) / datesToHandle.length) * 100)}%
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="w-full bg-white/10 rounded-full h-3 backdrop-blur-sm border border-white/5">
                                        <div 
                                            className="bg-white h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_20px_rgba(255,255,255,0.5)]" 
                                            style={{ width: `${((currentDateIndex + 1) / datesToHandle.length) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-10">
                                <div className="flex items-start gap-5 mb-10 p-6 bg-blue-50 rounded-[28px] border border-blue-100 relative">
                                    <div className="bg-blue-600 text-white p-3 rounded-2xl shadow-lg shadow-blue-100">
                                        <UserCheck size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-blue-900 mb-1">Substitution Engine Online</h4>
                                        <p className="text-sm text-blue-800 leading-relaxed font-medium">
                                            Our intelligent engine has analyzed the timetable and suggested the best available teachers based on subject expertise and current workload.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                                        <Clock className="text-blue-600" size={24} /> 
                                        Schedule for {datesToHandle[currentDateIndex]}
                                    </h3>
                                    
                                    <div className="space-y-4">
                                        {currentDaySuggestions?.map((period, index) => (
                                            <div key={index} className="flex flex-col md:flex-row md:items-center gap-8 p-8 rounded-[28px] bg-[#F8FAFC] border border-slate-100 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-50 transition-all duration-300 group">
                                                <div className="md:w-[40%]">
                                                    <div className="flex items-center gap-4 mb-3">
                                                        <span className="bg-slate-900 text-white text-[10px] font-black px-3 py-1 rounded-full tracking-widest uppercase">
                                                            {period.startTime} - {period.endTime}
                                                        </span>
                                                        <span className="text-blue-600 font-black text-sm uppercase tracking-wide">
                                                            {period.subject}
                                                        </span>
                                                    </div>
                                                    <div className="text-2xl font-black text-slate-900 tracking-tight">
                                                        Class {period.class} — <span className="text-slate-400 font-bold">Sec {period.section}</span>
                                                    </div>
                                                </div>

                                                <div className="flex-1">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Substitute Allocation</label>
                                                    <div className="relative">
                                                        <select 
                                                            className="w-full bg-white border-slate-200 rounded-[20px] px-6 py-4 text-sm font-bold text-slate-700 outline-none ring-offset-2 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all appearance-none shadow-sm"
                                                            value={mapping[index]}
                                                            onChange={(e) => setMapping({ ...mapping, [index]: e.target.value })}
                                                        >
                                                            <option value="">🏫 Self Study Mode</option>
                                                            {period.suggestions.highPriority.map(t => (
                                                                <option key={t.id} value={t.id}>✨ {t.name} (Expert Suggestion)</option>
                                                            ))}
                                                            {period.suggestions.fallback.map(t => (
                                                                <option key={t.id} value={t.id}>👤 {t.name} (Available)</option>
                                                            ))}
                                                        </select>
                                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                            <ChevronRight size={18} className="rotate-90" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {currentDaySuggestions?.length === 0 && (
                                            <div className="text-center py-16 bg-emerald-50 text-emerald-700 rounded-[32px] border-2 border-dashed border-emerald-200">
                                                <div className="text-4xl mb-4">✅</div>
                                                <p className="text-xl font-black">Free Day!</p>
                                                <p className="font-bold opacity-75">This teacher has no lectures scheduled for this date.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-12 flex justify-between items-center pt-10 border-t border-slate-100">
                                    <button 
                                        onClick={() => setSelectedLeave(null)}
                                        className="text-slate-400 font-black text-xs tracking-widest uppercase hover:text-slate-900 transition-colors"
                                    >
                                        Discard Process
                                    </button>
                                    <button 
                                        onClick={handleNextDate}
                                        disabled={loading}
                                        className="bg-slate-900 text-white px-10 py-5 rounded-[24px] font-black text-sm tracking-[0.2em] uppercase hover:bg-blue-600 hover:shadow-2xl hover:shadow-blue-200 transition-all flex items-center gap-3 disabled:opacity-50"
                                    >
                                        {loading ? "Syncing..." : (currentDateIndex < datesToHandle.length - 1 ? "Next Schedule" : "Finalize & Notify")}
                                        {!loading && <ChevronRight size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminTimetableAdjustments;
