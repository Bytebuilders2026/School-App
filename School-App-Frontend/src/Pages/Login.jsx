import { useState, useEffect } from "react";
import LoginForm from "../Components/LoginForm";
import { Shield, BookOpen, GraduationCap, Users, Sparkles, Building2 } from "lucide-react";

export default function Login() {
  const [role, setRole] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const roles = [
    { 
      name: "admin", 
      label: "Admin", 
      icon: <Shield size={24} />, 
      color: "from-[#89D4FF] to-[#21a8f3]", 
      glow: "shadow-blue-500/10",
      desc: "Administrative Hub" 
    },
    { 
      name: "teacher", 
      label: "Teacher", 
      icon: <BookOpen size={24} />, 
      color: "from-[#6366f1] to-[#4f46e5]", 
      glow: "shadow-indigo-500/10",
      desc: "Faculty Portal" 
    },
    { 
      name: "student", 
      label: "Student", 
      icon: <GraduationCap size={24} />, 
      color: "from-[#10b981] to-[#059669]", 
      glow: "shadow-emerald-500/10",
      desc: "Learning Management" 
    },
    { 
      name: "parent", 
      label: "Parent", 
      icon: <Users size={24} />, 
      color: "from-[#8884d8] to-[#7169c9]", 
      glow: "shadow-purple-500/10",
      desc: "Guardian Dashboard" 
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#FEFBF6] text-slate-900">
      {/* ── CREAM BACKGROUND ACCENTS ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#89D4FF]/5 blur-[120px]"
          style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
        />
        <div 
          className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#8884d8]/5 blur-[150px]"
          style={{ transform: `translate(${-mousePos.x}px, ${-mousePos.y}px)` }}
        />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-[0.4]"></div>
      </div>

      {/* ── CENTRAL PANEL ── */}
      <div className="w-full max-w-[900px] p-6 relative z-10">
        
        {/* SCHOOL NAME HEADER */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-top-10 duration-700">
           <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-900 font-black shadow-xl border border-slate-100">
                 <Building2 size={32} className="text-blue-600" />
              </div>
           </div>
           <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">
              RISING STAR PUBLIC SCHOOL
           </h2>
           <div className="flex items-center justify-center gap-4 mt-3">
              <div className="h-[1px] w-8 bg-blue-600"></div>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.5em]">Education Redefined</p>
              <div className="h-[1px] w-8 bg-blue-600"></div>
           </div>
        </div>

        {!role ? (
          <div className="space-y-10">
            <div className="text-center">
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">Access Portal</h1>
              <p className="text-slate-400 mt-2 font-bold text-sm uppercase tracking-widest">Select your identity</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {roles.map((r, i) => (
                <div
                  key={r.name}
                  onClick={() => setRole(r.name)}
                  className={`group relative cursor-pointer bg-white/80 backdrop-blur-md p-7 rounded-[2.5rem] border border-slate-200 shadow-2xl transition-all duration-500 hover:-translate-y-3 overflow-hidden text-center flex flex-col items-center hover:border-white ${r.glow}`}
                >
                  {/* Subtle Gradient Shadow on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${r.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                  
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${r.color} flex items-center justify-center text-white shadow-lg mb-5 group-hover:scale-110 transition-transform duration-500`}>
                    {r.icon}
                  </div>
                  
                  <h3 className="text-xl font-black text-slate-800 tracking-tight mb-1.5">{r.label}</h3>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">{r.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-4 pt-8">
               <div className="h-[1px] w-20 bg-slate-200"></div>
               <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">AUTHENTICATED SESSION</p>
               <div className="h-[1px] w-20 bg-slate-200"></div>
            </div>
          </div>
        ) : (
          <div className="animate-in zoom-in-95 duration-500 max-w-[440px] mx-auto">
            <LoginForm role={role} setRole={setRole} />
          </div>
        )}
      </div>
    </div>
  );
}
