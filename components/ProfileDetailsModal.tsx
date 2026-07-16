/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile } from './transloveTypes';
import { useAppBridge as useApp } from './useAppBridge';
import { X, MapPin, CheckCircle2, Heart, Star, Flame, Lock, Eye, Sparkles, MessageSquare, DollarSign, Wallet, RefreshCw, QrCode, Film, Globe } from 'lucide-react';

interface ProfileDetailsModalProps {
  profile: UserProfile;
  onClose: () => void;
}

export default function ProfileDetailsModal({ profile, onClose }: ProfileDetailsModalProps) {
  const { 
    currentUser,
    desirePoints, 
    unlockedPhotos, 
    unlockPhoto, 
    unlockedSpaces,
    unlockSpace,
    sendLike, 
    navigateTo, 
    matches, 
    earnPoints 
  } = useApp();
  
  const [activePhoto, setActivePhoto] = useState<string>(profile.avatar_url);
  const [liked, setLiked] = useState(false);
  const [superLiked, setSuperLiked] = useState(false);
  
  // Pix deposit states for visitors
  const [showPixDeposit, setShowPixDeposit] = useState(false);
  const [pixAmount, setPixAmount] = useState(30);
  const [pixCopied, setPixCopied] = useState(false);
  const [isProcessingPix, setIsProcessingPix] = useState(false);

  // Combine public photos
  const publicPhotos = [profile.avatar_url];
  const privatePhotos = profile.private_photos || [];

  const isSpaceUnlocked = profile.gender !== 'travesti' || 
    unlockedSpaces.includes(profile.id) || 
    (currentUser && currentUser.id === profile.id);

  const handleLike = async () => {
    if (liked) return;
    setLiked(true);
    await sendLike(profile.id, false);
  };

  const handleSuperLike = async () => {
    if (superLiked) return;
    setSuperLiked(true);
    await sendLike(profile.id, true);
  };

  const handleUnlockSpace = () => {
    const cost = profile.private_space_price || 15.00;
    if (desirePoints >= cost) {
      const success = unlockSpace(profile.id, cost);
      if (success) {
        // Space unlocked successfully!
      }
    } else {
      setShowPixDeposit(true);
    }
  };

  const isMatched = matches.some(m => m.profile?.id === profile.id);

  // Safe list of default fetiches if not defined
  const fetiches = profile.fetishes || ['Conversas Provocantes', 'Encontros Secretos', 'Visual Sexy', 'Toques Delicados'];

  return (
    <div className="fixed inset-0 bg-neutral-950/95 backdrop-blur-xl z-50 overflow-y-auto flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-2xl bg-neutral-900 border border-white/10 rounded-[32px] overflow-hidden shadow-[0_0_50px_rgba(236,72,153,0.15)] flex flex-col md:flex-row md:h-[620px]"
        id="profile-details-container"
      >
        {/* Floating Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-40 p-2.5 bg-neutral-950/80 hover:bg-neutral-800 rounded-full text-neutral-400 hover:text-white transition border border-white/5 shadow-lg cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Column 1: Immersive Large Image View */}
        <div className="relative w-full md:w-1/2 h-[340px] md:h-full bg-neutral-950 flex flex-col">
          {/* Main Photo */}
          <div className="relative flex-1 bg-black overflow-hidden group">
            {privatePhotos.includes(activePhoto) && !isSpaceUnlocked ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-950/95 z-20 p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-pink-500/10 text-pink-500 border border-pink-500/20 flex items-center justify-center mb-3.5 shadow-[0_0_20px_rgba(236,72,153,0.15)] animate-pulse">
                  <Film size={24} />
                </div>
                <h4 className="text-xs font-black text-white tracking-widest uppercase">Sala VIP de {profile.name} 🔞</h4>
                <p className="text-[10px] text-neutral-400 mt-1.5 max-w-[210px] leading-relaxed">
                  Entre no estúdio exclusivo de {profile.name}. Assista a seus vídeos sem censura, fotos inéditas e interaja sem limites!
                </p>
                <button
                  onClick={handleUnlockSpace}
                  className="mt-3.5 px-4 py-2 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-700 text-white text-[10px] font-black uppercase rounded-xl transition shadow-lg shadow-pink-500/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles size={12} fill="currentColor" />
                  Inaugurar Acesso • R$ {(profile.private_space_price || 15.00).toFixed(2)}
                </button>
              </div>
            ) : null}

            <img 
              src={activePhoto} 
              alt={profile.name} 
              className={`w-full h-full object-cover transition-transform duration-700 ${
                privatePhotos.includes(activePhoto) && !isSpaceUnlocked ? 'blur-2xl scale-110' : 'group-hover:scale-105'
              }`}
            />

            {/* Glowing Gradient on bottom */}
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-neutral-900 to-transparent z-10" />

            {/* Float Wallet Indicator */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-neutral-950/90 backdrop-blur-md border border-white/10 text-white px-3 py-1.5 rounded-full text-[9px] font-black tracking-wide uppercase shadow-xl">
              <Wallet size={11} className="text-pink-500" />
              <span>SALDO: <span className="text-pink-400">R$ {desirePoints.toFixed(2)}</span></span>
            </div>
          </div>

          {/* Thumbnail Carousel Picker */}
          <div className="p-4 bg-neutral-900 border-t border-white/5 flex gap-2 overflow-x-auto scrollbar-none z-20">
            {/* Public Thumbnails */}
            {publicPhotos.map((url, i) => (
              <button
                key={`pub-${i}`}
                onClick={() => setActivePhoto(url)}
                className={`relative w-12 h-12 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                  activePhoto === url ? 'border-pink-500 scale-105 shadow-[0_0_8px_rgba(236,72,153,0.5)]' : 'border-transparent hover:border-white/20'
                }`}
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}

            {/* Private Thumbnails */}
            {privatePhotos.map((url, i) => {
              const unlocked = isSpaceUnlocked;
              return (
                <button
                  key={`priv-${i}`}
                  onClick={() => setActivePhoto(url)}
                  className={`relative w-12 h-12 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                    activePhoto === url ? 'border-pink-500 scale-105' : 'border-transparent hover:border-white/10'
                  }`}
                >
                  <img src={url} alt="" className={`w-full h-full object-cover ${!unlocked ? 'blur-xs' : ''}`} />
                  {!unlocked && (
                    <div className="absolute inset-0 bg-neutral-950/60 flex items-center justify-center text-pink-500">
                      <Lock size={12} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Column 2: Details & Content */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between h-[520px] md:h-full overflow-y-auto">
          <div>
            {/* Header: Name, Age, Status */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black tracking-tight text-white">{profile.name}</h2>
                  <span className="text-xl text-neutral-300 font-bold">{profile.age}</span>
                  {profile.is_verified && (
                    <span className="text-pink-400" title="Perfil Verificado">
                      <CheckCircle2 size={18} fill="currentColor" className="text-white bg-pink-500 rounded-full" />
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-1 text-xs text-neutral-400 mt-1 font-semibold">
                  <MapPin size={12} className="text-pink-500" />
                  <span>{profile.city}</span>
                  {profile.distance !== undefined && (
                    <span className="text-pink-400 font-bold">({profile.distance} km de distância)</span>
                  )}
                </div>
              </div>

              {/* Online indicator */}
              {profile.is_online ? (
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[9px] font-bold text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  ATIVADA
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-800 border border-neutral-700 rounded-full text-[9px] font-bold text-neutral-500">
                  OFFLINE
                </span>
              )}
            </div>

            {/* Sexy Intimate Bio */}
            <div className="mt-5">
              <h3 className="text-[10px] uppercase tracking-widest text-pink-500 font-black flex items-center gap-1.5">
                <Sparkles size={11} />
                SOBRE MIM
              </h3>
              <p className="text-neutral-200 text-xs mt-1.5 leading-relaxed bg-white/5 border border-white/5 p-3 rounded-2xl font-medium">
                {profile.bio || "Procura encontros com paixão, mistério e conversas memoráveis."}
              </p>
            </div>

            {/* Fetishes: The sexy activation element */}
            <div className="mt-5">
              <h3 className="text-[10px] uppercase tracking-widest text-pink-500 font-black flex items-center gap-1.5">
                <Flame size={11} fill="currentColor" />
                FETICHES & DESEJOS
              </h3>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {fetiches.map((fetish, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-500/20 text-pink-400 text-[10px] font-bold rounded-lg transition hover:bg-pink-500/20 hover:border-pink-500/30"
                  >
                    🔥 {fetish}
                  </span>
                ))}
              </div>
            </div>

            {/* Preferences */}
            {profile.preferences && (
              <div className="mt-4">
                <h3 className="text-[9px] uppercase tracking-widest text-neutral-500 font-extrabold">
                  O QUE ME ATRAI NUM PARCEIRO
                </h3>
                <p className="text-neutral-300 text-[11px] mt-1 leading-relaxed italic">
                  "{profile.preferences}"
                </p>
              </div>
            )}

            {/* Instagram */}
            {profile.instagram && (
              <div className="mt-3.5 flex items-center gap-1.5 text-xs text-neutral-400 font-bold">
                <Globe size={14} className="text-pink-500" />
                <span>Insta: <span className="text-pink-400 hover:underline cursor-pointer">{profile.instagram}</span></span>
              </div>
            )}

            {/* ONLYFANS-STYLE PREMIUM SALES HUB */}
            <div className="mt-5 p-4 bg-gradient-to-tr from-pink-500/15 via-neutral-950 to-purple-500/10 rounded-2xl border border-pink-500/30 space-y-3.5 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 blur-3xl pointer-events-none rounded-full" />
              
              {!isSpaceUnlocked ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <Film size={14} className="text-pink-400 animate-pulse" />
                    <h4 className="text-[10px] uppercase tracking-widest text-pink-400 font-black">SALA VIP EXCLUSIVA 🔞</h4>
                  </div>
                  <p className="text-[11px] text-neutral-300 leading-relaxed font-semibold">
                    Inaugure seu acesso vitalício à Sala VIP de {profile.name} e desfrute de conteúdos sem censura!
                  </p>
                  
                  <div className="space-y-2 text-[10px] text-neutral-400">
                    <div className="flex items-start gap-2">
                      <span className="text-pink-500 font-bold shrink-0">✓</span>
                      <span><strong>Vídeos & Fotos Secretas:</strong> Assista a produções completas, poses sensuais e bastidores em alta definição.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-pink-500 font-bold shrink-0">✓</span>
                      <span><strong>Conversa Direta Sem Trava:</strong> Envie áudios, mídias e tenha destaque dourado nas mensagens privadas.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold shrink-0">✓</span>
                      <span><strong>Sem Mensalidade:</strong> Pague uma única vez e assista quando quiser para sempre!</span>
                    </div>
                  </div>

                  <div className="bg-neutral-950/90 p-2.5 rounded-xl border border-white/5 flex items-center justify-between text-xs mt-1">
                    <div>
                      <span className="text-[8px] text-neutral-500 font-bold uppercase block">Ingresso Único</span>
                      <span className="text-pink-400 font-black flex items-center gap-1 text-[13px]">
                        R$ {(profile.private_space_price || 15.00).toFixed(2)}
                      </span>
                    </div>
                    <button
                      onClick={handleUnlockSpace}
                      className="px-3.5 py-1.8 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-700 text-white font-extrabold rounded-xl text-[9px] uppercase tracking-wider transition cursor-pointer shadow-lg hover:shadow-pink-500/20 active:scale-95 flex items-center gap-1"
                    >
                      <Lock size={10} /> Entrar na Sala VIP 🔑
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={14} className="text-emerald-400 animate-bounce" fill="currentColor" />
                    <h4 className="text-[10px] uppercase tracking-widest text-emerald-400 font-black">SALA VIP DESBLOQUEADA 🎉</h4>
                  </div>
                  <p className="text-[11px] text-neutral-300 leading-relaxed font-semibold">
                    Sua entrada nesta Sala VIP está confirmada! Explore todos os conteúdos sem limites.
                  </p>
                  
                  <div className="bg-neutral-950/80 p-3 rounded-xl border border-emerald-500/10 space-y-1.5">
                    <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-wider block">Fetiches & Desejos Compartilhados:</span>
                    <div className="flex flex-wrap gap-1">
                      {fetiches.map((fet, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 bg-emerald-500/5 text-emerald-400 text-[8px] font-bold rounded-md border border-emerald-500/10">
                          🔥 {fet}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-2.5 bg-pink-500/5 rounded-xl border border-pink-500/10 text-[9px] text-center text-pink-300 font-bold leading-relaxed">
                    Você pode mandar mensagens para {profile.name} agora mesmo para pedir conteúdos personalizados! 💬👄
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Sexy Footer Interactions */}
          <div className="mt-6 pt-4 border-t border-white/5 flex gap-3">
            {isMatched ? (
              <button
                onClick={() => {
                  onClose();
                  navigateTo('chat');
                }}
                className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-extrabold text-xs tracking-wider uppercase rounded-2xl transition shadow-lg shadow-pink-500/10 flex items-center justify-center gap-2 cursor-pointer animate-pulse"
              >
                <MessageSquare size={14} fill="currentColor" />
                CONVERSAR NO CHAT PRIVADO
              </button>
            ) : (
              <>
                {/* Dislike/Pass button */}
                <button
                  onClick={onClose}
                  className="px-4 bg-neutral-950 hover:bg-neutral-800 border border-white/5 rounded-2xl text-neutral-400 hover:text-white text-xs font-bold transition cursor-pointer"
                  title="Passar Perfil"
                >
                  Voltar
                </button>

                {/* Direct Whisper (Super Like) */}
                <button
                  onClick={handleSuperLike}
                  disabled={superLiked}
                  className={`px-4 bg-pink-500/10 hover:bg-pink-500/20 border ${superLiked ? 'border-pink-500 text-pink-400' : 'border-pink-500/20 text-pink-400'} rounded-2xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer`}
                  title="Mandar Super Like"
                >
                  <Star size={14} fill={superLiked ? "currentColor" : "none"} />
                  {superLiked ? 'SUPER ENVIADO' : 'SUPER LIKE'}
                </button>

                {/* Hot Like / Match */}
                <button
                  onClick={handleLike}
                  disabled={liked}
                  className={`flex-1 py-3 bg-gradient-to-r ${liked ? 'from-neutral-800 to-neutral-700 text-neutral-400 border border-white/5' : 'from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white shadow-lg shadow-pink-500/25'} font-extrabold text-xs tracking-wider uppercase rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer`}
                >
                  <Heart size={14} fill={liked ? "none" : "currentColor"} />
                  {liked ? 'INTERESSE ENVIADO' : 'CORTAR O GELO (CURTIR)'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* INTERACTIVE PIX DEPOSIT MODAL INJECTION */}
        {showPixDeposit && (
          <div className="absolute inset-0 bg-neutral-950/98 backdrop-blur-md z-50 flex items-center justify-center p-6 text-center animate-fade-in">
            <div className="max-w-xs w-full bg-neutral-900 border border-white/10 rounded-[28px] p-6 space-y-4 shadow-[0_0_50px_rgba(16,185,129,0.1)] relative">
              <button 
                onClick={() => setShowPixDeposit(false)}
                className="absolute top-4 right-4 p-1.5 bg-neutral-950 rounded-full text-neutral-400 hover:text-white cursor-pointer transition"
              >
                <X size={14} />
              </button>
              
              <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <Wallet size={20} />
              </div>

              <div>
                <h4 className="text-xs font-black text-white tracking-widest uppercase">Adicionar Saldo via Pix</h4>
                <p className="text-[10px] text-neutral-400 mt-1">Recarregue sua carteira para ver conteúdos exclusivos de imediato.</p>
              </div>

              {/* Package Selectors */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { val: 15, label: 'R$ 15,00' },
                  { val: 30, label: 'R$ 30,00' },
                  { val: 50, label: 'R$ 50,00' },
                  { val: 100, label: 'R$ 100,00' }
                ].map(pkg => (
                  <button
                    key={pkg.val}
                    onClick={() => setPixAmount(pkg.val)}
                    className={`p-2 rounded-xl border text-[10px] font-black transition cursor-pointer text-center ${
                      pixAmount === pkg.val 
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                        : 'bg-neutral-950 border-white/5 text-neutral-400 hover:border-white/10'
                    }`}
                  >
                    {pkg.label}
                  </button>
                ))}
              </div>

              {/* Pix Info & QR */}
              <div className="bg-neutral-950 p-3 rounded-2xl border border-white/5 space-y-2">
                <div className="flex justify-center">
                  <div className="bg-white p-2 rounded-xl">
                    <QrCode size={80} className="text-black" />
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[8px] text-neutral-500 uppercase font-black tracking-wider block">Chave Pix Copia e Cola</span>
                  <input
                    type="text"
                    readOnly
                    value="00020126580014br.gov.bcb.pix0136fb33ff1b-5254-4d7b-83eb-d05b449be789"
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg px-2 py-1 text-[8px] text-neutral-400 font-mono text-center outline-none select-all"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("00020126580014br.gov.bcb.pix0136fb33ff1b-5254-4d7b-83eb-d05b449be789");
                      setPixCopied(true);
                      setTimeout(() => setPixCopied(false), 2000);
                    }}
                    className="w-full py-0.5 text-[9px] font-black text-emerald-400 hover:underline block text-center"
                  >
                    {pixCopied ? 'CHAVE PIX COPIADA! ✓' : 'COPIAR CHAVE PIX'}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <button
                onClick={() => {
                  setIsProcessingPix(true);
                  setTimeout(() => {
                    setIsProcessingPix(false);
                    earnPoints(pixAmount, 'Depósito de Saldo via Pix');
                    setShowPixDeposit(false);
                  }, 1200);
                }}
                disabled={isProcessingPix}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-[9px] uppercase tracking-wider rounded-xl transition shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isProcessingPix ? (
                  <>
                    <RefreshCw size={11} className="animate-spin" />
                    Confirmando Pix...
                  </>
                ) : (
                  'Confirmar Pagamento Simulado ✓'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
