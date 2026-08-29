"use client";

import { Toaster } from "sonner";
import { BottomNav } from "../components/navigation/BottomNav";
import { usePathname } from "next/navigation";
import { NewBillSheetProvider } from "../components/NewBillSheetProvider";
import { ReceiptCaptureProvider } from "../components/ReceiptCaptureProvider";

export default function MainLayout({ children }) {
  const pathname = usePathname();

  const paths = ["/bills/new", "/history/", "/receipt", "/bills/edit"];

  const hideNav = paths.some((paths) => pathname.startsWith(paths));

  return (
    <ReceiptCaptureProvider>
      <NewBillSheetProvider>
        <Toaster position="top-center" />

        <main>{children}</main>

        {!hideNav && <BottomNav />}
      </NewBillSheetProvider>
    </ReceiptCaptureProvider>
  );
}
