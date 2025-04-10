
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const url = new URL("https://api.openai.com/v1/realtime");
    url.searchParams.set("model", "gpt-4o-realtime-preview-2024-12-17");
    url.searchParams.set("voice", "alloy");

    const response = await fetch(url.toString(), {
      method: "POST",
      body,
      headers: {
        Authorization: `Bearer ${process.env["OPENAI_API_KEY"]}`,
        "Content-Type": "application/sdp",
      },
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const sdp = await response.text();
    return new NextResponse(sdp, {
      headers: {
        "Content-Type": "application/sdp",
      },
    });
  } catch (error) {
    console.error("RTC Connect Error:", error);
    return NextResponse.json(
      { error: "Failed to establish WebRTC connection" },
      { status: 500 },
    );
  }
}


