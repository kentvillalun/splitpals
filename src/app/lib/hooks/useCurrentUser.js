"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";

// Same auth.getUser() + profiles.name lookup already used for the dashboard
// greeting, centralized so any screen that needs "who am I" (id + real name)
// — e.g. to offer/resolve a "YOU" person — can reuse it.
export function useCurrentUser() {
  const [currentUser, setCurrentUser] = useState(null); // { id, name } | null

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .single();

      if (!cancelled) {
        setCurrentUser({ id: user.id, name: profile?.name ?? "" });
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return currentUser;
}
