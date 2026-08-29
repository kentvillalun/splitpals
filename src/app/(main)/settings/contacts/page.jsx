"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { DesktopGuard } from "@/app/components/DesktopGuard";
import { Page } from "@/app/components/layout/Page";
import { PageContent } from "@/app/components/layout/PageContent";
import { PageHeader } from "@/app/components/layout/PageHeader";
import { Card } from "@/app/components/ui/Card";
import { supabase } from "@/app/lib/supabase";
import { haptic } from "@/app/lib/haptic";
import {
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function ContactsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [editingContactId, setEditingContactId] = useState(null);
  const [draftName, setDraftName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Same client-side fetch pattern as AssignItemsPage's fetchContacts.
  useEffect(() => {
    async function fetchContacts() {
      setIsLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("contacts")
        .select("id, name")
        .eq("user_id", user.id)
        .order("name");

      if (!error && data) setContacts(data);
      setIsLoading(false);
    }

    fetchContacts();
  }, []);

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  // ── Rename ──
  function startEditingContact(contact) {
    haptic.light();
    setEditingContactId(contact.id);
    setDraftName(contact.name);
  }

  async function saveContactName(contactId) {
    const trimmed = draftName.trim();
    if (!trimmed) {
      toast.error("Name can't be empty.");
      return;
    }

    setIsSavingName(true);
    const { error } = await supabase
      .from("contacts")
      .update({ name: trimmed })
      .eq("id", contactId);

    if (error) {
      haptic.error();
      toast.error("Couldn't update that contact.");
      setIsSavingName(false);
      return;
    }

    haptic.success();
    setContacts((prev) =>
      prev
        .map((c) => (c.id === contactId ? { ...c, name: trimmed } : c))
        .sort((a, b) => a.name.localeCompare(b.name))
    );
    setEditingContactId(null);
    setIsSavingName(false);
  }

  // ── Delete ──
  function openDeleteConfirm(contact) {
    haptic.light();
    setDeleteTarget(contact);
    setDeleteConfirmOpen(true);
  }

  async function handleDeleteContact() {
    if (!deleteTarget) return;

    setIsDeleting(true);
    haptic.medium();

    const { error } = await supabase
      .from("contacts")
      .delete()
      .eq("id", deleteTarget.id);

    if (error) {
      haptic.error();
      toast.error("Couldn't delete that contact. Please try again.");
      setIsDeleting(false);
      return;
    }

    haptic.success();
    setContacts((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    setIsDeleting(false);
    setDeleteConfirmOpen(false);
    setDeleteTarget(null);
  }

  return (
    <>
      <DesktopGuard />
      <Page className="bg-backgroud lg:hidden">
        <PageContent className="px-0" withBottomNav={false}>
          <div className="flex flex-col w-full gap-5">
            <PageHeader onBack={() => router.back()}>
              <p className="text-base font-semibold text-white truncate flex-1 text-center">
                Contacts
              </p>
            </PageHeader>

            <div className="h-23.5" />

            <div className="max-w-xl mx-auto w-full px-4 flex flex-col gap-4 pb-10 -mt-5">
              {isLoading ? (
                <Card className="p-0! divide-y divide-black/5">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3.5">
                      <Skeleton circle width={40} height={40} />
                      <Skeleton width={120} height={14} />
                    </div>
                  ))}
                </Card>
              ) : contacts.length === 0 ? (
                <div className="flex flex-col items-center text-center py-10 gap-2">
                  <div className="w-24 h-24 relative">
                    <Image
                      src="/corgis/sad-corgi.svg"
                      fill
                      alt="Curious corgi"
                    />
                  </div>
                  <p className="font-bold text-text-primary text-base">
                    No contacts yet
                  </p>
                  <p className="text-text-secondary text-sm max-w-55">
                    Contacts are added automatically the first time you split
                    a bill with someone new — no need to add them here.
                  </p>
                </div>
              ) : (
                <>
                  {contacts.length > 5 && (
                    <div className="flex items-center gap-2 border border-black/10 rounded-xl px-3 py-2.5 bg-white">
                      <MagnifyingGlassIcon className="w-4 text-text-secondary/50 shrink-0" />
                      <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search contacts"
                        className="flex-1 text-sm outline-none min-w-0"
                      />
                    </div>
                  )}

                  <Card className="p-0! divide-y divide-black/5">
                    {filteredContacts.length === 0 ? (
                      <p className="text-center text-sm text-text-secondary py-6">
                        No contacts match "{searchQuery.trim()}"
                      </p>
                    ) : (
                      filteredContacts.map((contact) => (
                        <div
                          key={contact.id}
                          className="flex items-center gap-3 px-4 py-3.5"
                        >
                          <div className="w-10 h-10 rounded-full bg-orange-tint flex items-center justify-center shrink-0">
                            <span className="text-orange font-semibold text-sm">
                              {contact.name.charAt(0).toUpperCase()}
                            </span>
                          </div>

                          {editingContactId === contact.id ? (
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <input
                                autoFocus
                                value={draftName}
                                onChange={(e) => setDraftName(e.target.value)}
                                maxLength={40}
                                className="flex-1 text-sm font-medium text-text-primary border-b border-orange/40 outline-none bg-transparent min-w-0"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") saveContactName(contact.id);
                                  if (e.key === "Escape") setEditingContactId(null);
                                }}
                              />
                              <button
                                onClick={() => saveContactName(contact.id)}
                                disabled={isSavingName}
                                className="shrink-0"
                              >
                                <CheckIcon className="w-4 text-orange" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <p className="flex-1 min-w-0 text-sm font-medium text-text-primary truncate">
                                {contact.name}
                              </p>
                              <div className="flex items-center gap-3 shrink-0">
                                <button onClick={() => startEditingContact(contact)}>
                                  <PencilIcon className="w-4 text-text-secondary/60" />
                                </button>
                                <button onClick={() => openDeleteConfirm(contact)}>
                                  <TrashIcon className="w-4 text-text-secondary/60" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))
                    )}
                  </Card>

                  <p className="text-center text-xs text-text-secondary/60">
                    {filteredContacts.length} contact
                    {filteredContacts.length === 1 ? "" : "s"}
                  </p>
                </>
              )}
            </div>
          </div>
        </PageContent>
      </Page>

      {/* Delete contact confirmation — same bottom-sheet pattern used for
          "Delete account?" / "Abandon this bill?" elsewhere */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {deleteConfirmOpen && (
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
                  onClick={() => !isDeleting && setDeleteConfirmOpen(false)}
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
                    if (!isDeleting && info.offset.y > 100) setDeleteConfirmOpen(false);
                  }}
                >
                  <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-1" />

                  <div className="flex flex-col gap-1 items-center text-center">
                    <p className="font-display text-xl font-bold">
                      Delete {deleteTarget?.name}?
                    </p>
                    <p className="text-text-secondary text-sm max-w-60">
                      They'll still appear in bills you've already split with
                      them — this only removes them from your saved contacts.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 w-full items-center max-w-xl">
                    <button
                      onClick={handleDeleteContact}
                      disabled={isDeleting}
                      className="flex flex-row items-center justify-center w-full transition-all duration-200 ease-in-out hover:opacity-90 active:scale-95 rounded-2xl py-4 gap-2 font-bold text-white font-body disabled:opacity-60"
                      style={{
                        background: "linear-gradient(to bottom, #2a2a2a, #1a1a1a)",
                        borderBottom: "1.5px solid #0a0a0a",
                      }}
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
                        setDeleteConfirmOpen(false);
                      }}
                    >
                      No, keep them
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
