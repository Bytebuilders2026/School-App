/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, CheckCircle, XCircle, Info, 
  CreditCard, Megaphone, Clock, Trash2,
  X, ExternalLink, FileText, CheckCircle2
} from 'lucide-react';
import { useAppContext } from '../AppContext';
import { AppNotification } from '../types';
import { GlassCard } from './UI';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (page: any) => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose, onNavigate }) => {
  const { user, notifications, markNotificationAsRead, markAllAsRead, clearNotifications } = useAppContext();

  if (!user) return null;

  // Filter notifications for the current user
  const userNotifications = notifications.filter(n => {
    const isForRole = n.role.includes(user.role);
    const isForUser = !n.userId || n.userId === user.id;
    return isForRole && isForUser;
  });

  const unreadCount = userNotifications.filter(n => !n.read).length;

  const handleNotificationClick = (notif: AppNotification) => {
    markNotificationAsRead(notif.id);
    if (notif.targetPage && onNavigate) {
      onNavigate(notif.targetPage);
      onClose();
    }
  };

  const getTypeIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'LEAVE': return <Clock className="text-orange-500" size={18} />;
      case 'FEE': return <CreditCard className="text-red-500" size={18} />;
      case 'NOTICE': return <Megaphone className="text-purple-500" size={18} />;
      case 'DOCUMENT': return <FileText className="text-blue-500" size={18} />;
      default: return <Info className="text-gray-500" size={18} />;
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffInMs = now.getTime() - then.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    
    if (diffInMins < 1) return 'just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    const diffInHours = Math.floor(diffInMins / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return then.toLocaleDateString();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/10 backdrop-blur-sm z-[100] md:hidden"
          />

          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed md:absolute top-16 md:top-20 right-4 left-4 md:left-auto md:w-[400px] z-[101] max-h-[80vh] flex flex-col"
          >
            <GlassCard className="!p-0 overflow-hidden shadow-2xl border-brand-primary/10 flex flex-col h-full bg-white/95">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-brand-light/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center text-white shadow-lg shadow-brand-primary/20">
                    <Bell size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 tracking-tight">Notifications</h3>
                    <p className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">
                      {unreadCount} Unread Messages
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="p-2 text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors flex items-center gap-1.5"
                      title="Mark all as read"
                    >
                      <CheckCircle2 size={18} />
                      <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest">Mark All</span>
                    </button>
                  )}
                  <button 
                    onClick={clearNotifications}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Clear All"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button 
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto no-scrollbar flex-1 max-h-[460px] p-2">
                {userNotifications.length > 0 ? (
                  <div className="space-y-1">
                    {userNotifications.map((notif, i) => (
                      <motion.div 
                        key={notif.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-4 rounded-2xl transition-all cursor-pointer group flex items-start gap-4 active:scale-[0.98] ${notif.read ? 'opacity-50 grayscale-[0.2]' : 'bg-brand-light/20 hover:bg-brand-light/40 border border-brand-primary/10 shadow-sm ring-1 ring-brand-primary/5'}`}
                      >
                        <div className={`mt-1 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${notif.read ? 'bg-gray-100' : 'bg-white shadow-sm border border-brand-primary/10'}`}>
                          {getTypeIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className={`font-black text-gray-900 text-sm truncate ${notif.read ? 'font-bold' : ''}`}>{notif.title}</span>
                            <span className="text-[9px] font-bold text-gray-400 uppercase whitespace-nowrap">{getTimeAgo(notif.timestamp)}</span>
                          </div>
                          <p className={`text-xs leading-relaxed line-clamp-2 ${notif.read ? 'text-gray-500' : 'text-gray-700 font-medium'}`}>{notif.message}</p>
                          {!notif.read && (
                            <div className="mt-2 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce" />
                              <span className="text-[9px] font-black text-brand-primary uppercase tracking-[0.2em]">New Action Required</span>
                            </div>
                          )}
                        </div>
                        {notif.targetPage && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity self-center p-2 bg-brand-primary text-white rounded-lg shadow-lg shadow-brand-primary/20">
                            <ExternalLink size={14} />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-gray-200">
                      <Bell size={24} className="text-gray-300" />
                    </div>
                    <p className="text-gray-400 font-bold text-sm tracking-tight">All caught up!</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">No new notifications</p>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                <button 
                  onClick={onClose}
                  className="w-full py-3 bg-white border border-gray-200 rounded-xl text-[10px] font-black text-gray-500 tracking-[0.2em] uppercase hover:bg-gray-100 transition-all active:scale-95 shadow-sm"
                >
                  Close Panel
                </button>
              </div>
            </GlassCard>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
