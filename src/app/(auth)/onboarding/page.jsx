"use client";

import { Page } from "@/app/components/layout/Page";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { DesktopGuard } from "@/app/components/DesktopGuard";
import { motion } from "framer-motion";
import { haptic } from "@/app/lib/haptic";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);

  return (
    <>
      <DesktopGuard />
      <Page
        isGradient={true}
        className="lg:hidden overflow-hidden flex-col max-h-screen justify-center" 
      >
        
        <div className="overflow-hidden w-full ">
          <motion.div
            className="flex"
            animate={{ x: `${-(step - 1) * 100}vw` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Onboarding 1 */}
            <div
              className={`flex-col justify-evenly   min-h-full min-w-screen p-4 pt-12 pb-0 overflow-x-hidden flex`}
            >
              <div className="flex flex-col items-center min-w-full max-w-md p-2 justify-center text-text-primary mb-6">
                <div className="max-w-108 relative w-full aspect-square">
                  <Image
                    src={"/onboarding/onboarding-1.svg"}
                    alt="App logo and a corgi dog"
                    fill
                    priority
                  />
                </div>
                <h3 className="text-[22px] max-w-88.75 text-center mb-4 font-medium">
                  Splitting bills made easy
                </h3>
                <p className="text-[14px] text-center w-70">
                  Track who owes what, settle up without the awkward math.
                </p>
              </div>
            
              <div className="mt-10">
                <div className="grid grid-cols-7 h-1 max-w-30 items-center justify-center mx-auto gap-1">
                  <div className="col-span-3 bg-primary h-0.75 rounded-2xl"></div>
                  <div className="bg-[#E8E8E8] h-0.75 rounded-2xl col-span-2"></div>
                  <div className="bg-[#E8E8E8] h-0.75 rounded-2xl col-span-2"></div>
                </div>
              </div>

              
            </div>

            {/* Onbaording 2 */}
            <div
              className={`flex-col justify-evenly min-w-screen p-4 pt-12 pb-0 overflow-x-hidden flex`}
            >
              <div className="flex flex-col items-center min-w-full max-w-md p-2 justify-center text-text-primary mb-6">
                <div className="max-w-108 relative w-full aspect-square">
                  <Image
                    src={"/onboarding/onboarding-2.svg"}
                    alt="App logo and a corgi dog"
                    fill
                    priority
                  />
                </div>
                <h3 className="text-[22px] max-w-88.75 text-center mb-4 font-medium">
                  We've all been there
                </h3>
                <p className="text-[14px] text-center w-70">
                  One friend pays for everyone, and tracking who owes what
                  becomes a mess.
                </p>
              </div>
              <div className="mt-10">
                <div className="grid grid-cols-7 h-0.75 max-w-30 items-center justify-center mx-auto gap-1">
                  <div className="bg-[#E8E8E8] h-0.75 rounded-2xl col-span-2"></div>
                  <div className="col-span-3 bg-primary h-0.75 rounded-2xl"></div>
                  <div className="bg-[#E8E8E8] h-0.75 rounded-2xl col-span-2"></div>
                </div>
              </div>
            </div>
          
            {/* Onbaording 3 */}
            <div
              className={`flex-col justify-evenly  min-w-screen p-4 pt-12 pb-0 overflow-x-hidden flex`}
            >
              <div className="flex flex-col items-center min-w-full max-w-md p-2 justify-center text-text-primary mb-6">
                <div className="max-w-108 relative w-full aspect-square">
                  <Image
                    src={"/onboarding/onboarding-3.svg"}
                    alt="App logo and a corgi dog"
                    fill
                    priority
                  />
                </div>
                <h3 className="text-[22px] max-w-88.75 text-center mb-4 font-medium">
                  SplitPals has you covered
                </h3>
                <p className="text-[14px] text-center w-70">
                  Track orders, split the bills, and share the summary - no more
                  guessing.
                </p>
              </div>
              <div className="mt-10">
                <div className="grid grid-cols-7 h-0.75 max-w-30 items-center justify-center mx-auto gap-1">
                  <div className="bg-[#E8E8E8] h-0.75 rounded-2xl col-span-2"></div>
                  <div className="bg-[#E8E8E8] h-0.75 rounded-2xl col-span-2"></div>
                  <div className="col-span-3 bg-primary h-0.75 rounded-2xl"></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        <div className="flex justify-between py-6 px-10 text-[14px] ">
          {step !== 3 ? (
            <button
              className="bg-primary min-w-full min-h-13.5 rounded-2xl text-white font-medium text-base shadow-lg gradient-button"
              onClick={() => {
                setStep(step + 1);
                haptic.light();
              }}
            >
              Next
            </button>
          ) : (
            <Link
              className="bg-primary min-w-full min-h-13.5 rounded-2xl text-white font-medium text-base shadow-lg gradient-button flex items-center justify-center"
              href={"/signup"}
              onClick={() => {
                haptic.light();
              }}
            >
              Get Started
            </Link>
          )}
        </div>
      </Page>
    </>
  );
}
