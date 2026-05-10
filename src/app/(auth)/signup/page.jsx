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
        
          <main className="flex flex-col items-center min-w-full h-screen justify-between">
            <div className="max-w-40 relative aspect-3/2 w-full flex items-start mx-auto ">
              <Image
                priority
                src={"/onboarding/logo.svg"}
                fill
                alt="SplitPals"
              />
            </div>

            <div className="flex-1 min-w-full flex flex-col items-center ">
              {step === "username" ? (
                <>
                  <PageTransition key={"username"}>
                    <div className="max-w-85 relative aspect-5/3 w-full mt-15 mx-auto">
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
                    <Card className="min-w-75 mx-6 md:max-w-120 md:mx-auto">
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
                  </PageTransition>
                </>
              ) : step === "password" ? (
                <>
                  <PageTransition key={"password"}>
                    <div className="flex items-center justify-center min-w-full mt-15">
                      <h3 className="text-text-primary font-medium text-center max-w-62.5 text-lg">
                        Almost there,{" "}
                        <span className="font-semibold">Kent</span>! Set your
                        password.
                      </h3>
                    </div>
                    <Card className="min-w-75 mt-10 mx-7 md:max-w-120 md:mx-auto">
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
                </>
              ) : (
                step === "CTA" && (
                  <>
                    <PageTransition key={"cta"}>
                      <div className="flex flex-col items-center justify-evenly min-h-full">
                        <div className="flex flex-col gap-2 items-center">
                          <div className="flex items-center justify-center min-w-full mt-15">
                            <h3 className="text-text-primary font-medium text-center text-xl">
                              Ready to split the bill,{" "}
                              <span className="font-semibold">Kent</span>?
                            </h3>
                          </div>

                          <div className="max-w-70 relative w-full aspect-square">
                            <Image
                              src={"/corgis/sparkling-corgi.svg"}
                              alt="App logo and a corgi dog"
                              fill
                              priority
                            />
                          </div>

                          <div className="flex items-center justify-center min-w-full">
                            <p className="text-text-primary text-base">
                              Your friends are waiting!
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-between py-6 px-10 text-[14px] w-full flex-col gap-2 items-center">
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
                            <ArrowRightIcon className="w-3" />
                          </button>
                        </div>
                      </div>
                    </PageTransition>
                  </>
                )
              )}
            </div>
          </main>
        
      </Page>
    </>
  );
}
