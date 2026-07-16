import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '../supabaseClient';

// --- Interfaces Copied and Extended from Cockpit/Cinema/Holoteca ---

// 1. Cinema Interfaces
export type BlockType = 
  | 'header' 
  | 'definition' 
  | 'video' 
  | 'reflection_axes' 
  | 'text_section' // Redação
  | 'axiom' 
  | 'confrontology' 
  | 'detalhologia' 
  | 'fatulogia_dual' 
  | 'argumentology' 
  | 'challenge';

export interface CinemaBlock {
  id: string;
  type: BlockType;
  title: string;
  content: any; // Flexible content based on type
  isVisible: boolean;
}

// 2. Holoteca Interfaces
export type HolotecaLevel = 'Platina' | 'Prata' | 'Aço' | 'Cobre'; // Added Cobre just in case, though themes use Platinum, Silver, Gunmetal (Aço)

export interface HolotecaCard {
  id: string;
  title: string;
  subtitle: string; // Added
  specialty: string; // Used as Category
  duration: string;
  level: HolotecaLevel; 
  cinemaId: string;
  views: number;
  status: 'Publicado' | 'Rascunho';
  thumbnail: string;
  videoUrl: string; // Added
  richText: string; // Added
  tags: string[];   // Added
}

// 3. Egrégora Interfaces (keeping for Cockpit completeness)
export interface Participant {
  id: string;
  name: string;
  email: string;
  specialty: string;
  role: 'Membro' | 'Moderador' | 'Epicon';
  status: 'Ativo' | 'Suspenso' | 'Banido';
  avatar: string;
  joinDate: string;
  lastActive: string;
  contribution: number;
  // Extended fields for Matches/Discovery
  age?: number;
  city?: string;
  bio?: string;
  projects?: string[];
  publications?: string[];
  isOnline?: boolean;
}

export interface Like {
  id: string;
  senderId: string;
  receiverId: string;
  value: boolean; // true = Sim (Curtir), false = Não (Pular)
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  time: string;
}

export interface Chat {
  id: string;
  partnerId: string;
  isMatch: boolean;
  messages: ChatMessage[];
}

// --- Context Definition ---

interface AdicionaresContextType {
  // States
  cinemaBlocks: CinemaBlock[];
  holotecaCards: HolotecaCard[];
  participants: Participant[];
  likes: Like[];
  chats: Chat[];
  
  // Setters (Actions)
  setCinemaBlocks: React.Dispatch<React.SetStateAction<CinemaBlock[]>>;
  setHolotecaCards: React.Dispatch<React.SetStateAction<HolotecaCard[]>>;
  setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>;
  setLikes: React.Dispatch<React.SetStateAction<Like[]>>;
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  
  // Helpers
  addCinemaBlock: (type: BlockType) => void;
  updateCinemaBlock: (id: string, content: any) => void;
  toggleCinemaBlockVisibility: (id: string) => void;
  removeCinemaBlock: (id: string) => void;
  
  addHolotecaCard: () => void;
  updateHolotecaCard: (id: string, updates: Partial<HolotecaCard>) => void;
  deleteHolotecaCard: (id: string) => void;

  // Swiping & Matches & Chat Helpers
  sendLike: (receiverId: string, value: boolean) => Promise<{ isMatch: boolean }>;
  sendDirectMessage: (receiverId: string, text: string) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  reportUser: (userId: string, reason: string) => Promise<void>;
}

const AdicionaresContext = createContext<AdicionaresContextType | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cinemaBlocks, setCinemaBlocks] = useState<CinemaBlock[]>([]);
  const [holotecaCards, setHolotecaCards] = useState<HolotecaCard[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [likes, setLikes] = useState<Like[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);

  // Carregar dados do Supabase ao montar o componente
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("AdicionaresContext: Carregando dados...");
        const { data: blocks, error: err1 } = await supabase
          .from('cinema_blocks')
          .select('*')
          .order('created_at', { ascending: true });
        
        console.log("AdicionaresContext: cinema_blocks:", { data: blocks, error: err1 });

        if (!err1 && blocks) {
          setCinemaBlocks(blocks.map((b: any) => ({
            id: b.id,
            type: b.type,
            title: b.title,
            content: b.content,
            isVisible: b.is_visible
          })) as CinemaBlock[]);
        }

        const { data: cards, error: err2 } = await supabase
          .from('holoteca_cards')
          .select('*')
          .order('created_at', { ascending: false });
        
        console.log("AdicionaresContext: holoteca_cards:", { data: cards, error: err2 });

        if (!err2 && cards) {
          setHolotecaCards(cards.map((c: any) => ({
            id: c.id,
            title: c.title,
            subtitle: c.subtitle,
            specialty: c.specialty,
            duration: c.duration,
            level: c.level,
            cinemaId: c.cinema_id,
            views: c.views,
            status: c.status,
            thumbnail: c.thumbnail,
            videoUrl: c.video_url,
            richText: c.rich_text,
            tags: c.tags || []
          })) as HolotecaCard[]);
        }

        const { data: parts, error: err3 } = await supabase
          .from('participants')
          .select('*')
          .order('name', { ascending: true });
        
        console.log("AdicionaresContext: participants:", { data: parts, error: err3 });

        const MOCK_RESEARCHERS: Participant[] = [
          {
            id: 'user-roberto',
            name: 'Roberto Alves',
            email: 'roberto@adicionares.com',
            specialty: 'Projeciologia',
            role: 'Membro',
            status: 'Ativo',
            avatar: 'https://i.pravatar.cc/150?img=15',
            joinDate: '2025-01-10',
            lastActive: 'Agora',
            contribution: 120,
            age: 32,
            city: 'Foz do Iguaçu, PR',
            bio: 'Pesquisador de Epiconologia e Projetoterapia. Foco em técnicas de autodesassédio e mapeamento da sinalética energética pessoal.',
            projects: ['Projetoterapia Aplicada', 'Sinalética Evolutiva'],
            publications: ['Manual de Projeciologia', 'Artigo sobre Acoplamento Áurico'],
            isOnline: true
          },
          {
            id: 'user-jessie',
            name: 'Jessie C.',
            email: 'jessie@adicionares.com',
            specialty: 'Assistenciologia',
            role: 'Moderador',
            status: 'Ativo',
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
            joinDate: '2024-11-05',
            lastActive: '5m atrás',
            contribution: 340,
            age: 28,
            city: 'Rio de Janeiro, RJ',
            bio: 'Voluntária e pesquisadora de Bioenergolocalização e Assistência Holossomática. Sempre aberta a coautorias em artigos.',
            projects: ['Dinâmica de Bioenergias', 'Coautoria Artigo Assistencial'],
            publications: ['Sinalética Paradígma', 'O Fenômeno da Cosmoética'],
            isOnline: true
          },
          {
            id: 'user-patricia',
            name: 'Patricia M.',
            email: 'patricia@adicionares.com',
            specialty: 'Mentalsomática',
            role: 'Epicon',
            status: 'Ativo',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
            joinDate: '2023-05-12',
            lastActive: '2h atrás',
            contribution: 980,
            age: 40,
            city: 'Foz do Iguaçu, PR',
            bio: 'Epicon e Educadora conscienciológica. Dedicada à escrita de verbetes na Holoteca e mentoria de jovens pesquisadores.',
            projects: ['Ampliação da Holoteca', 'Mentoria Intelectográfica'],
            publications: ['Tratado de Cosmoeticologia', 'Verbete Autopesquisologia'],
            isOnline: false
          },
          {
            id: 'user-marcelo',
            name: 'Marcelo S.',
            email: 'marcelo@adicionares.com',
            specialty: 'Cosmoeticologia',
            role: 'Membro',
            status: 'Ativo',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
            joinDate: '2025-02-20',
            lastActive: '1d atrás',
            contribution: 75,
            age: 35,
            city: 'São Paulo, SP',
            bio: 'Focado no estudo do desassédio mentalsomático em ambientes corporativos e vivência prática do paradigma consciencial.',
            projects: ['Desassédio Corporativo'],
            publications: ['Monografia do Desassédio'],
            isOnline: false
          }
        ];

        let loadedParticipants = MOCK_RESEARCHERS;
        if (!err3 && parts && parts.length > 0) {
          // Merge Supabase participants with our mock swiping fields
          loadedParticipants = parts.map((p: any) => {
            const mock = MOCK_RESEARCHERS.find(m => m.name.toLowerCase() === p.name.toLowerCase());
            return {
              ...p,
              age: mock?.age || 30,
              city: mock?.city || 'Foz do Iguaçu, PR',
              bio: mock?.bio || 'Pesquisador voluntário na Adicionares Global Inc.',
              projects: mock?.projects || ['Projeto de Pesquisa'],
              publications: mock?.publications || ['Publicação Científica'],
              isOnline: mock?.isOnline !== undefined ? mock.isOnline : true
            };
          });
        }
        setParticipants(loadedParticipants);

        // Pre-populate some likes from others to user-douglas
        // This ensures swiping "Sim" on Roberto or Jessie immediately triggers a Match!
        const initialLikes: Like[] = [
          {
            id: 'like-1',
            senderId: 'user-roberto',
            receiverId: 'user-douglas',
            value: true,
            createdAt: new Date().toISOString()
          },
          {
            id: 'like-2',
            senderId: 'user-jessie',
            receiverId: 'user-douglas',
            value: true,
            createdAt: new Date().toISOString()
          }
        ];
        setLikes(initialLikes);

        // Pre-populate a default message history for demonstration
        setChats([
          {
            id: 'chat-roberto',
            partnerId: 'user-roberto',
            isMatch: true,
            messages: [
              {
                id: 'm1',
                chatId: 'chat-roberto',
                senderId: 'user-roberto',
                text: 'Olá Douglas! Vi seu artigo sobre sinalética parapsíquica, sensacional!',
                time: '20 min atrás'
              },
              {
                id: 'm2',
                chatId: 'chat-roberto',
                senderId: 'user-douglas',
                text: 'Olá Roberto, muito obrigado! Fico feliz que tenha gostado. Você pesquisa algo similar?',
                time: '15 min atrás'
              },
              {
                id: 'm3',
                chatId: 'chat-roberto',
                senderId: 'user-roberto',
                text: 'Sim! Estou mapeando a sinalética em laboratório de projeção lúcida. Podemos cooperar.',
                time: '10 min atrás'
              }
            ]
          }
        ]);
      } catch (err) {
        console.error('Erro ao carregar dados do Supabase:', err);
      }
    };
    loadData();
  }, []);

  // Helpers Cinema
  const addCinemaBlock = async (type: BlockType) => {
    const newBlock: CinemaBlock = {
      id: `b${Date.now()}`,
      type,
      title: type.toUpperCase(),
      isVisible: true,
      content: getInitialContentForType(type)
    };
    setCinemaBlocks(prev => [...prev, newBlock]);
    
    await supabase.from('cinema_blocks').insert([{
      id: newBlock.id,
      type: newBlock.type,
      title: newBlock.title,
      content: newBlock.content,
      is_visible: newBlock.isVisible
    }]);
  };

  const getInitialContentForType = (type: BlockType) => {
     switch(type) {
       case 'header': return { title: 'NOVO TÍTULO', id: 'VER-000', specialty: 'GERAL', date: 'Data Atual' };
       case 'video': return { url: '', label: 'VÍDEO', duration: '00:00' };
       case 'reflection_axes': return [];
       case 'axiom': return 'Frase de impacto...';
       case 'confrontology': return { orto: { title: 'Orto', desc: '', items: [] }, pato: { title: 'Pato', desc: '', items: [] } };
       case 'text_section': return { headline: "Nova Seção", text: "<p>Conteúdo...</p>", image: "", imageLabel: "", axiom: "" };
       case 'detalhologia': return { intro: "Intro...", factors: [], image: "", docLabel: "" };
       case 'fatulogia_dual': return { fatuologia: [], parafatuologia: [] };
       case 'argumentology': return { text: "Texto...", quote: "Citação..." };
       case 'challenge': return [];
       case 'definition': return 'Definição...';
       default: return 'Conteúdo...';
     }
  };

  const updateCinemaBlock = async (id: string, content: any) => {
    setCinemaBlocks(prev => prev.map(b => b.id === id ? { ...b, content } : b));
    await supabase
      .from('cinema_blocks')
      .update({ content })
      .eq('id', id);
  };

  const toggleCinemaBlockVisibility = async (id: string) => {
    let updatedVal = true;
    setCinemaBlocks(prev => prev.map(b => {
      if (b.id === id) {
        updatedVal = !b.isVisible;
        return { ...b, isVisible: updatedVal };
      }
      return b;
    }));
    await supabase
      .from('cinema_blocks')
      .update({ is_visible: updatedVal })
      .eq('id', id);
  };

  const removeCinemaBlock = async (id: string) => {
    setCinemaBlocks(prev => prev.filter(b => b.id !== id));
    await supabase
      .from('cinema_blocks')
      .delete()
      .eq('id', id);
  };

  // Helpers Holoteca
  const addHolotecaCard = async () => {
    const newId = `h${Date.now()}`;
    const newCard: HolotecaCard = { 
        id: newId, 
        title: 'Novo Registro', 
        subtitle: 'Subtítulo do registro...',
        specialty: 'GERAL', 
        duration: '10 min', 
        level: 'Aço', 
        cinemaId: 'VER-000', 
        views: 0, 
        status: 'Rascunho', 
        thumbnail: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=400&q=80',
        videoUrl: '',
        richText: '<p>Novo conteúdo...</p>',
        tags: []
    };
    setHolotecaCards(prev => [newCard, ...prev]);

    await supabase.from('holoteca_cards').insert([{
      id: newCard.id,
      title: newCard.title,
      subtitle: newCard.subtitle,
      specialty: newCard.specialty,
      duration: newCard.duration,
      level: newCard.level,
      cinema_id: newCard.cinemaId,
      views: newCard.views,
      status: newCard.status,
      thumbnail: newCard.thumbnail,
      video_url: newCard.videoUrl,
      rich_text: newCard.richText,
      tags: newCard.tags
    }]);
  };

  const updateHolotecaCard = async (id: string, updates: Partial<HolotecaCard>) => {
    setHolotecaCards(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));

    const dbUpdates: any = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.subtitle !== undefined) dbUpdates.subtitle = updates.subtitle;
    if (updates.specialty !== undefined) dbUpdates.specialty = updates.specialty;
    if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
    if (updates.level !== undefined) dbUpdates.level = updates.level;
    if (updates.cinemaId !== undefined) dbUpdates.cinema_id = updates.cinemaId;
    if (updates.views !== undefined) dbUpdates.views = updates.views;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.thumbnail !== undefined) dbUpdates.thumbnail = updates.thumbnail;
    if (updates.videoUrl !== undefined) dbUpdates.video_url = updates.videoUrl;
    if (updates.richText !== undefined) dbUpdates.rich_text = updates.richText;
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;

    await supabase
      .from('holoteca_cards')
      .update(dbUpdates)
      .eq('id', id);
  };

  const deleteHolotecaCard = async (id: string) => {
    setHolotecaCards(prev => prev.filter(c => c.id !== id));
    await supabase
      .from('holoteca_cards')
      .delete()
      .eq('id', id);
  };

  // Swiping & Matches & Chat Helpers
  const sendLike = async (receiverId: string, value: boolean) => {
    const newLike: Like = {
      id: `like-${Date.now()}`,
      senderId: 'user-douglas',
      receiverId,
      value,
      createdAt: new Date().toISOString()
    };
    
    setLikes(prev => [...prev, newLike]);
    
    // Check if the other person liked the user too
    const otherLiked = likes.some(l => l.senderId === receiverId && l.receiverId === 'user-douglas' && l.value === true);
    
    if (value && otherLiked) {
      // It's a MATCH! Create a new Chat channel
      const chatId = `chat-match-${Date.now()}`;
      const newChat: Chat = {
        id: chatId,
        partnerId: receiverId,
        isMatch: true,
        messages: [
          {
            id: `msg-${Date.now()}`,
            chatId,
            senderId: 'system',
            text: 'Conexão Pensênica Estabelecida! Vocês demonstraram afinidade de pesquisa/projetos.',
            time: 'Agora'
          }
        ]
      };
      setChats(prev => [newChat, ...prev]);
      return { isMatch: true };
    }
    
    return { isMatch: false };
  };

  const sendDirectMessage = async (receiverId: string, text: string) => {
    // Find existing chat or create a new one (normal DM)
    const existingChat = chats.find(c => c.partnerId === receiverId);
    const msgId = `msg-${Date.now()}`;
    const time = 'Agora';
    
    if (existingChat) {
      const newMessage: ChatMessage = {
        id: msgId,
        chatId: existingChat.id,
        senderId: 'user-douglas',
        text,
        time
      };
      setChats(prev => prev.map(c => c.id === existingChat.id ? { ...c, messages: [...c.messages, newMessage] } : c));
    } else {
      const chatId = `chat-dm-${Date.now()}`;
      const newChat: Chat = {
        id: chatId,
        partnerId: receiverId,
        isMatch: false,
        messages: [
          {
            id: msgId,
            chatId,
            senderId: 'user-douglas',
            text,
            time
          }
        ]
      };
      setChats(prev => [newChat, ...prev]);
    }
  };

  const deleteChat = async (chatId: string) => {
    setChats(prev => prev.filter(c => c.id !== chatId));
  };

  const reportUser = async (userId: string, reason: string) => {
    console.log(`User ${userId} reported for: ${reason}`);
    setParticipants(prev => prev.map(p => p.id === userId ? { ...p, status: 'Suspenso' } : p));
  };

  return (
    <AdicionaresContext.Provider value={{
      cinemaBlocks, holotecaCards, participants, likes, chats,
      setCinemaBlocks, setHolotecaCards, setParticipants, setLikes, setChats,
      addCinemaBlock, updateCinemaBlock, toggleCinemaBlockVisibility, removeCinemaBlock,
      addHolotecaCard, updateHolotecaCard, deleteHolotecaCard,
      sendLike, sendDirectMessage, deleteChat, reportUser
    }}>
      {children}
    </AdicionaresContext.Provider>
  );
};

export const useGlobalContext = () => {
  const context = useContext(AdicionaresContext);
  if (!context) {
    throw new Error('useGlobalContext must be used within a GlobalProvider');
  }
  return context;
};
