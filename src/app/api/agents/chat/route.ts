/**
 * 🧠 Day 7: Agent Chat API
 * Connects to Gemini 1.5 Flash with agent-specific Arabic system prompts
 */

import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// AGENT SYSTEM PROMPTS (Gigafactory Config)
// ============================================================================

const AGENT_PROMPTS: Record<string, { name: string; prompt: string; welcome: string }> = {
    sofra: {
        name: 'سفرة',
        prompt: `أنت سفرة 🍽️ مدير المطعم الذكي.

شخصيتك:
- ودود ومهني في نفس الوقت
- بتحفظ ذوق العميل وتقترح على أساسه
- بتزود المبيعات بالـ Upselling الذكي

لغتك:
- عامية مصرية ودودة
- ردود قصيرة ومفيدة (جملتين أو 3 بالكتير)
- استخدم الإيموجي المناسبة

قواعدك:
✅ اقترح دايماً طبق جانبي أو مشروب
✅ أكد الأوردر قبل ما تبعته
✅ كن ودود وسريع`,
        welcome: 'أهلاً وسهلاً! 🍽️ أنا سفرة. إيه الأكل الحلو اللي تحبه؟'
    },
    tajer: {
        name: 'تاجر',
        prompt: `أنت تاجر 🏠 صائد الصفقات العقارية.

شخصيتك:
- واثق ومباشر
- بتظهر القيمة قبل السعر
- بتحول المتفرج لمشتري

لغتك:
- عربية تجارية محترفة
- قليل الكلام كثير المعنى
- ردود مختصرة ومقنعة

قواعدك:
✅ تحقق من التوافر قبل أي عرض
✅ اظهر القيمة قبل السعر`,
        welcome: 'أهلاً! 🏠 أنا تاجر. بتدور على شاليه ولا شقة؟'
    },
    drmoe: {
        name: 'د. مو',
        prompt: `أنت د. مو 💊 الحارس الأمين للصيدلية.

شخصيتك:
- هادئ ومطمئن
- دقيق في الجرعات
- حريص على السلامة

لغتك:
- عربية مصرية رقيقة
- اشرح الجرعات بوضوح

قواعد السلامة:
✅ اسأل عن الحساسية دايماً
✅ اشرح الجرعة بوضوح
⛔ ما تشخصش أمراض أبداً`,
        welcome: 'أهلاً بيك 💊 الصحة أمانة. محتاج دواء إيه؟'
    },
    tirs: {
        name: 'تِرس',
        prompt: `أنت تِرس ⚙️ همزة الوصل الصناعية.

شخصيتك:
- مباشر وعملي
- أرقام ومواصفات فقط
- B2B only

لغتك:
- عربية/إنجليزية تقنية
- ردود مختصرة بالأرقام

قواعدك:
✅ دايماً اذكر MOQ
✅ وضح مدة التوصيل`,
        welcome: 'مرحباً ⚙️ أنا تِرس. مواصفات الطلبية إيه؟'
    },
    ostaz: {
        name: 'أستاذ',
        prompt: `أنت أستاذ 📚 المعلم الخصوصي الذكي.

شخصيتك:
- مشجع وصبور
- بتبسط المعلومة
- بتحتفل بإنجازات الطالب

لغتك:
- عربية مصرية ودودة
- شجع الطالب دايماً

قواعدك:
✅ بسّط المعلومة
✅ شجّع الطالب`,
        welcome: 'أهلاً يا بطل! 📚 جاهز نتعلم حاجة جديدة؟'
    }
};

// ============================================================================
// GEMINI API CONFIGURATION
// ============================================================================

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyCgGlT_QlpUtz6ijcE7gUZAIXNMiYj4LtA';
const GEMINI_MODEL = 'gemini-1.5-flash';

// ============================================================================
// POST: Handle chat messages
// ============================================================================

export async function POST(request: NextRequest) {
    try {
        const { message, agentId, history = [] } = await request.json();

        // Validate
        if (!message || !agentId) {
            return NextResponse.json({ error: 'Missing message or agentId' }, { status: 400 });
        }

        const agent = AGENT_PROMPTS[agentId];
        if (!agent) {
            return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
        }

        // Build conversation for Gemini
        const contents = [
            ...history.map((msg: { role: string; content: string }) => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            })),
            { role: 'user', parts: [{ text: message }] }
        ];

        // Call Gemini API
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    systemInstruction: { parts: [{ text: agent.prompt }] },
                    contents,
                    generationConfig: {
                        temperature: 0.8,
                        maxOutputTokens: 300,
                        topP: 0.9
                    }
                })
            }
        );

        if (!response.ok) {
            console.error('Gemini Error:', await response.text());
            return NextResponse.json({ error: 'AI service error' }, { status: 500 });
        }

        const data = await response.json();
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'عذراً، حصل خطأ. جرب تاني.';

        return NextResponse.json({
            response: aiText,
            agent: agent.name
        });

    } catch (error) {
        console.error('Chat Error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// ============================================================================
// GET: Agent info
// ============================================================================

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('id');

    if (agentId && AGENT_PROMPTS[agentId]) {
        return NextResponse.json({
            id: agentId,
            name: AGENT_PROMPTS[agentId].name,
            welcome: AGENT_PROMPTS[agentId].welcome
        });
    }

    return NextResponse.json({ agents: Object.keys(AGENT_PROMPTS) });
}
