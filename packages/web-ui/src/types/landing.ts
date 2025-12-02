// Types for Axiom Landing Components

export interface DashboardMetrics {
  systemStatus: 'Online' | 'Offline' | 'Degraded';
  throughputPercentage: number;
  activeWallets: number;
  currentQueue: number;
}

export interface AssemblyStage {
  id: string;
  title: string;
  subtitle: string;
  progress: number;
  status: 'generating' | 'minting' | 'loading' | 'ready';
}

export interface FeatureCard {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface SidebarNavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}