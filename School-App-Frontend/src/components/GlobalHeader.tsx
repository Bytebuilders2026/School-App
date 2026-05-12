/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Bell, User, LogOut, ChevronLeft } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { NotificationPanel } from './NotificationPanel';

interface GlobalHeaderProps {
  onBack?: () => void;
  showBack?: boolean;
  onNavigate?: (page: any) => void;
}

export const GlobalHeader: React.FC<GlobalHeaderProps> = ({ onBack, showBack = false, onNavigate }) => {
  const { user, logout, notifications } = useAppContext();
  const [showNotifications, setShowNotifications] = useState(false);

  if (!user) return null;

  const userNotifications = (notifications || []).filter(n => {
    const isForRole = Array.isArray(n.role) ? n.role.includes(user.role) : true;
    const isForUser = !n.userId || n.userId === user.id;
    return isForRole && isForUser;
  });

  const unreadCount = userNotifications.filter(n => !n.read).length;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-20 bg-white/70 backdrop-blur-xl border-b border-gray-100 flex items-center px-4 sm:px-8">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBack && onBack ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center rounded-xl glass-card text-gray-500 hover:text-brand-primary"
            >
              <ChevronLeft size={24} />
            </motion.button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center text-white shadow-lg shadow-brand-primary/20">
                <span className="font-black text-lg">B</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-sm font-black text-gray-900 tracking-tight">ByteBuilders</span>
                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest leading-none">Edu OS v2.0</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 relative">
          <motion.button 
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowNotifications(!showNotifications)}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all bg-white border border-gray-100 shadow-sm ${unreadCount > 0 ? 'text-brand-primary border-brand-primary/30 ring-4 ring-brand-primary/5' : 'text-gray-500 hover:text-brand-primary'}`}
          >
            <Bell size={20} className={unreadCount > 0 ? 'animate-pulse' : ''} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                {unreadCount}
              </span>
            )}
          </motion.button>

          <NotificationPanel 
            isOpen={showNotifications} 
            onClose={() => setShowNotifications(false)} 
            onNavigate={onNavigate}
          />

          <div className="h-8 w-px bg-gray-100 mx-1 hidden sm:block" />

          <div className="hidden sm:flex items-center gap-4 pl-4 border-l border-gray-100">
            <div className="text-right">
              <p className="text-xs font-black text-gray-900 leading-none">{user.name}</p>
              <p className="text-[10px] font-bold text-brand-primary uppercase mt-1 tracking-widest">{user.role}</p>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={logout}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-red-500 bg-red-50 hover:bg-red-100 transition-colors border border-red-100"
              title="Logout"
            >
              <LogOut size={18} />
            </motion.button>
          </div>
          
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={logout}
            className="sm:hidden w-12 h-12 rounded-xl flex items-center justify-center text-red-500 bg-red-50 border border-red-100"
          >
            <LogOut size={20} />
          </motion.button>
        </div>
      </div>
    </header>
  );
};
