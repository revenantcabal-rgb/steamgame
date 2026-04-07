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
        hint: 'Open a Weaponsmithing or Armorcrafting skill and craft any starter weapon or armor piece.',
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
        hint: 'Select Prospecting in the sidebar, pick a mining activity, and click Start. Worker XP does not count — you must train it manually.',
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

  // ──────────────────────────────────────────────
  // CHAPTER 6: Beyond the Horizon → Unlocks Expedition
  // ──────────────────────────────────────────────
  {
    id: 'story_6',
    number: 6,
    title: 'Beyond the Horizon',
    description: 'Prepare for expeditions beyond the wasteland. Prove you can handle extended operations.',
    parts: [
      {
        id: 's6_p0',
        title: 'Veteran Fighter',
        description: 'Raise a hero to level 15.',
        flavor: 'A seasoned warrior is worth ten recruits. Push your best hero to the limit.',
        objective: { type: 'reach_hero_level', target: 'any', count: 15, description: 'Reach hero level 15' },
        rewards: [{ type: 'wc', quantity: 200 }],
        hint: 'Deploy your hero to combat zones to gain XP and level up.',
      },
      {
        id: 's6_p1',
        title: 'Body Count',
        description: 'Eliminate 50 enemies.',
        flavor: 'The wasteland respects only strength. Make your mark.',
        objective: { type: 'kill_enemies', target: 'any', count: 50, description: 'Kill 50 enemies' },
        rewards: [{ type: 'wc', quantity: 200 }],
        hint: 'Keep your heroes deployed in combat zones.',
      },
      {
        id: 's6_p2',
        title: 'Upgraded Arsenal',
        description: 'Craft a Tier 2 weapon.',
        flavor: 'Scrap weapons won\'t cut it anymore. Time to forge something real.',
        objective: { type: 'craft', target: 'weapon_t2', count: 1, description: 'Craft a T2 weapon' },
        rewards: [{ type: 'wc', quantity: 300 }],
        hint: 'Level up Weaponsmithing to 15 and craft a T2 weapon using T1 weapon + materials.',
      },
      {
        id: 's6_p3',
        title: 'Master Gatherer',
        description: 'Reach level 15 in any gathering skill.',
        flavor: 'Efficiency comes with experience. Your workers follow your lead.',
        objective: { type: 'reach_skill_level', target: 'any_gathering', count: 15, description: 'Reach any gathering skill level 15' },
        rewards: [{ type: 'wc', quantity: 200 }],
        hint: 'Keep gathering resources to level up your skills.',
      },
      {
        id: 's6_p4',
        title: 'Boss Slayer',
        description: 'Defeat 3 unique bosses.',
        flavor: 'Each boss is a test of strategy and power. Conquer them all.',
        objective: { type: 'kill_boss', target: 'unique_3', count: 3, description: 'Defeat 3 unique bosses' },
        rewards: [{ type: 'wc', quantity: 500 }],
        hint: 'Deploy heroes to different combat zones and defeat bosses (every 50 fights).',
      },
      {
        id: 's6_p5',
        title: 'Fully Equipped',
        description: 'Equip 6 gear slots on a single hero.',
        flavor: 'A well-equipped hero is ready for anything the wasteland throws at them.',
        objective: { type: 'equip', target: 'slots', count: 6, description: 'Equip 6 gear slots on a hero' },
        rewards: [{ type: 'wc', quantity: 300 }],
        hint: 'Craft armor, boots, gloves, and accessories. Equip them on your hero.',
      },
      {
        id: 's6_p6',
        title: 'War Chest',
        description: 'Earn 2000 Wasteland Credits total.',
        flavor: 'Resources win wars. Build your war chest for the expedition ahead.',
        objective: { type: 'earn_currency', target: 'wc', count: 2000, description: 'Earn 2000 WC total' },
        rewards: [{ type: 'wc', quantity: 500 }],
        hint: 'Complete story objectives, sell items at the marketplace, and keep earning.',
      },
    ],
    completionReward: [{ type: 'wc', quantity: 500 }],
    unlocks: 'expedition',
  },

  // ──────────────────────────────────────────────
  // CHAPTER 7: The Icqor Convergence → Unlocks Starlight
  // ──────────────────────────────────────────────
  {
    id: 'story_7',
    number: 7,
    title: 'The Icqor Convergence',
    description: 'Discover the mysterious Icqor Chess Pieces and unlock the Starlight constellation.',
    parts: [
      {
        id: 's7_p0',
        title: 'Deep Expertise',
        description: 'Reach level 30 in any gathering skill.',
        flavor: 'True mastery reveals secrets hidden to the untrained eye.',
        objective: { type: 'reach_skill_level', target: 'any_gathering', count: 30, description: 'Reach any gathering skill level 30' },
        rewards: [{ type: 'wc', quantity: 300 }],
        hint: 'Focus on leveling one gathering skill to 30.',
      },
      {
        id: 's7_p1',
        title: 'Advanced Forge',
        description: 'Craft a Tier 3 piece of equipment.',
        flavor: 'The forge demands mastery. Only the skilled can shape T3 materials.',
        objective: { type: 'craft', target: 'equipment_t3', count: 1, description: 'Craft T3 equipment' },
        rewards: [{ type: 'wc', quantity: 500 }],
        hint: 'Level your production skills and gather T3 materials to craft advanced gear.',
      },
      {
        id: 's7_p2',
        title: 'Titan Fall',
        description: 'Defeat a Tier 3+ boss.',
        flavor: 'The most dangerous creatures guard the rarest treasures.',
        objective: { type: 'kill_boss', target: 'boss_elite', count: 1, description: 'Defeat a T3+ boss' },
        rewards: [{ type: 'wc', quantity: 500 }],
        hint: 'Unlock T3 in a combat zone and defeat the boss with a strong party.',
      },
      {
        id: 's7_p3',
        title: 'Battle Hardened',
        description: 'Reach hero level 25.',
        flavor: 'Only the hardened survive what lies beyond.',
        objective: { type: 'reach_hero_level', target: 'any', count: 25, description: 'Reach hero level 25' },
        rewards: [{ type: 'wc', quantity: 300 }],
        hint: 'Keep your best hero fighting in high-tier combat zones.',
      },
      {
        id: 's7_p4',
        title: 'The First Piece',
        description: 'Obtain an Icqor Chess Piece.',
        flavor: 'A crystalline artifact pulses with starlight energy. This changes everything.',
        objective: { type: 'gather', target: 'icqor_chess_piece', count: 1, description: 'Obtain 1 Icqor Chess Piece' },
        rewards: [{ type: 'wc', quantity: 1000 }],
        hint: 'Icqor Chess Pieces drop from bosses and very rarely from gathering, production, and combat.',
      },
      {
        id: 's7_p5',
        title: 'Industrial Power',
        description: 'Reach level 15 in any production skill.',
        flavor: 'The wasteland rewards those who can build, not just destroy.',
        objective: { type: 'reach_skill_level', target: 'any_production', count: 15, description: 'Reach any production skill level 15' },
        rewards: [{ type: 'wc', quantity: 300 }],
        hint: 'Keep crafting to level up your production skills.',
      },
      {
        id: 's7_p6',
        title: 'Full Deployment',
        description: 'Deploy 3 heroes to combat simultaneously.',
        flavor: 'A true commander leads multiple fronts at once.',
        objective: { type: 'deploy_heroes', target: 'any', count: 3, description: 'Deploy 3 heroes at once' },
        rewards: [{ type: 'wc', quantity: 500 }],
        hint: 'Recruit more heroes and deploy them to different combat zones.',
      },
    ],
    completionReward: [{ type: 'wc', quantity: 1000 }, { type: 'resource', itemId: 'icqor_chess_piece', quantity: 3 }],
    unlocks: 'starlight',
  },
];
