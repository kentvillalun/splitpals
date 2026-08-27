"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { DesktopGuard } from "@/app/components/DesktopGuard";
import { Page } from "@/app/components/layout/Page";
import { PageContent } from "@/app/components/layout/PageContent";
import { PageHeader } from "@/app/components/layout/PageHeader";
import { useReceiptCapture } from "@/app/components/ReceiptCaptureProvider";
import { haptic } from "@/app/lib/haptic";

export default function ReviewPhotoPage() {
  const router = useRouter();
  const { capturedFile, setCapturedFile, setScannedItems } = useReceiptCapture();
  const retakeInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [inlineError, setInlineError] = useState(null);
  const [errorStatus, setErrorStatus] = useState(null); // 422 | 503 | null

  // Only guard against landing here with nothing to review (e.g. a hard
  // refresh, which loses the in-memory File) — not against the deliberate
  // clear-on-back below, which would otherwise race this redirect.
  const hadFileOnMount = useRef(Boolean(capturedFile));
  useEffect(() => {
    if (!hadFileOnMount.current) {
      router.replace("/dashboard");
    }
  }, [router]);

  const previewUrl = useMemo(
    () => (capturedFile ? URL.createObjectURL(capturedFile) : null),
    [capturedFile]
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleBack() {
    haptic.light();
    setCapturedFile(null);
    router.back();
  }

  function handleRetakeTap() {
    haptic.light();
    retakeInputRef.current?.click();
  }

  function handleRetakeFileSelected(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setInlineError(null);
    setErrorStatus(null);
    setCapturedFile(file);
  }

  async function handleUseThisPhoto() {
    if (!capturedFile || isUploading) return;

    setInlineError(null);
    setErrorStatus(null);
    setIsUploading(true);
    haptic.medium();

    try {
      const formData = new FormData();
      formData.append("receipt", capturedFile);

      const res = await fetch("/api/scan-receipt", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        haptic.error();
        if (res.status === 429) {
          // Informational, no action needed — toast only, buttons untouched.
          toast.error(data.error);
        } else {
          // 422 (unreadable) / 503 (unavailable) — keep visible until the
          // user retakes or navigates away, since a toast could be missed
          // while waiting on the upload. Track the status too, since the
          // button set below depends on which error this was.
          setInlineError(data.error);
          setErrorStatus(res.status);
        }
        return;
      }

      haptic.success();
      setScannedItems(data.items ?? []);
      router.push("/bills/new/assign");
    } catch {
      haptic.error();
      // Not the photo's fault — same button treatment as 503.
      setInlineError("Something went wrong. Please try again.");
      setErrorStatus(503);
    } finally {
      setIsUploading(false);
    }
  }

  function handleAddManually() {
    haptic.light();
    setCapturedFile(null);
    router.push("/bills/new");
  }

  // 422 (unreadable): retrying the same photo is pointless — drop "Use this
  // photo" entirely so there's nothing to reflexively re-tap.
  const showUseThisPhoto = errorStatus !== 422;
  // 422/503 (and network failures, treated like 503): offer a way out.
  const showAddManually = errorStatus !== null;

  if (!capturedFile) return null;

  return (
    <>
      <DesktopGuard />
      <Page className="bg-backgroud">
        <PageContent className="px-0" withBottomNav={false}>
          <PageHeader onBack={handleBack}>
            <p className="text-base font-semibold text-white truncate flex-1 text-center">
              Review photo
            </p>
          </PageHeader>

          <div className="h-23.5" />

          <div className="max-w-xl mx-auto w-full px-4 flex flex-col gap-4">
            <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-3">
              <div className="relative w-full h-80 rounded-xl overflow-hidden bg-backgroud">
                {previewUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt="Captured receipt"
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
            </div>

            <div className="bg-orange-tint rounded-xl p-3">
              <p className="text-xs text-orange-deep font-medium">
                Make sure items and prices are clear and not cut off before
                scanning.
              </p>
            </div>

            {inlineError && (
              <div className="flex flex-row items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <ExclamationTriangleIcon className="w-4 text-red-600 shrink-0 mt-0.5" />
                <p className="text-xs text-red-600 font-medium">
                  {inlineError}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <div className="flex flex-row gap-2">
                <button
                  onClick={handleRetakeTap}
                  disabled={isUploading}
                  className="flex-1 rounded-2xl py-3.5 text-sm font-semibold text-orange border-[1.5px] border-orange transition-all duration-150 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                >
                  Retake
                </button>
                {showUseThisPhoto ? (
                  <button
                    onClick={handleUseThisPhoto}
                    disabled={isUploading}
                    className="flex-[1.5] flex flex-row items-center justify-center gap-2 gradient-button rounded-2xl py-3.5 text-sm font-semibold text-white transition-all duration-150 active:scale-95 disabled:opacity-60 disabled:pointer-events-none"
                  >
                    {isUploading && (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    )}
                    {isUploading ? "Reading receipt..." : "Use this photo"}
                  </button>
                ) : (
                  <button
                    onClick={handleAddManually}
                    className="flex-[1.5] rounded-2xl py-3.5 text-sm font-semibold text-orange border-[1.5px] border-orange transition-all duration-150 active:scale-95"
                  >
                    Add items manually
                  </button>
                )}
              </div>

              {showAddManually && showUseThisPhoto && (
                <button
                  onClick={handleAddManually}
                  className="w-full rounded-2xl py-3.5 text-sm font-semibold text-orange border-[1.5px] border-orange transition-all duration-150 active:scale-95"
                >
                  Add items manually
                </button>
              )}
            </div>
          </div>

          <input
            ref={retakeInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleRetakeFileSelected}
          />
        </PageContent>
      </Page>
    </>
  );
}
