import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../apiConfig";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  BarChart3,
  MessageSquareQuote,
  Wallet,
  LogOut,
  Bell,
  Megaphone,
} from "lucide-react";

export default function ParentSidebar({ children }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const isFirstFetch = useRef(true);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "parent") {
      navigate("/");
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
        headers: { Authorization: `Bearer ${token}` },
      });
      const newNotifs = res.data || [];
      
      // 🔊 Play sound if new unread notification arrives
      setNotifications(prev => {
        const prevUnreadCount = prev.filter(n => !n.isRead).length;
        const currentUnreadCount = newNotifs.filter(n => !n.isRead).length;
        
        if (!isFirstFetch.current && currentUnreadCount > prevUnreadCount) {
          const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
          audio.play().catch(e => console.log("Audio play failed:", e));
        }
        isFirstFetch.current = false;
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
    { name: "Dashboard", path: "/parent/dashboard", icon: LayoutDashboard },
    { name: "My Children", path: "/parent/children", icon: Users },
    { name: "Attendance", path: "/parent/attendance", icon: ClipboardCheck },
    { name: "Academic Result", path: "/parent/marks", icon: BarChart3 },
    { name: "Teacher Remarks", path: "/parent/remarks", icon: MessageSquareQuote },
    { name: "Fee Management", path: "/parent/fees", icon: Wallet },
    { name: "Announcements", path: "/parent/announcements", icon: Megaphone },
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
        <div className="p-4 space-y-2 flex-1 overflow-y-auto">
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
          
          <div className="pt-4 mt-4 border-t border-gray-100">
             <div
               onClick={() => handleMenuClick({ isLogout: true })}
               className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition text-gray-500 hover:text-red-500 hover:bg-red-50"
             >
               <LogOut size={18} />
               <span className="font-bold">Sign Out</span>
             </div>
          </div>
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
          <h2 className="hidden md:block font-semibold text-gray-700">Parent Portal</h2>

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
              <span className="text-sm font-bold">P</span>
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
                  className={`flex flex-col items-center gap-1 min-w-[70px] snap-center rounded-2xl transition-all duration-300 ${isActive ? "scale-105" : "scale-100 opacity-60 hover:opacity-100"}`}
                >
                  <div className={`p-2.5 rounded-xl transition-colors ${isActive ? "bg-[#8884d8]/20 text-[#7169c9]" : "text-gray-500"}`}>
                    <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className={`text-[10px] tracking-tight text-center ${isActive ? "text-[#7169c9] font-bold" : "text-gray-500 font-medium"}`}>{item.name.replace('Management', '').replace('Academic ', '')}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
