import React from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import {
  Activity,
  MessageSquare,
  BookOpen,
  TrendingUp,
  Shield,
  Wifi,
  WifiOff,
  User,
  LogOut,
  Sparkles,
  ChevronDown,
  Mic
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenAiChat: () => void;
  onOpenVoiceAssistant?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onOpenAiChat, onOpenVoiceAssistant }) => {
  const { user, role, isOnline, activeChild, childrenList, setActiveChild, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Slogan */}
          <div
            className="flex items-center space-x-3 cursor-pointer select-none"
            onClick={() => setCurrentTab('landing')}
          >
            <img src="/images/logo-icon.png" alt="MEHR AI" className="w-10 h-10 object-contain drop-shadow-sm" />
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-brand-700 via-brand-600 to-emerald-600 bg-clip-text text-transparent">
                MEHR AI
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                Pediatric AI 2026
              </span>
            </div>
          </div>

          {/* Child Switcher for Parents / Specialists */}
          {user && childrenList.length > 0 && (
            <div className="hidden md:flex items-center bg-white border border-slate-200 rounded-full px-3 py-1 shadow-sm">
              <span className="text-xs text-slate-500 mr-2 font-medium">Bola:</span>
              <select
                className="text-xs font-semibold text-slate-800 bg-transparent outline-none cursor-pointer"
                value={activeChild?.id || ''}
                onChange={(e) => {
                  const found = childrenList.find((c) => c.id === e.target.value);
                  if (found) setActiveChild(found);
                }}
              >
                {childrenList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName} ({c.region})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Navigation Links */}
          {user && (
            <nav className="hidden lg:flex items-center space-x-1">
              <button
                onClick={() => setCurrentTab('dashboard')}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                  currentTab === 'dashboard'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-brand-600 hover:bg-slate-100'
                }`}
              >
                {t.nav.dashboard}
              </button>

              <button
                onClick={() => setCurrentTab('assessment')}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                  currentTab === 'assessment'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-brand-600 hover:bg-slate-100'
                }`}
              >
                {t.nav.assessment}
              </button>

              <button
                onClick={() => setCurrentTab('aac')}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                  currentTab === 'aac'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-brand-600 hover:bg-slate-100'
                }`}
              >
                {t.nav.aac}
              </button>

              <button
                onClick={() => setCurrentTab('behavior')}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                  currentTab === 'behavior'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-brand-600 hover:bg-slate-100'
                }`}
              >
                {t.nav.behavior}
              </button>

              <button
                onClick={() => setCurrentTab('progress')}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                  currentTab === 'progress'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-brand-600 hover:bg-slate-100'
                }`}
              >
                {t.nav.progress}
              </button>

              {(role === 'SPECIALIST' || role === 'ADMIN') && (
                <button
                  onClick={() => setCurrentTab('specialist')}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                    currentTab === 'specialist'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                  }`}
                >
                  {t.nav.specialist}
                </button>
              )}

              {role === 'ADMIN' && (
                <button
                  onClick={() => setCurrentTab('admin')}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                    currentTab === 'admin'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-purple-700 bg-purple-50 hover:bg-purple-100'
                  }`}
                >
                  {t.nav.admin}
                </button>
              )}
            </nav>
          )}

          {/* Right Action Icons: Online Status, AI Button, Language, User */}
          <div className="flex items-center space-x-3">
            {/* Network Badge */}
            <div
              className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${
                isOnline ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-300 animate-pulse'
              }`}
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5 mr-1" /> : <WifiOff className="w-3.5 h-3.5 mr-1" />}
              <span className="hidden sm:inline">{isOnline ? t.pwa.online : t.pwa.offline}</span>
            </div>

            {/* AI Assistant Quick Trigger */}
            {/* AI Voice Assistant Quick Trigger */}
            {onOpenVoiceAssistant && (
              <button
                onClick={onOpenVoiceAssistant}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold shadow-card hover:brightness-110 transition-all cursor-pointer"
                title="Tabiiy o‘zbek tilidagi AI ovozli yordamchi"
              >
                <Mic className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span className="hidden sm:inline">🎙 Ovozli AI</span>
              </button>
            )}

            {/* AI Assistant Quick Trigger */}
            <button
              onClick={onOpenAiChat}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-600 text-white text-xs font-semibold shadow-card hover:brightness-110 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
              <span>Chat AI</span>
            </button>

            {/* Language Switcher */}
            <div className="relative">
              <select
                className="text-xs font-medium bg-slate-100 border border-slate-200 text-slate-700 rounded-lg px-2 py-1 outline-none cursor-pointer"
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
              >
                <option value="uz">🇺🇿 O‘zbek</option>
                <option value="ru">🇷🇺 Русский</option>
                <option value="en">🇬🇧 English</option>
              </select>
            </div>

            {/* User Info / Logout */}
            {user ? (
              <div className="flex items-center space-x-2">
                <div className="hidden md:block text-right">
                  <div className="text-xs font-bold text-slate-800 leading-tight">{user.fullName}</div>
                  <div className="text-[10px] text-brand-600 font-semibold uppercase">{user.role}</div>
                </div>
                <button
                  onClick={logout}
                  title="Chiqish"
                  className="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCurrentTab('login')}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 shadow-sm"
              >
                {t.nav.login}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile subnav for active child */}
      {user && childrenList.length > 0 && (
        <div className="md:hidden flex items-center justify-between px-4 py-1.5 bg-brand-50/70 border-t border-brand-100 text-xs">
          <span className="font-medium text-brand-900">Faol bola:</span>
          <select
            className="text-xs font-bold text-brand-700 bg-transparent outline-none"
            value={activeChild?.id || ''}
            onChange={(e) => {
              const found = childrenList.find((c) => c.id === e.target.value);
              if (found) setActiveChild(found);
            }}
          >
            {childrenList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstName} {c.lastName}
              </option>
            ))}
          </select>
        </div>
      )}
    </header>
  );
};
