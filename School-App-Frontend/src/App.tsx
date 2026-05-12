/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AppProvider, useAppContext } from './AppContext';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { AttendancePage } from './pages/AttendancePage';
import { RequestPage } from './pages/RequestPage';
import { GatePassPage } from './pages/GatePassPage';
import { AdminStudentsPage } from './pages/AdminStudentsPage';
import { AdminTeachersPage } from './pages/AdminTeachersPage';
import { AdminFinancePage } from './pages/AdminFinancePage';
import { FeesPage } from './pages/FeesPage';
import { CommunicationPage } from './pages/CommunicationPage';
import { AcademicsPage } from './pages/AcademicsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AdminToolsPage } from './pages/AdminToolsPage';
import { ReportsPage } from './pages/ReportsPage';
import { AdminManagementPage } from './pages/AdminManagementPage';
import { AdminClassListPage } from './pages/AdminClassListPage';
import { BottomNav } from './components/BottomNav';
import { GlobalHeader } from './components/GlobalHeader';
import { GlassCard } from './components/UI';
import { ArrowLeft, Construction, Shield } from 'lucide-react';
import { UserRole } from './types';

export type PageType = 
  | 'DASHBOARD' 
  | 'attendance_teacher' | 'attendance_student' | 'attendance_parent'
  | 'manage_students' | 'manage_teachers' | 'manage_students_class'
  | 'leave_request' | 'leave_approvals' | 'leave_governance'
  | 'doc_request' | 'doc_approvals' | 'doc_governance'
  | 'gate_pass'
  | 'students'
  | 'teachers'
  | 'fees_admin'
  | 'notices_admin'
  | 'settings'
  | 'fees_student' | 'fees_parent'
  | 'messages' | 'notices' | 'news' | 'events'
  | 'timetable' | 'classes'
  | 'assignments_teacher' | 'assignments_student'
  | 'profile'
  | 'analytics'
  | 'reports'
  | 'admin_tools';

const AppContent: React.FC = () => {
  const { user } = useAppContext();
  const [currentPage, setCurrentPage] = useState<PageType>('DASHBOARD');
  const [activeClass, setActiveClass] = useState<string | null>(null);

  if (!user) {
    return <Login />;
  }

  // RBAC Permission Map
  const PERMISSIONS: Record<UserRole, PageType[]> = {
    'ADMIN': [
      'DASHBOARD', 'manage_students', 'manage_teachers', 'manage_students_class', 'students', 'teachers',
      'fees_admin', 'notices_admin', 'leave_governance', 'doc_governance',
      'reports', 'admin_tools', 'settings', 'analytics', 'profile', 'messages', 'notices', 'news', 'events'
    ],
    'TEACHER': [
      'DASHBOARD', 'attendance_teacher', 'leave_approvals', 'doc_approvals',
      'timetable', 'classes', 'assignments_teacher', 'profile', 'messages', 'notices', 'news', 'events'
    ],
    'STUDENT': [
      'DASHBOARD', 'attendance_student', 'leave_request', 'doc_request',
      'fees_student', 'timetable', 'assignments_student', 'profile', 'messages', 'notices', 'news', 'events'
    ],
    'PARENT': [
      'DASHBOARD', 'attendance_parent', 'fees_parent', 'gate_pass', 'messages', 'notices', 'news', 'events'
    ]
  };

  const isAuthorized = PERMISSIONS[user.role]?.includes(currentPage) ?? false;

  const renderPage = () => {
    if (!isAuthorized) {
      return (
        <div className="max-w-7xl mx-auto px-4 pt-24 pb-12 flex flex-col items-center justify-center min-h-[60vh]">
          <GlassCard className="max-w-md w-full flex flex-col items-center text-center py-16 border-red-100">
            <Shield size={64} className="text-red-500 mb-6" />
            <h2 className="text-2xl font-black text-gray-900 mb-2">Access Restricted</h2>
            <p className="text-sm text-gray-500">Your current role ({user.role}) does not have permission to access the "{currentPage.replace(/_/g, ' ')}" module.</p>
            <button 
              onClick={() => setCurrentPage('DASHBOARD')}
              className="mt-8 px-8 py-3 bg-brand-primary text-white rounded-xl text-xs font-black tracking-widest uppercase transition-all shadow-lg shadow-brand-primary/20"
            >
              Return Home
            </button>
          </GlassCard>
        </div>
      );
    }

    switch (currentPage) {
      case 'DASHBOARD':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'attendance_teacher':
      case 'attendance_student':
      case 'attendance_parent':
        return <AttendancePage onBack={() => setCurrentPage('DASHBOARD')} />;
      case 'gate_pass':
        return <GatePassPage onBack={() => setCurrentPage('DASHBOARD')} />;
      case 'manage_students':
        return <AdminClassListPage onBack={() => setCurrentPage('DASHBOARD')} onSelectClass={(c) => { setActiveClass(c); setCurrentPage('manage_students_class'); }} />;
      case 'manage_students_class':
        return <AdminManagementPage type="STUDENTS" filterClass={activeClass || ''} onBack={() => setCurrentPage('manage_students')} />;
      case 'students':
        return <AdminClassListPage onBack={() => setCurrentPage('DASHBOARD')} onSelectClass={(c) => { setActiveClass(c); setCurrentPage('manage_students_class'); }} />;
      case 'manage_teachers':
      case 'teachers':
        return <AdminManagementPage type="TEACHERS" onBack={() => setCurrentPage('DASHBOARD')} />;
      case 'leave_request':
      case 'leave_approvals':
      case 'leave_governance':
        return <RequestPage onBack={() => setCurrentPage('DASHBOARD')} initialType="LEAVE" />;
      case 'doc_request':
      case 'doc_approvals':
      case 'doc_governance':
        return <RequestPage onBack={() => setCurrentPage('DASHBOARD')} initialType="DOCUMENT" />;
      case 'fees_admin':
        return <AdminFinancePage onBack={() => setCurrentPage('DASHBOARD')} />;
      case 'fees_student':
      case 'fees_parent':
        return <FeesPage onBack={() => setCurrentPage('DASHBOARD')} />;
      case 'messages':
        return <CommunicationPage onBack={() => setCurrentPage('DASHBOARD')} initialTab="MESSAGES" />;
      case 'notices':
        return <CommunicationPage onBack={() => setCurrentPage('DASHBOARD')} initialTab="NOTICES" />;
      case 'notices_admin':
        return <CommunicationPage onBack={() => setCurrentPage('DASHBOARD')} initialTab="NOTICES" />;
      case 'news':
        return <CommunicationPage onBack={() => setCurrentPage('DASHBOARD')} initialTab="NEWS" />;
      case 'events':
        return <CommunicationPage onBack={() => setCurrentPage('DASHBOARD')} initialTab="EVENTS" />;
      case 'timetable':
      case 'classes':
        return <AcademicsPage onBack={() => setCurrentPage('DASHBOARD')} initialView="TIMETABLE" />;
      case 'assignments_teacher':
      case 'assignments_student':
        return <AcademicsPage onBack={() => setCurrentPage('DASHBOARD')} initialView="ASSIGNMENTS" />;
      case 'settings':
      case 'admin_tools':
        return <AdminToolsPage onBack={() => setCurrentPage('DASHBOARD')} />;
      case 'profile':
        return <ProfilePage onBack={() => setCurrentPage('DASHBOARD')} />;
      case 'analytics':
        return <AnalyticsPage onBack={() => setCurrentPage('DASHBOARD')} />;
      case 'reports':
        return <ReportsPage onBack={() => setCurrentPage('DASHBOARD')} />;
      default:
        return (
          <div className="max-w-7xl mx-auto px-4 pt-24 pb-12 flex flex-col items-center justify-center min-h-[60vh]">
            <button 
              onClick={() => setCurrentPage('DASHBOARD')}
              className="mb-8 p-3 glass-card text-gray-600 hover:text-brand-primary self-start"
            >
              <ArrowLeft size={20} />
            </button>
            <GlassCard className="max-w-md w-full flex flex-col items-center text-center py-16">
              <Construction size={64} className="text-brand-primary mb-6" />
              <h2 className="text-2xl font-bold mb-2 capitalize">{currentPage.replace('_', ' ')} Page</h2>
              <p className="text-gray-500">This module is being improved. Check back later!</p>
            </GlassCard>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <GlobalHeader 
        showBack={currentPage !== 'DASHBOARD'} 
        onBack={() => setCurrentPage('DASHBOARD')} 
        onNavigate={(p) => setCurrentPage(p as PageType)}
      />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>

      <BottomNav 
        currentPage={currentPage} 
        onNavigate={(p) => setCurrentPage(p as PageType)} 
        role={user?.role} 
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
