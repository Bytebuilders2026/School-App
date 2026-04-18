import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../apiConfig";
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardCheck,
  FileText,
  BookOpen,
  MessageSquare,
  ScrollText,
  LogOut,
  TrendingUp,
  Bell,
} from "lucide-react";

export default function StudentSidebar({ children }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);

  // 🔹 Route Guard: Only students can access this layout
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      navigate("/");
      return;
    }

    if (role !== "student") {
      navigate("/");
    }

    fetchNotifications();
  }, [navigate]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/notifications/mine`, {
         headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setNotifications(res.data || []);
    } catch (err) {}
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch(`${API_BASE_URL}/notifications/read-all`, {}, {
         headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      fetchNotifications();
    } catch (err) {}
  };

  const menuItems = [
    { name: "Dashboard", path: "/student/dashboard", icon: LayoutDashboard },
    { name: "Syllabus", path: "/student/syllabus", icon: BookOpen },
    { name: "Datesheet", path: "/student/datesheet", icon: ScrollText },
    { name: "My Timetable", path: "/student/timetable", icon: CalendarDays },
    { name: "Attendance", path: "/student/attendance", icon: ClipboardCheck },
    { name: "Message", path: "/student/message", icon: MessageSquare },
    { name: "Performance", path: "/student/performance", icon: TrendingUp },
    { name: "Academic Result", path: "/student/result", icon: FileText },
    { name: "Doc Requests", path: "/student/doc-requests", icon: FileText },
    {
      name: "Leave Portal",
      path: "/student/leave-panel",
      icon: CalendarDays,
    },
  ];

  const bottomNavItems = [
    { name: "Home", path: "/student/dashboard", icon: LayoutDashboard },
    { name: "Timetable", path: "/student/timetable", icon: CalendarDays },
    { name: "Attend", path: "/student/attendance", icon: ClipboardCheck },
    { name: "Homework", path: "/student/homework", icon: FileText },
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
    <div className="flex h-[100vh] bg-[#F4F7FB] md:bg-[#F2EDFF]">
      {/* ── DESKTOP SIDEBAR ── */}
      <div className="hidden md:flex flex-col w-64 bg-white shadow-xl h-full z-50">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-[#8884d8]">ByteBuilders</h1>
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
                  isActive ? "bg-[#8884d8] text-white shadow-md font-bold" : "text-gray-600 hover:bg-gray-50"
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
            <div className="w-8 h-8 bg-[#8884d8] rounded-lg flex items-center justify-center text-white font-bold">B</div>
            <h1 className="text-lg font-bold text-gray-800 tracking-tight">ByteBuilders</h1>
          </div>
          <h2 className="hidden md:block font-semibold text-gray-700">Student Portal</h2>

          <div className="flex items-center gap-4 relative">
            <button className="text-gray-400 hover:text-[#8884d8] transition relative" onClick={() => setShowNotif(!showNotif)}>
              <Bell size={20} />
              {notifications.filter(n => !n.isRead).length > 0 && (
                 <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-400 rounded-full border border-white"></span>
              )}
            </button>
            <button className="text-gray-400 hover:text-red-500 transition" onClick={() => handleMenuClick({isLogout: true})}>
              <LogOut size={20} />
            </button>
            <div className="w-9 h-9 flex flex-col items-center justify-center text-[#8884d8] bg-[#8884d8]/10 rounded-full border border-[#8884d8]/20 shadow-sm cursor-pointer">
              <span className="text-sm font-bold">S</span>
            </div>

            {/* Notification Dropdown */}
            {showNotif && (
               <div className="absolute top-12 right-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50">
                  <div className="flex justify-between items-center mb-3">
                     <h3 className="font-bold text-gray-800 text-sm">Notifications</h3>
                     <button onClick={markAllAsRead} className="text-[10px] text-[#8884d8] font-bold hover:underline cursor-pointer">Mark all read</button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                     {notifications.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-4">No recent notifications</p>
                     ) : notifications.map(alert => (
                        <div key={alert._id} className={`p-3 rounded-xl border text-left ${alert.isRead ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-red-50 border-red-100'}`}>
                           <p className={`text-xs font-bold ${alert.isRead ? 'text-gray-700' : 'text-red-800'}`}>{alert.title}</p>
                           <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">{alert.message}</p>
                        </div>
                     ))}
                  </div>
               </div>
            )}
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1 pb-24 md:pb-6 bg-[#F4F7FB] md:bg-transparent scroll-smooth">
          {children}
        </div>

        {/* ── MOBILE BOTTOM NAVIGATION ── */}
        <div className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-lg shadow-[0_-4px_20px_rgba(0,0,0,0.05)] border-t border-gray-100 z-50 rounded-t-3xl">
          <div className="flex justify-between items-center px-4 pt-3 pb-3 overflow-x-auto no-scrollbar gap-2 snap-x">
            {menuItems.map((item, i) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              
              return (
                <div 
                  key={i} 
                  onClick={() => handleMenuClick(item)} 
                  className={`flex flex-col items-center gap-1 min-w-[60px] snap-center rounded-2xl transition-all duration-300 ${isActive ? "scale-105" : "scale-100 opacity-60 hover:opacity-100"}`}
                >
                  <div className={`p-2.5 rounded-xl transition-colors ${isActive ? "bg-[#8884d8]/20 text-[#7169c9]" : "text-gray-500"}`}>
                    <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className={`text-[9px] tracking-tight text-center ${isActive ? "text-[#7169c9] font-bold" : "text-gray-500 font-medium"}`}>{item.name.replace('My ', '')}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
