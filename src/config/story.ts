// ──────────────────────────────────────────────
// Story Config — 5 Chapters, 7 Parts Each (35 tasks)
// ──────────────────────────────────────────────

export type ObjectiveType =
  | 'gather'
  | 'craft'
  | 'equip'
  | 'combat_zone'
  | 'kill_enemies'
  | 'kill_boss'
  | 'reach_skill_level'
  | 'reach_hero_level'
  | 'earn_currency'
  | 'market_action'
  | 'recruit_hero'
  | 'deploy_heroes'
  | 'complete_expedition'
  | 'equip_ability'
  | 'cook';

export interface StoryObjective {
  type: ObjectiveType;
  target: string;
  count: number;
  description: string;
}

export interface StoryPart {
  id: string;
  title: string;
  description: string;
  flavor: string;
  objective: StoryObjective;
  rewards: { type: 'wc' | 'resource' | 'gear'; itemId?: string; quantity: number }[];
  hint: string;
}

export interface StoryChapter {
  id: string;
  number: number;
  title: string;
  description: string;
  parts: StoryPart[];
  completionReward: { type: 'wc' | 'resource' | 'gear'; itemId?: string; quantity: number }[];
  unlocks: string;
}

export const STORY_CHAPTERS: StoryChapter[] = [
  // ──────────────────────────────────────────────
  // CHAPTER 1: Survival Basics → Unlocks Marketplace
  // ──────────────────────────────────────────────
  {
    id: 'story_1',
    number: 1,
    title: 'Survival Basics',
    description: 'Learn the fundamentals of wasteland survival. Gather, craft, fight, and eat.',
    parts: [
      {
        id: 's1_p0',
        title: 'Scrap and Survive',
        description: 'Gather scrap metal from the wasteland.',
        flavor: 'The wasteland is littered with the remnants of the old world. Every rusted pipe, every bent panel — it all has value now.',
        objective: { type: 'gather', target: 'scrap_metal', count: 10, description: 'Gather 10 Scrap Metal' },
        rewards: [{ type: 'wc', quantity: 50 }],
        hint: 'Select the Scavenging skill in the sidebar and start gathering.',
      },
      {
        id: 's1_p1',
        title: 'Timber for Shelter',
        description: 'Gather salvaged wood for basic construction.',
        flavor: 'A lean-to won\'t build itself. Scavenge boards and beams from the ruins.',
        objective: { type: 'gather', target: 'salvaged_wood', count: 10, description: 'Gather 10 Salvaged Wood' },
        rewards: [{ type: 'wc', quantity: 50 }],
        hint: 'Use the Salvage Hunting skill to gather wood.',
      },
      {
        id: 's1_p2',
        title: 'Your First Weapon',
        description: 'Craft a weapon for your hero.',
        flavor: 'Bare hands won\'t cut it against mutants. Fashion something deadly from the scrap.',
        objective: { type: 'craft', target: 'starter_weapon', count: 1, description: 'Craft a weapon for your hero' },
        rewards: [{ type: 'wc', quantity: 100 }],
        hint: 'Open the Weaponsmithing production skill and craft a weapon matching your hero\'s combat style.',
      },
      {
        id: 's1_p3',
        title: 'Gear Up',
        description: 'Equip any weapon on your hero.',
        flavor: 'A weapon is useless hanging on the wall. Put it to use.',
        objective: { type: 'equip', target: 'any_weapon', count: 1, description: 'Equip any weapon on your hero' },
        rewards: [{ type: 'wc', quantity: 50 }, { type: 'resource', itemId: 'rusted_pipes', quantity: 5 }],
        hint: 'Go to Heroes tab, select your hero, and equip the weapon in the main hand slot.',
      },
      {
        id: 's1_p4',
        title: 'Into the Wastes',
        description: 'Enter The Outskirts combat zone.',
        flavor: 'Time to see what lurks beyond the perimeter. Steel yourself.',
        objective: { type: 'combat_zone', target: 'outskirts', count: 1, description: 'Enter The Outskirts combat zone' },
        rewards: [{ type: 'wc', quantity: 100 }],
        hint: 'Click on The Outskirts in the sidebar under Combat Zones and deploy your hero.',
      },
      {
        id: 's1_p5',
        title: 'First Blood',
        description: 'Kill 10 enemies in any combat zone.',
        flavor: 'The wastes are crawling with vermin. Time to thin the herd.',
        objective: { type: 'kill_enemies', target: 'any', count: 10, description: 'Kill 10 enemies' },
        rewards: [{ type: 'wc', quantity: 150 }, { type: 'resource', itemId: 'mutant_roots', quantity: 10 }],
        hint: 'Deploy heroes to any combat zone and let them fight.',
      },
      {
        id: 's1_p6',
        title: 'A Warm Meal',
        description: 'Cook a Wasteland Stew.',
        flavor: 'Nothing lifts morale like hot food. Even in the apocalypse.',
        objective: { type: 'cook', target: 'wasteland_stew', count: 1, description: 'Cook a Wasteland Stew' },
        rewards: [{ type: 'wc', quantity: 200 }],
        hint: 'Open the Cooking production skill and craft a Wasteland Stew.',
      },
    ],
    completionReward: [{ type: 'wc', quantity: 100 }],
    unlocks: 'marketplace',
  },

  // ──────────────────────────────────────────────
  // CHAPTER 2: Scavenger's Path → Unlocks Accessories
  // ──────────────────────────────────────────────
  {
    id: 'story_2',
    number: 2,
    title: "Scavenger's Path",
    description: 'Hone your skills, armor up, and take on your first real challenge.',
    parts: [
      {
        id: 's2_p0',
        title: 'Seasoned Scrapper',
        description: 'Reach Scavenging level 5.',
        flavor: 'Experience teaches you where to look and what to keep. The scraps yield more in trained hands.',
        objective: { type: 'reach_skill_level', target: 'scavenging', count: 5, description: 'Reach Scavenging level 5' },
        rewards: [{ type: 'wc', quantity: 100 }],
        hint: 'Keep training Scavenging until you hit level 5.',
      },
      {
        id: 's2_p1',
        title: 'Armor Up',
        description: 'Craft a Patched Vest at the armorcrafting station.',
        flavor: 'A few layers of stitched leather won\'t stop a bullet, but they\'ll slow a claw.',
        objective: { type: 'craft', target: 'patched_vest', count: 1, description: 'Craft a Patched Vest' },
        rewards: [{ type: 'wc', quantity: 150 }],
        hint: 'Open the Armorcrafting production skill and craft a Patched Vest.',
      },
      {
        id: 's2_p2',
        title: 'Full Protection',
        description: 'Equip gear in 3 different slots.',
        flavor: 'Head to toe, every gap is a weakness. Cover them.',
        objective: { type: 'equip', target: 'slots', count: 3, description: 'Equip gear in 3 different slots' },
        rewards: [{ type: 'wc', quantity: 100 }],
        hint: 'Equip a weapon, armor, and one more piece of gear on your hero.',
      },
      {
        id: 's2_p3',
        title: 'Ore Hunter',
        description: 'Reach Prospecting level 3.',
        flavor: 'The earth still hides treasures. You just need to know where to dig.',
        objective: { type: 'reach_skill_level', target: 'prospecting', count: 3, description: 'Reach Prospecting level 3' },
        rewards: [{ type: 'wc', quantity: 100 }, { type: 'resource', itemId: 'iron_ore', quantity: 10 }],
        hint: 'Train the Prospecting gathering skill.',
      },
      {
        id: 's2_p4',
        title: 'Field Medicine',
        description: 'Craft 3 consumables.',
        flavor: 'Bandages, stews, tonics — a well-stocked pack keeps you alive.',
        objective: { type: 'craft', target: 'consumable', count: 3, description: 'Craft 3 consumables' },
        rewards: [{ type: 'wc', quantity: 200 }],
        hint: 'Use Cooking or Toolmaking to craft consumable items.',
      },
      {
        id: 's2_p5',
        title: 'Battle Hardened',
        description: 'Kill 50 enemies total.',
        flavor: 'Every kill sharpens your reflexes. The wasteland makes warriors of survivors.',
        objective: { type: 'kill_enemies', target: 'any', count: 50, description: 'Kill 50 enemies total' },
        rewards: [{ type: 'wc', quantity: 200 }],
        hint: 'Keep your heroes deployed to combat zones.',
      },
      {
        id: 's2_p6',
        title: 'Pest Control',
        description: 'Defeat the Giant Roach boss.',
        flavor: 'Something terrible skitters in the depths of the Outskirts. End it.',
        objective: { type: 'kill_boss', target: 'giant_roach', count: 1, description: 'Kill the Giant Roach boss' },
        rewards: [{ type: 'wc', quantity: 300 }],
        hint: 'Deploy to the Full Sweep target in The Outskirts and survive until the boss appears.',
      },
    ],
    completionReward: [{ type: 'wc', quantity: 200 }],
    unlocks: 'accessories',
  },

  // ──────────────────────────────────────────────
  // CHAPTER 3: The Wasteland Calls → Unlocks Hero Recruitment
  // ──────────────────────────────────────────────
  {
    id: 'story_3',
    number: 3,
    title: 'The Wasteland Calls',
    description: 'Push deeper into the wasteland. Grow stronger, craft better gear, and prove your worth.',
    parts: [
      {
        id: 's3_p0',
        title: 'Veteran',
        description: 'Reach hero level 10.',
        flavor: 'A hardened fighter earns respect. Your hero is no longer a rookie.',
        objective: { type: 'reach_hero_level', target: 'any', count: 10, description: 'Reach hero level 10' },
        rewards: [{ type: 'wc', quantity: 200 }],
        hint: 'Keep fighting enemies to gain hero XP.',
      },
      {
        id: 's3_p1',
        title: 'Well Equipped',
        description: 'Equip gear in 5+ different slots.',
        flavor: 'A true warrior leaves nothing to chance. Every slot filled is an edge.',
        objective: { type: 'equip', target: 'slots', count: 5, description: 'Equip gear in 5+ slots' },
        rewards: [{ type: 'wc', quantity: 200 }],
        hint: 'Craft and equip armor, weapons, gloves, boots, and more.',
      },
      {
        id: 's3_p2',
        title: 'Sweep the Outskirts',
        description: 'Complete a Full Sweep in The Outskirts (defeat the boss).',
        flavor: 'Clear out every last creature from the perimeter. Leave nothing standing.',
        objective: { type: 'kill_boss', target: 'giant_roach', count: 1, description: 'Complete a Full Sweep in The Outskirts' },
        rewards: [{ type: 'wc', quantity: 250 }],
        hint: 'Deploy to Full Sweep in The Outskirts and defeat the boss.',
      },
      {
        id: 's3_p3',
        title: 'Better Weapons',
        description: 'Craft a T2 weapon.',
        flavor: 'Scrap pipes were fine for rats. You need real steel for what comes next.',
        objective: { type: 'craft', target: 'weapon_t2', count: 1, description: 'Craft a Tier 2 weapon' },
        rewards: [{ type: 'wc', quantity: 300 }],
        hint: 'Level Weaponsmithing to 15 and craft a Spiked Club, Raider\'s Cleaver, or Hunting Crossbow.',
      },
      {
        id: 's3_p4',
        title: 'Dedicated Worker',
        description: 'Reach any gathering skill to level 10.',
        flavor: 'Mastery takes patience. The wasteland rewards the diligent.',
        objective: { type: 'reach_skill_level', target: 'any_gathering', count: 10, description: 'Reach any gathering skill level 10' },
        rewards: [{ type: 'wc', quantity: 250 }],
        hint: 'Focus on a gathering skill (Scavenging, Prospecting, etc.) until it reaches level 10.',
      },
      {
        id: 's3_p5',
        title: 'Wasteland Economy',
        description: 'Accumulate 500 Wasteland Credits.',
        flavor: 'Credits are the lifeblood of trade. Save enough and doors open.',
        objective: { type: 'earn_currency', target: 'wc', count: 500, description: 'Accumulate 500 total WC' },
        rewards: [{ type: 'wc', quantity: 200 }],
        hint: 'Earn WC from story rewards, combat drops, and selling on the market.',
      },
      {
        id: 's3_p6',
        title: 'Proving Your Worth',
        description: 'Defeat a boss on Hard (T2) difficulty.',
        flavor: 'The bosses grow fiercer in the harder tiers. Prove you can handle the pressure.',
        objective: { type: 'kill_boss', target: 'boss_hard', count: 1, description: 'Defeat a boss on Hard (T2)' },
        rewards: [{ type: 'wc', quantity: 500 }],
        hint: 'Unlock Hard tier in a combat zone by killing 5 bosses on Normal, then defeat a boss on Hard.',
      },
    ],
    completionReward: [{ type: 'wc', quantity: 300 }],
    unlocks: 'hero_recruitment',
  },

  // ──────────────────────────────────────────────
  // CHAPTER 4: Strength in Numbers → Unlocks Guild
  // ──────────────────────────────────────────────
  {
    id: 'story_4',
    number: 4,
    title: 'Strength in Numbers',
    description: 'Build a team, tackle expeditions, and become a force in the wasteland.',
    parts: [
      {
        id: 's4_p0',
        title: 'New Ally',
        description: 'Recruit a second hero.',
        flavor: 'One survivor is vulnerable. Two is a team.',
        objective: { type: 'recruit_hero', target: 'any', count: 2, description: 'Recruit a second hero' },
        rewards: [{ type: 'wc', quantity: 300 }],
        hint: 'Go to the Heroes tab and recruit a new hero from the Recruitment Post.',
      },
      {
        id: 's4_p1',
        title: 'Deployed Force',
        description: 'Deploy 2+ heroes to combat simultaneously.',
        flavor: 'Strength in numbers. Deploy your team to overwhelm the enemy.',
        objective: { type: 'deploy_heroes', target: 'any', count: 2, description: 'Deploy 2+ heroes simultaneously' },
        rewards: [{ type: 'wc', quantity: 200 }],
        hint: 'Select multiple heroes when deploying to a combat zone.',
      },
      {
        id: 's4_p2',
        title: 'Dungeon Delver',
        description: 'Complete any Expedition on Normal difficulty.',
        flavor: 'The old tunnels hold treasures and terrors in equal measure.',
        objective: { type: 'complete_expedition', target: 'normal', count: 1, description: 'Complete an Expedition on Normal' },
        rewards: [{ type: 'wc', quantity: 400 }],
        hint: 'Go to the Expedition tab, assemble a party, and clear a dungeon on Normal.',
      },
      {
        id: 's4_p3',
        title: 'Reinforced Armor',
        description: 'Craft T2 armor.',
        flavor: 'Scrap plate and leather duster — real protection for real threats.',
        objective: { type: 'craft', target: 'armor_t2', count: 1, description: 'Craft Tier 2 armor' },
        rewards: [{ type: 'wc', quantity: 300 }],
        hint: 'Level Armorcrafting to 15 and craft Scrap Plate Chest, Leather Duster, or Padded Lab Coat.',
      },
      {
        id: 's4_p4',
        title: 'Skilled Hands',
        description: 'Reach any production skill to level 15.',
        flavor: 'A master craftsman can forge wonders from waste.',
        objective: { type: 'reach_skill_level', target: 'any_production', count: 15, description: 'Reach any production skill level 15' },
        rewards: [{ type: 'wc', quantity: 350 }],
        hint: 'Keep crafting in any production skill (Weaponsmithing, Armorcrafting, etc.).',
      },
      {
        id: 's4_p5',
        title: 'Awakened Power',
        description: 'Equip an ability tome on a hero.',
        flavor: 'Ancient knowledge, bound in salvaged pages. Power awaits those who read.',
        objective: { type: 'equip_ability', target: 'any', count: 1, description: 'Equip an ability tome' },
        rewards: [{ type: 'wc', quantity: 300 }],
        hint: 'Go to the Heroes tab, select a hero, and equip an ability from your collection.',
      },
      {
        id: 's4_p6',
        title: 'Multi-Boss',
        description: 'Defeat 3 different boss types.',
        flavor: 'Each boss is a test. Conquer three to prove your versatility.',
        objective: { type: 'kill_boss', target: 'unique_3', count: 3, description: 'Defeat 3 different boss types' },
        rewards: [{ type: 'wc', quantity: 500 }],
        hint: 'Fight bosses in different combat zones (Outskirts, Suburbs, etc.).',
      },
    ],
    completionReward: [{ type: 'wc', quantity: 500 }],
    unlocks: 'guild',
  },

  // ──────────────────────────────────────────────
  // CHAPTER 5: Proving Grounds → Unlocks PVP
  // ──────────────────────────────────────────────
  {
    id: 'story_5',
    number: 5,
    title: 'Proving Grounds',
    description: 'Reach the pinnacle of wasteland power. Only the elite survive what comes next.',
    parts: [
      {
        id: 's5_p0',
        title: 'Seasoned Warrior',
        description: 'Reach hero level 25 on any hero.',
        flavor: 'A warrior forged in a hundred battles. Your name carries weight.',
        objective: { type: 'reach_hero_level', target: 'any', count: 25, description: 'Reach hero level 25' },
        rewards: [{ type: 'wc', quantity: 400 }],
        hint: 'Keep fighting to level up your heroes. Focus on one to reach 25 faster.',
      },
      {
        id: 's5_p1',
        title: 'Hard Mode',
        description: 'Complete an Expedition on Hard difficulty.',
        flavor: 'Normal was the tutorial. This is the real thing.',
        objective: { type: 'complete_expedition', target: 'hard', count: 1, description: 'Complete an Expedition on Hard' },
        rewards: [{ type: 'wc', quantity: 500 }],
        hint: 'Assemble a strong party and tackle an expedition on Hard difficulty.',
      },
      {
        id: 's5_p2',
        title: 'Growing Army',
        description: 'Have 3+ heroes in your roster.',
        flavor: 'An army grows. Three fighters form the core of a warband.',
        objective: { type: 'recruit_hero', target: 'any', count: 3, description: 'Have 3+ heroes' },
        rewards: [{ type: 'wc', quantity: 300 }],
        hint: 'Recruit more heroes from the Heroes tab.',
      },
      {
        id: 's5_p3',
        title: 'Master Crafter',
        description: 'Craft T3 equipment.',
        flavor: 'Only master crafters can forge weapons and armor of this caliber.',
        objective: { type: 'craft', target: 'equipment_t3', count: 1, description: 'Craft Tier 3 equipment' },
        rewards: [{ type: 'wc', quantity: 500 }],
        hint: 'Level production skills to 30 and craft T3 weapons or armor.',
      },
      {
        id: 's5_p4',
        title: 'Tome Collector',
        description: 'Equip 3+ ability tomes across all heroes.',
        flavor: 'Knowledge is power. Collect and equip the ancient wisdom.',
        objective: { type: 'equip_ability', target: 'any', count: 3, description: 'Equip 3+ ability tomes' },
        rewards: [{ type: 'wc', quantity: 400 }],
        hint: 'Equip ability tomes on your heroes from the hero detail view.',
      },
      {
        id: 's5_p5',
        title: 'Wasteland Fortune',
        description: 'Accumulate 5000 total WC earned.',
        flavor: 'Credits flow through the wasteland. You\'ve become a wealthy survivor.',
        objective: { type: 'earn_currency', target: 'wc', count: 5000, description: 'Accumulate 5000 total WC' },
        rewards: [{ type: 'wc', quantity: 500 }],
        hint: 'Earn WC from all sources: story, combat, market, etc.',
      },
      {
        id: 's5_p6',
        title: 'Elite Victor',
        description: 'Defeat a boss on Elite (T3) difficulty.',
        flavor: 'The elite tier separates the strong from the legends. Are you ready?',
        objective: { type: 'kill_boss', target: 'boss_elite', count: 1, description: 'Defeat a boss on Elite (T3)' },
        rewards: [{ type: 'wc', quantity: 1000 }],
        hint: 'Unlock Elite (T3) tier in a combat zone and defeat the boss.',
      },
    ],
    completionReward: [{ type: 'wc', quantity: 1000 }],
    unlocks: 'pvp',
  },
];
