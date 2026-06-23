"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import Image from "next/image";

function minimumDelay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    async function init() {
      const checkAuth = async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          return { destination: "/onboarding" };
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("has_completed_onboarding")
          .eq("id", user.id)
          .single();

        if (!profile?.has_completed_onboarding) {
          return { destination: "/setup" };
        }

        return { destination: "/dashboard" };
      };

      const [{ destination }] = await Promise.all([
        checkAuth(),
        minimumDelay(2000),
      ]);

      router.replace(destination);
    }

    init();
  }, [router]);

  return (
    <div className="gradient-splash w-full h-screen flex items-center justify-center">
      <div className="relative w-40 aspect-[3/1]">
        <Image
          src="/onboarding/logo.svg"
          fill
          priority
          alt="SplitPals"
        />
      </div>
    </div>
  );
}