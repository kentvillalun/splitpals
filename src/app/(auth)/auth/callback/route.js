import { createServerSupabaseClient } from "@/app/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  const supabase = await createServerSupabaseClient();

  const {
    data: { session },
    error,
  } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !session) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id, has_completed_onboarding")
    .eq("id", session.user.id)
    .single();

  if (existingProfile) {
    await supabase
      .from("profiles")
      .upsert({ id: session.user.id }, { onConflict: "id" });
  } else {
    await supabase
      .from("profiles")
      .upsert(
        {
          id: session.user.id,
          name: session.user.user_metadata?.full_name ?? null,
        },
        { onConflict: "id" },
      );
  }

  if (!existingProfile?.has_completed_onboarding) {
    return NextResponse.redirect(new URL("/setup", request.url));
  }

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
