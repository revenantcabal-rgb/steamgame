export interface CombatStats {
  maxHp: number;
  meleeAttack: number;
  rangedAttack: number;
  defense: number;
  evasion: number;
  critChance: number;
  tactics: number;
}

export interface CombatAction {
  tick: number;
  attackerName: string;
  defenderName: string;
  actionType: 'melee' | 'ranged' | 'defend' | 'evade' | 'critical';
  damage: number;
  attackerHpAfter: number;
  defenderHpAfter: number;
  message: string;
}

export interface CombatResult {
  winner: 'player' | 'opponent';
  actions: CombatAction[];
  playerHpRemaining: number;
  opponentHpRemaining: number;
  xpGained: number;
  lootDrops: { itemId: string; quantity: number }[];
}

export interface PVPOpponent {
  id: string;
  name: string;
  elo: number;
  stats: CombatStats;
  equippedGear: { weapon: string | null; armor: string | null; accessory: string | null };
}

export interface PVPMatchResult {
  opponentId: string;
  opponentName: string;
  result: 'win' | 'loss' | 'draw';
  eloChange: number;
  combatResult: CombatResult;
  seasonPoints: number;
}

export interface PVPSeason {
  id: string;
  name: string;
  startDate: number;
  endDate: number;
  currentRank: string;
  currentPoints: number;
}
