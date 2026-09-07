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
  AlertTriangle,
  Printer,
  Calendar,
  BookOpen,
  Stethoscope
} from 'lucide-react';

interface AssessmentWizardPageProps {
  onNavigate: (tab: string) => void;
}

interface DiagnosisTemplate {
  code: string;
  name: string;
  subtitle: string;
  badge: string;
  category: string;
  defaultComplaint: string;
  defaultDoctorConclusion: string;
  defaultMedications: string;
  defaultPrecautions: string;
  colorClass: string;
  borderClass: string;
  bgClass: string;
}

const ICD_DIAGNOSES: DiagnosisTemplate[] = [
  {
    code: 'MKB_F70_G80',
    name: 'MKB-10 F70 + G80 (III-IV daraja)',
    subtitle: 'Aqliy zaiflikning yengil darajasi + Tserebral falaj (GMFCS III-IV)',
    badge: 'Postural nazorat & Moslashtirilgan o‘rindiq',
    category: 'Neyromotor va Kognitiv',
    defaultComplaint: 'Oyoq va qo‘llarda spastiklik bor, tayanchsiz mustaqil o‘tirolmaydi va yurolmaydi, yengil kognitiv kechikish kuzatiladi.',
    defaultDoctorConclusion: 'MKB-10 F70 (Aqliy zaiflikning yengil darajasi, fe’l-atvor buzilishining yo‘qligi) va MKB-10 G80 (Tserebral falaj III-IV daraja, spastik diplegiya).',
    defaultMedications: 'Shifokor nazorati ostida miorelaksant (Baclofen 5mg)',
    defaultPrecautions: 'Bo‘g‘imlarni keskin cho‘zish qat’iyan taqiqlanadi. Faqat yumshoq passiv-faol harakatlar va postural simmetriya.',
    colorClass: 'text-amber-900',
    borderClass: 'border-amber-400 ring-amber-300',
    bgClass: 'bg-gradient-to-br from-amber-50 to-orange-50/60',
  },
  {
    code: 'MKB_F71',
    name: 'MKB-10 F71',
    subtitle: 'Aqliy zaiflikning o‘rta darajasi (fe’l-atvor buzilishisiz)',
    badge: 'Mustaqil hayot ko‘nikmalari (ADL) & Qadamma-qadam ta’lim',
    category: 'ADL va Bosqichli rivojlanish',
    defaultComplaint: 'O‘z-o‘ziga xizmat (ADL), kiyinish, ovqatlanish va tartibni bajarishda qiyinchilik, doimiy yo‘naltirishga muhtoj.',
    defaultDoctorConclusion: 'MKB-10 F71: Aqliy zaiflikning o‘rta darajasi, fe’l-atvor buzilishining yo‘qligi yoki kuchsiz ifodalanganligi.',
    defaultMedications: 'Vitamin va nootropik qo‘llab-quvvatlash (shifokor retsepti bilan)',
    defaultPrecautions: 'Murakkab ko‘p bosqichli ko‘rsatmalar bermaslik. Vazifalarni mayda qadamlarga (task analysis) bo‘lish.',
    colorClass: 'text-blue-900',
    borderClass: 'border-blue-400 ring-blue-300',
    bgClass: 'bg-gradient-to-br from-blue-50 to-indigo-50/60',
  },
  {
    code: 'MKB_F84',
    name: 'MKB-10 F84',
    subtitle: 'Bolalar autizmi (Autizm Spektri Buzilishi / ASD)',
    badge: 'AAC muloqot & Sensor integratsiya',
    category: 'Muloqot va Sensor xotirjamlik',
    defaultComplaint: 'Ismiga qaramaydi, o‘z ehtiyojini so‘z bilan aytolmaydi, ko‘z bilan aloqa juda qisqa, sensor ta’sirlarga yuqori sezgirlik.',
    defaultDoctorConclusion: 'MKB-10 F84: Bolalar autizmi (Autizm Spektri Buzilishi / ASD). Eshitish a’zolari me’yorda.',
    defaultMedications: 'Magne B6 kursi (shifokor tavsiyasi bilan)',
    defaultPrecautions: 'Baland shovqinli muhitda sensor zo‘riqish ehtimoli bor. Keskin tovushlardan saqlanish kerak.',
    colorClass: 'text-purple-900',
    borderClass: 'border-purple-400 ring-purple-300',
    bgClass: 'bg-gradient-to-br from-purple-50 to-pink-50/60',
  },
  {
    code: 'MKB_H90_3',
    name: 'MKB-10 H90.3',
    subtitle: 'Orttirilgan kar-soqovlik (Koxlear implant / eshitish apparati)',
    badge: 'Audiotrenirovka & Ling 6 testi',
    category: 'Surdopedagogika va Eshitishni rivojlantirish',
    defaultComplaint: 'Koxlear implant operatsiyasidan so‘ng tovushlarni farqlash, deteksiya va nutqiy taqlidni shakllantirish zarur.',
    defaultDoctorConclusion: 'MKB-10 H90.3: Eshitish a’zolari kasalliklarida orttirilgan kar-soqovlik. Koxlear implantatsiya o‘tkazilgan (o‘ng quloq).',
    defaultMedications: 'Mavjud emas (shifokor va audiolog nazoratida)',
    defaultPrecautions: 'Koxlear implant protsessoriga suv tekkizmaslik va kuchli elektromagnit maydonlardan saqlash.',
    colorClass: 'text-emerald-900',
    borderClass: 'border-emerald-400 ring-emerald-300',
    bgClass: 'bg-gradient-to-br from-emerald-50 to-teal-50/60',
  },
];

export const AssessmentWizardPage: React.FC<AssessmentWizardPageProps> = ({ onNavigate }) => {
  const { activeChild, refreshUserData, setActiveChild } = useAuth();
  const { t } = useLanguage();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [domains, setDomains] = useState<any[]>([]);

  // Selected Diagnosis - primary focus MKB_F70_G80
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<string>('MKB_F70_G80');

  // Step 1: General Info (Starts clean for new child registration)
  const [firstName, setFirstName] = useState(activeChild?.firstName || '');
  const [middleName, setMiddleName] = useState(activeChild?.middleName || '');
  const [lastName, setLastName] = useState(activeChild?.lastName || '');
  const [dateOfBirth, setDateOfBirth] = useState(
    activeChild?.dateOfBirth ? new Date(activeChild.dateOfBirth).toISOString().split('T')[0] : '2021-08-20'
  );
  const [gender, setGender] = useState(activeChild?.gender || 'FEMALE');
  const [region, setRegion] = useState(activeChild?.region || 'Toshkent shahar');
  const [school, setSchool] = useState(activeChild?.school || '');
  const [grade, setGrade] = useState(activeChild?.grade || '');
  const [contactPhone, setContactPhone] = useState(activeChild?.contactPhone || '');
  const [contactAddress, setContactAddress] = useState(activeChild?.contactAddress || '');
  const [chiefComplaint, setChiefComplaint] = useState(
    activeChild?.chiefComplaint || 'Oyoq va qo‘llarda spastiklik, tayanchsiz o‘tirolmaslik (GMFCS III-IV), yengil kognitiv kechikish (F70).'
  );
  const [diagnosisDate, setDiagnosisDate] = useState('');
  const [consentAgreed, setConsentAgreed] = useState(true);

  // Step 2: Medical Profile
  const [doctorConclusions, setDoctorConclusions] = useState(
    activeChild?.medicalProfile?.doctorConclusions || 'MKB-10 F70 (Aqliy zaiflikning yengil darajasi) va MKB-10 G80 (Tserebral falaj III-IV daraja, spastik diplegiya).'
  );
  const [previousTreatment, setPreviousTreatment] = useState(activeChild?.medicalProfile?.previousTreatment || '');
  const [priorTherapy, setPriorTherapy] = useState(activeChild?.medicalProfile?.priorTherapy || '');
  const [surgicalHistory, setSurgicalHistory] = useState(activeChild?.medicalProfile?.surgicalHistory || 'Operatsiya bo‘lmagan');
  const [currentMedications, setCurrentMedications] = useState(
    activeChild?.medicalProfile?.currentMedications || 'Magne B6 kursi'
  );
  const [allergies, setAllergies] = useState(
    activeChild?.medicalProfile?.allergies || 'Allergiya mavjud emas'
  );
  const [precautionsContraindications, setPrecautionsContraindications] = useState(
    activeChild?.medicalProfile?.precautionsContraindications || 'Baland shovqinli stimullardan ehtiyot bo‘lish'
  );
  const [epilepsy, setEpilepsy] = useState(activeChild?.medicalProfile?.epilepsy || 'Yo‘q');
  const [vision, setVision] = useState(activeChild?.medicalProfile?.vision || 'Me’yorda');
  const [hearing, setHearing] = useState(activeChild?.medicalProfile?.hearing || 'Me’yorda');
  const [swallowing, setSwallowing] = useState(activeChild?.medicalProfile?.swallowing || 'Me’yorda');
  const [sleep, setSleep] = useState(activeChild?.medicalProfile?.sleep || '');
  const [pain, setPain] = useState(activeChild?.medicalProfile?.pain || 'Yo‘q');
  const [nutrition, setNutrition] = useState(activeChild?.medicalProfile?.nutrition || '');
  const [orthosis, setOrthosis] = useState(activeChild?.medicalProfile?.orthosis || 'Talab qilinmaydi');
  const [assistiveDevices, setAssistiveDevices] = useState(activeChild?.medicalProfile?.assistiveDevices || '');

  // Xalqaro Funksional Tasniflar (GMFCS, MACS, CFCS)
  const [gmfcsLevel, setGmfcsLevel] = useState<string>((activeChild as any)?.gmfcsLevel || 'III');
  const [macsLevel, setMacsLevel] = useState<string>((activeChild as any)?.macsLevel || 'III');
  const [cfcsLevel, setCfcsLevel] = useState<string>((activeChild as any)?.cfcsLevel || 'III');

  // Step 3: Assessment Answers (Map of questionId -> score 0-5)
  const [answers, setAnswers] = useState<Record<string, number>>({});

  // Step 4: AI Results Output
  const [aiGeneratedPackage, setAiGeneratedPackage] = useState<any>(null);

  useEffect(() => {
    loadQuestions();
  }, []);

  // Sync with activeChild if available
  useEffect(() => {
    if (activeChild) {
      setFirstName(activeChild.firstName || '');
      setLastName(activeChild.lastName || '');
      if (activeChild.dateOfBirth) {
        setDateOfBirth(new Date(activeChild.dateOfBirth).toISOString().split('T')[0]);
      }
      setGender(activeChild.gender || 'MALE');
      setRegion(activeChild.region || 'Toshkent shahar');
      if (activeChild.chiefComplaint) {
        setChiefComplaint(activeChild.chiefComplaint);
      }
      if (activeChild.medicalProfile) {
        setDoctorConclusions(activeChild.medicalProfile.doctorConclusions || '');
        setCurrentMedications(activeChild.medicalProfile.currentMedications || '');
        setAllergies(activeChild.medicalProfile.allergies || '');
        setPrecautionsContraindications(activeChild.medicalProfile.precautionsContraindications || '');
      }

      // Check if child matches one of our diagnoses
      const cCode = activeChild.conditions?.[0]?.condition?.code || activeChild.conditions?.[0]?.code;
      if (cCode && ICD_DIAGNOSES.some((d) => d.code === cCode)) {
        setSelectedDiagnosis(cCode);
      } else {
        const combined = `${activeChild.chiefComplaint || ''} ${activeChild.medicalProfile?.doctorConclusions || ''}`.toLowerCase();
        if (combined.includes('h90') || combined.includes('koxlear') || combined.includes('eshitish')) {
          setSelectedDiagnosis('MKB_H90_3');
        } else if (combined.includes('f71') || (combined.includes('o‘rta') && combined.includes('aqliy'))) {
          setSelectedDiagnosis('MKB_F71');
        } else if (combined.includes('g80') || combined.includes('f70') || combined.includes('falaj')) {
          setSelectedDiagnosis('MKB_F70_G80');
        } else {
          setSelectedDiagnosis('MKB_F84');
        }
      }
    }
  }, [activeChild]);

  const loadQuestions = async () => {
    try {
      const res = await api.get('/api/assessments/questions');
      if (res.success && res.data) {
        setDomains(res.data);
        const initialAnswers: Record<string, number> = {};
        for (const dom of res.data) {
          for (const q of dom.questions) {
            initialAnswers[q.id] = 2;
          }
        }
        setAnswers(initialAnswers);
      }
    } catch (e) {
      console.error('Failed to load assessment questions:', e);
    }
  };

  const handleSelectDiagnosis = (diag: DiagnosisTemplate) => {
    setSelectedDiagnosis(diag.code);
    setChiefComplaint(diag.defaultComplaint);
    setDoctorConclusions(diag.defaultDoctorConclusion);
    setCurrentMedications(diag.defaultMedications);
    setPrecautionsContraindications(diag.defaultPrecautions);
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
          middleName,
          lastName,
          dateOfBirth,
          gender,
          region,
          school,
          grade,
          contactPhone,
          contactAddress,
          chiefComplaint,
          diagnosisDate,
          doctorConclusions,
          previousTreatment,
          priorTherapy,
          surgicalHistory,
          currentMedications,
          allergies,
          precautionsContraindications,
          epilepsy,
          vision,
          hearing,
          swallowing,
          sleep,
          pain,
          nutrition,
          orthosis,
          assistiveDevices,
          gmfcsLevel,
          macsLevel,
          cfcsLevel,
          conditions: [selectedDiagnosis],
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
        notes: `Ota-ona baholashi. Tashxis: ${selectedDiagnosis}`,
      });

      // Trigger 13-step AI Individual Package Generator
      const pkgRes = await api.post('/api/packages/generate', {
        childId,
        parentGoals: `${selectedDiagnosis} bo‘yicha individual ko‘nikmalar va rivojlantirish`,
      });

      if (pkgRes.success && pkgRes.data) {
        setAiGeneratedPackage(pkgRes.data);
        setStep(4);
        confetti({
          particleCount: 120,
          spread: 85,
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

      {/* STEP 1: ICD-10 DIAGNOSIS SELECTION & GENERAL CHILD INFO */}
      {step === 1 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-8 animate-fadeIn">
          <div className="border-b border-slate-100 pb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>Klinik Tasnif</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              1-Qadam: MKB-10 Klinik Tashxisini Tanlang
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Quyidagi 4 ta asosiy klinik holatdan birini tanlang. MEHR AI ushbu tashxisga moslashtirilgan 30 kunlik reabilitatsiya paketini ishlab chiqadi:
            </p>
          </div>

          {/* 4 Interactive ICD-10 Diagnosis Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ICD_DIAGNOSES.map((diag) => {
              const isSelected = selectedDiagnosis === diag.code;
              return (
                <div
                  key={diag.code}
                  onClick={() => handleSelectDiagnosis(diag)}
                  className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer select-none text-left flex flex-col justify-between ${
                    isSelected
                      ? `${diag.borderClass} ${diag.bgClass} shadow-md ring-2 ring-offset-1`
                      : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-white/90 text-slate-800 border border-slate-200 shadow-xs">
                        {diag.name}
                      </span>
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                          isSelected
                            ? 'bg-brand-600 border-brand-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>

                    <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
                      {diag.subtitle}
                    </h4>

                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {diag.category}
                    </p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                    <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-brand-700 font-bold">
                      {diag.badge}
                    </span>
                    <span className="text-brand-600 font-bold">Tanlash →</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-slate-100 pt-6 space-y-4">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Bolaning Demografik Ma’lumotlari
            </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Bolaning ismi *</label>
              <input
                type="text"
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-brand-500 font-medium"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ismni kiriting (masalan: Madina yoki Jasur)"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Familiyasi *</label>
              <input
                type="text"
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-brand-500 font-medium"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Familiyani kiriting (masalan: Karimova)"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Sharifi (otasining ismi)</label>
              <input
                type="text"
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-brand-500"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                placeholder="Alisherovich"
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

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Maktab</label>
              <input
                type="text"
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-brand-500"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="Maktabgacha / 25-maktab"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Sinf</label>
              <input
                type="text"
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-brand-500"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="1-sinf"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Aloqa telefoni</label>
              <input
                type="text"
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-brand-500"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+998 90 123 45 67"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Yashash manzili</label>
              <input
                type="text"
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-brand-500"
                value={contactAddress}
                onChange={(e) => setContactAddress(e.target.value)}
                placeholder="Ko‘cha, uy raqami"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-700">Tashxis qo‘yilgan sana</label>
              <input
                type="date"
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-brand-500"
                value={diagnosisDate}
                onChange={(e) => setDiagnosisDate(e.target.value)}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Oldingi davolash</label>
                <textarea
                  rows={2}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-brand-500"
                  value={previousTreatment}
                  onChange={(e) => setPreviousTreatment(e.target.value)}
                  placeholder="Avval qanday davolanish olingan..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Oldingi reabilitatsiya</label>
                <textarea
                  rows={2}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-brand-500"
                  value={priorTherapy}
                  onChange={(e) => setPriorTherapy(e.target.value)}
                  placeholder="Avvalgi reabilitatsiya dasturlari..."
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Operatsiyalar</label>
              <input
                type="text"
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-brand-500"
                value={surgicalHistory}
                onChange={(e) => setSurgicalHistory(e.target.value)}
                placeholder="Operatsiya bo‘lmagan / operatsiya turi va sanasi"
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

            {/* Functional Status Checklist */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Funksional Holat
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Epilepsiya</label>
                  <input
                    type="text"
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-brand-500"
                    value={epilepsy}
                    onChange={(e) => setEpilepsy(e.target.value)}
                    placeholder="Yo‘q / turi va chastotasi"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Ko‘rish</label>
                  <input
                    type="text"
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-brand-500"
                    value={vision}
                    onChange={(e) => setVision(e.target.value)}
                    placeholder="Me’yorda / buzilish tavsifi"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Eshitish</label>
                  <input
                    type="text"
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-brand-500"
                    value={hearing}
                    onChange={(e) => setHearing(e.target.value)}
                    placeholder="Me’yorda / buzilish tavsifi"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Yutish</label>
                  <input
                    type="text"
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-brand-500"
                    value={swallowing}
                    onChange={(e) => setSwallowing(e.target.value)}
                    placeholder="Me’yorda / qiyinchilik tavsifi"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Uyqu</label>
                  <input
                    type="text"
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-brand-500"
                    value={sleep}
                    onChange={(e) => setSleep(e.target.value)}
                    placeholder="Uyqu rejimi va muammolari"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Og‘riq</label>
                  <input
                    type="text"
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-brand-500"
                    value={pain}
                    onChange={(e) => setPain(e.target.value)}
                    placeholder="Yo‘q / joyi va xarakteri"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Ovqatlanish</label>
                  <input
                    type="text"
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-brand-500"
                    value={nutrition}
                    onChange={(e) => setNutrition(e.target.value)}
                    placeholder="Ovqatlanish tartibi va cheklovlar"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Ortoz</label>
                  <input
                    type="text"
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-brand-500"
                    value={orthosis}
                    onChange={(e) => setOrthosis(e.target.value)}
                    placeholder="Talab qilinmaydi / ortoz turi"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700">Assistiv qurilmalar</label>
                  <input
                    type="text"
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-brand-500"
                    value={assistiveDevices}
                    onChange={(e) => setAssistiveDevices(e.target.value)}
                    placeholder="Aravacha, xodunok, AAC qurilmasi va h.k."
                  />
                </div>
              </div>
            </div>

            {/* Standardized Functional Classifications (GMFCS, MACS, CFCS) */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div className="flex items-center space-x-2">
                <Stethoscope className="w-4 h-4 text-primary-600" />
                <h4 className="text-sm font-bold text-slate-900">
                  Xalqaro Funksional Tasniflar (GMFCS, MACS, CFCS)
                </h4>
              </div>

              {/* GMFCS */}
              <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    GMFCS (Yirik motor funksiyasi): <span className="text-primary-700 font-extrabold">Daraja {gmfcsLevel}</span>
                  </label>
                  <span className="text-[11px] text-slate-500 font-medium">Gross Motor</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5 pt-1">
                  {[
                    { lvl: 'I', desc: 'Cheklovlarsiz yuradi' },
                    { lvl: 'II', desc: 'Yengil cheklov' },
                    { lvl: 'III', desc: 'Xodunok/tayanch bilan' },
                    { lvl: 'IV', desc: 'Aravacha/adaptiv o‘rindiq' },
                    { lvl: 'V', desc: 'To‘liq ko‘chirish aravachada' }
                  ].map(item => (
                    <button
                      type="button"
                      key={item.lvl}
                      onClick={() => setGmfcsLevel(item.lvl)}
                      className={`p-2 rounded-xl text-center border transition-all ${
                        gmfcsLevel === item.lvl
                          ? 'bg-primary-600 text-white border-primary-600 shadow-sm font-bold'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-xs font-extrabold">{item.lvl}</div>
                      <div className="text-[9px] mt-0.5 leading-tight opacity-90 hidden sm:block">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* MACS */}
              <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    MACS (Qo‘l harakati qobiliyati): <span className="text-indigo-700 font-extrabold">Daraja {macsLevel}</span>
                  </label>
                  <span className="text-[11px] text-slate-500 font-medium">Manual Ability</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5 pt-1">
                  {[
                    { lvl: 'I', desc: 'Oson ushlaydi' },
                    { lvl: 'II', desc: 'Biroz sekinroq' },
                    { lvl: 'III', desc: 'Qiyinchilik bilan' },
                    { lvl: 'IV', desc: 'Moslashtirilgan sharoitda' },
                    { lvl: 'V', desc: 'Ushlay olmaydi' }
                  ].map(item => (
                    <button
                      type="button"
                      key={item.lvl}
                      onClick={() => setMacsLevel(item.lvl)}
                      className={`p-2 rounded-xl text-center border transition-all ${
                        macsLevel === item.lvl
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm font-bold'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-xs font-extrabold">{item.lvl}</div>
                      <div className="text-[9px] mt-0.5 leading-tight opacity-90 hidden sm:block">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* CFCS */}
              <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    CFCS (Kommunikatsiya funksiyasi): <span className="text-emerald-700 font-extrabold">Daraja {cfcsLevel}</span>
                  </label>
                  <span className="text-[11px] text-slate-500 font-medium">Communication</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5 pt-1">
                  {[
                    { lvl: 'I', desc: 'Samarali muloqot' },
                    { lvl: 'II', desc: 'Sekinroq sur’atda' },
                    { lvl: 'III', desc: 'Faqat tanishlar bilan' },
                    { lvl: 'IV', desc: 'Noaniq (AAC zarur)' },
                    { lvl: 'V', desc: 'Kam ifoda (Doimiy AAC)' }
                  ].map(item => (
                    <button
                      type="button"
                      key={item.lvl}
                      onClick={() => setCfcsLevel(item.lvl)}
                      className={`p-2 rounded-xl text-center border transition-all ${
                        cfcsLevel === item.lvl
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm font-bold'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-xs font-extrabold">{item.lvl}</div>
                      <div className="text-[9px] mt-0.5 leading-tight opacity-90 hidden sm:block">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
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
      {step === 4 && (aiGeneratedPackage?.package || aiGeneratedPackage) && (() => {
        const pkgData = aiGeneratedPackage.package || aiGeneratedPackage;
        const currentDiag = ICD_DIAGNOSES.find((d) => d.code === selectedDiagnosis) || ICD_DIAGNOSES[2];

        return (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-soft space-y-8 animate-fadeIn">
            {/* Header Banner */}
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                MEHR Individual Paketi Muvaffaqiyatli Shakllantirildi!
              </h3>
              <p className="text-sm font-bold text-brand-700 max-w-xl mx-auto">
                {pkgData.title}
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                <span>MKB-10 Tashxisi:</span>
                <span className="font-bold text-slate-900">{currentDiag.subtitle}</span>
              </div>
            </div>

            {/* AI Clinical Summary */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-brand-50 to-indigo-50/50 border border-brand-200 space-y-3">
              <div className="text-xs font-extrabold uppercase tracking-wider text-brand-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand-600" />
                <span>AI Klinik Tahlil Xulosasi:</span>
              </div>
              <p className="text-sm text-slate-800 leading-relaxed font-medium">
                {pkgData.summary}
              </p>
            </div>

            {/* Priority Domains */}
            {pkgData.priorityDomains && pkgData.priorityDomains.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Ustuvor Rivojlanish Sohalari (30 Kunlik Fokus):
                </span>
                <div className="flex flex-wrap gap-2">
                  {pkgData.priorityDomains.map((dom: string, i: number) => (
                    <span
                      key={i}
                      className="px-3.5 py-1.5 rounded-xl bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold"
                    >
                      {dom}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 4-WEEK PROGRESSION MODULES */}
            {pkgData.modules && pkgData.modules.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-brand-600" />
                  <h4 className="font-extrabold text-base text-slate-900">
                    4 Haftalik Bosqichli Reabilitatsiya Rejasi
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pkgData.modules.map((m: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                        <span className="text-xs font-black text-brand-700 uppercase tracking-wider">
                          {m.weekNumber}-Hafta: {m.focusArea}
                        </span>
                      </div>

                      <div className="text-xs space-y-1.5">
                        <div className="text-slate-800 font-semibold">
                          <span className="text-slate-500 font-normal">Haftalik maqsad: </span>
                          {m.weeklyGoal}
                        </div>
                        <div className="text-emerald-700 font-medium">
                          <span className="text-slate-500 font-normal">Kutilayotgan natija: </span>
                          {m.expectedOutcome}
                        </div>
                        <div className="text-slate-600 italic bg-white p-2 rounded-lg border border-slate-100">
                          💡 <span className="font-bold">Ota-onaga maslahat:</span> {m.parentAdvice}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DAILY TASKS PREVIEW */}
            {pkgData.dailyTasks && pkgData.dailyTasks.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-brand-600" />
                  <h4 className="font-extrabold text-base text-slate-900">
                    Ilk Kunlik Topshiriqlar Namunasi (Kunlik 15 daqiqa)
                  </h4>
                </div>

                <div className="space-y-3">
                  {pkgData.dailyTasks.slice(0, 3).map((task: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{task.title}</span>
                        <span className="text-[11px] font-semibold text-brand-600 px-2 py-0.5 rounded-full bg-brand-50">
                          {task.durationMinutes || 15} daqiqa
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        <span className="font-bold text-slate-700">Ko‘rsatma: </span>
                        {task.instructions}
                      </p>
                      <div className="text-xs text-slate-500 flex flex-wrap gap-3">
                        <span>🎒 Kerakli buyumlar: {task.materials}</span>
                        <span>🎯 Mo‘ljallangan xulq: {task.targetBehavior}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Specialist Referrals */}
            <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
              <span className="text-xs font-bold text-emerald-900 uppercase flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-emerald-700" />
                <span>Tavsiya etilayotgan ko‘p tarmoqli mutaxassislar guruhi:</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {(pkgData.specialistReferrals || aiGeneratedPackage.aiRecommendations || []).map(
                  (spec: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-xs font-bold shadow-xs"
                    >
                      {spec}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="text-xs text-slate-500 italic bg-slate-50 p-4 rounded-2xl border border-slate-200 leading-relaxed">
              {pkgData.disclaimer || aiGeneratedPackage.disclaimer}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>PDF / Chop etish</span>
              </button>

              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={() => onNavigate('aac')}
                  className="px-4 py-3.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold text-xs border border-indigo-200 flex items-center space-x-1.5 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-indigo-600" />
                  <span>AAC Doskasi</span>
                </button>

                <button
                  onClick={() => onNavigate('dashboard')}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white font-extrabold text-xs shadow-card flex items-center justify-center space-x-2 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Kabinetga o‘tish (Mashg‘ulotlar & Jadval)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
