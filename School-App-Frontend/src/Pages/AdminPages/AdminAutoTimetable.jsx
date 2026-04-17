import React, { useState } from "react";
import axios from "axios";
import AdminSidebar from "../../Layouts/AdminSidebar";

const AdminAutoTimetable = () => {
  const [formData, setFormData] = useState({
    classStr: "",
    section: "",
    periodsPerDay: 8,
    days: "Monday,Tuesday,Wednesday,Thursday,Friday,Saturday"
  });

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        class: formData.classStr,
        section: formData.section,
        periodsPerDay: parseInt(formData.periodsPerDay),
        days: formData.days.split(",").map(d => d.trim())
      };
      const res = await axios.post("http://localhost:5000/api/autotimetable/generate", payload);
      alert(res.data.message);
    } catch (err) {
      console.error(err);
      alert("Failed to auto-generate timetable");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar collapse={false} />
      <div className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6 text-indigo-700">Auto Timetable Generator</h1>
        
        <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-indigo-500 max-w-2xl">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">Generate Weekly Timetable</h2>
          
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                <input 
                  type="text" required placeholder="e.g. 10"
                  value={formData.classStr} onChange={e => setFormData({...formData, classStr: e.target.value})}
                  className="w-full border-gray-300 rounded shadow-sm p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                <input 
                  type="text" required placeholder="e.g. A"
                  value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})}
                  className="w-full border-gray-300 rounded shadow-sm p-2 border"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Periods Per Day</label>
              <input 
                type="number" required min="1" max="10"
                value={formData.periodsPerDay} onChange={e => setFormData({...formData, periodsPerDay: e.target.value})}
                className="w-full border-gray-300 rounded shadow-sm p-2 border"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Working Days (Comma separated)</label>
              <input 
                type="text" required 
                value={formData.days} onChange={e => setFormData({...formData, days: e.target.value})}
                className="w-full border-gray-300 rounded shadow-sm p-2 border"
              />
            </div>
            
            <div className="pt-4 border-t mt-6">
              <button 
                type="submit"
                className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded hover:bg-indigo-700 transition"
              >
                Auto Generate Output
              </button>
            </div>
          </form>
          <div className="mt-6 bg-blue-50 text-blue-800 p-4 rounded text-sm">
             <strong>Note:</strong> Artificial Intelligence constraint satisfaction logic will automatically balance the teacher workloads and substitute availability upon generation.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAutoTimetable;
