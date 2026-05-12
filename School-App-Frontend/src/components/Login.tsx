/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, GraduationCap } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { GlassCard, GlassInput, GradientButton } from './UI';

export const Login: React.FC = () => {
  const { login, error: authError } = useAppContext();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login({ identifier, password, role });
    } catch (err) {
      // Error handled in AppContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 overflow-hidden">
      {/* Animated Background Orbs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute -top-20 -left-20 w-80 h-80 bg-brand-primary/10 blur-[100px] rounded-full"
      />
      <motion.div
        animate={{ scale: [1.2, 1, 1.2], x: [0, -40, 0], y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-20 -right-20 w-96 h-96 bg-brand-secondary/10 blur-[100px] rounded-full"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <GlassCard className="!p-8" hoverScale={false}>
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-brand-primary/20">
              <GraduationCap className="text-white w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">ByteBuilders School</h1>
            <p className="text-gray-500 text-sm">School Management System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Login</h2>
            
            {authError && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl font-medium">
                {authError}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Login As</label>
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 backdrop-blur-md border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all text-sm font-medium"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Administrator</option>
                <option value="parent">Parent</option>
              </select>
            </div>

            <GlassInput
              label={role === 'parent' ? "Phone Number" : role === 'teacher' ? "Email / Employee ID" : "Email / Roll No"}
              type="text"
              placeholder={role === 'parent' ? "Enter phone number" : role === 'teacher' ? "Enter email or employee ID" : "Enter email or roll number"}
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              icon={<Mail size={20} />}
            />

            <div className="space-y-1">
              <GlassInput
                label="Password"
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock size={20} />}
              />
            </div>

            <GradientButton type="submit" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </GradientButton>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
};
