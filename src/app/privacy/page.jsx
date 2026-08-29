

import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { BackButton } from "../components/navigation/BackButton";


export const metadata = {
  title: "Privacy Policy – SplitPals",
  description: "Privacy Policy for SplitPals.",
};

export default function PrivacyPolicyPage() {






  return (
    <div className="font-body min-h-screen bg-orange-pale">
      <div className="max-w-2xl mx-auto px-6 md:px-8 py-12 md:py-16">
        <BackButton />

        <h1 className="font-display text-3xl md:text-4xl font-extrabold text-dark mb-2 leading-tight">
          Privacy Policy for SplitPals
        </h1>
        <p className="text-sm text-dark/45 mb-10">
          Last updated: August 29, 2026
        </p>

        <div className="flex flex-col gap-9 text-base text-dark/70 leading-relaxed">
          <section>
            <h2 className="font-display text-xl font-bold text-dark mb-3">
              1. Introduction
            </h2>
            <p>
              SplitPals ("we," "our," "us") is a bill-splitting app built for
              friend groups in the Philippines. This Privacy Policy explains
              what information we collect when you use SplitPals, how we use
              it, and what rights you have over your data under the
              Philippine Data Privacy Act of 2012 (DPA).
            </p>
            <p className="mt-3">
              By using SplitPals, you agree to the practices described in
              this policy.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-dark mb-3">
              2. Information We Collect
            </h2>
            <p>When you sign up and use SplitPals, we collect:</p>
            <ul className="list-disc marker:text-orange pl-5 flex flex-col gap-2 mt-3">
              <li>
                <strong className="text-dark">
                  Name and email address
                </strong>{" "}
                — your email is obtained through Google Sign-In when you
                create an account. During setup, you'll be asked what name
                you'd like to be called across the app, and you can update
                this anytime later in Settings.
              </li>
              <li>
                <strong className="text-dark">Bill data</strong> —
                information you create while using the app, including bill
                names, the people you split bills with, item names, and
                prices.
              </li>
            </ul>
            <p className="mt-3">
              We do not collect payment information. SplitPals does not
              process payments — it only helps you calculate and share who
              owes what.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-dark mb-3">
              3. How We Use Your Information
            </h2>
            <p>
              We use your information only to operate the core features of
              SplitPals:
            </p>
            <ul className="list-disc marker:text-orange pl-5 flex flex-col gap-2 mt-3">
              <li>To create and manage your account</li>
              <li>
                To let you create, edit, and view bills you've split with
                others
              </li>
              <li>To display your name to you within the app</li>
            </ul>
            <p className="mt-3">
              We do not use your data for advertising, and we do not sell
              your information to third parties.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-dark mb-3">
              4. Third-Party Services
            </h2>
            <p>
              SplitPals relies on the following third-party services to
              operate:
            </p>
            <ul className="list-disc marker:text-orange pl-5 flex flex-col gap-2 mt-3">
              <li>
                <strong className="text-dark">Google Sign-In</strong> — for
                authentication. We do not receive or store your Google
                password.
              </li>
              <li>
                <strong className="text-dark">Supabase</strong> — our
                database and authentication provider, which stores your
                account and bill data.
              </li>
              <li>
                <strong className="text-dark">Vercel</strong> — our hosting
                provider, which serves the app to your device.
              </li>
            </ul>
            <p className="mt-3">
              These providers may process your data on our behalf as part of
              running the app, but they do not have independent rights to
              use your data beyond that purpose.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-dark mb-3">
              5. Data Storage and Security
            </h2>
            <p>
              Your data is stored in a Supabase-managed database with Row
              Level Security (RLS) enabled, meaning your bill data can only
              be accessed by your own account. We take reasonable technical
              measures to protect your data, but no system is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-dark mb-3">
              6. Your Rights Under the Data Privacy Act
            </h2>
            <p>As a user based in the Philippines, you have the right to:</p>
            <ul className="list-disc marker:text-orange pl-5 flex flex-col gap-2 mt-3">
              <li>Access the personal data we hold about you</li>
              <li>
                Correct inaccurate data (e.g., updating your name in
                Settings)
              </li>
              <li>Request deletion of your account and associated data</li>
              <li>
                File a complaint with the National Privacy Commission (NPC)
                if you believe your data rights have been violated
              </li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact us using the details
              in Section 9.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-dark mb-3">
              7. Data Retention and Account Deletion
            </h2>
            <p>
              We keep your data for as long as your account remains active. You can delete your account and all associated data at any time from Settings - this is permanent and cannot be undone.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-dark mb-3">
              8. Children's Privacy
            </h2>
            <p>
              SplitPals is not directed at children under 13. We do not
              knowingly collect personal information from children under
              13. If you believe a child has provided us with personal data,
              please contact us so we can remove it.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-dark mb-3">
              9. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy as SplitPals grows. If we
              make significant changes, we'll update the "Last updated" date
              above. Continued use of the app after changes means you accept
              the updated policy.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-dark mb-3">
              10. Contact Us
            </h2>
            <p>
              If you have questions, concerns, or requests regarding your
              data, email us at:
            </p>
            <p className="mt-2">
              <a
                href="mailto:villalunkent03@gmail.com"
                className="font-semibold text-orange hover:underline"
              >
                villalunkent03@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
