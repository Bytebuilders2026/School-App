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
  Menu,
  X,
  ShieldCheck
} from "lucide-react";

export default function ParentSidebar({ children }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    { name: "Results", path: "/parent/marks", icon: BarChart3 },
    { name: "Remarks", path: "/parent/remarks", icon: MessageSquareQuote },
    { name: "Fees", path: "/parent/fees", icon: Wallet },
    { name: "Gate Pass", path: "/parent/gatepass", icon: ShieldCheck },
    { name: "Alerts", path: "/parent/announcements", icon: Megaphone },
  ];

  const handleMenuClick = (item) => {
    if (item.isLogout) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/");
    } else {
      navigate(item.path);
      setIsMobileMenuOpen(false);
    }
  };

  const currentPath = window.location.pathname;

  return (
    <div className="flex h-[100vh] bg-[#fafafa]">
      {/* ── DESKTOP SIDEBAR ── */}
      <div className="hidden lg:flex flex-col w-64 bg-slate-900 shadow-2xl h-full z-50">
        <div className="px-8 py-8">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg">SB</div>
              <h1 className="text-xl font-black text-white tracking-tighter">SchoolByte</h1>
           </div>
        </div>
        <div className="px-4 pb-4 space-y-1 flex-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item, i) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <div
                key={i}
                onClick={() => handleMenuClick(item)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl cursor-pointer transition-all duration-300 ${
                  isActive ? "bg-blue-600 text-white shadow-xl shadow-blue-900/20 font-bold scale-[1.02]" : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Icon size={18} />
                <span className="text-sm tracking-tight">{item.name}</span>
              </div>
            );
          })}
        </div>
        
        <div className="p-4 border-t border-slate-800">
           <div
             onClick={() => handleMenuClick({ isLogout: true })}
             className="flex items-center gap-3 px-4 py-4 rounded-2xl cursor-pointer transition text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 font-bold text-sm"
           >
             <LogOut size={18} />
             <span>Sign Out</span>
           </div>
        </div>
      </div>

      {/* ── MOBILE DRAWER ── */}
      {isMobileMenuOpen && (
         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] lg:hidden animate-in fade-in duration-300" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="w-72 bg-slate-900 h-full p-6 space-y-6 animate-in slide-in-from-left duration-300" onClick={e => e.stopPropagation()}>
               <div className="flex justify-between items-center">
                  <h2 className="text-white font-black tracking-tighter text-xl">Menu</h2>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 p-2"><X size={24} /></button>
               </div>
               <div className="space-y-1">
                  {menuItems.map((item, i) => {
                     const Icon = item.icon;
                     const isActive = currentPath === item.path;
                     return (
                        <div key={i} onClick={() => handleMenuClick(item)} className={`flex items-center gap-3 px-4 py-4 rounded-2xl ${isActive ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}`}>
                           <Icon size={20} />
                           <span className="text-sm">{item.name}</span>
                        </div>
                     );
                  })}
               </div>
            </div>
         </div>
      )}

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 flex flex-col h-[100vh] overflow-hidden relative">
        {/* TOPBAR */}
        <div className="flex items-center justify-between bg-white px-4 lg:px-8 py-4 border-b border-slate-100 z-40 relative">
          <div className="flex items-center gap-4">
             <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-xl">
                <Menu size={24} />
             </button>
             <h2 className="hidden lg:block font-black text-slate-800 text-lg">Parent Portal</h2>
             <div className="lg:hidden flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xs">SB</div>
                <span className="font-black text-slate-800 text-sm tracking-tight">SchoolByte</span>
             </div>
          </div>

          <div className="flex items-center gap-3 relative">
            <button className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition relative" onClick={() => setShowNotif(!showNotif)}>
              <Bell size={20} />
              {notifications.filter(n => !n.isRead).length > 0 && (
                 <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
              )}
            </button>
            <div className="h-8 w-[1px] bg-slate-100 mx-1 hidden sm:block"></div>
            <div className="flex items-center gap-3">
               <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs font-black text-slate-800 leading-none">Parent Account</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Authorized</span>
               </div>
               <div className="w-10 h-10 flex items-center justify-center text-blue-600 bg-blue-50 rounded-2xl border border-blue-100 font-black shadow-sm">P</div>
            </div>

            {/* Notification Dropdown */}
            {showNotif && (
               <div className="absolute top-14 right-0 w-[90vw] sm:w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 p-5 z-[110] animate-in slide-in-from-top-2">
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="font-black text-slate-800 text-sm">Notifications</h3>
                     <button onClick={markAllAsRead} className="text-[10px] text-blue-600 font-black hover:underline uppercase tracking-widest">Mark read</button>
                  </div>
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                     {notifications.length === 0 ? (
                        <div className="text-center py-10 opacity-30">
                           <Bell size={32} className="mx-auto mb-2" />
                           <p className="text-xs font-bold uppercase tracking-widest">Silent for now</p>
                        </div>
                     ) : notifications.map(alert => (
                        <div key={alert._id} className={`p-4 rounded-2xl border text-left transition-all ${alert.isRead ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-blue-50 border-blue-100 shadow-sm'}`}>
                           <p className={`text-xs font-black leading-tight ${alert.isRead ? 'text-slate-700' : 'text-blue-900'}`}>{alert.title}</p>
                           <p className="text-[11px] text-slate-500 mt-1.5 font-medium leading-relaxed italic line-clamp-2">"{alert.message}"</p>
                        </div>
                     ))}
                  </div>
               </div>
            )}
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-4 lg:p-8 overflow-y-auto flex-1 bg-[#fafafa] scroll-smooth">
          <div className="max-w-7xl mx-auto pb-20 lg:pb-0">
             {children}
          </div>
        </div>

        {/* ── MOBILE BOTTOM NAVIGATION (Optimized) ── */}
        <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl border-t border-slate-100 z-50 px-6 pt-3 pb-safe-bottom flex justify-between items-center rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
           {[
              { name: "Home", path: "/parent/dashboard", icon: LayoutDashboard },
              { name: "Children", path: "/parent/children", icon: Users },
              { name: "Security", path: "/parent/gatepass", icon: ShieldCheck },
              { name: "Account", path: "/parent/fees", icon: Wallet },
           ].map((item, i) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              return (
                 <div key={i} onClick={() => handleMenuClick(item)} className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${isActive ? 'scale-110' : 'opacity-40'}`}>
                    <div className={`p-2.5 rounded-2xl ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-600'}`}>
                       <Icon size={22} />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-tighter ${isActive ? 'text-blue-600' : 'text-slate-600'}`}>{item.name}</span>
                 </div>
              );
           })}
        </div>
      </div>
    </div>
  );
}
