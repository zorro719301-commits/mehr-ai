import React from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import {
  Heart,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Brain,
  Activity,
  Users,
  Calendar,
  ChevronRight,
  GraduationCap,
  HeartPulse,
  TrendingUp,
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
}

const FEATURE_STRIP = [
  { icon: GraduationCap, label: 'Individual ta‘lim', color: 'from-sky-400 to-blue-600' },
  { icon: HeartPulse, label: 'Reabilitatsiya dasturlari', color: 'from-emerald-400 to-emerald-600' },
  { icon: Brain, label: 'Psixologik qo‘llab-quvvatlash', color: 'from-violet-400 to-purple-600' },
  { icon: Users, label: 'Ijtimoiy integratsiya', color: 'from-amber-400 to-orange-500' },
  { icon: TrendingUp, label: 'AI tahlil va monitoring', color: 'from-teal-400 to-cyan-600' },
];

const TRUST_WORDS = ['BILIM', 'IMKONIYAT', 'INKLYUZIYA', 'BAXTLI KELAJAK'];

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { user, role } = useAuth();
  const { t } = useLanguage();

  const goToPlatform = () => {
    if (!user) {
      onNavigate('login');
    } else if (role === 'SPECIALIST') {
      onNavigate('specialist');
    } else if (role === 'SUPER_ADMIN' || role === 'MEDICAL_ADMIN' || role === 'AUDITOR') {
      onNavigate('admin');
    } else {
      onNavigate('dashboard');
    }
  };

  return (
    <div className="space-y-24 sm:space-y-32 py-6">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-950 via-brand-900 to-slate-900 shadow-2xl">
        {/* Gradient mesh / blob backdrop */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-500/30 rounded-full blur-3xl animate-blob" />
          <div className="absolute top-1/3 -right-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute -bottom-24 left-1/3 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-blob animation-delay-4000" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] [background-size:28px_28px]" />
        </div>

        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center px-6 sm:px-10 lg:px-16 pt-16 pb-14 lg:py-20">
          {/* LEFT: Copy & CTAs */}
          <div className="space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-brand-100 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>2026-yil pediatrik AI va raqamli reabilitatsiya ekotizimi</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.05]">
                MEHR{' '}
                <span className="bg-gradient-to-r from-brand-300 via-sky-300 to-emerald-300 bg-clip-text text-transparent">
                  AI
                </span>
              </h1>
              <p className="text-xl sm:text-2xl font-bold text-brand-100">
                &ldquo;{t.slogan}&rdquo;
              </p>
            </div>

            <p className="max-w-xl mx-auto lg:mx-0 text-base sm:text-lg text-slate-300 leading-relaxed">
              {t.subtext}
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={goToPlatform}
                className="group px-7 py-4 rounded-2xl bg-gradient-to-r from-brand-500 to-emerald-500 hover:from-brand-400 hover:to-emerald-400 text-white font-bold text-base shadow-[0_10px_40px_-10px_rgba(56,159,255,0.6)] flex items-center space-x-2 hover:scale-[1.03] active:scale-[0.98] transition-all"
              >
                <span>{t.actions.start}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <a
                href="#how-it-works"
                className="px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-base backdrop-blur-sm transition-all"
              >
                {t.actions.howItWorks}
              </a>
            </div>

            {/* Feature strip - mirrors the 5 pillar icons */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 pt-6 max-w-xl mx-auto lg:mx-0">
              {FEATURE_STRIP.map(({ icon: Icon, label, color }) => (
                <div key={label} className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-1.5">
                  <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-300 leading-tight">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Hero image */}
          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div className="absolute -inset-4 bg-gradient-to-tr from-brand-400/30 via-emerald-400/20 to-transparent rounded-[2rem] blur-2xl" />
            <div className="relative rounded-[2rem] overflow-hidden border border-white/15 shadow-2xl bg-white/5 backdrop-blur-sm">
              <img
                src="/images/hero-mehr-ai-cropped.png"
                alt="MEHR AI - AI robot nogironligi bo‘lgan bola bilan muloqotda"
                className="w-full h-full object-cover aspect-[4/3]"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div
                className="hidden w-full aspect-[4/3] items-center justify-center bg-gradient-to-br from-brand-800 to-slate-900"
              >
                <Heart className="w-20 h-20 text-white/20" />
              </div>
            </div>

            {/* Floating badge */}
            <div className="hidden sm:flex absolute -top-5 -left-5 items-center space-x-2 px-4 py-2.5 rounded-2xl bg-white shadow-xl animate-gentle-float">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span className="text-xs font-bold text-slate-800">500+ oila ishonch bildirdi</span>
            </div>

            {/* Floating AI chip */}
            <div className="hidden sm:flex absolute -bottom-5 -left-5 items-center space-x-2 px-4 py-2.5 rounded-2xl bg-slate-900 border border-white/10 shadow-xl animate-gentle-float animation-delay-2000">
              <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span className="text-xs font-bold text-white">AI tahlil real vaqtda</span>
            </div>
          </div>
        </div>

        {/* Trust word strip */}
        <div className="relative border-t border-white/10 bg-black/10 backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 px-6 py-4 text-[11px] sm:text-xs font-bold tracking-widest text-slate-300">
            {TRUST_WORDS.map((word, i) => (
              <React.Fragment key={word}>
                {i > 0 && <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />}
                <span>{word}</span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* SECURE ROLE-BASED ACCESS */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="rounded-3xl bg-white border border-slate-200 shadow-soft p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center space-x-2 text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-100 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>XAVFSIZ, ROL ASOSIDAGI KIRISH</span>
            </div>
            <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
              Platformadan foydalanish uchun har bir hodim va ota-ona bosh administrator tomonidan beriladigan
              shaxsiy login va parol bilan tizimga kiradi. O‘z-o‘zidan ro‘yxatdan o‘tish mavjud emas.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center mx-auto mb-2">
                <Heart className="w-4 h-4" />
              </div>
              <div className="text-sm font-bold text-slate-800">Ota-ona</div>
              <div className="text-[11px] text-slate-400 mt-1">Bolasining rivojlanishini kuzatadi</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                <Brain className="w-4 h-4" />
              </div>
              <div className="text-sm font-bold text-slate-800">Mutaxassis</div>
              <div className="text-[11px] text-slate-400 mt-1">Reja va xulosalarni tasdiqlaydi</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-2">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-sm font-bold text-slate-800">Administrator</div>
              <div className="text-[11px] text-slate-400 mt-1">Hisoblar va tizimni boshqaradi</div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={goToPlatform}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-card transition-all"
            >
              <span>{t.actions.start}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 4 CORE PILLARS OF MEHR AI */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-bold uppercase tracking-wider">
            Yopiq klinik tsikl
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            MEHR AI Platformasining 4 Asosiy Ustuni
          </h2>
          <p className="text-slate-600">
            Oddiy CRUD emas, balki bolaning har bir qadamini tahlil qiluvchi va yangilovchi yopiq klinik tsikl.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Activity,
              iconBg: 'bg-gradient-to-br from-sky-500 to-brand-600',
              step: '1',
              title: 'Digital Assessment',
              desc: 'Kognitiv, nutq, motor, ijtimoiy, ADL va xulq-atvor bo‘yicha 0–5 standart balli strukturaviy klinik baholash.',
            },
            {
              icon: Brain,
              iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
              step: '2',
              title: 'AI Individual Paket',
              desc: '13 bosqichli AI algoritmi: 30 kunlik reja, kunlik 15 daqiqalik vazifalar, AAC ko‘rsatmalari va haftalik maqsadlar.',
            },
            {
              icon: Calendar,
              iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
              step: '3',
              title: 'Continuous Monitoring',
              desc: 'Har bir mashg‘ulot natijasi, ota-ona izohlari, yordam darajasi va ABC xulq-atvor kundaligi monitoringi.',
            },
            {
              icon: Sparkles,
              iconBg: 'bg-gradient-to-br from-purple-500 to-fuchsia-600',
              step: '4',
              title: 'AI Re-Planning',
              desc: '80–85% o‘zlashtirish aniqlanganda, AI avtomatik tarzda yangi bosqich rejasini tuzadi va mutaxassisga yuboradi.',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="relative p-6 rounded-3xl bg-white border border-slate-200 shadow-soft hover:shadow-xl hover:-translate-y-1 transition-all space-y-4 overflow-hidden"
            >
              <span className="absolute -top-2 -right-1 text-7xl font-extrabold text-slate-50 select-none">
                {item.step}
              </span>
              <div className={`relative w-12 h-12 rounded-2xl ${item.iconBg} text-white flex items-center justify-center shadow-lg`}>
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="relative text-lg font-bold text-slate-900">{item.title}</h3>
              <p className="relative text-sm text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS / STEP-BY-STEP UX FLOW */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-slate-900 to-brand-950 text-white p-8 sm:p-14 space-y-12">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />

          <div className="relative text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs uppercase font-extrabold tracking-widest text-brand-300">
              MEHR AI qanday ishlaydi?
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Bemor va Oila Uchun 12 Bosqichli Raqamli Yo‘l
            </h2>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
            {[
              { step: '01', title: 'Platformaga kirish', desc: 'Bosh administrator bergan login va parol orqali shaxsiy kabinetga kirish' },
              { step: '02', title: 'Bolani ro‘yxatdan o‘tkazish', desc: '“Bolani ro‘yxatdan o‘tkazish” tugmasi orqali dastlabki ma’lumotlarni kiritish' },
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
              <div
                key={idx}
                className="group p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-400/50 hover:bg-white/10 space-y-2 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-brand-400 font-extrabold text-sm">{item.step}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all" />
                </div>
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
        <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Sun’iy Intellekt Inson O‘rnini Bosmaydi — Balki Unga Kuch Bag‘ishlaydi
        </h3>
        <p className="text-slate-600 text-sm max-w-2xl mx-auto leading-relaxed">
          MEHR AI bolaning kasalligiga mustaqil tashxis qo‘ymaydi va dori belgilamaydi. Tizim reabilitatsiya jarayonini tizimlashtirish, ota-onalarni amaliy mashg‘ulotlar bilan qurollantirish va mutaxassislarga aniq ma’lumotlar bilan yordam berish uchun ishlab chiqilgan.
        </p>
      </section>

      {/* FINAL CTA BANNER */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-brand-600 via-brand-700 to-emerald-700 px-6 sm:px-14 py-14 text-center shadow-2xl">
          <div className="absolute -top-16 -left-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="relative space-y-6">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Mehrli kelajak sari birga qadam tashlaymiz
            </h3>
            <p className="text-brand-50 max-w-xl mx-auto text-sm sm:text-base">
              Bosh administrator tomonidan berilgan login-parol orqali platformaga kiring va bolangiz uchun individual reabilitatsiya dasturini boshlang.
            </p>
            <button
              onClick={goToPlatform}
              className="inline-flex items-center space-x-2 px-8 py-4 rounded-2xl bg-white text-brand-700 font-bold text-base shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all"
            >
              <span>{t.actions.start}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
