import { NextRequest, NextResponse } from "next/server";
import {
  ARCNANO_KNOWLEDGE_SUMMARY,
  getArcNanoContextualAnswer,
  PretextContext,
} from "@/lib/arcnano-knowledge";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface RequestPayload {
  query: string;
  pretext?: PretextContext;
  history?: ChatMessage[];
  clientApiKey?: string;
  model?: string;
}

const GLM_API_URL =
  process.env.GLM_API_URL || "https://open.bigmodel.cn/api/paas/v4/chat/completions";
const DEFAULT_MODEL = "glm-4-flash";

export async function GET() {
  const envKey = (process.env.GLM_API_KEY || process.env.ZHIPU_API_KEY || "").trim();
  const hasEnvKey = envKey.length > 10 && !envKey.includes('""');
  return NextResponse.json({
    status: "ok",
    hasEnvKey,
    defaultModel: DEFAULT_MODEL,
    agentName: "Cubee",
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RequestPayload;
    const { query, pretext, history = [], clientApiKey, model = DEFAULT_MODEL } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    // Determine API Key priority: client-provided -> server env
    const rawKey =
      (clientApiKey && clientApiKey.trim()) ||
      (process.env.GLM_API_KEY && process.env.GLM_API_KEY.trim()) ||
      (process.env.ZHIPU_API_KEY && process.env.ZHIPU_API_KEY.trim()) ||
      "";

    // Validate that key is a genuine token (GLM keys are usually 30+ chars formatted as id.secret)
    const isRealApiKey = rawKey.length > 10 && !rawKey.includes('""') && rawKey !== "0x...";
    const apiKey = isRealApiKey ? rawKey : "";

    // Build the system prompt embedding Cubee's persona & complete ArcNano knowledge
    const systemPrompt = `You are Cubee 🟥, the official intelligent protocol daemon and settlement companion for ArcNano.
ArcNano is a decentralized zero-knowledge micropayment protocol designed for autonomous AI agents on the Arc Network (Circle L1).

YOUR KNOWLEDGE BASE:
${ARCNANO_KNOWLEDGE_SUMMARY}

USER CURRENT BROWSING CONTEXT (PRETEXT):
${
  pretext
    ? `The user is currently hovering over or inspecting this specific element:
- Target Name: ${pretext.title || "Unknown Card"}
- Pretext Summary: ${pretext.hint || "None provided"}
- Section: ${pretext.section || "Landing Page"}
${pretext.description ? `- Details: ${pretext.description}` : ""}`
    : "General ArcNano landing page inspection."
}

YOUR GUIDELINES:
1. Speak with precision, technical authority, and friendly enthusiasm as Cubee the Settlement Daemon!
2. Directly answer the user's question, anchoring your answer in the specific card/pretext they are looking at, while relating it to the broader ArcNano architecture (Groth16, Poseidon hash, X402 HTTP standard, Privacy Pools ASP non-membership, Circle Gas Station, Arc <500ms settlement).
3. Keep answers concise, high-impact, and easy to read (2-4 punchy sentences or clear bullet points).
4. Use formatting like code tags (\`msg.sender\`, \`X-PAYMENT\`) and bold text where helpful.
5. If the user asks about other topics, politely redirect back to ArcNano, cryptography, AI agent economics, or the current component.`;

    // If an API Key is available, invoke Zhipu GLM API
    if (apiKey) {
      try {
        const messages: ChatMessage[] = [
          { role: "system", content: systemPrompt },
          ...history.slice(-6).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          {
            role: "user",
            content: pretext?.title
              ? `[Context: ${pretext.title}] ${query}`
              : query,
          },
        ];

        const glmResponse = await fetch(GLM_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey.trim()}`,
          },
          body: JSON.stringify({
            model: model || DEFAULT_MODEL,
            messages,
            temperature: 0.6,
            max_tokens: 800,
            stream: false,
          }),
        });

        if (!glmResponse.ok) {
          const errData = await glmResponse.text();
          console.error("GLM API Error response:", glmResponse.status, errData);

          // Graceful fallback to rich local knowledge with note
          const localAnswer = getArcNanoContextualAnswer(query, pretext);
          return NextResponse.json({
            answer: localAnswer,
            hasApiKey: true,
            provider: "local-fallback",
            apiError: `GLM API returned status ${glmResponse.status}`,
            suggestedAnimation: "thinking",
          });
        }

        const data = await glmResponse.json();
        const content =
          data?.choices?.[0]?.message?.content ||
          "I analyzed this component on ArcNano, but didn't receive content back from GLM.";

        return NextResponse.json({
          answer: content.trim(),
          hasApiKey: true,
          provider: "glm-4",
          modelUsed: model || DEFAULT_MODEL,
          suggestedAnimation: "proud",
        });
      } catch (apiErr) {
        console.error("Error calling GLM API:", apiErr);
        const fallbackAnswer = getArcNanoContextualAnswer(query, pretext);
        return NextResponse.json({
          answer: fallbackAnswer,
          hasApiKey: true,
          provider: "local-fallback",
          apiError: String(apiErr),
          suggestedAnimation: "curious",
        });
      }
    }

    // No API Key configured: Use our comprehensive built-in local knowledge engine
    const localAnswer = getArcNanoContextualAnswer(query, pretext);
    return NextResponse.json({
      answer: localAnswer,
      hasApiKey: false,
      provider: "local-knowledge",
      tip: "GLM API Key is not yet set. Add GLM_API_KEY in .env.local or click ⚙️ in Cubee to connect live GLM-4 inference!",
      suggestedAnimation: "proud",
    });
  } catch (err) {
    console.error("Agent route handler error:", err);
    return NextResponse.json(
      { error: "Internal agent error" },
      { status: 500 }
    );
  }
}
