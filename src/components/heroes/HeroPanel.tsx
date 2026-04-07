import { useState } from 'react';
import { useHeroStore } from '../../store/useHeroStore';
import { useEquipmentStore } from '../../store/useEquipmentStore';
import { useStoryStore } from '../../store/useStoryStore';
import { useGameStore } from '../../store/useGameStore';
import { useCombatZoneStore } from '../../store/useCombatZoneStore';
import { COMBAT_ZONES } from '../../config/combatZones';
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
      <div className="w-56 xl:w-72 shrink-0 overflow-y-auto p-3 space-y-2" style={{ borderRight: '1px solid var(--color-border)' }}>
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
        <div className="flex items-center gap-2">
          <ItemIcon itemId={hero.classId} itemType="hero" size={28} fallbackLabel={hero.name.charAt(0)} fallbackColor={catColor} />
          <span className="font-bold text-xs" style={{ color: 'var(--color-text-primary)' }}>{hero.name}</span>
        </div>
        <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: catColor + '22', color: catColor }}>
          Lv.{hero.level}
        </span>
      </div>
      <div className="text-xs flex items-center gap-1" style={{ color: catColor }}>
        {classDef?.name || hero.classId}
        <span style={{ color: 'var(--color-text-muted)' }}> | {classDef?.heroType === 'specialist' ? 'Specialist' : 'Combat'}</span>
        {classDef?.primaryStats?.[0] && (
          <span style={{ color: STAT_COLORS[classDef.primaryStats[0] as keyof typeof STAT_COLORS], fontWeight: 'bold' }}>
            {STAT_LABELS[classDef.primaryStats[0] as keyof PrimaryStats]}
          </span>
        )}
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
  const deployments = useCombatZoneStore(s => s.deployments);
  const recallHero = useCombatZoneStore(s => s.recallHero);
  const [dismissStep, setDismissStep] = useState(0); // 0=none, 1=first warning, 2=final confirm
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
        <div className="flex gap-3 items-start">
          <ItemIcon itemId={hero.classId} itemType="hero" size={48} fallbackLabel={hero.name.charAt(0)} fallbackColor={catColor} />
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
            {classDef?.primaryStats?.[0] && (
              <span className="text-xs px-2 py-0.5 rounded font-bold" style={{
                backgroundColor: STAT_COLORS[classDef.primaryStats[0] as keyof typeof STAT_COLORS] + '22',
                color: STAT_COLORS[classDef.primaryStats[0] as keyof typeof STAT_COLORS],
              }}>
                Primary: {STAT_LABELS[classDef.primaryStats[0] as keyof PrimaryStats]}
              </span>
            )}
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{classDef?.description}</p>
          </div>
        </div>
        {dismissStep === 0 && (
          <button
            onClick={() => setDismissStep(1)}
            className="px-3 py-1 rounded text-xs cursor-pointer"
            style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-danger)', border: '1px solid var(--color-danger)' }}
          >
            Dismiss
          </button>
        )}
      </div>

      {/* Two-step dismiss confirmation */}
      {dismissStep === 1 && (
        <div className="p-3 rounded mb-4" style={{ backgroundColor: '#e74c3c15', border: '1px solid var(--color-danger)' }}>
          <div className="text-xs font-bold mb-2" style={{ color: 'var(--color-danger)' }}>
            Warning: Dismissing {hero.name} will permanently remove this hero from your roster.
          </div>
          <div className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
            All equipment will be unequipped and returned to inventory. This action cannot be undone.
          </div>
          <div className="flex gap-2">
            <button onClick={() => setDismissStep(2)}
              className="px-3 py-1 rounded text-xs font-bold cursor-pointer"
              style={{ backgroundColor: 'var(--color-danger)', color: '#fff', border: 'none' }}>
              I understand, continue
            </button>
            <button onClick={() => setDismissStep(0)}
              className="px-3 py-1 rounded text-xs cursor-pointer"
              style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>
              Cancel
            </button>
          </div>
        </div>
      )}
      {dismissStep === 2 && (
        <div className="p-3 rounded mb-4" style={{ backgroundColor: '#e74c3c22', border: '2px solid var(--color-danger)' }}>
          <div className="text-xs font-bold mb-2" style={{ color: 'var(--color-danger)' }}>
            FINAL CONFIRMATION
          </div>
          <div className="text-xs mb-3" style={{ color: 'var(--color-text-primary)' }}>
            Are you absolutely sure you want to permanently dismiss <b>{hero.name}</b> (Lv.{hero.level} {classDef?.name})?
            This hero and all progress will be lost forever.
          </div>
          <div className="flex gap-2">
            <button onClick={() => { dismissHero(hero.id); setDismissStep(0); }}
              className="px-3 py-1 rounded text-xs font-bold cursor-pointer"
              style={{ backgroundColor: 'var(--color-danger)', color: '#fff', border: 'none' }}>
              Yes, dismiss permanently
            </button>
            <button onClick={() => setDismissStep(0)}
              className="px-3 py-1 rounded text-xs cursor-pointer"
              style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Combat Deployment Status & Recall */}
      {(() => {
        const heroDeployments = deployments.filter(d => d.heroIds.includes(hero.id));
        if (heroDeployments.length === 0) return null;
        return (
          <div className="p-3 rounded mb-4" style={{ backgroundColor: '#e74c3c11', border: '1px solid var(--color-danger)' }}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-sm" style={{ color: 'var(--color-danger)' }}>
                <span className="combat-swords-icon" style={{ fontSize: '12px' }}>&#9876;</span> In Combat
              </h3>
            </div>
            {heroDeployments.map(dep => {
              const zone = COMBAT_ZONES[dep.zoneId];
              const target = zone?.targets?.find((t: any) => t.id === dep.targetId);
              const cooldown = dep.recoveryCooldowns[hero.id];
              return (
                <div key={dep.partyId} className="flex justify-between items-center text-xs mb-1">
                  <div>
                    <span style={{ color: 'var(--color-text-primary)' }}>{zone?.name || dep.zoneId}</span>
                    {target && <span style={{ color: 'var(--color-text-muted)' }}> — {target.name}</span>}
                    <span style={{ color: 'var(--color-text-muted)' }}> | {dep.totalKills} kills</span>
                    {cooldown > 0 && (
                      <span style={{ color: 'var(--color-energy)' }}> | Recovering: {Math.ceil(cooldown)}s</span>
                    )}
                  </div>
                  <button
                    onClick={() => recallHero(dep.partyId, hero.id)}
                    className="px-2 py-1 rounded text-xs cursor-pointer ml-2"
                    style={{ backgroundColor: 'var(--color-danger)', color: '#fff', border: 'none' }}>
                    Recall
                  </button>
                </div>
              );
            })}
            <style>{`
              @keyframes combat-pulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.6; transform: scale(1.2); }
              }
              .combat-swords-icon {
                animation: combat-pulse 1.5s ease-in-out infinite;
                display: inline-block;
              }
            `}</style>
          </div>
        );
      })()}

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
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-2">
          {(Object.keys(STAT_LABELS) as (keyof PrimaryStats)[]).map(stat => {
            const isPrimary = stat === classDef?.primaryStats?.[0];
            return (
            <div key={stat} className="p-2 rounded" style={{
              backgroundColor: 'var(--color-bg-tertiary)',
              border: isPrimary ? `2px solid ${STAT_COLORS[stat]}` : '2px solid transparent',
              boxShadow: isPrimary ? `0 0 8px ${STAT_COLORS[stat]}44` : 'none',
            }}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold" style={{ color: STAT_COLORS[stat] }}>{STAT_LABELS[stat]}</span>
                  <span className="text-sm font-bold ml-2" style={{ color: 'var(--color-text-primary)' }}>{totalStats[stat]}</span>
                  <span className="text-xs ml-1" style={{ color: 'var(--color-text-muted)' }}>
                    ({hero.baseStats[stat]}+{hero.allocatedStats[stat]})
                  </span>
                </div>
                {hero.unspentPoints > 0 && (
                  <div className="flex gap-0.5">
                    <button onClick={() => allocateStat(hero.id, stat)}
                      className="w-6 h-6 rounded text-xs font-bold cursor-pointer flex items-center justify-center"
                      style={{ backgroundColor: STAT_COLORS[stat], color: '#000', border: 'none' }}>+</button>
                    {hero.unspentPoints >= 5 && (
                      <button onClick={() => allocateMultiple(hero.id, stat, 5)}
                        className="w-7 h-6 rounded text-xs font-bold cursor-pointer flex items-center justify-center"
                        style={{ backgroundColor: STAT_COLORS[stat] + 'bb', color: '#000', border: 'none' }}>+5</button>
                    )}
                    {hero.unspentPoints >= 10 && (
                      <button onClick={() => allocateMultiple(hero.id, stat, 10)}
                        className="w-8 h-6 rounded text-xs font-bold cursor-pointer flex items-center justify-center"
                        style={{ backgroundColor: STAT_COLORS[stat] + '99', color: '#000', border: 'none' }}>+10</button>
                    )}
                    {hero.unspentPoints > 1 && (
                      <button onClick={() => allocateMultiple(hero.id, stat, hero.unspentPoints)}
                        className="px-1.5 h-6 rounded text-xs font-bold cursor-pointer flex items-center justify-center"
                        style={{ backgroundColor: STAT_COLORS[stat] + '66', color: '#000', border: 'none' }}>Max</button>
                    )}
                  </div>
                )}
              </div>
              <div style={{ fontSize: '9px', color: STAT_COLORS[stat] + 'aa', marginTop: '2px', lineHeight: '1.2' }}>
                {STAT_FULL_NAMES[stat]}: {STAT_DESCRIPTIONS[stat]}
              </div>
            </div>
            );
          })}
        </div>
        <div className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
          Base stat total: {getBaseStatTotal(hero)} | Combat style: {classDef?.primaryCombatStyle}
        </div>

        {/* Stat allocation is direct-click — no confirmation needed */}
      </div>

      {/* Combat Stats — grouped with visual hierarchy */}
      <div className="p-3 rounded mb-4" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
        <h3 className="font-bold text-sm mb-3">Combat Stats</h3>

        {/* Offense */}
        <div className="mb-3">
          <div className="text-xs font-bold mb-1" style={{ color: '#e74c3c' }}>Offense</div>
          <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-xs">
            <DerivedRow label="Melee Atk" value={derived.meleeAttack.toFixed(0)} highlight={classDef?.primaryCombatStyle === 'melee'} />
            <DerivedRow label="Ranged Atk" value={derived.rangedAttack.toFixed(0)} highlight={classDef?.primaryCombatStyle === 'ranged'} />
            <DerivedRow label="Blast Atk" value={derived.blastAttack.toFixed(0)} highlight={classDef?.primaryCombatStyle === 'demolitions'} />
            <DerivedRow label="Crit Chance" value={derived.critChance.toFixed(1) + '%'} />
            <DerivedRow label="Crit Dmg" value={derived.critDamage.toFixed(0) + '%'} />
            <DerivedRow label="Ability Power" value={'+' + derived.abilityPower + '%'} />
          </div>
        </div>

        {/* Defense & Survivability */}
        <div className="mb-3">
          <div className="text-xs font-bold mb-1" style={{ color: '#27ae60' }}>Defense & Survivability</div>
          <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-xs">
            <DerivedRow label="Max HP" value={derived.maxHp.toFixed(0)} highlight />
            <DerivedRow label="Defense" value={derived.defense.toFixed(0)} suffix="(gear)" />
            <DerivedRow label="Evasion" value={derived.evasion.toFixed(1) + '%'} />
            <DerivedRow label="HP Regen" value={derived.hpRegen.toFixed(1) + '/turn'} />
            <DerivedRow label="Status Resist" value={derived.statusResist.toFixed(1) + '%'} />
          </div>
        </div>

        {/* Speed & Accuracy */}
        <div className="mb-3">
          <div className="text-xs font-bold mb-1" style={{ color: '#3498db' }}>Speed & Accuracy</div>
          <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-xs">
            <DerivedRow label="Turn Speed" value={derived.turnSpeed.toFixed(1)} />
            <DerivedRow label="Accuracy" value={derived.accuracy.toFixed(1) + '%'} />
          </div>
        </div>

        {/* Resources (SP) */}
        <div className="mb-3">
          <div className="text-xs font-bold mb-1" style={{ color: '#e879f9' }}>Spirit Points</div>
          <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-xs">
            <DerivedRow label="Max SP" value={derived.maxSp.toFixed(0)} />
            <DerivedRow label="SP Regen" value={derived.spRegen.toFixed(1) + '/turn'} />
            <DerivedRow label="SP Cost Reduction" value={derived.spCostReduction.toFixed(0) + '%'} />
          </div>
        </div>

        {/* Slots */}
        <div>
          <div className="text-xs font-bold mb-1" style={{ color: 'var(--color-text-muted)' }}>Slots</div>
          <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-xs">
            <DerivedRow label="Ability Slots" value={derived.abilitySlots + '/4'} />
            <DerivedRow label="Decree Slot" value={derived.canEquipAura ? 'Unlocked' : 'Need RES 50'} />
            <DerivedRow label="Consumable Slots" value={derived.consumableSlots + '/6'} />
          </div>
        </div>
      </div>

      {/* Advanced Stats (collapsible — Extended Combat + Utility) */}
      {(() => {
        const hasExtended = derived.lifesteal > 0 || derived.burnDot > 0 || derived.poisonDot > 0 || derived.frostSlow > 0 ||
          derived.thornsDamage > 0 || derived.blockChance > 0 || derived.armorPen > 0 || derived.damageReduction > 0;
        const hasUtility = derived.dropChance > 0 || derived.gatheringSpeed > 0 || derived.gatheringYield > 0 || derived.productionSpeed > 0 ||
          derived.xpBonus > 0 || derived.rareResourceChance > 0 || derived.rarityUpgrade > 0 || derived.doubleOutput > 0;
        if (!hasExtended && !hasUtility) return null;
        return (
          <AdvancedStatsSection derived={derived} hasExtended={hasExtended} hasUtility={hasUtility} />
        );
      })()}

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
  const deployments = useCombatZoneStore(s => s.deployments);
  const [expandedSlot, setExpandedSlot] = useState<EquipmentSlot | null>(null);

  const isDeployed = deployments.some(d => d.heroIds.includes(heroId));
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
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-sm">Equipment</h3>
        {isDeployed && (
          <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--color-danger)', color: '#fff' }}>
            Deployed — Equipment Locked
          </span>
        )}
      </div>

      {/* Weapons Row */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        {renderSlot('main_hand', 'Main Hand', 'weapon')}
        {renderSlot('off_hand', 'Off Hand', 'shield')}
      </div>

      {/* Armor Row */}
      <div className="grid grid-cols-4 gap-2 mb-2">
        {renderSlot('armor', 'Armor', 'armor')}
        {renderSlot('legs', 'Legs', 'legs')}
        {renderSlot('gloves', 'Gloves', 'gloves')}
        {renderSlot('boots', 'Boots', 'boots')}
      </div>

      {/* Accessories Row */}
      <div className="text-xs font-bold mb-1 mt-3" style={{ color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border)', paddingTop: '8px' }}>Accessories</div>
      <div className="grid grid-cols-3 gap-2 mb-2">
        {renderSlot('ring1', 'Ring 1', 'ring')}
        {renderSlot('ring2', 'Ring 2', 'ring')}
        {renderSlot('ring3', 'Focus Ring', 'ring')}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {renderSlot('earring1', 'Earring 1', 'earring')}
        {renderSlot('earring2', 'Earring 2', 'earring')}
        {renderSlot('necklace', 'Necklace', 'necklace')}
      </div>
    </div>
  );

  function renderSlot(slot: EquipmentSlot, label: string, category: string) {
    const equippedId = (equipped as Record<string, string | null>)[slot] || null;
    const equippedGear = equippedId ? inventory.find(g => g.instanceId === equippedId) : null;
    const equippedTemplate = equippedGear ? GEAR_TEMPLATES[equippedGear.templateId] : null;
    const isExpanded = expandedSlot === slot;

    const available = inventory.filter(g => {
      if (equippedId && g.instanceId === equippedId) return false;
      if (allEquippedIds.has(g.instanceId)) return false;
      const tmpl = GEAR_TEMPLATES[g.templateId];
      if (!tmpl) return false;
      if (tmpl.slot !== category) return false;
      if (slot === 'ring3' && !tmpl.statFocusRing) return false;
      if ((slot === 'ring1' || slot === 'ring2') && tmpl.statFocusRing) return false;
      return true;
    });

    return (
      <div key={slot}>
        <button
          onClick={() => !isDeployed && setExpandedSlot(isExpanded ? null : slot)}
          className="w-full text-left p-2 rounded text-xs"
          style={{
            backgroundColor: equippedGear ? 'var(--color-bg-tertiary)' : 'var(--color-bg-primary)',
            border: isExpanded ? '2px solid var(--color-accent)' : equippedGear ? `1px solid ${RARITY_COLORS[equippedGear.rarity]}44` : '1px dashed var(--color-border)',
            opacity: isDeployed ? 0.6 : 1,
            cursor: isDeployed ? 'not-allowed' : 'pointer',
            minHeight: '44px',
          }}
        >
          <div className="text-[10px] mb-0.5" style={{ color: 'var(--color-text-muted)' }}>{label}</div>
          {equippedGear && equippedTemplate ? (
            <>
              <div className="font-bold flex items-center gap-1" style={{ color: RARITY_COLORS[equippedGear.rarity], fontSize: 11 }}>
                <ItemIcon itemId={equippedTemplate.id} itemType="equipment" gearSlot={equippedTemplate.slot} size={16} fallbackLabel={equippedTemplate.name.charAt(0)} />
                {equippedGear.facet ? `${equippedGear.facet.name} ` : ''}{equippedTemplate.name}
              </div>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {equippedTemplate.baseStats.slice(0, 2).map((s, i) => (
                  <span key={i} style={{ color: 'var(--color-success)', fontSize: 9 }}>
                    +{Math.round(s.value * equippedGear.sourcePowerMultiplier)} {s.stat}{s.isPercentage ? '%' : ''}
                  </span>
                ))}
                {equippedTemplate.baseStats.length > 2 && (
                  <span style={{ color: 'var(--color-text-muted)', fontSize: 9 }}>+{equippedTemplate.baseStats.length - 2} more</span>
                )}
              </div>
            </>
          ) : (
            <div style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: 10 }}>Empty</div>
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
                        {tmpl.description && (
                          <div style={{ color: 'var(--color-text-muted)', fontSize: 9, fontStyle: 'italic', marginTop: '2px' }}>
                            {tmpl.description}
                          </div>
                        )}
                        <div className="text-xs" style={{ color: 'var(--color-text-muted)', fontSize: 9, marginTop: '2px' }}>
                          T{tmpl.tier} {tmpl.slot} | Lv.{tmpl.levelReq}+
                          {tmpl.weaponType && ` | ${tmpl.weaponType}`}
                          {tmpl.isTwoHanded && ' (2H)'}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {tmpl.baseStats.map((s, i) => (
                            <span key={i} style={{ color: 'var(--color-success)', fontSize: 9 }}>
                              +{Math.round(s.value * gear.sourcePowerMultiplier)} {s.stat}{s.isPercentage ? '%' : ''}
                            </span>
                          ))}
                          {tmpl.inherentDownside && (
                            <span style={{ color: 'var(--color-danger)', fontSize: 9 }}>
                              {tmpl.inherentDownside.value} {tmpl.inherentDownside.stat}{tmpl.inherentDownside.isPercentage ? '%' : ''}
                            </span>
                          )}
                        </div>
                        {gear.facet && gear.facet.upside.stat !== 'none' && (
                          <div style={{ color: 'var(--color-energy)', fontSize: 9, marginTop: '2px' }}>
                            [{gear.facet.name}] +{gear.facet.upside.value}{gear.facet.upside.isPercentage ? '%' : ''} {gear.facet.upside.stat} / {gear.facet.downside.value}{gear.facet.downside.isPercentage ? '%' : ''} {gear.facet.downside.stat}
                          </div>
                        )}
                        {gear.rarityBonuses.length > 0 && (
                          <div className="flex flex-wrap gap-1" style={{ marginTop: '2px' }}>
                            {gear.rarityBonuses.map((b, i) => (
                              <span key={i} style={{ color: RARITY_COLORS[gear.rarity], fontSize: 9 }}>+{b.value}{b.isPercentage ? '%' : ''} {b.stat}</span>
                            ))}
                          </div>
                        )}
                        {gear.rarityCurses.length > 0 && (
                          <div className="flex flex-wrap gap-1" style={{ marginTop: '2px' }}>
                            {gear.rarityCurses.map((c, i) => (
                              <span key={i} style={{ color: '#ff4444', fontSize: 9 }}>CURSE: {c.value}{c.isPercentage ? '%' : ''} {c.stat}</span>
                            ))}
                          </div>
                        )}
                        {gear.enchantments.length > 0 && (
                          <div style={{ marginTop: '2px' }}>
                            {gear.enchantments.map((e, i) => (
                              <div key={i} style={{ color: e.isLegendary ? '#f97316' : '#60a5fa', fontSize: 9 }}>
                                [{e.group}] {e.name}: +{e.effect.value}{e.effect.isPercentage ? '%' : ''} {e.effect.stat}
                                {e.isLegendary && e.legendaryBonus && <span> ★ {e.legendaryBonus}</span>}
                              </div>
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
  }
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

function DerivedRow({ label, value, suffix, highlight }: { label: string; value: string; suffix?: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between">
      <span style={{ color: highlight ? 'var(--color-text-primary)' : 'var(--color-text-muted)', fontWeight: highlight ? 'bold' : 'normal' }}>{label}</span>
      <span style={{ color: highlight ? 'var(--color-accent)' : 'var(--color-text-primary)', fontWeight: highlight ? 'bold' : 'normal' }}>
        {value} {suffix && <span style={{ color: 'var(--color-text-muted)' }}>{suffix}</span>}
      </span>
    </div>
  );
}

function AdvancedStatsSection({ derived, hasExtended, hasUtility }: { derived: any; hasExtended: boolean; hasUtility: boolean }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="p-3 rounded mb-4" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex justify-between items-center cursor-pointer"
        style={{ background: 'none', border: 'none', color: 'var(--color-text-primary)', padding: 0 }}
      >
        <h3 className="font-bold text-sm">Advanced Stats</h3>
        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{expanded ? '▲ Collapse' : '▼ Expand'}</span>
      </button>
      {expanded && (
        <div className="mt-2 space-y-3">
          {hasExtended && (
            <div>
              <div className="text-xs font-bold mb-1" style={{ color: '#f39c12' }}>Extended Combat</div>
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
          {hasUtility && (
            <div>
              <div className="text-xs font-bold mb-1" style={{ color: '#1abc9c' }}>Utility Bonuses</div>
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
        </div>
      )}
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
