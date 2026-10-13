import React from "react";
import {
  PolicyScreen,
  type PolicySection,
} from "../src/components/PolicyScreen";
import { PageMeta } from "../src/components/PageMeta";
import { LEGAL_VERSION } from "../src/legal/config";

const sections: PolicySection[] = [
  {
    title: "Agreement and eligibility",
    paragraphs: [
      "These draft terms describe use of the MedLit website, native application, and related reading and organization features, a REDKO product. “MedLit,” “we,” and “our” refer to the contracting legal entity identified above once verified, not the founder personally. This review version is not an executed agreement. Final terms require conspicuous notice and an affirmative acceptance process. If you act for an organization, you must have authority to bind it. Mandatory consumer protections and other rights that cannot lawfully be waived take precedence.",
      "The proposed audience for this draft is adults aged 18 or older who can legally enter an agreement. This proposed restriction does not represent that technical age verification is already in place. A service for minors would require separate review before it is offered. Do not create an account with false identity information or use someone else’s account without authorization.",
    ],
  },
  {
    title: "Educational decision support only",
    paragraphs: [
      "MedLit is an AI-assisted reading and organization tool. Outputs are not peer review, medical advice, diagnosis, treatment recommendations, or a determination that research is true, trustworthy, unbiased, or clinically applicable. Read the source and consult qualified experts before relying on important claims.",
    ],
  },
  {
    title: "AI outputs and scientific limitations",
    paragraphs: [
      "AI outputs are probabilistic and may contain fabricated references, incorrect calculations, omitted context, biased reasoning, or misinterpretations of a genuine quotation. A citation or exact source match does not establish that an inference is valid. An appraisal can be limited by an abstract-only source, incomplete retrieval, PDF extraction errors, missing supplements, an unidentified study design, or unavailable protocols.",
      "The appraisal confidence score is a documented heuristic about source coverage, quotation matching and assessable questions. It is not a probability that a study is correct, a validated risk-of-bias instrument, a clinical recommendation, or a certification of research integrity. Framework-inspired questions are not a claim of official endorsement by their authors.",
      "You are responsible for evaluating suitability for your purpose, reviewing the original paper and relevant updates, and obtaining qualified professional input where appropriate. MedLit is not an emergency service. Do not delay medical care or change treatment because of an appraisal.",
    ],
  },
  {
    title: "Your responsibilities",
    paragraphs: [
      "You must have the right to access and process any content you submit. Use only supported lawful identifiers and sources; do not attempt to bypass paywalls, access controls, or provider restrictions.",
    ],
    bullets: [
      "Verify quotations, citations, calculations, and interpretations against the source.",
      "Do not use MedLit as the sole basis for patient care, safety decisions, publication, regulation, or investment.",
      "Protect your provider key and account credentials and report suspected compromise.",
    ],
  },
  {
    title: "Third-party services and cost",
    paragraphs: [
      "You bring your own Anthropic, OpenAI, Google, or OpenRouter account and are responsible for its charges, limits, and terms, including downstream model-provider terms where applicable. MedLit account sign-in is separate from an AI-provider connection. A ChatGPT subscription is not an API credit balance. A ChatGPT source-packet handoff does not grant MedLit access to your subscription or conversations.",
      "Review model pricing and spending limits before starting an appraisal. A failed, interrupted, retried, or unsaved appraisal can still consume provider credits. We do not control provider invoices or promise refunds from a third party. Connecting a provider does not by itself start an appraisal; generation requires your separate action.",
      "Article indexes, open-access services, Firebase, and Vercel are independent services. Their availability and policies may change. Links and integrations do not constitute endorsement or a guarantee of another service’s security, scientific quality, or continued availability.",
    ],
  },
  {
    title: "Accounts and acceptable use",
    paragraphs: [
      "An account is optional where account features are enabled. Protect credentials and notify us of suspected unauthorized use. We may restrict access needed to protect users, services, or legal rights. Do not disrupt, overload, scrape at abusive rates, bypass access controls, upload malware, or use MedLit unlawfully. This clause does not restrict activity protected by law, lawful interoperability, or legitimate security reporting; a security report is not permission to access another person’s data.",
    ],
  },
  {
    title: "Privacy, confidentiality and sharing",
    paragraphs: [
      "Read the Privacy notice before submitting information or enabling synchronization. The permissions and processing described there are distinct from these use terms. Do not send patient-identifiable, confidential, privileged, unpublished, or restricted content unless you have authority and the selected providers and services are appropriate for that content.",
      "You control whether to export or create a portable report link. Anyone who receives a portable link can read its included snapshot and may copy or forward it. We cannot retrieve copies from recipients, your downloads, browser history, screenshots, or third-party backups. Check a report for restricted content and unsupported statements before sharing or publishing it.",
    ],
  },
  {
    title: "Library storage and availability",
    paragraphs: [
      "Guest work is stored on your device when history is enabled. It can be lost if storage is cleared, an app is removed, or a device fails. Optional account features may synchronize chosen work when a dedicated backend is enabled, but an account is not a substitute for your own backup. Keep an independent copy of important reports and original sources.",
      "We may maintain, change, limit, or discontinue features, sources, models, or integrations. We do not promise uninterrupted operation, a particular response time, perpetual storage, or compatibility with every file, browser, operating system, research design, or accessibility technology. When an error or partial result is shown, do not treat it as a completed appraisal.",
    ],
  },
  {
    title: "Ownership and licenses",
    paragraphs: [
      "You retain rights in your notes, reviewer feedback, and organization metadata. Research articles and metadata remain subject to their owners’ terms and applicable licenses. You grant MedLit only the limited permission needed to process and store content at your direction. Do not create or distribute portable links or benchmark packets containing content you lack permission to share. MedLit software, branding, and original interface content remain owned by their respective rights holders.",
    ],
  },
  {
    title: "No warranty and limitation",
    paragraphs: [
      "To the maximum extent permitted by applicable law, the service and outputs are provided “as is” and “as available,” without express or implied warranties, including warranties of accuracy, completeness, merchantability, fitness for a particular purpose, title, or non-infringement. No oral or written explanation of a feature creates a guarantee that research is correct or that a particular outcome will follow.",
      "To the maximum extent permitted by law, MedLit and its operators, contributors, and service suppliers are not liable for indirect, incidental, special, consequential, exemplary, or punitive losses arising out of use of or inability to use the service, including lost opportunities, profits, data, or business interruption. This limitation applies only to the extent the law allows it and does not make an otherwise unenforceable exclusion effective.",
      "Nothing in these terms excludes or limits liability that cannot legally be excluded, including liability for fraud, willful misconduct, or other conduct for which an exclusion is prohibited. Statutory consumer remedies and other non-waivable rights remain available. These terms are not a release from every type of liability.",
      "Subject to those exceptions, the proposed aggregate limit on monetary liability of the contracting company and the protected persons below, collectively, for claims arising from this service is the greater of US $100 or the amount you paid directly to that company for MedLit during the twelve months before the event giving rise to the claim. Amounts paid to your independent AI provider are not fees paid to MedLit. The cap applies across claims arising in contract, tort or another legal theory only where enforceable. This is a proposed commercial allocation for legal review, not a statutory safe harbor or an effective cap in this review draft.",
      "No exclusion or cap applies to our fraud, gross negligence, willful misconduct, or liability for unlawful conduct, personal injury, privacy violations or other matters to the extent applicable law prohibits its exclusion or limitation. Nothing restricts regulatory complaints, legally protected public injunctive relief, or remedies that cannot be waived. A court may find a limitation unenforceable despite these qualifications.",
    ],
  },
  {
    title: "Misuse, suspension and disputes",
    paragraphs: [
      "We may restrict access when reasonably necessary to investigate abuse, protect people or infrastructure, comply with law, or address a material breach. Where appropriate and lawful, we will seek to provide notice and a practical opportunity to recover permitted data. You may stop using the service at any time; deleting an account does not remove obligations that arose before deletion.",
      "If there is a dispute, contact the operator with a concise description and the resolution you seek. Do not include secrets or sensitive source material. An informal contact does not waive rights, suspend legal deadlines, or prevent you from seeking relief. These terms do not impose mandatory arbitration, a class-action waiver, or a reduction of non-waivable rights. Applicable law determines the forum and governing rules where no separate valid agreement specifies them.",
    ],
  },
  {
    title: "Changes and termination",
    paragraphs: [
      "Features or these terms may change. A new effective date identifies revisions. Material changes require appropriate notice and, where applicable law requires it, renewed agreement. Changes are not a retroactive waiver of claims or statutory rights. If you do not agree to revised terms, stop using the service and export or delete your data as appropriate.",
      "If a provision is held unenforceable, the remaining provisions continue only to the extent allowed by law. Failure to enforce a provision immediately is not a waiver of it. Sections concerning ownership, permitted retained records, scientific-reliance limits, and legally enforceable liability boundaries survive termination where their nature requires it.",
    ],
  },
  {
    title: "Company capacity and protected persons",
    paragraphs: [
      "The company operates the service in its own capacity. Its members, managers, officers, employees and authorized agents act for it when performing authorized service duties; they do not personally promise a scientific result, health outcome or company performance. To the extent lawful, those persons and the company’s licensors may enforce the warranty disclaimers and liability limits applicable to their authorized work as intended third-party beneficiaries. This does not release anyone from responsibility for their own conduct where law imposes liability or create a personal guarantee by the founder.",
    ],
  },
  {
    title: "Limited responsibility for third-party claims",
    paragraphs: [
      "If you use MedLit on behalf of a business or other organization, the proposed agreement requires that organization, to the extent permitted by law, to reimburse the company for reasonable, documented losses finally awarded to a third party, or approved in a written settlement, arising from content the organization supplied in violation of third-party rights or its intentional unlawful misuse of MedLit. Ordinary personal consumer use does not create this indemnity. It does not cover losses caused by our breach, negligence, unlawful conduct or a defect in the service.",
      "The company must give reasonably prompt notice of a covered claim and reasonable cooperation at the organization’s expense. The organization may control a competent defense, but cannot settle a claim in a way that admits fault by, imposes nonmonetary duties on, or fails to release a protected party without that party’s reasonable written consent. Mandatory consumer protections prevail. This proposed allocation remains subject to legal review.",
    ],
  },
  {
    title: "Defined data permissions and future services",
    paragraphs: [
      "The content-processing permission is limited to delivering requested features, necessary security and support, and separately chosen uses described in the Privacy notice. It does not transfer ownership of personal information or authorize advertising profiles, disclosure of private reading histories to other REDKO products, training our own general-purpose AI models on private content, or research enrollment. A new purpose requires appropriate notice, a valid legal basis and any required separate consent before it begins.",
      "The current release does not create a MedLit paid subscription. Future paid offers must identify the seller, price, billing interval, renewal, cancellation and refund terms before purchase. A roadmap is not a promise to deliver an unavailable service. We may assign the agreement in a lawful business transfer subject to existing privacy commitments and mandatory rights; a transfer is not permission to repurpose old data.",
    ],
  },
];

export default function TermsScreen() {
  return (
    <>
      <PageMeta
        title="Terms of use — MedLit"
        description="Responsible-use and scientific-reliance boundaries for the MedLit evidence appraisal workspace."
        path="/terms"
      />
      <PolicyScreen
        title="Terms of use"
        effective={LEGAL_VERSION}
        intro="MedLit helps you read research critically. These terms explain the limits of that help, your responsibilities, provider costs, and your rights. They do not remove protections that the law gives you."
        sections={sections}
      />
    </>
  );
}
