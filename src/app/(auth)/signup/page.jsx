"use client";

import { DesktopGuard } from "@/app/components/DesktopGuard";
import { Page } from "@/app/components/layout/Page";
import { PageTransition } from "@/app/components/PageTransition";
import Image from "next/image";
import Link from "next/link";
import { FaGoogle } from "react-icons/fa";
import { hapticTrigger } from "ios-haptics";
import { supabase } from "@/app/lib/supabase";
import { toast } from "sonner";

export default function SignupPage() {
  return (
    <>
      <DesktopGuard />
      <Page className="gradient-onboarding">
        <PageTransition
          key={"page"}
          className="overflow-hidden w-full px-4 pt-6 pb-10"
        >
          <div className="max-w-xl mx-auto w-full flex flex-col h-full">
            <div className="w-full max-w-25 aspect-3/1 relative">
              <Image
                src={"/onboarding/logo.svg"}
                fill
                priority
                alt="Splitpals"
              />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center">
              <div className="flex flex-col items-center gap-2">
                <h1 className="font-display text-3xl font-bold text-text-primary">
                  Welcome back
                </h1>
                <p className="font-body text-text-secondary text-sm">
                  Sign in to pick up where you left off.
                </p>
              </div>

              <div className="max-w-58 w-full aspect-square relative">
                <Image
                  src={"/corgis/waggy-corgi.png"}
                  alt="A corgi dog wagging its tail"
                  fill
                  priority
                />
              </div>

              <div className="flex flex-col gap-3 w-full items-center max-w-xl">
                <button
                  ref={hapticTrigger}
                  className="flex flex-row items-center justify-center w-full gradient-button-black hover:cursor-pointer transition-all duration-200 ease-in-out hover:opacity-90 rounded-2xl py-4 gap-2 font-bold text-white font-body"
                  onClick={async () => {
                    const { error } = await supabase.auth.signInWithOAuth({
                      provider: "google",
                      options: {
                        redirectTo: `${window.location.origin}/auth/callback`,
                      },
                    });

                    if (error) {
                      toast.error(
                        "Something went wrong. Please try again.",
                      );
                    }
                  }}
                >
                  <div className="flex items-center justify-center bg-white rounded-full p-1">
                    <FaGoogle className="text-orange w-3 h-3" />
                  </div>
                  <p>Continue with Google</p>
                </button>

                <p className="text-text-secondary text-xs text-center font-body px-2">
                  By continuing, you agree to our{" "}
                  <Link
                    href="/terms"
                    target="_blank"
                    className="text-orange underline underline-offset-2"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="text-orange underline underline-offset-2"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </PageTransition>
      </Page>
    </>
  );
}
