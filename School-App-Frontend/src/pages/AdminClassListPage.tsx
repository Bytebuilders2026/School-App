/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Users, BookOpen, ChevronRight, 
  CheckCircle2, AlertCircle, LayoutGrid
} from 'lucide-react';
import { useAppContext } from '../AppContext';
import { GlassCard, SectionHeader } from '../components/UI';

interface AdminClassListPageProps {
  onBack: () => void;
  onSelectClass: (className: string) => void;
}

interface ClassStat {
  name: string;
  total: number;
  active: number;
  inactive: number;
  sections: Record<string, number>;
}

export const AdminClassListPage: React.FC<AdminClassListPageProps> = ({ onBack, onSelectClass }) => {
  const { students } = useAppContext();

  // Extract unique classes and calculate stats
  const classStats = students.reduce((acc, student) => {
    const rawClass = student.class || 'Unassigned';
    const [baseClass] = rawClass.split(' ');

    if (!acc[baseClass]) {
      acc[baseClass] = {
        name: baseClass,
        total: 0,
        active: 0,
        inactive: 0,
        sections: {}
      };
    }
    
    acc[baseClass].total += 1;
    if (student.status === 'Active') acc[baseClass].active += 1;
    else acc[baseClass].inactive += 1;

    acc[baseClass].sections[rawClass] = (acc[baseClass].sections[rawClass] || 0) + 1;
    
    return acc;
  }, {} as Record<string, ClassStat>);

  const classes = (Object.values(classStats) as ClassStat[]).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <SectionHeader 
          title="Student Directory"
          subtitle="Class-based hierarchical management system"
          onBack={onBack}
          icon={<LayoutGrid size={28} />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {classes.map((cls) => (
          <GlassCard 
            key={cls.name} 
            onClick={() => onSelectClass(cls.name)}
            className="!p-0 overflow-hidden group cursor-pointer hover:border-brand-primary/30 transition-all border-transparent"
          >
            <div className="p-8 bg-gray-50/50 border-b border-gray-100 flex justify-between items-start">
               <div>
                  <h3 className="text-3xl font-black text-gray-900 group-hover:text-brand-primary transition-colors tracking-tight">{cls.name}</h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Class Overview</p>
               </div>
               <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-primary shadow-sm group-hover:scale-110 transition-transform">
                  <BookOpen size={24} />
               </div>
            </div>

            <div className="p-8 space-y-6">
               <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Enrollment</p>
                    <p className="text-2xl font-black text-gray-900">{cls.total} Students</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1.5 mb-1">
                       <CheckCircle2 size={12} className="text-green-500" />
                       <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{cls.active} Active</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                       <AlertCircle size={12} className="text-red-400" />
                       <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{cls.inactive} Inactive</span>
                    </div>
                  </div>
               </div>

               <div className="space-y-3">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sections</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(cls.sections).map(([section, count]) => (
                      <button 
                        key={section}
                        onClick={(e) => { e.stopPropagation(); onSelectClass(section); }}
                        className="px-4 py-2 bg-white border border-gray-100 rounded-xl flex items-center gap-2 hover:border-brand-primary/50 hover:bg-brand-light/10 transition-all shadow-sm group/btn"
                      >
                         <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest group-hover/btn:text-brand-primary">{section}</span>
                         <div className="w-1.5 h-1.5 rounded-full bg-gray-200 group-hover/btn:bg-brand-primary" />
                         <span className="text-[11px] font-bold text-gray-400 group-hover/btn:text-brand-primary/70">{count as number}</span>
                      </button>
                    ))}
                  </div>
               </div>

               <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Attendance Health</span>
                    <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">92.4%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white rounded-full overflow-hidden border border-gray-100">
                    <div 
                      className="h-full bg-brand-primary rounded-full" 
                      style={{ width: `92.4%` }} 
                    />
                  </div>
               </div>
            </div>

            <div className="px-8 py-5 flex items-center justify-between bg-white group-hover:bg-brand-light transition-colors">
               <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Manage Students</span>
               <ChevronRight size={18} className="text-brand-primary" />
            </div>
          </GlassCard>
        ))}

        {classes.length === 0 && (
          <div className="col-span-full py-20 text-center">
             <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center text-gray-300 mx-auto mb-6">
                <Users size={40} />
             </div>
             <h3 className="text-xl font-bold text-gray-900">No Classes Found</h3>
             <p className="text-gray-500 text-sm mt-2">Add students to see class hierarchies here.</p>
          </div>
        )}
      </div>
    </div>
  );
};
