import { Plus_Jakarta_Sans } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const Page = ({ className = "", children }) => {
  return (
    <main
      className={`relative min-h-svh flex  ${jakarta.className} ${className}`}
    >
      {children}
    </main>
  );
};
