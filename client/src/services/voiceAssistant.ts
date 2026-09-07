/**
 * MEHR Platform - Natural Uzbek Voice Assistant Engine (Section 36)
 * O‘zbekiston sharoitiga moslashtirilgan tabiiy o‘zbek tili ovozli yordamchisi.
 * STT (Speech-to-Text) + Text Normalizer + Uzbek Phonetic Engine + TTS + Safety Guards.
 */

export interface VoiceAssistantState {
  isListening: boolean;
  isThinking: boolean;
  isSpeaking: boolean;
  isPaused: boolean;
  currentText: string;
  transcript: string;
  rate: number; // 0.75, 1.0, 1.25, 1.5
  voiceTone: 'friendly' | 'professional' | 'child' | 'alert';
}

// 17. O‘zbekcha talaffuz va tibbiy atamalar lug‘ati
export const UZBEK_PRONUNCIATION_DICTIONARY: Record<string, string> = {
  'mkb-10': 'Em ka be o‘n',
  'mkb10': 'Em ka be o‘n',
  'g80': 'Ge sakson, bolalar serebral falaji',
  'f70': 'Ef yetmish, yengil intellektual rivojlanish buzilishi',
  'f71': 'Ef yetmish bir, o‘rta darajadagi aqliy zaiflik',
  'f84': 'Ef sakson to‘rt, bolalar autizmi',
  'h90.3': 'Ha to‘qson nuqta uch, koxlear implant va eshitish apparati holati',
  'gmfcs': 'Ge em ef se se, yirik motor funksiyalar tasnifi',
  'macs': 'Em a se se, qo‘l harakati qobiliyati tasnifi',
  'cfcs': 'Se ef se se, kommunikatsiya funksiyasi tasnifi',
  'lfk': 'El ef ka, davolash jismoniy tarbiyasi',
  'aac': 'A a se, muqobil va kengaytiruvchi muloqot',
  'adl': 'A de el, kundalik hayot faoliyati',
  'iep': 'I e pe, individual ta\'lim rejasi',
  'ergoterapiya': 'ergoterapiya, maishiy moslashuv mashg‘uloti',
  'logoped': 'logoped, nutq terapevti',
  'defektolog': 'defektolog, maxsus pedagog',
  'spastiklik': 'spastiklik, mushaklarning ortiqcha tarangligi',
  'kontraktura': 'kontraktura, bo‘g‘im harakatining cheklanishi',
  'ortez': 'ortez, fiksatsiya qiluvchi moslama',
  'baklofen': 'baklofen, mushak bo‘shashtiruvchi dori',
  'antikonvulsant': 'antikonvulsant, tutqanoqqa qarshi dori',
  'adherence': 'adxerens, dori qabul qilishga rioya ko‘rsatkichi',
  'red flag': 'qizil bayroq, shoshilinch holat',
  '103': 'bir yuz uch, tez tibbiy yordam',
};

// O‘zbekcha sonlar
const UZBEK_NUMBERS: Record<number, string> = {
  0: 'nol',
  1: 'bir',
  2: 'ikki',
  3: 'uch',
  4: 'to‘rt',
  5: 'besh',
  6: 'olti',
  7: 'yetti',
  8: 'sakkiz',
  9: 'to‘qqiz',
  10: 'o‘n',
  15: 'o‘n besh',
  20: 'yigirma',
  30: 'o‘ttiz',
  40: 'qirq',
  50: 'ellik',
  60: 'oltmish',
  70: 'yetmish',
  80: 'sakson',
  90: 'to‘qson',
  100: 'yuz',
  200: 'ikki yuz',
  500: 'besh yuz',
};

/**
 * 16. TEXT NORMALIZATION
 * TTS ga yuborishdan oldin matnni tabiiy o‘zbekcha eshittirish shakliga keltiradi
 */
export function normalizeUzbekVoiceText(text: string): string {
  if (!text) return '';

  let normalized = text;

  // Tutuq belgilari va o' harflarini standartlashtirish
  normalized = normalized.replace(/o‘/gi, 'o\'').replace(/g‘/gi, 'g\'');
  normalized = normalized.replace(/[ʻ’‘`]/g, "'");

  // MKB kodlarini normallashtirish
  normalized = normalized.replace(/MKB-10\s*F70/gi, 'M K B o‘n, F yetmish');
  normalized = normalized.replace(/MKB-10\s*G80/gi, 'M K B o‘n, G sakson');
  normalized = normalized.replace(/MKB-10\s*F71/gi, 'M K B o‘n, F yetmish bir');
  normalized = normalized.replace(/MKB-10\s*F84/gi, 'M K B o‘n, F sakson to‘rt');
  normalized = normalized.replace(/MKB-10\s*H90\.3/gi, 'M K B o‘n, H to‘qson nuqta uch');

  // GMFCS darajalari
  normalized = normalized.replace(/GMFCS\s*III/gi, 'Ge em ef se se uchinchi daraja');
  normalized = normalized.replace(/GMFCS\s*IV/gi, 'Ge em ef se se to‘rtinchi daraja');
  normalized = normalized.replace(/GMFCS\s*V/gi, 'Ge em ef se se beshinchi daraja');
  normalized = normalized.replace(/MACS\s*III/gi, 'Maks uchinchi daraja');
  normalized = normalized.replace(/MACS\s*IV/gi, 'Maks to‘rtinchi daraja');
  normalized = normalized.replace(/CFCS\s*III/gi, 'Se ef se se uchinchi daraja');

  // Dori dozalari va birliklari
  normalized = normalized.replace(/(\d+)\s*mg/gi, '$1 milligram');
  normalized = normalized.replace(/(\d+)\s*ml/gi, '$1 millilitr');
  normalized = normalized.replace(/(\d+)\s*marta/gi, '$1 marta');
  normalized = normalized.replace(/(\d+)\s*daqiqa/gi, '$1 daqiqa');
  normalized = normalized.replace(/(\d+)\s*soat/gi, '$1 soat');
  normalized = normalized.replace(/(\d+)\s*%/g, '$1 foiz');

  // Raqamlarni so'zga aylantirish (asosiy holatlar uchun)
  Object.entries(UZBEK_NUMBERS).forEach(([num, word]) => {
    const reg = new RegExp(`\\b${num}\\b`, 'g');
    normalized = normalized.replace(reg, word);
  });

  // Tibbiy qisqartmalar
  normalized = normalized.replace(/\bLFK\b/g, 'L F K');
  normalized = normalized.replace(/\bAAC\b/g, 'A A C');
  normalized = normalized.replace(/\bADL\b/g, 'kundalik odatlar');
  normalized = normalized.replace(/\b103\b/g, 'bir yuz uch');

  return normalized;
}

/**
 * 134. AI MEDICATION SAFETY GUARD
 * Tekshiradi: AI hech qachon doza oshirish yoki dorini to'xtatish kabi buyruqlar bermasligi shart!
 */
export function validateVoiceMedicalSafety(text: string): { safe: boolean; sanitizedText: string } {
  const dangerousPatterns = [
    /dozani\s+(oshiring|ko‘paytiring|kamaytiring)/i,
    /dorini\s+(to‘xtating|bekor\s+qiling|ichmang)/i,
    /ikki\s+dozani\s+(birga|ichiring)/i,
    /retsept\s+yozib\s+beraman/i,
    /shifokorsiz\s+(boshlang|ichiring)/i,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(text)) {
      return {
        safe: false,
        sanitizedText: "Xavfsizlik ogohlantirishi: MEHR AI dori dozasini yoki davolash tartibini mustaqil o‘zgartirmaydi. Ushbu klinik savol bo‘yicha zudlik bilan bolani davolovchi shifokor bilan bog‘laning."
      };
    }
  }

  // Red Flag aniqlash
  const redFlagPatterns = [
    /tutqanoq|sudorogi|epileptik/i,
    /nafas\s+(qisishi|to‘xtashi|olish\s+qiyin)/i,
    /yuz\s+shishi|tomoq\s+shishi/i,
    /hushdan\s+ketish/i,
  ];

  for (const pattern of redFlagPatterns) {
    if (pattern.test(text)) {
      return {
        safe: true,
        sanitizedText: "Diqqat! Bolada o‘tkir xavfli simptom qayd etilmoqda. Iltimos, darhol 103 shoshilinch tez tibbiy yordam xizmatiga qo‘ng‘iroq qiling!"
      };
    }
  }

  return { safe: true, sanitizedText: text };
}

/**
 * Ovozli AI Yordamchisi Asosiy Boshqaruv Klasi
 */
export class UzbekVoiceAssistant {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private recognition: any = null;
  private speechSpeed: number = 1.0;
  private activeTone: 'friendly' | 'professional' | 'child' | 'alert' = 'friendly';

  public onStateChange?: (state: Partial<VoiceAssistantState>) => void;
  public onTranscript?: (text: string, isFinal: boolean) => void;
  public onResponseText?: (text: string) => void;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
    this.initSpeechRecognition();
  }

  private initSpeechRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'uz-UZ';

      this.recognition.onstart = () => {
        this.emitState({ isListening: true, isThinking: false, isSpeaking: false });
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const text = finalTranscript || interimTranscript;
        if (this.onTranscript) {
          this.onTranscript(text, !!finalTranscript);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn('Voice recognition error:', event.error);
        this.emitState({ isListening: false });
      };

      this.recognition.onend = () => {
        this.emitState({ isListening: false });
      };
    }
  }

  private emitState(state: Partial<VoiceAssistantState>) {
    if (this.onStateChange) {
      this.onStateChange(state);
    }
  }

  /**
   * Ovozli eshitishni boshlash (STT)
   */
  public startListening() {
    if (!this.recognition) {
      alert('Brauzeringizda ovozli kiritish (Speech-to-Text) qo‘llab-quvvatlanmaydi. Matn orqali savol kiritishingiz mumkin.');
      return;
    }
    this.stopSpeaking();
    try {
      this.recognition.start();
    } catch (e) {
      console.warn('Recognition already started or error:', e);
    }
  }

  /**
   * Ovozli eshitishni to'xtatish
   */
  public stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
      this.emitState({ isListening: false });
    }
  }

  /**
   * Ovoz tezligini o'rnatish (0.75x, 1.0x, 1.25x, 1.5x)
   */
  public setSpeed(speed: number) {
    this.speechSpeed = Math.max(0.75, Math.min(1.5, speed));
    this.emitState({ rate: this.speechSpeed });
  }

  /**
   * Ovoz uslubini o'rnatish
   */
  public setTone(tone: 'friendly' | 'professional' | 'child' | 'alert') {
    this.activeTone = tone;
    this.emitState({ voiceTone: tone });
  }

  /**
   * 14. TTS TEXNIK ARXITEKTURA - O‘zbek tilida gapirish
   */
  public speak(rawText: string, tone?: 'friendly' | 'professional' | 'child' | 'alert') {
    if (typeof window === 'undefined' || !this.synth) return;

    this.stopSpeaking();

    // 1. Xavfsizlik tekshiruvi
    const safetyCheck = validateVoiceMedicalSafety(rawText);
    const textToProcess = safetyCheck.sanitizedText;

    // 2. O‘zbekcha matn normalizatsiyasi
    const normalizedText = normalizeUzbekVoiceText(textToProcess);

    if (this.onResponseText) {
      this.onResponseText(textToProcess);
    }

    const utterance = new SpeechSynthesisUtterance(normalizedText);
    this.currentUtterance = utterance;

    // Til va ovoz sozlash
    utterance.lang = 'uz-UZ';
    utterance.rate = this.speechSpeed;

    const chosenTone = tone || this.activeTone;
    if (chosenTone === 'child') {
      utterance.pitch = 1.2;
      utterance.rate = this.speechSpeed * 0.95;
    } else if (chosenTone === 'alert') {
      utterance.pitch = 1.05;
      utterance.rate = this.speechSpeed * 1.05;
    } else if (chosenTone === 'professional') {
      utterance.pitch = 0.95;
    } else {
      // friendly (default)
      utterance.pitch = 1.0;
    }

    // Ovoz tanlash (agar mavjud bo'lsa)
    const voices = this.synth.getVoices();
    const uzVoice = voices.find(v => v.lang.toLowerCase().includes('uz') || v.lang.toLowerCase().includes('uz-uz'));
    if (uzVoice) {
      utterance.voice = uzVoice;
    }

    utterance.onstart = () => {
      this.emitState({ isSpeaking: true, isThinking: false, isPaused: false, currentText: textToProcess });
    };

    utterance.onpause = () => {
      this.emitState({ isPaused: true });
    };

    utterance.onresume = () => {
      this.emitState({ isPaused: false });
    };

    utterance.onend = () => {
      this.emitState({ isSpeaking: false, isPaused: false });
      this.currentUtterance = null;
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      this.emitState({ isSpeaking: false, isPaused: false });
      this.currentUtterance = null;
    };

    this.synth.speak(utterance);
  }

  /**
   * Pauza qilish
   */
  public pause() {
    if (this.synth && this.synth.speaking) {
      this.synth.pause();
      this.emitState({ isPaused: true });
    }
  }

  /**
   * Qayta davom ettirish
   */
  public resume() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
      this.emitState({ isPaused: false });
    }
  }

  /**
   * Ovozni to'xtatish
   */
  public stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.currentUtterance = null;
    this.emitState({ isSpeaking: false, isPaused: false });
  }

  /**
   * Qayta eshitish (Replay)
   */
  public replay(text: string) {
    this.speak(text);
  }
}

// Global Singleton Instance
export const voiceAssistantService = new UzbekVoiceAssistant();
