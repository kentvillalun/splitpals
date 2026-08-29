"use client";

import { useState, ViewTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { DesktopGuard } from "@/app/components/DesktopGuard";
import { Page } from "@/app/components/layout/Page";
import { PageContent } from "@/app/components/layout/PageContent";
import { PageHeader } from "@/app/components/layout/PageHeader";
import { Card } from "@/app/components/ui/Card";
import { hapticTrigger } from "ios-haptics";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

const FAQS = [
  {
    question: "How do contacts work?",
    answer:
      "Contacts are added automatically the first time you split a bill with someone new. You don't need to add them manually — just type their name once, and they'll show up as a shortcut next time.",
  },
  {
    question: 'What does "YOU" mean on a bill?',
    answer:
      '"YOU" marks your own card in a bill you created. Your friends will see your real name instead of "YOU" when you share the receipt with them.',
  },
  {
    question: "Can I split one item between people?",
    answer:
      "Yes. Tap any item to choose who's sharing it, and the cost splits evenly between everyone selected. You can add or remove people from a split at any time before saving.",
  },
  {
    question: "How does receipt scanning work?",
    answer:
      "Snap a photo or upload one, and SplitPals reads the items and prices for you. It's not always perfect, so double-check before saving — you can edit anything it gets wrong.",
  },
  {
    question: "Why is there a daily scan limit?",
    answer:
      "Reading each receipt costs a small fee behind the scenes, so we cap scans per day to keep the feature free and sustainable. You can always add items manually with no limit.",
  },
  {
    question: "If I rename or delete a contact, does it change my past bills?",
    answer:
      "No. Renaming or deleting a contact only affects your saved contacts list going forward — names on bills you've already created stay exactly as they were.",
  },
  {
    question: "What happens if I delete my account?",
    answer:
      "All your bills, contacts, and account info are permanently deleted. This can't be undone, so make sure you've saved anything you need first.",
  },
  {
    question: "Is my bill data private?",
    answer:
      "Yes. Only you can see your bills unless you choose to share them. Nobody else, including other SplitPals users, can access your data.",
  },
];

export default function FaqsPage() {
  const router = useRouter();
  // Multiple rows can be open at once — a set of open indexes rather than
  // a single "which one is open" value.
  const [openIndexes, setOpenIndexes] = useState([]);

  function toggle(index) {
    setOpenIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  }

  return (
    <>
      <DesktopGuard />
      <ViewTransition
        enter={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
        exit={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
        default="none"
      >
      <Page className="bg-backgroud lg:hidden">
        <PageContent className="px-0 pb-30!" withBottomNav={false}>
          <div className="flex flex-col w-full gap-5">
            <PageHeader
              onBack={() =>
                router.push("/settings", { transitionTypes: ["nav-back"] })
              }
            >
              <p className="text-base font-semibold text-white truncate flex-1 text-center">
                FAQs
              </p>
            </PageHeader>

            <div className="h-23.5" />

            <div className="max-w-xl mx-auto w-full px-4 flex flex-col gap-3 pb-10 -mt-5">
              {FAQS.map((faq, index) => {
                const isOpen = openIndexes.includes(index);

                return (
                  <Card key={faq.question} className="p-0! overflow-hidden">
                    <button
                      ref={hapticTrigger}
                      onClick={() => toggle(index)}
                      className="flex items-center justify-between w-full px-4 py-3.5 gap-3 text-left active:bg-black/2 transition-colors duration-150"
                    >
                      <p className="text-sm font-semibold text-text-primary">
                        {faq.question}
                      </p>
                      <ChevronDownIcon
                        className={`w-4 text-text-secondary/60 shrink-0 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="overflow-hidden"
                        >
                          <p className="px-4 pb-4 text-[13px] text-text-secondary leading-[1.6]">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                );
              })}
            </div>
          </div>
        </PageContent>
      </Page>
      </ViewTransition>
    </>
  );
}
