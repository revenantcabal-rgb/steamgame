import { useState } from 'react';
import { useHeroStore } from '../../store/useHeroStore';
import { useEquipmentStore } from '../../store/useEquipmentStore';
import { useStoryStore } from '../../store/useStoryStore';
import { useGameStore } from '../../store/useGameStore';
import { CLASS_LIST, CLASSES } from '../../config/classes';
import { CATEGORIES } from '../../config/categories';
import { GEAR_TEMPLATES } from '../../config/gear';
import { ABILITIES, ABILITY_COLOR_HEX } from '../../config/abilities';
import type { AbilityTome } from '../../config/abilities';
import { CONSUMABLES } from '../../config/consumables';
import { getTotalStats, calculateDerivedStats, getEquippedGear, getBaseStatTotal } from '../../engine/HeroEngine';
import type { Hero, PrimaryStats } from '../../types/hero';
import { ALL_EQUIPMENT_SLOTS, RARITY_COLORS, RARITY_LABELS } from '../../types/equipment';
import type { EquipmentSlot, GearInstance } from '../../types/equipment';
import { ProgressBar } from '../common/ProgressBar';
import { xpForLevel } from '../../types/skills';
import { ItemIcon } from '../../utils/itemIcons';

const CATEGORY_COLORS: Record<string, string> = {
  skirmisher: '#27ae60',
  control: '#3498db',
  support: '#9b59b6',
  assault: '#e74c3c',
  artisan: '#f39c12',
};

const STAT_COLORS: Record<string, string> = {
  str: '#e74c3c',
  dex: '#27ae60',
  int: '#3498db',
  con: '#f39c12',
  per: '#9b59b6',
  luk: '#1abc9c',
  res: '#e879f9',
};

const STAT_LABELS: Record<string, string> = {
  str: 'STR', dex: 'DEX', int: 'INT', con: 'CON', per: 'PER', luk: 'LUK', res: 'RES',
};

const STAT_FULL_NAMES: Record<string, string> = {
  str: 'Strength', dex: 'Dexterity', int: 'Intelligence', con: 'Constitution', per: 'Perception', luk: 'Luck', res: 'Resolve',
};

const STAT_DESCRIPTIONS: Record<string, string> = {
  str: '+2 Melee Attack, +1 Defense per point',
  dex: '+2 Ranged Attack, +0.5 Turn Speed per point',
  int: '+2 Blast Attack, +1% Crit Damage per point',
  con: '+10 Max HP, +1.5 Defense, +0.5 HP Regen per point',
  per: '+0.8% Accuracy, +0.5% Crit Chance per point',
  luk: '+0.5% Evasion, +0.5% Status Resist per point',
  res: '+1% Ability Power, Unlock Ability Slots per point',
};

export function HeroPanel() {
  const heroes = useHeroStore(s => s.heroes);
  const selectedHeroId = useHeroStore(s => s.selectedHeroId);
  const selectHero = useHeroStore(s => s.selectHero);
  const [showRecruit, setShowRecruit] = useState(false);

  const selectedHero = heroes.find(h => h.id === selectedHeroId);

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Hero List */}
      <div className="w-72 shrink-0 overflow-y-auto p-3 space-y-2" style={{ borderRight: '1px solid var(--color-border)' }}>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>
            Roster ({heroes.length})
          </h3>
          <button
            onClick={() => setShowRecruit(!showRecruit)}
            className="px-3 py-1 rounded text-xs font-bold cursor-pointer"
            style={{ backgroundColor: 'var(--color-accent)', color: '#000', border: 'none' }}
          >
            + Recruit
          </button>
        </div>

        {showRecruit && <RecruitPanel onClose={() => setShowRecruit(false)} />}

        {heroes.length === 0 ? (
          <div className="text-xs text-center p-4" style={{ color: 'var(--color-text-muted)' }}>
            No heroes yet. Click Recruit to enlist your first fighter.
          </div>
        ) : (
          heroes.map(hero => (
            <HeroListCard
              key={hero.id}
              hero={hero}
              isSelected={hero.id === selectedHeroId}
              onClick={() => selectHero(hero.id === selectedHeroId ? null : hero.id)}
            />
          ))
        )}
      </div>

      {/* Hero Detail */}
      <div className="flex-1 overflow-y-auto p-6">
        {selectedHero ? (
          <HeroDetail hero={selectedHero} />
        ) : (
          <div className="flex items-center justify-center h-full" style={{ color: 'var(--color-text-muted)' }}>
            <div className="text-center">
              <div className="text-4xl mb-4">&#9876;</div>
              <div className="text-lg mb-2">Select a Hero</div>
              <div className="text-sm">Choose a hero from the roster or recruit a new one.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function HeroListCard({ hero, isSelected, onClick }: { hero: Hero; isSelected: boolean; onClick: () => void }) {
  const classDef = CLASSES[hero.classId];
  const catColor = CATEGORY_COLORS[classDef?.categoryId || ''] || '#888';

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-3 rounded border transition-all cursor-pointer"
      style={{
        backgroundColor: isSelected ? 'var(--color-bg-tertiary)' : 'var(--color-bg-secondary)',
        borderColor: isSelected ? catColor : 'var(--color-border)',
        borderWidth: isSelected ? '2px' : '1px',
      }}
    >
      <div className="flex justify-between items-center mb-1">
        <span className="font-bold text-xs" style={{ color: 'var(--color-text-primary)' }}>{hero.name}</span>
        <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: catColor + '22', color: catColor }}>
          Lv.{hero.level}
        </span>
      </div>
      <div className="text-xs" style={{ color: catColor }}>
        {classDef?.name || hero.classId}
        <span style={{ color: 'var(--color-text-muted)' }}> | {classDef?.heroType === 'specialist' ? 'Specialist' : 'Combat'}</span>
      </div>
      {hero.unspentPoints > 0 && (
        <div className="text-xs mt-1" style={{ color: 'var(--color-accent)' }}>
          {hero.unspentPoints} unspent points!
        </div>
      )}
    </button>
  );
}

function HeroDetail({ hero }: { hero: Hero }) {
  const allocateStat = useHeroStore(s => s.allocateStat);
  const allocateMultiple = useHeroStore(s => s.allocateMultiple);
  const dismissHero = useHeroStore(s => s.dismissHero);
  const classDef = CLASSES[hero.classId];
  const category = CATEGORIES[classDef?.categoryId || ''];
  const heroEquipment = useEquipmentStore(s => s.heroEquipment);
  const inventory = useEquipmentStore(s => s.inventory);
  const totalStats = getTotalStats(hero);
  const equippedGear = getEquippedGear(hero.id, heroEquipment, inventory);
  const derived = calculateDerivedStats(hero, equippedGear);
  const catColor = CATEGORY_COLORS[classDef?.categoryId || ''] || '#888';

  const currentLevelXp = xpForLevel(hero.level);
  const nextLevelXp = xpForLevel(hero.level + 1);
  const xpIntoLevel = hero.xp - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{hero.name}</h2>
          <div className="flex gap-2 items-center mt-1">
            <span className="text-sm font-bold" style={{ color: catColor }}>{classDef?.name}</span>
            <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: catColor + '22', color: catColor }}>
              {category?.name}
            </span>
            <span className="text-xs px-2 py-0.5 rounded" style={{
              backgroundColor: classDef?.heroType === 'specialist' ? '#f39c1222' : '#e74c3c22',
              color: classDef?.heroType === 'specialist' ? '#f39c12' : '#e74c3c',
            }}>
              {classDef?.heroType === 'specialist' ? 'Specialist' : 'Combat'}
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{classDef?.description}</p>
        </div>
        <button
          onClick={() => { if (confirm(`Dismiss ${hero.name}? This is permanent.`)) dismissHero(hero.id); }}
          className="px-3 py-1 rounded text-xs cursor-pointer"
          style={{ backgroundColor: 'var(--color-danger)', color: '#fff', border: 'none' }}
        >
          Dismiss
        </button>
      </div>

      {/* Level & XP */}
      <div className="p-3 rounded mb-4" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
        <div className="flex justify-between items-center mb-1">
          <span className="font-bold text-sm">Level {hero.level}</span>
          {hero.level < 100 && (
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {xpIntoLevel.toLocaleString()} / {xpNeeded.toLocaleString()} XP
            </span>
          )}
        </div>
        <ProgressBar value={xpIntoLevel} max={xpNeeded} color="var(--color-xp)" height="8px" />
      </div>

      {/* Primary Stats + Allocation */}
      <div className="p-3 rounded mb-4" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-sm">Primary Attributes</h3>
          {hero.unspentPoints > 0 && (
            <span className="text-xs font-bold" style={{ color: 'var(--color-accent)' }}>
              {hero.unspentPoints} points to spend
            </span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(STAT_LABELS) as (keyof PrimaryStats)[]).map(stat => (
            <div key={stat} className="p-2 rounded" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold" style={{ color: STAT_COLORS[stat] }}>{STAT_LABELS[stat]}</span>
                  <span className="text-sm font-bold ml-2" style={{ color: 'var(--color-text-primary)' }}>{totalStats[stat]}</span>
                  <span className="text-xs ml-1" style={{ color: 'var(--color-text-muted)' }}>
                    ({hero.baseStats[stat]}+{hero.allocatedStats[stat]})
                  </span>
                </div>
                {hero.unspentPoints > 0 && (
                  <div className="flex gap-1">
                    <button onClick={() => allocateStat(hero.id, stat)}
                      className="w-6 h-6 rounded text-xs font-bold cursor-pointer flex items-center justify-center"
                      style={{ backgroundColor: STAT_COLORS[stat], color: '#000', border: 'none' }}>+</button>
                    {hero.unspentPoints >= 5 && (
                      <button onClick={() => allocateMultiple(hero.id, stat, 5)}
                        className="w-8 h-6 rounded text-xs font-bold cursor-pointer flex items-center justify-center"
                        style={{ backgroundColor: STAT_COLORS[stat] + '88', color: '#000', border: 'none' }}>+5</button>
                    )}
                  </div>
                )}
              </div>
              <div style={{ fontSize: '9px', color: STAT_COLORS[stat] + 'aa', marginTop: '2px', lineHeight: '1.2' }}>
                {STAT_FULL_NAMES[stat]}: {STAT_DESCRIPTIONS[stat]}
              </div>
            </div>
          ))}
        </div>
        <div className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
          Base stat total: {getBaseStatTotal(hero)} | Combat style: {classDef?.primaryCombatStyle}
        </div>
      </div>

      {/* Derived Stats */}
      <div className="p-3 rounded mb-4" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
        <h3 className="font-bold text-sm mb-2">Combat Stats</h3>
        <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-xs">
          <DerivedRow label="Max HP" value={derived.maxHp.toFixed(0)} />
          <DerivedRow label="Melee Atk" value={derived.meleeAttack.toFixed(0)} />
          <DerivedRow label="Ranged Atk" value={derived.rangedAttack.toFixed(0)} />
          <DerivedRow label="Blast Atk" value={derived.blastAttack.toFixed(0)} />
          <DerivedRow label="Defense" value={derived.defense.toFixed(0)} suffix="(gear)" />
          <DerivedRow label="Evasion" value={derived.evasion.toFixed(1) + '%'} />
          <DerivedRow label="Accuracy" value={derived.accuracy.toFixed(1) + '%'} />
          <DerivedRow label="Crit Chance" value={derived.critChance.toFixed(1) + '%'} />
          <DerivedRow label="Crit Dmg" value={derived.critDamage.toFixed(0) + '%'} />
          <DerivedRow label="Turn Speed" value={derived.turnSpeed.toFixed(1)} />
          <DerivedRow label="HP Regen" value={derived.hpRegen.toFixed(1) + '/turn'} />
          <DerivedRow label="Status Resist" value={derived.statusResist.toFixed(1) + '%'} />
          <DerivedRow label="Ability Power" value={'+' + derived.abilityPower + '%'} />
          <DerivedRow label="Skill Slots" value={derived.abilitySlots + '/4'} />
          <DerivedRow label="Decree Slot" value={derived.canEquipAura ? 'Unlocked' : 'Need RES 50'} />
          <DerivedRow label="Max SP" value={derived.maxSp.toFixed(0)} />
          <DerivedRow label="SP Regen" value={derived.spRegen.toFixed(1) + '/turn'} />
          <DerivedRow label="SP Cost Reduction" value={derived.spCostReduction.toFixed(0) + '%'} />
          <DerivedRow label="Consumable Slots" value={derived.consumableSlots + '/6'} />
        </div>
      </div>

      {/* Extended Combat Stats */}
      {(derived.lifesteal > 0 || derived.burnDot > 0 || derived.poisonDot > 0 || derived.frostSlow > 0 ||
        derived.thornsDamage > 0 || derived.blockChance > 0 || derived.armorPen > 0 || derived.damageReduction > 0) && (
        <div className="p-3 rounded mb-4" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
          <h3 className="font-bold text-sm mb-2">Extended Combat</h3>
          <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-xs">
            {derived.lifesteal > 0 && <DerivedRow label="Lifesteal" value={derived.lifesteal.toFixed(1) + '%'} />}
            {derived.burnDot > 0 && <DerivedRow label="Burn DoT" value={derived.burnDot.toFixed(1) + '%'} />}
            {derived.poisonDot > 0 && <DerivedRow label="Poison DoT" value={derived.poisonDot.toFixed(1) + '%'} />}
            {derived.frostSlow > 0 && <DerivedRow label="Frost Slow" value={derived.frostSlow.toFixed(1)} />}
            {derived.thornsDamage > 0 && <DerivedRow label="Thorns Dmg" value={derived.thornsDamage.toFixed(1) + '%'} />}
            {derived.blockChance > 0 && <DerivedRow label="Block Chance" value={derived.blockChance.toFixed(1) + '%'} />}
            {derived.armorPen > 0 && <DerivedRow label="Armor Pen" value={derived.armorPen.toFixed(1) + '%'} />}
            {derived.damageReduction > 0 && <DerivedRow label="Dmg Reduction" value={derived.damageReduction.toFixed(1) + '%'} />}
          </div>
        </div>
      )}

      {/* Utility Bonuses */}
      {(derived.dropChance > 0 || derived.gatheringSpeed > 0 || derived.gatheringYield > 0 || derived.productionSpeed > 0 ||
        derived.xpBonus > 0 || derived.rareResourceChance > 0 || derived.rarityUpgrade > 0 || derived.doubleOutput > 0) && (
        <div className="p-3 rounded mb-4" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
          <h3 className="font-bold text-sm mb-2">Utility Bonuses</h3>
          <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-xs">
            {derived.dropChance > 0 && <DerivedRow label="Drop Chance" value={'+' + derived.dropChance.toFixed(1) + '%'} />}
            {derived.gatheringSpeed > 0 && <DerivedRow label="Gather Speed" value={'+' + derived.gatheringSpeed.toFixed(1) + '%'} />}
            {derived.gatheringYield > 0 && <DerivedRow label="Gather Yield" value={'+' + derived.gatheringYield.toFixed(1) + '%'} />}
            {derived.productionSpeed > 0 && <DerivedRow label="Prod Speed" value={'+' + derived.productionSpeed.toFixed(1) + '%'} />}
            {derived.xpBonus > 0 && <DerivedRow label="XP Bonus" value={'+' + derived.xpBonus.toFixed(1) + '%'} />}
            {derived.rareResourceChance > 0 && <DerivedRow label="Rare Resource" value={'+' + derived.rareResourceChance.toFixed(1) + '%'} />}
            {derived.rarityUpgrade > 0 && <DerivedRow label="Rarity Upgrade" value={'+' + derived.rarityUpgrade.toFixed(1) + '%'} />}
            {derived.doubleOutput > 0 && <DerivedRow label="Double Output" value={'+' + derived.doubleOutput.toFixed(1) + '%'} />}
          </div>
        </div>
      )}

      {/* Equipment */}
      <HeroEquipmentSection heroId={hero.id} />

      {/* Ability Slots */}
      <HeroAbilitySection hero={hero} derived={derived} />

      {/* Consumable Bag */}
      <HeroConsumableSection hero={hero} derived={derived} />

      {/* Category Aura */}
      <div className="p-3 rounded" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
        <h3 className="font-bold text-sm mb-1" style={{ color: catColor }}>{category?.name} Bonus</h3>
        <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{category?.decreeDescription}</div>
        <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Skirmish: {category?.skirmishDescription}</div>
      </div>
    </div>
  );
}

function HeroEquipmentSection({ heroId }: { heroId: string }) {
  const heroEquipment = useEquipmentStore(s => s.heroEquipment);
  const inventory = useEquipmentStore(s => s.inventory);
  const equipItem = useEquipmentStore(s => s.equipItem);
  const unequipItem = useEquipmentStore(s => s.unequipItem);
  const [expandedSlot, setExpandedSlot] = useState<EquipmentSlot | null>(null);

  const equipped = heroEquipment[heroId] || {};

  // Get all equipped instance IDs across all heroes (to exclude from available list)
  const allEquippedIds = new Set<string>();
  for (const eq of Object.values(heroEquipment)) {
    for (const v of Object.values(eq)) {
      if (v) allEquippedIds.add(v);
    }
  }

  return (
    <div className="p-3 rounded mb-4" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
      <h3 className="font-bold text-sm mb-2">Equipment</h3>
      <div className="grid grid-cols-2 gap-1">
        {ALL_EQUIPMENT_SLOTS.map(({ slot, label, category }) => {
          const equippedId = (equipped as Record<string, string | null>)[slot] || null;
          const equippedGear = equippedId ? inventory.find(g => g.instanceId === equippedId) : null;
          const equippedTemplate = equippedGear ? GEAR_TEMPLATES[equippedGear.templateId] : null;
          const isExpanded = expandedSlot === slot;

          // Filter available gear for this slot category
          const available = inventory.filter(g => {
            if (equippedId && g.instanceId === equippedId) return false; // already in this slot
            if (allEquippedIds.has(g.instanceId)) return false; // equipped elsewhere
            const tmpl = GEAR_TEMPLATES[g.templateId];
            if (!tmpl) return false;
            // Match slot category (rings go in ring1/ring2/ring3, etc.)
            if (tmpl.slot !== category) return false;
            // ring3 is special: only stat focus rings
            if (slot === 'ring3' && !tmpl.statFocusRing) return false;
            if ((slot === 'ring1' || slot === 'ring2') && tmpl.statFocusRing) return false;
            return true;
          });

          return (
            <div key={slot}>
              <button
                onClick={() => setExpandedSlot(isExpanded ? null : slot)}
                className="w-full text-left p-2 rounded text-xs cursor-pointer"
                style={{
                  backgroundColor: 'var(--color-bg-tertiary)',
                  border: `1px solid ${isExpanded ? 'var(--color-accent)' : 'var(--color-border)'}`,
                }}
              >
                <div className="flex justify-between items-center">
                  <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>
                  {equippedGear && equippedTemplate ? (
                    <span className="font-bold flex items-center gap-1" style={{ color: RARITY_COLORS[equippedGear.rarity] }}>
                      <ItemIcon itemId={equippedTemplate.id} itemType="equipment" gearSlot={equippedTemplate.slot} size={18} fallbackLabel={equippedTemplate.name.charAt(0)} />
                      {equippedGear.facet ? `${equippedGear.facet.name} ` : ''}{equippedTemplate.name}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Empty</span>
                  )}
                </div>
                {equippedGear && equippedTemplate && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {equippedTemplate.baseStats.map((s, i) => (
                      <span key={i} style={{ color: 'var(--color-success)', fontSize: 9 }}>
                        +{Math.round(s.value * equippedGear.sourcePowerMultiplier)} {s.stat}{s.isPercentage ? '%' : ''}
                      </span>
                    ))}
                  </div>
                )}
              </button>

              {isExpanded && (
                <div className="mt-1 p-2 rounded space-y-1" style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)' }}>
                  {equippedGear && (
                    <button onClick={() => { unequipItem(heroId, slot); setExpandedSlot(null); }}
                      className="w-full text-left p-1.5 rounded text-xs cursor-pointer"
                      style={{ backgroundColor: 'var(--color-danger)', color: '#fff', border: 'none' }}>
                      Unequip {equippedTemplate?.name}
                    </button>
                  )}
                  {available.length === 0 && !equippedGear && (
                    <div className="text-xs p-1" style={{ color: 'var(--color-text-muted)' }}>No gear available for this slot.</div>
                  )}
                  {available.map(gear => {
                    const tmpl = GEAR_TEMPLATES[gear.templateId];
                    if (!tmpl) return null;
                    return (
                      <button key={gear.instanceId}
                        onClick={() => { equipItem(heroId, slot, gear.instanceId); setExpandedSlot(null); }}
                        className="w-full text-left p-1.5 rounded text-xs cursor-pointer"
                        style={{ backgroundColor: 'var(--color-bg-tertiary)', border: `1px solid ${RARITY_COLORS[gear.rarity]}44`, color: 'var(--color-text-primary)' }}>
                        <div className="font-bold flex items-center gap-1" style={{ color: RARITY_COLORS[gear.rarity] }}>
                          <ItemIcon itemId={tmpl.id} itemType="equipment" gearSlot={tmpl.slot} size={18} fallbackLabel={tmpl.name.charAt(0)} />
                          {gear.facet ? `${gear.facet.name} ` : ''}{tmpl.name} [{RARITY_LABELS[gear.rarity]}]
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {tmpl.baseStats.map((s, i) => (
                            <span key={i} style={{ color: 'var(--color-success)', fontSize: 9 }}>
                              +{Math.round(s.value * gear.sourcePowerMultiplier)} {s.stat}{s.isPercentage ? '%' : ''}
                            </span>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HeroAbilitySection({ hero, derived }: { hero: Hero; derived: ReturnType<typeof calculateDerivedStats> }) {
  const ownedAbilities = useHeroStore(s => s.ownedAbilities);
  const equipAbility = useHeroStore(s => s.equipAbility);
  const unequipAbility = useHeroStore(s => s.unequipAbility);
  const equipDecree = useHeroStore(s => s.equipDecree);
  const unequipDecree = useHeroStore(s => s.unequipDecree);
  const heroes = useHeroStore(s => s.heroes);
  const [expandedSlot, setExpandedSlot] = useState<number | 'decree' | null>(null);

  const equippedAbilities = hero.equippedAbilities || [null, null, null, null];
  const equippedDecree = hero.equippedDecree || null;
  const totalStats = getTotalStats(hero);

  // Collect all ability IDs equipped on OTHER heroes
  const equippedElsewhere = new Set<string>();
  for (const h of heroes) {
    if (h.id === hero.id) continue;
    for (const aid of (h.equippedAbilities || [])) {
      if (aid) equippedElsewhere.add(aid);
    }
    if (h.equippedDecree) equippedElsewhere.add(h.equippedDecree);
  }

  const meetsRequirements = (ability: AbilityTome): boolean => {
    for (const req of ability.requirements) {
      const statKey = req.stat as keyof PrimaryStats;
      if ((totalStats[statKey] || 0) < req.value) return false;
    }
    return true;
  };

  const getAvailableForSlot = (slotIndex: number): AbilityTome[] => {
    return ownedAbilities
      .map(id => ABILITIES[id])
      .filter((a): a is AbilityTome => {
        if (!a) return false;
        if (a.isDecree) return false; // decrees go in decree slot only
        if (equippedElsewhere.has(a.id)) return false;
        // Don't show abilities already equipped in other slots on this hero
        for (let i = 0; i < 4; i++) {
          if (i !== slotIndex && equippedAbilities[i] === a.id) return false;
        }
        if (equippedDecree === a.id) return false;
        return meetsRequirements(a);
      });
  };

  const getAvailableDecrees = (): AbilityTome[] => {
    return ownedAbilities
      .map(id => ABILITIES[id])
      .filter((a): a is AbilityTome => {
        if (!a) return false;
        if (!a.isDecree) return false;
        if (equippedElsewhere.has(a.id)) return false;
        return meetsRequirements(a);
      });
  };

  return (
    <div className="p-3 rounded mb-4" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
      <h3 className="font-bold text-sm mb-2">Ability Slots ({derived.abilitySlots}/4 unlocked)</h3>
      <div className="space-y-1">
        {[0, 1, 2, 3].map(slotIndex => {
          const resNeeded = [1, 30, 60, 90][slotIndex];
          const unlocked = slotIndex < derived.abilitySlots;
          const equippedId = equippedAbilities[slotIndex];
          const equippedAbility = equippedId ? ABILITIES[equippedId] : null;
          const isExpanded = expandedSlot === slotIndex;

          return (
            <div key={slotIndex}>
              <button
                onClick={() => unlocked && setExpandedSlot(isExpanded ? null : slotIndex)}
                className="w-full text-left p-2 rounded cursor-pointer"
                style={{
                  backgroundColor: unlocked ? 'var(--color-bg-tertiary)' : 'var(--color-bg-primary)',
                  opacity: unlocked ? 1 : 0.4,
                  border: `1px solid ${isExpanded ? 'var(--color-accent)' : equippedAbility ? ABILITY_COLOR_HEX[equippedAbility.color] + '66' : 'var(--color-border)'}`,
                  borderLeft: equippedAbility ? `3px solid ${ABILITY_COLOR_HEX[equippedAbility.color]}` : undefined,
                }}
              >
                {unlocked ? (
                  equippedAbility ? (
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold" style={{ color: ABILITY_COLOR_HEX[equippedAbility.color] }}>
                          Slot {slotIndex + 1}: {equippedAbility.name}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          {equippedAbility.isPassive ? 'Passive' : `SP: ${equippedAbility.spCost} | CD: ${equippedAbility.cooldown}t`}
                        </span>
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                        {equippedAbility.effect}
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      Slot {slotIndex + 1}: Empty (click to equip)
                    </span>
                  )
                ) : (
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Slot {slotIndex + 1}: Locked (need RES {resNeeded})
                  </span>
                )}
              </button>

              {isExpanded && unlocked && (
                <div className="mt-1 p-2 rounded space-y-1" style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)' }}>
                  {equippedAbility && (
                    <button
                      onClick={() => { unequipAbility(hero.id, slotIndex); setExpandedSlot(null); }}
                      className="w-full text-left p-1.5 rounded text-xs cursor-pointer"
                      style={{ backgroundColor: 'var(--color-danger)', color: '#fff', border: 'none' }}
                    >
                      Unequip {equippedAbility.name}
                    </button>
                  )}
                  {getAvailableForSlot(slotIndex).map(ability => (
                    <button
                      key={ability.id}
                      onClick={() => { equipAbility(hero.id, slotIndex, ability.id); setExpandedSlot(null); }}
                      className="w-full text-left p-1.5 rounded text-xs cursor-pointer"
                      style={{
                        backgroundColor: 'var(--color-bg-tertiary)',
                        border: `1px solid ${ABILITY_COLOR_HEX[ability.color]}44`,
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold" style={{ color: ABILITY_COLOR_HEX[ability.color] }}>
                          {ability.name}
                        </span>
                        <span style={{ color: 'var(--color-text-muted)' }}>
                          {ability.isPassive ? 'Passive' : `SP: ${ability.spCost} | CD: ${ability.cooldown}t`}
                        </span>
                      </div>
                      <div style={{ color: 'var(--color-text-secondary)', fontSize: 9, marginTop: 2 }}>
                        {ability.effect}
                      </div>
                    </button>
                  ))}
                  {getAvailableForSlot(slotIndex).length === 0 && !equippedAbility && (
                    <div className="text-xs p-1" style={{ color: 'var(--color-text-muted)' }}>No abilities available. Acquire tomes from combat drops or the market.</div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Decree slot */}
        {(() => {
          const isExpanded = expandedSlot === 'decree';
          const decreeAbility = equippedDecree ? ABILITIES[equippedDecree] : null;
          return (
            <div>
              <button
                onClick={() => derived.canEquipAura && setExpandedSlot(isExpanded ? null : 'decree')}
                className="w-full text-left p-2 rounded cursor-pointer"
                style={{
                  backgroundColor: derived.canEquipAura ? 'var(--color-bg-tertiary)' : 'var(--color-bg-primary)',
                  opacity: derived.canEquipAura ? 1 : 0.4,
                  borderLeft: `3px solid ${derived.canEquipAura ? '#a855f7' : 'transparent'}`,
                  border: `1px solid ${isExpanded ? 'var(--color-accent)' : decreeAbility ? '#a855f766' : 'var(--color-border)'}`,
                }}
              >
                {derived.canEquipAura ? (
                  decreeAbility ? (
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold" style={{ color: '#a855f7' }}>
                          Decree: {decreeAbility.name}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Party-wide</span>
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                        {decreeAbility.effect}
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs" style={{ color: '#a855f7' }}>
                      Decree Slot: Empty (click to equip a Warband Decree)
                    </span>
                  )
                ) : (
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Decree Slot: Locked (need RES 50)
                  </span>
                )}
              </button>

              {isExpanded && derived.canEquipAura && (
                <div className="mt-1 p-2 rounded space-y-1" style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)' }}>
                  {decreeAbility && (
                    <button
                      onClick={() => { unequipDecree(hero.id); setExpandedSlot(null); }}
                      className="w-full text-left p-1.5 rounded text-xs cursor-pointer"
                      style={{ backgroundColor: 'var(--color-danger)', color: '#fff', border: 'none' }}
                    >
                      Unequip {decreeAbility.name}
                    </button>
                  )}
                  {getAvailableDecrees().map(ability => (
                    <button
                      key={ability.id}
                      onClick={() => { equipDecree(hero.id, ability.id); setExpandedSlot(null); }}
                      className="w-full text-left p-1.5 rounded text-xs cursor-pointer"
                      style={{
                        backgroundColor: 'var(--color-bg-tertiary)',
                        border: '1px solid #a855f744',
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      <div className="font-bold" style={{ color: '#a855f7' }}>{ability.name}</div>
                      <div style={{ color: 'var(--color-text-secondary)', fontSize: 9, marginTop: 2 }}>
                        {ability.effect}
                      </div>
                    </button>
                  ))}
                  {getAvailableDecrees().length === 0 && !decreeAbility && (
                    <div className="text-xs p-1" style={{ color: 'var(--color-text-muted)' }}>No decrees available.</div>
                  )}
                </div>
              )}
            </div>
          );
        })()}
      </div>
      <div className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
        Equip Ability Tomes from drops, crafting, or the market. 5 color types: Red (melee), Green (ranged), Blue (tech), Orange (passive), Purple (decree).
      </div>
    </div>
  );
}

const CONSUMABLE_SLOT_THRESHOLDS = [1, 15, 30, 45, 60, 80];

function HeroConsumableSection({ hero, derived }: { hero: Hero; derived: ReturnType<typeof calculateDerivedStats> }) {
  const equipConsumable = useHeroStore(s => s.equipConsumable);
  const unequipConsumable = useHeroStore(s => s.unequipConsumable);
  const resources = useGameStore(s => s.resources);
  const [expandedSlot, setExpandedSlot] = useState<number | null>(null);

  const equippedConsumables = hero.equippedConsumables || [null];
  const maxSlots = 6;

  // Get available consumables from player resources
  const getAvailableConsumables = (slotIndex: number) => {
    return Object.values(CONSUMABLES).filter(c => {
      const qty = resources[c.id] || 0;
      if (qty <= 0) return false;
      // Don't show consumables already equipped in other slots on this hero
      for (let i = 0; i < equippedConsumables.length; i++) {
        if (i !== slotIndex && equippedConsumables[i] === c.id) return false;
      }
      return true;
    });
  };

  const TYPE_COLORS: Record<string, string> = {
    food: '#f39c12',
    medicine: '#27ae60',
    chemical: '#e74c3c',
  };

  return (
    <div className="p-3 rounded mb-4" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
      <h3 className="font-bold text-sm mb-2">Consumable Bag ({derived.consumableSlots}/{maxSlots} slots)</h3>
      <div className="space-y-1">
        {Array.from({ length: maxSlots }).map((_, slotIndex) => {
          const unlocked = slotIndex < derived.consumableSlots;
          const equippedId = equippedConsumables[slotIndex] || null;
          const equippedConsumable = equippedId ? CONSUMABLES[equippedId] : null;
          const isExpanded = expandedSlot === slotIndex;
          const unlockLevel = CONSUMABLE_SLOT_THRESHOLDS[slotIndex];

          return (
            <div key={slotIndex}>
              <button
                onClick={() => unlocked && setExpandedSlot(isExpanded ? null : slotIndex)}
                className="w-full text-left p-2 rounded cursor-pointer"
                style={{
                  backgroundColor: unlocked ? 'var(--color-bg-tertiary)' : 'var(--color-bg-primary)',
                  opacity: unlocked ? 1 : 0.4,
                  border: `1px solid ${isExpanded ? 'var(--color-accent)' : equippedConsumable ? (TYPE_COLORS[equippedConsumable.type] || '#888') + '66' : 'var(--color-border)'}`,
                  borderLeft: equippedConsumable ? `3px solid ${TYPE_COLORS[equippedConsumable.type] || '#888'}` : undefined,
                }}
              >
                {unlocked ? (
                  equippedConsumable ? (
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold" style={{ color: TYPE_COLORS[equippedConsumable.type] || '#888' }}>
                          Slot {slotIndex + 1}: {equippedConsumable.name}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          {equippedConsumable.duration > 0 ? `${Math.floor(equippedConsumable.duration / 60)}m` : 'Instant'} | CD: {equippedConsumable.cooldown}s
                        </span>
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                        {equippedConsumable.effect}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                        Owned: {resources[equippedConsumable.id] || 0}
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      Slot {slotIndex + 1}: Empty (click to equip)
                    </span>
                  )
                ) : (
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Slot {slotIndex + 1}: Unlocks at Lv.{unlockLevel}
                  </span>
                )}
              </button>

              {isExpanded && unlocked && (
                <div className="mt-1 p-2 rounded space-y-1" style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', maxHeight: '200px', overflowY: 'auto' }}>
                  {equippedConsumable && (
                    <button
                      onClick={() => { unequipConsumable(hero.id, slotIndex); setExpandedSlot(null); }}
                      className="w-full text-left p-1.5 rounded text-xs cursor-pointer"
                      style={{ backgroundColor: 'var(--color-danger)', color: '#fff', border: 'none' }}
                    >
                      Unequip {equippedConsumable.name}
                    </button>
                  )}
                  {getAvailableConsumables(slotIndex).map(consumable => (
                    <button
                      key={consumable.id}
                      onClick={() => { equipConsumable(hero.id, slotIndex, consumable.id); setExpandedSlot(null); }}
                      className="w-full text-left p-1.5 rounded text-xs cursor-pointer"
                      style={{
                        backgroundColor: 'var(--color-bg-tertiary)',
                        border: `1px solid ${(TYPE_COLORS[consumable.type] || '#888')}44`,
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold" style={{ color: TYPE_COLORS[consumable.type] || '#888' }}>
                          {consumable.name}
                        </span>
                        <span style={{ color: 'var(--color-text-muted)' }}>
                          x{resources[consumable.id] || 0}
                        </span>
                      </div>
                      <div style={{ color: 'var(--color-text-secondary)', fontSize: 9, marginTop: 2 }}>
                        {consumable.effect}
                        {consumable.duration > 0 && ` (${Math.floor(consumable.duration / 60)}m)`}
                      </div>
                    </button>
                  ))}
                  {getAvailableConsumables(slotIndex).length === 0 && !equippedConsumable && (
                    <div className="text-xs p-1" style={{ color: 'var(--color-text-muted)' }}>No consumables available. Craft food or potions first.</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
        Equip crafted consumables for combat bonuses. Food (orange), Medicine (green), Chemical (red). New slots unlock at Lv.15, 30, 45, 60, 80.
      </div>
    </div>
  );
}

function DerivedRow({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div className="flex justify-between">
      <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      <span style={{ color: 'var(--color-text-primary)' }}>
        {value} {suffix && <span style={{ color: 'var(--color-text-muted)' }}>{suffix}</span>}
      </span>
    </div>
  );
}

function RecruitPanel({ onClose }: { onClose: () => void }) {
  const recruit = useHeroStore(s => s.recruit);
  const heroes = useHeroStore(s => s.heroes);
  const isFeatureUnlocked = useStoryStore(s => s.isFeatureUnlocked);
  const playerWC = useGameStore(s => s.resources['wasteland_credits'] || 0);
  const [filter, setFilter] = useState<'all' | 'combat' | 'specialist'>('all');

  const recruitmentUnlocked = isFeatureUnlocked('hero_recruitment');
  const cost = Math.floor(500 * (1 + heroes.length * 0.5));

  const filtered = CLASS_LIST.filter(c =>
    filter === 'all' ? true : filter === 'combat' ? c.heroType === 'combat' : c.heroType === 'specialist'
  );

  const handleRecruit = (classId: string) => {
    recruit(classId);
  };

  // If recruitment is locked (and they already have at least 1 hero)
  if (!recruitmentUnlocked && heroes.length > 0) {
    return (
      <div className="p-3 rounded mb-3" style={{ backgroundColor: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)' }}>
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-bold text-xs" style={{ color: 'var(--color-text-muted)' }}>Recruitment Post</h4>
          <button onClick={onClose} className="text-xs cursor-pointer" style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none' }}>Close</button>
        </div>
        <p className="text-xs text-center p-4" style={{ color: 'var(--color-text-muted)' }}>
          Complete Story 3 to unlock hero recruitment.
        </p>
      </div>
    );
  }

  return (
    <div className="p-3 rounded mb-3" style={{ backgroundColor: 'var(--color-bg-tertiary)', border: '1px solid var(--color-accent)' }}>
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-bold text-xs" style={{ color: 'var(--color-accent)' }}>Recruitment Post</h4>
        <button onClick={onClose} className="text-xs cursor-pointer" style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none' }}>Close</button>
      </div>
      {heroes.length > 0 && (
        <div className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
          Recruitment cost: <span style={{ color: playerWC >= cost ? 'var(--color-accent)' : '#ef4444' }}>{cost} WC</span>
        </div>
      )}
      <div className="flex gap-1 mb-2">
        {(['all', 'combat', 'specialist'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-2 py-1 rounded text-xs cursor-pointer"
            style={{
              backgroundColor: filter === f ? 'var(--color-accent)' : 'var(--color-bg-secondary)',
              color: filter === f ? '#000' : 'var(--color-text-muted)',
              border: 'none',
            }}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
        ))}
      </div>
      <div className="space-y-1 max-h-60 overflow-y-auto">
        {filtered.map(cls => {
          const catColor = CATEGORY_COLORS[cls.categoryId] || '#888';
          return (
            <div key={cls.id} className="flex justify-between items-center p-2 rounded" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
              <div>
                <span className="text-xs font-bold" style={{ color: catColor }}>{cls.name}</span>
                <span className="text-xs ml-1" style={{ color: 'var(--color-text-muted)' }}>
                  ({CATEGORIES[cls.categoryId]?.name} / {cls.primaryCombatStyle})
                </span>
              </div>
              <button onClick={() => handleRecruit(cls.id)}
                className="px-2 py-1 rounded text-xs font-bold cursor-pointer"
                style={{ backgroundColor: catColor, color: '#000', border: 'none' }}>
                Recruit
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
