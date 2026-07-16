import React, { useState } from 'react';
import { UserProfile } from '../App';

interface PublicProfileScreenProps {
    onNavigate?: (screen: any) => void;
    isDarkMode?: boolean;
    toggleTheme?: () => void;
    profile: UserProfile;
}

const PublicProfileScreen: React.FC<PublicProfileScreenProps> = ({ onNavigate, isDarkMode, toggleTheme, profile }) => {
    const [isEditMode, setIsEditMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingElement, setEditingElement] = useState<{ id: string; type: string; data: any } | null>(null);
    const [hubData, setHubData] = useState({
        hero: {
            title: profile.conscienciologicalName || profile.name,
            subtitle: `${profile.energeticStyle} Researcher | Cognópolis`,
            badge: "Elite Creator",
            avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDYhCM8_nWUST5WsxIO9t-HyCYoRcSrlMZFKLCT8hoV37f9RdWzrCO6cqtheXkxaMfI9xpL0OIdhiWdEUKLrFu2q_AKokQM18oWk-tEOUYcwA81LZg3j7bDrJKwb0HMRxGs5CiPQGDD5EaW62enBLwkhHO6Jv4kEPMAe4XWi4M-0X6IDoDiCyk6kHHpUMBdG4bRKmf_5H88Hd8xizCwT6jVcpal_ZtxEGoEICbr3jiDQUCThSSHZlshbevmwuodSJtS9gm41hAmK1Y",
            stats: [
                { label: 'Impacto Real', value: '34.9K', icon: 'diversity_4' },
                { label: 'Sincronia', value: '98%', icon: 'hub' },
                { label: 'Registros', value: '1.2k', icon: 'history_edu' }
            ]
        },
        manifesto: {
            quote: "A evolução é o descarte consciente da mediocridade.",
            content: profile.bio
        },
        showcase: [
            { id: 's1', title: 'Tratado de Holossomática', type: 'TRATADO', price: 'R$ 97', img: 'https://images.unsplash.com/photo-1532187875605-1838d737003f?w=600' },
            { id: 's2', title: 'Mentoria Paraperceptiva', type: 'CURSO', price: 'Sob Consulta', img: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600' },
            { id: 's3', title: 'Técnicas de Desperticidade', type: 'WORKSHOP', price: 'R$ 49', img: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600' }
        ],
        vault: [
            { id: 'v1', title: 'Protocolo_EV.pdf', icon: 'picture_as_pdf' },
            { id: 'v2', title: 'Mapa_Cerebral.png', icon: 'image' },
            { id: 'v3', title: 'Audio_Sinc.mp3', icon: 'audio_file' },
            { id: 'v4', title: 'Apresentacao.pdf', icon: 'description' }
        ],
        cta: {
            title: "Comece sua Próxima Grande Evolução.",
            description: "Adicione-se à rede de pesquisadores que estão redefinindo os limites do parapsiquismo e da autopesquisa."
        }
    });

    const neonColor = profile.colors.primary;

    // ─── HELPER: EDITABLE WRAPPER ─────────────────────────────────────────────
    const Editable = ({ children, id, type, data, className = "" }: any) => (
        <div className={`relative group/edit ${className}`}>
            {isEditMode && (
                <>
                    <div className="absolute inset-[-4px] rounded-xl border-2 border-brand-primary animate-pulse pointer-events-none z-[60] opacity-50 shadow-[0_0_15px_rgba(var(--brand-primary-rgb),0.5)]"></div>
                    <div className="absolute -top-3 -right-3 flex gap-2 z-[70]">
                        <button
                            onClick={() => setEditingElement({ id, type, data })}
                            className="w-8 h-8 rounded-full bg-brand-primary text-black flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all"
                        >
                            <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                    </div>
                </>
            )}
            {children}
        </div>
    );

    const updateHubData = (path: string, value: any) => {
        const newData = { ...hubData };
        const keys = path.split('.');
        let current: any = newData;
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        setHubData(newData);
    };


    return (
        <div
            className={`min-h-screen w-full transition-all duration-700 pb-20 overflow-x-hidden relative ${isDarkMode ? 'bg-[#050507] text-gray-100' : 'bg-[#F8FAFC] text-slate-900'}`}
            style={{ '--brand-primary': neonColor } as any}
        >
            {/* 🌌 BACKGROUND IMMERSION */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] rounded-full blur-[250px] opacity-[0.07] animate-pulse-slow" style={{ backgroundColor: neonColor }}></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[200px] opacity-[0.04]" style={{ backgroundColor: profile.colors.secondary || '#3b82f6' }}></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] mix-blend-overlay"></div>
            </div>

            {/* 🧭 NAVIGATION OVERLAY */}
            <header className="fixed top-0 left-0 w-full h-20 md:h-24 z-[1000] px-6 lg:px-12 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => onNavigate && onNavigate('feed')}
                        className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-3xl border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all active:scale-95 shadow-2xl"
                    >
                        <span className="material-symbols-outlined">west</span>
                    </button>
                    {/* EDIT MODE TOGGLE */}
                    <button
                        onClick={() => {
                            if (isEditMode) {
                                setIsSaving(true);
                                setTimeout(() => {
                                    setIsSaving(false);
                                    setIsEditMode(false);
                                }, 1500);
                            } else {
                                setIsEditMode(true);
                            }
                        }}
                        className={`px-6 h-12 rounded-full font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${isEditMode ? 'bg-brand-primary text-black shadow-[0_0_30px_rgba(var(--brand-primary-rgb),0.4)]' : 'bg-white/5 text-white/40 border border-white/10'}`}
                    >
                        <span className="material-symbols-outlined text-sm">
                            {isSaving ? 'sync' : isEditMode ? 'check_circle' : 'edit_square'}
                        </span>
                        {isSaving ? 'Salvando Hub...' : isEditMode ? 'Finalizar & Publicar' : 'Editar Página'}
                    </button>
                    {isEditMode && !isSaving && (
                        <button
                            onClick={() => {
                                setIsSaving(true);
                                setTimeout(() => setIsSaving(false), 1000);
                            }}
                            className="px-6 h-12 rounded-full bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 transition-all hidden md:flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-sm">save</span>
                            Salvar Rascunho
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {isEditMode && (
                        <button className="hidden md:flex items-center gap-2 px-6 h-12 rounded-full bg-white/5 border border-white/10 text-brand-primary font-black text-[10px] uppercase tracking-[0.2em]">
                            <span className="material-symbols-outlined text-sm">auto_awesome</span>
                            Assistente IA
                        </button>
                    )}
                    <button
                        onClick={toggleTheme}
                        className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-3xl border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all"
                    >
                        <span className="material-symbols-outlined text-2xl">
                            {isDarkMode ? 'light_mode' : 'dark_mode'}
                        </span>
                    </button>
                    <button className="px-8 h-12 rounded-full bg-white text-black font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all">
                        Conectar
                    </button>
                </div>
            </header>

            {/* 🏛️ MAIN HUB CONTENT */}
            <main className="relative z-10">

                {/* 1️⃣ SECTION: IDENTITY HERO */}
                <section className="min-h-screen flex flex-col items-center justify-center pt-32 pb-20 px-6 text-center">
                    <Editable id="hero-avatar" type="avatar" data={{ avatar: hubData.hero.avatar }}>
                        <div className="relative mb-12 animate-fade-in">
                            <div className="absolute inset-[-20px] rounded-full border border-dashed border-white/10 animate-spin-slow"></div>
                            <div className="absolute inset-[-8px] rounded-full border-2 border-brand-primary/20 animate-pulse-slow"></div>
                            <div className="w-40 h-40 lg:w-56 lg:h-56 rounded-full p-2 border-2 relative z-10 shadow-[0_0_80px_-20px_var(--brand-primary)] overflow-hidden" style={{ borderColor: neonColor }}>
                                <img src={hubData.hero.avatar} className="w-full h-full rounded-full object-cover" alt="Hero Avatar" />
                            </div>
                            <div className="absolute -bottom-2 right-4 w-12 h-12 rounded-full bg-white border border-black/10 flex items-center justify-center text-black shadow-2xl z-20">
                                <span className="material-symbols-outlined text-[24px] filled text-brand-primary">verified</span>
                            </div>
                        </div>
                    </Editable>

                    <div className="space-y-6 max-w-4xl px-4">
                        <Editable id="hero-badge" type="text-short" data={{ text: hubData.hero.badge }}>
                            <div className="flex items-center justify-center gap-3 mb-4 animate-fade-in-up">
                                <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">{hubData.hero.badge}</span>
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            </div>
                        </Editable>

                        <Editable id="hero-title" type="text-hero" data={{ text: hubData.hero.title }}>
                            <h1 className="text-5xl md:text-8xl lg:text-[10rem] font-display font-black tracking-tighter italic leading-none text-white drop-shadow-2xl animate-fade-in">
                                {hubData.hero.title}
                            </h1>
                        </Editable>

                        <Editable id="hero-subtitle" type="text-short" data={{ text: hubData.hero.subtitle }}>
                            <p className="text-lg md:text-2xl text-white/40 font-medium uppercase tracking-[0.4em] max-w-2xl mx-auto animate-fade-in-up">
                                {hubData.hero.subtitle}
                            </p>
                        </Editable>

                        {/* Dynamic Stats Row */}
                        <div className="flex flex-wrap justify-center gap-12 lg:gap-24 pt-16">
                            {hubData.hero.stats.map((stat, i) => (
                                <Editable key={i} id={`hero-stat-${i}`} type="stat" data={stat}>
                                    <div className="flex flex-col items-center gap-2 group cursor-help transition-all hover:scale-110">
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mb-1 group-hover:bg-white/10 transition-all">
                                            <span className="material-symbols-outlined text-white/20 group-hover:text-brand-primary transition-colors">{stat.icon}</span>
                                        </div>
                                        <span className="text-3xl font-black text-white tracking-tighter">{stat.value}</span>
                                        <span className="text-[10px] text-white/20 uppercase tracking-[0.4em] font-black">{stat.label}</span>
                                    </div>
                                </Editable>
                            ))}
                        </div>
                    </div>

                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce-slow opacity-20">
                        <span className="material-symbols-outlined text-4xl">expand_more</span>
                    </div>
                </section>

                {/* 2️⃣ SECTION: MANIFESTO / STORYTELLING */}
                <section className="py-32 px-6 lg:px-24">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                        <div className="lg:col-span-1 flex lg:flex-col items-center justify-between lg:justify-start gap-8 lg:h-full pt-4">
                            <div className="w-px h-24 bg-gradient-to-b from-brand-primary to-transparent hidden lg:block"></div>
                            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.8em] vertical-text lg:mt-8">MANIFESTO</span>
                            <div className="w-[1px] flex-1 bg-white/5 hidden lg:block"></div>
                        </div>

                        <div className="lg:col-span-7 space-y-12">
                            <Editable id="manifesto-quote" type="text-area" data={{ text: hubData.manifesto.quote }}>
                                <h2 className="text-3xl lg:text-5xl font-black text-white italic tracking-tighter leading-tight">
                                    "{hubData.manifesto.quote.split('<br />')[0]} <br />
                                    <span className="text-brand-primary">{hubData.manifesto.quote.split('<br />')[1] || ""}</span>"
                                </h2>
                            </Editable>
                            <Editable id="manifesto-content" type="rich-text" data={{ text: hubData.manifesto.content }}>
                                <div className="space-y-8 text-xl lg:text-3xl text-white/60 font-medium leading-relaxed italic">
                                    {hubData.manifesto.content.split('\n').map((para, i) => (
                                        <p key={i} className="hover:text-white transition-colors duration-500">{para}</p>
                                    ))}
                                </div>
                            </Editable>
                        </div>

                        <div className="lg:col-span-4 sticky top-40">
                            <Editable id="manifesto-video" type="video" data={{ url: '#' }}>
                                <div className="aspect-[3/4] rounded-[4rem] bg-black/40 border border-white/10 overflow-hidden relative shadow-3d-glow group cursor-pointer">
                                    <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80" className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-80 transition-all duration-700 active:scale-95" alt="Presentation" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                                        <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-xl border border-white/30 flex items-center justify-center group-hover:scale-110 transition-all">
                                            <span className="material-symbols-outlined text-white text-5xl">play_circle</span>
                                        </div>
                                        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Assistir Apresentação</span>
                                    </div>
                                </div>
                            </Editable>
                        </div>
                    </div>
                </section>

                {/* 3️⃣ SECTION: THE SHOWCASE (ATVIVOS & CURSOS) */}
                <section className="py-32 px-6 lg:px-24 bg-white/[0.01]">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
                            <div className="space-y-4 text-left">
                                <h3 className="text-[11px] font-black text-brand-primary uppercase tracking-[0.6em]">Portfólio de Ativos</h3>
                                <h2 className="text-4xl lg:text-7xl font-black text-white italic tracking-tighter">Produção de Elite</h2>
                            </div>
                            <p className="text-white/30 font-medium max-w-sm text-right hidden md:block uppercase text-[10px] tracking-widest leading-relaxed">
                                Coleção exclusiva de conhecimentos, tratados e registros técnicos para pesquisadores avançados.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {hubData.showcase.map((item, i) => (
                                <Editable key={item.id} id={`showcase-${i}`} type="grid-item" data={item}>
                                    <div className="group relative aspect-[4/5] rounded-[3.5rem] bg-black/40 border border-white/5 overflow-hidden cursor-pointer hover:border-white/20 transition-all duration-700 shadow-2xl">
                                        <img src={item.img} className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-50 group-hover:scale-110 transition-all duration-1000" alt={item.title} />
                                        <div className="absolute inset-x-0 bottom-0 p-10 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col items-start gap-4">
                                            <span className="px-4 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-[9px] font-black text-brand-primary uppercase tracking-widest">{item.type}</span>
                                            <h4 className="text-2xl font-bold text-white transition-transform group-hover:translate-x-2">{item.title}</h4>
                                            <div className="flex items-center justify-between w-full mt-4">
                                                <span className="text-white font-black text-lg">{item.price}</span>
                                                <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center group-hover:scale-110 transition-all shadow-glow-white">
                                                    <span className="material-symbols-outlined text-xl">shopping_bag</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Editable>
                            ))}
                            {isEditMode && (
                                <div className="aspect-[4/5] rounded-[3.5rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-4 hover:border-brand-primary/40 hover:bg-white/[0.02] transition-all cursor-pointer group">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-all">
                                        <span className="material-symbols-outlined text-white/20 group-hover:text-brand-primary">add</span>
                                    </div>
                                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest group-hover:text-white">Adicionar Item</span>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* 4️⃣ SECTION: VAULT MULTIMÉDIA (PDFs & CO.) */}
                <section className="py-32 px-6 lg:px-24">
                    <div className="max-w-7xl mx-auto flex flex-col items-center gap-16">
                        <h3 className="text-[11px] font-black text-white/20 uppercase tracking-[1em] text-center">Biblioteca_Digital</h3>
                        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {hubData.vault.map((file, i) => (
                                <Editable key={file.id} id={`vault-${i}`} type="multimedia-item" data={file}>
                                    <div className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center gap-6 group cursor-pointer hover:bg-white/5 hover:border-white/20 transition-all duration-500 active:scale-95 shadow-lg relative">
                                        <div className="w-16 h-16 rounded-full bg-black/40 flex items-center justify-center border border-white/5 overflow-hidden relative">
                                            <div className="absolute inset-0 bg-brand-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <span className="material-symbols-outlined text-3xl text-white/30 group-hover:text-brand-primary transition-colors">{file.icon}</span>
                                        </div>
                                        <span className="text-[11px] font-black text-white/40 uppercase tracking-widest text-center group-hover:text-white transition-colors">{file.title}</span>
                                        <div className="absolute top-4 right-6 opacity-0 group-hover:opacity-30 transition-opacity">
                                            <span className="material-symbols-outlined text-sm">download</span>
                                        </div>
                                    </div>
                                </Editable>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 5️⃣ SECTION: COURSE PATH (TRILHA ADICIONARES) */}
                <section className="py-32 px-6 lg:px-24 bg-brand-primary/[0.02]">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center space-y-4 mb-20">
                            <h3 className="text-[11px] font-black text-white/20 uppercase tracking-[0.6em]">Método_Adicionares</h3>
                            <h2 className="text-4xl lg:text-7xl font-black text-white italic tracking-tighter">Trilha do Conhecimento</h2>
                        </div>

                        <div className="space-y-6 relative">
                            <div className="absolute left-10 top-10 bottom-10 w-px bg-white/5 hidden md:block"></div>
                            {[
                                { title: 'Conceitos Fundamentais', dur: '45min', status: 'done', icon: 'menu_book' },
                                { title: 'Laboratório de Energias', dur: '1h 30min', status: 'play', icon: 'bolt' },
                                { title: 'Projeciologia Técnica', dur: '2h', status: 'lock', icon: 'visibility' },
                                { title: 'Mentalsomática Avançada', dur: '3h', status: 'lock', icon: 'psychology' }
                            ].map((step, i) => (
                                <Editable key={i} id={`course-${i}`} type="course-module" data={step}>
                                    <div className="relative z-10 flex items-center gap-8 group">
                                        <div className={`w-20 h-20 rounded-3xl shrink-0 flex items-center justify-center border transition-all duration-700 ${step.status === 'done' ? 'bg-green-500/10 border-green-500/30 text-green-500' : step.status === 'play' ? 'bg-white/5 border-white/20 text-white' : 'bg-black/40 border-white/5 text-white/10'}`}>
                                            <span className="material-symbols-outlined text-3xl">{step.icon}</span>
                                        </div>
                                        <div className="flex-1 p-8 rounded-[2.5rem] bg-black/40 border border-white/5 flex items-center justify-between group-hover:border-white/10 group-hover:bg-white/[0.03] transition-all cursor-pointer shadow-xl">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Módulo 0{i + 1}</span>
                                                <h4 className="text-xl font-bold text-white pr-4">{step.title}</h4>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{step.dur}</span>
                                                <span className={`material-symbols-outlined transition-all ${step.status === 'done' ? 'text-green-500' : 'text-white/20'}`}>
                                                    {step.status === 'done' ? 'verified' : step.status === 'play' ? 'play_circle' : 'lock'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Editable>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 6️⃣ SECTION: CTA & SHARING HUB */}
                <section className="py-48 px-6 lg:px-24">
                    <div className="max-w-7xl mx-auto rounded-[5rem] bg-gradient-to-b from-white/5 to-transparent p-12 lg:p-24 border border-white/5 flex flex-col lg:flex-row items-center justify-between gap-20 shadow-3d-glow relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-96 h-96 rounded-full bg-brand-primary/10 blur-[120px] pointer-events-none"></div>

                        <div className="space-y-10 text-center lg:text-left z-10">
                            <Editable id="cta-content" type="text-area" data={{ title: hubData.cta.title, description: hubData.cta.description }}>
                                <div className="space-y-6">
                                    <h2 className="text-4xl md:text-7xl font-black text-white italic tracking-tighter leading-none">
                                        {hubData.cta.title.split('. ')[0]}. <br />
                                        <span className="text-brand-primary">{hubData.cta.title.split('. ')[1] || ""}</span>
                                    </h2>
                                    <p className="text-white/40 font-medium text-xl leading-relaxed max-w-lg">
                                        {hubData.cta.description}
                                    </p>
                                </div>
                            </Editable>
                            <div className="flex flex-wrap justify-center lg:justify-start gap-6">
                                {['YouTube', 'Instagram', 'Telegram', 'Email'].map(social => (
                                    <button key={social} className="px-10 h-14 rounded-full bg-white/5 border border-white/10 text-white font-black text-[11px] uppercase tracking-widest hover:bg-white hover:text-black transition-all active:scale-95">
                                        {social}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Editable id="sharing-qr" type="qr-code" data={{}}>
                            <div className="w-72 h-72 lg:w-96 lg:h-96 bg-white p-8 rounded-[4rem] shadow-glow-white relative group cursor-pointer transition-all hover:rotate-3">
                                <div className="w-full h-full bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=AdicionaresPortal')] bg-cover opacity-80 group-hover:opacity-100 transition-opacity"></div>
                                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-white/90 backdrop-blur-sm rounded-[4rem]">
                                    <span className="material-symbols-outlined text-black text-6xl">qr_code_2</span>
                                    <span className="text-[10px] font-black text-black uppercase tracking-widest mt-4">Salvar Contato</span>
                                </div>
                            </div>
                        </Editable>
                    </div>
                </section>

            </main>

            {/* 🧭 STATIC FOOTER NAV */}
            <footer className="fixed bottom-0 left-0 w-full h-24 pointer-events-none z-[100] flex justify-center items-center px-4 pb-6">
                <div className="w-64 h-16 bg-black/60 backdrop-blur-[40px] border border-white/10 rounded-full flex items-center justify-around px-2 pointer-events-auto shadow-2xl transition-all hover:scale-[1.05]">
                    <button onClick={() => onNavigate && onNavigate('feed')} className="w-12 h-12 rounded-full flex items-center justify-center text-white/30 hover:text-white transition-all active:scale-90" title="Home">
                        <span className="material-symbols-outlined text-[28px]">grid_view</span>
                    </button>
                    <button className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-all active:scale-90" title="Profile">
                        <span className="material-symbols-outlined text-[28px] filled" style={{ color: neonColor }}>person</span>
                    </button>
                    <button onClick={() => onNavigate && onNavigate('profile-edit')} className="w-12 h-12 rounded-full flex items-center justify-center text-white/30 hover:text-white transition-all active:scale-90" title="Edit">
                        <span className="material-symbols-outlined text-[28px]">settings</span>
                    </button>
                </div>
            </footer>

            {/* 🧠 CONTEXTUAL EDIT MODAL */}
            {editingElement && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-fade-in" onClick={() => setEditingElement(null)}></div>
                    <div className="relative w-full max-w-xl bg-[#0F1115] border border-white/10 rounded-[3rem] p-10 shadow-[0_0_100px_rgba(0,0,0,0.8)] animate-scale-up overflow-hidden">
                        <div className="absolute top-0 right-0 p-8">
                            <button onClick={() => setEditingElement(null)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-2">
                                <h3 className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em]">Editor Contextual</h3>
                                <h2 className="text-3xl font-black text-white italic tracking-tighter">Editando {editingElement.type}</h2>
                            </div>

                            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-4 no-scrollbar">
                                {/* TEXT EDITING */}
                                {(editingElement.type === 'text-hero' || editingElement.type === 'text-short' || editingElement.type === 'text-area') && (
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">Conteúdo do Texto</label>
                                        <textarea
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white font-medium focus:border-brand-primary outline-none transition-all min-h-[150px]"
                                            value={editingElement.data.text}
                                            onChange={(e) => setEditingElement({ ...editingElement, data: { ...editingElement.data, text: e.target.value } })}
                                        />
                                    </div>
                                )}

                                {/* GRID ITEM EDITING */}
                                {editingElement.type === 'grid-item' && (
                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">Título</label>
                                            <input
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-medium focus:border-brand-primary outline-none"
                                                value={editingElement.data.title}
                                                onChange={(e) => setEditingElement({ ...editingElement, data: { ...editingElement.data, title: e.target.value } })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">Tipo</label>
                                                <input
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-medium focus:border-brand-primary outline-none"
                                                    value={editingElement.data.type}
                                                />
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">Preço/Valor</label>
                                                <input
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-medium focus:border-brand-primary outline-none"
                                                    value={editingElement.data.price}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* STYLE CONTROLS (Common for most) */}
                                <div className="pt-8 border-t border-white/5 space-y-6">
                                    <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">Configurações de Estilo</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button className="h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center gap-3 text-white/60 hover:text-white transition-all">
                                            <span className="material-symbols-outlined text-sm">palette</span>
                                            <span className="text-[10px] font-black uppercase tracking-widest">Cores</span>
                                        </button>
                                        <button className="h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center gap-3 text-white/60 hover:text-white transition-all">
                                            <span className="material-symbols-outlined text-sm">format_size</span>
                                            <span className="text-[10px] font-black uppercase tracking-widest">Tamanho</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    // REAL SAVING LOGIC
                                    if (editingElement.id.startsWith('hero-')) {
                                        const key = editingElement.id.split('-')[1];
                                        if (key === 'avatar' || key === 'badge' || key === 'title' || key === 'subtitle') {
                                            updateHubData(`hero.${key}`, editingElement.data.text || editingElement.data.avatar);
                                        } else if (key === 'stat') {
                                            const index = parseInt(editingElement.id.split('-')[2]);
                                            const newStats = [...hubData.hero.stats];
                                            newStats[index] = editingElement.data;
                                            updateHubData('hero.stats', newStats);
                                        }
                                    } else if (editingElement.id.startsWith('manifesto-')) {
                                        const key = editingElement.id.split('-')[1];
                                        updateHubData(`manifesto.${key}`, editingElement.data.text);
                                    } else if (editingElement.id.startsWith('showcase-')) {
                                        const index = parseInt(editingElement.id.split('-')[1]);
                                        const newShowcase = [...hubData.showcase];
                                        newShowcase[index] = editingElement.data;
                                        setHubData({ ...hubData, showcase: newShowcase });
                                    } else if (editingElement.id === 'cta-content') {
                                        setHubData({ ...hubData, cta: { title: editingElement.data.title, description: editingElement.data.description } });
                                    }

                                    setEditingElement(null);
                                }}
                                className="w-full h-16 rounded-full bg-brand-primary text-black font-black text-[11px] uppercase tracking-[0.3em] shadow-glow-primary hover:scale-[1.02] active:scale-95 transition-all mt-4"
                            >
                                Salvar Alterações
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 🤖 FLOATING AI ASSISTANT */}
            {isEditMode && (
                <div className="fixed bottom-32 right-8 z-[1000] group">
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-brand-primary to-blue-500 blur-md opacity-50 group-hover:opacity-100 transition-all animate-pulse-slow"></div>
                    <button className="relative w-16 h-16 rounded-full bg-black border border-white/20 flex items-center justify-center text-brand-primary shadow-2xl hover:scale-110 active:scale-95 transition-all">
                        <span className="material-symbols-outlined text-3xl">auto_awesome</span>
                        <div className="absolute -top-16 right-0 bg-white text-black px-6 py-3 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap">
                            <div className="flex flex-col items-start gap-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">Assistente Ativo</span>
                                <span className="text-[9px] text-black/60 font-medium">Sugerir textos e cores com IA</span>
                            </div>
                        </div>
                    </button>
                </div>
            )}

            <style>{`
        @font-face {
          font-family: 'Display';
          src: url('https://fonts.googleapis.com/css2?family=Outfit:wght@900&display=swap');
        }
        .font-display { font-family: 'Outfit', sans-serif; }
        .shadow-3d-glow { box-shadow: 0 40px 100px -20px rgba(0,0,0,0.8), 0 0 40px -10px var(--brand-primary); }
        .shadow-glow-white { box-shadow: 0 0 50px -10px #ffffff; }
        .shadow-glow-primary { box-shadow: 0 0 40px -5px var(--brand-primary); }
        .vertical-text { writing-mode: vertical-rl; transform: rotate(180deg); }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scale-up { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in { animation: fade-in 1s ease-out forwards; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
        .animate-scale-up { animation: scale-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes pulse-slow { 0%, 100% { opacity: 0.1; transform: scale(1); } 50% { opacity: 0.2; transform: scale(1.05); } }
        .animate-pulse-slow { animation: pulse-slow 5s ease-in-out infinite; }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        @keyframes bounce-slow { 0%, 100% { transform: translateY(0) translateX(-50%); } 50% { transform: translateY(10px) translateX(-50%); } }
        .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
        .filled { font-variation-settings: 'FILL' 1; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
        </div>
    );
};

export default PublicProfileScreen;
