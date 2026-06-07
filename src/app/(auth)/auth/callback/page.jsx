import { createServerSupabaseClient } from "@/app/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function CallbackPage({ searchParams }) {
  const supabase = await createServerSupabaseClient();

  const params = await searchParams;

  const code = params.code;
  console.log("code:", code);
  if (!code) redirect("/onboarding");

  const {
    data: { session },
    error,
  } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !session) redirect("/onboarding");

  await supabase.from("profiles").upsert(
    {
      id: session.user.id,
      name: session.user.user_metadata?.full_name ?? null,
    },
    {
      onConflict: "id",
    },
  );

  const { data: profile } = await supabase
    .from("profiles")
    .select("has_completed_onboarding")
    .eq("id", session.user.id)
    .single();

  if (!profile?.has_completed_onboarding) redirect("/setup");
  redirect("/dashboard");

  return <></>;
}
