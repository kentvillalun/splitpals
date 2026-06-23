import { createServerSupabaseClient } from "@/app/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function RootPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  redirect(user ? "/dashboard" : "/onboarding");
}
