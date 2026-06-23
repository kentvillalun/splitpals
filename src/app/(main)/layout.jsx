"use client"

import { Toaster } from "sonner";
import { BottomNav } from "../components/navigation/BottomNav";
import { usePathname } from "next/navigation";

export default function MainLayout({ children }) {
  const pathname = usePathname();

  const paths = ["/bills/new", "/history/", "/receipt"];

  const hideNav = paths.some((paths) => pathname.startsWith(paths));
  return (
    <>
      <Toaster position="top-center" />
      <main>{children}</main>
      {!hideNav && <BottomNav />}
    </>
  );
}
