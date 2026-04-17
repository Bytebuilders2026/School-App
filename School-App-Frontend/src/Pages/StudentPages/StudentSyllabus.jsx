import { useState, useEffect } from "react";
import axios from "axios";
import StudentSidebar from "../../Layouts/StudentSidebar";
import { BookOpen, Link, FileText } from "lucide-react";

import { API_BASE_URL } from "../../apiConfig";

const API = API_BASE_URL;

export default function StudentSyllabus() {
  const [syllabusList, setSyllabusList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fallback testing logic. The logged in student should ideally have Class stored, but let's assume "10th" for demo if not found
  const studentClass = localStorage.getItem("studentClass") || "10th";

  useEffect(() => {
    fetchSyllabus();
  }, []);

  const fetchSyllabus = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/syllabus/class/${studentClass}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSyllabusList(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StudentSidebar>
      <div className="space-y-6">
        <div>
           <h1 className="text-2xl font-bold text-gray-800">Class Syllabus</h1>
           <p className="text-sm text-gray-400 mt-1">Review topics and download curriculum documents</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
             <div className="w-10 h-10 border-4 border-[#8884d8] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : syllabusList.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-gray-100 text-gray-400">
             <BookOpen size={48} strokeWidth={1} className="mb-4 text-gray-300" />
             <p className="font-medium text-[15px]">No syllabus uploaded for your class yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
             {syllabusList.map((item) => (
                <div key={item._id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition">
                    <div className="w-10 h-10 bg-[#8884d8]/10 text-[#8884d8] rounded-xl flex items-center justify-center mb-4">
                       <FileText size={20} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#8884d8]">
                       {item.subject}
                    </span>
                    <h3 className="font-bold text-gray-800 text-lg mt-1 mb-3 leading-tight">{item.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed min-h-[60px] line-clamp-3">
                       {item.description}
                    </p>
                    
                    {item.fileUrl && (
                       <a 
                          href={item.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="mt-6 flex items-center justify-center gap-2 w-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold p-3 rounded-xl text-sm transition border border-gray-100"
                        >
                          <Link size={16} className="text-[#8884d8]" /> View Resource
                       </a>
                    )}
                </div>
             ))}
          </div>
        )}
      </div>
    </StudentSidebar>
  );
}
