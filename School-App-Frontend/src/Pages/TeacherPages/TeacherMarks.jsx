import React, { useState, useEffect } from "react";
import axios from "axios";
import TeacherSidebar from "../../Layouts/TeacherSidebar";
import { CheckCircle, Save, Download, Calculator } from "lucide-react";
import { API_BASE_URL } from "../../apiConfig";

const API = API_BASE_URL;
const EXAM_TYPES = ["Midterm", "Final", "Unit Test", "Pre-Board"];

export default function TeacherMarks() {
  const [profile, setProfile] = useState(null);
  const [students, setStudents] = useState([]);
  const [marksData, setMarksData] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ class: "", section: "", subject: "", examType: "Midterm" });

  useEffect(() => {
     axios.get(`${API}/teacher/me`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
       .then(res => {
          setProfile(res.data);
          if (res.data?.classes?.length > 0) {
             setForm(prev => ({ ...prev, class: res.data.classes[0].class, section: res.data.classes[0].section }));
          }
          if (res.data?.subjects?.length > 0) {
             setForm(prev => ({ ...prev, subject: res.data.subjects[0] }));
          }
       })
       .catch(err => console.error(err));
  }, []);

  const fetchStudentsAndMarks = async () => {
    if (!form.class || !form.section || !form.subject || !form.examType) {
      alert("Please select Class, Section, Subject, and Exam Type first.");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // 1. Fetch Students in this class
      const stRes = await axios.get(`${API}/students/by-class?cls=${form.class}&section=${form.section}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const classStudents = stRes.data || [];
      
      // 2. Fetch existing marks for this combo
      const marksRes = await axios.get(`${API}/marks/class/${form.class}/section/${form.section}?examType=${form.examType}&subject=${form.subject}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const existingMarks = marksRes.data || [];

      // 3. Map existing marks into our state form
      const marksMap = {};
      classStudents.forEach(st => {
         const found = existingMarks.find(m => m.student?._id === st._id);
         marksMap[st._id] = {
            marksObtained: found ? found.marksObtained : "",
            totalMarks: found ? found.totalMarks : 100
         };
      });

      setStudents(classStudents);
      setMarksData(marksMap);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkChange = (studentId, field, value) => {
    setMarksData(prev => ({
      ...prev,
      [studentId]: {
         ...prev[studentId],
         [field]: value
      }
    }));
  };

  const handleSaveMarks = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      
      const payloadData = Object.keys(marksData).map(studentId => {
        let obt = Number(marksData[studentId].marksObtained);
        let tot = Number(marksData[studentId].totalMarks);
        let grade = "";
        
        if (obt >= 0 && tot > 0) {
           let perc = (obt / tot) * 100;
           if (perc >= 90) grade = "A+";
           else if (perc >= 80) grade = "A";
           else if (perc >= 70) grade = "B";
           else if (perc >= 60) grade = "C";
           else if (perc >= 50) grade = "D";
           else grade = "F";
        }

        return {
           studentId,
           marksObtained: isNaN(obt) ? 0 : obt,
           totalMarks: isNaN(tot) ? 100 : tot,
           grade
        };
      }).filter(record => record.marksObtained !== "" && !isNaN(record.marksObtained)); // Only save if they actually entered a mark!

      if (payloadData.length === 0) {
         alert("No marks entered.");
         setSaving(false);
         return;
      }

      const payload = {
         class: form.class,
         section: form.section,
         subject: form.subject,
         examType: form.examType,
         marksData: payloadData
      };

      await axios.post(`${API}/marks/add`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Marks saved successfully!");
    } catch (err) {
      alert("Error saving marks.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <TeacherSidebar>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Results & Marks Entry</h1>
          <p className="text-sm text-gray-400">Add or edit exam scores for your class</p>
        </div>

        {/* Filters */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-2 md:grid-cols-5 gap-4 items-end">
           {/* We combine Class & Section so we strictly follow their assigned arrays */}
          <div className="col-span-2">
             <label className="text-xs font-bold text-gray-400 uppercase">Assigned Class & Section</label>
             <select value={`${form.class}-${form.section}`} onChange={e => {
                const [c, s] = e.target.value.split('-');
                setForm({...form, class: c, section: s});
             }} className="w-full mt-1 border p-2 rounded-xl border-gray-200 outline-none">
                <option value="-">Select Assigned Class</option>
                {profile?.classes?.map((c, i) => <option key={i} value={`${c.class}-${c.section}`}>{c.class} - {c.section}</option>)}
             </select>
          </div>
          <div>
             <label className="text-xs font-bold text-gray-400 uppercase">Subject</label>
             <select value={form.subject} onChange={e=>setForm({...form, subject: e.target.value})} className="w-full mt-1 border p-2 rounded-xl border-gray-200 outline-none">
                <option value="">Select Subject</option>
                {profile?.subjects?.map((sub, i) => <option key={i} value={sub}>{sub}</option>)}
             </select>
          </div>
          <div>
             <label className="text-xs font-bold text-gray-400 uppercase">Exam Type</label>
             <select value={form.examType} onChange={e=>setForm({...form, examType: e.target.value})} className="w-full mt-1 border p-2 rounded-xl border-gray-200 outline-none">
                {EXAM_TYPES.map(eT => <option key={eT} value={eT}>{eT}</option>)}
             </select>
          </div>
          <button onClick={fetchStudentsAndMarks} className="bg-[#21a8f3] hover:bg-[#1a8bd1] text-white p-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition">
             <Download size={16} /> Load Roster
          </button>
        </div>

        {/* Data Grid */}
        {loading ? (
           <p className="text-gray-500 font-medium">Fetching class roster...</p>
        ) : students.length > 0 ? (
           <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
              <div className="flex justify-between items-center p-4 px-6 border-b border-gray-100 bg-gray-50/50">
                 <h2 className="font-bold text-gray-700 flex items-center gap-2">
                   <Calculator size={18} className="text-[#21a8f3]"/>
                   {form.class}-{form.section} • {form.subject} • {form.examType}
                 </h2>
                 <button onClick={handleSaveMarks} disabled={saving} className="bg-gray-800 text-white flex items-center gap-2 px-4 py-2 rounded-xl font-bold hover:bg-black transition disabled:opacity-50 text-sm">
                    {saving ? "Saving..." : <><Save size={16} /> Save Changes</>}
                 </button>
              </div>

              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase tracking-wider">
                          <th className="p-4 px-6 font-bold">Roll No</th>
                          <th className="p-4 px-6 font-bold">Student Name</th>
                          <th className="p-4 px-6 font-bold text-center">Marks Obtained</th>
                          <th className="p-4 px-6 font-bold text-center">Total Marks</th>
                          <th className="p-4 px-6 font-bold text-center">Auto Grade</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm font-medium">
                       {students.map(st => {
                          const obt = marksData[st._id]?.marksObtained || "";
                          const tot = marksData[st._id]?.totalMarks || 100;
                          
                          // Calculate active preview grade purely for UI feedback
                          let previewGrade = "-";
                          if(obt !== "" && !isNaN(obt) && tot > 0) {
                             const perc = (Number(obt)/Number(tot)) * 100;
                             if (perc >= 90) previewGrade = "A+";
                             else if (perc >= 80) previewGrade = "A";
                             else if (perc >= 70) previewGrade = "B";
                             else if (perc >= 60) previewGrade = "C";
                             else if (perc >= 50) previewGrade = "D";
                             else previewGrade = "F";
                          }

                          return (
                             <tr key={st._id} className="hover:bg-gray-50 transition">
                                <td className="p-3 px-6 text-gray-500 font-bold">{st.rollNumber}</td>
                                <td className="p-3 px-6 text-gray-700 font-bold">{st.name}</td>
                                <td className="p-3 px-6 text-center">
                                   <input 
                                      type="number" 
                                      min="0"
                                      className="border border-gray-200 rounded-lg p-1.5 w-24 text-center outline-none focus:ring-2 focus:ring-[#21a8f3]/20 font-bold"
                                      value={obt}
                                      onChange={(e) => handleMarkChange(st._id, "marksObtained", e.target.value)}
                                   />
                                </td>
                                <td className="p-3 px-6 text-center">
                                   <input 
                                      type="number" 
                                      min="1"
                                      className="border border-gray-200 rounded-lg p-1.5 w-24 text-center outline-none bg-gray-50 text-gray-500"
                                      value={tot}
                                      onChange={(e) => handleMarkChange(st._id, "totalMarks", e.target.value)}
                                   />
                                </td>
                                <td className="p-3 px-6 text-center font-black">
                                   <span className={`${previewGrade === 'A+' || previewGrade === 'A' ? 'text-green-500' : previewGrade === 'F' ? 'text-red-500' : 'text-[#21a8f3]'}`}>
                                     {previewGrade}
                                   </span>
                                </td>
                             </tr>
                          )
                       })}
                    </tbody>
                 </table>
              </div>
           </div>
        ) : (
           <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-gray-100 mt-4 text-gray-400">
             <CheckCircle size={48} strokeWidth={1} className="mb-4 text-gray-300" />
             <p className="font-medium text-[15px]">Select filters and load roster to enter marks.</p>
           </div>
        )}
      </div>
    </TeacherSidebar>
  );
}
