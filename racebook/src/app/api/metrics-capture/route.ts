import { NextResponse, type NextRequest } from "next/server";
import { extractMetrics } from "@/features/ai-capture/extract-metrics";
import { rejectionReasonForScreenshot, type SupportedScreenshotMediaType } from "@/features/ai-capture/screenshot-constraints";
import { getCurrentAthlete } from "@/session/current-athlete";

function toBase64(bytes: ArrayBuffer): string {
  return Buffer.from(bytes).toString("base64");
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // A request with no multipart body (or the wrong Content-Type) makes `formData()`
  // throw before we can inspect it — that's malformed input at the system boundary,
  // not an exceptional situation, so it's reported the same way as a missing field.
  const formData = await request.formData().catch(() => undefined);
  const screenshot = formData?.get("screenshot");

  if (!(screenshot instanceof File)) {
    return NextResponse.json({ reason: "missing" }, { status: 400 });
  }

  const rejectionReason = rejectionReasonForScreenshot(screenshot);
  if (rejectionReason) {
    return NextResponse.json({ reason: rejectionReason }, { status: 400 });
  }

  await getCurrentAthlete();

  const outcome = await extractMetrics({
    base64: toBase64(await screenshot.arrayBuffer()),
    mediaType: screenshot.type as SupportedScreenshotMediaType,
  });

  if (outcome.kind === "captured") {
    return NextResponse.json({ metrics: outcome.metrics }, { status: 200 });
  }
  if (outcome.kind === "unreadable") {
    return NextResponse.json({ reason: "unreadable" }, { status: 422 });
  }
  return NextResponse.json({ reason: "unavailable" }, { status: 503 });
}
