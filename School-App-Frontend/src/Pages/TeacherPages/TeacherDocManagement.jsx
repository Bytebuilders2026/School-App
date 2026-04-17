import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../apiConfig";
import { ClipboardList, User, FileText, Upload, CheckCircle2, XCircle, Clock, Save, Info } from "lucide-react";
import TeacherSidebar from "../../Layouts/TeacherSidebar";

export default function TeacherDocManagement() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [status, setStatus] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");
  const [teacherNote, setTeacherNote] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/doc-requests/teacher`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setRequests(res.data.data);
    } catch (err) {
      console.error("Error fetching requests", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenUpdate = (req) => {
    setSelectedRequest(req);
    setStatus(req.status);
    setDocumentUrl(req.documentUrl || "");
    setTeacherNote(req.teacherNote || "");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await axios.put(
        `${API_BASE_URL}/doc-requests/${selectedRequest._id}/update`,
        { status, documentUrl, teacherNote },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setSelectedRequest(null);
      fetchRequests();
      alert("Request updated successfully!");
    } catch (err) {
      alert("Error updating request");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "pending": return "bg-amber-100 text-amber-700 border-amber-200";
      case "processing": return "bg-blue-100 text-blue-700 border-blue-200";
      case "completed": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "rejected": return "bg-rose-100 text-rose-700 border-rose-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <TeacherSidebar className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Student Document Requests</h1>
        <p className="text-gray-500 mt-1">Manage and fulfill certificates requested by students.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-96">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 mt-4 font-medium italic">Loading student requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-gray-200">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-6">
            <ClipboardList size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-800">No requests found</h3>
          <p className="text-gray-500 max-w-sm mx-auto mt-2">When students request certificates from you, they will appear here for processing.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((req) => (
            <div key={req._id} className="bg-white rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden group hover:border-indigo-200 transition-all flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider flex items-center gap-1.5 ${getStatusStyle(req.status)}`}>
                    {req.status === "completed" ? <CheckCircle2 size={12}/> : <Clock size={12} className={req.status === 'processing' ? 'animate-spin' : ''} />}
                    {req.status}
                  </div>
                  <span className="text-[10px] text-gray-400 font-bold">{new Date(req.createdAt).toLocaleDateString()}</span>
                </div>

                <h3 className="text-lg font-bold text-gray-800 mb-1">{req.docType}</h3>
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm mb-4">
                  <User size={14} />
                  <span>{req.student?.name}</span>
                  <span className="text-gray-300 font-normal">|</span>
                  <span className="text-gray-500 font-medium">Class {req.student?.class}-{req.student?.section}</span>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5"><FileText size={12} /> Student's Query</p>
                  <p className="text-sm text-gray-600 italic line-clamp-3">"{req.reason}"</p>
                </div>

                {req.teacherNote && (
                  <div className="flex items-start gap-2 text-xs text-gray-500 mb-4 px-1">
                    <Info size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />
                    <p className="line-clamp-2"><span className="font-bold text-gray-700">Your Note:</span> {req.teacherNote}</p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-gray-50/50 border-t border-gray-50 group-hover:bg-indigo-50/30 transition-colors">
                <button
                  onClick={() => handleOpenUpdate(req)}
                  className="w-full bg-white hover:bg-indigo-600 text-indigo-600 hover:text-white border border-indigo-100 font-bold py-3 rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <Upload size={16} />
                  Process Action
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* UPDATE MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-indigo-600 p-8 text-white relative">
              <button 
                onClick={() => setSelectedRequest(null)}
                className="absolute top-6 right-6 text-indigo-200 hover:text-white transition"
              >
                <XCircle size={24} />
              </button>
              <h2 className="text-2xl font-bold mb-1">Update Request</h2>
              <p className="text-indigo-100 text-sm opacity-80">Processing {selectedRequest.docType} for {selectedRequest.student?.name}</p>
            </div>

            <form onSubmit={handleUpdate} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Update Status</label>
                <div className="grid grid-cols-3 gap-3">
                  {["pending", "processing", "completed", "rejected"].slice(1).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
                      className={`py-3 rounded-2xl text-[11px] font-bold uppercase tracking-wider border transition-all ${
                        status === s 
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100" 
                        : "bg-gray-50 text-gray-500 border-gray-100 hover:border-indigo-100"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Document URL (PDF/Image)</label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <Upload size={16} />
                   </div>
                   <input
                    type="text"
                    value={documentUrl}
                    onChange={(e) => setDocumentUrl(e.target.value)}
                    placeholder="https://example.com/certificate.pdf"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 pl-12 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-2 ml-1 italic">Paste the link to the generated document here.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Internal Note / Message</label>
                <textarea
                  value={teacherNote}
                  onChange={(e) => setTeacherNote(e.target.value)}
                  placeholder="Additional information for the student..."
                  rows="3"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
                ></textarea>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-4 rounded-2xl transition hover:shadow-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                >
                  {updating ? "Saving..." : (
                    <>
                      <Save size={20} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </TeacherSidebar>
  );
}
