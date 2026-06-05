import { twMerge } from "tailwind-merge";

export const Card = ({ children, className = "" }) => {
  return (
    <>
      <div className={`bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] rounded-2xl  ${twMerge("min-w-full p-6", className)}`}>{children}</div>
    </>
  );
};
