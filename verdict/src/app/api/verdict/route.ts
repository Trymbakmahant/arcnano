import { NextRequest, NextResponse } from "next/server";
import { evaluateVerdict, VerdictResult } from "@/lib/verdict-engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const question = String(body.question || "").trim();

    if (!question) {
      return NextResponse.json(
        { error: "Question parameter is required" },
        { status: 400 }
      );
    }

    // 1. Check local deterministic engine
    const localEval = evaluateVerdict(question);
    if (localEval.id !== "eval-dynamic") {
      return NextResponse.json(localEval);
    }

    // 2. Dynamic evaluation via GLM API if available
    const apiKey = process.env.GLM_API_KEY;
    const apiUrl = process.env.GLM_API_URL;

    if (apiKey && apiUrl && !apiKey.includes("your-")) {
      try {
        const sysPrompt = `You are ArcNano Verdict Engine. You evaluate questions about zero-knowledge payments, AI agent economics, Arc Network, privacy, and compliance.
Your answer must be strictly binary: YES or NO.
Output valid JSON only with NO markdown fences:
{
  "verdict": "YES" or "NO",
  "confidence": "Cryptographic Guarantee" or "High Certainty" or "Identified Vulnerability",
  "anchor": "Short technical anchor name (e.g. Groth16 Verifier, Circle Paymaster, Poseidon Merkle Vault)",
  "domain": "IDENTITY" or "GAS" or "COMPLIANCE" or "LATENCY" or "SECURITY",
  "reasoning": [
    "Short factual point (under 14 words).",
    "Short factual point (under 14 words).",
    "Short factual point (under 14 words)."
  ]
}
CRITICAL RULES:
1. Extremely concise. Zero filler words.
2. Absolutely NO emojis.
3. Only return valid JSON.`;

        const response = await fetch(`${apiUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": apiKey,
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            messages: [
              { role: "system", content: sysPrompt },
              { role: "user", content: `Question: ${question}` },
            ],
            temperature: 0.1,
            max_tokens: 250,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          let raw = data.choices?.[0]?.message?.content || "";
          raw = raw.replace(/```json/g, "").replace(/```/g, "").trim();
          const parsed = JSON.parse(raw);

          const result: VerdictResult = {
            id: "ai-" + Date.now(),
            question,
            verdict: parsed.verdict === "NO" ? "NO" : "YES",
            confidence: parsed.confidence || "High Certainty",
            anchor: parsed.anchor || "ArcNano Architecture",
            domain: parsed.domain || "SECURITY",
            reasoning: Array.isArray(parsed.reasoning)
              ? parsed.reasoning.slice(0, 3)
              : [parsed.reasoning || "Evaluated by cryptographic rules."],
          };

          return NextResponse.json(result);
        }
      } catch {
        // Fall back to local evaluation on API timeout or error
      }
    }

    // 3. Fallback to local evaluation
    return NextResponse.json(localEval);
  } catch (err) {
    return NextResponse.json(
      { error: "Evaluation failed", details: String(err) },
      { status: 500 }
    );
  }
}
