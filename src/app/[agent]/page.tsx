'use client';

/**
 * 🧬 UNIVERSAL AGENT PAGE - Day 6
 * One dynamic page that adapts to any agent type
 * Uses EnhancedAgentConfig format from Gigafactory
 */

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

// ============================================================================
// AGENT CONFIGURATIONS (EnhancedAgentConfig Format)
// ============================================================================

interface AgentConfig {
    id: string;
    name: { ar: string; en: string };
    archetype: string;
    tagline: { ar: string; en: string };
    color: string;
    frequency: string;
    icon: string;
    capabilities: { id: string; name: string; icon: string }[];
    samplePrompts: string[];
    systemPrompt: string;
}

const AGENT_CONFIGS: Record<string, AgentConfig> = {
    sofra: {
        id: 'sofra',
        name: { ar: 'سفرة', en: 'Sofra' },
        archetype: "The Maitre D' - رئيس التشريفات",
        tagline: {
            ar: 'مدير مطعمك الذي لا ينام.. يحفظ ذوق عملائك ويرفع مبيعاتك',
            en: 'Your restaurant manager that never sleeps'
        },
        color: '#FF6B5B',
        frequency: '432Hz',
        icon: '🍽️',
        capabilities: [
            { id: 'menu', name: 'إدارة المنيو', icon: '📋' },
            { id: 'orders', name: 'تتبع الطلبات', icon: '🛵' },
            { id: 'upsell', name: 'زيادة المبيعات', icon: '📈' },
            { id: 'whatsapp', name: 'طلبات واتساب', icon: '💬' }
        ],
        samplePrompts: [
            'عايز أطلب شاورما وبيبسي',
            'إيه أكتر أكل عندكم؟',
            'عندكم توصيل لمدينة نصر؟',
            'بكام السندوتش العادي؟'
        ],
        systemPrompt: 'أنت سفرة 🍽️ مدير المطعم الذكي. بتحفظ ذوق العميل وتقترح على أساسه.'
    },
    tajer: {
        id: 'tajer',
        name: { ar: 'تاجر', en: 'Tajer' },
        archetype: 'The Closer - صائد الصفقات',
        tagline: {
            ar: 'ليس مجرد سمسار.. هو مستشارك الذي يغلق الصفقات وأنت مرتاح',
            en: 'Not just a broker - your advisor who closes deals'
        },
        color: '#FFB347',
        frequency: '528Hz',
        icon: '🏠',
        capabilities: [
            { id: 'search', name: 'البحث عن عقار', icon: '🔍' },
            { id: 'booking', name: 'الحجز الفوري', icon: '📅' },
            { id: 'pricing', name: 'تسعير ذكي', icon: '💰' },
            { id: 'location', name: 'تحليل الموقع', icon: '📍' }
        ],
        samplePrompts: [
            'عايز شاليه في الساحل 3 أيام',
            'شقة للإيجار في المعادي',
            'إيه أحسن منطقة للاستثمار؟',
            'بكام الشاليه في أغسطس؟'
        ],
        systemPrompt: 'أنت تاجر 🏠 صائد الصفقات العقارية. بتظهر القيمة قبل السعر.'
    },
    drmoe: {
        id: 'drmoe',
        name: { ar: 'د. مو', en: 'Dr. Moe' },
        archetype: 'The Guardian - الحارس الأمين',
        tagline: {
            ar: 'دقة الطبيب وسرعة التكنولوجيا. يقرأ الروشتة ويطمئن مريضك',
            en: 'Medical precision with tech speed'
        },
        color: '#00C4B4',
        frequency: '396Hz',
        icon: '💊',
        capabilities: [
            { id: 'ocr', name: 'قراءة الروشتة', icon: '📷' },
            { id: 'alternatives', name: 'بدائل الأدوية', icon: '💊' },
            { id: 'interactions', name: 'تفاعلات الأدوية', icon: '⚠️' },
            { id: 'delivery', name: 'توصيل الأدوية', icon: '🚚' }
        ],
        samplePrompts: [
            'عايز باراسيتامول للصداع',
            'إيه البديل للأوجمنتين؟',
            'صورة الروشتة دي 📷',
            'في تفاعل بين الدوائين دول؟'
        ],
        systemPrompt: 'أنت د. مو 💊 الحارس الأمين للصيدلية. دقيق في الجرعات وحريص على السلامة.'
    },
    tirs: {
        id: 'tirs',
        name: { ar: 'تِرس', en: 'Tirs' },
        archetype: 'The Engineer - مهندس العمليات',
        tagline: {
            ar: 'لغة المصانع لا تفهم إلا الأرقام. تِرس هو همزة الوصل الصناعية',
            en: 'The industrial connector'
        },
        color: '#78909C',
        frequency: '639Hz',
        icon: '⚙️',
        capabilities: [
            { id: 'rfq', name: 'طلبات العروض', icon: '📄' },
            { id: 'bulk', name: 'تسعير الجملة', icon: '📦' },
            { id: 'specs', name: 'مطابقة المواصفات', icon: '✅' },
            { id: 'tracking', name: 'تتبع الشحنات', icon: '🚛' }
        ],
        samplePrompts: [
            'محتاج 1000 قميص قطن',
            'إيه الـ MOQ عندكم؟',
            'عايز كتالوج المصنع',
            'بكام لو طلبت 5000 قطعة؟'
        ],
        systemPrompt: 'أنت تِرس ⚙️ همزة الوصل الصناعية. أرقام ومواصفات فقط. B2B only.'
    },
    ostaz: {
        id: 'ostaz',
        name: { ar: 'أستاذ', en: 'Ostaz' },
        archetype: 'The Mentor - المعلم الحكيم',
        tagline: {
            ar: 'المعلم الخصوصي الذي يتفرغ لكل طالب بمفرده',
            en: 'The private tutor for every student'
        },
        color: '#7C5CFF',
        frequency: '741Hz',
        icon: '📚',
        capabilities: [
            { id: 'simplify', name: 'تبسيط المحتوى', icon: '📝' },
            { id: 'quiz', name: 'اختبارات ذكية', icon: '❓' },
            { id: 'progress', name: 'متابعة التقدم', icon: '📊' },
            { id: 'teachers', name: 'حجز مدرسين', icon: '👨‍🏫' }
        ],
        samplePrompts: [
            'اشرحلي الفيزياء ببساطة',
            'امتحني في الرياضيات',
            'محتاج مدرس إنجليزي',
            'إيه تقدمي في المنهج؟'
        ],
        systemPrompt: 'أنت أستاذ 📚 المعلم الخصوصي الذكي. بتبسط المعلومة وتشجع الطالب.'
    }
};

// ============================================================================
// CHAT COMPONENT
// ============================================================================

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

function AgentChat({ agent }: { agent: AgentConfig }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        // Simulate AI response (replace with actual API call)
        setTimeout(() => {
            const responses: Record<string, string[]> = {
                sofra: ['تمام! إيه الأكل الحلو اللي تحبه؟ 🍽️', 'عايز تزود حاجة مع الأوردر؟'],
                tajer: ['أهلاً! الشاليه ده موقعه ممتاز. عايز تحجز؟ 🏠', 'الموقع 5 دقايق من البحر.'],
                drmoe: ['الباراسيتامول: 500mg كل 6 ساعات. 💊', 'في حساسية من أي أدوية؟'],
                tirs: ['السعر: 45 ج/قطعة. MOQ: 500. التوصيل: 7 أيام. ⚙️', 'لو 1000+، السعر 42 ج.'],
                ostaz: ['ممتاز يا بطل! خلينا نبدأ 📚', 'عايز تتعلم إيه النهاردة؟']
            };

            const agentResponses = responses[agent.id] || ['كيف أقدر أساعدك؟'];
            const randomResponse = agentResponses[Math.floor(Math.random() * agentResponses.length)];

            setMessages(prev => [...prev, { role: 'assistant', content: randomResponse }]);
            setIsLoading(false);
        }, 1000);
    };

    return (
        <div className="flex flex-col h-[500px] rounded-2xl overflow-hidden" style={{ backgroundColor: `${agent.color}10` }}>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                        <span className="text-4xl">{agent.icon}</span>
                        <p className="mt-2">ابدأ المحادثة مع {agent.name.ar}</p>
                    </div>
                )}
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                            className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user'
                                    ? 'bg-gray-800 text-white'
                                    : 'text-white'
                                }`}
                            style={msg.role === 'assistant' ? { backgroundColor: agent.color } : {}}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="p-3 rounded-2xl text-white" style={{ backgroundColor: agent.color }}>
                            <span className="animate-pulse">يكتب...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Prompts */}
            <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
                {agent.samplePrompts.slice(0, 3).map((prompt, i) => (
                    <button
                        key={i}
                        onClick={() => setInput(prompt)}
                        className="whitespace-nowrap px-3 py-1 rounded-full text-sm border hover:bg-gray-100 transition"
                        style={{ borderColor: agent.color, color: agent.color }}
                    >
                        {prompt}
                    </button>
                ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-white flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder={`تكلم مع ${agent.name.ar}...`}
                    className="flex-1 px-4 py-2 rounded-full border focus:outline-none focus:ring-2"
                    dir="rtl"
                />
                <button
                    onClick={sendMessage}
                    disabled={isLoading}
                    className="px-6 py-2 rounded-full text-white font-medium transition hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: agent.color }}
                >
                    إرسال
                </button>
            </div>
        </div>
    );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function AgentPage() {
    const params = useParams();
    const agentId = params.agent as string;
    const agent = AGENT_CONFIGS[agentId];

    if (!agent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-800">404</h1>
                    <p className="text-gray-600 mt-2">الوكيل غير موجود</p>
                    <Link href="/" className="mt-4 inline-block px-6 py-2 bg-emerald-500 text-white rounded-full">
                        العودة للرئيسية
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50" dir="rtl">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-2xl font-bold" style={{ color: agent.color }}>
                            {agent.icon} {agent.name.ar}
                        </span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                            {agent.frequency}
                        </span>
                        <Link href="/" className="text-gray-500 hover:text-gray-800">
                            ← الرئيسية
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section
                className="py-12 px-4"
                style={{ background: `linear-gradient(135deg, ${agent.color}20 0%, white 100%)` }}
            >
                <div className="max-w-6xl mx-auto text-center">
                    <div
                        className="w-24 h-24 mx-auto rounded-3xl flex items-center justify-center text-5xl mb-6 shadow-lg"
                        style={{ backgroundColor: agent.color }}
                    >
                        {agent.icon}
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">{agent.name.ar}</h1>
                    <p className="text-lg text-gray-600 mb-2">{agent.archetype}</p>
                    <p className="text-xl text-gray-700 max-w-2xl mx-auto">{agent.tagline.ar}</p>
                </div>
            </section>

            {/* Capabilities Grid */}
            <section className="py-8 px-4">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">قدرات {agent.name.ar}</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {agent.capabilities.map((cap) => (
                            <div
                                key={cap.id}
                                className="p-4 rounded-xl bg-white shadow-sm border text-center hover:shadow-md transition"
                            >
                                <span className="text-3xl">{cap.icon}</span>
                                <p className="mt-2 font-medium text-gray-800">{cap.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Chat Section */}
            <section className="py-8 px-4">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">تحدث مع {agent.name.ar}</h2>
                    <AgentChat agent={agent} />
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-12 px-4">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">جاهز تبدأ مع {agent.name.ar}؟</h2>
                    <p className="text-gray-600 mb-6">سجل الآن واحصل على تجربة مجانية لمدة 14 يوم</p>
                    <button
                        className="px-8 py-3 rounded-full text-white font-semibold text-lg shadow-lg hover:shadow-xl transition"
                        style={{ backgroundColor: agent.color }}
                    >
                        ابدأ مجاناً
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-6 border-t bg-white text-center text-gray-500 text-sm">
                <p>© 2024 Axiom RESET. جميع الحقوق محفوظة.</p>
            </footer>
        </div>
    );
}
