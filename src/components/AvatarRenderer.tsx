import React from 'react';

export interface CustomMeshItem {
  id: string;
  name: string;
  slot: 'tops' | 'bottoms' | 'hats' | 'rightHand' | 'leftHand';
  path: string;
  defaultColor?: string;
  category?: string;
  price?: number;
  createdAt?: number;
}

export interface AvatarConfig {
  bodyColor: string;
  headColor?: string;
  eyesColor: string;
  hairColor: string;
  topColor: string;
  bottomColor: string;
  outfitId?: string;
  topId: string;
  bottomId: string;
  hairStyle: string;
  faceExpression: string;
  eyesStyle: string;
  hatId: string;
  rightHandId: string;
  leftHandId: string;
  bgStyle: string;
  customMeshes?: CustomMeshItem[];
}

export const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
  bodyColor: '#FCD5CE',
  headColor: '#FCD5CE',
  eyesColor: '#111827',
  hairColor: '#D97706',
  topColor: '#06B6D4',
  bottomColor: '#1F2937',
  outfitId: 'none',
  topId: 't_hoodie',
  bottomId: 'b_jeans',
  hairStyle: 'spiky',
  faceExpression: 'smile',
  eyesStyle: 'sunglasses',
  hatId: 'h_snoo',
  rightHandId: 'rh_beaker',
  leftHandId: 'lh_robot',
  bgStyle: 'clean',
  customMeshes: []
};

interface AvatarRendererProps {
  config: AvatarConfig;
  size?: number;
  className?: string;
  showShadow?: boolean;
}

export default function AvatarRenderer({
  config,
  size = 200,
  className = '',
  showShadow = true
}: AvatarRendererProps) {
  const cfg = { ...DEFAULT_AVATAR_CONFIG, ...config };
  const headTone = cfg.headColor || cfg.bodyColor || '#FCD5CE';

  // Check if current selected top or bottom or hat is a custom admin mesh
  const customTop = cfg.customMeshes?.find(m => m.id === cfg.topId && m.slot === 'tops');
  const customBottom = cfg.customMeshes?.find(m => m.id === cfg.bottomId && m.slot === 'bottoms');
  const customHat = cfg.customMeshes?.find(m => m.id === cfg.hatId && m.slot === 'hats');
  const customRH = cfg.customMeshes?.find(m => m.id === cfg.rightHandId && m.slot === 'rightHand');
  const customLH = cfg.customMeshes?.find(m => m.id === cfg.leftHandId && m.slot === 'leftHand');

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-2xl overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 200 240"
        className="w-full h-full drop-shadow-md select-none"
        style={{ width: '100%', height: '100%' }}
      >
        <defs>
          {/* Background Gradients */}
          <radialGradient id="bgStudio" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F3F4F6" />
          </radialGradient>

          <radialGradient id="bgLab" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#0E7490" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#0F172A" />
          </radialGradient>

          <linearGradient id="bgSpace" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E1B4B" />
            <stop offset="50%" stopColor="#312E81" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          <radialGradient id="bgGold" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FEF3C7" />
            <stop offset="70%" stopColor="#FDE68A" />
            <stop offset="100%" stopColor="#F59E0B" />
          </radialGradient>

          <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. BACKGROUND */}
        {cfg.bgStyle === 'lab' && (
          <rect width="200" height="240" fill="url(#bgLab)" />
        )}
        {cfg.bgStyle === 'space' && (
          <g>
            <rect width="200" height="240" fill="url(#bgSpace)" />
            <circle cx="30" cy="40" r="1.5" fill="#FFF" opacity="0.8" />
            <circle cx="170" cy="50" r="2" fill="#38BDF8" opacity="0.9" />
            <circle cx="140" cy="180" r="1.5" fill="#FFF" opacity="0.6" />
            <circle cx="40" cy="190" r="1" fill="#F59E0B" opacity="0.7" />
          </g>
        )}
        {cfg.bgStyle === 'gold' && (
          <rect width="200" height="240" fill="url(#bgGold)" />
        )}
        {(cfg.bgStyle === 'clean' || !cfg.bgStyle) && (
          <rect width="200" height="240" fill="url(#bgStudio)" />
        )}

        {/* Ground Drop Shadow */}
        {showShadow && (
          <ellipse cx="100" cy="222" rx="48" ry="8" fill="#111827" opacity="0.12" />
        )}

        {/* 2. BODY / LEGS BASE */}
        <g id="body-base">
          {/* Feet */}
          <ellipse cx="80" cy="216" rx="14" ry="7" fill="#1F2937" />
          <ellipse cx="120" cy="216" rx="14" ry="7" fill="#1F2937" />

          {/* Bare legs / Skin base */}
          <rect x="70" y="165" width="20" height="50" rx="8" fill={headTone} />
          <rect x="110" y="165" width="20" height="50" rx="8" fill={headTone} />

          {/* BOTTOMS (Pants / Shorts) */}
          {customBottom ? (
            <path d={customBottom.path} fill={cfg.bottomColor || customBottom.defaultColor || '#1F2937'} />
          ) : cfg.bottomId === 'b_jeans' ? (
            <g id="pants-jeans">
              <path d="M 68 150 L 132 150 L 130 205 Q 120 208 110 205 L 100 168 L 90 205 Q 80 208 70 205 Z" fill={cfg.bottomColor || '#1E3A8A'} />
              <path d="M 100 150 L 100 168" stroke="#3B82F6" strokeWidth="1.5" opacity="0.5" />
              {/* Belt */}
              <rect x="68" y="150" width="64" height="6" fill="#111827" />
              <rect x="94" y="149" width="12" height="8" rx="1" fill="#F59E0B" />
            </g>
          ) : cfg.bottomId === 'b_shorts' ? (
            <g id="pants-shorts">
              <path d="M 68 150 L 132 150 L 131 180 Q 120 182 108 180 L 100 162 L 92 180 Q 80 182 69 180 Z" fill={cfg.bottomColor || '#D97706'} />
            </g>
          ) : cfg.bottomId === 'b_tech' ? (
            <g id="pants-tech">
              <path d="M 68 150 L 132 150 L 130 208 Q 120 210 110 208 L 100 168 L 90 208 Q 80 210 70 208 Z" fill={cfg.bottomColor || '#111827'} />
              {/* Tech knee pads */}
              <rect x="73" y="180" width="14" height="16" rx="3" fill="#06B6D4" opacity="0.8" />
              <rect x="113" y="180" width="14" height="16" rx="3" fill="#06B6D4" opacity="0.8" />
            </g>
          ) : (
            /* Default slacks */
            <path d="M 68 150 L 132 150 L 130 206 Q 120 208 110 206 L 100 168 L 90 206 Q 80 208 70 206 Z" fill={cfg.bottomColor || '#374151'} />
          )}

          {/* Bare Torso Base */}
          <path d="M 65 110 Q 100 102 135 110 L 132 154 Q 100 158 68 154 Z" fill={headTone} />
        </g>

        {/* 3. TOPS (Shirts / Jackets) */}
        <g id="body-tops">
          {customTop ? (
            <path d={customTop.path} fill={cfg.topColor || customTop.defaultColor || '#06B6D4'} />
          ) : cfg.topId === 't_hoodie' ? (
            <g id="top-hoodie">
              {/* Hoodie Body */}
              <path d="M 62 108 Q 100 100 138 108 L 134 154 Q 100 158 66 154 Z" fill={cfg.topColor || '#06B6D4'} />
              {/* Hoodie pocket */}
              <path d="M 80 134 L 120 134 L 115 152 L 85 152 Z" fill="#000000" opacity="0.15" />
              {/* Drawstrings */}
              <path d="M 94 112 L 92 128" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
              <path d="M 106 112 L 108 128" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
              {/* Arms */}
              <path d="M 62 108 L 46 142 Q 52 148 60 144 L 72 118 Z" fill={cfg.topColor || '#06B6D4'} />
              <path d="M 138 108 L 154 142 Q 148 148 140 144 L 128 118 Z" fill={cfg.topColor || '#06B6D4'} />
            </g>
          ) : cfg.topId === 't_labcoat' ? (
            <g id="top-labcoat">
              {/* Inner shirt */}
              <path d="M 72 108 L 128 108 L 125 152 L 75 152 Z" fill="#2563EB" />
              {/* White coat */}
              <path d="M 60 106 L 88 108 L 92 154 L 64 154 Z" fill="#F9FAFB" />
              <path d="M 140 106 L 112 108 L 108 154 L 136 154 Z" fill="#F9FAFB" />
              {/* Lapels */}
              <path d="M 88 108 L 100 128 L 88 128 Z" fill="#E5E7EB" />
              <path d="M 112 108 L 100 128 L 112 128 Z" fill="#E5E7EB" />
              {/* Sleeves */}
              <path d="M 60 106 L 44 140 L 58 144 L 70 116 Z" fill="#FFFFFF" />
              <path d="M 140 106 L 156 140 L 142 144 L 130 116 Z" fill="#FFFFFF" />
            </g>
          ) : cfg.topId === 't_vest' ? (
            <g id="top-vest">
              <path d="M 62 108 Q 100 100 138 108 L 134 154 Q 100 158 66 154 Z" fill={cfg.topColor || '#1F2937'} />
              {/* Tactical Vest Panels */}
              <rect x="74" y="114" width="22" height="18" rx="3" fill="#D97706" />
              <rect x="104" y="114" width="22" height="18" rx="3" fill="#D97706" />
              <rect x="80" y="136" width="40" height="12" rx="2" fill="#374151" />
              {/* Arms */}
              <path d="M 62 108 L 48 140 L 58 144 L 70 116 Z" fill={headTone} />
              <path d="M 138 108 L 152 140 L 142 144 L 130 116 Z" fill={headTone} />
            </g>
          ) : (
            <g id="top-tee">
              <path d="M 62 108 Q 100 100 138 108 L 134 154 Q 100 158 66 154 Z" fill={cfg.topColor || '#2563EB'} />
              <path d="M 62 108 L 48 132 Q 54 138 62 134 L 70 116 Z" fill={cfg.topColor || '#2563EB'} />
              <path d="M 138 108 L 152 132 Q 146 138 138 134 L 130 116 Z" fill={cfg.topColor || '#2563EB'} />
              {/* STEM Logo */}
              <circle cx="100" cy="130" r="9" fill="#FFFFFF" opacity="0.9" />
              <path d="M 96 130 L 104 130 M 100 126 L 100 134" stroke="#111827" strokeWidth="2" strokeLinecap="round" />
            </g>
          )}

          {/* Hands */}
          <circle cx="48" cy="146" r="8" fill={headTone} />
          <circle cx="152" cy="146" r="8" fill={headTone} />
        </g>

        {/* 4. HEAD BASE & EARS */}
        <g id="head-group">
          {/* Ears */}
          <ellipse cx="50" cy="74" rx="9" ry="11" fill={headTone} />
          <ellipse cx="150" cy="74" rx="9" ry="11" fill={headTone} />
          <ellipse cx="50" cy="74" rx="5" ry="7" fill="#000000" opacity="0.08" />
          <ellipse cx="150" cy="74" rx="5" ry="7" fill="#000000" opacity="0.08" />

          {/* Main Head Oval */}
          <ellipse cx="100" cy="72" rx="44" ry="40" fill={headTone} />
        </g>

        {/* 5. FACE FEATURES (Eyes, Smile, Blush) */}
        <g id="face-features">
          {/* Rosy Cheeks */}
          <circle cx="72" cy="80" r="7" fill="#F43F5E" opacity="0.25" />
          <circle cx="128" cy="80" r="7" fill="#F43F5E" opacity="0.25" />

          {/* Mouth Expressions */}
          {cfg.faceExpression === 'starry' ? (
            <path d="M 86 86 Q 100 102 114 86 Z" fill="#111827" />
          ) : cfg.faceExpression === 'cool' ? (
            <path d="M 88 88 Q 102 90 114 84" fill="none" stroke="#111827" strokeWidth="3" strokeLinecap="round" />
          ) : cfg.faceExpression === 'determined' ? (
            <path d="M 88 88 L 112 88" stroke="#111827" strokeWidth="3.5" strokeLinecap="round" />
          ) : (
            /* Normal Smile */
            <path d="M 86 84 Q 100 98 114 84" fill="none" stroke="#111827" strokeWidth="3.5" strokeLinecap="round" />
          )}

          {/* Eyes & Eyewear */}
          {cfg.eyesStyle === 'sunglasses' ? (
            <g id="eyes-sunglasses">
              <rect x="68" y="62" width="28" height="18" rx="5" fill="#111827" />
              <rect x="104" y="62" width="28" height="18" rx="5" fill="#111827" />
              <line x1="96" y1="68" x2="104" y2="68" stroke="#111827" strokeWidth="3" />
              {/* Reflection line */}
              <line x1="72" y1="65" x2="82" y2="75" stroke="#FFFFFF" strokeWidth="2" opacity="0.4" />
              <line x1="108" y1="65" x2="118" y2="75" stroke="#FFFFFF" strokeWidth="2" opacity="0.4" />
            </g>
          ) : cfg.eyesStyle === 'glasses' ? (
            <g id="eyes-glasses">
              <circle cx="82" cy="70" r="12" fill="none" stroke="#06B6D4" strokeWidth="3" />
              <circle cx="118" cy="70" r="12" fill="none" stroke="#06B6D4" strokeWidth="3" />
              <line x1="94" y1="70" x2="106" y2="70" stroke="#06B6D4" strokeWidth="3" />
              <circle cx="82" cy="70" r="5" fill={cfg.eyesColor || '#111827'} />
              <circle cx="118" cy="70" r="5" fill={cfg.eyesColor || '#111827'} />
            </g>
          ) : cfg.eyesStyle === 'goggles' ? (
            <g id="eyes-goggles">
              <rect x="62" y="58" width="76" height="24" rx="8" fill="#F59E0B" opacity="0.9" />
              <rect x="66" y="62" width="30" height="16" rx="5" fill="#000" opacity="0.6" />
              <rect x="104" y="62" width="30" height="16" rx="5" fill="#000" opacity="0.6" />
              <circle cx="81" cy="70" r="4" fill="#38BDF8" />
              <circle cx="119" cy="70" r="4" fill="#38BDF8" />
            </g>
          ) : (
            /* Standard Dot Eyes */
            <g id="eyes-standard">
              <circle cx="82" cy="68" r="6" fill={cfg.eyesColor || '#111827'} />
              <circle cx="118" cy="68" r="6" fill={cfg.eyesColor || '#111827'} />
              <circle cx="84" cy="66" r="2" fill="#FFFFFF" />
              <circle cx="120" cy="66" r="2" fill="#FFFFFF" />
            </g>
          )}
        </g>

        {/* 6. HAIR & HEADGEAR & HATS */}
        <g id="hair-and-hats">
          {customHat ? (
            <path d={customHat.path} fill={cfg.hairColor || customHat.defaultColor || '#D97706'} />
          ) : cfg.hatId === 'h_snoo' || cfg.hairStyle === 'snoo' ? (
            <g id="hat-snoo">
              {/* Hair Base */}
              <path d="M 58 56 Q 100 24 142 56 Q 130 38 100 38 Q 70 38 58 56 Z" fill={cfg.hairColor || '#D97706'} />
              {/* Antenna */}
              <path d="M 100 38 L 100 12 C 100 12 120 6 124 16" fill="none" stroke={headTone} strokeWidth="4.5" strokeLinecap="round" />
              <circle cx="125" cy="16" r="8" fill="#FF4500" filter="url(#glowEffect)" />
            </g>
          ) : cfg.hairStyle === 'spiky' || cfg.hatId === 'h_spiky' ? (
            <path d="M 54 62 Q 52 30 70 34 Q 78 18 90 28 Q 102 12 114 26 Q 128 20 134 36 Q 148 40 146 62 Q 134 42 100 42 Q 66 42 54 62 Z" fill={cfg.hairColor || '#D97706'} />
          ) : cfg.hairStyle === 'curly' || cfg.hatId === 'h_curly' ? (
            <g id="hair-curly">
              <circle cx="68" cy="46" r="16" fill={cfg.hairColor || '#7C2D12'} />
              <circle cx="90" cy="38" r="18" fill={cfg.hairColor || '#7C2D12'} />
              <circle cx="112" cy="38" r="18" fill={cfg.hairColor || '#7C2D12'} />
              <circle cx="132" cy="46" r="16" fill={cfg.hairColor || '#7C2D12'} />
            </g>
          ) : cfg.hairStyle === 'cap' || cfg.hatId === 'h_cap' ? (
            <g id="hat-cap">
              <path d="M 54 60 C 54 32 146 32 146 60 Z" fill="#EF4444" />
              {/* Visor / Bill */}
              <path d="M 44 60 L 156 60 C 162 60 162 67 156 67 L 44 67 Z" fill="#DC2626" />
              {/* Badge */}
              <circle cx="100" cy="44" r="7" fill="#FFFFFF" />
              <text x="100" y="47" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#EF4444">S</text>
            </g>
          ) : cfg.hairStyle === 'headphones' || cfg.hatId === 'h_headphones' ? (
            <g id="hat-headphones">
              {/* Hair under */}
              <path d="M 58 56 Q 100 36 142 56 Q 130 40 100 40 Q 70 40 58 56 Z" fill={cfg.hairColor || '#1F2937'} />
              {/* Headband */}
              <path d="M 46 72 C 46 22 154 22 154 72" fill="none" stroke="#06B6D4" strokeWidth="6" strokeLinecap="round" />
              {/* Ear cushions */}
              <rect x="38" y="60" width="16" height="26" rx="6" fill="#06B6D4" />
              <rect x="146" y="60" width="16" height="26" rx="6" fill="#06B6D4" />
              <rect x="42" y="64" width="8" height="18" rx="3" fill="#111827" />
              <rect x="150" y="64" width="8" height="18" rx="3" fill="#111827" />
            </g>
          ) : cfg.hatId === 'h_crown' ? (
            <g id="hat-crown">
              <path d="M 64 50 L 72 26 L 88 42 L 100 20 L 112 42 L 128 26 L 136 50 Z" fill="#F59E0B" />
              <circle cx="72" cy="24" r="3" fill="#EF4444" />
              <circle cx="100" cy="18" r="4" fill="#38BDF8" />
              <circle cx="128" cy="24" r="3" fill="#10B981" />
            </g>
          ) : null}
        </g>

        {/* 7. HELD ITEMS (Hands Accessories) */}
        {/* Left Hand Item */}
        <g id="left-hand-item">
          {customLH ? (
            <path d={customLH.path} fill={customLH.defaultColor || '#06B6D4'} />
          ) : cfg.leftHandId === 'lh_robot' ? (
            <g transform="translate(22, 132)">
              <rect x="0" y="0" width="20" height="18" rx="4" fill="#06B6D4" />
              <circle cx="6" cy="6" r="2.5" fill="#FFF" />
              <circle cx="14" cy="6" r="2.5" fill="#FFF" />
              <line x1="5" y1="13" x2="15" y2="13" stroke="#111827" strokeWidth="1.5" />
              <line x1="10" y1="0" x2="10" y2="-6" stroke="#06B6D4" strokeWidth="2" />
              <circle cx="10" cy="-7" r="2" fill="#F59E0B" />
            </g>
          ) : cfg.leftHandId === 'lh_torch' ? (
            <g transform="translate(24, 120)">
              <rect x="8" y="16" width="6" height="24" fill="#78350F" rx="1" />
              <path d="M 4 2 Q 11 -12 18 2 Q 11 8 4 2 Z" fill="#FF4500" filter="url(#glowEffect)" />
              <path d="M 7 4 Q 11 -6 15 4 Z" fill="#F59E0B" />
            </g>
          ) : cfg.leftHandId === 'lh_flag' ? (
            <g transform="translate(26, 110)">
              <line x1="2" y1="0" x2="2" y2="44" stroke="#D1D5DB" strokeWidth="3" strokeLinecap="round" />
              <path d="M 3 2 L 28 10 L 3 20 Z" fill="#EF4444" />
              <text x="10" y="14" fontSize="7" fontWeight="bold" fill="#FFF">STEM</text>
            </g>
          ) : null}
        </g>

        {/* Right Hand Item */}
        <g id="right-hand-item">
          {customRH ? (
            <path d={customRH.path} fill={customRH.defaultColor || '#10B981'} />
          ) : cfg.rightHandId === 'rh_beaker' ? (
            <g transform="translate(154, 126)">
              {/* Beaker body */}
              <path d="M 8 0 L 16 0 L 18 6 L 22 22 Q 12 26 2 22 L 6 6 Z" fill="none" stroke="#38BDF8" strokeWidth="2" />
              <path d="M 4 14 Q 12 16 20 14 L 21 21 Q 12 25 3 21 Z" fill="#10B981" opacity="0.85" />
              {/* Bubbles */}
              <circle cx="10" cy="8" r="1.5" fill="#34D399" />
              <circle cx="14" cy="4" r="2" fill="#34D399" />
            </g>
          ) : cfg.rightHandId === 'rh_tablet' ? (
            <g transform="translate(152, 128)">
              <rect x="0" y="0" width="22" height="28" rx="3" fill="#1F2937" stroke="#06B6D4" strokeWidth="1.5" />
              <rect x="3" y="3" width="16" height="20" rx="1" fill="#0284C7" />
              <line x1="6" y1="8" x2="16" y2="8" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="6" y1="13" x2="12" y2="13" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" />
            </g>
          ) : cfg.rightHandId === 'rh_wand' ? (
            <g transform="translate(154, 116)">
              <line x1="0" y1="30" x2="18" y2="2" stroke="#4B5563" strokeWidth="3" strokeLinecap="round" />
              <polygon points="18,2 20,6 24,7 21,10 21,14 18,12 14,14 15,10 12,7 16,6" fill="#F59E0B" filter="url(#glowEffect)" />
            </g>
          ) : null}
        </g>
      </svg>
    </div>
  );
}
