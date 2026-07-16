
import React, { useState, useRef, useEffect } from 'react';
import FeedEditor from '../components/FeedEditor';
import { supabase } from '../supabaseClient';

// --- Interfaces de Dados ---
type LogType = 'ENTRY' | 'SYNC' | 'ACHIEVEMENT' | 'CHALLENGE' | 'SIGNAL';

interface Author {
  name: string;
  avatar: string;
  role: string;
  isVerified?: boolean;
}

interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  time: string;
  isMe?: boolean;
}

interface Post {
  userId: string; // ID único do autor para permissões
  id: string;
  author: Author;
  timeAgo: string;
  content: string;
  mediaType: 'image' | 'video' | 'audio' | 'none';
  mediaUrl?: string;
  audioUrl?: string;
  audioDuration?: number;
  stats: {
    likes: number;
    views: string;
    comments: number;
  };
  tags?: string[];
  comments: Comment[];
  isLiked?: boolean;
  isPlaying?: boolean;
  media?: { type: 'image' | 'video' | 'audio'; url: string }[];
}

interface AIEvent {
  id: string;
  user: string;
  userAvatar: string;
  type: LogType;
  action: string;
  value: string;
  lvl: number;
  syncScore: number;
  color: string;
  icon: string;
  // Propriedades dinâmicas de renderização
  top?: string;
  left?: string;
  scale?: number;
  delay?: number;
}

interface FeedScreenProps {
  onNavigate?: (screen: 'welcome' | 'feed' | 'holoteca' | 'cinema' | 'profile-edit' | 'public-profile' | 'cockpit' | 'grupo' | 'matches' | 'chat') => void;
}

// --- Helper para limpar HTML ---
const stripHtml = (html: string) => {
  return html.replace(/<[^>]*>?/gm, '');
};

// --- Componente de Imagem Elástica (Masonry Friendly) ---
const SmartPostImage = ({ src }: { src: string }) => {
  return (
    <img
      src={src}
      className="w-full h-auto rounded-lg border border-white/5 bg-black/20 shadow-lg object-contain"
      alt="media"
      loading="lazy"
    />
  );
};

// --- Áudio Player Rico (Restaurado com Ondas Animadas) ---
const PostAudioPlayer = ({ duration }: { duration: number }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const togglePlay = () => setIsPlaying(!isPlaying);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="my-2 p-3 bg-gradient-to-r from-red-700 to-red-950 backdrop-blur-md rounded-[1.2rem] w-full border border-white/10 flex items-center gap-4 shadow-lg hover:shadow-red-900/10 transition-all group">
      {/* Botão Play/Pause */}
      <button
        onClick={togglePlay}
        className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-black/40 hover:bg-black/60 text-white rounded-full transition-all border border-white/10 shadow-lg backdrop-blur-md"
      >
        <span className="material-symbols-outlined text-[20px] ml-0.5 filled">
          {isPlaying ? 'pause' : 'play_arrow'}
        </span>
      </button>

      {/* Onda Sonora (Waveform) Animada */}
      <div className="flex-1 flex items-center gap-[3px] h-6 overflow-hidden">
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className={`w-[3px] rounded-full transition-all duration-300 ${isPlaying ? 'animate-audio-wave bg-red-400' : 'bg-white/20'}`}
            style={{
              height: isPlaying ? 'auto' : `${Math.max(20, Math.random() * 60)}%`,
              animationDelay: `${i * 0.05}s`,
              minHeight: '4px'
            }}
          />
        ))}
      </div>

      {/* Duração */}
      {/* Duração */}
      <span className="text-[11px] font-mono text-white/60 font-medium tabular-nums px-1">
        {formatTime(duration)}
      </span>
    </div>
  );
};

// --- Pool de Dados para o Radar ---
const EVENT_POOL: Omit<AIEvent, 'id' | 'top' | 'left' | 'scale' | 'delay'>[] = [
  { user: "Douglas Rocha", userAvatar: "https://i.pravatar.cc/150?img=11", type: 'ACHIEVEMENT', action: "ALCANÇOU O ESTADO VIBRACIONAL", value: "Realizou uma técnica avançada de circulação energética fechada durante 50 minutos ininterruptos no laboratório.", lvl: 42, syncScore: 98, color: "#ff4d00", icon: "bolt" },
  { user: "Ana Paula", userAvatar: "https://i.pravatar.cc/150?img=32", type: 'ENTRY', action: "ENTROU NO CAMPO HOLOPENSÊNICO", value: "Acabou de se conectar à egrégora do grupo para o debate síncrono sobre cosmoética aplicada.", lvl: 12, syncScore: 85, color: "#00f7ff", icon: "login" },
  { user: "Marco Túlio", userAvatar: "https://i.pravatar.cc/150?img=44", type: 'SYNC', action: "SINCRONIZOU MENTALSSOMA", value: "Contribuiu com uma nova definição para o verbete em construção sobre inteligência evolutiva.", lvl: 28, syncScore: 92, color: "#7d00ff", icon: "hub" },
  { user: "Jessie C.", userAvatar: "https://i.pravatar.cc/150?img=5", type: 'SIGNAL', action: "REGISTROU SINALÉTICA PARADÍGMA", value: "Identificou presença de amparador extrafísico durante a leitura do novo artigo postado na Holoteca.", lvl: 55, syncScore: 100, color: "#ff00e6", icon: "sensors" },
  { user: "Carlos S.", userAvatar: "https://i.pravatar.cc/150?img=22", type: 'CHALLENGE', action: "COMPLETOU O DESAFIO DE 20 EVS", value: "Finalizou a série de mobilizações energéticas diárias propostas para a semana de imersão.", lvl: 15, syncScore: 70, color: "#fbbf24", icon: "psychology" },
  { user: "Lucia M.", userAvatar: "https://i.pravatar.cc/150?img=41", type: 'SYNC', action: "REALIZOU ACOPLAMENTO ÁURICO", value: "Assistência energética prestada à distância para o grupo de tenepessistas iniciantes.", lvl: 33, syncScore: 88, color: "#10b981", icon: "volunteer_activism" },
  { user: "Roberto K.", userAvatar: "https://i.pravatar.cc/150?img=12", type: 'ENTRY', action: "ACESSOU A HOLOTECA DIGITAL", value: "Iniciou o estudo aprofundado do tratado sobre projeciologia avançada no módulo 4.", lvl: 5, syncScore: 45, color: "#3b82f6", icon: "visibility" },
  { user: "Elena F.", userAvatar: "https://i.pravatar.cc/150?img=25", type: 'ACHIEVEMENT', action: "BATEU O RECORDE DE TENEPES", value: "Completou hoje a marca histórica de 1000 dias consecutivos de prática assistencial diária.", lvl: 80, syncScore: 100, color: "#ef4444", icon: "verified" },
];

const CURRENT_USER_ID = 'user-douglas';


// --- Parser de Conteúdo Multimídia (Áudio + Imagem + Texto) ---
// --- Parser Multimídia (Layout em Quadrante/Grid) ---
// --- Parser Multimídia (Layout Masonry Elástico) ---
const renderPostContent = (htmlContent: string) => {
  const regex = /(<audio-component[^>]*duration=["']([^"']+)["'][^>]*>(?:<\/audio-component>)?)|(<img[^>]+src=["']([^"']+)["'][^>]*>)/gi;

  const parts: React.JSX.Element[] = [];
  let lastIndex = 0;
  let match;
  let idx = 0;

  while ((match = regex.exec(htmlContent)) !== null) {
    // 1. Texto (Item do Masonry - Evita Quebra)
    if (match.index > lastIndex) {
      const text = htmlContent.slice(lastIndex, match.index);
      if (text.trim()) {
        parts.push(
          <div key={`text-${idx++}`} className="mb-4 break-inside-avoid leading-relaxed">
            <span dangerouslySetInnerHTML={{ __html: text }} className="break-words" />
          </div>
        );
      }
    }

    // 2. Mídia (Item do Masonry - Evita Quebra)
    if (match[1]) {
      // Audio
      const durationStr = match[2] || "0:00";
      const [m, s] = durationStr.split(':').map(Number);
      parts.push(
        <div key={`audio-${idx++}`} className="mb-4 break-inside-avoid w-full">
          <PostAudioPlayer duration={(m * 60) + s} />
        </div>
      );
    } else if (match[3]) {
      // Imagem Completa (Sem cortes, altura natural)
      parts.push(
        <div key={`img-${idx++}`} className="mb-4 break-inside-avoid w-full group">
          <SmartPostImage src={match[4]} />
        </div>
      );
    }
    lastIndex = regex.lastIndex;
  }

  // Texto Final
  if (lastIndex < htmlContent.length) {
    const text = htmlContent.slice(lastIndex);
    if (text.trim()) {
      parts.push(
        <div key={`text-${idx++}`} className="mb-4 break-inside-avoid leading-relaxed">
          <span dangerouslySetInnerHTML={{ __html: text }} className="break-words" />
        </div>
      );
    }
  }

  // Se vazio
  if (parts.length === 0) return <div dangerouslySetInnerHTML={{ __html: htmlContent }} className="prose-text text-gray-200" />;

  // Layout Masonry: 1 coluna no mobile, 2 colunas no desktop (Quadrante Elástico)
  return (
    <div className="block md:columns-2 gap-4 w-full space-y-4">
      {parts}
    </div>
  );
};

// --- Componente de Instalação PWA (Popup Elite) ---
const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Pequeno delay para não sobrepor a entrada da página (User Experience)
      setTimeout(() => setShow(true), 2000);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Fallback para exibir a interface mesmo se o evento nativo falhar (HTTP/IP Local)
  // Só exibe se ainda não foi fechado pelo usuário
  useEffect(() => {
    if (isDismissed) return; // Se o usuário fechou, não insiste

    const timer = setTimeout(() => {
      if (!show && !deferredPrompt && !isDismissed) {
        setShow(true);
      }
    }, 4000); // 4 segundos de tolerância
    return () => clearTimeout(timer);
  }, [show, deferredPrompt, isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setShow(false);
  };

  const handleInstall = async () => {
    if (!deferredPrompt) {
      alert("⚠️ Modo de Desenvolvimento (HTTP)\n\nO navegador bloqueou a instalação automática por segurança ( falta de HTTPS).\n\n👉 Para instalar: Toque no menu do navegador (⋮) e selecione 'Instalar aplicativo' ou 'Adicionar à tela inicial'.");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShow(false);
    }
    setDeferredPrompt(null);
  };

  return null; // Disabled PWA install popup as requested
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-6">
      {/* Modal Centralizado Premium */}
      <div className="relative w-full max-w-sm bg-[#08080A] border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col gap-6 animate-zoom-in-pulse">

        {/* Botão Fechar (X) - Canto Superior Direito (Solicitado) */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-white/40 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <span className="material-symbols-outlined text-2xl">close</span>
        </button>

        {/* Conteúdo Central (Logo e Título) */}
        <div className="flex flex-col items-center text-center mt-2">
          <div className="w-24 h-24 rounded-2xl bg-black border border-white/10 overflow-hidden mb-4 shadow-lg ring-4 ring-white/5">
            <img src="/icon-192.png" alt="App Icon" className="w-full h-full object-cover" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2 font-display tracking-tight">Adicionares Space</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Instale o aplicativo oficial para uma experiência completa e imersiva.
          </p>
        </div>

        {/* Botão Seguir/Instalar (>) - Canto Inferior Direito (Solicitado) */}
        <div className="flex justify-end mt-2">
          <button
            onClick={handleInstall}
            className="flex items-center gap-3 bg-white text-black font-bold px-6 py-3 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-glow-silver group"
          >
            <span>Instalar</span>
            <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
        </div>

      </div>
    </div>
  );
};

// --- News Cards Data ---
const NEWS_ITEMS = [
  {
    id: 1,
    tag: 'Destaque',
    tagColor: 'bg-rose-500/20 border-rose-500/30 text-rose-200',
    title: 'SEMANA DA CONSCIÊNCIA',
    desc: 'Garanta seu ingresso para o maior evento do ano em Foz.',
    bg: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80',
    btn: 'Ver Detalhes'
  },
  {
    id: 2,
    tag: 'Workshop',
    tagColor: 'bg-blue-500/20 border-blue-500/30 text-blue-200',
    title: 'IMERSÃO TENEPESSISTA',
    desc: 'Aprofunde suas práticas energéticas com especialistas.',
    bg: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80',
    btn: 'Inscrever-se'
  },
  {
    id: 3,
    tag: 'Lançamento',
    tagColor: 'bg-amber-500/20 border-amber-500/30 text-amber-200',
    title: 'MENTE E COSMO',
    desc: 'Novo tratado sobre a relação entre parapsiquismo e física.',
    bg: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80',
    btn: 'Ler Prévia'
  },
  {
    id: 4,
    tag: 'Pesquisa',
    tagColor: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-200',
    title: 'LABORATÓRIO GRUPAL',
    desc: 'Participe do experimento de campo bioenergético neste sábado.',
    bg: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&q=80',
    btn: 'Participar'
  },
  {
    id: 5,
    tag: 'Webinar',
    tagColor: 'bg-purple-500/20 border-purple-500/30 text-purple-200',
    title: 'COSMOÉTICA GLOBAL',
    desc: 'Debate ao vivo com pesquisadores de 10 países.',
    bg: 'https://images.unsplash.com/photo-1526304640152-d4619684e484?w=600&q=80',
    btn: 'Definir Lembrete'
  }
];

// --- 3D Carousel Component ---
const News3DCarousel = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [centerIndex, setCenterIndex] = useState(0);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollLeft, clientWidth } = containerRef.current;

    // Dynamic width based on screen size (matches CSS)
    const isDesktop = window.innerWidth >= 1024;
    const itemFullWidth = isDesktop ? 480 : 280;

    // Calculate precise center index
    const index = Math.round(scrollLeft / itemFullWidth);
    setCenterIndex(index);
  };

  // Efeito "Coverflow" Refinado (Strong Overlap)
  const getCardStyle = (index: number) => {
    const offset = index - centerIndex;
    const absOffset = Math.abs(offset);
    const isActive = offset === 0;

    // Base Styles
    let styles: any = {
      zIndex: 50 - absOffset,
      filter: isActive ? 'brightness(1.1)' : `brightness(${0.6 - (absOffset * 0.1)}) blur(${absOffset}px)`,
      opacity: isActive ? 1 : Math.max(0.4, 0.8 - (absOffset * 0.2)),
    };

    // 3D Transforms
    if (isActive) {
      styles.transform = 'perspective(1000px) scale(1.05) translateZ(0) rotateY(0deg)';
      styles.boxShadow = '0 25px 60px rgba(0,0,0,0.6)';
    } else {
      // Directions
      const direction = offset > 0 ? 1 : -1; // 1 = Right, -1 = Left

      // Overlap Factor: Pull closer to center
      // Quanto mais longe, mais "esmagado" para o centro
      const translateX = -50 * direction * absOffset; // 50px overlap per item step
      const rotateY = -45 * direction; // Face inward
      const translateZ = -100 * absOffset; // Recede into background

      styles.transform = `perspective(1000px) translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(0.85)`;
    }

    return styles;
  };

  const scrollToCard = (index: number) => {
    if (!containerRef.current) return;
    const isDesktop = window.innerWidth >= 1024;
    const itemFullWidth = isDesktop ? 480 : 280;
    containerRef.current.scrollTo({
      left: index * itemFullWidth,
      behavior: 'smooth'
    });
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="w-full h-full flex items-center gap-0 px-[calc(50%-140px)] lg:px-[calc(50%-240px)] overflow-x-auto no-scrollbar snap-x snap-mandatory py-12"
      style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
    >
      {NEWS_ITEMS.map((item, index) => (
        <div
          key={item.id}
          onClick={() => scrollToCard(index)}
          className="min-w-[280px] w-[280px] lg:min-w-[480px] lg:w-[480px] h-[280px] rounded-[1.5rem] bg-[#0F0F10] border border-white/10 relative overflow-hidden group cursor-pointer transition-all duration-500 ease-out snap-center shrink-0 shadow-[0_0_30px_rgba(0,0,0,0.5)]"
          style={{
            ...getCardStyle(index),
            transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)'
          }}
        >
          {/* 1. Background Image (Full Visibility) */}
          <img
            src={item.bg}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-700"
            alt={item.title}
          />

          {/* 2. Technical Overlay (Subtle Grid only, no dark scrim) */}
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.2)_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none"></div>

          {/* 3. Content Layout (Reference Style) */}
          <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">

            {/* Top: Description & Title */}
            <div className="space-y-4">
              {/* Mono Tag */}
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                <p className="text-[9px] text-gray-500 font-mono uppercase tracking-widest">
                  SYS.ID-{item.id}04 :: {item.tag}
                </p>
              </div>

              <h3 className="text-xl font-medium text-gray-100 leading-snug font-sans tracking-tight text-left text-balance">
                {item.title}
              </h3>
            </div>

            {/* Middle: Abstract Wireframe Decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity duration-700">
              <div className="absolute inset-0 rounded-full border border-white/50 animate-[spin_10s_linear_infinite]"></div>
              <div className="absolute inset-4 rounded-full border border-dashed border-white/50 animate-[spin_15s_linear_infinite_reverse]"></div>
              <div className="absolute inset-10 rounded-full border border-white/30"></div>
            </div>

            {/* Bottom: Description & Button */}
            <div className="flex flex-col gap-4">
              <p className="text-[10px] text-gray-400/80 font-medium leading-relaxed text-left line-clamp-2 border-l border-white/20 pl-3">
                {item.desc}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <span className="text-[8px] text-gray-600 font-mono uppercase">Certified Secured</span>

                <button className="pl-4 pr-1 py-1 rounded-full bg-white text-black flex items-center gap-3 hover:bg-gray-200 transition-colors shadow-lg group/btn">
                  <span className="text-[9px] font-bold uppercase tracking-wider">Acessar</span>
                  <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center transform group-hover/btn:rotate-[-45deg] transition-transform duration-300">
                    <span className="material-symbols-outlined text-[10px]">arrow_forward</span>
                  </div>
                </button>
              </div>
            </div>

          </div>
        </div>
      ))}
      {/* Spacer final manual para garantir scroll até o último */}
      <div className="min-w-[calc(50vw-140px)] shrink-0 h-1"></div>
    </div>
  );
};

const FeedScreen: React.FC<FeedScreenProps> = ({ onNavigate }) => {
  const [posts, setPosts] = useState<Post[]>([]);

  // Carregar posts do Supabase ao montar
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        console.log("Supabase Fetch: Buscando posts...");
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false });
        
        console.log("Supabase Fetch: Resultado posts:", { data, error });

        if (error) {
          console.error("Supabase Fetch Erro:", error.message);
        }

        if (!error && data) {
          setPosts(data.map((p: any) => ({
            id: p.id,
            userId: p.user_id,
            author: p.author,
            timeAgo: 'Agora',
            content: p.content,
            mediaType: p.media_type,
            audioDuration: p.audio_duration,
            stats: p.stats,
            comments: p.comments || [],
            isLiked: p.is_liked
          })) as Post[]);
        }
      } catch (err) {
        console.error('Erro ao buscar posts:', err);
      }
    };
    fetchPosts();
  }, []);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [activeMenuCommentId, setActiveMenuCommentId] = useState<string | null>(null); // New State for Comment Menus
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [liveEvents, setLiveEvents] = useState<AIEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<AIEvent | null>(null);
  const [isAmparoActive, setIsAmparoActive] = useState(false);

  const triggerAmparoAction = () => {
    if (isAmparoActive) return;
    setIsAmparoActive(true);
    setTimeout(() => {
      alert("Funcionalidade de Amparo em desenvolvimento. Em breve você poderá solicitar e oferecer auxílio.");
      setIsAmparoActive(false);
    }, 450);
  };
  // --- Click Outside to Close Menus ---
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuId(null);
      setActiveMenuCommentId(null);
    };

    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);
  // --- Debate / Tertúlia Logic ---
  const radarScrollRef = useRef<HTMLDivElement>(null);

  const scrollToNovidades = () => {
    if (radarScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = radarScrollRef.current;
      const maxScroll = scrollWidth - clientWidth;

      // Lógica de Toggle:
      // Se estiver mais próximo do início (Radar), vai para o fim (Novidades).
      // Se estiver mais próximo do fim (Novidades), volta para o início (Radar).
      const treshold = maxScroll / 2;
      const targetScroll = scrollLeft > treshold ? 0 : maxScroll;

      radarScrollRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  const handleNovidadesWheel = (e: React.WheelEvent) => {
    if (radarScrollRef.current) {
      // Allow horizontal scroll driven by both vertical (mouse wheel) and horizontal (trackpad) deltas
      radarScrollRef.current.scrollLeft += (e.deltaY + e.deltaX);
    }
  };

  // --- Auto-Return Logic (Radar Focus) ---
  const isHoveringRef = useRef(false);
  const returnTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Drag Scroll Refs
  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  const startReturnTimer = () => {
    if (returnTimerRef.current) clearTimeout(returnTimerRef.current);

    const scrollContainer = radarScrollRef.current;
    if (!scrollContainer) return;

    // "Modo Atração" (Idle Tour):
    // Se ficar 45s sem interação (hover/drag), alterna entre Radar e Novidades automaticamente.
    if (!isHoveringRef.current && !isDownRef.current) {
      returnTimerRef.current = setTimeout(() => {
        // Verifica onde está
        if (scrollContainer.scrollLeft > 20) {
          // Está nas Novidades -> Volta para Radar
          scrollContainer.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          // Está no Radar -> Vai para Novidades
          // Isso cria um ciclo de "apresentação" automática
          scrollContainer.scrollTo({ left: scrollContainer.scrollWidth, behavior: 'smooth' });
        }
      }, 45000); // 45 segundos de inatividade
    }
  };

  const handleRadarMouseEnter = () => {
    isHoveringRef.current = true;
    if (returnTimerRef.current) clearTimeout(returnTimerRef.current);
  };

  const handleRadarMouseDown = (e: React.MouseEvent) => {
    const slider = radarScrollRef.current;
    if (!slider) return;
    isDownRef.current = true;
    isHoveringRef.current = true; // Ensure hover is true
    startXRef.current = e.pageX - slider.offsetLeft;
    scrollLeftRef.current = slider.scrollLeft;
    slider.style.cursor = 'grabbing';
    if (returnTimerRef.current) clearTimeout(returnTimerRef.current);
  };

  const handleRadarMouseUp = () => {
    isDownRef.current = false;
    const slider = radarScrollRef.current;
    if (slider) slider.style.cursor = 'grab';
  };

  const handleRadarMouseMove = (e: React.MouseEvent) => {
    if (!isDownRef.current) return;
    e.preventDefault();
    const slider = radarScrollRef.current;
    if (!slider) return;
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startXRef.current) * 1.5; // Scroll-fast
    slider.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleRadarMouseLeave = () => {
    isHoveringRef.current = false;
    isDownRef.current = false;
    const slider = radarScrollRef.current;
    if (slider) slider.style.cursor = 'grab';
    startReturnTimer();
  };

  // Logic: Reset Radar when interacting elsewhere (Click outside or Scroll Feed)
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      // Se clicar fora do carrossel e ele não estiver no início, volta
      if (radarScrollRef.current && !radarScrollRef.current.contains(e.target as Node)) {
        if (radarScrollRef.current.scrollLeft > 20) {
          radarScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        }
      }
    };

    const onFeedScroll = () => {
      // Se rolar o feed para baixo (sair da hero), reseta o carrossel
      if (feedContainerRef.current && feedContainerRef.current.scrollTop > 150) {
        if (radarScrollRef.current && radarScrollRef.current.scrollLeft > 20) {
          radarScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        }
      }
    };

    document.addEventListener('mousedown', onClickOutside);
    const feedMain = feedContainerRef.current;
    if (feedMain) feedMain.addEventListener('scroll', onFeedScroll, { passive: true });

    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      if (feedMain) feedMain.removeEventListener('scroll', onFeedScroll);
    };
  }, []);

  useEffect(() => {
    const scrollContainer = radarScrollRef.current;
    if (!scrollContainer || activePostId) return;

    const onScroll = () => startReturnTimer();

    scrollContainer.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      scrollContainer.removeEventListener('scroll', onScroll);
      if (returnTimerRef.current) clearTimeout(returnTimerRef.current);
    };
  }, [activePostId]);

  const [isDebateOpen, setIsDebateOpen] = useState(false);
  const [isAmparoOpen, setIsAmparoOpen] = useState(false);

  // --- VISUAL MODE LOGIC (Dark/Pastel Power) ---
  // Inicializa lendo do localStorage, ou padrão true (Dark)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme-preference');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Persiste a escolha do usuário sempre que mudar
  useEffect(() => {
    localStorage.setItem('theme-preference', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // --- Animation Styles ---
  const styles = `
    @keyframes heroPulse {
      0% { color: white; text-shadow: 0 0 20px rgba(255, 165, 0, 0.8), 0 0 40px rgba(255, 165, 0, 0.4); -webkit-text-stroke: 0px transparent; } /* Orange Glow */
      25% { color: white; text-shadow: 0 0 20px rgba(0, 0, 255, 0.8), 0 0 40px rgba(0, 0, 255, 0.4); -webkit-text-stroke: 0px transparent; } /* Blue Glow */
      50% { color: #FF0000; text-shadow: 4px 4px 0px #000000; -webkit-text-stroke: 2px #000000; letter-spacing: 0.05em; transform: scale(1.02); } /* Alert: Strong Red + Heavy Black Edges */
      75% { color: white; text-shadow: 0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(255, 255, 255, 0.4); -webkit-text-stroke: 0px transparent; } /* White Glow */
      100% { color: white; text-shadow: 0 0 20px rgba(255, 165, 0, 0.8), 0 0 40px rgba(255, 165, 0, 0.4); -webkit-text-stroke: 0px transparent; } /* Loop */
    }
    @keyframes alertPulse {
      0% { color: white; text-shadow: 0 0 10px rgba(255, 165, 0, 0.8); } /* Orange */
      25% { color: white; text-shadow: 0 0 10px rgba(0, 0, 255, 0.8); } /* Blue */
      50% { color: black; text-shadow: 0 0 15px rgba(139, 0, 0, 1); font-weight: 900; } /* Dark Red + Black Text (Danger) */
      75% { color: white; text-shadow: 0 0 10px rgba(255, 255, 255, 0.8); } /* White */
      100% { color: white; text-shadow: 0 0 10px rgba(255, 165, 0, 0.8); } /* Loop */
    }
  `;

  // Theme System v1 (Pastel Power / Dark Glass)
  const theme = {
    // Backgrounds
    mainBg: isDarkMode ? "bg-[#1A1A1D]/90 lg:stellar-bg backdrop-blur-3xl" : "bg-[rgba(243,244,246,0.8)] backdrop-blur-3xl", // Mobile Lighter Dark
    headerBg: isDarkMode ? "bg-[#08080A]/80 border-white/10" : "bg-black/30 backdrop-blur-3xl border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)]", // Smoked Glass Header
    mobileMenuBg: isDarkMode ? "bg-[#050507] border-white/5" : "bg-[rgba(255,255,255,0.7)] backdrop-blur-xl backdrop-brightness-150 border-white/40 shadow-[inset_0_0_40px_rgba(255,255,255,0.95)]",

    // Cards
    cardBg: isDarkMode
      ? "bg-[#08080A]/80 backdrop-blur-2xl border-white/10 shadow-2xl"
      : "bg-[#08080A]/70 backdrop-blur-3xl border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.15)] hover:bg-[#08080A]/80 transition-all duration-500", // Dark Glass in Light Mode

    // Text
    textPrimary: isDarkMode ? "text-gray-200" : "text-gray-800",
    textSecondary: isDarkMode ? "text-gray-400" : "text-gray-500",
    textHead: isDarkMode ? "text-white" : "text-gray-900",
    cardText: "text-gray-200", // Always light text since cards are dark

    // Action Elements
    buttonGlass: isDarkMode
      ? "bg-white/5 hover:bg-white/10 border-white/5 text-gray-300 hover:text-white"
      : "bg-indigo-500/10 hover:bg-indigo-500/20 backdrop-blur-md border-indigo-500/20 text-indigo-700 hover:text-indigo-900",

    // Header Elements (Dark Glass in Light Mode)
    headerBtnBg: isDarkMode ? "bg-[#141416]" : "bg-black/30 backdrop-blur-xl border-white/20 shadow-lg hover:bg-black/40 text-white",

    // Accents in White Mode
    toggleBtn: isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-indigo-600",
  };

  // --- Helper: Dynamic Typography (Smart Text Sizing) ---
  const getDynamicTextSize = (htmlContent: string, mediaType: string) => {
    // Standard classes for long text/media posts (includes prose)
    const standardClasses = `text-lg ${theme.cardText} leading-relaxed font-medium prose prose-invert max-w-none prose-p:my-1 prose-strong:text-white prose-a:text-blue-400`;

    // If post has media (image/video/audio), always use standard text size
    if (mediaType !== 'none' || !htmlContent) return standardClasses;

    const textLength = stripHtml(htmlContent).trim().length;

    // Smart Scaling Logic (Like Facebook/Instagram)
    if (textLength < 80) return "text-2xl md:text-3xl font-bold leading-tight text-white tracking-tight";
    if (textLength < 160) return "text-xl md:text-2xl font-semibold leading-snug text-gray-100 tracking-tight";

    // Default / Long Text
    return standardClasses;
  };

  // --- Debate Action Logic (Popup + Focus) ---
  const [showActionPopup, setShowActionPopup] = useState(false);
  const [editorFocusTrigger, setEditorFocusTrigger] = useState(0);
  const postsTopRef = useRef<HTMLDivElement>(null); // Ref para início do feed

  // --- NAVEGAÇÃO NATIVA (Voltar/Swipe fecha Modais & BLOQUEIA SAÍDA) ---
  useEffect(() => {
    // 1. Garantir estado inicial (Root) para travar saída
    if (!window.history.state) {
      window.history.pushState({ screen: 'feed' }, document.title);
    }
  }, []);

  // 2. Monitorar aberturas de modal para criar histórico
  useEffect(() => {
    if (isMenuOpen || isDebateOpen || selectedEvent || showActionPopup) {
      window.history.pushState({ modal: true }, document.title);
    }
  }, [isMenuOpen, isDebateOpen, selectedEvent, showActionPopup]);

  // 3. Interceptar botão voltar (popstate)
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      // Prioridade de Fechamento (LIFO visual)
      let handled = false;
      if (showActionPopup) { setShowActionPopup(false); handled = true; }
      else if (activeMenuCommentId) { setActiveMenuCommentId(null); handled = true; }
      else if (openMenuId) { setOpenMenuId(null); handled = true; }
      else if (selectedEvent) { setSelectedEvent(null); handled = true; }
      else if (isDebateOpen) { setIsDebateOpen(false); handled = true; }
      else if (isMenuOpen) { setIsMenuOpen(false); handled = true; }

      // SE NADA FOI FECHADO (Significa que estamos na raiz e o usuário tentou sair)
      if (!handled) {
        // BLOQUEIA SAÍDA: Empurra o estado de volta para manter o usuário no App
        window.history.pushState({ screen: 'feed' }, document.title);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [showActionPopup, activeMenuCommentId, openMenuId, selectedEvent, isDebateOpen, isMenuOpen]);

  const handleDebateAction = () => {
    setShowActionPopup(true);
    setTimeout(() => {
      setShowActionPopup(false);
      setEditorFocusTrigger(Date.now());
    }, 1500);
  };

  const [activeDebatePost, setActiveDebatePost] = useState<Post | null>(null);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null); // New State for Threading

  const [debateComments, setDebateComments] = useState<any[]>([
    {
      id: 'mock-1',
      userId: 'user-roberto',
      author: { name: 'Roberto Alves', avatar: 'https://i.pravatar.cc/150?img=15' },
      content: 'Poderia aprofundar a relação entre a sinalética mencionada e o acoplamento áurico?',
      timeAgo: '2min'
    },
    {
      id: 'mock-2',
      userId: 'author-mock-id', // Placeholder, will be matched dynamically
      author: { name: 'Douglas Rocha', avatar: 'https://d363e3cb0fedde3cc603722077e49900.cdn.bubble.io/f1768342953899x415168906544139000/5.png?_gl=1*9ruv5n*_gcl_au*MTczMzAyMTYxMC4xNzY2Mzg0MjQ0*_ga*OTYzNzc1MDE2LjE3MjQzNzE3ODg.*_ga_BFPVR2DEE2*czE3Njg0MzQ4MzEkbzQ2JGcxJHQxNzY4NDM0ODU2JGozNSRsMCRoMA..' },
      content: 'Exatamente, Roberto. A sinalética funciona como um pré-aviso do acoplamento, permitindo o ajuste fino das energias.',
      timeAgo: 'Agora'
    }
  ]);

  // Reset/Init comments when opening a new debate
  useEffect(() => {
    if (activeDebatePost) {
      // Atualiza o ID do autor no mock para bater com o post atual e ativar o estilo de Autoridade
      setDebateComments(prev => prev.map(c => c.id === 'mock-2' ? { ...c, userId: activeDebatePost.author.name === c.author.name ? activeDebatePost.userId : c.userId } : c));
    }
  }, [activeDebatePost]);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Simulação de check de administrador (Normalmente viria do contexto global de autenticação)
  // Como definido em App.tsx, o usuário principal é "Douglas L. Rocha"
  const isAdmin = true; // Simulado como Admin



  // Imagens 3D Metálicas/Prateadas para os Ícones (Estilo Apple/Glass)
  // Imagens 3D Metálicas/Prateadas (Sérias e Profissionais)
  // Imagens 3D Conceituais Baseadas no Feedback (Chat, Livro, Perfil, Cérebro)
  const MENU_ITEMS = [
    {
      id: 'feed',
      label: 'Início',
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/7256/7256226.png', // 3D Chat Bubbles (Início)
      active: true,
      screen: 'feed'
    },
    {
      id: 'holoteca',
      label: 'Holoteca',
      iconUrl: 'https://cdn-icons-png.freepik.com/512/10613/10613991.png',
      screen: 'holoteca'
    },
    {
      id: 'profile',
      label: 'Você',
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/10174/10174277.png',
      screen: 'public-profile'
    },
    ...(isAdmin ? [{
      id: 'cockpit',
      label: 'Cockpit OS',
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/2905/2905086.png', // 3D Brain (Intelligence/Admin)
      screen: 'cockpit',
      admin: true
    }] : [])
  ];

  const feedContainerRef = useRef<HTMLDivElement>(null);

  // Rastreamento de posições recentes para evitar sobreposição (Anti-Collision System)
  const recentPositionsRef = useRef<{ top: number, left: number }[]>([]);

  // --- Lógica do Radar "Vivo" com Distribuição Inteligente (Smart Scattering) ---
  useEffect(() => {
    const interval = setInterval(() => {
      const isMobile = window.innerWidth < 768;
      const randomBaseEvent = EVENT_POOL[Math.floor(Math.random() * EVENT_POOL.length)];

      // Definição de zonas seguras
      // Mobile: Foco em evitar cortes laterais e garantir legibilidade vertical
      // Desktop: Liberdade total na "nuvem"

      let bestPosition = { top: 50, left: 50 };
      let maxDistance = -1;

      // Tentativa de encontrar o buraco mais vazio (Best Fit Algorithm)
      // Gera 5 candidatos e escolhe o que estiver mais longe dos últimos cards
      const attempts = 10;

      for (let i = 0; i < attempts; i++) {
        let candidateTop, candidateLeft;

        if (isMobile) {
          // MOBILE SMART LOGIC:
          // Dividimos a tela verticalmente para garantir uso total da altura
          // Limitamos o horizontal para a esquerda (5-45%) para evitar cortes na direita
          candidateTop = 15 + Math.random() * 65; // 15% a 80% (toda altura util)
          candidateLeft = 5 + Math.random() * 40; // 5% a 45% (Mantém na esquerda/centro)
        } else {
          // DESKTOP LOGIC:
          candidateTop = 15 + Math.random() * 50;
          candidateLeft = 20 + Math.random() * 60;
        }

        // Se não houver histórico, aceita o primeiro
        if (recentPositionsRef.current.length === 0) {
          bestPosition = { top: candidateTop, left: candidateLeft };
          break;
        }

        // Calcula a menor distância deste candidato para qualquer card recente
        let minDistanceToAny = 1000;
        for (const pos of recentPositionsRef.current) {
          // Distância Euclidiana simplificada
          const d = Math.sqrt(Math.pow(candidateTop - pos.top, 2) + Math.pow(candidateLeft - pos.left, 2));
          if (d < minDistanceToAny) minDistanceToAny = d;
        }

        // Se este candidato está mais isolado que o melhor anterior, ele vence
        if (minDistanceToAny > maxDistance) {
          maxDistance = minDistanceToAny;
          bestPosition = { top: candidateTop, left: candidateLeft };
        }
      }

      // Atualiza histórico (Mantém os últimos 5 para referência)
      recentPositionsRef.current = [...recentPositionsRef.current.slice(-4), bestPosition];

      const newEvent: AIEvent = {
        ...randomBaseEvent,
        id: Math.random().toString(36).substr(2, 9),
        top: `${bestPosition.top}%`,
        left: `${bestPosition.left}%`,
        scale: isMobile ? 0.85 + Math.random() * 0.15 : 0.8 + Math.random() * 0.4, // Menos variação de escala no mobile
        delay: Math.random() * 1.5
      };

      setLiveEvents(prev => [...prev.slice(-12), newEvent]);
    }, 2000); // Intervalo levemente maior para dar tempo de leitura

    return () => clearInterval(interval);
  }, []);

  const handleLike = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updatedPost: Post | null = null;
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        updatedPost = {
          ...post,
          isLiked: !post.isLiked,
          stats: {
            ...post.stats,
            likes: post.isLiked ? post.stats.likes - 1 : post.stats.likes + 1
          }
        };
        return updatedPost;
      }
      return post;
    }));

    if (updatedPost) {
      await supabase
        .from('posts')
        .update({
          is_liked: (updatedPost as Post).isLiked,
          stats: (updatedPost as Post).stats
        })
        .eq('id', postId);
    }
  };

  const handleMenuClick = (item: any) => {
    if (item.screen && onNavigate) {
      onNavigate(item.screen);
    }
    setIsMenuOpen(false);
  };

  return (
    <div className={`${theme.mainBg} ${theme.textPrimary} font-body antialiased h-screen w-full flex flex-col overflow-hidden transition-colors duration-500`}>

      {/* MOBILE MENU DRAWER - ELITE V2 DESIGN */}
      <div
        className={`fixed inset-0 z-[500] transition-all duration-500 lg:hidden ${isMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>

        {/* Painel Principal */}
        <aside className={`absolute left-0 top-0 bottom-0 w-[85%] max-w-sm ${theme.mobileMenuBg} border-r transition-transform duration-500 cubic-bezier(0.2, 0.8, 0.2, 1) flex flex-col z-[1000] overflow-hidden ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>

          {/* Noise Texture (Light Mode Relief) */}
          {!isDarkMode && (
            <div className="absolute inset-0 opacity-[0.15] pointer-events-none mix-blend-overlay z-0"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
            </div>
          )}

          {/* Background Ambient Glows */}
          <div className={`absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none animate-pulse-slow ${isDarkMode ? 'bg-cyan-900/10' : 'bg-cyan-300/20'}`}></div>
          <div className={`absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full blur-[80px] pointer-events-none animate-pulse-slow ${isDarkMode ? 'bg-rose-900/10' : 'bg-rose-300/20'}`} style={{ animationDelay: '1.5s' }}></div>

          <div className="flex flex-col h-full relative z-10 px-3 py-4">

            {/* Header */}
            <header className="flex justify-between items-center mb-2 shrink-0 relative group/header">
              <div className="flex items-center flex-1 pr-2">
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 transform hover:-translate-x-1 ${isDarkMode ? 'text-gray-300 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-black/5'}`}
                >
                  <span className="material-symbols-outlined text-[24px]">arrow_back</span>
                </button>
                <div className={`h-[1px] flex-1 ml-3 transition-colors duration-500 ${isDarkMode ? 'bg-gradient-to-r from-white/40 via-white/10 to-transparent group-hover/header:from-white/60' : 'bg-gradient-to-r from-gray-900/80 via-gray-800/40 to-transparent group-hover/header:from-black'}`}></div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 group border ${isDarkMode ? 'bg-white/5 hover:bg-white/10 border-white/5 hover:border-white/20' : 'bg-black/5 hover:bg-black/10 border-black/5 hover:border-black/10'}`}
                  title={isDarkMode ? "Modo Pastel" : "Modo Escuro"}
                >
                  <span className={`material-symbols-outlined transition-colors text-[20px] ${isDarkMode ? 'text-gray-400 group-hover:text-yellow-400' : 'text-blue-900 group-hover:text-blue-800'}`}>
                    {isDarkMode ? 'light_mode' : 'dark_mode'}
                  </span>
                </button>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 group border ${isDarkMode ? 'bg-white/5 hover:bg-white/10 border-white/5 hover:border-white/20' : 'bg-black/5 hover:bg-black/10 border-black/5 hover:border-black/10'}`}
                >
                  <span className={`material-symbols-outlined transition-colors text-[20px] ${isDarkMode ? 'text-gray-400 group-hover:text-white' : 'text-gray-600 group-hover:text-black'}`}>close</span>
                </button>
              </div>
            </header>

            {/* Scroll Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pb-6">



              {/* 1. PROFILE SUPER CARD (Animated Border) */}
              <div
                onClick={() => handleMenuClick(MENU_ITEMS.find(i => i.id === 'profile'))}
                className="relative w-full rounded-[2.5rem] overflow-hidden group transition-all duration-500 hover:shadow-cyan-900/20 cursor-pointer"
              >
                <div className="absolute -inset-[2px] rounded-[2.6rem] bg-gradient-to-br from-white/20 via-transparent to-cyan-500/20 opacity-70 blur-sm"></div>
                <div className="absolute -inset-[1px] rounded-[2.55rem] bg-gradient-to-br from-white/10 via-transparent to-cyan-500/10 z-0"></div>

                <div className="content-wrapper w-full h-full relative z-10 textured-bg rounded-[2.5rem] border border-white/5">
                  <div className="absolute inset-0 bg-[#050507] rounded-[2.5rem] overflow-hidden z-0">
                    <img src="https://images.unsplash.com/photo-1591677112893-6105b5827004?q=80&w=1000&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-normal" alt="Abstract Background" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#121214]/60 to-[#121214]"></div>
                  </div>

                  <div className="p-8 pb-8 flex flex-col items-center text-center space-y-5 relative z-10">
                    <div className="relative mt-2">
                      <div className="p-[4px] rounded-[2rem] bg-gradient-to-br from-white/10 to-black relative">
                        <div className="absolute inset-0 rounded-[2rem] overflow-hidden">
                          <div className="absolute inset-[-50%] bg-[conic-gradient(transparent,rgba(255,255,255,0.3),transparent)] animate-spin-very-slow"></div>
                        </div>
                        <div className="relative z-10 w-48 h-56 rounded-[1.8rem] overflow-hidden bg-gray-800 border border-white/5">
                          <img alt="Douglas Rocha" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-in-out" src="https://d363e3cb0fedde3cc603722077e49900.cdn.bubble.io/f1768342953899x415168906544139000/5.png?_gl=1*9ruv5n*_gcl_au*MTczMzAyMTYxMC4xNzY2Mzg0MjQ0*_ga*OTYzNzc1MDE2LjE3MjQzNzE3ODg.*_ga_BFPVR2DEE2*czE3Njg0MzQ4MzEkbzQ2JGcxJHQxNzY4NDM0ODU2JGozNSRsMCRoMA.." />
                          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none"></div>
                        </div>
                      </div>
                      <div className="absolute -bottom-3 inset-x-0 flex justify-center z-30">
                        <div className="flex items-center gap-2 bg-black/80 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-md shadow-lg ring-1 ring-white/5">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-[pulse_2s_ease-in-out_infinite] shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
                          <span className="text-[10px] text-gray-200 font-bold uppercase tracking-wider">Pesquisador(a)</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 w-full flex flex-col items-center">
                      <div className="space-y-1">
                        <h2 className="text-[28px] font-bold text-white tracking-tight drop-shadow-2xl bg-clip-text text-transparent bg-gradient-to-br from-white via-gray-100 to-gray-400">Douglas Rocha</h2>
                        <div className="flex items-center justify-center gap-1.5 text-gray-400/80">
                          <span className="material-symbols-outlined text-[14px]">location_on</span>
                          <span className="text-[10px] font-semibold tracking-widest uppercase">Cognópolis, Foz</span>
                        </div>
                      </div>
                      <p className="text-[12px] text-gray-400 leading-relaxed max-w-[90%] font-medium tracking-wide">
                        Pesquisador da Consciência, focado em cosmoética e interassistencialidade.
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-3 mt-2 w-full">
                        <div className="px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center gap-1.5 hover:bg-cyan-500/20 transition-colors duration-300 cursor-default shadow-[0_0_10px_rgba(34,211,238,0.1)]">
                          <span className="material-symbols-outlined text-[14px] text-cyan-400 filled">verified</span>
                          <span className="text-[9px] font-bold tracking-wider text-cyan-100 uppercase">Voluntário</span>
                        </div>
                        <div className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center gap-1.5 hover:bg-amber-500/20 transition-colors duration-300 cursor-default shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                          <span className="material-symbols-outlined text-[14px] text-amber-500 filled">star</span>
                          <span className="text-[9px] font-bold tracking-wider text-amber-100 uppercase">Tenepessista</span>
                        </div>
                      </div>
                    </div>

                    <button className={`w-full py-4 rounded-2xl ${theme.buttonGlass} border transition-all duration-300 flex items-center justify-center gap-2 group/btn relative overflow-hidden shadow-inner`}>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000"></div>
                      <span className="text-[11px] font-bold text-gray-300 group-hover/btn:text-white uppercase tracking-[0.1em] z-10">Holobiografia</span>
                      <span className="material-symbols-outlined text-[16px] text-gray-400 group-hover/btn:text-white transition-colors z-10 group-hover/btn:translate-x-1 duration-300">arrow_outward</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 1B. MATCHES CARD (Mobile) */}
              <div
                onClick={() => { onNavigate && onNavigate('matches'); setIsMenuOpen(false); }}
                className="relative w-full h-32 rounded-[2rem] overflow-hidden group border border-white/10 shadow-lg bg-gradient-to-br from-indigo-950/40 via-[#0A0A0C] to-black cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/10 to-transparent pointer-events-none"></div>
                <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <h3 className="text-xl font-bold text-white tracking-tight drop-shadow-md">Metchs</h3>
                      <p className="text-[10px] text-indigo-400 uppercase tracking-widest mt-1 font-bold font-mono">Metchs de Projetos</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-lg">
                      <span className="material-symbols-outlined text-lg">favorite</span>
                    </div>
                  </div>
                  <div className="mt-auto">
                    <span className="text-[10px] text-gray-500">Conecte-se com afinidades</span>
                  </div>
                </div>
              </div>

              {/* 1C. CHAT CARD (Mobile) */}
              <div
                onClick={() => { onNavigate && onNavigate('chat'); setIsMenuOpen(false); }}
                className="relative w-full h-32 rounded-[2rem] overflow-hidden group border border-white/10 shadow-lg bg-gradient-to-br from-cyan-950/40 via-[#0A0A0C] to-black cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/10 to-transparent pointer-events-none"></div>
                <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <h3 className="text-xl font-bold text-white tracking-tight drop-shadow-md">Conversas</h3>
                      <p className="text-[10px] text-cyan-400 uppercase tracking-widest mt-1 font-bold font-mono">Chat e Mensagens</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-lg">
                      <span className="material-symbols-outlined text-lg">forum</span>
                    </div>
                  </div>
                  <div className="mt-auto">
                    <span className="text-[10px] text-gray-500">Mural de debates diretos</span>
                  </div>
                </div>
              </div>

              {/* 2. HOLOTECA CARD */}
              <div
                onClick={() => handleMenuClick(MENU_ITEMS.find(i => i.id === 'holoteca'))}
                className="relative w-full h-80 rounded-[2rem] overflow-hidden group border border-white/10 shadow-lg bg-[#121214] cursor-pointer hover:border-white/30 transition-all duration-500 ease-out"
              >
                <div className="absolute inset-0 overflow-hidden rounded-[2rem]">
                  <img alt="Holoteca" className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-normal group-hover:scale-110 transition-transform duration-[3000ms] ease-in-out will-change-transform animate-deep-breathing" src="https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1600&q=80" />
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-900/30 via-[#121214]/40 to-transparent z-10 pointer-events-none"></div>
                </div>
                <div className="absolute inset-0 p-7 flex flex-col justify-between z-10">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <h3 className="text-2xl font-bold text-white tracking-tight drop-shadow-md group-hover:translate-x-1 transition-transform duration-300">Holoteca</h3>
                      <p className="text-[10px] text-gray-300 uppercase tracking-widest mt-1 opacity-80 font-medium">Conteúdo</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[9px] font-mono text-gray-500 border border-white/5 rounded px-2 py-0.5 bg-black/30">REF: 8492-AX</span>
                        <span className="text-[9px] font-mono text-gray-500 border border-white/5 rounded px-2 py-0.5 bg-black/30">V.4.2</span>
                      </div>
                    </div>
                    <div className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-lg group-hover:bg-white group-hover:text-black transition-all duration-300">
                      <span className="material-symbols-outlined text-xl transform -rotate-45 group-hover:rotate-0 transition-transform duration-300">arrow_forward</span>
                    </div>
                  </div>
                  <div className="mt-auto">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-3 transition-all duration-300 group-hover:space-x-[-8px]">
                        <img className="w-10 h-10 rounded-full border-[2px] border-[#18181b] object-cover ring-1 ring-white/10" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCG5Z60NQmzD5uoHD3vcj4D35Zj7VhPfg7Y57b5LLFwTeKu6q2nh_nOdGSVuIr5OiAFDborXzMj5knXhWtvmWeq2xdoqI65pzLwafjye_fvD7HYDVrylw_I65tx9vTZpS3BuZLerXDSJcaedUspGVvTORrmKr1zis4-rR7E9jUfbsT5sohGljX5oT7SOe9hPz6kwxzX_E5NcHA8cRvluETXx7bjlPonAFKaXwXSVqbBlVpSdANG_jKpqaTc49y6LWYjt2FJuNIYfOA" alt="U1" />
                        <img className="w-10 h-10 rounded-full border-[2px] border-[#18181b] object-cover ring-1 ring-white/10" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbTuSySdVSM7jnlXjnNfeT8t3_r232znhQkPtQQdNQPII_EzQqDkDl2WyMxadneBfrvHcSioPbu_acrpd0L1W1EUjyKglsAx8wILnnhGb0eH547p6AIgZSsz0uArRCKlnRHLCECT-HJWawJTKop7oLVctzhFwL99ovXkH62GBQuGWorbRNoTQlTKceIsadNpZff4ZasU-fjRNmQNWAnFjzlYeTkPI4t_TCKlwKLw-beSplIZYxG11r2doYAGNRzcNs0A5Zsy3vmQA" alt="U2" />
                        <img className="w-10 h-10 rounded-full border-[2px] border-[#18181b] object-cover ring-1 ring-white/10" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFXq_SOEmNfNxIQxmozNYhF_RhWgi3L-dA_G0Lq8nTHioR6hFonNCc6jWOAyABVvCfMSDIoixU2kVHDZdXvq61sdJFxG4NygeTnbW9NMgQljQRoZvwbK8zyAgcD1lbRzzOP7gl8p_xIVEoDYnJ3Cu8qW511FcmyKQWCIOXCss6H_3JuFq8xaMszZ26nMQNB2SX0V-xYB_p-k6VQbUJHBP7pdnyEz91nbQfFTm8FKJYiWr1XMVMDjh9PZBm9LKlwarUUEsFmxrgzHQ" alt="U3" />
                      </div>
                      <div className="h-10 px-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                        <span className="text-xs font-bold text-white">+42</span>
                      </div>
                      <div className="flex items-center gap-1.5 ml-1 bg-black/60 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md shadow-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-[9px] text-gray-200 font-bold uppercase tracking-wide">Estudando na Holoteca</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. CÉREBRO CARD (Active Flow) */}
              <div
                onClick={() => handleMenuClick(MENU_ITEMS.find(i => i.id === 'cerebro') || MENU_ITEMS.find(i => i.id === 'cockpit'))}
                className="relative w-full h-48 rounded-[2rem] overflow-hidden group border border-white/10 shadow-lg bg-gradient-to-br from-gray-700/30 via-[#121214] to-black cursor-pointer"
              >
                <div className="absolute inset-0 overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay grayscale" alt="Dark Earth" />
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-900/60 via-black/90 to-black/40"></div>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-[200%] w-full animate-scan opacity-10 mix-blend-overlay"></div>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent animate-loading-bar opacity-0 group-hover:opacity-30 transition-opacity"></div>
                </div>
                <div className="absolute inset-0 p-7 flex flex-col justify-between z-10">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <span className="absolute inset-0 rounded-full bg-white/10 blur-md animate-pulse-fast"></span>
                          <img src="https://cdn-icons-png.flaticon.com/512/6723/6723876.png" className="w-7 h-7 object-contain animate-[pulse_4s_ease-in-out_infinite] relative z-10 opacity-90" alt="Cérebro" />
                        </div>
                        <h3 className="text-2xl font-bold text-white tracking-tight drop-shadow-md group-hover:text-gray-200 transition-colors">Cérebro</h3>
                      </div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">Dinâmica da Comunidade</p>
                    </div>
                    <div className="w-11 h-11 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white shadow-lg group-hover:bg-white/10 group-hover:text-white group-hover:border-white/30 transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                      <img src="https://d363e3cb0fedde3cc603722077e49900.cdn.bubble.io/f1766384422562x463430689164383360/logo%20da%20Adicionares%20Global%20Inc..png" className="w-8 h-8 object-contain opacity-100" alt="Fluxo" />
                    </div>
                  </div>
                  <div className="mt-auto">
                    <div className="flex items-center gap-3">
                      <div className="h-9 px-4 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center gap-2 group-hover:bg-white/10 transition-colors">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-pulse"></span>
                        <span className="text-[10px] font-bold text-gray-200 uppercase tracking-wider">Fluxo Pensênico</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. DASHBOARD CARD (Conditional) */}
              {isAdmin && (
                <div
                  onClick={() => handleMenuClick(MENU_ITEMS.find(i => i.id === 'cockpit'))}
                  className="relative w-full h-28 rounded-[1.5rem] overflow-hidden group border border-white/5 bg-[#0A0A0C] cursor-pointer hover:border-rose-500/30 transition-colors duration-300"
                >
                  <img alt="Data" className="absolute inset-0 w-full h-full object-cover opacity-10 mix-blend-color-dodge group-hover:opacity-20 transition-opacity duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAuZLSfNTGN1ZOldvyri-BQwMVI-2pl5RMuvlLWSPRblFzF6bVHGM-eV4AdKf7o40zKo0BaIKPyL62-Vf6ySMeeXEOWS1fzMjLbYk_woOMIwuGqKIp2jeUqiH_IQ0btt_15AdyGJnM-Mtvy7yDaaUI6unRjeylPZIodgVFc9IIK5pzwtnBhV5Ys70dlqp-RcMO5541LvL5yBG1GLk_j0s9tvKISHKKTnUz85pjZaogmljjQiUWZgzKERqW86L1gcFI-CIpjk9dxtE0" />
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-900/20 to-transparent"></div>
                  <div className="absolute inset-0 px-7 flex items-center justify-between z-10">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.1)] group-hover:shadow-[0_0_30px_rgba(244,63,94,0.25)] group-hover:bg-rose-500/20 group-hover:scale-105 transition-all duration-300">
                        <span className="material-symbols-outlined text-rose-400 text-[26px]">dashboard</span>
                      </div>
                      <div className="flex flex-col">
                        <h3 className="text-lg font-bold text-white group-hover:text-rose-100 transition-colors">Painel Evolutivo</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-[2px] rounded bg-rose-500/20 border border-rose-500/30 text-[9px] font-bold text-rose-300 uppercase tracking-wider shadow-sm">Epicon</span>
                        </div>
                      </div>
                    </div>
                    <button className="w-10 h-10 flex items-center justify-center text-gray-500 group-hover:text-white transition-colors transform group-hover:translate-x-1 duration-300 bg-white/0 hover:bg-white/5 rounded-full">
                      <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 5. AMPARO (Botão Estilizado Silver Metallic - Slim) */}
              <div className="px-2 mt-4 mb-2">
                <button
                  onClick={triggerAmparoAction}
                  className="relative w-full h-14 rounded-full bg-[#050505] border border-white/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] p-1 flex items-center justify-start group overflow-hidden transition-all duration-300 active:border-white/20"
                >
                  {/* Track Background Text */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 ml-10">
                    <span className="text-[10px] font-black tracking-[0.25em] text-gray-600 uppercase animate-pulse">
                      Deslize para Amparo
                    </span>
                    <span className="material-symbols-outlined text-[14px] text-gray-700 ml-2 animate-[bounce-right_1s_infinite]">chevron_right</span>
                  </div>

                  {/* Knob (Círculo Deslizante) */}
                  <div className={`relative w-12 h-12 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.15)] flex items-center justify-center z-10 transform transition-transform duration-500 cubic-bezier(0.2, 0.8, 0.2, 1) group-hover:scale-105 group-active:scale-95 bg-gradient-to-br from-white via-gray-200 to-gray-400 ${isAmparoActive ? 'translate-x-[calc(100cqw-55px)]' : 'group-active:translate-x-[calc(100cqw-55px)]'}`}>
                    <span className="material-symbols-outlined text-[22px] text-black">volunteer_activism</span>
                    {/* Inner highlight */}
                    <div className="absolute top-1 left-2 w-4 h-2 bg-white/80 blur-[2px] rounded-full"></div>
                  </div>

                  {/* Feedback Flash on Click */}
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-active:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </button>
              </div>

              <div className="flex flex-col items-center gap-3 pt-6 pb-2 opacity-60">
                <div className="flex gap-4 text-[9px] text-gray-500 uppercase font-bold tracking-widest">
                  <a className="hover:text-white transition-colors duration-200" href="#">Termos</a>
                  <span className="text-gray-700 mx-1">•</span>
                  <a className="hover:text-white transition-colors duration-200" href="#">Privacidade</a>
                </div>
                <span className="text-[9px] text-gray-600 font-medium tracking-tight">© 2026 Adicionares Global Inc.</span>
              </div>
            </div> {/* Fecha Scroll Content */}

          </div> {/* Fecha Container Main (Dentro do Aside) */}

        </aside>
      </div >

      {/* MODAL DE DETALHES DO EVENTO (POPUP) */}
      {
        selectedEvent && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 animate-fade-in">
            {/* Backdrop Blur */}
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
              onClick={() => setSelectedEvent(null)}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-[#0A0A0C] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-fade-in-up">
              {/* Header Visual */}
              <div className="h-24 w-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-black/40"></div>
                <img src={selectedEvent.userAvatar} className="w-full h-full object-cover opacity-30 blur-sm" alt="bg" />
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 backdrop-blur border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all z-20"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              {/* Avatar Flutuante */}
              <div className="relative px-6 -mt-10 flex justify-center mb-2">
                <div className="p-1 rounded-full bg-[#0A0A0C] border border-white/10 shadow-xl relative group">
                  <div className="absolute inset-0 rounded-full animate-spin-slow opacity-50 bg-[conic-gradient(transparent,var(--tw-gradient-from),transparent)]" style={{ '--tw-gradient-from': selectedEvent.color } as any}></div>
                  <img src={selectedEvent.userAvatar} className="w-20 h-20 rounded-full object-cover relative z-10" alt="Avatar" />
                  <div className="absolute bottom-0 right-0 bg-[#0A0A0C] rounded-full p-1 border border-white/10 z-20">
                    <span className="material-symbols-outlined text-[16px]" style={{ color: selectedEvent.color }}>{selectedEvent.icon}</span>
                  </div>
                </div>
              </div>

              {/* Conteúdo Info */}
              <div className="px-8 pb-8 flex flex-col items-center text-center space-y-4">

                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-white tracking-tight drop-shadow-2xl bg-clip-text text-transparent bg-gradient-to-br from-white via-gray-100 to-gray-400">{selectedEvent.user}</h3>
                  <div className="flex items-center justify-center gap-1.5 text-gray-400/80">
                    <span className="material-symbols-outlined text-[14px]">location_on</span>
                    <span className="text-[10px] font-semibold tracking-widest uppercase">Cognópolis, Foz</span>
                  </div>
                </div>

                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                <div className="space-y-3 w-full">
                  <h4 className="text-sm font-bold text-gray-200 uppercase tracking-wide">{selectedEvent.action}</h4>
                  <p className="text-sm text-gray-400 leading-relaxed font-medium">"{selectedEvent.value}"</p>

                  <div className="flex flex-wrap items-center justify-center gap-2 mt-2 w-full">
                    <div className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center gap-1.5 hover:bg-cyan-500/20 transition-colors duration-300 cursor-default shadow-[0_0_10px_rgba(34,211,238,0.1)]">
                      <span className="material-symbols-outlined text-[12px] text-cyan-400 filled">verified</span>
                      <span className="text-[9px] font-bold tracking-wider text-cyan-100 uppercase">Voluntário</span>
                    </div>
                    <div className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center gap-1.5 hover:bg-amber-500/20 transition-colors duration-300 cursor-default shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                      <span className="material-symbols-outlined text-[12px] text-amber-500 filled">star</span>
                      <span className="text-[9px] font-bold tracking-wider text-amber-100 uppercase">Tenepessista</span>
                    </div>
                  </div>
                </div>

                <div className="w-full pt-2">
                  <button className="w-full py-3 rounded-xl bg-blue-600/90 hover:bg-blue-500 hover:scale-[1.02] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] border border-blue-400/30 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                    Conectar
                  </button>
                </div>

              </div>
            </div>
          </div>
        )
      }

      {/* BACKGROUND CÓSMICO IMERSIVO */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1600&q=90"
          className="w-full h-full object-cover opacity-30 scale-110"
          alt="Cosmos"
        />
      </div>
      {/* HEADER GLOBAL */}
      {/* INTELLIGENT COMMAND CENTER HEADER (FLOATING) */}
      <header className="fixed top-0 left-0 w-full z-[300] flex justify-center pt-4 lg:pt-6 pointer-events-none px-4 transition-all duration-500">

        {/* Main Floating Container (Intelligent Island) */}
        <div className={`pointer-events-auto ${theme.headerBg} backdrop-blur-2xl border rounded-[2.5rem] p-2 flex items-center gap-2 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] max-w-[95vw] lg:max-w-[850px] w-full transition-all hover:bg-opacity-95 hover:shadow-[0_30px_70px_-10px_rgba(0,0,0,0.1)] group/header relative overflow-hidden duration-500`}>

          {/* Ambient Glow Gradient */}
          <div className="absolute -top-[50%] left-1/2 -translate-x-1/2 w-[80%] h-[200%] bg-gradient-to-b from-blue-500/10 via-purple-500/5 to-transparent blur-[60px] rounded-full pointer-events-none opacity-50"></div>

          {/* 1. MODULE: BRAND & SYSTEM STATUS */}
          <div
            onClick={() => onNavigate && onNavigate('feed')}
            className={`relative overflow-hidden flex items-center gap-3 pl-3 pr-4 md:pl-5 md:pr-6 py-2 ${theme.headerBtnBg} rounded-[2rem] border border-white/5 cursor-pointer transition-all group/brand shrink-0 shadow-inner`}
          >
            {/* Vinheta (Vignette Effect) */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_0%,rgba(0,0,0,0.5)_100%)] pointer-events-none"></div>

            <div className="relative z-10">
              <img
                src="https://d363e3cb0fedde3cc603722077e49900.cdn.bubble.io/f1766384422562x463430689164383360/logo%20da%20Adicionares%20Global%20Inc..png"
                className="w-9 h-9 md:w-10 md:h-10 scale-[1.6] md:scale-100 object-contain opacity-100 transition-opacity drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                alt="Logo"
              />
            </div>
            <div className="hidden md:flex flex-col justify-center relative z-10">
              <span className="text-[10px] font-bold text-white tracking-widest leading-none font-display">ADICIONARES</span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75 duration-1000"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500"></span>
                </span>
                <span className="text-[8px] text-indigo-400/80 font-mono uppercase tracking-wider leading-none">COLLEGE INC.</span>
              </div>
            </div>
          </div>

          {/* 2. MODULE: INTELLIGENT NAVIGATION (Dynamic Pill Selector) */}
          <nav className={`flex-1 ${isDarkMode ? 'bg-black/40' : 'bg-gradient-to-b from-black/60 to-black/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_4px_10px_rgba(0,0,0,0.2)]'} rounded-[2rem] border border-white/10 h-12 flex items-center justify-center relative overflow-hidden px-1 mx-1 lg:mx-2`}>
            <div className="flex items-center gap-1 w-full justify-center px-1">
              {MENU_ITEMS.filter(i => !i.admin && i.id !== 'holoteca').map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate && onNavigate(item.id === 'feed' ? 'holoteca' : item.screen as any)}
                  className={`relative px-2 md:px-4 lg:px-6 py-2 rounded-l-[1.2rem] rounded-r-[1.5rem] lg:rounded-[1.5rem] flex items-center justify-center gap-2 transition-all duration-300 group/nav-item shrink-0 ${item.active
                    ? 'bg-gradient-to-br from-[#525252]/30 to-[#262626]/30 text-white shadow-[0_0_20px_rgba(0,0,0,0.2)] border border-white/10 font-bold'
                    : 'text-gray-500 hover:text-white hover:bg-white/5 font-medium'
                    }`}
                >
                  <span className={`material-symbols-outlined text-[18px] ${item.active ? 'filled' : ''} ${(item.id === 'holoteca' || item.id === 'feed') ? 'animate-[pulse_3s_ease-in-out_infinite] text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]' : ''}`}>
                    {item.id === 'feed' ? 'library_books' : item.id === 'holoteca' ? 'library_books' : 'person'}
                  </span>

                  <span className={`text-[10px] uppercase tracking-widest ${item.id === 'feed' ? '' : 'hidden sm:block'} ${(item.id === 'holoteca' || item.id === 'feed') ? 'bg-gradient-to-r from-gray-400 via-white to-gray-400 bg-clip-text text-transparent animate-text-shimmer font-bold drop-shadow-[0_0_2px_rgba(255,255,255,0.5)]' : ''}`}>
                    {item.id === 'feed' ? 'HOLOTECA' : item.label}
                  </span>
                </button>
              ))}
            </div>
          </nav>



          {/* 3. MODULE: USER & TOOLS */}
          <div className="flex items-center gap-2 shrink-0">

            {/* Grupo Button */}
            <button
              onClick={() => onNavigate && onNavigate('grupo')}
              className={`h-11 w-11 lg:w-auto lg:px-5 rounded-[2rem] ${theme.headerBtnBg} border border-white/5 flex items-center justify-center lg:justify-start gap-2 text-gray-400 hover:text-white hover:border-white/20 transition-all group/tool relative shadow-inner cursor-pointer`}
              title="Grupo"
            >
              <span className="material-symbols-outlined text-[20px] group-hover/tool:text-white transition-colors">grid_view</span>
              <span className="hidden lg:block text-[10px] uppercase tracking-wider bg-gradient-to-r from-gray-400 via-white to-gray-400 bg-clip-text text-transparent animate-text-shimmer font-bold drop-shadow-[0_0_2px_rgba(255,255,255,0.5)]">Grupo</span>
            </button>

            {/* Menu Toggle (Mobile) */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className={`lg:hidden w-11 h-11 rounded-[2rem] ${theme.headerBtnBg} border border-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-all active:scale-95`}
            >
              <span className="material-symbols-outlined">menu_open</span>
            </button>

            {/* Profile Capsule */}
            <div
              onClick={() => onNavigate && onNavigate('public-profile')}
              className={`hidden lg:flex items-center gap-3 pl-1.5 pr-5 py-1.5 ${theme.headerBtnBg} rounded-[2rem] border border-white/10 cursor-pointer hover:border-white/30 transition-all group/profile shadow-inner`}
            >
              <div className="w-8 h-8 rounded-full relative p-[1px] bg-gradient-to-tr from-gray-700 to-black">
                <img
                  src="https://d363e3cb0fedde3cc603722077e49900.cdn.bubble.io/f1768342953899x415168906544139000/5.png?_gl=1*9ruv5n*_gcl_au*MTczMzAyMTYxMC4xNzY2Mzg0MjQ0*_ga*OTYzNzc1MDE2LjE3MjQzNzE3ODg.*_ga_BFPVR2DEE2*czE3Njg0MzQ4MzEkbzQ2JGcxJHQxNzY4NDM0ODU2JGozNSRsMCRoMA.."
                  className="w-full h-full rounded-full object-cover border border-white/10"
                  alt="Profile"
                />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#121214] shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              </div>
              <div className="flex flex-col items-start gap-0.5">
                <span className="text-[10px] font-bold text-gray-300 group-hover/profile:text-white transition-colors leading-none">Douglas R.</span>
                <span className="text-[8px] text-gray-500 font-mono uppercase leading-none">Explorer</span>
              </div>
            </div>

          </div>

        </div>
      </header >



      {/* SIDEBAR ÚNICA ESQUERDA (DESKTOP) - HOVER EXPLOSION - ATUALIZADO V2 */}
      {/* Mantida a lógica, ajustada apenas a posição top para não colidir com o novo header */}
      <aside className="hidden lg:flex fixed left-6 top-1/2 -translate-y-1/2 z-[200] flex-col group/sidebar h-[300px] hover:top-0 hover:h-screen hover:translate-y-0 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]">

        {/* Área de Hover Invisível mas Expandida (Centralizada no repouso, expande no hover) */}
        <div className="relative h-full flex flex-col transition-all duration-300 w-[60px] hover:w-[260px]">

          {/* 1. ESTADO REPOUSO: BARRA VERTICAL "PILULA" (Some no Hover) */}
          <div
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
            className={`absolute left-0 top-0 bottom-0 w-[60px] flex flex-col items-center justify-center gap-6 ${isDarkMode ? 'bg-[#050505]/40 border-white/20' : 'bg-gradient-to-b from-black/60 via-black/70 to-black/80 border-white/30 shadow-[0_20px_50px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)]'} backdrop-blur-2xl border-[1px] rounded-full shadow-[0_20px_40px_-5px_rgba(0,0,0,0.8)] transition-all duration-500 ease-in-out group-hover/sidebar:opacity-0 pointer-events-auto z-50`}
          >

            {/* Single Expansion Arrow */}
            {/* Single Expansion Arrow - Premium Redesign (3D Sticker Style) */}
            <div className="w-12 h-12 flex items-center justify-center transition-all duration-500 group-hover/sidebar:scale-110">
              {/* 3D Visual Chevron SVG */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg group-hover/sidebar:translate-x-1 transition-transform duration-300">
                <defs>
                  <linearGradient id="arrowGradient" x1="8" y1="12" x2="16" y2="12" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#a3a3a3" />
                  </linearGradient>
                  <filter id="glow3d">
                    <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="rgba(0,0,0,0.5)" />
                  </filter>
                </defs>
                <path d="M9 18L15 12L9 6" stroke="url(#arrowGradient)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow3d)" />
              </svg>
            </div>

          </div>

          {/* 2. ESTADO ATIVO: CARDS FLUTUANTES (Aparecem no Hover) */}
          {/* Eles ocupam o espaço mas são invisíveis até o hover */}
          <div className="flex flex-col h-full w-[260px] pointer-events-none group-hover/sidebar:pointer-events-auto z-30 overflow-y-auto no-scrollbar space-y-4 pb-4 pl-1 pt-[120px]">

            {/* Fundo ambiental sutil que aparece junto */}
            <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-cyan-900/5 blur-[80px] pointer-events-none opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-700"></div>

            {/* 1. PROFILE SUPER CARD */}
            <div
              onClick={() => handleMenuClick(MENU_ITEMS.find(i => i.id === 'profile'))}
              className="relative w-full shrink-0 h-[380px] rounded-[2.5rem] overflow-hidden group/card cursor-pointer transform shadow-lg opacity-0 translate-x-[-20px] scale-95 transition-all duration-500 ease-out group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0 group-hover/sidebar:scale-100 delay-100 hover:scale-[1.02] hover:shadow-cyan-900/20"
            >
              <div className="absolute -inset-[2px] rounded-[2.6rem] bg-gradient-to-br from-white/20 via-transparent to-cyan-500/20 opacity-70 blur-sm"></div>
              <div className="absolute -inset-[1px] rounded-[2.55rem] bg-gradient-to-br from-white/10 via-transparent to-cyan-500/10 z-0"></div>

              <div className="content-wrapper w-full h-full relative z-10 textured-bg rounded-[2.5rem] border border-white/5">
                <div className="absolute inset-0 bg-[#050507] rounded-[2.5rem] overflow-hidden z-0">
                  <img src="https://images.unsplash.com/photo-1591677112893-6105b5827004?q=80&w=1000&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-normal" alt="Abstract Background" />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#121214]/60 to-[#121214]"></div>
                </div>

                <div className="p-6 flex flex-col items-center text-center space-y-4 relative z-10 mt-4">
                  <div className="relative mt-1">
                    <div className="p-[3px] rounded-[1.8rem] bg-gradient-to-br from-white/10 to-black shadow-lg relative">
                      <div className="absolute inset-0 rounded-[1.8rem] overflow-hidden">
                        <div className="absolute inset-[-50%] bg-[conic-gradient(transparent,rgba(255,255,255,0.3),transparent)] animate-spin-very-slow"></div>
                      </div>
                      <div className="relative z-10 w-32 h-40 rounded-[1.6rem] overflow-hidden bg-gray-800 border border-white/5">
                        <img alt="Douglas Rocha" className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-[1.5s] ease-in-out" src="https://d363e3cb0fedde3cc603722077e49900.cdn.bubble.io/f1768342953899x415168906544139000/5.png?_gl=1*9ruv5n*_gcl_au*MTczMzAyMTYxMC4xNzY2Mzg0MjQ0*_ga*OTYzNzc1MDE2LjE3MjQzNzE3ODg.*_ga_BFPVR2DEE2*czE3Njg0MzQ4MzEkbzQ2JGcxJHQxNzY4NDM0ODU2JGozNSRsMCRoMA.." />
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none"></div>
                      </div>
                    </div>
                    <div className="absolute -bottom-2 inset-x-0 flex justify-center z-30">
                      <div className="flex items-center gap-2 bg-black/80 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md shadow-lg ring-1 ring-white/5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-[pulse_2s_ease-in-out_infinite] shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
                        <span className="text-[9px] text-gray-200 font-bold uppercase tracking-wider">Pesquisador(a)</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 w-full flex flex-col items-center">
                    <div className="space-y-0.5">
                      <h2 className="text-2xl font-bold text-white tracking-tight drop-shadow-2xl bg-clip-text text-transparent bg-gradient-to-br from-white via-gray-100 to-gray-400">Douglas Rocha</h2>
                      <div className="flex items-center justify-center gap-1.5 text-gray-400/80">
                        <span className="material-symbols-outlined text-[12px]">location_on</span>
                        <span className="text-[9px] font-semibold tracking-widest uppercase">Cognópolis, Foz</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed max-w-[95%] font-medium tracking-wide">
                      Pesquisador da Consciência, focado em cosmoética e interassistencialidade.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-1 w-full scale-90">
                      <div className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px] text-cyan-400 filled">verified</span>
                        <span className="text-[8px] font-bold tracking-wider text-cyan-100 uppercase">Voluntário</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 1B. MATCHES CARD (Desktop) */}
            <div
              onClick={() => onNavigate && onNavigate('matches')}
              className="relative w-full shrink-0 h-32 rounded-[2rem] overflow-hidden group/card border border-white/10 shadow-lg bg-gradient-to-br from-indigo-950/40 via-[#0A0A0C] to-black cursor-pointer transform opacity-0 translate-x-[-20px] scale-95 transition-all duration-500 ease-out group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0 group-hover/sidebar:scale-100 delay-[180ms] hover:scale-[1.02] hover:border-indigo-500/30"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/10 to-transparent pointer-events-none"></div>
              <div className="absolute inset-0 p-5 flex flex-col justify-between z-10">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <h3 className="text-lg font-bold text-white tracking-tight drop-shadow-md">Metchs</h3>
                    <p className="text-[8px] text-indigo-400 uppercase tracking-widest mt-0.5 font-bold font-mono">Metchs de Projetos</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-lg group-hover/card:bg-indigo-500 group-hover/card:text-white transition-all duration-300">
                    <span className="material-symbols-outlined text-base">favorite</span>
                  </div>
                </div>
                <div className="mt-auto">
                  <span className="text-[10px] text-gray-500">Conecte-se com afinidades</span>
                </div>
              </div>
            </div>

            {/* 1C. CHAT CARD (Desktop) */}
            <div
              onClick={() => onNavigate && onNavigate('chat')}
              className="relative w-full shrink-0 h-32 rounded-[2rem] overflow-hidden group/card border border-white/10 shadow-lg bg-gradient-to-br from-cyan-950/40 via-[#0A0A0C] to-black cursor-pointer transform opacity-0 translate-x-[-20px] scale-95 transition-all duration-500 ease-out group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0 group-hover/sidebar:scale-100 delay-[220ms] hover:scale-[1.02] hover:border-cyan-500/30"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/10 to-transparent pointer-events-none"></div>
              <div className="absolute inset-0 p-5 flex flex-col justify-between z-10">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <h3 className="text-lg font-bold text-white tracking-tight drop-shadow-md">Conversas</h3>
                    <p className="text-[8px] text-cyan-400 uppercase tracking-widest mt-0.5 font-bold font-mono">Chat e Mensagens</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-lg group-hover/card:bg-cyan-500 group-hover/card:text-white transition-all duration-300">
                    <span className="material-symbols-outlined text-base">forum</span>
                  </div>
                </div>
                <div className="mt-auto">
                  <span className="text-[10px] text-gray-500">Mural de debates diretos</span>
                </div>
              </div>
            </div>

            {/* 2. HOLOTECA CARD */}
            <div
              onClick={() => handleMenuClick(MENU_ITEMS.find(i => i.id === 'holoteca'))}
              className="relative w-full shrink-0 h-48 rounded-[2rem] overflow-hidden group/card border border-white/10 shadow-lg bg-[#121214] cursor-pointer transform opacity-0 translate-x-[-20px] scale-95 transition-all duration-500 ease-out group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0 group-hover/sidebar:scale-100 delay-150 hover:scale-[1.02] hover:border-white/30"
            >
              <div className="absolute inset-0 overflow-hidden rounded-[2rem]">
                <img alt="Holoteca" className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-normal group-hover/card:scale-110 transition-transform duration-[3000ms] ease-in-out will-change-transform animate-deep-breathing" src="https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1600&q=80" />
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900/30 via-[#121214]/40 to-transparent z-10 pointer-events-none"></div>
              </div>
              <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <h3 className="text-xl font-bold text-white tracking-tight drop-shadow-md group-hover/card:translate-x-1 transition-transform duration-300">Holoteca</h3>
                    <p className="text-[9px] text-gray-300 uppercase tracking-widest mt-0.5 opacity-80 font-medium">Conteúdo</p>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-lg group-hover/card:bg-white group-hover/card:text-black transition-all duration-300">
                    <span className="material-symbols-outlined text-lg transform -rotate-45 group-hover/card:rotate-0 transition-transform duration-300">arrow_forward</span>
                  </div>
                </div>
                <div className="mt-auto">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400">Acesse sua biblioteca pessoal</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. CÉREBRO CARD */}
            <div
              onClick={() => handleMenuClick(MENU_ITEMS.find(i => i.id === 'cerebro') || MENU_ITEMS.find(i => i.id === 'cockpit'))}
              className="relative w-full shrink-0 h-40 rounded-[2rem] overflow-hidden group/card border border-white/10 shadow-lg bg-gradient-to-br from-gray-700/30 via-[#121214] to-black cursor-pointer transform opacity-0 translate-x-[-20px] scale-95 transition-all duration-500 ease-out group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0 group-hover/sidebar:scale-100 delay-200 hover:scale-[1.02]"
            >
              <div className="absolute inset-0 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay grayscale" alt="Dark Earth" />
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900/60 via-black/90 to-black/40"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-[200%] w-full animate-scan opacity-10 mix-blend-overlay"></div>
              </div>
              <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <img src="https://cdn-icons-png.flaticon.com/512/6723/6723876.png" className="w-6 h-6 object-contain animate-[pulse_4s_ease-in-out_infinite] relative z-10 opacity-90" alt="Cérebro" />
                      <h3 className="text-xl font-bold text-white tracking-tight drop-shadow-md group-hover/card:text-gray-200 transition-colors">Cérebro</h3>
                    </div>
                    <p className="text-[9px] text-gray-400 uppercase tracking-widest font-medium">Dinâmica da Comunidade</p>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white shadow-lg group-hover/card:bg-white/10">
                    <img src="https://d363e3cb0fedde3cc603722077e49900.cdn.bubble.io/f1766384422562x463430689164383360/logo%20da%20Adicionares%20Global%20Inc..png" className="w-6 h-6 object-contain opacity-100" alt="Fluxo" />
                  </div>
                </div>
              </div>
            </div>

            {/* 4. DASHBOARD CARD */}
            {isAdmin && (
              <div
                onClick={() => handleMenuClick(MENU_ITEMS.find(i => i.id === 'cockpit'))}
                className="relative w-full shrink-0 h-24 rounded-[1.5rem] overflow-hidden group/card border border-white/5 bg-[#0A0A0C] cursor-pointer transform opacity-0 translate-x-[-20px] scale-95 transition-all duration-500 ease-out group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0 group-hover/sidebar:scale-100 delay-250 hover:scale-[1.02] hover:border-rose-500/30"
              >
                <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-rose-400">dashboard</span>
                    <span className="text-white font-bold">Painel Evolutivo</span>
                  </div>
                </div>
              </div>
            )}

            {/* 5. AMPARO */}
            <div className={`rounded-[1.5rem] p-1 space-y-1 w-full shrink-0 transform opacity-0 translate-x-[-20px] scale-95 transition-all duration-500 ease-out group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0 group-hover/sidebar:scale-100 delay-300 ${isDarkMode ? 'glass-card' : ''}`}>
              <button
                onClick={triggerAmparoAction}
                className="relative w-full h-14 rounded-full bg-[#050505] border border-white/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] p-1 flex items-center justify-start group overflow-hidden transition-all duration-300 active:border-white/20"
              >
                {/* Track Background Text */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 ml-10">
                  <span className="text-[10px] font-black tracking-[0.25em] text-gray-600 uppercase animate-pulse">
                    Deslize para Amparo
                  </span>
                  <span className="material-symbols-outlined text-[14px] text-gray-700 ml-2 animate-[bounce-right_1s_infinite]">chevron_right</span>
                </div>

                {/* Knob (Círculo Deslizante) */}
                <div className={`relative w-12 h-12 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.15)] flex items-center justify-center z-10 transform transition-transform duration-500 cubic-bezier(0.2, 0.8, 0.2, 1) group-hover:scale-105 group-active:scale-95 bg-gradient-to-br from-white via-gray-200 to-gray-400 ${isAmparoActive ? 'translate-x-[170px]' : 'group-active:translate-x-[170px]'}`}>
                  <span className="material-symbols-outlined text-[22px] text-black">volunteer_activism</span>
                  {/* Inner highlight */}
                  <div className="absolute top-1 left-2 w-4 h-2 bg-white/80 blur-[2px] rounded-full"></div>
                </div>

                {/* Feedback Flash on Click */}
                <div className="absolute inset-0 bg-white/10 opacity-0 group-active:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </button>
            </div>

            {/* THEME TOGGLE DESKTOP (Hidden Menu) */}
            <div className={`rounded-[1.5rem] p-1 w-full shrink-0 transform opacity-0 translate-x-[-20px] scale-95 transition-all duration-500 ease-out group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0 group-hover/sidebar:scale-100 delay-400 ${isDarkMode ? 'glass-card' : ''}`}>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`w-full p-3 rounded-xl flex items-center justify-between group/card transition-colors duration-200 ${isDarkMode ? 'hover:bg-white/5' : 'bg-white border border-gray-300 hover:border-gray-400 shadow-sm'}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined text-[20px] ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
                  <span className={`text-sm font-medium transition-colors ${isDarkMode ? 'text-gray-300 group-hover/card:text-white' : 'text-gray-700'}`}>
                    {isDarkMode ? 'Modo Pastel' : 'Modo Escuro'}
                  </span>
                </div>
              </button>
            </div>

            <div className="pt-2 pb-1 shrink-0 flex justify-center opacity-40 transition-opacity transform opacity-0 translate-x-[-20px] scale-95 transition-all duration-500 ease-out group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0 group-hover/sidebar:scale-100 delay-500 hover:opacity-100">
              <span className="text-[9px] text-gray-600 font-medium tracking-tight">Adicionares Global Inc © 2026</span>
            </div>

          </div>
        </div>
      </aside>

      <main ref={feedContainerRef} className="w-full h-full overflow-y-auto overflow-x-hidden no-scrollbar flex flex-col items-center z-10 pt-[100px]">

        {/* RADAR HOLOPENSENICO COMPLETO */}
        {/* RADAR HOLOPENSENICO COMPLETO */}
        {!activePostId && (
          <div
            ref={radarScrollRef}
            onMouseEnter={handleRadarMouseEnter}
            onMouseLeave={handleRadarMouseLeave}
            onMouseDown={handleRadarMouseDown}
            onMouseUp={handleRadarMouseUp}
            onMouseMove={handleRadarMouseMove}
            onTouchStart={handleRadarMouseEnter}
            className="relative w-full h-[35vh] min-h-[300px] lg:h-[40vh] shrink-0 overflow-x-auto overflow-y-hidden no-scrollbar flex snap-x snap-mandatory z-50 cursor-grab"
          >
            {/* SLIDE 1: RADAR HOLOPENSÊNICO */}
            <div className="w-full h-full shrink-0 snap-center relative flex flex-col items-center justify-center overflow-hidden">

              {/* TÍTULO COSMOS ENERGÉTICO */}
              <div className="relative z-[152] flex flex-col items-center mb-2 lg:mb-4 px-6 text-center animate-bounce-slow scale-110 lg:scale-125">
                <div className="flex items-center gap-3 mb-2 bg-white/5 px-4 py-1.5 lg:px-8 lg:py-2 rounded-full border border-white/10 shadow-glass backdrop-blur-3xl">
                  <span className="material-symbols-outlined text-blue-500 text-base lg:text-xl animate-spin-medium">auto_awesome</span>
                  <span className="text-[8px] lg:text-[10px] font-black text-white uppercase tracking-[0.5em] lg:tracking-[0.9em]">Radar_Holopensênico</span>
                </div>
                <h2 className={`text-[39px] lg:text-7xl font-display font-black tracking-tighter uppercase leading-none pb-2 transition-colors duration-500`}>
                  <span className="bg-gradient-to-r from-gray-300 via-white to-gray-300 bg-clip-text text-transparent animate-text-shimmer drop-shadow-[0_10px_10px_rgba(0,0,0,0.6)] filter pr-2 inline-block">
                    GRUPO
                  </span> <br />
                  <span className="text-[42px] lg:text-7xl not-italic text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-white to-blue-500 animate-text-shimmer drop-shadow-[0_10px_10px_rgba(0,0,0,0.6)] filter pr-4">
                    ADICIONARES
                  </span>
                </h2>

                {/* Carousel Indicator (Pills & Arrow) */}
                <div className="flex items-center gap-2 mt-1 opacity-80">
                  {/* Active Slide (Radar) */}
                  <div className="w-5 h-1.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                  {/* Inactive Slide (Novidades) */}
                  <div className="w-5 h-1.5 rounded-full bg-white/20 hover:bg-white/40 transition-colors cursor-pointer" onClick={scrollToNovidades}></div>

                  {/* Directional Mini Arrow */}
                  <span className="material-symbols-outlined text-[14px] text-white/60 animate-pulse ml-1">arrow_forward</span>
                </div>
              </div>

              <div className="absolute inset-0 pointer-events-none w-full">
                {liveEvents.map((event) => (
                  <div
                    key={event.id}
                    className="absolute animate-float-vision-pro pointer-events-auto cursor-pointer z-[140]"
                    onClick={() => setSelectedEvent(event)}
                    style={{
                      top: event.top,
                      left: event.left,
                      // @ts-ignore
                      '--scale': event.scale,
                      animationDelay: `${event.delay}s`
                    }}
                  >
                    <div className="group/node relative p-2 pr-4 rounded-[1.5rem] glass-panel-ultra border border-white/15 overflow-hidden flex flex-row items-center gap-3 shadow-3d-glow transition-all duration-500 hover:scale-110 min-w-[220px] max-w-[70vw] lg:min-w-[200px] lg:max-w-[320px] text-left" style={{ background: 'rgba(10, 10, 10, 0.7)', backdropFilter: 'blur(30px)' }}>
                      <div className="relative shrink-0">
                        <img src={event.userAvatar} className="w-9 h-9 lg:w-10 lg:h-10 rounded-full p-0.5 border-2" style={{ borderColor: event.color }} alt="avatar" />
                      </div>
                      <div className="flex flex-col w-full min-w-0">
                        <div className="flex flex-row items-center gap-2 mb-0.5">
                          <span className="text-[9px] font-black uppercase tracking-tight text-white/50 truncate max-w-[80px]">{event.user}</span>
                          <span className="text-[9px] font-bold text-white leading-tight truncate shrink-0">{event.action}</span>
                        </div>
                        <p className="text-[10px] font-medium text-gray-300 leading-snug truncate opacity-80">
                          {event.value}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SLIDE 2: PAINEL DE NOVIDADES E ANÚNCIOS (3D CAROUSEL) */}
            <div className="w-full h-full shrink-0 snap-center flex items-center justify-center overflow-hidden">
              <News3DCarousel />
            </div>

          </div>
        )
        }



        {/* FEED - Aproximado do radar devido à redução de altura do Radar e pt-0 do main */}
        {!activePostId && (<>
          {/* BOTÃO NOVIDADES - VISUAL PREMIUM TAPERED ARROW (REF IMAGEM) */}
          <div
            className="w-full flex justify-center lg:justify-end max-w-[720px] mb-2 lg:-mr-24 relative z-40 animate-fade-in-up overflow-hidden"
            onWheel={handleNovidadesWheel}
          >
            <style>{`
              @keyframes nudge-attention {
                0%, 85%, 100% { transform: translateX(0); }
                90% { transform: translateX(8px); }
                95% { transform: translateX(4px); }
              }
            `}</style>
            <button
              onClick={scrollToNovidades}
              className="group flex items-center gap-2 lg:gap-4 py-3 pl-6 pr-2 lg:pr-0 transition-transform duration-300 hover:scale-[1.01] active:scale-95 outline-none focus:outline-none cursor-pointer max-w-full"
            >
              <span className={`text-xs lg:text-base font-black uppercase tracking-[0.2em] lg:tracking-[0.3em] ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300 drop-shadow-lg [text-shadow:_0_0_1px_currentColor] min-w-fit`}>
                Novidades
              </span>

              {/* Seta Tapered "Espinho" Longa - Estilo Imagem de Referência */}
              {/* Animação a cada 9s para chamar atenção */}
              <div className="relative flex items-center text-current gap-2 lg:gap-3" style={{ animation: 'nudge-attention 9s infinite ease-in-out' }}>

                {/* Botão VER Pequenininho (Blur Glass) */}
                <div className="hidden group-hover:flex items-center justify-center px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/5 animate-fade-in shrink-0">
                  <span className="text-[7px] font-black uppercase text-white/80 tracking-widest">Ver</span>
                </div>

                <svg viewBox="0 0 200 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`w-36 md:w-[180px] h-6 transition-all duration-500 rotate-[-1deg] ${isDarkMode ? 'text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]' : 'text-gray-900 drop-shadow-xl'} shrink-0`}>
                  {/* Desenho da seta afinada (Tapered) que engrossa na ponta */}
                  <path d="M0 12 L170 14 L170 20 L200 12 L170 4 L170 10 L0 12 Z" fill="currentColor" />
                </svg>
              </div>
            </button>
          </div>

          <div ref={postsTopRef} className="flex flex-col items-center gap-10 w-full pb-32 px-3 lg:px-0 scroll-mt-[120px]">
            {posts.map((post) => (
              <article key={post.id} className={`premium-card rounded-[3rem] p-6 md:p-8 lg:p-10 group transition-all duration-500 hover:shadow-glow-silver-light ${theme.cardBg} max-w-[720px] mx-0 lg:mx-auto mt-0 relative z-10 w-full`}>
                <div className="flex items-start gap-4 mb-6">
                  {/* AVATAR + STATUS RING */}
                  <div className="relative shrink-0">
                    <img src={post.author.avatar} className="w-12 h-12 rounded-full object-cover border border-white/10 shadow-lg" alt="author" />
                    {post.author.isVerified && (
                      <div className="absolute -bottom-1 -right-1 bg-cyan-500 rounded-full p-0.5 border-2 border-[#09090B] shadow-sm" title="Verificado">
                        <span className="material-symbols-outlined text-[10px] text-white filled">verified</span>
                      </div>
                    )}
                  </div>

                  {/* INFO COLUMN */}
                  <div className="flex flex-col min-w-0 flex-1">
                    {/* Linha 1: Nome + Role e Tempo (Compacto) */}
                    <div className="flex items-center flex-wrap gap-2 leading-tight">
                      <h3 className={`font-bold text-white text-base hover:text-cyan-400 transition-colors cursor-pointer truncate`}>{post.author.name}</h3>

                      <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-medium text-gray-500 whitespace-nowrap">
                        <span className="w-0.5 h-0.5 rounded-full bg-gray-600"></span>
                        <span className="text-cyan-400/80 uppercase tracking-wider font-bold">{post.author.role}</span>
                        <span className="w-0.5 h-0.5 rounded-full bg-gray-600"></span>
                        <span>{post.timeAgo}</span>
                      </div>
                    </div>

                    {/* Linha 2: Tags de Pesquisa (Contexto) */}
                    <div className="flex items-center gap-2 mt-1.5 overflow-x-auto no-scrollbar mask-gradient-right">
                      {/* Tags simuladas - Baseadas no perfil do autor */}
                      <div className="flex items-center gap-1.5 opacity-70 hover:opacity-100 transition-opacity cursor-default">
                        <div className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 flex items-center gap-1 group/tag hover:bg-white/10 hover:border-white/20 transition-all">
                          <span className="material-symbols-outlined text-[10px] text-purple-400">psychology</span>
                          <span className="text-[9px] text-gray-400 group-hover/tag:text-gray-200 uppercase tracking-wide">Autopesquisa</span>
                        </div>
                        <div className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 flex items-center gap-1 group/tag hover:bg-white/10 hover:border-white/20 transition-all">
                          <span className="material-symbols-outlined text-[10px] text-blue-400">balance</span>
                          <span className="text-[9px] text-gray-400 group-hover/tag:text-gray-200 uppercase tracking-wide">Cosmoética</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* MENU DE OPÇÕES (3 DOTS) */}
                  {/* MENU DE OPÇÕES (Dropdown Elite) */}
                  <div className="relative">
                    <button
                      onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === post.id ? null : post.id); }}
                      className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10 active:scale-95 outline-none"
                    >
                      <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                    </button>

                    {openMenuId === post.id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-0 w-48 bg-[#F5E6D3] border border-stone-400/20 rounded-md shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 origin-top-right"
                      >
                        <ul className="py-1">
                          {post.userId === CURRENT_USER_ID ? (
                            <>
                              <li onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(`https://adicionares.space/post/${post.id}`); alert("Link copiado!"); setOpenMenuId(null); }} className="px-4 py-2.5 hover:bg-black/5 flex items-center gap-3 cursor-pointer transition-colors text-stone-800 hover:text-black">
                                <span className="material-symbols-outlined text-[18px] text-stone-700">ios_share</span>
                                <span className="text-xs font-medium">Compartilhar</span>
                              </li>
                              <li onClick={(e) => { e.stopPropagation(); alert("Editar em breve!"); setOpenMenuId(null); }} className="px-4 py-2.5 hover:bg-black/5 flex items-center gap-3 cursor-pointer transition-colors text-stone-800 hover:text-black">
                                <span className="material-symbols-outlined text-[18px] text-stone-700">edit</span>
                                <span className="text-xs font-medium">Editar</span>
                              </li>
                              <div className="h-[1px] bg-black/5 my-0.5 mx-3"></div>
                              <li onClick={async (e) => { e.stopPropagation(); setPosts(prev => prev.filter(p => p.id !== post.id)); setOpenMenuId(null); await supabase.from('posts').delete().eq('id', post.id); }} className="px-4 py-2.5 hover:bg-red-500/10 flex items-center gap-3 cursor-pointer transition-colors text-red-600 hover:text-red-700">
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                <span className="text-xs font-medium">Excluir</span>
                              </li>
                            </>
                          ) : (
                            <>
                              <li onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(`https://adicionares.space/post/${post.id}`); alert("Link copiado!"); setOpenMenuId(null); }} className="px-4 py-2.5 hover:bg-black/5 flex items-center gap-3 cursor-pointer transition-colors text-stone-800 hover:text-black">
                                <span className="material-symbols-outlined text-[18px] text-stone-700">ios_share</span>
                                <span className="text-xs font-medium">Compartilhar</span>
                              </li>
                              <div className="h-[1px] bg-black/5 my-0.5 mx-3"></div>
                              <li onClick={(e) => { e.stopPropagation(); alert("Denúncia enviada para análise."); setOpenMenuId(null); }} className="px-4 py-2.5 hover:bg-black/5 flex items-center gap-3 cursor-pointer transition-colors text-stone-800 hover:text-black">
                                <span className="material-symbols-outlined text-[18px] text-stone-700">flag</span>
                                <span className="text-xs font-medium">Denunciar</span>
                              </li>
                            </>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mb-8">
                  <div className={`${getDynamicTextSize(post.content, post.mediaType)} break-words`}>
                    {renderPostContent(post.content)}
                  </div>
                </div>
                {post.mediaUrl && <img src={post.mediaUrl} className="w-full rounded-[2.5rem] border border-white/5 mb-8 shadow-2xl" alt="media" />}
                <div className="flex items-center justify-between pt-8 border-t border-white/5 gap-4">
                  <button onClick={(e) => handleLike(post.id, e)} className="flex items-center gap-3 transition-all active:scale-95 group/lucidez outline-none focus:outline-none">
                    {/* CONTAINER WRAPPER PARA BORDA GRADIENTE (Agora CIRCULAR) */}
                    <div className={`relative w-12 h-12 rounded-full p-[1.5px] transition-all duration-300 ${post.isLiked ? 'bg-gradient-to-br from-yellow-400 via-orange-500 to-purple-600 shadow-[0_0_20px_rgba(250,204,21,0.4)]' : 'bg-transparent border border-white/5 group-hover/lucidez:border-white/10'}`}>
                      {/* CONTAINER INTERNO (Conteúdo - Fundo Madeira/Café com Relevo) */}
                      <div className={`w-full h-full rounded-full flex items-center justify-center relative overflow-hidden ${post.isLiked ? 'bg-gradient-to-br from-[#4a2c1d] via-[#2a150d] to-[#0f0604] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),inset_0_-2px_4px_rgba(0,0,0,0.6)]' : ''}`}>

                        {/* Ícone de fundo com GRADIENTE SÓLIDO E FORTE (Sem Pulsação) */}
                        <span className={`material-symbols-outlined text-[30px] transition-transform duration-300 ${post.isLiked ? 'filled bg-gradient-to-br from-yellow-400 via-orange-600 to-purple-700 bg-clip-text text-transparent opacity-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]' : 'group-hover/lucidez:scale-110 bg-gradient-to-br from-gray-300 to-gray-500 bg-clip-text text-transparent'}`}>auto_awesome</span>

                        {/* Número SOBREPOSTO (Branco se ativo | Gradiente se inativo) - Apenas se > 0 */}
                        {post.stats.likes > 0 && (
                          <span
                            className={`absolute flex items-center justify-center text-[13px] font-black tracking-tighter z-10 ${post.isLiked
                              ? 'text-white drop-shadow-[0_1px_3px_rgba(0,0,0,1)]'
                              : 'bg-gradient-to-r from-yellow-400 via-orange-500 to-fuchsia-400 bg-clip-text text-transparent'
                              }`}
                            style={!post.isLiked ? { WebkitTextStroke: '0.3px rgba(0,0,0,0.5)' } : {}}
                          >
                            {post.stats.likes}
                          </span>
                        )}

                      </div>
                    </div>

                    {/* TEXTO LUCIDEZ (Ao lado - COM GRADIENTE FORTE E CLARO NO FINAL) */}
                    <span className={`text-[11px] font-[800] uppercase tracking-widest transition-all duration-300 ${post.isLiked ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-fuchsia-300 bg-clip-text text-transparent drop-shadow-[0_0_5px_rgba(250,204,21,0.4)]' : 'text-gray-500 group-hover/lucidez:text-gray-300'}`}>
                      Lucidez
                    </span>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setActiveDebatePost(post); setIsDebateOpen(true); }}
                    className="relative z-50 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-5 py-4 rounded-2xl text-[11px] uppercase font-black tracking-[0.2em] transition-all whitespace-nowrap"
                  >
                    Debater no Chat
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>)}
      </main>


      {/* EDITOR FLUTUANTE FIXO (ALWAYS ON SCREEN) - Agora atende Feed e Tertúlia */}
      <div className={`fixed bottom-0 w-full flex justify-center px-4 pb-4 lg:pb-8 pointer-events-none transition-all duration-300 ${isDebateOpen ? 'z-[2000]' : 'z-[400]'}`}>
        <div className="w-full max-w-[720px] pointer-events-auto shadow-2xl transition-all duration-300">
          <FeedEditor
            focusTrigger={editorFocusTrigger}
            userAvatar="https://d363e3cb0fedde3cc603722077e49900.cdn.bubble.io/f1768342953899x415168906544139000/5.png?_gl=1*9ruv5n*_gcl_au*MTczMzAyMTYxMC4xNzY2Mzg0MjQ0*_ga*OTYzNzc1MDE2LjE3MjQzNzE3ODg.*_ga_BFPVR2DEE2*czE3Njg0MzQ4MzEkbzQ2JGcxJHQxNzY4NDM0ODU2JGozNSRsMCRoMA.."
            placeholder={isDebateOpen ? "Faça sua pergunta ou defesa..." : "No que você está pensando?"}
            onSubmit={(content, audioData?: { duration: number }) => {
              if (isDebateOpen && activeDebatePost) {
                // --- Lógica de Debate: Adicionar Comentário ---
                const newComment = {
                  id: Date.now().toString(),
                  userId: CURRENT_USER_ID,
                  author: {
                    name: 'Você', // Ou Douglas Rocha
                    avatar: 'https://d363e3cb0fedde3cc603722077e49900.cdn.bubble.io/f1768342953899x415168906544139000/5.png?_gl=1*9ruv5n*_gcl_au*MTczMzAyMTYxMC4xNzY2Mzg0MjQ0*_ga*OTYzNzc1MDE2LjE3MjQzNzE3ODg.*_ga_BFPVR2DEE2*czE3Njg0MzQ4MzEkbzQ2JGcxJHQxNzY4NDM0ODU2JGozNSRsMCRoMA..'
                  },
                  content: content,
                  timeAgo: 'Agora'
                };

                if (activeReplyId) {
                  // --- Inserir LOGO APÓS o comentário selecionado ---
                  setDebateComments(prev => {
                    const index = prev.findIndex(c => c.id === activeReplyId);
                    if (index !== -1) {
                      const newArr = [...prev];
                      newArr.splice(index + 1, 0, newComment);
                      return newArr;
                    }
                    return [...prev, newComment];
                  });
                  setActiveReplyId(null); // Deselecionar após responder
                } else {
                  // --- Inserir no FINAL (Nova Pergunta) ---
                  setDebateComments(prev => [...prev, newComment]);
                }

              } else {
                // --- Lógica de Feed: Criar Novo Post ---
                const newPost: Post = {
                  id: Date.now().toString(),
                  userId: CURRENT_USER_ID,
                  author: {
                    name: 'Douglas Rocha',
                    avatar: 'https://d363e3cb0fedde3cc603722077e49900.cdn.bubble.io/f1768342953899x415168906544139000/5.png?_gl=1*9ruv5n*_gcl_au*MTczMzAyMTYxMC4xNzY2Mzg0MjQ0*_ga*OTYzNzc1MDE2LjE3MjQzNzE3ODg.*_ga_BFPVR2DEE2*czE3Njg0MzQ4MzEkbzQ2JGcxJHQxNzY4NDM0ODU2JGozNSRsMCRoMA..',
                    role: 'Explorer'
                  },
                  timeAgo: 'Agora',
                  content: content,
                  mediaType: audioData ? 'audio' : 'none',
                  audioDuration: audioData?.duration,
                  stats: { likes: 0, views: '0', comments: 0 },
                  comments: []
                };
                setPosts([newPost, ...posts]);

                supabase.from('posts').insert([{
                  id: newPost.id,
                  user_id: newPost.userId,
                  author: newPost.author,
                  content: newPost.content,
                  media_type: newPost.mediaType,
                  audio_duration: newPost.audioDuration,
                  stats: newPost.stats,
                  comments: newPost.comments
                }]).then(({ error }) => {
                  if (error) console.error("Erro ao salvar post no Supabase:", error);
                });

                // AUTO-SCROLL INTELIGENTE ("Warp + Glide")
                if (feedContainerRef.current) {
                  const container = feedContainerRef.current;
                  const threshold = 2000; // Distância limite (pixels) para considerar "longe"

                  // Se estiver muito longe, "teletransporta" para perto (Warp) para evitar scroll longo e lento
                  if (container.scrollTop > threshold) {
                    container.scrollTop = 500; // Pula para 500px do topo
                  }

                  // Desliza suavemente até o destino (Glide) para o efeito visual "Impressionante"
                  // FOCA NO INÍCIO DOS POSTS (Pular Radar)
                  requestAnimationFrame(() => {
                    if (postsTopRef.current) {
                      postsTopRef.current.scrollIntoView({ behavior: 'smooth' });
                    }
                  });
                }
              }
            }}
          />
        </div>
      </div>

      {/* --- MODAL DE DEBATE (TERTÚLIA) --- */}
      {isDebateOpen && activeDebatePost && (
        <div className="fixed inset-0 z-[1000] lg:flex lg:items-center lg:justify-center animate-slide-up-fade">
          {/* Overlay com Fundo de Imagem (Fallback Preto para evitar tela branca) */}
          <div className="absolute inset-0 bg-black backdrop-blur-md overflow-hidden">
            <style>
              {`
                @keyframes slideDiagonal {
                  0% { background-position: 0 0; }
                  100% { background-position: 120px -120px; }
                }
              `}
            </style>
            {/* Fundo de Imagem: Planeta (Desktop) - Horizontal */}
            <img
              src="https://d363e3cb0fedde3cc603722077e49900.cdn.bubble.io/f1768342926159x568292652219355460/bhautik-patel-wd0qrow9q_M-unsplash.jpg?_gl=1*11pc6k6*_gcl_au*MTczMzAyMTYxMC4xNzY2Mzg0MjQ0*_ga*OTYzNzc1MDE2LjE3MjQzNzE3ODg.*_ga_BFPVR2DEE2*czE3NjgzNDI4MDIkbzQ0JGcxJHQxNzY4MzQyODc5JGo1MCRsMCRoMA.."
              alt="Background Planeta Desktop"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-100 hidden lg:block"
            />
            {/* Fundo de Imagem: Planeta (Mobile) - Vertical Original (Sutil 30%) */}
            <img
              src="https://d363e3cb0fedde3cc603722077e49900.cdn.bubble.io/f1768346585245x767695868181901400/bhautik-patel-5tzhoOGR6J8-unsplash.jpg?_gl=1*za88qb*_gcl_au*MTczMzAyMTYxMC4xNzY2Mzg0MjQ0*_ga*OTYzNzc1MDE2LjE3MjQzNzE3ODg.*_ga_BFPVR2DEE2*czE3NjgzNDI4MDIkbzQ0JGcxJHQxNzY4MzQ2NTU3JGozJGwwJGgw"
              alt="Background Planeta Mobile Vertical"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-10 lg:hidden"
            />

            {/* Overlay Escuro Removido - Apenas Imagem e Marca D'água */}

            {/* Padrão Repetitivo de Texto (Marca D'água - Cinza Elegante - Visível no Mobile também) */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none select-none"
              style={{
                // Usando texto estático para garantir estabilidade e evitar crash com encoding
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='400' height='400' viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='100' y='100' font-family='Inter, sans-serif' font-weight='900' font-size='24' fill='%23888888' text-anchor='middle' dominant-baseline='middle' transform='rotate(-45 100 100)'%3EADICIONARES%3C/text%3E%3Ctext x='300' y='100' font-family='Inter, sans-serif' font-weight='900' font-size='24' fill='%23888888' text-anchor='middle' dominant-baseline='middle' transform='rotate(-45 300 100)'%3EADICIONARES%3C/text%3E%3Ctext x='100' y='300' font-family='Inter, sans-serif' font-weight='900' font-size='24' fill='%23888888' text-anchor='middle' dominant-baseline='middle' transform='rotate(-45 100 300)'%3EADICIONARES%3C/text%3E%3Ctext x='300' y='300' font-family='Inter, sans-serif' font-weight='900' font-size='24' fill='%23888888' text-anchor='middle' dominant-baseline='middle' transform='rotate(-45 300 300)'%3EADICIONARES%3C/text%3E%3C/svg%3E")`,
                backgroundSize: '200px 200px',
                animation: 'slideDiagonal 12s linear infinite'
              }}
            ></div>
          </div>

          {/* Wrapper para Seta Externa (Necessário para evitar o clipping do overflow-hidden) */}
          <div className="relative w-full h-full lg:w-[1000px] lg:h-[85vh] lg:max-h-[850px]">

            {/* Seta de Voltar (Padrão para Desktop e Mobile) */}
            <button
              onClick={() => setIsDebateOpen(false)}
              className="hidden lg:flex fixed left-4 lg:left-[calc((100vw-1000px)/10)] top-6 lg:top-32 flex-col items-center gap-2 lg:gap-4 text-white/40 hover:text-white transition-all hover:scale-110 active:scale-95 z-[2000] group"
              title="Voltar"
            >
              <div className="flex flex-col items-center gap-2">
                {/* Seta Comprida Customizada (Glow + Stroke Largo) */}
                <svg width="40" height="24" viewBox="0 0 100 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="lg:w-[100px] drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.6)] transition-all">
                  <path d="M98 12H2M2 12L16 4M2 12L16 20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-2 group-hover:translate-y-0 hidden lg:block">Voltar</span>
              </div>
            </button>

            {/* Container da Modal - Agora sim com overflow-hidden para o conteúdo interno */}
            <div className="flex flex-col w-full h-full lg:rounded-lg lg:shadow-2xl lg:border lg:border-white/10 overflow-hidden relative bg-transparent lg:bg-black/95">



              {/* Conteúdo Central (Scrollável) - Scrollbar Oculta */}
              <div className="relative z-10 flex-1 overflow-y-auto p-4 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']" onClick={() => setActiveReplyId(null)}>

                {/* Instrução Inicial */}
                {/* --- AUTOR PROFILE SECTION (REIMAGINED: PRECISION ENGINEERING WHITE STYLE) --- */}
                {/* --- AUTOR PROFILE SECTION (REIMAGINED: HYBRID PRECISION) --- */}
                {/* Lógica: Mobile = Ticket Ultra Compacto (120px) | Desktop = Industrial Card (Reduzido) */}
                <div className="w-full max-w-5xl mx-auto mb-4 lg:mb-8 relative z-10" onClick={(e) => e.stopPropagation()}>

                  {/* MOBILE VERSION: RICH PROFILE CARD (Taller, Detailed) */}

                  {/* Mobile Back Navigation */}
                  <div className="lg:hidden flex items-center mb-1 pl-1">
                    <button
                      onClick={() => setIsDebateOpen(false)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md border border-white/10 active:scale-95 transition-all shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    </button>
                  </div>

                  {/* Mobile Profile Card */}
                  <div className="lg:hidden special-paper-bg rounded-[2rem] pt-1 px-3 pb-8 relative overflow-hidden flex flex-col gap-0 shadow-sm">

                    {/* Background Tech Details (Relief) */}
                    <div className="absolute top-0 right-0 w-[200px] h-[200px] border border-gray-400/40 rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>

                    {/* Top Row: BIG CENTERED AVATAR + Main Header */}
                    <div className="flex flex-col items-center gap-1 relative z-10 text-center w-full">
                      {/* Avatar (Huge for Mobile Impact) - Integrated into top white space */}
                      <div className="relative w-56 h-56 shrink-0 mt-4">
                        {/* Animated Border Container - RESTORED & LAYERED */}
                        <div className="absolute -inset-[3px] rounded-[1.8rem] bg-gradient-to-r from-gray-200 via-white to-gray-400 opacity-60 blur-sm animate-pulse-slow"></div>
                        <div className="absolute -inset-[1px] rounded-[1.7rem] bg-gradient-to-tr from-gray-100 via-gray-400 to-gray-100 animate-spin-slow"></div>

                        <img
                          src={activeDebatePost.author.avatar}
                          className="relative w-full h-full object-cover rounded-[1.6rem] grayscale-[0%] border-[2px] border-white/50 shadow-xl z-10"
                          alt="Avatar"
                        />
                        <div className="absolute bottom-2 right-2 bg-white p-1.5 rounded-full shadow-md z-20">
                          <span className="material-symbols-outlined text-[22px] text-blue-600 filled">verified</span>
                        </div>
                      </div>

                      {/* Name & Location Info (Centered) */}
                      {/* Z-Index 20 to OVERLAP animation properly */}
                      <div className="flex flex-col items-center w-full min-w-0 pt-0 -mt-1 relative z-20">
                        <div className="flex items-center gap-2 mb-0.5 justify-center">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.25em]">Debate Leader</span>
                        </div>
                        {/* Increased mb to 1.5 to separate Name from City */}
                        <h2 className="text-[30px] font-black text-[#111111] leading-[0.9] tracking-tighter mb-1.5 break-words w-full">
                          {activeDebatePost.author.name}
                        </h2>
                        <div className="flex items-center justify-center gap-1.5 text-gray-500 mb-1">
                          <span className="material-symbols-outlined text-[14px]">location_on</span>
                          <span className="text-[11px] font-bold leading-none">Foz do Iguaçu, PR</span>
                        </div>
                      </div>
                    </div>

                    {/* Middle Information Block: Study & Stats (Inset) */}
                    <div className="specialty-inset rounded-lg p-2.5 relative z-10 scale-[0.99] origin-top">
                      <div className="mb-1">
                        <p className="text-[9px] text-gray-400 uppercase font-bold tracking-widest mb-0.5 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                          Especialidade
                        </p>
                        <p className="text-xs font-bold text-gray-800 leading-snug">
                          Mapeamento do Parapsiquismo Lúcido e Cosmoética Aplicada
                        </p>
                      </div>

                      {/* Social Links & Research Lines (Split Carousels) */}
                      <div className="flex flex-col gap-1 mb-1">

                        {/* Research Tags Carousel */}
                        <div className="overflow-x-auto no-scrollbar pb-1 mask-linear-fade">
                          <div className="flex items-center gap-1 w-max">
                            <span className="px-1.5 py-0.5 bg-purple-600 text-white rounded text-[8px] font-bold uppercase tracking-wider shadow-sm">Parapercepção</span>
                            <span className="px-1.5 py-0.5 bg-emerald-600 text-white rounded text-[8px] font-bold uppercase tracking-wider shadow-sm">Cosmoética</span>
                            <span className="px-1.5 py-0.5 bg-blue-600 text-white rounded text-[8px] font-bold uppercase tracking-wider shadow-sm">Projeção</span>
                            <span className="px-1.5 py-0.5 bg-amber-600 text-white rounded text-[8px] font-bold uppercase tracking-wider shadow-sm">Holossomática</span>
                          </div>
                        </div>

                        {/* Social Icons Carousel */}
                        <div className="overflow-x-auto no-scrollbar pb-1 mask-linear-fade border-t border-gray-100 pt-1">
                          <div className="flex items-center gap-1.5 w-max">
                            <div className="bg-white p-0.5 rounded-md border border-gray-200 text-gray-400 flex items-center justify-center">
                              <span className="material-symbols-outlined text-[14px]">smart_display</span>
                            </div>
                            <div className="bg-white p-0.5 rounded-md border border-gray-200 text-gray-400 flex items-center justify-center">
                              <span className="material-symbols-outlined text-[14px]">photo_camera</span>
                            </div>
                            <div className="bg-white p-0.5 rounded-md border border-gray-200 text-gray-400 flex items-center justify-center">
                              <span className="material-symbols-outlined text-[14px]">public</span>
                            </div>
                            <div className="bg-white p-0.5 rounded-md border border-gray-200 text-gray-400 flex items-center justify-center">
                              <span className="material-symbols-outlined text-[14px]">work</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="h-px w-full bg-gray-200 mb-1"></div>

                      {/* Lucidity Points Row + Action Button */}
                      <div className="flex items-center justify-between gap-3 mt-0">
                        <div className="flex flex-col shrink-0">
                          <span className="text-[22px] font-black text-[#111111] leading-none tracking-tighter">
                            {(activeDebatePost.stats.likes * 124).toLocaleString()}
                          </span>
                          <span className="text-[8px] text-gray-500 uppercase font-bold tracking-tight mt-0.5">Pontos de Lucidez</span>
                        </div>

                        {/* Action Button (Balanced Size + Larger Text) */}
                        <button onClick={handleDebateAction} className="flex-1 bg-[#111111] text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform relative z-10">
                          <span className="text-xs font-bold uppercase tracking-[0.1em]">Iniciar</span>
                          <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
                        </button>
                      </div>
                    </div>

                    {/* Scroll Indicator (Arrow Down) - Attention Grabber */}
                    {/* Moved to bottoms-0 with extra padding container */}
                    <div className="absolute -bottom-1 left-6 flex flex-col items-center animate-bounce z-20 opacity-60 pointer-events-none">
                      <span className="material-symbols-outlined text-gray-800 text-3xl">keyboard_arrow_down</span>
                    </div>

                  </div>

                  {/* DESKTOP VERSION: HARMONIZED INDUSTRIAL CARD (Rich Data, Precision) */}
                  {/* Desktop Profile Card */}
                  <div className="hidden lg:block special-paper-bg rounded-[2.5rem] pt-8 px-8 pb-12 relative overflow-hidden group/industrial-card min-h-[300px]">

                    {/* Background Tech Pattern (Wireframe Circles) */}
                    {/* Background Tech Pattern (Wireframe Circles - Relief) */}
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] border border-gray-400/40 rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] border border-gray-400/40 rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>

                    <div className="flex flex-row gap-8 items-stretch h-full relative z-10">

                      {/* LEFT COLUMN: MAIN INFO & SPECS */}
                      <div className="flex-1 flex flex-col justify-between">

                        <div className="space-y-4">
                          {/* Overline & Location */}
                          <div className="flex items-center gap-4">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.25em]">Debate Leader</span>
                            <div className="h-4 w-px bg-gray-300"></div>
                            <div className="flex items-center gap-1.5 text-gray-400">
                              <span className="material-symbols-outlined text-[14px]">location_on</span>
                              <span className="text-[10px] font-bold uppercase tracking-wider">Foz do Iguaçu, PR</span>
                            </div>
                          </div>

                          {/* Headline (Name) - Big & Bold */}
                          <h2 className="text-6xl font-black text-[#111111] tracking-tighter leading-[0.85] -ml-0.5">
                            {activeDebatePost.author.name}
                          </h2>

                          {/* Specialty Block (Dynamic Holossomatic Bio - Inset) */}
                          <div className="specialty-inset rounded-lg p-4 inline-flex flex-col gap-2 max-w-lg">
                            <div className="flex flex-col gap-1">
                              <span className="text-[9px] text-gray-400 uppercase font-bold tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                Especialidade (Bio-Raiz)
                              </span>
                              <span className="text-sm font-bold text-gray-800 leading-snug">
                                {/* Lógica: Contexto Geral vs Específico */}
                                {activeDebatePost.author.role === 'Iniciante' ? 'Pesquisador da parapercepção e cosmoética aplicada.' : 'Mapeamento do Parapsiquismo Lúcido e Cosmoética Aplicada'}
                              </span>
                            </div>

                            {/* Extra Metadata Row: Research Lines & Links (Split Scrollable Desktop) */}
                            <div className="pt-2 border-t border-gray-200/60 flex flex-col gap-2">
                              {/* Research Tags Independent Scroll */}
                              <div className="overflow-x-auto no-scrollbar mask-linear-fade pb-1">
                                <div className="flex items-center gap-2 w-max">
                                  <span className="px-1.5 py-0.5 bg-purple-600 text-white rounded text-[9px] font-bold uppercase tracking-wider shadow-sm">Parapercepção</span>
                                  <span className="px-1.5 py-0.5 bg-emerald-600 text-white rounded text-[9px] font-bold uppercase tracking-wider shadow-sm">Cosmoética</span>
                                  <span className="px-1.5 py-0.5 bg-blue-600 text-white rounded text-[9px] font-bold uppercase tracking-wider shadow-sm">Projeção</span>
                                  <span className="px-1.5 py-0.5 bg-amber-600 text-white rounded text-[9px] font-bold uppercase tracking-wider shadow-sm">Assistenciologia</span>
                                  <span className="px-1.5 py-0.5 bg-rose-600 text-white rounded text-[9px] font-bold uppercase tracking-wider shadow-sm">Energossomatologia</span>
                                </div>
                              </div>

                              {/* Social Icons Independent Scroll */}
                              <div className="overflow-x-auto no-scrollbar mask-linear-fade pb-1">
                                <div className="flex items-center gap-2 w-max text-gray-400">
                                  <span className="material-symbols-outlined text-[16px] hover:text-red-500 transition-colors cursor-pointer" title="YouTube">smart_display</span>
                                  <span className="material-symbols-outlined text-[16px] hover:text-pink-500 transition-colors cursor-pointer" title="Instagram">photo_camera</span>
                                  <span className="material-symbols-outlined text-[16px] hover:text-blue-600 transition-colors cursor-pointer" title="Website">public</span>
                                  <span className="material-symbols-outlined text-[16px] hover:text-gray-600 transition-colors cursor-pointer" title="Artigos">article</span>
                                  <span className="material-symbols-outlined text-[16px] hover:text-blue-800 transition-colors cursor-pointer" title="LinkedIn">work</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Row: Stats & Action */}
                        <div className="flex items-end gap-6 pt-4">
                          {/* Lucidity Points */}
                          <div className="flex flex-col">
                            <div className="flex items-end gap-3">
                              <span className="text-4xl font-black text-[#111111] leading-none tracking-tighter">
                                {(activeDebatePost.stats.likes * 124).toLocaleString()}
                              </span>

                            </div>
                            <span className="text-[9px] text-gray-500 uppercase font-bold tracking-tight mt-1">Pontos de Lucidez</span>
                          </div>

                          <div className="h-8 w-px bg-gray-300 mx-2"></div>

                          {/* Action Button */}
                          <button onClick={handleDebateAction} className="flex-1 max-w-xs bg-[#111111] text-white px-6 py-4 rounded-xl flex items-center justify-between group/btn hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-gray-300/50">
                            <span className="text-xs font-bold uppercase tracking-[0.15em]">Conectar Mentalssoma</span>
                            <span className="material-symbols-outlined text-[20px] group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                          </button>
                        </div>

                      </div>

                      {/* RIGHT COLUMN: AVATAR FRAME (Square/Rounded Harmony) */}
                      <div className="relative w-[300px] shrink-0">
                        {/* Animated Border Wrapper - Removed overflow-hidden from here to let border show */}
                        <div className="relative w-full h-full group/avatar">

                          {/* The Spinning Border Effect */}
                          <div className="absolute -inset-[3px] bg-gradient-to-r from-gray-200 via-white to-gray-400 opacity-75 blur-sm animate-pulse-slow rounded-[2.1rem]"></div>
                          <div className="absolute -inset-[3px] bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)] animate-spin-slow rounded-[2.1rem] opacity-50 mix-blend-overlay"></div>
                          <div className="absolute -inset-[2px] bg-gradient-to-tr from-gray-100 via-gray-400 to-gray-100 animate-spin-reverse-slower rounded-[2.1rem]"></div>

                          {/* Inner Content Container - Clips the image content */}
                          <div className="relative w-full h-full rounded-[2rem] overflow-hidden bg-[#EAEAEA] shadow-inner">
                            {/* Backdrop Lettering */}
                            <span className="absolute top-[-10px] left-[-10px] text-[180px] font-black text-white/40 leading-none select-none z-0">
                              {activeDebatePost.author.name.charAt(0)}
                            </span>
                            {/* Main Image */}
                            <img
                              src={activeDebatePost.author.avatar}
                              alt="Profile"
                              className="absolute inset-0 w-full h-full object-cover mix-blend-normal grayscale-[10%] contrast-[1.1] transition-all duration-700 group-hover/avatar:grayscale-0 group-hover/avatar:scale-105 z-10"
                            />
                            {/* Overlay Gradient (Bottom) */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-20 opacity-60"></div>

                            {/* Verified Badge inside Avatar */}
                            <div className="absolute bottom-4 right-4 z-30 bg-white p-1.5 rounded-full shadow-lg">
                              <span className="material-symbols-outlined text-[20px] text-blue-600 filled">verified</span>
                            </div>

                            {/* Tech Overlay Lines */}
                            <div className="absolute inset-0 border-[1px] border-white/10 rounded-[2rem] z-40 pointer-events-none m-4"></div>
                          </div>
                        </div>
                      </div>

                    </div>
                    {/* Scroll Indicator (Arrow Down) - Desktop Attention Grabber */}
                    <div className="absolute -bottom-1 left-8 flex flex-col items-center animate-bounce z-20 opacity-60 pointer-events-none">
                      <span className="material-symbols-outlined text-gray-800 text-4xl">keyboard_arrow_down</span>
                    </div>

                  </div>

                </div>

                {/* Lista de Perguntas Dinâmica (Chat Vivo) - Seleção Direta no Balão */}
                <div className="space-y-6 mt-6">
                  {debateComments.map((comment, index) => {
                    const isMe = comment.userId === CURRENT_USER_ID;
                    const isAuthor = activeDebatePost.author.name === comment.author.name;
                    const isSelected = activeReplyId === comment.id;

                    // Efeito de Foco: Removido 'dimming'
                    const dimStyle = 'opacity-100 scale-100';

                    // Definição de Cores Baseada no Tipo de Usuário (Me, Author, User)
                    let bubbleBaseClasses = "";
                    let textClassesHeader = "";
                    let textClassesTime = "";

                    // Estilo Aurora (EGO BOOST) aplicado SEMPRE para o usuário logado
                    // Ajustado para fundo mais claro (Cinza Médio) em vez de quase preto
                    const auroraStyle = isMe ? {
                      border: '1px solid transparent',
                      backgroundImage: 'linear-gradient(#202024, #202024), linear-gradient(to right, #500724, #312e81, #083344)',
                      backgroundOrigin: 'padding-box, border-box',
                      backgroundClip: 'padding-box, border-box',
                      boxShadow: 'none'
                    } : {};

                    if (isMe) {
                      // Eu: Bico no canto superior esquerdo (tl-none) para padronizar com todos
                      // + Borda visível e sombra leve
                      bubbleBaseClasses = "bg-[#202024] border border-indigo-500/20 shadow-sm rounded-xl rounded-tl-none";
                      textClassesHeader = "text-white font-bold";
                      textClassesTime = "text-indigo-400/60";
                    } else if (isAuthor) {
                      // Autor: Bico na Esquerda Superior
                      bubbleBaseClasses = "bg-[#2A2A2E] border border-yellow-500/30 rounded-xl rounded-tl-none";
                      textClassesHeader = "text-gray-100";
                      textClassesTime = "text-gray-500";
                    } else {
                      // Outros: Bico na Esquerda Superior
                      bubbleBaseClasses = "bg-[#222226] border border-white/5 rounded-xl rounded-tl-none";
                      textClassesHeader = "text-gray-300";
                      textClassesTime = "text-gray-600";
                    }

                    // Classes de SELEÇÃO (Foco sutil para responder)
                    // Usando um anel muito leve e suave, na mesma paleta mas com opacidade bem baixa para não brigar
                    const selectedAvatarRing = isSelected
                      ? "ring-2 ring-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)] scale-105"
                      : (isMe ? "ring-[2px] ring-pink-500" : "ring-1 ring-white/10"); // Avatar "Eu" com ring sólido/gradiente simples

                    // Highlight de seleção no balão: Apenas um leve glow/pulse, sem mudar a cor da borda drasticamente
                    const selectedBubbleStyle = isSelected
                      ? "shadow-[0_0_25px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/30"
                      : "";

                    return (
                      <div
                        key={comment.id}
                        className={`flex gap-3 transition-all duration-300 cursor-pointer p-0.5 rounded-xl ${dimStyle}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveReplyId(isSelected ? null : comment.id); // Toggle Select
                        }}
                      >
                        {/* AVATAR */}
                        <div className="shrink-0 transition-all duration-300">
                          {/* Lógica de Borda Gradiente Fina para o 'Eu' - Tons Escuros */}
                          {isMe ? (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#500724] via-[#312e81] to-[#083344] p-[2px]">
                              <div className="w-full h-full rounded-full bg-[#050507] overflow-hidden">
                                <img src={comment.author.avatar} className="w-full h-full object-cover" alt="Avatar" />
                              </div>
                            </div>
                          ) : (
                            // Avatar normal para outros usuários
                            <div className={`w-9 h-9 rounded-full bg-gray-700 overflow-hidden transition-all duration-300 ${selectedAvatarRing} p-[2px]`}>
                              <img src={comment.author.avatar} className="w-full h-full object-cover rounded-full" alt="Avatar" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          {/* BALÃO DE CONTEÚDO */}
                          <div
                            className={`p-3 rounded-lg rounded-tl-none relative transition-all duration-300 ${bubbleBaseClasses} ${selectedBubbleStyle}`}
                            style={isMe ? auroraStyle : {}}
                          >

                            {/* WRAPPER PARA EFEITOS DE FUNDO (Clipped - Keeps effects inside while menu overflows) */}
                            <div className="absolute inset-0 rounded-lg rounded-tl-none overflow-hidden pointer-events-none">
                              {isAuthor && <div className="absolute top-0 right-0 w-20 h-20 bg-gray-500/10 blur-2xl rounded-full -translate-y-10 translate-x-10"></div>}
                              {isMe && <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-indigo-500/5 to-cyan-500/5 opacity-50"></div>}
                            </div>

                            <div className="flex justify-between items-start mb-1 relative z-20">
                              <span className={`text-xs font-bold flex items-center gap-1 ${textClassesHeader}`}>
                                {isMe ? 'Você' : comment.author.name}
                                {isAuthor && <span className="material-symbols-outlined text-[10px] filled text-gray-400">verified</span>}
                              </span>

                              {/* Time + Menu Button Container */}
                              <div className="flex items-center gap-1.5 relative">
                                <span className={`text-[9px] ${textClassesTime}`}>{comment.timeAgo}</span>

                                <button
                                  onClick={(e) => { e.stopPropagation(); setActiveMenuCommentId(activeMenuCommentId === comment.id ? null : comment.id); }}
                                  className={`p-0.5 rounded-full hover:bg-white/10 transition-colors ${isMe ? 'text-indigo-300' : 'text-gray-500'}`}
                                >
                                  <span className="material-symbols-outlined text-[16px]">more_horiz</span>
                                </button>

                                {/* CONTEXT MENU (Matched to Feed Card - Beige Theme) */}
                                {activeMenuCommentId === comment.id && (
                                  <div className="absolute top-6 right-0 w-48 bg-[#F5E6D3] border border-stone-400/20 rounded-md shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 origin-top-right">
                                    <ul className="py-1">
                                      {isMe ? (
                                        <>
                                          <li onClick={(e) => { e.stopPropagation(); setActiveMenuCommentId(null); setShowActionPopup(true); }} className="px-4 py-2.5 hover:bg-black/5 flex items-center gap-3 cursor-pointer transition-colors text-stone-800 hover:text-black">
                                            <span className="material-symbols-outlined text-[18px] text-stone-700">edit</span>
                                            <span className="text-xs font-medium">Editar</span>
                                          </li>
                                          <div className="h-[1px] bg-black/5 my-0.5 mx-3"></div>
                                          <li onClick={(e) => { e.stopPropagation(); setActiveMenuCommentId(null); }} className="px-4 py-2.5 hover:bg-red-500/10 flex items-center gap-3 cursor-pointer transition-colors text-red-600 hover:text-red-700">
                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                            <span className="text-xs font-medium">Excluir</span>
                                          </li>
                                        </>
                                      ) : (
                                        <li onClick={(e) => { e.stopPropagation(); alert("Denúncia enviada."); setActiveMenuCommentId(null); }} className="px-4 py-2.5 hover:bg-black/5 flex items-center gap-3 cursor-pointer transition-colors text-red-600 hover:text-red-700">
                                          <span className="material-symbols-outlined text-[18px]">flag</span>
                                          <span className="text-xs font-medium">Denunciar</span>
                                        </li>
                                      )}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className={`text-sm leading-relaxed relative z-10 prose prose-invert prose-p:my-1 ${isMe ? 'text-gray-100' : 'text-gray-200'}`}>
                              {renderPostContent(comment.content)}
                            </div>
                          </div>

                          {/* Indicador de "Respondendo..." com gradiente bem leve se selecionado */}
                          {isSelected && (
                            <div className="mt-2 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 animate-pulse ml-1 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent opacity-80">
                              <span className="material-symbols-outlined text-[12px] text-indigo-400">reply</span>
                              Respondendo...
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Fechamento do Container Scrollável e da Modal */}
                <div className="h-40"></div>
              </div>
            </div>
          </div>
        </div >
      )
      }

      {showActionPopup && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center pointer-events-none animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-black/60 backdrop-blur-xl px-12 py-8 rounded-[2rem] border border-white/10 shadow-2xl flex flex-col items-center gap-4">
            <span className="material-symbols-outlined text-5xl text-white animate-bounce">edit_note</span>
            <h2 className="text-3xl font-black text-white tracking-[0.3em] uppercase animate-pulse">
              Escreva...
            </h2>
          </div>
        </div>
      )}
      {/* --- MODAL AMPARO (SOLICITAÇÃO DE AJUDA) --- */}
      {isAmparoOpen && (
        <div className="fixed inset-0 z-[4000] flex items-center justify-center animate-fade-in p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity" onClick={() => setIsAmparoOpen(false)}></div>

          <div className="relative w-full max-w-sm lg:max-w-md bg-[#0A0A0C] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden animate-zoom-in-pulse flex flex-col items-center text-center">

            {/* Header com Ícone Pulsante */}
            <div className="pt-8 pb-4 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4 relative">
                <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-cyan-500"></div>
                <span className="material-symbols-outlined text-3xl text-cyan-400">volunteer_activism</span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">Solicitação de Amparo</h3>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Conexão Interassistencial</p>
            </div>

            {/* Corpo da Mensagem (Cartão Glass) */}
            <div className="w-full px-6 pb-2">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-gray-700 overflow-hidden">
                    <img src="https://i.pravatar.cc/150?img=15" className="w-full h-full object-cover grayscale" alt="Anon" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-200">Companheiro(a) Evolutivo</span>
                    <span className="text-[9px] text-gray-500">Há 5 minutos • Via Campo Holopensênico</span>
                  </div>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed font-medium italic">
                  "Sinto-me desconectado e com baixa energia vital nos últimos dias. Peço, humildemente, o amparo do grupo para recuperar meu equilíbrio homeostático."
                </p>
              </div>
            </div>

            {/* Formas de Ajuda */}
            <div className="w-full px-6 py-4 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider text-left pl-2 mb-2 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-cyan-500"></span> Formas de Auxílio
              </h4>

              <button onClick={() => alert("Exteriorização iniciada...")} className="w-full p-3 rounded-xl bg-[#121214] border border-white/5 hover:border-cyan-500/30 hover:bg-cyan-900/10 flex items-center gap-3 transition-all group group/item">
                <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover/item:text-cyan-300">
                  <span className="material-symbols-outlined text-lg">wifi_tethering</span>
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-xs font-bold text-gray-200">Exteriorização de Energias</span>
                  <span className="text-[10px] text-gray-500">Envie vibrações de paz por 5 min</span>
                </div>
              </button>

              <button onClick={() => alert("Adicionado à Tenepes.")} className="w-full p-3 rounded-xl bg-[#121214] border border-white/5 hover:border-amber-500/30 hover:bg-amber-900/10 flex items-center gap-3 transition-all group group/item">
                <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover/item:text-amber-400">
                  <span className="material-symbols-outlined text-lg">book</span>
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-xs font-bold text-gray-200">Incluir na Tenepes</span>
                  <span className="text-[10px] text-gray-500">Adicione ao seu livro de assistidos</span>
                </div>
              </button>
            </div>

            {/* Footer Actions */}
            <div className="w-full p-6 pt-2 flex gap-3">
              <button onClick={() => setIsAmparoOpen(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 text-xs font-bold uppercase hover:bg-white/5 transition-colors">Fechar</button>
              <button onClick={() => { setIsAmparoOpen(false); alert("Amparo Confirmado. Gratidão!"); }} className="flex-1 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold uppercase shadow-lg shadow-cyan-900/20 transition-all">
                Confirmar Apoio
              </button>
            </div>

          </div>
        </div>
      )}
      <InstallPWA />
      <style>{`
        /* Animação de Slide Up suave para texto */
        @keyframes slideUpFade {
            0% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up-fade {
            animation: slideUpFade 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }

        .font-display { font-family: 'Clash Display', sans-serif; }
        .glass-panel-ultra { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(80px); -webkit-backdrop-filter: blur(80px); }
        .shadow-3d-glow { box-shadow: 0 40px 80px -20px rgba(0,0,0,0.9), 0 0 30px rgba(255,255,255,0.01); }
        .shadow-glow-blue { box-shadow: 0 0 50px rgba(37, 99, 235, 0.7); }
        .filled { font-variation-settings: 'FILL' 1; }

        /* audio-component removido do DOM pelo parser, CSS não necessario, mas mantido por segurança para esconder raw tags se vazarem */
        audio-component { display: none; }
        
        /* --- Elite V2 Menu Styles --- */
        .glass-card {
            background: rgba(18, 18, 20, 0.7);
            backdrop-filter: blur(30px);
            -webkit-backdrop-filter: blur(30px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 25px 50px -12px rgba(0,0,0,0.6);
        }
        .textured-bg {
            background-color: #08080a;
            background-image: 
                radial-gradient(at 0% 0%, rgba(255,255,255,0.03) 0px, transparent 50%),
                radial-gradient(at 100% 100%, rgba(0,0,0,0.8) 0px, transparent 50%),
                repeating-linear-gradient(45deg, rgba(255,255,255,0.01) 0px, rgba(255,255,255,0.01) 1px, transparent 1px, transparent 10px);
            background-size: 100% 100%, 100% 100%, 20px 20px;
        }
        .cerebro-gradient {
            background: linear-gradient(145deg, rgba(10, 25, 30, 1) 0%, rgba(8, 20, 25, 1) 100%);
        }

        /* --- Animations --- */
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin 8s linear infinite; }
        .animate-spin-very-slow { animation: spin 15s linear infinite; }
        
        @keyframes spinReverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        .animate-spin-reverse-slower { animation: spinReverse 20s linear infinite; }
        
        @keyframes pulseSlow { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.15); } }
        .animate-pulse-slow { animation: pulseSlow 8s ease-in-out infinite; }
        .animate-pulse-fast { animation: pulseSlow 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        
        @keyframes scan { 
            0%, 100% { opacity: 0.3; transform: translateY(-10%) scale(1); } 
            50% { opacity: 0.8; transform: translateY(10%) scale(1.05); filter: brightness(1.5); } 
        }
        .animate-scan { animation: scan 3s ease-in-out infinite; }

        @keyframes zoomDrift { 
            0% { transform: scale(1); } 
            100% { transform: scale(1.15); } 
        }
        .animate-zoom-drift { animation: zoomDrift 20s alternate infinite; }

        @keyframes loadingBar { 
            0% { width: 0%; opacity: 0.5; } 
            50% { width: 100%; opacity: 1; } 
            100% { width: 0%; left: 100%; opacity: 0.5; } 
        }
        .animate-loading-bar { animation: loadingBar 2s ease-in-out infinite; }

        @keyframes energyFlow { 
            0% { box-shadow: 0 0 0 0 rgba(34, 211, 238, 0.4); } 
            70% { box-shadow: 0 0 0 10px rgba(34, 211, 238, 0); } 
            100% { box-shadow: 0 0 0 0 rgba(34, 211, 238, 0); } 
        }
        .animate-energy-flow { animation: energyFlow 2s linear infinite; }

        @keyframes deepBreathing { 
            0%, 100% { opacity: 0.6; transform: scale(1); filter: brightness(1) saturate(0.8); } 
            50% { opacity: 0.9; transform: scale(1.05); filter: brightness(1.2) saturate(1.1); } 
        }
        .animate-deep-breathing { animation: deepBreathing 12s ease-in-out infinite; }

        /* Legacy Animations (Keep for compatibility) */
        @keyframes floatVisionPro {
          0% { opacity: 0; transform: scale(0.3) translateY(40px); filter: blur(20px); }
          15% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
          85% { opacity: 1; transform: scale(1.05) translateY(-20px); filter: blur(0); }
          100% { opacity: 0; transform: scale(1.2) translateY(-140px); filter: blur(10px); }
        }
        .animate-float-vision-pro { animation: floatVisionPro 10s cubic-bezier(0.4, 0, 0.2, 1) forwards; }

        @keyframes textShimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        .animate-text-shimmer { background-size: 200% auto; animation: textShimmer 8s linear infinite; }

        .animate-bounce-slow { animation: bounceSlow 5s ease-in-out infinite; }
        @keyframes bounceSlow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }

        .special-paper-bg {
            background-color: rgba(255, 255, 255, 0.8) !important;
            backdrop-filter: blur(20px) saturate(180%) !important;
            -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
            background-image: 
                linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 100%),
                url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E") !important;
            box-shadow: 
                0 8px 32px 0 rgba(0, 0, 0, 0.1) !important,
                inset 0 0 0 1px rgba(255, 255, 255, 0.4) !important,
                inset 0 1px 0 0 rgba(255, 255, 255, 0.6) !important;
            border: 1px solid rgba(255, 255, 255, 0.3) !important;
        }

        .specialty-inset {
            background-color: #f8fafc !important;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.04), inset 0 0 0 1px rgba(255,255,255,0.8) !important;
            border: 1px solid rgba(226, 232, 240, 0.8) !important;
        }


      `}</style>
      {/* BOTÃO FLUTUANTE DE TEMA (MODOS DARK/WHITE) - SOMENTE DESKTOP NO FEED */}
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className={`fixed bottom-8 right-8 z-[200] w-14 h-14 rounded-full hidden lg:flex items-center justify-center shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95 group ${isDarkMode ? 'bg-white/10 text-yellow-400 border-white/20' : 'bg-black/80 text-blue-400 border-black/10'} border backdrop-blur-xl`}
      >
        <span className="material-symbols-outlined text-3xl transition-transform duration-700 group-hover:rotate-[360deg]">
          {isDarkMode ? 'light_mode' : 'dark_mode'}
        </span>
        {/* Glow de Efeito */}
        <div className={`absolute inset-0 rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity ${isDarkMode ? 'bg-yellow-400' : 'bg-blue-400'}`}></div>
      </button>

    </div >
  );
};

export default FeedScreen; 
