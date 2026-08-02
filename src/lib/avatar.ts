export interface CosmeticItem {
  itemId: string;
  category: 'base' | 'head' | 'apparel' | 'accessory';
  name: string;
  description: string;
  price: number;              // Stemios cost. 0 = free/default
  isPremium: boolean;         // true = Stemios purchase, false = free
  isEducationLocked: boolean; // true = only unlockable by completing specific unit
  educationUnitId?: string;   // which unitId unlocks this item
  previewAsset: string;       // asset key for frontend renderer
  cyberpunkTier: 1 | 2 | 3;   // 1=street, 2=mercenary, 3=corpo
  unlocksAtHQ?: number;
}

export const COSMETIC_CATALOG: CosmeticItem[] = [
  // BASE
  {
    itemId: 'b1', category: 'base',
    name: 'Standard Human', description: 'Default street-level frame.',
    price: 0, isPremium: false, isEducationLocked: false,
    previewAsset: 'base_human', cyberpunkTier: 1,
  },
  {
    itemId: 'b2', category: 'base',
    name: 'Cybernetic Frame', description: 'Chrome-reinforced skeleton. Visible joint actuators.',
    price: 500, isPremium: true, isEducationLocked: false,
    previewAsset: 'base_cyber', cyberpunkTier: 2,
  },
  {
    itemId: 'b3', category: 'base',
    name: 'Corpo Shell', description: 'Arasaka-grade synthetic body. Clean lines, zero expression.',
    price: 1200, isPremium: true, isEducationLocked: false,
    previewAsset: 'base_corpo', cyberpunkTier: 3,
  },

  // HEAD
  {
    itemId: 'h1', category: 'head',
    name: 'Street Default', description: 'No mods. Just a face.',
    price: 0, isPremium: false, isEducationLocked: false,
    previewAsset: 'head_default', cyberpunkTier: 1,
  },
  {
    itemId: 'h2', category: 'head',
    name: 'Mohawk Implants', description: 'Neural-strand hair wired into the scalp.',
    price: 200, isPremium: true, isEducationLocked: false,
    previewAsset: 'head_mohawk', cyberpunkTier: 1,
  },
  {
    itemId: 'h3', category: 'head',
    name: 'Kiroshi Optics', description: 'Glowing red optical implants.',
    price: 600, isPremium: true, isEducationLocked: false,
    previewAsset: 'head_kiroshi', cyberpunkTier: 2,
  },
  {
    itemId: 'h4', category: 'head',
    name: 'Neural Jack Crown', description: 'Unlocked by completing AI Foundations.',
    price: 0, isPremium: false, isEducationLocked: true,
    educationUnitId: 'u1',
    previewAsset: 'head_neural', cyberpunkTier: 2,
  },

  // APPAREL
  {
    itemId: 'a1', category: 'apparel',
    name: 'Basic Hoodie', description: 'Worn in. Anonymous. Gets the job done.',
    price: 0, isPremium: false, isEducationLocked: false,
    previewAsset: 'apparel_hoodie', cyberpunkTier: 1,
  },
  {
    itemId: 'a2', category: 'apparel',
    name: 'Neon Synth Jacket', description: 'EL-wire trim. Visible from two blocks away.',
    price: 1200, isPremium: true, isEducationLocked: false,
    previewAsset: 'apparel_neon', cyberpunkTier: 2,
  },
];
