import React, { useState } from 'react';
import { Sparkles, X, Send, AlertTriangle, Shield, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';

interface MessageItem {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  escalate?: boolean;
  suggestedActions?: string[];
  disclaimer?: string;
}

export const AiAssistantChatModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { activeChild } = useAuth();
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: '1',
      sender: 'ai',
      text: `Assalomu alaykum! Men MEHR AI klinik yordamchisiman. ${
        activeChild ? `${activeChild.firstName}ning individual profili, faol mashg‘ulotlari va ehtiyojlarini hisobga olgan holda` : 'Bolaning rivojlanishi bo‘yicha'
      } xavfsiz va amaliy ko‘mak berishga tayyorman. Qanday savolingiz bor?`,
      disclaimer: 'AI yordamchi tavsiyasi — mutaxassis xulosasining o‘rnini bosmaydi.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const quickPrompts = [
    'Bugun bola mashq qilishni xohlamayapti',
    'Tantrum boshlanganda nima qilish kerak?',
    'AAC kartochkasini qo‘lida ushlamayapti',
    'Yotishdan oldin qanday tinchlantirish mumkin?',
  ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: MessageItem = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/api/ai/chat', {
        childId: activeChild?.id || 'sample',
        message: query,
      });

      if (res.success && res.data) {
        const aiMsg: MessageItem = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: res.data.answer,
          escalate: res.data.escalateToSpecialist,
          suggestedActions: res.data.suggestedActions,
          disclaimer: res.data.disclaimer,
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: 'Ulanishda xatolik yuz berdi. Iltimos, qayta urinib ko‘ring.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-2xl h-[650px] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-indigo-600 p-4 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-1.5">
                MEHR AI YORDAMCHI
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-400 text-emerald-950">
                  Faol
                </span>
              </h3>
              <p className="text-xs text-brand-100">
                {activeChild ? `Bola: ${activeChild.firstName} (${activeChild.region})` : 'Individual rivojlanish va ota-ona ko‘makchi'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Clinical Safety Alert Banner */}
        <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 flex items-center justify-between text-xs text-blue-900">
          <span className="flex items-center gap-1.5 font-medium">
            <Shield className="w-4 h-4 text-brand-600" />
            Tavsiyalar bolaning yoshi, tashxisi va faol paketi doirasida filtrlangan.
          </span>
        </div>

        {/* Message History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-brand-600 text-white rounded-br-none'
                    : msg.escalate
                    ? 'bg-red-50 border-2 border-red-300 text-red-950 rounded-bl-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                }`}
              >
                {msg.escalate && (
                  <div className="flex items-center gap-2 text-red-700 font-bold mb-2 pb-1 border-b border-red-200">
                    <AlertTriangle className="w-4 h-4" />
                    <span>ZUDLIK BILAN TIBBIY YORDAM OGOHLANTIRISHI</span>
                  </div>
                )}

                <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>

                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-100 text-xs">
                    <div className="font-semibold text-slate-700 mb-1">Tavsiya etilgan amallar:</div>
                    <ul className="space-y-1">
                      {msg.suggestedActions.map((act, i) => (
                        <li key={i} className="flex items-center gap-1.5 text-slate-600">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {msg.disclaimer && (
                  <div className="mt-2 text-[11px] text-slate-400 italic">
                    {msg.disclaimer}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-xs text-slate-500 bg-white px-3 py-2 rounded-full w-fit shadow-sm border border-slate-200">
              <Sparkles className="w-3.5 h-3.5 text-brand-600 animate-spin" />
              <span>MEHR AI tahlil qilmoqda...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              className="text-xs bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 font-medium px-3 py-1.5 rounded-full border border-slate-200 whitespace-nowrap transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            className="flex-1 text-sm bg-slate-100 border border-slate-200 rounded-2xl px-4 py-2.5 outline-none focus:border-brand-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
            placeholder="Savolingizni yozing (masalan: Bugun mashq qilishni xohlamayapti...)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="p-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-2xl shadow-sm transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
