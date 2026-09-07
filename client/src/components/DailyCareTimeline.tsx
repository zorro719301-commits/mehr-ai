import React, { useState, useEffect } from 'react';
import {
  Clock, CheckCircle2, Circle, Pill, Activity, MessageSquare,
  BookOpen, Utensils, Moon, Sparkles, Filter
} from 'lucide-react';
import { clinicalStore, DailyCareTimelineItem } from '../services/clinicalStore';

interface DailyCareTimelineProps {
  childId: string;
}

export const DailyCareTimeline: React.FC<DailyCareTimelineProps> = ({ childId }) => {
  const [timelineItems, setTimelineItems] = useState<DailyCareTimelineItem[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'MEDICATION' | 'REHAB'>('ALL');

  useEffect(() => {
    loadTimeline();
  }, [childId]);

  const loadTimeline = () => {
    const items = clinicalStore.getDailyCareTimeline(childId);
    setTimelineItems(items);
  };

  const toggleComplete = (id: string) => {
    setTimelineItems(prev =>
      prev.map(item => (item.id === id ? { ...item, isCompleted: !item.isCompleted } : item))
    );
  };

  const filteredItems = timelineItems.filter(item => {
    if (filter === 'MEDICATION') return item.category === 'MEDICATION';
    if (filter === 'REHAB') {
      return ['LFK', 'ERGOTHERAPY', 'SPEECH_AAC', 'SPECIAL_ED'].includes(item.category);
    }
    return true;
  });

  const getCategoryIcon = (category: DailyCareTimelineItem['category']) => {
    switch (category) {
      case 'MEDICATION':
        return <Pill className="w-4 h-4 text-rose-500" />;
      case 'LFK':
        return <Activity className="w-4 h-4 text-blue-500" />;
      case 'ERGOTHERAPY':
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      case 'SPEECH_AAC':
        return <MessageSquare className="w-4 h-4 text-emerald-500" />;
      case 'SPECIAL_ED':
        return <BookOpen className="w-4 h-4 text-amber-500" />;
      case 'MEAL':
        return <Utensils className="w-4 h-4 text-orange-500" />;
      case 'REST':
        return <Moon className="w-4 h-4 text-indigo-500" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  const getCategoryColor = (category: DailyCareTimelineItem['category']) => {
    switch (category) {
      case 'MEDICATION':
        return 'border-rose-200 bg-rose-50/70 text-rose-800';
      case 'LFK':
        return 'border-blue-200 bg-blue-50/70 text-blue-800';
      case 'ERGOTHERAPY':
        return 'border-purple-200 bg-purple-50/70 text-purple-800';
      case 'SPEECH_AAC':
        return 'border-emerald-200 bg-emerald-50/70 text-emerald-800';
      case 'SPECIAL_ED':
        return 'border-amber-200 bg-amber-50/70 text-amber-800';
      case 'MEAL':
        return 'border-orange-200 bg-orange-50/70 text-orange-800';
      case 'REST':
        return 'border-indigo-200 bg-indigo-50/70 text-indigo-800';
      default:
        return 'border-slate-200 bg-slate-50 text-slate-800';
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              24-Soatlik Bola Parvarish Jadvali (Daily Timeline)
            </h3>
            <p className="text-xs text-slate-500">
              Dori, reabilitatsiya, ovqatlanish va dam olishning yagona muvofiqlashtirilgan ritmi
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          {[
            { id: 'ALL', label: 'Barchasi' },
            { id: 'MEDICATION', label: '💊 Dorilar' },
            { id: 'REHAB', label: '🏃 Reabilitatsiya' }
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id as any)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                filter === btn.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {filteredItems.map((item) => (
          <div key={item.id} className="relative group">
            
            {/* Timeline Marker Dot */}
            <button
              onClick={() => toggleComplete(item.id)}
              className={`absolute -left-6 top-1.5 w-5 h-5 rounded-full flex items-center justify-center transition-all bg-white border-2 ${
                item.isCompleted
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-slate-300 text-slate-300 hover:border-primary-500'
              }`}
              title={item.isCompleted ? 'Bajarildi deb belgilangan' : 'Bajarildi deb belgilash'}
            >
              {item.isCompleted ? (
                <CheckCircle2 className="w-4 h-4 fill-emerald-50 text-emerald-600" />
              ) : (
                <Circle className="w-3 h-3" />
              )}
            </button>

            {/* Timeline Card */}
            <div
              className={`p-4 rounded-2xl border transition-all ${
                item.isCompleted ? 'opacity-75 bg-slate-50/60 border-slate-200/60' : 'bg-white border-slate-200/90 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-xs text-slate-900 px-2.5 py-0.5 rounded-lg bg-slate-100">
                    {item.time}
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${getCategoryColor(item.category)}`}>
                    {getCategoryIcon(item.category)}
                    {item.title}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium shrink-0">
                  {item.targetRole}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-1">
                {item.description}
              </p>
            </div>

          </div>
        ))}
      </div>

      {/* Integration Footer Tip */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center">
          <Sparkles className="w-4 h-4 mr-1 text-primary-600" />
          Dori va LFK mashg‘ulotlari o‘rtasidagi 30 daqiqalik xavfsizlik tanaffusi avtomatik hisobga olingan.
        </span>
        <button
          onClick={loadTimeline}
          className="text-primary-600 font-semibold hover:underline"
        >
          Jadvalni yangilash
        </button>
      </div>

    </div>
  );
};
