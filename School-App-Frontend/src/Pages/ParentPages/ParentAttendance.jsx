import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../apiConfig";
import { 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Users,
  BarChart3,
  Search
} from "lucide-react";

export default function ParentAttendance() {
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/parent-portal/dashboard`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setChildren(res.data.data.children);
      if (res.data.data.children.length > 0) {
        setSelectedChildId(res.data.data.children[0]._id);
        fetchChildDetails(res.data.data.children[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChildDetails = async (childId) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/parent-portal/child/${childId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAttendanceData(res.data.data.attendance);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChildChange = (id) => {
    setSelectedChildId(id);
    fetchChildDetails(id);
  };

  const calculateStats = () => {
    if (!attendanceData.length) return { present: 0, absent: 0, percentage: 0 };
    const present = attendanceData.filter(a => a.status === 'present').length;
    const absent = attendanceData.filter(a => a.status === 'absent').length;
    const leave = attendanceData.filter(a => a.status === 'leave').length;
    const percentage = Math.round((present / attendanceData.length) * 100);
    return { present, absent, leave, percentage };
  };

  const stats = calculateStats();

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Attendance Tracking</h1>
          <p className="text-gray-500 font-medium">Monitor your children's daily presence and punctuality.</p>
        </div>
      </div>

      {/* ── CHILD SELECTION TABS ── */}
      <div className="flex flex-wrap gap-4">
        {children.map((child) => (
          <button
            key={child._id}
            onClick={() => handleChildChange(child._id)}
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all border ${
              selectedChildId === child._id 
              ? "bg-white border-[#8884d8] text-[#7169c9] shadow-xl shadow-[#8884d8]/10 scale-105" 
              : "bg-gray-50 border-gray-100 text-gray-500 hover:bg-white hover:border-[#8884d8]/30"
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${selectedChildId === child._id ? 'bg-[#8884d8] text-white' : 'bg-gray-200 text-gray-400'}`}>
              {child.name[0]}
            </div>
            <div className="text-left">
               <p className="text-sm font-bold leading-tight">{child.name}</p>
               <p className="text-[10px] uppercase font-bold tracking-widest opacity-60">{child.class} - {child.section}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* ── STATS CARDS ── */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-50 text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400"></div>
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-500">
                 <BarChart3 size={28} />
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Attendance Rate</p>
              <h4 className="text-4xl font-black text-emerald-700">{stats.percentage}%</h4>
           </div>

           <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-2xl">
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Present</p>
                 <p className="text-2xl font-black text-emerald-600">{stats.present}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-2xl">
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Absent</p>
                 <p className="text-2xl font-black text-rose-600">{stats.absent}</p>
              </div>
           </div>

           <div className="bg-[#8884d8] p-8 rounded-[2.5rem] shadow-2xl shadow-[#8884d8]/10 text-white space-y-4">
              <div className="flex items-center gap-3">
                 <Calendar className="opacity-50" />
                 <p className="text-sm font-bold">Monthly Policy</p>
              </div>
              <p className="text-xs text-[#8884d8]/20 leading-relaxed font-medium">
                Consistent attendance above 75% is required for mid-term eligibility. Please ensure timely leaves.
              </p>
           </div>
        </div>

        {/* ── ATTENDANCE LIST ── */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl border border-gray-50 min-h-[500px]">
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                   <div className="p-3 bg-gray-50 text-[#8884d8] rounded-2xl">
                      <Clock size={20} />
                   </div>
                   <h3 className="text-xl font-bold text-gray-800">Recent Logs</h3>
                </div>
                <div className="relative hidden md:block w-64">
                   <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                   <input 
                    type="text" 
                    placeholder="Search logs..." 
                    className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-10 pr-4 text-xs font-bold text-gray-600 focus:ring-2 focus:ring-[#8884d8]/20 transition-all outline-none"
                   />
                </div>
             </div>

             {loading ? (
               <div className="flex flex-col items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#8884d8]"></div>
               </div>
             ) : attendanceData.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                     <Calendar size={30} />
                  </div>
                  <h4 className="text-lg font-bold text-gray-400 italic">No attendance records found.</h4>
               </div>
             ) : (
               <div className="space-y-4">
                  {attendanceData.map((log, i) => (
                    <div key={i} className="flex items-center justify-between p-6 bg-gray-50/50 rounded-[2rem] border border-gray-50 hover:bg-white hover:border-[#8884d8]/20 hover:shadow-lg hover:shadow-[#8884d8]/5 transition-all duration-300">
                       <div className="flex items-center gap-6">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black ${
                            log.status === 'present' ? 'bg-emerald-100 text-emerald-600' :
                            log.status === 'absent' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                          }`}>
                            {new Date(log.date).getDate()}
                          </div>
                          <div>
                             <p className="font-bold text-gray-800">{new Date(log.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">
                               Week {Math.ceil(new Date(log.date).getDate() / 7)} Log
                             </p>
                          </div>
                       </div>
                       
                       <div className="flex items-center gap-6">
                          <div className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 ${
                            log.status === 'present' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                            log.status === 'absent' ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-amber-100 text-amber-700 border-amber-200'
                          }`}>
                            {log.status === 'present' ? <CheckCircle2 size={12}/> : log.status === 'absent' ? <XCircle size={12}/> : <Clock size={12}/>}
                            {log.status}
                          </div>
                          <div className="hidden sm:block text-right">
                             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Marked At</p>
                             <p className="text-xs font-bold text-gray-600">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
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
}
