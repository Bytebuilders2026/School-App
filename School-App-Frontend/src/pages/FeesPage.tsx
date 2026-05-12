/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, CreditCard, Calendar, CheckCircle2, AlertCircle, Download, FileText, Printer, X, ShieldCheck, ArrowUpRight, Landmark, ReceiptText } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { GlassCard, GradientButton, SectionHeader, PermissionGuard } from '../components/UI';

export const FeesPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { user, fees, addNotification } = useAppContext();
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const userFees = user?.role === 'ADMIN' ? fees : fees.filter(f => f.studentId === user?.id || f.student === user?.id);
  const totalPending = userFees.filter(f => f.status === 'PENDING').reduce((acc, curr) => acc + curr.amount, 0);
  const totalPaid = userFees.filter(f => f.status === 'PAID').reduce((acc, curr) => acc + curr.amount, 0);

  const handlePay = async (fee?: any) => {
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsProcessing(false);

    // Notify Admin
    addNotification({
      type: 'FEE',
      title: 'Fee Payment Received',
      message: `${user?.name || 'Student'} has paid ₹${(fee ? fee.amount : totalPending).toLocaleString()}.`,
      role: ['ADMIN'],
      targetPage: 'finance'
    });
    
    // Generate receipt data
    const receipt = {
      id: `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      studentName: user?.name || 'Alice Johnson',
      studentId: user?.id || 'STU-101',
      className: user?.class || '10th A',
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      amount: fee ? fee.amount : totalPending,
      type: fee ? (fee.type === 'SCHOOL' ? 'Monthly Tuition Fee' : 'Special Event Fee') : 'Consolidated Fees',
      method: 'Visa •••• 4421',
      status: 'SUCCESSFUL'
    };
    setSelectedReceipt(receipt);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
      <SectionHeader 
        title="Fees & Ledger"
        subtitle="School academic & extracurricular financial records"
        onBack={onBack}
        icon={<CreditCard size={28} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Summary & Actions */}
        <div className="lg:col-span-1 space-y-6">
          <GlassCard hoverScale={false} className="bg-gradient-to-br from-brand-primary to-brand-secondary text-white !p-0 overflow-hidden relative border-none shadow-xl shadow-brand-primary/20">
             {/* Decorative Elements */}
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 blur-3xl rounded-full" />
             <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-brand-light/10 blur-3xl rounded-full" />
             <Landmark size={120} className="absolute -bottom-4 -right-4 text-white/5 -rotate-12 pointer-events-none" />
            
             <div className="p-8 relative z-10">
               <div className="flex items-center justify-between mb-8">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white/70 text-[10px] font-bold uppercase tracking-[0.2em]">Total Outstanding</h3>
                      <ArrowUpRight size={10} className="text-white/50" />
                    </div>
                    <div className="text-5xl font-black tabular-nums">₹{totalPending.toLocaleString()}</div>
                  </div>
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20">
                    <ShieldCheck size={28} className="text-white" />
                  </div>
               </div>
               
               <div className="space-y-4">
                 <div className="flex items-center justify-between p-4 bg-black/10 backdrop-blur-md rounded-2xl border border-white/5">
                   <div className="flex items-center gap-3">
                     <div className="p-2 bg-white/10 rounded-lg"><Calendar size={18} /></div>
                     <span className="text-xs font-bold text-white/80 uppercase tracking-tighter">Next Due Date</span>
                   </div>
                   <span className="text-sm font-bold">May 15, 2024</span>
                 </div>
                 <div className="flex items-center justify-between p-4 bg-black/10 backdrop-blur-md rounded-2xl border border-white/5">
                   <div className="flex items-center gap-3">
                     <div className="p-2 bg-white/10 rounded-lg"><CreditCard size={18} /></div>
                     <span className="text-xs font-bold text-white/80 uppercase tracking-tighter">Default Mode</span>
                   </div>
                   <span className="text-sm font-bold">Visa •••• 4421</span>
                 </div>
               </div>

               <div className="mt-10">
                 <button 
                   onClick={() => handlePay()}
                   disabled={isProcessing || totalPending === 0}
                   className="w-full py-4 bg-white text-brand-primary rounded-2xl font-black text-sm tracking-widest uppercase hover:bg-brand-light transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-3 group"
                 >
                   {isProcessing ? (
                     <>
                       <div className="w-5 h-5 border-3 border-brand-primary border-t-transparent rounded-full animate-spin" />
                       PROCESSING...
                     </>
                   ) : (
                     <>
                       PAY OUTSTANDING <ArrowLeft className="rotate-180 group-hover:translate-x-1 transition-transform" size={18} />
                     </>
                   )}
                 </button>
               </div>
             </div>
             
             {/* Bottom Security Badge */}
             <div className="bg-white/10 p-4 text-center border-t border-white/5">
               <p className="text-[10px] font-bold text-white/60 tracking-widest uppercase flex items-center justify-center gap-2">
                 <ShieldCheck size={12} /> SECURE TRANSACTION ENCRYPTED
               </p>
             </div>
          </GlassCard>

          <GlassCard hoverScale={false} className="!p-6">
             <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Quick Insights</h4>
             <div className="space-y-4">
                <div className="flex justify-between items-end">
                   <span className="text-sm font-medium text-gray-600">Total Fees Paid</span>
                   <span className="text-lg font-bold text-gray-900">₹{totalPaid.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                   <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(totalPaid / (totalPaid + totalPending || 1)) * 100}%` }}
                    className="h-full bg-brand-primary rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                   />
                </div>
                <p className="text-[10px] text-gray-400 font-medium italic">Your fee payments are on track for the current academic session.</p>
             </div>
          </GlassCard>
        </div>

        {/* Right Column: Transaction Ledger */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Payment Ledger</h2>
            <div className="flex gap-2">
               <span className="px-3 py-1 bg-brand-light border border-brand-primary/10 rounded-full text-[10px] font-bold text-brand-primary uppercase tracking-wider">Session 2024-25</span>
            </div>
          </div>

          <div className="space-y-4">
            {userFees.map((fee, idx) => (
              <motion.div
                key={fee.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
              >
                <GlassCard hoverScale={false} className="!p-6 flex items-center justify-between group hover:border-brand-primary/10 transition-all border-transparent">
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${fee.status === 'PAID' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                      {fee.type === 'SCHOOL' ? <CreditCard size={24} /> : <Calendar size={24} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 group-hover:text-brand-primary transition-colors">{fee.type === 'SCHOOL' ? 'Monthly Academic Tuition' : 'Field Trip: Science Museum'}</h4>
                      <div className="flex items-center gap-4 mt-1.5">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                           <Calendar size={12} className="text-gray-300" /> Due: {fee.dueDate}
                        </span>
                        <div className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5 ${fee.status === 'PAID' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                          {fee.status}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8">
                    <div className="text-right hidden sm:block">
                      <div className="font-black text-xl text-gray-900 tabular-nums">₹{fee.amount.toLocaleString()}</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Base Amount</div>
                    </div>
                    
                    {fee.status === 'PAID' ? (
                      <button 
                        onClick={() => setSelectedReceipt({ ...fee, id: `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`, date: new Date().toLocaleDateString(), time: new Date().toLocaleTimeString(), method: 'Visa •••• 4421', status: 'SUCCESSFUL', studentName: user?.name, studentId: user?.id, className: user?.class })}
                        className="p-3 text-gray-400 hover:text-brand-primary hover:bg-brand-light rounded-xl transition-all active:scale-90"
                        title="View Digital Receipt"
                      >
                        <Download size={22} />
                      </button>
                    ) : (
                      <PermissionGuard allowedRoles={['STUDENT', 'PARENT']} fallback={
                        <div className="px-4 py-2 bg-red-50 text-red-500 rounded-xl text-[10px] font-black tracking-widest uppercase border border-red-100">
                           PENDING
                        </div>
                      }>
                        <button 
                          onClick={() => handlePay(fee)}
                          disabled={isProcessing}
                          className="px-6 py-3 bg-brand-primary text-white text-[10px] font-black tracking-widest uppercase rounded-xl shadow-lg shadow-brand-primary/10 hover:bg-brand-secondary transition-all active:scale-95 disabled:opacity-50"
                        >
                          {isProcessing ? '...' : 'PAY NOW'}
                        </button>
                      </PermissionGuard>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center bg-gray-50/50 p-8 rounded-[32px] border border-gray-100 border-dashed">
            <div className="max-w-xs mx-auto">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Administrative Note</p>
              <p className="text-[11px] text-gray-500 font-medium italic leading-relaxed">For any discrepancy in digital ledger records, please visit the accounts office during working hours.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      <AnimatePresence>
        {selectedReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto py-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedReceipt(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              {/* Receipt Header Overlay */}
              <div className="absolute top-0 right-0 p-8 z-20">
                 <button 
                  onClick={() => setSelectedReceipt(null)}
                  className="p-3 bg-white/20 hover:bg-white/40 text-white rounded-2xl transition-all active:scale-90 backdrop-blur-xl"
                 >
                   <X size={20} />
                 </button>
              </div>

              {/* Header Visual */}
              <div className="bg-brand-primary p-10 text-white relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full translate-x-20 -translate-y-20" />
                 
                 <div className="flex items-center gap-4 mb-10 relative z-10">
                   <div className="w-12 h-12 bg-white rounded-2xl font-black italic text-brand-primary flex items-center justify-center text-xl shadow-lg shadow-black/10">B</div>
                   <div>
                     <h3 className="font-black text-2xl leading-none tracking-tight">ByteBuilders School</h3>
                     <p className="text-[10px] text-white/50 font-bold tracking-[0.3em] uppercase mt-1.5 italic">Official Ledger Receipt</p>
                   </div>
                 </div>

                 <div className="flex justify-between items-end relative z-10">
                    <div>
                      <div className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-2">Total Amount Processed</div>
                      <div className="text-5xl font-black tabular-nums">₹{selectedReceipt.amount.toLocaleString()}</div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-xl rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/20">
                      <ShieldCheck size={16} /> {selectedReceipt.status}
                    </div>
                 </div>
              </div>

              {/* Body Content */}
              <div className="p-10 space-y-10">
                <div className="grid grid-cols-2 gap-y-10 gap-x-10">
                   <div className="space-y-1 border-l-2 border-gray-100 pl-4">
                      <div className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">Student Info</div>
                      <div className="text-sm font-bold text-gray-900">{selectedReceipt.studentName}</div>
                      <div className="text-[10px] text-gray-400 font-medium italic">ID: {selectedReceipt.studentId || "STU-101"} • {selectedReceipt.className || "10th A"}</div>
                   </div>
                   <div className="space-y-1 border-l-2 border-gray-100 pl-4">
                      <div className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">Payment Source</div>
                      <div className="text-sm font-bold text-gray-900">{selectedReceipt.method}</div>
                      <div className="text-[10px] text-gray-400 font-medium italic">Visa Network Verified</div>
                   </div>
                   <div className="space-y-1 border-l-2 border-gray-100 pl-4">
                      <div className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">Transaction ID</div>
                      <div className="text-sm font-black text-brand-primary font-mono tracking-tighter">{selectedReceipt.id}</div>
                   </div>
                   <div className="space-y-1 border-l-2 border-gray-100 pl-4">
                      <div className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">Billing Date</div>
                      <div className="text-sm font-bold text-gray-900">{selectedReceipt.date}</div>
                      <div className="text-[10px] text-gray-400 font-medium italic">Time: {selectedReceipt.time}</div>
                   </div>

                   <div className="col-span-2 pt-8 border-t border-gray-100">
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4">Description of Charges</div>
                      <div className="flex justify-between items-center bg-gray-50/50 p-6 rounded-[28px] border border-gray-100 shadow-sm group hover:bg-white hover:shadow-lg hover:shadow-brand-primary/5 transition-all">
                         <div className="flex items-center gap-4">
                            <div className="p-3.5 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform">
                               <FileText size={20} />
                            </div>
                            <div>
                               <span className="text-sm font-black text-gray-800">{selectedReceipt.type}</span>
                               <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mt-0.5">Session 2024 Academic Year</p>
                            </div>
                         </div>
                         <span className="text-xl font-black text-gray-900 tabular-nums">₹{selectedReceipt.amount.toLocaleString()}</span>
                      </div>
                   </div>
                </div>

                <div className="flex flex-col items-center pt-6 space-y-6">
                  <div className="text-[10px] text-gray-400 font-medium italic text-center max-w-[320px] leading-relaxed">This is a digitally generated acknowledgement. No physical signature is required to establish its validity. </div>
                  
                  <div className="flex gap-4 w-full">
                    <button 
                      className="flex-1 py-4.5 bg-gray-100 text-gray-600 rounded-[22px] font-black text-[10px] tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-gray-200 transition-all active:scale-95"
                      onClick={() => window.print()}
                    >
                      <Printer size={18} /> PRINT RECORD
                    </button>
                    <button 
                      className="flex-1 py-4.5 bg-brand-primary text-white rounded-[22px] font-black text-[10px] tracking-widest uppercase flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-brand-primary/30 active:scale-95 transition-all"
                      onClick={() => {
                        const element = document.createElement("a");
                        const file = new Blob(["ByteBuilders Digital Receipt\nID: " + selectedReceipt.id + "\nAmount: " + selectedReceipt.amount], {type: 'text/plain'});
                        element.href = URL.createObjectURL(file);
                        element.download = `Receipt_${selectedReceipt.id}.txt`;
                        document.body.appendChild(element);
                        element.click();
                      }}
                    >
                      <Download size={18} /> DOWNLOAD PDF
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
