"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingNav } from "./components/navigation/FloatingNav";

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
              className="absolute bottom-34 right-18 z-50 md:bottom-49 md:right-25 bg-white px-3.5 py-2 rounded-2xl rounded-bl-sm shadow-[0_8px_24px_rgba(0,0,0,0.1)]"
            >
              <p className="text-xs font-bold text-dark max-w-22 md:max-w-40">
                Hi! I'm your <span className="text-orange">splitting pal</span>{" "}
                🐾
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ───────────────── VALUE PROPS ───────────────── */}
      <section className="px-6 md:px-8 py-20 md:py-28">
        <motion.div {...fadeUp} className="text-center mb-14">
          <p className="text-orange font-extrabold text-xs uppercase tracking-[0.15em] mb-3">
            Why SplitPals
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold text-dark mb-4">
            Built different, on purpose.
          </h2>
          <p className="text-dark/55 text-base md:text-lg max-w-md mx-auto leading-relaxed">
            No app store, no clutter, no awkward "pa-utang muna" moments. Just a
            clean way to settle the bill.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              emoji: "⚡",
              title: "No download needed",
              desc: "SplitPals runs straight from your browser — open the link, use it instantly, add it to your home screen if you like.",
            },
            {
              emoji: "🇵🇭",
              title: "Made for Pinoy friend groups",
              desc: "Peso amounts, Taglish-friendly, built around how barkadas actually split bills — not a generic template.",
            },
            {
              emoji: "🧾",
              title: "A receipt that feels real",
              desc: "Every split prints out like an actual thermal receipt — itemized, clear, and easy to screenshot to the group chat.",
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              {...stagger(i)}
              className="bg-white rounded-3xl p-7 shadow-[0_1px_4px_rgba(0,0,0,0.05)] hover:-translate-y-1.5 hover:shadow-[0_16px_32px_rgba(249,115,22,0.12)] transition-all duration-300"
            >
              <div className="w-13 h-13 rounded-2xl gradient-button flex items-center justify-center text-2xl mb-5 shadow-[0_6px_16px_rgba(249,115,22,0.3)]">
                {item.emoji}
              </div>
              <h3 className="font-display text-lg font-bold text-dark mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-dark/55 leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ───────────────── HOW IT WORKS ───────────────── */}
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

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 — Track orders */}
          <motion.div {...stagger(0, 0.12)} className="text-center">
            <div className="w-8 h-8 rounded-full gradient-button text-white font-display font-extrabold text-xs flex items-center justify-center mx-auto mb-5 shadow-[0_4px_12px_rgba(249,115,22,0.3)]">
              1
            </div>
            <div className="bg-orange-pale rounded-3xl h-52 p-3 flex items-end justify-center mb-5 overflow-hidden">
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
                  <div className="flex justify-between items-center bg-dark/[0.02] rounded-lg px-2 py-1.5">
                    <span className="text-[9px] text-dark">McSpicy Burger</span>
                    <span className="text-[9px] font-bold text-orange">
                      ₱169
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-dark/[0.02] rounded-lg px-2 py-1.5">
                    <span className="text-[9px] text-dark">Large Fries</span>
                    <span className="text-[9px] font-bold text-orange">
                      ₱89
                    </span>
                  </div>
                </div>
                <button className="w-full mt-2 border border-dashed border-orange/40 rounded-lg py-1.5 text-[9px] font-bold text-orange bg-orange-tint/50">
                  + Add item
                </button>
              </div>
            </div>
            <h4 className="font-display text-base font-bold text-dark mb-1.5">
              Track orders
            </h4>
            <p className="text-sm text-dark/55 leading-relaxed px-2">
              Add what everyone ordered — one item at a time, per person.
            </p>
          </motion.div>

          {/* Step 2 — Split the bill */}
          <motion.div {...stagger(1, 0.12)} className="text-center">
            <div className="w-8 h-8 rounded-full gradient-button text-white font-display font-extrabold text-xs flex items-center justify-center mx-auto mb-5 shadow-[0_4px_12px_rgba(249,115,22,0.3)]">
              2
            </div>
            <div className="bg-orange-pale rounded-3xl h-52 p-3 flex items-end justify-center mb-5 overflow-hidden">
              <div className="bg-white rounded-2xl p-3 shadow-[0_4px_16px_rgba(0,0,0,0.08)] w-full flex flex-col gap-1.5">
                <div className="flex items-center justify-between bg-dark/[0.02] rounded-lg px-2.5 py-2">
                  <div className="text-left">
                    <p className="text-[9px] font-bold text-dark">You</p>
                    <p className="text-[8px] text-dark/45">McSpicy + Fries</p>
                  </div>
                  <p className="text-[10px] font-extrabold text-orange">₱258</p>
                </div>
                <div className="flex items-center justify-between bg-dark/[0.02] rounded-lg px-2.5 py-2">
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
            </div>
            <h4 className="font-display text-base font-bold text-dark mb-1.5">
              Split the bill
            </h4>
            <p className="text-sm text-dark/55 leading-relaxed px-2">
              SplitPals calculates everyone's exact share, instantly.
            </p>
          </motion.div>

          {/* Step 3 — Share the receipt */}
          <motion.div {...stagger(2, 0.12)} className="text-center">
            <div className="w-8 h-8 rounded-full gradient-button text-white font-display font-extrabold text-xs flex items-center justify-center mx-auto mb-5 shadow-[0_4px_12px_rgba(249,115,22,0.3)]">
              3
            </div>
            <div className="bg-orange-pale rounded-3xl h-52 p-3 flex items-end justify-center mb-5 overflow-hidden">
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
                  <span className="text-[7px] text-dark/45 uppercase">
                    Total
                  </span>
                  <span className="text-[10px] font-bold text-orange">
                    ₱215.00
                  </span>
                </div>
                <button className="w-full mt-2 border border-orange/40 rounded-lg py-1.5 text-[8px] font-bold text-orange">
                  ⇧ Share to Marco
                </button>
              </div>
            </div>
            <h4 className="font-display text-base font-bold text-dark mb-1.5">
              Share the receipt
            </h4>
            <p className="text-sm text-dark/55 leading-relaxed px-2">
              Send each friend their share, or the whole receipt to the group
              chat.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ───────────────── MEET THE CORGI ───────────────── */}
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
            className="relative bg-white rounded-[40px] p-12 md:p-16 flex items-center justify-center order-2 md:order-1"
          >
            <div className="absolute inset-2 rounded-[36px] border-2 border-dashed border-orange/25" />
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative w-40 h-40 md:w-52 md:h-52"
            >
              <Image
                src="/corgis/sparkling-corgi.png"
                alt="SplitPals corgi mascot with sparkles"
                fill
                className="object-contain"
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
              Every great app needs a good friend — that's the corgi.{" "}
              <strong className="text-dark">
                Curious when you're new here, excited when there's a bill to
                split,
              </strong>{" "}
              and always rooting for you to actually get paid back.
            </p>
            <p className="text-dark/55 text-base leading-relaxed max-w-md">
              Because "Split<strong className="text-dark">Pals</strong>" isn't
              just a name — it's the whole idea. Bills shouldn't come between
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
          className="max-w-4xl mx-auto rounded-[40px] p-12 md:p-20 text-center relative overflow-hidden"
          style={{
            background: "linear-gradient(160deg, #F97316, #EA6C10)",
          }}
        >
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/[0.08] pointer-events-none" />
          <h2 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-3 relative z-10">
            Stop fronting the bill alone.
          </h2>
          <p className="text-white/85 text-base mb-8 relative z-10">
            Try SplitPals free — no install, no signup required to look around.
          </p>
          <Link
            href="/launch"
            className="relative z-10 inline-flex items-center gap-2 bg-white text-orange-deep font-extrabold text-base px-8 py-4 rounded-2xl shadow-[0_10px_28px_rgba(0,0,0,0.18)] transition-transform hover:-translate-y-0.5 active:scale-95"
          >
            🐕 Try SplitPals now
          </Link>
        </motion.div>
      </section>

      {/* ───────────────── FOOTER ───────────────── */}
      <footer className="max-w-6xl mx-auto px-6 md:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-dark/[0.06]">
        <div className="flex items-center gap-3">
          <span className="font-display font-extrabold text-dark">
            <span className="text-orange">Split</span>Pals
          </span>
          <span className="text-sm text-dark/45">
            🇵🇭 Made in the Philippines
          </span>
        </div>
        <div className="flex items-center gap-6">
          <a
            href="#"
            className="text-sm font-semibold text-dark/45 hover:text-dark transition-colors"
          >
            GitHub
          </a>
          <a
            href="#"
            className="text-sm font-semibold text-dark/45 hover:text-dark transition-colors"
          >
            Portfolio
          </a>
        </div>
      </footer>
    </div>
  );
}
