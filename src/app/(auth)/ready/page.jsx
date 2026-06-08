"use client";

import { DesktopGuard } from "@/app/components/DesktopGuard";
import { Page } from "@/app/components/layout/Page";
import { supabase } from "@/app/lib/supabase";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ScissorsIcon } from "@heroicons/react/16/solid";

export default function ReadyPage() {
  const [name, setName] = useState("");

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const fullName = session?.user?.user_metadata?.full_name ?? "";

      setName(fullName.split(" ")[0]);
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

          <div className="flex flex-col w-full gap-4 md:gap-7 flex-1 items-center h-full justify-center mb-10">
            <div className="flex flex-col items-center ">
              <h3 className="font-display text-3xl font-bold text-center max-w-50 md:max-w-md">
                Ready to split, <span className="text-primary">{name}</span>? 🎉
              </h3>
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
              />
            </div>
          </div>

          <div className="max-w-sm md:max-w-xl flex flex-col gap-3 items-center w-full mobile:mb-30 xs:mb-10">
            <button className=" w-full gradient-button py-3.5 px-4 gap-2 rounded-2xl disabled:opacity-25 disabled:pointer-events-none hover:cursor-pointer transition-all active:scale-95 duration-200 ease-in-out hover:opacity-90 text-white font-semibold">
              Split the bill
            </button>

            <button className="font-medium text-text-primary text-sm">
              I want to explore first →
            </button>
          </div>
        </main>
      </Page>
    </>
  );
}
