import { Page } from "./layout/Page";
import Image from "next/image";

export const DesktopGuard = () => {
  return (
    <Page
      className="hidden lg:flex h-svh w-full items-center justify-center"
      isGradient={true}
    >
      <div className="text-center flex flex-col items-center gap-4">
        <div className="max-w-50 relative w-full aspect-square">
          <Image
            src={"/corgis/sad-corgi.svg"}
            alt="App logo and a corgi dog"
            fill
            priority
          />
        </div>
        <div>
          <p className="text-lg font-semibold text-[#1a1a1a]">
            SplitPals is a mobile app
          </p>
          <p className="text-sm text-text-secondary mt-1 max-w-xs">
            For the best experience, please open SplitPals on your mobile device.
          </p>
        </div>
        {/* QR code placeholder — optional for later */}
      </div>
    </Page>
  );
};
