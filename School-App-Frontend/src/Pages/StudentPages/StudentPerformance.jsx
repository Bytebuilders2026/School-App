import { useState, useEffect, useRef } from "react";
import axios from "axios";
import StudentSidebar from "../../Layouts/StudentSidebar";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, TrendingDown, AlertTriangle, Lightbulb, MessageSquare, BrainCircuit, Activity, Shield, BookOpen, ArrowUp, ArrowDown, Send, Zap } from "lucide-react";

import { API_BASE_URL } from "../../apiConfig";

const API = API_BASE_URL;

export default function StudentPerformance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatQuery, setChatQuery] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchPerformance();
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
       chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const fetchPerformance = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/performance/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatQuery.trim()) return;

    const userMessage = { sender: 'user', text: chatQuery };
    setChatMessages(prev => [...prev, userMessage]);
    setChatQuery("");

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API}/performance/chatbot`, { query: userMessage.text }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const botMessage = { sender: 'bot', text: res.data.response };
      setChatMessages(prev => [...prev, botMessage]);
    } catch (err) {
      setChatMessages(prev => [...prev, { sender: 'bot', text: "Sorry, I couldn't process that request right now." }]);
    }
  };

  if (loading) {
    return (
      <StudentSidebar>
        <div className="flex items-center justify-center h-[70vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#89D4FF] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-gray-400 animate-pulse">Analyzing your performance...</p>
          </div>
        </div>
      </StudentSidebar>
    );
  }

  if (!data) return <StudentSidebar><p className="text-center text-gray-400 mt-20">No performance data available.</p></StudentSidebar>;

  const { metrics, riskLevel, insights, suggestions, trends } = data;

  const riskConfig = {
    high: { color: "text-red-600", bg: "bg-red-50", border: "border-red-200", badge: "bg-red-500", glow: "shadow-red-200" },
    medium: { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-500", glow: "shadow-amber-200" },
    low: { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", badge: "bg-emerald-500", glow: "shadow-emerald-200" }
  };

  const risk = riskConfig[riskLevel] || riskConfig.low;

  // Circular Progress for Risk Score
  const scorePercent = Math.min(metrics.performanceScore || 0, 100);
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (scorePercent / 100) * circumference;

  return (
    <StudentSidebar>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
           <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Zap size={22} className="text-[#89D4FF]" />
                AI Performance Intelligence
              </h1>
              <p className="text-sm text-gray-400 mt-1">Real-time risk prediction & trend analysis</p>
           </div>
           
           <div className={`px-5 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 ${risk.badge} text-white shadow-lg ${risk.glow}`}>
               {riskLevel === "high" && <AlertTriangle size={14} />}
               {riskLevel === "medium" && <Shield size={14} />}
               Risk: {riskLevel}
           </div>
        </div>

        {/* Top Row: Risk Score Circle + Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Circular Risk Score */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center">
            <svg width="128" height="128" viewBox="0 0 128 128">
              <circle cx="64" cy="64" r="54" fill="none" stroke="#f3f4f6" strokeWidth="10" />
              <circle 
                cx="64" cy="64" r="54" fill="none" 
                stroke={riskLevel === "high" ? "#ef4444" : riskLevel === "medium" ? "#f59e0b" : "#10b981"} 
                strokeWidth="10" 
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 64 64)"
                style={{ transition: "stroke-dashoffset 1s ease" }}
              />
              <text x="64" y="58" textAnchor="middle" className="text-2xl font-black" fill="#1f2937">{scorePercent}</text>
              <text x="64" y="78" textAnchor="middle" className="text-[10px] font-bold" fill="#9ca3af">RISK SCORE</text>
            </svg>
          </div>

          {/* Attendance */}
          <MetricCard 
            label="Attendance" 
            value={`${metrics.attendancePercentage}%`} 
            trend={metrics.attendanceTrend} 
            icon={<Activity size={18} />}
            color="#89D4FF"
          />

          {/* Average Marks */}
          <MetricCard 
            label="Avg Marks" 
            value={`${metrics.averageMarks}%`} 
            trend={metrics.marksTrend} 
            icon={<BookOpen size={18} />}
            color="#8884d8"
          />

          {/* Missing Homework */}
          <div className="bg-white border border-gray-100 p-5 flex flex-col justify-center items-center text-center rounded-3xl shadow-sm">
             <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mb-2">
               <AlertTriangle size={18} className="text-orange-500" />
             </div>
             <h2 className="text-3xl font-black text-orange-500">{metrics.missingHomeworkCount || 0}</h2>
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Missing Homework</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* Left Column: Charts and Insights */}
           <div className="lg:col-span-2 space-y-6">
              
              {/* Marks Trend Chart */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                 <h2 className="font-bold text-gray-700 mb-6 flex items-center gap-2">
                    <Activity size={18} className="text-[#89D4FF]"/>
                    Assessment Performance Trend
                 </h2>
                 <div className="h-[280px] w-full">
                    {trends.marks && trends.marks.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trends.marks}>
                            <defs>
                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#89D4FF" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#89D4FF" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} domain={[0, 100]} />
                            <Tooltip 
                              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', padding: '12px 16px' }}
                              formatter={(value) => [`${value}%`, 'Score']} 
                            />
                            <Area 
                                type="monotone" 
                                dataKey="score" 
                                stroke="#89D4FF" 
                                strokeWidth={3} 
                                fill="url(#colorScore)" 
                                dot={{ strokeWidth: 2, r: 5, fill: 'white', stroke: '#89D4FF' }} 
                                activeDot={{ r: 7, fill: '#89D4FF', stroke: 'white', strokeWidth: 3 }} 
                                label={{ position: 'top', fill: '#3b82f6', fontSize: 12, fontWeight: 'bold', formatter: (v) => `${v}%` }} 
                            />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                           <BookOpen size={40} strokeWidth={1} className="mb-3 text-gray-300" />
                           <p className="text-sm font-medium">No assessment data yet.</p>
                           <p className="text-xs text-gray-300 mt-1">Marks will appear here once uploaded by teachers.</p>
                        </div>
                    )}
                 </div>
              </div>

              {/* AI Insights */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                 <h2 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <BrainCircuit size={18} className="text-[#89D4FF]" />
                    AI Analysis Insights
                 </h2>
                 <div className="space-y-3">
                    {insights.map((insight, idx) => (
                       <div key={idx} className={`flex gap-3 items-start p-4 rounded-2xl border ${
                         insight.includes("Critical") || insight.includes("Alert") 
                           ? "bg-red-50/50 border-red-100" 
                           : insight.includes("performing consistently") 
                             ? "bg-emerald-50/50 border-emerald-100"
                             : "bg-amber-50/50 border-amber-100"
                       }`}>
                          <div className={`mt-0.5 min-w-[10px] h-[10px] rounded-full ${
                            insight.includes("Critical") || insight.includes("Alert") ? "bg-red-500" : 
                            insight.includes("performing consistently") ? "bg-emerald-500" : "bg-amber-500"
                          }`} />
                          <p className="text-sm font-medium text-gray-600 leading-relaxed">{insight}</p>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Right Column: Suggestions + AI Chat */}
           <div className="space-y-6">
               
               {/* Suggestions */}
               <div className={`p-6 rounded-3xl border ${risk.bg} ${risk.border}`}>
                   <h2 className={`font-bold mb-4 flex items-center gap-2 ${risk.color}`}>
                      <Lightbulb size={18} />
                      Action Plan
                   </h2>
                   <ul className="space-y-3">
                      {suggestions.map((sug, idx) => (
                         <li key={idx} className="flex gap-3 text-sm font-medium text-gray-700 items-start">
                            <span className={`${risk.color} font-black text-lg leading-none`}>{idx + 1}</span>
                            <span>{sug}</span>
                         </li>
                      ))}
                   </ul>
               </div>

               {/* AI Chatbox */}
               <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[420px]">
                   <div className="bg-gradient-to-r from-[#89D4FF] to-[#6ab8f0] p-4 text-white flex items-center gap-2">
                      <MessageSquare size={16} />
                      <span className="font-bold text-sm">Ask Performance AI</span>
                   </div>
                   
                   <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30">
                       <div className="flex justify-start">
                          <div className="bg-white border border-gray-100 text-gray-600 text-xs font-medium p-3 rounded-2xl rounded-tl-none max-w-[85%] shadow-sm leading-relaxed">
                              Hi! I'm your AI advisor. Try asking:<br/>
                              • <b>"Why is my risk high?"</b><br/>
                              • <b>"How can I improve?"</b><br/>
                              • <b>"Give me study guidance / weak subjects"</b>
                          </div>
                       </div>

                       {chatMessages.map((msg, i) => (
                           <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                               <div className={`text-xs font-medium p-3 rounded-2xl max-w-[85%] shadow-sm leading-relaxed ${
                                  msg.sender === 'user' 
                                  ? 'bg-[#89D4FF] text-white rounded-tr-none' 
                                  : 'bg-white border border-gray-100 text-gray-600 rounded-tl-none'
                               }`}>
                                  {msg.text}
                               </div>
                           </div>
                       ))}
                       <div ref={chatEndRef} />
                   </div>

                   <form onSubmit={handleChatSubmit} className="p-3 bg-white border-t border-gray-100 flex gap-2">
                       <input 
                          type="text" 
                          value={chatQuery}
                          onChange={e => setChatQuery(e.target.value)}
                          placeholder="Ask about your performance..."
                          className="flex-1 bg-gray-50 text-sm font-medium placeholder:text-gray-400 text-gray-700 px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-[#89D4FF]/20 transition"
                       />
                       <button type="submit" className="bg-[#89D4FF] text-white p-2.5 rounded-xl hover:bg-[#6ab8f0] transition shadow-sm">
                          <Send size={16} />
                       </button>
                   </form>
               </div>
           </div>
        </div>
      </div>
    </StudentSidebar>
  );
}

function MetricCard({ label, value, trend, icon, color }) {
  const isUp = trend?.direction === "up";
  return (
    <div className="bg-white border border-gray-100 p-5 flex flex-col justify-center items-center text-center rounded-3xl shadow-sm">
       <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor: `${color}15` }}>
         <span style={{ color }}>{icon}</span>
       </div>
       <h2 className="text-3xl font-black" style={{ color }}>{value}</h2>
       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{label}</p>
       {trend && (
         <div className={`flex items-center gap-1 mt-2 text-[11px] font-bold ${isUp ? 'text-emerald-500' : 'text-red-500'}`}>
           {isUp ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
           {trend.change}%
         </div>
       )}
    </div>
  );
}
