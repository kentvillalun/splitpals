"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DesktopGuard } from "@/app/components/DesktopGuard";
import { Page } from "@/app/components/layout/Page";
import { PageContent } from "@/app/components/layout/PageContent";
import { Card } from "@/app/components/ui/Card";
import { supabase } from "@/app/lib/supabase";
import { haptic } from "@/app/lib/haptic";
import {
  UserCircleIcon,
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
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [draftName, setDraftName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

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
    router.replace("/onboarding");
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
            <div className="gradient-button w-full px-4 pt-5 pb-6 rounded-b-3xl fixed">
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

              {/* ── Preferences ── */}
              <div className="flex flex-col gap-2">
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
              </div>

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
                    onClick={() => toast.info("Coming soon!")}
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
                    onClick={() => toast.info("Coming soon!")}
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
                  <button
                    className={menuItemClass}
                    onClick={() => toast.info("Coming soon!")}
                  >
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
    </>
  );
}