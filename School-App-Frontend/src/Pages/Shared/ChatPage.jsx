import React, { useState, useEffect, useRef, useCallback } from "react";
import { Send, Search, Users, MoreVertical, Paperclip, MessageSquare, X } from "lucide-react";
import { API_BASE_URL } from "../../apiConfig";

const api = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE_URL}${url}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Request failed");
  }
  return res.json();
};

export default function ChatPage() {
  const [conversations, setConversations] = useState({ groups: [], personalChats: [] });
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [fetchingMsgs, setFetchingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);
  const pollRef = useRef(null);
  const selectedChatRef = useRef(null);

  // Keep ref in sync with state
  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  const userObj = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = (userObj._id || userObj.id || "").toString();

  // ── Fetch Conversation List ──
  const fetchConversations = useCallback(async () => {
    try {
      const data = await api("/messages/conversations");
      setConversations(data);
      setError("");
    } catch (err) {
      console.error("Fetch conversations error:", err);
      setError("Could not load conversations. Is the server running?");
    } finally {
      setLoadingConvs(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // ── Fetch Messages for selected chat ──
  const fetchMessages = useCallback(async (chat) => {
    if (!chat) return;
    setFetchingMsgs(true);
    try {
      const data = await api(`/messages/history/${chat.type}/${chat.id}`);
      setMessages(data);
    } catch (err) {
      console.error("Fetch messages error:", err);
    } finally {
      setFetchingMsgs(false);
    }
  }, []);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat);

      // Poll for new messages every 3 seconds
      clearInterval(pollRef.current);
      pollRef.current = setInterval(() => {
        if (selectedChatRef.current) {
          api(`/messages/history/${selectedChatRef.current.type}/${selectedChatRef.current.id}`)
            .then((data) => setMessages(data))
            .catch(() => {});
        }
      }, 3000);
    }
    return () => clearInterval(pollRef.current);
  }, [selectedChat, fetchMessages]);

  // ── Auto-scroll ──
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // ── Send Message ──
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat || sending) return;
    setSending(true);

    const tempMsg = {
      _id: `temp-${Date.now()}`,
      sender: currentUserId,
      message: newMessage.trim(),
      conversationType: selectedChat.type,
      receiver: selectedChat.type === "personal" ? selectedChat.id : undefined,
      groupId: selectedChat.type === "group" ? selectedChat.id : undefined,
      senderDetails: { name: "You" },
      createdAt: new Date().toISOString(),
      _temp: true,
    };

    setMessages((prev) => [...prev, tempMsg]);
    setNewMessage("");

    try {
      const payload = {
        conversationType: selectedChat.type,
        message: tempMsg.message,
        receiverId: selectedChat.type === "personal" ? selectedChat.id : undefined,
        groupId: selectedChat.type === "group" ? selectedChat.id : undefined,
      };

      await api("/messages/send", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      // Refresh messages and conversations
      fetchMessages(selectedChatRef.current);
      fetchConversations();
    } catch (err) {
      console.error("Send error:", err);
      // Remove temp message on failure
      setMessages((prev) => prev.filter((m) => m._id !== tempMsg._id));
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  // ── Search ──
  const handleSearch = async (q) => {
    setSearchQuery(q);
    if (q.length < 1) {
      setSearchResults([]);
      return;
    }
    try {
      const data = await api(`/messages/search?query=${encodeURIComponent(q)}`);
      setSearchResults(data);
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  const startChat = (user) => {
    setSelectedChat({
      id: user.id.toString(),
      name: user.name,
      type: "personal",
      role: user.role,
    });
    setSearchQuery("");
    setSearchResults([]);
  };

  // ── Loading State ──
  if (loadingConvs) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#89D4FF] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Loading conversations...</p>
        </div>
      </div>
    );
  }

  const totalChats = conversations.groups.length + conversations.personalChats.length;

  return (
    <div className="flex bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 h-[calc(100vh-140px)] min-h-[520px]">

      {/* ── LEFT SIDEBAR ── */}
      <div className="w-full md:w-80 border-r border-gray-100 flex flex-col flex-shrink-0 bg-gray-50/40">
        <div className="p-5 pb-3">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Messages</h2>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-3 mb-3">
              <p className="text-xs text-red-600 flex-1">{error}</p>
              <button onClick={() => setError("")}><X size={14} className="text-red-400" /></button>
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search teachers or students..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border-none bg-white shadow-sm focus:ring-2 focus:ring-[#89D4FF]/20 outline-none text-sm"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden max-h-48 overflow-y-auto">
                {searchResults.map((u, i) => (
                  <div
                    key={i}
                    onClick={() => startChat(u)}
                    className="flex items-center gap-3 p-3 hover:bg-blue-50 cursor-pointer transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#89D4FF]/10 text-[#89D4FF] flex items-center justify-center font-bold text-sm">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">{u.name}</p>
                      <p className="text-[10px] text-gray-400 capitalize">{u.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">

          {/* Groups */}
          {conversations.groups.length > 0 && (
            <div className="mb-4">
              <p className="px-3 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Class Groups
              </p>
              {conversations.groups.map((group) => {
                const isActive = selectedChat?.id === group.id;
                return (
                  <div
                    key={group.id}
                    onClick={() => setSelectedChat(group)}
                    className={`flex items-center gap-3 p-3 mx-1 rounded-2xl cursor-pointer transition-all ${
                      isActive
                        ? "bg-[#89D4FF] text-white shadow-lg shadow-[#89D4FF]/30"
                        : "hover:bg-white hover:shadow-sm"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isActive ? "bg-white/20" : "bg-[#89D4FF]/10 text-[#89D4FF]"
                    }`}>
                      <Users size={18} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-bold truncate">{group.name}</p>
                      <p className={`text-[11px] truncate ${isActive ? "text-white/70" : "text-gray-400"}`}>
                        Class group chat
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Personal / Teachers */}
          <div>
            <p className="px-3 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {localStorage.getItem("role") === "student" ? "Your Teachers" : "Direct Messages"}
            </p>

            {conversations.personalChats.length === 0 ? (
              <div className="px-3 py-6 text-center">
                <p className="text-xs text-gray-400">No contacts yet.</p>
                <p className="text-[10px] text-gray-300 mt-1">Use search to find someone</p>
              </div>
            ) : (
              conversations.personalChats.map((chat, i) => {
                const isActive = selectedChat?.id === chat.id.toString();
                return (
                  <div
                    key={i}
                    onClick={() => setSelectedChat({ ...chat, id: chat.id.toString() })}
                    className={`flex items-center gap-3 p-3 mx-1 rounded-2xl cursor-pointer transition-all ${
                      isActive
                        ? "bg-[#89D4FF] text-white shadow-lg shadow-[#89D4FF]/30"
                        : "hover:bg-white hover:shadow-sm"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold flex-shrink-0 ${
                      isActive ? "bg-white/20 text-white" : "bg-blue-50 text-blue-600"
                    }`}>
                      {chat.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-baseline">
                        <p className="text-sm font-bold truncate">{chat.name}</p>
                        {chat.lastTime && (
                          <span className={`text-[9px] flex-shrink-0 ml-1 ${isActive ? "text-white/60" : "text-gray-400"}`}>
                            {new Date(chat.lastTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        )}
                      </div>
                      <p className={`text-[11px] truncate ${isActive ? "text-white/70" : "text-gray-400"}`}>
                        {chat.lastMessage || "Tap to start a conversation"}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {totalChats === 0 && !error && (
            <div className="flex flex-col items-center py-10 text-center px-4">
              <MessageSquare size={36} className="text-gray-200 mb-3" />
              <p className="text-sm text-gray-400 font-medium">No conversations yet</p>
              <p className="text-xs text-gray-300 mt-1">Search for a teacher or student above</p>
            </div>
          )}
        </div>
      </div>

      {/* ── MAIN CHAT AREA ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {selectedChat ? (
          <>
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#89D4FF]/10 text-[#89D4FF] flex items-center justify-center font-bold">
                  {selectedChat.type === "group" ? <Users size={20} /> : selectedChat.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">{selectedChat.name}</h3>
                  <p className="text-[10px] text-gray-400 capitalize">{selectedChat.type === "group" ? "Group Chat" : selectedChat.role}</p>
                </div>
              </div>
              <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-xl transition">
                <MoreVertical size={18} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/30">
              {fetchingMsgs ? (
                <div className="flex justify-center items-center h-full">
                  <div className="w-8 h-8 border-3 border-[#89D4FF] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
                  <MessageSquare size={40} strokeWidth={1} className="mb-3 text-gray-400" />
                  <p className="text-sm text-gray-500 font-medium">No messages yet</p>
                  <p className="text-xs text-gray-400 mt-1">Be the first to say hello! 👋</p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMine =
                    msg.sender?.toString() === currentUserId ||
                    msg.sender?._id?.toString() === currentUserId;
                  return (
                    <div key={msg._id || i} className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
                      {!isMine && (
                        <span className="text-[10px] font-bold text-gray-400 mb-1 ml-2 uppercase tracking-wide">
                          {msg.senderDetails?.name || ""}
                        </span>
                      )}
                      <div className={`max-w-[72%] px-4 py-2.5 rounded-2xl text-sm font-medium shadow-sm ${
                        isMine
                          ? "bg-[#89D4FF] text-white rounded-tr-sm"
                          : "bg-white text-gray-700 border border-gray-100 rounded-tl-sm"
                      } ${msg._temp ? "opacity-70" : ""}`}>
                        {msg.message}
                      </div>
                      <span className="text-[9px] text-gray-400 mt-1 px-2">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-3 py-1.5 border border-gray-100 focus-within:border-[#89D4FF]/40 focus-within:bg-white transition-all shadow-sm">
                <input
                  type="text"
                  placeholder={`Message ${selectedChat.name}...`}
                  className="flex-1 bg-transparent border-none outline-none py-2 text-sm text-gray-700 placeholder:text-gray-400"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e);
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="bg-[#89D4FF] text-white p-2 rounded-xl hover:bg-[#6ac0f0] transition disabled:opacity-40 flex-shrink-0"
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 bg-[#89D4FF]/10 text-[#89D4FF] rounded-3xl flex items-center justify-center mb-5 shadow-sm">
              <MessageSquare size={36} />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Your Conversations</h3>
            <p className="text-gray-400 max-w-xs text-sm leading-relaxed">
              {totalChats > 0
                ? "Select a group or person from the sidebar to start chatting."
                : "Your teachers and class groups will appear here automatically."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
