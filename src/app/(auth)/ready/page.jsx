"use client";

import { DesktopGuard } from "@/app/components/DesktopGuard";
import { Page } from "@/app/components/layout/Page";
import { supabase } from "@/app/lib/supabase";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { haptic } from "@/app/lib/haptic";

export default function ReadyPage() {
  const [name, setName] = useState("");
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", session.user.id)
        .single();

      setName(profile?.name ?? "");
    };

    getUser();
  }, []);

  return (
    <>
      <DesktopGuard />
      <Page className="font-body! gradient-splash lg:hidden flex flex-col items-center px-4">
        <main className="flex flex-col items-center min-w-full h-screen ">
          <div className="max-w-35 relative aspect-3/2 w-full flex items-center mx-auto">
            <Image priority src={"/onboarding/logo.svg"} fill alt="SplitPals" />
          </div>

          <motion.div
            key={"content"}
            className="flex flex-col w-full gap-4 md:gap-7 flex-1 items-center h-full justify-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex flex-col items-center ">
              {name ? (
                <h3 className="font-display text-3xl font-bold text-center max-w-50 md:max-w-md">
                  Ready to split, <span className="text-primary">{name}</span>?
                  🎉
                </h3>
              ) : (
                <h3 className="font-display text-3xl font-bold text-center max-w-50 md:max-w-md">
                  Ready to split? 🎉
                </h3>
              )}

              <p className="text-text-secondary text-sm">
                Your friends are waiting to split the bill.
              </p>
            </div>

            <div className="max-w-65 md:max-w-80 relative aspect-square w-full flex items-center mx-auto">
              <Image
                src={"/corgis/waggy-corgi.png"}
                fill
                priority
                alt="A dorgi dog wagging its tails."
                sizes="(max-width: 768px) 260px, 320px"
              />
            </div>
          </motion.div>

          <motion.div
            key={"button"}
            className="max-w-sm md:max-w-xl flex flex-col gap-3 items-center w-full mobile:mb-30 xs:mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <button
              className=" w-full gradient-button py-3.5 px-4 gap-2 rounded-2xl disabled:opacity-25 disabled:pointer-events-none hover:cursor-pointer transition-all active:scale-95 duration-200 ease-in-out hover:opacity-90 text-white font-semibold"
              onClick={() => {
                haptic.medium();
                router.push("/bills/new");
              }}
            >
              Split the bill
            </button>

            <button
              className="font-medium text-text-primary text-sm"
              onClick={() => {
                haptic.light();
                router.push("/dashboard");
              }}
            >
              I want to explore first →
            </button>
          </motion.div>
        </main>
      </Page>
    </>
  );
}
