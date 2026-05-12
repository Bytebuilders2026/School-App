/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, User, Search, Trash2, Edit, BookOpen, Users, Calendar, Clock, MoreVertical, Briefcase } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { GlassCard, GlassInput, SectionHeader } from '../components/UI';

export const AdminTeachersPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { teachers, timetable: globalTimetable } = useAppContext();
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedTeacher = teachers.find(t => (t.id === selectedTeacherId || t._id === selectedTeacherId));

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBack = () => {
    if (selectedTeacherId) {
      setSelectedTeacherId(null);
    } else {
      onBack();
    }
  };

  // Derive teacher-specific timetable from global timetable
  const teacherTimetable = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => {
    const dayName = day.substring(0, 3);
    const periods = (globalTimetable[dayName] || []).filter(p => p.teacher === selectedTeacher?.name);
    return {
      day,
      periods: periods.map(p => ({
        subject: p.subject,
        class: p.room || 'Classroom', // Using room as class placeholder if class is missing in normalized TT
        time: `${p.startTime} - ${p.endTime}`
      }))
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
      <SectionHeader 
        title={selectedTeacher ? 'Teacher Profile' : 'Faculty Directory'}
        subtitle={selectedTeacher ? `Viewing Details for ${selectedTeacher.name}` : 'ByteBuilders Institutional hierarchy • Teaching Staff'}
        onBack={handleBack}
        icon={<Users size={28} />}
      />

      <AnimatePresence mode="wait">
        {!selectedTeacherId ? (
          /* LEVEL 1: Teachers List */
          <motion.div
            key="teachers-list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-8"
          >
            <div className="max-w-md">
              <GlassInput 
                placeholder="Search by name or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search size={18} />}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTeachers.map(teacher => (
                <GlassCard 
                  key={teacher.id} 
                  onClick={() => setSelectedTeacherId(teacher.id)}
                  className="!p-6 group flex items-start gap-5 border-transparent hover:border-brand-primary/10 transition-all"
                >
                  <div className="w-16 h-16 rounded-2xl bg-brand-light flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all duration-300">
                    <User size={32} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-brand-primary transition-colors">{teacher.name}</h3>
                    <p className="text-sm font-medium text-gray-400 mb-3">{teacher.subject} Teacher</p>
                    <div className="flex gap-4">
                       <div className="text-[10px] font-bold text-brand-secondary bg-brand-light px-2 py-1 rounded-md uppercase tracking-widest">{teacher.classes.length} Classes</div>
                       <div className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-md uppercase tracking-widest">{teacher.totalStudents} Students</div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </motion.div>
        ) : (
          /* LEVEL 2: Teacher Detail */
          <motion.div
            key="teacher-detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Sidebar */}
              <div className="space-y-6">
                <GlassCard hoverScale={false} className="!p-8 text-center flex flex-col items-center">
                   <div className="w-24 h-24 rounded-3xl bg-brand-light flex items-center justify-center text-brand-primary mb-6 shadow-sm border border-white">
                     <User size={48} />
                   </div>
                   <h2 className="text-2xl font-bold text-gray-900">{selectedTeacher?.name}</h2>
                   <p className="text-brand-secondary font-semibold mb-6">{selectedTeacher?.subject} Department</p>
                   
                   <div className="w-full space-y-3 pt-6 border-t border-gray-50">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400 flex items-center gap-2"><Briefcase size={14} /> Role</span>
                        <span className="font-bold text-gray-700">Senior Faculty</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400 flex items-center gap-2"><BookOpen size={14} /> Subject</span>
                        <span className="font-bold text-gray-700">{selectedTeacher?.subject}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400 flex items-center gap-2"><Users size={14} /> Students</span>
                        <span className="font-bold text-gray-700">{selectedTeacher?.totalStudents}</span>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-3 w-full mt-8">
                      <button className="py-2.5 bg-brand-light text-brand-secondary rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-brand-primary hover:text-white transition-all">
                        <Edit size={14} /> EDIT
                      </button>
                      <button className="py-2.5 bg-red-50 text-red-500 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all">
                        <Trash2 size={14} /> DELETE
                      </button>
                   </div>
                </GlassCard>

                <GlassCard hoverScale={false} className="!p-6">
                  <h4 className="font-bold text-gray-900 mb-4 px-2">Assigned Classes</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTeacher?.classes.map(cls => (
                      <div key={cls} className="px-4 py-2 bg-gray-50 rounded-xl text-xs font-bold text-gray-600 border border-gray-100 uppercase tracking-widest">
                        {cls}
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>

              {/* Timetable Section */}
              <div className="lg:col-span-2 space-y-6">
                <GlassCard hoverScale={false} className="!p-8">
                   <div className="flex items-center justify-between mb-8">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-light rounded-lg text-brand-primary">
                          <Calendar size={20} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Weekly Timetable</h3>
                     </div>
                     <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Academic Year 2024-25</span>
                   </div>

                   <div className="space-y-6">
                     {teacherTimetable.map((dayPlan, idx) => (
                       <div key={idx} className="flex gap-6">
                          <div className="w-16 flex flex-col items-center pt-1">
                             <span className="text-xs font-black text-gray-300 uppercase tracking-widest">{dayPlan.day}</span>
                             <div className="w-px flex-1 bg-gradient-to-b from-gray-200 via-gray-200 to-transparent mt-2" />
                          </div>
                          <div className="flex-1 space-y-3 pb-8">
                             {dayPlan.periods.length > 0 ? (
                               dayPlan.periods.map((p, pIdx) => (
                                 <div key={pIdx} className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-white hover:shadow-sm hover:border-brand-primary/10 transition-all">
                                    <div className="flex items-center gap-4">
                                       <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-brand-primary shadow-sm group-hover:scale-110 transition-transform">
                                         <Clock size={18} />
                                       </div>
                                       <div>
                                          <h5 className="font-bold text-gray-800">{p.subject}</h5>
                                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{p.time}</p>
                                       </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                       <span className="px-3 py-1 bg-brand-light text-brand-secondary text-[10px] font-bold rounded-lg border border-brand-primary/5 uppercase tracking-widest">
                                          {p.class}
                                       </span>
                                    </div>
                                 </div>
                               ))
                             ) : (
                               <div className="text-xs italic text-gray-300 py-2">No periods scheduled</div>
                             )}
                          </div>
                       </div>
                     ))}
                   </div>
                </GlassCard>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
