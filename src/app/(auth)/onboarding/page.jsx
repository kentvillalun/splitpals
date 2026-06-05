"use client";

import { DesktopGuard } from "@/app/components/DesktopGuard";
import { Page } from "@/app/components/layout/Page";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

import { PageTransition } from "@/app/components/PageTransition";
import Image from "next/image";
import { Card } from "@/app/components/ui/Card";

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const pips = [0, 1, 2]; // 3 steps
  const steps = [
    {
      name: "Track orders",
      desc: "Add what everyone ordered — one item at a time.",
    },
    {
      name: "Split the bill",
      desc: "See each person's share calculated instantly.",
    },
    { name: "Share receipt", desc: "Send everyone exactly what they owe." },
  ];

  return (
    <>
      <DesktopGuard />
      <Page className="gradient-onboarding">
        <PageTransition
          key={"page"}
          className="overflow-hidden w-full px-4 pt-4 "
        >
          <div className="max-w-xl mx-auto w-full flex flex-col gap-3">
            <div className="flex flex-row items-center justify-between">
              <div className="w-full max-w-20 aspect-3/1 relative">
                <Image
                  src={"/onboarding/logo.svg"}
                  fill
                  priority
                  alt="Splitpals"
                />
              </div>

              <button className="text-sm text-text-tertiary">Skip</button>
            </div>

            <div className="flex gap-2">
              {pips.map((pip) => {
                const isActive = pip === currentStep;
                const isCompleted = pip < currentStep;

                return (
                  <motion.div
                    key={pip}
                    animate={{
                      flexGrow: isActive ? 3 : isCompleted ? 2 : 1,
                      opacity: isActive ? 0.65 : isCompleted ? 0.3 : 0.1,
                      backgroundColor: "#F97316",
                    }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    style={{ height: 2.5, borderRadius: 3 }}
                  />
                );
              })}
            </div>

            <div className="flex flex-col items-start gap-1.5">
              {steps.map((step, i) => (
                <div key={i}>
                  <h3
                    className={`font-bold transition-all duration-500
                      ${
                        currentStep === i
                          ? "text-2xl text-text-primary"
                          : currentStep > i
                            ? "text-sm text-text-placeholder"
                            : "text-sm text-text-ghost"
                      }`}
                  >
                    {step.name}
                  </h3>

                  <AnimatePresence>
                    {currentStep === i && (
                      <motion.p
                        key={`desc-${i}`}
                        initial={{ opacity: 0, y: 6, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -6, height: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="text-sm text-dark/45 overflow-hidden"
                      >
                        {step.desc}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>


            <Card className="p-3.5">
              <div className="flex flex-row items-center justify-between">
                <p className="font-medium text-sm">🍔 McDonald's · <span className="border-b border-dashed text-primary font-bold">You</span>
                </p>
                <div className="text-xs bg-primary/10 px-3 font-bold text-primary py-0.5 rounded-xl">DEMO</div>
              </div>
            </Card>
          </div>
        </PageTransition>
      </Page>
    </>
  );
}
