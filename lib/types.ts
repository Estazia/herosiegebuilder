// Hero Siege Classes
export const HERO_CLASSES = [
  'Amazon',
  'Bard',
  'Butcher',
  'Demon Slayer',
  'Demonspawn',
  'Exo',
  'Illusionist',
  'Jötunn',
  'Marauder',
  'Marksman',
  'Necromancer',
  'Nomad',
  'Paladin',
  'Pirate',
  'Plague Doctor',
  'Prophet',
  'Pyromancer',
  'Redneck',
  'Samurai',
  'Shaman',
  'Shield Lancer',
  'Stormweaver',
  'Viking',
  'White Mage',
] as const;

export type HeroClass = (typeof HERO_CLASSES)[number];

// Tab Types
export const TAB_TYPES = [
  'GEAR',
  'ATTRIBUTES',
  'SKILLS',
  'INCARNATION',
  'MERCENARY',
  'FAQ',
  'SHOWCASE',
] as const;

export type TabType = (typeof TAB_TYPES)[number];

// User Roles
export type UserRole = 'USER' | 'CREATOR' | 'ADMIN';

// Database Types
export interface Profile {
  id: string;
  username: string;
  email: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Build {
  id: string;
  title: string;
  slug: string;
  class: HeroClass;
  description: string | null;
  tags: string[];
  user_id: string | null;
  guest_token: string | null;
  views: number;
  is_published: boolean;
  is_draft: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  profiles?: Profile | null;
  average_rating?: number;
  vote_count?: number;
}

export interface BuildTab {
  id: string;
  build_id: string;
  tab_type: TabType;
  content: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Rating {
  id: string;
  build_id: string;
  user_id: string | null;
  ip_address: string | null;
  score: number;
  created_at: string;
}

export interface Guide {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  category: 'Beginner' | 'Class Guides' | 'Endgame' | 'Patch Notes';
  thumbnail_url: string | null;
  author_id: string | null;
  read_time: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  profiles?: Profile | null;
}

export interface TierList {
  id: string;
  category: 'Overall Endgame' | 'Leveling' | 'Bossing' | 'Speed Farming';
  data: {
    S: TierEntry[];
    A: TierEntry[];
    B: TierEntry[];
    C: TierEntry[];
    D: TierEntry[];
  };
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface TierEntry {
  id: string;
  class: HeroClass;
  name: string;
  label?: string;
}

export interface Boss {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  location: string | null;
  difficulty: 'Normal' | 'Nightmare' | 'Hell' | 'Inferno' | null;
  lore: string | null;
  attack_patterns: AttackPattern[];
  loot_table: LootEntry[];
  created_at: string;
  updated_at: string;
}

export interface AttackPattern {
  name: string;
  description: string;
  damage_type?: string;
}

export interface LootEntry {
  name: string;
  drop_rate: number;
  rarity?: string;
}

export interface Creator {
  id: string;
  user_id: string;
  bio: string | null;
  class_specialty: HeroClass | null;
  youtube_url: string | null;
  twitch_url: string | null;
  discord_url: string | null;
  twitter_url: string | null;
  is_verified: boolean;
  followers_count: number;
  created_at: string;
  updated_at: string;
  // Joined data
  profiles?: Profile | null;
  build_count?: number;
}

export interface MapMarker {
  id: string;
  name: string;
  description: string | null;
  category: 'Zones' | 'Bosses' | 'Events' | 'Secrets';
  lat: number;
  lng: number;
  loot_info: LootEntry[];
  created_at: string;
  updated_at: string;
}

// Gear slot types
export const GEAR_SLOTS = [
  'Helmet',
  'Chest',
  'Weapon',
  'Off-hand',
  'Ring1',
  'Ring2',
  'Amulet',
  'Belt',
  'Pants',
  'Boots',
] as const;

export type GearSlot = (typeof GEAR_SLOTS)[number];

export interface GearItem {
  slot: GearSlot;
  name: string;
  icon?: string;
  stats: { name: string; value: string }[];
}

// Attribute types
export const ATTRIBUTES = [
  'Strength',
  'Dexterity',
  'Intelligence',
  'Vitality',
  'Critical Chance',
  'Critical Damage',
  'Attack Speed',
  'Movement Speed',
  'Life Steal',
  'Damage Reduction',
] as const;

export type Attribute = (typeof ATTRIBUTES)[number];

export interface AttributeValue {
  name: Attribute;
  base: number;
  bonus: number;
}

// Skill tree node
export interface SkillNode {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  points: number;
  maxPoints: number;
  position: { x: number; y: number };
  connections: string[];
  isActive: boolean;
}

// Sort options
export type BuildSortOption = 'newest' | 'oldest' | 'most_viewed' | 'highest_rated';

// Filter options
export interface BuildFilters {
  class?: HeroClass | 'all';
  search?: string;
  sort?: BuildSortOption;
}
