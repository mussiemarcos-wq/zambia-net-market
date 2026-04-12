import { Metadata } from "next";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Terms of Service - ${APP_NAME}`,
};

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: April 1, 2026</p>

      <div className="prose prose-gray max-w-none space-y-8">
        {/* 1 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
          <p className="text-gray-700 leading-relaxed">
            By accessing or using {APP_NAME} (the &quot;Platform&quot;), you agree to be bound by these Terms of Service
            (&quot;Terms&quot;). If you do not agree to all of these Terms, you may not access or use the Platform. We reserve
            the right to update these Terms at any time. Continued use of the Platform after changes constitutes
            acceptance of the revised Terms.
          </p>
        </section>

        {/* 2 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">2. User Accounts</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>You must be at least 18 years of age to create an account.</li>
            <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
            <li>You must provide accurate and complete registration information, including a valid Zambian phone number.</li>
            <li>One person may maintain only one active account. Duplicate accounts may be suspended without notice.</li>
            <li>You are responsible for all activities that occur under your account.</li>
          </ul>
        </section>

        {/* 3 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Listing Rules</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>All listings must be for goods or services that are legal to sell in the Republic of Zambia.</li>
            <li>Listings must contain accurate descriptions, genuine photographs, and truthful pricing.</li>
            <li>Duplicate listings for the same item are not permitted.</li>
            <li>Sellers must respond to buyer enquiries in a timely and professional manner.</li>
            <li>Listings that violate these Terms may be removed without prior notice, and repeat offenders risk account suspension.</li>
          </ul>
        </section>

        {/* 4 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Prohibited Items and Conduct</h2>
          <p className="text-gray-700 mb-2">The following items and activities are strictly prohibited on the Platform:</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Counterfeit, stolen, or illegally obtained goods.</li>
            <li>Firearms, ammunition, explosives, or regulated weapons.</li>
            <li>Controlled substances, drugs, or drug paraphernalia.</li>
            <li>Wildlife products, endangered species, or ivory.</li>
            <li>Fraudulent schemes, pyramid schemes, or misleading offers.</li>
            <li>Adult content, hate speech, or content that incites violence.</li>
            <li>Any item or service prohibited under the laws of Zambia.</li>
          </ul>
        </section>

        {/* 5 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Payments and Fees</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Basic listing on the Platform is free, subject to listing limits for free accounts.</li>
            <li>Premium services such as boosted listings, featured placements, and business subscriptions are available for a fee payable in Zambian Kwacha (ZMW).</li>
            <li>All payments are processed through our authorised payment provider. {APP_NAME} does not store your payment card details.</li>
            <li>Fees are non-refundable except where required by applicable law or at our sole discretion.</li>
            <li>Transactions between buyers and sellers are conducted directly between the parties. {APP_NAME} is not a party to any sale and does not handle payments between users.</li>
          </ul>
        </section>

        {/* 6 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Intellectual Property</h2>
          <p className="text-gray-700 leading-relaxed">
            All content, trademarks, logos, and software on the Platform are the property of {APP_NAME} or its licensors.
            By posting content on the Platform, you grant us a non-exclusive, royalty-free licence to display and
            distribute that content in connection with the operation of the Platform. You retain ownership of any
            original content you create and upload.
          </p>
        </section>

        {/* 7 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Limitation of Liability</h2>
          <p className="text-gray-700 leading-relaxed">
            {APP_NAME} provides a platform for connecting buyers and sellers. We do not guarantee the quality,
            safety, legality, or availability of any item or service listed. To the fullest extent permitted by law,
            {APP_NAME} shall not be liable for any direct, indirect, incidental, consequential, or special damages
            arising from your use of the Platform, including but not limited to losses resulting from transactions
            between users.
          </p>
        </section>

        {/* 8 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Dispute Resolution</h2>
          <p className="text-gray-700 leading-relaxed">
            In the event of a dispute between users, we encourage parties to resolve matters amicably. {APP_NAME} may,
            at its discretion, assist in mediation but is under no obligation to do so. If a dispute cannot be resolved
            informally, it shall be referred to arbitration or the appropriate courts in Lusaka, Zambia.
          </p>
        </section>

        {/* 9 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Termination</h2>
          <p className="text-gray-700 leading-relaxed">
            We reserve the right to suspend or terminate your account at any time, with or without cause, including
            for violation of these Terms. Upon termination, your right to use the Platform ceases immediately. Any
            active paid subscriptions will not be refunded upon termination for cause. You may delete your account
            at any time by contacting our support team.
          </p>
        </section>

        {/* 10 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Governing Law</h2>
          <p className="text-gray-700 leading-relaxed">
            These Terms shall be governed by and construed in accordance with the Laws of the Republic of Zambia.
            Any legal proceedings arising from or relating to these Terms shall be subject to the exclusive
            jurisdiction of the courts of Zambia.
          </p>
        </section>

        {/* 11 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Contact Information</h2>
          <p className="text-gray-700 leading-relaxed">
            If you have any questions about these Terms, please contact us:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-1 mt-2">
            <li>Email: <a href="mailto:support@zambia.net" className="text-blue-600 hover:underline">support@zambia.net</a></li>
            <li>Phone: +260 97 0000000</li>
            <li>
              Visit our{" "}
              <Link href="/contact" className="text-blue-600 hover:underline">
                Contact Page
              </Link>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
