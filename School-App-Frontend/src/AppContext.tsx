/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from './api';
import { 
  User, RequestItem, Expense, GatePass, 
  AttendanceRecord, FeeRecord, Student, Teacher, 
  Assignment, Notice, AppNotification, UserRole 
} from './types';

interface AppContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: any) => Promise<void>;
  logout: () => void;
  notifications: AppNotification[];
  addNotification: (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  students: Student[];
  teachers: Teacher[];
  addStudent: (data: any) => Promise<void>;
  updateStudent: (id: string, data: any) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  addTeacher: (data: any) => Promise<void>;
  updateTeacher: (id: string, data: any) => Promise<void>;
  deleteTeacher: (id: string) => Promise<void>;
  attendance: AttendanceRecord[];
  fees: FeeRecord[];
  requests: RequestItem[];
  addRequest: (req: Omit<RequestItem, 'id' | 'status' | 'createdAt'>) => void;
  updateRequestStatus: (id: string, status: 'APPROVED' | 'REJECTED') => void;
  expenses: Expense[];
  addExpense: (exp: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;
  gatePasses: GatePass[];
  addGatePass: (pass: Omit<GatePass, 'id' | 'status'>) => void;
  timetable: Record<string, any[]>;
  assignments: Assignment[];
  notices: Notice[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [gatePasses, setGatePasses] = useState<GatePass[]>([]);
  const [timetable, setTimetable] = useState<Record<string, any[]>>({});
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);

  useEffect(() => {
    if (user) {
      fetchInitialData();
    }
  }, [user]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [
        notifsRes, 
        studentsRes, 
        teachersRes, 
        requestsRes,
        attendanceRes,
        feesRes,
        timetableRes
      ] = await Promise.allSettled([
        api.get('/notifications/mine'),
        api.get('/students/search'),
        api.get('/admin/teachers/all'),
        api.get(user?.role === 'ADMIN' ? '/doc-requests/all' : user?.role === 'TEACHER' ? '/doc-requests/teacher' : '/doc-requests/student'),
        api.get('/attendance/admin/stats'),
        api.get('/admin/fees/all'),
        api.get('/timetable/all')
      ]);

      if (notifsRes.status === 'fulfilled') {
        const nData = notifsRes.value.data.notifications || notifsRes.value.data || [];
        const normalizedNotifs = (Array.isArray(nData) ? nData : []).map((n: any) => ({
          ...n,
          id: n._id || n.id,
          role: Array.isArray(n.role) ? n.role : [n.recipientModel?.toUpperCase() || 'STUDENT'],
          read: n.isRead || n.read || false
        }));
        setNotifications(normalizedNotifs);
      }
      
      if (studentsRes.status === 'fulfilled') {
        const studentsData = studentsRes.value.data.students || studentsRes.value.data;
        const normalizedStudents = (Array.isArray(studentsData) ? studentsData : []).map((s: any) => ({
          id: s._id,
          name: s.name,
          rollNo: s.rollNumber || s.rollNo,
          class: s.class,
          attendance: s.attendance || 0,
          status: s.status || 'Active'
        }));
        setStudents(normalizedStudents);
      }

      if (teachersRes.status === 'fulfilled') {
        const teachersData = teachersRes.value.data.teachers || teachersRes.value.data;
        setTeachers((Array.isArray(teachersData) ? teachersData : []).map((t: any) => ({
          ...t,
          id: t._id,
          subject: t.subjects?.[0] || 'Teacher'
        })));
      }

      if (requestsRes.status === 'fulfilled') {
        const rData = requestsRes.value.data;
        setRequests(rData.data || rData.requests || (Array.isArray(rData) ? rData : []));
      }
      
      if (attendanceRes.status === 'fulfilled') {
        const aData = attendanceRes.value.data;
        const attArray = aData.data || aData.attendance || (Array.isArray(aData) ? aData : []);
        setAttendance(Array.isArray(attArray) ? attArray : []);
      }

      if (feesRes.status === 'fulfilled') {
        const fData = feesRes.value.data;
        const normalizedFees = (fData.data || fData.fees || (Array.isArray(fData) ? fData : [])).map((f: any) => ({
          id: f._id,
          studentId: f.student?._id || f.student,
          amount: f.totalPayable || f.amount || (f.tuitionFee + f.transportFee + f.developmentFee) || 0,
          status: (f.status || 'PENDING').toUpperCase(),
          dueDate: f.dueDate
        }));
        setFees(normalizedFees);
      }

      if (timetableRes.status === 'fulfilled') {
        const rawTT = timetableRes.value.data.timetables || [timetableRes.value.data.timetable].filter(Boolean);
        const normalizedTT: Record<string, any[]> = {};
        rawTT.forEach((dayData: any) => {
          if (dayData && dayData.day) {
            normalizedTT[dayData.day.substring(0, 3)] = (dayData.periods || []).map((p: any) => ({
              id: p._id,
              startTime: p.startTime,
              endTime: p.endTime,
              subject: p.subject,
              teacher: p.teacher?.name || 'Assigned Teacher',
              room: p.room || 'N/A'
            }));
          }
        });
        setTimetable(normalizedTT);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/login', credentials);
      const { token, user: userData, profile } = res.data;
      
      if (!userData) {
        throw new Error('User data not found in response');
      }

      localStorage.setItem('token', token);
      
      const normalizedUser: User = {
        id: userData._id,
        name: profile?.name || userData.name || 'User',
        email: userData.email,
        role: (userData.role || 'student').toUpperCase() as UserRole,
        avatar: profile?.profileImage || profile?.avatar,
        rollNo: profile?.rollNumber || profile?.rollNo,
        class: profile?.class,
        phone: profile?.phone,
        employeeId: profile?.employeeId,
        qualification: profile?.qualification,
        experience: profile?.experience,
        subjects: profile?.subjects,
        assignedClasses: profile?.classes
      };
      
      setUser(normalizedUser);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
    } catch (err: any) {
      console.error('Login Error:', err);
      setError(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setNotifications([]);
    setStudents([]);
    setTeachers([]);
    setAttendance([]);
    setFees([]);
    setRequests([]);
    setExpenses([]);
    setGatePasses([]);
    setTimetable({});
    setAssignments([]);
    setNotices([]);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const addNotification = (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const addStudent = async (studentData: any) => {
    try {
      const res = await api.post('/students/add', studentData);
      setStudents(prev => [...prev, { ...res.data, id: res.data._id }]);
    } catch (err) {
      console.error('Error adding student:', err);
    }
  };

  const updateStudent = async (id: string, data: any) => {
    try {
      const res = await api.put(`/students/update/${id}`, data);
      setStudents(prev => prev.map(s => s.id === id ? { ...res.data, id: res.data._id } : s));
    } catch (err) {
      console.error('Error updating student:', err);
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      await api.delete(`/students/delete/${id}`);
      setStudents(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Error deleting student:', err);
    }
  };

  const addTeacher = async (teacherData: any) => {
    try {
      const res = await api.post('/admin/teachers/create', teacherData);
      setTeachers(prev => [...prev, { ...res.data.teacher, id: res.data.teacher._id }]);
    } catch (err) {
      console.error('Error adding teacher:', err);
    }
  };

  const updateTeacher = async (id: string, data: any) => {
    try {
      const res = await api.put(`/admin/teachers/update/${id}`, data);
      setTeachers(prev => prev.map(t => t.id === id ? { ...res.data.teacher, id: res.data.teacher._id } : t));
    } catch (err) {
      console.error('Error updating teacher:', err);
    }
  };

  const deleteTeacher = async (id: string) => {
    try {
      await api.delete(`/admin/teachers/delete/${id}`);
      setTeachers(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Error deleting teacher:', err);
    }
  };

  const addRequest = (req: Omit<RequestItem, 'id' | 'status' | 'createdAt'>) => {
    const newRequest: RequestItem = {
      ...req,
      id: Math.random().toString(36).substr(2, 9),
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    setRequests(prev => [newRequest, ...prev]);
  };

  const updateRequestStatus = (id: string, status: 'APPROVED' | 'REJECTED') => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const addExpense = (exp: Omit<Expense, 'id'>) => {
    const newExpense: Expense = { ...exp, id: Math.random().toString(36).substr(2, 9) };
    setExpenses(prev => [newExpense, ...prev]);
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const addGatePass = (pass: Omit<GatePass, 'id' | 'status'>) => {
    const newPass: GatePass = {
      ...pass,
      id: Math.random().toString(36).substr(2, 9),
      status: 'PENDING'
    };
    setGatePasses(prev => [newPass, ...prev]);
  };

  return (
    <AppContext.Provider value={{ 
      user, loading, error, login, logout,
      notifications, addNotification, markNotificationAsRead, markAllAsRead, clearNotifications,
      students, teachers, addStudent, updateStudent, deleteStudent, addTeacher, updateTeacher, deleteTeacher,
      attendance, fees, requests, addRequest, updateRequestStatus,
      expenses, addExpense, deleteExpense, gatePasses, addGatePass,
      timetable, assignments, notices
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
