"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/app/lib/supabase";
import Image from "next/image";

function minimumDelay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isAndroid() {
  if (typeof navigator === "undefined") return false;
  return /android/i.test(navigator.userAgent);
}

export default function RootPage() {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [gradientRising, setGradientRising] = useState(false);
  const [showSplashUI, setShowSplashUI] = useState(true);

  useEffect(() => {
    // Android's PWA install flow already shows its own native splash
    // screen (defined via manifest.json) — layering ours on top is
    // redundant and can look like a double-loading glitch. iOS has no
    // equivalent, so we keep our custom splash there.
    setShowSplashUI(!isAndroid());
  }, []);

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

      const onAndroid = isAndroid();

      // Android skips the minimum delay + custom UI entirely — the
      // platform's own splash already covered that loading time.
      const [{ destination: dest }] = await Promise.all([
        checkAuth(),
        onAndroid ? Promise.resolve() : minimumDelay(2000),
      ]);

      if (onAndroid) {
        router.replace(dest);
        return;
      }

      if (dest === "/onboarding") {
        // Phase 1: logo fades out first, on its own
        setIsFlipping(true);
        await minimumDelay(350);
        // Phase 2: gradient visibly rises from bottom to top
        setGradientRising(true);
        await minimumDelay(650);
        router.replace(dest);
      } else {
        setIsExiting(true);
        await minimumDelay(350);
        router.replace(dest);
      }
    }

    init();
  }, [router]);

  if (!showSplashUI) {
    // Android — render nothing, navigation happens instantly once
    // checkAuth resolves. The platform's native splash covers this gap.
    return null;
  }

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          key="splash"
          className="w-full h-screen overflow-hidden flex items-center justify-center fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          style={{ backgroundColor: "#FFF5EE" }}
        >
          {/* Gradient mass — sized to 3x viewport height (not 100%) so the box
              still overlaps the viewport after it travels. Size/position use
              vh/vw (viewport-relative) instead of % (box-relative): with a
              100vh box, translateY(-110%) walks the ENTIRE box off-screen
              before reaching its target, leaving nothing to paint — that was
              the hard seam. Anchor at 105vh (bottom bloom) travels exactly
              -110vh to land at -5vh, matching onboarding's "at 50% -5%". */}
          <motion.div
            className="absolute left-0 top-0 w-full -z-10"
            style={{
              height: "300vh",
              background:
                "radial-gradient(ellipse 140vw 60vh at 50% 105vh, rgba(251,146,60,0.5) 0%, rgba(253,186,116,0.35) 45%, transparent 68%), #FFF5EE",
            }}
            initial={{ y: "0vh" }}
            animate={{ y: gradientRising ? "-110vh" : "0vh" }}
            transition={{ duration: 0.65, ease: [0.65, 0, 0.35, 1] }}
          />

          <motion.div
            className="relative w-40 aspect-3/1 z-10"
            initial={{ opacity: 0, y: 10 }}
            animate={
              isFlipping
                ? { opacity: 0, y: -10 }
                : { opacity: 1, y: 0 }
            }
            transition={
              isFlipping
                ? { duration: 0.3, ease: "easeIn" }
                : { duration: 0.4, ease: "easeOut", delay: 0.1 }
            }
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