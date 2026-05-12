/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, DollarSign, Wallet, CreditCard, Users, 
  MapPin, Coffee, Briefcase, Search, Filter, 
  CheckCircle, AlertCircle, Calendar, Plus, 
  Download, MoreVertical, Edit, Trash2, GraduationCap,
  ArrowUpRight, ArrowDownRight, TrendingUp
} from 'lucide-react';
import { useAppContext } from '../AppContext';
import { GlassCard, GlassInput, SectionHeader } from '../components/UI';

type FinanceView = 'CATEGORIES' | 'STUDENT_FEES_CLASSES' | 'STUDENT_FEES_LIST' | 'SALARIES' | 'EXPENSES';

export const AdminFinancePage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { fees, expenses, students, teachers } = useAppContext();
  const [view, setView] = useState<FinanceView>('CATEGORIES');
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [activeSalaryCategory, setActiveSalaryCategory] = useState<string>('');
  const [activeExpenseCategory, setActiveExpenseCategory] = useState<string>('');
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [newExpense, setNewExpense] = useState({ name: '', amount: 0, category: '' });
  
  // Filtering states
  const { addExpense, deleteExpense } = useAppContext();

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    addExpense({
      ...newExpense,
      date: new Date().toISOString().split('T')[0],
      status: 'PENDING'
    } as any);
    setIsAddingExpense(false);
    setNewExpense({ name: '', amount: 0, category: '' });
    alert('Expense recorded successfully.');
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'PENDING'>('ALL');

  // Stats calculation
  const totalRevenue = fees.filter(f => f.status === 'PAID').reduce((acc, curr) => acc + curr.amount, 0) * 100; // Mock multiplier
  const totalExpenses = expenses.filter(e => e.status === 'PAID').reduce((acc, curr) => acc + curr.amount, 0) * 50;
  const netBalance = totalRevenue - totalExpenses;

  const handleBack = () => {
    if (view === 'CATEGORIES') onBack();
    else if (view === 'STUDENT_FEES_CLASSES') setView('CATEGORIES');
    else if (view === 'STUDENT_FEES_LIST') setView('STUDENT_FEES_CLASSES');
    else setView('CATEGORIES');
    
    // Reset filters
    setSearchTerm('');
    setStatusFilter('ALL');
  };

  const categories = [
    { id: 'STUDENT_FEES_CLASSES', title: 'Student Fees', icon: <GraduationCap />, color: 'bg-green-50 text-green-600', amount: totalRevenue },
    { id: 'TEACHER_SALARY', title: 'Teacher Salaries', icon: <Briefcase />, color: 'bg-blue-50 text-blue-600', amount: 450000 },
    { id: 'BUS_DRIVER_SALARY', title: 'Bus Driver Salaries', icon: <MapPin />, color: 'bg-yellow-50 text-yellow-600', amount: 85000 },
    { id: 'STAFF_SALARY', title: 'Staff Salaries', icon: <Users />, color: 'bg-purple-50 text-purple-600', amount: 120000 },
    { id: 'TRIP', title: 'Trip Expenses', icon: <Coffee />, color: 'bg-orange-50 text-orange-600', amount: 45000 },
    { id: 'OTHER', title: 'Other Expenses', icon: <DollarSign />, color: 'bg-gray-50 text-gray-600', amount: 25000 },
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard hoverScale={false} className="!p-6 border-l-4 border-l-green-500">
           <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-50 rounded-lg text-green-600"><ArrowUpRight size={20} /></div>
              <span className="text-[10px] font-bold text-green-500 bg-green-50 px-2 py-1 rounded-full">+12%</span>
           </div>
           <h3 className="text-gray-500 text-sm font-medium">Total Revenue</h3>
           <p className="text-3xl font-bold text-gray-900 mt-1">₹{totalRevenue.toLocaleString()}</p>
        </GlassCard>
        <GlassCard hoverScale={false} className="!p-6 border-l-4 border-l-red-500">
           <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-red-50 rounded-lg text-red-600"><ArrowDownRight size={20} /></div>
              <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full">-4%</span>
           </div>
           <h3 className="text-gray-500 text-sm font-medium">Total Expenses</h3>
           <p className="text-3xl font-bold text-gray-900 mt-1">₹{totalExpenses.toLocaleString()}</p>
        </GlassCard>
        <GlassCard hoverScale={false} className="!p-6 border-l-4 border-l-brand-primary">
           <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-brand-light rounded-lg text-brand-primary"><TrendingUp size={20} /></div>
              <span className="text-[10px] font-bold text-brand-primary bg-brand-light px-2 py-1 rounded-full">Healthy</span>
           </div>
           <h3 className="text-gray-500 text-sm font-medium">Net Balance</h3>
           <p className="text-3xl font-bold text-gray-900 mt-1">₹{netBalance.toLocaleString()}</p>
        </GlassCard>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(cat => (
          <GlassCard 
            key={cat.id} 
            onClick={() => {
              if (cat.id === 'STUDENT_FEES_CLASSES') setView('STUDENT_FEES_CLASSES');
              else if (cat.id.includes('SALARY')) {
                 setView('SALARIES');
                 setActiveSalaryCategory(cat.id);
              } else {
                 setView('EXPENSES');
                 setActiveExpenseCategory(cat.id);
              }
            }}
            className="!p-6 group cursor-pointer border-transparent hover:border-brand-primary/10 transition-all flex flex-col h-full"
          >
            <div className={`w-14 h-14 rounded-2xl ${cat.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              {React.cloneElement(cat.icon as React.ReactElement, { size: 28 })}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{cat.title}</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Monthly Summary</p>
            <div className="mt-auto flex items-center justify-between">
               <span className="text-xl font-bold text-gray-800">₹{cat.amount.toLocaleString()}</span>
               <div className="p-2 bg-gray-50 rounded-full text-gray-400 group-hover:text-brand-primary group-hover:bg-brand-light transition-all">
                 <ArrowLeft size={16} className="rotate-180" />
               </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );

  const renderClasses = () => {
    const uniqueClasses = Array.from(new Set(students.map(s => s.class))).sort();
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {uniqueClasses.map(cls => (
          <GlassCard 
            key={cls} 
            onClick={() => {
              setSelectedClass(cls);
              setView('STUDENT_FEES_LIST');
            }}
            className="aspect-square flex flex-col items-center justify-center text-center gap-4 group"
          >
            <div className="w-16 h-16 rounded-2xl bg-brand-light flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all">
              <GraduationCap size={32} />
            </div>
            <div>
               <h3 className="text-xl font-bold text-gray-900">{cls}</h3>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">View Fee Status</p>
            </div>
          </GlassCard>
        ))}
      </div>
    );
  };

  const renderStudentFeesList = () => {
    const classStudents = students.filter(s => s.class === selectedClass);
    const filtered = classStudents.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.rollNo.includes(searchTerm);
      const fee = fees.find(f => f.studentId === s.id);
      const matchStatus = statusFilter === 'ALL' || (fee && fee.status === statusFilter);
      return matchSearch && matchStatus;
    });

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
           <div className="flex-1">
             <GlassInput 
               placeholder="Search by student name or roll no..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               icon={<Search size={18} />}
             />
           </div>
           <div className="flex bg-gray-100 p-1 rounded-xl">
             {(['ALL', 'PAID', 'PENDING'] as const).map(f => (
               <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-6 py-2 text-[10px] font-bold rounded-lg transition-all ${statusFilter === f ? 'bg-white text-brand-primary shadow-sm' : 'text-gray-400'}`}
               >
                 {f}
               </button>
             ))}
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(student => {
            const fee = fees.find(f => f.studentId === student.id) || { amount: 2500, status: 'PENDING' };
            const isPaid = fee.status === 'PAID';
            return (
              <GlassCard key={student.id} hoverScale={true} className="!p-5 border-transparent hover:border-brand-primary/10">
                 <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500">
                        <Users size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 leading-none">{student.name}</h4>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID: {student.rollNo}</span>
                      </div>
                   </div>
                   <div className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 ${isPaid ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      {isPaid ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                      {fee.status}
                   </div>
                 </div>
                 <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Amount Due</div>
                      <div className="text-xl font-bold text-gray-900 leading-none mt-1">₹{fee.amount.toLocaleString()}</div>
                    </div>
                    {!isPaid && (
                      <button className="px-4 py-2 bg-brand-primary text-white text-[10px] font-bold rounded-lg shadow-sm hover:scale-105 active:scale-95 transition-all">
                        RECORD PAYMENT
                      </button>
                    )}
                 </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSalaries = () => {
    const list = expenses.filter(e => e.category === activeSalaryCategory);
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-brand-primary/5 p-6 rounded-[24px]">
           <div>
             <h4 className="font-bold text-gray-900">Monthly Payroll Summary</h4>
             <p className="text-xs text-gray-500">Academic Session 2024 - Pay Cycle 03</p>
           </div>
           <button 
             onClick={() => {
               setNewExpense(prev => ({ ...prev, category: activeSalaryCategory }));
               setIsAddingExpense(true);
             }}
             className="px-6 py-2.5 bg-brand-primary text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-brand-primary/20"
           >
             <Plus size={16} /> ADD RECIPIENT
           </button>
        </div>

        <div className="space-y-4">
           {list.map(item => (
             <GlassCard key={item.id} hoverScale={false} className="!p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-500">
                     <Briefcase size={24} />
                   </div>
                   <div>
                     <h4 className="font-bold text-gray-900">{item.name}</h4>
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{activeSalaryCategory.replace('_', ' ')}</p>
                   </div>
                </div>
                <div className="flex items-center gap-8">
                   <div className="text-right">
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Status</div>
                      <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${item.status === 'PAID' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                        {item.status}
                      </div>
                   </div>
                   <div className="text-right">
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Salary</div>
                      <div className="text-lg font-bold text-gray-900">₹{item.amount.toLocaleString()}</div>
                   </div>
                   <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-400 hover:text-brand-primary transition-colors"><Edit size={18} /></button>
                      <button className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                   </div>
                </div>
             </GlassCard>
           ))}
        </div>
      </div>
    );
  };

  const renderExpenses = () => {
    const list = expenses.filter(e => e.category === activeExpenseCategory);
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
             <div className="px-6 py-2 bg-gray-100 rounded-xl text-xs font-bold text-gray-600 flex items-center gap-2">
                <Calendar size={14} /> MARCH 2024
             </div>
             <div className="px-6 py-2 bg-brand-light rounded-xl text-xs font-bold text-brand-primary flex items-center gap-2">
                <Filter size={14} /> CATEGORY: {activeExpenseCategory}
             </div>
          </div>
          <button 
            onClick={() => setIsAddingExpense(true)}
            className="px-6 py-2 bg-brand-primary text-white rounded-xl font-bold text-xs flex items-center gap-2"
          >
            <Plus size={16} /> NEW EXPENSE
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {list.map(item => (
            <GlassCard key={item.id} hoverScale={true} className="!p-6">
               <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-50 rounded-2xl text-gray-400">
                       <DollarSign size={24} />
                    </div>
                    <div>
                       <h4 className="font-bold text-gray-900 text-lg">{item.name}</h4>
                       <p className="text-xs text-gray-400">{item.date}</p>
                    </div>
                  </div>
                  <button className="p-2 text-gray-300 hover:text-gray-900"><MoreVertical size={20} /></button>
               </div>
               <div className="flex items-end justify-between">
                  <div>
                    <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Disbursement</div>
                    <div className="text-2xl font-bold text-gray-900">₹{item.amount.toLocaleString()}</div>
                  </div>
                  <div className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-gray-100 group-hover:border-brand-primary/20 ${item.status === 'PAID' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {item.status}
                  </div>
               </div>
            </GlassCard>
          ))}
        </div>
      </div>
    );
  };

  const getTitle = () => {
    if (view === 'CATEGORIES') return 'Finance Overview';
    if (view === 'STUDENT_FEES_CLASSES') return 'Student Fee Management';
    if (view === 'STUDENT_FEES_LIST') return `${selectedClass} Fees`;
    if (view === 'SALARIES') return `${activeSalaryCategory.replace('_', ' ').replace('SALARY', 'Salaries')} Management`;
    if (view === 'EXPENSES') return `${activeExpenseCategory.replace('_', ' ')} Ledger`;
    return 'Finance';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <SectionHeader 
          title={getTitle()}
          subtitle="ByteBuilders Financial Governance System"
          onBack={handleBack}
          icon={<DollarSign size={28} />}
        />
        <div className="md:mt-[-40px]">
          <button className="w-full md:w-auto px-6 py-3 glass-card text-gray-600 hover:text-brand-primary font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95">
             <Download size={18} /> EXPORT LEDGER
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
           key={`${view}-${selectedClass}-${activeSalaryCategory}`}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, scale: 0.98 }}
           transition={{ duration: 0.2 }}
        >
          {view === 'CATEGORIES' && renderOverview()}
          {view === 'STUDENT_FEES_CLASSES' && renderClasses()}
          {view === 'STUDENT_FEES_LIST' && renderStudentFeesList()}
          {view === 'SALARIES' && renderSalaries()}
          {view === 'EXPENSES' && renderExpenses()}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {isAddingExpense && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-md">
               <GlassCard className="!p-0 overflow-hidden bg-white shadow-2xl">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                     <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Record New Expense</h3>
                     <button onClick={() => setIsAddingExpense(false)} className="text-gray-400 hover:text-red-500 transition-colors"><Plus className="rotate-45" size={24} /></button>
                  </div>
                  <form onSubmit={handleAddExpense} className="p-8 space-y-5">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Expense Title</label>
                        <GlassInput placeholder="Science Lab Equipment" required value={newExpense.name} onChange={e => setNewExpense({...newExpense, name: e.target.value})} />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Amount (₹)</label>
                        <GlassInput type="number" placeholder="0.00" required value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: Number(e.target.value)})} />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                        <select 
                          className="w-full bg-gray-50 px-6 py-3.5 rounded-2xl border border-gray-100 outline-none text-xs font-bold"
                          required
                          value={newExpense.category}
                          onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                        >
                          <option value="">Select Category</option>
                          <option value="TRIP">School Trip</option>
                          <option value="OTHER">Utility / Maintenance</option>
                          <option value="TEACHER_SALARY">Teacher Salary</option>
                          <option value="STAFF_SALARY">Staff Salary</option>
                        </select>
                     </div>
                     <button type="submit" className="w-full py-4 bg-brand-primary text-white rounded-2xl font-black text-[10px] tracking-widest uppercase hover:shadow-lg shadow-brand-primary/20 transition-all active:scale-95">
                        DISBURSE FUNDS
                     </button>
                  </form>
               </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
