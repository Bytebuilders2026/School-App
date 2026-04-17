import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminSidebar from "../../Layouts/AdminSidebar";
import { BookOpen, Search, Plus, Trash2, Link } from "lucide-react";
import { API_BASE_URL } from "../../apiConfig";

const API = API_BASE_URL;
const CLASSES = ["Pre-Nursery", "Nursery", "KG", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];

export default function AdminSyllabus() {
  const [syllabusList, setSyllabusList] = useState([]);
  const [selectedClass, setSelectedClass] = useState("10th");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({ class: "10th", subject: "", title: "", description: "", fileUrl: "" });

  useEffect(() => {
    fetchSyllabus();
  }, [selectedClass]);

  const fetchSyllabus = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/syllabus/class/${selectedClass}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSyllabusList(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.subject || !form.title) return alert("Subject and Title are required");
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API}/syllabus/add`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowForm(false);
      fetchSyllabus();
      setForm({ ...form, subject: "", title: "", description: "", fileUrl: "" });
    } catch (err) {
      alert("Failed to add syllabus");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this syllabus record?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/syllabus/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSyllabus();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminSidebar>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Syllabus Management</h1>
            <p className="text-sm text-gray-400">Add or manage class syllabus</p>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-[#89D4FF] text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold hover:bg-[#6ecaff] transition"
          >
            <Plus size={18} /> {showForm ? "Close Form" : "Add Syllabus"}
          </button>
        </div>

        {/* Add Form */}
        {showForm && (
          <form onSubmit={handleAdd} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
            <h2 className="font-bold text-gray-700">Add New Syllabus Document</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select value={form.class} onChange={e => setForm({...form, class: e.target.value})} className="border p-2.5 rounded-xl border-gray-200 outline-none">
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input placeholder="Subject (e.g. Mathematics)" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="border p-2.5 rounded-xl border-gray-200 outline-none" required />
              <input placeholder="Title (e.g. Term 1 Chapters 1-5)" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="border p-2.5 rounded-xl border-gray-200 outline-none" required />
              <input placeholder="Resource URL (Optional link to PDF/Doc)" value={form.fileUrl} onChange={e => setForm({...form, fileUrl: e.target.value})} className="border p-2.5 rounded-xl border-gray-200 outline-none" />
            </div>
            <textarea placeholder="Description / Topics Details..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="border p-2.5 rounded-xl border-gray-200 outline-none min-h-[100px]" />
            <button type="submit" className="bg-[#89D4FF] text-white py-2.5 rounded-xl font-bold w-48 self-end">Publish Syllabus</button>
          </form>
        )}

        {/* Top Controls */}
        <div className="bg-white p-4 rounded-2xl flex items-center justify-between border border-gray-100">
           <div className="flex items-center gap-3">
              <span className="font-semibold text-gray-600">Select Class:</span>
              <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="border p-2 rounded-lg outline-none font-bold text-gray-700">
                 {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
              </select>
           </div>
        </div>

        {/* Syllabus Grid */}
        {loading ? (
          <p>Loading...</p>
        ) : syllabusList.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-gray-100">
            <BookOpen size={48} className="mx-auto mb-3 opacity-20" />
            <p>No syllabus content published for this class yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {syllabusList.map(item => (
                <div key={item._id} className="bg-white p-5 rounded-2xl border border-gray-100 hover:shadow-md transition">
                   <div className="flex justify-between items-start mb-3">
                       <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                          {item.subject}
                       </span>
                       <button onClick={() => handleDelete(item._id)} className="text-gray-300 hover:text-red-500">
                          <Trash2 size={16} />
                       </button>
                   </div>
                   <h3 className="font-bold text-gray-800 text-lg">{item.title}</h3>
                   <p className="text-sm text-gray-500 mt-2 line-clamp-3 leading-relaxed">{item.description}</p>
                   
                   {item.fileUrl && (
                      <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 mt-4 bg-gray-50 hover:bg-gray-100 text-[#89D4FF] font-bold p-2.5 rounded-xl text-sm transition">
                         <Link size={14} /> Open Document
                      </a>
                   )}
                </div>
             ))}
          </div>
        )}
      </div>
    </AdminSidebar>
  );
}
