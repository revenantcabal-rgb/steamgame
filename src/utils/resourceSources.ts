import { COMBAT_ZONES } from '../config/combatZones';
import { RESOURCES } from '../config/resources';
import { SKILLS } from '../config/skills';

export interface ResourceSkillSource {
  id: string;
  name: string;
}

export interface ResourceCombatSource {
  zoneId: string;
  zoneName: string;
  enemyName: string;
}

export interface ResourceSources {
  skill: ResourceSkillSource | null;
  combatZones: ResourceCombatSource[];
}

// Pre-computed reverse lookup: resourceId -> combat zone sources
const combatSourceMap: Record<string, ResourceCombatSource[]> = {};

// Build the reverse lookup once at module load
for (const zone of Object.values(COMBAT_ZONES)) {
  // Check all targets' enemies
  for (const target of zone.targets) {
    for (const drop of target.enemy.resourceDrops) {
      if (!combatSourceMap[drop.resourceId]) {
        combatSourceMap[drop.resourceId] = [];
      }
      // Avoid duplicates for same zone
      const existing = combatSourceMap[drop.resourceId].find(
        s => s.zoneId === zone.id && s.enemyName === target.enemy.name
      );
      if (!existing) {
        combatSourceMap[drop.resourceId].push({
          zoneId: zone.id,
          zoneName: zone.name,
          enemyName: target.enemy.name,
        });
      }
    }
  }
  // Check boss
  for (const drop of zone.boss.resourceDrops) {
    if (!combatSourceMap[drop.resourceId]) {
      combatSourceMap[drop.resourceId] = [];
    }
    const existing = combatSourceMap[drop.resourceId].find(
      s => s.zoneId === zone.id && s.enemyName === zone.boss.name
    );
    if (!existing) {
      combatSourceMap[drop.resourceId].push({
        zoneId: zone.id,
        zoneName: zone.name,
        enemyName: zone.boss.name,
      });
    }
  }
}

export function getResourceSources(resourceId: string): ResourceSources {
  const resource = RESOURCES[resourceId];
  let skill: ResourceSkillSource | null = null;

  if (resource) {
    const skillDef = SKILLS[resource.sourceSkillId];
    if (skillDef) {
      skill = { id: resource.sourceSkillId, name: skillDef.name };
    }
  }

  return {
    skill,
    combatZones: combatSourceMap[resourceId] || [],
  };
}
