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
      <div className="w-12 h-12 border-4 border-[#8884d8] border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-500 font-medium animate-pulse">Loading parent portal...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
      {/* ── WELCOME HEADER ── */}
      <div className="bg-gradient-to-r from-[#8884d8] to-purple-600 p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-white/20 transition-all duration-700"></div>
         <div className="relative z-10 space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Welcome back, {data?.parentName}!</h2>
            <p className="text-white/80 font-medium">Keep track of your children's progress and manage school activities here.</p>
         </div>
      </div>

      {/* ── CHILDREN LIST ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {data?.children.map((child, i) => (
          <div key={i} className="bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-100/50 border border-gray-50 flex flex-col md:flex-row gap-8 hover:border-[#8884d8]/20 transition-all duration-300 group">
             {/* LEFT: Profile & Basic Info */}
             <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-24 h-24 bg-[#8884d8]/10 rounded-[2rem] flex items-center justify-center text-[#8884d8] text-3xl font-bold shadow-inner border border-[#8884d8]/20">
                  {child.name[0]}
                </div>
                <div className="space-y-1">
                   <h3 className="text-xl font-bold text-gray-800">{child.name}</h3>
                   <p className="text-xs font-bold text-[#8884d8]/80 uppercase tracking-widest">{child.class} - {child.section}</p>
                </div>
                <button 
                  className="mt-2 w-full px-4 py-2 bg-gray-50 hover:bg-[#8884d8] hover:text-white text-gray-500 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 group/btn"
                >
                  Full Profile <ArrowUpRight size={14} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                </button>
             </div>

             {/* RIGHT: Stats Grid */}
             <div className="flex-1 grid grid-cols-2 gap-4">
                <div className="p-5 bg-emerald-50/50 rounded-3xl border border-emerald-100/30 space-y-2">
                   <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Attendance</p>
                      <CheckCircle2 size={16} className="text-emerald-500" />
                   </div>
                   <p className="text-2xl font-black text-emerald-700">{child.attendancePercentage}%</p>
                   <div className="w-full h-1 bg-emerald-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${child.attendancePercentage}%` }}></div>
                   </div>
                </div>

                <div className={`p-5 rounded-3xl border space-y-2 ${child.isFeeOverdue ? 'bg-rose-50 border-rose-100' : 'bg-[#8884d8]/10/50 border-[#8884d8]/20/30'}`}>
                   <div className="flex items-center justify-between">
                      <p className={`text-[10px] font-bold uppercase tracking-wider ${child.isFeeOverdue ? 'text-rose-600' : 'text-[#8884d8]'}`}>Fee Status</p>
                      {child.isFeeOverdue ? <AlertCircle size={16} className="text-rose-500" /> : <Wallet size={16} className="text-[#8884d8]/80" />}
                   </div>
                   <p className={`text-xl font-black uppercase ${child.isFeeOverdue ? 'text-rose-700' : 'text-[#7169c9]'}`}>{child.feeStatus}</p>
                   <p className={`text-[9px] font-medium italic ${child.isFeeOverdue ? 'text-rose-400' : 'text-[#8884d8]'}`}>
                      {child.isFeeOverdue ? "Fine accumulating" : "Paid for this month"}
                   </p>
                </div>

                <div className="col-span-2 p-5 bg-gray-50/50 rounded-3xl border border-gray-100 space-y-3">
                   <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Teacher's Last Remark</p>
                      <MessageSquareQuote size={16} className="text-gray-400" />
                   </div>
                   <p className="text-sm text-gray-600 font-medium italic line-clamp-2">"{child.lastRemark}"</p>
                </div>
             </div>
          </div>
        ))}

        {data?.children.length === 0 && (
          <div className="col-span-full bg-white rounded-[2.5rem] p-20 text-center border-2 border-dashed border-gray-100">
             <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                <Users size={40} />
             </div>
             <h3 className="text-xl font-bold text-gray-800">No children linked</h3>
             <p className="text-gray-500 mt-2 max-w-sm mx-auto">Please contact the admin office to link your children's profiles to your parent account.</p>
          </div>
        )}
      </div>
    </div>
  );
}
