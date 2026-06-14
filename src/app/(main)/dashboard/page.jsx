import { DesktopGuard } from "@/app/components/DesktopGuard";
import { Page } from "@/app/components/layout/Page";
import { PageContent } from "@/app/components/layout/PageContent";
import { PlusCircleIcon } from "@heroicons/react/16/solid";
import { PlusIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

export default function DashboardPage() {
  return (
    <>
      <DesktopGuard />
      <Page className="bg-backgroud">
        <PageContent className="px-0">
          <div className="flex flex-col w-full gap-5.5">
            {/* orange bg — full width always */}
            <div className="relative w-full min-h-30">
              {/* orange bg layer — always full width */}
              <div className="gradient-button min-h-18.5 w-full absolute bottom-0 left-0" />

              {/* centered content wrapper */}
              <div className="relative max-w-xl mx-auto min-h-30">
                {/* corgi */}
                <div className="max-w-29 aspect-square absolute left-4 w-full z-40 bottom-0">
                  <Image
                    src={"/corgis/bust-corgi.png"}
                    fill
                    priority
                    alt="Corgi"
                  />
                </div>

                {/* bubble */}
                <div className="flex flex-col items-start bg-white new-border absolute p-4 z-40 left-32 right-4 top-3.5 rounded-t-3xl rounded-br-3xl rounded-bl-sm">
                  <p className="font-bold font-body text-sm">
                    Hey <span className="text-primary">Kent</span>! Ready to
                    split?
                  </p>
                  <p className="text-text-secondary text-sm">
                    Create your first bill to get started.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col px-4">
              <div className="flex flex-row">
                <div className="flex flex-row bg-white rounded-2xl w-full h-auto p-4 gap-4">
                  <div className="rounded-full gradient-button p-3 flex items-center justify-center">
                    <PlusIcon className="w-5 stroke-white stroke-3" />
                  </div>
                  <div className="flex flex-col ">
                    <p className="text-base font-semibold">New Bill</p>
                    <p className="text-text-secondary text-sm">Split with your friends</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PageContent>
      </Page>
    </>
  );
}
