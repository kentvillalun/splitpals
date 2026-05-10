"use client";

import { DesktopGuard } from "@/app/components/DesktopGuard";
import { Page } from "@/app/components/layout/Page";
import { Card } from "@/app/components/ui/Card";
import Image from "next/image";
import { useState } from "react";
import { PageTransition } from "@/app/components/PageTransition";
import { haptic } from "@/app/lib/haptic";
import { ArrowRightIcon } from "@heroicons/react/16/solid";


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
          <div className="flex flex-col items-center px-4 gap-15 min-w-full">
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
                    priority
                    loading="eager"
                  />

                  <div className="max-w-52 aspect-square w-full absolute -right-4 -top-5">
                    <Image
                      src={"/corgis/corgi-bubble.svg"}
                      alt="A corgi dog laying down"
                      fill
                      priority
                      loading="eager"
                    />
                    <p className="absolute text-sm top-22 right-7 text-text-primary">
                      What should I call you?
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
              ) : step === "password" ? (
                <PageTransition>
                  <div className="flex items-center justify-center min-w-full">
                    <h3 className="text-text-primary font-medium text-center max-w-62.5 ">
                      Almost there, <span className="font-semibold">Kent</span>!
                      Set your password.
                    </h3>
                  </div>
                  <Card className="min-w-75 mt-10">
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="font-medium text-base text-text-primary">
                          Password
                        </label>
                        <div className="outline-none px-3 py-2 border rounded-lg placeholder:text-text-secondary text-base border-text-secondary focus-within:border-primary transition-colors duration-150 ease-in-out flex flex-row items-center justify-between text-text-primary">
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
                            setStep("CTA");
                            haptic.medium();
                          }}
                        >
                          Continue
                        </button>
                      </div>
                    </div>
                  </Card>
                </PageTransition>
              ) : (
                <PageTransition>
                  <div className="flex flex-col items-center min-w-full justify-between gap-10 min-h-full">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex items-center justify-center min-w-full">
                        <h3 className="text-text-primary font-medium text-center max-w-62.5 text-xl">
                          Ready to split the bill,{" "}
                          <span className="font-semibold">Kent</span>?
                        </h3>
                      </div>

                      <div className="max-w-108 relative w-full aspect-square">
                        <Image
                          src={"/corgis/sparkling-corgi.svg"}
                          alt="App logo and a corgi dog"
                          fill
                          priority
                        />
                      </div>

                      <p className="text-text-primary">
                        Your friends are waiting!
                      </p>
                    </div>

                    <div className="flex justify-between py-6  text-[14px] w-full flex-col gap-2 items-center">
                      <button
                        className="bg-primary min-w-full min-h-13.5 rounded-2xl text-white font-medium text-base shadow-lg gradient-button"
                        onClick={() => {
                          setStep(step + 1);
                          haptic.light();
                        }}
                      >
                        Split Now
                      </button>
                      <button className="flex flex-row gap-1 text-text-primary items-center justify-center text-base">
                        <p className="">I want to explore first</p>
                        <ArrowRightIcon className="w-3"/>
                      </button>
                    </div>
                  </div>
                </PageTransition>
              )}
            </div>
          </div>
        </PageTransition>
      </Page>
    </>
  );
}
