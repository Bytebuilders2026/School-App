import React, { useState, useEffect } from "react";
import axios from "axios";
import { Award, BookOpen, Calculator, Info } from "lucide-react";
import { API_BASE_URL } from "../../apiConfig";

export default function ParentMarks() {
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [results, setResults] = useState([]);
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
      setResults(res.data.data.marks);
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

  // Group by Exam Type
  const groupedResults = results.reduce((acc, curr) => {
    if (!acc[curr.examType]) acc[curr.examType] = [];
    acc[curr.examType].push(curr);
    return acc;
  }, {});

  const selectedChild = children.find(c => c._id === selectedChildId);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Academic Results</h1>
          <p className="text-sm text-gray-400">View subject-wise scores and grades for your children</p>
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

      {/* Child Selection */}
      <div className="flex flex-wrap gap-3">
        {children.map((child) => (
          <button
            key={child._id}
            onClick={() => handleChildChange(child._id)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${
              selectedChildId === child._id 
              ? "bg-[#8884d8] border-[#8884d8] text-white shadow-md shadow-[#8884d8]/20" 
              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {child.name} ({child.class}-{child.section})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[40vh]">
          <div className="w-10 h-10 border-4 border-[#8884d8] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : results.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-100 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
              <Calculator size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-700">No results found</h3>
            <p className="text-sm text-gray-400 mt-1 max-w-xs">Academic results have not been uploaded for {selectedChild?.name} yet. Please check back later.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.keys(groupedResults).map(examType => (
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
          ))}
        </div>
      )}

      {/* Tip Section */}
      <div className="-[#8884d8]/10/50 p-6 rounded-3xl border -[#8884d8]/20 flex gap-4 items-start">
          <Info className="-[#8884d8]/80 mt-1 shrink-0" size={20} />
          <p className="text-sm text-[#7169c9] font-medium leading-relaxed">
            These results are generated by subject teachers. If you find any discrepancies in marks or grades, please contact the respective teacher or the administration office immediately.
          </p>
      </div>
    </div>
  );
}
