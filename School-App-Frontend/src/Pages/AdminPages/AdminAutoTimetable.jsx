import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../axiosInstance";
import AdminSidebar from "../../Layouts/AdminSidebar";
import { Zap, CheckCircle, AlertCircle, Loader2, ArrowRight, Calendar } from "lucide-react";

const AdminAutoTimetable = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    classStr: "",
    section: "",
    periodsPerDay: 8,
    days: "Monday,Tuesday,Wednesday,Thursday,Friday,Saturday"
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);   // { success, message, summary }
  const [error, setError]   = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const payload = {
        class: formData.classStr.trim(),
        section: formData.section.trim().toUpperCase(),
        periodsPerDay: parseInt(formData.periodsPerDay),
        days: formData.days.split(",").map(d => d.trim()).filter(Boolean)
      };
      const res = await axiosInstance.post("/autotimetable/generate", payload);
      setResult({
        message: res.data.message,
        summary: res.data.summary || [],
        classStr: payload.class,
        section: payload.section
      });
    } catch (err) {
      const data = err.response?.data;
      const msg =
        (typeof data === "string" ? data : null) ||
        data?.error ||
        data?.message ||
        err.message ||
        "Failed to auto-generate timetable.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminSidebar>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
            <Zap size={20} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Auto Timetable Generator</h1>
            <p className="text-sm text-gray-400">AI-assisted constraint-based scheduling</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-700 mb-5">Generate Weekly Timetable</h2>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Class</label>
                  <input
                    type="text" required placeholder="e.g. 8th"
                    value={formData.classStr}
                    onChange={e => setFormData({ ...formData, classStr: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Section</label>
                  <input
                    type="text" required placeholder="e.g. A"
                    value={formData.section}
                    onChange={e => setFormData({ ...formData, section: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Periods Per Day</label>
                <input
                  type="number" required min="1" max="12"
                  value={formData.periodsPerDay}
                  onChange={e => setFormData({ ...formData, periodsPerDay: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Working Days <span className="text-gray-300 font-normal">(comma separated)</span></label>
                <input
                  type="text" required
                  value={formData.days}
                  onChange={e => setFormData({ ...formData, days: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition"
                />
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full mt-2 bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> Generating...</>
                ) : (
                  <><Zap size={18} /> Auto Generate Timetable</>
                )}
              </button>
            </form>
          </div>

          {/* Info + Result Panel */}
          <div className="space-y-4">
            {/* How it works */}
            <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100">
              <h3 className="text-sm font-bold text-indigo-700 mb-3">⚙️ How it works</h3>
              <ul className="space-y-2 text-xs text-indigo-600">
                <li className="flex gap-2"><span className="font-bold">1.</span> Fetches all active teachers assigned to the specified class</li>
                <li className="flex gap-2"><span className="font-bold">2.</span> Distributes their subjects across periods using round-robin scheduling</li>
                <li className="flex gap-2"><span className="font-bold">3.</span> Inserts a Recess period at the midpoint of the day</li>
                <li className="flex gap-2"><span className="font-bold">4.</span> Periods start at 08:00, each lasting 45 minutes</li>
                <li className="flex gap-2"><span className="font-bold">5.</span> Replaces any existing timetable for this class-section</li>
              </ul>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex gap-3">
                <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-red-700 mb-1">Generation Failed</p>
                  <p className="text-xs text-red-600">{error}</p>
                </div>
              </div>
            )}

            {/* Success Result */}
            {result && (
              <div className="bg-green-50 border border-green-100 rounded-2xl p-5 space-y-4">
                <div className="flex gap-3">
                  <CheckCircle size={20} className="text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-green-700 mb-1">Timetable Generated!</p>
                    <p className="text-xs text-green-600">{result.message}</p>
                  </div>
                </div>

                {/* Teachers used badge */}
                {result.teachersUsed && (
                  <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-green-100">
                    <span className="text-xs text-gray-500">Teachers used:</span>
                    <span className="text-xs font-bold text-indigo-600">{result.teachersUsed}</span>
                    <span className="ml-auto text-[10px] text-green-600 font-semibold">✓ No conflicts</span>
                  </div>
                )}

                {result.summary.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2">Generated Days:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {result.summary.map((s) => (
                        <div key={s.day} className={`bg-white rounded-xl px-3 py-2 flex items-center gap-2 border ${s.unassigned > 0 ? "border-orange-200" : "border-green-100"}`}>
                          <Calendar size={13} className={s.unassigned > 0 ? "text-orange-400" : "text-green-500"} />
                          <span className="text-xs font-semibold text-gray-700">{s.day}</span>
                          <span className="ml-auto text-[10px] text-gray-400">{s.periodsCount} periods</span>
                          {s.unassigned > 0 && (
                            <span className="text-[10px] text-orange-500 font-bold">{s.unassigned} TBD</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Conflict warning */}
                {result.conflicts && result.conflicts.length > 0 && (
                  <div className="bg-orange-50 border border-orange-100 rounded-xl p-3">
                    <p className="text-xs font-bold text-orange-700 mb-1">⚠️ {result.conflicts.length} slot(s) unassigned</p>
                    <p className="text-[11px] text-orange-600">All teachers were already scheduled at these times for other classes. Consider adding more teachers.</p>
                  </div>
                )}

                <button
                  onClick={() => navigate("/admin/timetable")}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 text-white text-sm font-bold py-2.5 rounded-xl hover:bg-green-700 transition"
                >
                  View Timetable <ArrowRight size={16} />
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </AdminSidebar>
  );
};

export default AdminAutoTimetable;
