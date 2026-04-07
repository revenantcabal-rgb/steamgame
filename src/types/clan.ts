export interface Clan {
  id: string;
  name: string;
  tag: string;
  level: number;
  xp: number;
  maxMembers: number;
  members: ClanMember[];
  description: string;
  createdAt: number;
}

export interface ClanMember {
  playerId: string;
  name: string;
  role: 'leader' | 'officer' | 'member';
  totalPower: number;
  joinedAt: number;
  warStars: number;
}

export type WarPhase = 'matchmaking' | 'preparation' | 'battle' | 'results';

export interface ClanWar {
  id: string;
  phase: WarPhase;
  /** When this phase started */
  phaseStartTime: number;
  /** When this phase ends */
  phaseEndTime: number;
  ourClan: WarClanData;
  enemyClan: WarClanData;
}

export interface WarClanData {
  clanId: string;
  clanName: string;
  members: WarMember[];
  totalStars: number;
  totalDestruction: number;
}

export interface WarMember {
  playerId: string;
  name: string;
  power: number;
  /** Defenses built during prep phase (Engineering skill) */
  defenseLevel: number;
  /** Attacks remaining in battle phase */
  attacksRemaining: number;
  /** Stars earned defending */
  starsDefended: number;
}

export interface WarAttack {
  attackerId: string;
  defenderId: string;
  stars: number;
  destructionPercent: number;
  combatLog: string[];
  timestamp: number;
}
