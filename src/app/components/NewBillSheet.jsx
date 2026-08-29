"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BottomSheet } from "./ui/BottomSheet";
import { hapticTrigger } from "ios-haptics";
import { useReceiptCapture } from "./ReceiptCaptureProvider";

const OPTIONS = [
  {
    id: "scan",
    title: "Scan receipt",
    description: "Snap a photo, we'll sort out who owes what",
  },
  {
    id: "manual",
    title: "Manual entry",
    description: "Type in items and split them yourself",
  },
];

function OptionRow({ title, description, selected, onSelect }) {
  return (
    <button
      ref={hapticTrigger}
      type="button"
      onClick={onSelect}
      className={`flex flex-row items-center justify-between w-full text-left rounded-2xl p-4 gap-3 border-[1.5px] transition-colors duration-150 ${
        selected
          ? "bg-orange/10 border-orange"
          : "bg-transparent border-orange/12"
      }`}
    >
      <div className="flex flex-col items-start gap-0.5">
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        <p className="text-xs text-text-secondary">{description}</p>
      </div>
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors duration-150 ${
          selected ? "border-orange" : "border-black/15"
        }`}
      >
        {selected && <div className="w-2.5 h-2.5 rounded-full bg-orange" />}
      </div>
    </button>
  );
}

export const NewBillSheet = ({ setSheetOpen }) => {
  const router = useRouter();
  const [choice, setChoice] = useState(null);
  const fileInputRef = useRef(null);
  const { setCapturedFile } = useReceiptCapture();

  function handleSelectTap() {
    if (!choice) return;

    if (choice === "manual") {
      setSheetOpen(false);
      router.push("/bills/new", { transitionTypes: ["nav-forward"] });
      return;
    }

    fileInputRef.current?.click();
  }

  function handleFileSelected(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setCapturedFile(file);
    setSheetOpen(false);
    router.push("/bills/new/review", { transitionTypes: ["nav-forward"] });
  }

  return (
    <BottomSheet setSheetOpen={setSheetOpen}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelected}
      />
      <div className="font-body flex flex-col items-start w-full gap-4">
        <div className="flex flex-col ">
          <h1 className="font-display text-text-primary text-xl font-bold">
            New bill
          </h1>
          <p className="text-text-secondary text-sm">
            How do you want to add items?
          </p>
        </div>

        <div className="flex flex-col gap-2 w-full">
          {OPTIONS.map((option) => (
            <OptionRow
              key={option.id}
              title={option.title}
              description={option.description}
              selected={choice === option.id}
              onSelect={() => setChoice(option.id)}
            />
          ))}
        </div>

        <div className="border-b border-gray-100 w-full" />
        <button
          onClick={handleSelectTap}
          disabled={!choice}
          className="w-full gradient-button rounded-2xl py-3.5 text-white font-semibold text-sm transition-all duration-150 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
        >
          Select
        </button>
      </div>
    </BottomSheet>
  );
};
