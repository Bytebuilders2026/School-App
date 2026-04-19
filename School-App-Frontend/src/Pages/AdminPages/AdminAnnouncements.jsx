import React, { useState } from "react";
import AdminSidebar from "../../Layouts/AdminSidebar";
import axiosInstance from "../../axiosInstance";
import { Megaphone, Users, UserCog, GraduationCap, Send, CheckCircle2, AlertCircle } from "lucide-react";

const AdminAnnouncements = () => {
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [target, setTarget] = useState("all"); // 'all', 'teachers', 'students_parents'
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);

    const handleSend = async () => {
        console.log("🖱️ Broadcast button clicked");
        if (!title || !message) {
            alert("Please fill in both title and message.");
            return;
        }

        if (!window.confirm(`Are you sure you want to broadcast this to ${target}?`)) return;

        setLoading(true);
        setStatus(null);
        
        try {
            const res = await axiosInstance.post("/notifications/announcements", {
                title,
                message,
                target
            });
            console.log("✅ Broadcast Response:", res.data);
            alert("Success: " + (res.data.message || "Announcement broadcasted!"));
            setStatus({ type: "success", message: res.data.message || "Announcement broadcasted successfully!" });
            setTitle("");
            setMessage("");
        } catch (err) {
            console.error("❌ Broadcast Error:", err);
            const failedUrl = err.config?.url || "unknown";
            const errMsg = err.response?.data?.error || err.message || "Unknown error";
            alert(`Error: ${errMsg}\n\nURL: ${failedUrl}`);
            setStatus({ type: "error", message: `Failed: ${errMsg}` });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminSidebar>
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header Section */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#89D4FF] to-[#21a8f3] p-10 rounded-[40px] shadow-2xl shadow-blue-100 text-white">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                    <div className="relative z-10 flex items-center gap-6">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/30 shadow-inner">
                            <Megaphone size={40} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tight">Broadcast Center</h1>
                            <p className="text-blue-50/80 font-medium text-lg mt-1">Send important school-wide updates instantly.</p>
                        </div>
                    </div>
                </div>

                {status && (
                    <div className={`p-5 rounded-3xl flex items-center gap-4 border ${
                        status.type === "success" 
                        ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                        : "bg-rose-50 border-rose-100 text-rose-700"
                    }`}>
                        {status.type === "success" ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                        <p className="font-bold">{status.message}</p>
                    </div>
                )}

                <div className="bg-white rounded-[40px] shadow-xl border border-gray-100 p-8 md:p-12 space-y-10">
                    {/* Audience Selection */}
                    <section className="space-y-6">
                        <h2 className="text-xl font-black text-gray-800 flex items-center gap-3 px-2">
                             Target Audience
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { id: "all", label: "Everyone", icon: Users, desc: "Students, Parents & Staff" },
                                { id: "teachers", label: "Only Teachers", icon: UserCog, desc: "Academic & Admin Staff" },
                                { id: "students_parents", label: "Students & Parents", icon: GraduationCap, desc: "The whole student body" }
                            ].map((item) => (
                                <div 
                                    key={item.id}
                                    onClick={() => setTarget(item.id)}
                                    className={`relative p-6 rounded-[32px] cursor-pointer transition-all duration-300 border-2 group ${
                                        target === item.id 
                                        ? "bg-blue-50 border-[#89D4FF] shadow-lg shadow-blue-50" 
                                        : "bg-white border-gray-100 hover:border-gray-200"
                                    }`}
                                >
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                                        target === item.id ? "bg-[#89D4FF] text-white" : "bg-gray-50 text-gray-400 group-hover:bg-gray-100"
                                    }`}>
                                        <item.icon size={24} />
                                    </div>
                                    <h3 className={`font-black text-sm uppercase tracking-wider ${target === item.id ? "text-blue-600" : "text-gray-600"}`}>{item.label}</h3>
                                    <p className="text-[11px] text-gray-400 mt-1 font-medium">{item.desc}</p>
                                    
                                    {target === item.id && (
                                        <div className="absolute top-4 right-4 text-blue-500">
                                            <CheckCircle2 size={20} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Content Section */}
                    <div className="space-y-8 pt-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Announcement Title</label>
                            <input 
                                type="text" 
                                placeholder="Enter a catchy headline..."
                                className="w-full bg-gray-50 border-0 rounded-[24px] px-8 py-5 text-lg font-bold text-gray-800 placeholder:text-gray-300 focus:ring-4 focus:ring-blue-50 transition-all outline-none"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Your Message</label>
                            <textarea 
                                rows={6}
                                placeholder="Write the details of your announcement here..."
                                className="w-full bg-gray-50 border-0 rounded-[32px] px-8 py-6 text-base font-medium text-gray-700 placeholder:text-gray-300 focus:ring-4 focus:ring-blue-50 transition-all outline-none resize-none"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="pt-6 relative z-10">
                        <button 
                            id="broadcast-btn"
                            onClick={handleSend}
                            disabled={loading}
                            className={`w-full py-6 rounded-full font-black text-base text-white shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 active:scale-95 ${
                                loading 
                                ? "bg-gray-400 cursor-not-allowed" 
                                : "bg-[#21a8f3] hover:bg-[#1a8bc9] hover:shadow-blue-300 shadow-blue-200"
                            }`}
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Broadcast Announcement</span>
                                    <Send size={20} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </AdminSidebar>
    );
};

export default AdminAnnouncements;
