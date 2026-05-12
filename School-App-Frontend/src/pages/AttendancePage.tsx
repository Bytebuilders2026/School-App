/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle2, XCircle, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { GlassCard, SectionHeader } from '../components/UI';

export const AttendancePage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { user, attendance } = useAppContext();

  // Simulated Attendance Data for Visuals
  const stats = {
    present: 85,
    absent: 10,
    late: 5,
    totalClasses: 100
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'text-green-500 bg-green-50';
      case 'ABSENT': return 'text-red-500 bg-red-50';
      case 'LATE': return 'text-yellow-500 bg-yellow-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
      <SectionHeader 
        title="Attendance Tracking"
        subtitle="Presence & Punctuality Ecosystem"
        onBack={onBack}
        icon={<CalendarIcon size={28} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Attendance Summary Panel */}
        <div className="lg:col-span-1 space-y-6">
          <GlassCard hoverScale={false} className="flex flex-col items-center py-10">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="80" cy="80" r="70" fill="transparent" stroke="#F3F4F6" strokeWidth="12" />
                <motion.circle 
                  cx="80" cy="80" r="70" fill="transparent" stroke="#10B981" strokeWidth="12" 
                  strokeDasharray={2 * Math.PI * 70}
                  initial={{ strokeDashoffset: 2 * Math.PI * 70 }}
                  animate={{ strokeDashoffset: (2 * Math.PI * 70) * (1 - stats.present / 100) }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-bold text-gray-900">{stats.present}%</span>
                <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Attendance</span>
              </div>
            </div>
            
            <div className="w-full mt-10 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Status</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-bold text-[10px]">GOOD</span>
              </div>
              <div className="h-px bg-gray-100 w-full" />
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <div className="text-xl font-bold text-green-600">{stats.present}</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase">Present</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-red-500">{stats.absent}</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase">Absent</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-yellow-500">{stats.late}</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase">Late</div>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="!p-4 space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-[0.1em] text-brand-secondary">Subject-wise</h3>
            {[
              { name: 'Mathematics', val: 92 },
              { name: 'Physics', val: 78 },
              { name: 'Comp Science', val: 95 },
            ].map(sub => (
              <div key={sub.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-gray-600">{sub.name}</span>
                  <span className="text-brand-primary">{sub.val}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${sub.val}%` }}
                    className="h-full bg-brand-primary rounded-full px-4"
                  />
                </div>
              </div>
            ))}
          </GlassCard>
        </div>

        {/* Attendance List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Recent History</h2>
            <div className="flex gap-2">
              <button className="px-4 py-2 glass-card text-xs font-bold hover:bg-brand-light flex items-center gap-2">
                <CalendarIcon size={14} /> Monthly View
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {attendance.length > 0 ? (
              attendance.map(item => (
                <GlassCard key={item.id} hoverScale={false} className="!p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${getStatusColor(item.status)}`}>
                      {item.status === 'PRESENT' && <CheckCircle2 size={24} />}
                      {item.status === 'ABSENT' && <XCircle size={24} />}
                      {item.status === 'LATE' && <Clock size={24} />}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.studentName}</h4>
                      <p className="text-xs text-gray-500 font-medium">{item.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="hidden md:block">
                      <span className="text-xs text-gray-400 font-bold uppercase tracking-widest block">Subject</span>
                      <span className="font-medium text-gray-700">General Assembly</span>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full font-bold text-[11px] tracking-wider ${getStatusColor(item.status)}`}>
                      {item.status}
                    </div>
                  </div>
                </GlassCard>
              ))
            ) : (
              <p className="text-center py-20 text-gray-400 pb-4">No attendance history found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
