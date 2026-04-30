import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../apiConfig";
import { ClipboardCheck, CheckCircle2, XCircle, Clock, User, ShieldCheck, ArrowRight } from "lucide-react";

export default function ParentGatePass() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/gatepass/parent/pending`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setRequests(res.data.gatePasses);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this request?`)) return;
    try {
      await axios.post(`${API_BASE_URL}/gatepass/parent/${action}/${id}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert(`Request ${action}ed successfully`);
      fetchRequests();
    } catch (err) {
      alert("Action failed");
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-700 max-w-4xl mx-auto">
      {/* Header (Responsive) */}
      <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Gate Pass Approvals</h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Real-time Visitor Verification</p>
        </div>
        <div className="bg-blue-50 px-4 py-2 rounded-xl flex items-center gap-2 border border-blue-100">
           <ShieldCheck className="text-blue-500" size={16} />
           <span className="text-blue-700 font-black text-[10px] uppercase tracking-widest">Active Protection</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {requests.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-12 sm:p-20 text-center border-2 border-dashed border-slate-100">
             <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-500">
                <CheckCircle2 size={32} />
             </div>
             <h3 className="text-lg font-black text-slate-800">System Secure</h3>
             <p className="text-slate-400 mt-2 text-xs font-medium max-w-[240px] mx-auto">No pending visitor requests at the moment.</p>
          </div>
        ) : (
          requests.map((req) => (
            <div key={req._id} className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-xl shadow-slate-200/40 border border-slate-50 flex flex-col lg:flex-row gap-6 lg:gap-8 items-center group hover:border-blue-500/30 transition-all duration-300">
               {/* Child & Timing */}
               <div className="flex items-center gap-4 sm:gap-6 w-full lg:w-1/3">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-lg font-black shrink-0 shadow-lg">
                    {req.student?.name?.[0]}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-black text-slate-800 truncate">{req.student?.name}</h3>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-0.5">{req.student?.class}-{req.student?.section}</p>
                    <div className="mt-1.5 flex items-center gap-1.5 text-slate-400">
                       <Clock size={12} />
                       <span className="text-[10px] font-bold uppercase tracking-tighter">Requested: {new Date(req.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </div>
               </div>

               {/* Visitor & Purpose */}
               <div className="w-full flex-1 bg-slate-50 rounded-2xl p-5 border border-slate-100 flex flex-col sm:flex-row gap-4 sm:gap-6">
                  <div className="flex-1">
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Visitor Identity</p>
                     <div className="space-y-1">
                        <p className="font-black text-slate-800 text-sm flex items-center gap-2">
                           <User size={14} className="text-blue-500" /> {req.visitorName}
                        </p>
                        <p className="text-[10px] text-slate-500 font-bold tracking-widest">{req.visitorPhone}</p>
                     </div>
                  </div>
                  <div className="flex-1 border-t sm:border-t-0 sm:border-l border-slate-200 sm:pl-6 pt-3 sm:pt-0">
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Stated Purpose</p>
                     <p className="text-xs text-slate-600 font-bold italic line-clamp-2 leading-relaxed">"{req.purpose}"</p>
                  </div>
               </div>

               {/* Responsive Actions */}
               <div className="flex gap-3 w-full lg:w-auto">
                  <button 
                    onClick={() => handleAction(req._id, "reject")}
                    className="flex-1 lg:p-4 py-4 bg-slate-100 text-slate-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all duration-300 shadow-sm border border-slate-200 flex items-center justify-center"
                    title="Reject Entry"
                  >
                    <XCircle size={22} className="lg:hidden mr-2" />
                    <XCircle size={24} className="hidden lg:block" />
                    <span className="lg:hidden font-black text-[10px] uppercase">Reject</span>
                  </button>
                  <button 
                    onClick={() => handleAction(req._id, "approve")}
                    className="flex-[2] lg:px-6 lg:py-4 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all duration-300 shadow-lg shadow-blue-200 font-black text-[10px] sm:text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={20} /> Approve Entry
                  </button>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
