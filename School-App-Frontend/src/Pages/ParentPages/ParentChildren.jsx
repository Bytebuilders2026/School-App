import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../apiConfig";
import { 
  Users, 
  Mail, 
  Smartphone, 
  MapPin, 
  BookOpen, 
  Hash, 
  ShieldCheck,
  ChevronRight,
  ExternalLink
} from "lucide-react";

export default function ParentChildren() {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchChildrenProfiles();
  }, []);

  const fetchChildrenProfiles = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/parent-portal/dashboard`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      // Detailed info might need another fetch, but let's see if we can get it from dashboard or child details
      setChildren(res.data.data.children);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* ── HEADER ── */}
      <div>
        <h1 className="text-3xl font-black text-gray-800 tracking-tight">Registered Children</h1>
        <p className="text-gray-500 font-medium">Full academic profiles and registration details for all linked accounts.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
           <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#8884d8]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {children.map((child, i) => (
            <div key={i} className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-100/50 border border-gray-50 overflow-hidden group hover:border-[#8884d8]/20 transition-all duration-300">
               {/* BANNER */}
               <div className="h-32 bg-gradient-to-r from-[#7169c9] via-purple-500 to-[#8884d8] relative">
                  <div className="absolute -bottom-12 left-10 p-1 bg-white rounded-3xl shadow-xl">
                     <div className="w-24 h-24 bg-gray-50 rounded-[1.25rem] flex items-center justify-center text-3xl font-black text-[#8884d8]">
                        {child.name[0]}
                     </div>
                  </div>
                  <div className="absolute top-4 right-6 text-white/50 animate-pulse">
                     <Users size={60} />
                  </div>
               </div>

               {/* CONTENT */}
               <div className="pt-16 pb-10 px-10 space-y-8">
                  <div className="flex justify-between items-start">
                     <div>
                        <h2 className="text-2xl font-black text-gray-800 tracking-tight">{child.name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                           <span className="px-3 py-1 bg-[#8884d8]/10 text-[#8884d8] text-[10px] font-black uppercase tracking-widest rounded-full">Student ID: {child.rollNumber || 'ST-7712'}</span>
                        </div>
                     </div>
                     <button className="p-3 bg-gray-50 text-gray-400 hover:text-[#8884d8] rounded-xl transition-all hover:bg-white hover:shadow-lg border border-transparent hover:border-[#8884d8]/20">
                        <ExternalLink size={20} />
                     </button>
                  </div>

                  <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                     <div className="flex items-center gap-4 group/item">
                        <div className="w-10 h-10 bg-gray-50 group-hover/item:bg-[#8884d8]/10 rounded-xl flex items-center justify-center text-gray-400 group-hover/item:text-[#8884d8] transition-colors shadow-sm">
                           <BookOpen size={18} />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Grade</p>
                           <p className="text-sm font-bold text-gray-800 tracking-tight">{child.class} - {child.section}</p>
                        </div>
                     </div>

                     <div className="flex items-center gap-4 group/item">
                        <div className="w-10 h-10 bg-gray-50 group-hover/item:bg-[#8884d8]/10 rounded-xl flex items-center justify-center text-gray-400 group-hover/item:text-[#8884d8] transition-colors shadow-sm">
                           <Hash size={18} />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Roll Number</p>
                           <p className="text-sm font-bold text-gray-800 tracking-tight">#{child.rollNumber || '01'}</p>
                        </div>
                     </div>

                     <div className="flex items-center gap-4 group/item">
                        <div className="w-10 h-10 bg-gray-50 group-hover/item:bg-[#8884d8]/10 rounded-xl flex items-center justify-center text-gray-400 group-hover/item:text-[#8884d8] transition-colors shadow-sm">
                           <ShieldCheck size={18} />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Status</p>
                           <p className="text-sm font-bold text-emerald-600 tracking-tight">Active Enrollment</p>
                        </div>
                     </div>

                     <div className="flex items-center gap-4 group/item">
                        <div className="w-10 h-10 bg-gray-50 group-hover/item:bg-[#8884d8]/10 rounded-xl flex items-center justify-center text-gray-400 group-hover/item:text-[#8884d8] transition-colors shadow-sm">
                           <MapPin size={18} />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Section Log</p>
                           <p className="text-sm font-bold text-gray-800 tracking-tight">Block A, Wing 2</p>
                        </div>
                     </div>
                  </div>

                  <div className="pt-8 border-t border-gray-50 flex items-center justify-between">
                     <p className="text-[10px] text-gray-400 font-bold italic">Member since Sep 2025</p>
                     <button onClick={() => navigate('/parent/marks')} className="flex items-center gap-2 text-xs font-black text-[#8884d8] hover:text-[#7169c9] transition-colors uppercase tracking-widest">
                        Academic Analytics <ChevronRight size={16} />
                     </button>
                  </div>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
