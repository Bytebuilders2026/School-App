import { useState, useEffect } from "react";
import axios from "axios";
import AdminSidebar from "../../Layouts/AdminSidebar";
import { Search, Plus, Trash2, CalendarDays } from "lucide-react";
import { API_BASE_URL } from "../../apiConfig";

const API = API_BASE_URL;
const CLASSES = ["Pre-Nursery", "Nursery", "KG", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];
const EXAM_TYPES = ["Midterm", "Final", "Unit Test", "Pre-Board"];

export default function AdminDatesheet() {
  const [datesheets, setDatesheets] = useState([]);
  const [selectedClass, setSelectedClass] = useState("10th");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({ class: "10th", examType: "Midterm", schedule: [] });
  const [currentScheduleItem, setCurrentScheduleItem] = useState({ date: "", subject: "", startTime: "09:00", endTime: "12:00", syllabusInfo: "" });

  useEffect(() => {
    fetchDatesheets();
  }, [selectedClass]);

  const fetchDatesheets = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/datesheet/class/${selectedClass}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDatesheets(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddScheduleItem = () => {
    if(!currentScheduleItem.date || !currentScheduleItem.subject) return alert("Date and subject are required.");
    setForm({
      ...form, 
      schedule: [...form.schedule, currentScheduleItem]
    });
    setCurrentScheduleItem({ date: "", subject: "", startTime: "09:00", endTime: "12:00", syllabusInfo: "" });
  };

  const removeScheduleItem = (index) => {
    const updated = [...form.schedule];
    updated.splice(index, 1);
    setForm({...form, schedule: updated});
  };

  const handlePublish = async () => {
    if(form.schedule.length === 0) return alert("Add at least one exam to the schedule");
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API}/datesheet/add`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowForm(false);
      fetchDatesheets();
      setForm({...form, schedule: []});
    } catch (err) {
      alert("Failed to publish datesheet");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this datesheet entirely?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/datesheet/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDatesheets();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminSidebar>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Exam Datesheets</h1>
            <p className="text-sm text-gray-400">Schedule midterms, finals, and class tests</p>
          </div>
          <button 
            onClick={() => { setShowForm(!showForm); setForm({...form, schedule: []}); }}
            className="bg-[#89D4FF] text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold hover:bg-[#6ecaff] transition"
          >
            <Plus size={18} /> {showForm ? "Close Planner" : "New Datesheet"}
          </button>
        </div>

        {/* Builder Form */}
        {showForm && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4 pb-4 border-b">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Target Class</label>
                <select value={form.class} onChange={e => setForm({...form, class: e.target.value})} className="w-full border mt-1 p-2.5 rounded-xl border-gray-200 outline-none">
                  {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Exam Type</label>
                <select value={form.examType} onChange={e => setForm({...form, examType: e.target.value})} className="w-full border mt-1 p-2.5 rounded-xl border-gray-200 outline-none">
                  {EXAM_TYPES.map(eT => <option key={eT} value={eT}>{eT}</option>)}
                </select>
              </div>
            </div>

            {/* Schedule Items Entry */}
            <div className="bg-gray-50 p-4 rounded-xl flex flex-wrap lg:flex-nowrap items-end gap-3 border border-gray-200">
               <div className="flex-1 min-w-[130px]">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Exam Date</label>
                  <input type="date" value={currentScheduleItem.date} onChange={e=>setCurrentScheduleItem({...currentScheduleItem, date: e.target.value})} className="w-full p-2 border rounded-lg outline-none" />
               </div>
               <div className="flex-1 min-w-[150px]">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Subject</label>
                  <input type="text" placeholder="e.g. Physics" value={currentScheduleItem.subject} onChange={e=>setCurrentScheduleItem({...currentScheduleItem, subject: e.target.value})} className="w-full p-2 border rounded-lg outline-none" />
               </div>
               <div className="w-[100px]">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Start Time</label>
                  <input type="time" value={currentScheduleItem.startTime} onChange={e=>setCurrentScheduleItem({...currentScheduleItem, startTime: e.target.value})} className="w-full p-2 border rounded-lg outline-none" />
               </div>
               <div className="w-[100px]">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">End Time</label>
                  <input type="time" value={currentScheduleItem.endTime} onChange={e=>setCurrentScheduleItem({...currentScheduleItem, endTime: e.target.value})} className="w-full p-2 border rounded-lg outline-none" />
               </div>
               <div className="flex-[1.5] min-w-[200px]">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Chapters / Detail (Optional)</label>
                  <input type="text" placeholder="e.g. Ch 1, 2, 3" value={currentScheduleItem.syllabusInfo} onChange={e=>setCurrentScheduleItem({...currentScheduleItem, syllabusInfo: e.target.value})} className="w-full p-2 border rounded-lg outline-none" />
               </div>
               <button onClick={handleAddScheduleItem} className="bg-gray-800 text-white font-bold px-4 py-2 mt-2 lg:mt-0 rounded-lg hover:bg-black w-full lg:w-auto transition">Add</button>
            </div>

            {/* List of pending schedule items */}
            {form.schedule.length > 0 && (
              <div className="space-y-2">
                 <h3 className="font-bold text-sm text-gray-600">Pending Schedule Map:</h3>
                 {form.schedule.map((slot, i) => (
                    <div key={i} className="flex justify-between items-center bg-gray-50 px-4 py-2 rounded-lg border border-gray-100 text-sm">
                       <div className="flex gap-4">
                         <span className="font-bold w-24">{new Date(slot.date).toLocaleDateString()}</span>
                         <span className="font-semibold text-blue-600 w-32">{slot.subject}</span>
                         <span className="text-gray-500 text-xs mt-0.5">{slot.startTime} - {slot.endTime}</span>
                         <span className="text-gray-400 italic ml-4">{slot.syllabusInfo}</span>
                       </div>
                       <button onClick={() => removeScheduleItem(i)} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button>
                    </div>
                 ))}
                 <button onClick={handlePublish} className="bg-[#89D4FF] text-white w-full py-3 rounded-xl font-bold mt-4">Publish Datesheet</button>
              </div>
            )}
          </div>
        )}

        {/* View Controls */}
        <div className="bg-white p-4 rounded-2xl flex items-center justify-between border border-gray-100">
           <div className="flex items-center gap-3">
              <span className="font-semibold text-gray-600">Viewing Class:</span>
              <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="border p-2 rounded-lg outline-none font-bold text-gray-700">
                 {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
              </select>
           </div>
        </div>

        {/* Saved Datesheets */}
        <div className="space-y-6">
           {loading ? <p>Loading...</p> : datesheets.length === 0 ? (
               <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-gray-100">
                 <CalendarDays size={48} className="mx-auto mb-3 opacity-20" />
                 <p>No exams scheduled for Class {selectedClass}.</p>
               </div>
           ) : datesheets.map((ds) => (
               <div key={ds._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                     <h2 className="font-bold text-gray-800 flex items-center gap-2">
                        <CalendarDays className="text-[#89D4FF]" size={20}/>
                        {ds.examType} Datesheet
                     </h2>
                     <button onClick={() => handleDelete(ds._id)} className="text-gray-400 hover:text-red-500 transition">
                        <Trash2 size={18} />
                     </button>
                  </div>
                  <div className="divide-y divide-gray-100">
                     {ds.schedule.sort((a,b) => new Date(a.date) - new Date(b.date)).map((item, idx) => (
                        <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-4 px-6 hover:bg-gray-50/50">
                           <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                             <span className="font-black text-gray-700 w-32 tracking-tight">
                                {new Date(item.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                             </span>
                             <div>
                                <span className="font-bold text-[#89D4FF] text-lg block">{item.subject}</span>
                                {item.syllabusInfo && <span className="text-xs text-gray-400 font-medium">{item.syllabusInfo}</span>}
                             </div>
                           </div>
                           <div className="mt-2 md:mt-0 font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-lg text-xs">
                              {item.startTime} — {item.endTime}
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
           ))}
        </div>
      </div>
    </AdminSidebar>
  );
}
