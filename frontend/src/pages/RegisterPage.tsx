import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types';
import { Activity, AlertCircle } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('patient');

  const { register, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await register({ name, email, password, role });
      navigate(role === 'clinician' ? '/clinician' : '/patient');
    } catch {
      // Error handled in store
    }
  };

  return (
    <div className="min-h-screen bg-apple-gray flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center flex flex-col items-center gap-2">
        <div className="w-12 h-12 rounded-2xl bg-apple-blue text-white flex items-center justify-center shadow-md shadow-blue-500/20">
          <Activity size={26} />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-apple-text mt-2">
          إنشاء حساب DPIS
        </h2>
        <p className="text-sm text-apple-text-secondary">
          انضم إلى شبكتنا للذكاء السريري
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card className="p-8 bg-white border border-apple-gray-2 shadow-sm">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-apple-red flex items-center gap-2">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="reg-name"
              label="الاسم الكامل"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="د. سارة كونر أو جين دو"
            />

            <Input
              id="reg-email"
              label="البريد الإلكتروني"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
            />

            <Input
              id="reg-password"
              label="كلمة المرور (الحد الأدنى 8 أحرف)"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-apple-text">نوع الحساب</label>
              <div className="grid grid-cols-2 gap-2 bg-apple-gray p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setRole('patient')}
                  className={`py-2 text-xs font-semibold rounded-lg transition ${
                    role === 'patient'
                      ? 'bg-white text-apple-text shadow-sm'
                      : 'text-apple-text-secondary hover:text-apple-text'
                  }`}
                >
                  مريض
                </button>
                <button
                  type="button"
                  onClick={() => setRole('clinician')}
                  className={`py-2 text-xs font-semibold rounded-lg transition ${
                    role === 'clinician'
                      ? 'bg-white text-apple-text shadow-sm'
                      : 'text-apple-text-secondary hover:text-apple-text'
                  }`}
                >
                  طبيب / ممارس صحي
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              className="w-full mt-4"
            >
              إنشاء الحساب
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-apple-gray-2 text-center text-xs text-apple-text-secondary">
            لديك حساب بالفعل؟{' '}
            <Link to="/login" className="font-semibold text-apple-blue hover:underline">
              تسجيل الدخول
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
