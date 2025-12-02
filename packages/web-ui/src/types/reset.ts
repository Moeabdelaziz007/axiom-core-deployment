import { LucideIcon } from 'lucide-react';

export type Language = 'en' | 'ar';

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
    type: 'SHIFT' | 'FUEL' | 'DROP' | 'SCAN';
    title: string;
    description: string;
    icon: LucideIcon;
}
