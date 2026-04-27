import React, { useState, useEffect } from "react";
import TeacherSidebar from "../../Layouts/TeacherSidebar";
import axiosInstance from "../../axiosInstance";
import { 
  PlusCircle, 
  Clock, 
  Calendar, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Users,
  Bell,
  ArrowRight
} from "lucide-react";

const TeacherLeavePanel = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [teacherId, setTeacherId] = useState(""); 
  const [substitutions, setSubstitutions] = useState([]);
  const [studentLeaves, setStudentLeaves] = useState([]);
  const [myLeaves, setMyLeaves] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      let profile = JSON.parse(localStorage.getItem("profile") || "null");
      
      // If profile is missing (e.g. user was logged in before our fix)
      if (!profile) {
        const res = await axiosInstance.get("/teacher/me");
        profile = res.data;
        localStorage.setItem("profile", JSON.stringify(profile));
      }

      if (profile) {
        setTeacherId(profile._id);
        fetchSubstitutions(profile._id);
      }
      
      fetchStudentLeaves();
      fetchMyLeaves();
    } catch (err) {
      console.error("Failed to initialize teacher panel", err);
      // Even if profile fails, we can still try to fetch leaves (backend handles it)
      fetchStudentLeaves();
      fetchMyLeaves();
    }
  };

  const fetchSubstitutions = async (id) => {
    try {
      const res = await axiosInstance.get(`/autotimetable/substitutions/${id}`);
      setSubstitutions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudentLeaves = async () => {
    try {
      const res = await axiosInstance.get("/leave/student/all");
      setStudentLeaves(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMyLeaves = async () => {
      try {
          const res = await axiosInstance.get("/leave/teacher/my-leaves");
          setMyLeaves(res.data);
      } catch (err) {
          console.error(err);
      }
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axiosInstance.post("/leave/teacher/request", {
        teacherId, // Can be null, backend will try to find it
        startDate,
        endDate,
        reason
      });
      alert("Application Submitted! Sending to Admin for approval.");
      setStartDate("");
      setEndDate("");
      setReason("");
      fetchMyLeaves();
    } catch (err) {
      console.error(err);
      alert("Failed to submit leave request: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const approveStudentLeave = async (leaveId) => {
    try {
      await axiosInstance.post("/leave/student/approve", { leaveId });
      alert("Leave Approved!");
      fetchStudentLeaves();
    } catch (err) {
      console.error(err);
      alert("Approval failed");
    }
  };

  const rejectStudentLeave = async (leaveId) => {
    try {
      await axiosInstance.post("/leave/reject", { leaveId, type: 'student' });
      alert("Leave Rejected!");
      fetchStudentLeaves();
    } catch (err) {
      console.error(err);
      alert("Rejection failed");
    }
  };

  return (
    <TeacherSidebar>
      <div className="space-y-8">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">Leave Management</h1>
            <p className="text-slate-500 font-medium">Coordinate your absence and manage student request flow.</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto justify-end">
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 text-slate-600 relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-lg">
              T
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Apply Leave Form & Substitutions */}
          <div className="md:col-span-12 lg:col-span-4 space-y-8">
            <div className="bg-white p-6 md:p-10 rounded-[30px] md:rounded-[40px] shadow-2xl shadow-indigo-100 border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
              
              <h2 className="text-xl md:text-2xl font-black text-slate-800 mb-6 md:mb-8 flex items-center gap-3 relative z-10">
                <PlusCircle className="text-indigo-600" size={28} />
                New Application
              </h2>

              <form onSubmit={handleLeaveSubmit} className="space-y-6 relative z-10">
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">From</label>
                            <input 
                                type="date"
                                required
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">To</label>
                            <input 
                                type="date"
                                required
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Reason for absence</label>
                        <textarea 
                            required
                            rows={3}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-medium focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                            placeholder="Please provide details..."
                        />
                    </div>
                </div>
                
                <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-br from-indigo-600 to-indigo-700 text-white font-black py-4 md:py-5 rounded-2xl md:rounded-3xl hover:shadow-2xl hover:shadow-indigo-200 transform hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                    {loading ? "Transmitting..." : "Submit to Admin"}
                    {!loading && <ArrowRight size={18} />}
                </button>
              </form>
            </div>

            {/* Substitution Alert */}
            <div className="bg-slate-900 p-6 md:p-8 rounded-[30px] md:rounded-[40px] shadow-2xl text-white relative overflow-hidden">
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-10 -mb-10"></div>
                <h3 className="text-lg md:text-xl font-black mb-6 flex items-center gap-3 text-white">
                    <Clock className="text-indigo-400" size={24} />
                    Active Substitutions
                </h3>
                
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar text-white">
                    {substitutions.length === 0 ? (
                        <p className="text-slate-400 font-medium italic">No substitution tasks assigned to you currently.</p>
                    ) : (
                        substitutions.map(sub => (
                            <div key={sub._id} className="bg-white/10 border border-white/20 p-5 rounded-2xl md:rounded-3xl hover:bg-white/20 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="bg-indigo-500/30 text-indigo-100 font-black text-[10px] px-2.5 py-1 rounded-full uppercase">
                                        Class {sub.class}-{sub.section}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400">{sub.date}</span>
                                </div>
                                <div className="font-bold text-lg mb-1 text-white">{sub.subject}</div>
                                <div className="text-xs text-slate-400 flex items-center gap-2">
                                    <Clock size={12} /> {sub.periodStartTime} - {sub.periodEndTime}
                                </div>
                                <p className="text-[10px] text-slate-500 mt-2 italic">Substitute for: {sub.absentTeacher?.name}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
          </div>

          {/* Activity Logs */}
          <div className="md:col-span-12 lg:col-span-8 space-y-8">
            
            {/* My Leaves History */}
            <div className="bg-white p-6 md:p-10 rounded-[30px] md:rounded-[40px] shadow-xl border border-slate-100">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <h2 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-3">
                        <FileText className="text-indigo-600" size={28} />
                        My Application Status
                    </h2>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{myLeaves.length} Records</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myLeaves.length === 0 ? (
                        <div className="col-span-2 text-center py-10 text-slate-400 italic">No leave history found.</div>
                    ) : (
                        myLeaves.map(leave => (
                            <div key={leave._id} className="bg-slate-50 border border-slate-100 p-6 rounded-2xl md:rounded-3xl hover:border-indigo-200 transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-100 text-[10px] font-bold text-slate-500 flex items-center gap-2">
                                        <Calendar size={12} /> {leave.startDate}
                                    </div>
                                    <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                        leave.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                                        leave.status === 'Rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                        {leave.status}
                                    </span>
                                </div>
                                <p className="text-sm font-bold text-slate-700 mt-2 line-clamp-2">“{leave.reason}”</p>
                                <p className="text-[10px] font-black text-slate-400 mt-4 uppercase">{leave.totalDays} Day(s) Requested</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Student Requests Flow */}
            <div className="bg-white p-6 md:p-10 rounded-[30px] md:rounded-[40px] shadow-xl border border-slate-100">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <h2 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-3">
                        <Users className="text-indigo-600" size={28} />
                        Student Intake Request
                    </h2>
                    <div className="bg-amber-100 text-amber-700 px-4 py-1 rounded-full text-[10px] font-black">
                        {studentLeaves.filter(l => l.status === "Pending").length} NEW
                    </div>
                </div>

                <div className="space-y-4">
                    {studentLeaves.length === 0 ? (
                        <div className="text-center py-10 md:py-20 bg-slate-50 rounded-[30px] md:rounded-[40px] border-2 border-dashed border-slate-200">
                            <Users className="mx-auto text-slate-300 mb-4" size={48} />
                            <p className="text-slate-400 font-bold">No student requests for your sections.</p>
                        </div>
                    ) : (
                        studentLeaves.map(leave => (
                            <div key={leave._id} className={`p-5 md:p-6 rounded-[24px] md:rounded-[32px] border transition-all ${leave.status === 'Pending' ? 'bg-indigo-50/50 border-indigo-100 shadow-sm' : 'bg-white border-slate-100 opacity-60'}`}>
                                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white shadow-sm flex items-center justify-center font-black text-lg md:text-xl text-indigo-600">
                                            {leave.student?.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-800 text-base md:text-lg uppercase tracking-tight">{leave.student?.name}</h3>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                                Roll {leave.student?.rollNumber} • Class {leave.class}-{leave.section}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="w-full xl:max-w-xs">
                                        <div className="text-xs font-bold text-indigo-900 bg-white border border-indigo-100 px-4 py-2 rounded-xl md:rounded-2xl mb-1">
                                           {leave.startDate} to {leave.endDate}
                                        </div>
                                        <p className="text-xs text-slate-500 italic px-2 line-clamp-2">"{leave.reason}"</p>
                                    </div>

                                    <div className="flex gap-2 w-full xl:w-auto justify-end">
                                        {leave.status === 'Pending' ? (
                                            <>
                                                <button 
                                                    onClick={() => approveStudentLeave(leave._id)}
                                                    className="p-3 rounded-xl md:rounded-2xl bg-emerald-500 text-white hover:bg-emerald-600 transition shadow-lg shadow-emerald-100 flex-1 sm:flex-none flex justify-center"
                                                >
                                                    <CheckCircle size={20} />
                                                </button>
                                                <button 
                                                    onClick={() => rejectStudentLeave(leave._id)}
                                                    className="p-3 rounded-xl md:rounded-2xl bg-slate-200 text-slate-600 hover:bg-slate-300 transition flex-1 sm:flex-none flex justify-center"
                                                >
                                                    <XCircle size={20} />
                                                </button>
                                            </>
                                        ) : (
                                            <span className={`px-4 py-2 rounded-xl md:rounded-2xl text-[10px] font-black uppercase tracking-widest ${
                                                leave.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                            }`}>
                                                {leave.status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
          </div>
          
        </div>
      </div>
    </TeacherSidebar>
  );
};

export default TeacherLeavePanel;
