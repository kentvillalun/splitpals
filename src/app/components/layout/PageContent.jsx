import { twMerge } from "tailwind-merge";

export const PageContent = ({
  children,
  className = "",
  withBottomNav = true,
}) => {
  return (
    <div
      className={`
        absolute left-0 right-0 md:top-0
        ${withBottomNav ? "h-[calc(100dvh-72px)]" : "h-dvh"}
        ${twMerge("flex flex-col gap-6 px-3 py-6 pt-0", className)}
        overflow-y-auto
        ${withBottomNav ? "pb-[calc(12rem+env(safe-area-inset-bottom))]" : "pb-[calc(2rem+env(safe-area-inset-bottom))]"}
        md:h-screen
      `}
    >
      {children}
    </div>
  );
};
