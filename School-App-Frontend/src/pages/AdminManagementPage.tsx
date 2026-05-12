/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Users, Plus, Search, Filter, 
  MoreVertical, Edit2, Trash2, Shield, 
  Mail, Phone, Book, Hash, Check
} from 'lucide-react';
import { useAppContext } from '../AppContext';
import { GlassCard, SectionHeader, GradientButton, GlassInput } from '../components/UI';

export const AdminManagementPage: React.FC<{ onBack: () => void; type: 'STUDENTS' | 'TEACHERS'; filterClass?: string }> = ({ onBack, type, filterClass }) => {
  const { 
    students, teachers, 
    addStudent, updateStudent, deleteStudent,
    addTeacher, updateTeacher, deleteTeacher 
  } = useAppContext();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Active' | 'Inactive'>('ALL');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingItem, setViewingItem] = useState<any | null>(null);

  // Expanded Form State to match DB
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    // Teacher specific
    employeeId: '',
    qualification: '',
    experience: 0,
    subjects: '', // comma separated
    classesStr: '', // comma separated e.g. "10-A, 11-B"
    // Student specific
    rollNumber: '',
    admissionNumber: '',
    class: filterClass || '',
    section: '',
    gender: 'Male',
    status: 'Active',
    // Parent info (Mandatory for Student creation)
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    parentOccupation: '',
    parentAddress: ''
  });

  const rawList = type === 'STUDENTS' ? students : teachers;
  const filteredList = rawList.filter(item => {
    const nameMatch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const emailMatch = item.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const idMatch = (item.rollNo || item.employeeId || item.rollNumber || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSearch = nameMatch || emailMatch || idMatch;
    const matchesClass = !filterClass || item.class === filterClass;
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter || (statusFilter === 'Active' && item.isActive !== false);

    return matchesSearch && matchesClass && matchesStatus;
  });

  const resetForm = () => {
    setFormData({ 
      name: '', email: '', password: '', phone: '', address: '',
      employeeId: '', qualification: '', experience: 0, subjects: '', classesStr: '',
      rollNumber: '', admissionNumber: '', class: filterClass || '', section: '',
      gender: 'Male', status: 'Active',
      parentName: '', parentPhone: '', parentEmail: '', parentOccupation: '', parentAddress: ''
    });
    setEditingId(null);
    setIsAdding(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare data for backend
    const payload: any = { ...formData };
    
    if (type === 'TEACHERS') {
      payload.subjects = formData.subjects.split(',').map(s => s.trim()).filter(Boolean);
      payload.classes = formData.classesStr.split(',').map(c => {
        const [className, section] = c.trim().split('-');
        return { class: className, section: section || 'A' };
      }).filter(c => c.class);
      // Remove student-only fields
      delete payload.rollNumber;
      delete payload.admissionNumber;
      delete payload.parentName;
      delete payload.parentPhone;
    }

    if (type === 'STUDENTS') {
      // Remove teacher-only fields
      delete payload.employeeId;
      delete payload.qualification;
      delete payload.experience;
      delete payload.subjects;
      delete payload.classesStr;
      
      if (editingId) updateStudent(editingId, payload);
      else addStudent(payload);
    } else {
      if (editingId) updateTeacher(editingId, payload);
      else addTeacher(payload);
    }
    resetForm();
    alert(`${type === 'STUDENTS' ? 'Student' : 'Teacher'} records updated.`);
  };

  const handleEdit = (item: any) => {
    const subjectsStr = Array.isArray(item.subjects) ? item.subjects.join(', ') : (item.subject || '');
    const classesStr = Array.isArray(item.classes) ? item.classes.map((c: any) => `${c.class}-${c.section}`).join(', ') : '';
    
    setFormData({ 
      ...item, 
      rollNumber: item.rollNumber || item.rollNo || '',
      subjects: subjectsStr,
      classesStr: classesStr,
      password: '', // Don't show password on edit
      parentName: item.parent?.name || '',
      parentPhone: item.parent?.phone || '',
      parentEmail: item.parent?.email || '',
      parentOccupation: item.parent?.occupation || '',
      parentAddress: item.parent?.address || ''
    });
    setEditingId(item.id);
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(`Are you sure you want to remove this ${type.toLowerCase()}?`)) {
      if (type === 'STUDENTS') deleteStudent(id);
      else deleteTeacher(id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <SectionHeader 
          title={type === 'STUDENTS' ? (filterClass ? `Students: ${filterClass}` : 'Academy Enrollment') : 'Faculty Governance'}
          subtitle={`Admin interface for ${type.toLowerCase()} records management`}
          onBack={onBack}
          icon={type === 'STUDENTS' ? <Users size={28} /> : <Shield size={28} />}
        />
        <div className="md:mt-[-40px]">
          <GradientButton onClick={() => setIsAdding(true)} className="!w-auto !py-3 px-8">
            <Plus size={18} className="mr-2" /> ADD {type === 'STUDENTS' ? 'STUDENT' : 'TEACHER'}
          </GradientButton>
        </div>
      </div>

      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder={`Search ${type.toLowerCase()} by name, id or email...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white px-12 py-4 rounded-2xl border border-gray-100 focus:border-brand-primary outline-none text-sm font-medium shadow-sm transition-all"
          />
        </div>
        <div className="flex gap-2 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
           {(['ALL', 'Active', 'Inactive'] as const).map(f => (
             <button
               key={f}
               onClick={() => setStatusFilter(f)}
               className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                 statusFilter === f ? 'bg-brand-primary text-white shadow-md' : 'text-gray-400 hover:text-gray-600'
               }`}
             >
               {f}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredList.map(item => (
          <GlassCard key={item.id} hoverScale={false} className="!p-6 group border-transparent hover:border-brand-primary/20">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 font-black">
                  {item.avatar || item.profileImage ? <img src={item.avatar || item.profileImage} alt="" className="w-full h-full rounded-xl object-cover" /> : item.name[0]}
                </div>
                <div>
                  <h4 className="font-black text-gray-900 group-hover:text-brand-primary transition-colors">{item.name}</h4>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {type === 'STUDENTS' ? `Class ${item.class}` : (item.subjects?.[0] || item.subject || 'Faculty')}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(item)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <Mail size={14} className="opacity-40" /> {item.email || 'no-email@school.com'}
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <Hash size={14} className="opacity-40" /> ID: <span className="font-bold text-gray-900">{item.rollNumber || item.rollNo || item.employeeId || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <Book size={14} className="opacity-40" /> 
                {type === 'STUDENTS' ? `Section: ${item.section || 'A'}` : `Classes: ${Array.isArray(item.classes) ? item.classes.map((c: any) => `${c.class}-${c.section}`).join(', ') : 'N/A'}`}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${item.status === 'Active' || item.isActive !== false ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-gray-300'}`} />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.status || (item.isActive !== false ? 'Active' : 'Inactive')}</span>
              </div>
              <button 
                onClick={() => setViewingItem(item)}
                className="text-[10px] font-black text-brand-primary uppercase tracking-widest px-4 py-2 bg-brand-light/20 rounded-xl hover:bg-brand-light transition-all"
              >
                Full Profile
              </button>
            </div>
          </GlassCard>
        ))}
      </div>

      <AnimatePresence>
        {/* CREATE / EDIT MODAL */}
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <GlassCard className="!p-0 overflow-hidden bg-white shadow-2xl">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 sticky top-0 z-10 backdrop-blur-md">
                   <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">{editingId ? 'Update' : 'Register New'} {type === 'STUDENTS' ? 'Student' : 'Teacher'}</h3>
                   <button onClick={resetForm} className="text-gray-400 hover:text-red-500 transition-colors"><Plus className="rotate-45" size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                   {/* Personal Section */}
                   <div className="space-y-4">
                     <h4 className="text-[10px] font-black text-brand-primary uppercase tracking-widest border-l-4 border-brand-primary pl-3">Personal Information</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                          <GlassInput placeholder="John Doe" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                          <GlassInput type="email" placeholder="john@example.com" required={!editingId} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password {editingId && '(Leave blank to keep same)'}</label>
                          <GlassInput type="password" placeholder="••••••••" required={!editingId} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                          <GlassInput placeholder="+1 234 567 8900" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                        </div>
                     </div>
                   </div>

                   {/* Academic Section */}
                   <div className="space-y-4">
                     <h4 className="text-[10px] font-black text-brand-primary uppercase tracking-widest border-l-4 border-brand-primary pl-3">Academic Details</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {type === 'STUDENTS' ? (
                          <>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Roll Number</label>
                              <GlassInput placeholder="101" required value={formData.rollNumber} onChange={e => setFormData({...formData, rollNumber: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Admission Number</label>
                              <GlassInput placeholder="ADM-2024-001" value={formData.admissionNumber} onChange={e => setFormData({...formData, admissionNumber: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Class</label>
                              <select 
                                className="w-full bg-gray-50 px-6 py-3.5 rounded-2xl border border-gray-100 outline-none text-xs font-bold appearance-none"
                                value={formData.class}
                                onChange={e => setFormData({...formData, class: e.target.value})}
                                required
                              >
                                <option value="">Select Class</option>
                                {["Pre-Nursery", "Nursery", "KG", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"].map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Section</label>
                              <GlassInput placeholder="A" required value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Gender</label>
                              <select 
                                className="w-full bg-gray-50 px-6 py-3.5 rounded-2xl border border-gray-100 outline-none text-xs font-bold appearance-none"
                                value={formData.gender}
                                onChange={e => setFormData({...formData, gender: e.target.value})}
                              >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Employee ID</label>
                              <GlassInput placeholder="TCH-001" required value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Qualification</label>
                              <GlassInput placeholder="M.Sc. Mathematics" required value={formData.qualification} onChange={e => setFormData({...formData, qualification: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Experience (Years)</label>
                              <GlassInput type="number" placeholder="5" value={formData.experience} onChange={e => setFormData({...formData, experience: Number(e.target.value)})} />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Subjects (Comma separated)</label>
                              <GlassInput placeholder="Mathematics, Physics" value={formData.subjects} onChange={e => setFormData({...formData, subjects: e.target.value})} />
                            </div>
                            <div className="space-y-2 col-span-2">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Assigned Classes (Format: 10-A, 11-B)</label>
                              <GlassInput placeholder="10th-A, 11th-B" value={formData.classesStr} onChange={e => setFormData({...formData, classesStr: e.target.value})} />
                            </div>
                          </>
                        )}
                     </div>
                   </div>

                   {/* Parent Section (Mandatory for Student) */}
                   {type === 'STUDENTS' && (
                     <div className="space-y-4 p-6 bg-brand-light/10 rounded-[2rem] border border-brand-primary/10">
                        <h4 className="text-[10px] font-black text-brand-primary uppercase tracking-widest border-l-4 border-brand-primary pl-3">Parent Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Parent Name</label>
                             <GlassInput placeholder="Father/Mother Name" required value={formData.parentName} onChange={e => setFormData({...formData, parentName: e.target.value})} />
                           </div>
                           <div className="space-y-2">
                             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Parent Phone</label>
                             <GlassInput placeholder="Parent Contact Number" required value={formData.parentPhone} onChange={e => setFormData({...formData, parentPhone: e.target.value})} />
                           </div>
                           <div className="space-y-2">
                             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Parent Email</label>
                             <GlassInput type="email" placeholder="parent@example.com" value={formData.parentEmail} onChange={e => setFormData({...formData, parentEmail: e.target.value})} />
                           </div>
                           <div className="space-y-2">
                             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Parent Occupation</label>
                             <GlassInput placeholder="Doctor, Business, etc." value={formData.parentOccupation} onChange={e => setFormData({...formData, parentOccupation: e.target.value})} />
                           </div>
                        </div>
                     </div>
                   )}

                   <div className="space-y-2 col-span-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Home Address</label>
                     <GlassInput placeholder="Full residential address..." value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                   </div>

                   <div className="flex gap-3 pt-6 border-t border-gray-50">
                      <button type="button" onClick={resetForm} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl text-[10px] font-black uppercase tracking-widest">Cancel</button>
                      <GradientButton type="submit" className="flex-[2] py-4">
                        <Check size={18} className="mr-2" /> {editingId ? 'SAVE CHANGES' : 'CREATE ACCOUNT'}
                      </GradientButton>
                   </div>
                </form>
              </GlassCard>
            </motion.div>
          </div>
        )}

        {/* FULL PROFILE MODAL */}
        {viewingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl">
             <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-3xl max-h-[85vh] overflow-hidden"
            >
              <GlassCard className="!p-0 bg-white/90 shadow-2xl relative overflow-hidden h-full flex flex-col">
                <button 
                  onClick={() => setViewingItem(null)}
                  className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 z-10 transition-all"
                >
                  <Plus className="rotate-45" size={24} />
                </button>

                <div className="p-10 flex flex-col md:flex-row gap-10 overflow-y-auto">
                  <div className="md:w-1/3 flex flex-col items-center text-center">
                    <div className="w-40 h-40 rounded-[2.5rem] bg-gradient-to-br from-brand-primary/20 to-brand-secondary/40 flex items-center justify-center mb-6 shadow-xl shadow-brand-primary/10 overflow-hidden">
                       {viewingItem.avatar || viewingItem.profileImage ? (
                         <img src={viewingItem.avatar || viewingItem.profileImage} alt="" className="w-full h-full object-cover" />
                       ) : (
                         <User size={80} className="text-brand-secondary" />
                       )}
                    </div>
                    <h3 className="text-2xl font-black text-gray-900">{viewingItem.name}</h3>
                    <div className="mt-2 px-4 py-1.5 bg-brand-light text-brand-primary rounded-full font-black text-[10px] uppercase tracking-widest">
                      {type.slice(0, -1)}
                    </div>
                    
                    <div className="w-full mt-10 grid grid-cols-2 gap-3">
                       <div className="p-4 bg-gray-50 rounded-2xl text-center">
                          <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Status</p>
                          <p className="text-xs font-black text-green-600 uppercase">Active</p>
                       </div>
                       <div className="p-4 bg-gray-50 rounded-2xl text-center">
                          <p className="text-[9px] font-black text-gray-400 uppercase mb-1">ID No</p>
                          <p className="text-xs font-black text-gray-900 uppercase">{viewingItem.rollNumber || viewingItem.rollNo || viewingItem.employeeId}</p>
                       </div>
                    </div>
                  </div>

                  <div className="md:w-2/3 space-y-8">
                    <div>
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Personal Details</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Email Address</p>
                          <p className="text-sm font-semibold text-gray-800">{viewingItem.email || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Phone Number</p>
                          <p className="text-sm font-semibold text-gray-800">{viewingItem.phone || 'N/A'}</p>
                        </div>
                        <div className="space-y-1 col-span-full">
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Residential Address</p>
                          <p className="text-sm font-semibold text-gray-800 leading-relaxed">{viewingItem.address || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Academic & Guardian</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {type === 'STUDENTS' ? (
                          <>
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-gray-400 uppercase">Current Class</p>
                              <p className="text-sm font-semibold text-gray-800">{viewingItem.class} - {viewingItem.section || 'A'}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-gray-400 uppercase">Admission Number</p>
                              <p className="text-sm font-semibold text-gray-800">{viewingItem.admissionNumber || 'N/A'}</p>
                            </div>
                            <div className="pt-4 border-t border-gray-50 col-span-full">
                               <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-3">Guardian Details</p>
                               <div className="p-4 bg-gray-50 rounded-2xl space-y-2">
                                  <p className="text-xs font-bold text-gray-800"><span className="text-gray-400 mr-2">Name:</span> {viewingItem.parent?.name || 'N/A'}</p>
                                  <p className="text-xs font-bold text-gray-800"><span className="text-gray-400 mr-2">Phone:</span> {viewingItem.parent?.phone || 'N/A'}</p>
                                  <p className="text-xs font-bold text-gray-800"><span className="text-gray-400 mr-2">Job:</span> {viewingItem.parent?.occupation || 'N/A'}</p>
                               </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-gray-400 uppercase">Qualification</p>
                              <p className="text-sm font-semibold text-gray-800">{viewingItem.qualification || 'N/A'}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-gray-400 uppercase">Experience</p>
                              <p className="text-sm font-semibold text-gray-800">{viewingItem.experience || 0} Years</p>
                            </div>
                            <div className="space-y-4 col-span-full mt-2">
                               <p className="text-[10px] font-bold text-gray-400 uppercase">Assigned Subjects</p>
                               <div className="flex flex-wrap gap-2">
                                  {(viewingItem.subjects || []).map((s: string) => (
                                    <span key={s} className="px-3 py-1.5 bg-brand-light text-brand-primary rounded-xl text-[10px] font-black uppercase tracking-wider">{s}</span>
                                  ))}
                               </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
