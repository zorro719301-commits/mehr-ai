import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { api } from '../services/api.js';
import confetti from 'canvas-confetti';
import {
  Brain,
  MessageCircle,
  Activity,
  Users,
  CheckSquare,
  Smile,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertTriangle
} from 'lucide-react';

interface AssessmentWizardPageProps {
  onNavigate: (tab: string) => void;
}

export const AssessmentWizardPage: React.FC<AssessmentWizardPageProps> = ({ onNavigate }) => {
  const { activeChild, refreshUserData, setActiveChild } = useAuth();
  const { t } = useLanguage();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [domains, setDomains] = useState<any[]>([]);

  // Step 1: General Info
  const [firstName, setFirstName] = useState(activeChild?.firstName || '');
  const [lastName, setLastName] = useState(activeChild?.lastName || '');
  const [dateOfBirth, setDateOfBirth] = useState(
    activeChild?.dateOfBirth ? new Date(activeChild.dateOfBirth).toISOString().split('T')[0] : '2022-04-15'
  );
  const [gender, setGender] = useState(activeChild?.gender || 'MALE');
  const [region, setRegion] = useState(activeChild?.region || 'Toshkent shahar');
  const [chiefComplaint, setChiefComplaint] = useState(activeChild?.chiefComplaint || '');
  const [consentAgreed, setConsentAgreed] = useState(true);

  // Step 2: Medical Profile
  const [doctorConclusions, setDoctorConclusions] = useState('Neyrorivojlanish kechikishi belgilari');
  const [currentMedications, setCurrentMedications] = useState('Shifokor tavsiyasi bo‘yicha vitaminlar');
  const [allergies, setAllergies] = useState('Allergiya mavjud emas');
  const [precautionsContraindications, setPrecautionsContraindications] = useState('Baland shovqinli stimullardan ehtiyot bo‘lish');

  // Step 3: Assessment Answers (Map of questionId -> score 0-5)
  const [answers, setAnswers] = useState<Record<string, number>>({});

  // Step 4: AI Results Output
  const [aiGeneratedPackage, setAiGeneratedPackage] = useState<any>(null);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const res = await api.get('/api/assessments/questions');
      if (res.success && res.data) {
        setDomains(res.data);
        // Initialize default scores
        const initialAnswers: Record<string, number> = {};
        for (const dom of res.data) {
          for (const q of dom.questions) {
            initialAnswers[q.id] = 2; // default intermediate rating
          }
        }
        setAnswers(initialAnswers);
      }
    } catch (e) {
      console.error('Failed to load assessment questions:', e);
    }
  };

  const handleScoreChange = (qId: string, score: number) => {
    setAnswers((prev) => ({ ...prev, [qId]: score }));
  };

  const handleNextStep = () => {
    if (step === 1 && (!firstName || !lastName || !consentAgreed)) {
      alert('Iltimos, bolaning ismini to‘liq kiriting va ma’lumotlardan foydalanishga rozilik bildiring.');
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handleRunAiAnalysis = async () => {
    setLoading(true);
    try {
      let childId = activeChild?.id;

      // If no active child, create child first
      if (!childId) {
        const childRes = await api.post('/api/children', {
          firstName,
          lastName,
          dateOfBirth,
          gender,
          region,
          chiefComplaint,
          doctorConclusions,
          currentMedications,
          allergies,
          precautionsContraindications,
          consentAgreed,
        });

        if (childRes.success && childRes.data) {
          childId = childRes.data.id;
          setActiveChild(childRes.data);
        }
      }

      // Submit digital assessment answers
      const answersArray = Object.entries(answers).map(([questionId, score]) => ({
        questionId,
        score,
      }));

      await api.post('/api/assessments', {
        childId,
        type: 'BASELINE',
        answers: answersArray,
        notes: 'Ota-ona tomonidan to‘ldirilgan raqamli baholash',
      });

      // Trigger 13-step AI Individual Package Generator
      const pkgRes = await api.post('/api/packages/generate', {
        childId,
        parentGoals: 'Mustaqil kommunikatsiya va kundalik ko‘nikmalar',
      });

      if (pkgRes.success && pkgRes.data) {
        setAiGeneratedPackage(pkgRes.data);
        setStep(4);
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
        });
        await refreshUserData();
      }
    } catch (err) {
      console.error('AI Generation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Wizard Step Progress Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-soft">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          <span>Raqamli Baholash & AI Generator</span>
          <span className="text-brand-600 font-extrabold">{step} / 4 - BOSQICH</span>
        </div>
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
          <div
            className="bg-gradient-to-r from-brand-600 to-indigo-600 h-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-slate-500 font-medium mt-2">
          <span>1. Umumiy</span>
          <span>2. Tibbiy</span>
          <span>3. 0–5 Baholash</span>
          <span>4. AI Individual Paket</span>
        </div>
      </div>

      {/* STEP 1: GENERAL CHILD INFO & CONSENT */}
      {step === 1 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-6 animate-fadeIn">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-xl font-bold text-slate-900">1-Qadam: Bola Haqida Umumiy Ma’lumotlar</h3>
            <p className="text-xs text-slate-500">
              Ushbu ma’lumotlar AI individual paketining yosh va hududiy parametrlarini aniqlashda qo‘llaniladi.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Bolaning ismi *</label>
              <input
                type="text"
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-brand-500"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Jasur"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Familiyasi *</label>
              <input
                type="text"
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-brand-500"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Karimov"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Tug‘ilgan sana *</label>
              <input
                type="date"
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-brand-500"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Jinsi</label>
              <select
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-brand-500"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="MALE">O‘g‘il bola</option>
                <option value="FEMALE">Qiz bola</option>
              </select>
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-700">Yashash hududi</label>
              <input
                type="text"
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-brand-500"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="Toshkent shahar, Chilonzor tumani"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-700">Asosiy murojaat sababi</label>
              <textarea
                rows={2}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-brand-500"
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                placeholder="Masalan: ismiga qaramaydi, o‘z ehtiyojini so‘z bilan bildirolmaydi..."
              />
            </div>
          </div>

          {/* Parental Consent Checkbox */}
          <div className="p-4 bg-brand-50/70 border border-brand-200 rounded-2xl flex items-start space-x-3">
            <input
              type="checkbox"
              id="consent"
              checked={consentAgreed}
              onChange={(e) => setConsentAgreed(e.target.checked)}
              className="mt-1 w-4 h-4 text-brand-600 rounded cursor-pointer"
            />
            <label htmlFor="consent" className="text-xs text-brand-950 font-medium cursor-pointer leading-relaxed">
              <span className="font-bold">Ma’lumotlardan foydalanishga rozilik:</span> MEHR AI platformasida bolaning
              rivojlanish ko‘rsatkichlarini tahlil qilish, individual reabilitatsiya dasturini tuzish va mutaxassislar
              bilan hamkorlik qilish uchun ma’lumotlarni qayta ishlashga to‘liq roziman.
            </label>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleNextStep}
              className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-card flex items-center space-x-2"
            >
              <span>Keyingi: Tibbiy ma’lumotlar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: MEDICAL PROFILE */}
      {step === 2 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-6 animate-fadeIn">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-xl font-bold text-slate-900">2-Qadam: Tibbiy Ma’lumotlar va Ehtiyot Choralari</h3>
            <p className="text-xs text-slate-500">
              AI mashqlarni tavsiya qilayotganda tibbiy cheklovlar va xavf omillarini hisobga oladi.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Shifokor xulosasi / Mavjud tashxislar</label>
              <textarea
                rows={2}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-brand-500"
                value={doctorConclusions}
                onChange={(e) => setDoctorConclusions(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Qabul qilinayotgan dori-darmonlar (shifokor tasdiqlagan)</label>
              <input
                type="text"
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-brand-500"
                value={currentMedications}
                onChange={(e) => setCurrentMedications(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Allergiyalar</label>
              <input
                type="text"
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-brand-500"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Cheklovlar va ehtiyot choralari (Kontraindikatsiyalar)</label>
              <textarea
                rows={2}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-brand-500"
                value={precautionsContraindications}
                onChange={(e) => setPrecautionsContraindications(e.target.value)}
                placeholder="Masalan: bo‘yinni keskin bukish taqiqlanadi, shovqindan bezovtalanadi..."
              />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(1)}
              className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Orqaga</span>
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-card flex items-center space-x-2"
            >
              <span>Keyingi: 0–5 Rivojlanish Baholash</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: DIGITAL ASSESSMENT QUESTIONS (0-5 SCALE) */}
      {step === 3 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-8 animate-fadeIn">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-xl font-bold text-slate-900">3-Qadam: 6 Soha Bo‘yicha Raqamli Baholash</h3>
            <p className="text-xs text-slate-500">
              Har bir ko‘rsatkich uchun 0 dan 5 gacha ball belgilang:
              <br />
              <span className="font-semibold text-slate-700">
                0: shakllanmagan • 1: faqat yordamda • 2: tez-tez yordam • 3: qisman • 4: deyarli mustaqil • 5: mustaqil
              </span>
            </p>
          </div>

          <div className="space-y-8">
            {domains.map((dom) => (
              <div key={dom.id} className="space-y-4 p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80">
                <div className="flex items-center space-x-2 text-brand-700 font-extrabold text-sm border-b border-slate-200 pb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-600" />
                  <span>{dom.name}</span>
                </div>

                <div className="space-y-4">
                  {dom.questions.map((q: any) => {
                    const currentScore = answers[q.id] ?? 2;
                    return (
                      <div key={q.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                        <div className="text-xs font-semibold text-slate-800 leading-normal">
                          {q.questionText}
                        </div>

                        {/* 0 to 5 Rating Buttons */}
                        <div className="grid grid-cols-6 gap-1.5">
                          {[0, 1, 2, 3, 4, 5].map((score) => (
                            <button
                              key={score}
                              type="button"
                              onClick={() => handleScoreChange(q.id, score)}
                              className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                                currentScore === score
                                  ? 'bg-brand-600 text-white border-brand-600 shadow-sm scale-105'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {score}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep(2)}
              className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Orqaga</span>
            </button>

            <button
              onClick={handleRunAiAnalysis}
              disabled={loading}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-emerald-600 hover:brightness-110 text-white font-extrabold text-base shadow-card flex items-center space-x-2 hover:scale-[1.02] transition-all"
            >
              <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300" />
              <span>{loading ? 'AI Tahlil Qilmoqda...' : 'AI INDIVIDUAL PAKETNI SHAKLLANTIRISH'}</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: AI GENERATED INDIVIDUAL PACKAGE RESULT */}
      {step === 4 && aiGeneratedPackage && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-soft space-y-8 animate-fadeIn">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              MEHR Individual Paketi Muvaffaqiyatli Shakllantirildi!
            </h3>
            <p className="text-sm text-slate-600 max-w-xl mx-auto">
              {aiGeneratedPackage.package?.title}
            </p>
          </div>

          {/* AI Clinical Summary */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-brand-50 to-indigo-50/50 border border-brand-200 space-y-3">
            <div className="text-xs font-extrabold uppercase tracking-wider text-brand-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>AI Tahlil Xulosasi:</span>
            </div>
            <p className="text-sm text-slate-800 leading-relaxed font-medium">
              {aiGeneratedPackage.package?.summary}
            </p>
          </div>

          {/* Recommended Specialists */}
          <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
            <span className="text-xs font-bold text-emerald-900 uppercase">
              Tavsiya etilayotgan mutaxassislar guruhi:
            </span>
            <div className="flex flex-wrap gap-2">
              {aiGeneratedPackage.aiRecommendations?.map((spec: string, idx: number) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-xs font-bold shadow-xs"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="text-xs text-slate-500 italic bg-slate-50 p-4 rounded-2xl border border-slate-200 leading-relaxed">
            {aiGeneratedPackage.disclaimer}
          </div>

          <div className="flex justify-center pt-4">
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-8 py-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm shadow-card flex items-center space-x-2"
            >
              <span>Kabinetga o‘tish va Mashg‘ulotni boshlash</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
