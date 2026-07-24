import React from 'react';
import { User } from '../types';
import { Award, Shield, Zap, Star } from 'lucide-react';

interface QuestTrackerProps {
  user: User;
}

const BADGES = [
  { id: 'deepfake-detective', title: 'Deepfake Detective', icon: Shield, threshold: 50 },
  { id: 'data-auditor', title: 'Data Auditor', icon: Zap, threshold: 100 },
  { id: 'code-breaker', title: 'Code Breaker', icon: Award, threshold: 200 },
  { id: 'system-architect', title: 'System Architect', icon: Star, threshold: 500 },
];

export default function QuestTracker({ user }: QuestTrackerProps) {
  const calculateLevel = (stemios: number) => {
    return Math.floor(stemios / 100) + 1;
  };

  const level = calculateLevel(user.stemios);
  const nextLevelThreshold = level * 100;
  const progress = ((user.stemios % 100) / 100) * 100;

  return (
    <div className="bg-white p-6 rounded-[12px] border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)] mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      {/* Level & Stemios */}
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-[#FFFBEB] text-[#B45309] border border-[#B45309]/20 flex flex-col items-center justify-center shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-widest leading-none mb-1">Lvl</span>
          <span className="text-2xl font-black leading-none">{level}</span>
        </div>
        
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Current Progress</h2>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl font-black text-[#B45309]">{user.stemios.toLocaleString()}</span>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Stemios</span>
          </div>
          
          <div className="w-48 bg-gray-100 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-[#B45309] h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-[10px] text-gray-500 mt-1 font-semibold">
            {nextLevelThreshold - user.stemios} Stemios to Next Level
          </div>
        </div>
      </div>

      {/* Unlocked Badges */}
      <div className="w-full md:w-auto flex-1 md:border-l md:border-gray-100 md:pl-6">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Latest Badges</h3>
        <div className="flex flex-wrap items-center gap-3">
          {BADGES.map((badge) => {
            const isUnlocked = user.stemios >= badge.threshold;
            const Icon = badge.icon;
            
            if (!isUnlocked) return null;
            
            return (
              <div 
                key={badge.id}
                className="flex items-center gap-2 bg-[#FBF8F2] border border-gray-200 px-3 py-1.5 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                title={badge.title}
              >
                <Icon className="w-4 h-4 text-[#B45309]" />
                <span className="text-xs font-bold text-gray-700">{badge.title}</span>
              </div>
            );
          })}
          
          {BADGES.every(b => user.stemios < b.threshold) && (
            <div className="text-sm text-gray-400 italic">Complete units to unlock badges</div>
          )}
        </div>
      </div>
    </div>
  );
}
