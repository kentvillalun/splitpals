import { twMerge } from "tailwind-merge";

export const Card = ({ children, className = "" }) => {
  return (
    <>
      <div className={`bg-white shadow-sm rounded-2xl p-6 ${twMerge("min-w-full", className)}`}>{children}</div>
    </>
  );
};
