export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  /** How to check if unlocked */
  condition: {
    type: 'hero_count' | 'hero_level' | 'resource_total' | 'gear_crafted' | 'expedition_complete' | 'boss_kills' | 'market_trades' | 'skill_level';
    target: number;
    skillId?: string;
    expeditionId?: string;
    difficulty?: string;
  };
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // Getting Started
  { id: 'first_hero', name: 'Fresh Recruit', description: 'Recruit your first hero.', icon: '🎖️', condition: { type: 'hero_count', target: 1 } },
  { id: 'five_heroes', name: 'Squad Leader', description: 'Recruit 5 heroes.', icon: '👥', condition: { type: 'hero_count', target: 5 } },
  { id: 'ten_heroes', name: 'Commander', description: 'Recruit 10 heroes.', icon: '⭐', condition: { type: 'hero_count', target: 10 } },

  // Hero Progression
  { id: 'hero_lv10', name: 'Battle-Tested', description: 'Reach hero level 10.', icon: '⚔️', condition: { type: 'hero_level', target: 10 } },
  { id: 'hero_lv25', name: 'Veteran', description: 'Reach hero level 25.', icon: '🛡️', condition: { type: 'hero_level', target: 25 } },
  { id: 'hero_lv50', name: 'Warlord', description: 'Reach hero level 50.', icon: '👑', condition: { type: 'hero_level', target: 50 } },
  { id: 'hero_lv100', name: 'Wasteland Legend', description: 'Reach hero level 100.', icon: '🏆', condition: { type: 'hero_level', target: 100 } },

  // Crafting
  { id: 'first_craft', name: 'Apprentice Smith', description: 'Craft your first piece of gear.', icon: '🔨', condition: { type: 'gear_crafted', target: 1 } },
  { id: 'craft_10', name: 'Journeyman', description: 'Craft 10 pieces of gear.', icon: '⚒️', condition: { type: 'gear_crafted', target: 10 } },
  { id: 'craft_50', name: 'Master Forger', description: 'Craft 50 pieces of gear.', icon: '🏭', condition: { type: 'gear_crafted', target: 50 } },

  // Expeditions
  { id: 'first_expedition', name: 'Dungeon Crawler', description: 'Complete your first expedition.', icon: '🗺️', condition: { type: 'expedition_complete', target: 1 } },
  { id: 'expedition_hard', name: 'Hardened Explorer', description: 'Complete an expedition on Hard difficulty.', icon: '💀', condition: { type: 'expedition_complete', target: 1, difficulty: 'hard' } },
  { id: 'expedition_extreme', name: 'Extinction Event', description: 'Complete an expedition on Extreme difficulty.', icon: '☠️', condition: { type: 'expedition_complete', target: 1, difficulty: 'extreme' } },

  // Combat
  { id: 'boss_10', name: 'Boss Hunter', description: 'Defeat 10 bosses.', icon: '🐉', condition: { type: 'boss_kills', target: 10 } },
  { id: 'boss_100', name: 'Boss Slayer', description: 'Defeat 100 bosses.', icon: '💥', condition: { type: 'boss_kills', target: 100 } },

  // Skills
  { id: 'skill_lv25', name: 'Skilled Worker', description: 'Reach level 25 in any gathering skill.', icon: '📈', condition: { type: 'skill_level', target: 25 } },
  { id: 'skill_lv50', name: 'Expert Gatherer', description: 'Reach level 50 in any gathering skill.', icon: '🎯', condition: { type: 'skill_level', target: 50 } },

  // Market
  { id: 'first_trade', name: 'Trader', description: 'Complete your first market transaction.', icon: '💰', condition: { type: 'market_trades', target: 1 } },
  { id: 'trades_100', name: 'Merchant Prince', description: 'Complete 100 market transactions.', icon: '🏛️', condition: { type: 'market_trades', target: 100 } },
];

export const ACHIEVEMENT_MAP = Object.fromEntries(ACHIEVEMENTS.map(a => [a.id, a]));
