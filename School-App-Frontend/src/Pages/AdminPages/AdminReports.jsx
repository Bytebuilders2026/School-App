import { useState, useEffect } from "react";
import AdminSidebar from "../../Layouts/AdminSidebar";
import axios from "axios";
import { API_BASE_URL } from "../../apiConfig";
import {
  FileBarChart, Users, TrendingUp, Award, AlertTriangle,
  BookOpen, BarChart2, PieChart, RefreshCw, ChevronDown,
  Star, Target, Activity
} from "lucide-react";

const CLASSES = [
  "Pre-Nursery","Nursery","KG","1st","2nd","3rd","4th","5th",
  "6th","7th","8th","9th","10th","11th","12th"
];
const EXAM_TYPES = ["All", "Midterm", "Final", "Unit Test", "Quiz"];

function MiniBar({ value, max = 100, color = "#6366f1" }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div style={{ background: "#f1f5f9", borderRadius: 8, height: 8, width: "100%", marginTop: 4 }}>
      <div style={{ width: `${pct}%`, background: color, height: 8, borderRadius: 8, transition: "width 0.7s ease" }} />
    </div>
  );
}

function GradeTag({ grade }) {
  const colors = {
    "A+": "#16a34a", "A": "#22c55e", "B+": "#3b82f6", "B": "#60a5fa",
    "C": "#f59e0b", "D": "#f97316", "F": "#ef4444"
  };
  const bg = (colors[grade] || "#64748b") + "18";
  return (
    <span style={{ background: bg, color: colors[grade] || "#64748b", fontWeight: 800, fontSize: 12, padding: "3px 10px", borderRadius: 20 }}>
      {grade}
    </span>
  );
}

export default function AdminReports() {
  const [overview, setOverview] = useState(null);
  const [classReport, setClassReport] = useState(null);
  const [selectedClass, setSelectedClass] = useState("9th");
  const [selectedExam, setSelectedExam] = useState("All");
  const [loading, setLoading] = useState(false);
  const [classLoading, setClassLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview"); // overview | class

  const token = () => localStorage.getItem("token");

  const fetchOverview = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE_URL}/reports/overview`, {
        headers: { Authorization: `Bearer ${token()}` }
      });
      setOverview(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch report overview");
    } finally {
      setLoading(false);
    }
  };

  const fetchClassReport = async () => {
    setClassLoading(true);
    try {
      const params = {};
      if (selectedExam !== "All") params.examType = selectedExam;
      const res = await axios.get(`${API_BASE_URL}/reports/class/${encodeURIComponent(selectedClass)}`, {
        headers: { Authorization: `Bearer ${token()}` },
        params
      });
      setClassReport(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch class report");
    } finally {
      setClassLoading(false);
    }
  };

  useEffect(() => { fetchOverview(); }, []);
  useEffect(() => { if (activeTab === "class") fetchClassReport(); }, [selectedClass, selectedExam, activeTab]);

  // Render SVG-based pie chart (grade distribution)
  function SimplePieChart({ data }) {
    if (!data || data.length === 0) return <div style={{ color: "#94a3b8", textAlign: "center", padding: 20 }}>No data</div>;
    const total = data.reduce((a, b) => a + b.count, 0);
    const COLORS = { "A+": "#16a34a", "A": "#22c55e", "B+": "#3b82f6", "B": "#60a5fa", "C": "#f59e0b", "D": "#f97316", "F": "#ef4444" };
    let startAngle = 0;
    const slices = data.map(d => {
      const pct = d.count / total;
      const angle = pct * 2 * Math.PI;
      const x1 = 80 + 70 * Math.sin(startAngle);
      const y1 = 80 - 70 * Math.cos(startAngle);
      startAngle += angle;
      const x2 = 80 + 70 * Math.sin(startAngle);
      const y2 = 80 - 70 * Math.cos(startAngle);
      const large = pct > 0.5 ? 1 : 0;
      return { d: d._id, count: d.count, pct: (pct * 100).toFixed(1), color: COLORS[d._id] || "#94a3b8", path: `M 80 80 L ${x1} ${y1} A 70 70 0 ${large} 1 ${x2} ${y2} Z` };
    });
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <svg width={160} height={160}>
          {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} stroke="#fff" strokeWidth={2} />)}
          <circle cx={80} cy={80} r={30} fill="#fff" />
          <text x={80} y={85} textAnchor="middle" fontSize={11} fontWeight={700} fill="#374151">{total}</text>
          <text x={80} y={95} textAnchor="middle" fontSize={9} fill="#94a3b8">total</text>
        </svg>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {slices.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: s.color }} />
              <span style={{ fontSize: 12, color: "#374151", fontWeight: 600 }}>{s.d}</span>
              <span style={{ fontSize: 11, color: "#64748b" }}>{s.count} ({s.pct}%)</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "📊 School Overview", icon: Activity },
    { id: "class", label: "📋 Class Report", icon: BarChart2 },
  ];

  return (
    <AdminSidebar>
      <div style={{ fontFamily: "'Inter', sans-serif", maxWidth: 1200 }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ background: "linear-gradient(135deg,#0ea5e9,#6366f1)", borderRadius: 12, padding: "10px 12px" }}>
                <FileBarChart size={22} color="#fff" />
              </div>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1e293b", margin: 0 }}>School Reports</h1>
                <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>Analytics, performance overview & class reports</p>
              </div>
            </div>
            <button onClick={activeTab === "overview" ? fetchOverview : fetchClassReport}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 10, border: "none", background: "#6366f1", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, background: "#f1f5f9", borderRadius: 12, padding: 4, marginBottom: 24, width: "fit-content" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{
                padding: "9px 20px", borderRadius: 9, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer",
                background: activeTab === t.id ? "#fff" : "transparent",
                color: activeTab === t.id ? "#6366f1" : "#64748b",
                boxShadow: activeTab === t.id ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                transition: "all 0.2s"
              }}
            >{t.label}</button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "12px 16px", color: "#b91c1c", fontSize: 13, marginBottom: 16 }}>
            ⚠️ {error}
          </div>
        )}

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <>
            {loading ? (
              <div style={{ textAlign: "center", padding: 80 }}>
                <div style={{ width: 40, height: 40, border: "3px solid #e0e7ff", borderTop: "3px solid #6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
                <p style={{ fontSize: 13, fontWeight: 600, color: "#6366f1" }}>Loading analytics...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
              </div>
            ) : overview ? (
              <>
                {/* KPI Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 24 }}>
                  {[
                    { label: "Total Students", value: overview.totalStudents, icon: Users, color: "#6366f1", bg: "#eef2ff" },
                    { label: "Pass Rate", value: overview.passFailStats?.total ? `${Math.round((overview.passFailStats.pass / overview.passFailStats.total) * 100)}%` : "—", icon: Award, color: "#22c55e", bg: "#f0fdf4" },
                    { label: "Total Exams", value: overview.passFailStats?.total || 0, icon: BookOpen, color: "#f59e0b", bg: "#fffbeb" },
                    { label: "At Risk (<40%)", value: overview.passFailStats?.fail || 0, icon: AlertTriangle, color: "#ef4444", bg: "#fef2f2" },
                  ].map((card, i) => (
                    <div key={i} style={{ background: "#fff", borderRadius: 16, padding: "18px 20px", boxShadow: "0 1px 8px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ background: card.bg, borderRadius: 12, padding: 10 }}>
                        <card.icon size={20} color={card.color} />
                      </div>
                      <div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: "#1e293b" }}>{card.value}</div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>{card.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
                  {/* Grade Distribution Pie */}
                  <div style={{ background: "#fff", borderRadius: 16, padding: "20px 24px", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: "#1e293b", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                      <PieChart size={16} color="#6366f1" /> Grade Distribution
                    </div>
                    <SimplePieChart data={overview.gradeDist || []} />
                  </div>

                  {/* Subject-wise Avg */}
                  <div style={{ background: "#fff", borderRadius: 16, padding: "20px 24px", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: "#1e293b", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                      <BookOpen size={16} color="#6366f1" /> Subject Performance
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {(overview.subjectAvg || []).slice(0, 6).map((s, i) => (
                        <div key={i}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 2 }}>
                            <span>{s._id}</span>
                            <span style={{ color: s.avgMarks >= 60 ? "#22c55e" : s.avgMarks >= 40 ? "#f59e0b" : "#ef4444" }}>{s.avgMarks?.toFixed(1)}%</span>
                          </div>
                          <MiniBar value={s.avgMarks} max={100} color={s.avgMarks >= 60 ? "#22c55e" : s.avgMarks >= 40 ? "#f59e0b" : "#ef4444"} />
                        </div>
                      ))}
                      {(overview.subjectAvg || []).length === 0 && <div style={{ color: "#94a3b8", fontSize: 13, textAlign: "center", padding: 20 }}>No data yet</div>}
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  {/* Top Performers */}
                  <div style={{ background: "#fff", borderRadius: 16, padding: "20px 24px", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: "#1e293b", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                      <Star size={16} color="#f59e0b" /> Top 5 Performers
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {(overview.topPerformers || []).map((s, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#f8fafc", borderRadius: 10, border: "1px solid #f1f5f9" }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800,
                            background: i === 0 ? "#fef3c7" : i === 1 ? "#f1f5f9" : "#fef0e0",
                            color: i === 0 ? "#b45309" : "#64748b"
                          }}>
                            {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>{s.name}</div>
                            <div style={{ fontSize: 11, color: "#94a3b8" }}>{s.class} - Roll #{s.rollNumber}</div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontWeight: 800, fontSize: 15, color: "#22c55e" }}>{s.avgPct}%</div>
                            <div style={{ fontSize: 10, color: "#94a3b8" }}>{s.totalExams} exams</div>
                          </div>
                        </div>
                      ))}
                      {(overview.topPerformers || []).length === 0 && (
                        <div style={{ color: "#94a3b8", fontSize: 13, textAlign: "center", padding: 20 }}>No data yet</div>
                      )}
                    </div>
                  </div>

                  {/* Class-wise Student Count */}
                  <div style={{ background: "#fff", borderRadius: 16, padding: "20px 24px", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: "#1e293b", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                      <Target size={16} color="#6366f1" /> Class-wise Enrollment
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {(overview.classWise || []).map((c, i) => {
                        const max = Math.max(...(overview.classWise || []).map(x => x.count), 1);
                        return (
                          <div key={i}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 2 }}>
                              <span>Class {c._id}</span>
                              <span style={{ color: "#6366f1" }}>{c.count} students</span>
                            </div>
                            <MiniBar value={c.count} max={max} color="#6366f1" />
                          </div>
                        );
                      })}
                      {(overview.classWise || []).length === 0 && (
                        <div style={{ color: "#94a3b8", fontSize: 13, textAlign: "center", padding: 20 }}>No enrollment data</div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: 80 }}>
                <FileBarChart size={48} color="#cbd5e1" />
                <p style={{ color: "#94a3b8", marginTop: 12 }}>No data available. Click Refresh to load.</p>
                <button onClick={fetchOverview} style={{ marginTop: 12, padding: "9px 20px", borderRadius: 10, border: "none", background: "#6366f1", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  Load Report
                </button>
              </div>
            )}
          </>
        )}

        {/* CLASS REPORT TAB */}
        {activeTab === "class" && (
          <>
            {/* Class Filters */}
            <div style={{ background: "#fff", borderRadius: 16, padding: "18px 20px", marginBottom: 20, boxShadow: "0 1px 8px rgba(0,0,0,0.06)", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ position: "relative" }}>
                <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
                  style={{ appearance: "none", padding: "9px 36px 9px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer", background: "#f8fafc" }}>
                  {CLASSES.map(c => <option key={c}>{c}</option>)}
                </select>
                <ChevronDown size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
              </div>
              <div style={{ position: "relative" }}>
                <select value={selectedExam} onChange={e => setSelectedExam(e.target.value)}
                  style={{ appearance: "none", padding: "9px 36px 9px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer", background: "#f8fafc" }}>
                  {EXAM_TYPES.map(e => <option key={e}>{e}</option>)}
                </select>
                <ChevronDown size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
              </div>
              <span style={{ fontSize: 13, color: "#64748b" }}>
                Showing: <strong>Class {selectedClass}</strong> — {selectedExam === "All" ? "All Exams" : selectedExam}
              </span>
            </div>

            {classLoading ? (
              <div style={{ textAlign: "center", padding: 80 }}>
                <div style={{ width: 40, height: 40, border: "3px solid #e0e7ff", borderTop: "3px solid #6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
                <p style={{ fontSize: 13, fontWeight: 600, color: "#6366f1" }}>Loading class report...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
              </div>
            ) : classReport && classReport.students?.length > 0 ? (
              <>
                {/* Class Summary */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16, marginBottom: 24 }}>
                  {(() => {
                    const sts = classReport.students;
                    const avg = sts.length ? (sts.reduce((a, b) => a + b.average, 0) / sts.length).toFixed(1) : 0;
                    const pass = sts.filter(s => s.average >= 40).length;
                    return [
                      { label: "Students", value: sts.length, color: "#6366f1", bg: "#eef2ff", icon: Users },
                      { label: "Class Average", value: `${avg}%`, color: "#22c55e", bg: "#f0fdf4", icon: TrendingUp },
                      { label: "Passed", value: pass, color: "#16a34a", bg: "#f0fdf4", icon: Award },
                      { label: "Failed", value: sts.length - pass, color: "#ef4444", bg: "#fef2f2", icon: AlertTriangle },
                    ].map((c, i) => (
                      <div key={i} style={{ background: "#fff", borderRadius: 16, padding: "16px 18px", boxShadow: "0 1px 8px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ background: c.bg, borderRadius: 12, padding: 9 }}>
                          <c.icon size={18} color={c.color} />
                        </div>
                        <div>
                          <div style={{ fontSize: 20, fontWeight: 800, color: "#1e293b" }}>{c.value}</div>
                          <div style={{ fontSize: 12, color: "#64748b" }}>{c.label}</div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>

                {/* Class Table */}
                <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 1px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                        {["Rank", "Name", "Roll No", "Section", "Avg %", "Grade", "Status"].map(h => (
                          <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {classReport.students.map((s, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}
                          onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{ fontWeight: 800, color: i < 3 ? "#f59e0b" : "#94a3b8" }}>
                              {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px", fontWeight: 700, color: "#1e293b", fontSize: 14 }}>{s.name}</td>
                          <td style={{ padding: "12px 16px", color: "#64748b", fontSize: 13 }}>{s.rollNumber}</td>
                          <td style={{ padding: "12px 16px", color: "#64748b", fontSize: 13 }}>{s.section}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ fontWeight: 800, fontSize: 15, color: "#1e293b", minWidth: 42 }}>{s.average}%</span>
                              <div style={{ flex: 1, minWidth: 80, background: "#f1f5f9", borderRadius: 8, height: 7 }}>
                                <div style={{ width: `${Math.min(s.average, 100)}%`, background: s.average >= 60 ? "#22c55e" : s.average >= 40 ? "#f59e0b" : "#ef4444", height: 7, borderRadius: 8 }} />
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "12px 16px" }}><GradeTag grade={s.subjects.length ? (s.average >= 90 ? "A+" : s.average >= 80 ? "A" : s.average >= 70 ? "B+" : s.average >= 60 ? "B" : s.average >= 50 ? "C" : s.average >= 40 ? "D" : "F") : "—"} /></td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{ background: s.average >= 40 ? "#f0fdf4" : "#fef2f2", color: s.average >= 40 ? "#16a34a" : "#dc2626", fontWeight: 700, fontSize: 12, padding: "3px 12px", borderRadius: 20 }}>
                              {s.average >= 40 ? "✓ Pass" : "✗ Fail"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : !classLoading && (
              <div style={{ textAlign: "center", padding: 80, background: "#fff", borderRadius: 16, boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
                <BarChart2 size={48} color="#cbd5e1" />
                <p style={{ color: "#94a3b8", marginTop: 12, fontSize: 14 }}>No results data found for Class {selectedClass}</p>
                <p style={{ color: "#cbd5e1", fontSize: 12 }}>Marks must be entered by teachers first</p>
              </div>
            )}
          </>
        )}
      </div>
    </AdminSidebar>
  );
}
