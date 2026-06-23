"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { CheckCircleIcon, ShareIcon } from "@heroicons/react/24/solid";
import { CheckCircleIcon as CheckCircleOutline } from "@heroicons/react/24/outline";
import { haptic } from "@/app/lib/haptic";
import { toast } from "sonner";

/**
 * Receipt — reusable thermal-receipt-style UI.
 *
 * Props:
 * - billName: string
 * - date: string (formatted)
 * - persons: [{ id, name, is_paid, items: [{ id, name, price }] }]
 * - onTogglePaid: (personId, nextValue) => Promise<void> | void  (optional — omit for read-only/creation preview)
 * - readOnly: boolean — hides mark-as-paid + share buttons (used in creation flow preview)
 */
export function Receipt({ billName, date, persons = [], onTogglePaid, readOnly = false }) {
  const receiptRef = useRef(null);
  const personRefs = useRef({});
  const shareTemplateRefs = useRef({});
  const [sharingId, setSharingId] = useState(null); // tracks which share is in-flight: 'all' | personId | null
  const [togglingId, setTogglingId] = useState(null);

  const barHeights = [14, 8, 18, 10, 14, 6, 16, 10, 12, 8, 18, 6, 14, 10, 16, 8, 12, 14, 6, 18];

  const grandTotal = persons.reduce(
    (sum, p) => sum + (p.items?.reduce((s, i) => s + i.price, 0) ?? 0),
    0
  );

  async function captureAndShare(node, filename, shareTitle, shareText) {
    try {
      const dataUrl = await toPng(node, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], filename, { type: "image/png" });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: shareTitle,
          text: shareText,
        });
        haptic.success();
      } else {
        // fallback — download the image
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = filename;
        link.click();
        haptic.medium();
        toast.info("Receipt saved. Sharing isn't supported on this browser.");
      }
    } catch (err) {
      haptic.error();
      toast.error("Couldn't share the receipt. Please try again.");
    }
  }

  async function handleShareAll() {
    if (!receiptRef.current) return;
    setSharingId("all");
    haptic.medium();
    await captureAndShare(
      receiptRef.current,
      `${billName.replace(/\s+/g, "-").toLowerCase()}-receipt.png`,
      billName,
      `Here's our split for ${billName} — via SplitPals`
    );
    setSharingId(null);
  }

  async function handleShareOne(person) {
    setSharingId(person.id);
    haptic.medium();

    const node = shareTemplateRefs.current[person.id];
    if (!node) {
      haptic.error();
      toast.error("Couldn't prepare the share image. Please try again.");
      setSharingId(null);
      return;
    }

    await captureAndShare(
      node,
      `${person.name.replace(/\s+/g, "-").toLowerCase()}-share.png`,
      `${person.name}'s share`,
      `Hey ${person.name}, here's your share for ${billName} — via SplitPals`
    );

    setSharingId(null);
  }

  async function handleTogglePaid(person) {
    if (!onTogglePaid) return;
    setTogglingId(person.id);
    haptic.light();
    try {
      await onTogglePaid(person.id, !person.is_paid);
    } catch {
      toast.error("Couldn't update payment status.");
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* The actual receipt — captured as image for "Share All" */}
      <div
        ref={receiptRef}
        className="bg-white rounded-3xl px-5 py-6 flex flex-col gap-3 font-receipt text-[13px]"
      >
        {/* Header */}
        <div className="flex flex-col items-center gap-0.5 pb-3 border-b border-dashed border-black/15">
          <p className="font-bold text-orange uppercase tracking-[3px] text-base">
            SplitPals
          </p>
          <p className="text-text-secondary text-[11px]">
            Splitting bills made easy
          </p>
          <p className="text-text-secondary text-[11px] mt-2">{billName}</p>
          <p className="text-text-secondary text-[10px]">{date}</p>
        </div>

        {/* Persons */}
        {persons.map((person, idx) => {
          const subtotal =
            person.items?.reduce((s, i) => s + i.price, 0) ?? 0;
          const isLast = idx === persons.length - 1;

          return (
            <div
              key={person.id}
              className={`flex flex-col gap-1.5 pb-3 ${
                !isLast ? "border-b border-dashed border-black/15" : ""
              }`}
            >
              {/* Capturable content — used for "Share All" only now */}
              <div ref={(el) => (personRefs.current[person.id] = el)}>
                <div className="flex items-center justify-center gap-1.5">
                  <p className="text-center font-bold text-sm tracking-wide">
                    {person.name}
                  </p>
                  {person.is_paid && (
                    <CheckCircleIcon className="w-4 text-[#16a34a]" />
                  )}
                </div>

                <div className="flex flex-col gap-0.5">
                  {person.items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-baseline gap-3"
                    >
                      <p className="truncate">{item.name}</p>
                      <p className="font-bold shrink-0">
                        <span className="font-body">₱</span>
                        {item.price.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-1">
                  <p className="uppercase text-[10px] text-text-secondary tracking-wide">
                    {person.name}'s total
                  </p>
                  <p className="font-bold text-orange text-sm">
                    <span className="font-body">₱</span>
                    {subtotal.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Action buttons — outside the captured ref, never appear in shared image */}
              {!readOnly && (
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => handleTogglePaid(person)}
                    disabled={togglingId === person.id}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-body text-[11px] font-semibold transition-all duration-150 active:scale-95 disabled:opacity-50 ${
                      person.is_paid
                        ? "bg-[rgba(34,197,94,0.12)] text-[#16a34a]"
                        : "bg-orange-tint text-orange border border-orange/30"
                    }`}
                  >
                    {person.is_paid ? (
                      <CheckCircleIcon className="w-3.5" />
                    ) : (
                      <CheckCircleOutline className="w-3.5" />
                    )}
                    {person.is_paid ? "Paid" : "Mark as paid"}
                  </button>

                  <button
                    onClick={() => handleShareOne(person)}
                    disabled={sharingId === person.id}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl font-body text-[11px] font-semibold text-text-secondary border border-black/10 transition-all duration-150 active:scale-95 disabled:opacity-50 shrink-0"
                  >
                    <ShareIcon className="w-3.5" />
                    {sharingId === person.id ? (
                      <div className="w-3 h-3 border-2 border-text-secondary/30 border-t-text-secondary rounded-full animate-spin" />
                    ) : (
                      "Share"
                    )}
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Grand total */}
        <div className="flex justify-between items-center pt-1">
          <p className="uppercase text-[11px] font-semibold text-text-secondary tracking-wide">
            Grand total
          </p>
          <p className="font-bold text-base">
            <span className="font-body">₱</span>
            {grandTotal.toFixed(2)}
          </p>
        </div>

        {/* Stamp */}
        <div className="flex flex-col items-center gap-1 pt-1">
          <p className="text-text-secondary text-[9px] uppercase tracking-wide">
            Printed by SplitPals · {date}
          </p>
          <div className="flex items-end gap-[1.5px] h-4">
            {[14, 8, 18, 10, 14, 6, 16, 10, 12, 8, 18, 6, 14, 10, 16, 8, 12, 14, 6, 18].map(
              (h, i) => (
                <div
                  key={i}
                  className="w-0.5 bg-black/15 rounded-[1px]"
                  style={{ height: `${h}px` }}
                />
              )
            )}
          </div>
        </div>
      </div>

      {/* Share All — outside the captured node */}
      {!readOnly && (
        <button
          onClick={handleShareAll}
          disabled={sharingId === "all"}
          className="w-full gradient-button flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-semibold text-sm transition-all duration-150 active:scale-95 disabled:opacity-60"
        >
          <ShareIcon className="w-4 stroke-white" />
          {sharingId === "all" ? "Preparing..." : "Share All"}
        </button>
      )}

      {/* Hidden per-person share templates — real JSX (same render pipeline
          as the working "Share All" node above). The off-screen positioning
          lives on this OUTER wrapper only — the captured node itself (the
          ref target) must carry no position-displacing styles, because
          html-to-image clones the captured node's full computed style
          (including position/left) onto the clone it rasterizes. If the
          off-screen "left: -10000px" sits on the captured node, that style
          gets baked into the clone too, so the clone renders 10000px outside
          its own capture canvas — a blank image, not a missing one. */}
      {!readOnly &&
        persons.map((person) => {
          const subtotal =
            person.items?.reduce((s, i) => s + i.price, 0) ?? 0;
          return (
            <div
              key={`share-template-${person.id}`}
              style={{ position: "fixed", top: 0, left: "-10000px" }}
              aria-hidden="true"
            >
              <div
                ref={(el) => (shareTemplateRefs.current[person.id] = el)}
                className="w-[320px] bg-white px-5 py-6 flex flex-col gap-2 font-receipt text-[13px]"
              >
                <div className="flex flex-col items-center gap-0.5 pb-2 mb-1 border-b border-dashed border-black/15">
                  <p className="font-bold text-orange uppercase tracking-[3px] text-sm">
                    SplitPals
                  </p>
                  <p className="text-text-secondary text-[10px]">
                    Splitting bills made easy
                  </p>
                  <p className="text-text-secondary text-[10px] mt-1.5">
                    {billName}
                  </p>
                  <p className="text-text-secondary text-[9px]">{date}</p>
                </div>

                <p className="text-center font-bold text-sm tracking-wide">
                  {person.name}
                </p>

                <div className="flex flex-col gap-0.5">
                  {person.items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-baseline gap-3"
                    >
                      <p className="truncate">{item.name}</p>
                      <p className="font-bold shrink-0">
                        <span className="font-body">₱</span>
                        {item.price.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-1 pb-2 border-b border-dashed border-black/15">
                  <p className="uppercase text-[10px] text-text-secondary tracking-wide">
                    {person.name}'s total
                  </p>
                  <p className="font-bold text-orange text-sm">
                    <span className="font-body">₱</span>
                    {subtotal.toFixed(2)}
                  </p>
                </div>

                <div className="flex flex-col items-center gap-1 pt-1">
                  <p className="text-text-secondary text-[9px] uppercase tracking-wide">
                    Printed by SplitPals · {date}
                  </p>
                  <div className="flex items-end gap-[1.5px] h-4">
                    {barHeights.map((h, i) => (
                      <div
                        key={i}
                        className="w-0.5 bg-black/15 rounded-[1px]"
                        style={{ height: `${h}px` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
}