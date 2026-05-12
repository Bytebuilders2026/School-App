import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, BookOpen, Clock, Calendar, CheckCircle, CheckCircle2, FileText, Download, PlayCircle, Plus, Info, MapPin, User, X } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { GlassCard, GradientButton, SectionHeader, PermissionGuard } from '../components/UI';

const SUBJECT_COLORS: Record<string, string> = {
  'Mathematics': '#E0F2FE', // Blue
  'Physics': '#DCFCE7',     // Green
  'Chemistry': '#FEF9C3',   // Yellow
  'History': '#FFEDD5',     // Orange
  'Comp Science': '#F3E8FF', // Purple
  'English': '#FCE7F3',     // Pink
  'Biology': '#ECFDF5',     // Teal
  'Break': '#F3F4F6'        // Gray
};

const SUBJECT_TEXT: Record<string, string> = {
  'Mathematics': '#0369A1',
  'Physics': '#15803D',
  'Chemistry': '#A16207',
  'History': '#C2410C',
  'Comp Science': '#7E22CE',
  'English': '#BE185D',
  'Biology': '#047857',
  'Break': '#4B5563'
};

export const AcademicsPage: React.FC<{ onBack: () => void; initialView: 'TIMETABLE' | 'ASSIGNMENTS' }> = ({ onBack, initialView }) => {
  const { user, assignments, timetable } = useAppContext();
  const [view, setView] = useState(initialView);
  const [activeDay, setActiveDay] = useState('Mon');
  const [selectedPeriod, setSelectedPeriod] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedClassTerm, setSelectedClassTerm] = useState('10-A');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const isCurrentPeriod = (startTime: string, endTime: string) => {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const now = currentTime;
    const start = new Date(now).setHours(startH, startM, 0);
    const end = new Date(now).setHours(endH, endM, 0);
    return now.getTime() >= start && now.getTime() < end;
  };

  const isToday = (day: string) => {
    const todayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = todayNames[currentTime.getDay()];
    return today === day;
  };

  const getCurrentAndNext = () => {
    const todayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = todayNames[currentTime.getDay()];
    const periods = timetable[today] || [];
    const now = currentTime;
    
    let currentPeriod = null;
    let nextPeriod = null;

    for (let i = 0; i < periods.length; i++) {
      const [startH, startM] = periods[i].startTime.split(':').map(Number);
      const [endH, endM] = periods[i].endTime.split(':').map(Number);
      const start = new Date(now).setHours(startH, startM, 0);
      const end = new Date(now).setHours(endH, endM, 0);

      if (now.getTime() >= start && now.getTime() < end) {
        currentPeriod = periods[i];
        nextPeriod = periods[i + 1] || null;
        break;
      } else if (now.getTime() < start) {
        nextPeriod = periods[i];
        break;
      }
    }
    return { currentPeriod, nextPeriod };
  };

  const { currentPeriod, nextPeriod } = getCurrentAndNext();

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <SectionHeader 
          title={view === 'TIMETABLE' ? 'Academic Hub' : 'Current Assignments'}
          subtitle={user?.role === 'ADMIN' ? 'ByteBuilders Institutional Hierarchy' : 'Daily Schedule & Performance View'}
          onBack={onBack}
          icon={<BookOpen size={28} />}
        />
        <div className="md:mt-[-40px]">
          <div className="flex bg-gray-100/80 backdrop-blur-md p-1.5 rounded-2xl w-full md:w-auto shadow-inner border border-gray-200/50">
             {(['TIMETABLE', 'ASSIGNMENTS'] as const).map(v => (
               <button
                 key={v}
                 onClick={() => setView(v)}
                 className={`flex-1 md:px-8 py-3 text-xs font-black rounded-xl transition-all uppercase tracking-[0.15em] ${view === v ? 'bg-white text-brand-primary shadow-lg shadow-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
               >
                 {v}
               </button>
             ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {view === 'TIMETABLE' ? (
          <div className="space-y-10 pb-32">
            {/* Contextual Top Banner */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <GlassCard className="!bg-brand-primary !text-white overflow-hidden relative group border-none shadow-2xl shadow-brand-primary/20">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10 flex items-center justify-between h-full">
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mb-2">Ongoing Session</h3>
                    {currentPeriod ? (
                      <div>
                        <div className="text-3xl font-black tracking-tight">{currentPeriod.subject}</div>
                        <div className="flex items-center gap-3 mt-3 text-xs font-bold opacity-90">
                           <span className="flex items-center gap-1.5 bg-white/20 px-2.5 py-1 rounded-lg"><Clock size={14} /> {currentPeriod.startTime} - {currentPeriod.endTime}</span>
                           <span className="flex items-center gap-1.5"><MapPin size={14} /> {currentPeriod.room}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="py-2">
                        <div className="text-2xl font-black">No Active Class</div>
                        <p className="text-xs font-bold opacity-70 mt-1">Check your next scheduled period</p>
                      </div>
                    )}
                  </div>
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                     <Clock size={32} />
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="overflow-hidden relative group border-brand-light bg-brand-light/10">
                <div className="relative z-10 flex items-center justify-between h-full">
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-secondary mb-2">Up Next</h3>
                    {nextPeriod ? (
                      <div>
                        <div className="text-2xl font-black text-gray-900 tracking-tight">{nextPeriod.subject}</div>
                        <div className="flex items-center gap-4 mt-2 text-xs font-bold text-gray-500">
                           <span className="flex items-center gap-1.5"><Clock size={14} /> Begins at {nextPeriod.startTime}</span>
                           <span className="flex items-center gap-1.5 text-brand-primary"><User size={14} /> {nextPeriod.teacher}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm font-bold text-gray-400">Day concluded. Rest well!</p>
                    )}
                  </div>
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-brand-primary shadow-sm border border-brand-primary/5 group-hover:scale-110 transition-transform">
                     <ArrowLeft className="rotate-180" size={24} />
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Role-Based Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-2">
              <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar w-full sm:w-auto">
                 {days.map(day => (
                   <button 
                    key={day} 
                    onClick={() => setActiveDay(day)}
                    className={`relative px-8 py-4 rounded-[24px] text-sm font-black transition-all min-w-[100px] flex flex-col items-center gap-1 active:scale-95 ${activeDay === day ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/20 scale-105' : 'glass-card text-gray-400 hover:text-gray-600'}`}
                   >
                      {day}
                      {isToday(day) && (
                        <motion.span layoutId="todayDot" className="w-1.5 h-1.5 bg-current rounded-full" />
                      )}
                   </button>
                 ))}
              </div>

              {user?.role === 'ADMIN' && (
                <div className="flex bg-gray-100 p-1 rounded-2xl w-full sm:w-auto self-end">
                   {['10-A', '10-B'].map(cls => (
                     <button
                      key={cls}
                      onClick={() => setSelectedClassTerm(cls)}
                      className={`px-6 py-2.5 text-[10px] font-black rounded-xl transition-all tracking-widest ${selectedClassTerm === cls ? 'bg-white text-brand-primary shadow-sm' : 'text-gray-400'}`}
                     >
                       CLASS {cls}
                     </button>
                   ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6">
              {(timetable[activeDay] || []).map((slot, i) => {
                const active = isCurrentPeriod(slot.startTime, slot.endTime) && isToday(activeDay);
                const color = SUBJECT_COLORS[slot.subject] || '#F9FAFB';
                const textColor = SUBJECT_TEXT[slot.subject] || '#111827';

                return (
                  <motion.div
                    key={slot.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <GlassCard 
                      hoverScale={active ? false : true}
                      onClick={() => setSelectedPeriod(slot)}
                      className={`!p-0 cursor-pointer overflow-hidden transition-all group ${active ? 'shadow-2xl shadow-brand-primary/20 border-brand-primary/40' : 'hover:border-gray-200 border-transparent'}`}
                    >
                      <div className="flex flex-col sm:flex-row">
                        {/* Status bar */}
                        <div className="w-full sm:w-2 h-2 sm:h-auto" style={{ backgroundColor: active ? '#10B981' : textColor }} />
                        
                        <div className="flex-1 p-6 sm:p-8 flex items-center justify-between">
                          <div className="flex items-center gap-6 sm:gap-10">
                            {/* Time Block */}
                            <div className="flex flex-col items-center gap-1.5 min-w-[70px]">
                              <span className="text-sm font-black text-gray-900 tabular-nums">{slot.startTime}</span>
                              <div className="h-4 w-px bg-gray-200" />
                              <span className="text-xs font-bold text-gray-400 tabular-nums opacity-60">{slot.endTime}</span>
                            </div>

                            {/* Subject & Teacher */}
                            <div className="flex items-center gap-5 sm:gap-8">
                              <div 
                                className="w-14 h-14 sm:w-16 h-16 rounded-[22px] flex items-center justify-center shadow-sm group-hover:scale-105 transition-all duration-500"
                                style={{ backgroundColor: color, color: textColor }}
                              >
                                <BookOpen size={24} className="sm:w-7 sm:h-7" />
                              </div>
                              <div>
                                <h4 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-none group-hover:text-brand-primary transition-colors">{slot.subject}</h4>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5">
                                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"><User size={12} /></div>
                                    {slot.teacher}
                                  </span>
                                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"><MapPin size={12} /></div>
                                    Room {slot.room}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            {user?.role === 'TEACHER' && slot.subject !== 'Break' && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); alert('Attendance Module Initialized'); }}
                                className="hidden md:flex px-6 py-2.5 bg-white border border-brand-primary/20 text-brand-primary rounded-xl text-[10px] font-black tracking-widest uppercase hover:bg-brand-primary hover:text-white transition-all active:scale-95 shadow-sm"
                              >
                                MARK ATTENDANCE
                              </button>
                            )}
                            <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-50 text-gray-400 group-hover:bg-brand-light group-hover:text-brand-primary transition-all">
                               <Info size={20} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })}
              
              {(timetable[activeDay] || []).length === 0 && (
                <div className="text-center py-24 bg-gray-50/50 rounded-[40px] border-2 border-dashed border-gray-200">
                  <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-gray-200 mx-auto mb-6 shadow-sm">
                    <Calendar size={40} />
                  </div>
                  <p className="text-gray-400 font-bold text-lg tracking-tight">No academic sessions scheduled</p>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mt-2">{activeDay} Holiday / Break</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
             {assignments.map(ass => (
               <GlassCard key={ass.id} hoverScale={false} className="!p-6 group border-transparent hover:border-brand-primary/10 transition-all">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-4 rounded-[22px] transition-transform group-hover:scale-105 ${ass.status === 'PENDING' ? 'bg-red-50 text-red-500 shadow-red-100' : 'bg-green-50 text-green-500 shadow-green-100'} shadow-sm`}>
                        <FileText size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 group-hover:text-brand-primary transition-colors tracking-tight">{ass.title}</h4>
                        <div className="flex items-center gap-3 text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                          <span className="text-brand-secondary">{ass.subject}</span>
                          <span className="text-gray-200">|</span>
                          <span className="flex items-center gap-1"><Calendar size={12} className="opacity-50" /> Due: {ass.dueDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                      {ass.status === 'PENDING' ? (
                        <PermissionGuard allowedRoles={['STUDENT']} fallback={
                          <div className="flex items-center gap-2 text-yellow-600 font-black text-[10px] uppercase tracking-[0.2em] px-4 py-2 bg-yellow-50 rounded-xl border border-yellow-100">
                             <Clock size={14} /> PENDING
                          </div>
                        }>
                          <button className="flex-1 md:flex-none px-6 py-2.5 bg-brand-primary text-white rounded-xl text-xs font-black tracking-widest uppercase shadow-lg shadow-brand-primary/10 hover:bg-brand-secondary transition-all active:scale-95">
                             SUBMIT
                          </button>
                        </PermissionGuard>
                      ) : (
                        <div className="flex items-center gap-2 text-green-600 font-black text-[10px] uppercase tracking-[0.2em] px-4 py-2 bg-green-50 rounded-xl border border-green-100">
                           <CheckCircle2 size={14} /> SUBMITTED
                        </div>
                      )}
                      <button className="flex items-center justify-center p-3 rounded-xl bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all active:scale-90">
                        <Download size={20} />
                      </button>
                    </div>
                  </div>
               </GlassCard>
             ))}
             <PermissionGuard allowedRoles={['TEACHER', 'ADMIN']}>
               <div className="mt-8">
                  <GradientButton className="!w-auto !px-10">
                    <Plus size={20} className="mr-2" /> CREATE ASSIGNMENT
                  </GradientButton>
               </div>
             </PermissionGuard>
          </div>
        )}
      </div>

      {/* Period Detail Modal */}
      <AnimatePresence>
        {selectedPeriod && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto pt-20 pb-10">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setSelectedPeriod(null)}
               className="absolute inset-0 bg-black/60 backdrop-blur-md"
             />
             <motion.div
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden my-auto"
             >
                <div 
                  className="h-32 p-8 flex items-end justify-between relative"
                  style={{ backgroundColor: SUBJECT_COLORS[selectedPeriod.subject] || '#F9FAFB' }}
                >
                   <button 
                    onClick={() => setSelectedPeriod(null)}
                    className="absolute top-6 right-6 p-2 bg-white/50 hover:bg-white rounded-full transition-all active:scale-90"
                   >
                     <X size={20} />
                   </button>
                   <div>
                     <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1">Academic Unit</div>
                     <h3 className="text-3xl font-black text-gray-900 tracking-tighter leading-none" style={{ color: SUBJECT_TEXT[selectedPeriod.subject] }}>{selectedPeriod.subject}</h3>
                   </div>
                   <div className="w-16 h-16 bg-white rounded-3xl shadow-lg flex items-center justify-center text-gray-900 border border-white">
                      <BookOpen size={32} />
                   </div>
                </div>

                <div className="p-8 sm:p-10 space-y-8">
                   <div className="grid grid-cols-2 gap-6 sm:gap-8">
                      <div className="space-y-1 transform transition-all hover:translate-x-1">
                         <div className="text-[10px] text-brand-primary font-black uppercase tracking-widest">Faculty</div>
                         <div className="text-lg font-bold text-gray-900">{selectedPeriod.teacher}</div>
                      </div>
                      <div className="space-y-1 transform transition-all hover:translate-x-1">
                         <div className="text-[10px] text-brand-primary font-black uppercase tracking-widest">Location</div>
                         <div className="text-lg font-bold text-gray-900">Room {selectedPeriod.room}</div>
                      </div>
                      <div className="col-span-2 space-y-4 pt-4 border-t border-gray-50">
                         <div className="text-[10px] text-brand-primary font-black uppercase tracking-widest">Timing Overview</div>
                         <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="flex flex-col">
                               <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Start Time</span>
                               <span className="text-xl font-black text-gray-900 tabular-nums">{selectedPeriod.startTime}</span>
                            </div>
                            <div className="w-12 h-px bg-gray-200" />
                            <div className="flex flex-col text-right">
                               <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">End Time</span>
                               <span className="text-xl font-black text-gray-900 tabular-nums">{selectedPeriod.endTime}</span>
                            </div>
                         </div>
                      </div>
                   </div>

                   <button 
                    className="w-full py-4.5 bg-brand-primary text-white rounded-2xl font-black text-xs tracking-widest uppercase hover:shadow-xl hover:shadow-brand-primary/30 transition-all active:scale-95 flex items-center justify-center gap-2 group"
                    onClick={() => setSelectedPeriod(null)}
                   >
                     VIEW COURSE MATERIALS <ArrowLeft className="rotate-180 group-hover:translate-x-1 transition-transform" size={18} />
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

