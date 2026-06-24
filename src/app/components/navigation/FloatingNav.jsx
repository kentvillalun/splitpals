"use client";

import Link from "next/link";
import Image from "next/image";
import { XMarkIcon, Bars3Icon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";

export const FloatingNav = ({ scrolled, menuOpen, setMenuOpen }) => {
  function handleNavClick(id) {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }
  return (
    <nav
      className={`fixed z-40 inset-x-0 md:mx-auto mx-1  transition-all duration-400 ease-in-out top-3 border-transparent
          ${
            scrolled
              ? "top-4 bg-white/75 backdrop-blur-lg lg:max-w-5xl md:max-w-2xl mx-6 md:mx-auto rounded-xl md:rounded-full border border-orange/10 shadow-[0_8px_30px_rgba(249,115,22,0.12)]"
              : "top-0 max-w-7xl"
          }
        `}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-row justify-between items-center h-14 md:mx-2">
          <div className="w-full max-w-25 aspect-3/1 relative">
            <Image src={"/onboarding/logo.svg"} fill priority alt="Splitpals" />
          </div>

          <div className="flex items-center md:gap-8 gap-4">
            <button
              onClick={() => handleNavClick("how")}
              className="text-sm font-semibold text-dark/55 hover:text-dark transition-colors md:flex hidden"
            >
              How it works
            </button>
            <button className="text-sm font-semibold text-dark/55 hover:text-dark transition-colors md:flex hidden"  onClick={() => handleNavClick("corgi")}>
              Meet the corgi
            </button>
            <Link
              href="/launch"
              className="gradient-button-black text-white text-sm font-bold px-5 py-2 rounded-xl transform hover:-translate-y-0.5 transition-transform hidden md:flex"
            >
              Try it free
            </Link>
            <button
              className="flex md:hidden"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              {" "}
              <AnimatePresence mode="wait">
                {menuOpen ? (
                  <motion.div
                    key={"xmark"}
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <XMarkIcon className="w-7 text-dark" />
                  </motion.div>
                ) : (
                  <motion.div
                    key={"bars-icon"}
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Bars3Icon className="w-7 text-dark" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      <div
        className={`absolute top-14 md:hidden left-0 z-40 flex flex-col items-center justify-center transition-all duration-300 ease-in-out mt-2 min-w-full
            ${
              menuOpen
                ? "opacity-100 pointer-events-auto scale-100"
                : "opacity-0 pointer-events-none scale-95"
            }
            ${scrolled ? "p-0" : "p-2"}
          `}
      >
        <div className="bg-white min-w-full rounded-2xl flex flex-col gap-1 px-5 py-6 text-base border border-orange/10 shadow-[0_10px_30px_rgba(249,115,22,0.15)]">
          <button
            className="text-left py-2 text-dark font-semibold transition-colors hover:text-orange"
            onClick={() => handleNavClick("how")}
          >
            How it works
          </button>
          <button
            className="text-left py-2 text-dark font-semibold transition-colors hover:text-orange"
            onClick={() => handleNavClick("corgi")}
          >
            Meet the corgi
          </button>
          <Link
            href="/launch"
            className="text-white text-sm font-bold text-center px-5 py-3 rounded-2xl mt-2"
            style={{
              background: "linear-gradient(to bottom, #2a2a2a, #1a1a1a)",
              borderBottom: "1.5px solid #0a0a0a",
            }}
            onClick={() => setMenuOpen(false)}
          >
            Try it free
          </Link>
        </div>
      </div>
    </nav>
  );
};
