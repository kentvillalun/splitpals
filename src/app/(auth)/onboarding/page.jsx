"use client";

import { Page } from "@/app/components/layout/Page";
import { PageContent } from "@/app/components/layout/PageContent";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  return (
    <>
      <Page isGradient={true}>
        <div
          className={`flex-col justify-evenly min-h-svh w-full max-w-md p-4 pt-12 pb-10 overflow-x-hidden ${step === 1 ? "flex" : "hidden"}`}
        >
          <div className="flex flex-col items-center w-full max-w-md p-2 justify-center text-[#1A1A1A]">
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
          <div className="">
            <div className="grid grid-cols-7 h-0.75 max-w-30 items-center justify-center mx-auto gap-1">
              <div className="col-span-3 bg-[#F97316] h-0.75 rounded-2xl"></div>
              <div className="bg-[#E8E8E8] h-0.75 rounded-2xl col-span-2"></div>
              <div className="bg-[#E8E8E8] h-0.75 rounded-2xl col-span-2"></div>
            </div>
            <div className="flex justify-between p-6 text-[14px]">
              <button
                className="bg-[#F97316] min-w-full min-h-13.5 rounded-[30px] text-white font-medium text-base shadow-lg gradient-button"
                onClick={() => {
                  setStep(step + 1);
                }}
              >
                Next
              </button>
            </div>
            
          </div>
        </div>
      </Page>
    </>
  );
}
