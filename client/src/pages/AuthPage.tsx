import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { Lock, Mail, ArrowRight, ShieldCheck, Stethoscope, Heart, Eye, EyeOff } from 'lucide-react';

interface AuthPageProps {
  onSuccess: () => void;
}

interface RoleCredential {
  roleName: string;
  roleBadge: string;
  badgeBg: string;
  icon: any;
  email: string;
  pass: string;
  desc: string;
}

const DEMO_CREDENTIALS: RoleCredential[] = [
  {
    roleName: 'Bosh Administrator',
    roleBadge: 'Super Admin',
    badgeBg: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: ShieldCheck,
    email: 'admin@mehr.uz',
    pass: 'Password123!',
    desc: 'Yangi xodimlar hisobini ochish, login-parollarni tarqatish, audit va tizim xavfsizligi nazorati.',
  },
  {
    roleName: 'Bolalar Nevrologi / Mutaxassis',
    roleBadge: 'Klinik Shifokor',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: Stethoscope,
    email: 'dr.nodira@mehr.uz',
    pass: 'Password123!',
    desc: 'Bolani ko‘rikdan o‘tkazish, GMFCS/MACS/CFCS tasnifi, dori retsepti yozish va AI rejalarini tasdiqlash.',
  },
  {
    roleName: 'Ota-ona / Vasiy',
    roleBadge: 'Oila / Vasiy',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Heart,
    email: 'dilnoza@mehr.uz',
    pass: 'Password123!',
    desc: 'Bolani ro‘yxatdan o‘tkazish, kunlik 15 daqiqalik mashg‘ulotlar, 24-soatlik jadval va dori qabuli monitoringi.',
  },
];

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSelectRole = (cred: RoleCredential) => {
    setEmail(cred.email);
    setPassword(cred.pass);
    setError('');
  };

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
      setError('Tizimga kirishda xatolik yuz berdi. Iltimos qaytadan urinib ko‘ring.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-brand-600" />
          <span>Xavfsiz Tibbiy Identifikatsiya Tizimi</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          MEHR AI Platformasiga Kirish
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          Tizim xavfsizligi va bolalarning shaxsiy-klinik ma'lumotlari himoyasi uchun ochiq ro‘yxatdan o‘tish cheklangan.
          Har bir xodim va ota-onaga kirish ma’lumotlari (login va parol) <strong>Bosh Administrator</strong> tomonidan beriladi.
        </p>
      </div>

      {/* Role Selection / Quick-Fill Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
          <span>Bosh admin tomonidan berilgan hisoblar (Tezkor tanlash):</span>
          <span className="text-brand-600">Kartani bosing</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {DEMO_CREDENTIALS.map((cred) => {
            const Icon = cred.icon;
            const isSelected = email.toLowerCase() === cred.email.toLowerCase();
            return (
              <button
                key={cred.email}
                type="button"
                onClick={() => handleSelectRole(cred)}
                className={`text-left p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-brand-50/70 border-brand-500 ring-2 ring-brand-200 shadow-md scale-[1.01]'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${cred.badgeBg}`}>
                      {cred.roleBadge}
                    </span>
                    <Icon className="w-4 h-4 text-slate-600" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900">{cred.roleName}</h3>
                  <p className="text-[11px] text-slate-500 leading-snug">{cred.desc}</p>
                </div>

                <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-600 font-mono">
                  <span>{cred.email}</span>
                  <span className="text-brand-600 font-bold">Tanlash →</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Login Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card max-w-md mx-auto space-y-6">
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
            <Lock className="w-5 h-5 text-brand-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Shaxsiy Hisobga Kirish</h2>
            <p className="text-xs text-slate-400">Login va parolingizni kiriting</p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl font-medium flex items-start space-x-2">
            <span className="font-bold">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Login / Email (Bosh admin bergan)</span>
              <span className="text-[10px] text-slate-400 font-normal">Masalan: admin yoki dr.nodira@mehr.uz</span>
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                required
                autoComplete="username"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-3 outline-none focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100 text-slate-800 font-medium transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Login yoki email"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Parol</span>
              <span className="text-[10px] text-slate-400 font-normal">Maxfiy kalit</span>
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-3 outline-none focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100 text-slate-800 font-medium transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white font-bold text-sm shadow-card flex items-center justify-center space-x-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <span>{loading ? 'Tekshirilmoqda...' : 'Platformaga kirish'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 text-center text-[11px] text-slate-400">
          Agar login ma’lumotingiz mavjud bo‘lmasa yoki parolni unutgan bo‘lsangiz, muassasa bosh administratoriga murojaat qiling.
        </div>
      </div>
    </div>
  );
};
