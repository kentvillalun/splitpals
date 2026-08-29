"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { DesktopGuard } from "@/app/components/DesktopGuard";
import { Page } from "@/app/components/layout/Page";
import { PageContent } from "@/app/components/layout/PageContent";
import { Card } from "@/app/components/ui/Card";
import { supabase } from "@/app/lib/supabase";
import { haptic } from "@/app/lib/haptic";
import {
  UserCircleIcon,
  UserGroupIcon,
  QuestionMarkCircleIcon,
  BellIcon,
  MoonIcon,
  PencilIcon,
  CheckIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  ArrowLeftStartOnRectangleIcon,
  ArrowLeftIcon,
  ChevronRightIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function Toggle({ enabled, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`w-11 h-6 rounded-full transition-colors duration-200 relative shrink-0 ${
        enabled ? "bg-orange" : "bg-black/10"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [draftName, setDraftName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsLoading(false);
        return;
      }

      setUser(user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .single();

      setName(profile?.name ?? "");
      setIsLoading(false);
    };

    getUser();
  }, []);

  function startEditingName() {
    haptic.light();
    setDraftName(name);
    setIsEditingName(true);
  }

  async function saveName() {
    const trimmed = draftName.trim();
    if (!trimmed) {
      toast.error("Name can't be empty.");
      return;
    }

    setIsSavingName(true);
    const { error } = await supabase
      .from("profiles")
      .update({ name: trimmed })
      .eq("id", user.id);

    if (error) {
      haptic.error();
      toast.error("Couldn't update your name.");
      setIsSavingName(false);
      return;
    }

    haptic.success();
    setName(trimmed);
    setIsEditingName(false);
    setIsSavingName(false);
  }

  async function handleSignOut() {
    setSigningOut(true);
    haptic.medium();
    const { error } = await supabase.auth.signOut();

    if (error) {
      haptic.error();
      toast.error("Couldn't sign out. Please try again.");
      setSigningOut(false);
      return;
    }

    haptic.success();
    router.replace("../signup");
  }

  function openDeleteConfirm() {
    haptic.light();
    setDeleteConfirmOpen(true);
  }

  async function handleDeleteAccount() {
    setIsDeleting(true);
    haptic.medium();

    const response = await fetch("/api/delete-account", { method: "POST" });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      haptic.error();
      toast.error(result.error || "Couldn't delete your account. Please try again.");
      setIsDeleting(false);
      return;
    }

    // The auth user (and everything cascading off it) is already gone
    // server-side — this just clears the now-invalid local session.
    await supabase.auth.signOut();

    haptic.success();
    router.replace("../signup");
  }

  function toggleNotifications() {
    haptic.light();
    setNotifEnabled((prev) => !prev);
    // NOTE: UI-only for now — no push subscription wiring yet
  }

  function toggleDarkMode() {
    haptic.light();
    setDarkModeEnabled((prev) => !prev);
    // NOTE: UI-only for now — no theme system wired up yet
  }

  const menuItemClass =
    "flex items-center justify-between w-full px-4 py-3.5 active:bg-black/[0.02] transition-colors duration-150";

  return (
    <>
      <DesktopGuard />
      <Page className="bg-backgroud lg:hidden">
        <PageContent className="px-0">
          <div className="flex flex-col w-full gap-5">
            {/* Header */}
            <div className="gradient-button w-full px-4 pt-5 pb-6 rounded-b-3xl fixed z-50">
              <div className="max-w-xl mx-auto flex items-center justify-between">
                <button
                  onClick={() => router.back()}
                  className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors duration-150"
                >
                  <ArrowLeftIcon className="w-4 stroke-white" />
                </button>
                <p className="text-base font-semibold text-white">Settings</p>
                <div className="w-8 h-8" />
              </div>
            </div>

            <div className="h-19.25"></div>

            <div className="max-w-xl mx-auto w-full px-4 flex flex-col gap-5">
              {/* ── Account ── */}
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide px-1">
                  Account
                </p>
                <Card className="p-4! flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-orange-tint flex items-center justify-center shrink-0">
                    <UserCircleIcon className="w-7 text-orange" />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0 gap-0.5">
                    {isLoading ? (
                      <>
                        <Skeleton width={100} height={14} />
                        <Skeleton width={140} height={12} />
                      </>
                    ) : isEditingName ? (
                      <div className="flex items-center gap-2">
                        <input
                          autoFocus
                          value={draftName}
                          onChange={(e) => setDraftName(e.target.value)}
                          maxLength={30}
                          className="flex-1 text-sm font-semibold text-text-primary border-b border-orange/40 outline-none bg-transparent min-w-0"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveName();
                            if (e.key === "Escape") setIsEditingName(false);
                          }}
                        />
                        <button
                          onClick={saveName}
                          disabled={isSavingName}
                          className="shrink-0"
                        >
                          <CheckIcon className="w-4 text-orange" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-text-primary truncate">
                          {name || "Your name"}
                        </p>
                        <button onClick={startEditingName} className="shrink-0">
                          <PencilIcon className="w-3.5 text-text-secondary/60" />
                        </button>
                      </div>
                    )}
                    <p className="text-xs text-text-secondary truncate">
                      {user?.email}
                    </p>
                  </div>
                </Card>

                <Card className="p-0! divide-y divide-black/5">
                  <button
                    className={menuItemClass}
                    onClick={() => router.push("/settings/contacts")}
                  >
                    <div className="flex items-center gap-3">
                      <UserGroupIcon className="w-5 text-text-secondary" />
                      <p className="text-sm font-medium text-text-primary">
                        Manage contacts
                      </p>
                    </div>
                    <ChevronRightIcon className="w-4 text-text-secondary/50" />
                  </button>

                  <button
                    className={menuItemClass}
                    onClick={handleSignOut}
                    disabled={signingOut}
                  >
                    <div className="flex items-center gap-3">
                      <ArrowLeftStartOnRectangleIcon className="w-5 text-text-secondary" />
                      <p className="text-sm font-medium text-text-primary">
                        Sign out
                      </p>
                    </div>
                    {signingOut && (
                      <div className="w-4 h-4 border-2 border-text-secondary/30 border-t-text-secondary rounded-full animate-spin" />
                    )}
                  </button>
                </Card>
              </div>

              {/* ── Help ── */}
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide px-1">
                  Help
                </p>
                <Card className="p-0!">
                  <button
                    className={menuItemClass}
                    onClick={() => router.push("/settings/faqs")}
                  >
                    <div className="flex items-center gap-3">
                      <QuestionMarkCircleIcon className="w-5 text-text-secondary" />
                      <p className="text-sm font-medium text-text-primary">
                        FAQs
                      </p>
                    </div>
                    <ChevronRightIcon className="w-4 text-text-secondary/50" />
                  </button>
                </Card>
              </div>

              {/* ── Preferences ── */}
              {/* <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide px-1">
                  Preferences
                </p>
                <Card className="p-0! divide-y divide-black/5">
                  <div className={menuItemClass}>
                    <div className="flex items-center gap-3">
                      <BellIcon className="w-5 text-text-secondary" />
                      <p className="text-sm font-medium text-text-primary">
                        Push notifications
                      </p>
                    </div>
                    <Toggle enabled={notifEnabled} onToggle={toggleNotifications} />
                  </div>

                  <div className={menuItemClass}>
                    <div className="flex items-center gap-3">
                      <MoonIcon className="w-5 text-text-secondary" />
                      <p className="text-sm font-medium text-text-primary">
                        Dark mode
                      </p>
                    </div>
                    <Toggle enabled={darkModeEnabled} onToggle={toggleDarkMode} />
                  </div>
                </Card>
              </div> */}

              {/* ── About & Support ── */}
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide px-1">
                  About & Support
                </p>
                <Card className="p-0! divide-y divide-black/5">
                  <button
                    className={menuItemClass}
                    onClick={() => toast.info("Coming soon!")}
                  >
                    <div className="flex items-center gap-3">
                      <ChatBubbleLeftRightIcon className="w-5 text-text-secondary" />
                      <p className="text-sm font-medium text-text-primary">
                        Send feedback
                      </p>
                    </div>
                    <ChevronRightIcon className="w-4 text-text-secondary/50" />
                  </button>

                  <button
                    className={menuItemClass}
                    onClick={() => router.push("../terms")}
                  >
                    <div className="flex items-center gap-3">
                      <DocumentTextIcon className="w-5 text-text-secondary" />
                      <p className="text-sm font-medium text-text-primary">
                        Terms of service
                      </p>
                    </div>
                    <ChevronRightIcon className="w-4 text-text-secondary/50" />
                  </button>

                  <button
                    className={menuItemClass}
                    onClick={() => router.push("../privacy")}
                  >
                    <div className="flex items-center gap-3">
                      <ShieldCheckIcon className="w-5 text-text-secondary" />
                      <p className="text-sm font-medium text-text-primary">
                        Privacy policy
                      </p>
                    </div>
                    <ChevronRightIcon className="w-4 text-text-secondary/50" />
                  </button>
                </Card>
              </div>

              {/* ── Danger zone ── */}
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-red-500/70 uppercase tracking-wide px-1">
                  Danger zone
                </p>
                <Card className="p-0!">
                  <button className={menuItemClass} onClick={openDeleteConfirm}>
                    <div className="flex items-center gap-3">
                      <TrashIcon className="w-5 text-red-500" />
                      <p className="text-sm font-medium text-red-500">
                        Delete account
                      </p>
                    </div>
                  </button>
                </Card>
              </div>

              <p className="text-center text-xs text-text-secondary/60 pb-4">
                SplitPals v0.1.0
              </p>
            </div>
          </div>
        </PageContent>
      </Page>

      {/* Delete account confirmation — same bottom-sheet pattern as the
          "Abandon this bill?" / "Discard changes?" sheets on the bill pages */}
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
                      Delete your account?
                    </p>
                    <p className="text-text-secondary text-sm max-w-60">
                      This permanently deletes your bills, contacts, and
                      account. This cannot be undone.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 w-full items-center max-w-xl">
                    <button
                      onClick={handleDeleteAccount}
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
                      {isDeleting ? "Deleting..." : "Yes, delete my account"}
                    </button>
                    <button
                      className="text-text-secondary font-body text-xs"
                      disabled={isDeleting}
                      onClick={() => {
                        haptic.light();
                        setDeleteConfirmOpen(false);
                      }}
                    >
                      No, keep my account
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