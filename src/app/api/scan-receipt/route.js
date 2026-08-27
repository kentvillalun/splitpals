import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll: () => cookieStore.getAll() } },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Atomic rate-limit check (the upsert you designed)
  const { data: limitRow, error: limitError } = await supabase.rpc(
    "check_and_increment_scan_limit",
    { p_user_id: user.id },
  );

  if (limitError || !limitRow) {
    return NextResponse.json(
      { error: "Daily scan limit reached. Try again tomorrow." },
      { status: 429 },
    );
  }

  // Get the uploaded image
  const formData = await request.formData();
  const imageFile = formData.get("receipt");
  if (!imageFile) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }

  // Convert the File to base64
  const bytes = await imageFile.arrayBuffer();
  const base64Image = Buffer.from(bytes).toString("base64");
  const mimeType = imageFile.type; // e.g. "image/jpeg"

  const anthropicResponse = await fetch(
    "https://api.anthropic.com/v1/messages",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mimeType,
                  data: base64Image,
                },
              },
              {
                type: "text",
                text: `Extract all items and their prices from this receipt. Return ONLY valid JSON, no other text, in this exact format:
{"items": [{"name": "item name", "price": 0.00}]}
If the image is not a receipt or is too unclear to read, return {"items": [], "error": "description of the problem"}`,
              },
            ],
          },
        ],
      }),
    },
  );

  const result = await anthropicResponse.json();

  if (!anthropicResponse.ok) {
    console.error("Anthropic API error:", result);
    return NextResponse.json(
      {
        error:
          "Receipt scanning is temporary unavailable. Please add items manually.",
      },
      { status: 503 },
    );
  }

    const responseText = result.content[0].text;

  const cleanedText = responseText
    .replace(/^```json\s*/, "")
    .replace(/^```\s*/, "")
    .replace(/```\s*$/, "")
    .trim();

  let parsedData;
  try {
    parsedData = JSON.parse(cleanedText);
  } catch (parseError) {
    console.error("Failed to parse Claude's response as JSON:", responseText);
    return NextResponse.json(
      {
        error:
          "Couldn't read that receipt clearly. Please try again or add items manually.",
      },
      { status: 422 },
    );
  }

  // Claude itself flagged it as unreadable/not a receipt
  if (parsedData.error) {
    return NextResponse.json({ error: parsedData.error }, { status: 422 });
  }

  return NextResponse.json({ items: parsedData.items });
}
