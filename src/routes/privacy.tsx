import { createFileRoute } from "@tanstack/react-router";

import { CONTACT_EMAIL, LegalPageShell, LegalSection } from "@/components/LegalPageShell";

const TITLE = "Privacy Policy | ToolNexa";
const DESCRIPTION =
  "How ToolNexa handles account details, saved AI tools, prompts, search queries, cookies and analytics — explained in plain language.";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://toolnexa-ai-hub.lovable.app/privacy" },
    ],
    links: [{ rel: "canonical", href: "https://toolnexa-ai-hub.lovable.app/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalPageShell
      title="Privacy Policy"
      lastUpdated="17 August 2026"
      intro="ToolNexa is an AI tools finder and prompt studio. This policy explains what information the platform handles when you browse the directory, save tools, or create prompts — and what it does not."
    >
      <LegalSection heading="1. Information you provide">
        <ul>
          <li>
            <strong>Account information:</strong> when you create an account, your email
            address and authentication details are handled by our authentication provider.
            Passwords are stored by that provider in hashed form; ToolNexa never sees them
            in plain text.
          </li>
          <li>
            <strong>Sign-in with Google:</strong> if you choose Google sign-in, we receive
            the basic profile information Google shares for authentication, such as your
            email address.
          </li>
          <li>
            <strong>Saved AI tools:</strong> tools you bookmark are stored against your
            account so your saved list is available when you return.
          </li>
          <li>
            <strong>Saved prompts and prompt history:</strong> prompts you choose to save
            in the Prompt Studio, including the idea you entered and the generated
            variations, are stored against your account.
          </li>
          <li>
            <strong>Contact form submissions:</strong> if email delivery is enabled and you
            send us a message, we receive the name, email address, subject and message you
            provide so we can reply.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="2. Information handled automatically">
        <ul>
          <li>
            <strong>Search and filter queries:</strong> the words and filters you use in the
            directory are processed to return results. They are part of the page address
            while you browse.
          </li>
          <li>
            <strong>Usage, device and browser information:</strong> our hosting and
            analytics infrastructure may record standard technical details such as browser
            type, device type, referring page, pages viewed and approximate timing.
          </li>
          <li>
            <strong>IP address:</strong> where applicable, IP addresses are processed by our
            hosting and security infrastructure as part of serving requests and preventing
            abuse.
          </li>
          <li>
            <strong>Cookies and local storage:</strong> used to keep you signed in and to
            remember basic preferences. Analytics providers used by the hosting platform may
            set their own identifiers.
          </li>
        </ul>
        <p>
          ToolNexa does not ask for payment card details, phone numbers, home addresses or
          government identifiers, and the Prompt Studio generates prompts locally using
          rules rather than sending your idea to an external AI provider.
        </p>
      </LegalSection>

      <LegalSection heading="3. Why we handle this information">
        <ul>
          <li>To create and secure your account and keep you signed in.</li>
          <li>To show your saved tools and saved prompts back to you.</li>
          <li>To return relevant search and category results.</li>
          <li>To keep the service reliable, diagnose errors and prevent abuse.</li>
          <li>To understand, in aggregate, which pages and categories are useful.</li>
          <li>To reply to messages you send us.</li>
        </ul>
        <p>
          We do not sell your personal information and we do not use your saved prompts for
          advertising.
        </p>
      </LegalSection>

      <LegalSection heading="4. How information is protected">
        <p>
          Data is stored with a managed cloud database and authentication provider over
          encrypted connections. Access rules are applied at the database level so that
          saved tools and prompts are readable only by the account that created them.
          Administrative access is limited to the site operator. No online service can
          guarantee absolute security, so please avoid putting confidential information into
          prompts.
        </p>
      </LegalSection>

      <LegalSection heading="5. Data retention">
        <p>
          Account data, saved tools and saved prompts are kept while your account is active.
          You can delete individual saved tools and prompts at any time from your account
          pages. If you ask us to delete your account, the associated records are removed.
          Technical logs kept by hosting and analytics providers are retained according to
          their own schedules.
        </p>
      </LegalSection>

      <LegalSection heading="6. Third-party services">
        <p>
          ToolNexa relies on service providers to operate: a managed cloud platform for
          hosting, database, storage and authentication, and Google when you choose Google
          sign-in. These providers process data on our behalf under their own privacy terms.
          We do not add advertising trackers.
        </p>
      </LegalSection>

      <LegalSection heading="7. External AI tools and links">
        <p>
          The directory links to third-party AI tool websites. When you follow a link, you
          leave ToolNexa and that website's own privacy policy and terms apply. ToolNexa has
          no control over, and takes no responsibility for, the data practices of external
          sites — including anything you upload, type or pay for there.
        </p>
      </LegalSection>

      <LegalSection heading="8. Cookies and similar technologies">
        <p>
          Essential cookies and browser storage keep your session active; without them
          sign-in cannot work. Analytics identifiers, where present, help measure traffic in
          aggregate. You can clear or block cookies in your browser settings, but signing in
          will then not work reliably.
        </p>
      </LegalSection>

      <LegalSection heading="9. Your rights">
        <p>
          Depending on where you live, you may have the right to access, correct, export or
          delete your personal information, to object to certain processing, or to withdraw
          consent. You can exercise most of these directly in the app, or contact us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and we will respond within
          a reasonable time.
        </p>
      </LegalSection>

      <LegalSection heading="10. Children's privacy">
        <p>
          ToolNexa is not directed at children under 13, and accounts are not knowingly
          created for them. If you believe a child has provided personal information, contact
          us and we will delete it.
        </p>
      </LegalSection>

      <LegalSection heading="11. Changes to this policy">
        <p>
          We may update this policy as the platform changes. The "Last updated" date at the
          top always reflects the current version, and significant changes will be made
          clear on this page.
        </p>
      </LegalSection>

      <LegalSection heading="12. Contact">
        <p>
          Privacy questions or requests:{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
