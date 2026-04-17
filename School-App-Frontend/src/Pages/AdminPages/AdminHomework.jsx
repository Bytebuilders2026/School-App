import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminSidebar from "../../Layouts/AdminSidebar";
import { BookOpen, Search, FilterX, Trash2 } from "lucide-react";
import { API_BASE_URL } from "../../apiConfig";

const API = API_BASE_URL;
const CLASSES = ["Pre-Nursery", "Nursery", "KG", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];
const SECTIONS = ["A", "B", "C", "D"];

export default function AdminHomework() {
  const [homeworks, setHomeworks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [clsFilter, setClsFilter] = useState("");
  const [secFilter, setSecFilter] = useState("");

  useEffect(() => {
    fetchHomeworks();
  }, [clsFilter, secFilter]);

  const fetchHomeworks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      let url = `${API}/homework/all`;
      const params = new URLSearchParams();
      if (clsFilter) params.append("class", clsFilter);
      if (secFilter) params.append("section", secFilter);
      
      if (params.toString()) url += `?${params.toString()}`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHomeworks(res.data.homeworks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this homework globally?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/homework/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchHomeworks();
    } catch (err) {
      alert("Failed to delete homework");
    }
  };

  return (
    <AdminSidebar>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Global Homework</h1>
            <p className="text-sm text-gray-400 mt-1">View homework assignments across all classes</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-400">Class</span>
            <select 
              className="px-3 py-2 border rounded-xl text-sm focus:border-[#89D4FF] focus:outline-none bg-gray-50"
              value={clsFilter} onChange={(e) => setClsFilter(e.target.value)}
            >
              <option value="">All</option>
              {CLASSES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-400">Section</span>
            <select 
              className="px-3 py-2 border rounded-xl text-sm focus:border-[#89D4FF] focus:outline-none bg-gray-50"
              value={secFilter} onChange={(e) => setSecFilter(e.target.value)}
            >
              <option value="">All</option>
              {SECTIONS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          {(clsFilter || secFilter) && (
            <button 
              onClick={() => { setClsFilter(""); setSecFilter(""); }}
              className="flex items-center gap-1.5 text-xs text-red-500 font-bold ml-auto hover:bg-red-50 px-3 py-1.5 rounded-lg transition"
            >
              <FilterX size={14} /> Clear
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#89D4FF] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : homeworks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <div className="flex justify-center mb-4"><Search size={48} className="text-gray-300" strokeWidth={1.5} /></div>
            <h2 className="text-xl font-bold text-gray-700">No Homework Found</h2>
            <p className="text-gray-400 mt-2">Try adjusting the filters or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {homeworks.map(hw => (
              <div key={hw._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold w-fit">
                    Class {hw.class} - {hw.section}
                  </div>
                  <button onClick={() => handleDelete(hw._id)} className="text-red-400 hover:text-red-600 transition">
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <h3 className="font-bold text-gray-800 text-lg mb-1 truncate">{hw.title}</h3>
                <p className="text-sm font-semibold text-[#89D4FF] mb-2">{hw.subject}</p>
                <p className="text-xs text-gray-500 line-clamp-2 h-8 mb-4">{hw.description || "No description provided."}</p>
                
                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                  <div className="flex flex-col">
                    <span className="text-gray-400">Assigned By</span>
                    <span className="font-bold text-gray-700">{hw.assignedBy?.name || "Unknown Teacher"}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-gray-400">Due Date</span>
                    <span className="font-bold text-red-500">{new Date(hw.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </AdminSidebar>
  );
}
