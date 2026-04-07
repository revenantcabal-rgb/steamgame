import type { GearTemplate, Facet, StatBonus, EnchantGroup } from '../types/equipment';

// ============================
// GEAR TEMPLATES (representative set per tier)
// ============================

// Helper to build gear templates concisely
function w(id: string, name: string, tier: number, lvl: number, wtype: 'melee'|'ranged'|'demolitions', twoH: boolean, reqs: [string,number][], stats: [string,number,boolean][], downside: [string,number,boolean]|null, inputs: [string,number][], skill: string, skillLvl: number, xp: number, prevTier?: string, setId?: string): GearTemplate {
  return { id, name, slot: 'weapon', tier, levelReq: lvl, weaponType: wtype, isTwoHanded: twoH, statRequirements: reqs.map(([s,v])=>({stat:s as any,value:v})), baseStats: stats.map(([s,v,p])=>({stat:s,value:v,isPercentage:p})), inherentDownside: downside ? {stat:downside[0],value:downside[1],isPercentage:downside[2]} : undefined, craftingInputs: inputs.map(([r,q])=>({resourceId:r,quantity:q})), craftSkillId: skill, craftSkillLevel: skillLvl, craftXp: xp, requiresPreviousTier: prevTier, setId };
}
function a(id: string, name: string, tier: number, lvl: number, slotCat: string, reqs: [string,number][], stats: [string,number,boolean][], downside: [string,number,boolean]|null, inputs: [string,number][], skill: string, skillLvl: number, xp: number, prevTier?: string, setId?: string): GearTemplate {
  return { id, name, slot: slotCat as any, tier, levelReq: lvl, statRequirements: reqs.map(([s,v])=>({stat:s as any,value:v})), baseStats: stats.map(([s,v,p])=>({stat:s,value:v,isPercentage:p})), inherentDownside: downside ? {stat:downside[0],value:downside[1],isPercentage:downside[2]} : undefined, craftingInputs: inputs.map(([r,q])=>({resourceId:r,quantity:q})), craftSkillId: skill, craftSkillLevel: skillLvl, craftXp: xp, requiresPreviousTier: prevTier, setId };
}

const WS = 'weaponsmithing', AC = 'armorcrafting', TK = 'tinkering';
const SM = 'scrap_metal', SW = 'salvaged_wood', RP = 'rusted_pipes', IO = 'iron_ore', CO = 'copper_ore', RS = 'raw_stone';
const MP = 'mechanical_parts', EC = 'electronic_components', CF = 'chemical_fluids';
const MR = 'mutant_roots', WH = 'wild_herbs', WB = 'wasteland_berries';

export const GEAR_TEMPLATES: Record<string, GearTemplate> = {
  // =====================================================================
  // T1 WEAPONS (Level 1)
  // =====================================================================
  // T1 WEAPONS (Level 1) - no stat requirements
  sharpened_pipe: w('sharpened_pipe','Sharpened Pipe',1,1,'melee',false,[],[['meleeAttack',8,false]],null,[[RP,3],[SM,2]],WS,1,25),
  rusty_machete: w('rusty_machete','Rusty Machete',1,1,'melee',false,[],[['meleeAttack',10,false],['critChance',2,true]],null,[[SM,4],[IO,2]],WS,1,30),
  scrap_bow: w('scrap_bow','Scrap Bow',1,1,'ranged',true,[],[['rangedAttack',9,false],['accuracy',2,true]],null,[[SW,3],[SM,2]],WS,1,25),
  slingshot: w('slingshot','Slingshot',1,1,'ranged',false,[],[['rangedAttack',6,false],['turnSpeed',3,false]],null,[[SW,2],[RP,2]],WS,1,20),
  pipe_bomb: w('pipe_bomb','Pipe Bomb',1,1,'demolitions',false,[],[['blastAttack',10,false]],['selfDamage',3,true],[[RP,3],[CF,2]],WS,1,25),
  molotov: w('molotov','Molotov Cocktail',1,1,'demolitions',false,[],[['blastAttack',7,false]],null,[[CF,2],[SW,1]],WS,1,20),
  // T1 ARMOR/GEAR (Level 1)
  patched_vest: a('patched_vest','Patched Vest',1,1,'armor',[],[['defense',5,false],['maxHp',10,false]],null,[[SM,5],[SW,2]],AC,1,25),
  cloth_wrappings: a('cloth_wrappings','Cloth Wrappings',1,1,'armor',[],[['defense',3,false],['turnSpeed',3,false]],null,[[MR,4],[WH,3]],AC,1,20),
  scrap_greaves: a('scrap_greaves','Scrap Greaves',1,1,'legs',[],[['defense',3,false],['maxHp',8,false]],null,[[SM,4],[IO,2]],AC,1,20),
  worn_gloves: a('worn_gloves','Worn Gloves',1,1,'gloves',[],[['accuracy',2,true],['defense',2,false]],null,[[MR,3],[SM,2]],AC,1,18),
  wasteland_boots: a('wasteland_boots','Wasteland Boots',1,1,'boots',[],[['turnSpeed',3,false],['defense',2,false]],null,[[MR,3],[IO,2]],AC,1,18),
  scrap_buckler: a('scrap_buckler','Scrap Buckler',1,1,'shield',[],[['defense',4,false],['blockChance',5,true]],null,[[SM,5],[SW,3]],AC,1,22),
  rusty_ring: a('rusty_ring','Rusty Ring',1,1,'ring',[],[['maxHp',5,false]],null,[[IO,3],[CO,2]],TK,1,15),
  bone_earring: a('bone_earring','Bone Earring',1,1,'earring',[],[['statusResist',2,true]],null,[[MR,3],[CO,1]],TK,1,12),
  scrap_pendant: a('scrap_pendant','Scrap Pendant',1,1,'necklace',[],[['maxHp',8,false],['hpRegen',0.5,false]],null,[[CO,3],[IO,2]],TK,1,18),

  // =====================================================================
  // T2 WEAPONS (Level 15)
  // =====================================================================
  spiked_club: w('spiked_club','Spiked Club',2,15,'melee',false,[['str',10]],[['meleeAttack',22,false],['maxHp',15,false]],['turnSpeed',-8,false],[[SW,8],[IO,5],[SM,3]],WS,15,60,'sharpened_pipe'),
  raiders_cleaver: w('raiders_cleaver',"Raider's Cleaver",2,15,'melee',false,[['str',8],['dex',5]],[['meleeAttack',20,false],['critChance',3,true]],['maxHp',-5,true],[[IO,6],[SM,4],[CF,3]],WS,15,60,'rusty_machete'),
  pipe_pistol: w('pipe_pistol','Pipe Pistol',2,15,'ranged',false,[['dex',10]],[['rangedAttack',20,false],['turnSpeed',8,false]],['accuracy',-5,true],[[RP,6],[MP,4],[CF,3]],WS,15,60,'slingshot'),
  hunting_crossbow: w('hunting_crossbow','Hunting Crossbow',2,15,'ranged',true,[['dex',8],['per',5]],[['rangedAttack',18,false],['accuracy',5,true],['critChance',3,true]],['turnSpeed',-5,false],[[SW,5],[MP,4],[IO,3]],WS,15,60,'scrap_bow'),
  frag_grenade: w('frag_grenade','Frag Grenade',2,15,'demolitions',false,[['int',10]],[['blastAttack',22,false],['critDamage',5,true]],['selfDamage',4,true],[[SM,5],[CF,4],[IO,3]],WS,15,60,'pipe_bomb'),
  incendiary_mine: w('incendiary_mine','Incendiary Mine',2,15,'demolitions',false,[['int',8],['per',5]],[['blastAttack',20,false],['critChance',5,true]],['turnSpeed',-5,false],[[CF,6],[EC,4],[SM,3]],WS,15,60,'molotov'),
  // T2 ARMOR (Level 15)
  scrap_plate_chest: a('scrap_plate_chest','Scrap Plate Chest',2,15,'armor',[['str',10]],[['defense',18,false],['maxHp',30,false]],['turnSpeed',-10,false],[[IO,8],[SM,6],[RS,3]],AC,15,55,'patched_vest'),
  leather_duster: a('leather_duster','Leather Duster',2,15,'armor',[['dex',8]],[['defense',12,false],['turnSpeed',8,false],['evasion',3,true]],['maxHp',-5,true],[[MR,6],[SM,5],[CF,3]],AC,15,55,'cloth_wrappings'),
  padded_lab_coat: a('padded_lab_coat','Padded Lab Coat',2,15,'armor',[['int',8]],[['defense',10,false],['statusResist',5,true],['critDamage',3,true]],['maxHp',-5,true],[[MR,5],[EC,4],[CF,3]],AC,15,55,'cloth_wrappings'),
  iron_legguards: a('iron_legguards','Iron Legguards',2,15,'legs',[['str',8]],[['defense',8,false],['maxHp',20,false]],['turnSpeed',-5,false],[[IO,6],[SM,4]],AC,15,45),
  scout_pants: a('scout_pants','Scout Pants',2,15,'legs',[['dex',8]],[['defense',5,false],['turnSpeed',5,false],['evasion',2,true]],['maxHp',-3,true],[[MR,5],[CF,3]],AC,15,45),
  iron_gauntlets: a('iron_gauntlets','Iron Gauntlets',2,15,'gloves',[['str',8]],[['defense',5,false],['accuracy',3,true]],['turnSpeed',-3,false],[[IO,5],[SM,3]],AC,15,40),
  marksman_gloves: a('marksman_gloves','Marksman Gloves',2,15,'gloves',[['dex',8]],[['accuracy',5,true],['critChance',2,true]],['defense',-2,false],[[MR,4],[CF,3]],AC,15,40),
  iron_boots: a('iron_boots','Iron Boots',2,15,'boots',[['str',8]],[['defense',5,false],['maxHp',12,false]],['turnSpeed',-5,false],[[IO,5],[SM,3]],AC,15,38),
  scout_boots: a('scout_boots','Scout Boots',2,15,'boots',[['dex',8]],[['turnSpeed',8,false],['evasion',3,true]],['defense',-3,false],[[MR,4],[CF,3]],AC,15,38),
  iron_shield: a('iron_shield','Iron Shield',2,15,'shield',[['str',10]],[['defense',10,false],['blockChance',8,true],['maxHp',15,false]],['turnSpeed',-8,false],[[IO,8],[SM,5],[RS,3]],AC,15,50),
  copper_band: a('copper_band','Copper Band',2,15,'ring',[],[['maxHp',12,false],['critChance',1,true]],null,[[CO,5],[IO,3]],TK,15,30),
  wire_earring: a('wire_earring','Wire Earring',2,15,'earring',[],[['statusResist',4,true],['hpRegen',0.5,false]],null,[[EC,3],[CO,2]],TK,15,25),
  gear_pendant: a('gear_pendant','Gear Pendant',2,15,'necklace',[],[['maxHp',15,false],['critDamage',3,true],['hpRegen',1,false]],null,[[MP,4],[CO,3],[IO,2]],TK,15,35),

  // =====================================================================
  // T3 WEAPONS (Level 30)
  // =====================================================================
  war_axe: w('war_axe','War Axe',3,30,'melee',true,[['str',20]],[['meleeAttack',38,false],['maxHp',25,false],['critChance',3,true]],['turnSpeed',-12,false],[[IO,12],[SM,8],[SW,4]],WS,30,120,'spiked_club'),
  serrated_blade: w('serrated_blade','Serrated Blade',3,30,'melee',false,[['str',15],['dex',10]],[['meleeAttack',35,false],['critChance',5,true],['turnSpeed',5,false]],['maxHp',-8,true],[[IO,10],[CO,6],[CF,5]],WS,30,120,'raiders_cleaver'),
  bolt_action_rifle: w('bolt_action_rifle','Bolt-Action Rifle',3,30,'ranged',true,[['dex',20]],[['rangedAttack',35,false],['accuracy',8,true],['critChance',5,true]],['turnSpeed',-10,false],[[IO,10],[RP,6],[MP,5]],WS,30,120,'hunting_crossbow'),
  twin_pistols: w('twin_pistols','Twin Pistols',3,30,'ranged',false,[['dex',15],['per',10]],[['rangedAttack',30,false],['turnSpeed',15,false],['critChance',4,true]],['accuracy',-8,true],[[RP,8],[MP,6],[CO,5]],WS,30,120,'pipe_pistol'),
  concussion_launcher: w('concussion_launcher','Concussion Launcher',3,30,'demolitions',true,[['int',20]],[['blastAttack',38,false],['critDamage',10,true]],['selfDamage',5,true],[[RP,10],[CF,8],[MP,5]],WS,30,120,'frag_grenade'),
  cluster_mine: w('cluster_mine','Cluster Mine',3,30,'demolitions',false,[['int',15],['per',10]],[['blastAttack',34,false],['critChance',8,true]],['turnSpeed',-8,false],[[SM,8],[CF,6],[EC,5]],WS,30,120,'incendiary_mine'),
  // T3 ARMOR (Level 30)
  iron_breastplate: a('iron_breastplate','Iron Breastplate',3,30,'armor',[['str',20]],[['defense',32,false],['maxHp',50,false],['hpRegen',1,false]],['turnSpeed',-15,false],[[IO,15],[SM,8],[RS,5]],AC,30,110,'scrap_plate_chest'),
  rangers_hide: a('rangers_hide',"Ranger's Hide",3,30,'armor',[['dex',18]],[['defense',22,false],['turnSpeed',12,false],['evasion',6,true]],['maxHp',-8,true],[[MR,10],[CF,6],[SM,4]],AC,30,110,'leather_duster'),
  insulated_vest: a('insulated_vest','Insulated Tech Vest',3,30,'armor',[['int',18]],[['defense',20,false],['statusResist',10,true],['critDamage',8,true]],['maxHp',-8,true],[[EC,8],[CF,5],[SM,4]],AC,30,110),
  iron_legplates: a('iron_legplates','Iron Legplates',3,30,'legs',[['str',15]],[['defense',14,false],['maxHp',30,false],['turnSpeed',-5,false]],null,[[IO,10],[SM,6],[RS,3]],AC,30,90),
  combat_gauntlets: a('combat_gauntlets','Combat Gauntlets',3,30,'gloves',[['str',15]],[['defense',8,false],['accuracy',5,true],['critChance',3,true]],['turnSpeed',-4,false],[[IO,8],[SM,5],[MP,3]],AC,30,80),
  strider_boots: a('strider_boots','Strider Boots',3,30,'boots',[['dex',15]],[['turnSpeed',10,false],['evasion',4,true],['defense',5,false]],['maxHp',-4,true],[[MR,6],[CF,4],[IO,3]],AC,30,80),
  tower_shield: a('tower_shield','Tower Shield',3,30,'shield',[['str',18]],[['defense',18,false],['blockChance',12,true],['maxHp',25,false]],['turnSpeed',-12,false],[[IO,12],[RS,8],[SM,5]],AC,30,100),
  alloy_ring: a('alloy_ring','Alloy Ring',3,30,'ring',[],[['maxHp',18,false],['critChance',2,true],['defense',3,false]],null,[[CO,6],[IO,4],[MP,2]],TK,30,45),
  circuit_earring: a('circuit_earring','Circuit Earring',3,30,'earring',[],[['statusResist',6,true],['hpRegen',1,false],['maxHp',10,false]],null,[[EC,5],[CO,3]],TK,30,40),
  motor_pendant: a('motor_pendant','Motor Pendant',3,30,'necklace',[],[['maxHp',25,false],['critDamage',6,true],['hpRegen',1.5,false]],null,[[MP,6],[CO,4],[EC,3]],TK,30,55),

  // =====================================================================
  // T4 WEAPONS (Level 45)
  // =====================================================================
  reinforced_mace: w('reinforced_mace','Reinforced Mace',4,45,'melee',false,[['str',30]],[['meleeAttack',55,false],['maxHp',40,false],['critChance',5,true]],['turnSpeed',-15,false],[[IO,18],[SM,12],[MP,6]],WS,45,200,'war_axe'),
  assassins_dirk: w('assassins_dirk',"Assassin's Dirk",4,45,'melee',false,[['str',20],['dex',20]],[['meleeAttack',48,false],['critChance',8,true],['turnSpeed',10,false]],['maxHp',-10,true],[[IO,15],[CO,8],[CF,8]],WS,45,200,'serrated_blade'),
  scoped_carbine: w('scoped_carbine','Scoped Carbine',4,45,'ranged',true,[['dex',30]],[['rangedAttack',52,false],['accuracy',12,true],['critChance',8,true]],['turnSpeed',-12,false],[[IO,15],[RP,10],[MP,8],[EC,4]],WS,45,200,'bolt_action_rifle'),
  repeater_crossbow: w('repeater_crossbow','Repeater Crossbow',4,45,'ranged',false,[['dex',20],['per',15]],[['rangedAttack',48,false],['turnSpeed',10,false],['critChance',10,true]],['maxHp',-8,true],[[SW,12],[MP,10],[IO,6],[CF,4]],WS,45,200,'twin_pistols'),
  rocket_launcher: w('rocket_launcher','Rocket Launcher',4,45,'demolitions',true,[['int',30]],[['blastAttack',55,false],['critDamage',15,true]],['selfDamage',6,true],[[RP,15],[CF,12],[MP,8],[EC,5]],WS,45,200,'concussion_launcher'),
  toxic_gas_canister: w('toxic_gas_canister','Toxic Gas Canister',4,45,'demolitions',false,[['int',20],['con',15]],[['blastAttack',48,false],['critChance',6,true]],['selfDamage',4,true],[[CF,12],[MR,8],[EC,5]],WS,45,200,'cluster_mine'),
  // T4 ARMOR (Level 45)
  plated_war_armor: a('plated_war_armor','Plated War Armor',4,45,'armor',[['str',30]],[['defense',48,false],['maxHp',80,false],['hpRegen',2,false]],['turnSpeed',-20,false],[[IO,22],[SM,15],[RS,8],[MP,5]],AC,45,180),
  shadow_leathers: a('shadow_leathers','Shadow Leathers',4,45,'armor',[['dex',28]],[['defense',34,false],['turnSpeed',18,false],['evasion',10,true]],['maxHp',-10,true],[[MR,12],[CF,8],[EC,5],[SM,4]],AC,45,180),
  hazmat_suit: a('hazmat_suit','Hazmat Suit',4,45,'armor',[['int',28]],[['defense',30,false],['statusResist',15,true],['critDamage',12,true]],['evasion',-8,true],[[EC,10],[CF,8],[MR,6],[SM,4]],AC,45,180),
  plated_legguards: a('plated_legguards','Plated Legguards',4,45,'legs',[['str',22]],[['defense',22,false],['maxHp',45,false]],['turnSpeed',-8,false],[[IO,14],[SM,8],[RS,5]],AC,45,150),
  precision_gauntlets: a('precision_gauntlets','Precision Gauntlets',4,45,'gloves',[['dex',22]],[['accuracy',8,true],['critChance',5,true],['critDamage',5,true]],['defense',-4,false],[[CO,8],[MP,6],[CF,4]],AC,45,140),
  plated_boots: a('plated_boots','Plated Boots',4,45,'boots',[['str',20]],[['defense',10,false],['maxHp',25,false],['turnSpeed',-3,false]],null,[[IO,10],[SM,6],[RS,4]],AC,45,130),
  bulwark_shield: a('bulwark_shield','Bulwark Shield',4,45,'shield',[['str',25]],[['defense',25,false],['blockChance',15,true],['maxHp',40,false]],['turnSpeed',-15,false],[[IO,16],[RS,10],[SM,8]],AC,45,160),
  titanium_ring: a('titanium_ring','Titanium Ring',4,45,'ring',[],[['maxHp',25,false],['critChance',3,true],['defense',5,false]],null,[[CO,8],[IO,6],[MP,4]],TK,45,60),
  hydraulic_earring: a('hydraulic_earring','Hydraulic Earring',4,45,'earring',[],[['statusResist',8,true],['hpRegen',1.5,false],['maxHp',15,false]],null,[[MP,6],[CF,4],[CO,3]],TK,45,55),
  fusion_pendant: a('fusion_pendant','Fusion Pendant',4,45,'necklace',[],[['maxHp',35,false],['critDamage',8,true],['hpRegen',2,false]],null,[[EC,8],[MP,5],[CO,4]],TK,45,70),

  // =====================================================================
  // T5 WEAPONS (Level 60)
  // =====================================================================
  warlords_hammer: w('warlords_hammer',"Warlord's Hammer",5,60,'melee',true,[['str',45]],[['meleeAttack',78,false],['maxHp',60,false],['critChance',8,true],['hpRegen',2,false]],['turnSpeed',-20,false],[[IO,25],[SM,15],[MP,10],[CF,5]],WS,60,350,'reinforced_mace'),
  shadow_fang: w('shadow_fang','Shadow Fang',5,60,'melee',false,[['str',30],['dex',30]],[['meleeAttack',70,false],['critChance',12,true],['turnSpeed',15,false]],['maxHp',-12,true],[[IO,20],[CO,12],[CF,10],[EC,5]],WS,60,350,'assassins_dirk'),
  marksmans_rifle: w('marksmans_rifle',"Marksman's Rifle",5,60,'ranged',true,[['dex',45]],[['rangedAttack',75,false],['accuracy',15,true],['critChance',10,true],['turnSpeed',5,false]],['critChance',-8,true],[[IO,20],[RP,15],[MP,10],[EC,8]],WS,60,350,'scoped_carbine'),
  dual_revolvers: w('dual_revolvers','Dual Revolvers',5,60,'ranged',false,[['dex',30],['per',25]],[['rangedAttack',68,false],['turnSpeed',20,false],['critChance',12,true]],['accuracy',-10,true],[[IO,18],[MP,12],[CO,10],[CF,8]],WS,60,350,'repeater_crossbow'),
  siege_mortar: w('siege_mortar','Siege Mortar',5,60,'demolitions',true,[['int',45]],[['blastAttack',78,false],['critDamage',20,true]],['selfDamage',7,true],[[RP,25],[CF,18],[MP,12],[EC,8]],WS,60,350,'rocket_launcher'),
  napalm_launcher: w('napalm_launcher','Napalm Launcher',5,60,'demolitions',false,[['int',35],['con',20]],[['blastAttack',70,false],['critChance',8,true]],['selfDamage',6,true],[[CF,20],[RP,15],[MP,10],[MR,8]],WS,60,350,'toxic_gas_canister'),
  // T5 ARMOR (Level 60)
  fortress_plate: a('fortress_plate','Fortress Plate',5,60,'armor',[['str',45]],[['defense',68,false],['maxHp',120,false],['hpRegen',3,false]],['turnSpeed',-25,false],[[IO,30],[SM,20],[RS,12],[MP,8]],AC,60,300),
  nightstalker_suit: a('nightstalker_suit','Nightstalker Suit',5,60,'armor',[['dex',42]],[['defense',48,false],['turnSpeed',22,false],['evasion',14,true],['critChance',5,true]],['maxHp',-12,true],[[MR,15],[CF,12],[EC,8],[SM,6]],AC,60,300),
  reactor_vest: a('reactor_vest','Reactor Vest',5,60,'armor',[['int',42]],[['defense',42,false],['statusResist',20,true],['critDamage',18,true]],['hpRegen',-2,false],[[EC,15],[CF,10],[CO,8],[SM,5]],AC,60,300),
  fortress_legplates: a('fortress_legplates','Fortress Legplates',5,60,'legs',[['str',35]],[['defense',32,false],['maxHp',65,false]],['turnSpeed',-12,false],[[IO,20],[SM,12],[RS,8]],AC,60,250),
  deadeye_gloves: a('deadeye_gloves','Deadeye Gloves',5,60,'gloves',[['dex',35]],[['accuracy',10,true],['critChance',7,true],['critDamage',8,true]],['defense',-6,false],[[CO,12],[MP,8],[CF,6]],AC,60,240),
  fortress_boots: a('fortress_boots','Fortress Boots',5,60,'boots',[['str',30]],[['defense',15,false],['maxHp',35,false]],['turnSpeed',-8,false],[[IO,14],[SM,8],[RS,6]],AC,60,220),
  siege_shield: a('siege_shield','Siege Shield',5,60,'shield',[['str',40]],[['defense',35,false],['blockChance',18,true],['maxHp',55,false]],['turnSpeed',-18,false],[[IO,22],[RS,14],[SM,10]],AC,60,270),
  plasma_ring: a('plasma_ring','Plasma Ring',5,60,'ring',[],[['maxHp',32,false],['critChance',4,true],['defense',7,false]],null,[[EC,10],[CO,8],[MP,5]],TK,60,80),
  resonance_earring: a('resonance_earring','Resonance Earring',5,60,'earring',[],[['statusResist',10,true],['hpRegen',2,false],['maxHp',20,false]],null,[[EC,8],[CF,5],[CO,4]],TK,60,75),
  core_pendant: a('core_pendant','Core Pendant',5,60,'necklace',[],[['maxHp',45,false],['critDamage',12,true],['hpRegen',2.5,false]],null,[[EC,12],[MP,8],[CO,6]],TK,60,90),

  // =====================================================================
  // T6 WEAPONS (Level 80)
  // =====================================================================
  titan_cleaver: w('titan_cleaver','Titan Cleaver',6,80,'melee',true,[['str',60]],[['meleeAttack',110,false],['maxHp',80,false],['critChance',10,true],['hpRegen',3,false]],['turnSpeed',-25,false],[[IO,40],[SM,25],[MP,15],[CF,10]],WS,80,550,'warlords_hammer'),
  phantom_blade: w('phantom_blade','Phantom Blade',6,80,'melee',false,[['str',40],['dex',40]],[['meleeAttack',95,false],['critChance',15,true],['turnSpeed',20,false],['evasion',8,true]],['maxHp',-15,true],[[IO,30],[CO,20],[CF,15],[EC,10]],WS,80,550,'shadow_fang'),
  anti_material_rifle: w('anti_material_rifle','Anti-Material Rifle',6,80,'ranged',true,[['dex',60]],[['rangedAttack',105,false],['accuracy',18,true],['critChance',12,true],['critDamage',25,true]],['turnSpeed',-20,false],[[IO,35],[RP,20],[MP,15],[EC,10]],WS,80,550,'marksmans_rifle'),
  storm_repeater: w('storm_repeater','Storm Repeater',6,80,'ranged',false,[['dex',40],['per',35]],[['rangedAttack',90,false],['turnSpeed',25,false],['critChance',15,true],['evasion',10,true]],['accuracy',-12,true],[[IO,30],[MP,15],[CO,15],[CF,10]],WS,80,550,'dual_revolvers'),
  plasma_bombard: w('plasma_bombard','Plasma Bombard',6,80,'demolitions',true,[['int',60]],[['blastAttack',110,false],['critDamage',30,true]],['selfDamage',8,true],[[CF,40],[EC,25],[CO,20],[MP,15]],WS,80,550,'siege_mortar'),
  radiation_emitter: w('radiation_emitter','Radiation Emitter',6,80,'demolitions',false,[['int',45],['con',30]],[['blastAttack',95,false],['critChance',10,true],['statusResist',10,true]],['selfDamage',7,true],[[CF,35],[IO,20],[MR,15]],WS,80,550,'napalm_launcher'),
  // T6 ARMOR (Level 80)
  siege_bulwark: a('siege_bulwark','Siege Bulwark',6,80,'armor',[['str',60]],[['defense',95,false],['maxHp',160,false],['hpRegen',4,false]],['turnSpeed',-30,false],[[IO,45],[SM,30],[RS,18],[MP,12]],AC,80,480),
  wraith_armor: a('wraith_armor','Wraith Armor',6,80,'armor',[['dex',55]],[['defense',68,false],['turnSpeed',28,false],['evasion',18,true],['critChance',8,true]],['maxHp',-15,true],[[MR,20],[CF,15],[EC,12],[SM,8]],AC,80,480),
  fusion_core_suit: a('fusion_core_suit','Fusion Core Suit',6,80,'armor',[['int',55]],[['defense',60,false],['statusResist',25,true],['critDamage',25,true]],['hpRegen',-3,false],[[EC,20],[CF,15],[CO,12],[SM,8]],AC,80,480),
  titan_legplates: a('titan_legplates','Titan Legplates',6,80,'legs',[['str',45]],[['defense',45,false],['maxHp',90,false]],['turnSpeed',-15,false],[[IO,28],[SM,16],[RS,10]],AC,80,400),
  assassin_gloves: a('assassin_gloves','Assassin Gloves',6,80,'gloves',[['dex',45]],[['accuracy',12,true],['critChance',10,true],['critDamage',12,true]],['defense',-8,false],[[CO,15],[MP,10],[CF,8]],AC,80,380),
  titan_boots: a('titan_boots','Titan Boots',6,80,'boots',[['str',40]],[['defense',22,false],['maxHp',50,false]],['turnSpeed',-12,false],[[IO,20],[SM,12],[RS,8]],AC,80,350),
  dreadnought_shield: a('dreadnought_shield','Dreadnought Shield',6,80,'shield',[['str',55]],[['defense',48,false],['blockChance',22,true],['maxHp',70,false]],['turnSpeed',-22,false],[[IO,30],[RS,18],[SM,12]],AC,80,420),
  quantum_ring: a('quantum_ring','Quantum Ring',6,80,'ring',[],[['maxHp',40,false],['critChance',5,true],['defense',10,false]],null,[[EC,14],[CO,10],[MP,8]],TK,80,100),
  void_earring: a('void_earring','Void Earring',6,80,'earring',[],[['statusResist',12,true],['hpRegen',3,false],['maxHp',28,false]],null,[[EC,12],[CF,8],[CO,6]],TK,80,95),
  stellar_pendant: a('stellar_pendant','Stellar Pendant',6,80,'necklace',[],[['maxHp',58,false],['critDamage',16,true],['hpRegen',3,false]],null,[[EC,16],[MP,10],[CO,8]],TK,80,115),

  // =====================================================================
  // T7 WEAPONS (Level 90)
  // =====================================================================
  apocalypse_edge: w('apocalypse_edge','Apocalypse Edge',7,90,'melee',true,[['str',75]],[['meleeAttack',140,false],['maxHp',100,false],['critChance',12,true],['critDamage',20,true],['hpRegen',4,false]],['turnSpeed',-28,false],[[IO,55],[SM,35],[MP,20],[CF,15]],WS,90,800,'titan_cleaver'),
  railgun: w('railgun','Railgun',7,90,'ranged',true,[['dex',75]],[['rangedAttack',135,false],['accuracy',20,true],['critChance',15,true],['critDamage',35,true],['turnSpeed',8,false]],['hpRegen',-2,false],[[IO,50],[CO,25],[EC,20],[CF,15]],WS,90,800,'anti_material_rifle'),
  orbital_beacon: w('orbital_beacon','Orbital Strike Beacon',7,90,'demolitions',true,[['int',75]],[['blastAttack',140,false],['critDamage',40,true]],['selfDamage',9,true],[[EC,55],[CF,40],[CO,30],[MP,20]],WS,90,800,'plasma_bombard'),
  // T7 ARMOR (Level 90)
  dreadnought_plate: a('dreadnought_plate','Dreadnought Plate',7,90,'armor',[['str',75]],[['defense',125,false],['maxHp',200,false],['hpRegen',5,false],['critChance',5,true]],['turnSpeed',-35,false],[[IO,60],[SM,40],[RS,25],[MP,15]],AC,90,700),
  phantom_shroud: a('phantom_shroud','Phantom Shroud',7,90,'armor',[['dex',70]],[['defense',90,false],['turnSpeed',35,false],['evasion',22,true],['critChance',12,true],['accuracy',10,true]],['maxHp',-18,true],[[MR,25],[CF,20],[EC,15],[SM,10]],AC,90,700),
  quantum_harness: a('quantum_harness','Quantum Harness',7,90,'armor',[['int',70]],[['defense',80,false],['statusResist',30,true],['critDamage',35,true],['critChance',5,true]],['hpRegen',-4,false],[[EC,25],[CF,20],[CO,15],[SM,10]],AC,90,700),
  dreadnought_legplates: a('dreadnought_legplates','Dreadnought Legplates',7,90,'legs',[['str',55]],[['defense',58,false],['maxHp',115,false]],['turnSpeed',-18,false],[[IO,35],[SM,22],[RS,14]],AC,90,580),
  apex_gloves: a('apex_gloves','Apex Gloves',7,90,'gloves',[['dex',55]],[['accuracy',15,true],['critChance',12,true],['critDamage',15,true]],['defense',-10,false],[[CO,18],[MP,14],[CF,10]],AC,90,550),
  apex_boots: a('apex_boots','Apex Boots',7,90,'boots',[['dex',50]],[['turnSpeed',18,false],['evasion',8,true],['defense',12,false]],['maxHp',-6,true],[[MR,12],[CF,10],[IO,8]],AC,90,530),
  omega_shield: a('omega_shield','Omega Shield',7,90,'shield',[['str',65]],[['defense',60,false],['blockChance',25,true],['maxHp',90,false]],['turnSpeed',-25,false],[[IO,38],[RS,22],[SM,16]],AC,90,620),
  singularity_ring: a('singularity_ring','Singularity Ring',7,90,'ring',[],[['maxHp',50,false],['critChance',6,true],['defense',12,false]],null,[[EC,18],[CO,14],[MP,10]],TK,90,130),
  anomaly_earring: a('anomaly_earring','Anomaly Earring',7,90,'earring',[],[['statusResist',14,true],['hpRegen',3.5,false],['maxHp',35,false]],null,[[EC,16],[CF,10],[CO,8]],TK,90,120),
  eternity_pendant: a('eternity_pendant','Eternity Pendant',7,90,'necklace',[],[['maxHp',70,false],['critDamage',20,true],['hpRegen',3.5,false]],null,[[EC,20],[MP,14],[CO,10]],TK,90,145),

  // =====================================================================
  // T8 WEAPONS (Level 100) - LEGENDARY TIER
  // =====================================================================
  doomsday_maul: w('doomsday_maul','Doomsday Maul',8,100,'melee',true,[['str',90]],[['meleeAttack',180,false],['maxHp',130,false],['critChance',15,true],['critDamage',30,true],['hpRegen',5,false]],['turnSpeed',-30,false],[[IO,80],[SM,50],[MP,30],[CF,20],[RS,10]],WS,100,1200,'apocalypse_edge'),
  oblivion_cannon: w('oblivion_cannon','Oblivion Cannon',8,100,'ranged',true,[['dex',90]],[['rangedAttack',175,false],['accuracy',22,true],['critChance',18,true],['critDamage',45,true],['turnSpeed',15,false]],['hpRegen',-3,false],[[IO,70],[CO,40],[EC,30],[CF,25],[MP,10]],WS,100,1200,'railgun'),
  apocalypse_device: w('apocalypse_device','Apocalypse Device',8,100,'demolitions',true,[['int',90]],[['blastAttack',180,false],['critDamage',50,true]],['selfDamage',10,true],[[EC,80],[CF,60],[CO,40],[MP,30],[IO,20]],WS,100,1200,'orbital_beacon'),
  // T8 ARMOR (Level 100) - LEGENDARY
  apocalypse_aegis: a('apocalypse_aegis','Apocalypse Aegis',8,100,'armor',[['str',90]],[['defense',160,false],['maxHp',250,false],['hpRegen',6,false],['critChance',8,true]],['turnSpeed',-38,false],[[IO,80],[SM,50],[RS,30],[MP,20]],AC,100,1000),
  void_walker_suit: a('void_walker_suit','Void Walker Suit',8,100,'armor',[['dex',85]],[['defense',115,false],['turnSpeed',40,false],['evasion',28,true],['critChance',15,true],['accuracy',12,true]],['maxHp',-20,true],[[MR,30],[CF,25],[EC,20],[SM,15]],AC,100,1000),
  singularity_frame: a('singularity_frame','Singularity Frame',8,100,'armor',[['int',85]],[['defense',100,false],['statusResist',35,true],['critDamage',45,true],['critChance',8,true]],['hpRegen',-5,false],[[EC,30],[CF,25],[CO,20],[SM,15]],AC,100,1000),
  eternity_shell: a('eternity_shell','Eternity Shell',8,100,'armor',[['con',85]],[['defense',130,false],['maxHp',300,false],['hpRegen',8,false],['statusResist',15,true]],['turnSpeed',-30,false],[[IO,60],[RS,35],[SM,25],[MP,18]],AC,100,1000),
  doomsday_legplates: a('doomsday_legplates','Doomsday Legplates',8,100,'legs',[['str',65]],[['defense',72,false],['maxHp',140,false]],['turnSpeed',-20,false],[[IO,45],[SM,28],[RS,18]],AC,100,820),
  godhand_gloves: a('godhand_gloves','Godhand Gloves',8,100,'gloves',[['dex',65]],[['accuracy',18,true],['critChance',14,true],['critDamage',18,true]],['defense',-12,false],[[CO,22],[MP,16],[CF,12]],AC,100,780),
  godstep_boots: a('godstep_boots','Godstep Boots',8,100,'boots',[['dex',60]],[['turnSpeed',22,false],['evasion',10,true],['defense',15,false]],['maxHp',-8,true],[[MR,15],[CF,12],[IO,10]],AC,100,760),
  world_shield: a('world_shield','World Shield',8,100,'shield',[['str',80]],[['defense',75,false],['blockChance',28,true],['maxHp',110,false]],['turnSpeed',-28,false],[[IO,48],[RS,28],[SM,20]],AC,100,900),
  infinity_ring: a('infinity_ring','Infinity Ring',8,100,'ring',[],[['maxHp',60,false],['critChance',7,true],['defense',15,false]],null,[[EC,22],[CO,18],[MP,12]],TK,100,160),
  void_earring_t8: a('void_earring_t8','Void Whisper Earring',8,100,'earring',[],[['statusResist',16,true],['hpRegen',4,false],['maxHp',42,false]],null,[[EC,20],[CF,14],[CO,10]],TK,100,150),
  eternity_amulet: a('eternity_amulet','Eternity Amulet',8,100,'necklace',[],[['maxHp',85,false],['critDamage',22,true],['hpRegen',4,false]],null,[[EC,24],[MP,18],[CO,12]],TK,100,175),

  // =====================================================================
  // GREEN SET: EARLY GAME - "Survivor's Outfit" (T1, Lv.1, Gathering focus)
  // =====================================================================
  survivor_vest: a('survivor_vest',"Survivor's Vest",1,1,'armor',[],[['defense',4,false],['maxHp',8,false]],null,[[SM,4],[MR,3]],AC,1,22,undefined,'set_survivor'),
  survivor_pants: a('survivor_pants',"Survivor's Pants",1,1,'legs',[],[['defense',2,false],['maxHp',6,false]],null,[[SM,3],[MR,2]],AC,1,18,undefined,'set_survivor'),
  survivor_gloves: a('survivor_gloves',"Survivor's Gloves",1,1,'gloves',[],[['accuracy',2,true],['defense',1,false]],null,[[MR,3],[SM,1]],AC,1,15,undefined,'set_survivor'),
  survivor_boots: a('survivor_boots',"Survivor's Boots",1,1,'boots',[],[['turnSpeed',2,false],['defense',1,false]],null,[[MR,3],[IO,1]],AC,1,15,undefined,'set_survivor'),
  survivor_ring: a('survivor_ring',"Survivor's Ring",1,1,'ring',[],[['maxHp',4,false]],null,[[IO,2],[CO,1]],TK,1,12,undefined,'set_survivor'),
  survivor_earring: a('survivor_earring',"Survivor's Earring",1,1,'earring',[],[['statusResist',1,true]],null,[[CO,2]],TK,1,10,undefined,'set_survivor'),

  // =====================================================================
  // GREEN SET: MID GAME - "Raider's Armor" (T3, Lv.30, Combat focus, plate)
  // =====================================================================
  raider_plate: a('raider_plate',"Raider's Plate",3,30,'armor',[['str',18]],[['defense',28,false],['maxHp',40,false]],['turnSpeed',-12,false],[[IO,12],[SM,8],[RS,4]],AC,30,100,undefined,'set_raider'),
  raider_legguards: a('raider_legguards',"Raider's Legguards",3,30,'legs',[['str',14]],[['defense',12,false],['maxHp',25,false]],['turnSpeed',-4,false],[[IO,8],[SM,5]],AC,30,85,undefined,'set_raider'),
  raider_gauntlets: a('raider_gauntlets',"Raider's Gauntlets",3,30,'gloves',[['str',14]],[['defense',6,false],['accuracy',4,true]],null,[[IO,7],[SM,4]],AC,30,75,undefined,'set_raider'),
  raider_boots: a('raider_boots',"Raider's Boots",3,30,'boots',[['str',12]],[['defense',7,false],['maxHp',15,false]],['turnSpeed',-3,false],[[IO,6],[SM,4]],AC,30,75,undefined,'set_raider'),
  raider_shield: a('raider_shield',"Raider's Shield",3,30,'shield',[['str',16]],[['defense',15,false],['blockChance',10,true]],['turnSpeed',-8,false],[[IO,10],[RS,6],[SM,4]],AC,30,90,undefined,'set_raider'),
  raider_ring: a('raider_ring',"Raider's Ring",3,30,'ring',[],[['maxHp',15,false],['defense',3,false]],null,[[IO,5],[CO,3]],TK,30,40,undefined,'set_raider'),

  // =====================================================================
  // GREEN SET: MID GAME - "Forager's Garb" (T3, Lv.30, Gathering/Production)
  // =====================================================================
  forager_vest: a('forager_vest',"Forager's Vest",3,30,'armor',[['dex',15]],[['defense',18,false],['turnSpeed',8,false],['evasion',4,true]],['maxHp',-6,true],[[MR,10],[CF,5],[SM,4]],AC,30,100,undefined,'set_forager'),
  forager_pants: a('forager_pants',"Forager's Pants",3,30,'legs',[['dex',12]],[['defense',8,false],['turnSpeed',5,false],['evasion',2,true]],null,[[MR,8],[CF,3]],AC,30,80,undefined,'set_forager'),
  forager_gloves: a('forager_gloves',"Forager's Gloves",3,30,'gloves',[['dex',12]],[['accuracy',4,true],['critChance',2,true]],null,[[MR,6],[CF,3]],AC,30,70,undefined,'set_forager'),
  forager_boots: a('forager_boots',"Forager's Boots",3,30,'boots',[['dex',12]],[['turnSpeed',8,false],['evasion',3,true]],['defense',-3,false],[[MR,6],[CF,3]],AC,30,70,undefined,'set_forager'),
  forager_pendant: a('forager_pendant',"Forager's Pendant",3,30,'necklace',[],[['maxHp',20,false],['hpRegen',1,false]],null,[[MP,4],[CO,3],[EC,2]],TK,30,50,undefined,'set_forager'),
  forager_earring: a('forager_earring',"Forager's Earring",3,30,'earring',[],[['statusResist',5,true],['hpRegen',0.5,false]],null,[[CO,4],[EC,2]],TK,30,35,undefined,'set_forager'),

  // =====================================================================
  // GREEN SET: ENDGAME - "Warlord's Regalia" (T6, Lv.80, Heavy Combat)
  // =====================================================================
  warlord_breastplate: a('warlord_breastplate',"Warlord's Breastplate",6,80,'armor',[['str',55]],[['defense',88,false],['maxHp',145,false],['hpRegen',3,false]],['turnSpeed',-28,false],[[IO,40],[SM,28],[RS,16],[MP,10]],AC,80,450,undefined,'set_warlord'),
  warlord_legplates: a('warlord_legplates',"Warlord's Legplates",6,80,'legs',[['str',42]],[['defense',40,false],['maxHp',80,false]],['turnSpeed',-12,false],[[IO,25],[SM,15],[RS,8]],AC,80,380,undefined,'set_warlord'),
  warlord_gauntlets: a('warlord_gauntlets',"Warlord's Gauntlets",6,80,'gloves',[['str',42]],[['defense',18,false],['accuracy',8,true],['critChance',6,true]],['turnSpeed',-5,false],[[IO,18],[SM,10],[MP,6]],AC,80,350,undefined,'set_warlord'),
  warlord_boots: a('warlord_boots',"Warlord's Boots",6,80,'boots',[['str',38]],[['defense',18,false],['maxHp',40,false]],['turnSpeed',-10,false],[[IO,18],[SM,10],[RS,6]],AC,80,330,undefined,'set_warlord'),
  warlord_shield: a('warlord_shield',"Warlord's Shield",6,80,'shield',[['str',50]],[['defense',45,false],['blockChance',20,true],['maxHp',65,false]],['turnSpeed',-20,false],[[IO,28],[RS,16],[SM,10]],AC,80,400,undefined,'set_warlord'),
  warlord_ring: a('warlord_ring',"Warlord's Ring",6,80,'ring',[],[['maxHp',38,false],['critChance',4,true],['defense',8,false]],null,[[EC,12],[CO,8],[MP,6]],TK,80,95,undefined,'set_warlord'),
  warlord_pendant: a('warlord_pendant',"Warlord's Pendant",6,80,'necklace',[],[['maxHp',52,false],['critDamage',14,true],['hpRegen',2.5,false]],null,[[EC,14],[MP,8],[CO,6]],TK,80,110,undefined,'set_warlord'),

  // =====================================================================
  // GREEN SET: ENDGAME - "Artisan's Ensemble" (T6, Lv.80, Production/Gathering)
  // =====================================================================
  artisan_vest: a('artisan_vest',"Artisan's Vest",6,80,'armor',[['int',50]],[['defense',55,false],['statusResist',18,true],['critDamage',15,true]],['turnSpeed',-15,false],[[EC,18],[CF,12],[SM,8],[MR,6]],AC,80,420,undefined,'set_artisan'),
  artisan_pants: a('artisan_pants',"Artisan's Pants",6,80,'legs',[['int',38]],[['defense',28,false],['maxHp',55,false],['turnSpeed',5,false]],null,[[EC,14],[CF,8],[MR,5]],AC,80,350,undefined,'set_artisan'),
  artisan_gloves: a('artisan_gloves',"Artisan's Gloves",6,80,'gloves',[['int',38]],[['accuracy',10,true],['critDamage',8,true]],null,[[EC,12],[CF,6],[CO,5]],AC,80,320,undefined,'set_artisan'),
  artisan_boots: a('artisan_boots',"Artisan's Boots",6,80,'boots',[['int',35]],[['turnSpeed',12,false],['evasion',5,true]],['defense',-5,false],[[EC,10],[CF,6],[MR,4]],AC,80,300,undefined,'set_artisan'),
  artisan_earring: a('artisan_earring',"Artisan's Earring",6,80,'earring',[],[['statusResist',10,true],['hpRegen',2,false],['maxHp',22,false]],null,[[EC,10],[CF,6],[CO,4]],TK,80,85,undefined,'set_artisan'),
  artisan_pendant: a('artisan_pendant',"Artisan's Pendant",6,80,'necklace',[],[['maxHp',48,false],['critDamage',12,true],['hpRegen',2,false]],null,[[EC,14],[MP,8],[CO,6]],TK,80,100,undefined,'set_artisan'),
};

// =====================================================================
// STAT FOCUS RINGS (Ring slot 3 only)
// =====================================================================
// Single stat rings: 70% XP to primary, 30% determined by weapon
GEAR_TEMPLATES['ring_of_str'] = { id: 'ring_of_str', name: 'Ring of Strength', slot: 'ring', tier: 1, levelReq: 1, statRequirements: [], baseStats: [{ stat: 'meleeAttack', value: 3, isPercentage: false }], craftingInputs: [[IO,5],[CO,3]].map(([r,q])=>({resourceId:r,quantity:q})), craftSkillId: TK, craftSkillLevel: 1, craftXp: 20, statFocusRing: { primaryStat: 'str' } };
GEAR_TEMPLATES['ring_of_dex'] = { id: 'ring_of_dex', name: 'Ring of Dexterity', slot: 'ring', tier: 1, levelReq: 1, statRequirements: [], baseStats: [{ stat: 'rangedAttack', value: 3, isPercentage: false }], craftingInputs: [[CO,5],[IO,3]].map(([r,q])=>({resourceId:r,quantity:q})), craftSkillId: TK, craftSkillLevel: 1, craftXp: 20, statFocusRing: { primaryStat: 'dex' } };
GEAR_TEMPLATES['ring_of_int'] = { id: 'ring_of_int', name: 'Ring of Intelligence', slot: 'ring', tier: 1, levelReq: 1, statRequirements: [], baseStats: [{ stat: 'blastAttack', value: 3, isPercentage: false }], craftingInputs: [[EC,5],[CO,3]].map(([r,q])=>({resourceId:r,quantity:q})), craftSkillId: TK, craftSkillLevel: 1, craftXp: 20, statFocusRing: { primaryStat: 'int' } };
GEAR_TEMPLATES['ring_of_con'] = { id: 'ring_of_con', name: 'Ring of Constitution', slot: 'ring', tier: 1, levelReq: 1, statRequirements: [], baseStats: [{ stat: 'maxHp', value: 12, isPercentage: false }], craftingInputs: [[RS,5],[IO,3]].map(([r,q])=>({resourceId:r,quantity:q})), craftSkillId: TK, craftSkillLevel: 1, craftXp: 20, statFocusRing: { primaryStat: 'con' } };
GEAR_TEMPLATES['ring_of_per'] = { id: 'ring_of_per', name: 'Ring of Perception', slot: 'ring', tier: 1, levelReq: 1, statRequirements: [], baseStats: [{ stat: 'accuracy', value: 3, isPercentage: true }], craftingInputs: [[EC,4],[CO,4]].map(([r,q])=>({resourceId:r,quantity:q})), craftSkillId: TK, craftSkillLevel: 1, craftXp: 20, statFocusRing: { primaryStat: 'per' } };
GEAR_TEMPLATES['ring_of_luk'] = { id: 'ring_of_luk', name: 'Ring of Luck', slot: 'ring', tier: 1, levelReq: 1, statRequirements: [], baseStats: [{ stat: 'critChance', value: 2, isPercentage: true }], craftingInputs: [[CO,6],[IO,2]].map(([r,q])=>({resourceId:r,quantity:q})), craftSkillId: TK, craftSkillLevel: 1, craftXp: 20, statFocusRing: { primaryStat: 'luk' } };
// Dual stat rings: 50/50 XP split
GEAR_TEMPLATES['ring_of_providence'] = { id: 'ring_of_providence', name: 'Ring of Providence', slot: 'ring', tier: 2, levelReq: 15, statRequirements: [], baseStats: [{ stat: 'maxHp', value: 8, isPercentage: false }, { stat: 'meleeAttack', value: 3, isPercentage: false }], craftingInputs: [[IO,8],[RS,5],[CO,3]].map(([r,q])=>({resourceId:r,quantity:q})), craftSkillId: TK, craftSkillLevel: 15, craftXp: 35, statFocusRing: { primaryStat: 'str', secondaryStat: 'con', isDual: true } };
GEAR_TEMPLATES['ring_of_precision'] = { id: 'ring_of_precision', name: 'Ring of Precision', slot: 'ring', tier: 2, levelReq: 15, statRequirements: [], baseStats: [{ stat: 'accuracy', value: 3, isPercentage: true }, { stat: 'rangedAttack', value: 3, isPercentage: false }], craftingInputs: [[CO,8],[EC,5],[IO,3]].map(([r,q])=>({resourceId:r,quantity:q})), craftSkillId: TK, craftSkillLevel: 15, craftXp: 35, statFocusRing: { primaryStat: 'dex', secondaryStat: 'per', isDual: true } };
GEAR_TEMPLATES['ring_of_destruction'] = { id: 'ring_of_destruction', name: 'Ring of Destruction', slot: 'ring', tier: 2, levelReq: 15, statRequirements: [], baseStats: [{ stat: 'blastAttack', value: 4, isPercentage: false }, { stat: 'critDamage', value: 3, isPercentage: true }], craftingInputs: [[EC,8],[CF,5],[CO,3]].map(([r,q])=>({resourceId:r,quantity:q})), craftSkillId: TK, craftSkillLevel: 15, craftXp: 35, statFocusRing: { primaryStat: 'int', secondaryStat: 'luk', isDual: true } };

export const GEAR_TEMPLATE_LIST = Object.values(GEAR_TEMPLATES);

export function getTemplatesByTier(tier: number): GearTemplate[] {
  return GEAR_TEMPLATE_LIST.filter(t => t.tier === tier);
}

export function getTemplatesBySlot(slot: string): GearTemplate[] {
  return GEAR_TEMPLATE_LIST.filter(t => t.slot === slot);
}

export function getCraftableTemplates(skillId: string, skillLevel: number): GearTemplate[] {
  return GEAR_TEMPLATE_LIST.filter(t => t.craftSkillId === skillId && t.craftSkillLevel <= skillLevel);
}

/**
 * Get the weapon's primary stat (used for the 30% portion when a focus ring is equipped).
 * Melee = STR, Ranged = DEX, Demolitions = INT
 */
export function getWeaponPrimaryStat(weaponType: 'melee' | 'ranged' | 'demolitions'): string {
  switch (weaponType) {
    case 'melee': return 'str';
    case 'ranged': return 'dex';
    case 'demolitions': return 'int';
  }
}

/**
 * Calculate combat XP distribution based on equipped focus ring and weapon type.
 *
 * Rules:
 * - WITH single focus ring: 70% to ring stat, 30% to weapon primary stat
 * - WITH dual focus ring: 50% to each stat (weapon ignored)
 * - WITHOUT focus ring: 30% to weapon primary, 70% split evenly across all 7 stats (~10% each)
 */
export function getCombatXpDistribution(
  weaponType: 'melee' | 'ranged' | 'demolitions',
  focusRing?: { primaryStat: string; secondaryStat?: string; isDual?: boolean } | null,
): [string, number][] {
  const weaponStat = getWeaponPrimaryStat(weaponType);
  const allStats = ['str', 'dex', 'int', 'con', 'per', 'luk', 'res'];

  if (focusRing?.isDual && focusRing.secondaryStat) {
    // Dual ring: 50/50 split, weapon ignored
    return [[focusRing.primaryStat, 0.5], [focusRing.secondaryStat, 0.5]];
  }

  if (focusRing) {
    // Single ring: 70% to ring stat, 30% to weapon primary
    return [[focusRing.primaryStat, 0.7], [weaponStat, 0.3]];
  }

  // No ring: 30% weapon primary + 70% spread evenly across all 7 stats
  const evenSplit = 0.7 / allStats.length; // ~10% each
  const distribution: [string, number][] = allStats.map(s => [s, evenSplit]);
  // Add the 30% weapon bonus on top
  const weaponIdx = distribution.findIndex(d => d[0] === weaponStat);
  if (weaponIdx >= 0) distribution[weaponIdx][1] += 0.3;
  return distribution;
}

/** Get stat focus rings only (for ring3 slot) */
export function getStatFocusRings(): GearTemplate[] {
  return GEAR_TEMPLATE_LIST.filter(t => t.statFocusRing);
}

// ============================
// FACET POOLS
// ============================

export interface FacetTemplate {
  name: string;
  slot: string; // 'weapon', 'armor', 'legs', etc.
  upside: { stat: string; value: number; isPercentage: boolean };
  downside: { stat: string; value: number; isPercentage: boolean };
}

export const FACET_POOLS: FacetTemplate[] = [
  // WEAPON FACETS
  { name: 'Quick', slot: 'weapon', upside: { stat: 'turnSpeed', value: 10, isPercentage: false }, downside: { stat: 'meleeAttack', value: -8, isPercentage: true } },
  { name: 'Heavy', slot: 'weapon', upside: { stat: 'meleeAttack', value: 12, isPercentage: true }, downside: { stat: 'turnSpeed', value: -10, isPercentage: false } },
  { name: 'Keen', slot: 'weapon', upside: { stat: 'critChance', value: 5, isPercentage: true }, downside: { stat: 'defense', value: -10, isPercentage: true } },
  { name: 'Sharp', slot: 'weapon', upside: { stat: 'critDamage', value: 25, isPercentage: true }, downside: { stat: 'meleeAttack', value: -8, isPercentage: true } },
  { name: 'Precise', slot: 'weapon', upside: { stat: 'accuracy', value: 8, isPercentage: true }, downside: { stat: 'meleeAttack', value: -6, isPercentage: true } },
  { name: 'Brutal', slot: 'weapon', upside: { stat: 'meleeAttack', value: 15, isPercentage: true }, downside: { stat: 'accuracy', value: -5, isPercentage: true } },
  { name: 'Vampiric', slot: 'weapon', upside: { stat: 'lifesteal', value: 5, isPercentage: true }, downside: { stat: 'meleeAttack', value: -10, isPercentage: true } },
  { name: 'Scorching', slot: 'weapon', upside: { stat: 'burnDot', value: 3, isPercentage: true }, downside: { stat: 'meleeAttack', value: -8, isPercentage: true } },
  { name: 'Toxic', slot: 'weapon', upside: { stat: 'poisonDot', value: 2, isPercentage: true }, downside: { stat: 'meleeAttack', value: -8, isPercentage: true } },
  { name: 'Standard', slot: 'weapon', upside: { stat: 'none', value: 0, isPercentage: false }, downside: { stat: 'none', value: 0, isPercentage: false } },

  // ARMOR FACETS
  { name: 'Bulky', slot: 'armor', upside: { stat: 'defense', value: 10, isPercentage: true }, downside: { stat: 'turnSpeed', value: -8, isPercentage: false } },
  { name: 'Lightweight', slot: 'armor', upside: { stat: 'turnSpeed', value: 8, isPercentage: false }, downside: { stat: 'defense', value: -10, isPercentage: true } },
  { name: 'Reinforced', slot: 'armor', upside: { stat: 'defense', value: 8, isPercentage: true }, downside: { stat: 'evasion', value: -5, isPercentage: true } },
  { name: 'Flexible', slot: 'armor', upside: { stat: 'evasion', value: 5, isPercentage: true }, downside: { stat: 'defense', value: -8, isPercentage: true } },
  { name: 'Spiked', slot: 'armor', upside: { stat: 'thornsDamage', value: 8, isPercentage: true }, downside: { stat: 'maxHp', value: -5, isPercentage: true } },
  { name: 'Standard', slot: 'armor', upside: { stat: 'none', value: 0, isPercentage: false }, downside: { stat: 'none', value: 0, isPercentage: false } },

  // BOOTS FACETS
  { name: 'Swift', slot: 'boots', upside: { stat: 'turnSpeed', value: 10, isPercentage: false }, downside: { stat: 'defense', value: -5, isPercentage: true } },
  { name: 'Heavy', slot: 'boots', upside: { stat: 'defense', value: 8, isPercentage: true }, downside: { stat: 'turnSpeed', value: -8, isPercentage: false } },
  { name: 'Silent', slot: 'boots', upside: { stat: 'evasion', value: 5, isPercentage: true }, downside: { stat: 'defense', value: -3, isPercentage: true } },
  { name: 'Standard', slot: 'boots', upside: { stat: 'none', value: 0, isPercentage: false }, downside: { stat: 'none', value: 0, isPercentage: false } },

  // GLOVES FACETS
  { name: 'Precise', slot: 'gloves', upside: { stat: 'accuracy', value: 5, isPercentage: true }, downside: { stat: 'meleeAttack', value: -3, isPercentage: true } },
  { name: 'Deadly', slot: 'gloves', upside: { stat: 'critChance', value: 4, isPercentage: true }, downside: { stat: 'accuracy', value: -5, isPercentage: true } },
  { name: 'Rapid', slot: 'gloves', upside: { stat: 'turnSpeed', value: 6, isPercentage: false }, downside: { stat: 'defense', value: -3, isPercentage: true } },
  { name: 'Standard', slot: 'gloves', upside: { stat: 'none', value: 0, isPercentage: false }, downside: { stat: 'none', value: 0, isPercentage: false } },

  // LEGS FACETS
  { name: 'Swift', slot: 'legs', upside: { stat: 'turnSpeed', value: 8, isPercentage: false }, downside: { stat: 'defense', value: -5, isPercentage: true } },
  { name: 'Armored', slot: 'legs', upside: { stat: 'defense', value: 10, isPercentage: true }, downside: { stat: 'turnSpeed', value: -5, isPercentage: false } },
  { name: 'Standard', slot: 'legs', upside: { stat: 'none', value: 0, isPercentage: false }, downside: { stat: 'none', value: 0, isPercentage: false } },

  // SHIELD FACETS
  { name: 'Dense', slot: 'shield', upside: { stat: 'blockChance', value: 15, isPercentage: true }, downside: { stat: 'turnSpeed', value: -5, isPercentage: false } },
  { name: 'Spiked', slot: 'shield', upside: { stat: 'thornsDamage', value: 10, isPercentage: true }, downside: { stat: 'blockChance', value: -5, isPercentage: true } },
  { name: 'Standard', slot: 'shield', upside: { stat: 'none', value: 0, isPercentage: false }, downside: { stat: 'none', value: 0, isPercentage: false } },

  // ACCESSORY FACETS (ring, earring, necklace)
  { name: 'Blessed', slot: 'ring', upside: { stat: 'maxHp', value: 3, isPercentage: true }, downside: { stat: 'maxHp', value: -2, isPercentage: true } },
  { name: 'Lucky', slot: 'ring', upside: { stat: 'critChance', value: 2, isPercentage: true }, downside: { stat: 'accuracy', value: -2, isPercentage: true } },
  { name: 'Standard', slot: 'ring', upside: { stat: 'none', value: 0, isPercentage: false }, downside: { stat: 'none', value: 0, isPercentage: false } },
  { name: 'Protective', slot: 'earring', upside: { stat: 'statusResist', value: 5, isPercentage: true }, downside: { stat: 'critChance', value: -2, isPercentage: true } },
  { name: 'Standard', slot: 'earring', upside: { stat: 'none', value: 0, isPercentage: false }, downside: { stat: 'none', value: 0, isPercentage: false } },
  { name: 'Charged', slot: 'necklace', upside: { stat: 'critDamage', value: 5, isPercentage: true }, downside: { stat: 'defense', value: -3, isPercentage: true } },
  { name: 'Standard', slot: 'necklace', upside: { stat: 'none', value: 0, isPercentage: false }, downside: { stat: 'none', value: 0, isPercentage: false } },
];

export function getFacetsForSlot(slot: string): FacetTemplate[] {
  return FACET_POOLS.filter(f => f.slot === slot);
}

// ============================
// ENCHANTMENT POOLS (simplified for code - uses groups to prevent stacking)
// ============================

export interface EnchantTemplate {
  name: string;
  group: EnchantGroup;
  slots: string[]; // which slots this can appear on
  stat: string;
  minValue: number;
  maxValue: number;
  isPercentage: boolean;
  legendaryBonus?: string;
}

export const ENCHANT_POOLS: EnchantTemplate[] = [
  // OFFENSIVE
  { name: 'Damage Boost', group: 'offensive', slots: ['weapon'], stat: 'meleeAttack', minValue: 4, maxValue: 15, isPercentage: true, legendaryBonus: '+5% on kill for 10s' },
  { name: 'Armor Penetration', group: 'offensive', slots: ['weapon'], stat: 'armorPen', minValue: 3, maxValue: 12, isPercentage: true },
  // CRITICAL
  { name: 'Critical Chance', group: 'critical', slots: ['weapon', 'gloves', 'ring', 'necklace'], stat: 'critChance', minValue: 3, maxValue: 10, isPercentage: true },
  { name: 'Critical Damage', group: 'critical', slots: ['weapon', 'gloves', 'necklace'], stat: 'critDamage', minValue: 8, maxValue: 25, isPercentage: true },
  // HEALTH
  { name: 'HP Regen', group: 'health', slots: ['armor', 'legs', 'earring', 'necklace'], stat: 'hpRegen', minValue: 1, maxValue: 4, isPercentage: false },
  { name: 'Max HP', group: 'health', slots: ['armor', 'legs', 'ring', 'necklace'], stat: 'maxHp', minValue: 3, maxValue: 10, isPercentage: true },
  // DEFENSIVE
  { name: 'Defense Boost', group: 'defensive', slots: ['armor', 'legs', 'boots', 'shield'], stat: 'defense', minValue: 4, maxValue: 15, isPercentage: true },
  { name: 'Damage Reduction', group: 'defensive', slots: ['armor', 'shield', 'necklace'], stat: 'damageReduction', minValue: 1, maxValue: 5, isPercentage: true },
  // UTILITY
  { name: 'Turn Speed', group: 'utility', slots: ['boots', 'gloves', 'ring'], stat: 'turnSpeed', minValue: 3, maxValue: 10, isPercentage: false },
  { name: 'Evasion', group: 'utility', slots: ['boots', 'legs', 'armor'], stat: 'evasion', minValue: 2, maxValue: 6, isPercentage: true },
  // RESISTANCE
  { name: 'Status Resist', group: 'resistance', slots: ['armor', 'earring', 'ring'], stat: 'statusResist', minValue: 4, maxValue: 15, isPercentage: true },
  // ELEMENTAL
  { name: 'Burn on Hit', group: 'elemental', slots: ['weapon'], stat: 'burnDot', minValue: 2, maxValue: 6, isPercentage: true },
  { name: 'Frost Slow', group: 'elemental', slots: ['weapon'], stat: 'frostSlow', minValue: 5, maxValue: 15, isPercentage: false },
  // LUCK
  { name: 'Drop Bonus', group: 'luck', slots: ['ring', 'necklace', 'earring'], stat: 'dropChance', minValue: 2, maxValue: 8, isPercentage: true },
];

export function getEnchantsForSlot(slot: string): EnchantTemplate[] {
  return ENCHANT_POOLS.filter(e => e.slots.includes(slot));
}

// ============================
// RARITY BONUS POOLS (random stats that roll on Rare/Unique/Plague)
// ============================

export interface BonusPool {
  slot: string;
  stat: string;
  minValue: number;
  maxValue: number;
  isPercentage: boolean;
}

export const BONUS_POOLS: BonusPool[] = [
  // Weapon bonuses
  { slot: 'weapon', stat: 'critChance', minValue: 2, maxValue: 5, isPercentage: true },
  { slot: 'weapon', stat: 'critDamage', minValue: 5, maxValue: 12, isPercentage: true },
  { slot: 'weapon', stat: 'accuracy', minValue: 3, maxValue: 8, isPercentage: true },
  { slot: 'weapon', stat: 'turnSpeed', minValue: 3, maxValue: 8, isPercentage: false },
  // Armor bonuses
  { slot: 'armor', stat: 'defense', minValue: 5, maxValue: 15, isPercentage: false },
  { slot: 'armor', stat: 'maxHp', minValue: 20, maxValue: 50, isPercentage: false },
  { slot: 'armor', stat: 'hpRegen', minValue: 1, maxValue: 3, isPercentage: false },
  { slot: 'armor', stat: 'statusResist', minValue: 3, maxValue: 8, isPercentage: true },
  // Boots
  { slot: 'boots', stat: 'turnSpeed', minValue: 3, maxValue: 8, isPercentage: false },
  { slot: 'boots', stat: 'evasion', minValue: 2, maxValue: 5, isPercentage: true },
  { slot: 'boots', stat: 'defense', minValue: 2, maxValue: 6, isPercentage: false },
  // Gloves
  { slot: 'gloves', stat: 'accuracy', minValue: 3, maxValue: 8, isPercentage: true },
  { slot: 'gloves', stat: 'critChance', minValue: 2, maxValue: 5, isPercentage: true },
  { slot: 'gloves', stat: 'critDamage', minValue: 3, maxValue: 8, isPercentage: true },
  // Legs
  { slot: 'legs', stat: 'defense', minValue: 3, maxValue: 10, isPercentage: false },
  { slot: 'legs', stat: 'maxHp', minValue: 10, maxValue: 30, isPercentage: false },
  { slot: 'legs', stat: 'turnSpeed', minValue: 2, maxValue: 6, isPercentage: false },
  // Ring
  { slot: 'ring', stat: 'critChance', minValue: 1, maxValue: 3, isPercentage: true },
  { slot: 'ring', stat: 'maxHp', minValue: 5, maxValue: 15, isPercentage: false },
  // Earring
  { slot: 'earring', stat: 'statusResist', minValue: 3, maxValue: 8, isPercentage: true },
  { slot: 'earring', stat: 'hpRegen', minValue: 1, maxValue: 3, isPercentage: false },
  // Necklace
  { slot: 'necklace', stat: 'critDamage', minValue: 5, maxValue: 12, isPercentage: true },
  { slot: 'necklace', stat: 'maxHp', minValue: 15, maxValue: 35, isPercentage: false },
  { slot: 'necklace', stat: 'hpRegen', minValue: 1, maxValue: 3, isPercentage: false },
  // Shield
  { slot: 'shield', stat: 'defense', minValue: 5, maxValue: 12, isPercentage: false },
  { slot: 'shield', stat: 'maxHp', minValue: 15, maxValue: 35, isPercentage: false },
  { slot: 'shield', stat: 'blockChance', minValue: 5, maxValue: 10, isPercentage: true },
];

export function getBonusPoolForSlot(slot: string): BonusPool[] {
  return BONUS_POOLS.filter(b => b.slot === slot);
}

// Downside pool for Plague curses
export const DOWNSIDE_POOLS: BonusPool[] = [
  { slot: 'weapon', stat: 'turnSpeed', minValue: -5, maxValue: -20, isPercentage: false },
  { slot: 'weapon', stat: 'accuracy', minValue: -3, maxValue: -10, isPercentage: true },
  { slot: 'weapon', stat: 'hpRegen', minValue: -1, maxValue: -3, isPercentage: false },
  { slot: 'armor', stat: 'turnSpeed', minValue: -8, maxValue: -25, isPercentage: false },
  { slot: 'armor', stat: 'maxHp', minValue: -5, maxValue: -15, isPercentage: true },
  { slot: 'armor', stat: 'evasion', minValue: -3, maxValue: -10, isPercentage: true },
  { slot: 'boots', stat: 'turnSpeed', minValue: -5, maxValue: -15, isPercentage: false },
  { slot: 'boots', stat: 'evasion', minValue: -2, maxValue: -6, isPercentage: true },
  { slot: 'gloves', stat: 'accuracy', minValue: -2, maxValue: -6, isPercentage: true },
  { slot: 'gloves', stat: 'critChance', minValue: -1, maxValue: -4, isPercentage: true },
  { slot: 'legs', stat: 'turnSpeed', minValue: -5, maxValue: -15, isPercentage: false },
  { slot: 'ring', stat: 'hpRegen', minValue: -1, maxValue: -2, isPercentage: false },
  { slot: 'earring', stat: 'accuracy', minValue: -2, maxValue: -5, isPercentage: true },
  { slot: 'necklace', stat: 'hpRegen', minValue: -1, maxValue: -3, isPercentage: false },
  { slot: 'shield', stat: 'turnSpeed', minValue: -5, maxValue: -10, isPercentage: false },
];

export function getDownsidePoolForSlot(slot: string): BonusPool[] {
  return DOWNSIDE_POOLS.filter(b => b.slot === slot);
}

// ============================
// GREEN SET BONUS DEFINITIONS
// ============================

import type { EquipmentSet } from '../types/equipment';

export const EQUIPMENT_SETS: Record<string, EquipmentSet> = {
  set_survivor: {
    id: 'set_survivor', name: "Survivor's Outfit", description: 'Early game gathering set. Helps new survivors thrive.',
    tier: 'early', type: 'gathering',
    pieces: ['survivor_vest', 'survivor_pants', 'survivor_gloves', 'survivor_boots', 'survivor_ring', 'survivor_earring'],
    bonuses: [
      { piecesRequired: 2, description: '+5% gathering speed', effects: [{ stat: 'gatheringSpeed', value: 5, isPercentage: true }] },
      { piecesRequired: 3, description: '+10% gathering yield', effects: [{ stat: 'gatheringYield', value: 10, isPercentage: true }] },
      { piecesRequired: 4, description: '+20 Max HP, +1 HP Regen', effects: [{ stat: 'maxHp', value: 20, isPercentage: false }, { stat: 'hpRegen', value: 1, isPercentage: false }] },
      { piecesRequired: 5, description: '+5% XP gain (all skills)', effects: [{ stat: 'xpBonus', value: 5, isPercentage: true }] },
      { piecesRequired: 6, description: '+15% gathering speed, +10% rare resource chance, -50% worker death risk', effects: [
        { stat: 'gatheringSpeed', value: 15, isPercentage: true },
        { stat: 'rareResourceChance', value: 10, isPercentage: true },
        { stat: 'workerDeathReduction', value: 50, isPercentage: true },
      ] },
    ],
  },
  set_raider: {
    id: 'set_raider', name: "Raider's Armor", description: 'Mid-game heavy combat plate. Built for war.',
    tier: 'mid', type: 'combat',
    pieces: ['raider_plate', 'raider_legguards', 'raider_gauntlets', 'raider_boots', 'raider_shield', 'raider_ring'],
    bonuses: [
      { piecesRequired: 2, description: '+15 Defense, +20 Max HP', effects: [{ stat: 'defense', value: 15, isPercentage: false }, { stat: 'maxHp', value: 20, isPercentage: false }] },
      { piecesRequired: 3, description: '+5% Damage Reduction', effects: [{ stat: 'damageReduction', value: 5, isPercentage: true }] },
      { piecesRequired: 4, description: '+10% melee attack, +3 HP Regen', effects: [{ stat: 'meleeAttack', value: 10, isPercentage: true }, { stat: 'hpRegen', value: 3, isPercentage: false }] },
      { piecesRequired: 5, description: '+25% Block Chance, +50 Max HP', effects: [{ stat: 'blockChance', value: 25, isPercentage: true }, { stat: 'maxHp', value: 50, isPercentage: false }] },
      { piecesRequired: 6, description: '+10% all combat stats, +8% Damage Reduction, immune to first stun per fight', effects: [
        { stat: 'allAttack', value: 10, isPercentage: true },
        { stat: 'damageReduction', value: 8, isPercentage: true },
        { stat: 'stunImmunityOnce', value: 1, isPercentage: false },
      ] },
    ],
  },
  set_forager: {
    id: 'set_forager', name: "Forager's Garb", description: 'Mid-game gathering and production leather set.',
    tier: 'mid', type: 'gathering',
    pieces: ['forager_vest', 'forager_pants', 'forager_gloves', 'forager_boots', 'forager_pendant', 'forager_earring'],
    bonuses: [
      { piecesRequired: 2, description: '+10% gathering speed', effects: [{ stat: 'gatheringSpeed', value: 10, isPercentage: true }] },
      { piecesRequired: 3, description: '+15% gathering yield, +5% production speed', effects: [{ stat: 'gatheringYield', value: 15, isPercentage: true }, { stat: 'productionSpeed', value: 5, isPercentage: true }] },
      { piecesRequired: 4, description: '+8% XP gain, +10% Turn Speed', effects: [{ stat: 'xpBonus', value: 8, isPercentage: true }, { stat: 'turnSpeed', value: 10, isPercentage: false }] },
      { piecesRequired: 5, description: '+20% rare resource chance, +10% production speed', effects: [{ stat: 'rareResourceChance', value: 20, isPercentage: true }, { stat: 'productionSpeed', value: 10, isPercentage: true }] },
      { piecesRequired: 6, description: '+25% gathering yield, +15% crafting rarity upgrade, no worker deaths', effects: [
        { stat: 'gatheringYield', value: 25, isPercentage: true },
        { stat: 'rarityUpgrade', value: 15, isPercentage: true },
        { stat: 'workerDeathReduction', value: 100, isPercentage: true },
      ] },
    ],
  },
  set_warlord: {
    id: 'set_warlord', name: "Warlord's Regalia", description: 'Endgame heavy combat set. Feared across the wasteland.',
    tier: 'endgame', type: 'combat',
    pieces: ['warlord_breastplate', 'warlord_legplates', 'warlord_gauntlets', 'warlord_boots', 'warlord_shield', 'warlord_ring', 'warlord_pendant'],
    bonuses: [
      { piecesRequired: 2, description: '+30 Defense, +50 Max HP', effects: [{ stat: 'defense', value: 30, isPercentage: false }, { stat: 'maxHp', value: 50, isPercentage: false }] },
      { piecesRequired: 3, description: '+8% Damage Reduction, +4 HP Regen', effects: [{ stat: 'damageReduction', value: 8, isPercentage: true }, { stat: 'hpRegen', value: 4, isPercentage: false }] },
      { piecesRequired: 4, description: '+15% melee attack, +8% Crit Chance', effects: [{ stat: 'meleeAttack', value: 15, isPercentage: true }, { stat: 'critChance', value: 8, isPercentage: true }] },
      { piecesRequired: 5, description: '+100 Max HP, +10% all attack, +5% Evasion', effects: [{ stat: 'maxHp', value: 100, isPercentage: false }, { stat: 'allAttack', value: 10, isPercentage: true }, { stat: 'evasion', value: 5, isPercentage: true }] },
      { piecesRequired: 6, description: '+15% Damage Reduction, +20% all combat stats, auto-revive once per fight', effects: [
        { stat: 'damageReduction', value: 15, isPercentage: true },
        { stat: 'allAttack', value: 20, isPercentage: true },
        { stat: 'autoRevive', value: 1, isPercentage: false },
      ] },
      { piecesRequired: 7, description: '+25% all stats, +200 Max HP, immune to first 2 debuffs per fight', effects: [
        { stat: 'allStats', value: 25, isPercentage: true },
        { stat: 'maxHp', value: 200, isPercentage: false },
        { stat: 'debuffImmunity', value: 2, isPercentage: false },
      ] },
    ],
  },
  set_artisan: {
    id: 'set_artisan', name: "Artisan's Ensemble", description: 'Endgame production/gathering set. Master crafter gear.',
    tier: 'endgame', type: 'production',
    pieces: ['artisan_vest', 'artisan_pants', 'artisan_gloves', 'artisan_boots', 'artisan_earring', 'artisan_pendant'],
    bonuses: [
      { piecesRequired: 2, description: '+15% gathering speed, +10% production speed', effects: [{ stat: 'gatheringSpeed', value: 15, isPercentage: true }, { stat: 'productionSpeed', value: 10, isPercentage: true }] },
      { piecesRequired: 3, description: '+20% gathering yield, +15% crafting rarity upgrade', effects: [{ stat: 'gatheringYield', value: 20, isPercentage: true }, { stat: 'rarityUpgrade', value: 15, isPercentage: true }] },
      { piecesRequired: 4, description: '+15% XP gain, +10% rare resource chance, +5% all attack', effects: [{ stat: 'xpBonus', value: 15, isPercentage: true }, { stat: 'rareResourceChance', value: 10, isPercentage: true }, { stat: 'allAttack', value: 5, isPercentage: true }] },
      { piecesRequired: 5, description: '+30% gathering yield, +20% production speed, +10% worker XP', effects: [
        { stat: 'gatheringYield', value: 30, isPercentage: true },
        { stat: 'productionSpeed', value: 20, isPercentage: true },
        { stat: 'workerXpBonus', value: 10, isPercentage: true },
      ] },
      { piecesRequired: 6, description: '+25% crafting rarity upgrade, +40% gathering yield, double output chance +10%, no worker deaths', effects: [
        { stat: 'rarityUpgrade', value: 25, isPercentage: true },
        { stat: 'gatheringYield', value: 40, isPercentage: true },
        { stat: 'doubleOutput', value: 10, isPercentage: true },
        { stat: 'workerDeathReduction', value: 100, isPercentage: true },
      ] },
    ],
  },
};
