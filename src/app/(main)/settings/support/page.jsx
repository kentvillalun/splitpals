"use client";

import { ViewTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { DesktopGuard } from "@/app/components/DesktopGuard";
import { Page } from "@/app/components/layout/Page";
import { PageContent } from "@/app/components/layout/PageContent";
import { PageHeader } from "@/app/components/layout/PageHeader";
import { Card } from "@/app/components/ui/Card";
import { hapticTrigger } from "ios-haptics";
import { toast } from "sonner";
import { IconCoffee } from "@tabler/icons-react";
import { useState } from "react";
import { ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import { BottomSheet } from "@/app/components/ui/BottomSheet";
// Placeholders — swap the QR image and account details once the real
// GCash account is ready. SplitPals never processes payments itself
// (see Terms of Service); this is purely informational.
const GCASH_QR_SRC = "/marketing/gcash.jpg";
const GCASH_ACCOUNT_NAME = "Account Name";
const GCASH_ACCOUNT_NUMBER = "09943304495";

export default function SupportPage() {
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  async function handleCopyNumber() {
    try {
      await navigator.clipboard.writeText(GCASH_ACCOUNT_NUMBER);
      toast.success("Number copied");
    } catch {
      toast.error("Couldn't copy. Please copy it manually.");
    }
  }

  return (
    <>
      <DesktopGuard />
      <ViewTransition
        enter={{
          "nav-forward": "nav-forward",
          "nav-back": "nav-back",
          default: "none",
        }}
        exit={{
          "nav-forward": "nav-forward",
          "nav-back": "nav-back",
          default: "none",
        }}
        default="none"
      >
        <Page className="bg-backgroud lg:hidden">
          <PageContent className="px-0" withBottomNav={false}>
            <div className="flex flex-col w-full gap-5">
              <PageHeader
                onBack={() =>
                  router.push("/settings", { transitionTypes: ["nav-back"] })
                }
              >
                <p className="text-base font-semibold text-white truncate flex-1 text-center">
                  Support SplitPals
                </p>
              </PageHeader>

              <div className="h-23.5" />

              <div className="max-w-xl mx-auto w-full px-4 flex flex-col items-center gap-5 pb-10 -mt-5">
                <p className="text-[13px] text-text-secondary text-center leading-[1.6]">
                  SplitPals is free to use right now. If it&apos;s helped you
                  split a bill without the awkwardness, you&apos;re welcome to
                  leave a tip — totally optional, no pressure.
                </p>

                <Card className="p-6! flex flex-row items-center gap-4 w-full justify-between">
                  <div className="flex flex-col">
                    <h3 className="font-display text-2xl font-semibold text-primary">
                      Split<span className="text-text-primary">Pals</span>
                    </h3>
                    <p className="text-xs text-text-secondary">
                      Made with <span className="text-text-primary">🧡</span> by
                      Kent
                    </p>
                  </div>
                  <button
                    className="flex flex-row gap-1 items-center gradient-button-black px-3 py-2 rounded-2xl"
                    onClick={() => {
                      setIsSheetOpen(true);
                    }}
                    ref={hapticTrigger}
                  >
                    <IconCoffee stroke={2} className="w-6 stroke-primary" />
                    <p className="font-body font-semibold text-white text-sm">
                      Buy me a coffee
                    </p>
                  </button>
                </Card>

                <p className="text-xs text-text-secondary/60 text-center">
                  Thank you for using SplitPals 🧡
                </p>
              </div>
            </div>

            {isSheetOpen && (
              <BottomSheet setSheetOpen={setIsSheetOpen}>
                <div className="flex flex-col items-center justify-start">
                  <h1 className="font-display text-text-primary text-xl font-bold">
                    Scan to send via GCash
                  </h1>
                  <div className="relative w-48 h-56">
                    <Image
                      src={GCASH_QR_SRC}
                      alt="GCash QR code"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <button
                    ref={hapticTrigger}
                    onClick={handleCopyNumber}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-text-primary border border-black/10 active:scale-95 transition-all duration-150"
                  >
                    <ClipboardDocumentIcon className="w-4" />
                    Copy number
                  </button>
                </div>
                <button
                  onClick={() => setIsSheetOpen(false)}
                  className="w-full gradient-button rounded-2xl py-3.5 text-white font-semibold text-sm transition-all duration-150 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                >
                  Close
                </button>
              </BottomSheet>
            )}
          </PageContent>
        </Page>
      </ViewTransition>
    </>
  );
}
