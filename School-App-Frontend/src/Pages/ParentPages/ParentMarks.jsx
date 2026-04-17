import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../apiConfig";
import { 
  BarChart3, 
  TrendingUp, 
  BookOpen, 
  Award, 
  ChevronRight,
  ChevronLeft,
  Search,
  Download,
  CheckCircle2
} from "lucide-react";


export default function ParentMarks() {
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [marksData, setMarksData] = useState([]);
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
      setMarksData(res.data.data.marks);
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

  const calculateOverallAvg = () => {
    if (!marksData.length) return 0;
    const totals = marksData.map(m => (m.marksObtained / m.totalMarks) * 100);
    const sum = totals.reduce((a, b) => a + b, 0);
    return Math.round(sum / marksData.length);
  };

  const overallAvg = calculateOverallAvg();

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Academic Performance</h1>
          <p className="text-gray-500 font-medium">Detailed results and performance tracking for your children.</p>
        </div>
      </div>

      {/* ── CHILD SELECTION ── */}
      <div className="flex flex-wrap gap-4">
        {children.map((child) => (
          <button
            key={child._id}
            onClick={() => handleChildChange(child._id)}
            className={`flex items-center gap-4 px-6 py-4 rounded-[2rem] transition-all border ${
              selectedChildId === child._id 
              ? "bg-white border-indigo-600 text-indigo-700 shadow-xl shadow-indigo-100/50 scale-105" 
              : "bg-gray-50 border-gray-100 text-gray-500 hover:bg-white hover:border-indigo-200"
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${selectedChildId === child._id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-gray-200 text-gray-400'}`}>
              {child.name[0]}
            </div>
            <div className="text-left">
               <p className="text-sm font-black tracking-tight leading-tight">{child.name}</p>
               <p className="text-[10px] uppercase font-bold tracking-widest opacity-60">Class {child.class}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* ── PERFORMANCE OVERVIEW ── */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-50 text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
              <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-all duration-500">
                 <TrendingUp size={36} />
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Overall Average</p>
              <h4 className="text-5xl font-black text-gray-900 tracking-tighter">{overallAvg}%</h4>
              <p className="text-xs font-bold text-emerald-500 mt-4 flex items-center justify-center gap-1 leading-none">
                 <CheckCircle style={{ width: '12px' }}/> Satisfactory Performance
              </p>
           </div>

           <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-50 space-y-6">
              <h5 className="text-xs font-black text-gray-400 uppercase tracking-widest">Performance Insights</h5>
              <div className="space-y-4">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                       <Award size={20} />
                    </div>
                    <div>
                       <p className="text-sm font-bold text-gray-800">Top Subject</p>
                       <p className="text-xs text-gray-500 font-medium">Mathematics (98%)</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                       <BookOpen size={20} />
                    </div>
                    <div>
                       <p className="text-sm font-bold text-gray-800">Recent Exam</p>
                       <p className="text-xs text-gray-500 font-medium">Midterm Examination</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* ── RESULTS TABLE ── */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-gray-100 border border-gray-50">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shadow-sm">
                      <BarChart3 size={24} />
                   </div>
                   <h3 className="text-2xl font-black text-gray-800 tracking-tight">Examination Results</h3>
                </div>
                
                <div className="flex gap-2">
                   <button className="p-3 bg-gray-50 text-gray-400 hover:text-indigo-600 rounded-xl transition cursor-pointer"><Search size={18}/></button>
                   <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95">
                      <Download size={16} /> DOWNLOAD REPORT
                   </button>
                </div>
             </div>

             {loading && !marksData.length ? (
               <div className="flex justify-center items-center h-80">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
               </div>
             ) : marksData.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-80 text-center space-y-6">
                  <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
                     <BookOpen size={48} />
                  </div>
                  <h4 className="text-xl font-bold text-gray-400 italic">No academic results available yet.</h4>
               </div>
             ) : (
               <div className="overflow-x-auto">
                 <table className="w-full">
                    <thead>
                       <tr className="border-b-2 border-gray-50 text-[11px] font-black text-gray-400 uppercase tracking-[0.15em]">
                          <th className="text-left py-4">Subject Name</th>
                          <th className="text-center py-4">Assessment</th>
                          <th className="text-center py-4">Obtained</th>
                          <th className="text-center py-4">Total</th>
                          <th className="text-right py-4">Status / Grade</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                       {marksData.map((mark, i) => (
                         <tr key={i} className="group hover:bg-gray-50/50 transition-colors duration-200">
                            <td className="py-6">
                               <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-white rounded-xl border border-gray-100 flex items-center justify-center font-bold text-gray-800 shadow-sm group-hover:border-indigo-200 group-hover:text-indigo-600 transition-all">
                                     {mark.subject[0]}
                                  </div>
                                  <span className="font-bold text-gray-700 tracking-tight">{mark.subject}</span>
                               </div>
                            </td>
                            <td className="py-6 text-center">
                               <span className="px-4 py-1.5 bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-full">{mark.examType}</span>
                            </td>
                            <td className="py-6 text-center font-black text-gray-900 text-lg tracking-tight">{mark.marksObtained}</td>
                            <td className="py-6 text-center font-black text-gray-400">/{mark.totalMarks}</td>
                            <td className="py-6 text-right">
                               <div className="flex flex-col items-end gap-1">
                                  <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                     <div className="h-full bg-indigo-600" style={{ width: `${(mark.marksObtained/mark.totalMarks)*100}%` }}></div>
                                  </div>
                                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Excellent • {Math.round((mark.marksObtained/mark.totalMarks)*100)}%</span>
                               </div>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
