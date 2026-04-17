import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminSidebar from "../../Layouts/AdminSidebar";

const AdminTimetableAdjustments = () => {
  const [leaves, setLeaves] = useState([]);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [substitutionsMapping, setSubstitutionsMapping] = useState({});

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/autotimetable/leave/all");
      setLeaves(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReview = async (leaveId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/autotimetable/leave/${leaveId}/suggestions`);
      setSelectedLeave(leaveId);
      setSuggestions(res.data.affectedPeriods);
      // init mapping
      const mapping = {};
      res.data.affectedPeriods.forEach((ap, i) => {
        mapping[i] = "";
      });
      setSubstitutionsMapping(mapping);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprove = async () => {
    try {
      const payloadSubstitutions = suggestions.map((ap, i) => ({
        class: ap.class,
        section: ap.section,
        startTime: ap.startTime,
        endTime: ap.endTime,
        subject: ap.subject,
        substituteTeacherId: substitutionsMapping[i]
      }));

      await axios.post("http://localhost:5000/api/autotimetable/leave/approve", {
        leaveId: selectedLeave,
        substitutions: payloadSubstitutions
      });
      
      alert("Substitution assigned successfully and notifications sent!");
      setSelectedLeave(null);
      setSuggestions(null);
      fetchLeaves();
    } catch (err) {
      console.error(err);
      alert("Error approving substitution");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar collapse={false} />
      <div className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6 text-indigo-700">Timetable & Leave Adjustments</h1>
        
        {!selectedLeave ? (
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-indigo-500">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Pending Leave Requests</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white text-sm">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="py-3 px-4 text-left">Teacher</th>
                    <th className="py-3 px-4 text-left">Date</th>
                    <th className="py-3 px-4 text-left">Reason</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.filter(l => l.status === "Pending").map((leave) => (
                    <tr key={leave._id} className="border-b hover:bg-gray-50 transition">
                      <td className="py-3 px-4">{leave.teacher?.name}</td>
                      <td className="py-3 px-4">{leave.date}</td>
                      <td className="py-3 px-4 max-w-xs truncate">{leave.reason}</td>
                      <td className="py-3 px-4">
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold">
                          {leave.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleReview(leave._id)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-1 px-3 rounded shadow-sm transition"
                        >
                          Review & Adjust
                        </button>
                      </td>
                    </tr>
                  ))}
                  {leaves.filter(l => l.status === "Pending").length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-6 text-gray-500">No pending leave requests.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <h2 className="text-xl font-semibold mb-4 text-gray-800 mt-10">Approved Leaves</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white text-sm">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="py-3 px-4 text-left">Teacher</th>
                    <th className="py-3 px-4 text-left">Date</th>
                    <th className="py-3 px-4 text-left">Reason</th>
                    <th className="py-3 px-4 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.filter(l => l.status === "Approved").map((leave) => (
                    <tr key={leave._id} className="border-b">
                      <td className="py-3 px-4">{leave.teacher?.name}</td>
                      <td className="py-3 px-4">{leave.date}</td>
                      <td className="py-3 px-4 max-w-xs truncate">{leave.reason}</td>
                      <td className="py-3 px-4">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                          {leave.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-indigo-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Suggest Substitutes</h2>
              <button 
                onClick={() => { setSelectedLeave(null); setSuggestions(null); }}
                className="text-gray-500 hover:text-gray-700 font-medium"
              >
                Back to Requests
              </button>
            </div>
            
            <div className="space-y-6">
              {suggestions.map((period, index) => (
                <div key={index} className="border rounded-lg p-5 bg-gradient-to-r from-gray-50 to-white shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg text-indigo-800">
                      Class {period.class} - {period.section}
                    </h3>
                    <span className="bg-indigo-100 text-indigo-800 font-medium px-3 py-1 rounded-full text-sm">
                      {period.startTime} - {period.endTime}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-3"><span className="font-medium text-gray-500">Subject:</span> {period.subject}</p>
                  
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assign Substitute Teacher:</label>
                    <select
                      className="w-full border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 rounded-md shadow-sm p-2 bg-white"
                      value={substitutionsMapping[index]}
                      onChange={(e) => setSubstitutionsMapping({ ...substitutionsMapping, [index]: e.target.value })}
                    >
                      <option value="">-- Let Class Stay Empty --</option>
                      {period.suggestions.highPriority.length > 0 && <optgroup label="Highly Recommended (Same Subject)"></optgroup>}
                      {period.suggestions.highPriority.map(t => (
                        <option key={t.id} value={t.id}>⭐ {t.name} (Subjects: {t.subjects.join(", ")})</option>
                      ))}
                      
                      {period.suggestions.fallback.length > 0 && <optgroup label="Available (Different Subject)"></optgroup>}
                      {period.suggestions.fallback.map(t => (
                        <option key={t.id} value={t.id}>{t.name} (Subjects: {t.subjects.join(", ")})</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
              
              {suggestions.length === 0 && (
                <div className="p-4 bg-green-50 text-green-700 rounded-lg">
                  No overlapping timetable periods found for this date. The teacher is free!
                </div>
              )}
            </div>

            <div className="mt-8 pt-4 border-t flex justify-end gap-3">
              <button 
                onClick={() => { setSelectedLeave(null); setSuggestions(null); }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 font-medium transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleApprove}
                className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-medium shadow-md transition"
              >
                Approve & Assign Substitutes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTimetableAdjustments;
