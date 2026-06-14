"use client";

import {
  BanknotesIcon,
  Cog6ToothIcon,
  PlusIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation";
import {
  Squares2X2Icon as Squares2X2IconSolid,
  BanknotesIcon as BanknotesIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid,
} from "@heroicons/react/16/solid";
import { useRouter } from "next/navigation";
import { haptic } from "@/app/lib/haptic";

export const BottomNav = () => {
  const pathName = usePathname();
  const router = useRouter();

  const inDashboard = pathName.startsWith("/dashboard");
  const inBills = pathName.startsWith("/history");
  const inSettings = pathName.startsWith("/settings");

  return (
    <div className="lg:hidden flex flex-row gap-4 items-center mobile:min-w-screen fixed bottom-6 h-auto px-4 font-body font-medium mx-auto justify-center">
      <div className="grid flex-1 grid-cols-3 rounded-[18px] bg-white h-auto items-center px-1.5 py-2.5 new-border text-[10px] gap-1 md:max-w-lg">
        <button
          className={`flex flex-col items-center rounded-2xl py-1 transition-colors duration-200 ${inDashboard ? "bg-primary/10" : ""}`}
          onClick={() => {
            haptic.light();
            router.push("/dashboard");
          }}
        >
          {inDashboard ? (
            <Squares2X2IconSolid className="w-5 text-primary" />
          ) : (
            <Squares2X2Icon className="w-5 stroke-text-secondary" />
          )}
          <label
            className={`transition-color duration-200 ${inDashboard ? "text-primary" : "text-text-secondary"}`}
          >
            Home
          </label>
        </button>
        <button
          className={`flex flex-col items-center rounded-2xl py-1 transition-color duration-200  ${inBills ? "bg-primary/10" : ""}`}
          onClick={() => {
            haptic.light();
            router.push("/history");
          }}
        >
          {inBills ? (
            <BanknotesIconSolid className="w-5 text-primary" />
          ) : (
            <BanknotesIcon className="w-5 stroke-text-secondary" />
          )}
          <label
            className={`transition-color duration-200 ${inBills ? "text-primary" : "text-text-secondary"}`}
          >
            Bills
          </label>
        </button>
        <button
          className={`flex flex-col items-center rounded-2xl py-1 transition-color duration-200  ${inSettings ? "bg-primary/10" : ""}`}
          onClick={() => {
            haptic.light();
            router.push("/settings");
          }}
        >
          {inSettings ? (
            <Cog6ToothIconSolid className="w-5 text-primary" />
          ) : (
            <Cog6ToothIcon className="w-5 stroke-text-secondary" />
          )}
          <label
            className={`transition-color duration-200 ${inSettings ? "text-primary" : "text-text-secondary"}`}
          >
            Settings
          </label>
        </button>
      </div>
      <button className="w-16 flex items-center justify-center h-16 gradient-button rounded-[18px]">
        <PlusIcon className="w-5 stroke-3 stroke-white" />
      </button>
    </div>
  );
};
