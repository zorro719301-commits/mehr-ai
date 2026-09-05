import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { Heart, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

interface AuthPageProps {
  onSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const { login, quickLogin } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('dilnoza@mehr.uz');
  const [password, setPassword] = useState('Password123!');
  const [fullName, setFullName] = useState('');
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
        setError('Email yoki parol noto‘g‘ri. Iltimos, tekshirib qayta kiriting.');
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
          <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto shadow-sm">
            <Heart className="w-6 h-6 fill-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">
            {isRegister ? 'Hisob Yaratish' : 'Tizimga Kirish'}
          </h2>
          <p className="text-xs text-slate-500">
            MEHR AI individual rivojlantirish va ota-ona ko‘mak platformasi
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        {/* Demo fast buttons */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="text-[11px] font-bold text-slate-400 uppercase text-center">
            Tezkor sinov uchun demo hisoblar:
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => quickLogin('PARENT').then(onSuccess)}
              className="py-2 px-1 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold rounded-xl border border-brand-200"
            >
              Dilnoza (Ona)
            </button>
            <button
              type="button"
              onClick={() => quickLogin('SPECIALIST').then(onSuccess)}
              className="py-2 px-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl border border-emerald-200"
            >
              Dr. Nodira
            </button>
            <button
              type="button"
              onClick={() => quickLogin('ADMIN').then(onSuccess)}
              className="py-2 px-1 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-xl border border-purple-200"
            >
              Admin
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Email Manzil</label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3" />
              <input
                type="email"
                required
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-3 outline-none focus:bg-white focus:border-brand-500 text-slate-800 font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dilnoza@mehr.uz"
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
            className="w-full py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-card flex items-center justify-center space-x-2 transition-all"
          >
            <span>{loading ? 'Tekshirilmoqda...' : 'Kirish'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2">
          <span className="text-xs text-slate-400">
            Parol: <code className="text-slate-600 font-mono">Password123!</code>
          </span>
        </div>
      </div>
    </div>
  );
};
