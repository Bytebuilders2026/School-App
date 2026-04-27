import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../apiConfig";
import { 
  MessageSquareQuote, 
  User, 
  Calendar, 
  ArrowRight,
  Quote,
  Clock,
  Search
} from "lucide-react";

export default function ParentRemarks() {
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [remarks, setRemarks] = useState([]);
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
        fetchChildRemarks(res.data.data.children[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChildRemarks = async (childId) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/parent-portal/child/${childId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setRemarks(res.data.data.remarks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChildChange = (id) => {
    setSelectedChildId(id);
    fetchChildRemarks(id);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">Teacher's Remarks</h1>
          <p className="text-gray-500 font-medium">Direct feedback and observations from classroom teachers.</p>
        </div>
      </div>

      {/* ── CHILD SELECTION ── */}
      <div className="flex flex-wrap gap-4">
        {children.map((child) => (
          <button
            key={child._id}
            onClick={() => handleChildChange(child._id)}
            className={`flex items-center gap-4 px-6 py-4 rounded-3xl transition-all border ${
              selectedChildId === child._id 
              ? "bg-white border-[#8884d8] text-[#7169c9] shadow-xl shadow-[#8884d8]/10 scale-105" 
              : "bg-gray-50 border-gray-100 text-gray-400 hover:bg-white hover:border-[#8884d8]/30"
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${selectedChildId === child._id ? 'bg-[#8884d8] text-white' : 'bg-gray-200 text-gray-400'}`}>
              {child.name[0]}
            </div>
            <p className="text-sm font-black tracking-tight">{child.name}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ── SUMMARY CARD ── */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-[#8884d8] p-10 rounded-[2.5rem] shadow-2xl shadow-[#8884d8]/10 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                 <Quote size={120} />
              </div>
              <div className="relative z-10 space-y-6">
                 <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                    <MessageSquareQuote size={28} />
                 </div>
                 <h3 className="text-2xl font-bold leading-tight tracking-tight">Parental Engagement</h3>
                 <p className="text-[#8884d8]/20 text-sm font-medium leading-relaxed">
                    Teacher remarks provide insight into behavior, participation, and academic focus. Always discuss these with your child.
                 </p>
                 <div className="pt-4">
                    <div className="flex -space-x-3">
                       {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-[#8884d8] bg-[#8884d8] flex items-center justify-center text-[10px] font-bold">T</div>)}
                       <div className="w-8 h-8 rounded-full border-2 border-[#8884d8] bg-[#7169c9] flex items-center justify-center text-[10px] font-bold">+5</div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-50 space-y-6">
              <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Latest Update</h5>
              {remarks.length > 0 ? (
                <div className="flex items-start gap-4">
                   <div className="p-3 bg-[#8884d8]/10 text-[#8884d8] rounded-xl">
                      <Clock size={16} />
                   </div>
                   <div>
                      <p className="text-sm font-bold text-gray-800">Recent Entry</p>
                      <p className="text-xs text-gray-500 font-medium">{new Date(remarks[0].createdAt).toLocaleDateString()}</p>
                   </div>
                </div>
              ) : <p className="text-xs text-gray-400 italic">No recent updates.</p>}
           </div>
        </div>

        {/* ── REMARKS FEED ── */}
        <div className="lg:col-span-2 space-y-6">
           {loading ? (
             <div className="bg-white rounded-[2.5rem] p-20 flex justify-center items-center shadow-xl border border-gray-50">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#8884d8]"></div>
             </div>
           ) : remarks.length === 0 ? (
             <div className="bg-white rounded-[2.5rem] p-20 text-center border-2 border-dashed border-gray-100 shadow-xl">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                   <MessageSquareQuote size={40} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 tracking-tight">No Remarks Found</h3>
                <p className="text-gray-500 mt-2 max-w-xs mx-auto text-sm">When teachers send feedback about your child, it will appear here.</p>
             </div>
           ) : (
             <div className="space-y-6">
                {remarks.map((remark, i) => (
                  <div key={i} className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl border border-gray-50 hover:border-[#8884d8]/20 transition-all duration-300 group">
                     <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pb-8 border-b border-gray-50">
                        <div className="flex items-center gap-4">
                           <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-[#8884d8] shadow-inner group-hover:bg-[#8884d8] group-hover:text-white transition-all duration-500">
                              <User size={24} />
                           </div>
                           <div>
                              <p className="text-lg font-black text-gray-800 tracking-tight">{remark.teacher?.name}</p>
                              <p className="text-[10px] font-black text-[#8884d8]/80 uppercase tracking-widest leading-none mt-1">Class Teacher / Subject Expert</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-3 px-5 py-2.5 bg-gray-50 rounded-2xl border border-gray-100">
                           <Calendar size={14} className="text-gray-400" />
                           <span className="text-xs font-black text-gray-500 tracking-tight uppercase">{new Date(remark.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                     </div>

                     <div className="relative pl-10">
                        <div className="absolute top-0 left-0 text-[#8884d8]/20 group-hover:text-[#8884d8] transition-colors duration-500">
                           <Quote size={32} />
                        </div>
                        <p className="text-lg text-gray-600 font-medium italic leading-relaxed">
                           {remark.message}
                        </p>
                     </div>

                     <div className="mt-8 flex justify-end">
                        <button className="flex items-center gap-2 text-[10px] font-black text-gray-400 hover:text-[#8884d8] transition-colors tracking-widest uppercase">
                           Acknowledge Receipt <ArrowRight size={12} />
                        </button>
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
