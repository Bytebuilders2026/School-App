import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../apiConfig";
import { 
  Users, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2, 
  MessageSquareQuote, 
  ArrowUpRight,
  Wallet
} from "lucide-react";


export default function ParentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/parent-portal/dashboard`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="w-10 h-10 border-4 border-[#8884d8] border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-slate-500 text-xs font-bold uppercase tracking-widest animate-pulse">Initializing Portal...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700 max-w-6xl mx-auto">
      {/* ── WELCOME HEADER (Compact & Dark-ish Gradient) ── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-white/10 transition-all duration-700"></div>
         <div className="relative z-10 space-y-2">
            <h2 className="text-2xl font-black tracking-tight">Welcome, {data?.parentName}!</h2>
            <p className="text-slate-400 text-sm font-medium">Monitoring academic excellence for your family.</p>
         </div>
      </div>

      {/* ── CHILDREN LIST (Smaller Boxes) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data?.children.map((child, i) => (
          <div key={i} className="bg-white rounded-[1.5rem] p-6 shadow-lg shadow-slate-200/50 border border-slate-100 flex flex-col sm:flex-row gap-6 hover:border-[#8884d8]/30 transition-all duration-300 group">
             {/* LEFT: Profile (Smaller) */}
             <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-inner">
                  {child.name[0]}
                </div>
                <div className="space-y-0.5">
                   <h3 className="text-sm font-black text-slate-800">{child.name}</h3>
                   <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{child.class} - {child.section}</p>
                </div>
                <button 
                  onClick={() => navigate("/parent/children")}
                  className="mt-1 w-full px-3 py-1.5 bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-500 text-[10px] font-black rounded-lg transition-all flex items-center justify-center gap-1.5 group/btn"
                >
                  Profile <ArrowUpRight size={12} />
                </button>
             </div>

             {/* RIGHT: Stats Grid (Compact) */}
             <div className="flex-1 grid grid-cols-2 gap-3">
                <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/30 space-y-1.5">
                   <div className="flex items-center justify-between">
                      <p className="text-[8px] font-black text-emerald-600 uppercase tracking-wider">Attendance</p>
                      <CheckCircle2 size={12} className="text-emerald-500" />
                   </div>
                   <p className="text-lg font-black text-emerald-700">{child.attendancePercentage}%</p>
                   <div className="w-full h-1 bg-emerald-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${child.attendancePercentage}%` }}></div>
                   </div>
                </div>

                <div className={`p-4 rounded-2xl border space-y-1.5 ${child.isFeeOverdue ? 'bg-rose-50 border-rose-100' : 'bg-indigo-50 border-indigo-100'}`}>
                   <div className="flex items-center justify-between">
                      <p className={`text-[8px] font-black uppercase tracking-wider ${child.isFeeOverdue ? 'text-rose-600' : 'text-indigo-600'}`}>Fee Status</p>
                      {child.isFeeOverdue ? <AlertCircle size={12} className="text-rose-500" /> : <Wallet size={12} className="text-indigo-500" />}
                   </div>
                   <p className={`text-sm font-black uppercase ${child.isFeeOverdue ? 'text-rose-700' : 'text-indigo-700'}`}>{child.feeStatus}</p>
                   <p className={`text-[8px] font-bold italic ${child.isFeeOverdue ? 'text-rose-400' : 'text-indigo-400'}`}>
                      {child.isFeeOverdue ? "Overdue" : "Up to date"}
                   </p>
                </div>

                <div className="col-span-2 p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-2">
                   <div className="flex items-center justify-between">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Latest Remark</p>
                      <MessageSquareQuote size={12} className="text-slate-300" />
                   </div>
                   <p className="text-[11px] text-slate-600 font-medium italic line-clamp-2 leading-relaxed">"{child.lastRemark}"</p>
                </div>
             </div>
          </div>
        ))}
      </div>

      {data?.children.length === 0 && (
        <div className="col-span-full bg-slate-50 rounded-[2rem] p-16 text-center border-2 border-dashed border-slate-200">
           <Users size={32} className="mx-auto mb-4 text-slate-300" />
           <h3 className="text-lg font-black text-slate-800 tracking-tight">No children linked</h3>
           <p className="text-slate-500 text-xs mt-1">Contact admin to link your children.</p>
        </div>
      )}
    </div>
  );
}
