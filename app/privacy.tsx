import React from "react";
import {
  PolicyScreen,
  type PolicySection,
} from "../src/components/PolicyScreen";
import { PageMeta } from "../src/components/PageMeta";
import { LEGAL_VERSION } from "../src/legal/config";

const sections: PolicySection[] = [
  {
    title: "Scope and privacy at a glance",
    paragraphs: [
      "This review notice covers the MedLit website and native reading workspace, a REDKO product, including optional accounts and cloud libraries where enabled. The contracting entity and public request contact are pending confirmation above. External websites, identity providers, article repositories and AI services have their own notices; this notice does not replace them. Dedicated MedLit cloud accounts are disabled in the public deployment reviewed on September 13, 2026; the account descriptions below explain conditional features, not a claim that sign-in is currently available.",
      "Our mission is to make research easier to question and understand. You do not need to trade access to your full reading history for that purpose. Guest use is available, cloud accounts are optional, provider connections are separate, and behavioral measurement requires a separate opt-in. Signing up is not consent to optional analytics.",
    ],
  },
  {
    title: "Information processed",
    paragraphs: [
      "MedLit processes the article identifier you enter, metadata and text retrieved from research indexes or lawful open-access sources, and the organization details you add to saved reports.",
    ],
    bullets: [
      "Saved guest reports, saved PubMed searches, and preferences are stored on your device. When saving is off, the current appraisal stays only in memory and clears on refresh.",
      "If you sign in, your email/profile, safe preferences, full saved reports, and reviewer corrections can be stored in Firebase.",
      "Saved reports can contain article excerpts, your tags, collection names, notes, and correction history. Deleting a saved report also clears its temporary last-opened copy.",
    ],
  },
  {
    title: "Apple, Google and email accounts",
    paragraphs: [
      "Where enabled, you can authenticate using Apple, Google, or email and password. The selected identity provider authenticates you; Firebase issues the MedLit session. Apple and Google account passwords are not given to MedLit. Email/password credentials are handled by Firebase Authentication. Our profile document may contain your account ID, email address, display name, profile-photo URL, sign-in provider, creation time, and last-active time.",
      "Apple may provide a private relay email instead of your usual address; some profile information is supplied only on the first authorization. We do not request access to your inbox, contacts, calendar, Google Drive, iCloud files, or ChatGPT history as part of sign-in. Signing into Google does not automatically authorize Gemini API usage, and signing into Apple does not fund AI analysis.",
      "Authentication state can persist on your device so you remain signed in. Sign out on shared devices, protect your device passcode, and use your identity provider’s account-security controls. Revoking a provider connection outside MedLit is not necessarily the same as deleting the MedLit account or its saved library. Use the account-deletion control to request both.",
    ],
  },
  {
    title: "AI-provider keys and article text",
    paragraphs: [
      "Your AI-provider key is never synced to Firebase or sent to MedLit infrastructure. On the web it stays only in page memory and clears on refresh, close, or disconnect; on native apps it uses encrypted device storage. The connection check sends the key directly to your provider to check model or account access. No article is sent during that check.",
      "OpenRouter sign-in temporarily stores a PKCE verifier, state value, and your paper-input draft in this tab’s session storage for the redirect. The verifier is removed on completion or expiry at the next connection attempt; no provider key is stored there. OpenRouter issues the connection under its own terms; you can revoke it on its keys page. The ChatGPT handoff copies retrieved article text and appraisal instructions only after you choose Copy. Pasting that packet into ChatGPT shares it with OpenAI under your own account. MedLit does not access your conversations or login.",
    ],
    bullets: [
      "Your device sends the key and retrieved article text directly to the provider you select: Anthropic, OpenAI, Google, or OpenRouter and its selected model provider.",
      "Those providers process data under their own terms, privacy policies, and retention controls.",
      "Do not submit confidential, patient-identifiable, unpublished, or restricted content unless you have authority and the selected provider is appropriate.",
    ],
  },
  {
    title: "Sensitive, unpublished and third-party material",
    paragraphs: [
      "MedLit is a research reading aid, not an electronic health record, secure clinical messaging service, or approved repository for identifiable patient information. Do not submit medical records, identifiable case notes, authentication secrets, or confidential work unless you have lawful authority and have independently confirmed that all services involved are suitable.",
      "The fact that an article is accessible online does not remove copyright, confidentiality, research-consent, or licensing restrictions. Review your institution’s rules before processing unpublished manuscripts, peer-review assignments, or restricted source material. Library notes and reviewer corrections may themselves be sensitive. Removing a name may not be enough to de-identify rare conditions or detailed narratives.",
    ],
  },
  {
    title: "Research-data services and hosting",
    paragraphs: [
      "MedLit may contact NCBI/PubMed, PubMed Central, Europe PMC, Crossref, and Unpaywall to retrieve lawful research metadata or open-access text. Vercel-hosted retrieval and PDF-ingestion endpoints generate ordinary platform logs. Application logs record request IDs, source hosts, response size, timing, and failures without intentionally logging provider keys or article text.",
    ],
  },
  {
    title: "Sharing and monitoring features",
    paragraphs: [
      "A portable read-only link contains a bounded appraisal snapshot in the URL. Anyone with that URL can read the snapshot. MedLit excludes private library notes and reviewer correction history from it. Saved PubMed searches and evidence-update checks are stored locally in guest mode and run only when you request them.",
    ],
  },
  {
    title: "Why data is used",
    paragraphs: [
      "Data is used to retrieve the requested article, generate and display a structured appraisal, save your library when requested, operate authentication, prevent abuse, diagnose failures, and meet legal obligations. MedLit does not run advertising or session recordings. Optional PostHog event analytics are disabled unless a dedicated MedLit project is configured and you opt in from AI & settings. If enabled, PostHog receives a random browser ID, named events such as appraisal completed, and optional provider or source-coverage categories—not email, paper text, source identifiers, notes, keys, or page URLs. Its infrastructure receives ordinary network information. Do Not Track and Global Privacy Control disable capture; you can withdraw consent in settings.",
    ],
  },
  {
    title: "Optional first-party REDKO product improvement",
    paragraphs: [
      "When configured, a separate opt-in allows REDKO to collect generic navigation, appraisal start/completion/error events and clicks on explicitly selected controls. Coarse heatmaps record positions inside those controls only on public home/discovery surfaces; cells with fewer than five distinct consenting browser IDs are suppressed. This collector does not capture source identifiers, queries, paper text, notes, keys, email, account IDs, full URLs, form contents or recordings.",
      "The dedicated Supabase telemetry service uses a MedLit product partition and a random browser identifier that rotates after 30 days. REDKO does not join it to Synaptik health records or your MedLit library. Hosting infrastructure receives ordinary network information, including IP addresses. This is pseudonymous measurement, not a promise of anonymity. Only one behavioral collector operates at a time: enabling first-party analytics disables PostHog consent, and enabling PostHog disables first-party collection.",
      "Do Not Track and Global Privacy Control override consent. Turning collection off discards unsent events and aborts pending requests, but cannot recall requests already received. Delete this browser’s product analytics in AI & settings uses locally retained deletion keys for current and prior rotating identities. A failure retains keys for retry; clearing browser storage first can remove those keys. Active-store events are pruned daily at 89 days, targeting a maximum 90-day retention. Provider backups and security logs have separate retention. Small-cell-suppressed aggregate reports may remain for quality review. These observations do not establish scientific validity or medical benefit.",
    ],
  },
  {
    title: "Storage on your device",
    paragraphs: [
      "Essential local storage supports guest libraries, preferences, authentication state, analytics-consent choices, and deletion keys. Native provider secrets use encrypted operating-system-backed storage; web provider keys stay in memory. These are different protections, and neither prevents every risk on a compromised or shared device.",
      "Browser private mode, storage limits, app removal, device loss, or clearing site data can remove local work and analytics-deletion credentials. Export reports you need to retain. Files you export are outside MedLit’s deletion controls and may be included in your operating system’s backups or shared with other applications at your direction.",
    ],
  },
  {
    title: "Retention and deletion",
    paragraphs: [
      "Guest data remains until you delete it, reset the app, clear browser/device storage, or the platform removes it. Signed-in reports remain until you delete them or delete the account. Portable URLs remain wherever recipients, browsers, or platforms retain them. Infrastructure and provider logs may persist under those vendors’ retention policies.",
    ],
    bullets: [
      "Delete individual reports from the library.",
      "Clear local history and provider keys from Settings.",
      "Delete a signed-in account from Profile; MedLit removes known saved-report, settings, legacy-history, and profile documents before deleting the auth account.",
    ],
  },
  {
    title: "Disclosure, service providers and transfers",
    paragraphs: [
      "Information is disclosed to the services needed for the function you choose, such as Firebase for accounts and synced reports, your chosen AI provider for generation, article indexes for retrieval, and hosting infrastructure for delivery and abuse prevention. OpenRouter may route requests to another model provider; check the selected route’s privacy and retention settings before sending material.",
      "Information may also need to be preserved or disclosed to comply with applicable law, a valid legal process, or a proportionate security investigation. We do not promise confidentiality against lawful disclosure obligations. If the operation of the service is transferred, applicable privacy obligations continue to apply and material changes require appropriate notice.",
      "These providers may process information in countries other than yours. Their locations, legal requirements, subprocessors, and safeguards vary. This notice does not promise a particular data-residency region or certify HIPAA, GDPR, or other regulatory compliance. Organizations with regulated-data requirements must assess the actual providers and configuration before use.",
    ],
  },
  {
    title: "Security and children",
    paragraphs: [
      "MedLit uses access-controlled Firebase paths where enabled, encrypted native secret storage, memory-only web keys, HTTPS, and restrictive browser headers. No system is risk-free. This draft proposes adult use only, age 18 or older. It does not claim verified ages or parental consent. Before offering a service to minors, the operator must review age assurance, parental permission where required, data minimization, advertising and child-specific protections.",
    ],
  },
  {
    title: "Your choices and updates",
    paragraphs: [
      "You may use MedLit without an account, avoid saving history, reset secrets, export data, or stop using a provider. Material policy changes will be reflected by a new effective date. Depending on location, you may have rights to access, correct, delete, or export personal data.",
    ],
  },
  {
    title: "Privacy requests and regional rights",
    paragraphs: [
      "Depending on applicable law and the service’s legal obligations, you may be entitled to know what personal information is processed, obtain a copy, request correction or deletion, restrict or object to certain uses, withdraw consent, or complain to a competent regulator. California residents may have additional rights where the California Consumer Privacy Act applies. This notice does not assume that every jurisdiction’s statutory thresholds are met.",
      "Use in-product export, deletion, and consent controls when they address your request; using those controls is not a prerequisite to exercising statutory rights. A monitored request and appeal channel remains pending verification and must be published before this draft is finalized. Do not send provider keys, passwords, or sensitive paper contents to an unverified address. Requests may require proportionate verification, and limited records may need to be retained when required by law. The draft status does not suspend existing privacy obligations.",
      "MedLit does not sell personal information or use it for cross-context behavioral advertising. Global Privacy Control and Do Not Track suppress optional behavioral capture in the web product even when a prior opt-in exists. Withdrawing consent does not undo processing that already occurred. Privacy rights and reasonable service access are not conditioned on consenting to optional analytics.",
    ],
  },
  {
    title: "Changes to this notice",
    paragraphs: [
      "The effective date identifies this version. Material changes to what we collect, why we collect it, or who receives it should be brought to users’ attention as appropriate. Where consent is required for a new purpose, a policy edit alone is not a substitute for obtaining it. Review both this notice and your selected provider’s policies when changing connections or enabling new services.",
    ],
  },
  {
    title: "Health inferences and limits on new uses",
    paragraphs: [
      "A medical article is not necessarily information about your own health. A linked reading history, search, note or inferred interest can nevertheless reveal health information. We do not intentionally derive diagnoses or health profiles from your reading activity. We do not sell personal information, use private reports for targeted advertising, combine your private library with Synaptik records, or use it to train our own general-purpose AI models. Your independently selected AI provider’s processing is governed by its applicable agreement and settings, which you should review before sending content.",
      "Product-improvement permission covers the bounded optional events described above. It is not consent to send paper content, private notes, health inferences or screen recordings. Changing a privacy notice cannot retroactively authorize an incompatible use of data already collected. A new service, research study, recipient or purpose requires an appropriate assessment, updated notice and any required specific permission before the change. We do not rely on an unrestricted license to collect any information for any purpose.",
    ],
  },
  {
    title: "Retention limits, legal process and operational review",
    paragraphs: [
      "We retain information for the described purposes and applicable legal obligations, not merely because it might be useful indefinitely. A particular legal hold must be scoped to relevant records and reviewed when it ends. The final retention schedule must identify provider security logs, backups, optional cloud libraries, privacy-request records and deletion exceptions; their exact durations have not yet been verified. Active-store deletion is not evidence of deletion from every provider backup.",
      "Legal process and business-transfer clauses do not authorize voluntary blanket disclosure. The operator must assess legal validity, scope, confidentiality duties, applicable notice restrictions and available protections before disclosing information. If an unauthorized disclosure or security incident occurs, the operator must assess and meet applicable notification duties; describing a service as educational does not remove those duties.",
    ],
  },
];

export default function PrivacyScreen() {
  return (
    <>
      <PageMeta
        title="Privacy notice — MedLit"
        description="How MedLit stores provider keys, processes article text, syncs saved reports, and handles deletion."
        path="/privacy"
      />
      <PolicyScreen
        title="Privacy notice"
        effective={LEGAL_VERSION}
        intro="Your paper, your provider, your choices. This notice explains what MedLit handles, where it goes, and what you can delete. It describes the product’s actual boundaries, not a promise that third parties retain nothing."
        sections={sections}
      />
    </>
  );
}
