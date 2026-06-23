"use client";

import { useParams, useRouter } from "next/navigation";
import { DesktopGuard } from "@/app/components/DesktopGuard";
import { Page } from "@/app/components/layout/Page";
import { PageContent } from "@/app/components/layout/PageContent";
import { useFetch } from "@/app/lib/hooks/useFetch";
import { formatDate } from "@/app/lib/formatDate";
import { supabase } from "@/app/lib/supabase";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Receipt } from "@/app/components/ui/Receipt";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Image from "next/image";

export default function HistoryDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const {
    data: bills,
    isLoading,
    isError,
    handleRefetch,
    setData,
  } = useFetch({
    table: "bills",
    filters: { id },
    select: `id, name, created_at, persons (id, name, is_paid, items(id, name, price))`,
  });

  const bill = bills?.[0];

  async function handleTogglePaid(personId, nextValue) {
    const { error } = await supabase
      .from("persons")
      .update({ is_paid: nextValue })
      .eq("id", personId);

    if (error) throw error;

    // optimistic local update so the UI reflects the change immediately
    setData((prev) =>
      prev.map((b) =>
        b.id !== bill.id
          ? b
          : {
              ...b,
              persons: b.persons.map((p) =>
                p.id === personId ? { ...p, is_paid: nextValue } : p
              ),
            }
      )
    );
  }

  return (
    <>
      <DesktopGuard />
      <Page className="bg-backgroud">
        <PageContent className="px-0">
          <div className="flex flex-col w-full gap-5">
            {/* Header */}
            <div className="gradient-button w-full px-4 pt-5 pb-6 rounded-b-3xl">
              <div className="max-w-xl mx-auto flex items-center gap-3">
                <button
                  onClick={() => router.back()}
                  className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors duration-150"
                >
                  <ArrowLeftIcon className="w-4 stroke-white" />
                </button>
                <p className="text-base font-semibold text-white">
                  {isLoading ? "Loading..." : bill?.name ?? "Bill"}
                </p>
              </div>
            </div>

            <div className="max-w-xl mx-auto w-full px-4">
              {isLoading ? (
                <div className="bg-white rounded-3xl p-5 flex flex-col gap-3">
                  <Skeleton height={20} width={120} className="mx-auto" />
                  <Skeleton height={14} width={180} className="mx-auto" />
                  <Skeleton height={60} />
                  <Skeleton height={60} />
                </div>
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
                    We couldn't load this bill. Check your connection and try
                    again.
                  </p>
                  <button
                    className="text-sm font-semibold text-primary mt-1"
                    onClick={() => handleRefetch()}
                  >
                    Try again
                  </button>
                </div>
              ) : !bill ? (
                <div className="flex flex-col items-center text-center py-10 gap-2">
                  <p className="font-bold text-text-primary text-base">
                    Bill not found
                  </p>
                  <p className="text-text-secondary text-sm max-w-55">
                    This bill may have been deleted.
                  </p>
                </div>
              ) : (
                <Receipt
                  billName={bill.name}
                  date={formatDate(bill.created_at)}
                  persons={bill.persons ?? []}
                  onTogglePaid={handleTogglePaid}
                />
              )}
            </div>
          </div>
        </PageContent>
      </Page>
    </>
  );
}