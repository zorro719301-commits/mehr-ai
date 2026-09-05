import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { api } from '../services/api.js';
import {
  Volume2,
  Plus,
  Trash2,
  Sparkles,
  Play,
  Check,
  Droplet,
  Heart,
  Utensils,
  Smile,
  Moon,
  HelpCircle,
  Repeat,
  AlertTriangle
} from 'lucide-react';

export const AacPage: React.FC = () => {
  const { activeChild } = useAuth();
  const { language } = useLanguage();

  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [sentenceStrip, setSentenceStrip] = useState<any[]>([]);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newLabelRu, setNewLabelRu] = useState('');

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const res = await api.get('/api/aac/cards');
      if (res.success && res.data && res.data.length > 0) {
        setCategories(res.data);
        setSelectedCategoryId(res.data[0].id);
      }
    } catch (e) {
      console.error('Failed to load AAC cards:', e);
    }
  };

  // Web Speech API speech synthesis
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) {
      alert(`Ovoz chiqarildi: "${text}" (Brauzeringiz ovoz sintezini qo‘llab-quvvatlamaydi)`);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'ru' ? 'ru-RU' : language === 'en' ? 'en-US' : 'uz-UZ';
    utterance.rate = 0.9; // clear, gentle pace for pediatric communication
    window.speechSynthesis.speak(utterance);
  };

  const handleCardClick = (card: any) => {
    const label = language === 'ru' && card.labelRu ? card.labelRu : card.label;
    speakText(label);
    setSentenceStrip((prev) => [...prev, card]);
  };

  const playSentence = () => {
    if (sentenceStrip.length === 0) return;
    const fullSentence = sentenceStrip
      .map((c) => (language === 'ru' && c.labelRu ? c.labelRu : c.label))
      .join(' ');
    speakText(fullSentence);
  };

  const clearSentence = () => {
    setSentenceStrip([]);
  };

  const handleAddCustomCard = async () => {
    if (!newLabel || !selectedCategoryId) return;
    try {
      const res = await api.post('/api/aac/cards', {
        categoryId: selectedCategoryId,
        label: newLabel,
        labelRu: newLabelRu || newLabel,
        labelEn: newLabel,
      });
      if (res.success) {
        setIsAddingCard(false);
        setNewLabel('');
        setNewLabelRu('');
        loadCards();
      }
    } catch (e) {
      console.error('Failed to add custom card:', e);
    }
  };

  const activeCategory = categories.find((c) => c.id === selectedCategoryId) || categories[0];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-soft">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <span>AAC Aloqa Doskasi</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-brand-700 font-bold border border-brand-200">
              Ovozli
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Nutqi cheklangan bolalar uchun vizual kartochkalar va nutq sintezatori.
          </p>
        </div>

        <button
          onClick={() => setIsAddingCard(true)}
          className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs shadow-xs flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-brand-600" />
          <span>Yangi kartochka qo‘shish</span>
        </button>
      </div>

      {/* INTERACTIVE SENTENCE STRIP ("Men" + "Suv" + "Xohlayman") */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-4 sm:p-6 rounded-3xl shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-extrabold tracking-wider text-brand-300">
            JUMIA TUZISH CHIZIG‘I (SENTENCE STRIP)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={playSentence}
              disabled={sentenceStrip.length === 0}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-30 text-white font-extrabold text-xs shadow-sm flex items-center space-x-1.5 transition-all"
            >
              <Volume2 className="w-4 h-4" />
              <span>O‘qib eshittirish</span>
            </button>
            <button
              onClick={clearSentence}
              disabled={sentenceStrip.length === 0}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white transition-colors"
              title="Tozalash"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Selected Cards in the Strip */}
        <div className="min-h-[100px] p-3 rounded-2xl bg-white/10 border border-white/15 flex flex-wrap items-center gap-3">
          {sentenceStrip.length === 0 ? (
            <div className="text-sm text-slate-400 italic mx-auto text-center py-4">
              Quyidagi kartochkalarni bosib jumlani shakllantiring (Masalan: “Men” ➔ “Suv” ➔ “Xohlayman”)
            </div>
          ) : (
            sentenceStrip.map((card, idx) => (
              <div
                key={idx}
                className="px-4 py-3 rounded-2xl bg-white text-slate-900 font-extrabold text-sm shadow-md border-2 border-brand-400 flex items-center space-x-2 animate-popIn"
              >
                <span>{language === 'ru' && card.labelRu ? card.labelRu : card.label}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CATEGORY TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategoryId(cat.id)}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs whitespace-nowrap transition-all ${
              selectedCategoryId === cat.id
                ? 'bg-brand-600 text-white shadow-card scale-105'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat.name} ({cat.cards?.length || 0})
          </button>
        ))}
      </div>

      {/* AAC CARDS GRID */}
      {activeCategory && activeCategory.cards && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {activeCategory.cards.map((card: any) => {
            const displayLabel = language === 'ru' && card.labelRu ? card.labelRu : card.label;
            return (
              <button
                key={card.id}
                onClick={() => handleCardClick(card)}
                className="p-4 sm:p-5 rounded-3xl bg-white border-2 border-slate-200 hover:border-brand-500 hover:shadow-card active:scale-95 transition-all flex flex-col items-center justify-between text-center min-h-[140px] group shadow-soft"
              >
                <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Volume2 className="w-6 h-6" />
                </div>
                <span className="font-extrabold text-base text-slate-800 group-hover:text-brand-600 mt-2">
                  {displayLabel}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase mt-1">
                  Bosilsa eshitiladi
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ADD CARD MODAL */}
      {isAddingCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-lg text-slate-900">Yangi AAC Kartochka Qo‘shish</h3>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Kartochka nomi (O‘zbekcha) *</label>
              <input
                type="text"
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-brand-500"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Masalan: Koptok"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Kartochka nomi (Ruscha)</label>
              <input
                type="text"
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-brand-500"
                value={newLabelRu}
                onChange={(e) => setNewLabelRu(e.target.value)}
                placeholder="Мяч"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsAddingCard(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleAddCustomCard}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-600 text-white hover:bg-brand-700 shadow-sm"
              >
                Qo‘shish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
