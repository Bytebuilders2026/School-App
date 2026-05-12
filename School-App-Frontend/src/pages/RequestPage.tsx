/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Plus, FileText, CheckCircle, XCircle, Clock, Upload, Send, BookOpen, FileUp } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { GlassCard, GlassInput, GradientButton, SectionHeader, PermissionGuard } from '../components/UI';
import { RequestItem } from '../types';

export const RequestPage: React.FC<{ onBack: () => void; initialType?: 'LEAVE' | 'DOCUMENT' }> = ({ onBack, initialType = 'LEAVE' }) => {
  const { user, requests, addRequest, updateRequestStatus } = useAppContext();
  const [isAdding, setIsAdding] = useState(false);
  
  // Student form state
  const [type, setType] = useState<'LEAVE' | 'DOCUMENT'>(initialType);
  const [reason, setReason] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [docType, setDocType] = useState('ID Proof');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // New Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [viewingDoc, setViewingDoc] = useState<RequestItem | null>(null);

  const filteredRequests = requests.filter(r => {
    const isRoleMatched = (user?.role === 'TEACHER' || user?.role === 'ADMIN') 
      ? r.type === (initialType === 'DOCUMENT' ? 'DOCUMENT' : 'LEAVE') 
      : r.studentId === user?.id;
    
    const isTypeMatched = r.type === (initialType === 'DOCUMENT' ? 'DOCUMENT' : 'LEAVE');
    const isStatusMatched = statusFilter === 'ALL' || r.status === statusFilter;
    const isSearchMatched = r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           r.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (r.documentType?.toLowerCase().includes(searchQuery.toLowerCase()));

    return isRoleMatched && isTypeMatched && isStatusMatched && isSearchMatched;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    addRequest({
      studentId: user.id,
      studentName: user.name,
      class: user.class || 'N/A',
      type,
      reason,
      dateRange: type === 'LEAVE' ? dateRange : undefined,
      documentType: type === 'DOCUMENT' ? docType : undefined,
      file: selectedFile ? selectedFile.name : undefined
    });
    
    alert(`${type} application submitted successfully!`);
    setIsAdding(false);
    setReason('');
    setDateRange('');
    setSelectedFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <SectionHeader 
          title={(user?.role === 'TEACHER' || user?.role === 'ADMIN') ? `${initialType === 'DOCUMENT' ? 'Document' : 'Leave'} Governance` : 'Academic Requests'}
          subtitle={(user?.role === 'TEACHER' || user?.role === 'ADMIN') ? "Review & Governance Dashboard" : "Leave & Document Management"}
          onBack={onBack}
          icon={initialType === 'DOCUMENT' ? <BookOpen size={28} /> : <FileUp size={28} />}
        />
        <PermissionGuard allowedRoles={['STUDENT']}>
          {!isAdding && (
            <div className="md:mt-[-40px]">
              <GradientButton onClick={() => { setType(initialType); setIsAdding(true); }} className="!w-auto !py-3 px-8">
                <Plus size={18} className="mr-2" /> NEW {initialType}
              </GradientButton>
            </div>
          )}
        </PermissionGuard>
      </div>

      {/* Filters & Search */}
      {(user?.role === 'TEACHER' || user?.role === 'ADMIN') && (
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <input 
              type="text"
              placeholder="Search students or reasons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white px-12 py-4 rounded-2xl border border-gray-100 focus:border-brand-primary outline-none text-sm font-medium shadow-sm transition-all"
            />
            <Plus className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 rotate-45" size={20} />
          </div>
          <div className="flex p-1 bg-white border border-gray-100 rounded-2xl gap-1 shadow-sm overflow-x-auto no-scrollbar">
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all whitespace-nowrap ${statusFilter === status ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'text-gray-400 hover:bg-gray-50'}`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {filteredRequests.length > 0 ? (
          filteredRequests.map(item => (
            <GlassCard key={item.id} hoverScale={false} className="!p-0 overflow-hidden group">
              <div className="flex flex-col md:flex-row">
                <div className={`w-full md:w-2 ${item.status === 'APPROVED' ? 'bg-green-500' : item.status === 'REJECTED' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                <div className="flex-1 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 ${item.type === 'LEAVE' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500'}`}>
                      {item.type === 'LEAVE' ? <Clock size={28} /> : <FileText size={28} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="text-lg font-black text-gray-900 tracking-tight">{item.type} {item.type === 'DOCUMENT' ? `(${item.documentType})` : ''}</h4>
                        <StatusBadge status={item.status} />
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{(user?.role === 'TEACHER' || user?.role === 'ADMIN') ? `Student: ${item.studentName}` : `ID: #${item.id.slice(0, 5)}`}</span>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">• Applied: {new Date(item.createdAt).toLocaleDateString()}</span>
                        {item.file && (
                          <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest flex items-center gap-1">
                            <Upload size={10} /> {item.file}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <PermissionGuard allowedRoles={['TEACHER']} fallback={
                      <button 
                        onClick={() => item.file && setViewingDoc(item)}
                        className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-brand-light group-hover:text-brand-primary transition-all overflow-hidden"
                      >
                        {item.file ? <Upload size={20} /> : <FileText size={20} />}
                      </button>
                    }>
                      {item.status === 'PENDING' ? (
                        <div className="flex gap-2 w-full">
                          <button 
                            onClick={() => updateRequestStatus(item.id, 'APPROVED')}
                            className="flex-1 md:flex-none px-6 py-2.5 bg-green-500 text-white rounded-xl text-[10px] font-black tracking-widest uppercase hover:bg-green-600 transition-all active:scale-95 shadow-lg shadow-green-200"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => updateRequestStatus(item.id, 'REJECTED')}
                            className="flex-1 md:flex-none px-6 py-2.5 bg-red-500 text-white rounded-xl text-[10px] font-black tracking-widest uppercase hover:bg-red-600 transition-all active:scale-95 shadow-lg shadow-red-200"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => item.file && setViewingDoc(item)}
                          className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-brand-light group-hover:text-brand-primary transition-all overflow-hidden"
                        >
                          {item.file ? <Upload size={20} /> : <FileText size={20} />}
                        </button>
                      )}
                    </PermissionGuard>
                  </div>
                </div>
              </div>
              
              <div className="px-8 pb-6 ml-0 md:ml-2">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 opacity-60">Submitted Message</p>
                  <p className="text-sm text-gray-700 font-medium leading-relaxed italic">"{item.reason}"</p>
                  {item.dateRange && (
                    <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-2 text-[10px] font-black text-brand-secondary uppercase tracking-[0.2em]">
                       <Clock size={12} /> Duration: {item.dateRange}
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          ))
        ) : (
          <div className="py-24 text-center bg-gray-50/50 rounded-[40px] border-2 border-dashed border-gray-200">
             <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-gray-200 mx-auto mb-6 shadow-sm">
                <FileText size={40} />
             </div>
             <p className="text-gray-400 font-bold text-lg tracking-tight">No pending or historical requests</p>
             <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-2 leading-none">Your application ledger is empty</p>
          </div>
        )}
      </div>

      {/* New Request Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-xl"
            >
              <GlassCard hoverScale={false} className="!p-0 overflow-hidden shadow-2xl bg-white">
                <div className="p-8 border-b border-gray-100 bg-brand-light/20 flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Apply for {type}</h2>
                    <p className="text-xs font-bold text-brand-primary uppercase tracking-[0.2em] mt-1">Official Governance Request</p>
                  </div>
                  <button onClick={() => setIsAdding(false)} className="w-10 h-10 flex items-center justify-center bg-white rounded-xl text-gray-400 hover:text-red-500 transition-colors shadow-sm"><XCircle size={24} /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                  {/* Type Selector Hidden since we use initialType */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {type === 'LEAVE' ? (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Leave Duration</label>
                        <GlassInput placeholder="e.g. 15th May - 18th May" required value={dateRange} onChange={e => setDateRange(e.target.value)} />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Document Type</label>
                        <select 
                          className="w-full bg-gray-50 px-6 py-4 rounded-2xl border border-gray-100 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none text-sm font-bold transition-all appearance-none"
                          value={docType}
                          onChange={e => setDocType(e.target.value)}
                        >
                          <option>ID Proof</option>
                          <option>Certificate</option>
                          <option>Medical</option>
                          <option>Bonafide</option>
                          <option>Other</option>
                        </select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Required Reason</label>
                      <textarea 
                        required
                        className="w-full bg-gray-50 px-6 py-4 rounded-2xl border border-gray-100 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none text-sm font-medium transition-all h-[52px] resize-none"
                        placeholder="Purpose of request..."
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Supporting Documentation</label>
                    <div className="relative">
                      <input 
                        type="file" 
                        id="file-upload" 
                        className="hidden" 
                        onChange={handleFileChange}
                      />
                      <label 
                        htmlFor="file-upload"
                        className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-gray-200 rounded-3xl hover:border-brand-primary/40 hover:bg-brand-light/10 transition-all cursor-pointer group"
                      >
                        <div className="p-4 bg-gray-50 rounded-2xl group-hover:scale-110 transition-transform">
                          <Upload className="text-gray-400 group-hover:text-brand-primary" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-black text-gray-900">{selectedFile ? selectedFile.name : 'Choose file or drag here'}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">PDF, JPG or PNG (Max 5MB)</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      type="button"
                      onClick={() => setIsAdding(false)}
                      className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl text-[10px] font-black tracking-widest uppercase hover:bg-gray-200 transition-all"
                    >
                      Discard
                    </button>
                    <GradientButton type="submit" className="flex-[2]">
                      <Send size={18} className="mr-2" /> DISPATCH REQUEST
                    </GradientButton>
                  </div>
                </form>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Document Viewer Modal */}
      <AnimatePresence>
        {viewingDoc && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl"
            >
              <GlassCard hoverScale={false} className="!p-0 overflow-hidden bg-white">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 text-sm uppercase tracking-widest">Document Preview</h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{viewingDoc.file || 'Document'}</p>
                    </div>
                  </div>
                  <button onClick={() => setViewingDoc(null)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Plus className="rotate-45" size={24} /></button>
                </div>
                
                <div className="p-12 flex flex-col items-center justify-center min-h-[300px]">
                  <div className="w-32 h-40 bg-gray-100 rounded-2xl flex flex-col items-center justify-center gap-4 border-2 border-dashed border-gray-200 mb-6">
                    <FileText size={48} className="text-gray-300" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">PREVIEW DATA</span>
                  </div>
                  <div className="text-center max-w-sm">
                    <p className="text-sm font-bold text-gray-900 mb-2">{viewingDoc.documentType || viewingDoc.type} Request</p>
                    <p className="text-xs text-gray-500 leading-relaxed italic">"{viewingDoc.reason}"</p>
                  </div>
                </div>

                <div className="p-6 border-t border-gray-100 grid grid-cols-2 gap-4 bg-gray-50/30">
                  <button 
                    onClick={() => { alert('Downloading ' + viewingDoc.file); setViewingDoc(null); }}
                    className="py-3 bg-white border border-gray-100 rounded-xl text-[10px] font-black text-gray-600 tracking-widest uppercase hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                  >
                    <Upload size={14} className="rotate-180" /> Download
                  </button>
                  <button 
                    onClick={() => setViewingDoc(null)}
                    className="py-3 bg-brand-primary text-white rounded-xl text-[10px] font-black tracking-widest uppercase hover:shadow-lg shadow-brand-primary/20 transition-all"
                  >
                    Done
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatusBadge: React.FC<{ status: RequestItem['status'] }> = ({ status }) => {
  const styles = {
    PENDING: 'bg-yellow-100 text-yellow-600',
    APPROVED: 'bg-green-100 text-green-600',
    REJECTED: 'bg-red-100 text-red-600'
  };
  return (
    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest ${styles[status]}`}>
      {status === 'PENDING' && <Clock size={12} />}
      {status === 'APPROVED' && <CheckCircle size={12} />}
      {status === 'REJECTED' && <XCircle size={12} />}
      {status}
    </span>
  );
};
