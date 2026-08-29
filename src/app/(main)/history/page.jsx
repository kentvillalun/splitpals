"use client";

import { DesktopGuard } from "@/app/components/DesktopGuard";
import { Page } from "@/app/components/layout/Page";
import { PageContent } from "@/app/components/layout/PageContent";
import { Card } from "@/app/components/ui/Card";
import { formatDate } from "@/app/lib/formatDate";
import { useFetch } from "@/app/lib/hooks/useFetch";
import { useLayoutEffect, useRef, useState, ViewTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Image from "next/image";

export default function BillsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const updateHeight = () => setHeaderHeight(el.offsetHeight);
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const {
    data: bills,
    isLoading,
    isError,
    handleRefetch,
  } = useFetch({
    table: "bills",
    orderBy: { column: "created_at", ascending: false },
    select: `id, name, created_at, persons (id, name, is_paid, items(id, name, price))`,
  });

  const billsWithMeta = bills.map((b) => {
    const totalAmount =
      b.persons?.reduce(
        (sum, person) =>
          sum + (person.items?.reduce((s, item) => s + item.price, 0) ?? 0),
        0,
      ) ?? 0;
    const peopleCount = b.persons?.length ?? 0;
    const isSettled = b.persons?.every((p) => p.is_paid) ?? false;
    return { ...b, totalAmount, peopleCount, isSettled };
  });

  const totalUnpaid = billsWithMeta
    .filter((b) => !b.isSettled)
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const filteredBills = billsWithMeta.filter((b) => {
    if (filter === "settled") return b.isSettled;
    if (filter === "unsettled") return !b.isSettled;
    return true;
  });

  return (
    <>
      <DesktopGuard />
      <ViewTransition
        enter={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
        exit={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
        default="none"
      >
      <Page className="bg-backgroud lg:hidden">
        <PageContent className="px-0">
          <div className="flex flex-col w-full gap-5">
            <div
              ref={headerRef}
              className="fixed top-0 left-0 right-0 z-50 flex flex-col"
            >
              {/* Orange gradient hero */}
              <div className="gradient-button w-full px-4 pt-5 pb-7 rounded-b-3xl fixed">
                <div className="max-w-xl mx-auto flex flex-col gap-4">
                  {/* Back button + page name */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => router.back()}
                      className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors duration-150"
                    >
                      <ArrowLeftIcon className="w-4 stroke-white" />
                    </button>
                    <p className="text-base font-semibold text-white">
                      Bill Transactions
                    </p>
                    <div className="w-8 h-8"></div>
                  </div>

                  {/* Total unpaid stat */}
                  <div className="flex flex-col gap-0.5">
                    <p className="text-xs font-semibold text-white/70 uppercase tracking-wide">
                      Total Unpaid
                    </p>
                    <p className="text-3xl font-display font-black text-white">
                      ₱{totalUnpaid.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="h-37 bg-backgroud"></div>

              {/* Filter pills */}
              <div className="bg-backgroud w-full px-4 py-3 ">
                <div className="max-w-xl mx-auto flex gap-2">
                  {["all", "unsettled", "settled"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors duration-150 ${
                        filter === f
                          ? "gradient-button text-white"
                          : "bg-white text-text-secondary"
                      }`}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ height: headerHeight }}></div>

            <div className="max-w-xl mx-auto w-full flex flex-col px-4 gap-4">
              <div className="flex flex-col gap-2">
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
                    <div className="w-20 h-20 relative">
                      <Image
                        src="/corgis/sad-corgi.svg"
                        fill
                        alt="Confused corgi"
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
                ) : filteredBills.length === 0 ? (
                  <div className="flex flex-col items-center text-center py-10 gap-2">
                    <div className="w-24 h-24 relative">
                      <Image
                        src="/corgis/sad-corgi.svg"
                        fill
                        alt="Curious corgi"
                      />
                    </div>
                    <p className="font-bold text-text-primary text-base">
                      No bills here
                    </p>
                    <p className="text-text-secondary text-sm max-w-55">
                      {filter === "all"
                        ? "Start splitting with friends. Create your first bill."
                        : `You have no ${filter} bills yet.`}
                    </p>
                  </div>
                ) : (
                  filteredBills.map((b) => (
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
                        <p className="font-bold text-base">
                          ₱{b.totalAmount.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex flex-row justify-between p-3">
                        <p className="text-xs text-text-secondary">
                          {b.peopleCount} people
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
                  ))
                )}
              </div>
            </div>
          </div>
        </PageContent>
      </Page>
      </ViewTransition>
    </>
  );
}
