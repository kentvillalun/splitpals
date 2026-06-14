"use client";

import { DesktopGuard } from "@/app/components/DesktopGuard";
import { Page } from "@/app/components/layout/Page";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { PageTransition } from "@/app/components/PageTransition";
import Image from "next/image";
import { Card } from "@/app/components/ui/Card";
import { ArrowRightIcon, PlusIcon, ShareIcon } from "@heroicons/react/16/solid";
import CountUp from "react-countup";
import { createPortal } from "react-dom";
import { FaGoogle } from "react-icons/fa";
import { haptic } from "@/app/lib/haptic";
import { supabase } from "@/app/lib/supabase";
import { toast } from "sonner";

const demoItems = [
  { id: 1, name: "McSpicy Burger", price: 169 },
  { id: 2, name: "Large Fries", price: 89 },
  { id: 3, name: "Iced Coffee", price: 65 },
];

const demoPersons = [
  { id: 1, name: "You", items: "McSpicy + Fries + Coffee", total: 323 },
  { id: 2, name: "Marco", items: "Big Mac + Large Fries", total: 290 },
];

const receiptElements = [
  { id: "header", delay: 300 },
  { id: "subtitle", delay: 500 },
  { id: "you-section", delay: 700 },
  { id: "you-item1", delay: 900 },
  { id: "you-item2", delay: 1050 },
  { id: "you-item3", delay: 1200 },
  { id: "you-total", delay: 1380 },
  { id: "you-share", delay: 1550 },
  { id: "marco-section", delay: 1750 },
  { id: "marco-item1", delay: 1950 },
  { id: "marco-item2", delay: 2100 },
  { id: "marco-total", delay: 2280 },
  { id: "marco-share", delay: 2450 },
  { id: "grand-total", delay: 2650 },
  { id: "stamp", delay: 2850 },
];

const sheetCopy = {
  "share-you": {
    title: "Sign in to send You their share",
    sub: "Your friends are waiting to know what they owe.",
  },
  "share-marco": {
    title: "Sign in to send Marco their share",
    sub: "Your friends are waiting to know what they owe.",
  },
  next: {
    title: "Excited to try this with friends?",
    sub: "Sign in and split your first bill in minutes.",
  },
  skip: {
    title: "You're so close!",
    sub: "Sign in to start splitting bills with your friends.",
  },
};
export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const pips = [0, 1, 2]; // 3 steps
  const [revealCount, setRevealCount] = useState(0);
  const [revealedPersons, setRevealedPersons] = useState(0);
  const [printedCount, setPrintedCount] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetTrigger, setSheetTrigger] = useState(null);
  const [mounted, setMounted] = useState(false);
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

  const allRevealed = revealCount === demoItems.length;
  const totalSum = demoItems.slice(0, revealCount).reduce((sum, current) => {
    return sum + current.price;
  }, 0);
  const remaining = demoItems.length - revealCount;

  useEffect(() => {
    if (currentStep !== 1) return;

    demoPersons.forEach((_, i) => {
      setTimeout(
        () => {
          setRevealedPersons(i + 1);
        },
        i * 150 + 300,
      );
    });
  }, [currentStep]);

  const grandTotal = demoPersons
    .slice(0, revealedPersons)
    .reduce((sum, p) => sum + p.total, 0);

  const allPersonsRevealed = revealedPersons === demoPersons.length;

  useEffect(() => {
    if (currentStep !== 2) return;

    receiptElements.forEach((_, i) => {
      setTimeout(() => {
        setPrintedCount(i + 1);
      }, receiptElements[i].delay);
    });
  }, [currentStep]);

  function openSheet(trigger) {
    setSheetTrigger(trigger);
    setSheetOpen(true);
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <DesktopGuard />
      <Page className="gradient-onboarding">
        <PageTransition
          key={"page"}
          className="overflow-hidden w-full px-4 pt-6 mobile:pb-15 xs:pb-10"
        >
          <div className="max-w-xl mx-auto w-full flex flex-col gap-3 h-full justify-between">
            <div className="flex flex-col  justify-between gap-3">
              <div className="flex flex-row items-center justify-between">
                <div className="w-full max-w-25 aspect-3/1 relative">
                <Image
                  src={"/onboarding/logo.svg"}
                  fill
                  priority
                  alt="Splitpals"
                />
              </div>
                {/* <p className={`font-display text-primary text-xl font-bold`}>
                  Split<span className="text-text-primary">Pals</span>
                </p> */}

                {currentStep < 2 && (
                  <button
                    className="text-sm text-text-tertiary"
                    onClick={() => {
                      haptic.light();
                      setCurrentStep(2);
                      setTimeout(() => openSheet("skip"), 400);
                    }}
                  >
                    Skip
                  </button>
                )}
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
            </div>

            <div
              className={`flex flex-col justify-between mobile:gap-6  ${currentStep === 2 ? "xs:gap-2" : "xs:gap-3"}`}
            >
              <div
                className={`flex flex-col justify-between mobile:gap-3 ${currentStep === 2 ? "xs:gap-1" : "xs:gap-2"}`}
              >
                <div className="flex flex-col items-start">
                  {steps.map((step, i) => (
                    <div key={i}>
                      <h3
                        className={`font-bold transition-all duration-500 font-display
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

                      <AnimatePresence mode="wait">
                        {currentStep === i && (
                          <motion.p
                            key={`desc-${i}`}
                            initial={{ opacity: 0, y: 6, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: "auto" }}
                            exit={{ opacity: 0, y: -6, height: 0 }}
                            transition={{
                              duration: 0.3,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                            className="text-sm text-text-primary overflow-hidden pb-1"
                          >
                            {step.desc}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {currentStep === 0 && (
                    <motion.div
                      key={"step-1-card"}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.4,
                        ease: "easeOut",
                        delay: 0.1,
                      }}
                      exit={{ opacity: 0, y: 14 }}
                    >
                      <Card className="p-4 flex flex-col gap-4 min-h-82.5 mobile:h-100">
                        <div className="flex flex-row items-center justify-between">
                          <p className="font-semibold text-sm">
                            🍔 McDonald's ·{" "}
                            <span className="border-b border-dashed text-primary font-bold">
                              You
                            </span>
                          </p>
                          <div className="text-xs bg-primary/10 px-3 font-bold text-primary py-0.5 rounded-xl">
                            DEMO
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5 flex-1">
                          {demoItems.slice(0, revealCount).map((item) => (
                            <motion.div
                              className=" flex flex-row items-center justify-between text-sm py-2.5 px-3 rounded-xl new-border"
                              key={item.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, ease: "easeOut" }}
                            >
                              <div className="flex flex-row items-center gap-2">
                                <div className="h-2 w-2 bg-orange rounded-full"></div>
                                <p className="font-medium">{item.name}</p>
                              </div>
                              <span className="font-display font-bold text-orange ">
                                &#8369;{item.price.toFixed(2)}
                              </span>
                            </motion.div>
                          ))}
                        </div>

                        <div className="flex flex-col gap-3">
                          <button
                            className="flex flex-row items-center gap-2 text-orange font-semibold text-sm border-dashed w-full border rounded-xl py-2.5 px-3 bg-orange/10 transition-all active:scale-95 duration-200 ease-in-out hover:cursor-pointer hover:bg-orange/20 disabled:opacity-35 disabled:pointer-events-none"
                            disabled={allRevealed === true}
                            onClick={() => {
                              haptic.light();
                              setRevealCount((prev) => prev + 1);
                            }}
                          >
                            <div className="bg-orange rounded-full w-5 h-5 flex items-center justify-center">
                              <PlusIcon className="w-4 text-white" />
                            </div>
                            <p className="">
                              {allRevealed ? "All items added ✓" : "Add item"}
                            </p>
                          </button>

                          <div className="flex flex-row items-center justify-between pt-2 border-t border-dashed border-gray-200">
                            <p className="uppercase text-xs font-semibold text-text-secondary">
                              Your total
                            </p>
                            <span className="font-display font-black text-orange">
                              <CountUp
                                end={totalSum}
                                duration={0.4}
                                decimals={2}
                                prefix="&#8369;"
                                className="font-display font-black text-orange"
                              />
                            </span>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )}

                  {currentStep === 1 && (
                    <motion.div
                      key={"step-2-card"}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.4,
                        ease: "easeOut",
                        delay: 0.1,
                      }}
                      exit={{ opacity: 0, y: 14 }}
                    >
                      <Card className="p-4 flex flex-col gap-4 min-h-82.5 mobile:h-100">
                        <div className="flex flex-row items-center justify-between">
                          <p className="font-semibold text-sm">
                            🍔 McDonald's · 3 people
                          </p>
                          <div className="text-xs bg-primary/10 px-3 font-bold text-primary py-0.5 rounded-xl">
                            DEMO
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5 flex-1">
                          {demoPersons.map((person, i) => (
                            <motion.div
                              className=" flex flex-row items-center justify-between text-sm py-2.5 px-3 rounded-xl new-border"
                              key={person.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                duration: 0.3,
                                ease: "easeOut",
                                delay: 0.3 + i * 0.15,
                              }}
                            >
                              <div className="flex flex-col items-start">
                                <p className="font-bold">{person.name}</p>
                                <p className="text-text-secondary text-xs">
                                  {[person.items]}
                                </p>
                              </div>
                              <span className="font-display font-black text-base text-orange ">
                                &#8369;{person.total.toFixed(2)}
                              </span>
                            </motion.div>
                          ))}
                        </div>

                        <div className="flex flex-col gap-3">
                          {revealedPersons > 0 && (
                            <div className="flex flex-row items-center justify-between pt-2 border-t border-dashed border-gray-200">
                              <p className="uppercase text-xs font-semibold text-text-secondary">
                                Grand total
                              </p>
                              <span className="font-display font-black text-orange text-base">
                                <CountUp
                                  end={grandTotal}
                                  duration={0.6}
                                  decimals={2}
                                  prefix="&#8369;"
                                  className="font-display font-black text-orange"
                                />
                              </span>
                            </div>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  )}

                  {currentStep === 2 && (
                    <motion.div
                      key={"step-3-card"}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.4,
                        ease: "easeOut",
                        delay: 0.1,
                      }}
                      exit={{ opacity: 0, y: 14 }}
                    >
                      <Card className="p-4 flex flex-col gap-1 min-h-82.5 mobile:h-100 font-receipt text-xs">
                        <AnimatePresence>
                          {printedCount > 0 && (
                            <motion.div
                              key="header-section"
                              className="flex flex-col items-center border-b border-dashed border-gray-200 pb-1"
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2, ease: "easeOut" }}
                            >
                              <p className="font-semibold text-orange uppercase tracking-[1.5] text-sm">
                                SplitPals
                              </p>
                              {printedCount > 1 && (
                                <motion.p
                                  key="subtitle"
                                  className="text-text-secondary"
                                  initial={{ opacity: 0, y: 4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{
                                    duration: 0.2,
                                    ease: "easeOut",
                                  }}
                                >
                                  Splitting bills made easy
                                </motion.p>
                              )}
                            </motion.div>
                          )}

                          {printedCount > 2 && (
                            <motion.div
                              key="you-section"
                              className="flex flex-col pb-2 gap-0.5 border-b border-dashed border-gray-200"
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2, ease: "easeOut" }}
                            >
                              <p className="text-center font-semibold text-sm">
                                You
                              </p>

                              {printedCount > 3 && (
                                <motion.div
                                  key="you-item1"
                                  className="flex flex-row items-center justify-between"
                                  initial={{ opacity: 0, y: 4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{
                                    duration: 0.2,
                                    ease: "easeOut",
                                  }}
                                >
                                  <p>McSpicy Burger</p>
                                  <p className="font-semibold">
                                    <span className="font-body">₱</span>169.00
                                  </p>
                                </motion.div>
                              )}

                              {printedCount > 4 && (
                                <motion.div
                                  key="you-item2"
                                  className="flex flex-row items-center justify-between"
                                  initial={{ opacity: 0, y: 4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{
                                    duration: 0.2,
                                    ease: "easeOut",
                                  }}
                                >
                                  <p>Large Fries</p>
                                  <p className="font-semibold">
                                    <span className="font-body">₱</span>89.00
                                  </p>
                                </motion.div>
                              )}

                              {printedCount > 5 && (
                                <motion.div
                                  key="you-item3"
                                  className="flex flex-row items-center justify-between"
                                  initial={{ opacity: 0, y: 4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{
                                    duration: 0.2,
                                    ease: "easeOut",
                                  }}
                                >
                                  <p>Iced Coffee</p>
                                  <p className="font-semibold">
                                    <span className="font-body">₱</span>65.00
                                  </p>
                                </motion.div>
                              )}

                              {printedCount > 6 && (
                                <motion.div
                                  key="you-total"
                                  className="flex flex-row items-center justify-between"
                                  initial={{ opacity: 0, y: 4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{
                                    duration: 0.2,
                                    ease: "easeOut",
                                  }}
                                >
                                  <p className="uppercase text-xs text-text-secondary">
                                    Your total
                                  </p>
                                  <p className="font-bold text-orange text-sm">
                                    <span className="font-body">₱</span>323.00
                                  </p>
                                </motion.div>
                              )}

                              {printedCount > 7 && (
                                <motion.button
                                  key="you-share"
                                  className="flex flex-row items-center justify-center gap-2 font-semibold text-orange py-1.5 border-orange/50 border rounded-lg hover:bg-orange/20 transition-all active:scale-95 duration-200 ease-in-out"
                                  initial={{ opacity: 0, y: 4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{
                                    duration: 0.2,
                                    ease: "easeOut",
                                  }}
                                  onClick={() => {
                                    haptic.medium();
                                    openSheet("share-you");
                                  }}
                                >
                                  <ShareIcon className="w-3 text-orange" />
                                  <p>Share to You</p>
                                </motion.button>
                              )}
                            </motion.div>
                          )}

                          {printedCount > 8 && (
                            <motion.div
                              key="marco-section"
                              className="flex flex-col gap-0.5 pb-2 border-b border-dashed border-gray-200"
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2, ease: "easeOut" }}
                            >
                              <p className="text-center font-semibold text-sm">
                                Marco
                              </p>

                              {printedCount > 9 && (
                                <motion.div
                                  key="marco-item1"
                                  className="flex flex-row items-center justify-between"
                                  initial={{ opacity: 0, y: 4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{
                                    duration: 0.2,
                                    ease: "easeOut",
                                  }}
                                >
                                  <p>Big Mac Meal</p>
                                  <p className="font-semibold">
                                    <span className="font-body">₱</span>215.00
                                  </p>
                                </motion.div>
                              )}

                              {printedCount > 10 && (
                                <motion.div
                                  key="marco-item2"
                                  className="flex flex-row items-center justify-between"
                                  initial={{ opacity: 0, y: 4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{
                                    duration: 0.2,
                                    ease: "easeOut",
                                  }}
                                >
                                  <p>Large Fries</p>
                                  <p className="font-semibold">
                                    <span className="font-body">₱</span>75.00
                                  </p>
                                </motion.div>
                              )}

                              {printedCount > 11 && (
                                <motion.div
                                  key="marco-total"
                                  className="flex flex-row items-center justify-between"
                                  initial={{ opacity: 0, y: 4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{
                                    duration: 0.2,
                                    ease: "easeOut",
                                  }}
                                >
                                  <p className="uppercase text-xs text-text-secondary">
                                    Marco's total
                                  </p>
                                  <p className="font-semibold text-orange text-sm">
                                    <span className="font-body">₱</span>290.00
                                  </p>
                                </motion.div>
                              )}

                              {printedCount > 12 && (
                                <motion.button
                                  key="marco-share"
                                  className="flex flex-row items-center justify-center gap-2 font-semibold text-orange py-1.5 border-orange/50 border rounded-lg hover:bg-orange/20 transition-all active:scale-95 duration-200 ease-in-out"
                                  initial={{ opacity: 0, y: 4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{
                                    duration: 0.2,
                                    ease: "easeOut",
                                  }}
                                  onClick={() => {
                                    haptic.medium();
                                    openSheet("share-marco");
                                  }}
                                >
                                  <ShareIcon className="w-3 text-orange" />
                                  <p>Share to Marco</p>
                                </motion.button>
                              )}
                            </motion.div>
                          )}

                          {printedCount > 13 && (
                            <motion.div
                              key="grand-total"
                              className="flex flex-col gap-1"
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2, ease: "easeOut" }}
                            >
                              <div className="flex flex-row items-center justify-between">
                                <p className="uppercase text-xs font-medium text-text-secondary">
                                  Grand total
                                </p>
                                <span className="font-body font-black text-sm text-orange">
                                  ₱
                                  <CountUp
                                    end={613}
                                    duration={0.6}
                                    decimals={2}
                                    className="font-receipt font-bold"
                                  />
                                </span>
                              </div>
                              {printedCount > 14 && (
                                <motion.p
                                  key="stamp"
                                  className="text-text-secondary text-center uppercase"
                                  initial={{ opacity: 0, y: 4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{
                                    duration: 0.2,
                                    ease: "easeOut",
                                  }}
                                >
                                  Printed by SplitPals
                                </motion.p>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <AnimatePresence mode="wait">
                {currentStep === 0 && (
                  <motion.div
                    key={"step-1-button"}
                    className="w-full flex flex-col gap-2 items-center"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut", delay: 0.15 }}
                    exit={{ opacity: 0, y: 14 }}
                  >
                    <button
                      className="flex flex-row items-center justify-between w-full gradient-button py-3.5 px-4 rounded-2xl disabled:opacity-25 disabled:pointer-events-none hover:cursor-pointer transition-all active:scale-95 duration-200 ease-in-out hover:opacity-90"
                      disabled={allRevealed === false}
                      onClick={() => {
                        haptic.medium();
                        setCurrentStep((prev) => prev + 1);
                      }}
                    >
                      <p className="font-bold text-sm text-white">
                        Next — Split the bill
                      </p>
                      <div className="p-2 bg-white/18 rounded-xl">
                        <ArrowRightIcon className="w-4 text-white" />
                      </div>
                    </button>

                    <p className="text-text-secondary text-xs">
                      {revealCount === 0
                        ? `Tap "+ Add item" to start 👆`
                        : remaining > 0
                          ? `${remaining} more item${remaining > 1 ? "s" : ""} to add`
                          : "Nice! Tap Next to see the split 👆"}
                    </p>
                  </motion.div>
                )}

                {currentStep === 1 && (
                  <motion.div
                    key={"step-2-button"}
                    className="w-full flex flex-col gap-2 items-center"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut", delay: 0.15 }}
                    exit={{ opacity: 0, y: 14 }}
                  >
                    <button
                      className="flex flex-row items-center justify-between w-full gradient-button py-3.5 px-4 rounded-2xl disabled:opacity-25 disabled:pointer-events-none hover:cursor-pointer transition-all active:scale-95 duration-200 ease-in-out hover:opacity-90"
                      onClick={() => {
                        haptic.medium();
                        setCurrentStep((prev) => prev + 1);
                      }}
                      disabled={allPersonsRevealed === false}
                    >
                      <p className="font-bold text-sm text-white">
                        Next — Share receipt
                      </p>
                      <div className="p-2 bg-white/18 rounded-xl">
                        <ArrowRightIcon className="w-4 text-white" />
                      </div>
                    </button>

                    <p className="text-text-secondary text-xs">
                      Everyone's share is ready 👆
                    </p>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key={"step-3-button"}
                    className="w-full flex flex-col gap-2 items-center"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut", delay: 0.15 }}
                    exit={{ opacity: 0, y: 14 }}
                  >
                    <button
                      className="flex flex-row items-center justify-between w-full gradient-button py-3.5 px-4 rounded-2xl disabled:opacity-25 disabled:pointer-events-none hover:cursor-pointer transition-all active:scale-95 duration-200 ease-in-out hover:opacity-90"
                      onClick={() => {
                        haptic.medium()
                        openSheet("next")}}
                    >
                      <p className="font-bold text-sm text-white">
                        Get started — It's free
                      </p>
                      <div className="p-2 bg-white/18 rounded-xl">
                        <ArrowRightIcon className="w-4 text-white" />
                      </div>
                    </button>

                    <p
                      className={`" " ${currentStep === 2 && "xs:hidden mobile:block text-text-secondary text-xs "}`}
                    >
                      Tap a Share button or get started 👆
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </PageTransition>
      </Page>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {sheetOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{
                    opacity: 0,
                    transition: { duration: 0.15, ease: "easeIn" },
                  }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="fixed inset-0 z-40 bg-black/40 font-body"
                />
                <motion.div
                  className="bg-white h-auto w-full flex flex-col items-center justify-between fixed bottom-0 rounded-t-4xl gap-6 pt-4 px-5  pb-17 z-50"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{
                    y: "100%",
                    transition: { duration: 0.25, ease: "easeIn" },
                  }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  drag="y"
                  dragConstraints={{ top: 0 }}
                  dragElastic={{ top: 0, bottom: 0.2 }}
                  onDragEnd={(_, info) => {
                    if (info.offset.y > 100) setSheetOpen(false);
                  }}
                >
                  <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-1" />
                  <div className="flex flex-col gap-1 items-center">
                    <p className="font-display text-xl font-bold">
                      {sheetCopy[sheetTrigger]?.title}
                    </p>
                    <p className="text-text-secondary text-sm">
                      {sheetCopy[sheetTrigger]?.sub}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 w-full items-center max-w-xl">
                    <button
                      className=" flex flex-row items-center justify-center w-full hover:cursor-pointer transition-all duration-200 ease-in-out hover:opacity-90 rounded-2xl py-4 gap-2 font-bold text-white font-body"
                      style={{
                        background:
                          "linear-gradient(to bottom, #2a2a2a, #1a1a1a)",
                        borderBottom: "1.5px solid #0a0a0a",
                      }}
                      onClick={async () => {
                        haptic.medium()

                        const {error} = await supabase.auth.signInWithOAuth({
                          provider: "google",
                          options: {
                            redirectTo: `${window.location.origin}/auth/callback`,
                            
                          }
                        })

                        
                     

                        if (error) {
                          haptic.error()
                          toast.error("Something went wrong. Please try again.")
                        }
                      }}
                    >
                      <div className="flex items-center justify-center bg-white rounded-full p-1">
                        <FaGoogle className="text-orange w-3 h-3" />
                      </div>
                      <p className="">Continue with Google</p>
                    </button>
                    <button
                      className="text-text-secondary font-body text-xs"
                      onClick={() => {
                        haptic.light()
                        setSheetOpen(false)}}
                    >
                      Maybe later
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
