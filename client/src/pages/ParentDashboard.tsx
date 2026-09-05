import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { api } from '../services/api.js';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Heart,
  ChevronRight,
  Play,
  Check,
  MessageSquare,
  Smile,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

interface ParentDashboardProps {
  onNavigate: (tab: string) => void;
  onOpenAiChat: () => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({ onNavigate, onOpenAiChat }) => {
  const { activeChild } = useAuth();
  const { t } = useLanguage();

  const [activePackage, setActivePackage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [todayTask, setTodayTask] = useState<any>(null);

  // Result submission modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [status, setStatus] = useState('COMPLETED');
  const [assistanceLevel, setAssistanceLevel] = useState(3);
  const [reaction, setReaction] = useState('POSITIVE');
  const [parentNotes, setParentNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hasCompletedToday, setHasCompletedToday] = useState(false);

  useEffect(() => {
    if (activeChild) {
      loadChildPackage(activeChild.id);
    }
  }, [activeChild]);

  const loadChildPackage = async (childId: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/packages/active/${childId}`);
      if (res.success && res.data) {
        setActivePackage(res.data);
        if (res.data.dailyTasks && res.data.dailyTasks.length > 0) {
          // Find first uncompleted or day 1 task
          const task = res.data.dailyTasks[0];
          setTodayTask(task);
          if (task.results && task.results.length > 0) {
            setHasCompletedToday(true);
          }
        }
      }
    } catch (e) {
      console.error('Failed to load active package:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async () => {
    if (!todayTask || !activeChild) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/api/packages/tasks/${todayTask.id}/result`, {
        childId: activeChild.id,
        status,
        assistanceLevel,
        childReaction: reaction,
        durationSpent: 15,
        parentNotes,
      });

      if (res.success) {
        setHasCompletedToday(true);
        setIsModalOpen(false);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
        loadChildPackage(activeChild.id);
      }
    } catch (e) {
      console.error('Task submission error:', e);
    } finally {
      setSubmitting(false);
    }
  };

  if (!activeChild) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 shadow-soft">
        <Heart className="w-12 h-12 text-brand-500 mx-auto mb-4 animate-bounce" />
        <h3 className="text-xl font-bold text-slate-800 mb-2">Bola profili tanlanmagan</h3>
        <p className="text-sm text-slate-500 mb-6">Yangi bola profilini kiriting yoki mavjud bolani tanlang.</p>
        <button
          onClick={() => onNavigate('assessment')}
          className="px-6 py-3 rounded-2xl bg-brand-600 text-white font-semibold text-sm shadow-card"
        >
          Yangi bola profilini yaratish
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. CHILD HEADER CARD */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-soft flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <img
            src={activeChild.photoUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150'}
            alt={activeChild.firstName}
            className="w-20 h-20 rounded-2xl object-cover ring-4 ring-brand-100 shadow-md"
          />
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl font-extrabold text-slate-900">
                {activeChild.firstName} {activeChild.lastName}
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 font-semibold border border-brand-200">
                {activeChild.region}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 text-xs text-slate-500 font-medium">
              <span>Tug‘ilgan sana: {new Date(activeChild.dateOfBirth).toLocaleDateString()}</span>
              <span>•</span>
              <span className="text-emerald-700 font-semibold">Tashxis: Autizm spektri (ASD), Nutq kechikishi</span>
            </div>

            {activeChild.chiefComplaint && (
              <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded-xl border border-slate-100 max-w-xl">
                “{activeChild.chiefComplaint}”
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={() => onNavigate('assessment')}
            className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs shadow-sm flex items-center justify-center space-x-1.5"
          >
            <span>Qayta baholash</span>
          </button>
          <button
            onClick={onOpenAiChat}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:brightness-110 text-white font-bold text-xs shadow-card flex items-center justify-center space-x-1.5"
          >
            <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span>MEHR AI Yordamchi</span>
          </button>
        </div>
      </div>

      {/* 2. TODAY'S TARGET & 15-MINUTE EXERCISE HERO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's 15-Minute Session */}
        <div className="lg:col-span-2 bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-800 text-white rounded-3xl p-6 sm:p-8 shadow-card relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-4 z-10">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-extrabold uppercase tracking-wide backdrop-blur-md">
                <Clock className="w-3.5 h-3.5" />
                <span>Bugungi 15 daqiqalik mashg‘ulot</span>
              </span>
              {hasCompletedToday ? (
                <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-emerald-400 text-emerald-950 text-xs font-bold shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Bugun bajarildi!</span>
                </span>
              ) : (
                <span className="text-xs text-brand-100 font-semibold">Kutilmoqda</span>
              )}
            </div>

            {todayTask ? (
              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-black text-white leading-snug">
                  {todayTask.title}
                </h3>
                <p className="text-sm text-brand-100 leading-relaxed font-normal">
                  {todayTask.instructions}
                </p>
                <div className="pt-2 flex flex-wrap gap-2 text-xs">
                  <div className="bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-md">
                    <span className="text-brand-200">Kerakli material:</span> {todayTask.materials || 'AAC kartochkasi, stakan'}
                  </div>
                  <div className="bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-md">
                    <span className="text-brand-200">Davomiyligi:</span> 15 daqiqa
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-brand-100 py-4">
                Hozirda yangi mashg‘ulot shakllanmoqda. AI Individual paketni qayta tekshiring.
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-white/20 mt-6 flex flex-wrap items-center justify-between gap-4 z-10">
            <div className="text-xs text-brand-200 italic max-w-md">
              💡 Ota-ona uchun maslahat: {todayTask?.parentTip || 'Bolani majburlamang, kichik urinishni ham darhol quchoqlab rag‘batlantiring.'}
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 rounded-2xl bg-white hover:bg-brand-50 text-brand-800 font-extrabold text-sm shadow-lg flex items-center space-x-2 transition-all hover:scale-105"
            >
              <Check className="w-4 h-4 text-brand-600 stroke-[3]" />
              <span>{hasCompletedToday ? 'Natijani yangilash' : 'Natijani qayd etish'}</span>
            </button>
          </div>
        </div>

        {/* Right Col: Quick Clinical Status & Actions */}
        <div className="space-y-6">
          {/* Active Package Status Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">FAOL INDIVIDUAL REJA</span>
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Tasdiqlangan
              </span>
            </div>

            <div className="space-y-2">
              <h4 className="font-extrabold text-slate-800 text-sm">
                {activePackage?.title || '30 Kunlik MEHR Paketi'}
              </h4>
              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                {activePackage?.summary || 'Nutq, AAC va sensorikaga yo‘naltirilgan reja.'}
              </p>
            </div>

            {activePackage?.specialistFeedback && (
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-1">
                <div className="font-bold flex items-center gap-1 text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Mutaxassis tavsiyasi:</span>
                </div>
                <p className="italic text-[11px] leading-relaxed">“{activePackage.specialistFeedback}”</p>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
              <button
                onClick={() => onNavigate('progress')}
                className="text-brand-600 hover:text-brand-700 flex items-center space-x-1"
              >
                <span>To‘liq reja va grafiklar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Actions Shortcuts */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onNavigate('aac')}
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-brand-400 hover:shadow-md transition-all text-left space-y-2 group"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-slate-800">AAC Doskasi</div>
              <div className="text-[10px] text-slate-500">Ovozli kartochkalar</div>
            </button>

            <button
              onClick={() => onNavigate('behavior')}
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all text-left space-y-2 group"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Smile className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-slate-800">Xulq Kundaligi</div>
              <div className="text-[10px] text-slate-500">ABC qaydlari & tahlil</div>
            </button>
          </div>
        </div>
      </div>

      {/* 3. 4-WEEK PROGRESSION MODULES OVERVIEW */}
      {activePackage && activePackage.modules && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-slate-900">30 Kunlik Dastur Modullari (Haftalik)</h3>
              <p className="text-xs text-slate-500">Har hafta bolaning ko‘nikmasiga qarab murakkablashtiriladi</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-brand-50 text-brand-700 rounded-full border border-brand-200">
              Muddati: 30 kun
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {activePackage.modules.map((m: any, idx: number) => (
              <div
                key={idx}
                className={`p-5 rounded-2xl border transition-all ${
                  idx === 0
                    ? 'bg-brand-50/50 border-brand-300 ring-2 ring-brand-200'
                    : 'bg-slate-50/60 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold text-brand-700 uppercase">
                    {m.weekNumber}-hafta
                  </span>
                  {idx === 0 && (
                    <span className="text-[10px] bg-brand-600 text-white font-bold px-2 py-0.5 rounded-full">
                      Hozirgi
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-sm text-slate-800 mb-2">{m.focusArea}</h4>
                <p className="text-xs text-slate-600 mb-3 leading-relaxed">{m.weeklyGoal}</p>
                <div className="text-[11px] text-slate-500 bg-white p-2 rounded-xl border border-slate-200/80">
                  <span className="font-semibold text-slate-700">Kutilayotgan natija:</span> {m.expectedOutcome}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RESULT SUBMISSION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Mashg‘ulot Natijasini Qayd Etish</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            {/* Status options */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase">Mashg‘ulot holati:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'COMPLETED', label: 'Bajarildi' },
                  { key: 'PARTIALLY_COMPLETED', label: 'Qisman' },
                  { key: 'NOT_COMPLETED', label: 'Bajarilmadi' },
                ].map((st) => (
                  <button
                    key={st.key}
                    type="button"
                    onClick={() => setStatus(st.key)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      status === st.key
                        ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Assistance Level (0-5) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700 uppercase">Yordam darajasi (0–5):</label>
                <span className="text-xs font-extrabold text-brand-600">{assistanceLevel} ball</span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="1"
                value={assistanceLevel}
                onChange={(e) => setAssistanceLevel(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>0 (Shakllanmagan)</span>
                <span>3 (Qisman)</span>
                <span>5 (Mustaqil)</span>
              </div>
            </div>

            {/* Child Reaction */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase">Bolaning reaksiyasi:</label>
              <div className="grid grid-cols-4 gap-2 text-xs">
                {[
                  { key: 'POSITIVE', label: '😊 Ijobiy' },
                  { key: 'NEUTRAL', label: '😐 Neytral' },
                  { key: 'RESISTANT', label: '🙁 Qarshilik' },
                  { key: 'UPSET', label: '😭 Yig‘i' },
                ].map((re) => (
                  <button
                    key={re.key}
                    type="button"
                    onClick={() => setReaction(re.key)}
                    className={`py-2 px-1 text-center font-semibold rounded-xl border transition-all ${
                      reaction === re.key
                        ? 'bg-brand-50 border-brand-500 text-brand-800'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    {re.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Parent Notes */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase">Ota-ona izohi:</label>
              <textarea
                rows={3}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-brand-500"
                placeholder="Bola nimalarda qiynaldi yoki qanday muvaffaqiyatga erishdi..."
                value={parentNotes}
                onChange={(e) => setParentNotes(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleCompleteTask}
                disabled={submitting}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-600 text-white hover:bg-brand-700 shadow-card"
              >
                {submitting ? 'Saqlanmoqda...' : 'Natijani saqlash'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
