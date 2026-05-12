/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Bell, Megaphone, Newspaper, Calendar, MessageCircle, Send, Search } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { GlassCard, GlassInput, SectionHeader } from '../components/UI';

export const CommunicationPage: React.FC<{ onBack: () => void; initialTab?: string }> = ({ onBack, initialTab = 'NOTICES' }) => {
  const { user, notices, addNotification } = useAppContext();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [messageText, setMessageText] = useState('');

  const tabs = [
    { id: 'MESSAGES', label: 'Messages', icon: <MessageCircle size={18} /> },
    { id: 'NOTICES', label: 'Notices', icon: <Megaphone size={18} /> },
    { id: 'NEWS', label: 'School News', icon: <Newspaper size={18} /> },
    { id: 'EVENTS', label: 'Events', icon: <Calendar size={18} /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'MESSAGES':
        return (
          <div className="h-[60vh] flex flex-col glass-card border-none rounded-[24px] overflow-hidden">
            <div className="p-6 bg-white/40 border-b border-white/60 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary">
                <Bell size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Broadcast Channel</h3>
                <p className="text-xs text-gray-500 font-medium">Messages from Administration</p>
              </div>
            </div>
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              <div className="bg-brand-light p-4 rounded-2xl rounded-tl-none max-w-[80%] border border-brand-primary/10">
                <p className="text-sm text-gray-800">Hello students! Don't forget to submit your science projects by tomorrow afternoon.</p>
                <div className="text-[10px] text-brand-secondary font-bold text-right mt-1">10:45 AM</div>
              </div>
              <div className="bg-gray-100 p-4 rounded-2xl rounded-tr-none max-w-[80%] ml-auto border border-gray-200">
                <p className="text-sm text-gray-800">Sure Professor! I've already submitted mine on the portal.</p>
                <div className="text-[10px] text-gray-400 font-bold text-right mt-1">11:02 AM</div>
              </div>
            </div>
            <div className="p-4 bg-white/40 border-t border-white/60 flex gap-4">
              <input 
                className="flex-1 bg-white/50 px-6 py-3 rounded-full border border-gray-100 focus:outline-none focus:border-brand-primary/30 text-sm"
                placeholder="Type your message..."
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
              />
              <button className="w-12 h-12 bg-brand-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-brand-primary/30 hover:scale-110 active:scale-95 transition-all">
                <Send size={20} />
              </button>
            </div>
          </div>
        );
      case 'NOTICES':
        return (
          <div className="grid grid-cols-1 gap-6">
            {user?.role === 'ADMIN' && (
              <GlassCard className="!p-6 border-brand-primary/20 bg-brand-light/10">
                <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Post New Notice</h4>
                <div className="space-y-4">
                  <input 
                    placeholder="Notice Title"
                    className="w-full bg-white px-6 py-3 rounded-xl border border-gray-100 focus:border-brand-primary outline-none text-sm font-bold"
                    id="new-notice-title"
                  />
                  <textarea 
                    placeholder="Describe the announcement..."
                    className="w-full bg-white px-6 py-3 rounded-xl border border-gray-100 focus:border-brand-primary outline-none text-sm font-medium h-24"
                    id="new-notice-content"
                  />
                  <button 
                    onClick={() => {
                      const title = (document.getElementById('new-notice-title') as HTMLInputElement).value;
                      const content = (document.getElementById('new-notice-content') as HTMLTextAreaElement).value;
                      if (!title || !content) return;
                      addNotification({
                        type: 'NOTICE',
                        title: title,
                        message: content,
                        role: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'],
                        targetPage: 'notices'
                      });
                      alert('Notice Broadcasted to all roles!');
                    }}
                    className="w-full py-3 bg-brand-primary text-white rounded-xl text-[11px] font-black tracking-[0.2em] uppercase hover:shadow-lg hover:shadow-brand-primary/20 transition-all"
                  >
                    BROADCAST NOTICE
                  </button>
                </div>
              </GlassCard>
            )}
            {notices.map(notice => (
              <GlassCard key={notice.id} hoverScale={false} className="!p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                      <Megaphone size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{notice.title}</h4>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{notice.date}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${notice.category === 'EVENT' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                    {notice.category}
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{notice.content}</p>
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                   <button className="text-xs font-bold text-brand-primary uppercase tracking-wider hover:underline">Read Attachment</button>
                </div>
              </GlassCard>
            ))}
          </div>
        );
      default:
        return (
          <div className="py-20 text-center glass-card border-none rounded-[24px]">
             <Search size={64} className="mx-auto text-gray-200 mb-4" />
             <p className="text-gray-400 font-medium capitalize">No {activeTab.toLowerCase()} posted yet.</p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
      <SectionHeader 
        title="Communication Hub"
        subtitle="Stay updated with the latest from ByteBuilders"
        onBack={onBack}
        icon={<Bell size={28} />}
      />

      <div className="flex overflow-x-auto gap-4 mb-8 pb-2 no-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold tracking-tight transition-all whitespace-nowrap shadow-sm min-h-[52px] ${activeTab === tab.id ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-105' : 'glass-card text-gray-500 hover:bg-white'}`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="max-w-4xl mx-auto">
        {renderContent()}
      </div>
    </div>
  );
};
