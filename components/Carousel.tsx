/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile } from './transloveTypes';
import { MapPin, CheckCircle2, ChevronLeft, ChevronRight, Heart, Sparkles } from 'lucide-react';

interface CarouselProps {
  profiles: UserProfile[];
  onSelect: (profile: UserProfile) => void;
  onLike: (profile: UserProfile, isSuper: boolean) => void;
}

export default function Carousel({ profiles, onSelect, onLike }: CarouselProps) {
  // Take sponsored profiles or top 4 profiles
  const sponsored = profiles.filter(p => p.sponsored || p.is_premium).slice(0, 5);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (sponsored.length === 0) return null;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % sponsored.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + sponsored.length) % sponsored.length);
  };

  return (
    <div className="w-full relative py-6 flex flex-col items-center justify-center overflow-hidden">
      {/* Title */}
      <div className="w-full max-w-md px-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles size={16} className="text-pink-500 animate-pulse" />
          <h3 className="font-extrabold text-sm text-neutral-200 tracking-wider uppercase">Destaques Patrocinados</h3>
        </div>
        <div className="flex gap-1">
          <button
            onClick={handlePrev}
            className="p-1.5 bg-neutral-900/80 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={handleNext}
            className="p-1.5 bg-neutral-900/80 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* 3D Stack View */}
      <div className="relative w-full max-w-sm h-[320px] flex items-center justify-center">
        {sponsored.map((profile, index) => {
          // Calculate offset from current index
          let offset = index - currentIndex;
          if (offset < -Math.floor(sponsored.length / 2)) {
            offset += sponsored.length;
          } else if (offset > Math.floor(sponsored.length / 2)) {
            offset -= sponsored.length;
          }

          const isCurrent = offset === 0;
          const isVisible = Math.abs(offset) <= 2;

          if (!isVisible) return null;

          // Stylings for depth stack
          const rotateY = offset * 12; // Degrees rotation
          const translateX = offset * 90; // Pixels slide offset
          const translateZ = -Math.abs(offset) * 80; // Negative Z depth
          const scale = 1 - Math.abs(offset) * 0.12; // Smaller depth
          const opacity = 1 - Math.abs(offset) * 0.4; // Fade out far ones
          const zIndex = 10 - Math.abs(offset);

          return (
            <div
              key={profile.id}
              onClick={() => isCurrent && onSelect(profile)}
              className="absolute w-[220px] h-[300px] rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 ease-out cursor-pointer group"
              style={{
                transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                opacity,
                zIndex,
                transformStyle: 'preserve-3d',
                boxShadow: isCurrent 
                  ? '0 15px 35px -5px rgba(236, 72, 153, 0.3), 0 10px 20px -5px rgba(0, 0, 0, 0.8)'
                  : '0 8px 16px -4px rgba(0, 0, 0, 0.6)'
              }}
            >
              {/* Image */}
              <img
                src={profile.avatar_url}
                alt={profile.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Glowing gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-neutral-950/20 opacity-90" />

              {/* Verified badge top-right */}
              {profile.is_verified && (
                <div className="absolute top-3 right-3 px-2 py-0.5 bg-pink-500 text-white rounded-full text-[9px] font-bold tracking-wide flex items-center gap-1 shadow-md uppercase">
                  <CheckCircle2 size={10} fill="white" className="text-pink-500" />
                  Verificado
                </div>
              )}

              {/* Content Overlay */}
              <div className="absolute bottom-0 inset-x-0 p-4 flex flex-col justify-end text-white">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight">{profile.name}</span>
                  <span className="text-sm font-medium text-neutral-300">{profile.age}</span>
                  {profile.is_verified && <CheckCircle2 size={14} className="text-pink-400" fill="currentColor" />}
                </div>

                <div className="flex items-center gap-1 text-[10px] text-neutral-400 mt-0.5 font-medium">
                  <MapPin size={10} className="text-pink-500" />
                  <span>{profile.city}</span>
                  {profile.distance !== undefined && (
                    <span className="ml-1 px-1.5 py-0.5 bg-pink-500/10 text-pink-400 rounded-md font-bold text-[8px]">
                      {profile.distance}km
                    </span>
                  )}
                </div>

                {isCurrent && (
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onLike(profile, false);
                        handleNext();
                      }}
                      className="flex-1 py-1.5 bg-white/10 hover:bg-pink-500 hover:text-white backdrop-blur-md text-neutral-200 text-xs font-bold rounded-xl transition border border-white/5 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Heart size={12} fill="currentColor" />
                      Curtir
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onLike(profile, true);
                        handleNext();
                      }}
                      className="px-2.5 py-1.5 bg-pink-500 hover:bg-pink-600 rounded-xl text-white transition flex items-center justify-center shadow-lg shadow-pink-500/20 cursor-pointer"
                      title="Super Like"
                    >
                      ⭐
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination indicators */}
      <div className="flex items-center gap-1.5 mt-2">
        {sponsored.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 rounded-full transition-all cursor-pointer ${
              idx === currentIndex ? 'w-5 bg-pink-500' : 'w-1.5 bg-neutral-800'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
