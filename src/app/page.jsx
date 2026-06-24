"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingNav } from "./components/navigation/FloatingNav";
import { ImageConfigContext } from "next/dist/shared/lib/image-config-context.shared-runtime";

// ── Shared scroll-reveal variants ──
const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
};

const staggerContainer = {
  initial: {},
  whileInView: {},
  viewport: { once: true, margin: "-80px" },
};

function stagger(i, base = 0.08) {
  return {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: { duration: 0.5, ease: "easeOut", delay: i * base },
  };
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 80);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [copied, setCopied] = useState(false);

  function handleCopyGcash() {
    navigator.clipboard.writeText("09943304495"); // replace with your real GCash number
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const [gcashOpen, setGcashOpen] = useState(false);

  const [activeStep, setActiveStep] = useState(0);

  const howSteps = [
    {
      num: 1,
      shortTitle: "Track",
      title: "Track orders",
      desc: "Add what everyone ordered, one item at a time, per person.",
      mockup: (
        <div className="bg-white rounded-2xl p-3 shadow-[0_4px_16px_rgba(0,0,0,0.08)] w-full">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-semibold text-dark">
              🍔 McDonald's · You
            </p>
            <span className="text-[7px] font-bold bg-orange-tint text-orange px-1.5 py-0.5 rounded-full">
              DEMO
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center bg-dark/2 rounded-lg px-2 py-1.5">
              <span className="text-[9px] text-dark">McSpicy Burger</span>
              <span className="text-[9px] font-bold text-orange">₱169</span>
            </div>
            <div className="flex justify-between items-center bg-dark/2 rounded-lg px-2 py-1.5">
              <span className="text-[9px] text-dark">Large Fries</span>
              <span className="text-[9px] font-bold text-orange">₱89</span>
            </div>
          </div>
          <button className="w-full mt-2 border border-dashed border-orange/40 rounded-lg py-1.5 text-[9px] font-bold text-orange bg-orange-tint/50">
            + Add item
          </button>
        </div>
      ),
    },
    {
      num: 2,
      shortTitle: "Split",
      title: "Split the bill",
      desc: "SplitPals calculates everyone's exact share, instantly.",
      mockup: (
        <div className="bg-white rounded-2xl p-3 shadow-[0_4px_16px_rgba(0,0,0,0.08)] w-full flex flex-col gap-1.5">
          <div className="flex items-center justify-between bg-dark/2 rounded-lg px-2.5 py-2">
            <div className="text-left">
              <p className="text-[9px] font-bold text-dark">You</p>
              <p className="text-[8px] text-dark/45">McSpicy + Fries</p>
            </div>
            <p className="text-[10px] font-extrabold text-orange">₱258</p>
          </div>
          <div className="flex items-center justify-between bg-dark/2 rounded-lg px-2.5 py-2">
            <div className="text-left">
              <p className="text-[9px] font-bold text-dark">Marco</p>
              <p className="text-[8px] text-dark/45">Big Mac Meal</p>
            </div>
            <p className="text-[10px] font-extrabold text-orange">₱215</p>
          </div>
          <div className="flex justify-between items-center pt-1.5 border-t border-dashed border-dark/10">
            <p className="text-[8px] font-bold text-dark/40 uppercase">
              Grand total
            </p>
            <p className="text-[11px] font-extrabold text-dark">₱473</p>
          </div>
        </div>
      ),
    },
    {
      num: 3,
      shortTitle: "Share",
      title: "Share the receipt",
      desc: "Send each friend their share, or the whole receipt to the group chat.",
      mockup: (
        <div className="bg-white rounded-2xl p-3 shadow-[0_4px_16px_rgba(0,0,0,0.08)] w-full font-receipt">
          <div className="text-center mb-1.5 pb-1.5 border-b border-dashed border-dark/15">
            <p className="text-[9px] font-bold text-orange uppercase tracking-[2px]">
              SplitPals
            </p>
          </div>
          <p className="text-center text-[9px] font-bold mb-1">Marco</p>
          <div className="flex justify-between text-[8px] mb-0.5">
            <span>Big Mac Meal</span>
            <span className="font-bold">₱215.00</span>
          </div>
          <div className="flex justify-between items-center pt-1">
            <span className="text-[7px] text-dark/45 uppercase">Total</span>
            <span className="text-[10px] font-bold text-orange">₱215.00</span>
          </div>
          <button className="w-full mt-2 border border-orange/40 rounded-lg py-1.5 text-[8px] font-bold text-orange">
            Share to Marco
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="font-body min-h-screen bg-orange-pale overflow-x-hidden">
      <FloatingNav
        scrolled={scrolled}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />

      <div className="h-20" />

      <section className="relative px-6 md:px-8 pt-10 pb-24 md:pt-16 md:pb-32">
        <div
          className="absolute -top-45 left-1/2 -translate-x-1/2 w-275 h-175 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(251,146,60,0.32) 0%, rgba(253,186,116,0.16) 45%, transparent 70%)",
          }}
        />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl md:text-6xl font-extrabold leading-[1.08] tracking-tight text-dark mb-4"
          >
            Your friendly way to{" "}
            <span className="text-orange">split the bill.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24 }}
            className="text-base md:text-lg text-dark/55 max-w-lg mx-auto mb-9 leading-relaxed"
          >
            Track who ordered what, split it fairly, and send everyone their
            share in just a few taps. Built for circle of friends who are always
            out and about. No more 'sino may utang sa akin?'.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col items-center gap-3"
          >
            <Link
              href="/launch"
              className="gradient-button text-white font-bold text-base px-8 py-4 rounded-2xl shadow-[0_10px_28px_rgba(249,115,22,0.35)] inline-flex items-center gap-2 transition-transform hover:-translate-y-0.5 active:scale-95"
            >
              Try SplitPals free
            </Link>
            <p className="text-xs font-semibold text-dark/40">
              No install. Just open it and look around.
            </p>
          </motion.div>
        </div>

        {/* Phone mockup + corgi introduction */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative max-w-xl mx-auto mt-16 md:mt-20"
        >
          <motion.div
            key={"ui-mockup"}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative w-full max-w-300 aspect-10/12"
          >
            <Image src={"/marketing/hero.png"} priority fill alt="ui mockup" />
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1, ease: "backOut" }}
              className="absolute bottom-34 right-18 z-40 md:bottom-49 md:right-25 bg-white px-3.5 py-2 rounded-2xl rounded-bl-sm shadow-[0_8px_24px_rgba(0,0,0,0.1)]"
            >
              <p className="text-xs font-bold text-dark max-w-22 md:max-w-40">
                Hi! I'm your <span className="text-orange">splitting pal</span>{" "}
                🐾
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      <section className="px-6 md:px-8 py-20 md:py-28">
        <div
          className="max-w-5xl mx-auto rounded-[40px] p-6 md:p-10 relative overflow-hidden"
          style={{ background: "linear-gradient(160deg, #F97316, #EA6C10)" }}
        >
          <motion.div {...fadeUp} className="text-center mb-12 relative z-10">
            <p className="text-white/70 font-extrabold text-xs uppercase tracking-[0.15em] mb-3">
              Why SplitPals
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-4">
              Built different, on purpose.
            </h2>
            <p className="text-white/80 text-base md:text-lg max-w-md mx-auto leading-relaxed">
              No app store, no clutter, no awkward "pa-utang muna" moments. Just
              a clean way to settle the bill.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
            {/* Large cell — mockup on top, description below, no heading */}
            <motion.div
              {...stagger(0)}
              className="bg-white rounded-3xl p-7 md:p-8 shadow-[0_12px_32px_rgba(0,0,0,0.15)] hover:-translate-y-1.5 transition-all duration-300 md:row-span-2 flex flex-col"
            >
              {/* Phone mockup, cropped/faded at the midpoint */}
              <div className="relative aspect-square -translate-x-6  transform rotate-5 w-full">
                <Image
                  src={"/marketing/detailpage.png"}
                  fill
                  priority
                  alt="ui mock up"
                />
              </div>

              <p className="font-display text-4xl font-extrabold text-orange mb-3 leading-none text-start">
                Feels real.
              </p>
              <h3 className="font-display text-lg font-bold text-dark mb-2 text-start">
                A receipt, not a screenshot.
              </h3>
              <p className="text-sm text-dark/55 leading-relaxed text-start max-w-xs">
                Every split prints out like an actual thermal receipt —
                itemized, clear, and easy to screenshot to the group chat.
              </p>
            </motion.div>

            {/* Small cell — No download needed */}
            <motion.div
              {...stagger(1)}
              className="bg-white rounded-3xl p-7 shadow-[0_12px_32px_rgba(0,0,0,0.15)] hover:-translate-y-1.5 transition-all duration-300"
            >
              <p className="font-display text-4xl font-extrabold text-orange mb-3 leading-none">
                No install.
              </p>
              <h3 className="font-display text-lg font-bold text-dark mb-2">
                Just open it.
              </h3>
              <p className="text-sm text-dark/55 leading-relaxed">
                SplitPals runs straight from your browser. Add it to your home
                screen if you like, but it's never required.
              </p>
            </motion.div>

            {/* Small cell — Made for Pinoy friend groups */}
            <motion.div
              {...stagger(2)}
              className="bg-white rounded-3xl p-7 shadow-[0_12px_32px_rgba(0,0,0,0.15)] hover:-translate-y-1.5 transition-all duration-300"
            >
              <p className="font-display text-4xl font-extrabold text-orange mb-3 leading-none">
                Made dito.
              </p>
              <h3 className="font-display text-lg font-bold text-dark mb-2">
                For barkadas, by a Pinoy.
              </h3>
              <p className="text-sm text-dark/55 leading-relaxed">
                Peso amounts, Taglish-friendly, built around how friend groups
                here actually split the bill.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="how" className="bg-white px-6 md:px-8 py-20 md:py-28">
        <motion.div {...fadeUp} className="text-center mb-14">
          <p className="text-orange font-extrabold text-xs uppercase tracking-[0.15em] mb-3">
            How it works
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold text-dark mb-4">
            Three steps. That's it.
          </h2>
          <p className="text-dark/55 text-base md:text-lg max-w-md mx-auto leading-relaxed">
            No accounts to manage, no spreadsheets, no math homework.
          </p>
        </motion.div>

        <div className="md:hidden max-w-sm mx-auto">
          <div className="flex gap-2 mb-6">
            {howSteps.map((step, i) => (
              <button
                key={step.num}
                onClick={() => setActiveStep(i)}
                className={`flex-1 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 ${
                  activeStep === i
                    ? "gradient-button text-white shadow-[0_4px_14px_rgba(249,115,22,0.3)]"
                    : "bg-orange-pale text-dark/45"
                }`}
              >
                {step.shortTitle}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <div className="bg-orange-pale rounded-3xl h-50 p-3 flex items-end justify-center mb-5 overflow-hidden">
                {howSteps[activeStep].mockup}
              </div>
              <h4 className="font-display text-lg font-bold text-dark mb-1.5 text-center">
                {howSteps[activeStep].title}
              </h4>
              <p className="text-sm text-dark/55 leading-relaxed text-center px-4">
                {howSteps[activeStep].desc}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="hidden md:block max-w-3xl mx-auto relative">
          {/* Background spine track */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] bg-orange/15" />
          {/* Animated spine that draws in on scroll */}
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            style={{ transformOrigin: "top" }}
            className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] bg-orange"
          />

          <div className="flex flex-col gap-20">
            {howSteps.map((step, i) => {
              const isRight = i % 2 === 0; // steps 1 & 3 → right side, step 2 → left side
              return (
                <div
                  key={step.num}
                  className="relative grid grid-cols-2 gap-12 items-start"
                >
                  {/* Number node sitting on the spine */}
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.4, delay: 0.2, ease: "backOut" }}
                    className="absolute left-1/2 -translate-x-1/2 -top-1 w-10 h-10 rounded-full gradient-button text-white font-display font-extrabold text-base flex items-center justify-center shadow-[0_4px_14px_rgba(249,115,22,0.35)] z-10"
                  >
                    {step.num}
                  </motion.div>

                  {/* Left column */}
                  <div
                    className={
                      isRight ? "" : "flex flex-col items-end text-right pr-4"
                    }
                  >
                    {!isRight && (
                      <motion.div
                        {...stagger(0)}
                        className="w-full max-w-[280px]"
                      >
                        <h4 className="font-display text-xl font-bold text-dark mb-1.5">
                          {step.title}
                        </h4>
                        <p className="text-sm text-dark/55 leading-relaxed mb-5">
                          {step.desc}
                        </p>
                        <div className="bg-orange-pale rounded-3xl h-44 p-3 flex items-end justify-center overflow-hidden">
                          {step.mockup}
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Right column */}
                  <div
                    className={
                      isRight ? "flex flex-col items-start text-left pl-4" : ""
                    }
                  >
                    {isRight && (
                      <motion.div
                        {...stagger(0)}
                        className="w-full max-w-[280px]"
                      >
                        <h4 className="font-display text-xl font-bold text-dark mb-1.5">
                          {step.title}
                        </h4>
                        <p className="text-sm text-dark/55 leading-relaxed mb-5">
                          {step.desc}
                        </p>
                        <div className="bg-orange-pale rounded-3xl h-44 p-3 flex items-end justify-center overflow-hidden">
                          {step.mockup}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="corgi"
        className="relative px-6 md:px-8 py-20 md:py-28 overflow-hidden"
        style={{
          background: "linear-gradient(155deg, #FFF5EE 0%, #FFF0E5 100%)",
        }}
      >
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -3 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative bg-white rounded-[40px] p-5 md:p-16 flex items-center justify-center order-2 md:order-1"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative w-full aspect-square max-w-70"
            >
              <Image
                src="/corgis/waggy-corgi.svg"
                alt="SplitPals corgi mascot with sparkles"
                fill
                priority
              />
            </motion.div>
          </motion.div>

          <motion.div {...fadeUp} className="order-1 md:order-2">
            <p className="text-orange font-extrabold text-xs uppercase tracking-[0.15em] mb-3">
              The face of SplitPals
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-dark mb-5 leading-tight">
              Meet your splitting pal.
            </h2>
            <p className="text-dark/55 text-base leading-relaxed mb-4 max-w-md">
              Every great app needs a good friend. That's the corgi.{" "}
              <strong className="text-dark">
                Curious when you're new here, excited when there's a bill to
                split,
              </strong>{" "}
              and always rooting for you to actually get paid back.
            </p>
            <p className="text-dark/55 text-base leading-relaxed max-w-md">
              Because "Split<strong className="text-dark">Pals</strong>" isn't
              just a name. It's the whole idea. Bills shouldn't come between
              friends. A good pal helps you sort it out, no drama, no
              awkwardness.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ───────────────── FINAL CTA ───────────────── */}
      <section className="px-6 md:px-8 py-20 md:py-28">
        <motion.div
          {...fadeUp}
          className="max-w-4xl mx-auto rounded-[40px] p-12 md:p-20 text-center relative overflow-hidden gradient-button"
        >
          <h2 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-3 relative z-10">
            Stop fronting the bill alone.
          </h2>
          <p className="text-white/85 text-base mb-8 relative z-10">
            Try SplitPals free. No install needed. Just open it and look around.
          </p>
          <Link
            href="/launch"
            className="relative z-10 inline-flex items-center gap-2 bg-white text-orange-deep font-extrabold text-base px-8 py-4 rounded-2xl shadow-[0_10px_28px_rgba(0,0,0,0.18)] transition-transform hover:-translate-y-0.5 active:scale-95"
          >
            Try SplitPals now
          </Link>
        </motion.div>
      </section>

      <footer className="max-w-6xl mx-auto px-6 md:px-8 py-10 flex flex-row sm:flex-row items-start  justify-between gap-4 border-t border-dark/6">
        <div className="flex items-start flex-col ">
          <div className="w-full max-w-23 aspect-3/1 relative">
            <Image src={"/onboarding/logo.svg"} fill priority alt="Splitpals" />
          </div>
          <span className="text-sm text-dark/45">Made with ❤️ by Kent</span>
        </div>
        <button
          onClick={() => setGcashOpen(true)}
          className="flex items-center gap-2 bg-orange-tint text-orange text-sm font-bold px-4 py-2.5 rounded-full hover:bg-orange/15 transition-colors"
        >
          💛 Support via GCash
        </button>
      </footer>

      {/* ── GCash QR popover/modal — place this near the end of the component, alongside other AnimatePresence-wrapped overlays ── */}
      <AnimatePresence>
        {gcashOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/50"
              onClick={() => setGcashOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-3xl p-6 max-w-xs w-[90%] flex flex-col items-center gap-4 shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
            >
              <p className="font-display text-lg font-bold text-dark text-center">
                Scan to send via GCash
              </p>
              <div className="relative w-48 h-56">
                <Image
                  src="/marketing/gcash.jpg"
                  alt="GCash QR code"
                  fill
                  className="object-contain"
                />
              </div>
              <p className="text-xs text-dark/45 text-center">
                Every bit helps keep SplitPals running. Thank you! 🐾
              </p>
              <button
                onClick={() => setGcashOpen(false)}
                className="text-sm font-semibold text-dark/45 hover:text-dark transition-colors"
              >
                Close
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
