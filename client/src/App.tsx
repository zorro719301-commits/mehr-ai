import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { LanguageProvider } from './context/LanguageContext.js';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { AiAssistantChatModal } from './components/AiAssistantChatModal.js';
import { VoiceAssistantModal } from './components/VoiceAssistantModal.js';

import { LandingPage } from './pages/LandingPage.js';
import { ParentDashboard } from './pages/ParentDashboard.js';
import { AssessmentWizardPage } from './pages/AssessmentWizardPage.js';
import { AacPage } from './pages/AacPage.js';
import { BehaviorDiaryPage } from './pages/BehaviorDiaryPage.js';
import { ProgressPage } from './pages/ProgressPage.js';
import { SpecialistDashboard } from './pages/SpecialistDashboard.js';
import { AdminPage } from './pages/AdminPage.js';
import { AuthPage } from './pages/AuthPage.js';

const MainApp: React.FC = () => {
  const { user, role, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);

  // If user logs in while on 'login', switch to their appropriate dashboard
  React.useEffect(() => {
    if (user && currentTab === 'login') {
      const r = user.role;
      if (r === 'SPECIALIST') {
        setCurrentTab('specialist');
      } else if (r === 'SUPER_ADMIN' || r === 'MEDICAL_ADMIN' || r === 'AUDITOR') {
        setCurrentTab('admin');
      } else {
        setCurrentTab('dashboard');
      }
    }
  }, [user, currentTab]);

  // Route protection: only redirect to login if not loading, not authenticated, and on a protected tab
  React.useEffect(() => {
    if (!isLoading && !user && currentTab !== 'landing' && currentTab !== 'login') {
      setCurrentTab('login');
    }
  }, [isLoading, user, currentTab]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-brand-500 selection:text-white">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenAiChat={() => setIsAiChatOpen(true)}
        onOpenVoiceAssistant={() => setIsVoiceAssistantOpen(true)}
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
        {currentTab === 'specialist' && <SpecialistDashboard onNavigate={setCurrentTab} />}
        {currentTab === 'admin' && <AdminPage />}
        {currentTab === 'login' && (
          <AuthPage
            onSuccess={(loggedRole) => {
              const r = loggedRole || user?.role || role;
              if (r === 'SPECIALIST') {
                setCurrentTab('specialist');
              } else if (r === 'SUPER_ADMIN' || r === 'MEDICAL_ADMIN' || r === 'AUDITOR') {
                setCurrentTab('admin');
              } else {
                setCurrentTab('dashboard');
              }
            }}
          />
        )}
      </main>

      {/* AI Assistant Chat Modal */}
      <AiAssistantChatModal
        isOpen={isAiChatOpen}
        onClose={() => setIsAiChatOpen(false)}
      />

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceAssistantOpen}
        onClose={() => setIsVoiceAssistantOpen(false)}
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
