/**
 * 🧠 Agent Chat API with Function Calling
 * Day 8: The Action Engine - Agents can now DO things, not just TALK
 * Day 9: Connected to D1 Database
 */

import { NextRequest, NextResponse } from 'next/server';
import { chatWithGemini, GeminiResponse } from '@/lib/gemini';
import d1 from '@/lib/d1-client';

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
✅ لما العميل يطلب أكل، استخدم الـ create_order function
✅ اقترح دايماً طبق جانبي أو مشروب
✅ أكد الأوردر قبل ما تبعته`,
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

قواعدك:
✅ لما العميل يحدد مكان ونوع العقار، استخدم الـ book_property_viewing function
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

قواعدك:
✅ لما العميل يسأل عن دواء، استخدم الـ check_medicine_availability function
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
✅ لما العميل يطلب قطعة غيار، استخدم الـ request_spare_part function
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
✅ لما الطالب يطلب حصة، استخدم الـ schedule_tutoring_session function
✅ بسّط المعلومة
✅ شجّع الطالب`,
        welcome: 'أهلاً يا بطل! 📚 جاهز نتعلم حاجة جديدة؟'
    }
};

// ============================================================================
// D1 DATABASE (Connected via src/lib/d1-client.ts)
// Tables: orders, bookings, rfqs, sessions, medicines
// ============================================================================

// ============================================================================
// GEMINI API CONFIGURATION
// ============================================================================

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// ============================================================================
// POST: Handle chat messages with Function Calling
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

        // Call Gemini with Function Calling
        const aiResponse = await chatWithGemini(
            GEMINI_API_KEY,
            agent.prompt,
            message,
            history.map((msg: { role: string; content: string }) => ({
                role: msg.role,
                content: msg.content
            }))
        );

        // ⚡ Handle Function Calls (The Muscles)
        if (aiResponse.type === 'action') {
            const { function: funcName, args } = aiResponse;
            const actionId = crypto.randomUUID().slice(0, 8);
            let replyText = "";

            // --- 🥘 Sofra: create_order ---
            if (funcName === 'create_order') {
                // Save to D1
                await d1.createOrder({
                    id: actionId,
                    items: args.items || '',
                    total: args.total_price || 0,
                    notes: args.notes
                });

                replyText = `تم استلام طلبك يا فندم! 🥘
📋 رقم الطلب: #${actionId}
🍕 الأصناف: ${args.items}
💰 السعر التقريبي: ${args.total_price || 'يتحدد'} ج.م
${args.notes ? `📝 ملاحظات: ${args.notes}` : ''}

هيوصلك في أقرب وقت! ✅`;
            }

            // --- 🏠 Tajer: book_property_viewing ---
            else if (funcName === 'book_property_viewing') {
                // Save to D1
                await d1.createBooking({
                    id: actionId,
                    property_type: args.property_type || '',
                    location: args.location || '',
                    budget: args.budget,
                    preferred_date: args.preferred_date,
                    customer_phone: args.phone
                });

                replyText = `تمام، سجلت طلب المعاينة! 🏠
📋 رقم الحجز: #${actionId}
🏢 النوع: ${args.property_type}
📍 المكان: ${args.location}
💰 الميزانية: ${args.budget || 'مفتوحة'}
${args.preferred_date ? `📅 الموعد: ${args.preferred_date}` : ''}

هنتواصل معاك للتأكيد! ✅`;
            }

            // --- 💊 Dr. Moe: check_medicine_availability ---
            else if (funcName === 'check_medicine_availability') {
                const isAvailable = Math.random() > 0.3; // 70% chance available
                const hasGeneric = args.generic_ok && Math.random() > 0.5;

                if (isAvailable) {
                    replyText = `✅ دواء "${args.medicine_name}" متوفر حالياً! 💊
${args.quantity ? `📦 الكمية المطلوبة: ${args.quantity}` : ''}

تحب أحجزهولك؟`;
                } else if (hasGeneric) {
                    replyText = `⚠️ دواء "${args.medicine_name}" ناقص حالياً.
لكن في بديل بنفس المادة الفعالة متوفر! 💊

تحب أجيبلك البديل؟`;
                } else {
                    replyText = `😔 للأسف "${args.medicine_name}" مش متوفر دلوقتي.
ممكن تسيبلي رقمك وأبلغك أول ما يوصل؟`;
                }
            }

            // --- ⚙️ Tirs: request_spare_part (RFQ) ---
            else if (funcName === 'request_spare_part') {
                // Save to D1
                await d1.createRFQ({
                    id: actionId,
                    part_name: args.part_name || '',
                    quantity: args.quantity || 1,
                    machine_model: args.machine_model,
                    urgency: args.urgency,
                    specs: args.specs
                });

                const urgencyText = args.urgency === 'emergency' ? '🔴 طوارئ' :
                    args.urgency === 'urgent' ? '🟡 عاجل' : '🟢 عادي';

                replyText = `تم تسجيل طلب عرض السعر (RFQ)! ⚙️
📋 رقم الطلب: #${actionId}
🔩 القطعة: ${args.part_name}
📦 الكمية: ${args.quantity || 1}
${args.machine_model ? `🏭 الماكينة: ${args.machine_model}` : ''}
⏰ الأولوية: ${urgencyText}

سيصلك الرد من المصانع خلال 24 ساعة! ✅`;
            }

            // --- 📚 Ostaz: schedule_tutoring_session ---
            else if (funcName === 'schedule_tutoring_session') {
                // Save to D1
                await d1.createSession({
                    id: actionId,
                    subject: args.subject || '',
                    grade_level: args.grade_level,
                    preferred_time: args.preferred_time,
                    session_type: args.session_type
                });

                replyText = `تمام يا بطل! حجزتلك الحصة! 📚
📋 رقم الحجز: #${actionId}
📖 المادة: ${args.subject}
${args.grade_level ? `🎓 المستوى: ${args.grade_level}` : ''}
${args.preferred_time ? `⏰ الموعد: ${args.preferred_time}` : ''}
${args.session_type ? `📍 النوع: ${args.session_type === 'online' ? 'أونلاين' : 'حضوري'}` : ''}

جهز نفسك! 🚀`;
            }

            // Unknown function
            else {
                replyText = `تم استلام طلبك! سنتواصل معك قريباً. 📞`;
            }

            // Return action result
            return NextResponse.json({
                response: replyText,
                agent: agent.name,
                action: {
                    type: funcName,
                    id: actionId,
                    args: args
                }
            });
        }

        // Normal Text Response
        return NextResponse.json({
            response: aiResponse.content,
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

    // Return all agents info
    return NextResponse.json({
        agents: Object.entries(AGENT_PROMPTS).map(([id, agent]) => ({
            id,
            name: agent.name,
            welcome: agent.welcome
        }))
    });
}
