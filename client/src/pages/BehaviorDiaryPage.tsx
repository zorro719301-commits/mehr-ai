import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import {
  BookOpen,
  Plus,
  Sparkles,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Smile,
  ShieldCheck,
  Zap
} from 'lucide-react';

export const BehaviorDiaryPage: React.FC = () => {
  const { activeChild } = useAuth();

  const [logs, setLogs] = useState<any[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New log form state
  const [situation, setSituation] = useState('Oshxonada / Uy muhiti');
  const [behaviorDescription, setBehaviorDescription] = useState('');
  const [antecedent, setAntecedent] = useState('');
  const [parentResponse, setParentResponse] = useState('');
  const [outcome, setOutcome] = useState('');
  const [severity, setSeverity] = useState('MILD');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (activeChild) {
      loadLogs();
    }
  }, [activeChild]);

  const loadLogs = async () => {
    if (!activeChild) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/behavior/child/${activeChild.id}`);
      if (res.success && res.data) {
        setLogs(res.data.logs || []);
        setAiAnalysis(res.data.aiAnalysis || null);
      }
    } catch (e) {
      console.error('Failed to load behavior logs:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLog = async () => {
    if (!activeChild || !behaviorDescription || !antecedent) {
      alert('Iltimos, xatti-harakat va uning sababi (oldidan nima bo‘lgani)ni to‘ldiring.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/api/behavior', {
        childId: activeChild.id,
        situation,
        behaviorDescription,
        antecedent,
        parentResponse,
        outcome,
        severity,
      });

      if (res.success) {
        setIsModalOpen(false);
        setBehaviorDescription('');
        setAntecedent('');
        setParentResponse('');
        setOutcome('');
        loadLogs();
      }
    } catch (e) {
      console.error('Failed to create behavior log:', e);
    } finally {
      setSubmitting(false);
    }
  };

  if (!activeChild) {
    return <div className="text-center py-20 text-slate-500">Iltimos, bola profilini tanlang.</div>;
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header & New Log Button */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <span>Xulq-atvor Kundaligi (ABC Tizimi)</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold border border-amber-200">
              Trigger tahlili
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Bolaning harakatlari, triggerlar (sabablar) va oqibatlarni tizimli kuzatib borish jurnali.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-card flex items-center space-x-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi hodisani qayd etish</span>
        </button>
      </div>

      {/* AI PATTERN RECOGNITION CARD */}
      {aiAnalysis && (
        <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-indigo-500/10 rounded-3xl p-6 sm:p-8 border border-amber-200/80 shadow-soft space-y-6">
          <div className="flex items-center justify-between border-b border-amber-200/60 pb-3">
            <div className="flex items-center space-x-2 text-amber-950 font-extrabold text-sm">
              <Sparkles className="w-4 h-4 text-amber-600 fill-amber-600" />
              <span>AI NAQSHLAR VA TRIGGERLAR TAHLILI</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-amber-800 bg-white px-2.5 py-1 rounded-full border border-amber-200 shadow-xs">
              Algoritmik xulosa
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ehtimoliy Triggerlar */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span>Aniqlangan Ehtimoliy Triggerlar:</span>
              </h4>
              <ul className="space-y-2">
                {aiAnalysis.triggers?.map((tr: string, i: number) => (
                  <li key={i} className="text-xs bg-white p-3 rounded-xl border border-amber-200/70 text-slate-800 shadow-xs font-medium">
                    • {tr}
                  </li>
                ))}
              </ul>
            </div>

            {/* AI Tavsiya qilgan Xavfsiz Strategiyalar */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ota-ona uchun xavfsiz strategiyalar:</span>
              </h4>
              <ul className="space-y-2">
                {aiAnalysis.suggestedStrategies?.map((st: string, i: number) => (
                  <li key={i} className="text-xs bg-white p-3 rounded-xl border border-emerald-200/70 text-slate-800 shadow-xs font-medium">
                    ✔ {st}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 italic">
            {aiAnalysis.disclaimer}
          </div>
        </div>
      )}

      {/* RECENT LOGS TIMELINE */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-6">
        <h3 className="text-lg font-bold text-slate-900">Qayd Etilgan Hodisalar Tarixi</h3>

        {logs.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">
            Hozircha xulq-atvor kundaligida yozuvlar mavjud emas. Yuqoridagi tugma orqali yangi hodisani qo‘shing.
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-3 hover:border-brand-300 transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                  <div className="flex items-center space-x-2 text-xs text-slate-500 font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-brand-600" />
                    <span>{new Date(item.timestamp).toLocaleString()}</span>
                    <span>•</span>
                    <span className="text-slate-800 font-bold">{item.situation}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.severity === 'SEVERE'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    Daraja: {item.severity}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                    <span className="font-bold text-slate-700 block mb-1">Oldidan nima bo‘ldi (A):</span>
                    <p className="text-slate-600">{item.antecedent}</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                    <span className="font-bold text-slate-700 block mb-1">Xatti-harakat (B):</span>
                    <p className="text-slate-600 font-medium">{item.behaviorDescription}</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                    <span className="font-bold text-slate-700 block mb-1">Oqibat / Ota-ona reaksiyasi (C):</span>
                    <p className="text-slate-600">{item.parentResponse} ➔ {item.outcome}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* NEW LOG MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-slate-900">Yangi Xulq-atvor Hodisasini Qayd Etish</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Vaziyat / Qayerda sodir bo‘ldi *</label>
              <input
                type="text"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-brand-500"
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                placeholder="Oshxonada, kechki ovqat payti"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Oldidan nima bo‘ldi? (Trigger / Antecedent) *</label>
              <textarea
                rows={2}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-brand-500"
                value={antecedent}
                onChange={(e) => setAntecedent(e.target.value)}
                placeholder="Multfilm to‘xtatildi yoki baland musiqa yangradi..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Bolaning xatti-harakati (Behavior) *</label>
              <textarea
                rows={2}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-brand-500"
                value={behaviorDescription}
                onChange={(e) => setBehaviorDescription(e.target.value)}
                placeholder="Baland yig‘lash, polga yotib olish, qo‘l siltash..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Ota-ona nima qildi? (Consequence)</label>
              <input
                type="text"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-brand-500"
                value={parentResponse}
                onChange={(e) => setParentResponse(e.target.value)}
                placeholder="Sokin quchoqlab tinchlantirdi, sokin xonaga olib chiqildi"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Natija</label>
              <input
                type="text"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-brand-500"
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                placeholder="3 daqiqada tinchlandi"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleCreateLog}
                disabled={submitting}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-600 text-white hover:bg-brand-700 shadow-sm"
              >
                {submitting ? 'Saqlanmoqda...' : 'Saqlash va AI tahlil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
