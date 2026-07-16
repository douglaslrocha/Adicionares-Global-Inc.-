
import React, { useState, useEffect } from 'react';
import { useGlobalContext } from '../context/AdicionaresContext';

interface CinemaScreenProps {
   onNavigate?: (screen: 'welcome' | 'feed' | 'holoteca' | 'cinema') => void;
}

const CinemaScreen: React.FC<CinemaScreenProps> = ({ onNavigate }) => {
   const { cinemaBlocks } = useGlobalContext();
   const [completedTasks, setCompletedTasks] = useState<number[]>([0]);
   const [challengeLevel, setChallengeLevel] = useState<number | null>(null);

   // Lógica de Tema Independente
   const [isLocalDark, setIsLocalDark] = useState(false);

   useEffect(() => {
      const html = document.documentElement;
      const wasGlobalDark = html.classList.contains('dark');
      html.classList.remove('dark');

      return () => {
         if (wasGlobalDark) html.classList.add('dark');
      };
   }, []);

   // --- DERIVE DATA FROM GLOBAL CONTEXT BLOCKS ---
   const headerBlock = cinemaBlocks.find(b => b.type === 'header');
   const defBlock = cinemaBlocks.find(b => b.type === 'definition');
   const videoBlock = cinemaBlocks.find(b => b.type === 'video');
   const axesBlock = cinemaBlocks.find(b => b.type === 'reflection_axes');
   const fatuologiaBlock = cinemaBlocks.find(b => b.type === 'fatulogia_dual');
   const textBlock = cinemaBlocks.find(b => b.type === 'text_section');
   const confrontologyBlock = cinemaBlocks.find(b => b.type === 'confrontology');
   const detalhologiaBlock = cinemaBlocks.find(b => b.type === 'detalhologia');
   const argumentologyBlock = cinemaBlocks.find(b => b.type === 'argumentology');
   const challengeBlock = cinemaBlocks.find(b => b.type === 'challenge');

   const verbete = {
      id: headerBlock?.content?.id || "VER-???",
      especialidade: headerBlock?.content?.specialty || "GERAL",
      titulo: headerBlock?.content?.title || "TÍTULO INDEFINIDO",
      definicao: defBlock?.content as string || "Definição pendente...",
      date: headerBlock?.content?.date || "Data desconhecida",
      duration: (videoBlock?.content as any)?.duration || "00min",

      reflectionAxes: (axesBlock?.content as any[]) || [],

      fatuologia: (fatuologiaBlock?.content as any)?.fatuologia || [],
      parafatuologia: (fatuologiaBlock?.content as any)?.parafatuologia || []
   };

   const challenges = (challengeBlock?.content as any[]) || [];

   // Helper properties for direct access in JSX
   const redacao = textBlock?.content as any || { headline: '', text: '', image: '', axiom: '' };
   const confrontologia = confrontologyBlock?.content as any || { orto: { title: '', desc: '', items: [], result: '' }, pato: { title: '', desc: '', items: [], result: '' } };
   const detalhologia = detalhologiaBlock?.content as any || { intro: '', factors: [], image: '', docLabel: '' };
   const argumentologia = argumentologyBlock?.content as any || { text: '', quote: '' };

   return (
      <div className={isLocalDark ? 'dark' : ''}>
         <div className="min-h-screen w-full bg-[#fcfcfc] dark:bg-[#050505] text-gray-900 dark:text-white font-body selection:bg-blue-600 selection:text-white pb-40 overflow-x-hidden transition-colors duration-500">

            {/* NAVBAR VERBETOGRÁFICA */}
            <nav className="fixed top-0 left-0 w-full z-[110] px-4 py-4 lg:py-6 flex justify-center pointer-events-none">
               <div className="w-full max-w-[1400px] h-16 lg:h-20 bg-white/90 dark:bg-[#0A0A0A]/90 backdrop-blur-2xl border border-gray-200 dark:border-white/10 px-4 lg:px-8 rounded-2xl lg:rounded-[2.5rem] flex items-center justify-between shadow-glass pointer-events-auto transition-all">
                  <div className="flex items-center gap-3 lg:gap-6">
                     <button
                        onClick={() => onNavigate && onNavigate('holoteca')}
                        className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-onyx dark:bg-white flex items-center justify-center text-white dark:text-onyx hover:scale-105 active:scale-95 transition-all shadow-lg"
                     >
                        <span className="material-symbols-outlined text-lg lg:text-xl">arrow_back</span>
                     </button>
                     <div className="h-6 lg:h-8 w-[1px] bg-gray-200 dark:bg-white/10"></div>
                     <div className="flex flex-col">
                        <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Estrutura_Verbetográfica</span>
                        <span className="text-xs lg:text-sm font-bold tracking-tight">{verbete.especialidade} // {verbete.id}</span>
                     </div>
                  </div>

                  <div className="flex items-center gap-3 lg:gap-5">
                     <div className="hidden sm:flex flex-col items-end">
                        <span className="text-[8px] lg:text-[10px] font-black text-blue-600 uppercase tracking-widest animate-pulse">Sincronia Live</span>
                        <span className="text-[10px] lg:text-xs font-bold opacity-60 italic text-gray-500 dark:text-gray-400">Pesquisa em Curso</span>
                     </div>

                     {/* BOTÃO DE TEMA INDEPENDENTE (CINEMA) */}
                     <button
                        onClick={() => setIsLocalDark(!isLocalDark)}
                        className="w-9 h-9 lg:w-11 lg:h-11 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-white/10 transition-all shadow-sm"
                        title="Alternar tema da página Cinema"
                     >
                        <span className="material-symbols-outlined text-lg lg:text-xl">
                           {isLocalDark ? 'light_mode' : 'dark_mode'}
                        </span>
                     </button>

                     <div className="w-9 h-9 lg:w-11 lg:h-11 rounded-full border-2 border-blue-600 p-0.5 shadow-glow-blue overflow-hidden">
                        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYhCM8_nWUST5WsxIO9t-HyCYoRcSrlMZFKLCT8hoV37f9RdWzrCO6cqtheXkxaMfI9xpL0OIdhiWdEUKLrFu2q_AKokQM18oWk-tEOUYcwA81LZg3j7bDrJKwb0HMRxGs5CiPQGDD5EaW62enBLwkhHO6Jv4kEPMAe4XWi4M-0X6IDoDiCyk6kHHpUMBdG4bRKmf_5H88Hd8xizCwT6jVcpal_ZtxEGoEICbr3jiDQUCThSSHZlshbevmwuodSJtS9gm41hAmK1Y" className="w-full h-full object-cover" alt="User" />
                     </div>
                  </div>
               </div>
            </nav>

            <main className="pt-24 lg:pt-40 px-4 md:px-8 lg:px-12 w-full max-w-[1400px] mx-auto space-y-12 lg:space-y-24">

               {/* I. TÍTULO & DEFINIÇÃO */}
               <header className="flex flex-col lg:flex-row items-start justify-between gap-8 animate-fade-in">
                  <div className="flex-1 space-y-4 lg:space-y-6">
                     <div className="flex items-center gap-4">
                        <span className="px-3 py-1 bg-blue-600 text-white text-[8px] lg:text-[10px] font-black uppercase tracking-[0.4em] rounded-full shadow-glow-blue">VERBETE_NÚCLEO</span>
                        <div className="h-px w-12 lg:w-20 bg-gray-200 dark:bg-white/10"></div>
                        <span className="text-[9px] lg:text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">{verbete.date}</span>
                     </div>
                     <h1 className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-display font-black leading-[0.9] text-onyx dark:text-white uppercase italic tracking-tighter">
                        {verbete.titulo}
                     </h1>
                  </div>
                  <div className="w-full lg:max-w-2xl p-6 lg:p-10 bg-white dark:bg-white/5 rounded-[2rem] lg:rounded-[2.5rem] border border-gray-100 dark:border-white/10 shadow-sm relative overflow-hidden group">
                     <span className="absolute top-0 left-8 px-4 py-1 bg-onyx dark:bg-white text-white dark:text-onyx text-[9px] font-black uppercase tracking-widest rounded-b-lg">Definologia</span>
                     <p className="text-lg lg:text-2xl xl:text-3xl font-medium text-gray-600 dark:text-gray-300 italic leading-snug mt-4">
                        "{verbete.definicao}"
                     </p>
                  </div>
               </header>

               {/* II. VÍDEO-EXPOSIÇÃO */}
               <section className="relative w-full rounded-[2rem] lg:rounded-[3rem] overflow-hidden shadow-glass border-2 lg:border-[6px] border-white dark:border-white/5 bg-black animate-fade-in-up delay-100 group">
                  <div className="aspect-video relative z-0">
                     <iframe
                        width="100%"
                        height="100%"
                        src="https://www.youtube.com/embed/j0Xk73QySuc?modestbranding=1&rel=0&color=white"
                        title="Exposição Técnica"
                        frameBorder="0"
                        allowFullScreen
                        className="w-full h-full opacity-90 group-hover:opacity-100 transition-opacity duration-700"
                     ></iframe>
                  </div>
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 left-4 lg:bottom-8 lg:left-8 z-10 flex items-center gap-3 px-4 lg:px-6 py-2 bg-white/10 backdrop-blur-3xl rounded-full border border-white/20">
                     <span className="material-symbols-outlined text-white text-sm lg:text-base animate-spin-slow">history_edu</span>
                     <span className="text-[9px] lg:text-[10px] font-black text-white uppercase tracking-[0.4em]">{verbete.duration} // DEFESA_TESE</span>
                  </div>
               </section>

               {/* III. EIXOS DE AUTOPESQUISA (VETORES DE SÍNTESE) */}
               <section className="animate-fade-in-up delay-150 space-y-8 lg:space-y-12">
                  <div className="flex flex-col gap-4 text-center lg:text-left">
                     <div className="flex items-center gap-4 justify-center lg:justify-start">
                        <div className="w-10 h-[2px] bg-blue-600"></div>
                        <h2 className="text-[10px] lg:text-[12px] font-black text-blue-600 uppercase tracking-[0.6em]">Vetores de Síntese Conscienciométrica</h2>
                     </div>
                     <p className="text-2xl lg:text-4xl font-display font-black text-onyx dark:text-white uppercase italic tracking-tighter">Fundamentos da Pesquisa</p>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
                     {verbete.reflectionAxes.map((axis, i) => (
                        <div key={i} className="bg-white dark:bg-white/5 p-6 lg:p-10 rounded-[2rem] lg:rounded-[3rem] border border-gray-100 dark:border-white/10 flex flex-col items-center text-center gap-5 shadow-sm group hover:bg-gray-50 dark:hover:bg-white/10 transition-all duration-300 cursor-pointer relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                              <span className="material-symbols-outlined text-6xl lg:text-8xl">{axis.icon}</span>
                           </div>
                           <div className="w-14 h-14 lg:w-20 lg:h-20 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center border border-gray-100 dark:border-white/10 shadow-inner group-hover:scale-110 group-hover:shadow-glow-blue transition-all relative z-10">
                              <span className={`material-symbols-outlined text-3xl lg:text-4xl ${axis.color}`}>{axis.icon}</span>
                           </div>
                           <div className="relative z-10">
                              <p className={`text-[10px] lg:text-xs font-black uppercase tracking-[0.3em] ${axis.color} mb-2`}>{axis.label}</p>
                              <p className="text-[9px] lg:text-[12px] font-bold text-gray-500 dark:text-gray-400 leading-tight uppercase tracking-widest">{axis.detail}</p>
                           </div>
                           <div className="mt-2 px-3 py-1 bg-blue-600/5 dark:bg-white/5 rounded-full border border-blue-600/10 dark:border-white/10 group-hover:bg-blue-600 group-hover:text-white transition-all">
                              <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest">Prioridade_Alfa</span>
                           </div>
                        </div>
                     ))}
                  </div>
               </section>

               {/* IV. REDAÇÃO CONSCIENCIOLÓGICA */}
               <section className="animate-fade-in-up delay-200 w-full overflow-hidden">
                  <div className="bg-white dark:bg-[#080808] rounded-[1.5rem] lg:rounded-[4rem] p-6 lg:p-20 xl:p-24 border border-gray-100 dark:border-white/10 shadow-glass relative overflow-hidden group">

                     <div className="w-full max-w-[1200px] mx-auto space-y-12 lg:space-y-20">

                        {/* Cabeçalho da Redação */}
                        <div className="text-left space-y-4 lg:space-y-6 border-b-2 border-gray-100 dark:border-white/10 pb-10 lg:pb-12">
                           <div className="flex items-center gap-4">
                              <span className="px-4 py-1 bg-onyx dark:bg-white text-white dark:text-onyx text-[9px] lg:text-[10px] font-black uppercase tracking-[0.4em] rounded-full">REDAÇÃO_TÉCNICA</span>
                              <div className="h-px flex-1 bg-gray-100 dark:bg-white/10"></div>
                           </div>
                           <h2 className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-display font-black uppercase italic tracking-tighter leading-[0.85] text-onyx dark:text-white">
                              {redacao.headline}
                           </h2>
                        </div>

                        {/* Corpo do Texto */}
                        <div className="text-slate-800 dark:text-slate-200 leading-[1.7] lg:leading-[1.8] text-justify font-serif text-lg lg:text-xl xl:text-2xl tracking-tight w-full mx-auto space-y-10 lg:space-y-16">

                           <div dangerouslySetInnerHTML={{ __html: redacao.text }} />

                           {/* Imagens */}
                           <div className="space-y-10 lg:space-y-16 my-10 lg:my-16">
                              <div className="group/img relative w-full h-[300px] lg:h-[600px] xl:h-[700px] rounded-[1.5rem] lg:rounded-[3rem] overflow-hidden border-2 border-white dark:border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]">
                                 <img src={redacao.image} className="w-full h-full object-cover transition-all duration-[2s] group-hover/img:scale-105" alt="Pesquisa" />
                                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                                 <div className="absolute bottom-6 left-6 lg:bottom-10 lg:left-10 px-5 py-2 bg-white/95 dark:bg-black/90 backdrop-blur-xl rounded-xl text-[9px] lg:text-[11px] font-black text-onyx dark:text-white uppercase tracking-[0.4em] border border-blue-600/20 shadow-xl">{redacao.imageLabel}</div>
                              </div>
                           </div>

                           {/* Box de Teorema Evolutivo */}
                           <div className="p-10 lg:p-24 bg-onyx text-white dark:bg-white dark:text-onyx rounded-[2rem] lg:rounded-[3.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] my-12 group hover:scale-[1.01] transition-all duration-700 relative overflow-hidden text-center">
                              <div className="absolute top-0 right-0 p-6 opacity-10">
                                 <span className="material-symbols-outlined text-[10rem] lg:text-[12rem] rotate-12">history_edu</span>
                              </div>
                              <span className="text-blue-600 font-black text-[9px] lg:text-[11px] uppercase tracking-[0.8em] mb-6 lg:mb-8 block">Axioma_Universal_Sênior</span>
                              <p className="text-xl lg:text-4xl xl:text-5xl font-black leading-snug lg:leading-tight italic tracking-tighter">
                                 "{redacao.axiom}"
                              </p>
                           </div>

                        </div>
                     </div>
                  </div>
               </section>

               {/* V. CONFRONTOLOGIA */}
               <section className="animate-fade-in-up delay-[250ms] space-y-10 lg:space-y-16">
                  <div className="flex flex-col lg:flex-row items-center gap-6">
                     <h2 className="text-3xl lg:text-5xl font-display font-black uppercase italic tracking-tighter">Confrontologia Técnica</h2>
                     <div className="flex-1 h-px bg-gray-200 dark:bg-white/10"></div>
                     <span className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-blue-600/10">Análise_de_Contrastes</span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
                     <div className="bg-white dark:bg-[#0A0A0A] p-8 lg:p-16 rounded-[3rem] border-t-[12px] border-green-500 shadow-2xl relative group overflow-hidden flex flex-col gap-6">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                           <span className="material-symbols-outlined text-[12rem]">eco</span>
                        </div>
                        <h3 className="text-2xl lg:text-4xl font-black text-green-600 uppercase tracking-tighter flex items-center gap-4">
                           <span className="w-12 h-12 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center text-xl font-black shadow-inner">01</span>
                           {confrontologia.orto.title}
                        </h3>
                        <p className="text-lg lg:text-2xl font-bold text-gray-700 dark:text-white leading-relaxed italic">
                           "{confrontologia.orto.desc}"
                        </p>
                        <div className="space-y-4">
                           <h4 className="text-[10px] font-black uppercase tracking-widest text-green-600/60">Atitudes Recomendadas (O Bem Evolutivo):</h4>
                           <ul className="space-y-3">
                              {confrontologia.orto.items.map((item: string, i: number) => (
                                 <li key={i} className="flex items-center gap-3 text-sm lg:text-lg font-medium text-gray-500 dark:text-gray-400">
                                    <span className="material-symbols-outlined text-green-500 text-base">check_circle</span>
                                    {item}
                                 </li>
                              ))}
                           </ul>
                        </div>
                        <div className="mt-4 p-4 bg-green-50 dark:bg-green-500/5 rounded-2xl border border-green-200 dark:border-green-500/20">
                           <p className="text-xs lg:text-sm font-bold text-green-700 dark:text-green-400 uppercase tracking-tight">Resultado: {confrontologia.orto.result}</p>
                        </div>
                     </div>

                     <div className="bg-white dark:bg-[#0A0A0A] p-8 lg:p-16 rounded-[3rem] border-t-[12px] border-red-500 shadow-2xl relative group overflow-hidden flex flex-col gap-6">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                           <span className="material-symbols-outlined text-[12rem]">warning</span>
                        </div>
                        <h3 className="text-2xl lg:text-4xl font-black text-red-600 uppercase tracking-tighter flex items-center gap-4">
                           <span className="w-12 h-12 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center text-xl font-black shadow-inner">02</span>
                           {confrontologia.pato.title}
                        </h3>
                        <p className="text-lg lg:text-2xl font-bold text-gray-700 dark:text-white leading-relaxed italic">
                           "{confrontologia.pato.desc}"
                        </p>
                        <div className="space-y-4">
                           <h4 className="text-[10px] font-black uppercase tracking-widest text-red-600/60">Comportamentos de Risco (O Mal Evolutivo):</h4>
                           <ul className="space-y-3">
                              {confrontologia.pato.items.map((item: string, i: number) => (
                                 <li key={i} className="flex items-center gap-3 text-sm lg:text-lg font-medium text-gray-500 dark:text-gray-400">
                                    <span className="material-symbols-outlined text-red-500 text-base">cancel</span>
                                    {item}
                                 </li>
                              ))}
                           </ul>
                        </div>
                        <div className="mt-4 p-4 bg-red-50 dark:bg-red-500/5 rounded-2xl border border-red-200 dark:border-red-500/20">
                           <p className="text-xs lg:text-sm font-bold text-red-700 dark:text-red-400 uppercase tracking-tight">Perigo: {confrontologia.pato.result}</p>
                        </div>
                     </div>
                  </div>
               </section>
               {/* VI. DETALHOLOGIA - MOBILE REFINED */}
               <section className="animate-fade-in-up delay-300 w-full">
                  <div className="bg-white dark:bg-white/5 rounded-[2rem] lg:rounded-[5rem] px-5 py-8 md:p-12 lg:p-24 border border-gray-100 dark:border-white/10 shadow-glass relative overflow-hidden flex flex-col lg:flex-row gap-10 lg:gap-32 items-center">
                     <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-purple-600 to-transparent"></div>

                     <div className="flex-1 space-y-8 lg:space-y-16">
                        <div className="space-y-3 lg:space-y-4">
                           <h3 className="text-3xl md:text-5xl lg:text-7xl font-display font-black uppercase tracking-tight lg:tracking-tighter leading-[1.1] lg:leading-tight">Detalhologia Técnica</h3>
                           <p className="text-[9px] lg:text-[12px] font-black text-blue-600 uppercase tracking-[0.6em]">Módulo_Avançado_de_Pesquisa</p>
                        </div>
                        <div className="space-y-6 lg:space-y-10">
                           <p className="text-lg md:text-2xl lg:text-4xl font-serif text-gray-700 dark:text-gray-300 font-medium leading-[1.4] lg:leading-relaxed italic">
                              {detalhologia.intro}
                           </p>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                              {detalhologia.factors.map((factor: any, i: number) => (
                                 <div key={i} className={`p-5 lg:p-8 bg-gray-50 dark:bg-white/5 rounded-2xl lg:rounded-3xl border-l-4 shadow-sm transition-all hover:bg-white dark:hover:bg-white/10 ${i === 0 ? 'border-blue-600' : 'border-purple-600'}`}>
                                    <h5 className="font-black uppercase text-[10px] lg:text-xs mb-2 opacity-60 tracking-widest">{factor.title}</h5>
                                    <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 font-medium">{factor.desc}</p>
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>

                     <div className="w-full lg:w-[450px] shrink-0 mt-8 lg:mt-0">
                        <div className="aspect-video lg:aspect-[3/4] rounded-[2rem] lg:rounded-[3rem] overflow-hidden border-4 border-white dark:border-white/10 shadow-2xl relative group">
                           <img src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80" className="w-full h-full object-cover transition-all duration-[2s] group-hover:scale-110" alt="Referência" />
                           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                           <div className="absolute bottom-0 left-0 w-full p-6 lg:p-8 text-center">
                              <p className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-white/40 mb-1 lg:mb-2">MAP_REF_092</p>
                              <p className="text-sm lg:text-lg font-bold text-white uppercase tracking-tighter">Doc_01: Sincronia de Campo</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </section>
               {/* VII. FATUOLOGIA VS PARAFATUOLOGIA */}
               <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 animate-fade-in-up delay-400">
                  <div className="bg-white dark:bg-[#0A0A0A] rounded-[3.5rem] p-10 lg:p-16 border border-gray-100 dark:border-white/10 shadow-2xl space-y-12">
                     <div className="flex items-center gap-6">
                        <div className="w-14 h-14 lg:w-20 lg:h-20 rounded-2xl bg-onyx text-white flex items-center justify-center shadow-2xl shrink-0">
                           <span className="material-symbols-outlined text-3xl lg:text-4xl">menu_book</span>
                        </div>
                        <div>
                           <h3 className="text-2xl lg:text-4xl font-display font-black uppercase tracking-tighter leading-none">Fatuologia</h3>
                           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Fatos da Realidade Intrafísica</p>
                        </div>
                     </div>
                     <div className="space-y-4">
                        {verbete.fatuologia.map((f, i) => (
                           <div key={i} className={`p-6 rounded-3xl border-2 transition-all flex items-start gap-4 ${f.status === 'bad' ? 'bg-red-50/30 dark:bg-red-500/5 border-red-500/10 hover:border-red-500/30' : 'bg-green-50/30 dark:bg-green-500/5 border-green-500/10 hover:border-green-500/30'}`}>
                              <span className={`material-symbols-outlined mt-1 ${f.status === 'bad' ? 'text-red-500' : 'text-green-500'}`}>
                                 {f.status === 'bad' ? 'error_outline' : 'check_circle_outline'}
                              </span>
                              <div>
                                 <p className="text-base lg:text-xl font-black uppercase tracking-tight text-onyx dark:text-white leading-tight mb-1">{f.item}</p>
                                 <span className="text-[10px] lg:text-xs font-medium opacity-60 italic">{f.desc}</span>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="bg-white dark:bg-[#0A0A0A] rounded-[3.5rem] p-10 lg:p-16 border border-gray-100 dark:border-white/10 shadow-2xl space-y-12">
                     <div className="flex items-center gap-6">
                        <div className="w-14 h-14 lg:w-20 lg:h-20 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-glow-blue shrink-0">
                           <span className="material-symbols-outlined text-3xl lg:text-4xl">visibility</span>
                        </div>
                        <div>
                           <h3 className="text-2xl lg:text-4xl font-display font-black uppercase tracking-tighter leading-none">Parafatuologia</h3>
                           <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">Fatos da Realidade Extrafísica</p>
                        </div>
                     </div>
                     <div className="space-y-4">
                        {verbete.parafatuologia.map((pf, i) => (
                           <div key={i} className="p-6 bg-blue-50/30 dark:bg-blue-500/5 border-2 border-blue-500/10 rounded-3xl hover:border-blue-500/30 transition-all flex items-start gap-4">
                              <span className="material-symbols-outlined text-blue-500 mt-1">auto_awesome</span>
                              <div>
                                 <p className="text-base lg:text-xl font-black uppercase tracking-tight text-onyx dark:text-white leading-tight mb-1">{pf.item}</p>
                                 <span className="text-[10px] lg:text-xs font-bold text-blue-600/60 uppercase tracking-widest">{pf.desc}</span>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </section>

               {/* VIII. ARGUMENTOLOGIA */}
               <section className="animate-fade-in-up delay-[450ms] max-w-5xl mx-auto space-y-12" >
                  <div className="flex flex-col gap-10">
                     <div className="flex items-center gap-8">
                        <h2 className="text-4xl lg:text-7xl font-display font-black uppercase italic tracking-tighter">Argumentologia</h2>
                        <div className="flex-1 h-px bg-gray-200 dark:bg-white/10"></div>
                     </div>
                     <div className="text-xl lg:text-3xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed text-justify space-y-12 font-serif">
                        <p>{argumentologia.text}</p>
                        <div className="p-12 lg:p-24 bg-onyx text-white dark:bg-white/5 rounded-[3rem] lg:rounded-[4rem] border border-gray-200 dark:border-white/10 shadow-inner text-center relative overflow-hidden group">
                           <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                           <p className="italic font-bold leading-tight text-3xl lg:text-5xl tracking-tighter font-display">"{argumentologia.quote}"</p>
                        </div>
                     </div>
                  </div>
               </section>

               {/* IX. LABORATÓRIO DE CONFRONTO DE REALIDADE */}
               <section className="animate-fade-in-up delay-[500ms] py-24 lg:py-48 px-4 lg:px-24 bg-[#0A0A0A] rounded-[3rem] lg:rounded-[6rem] border-2 border-white/5 shadow-glass relative overflow-hidden group/lab">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(37,99,235,0.15),transparent_70%)] opacity-50"></div>
                  <div className="absolute top-0 right-0 p-12 opacity-5">
                     <span className="material-symbols-outlined text-[20rem] rotate-12">psychology_alt</span>
                  </div>

                  <div className="relative z-10 max-w-6xl mx-auto text-center space-y-16">
                     <div className="space-y-6">
                        <span className="px-6 py-2 bg-blue-600 text-white text-[10px] lg:text-[12px] font-black uppercase tracking-[0.8em] rounded-full shadow-glow-blue">Módulo_Interativo</span>
                        <h2 className="text-4xl lg:text-8xl font-display font-black text-white uppercase italic tracking-tighter leading-none">Laboratório de <br /> Confronto de Realidade</h2>
                        <p className="text-gray-400 text-lg lg:text-2xl font-medium max-w-3xl mx-auto italic">
                           "Onde você se situa hoje na escala de autonomia? Seja técnico consigo mesmo para obter resultados de autopesquisa."
                        </p>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {challenges.map((item, idx) => (
                           <div
                              key={idx}
                              onClick={() => setChallengeLevel(item.level)}
                              className={`group/item relative p-8 lg:p-12 rounded-[2.5rem] border-2 transition-all duration-500 cursor-pointer overflow-hidden ${challengeLevel === item.level ? 'bg-white border-white scale-105 shadow-[0_30px_60px_-10px_rgba(255,255,255,0.2)]' : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'}`}
                           >
                              <div className={`w-12 h-12 lg:w-16 lg:h-16 rounded-full flex items-center justify-center mb-6 border transition-all ${challengeLevel === item.level ? 'bg-onyx text-white border-onyx' : 'bg-white/5 text-gray-400 border-white/10 group-hover/item:scale-110'}`}>
                                 <span className="font-black text-xl lg:text-2xl">{item.level}</span>
                              </div>
                              <h4 className={`text-xl lg:text-2xl font-black uppercase tracking-tight mb-4 ${challengeLevel === item.level ? 'text-onyx' : 'text-white'}`}>
                                 {item.title}
                              </h4>
                              <p className={`text-xs lg:text-sm font-medium leading-relaxed italic ${challengeLevel === item.level ? 'text-gray-600' : 'text-gray-500'}`}>
                                 {item.desc}
                              </p>
                              <div className={`absolute top-0 right-0 w-2 h-full ${item.color} opacity-0 group-hover/item:opacity-100 transition-opacity`}></div>
                           </div>
                        ))}
                     </div>

                     <div className={`transition-all duration-1000 overflow-hidden ${challengeLevel ? 'max-h-[800px] opacity-100 mt-20' : 'max-h-0 opacity-0'}`}>
                        <div className="bg-white/5 border-2 border-white/10 p-12 lg:p-24 rounded-[3rem] lg:rounded-[5rem] relative group/result">
                           <div className="flex flex-col items-center gap-8">
                              <span className="material-symbols-outlined text-blue-500 text-6xl lg:text-[8rem] animate-pulse">prescriptions</span>
                              <div className="space-y-4">
                                 <h5 className="text-blue-500 font-black text-xs lg:text-sm uppercase tracking-[0.8em]">Para-Prescrição Transformadora</h5>
                                 <p className="text-2xl lg:text-6xl font-black text-white italic tracking-tighter leading-tight">
                                    "{challengeLevel ? challenges.find(c => c.level === challengeLevel)?.action : ''}"
                                 </p>
                              </div>
                              <button
                                 className="mt-8 px-12 py-6 bg-blue-600 text-white font-black text-[10px] lg:text-[14px] uppercase tracking-[0.6em] rounded-full hover:scale-110 active:scale-95 transition-all shadow-glow-blue flex items-center gap-4"
                                 onClick={() => alert("Compromisso assumido com sua própria evolução. Registre os resultados na seção de Redação!")}
                              >
                                 Assumir Compromisso Técnico
                                 <span className="material-symbols-outlined">edit_square</span>
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>
               </section>

            </main>

            <div className="fixed bottom-0 left-0 w-full z-[120] pointer-events-none pb-6 px-4 flex justify-center">
               <div className="w-full max-w-[800px] bg-white/95 dark:bg-onyx/95 backdrop-blur-3xl p-3 lg:p-4 rounded-[2rem] lg:rounded-[2.5rem] border border-gray-200 dark:border-white/10 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.3)] flex items-center justify-between gap-4 pointer-events-auto transition-all animate-fade-in-up">
                  <div className="flex items-center gap-2 pl-2 lg:pl-4">
                     <button className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 hover:bg-onyx hover:text-white transition-all">
                        <span className="material-symbols-outlined text-xl">edit_note</span>
                     </button>
                  </div>
                  <button className="flex-1 h-12 lg:h-14 bg-blue-600 text-white rounded-[1.2rem] lg:rounded-[1.5rem] font-black text-[9px] lg:text-xs uppercase tracking-[0.3em] lg:tracking-[0.4em] shadow-glow-blue flex items-center justify-center gap-2 lg:gap-4 group hover:scale-[1.02] active:scale-95 transition-all">
                     Fazer Autopesquisa
                     <span className="material-symbols-outlined text-lg lg:text-xl group-hover:translate-x-2 transition-transform">auto_awesome</span>
                  </button>
                  <button className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-onyx dark:bg-white flex items-center justify-center text-white dark:text-onyx shadow-xl mr-2 lg:mr-4">
                     <span className="material-symbols-outlined text-xl">share</span>
                  </button>
               </div>
            </div>

            <style>{`
        .font-display { font-family: 'Clash Display', sans-serif; }
        .font-serif { font-family: 'Playfair Display', serif; }
        .shadow-glow-blue { box-shadow: 0 0 40px rgba(37, 99, 235, 0.3); }
        .animate-spin-slow { animation: spin 25s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .shadow-glass { box-shadow: 0 40px 80px -20px rgba(0,0,0,0.35); }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
         </div>
      </div>
   );
};

export default CinemaScreen;
