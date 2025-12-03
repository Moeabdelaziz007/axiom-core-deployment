import { LucideIcon } from 'lucide-react';

export type Language = 'en' | 'ar';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type SectorType = 'juice_shop' | 'mobile_repair' | 'pharmacy' | 'general_retail' | 'food_service';

export interface AgentBenefitProps {
    title: string;
    description: string;
    icon: LucideIcon;
}

export interface SectorCardProps {
    sector: 'juice_shop' | 'mobile_repair' | 'pharmacy' | 'general_retail' | 'food_service';
    name: string;
    description: string;
    benefits: string[];
    icon: LucideIcon;
}

export interface FeatureCardProps {
    type: 'SHIFT' | 'FUEL' | 'DROP' | 'SCAN' | 'SOFRA' | 'TAJER' | 'DR. MOE' | 'USTA' | 'OSTAZ';
    title: string;
    description: string;
    icon: LucideIcon;
}

export interface MetricCounterProps {
    value: number;
    label: string;
    suffix?: string;
    prefix?: string;
    animationDuration?: number;
}
