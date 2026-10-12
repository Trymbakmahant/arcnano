import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
    }

    const trimmed = url.trim();

    if (!trimmed.startsWith("https://")) {
      return NextResponse.json(
        {
          isHttps: false,
          isReachable: false,
          error: "Endpoint must use secure HTTPS protocol (https://...)",
        },
        { status: 400 }
      );
    }

    // Perform REAL live network probe
    const startTime = Date.now();
    try {
      let response: Response;
      try {
        response = await fetch(trimmed, {
          method: "HEAD",
          headers: { "User-Agent": "Arcnano-Marketplace-Verifier/1.0" },
          signal: AbortSignal.timeout(4000),
        });
      } catch {
        // Fallback to GET if HEAD method is blocked or unsupported
        response = await fetch(trimmed, {
          method: "GET",
          headers: { "User-Agent": "Arcnano-Marketplace-Verifier/1.0" },
          signal: AbortSignal.timeout(4000),
        });
      }

      const elapsed = Date.now() - startTime;

      return NextResponse.json({
        isHttps: true,
        isReachable: true,
        httpStatus: response.status,
        statusText: response.statusText,
        isX402: response.status === 402,
        latencyMs: elapsed,
        message:
          response.status === 402
            ? "Live endpoint verified with active HTTP 402 payment gate!"
            : `Live endpoint reachable (HTTP ${response.status} in ${elapsed}ms)`,
      });
    } catch (fetchErr: unknown) {
      const elapsed = Date.now() - startTime;
      const errorMessage =
        fetchErr instanceof Error ? fetchErr.message : "Failed to reach host over HTTPS";

      return NextResponse.json({
        isHttps: true,
        isReachable: false,
        latencyMs: elapsed,
        error: errorMessage,
        message: "Endpoint host could not be reached over the public internet.",
      });
    }
  } catch {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}
