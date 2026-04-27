import React, { useState, useEffect } from "react";
import StudentSidebar from "../../Layouts/StudentSidebar";
import {
  FolderOpen, Download, FileText,
  FileImage, File, Link2, BookOpen, Search, X
} from "lucide-react";
import { API_BASE_URL } from "../../apiConfig";

const api = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE_URL}${url}`, {
    headers: { Authorization: `Bearer ${token}`, ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Request failed");
  }
  return res.json();
};

const FILE_ICON = {
  "application/pdf": { icon: FileText, color: "text-red-500", bg: "bg-red-50", label: "PDF" },
  "application/msword": { icon: FileText, color: "text-[#8884d8]", bg: "bg-indigo-50", label: "Word" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { icon: FileText, color: "text-[#8884d8]", bg: "bg-indigo-50", label: "Word" },
  "application/vnd.ms-powerpoint": { icon: FileText, color: "text-orange-500", bg: "bg-orange-50", label: "PPT" },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": { icon: FileText, color: "text-orange-500", bg: "bg-orange-50", label: "PPT" },
  "image/jpeg": { icon: FileImage, color: "text-green-500", bg: "bg-green-50", label: "Image" },
  "image/png": { icon: FileImage, color: "text-green-500", bg: "bg-green-50", label: "Image" },
  "text/plain": { icon: FileText, color: "text-gray-500", bg: "bg-gray-50", label: "Text" },
};

function getFileInfo(fileType) {
  return FILE_ICON[fileType] || { icon: File, color: "text-gray-500", bg: "bg-gray-100", label: "File" };
}

function formatSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function StudentMaterial() {
  const [materials, setMaterials] = useState([]);
  const [filterSubject, setFilterSubject] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMaterials();
  }, [filterSubject]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      let url = "/materials/student/my-class";
      if (filterSubject) {
        url += `?subject=${encodeURIComponent(filterSubject)}`;
      }
      const data = await api(url);
      setMaterials(data);
      setError("");
    } catch (err) {
      setError("Could not load study materials.");
    } finally {
      setLoading(false);
    }
  };

  const uniqueSubjects = [...new Set(materials.map(m => m.subject))];
  
  const filteredMaterials = materials.filter(m => 
    !searchQuery || m.title.toLowerCase().includes(searchQuery.toLowerCase()) || m.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <StudentSidebar>
      <div className="space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Study Material</h1>
            <p className="text-sm text-gray-400 mt-1">Access notes, PDFs & resources shared by your teachers</p>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search materials..."
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl border-none bg-white shadow-sm focus:ring-2 focus:ring-[#8884d8]/20 outline-none text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center justify-between bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
            {error}
            <button onClick={() => setError("")}><X size={16} /></button>
          </div>
        )}

        {/* ── Filters ── */}
        {!loading && materials.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm overflow-x-auto whitespace-nowrap scrollbar-hide">
            <div className="flex gap-2">
              <button
                onClick={() => setFilterSubject("")}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  filterSubject === ""
                    ? "bg-[#8884d8] text-white shadow-md shadow-[#8884d8]/30"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                All Subjects
              </button>
              {uniqueSubjects.map((sub, i) => (
                <button
                  key={i}
                  onClick={() => setFilterSubject(sub)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    filterSubject === sub
                      ? "bg-[#8884d8] text-white shadow-md shadow-[#8884d8]/30"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Materials Grid ── */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-3 border-[#8884d8] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
            {searchQuery ? (
              <>
                <Search className="mx-auto text-gray-300 mb-4" size={48} strokeWidth={1} />
                <p className="text-gray-500 font-semibold">No results found for "{searchQuery}"</p>
                <p className="text-gray-400 text-sm mt-1">Try a different search term</p>
              </>
            ) : (
              <>
                <FolderOpen className="mx-auto text-gray-300 mb-4" size={48} strokeWidth={1} />
                <p className="text-gray-500 font-semibold">No materials found</p>
                <p className="text-gray-400 text-sm mt-1">Your teachers haven't uploaded any study material yet.</p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredMaterials.map((mat) => {
              const info = mat.fileType ? getFileInfo(mat.fileType) : { icon: Link2, color: "text-purple-500", bg: "bg-purple-50", label: "Link" };
              const Icon = info.icon;
              return (
                <div key={mat._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition p-5 flex flex-col gap-3 group">
                  <div className="flex items-start gap-3">
                    <div className={`w-11 h-11 rounded-xl ${info.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                      <Icon className={info.color} size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-sm leading-tight truncate" title={mat.title}>{mat.title}</p>
                      <p className="text-[11px] text-[#8884d8] font-bold mt-0.5">{mat.subject}</p>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-1 rounded-full ${info.bg} ${info.color} flex-shrink-0`}>
                      {info.label}
                    </span>
                  </div>

                  {mat.description && (
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{mat.description}</p>
                  )}

                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                    <div className="flex flex-col">
                        <div className="text-[10px] text-gray-400 font-medium">
                        Uploaded by {mat.teacher?.name || "Teacher"}
                        </div>
                        <div className="text-[9px] text-gray-300 font-medium mt-0.5">
                        {new Date(mat.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        {mat.fileSize && <span className="ml-1">• {formatSize(mat.fileSize)}</span>}
                        </div>
                    </div>
                    <div className="flex gap-1">
                      {mat.filePath ? (
                        <a
                          href={`${API_BASE_URL}/materials/download/${mat._id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#8884d8] text-white hover:bg-[#7169c9] transition shadow-md shadow-[#8884d8]/20"
                        >
                          <Download size={14} /> <span className="text-xs font-bold">Download</span>
                        </a>
                      ) : (
                        <a
                          href={mat.externalLink}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500 text-white hover:bg-purple-600 transition shadow-md shadow-purple-500/20"
                        >
                          <Link2 size={14} /> <span className="text-xs font-bold">Open Link</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </StudentSidebar>
  );
}
