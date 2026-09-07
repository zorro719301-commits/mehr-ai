import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

interface AuthPageProps {
  onSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const ok = await login(email, password);
      if (ok) {
        onSuccess();
      } else {
        setError('Login yoki parol noto‘g‘ri. Ma’lumotlar bosh administrator tomonidan berilgan bo‘lishi kerak.');
      }
    } catch {
      setError('Tizimga kirishda xatolik yuz berdi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-card space-y-6">
        <div className="text-center space-y-2">
          <img src="/images/logo-icon.png" alt="MEHR AI" className="w-14 h-14 object-contain mx-auto" />
          <h2 className="text-2xl font-extrabold text-slate-900">Tizimga Kirish</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Hodimlar va ota-onalar faqat bosh administrator tomonidan berilgan login va parol orqali tizimga kiradi.
          </p>
        </div>

        <div className="flex items-start space-x-2 p-3 bg-brand-50 border border-brand-100 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-brand-600 mt-0.5 flex-shrink-0" />
          <p className="text-[11px] text-brand-800 leading-relaxed">
            Login ma’lumotlaringiz yo‘qolgan yoki hisobingiz mavjud bo‘lmasa, iltimos MEHR AI administratoriga murojaat qiling.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Login (Email)</label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3" />
              <input
                type="email"
                required
                autoComplete="username"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-3 outline-none focus:bg-white focus:border-brand-500 text-slate-800 font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ism.familiya@mehr.uz"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Parol</label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
              <input
                type="password"
                required
                autoComplete="current-password"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-3 outline-none focus:bg-white focus:border-brand-500 text-slate-800 font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-card flex items-center justify-center space-x-2 transition-all disabled:opacity-60"
          >
            <span>{loading ? 'Tekshirilmoqda...' : 'Kirish'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
