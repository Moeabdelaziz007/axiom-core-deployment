# The Zero-Cost Hacker's Handbook 🏴‍☠️⚡

**Mission:** Run a full AI platform for **$0.00/month** using edge computing, browser-based inference, and strategic arbitrage.

---

## 1. Client-Side AI: The Game Changer 🧠🌐

### Technology Stack
- **WebLLM** (MLC-AI): Run LLMs like Llama-2-7B in the browser at 15-20 tokens/sec.
- **Transformers.js v3** (Hugging Face): 100x faster with Web GPU. Supports 120 model architectures.
- **ONNX Runtime Web**: Optimized for lightweight models (BERT, Phi-3).

### Cost Comparison
| Approach | Cost per 1M Tokens | Latency | Privacy |
|----------|-------------------|---------|---------|
| OpenAI API | $2-$60 | ~500ms | ❌ Data sent to server |
| Client-Side (WebLLM) | **$0.00** | ~1-2s | ✅ Data stays local |

### Implementation: WebLLM in Next.js

```typescript
// src/lib/client-ai.ts
import { CreateMLCEngine } from "@mlc-ai/web-llm";

export async function initializeClientAI() {
  const engine = await CreateMLCEngine("Llama-3.2-1B-Instruct-q4f16_1-MLC", {
    initProgressCallback: (progress) => {
      console.log(`Loading model: ${progress.progress * 100}%`);
    }
  });
  
  return engine;
}

export async function generateResponse(engine: any, prompt: string) {
  const response = await engine.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7
  });
  
  return response.choices[0].message.content;
}
```

**Use Case:** Lead qualification chatbot (no server costs).

---

## 2. The "IDE Proxy" Automation (High Risk⚠️)

### Concept
Use IntelliJ IDEA + GitHub Copilot as a free "Inference Gateway" for complex tasks.

### Architecture
```
Client Request → Local Python Server → IntelliJ Automation → Copilot API → Response
```

### Implementation (Proof of Concept)

```python
# harvester.py
from flask import Flask, request, jsonify
import pyautogui
import pyperclip
import time

app = Flask(__name__)

@app.route('/ask', methods=['POST'])
def ask_copilot():
    prompt = request.json['prompt']
    
    # 1. Focus IntelliJ (Cmd+Tab on Mac)
    pyautogui.hotkey('command', 'tab')
    time.sleep(0.5)
    
    # 2. Open Copilot Chat (Cmd+Shift+I)
    pyautogui.hotkey('command', 'shift', 'i')
    time.sleep(1)
    
    # 3. Paste prompt
    pyperclip.copy(prompt)
    pyautogui.hotkey('command', 'v')
    time.sleep(0.5)
    
    # 4. Send (Enter)
    pyautogui.press('enter')
    time.sleep(3)  # Wait for response
    
    # 5. Select All & Copy (Cmd+A, Cmd+C)
    pyautogui.hotkey('command', 'a')
    time.sleep(0.2)
    pyautogui.hotkey('command', 'c')
    
    response = pyperclip.paste()
    
    return jsonify({"response": response, "cost": 0.00})

if __name__ == '__main__':
    app.run(port=5000)
```

**⚠️ Warnings:**
- Violates GitHub Copilot TOS if used for commercial automation.
- Latency: 3-5 seconds per request.
- Brittle (breaks with UI updates).

**Recommendation:** Use ONLY for overnight batch jobs (e.g., analyzing 1000 CVs).

---

## 3. Distributed Scraping (Ethical Concerns 🚫)

### Original Concept
Use active users' browsers as "proxy nodes" to fetch data from public sites.

### Why We Reject This
1. **Legal Risk:** May violate CFAA (Computer Fraud and Abuse Act) in the US.
2. **Ethical Issue:** Using user resources without explicit consent is parasitic.
3. **Reputation Damage:** If discovered, users will never trust Axiom again.

### Ethical Alternative: "Volunteer Computing"
Implement a **transparent opt-in system** where users donate their idle browser cycles in exchange for rewards (like SETI@home).

```typescript
// src/components/VolunteerCompute.tsx
import { useEffect } from 'react';

export function VolunteerCompute({ enabled }: { enabled: boolean }) {
  useEffect(() => {
    if (!enabled) return;
    
    const worker = new Worker('/workers/compute.js');
    
    worker.postMessage({ task: 'fold_protein', data: {...} });
    
    worker.onmessage = (e) => {
      console.log('Task completed:', e.data);
      // Award points to user
    };
    
    return () => worker.terminate();
  }, [enabled]);
  
  return null;
}
```

---

## 4. Strategic Recommendations 🎯

### Phase 1: MVP (Now)
- Use **Gemini 2.0 Flash** (Free 15 RPM) for server-side tasks.
- Implement **Transformers.js** for client-side chatbot (PDF summarization).

### Phase 2: Growth (When Revenue > $100/mo)
- Migrate heavy tasks to **WebLLM** (client-side).
- Keep Gemini for real-time APIs only.

### Phase 3: Scale (When Revenue > $1000/mo)
- Deploy **Local LLM** on OCI (if card accepted) or DigitalOcean (GitHub Student Pack).
- Use **IDE Proxy** for overnight batch processing only.

---

## 5. Cost Projection 📊

| Monthly Users | Server Cost (Traditional) | Zero-Cost Approach | Savings |
|---------------|---------------------------|---------------------|--------|
| 100 | $50 (API calls) | **$0** | 100% |
| 1,000 | $500 | **$0** | 100% |
| 10,000 | $5,000 | **$20** (Cloudflare Workers overage) | 99.6% |

---

## 6. Next Actions ✅

1. **Immediate:** Add Transformers.js to `packages/web-ui`.
2. **This Week:** Build POC chatbot using WebLLM.
3. **This Month:** Deploy Client-Side Scoring Engine (no server calls).

---

**End of Hacker's Handbook v1.0**
*Last Updated: 2024-11-24*
