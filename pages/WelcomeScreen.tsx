
import React, { useState } from 'react';
import ParticleBackground from '../components/ParticleBackground';

interface WelcomeScreenProps {
  isDarkMode?: boolean;
  toggleTheme?: () => void;
  onEnter?: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ isDarkMode, toggleTheme, onEnter }) => {
  const [isVideoActive, setIsVideoActive] = useState(false);

  // Tópicos simulados da comunidade (Conscienciologia)
  const discussionTopics = [
    { title: "Cosmoética", type: "Debate", color: "bg-blue-500" },
    { title: "Autopesquisa", type: "Lab", color: "bg-purple-500" },
    { title: "Projeção", type: "Relato", color: "bg-pink-500" },
    { title: "Tenepes", type: "Dúvida", color: "bg-orange-500" },
  ];

  return (
    <div className="w-full flex flex-col lg:flex-row relative bg-white/80 dark:bg-zinc-900/60 backdrop-blur-3xl shadow-soft dark:shadow-none overflow-hidden rounded-none sm:rounded-[2rem] lg:rounded-[3rem] transition-all duration-500 border-0 sm:border border-white/50 dark:border-white/5
    
    /* Layout Sizing Fixes */
    h-[100dvh] sm:h-auto sm:min-h-[600px]
    lg:h-[85vh] lg:max-h-[900px] lg:aspect-[16/9] lg:max-w-[1500px]
    ">

      {/* Safe Area Spacer for Mobile Status Bar */}
      <div className="h-safe-top w-full absolute top-0 z-50 lg:hidden pointer-events-none"></div>

      {/* Theme Toggle - Top Right */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 lg:top-8 lg:right-8 z-50 animate-fade-in delay-200">
        <button
          onClick={toggleTheme}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/50 dark:bg-white/10 backdrop-blur-md border border-white/20 shadow-sm flex items-center justify-center text-gray-700 dark:text-white hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
          aria-label="Alternar tema"
        >
          {isDarkMode ? (
            <span className="material-icons text-xl text-yellow-300">light_mode</span>
          ) : (
            <span className="material-icons text-xl text-indigo-600">dark_mode</span>
          )}
        </button>
      </div>

      {/* 
        LEFT PANEL (Video) 
        Mobile: Takes up top 45% of screen
        Desktop: Takes up left 50%
      */}
      <div className="relative w-full lg:w-1/2 h-[45%] sm:h-[50vh] lg:h-full p-3 sm:p-4 lg:p-6 order-1 flex flex-col shrink-0">

        {/* Logo - Top Left */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 lg:top-8 lg:left-8 z-50 animate-fade-in delay-100 pointer-events-none">
          <div className="flex items-center gap-3 pointer-events-auto">
            {/* Logo Image */}
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
              <img
                src="https://d363e3cb0fedde3cc603722077e49900.cdn.bubble.io/f1766384422562x463430689164383360/logo%20da%20Adicionares%20Global%20Inc..png?_gl=1*148xfos*_gcl_au*MTczMzAyMTYxMC4xNzY2Mzg0MjQ0*_ga*OTYzNzc1MDE2LjE3MjQzNzE3ODg.*_ga_BFPVR2DEE2*czE3NjYzNzYyMDgkbzQzJGcxJHQxNzY2Mzg0NDA4JGo0MyRsMCRoMA.."
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "https://placehold.co/100x100/transparent/ffffff?text=A";
                }}
                alt="Logo Adicionares"
                className="w-full h-full object-contain drop-shadow-md filter drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]"
              />
            </div>

            {/* Text Logo */}
            <div className="flex flex-col justify-center h-10 sm:h-12">
              <h1 className="font-arimo font-black text-[10px] sm:text-xs text-gray-900 dark:text-white drop-shadow-md tracking-wider leading-tight uppercase flex flex-col justify-center h-full">
                <span>Adicionares</span>
                <span className="opacity-80">Global Inc.</span>
              </h1>
            </div>
          </div>
        </div>

        {/* Video Container */}
        <div className="relative w-full h-full rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden shadow-lg group bg-black">

          {/* 
            SOLUÇÃO DEFINITIVA DE REPRODUÇÃO:
            1. Click-to-Load: O iframe só é criado após clique explícito do usuário.
            2. Autoplay + Mute: A combinação autoplay=1&mute=1 é a única garantida de funcionar em todos os navegadores modernos sem erro de permissão.
            3. URL Exata: Preservamos o parâmetro 'si' fornecido.
          */}
          {!isVideoActive ? (
            <div
              className="absolute inset-0 w-full h-full cursor-pointer group z-20"
              onClick={() => setIsVideoActive(true)}
            >
              {/* Thumbnail Background (Max Resolution) */}
              <img
                src="https://img.youtube.com/vi/j0Xk73QySuc/maxresdefault.jpg"
                alt="Video Cover"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
              />

              {/* Play Button Center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-300 group-hover:scale-110 group-hover:bg-white/30">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-full flex items-center justify-center shadow-md">
                    <span className="material-icons text-accent-purple text-3xl sm:text-4xl ml-1">play_arrow</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <iframe
              width="100%"
              height="100%"
              className="w-full h-full object-cover animate-fade-in"
              /* Adicionado mute=1 para garantir autoplay sem erro de bloqueio de navegador */
              src="https://www.youtube.com/embed/j0Xk73QySuc?si=MzgyKLKm6ZHtfj3m&autoplay=1&mute=1"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 lg:opacity-60 pointer-events-none z-10"></div>

          {/* Floating Badge */}
          <div className="absolute bottom-16 right-3 sm:bottom-20 sm:right-6 bg-white/90 dark:bg-black/90 backdrop-blur-xl p-2 sm:p-3 rounded-[1.2rem] sm:rounded-[1.5rem] flex items-center gap-2 sm:gap-3 shadow-lg animate-float max-w-[85%] sm:max-w-none pointer-events-none z-30">
            <div className="flex -space-x-2 sm:-space-x-3">
              <img alt="User" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white dark:border-surface-dark object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" />
              <img alt="User" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white dark:border-surface-dark object-cover" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop" />
              <img alt="User" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white dark:border-surface-dark object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" />
            </div>
            <div className="pr-2">
              <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white leading-tight">+2.4k</p>
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 leading-tight">Membros online</p>
            </div>
          </div>
        </div>
      </div>

      {/* 
        RIGHT PANEL (Content) 
        Mobile: Bottom 55%, Scrollable
        Desktop: Right 50%
      */}
      <div className="flex-1 flex flex-col justify-start sm:justify-center items-center lg:items-start 
                      pt-6 px-6 pb-8 
                      sm:px-12 sm:pb-12
                      lg:p-16 lg:pl-12
                      relative z-20 order-2 overflow-y-auto custom-scrollbar">

        {/* Background Particles for Content Area */}
        <ParticleBackground />

        <div className="w-full max-w-md lg:max-w-xl mx-auto lg:mx-0 space-y-4 sm:space-y-6 text-center lg:text-left relative z-10">

          {/* Tagline */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-purple/10 dark:bg-accent-purple/20 border border-accent-purple/20 text-accent-purple dark:text-accent-purple text-xs sm:text-sm font-semibold tracking-wide uppercase opacity-0 animate-fade-in-up delay-100 mx-auto lg:mx-0">
            <span className="w-2 h-2 rounded-full bg-accent-purple animate-pulse"></span>
            COLLEGE OF AMPARADORES
          </div>

          {/* Headline */}
          <h1 className="serif-font 
              text-4xl sm:text-5xl lg:text-6xl xl:text-7xl 
              leading-[1.1] 
              font-bold text-gray-900 dark:text-white tracking-tight opacity-0 animate-fade-in-up delay-200">
            Conecte-se <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-purple via-accent-pink to-accent-orange relative inline-block">
              de Verdade
            </span>.
          </h1>

          {/* Subtext */}
          <p className="font-display text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 leading-relaxed opacity-0 animate-fade-in-up delay-300 px-2 lg:px-0">
            Bem-vindo ao <strong>Adicionares Space</strong>. Um espaço seguro para expandir sua consciencialidade, debater parapsiquismo e evoluir em conjunto.
          </p>

          {/* DESIGNER SECTION: Active Topics */}
          <div className="w-full opacity-0 animate-fade-in-up delay-400 py-2">
            <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3 font-semibold text-center lg:text-left">
              Acontecendo agora:
            </p>
            <div className="grid grid-cols-2 gap-3">
              {discussionTopics.map((topic, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-100 dark:border-white/5 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-white/10 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${topic.color} animate-pulse`}></span>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{topic.title}</span>
                  </div>
                  <span className="text-[10px] bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-white transition-colors">
                    {topic.type}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="w-full flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4 opacity-0 animate-fade-in-up delay-500">

            {/* Primary */}
            <button
              onClick={onEnter}
              className="w-full sm:w-auto px-8 py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-medium hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Entrar no Grupo
                <span className="material-icons text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </span>
              {/* Button Glow Effect */}
              <div className="absolute inset-0 bg-accent-purple/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>

            {/* Secondary */}
            <button className="w-full sm:w-auto px-8 py-3.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-full font-medium hover:bg-gray-50 dark:hover:bg-white/10 active:scale-95 transition-all">
              Já tenho conta
            </button>
          </div>

          {/* Footer / Social Proof */}
          <div className="pt-4 opacity-0 animate-fade-in-up delay-500">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Faça parte de uma egrégora interassistencial. <br />
              <a href="#" className="text-accent-purple hover:underline underline-offset-2">Saiba mais sobre a Adicionares</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
