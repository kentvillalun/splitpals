"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DesktopGuard } from "@/app/components/DesktopGuard";
import { Page } from "@/app/components/layout/Page";
import { PageContent } from "@/app/components/layout/PageContent";
import { useFetch } from "@/app/lib/hooks/useFetch";
import { formatDate } from "@/app/lib/formatDate";
import { supabase } from "@/app/lib/supabase";
import { haptic } from "@/app/lib/haptic";
import { Receipt } from "@/app/components/ui/Receipt";
import { useCurrentUser } from "@/app/lib/hooks/useCurrentUser";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Image from "next/image";

export default function ReceiptPage() {
  return (
    <Suspense fallback={null}>
      <ReceiptPageContent />
    </Suspense>
  );
}

function ReceiptPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const billId = searchParams.get("id");
  const currentUser = useCurrentUser();

  const {
    data: bills,
    isLoading,
    isError,
    handleRefetch,
    setData,
  } = useFetch({
    table: "bills",
    filters: billId ? { id: billId } : {},
    select: `id, name, created_at, persons (id, name, is_paid, user_id, items(id, name, price))`,
  });

  const bill = bills?.[0];

  async function handleTogglePaid(personId, nextValue) {
    const { error } = await supabase
      .from("persons")
      .update({ is_paid: nextValue })
      .eq("id", personId);

    if (error) throw error;

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

  function handleDone() {
    haptic.medium();
    router.push("/dashboard");
  }

  if (!billId) {
    return (
      <>
        <DesktopGuard />
        <Page className="bg-backgroud lg:hidden">
          <PageContent className="px-4 flex flex-col items-center text-center py-20 gap-2">
            <p className="font-bold text-text-primary text-base">
              No bill specified
            </p>
            <p className="text-text-secondary text-sm max-w-55">
              We couldn't find which bill to show.
            </p>
            <button
              className="text-sm font-semibold text-primary mt-1"
              onClick={() => router.push("/dashboard")}
            >
              Back to dashboard
            </button>
          </PageContent>
        </Page>
      </>
    );
  }

  return (
    <>
      <DesktopGuard />
      <Page className="bg-backgroud lg:hidden">
        <PageContent className="px-0" withBottomNav={false}>
          <div className="flex flex-col w-full gap-5">
            {/* Header — fixed at top */}
            <div className="gradient-button w-full px-4 pt-5 pb-6 rounded-b-3xl fixed top-0 left-0 right-0 z-30">
              <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
                <p className="text-base font-semibold text-white truncate">
                  {isLoading ? "Loading..." : bill?.name ?? "Bill"}
                </p>
                <button
                  onClick={handleDone}
                  className="px-3 py-1.5 rounded-full bg-white/15 text-white text-sm font-semibold hover:bg-white/25 transition-colors duration-150 shrink-0"
                >
                  Done
                </button>
              </div>
            </div>

            {/* Spacer so content doesn't sit under the fixed header */}
            <div className="h-22" />

            <div className="max-w-xl mx-auto w-full px-4 -mt-4">
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
                  <button
                    className="text-sm font-semibold text-primary mt-1"
                    onClick={() => router.push("/dashboard")}
                  >
                    Back to dashboard
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-center text-sm text-text-secondary mb-3">
                    Your bill is saved! Share it with your friends below.
                  </p>
                  <Receipt
                    billName={bill.name}
                    date={formatDate(bill.created_at)}
                    persons={bill.persons ?? []}
                    currentUserId={currentUser?.id}
                    onTogglePaid={handleTogglePaid}
                  />
                </>
              )}
            </div>
          </div>
        </PageContent>
      </Page>
    </>
  );
}