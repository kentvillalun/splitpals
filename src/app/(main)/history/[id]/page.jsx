"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { DesktopGuard } from "@/app/components/DesktopGuard";
import { Page } from "@/app/components/layout/Page";
import { PageContent } from "@/app/components/layout/PageContent";
import { useFetch } from "@/app/lib/hooks/useFetch";
import { formatDate } from "@/app/lib/formatDate";
import { supabase } from "@/app/lib/supabase";
import { haptic } from "@/app/lib/haptic";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeftIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Receipt } from "@/app/components/ui/Receipt";
import { toast } from "sonner";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Image from "next/image";

export default function HistoryDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [deleteSheetOpen, setDeleteSheetOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  function handleDeleteTap() {
    haptic.light();
    setDeleteSheetOpen(true);
  }

  async function handleConfirmDelete() {
    setIsDeleting(true);
    haptic.medium();

    const { error } = await supabase.from("bills").delete().eq("id", id);

    if (error) {
      haptic.error();
      toast.error("Couldn't delete the bill. Please try again.");
      setIsDeleting(false);
      return;
    }

    haptic.success();
    toast.success("Bill deleted.");
    router.push("/dashboard");
  }

  return (
    <>
      <DesktopGuard />
      <Page className="bg-backgroud">
        <PageContent className="px-0">
          <div className="flex flex-col w-full gap-5">
            {/* Header */}
            <div className="gradient-button w-full px-4 pt-5 pb-6 rounded-b-3xl">
              <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => router.push("/dashboard")}
                    className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors duration-150 shrink-0"
                  >
                    <ArrowLeftIcon className="w-4 stroke-white" />
                  </button>
                  <p className="text-base font-semibold text-white truncate">
                    {isLoading ? "Loading..." : bill?.name ?? "Bill"}
                  </p>
                </div>

                {!isLoading && bill && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => router.push(`/bills/edit/${id}`)}
                      className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors duration-150"
                    >
                      <PencilIcon className="w-4 stroke-white" />
                    </button>
                    <button
                      onClick={handleDeleteTap}
                      className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors duration-150"
                    >
                      <TrashIcon className="w-4 stroke-white" />
                    </button>
                  </div>
                )}
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

      {mounted &&
        createPortal(
          <AnimatePresence>
            {deleteSheetOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{
                    opacity: 0,
                    transition: { duration: 0.15, ease: "easeIn" },
                  }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="fixed inset-0 z-40 bg-black/40 font-body"
                  onClick={() => !isDeleting && setDeleteSheetOpen(false)}
                />
                <motion.div
                  className="bg-white h-auto w-full flex flex-col items-center fixed bottom-0 rounded-t-4xl gap-6 pt-4 px-5 pb-17 z-50"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{
                    y: "100%",
                    transition: { duration: 0.25, ease: "easeIn" },
                  }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  drag={isDeleting ? false : "y"}
                  dragConstraints={{ top: 0 }}
                  dragElastic={{ top: 0, bottom: 0.2 }}
                  onDragEnd={(_, info) => {
                    if (!isDeleting && info.offset.y > 100)
                      setDeleteSheetOpen(false);
                  }}
                >
                  <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-1" />
                  <div className="flex flex-col gap-1 items-center text-center">
                    <p className="font-display text-xl font-bold">
                      Delete this bill?
                    </p>
                    <p className="text-text-secondary text-sm max-w-60">
                      This will permanently delete "{bill?.name}" and
                      everyone's orders. This can't be undone.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 w-full items-center max-w-xl">
                    <button
                      onClick={handleConfirmDelete}
                      disabled={isDeleting}
                      className="flex flex-row items-center justify-center w-full transition-all duration-200 ease-in-out hover:opacity-90 active:scale-95 rounded-2xl py-4 gap-2 font-bold text-white font-body disabled:opacity-60 bg-red-500"
                    >
                      {isDeleting && (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      )}
                      {isDeleting ? "Deleting..." : "Yes, delete"}
                    </button>
                    <button
                      className="text-text-secondary font-body text-xs"
                      disabled={isDeleting}
                      onClick={() => {
                        haptic.light();
                        setDeleteSheetOpen(false);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}