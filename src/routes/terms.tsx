import { createFileRoute } from "@tanstack/react-router";

import { CONTACT_EMAIL, LegalPageShell, LegalSection } from "@/components/LegalPageShell";

const TITLE = "Terms & Conditions | ToolNexa";
const DESCRIPTION =
  "The rules for using ToolNexa's AI tools directory and Prompt Studio: accounts, acceptable use, third-party tools, accuracy and liability.";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://toolnexa-ai-hub.lovable.app/terms" },
    ],
    links: [{ rel: "canonical", href: "https://toolnexa-ai-hub.lovable.app/terms" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalPageShell
      title="Terms & Conditions"
      lastUpdated="17 August 2026"
      intro="These terms explain what ToolNexa offers, what we ask of you, and the limits of what we can promise. Please read them before using the directory or the Prompt Studio."
    >
      <LegalSection heading="1. Acceptance of these terms">
        <p>
          By visiting ToolNexa or creating an account, you agree to these terms and to our
          Privacy Policy. If you do not agree, please do not use the service.
        </p>
      </LegalSection>

      <LegalSection heading="2. What ToolNexa is">
        <p>
          ToolNexa is an independent platform with two parts:
        </p>
        <ul>
          <li>
            <strong>AI tools directory:</strong> a curated, categorised list of AI tools with
            summaries, pricing labels and links to the official websites of those tools.
          </li>
          <li>
            <strong>Prompt Studio:</strong> a rule-based generator that turns one idea into
            several specialised prompts (image, video, thumbnail, character, anime and
            realistic), which you can copy or save to your account.
          </li>
        </ul>
        <p>
          ToolNexa does not host, resell or operate the third-party tools it lists, and does
          not run the AI models behind them.
        </p>
      </LegalSection>

      <LegalSection heading="3. Accounts">
        <p>
          Some features — saving tools and saving prompts — require an account. You are
          responsible for keeping your login secure and for activity under your account.
          Provide an email address you control, and tell us promptly if you believe your
          account has been accessed without permission.
        </p>
      </LegalSection>

      <LegalSection heading="4. Your responsibilities and acceptable use">
        <p>Use ToolNexa lawfully and reasonably. Please do not:</p>
        <ul>
          <li>Break the law or infringe anyone's rights while using the service.</li>
          <li>Attempt to access other users' accounts, data or saved content.</li>
          <li>
            Scrape, bulk-copy or republish the directory, or place automated load on the
            service.
          </li>
          <li>Probe, disrupt or attempt to bypass security or access controls.</li>
          <li>
            Create prompts intended to produce illegal content, sexual content involving
            minors, targeted harassment, or content that impersonates real people
            deceptively.
          </li>
          <li>Upload malware or use the service to distribute spam.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="5. Prompts and content you create">
        <p>
          You keep ownership of the ideas you enter and the prompts you save. You grant us
          only the permission needed to store and display that content back to you as part of
          running the service. You are responsible for how you use generated prompts in other
          tools, and for complying with those tools' terms. Prompts are text suggestions —
          they are not a guarantee of any particular output.
        </p>
      </LegalSection>

      <LegalSection heading="6. Third-party tools, brands and external websites">
        <p>
          ToolNexa is independent and is not affiliated with, endorsed by, sponsored by, or a
          partner of the third-party AI tools listed in the directory unless a page explicitly
          says otherwise. Product names, logos and trademarks belong to their respective
          owners and are referenced only to identify and describe those tools. Listing a tool
          is not an endorsement, and external websites are governed entirely by their own
          terms.
        </p>
      </LegalSection>

      <LegalSection heading="7. Tool information, pricing and accuracy">
        <p>
          Tool descriptions, categories, ratings and pricing labels are compiled from publicly
          available sources and may become outdated without notice. Pricing and free-tier
          details change frequently. Always confirm current features, limits and prices on the
          tool's official website before relying on them or paying for anything. If you spot
          something wrong, please report it and we will review it.
        </p>
      </LegalSection>

      <LegalSection heading="8. Availability and changes to the service">
        <p>
          ToolNexa is provided on an "as is" and "as available" basis. We may add, change,
          suspend or remove features, listings or pages at any time, and there may be downtime
          for maintenance or reasons outside our control.
        </p>
      </LegalSection>

      <LegalSection heading="9. Intellectual property and copyright">
        <p>
          The ToolNexa name, logo, design, written copy, curation and the Prompt Studio logic
          belong to ToolNexa and may not be copied or reused without permission. If you
          believe material on ToolNexa infringes your copyright, email us with details of the
          work and the page in question and we will investigate and act where appropriate.
        </p>
      </LegalSection>

      <LegalSection heading="10. Suspension and termination">
        <p>
          You may stop using ToolNexa and request deletion of your account at any time. We may
          suspend or terminate access if these terms are breached or if an account is used in a
          way that harms the service or other users.
        </p>
      </LegalSection>

      <LegalSection heading="11. Disclaimers and limitation of liability">
        <p>
          To the extent permitted by law, ToolNexa gives no warranties that the service or the
          information in it is accurate, uninterrupted or fit for a particular purpose, and is
          not liable for indirect or consequential losses, lost profits, lost data, or losses
          arising from your use of third-party AI tools, external websites, or the outputs you
          produce with generated prompts. Nothing here limits liability that cannot lawfully be
          limited.
        </p>
      </LegalSection>

      <LegalSection heading="12. Changes to these terms">
        <p>
          We may update these terms as the platform develops. The "Last updated" date shows the
          current version, and continuing to use ToolNexa after a change means you accept the
          updated terms.
        </p>
      </LegalSection>

      <LegalSection heading="13. Contact">
        <p>
          Questions about these terms:{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
