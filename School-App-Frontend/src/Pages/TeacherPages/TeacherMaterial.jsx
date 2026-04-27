import React, { useState, useEffect } from "react";
import TeacherSidebar from "../../Layouts/TeacherSidebar";
import {
  Upload, FolderOpen, Trash2, Download, FileText,
  FileImage, File, Link2, BookOpen, Plus, X, ChevronDown
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
  "application/msword": { icon: FileText, color: "text-blue-600", bg: "bg-blue-50", label: "Word" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { icon: FileText, color: "text-blue-600", bg: "bg-blue-50", label: "Word" },
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

export default function TeacherMaterial() {
  const [classes, setClasses] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [filterClass, setFilterClass] = useState("");
  const [filterSection, setFilterSection] = useState("");
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(null);

  // Form state
  const [form, setForm] = useState({
    title: "", description: "", subject: "", class: "", section: "", externalLink: "",
  });
  const [file, setFile] = useState(null);
  const [uploadMode, setUploadMode] = useState("file"); // "file" | "link"
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Unique classes/sections
  const uniqueClasses = [...new Set(classes.map(c => c.class))];
  const sectionsForClass = classes.filter(c => c.class === (filterClass || form.class));
  const subjectsForClass = classes.find(c => c.class === form.class && c.section === form.section)?.subjects || [];

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchMaterials();
  }, [filterClass, filterSection]);

  const fetchClasses = async () => {
    try {
      const data = await api("/materials/teacher/classes");
      setClasses(data);
      if (data.length > 0) {
        setFilterClass(data[0].class);
        setFilterSection(data[0].section);
      }
    } catch (err) {
      setError("Could not load your classes.");
    } finally {
      setLoadingClasses(false);
    }
  };

  const fetchMaterials = async () => {
    setLoadingMaterials(true);
    try {
      let url = "/materials/teacher/my";
      const params = [];
      if (filterClass) params.push(`class=${filterClass}`);
      if (filterSection) params.push(`section=${filterSection}`);
      if (params.length) url += "?" + params.join("&");
      const data = await api(url);
      setMaterials(data);
    } catch (err) {
      setError("Could not load materials.");
    } finally {
      setLoadingMaterials(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.class || !form.section || !form.subject) {
      setError("Please fill in all required fields.");
      return;
    }
    if (uploadMode === "file" && !file) {
      setError("Please select a file to upload.");
      return;
    }
    if (uploadMode === "link" && !form.externalLink) {
      setError("Please enter a link.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("subject", form.subject);
      formData.append("class", form.class);
      formData.append("section", form.section);
      if (uploadMode === "file" && file) {
        formData.append("file", file);
      } else {
        formData.append("externalLink", form.externalLink);
      }

      const res = await fetch(`${API_BASE_URL}/materials/teacher/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Upload failed");
      }

      setSuccess("Material uploaded successfully!");
      setShowModal(false);
      setForm({ title: "", description: "", subject: "", class: "", section: "", externalLink: "" });
      setFile(null);
      setTimeout(() => setSuccess(""), 3000);
      fetchMaterials();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this material? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await api(`/materials/teacher/${id}`, { method: "DELETE" });
      setMaterials((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      alert("Delete failed: " + err.message);
    } finally {
      setDeleting(null);
    }
  };

  const openModal = () => {
    // Pre-fill class/section from filter
    setForm(prev => ({
      ...prev,
      class: filterClass || (classes[0]?.class || ""),
      section: filterSection || (classes[0]?.section || ""),
    }));
    setError("");
    setShowModal(true);
  };

  return (
    <TeacherSidebar>
      <div className="space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Study Material</h1>
            <p className="text-sm text-gray-400 mt-1">Upload notes, PDFs & resources for your classes</p>
          </div>
          <button
            onClick={openModal}
            className="flex items-center gap-2 bg-[#89D4FF] hover:bg-[#6ac0f0] text-white font-bold px-5 py-3 rounded-2xl shadow-lg shadow-[#89D4FF]/30 transition hover:-translate-y-0.5 w-full sm:w-auto justify-center"
          >
            <Plus size={18} /> Upload Material
          </button>
        </div>

        {/* ── Alerts ── */}
        {success && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
            ✅ {success}
          </div>
        )}
        {error && !showModal && (
          <div className="flex items-center justify-between bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
            {error}
            <button onClick={() => setError("")}><X size={16} /></button>
          </div>
        )}

        {/* ── Filters ── */}
        {loadingClasses ? (
          <div className="flex items-center gap-3 py-6">
            <div className="w-6 h-6 border-2 border-[#89D4FF] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-500">Loading your classes...</span>
          </div>
        ) : classes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <BookOpen className="mx-auto text-gray-300 mb-4" size={48} strokeWidth={1} />
            <p className="text-gray-500 font-semibold">No classes assigned to you yet.</p>
            <p className="text-gray-400 text-sm mt-1">Contact admin to assign you to a class.</p>
          </div>
        ) : (
          <>
            {/* Class/Section Tabs */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="flex flex-wrap gap-2">
                {classes.map((c, i) => {
                  const isActive = filterClass === c.class && filterSection === c.section;
                  return (
                    <button
                      key={i}
                      onClick={() => { setFilterClass(c.class); setFilterSection(c.section); }}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                        isActive
                          ? "bg-[#89D4FF] text-white shadow-md shadow-[#89D4FF]/30"
                          : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      Class {c.class} – {c.section}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Materials Grid ── */}
            {loadingMaterials ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-3 border-[#89D4FF] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : materials.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                <FolderOpen className="mx-auto text-gray-300 mb-4" size={48} strokeWidth={1} />
                <p className="text-gray-500 font-semibold">No materials uploaded yet</p>
                <p className="text-gray-400 text-sm mt-1">Click "Upload Material" to add your first resource.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {materials.map((mat) => {
                  const info = mat.fileType ? getFileInfo(mat.fileType) : { icon: Link2, color: "text-purple-500", bg: "bg-purple-50", label: "Link" };
                  const Icon = info.icon;
                  return (
                    <div key={mat._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition p-5 flex flex-col gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`w-11 h-11 rounded-xl ${info.bg} flex items-center justify-center flex-shrink-0`}>
                          <Icon className={info.color} size={22} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-800 text-sm leading-tight truncate">{mat.title}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">{mat.subject} • Class {mat.class}-{mat.section}</p>
                        </div>
                        <span className={`text-[10px] font-black px-2 py-1 rounded-full ${info.bg} ${info.color} flex-shrink-0`}>
                          {info.label}
                        </span>
                      </div>

                      {mat.description && (
                        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{mat.description}</p>
                      )}

                      <div className="flex items-center justify-between mt-auto pt-1 border-t border-gray-50">
                        <div className="text-[10px] text-gray-400 font-medium">
                          {new Date(mat.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          {mat.fileSize && <span className="ml-2 text-gray-300">• {formatSize(mat.fileSize)}</span>}
                        </div>
                        <div className="flex gap-1">
                          {mat.filePath && (
                            <a
                              href={`${API_BASE_URL}/materials/download/${mat._id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                              title="Download"
                            >
                              <Download size={15} />
                            </a>
                          )}
                          {mat.externalLink && (
                            <a
                              href={mat.externalLink}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 transition"
                              title="Open Link"
                            >
                              <Link2 size={15} />
                            </a>
                          )}
                          <button
                            onClick={() => handleDelete(mat._id)}
                            disabled={deleting === mat._id}
                            className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Upload Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="font-bold text-gray-800 text-lg">Upload Study Material</h2>
                <p className="text-xs text-gray-400 mt-0.5">Add resource for a specific class</p>
              </div>
              <button
                onClick={() => { setShowModal(false); setError(""); }}
                className="p-2 rounded-xl hover:bg-gray-100 transition text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {/* Class & Section */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Class *</label>
                  <select
                    value={form.class}
                    onChange={(e) => setForm({ ...form, class: e.target.value, section: "", subject: "" })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#89D4FF]/30"
                    required
                  >
                    <option value="">Select Class</option>
                    {uniqueClasses.map((c, i) => <option key={i} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Section *</label>
                  <select
                    value={form.section}
                    onChange={(e) => setForm({ ...form, section: e.target.value, subject: "" })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#89D4FF]/30"
                    required
                    disabled={!form.class}
                  >
                    <option value="">Select Section</option>
                    {sectionsForClass.map((c, i) => <option key={i} value={c.section}>{c.section}</option>)}
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Subject *</label>
                <select
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#89D4FF]/30"
                  required
                  disabled={!form.section}
                >
                  <option value="">Select Subject</option>
                  {subjectsForClass.map((s, i) => <option key={i} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Chapter 3 – Chemical Reactions Notes"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#89D4FF]/30"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Description (optional)</label>
                <textarea
                  rows={2}
                  placeholder="Brief description of this material..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#89D4FF]/30 resize-none"
                />
              </div>

              {/* Upload Mode Toggle */}
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Material Type *</label>
                <div className="flex rounded-xl border border-gray-200 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setUploadMode("file")}
                    className={`flex-1 py-2.5 text-sm font-bold flex items-center justify-center gap-2 transition ${
                      uploadMode === "file" ? "bg-[#89D4FF] text-white" : "bg-white text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <Upload size={15} /> Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMode("link")}
                    className={`flex-1 py-2.5 text-sm font-bold flex items-center justify-center gap-2 transition ${
                      uploadMode === "link" ? "bg-[#89D4FF] text-white" : "bg-white text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <Link2 size={15} /> External Link
                  </button>
                </div>
              </div>

              {uploadMode === "file" ? (
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">
                    File (PDF, Word, PPT, Images — max 20MB)
                  </label>
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-6 cursor-pointer hover:border-[#89D4FF] hover:bg-blue-50/30 transition">
                    {file ? (
                      <div className="text-center">
                        <FileText className="mx-auto text-[#89D4FF] mb-2" size={28} />
                        <p className="text-sm font-bold text-gray-700 truncate max-w-[200px]">{file.name}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatSize(file.size)}</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="mx-auto text-gray-300 mb-2" size={28} />
                        <p className="text-sm text-gray-500 font-medium">Click to select file</p>
                        <p className="text-xs text-gray-400 mt-1">PDF, Word, PPT, Image</p>
                      </div>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.txt"
                      onChange={(e) => setFile(e.target.files[0] || null)}
                    />
                  </label>
                  {file && (
                    <button type="button" onClick={() => setFile(null)} className="mt-1 text-xs text-red-500 hover:underline">
                      Remove file
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Link URL *</label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={form.externalLink}
                    onChange={(e) => setForm({ ...form, externalLink: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#89D4FF]/30"
                  />
                  <p className="text-xs text-gray-400 mt-1">Works with Google Drive, YouTube, etc.</p>
                </div>
              )}

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setError(""); }}
                  className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-2xl hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#89D4FF] text-white font-bold py-3 rounded-2xl hover:bg-[#6ac0f0] transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <><Upload size={16} /> Upload</>
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
