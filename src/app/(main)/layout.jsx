import { Toaster } from "sonner";
import { BottomNav } from "../components/navigation/BottomNav";

export default function MainLayout({ children }) {
  return (
    <>
      <Toaster position="top-center" />
      <main>{children}</main>
      <BottomNav />
    </>
  );
}
