/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Settings, Shield, BellRing, Database, UserPlus, FileCheck, LifeBuoy } from 'lucide-react';
import { GlassCard, SectionHeader } from '../components/UI';

export const AdminToolsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const tools = [
    { title: 'User Access Control', desc: 'Manage staff permissions and roles', icon: <Shield className="text-blue-500" /> },
    { title: 'System Announcements', desc: 'Broadcast school-wide emergency alerts', icon: <BellRing className="text-orange-500" /> },
    { title: 'Database Backup', desc: 'Securely export and backup academic data', icon: <Database className="text-purple-500" /> },
    { title: 'New Admissions', desc: 'Bulk import new student records', icon: <UserPlus className="text-green-500" /> },
    { title: 'Session Manager', desc: 'Update academic year and semester cycles', icon: <Settings className="text-gray-500" /> },
    { title: 'Report Generation', desc: 'Configure automated monthly report formats', icon: <FileCheck className="text-brand-primary" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
      <SectionHeader 
        title="Admin Tools"
        subtitle="Configure core school system parameters"
        onBack={onBack}
        icon={<Settings size={28} />}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool, i) => (
          <GlassCard key={i} hoverScale={true} className="!p-8 group cursor-pointer border-transparent hover:border-brand-primary/20 transition-all">
            <div className="w-14 h-14 bg-white/50 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
               {React.cloneElement(tool.icon as React.ReactElement, { size: 28 })}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{tool.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{tool.desc}</p>
            
            <div className="mt-8 flex justify-end">
               <button className="text-xs font-bold text-brand-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                 Launch Tool →
               </button>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="mt-12 bg-brand-primary/5 p-8 rounded-[32px] border border-brand-primary/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6 text-center md:text-left">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md">
            <LifeBuoy size={32} className="text-brand-primary" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-gray-900">Need Technical Support?</h4>
            <p className="text-sm text-gray-500">Our engineering team is available 24/7 for system configuration assistance.</p>
          </div>
        </div>
        <button className="px-8 py-3 bg-brand-primary text-white font-bold rounded-full shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all">
          Contact Support
        </button>
      </div>
    </div>
  );
};
