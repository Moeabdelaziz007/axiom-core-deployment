import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type DashboardTab = 'SOUL FORGE' | 'IDENTITY MINT' | 'EQUIPPING' | 'DELIVERY DOCK';
export type SidebarItem = 'My Agents' | 'Factory' | 'Wallet' | 'Settings';
export type Theme = 'dark' | 'light';

interface UIState {
  // Dashboard State
  activeDashboardTab: DashboardTab;
  activeSidebarItem: SidebarItem;
  sidebarCollapsed: boolean;
  
  // Theme
  theme: Theme;
  
  // Modals
  isWalletModalOpen: boolean;
  isDeployModalOpen: boolean;
  
  // Actions
  setActiveDashboardTab: (tab: DashboardTab) => void;
  setActiveSidebarItem: (item: SidebarItem) => void;
  toggleSidebar: () => void;
  setTheme: (theme: Theme) => void;
  openWalletModal: () => void;
  closeWalletModal: () => void;
  openDeployModal: () => void;
  closeDeployModal: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Initial State
      activeDashboardTab: 'SOUL FORGE',
      activeSidebarItem: 'Factory',
      sidebarCollapsed: false,
      theme: 'dark',
      isWalletModalOpen: false,
      isDeployModalOpen: false,

      // Actions
      setActiveDashboardTab: (tab) => set({ activeDashboardTab: tab }),
      setActiveSidebarItem: (item) => set({ activeSidebarItem: item }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setTheme: (theme) => set({ theme }),
      openWalletModal: () => set({ isWalletModalOpen: true }),
      closeWalletModal: () => set({ isWalletModalOpen: false }),
      openDeployModal: () => set({ isDeployModalOpen: true }),
      closeDeployModal: () => set({ isDeployModalOpen: false }),
    }),
    {
      name: 'axiom-ui-storage',
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);