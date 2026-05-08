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
        h-[calc(100dvh-72px)]
        ${twMerge("flex flex-col gap-6 px-3 py-6", className)}
        overflow-y-auto
        ${withBottomNav ? "pb-[calc(12rem+env(safe-area-inset-bottom))]" : "pb-[calc(13rem+env(safe-area-inset-bottom))]"}
        md:pl-80 md:h-screen
      `}
    >
      {children}
    </div>
  );
};
