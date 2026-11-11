import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuthStore } from '../store/authStore';
import { Activity, Lock, Mail, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login({ email, password });
      navigate('/patient');
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
          تسجيل الدخول إلى DPIS
        </h2>
        <p className="text-sm text-apple-text-secondary">
          الوصول إلى ملفك الصحي أو محطة العمل السريرية
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

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              id="login-email"
              label="البريد الإلكتروني"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
            />

            <Input
              id="login-password"
              label="كلمة المرور"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              className="w-full mt-2"
            >
              تسجيل الدخول
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-apple-gray-2 text-center text-xs text-apple-text-secondary">
            ليس لديك حساب؟{' '}
            <Link to="/register" className="font-semibold text-apple-blue hover:underline">
              أنشئ حسابًا الآن
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
