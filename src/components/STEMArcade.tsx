import React, { useEffect } from 'react';
import { User } from '../types';
import { Flame } from 'lucide-react';
import { curriculum } from '../curriculumData';
import { logActivity } from '../lib/firebase';

const getIconForIndex = (i: number) => {
  const icons = [
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" /></svg>,
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>,
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  ];
  return icons[i % icons.length];
};

export default function STEMArcade({ user }: { user?: User }) {
  useEffect(() => {
    document.body.classList.add('index-page');
    return () => document.body.classList.remove('index-page');
  }, []);

  const handleUnitClick = (unitId: string, reward: number) => {
    if (user) {
      logActivity(user.id, unitId, reward);
    }
  };

  const yourPaths = curriculum.slice(0, 2);
  const otherPaths = curriculum.slice(2);

  const renderSubject = (subject: typeof curriculum[0], isOther = false) => (
    <div key={subject.id} className="flex flex-col">
      {/* Subject Header */}
      <div className="flex items-center gap-4 md:gap-6 mb-5">
        <div className="w-14 h-14 md:w-16 md:h-16 shrink-0 bg-[var(--amber-tint)] rounded-xl md:rounded-2xl flex items-center justify-center text-[var(--amber)]">
          <svg className="w-7 h-7 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
        </div>
        <div className="flex-1">
          <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-1">
            {isOther ? 'ELECTIVE' : 'FOUNDATIONAL'}
          </div>
          <h3 className="ledger-title text-lg md:text-xl font-bold text-[var(--ink)] transition-colors duration-300">
            {subject.title}
          </h3>
          <p className="text-[var(--muted)] text-xs md:text-sm mt-0.5 line-clamp-1 transition-colors duration-300">
            {subject.themes}
          </p>
        </div>
        <div className="text-[var(--amber)] opacity-80 shrink-0 self-start mt-2">
          <svg className="w-5 h-5 md:w-6 md:h-6 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
        </div>
      </div>

      {/* Cards Container */}
      <div className="bg-[var(--paper-2)] p-6 md:p-8 rounded-3xl border border-[var(--line-2)] relative transition-colors duration-300">
        <div className="absolute top-[88px] md:top-24 left-8 right-8 h-px bg-[var(--line-2)] hidden md:block"></div>
        <div className="flex overflow-x-auto gap-4 md:gap-8 relative z-10 hide-scrollbar snap-x snap-mandatory pb-4">
          {subject.units.map((unit, idx) => (
            <div 
              key={unit.id} 
              className="snap-start shrink-0 flex flex-col items-center w-32 md:w-36 group cursor-pointer"
              onClick={() => handleUnitClick(unit.id, unit.reward)}
            >
              
              {/* Square Card */}
              <div 
                className="course-card w-32 h-32 md:w-36 md:h-36 bg-[var(--surface)] border border-[var(--line)] rounded-2xl flex flex-col relative transition-all duration-300 group-hover:-translate-y-2 mb-4"
                style={{ boxShadow: 'var(--shadow-base)' }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-base)'}
              >
                {/* Tag */}
                <div className="absolute top-3 left-3">
                  <span className="text-[9px] font-mono font-semibold text-[var(--muted)] border border-[var(--line-2)] bg-[var(--paper)] px-1.5 py-0.5 rounded transition-colors duration-300">
                    {unit.tags[0]}
                  </span>
                </div>
                
                {/* Center Icon (Hides on hover) */}
                <div className="flex-1 flex items-center justify-center mt-5 transition-opacity duration-300 group-hover:opacity-0 absolute inset-0">
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-[var(--amber-tint)] text-[var(--amber)] rounded-full flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                    {getIconForIndex(idx)}
                  </div>
                </div>

                {/* Hover Content */}
                <div className="absolute inset-0 p-3 pt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-center">
                  <div className="text-[10px] font-bold text-[var(--amber)] mb-1 leading-tight">{unit.concept}</div>
                  <div className="text-[9px] text-[var(--ink-soft)] leading-tight line-clamp-3">{unit.activity}</div>
                </div>
              </div>

              {/* Title & Reward */}
              <div className="text-center flex flex-col items-center px-1">
                <h4 className="text-xs md:text-sm font-bold text-[var(--ink)] leading-snug mb-2 transition-colors duration-300">{unit.title}</h4>
                <div className="stemios-wallet text-[10px] bg-[var(--amber-tint)] text-[var(--amber)] px-2 py-1 rounded font-semibold transition-colors duration-300">
                  +{unit.reward} Stemios
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-transparent p-6 md:p-12 font-['Inter'] text-[var(--ink)] transition-colors duration-300 pt-0 md:pt-0">
      <div className="max-w-6xl mx-auto mt-12">
        
        {/* Page Header (Removed) */}

        {/* Section 1 */}
        <div className="mb-16">
          <h2 className="ledger-title text-xl font-bold mb-8 text-[var(--ink)] transition-colors duration-300">
            Your learning paths
          </h2>
          <div className="space-y-12">
            {yourPaths.map(subject => renderSubject(subject, false))}
          </div>
        </div>

        {/* Section 2 */}
        <div>
          <h2 className="ledger-title text-xl font-bold mb-8 text-[var(--ink)] transition-colors duration-300">
            Other learning paths
          </h2>
          <div className="space-y-12">
            {otherPaths.map(subject => renderSubject(subject, true))}
          </div>
        </div>

      </div>
    </div>
  );
}
