/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile } from './transloveTypes';
import { MapPin, CheckCircle2, Heart, X, Star, Sparkles, AlertCircle, Info, Globe } from 'lucide-react';

interface Card3DProps {
  profile: UserProfile;
  onLike: (isSuper: boolean) => void;
  onPass: () => void;
  onShowDetails?: () => void;
}

export default function Card3D({ profile, onLike, onPass, onShowDetails }: Card3DProps) {
  const [swipeDir, setSwipeDir] = useState<'left' | 'right' | 'super' | null>(null);

  const handleAction = (type: 'pass' | 'like' | 'super') => {
    if (type === 'pass') {
      setSwipeDir('left');
      setTimeout(() => {
        onPass();
        setSwipeDir(null);
      }, 350);
    } else if (type === 'like') {
      setSwipeDir('right');
      setTimeout(() => {
        onLike(false);
        setSwipeDir(null);
      }, 350);
    } else {
      setSwipeDir('super');
      setTimeout(() => {
        onLike(true);
        setSwipeDir(null);
      }, 350);
    }
  };

  const getTransitionStyle = () => {
    if (swipeDir === 'left') {
      return 'translate-x-[-150%] rotate-[-20deg] opacity-0';
    }
    if (swipeDir === 'right') {
      return 'translate-x-[150%] rotate-[20deg] opacity-0';
    }
    if (swipeDir === 'super') {
      return 'translate-y-[-150%] scale-75 opacity-0';
    }
    return 'translate-x-0 rotate-0 scale-100 opacity-100';
  };

  return (
    <div
      className={`relative w-full max-w-sm h-[480px] rounded-[32px] overflow-hidden transition-all duration-300 ease-out select-none border border-neutral-800/80 bg-neutral-950 ${getTransitionStyle()}`}
      style={{
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8), 0 0 15px rgba(236,72,153,0.05)',
      }}
    >
      {/* Background Image with optimized sizing */}
      <img
        src={profile.avatar_url}
        alt={profile.name}
        className="w-full h-full object-cover select-none pointer-events-none"
      />

      {/* Edge glow indicators when action selected */}
      {swipeDir === 'right' && (
        <div className="absolute inset-0 bg-emerald-500/20 border-4 border-emerald-500 rounded-[32px] pointer-events-none flex items-center justify-center z-30">
          <span className="px-6 py-3 bg-emerald-500 text-white font-extrabold text-xl tracking-widest rounded-2xl uppercase shadow-lg transform rotate-[-12deg]">CURTI</span>
        </div>
      )}
      {swipeDir === 'left' && (
        <div className="absolute inset-0 bg-rose-500/20 border-4 border-rose-500 rounded-[32px] pointer-events-none flex items-center justify-center z-30">
          <span className="px-6 py-3 bg-rose-500 text-white font-extrabold text-xl tracking-widest rounded-2xl uppercase shadow-lg transform rotate-[12deg]">PASSAR</span>
        </div>
      )}
      {swipeDir === 'super' && (
        <div className="absolute inset-0 bg-pink-500/20 border-4 border-pink-500 rounded-[32px] pointer-events-none flex items-center justify-center z-30">
          <span className="px-6 py-3 bg-pink-500 text-white font-extrabold text-xl tracking-widest rounded-2xl uppercase shadow-lg animate-pulse">SUPER!</span>
        </div>
      )}

      {/* Elegant Dark Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-neutral-950/50" />

      {/* Top Floating Badges */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
        <div className="flex gap-1.5">
          {profile.sponsored && (
            <span className="px-2.5 py-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-pink-500/20">
              <Sparkles size={10} />
              Destaque
            </span>
          )}
          {profile.is_premium && (
            <span className="px-2 py-1 bg-neutral-900/90 text-yellow-400 border border-yellow-500/20 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-0.5">
              💎 Premium
            </span>
          )}
        </div>

        {profile.is_online && (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-950/80 backdrop-blur-md rounded-full border border-emerald-500/20 text-[9px] font-bold text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            ONLINE
          </span>
        )}
      </div>

      {/* Profile Details Overlay at Bottom */}
      <div className="absolute bottom-0 inset-x-0 p-6 flex flex-col justify-end text-white z-10">
        
        {/* Name and Age block */}
        <div className="flex items-baseline justify-between w-full">
          <div className="flex items-baseline gap-2">
            <h2 className="text-2xl font-extrabold tracking-tight">{profile.name}</h2>
            <span className="text-xl text-neutral-300 font-semibold">{profile.age}</span>
            {profile.is_verified && (
              <span className="text-pink-400" title="Perfil Verificado">
                <CheckCircle2 size={18} fill="currentColor" className="text-white bg-pink-500 rounded-full" />
              </span>
            )}
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); onShowDetails?.(); }}
            className="p-1.5 bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/30 rounded-lg text-pink-400 flex items-center gap-1 text-[10px] font-bold tracking-wide uppercase transition hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Info size={12} />
            Ver Perfil
          </button>
        </div>

        {/* Location & Distance indicator */}
        <div className="flex items-center gap-1.5 text-xs text-neutral-400 mt-1 font-semibold">
          <MapPin size={12} className="text-pink-500" />
          <span>{profile.city}</span>
          {profile.distance !== undefined && (
            <span className="ml-1 bg-pink-500/10 text-pink-400 border border-pink-500/20 px-2 py-0.5 rounded-md text-[10px] font-bold">
              {profile.distance} km de você
            </span>
          )}
        </div>

        {/* Short bio preview */}
        <p className="text-neutral-300 text-xs mt-3 line-clamp-2 bg-neutral-950/30 p-2.5 rounded-xl border border-white/5 backdrop-blur-xs leading-relaxed font-medium">
          {profile.bio || 'Nenhuma biografia disponível ainda.'}
        </p>

        {/* Social connections if available */}
        {profile.instagram && (
          <div className="mt-3.5 flex items-center gap-1.5 text-[10px] text-pink-400 font-bold tracking-wider uppercase">
            <Globe size={12} />
            <span>{profile.instagram}</span>
          </div>
        )}

        {/* Interactive action buttons aligning beautifully like the mockup */}
        <div className="mt-6 flex items-center justify-between gap-4 border-t border-neutral-900 pt-4">
          {/* Dislike button */}
          <button
            onClick={() => handleAction('pass')}
            className="w-12 h-12 rounded-full bg-neutral-900/95 hover:bg-neutral-800 border border-neutral-800 flex items-center justify-center text-rose-500 hover:text-rose-400 transition hover:scale-105 active:scale-95 shadow-lg shadow-black/40 cursor-pointer"
            title="Passar"
          >
            <X size={20} />
          </button>

          {/* Super Like */}
          <button
            onClick={() => handleAction('super')}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-500/10 to-rose-500/10 hover:from-pink-500/20 hover:to-rose-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 hover:text-pink-300 transition hover:scale-105 active:scale-95 shadow-lg shadow-pink-500/5 cursor-pointer"
            title="Super Like"
          >
            <Star size={18} fill="currentColor" />
          </button>

          {/* Like button */}
          <button
            onClick={() => handleAction('like')}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 flex items-center justify-center text-white transition hover:scale-110 active:scale-95 shadow-xl shadow-pink-500/20 cursor-pointer"
            title="Curtir"
          >
            <Heart size={24} fill="currentColor" />
          </button>
        </div>
      </div>
    </div>
  );
}
