import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  BarChart3,
  MessageSquareQuote,
  Wallet,
  LogOut,
  Bell,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "../apiConfig";

export default function ParentSidebar({ children }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "parent") {
      navigate("/");
    }
    fetchNotifications();
  }, [navigate]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/notifications/mine`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setNotifications(res.data || []);
    } catch (err) {}
  };

  const menuItems = [
    { name: "Dashboard", path: "/parent/dashboard", icon: LayoutDashboard, color: "text-blue-500" },
    { name: "My Children", path: "/parent/children", icon: Users, color: "text-indigo-500" },
    { name: "Attendance", path: "/parent/attendance", icon: ClipboardCheck, color: "text-emerald-500" },
    { name: "Academic Result", path: "/parent/marks", icon: BarChart3, color: "text-amber-500" },
    { name: "Teacher Remarks", path: "/parent/remarks", icon: MessageSquareQuote, color: "text-rose-500" },
    { name: "Fee Management", path: "/parent/fees", icon: Wallet, color: "text-violet-500" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  const currentPath = window.location.pathname;

  return (
    <div className="flex h-screen bg-[#F8F9FD]">
      {/* ── MOBILE TOGGLE ── */}
      <button 
        className="md:hidden fixed top-4 right-4 z-[60] bg-white p-2 rounded-xl shadow-lg border border-gray-100"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* ── SIDEBAR ── */}
      <div className={`fixed md:relative flex flex-col h-full bg-white shadow-2xl transition-all duration-300 z-50 ${isOpen ? "w-72" : "w-0 md:w-20 overflow-hidden"}`}>
        <div className="flex items-center gap-3 px-6 py-8">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-200">B</div>
          {isOpen && <h1 className="text-xl font-bold text-gray-800 tracking-tight">ByteBuilders</h1>}
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item, i) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <div
                key={i}
                onClick={() => navigate(item.path)}
                className={`group flex items-center gap-4 px-4 py-3.5 rounded-2xl cursor-pointer transition-all duration-200 ${
                  isActive 
                  ? "bg-indigo-50 text-indigo-700 shadow-sm" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <div className={`transition-colors ${isActive ? "text-indigo-600" : "group-hover:text-indigo-500"}`}>
                  <Icon size={20} />
                </div>
                {isOpen && (
                  <div className="flex-1 flex justify-between items-center">
                    <span className="font-semibold text-sm">{item.name}</span>
                    {isActive && <ChevronRight size={14} className="opacity-50" />}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-50">
          <div 
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-4 rounded-2xl cursor-pointer text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut size={20} />
            {isOpen && <span className="font-bold text-sm">Sign Out</span>}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* TOPBAR */}
        <header className="flex items-center justify-between bg-white px-8 py-5 border-b border-gray-100 z-40">
           <div className="flex items-center gap-4">
              <h2 className="text-lg font-bold text-gray-800">Parent Portal</h2>
              <div className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-full uppercase tracking-widest">Live System</div>
           </div>

           <div className="flex items-center gap-6">
              <div className="relative">
                <button 
                  onClick={() => setShowNotif(!showNotif)}
                  className="p-2.5 bg-gray-50 text-gray-500 hover:text-indigo-600 rounded-xl transition relative"
                >
                  <Bell size={20} />
                  {notifications.filter(n => !n.isRead).length > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                  )}
                </button>
                {/* Notification Dropdown Placeholder */}
              </div>

              <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-gray-800 leading-tight">Parent Account</p>
                  <p className="text-[10px] text-gray-400 font-medium">Verified Profile</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-100">P</div>
              </div>
           </div>
        </header>

        {/* CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 bg-[#F8F9FD]/50">
          {children}
        </main>
      </div>
    </div>
  );
}
