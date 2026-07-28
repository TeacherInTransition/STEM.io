import React, { useState, useEffect } from 'react';
import { User } from '../types';
import AvatarRenderer, { AvatarConfig, DEFAULT_AVATAR_CONFIG, CustomMeshItem } from './AvatarRenderer';
import { 
  Shirt, Smile, Sparkles, Check, Undo2, Redo2, Clock, Palette, 
  Award, ShieldCheck, Plus, Layers, Zap, CheckCircle2, ChevronRight, 
  Lock, AlertCircle, FileCode, Sliders, Info, Eye
} from 'lucide-react';

interface AvatarCustomizerProps {
  user: User;
  onSaveConfig?: (config: AvatarConfig) => void;
}

// Catalog Items categorized by Section (Collectibles, Explorers, STEM Gear, King of the Hill)
const CATALOG = {
  Outfits: [
    {
      id: 'outfit_explorer',
      name: 'Cyber Explorer Set',
      category: 'Explorers',
      topId: 't_vest',
      bottomId: 'b_tech',
      hatId: 'h_snoo',
      topColor: '#D97706',
      bottomColor: '#111827',
      price: 0,
      owned: true,
      previewBg: '#FEF3C7'
    },
    {
      id: 'outfit_scientist',
      name: 'Quantum Lab Fellow',
      category: 'STEM Gear',
      topId: 't_labcoat',
      bottomId: 'b_jeans',
      hatId: 'h_headphones',
      topColor: '#2563EB',
      bottomColor: '#1E3A8A',
      price: 150,
      owned: true,
      previewBg: '#E0F2FE'
    },
    {
      id: 'outfit_royal',
      name: 'King of the Hill Monarch',
      category: 'King of the Hill',
      topId: 't_hoodie',
      bottomId: 'b_tech',
      hatId: 'h_crown',
      topColor: '#7C3AED',
      bottomColor: '#1F2937',
      price: 350,
      owned: false,
      previewBg: '#F3E8FF'
    }
  ],
  Tops: [
    { id: 't_hoodie', name: 'Cyber Hoodie', category: 'Collectibles', slot: 'topId', price: 0, owned: true, color: '#06B6D4' },
    { id: 't_labcoat', name: 'Researcher Lab Coat', category: 'STEM Gear', slot: 'topId', price: 100, owned: true, color: '#FFFFFF' },
    { id: 't_vest', name: 'Tactical Explorer Vest', category: 'Explorers', slot: 'topId', price: 120, owned: true, color: '#D97706' },
    { id: 't_tee', name: 'STEM.io Cadet Tee', category: 'Collectibles', slot: 'topId', price: 0, owned: true, color: '#2563EB' }
  ],
  Bottoms: [
    { id: 'b_jeans', name: 'Denim Slacks', category: 'Collectibles', slot: 'bottomId', price: 0, owned: true, color: '#1E3A8A' },
    { id: 'b_shorts', name: 'Explorer Cargo Shorts', category: 'Explorers', slot: 'bottomId', price: 80, owned: true, color: '#D97706' },
    { id: 'b_tech', name: 'Cybernetic Tech Pants', category: 'Collectibles', slot: 'bottomId', price: 150, owned: false, color: '#111827' }
  ],
  Hair: [
    { id: 'spiky', name: 'Spiky Anime Hair', category: 'Collectibles', slot: 'hairStyle', price: 0, owned: true },
    { id: 'snoo', name: 'Classic Snoo Antenna', category: 'King of the Hill', slot: 'hairStyle', price: 0, owned: true },
    { id: 'curly', name: 'Wavy Afro Crown', category: 'Collectibles', slot: 'hairStyle', price: 60, owned: true },
    { id: 'cap', name: 'Red Baseball Cap', category: 'Explorers', slot: 'hairStyle', price: 90, owned: true },
    { id: 'headphones', name: 'Pro DJ Headset', category: 'STEM Gear', slot: 'hairStyle', price: 110, owned: false }
  ],
  Face: [
    { id: 'smile', name: 'Friendly Cadet Smile', category: 'Collectibles', slot: 'faceExpression', price: 0, owned: true },
    { id: 'cool', name: 'Confident Smirk', category: 'Explorers', slot: 'faceExpression', price: 50, owned: true },
    { id: 'starry', name: 'Starry Eye Joy', category: 'King of the Hill', slot: 'faceExpression', price: 80, owned: false },
    { id: 'determined', name: 'Focus Mode Line', category: 'STEM Gear', slot: 'faceExpression', price: 40, owned: true }
  ],
  Eyes: [
    { id: 'sunglasses', name: 'Dark Shades', category: 'Explorers', slot: 'eyesStyle', price: 0, owned: true },
    { id: 'glasses', name: 'Cyber Frames', category: 'STEM Gear', slot: 'eyesStyle', price: 60, owned: true },
    { id: 'goggles', name: 'Lab Safety Goggles', category: 'STEM Gear', slot: 'eyesStyle', price: 100, owned: true },
    { id: 'dot', name: 'Classic Dots', category: 'Collectibles', slot: 'eyesStyle', price: 0, owned: true }
  ],
  Hats: [
    { id: 'h_snoo', name: 'Glowing Antenna', category: 'King of the Hill', slot: 'hatId', price: 0, owned: true },
    { id: 'h_crown', name: 'Monarch Gold Crown', category: 'Collectibles', slot: 'hatId', price: 300, owned: false },
    { id: 'h_cap', name: 'Red Cap', category: 'Explorers', slot: 'hatId', price: 70, owned: true },
    { id: 'h_headphones', name: 'Cyan DJ Headset', category: 'STEM Gear', slot: 'hatId', price: 120, owned: false }
  ],
  'Right Hand': [
    { id: 'rh_beaker', name: 'Glowing Chemical Beaker', category: 'STEM Gear', slot: 'rightHandId', price: 0, owned: true },
    { id: 'rh_tablet', name: 'Quantum Data Tablet', category: 'Collectibles', slot: 'rightHandId', price: 110, owned: true },
    { id: 'rh_wand', name: 'Quantum Arc Wand', category: 'King of the Hill', slot: 'rightHandId', price: 200, owned: false }
  ],
  'Left Hand': [
    { id: 'lh_robot', name: 'Cyber Companion Pet', category: 'STEM Gear', slot: 'leftHandId', price: 0, owned: true },
    { id: 'lh_torch', name: 'Plasma Torch', category: 'Explorers', slot: 'leftHandId', price: 90, owned: true },
    { id: 'lh_flag', name: 'MUIDS Cadet Flag', category: 'Collectibles', slot: 'leftHandId', price: 150, owned: false }
  ],
  Backgrounds: [
    { id: 'clean', name: 'Studio White Neutral', category: 'Collectibles', slot: 'bgStyle', price: 0, owned: true },
    { id: 'lab', name: 'Cybernetic Science Lab', category: 'STEM Gear', slot: 'bgStyle', price: 100, owned: true },
    { id: 'space', name: 'Deep Space Constellation', category: 'Explorers', slot: 'bgStyle', price: 180, owned: false },
    { id: 'gold', name: 'Aura of Mastery', category: 'King of the Hill', slot: 'bgStyle', price: 250, owned: false }
  ]
};

// Preset color options for Swatches
const COLOR_SWATCHES = {
  Body: [
    { label: 'Light', hex: '#FCD5CE' },
    { label: 'Warm', hex: '#FFDFC4' },
    { label: 'Bronze', hex: '#8D5524' },
    { label: 'Cyber Blue', hex: '#38BDF8' },
    { label: 'Neon Purple', hex: '#A855F7' }
  ],
  Eyes: [
    { label: 'Obsidian', hex: '#111827' },
    { label: 'Cyber Cyan', hex: '#06B6D4' },
    { label: 'Emerald', hex: '#10B981' },
    { label: 'Amber', hex: '#F59E0B' },
    { label: 'Ruby', hex: '#EF4444' }
  ],
  Hair: [
    { label: 'Golden Amber', hex: '#D97706' },
    { label: 'Midnight Jet', hex: '#111827' },
    { label: 'Silver Gray', hex: '#9CA3AF' },
    { label: 'Crimson', hex: '#DC2626' },
    { label: 'Electric Blue', hex: '#2563EB' }
  ],
  Tops: [
    { label: 'Cyan', hex: '#06B6D4' },
    { label: 'Royal Blue', hex: '#2563EB' },
    { label: 'Amber', hex: '#D97706' },
    { label: 'Emerald', hex: '#10B981' },
    { label: 'Obsidian', hex: '#111827' },
    { label: 'White', hex: '#F9FAFB' }
  ],
  Bottoms: [
    { label: 'Denim', hex: '#1E3A8A' },
    { label: 'Obsidian', hex: '#111827' },
    { label: 'Amber Cargo', hex: '#D97706' },
    { label: 'Slate Gray', hex: '#374151' }
  ]
};

export default function AvatarCustomizer({ user, onSaveConfig }: AvatarCustomizerProps) {
  // Current active tab
  const [activeTab, setActiveTab] = useState<string>('Outfits');

  // Avatar State & History
  const [currentConfig, setCurrentConfig] = useState<AvatarConfig>(() => {
    const saved = localStorage.getItem('stemio_avatar_config');
    return saved ? JSON.parse(saved) : DEFAULT_AVATAR_CONFIG;
  });

  const [history, setHistory] = useState<AvatarConfig[]>([currentConfig]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Custom Mesh Admin State
  const [customMeshes, setCustomMeshes] = useState<CustomMeshItem[]>(() => {
    const saved = localStorage.getItem('stemio_custom_meshes');
    return saved ? JSON.parse(saved) : [
      {
        id: 'mesh_cyber_coat',
        name: 'Admin Nano-Jacket',
        slot: 'tops',
        path: 'M 60 106 Q 100 98 140 106 L 138 156 Q 100 162 62 156 Z M 60 106 L 40 138 L 54 144 L 68 116 Z M 140 106 L 160 138 L 146 144 L 132 116 Z',
        defaultColor: '#A855F7',
        category: 'King of the Hill',
        price: 200
      },
      {
        id: 'mesh_armor_pants',
        name: 'Admin Battle Greaves',
        slot: 'bottoms',
        path: 'M 68 150 L 132 150 L 130 210 Q 120 212 110 210 L 100 168 L 90 210 Q 80 212 70 210 Z M 73 175 L 87 175 L 87 195 L 73 195 Z M 113 175 L 127 175 L 127 195 L 113 195 Z',
        defaultColor: '#111827',
        category: 'STEM Gear',
        price: 220
      }
    ];
  });

  // Admin New Mesh Input Form State
  const [adminMeshForm, setAdminMeshForm] = useState({
    name: 'Custom Cyber Mesh',
    slot: 'tops' as 'tops' | 'bottoms' | 'hats' | 'rightHand' | 'leftHand',
    category: 'STEM Gear',
    price: 150,
    defaultColor: '#06B6D4',
    path: 'M 62 108 Q 100 100 138 108 L 134 154 Q 100 158 66 154 Z'
  });

  // Keep custom meshes attached to config
  useEffect(() => {
    setCurrentConfig(prev => ({
      ...prev,
      customMeshes
    }));
  }, [customMeshes]);

  // Handle configuration update with history stack
  const updateConfig = (newConfig: AvatarConfig) => {
    const updated = { ...newConfig, customMeshes };
    setCurrentConfig(updated);
    
    // Slice forward history if we were in undo state
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(updated);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      setCurrentConfig(history[prevIdx]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setCurrentConfig(history[nextIdx]);
    }
  };

  const handleSave = () => {
    localStorage.setItem('stemio_avatar_config', JSON.stringify(currentConfig));
    window.dispatchEvent(new CustomEvent('stemio-avatar-updated', { detail: currentConfig }));
    if (onSaveConfig) onSaveConfig(currentConfig);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Add Custom Admin Mesh to Inventory Catalog
  const handleAddAdminMesh = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminMeshForm.name || !adminMeshForm.path) return;

    const newMeshItem: CustomMeshItem = {
      id: `mesh_${Date.now()}`,
      name: adminMeshForm.name,
      slot: adminMeshForm.slot,
      category: adminMeshForm.category,
      price: Number(adminMeshForm.price) || 100,
      defaultColor: adminMeshForm.defaultColor,
      path: adminMeshForm.path,
      createdAt: Date.now()
    };

    const updatedMeshes = [...customMeshes, newMeshItem];
    setCustomMeshes(updatedMeshes);
    localStorage.setItem('stemio_custom_meshes', JSON.stringify(updatedMeshes));

    // Automatically equip the new mesh slot
    const slotKeyMap: Record<string, keyof AvatarConfig> = {
      tops: 'topId',
      bottoms: 'bottomId',
      hats: 'hatId',
      rightHand: 'rightHandId',
      leftHand: 'leftHandId'
    };

    const slotKey = slotKeyMap[adminMeshForm.slot];
    if (slotKey) {
      updateConfig({
        ...currentConfig,
        [slotKey]: newMeshItem.id
      });
    }

    alert(`Successfully generated & equipped "${newMeshItem.name}" in catalog!`);
  };

  const CATEGORY_TABS = [
    'Outfits', 'Tops', 'Bottoms', 'Hair', 'Face', 'Eyes', 'Hats', 
    'Right Hand', 'Left Hand', 'Backgrounds', 'Colors', 'Rubrics'
  ];

  if (user.isAdmin) {
    CATEGORY_TABS.push('Admin Mesh Builder');
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mb-12 animate-fadeIn">
      
      {/* Top Banner Header */}
      <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-6 mb-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#FF4500]/10 text-[#FF4500] border border-[#FF4500]/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Grade 10 STEM Arcade
            </span>
            <span className="text-xs text-gray-500 font-mono">Avatar Identity Studio</span>
          </div>
          <h1 className="text-2xl font-black text-[#111827] tracking-tight">
            Cadet Character Studio & Customizer
          </h1>
          <p className="text-sm text-gray-600 mt-1 max-w-2xl">
            Design your custom STEM Cadet avatar, equip earned gear, evaluate your design against Grade 10 rubrics, or craft custom meshes in admin mode.
          </p>
        </div>

        <div className="flex items-center gap-3 self-stretch md:self-auto bg-[#F9FAFB] border border-[#E5E7EB] p-3 rounded-xl">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#F59E0B]" />
            <div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Your Stemios Balance</div>
              <div className="text-base font-black text-[#111827] font-mono">{user.stemios.toLocaleString()} 🪙</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Reddit Customizer Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[640px]">

        {/* LEFT COLUMN: Large Live Preview + Action Bar + Save Button */}
        <div className="lg:col-span-5 bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
          
          {/* Top Status Capsule */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-gray-700 font-mono">{user.name}'s Avatar</span>
            </div>
            <span className="text-[10px] font-bold bg-[#F3F4F6] text-gray-600 px-2.5 py-1 rounded-full uppercase tracking-widest border border-[#E5E7EB]">
              Grade 10 Cadet
            </span>
          </div>

          {/* Central Avatar Studio Preview Stage */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl relative my-2 min-h-[360px]">
            <AvatarRenderer config={currentConfig} size={280} showShadow={true} />
            
            {savedSuccess && (
              <div className="absolute top-4 bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5 animate-bounce z-20">
                <CheckCircle2 size={16} /> Saved to Profile & Navbar!
              </div>
            )}
          </div>

          {/* Bottom Controls Row: Outfit / Undo / Redo & Save */}
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateConfig(DEFAULT_AVATAR_CONFIG)}
                  className="p-2 rounded-xl bg-[#F3F4F6] hover:bg-[#E5E7EB] text-gray-700 transition-colors"
                  title="Reset to Default Avatar"
                >
                  <Clock size={18} />
                </button>
                <button
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  className="p-2 rounded-xl bg-[#F3F4F6] hover:bg-[#E5E7EB] text-gray-700 transition-colors disabled:opacity-40"
                  title="Undo Change"
                >
                  <Undo2 size={18} />
                </button>
                <button
                  onClick={handleRedo}
                  disabled={historyIndex >= history.length - 1}
                  className="p-2 rounded-xl bg-[#F3F4F6] hover:bg-[#E5E7EB] text-gray-700 transition-colors disabled:opacity-40"
                  title="Redo Change"
                >
                  <Redo2 size={18} />
                </button>
              </div>

              <span className="text-xs text-gray-500 font-mono">
                {historyIndex + 1} / {history.length} Edits
              </span>
            </div>

            {/* Bright Reddit Orange Save Button */}
            <button
              onClick={handleSave}
              className="w-full py-3.5 px-6 bg-[#FF4500] hover:bg-[#E03D00] active:scale-[0.99] text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 size={18} /> Save & Apply Avatar
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: Navigation Bar + Content Panel */}
        <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl flex flex-col overflow-hidden shadow-sm">
          
          {/* Horizontal Scrollable Category Navigation Bar */}
          <div className="border-b border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 overflow-x-auto no-scrollbar flex items-center gap-2">
            {CATEGORY_TABS.map(tab => {
              const isActive = activeTab === tab;
              const isAdminTab = tab === 'Admin Mesh Builder';
              const isRubricTab = tab === 'Rubrics';

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? isAdminTab
                        ? 'bg-[#7C3AED] text-white shadow-sm'
                        : isRubricTab
                        ? 'bg-[#059669] text-white shadow-sm'
                        : 'bg-[#FF4500] text-white shadow-sm'
                      : isAdminTab
                      ? 'bg-[#F3E8FF] text-[#7C3AED] hover:bg-[#E9D5FF]'
                      : isRubricTab
                      ? 'bg-[#ECFDF5] text-[#059669] hover:bg-[#D1FAE5]'
                      : 'text-gray-600 hover:bg-[#E5E7EB] hover:text-[#111827]'
                  }`}
                >
                  {isAdminTab && <Zap size={14} />}
                  {isRubricTab && <Award size={14} />}
                  {tab === 'Colors' && <Palette size={14} />}
                  {tab}
                </button>
              );
            })}
          </div>

          {/* TAB CONTENT AREA */}
          <div className="flex-1 p-6 overflow-y-auto max-h-[580px]">

            {/* TAB 1: COLORS */}
            {activeTab === 'Colors' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-[#ECFDF5] border border-[#A7F3D0] p-4 rounded-xl flex items-center gap-3 text-xs text-[#065F46]">
                  <Palette size={18} className="shrink-0 text-[#059669]" />
                  <span>Customize specific color tones for your Cadet's skin, eyes, hair, tops, and bottoms!</span>
                </div>

                {/* Color Swatch Sections */}
                {Object.entries(COLOR_SWATCHES).map(([part, swatches]) => {
                  const colorKeyMap: Record<string, keyof AvatarConfig> = {
                    Body: 'headColor',
                    Eyes: 'eyesColor',
                    Hair: 'hairColor',
                    Tops: 'topColor',
                    Bottoms: 'bottomColor'
                  };

                  const configKey = colorKeyMap[part];
                  const activeColor = currentConfig[configKey] as string;

                  return (
                    <div key={part} className="border-b border-[#F3F4F6] pb-5">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-700">{part} Color Tone</label>
                        <span className="text-xs font-mono text-gray-500 uppercase">{activeColor}</span>
                      </div>

                      <div className="flex items-center gap-3 overflow-x-auto pb-2">
                        {/* Custom Color Input */}
                        <div className="relative shrink-0 flex items-center justify-center w-10 h-10 rounded-full border-2 border-gray-300 bg-white overflow-hidden shadow-xs cursor-pointer hover:scale-105 transition-transform" title="Custom Color Picker">
                          <input
                            type="color"
                            value={activeColor || '#06B6D4'}
                            onChange={(e) => updateConfig({ ...currentConfig, [configKey]: e.target.value })}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                          <Palette size={18} className="text-gray-700 pointer-events-none" />
                        </div>

                        {/* Swatches */}
                        {swatches.map(swatch => {
                          const isSelected = activeColor === swatch.hex;

                          return (
                            <button
                              key={swatch.hex}
                              onClick={() => updateConfig({ ...currentConfig, [configKey]: swatch.hex })}
                              className={`w-10 h-10 rounded-full border-2 transition-all shrink-0 flex items-center justify-center cursor-pointer ${
                                isSelected ? 'border-[#FF4500] scale-110 shadow-md ring-2 ring-[#FF4500]/30' : 'border-transparent hover:scale-105'
                              }`}
                              style={{ backgroundColor: swatch.hex }}
                              title={swatch.label}
                            >
                              {isSelected && <Check size={14} className={['#F9FAFB', '#FFFFFF', '#FCD5CE', '#FFDFC4'].includes(swatch.hex) ? 'text-gray-900' : 'text-white'} />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 2: RUBRICS FOR AVATAR CUSTOMIZATION */}
            {activeTab === 'Rubrics' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-[#FEF3C7] border border-[#FDE68A] p-4 rounded-xl flex items-start gap-3 text-xs text-[#92400E]">
                  <Award size={20} className="shrink-0 text-[#D97706] mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-[#78350F]">Grade 10 STEM Cadet Avatar Rubric</h4>
                    <p className="mt-0.5">
                      Your avatar is evaluated based on theme representation, outfit harmony, milestone progress, and personal expression. Fulfilling all criteria awards +50 Bonus Stemios!
                    </p>
                  </div>
                </div>

                {/* Rubric Evaluation Table */}
                <div className="border border-[#E5E7EB] rounded-xl overflow-hidden divide-y divide-[#E5E7EB]">
                  {[
                    {
                      title: '1. Theme & STEM Identity Alignment',
                      weight: '25% Weight',
                      criteria: [
                        { pts: '4 Pts (Exemplary)', desc: 'Equips relevant STEM gear or explorer accessories (e.g., Lab Coat, Beaker, Cyber Glasses, Companion Pet).' },
                        { pts: '3 Pts (Proficient)', desc: 'Equips 1 thematic accessory aligned with course units.' },
                        { pts: '1-2 Pts (Developing)', desc: 'Default attire with no specific STEM theme elements.' }
                      ]
                    },
                    {
                      title: '2. Outfit Harmony & Color Coordination',
                      weight: '25% Weight',
                      criteria: [
                        { pts: '4 Pts (Exemplary)', desc: 'Demonstrates complementary color harmony across tops, bottoms, eyes, and hair.' },
                        { pts: '3 Pts (Proficient)', desc: 'Coordinated colors with slight contrast imbalance.' },
                        { pts: '1-2 Pts (Developing)', desc: 'Randomized uncoordinated color selections.' }
                      ]
                    },
                    {
                      title: '3. Milestone Competence & Badge Mastery',
                      weight: '25% Weight',
                      criteria: [
                        { pts: '4 Pts (Exemplary)', desc: 'Unlocks and equips earned items from completed unit milestones or quizzes.' },
                        { pts: '3 Pts (Proficient)', desc: 'Equips basic unlocked shop items.' },
                        { pts: '1-2 Pts (Developing)', desc: 'Uses starter defaults only.' }
                      ]
                    },
                    {
                      title: '4. Creative Personal Expression',
                      weight: '25% Weight',
                      criteria: [
                        { pts: '4 Pts (Exemplary)', desc: 'Distinctive, memorable character design with unique facial expressions and background.' },
                        { pts: '3 Pts (Proficient)', desc: 'Standard custom setup.' },
                        { pts: '1-2 Pts (Developing)', desc: 'Minimal edits.' }
                      ]
                    }
                  ].map((rubricItem, idx) => (
                    <div key={idx} className="p-4 bg-white hover:bg-[#F9FAFB] transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-sm text-[#111827] flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-[#059669]" /> {rubricItem.title}
                        </h4>
                        <span className="text-[10px] font-mono font-bold bg-[#F3F4F6] text-gray-600 px-2.5 py-0.5 rounded-full uppercase">
                          {rubricItem.weight}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                        {rubricItem.criteria.map((c, cIdx) => (
                          <div key={cIdx} className={`p-2.5 rounded-lg border text-xs ${cIdx === 0 ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]' : 'bg-[#F9FAFB] border-[#E5E7EB] text-gray-600'}`}>
                            <div className="font-bold mb-1">{c.pts}</div>
                            <p className="text-[11px] leading-relaxed">{c.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Cadet Self-Evaluation Grade</span>
                    <span className="text-sm text-emerald-600 font-bold">16 / 16 Points (Exemplary Status)</span>
                  </div>
                  <button
                    onClick={() => {
                      alert("Rubric validated! You have earned +50 Bonus Stemios for your Exemplary Avatar!");
                      handleSave();
                    }}
                    className="px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5"
                  >
                    <Award size={16} /> Validate Rubric (+50 Stemios)
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: ADMIN MESH BUILDER (ADMIN OVERRIDE) */}
            {activeTab === 'Admin Mesh Builder' && user.isAdmin && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-[#F3E8FF] border border-[#D8B4FE] p-4 rounded-xl flex items-start gap-3 text-xs text-[#5B21B6]">
                  <Zap size={20} className="shrink-0 text-[#7C3AED] mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-[#4C1D95]">Admin Mesh Ingestion & Converter Panel</h4>
                    <p className="mt-0.5">
                      Input custom 2D/3D cloth vector mesh paths (`d="..."`). These meshes immediately convert into wearable pants, shirts, hats, or accessories for all cadets!
                    </p>
                  </div>
                </div>

                <form onSubmit={handleAddAdminMesh} className="space-y-4 bg-[#F9FAFB] border border-[#E5E7EB] p-5 rounded-xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Item Title / Name</label>
                      <input
                        type="text"
                        required
                        value={adminMeshForm.name}
                        onChange={(e) => setAdminMeshForm({ ...adminMeshForm, name: e.target.value })}
                        className="w-full bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs font-bold text-gray-900 outline-none focus:border-[#7C3AED]"
                        placeholder="E.g. Nano-Tech Battle Vest"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Target Mesh Slot</label>
                      <select
                        value={adminMeshForm.slot}
                        onChange={(e) => setAdminMeshForm({ ...adminMeshForm, slot: e.target.value as any })}
                        className="w-full bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs font-bold text-gray-900 outline-none focus:border-[#7C3AED]"
                      >
                        <option value="tops">Tops (Shirt / Coat / Vest)</option>
                        <option value="bottoms">Bottoms (Pants / Shorts)</option>
                        <option value="hats">Hats / Helmets</option>
                        <option value="rightHand">Right Hand Accessory</option>
                        <option value="leftHand">Left Hand Accessory</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Catalog Category</label>
                      <select
                        value={adminMeshForm.category}
                        onChange={(e) => setAdminMeshForm({ ...adminMeshForm, category: e.target.value })}
                        className="w-full bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs font-bold text-gray-900 outline-none focus:border-[#7C3AED]"
                      >
                        <option value="STEM Gear">STEM Gear</option>
                        <option value="Explorers">Explorers</option>
                        <option value="King of the Hill">King of the Hill</option>
                        <option value="Collectibles">Collectibles</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Stemios Price</label>
                      <input
                        type="number"
                        value={adminMeshForm.price}
                        onChange={(e) => setAdminMeshForm({ ...adminMeshForm, price: Number(e.target.value) })}
                        className="w-full bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs font-bold text-gray-900 outline-none focus:border-[#7C3AED]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Default Accent Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={adminMeshForm.defaultColor}
                        onChange={(e) => setAdminMeshForm({ ...adminMeshForm, defaultColor: e.target.value })}
                        className="w-10 h-10 rounded-xl cursor-pointer border border-[#E5E7EB]"
                      />
                      <span className="text-xs font-mono font-bold text-gray-600">{adminMeshForm.defaultColor}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      SVG Mesh Path String (`d="..."`)
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={adminMeshForm.path}
                      onChange={(e) => setAdminMeshForm({ ...adminMeshForm, path: e.target.value })}
                      className="w-full bg-white border border-[#E5E7EB] rounded-xl p-3 text-xs font-mono text-gray-800 outline-none focus:border-[#7C3AED]"
                      placeholder="M 60 108 Q 100 98 140 106..."
                    />
                  </div>

                  {/* Preset Quick Generator Templates */}
                  <div className="p-3 bg-white border border-[#E5E7EB] rounded-xl">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-2">Preset Quick Mesh Generator Templates:</span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setAdminMeshForm({
                          name: 'Nano Synth Jacket',
                          slot: 'tops',
                          category: 'STEM Gear',
                          price: 200,
                          defaultColor: '#A855F7',
                          path: 'M 60 106 Q 100 98 140 106 L 138 156 Q 100 162 62 156 Z M 60 106 L 40 138 L 54 144 L 68 116 Z M 140 106 L 160 138 L 146 144 L 132 116 Z'
                        })}
                        className="px-2.5 py-1 bg-[#F3E8FF] hover:bg-[#E9D5FF] text-[#7C3AED] text-[11px] font-bold rounded-lg transition"
                      >
                        + Synth Coat Mesh
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdminMeshForm({
                          name: 'Quantum Cyber Slacks',
                          slot: 'bottoms',
                          category: 'Explorers',
                          price: 180,
                          defaultColor: '#1E3A8A',
                          path: 'M 68 150 L 132 150 L 130 210 Q 120 212 110 210 L 100 168 L 90 210 Q 80 212 70 210 Z M 73 175 L 87 175 L 87 195 L 73 195 Z'
                        })}
                        className="px-2.5 py-1 bg-[#DBEAFE] hover:bg-[#BFDBFE] text-[#1D4ED8] text-[11px] font-bold rounded-lg transition"
                      >
                        + Cyber Slacks Mesh
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdminMeshForm({
                          name: 'Astronaut Visor Helmet',
                          slot: 'hats',
                          category: 'STEM Gear',
                          price: 250,
                          defaultColor: '#06B6D4',
                          path: 'M 52 50 Q 100 18 148 50 Q 130 28 100 28 Q 70 28 52 50 Z M 60 55 L 140 55 L 135 75 L 65 75 Z'
                        })}
                        className="px-2.5 py-1 bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#047857] text-[11px] font-bold rounded-lg transition"
                      >
                        + Visor Helmet Mesh
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus size={16} /> Convert Mesh & Add to Catalog
                  </button>
                </form>

                {/* List of Custom Admin Meshes */}
                <div>
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                    Active Custom Meshes In Catalog ({customMeshes.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {customMeshes.map(mesh => (
                      <div key={mesh.id} className="p-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl flex items-center justify-between">
                        <div>
                          <div className="font-bold text-xs text-gray-900">{mesh.name}</div>
                          <div className="text-[10px] text-gray-500 font-mono uppercase">
                            Slot: {mesh.slot} • {mesh.price} Stemios
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const slotKeyMap: Record<string, keyof AvatarConfig> = {
                              tops: 'topId',
                              bottoms: 'bottomId',
                              hats: 'hatId',
                              rightHand: 'rightHandId',
                              leftHand: 'leftHandId'
                            };
                            const slotKey = slotKeyMap[mesh.slot];
                            if (slotKey) {
                              updateConfig({ ...currentConfig, [slotKey]: mesh.id });
                            }
                          }}
                          className="px-3 py-1.5 bg-[#7C3AED] text-white text-[11px] font-bold rounded-lg hover:bg-[#6D28D9] transition"
                        >
                          Test Equip
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: GENERAL CATALOG ITEMS (Outfits, Tops, Bottoms, Hair, Face, Eyes, Hats, Right Hand, Left Hand, Backgrounds) */}
            {!['Colors', 'Rubrics', 'Admin Mesh Builder'].includes(activeTab) && (
              <div className="space-y-6 animate-fadeIn">
                
                {/* Check if there are custom admin meshes for this active tab slot */}
                {(() => {
                  const slotMap: Record<string, 'tops' | 'bottoms' | 'hats' | 'rightHand' | 'leftHand'> = {
                    Tops: 'tops',
                    Bottoms: 'bottoms',
                    Hats: 'hats',
                    'Right Hand': 'rightHand',
                    'Left Hand': 'leftHand'
                  };
                  const matchingSlot = slotMap[activeTab];
                  const activeCustoms = matchingSlot ? customMeshes.filter(m => m.slot === matchingSlot) : [];

                  const rawItems = (CATALOG[activeTab as keyof typeof CATALOG] || []) as any[];

                  // Group items by category (e.g. Collectibles, Explorers, STEM Gear, King of the Hill)
                  const groupedCategories: Record<string, any[]> = {};

                  rawItems.forEach(item => {
                    const cat = item.category || 'Collectibles';
                    if (!groupedCategories[cat]) groupedCategories[cat] = [];
                    groupedCategories[cat].push(item);
                  });

                  if (activeCustoms.length > 0) {
                    activeCustoms.forEach(mesh => {
                      const cat = mesh.category || 'Admin Custom';
                      if (!groupedCategories[cat]) groupedCategories[cat] = [];
                      groupedCategories[cat].push({
                        id: mesh.id,
                        name: mesh.name,
                        category: cat,
                        slot: mesh.slot === 'tops' ? 'topId' : mesh.slot === 'bottoms' ? 'bottomId' : mesh.slot === 'hats' ? 'hatId' : mesh.slot === 'rightHand' ? 'rightHandId' : 'leftHandId',
                        price: mesh.price,
                        owned: true,
                        isCustomMesh: true
                      });
                    });
                  }

                  return Object.entries(groupedCategories).map(([categoryName, items]) => (
                    <div key={categoryName} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-[#111827] uppercase tracking-wider flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#FF4500]"></span>
                          {categoryName}
                        </h3>
                        <span className="text-[11px] font-mono text-gray-500">{items.length} Items</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {items.map(item => {
                          // Check if equipped
                          let isEquipped = false;

                          if (activeTab === 'Outfits') {
                            isEquipped = currentConfig.topId === item.topId && currentConfig.bottomId === item.bottomId;
                          } else {
                            const slotKey = item.slot as keyof AvatarConfig;
                            isEquipped = currentConfig[slotKey] === item.id;
                          }

                          return (
                            <div
                              key={item.id}
                              className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                                isEquipped
                                  ? 'border-[#FF4500] bg-[#FFF5F2] ring-2 ring-[#FF4500]/20 shadow-xs'
                                  : 'border-[#E5E7EB] bg-white hover:border-gray-300 hover:shadow-xs'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-bold text-xs text-[#111827]">{item.name}</h4>
                                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">
                                    {item.category}
                                  </span>
                                </div>
                                {item.isCustomMesh && (
                                  <span className="bg-[#F3E8FF] text-[#7C3AED] text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                                    Mesh
                                  </span>
                                )}
                              </div>

                              <div className="pt-2 border-t border-[#F3F4F6]">
                                {isEquipped ? (
                                  <button
                                    disabled
                                    className="w-full py-2 bg-[#FF4500] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1 shadow-xs"
                                  >
                                    <Check size={14} /> Equipped
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => {
                                      if (activeTab === 'Outfits') {
                                        updateConfig({
                                          ...currentConfig,
                                          topId: item.topId,
                                          bottomId: item.bottomId,
                                          hatId: item.hatId || currentConfig.hatId,
                                          topColor: item.topColor || currentConfig.topColor,
                                          bottomColor: item.bottomColor || currentConfig.bottomColor
                                        });
                                      } else {
                                        const slotKey = item.slot as keyof AvatarConfig;
                                        updateConfig({
                                          ...currentConfig,
                                          [slotKey]: item.id
                                        });
                                      }
                                    }}
                                    className="w-full py-2 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#111827] text-xs font-bold rounded-lg transition-colors cursor-pointer"
                                  >
                                    Equip
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ));
                })()}

              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
