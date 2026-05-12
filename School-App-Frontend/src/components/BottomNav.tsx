/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Home, Calendar, CreditCard, User, Bell } from 'lucide-react';
import { PageType } from '../App';

interface BottomNavProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
  role?: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentPage, onNavigate, role }) => {
  // Only show for students/parents for now as admin has too many primary tasks
  if (role === 'ADMIN') return null;

  const navItems = [
    { id: 'DASHBOARD', label: 'Home', icon: <Home size={22} /> },
    { id: 'timetable', label: 'Schedule', icon: <Calendar size={22} /> },
    { id: role === 'PARENT' ? 'fees_parent' : 'fees_student', label: 'Finance', icon: <CreditCard size={22} /> },
    { id: 'profile', label: 'Profile', icon: <User size={22} /> },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-6 pb-6">
      <nav className="glass-card !bg-white/90 backdrop-blur-xl border-white/40 shadow-[0_-8px_40px_-10px_rgba(0,0,0,0.1)] rounded-[28px] h-20 flex items-center justify-around px-4">
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as PageType)}
              className="relative flex flex-col items-center justify-center w-16 h-full transition-all touch-target"
            >
              <motion.div
                animate={{ 
                  scale: isActive ? 1.1 : 1,
                  y: isActive ? -4 : 0,
                  color: isActive ? '#10B981' : '#9CA3AF'
                }}
                className="relative z-10"
              >
                {item.icon}
              </motion.div>
              <span className={`text-[10px] font-bold mt-1 tracking-tight transition-colors ${isActive ? 'text-brand-primary' : 'text-gray-400'}`}>
                {item.label}
              </span>
              {isActive && (
                <motion.div 
                  layoutId="activeNav"
                  className="absolute inset-0 bg-brand-light/40 rounded-2xl -z-0"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
