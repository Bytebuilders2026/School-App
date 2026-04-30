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
        <AdminSidebar>
            <div className="p-0 animate-in fade-in duration-500 pb-4">
                <header className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-2">
                    <div>
                        <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">Substitution Hub</h1>
                        <p className="text-slate-500 mt-1 text-xs md:text-sm font-medium">Coordinate teaching staff for approved leave periods.</p>
                    </div>
                    {selectedLeave && (
                        <button 
                            onClick={() => setSelectedLeave(null)}
                            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold transition-all text-sm md:text-base"
                        >
                            <ArrowLeft size={18} /> Back to Requests
                        </button>
                    )}
                </header>

                {!selectedLeave ? (
                    <div className="space-y-6 md:space-y-8">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Approvals</p>
                                    <h3 className="text-xl font-black text-slate-800 mt-1">{leaves.filter(l => l.status === "Pending").length}</h3>
                                </div>
                                <div className="bg-orange-100 p-2 rounded-lg text-orange-600 shrink-0">
                                    <Clock size={18} />
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Substitutions</p>
                                    <h3 className="text-xl font-black text-slate-800 mt-1">{leaves.filter(l => l.status === "Approved").length}</h3>
                                </div>
                                <div className="bg-blue-100 p-2 rounded-lg text-blue-600 shrink-0">
                                    <Users size={18} />
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completion Rate</p>
                                    <h3 className="text-xl font-black text-slate-800 mt-1">94%</h3>
                                </div>
                                <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600 shrink-0">
                                    <CheckCircle2 size={18} />
                                </div>
                            </div>
                        </div>

                        {/* Leave Table */}
                        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden">
                            <div className="p-4 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <h2 className="text-lg font-black text-slate-800">Leave Applications</h2>
                                <div className="relative w-full md:w-auto">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input 
                                        type="text" 
                                        placeholder="Search teacher..." 
                                        className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-full text-xs focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all w-full md:w-64"
                                    />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead className="bg-slate-100/50 text-slate-500 uppercase text-[9px] font-black tracking-wider border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-3 text-left">Teacher Profile</th>
                                            <th className="px-6 py-3 text-left">Period Range</th>
                                            <th className="px-6 py-3 text-center">Duration</th>
                                            <th className="px-6 py-3 text-left hidden lg:table-cell">Primary Reason</th>
                                            <th className="px-6 py-3 text-center">Coordination</th>
                                            <th className="px-6 py-3 text-right whitespace-nowrap">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {leaves.filter(l => l.status === "Pending").map(leave => (
                                            <tr key={leave._id} className="hover:bg-blue-50/30 transition-colors group">
                                                <td className="px-6 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-md uppercase shrink-0">
                                                            {leave.teacher?.name?.charAt(0)}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="font-extrabold text-slate-900 truncate">{leave.teacher?.name}</div>
                                                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">ID: {leave.teacher?.employeeId}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <div className="flex items-center gap-2 text-slate-600 font-bold text-[10px] bg-white border border-slate-100 px-3 py-1 rounded-lg w-fit shadow-sm whitespace-nowrap">
                                                        {leave.startDate} <ChevronRight size={12} className="text-slate-300" /> {leave.endDate}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3 text-center">
                                                    <span className="bg-slate-900 text-white px-2 py-0.5 rounded text-[9px] font-black tracking-widest uppercase">
                                                        {leave.totalDays} Days
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 max-w-xs hidden lg:table-cell">
                                                    <p className="text-[11px] text-slate-500 font-medium line-clamp-1 italic">"{leave.reason}"</p>
                                                </td>
                                                <td className="px-6 py-3 text-center">
                                                    <button 
                                                        onClick={() => handleReview(leave)}
                                                        className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-[9px] font-black tracking-widest uppercase hover:bg-blue-700 transition-all"
                                                    >
                                                        Review
                                                    </button>
                                                </td>
                                                <td className="px-6 py-3 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button 
                                                            onClick={() => handleQuickApprove(leave)}
                                                            className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors"
                                                            title="Approve without substitutions"
                                                        >
                                                            <CheckCircle2 size={14} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleReject(leave)}
                                                            className="p-1.5 bg-rose-100 text-rose-600 rounded-lg hover:bg-rose-200 transition-colors"
                                                            title="Reject Application"
                                                        >
                                                            <Clock size={14} className="rotate-45" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {leaves.filter(l => l.status === "Pending").length === 0 && (
                                            <tr>
                                                <td colSpan="6" className="p-8 text-center bg-slate-50/20">
                                                    <div className="flex flex-col items-center">
                                                        <div className="relative mb-4">
                                                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg border border-slate-100">
                                                                <CheckCircle2 size={24} className="text-emerald-400" />
                                                            </div>
                                                        </div>
                                                        <h3 className="text-lg font-black text-slate-800 tracking-tight">System Optimized</h3>
                                                        <p className="text-slate-400 font-bold text-xs mt-1 max-w-sm mx-auto leading-relaxed">
                                                            All leave applications have been processed. Currently no pending requests in the queue.
                                                        </p>
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
                    <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom duration-500 pb-12">
                        {/* Review Stepper Header */}
                        <div className="bg-white rounded-2xl md:rounded-[32px] shadow-2xl overflow-hidden border border-slate-200/60 transition-all">
                            <div className="p-6 md:p-10 bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden">
                                <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                                <div className="absolute left-0 bottom-0 w-48 h-48 bg-blue-400/20 rounded-full -ml-10 -mb-10 blur-2xl"></div>
                                
                                <div className="relative z-10">
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                                        <div className="flex items-center gap-4 md:gap-6">
                                            <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-xl md:text-3xl border border-white/30 shrink-0">
                                                {selectedLeave.teacher?.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-2xl md:text-4xl font-black tracking-tighter truncate max-w-[200px] md:max-w-none">{selectedLeave.teacher?.name}</div>
                                                <div className="text-blue-100 font-bold flex items-center gap-2 mt-1 text-sm md:text-base whitespace-nowrap">
                                                    <Calendar size={16} /> 
                                                    Day {currentDateIndex + 1} / {datesToHandle.length} — {datesToHandle[currentDateIndex]}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-left md:text-right w-full md:w-auto flex md:flex-col justify-between items-center md:items-end">
                                            <div className="text-[10px] md:text-sm font-black text-blue-100 uppercase tracking-widest">Process Status</div>
                                            <div className="bg-white/20 backdrop-blur-md px-3 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl font-black text-lg md:text-xl border border-white/20">
                                                {Math.round(((currentDateIndex + 1) / datesToHandle.length) * 100)}%
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="w-full bg-white/10 rounded-full h-2 md:h-3 backdrop-blur-sm border border-white/5">
                                        <div 
                                            className="bg-white h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_20px_rgba(255,255,255,0.5)]" 
                                            style={{ width: `${((currentDateIndex + 1) / datesToHandle.length) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-5 md:p-10">
                                <div className="flex items-start gap-4 md:gap-5 mb-8 md:mb-10 p-5 md:p-6 bg-blue-50 rounded-2xl md:rounded-[28px] border border-blue-100 relative">
                                    <div className="bg-blue-600 text-white p-2.5 md:p-3 rounded-xl md:rounded-2xl shadow-lg shadow-blue-100 shrink-0">
                                        <UserCheck size={20} className="md:w-6 md:h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-base md:text-lg font-black text-blue-900 mb-1">Substitution Engine Online</h4>
                                        <p className="text-xs md:text-sm text-blue-800 leading-relaxed font-medium">
                                            Analysing timetable for suggested available teachers.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-6 md:space-y-8">
                                    <h3 className="text-lg md:text-xl font-black text-slate-800 flex items-center gap-3">
                                        <Clock className="text-blue-600" size={20} /> 
                                        Schedule for {datesToHandle[currentDateIndex]}
                                    </h3>
                                    
                                    <div className="space-y-4">
                                        {currentDaySuggestions?.map((period, index) => (
                                            <div key={index} className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8 p-5 md:p-8 rounded-2xl md:rounded-[28px] bg-[#F8FAFC] border border-slate-100 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-50 transition-all duration-300 group">
                                                <div className="lg:w-[40%]">
                                                    <div className="flex items-center gap-3 mb-2 md:mb-3">
                                                        <span className="bg-slate-900 text-white text-[9px] md:text-[10px] font-black px-2.5 py-1 rounded-full tracking-widest uppercase whitespace-nowrap">
                                                            {period.startTime} - {period.endTime}
                                                        </span>
                                                        <span className="text-blue-600 font-black text-[10px] md:text-sm uppercase tracking-wide truncate">
                                                            {period.subject}
                                                        </span>
                                                    </div>
                                                    <div className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                                                        Class {period.class} — <span className="text-slate-400 font-bold">Sec {period.section}</span>
                                                    </div>
                                                </div>

                                                <div className="flex-1">
                                                    <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 md:mb-3 block">Substitute Allocation</label>
                                                    <div className="relative">
                                                        <select 
                                                            className="w-full bg-white border-slate-200 rounded-xl md:rounded-[20px] px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-bold text-slate-700 outline-none ring-offset-2 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all appearance-none shadow-sm"
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
                                                        <div className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                            <ChevronRight size={18} className="rotate-90" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {currentDaySuggestions?.length === 0 && (
                                            <div className="text-center py-12 md:py-16 bg-emerald-50 text-emerald-700 rounded-2xl md:rounded-[32px] border-2 border-dashed border-emerald-200">
                                                <div className="text-3xl md:text-4xl mb-3 md:mb-4">✅</div>
                                                <p className="text-lg md:text-xl font-black">Free Day!</p>
                                                <p className="text-sm font-bold opacity-75 px-6 text-center">This teacher has no lectures scheduled for this date.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-8 md:mt-12 flex flex-col md:flex-row justify-between items-center gap-6 pt-6 md:pt-10 border-t border-slate-100">
                                    <button 
                                        onClick={() => setSelectedLeave(null)}
                                        className="text-slate-400 font-black text-[10px] md:text-xs tracking-widest uppercase hover:text-slate-900 transition-colors order-2 md:order-1"
                                    >
                                        Discard Process
                                    </button>
                                    <button 
                                        onClick={handleNextDate}
                                        disabled={loading}
                                        className="w-full md:w-auto bg-slate-900 text-white px-6 md:px-10 py-4 md:py-5 rounded-xl md:rounded-[24px] font-black text-xs md:text-sm tracking-[0.15em] md:tracking-[0.2em] uppercase hover:bg-blue-600 hover:shadow-2xl hover:shadow-blue-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50 order-1 md:order-2"
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
        </AdminSidebar>
    );
};

export default AdminTimetableAdjustments;
