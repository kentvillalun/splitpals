"use client";

import { DesktopGuard } from "@/app/components/DesktopGuard";
import { Page } from "@/app/components/layout/Page";
import { Card } from "@/app/components/ui/Card";
import Image from "next/image";
import { useEffect, useState } from "react";
import { PageTransition } from "@/app/components/PageTransition";
import { hapticTrigger } from "ios-haptics";
import { ArrowRightIcon } from "@heroicons/react/16/solid";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function SetupPage() {
  const [step, setStep] = useState("username"); // "password" | "CTA"
  const [isShowPassword, setIsShowPassword] = useState(false);
  const router = useRouter();
  const [name, setName] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const fullName = session?.user?.user_metadata?.full_name ?? "";

      setUser(session?.user);
      setName(fullName.split(" ")[0]);
    };
    getUser();
  }, []);

  const handleContinue = async () => {
    const { error } = await supabase
      .from("profiles")
      .update({
        name: name,
        has_completed_onboarding: true,
      })
      .eq("id", user.id);

    if (error) {
      toast.error("Something went wrong. Please try again.");
      return;
    }

    router.push("/ready");
  };

  return (
    <>
      <DesktopGuard />
      <Page className="lg:hidden overflow-hidden flex-col items-center px-4 gap-15 gradient-splash font-body!">
        <main className="flex flex-col items-center min-w-full h-svh justify-between">
          <motion.div
            key={"logo"}
            className="max-w-35 relative aspect-3/2 w-full flex items-start mx-auto "
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <Image
              priority
              src={"/onboarding/logo.svg"}
              fill
              alt="SplitPals"
              loading="eager"
            />
          </motion.div>

          <div className="flex-1 min-w-full flex flex-col items-center ">
            <PageTransition key={"username"}>
              <div className="max-w-85 relative aspect-5/3 w-full mt-15 mx-auto">
                <Image
                  src={"/corgis/corgi-laying-down.svg"}
                  alt="A corgi dog laying down"
                  fill
                  priority
                  loading="eager"
                />

                <div className="aspect-square w-full absolute -right-4 top-10">
                  <div className="flex flex-col items-start bg-white new-border absolute p-4 h-13 z-40 left-32 right-4 top-3.5 rounded-t-3xl rounded-br-3xl rounded-bl-sm">
                    <p className="absolute text-sm text-text-primary font-body font-semibold">
                      What should I call you?
                    </p>
                  </div>
                </div>
              </div>
              <Card className="min-w-75 mx-6 md:max-w-120 md:mx-auto">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="font-medium text-base text-text-primary">
                      Username
                    </label>
                    <input
                      type="text"
                      className="outline-none px-3 py-2 border rounded-lg placeholder:text-text-secondary text-base border-gray-200 focus:border-primary transition-all duration-200 ease-in-out"
                      placeholder="e.g. Corgi"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end w-full justify-end">
                    <button
                      ref={hapticTrigger}
                      className="gradient-button px-6 py-2 rounded-lg text-white font-medium text-sm"
                      onClick={handleContinue}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </Card>
            </PageTransition>
          </div>
        </main>
      </Page>
    </>
  );
}
