import { createContext, useContext } from 'react';

export interface NavigationActions {
  navigateToSkill: (skillId: string) => void;
  navigateToCombatZone: (zoneId: string) => void;
}

const defaultActions: NavigationActions = {
  navigateToSkill: () => {},
  navigateToCombatZone: () => {},
};

export const NavigationContext = createContext<NavigationActions>(defaultActions);

export function useNavigation(): NavigationActions {
  return useContext(NavigationContext);
}
