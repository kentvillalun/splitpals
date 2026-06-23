"use client";

import { useEffect, useState } from "react";
import { DesktopGuard } from "@/app/components/DesktopGuard";
import { Page } from "@/app/components/layout/Page";
import { PageContent } from "@/app/components/layout/PageContent";
import { Card } from "@/app/components/ui/Card";
import { formatDate } from "@/app/lib/formatDate";
import { useFetch } from "@/app/lib/hooks/useFetch";
import { supabase } from "@/app/lib/supabase";
import { PlusIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [name, setName] = useState("");
  const router = useRouter()

  const {
    data: bills,
    isLoading,
    isError,
    error,
    handleRefetch,
  } = useFetch({
    table: "bills",
    orderBy: { column: "created_at", ascending: false },
    limit: 5,
    select: `id, name, created_at, persons (id, name, is_paid, items( id, name, price))`,
  });

  useEffect(() => {
    const getName = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .single();

      // Use first word only for the greeting — keeps it casual/friendly
      const firstName = profile?.name?.split(" ")[0] ?? "";
      setName(firstName);
    };

    getName();
  }, []);

  // Derive bill stats for the dynamic message
  const billsWithMeta = bills.map((b) => {
    const totalAmount =
      b.persons?.reduce(
        (sum, person) =>
          sum + (person.items?.reduce((s, item) => s + item.price, 0) ?? 0),
        0,
      ) ?? 0;
    const isSettled = b.persons?.every((p) => p.is_paid) ?? false;
    return { ...b, totalAmount, isSettled };
  });

  const unsettledCount = billsWithMeta.filter((b) => !b.isSettled).length;

  function getGreetingMessage() {
    if (isLoading) return "Loading your bills...";
    if (bills.length === 0) return "Create your first bill to get started.";
    if (unsettledCount === 0) return "All your bills are settled. Nice!";
    if (unsettledCount === 1) return "You have 1 unsettled bill.";
    return `You have ${unsettledCount} unsettled bills.`;
  }

  return (
    <>
      <DesktopGuard />
      <Page className="bg-backgroud lg:hidden">
        <PageContent className="px-0 ">
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
                    Hey <span className="text-primary">{name || "there"}</span>!
                    Ready to split?
                  </p>
                  <p className="text-text-secondary text-sm">
                    {getGreetingMessage()}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col px-4 gap-4 max-w-xl mx-auto w-full">
              <Card className="flex flex-row bg-white rounded-2xl max-w-xl w-full h-auto p-4 gap-4 items-start mx-auto" handleOnClick={() => router.push('/bills/new')}>
                <div className="rounded-full gradient-button p-3 flex items-center justify-center">
                  <PlusIcon className="w-5 stroke-white stroke-3" />
                </div>
                <div className="flex flex-col items-start">
                  <p className="text-base font-semibold">New Bill</p>
                  <p className="text-text-secondary text-sm">
                    Split with your friends
                  </p>
                </div>
              </Card>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="text-base font-semibold">Recent bills</p>
                  {bills.length !== 0 && (
                    <button className="text-sm font-semibold text-primary">
                      See all
                    </button>
                  )}
                </div>
                {isLoading ? (
                  <Card className="p-0!">
                    <div className="flex flex-row justify-between border-b border-gray-100 p-3">
                      <div className="flex flex-col">
                        <Skeleton width={140} />
                        <Skeleton width={120} />
                      </div>
                      <div>
                        <Skeleton width={80} />
                      </div>
                    </div>
                    <div className="flex flex-row justify-between p-3">
                      <Skeleton width={50} />
                      <Skeleton width={50} />
                    </div>
                  </Card>
                ) : isError ? (
                  <div className="flex flex-col items-center text-center py-10 gap-2">
                    <div className="w-25 h-25 relative">
                      <Image
                        src="/corgis/sad-corgi.svg"
                        fill
                        alt="Confused corgi"
                        property=""
                      />
                    </div>
                    <p className="font-bold text-text-primary text-base">
                      Something went wrong
                    </p>
                    <p className="text-text-secondary text-sm max-w-55">
                      We couldn't load your bills. Check your connection and try
                      again.
                    </p>
                    <button
                      className="text-sm font-semibold text-primary mt-1"
                      onClick={() => handleRefetch()}
                    >
                      Try again
                    </button>
                  </div>
                ) : bills.length === 0 ? (
                  <div className="flex flex-col items-center text-center py-10 gap-2">
                    <div className="w-24 h-24 relative">
                      <Image
                        src="/corgis/sad-corgi.svg"
                        fill
                        alt="Curious corgi"
                      />
                    </div>
                    <p className="font-bold text-text-primary text-base">
                      No bills yet
                    </p>
                    <p className="text-text-secondary text-sm max-w-55">
                      Start splitting with friends — tap "New Bill" above to
                      create your first one.
                    </p>
                  </div>
                ) : (
                  billsWithMeta.map((b) => {
                    const peopleCount = b.persons?.length ?? 0;

                    return (
                      <Card key={b.id} className="p-0!" handleOnClick={() => router.push(`/history/${b.id}`)}>
                        <div className="flex flex-row justify-between border-b border-gray-100 p-3">
                          <div className="flex flex-col">
                            <p className="text-base font-semibold text-text-primary">
                              {b.name}
                            </p>
                            <p className="text-xs text-text-secondary">
                              {formatDate(b.created_at)}
                            </p>
                          </div>
                          <div>
                            <p className="font-bold text-base">
                              ₱{b.totalAmount.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-row justify-between p-3">
                          <p className="text-xs text-text-secondary">
                            {peopleCount} people
                          </p>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wide ${
                              b.isSettled
                                ? "bg-[rgba(34,197,94,0.12)] text-[#16a34a]"
                                : "bg-orange-tint text-orange"
                            }`}
                          >
                            {b.isSettled ? "Settled" : "Unsettled"}
                          </span>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </PageContent>
      </Page>
    </>
  );
}
