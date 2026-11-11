import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Activity, LogOut, User as UserIcon, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isPatientActive = location.pathname.startsWith('/patient');
  const isClinicianActive = location.pathname.startsWith('/clinician');

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-apple-gray-2 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* الشعار */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-apple-blue flex items-center justify-center text-white shadow-sm transition group-hover:scale-105">
            <Activity size={20} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base leading-tight tracking-tight text-apple-text">
              DPIS
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-apple-text-secondary">
              الذكاء السريري
            </span>
          </div>
        </Link>

        {/* روابط التنقل */}
        <nav className="hidden md:flex items-center gap-1 bg-apple-gray p-1 rounded-xl">
          <Link
            to="/patient"
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
              isPatientActive
                ? 'bg-white text-apple-text shadow-sm'
                : 'text-apple-text-secondary hover:text-apple-text'
            }`}
          >
            بوابة المريض
          </Link>
          <Link
            to="/clinician"
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
              isClinicianActive
                ? 'bg-white text-apple-text shadow-sm'
                : 'text-apple-text-secondary hover:text-apple-text'
            }`}
          >
            لوحة الطبيب
          </Link>
        </nav>

        {/* الجانب الأيمن: الملف الشخصي / الإجراءات */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-apple-gray border border-apple-gray-2">
                <div className="w-6 h-6 rounded-full bg-apple-blue/10 text-apple-blue flex items-center justify-center text-xs font-semibold">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-medium text-apple-text">{user.name || user.email}</span>
                  <span className="text-[10px] capitalize text-apple-text-secondary">{user.role}</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-apple-text-secondary hover:text-apple-red hover:bg-red-50 transition"
                title="تسجيل الخروج"
                aria-label="تسجيل الخروج"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  تسجيل الدخول
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  البدء الآن
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
