import React from 'react';
import { ShieldCheck, AlertCircle, PhoneCall } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-white border-t border-slate-200 mt-20">
      {/* Clinical Safety & Emergency Banner */}
      <div className="bg-amber-50/80 border-b border-amber-200/80 py-3 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span className="font-medium">{t.safetyWarning}</span>
          </div>
          <div className="flex items-center space-x-2 bg-amber-100/80 px-3 py-1 rounded-full text-amber-950 font-bold">
            <PhoneCall className="w-3.5 h-3.5 text-amber-700" />
            <span>Tez tibbiy yordam: 103</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-3">
            <img src="/images/logo-icon.png" alt="MEHR AI" className="w-8 h-8 object-contain" />
            <div>
              <span className="text-base font-bold text-slate-900">MEHR AI</span>
              <p className="text-xs text-slate-500">{t.slogan}</p>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-xs text-slate-500 font-medium">
            <span className="flex items-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mr-1" />
              256-bit TLS & HIPAA-standard Xavfsizlik
            </span>
            <span>•</span>
            <span>Offline PWA Ready</span>
            <span>•</span>
            <span>© 2026 MEHR AI Platformasi</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
