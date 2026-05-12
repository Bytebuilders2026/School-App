/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  rollNo?: string;
  class?: string;
  avatar?: string;
  phone?: string;
  employeeId?: string;
  qualification?: string;
  experience?: number;
  subjects?: string[];
  assignedClasses?: Array<{ class: string, section: string }>;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  subject?: string;
}

export interface RequestItem {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  type: 'LEAVE' | 'DOCUMENT';
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  dateRange?: string; // For leave
  documentType?: string; // For document request
  file?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  category: 'TEACHER_SALARY' | 'BUS_DRIVER_SALARY' | 'STAFF_SALARY' | 'TRIP' | 'OTHER';
  name: string;
  amount: number;
  date: string;
  status: 'PAID' | 'PENDING';
}

export interface GatePass {
  id: string;
  parentName: string;
  studentName: string;
  studentClass: string;
  reason: string;
  date: string;
  time: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface FeeRecord {
  id: string;
  studentId: string;
  type: 'SCHOOL' | 'TRIP';
  amount: number;
  status: 'PAID' | 'PENDING';
  dueDate: string;
}

export interface AppNotification {
  id: string;
  type: 'LEAVE' | 'FEE' | 'NOTICE' | 'DOCUMENT';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  role: UserRole[]; // Who should see this?
  userId?: string; // If specific to a user
  targetPage?: string; // Where to redirect on click
}
