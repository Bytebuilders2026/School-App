import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Lock, ShieldCheck, ChevronRight } from "lucide-react";
import { API_BASE_URL } from "../apiConfig";

export default function LoginForm({ role, setRole }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const getPlaceholder = () => {
    if (role === "admin") return "Admin Username/Email";
    if (role === "teacher") return "Teacher Official Email";
    if (role === "student") return "Student Roll Number";
    if (role === "parent") return "Registered Mobile No.";
  };

  const getTheme = () => {
    if (role === "admin") return { color: "from-[#89D4FF] to-[#21a8f3]", text: "text-[#89D4FF]", border: "focus:border-[#89D4FF]", bg: "bg-blue-50/50" };
    if (role === "teacher") return { color: "from-[#6366f1] to-[#4f46e5]", text: "text-[#6366f1]", border: "focus:border-[#6366f1]", bg: "bg-indigo-50/50" };
    if (role === "student") return { color: "from-[#10b981] to-[#059669]", text: "text-[#10b981]", border: "focus:border-[#10b981]", bg: "bg-emerald-50/50" };
    if (role === "parent") return { color: "from-[#8884d8] to-[#7169c9]", text: "text-[#8884d8]", border: "focus:border-[#8884d8]", bg: "bg-purple-50/50" };
    return { color: "from-blue-600 to-indigo-600", text: "text-blue-500", border: "focus:border-blue-500", bg: "bg-blue-50/50" };
  };

  const theme = getTheme();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, {
        role,
        identifier,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("profile", JSON.stringify(res.data.profile));

      if (res.data.profile?.class) {
        localStorage.setItem("studentClass", res.data.profile.class);
      }

      const userRole = res.data.role;
      if (userRole === "admin") navigate("/admin/dashboard");
      if (userRole === "teacher") navigate("/teacher/dashboard");
      if (userRole === "student") navigate("/student/dashboard");
      if (userRole === "parent") navigate("/parent/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.error || "Invalid Credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 sm:p-12 rounded-[3rem] border border-slate-100 shadow-2xl relative overflow-hidden group">
      {/* Subtle Background Accent */}
      <div className={`absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br ${theme.color} opacity-[0.03] rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700`}></div>

      {/* Header */}
      <div className="flex flex-col items-center mb-10 text-center relative z-10">
        <button
          onClick={() => setRole(null)}
          className="group/back flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all mb-6 font-black text-[10px] uppercase tracking-[0.2em]"
        >
          <ArrowLeft size={14} className="group-hover/back:-translate-x-1 transition-transform" />
          Go Back
        </button>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight capitalize">
           {role} Login
        </h2>
        <p className="text-slate-400 text-[10px] font-black mt-2 uppercase tracking-[0.2em] opacity-80">Secure Identification</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6 relative z-10">
        {/* Identity Input */}
        <div className="space-y-2">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Identity</label>
          <div className="relative group/input">
            <div className={`absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-300 group-focus-within/input:${theme.text} transition-colors`}>
              <User size={20} />
            </div>
            <input
              type="text"
              required
              placeholder={getPlaceholder()}
              className={`w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-2xl text-slate-800 font-bold placeholder-slate-300
              focus:outline-none focus:ring-0 ${theme.border} focus:bg-white transition-all text-sm`}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="space-y-2">
           <div className="flex justify-between items-center px-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Access Key</label>
              <a href="#" className={`text-[9px] font-black ${theme.text} hover:underline uppercase tracking-widest`}>Forgot?</a>
           </div>
          <div className="relative group/input">
            <div className={`absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-300 group-focus-within/input:${theme.text} transition-colors`}>
              <Lock size={20} />
            </div>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              className={`w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-2xl text-slate-800 font-bold placeholder-slate-300
              focus:outline-none focus:ring-0 ${theme.border} focus:bg-white transition-all text-sm`}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        {/* Branded Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-5 rounded-[1.5rem] font-black text-xs text-white 
          bg-gradient-to-br ${theme.color}
          hover:shadow-2xl hover:shadow-slate-200
          active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 mt-6`}
        >
          {isLoading ? (
            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Authorize Access
              <ChevronRight size={20} />
            </>
          )}
        </button>
      </form>

      {/* Safety Badge */}
      <div className="mt-10 flex items-center justify-center gap-3 text-[9px] text-slate-400 bg-slate-50 py-4 rounded-2xl border border-slate-100 uppercase tracking-[0.3em] font-black">
        <ShieldCheck size={18} className="text-emerald-500" />
        Verified Secure Session
      </div>
    </div>
  );
}
