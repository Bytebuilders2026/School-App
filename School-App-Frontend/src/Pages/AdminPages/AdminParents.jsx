import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../Layouts/AdminSidebar";
import { Users, Search, Plus, Trash2, ShieldCheck, X, Link } from "lucide-react";
import { API_BASE_URL } from "../../apiConfig";

const API = `${API_BASE_URL}/admin/parents`;

export default function AdminParents() {
  const [parents, setParents] = useState([]);
  const [unassignedStudents, setUnassignedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    occupation: "",
    childrenIds: [] // multiselect
  });

  useEffect(() => {
    fetchParents();
  }, []);

  const fetchParents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setParents(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnassignedStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/unassigned-students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnassignedStudents(res.data || []);
    } catch (err) {
      console.error("Failed to fetch students", err);
    }
  };

  const openModal = () => {
    fetchUnassignedStudents();
    setForm({ name: "", email: "", password: "", phone: "", address: "", occupation: "", childrenIds: [] });
    setShowModal(true);
  };

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password || !form.phone) {
      alert("Name, Email, Password, and Phone are required.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API}/add`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Parent account created and linked successfully!");
      setShowModal(false);
      fetchParents();
    } catch (err) {
      alert(err.response?.data?.error || "Error creating parent");
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure? This deletes the parent account and unassigns the children (students remain intact).")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchParents();
    } catch (err) {
      alert("Failed to delete parent");
    }
  };

  const toggleStudentSelection = (id) => {
    setForm((prev) => {
      if(prev.childrenIds.includes(id)) {
        return { ...prev, childrenIds: prev.childrenIds.filter(cid => cid !== id) };
      } else {
        return { ...prev, childrenIds: [...prev.childrenIds, id] };
      }
    });
  };

  const filteredParents = parents.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminSidebar>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Parents Management</h1>
            <p className="text-sm text-gray-400 mt-1">Manage parent accounts and their linked children</p>
          </div>
          <button
            onClick={openModal}
            className="flex items-center gap-2 bg-[#89D4FF] hover:bg-[#6ac0f0] text-white px-5 py-3 rounded-xl shadow-sm font-bold transition"
          >
            <Plus size={18} /> Add Parent
          </button>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              placeholder="Search parents by name or email..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#89D4FF]/50 focus:outline-none transition"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h2 className="font-bold text-gray-700 text-sm">Registered Parents</h2>
            <p className="text-xs text-gray-400">{filteredParents.length} records</p>
          </div>

          {loading ? (
             <div className="flex justify-center items-center h-48">
               <div className="w-8 h-8 border-4 border-[#89D4FF] border-t-transparent rounded-full animate-spin"></div>
             </div>
          ) : filteredParents.length === 0 ? (
             <div className="text-center py-16 text-gray-400">
               <Users size={48} className="mx-auto text-gray-200 mb-4" strokeWidth={1} />
               <p className="text-sm">No parents currently registered.</p>
             </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white border-b border-gray-100 text-gray-400">
                    <th className="text-left px-6 py-4 font-semibold text-xs tracking-wider">PARENT</th>
                    <th className="text-left px-6 py-4 font-semibold text-xs tracking-wider">CONTACT</th>
                    <th className="text-left px-6 py-4 font-semibold text-xs tracking-wider">CHILDREN LINKED</th>
                    <th className="text-left px-6 py-4 font-semibold text-xs tracking-wider">ADDRESS & OCCUPATION</th>
                    <th className="text-right px-6 py-4 font-semibold text-xs tracking-wider">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParents.map((parent) => (
                    <tr key={parent._id} className="border-b border-gray-50 hover:bg-gray-50/60 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#89D4FF]/20 flex items-center justify-center text-[#89D4FF] font-bold text-xs shrink-0">
                            {parent.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700 block">{parent.name}</span>
                            <span className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
                              {parent.isActive ? <ShieldCheck size={12} className="text-green-500" /> : <X size={12} className="text-red-500" />}
                              {parent.isActive ? "Active Account" : "Inactive"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        <div className="text-xs">
                           <p><span className="text-gray-400 font-semibold mr-1">E:</span>{parent.email || "—"}</p>
                           <p><span className="text-gray-400 font-semibold mr-1">P:</span>{parent.phone || "—"}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                           {parent.children && parent.children.length > 0 ? parent.children.map(child => (
                             <span key={child._id} className="bg-blue-50 border border-blue-100 text-blue-700 px-2.5 py-1 rounded-md text-[10px] font-semibold flex items-center gap-1">
                               <Link size={10} />
                               {child.name} (Cls {child.class} {child.section})
                             </span>
                           )) : (
                             <span className="text-xs text-gray-400 italic">No children linked</span>
                           )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        <p>{parent.address || "—"}</p>
                        <p className="text-[10px] font-semibold text-gray-400 mt-0.5">{parent.occupation || "—"}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDelete(parent._id)}
                          className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
                          title="Delete Parent"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

       {/* Modal for Adding Parent */}
       {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white p-8 rounded-2xl w-[800px] max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button 
              onClick={() => setShowModal(false)} 
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <Users className="text-[#89D4FF]" size={24} />
              <h2 className="text-xl font-bold text-gray-800">Assign New Parent</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Parent Details */}
              <div className="space-y-4">
                 <h3 className="text-sm font-bold text-gray-700 pb-2 border-b border-gray-100">Parent Details</h3>
                 <div>
                   <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">Full Name *</label>
                   <input className="w-full p-2.5 border rounded-xl text-sm focus:border-[#89D4FF] focus:outline-none" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
                 </div>
                 <div>
                   <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">Email *</label>
                   <input type="email" className="w-full p-2.5 border rounded-xl text-sm focus:border-[#89D4FF] focus:outline-none" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
                 </div>
                 <div>
                   <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">Password *</label>
                   <input type="text" className="w-full p-2.5 border rounded-xl text-sm focus:border-[#89D4FF] focus:outline-none" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} />
                 </div>
                 <div>
                   <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">Phone *</label>
                   <input className="w-full p-2.5 border rounded-xl text-sm focus:border-[#89D4FF] focus:outline-none" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />
                 </div>
                 <div>
                   <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">Occupation & Address</label>
                   <div className="flex gap-2 mb-2">
                     <input placeholder="Occupation" className="w-1/2 p-2.5 border rounded-xl text-sm focus:border-[#89D4FF] focus:outline-none" value={form.occupation} onChange={(e) => setForm({...form, occupation: e.target.value})} />
                     <input placeholder="City / Address" className="w-1/2 p-2.5 border rounded-xl text-sm focus:border-[#89D4FF] focus:outline-none" value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} />
                   </div>
                 </div>
              </div>

              {/* Right Column: Mapping Students */}
              <div className="space-y-4 flex flex-col h-full pl-6 border-l border-gray-100">
                 <h3 className="text-sm font-bold text-gray-700 pb-2 border-b border-gray-100">Select Children (Students)</h3>
                 <p className="text-xs text-gray-400">Select unassigned students below to link them to this parent account immediately.</p>
                 
                 <div className="flex-1 min-h-[250px] max-h-[300px] overflow-y-auto border border-gray-200 rounded-xl bg-gray-50 p-2">
                    {unassignedStudents.length === 0 ? (
                      <div className="text-center py-10 text-gray-400 text-xs">No unassigned students found. Every student already has a parent linked!</div>
                    ) : (
                      unassignedStudents.map((stu) => (
                        <div 
                          key={stu._id} 
                          onClick={() => toggleStudentSelection(stu._id)}
                          className={`p-3 mb-2 rounded-lg border text-sm cursor-pointer transition flex items-center justify-between ${form.childrenIds.includes(stu._id) ? "bg-[#89D4FF]/10 border-[#89D4FF] text-[#1a8fc7]" : "bg-white border-gray-200 text-gray-600 hover:border-[#89D4FF]/50"}`}
                        >
                          <div>
                            <p className="font-bold">{stu.name}</p>
                            <p className="text-[10px]">Cls {stu.class} {stu.section} • Roll {stu.rollNumber}</p>
                          </div>
                          {form.childrenIds.includes(stu._id) && <Link size={14} />}
                        </div>
                      ))
                    )}
                 </div>
                 
                 <div className="pt-2">
                    <p className="text-xs text-center font-bold text-[#89D4FF]">{form.childrenIds.length} Child(ren) Selected</p>
                 </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 font-semibold text-gray-500 hover:bg-gray-100 rounded-xl transition text-sm">Cancel</button>
              <button onClick={handleCreate} className="px-6 py-2.5 bg-[#89D4FF] text-white font-bold rounded-xl hover:bg-[#6ac0f0] transition shadow-md text-sm">Add Parent & Link</button>
            </div>
          </div>
        </div>
      )}
    </AdminSidebar>
  );

}