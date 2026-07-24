import React from 'react';
import { User } from '../types';
import { Award, Target, Zap, Star, Shield, Lock, CheckCircle2 } from 'lucide-react';

interface BadgeShowcaseProps {
  user: User;
}

const ALL_BADGES = [
  { id: 'first-step', title: 'First Step', description: 'Completed your first STEM unit', icon: Award, requirement: '1 Unit', stemiosRequired: 10 },
  { id: 'streak-3', title: 'Consistent Explorer', description: 'Maintained a 3-day learning streak', icon: Zap, requirement: '3 Day Streak', stemiosRequired: 50 },
  { id: 'biotech-novice', title: 'Biotech Novice', description: 'Mastered the basics of Biotechnology', icon: Shield, requirement: 'Biotech Track', stemiosRequired: 150 },
  { id: 'stemio-collector', title: 'Stemio Hoarder', description: 'Gathered over 500 Stemios', icon: Star, requirement: '500 Stemios', stemiosRequired: 500 },
  { id: 'future-innovator', title: 'Future Innovator', description: 'Completed a capstone project', icon: Target, requirement: 'Capstone', stemiosRequired: 1000 },
];

export default function BadgeShowcase({ user }: BadgeShowcaseProps) {
  return (
    <div className="min-h-screen bg-[#FBF8F2] p-6 md:p-12 font-sans text-gray-900 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Your Milestones</h1>
          <p className="text-gray-600 max-w-2xl">
            Track your individual competence and unlock new badges as you progress through your learning paths. Your journey is yours alone.
          </p>
        </header>

        {/* Highlighted Progress Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white p-5 rounded-[12px] border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)] text-center">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Stemios</div>
            <div className="text-2xl font-black text-[#B45309]">{user.stemios.toLocaleString()}</div>
          </div>
          <div className="bg-white p-5 rounded-[12px] border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)] text-center">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Current Streak</div>
            <div className="text-2xl font-black text-[#B45309]">{user.streak} Days</div>
          </div>
          <div className="bg-white p-5 rounded-[12px] border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)] text-center">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Badges Earned</div>
            <div className="text-2xl font-black text-[#B45309]">
              {ALL_BADGES.filter(b => user.stemios >= b.stemiosRequired).length} / {ALL_BADGES.length}
            </div>
          </div>
          <div className="bg-white p-5 rounded-[12px] border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)] text-center">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Competence Level</div>
            <div className="text-2xl font-black text-[#B45309]">Novice</div>
          </div>
        </div>

        {/* Badge Grid */}
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Award className="text-[#B45309] w-6 h-6" /> Milestone Showcase
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ALL_BADGES.map((badge) => {
            const isUnlocked = user.stemios >= badge.stemiosRequired;
            const Icon = badge.icon;
            
            return (
              <div 
                key={badge.id}
                className={`relative flex flex-col items-center p-6 rounded-[12px] border transition-all duration-300 text-center ${
                  isUnlocked 
                    ? 'bg-white border-[#B45309]/30 shadow-[0_2px_8px_rgba(180,83,9,0.08)]' 
                    : 'bg-gray-50 border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)] opacity-80'
                }`}
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                  isUnlocked ? 'bg-[#FFFBEB] text-[#B45309]' : 'bg-gray-200 text-gray-400'
                }`}>
                  <Icon size={32} strokeWidth={isUnlocked ? 2.5 : 2} />
                </div>
                
                <h3 className={`font-bold text-lg mb-1 ${isUnlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                  {badge.title}
                </h3>
                
                <p className={`text-sm mb-4 line-clamp-2 ${isUnlocked ? 'text-gray-600' : 'text-gray-400'}`}>
                  {badge.description}
                </p>
                
                <div className="mt-auto w-full pt-4 border-t border-gray-100 flex items-center justify-center gap-2">
                  {isUnlocked ? (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-[#B45309] bg-[#FFFBEB] px-3 py-1 rounded-full">
                      <CheckCircle2 size={14} /> Unlocked
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      <Lock size={14} /> {badge.requirement}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
