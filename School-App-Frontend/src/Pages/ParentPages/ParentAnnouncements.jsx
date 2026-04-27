import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../apiConfig";
import { 
  Megaphone, 
  Calendar, 
  Clock, 
  BellRing, 
  AlertCircle,
  CheckCircle2
} from "lucide-react";

export default function ParentAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/notifications/mine`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAnnouncements(res.data || []);
      // Auto-mark all as read if we open the page
      await axios.patch(`${API_BASE_URL}/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">Announcements</h1>
          <p className="text-gray-500 font-medium">Important school updates, events, and broadcast messages.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ── SUMMARY CARD ── */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-gradient-to-br from-[#8884d8]/60 to-[#8884d8] p-10 rounded-[2.5rem] shadow-2xl -[#8884d8]/20 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                 <Megaphone size={120} />
              </div>
              <div className="relative z-10 space-y-6">
                 <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                    <BellRing size={28} />
                 </div>
                 <h3 className="text-2xl font-bold leading-tight tracking-tight">Stay Updated</h3>
                 <p className="-[#8884d8]/10 text-sm font-medium leading-relaxed">
                    Check this board regularly for school-wide announcements, holidays, and critical updates regarding your children.
                 </p>
                 <div className="pt-4">
                    <div className="inline-flex px-4 py-2 bg-white/20 rounded-full items-center gap-2 text-xs font-bold shadow-inner">
                        <CheckCircle2 size={16} /> All systems operational
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* ── ANNOUNCEMENTS FEED ── */}
        <div className="lg:col-span-2 space-y-6">
           {loading ? (
             <div className="bg-white rounded-[2.5rem] p-20 flex justify-center items-center shadow-xl border border-gray-50">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 -[#8884d8]/80"></div>
             </div>
           ) : announcements.length === 0 ? (
             <div className="bg-white rounded-[2.5rem] p-20 text-center border-2 border-dashed border-gray-100 shadow-xl">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                   <Megaphone size={40} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 tracking-tight">No Announcements</h3>
                <p className="text-gray-500 mt-2 max-w-xs mx-auto text-sm">You're all caught up! There are no new announcements at this time.</p>
             </div>
           ) : (
             <div className="space-y-6">
                {announcements.map((announcement, i) => (
                  <div key={i} className={`bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl border transition-all duration-300 group ${!announcement.isRead ? 'border-[#8884d8]/60 -[#8884d8]/10' : 'border-gray-50 hover:border-gray-100'}`}>
                     <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6 pb-6 border-b border-gray-50">
                        <div className="flex items-center gap-4">
                           <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-inner group-hover:scale-105 transition-all duration-500 ${announcement.type === 'performance_alert' ? 'bg-rose-500' : 'bg-[#8884d8]'}`}>
                              {announcement.type === 'performance_alert' ? <AlertCircle size={24} /> : <Megaphone size={24} />}
                           </div>
                           <div>
                              <p className="text-lg font-black text-gray-800 tracking-tight">{announcement.title}</p>
                              <p className={`text-[10px] font-black uppercase tracking-widest leading-none mt-1 ${announcement.type === 'performance_alert' ? 'text-rose-500' : 'text-[#8884d8]'}`}>
                                 {announcement.type === 'performance_alert' ? 'Critical Alert' : 'General Broadcast'}
                              </p>
                           </div>
                        </div>
                        <div className="flex items-center gap-3 px-5 py-2.5 bg-gray-50 rounded-2xl border border-gray-100">
                           <Calendar size={14} className="text-gray-400" />
                           <span className="text-xs font-black text-gray-500 tracking-tight uppercase">{new Date(announcement.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                           <Clock size={14} className="text-gray-400 ml-2" />
                           <span className="text-xs font-black text-gray-500 tracking-tight uppercase">{new Date(announcement.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                     </div>

                     <div className="relative">
                        <p className="text-base text-gray-600 font-medium leading-relaxed whitespace-pre-wrap">
                           {announcement.message}
                        </p>
                     </div>
                  </div>
                ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
