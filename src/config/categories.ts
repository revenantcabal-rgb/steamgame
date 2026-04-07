import type { CategoryDefinition } from '../types/hero';

export const CATEGORIES: Record<string, CategoryDefinition> = {
  skirmisher: {
    id: 'skirmisher', name: 'Skirmisher',
    description: 'Fast-moving fighters who excel at hit-and-run tactics.',
    decreeDescription: '+5 Turn Speed, +5% Evasion per Skirmisher in squad',
    skirmishDescription: '-15% gathering time, +10% yield, no worker deaths',
  },
  control: {
    id: 'control', name: 'Control',
    description: 'Specialists who disable and weaken enemies.',
    decreeDescription: '-5 enemy Turn Speed, +5% Accuracy per Control hero',
    skirmishDescription: '-10% worker death risk, +5% rare resource chance',
  },
  support: {
    id: 'support', name: 'Support',
    description: 'Healers and protectors who keep the team alive.',
    decreeDescription: '+3 HP Regen, +50 Max HP per Support hero',
    skirmishDescription: '+20% worker XP, can revive 1 dead worker per skirmish',
  },
  assault: {
    id: 'assault', name: 'Assault',
    description: 'Pure damage dealers who end fights quickly.',
    decreeDescription: '+8% Damage, +5% Crit Damage per Assault hero',
    skirmishDescription: '+20% yield, clears elite mobs for bonus nodes (24h)',
  },
  artisan: {
    id: 'artisan', name: 'Artisan',
    description: 'Production and gathering specialists.',
    decreeDescription: '+3% rare loot, +10% resource drops per Artisan in squad',
    skirmishDescription: '+40-60% yield, -25% time, +50-100% worker XP',
  },
};

export const CATEGORY_LIST = Object.values(CATEGORIES);
