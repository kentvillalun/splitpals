"use client";

import { useEffect, useState } from "react";
import { ActionCard } from "./ui/ActionCard";
import { ArrowUpOnSquareIcon } from "@heroicons/react/24/outline";
import { BottomSheet } from "./ui/BottomSheet";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
  {
    step: 1,
    name: "Tap share",
    description:
      "Look for the share icon in your browser. It's usually a square with an arrow, near the address bar or bottom toolbar.",
    icon: <ArrowUpOnSquareIcon className="w-5 stroke-primary stroke-2" />,
  },
  {
    step: 2,
    name: "Add to Home Screen",
    description:
      'Scroll through the options that pop up and tap "Add to Home Screen."',
    icon: null,
  },
  {
    step: 3,
    name: "Open anytime",
    description:
      "Find the SplitPals icon on your home screen. It opens instantly, just like a real app.",
    icon: null,
  },
];

export const InstallCard = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone;

    const dismissed = localStorage.getItem("splitpalsInstallDismissed");

    if (!isStandalone && dismissed === null) return setShowCard(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem("splitpalsInstallDismissed", "true");
    setShowCard(false);
  };

  return (
    <>
      <AnimatePresence>
        {showCard && (
          <motion.div
            key={"actionCard"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeIn" }}
          >
            <ActionCard
              icon={
                <ArrowUpOnSquareIcon className="w-5 stroke-white stroke-2" />
              }
              text={"Install SplitPals"}
              subtext={"Add to your home screen for quick access"}
              isDismissable={true}
              handleClick={() => setIsSheetOpen(true)}
              onDismiss={() => dismiss()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {isSheetOpen && (
        <BottomSheet setSheetOpen={setIsSheetOpen}>
          <div className="font-body flex flex-col items-start w-full gap-4">
            <h1 className="text-text-primary text-base font-semibold">
              Install SplitPals
            </h1>
            <div className="flex flex-col gap-2">
              {steps.map((step) => (
                <div
                  className="flex flex-row w-full gap-2 flex-start"
                  key={step.step}
                >
                  <div className="">
                    <div className="rounded-full bg-backgroud p-1 text-sm font-bold text-primary px-2.5 max-w-auto">
                      {step.step}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm text-text-primary font-medium">
                      {step.name}
                    </p>
                    <p className="text-text-secondary text-sm">
                      {step.description}
                    </p>
                    {step.icon && (
                      <div className="flex flex-row mt-1">
                        <div className="flex flex-row gap-1 bg-backgroud p-2 px-3 rounded-xl">
                          {step.icon}{" "}
                          <p className="text-sm text-primary font-medium">
                            Share
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-b border-gray-100 w-full" />
            <p className="text-text-secondary text-sm font-medium">
              That's it. No app store, no download.
            </p>
            <button
              className="flex flex-row items-center justify-center w-full hover:cursor-pointer transition-all duration-200 ease-in-out hover:opacity-90 rounded-2xl py-3.5 gap-2 text-white font-body gradient-button font-semibold"
              onClick={() => setIsSheetOpen(false)}
            >
              Got it
            </button>
          </div>
        </BottomSheet>
      )}
    </>
  );
};
