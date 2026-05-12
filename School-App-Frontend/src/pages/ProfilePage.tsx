/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, User, Mail, Phone, MapPin, GraduationCap, Award, ShieldCheck } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { GlassCard, GradientButton, SectionHeader } from '../components/UI';

export const ProfilePage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { user } = useAppContext();

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
      <SectionHeader 
        title="My Profile"
        subtitle="Personal information & Academic history"
        onBack={onBack}
        icon={<User size={28} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Basic Info */}
        <div className="lg:col-span-1 space-y-6">
          <GlassCard hoverScale={false} className="flex flex-col items-center py-10 text-center">
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-brand-primary/20 to-brand-secondary/40 flex items-center justify-center mb-6 relative group overflow-hidden">
               {user.avatar ? (
                 <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
               ) : (
                 <User size={64} className="text-brand-secondary" />
               )}
               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <span className="text-white font-bold text-xs">CHANGE</span>
               </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
            <div className="px-4 py-1.5 bg-brand-light text-brand-secondary rounded-full font-bold text-xs uppercase tracking-widest mt-2">
              {user.role}
            </div>
            
            <div className="w-full mt-10 grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-2xl">
                 <div className="text-xl font-bold text-gray-900">
                   {user.role === 'TEACHER' ? user.employeeId : (user.rollNo || 'N/A')}
                 </div>
                 <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                   {user.role === 'TEACHER' ? 'Employee ID' : 'Roll No'}
                 </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl">
                 <div className="text-xl font-bold text-gray-900">
                   {user.role === 'TEACHER' ? `${user.experience || 0}y` : (user.class || 'N/A')}
                 </div>
                 <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                   {user.role === 'TEACHER' ? 'Experience' : 'Class'}
                 </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="space-y-4">
             <h3 className="font-bold text-xs uppercase tracking-[0.1em] text-brand-secondary">Contact Details</h3>
             <div className="space-y-3">
               <div className="flex items-center gap-3 text-sm">
                  <Mail size={16} className="text-gray-400" />
                  <span className="text-gray-700">{user.email}</span>
               </div>
               <div className="flex items-center gap-3 text-sm">
                  <Phone size={16} className="text-gray-400" />
                  <span className="text-gray-700">{user.phone || '+1 234 567 8900'}</span>
               </div>
               <div className="flex items-center gap-3 text-sm">
                  <MapPin size={16} className="text-gray-400" />
                  <span className="text-gray-700">School Campus, Block-A</span>
               </div>
             </div>
          </GlassCard>
        </div>

        {/* Right Column: Detailed Stats/History */}
        <div className="lg:col-span-2 space-y-6">
           <GlassCard hoverScale={false} className="!p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                 <GraduationCap className="text-brand-primary" /> 
                 {user.role === 'TEACHER' ? 'Professional Profile' : 'Educational Info'}
              </h3>
              
              {user.role === 'TEACHER' ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Highest Qualification</p>
                      <p className="text-lg font-bold text-gray-800">{user.qualification || 'Not Specified'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Employee Status</p>
                      <p className="text-lg font-bold text-green-600">Active • Full Time</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Specialized Subjects</p>
                    <div className="flex flex-wrap gap-2">
                      {user.subjects?.map((subject, index) => (
                        <span key={index} className="px-4 py-2 bg-brand-light text-brand-primary rounded-xl text-xs font-bold border border-brand-primary/10">
                          {subject}
                        </span>
                      )) || <span className="text-gray-400 text-xs italic">No subjects assigned</span>}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Assigned Classes</p>
                    <div className="flex flex-wrap gap-2">
                      {user.assignedClasses?.map((cls, index) => (
                        <span key={index} className="px-4 py-2 bg-gray-50 text-gray-700 rounded-xl text-xs font-bold border border-gray-200">
                          Class {cls.class} - {cls.section}
                        </span>
                      )) || <span className="text-gray-400 text-xs italic">No classes assigned</span>}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-brand-light/50 p-4 rounded-xl border border-brand-primary/10">
                        <span className="text-sm font-medium text-gray-600">Blood Group</span>
                        <span className="font-bold text-brand-dark">O+</span>
                    </div>
                    <div className="flex justify-between items-center bg-brand-light/50 p-4 rounded-xl border border-brand-primary/10">
                        <span className="text-sm font-medium text-gray-600">Admission Date</span>
                        <span className="font-bold text-brand-dark">Aug 2022</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-brand-light/50 p-4 rounded-xl border border-brand-primary/10">
                        <span className="text-sm font-medium text-gray-600">Guardian</span>
                        <span className="font-bold text-brand-dark">Robert Johnson</span>
                    </div>
                    <div className="flex justify-between items-center bg-brand-light/50 p-4 rounded-xl border border-brand-primary/10">
                        <span className="text-sm font-medium text-gray-600">House</span>
                        <span className="font-bold text-brand-dark">Green House</span>
                    </div>
                  </div>
                </div>
              )}
           </GlassCard>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <GlassCard className="flex items-center gap-4">
                <div className="p-4 bg-purple-50 text-purple-500 rounded-2xl">
                   <Award size={32} />
                </div>
                <div>
                   <h4 className="font-bold text-gray-900">
                     {user.role === 'TEACHER' ? 'Student Success Rate' : 'Merit Points'}
                   </h4>
                   <p className="text-xl font-bold text-purple-600">
                     {user.role === 'TEACHER' ? '94%' : '1,250'}
                   </p>
                </div>
             </GlassCard>
             <GlassCard className="flex items-center gap-4">
                <div className="p-4 bg-blue-50 text-blue-500 rounded-2xl">
                   <ShieldCheck size={32} />
                </div>
                <div>
                   <h4 className="font-bold text-gray-900">Account Security</h4>
                   <p className="text-xl font-bold text-blue-600">Level 4 Verified</p>
                </div>
             </GlassCard>
           </div>
           
           <div className="flex gap-4">
             <GradientButton className="flex-1">
                Update Profile
             </GradientButton>
             <button className="px-8 py-3 glass-card text-gray-500 font-bold text-xs hover:text-brand-primary transition-all">
                CHANGE PASSWORD
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};
