import { useState, useEffect } from "react";
import axios from "axios";
import TeacherSidebar from "../../Layouts/TeacherSidebar";
import { CalendarX } from "lucide-react";

import { API_BASE_URL } from "../../apiConfig";

const API = API_BASE_URL;

export default function TeacherAttendance() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const todayStr = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    fetchTodayClasses();
  }, []);

  const fetchTodayClasses = async () => {
    try {
      const res = await axios.get(`/teacher/dashboard`);
      // The dashboard API returns today's timetable inside data.timetable
      const uniqueClasses = [];
      const seen = new Set();
      
      (res.data.data.timetable || []).forEach((lecture) => {
        const key = `${lecture.class}-${lecture.section}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueClasses.push({
            class: lecture.class,
            section: lecture.section,
            subject: lecture.subject, // Just showing the first subject if multiple
            periods: 1, // Optional: count them
          });
        }
      });
      
      setClasses(uniqueClasses);
    } catch (err) {
      setError("Failed to load today's classes.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectClass = async (cls) => {
    setSelectedClass(cls);
    setStudents([]);
    setAttendanceData({});
    setLoading(true);
    
    try {
      const res = await axios.get(`/students/by-class?cls=${selectedClass.class}&section=${selectedClass.section}`);
      const fetchedStudents = res.data || [];
      setStudents(fetchedStudents);
      
      // Default all to 'present'
      const initialData = {};
      fetchedStudents.forEach(s => {
        initialData[s._id] = "present";
      });
      setAttendanceData(initialData);

      // (Optional: fetch existing attendance for today to pre-fill if already marked)
      // I'm skipping that for simplicity, but that would use the admin class-students route.

    } catch (err) {
      setError("Failed to load students.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceData(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async () => {
    if (students.length === 0) return alert("No students to mark!");
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      
      const payload = {
        class: selectedClass.class,
        section: selectedClass.section,
        date: new Date().toISOString(),
        attendanceData: Object.entries(attendanceData).map(([studentId, status]) => ({
          studentId,
          status,
        }))
      };

      await axios.post(`/teacher/attendance`, payload);
      
      alert("Attendance submitted successfully!");
      setSelectedClass(null); // Go back to classes list
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit attendance.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <TeacherSidebar>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Mark Attendance</h1>
            <p className="text-sm text-gray-400 mt-1">{todayStr}</p>
          </div>
          {selectedClass && (
            <button
              onClick={() => setSelectedClass(null)}
              className="text-sm text-[#89D4FF] hover:underline font-semibold"
            >
              ← Back to Classes
            </button>
          )}
        </div>

        {error && <p className="text-red-500 bg-red-50 p-4 rounded-xl">{error}</p>}

        {loading ? (
           <div className="flex items-center justify-center h-64">
             <div className="w-10 h-10 border-4 border-[#89D4FF] border-t-transparent rounded-full animate-spin" />
           </div>
        ) : !selectedClass ? (
          // STEP 1: Show today's classes
          <>
            {classes.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                <div className="flex justify-center mb-4"><CalendarX className="w-16 h-16 text-gray-300" strokeWidth={1} /></div>
                <h2 className="text-xl font-bold text-gray-700">No Classes Today</h2>
                <p className="text-gray-400 mt-2">You don't have any lectures assigned for today.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {classes.map((c, i) => (
                  <div
                    key={i}
                    onClick={() => handleSelectClass(c)}
                    className="group cursor-pointer bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-[#89D4FF]/15 flex items-center justify-center text-[#89D4FF] text-xl font-bold">
                        {c.section}
                      </div>
                      <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                        Class {c.class}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">
                      {c.subject}
                    </h3>
                    <p className="text-sm text-[#1a8fc7] font-semibold group-hover:underline">
                      Mark Attendance →
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          // STEP 2: Show students list
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h2 className="font-bold text-gray-700">
                  Class {selectedClass.class} – Section {selectedClass.section}
                </h2>
                <p className="text-xs text-gray-400">{students.length} students</p>
              </div>
            </div>

            {students.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                No students found in this class.
              </div>
            ) : (
              <div>
                {/* Mobile & Desktop Responsive List */}
                <div className="w-full">
                  <div className="hidden md:grid grid-cols-12 gap-4 bg-gray-50 border-b border-gray-100 px-6 py-3 text-xs font-medium text-gray-500">
                    <div className="col-span-2">Roll No</div>
                    <div className="col-span-4">Student Name</div>
                    <div className="col-span-6 text-center">Attendance Status</div>
                  </div>
                  
                  <div className="divide-y divide-gray-50">
                    {students.map((student) => {
                      const status = attendanceData[student._id];
                      return (
                        <div key={student._id} className="flex flex-col md:grid md:grid-cols-12 gap-4 items-center px-4 md:px-6 py-4 hover:bg-gray-50/30 transition">
                          <div className="md:col-span-2 text-gray-500 font-medium text-sm w-full md:w-auto text-center md:text-left">
                            <span className="md:hidden text-xs font-semibold text-gray-400 mr-2">Roll:</span>
                            {student.rollNumber}
                          </div>
                          
                          <div className="md:col-span-4 flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                            <div className="w-10 h-10 md:w-8 md:h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm md:text-xs shrink-0">
                              {student.name.charAt(0)}
                            </div>
                            <span className="font-semibold text-gray-700 text-base md:text-sm text-center md:text-left">{student.name}</span>
                          </div>

                          <div className="md:col-span-6 flex justify-center gap-2 w-full mt-3 md:mt-0">
                            <button
                              onClick={() => handleStatusChange(student._id, "present")}
                              className={`flex-1 md:flex-none px-3 py-2 md:py-1.5 rounded-xl md:rounded-full text-xs font-bold transition ${
                                status === "present"
                                  ? "bg-green-100 text-green-700 ring-2 ring-green-300 shadow-sm"
                                  : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                              }`}
                            >
                              Present
                            </button>
                            <button
                              onClick={() => handleStatusChange(student._id, "absent")}
                              className={`flex-1 md:flex-none px-3 py-2 md:py-1.5 rounded-xl md:rounded-full text-xs font-bold transition ${
                                status === "absent"
                                  ? "bg-red-100 text-red-700 ring-2 ring-red-300 shadow-sm"
                                  : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                              }`}
                            >
                              Absent
                            </button>
                            <button
                              onClick={() => handleStatusChange(student._id, "leave")}
                              className={`flex-1 md:flex-none px-3 py-2 md:py-1.5 rounded-xl md:rounded-full text-xs font-bold transition ${
                                status === "leave"
                                  ? "bg-yellow-100 text-yellow-700 ring-2 ring-yellow-300 shadow-sm"
                                  : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                              }`}
                            >
                              Leave
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Submit Section */}
                <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="bg-[#89D4FF] hover:bg-[#6ac0f0] text-white font-bold py-3 px-8 rounded-xl shadow-md transition disabled:opacity-50"
                  >
                    {submitting ? "Submitting..." : "Submit Attendance"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </TeacherSidebar>
  );
}
