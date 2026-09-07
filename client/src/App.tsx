import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { LanguageProvider } from './context/LanguageContext.js';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { AiAssistantChatModal } from './components/AiAssistantChatModal.js';

import { LandingPage } from './pages/LandingPage.js';
import { ParentDashboard } from './pages/ParentDashboard.js';
import { AssessmentWizardPage } from './pages/AssessmentWizardPage.js';
import { AacPage } from './pages/AacPage.js';
import { BehaviorDiaryPage } from './pages/BehaviorDiaryPage.js';
import { ProgressPage } from './pages/ProgressPage.js';
import { SpecialistDashboard } from './pages/SpecialistDashboard.js';
import { AdminPage } from './pages/AdminPage.js';
import { AuthPage } from './pages/AuthPage.js';

import { Sparkles, Heart } from 'lucide-react';

const MainApp: React.FC = () => {
  const { user, role } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);

  // If user logs in and was on 'landing' or 'login', switch to their appropriate dashboard
  React.useEffect(() => {
    if (user && currentTab === 'login') {
      if (role === 'SPECIALIST') {
        setCurrentTab('specialist');
      } else if (role === 'ADMIN') {
        setCurrentTab('admin');
      } else {
        setCurrentTab('dashboard');
      }
    }
  }, [user, role, currentTab]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-brand-500 selection:text-white">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenAiChat={() => setIsAiChatOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        {currentTab === 'landing' && <LandingPage onNavigate={setCurrentTab} />}
        {currentTab === 'dashboard' && (
          <ParentDashboard
            onNavigate={setCurrentTab}
            onOpenAiChat={() => setIsAiChatOpen(true)}
          />
        )}
        {currentTab === 'assessment' && <AssessmentWizardPage onNavigate={setCurrentTab} />}
        {currentTab === 'aac' && <AacPage />}
        {currentTab === 'behavior' && <BehaviorDiaryPage />}
        {currentTab === 'progress' && <ProgressPage />}
        {currentTab === 'specialist' && <SpecialistDashboard />}
        {currentTab === 'admin' && <AdminPage />}
        {currentTab === 'login' && (
          <AuthPage
            onSuccess={() => {
              if (role === 'SPECIALIST') setCurrentTab('specialist');
              else if (role === 'ADMIN') setCurrentTab('admin');
              else setCurrentTab('dashboard');
            }}
          />
        )}
      </main>

      {/* Floating MEHR AI Assistant Action Button */}
      <button
        onClick={() => setIsAiChatOpen(true)}
        className="fixed bottom-8 right-6 z-50 px-4 py-3 rounded-full bg-gradient-to-r from-brand-600 via-indigo-600 to-emerald-600 text-white font-bold text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center space-x-2 border-2 border-white/50 animate-bounce cursor-pointer"
        title="MEHR AI Yordamchi bilan suhbat"
      >
        <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
        <span className="hidden sm:inline">MEHR AI Yordamchi</span>
      </button>

      {/* AI Assistant Chat Modal */}
      <AiAssistantChatModal
        isOpen={isAiChatOpen}
        onClose={() => setIsAiChatOpen(false)}
      />

      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
