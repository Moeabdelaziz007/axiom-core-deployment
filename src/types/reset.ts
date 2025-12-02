// Axiom RESET Type Definitions

// Enums
export type FeatureType = 'SHIFT' | 'FUEL' | 'DROP' | 'SCAN';
export type AgentRole = 'driver' | 'student' | 'merchant' | 'admin';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type SectorType = 'juice_shop' | 'mobile_repair' | 'pharmacy' | 'general_retail' | 'food_service';
export type Language = 'en' | 'ar';
export type OnboardingStep = 'business_info' | 'menu_setup' | 'payment_config' | 'verification' | 'complete';
export type DashboardView = 'tasks' | 'earnings' | 'gamification' | 'communication';

// Props types (data passed to components)
export interface FeatureCardProps {
  type: FeatureType;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
}

export interface MetricCounterProps {
  value: number;
  label: string;
  suffix?: string;
  prefix?: string;
  animationDuration?: number;
}

export interface SectorCardProps {
  sector: SectorType;
  name: string;
  description: string;
  benefits: string[];
  icon: React.ComponentType<{ className?: string; size?: number }>;
}

export interface AgentBenefitProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
}

export interface MerchantOnboardingProps {
  currentStep: OnboardingStep;
  onStepChange: (step: OnboardingStep) => void;
  onComplete: () => void;
}

export interface TaskPipelineProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, status: TaskStatus) => void;
}

export interface GamificationProps {
  agentStats: AgentStats;
  achievements: Achievement[];
  leaderboard: LeaderboardEntry[];
}

// Store types (global state data)
export interface AppState {
  language: Language;
  user: User | null;
  isAuthenticated: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: AgentRole;
  avatar?: string;
}

// Query types (API response data)
export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignedTo: string;
  createdAt: Date;
  completedAt?: Date;
  reward: number;
}

export interface AgentStats {
  level: number;
  rank: number;
  totalEarnings: number;
  tasksCompleted: number;
  successRate: number;
  nextLevelProgress: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  isLocked: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  agentId: string;
  agentName: string;
  avatar?: string;
  score: number;
  tasksCompleted: number;
}

// Landing Page Props
export interface ResetLandingPageProps {
  initialLanguage?: Language;
  showTelegramApp?: boolean;
  showAgentDashboard?: boolean;
  onFeatureClick?: (feature: FeatureType) => void;
  onCTAClick?: (ctaType: string) => void;
}

export interface TelegramMiniAppProps {
  userId: string;
  userRole: AgentRole;
  telegramUserId?: string;
  telegramChatId?: string;
  initialView?: 'merchant' | 'agent';
}

export interface AgentDashboardProps {
  agentId: string;
  initialView?: DashboardView;
  enableRealTimeUpdates?: boolean;
}