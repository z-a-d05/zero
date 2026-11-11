import React, { useState } from 'react';
import { PatientListItem, RiskLevel } from '../../types';
import { Badge } from '../ui/Badge';
import { Search, ArrowUpDown, Filter } from 'lucide-react';
import { clsx } from 'clsx';

interface PatientListProps {
  patients: PatientListItem[];
  selectedPatientId?: string;
  onSelectPatient: (id: string) => void;
  isLoading?: boolean;
}

export const PatientList: React.FC<PatientListProps> = ({
  patients,
  selectedPatientId,
  onSelectPatient,
  isLoading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortByRisk, setSortByRisk] = useState(true);

  // تصفية وفرز
  const filtered = patients
    .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortByRisk) {
        return b.latestRiskScore - a.latestRiskScore;
      }
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="flex flex-col h-full bg-white border-r border-apple-gray-2 w-full lg:w-96 flex-shrink-0">
      {/* رأس أدوات البحث والفرز */}
      <div className="p-4 border-b border-apple-gray-2 flex flex-col gap-3 sticky top-0 bg-white z-10">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold tracking-tight text-apple-text">
            فرز المرضى ({filtered.length})
          </span>
          <button
            onClick={() => setSortByRisk(!sortByRisk)}
            className="flex items-center gap-1 text-xs font-semibold text-apple-blue hover:text-blue-700 transition"
            title="تبديل معيار الفرز"
          >
            <ArrowUpDown size={14} />
            {sortByRisk ? 'حسب درجة الخطر' : 'أبجديًا'}
          </button>
        </div>

        {/* مدخل البحث */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-2.5 text-apple-text-secondary" />
          <input
            type="text"
            placeholder="البحث باسم المريض أو رقم الهوية..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-apple-gray rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-apple-blue/20"
          />
        </div>
      </div>

      {/* صفوف المرضى */}
      <div className="flex-1 overflow-y-auto divide-y divide-apple-gray-2">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-apple-text-secondary">
            جاري تحميل قائمة المرضى...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-apple-text-secondary">
            لا توجد سجلات مرضى تتوافق مع عامل التصفية الخاص بك.
          </div>
        ) : (
          filtered.map((patient) => {
            const isSelected = patient.id === selectedPatientId;
            return (
              <button
                key={patient.id}
                onClick={() => onSelectPatient(patient.id)}
                className={clsx(
                  'w-full text-left p-4 transition flex items-center justify-between gap-3',
                  isSelected
                    ? 'bg-blue-50/60 border-l-4 border-l-apple-blue'
                    : 'hover:bg-apple-gray/60 border-l-4 border-l-transparent'
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* 처음에는 حروف أولية */}
                  <div className="w-10 h-10 rounded-full bg-apple-gray-2 flex items-center justify-center font-bold text-xs text-apple-text flex-shrink-0">
                    {patient.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-apple-text truncate">
                      {patient.name}
                    </span>
                    <span className="text-xs text-apple-text-secondary">
                      {patient.age} سنة • آخر زيارة: {patient.lastVisit}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <Badge level={patient.riskLevel} size="sm" />
                  <span className="text-xs font-bold text-apple-text">
                    {(patient.latestRiskScore * 100).toFixed(0)}%
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
