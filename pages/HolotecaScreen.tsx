
import React, { useState, useEffect, useRef } from 'react';
import { useGlobalContext, HolotecaCard } from '../context/AdicionaresContext';

// --- Interfaces ---
// Use HolotecaCard instead of ResearchFile

interface ThemeDefinition {
  id: string;
  title: string;
  description: string;
  headerImage: string;
  color: string;
  accentHex: string;
  accentRgb: string;
  categories: string[]; // Categories included in this theme
}

interface ThemeSection extends ThemeDefinition {
  files: HolotecaCard[];
}

interface HolotecaScreenProps {
  onNavigate?: (screen: any) => void;
}

// --- Theme Definitions (Configuration) ---
const THEME_DEFINITIONS: ThemeDefinition[] = [
  {
    id: 't1',
    title: 'Parapsiquismo Lúcido',
    description: 'Registros sobre a expansão dos sentidos e a fenomenologia extrafísica.',
    headerImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&q=80',
    color: 'platinum',
    accentHex: '#E5E4E2',
    accentRgb: '229, 228, 226',
    categories: ['PARAPSIQUISMO']
  },
  {
    id: 't2',
    title: 'Bioenergetica de Ponta',
    description: 'Domínio das energias, instalação do EV e blindagem holossomática.',
    headerImage: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1600&q=80',
    color: 'silver',
    accentHex: '#C0C0C0',
    accentRgb: '192, 192, 192',
    categories: ['BIOENERGIA']
  },
  {
    id: 't3',
    title: 'Mentalsomática e Cosmoética',
    description: 'Debates sobre cosmoética, discernimento e autopesquisa técnica.',
    headerImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&q=80',
    color: 'gunmetal',
    accentHex: '#919191',
    accentRgb: '145, 145, 145',
    categories: ['COSMOÉTICA', 'EVOLUCIOLOGIA', 'MENTALSOMÁTICA']
  }
];

const DEFAULT_NEON = '#C0C0C0';

const HolotecaScreen: React.FC<HolotecaScreenProps> = ({ onNavigate }) => {
  const { holotecaCards } = useGlobalContext();
  const [selectedFile, setSelectedFile] = useState<HolotecaCard | null>(null);
  const [activeTheme, setActiveTheme] = useState<ThemeSection | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [history, setHistory] = useState<HolotecaCard[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('holoteca-theme-dark');
      return savedTheme !== null ? JSON.parse(savedTheme) : true;
    }
    return true;
  });

  const historyRef = useRef<HTMLDivElement>(null);

  // Salvar preferência sempre que mudar
  useEffect(() => {
    localStorage.setItem('holoteca-theme-dark', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Fechar histórico ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (historyRef.current && !historyRef.current.contains(event.target as Node)) {
        setShowHistory(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectFile = (file: HolotecaCard, theme: ThemeSection) => {
    // Adicionar ao histórico
    setHistory(prev => {
      const filtered = prev.filter(h => h.id !== file.id);
      return [file, ...filtered].slice(0, 5);
    });

    // REDIRECIONAMENTO PARA CINEMA NO PRIMEIRO CARD (f1)
    if (file.id === 'f1') {
      onNavigate && onNavigate('cinema');
      return;
    }

    setSelectedFile(file);
    setActiveTheme(theme);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Derive sections from global state
  const derivedSections: ThemeSection[] = THEME_DEFINITIONS.map(def => ({
    ...def,
    files: holotecaCards.filter(card => def.categories.includes(card.specialty))
  })).filter(section => section.files.length > 0);

  const filteredThemes = derivedSections.map(theme => ({
    ...theme,
    files: theme.files.filter(f =>
      f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(theme => theme.files.length > 0);

  return (
    <div className={`${isDarkMode ? 'bg-[#050505] text-gray-200' : 'bg-[#F8F9FA] text-gray-800'} font-body antialiased min-h-screen w-full flex flex-col overflow-x-hidden transition-colors duration-500`}>

      {/* HEADER DINÂMICO REFINADO - ESTILO SILVER CHROME */}
      <header
        className={`fixed top-0 left-0 w-full h-16 lg:h-20 ${isDarkMode ? 'bg-[#050505]/95' : 'bg-white/90 shadow-sm'} backdrop-blur-3xl border-b z-[100] px-3 lg:px-8 flex items-center justify-between transition-all duration-700`}
        style={{
          borderColor: selectedFile ? `${activeTheme?.accentHex}44` : (isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'),
          boxShadow: selectedFile ? `0 4px 30px rgba(${activeTheme?.accentRgb}, 0.1)` : 'none'
        }}
      >
        {/* Lado Esquerdo: Navegação */}
        <div className="flex items-center gap-2 lg:gap-4 lg:w-1/4 shrink-0">
          <button
            onClick={() => selectedFile ? setSelectedFile(null) : (onNavigate && onNavigate('feed'))}
            className={`w-10 h-10 lg:w-12 lg:h-12 rounded-2xl ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'} border flex items-center justify-center transition-all hover:bg-white/10 active:scale-95 group shadow-lg shrink-0`}
            style={{ color: selectedFile ? activeTheme?.accentHex : (isDarkMode ? '#fff' : '#000') }}
          >
            <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform text-2xl lg:text-3xl">
              chevron_left
            </span>
          </button>

          <div className="flex flex-col max-w-[60px] md:max-w-none">
            <h1 className={`font-display font-black text-[10px] lg:text-xl ${isDarkMode ? 'text-white' : 'text-gray-900'} leading-tight uppercase tracking-tighter truncate`}>
              {selectedFile ? 'Registro' : 'Holoteca'}
            </h1>
            <span
              className="text-[7px] lg:text-[10px] font-black tracking-[0.2em] lg:tracking-[0.3em] uppercase opacity-60 truncate"
              style={{ color: selectedFile ? activeTheme?.accentHex : (isDarkMode ? '#fff' : '#000') }}
            >
              {selectedFile ? selectedFile.specialty : 'Campo'}
            </span>
          </div>
        </div>

        {/* Centro: Barra de Pesquisa (Ancorada à esquerda para evitar conflitos) */}
        {!selectedFile ? (
          <div className="flex flex-1 justify-start px-2 lg:pl-12 lg:pr-32">
            <div className="relative group w-full max-w-[280px] lg:max-w-md mr-auto">
              <span className={`material-symbols-outlined absolute left-3 lg:left-5 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-white/40 group-focus-within:text-white' : 'text-black/40 group-focus-within:text-black'} transition-colors text-lg lg:text-xl`}>search</span>
              <input
                type="text"
                placeholder="Explorar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className={`w-full ${isDarkMode ? 'bg-white/5 border-white/10 placeholder-white/20' : 'bg-black/[0.03] border-black/10 placeholder-black/30'} border rounded-2xl lg:rounded-3xl py-1.5 lg:py-3 pl-9 lg:pl-14 pr-4 lg:pr-6 text-[10px] lg:text-sm focus:outline-none focus:border-blue-500/50 transition-all ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1"></div>
        )}

        {/* Lado Direito: Ações e Perfil */}
        <div className={`flex items-center gap-1.5 lg:gap-4 lg:w-1/4 justify-end relative shrink-0 transition-all duration-500 ${isSearchFocused ? 'w-0 opacity-0 md:w-1/4 md:opacity-100 overflow-hidden' : 'w-auto opacity-100'}`}>
          {/* Botão Grupo (Silver Shimmer Adaptativo) */}
          <button
            onClick={() => onNavigate && onNavigate('grupo')}
            className={`flex items-center gap-1.5 lg:gap-2 px-3 lg:px-5 py-2 lg:py-3 rounded-2xl ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10 shadow-sm'} hover:scale-105 active:scale-95 transition-all group overflow-hidden relative shrink-0`}
          >
            <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-${isDarkMode ? 'white' : 'black'}/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000`}></div>

            <span className={`material-symbols-outlined text-[18px] lg:text-[22px] bg-gradient-to-r from-gray-400 via-${isDarkMode ? 'white' : 'gray-800'} to-gray-400 bg-clip-text text-transparent animate-text-shimmer ${isDarkMode ? 'drop-shadow-[0_0_2px_rgba(255,255,255,0.5)]' : ''}`}>
              grid_view
            </span>
            <span className={`text-[7px] md:text-[9px] lg:text-[10px] font-black uppercase tracking-[0.1em] lg:tracking-[0.2em] bg-gradient-to-r from-gray-400 via-${isDarkMode ? 'white' : 'gray-800'} to-gray-400 bg-clip-text text-transparent animate-text-shimmer ${isDarkMode ? 'drop-shadow-[0_0_2px_rgba(255,255,255,0.5)]' : ''}`}>
              Grupo
            </span>
          </button>

          <div className="h-6 w-[1px] bg-white/10 mx-0.5 lg:mx-2 hidden sm:block"></div>

          {/* Botão de Histórico */}
          <div className="relative" ref={historyRef}>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`flex items-center gap-1 lg:gap-3 px-2 lg:px-6 py-2 lg:py-3 rounded-2xl border transition-all group overflow-hidden relative ${showHistory ? (isDarkMode ? 'bg-white/10 border-white/20' : 'bg-black/10 border-black/20') : (isDarkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10')}`}
            >
              <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-${isDarkMode ? 'white' : 'black'}/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000`}></div>
              <span className={`${isDarkMode ? 'text-white/40 group-hover:text-white' : 'text-black/40 group-hover:text-black'} material-symbols-outlined transition-colors`}>history</span>
              <span className={`hidden lg:block text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Histórico</span>
            </button>

            {/* Dropdown de Histórico */}
            {showHistory && (
              <div className={`absolute top-full right-0 mt-4 w-64 lg:w-80 ${isDarkMode ? 'bg-[#0A0A0A] border-white/10' : 'bg-[#080808] border-white/5 shadow-22xl'} border rounded-[2rem] p-4 lg:p-6 z-[110] animate-fade-in animate-float-vision-pro`} style={{ '--scale': '1' } as any}>
                <div className="flex items-center justify-between mb-4 px-2">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40">Registros Recentes</h4>
                  <span className="material-symbols-outlined text-white/20 text-sm">history</span>
                </div>

                {history.length > 0 ? (
                  <div className="space-y-2">
                    {history.map(item => (
                      <button
                        key={item.id}
                        onClick={() => {
                          const theme = THEME_DEFINITIONS.find(t => t.categories.includes(item.specialty));
                          if (theme) handleSelectFile(item, { ...theme, files: [] });
                          setShowHistory(false);
                        }}
                        className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-all text-left group/item"
                      >
                        <div className="relative shrink-0">
                          <img src={item.thumbnail} className="w-14 h-14 rounded-xl object-cover opacity-60 group-hover/item:opacity-100 transition-opacity" />
                          <div className="absolute inset-0 rounded-xl border border-white/10 group-hover/item:border-white/20"></div>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white text-xs lg:text-sm font-bold line-clamp-1">{item.title}</span>
                          <span className="text-white/40 text-[9px] uppercase tracking-wider mt-0.5">{item.specialty}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                      <span className="material-symbols-outlined text-white/10 text-2xl">history</span>
                    </div>
                    <p className="text-white/20 text-[10px] uppercase font-bold tracking-widest">Vazio</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="h-10 w-[1px] bg-white/10 mx-2 hidden lg:block"></div>

          <div className="flex items-center gap-1.5 lg:gap-3 pl-1 lg:pl-2 shrink-0">
            <div className="flex flex-col items-end hidden lg:flex">
              <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-[11px] font-black uppercase tracking-widest transition-colors`}>D. Rocha</span>
              <span className={`text-[9px] font-bold uppercase tracking-tighter ${isDarkMode ? 'text-white/40' : 'text-black/40'} italic transition-colors`}>Epicon Sênior</span>
            </div>
            <div
              className={`p-0.5 rounded-2xl transition-all duration-700 shadow-glow bg-gradient-to-tr shrink-0 aspect-square flex items-center justify-center`}
              style={{ backgroundImage: selectedFile ? `linear-gradient(to top right, ${activeTheme?.accentHex}, #fff)` : `linear-gradient(to top right, #333, #fff)` }}
            >
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYhCM8_nWUST5WsxIO9t-HyCYoRcSrlMZFKLCT8hoV37f9RdWzrCO6cqtheXkxaMfI9xpL0OIdhiWdEUKLrFu2q_AKokQM18oWk-tEOUYcwA81LZg3j7bDrJKwb0HMRxGs5CiPQGDD5EaW62enBLwkhHO6Jv4kEPMAe4XWi4M-0X6IDoDiCyk6kHHpUMBdG4bRKmf_5H88Hd8xizCwT6jVcpal_ZtxEGoEICbr3jiDQUCThSSHZlshbevmwuodSJtS9gm41hAmK1Y" className="w-9 h-9 lg:w-11 lg:h-11 rounded-[12px] border border-black/50 object-cover" alt="User" />
            </div>
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 w-full pt-20 lg:pt-32 pb-48 overflow-visible relative">
        <div className="max-w-[1600px] mx-auto">

          {!selectedFile ? (
            /* --- VIEW: VITRINE (SHOWCASE) EM CARROSSEIS --- */
            <div className="animate-fade-in space-y-12 lg:space-y-16 py-2 lg:py-4">
              {/* Sessões Temáticas Integradas com Ambiente Visual Metálico */}
              {filteredThemes.map((section, sIdx) => (
                <div key={section.id} className="relative animate-fade-in-up" style={{ animationDelay: `${sIdx * 200}ms` }}>

                  {/* AMBIENTE: Imagem de Fundo (FUNDO ACINZENTADO/PRATEADO) */}
                  <div className="absolute top-0 left-0 w-full h-[450px] lg:h-[600px] pointer-events-none -mt-16 lg:-mt-20 overflow-hidden z-0">
                    <div
                      className="w-full h-full bg-cover bg-center opacity-50 mask-ultra-smooth scale-110 transition-all duration-1000"
                      style={{ backgroundImage: `url(${section.headerImage})` }}
                    ></div>

                    <div className={`absolute inset-0 bg-gradient-to-b ${isDarkMode ? 'from-[#050505] via-transparent to-[#050505]' : 'from-[#F8F9FA] via-transparent to-[#F8F9FA]'} opacity-80`}></div>
                    <div className={`absolute inset-x-0 top-0 h-[400px] bg-gradient-to-b ${isDarkMode ? 'from-[#050505]' : 'from-[#F8F9FA]'} to-transparent opacity-100`}></div>
                    <div className={`absolute inset-x-0 bottom-0 h-[400px] bg-gradient-to-t ${isDarkMode ? 'from-[#050505]' : 'from-[#F8F9FA]'} to-transparent opacity-100`}></div>

                    {/* Glow Chrome de Cor da Sessão (Variações de Prata/Cinza) */}
                    <div className="absolute inset-0 opacity-15" style={{ background: `radial-gradient(circle at 50% 50%, ${section.accentHex}22, transparent 80%)` }}></div>
                    <div className="absolute inset-0 opacity-10" style={{ background: `radial-gradient(circle at 20% 40%, ${section.accentHex}44, transparent 60%), radial-gradient(circle at 80% 60%, ${section.accentHex}44, transparent 60%)` }}></div>
                  </div>

                  {/* Conteúdo do Módulo sobre o Ambiente */}
                  <div className="relative z-10 space-y-12 lg:space-y-24">

                    {/* Info do Módulo (Cabeçalho Integrado) - CENTRALIZADO NO DESKTOP */}
                    <div className="px-6 lg:px-16 max-w-5xl mx-auto flex flex-col items-center">
                      <div className="flex items-center gap-4 mb-6 justify-center">
                        <div className="w-12 h-[3px] rounded-full shadow-lg" style={{ backgroundColor: section.accentHex, boxShadow: `0 0 15px ${section.accentHex}66` }}></div>
                        <span className={`text-[10px] lg:text-[12px] font-black ${isDarkMode ? 'text-white/60' : 'text-black/60'} uppercase tracking-[0.5em] drop-shadow-md`}>Nível Tecnológico</span>
                      </div>
                      <h3 className={`text-4xl lg:text-8xl font-display font-black ${isDarkMode ? 'text-white' : 'text-gray-900'} tracking-tight uppercase leading-[0.9] mb-8 lg:mb-10 text-center`} style={{ textShadow: isDarkMode ? `0 0 40px ${section.accentHex}44` : 'none' }}>
                        {section.title}
                      </h3>
                      <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-800'} text-sm lg:text-2xl font-medium tracking-wide leading-relaxed opacity-90 text-center drop-shadow-lg max-w-3xl mx-auto`}>{section.description}</p>
                    </div>

                    {/* Container Horizontal (Carrossel) */}
                    <div className="relative group/carousel z-20">
                      <div className={`absolute top-0 left-0 bottom-0 w-8 lg:w-48 bg-gradient-to-r ${isDarkMode ? 'from-[#050505]' : 'from-[#F8F9FA]'} to-transparent z-30 pointer-events-none`}></div>
                      <div className={`absolute top-0 right-0 bottom-0 w-8 lg:w-48 bg-gradient-to-l ${isDarkMode ? 'from-[#050505]' : 'from-[#F8F9FA]'} to-transparent z-30 pointer-events-none`}></div>

                      <div className="flex gap-6 lg:gap-14 overflow-x-auto pb-24 lg:pb-40 pt-12 lg:pt-20 px-8 lg:px-24 no-scrollbar snap-x snap-mandatory perspective-1000">
                        {section.files.map((file) => (
                          <div
                            key={file.id}
                            onClick={() => handleSelectFile(file, section)}
                            className={`min-w-[320px] md:min-w-[480px] max-w-[320px] md:max-w-[480px] snap-center group/card relative bg-[#080808] backdrop-blur-xl rounded-[3rem] border-2 overflow-hidden transition-all duration-700 hover:-translate-y-8 hover:rotate-1 cursor-pointer shadow-glass transform-gpu flex flex-col z-10`}
                            style={{ borderColor: `${section.accentHex}11`, boxShadow: `0 30px 60px -20px rgba(0,0,0,0.9)` }}
                          >
                            <div className="absolute inset-0 opacity-0 group-hover/card:opacity-20 transition-opacity duration-700" style={{ background: `radial-gradient(circle at 50% 0%, ${section.accentHex}, transparent)` }}></div>

                            <div className="aspect-video relative overflow-hidden shrink-0">
                              {/* IMAGEM COM CORES ORIGINAIS (SEM GRAYSCALE) */}
                              <img src={file.thumbnail} className="w-full h-full object-cover opacity-80 group-hover/card:opacity-100 group-hover/card:scale-110 transition-all duration-[2s]" alt={file.title} />
                              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>

                              <div className="absolute top-4 lg:top-8 left-4 lg:left-8 text-black font-black text-[9px] lg:text-[11px] px-4 lg:px-5 py-2 rounded-full uppercase tracking-[0.2em] shadow-2xl backdrop-blur-3xl border border-white/20" style={{ backgroundColor: section.accentHex }}>
                                {file.specialty}
                              </div>

                              <div className="absolute bottom-4 lg:bottom-8 right-4 lg:right-8 bg-black/80 backdrop-blur-xl text-[10px] lg:text-[12px] font-black px-4 lg:px-5 py-2 lg:py-2.5 rounded-2xl border flex items-center gap-2 transition-all shadow-lg" style={{ color: section.accentHex, borderColor: `${section.accentHex}22` }}>
                                <span className="material-symbols-outlined text-sm lg:text-base animate-pulse">monitoring</span>
                                {file.duration}
                              </div>
                            </div>

                            <div className="p-7 lg:p-14 relative z-10 flex flex-col flex-1 justify-between min-h-[240px] lg:min-h-[340px]">
                              <div className="space-y-4">
                                <h4 className="text-2xl lg:text-4xl font-display font-black text-white mb-3 lg:mb-4 group-hover/card:text-white transition-colors leading-tight tracking-tight overflow-hidden line-clamp-2">
                                  {file.title}
                                </h4>
                                <p className="text-sm lg:text-xl text-gray-400 line-clamp-2 leading-relaxed font-medium group-hover/card:text-white transition-colors opacity-80">{file.subtitle}</p>

                                <div className="flex flex-wrap gap-2 pt-2">
                                  {file.tags.slice(0, 3).map(tag => (
                                    <span key={tag} className="text-[9px] lg:text-[12px] font-black bg-white/5 border border-white/10 px-3 lg:px-5 py-1.5 lg:py-2 rounded-xl uppercase tracking-widest transition-all hover:bg-white/20" style={{ color: section.accentHex }}>#{tag}</span>
                                  ))}
                                </div>
                              </div>

                              <button
                                className="w-full flex items-center justify-center gap-3 lg:gap-4 font-black text-[10px] lg:text-[14px] uppercase tracking-[0.3em] transition-all py-4 lg:py-6 px-6 lg:px-8 rounded-[2rem] border-2 text-white hover:text-black group-hover/card:scale-105 shadow-2xl active:scale-95 mt-8"
                                style={{ backgroundColor: `${section.accentHex}11`, borderColor: `${section.accentHex}33` }}
                              >
                                <span>Analisar Registro</span>
                                <span className="material-symbols-outlined text-lg lg:text-2xl animate-bounce-horizontal">arrow_forward</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* --- VIEW: DETALHES (IMERSÃO CHROME) --- */
            <div className="animate-fade-in-up flex flex-col gap-10 lg:gap-24 px-4 lg:px-12">
              <header className="max-w-5xl mx-auto text-center flex flex-col items-center">
                <button
                  onClick={() => setSelectedFile(null)}
                  className="flex items-center gap-2 lg:gap-3 font-black text-[9px] lg:text-[11px] uppercase tracking-[0.3em] lg:tracking-[0.4em] mb-8 lg:mb-12 hover:translate-x-[-8px] transition-all duration-300 py-2.5 lg:py-3 px-5 lg:px-6 bg-white/5 rounded-2xl border border-white/10 shadow-lg active:scale-95"
                  style={{ color: activeTheme?.accentHex }}
                >
                  <span className="material-symbols-outlined text-base lg:text-lg">arrow_back</span>
                  Retornar ao Arquivo
                </button>

                <div className="flex items-center gap-3 lg:gap-4 mb-6 lg:mb-8 w-full justify-center">
                  <span className="text-[9px] lg:text-[11px] font-black text-black px-4 lg:px-5 py-1.5 lg:py-2 rounded-full uppercase tracking-[0.4em] lg:tracking-[0.5em] border-2 shadow-2xl backdrop-blur-3xl" style={{ backgroundColor: activeTheme?.accentHex, borderColor: `${activeTheme?.accentHex}88` }}>
                    ARCHIVE_#{selectedFile.id}
                  </span>
                  <div className="h-[2px] max-w-[200px] flex-1 bg-gradient-to-r" style={{ backgroundImage: `linear-gradient(to right, ${activeTheme?.accentHex}, transparent)` }}></div>
                </div>

                <h2 className="text-4xl lg:text-9xl font-display font-black text-white tracking-tighter leading-[0.95] lg:leading-[0.85] mb-6 lg:mb-8 drop-shadow-2xl text-center">
                  {selectedFile.title}
                </h2>

                <p className="text-xl lg:text-4xl font-semibold leading-tight italic border-l-4 lg:border-l-8 pl-6 lg:pl-10 py-3 lg:py-4 transition-all text-center" style={{ color: activeTheme?.accentHex, borderColor: `${activeTheme?.accentHex}22` }}>
                  "{selectedFile.subtitle}"
                </p>
              </header>

              <section className="relative w-full aspect-video rounded-[2.5rem] lg:rounded-[6rem] overflow-hidden border-[4px] lg:border-[8px] bg-black shadow-2xl transition-all" style={{ borderColor: `${activeTheme?.accentHex}22`, boxShadow: `0 40px 120px -20px rgba(${activeTheme?.accentRgb}, 0.2)` }}>
                <div className="absolute inset-0 bg-gradient-to-br via-transparent pointer-events-none z-10" style={{ backgroundImage: `linear-gradient(to bottom right, ${activeTheme?.accentHex}08, transparent, ${activeTheme?.accentHex}08)` }}></div>
                <div className="absolute inset-0 border-[10px] lg:border-[20px] border-black/30 pointer-events-none z-20"></div>

                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${selectedFile.videoUrl}?autoplay=0&rel=0&modestbranding=1&color=white`}
                  title={selectedFile.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full relative z-0 opacity-90 hover:opacity-100 transition-all duration-700"
                ></iframe>
              </section>

              <div className="grid lg:grid-cols-3 gap-12 lg:gap-32 pb-48">
                <div className="lg:col-span-2 flex flex-col gap-10 lg:gap-16">
                  <article
                    className="prose prose-invert prose-red max-w-none text-gray-300 text-lg lg:text-3xl leading-relaxed font-medium tracking-tight"
                    dangerouslySetInnerHTML={{ __html: selectedFile.richText }}
                    style={{ '--tw-prose-headings': activeTheme?.accentHex } as any}
                  />
                </div>
                <aside className="flex flex-col gap-8 lg:gap-12">
                  <div className="bg-[#080808] backdrop-blur-xl rounded-[3rem] lg:rounded-[4rem] p-8 lg:p-12 border-2 shadow-3xl relative overflow-hidden group/author" style={{ borderColor: `${activeTheme?.accentHex}11` }}>
                    <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[100px]" style={{ backgroundColor: `${activeTheme?.accentHex}08` }}></div>
                    <h4 className="text-[10px] lg:text-[11px] font-black uppercase tracking-[0.4em] mb-8 opacity-60" style={{ color: activeTheme?.accentHex }}>Investigador_Chefe</h4>
                    <div className="flex flex-col items-center text-center gap-6 mb-8">
                      <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYhCM8_nWUST5WsxIO9t-HyCYoRcSrlMZFKLCT8hoV37f9RdWzrCO6cqtheXkxaMfI9xpL0OIdhiWdEUKLrFu2q_AKokQM18oWk-tEOUYcwA81LZg3j7bDrJKwb0HMRxGs5CiPQGDD5EaW62enBLwkhHO6Jv4kEPMAe4XWi4M-0X6IDoDiCyk6kHHpUMBdG4bRKmf_5H88Hd8xizCwT6jVcpal_ZtxEGoEICbr3jiDQUCThSSHZlshbevmwuodSJtS9gm41hAmK1Y" className="w-28 h-28 lg:w-48 lg:h-48 rounded-[2rem] lg:rounded-[3.5rem] border-4 shadow-glow transition-all duration-700" style={{ borderColor: `${activeTheme?.accentHex}44` }} alt="Author" />
                      <p className="text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">Douglas L. Rocha</p>
                      <p className="text-[10px] lg:text-[12px] font-bold uppercase tracking-[0.3em] mt-2" style={{ color: activeTheme?.accentHex }}>CEO Adicionares Global Inc.</p>
                    </div>
                    <button className="w-full py-5 text-black font-black uppercase text-[10px] tracking-[0.4em] rounded-[1.5rem] transition-all hover:scale-[1.05] shadow-2xl" style={{ backgroundColor: activeTheme?.accentHex, borderColor: activeTheme?.accentHex }}>
                      Bio_Interface
                    </button>
                  </div>
                </aside>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* BOTÃO FLUTUANTE DE TEMA (MODOS DARK/WHITE) */}
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className={`fixed bottom-8 right-8 z-[200] w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95 group ${isDarkMode ? 'bg-white/10 text-yellow-400 border-white/20' : 'bg-black/80 text-blue-400 border-black/10'} border backdrop-blur-xl`}
      >
        <span className="material-symbols-outlined text-3xl transition-transform duration-700 group-hover:rotate-[360deg]">
          {isDarkMode ? 'light_mode' : 'dark_mode'}
        </span>
        {/* Glow de Efeito */}
        <div className={`absolute inset-0 rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity ${isDarkMode ? 'bg-yellow-400' : 'bg-blue-400'}`}></div>
      </button>

      <style>{`
        @keyframes bounce-horizontal {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(5px); }
        }
        .animate-bounce-horizontal {
            animation: bounce-horizontal 2s ease-in-out infinite;
        }
        .perspective-1000 {
            perspective: 2000px;
        }
        
        .mask-ultra-smooth {
            mask-image: linear-gradient(to bottom, 
                transparent 0%, 
                black 20%, 
                black 80%, 
                transparent 100%
            );
            -webkit-mask-image: linear-gradient(to bottom, 
                transparent 0%, 
                black 20%, 
                black 80%, 
                transparent 100%
            );
        }

        .prose h3 { 
            color: var(--tw-prose-headings); 
            font-weight: 900; 
            font-size: 2.2rem; 
            margin-top: 2.5rem; 
            margin-bottom: 1.5rem; 
            letter-spacing: -0.05em;
            text-shadow: 0 0 20px rgba(255, 255, 255, 0.05);
        }
        @media (min-width: 1024px) {
            .prose h3 { 
                font-size: 4rem; 
                margin-top: 4rem; 
                margin-bottom: 2rem; 
            }
        }
        .prose p {
            margin-bottom: 1.5rem;
            line-height: 1.7;
            font-size: 1.1rem;
            color: #A0A0A0;
            opacity: 0.9;
        }
        @media (min-width: 1024px) {
            .prose p {
                margin-bottom: 2.5rem;
                font-size: 1.8rem;
            }
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .shadow-glass {
          box-shadow: 0 12px 48px 0 rgba(0, 0, 0, 0.6);
        }
        .drop-shadow-2xl {
          filter: drop-shadow(0 0 30px rgba(0, 0, 0, 0.8));
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;  
          overflow: hidden;
        }
        @keyframes textShimmer { 
            0% { background-position: -200% center; } 
            100% { background-position: 200% center; } 
        }
        .animate-text-shimmer { 
            background-size: 200% auto; 
            animation: textShimmer 8s linear infinite; 
        }
      `}</style>
    </div>
  );
};

export default HolotecaScreen;
