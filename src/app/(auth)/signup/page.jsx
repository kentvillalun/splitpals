"use client";

import { DesktopGuard } from "@/app/components/DesktopGuard";
import { Page } from "@/app/components/layout/Page";
import { Card } from "@/app/components/ui/Card";
import Image from "next/image";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "@/app/components/PageTransition";
import { haptic } from "@/app/lib/haptic";

export default function SignupPage() {
  const [step, setStep] = useState("username"); // "password" | "CTA"
  const [isShowPassword, setIsShowPassword] = useState(false);

  return (
    <>
      <DesktopGuard />
      <Page
        isGradient={true}
        className="lg:hidden overflow-hidden flex-col items-center px-4 gap-15"
      >
        <PageTransition>
          <div className="flex flex-col items-center px-4 gap-15">
            <div className="max-w-40 relative aspect-3/2 w-full flex items-start mx-auto ">
              <Image
                priority
                src={"/onboarding/logo.svg"}
                fill
                alt="SplitPals"
              />
            </div>

            <div className="w-full flex items-center justify-center flex-col gap-2">
              {step === "username" && (
                <div className="max-w-85 relative aspect-5/3 w-full">
                  <Image
                    src={"/corgis/corgi-laying-down.svg"}
                    alt="A corgi dog laying down"
                    fill
                  />

                  <div className="max-w-52 aspect-square w-full absolute -right-4 -top-5">
                    <Image
                      src={"/corgis/corgi-bubble.svg"}
                      alt="A corgi dog laying down"
                      fill
                    />
                    <p className="absolute text-sm top-22 right-7 text-text-primary">
                      What should I call you?
                    </p>
                  </div>

                  <div className="max-w-52 aspect-square w-full absolute -right-4 -top-5">
                    <Image
                      src={"/corgis/corgi-bubble.svg"}
                      alt="A corgi dog laying down"
                      fill
                    />
                    <p className="absolute text-xs top-21 right-5 max-w-40 text-text-primary">
                      Almost there, <span className="font-medium">Kent!</span>{" "}
                      Set your password.
                    </p>
                  </div>
                </div>
              )}

              {step === "username" ? (
                <Card className="min-w-75 ">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="font-medium text-base text-text-primary">
                        Your name
                      </label>
                      <input
                        type="text"
                        className="outline-none px-3 py-2 border rounded-lg placeholder:text-text-secondary text-base border-text-secondary focus:border-primary transition-colors duration-150 ease-in-out"
                        placeholder="e.g. Coco"
                      />
                    </div>
                    <div className="flex items-end w-full justify-end">
                      <button
                        className="gradient-button px-6 py-2 rounded-lg text-white font-medium"
                        onClick={() => {
                          setStep("password");
                          haptic.medium();
                        }}
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                </Card>
              ) : (
                <PageTransition>
                  <Card className="min-w-75 mt-20">
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="font-medium text-base text-text-primary">
                          Password
                        </label>
                        <div className="outline-none px-3 py-2 border rounded-lg placeholder:text-text-secondary text-base border-text-secondary focus-within:border-primary transition-colors duration-150 ease-in-out group">
                          <input
                            type={isShowPassword ? "text" : "password"}
                            className="outline-none"
                            placeholder="Input password"
                          />
                          <button
                            className="text-text-secondary font-medium"
                            onClick={() => setIsShowPassword((prev) => !prev)}
                          >
                            Show
                          </button>
                        </div>
                      </div>
                      <div className="flex items-end w-full justify-end">
                        <button
                          className="gradient-button px-6 py-2 rounded-lg text-white font-medium"
                          onClick={() => {
                            setStep("password");
                            haptic.medium();
                          }}
                        >
                          Continue
                        </button>
                      </div>
                    </div>
                  </Card>
                </PageTransition>
              )}
            </div>
          </div>
        </PageTransition>
      </Page>
    </>
  );
}
