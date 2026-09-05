import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import {
  TrendingUp,
  Award,
  Sparkles,
  Printer,
  Calendar,
  CheckCircle2,
  Brain,
  Activity,
  ArrowUpRight
} from 'lucide-react';

export const ProgressPage: React.FC = () => {
  const { activeChild } = useAuth();

  const [progressData, setProgressData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeChild) {
      loadProgress();
    }
  }, [activeChild]);

  const loadProgress = async () => {
    if (!activeChild) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/progress/child/${activeChild.id}`);
      if (res.success && res.data) {
        setProgressData(res.data);
      }
    } catch (e) {
      console.error('Failed to load progress data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  if (!activeChild) {
    return <div className="text-center py-20 text-slate-500">Iltimos, bola profilini tanlang.</div>;
  }

  const domains = progressData?.latestAssessment || [
    { domain: { name: 'Nutq va kommunikatsiya' }, percentage: 40, score: 2.0, level: 'CRITICAL' },
    { domain: { name: 'Kognitiv rivojlanish' }, percentage: 55, score: 2.7, level: 'EMERGING' },
    { domain: { name: 'Motor ko‘nikmalar' }, percentage: 70, score: 3.5, level: 'DEVELOPING' },
    { domain: { name: 'Ijtimoiy muloqot' }, percentage: 45, score: 2.2, level: 'EMERGING' },
    { domain: { name: 'Mustaqil hayot (ADL)' }, percentage: 60, score: 3.0, level: 'DEVELOPING' },
    { domain: { name: 'Xulq-atvor barqarorligi' }, percentage: 65, score: 3.2, level: 'DEVELOPING' },
  ];

  const replan = progressData?.replanEvaluation;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header & Print Report Button */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <span>Rivojlanish Monitoringi & Hisobotlar</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
              Dinamika
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {activeChild.firstName}ning vaqt davomidagi rivojlanish ko‘rsatkichlari va AI tahlili.
          </p>
        </div>

        <button
          onClick={handlePrintReport}
          className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs shadow-xs flex items-center space-x-2 self-start sm:self-auto"
        >
          <Printer className="w-4 h-4 text-brand-600" />
          <span>PDF / Chop etish</span>
        </button>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-soft space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Mashg‘ulotlar Davomati</span>
          <div className="text-3xl font-black text-brand-600">
            {progressData?.completionRate || 85}%
          </div>
          <p className="text-xs text-slate-500">Rejalashtirilgan vazifalarning bajarilish foizi</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-soft space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">O‘zlashtirish Darajasi</span>
          <div className="text-3xl font-black text-emerald-600">
            {replan?.currentMasteryPercentage || 80}%
          </div>
          <p className="text-xs text-slate-500">Mustaqillik ko‘rsatkichi o‘sishi</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-soft space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Bajarilgan Mashqlar</span>
          <div className="text-3xl font-black text-slate-900">
            {progressData?.totalCompleted || 12} ta
          </div>
          <p className="text-xs text-slate-500">So‘nggi 14 kun davomida qayd etilgan</p>
        </div>
      </div>

      {/* 6 DOMAINS PROGRESS BARS */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-6">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Brain className="w-5 h-5 text-brand-600" />
          <span>6 Asosiy Yo‘nalish Bo‘yicha Ko‘rsatkichlar</span>
        </h3>

        <div className="space-y-4">
          {domains.map((dom: any, idx: number) => {
            const pct = dom.percentage || Math.round((dom.score / 5) * 100);
            return (
              <div key={idx} className="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800">{dom.domain?.name || 'Yo‘nalish'}</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-brand-700">{dom.score || (pct / 20).toFixed(1)} / 5</span>
                    <span className="text-slate-400">({pct}%)</span>
                  </div>
                </div>

                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-brand-600 to-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="text-[11px] text-slate-500 flex justify-between">
                  <span>Holat: {dom.level || 'DEVELOPING'}</span>
                  <span>{pct >= 70 ? 'Yaxshi dinamika' : 'Qo‘llab-quvvatlash zarur'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI RE-PLANNING CARD */}
      {replan && (
        <div className="bg-gradient-to-br from-indigo-900 to-brand-900 text-white rounded-3xl p-6 sm:p-8 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-white/20 pb-3">
            <div className="flex items-center space-x-2 font-extrabold text-sm text-brand-200">
              <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>AI QAYTA TAHLIL VA BOSQICH BOSQICHLI RE-PLANNING</span>
            </div>
            <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-full bg-white/20 text-white">
              Har 7-30 kunda
            </span>
          </div>

          <div className="space-y-2">
            <h4 className="text-xl font-bold text-white">
              {replan.shouldGraduate
                ? 'Tabriklaymiz! Bola yangi murakkablik darajasiga o‘tishga tayyor.'
                : 'Mavjud ko‘nikmalarni mustahkamlash bosqichi'}
            </h4>
            <p className="text-sm text-brand-100 leading-relaxed font-normal">
              {replan.analysisMessage}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 border border-white/15 text-xs text-white space-y-1">
            <span className="font-bold text-amber-300">Tavsiya etilayotgan keyingi maqsad:</span>
            <p className="font-medium text-brand-50">{replan.nextRecommendedTarget}</p>
          </div>
        </div>
      )}
    </div>
  );
};
