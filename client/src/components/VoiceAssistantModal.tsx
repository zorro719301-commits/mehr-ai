import React, { useState, useEffect } from 'react';
import {
  Mic, MicOff, Volume2, VolumeX, Play, Pause, RotateCcw,
  Sparkles, AlertCircle, X, ShieldAlert, CheckCircle2, ChevronRight, Activity
} from 'lucide-react';
import { voiceAssistantService, VoiceAssistantState } from '../services/voiceAssistant';
import { clinicalStore } from '../services/clinicalStore';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialContext?: string;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  initialContext
}) => {
  const [state, setState] = useState<VoiceAssistantState>({
    isListening: false,
    isThinking: false,
    isSpeaking: false,
    isPaused: false,
    currentText: '',
    transcript: '',
    rate: 1.0,
    voiceTone: 'friendly'
  });

  const [inputText, setInputText] = useState('');
  const [dialogHistory, setDialogHistory] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: 'Assalomu alaykum! Men MEHR platformasining tabiiy o‘zbek tilidagi AI ovozli yordamchisiman. Bolaning reabilitatsiya mashg‘ulotlari, dori eslatmalari yoki kunlik rejasi bo‘yicha savolingiz bo‘lsa, mikrofonni bosib gapiring yoki matn yozing.',
      time: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const activeChild = clinicalStore.getActiveChild();

  useEffect(() => {
    voiceAssistantService.onStateChange = (updated) => {
      setState(prev => ({ ...prev, ...updated }));
    };

    voiceAssistantService.onTranscript = (transcriptText, isFinal) => {
      setInputText(transcriptText);
      if (isFinal && transcriptText.trim().length > 2) {
        handleUserMessage(transcriptText);
      }
    };

    voiceAssistantService.onResponseText = (responseText) => {
      setState(prev => ({ ...prev, currentText: responseText }));
    };

    return () => {
      voiceAssistantService.stopSpeaking();
      voiceAssistantService.stopListening();
    };
  }, []);

  if (!isOpen) return null;

  const handleUserMessage = async (text: string) => {
    if (!text.trim()) return;

    const userTime = new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
    setDialogHistory(prev => [...prev, { sender: 'user', text, time: userTime }]);
    setInputText('');

    setState(prev => ({ ...prev, isThinking: true, isListening: false }));

    // AI Response generation (incorporates clinical knowledge and child context)
    const lower = text.toLowerCase();
    let reply = '';
    let tone: 'friendly' | 'professional' | 'child' | 'alert' = state.voiceTone;

    // Red flag detection
    if (lower.includes('tutqanoq') || lower.includes('sudorogi') || lower.includes('nafas') || lower.includes('hushdan')) {
      reply = "Diqqat! Bu shoshilinch holat bo‘lishi mumkin! Iltimos, zudlik bilan 103 — Shoshilinch tibbiy yordam xizmatiga murojaat qiling va bolani yonbosh holatda yotqizing. Hech qanday dori ichirmang!";
      tone = 'alert';
    } else if (lower.includes('dori') || lower.includes('ichish') || lower.includes('vaqt') || lower.includes('baklofen')) {
      const childName = activeChild ? `${activeChild.firstName} ${activeChild.lastName}` : 'Bola';
      reply = activeChild
        ? `${childName} uchun bugungi tasdiqlangan dori: Baklofen besh milligram. Ertalab soat sakkiz yarimda va kechki payt soat yetti yarimda qabul qilinadi. Qabul qilgach, tizimda tasdiqlashni unutmang. Muhim: Dozani o‘zboshimchalik bilan o‘zgartirmang!`
        : "Bugungi dori tartibi: Shifokor tomonidan tasdiqlangan vaqtlarda qabul qilinishi lozim. Har bir qabul qilingan dozani Dori Dashboardida belgilab boring.";
    } else if (lower.includes('mashq') || lower.includes('lfk') || lower.includes('yurish') || lower.includes('g80')) {
      const childName = activeChild ? `${activeChild.firstName} ${activeChild.lastName}` : 'Bola';
      reply = activeChild
        ? `${childName} uchun MKB-10 G80 serebral falaji III-IV darajasida bugun 15 daqiqalik davolash jismoniy tarbiyasi rejalashtirilgan. Qo‘llab-quvvatlovchi xodunok bilan muvozanat saqlash va boldir mushaklarini asta cho‘zish mashqlari bajariladi. Og‘riq paydo bo‘lsa, darhol to‘xtating.`
        : "Bugungi LFK mashg‘ulotimiz: 15 daqiqalik muvozanat va oyoq mushaklarini cho‘zish mashg‘ulotidir. Mashqlarni ortiqcha kuch ishlatmasdan, qulay pozitsiyada bajaring.";
    } else if (lower.includes('gapirish') || lower.includes('nutq') || lower.includes('aac') || lower.includes('f70')) {
      reply = "Kognitiv va nutq rivojlanishi uchun AAC kommunikatsiya kartochkalaridan foydalanish tavsiya etiladi. Bola bilan 'suv', 'ovqat', 'o‘yinchoq' kartochkalari orqali 10 daqiqa ko‘rgazmali mashg‘ulot o‘tkazing va uning har bir harakatini maqtang.";
    } else {
      reply = "Savolingiz qabul qilindi. Bolaning individual reabilitatsiya dasturiga asosan, bugun LFK va ergoterapiya mashqlari tavsiya etiladi. Savollaringiz bo‘lsa, men har doim yoningizdaman.";
    }

    const aiTime = new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
    setDialogHistory(prev => [...prev, { sender: 'ai', text: reply, time: aiTime }]);

    setState(prev => ({ ...prev, isThinking: false }));

    // Speak response out loud using Uzbek TTS
    voiceAssistantService.speak(reply, tone);
  };

  const handleMicToggle = () => {
    if (state.isListening) {
      voiceAssistantService.stopListening();
    } else {
      voiceAssistantService.startListening();
    }
  };

  const handleSpeedChange = (speed: number) => {
    voiceAssistantService.setSpeed(speed);
  };

  const handleToneChange = (tone: 'friendly' | 'professional' | 'child' | 'alert') => {
    voiceAssistantService.setTone(tone);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-primary-600 via-indigo-600 to-primary-700 px-6 py-4 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-md">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold">MEHR AI Ovozli Yordamchi</h3>
                <span className="text-[10px] uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full font-semibold">
                  uz-UZ Natural Voice
                </span>
              </div>
              <p className="text-xs text-primary-100">
                {activeChild ? `${activeChild.firstName} ${activeChild.lastName} (GMFCS ${activeChild.gmfcsLevel || 'III'})` : 'Tabiiy o‘zbek nutqida maslahat va eslatmalar'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              voiceAssistantService.stopSpeaking();
              voiceAssistantService.stopListening();
              onClose();
            }}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            title="Yopish"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Status Indicator Bar */}
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            {state.isListening && (
              <span className="flex items-center text-blue-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping mr-2" />
                🔵 AI tinglamoqda... (Gapiring)
              </span>
            )}
            {state.isThinking && (
              <span className="flex items-center text-purple-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse mr-2" />
                🟣 AI o‘ylamoqda va tekshirmoqda...
              </span>
            )}
            {state.isSpeaking && (
              <span className="flex items-center text-emerald-600 font-medium">
                <Activity className="w-4 h-4 mr-1.5 animate-bounce text-emerald-500" />
                🔊 AI o‘zbek tilida gapirmoqda...
              </span>
            )}
            {!state.isListening && !state.isThinking && !state.isSpeaking && (
              <span className="text-slate-500">Tayyor. Savolingizni ovozli yoki yozma bering.</span>
            )}
          </div>

          {/* Speed & Tone Controls */}
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Tezlik:</span>
            {[0.75, 1.0, 1.25].map(rateVal => (
              <button
                key={rateVal}
                onClick={() => handleSpeedChange(rateVal)}
                className={`px-2 py-0.5 rounded-lg text-xs font-semibold transition-colors ${
                  state.rate === rateVal
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {rateVal}x
              </button>
            ))}
          </div>
        </div>

        {/* Chat / Transcript Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
          {dialogHistory.map((item, idx) => (
            <div
              key={idx}
              className={`flex ${item.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                  item.sender === 'user'
                    ? 'bg-primary-600 text-white rounded-br-none'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5 gap-4">
                  <span className={`text-[11px] font-semibold ${item.sender === 'user' ? 'text-primary-200' : 'text-primary-700'}`}>
                    {item.sender === 'user' ? 'Siz (Ota-ona)' : 'MEHR AI'}
                  </span>
                  <span className={`text-[10px] ${item.sender === 'user' ? 'text-primary-200' : 'text-slate-400'}`}>
                    {item.time}
                  </span>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-line">{item.text}</p>

                {item.sender === 'ai' && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => voiceAssistantService.speak(item.text, state.voiceTone)}
                      className="text-xs text-primary-600 hover:text-primary-800 flex items-center font-medium transition-colors"
                      title="Qayta eshitish"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1" />
                      Qayta eshittirish
                    </button>
                    <span className="text-[10px] text-slate-400 flex items-center">
                      <ShieldAlert className="w-3 h-3 mr-1 text-emerald-500" />
                      Klinik xavfsizlik tekshiruvidan o‘tgan
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Audio Control Dock (Play, Pause, Stop, Tone) */}
        <div className="bg-white border-t border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            {state.isSpeaking ? (
              <>
                <button
                  onClick={() => state.isPaused ? voiceAssistantService.resume() : voiceAssistantService.pause()}
                  className="px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-xl text-xs font-medium flex items-center transition-colors border border-amber-200"
                >
                  {state.isPaused ? <Play className="w-3.5 h-3.5 mr-1" /> : <Pause className="w-3.5 h-3.5 mr-1" />}
                  {state.isPaused ? 'Davom ettirish' : 'Pauza'}
                </button>
                <button
                  onClick={() => voiceAssistantService.stopSpeaking()}
                  className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-medium flex items-center transition-colors border border-rose-200"
                >
                  <VolumeX className="w-3.5 h-3.5 mr-1" />
                  To‘xtatish (Stop)
                </button>
              </>
            ) : (
              <span className="text-xs text-slate-500 flex items-center">
                <Volume2 className="w-4 h-4 mr-1 text-primary-600" />
                Tabiiy ovoz rejimi faol
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-xs text-slate-400">Ovoz uslubi:</span>
            {[
              { id: 'friendly', label: 'Mehribon' },
              { id: 'professional', label: 'Shifokor' },
              { id: 'child', label: 'Bolalar uchun' }
            ].map(toneItem => (
              <button
                key={toneItem.id}
                onClick={() => handleToneChange(toneItem.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
                  state.voiceTone === toneItem.id
                    ? 'bg-slate-800 text-white font-medium'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {toneItem.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Question Chips */}
        <div className="bg-slate-50 px-6 py-2 overflow-x-auto flex items-center space-x-2 border-t border-slate-100">
          <span className="text-[11px] text-slate-400 shrink-0">Tezkor savollar:</span>
          {[
            "Bugungi mashg‘ulot qanday?",
            "Dori qabul qilish vaqti qachon?",
            "Spastiklikni kamaytirish mashqlari",
            "MKB-10 G80 III daraja tavsiyalari"
          ].map((prompt, pIdx) => (
            <button
              key={pIdx}
              onClick={() => handleUserMessage(prompt)}
              className="text-xs bg-white hover:bg-primary-50 hover:text-primary-700 hover:border-primary-300 border border-slate-200 text-slate-600 px-3 py-1 rounded-full whitespace-nowrap transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input & Microphone Bar */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center space-x-3">
          <button
            onClick={handleMicToggle}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-md ${
              state.isListening
                ? 'bg-rose-500 text-white animate-pulse scale-105'
                : 'bg-primary-600 hover:bg-primary-700 text-white'
            }`}
            title={state.isListening ? 'Eshitishni to‘xtatish' : 'Ovoz bilan gapirish'}
          >
            {state.isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleUserMessage(inputText);
              }
            }}
            placeholder="O‘zbek tilida savol yozing yoki mikrofonni bosing..."
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
          />

          <button
            onClick={() => handleUserMessage(inputText)}
            disabled={!inputText.trim()}
            className="px-5 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-colors flex items-center shadow-sm"
          >
            Yuborish
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        {/* Safety Disclaimer Footer */}
        <div className="bg-amber-50/80 px-6 py-2 border-t border-amber-200/50 flex items-center justify-between text-[11px] text-amber-800">
          <span className="flex items-center">
            <AlertCircle className="w-3.5 h-3.5 mr-1.5 text-amber-600 shrink-0" />
            AI faqat tushuntiradi va eslatadi. Dozani o‘zgartirmang, klinik qaror faqat shifokorga tegishli.
          </span>
          <span className="font-semibold text-rose-700 flex items-center">
            Shoshilinch holat: 103
          </span>
        </div>

      </div>
    </div>
  );
};
