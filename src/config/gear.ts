import type { GearTemplate, Aspect, StatBonus } from '../types/equipment';
import type { Job2ClassId } from '../types/hero';

// ============================
// GEAR TEMPLATES (representative set per tier)
// ============================

// Helper to build gear templates concisely
function w(id: string, name: string, tier: number, lvl: number, wtype: 'melee'|'ranger'|'demolitions', twoH: boolean, reqs: [string,number][], stats: [string,number,boolean][], downside: [string,number,boolean]|null, inputs: [string,number][], skill: string, skillLvl: number, xp: number, prevTier?: string, setId?: string, desc?: string): GearTemplate {
  return { id, name, description: desc, slot: 'weapon', tier, levelReq: lvl, weaponType: wtype, isTwoHanded: twoH, statRequirements: reqs.map(([s,v])=>({stat:s as any,value:v})), baseStats: stats.map(([s,v,p])=>({stat:s,value:v,isPercentage:p})), inherentDownside: downside ? {stat:downside[0],value:downside[1],isPercentage:downside[2]} : undefined, craftingInputs: inputs.map(([r,q])=>({resourceId:r,quantity:q})), craftSkillId: skill, craftSkillLevel: skillLvl, craftXp: xp, requiresPreviousTier: prevTier, setId };
}
/** Weapon helper for Job2 signature weapons (includes job2ClassReq) */
function w2(id: string, name: string, tier: number, lvl: number, wtype: 'melee'|'ranger'|'demolitions', twoH: boolean, stats: [string,number,boolean][], downside: [string,number,boolean]|null, inputs: [string,number][], skill: string, skillLvl: number, xp: number, job2: Job2ClassId, prevTier?: string): GearTemplate {
  return { id, name, slot: 'weapon', tier, levelReq: lvl, weaponType: wtype, isTwoHanded: twoH, statRequirements: [], baseStats: stats.map(([s,v,p])=>({stat:s,value:v,isPercentage:p})), inherentDownside: downside ? {stat:downside[0],value:downside[1],isPercentage:downside[2]} : undefined, craftingInputs: inputs.map(([r,q])=>({resourceId:r,quantity:q})), craftSkillId: skill, craftSkillLevel: skillLvl, craftXp: xp, job2ClassReq: job2, requiresPreviousTier: prevTier };
}
/** Armor/shield helper for Job2 signature off-hands (includes job2ClassReq) */
function a2(id: string, name: string, tier: number, lvl: number, slotCat: string, stats: [string,number,boolean][], inputs: [string,number][], skill: string, skillLvl: number, xp: number, job2: Job2ClassId, prevTier?: string): GearTemplate {
  return { id, name, slot: slotCat as any, tier, levelReq: lvl, statRequirements: [], baseStats: stats.map(([s,v,p])=>({stat:s,value:v,isPercentage:p})), craftingInputs: inputs.map(([r,q])=>({resourceId:r,quantity:q})), craftSkillId: skill, craftSkillLevel: skillLvl, craftXp: xp, job2ClassReq: job2, requiresPreviousTier: prevTier };
}
function a(id: string, name: string, tier: number, lvl: number, slotCat: string, reqs: [string,number][], stats: [string,number,boolean][], downside: [string,number,boolean]|null, inputs: [string,number][], skill: string, skillLvl: number, xp: number, prevTier?: string, setId?: string, desc?: string): GearTemplate {
  return { id, name, description: desc, slot: slotCat as any, tier, levelReq: lvl, statRequirements: reqs.map(([s,v])=>({stat:s as any,value:v})), baseStats: stats.map(([s,v,p])=>({stat:s,value:v,isPercentage:p})), inherentDownside: downside ? {stat:downside[0],value:downside[1],isPercentage:downside[2]} : undefined, craftingInputs: inputs.map(([r,q])=>({resourceId:r,quantity:q})), craftSkillId: skill, craftSkillLevel: skillLvl, craftXp: xp, requiresPreviousTier: prevTier, setId };
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
  sharpened_pipe: w('sharpened_pipe','Sharpened Pipe',1,1,'melee',false,[],[['meleeAttack',8,false]],null,[[RP,3],[SM,2]],WS,1,25,undefined,undefined,'A crude iron pipe filed to a point. Reliable and hard-hitting.'),
  rusty_machete: w('rusty_machete','Rusty Machete',1,1,'melee',false,[],[['meleeAttack',10,false],['critChance',2,true]],null,[[SM,4],[IO,2]],WS,1,30,undefined,undefined,'A scavenged blade with a keen edge. Faster swings and better crit.'),
  scrap_bow: w('scrap_bow','Scrap Bow',1,1,'ranger',true,[],[['rangedAttack',9,false],['accuracy',2,true]],null,[[SW,3],[SM,2]],WS,1,25,undefined,undefined,'Makeshift bow from salvaged materials. Steady and precise at range. Requires both hands.'),
  slingshot: w('slingshot','Slingshot',1,1,'ranger',false,[],[['rangedAttack',6,false],['turnSpeed',3,false]],null,[[SW,2],[RP,2]],WS,1,20,undefined,undefined,'A simple sling weapon. Quick to fire but lower damage.'),
  pipe_bomb: w('pipe_bomb','Pipe Bomb',1,1,'demolitions',false,[],[['blastAttack',10,false]],['selfDamage',3,true],[[RP,3],[CF,2]],WS,1,25,undefined,undefined,'Unstable explosive. Devastating blast damage but dangerous to handle.'),
  molotov: w('molotov','Molotov Cocktail',1,1,'demolitions',false,[],[['blastAttack',7,false]],null,[[CF,2],[SW,1]],WS,1,20,undefined,undefined,'A bottle of flammable waste. Burns targets on impact.'),
  // T1 ARMOR/GEAR (Level 1)
  patched_vest: a('patched_vest','Patched Vest',1,1,'armor',[],[['defense',5,false],['maxHp',10,false]],null,[[SM,5],[SW,2]],AC,1,25,undefined,undefined,'Layered fabric and leather patches. Basic torso protection.'),
  cloth_wrappings: a('cloth_wrappings','Cloth Wrappings',1,1,'armor',[],[['defense',3,false],['turnSpeed',3,false]],null,[[MR,4],[WH,3]],AC,1,20,undefined,undefined,'Strips of cloth wound tight. Light and flexible, but minimal protection.'),
  scrap_greaves: a('scrap_greaves','Scrap Greaves',1,1,'legs',[],[['defense',3,false],['maxHp',8,false]],null,[[SM,4],[IO,2]],AC,1,20,undefined,undefined,'Scrap metal shaped into crude leg guards.'),
  worn_gloves: a('worn_gloves','Worn Gloves',1,1,'gloves',[],[['accuracy',2,true],['defense',2,false]],null,[[MR,3],[SM,2]],AC,1,18,undefined,undefined,'Thick leather gloves, worn but functional.'),
  wasteland_boots: a('wasteland_boots','Wasteland Boots',1,1,'boots',[],[['turnSpeed',3,false],['defense',2,false]],null,[[MR,3],[IO,2]],AC,1,18,undefined,undefined,'Heavy boots for rough terrain.'),
  scrap_buckler: a('scrap_buckler','Scrap Buckler',1,1,'shield',[],[['defense',4,false],['blockChance',5,true]],null,[[SM,5],[SW,3]],AC,1,22,undefined,undefined,'A small shield hammered from scrap metal.'),
  rusty_ring: a('rusty_ring','Rusty Ring',1,1,'ring',[],[['maxHp',5,false]],null,[[IO,3],[CO,2]],TK,1,15),
  bone_earring: a('bone_earring','Bone Earring',1,1,'earring',[],[['statusResist',2,true]],null,[[MR,3],[CO,1]],TK,1,12),
  scrap_pendant: a('scrap_pendant','Scrap Pendant',1,1,'necklace',[],[['maxHp',8,false],['hpRegen',0.5,false]],null,[[CO,3],[IO,2]],TK,1,18),

  // =====================================================================
  // T2 WEAPONS (Level 15)
  // =====================================================================
  spiked_club: w('spiked_club','Spiked Club',2,15,'melee',false,[['str',10]],[['meleeAttack',22,false],['maxHp',15,false]],['turnSpeed',-8,false],[[SW,8],[IO,5],[SM,3]],WS,15,60,'sharpened_pipe',undefined,'A heavy club studded with nails. Slow but punishing.'),
  raiders_cleaver: w('raiders_cleaver',"Raider's Cleaver",2,15,'melee',false,[['str',8],['dex',5]],[['meleeAttack',20,false],['critChance',3,true]],['maxHp',-5,true],[[IO,6],[SM,4],[CF,3]],WS,15,60,'rusty_machete',undefined,'A salvaged raider blade. Sharp and deadly at close range.'),
  pipe_pistol: w('pipe_pistol','Pipe Pistol',2,15,'ranger',false,[['dex',10]],[['rangedAttack',20,false],['turnSpeed',8,false]],['accuracy',-5,true],[[RP,6],[MP,4],[CF,3]],WS,15,60,'slingshot',undefined,'A crude firearm cobbled from pipes. Fast but inaccurate.'),
  hunting_crossbow: w('hunting_crossbow','Hunting Crossbow',2,15,'ranger',true,[['dex',8],['per',5]],[['rangedAttack',18,false],['accuracy',5,true],['critChance',3,true]],['turnSpeed',-5,false],[[SW,5],[MP,4],[IO,3]],WS,15,60,'scrap_bow',undefined,'A sturdy crossbow built for hunting. Accurate and lethal.'),
  frag_grenade: w('frag_grenade','Frag Grenade',2,15,'demolitions',false,[['int',10]],[['blastAttack',22,false],['critDamage',5,true]],['selfDamage',4,true],[[SM,5],[CF,4],[IO,3]],WS,15,60,'pipe_bomb',undefined,'Military-grade fragmentation device. Deadly shrapnel in all directions.'),
  incendiary_mine: w('incendiary_mine','Incendiary Mine',2,15,'demolitions',false,[['int',8],['per',5]],[['blastAttack',20,false],['critChance',5,true]],['turnSpeed',-5,false],[[CF,6],[EC,4],[SM,3]],WS,15,60,'molotov',undefined,'A proximity-triggered fire trap. Sets the ground ablaze.'),
  // T2 ARMOR (Level 15)
  scrap_plate_chest: a('scrap_plate_chest','Scrap Plate Chest',2,15,'armor',[['str',10]],[['defense',18,false],['maxHp',30,false]],['turnSpeed',-10,false],[[IO,8],[SM,6],[RS,3]],AC,15,55,'patched_vest'),
  leather_duster: a('leather_duster','Leather Duster',2,15,'armor',[['dex',8]],[['defense',12,false],['turnSpeed',8,false],['evasion',3,true]],['maxHp',-5,true],[[MR,6],[SM,5],[CF,3]],AC,15,55,'cloth_wrappings'),
  padded_lab_coat: a('padded_lab_coat','Padded Lab Coat',2,15,'armor',[['int',8]],[['defense',10,false],['statusResist',5,true],['critDamage',3,true]],['maxHp',-5,true],[[MR,5],[EC,4],[CF,3]],AC,15,55,'cloth_wrappings'),
  iron_legguards: a('iron_legguards','Iron Legguards',2,15,'legs',[['str',8]],[['defense',8,false],['maxHp',20,false]],['turnSpeed',-5,false],[[IO,6],[SM,4]],AC,15,45,'scrap_greaves'),
  scout_pants: a('scout_pants','Scout Pants',2,15,'legs',[['dex',8]],[['defense',5,false],['turnSpeed',5,false],['evasion',2,true]],['maxHp',-3,true],[[MR,5],[CF,3]],AC,15,45,'scrap_greaves'),
  iron_gauntlets: a('iron_gauntlets','Iron Gauntlets',2,15,'gloves',[['str',8]],[['defense',5,false],['accuracy',3,true]],['turnSpeed',-3,false],[[IO,5],[SM,3]],AC,15,40,'worn_gloves'),
  marksman_gloves: a('marksman_gloves','Marksman Gloves',2,15,'gloves',[['dex',8]],[['accuracy',5,true],['critChance',2,true]],['defense',-2,false],[[MR,4],[CF,3]],AC,15,40,'worn_gloves'),
  iron_boots: a('iron_boots','Iron Boots',2,15,'boots',[['str',8]],[['defense',5,false],['maxHp',12,false]],['turnSpeed',-5,false],[[IO,5],[SM,3]],AC,15,38,'wasteland_boots'),
  scout_boots: a('scout_boots','Scout Boots',2,15,'boots',[['dex',8]],[['turnSpeed',8,false],['evasion',3,true]],['defense',-3,false],[[MR,4],[CF,3]],AC,15,38,'wasteland_boots'),
  iron_shield: a('iron_shield','Iron Shield',2,15,'shield',[['str',10]],[['defense',10,false],['blockChance',8,true],['maxHp',15,false]],['turnSpeed',-8,false],[[IO,8],[SM,5],[RS,3]],AC,15,50,'scrap_buckler'),
  copper_band: a('copper_band','Copper Band',2,15,'ring',[],[['maxHp',12,false],['critChance',1,true]],null,[[CO,5],[IO,3]],TK,15,30,'rusty_ring'),
  wire_earring: a('wire_earring','Wire Earring',2,15,'earring',[],[['statusResist',4,true],['hpRegen',0.5,false]],null,[[EC,3],[CO,2]],TK,15,25,'bone_earring'),
  gear_pendant: a('gear_pendant','Gear Pendant',2,15,'necklace',[],[['maxHp',15,false],['critDamage',3,true],['hpRegen',1,false]],null,[[MP,4],[CO,3],[IO,2]],TK,15,35,'scrap_pendant'),

  // =====================================================================
  // T3 WEAPONS (Level 30)
  // =====================================================================
  war_axe: w('war_axe','War Axe',3,30,'melee',true,[['str',20]],[['meleeAttack',38,false],['maxHp',25,false],['critChance',3,true]],['turnSpeed',-12,false],[[IO,12],[SM,8],[SW,4]],WS,30,120,'spiked_club',undefined,'A brutal two-handed axe forged from salvaged steel. Cleaves through armor.'),
  serrated_blade: w('serrated_blade','Serrated Blade',3,30,'melee',false,[['str',15],['dex',10]],[['meleeAttack',35,false],['critChance',5,true],['turnSpeed',5,false]],['maxHp',-8,true],[[IO,10],[CO,6],[CF,5]],WS,30,120,'raiders_cleaver',undefined,'A jagged-edged sword that tears flesh. Bleeds targets with every cut.'),
  bolt_action_rifle: w('bolt_action_rifle','Bolt-Action Rifle',3,30,'ranger',true,[['dex',20]],[['rangedAttack',35,false],['accuracy',8,true],['critChance',5,true]],['turnSpeed',-10,false],[[IO,10],[RP,6],[MP,5]],WS,30,120,'hunting_crossbow',undefined,'A precision rifle with a hand-machined barrel. Deadly accurate at range.'),
  twin_pistols: w('twin_pistols','Twin Pistols',3,30,'ranger',false,[['dex',15],['per',10]],[['rangedAttack',30,false],['turnSpeed',15,false],['critChance',4,true]],['accuracy',-8,true],[[RP,8],[MP,6],[CO,5]],WS,30,120,'pipe_pistol',undefined,'A matched pair of handguns. Spray and pray, wasteland style.'),
  concussion_launcher: w('concussion_launcher','Concussion Launcher',3,30,'demolitions',true,[['int',20]],[['blastAttack',38,false],['critDamage',10,true]],['selfDamage',5,true],[[RP,10],[CF,8],[MP,5]],WS,30,120,'frag_grenade',undefined,'A shoulder-mounted launcher firing concussive shells. Devastates groups.'),
  cluster_mine: w('cluster_mine','Cluster Mine',3,30,'demolitions',false,[['int',15],['per',10]],[['blastAttack',34,false],['critChance',8,true]],['turnSpeed',-8,false],[[SM,8],[CF,6],[EC,5]],WS,30,120,'incendiary_mine',undefined,'A network of linked explosives. Triggers a chain of deadly blasts.'),
  // T3 ARMOR (Level 30)
  iron_breastplate: a('iron_breastplate','Iron Breastplate',3,30,'armor',[['str',20]],[['defense',32,false],['maxHp',50,false],['hpRegen',1,false]],['turnSpeed',-15,false],[[IO,15],[SM,8],[RS,5]],AC,30,110,'scrap_plate_chest'),
  rangers_hide: a('rangers_hide',"Ranger's Hide",3,30,'armor',[['dex',18]],[['defense',22,false],['turnSpeed',12,false],['evasion',6,true]],['maxHp',-8,true],[[MR,10],[CF,6],[SM,4]],AC,30,110,'leather_duster'),
  insulated_vest: a('insulated_vest','Insulated Tech Vest',3,30,'armor',[['int',18]],[['defense',20,false],['statusResist',10,true],['critDamage',8,true]],['maxHp',-8,true],[[EC,8],[CF,5],[SM,4]],AC,30,110,'padded_lab_coat'),
  iron_legplates: a('iron_legplates','Iron Legplates',3,30,'legs',[['str',15]],[['defense',14,false],['maxHp',30,false],['turnSpeed',-5,false]],null,[[IO,10],[SM,6],[RS,3]],AC,30,90,'iron_legguards'),
  combat_gauntlets: a('combat_gauntlets','Combat Gauntlets',3,30,'gloves',[['str',15]],[['defense',8,false],['accuracy',5,true],['critChance',3,true]],['turnSpeed',-4,false],[[IO,8],[SM,5],[MP,3]],AC,30,80,'iron_gauntlets'),
  strider_boots: a('strider_boots','Strider Boots',3,30,'boots',[['dex',15]],[['turnSpeed',10,false],['evasion',4,true],['defense',5,false]],['maxHp',-4,true],[[MR,6],[CF,4],[IO,3]],AC,30,80,'scout_boots'),
  tower_shield: a('tower_shield','Tower Shield',3,30,'shield',[['str',18]],[['defense',18,false],['blockChance',12,true],['maxHp',25,false]],['turnSpeed',-12,false],[[IO,12],[RS,8],[SM,5]],AC,30,100,'iron_shield'),
  alloy_ring: a('alloy_ring','Alloy Ring',3,30,'ring',[],[['maxHp',18,false],['critChance',2,true],['defense',3,false]],null,[[CO,6],[IO,4],[MP,2]],TK,30,45,'copper_band'),
  circuit_earring: a('circuit_earring','Circuit Earring',3,30,'earring',[],[['statusResist',6,true],['hpRegen',1,false],['maxHp',10,false]],null,[[EC,5],[CO,3]],TK,30,40,'wire_earring'),
  motor_pendant: a('motor_pendant','Motor Pendant',3,30,'necklace',[],[['maxHp',25,false],['critDamage',6,true],['hpRegen',1.5,false]],null,[[MP,6],[CO,4],[EC,3]],TK,30,55,'gear_pendant'),

  // =====================================================================
  // T4 WEAPONS (Level 45)
  // =====================================================================
  reinforced_mace: w('reinforced_mace','Reinforced Mace',4,45,'melee',false,[['str',30]],[['meleeAttack',55,false],['maxHp',40,false],['critChance',5,true]],['turnSpeed',-15,false],[[IO,18],[SM,12],[MP,6]],WS,45,200,'war_axe',undefined,'An iron mace reinforced with welded plates. Crushes bones and armor alike.'),
  assassins_dirk: w('assassins_dirk',"Assassin's Dirk",4,45,'melee',false,[['str',20],['dex',20]],[['meleeAttack',48,false],['critChance',8,true],['turnSpeed',10,false]],['maxHp',-10,true],[[IO,15],[CO,8],[CF,8]],WS,45,200,'serrated_blade',undefined,'A sleek dagger for surgical strikes. Finds gaps in any defense.'),
  scoped_carbine: w('scoped_carbine','Scoped Carbine',4,45,'ranger',true,[['dex',30]],[['rangedAttack',52,false],['accuracy',12,true],['critChance',8,true]],['turnSpeed',-12,false],[[IO,15],[RP,10],[MP,8],[EC,4]],WS,45,200,'bolt_action_rifle',undefined,'A rifle fitted with salvaged optics. Pinpoint accuracy at extreme range.'),
  repeater_crossbow: w('repeater_crossbow','Repeater Crossbow',4,45,'ranger',false,[['dex',20],['per',15]],[['rangedAttack',48,false],['turnSpeed',10,false],['critChance',10,true]],['maxHp',-8,true],[[SW,12],[MP,10],[IO,6],[CF,4]],WS,45,200,'twin_pistols',undefined,'A magazine-fed crossbow with rapid fire capability. Rains bolts downrange.'),
  rocket_launcher: w('rocket_launcher','Rocket Launcher',4,45,'demolitions',true,[['int',30]],[['blastAttack',55,false],['critDamage',15,true]],['selfDamage',6,true],[[RP,15],[CF,12],[MP,8],[EC,5]],WS,45,200,'concussion_launcher',undefined,'A shoulder-mounted rocket tube. Area devastation at any range.'),
  toxic_gas_canister: w('toxic_gas_canister','Toxic Gas Canister',4,45,'demolitions',false,[['int',20],['con',15]],[['blastAttack',48,false],['critChance',6,true]],['selfDamage',4,true],[[CF,12],[MR,8],[EC,5]],WS,45,200,'cluster_mine',undefined,'A pressurized canister of chemical warfare agents. Chokes the battlefield.'),
  // T4 ARMOR (Level 45)
  plated_war_armor: a('plated_war_armor','Plated War Armor',4,45,'armor',[['str',30]],[['defense',48,false],['maxHp',80,false],['hpRegen',2,false]],['turnSpeed',-20,false],[[IO,22],[SM,15],[RS,8],[MP,5]],AC,45,180,'iron_breastplate'),
  shadow_leathers: a('shadow_leathers','Shadow Leathers',4,45,'armor',[['dex',28]],[['defense',34,false],['turnSpeed',18,false],['evasion',10,true]],['maxHp',-10,true],[[MR,12],[CF,8],[EC,5],[SM,4]],AC,45,180,'rangers_hide'),
  hazmat_suit: a('hazmat_suit','Hazmat Suit',4,45,'armor',[['int',28]],[['defense',30,false],['statusResist',15,true],['critDamage',12,true]],['evasion',-8,true],[[EC,10],[CF,8],[MR,6],[SM,4]],AC,45,180,'insulated_vest'),
  plated_legguards: a('plated_legguards','Plated Legguards',4,45,'legs',[['str',22]],[['defense',22,false],['maxHp',45,false]],['turnSpeed',-8,false],[[IO,14],[SM,8],[RS,5]],AC,45,150,'iron_legplates'),
  precision_gauntlets: a('precision_gauntlets','Precision Gauntlets',4,45,'gloves',[['dex',22]],[['accuracy',8,true],['critChance',5,true],['critDamage',5,true]],['defense',-4,false],[[CO,8],[MP,6],[CF,4]],AC,45,140,'combat_gauntlets'),
  plated_boots: a('plated_boots','Plated Boots',4,45,'boots',[['str',20]],[['defense',10,false],['maxHp',25,false],['turnSpeed',-3,false]],null,[[IO,10],[SM,6],[RS,4]],AC,45,130,'strider_boots'),
  bulwark_shield: a('bulwark_shield','Bulwark Shield',4,45,'shield',[['str',25]],[['defense',25,false],['blockChance',15,true],['maxHp',40,false]],['turnSpeed',-15,false],[[IO,16],[RS,10],[SM,8]],AC,45,160,'tower_shield'),
  titanium_ring: a('titanium_ring','Titanium Ring',4,45,'ring',[],[['maxHp',25,false],['critChance',3,true],['defense',5,false]],null,[[CO,8],[IO,6],[MP,4]],TK,45,60,'alloy_ring'),
  hydraulic_earring: a('hydraulic_earring','Hydraulic Earring',4,45,'earring',[],[['statusResist',8,true],['hpRegen',1.5,false],['maxHp',15,false]],null,[[MP,6],[CF,4],[CO,3]],TK,45,55,'circuit_earring'),
  fusion_pendant: a('fusion_pendant','Fusion Pendant',4,45,'necklace',[],[['maxHp',35,false],['critDamage',8,true],['hpRegen',2,false]],null,[[EC,8],[MP,5],[CO,4]],TK,45,70,'motor_pendant'),

  // =====================================================================
  // T5 WEAPONS (Level 60)
  // =====================================================================
  warlords_hammer: w('warlords_hammer',"Warlord's Hammer",5,60,'melee',true,[['str',45]],[['meleeAttack',78,false],['maxHp',60,false],['critChance',8,true],['hpRegen',2,false]],['turnSpeed',-20,false],[[IO,25],[SM,15],[MP,10],[CF,5]],WS,60,350,'reinforced_mace',undefined,"A massive war hammer that shakes the earth. Only the strongest can wield it."),
  shadow_fang: w('shadow_fang','Shadow Fang',5,60,'melee',false,[['str',30],['dex',30]],[['meleeAttack',70,false],['critChance',12,true],['turnSpeed',15,false]],['maxHp',-12,true],[[IO,20],[CO,12],[CF,10],[EC,5]],WS,60,350,'assassins_dirk',undefined,'A blade that seems to drink the light. Strikes from the shadows.'),
  marksmans_rifle: w('marksmans_rifle',"Marksman's Rifle",5,60,'ranger',true,[['dex',45]],[['rangedAttack',75,false],['accuracy',15,true],['critChance',10,true],['turnSpeed',5,false]],['critChance',-8,true],[[IO,20],[RP,15],[MP,10],[EC,8]],WS,60,350,'scoped_carbine',undefined,'A precision-engineered rifle with advanced optics. One shot, one kill.'),
  dual_revolvers: w('dual_revolvers','Dual Revolvers',5,60,'ranger',false,[['dex',30],['per',25]],[['rangedAttack',68,false],['turnSpeed',20,false],['critChance',12,true]],['accuracy',-10,true],[[IO,18],[MP,12],[CO,10],[CF,8]],WS,60,350,'repeater_crossbow',undefined,'Matched revolvers for the fastest hands in the wasteland.'),
  siege_mortar: w('siege_mortar','Siege Mortar',5,60,'demolitions',true,[['int',45]],[['blastAttack',78,false],['critDamage',20,true]],['selfDamage',7,true],[[RP,25],[CF,18],[MP,12],[EC,8]],WS,60,350,'rocket_launcher',undefined,'A portable mortar that lobs high-explosive shells. Levels fortifications.'),
  napalm_launcher: w('napalm_launcher','Napalm Launcher',5,60,'demolitions',false,[['int',35],['con',20]],[['blastAttack',70,false],['critChance',8,true]],['selfDamage',6,true],[[CF,20],[RP,15],[MP,10],[MR,8]],WS,60,350,'toxic_gas_canister',undefined,'Sprays burning chemical gel. The fires burn long after the fight.'),
  // T5 ARMOR (Level 60)
  fortress_plate: a('fortress_plate','Fortress Plate',5,60,'armor',[['str',45]],[['defense',68,false],['maxHp',120,false],['hpRegen',3,false]],['turnSpeed',-25,false],[[IO,30],[SM,20],[RS,12],[MP,8]],AC,60,300,'plated_war_armor'),
  nightstalker_suit: a('nightstalker_suit','Nightstalker Suit',5,60,'armor',[['dex',42]],[['defense',48,false],['turnSpeed',22,false],['evasion',14,true],['critChance',5,true]],['maxHp',-12,true],[[MR,15],[CF,12],[EC,8],[SM,6]],AC,60,300,'shadow_leathers'),
  reactor_vest: a('reactor_vest','Reactor Vest',5,60,'armor',[['int',42]],[['defense',42,false],['statusResist',20,true],['critDamage',18,true]],['hpRegen',-2,false],[[EC,15],[CF,10],[CO,8],[SM,5]],AC,60,300,'hazmat_suit'),
  fortress_legplates: a('fortress_legplates','Fortress Legplates',5,60,'legs',[['str',35]],[['defense',32,false],['maxHp',65,false]],['turnSpeed',-12,false],[[IO,20],[SM,12],[RS,8]],AC,60,250,'plated_legguards'),
  deadeye_gloves: a('deadeye_gloves','Deadeye Gloves',5,60,'gloves',[['dex',35]],[['accuracy',10,true],['critChance',7,true],['critDamage',8,true]],['defense',-6,false],[[CO,12],[MP,8],[CF,6]],AC,60,240,'precision_gauntlets'),
  fortress_boots: a('fortress_boots','Fortress Boots',5,60,'boots',[['str',30]],[['defense',15,false],['maxHp',35,false]],['turnSpeed',-8,false],[[IO,14],[SM,8],[RS,6]],AC,60,220,'plated_boots'),
  siege_shield: a('siege_shield','Siege Shield',5,60,'shield',[['str',40]],[['defense',35,false],['blockChance',18,true],['maxHp',55,false]],['turnSpeed',-18,false],[[IO,22],[RS,14],[SM,10]],AC,60,270,'bulwark_shield'),
  plasma_ring: a('plasma_ring','Plasma Ring',5,60,'ring',[],[['maxHp',32,false],['critChance',4,true],['defense',7,false]],null,[[EC,10],[CO,8],[MP,5]],TK,60,80,'titanium_ring'),
  resonance_earring: a('resonance_earring','Resonance Earring',5,60,'earring',[],[['statusResist',10,true],['hpRegen',2,false],['maxHp',20,false]],null,[[EC,8],[CF,5],[CO,4]],TK,60,75,'hydraulic_earring'),
  core_pendant: a('core_pendant','Core Pendant',5,60,'necklace',[],[['maxHp',45,false],['critDamage',12,true],['hpRegen',2.5,false]],null,[[EC,12],[MP,8],[CO,6]],TK,60,90,'fusion_pendant'),

  // =====================================================================
  // T6 WEAPONS (Level 80)
  // =====================================================================
  titan_cleaver: w('titan_cleaver','Titan Cleaver',6,80,'melee',true,[['str',60]],[['meleeAttack',110,false],['maxHp',80,false],['critChance',10,true],['hpRegen',3,false]],['turnSpeed',-25,false],[[IO,40],[SM,25],[MP,15],[CF,10]],WS,80,550,'warlords_hammer',undefined,'A colossal blade forged from pre-war alloys. Splits steel and stone.'),
  phantom_blade: w('phantom_blade','Phantom Blade',6,80,'melee',false,[['str',40],['dex',40]],[['meleeAttack',95,false],['critChance',15,true],['turnSpeed',20,false],['evasion',8,true]],['maxHp',-15,true],[[IO,30],[CO,20],[CF,15],[EC,10]],WS,80,550,'shadow_fang',undefined,'A blade of impossible sharpness that phases through defenses.'),
  anti_material_rifle: w('anti_material_rifle','Anti-Material Rifle',6,80,'ranger',true,[['dex',60]],[['rangedAttack',105,false],['accuracy',18,true],['critChance',12,true],['critDamage',25,true]],['turnSpeed',-20,false],[[IO,35],[RP,20],[MP,15],[EC,10]],WS,80,550,'marksmans_rifle',undefined,'A heavy-caliber rifle designed to punch through vehicle armor.'),
  storm_repeater: w('storm_repeater','Storm Repeater',6,80,'ranger',false,[['dex',40],['per',35]],[['rangedAttack',90,false],['turnSpeed',25,false],['critChance',15,true],['evasion',10,true]],['accuracy',-12,true],[[IO,30],[MP,15],[CO,15],[CF,10]],WS,80,550,'dual_revolvers',undefined,'An automatic weapon that fires a storm of lead. Suppressive fire incarnate.'),
  plasma_bombard: w('plasma_bombard','Plasma Bombard',6,80,'demolitions',true,[['int',60]],[['blastAttack',110,false],['critDamage',30,true]],['selfDamage',8,true],[[CF,40],[EC,25],[CO,20],[MP,15]],WS,80,550,'siege_mortar',undefined,'Fires superheated plasma shells that melt through anything.'),
  radiation_emitter: w('radiation_emitter','Radiation Emitter',6,80,'demolitions',false,[['int',45],['con',30]],[['blastAttack',95,false],['critChance',10,true],['statusResist',10,true]],['selfDamage',7,true],[[CF,35],[IO,20],[MR,15]],WS,80,550,'napalm_launcher',undefined,'Emits lethal radiation waves. Irradiates everything in its path.'),
  // T6 ARMOR (Level 80)
  siege_bulwark: a('siege_bulwark','Siege Bulwark',6,80,'armor',[['str',60]],[['defense',95,false],['maxHp',160,false],['hpRegen',4,false]],['turnSpeed',-30,false],[[IO,45],[SM,30],[RS,18],[MP,12]],AC,80,480,'fortress_plate'),
  wraith_armor: a('wraith_armor','Wraith Armor',6,80,'armor',[['dex',55]],[['defense',68,false],['turnSpeed',28,false],['evasion',18,true],['critChance',8,true]],['maxHp',-15,true],[[MR,20],[CF,15],[EC,12],[SM,8]],AC,80,480,'nightstalker_suit'),
  fusion_core_suit: a('fusion_core_suit','Fusion Core Suit',6,80,'armor',[['int',55]],[['defense',60,false],['statusResist',25,true],['critDamage',25,true]],['hpRegen',-3,false],[[EC,20],[CF,15],[CO,12],[SM,8]],AC,80,480,'reactor_vest'),
  titan_legplates: a('titan_legplates','Titan Legplates',6,80,'legs',[['str',45]],[['defense',45,false],['maxHp',90,false]],['turnSpeed',-15,false],[[IO,28],[SM,16],[RS,10]],AC,80,400,'fortress_legplates'),
  assassin_gloves: a('assassin_gloves','Assassin Gloves',6,80,'gloves',[['dex',45]],[['accuracy',12,true],['critChance',10,true],['critDamage',12,true]],['defense',-8,false],[[CO,15],[MP,10],[CF,8]],AC,80,380,'deadeye_gloves'),
  titan_boots: a('titan_boots','Titan Boots',6,80,'boots',[['str',40]],[['defense',22,false],['maxHp',50,false]],['turnSpeed',-12,false],[[IO,20],[SM,12],[RS,8]],AC,80,350,'fortress_boots'),
  dreadnought_shield: a('dreadnought_shield','Dreadnought Shield',6,80,'shield',[['str',55]],[['defense',48,false],['blockChance',22,true],['maxHp',70,false]],['turnSpeed',-22,false],[[IO,30],[RS,18],[SM,12]],AC,80,420,'siege_shield'),
  quantum_ring: a('quantum_ring','Quantum Ring',6,80,'ring',[],[['maxHp',40,false],['critChance',5,true],['defense',10,false]],null,[[EC,14],[CO,10],[MP,8]],TK,80,100,'plasma_ring'),
  void_earring: a('void_earring','Void Earring',6,80,'earring',[],[['statusResist',12,true],['hpRegen',3,false],['maxHp',28,false]],null,[[EC,12],[CF,8],[CO,6]],TK,80,95,'resonance_earring'),
  stellar_pendant: a('stellar_pendant','Stellar Pendant',6,80,'necklace',[],[['maxHp',58,false],['critDamage',16,true],['hpRegen',3,false]],null,[[EC,16],[MP,10],[CO,8]],TK,80,115,'core_pendant'),

  // =====================================================================
  // T7 WEAPONS (Level 90)
  // =====================================================================
  apocalypse_edge: w('apocalypse_edge','Apocalypse Edge',7,90,'melee',true,[['str',75]],[['meleeAttack',140,false],['maxHp',100,false],['critChance',12,true],['critDamage',20,true],['hpRegen',4,false]],['turnSpeed',-28,false],[[IO,55],[SM,35],[MP,20],[CF,15]],WS,90,800,'titan_cleaver',undefined,'A weapon of legend. Its edge was tempered in reactor fire.'),
  railgun: w('railgun','Railgun',7,90,'ranger',true,[['dex',75]],[['rangedAttack',135,false],['accuracy',20,true],['critChance',15,true],['critDamage',35,true],['turnSpeed',8,false]],['hpRegen',-2,false],[[IO,50],[CO,25],[EC,20],[CF,15]],WS,90,800,'anti_material_rifle',undefined,'Fires magnetically accelerated slugs at hypersonic speeds.'),
  orbital_beacon: w('orbital_beacon','Orbital Strike Beacon',7,90,'demolitions',true,[['int',75]],[['blastAttack',140,false],['critDamage',40,true]],['selfDamage',9,true],[[EC,55],[CF,40],[CO,30],[MP,20]],WS,90,800,'plasma_bombard',undefined,'Calls down orbital bombardment from a forgotten satellite network.'),
  // T7 ARMOR (Level 90)
  dreadnought_plate: a('dreadnought_plate','Dreadnought Plate',7,90,'armor',[['str',75]],[['defense',125,false],['maxHp',200,false],['hpRegen',5,false],['critChance',5,true]],['turnSpeed',-35,false],[[IO,60],[SM,40],[RS,25],[MP,15]],AC,90,700,'siege_bulwark'),
  phantom_shroud: a('phantom_shroud','Phantom Shroud',7,90,'armor',[['dex',70]],[['defense',90,false],['turnSpeed',35,false],['evasion',22,true],['critChance',12,true],['accuracy',10,true]],['maxHp',-18,true],[[MR,25],[CF,20],[EC,15],[SM,10]],AC,90,700,'wraith_armor'),
  quantum_harness: a('quantum_harness','Quantum Harness',7,90,'armor',[['int',70]],[['defense',80,false],['statusResist',30,true],['critDamage',35,true],['critChance',5,true]],['hpRegen',-4,false],[[EC,25],[CF,20],[CO,15],[SM,10]],AC,90,700,'fusion_core_suit'),
  dreadnought_legplates: a('dreadnought_legplates','Dreadnought Legplates',7,90,'legs',[['str',55]],[['defense',58,false],['maxHp',115,false]],['turnSpeed',-18,false],[[IO,35],[SM,22],[RS,14]],AC,90,580,'titan_legplates'),
  apex_gloves: a('apex_gloves','Apex Gloves',7,90,'gloves',[['dex',55]],[['accuracy',15,true],['critChance',12,true],['critDamage',15,true]],['defense',-10,false],[[CO,18],[MP,14],[CF,10]],AC,90,550,'assassin_gloves'),
  apex_boots: a('apex_boots','Apex Boots',7,90,'boots',[['dex',50]],[['turnSpeed',18,false],['evasion',8,true],['defense',12,false]],['maxHp',-6,true],[[MR,12],[CF,10],[IO,8]],AC,90,530,'titan_boots'),
  omega_shield: a('omega_shield','Omega Shield',7,90,'shield',[['str',65]],[['defense',60,false],['blockChance',25,true],['maxHp',90,false]],['turnSpeed',-25,false],[[IO,38],[RS,22],[SM,16]],AC,90,620,'dreadnought_shield'),
  singularity_ring: a('singularity_ring','Singularity Ring',7,90,'ring',[],[['maxHp',50,false],['critChance',6,true],['defense',12,false]],null,[[EC,18],[CO,14],[MP,10]],TK,90,130,'quantum_ring'),
  anomaly_earring: a('anomaly_earring','Anomaly Earring',7,90,'earring',[],[['statusResist',14,true],['hpRegen',3.5,false],['maxHp',35,false]],null,[[EC,16],[CF,10],[CO,8]],TK,90,120,'void_earring'),
  eternity_pendant: a('eternity_pendant','Eternity Pendant',7,90,'necklace',[],[['maxHp',70,false],['critDamage',20,true],['hpRegen',3.5,false]],null,[[EC,20],[MP,14],[CO,10]],TK,90,145,'stellar_pendant'),

  // =====================================================================
  // T8 WEAPONS (Level 100) - LEGENDARY TIER
  // =====================================================================
  doomsday_maul: w('doomsday_maul','Doomsday Maul',8,100,'melee',true,[['str',90]],[['meleeAttack',180,false],['maxHp',130,false],['critChance',15,true],['critDamage',30,true],['hpRegen',5,false]],['turnSpeed',-30,false],[[IO,80],[SM,50],[MP,30],[CF,20],[RS,10]],WS,100,1200,'apocalypse_edge',undefined,'The ultimate melee weapon. Each swing reshapes the battlefield.'),
  oblivion_cannon: w('oblivion_cannon','Oblivion Cannon',8,100,'ranger',true,[['dex',90]],[['rangedAttack',175,false],['accuracy',22,true],['critChance',18,true],['critDamage',45,true],['turnSpeed',15,false]],['hpRegen',-3,false],[[IO,70],[CO,40],[EC,30],[CF,25],[MP,10]],WS,100,1200,'railgun',undefined,'An energy weapon that erases targets from existence.'),
  apocalypse_device: w('apocalypse_device','Apocalypse Device',8,100,'demolitions',true,[['int',90]],[['blastAttack',180,false],['critDamage',50,true]],['selfDamage',10,true],[[EC,80],[CF,60],[CO,40],[MP,30],[IO,20]],WS,100,1200,'orbital_beacon',undefined,'A doomsday weapon of terrifying power. Use with extreme caution.'),
  // T8 ARMOR (Level 100) - LEGENDARY
  apocalypse_aegis: a('apocalypse_aegis','Apocalypse Aegis',8,100,'armor',[['str',90]],[['defense',160,false],['maxHp',250,false],['hpRegen',6,false],['critChance',8,true]],['turnSpeed',-38,false],[[IO,80],[SM,50],[RS,30],[MP,20]],AC,100,1000,'dreadnought_plate'),
  void_walker_suit: a('void_walker_suit','Void Walker Suit',8,100,'armor',[['dex',85]],[['defense',115,false],['turnSpeed',40,false],['evasion',28,true],['critChance',15,true],['accuracy',12,true]],['maxHp',-20,true],[[MR,30],[CF,25],[EC,20],[SM,15]],AC,100,1000,'phantom_shroud'),
  singularity_frame: a('singularity_frame','Singularity Frame',8,100,'armor',[['int',85]],[['defense',100,false],['statusResist',35,true],['critDamage',45,true],['critChance',8,true]],['hpRegen',-5,false],[[EC,30],[CF,25],[CO,20],[SM,15]],AC,100,1000,'quantum_harness'),
  eternity_shell: a('eternity_shell','Eternity Shell',8,100,'armor',[['con',85]],[['defense',130,false],['maxHp',300,false],['hpRegen',8,false],['statusResist',15,true]],['turnSpeed',-30,false],[[IO,60],[RS,35],[SM,25],[MP,18]],AC,100,1000,'dreadnought_plate'),
  doomsday_legplates: a('doomsday_legplates','Doomsday Legplates',8,100,'legs',[['str',65]],[['defense',72,false],['maxHp',140,false]],['turnSpeed',-20,false],[[IO,45],[SM,28],[RS,18]],AC,100,820,'dreadnought_legplates'),
  godhand_gloves: a('godhand_gloves','Godhand Gloves',8,100,'gloves',[['dex',65]],[['accuracy',18,true],['critChance',14,true],['critDamage',18,true]],['defense',-12,false],[[CO,22],[MP,16],[CF,12]],AC,100,780,'apex_gloves'),
  godstep_boots: a('godstep_boots','Godstep Boots',8,100,'boots',[['dex',60]],[['turnSpeed',22,false],['evasion',10,true],['defense',15,false]],['maxHp',-8,true],[[MR,15],[CF,12],[IO,10]],AC,100,760,'apex_boots'),
  world_shield: a('world_shield','World Shield',8,100,'shield',[['str',80]],[['defense',75,false],['blockChance',28,true],['maxHp',110,false]],['turnSpeed',-28,false],[[IO,48],[RS,28],[SM,20]],AC,100,900,'omega_shield'),
  infinity_ring: a('infinity_ring','Infinity Ring',8,100,'ring',[],[['maxHp',60,false],['critChance',7,true],['defense',15,false]],null,[[EC,22],[CO,18],[MP,12]],TK,100,160,'singularity_ring'),
  void_earring_t8: a('void_earring_t8','Void Whisper Earring',8,100,'earring',[],[['statusResist',16,true],['hpRegen',4,false],['maxHp',42,false]],null,[[EC,20],[CF,14],[CO,10]],TK,100,150,'anomaly_earring'),
  eternity_amulet: a('eternity_amulet','Eternity Amulet',8,100,'necklace',[],[['maxHp',85,false],['critDamage',22,true],['hpRegen',4,false]],null,[[EC,24],[MP,18],[CO,12]],TK,100,175,'eternity_pendant'),

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

  // =====================================================================
  // SUPPORT SETS
  // =====================================================================

  // ── T2 Shared: Watchman's Kit (Level 15, all support classes) ──
  watchman_vest: a('watchman_vest',"Watchman's Vest",2,15,'armor',[['con',10]],[['defense',14,false],['maxHp',25,false],['hpRegen',0.5,false]],null,[[SM,6],[IO,4],[MR,3]],AC,15,45,undefined,'set_watchman'),
  watchman_pants: a('watchman_pants',"Watchman's Pants",2,15,'legs',[['con',10]],[['defense',6,false],['maxHp',18,false]],null,[[SM,5],[IO,3]],AC,15,35,undefined,'set_watchman'),
  watchman_gloves: a('watchman_gloves',"Watchman's Gloves",2,15,'gloves',[],[['defense',4,false],['statusResist',3,true]],null,[[MR,4],[SM,2]],AC,15,30,undefined,'set_watchman'),
  watchman_boots: a('watchman_boots',"Watchman's Boots",2,15,'boots',[],[['defense',4,false],['maxHp',10,false],['hpRegen',0.5,false]],null,[[MR,4],[IO,2]],AC,15,30,undefined,'set_watchman'),
  watchman_ring: a('watchman_ring',"Watchman's Ring",2,15,'ring',[],[['maxHp',10,false],['defense',2,false]],null,[[IO,4],[CO,2]],TK,15,25,undefined,'set_watchman'),
  watchman_earring: a('watchman_earring',"Watchman's Earring",2,15,'earring',[],[['statusResist',3,true],['hpRegen',0.5,false]],null,[[CO,3],[EC,2]],TK,15,25,undefined,'set_watchman'),

  // ── T4 Guardian: Ironclad Bulwark (Level 45, CON+STR) ──
  ironclad_plate: a('ironclad_plate',"Ironclad Plate",4,45,'armor',[['con',22],['str',18]],[['defense',42,false],['maxHp',70,false],['hpRegen',2,false]],['turnSpeed',-15,false],[[IO,16],[SM,10],[RS,6],[MP,4]],AC,45,180,undefined,'set_ironclad'),
  ironclad_legguards: a('ironclad_legguards',"Ironclad Legguards",4,45,'legs',[['con',18]],[['defense',18,false],['maxHp',40,false],['blockChance',3,true]],['turnSpeed',-6,false],[[IO,12],[SM,7],[RS,4]],AC,45,140,undefined,'set_ironclad'),
  ironclad_gauntlets: a('ironclad_gauntlets',"Ironclad Gauntlets",4,45,'gloves',[['con',16]],[['defense',10,false],['blockChance',5,true],['thornsDamage',4,true]],null,[[IO,10],[SM,6],[MP,3]],AC,45,120,undefined,'set_ironclad'),
  ironclad_boots: a('ironclad_boots',"Ironclad Boots",4,45,'boots',[['con',14]],[['defense',8,false],['maxHp',20,false],['damageReduction',2,true]],['turnSpeed',-4,false],[[IO,8],[SM,5],[RS,3]],AC,45,100,undefined,'set_ironclad'),
  ironclad_shield: a('ironclad_shield',"Ironclad Shield",4,45,'shield',[['con',20],['str',16]],[['defense',22,false],['blockChance',14,true],['maxHp',35,false]],['turnSpeed',-12,false],[[IO,14],[RS,8],[SM,6]],AC,45,160,undefined,'set_ironclad'),
  ironclad_pendant: a('ironclad_pendant',"Ironclad Pendant",4,45,'necklace',[],[['maxHp',30,false],['hpRegen',1.5,false],['defense',5,false]],null,[[MP,6],[CO,4],[IO,3]],TK,45,80,undefined,'set_ironclad'),

  // ── T4 Field Medic: Triage Rig (Level 45, CON+DEX) ──
  triage_vest: a('triage_vest',"Triage Vest",4,45,'armor',[['con',22],['dex',18]],[['defense',30,false],['maxHp',50,false],['hpRegen',3,false]],['evasion',-4,true],[[MR,12],[CF,8],[SM,5],[EC,4]],AC,45,180,undefined,'set_triage'),
  triage_pants: a('triage_pants',"Triage Pants",4,45,'legs',[['con',18]],[['defense',12,false],['maxHp',30,false],['hpRegen',1,false]],null,[[MR,10],[CF,5],[SM,3]],AC,45,140,undefined,'set_triage'),
  triage_gloves: a('triage_gloves',"Triage Gloves",4,45,'gloves',[['con',16]],[['hpRegen',1.5,false],['statusResist',6,true],['evasion',3,true]],['defense',-3,false],[[MR,8],[CF,4],[EC,3]],AC,45,120,undefined,'set_triage'),
  triage_boots: a('triage_boots',"Triage Boots",4,45,'boots',[['con',14]],[['evasion',5,true],['hpRegen',1,false],['maxHp',15,false]],['defense',-2,false],[[MR,7],[CF,4],[SM,2]],AC,45,100,undefined,'set_triage'),
  triage_earring: a('triage_earring',"Triage Earring",4,45,'earring',[],[['statusResist',7,true],['hpRegen',1,false],['maxHp',12,false]],null,[[EC,5],[CF,3],[CO,3]],TK,45,70,undefined,'set_triage'),
  triage_pendant: a('triage_pendant',"Triage Pendant",4,45,'necklace',[],[['maxHp',30,false],['hpRegen',2,false],['spRegen',0.5,false]],null,[[EC,6],[MP,4],[CO,3]],TK,45,80,undefined,'set_triage'),

  // ── T4 Chemist: Alchemist's Array (Level 45, CON+INT) ──
  alchemist_coat: a('alchemist_coat',"Alchemist's Coat",4,45,'armor',[['con',22],['int',18]],[['defense',28,false],['abilityPower',10,true],['maxSp',15,false],['statusResist',8,true]],['maxHp',-6,true],[[EC,10],[CF,8],[SM,4],[MR,4]],AC,45,180,undefined,'set_alchemist'),
  alchemist_pants: a('alchemist_pants',"Alchemist's Pants",4,45,'legs',[['con',18]],[['defense',10,false],['abilityPower',5,true],['maxSp',10,false]],null,[[EC,8],[CF,5],[MR,3]],AC,45,140,undefined,'set_alchemist'),
  alchemist_gloves: a('alchemist_gloves',"Alchemist's Gloves",4,45,'gloves',[['con',16]],[['abilityPower',8,true],['spCostReduction',3,false],['spRegen',0.5,false]],['defense',-3,false],[[EC,7],[CF,4],[CO,3]],AC,45,120,undefined,'set_alchemist'),
  alchemist_boots: a('alchemist_boots',"Alchemist's Boots",4,45,'boots',[['con',14]],[['abilityPower',5,true],['maxSp',8,false],['statusResist',4,true]],['defense',-2,false],[[EC,6],[CF,4],[MR,2]],AC,45,100,undefined,'set_alchemist'),
  alchemist_ring: a('alchemist_ring',"Alchemist's Ring",4,45,'ring',[],[['maxSp',12,false],['abilityPower',5,true],['spRegen',0.3,false]],null,[[EC,5],[CO,4],[MP,2]],TK,45,70,undefined,'set_alchemist'),
  alchemist_earring: a('alchemist_earring',"Alchemist's Earring",4,45,'earring',[],[['statusResist',8,true],['spCostReduction',2,false],['abilityPower',3,true]],null,[[EC,5],[CF,3],[CO,3]],TK,45,70,undefined,'set_alchemist'),

  // ── T7 Guardian: Citadel Warden (Level 90, CON+STR) ──
  citadel_plate: a('citadel_plate',"Citadel Plate",7,90,'armor',[['con',55],['str',45]],[['defense',110,false],['maxHp',180,false],['hpRegen',5,false]],['turnSpeed',-30,false],[[IO,50],[SM,30],[RS,18],[MP,12]],AC,90,450,undefined,'set_citadel'),
  citadel_legguards: a('citadel_legguards',"Citadel Legguards",7,90,'legs',[['con',45]],[['defense',50,false],['maxHp',100,false],['blockChance',6,true]],['turnSpeed',-14,false],[[IO,32],[SM,18],[RS,12]],AC,90,350,undefined,'set_citadel'),
  citadel_gauntlets: a('citadel_gauntlets',"Citadel Gauntlets",7,90,'gloves',[['con',40]],[['defense',25,false],['blockChance',8,true],['thornsDamage',8,true]],['turnSpeed',-6,false],[[IO,24],[SM,14],[MP,8]],AC,90,300,undefined,'set_citadel'),
  citadel_boots: a('citadel_boots',"Citadel Boots",7,90,'boots',[['con',38]],[['defense',20,false],['maxHp',50,false],['damageReduction',4,true]],['turnSpeed',-8,false],[[IO,18],[SM,10],[RS,8]],AC,90,280,undefined,'set_citadel'),
  citadel_shield: a('citadel_shield',"Citadel Shield",7,90,'shield',[['con',50],['str',40]],[['defense',55,false],['blockChance',24,true],['maxHp',85,false]],['turnSpeed',-24,false],[[IO,36],[RS,20],[SM,14]],AC,90,400,undefined,'set_citadel'),
  citadel_ring: a('citadel_ring',"Citadel Ring",7,90,'ring',[],[['maxHp',45,false],['defense',12,false],['blockChance',3,true]],null,[[EC,16],[CO,12],[MP,8]],TK,90,150,undefined,'set_citadel'),
  citadel_pendant: a('citadel_pendant',"Citadel Pendant",7,90,'necklace',[],[['maxHp',65,false],['hpRegen',3.5,false],['defense',10,false]],null,[[EC,18],[MP,12],[CO,8]],TK,90,160,undefined,'set_citadel'),

  // ── T7 Field Medic: Lifeline Apparatus (Level 90, CON+DEX) ──
  lifeline_vest: a('lifeline_vest',"Lifeline Vest",7,90,'armor',[['con',55],['dex',45]],[['defense',80,false],['maxHp',140,false],['hpRegen',6,false]],['evasion',-6,true],[[MR,22],[CF,16],[SM,10],[EC,8]],AC,90,450,undefined,'set_lifeline'),
  lifeline_pants: a('lifeline_pants',"Lifeline Pants",7,90,'legs',[['con',45]],[['defense',35,false],['maxHp',75,false],['hpRegen',2.5,false]],null,[[MR,18],[CF,10],[SM,6]],AC,90,350,undefined,'set_lifeline'),
  lifeline_gloves: a('lifeline_gloves',"Lifeline Gloves",7,90,'gloves',[['con',40]],[['hpRegen',3,false],['statusResist',12,true],['evasion',6,true]],['defense',-6,false],[[MR,14],[CF,8],[EC,6]],AC,90,300,undefined,'set_lifeline'),
  lifeline_boots: a('lifeline_boots',"Lifeline Boots",7,90,'boots',[['con',38]],[['evasion',10,true],['hpRegen',2,false],['maxHp',35,false]],['defense',-4,false],[[MR,12],[CF,8],[SM,4]],AC,90,280,undefined,'set_lifeline'),
  lifeline_earring: a('lifeline_earring',"Lifeline Earring",7,90,'earring',[],[['statusResist',14,true],['hpRegen',2,false],['maxHp',30,false]],null,[[EC,12],[CF,8],[CO,6]],TK,90,140,undefined,'set_lifeline'),
  lifeline_ring: a('lifeline_ring',"Lifeline Ring",7,90,'ring',[],[['maxHp',45,false],['hpRegen',2,false],['statusResist',5,true]],null,[[EC,14],[CO,10],[MP,6]],TK,90,150,undefined,'set_lifeline'),
  lifeline_pendant: a('lifeline_pendant',"Lifeline Pendant",7,90,'necklace',[],[['maxHp',60,false],['hpRegen',3.5,false],['spRegen',1.5,false]],null,[[EC,16],[MP,10],[CO,8]],TK,90,160,undefined,'set_lifeline'),

  // ── T7 Chemist: Catalyst Engine (Level 90, CON+INT) ──
  catalyst_harness: a('catalyst_harness',"Catalyst Harness",7,90,'armor',[['con',55],['int',45]],[['defense',70,false],['abilityPower',25,true],['maxSp',40,false],['statusResist',15,true]],['maxHp',-10,true],[[EC,22],[CF,16],[SM,8],[MR,8]],AC,90,450,undefined,'set_catalyst'),
  catalyst_pants: a('catalyst_pants',"Catalyst Pants",7,90,'legs',[['con',45]],[['defense',28,false],['abilityPower',12,true],['maxSp',25,false]],null,[[EC,16],[CF,10],[MR,6]],AC,90,350,undefined,'set_catalyst'),
  catalyst_gloves: a('catalyst_gloves',"Catalyst Gloves",7,90,'gloves',[['con',40]],[['abilityPower',18,true],['spCostReduction',8,false],['spRegen',1.5,false]],['defense',-6,false],[[EC,14],[CF,8],[CO,6]],AC,90,300,undefined,'set_catalyst'),
  catalyst_boots: a('catalyst_boots',"Catalyst Boots",7,90,'boots',[['con',38]],[['abilityPower',12,true],['maxSp',20,false],['statusResist',8,true]],['defense',-4,false],[[EC,12],[CF,8],[MR,4]],AC,90,280,undefined,'set_catalyst'),
  catalyst_ring: a('catalyst_ring',"Catalyst Ring",7,90,'ring',[],[['maxSp',30,false],['abilityPower',12,true],['spRegen',1,false]],null,[[EC,14],[CO,10],[MP,6]],TK,90,150,undefined,'set_catalyst'),
  catalyst_earring: a('catalyst_earring',"Catalyst Earring",7,90,'earring',[],[['statusResist',14,true],['spCostReduction',5,false],['abilityPower',8,true]],null,[[EC,12],[CF,6],[CO,6]],TK,90,140,undefined,'set_catalyst'),
  catalyst_pendant: a('catalyst_pendant',"Catalyst Pendant",7,90,'necklace',[],[['maxSp',35,false],['abilityPower',15,true],['spRegen',2,false],['maxHp',40,false]],null,[[EC,16],[MP,10],[CO,8]],TK,90,160,undefined,'set_catalyst'),

  // =====================================================================
  // JOB2 SIGNATURE WEAPONS
  // =====================================================================

  // ── Sentinel (sword + shield) ──
  sentinel_sword_basic: w2('sentinel_sword_basic','Scrap Sword',2,15,'melee',false,[['meleeAttack',18,false],['critChance',2,true]],null,[[IO,10]],WS,15,50,'sentinel'),
  sentinel_sword_t1: w2('sentinel_sword_t1','Forged Blade',3,30,'melee',false,[['meleeAttack',32,false],['critChance',4,true],['maxHp',15,false]],null,[[IO,10]],WS,30,100,'sentinel','sentinel_sword_basic'),
  sentinel_sword_t2: w2('sentinel_sword_t2','Wasteland Saber',4,45,'melee',false,[['meleeAttack',50,false],['critChance',6,true],['maxHp',30,false]],null,[[IO,10]],WS,45,180,'sentinel','sentinel_sword_t1'),
  sentinel_sword_t3: w2('sentinel_sword_t3','Citadel Blade',5,60,'melee',false,[['meleeAttack',72,false],['critChance',8,true],['maxHp',50,false]],null,[[IO,10]],WS,60,300,'sentinel','sentinel_sword_t2'),
  sentinel_shield_basic: a2('sentinel_shield_basic','Scrap Kite Shield',2,15,'shield',[['defense',6,false],['blockChance',6,true]],[[IO,10]],AC,15,50,'sentinel'),
  sentinel_shield_t1: a2('sentinel_shield_t1','Iron Bulwark',3,30,'shield',[['defense',14,false],['blockChance',10,true],['maxHp',20,false]],[[IO,10]],AC,30,100,'sentinel','sentinel_shield_basic'),
  sentinel_shield_t2: a2('sentinel_shield_t2','Reinforced Tower Shield',4,45,'shield',[['defense',22,false],['blockChance',14,true],['maxHp',40,false]],[[IO,10]],AC,45,180,'sentinel','sentinel_shield_t1'),
  sentinel_shield_t3: a2('sentinel_shield_t3','Bastion Shield',5,60,'shield',[['defense',32,false],['blockChance',18,true],['maxHp',60,false]],[[IO,10]],AC,60,300,'sentinel','sentinel_shield_t2'),

  // ── Bruiser (fists) ──
  bruiser_fists_basic: w2('bruiser_fists_basic','Scrap Knuckles',2,15,'melee',false,[['meleeAttack',16,false],['turnSpeed',5,false],['critChance',2,true]],null,[[IO,10]],WS,15,50,'bruiser'),
  bruiser_fists_t1: w2('bruiser_fists_t1','Spiked Fist Wraps',3,30,'melee',false,[['meleeAttack',30,false],['turnSpeed',10,false],['critChance',4,true]],null,[[IO,10]],WS,30,100,'bruiser','bruiser_fists_basic'),
  bruiser_fists_t2: w2('bruiser_fists_t2','Wasteland Power Fists',4,45,'melee',false,[['meleeAttack',48,false],['turnSpeed',14,false],['critChance',6,true]],null,[[IO,10]],WS,45,180,'bruiser','bruiser_fists_t1'),
  bruiser_fists_t3: w2('bruiser_fists_t3','Annihilator Gauntlets',5,60,'melee',false,[['meleeAttack',70,false],['turnSpeed',18,false],['critChance',10,true]],null,[[IO,10]],WS,60,300,'bruiser','bruiser_fists_t2'),

  // ── Crusher (two-handed) ──
  crusher_maul_basic: w2('crusher_maul_basic','Concrete Maul',2,15,'melee',true,[['meleeAttack',22,false],['critDamage',5,true]],['turnSpeed',-8,false],[[IO,10]],WS,15,50,'crusher'),
  crusher_maul_t1: w2('crusher_maul_t1','Rebar Greataxe',3,30,'melee',true,[['meleeAttack',40,false],['critDamage',10,true]],['turnSpeed',-12,false],[[IO,10]],WS,30,100,'crusher','crusher_maul_basic'),
  crusher_maul_t2: w2('crusher_maul_t2','Siege Hammer',4,45,'melee',true,[['meleeAttack',60,false],['critDamage',18,true]],['turnSpeed',-16,false],[[IO,10]],WS,45,180,'crusher','crusher_maul_t1'),
  crusher_maul_t3: w2('crusher_maul_t3','Apocalypse Maul',5,60,'melee',true,[['meleeAttack',85,false],['critDamage',25,true]],['turnSpeed',-20,false],[[IO,10]],WS,60,300,'crusher','crusher_maul_t2'),

  // ── Sniper (scoped rifle) ──
  sniper_rifle_basic: w2('sniper_rifle_basic','Scrap Scope Rifle',2,15,'ranger',true,[['rangedAttack',20,false],['accuracy',6,true]],['turnSpeed',-10,false],[[IO,10]],WS,15,50,'sniper'),
  sniper_rifle_t1: w2('sniper_rifle_t1','Wasteland Long Rifle',3,30,'ranger',true,[['rangedAttack',36,false],['accuracy',10,true],['critChance',6,true]],['turnSpeed',-14,false],[[IO,10]],WS,30,100,'sniper','sniper_rifle_basic'),
  sniper_rifle_t2: w2('sniper_rifle_t2','Dead-Eye Carbine',4,45,'ranger',true,[['rangedAttack',54,false],['accuracy',14,true],['critDamage',12,true]],['turnSpeed',-18,false],[[IO,10]],WS,45,180,'sniper','sniper_rifle_t1'),
  sniper_rifle_t3: w2('sniper_rifle_t3','Oblivion Rifle',5,60,'ranger',true,[['rangedAttack',78,false],['accuracy',18,true],['critDamage',20,true]],['turnSpeed',-22,false],[[IO,10]],WS,60,300,'sniper','sniper_rifle_t2'),

  // ── Gunslinger (dual pistols) ──
  gunslinger_pistols_basic: w2('gunslinger_pistols_basic','Scrap Dual Pistols',2,15,'ranger',false,[['rangedAttack',14,false],['turnSpeed',8,false]],['accuracy',-5,true],[[IO,10]],WS,15,50,'gunslinger'),
  gunslinger_pistols_t1: w2('gunslinger_pistols_t1','Reclaimed Revolvers',3,30,'ranger',false,[['rangedAttack',26,false],['turnSpeed',14,false]],['accuracy',-7,true],[[IO,10]],WS,30,100,'gunslinger','gunslinger_pistols_basic'),
  gunslinger_pistols_t2: w2('gunslinger_pistols_t2','Wasteland Six-Shooters',4,45,'ranger',false,[['rangedAttack',44,false],['turnSpeed',18,false]],['accuracy',-9,true],[[IO,10]],WS,45,180,'gunslinger','gunslinger_pistols_t1'),
  gunslinger_pistols_t3: w2('gunslinger_pistols_t3','Hellfire Pistols',5,60,'ranger',false,[['rangedAttack',66,false],['turnSpeed',22,false]],['accuracy',-11,true],[[IO,10]],WS,60,300,'gunslinger','gunslinger_pistols_t2'),

  // ── Hunter (bow) ──
  hunter_bow_basic: w2('hunter_bow_basic','Makeshift Longbow',2,15,'ranger',true,[['rangedAttack',18,false],['accuracy',4,true],['poisonDot',2,false]],null,[[IO,10]],WS,15,50,'hunter'),
  hunter_bow_t1: w2('hunter_bow_t1','Compound Wasteland Bow',3,30,'ranger',true,[['rangedAttack',34,false],['accuracy',7,true],['poisonDot',4,false]],null,[[IO,10]],WS,30,100,'hunter','hunter_bow_basic'),
  hunter_bow_t2: w2('hunter_bow_t2',"Predator's Recurve",4,45,'ranger',true,[['rangedAttack',52,false],['accuracy',10,true],['poisonDot',6,false]],null,[[IO,10]],WS,45,180,'hunter','hunter_bow_t1'),
  hunter_bow_t3: w2('hunter_bow_t3','Apex Longbow',5,60,'ranger',true,[['rangedAttack',74,false],['accuracy',14,true],['poisonDot',9,false]],null,[[IO,10]],WS,60,300,'hunter','hunter_bow_t2'),

  // ── Bombardier (grenade launcher) ──
  bombardier_launcher_basic: w2('bombardier_launcher_basic','Pipe Launcher',2,15,'demolitions',true,[['blastAttack',20,false],['critDamage',4,true]],null,[[IO,10]],WS,15,50,'bombardier'),
  bombardier_launcher_t1: w2('bombardier_launcher_t1','Scrap Mortar',3,30,'demolitions',true,[['blastAttack',36,false],['critDamage',8,true]],null,[[IO,10]],WS,30,100,'bombardier','bombardier_launcher_basic'),
  bombardier_launcher_t2: w2('bombardier_launcher_t2','Siege Launcher',4,45,'demolitions',true,[['blastAttack',54,false],['critDamage',14,true]],null,[[IO,10]],WS,45,180,'bombardier','bombardier_launcher_t1'),
  bombardier_launcher_t3: w2('bombardier_launcher_t3','Apocalypse Mortar',5,60,'demolitions',true,[['blastAttack',78,false],['critDamage',22,true]],null,[[IO,10]],WS,60,300,'bombardier','bombardier_launcher_t2'),

  // ── Arsonist (flamethrower) ──
  arsonist_flame_basic: w2('arsonist_flame_basic','Scrap Flamethrower',2,15,'demolitions',true,[['blastAttack',18,false],['burnDot',3,false]],null,[[IO,10]],WS,15,50,'arsonist'),
  arsonist_flame_t1: w2('arsonist_flame_t1','Napalm Sprayer',3,30,'demolitions',true,[['blastAttack',32,false],['burnDot',5,false],['critChance',3,true]],null,[[IO,10]],WS,30,100,'arsonist','arsonist_flame_basic'),
  arsonist_flame_t2: w2('arsonist_flame_t2','Inferno Projector',4,45,'demolitions',true,[['blastAttack',50,false],['burnDot',8,false],['critChance',6,true]],null,[[IO,10]],WS,45,180,'arsonist','arsonist_flame_t1'),
  arsonist_flame_t3: w2('arsonist_flame_t3','Hellfire Cannon',5,60,'demolitions',true,[['blastAttack',72,false],['burnDot',12,false],['critChance',8,true]],null,[[IO,10]],WS,60,300,'arsonist','arsonist_flame_t2'),

  // ── Chemist (flask + satchel) ──
  chemist_flask_basic: w2('chemist_flask_basic','Acid Flask Launcher',2,15,'demolitions',false,[['blastAttack',16,false],['poisonDot',2,false]],null,[[IO,10]],WS,15,50,'chemist'),
  chemist_flask_t1: w2('chemist_flask_t1','Corrosive Lobber',3,30,'demolitions',false,[['blastAttack',30,false],['poisonDot',4,false]],null,[[IO,10]],WS,30,100,'chemist','chemist_flask_basic'),
  chemist_flask_t2: w2('chemist_flask_t2','Toxic Projector',4,45,'demolitions',false,[['blastAttack',48,false],['poisonDot',6,false]],null,[[IO,10]],WS,45,180,'chemist','chemist_flask_t1'),
  chemist_flask_t3: w2('chemist_flask_t3','Plague Dispenser',5,60,'demolitions',false,[['blastAttack',68,false],['poisonDot',9,false]],null,[[IO,10]],WS,60,300,'chemist','chemist_flask_t2'),
  chemist_satchel_basic: a2('chemist_satchel_basic','Chemical Satchel',2,15,'shield',[['statusResist',3,true]],[[IO,10]],AC,15,50,'chemist'),
  chemist_satchel_t1: a2('chemist_satchel_t1','Reagent Bandolier',3,30,'shield',[['statusResist',6,true]],[[IO,10]],AC,30,100,'chemist','chemist_satchel_basic'),
  chemist_satchel_t2: a2('chemist_satchel_t2',"Alchemist's Kit",4,45,'shield',[['statusResist',10,true]],[[IO,10]],AC,45,180,'chemist','chemist_satchel_t1'),
  chemist_satchel_t3: a2('chemist_satchel_t3',"Master Chemist's Pack",5,60,'shield',[['statusResist',15,true]],[[IO,10]],AC,60,300,'chemist','chemist_satchel_t2'),

  // ── Medic (book) ──
  medic_book_basic: w2('medic_book_basic','Field Manual',2,15,'melee',false,[['meleeAttack',5,false],['rangedAttack',5,false],['blastAttack',5,false],['maxHp',10,false],['hpRegen',1,false]],null,[[IO,10]],WS,15,50,'medic'),
  medic_book_t1: w2('medic_book_t1','Wasteland Grimoire',3,30,'melee',false,[['meleeAttack',8,false],['rangedAttack',8,false],['blastAttack',8,false],['maxHp',25,false],['hpRegen',2,false]],null,[[IO,10]],WS,30,100,'medic','medic_book_basic'),
  medic_book_t2: w2('medic_book_t2',"Surgeon's Codex",4,45,'melee',false,[['meleeAttack',12,false],['rangedAttack',12,false],['blastAttack',12,false],['maxHp',45,false],['hpRegen',3,false]],null,[[IO,10]],WS,45,180,'medic','medic_book_t1'),
  medic_book_t3: w2('medic_book_t3','Tome of Restoration',5,60,'melee',false,[['meleeAttack',18,false],['rangedAttack',18,false],['blastAttack',18,false],['maxHp',70,false],['hpRegen',4,false]],null,[[IO,10]],WS,60,300,'medic','medic_book_t2'),

  // ── Tactician (flagpole) ──
  tactician_flag_basic: w2('tactician_flag_basic','Scrap Banner',2,15,'melee',true,[['meleeAttack',4,false],['rangedAttack',4,false],['blastAttack',4,false],['defense',5,false],['maxHp',8,false]],null,[[IO,10]],WS,15,50,'tactician'),
  tactician_flag_t1: w2('tactician_flag_t1','War Standard',3,30,'melee',true,[['meleeAttack',7,false],['rangedAttack',7,false],['blastAttack',7,false],['defense',10,false],['maxHp',20,false]],null,[[IO,10]],WS,30,100,'tactician','tactician_flag_basic'),
  tactician_flag_t2: w2('tactician_flag_t2',"Commander's Standard",4,45,'melee',true,[['meleeAttack',12,false],['rangedAttack',12,false],['blastAttack',12,false],['defense',18,false],['maxHp',40,false]],null,[[IO,10]],WS,45,180,'tactician','tactician_flag_t1'),
  tactician_flag_t3: w2('tactician_flag_t3',"Warlord's Banner",5,60,'melee',true,[['meleeAttack',18,false],['rangedAttack',18,false],['blastAttack',18,false],['defense',28,false],['maxHp',65,false]],null,[[IO,10]],WS,60,300,'tactician','tactician_flag_t2'),

  // ── Engineer (tech gun + drone) ──
  engineer_gun_basic: w2('engineer_gun_basic','Salvaged Tool Gun',2,15,'demolitions',false,[['blastAttack',8,false],['rangedAttack',5,false]],null,[[IO,10]],WS,15,50,'engineer'),
  engineer_gun_t1: w2('engineer_gun_t1','Wasteland Tech Launcher',3,30,'demolitions',false,[['blastAttack',15,false],['rangedAttack',10,false]],null,[[IO,10]],WS,30,100,'engineer','engineer_gun_basic'),
  engineer_gun_t2: w2('engineer_gun_t2','Industrial Dispenser',4,45,'demolitions',false,[['blastAttack',24,false],['rangedAttack',16,false]],null,[[IO,10]],WS,45,180,'engineer','engineer_gun_t1'),
  engineer_gun_t3: w2('engineer_gun_t3','Quantum Fabricator Gun',5,60,'demolitions',false,[['blastAttack',36,false],['rangedAttack',24,false]],null,[[IO,10]],WS,60,300,'engineer','engineer_gun_t2'),
  engineer_drone_basic: a2('engineer_drone_basic','Scrap Drone',2,15,'shield',[['defense',3,false],['maxHp',5,false]],[[IO,10]],AC,15,50,'engineer'),
  engineer_drone_t1: a2('engineer_drone_t1','Repair Drone Mk.I',3,30,'shield',[['defense',6,false],['maxHp',12,false],['hpRegen',1,false]],[[IO,10]],AC,30,100,'engineer','engineer_drone_basic'),
  engineer_drone_t2: a2('engineer_drone_t2','Utility Drone Mk.II',4,45,'shield',[['defense',10,false],['maxHp',25,false],['hpRegen',2,false]],[[IO,10]],AC,45,180,'engineer','engineer_drone_t1'),
  engineer_drone_t3: a2('engineer_drone_t3','Combat Drone Mk.III',5,60,'shield',[['defense',16,false],['maxHp',40,false],['hpRegen',3,false]],[[IO,10]],AC,60,300,'engineer','engineer_drone_t2'),
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
export function getWeaponPrimaryStat(weaponType: 'melee' | 'ranger' | 'demolitions'): string {
  switch (weaponType) {
    case 'melee': return 'str';
    case 'ranger': return 'dex';
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
  weaponType: 'melee' | 'ranger' | 'demolitions',
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
// ASPECT POOLS
// ============================

export interface AspectTemplate {
  name: string;
  slot: string; // 'weapon', 'armor', 'legs', etc.
  upside: { stat: string; value: number; isPercentage: boolean };
  downside: { stat: string; value: number; isPercentage: boolean };
}

export const ASPECT_POOLS: AspectTemplate[] = [
  // WEAPON ASPECTS
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

  // ARMOR ASPECTS
  { name: 'Bulky', slot: 'armor', upside: { stat: 'defense', value: 10, isPercentage: true }, downside: { stat: 'turnSpeed', value: -8, isPercentage: false } },
  { name: 'Lightweight', slot: 'armor', upside: { stat: 'turnSpeed', value: 8, isPercentage: false }, downside: { stat: 'defense', value: -10, isPercentage: true } },
  { name: 'Reinforced', slot: 'armor', upside: { stat: 'defense', value: 8, isPercentage: true }, downside: { stat: 'evasion', value: -5, isPercentage: true } },
  { name: 'Flexible', slot: 'armor', upside: { stat: 'evasion', value: 5, isPercentage: true }, downside: { stat: 'defense', value: -8, isPercentage: true } },
  { name: 'Spiked', slot: 'armor', upside: { stat: 'thornsDamage', value: 8, isPercentage: true }, downside: { stat: 'maxHp', value: -5, isPercentage: true } },
  { name: 'Standard', slot: 'armor', upside: { stat: 'none', value: 0, isPercentage: false }, downside: { stat: 'none', value: 0, isPercentage: false } },

  // BOOTS ASPECTS
  { name: 'Swift', slot: 'boots', upside: { stat: 'turnSpeed', value: 10, isPercentage: false }, downside: { stat: 'defense', value: -5, isPercentage: true } },
  { name: 'Heavy', slot: 'boots', upside: { stat: 'defense', value: 8, isPercentage: true }, downside: { stat: 'turnSpeed', value: -8, isPercentage: false } },
  { name: 'Silent', slot: 'boots', upside: { stat: 'evasion', value: 5, isPercentage: true }, downside: { stat: 'defense', value: -3, isPercentage: true } },
  { name: 'Standard', slot: 'boots', upside: { stat: 'none', value: 0, isPercentage: false }, downside: { stat: 'none', value: 0, isPercentage: false } },

  // GLOVES ASPECTS
  { name: 'Precise', slot: 'gloves', upside: { stat: 'accuracy', value: 5, isPercentage: true }, downside: { stat: 'meleeAttack', value: -3, isPercentage: true } },
  { name: 'Deadly', slot: 'gloves', upside: { stat: 'critChance', value: 4, isPercentage: true }, downside: { stat: 'accuracy', value: -5, isPercentage: true } },
  { name: 'Rapid', slot: 'gloves', upside: { stat: 'turnSpeed', value: 6, isPercentage: false }, downside: { stat: 'defense', value: -3, isPercentage: true } },
  { name: 'Standard', slot: 'gloves', upside: { stat: 'none', value: 0, isPercentage: false }, downside: { stat: 'none', value: 0, isPercentage: false } },

  // LEGS ASPECTS
  { name: 'Swift', slot: 'legs', upside: { stat: 'turnSpeed', value: 8, isPercentage: false }, downside: { stat: 'defense', value: -5, isPercentage: true } },
  { name: 'Armored', slot: 'legs', upside: { stat: 'defense', value: 10, isPercentage: true }, downside: { stat: 'turnSpeed', value: -5, isPercentage: false } },
  { name: 'Standard', slot: 'legs', upside: { stat: 'none', value: 0, isPercentage: false }, downside: { stat: 'none', value: 0, isPercentage: false } },

  // SHIELD ASPECTS
  { name: 'Dense', slot: 'shield', upside: { stat: 'blockChance', value: 15, isPercentage: true }, downside: { stat: 'turnSpeed', value: -5, isPercentage: false } },
  { name: 'Spiked', slot: 'shield', upside: { stat: 'thornsDamage', value: 10, isPercentage: true }, downside: { stat: 'blockChance', value: -5, isPercentage: true } },
  { name: 'Standard', slot: 'shield', upside: { stat: 'none', value: 0, isPercentage: false }, downside: { stat: 'none', value: 0, isPercentage: false } },

  // ACCESSORY ASPECTS (ring, earring, necklace)
  { name: 'Blessed', slot: 'ring', upside: { stat: 'maxHp', value: 3, isPercentage: true }, downside: { stat: 'maxHp', value: -2, isPercentage: true } },
  { name: 'Lucky', slot: 'ring', upside: { stat: 'critChance', value: 2, isPercentage: true }, downside: { stat: 'accuracy', value: -2, isPercentage: true } },
  { name: 'Standard', slot: 'ring', upside: { stat: 'none', value: 0, isPercentage: false }, downside: { stat: 'none', value: 0, isPercentage: false } },
  { name: 'Protective', slot: 'earring', upside: { stat: 'statusResist', value: 5, isPercentage: true }, downside: { stat: 'critChance', value: -2, isPercentage: true } },
  { name: 'Standard', slot: 'earring', upside: { stat: 'none', value: 0, isPercentage: false }, downside: { stat: 'none', value: 0, isPercentage: false } },
  { name: 'Charged', slot: 'necklace', upside: { stat: 'critDamage', value: 5, isPercentage: true }, downside: { stat: 'defense', value: -3, isPercentage: true } },
  { name: 'Channeling', slot: 'necklace', upside: { stat: 'spCostReduction', value: 5, isPercentage: false }, downside: { stat: 'defense', value: -5, isPercentage: true } },
  { name: 'Standard', slot: 'necklace', upside: { stat: 'none', value: 0, isPercentage: false }, downside: { stat: 'none', value: 0, isPercentage: false } },
  { name: 'Spirited', slot: 'ring', upside: { stat: 'maxSp', value: 8, isPercentage: true }, downside: { stat: 'maxHp', value: -3, isPercentage: true } },
  { name: 'Resonant', slot: 'earring', upside: { stat: 'spRegen', value: 1, isPercentage: false }, downside: { stat: 'accuracy', value: -3, isPercentage: true } },
];

export function getAspectsForSlot(slot: string, weaponType?: string): AspectTemplate[] {
  const aspects = ASPECT_POOLS.filter(f => f.slot === slot);
  if (slot === 'weapon' && weaponType && weaponType !== 'melee') {
    const replaceStat = weaponType === 'ranger' ? 'rangedAttack' : weaponType === 'demolitions' ? 'blastAttack' : 'meleeAttack';
    return aspects.map(f => {
      const needsUpside = f.upside.stat === 'meleeAttack';
      const needsDownside = f.downside.stat === 'meleeAttack';
      if (!needsUpside && !needsDownside) return f;
      return {
        ...f,
        upside: needsUpside ? { ...f.upside, stat: replaceStat } : f.upside,
        downside: needsDownside ? { ...f.downside, stat: replaceStat } : f.downside,
      };
    });
  }
  return aspects;
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
  { slot: 'ring', stat: 'maxSp', minValue: 5, maxValue: 15, isPercentage: false },
  // Earring
  { slot: 'earring', stat: 'statusResist', minValue: 3, maxValue: 8, isPercentage: true },
  { slot: 'earring', stat: 'hpRegen', minValue: 1, maxValue: 3, isPercentage: false },
  { slot: 'earring', stat: 'spCostReduction', minValue: 2, maxValue: 5, isPercentage: false },
  // Necklace
  { slot: 'necklace', stat: 'critDamage', minValue: 5, maxValue: 12, isPercentage: true },
  { slot: 'necklace', stat: 'maxHp', minValue: 15, maxValue: 35, isPercentage: false },
  { slot: 'necklace', stat: 'hpRegen', minValue: 1, maxValue: 3, isPercentage: false },
  { slot: 'necklace', stat: 'spRegen', minValue: 1, maxValue: 2, isPercentage: false },
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
  { slot: 'ring', stat: 'spRegen', minValue: -1, maxValue: -1, isPercentage: false },
  { slot: 'earring', stat: 'accuracy', minValue: -2, maxValue: -5, isPercentage: true },
  { slot: 'necklace', stat: 'hpRegen', minValue: -1, maxValue: -3, isPercentage: false },
  { slot: 'necklace', stat: 'maxSp', minValue: -5, maxValue: -10, isPercentage: true },
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
      { piecesRequired: 6, description: '+15% gathering speed, +10% rare resource chance, +10% Status Resist', effects: [
        { stat: 'gatheringSpeed', value: 15, isPercentage: true },
        { stat: 'rareResourceChance', value: 10, isPercentage: true },
        { stat: 'statusResist', value: 10, isPercentage: true },
      ] },
    ],
  },
  set_raider: {
    id: 'set_raider', name: "Raider's Armor", description: 'Mid-game heavy combat plate. Built for war.',
    tier: 'mid', type: 'combat',
    pieces: ['raider_plate', 'raider_legguards', 'raider_gauntlets', 'raider_boots', 'raider_shield', 'raider_ring'],
    bonuses: [
      { piecesRequired: 2, description: '+15 Defense, +20 Max HP', effects: [{ stat: 'defense', value: 15, isPercentage: false }, { stat: 'maxHp', value: 20, isPercentage: false }] },
      { piecesRequired: 3, description: '+5% Damage Reduction, +10 Max SP', effects: [{ stat: 'damageReduction', value: 5, isPercentage: true }, { stat: 'maxSp', value: 10, isPercentage: false }] },
      { piecesRequired: 4, description: '+10% melee attack, +3 HP Regen', effects: [{ stat: 'meleeAttack', value: 10, isPercentage: true }, { stat: 'hpRegen', value: 3, isPercentage: false }] },
      { piecesRequired: 5, description: '+25% Block Chance, +50 Max HP', effects: [{ stat: 'blockChance', value: 25, isPercentage: true }, { stat: 'maxHp', value: 50, isPercentage: false }] },
      { piecesRequired: 6, description: '+10% all combat stats, +8% Damage Reduction, +20% Status Resist', effects: [
        { stat: 'meleeAttack', value: 10, isPercentage: true },
        { stat: 'rangedAttack', value: 10, isPercentage: true },
        { stat: 'blastAttack', value: 10, isPercentage: true },
        { stat: 'damageReduction', value: 8, isPercentage: true },
        { stat: 'statusResist', value: 20, isPercentage: true },
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
      { piecesRequired: 6, description: '+25% gathering yield, +15% crafting rarity upgrade, +10% Status Resist', effects: [
        { stat: 'gatheringYield', value: 25, isPercentage: true },
        { stat: 'rarityUpgrade', value: 15, isPercentage: true },
        { stat: 'statusResist', value: 10, isPercentage: true },
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
      { piecesRequired: 4, description: '+15% melee attack, +8% Crit Chance, +20 Max SP, +1 SP Regen', effects: [{ stat: 'meleeAttack', value: 15, isPercentage: true }, { stat: 'critChance', value: 8, isPercentage: true }, { stat: 'maxSp', value: 20, isPercentage: false }, { stat: 'spRegen', value: 1, isPercentage: false }] },
      { piecesRequired: 5, description: '+100 Max HP, +10% all attack, +5% Evasion', effects: [{ stat: 'maxHp', value: 100, isPercentage: false }, { stat: 'meleeAttack', value: 10, isPercentage: true }, { stat: 'rangedAttack', value: 10, isPercentage: true }, { stat: 'blastAttack', value: 10, isPercentage: true }, { stat: 'evasion', value: 5, isPercentage: true }] },
      { piecesRequired: 6, description: '+15% Damage Reduction, +20% all combat stats, +10% Lifesteal', effects: [
        { stat: 'damageReduction', value: 15, isPercentage: true },
        { stat: 'meleeAttack', value: 20, isPercentage: true },
        { stat: 'rangedAttack', value: 20, isPercentage: true },
        { stat: 'blastAttack', value: 20, isPercentage: true },
        { stat: 'lifesteal', value: 10, isPercentage: false },
      ] },
      { piecesRequired: 7, description: '+5% Damage Reduction, +200 Max HP, +30% Status Resist', effects: [
        { stat: 'damageReduction', value: 5, isPercentage: false },
        { stat: 'maxHp', value: 200, isPercentage: false },
        { stat: 'statusResist', value: 30, isPercentage: true },
      ] },
    ],
  },
  set_artisan: {
    id: 'set_artisan', name: "Artisan's Ensemble", description: 'Endgame production/gathering set. Master crafter gear.',
    tier: 'endgame', type: 'production',
    pieces: ['artisan_vest', 'artisan_pants', 'artisan_gloves', 'artisan_boots', 'artisan_earring', 'artisan_pendant'],
    bonuses: [
      { piecesRequired: 2, description: '+15% gathering speed, +10% production speed', effects: [{ stat: 'gatheringSpeed', value: 15, isPercentage: true }, { stat: 'productionSpeed', value: 10, isPercentage: true }] },
      { piecesRequired: 3, description: '+20% gathering yield, +15% crafting rarity upgrade, +5 SP Cost Reduction', effects: [{ stat: 'gatheringYield', value: 20, isPercentage: true }, { stat: 'rarityUpgrade', value: 15, isPercentage: true }, { stat: 'spCostReduction', value: 5, isPercentage: false }] },
      { piecesRequired: 4, description: '+15% XP gain, +10% rare resource chance, +5% all attack', effects: [{ stat: 'xpBonus', value: 15, isPercentage: true }, { stat: 'rareResourceChance', value: 10, isPercentage: true }, { stat: 'meleeAttack', value: 5, isPercentage: true }, { stat: 'rangedAttack', value: 5, isPercentage: true }, { stat: 'blastAttack', value: 5, isPercentage: true }] },
      { piecesRequired: 5, description: '+30% gathering yield, +20% production speed, +10% XP bonus', effects: [
        { stat: 'gatheringYield', value: 30, isPercentage: true },
        { stat: 'productionSpeed', value: 20, isPercentage: true },
        { stat: 'xpBonus', value: 10, isPercentage: true },
      ] },
      { piecesRequired: 6, description: '+25% crafting rarity upgrade, +40% gathering yield, double output chance +10%, +10% Status Resist', effects: [
        { stat: 'rarityUpgrade', value: 25, isPercentage: true },
        { stat: 'gatheringYield', value: 40, isPercentage: true },
        { stat: 'doubleOutput', value: 10, isPercentage: true },
        { stat: 'statusResist', value: 10, isPercentage: true },
      ] },
    ],
  },

  // ── SUPPORT SETS ──

  set_watchman: {
    id: 'set_watchman', name: "Watchman's Kit", description: 'Early support set. Keeps the team standing.',
    tier: 'early', type: 'support',
    pieces: ['watchman_vest', 'watchman_pants', 'watchman_gloves', 'watchman_boots', 'watchman_ring', 'watchman_earring'],
    bonuses: [
      { piecesRequired: 2, description: '+10 Max HP, +3 Defense', effects: [{ stat: 'maxHp', value: 10, isPercentage: false }, { stat: 'defense', value: 3, isPercentage: false }] },
      { piecesRequired: 3, description: '+5% Status Resist, +1 HP Regen', effects: [{ stat: 'statusResist', value: 5, isPercentage: true }, { stat: 'hpRegen', value: 1, isPercentage: false }] },
      { piecesRequired: 4, description: '+30 Max HP, +5% Damage Reduction', effects: [{ stat: 'maxHp', value: 30, isPercentage: false }, { stat: 'damageReduction', value: 5, isPercentage: true }] },
      { piecesRequired: 5, description: '+10 Max SP, +1 SP Regen', effects: [{ stat: 'maxSp', value: 10, isPercentage: false }, { stat: 'spRegen', value: 1, isPercentage: false }] },
      { piecesRequired: 6, description: '+8% Damage Reduction, +50 Max HP, +10% Status Resist', effects: [
        { stat: 'damageReduction', value: 8, isPercentage: true },
        { stat: 'maxHp', value: 50, isPercentage: false },
        { stat: 'statusResist', value: 10, isPercentage: true },
      ] },
    ],
  },
  set_ironclad: {
    id: 'set_ironclad', name: 'Ironclad Bulwark', description: 'Mid-game Guardian tank set. An unbreakable wall.',
    tier: 'mid', type: 'support',
    pieces: ['ironclad_plate', 'ironclad_legguards', 'ironclad_gauntlets', 'ironclad_boots', 'ironclad_shield', 'ironclad_pendant'],
    bonuses: [
      { piecesRequired: 2, description: '+20 Defense, +40 Max HP', effects: [{ stat: 'defense', value: 20, isPercentage: false }, { stat: 'maxHp', value: 40, isPercentage: false }] },
      { piecesRequired: 3, description: '+8% Block Chance, +5% Thorns', effects: [{ stat: 'blockChance', value: 8, isPercentage: true }, { stat: 'thornsDamage', value: 5, isPercentage: true }] },
      { piecesRequired: 4, description: '+8% Damage Reduction, +3 HP Regen, +60 Max HP', effects: [{ stat: 'damageReduction', value: 8, isPercentage: true }, { stat: 'hpRegen', value: 3, isPercentage: false }, { stat: 'maxHp', value: 60, isPercentage: false }] },
      { piecesRequired: 5, description: '+15% Block Chance, +10% Thorns, +20 Max SP', effects: [{ stat: 'blockChance', value: 15, isPercentage: true }, { stat: 'thornsDamage', value: 10, isPercentage: true }, { stat: 'maxSp', value: 20, isPercentage: false }] },
      { piecesRequired: 6, description: '+12% Damage Reduction, +100 Max HP, +20% Status Resist', effects: [
        { stat: 'damageReduction', value: 12, isPercentage: true },
        { stat: 'maxHp', value: 100, isPercentage: false },
        { stat: 'statusResist', value: 20, isPercentage: true },
      ] },
    ],
  },
  set_triage: {
    id: 'set_triage', name: 'Triage Rig', description: 'Mid-game Field Medic set. Keeps everyone alive.',
    tier: 'mid', type: 'support',
    pieces: ['triage_vest', 'triage_pants', 'triage_gloves', 'triage_boots', 'triage_earring', 'triage_pendant'],
    bonuses: [
      { piecesRequired: 2, description: '+2 HP Regen, +20 Max HP', effects: [{ stat: 'hpRegen', value: 2, isPercentage: false }, { stat: 'maxHp', value: 20, isPercentage: false }] },
      { piecesRequired: 3, description: '+10% Status Resist, +4% Evasion', effects: [{ stat: 'statusResist', value: 10, isPercentage: true }, { stat: 'evasion', value: 4, isPercentage: true }] },
      { piecesRequired: 4, description: '+5 HP Regen, +50 Max HP, +15 Max SP', effects: [{ stat: 'hpRegen', value: 5, isPercentage: false }, { stat: 'maxHp', value: 50, isPercentage: false }, { stat: 'maxSp', value: 15, isPercentage: false }] },
      { piecesRequired: 5, description: '+15% Status Resist, +8% Evasion, +1 SP Regen', effects: [{ stat: 'statusResist', value: 15, isPercentage: true }, { stat: 'evasion', value: 8, isPercentage: true }, { stat: 'spRegen', value: 1, isPercentage: false }] },
      { piecesRequired: 6, description: '+8 HP Regen, +100 Max HP, +5% Lifesteal', effects: [
        { stat: 'hpRegen', value: 8, isPercentage: false },
        { stat: 'maxHp', value: 100, isPercentage: false },
        { stat: 'lifesteal', value: 5, isPercentage: true },
      ] },
    ],
  },
  set_alchemist: {
    id: 'set_alchemist', name: "Alchemist's Array", description: 'Mid-game Chemist set. Amplifies abilities.',
    tier: 'mid', type: 'support',
    pieces: ['alchemist_coat', 'alchemist_pants', 'alchemist_gloves', 'alchemist_boots', 'alchemist_ring', 'alchemist_earring'],
    bonuses: [
      { piecesRequired: 2, description: '+8% Ability Power, +15 Max SP', effects: [{ stat: 'abilityPower', value: 8, isPercentage: true }, { stat: 'maxSp', value: 15, isPercentage: false }] },
      { piecesRequired: 3, description: '+5 SP Cost Reduction, +15% Status Resist', effects: [{ stat: 'spCostReduction', value: 5, isPercentage: false }, { stat: 'statusResist', value: 15, isPercentage: true }] },
      { piecesRequired: 4, description: '+15% Ability Power, +30 Max SP, +2 SP Regen', effects: [{ stat: 'abilityPower', value: 15, isPercentage: true }, { stat: 'maxSp', value: 30, isPercentage: false }, { stat: 'spRegen', value: 2, isPercentage: false }] },
      { piecesRequired: 5, description: '+10 SP Cost Reduction, +20% Status Resist, +50 Max HP', effects: [{ stat: 'spCostReduction', value: 10, isPercentage: false }, { stat: 'statusResist', value: 20, isPercentage: true }, { stat: 'maxHp', value: 50, isPercentage: false }] },
      { piecesRequired: 6, description: '+25% Ability Power, +50 Max SP, +4 SP Regen, +10% Damage Reduction', effects: [
        { stat: 'abilityPower', value: 25, isPercentage: true },
        { stat: 'maxSp', value: 50, isPercentage: false },
        { stat: 'spRegen', value: 4, isPercentage: false },
        { stat: 'damageReduction', value: 10, isPercentage: true },
      ] },
    ],
  },
  set_citadel: {
    id: 'set_citadel', name: 'Citadel Warden', description: 'Endgame Guardian fortress set. Immovable.',
    tier: 'endgame', type: 'support',
    pieces: ['citadel_plate', 'citadel_legguards', 'citadel_gauntlets', 'citadel_boots', 'citadel_shield', 'citadel_ring', 'citadel_pendant'],
    bonuses: [
      { piecesRequired: 2, description: '+40 Defense, +80 Max HP', effects: [{ stat: 'defense', value: 40, isPercentage: false }, { stat: 'maxHp', value: 80, isPercentage: false }] },
      { piecesRequired: 3, description: '+15% Block Chance, +10% Thorns', effects: [{ stat: 'blockChance', value: 15, isPercentage: true }, { stat: 'thornsDamage', value: 10, isPercentage: true }] },
      { piecesRequired: 4, description: '+12% Damage Reduction, +5 HP Regen, +120 Max HP', effects: [{ stat: 'damageReduction', value: 12, isPercentage: true }, { stat: 'hpRegen', value: 5, isPercentage: false }, { stat: 'maxHp', value: 120, isPercentage: false }] },
      { piecesRequired: 5, description: '+20% Block Chance, +15% Thorns, +30 Max SP', effects: [{ stat: 'blockChance', value: 20, isPercentage: true }, { stat: 'thornsDamage', value: 15, isPercentage: true }, { stat: 'maxSp', value: 30, isPercentage: false }] },
      { piecesRequired: 6, description: '+18% Damage Reduction, +200 Max HP, +30% Status Resist', effects: [
        { stat: 'damageReduction', value: 18, isPercentage: true },
        { stat: 'maxHp', value: 200, isPercentage: false },
        { stat: 'statusResist', value: 30, isPercentage: true },
      ] },
      { piecesRequired: 7, description: '+5% Damage Reduction, +25% Block, +20% Thorns', effects: [
        { stat: 'damageReduction', value: 5, isPercentage: true },
        { stat: 'blockChance', value: 25, isPercentage: true },
        { stat: 'thornsDamage', value: 20, isPercentage: true },
      ] },
    ],
  },
  set_lifeline: {
    id: 'set_lifeline', name: 'Lifeline Apparatus', description: 'Endgame Field Medic set. Unbreakable sustain.',
    tier: 'endgame', type: 'support',
    pieces: ['lifeline_vest', 'lifeline_pants', 'lifeline_gloves', 'lifeline_boots', 'lifeline_earring', 'lifeline_ring', 'lifeline_pendant'],
    bonuses: [
      { piecesRequired: 2, description: '+4 HP Regen, +40 Max HP', effects: [{ stat: 'hpRegen', value: 4, isPercentage: false }, { stat: 'maxHp', value: 40, isPercentage: false }] },
      { piecesRequired: 3, description: '+15% Status Resist, +8% Evasion', effects: [{ stat: 'statusResist', value: 15, isPercentage: true }, { stat: 'evasion', value: 8, isPercentage: true }] },
      { piecesRequired: 4, description: '+8 HP Regen, +100 Max HP, +25 Max SP', effects: [{ stat: 'hpRegen', value: 8, isPercentage: false }, { stat: 'maxHp', value: 100, isPercentage: false }, { stat: 'maxSp', value: 25, isPercentage: false }] },
      { piecesRequired: 5, description: '+25% Status Resist, +12% Evasion, +2 SP Regen', effects: [{ stat: 'statusResist', value: 25, isPercentage: true }, { stat: 'evasion', value: 12, isPercentage: true }, { stat: 'spRegen', value: 2, isPercentage: false }] },
      { piecesRequired: 6, description: '+12 HP Regen, +200 Max HP, +8% Lifesteal', effects: [
        { stat: 'hpRegen', value: 12, isPercentage: false },
        { stat: 'maxHp', value: 200, isPercentage: false },
        { stat: 'lifesteal', value: 8, isPercentage: true },
      ] },
      { piecesRequired: 7, description: '+5 HP Regen, +10% Evasion, +5% Damage Reduction', effects: [
        { stat: 'hpRegen', value: 5, isPercentage: false },
        { stat: 'evasion', value: 10, isPercentage: true },
        { stat: 'damageReduction', value: 5, isPercentage: true },
      ] },
    ],
  },
  set_catalyst: {
    id: 'set_catalyst', name: 'Catalyst Engine', description: 'Endgame Chemist set. Unlimited power.',
    tier: 'endgame', type: 'support',
    pieces: ['catalyst_harness', 'catalyst_pants', 'catalyst_gloves', 'catalyst_boots', 'catalyst_ring', 'catalyst_earring', 'catalyst_pendant'],
    bonuses: [
      { piecesRequired: 2, description: '+15% Ability Power, +25 Max SP', effects: [{ stat: 'abilityPower', value: 15, isPercentage: true }, { stat: 'maxSp', value: 25, isPercentage: false }] },
      { piecesRequired: 3, description: '+8 SP Cost Reduction, +20% Status Resist', effects: [{ stat: 'spCostReduction', value: 8, isPercentage: false }, { stat: 'statusResist', value: 20, isPercentage: true }] },
      { piecesRequired: 4, description: '+25% Ability Power, +50 Max SP, +3 SP Regen', effects: [{ stat: 'abilityPower', value: 25, isPercentage: true }, { stat: 'maxSp', value: 50, isPercentage: false }, { stat: 'spRegen', value: 3, isPercentage: false }] },
      { piecesRequired: 5, description: '+15 SP Cost Reduction, +30% Status Resist, +100 Max HP', effects: [{ stat: 'spCostReduction', value: 15, isPercentage: false }, { stat: 'statusResist', value: 30, isPercentage: true }, { stat: 'maxHp', value: 100, isPercentage: false }] },
      { piecesRequired: 6, description: '+40% Ability Power, +80 Max SP, +6 SP Regen, +15% Damage Reduction', effects: [
        { stat: 'abilityPower', value: 40, isPercentage: true },
        { stat: 'maxSp', value: 80, isPercentage: false },
        { stat: 'spRegen', value: 6, isPercentage: false },
        { stat: 'damageReduction', value: 15, isPercentage: true },
      ] },
      { piecesRequired: 7, description: '+20% Ability Power, +10% Damage Reduction, +10 SP Cost Reduction', effects: [
        { stat: 'abilityPower', value: 20, isPercentage: true },
        { stat: 'damageReduction', value: 10, isPercentage: true },
        { stat: 'spCostReduction', value: 10, isPercentage: false },
      ] },
    ],
  },
};
