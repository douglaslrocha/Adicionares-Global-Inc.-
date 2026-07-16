/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useAppBridge as useApp } from '../components/useAppBridge';
import { Match, UserProfile, Message } from '../components/transloveTypes';
import ProfileDetailsModal from '../components/ProfileDetailsModal';
import { Heart, Search, MessageCircle, MapPin, Sparkles, ArrowLeft, Send, Smile, Camera, Check, ShieldAlert, CheckCheck, Trash2, Shield, Menu, CheckCircle2 } from 'lucide-react';

interface ChatScreenProps {
  onNavigate: (screen: string) => void;
  activePartnerId?: string;
  onClearActivePartner?: () => void;
}

export default function ChatScreen({ onNavigate, activePartnerId, onClearActivePartner }: ChatScreenProps) {
  const { matches, messages, sendMessage, currentUser } = useApp(onNavigate);
  
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPartner, setSelectedPartner] = useState<UserProfile | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Sidebar states
  const [isAmparoActive, setIsAmparoActive] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const triggerAmparoAction = () => {
    setIsAmparoActive(prev => !prev);
    alert("Amparo holográfico ativado no campo holopensênico.");
  };
  const isAdmin = true;
  
  const [inputText, setInputText] = useState('');
  const [typing, setTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activePartnerId) {
      const match = matches.find(m => m.user2_id === activePartnerId || m.profile?.id === activePartnerId);
      if (match) {
        setActiveMatchId(match.id);
      } else if (matches.length > 0) {
        setActiveMatchId(matches[0].id);
      }
      if (onClearActivePartner) onClearActivePartner();
    }
  }, [activePartnerId, matches]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeMatchId]);

  const handleSend = async () => {
    if (!inputText.trim() || !activeMatchId) return;
    const text = inputText;
    setInputText('');
    await sendMessage(activeMatchId, text);
    
    setTyping(true);
    setTimeout(async () => {
      setTyping(false);
      await sendMessage(
        activeMatchId, 
        'Olá! Li suas publicações no diretório e achei muito interessante seu projeto de pesquisa conscienciológica. Vamos agendar uma tertúlia online?'
      );
    }, 2000);
  };

  const handleSendPhoto = async () => {
    if (!activeMatchId) return;
    const mockPhotoUrls = [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600'
    ];
    const randomUrl = mockPhotoUrls[Math.floor(Math.random() * mockPhotoUrls.length)];
    await sendMessage(activeMatchId, 'Enviou uma foto 📷', undefined, randomUrl);
  };

  // --- RENDER STATE 1: ACTIVE CHAT WINDOW ---
  if (activeMatchId) {
    const activeMatch = matches.find(m => m.id === activeMatchId);
    const partner = activeMatch?.profile;
    const activeMessages = messages.filter(m => m.match_id === activeMatchId);

    return (
      <div className="w-full h-screen bg-neutral-950 text-white flex flex-col justify-between fixed inset-0 z-30 pt-4">
        {/* Chat top header with only partner info & back button */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-900 bg-neutral-950/90 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveMatchId(null)}
              className="p-1.5 hover:bg-neutral-900 rounded-lg text-neutral-400 hover:text-white transition cursor-pointer"
            >
              <ArrowLeft size={18} />
            </button>
            
            <div className="relative cursor-pointer" onClick={() => partner && setSelectedPartner(partner)}>
              <img 
                src={partner?.avatar_url} 
                className="w-10 h-10 rounded-full object-cover border border-white/10" 
                alt={partner?.name} 
              />
              {partner?.is_online && (
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-neutral-950"></div>
              )}
            </div>
            
            <div>
              <h4 
                className="font-bold text-sm hover:underline cursor-pointer flex items-center gap-1.5"
                onClick={() => partner && setSelectedPartner(partner)}
              >
                {partner?.name}
                {partner?.is_verified && <CheckCircle2 size={12} fill="white" className="text-indigo-400" />}
              </h4>
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block leading-none">
                {partner?.specialty}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => {
                if (confirm('Tem certeza que deseja excluir esta conversa de forma definitiva?')) {
                  setActiveMatchId(null);
                }
              }}
              className="p-2 hover:bg-red-500/10 rounded-lg text-neutral-400 hover:text-red-400 transition cursor-pointer"
              title="Excluir Conversa"
            >
              <Trash2 size={16} />
            </button>
            <button 
              onClick={() => {
                alert('Denúncia recebida pela comissão de Cosmoeticologia da Adicionares. Estaremos analisando os fatos.');
              }}
              className="p-2 hover:bg-amber-500/10 rounded-lg text-neutral-400 hover:text-amber-400 transition cursor-pointer"
              title="Denunciar Desvio Cosmoético"
            >
              <ShieldAlert size={16} />
            </button>
          </div>
        </div>

        {/* Message Container Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-950 custom-scrollbar relative">
          {activeMessages.length > 0 ? (
            activeMessages.map((msg) => {
              const isMe = msg.sender_id === currentUser?.id;
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} w-full animate-fade-in`}>
                  <div className={`max-w-[75%] rounded-2xl p-3.5 ${
                    isMe 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-neutral-900 border border-white/5 text-neutral-200 rounded-tl-none'
                  }`}>
                    {msg.image_url ? (
                      <div className="mb-2 rounded-lg overflow-hidden border border-white/10">
                        <img src={msg.image_url} alt="Shared attachment" className="max-w-full h-auto object-cover max-h-60" />
                      </div>
                    ) : null}
                    <p className="text-xs leading-relaxed font-medium">{msg.content}</p>
                    <div className="flex items-center justify-end gap-1 mt-1 text-[8px] text-white/50">
                      <span>14:40</span>
                      {isMe && <CheckCheck size={10} className="text-cyan-400" />}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <span className="text-3xl mb-3">💬</span>
              <p className="text-xs text-neutral-500">Nenhuma mensagem trocada ainda. Envie uma mensagem para iniciar o debate científico!</p>
            </div>
          )}

          {typing && (
            <div className="flex justify-start w-full">
              <div className="bg-neutral-900 border border-white/5 p-3 rounded-2xl rounded-tl-none flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Action input panel */}
        <div className="p-3 bg-neutral-950 border-t border-neutral-900 flex items-center gap-2">
          <button 
            onClick={handleSendPhoto}
            className="p-2.5 bg-neutral-900 hover:bg-neutral-800 rounded-xl text-neutral-400 hover:text-white transition cursor-pointer"
            title="Compartilhar Mídia"
          >
            <Camera size={18} />
          </button>
          
          <input 
            type="text" 
            placeholder="Digite sua mensagem de pesquisa..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-[#0A0A0C] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-indigo-500/50 transition"
          />

          <button 
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl transition cursor-pointer"
          >
            <Send size={16} />
          </button>
        </div>

        {selectedPartner && (
          <ProfileDetailsModal profile={selectedPartner} onClose={() => setSelectedPartner(null)} />
        )}
      </div>
    );
  }

  // --- RENDER STATE 2: MATCHES LIST (MatchesPage.tsx) ---
  const filteredMatches = matches.filter(m => 
    m.profile?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen bg-neutral-950 text-white pb-24 md:pb-8 pt-24 relative overflow-x-hidden">
      {/* MOBILE MENU DRAWER - IDENTICAL TO FEED */}
      <div
        className={`fixed inset-0 z-[500] transition-all duration-500 lg:hidden ${isMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
        <aside className={`absolute left-0 top-0 bottom-0 w-[85%] max-w-sm bg-[#050507] border-r border-white/5 transition-transform duration-500 flex flex-col z-[1000] overflow-hidden ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-900/10 blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-rose-900/10 blur-[80px] pointer-events-none"></div>
          <div className="flex flex-col h-full relative z-10 px-3 py-4">
            <header className="flex justify-between items-center mb-2 shrink-0 relative group/header">
              <div className="flex items-center flex-1 pr-2">
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center w-8 h-8 rounded-full text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                >
                  <span className="material-symbols-outlined text-[24px]">arrow_back</span>
                </button>
                <div className="h-[1px] flex-1 ml-3 bg-gradient-to-r from-white/40 via-white/10 to-transparent"></div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="w-9 h-9 rounded-full flex items-center justify-center border bg-white/5 hover:bg-white/10 border-white/5 hover:border-white/20 text-gray-400 hover:text-white transition"
                >
                  ✕
                </button>
              </div>
            </header>
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pb-6">
              <div
                onClick={() => { onNavigate('profile-edit'); setIsMenuOpen(false); }}
                className="relative w-full rounded-[2.5rem] overflow-hidden group transition-all duration-500 cursor-pointer"
              >
                <div className="absolute -inset-[2px] rounded-[2.6rem] bg-gradient-to-br from-white/20 via-transparent to-cyan-500/20 opacity-70 blur-sm"></div>
                <div className="content-wrapper w-full h-full relative z-10 rounded-[2.5rem] border border-white/5 bg-[#08080A]">
                  <div className="p-8 pb-8 flex flex-col items-center text-center space-y-5 relative z-10">
                    <div className="relative mt-2">
                      <div className="p-[4px] rounded-[2rem] bg-gradient-to-br from-white/10 to-black relative">
                        <div className="relative z-10 w-48 h-56 rounded-[1.8rem] overflow-hidden bg-gray-800 border border-white/5">
                          <img 
                            src="https://d363e3cb0fedde3cc603722077e49900.cdn.bubble.io/f1768342953899x415168906544139000/5.png?_gl=1*9ruv5n*_gcl_au*MTczMzAyMTYxMC4xNzY2Mzg0MjQ0*_ga*OTYzNzc1MDE2LjE3MjQzNzE3ODg.*_ga_BFPVR2DEE2*czE3Njg0MzQ4MzEkbzQ2JGcxJHQxNzY4NDM0ODU2JGozNSRsMCRoMA.." 
                            className="w-full h-full object-cover" 
                            alt="Profile" 
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3 pt-4 w-full flex flex-col items-center">
                      <h2 className="text-[28px] font-bold text-white tracking-tight">Douglas Rocha</h2>
                      <div className="flex items-center justify-center gap-1.5 text-gray-400">
                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                        <span className="text-[10px] font-semibold tracking-widest uppercase">Cognópolis, Foz</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                onClick={() => { onNavigate('matches'); setIsMenuOpen(false); }}
                className="relative w-full h-32 rounded-[2rem] overflow-hidden group border border-white/10 shadow-lg bg-[#0A0A0C] cursor-pointer hover:border-white/30 transition duration-300"
              >
                <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-white">Metchs</h3>
                      <p className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold">Afinidades e Sincronias</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <span className="material-symbols-outlined text-lg">favorite</span>
                    </div>
                  </div>
                </div>
              </div>
              <div
                onClick={() => { onNavigate('chat'); setIsMenuOpen(false); }}
                className="relative w-full h-32 rounded-[2rem] overflow-hidden group border border-white/10 shadow-lg bg-[#0A0A0C] cursor-pointer hover:border-white/30 transition duration-300"
              >
                <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-white">Conversas</h3>
                      <p className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold">Mensagens e Matches</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <span className="material-symbols-outlined text-lg">chat</span>
                    </div>
                  </div>
                </div>
              </div>
              <div
                onClick={() => { onNavigate('holoteca'); setIsMenuOpen(false); }}
                className="relative w-full h-32 rounded-[2rem] overflow-hidden group border border-white/10 shadow-lg bg-[#0A0A0C] cursor-pointer hover:border-white/30 transition duration-300"
              >
                <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-white">Holoteca</h3>
                      <p className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold">Estudos e Tratados</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <span className="material-symbols-outlined text-lg">menu_book</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* SIDEBAR ÚNICA ESQUERDA (DESKTOP) - HOVER EXPLOSION */}
      <aside className="hidden lg:flex fixed left-6 top-1/2 -translate-y-1/2 z-[200] flex-col group/sidebar h-[300px] hover:top-0 hover:h-screen hover:translate-y-0 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]">
        <div className="relative h-full flex flex-col transition-all duration-300 w-[60px] hover:w-[260px]">
          {/* 1. ESTADO REPOUSO: BARRA VERTICAL "PILULA" (Some no Hover) */}
          <div
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
            className={`absolute left-0 top-0 bottom-0 w-[60px] flex flex-col items-center justify-center gap-6 ${isDarkMode ? 'bg-[#050505]/40 border-white/20' : 'bg-gradient-to-b from-black/60 via-black/70 to-black/80 border-white/30'} backdrop-blur-2xl border-[1px] rounded-full shadow-[0_20px_40px_-5px_rgba(0,0,0,0.8)] transition-all duration-500 ease-in-out group-hover/sidebar:opacity-0 pointer-events-auto z-50`}
          >
            <div className="w-12 h-12 flex items-center justify-center transition-all duration-500 group-hover/sidebar:scale-110">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg group-hover/sidebar:translate-x-1 transition-transform duration-300 text-white">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* 2. ESTADO ATIVO: CARDS FLUTUANTES (Aparecem no Hover) */}
          <div className="flex flex-col h-full w-[260px] pointer-events-none group-hover/sidebar:pointer-events-auto z-30 overflow-y-auto no-scrollbar space-y-4 pb-4 pl-1 pt-[120px]">
            <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-cyan-900/5 blur-[80px] pointer-events-none opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-700"></div>

            {/* 1. PROFILE SUPER CARD */}
            <div
              onClick={() => onNavigate('profile-edit')}
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
              onClick={() => onNavigate('matches')}
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
              onClick={() => onNavigate('chat')}
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
              onClick={() => onNavigate('holoteca')}
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
              onClick={() => onNavigate('feed')}
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
          </div>
        </div>
      </aside>

      {/* HEADER GLOBAL - IDENTICAL TO FEED */}
      <header className="fixed top-0 left-0 w-full z-[300] flex justify-center pt-4 lg:pt-6 pointer-events-none px-4 transition-all duration-500">
        <div className="pointer-events-auto bg-[#08080A]/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-2 flex items-center gap-2 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] max-w-[95vw] lg:max-w-[850px] w-full relative overflow-hidden">
          
          <div onClick={() => onNavigate('feed')} className="flex items-center gap-3 pl-3 pr-4 md:pl-5 md:pr-6 py-2 bg-[#141416] rounded-[2rem] border border-white/5 cursor-pointer shadow-inner shrink-0">
            <img 
              src="https://d363e3cb0fedde3cc603722077e49900.cdn.bubble.io/f1766384422562x463430689164383360/logo%20da%20Adicionares%20Global%20Inc..png" 
              className="w-9 h-9 object-contain" 
              alt="Logo" 
            />
            <span className="hidden md:inline text-[10px] font-bold text-white tracking-widest leading-none font-display">ADICIONARES</span>
          </div>

          <nav className="flex-1 bg-black/40 rounded-[2rem] border border-white/10 h-12 flex items-center justify-start overflow-x-auto no-scrollbar px-2 mx-1 lg:mx-2">
            <div className="flex items-center gap-1.5 w-max">
              <button onClick={() => onNavigate('feed')} className="px-3 py-1.5 rounded-full text-xs font-bold text-gray-400 hover:text-white transition">FEED</button>
              <button onClick={() => onNavigate('grupo')} className="px-3 py-1.5 rounded-full text-xs font-bold text-gray-400 hover:text-white transition">GRUPO</button>
              <button onClick={() => onNavigate('matches')} className="px-3 py-1.5 rounded-full text-xs font-bold text-gray-400 hover:text-white transition">METCHS</button>
              <button onClick={() => onNavigate('chat')} className="px-4 py-1.5 rounded-full text-xs font-bold bg-white/10 text-white border border-white/10 transition">CHAT</button>
            </div>
          </nav>

          <div className="flex items-center gap-2 shrink-0 pr-2">
            <button onClick={() => setIsMenuOpen(true)} className="lg:hidden w-11 h-11 rounded-[2rem] bg-[#141416] border border-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-all active:scale-95 cursor-pointer">
              <Menu size={20} />
            </button>

            <div onClick={() => onNavigate('profile-edit')} className="hidden lg:flex items-center gap-3 pl-1.5 pr-5 py-1.5 bg-[#141416] rounded-[2rem] border border-white/10 cursor-pointer hover:border-white/30 transition-all shadow-inner">
              <div className="w-8 h-8 rounded-full relative p-[1px] bg-gradient-to-tr from-gray-700 to-black">
                <img 
                  src="https://d363e3cb0fedde3cc603722077e49900.cdn.bubble.io/f1768342953899x415168906544139000/5.png?_gl=1*9ruv5n*_gcl_au*MTczMzAyMTYxMC4xNzY2Mzg0MjQ0*_ga*OTYzNzc1MDE2LjE3MjQzNzE3ODg.*_ga_BFPVR2DEE2*czE3Njg0MzQ4MzEkbzQ2JGcxJHQxNzY4NDM0ODU2JGozNSRsMCRoMA.." 
                  className="w-full h-full rounded-full object-cover border border-white/10" 
                  alt="Profile" 
                />
              </div>
              <span className="text-[10px] font-bold text-gray-300">Douglas R.</span>
            </div>
          </div>

        </div>
      </header>

      {/* BACKGROUND CÓSMICO IMERSIVO */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1600&q=90"
          className="w-full h-full object-cover opacity-20 scale-110"
          alt="Cosmos"
        />
      </div>

      <div className="max-w-xl mx-auto px-4 mt-6 relative z-10">
        
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-3.5 text-neutral-600" size={16} />
          <input 
            type="text" 
            placeholder="Buscar por nome de parceiro..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#08080A]/60 border border-white/10 rounded-2xl text-xs text-white outline-none focus:border-indigo-500/50 transition backdrop-blur-md"
          />
        </div>

        {/* Matches / Chat List */}
        <div className="space-y-3.5">
          {filteredMatches.length > 0 ? (
            filteredMatches.map((match) => (
              <div 
                key={match.id}
                onClick={() => setActiveMatchId(match.id)}
                className="p-4 bg-[#08080A]/60 hover:bg-[#08080A]/95 border border-white/5 rounded-2xl flex items-center justify-between transition cursor-pointer hover:border-indigo-500/20 backdrop-blur-md"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative shrink-0">
                    <img src={match.profile?.avatar_url} className="w-12 h-12 rounded-full object-cover border border-white/10" alt="avatar" />
                    {match.profile?.is_online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-neutral-950 shadow-sm animate-pulse"></div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-white truncate flex items-center gap-1">
                      {match.profile?.name}
                      {match.profile?.is_verified && <CheckCircle2 size={12} fill="white" className="text-indigo-400" />}
                    </h4>
                    <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block mt-0.5 leading-none">
                      {match.profile?.specialty}
                    </span>
                    <p className="text-xs text-neutral-400 mt-1 truncate max-w-xs">{match.last_message || 'Inicie a conversa...'}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="text-[9px] text-neutral-500 font-semibold uppercase">{match.last_message_time || '10:32'}</span>
                  {match.unread_count && match.unread_count > 0 ? (
                    <span className="px-2 py-0.5 bg-indigo-600 text-white rounded-full text-[9px] font-black">{match.unread_count}</span>
                  ) : null}
                </div>
              </div>
            ))
          ) : (
            <div className="p-16 text-center bg-[#08080A]/40 border border-white/10 rounded-[2.5rem] flex flex-col items-center">
              <MessageCircle size={28} className="text-neutral-500 mb-3" />
              <h4 className="text-sm font-bold text-neutral-200">Nenhuma conversa encontrada</h4>
              <p className="text-xs text-neutral-500 mt-1 max-w-xs leading-relaxed">Dê like em perfis na aba de Metchs ou clique em 'Enviar Mensagem' no Grupo.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
