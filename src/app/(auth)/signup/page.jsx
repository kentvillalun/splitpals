"use client";

import { DesktopGuard } from "@/app/components/DesktopGuard";
import { Page } from "@/app/components/layout/Page";
import { PageTransition } from "@/app/components/PageTransition";
import { Card } from "@/app/components/ui/Card";
import { supabase } from "@/app/lib/supabase";
import Image from "next/image";
import { FaGoogle } from "react-icons/fa";
import { haptic } from "@/app/lib/haptic";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  return (
    <>
      <DesktopGuard />
      <Page
        isGradient={true}
        className="lg:hidden overflow-hidden flex-col items-center px-4 gap-15"
      >
        <main className="flex flex-col items-center min-w-full h-svh justify-between">
          <div className="max-w-40 relative aspect-3/2 w-full flex items-start mx-auto">
            <Image
              priority
              src={"/onboarding/logo.svg"}
              fill
              alt="SplitPals"
              loading="eager"
            />
          </div>

          <div className="flex-1 min-w-full flex flex-col items-center">
            <PageTransition key={"signup"}>
              <div className="flex flex-col w-full h-full justify-between gap-4">
                <div className="mt-10 flex flex-col gap-2">
                  <div className="max-w-58 relative aspect-square w-full mx-auto">
                    <Image
                      src={"/corgis/waggy-corgi.png"}
                      alt="A corgi dog wagging its tails"
                      fill
                      priority
                      loading="eager"
                    />
                  </div>
                  <div className="flex flex-col items-center">
                    <h3 className="text-[22px] max-w-88.75 text-center mb-4 font-medium text-text-primary">
                      Split bills, not friendships.
                    </h3>
                    <p className="text-[14px] text-center w-70 text-text-primary">
                      One pays, everyone tracks. No more awkward "how much do I
                      owe?" moments.
                    </p>
                  </div>
                </div>

                <Card className="shadow-none! h-70 rounded-t-4xl rounded-b-none flex flex-col px-7.5 py-7.5 gap-2 ">
                  <button
                    className="bg-primary min-w-full min-h-13.5 rounded-2xl text-white font-medium text-base shadow-lg gradient-button px-auto flex flex-row items-center justify-center gap-2"
                    onClick={async () => {
                      haptic.medium();

                      const { error } = await supabase.auth.signInWithOAuth({
                        provider: "google",
                        options: {
                          redirectTo: `${window.location.origin}/auth/callback`,
                        },
                      });

                      if (error) {
                        console.log(error);
                        toast.error("Something went wrong. Please try again.");
                        router.push("/signup");
                      }
                    }}
                  >
                    <FaGoogle />
                    <p className="font-semibold">Connect with Google</p>
                  </button>
                  <p className="text-text-secondary text-sm text-center">
                    No account needed - just sign in.
                  </p>
                </Card>
              </div>
            </PageTransition>
          </div>
        </main>
      </Page>
    </>
  );
}
