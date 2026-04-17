import React, { useState, useEffect } from "react";
import axios from "axios";
import TeacherSidebar from "../../Layouts/TeacherSidebar";
import { BookOpen, Plus, Trash2, BookText } from "lucide-react";

import { API_BASE_URL } from "../../apiConfig";

const API = API_BASE_URL;

export default function TeacherHomework() {
  const [homeworks, setHomeworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [classes, setClasses] = useState([]);

  // Form State
  const [form, setForm] = useState({
    title: "",
    description: "",
    class: "",
    section: "",
    subject: "",
    dueDate: "",
  });

  useEffect(() => {
    fetchHomeworks();
    fetchClasses();
  }, []);

  const fetchHomeworks = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/homework/teacher`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHomeworks(res.data.homeworks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/teacher/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const uniqueClasses = [];
      const seen = new Set();
      (res.data.data.timetable || []).forEach(lecture => {
        const key = `${lecture.class}-${lecture.section}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueClasses.push({ class: lecture.class, section: lecture.section, subject: lecture.subject });
        }
      });
      setClasses(uniqueClasses);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async () => {
    if (!form.title || !form.class || !form.section || !form.subject || !form.dueDate) {
      return alert("Please fill all required fields");
    }
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API}/homework/create`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowModal(false);
      setForm({ title: "", description: "", class: "", section: "", subject: "", dueDate: "" });
      fetchHomeworks();
    } catch (err) {
      alert("Failed to create homework");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this homework?")) return;
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

  // Allow selecting class and section from dropdown, auto-fill subject if possible
  const handleClassSelection = (val) => {
    if (!val) {
      setForm({ ...form, class: "", section: "", subject: "" });
      return;
    }
    const [c, s, sub] = val.split("|");
    setForm({ ...form, class: c, section: s, subject: sub });
  };

  return (
    <TeacherSidebar>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Homework</h1>
            <p className="text-sm text-gray-400 mt-1">Manage assignments for your classes</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#89D4FF] hover:bg-[#6ac0f0] text-white px-5 py-2.5 rounded-xl font-bold shadow-sm transition w-full md:w-auto justify-center"
          >
            <Plus size={18} /> Assign Homework
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#89D4FF] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : homeworks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <div className="flex justify-center mb-4"><BookOpen size={64} className="text-gray-300" strokeWidth={1} /></div>
            <h2 className="text-xl font-bold text-gray-700">No Homework Assigned</h2>
            <p className="text-gray-400 mt-2">You haven't assigned any homework yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {homeworks.map(hw => (
              <div key={hw._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-3">
                  <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold w-fit">
                    Class {hw.class} - {hw.section}
                  </div>
                  <button onClick={() => handleDelete(hw._id)} className="text-red-400 hover:text-red-600 transition">
                    <Trash2 size={18} />
                  </button>
                </div>
                <h3 className="font-bold text-gray-800 text-lg mb-1 truncate">{hw.title}</h3>
                <p className="text-sm font-semibold text-[#89D4FF] mb-2">{hw.subject}</p>
                <p className="text-sm text-gray-500 line-clamp-2 h-10 mb-4 text-xs">{hw.description || "No description provided."}</p>
                <div className="flex items-center justify-between text-xs pt-4 border-t border-gray-100">
                  <span className="text-gray-400">Assigned: {new Date(hw.createdAt).toLocaleDateString()}</span>
                  <span className="font-bold text-red-500">Due: {new Date(hw.dueDate).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
              <BookText className="text-[#89D4FF]" />
              <h2 className="font-bold text-gray-700">Assign New Homework</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Target Class</label>
                <select 
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#89D4FF]"
                  onChange={(e) => handleClassSelection(e.target.value)}
                >
                  <option value="">Select your class/section</option>
                  {classes.map((c, i) => (
                    <option key={i} value={`${c.class}|${c.section}|${c.subject}`}>
                      Class {c.class} — Section {c.section} ({c.subject})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Homework Title</label>
                <input 
                  type="text"
                  placeholder="e.g. Chapter 4 Exercises"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#89D4FF]"
                  value={form.title}
                  onChange={(e) => setForm({...form, title: e.target.value})}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Description (Optional)</label>
                <textarea 
                  placeholder="Additional instructions..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#89D4FF] resize-none"
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Due Date</label>
                <input 
                  type="date"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#89D4FF]"
                  value={form.dueDate}
                  onChange={(e) => setForm({...form, dueDate: e.target.value})}
                />
              </div>

            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
              <button 
                onClick={() => setShowModal(false)}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreate}
                className="px-5 py-2 rounded-xl text-sm font-bold bg-[#89D4FF] text-white hover:bg-[#6ac0f0] shadow-sm transition"
              >
                Assign Homework
              </button>
            </div>
          </div>
        </div>
      )}
    </TeacherSidebar>
  );
}
