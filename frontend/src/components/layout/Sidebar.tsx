import React from 'react';
import { NavLink } from 'react-router-dom';
import { Users, BarChart3, FileText, Settings, ShieldCheck } from 'lucide-react';
import { clsx } from 'clsx';

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const navItems = [
    { label: 'Patient Triage', icon: Users, to: '/clinician' },
    { label: 'Model Analytics', icon: BarChart3, to: '/clinician/analytics' },
    { label: 'EHR / FHIR Sync', icon: FileText, to: '/clinician/ehr' },
    { label: 'Audit & Compliance', icon: ShieldCheck, to: '/clinician/audit' },
  ];

  return (
    <aside
      className={clsx(
        'w-64 bg-white border-r border-apple-gray-2 flex flex-col justify-between py-6 px-4',
        className
      )}
    >
      <div className="flex flex-col gap-6">
        <div className="px-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-apple-text-secondary">
            Clinical Tools
          </h2>
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/clinician'}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition',
                    isActive
                      ? 'bg-apple-blue text-white shadow-sm'
                      : 'text-apple-text-secondary hover:text-apple-text hover:bg-apple-gray'
                  )
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="p-3 bg-apple-gray rounded-2xl flex flex-col gap-1 text-xs text-apple-text-secondary">
        <span className="font-semibold text-apple-text">ADA / HL7 FHIR</span>
        <span>Standardized clinical decision guideline mode active</span>
      </div>
    </aside>
  );
};

