import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { BackButton } from "../components/navigation/BackButton";

export const metadata = {
  title: "Terms of Service – SplitPals",
  description: "Terms of Service for SplitPals.",
};

export default function TermsOfServicePage() {
  return (
    <div className="font-body min-h-screen bg-orange-pale">
      <div className="max-w-2xl mx-auto px-6 md:px-8 py-12 md:py-16">
        <BackButton />

        <h1 className="font-display text-3xl md:text-4xl font-extrabold text-dark mb-2 leading-tight">
          Terms of Service for SplitPals
        </h1>
        <p className="text-sm text-dark/45 mb-10">
          Last updated: August 29, 2026
        </p>

        <div className="flex flex-col gap-9 text-base text-dark/70 leading-relaxed">
          <section>
            <h2 className="font-display text-xl font-bold text-dark mb-3">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using SplitPals, you agree to be bound by
              these Terms of Service. If you do not agree, please do not use
              the app.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-dark mb-3">
              2. Description of Service
            </h2>
            <p>
              SplitPals is a bill-splitting tool for friend groups. It helps
              you track shared expenses, calculate how much each person
              owes, and share a summary with your friends. SplitPals is a
              calculation and organization tool only — it does not process,
              hold, transfer, or guarantee any payments.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-dark mb-3">
              3. Account Registration
            </h2>
            <p>
              SplitPals uses Google Sign-In for authentication. You're
              responsible for maintaining the security of the Google account
              linked to SplitPals. If you believe your account has been
              accessed without your permission, please contact us.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-dark mb-3">
              4. User Conduct
            </h2>
            <p>When using SplitPals, you agree not to:</p>
            <ul className="list-disc marker:text-orange pl-5 flex flex-col gap-2 mt-3">
              <li>Use the app for any illegal purpose</li>
              <li>Attempt to access accounts or data that aren't yours</li>
              <li>Interfere with or disrupt the app's functionality</li>
              <li>Use the app to harass or defraud others</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-dark mb-3">
              5. User Content
            </h2>
            <p>
              "User Content" refers to the bill names, person names, item
              names, and amounts you enter into SplitPals. You retain
              ownership of your User Content. By using SplitPals, you give
              us permission to store and display your User Content back to
              you and to the people you've added to your bills, solely for
              the purpose of operating the app.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-dark mb-3">
              6. No Payment Processing
            </h2>
            <p>
              SplitPals only calculates and displays who owes what based on
              the information you enter. SplitPals does not process,
              verify, guarantee, or facilitate any actual transfer of money.
              Any payment or settlement between users (e.g., via GCash or
              other means) happens entirely outside the app, between the
              individuals involved. SplitPals is not responsible for
              disputes, unpaid amounts, or incorrect entries between users.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-dark mb-3">
              7. Service Availability
            </h2>
            <p>
              We aim to keep SplitPals available and working, but we don't
              guarantee uninterrupted access. Features may change, and the
              app may be updated, modified, or discontinued at any time.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-dark mb-3">
              8. Limitation of Liability
            </h2>
            <p>
              SplitPals is provided "as is." We are not liable for any
              financial disputes, losses, or damages arising from your use
              of the app, including disagreements between users over bill
              amounts or unpaid balances. You are responsible for verifying
              amounts and settling payments directly with the people you
              split bills with.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-dark mb-3">
              9. Termination
            </h2>
            <p>
              You may stop using SplitPals and delete your account at any time from Settings, or by contacting us (see Section 12). We may suspend or
              terminate accounts that violate these Terms, particularly
              Section 4 (User Conduct).
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-dark mb-3">
              10. Changes to These Terms
            </h2>
            <p>
              We may update these Terms as SplitPals grows. If we make
              significant changes, we'll update the "Last updated" date
              above. Continued use of the app after changes means you
              accept the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-dark mb-3">
              11. Governing Law
            </h2>
            <p>
              These Terms are governed by the laws of the Republic of the
              Philippines.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-dark mb-3">
              12. Contact Us
            </h2>
            <p>
              If you have questions about these Terms, email us at:
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
