"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export const BackButton = () => {
  const router = useRouter();
  const [hasHistory, setHasHistory] = useState(false);

  useEffect(() => {
    setHasHistory(window.history.length > 1);
  }, []);

  const handleBack = () => {
    if (hasHistory) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <button
      className="inline-flex items-center gap-2 text-sm font-semibold text-dark/55 hover:text-orange transition-colors mb-10"
      onClick={() => handleBack()}
    >
      <ArrowLeftIcon className="w-4 h-4" /> {hasHistory ? "Back" : "Back to home"}
    </button>
  );
};
