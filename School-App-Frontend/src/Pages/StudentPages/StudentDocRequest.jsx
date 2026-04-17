import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../apiConfig";
import { FilePlus, History, Clock, CheckCircle2, XCircle, ExternalLink, Send } from "lucide-react";
import StudentSidebar from "../../Layouts/StudentSidebar";

export default function StudentDocRequest() {
  const [docType, setDocType] = useState("");
  const [reason, setReason] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const docTypes = [
    "Character Certificate",
    "Transfer Certificate",
    "Bonafide Certificate",
    "Marksheet Copy",
    "Other",
  ];

  useEffect(() => {
    fetchTeachers();
    fetchRequests();
  }, []);

  const fetchTeachers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/doc-requests/teachers`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setTeachers(res.data.data);
    } catch (err) {
      console.error("Error fetching teachers", err);
    }
  };

  const fetchRequests = async () => {
    try {
      setFetching(true);
      const res = await axios.get(`${API_BASE_URL}/doc-requests/student`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setRequests(res.data.data);
    } catch (err) {
      console.error("Error fetching requests", err);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!docType || !teacherId || !reason) return alert("Please fill all fields");

    setLoading(true);
    try {
      await axios.post(
        `${API_BASE_URL}/doc-requests/request`,
        { docType, teacherId, reason },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setDocType("");
      setReason("");
      setTeacherId("");
      fetchRequests();
      alert("Request submitted successfully!");
    } catch (err) {
      alert("Error submitting request");
    } finally {
      setLoading(false);
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

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending": return <Clock size={14} />;
      case "processing": return <Clock size={14} className="animate-spin" />;
      case "completed": return <CheckCircle2 size={14} />;
      case "rejected": return <XCircle size={14} />;
      default: return null;
    }
  };

  return (
    <StudentSidebar className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Document Requests</h1>
        <p className="text-gray-500 mt-1">Request academic certificates and track their processing status.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* NEW REQUEST FORM */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 border border-indigo-50 p-6 sticky top-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
                <FilePlus size={22} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">New Request</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Document Type</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select Document</option>
                  {docTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Assign to Teacher</label>
                <select
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select Teacher</option>
                  {teachers.map((t) => (
                    <option key={t._id} value={t._id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Detailed Reason</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Why do you need this document?"
                  rows="4"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all flex items-center justify-center gap-2 group"
              >
                {loading ? "Submitting..." : (
                  <>
                    <span>Submit Request</span>
                    <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* REQUEST HISTORY */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-50 p-6 min-h-[600px]">
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gray-50 text-gray-600 rounded-2xl">
                    <History size={22} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Request History</h2>
                </div>
                <button 
                  onClick={fetchRequests} 
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 px-4 py-2 hover:bg-indigo-50 rounded-xl transition"
                >
                  Refresh
                </button>
             </div>

             {fetching ? (
               <div className="flex flex-col items-center justify-center h-80">
                  <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-400 mt-4 font-medium italic">Getting your requests...</p>
               </div>
             ) : requests.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-80 text-center px-10">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-6">
                    <History size={40} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-400">No requests yet</h3>
                  <p className="text-sm text-gray-400 max-w-xs mt-2">Fill the form on the left to start requesting your academic documents.</p>
               </div>
             ) : (
               <div className="space-y-4">
                 {requests.map((req) => (
                   <div key={req._id} className="group bg-gray-50/50 hover:bg-white border border-gray-100 hover:border-indigo-100 rounded-3xl p-5 transition-all hover:shadow-xl hover:shadow-indigo-50/50">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <h4 className="text-lg font-bold text-gray-800">{req.docType}</h4>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5 ${getStatusStyle(req.status)} uppercase tracking-wider`}>
                              {getStatusIcon(req.status)}
                              {req.status === 'processing' ? 'Action Required' : req.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 font-medium">Assigned to: <span className="text-indigo-600">{req.teacher?.name}</span> • {new Date(req.createdAt).toLocaleDateString()}</p>
                        </div>

                        {req.status === "completed" && req.documentUrl && (
                          <a 
                            href={req.documentUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-lg shadow-indigo-100 flex items-center gap-2 transition-all active:scale-95"
                          >
                            <ExternalLink size={14} />
                            View Document
                          </a>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-600 italic">
                          <span className="font-bold text-gray-400 not-italic mr-1">Query:</span> "{req.reason}"
                        </p>
                        {req.teacherNote && (
                          <div className="mt-2 p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                            <p className="text-[11px] text-indigo-700">
                              <span className="font-bold uppercase mr-2 tracking-wider opacity-60">Teacher's Note:</span>
                              {req.teacherNote}
                            </p>
                          </div>
                        )}
                      </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>

      </div>
    </StudentSidebar>
  );
}
