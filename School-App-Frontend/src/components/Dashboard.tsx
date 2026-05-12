/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import {
  User, Calendar, ClipboardCheck,
  BookOpen, CreditCard, MessageSquare, Megaphone,
  Users, Briefcase, FileText, Settings,
  PieChart, DollarSign, FileUp, Key
} from 'lucide-react';
import { useAppContext } from '../AppContext';
import { GlassCard } from './UI';

interface DashboardItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  category?: 'ACADEMICS' | 'FEES' | 'COMMUNICATION' | 'ADMIN' | 'REQUESTS';
}

interface DashboardProps {
  onNavigate: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user } = useAppContext();

  if (!user) return null;

  const getDashboardItems = (): DashboardItem[] => {
    const commonComm: DashboardItem[] = [
      { id: 'messages', title: 'Messages', icon: <MessageSquare />, color: '#10B981', category: 'COMMUNICATION' },
      { id: 'notices', title: 'Notices', icon: <Megaphone />, color: '#F59E0B', category: 'COMMUNICATION' },
      { id: 'events', title: 'Events', icon: <Calendar />, color: '#8B5CF6', category: 'COMMUNICATION' },
    ];

    switch (user.role) {
      case 'ADMIN':
        return [
          { id: 'manage_students', title: 'Students Mgmt', icon: <User />, color: '#10B981', category: 'ADMIN' },
          { id: 'manage_teachers', title: 'Teachers Mgmt', icon: <Users />, color: '#3B82F6', category: 'ADMIN' },
          { id: 'fees_admin', title: 'Finance', icon: <DollarSign />, color: '#F59E0B', category: 'ADMIN' },
          { id: 'notices_admin', title: 'Notices', icon: <Megaphone />, color: '#6366F1', category: 'ADMIN' },
          { id: 'leave_governance', title: 'Leave Audit', icon: <FileUp />, color: '#8B5CF6', category: 'REQUESTS' },
          { id: 'doc_governance', title: 'Doc Audit', icon: <BookOpen />, color: '#EF4444', category: 'REQUESTS' },
          { id: 'reports', title: 'Reports', icon: <FileText />, color: '#EC4899', category: 'ADMIN' },
          { id: 'settings', title: 'Settings', icon: <Settings />, color: '#6B7280', category: 'ADMIN' },
        ];
      case 'TEACHER':
        return [
          { id: 'classes', title: 'My Classes', icon: <Briefcase />, color: '#10B981', category: 'ACADEMICS' },
          { id: 'attendance_teacher', title: 'Attendance', icon: <ClipboardCheck />, color: '#3B82F6', category: 'ACADEMICS' },
          { id: 'assignments_teacher', title: 'Assignments', icon: <FileText />, color: '#F59E0B', category: 'ACADEMICS' },
          { id: 'leave_approvals', title: 'Leave Approvals', icon: <FileUp />, color: '#8B5CF6', category: 'REQUESTS' },
          { id: 'doc_approvals', title: 'Doc Approvals', icon: <BookOpen />, color: '#EF4444', category: 'REQUESTS' },
          { id: 'timetable', title: 'Timetable', icon: <Calendar />, color: '#6366F1', category: 'ACADEMICS' },
          ...commonComm
        ];
      case 'STUDENT':
        return [
          { id: 'profile', title: 'My Profile', icon: <User />, color: '#10B981' },
          { id: 'timetable', title: 'Timetable', icon: <Calendar />, color: '#3B82F6', category: 'ACADEMICS' },
          { id: 'attendance_student', title: 'Attendance', icon: <ClipboardCheck />, color: '#F59E0B', category: 'ACADEMICS' },
          { id: 'assignments_student', title: 'Assignments', icon: <FileText />, color: '#8B5CF6', category: 'ACADEMICS' },
          { id: 'fees_student', title: 'School Fees', icon: <CreditCard />, color: '#EF4444', category: 'FEES' },
          { id: 'leave_request', title: 'Leave Request', icon: <FileUp />, color: '#6366F1', category: 'REQUESTS' },
          { id: 'doc_request', title: 'Request Docs', icon: <BookOpen />, color: '#EC4899', category: 'REQUESTS' },
          ...commonComm
        ];
      case 'PARENT':
        return [
          { id: 'attendance_parent', title: 'Attendance', icon: <ClipboardCheck />, color: '#10B981' },
          { id: 'fees_parent', title: 'School Fees', icon: <CreditCard />, color: '#F59E0B' },
          { id: 'gate_pass', title: 'Gate Pass', icon: <Key />, color: '#EF4444' },
          ...commonComm
        ];
      default:
        return [];
    }
  };

  const items = getDashboardItems();
  const categories = Array.from(new Set(items.map(i => i.category).filter(Boolean)));

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
      {/* Personalized Greeting Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-brand-primary flex items-center justify-center text-white shadow-lg shadow-brand-primary/20 relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <User size={32} />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight">
              Hello, <span className="text-brand-primary">{user.name}</span>
            </h1>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1 opacity-80 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              {user.role} INTERFACE • ACTIVE SESSION
            </p>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="space-y-12 pb-24 md:pb-8">
        {categories.length > 0 ? (
          categories.map(cat => (
            <div key={cat} className="space-y-6">
              <div className="flex items-center gap-4">
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1">{cat} HUB</h2>
                <div className="h-px bg-gray-200/60 flex-1" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                {items.filter(i => i.category === cat).map(item => (
                  <DashboardCard key={item.id} item={item} onClick={() => onNavigate(item.id)} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {items.map(item => (
              <DashboardCard key={item.id} item={item} onClick={() => onNavigate(item.id)} />
            ))}
          </div>
        )}

        {/* Render items without categories at the end if any */}
        {categories.length > 0 && items.some(i => !i.category) && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1">PRIMARY ACTIONS</h2>
              <div className="h-px bg-gray-200/60 flex-1" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {items.filter(i => !i.category).map(item => (
                <DashboardCard key={item.id} item={item} onClick={() => onNavigate(item.id)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const DashboardCard: React.FC<{ item: DashboardItem; onClick: () => void }> = ({ item, onClick }) => {
  return (
    <GlassCard
      onClick={onClick}
      className="aspect-square flex flex-col items-center justify-center gap-5 text-center group border-transparent hover:border-brand-primary/20"
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
        style={{
          backgroundColor: item.color,
          boxShadow: `0 8px 16px -4px ${item.color}33`
        }}
      >
        {React.cloneElement(item.icon as React.ReactElement, { size: 32 })}
      </div>
      <div className="space-y-1">
        <span className="font-bold text-gray-800 text-sm sm:text-base leading-tight block">{item.title}</span>
        <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest block opacity-0 group-hover:opacity-100 transition-opacity">Access Hub</span>
      </div>
    </GlassCard>
  );
};
