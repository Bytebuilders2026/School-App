import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../Layouts/AdminSidebar";
import { API_BASE_URL } from "../../apiConfig";

const AdminGatePass = () => {
  const [gatePasses, setGatePasses] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchGatePasses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/gatepass/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGatePasses(res.data.gatePasses);
    } catch (error) {
      console.error("Error fetching gate passes:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGatePasses();
  }, []);

  const handleComplete = async (id) => {
    if (!window.confirm("Mark this visitor entry as completed?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_BASE_URL}/gatepass/complete/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Status updated to Completed");
      fetchGatePasses();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update status");
    }
  };

  return (
    <AdminSidebar>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gate Pass Management</h1>
          <p className="text-sm text-gray-400">View and verify visitor gate pass requests</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600">
                    <th className="p-4 border-b font-bold text-xs uppercase tracking-wider">Visitor</th>
                    <th className="p-4 border-b font-bold text-xs uppercase tracking-wider">Student</th>
                    <th className="p-4 border-b font-bold text-xs uppercase tracking-wider">Parent</th>
                    <th className="p-4 border-b font-bold text-xs uppercase tracking-wider">Purpose</th>
                    <th className="p-4 border-b font-bold text-xs uppercase tracking-wider">Status</th>
                    <th className="p-4 border-b font-bold text-xs uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {gatePasses.length > 0 ? (
                    gatePasses.map((gp) => (
                      <tr key={gp._id} className="hover:bg-gray-50/50 transition">
                        <td className="p-4">
                          <div className="font-bold text-gray-800">{gp.visitorName}</div>
                          <div className="text-[10px] font-bold text-gray-400 uppercase">{gp.visitorPhone}</div>
                        </td>
                        <td className="p-4">
                          {gp.student ? (
                            <>
                              <div className="font-bold text-blue-600">{gp.student.name}</div>
                              <div className="text-[10px] font-bold text-gray-400 uppercase">Roll: {gp.student.rollNumber}</div>
                            </>
                          ) : <span className="text-gray-300">N/A</span>}
                        </td>
                        <td className="p-4">
                          {gp.parent ? (
                            <>
                              <div className="font-bold text-gray-800">{gp.parent.name}</div>
                              <div className="text-[10px] font-bold text-gray-400 uppercase">{gp.parent.phone}</div>
                            </>
                          ) : <span className="text-gray-300">N/A</span>}
                        </td>
                        <td className="p-4 text-sm text-gray-600 max-w-xs truncate" title={gp.purpose}>
                          {gp.purpose}
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            gp.status === 'Approved' ? 'bg-green-100 text-green-700' :
                            gp.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                            gp.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {gp.status}
                          </span>
                        </td>
                        <td className="p-4">
                          {gp.status === "Approved" ? (
                            <button
                              onClick={() => handleComplete(gp._id)}
                              className="bg-[#89D4FF] text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-[#6ecaff] transition shadow-sm"
                            >
                              Verify Entry
                            </button>
                          ) : (
                            <span className="text-gray-300 text-xs font-bold uppercase tracking-widest">No Action</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="p-12 text-center text-gray-400 font-medium italic">
                        No gate passes found in the system.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminSidebar>
  );
};

export default AdminGatePass;
