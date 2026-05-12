/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, TrendingUp, Users, DollarSign, BookOpen, Download, Filter, Calendar } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { GlassCard, SectionHeader } from '../components/UI';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';

export const AnalyticsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { students, teachers, expenses, fees } = useAppContext();

  // Mock data for charts
  const attendanceData = [
    { name: 'Mon', percentage: 94 },
    { name: 'Tue', percentage: 96 },
    { name: 'Wed', percentage: 92 },
    { name: 'Thu', percentage: 95 },
    { name: 'Fri', percentage: 90 },
    { name: 'Sat', percentage: 85 },
  ];

  const financialData = [
    { month: 'Jan', fees: 45000, expenses: 32000 },
    { month: 'Feb', fees: 52000, expenses: 35000 },
    { month: 'Mar', fees: 48000, expenses: 38000 },
    { month: 'Apr', fees: 61000, expenses: 40000 },
    { month: 'May', fees: 58000, expenses: 42000 },
  ];

  const studentCategoryData = [
    { name: 'Primary', value: 450 },
    { name: 'Middle', value: 300 },
    { name: 'High', value: 250 },
  ];

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];

  const stats = [
    { label: 'Total Students', value: students.length * 10, icon: <Users size={20} />, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Teachers', value: teachers.length, icon: <BookOpen size={20} />, color: 'bg-green-50 text-green-600' },
    { label: 'Monthly Revenue', value: '₹58,000', icon: <DollarSign size={20} />, color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Growth rate', value: '+12.5%', icon: <TrendingUp size={20} />, color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <SectionHeader 
          title="School Analytics"
          subtitle="Comprehensive overview of ByteBuilders performance"
          onBack={onBack}
          icon={<TrendingUp size={28} />}
        />
        <div className="md:mt-[-40px] flex gap-2">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 glass-card text-xs font-bold text-gray-600 hover:bg-white transition-all active:scale-95">
            <Calendar size={16} /> <span className="hidden sm:inline">LAST 30 DAYS</span><span className="sm:hidden">30D</span>
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-primary text-white rounded-2xl text-xs font-bold shadow-lg shadow-brand-primary/20 hover:bg-brand-secondary transition-all active:scale-95">
            <Download size={16} /> EXPORT
          </button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <GlassCard key={i} hoverScale={true} className="!p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl ${stat.color}`}>
                {stat.icon}
              </div>
              <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-lg">↑ 4%</span>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">{stat.label}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Weekly Attendance */}
        <GlassCard hoverScale={false} className="!p-6 h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900">Weekly Student Attendance</h3>
            <div className="flex items-center gap-2 text-xs font-bold text-brand-primary uppercase tracking-widest cursor-pointer">
              Details <TrendingUp size={14} />
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceData}>
                <defs>
                  <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} dy={10} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  formatter={(value) => [`${value}%`, 'Attendance']}
                />
                <Area type="monotone" dataKey="percentage" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorAttendance)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Financial Overview */}
        <GlassCard hoverScale={false} className="!p-6 h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900">Financial Overview</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-brand-primary" />
                <span className="text-xs font-medium text-gray-500">Fees</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-xs font-medium text-gray-500">Expenses</span>
              </div>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} dy={10} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  formatter={(value) => [`₹${(value as number).toLocaleString()}`, '']}
                />
                <Bar dataKey="fees" fill="#10B981" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="expenses" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Student Distribution */}
        <GlassCard hoverScale={false} className="!p-6 flex flex-col">
          <h3 className="font-bold text-gray-900 mb-6">Student Distribution</h3>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={studentCategoryData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {studentCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {studentCategoryData.map((cat, i) => (
              <div key={i} className="text-center">
                <div className="text-xs font-bold" style={{ color: COLORS[i % COLORS.length] }}>{cat.value}</div>
                <div className="text-[10px] text-gray-400 uppercase font-bold">{cat.name}</div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Recent Performance reports */}
        <GlassCard hoverScale={false} className="lg:col-span-2 !p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900">Target Performance Reports</h3>
            <button className="text-xs font-bold text-brand-primary hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {[
              { subject: 'Science Dept', score: 88, status: 'On Track', color: 'bg-green-100 text-green-600' },
              { subject: 'Arts & Music', score: 94, status: 'Exceptional', color: 'bg-blue-100 text-blue-600' },
              { subject: 'Maintenance', score: 72, status: 'Attention', color: 'bg-yellow-100 text-yellow-600' },
              { subject: 'Bus Transport', score: 91, status: 'Optimal', color: 'bg-purple-100 text-purple-600' },
            ].map((report, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-10 rounded-full ${report.color.split(' ')[0]}`} />
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">{report.subject}</h4>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${report.color.split(' ')[1]}`}>{report.status}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">{report.score}%</div>
                  <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-brand-primary" style={{ width: `${report.score}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
