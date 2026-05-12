/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, User, Search, Trash2, Edit, GraduationCap, Users, Filter, CheckCircle, MoreVertical } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { GlassCard, GlassInput, SectionHeader } from '../components/UI';

export const AdminStudentsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { students } = useAppContext();
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Active' | 'Inactive'>('ALL');

  // Derive unique classes
  const classes = Array.from(new Set(students.map(s => s.class))).sort();

  // Filter students if class is selected
  const classStudents = students.filter(s => s.class === selectedClass);
  const filteredStudents = classStudents.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.rollNo.includes(searchTerm);
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleBack = () => {
    if (selectedClass) {
      setSelectedClass(null);
      setSearchTerm('');
    } else {
      onBack();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
      <SectionHeader 
        title={selectedClass ? `${selectedClass} Students` : 'Student Directory'}
        subtitle={selectedClass ? `Academic Class Repository • ${filteredStudents.length} Records` : 'ByteBuilders Institutional Hierarchy'}
        onBack={handleBack}
        icon={<GraduationCap size={28} />}
      />

      <AnimatePresence mode="wait">
        {!selectedClass ? (
          /* LEVEL 1: Classes Grid */
          <motion.div
            key="classes-grid"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {classes.map(className => {
              const classSpecificStudents = students.filter(s => s.class === className);
              const totalCount = classSpecificStudents.length;
              const activeCount = classSpecificStudents.filter(s => s.status === 'Active').length;

              return (
                <GlassCard 
                  key={className} 
                  hoverScale={false}
                  className="!p-0 overflow-hidden flex flex-col group border-transparent hover:border-brand-primary/10 transition-all active:scale-[0.98]"
                >
                  {/* Top Section */}
                  <div className="p-6 pb-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-brand-light flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all duration-300">
                        <GraduationCap size={28} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{className}</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Academic Session 2024-25</p>
                      </div>
                    </div>
                  </div>

                  {/* Overview Section */}
                  <div className="px-6 py-4 bg-gray-50/50 border-y border-gray-100 grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">{totalCount}</div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Students</div>
                    </div>
                    <div className="text-center border-l border-gray-100">
                      <div className="text-lg font-bold text-green-500">{activeCount}</div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Now</div>
                    </div>
                  </div>

                  {/* Preview List */}
                  <div className="p-6 flex-1">
                    <div className="flex items-center gap-2 mb-3">
                       <div className="w-1 h-3 bg-brand-primary rounded-full" />
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Recent Enrollments</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {classSpecificStudents.slice(0, 3).map(s => (
                        <span key={s.id} className="px-2 py-1 bg-white border border-gray-100 rounded-lg text-[10px] font-medium text-gray-600">
                          {s.name.split(' ')[0]}
                        </span>
                      ))}
                      {totalCount > 3 && (
                        <span className="px-2 py-1 bg-gray-100 rounded-lg text-[10px] font-bold text-gray-400">
                          +{totalCount - 3} More
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Section */}
                  <div className="p-4 pt-0">
                    <button 
                      onClick={() => setSelectedClass(className)}
                      className="w-full py-3 bg-brand-primary/5 hover:bg-brand-primary text-brand-primary hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 group/btn"
                    >
                      VIEW CLASS REPOSITORY
                      <ArrowLeft className="rotate-180 transition-transform group-hover/btn:translate-x-1" size={14} />
                    </button>
                  </div>
                </GlassCard>
              );
            })}
          </motion.div>
        ) : (
          /* LEVEL 2: Students List */
          <motion.div
            key="students-list"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 w-full">
                <GlassInput 
                  placeholder="Search by name or roll number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<Search size={18} />}
                />
              </div>
              <div className="flex bg-gray-100 p-1 rounded-xl w-full md:w-auto">
                {(['ALL', 'Active', 'Inactive'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    className={`flex-1 md:px-4 py-2 text-[10px] font-bold rounded-lg transition-all ${statusFilter === f ? 'bg-white text-brand-primary shadow-sm' : 'text-gray-400'}`}
                  >
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Students Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStudents.length > 0 ? (
                filteredStudents.map(student => (
                  <GlassCard key={student.id} hoverScale={true} className="!p-5 flex flex-col border-transparent hover:border-brand-primary/10 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 flex items-center justify-center text-brand-primary">
                          <User size={24} />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg leading-tight">{student.name}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest">Roll: {student.rollNo}</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{student.class}</span>
                          </div>
                        </div>
                      </div>
                      <button className="text-gray-300 hover:text-gray-900">
                        <MoreVertical size={18} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 my-4">
                      <div className="bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                        <div className="text-xs text-gray-400 font-bold uppercase tracking-tighter mb-0.5">Attendance</div>
                        <div className="text-lg font-bold text-brand-primary">{student.attendance}%</div>
                      </div>
                      <div className="bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                        <div className="text-xs text-gray-400 font-bold uppercase tracking-tighter mb-0.5">Status</div>
                        <div className={`text-lg font-bold flex items-center gap-1.5 ${student.status === 'Active' ? 'text-green-500' : 'text-gray-400'}`}>
                          {student.status === 'Active' && <CheckCircle size={14} />}
                          {student.status}
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-50 flex gap-2">
                      <button className="flex-1 py-2.5 bg-brand-light text-brand-secondary rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-brand-primary hover:text-white transition-all">
                        <Edit size={14} /> EDIT
                      </button>
                      <button className="flex-1 py-2.5 bg-red-50 text-red-500 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all">
                        <Trash2 size={14} /> DELETE
                      </button>
                    </div>
                  </GlassCard>
                ))
              ) : (
                <div className="col-span-full py-20 text-center glass-card border-none rounded-[32px]">
                   <Users size={64} className="mx-auto text-gray-200 mb-4" />
                   <p className="text-gray-400 font-medium">No students found matching your criteria.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
