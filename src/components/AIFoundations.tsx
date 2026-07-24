import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { aiFoundationsCurriculum as curriculum, Subject } from '../aiFoundationsData';
import { logActivity } from '../lib/firebase';
import { BookOpen, ChevronRight, Lock, Sparkles, CheckCircle2, Star, Box, Cpu, Network, Shield, Binary } from 'lucide-react';
import QuestTracker from './QuestTracker';
import CarouselRow from './CarouselRow';

const getIconForIndex = (i: number) => {
  const icons = [
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" /></svg>,
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>,
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  ];
  return icons[i % icons.length];
};

const getUnitIcon = (i: number) => {
  const icons = [
    <Box className="w-8 h-8" />,
    <Cpu className="w-8 h-8" />,
    <Network className="w-8 h-8" />,
    <Shield className="w-8 h-8" />,
    <Binary className="w-8 h-8" />,
  ];
  return icons[i % icons.length];
};

export default function AIFoundations({ user, onUnitSelect }: { user?: User, onUnitSelect?: (unit: any) => void }) {
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);

  useEffect(() => {
    document.body.classList.add('index-page');
    return () => document.body.classList.remove('index-page');
  }, []);

  const handleUnitClick = (unit: any) => {
    if (unit.id !== 'u1') {
      return;
    }
    if (onUnitSelect) {
      onUnitSelect(unit);
    }
  };

  return (
    <div className="min-h-screen  p-6 md:p-12 font-sans text-[var(--ink)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        
        <header className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 font-serif">AI Foundations</h1>
          <p className="text-[var(--muted)] font-serif">Select a learning track to expand its units.</p>
        </header>

        {user && <QuestTracker user={user} />}

        {/* Modular List for Tracks */}
        <div className="flex flex-col gap-8 mb-12 w-full">
          {curriculum.map((track, idx) => {
            const isSelected = track.id === selectedTrackId;
            const isFeatured = idx < 2; // Highlighting the first two tracks as active/featured
            
            return (
              <div key={track.id} className="flex flex-col w-full">
                {/* Track Header */}
                <div 
                  onClick={() => setSelectedTrackId(isSelected ? null : track.id)}
                  className={`flex flex-row items-center gap-6 p-4 rounded-[24px] cursor-pointer transition-all duration-300 border border-transparent ${
                    isSelected ? 'bg-transparent' : 'hover:bg-[var(--surface)]/40'
                  }`}
                >
                  <div className={`w-20 h-20 rounded-[20px] flex items-center justify-center shrink-0 ${isSelected ? 'bg-[var(--paper-2)] text-[var(--amber)] shadow-sm ring-1 ring-[var(--amber)]' : 'bg-[var(--paper-2)] text-[var(--amber)]'}`}>
                    {getIconForIndex(idx)}
                  </div>
                  
                  <div className="flex-1 min-w-0 pt-1">
                    <h3 className="font-serif font-bold text-2xl text-[var(--ink)] mb-1.5 truncate">{track.title}</h3>
                  </div>

                  <div className="shrink-0 flex items-center gap-4 ml-auto">
                    {isFeatured ? (
                      <span className="flex items-center text-[var(--amber)]">
                        <Star className="w-7 h-7 fill-current" />
                      </span>
                    ) : (
                      <span className="flex items-center text-[var(--muted)]/50">
                        <Lock className="w-6 h-6" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Expanded Units Accordion */}
                {isSelected && (
                  <div className="mt-4 p-8 md:p-12 bg-[var(--paper-2)] rounded-[32px] animate-in slide-in-from-top-2 fade-in duration-300 relative">
                    <CarouselRow>
                      {track.units.map((unit, i) => (
                        <div 
                          key={unit.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnitClick(unit);
                          }}
                          className={`group relative flex flex-col items-center w-[160px] shrink-0 ${unit.id === 'u1' ? 'cursor-pointer' : 'cursor-default opacity-60'}`}
                        >
                          {/* The horizontal line connecting to the next unit */}
                          {i < track.units.length - 1 && (
                            <div className="absolute top-[80px] left-[100%] w-[32px] h-[2px] bg-[var(--line)] z-0"></div>
                          )}
                          
                          {/* The white card */}
                          <div className={`w-[160px] h-[160px] bg-[var(--surface)] rounded-[24px] shadow-sm border border-[var(--line)] flex flex-col items-center justify-center relative transition-all ${unit.id === 'u1' ? 'hover:shadow-md group-hover:border-[var(--amber)]' : ''}`}>
                            {/* Top-left tag */}
                            <div className="absolute top-4 left-4 px-2.5 py-1 bg-[var(--paper)] text-[var(--muted)] text-[10px] font-mono rounded-md border border-[var(--line)] shadow-sm">
                              <span className="text-[var(--amber)] font-bold">{unit.id.toUpperCase()}</span> <span className="opacity-50 mx-1">|</span> {unit.tags[0] || 'Unit'}
                            </div>
                            
                            {/* Center circle & icon */}
                            <div className="w-[72px] h-[72px] rounded-full bg-[var(--paper-2)] text-[var(--amber)] flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                              {getUnitIcon(i)}
                            </div>
                          </div>
                          
                          {/* Below the card */}
                          <div className="mt-5 flex flex-col items-center text-center px-1">
                            <h4 className="font-serif font-bold text-[15px] text-[var(--ink)] leading-tight mb-3 group-hover:text-[var(--amber)] transition-colors">
                              {unit.title}
                            </h4>
                            <div className="text-[11px] font-bold text-[var(--amber)] bg-[var(--amber-tint)] px-3 py-1.5 rounded-md font-mono">
                              +{unit.reward} Stemios
                            </div>
                          </div>
                        </div>
                      ))}
                    </CarouselRow>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
