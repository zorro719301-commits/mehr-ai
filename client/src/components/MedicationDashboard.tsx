import React, { useState, useEffect } from 'react';
import {
  Pill, Clock, CheckCircle2, XCircle, AlertTriangle, ShieldCheck,
  Calendar, Info, AlertOctagon, HeartHandshake, PhoneCall, ChevronRight, Plus
} from 'lucide-react';
import {
  clinicalStore, MedicationOrder, MedicationDoseLog,
  MedicationSideEffectReport, AdherenceStatus
} from '../services/clinicalStore';

interface MedicationDashboardProps {
  childId: string;
  onOpenDoctorModal?: () => void;
}

export const MedicationDashboard: React.FC<MedicationDashboardProps> = ({
  childId,
  onOpenDoctorModal
}) => {
  const [medications, setMedications] = useState<MedicationOrder[]>([]);
  const [doseLogs, setDoseLogs] = useState<MedicationDoseLog[]>([]);
  const [adherenceData, setAdherenceData] = useState<{
    totalScheduled: number;
    totalTaken: number;
    scorePercent: number;
    missedCount: number;
    repeatedMissedAlert: boolean;
  }>({ totalScheduled: 0, totalTaken: 0, scorePercent: 100, missedCount: 0, repeatedMissedAlert: false });

  const [selectedMedForExplain, setSelectedMedForExplain] = useState<MedicationOrder | null>(null);
  const [showSideEffectModal, setShowSideEffectModal] = useState(false);
  const [sideEffectForm, setSideEffectForm] = useState({
    medicationId: '',
    symptom: '',
    severity: 'MILD' as 'MILD' | 'MODERATE' | 'SEVERE_RED_FLAG',
    description: '',
  });
  const [redFlagTriggered, setRedFlagTriggered] = useState(false);

  useEffect(() => {
    loadData();
  }, [childId]);

  const loadData = () => {
    const meds = clinicalStore.getMedications(childId);
    const logs = clinicalStore.getDoseLogs(childId);
    const adh = clinicalStore.calculateAdherenceScore(childId);
    setMedications(meds);
    setDoseLogs(logs);
    setAdherenceData(adh);
  };

  const handleRecordDose = (med: MedicationOrder, scheduledTime: string, status: AdherenceStatus) => {
    clinicalStore.recordDose(childId, med.id, scheduledTime, status);
    loadData();
  };

  const handleReportSideEffect = (e: React.FormEvent) => {
    e.preventDefault();
    const med = medications.find(m => m.id === sideEffectForm.medicationId);
    clinicalStore.reportSideEffect(childId, {
      medicationId: sideEffectForm.medicationId,
      medicationName: med ? med.name : 'Dori vositasi',
      symptom: sideEffectForm.symptom,
      severity: sideEffectForm.severity,
      description: sideEffectForm.description,
    });

    if (sideEffectForm.severity === 'SEVERE_RED_FLAG') {
      setRedFlagTriggered(true);
    }

    setShowSideEffectModal(false);
    setSideEffectForm({ medicationId: '', symptom: '', severity: 'MILD', description: '' });
    loadData();
  };

  const activeMeds = medications.filter(m => m.status === 'ACTIVE' || m.status === 'APPROVED');

  return (
    <div className="space-y-6">
      
      {/* RED FLAG EMERGENCY ALERT BANNER */}
      {redFlagTriggered && (
        <div className="p-4 bg-rose-600 text-white rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 border-2 border-rose-400 animate-pulse">
          <div className="flex items-center space-x-3">
            <AlertOctagon className="w-8 h-8 text-rose-200 shrink-0" />
            <div>
              <h4 className="font-bold text-base">SHOSHILINCH KLINIK QIZIL BAYROQ (RED FLAG)</h4>
              <p className="text-xs text-rose-100">
                O‘tkir nojo‘ya ta’sir (nafas qisishi, hushdan ketish yoki tutqanoq) qayd etildi. Zudlik bilan tez tibbiy yordam chaqiring!
              </p>
            </div>
          </div>
          <a
            href="tel:103"
            className="px-5 py-2.5 bg-white text-rose-700 font-bold rounded-xl shadow hover:bg-rose-50 flex items-center shrink-0 transition-colors"
          >
            <PhoneCall className="w-4 h-4 mr-2 text-rose-600" />
            103 Qo‘ng‘iroq qilish
          </a>
        </div>
      )}

      {/* Repeated Missed Medication Alert */}
      {adherenceData.repeatedMissedAlert && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start space-x-3 text-amber-900 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <span className="font-bold">Diqqat: Bir nechta qabul o‘tkazib yuborildi!</span>
            <p className="text-amber-800 mt-0.5">
              Dori qabul qilish tartibini o‘zboshimchalik bilan o‘zgartirmang yoki keyingi dozani ikki barobar oshirmang. Iltimos, mas'ul nevrolog / shifokor bilan bog‘laning.
            </p>
          </div>
        </div>
      )}

      {/* Top Adherence & Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Adherence Score Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Medication Adherence
            </span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">
              {adherenceData.scorePercent}%
            </div>
            <span className="text-xs text-emerald-600 font-medium flex items-center mt-1">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              {adherenceData.scorePercent >= 80 ? 'A’lo rioya qilinmoqda' : 'Monitoring talab etiladi'}
            </span>
          </div>
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="#E2E8F0"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke={adherenceData.scorePercent >= 80 ? '#059669' : '#D97706'}
                strokeWidth="6"
                strokeDasharray={175.9}
                strokeDashoffset={175.9 - (175.9 * adherenceData.scorePercent) / 100}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <Pill className="w-6 h-6 text-primary-600 absolute" />
          </div>
        </div>

        {/* Total Active Meds */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Faol Dori Kurslari
            </span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">
              {activeMeds.length} <span className="text-sm font-normal text-slate-500">ta dori</span>
            </div>
            <span className="text-xs text-slate-500 mt-1 block">
              Shifokor nazorati ostida
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-gradient-to-br from-primary-50 to-indigo-50 p-5 rounded-2xl border border-primary-100/60 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-primary-800 uppercase tracking-wider">
              Klinik Amallar
            </span>
            <p className="text-xs text-primary-600 mt-1">
              Nojo‘ya ta’sir yuzaga kelsa yoki yangi dori kiritilsa
            </p>
          </div>
          <div className="flex items-center space-x-2 mt-3">
            <button
              onClick={() => setShowSideEffectModal(true)}
              className="flex-1 py-2 px-3 bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center justify-center"
            >
              <AlertTriangle className="w-3.5 h-3.5 mr-1" />
              Nojo‘ya ta’sir
            </button>
            {onOpenDoctorModal && (
              <button
                onClick={onOpenDoctorModal}
                className="py-2 px-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center justify-center"
                title="Shifokor yangi dori kiritishi"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Yangi dori
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 97. PARENT MEDICATION DASHBOARD: TODAY'S MEDICATIONS */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Bugungi Qabul Jadvali</h3>
              <p className="text-xs text-slate-500">Shifokor ko‘rsatmasi bo‘yicha belgilangan vaqtlar</p>
            </div>
          </div>
          <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-3 py-1 rounded-full">
            {new Date().toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long' })}
          </span>
        </div>

        {activeMeds.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            Hozirda faol buyurilgan dori vositalari mavjud emas.
          </div>
        ) : (
          <div className="space-y-4">
            {activeMeds.map((med) => (
              <div
                key={med.id}
                className="p-4 bg-slate-50 hover:bg-slate-100/70 rounded-2xl border border-slate-200/70 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-primary-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Pill className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-slate-900 text-sm">{med.name}</h4>
                      <span className="text-[11px] font-semibold bg-primary-100 text-primary-800 px-2 py-0.5 rounded-md">
                        {med.dosage}
                      </span>
                      {med.requiresDoubleApproval && (
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded flex items-center font-medium">
                          <ShieldCheck className="w-3 h-3 mr-0.5" />
                          2x Shifokor tasdiqlagan
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {med.instructions} • <span className="text-slate-500">{med.foodRelation}</span>
                    </p>
                    <div className="flex items-center space-x-3 mt-2 text-[11px] text-slate-500">
                      <span>Vaqtlari: <strong className="text-slate-800">{med.scheduledTimes.join(', ')}</strong></span>
                      <span>•</span>
                      <span>Shifokor: <strong className="text-slate-700">{med.prescribingDoctorName}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Dose Actions */}
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => setSelectedMedForExplain(med)}
                    className="p-2 text-slate-500 hover:text-primary-600 hover:bg-white rounded-xl text-xs font-semibold border border-slate-200 transition-colors"
                    title="AI Tushuntirishi"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRecordDose(med, med.scheduledTimes[0] || '09:00', 'POSTPONED')}
                    className="px-3 py-2 bg-white text-slate-700 hover:bg-slate-200/60 rounded-xl text-xs font-semibold border border-slate-200 transition-colors"
                  >
                    Keyinroq
                  </button>
                  <button
                    onClick={() => handleRecordDose(med, med.scheduledTimes[0] || '09:00', 'MISSED')}
                    className="px-3 py-2 bg-white text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold border border-rose-200 transition-colors"
                  >
                    O‘tkazildi
                  </button>
                  <button
                    onClick={() => handleRecordDose(med, med.scheduledTimes[0] || '09:00', 'TAKEN')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Qabul qilindi
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Adherence Dose Logs */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center">
          <Calendar className="w-4 h-4 mr-2 text-slate-500" />
          So‘nggi Qayd Qilingan Qabullar Tarixi
        </h3>
        <div className="divide-y divide-slate-100">
          {doseLogs.slice(0, 5).map((log) => (
            <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${
                  log.status === 'TAKEN' ? 'bg-emerald-500' : log.status === 'MISSED' ? 'bg-rose-500' : 'bg-amber-500'
                }`} />
                <span className="font-semibold text-slate-800">{log.medicationName}</span>
                <span className="text-slate-400">({log.scheduledTime})</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-slate-500">{log.date} {log.actualTime && `• ${log.actualTime}`}</span>
                <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                  log.status === 'TAKEN'
                    ? 'bg-emerald-50 text-emerald-700'
                    : log.status === 'MISSED'
                    ? 'bg-rose-50 text-rose-700'
                    : 'bg-amber-50 text-amber-700'
                }`}>
                  {log.status === 'TAKEN' ? 'Qabul qilindi' : log.status === 'MISSED' ? 'O‘tkazib yuborildi' : 'Kechiktirildi'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 95. AI MEDICATION EXPLANATION MODAL */}
      {selectedMedForExplain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2 text-primary-700">
                <Pill className="w-5 h-5" />
                <h3 className="font-bold text-base">MEHR AI Dori Tushuntirishi</h3>
              </div>
              <button
                onClick={() => setSelectedMedForExplain(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs leading-relaxed text-slate-700 whitespace-pre-line space-y-3">
              <p className="font-medium">{clinicalStore.explainMedicationAI(selectedMedForExplain)}</p>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px]">
                <strong>Xavfsizlik eslatmasi:</strong> MEHR AI hech qachon dori dozasini oshirish yoki to‘xtatish haqida mustaqil buyruq bermaydi. Har qanday savolda davolovchi shifokor bilan maslahatlashing.
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedMedForExplain(null)}
                className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-xs"
              >
                Tushundim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 104. SIDE EFFECT REPORTING MODAL */}
      {showSideEffectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2 text-rose-700">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold text-base">Nojo‘ya Ta’sir Haqida Xabar Berish</h3>
              </div>
              <button
                onClick={() => setShowSideEffectModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleReportSideEffect} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Dori vositasini tanlang:</label>
                <select
                  value={sideEffectForm.medicationId}
                  onChange={(e) => setSideEffectForm({ ...sideEffectForm, medicationId: e.target.value })}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="">-- Dorini tanlang --</option>
                  {medications.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.dosage})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Kuzatilgan asosiy simptom:</label>
                <input
                  type="text"
                  placeholder="Masalan: Uyquchanlik, ko‘ngil aynishi, toshma..."
                  value={sideEffectForm.symptom}
                  onChange={(e) => setSideEffectForm({ ...sideEffectForm, symptom: e.target.value })}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Og‘irlik darajasi:</label>
                <select
                  value={sideEffectForm.severity}
                  onChange={(e) => setSideEffectForm({ ...sideEffectForm, severity: e.target.value as any })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                >
                  <option value="MILD">Yengil (Yengil uyquchanlik yoki bezovtalik)</option>
                  <option value="MODERATE">O‘rta (Ko‘ngil aynishi, yengil allergiya)</option>
                  <option value="SEVERE_RED_FLAG">🔴 OG‘IR / QIZIL BAYROQ (Nafas qisishi, hushdan ketish, tutqanoq)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Qo‘shimcha izoh:</label>
                <textarea
                  rows={3}
                  placeholder="Qachon boshlandi, qancha davom etdi va qanday choralar ko‘rildi..."
                  value={sideEffectForm.description}
                  onChange={(e) => setSideEffectForm({ ...sideEffectForm, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSideEffectModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-sm"
                >
                  Xabar berish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
