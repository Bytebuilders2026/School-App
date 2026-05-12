/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Shield, Lock } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { UserRole } from '../types';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverScale?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick, hoverScale = true }) => {
  return (
    <motion.div
      whileHover={hoverScale && !onClick ? {} : hoverScale ? { y: -4, shadow: "0 20px 40px -4px rgba(16,185,129,0.12)" } : {}}
      whileTap={onClick ? { scale: 0.97 } : {}}
      onClick={onClick}
      className={`glass-card rounded-[24px] p-6 sm:p-8 ${className} ${onClick ? 'cursor-pointer active:bg-brand-light/50' : ''}`}
    >
      {children}
    </motion.div>
  );
};

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  label?: string;
}

export const GlassInput: React.FC<GlassInputProps> = ({ icon, label, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-widest">{label}</label>}
      <div className="relative group">
        {icon && (
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-primary group-focus-within:text-brand-secondary transition-colors">
            {icon}
          </div>
        )}
        <input
          className={`glass-input w-full min-h-[52px] ${icon ? 'pl-14' : 'px-6'} pr-6 rounded-2xl text-gray-900 font-medium placeholder:text-gray-400 focus:bg-white transition-all ${className}`}
          {...props}
        />
      </div>
    </div>
  );
};

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const GradientButton: React.FC<GradientButtonProps> = ({ children, className = '', ...props }) => {
  return (
    <button className={`btn-primary w-full min-h-[52px] text-sm uppercase tracking-[0.1em] ${className}`} {...props}>
      {children}
    </button>
  );
};

export const SectionHeader: React.FC<{ title: string; subtitle?: string; onBack?: () => void; icon?: React.ReactNode }> = ({ title, subtitle, onBack, icon }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 sm:mb-12">
      <div className="flex items-center gap-4 sm:gap-6">
        {onBack && (
          <button 
            onClick={onBack} 
            className="w-14 h-14 flex items-center justify-center glass-card text-gray-600 hover:text-brand-primary transition-all active:scale-90 touch-target"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
        )}
        <div className="flex items-center gap-4">
          {icon && (
            <div className="hidden sm:flex w-16 h-16 bg-brand-light text-brand-primary rounded-[22px] items-center justify-center shadow-sm border border-brand-primary/5 transition-transform hover:scale-105">
              {React.cloneElement(icon as React.ReactElement, { size: 32 })}
            </div>
          )}
          <div>
            <h1 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight">{title}</h1>
            {subtitle && <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-[0.2em] mt-1.5 opacity-60">{subtitle}</p>}
          </div>
        </div>
      </div>
      <RoleBadge />
    </div>
  );
};

export const RoleBadge: React.FC = () => {
  const { user } = useAppContext();
  if (!user) return null;

  const colors: Record<UserRole, string> = {
    'ADMIN': 'bg-red-50 text-red-600 border-red-100',
    'TEACHER': 'bg-brand-light text-brand-primary border-brand-primary/10',
    'STUDENT': 'bg-blue-50 text-blue-600 border-blue-100',
    'PARENT': 'bg-purple-50 text-purple-600 border-purple-100'
  };

  return (
    <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 ${colors[user.role]}`}>
      <Shield size={14} className="opacity-70" />
      <span className="text-[10px] font-black uppercase tracking-widest leading-none">{user.role} ACCESS</span>
    </div>
  );
};

interface PermissionGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showRestricted?: boolean;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  allowedRoles, 
  children, 
  fallback = null,
  showRestricted = false 
}) => {
  const { user } = useAppContext();
  
  const isAuthorized = user && allowedRoles.includes(user.role);

  if (isAuthorized) {
    return <>{children}</>;
  }

  if (showRestricted) {
    return (
      <div className="relative group cursor-not-allowed grayscale opacity-60">
        <div className="absolute inset-x-0 bottom-full mb-2 hidden group-hover:block z-50">
          <div className="bg-gray-900 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl flex items-center gap-2">
            <Lock size={10} /> Access Restricted
          </div>
        </div>
        {children}
      </div>
    );
  }

  return <>{fallback}</>;
};
