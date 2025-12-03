// Axiom RESET Translation System
import { Language } from '@/types/reset';

type TranslationKey = string;
type Translations = Record<TranslationKey, string>;

const translations: Record<Language, Translations> = {
  en: {
    'hero.title': 'SYSTEM REBOOT INITIATED.',
    'hero.subtitle': 'Get Your AI-Powered Mini-Store & Chatbot FREE for 30 Days. Then only <span class="text-[#00F0FF]">$1.99/Month</span>. 🚀 <span class="text-[#00F0FF]">0% Delivery Commission</span>.',
    'hero.cta': 'JOIN THE REVOLUTION',
    'feature.shift.title': 'SHIFT',
    'feature.shift.desc': 'Transform your local business into a digital powerhouse instantly.',
    'feature.fuel.title': 'FUEL',
    'feature.fuel.desc': 'Powered by advanced AI agents that handle orders 24/7.',
    'feature.drop.title': 'DROP',
    'feature.drop.desc': 'Seamless delivery integration with zero platform fees.',
    'feature.scan.title': 'SCAN',
    'feature.scan.desc': 'Real-time inventory tracking and smart analytics.',
    'value.title': 'Zero-Fee Model',
    'value.revenue': '100% Revenue',
    'cta.getStarted': 'Get Started',
    'nav.myAgents': 'My Agents',
    'nav.factory': 'Factory',
    'nav.wallet': 'Wallet',
    'nav.settings': 'Settings',
    'footer.about': 'About Axiom',
    'footer.features': 'Features',
    'footer.contact': 'Contact',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    'footer.rights': '© 2025 Axiom RESET. All rights reserved.',
    'footer.tagline': 'Sovereign Digital Infrastructure for the Real World.',
  },
  ar: {
    'hero.title': 'بدء إعادة تشغيل النظام.',
    'hero.subtitle': 'احصل على متجرك المصغّر المدعوم بالذكاء الاصطناعي وروبوت الدردشة مجاناً لمدة 30 يوماً. ثم فقط <span class="text-[#00F0FF]">$1.99/شهرياً</span>. 🚀 <span class="text-[#00F0FF]">0% عمولة على التوصيل</span>.',
    'hero.cta': 'انضم إلى الثورة',
    'feature.shift.title': 'تحول رقمي',
    'feature.shift.desc': 'حول عملك المحلي إلى قوة رقمية في لحظات.',
    'feature.fuel.title': 'وقود ذكي',
    'feature.fuel.desc': 'مدعوم بوكلاء ذكاء اصطناعي لإدارة الطلبات على مدار الساعة.',
    'feature.drop.title': 'توصيل مباشر',
    'feature.drop.desc': 'تكامل سلس مع خدمات التوصيل بدون رسوم منصة.',
    'feature.scan.title': 'تحليل فوري',
    'feature.scan.desc': 'تتبع المخزون وتحليلات ذكية في الوقت الفعلي.',
    'value.title': 'نموذج بدون رسوم',
    'value.revenue': '100٪ إيرادات',
    'cta.getStarted': 'ابدأ الآن',
    'nav.myAgents': 'وكلائي',
    'nav.factory': 'المصنع',
    'nav.wallet': 'المحفظة',
    'nav.settings': 'الإعدادات',
    'footer.about': 'عن أكسيوم',
    'footer.features': 'المميزات',
    'footer.contact': 'اتصل بنا',
    'footer.privacy': 'سياسة الخصوصية',
    'footer.terms': 'شروط الخدمة',
    'footer.rights': '© 2025 أكسيوم ريسيت. جميع الحقوق محفوظة.',
    'footer.tagline': 'بنية تحتية رقمية سيادية للعالم الحقيقي.',
  },
};

export const useTranslation = (language: Language = 'en') => {
  const t = (key: TranslationKey): string => {
    return translations[language][key] || key;
  };
  return { t, language };
};