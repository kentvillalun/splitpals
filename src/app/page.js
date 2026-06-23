"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/app/lib/supabase";
import Image from "next/image";

function minimumDelay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function RootPage() {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);

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

      // trigger fade-out, then navigate once it's finished
      setIsExiting(true);
      await minimumDelay(350);
      router.replace(destination);
    }

    init();
  }, [router]);

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          key="splash"
          className="gradient-splash w-full h-screen flex items-center justify-center fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
        >
          <motion.div
            className="relative w-40 aspect-[3/1]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
          >
            <Image
              src="/onboarding/logo.svg"
              fill
              priority
              alt="SplitPals"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}