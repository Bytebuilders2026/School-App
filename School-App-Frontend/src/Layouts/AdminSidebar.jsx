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
} from "lucide-react";

export default function AdminSidebar({ children }) {
  const [open, setOpen] = useState(false);
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
    }
  }, [navigate]);

  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Admissions", path: "/admin/admissions", icon: NotepadText },
    { name: "Teachers", path: "/admin/teachers", icon: Users },
    { name: "Parents", path: "/admin/parents", icon: Users },
    { name: "Timetable", path: "/admin/timetable", icon: Calendar },
    { name: "Attendance", path: "/admin/attendance", icon: ClipboardList },
    { name: "Homework", path: "/admin/homework", icon: FileText },
    { name: "Syllabus", path: "/admin/syllabus", icon: BookOpen },
    { name: "Datesheet", path: "/admin/datesheet", icon: CalendarDays },
    { name: "Results", path: "/admin/results", icon: BarChart3 },
    { name: "Fees", path: "/admin/fees", icon: CreditCard },
    { name: "Announcements", path: "/admin/announcements", icon: Megaphone },
    { name: "Reports", path: "/admin/reports", icon: FileBarChart },
    { name: "Leave Adjustments", path: "/admin/timetable-adjustments", icon: CalendarDays },
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

          <div className="w-8 flex items-center justify-center text-white h-8 bg-[#89D4FF] rounded-full">
            <h1 className="text-sm font-bold">A</h1>
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
