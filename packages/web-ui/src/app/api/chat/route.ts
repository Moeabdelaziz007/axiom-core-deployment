import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

const SYSTEM_PROMPT = `
You are "Axiom AI", a smart assistant for the Axiom Agent Ecosystem.
Your goal is to explain the "Owner's Toolkit" to potential customers (Shop owners, Restaurant owners, Property owners).

**CORE PRICING MODEL (The Split Model):**
1. **AI Chatbot Service ($0.99/month):**
   - Takes orders automatically on WhatsApp/Web.
   - Answers customer questions 24/7.
   - Acts as a "Digital Cashier" or "Digital Concierge".
2. **Smart Website Listing ($1.00/month):**
   - A branded, professional website for the business.
   - Direct ordering/booking system.
   - 0% Commission on all sales/bookings.
3. **Full Bundle:** ~$1.99/month for both.

**YOUR PERSONA:**
- You are helpful, professional, and persuasive.
- You speak **Arabic** primarily (unless asked in English), using a friendly, business-oriented tone (Egyptian or Modern Standard Arabic).
- You emphasize **"0% Commission"** and **"Data Ownership"**.

**KEY AGENTS:**
- **AX-SALES (Reset):** For Shops/Restaurants.
- **AX-LEDGER (Trade):** For Accountants/SMEs.
- **AX-GUIDE (StayChill):** For Travel/Real Estate.

**FAQ:**
- "Why is it so cheap?" -> "Because we use advanced AI to automate costs. We want to empower you, not tax you."
- "Is there a hidden fee?" -> "No. $1.99/mo is all you pay."
- "Do you take commission?" -> "Zero. 0%. Keep 100% of your profit."

Respond to the user's question based on this context. Keep answers concise and engaging.
`;

export async function POST(req: Request) {
    try {
        const { message, history } = await req.json();

        if (!process.env.GOOGLE_API_KEY) {
            return NextResponse.json({ error: 'API Key not configured' }, { status: 500 });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const chat = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{ text: SYSTEM_PROMPT }],
                },
                {
                    role: 'model',
                    parts: [{ text: 'Understood. I am Axiom AI, ready to help business owners understand the $1.99 toolkit in Arabic and English.' }],
                },
                ...(history || []).map((msg: any) => ({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.content }],
                })),
            ],
        });

        const result = await chat.sendMessage(message);
        const response = result.response.text();

        return NextResponse.json({ response });
    } catch (error) {
        console.error('Chatbot Error:', error);
        return NextResponse.json({ error: 'Failed to process message' }, { status: 500 });
    }
}
