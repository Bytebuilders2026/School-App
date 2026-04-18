import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardCheck,
  FileText,
  MessageSquare,
  LogOut,
  BarChart3,
} from "lucide-react";

export default function TeacherSidebar({ children }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // 🔹 Route Guard: Only teachers can access this layout
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      navigate("/");
      return;
    }

    if (role !== "teacher") {
      navigate("/");
    }
  }, [navigate]);

  const menuItems = [
    {
      name: "Dashboard",
      path: "/teacher/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "My Timetable",
      path: "/teacher/timetable",
      icon: CalendarDays, // 🔥 better than Notepad
    },
    {
      name: "Attendance",
      path: "/teacher/attendance",
      icon: ClipboardCheck, // 🔥 more accurate than ClipboardList
    },
    {
      name: "Assign Homework",
      path: "/teacher/homework",
      icon: FileText, 
    },
    {
      name: "Marks Entry",
      path: "/teacher/marks",
      icon: BarChart3,
    },
    {
      name: "Message",
      path: "/teacher/message",
      icon: MessageSquare,
    },
    {
      name: "Doc Requests",
      path: "/teacher/doc-requests",
      icon: ClipboardCheck,
    },
    {
      name: "Leave Management",
      path: "/teacher/leave-panel",
      icon: CalendarDays,
    },
    { name: "Logout", path: "/", icon: LogOut, isLogout: true },

  ];

  const bottomNavItems = [
    { name: "Home", path: "/teacher/dashboard", icon: LayoutDashboard },
    { name: "Timetable", path: "/teacher/timetable", icon: CalendarDays },
    { name: "Attend", path: "/teacher/attendance", icon: ClipboardCheck },
    { name: "Homework", path: "/teacher/homework", icon: FileText },
  ];

  const handleMenuClick = (item) => {
    if (item.isLogout) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/");
    } else {
      navigate(item.path);
    }
  };

  const currentPath = window.location.pathname;

  return (
    <div className="flex h-[100vh] bg-[#F4F7FB] md:bg-[#F7F6E5]">
      {/* ── DESKTOP SIDEBAR ── */}
      <div className="hidden md:flex flex-col w-64 bg-white shadow-xl h-full z-50">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-[#89D4FF]">ByteBuilders</h1>
        </div>
        <div className="p-4 space-y-2 flex-1">
          {menuItems.map((item, i) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <div
                key={i}
                onClick={() => handleMenuClick(item)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition ${
                  isActive ? "bg-[#89D4FF] text-white shadow-md font-bold" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── MAIN AREA ── */}
      <div className="flex-1 flex flex-col h-[100vh] overflow-hidden relative">
        {/* TOPBAR */}
        <div className="flex items-center justify-between bg-white px-4 md:px-6 py-4 shadow-sm z-40 relative">
          <div className="md:hidden flex items-center gap-2">
            <div className="w-8 h-8 bg-[#89D4FF] rounded-lg flex items-center justify-center text-white font-bold">B</div>
            <h1 className="text-lg font-bold text-gray-800 tracking-tight">ByteBuilders</h1>
          </div>
          <h2 className="hidden md:block font-semibold text-gray-700">Teacher Portal</h2>

          <div className="flex items-center gap-4">
            <button className="md:hidden text-gray-400 hover:text-red-500 transition" onClick={() => handleMenuClick({isLogout: true})}>
              <LogOut size={20} />
            </button>
            <div className="w-9 h-9 flex flex-col items-center justify-center text-[#89D4FF] bg-[#89D4FF]/10 rounded-full border border-[#89D4FF]/20 shadow-sm cursor-pointer">
              <span className="text-sm font-bold">T</span>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1 pb-24 md:pb-6 bg-[#F4F7FB] md:bg-transparent scroll-smooth">
          {children}
        </div>

        {/* ── MOBILE BOTTOM NAVIGATION ── */}
        <div className="md:hidden fixed bottom-0 left-0 w-full bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.05)] border-t border-gray-100 flex justify-around items-center pt-3 pb-safe-bottom z-50 rounded-t-3xl backdrop-blur-lg bg-white/90">
          {bottomNavItems.map((item, i) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            
            return (
              <div 
                key={i} 
                onClick={() => handleMenuClick(item)} 
                className={`flex flex-col items-center gap-1 min-w-[64px] px-2 py-1 rounded-2xl transition-all duration-300 ${isActive ? "scale-110" : "scale-100 opacity-60"}`}
              >
                <div className={`p-2 rounded-xl transition-colors ${isActive ? "bg-[#89D4FF]/20 text-[#21a8f3]" : "text-gray-500"}`}>
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] tracking-tight ${isActive ? "text-[#21a8f3] font-bold" : "text-gray-500 font-medium"}`}>{item.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
