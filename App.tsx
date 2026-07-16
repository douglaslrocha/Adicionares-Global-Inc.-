
import React, { useState, useEffect } from 'react';
import WelcomeScreen from './pages/WelcomeScreen';
import FeedScreen from './pages/FeedScreen';
import HolotecaScreen from './pages/HolotecaScreen';
import CinemaScreen from './pages/CinemaScreen';
import ProfileEditScreen from './pages/ProfileEditScreen';
import PublicProfileScreen from './pages/PublicProfileScreen';
import CockpitScreen from './pages/CockpitScreen';
import IntermissivistasScreen from './pages/IntermissivistasScreen';
import MatchesScreen from './pages/MatchesScreen';
import ChatScreen from './pages/ChatScreen';
import { GlobalProvider } from './context/AdicionaresContext';

export interface UserProfile {
  name: string;
  conscienciologicalName: string;
  bio: string;
  city: string;
  specialties: string[];
  practices: string[];
  colors: {
    primary: string;
    secondary: string;
  };
  energeticStyle: 'Vibrante' | 'Serene' | 'Introspectiva' | 'Intensa' | 'Expansiva';
  signatureIcon: string;
  visibility: {
    showCommitments: boolean;
  };
  socialLinks: {
    instagram?: string;
    whatsapp?: string;
    facebook?: string;
    linkedin?: string;
    tiktok?: string;
    youtube?: string;
    researchgate?: string;
    scholar?: string;
    website?: string;
    blog?: string;
  };
}

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'feed' | 'holoteca' | 'cinema' | 'profile-edit' | 'public-profile' | 'cockpit' | 'grupo' | 'matches' | 'chat'>('welcome');
  const [activeChatPartnerId, setActiveChatPartnerId] = useState<string | undefined>(undefined);

  // Perfil Global para Prototipagem
  const [userProfile] = useState<UserProfile>({
    name: 'Douglas L. Rocha',
    conscienciologicalName: 'D. Rocha',
    bio: 'Pesquisador da parapercepção e cosmoética aplicada. Foco em desassedio mentalsomático e mapeamento de sinalética paranormal.',
    city: 'Foz do Iguaçu, PR',
    specialties: ['Parapercepção', 'Cosmoética', 'Projeciologia'],
    practices: ['Estado Vibracional', 'Tenepes'],
    colors: {
      primary: '#3b82f6',
      secondary: '#8b5cf6'
    },
    energeticStyle: 'Intensa',
    signatureIcon: 'bolt',
    visibility: {
      showCommitments: true
    },
    socialLinks: {
      youtube: 'https://youtube.com/@drocha',
      instagram: 'https://instagram.com/drocha',
      linkedin: 'https://linkedin.com/in/drocha',
      website: 'https://adicionares.com',
      blog: 'https://autopesquisa.com'
    }
  });

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }

    // --- GLOBAL HISTORY GUARD (Block App Exit) ---
    // 1. Ensure Initial State
    if (!window.history.state) {
      window.history.replaceState({ screen: 'welcome' }, '', '#welcome');
    }

    const handleGlobalPopState = (event: PopStateEvent) => {
      const targetScreen = event.state?.screen;

      if (targetScreen) {
        // Normal Navigation
        setCurrentScreen(targetScreen);
      } else {
        // App Exit Attempt (No State) -> BLOCK IT
        // Push the current screen back to history to trap the user
        // We need a ref or access to currentScreen state? 
        // Since this listener is created once, 'currentScreen' is stale.
        // We default to 'feed' if logged in (not welcome), or 'welcome' if stuck.
        // Simplified: Just push 'feed' if we are not in likely login flow, or strict block.
        // For safety, we just push the last known state from URL or default.
        const hashScreen = window.location.hash.replace('#', '') as any;
        const fallback = hashScreen && hashScreen !== '' ? hashScreen : 'feed';

        window.history.pushState({ screen: fallback }, '', `#${fallback}`);
        setCurrentScreen(fallback);
      }
    };

    window.addEventListener('popstate', handleGlobalPopState);
    return () => window.removeEventListener('popstate', handleGlobalPopState);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const navigateTo = (screen: any) => {
    setCurrentScreen(screen);
    // Sync History
    window.history.pushState({ screen }, '', `#${screen}`);
  };

  return (
    <GlobalProvider>
      <div className="bg-gray-50 dark:bg-[#0b0f19] min-h-[100dvh] w-full relative transition-colors duration-700 overflow-hidden">

        {currentScreen === 'welcome' && (
          <div className="relative z-10 w-full min-h-[100dvh] flex items-center justify-center p-0 sm:p-4 md:p-6 lg:p-8 animate-fade-in">
            <WelcomeScreen isDarkMode={isDarkMode} toggleTheme={toggleTheme} onEnter={() => navigateTo('feed')} />
          </div>
        )}

        {currentScreen === 'feed' && (
          <div className="relative z-10 w-full min-h-screen animate-fade-in-up">
            <FeedScreen onNavigate={navigateTo} />
          </div>
        )}

        {currentScreen === 'holoteca' && (
          <div className="relative z-10 w-full min-h-screen animate-fade-in">
            <HolotecaScreen onNavigate={navigateTo} />
          </div>
        )}

        {currentScreen === 'cinema' && (
          <div className="relative z-10 w-full min-h-screen animate-fade-in">
            <CinemaScreen onNavigate={navigateTo} />
          </div>
        )}

        {currentScreen === 'profile-edit' && (
          <div className="relative z-10 w-full min-h-screen animate-fade-in">
            <ProfileEditScreen onNavigate={navigateTo} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
          </div>
        )}

        {currentScreen === 'public-profile' && (
          <div className="relative z-10 w-full min-h-screen animate-fade-in">
            <PublicProfileScreen onNavigate={navigateTo} isDarkMode={isDarkMode} toggleTheme={toggleTheme} profile={userProfile} />
          </div>
        )}

        {currentScreen === 'cockpit' && (
          <div className="relative z-10 w-full min-h-screen animate-fade-in">
            <CockpitScreen onNavigate={navigateTo} />
          </div>
        )}

        {currentScreen === 'grupo' && (
          <div className="relative z-10 w-full min-h-screen animate-fade-in">
            <IntermissivistasScreen onNavigate={navigateTo} />
          </div>
        )}

        {currentScreen === 'matches' && (
          <div className="relative z-10 w-full min-h-screen animate-fade-in">
            <MatchesScreen onNavigate={navigateTo} />
          </div>
        )}

        {currentScreen === 'chat' && (
          <div className="relative z-10 w-full min-h-screen animate-fade-in">
            <ChatScreen onNavigate={navigateTo} activePartnerId={activeChatPartnerId} onClearActivePartner={() => setActiveChatPartnerId(undefined)} />
          </div>
        )}

      </div>
    </GlobalProvider>
  );
};

export default App;
