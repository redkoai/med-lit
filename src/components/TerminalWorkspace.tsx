import { useState, type ReactNode, type AnchorHTMLAttributes } from "react";
import { Link } from "expo-router";
function Anchor({
  href,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <Link href={href as never} asChild>
      <a {...props}>{children}</a>
    </Link>
  );
}
import { EXAMPLE_PASSAGES } from "../services/exampleAppraisal";

type Props = {
  url: string;
  setUrl: (url: string) => void;
  start: () => void;
  busy: boolean;
  ready: boolean;
  connected: boolean;
  provider: string;
  connect: () => void;
  handoff: () => void;
  error?: string;
  loading: ReactNode;
  history: { id: string; title: string }[];
};
const findings = [
  {
    label: "Reported strength",
    status: "Reported",
    title: "Randomization is described.",
    quote: EXAMPLE_PASSAGES.randomization,
    detail:
      "The source describes a generated sequence and concealed allocation. That supports the report of the method; it does not verify its execution.",
  },
  {
    label: "Concern",
    status: "Needs review",
    title: "What happened to the missing outcomes?",
    quote: EXAMPLE_PASSAGES.missing,
    detail:
      "One in five outcomes is missing. The excerpt does not explain why or give counts by group, so the effect on the result is unclear.",
  },
  {
    label: "Unknown",
    status: "Unclear",
    title: "Was the analysis planned in advance?",
    quote: null,
    detail:
      "No protocol or preregistration is supplied in this excerpt. “Not reported” is different from “not done.” Keep the question open.",
  },
];
export function TerminalWorkspace(p: Props) {
  const [selected, setSelected] = useState(1);
  const finding = findings[selected];
  return (
    <main className="ml-home" id="main-content">
      <section className="ml-intro" aria-labelledby="ml-title">
        <div>
          <div className="ml-command" aria-hidden="true">
            <span>~/medlit</span>
            <span className="ml-typed">read --with-questions</span>
            <span className="ml-caret">▍</span>
          </div>
          <h1 id="ml-title">
            Read beyond
            <br />
            the abstract.
          </h1>
        </div>
        <div className="ml-intro-note">
          <p>
            A research workbench for the paper
            <br className="ml-desktop-break" /> you need to understand.
          </p>
          <p>
            Inspect the methods. Follow the evidence.
            <br className="ml-desktop-break" /> Bring better questions to
            journal club.
          </p>
          <Anchor href="/example">
            Explore a sample appraisal <span aria-hidden="true">↗</span>
          </Anchor>
        </div>
      </section>

      <section className="ml-workbench" aria-label="Paper appraisal workspace">
        <div className="ml-workbench-bar">
          <span className="ml-active-file">
            <span aria-hidden="true">⌘</span> new appraisal
          </span>
          <Anchor href="/history">library</Anchor>
          <span className="ml-workbench-caption">
            Your paper. Your model. Your judgment.
          </span>
        </div>
        <div className="ml-workbench-grid">
          <div className="ml-intake">
            <div className="ml-terminal-label">
              <span>input / paper</span>
              <span>PubMed · DOI · PMC · arXiv</span>
            </div>
            <h2>What are you reading?</h2>
            <p className="ml-input-description">
              Start with an article link or DOI. MedLit creates a structured
              appraisal with passages you can check.
            </p>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                p.start();
              }}
            >
              <label htmlFor="paper-url">Article link or DOI</label>
              <div className="ml-input-line">
                <span aria-hidden="true">&gt;</span>
                <input
                  id="paper-url"
                  aria-label="Article URL or DOI"
                  value={p.url}
                  onChange={(e) => p.setUrl(e.target.value)}
                  placeholder="Paste a paper link or DOI"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  maxLength={2048}
                  disabled={p.busy}
                  aria-describedby="paper-source-note"
                />
              </div>
              <button
                className="ml-primary"
                disabled={p.busy || !p.ready}
                type="submit"
              >
                {p.busy ? "Reading the evidence…" : "Appraise this paper"}
                <span aria-hidden="true">↵</span>
              </button>
            </form>
            <button
              className="ml-sample"
              type="button"
              disabled={p.busy}
              onClick={() =>
                p.setUrl("https://pubmed.ncbi.nlm.nih.gov/26551272/")
              }
            >
              <span aria-hidden="true">+</span> Try a real paper: the SPRINT
              trial
            </button>
            <p className="ml-source-note" id="paper-source-note">
              We use available full text or abstracts and make the difference
              visible. AI-generated findings need your review.
            </p>
            {p.error && (
              <p className="ml-error" role="alert">
                {p.error}
              </p>
            )}
            {p.busy && (
              <div className="ml-loading" role="status">
                {p.loading}
              </div>
            )}
            <div className="ml-provider">
              <div>
                <span
                  className={`ml-status-dot ${p.connected ? "is-connected" : ""}`}
                  aria-hidden="true"
                />
                <strong>
                  {p.connected
                    ? `${p.provider} connected`
                    : "Connect your own AI"}
                </strong>
                <p>
                  {p.connected
                    ? "Usage is billed by your provider."
                    : "OpenAI, Claude, Gemini or OpenRouter."}
                </p>
              </div>
              <button
                type="button"
                aria-label={
                  p.connected ? "Change AI connection" : "Connect AI provider"
                }
                onClick={p.connect}
              >
                {p.connected ? "Change" : "Connect"}
              </button>
            </div>
            <button type="button" className="ml-chat-link" onClick={p.handoff}>
              Use a source packet in your chat app{" "}
              <span aria-hidden="true">↗</span>
            </button>
          </div>
          <div className="ml-output">
            <div className="ml-terminal-label">
              <span>output / evidence</span>
              <Anchor href="/example">Open example ↗</Anchor>
            </div>
            <p className="ml-example-label">
              Fictional teaching example · no AI call
            </p>
            <h2>
              A reading app and
              <br />
              self-reported concentration
            </h2>
            <p className="ml-study-meta">
              120 participants / 4 weeks / randomized design
            </p>
            <div
              className="ml-findings"
              aria-label="Explore the example findings"
            >
              {findings.map((f, i) => (
                <button
                  type="button"
                  key={f.label}
                  aria-pressed={selected === i}
                  onClick={() => setSelected(i)}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="ml-finding" aria-live="polite" aria-atomic="true">
              <span className="ml-finding-status">{finding.status}</span>
              <h3>{finding.title}</h3>
              {finding.quote ? (
                <blockquote>
                  <p>“{finding.quote}”</p>
                  <footer>Matched passage in the fictional source</footer>
                </blockquote>
              ) : (
                <div className="ml-missing">
                  No supporting passage available
                </div>
              )}
              <p className="ml-finding-detail">{finding.detail}</p>
            </div>
            <Anchor className="ml-method-link" href="/methodology">
              How MedLit builds an appraisal <span aria-hidden="true">↗</span>
            </Anchor>
          </div>
        </div>
        <div className="ml-workbench-bottom">
          <span>Read the source. Keep the uncertainty.</span>
          <span>Educational use · not medical advice</span>
        </div>
      </section>

      <section className="ml-reading-paths" aria-labelledby="reading-paths">
        <div className="ml-section-heading">
          <h2 id="reading-paths">
            Bring a paper.
            <br />
            Leave with better questions.
          </h2>
          <p>
            Practical reading guides for your next discussion,
            <br className="ml-desktop-break" /> assignment or research meeting.
          </p>
        </div>
        <div className="ml-path-list">
          <Anchor href="/guides/journal-club">
            <span className="ml-path-context">For journal club</span>
            <h3>Build a discussion, not a slide full of results.</h3>
            <p>
              Use a paper review template to connect the question, methods and
              limitations.
            </p>
            <span className="ml-path-action">Prepare your review ↗</span>
          </Anchor>
          <Anchor href="/guides/critical-appraisal">
            <span className="ml-path-context">For critical appraisal</span>
            <h3>Ask what the study can actually support.</h3>
            <p>
              Work through design, bias and applicability with the original
              source beside you.
            </p>
            <span className="ml-path-action">Read the appraisal guide ↗</span>
          </Anchor>
          <Anchor href="/guides/pubmed-paper-review">
            <span className="ml-path-context">For your reading list</span>
            <h3>Go from a PubMed link to a closer reading.</h3>
            <p>
              Check available text and trace model-generated judgments back to
              the paper.
            </p>
            <span className="ml-path-action">Review a PubMed paper ↗</span>
          </Anchor>
        </div>
        <Anchor className="ml-all-guides" href="/guides">
          All research reading guides ↗
        </Anchor>
      </section>

      <section className="ml-library" aria-labelledby="library-title">
        <div>
          <h2 id="library-title">
            {p.history.length
              ? "Pick up your last paper."
              : "Keep your reading connected."}
          </h2>
          <p>
            Save appraisals on this device, compare papers and export your
            notes. Reopening a saved report uses no AI credits.
          </p>
        </div>
        <Anchor href="/history">Open your library ↗</Anchor>
        {p.history.length > 0 && (
          <ul>
            {p.history.slice(0, 3).map((item) => (
              <li key={item.id}>
                <Anchor href={`/analysis?id=${encodeURIComponent(item.id)}`}>
                  {item.title}
                  <span aria-hidden="true">↗</span>
                </Anchor>
              </li>
            ))}
          </ul>
        )}
      </section>
      <footer className="ml-footer">
        <p>
          medlit<span>.</span>{" "}
          <small>Scientific judgment stays with you.</small>
        </p>
        <nav aria-label="Footer navigation">
          <Anchor href="/about#redko">About Redko</Anchor>
          <Anchor href="/guides">Guides</Anchor>
          <Anchor href="/privacy">Privacy</Anchor>
          <Anchor href="/terms">Terms</Anchor>
          <Anchor href="/faq">FAQ</Anchor>
        </nav>
      </footer>
    </main>
  );
}
