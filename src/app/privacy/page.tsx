import { Metadata } from "next";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Privacy Policy - ${APP_NAME}`,
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: April 1, 2026</p>

      <div className="prose prose-gray max-w-none space-y-8">
        <p className="text-gray-700 leading-relaxed">
          At {APP_NAME}, we are committed to protecting your privacy and personal data. This Privacy Policy explains
          how we collect, use, store, and share your information when you use our platform.
        </p>

        {/* 1 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
          <h3 className="text-lg font-medium text-gray-800 mb-2">1.1 Information You Provide</h3>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li><strong>Account information:</strong> Name, phone number, email address, password, and location.</li>
            <li><strong>Profile information:</strong> Avatar photo, bio, and business details.</li>
            <li><strong>Listing information:</strong> Item descriptions, photos, prices, and categories.</li>
            <li><strong>Communication data:</strong> Messages sent through our contact form or support channels.</li>
          </ul>

          <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">1.2 Information Collected Automatically</h3>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li><strong>Usage data:</strong> Pages visited, search queries, listings viewed, and interaction patterns.</li>
            <li><strong>Device information:</strong> Browser type, operating system, screen resolution, and device identifiers.</li>
            <li><strong>Location data:</strong> Approximate location derived from your IP address or device settings.</li>
            <li><strong>Log data:</strong> IP addresses, access times, and referring URLs.</li>
          </ul>
        </section>

        {/* 2 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">2. How We Use Your Information</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>To create and manage your account.</li>
            <li>To enable you to create, manage, and search listings.</li>
            <li>To facilitate communication between buyers and sellers.</li>
            <li>To process payments for premium services.</li>
            <li>To send important notifications about your account, listings, or transactions.</li>
            <li>To improve the Platform through analytics and usage insights.</li>
            <li>To detect and prevent fraud, abuse, and security threats.</li>
            <li>To comply with legal obligations under Zambian law.</li>
          </ul>
        </section>

        {/* 3 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Sharing Your Information</h2>
          <p className="text-gray-700 mb-2">
            We do not sell your personal information. We may share your data with:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li><strong>Payment providers:</strong> To process transactions for premium services (e.g., Paystack).</li>
            <li><strong>Analytics services:</strong> To help us understand usage patterns and improve the Platform.</li>
            <li><strong>Law enforcement:</strong> When required by law, court order, or to protect the safety of our users.</li>
            <li><strong>Service providers:</strong> Trusted third parties who assist in operating the Platform (hosting, email delivery), bound by confidentiality agreements.</li>
          </ul>
        </section>

        {/* 4 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Cookies and Tracking</h2>
          <p className="text-gray-700 leading-relaxed">
            We use cookies and similar technologies to maintain your session, remember your preferences, and
            analyse usage. Essential cookies are required for the Platform to function. Analytics cookies help us
            understand how users interact with the Platform. You can manage cookie preferences through your
            browser settings, though disabling essential cookies may affect Platform functionality.
          </p>
        </section>

        {/* 5 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Data Retention</h2>
          <p className="text-gray-700 leading-relaxed">
            We retain your personal data for as long as your account is active or as needed to provide our services.
            If you delete your account, we will remove your personal data within 30 days, except where retention
            is required by law or for legitimate business purposes such as fraud prevention. Listing data and
            transaction records may be retained in anonymised form for analytical purposes.
          </p>
        </section>

        {/* 6 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Your Rights</h2>
          <p className="text-gray-700 mb-2">You have the right to:</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
            <li><strong>Correction:</strong> Request correction of any inaccurate or incomplete data.</li>
            <li><strong>Deletion:</strong> Request deletion of your personal data, subject to legal retention requirements.</li>
            <li><strong>Data portability:</strong> Request your data in a structured, commonly used format.</li>
            <li><strong>Withdraw consent:</strong> Where processing is based on consent, you may withdraw it at any time.</li>
            <li><strong>Object:</strong> Object to the processing of your personal data for direct marketing purposes.</li>
          </ul>
          <p className="text-gray-700 mt-2">
            To exercise any of these rights, please contact us at{" "}
            <a href="mailto:privacy@zambia.net" className="text-blue-600 hover:underline">privacy@zambia.net</a>.
          </p>
        </section>

        {/* 7 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Children&apos;s Privacy</h2>
          <p className="text-gray-700 leading-relaxed">
            The Platform is not intended for use by persons under the age of 18. We do not knowingly collect
            personal information from children. If we become aware that we have collected data from a child
            under 18, we will take steps to delete that information promptly. If you believe a child has
            provided us with personal data, please contact us immediately.
          </p>
        </section>

        {/* 8 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Security Measures</h2>
          <p className="text-gray-700 leading-relaxed">
            We implement appropriate technical and organisational measures to protect your personal data, including
            encryption of data in transit and at rest, secure password hashing, regular security assessments, and
            access controls. However, no method of transmission over the internet is completely secure, and we
            cannot guarantee absolute security.
          </p>
        </section>

        {/* 9 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Changes to This Policy</h2>
          <p className="text-gray-700 leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify you of significant changes by
            posting a prominent notice on the Platform or sending you a notification. Your continued use of
            the Platform after changes are posted constitutes your acceptance of the revised policy. We
            encourage you to review this policy periodically.
          </p>
        </section>

        {/* 10 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Contact Us</h2>
          <p className="text-gray-700 leading-relaxed">
            If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-1 mt-2">
            <li>Email: <a href="mailto:privacy@zambia.net" className="text-blue-600 hover:underline">privacy@zambia.net</a></li>
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
