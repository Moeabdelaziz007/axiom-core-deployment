// Axiom RESET Translation System
import { Language } from '@/types/reset';

type TranslationKey = string;
type Translations = Record<TranslationKey, string>;

const translations: Record<Language, Translations> = {
  en: {
    'hero.title': 'SYSTEM REBOOT INITIATED.',
    'hero.subtitle': 'Get Your AI-Powered Mini-Store & Chatbot FREE for 30 Days. Then only <span class="text-axiom-neon-green">$1.99/Month</span>. 🚀 <span class="text-axiom-neon-green">0% Delivery Commission</span>.',
    'hero.cta': 'JOIN THE REVOLUTION',
    'feature.shift.title': 'SHIFT',
    'feature.shift.desc': 'Decision role point status ipsum',
    'feature.fuel.title': 'FUEL',
    'feature.fuel.desc': 'Elenifque poper erat praesit ipsum',
    'feature.drop.title': 'DROP',
    'feature.drop.desc': 'Oblives cabitur interdum caucibus',
    'feature.scan.title': 'SCAN',
    'feature.scan.desc': 'Loque non class consectetuer etres',
    'value.title': 'Zero-Fee Model',
    'value.revenue': '100% Revenue',
    'cta.getStarted': 'Get Started',
    'nav.myAgents': 'My Agents',
    'nav.factory': 'Factory',
    'nav.wallet': 'Wallet',
    'nav.settings': 'Settings',
    'merchant.title': 'ثورة التاجر الصغير',
    'merchant.feature1': 'متجر إلكتروني فوري مجاناً (30 يوم).',
    'merchant.feature2': 'شات بوت AI للطلبات بسعر رمزي: $1.99 شهرياً.',
    'merchant.feature3': 'عمولة المنصة على التوصيل: 0%.',
    'merchant.cta': 'انضم الآن وابدأ البيع',
  },
  ar: {
    'hero.title': 'بدء إعادة تشغيل النظام.',
    'hero.subtitle': 'احصل على متجرك المصغّر المدعوم بالذكاء الاصطناعي وروبوت الدردشة مجاناً لمدة 30 يوماً. ثم فقط <span class="text-axiom-neon-green">$1.99/شهرياً</span>. 🚀 <span class="text-axiom-neon-green">0% عمولة على التوصيل</span>.',
    'hero.cta': 'انضم إلى الثورة',
    'feature.shift.title': 'تحويل',
    'feature.shift.desc': 'نقطة قرار دور الحالة',
    'feature.fuel.title': 'وقود',
    'feature.fuel.desc': 'طاقة للعمليات',
    'feature.drop.title': 'إسقاط',
    'feature.drop.desc': 'توصيل فوري',
    'feature.scan.title': 'مسح',
    'feature.scan.desc': 'تحقق من الجودة',
    'value.title': 'نموذج بدون رسوم',
    'value.revenue': '100٪ إيرادات',
    'cta.getStarted': 'ابدأ الآن',
    'nav.myAgents': 'وكلائي',
    'nav.factory': 'المصنع',
    'nav.wallet': 'المحفظة',
    'nav.settings': 'الإعدادات',
  },
};

export const useTranslation = (language: Language = 'en') => {
  const t = (key: TranslationKey): string => {
    return translations[language][key] || key;
  };
  return { t, language };
};