import React, { useState, useEffect } from "react";
import axios from "axios";
import StudentSidebar from "../../Layouts/StudentSidebar";
import { Award, BookOpen, Calculator, Info } from "lucide-react";
import { API_BASE_URL } from "../../apiConfig";

export default function StudentResult() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const token = localStorage.getItem("token");
      // Use the existing results by student endpoint if available, or fetch all and filter
      const res = await axios.get(`${API_BASE_URL}/student-portal/marks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResults(res.data || []);
    } catch (err) {
      console.error("Scale to fetch results", err);
    } finally {
      setLoading(false);
    }
  };

  // Group by Exam Type
  const groupedResults = results.reduce((acc, curr) => {
    if (!acc[curr.examType]) acc[curr.examType] = [];
    acc[curr.examType].push(curr);
    return acc;
  }, {});

  if (loading) {
    return (
      <StudentSidebar>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-10 h-10 border-4 border-[#8884d8] border-t-transparent rounded-full animate-spin" />
        </div>
      </StudentSidebar>
    );
  }

  return (
    <StudentSidebar>
      <div className="space-y-6 pb-12">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Academic Results</h1>
            <p className="text-sm text-gray-400">View your subject-wise scores and grades</p>
          </div>
          <div className="bg-white p-3 px-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
             <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                <Award size={20} />
             </div>
             <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Enrollment Status</p>
                <p className="text-sm font-bold text-gray-700">Active Student</p>
             </div>
          </div>
        </div>

        {results.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-gray-100 flex flex-col items-center justify-center text-center">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                <Calculator size={32} />
             </div>
             <h3 className="text-lg font-bold text-gray-700">No results found</h3>
             <p className="text-sm text-gray-400 mt-1 max-w-xs">Your academic results have not been uploaded by the teachers yet. Please check back later.</p>
          </div>
        ) : (
          Object.keys(groupedResults).map(examType => (
            <div key={examType} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
               <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                  <div className="p-2 bg-[#8884d8] text-white rounded-xl">
                     <BookOpen size={18} />
                  </div>
                  <h2 className="font-bold text-gray-700">{examType} Examination</h2>
               </div>
               
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/30 border-b border-gray-100">
                           <th className="p-5 px-6">Subject</th>
                           <th className="p-5 px-6 text-center">Marks Obtained</th>
                           <th className="p-5 px-6 text-center">Total Marks</th>
                           <th className="p-5 px-6 text-center">Percentage</th>
                           <th className="p-5 px-6 text-center">Grade</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                        {groupedResults[examType].map((res, i) => {
                           const percentage = ((res.marksObtained / res.totalMarks) * 100).toFixed(1);
                           return (
                              <tr key={i} className="hover:bg-gray-50/50 transition">
                                 <td className="p-5 px-6 font-bold text-gray-700">{res.subject}</td>
                                 <td className="p-5 px-6 text-center font-bold text-gray-600">{res.marksObtained}</td>
                                 <td className="p-5 px-6 text-center font-medium text-gray-400">{res.totalMarks}</td>
                                 <td className="p-5 px-6 text-center">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${Number(percentage) < 40 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                       {percentage}%
                                    </span>
                                 </td>
                                 <td className="p-5 px-6 text-center font-black text-[#8884d8]">{res.grade || "N/A"}</td>
                              </tr>
                           );
                        })}
                     </tbody>
                  </table>
               </div>
            </div>
          ))
        )}

        {/* Tip Section */}
        <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 flex gap-4 items-start">
           <Info className="text-blue-500 mt-1 shrink-0" size={20} />
           <p className="text-sm text-blue-700 font-medium leading-relaxed">
              These results are generated by your subject teachers. If you find any discrepancies in your marks or grades, please contact the respective teacher or the administration office immediately.
           </p>
        </div>
      </div>
    </StudentSidebar>
  );
}
