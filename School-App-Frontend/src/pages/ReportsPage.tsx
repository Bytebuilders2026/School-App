/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart2, Users, DollarSign, FileText, Download, 
  Filter, Calendar, ChevronRight, PieChart, TrendingUp,
  ArrowUpRight, ArrowDownRight, Printer, Share2
} from 'lucide-react';
import { useAppContext } from '../AppContext';
import { GlassCard, SectionHeader } from '../components/UI';

export const ReportsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { students, fees, expenses, attendance, addNotification } = useAppContext();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'STUDENTS' | 'FEES' | 'EXPENSES' | 'CLASS'>('OVERVIEW');
  const [selectedClass, setSelectedClass] = useState('1st');

  // Summary Calculations
  const totalStudents = students.length * 10; // Scaling mock data
  const totalFeesCollected = fees.filter(f => f.status === 'PAID').reduce((sum, f) => sum + f.amount, 0) + 124500; // Mock additional
  const totalPendingFees = fees.filter(f => f.status === 'PENDING').reduce((sum, f) => sum + f.amount, 0) + 45000;
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0) + 85000;
  const netBalance = totalFeesCollected - totalExpenses;

  // Filter States
  const [dateRange, setDateRange] = useState('This Month');
  const [filterClass, setFilterClass] = useState('All');
  const [isExporting, setIsExporting] = useState(false);

  const classes = ['All', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];

  const handleExport = (type: 'PDF' | 'CSV') => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert(`${type} Exported successfully! Check your downloads.`);
    }, 1500);
  };

  const stats = [
    { label: 'Total Students', value: totalStudents, icon: <Users size={20} />, color: 'bg-blue-50 text-blue-600', trend: '+4.2%', up: true },
    { label: 'Monthly Revenue', value: `₹${totalFeesCollected.toLocaleString()}`, icon: <DollarSign size={20} />, color: 'bg-green-50 text-green-600', trend: '+12.5%', up: true },
    { label: 'Pending Fees', value: `₹${totalPendingFees.toLocaleString()}`, icon: <FileText size={20} />, color: 'bg-red-50 text-red-600', trend: '-2.1%', up: false },
    { label: 'Net Balance', value: `₹${netBalance.toLocaleString()}`, icon: <TrendingUp size={20} />, color: 'bg-purple-50 text-purple-600', trend: '+8.3%', up: true },
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <GlassCard key={i} className="!p-6 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl ${stat.color} transition-transform group-hover:scale-110`}>
                {stat.icon}
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg ${stat.up ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {stat.up ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                {stat.trend}
              </div>
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{stat.value}</h3>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <GlassCard className="!p-0 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
               <h4 className="font-black text-gray-900 uppercase tracking-widest text-sm">Revenue Insights</h4>
               <BarChart2 className="text-gray-300" size={20} />
            </div>
            <div className="p-8 space-y-6">
               {[
                 { label: 'Tuition Fees', value: 75, color: 'bg-green-500' },
                 { label: 'Transportation', value: 15, color: 'bg-blue-500' },
                 { label: 'Other Activities', value: 10, color: 'bg-purple-500' },
               ].map((item, i) => (
                 <div key={i} className="space-y-2">
                    <div className="flex justify-between items-end">
                       <span className="text-xs font-bold text-gray-600">{item.label}</span>
                       <span className="text-sm font-black text-gray-900">{item.value}%</span>
                    </div>
                    <div className="h-3 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${item.value}%` }}
                         className={`h-full ${item.color}`}
                       />
                    </div>
                 </div>
               ))}
            </div>
         </GlassCard>

         <GlassCard className="!p-0 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
               <h4 className="font-black text-gray-900 uppercase tracking-widest text-sm">Expenditure Distribution</h4>
               <PieChart className="text-gray-300" size={20} />
            </div>
            <div className="p-8 space-y-6">
               {[
                 { label: 'Staff Salaries', value: 65, color: 'bg-orange-500' },
                 { label: 'Maintenance', value: 20, color: 'bg-red-500' },
                 { label: 'Academic Supplies', value: 15, color: 'bg-yellow-500' },
               ].map((item, i) => (
                 <div key={i} className="space-y-2">
                    <div className="flex justify-between items-end">
                       <span className="text-xs font-bold text-gray-600">{item.label}</span>
                       <span className="text-sm font-black text-gray-900">{item.value}%</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${item.value}%` }}
                         className={`h-full ${item.color}`}
                       />
                    </div>
                 </div>
               ))}
            </div>
         </GlassCard>
      </div>
    </div>
  );

  const renderClassView = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2">
        {classes.slice(1).map(c => (
          <button
            key={c}
            onClick={() => setSelectedClass(c)}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all whitespace-nowrap ${selectedClass === c ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'bg-white border border-gray-100 text-gray-400 hover:bg-gray-50'}`}
          >
            Class {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="!p-6 text-center">
            <Users className="mx-auto text-blue-500 mb-2" size={24} />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Students</p>
            <h4 className="text-2xl font-black text-gray-900 mt-1">42</h4>
        </GlassCard>
        <GlassCard className="!p-6 text-center">
            <BarChart2 className="mx-auto text-green-500 mb-2" size={24} />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Attendance Avg</p>
            <h4 className="text-2xl font-black text-gray-900 mt-1">94.2%</h4>
        </GlassCard>
        <GlassCard className="!p-6 text-center">
            <DollarSign className="mx-auto text-orange-500 mb-2" size={24} />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fees Collected</p>
            <h4 className="text-2xl font-black text-gray-900 mt-1">₹84,200</h4>
        </GlassCard>
      </div>

      <GlassCard className="!p-0 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Attendance</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Fee Status</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
             {students.slice(0, 5).map((student, i) => (
               <tr key={i} className="border-b border-gray-50 hover:bg-brand-light/5 transition-colors">
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400">
                           {student.id.slice(0, 2)}
                        </div>
                        <span className="text-xs font-bold text-gray-900">{student.name}</span>
                     </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                     <span className="text-xs font-bold text-gray-600">{(90 + Math.random() * 10).toFixed(1)}%</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className={`w-2 h-2 rounded-full ${i % 3 === 0 ? 'bg-red-500' : 'bg-green-500'}`} />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                     <button className="p-2 hover:text-brand-primary text-gray-400"><ChevronRight size={16} /></button>
                  </td>
               </tr>
             ))}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );

  const renderFeesReport = () => (
    <div className="space-y-6">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassCard className="!p-8">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em]">Monthly Collection</h3>
                <TrendingUp className="text-green-500" size={20} />
             </div>
             <div className="flex h-32 items-end justify-between gap-2">
                {[45, 60, 55, 80, 70, 95].map((val, i) => (
                   <div key={i} className="flex-1 space-y-2">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${val}%` }}
                        className="w-full bg-brand-primary/20 rounded-lg relative group cursor-pointer hover:bg-brand-primary transition-colors"
                      >
                         <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[8px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            ₹{(val * 1000).toLocaleString()}
                         </div>
                      </motion.div>
                      <p className="text-[8px] font-black text-gray-400 text-center uppercase tracking-widest">{['J', 'F', 'M', 'A', 'M', 'J'][i]}</p>
                   </div>
                ))}
             </div>
          </GlassCard>

          <GlassCard className="!p-8">
             <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] mb-8">Fee Status Distribution</h3>
             <div className="space-y-6">
                {[
                  { label: 'Paid Full', value: 68, color: 'bg-green-500' },
                  { label: 'Installments', value: 22, color: 'bg-orange-500' },
                  { label: 'Overdue', value: 10, color: 'bg-red-500' }
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                       <span className="text-gray-500">{item.label}</span>
                       <span className="text-gray-900">{item.value}%</span>
                    </div>
                    <div className="h-2.5 bg-gray-50 rounded-full overflow-hidden">
                       <motion.div initial={{ width: 0 }} animate={{ width: `${item.value}%` }} className={`h-full ${item.color}`} />
                    </div>
                  </div>
                ))}
             </div>
          </GlassCard>
       </div>

       <GlassCard className="!p-0 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
             <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">Recent Transactions</h4>
             <button className="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline">View All</button>
          </div>
          <div className="divide-y divide-gray-50">
             {fees.slice(0, 6).map((item, i) => (
               <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                     <div className={`p-2 rounded-xl ${item.status === 'PAID' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {item.status === 'PAID' ? <TrendingUp size={14} /> : <TrendingUp className="rotate-180" size={14} />}
                     </div>
                     <div>
                        <p className="text-xs font-bold text-gray-900">Student ID: #{item.studentId.slice(0, 5)}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.month} • {item.type}</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-xs font-black text-gray-900">₹{item.amount.toLocaleString()}</p>
                     <p className={`text-[8px] font-black uppercase tracking-widest mt-1 ${item.status === 'PAID' ? 'text-green-500' : 'text-red-500'}`}>{item.status}</p>
                  </div>
               </div>
             ))}
          </div>
       </GlassCard>
    </div>
  );

  const renderStudentsReport = () => (
    <div className="space-y-6">
       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Active', count: 324, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'New This Month', count: 12, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Withdrawn', count: 5, color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Total Base', count: 450, color: 'text-purple-600', bg: 'bg-purple-50' }
          ].map((stat, i) => (
            <GlassCard key={i} className="!p-6 text-center">
               <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mx-auto mb-3`}>
                  <Users size={20} />
               </div>
               <h4 className="text-xl font-black text-gray-900">{stat.count}</h4>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{stat.label}</p>
            </GlassCard>
          ))}
       </div>

       <GlassCard className="!p-0 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
             <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">Attendance Performance Index</h4>
             <TrendingUp className="text-brand-primary" size={20} />
          </div>
          <div className="p-8">
             <div className="h-6 w-full flex rounded-lg overflow-hidden border border-gray-100">
                {[
                  { label: 'Excellent', val: 70, color: 'bg-green-500' },
                  { label: 'Standard', val: 20, color: 'bg-yellow-500' },
                  { label: 'Critical', val: 10, color: 'bg-red-500' }
                ].map((item, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ width: 0 }} 
                    animate={{ width: `${item.val}%` }} 
                    className={`${item.color} relative group`}
                  >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[8px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
                      {item.label}: {item.val}%
                    </div>
                  </motion.div>
                ))}
             </div>
             <div className="flex justify-between mt-4">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500" /><span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Excellent ({'>'}90%)</span></div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-500" /><span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Standard (75-90%)</span></div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500" /><span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Critical ({'<'}75%)</span></div>
             </div>
          </div>
       </GlassCard>
    </div>
  );

  const renderExpensesReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="!p-6">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Expense Breakdown</h4>
            <div className="p-2 bg-brand-light/20 rounded-xl text-brand-primary">
              <ArrowDownRight size={18} />
            </div>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Academic Salaries', amount: 45200, color: 'bg-indigo-500' },
              { label: 'Infrastructure', amount: 12800, color: 'bg-amber-500' },
              { label: 'Event Logistics', amount: 8400, color: 'bg-rose-500' },
              { label: 'Utilities', amount: 4500, color: 'bg-emerald-500' },
            ].map((exp, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${exp.color}`} />
                <div className="flex-1">
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-gray-500">{exp.label}</span>
                    <span className="text-gray-900">₹{exp.amount.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-gray-50 rounded-full">
                    <motion.div initial={{ width: 0 }} animate={{ width: '60%' }} className={`h-full ${exp.color} rounded-full`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
        
        <GlassCard className="!p-6 bg-brand-primary text-white">
           <div className="flex justify-between items-start mb-10">
              <div>
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Total Outflow</p>
                 <h2 className="text-4xl font-black mt-1">₹{totalExpenses.toLocaleString()}</h2>
              </div>
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                 <DollarSign size={24} />
              </div>
           </div>
           <div className="space-y-4">
              <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                 <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Pending Approvals</p>
                 <p className="text-lg font-black">₹12,400</p>
              </div>
              <button 
                onClick={() => {
                  alert('Broadcasting Report to Management...');
                  addNotification({
                    type: 'NOTICE',
                    title: 'Monthly Report Ready',
                    message: `The institutional report for ${dateRange} has been generated and is now available for review.`,
                    role: ['ADMIN'],
                    targetPage: 'reports'
                  });
                }}
                className="w-full py-4 bg-white text-brand-primary rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase hover:bg-brand-light transition-all shadow-xl shadow-brand-primary/20"
              >
                BROADCAST TO ADMINS
              </button>
           </div>
        </GlassCard>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <SectionHeader 
          title="Institutional Reports"
          subtitle="Data-driven insights for school performance"
          onBack={onBack}
          icon={<FileText size={28} />}
        />
        <div className="md:mt-[-40px] flex gap-2">
          <button 
            disabled={isExporting}
            onClick={() => handleExport('PDF')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 glass-card text-xs font-bold text-gray-600 hover:bg-white transition-all active:scale-95 border-gray-100 disabled:opacity-50"
          >
            {isExporting ? <TrendingUp className="animate-spin" size={16} /> : <Download size={16} />} 
            <span className="hidden sm:inline">EXPORT PDF</span>
          </button>
          <button 
            disabled={isExporting}
            onClick={() => handleExport('CSV')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-primary text-white rounded-2xl text-xs font-bold shadow-lg shadow-brand-primary/20 hover:bg-brand-secondary transition-all active:scale-95 disabled:opacity-50"
          >
            {isExporting ? <TrendingUp className="animate-spin" size={16} /> : <Share2 size={16} />}
            <span className="hidden sm:inline">EXPORT CSV</span>
          </button>
        </div>
      </div>

      {/* Global Filters */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Time Period</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full bg-white pl-10 pr-6 py-3.5 rounded-2xl border border-gray-100 focus:border-brand-primary outline-none text-xs font-bold shadow-sm"
              >
                <option>This Month</option>
                <option>Last Month</option>
                <option>Last 3 Months</option>
                <option>Session 2024-25</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Class Filter</label>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <select 
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="w-full bg-white pl-10 pr-6 py-3.5 rounded-2xl border border-gray-100 focus:border-brand-primary outline-none text-xs font-bold shadow-sm"
              >
                {classes.map(c => <option key={c} value={c}>{c === 'All' ? 'All Classes' : `Class ${c}`}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-white border border-gray-100 rounded-2xl mb-8 overflow-x-auto no-scrollbar shadow-sm max-w-fit">
        {(['OVERVIEW', 'STUDENTS', 'FEES', 'EXPENSES', 'CLASS'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-3 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase transition-all whitespace-nowrap ${activeTab === tab ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
           key={activeTab}
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           exit={{ opacity: 0, x: -20 }}
           transition={{ duration: 0.3 }}
        >
          {activeTab === 'OVERVIEW' && renderOverview()}
          {activeTab === 'CLASS' && renderClassView()}
          {activeTab === 'EXPENSES' && renderExpensesReport()}
          {activeTab === 'STUDENTS' && renderStudentsReport()}
          {activeTab === 'FEES' && renderFeesReport()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
