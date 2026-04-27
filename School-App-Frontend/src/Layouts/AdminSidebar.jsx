import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardList,
  FileText,
  BarChart3,
  CreditCard,
  Megaphone,
  FileBarChart,
  LogOut,
  NotepadText,
  BookOpen,
  CalendarDays,
  Bell,
} from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "../apiConfig";

export default function AdminSidebar({ children }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const navigate = useNavigate();

  // 🔹 Route Guard: Only admins can access this layout
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      navigate("/");
      return;
    }

    if (role !== "admin") {
      navigate("/");
      return;
    }

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [navigate]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get(`${API_BASE_URL}/notifications/mine`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const newNotifs = res.data || [];
      
      // 🔊 Play sound if new unread notification arrives
      setNotifications(prev => {
        const prevUnreadCount = prev.filter(n => !n.isRead).length;
        const currentUnreadCount = newNotifs.filter(n => !n.isRead).length;
        
        if (currentUnreadCount > prevUnreadCount) {
          const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
          audio.play().catch(e => console.log("Audio play failed:", e));
        }
        return newNotifs;
      });
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
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Admissions", path: "/admin/admissions", icon: NotepadText },
    { name: "Students", path: "/admin/students", icon: Users },

    { name: "Teachers", path: "/admin/teachers", icon: Users },
    { name: "Timetable", path: "/admin/timetable", icon: Calendar },
    { name: "Attendance", path: "/admin/attendance", icon: ClipboardList },
    { name: "Homework", path: "/admin/homework", icon: FileText },
    { name: "Syllabus", path: "/admin/syllabus", icon: BookOpen },
    { name: "Datesheet", path: "/admin/datesheet", icon: CalendarDays },
    { name: "Results", path: "/admin/results", icon: BarChart3 },
    { name: "Fees", path: "/admin/fees", icon: CreditCard },
    { name: "Announcements", path: "/admin/announcements", icon: Megaphone },
    { name: "Reports", path: "/admin/reports", icon: FileBarChart },
    { name: "Leaves & Adjustments", path: "/admin/timetable-adjustments", icon: CalendarDays },
    { name: "Logout", path: "/", icon: LogOut, isLogout: true },
  ];

  const handleMenuClick = (item) => {
    if (item.isLogout) {
      localStorage.removeItem("token");
      navigate("/");
    } else {
      navigate(item.path);
      setOpen(false);
    }
  };

  return (
    <div className="flex h-[100vh] bg-[#F7F6E5]">
      {/* SIDEBAR */}
      <div
        className={`fixed md:static z-50 top-0 left-0 h-full w-64 bg-white shadow-xl 
        transform ${open ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 transition duration-300`}
      >
        {/* Logo */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-[#89D4FF]">ByteBuilders</h1>
          <p className="text-md text-gray-400">Admin Panel</p>
        </div>

        <div className="p-4 space-y-2">
          {menuItems.map((item, i) => {
            const Icon = item.icon;

            return (
              <div
                key={i}
                onClick={() => handleMenuClick(item)}
                className="flex items-center gap-3 px-4 py-2 rounded-xl cursor-pointer text-gray-700 
        hover:bg-[#89D4FF] hover:text-white transition"
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col">
        {/* TOPBAR */}
        <div className="flex items-center justify-between bg-white px-6 py-4 shadow-sm">
          <button className="md:hidden" onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button>

          <h2 className="font-semibold text-gray-700">Admin Dashboard</h2>

          <div className="flex items-center gap-4 relative">
            <button 
              className="text-gray-400 hover:text-[#89D4FF] transition relative p-2" 
              onClick={() => setShowNotif(!showNotif)}
            >
              <Bell size={20} />
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
              )}
            </button>
            <div className="w-8 flex items-center justify-center text-white h-8 bg-[#89D4FF] rounded-full">
              <h1 className="text-sm font-bold">A</h1>
            </div>

            {/* Notification Dropdown */}
            {showNotif && (
               <div className="absolute top-12 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-[100] animate-in fade-in slide-in-from-top-2">
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-50">
                     <h3 className="font-bold text-gray-800 text-sm">Notifications</h3>
                     <button onClick={markAllAsRead} className="text-[10px] text-[#89D4FF] font-bold hover:underline cursor-pointer">Mark all as read</button>
                  </div>
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                     {notifications.length === 0 ? (
                        <div className="flex flex-col items-center py-8 opacity-40">
                          <Bell size={32} className="mb-2" />
                          <p className="text-xs text-gray-600 font-medium">No recent notifications</p>
                        </div>
                     ) : notifications.map(alert => (
                        <div key={alert._id} className={`p-3 rounded-xl border text-left transition-all ${alert.isRead ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-blue-50/50 border-blue-100 shadow-sm'}`}>
                           <div className="flex justify-between items-start">
                             <p className={`text-xs font-bold leading-tight ${alert.isRead ? 'text-gray-700' : 'text-[#89D4FF]'}`}>{alert.title}</p>
                             {!alert.isRead && <span className="w-2 h-2 bg-[#89D4FF] rounded-full"></span>}
                           </div>
                           <p className="text-[11px] text-gray-500 mt-1.5 leading-normal">{alert.message}</p>
                           <p className="text-[9px] text-gray-400 mt-2 font-medium">{new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                     ))}
                  </div>
               </div>
            )}
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}
