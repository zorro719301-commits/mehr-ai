import React from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import {
  Heart,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Brain,
  MessageCircle,
  Activity,
  Users,
  Calendar,
  Lock,
  Smartphone,
  ChevronRight
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { user, quickLogin } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="space-y-24 py-6">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 rounded-3xl bg-gradient-to-b from-brand-50/80 via-white to-slate-50 border border-brand-100 shadow-soft px-4 sm:px-10">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-brand-100/70 border border-brand-200 text-brand-800 text-xs font-bold uppercase tracking-wider shadow-sm animate-pulse">
            <Sparkles className="w-4 h-4 text-brand-600 fill-brand-600" />
            <span>2026-YIL PEDIATRIK AI VA RAQAMLI REABILITATSIYA EKOTIZIMI</span>
          </div>

          {/* Main Title & Slogan */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
              MEHR AI
            </h1>
            <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-brand-700 via-brand-600 to-emerald-600 bg-clip-text text-transparent">
              “{t.slogan}”
            </p>
          </div>

          {/* Subtext */}
          <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            {t.subtext}
          </p>

          {/* 3 Main Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onNavigate(user ? 'dashboard' : 'assessment')}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-bold text-base shadow-card flex items-center space-x-2 hover:scale-[1.02] transition-all"
            >
              <span>{t.actions.start}</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <a
              href="#how-it-works"
              className="px-6 py-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-base shadow-sm transition-all"
            >
              {t.actions.howItWorks}
            </a>

            <button
              onClick={() => quickLogin('SPECIALIST').then(() => onNavigate('specialist'))}
              className="px-6 py-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-semibold text-base transition-all"
            >
              {t.actions.loginAsSpecialist}
            </button>
          </div>

          {/* FAST DEMO LOGIN SWITCHER */}
          <div className="pt-8 border-t border-slate-200/80 max-w-2xl mx-auto">
            <div className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-3">
              Tezkor sinov uchun demo profillar (1-klik bilan kirish):
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-left">
              <button
                onClick={() => quickLogin('PARENT').then(() => onNavigate('dashboard'))}
                className="p-3 rounded-xl bg-white border border-slate-200 hover:border-brand-500 hover:shadow-md transition-all group"
              >
                <div className="text-xs font-bold text-slate-800 group-hover:text-brand-600">Dilnoza Karimova</div>
                <div className="text-[11px] text-brand-600 font-semibold">Ota-ona (Jasurning onasi)</div>
                <div className="text-[10px] text-slate-400 mt-1">4 yosh, ASD + Nutq kechikishi</div>
              </button>

              <button
                onClick={() => quickLogin('SPECIALIST').then(() => onNavigate('specialist'))}
                className="p-3 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all group"
              >
                <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-600">Dr. Nodira Rahimova</div>
                <div className="text-[11px] text-emerald-600 font-semibold">Bolalar nevrologi / Shifokor</div>
                <div className="text-[10px] text-slate-400 mt-1">Klinik tekshirish va tasdiqlash</div>
              </button>

              <button
                onClick={() => quickLogin('ADMIN').then(() => onNavigate('admin'))}
                className="p-3 rounded-xl bg-white border border-slate-200 hover:border-purple-500 hover:shadow-md transition-all group"
              >
                <div className="text-xs font-bold text-slate-800 group-hover:text-purple-600">Administrator</div>
                <div className="text-[11px] text-purple-600 font-semibold">Tizim boshqaruvi</div>
                <div className="text-[10px] text-slate-400 mt-1">Kasalliklar katalogi & audit loglar</div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4 CORE PILLARS OF MEHR AI */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            MEHR AI Platformasining 4 Asosiy Ustuni
          </h2>
          <p className="text-slate-600">
            Oddiy CRUD emas, balki bolaning har bir qadamini tahlil qiluvchi va yangilovchi yopiq klinik tsikl.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-soft hover:shadow-card transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-brand-600 flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">1. Digital Assessment</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Kognitiv, nutq, motor, ijtimoiy, ADL va xulq-atvor bo‘yicha 0–5 standart balli strukturaviy klinik baholash.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-soft hover:shadow-card transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">2. AI Individual Paket</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              13 bosqichli AI algoritmi: 30 kunlik reja, kunlik 15 daqiqalik vazifalar, AAC ko‘rsatmalari va haftalik maqsadlar.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-soft hover:shadow-card transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">3. Continuous Monitoring</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Har bir mashg‘ulot natijasi, ota-ona izohlari, yordam darajasi va ABC xulq-atvor kundaligi monitoringi.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-soft hover:shadow-card transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">4. AI Re-Planning</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              80-85% o‘zlashtirish aniqlanganda, AI avtomatik tarzda yangi bosqich rejasini tuzadi va mutaxassisga yuboradi.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS / STEP-BY-STEP UX FLOW */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-14 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs uppercase font-extrabold tracking-widest text-brand-400">
              MEHR AI QANDAY ISHLAYDI?
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Bemor va Oila Uchun 12 Bosqichli Raqamli Yo‘l
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
            {[
              { step: '01', title: 'Ro‘yxatdan o‘tish', desc: 'Ota-ona yoki mutaxassis shaxsiy hisobini yaratadi' },
              { step: '02', title: 'Bola profilini kiritish', desc: 'Umumiy ma’lumotlar, rasm va ota-ona roziligi' },
              { step: '03', title: 'Tibbiy ma’lumotlar', desc: 'Mavjud tashxislar, dorilar va shifokor ko‘rsatmalari' },
              { step: '04', title: 'Raqamli baholash', desc: '6 ta soha bo‘yicha 0–5 balli mezonlarni belgilash' },
              { step: '05', title: 'AI tahlil boshlash', desc: 'AI ma’lumotlarni tahlil qilib, ehtiyojlarni saralaydi' },
              { step: '06', title: 'Individual paket yaratilishi', desc: '30 kunlik 15 daqiqalik o‘yin va AAC dasturi' },
              { step: '07', title: 'Mutaxassis tasdig‘i', desc: 'Shifokor yoki logoped rejani ko‘rib chiqadi va tasdiqlaydi' },
              { step: '08', title: 'Kunlik mashg‘ulot', desc: 'Ota-ona ko‘rsatmalar asosida bolasi bilan shug‘ullanadi' },
              { step: '09', title: 'Natijani qayd etish', desc: 'Mustaqillik darajasi va bolaning reaksiyasi kiritiladi' },
              { step: '10', title: 'Xulq-atvor (ABC) tahlili', desc: 'AI triggerlarni aniqlab, xavfsiz strategiya beradi' },
              { step: '11', title: 'Progress monitoringi', desc: 'Radar va dinamik grafiklar orqali rivojlanishni ko‘rish' },
              { step: '12', title: 'AI Re-Planning', desc: 'Natijalar yaxshilangach, reja yangi bosqichga ko‘tariladi' },
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <span className="text-brand-400 font-extrabold text-sm">{item.step}</span>
                <h4 className="font-bold text-white text-sm">{item.title}</h4>
                <p className="text-slate-400 leading-normal">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLINICAL SAFETY & ETHICS */}
      <section className="max-w-5xl mx-auto px-4 text-center space-y-4">
        <div className="inline-flex items-center space-x-2 text-amber-700 bg-amber-50 px-4 py-2 rounded-full border border-amber-200 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          <span>TIBBIY VA ETIK STANDARTLAR</span>
        </div>
        <h3 className="text-2xl font-bold text-slate-900">
          Sun’iy Intellekt Inson O‘rnini Bosmaydi — Balki Unga Kuch Bag‘ishlaydi
        </h3>
        <p className="text-slate-600 text-sm max-w-2xl mx-auto leading-relaxed">
          MEHR AI bolaning kasalligiga mustaqil tashxis qo‘ymaydi va dori belgilamaydi. Tizim reabilitatsiya jarayonini tizimlashtirish, ota-onalarni amaliy mashg‘ulotlar bilan qurollantirish va mutaxassislarga aniq ma’lumotlar bilan yordam berish uchun ishlab chiqilgan.
        </p>
      </section>
    </div>
  );
};
