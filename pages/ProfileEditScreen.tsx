
import React, { useState, useEffect } from 'react';

interface ProfileEditScreenProps {
  onNavigate?: (screen: any) => void;
  isDarkMode?: boolean;
  toggleTheme?: () => void;
}

// --- Tipos de Dados ---
interface UserProfile {
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
  projects: string[];
  publications: string[];
}

const AVAILABLE_COLORS = [
  { name: 'Neon Blue', hex: '#3b82f6' },
  { name: 'Neon Purple', hex: '#8b5cf6' },
  { name: 'Neon Orange', hex: '#f97316' },
  { name: 'Neon Green', hex: '#10b981' },
  { name: 'Silver', hex: '#C0C0C0' },
  { name: 'Gold', hex: '#FFD700' },
  { name: 'Crimson', hex: '#ef4444' },
  { name: 'Cyan', hex: '#06b6d4' },
];

const AVAILABLE_ICONS = [
  'bolt', 'psychology', 'auto_awesome', 'visibility', 
  'balance', 'spa', 'extension', 'fingerprint', 
  'hub', 'all_inclusive', 'waves', 'stars'
];

const TAG_COLORS: Record<string, string> = {
  'Parapercepção': 'border-purple-500 text-purple-600 bg-purple-500/10 dark:text-purple-400',
  'Cosmoética': 'border-emerald-500 text-emerald-600 bg-emerald-500/10 dark:text-emerald-400',
  'Projeciologia': 'border-blue-500 text-blue-600 bg-blue-500/10 dark:text-blue-400',
  'Assistenciologia': 'border-amber-500 text-amber-600 bg-amber-500/10 dark:text-amber-400',
  'Holossomática': 'border-rose-500 text-rose-600 bg-rose-500/10 dark:text-rose-400',
  'Energossomática': 'border-cyan-500 text-cyan-600 bg-cyan-500/10 dark:text-cyan-400',
};

const ProfileEditScreen: React.FC<ProfileEditScreenProps> = ({ onNavigate, isDarkMode, toggleTheme }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Douglas L. Rocha',
    conscienciologicalName: 'D. Rocha',
    bio: 'Pesquisador da parapercepção e cosmoética aplicada.\n\nFoco em desassedio mentalsomático e mapeamento de sinalética paranormal.',
    city: 'Foz do Iguaçu, PR',
    specialties: ['Parapercepção', 'Cosmoética'],
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
      instagram: '',
      whatsapp: '',
      facebook: '',
      linkedin: '',
      tiktok: '',
      youtube: '',
      researchgate: '',
      scholar: '',
      website: '',
      blog: ''
    },
    projects: ['Mapeamento de Sinalética Energética', 'Parapedagogia Aplicada'],
    publications: ['Manual de Sinalética (Coautor)', 'Princípios da Cosmoeticologia']
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      if (onNavigate) onNavigate('public-profile');
    }, 1500);
  };

  const toggleSpecialty = (tag: string) => {
    setProfile(prev => {
      const isSelected = prev.specialties.includes(tag);
      const newSpecialties = isSelected 
        ? prev.specialties.filter(t => t !== tag)
        : [...prev.specialties, tag];
      return { ...prev, specialties: newSpecialties };
    });
  };

  const handleSocialChange = (key: keyof UserProfile['socialLinks'], value: string) => {
    setProfile(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [key]: value
      }
    }));
  };

  const SocialLogos = {
    YouTube: <svg className="w-5 h-5" fill="#FF0000" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
    Instagram: <svg className="w-5 h-5" fill="#E4405F" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.332 3.608 1.308.975.975 1.245 2.242 1.308 3.607.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.063 1.366-.333 2.633-1.308 3.608-.975.975-2.242 1.245-3.607 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.063-2.633-.333-3.608-1.308-.975-.975-1.245-2.242-1.308-3.607-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.332-2.633 1.308-3.608.975-.975 2.242-1.245 3.607-1.308 1.266-.058-1.646-.07 4.85-.07zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.668-.072-4.948-.197-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>,
    WhatsApp: <svg className="w-5 h-5" fill="#25D366" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
    Facebook: <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.387H7.078v-3.467h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.467h-2.796v8.387C19.612 23.027 24 18.062 24 12.073z"/></svg>,
    LinkedIn: <svg className="w-5 h-5" fill="#0077B5" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
    TikTok: <svg className="w-5 h-5" fill="#000000" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.44-4.13-1.19-.29-.17-.56-.36-.82-.57V14.5c0 1.72-.4 3.44-1.31 4.88-1.55 2.46-4.44 3.89-7.3 3.56-2.85-.33-5.32-2.38-6.14-5.12-1-3.32.74-7.14 3.96-8.43.85-.34 1.75-.5 2.66-.51.04 1.34.01 2.68.01 4.02-.75.03-1.52.22-2.18.59-.97.54-1.58 1.57-1.61 2.68-.03 1.14.53 2.26 1.48 2.89 1.12.74 2.7.74 3.82 0 1.04-.68 1.6-1.92 1.61-3.16V.02z"/></svg>,
    ResearchGate: <svg className="w-5 h-5" fill="#00CCBB" viewBox="0 0 24 24"><path d="M19.586 1.104C18.147.382 15.176 0 11.996 0 8.816 0 5.85.382 4.406 1.104 2.962 1.826 2 3.193 2 4.704v14.592c0 1.511.962 2.878 2.406 3.6 1.444.722 4.41 1.104 7.59 1.104 3.18 0 6.15-.382 7.594-1.104 1.444-.722 2.41-2.089 2.41-3.6V4.704c0-1.511-.966-2.878-2.414-3.6zm-1.636 18.192c0 .825-.67 1.493-1.496 1.493H7.542c-.826 0-1.496-.668-1.496-1.493V4.704c0-.825.67-1.492 1.496-1.492h8.912c.826 0 1.496.667 1.496 1.492v14.592zM8.567 8.047h1.163v5.195c0 .66.386 1.046 1.046 1.046s1.046-.386 1.046-1.046V8.047h1.163v5.207c0 1.31-.77 2.08-2.209 2.08s-2.209-.77-2.209-2.08V8.047z"/></svg>,
    Scholar: <svg className="w-5 h-5" fill="#4285F4" viewBox="0 0 24 24"><path d="M12 24a7 7 0 1 1 0-14 7 7 0 0 1 0 14zm0-24L0 9.5l4.8 3.6V21h14.4v-7.9l4.8-3.6L12 0z"/></svg>
  };

  return (
    <div className={`min-h-screen w-full transition-colors duration-500 pb-32 overflow-x-hidden ${isDarkMode ? 'stellar-bg text-gray-200' : 'bg-[#F8FAFC] text-slate-900'}`}>
      
      {/* HEADER DE EDIÇÃO */}
      <header className="fixed top-0 left-0 w-full h-16 lg:h-[72px] bg-white/90 dark:bg-[#050505]/95 backdrop-blur-2xl border-b border-slate-200 dark:border-white/5 z-[100] px-4 lg:px-6 flex items-center justify-between shadow-sm dark:shadow-soft">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onNavigate && onNavigate('feed')}
            className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex flex-col">
            <h1 className="font-arimo font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-tight">Editar Perfil</h1>
            <span className="text-[10px] text-slate-400 dark:text-gray-400 font-black tracking-widest uppercase">Identidade Conscienciológica</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={toggleTheme}
            className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all active:scale-90"
            title="Alternar Tema"
          >
            <span className="material-symbols-outlined text-xl">
              {isDarkMode ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`px-4 sm:px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${isSaving ? 'bg-slate-200 dark:bg-white/20 text-slate-500 dark:text-slate-300 border border-slate-300 dark:border-white/10 cursor-wait' : 'bg-slate-900 dark:bg-white text-white dark:text-black hover:scale-105 active:scale-95'}`}
          >
            {isSaving ? (
              <><span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></span>Salvando...</>
            ) : (
              <><span className="material-symbols-outlined text-sm">save</span>Salvar</>
            )}
          </button>
        </div>
      </header>

      {/* CONTAINER PRINCIPAL */}
      <main className="pt-24 lg:pt-32 px-4 lg:px-8 max-w-[1400px] mx-auto animate-fade-in-up">
        
        <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-start">
          
          {/* COLUNA ESQUERDA */}
          <div className="lg:col-span-7 space-y-12 mb-12 lg:mb-0">
            
            {/* SEÇÃO 1: IDENTIDADE BÁSICA */}
            <section className="space-y-6">
              <div className="flex items-center gap-4 mb-2">
                <span className="material-symbols-outlined text-orange-600">fingerprint</span>
                <h2 className="text-lg lg:text-xl font-monteserra font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">Identidade Básica</h2>
              </div>
              
              <div className="bg-white dark:bg-[#0A0A0A] p-6 lg:p-8 rounded-[2rem] border border-slate-200 dark:border-white/10 flex flex-col md:flex-row gap-8 items-start shadow-sm dark:shadow-none">
                <div className="relative group cursor-pointer shrink-0 mx-auto md:mx-0 p-4" onClick={() => onNavigate && onNavigate('public-profile')}>
                  <div className="absolute inset-0 rounded-[2.5rem] border-2 border-dashed opacity-30 animate-spin-slow pointer-events-none" style={{ borderColor: profile.colors.primary }}></div>
                  <div className="absolute inset-2 rounded-[2.2rem] border border-blue-600/20 animate-reverse-spin opacity-40 pointer-events-none"></div>
                  <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr from-transparent via-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity animate-pulse pointer-events-none"></div>

                  <div className="w-28 h-28 lg:w-32 lg:h-32 rounded-[2rem] overflow-hidden border-2 transition-all duration-500 shadow-xl relative z-10" style={{ borderColor: profile.colors.primary }}>
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYhCM8_nWUST5WsxIO9t-HyCYoRcSrlMZFKLCT8hoV37f9RdWzrCO6cqtheXkxaMfI9xpL0OIdhiWdEUKLrFu2q_AKokQM18oWk-tEOUYcwA81LZg3j7bDrJKwb0HMRxGs5CiPQGDD5EaW62enBLwkhHO6Jv4kEPMAe4XWi4M-0X6IDoDiCyk6kHHpUMBdG4bRKmf_5H88Hd8xizCwT6jVcpal_ZtxEGoEICbr3jiDQUCThSSHZlshbevmwuodSJtS9gm41hAmK1Y" alt="Avatar" className="w-full h-full object-cover opacity-90 group-hover:opacity-60 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-white text-3xl drop-shadow-lg">visibility</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 w-full space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Nome Completo</label>
                      <input type="text" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-slate-400 dark:focus:border-slate-500 focus:outline-none transition-all font-medium text-sm shadow-inner" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black tracking-widest text-blue-600">Nome Conscienciológico</label>
                      <input type="text" value={profile.conscienciologicalName} onChange={(e) => setProfile({...profile, conscienciologicalName: e.target.value})} className="w-full bg-slate-50 dark:bg-white/5 border border-blue-600/20 dark:border-blue-500/30 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-slate-400 dark:focus:border-slate-500 focus:outline-none transition-all font-mono text-sm shadow-inner" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Mini Bio Técnica (Holossomática)</label>
                    <textarea 
                      rows={5} 
                      value={profile.bio} 
                      onChange={(e) => setProfile({...profile, bio: e.target.value})} 
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2rem] px-6 py-4 text-slate-700 dark:text-gray-300 text-sm focus:border-slate-400 dark:focus:border-slate-500 focus:outline-none transition-all resize-none leading-relaxed shadow-inner overflow-y-auto custom-scrollbar"
                      placeholder="Descreva sua especialidade e histórico de pesquisa..."
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* SEÇÃO: LOCALIZAÇÃO */}
            <section className="space-y-6">
              <div className="flex items-center gap-4 mb-2">
                <span className="material-symbols-outlined text-orange-600">location_on</span>
                <h2 className="text-lg lg:text-xl font-monteserra font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">Localização</h2>
              </div>
              <div className="bg-white dark:bg-[#0A0A0A] p-6 lg:p-8 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none">
                <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Cidade / Estado</label>
                    <input type="text" placeholder="Ex: Foz do Iguaçu, PR" value={profile.city} onChange={(e) => setProfile({...profile, city: e.target.value})} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-orange-500/50 transition-all shadow-inner" />
                </div>
              </div>
            </section>

            {/* SEÇÃO 2: LINHAS DE PESQUISA */}
            <section className="space-y-6">
              <div className="flex items-center gap-4 mb-2">
                <span className="material-symbols-outlined text-purple-600">travel_explore</span>
                <h2 className="text-lg lg:text-xl font-monteserra font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">Linhas de Pesquisa</h2>
              </div>
              
              <div className="bg-white dark:bg-[#0A0A0A] p-6 lg:p-8 rounded-[2rem] border border-slate-200 dark:border-white/10 space-y-6 shadow-sm dark:shadow-none">
                 <div className="flex flex-wrap gap-3">
                   {['Parapercepção', 'Cosmoética', 'Projeciologia', 'Assistenciologia', 'Holossomática', 'Energossomática'].map(tag => {
                     const isSelected = profile.specialties.includes(tag);
                     const colorClasses = TAG_COLORS[tag] || 'border-blue-600 text-blue-600 bg-blue-500/10';
                     
                     return (
                        <button 
                          key={tag}
                          onClick={() => toggleSpecialty(tag)}
                          className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border transition-all ${
                            isSelected 
                              ? `${colorClasses} shadow-sm dark:shadow-[0_0_15px_rgba(255,255,255,0.05)]` 
                              : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-500 hover:border-slate-400 hover:text-slate-600'
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                    <button className="px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border border-dashed border-slate-300 dark:border-white/20 text-slate-400 dark:text-gray-500 hover:border-slate-400 hover:text-slate-600 transition-all flex items-center gap-2">
                       <span className="material-symbols-outlined text-sm">add</span>Adicionar
                    </button>
                  </div>
               </div>
            </section>

            {/* SEÇÃO: PROJETOS E PUBLICAÇÕES */}
            <section className="space-y-6">
              <div className="flex items-center gap-4 mb-2">
                <span className="material-symbols-outlined text-indigo-500">menu_book</span>
                <h2 className="text-lg lg:text-xl font-monteserra font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">Projetos & Publicações</h2>
              </div>
              
              <div className="bg-white dark:bg-[#0A0A0A] p-6 lg:p-8 rounded-[2rem] border border-slate-200 dark:border-white/10 space-y-6 shadow-sm dark:shadow-none">
                
                {/* Projetos */}
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Projetos em Curso</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      id="new-project-input"
                      placeholder="Adicionar novo projeto..." 
                      className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-xs focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = (e.target as HTMLInputElement).value.trim();
                          if (val) {
                            setProfile(prev => ({ ...prev, projects: [...prev.projects, val] }));
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                    />
                    <button 
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('new-project-input') as HTMLInputElement;
                        const val = input?.value.trim();
                        if (val) {
                          setProfile(prev => ({ ...prev, projects: [...prev.projects, val] }));
                          input.value = '';
                        }
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {profile.projects.map((proj, idx) => (
                      <span key={idx} className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg text-xs flex items-center gap-1.5">
                        {proj}
                        <button 
                          type="button" 
                          onClick={() => setProfile(prev => ({ ...prev, projects: prev.projects.filter((_, i) => i !== idx) }))}
                          className="hover:text-red-500 text-[10px] cursor-pointer"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Publicações */}
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Publicações Principais</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      id="new-pub-input"
                      placeholder="Adicionar nova publicação..." 
                      className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-xs focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = (e.target as HTMLInputElement).value.trim();
                          if (val) {
                            setProfile(prev => ({ ...prev, publications: [...prev.publications, val] }));
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                    />
                    <button 
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('new-pub-input') as HTMLInputElement;
                        const val = input?.value.trim();
                        if (val) {
                          setProfile(prev => ({ ...prev, publications: [...prev.publications, val] }));
                          input.value = '';
                        }
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    {profile.publications.map((pub, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-2 rounded-xl text-xs">
                        <span className="truncate pr-4">{pub}</span>
                        <button 
                          type="button" 
                          onClick={() => setProfile(prev => ({ ...prev, publications: prev.publications.filter((_, i) => i !== idx) }))}
                          className="text-red-500 hover:text-red-400 font-bold cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </section>

            {/* SEÇÃO 3: REDES SOCIAIS & LINKS */}
            <section className="space-y-6">
              <div className="flex items-center gap-4 mb-2">
                <span className="material-symbols-outlined text-pink-600">share</span>
                <h2 className="text-lg lg:text-xl font-monteserra font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">Redes Sociais & Links</h2>
              </div>
              
              <div className="bg-white dark:bg-[#0A0A0A] p-6 lg:p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* YouTube */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 flex items-center gap-3">
                      {SocialLogos.YouTube} YouTube
                    </label>
                    <input type="text" placeholder="youtube.com/@username" value={profile.socialLinks.youtube} onChange={(e) => handleSocialChange('youtube', e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-red-600/50 transition-all shadow-inner" />
                  </div>

                  {/* Instagram */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 flex items-center gap-3">
                      {SocialLogos.Instagram} Instagram
                    </label>
                    <input type="text" placeholder="@username" value={profile.socialLinks.instagram} onChange={(e) => handleSocialChange('instagram', e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-pink-500/50 transition-all shadow-inner" />
                  </div>

                  {/* WhatsApp */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 flex items-center gap-3">
                      {SocialLogos.WhatsApp} WhatsApp
                    </label>
                    <input type="text" placeholder="+55 (00) 00000-0000" value={profile.socialLinks.whatsapp} onChange={(e) => handleSocialChange('whatsapp', e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-green-600/50 transition-all shadow-inner" />
                  </div>

                  {/* Facebook */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 flex items-center gap-3">
                      {SocialLogos.Facebook} Facebook
                    </label>
                    <input type="text" placeholder="facebook.com/username" value={profile.socialLinks.facebook} onChange={(e) => handleSocialChange('facebook', e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-600/50 transition-all shadow-inner" />
                  </div>

                  {/* LinkedIn */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 flex items-center gap-3">
                      {SocialLogos.LinkedIn} LinkedIn
                    </label>
                    <input type="text" placeholder="linkedin.com/in/username" value={profile.socialLinks.linkedin} onChange={(e) => handleSocialChange('linkedin', e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-600/50 transition-all shadow-inner" />
                  </div>

                  {/* TikTok */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 flex items-center gap-3">
                      {SocialLogos.TikTok} TikTok
                    </label>
                    <input type="text" placeholder="@username" value={profile.socialLinks.tiktok} onChange={(e) => handleSocialChange('tiktok', e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-slate-400/50 transition-all shadow-inner" />
                  </div>

                  {/* ResearchGate */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 flex items-center gap-3">
                      {SocialLogos.ResearchGate} ResearchGate
                    </label>
                    <input type="text" placeholder="researchgate.net/profile/username" value={profile.socialLinks.researchgate} onChange={(e) => handleSocialChange('researchgate', e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-[#00CCBB]/50 transition-all shadow-inner" />
                  </div>

                  {/* Google Scholar */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 flex items-center gap-3">
                      {SocialLogos.Scholar} Google Scholar
                    </label>
                    <input type="text" placeholder="scholar.google.com/citations?user=..." value={profile.socialLinks.scholar} onChange={(e) => handleSocialChange('scholar', e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-slate-400/50 transition-all shadow-inner" />
                  </div>
                </div>
              </div>
            </section>

            {/* SEÇÃO DEDICADA: LINKS DE AUTORIA & WEB */}
            <section className="space-y-6">
              <div className="flex items-center gap-4 mb-2">
                <span className="material-symbols-outlined text-slate-900 dark:text-white">language</span>
                <h2 className="text-lg lg:text-xl font-monteserra font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">Links de Autoria & Web</h2>
              </div>
              
              <div className="bg-white dark:bg-[#0A0A0A] p-6 lg:p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Website */}
                    <div className="space-y-3 group">
                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 flex items-center gap-2 group-focus-within:text-slate-600 transition-colors">
                            <span className="material-symbols-outlined text-lg">public</span> Website / Portfólio
                        </label>
                        <div className="relative">
                            <input 
                                type="url" 
                                placeholder="https://seusite.com" 
                                value={profile.socialLinks.website} 
                                onChange={(e) => handleSocialChange('website', e.target.value)} 
                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-slate-400 transition-all shadow-inner" 
                            />
                        </div>
                    </div>

                    {/* Blog */}
                    <div className="space-y-3 group">
                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 flex items-center gap-2 group-focus-within:text-slate-600 transition-colors">
                            <span className="material-symbols-outlined text-lg">auto_stories</span> Blog de Autopesquisa
                        </label>
                        <div className="relative">
                            <input 
                                type="url" 
                                placeholder="https://seu-blog-de-estudos.com" 
                                value={profile.socialLinks.blog} 
                                onChange={(e) => handleSocialChange('blog', e.target.value)} 
                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-slate-400 transition-all shadow-inner" 
                            />
                        </div>
                    </div>
                </div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 italic px-2">Estes links serão exibidos como portfólio oficial na sua vitrine holossomática.</p>
              </div>
            </section>

            {/* SEÇÃO 4: PRIVACIDADE */}
            <section className="space-y-6 pb-12 lg:pb-0">
              <div className="flex items-center gap-4 mb-2">
                <span className="material-symbols-outlined text-slate-400">visibility</span>
                <h2 className="text-lg lg:text-xl font-monteserra font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">Privacidade da Vitrine</h2>
              </div>
              <div className="bg-white dark:bg-[#0A0A0A] p-6 lg:p-8 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none">
                  {[
                      { key: 'showCommitments', label: 'Exibir Meus Compromissos Conscienciológicos' }
                  ].map((item: any) => (
                      <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-300">{item.label}</span>
                          <button onClick={() => setProfile({...profile, visibility: { ...profile.visibility, [item.key]: !profile.visibility[item.key as keyof typeof profile.visibility] } })} className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-300 ${profile.visibility[item.key as keyof typeof profile.visibility] ? 'bg-green-500' : 'bg-slate-300 dark:bg-gray-700'}`}>
                              <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${profile.visibility[item.key as keyof typeof profile.visibility] ? 'translate-x-5' : 'translate-x-0'}`}></div>
                          </button>
                      </div>
                  ))}
              </div>
            </section>
          </div>

          {/* COLUNA DIREITA */}
          <div className="lg:col-span-5 space-y-12">
            
            {/* SEÇÃO 5: ASSINATURA SIMBÓLICA */}
            <section className="space-y-6">
              <div className="flex items-center gap-4 mb-2">
                <span className="material-symbols-outlined text-orange-600">palette</span>
                <h2 className="text-lg lg:text-xl font-monteserra font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">Assinatura Simbólica</h2>
              </div>
              
              <div className="flex flex-col gap-8">
                <div className="bg-white dark:bg-[#0A0A0A] p-6 lg:p-10 rounded-[2.5rem] border border-slate-200 dark:border-white/10 space-y-10 shadow-sm dark:shadow-none">
                   <div className="space-y-4">
                      <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Frequência Cromática</label>
                      <div className="flex flex-wrap gap-6 pl-2">
                         {AVAILABLE_COLORS.map((color, idx) => (
                            <button 
                              key={color.hex} 
                              onClick={() => setProfile({...profile, colors: { ...profile.colors, primary: color.hex }})} 
                              className={`w-11 h-11 splatter-shape transition-all duration-300 relative flex items-center justify-center shadow-md`}
                              style={{ transform: `rotate(${idx * 37}deg)` } as any}
                            >
                               <div className={`absolute inset-0 splatter-shape blur-[8px] transition-opacity duration-300 ${profile.colors.primary === color.hex ? 'opacity-40' : 'opacity-0'}`} style={{ backgroundColor: color.hex }}></div>
                               <div className={`w-full h-full splatter-shape border-2 transition-all duration-300 relative z-10 ${profile.colors.primary === color.hex ? 'scale-110 border-slate-900 dark:border-white ring-4 ring-slate-900/10 dark:ring-white/5' : 'border-transparent opacity-70 hover:opacity-100 hover:scale-105'}`} style={{ backgroundColor: color.hex }}>
                                  {profile.colors.primary === color.hex && <span className="absolute inset-0 flex items-center justify-center"><span className="w-2.5 h-2.5 bg-white rounded-full shadow-lg"></span></span>}
                               </div>
                            </button>
                         ))}
                      </div>
                   </div>

                   <div className="space-y-4">
                      <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Estilo Energético</label>
                      <div className="flex flex-wrap gap-2">
                        {['Vibrante', 'Serene', 'Introspectiva', 'Intensa', 'Expansiva'].map((s: any) => (
                           <button key={s} onClick={() => setProfile({...profile, energeticStyle: s})} className={`px-4 py-2.5 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${profile.energeticStyle === s ? 'bg-slate-900 dark:bg-white text-white dark:text-black border-slate-900 dark:border-white shadow-lg scale-[1.03]' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-500 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'}`}>{s}</button>
                        ))}
                      </div>
                   </div>

                   <div className="space-y-4">
                      <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Ícone de Assinatura</label>
                      <div className="grid grid-cols-6 gap-3">
                        {AVAILABLE_ICONS.map(icon => (
                          <button key={icon} onClick={() => setProfile({...profile, signatureIcon: icon})} className={`aspect-square rounded-[1.2rem] border flex items-center justify-center transition-all group relative overflow-hidden ${profile.signatureIcon === icon ? 'bg-slate-900 dark:bg-white text-white dark:text-black border-slate-900 dark:border-white shadow-xl scale-110' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20'}`}>
                            <span className="material-symbols-outlined text-xl relative z-10">{icon}</span>
                          </button>
                        ))}
                      </div>
                   </div>
                </div>

                {/* PREVIEW DINÂMICO */}
                <div className={`p-10 lg:p-14 rounded-[3.5rem] border flex flex-col items-center justify-center gap-8 min-h-[420px] relative overflow-hidden shadow-2xl transition-all ${isDarkMode ? 'bg-[#050505] border-white/10' : 'bg-white border-slate-200'}`}>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full blur-[100px] opacity-20 transition-all duration-1000" style={{ backgroundColor: profile.colors.primary, transform: 'translate(-50%, -50%) scale(1.2)' }}></div>
                  
                  <div className="relative z-10 flex flex-col items-center text-center animate-float">
                     <div className="relative mb-8">
                        <div className="absolute -inset-4 rounded-[3.5rem] border-2 opacity-30 animate-spin-slow" style={{ borderColor: profile.colors.primary }}></div>
                        <div className="w-32 h-32 rounded-[2.8rem] p-1.5 border-2 transition-all duration-700 bg-white dark:bg-black shadow-2xl relative z-10" style={{ borderColor: profile.colors.primary, boxShadow: isDarkMode ? `0 0 40px -10px ${profile.colors.primary}66` : `0 10px 30px -10px ${profile.colors.primary}44` }}>
                           <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYhCM8_nWUST5WsxIO9t-HyCYoRcSrlMZFKLCT8hoV37f9RdWzrCO6cqtheXkxaMfI9xpL0OIdhiWdEUKLrFu2q_AKokQM18oWk-tEOUYcwA81LZg3j7bDrJKwb0HMRxGs5CiPQGDD5EaW62enBLwkhHO6Jv4kEPMAe4XWi4M-0X6IDoDiCyk6kHHpUMBdG4bRKmf_5H88Hd8xizCwT6jVcpal_ZtxEGoEICbr3jiDQUCThSSHZlshbevmwuodSJtS9gm41hAmK1Y" className="w-full h-full rounded-[2.4rem] object-cover" alt="Preview" />
                        </div>
                        <div className="absolute -bottom-3 -right-3 w-12 h-12 rounded-2xl flex items-center justify-center text-white border-2 border-white dark:border-black shadow-2xl z-20 transform rotate-12 transition-transform duration-500" style={{ backgroundColor: profile.colors.primary }}>
                           <span className="material-symbols-outlined text-xl">{profile.signatureIcon}</span>
                        </div>
                     </div>
                     
                     <div className="space-y-1">
                        <h3 className="text-2xl lg:text-3xl font-display font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-2">{profile.conscienciologicalName || profile.name}</h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: profile.colors.primary }}>{profile.energeticStyle} Researcher</p>
                        <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{profile.city}</p>
                     </div>
                     
                     {/* Preview da Bio com suporte a parágrafos */}
                     <div className="mt-6 max-w-[280px] overflow-hidden">
                        <p className="text-[11px] lg:text-xs text-slate-600 dark:text-gray-400 leading-relaxed font-medium italic line-clamp-4 whitespace-pre-line">
                           "{profile.bio}"
                        </p>
                     </div>
                     
                     <div className="flex flex-wrap gap-2 justify-center mt-6">
                        {profile.specialties.length > 0 ? (
                          profile.specialties.slice(0, 3).map(tag => (
                            <span key={tag} className="text-[9px] font-black bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-1.5 rounded-xl text-slate-500 dark:text-gray-400 uppercase tracking-widest shadow-inner transition-all animate-fade-in">
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-[9px] font-black text-slate-400 dark:text-gray-600 uppercase tracking-widest italic opacity-50">Sem Especialidades</span>
                        )}
                     </div>

                     <div className="flex gap-4 mt-8 opacity-40 text-slate-900 dark:text-white items-center">
                        {profile.socialLinks.youtube && SocialLogos.YouTube}
                        {profile.socialLinks.instagram && SocialLogos.Instagram}
                        {profile.socialLinks.whatsapp && SocialLogos.WhatsApp}
                        {profile.socialLinks.facebook && SocialLogos.Facebook}
                        {profile.socialLinks.linkedin && SocialLogos.LinkedIn}
                        {profile.socialLinks.researchgate && SocialLogos.ResearchGate}
                        {(profile.socialLinks.website || profile.socialLinks.blog) && <span className="material-symbols-outlined text-lg">language</span>}
                     </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

        </div>

      </main>

      <style>{`
         @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
         @keyframes reverse-spin { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
         .animate-spin-slow { animation: spin-slow 12s linear infinite; }
         .animate-reverse-spin { animation: reverse-spin 15s linear infinite; }
         .splatter-shape { 
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; 
            transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
         }
         button:hover .splatter-shape {
            border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
         }
      `}</style>
    </div>
  );
};

export default ProfileEditScreen;
