/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Key, Download, QrCode, ClipboardList, CheckCircle2, Plus, Filter, Calendar } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { GlassCard, GlassInput, GradientButton, SectionHeader, PermissionGuard } from '../components/UI';

export const GatePassPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { user, gatePasses, addGatePass } = useAppContext();
  const [isAdding, setIsAdding] = useState(false);
  const [activePass, setActivePass] = useState<any>(null);
  
  // Form state
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [reason, setReason] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('14:00');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const passData = {
      parentName: user.name,
      studentName,
      studentClass,
      reason,
      date,
      time
    };
    addGatePass(passData);
    setActivePass({ ...passData, id: 'GP-' + Math.random().toString(36).substr(2, 6).toUpperCase() });
    setIsAdding(false);
    resetForm();
  };

  const resetForm = () => {
    setStudentName('');
    setStudentClass('');
    setReason('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <SectionHeader 
          title="Gate Pass"
          subtitle="Digital Exit Permissions"
          onBack={onBack}
          icon={<Key size={28} />}
        />
        <PermissionGuard allowedRoles={['PARENT']}>
          <div className="md:mt-[-40px]">
            <GradientButton onClick={() => setIsAdding(true)} className="!w-auto !py-3 px-8">
               <Plus size={18} className="mr-2" /> REQUEST PASS
            </GradientButton>
          </div>
        </PermissionGuard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Active Pass / History List */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between mb-4">
             <h2 className="text-lg font-bold flex items-center gap-2"><ClipboardList className="text-brand-primary" /> Past Passes</h2>
             <button className="text-xs font-bold text-gray-400 hover:text-brand-primary flex items-center gap-1">
                <Filter size={14} /> ALL HISTORY
             </button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {gatePasses.length > 0 ? (
              gatePasses.map(pass => (
                <GlassCard key={pass.id} hoverScale={false} className="!p-5 flex flex-col md:flex-row justify-between md:items-center">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-brand-light text-brand-primary rounded-xl flex items-center justify-center">
                        <Key size={24} />
                     </div>
                     <div>
                        <div className="flex items-center gap-2">
                           <span className="font-bold text-gray-900">{pass.studentName}</span>
                           <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-bold">{pass.studentClass}</span>
                        </div>
                        <p className="text-sm text-gray-500">{pass.reason}</p>
                     </div>
                  </div>
                  <div className="flex flex-row md:flex-col justify-between items-center md:items-end mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-50">
                     <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <Calendar size={12} /> {pass.date} | {pass.time}
                     </div>
                     <span className="text-[10px] bg-green-50 text-green-500 px-3 py-1 rounded-full font-bold uppercase mt-1">ISSUED</span>
                  </div>
                </GlassCard>
              ))
            ) : (
              <div className="py-20 text-center glass-card rounded-[20px]">
                 <Key size={48} className="mx-auto text-gray-200 mb-4" />
                 <p className="text-gray-400 font-medium">No passes generated yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Digital Pass Preview */}
        <div className="lg:col-span-4">
          <div className="sticky top-24">
            <h2 className="text-lg font-bold mb-4">Latest Pass</h2>
            {activePass ? (
              <GlassCard hoverScale={false} className="bg-gradient-to-br from-brand-primary to-brand-dark overflow-hidden relative border-none">
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full translate-x-10 -translate-y-10" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-light/10 blur-2xl rounded-full -translate-x-5 translate-y-5" />
                
                <div className="relative z-10 text-white space-y-6">
                   <div className="flex justify-between items-start">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                         <Key size={24} />
                      </div>
                      <div className="text-right">
                         <div className="text-[10px] font-bold text-white/60 tracking-widest uppercase">Pass ID</div>
                         <div className="font-mono text-xs">{activePass.id}</div>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <div>
                         <div className="text-[10px] font-bold text-white/60 tracking-widest uppercase">Student Name</div>
                         <div className="text-xl font-bold">{activePass.studentName}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <div className="text-[10px] font-bold text-white/60 tracking-widest uppercase">Class</div>
                            <div className="font-bold">{activePass.studentClass}</div>
                         </div>
                         <div>
                            <div className="text-[10px] font-bold text-white/60 tracking-widest uppercase">Time</div>
                            <div className="font-bold">{activePass.time}</div>
                         </div>
                      </div>
                      <div>
                         <div className="text-[10px] font-bold text-white/60 tracking-widest uppercase">Parent</div>
                         <div className="font-bold">{activePass.parentName}</div>
                      </div>
                   </div>

                   <div className="pt-6 flex flex-col items-center gap-6">
                      <div className="w-32 h-32 bg-white p-2 rounded-xl">
                         <QrCode size={48} className="text-gray-900 w-full h-full" />
                      </div>
                      <div className="w-full flex gap-2">
                         <button className="flex-1 py-3 bg-white/20 backdrop-blur-md rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-white/30 transition-all">
                            <Download size={14} /> PDF
                         </button>
                         <button className="flex-1 py-3 bg-white text-brand-primary rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg">
                            <CheckCircle2 size={14} /> VALID
                         </button>
                      </div>
                   </div>
                </div>
              </GlassCard>
            ) : (
              <GlassCard className="h-[500px] flex flex-col items-center justify-center text-center p-8 opacity-40">
                 <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Key size={32} className="text-gray-300" />
                 </div>
                 <p className="text-gray-400 font-medium">Generate a pass to see preview here</p>
              </GlassCard>
            )}
          </div>
        </div>
      </div>

      {/* New Pass Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md">
            <GlassCard hoverScale={false} className="!p-8 shadow-2xl">
              <h2 className="text-xl font-bold mb-6">Request Gate Pass</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <GlassInput label="Student Name" required value={studentName} onChange={e => setStudentName(e.target.value)} />
                <GlassInput label="Class" placeholder="e.g. 10th A" required value={studentClass} onChange={e => setStudentClass(e.target.value)} />
                <div className="grid grid-cols-2 gap-4">
                   <GlassInput label="Date" type="date" required value={date} onChange={e => setDate(e.target.value)} />
                   <GlassInput label="Time" type="time" required value={time} onChange={e => setTime(e.target.value)} />
                </div>
                <GlassInput label="Reason" required value={reason} onChange={e => setReason(e.target.value)} />
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-3 px-6 rounded-full border border-gray-200 font-medium text-gray-600 hover:bg-gray-50 transition-all">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 btn-primary">
                    Create Pass
                  </button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </div>
  );
};
