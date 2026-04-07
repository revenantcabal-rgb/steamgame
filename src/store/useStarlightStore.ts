import { create } from 'zustand';
import { STARLIGHT_NODES, getStarlightNode, getPathNodes } from '../config/starlight';
import { useGameStore } from './useGameStore';

interface StarlightState {
  unlockedNodes: string[];
  selectedPath: string | null;

  unlockNode: (nodeId: string) => boolean;
  getPathProgress: (pathId: string) => { unlocked: number; total: number };
  getStatBonuses: () => Record<string, number>;
  getTotalInvested: () => number;

  getSerializableState: () => { unlockedNodes: string[] };
  loadState: (state: { unlockedNodes: string[] }) => void;
}

export const useStarlightStore = create<StarlightState>((set, get) => ({
  unlockedNodes: [],
  selectedPath: null,

  unlockNode: (nodeId: string): boolean => {
    const state = get();
    const node = getStarlightNode(nodeId);

    // 1. Validate node exists
    if (!node) return false;

    // 2. Validate not already unlocked
    if (state.unlockedNodes.includes(nodeId)) return false;

    // 3. Validate all prerequisites are unlocked
    for (const reqId of node.requires) {
      if (!state.unlockedNodes.includes(reqId)) return false;
    }

    // 4. Validate player has enough icqor_chess_piece resources
    const gameState = useGameStore.getState();
    const available = gameState.resources['icqor_chess_piece'] || 0;
    if (available < node.cost) return false;

    // 5. Deduct resources from useGameStore
    const newResources = { ...gameState.resources };
    newResources['icqor_chess_piece'] = available - node.cost;
    useGameStore.setState({ resources: newResources });

    // 6. Add node to unlockedNodes
    set({ unlockedNodes: [...state.unlockedNodes, nodeId] });

    // 7. Log to game log
    gameState.addLog(`Starlight node unlocked: ${node.name} (${node.description})`, 'system');

    return true;
  },

  getPathProgress: (pathId: string) => {
    const state = get();
    const pathNodes = getPathNodes(pathId);
    const unlocked = pathNodes.filter(n => state.unlockedNodes.includes(n.id)).length;
    return { unlocked, total: pathNodes.length };
  },

  getStatBonuses: (): Record<string, number> => {
    const state = get();
    const bonuses: Record<string, number> = {};

    for (const nodeId of state.unlockedNodes) {
      const node = getStarlightNode(nodeId);
      if (!node) continue;

      // Apply primary effect
      const { stat, value, isPercentage } = node.effect;
      const key = isPercentage ? `${stat}_pct` : stat;
      bonuses[key] = (bonuses[key] || 0) + value;

      // Apply secondary effect (capstone nodes)
      if (node.effect2) {
        const { stat: stat2, value: value2, isPercentage: isPct2 } = node.effect2;
        const key2 = isPct2 ? `${stat2}_pct` : stat2;
        bonuses[key2] = (bonuses[key2] || 0) + value2;
      }
    }

    return bonuses;
  },

  getTotalInvested: (): number => {
    const state = get();
    let total = 0;
    for (const nodeId of state.unlockedNodes) {
      const node = getStarlightNode(nodeId);
      if (node) total += node.cost;
    }
    return total;
  },

  getSerializableState: () => ({
    unlockedNodes: get().unlockedNodes,
  }),

  loadState: (saved: { unlockedNodes: string[] }) => {
    set({
      unlockedNodes: saved.unlockedNodes || [],
    });
  },
}));
