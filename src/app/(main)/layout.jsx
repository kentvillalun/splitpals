"use client"

import { useEffect, useRef } from "react";
import { Toaster } from "sonner";
import { BottomNav } from "../components/navigation/BottomNav";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { NewBillSheetProvider } from "../components/NewBillSheetProvider";
import { ReceiptCaptureProvider } from "../components/ReceiptCaptureProvider";

const TAB_ROUTES = ["/dashboard", "/history", "/settings"];

export default function MainLayout({ children }) {
  const pathname = usePathname();

  const paths = ["/bills/new", "/history/", "/receipt", "/bills/edit"];

  const hideNav = paths.some((paths) => pathname.startsWith(paths));

  const currentTabIndex = TAB_ROUTES.indexOf(pathname);
  const isTabSwitch = currentTabIndex !== -1;

  const lastTabIndexRef = useRef(currentTabIndex);
  const direction = currentTabIndex >= lastTabIndexRef.current ? 1 : -1;

  useEffect(() => {
    if (currentTabIndex !== -1) {
      lastTabIndexRef.current = currentTabIndex;
    }
  }, [currentTabIndex]);

  const animationProps = isTabSwitch
    ? {
        initial: { opacity: 0, x: 8 * direction },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -8 * direction },
        transition: { duration: 0.12, ease: "easeInOut" },
      }
    : {
        initial: { opacity: 0, x: 8 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -8 },
        transition: { duration: 0.2, ease: "easeInOut" },
      };

  return (
    <ReceiptCaptureProvider>
      <NewBillSheetProvider>
        <Toaster position="top-center" />
        <AnimatePresence mode="wait">
          <motion.main key={pathname} {...animationProps}>
            {children}
          </motion.main>
        </AnimatePresence>
        {!hideNav && <BottomNav />}
      </NewBillSheetProvider>
    </ReceiptCaptureProvider>
  );
}
