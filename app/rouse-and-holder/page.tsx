import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gary's Business Setup",
  description: "Build the business foundation before the cold-email workflow.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/rouse-and-holder",
  },
};

const pageStyles = String.raw`
@font-face{font-family:Geist;src:url("https://raw.githubusercontent.com/23Maestro/singleton-systems/main/public/decision-maps/2026-08-14-future-voices-storyboard/assets/Geist-Variable.woff2") format("woff2");font-weight:100 900;font-style:normal;font-display:swap}
@font-face{font-family:"Geist Mono";src:url("https://raw.githubusercontent.com/23Maestro/singleton-systems/main/public/decision-maps/2026-08-14-future-voices-storyboard/assets/GeistMono-Variable.woff2") format("woff2");font-weight:100 900;font-style:normal;font-display:swap}
:root{--gary-white:#fff;--gary-wash:#f8fafc;--gary-ink:#111318;--gary-body:#475467;--gary-muted:#667085;--gary-line:#d8dee8;--gary-blue:#2383e2;--gary-blue-text:#1b76d0;--gary-yellow:#ffc83d;--gary-yellow-text:#996d00;--gary-coral:#ff6257;--gary-coral-text:#eb0f00;--gary-green:#25c266;--gary-green-text:#1a8646}
.gary-setup-page{max-width:1080px;min-height:100dvh;margin:auto;padding:20px;background:var(--gary-white);color:var(--gary-body);font:15px/1.5 Geist,Arial,sans-serif;-webkit-font-smoothing:antialiased}
.gary-setup-page,.gary-setup-page *,.gary-setup-page *::before,.gary-setup-page *::after{box-sizing:border-box}
.gary-setup-page .bar{display:grid;grid-template-columns:repeat(4,1fr);height:6px;border-radius:99px;overflow:hidden;margin-bottom:17px}.gary-setup-page .bar i:nth-child(1){background:var(--gary-blue)}.gary-setup-page .bar i:nth-child(2){background:var(--gary-yellow)}.gary-setup-page .bar i:nth-child(3){background:var(--gary-coral)}.gary-setup-page .bar i:nth-child(4){background:var(--gary-green)}
.gary-setup-page .kicker{font:700 11px/1.2 "Geist Mono",monospace;letter-spacing:.12em;text-transform:uppercase;color:var(--gary-blue-text)}
.gary-setup-page h1{color:var(--gary-ink);font-size:28px;line-height:1.1;margin:5px 0 6px}.gary-setup-page h2{color:var(--gary-ink);font-size:15px;margin:0 0 9px}.gary-setup-page h3{color:var(--gary-ink);font-size:14px;margin:11px 0 4px}.gary-setup-page .lead{font-size:17px;max-width:760px;margin:0 0 15px}
.gary-setup-page .ask{border-left:5px solid var(--gary-coral);background:#fff7f6;border-radius:0 10px 10px 0;padding:13px 15px;margin-bottom:12px;color:var(--gary-ink)}.gary-setup-page .ask b{color:var(--gary-coral-text)}
.gary-setup-page .grid{display:grid;grid-template-columns:repeat(12,1fr);gap:10px}.gary-setup-page .card{border:1px solid var(--gary-line);border-radius:12px;padding:14px;background:var(--gary-white);box-shadow:0 8px 18px rgba(15,23,42,.045)}.gary-setup-page .s4{grid-column:span 4}.gary-setup-page .s5{grid-column:span 5}.gary-setup-page .s7{grid-column:span 7}.gary-setup-page .s8{grid-column:span 8}
.gary-setup-page ul,.gary-setup-page ol{margin:5px 0 0;padding-left:19px}.gary-setup-page li{margin:4px 0}.gary-setup-page .tight li{margin:2px 0}
.gary-setup-page code{font-family:"Geist Mono",monospace;background:var(--gary-wash);border:1px solid #e4e8ef;padding:1px 4px;border-radius:4px;color:var(--gary-ink);font-size:12px}
.gary-setup-page .tree{white-space:pre-wrap;background:var(--gary-ink);color:#fff;border-radius:9px;padding:12px;margin:0;font:12px/1.55 "Geist Mono",monospace}
.gary-setup-page .file,.gary-setup-page .step{border-top:1px solid #e4e8ef;padding:8px 0}.gary-setup-page .file:first-of-type,.gary-setup-page .step:first-of-type{border-top:0}.gary-setup-page .file b{display:block;color:var(--gary-ink)}
.gary-setup-page .step{display:grid;grid-template-columns:27px 1fr;gap:8px}.gary-setup-page .num{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;background:#eaf2f8;color:var(--gary-blue-text);font-weight:800;font-size:11px}
.gary-setup-page .tags{margin:2px 0 7px}.gary-setup-page .tag{display:inline-block;margin:2px 3px 2px 0;padding:3px 8px;border-radius:99px;font:700 11px/1.4 "Geist Mono",monospace;background:#eaf2f8;color:var(--gary-blue-text)}.gary-setup-page .tag:nth-child(2){background:#fff7dc;color:var(--gary-yellow-text)}.gary-setup-page .tag:nth-child(3){background:#fff0ee;color:var(--gary-coral-text)}.gary-setup-page .tag:nth-child(4){background:#eaf8ef;color:var(--gary-green-text)}
.gary-setup-page .note{font-size:12px;color:var(--gary-muted);margin-top:7px}.gary-setup-page .footer{margin-top:10px;font:600 11px/1.2 "Geist Mono",monospace;color:var(--gary-muted);text-align:right}
@media(max-width:760px){.gary-setup-page .s4,.gary-setup-page .s5,.gary-setup-page .s7,.gary-setup-page .s8{grid-column:span 12}.gary-setup-page{padding:13px}}
`;

export default function RouseAndHolderPage() {
  return (
    <main className="gary-setup-page">
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />

      <div className="bar">
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="kicker">Gary Rouse · September 18, 2026</div>
      <h1>Build the business first</h1>
      <p className="lead">
        Start with the version-two cold-email reply document. Use it to shape the business files, then build the
        cold-email steps.
      </p>

      <div className="ask">
        <b>Your next move:</b> Put your version-two cold-email reply document in the <code>inputs</code> folder, then
        run <code>grill-with-docs</code> to find gaps before you fill the four business files.
      </div>

      <div className="grid">
        <section className="card s5">
          <h2>Start here</h2>
          <ol className="tight">
            <li>Start with your version-two cold-email reply document.</li>
            <li>
              Put it in the <code>inputs</code> folder.
            </li>
            <li>
              Run <code>grill-with-docs</code> to find gaps.
            </li>
            <li>Use the helper skills to ask and answer the next questions.</li>
            <li>Save the answers in four files.</li>
            <li>Use those files to build the email steps.</li>
          </ol>
          <p className="note">Start with your own business and offer. The client workflow comes after the foundation is clear.</p>
        </section>

        <section className="card s7">
          <h2>Repo shape</h2>
          <pre className="tree">
            {"business-ai-workspace/\\n├── README.md\\n├── AGENTS.md\\n├── CONTEXT.md\\n├── inputs/\\n│   └── newest-business-plan.md\\n├── business/\\n│   ├── brand-foundation.md\\n│   ├── voice-rules.md\\n│   └── offer-and-audience.md\\n├── outputs/\\n│   ├── research/\\n│   └── drafts/\\n└── .agents/skills/\\n    ├── business-setup/\\n    └── cold-email-workflow/"}
          </pre>
        </section>

        <section className="card s7">
          <h2>The four main files</h2>
          <div className="file">
            <b>
              <code>CONTEXT.md</code>
            </b>
            What is true now. What is still not clear. What Gary should do next.
          </div>
          <div className="file">
            <b>
              <code>brand-foundation.md</code>
            </b>
            Why the business exists. What makes it useful. What proof Gary has.
          </div>
          <div className="file">
            <b>
              <code>voice-rules.md</code>
            </b>
            How Gary talks. Words he likes. Words he does not want to use.
          </div>
          <div className="file">
            <b>
              <code>offer-and-audience.md</code>
            </b>
            Who Gary helps. What problem they have. What he sells. What they get.
          </div>
          <p className="note">The files hold the facts. The skills read the facts and help Gary do the work.</p>
        </section>

        <section className="card s5">
          <h2>Five helper skills</h2>
          <div className="tags">
            <span className="tag">grill-with-docs</span>
            <span className="tag">grilling</span>
            <span className="tag">domain-modeling</span>
            <span className="tag">research</span>
            <span className="tag">grill-me</span>
          </div>
          <ul className="tight">
            <li>
              <b>grill-with-docs:</b> reads Gary’s plan and finds gaps.
            </li>
            <li>
              <b>grilling:</b> asks the next best question.
            </li>
            <li>
              <b>domain-modeling:</b> gives each key idea one clear name.
            </li>
            <li>
              <b>research:</b> checks what is true.
            </li>
            <li>
              <b>grill-me:</b> tests a rough idea before Gary uses it.
            </li>
          </ul>
        </section>

        <section className="card s8">
          <h2>First work session</h2>
          <div className="step">
            <div className="num">1</div>
            <div>
              <b>Set it up.</b> Make the repo and link it to ChatGPT or Codex.
            </div>
          </div>
          <div className="step">
            <div className="num">2</div>
            <div>
              <b>Add your starting document.</b> Put the version-two cold-email reply document in <code>inputs</code>.
            </div>
          </div>
          <div className="step">
            <div className="num">3</div>
            <div>
              <b>Run grill-with-docs.</b> Find what is clear, what is missing, and what does not match.
            </div>
          </div>
          <div className="step">
            <div className="num">4</div>
            <div>
              <b>Fill the four files.</b> Gary checks each part before it is saved.
            </div>
          </div>
          <div className="step">
            <div className="num">5</div>
            <div>
              <b>Check the market.</b> Learn how buyers talk about the problem and what proof they need.
            </div>
          </div>
          <div className="step">
            <div className="num">6</div>
            <div>
              <b>Build the email steps.</b> Pick the list, message, checks, and way to track replies.
            </div>
          </div>
        </section>

        <section className="card s4">
          <h2>We are done when</h2>
          <ul className="tight">
            <li>Gary can say what he sells in one minute.</li>
            <li>He knows who should buy it.</li>
            <li>The offer gives one clear win.</li>
            <li>The words sound like Gary.</li>
            <li>Proof is real or marked as not checked.</li>
            <li>Each email uses the four files.</li>
            <li>Gary checks each email before it sends.</li>
          </ul>
          <h3>Next move</h3>
          <p>Use the version-two cold-email reply document as the first test. Fix the template when you get stuck.</p>
        </section>
      </div>

      <div className="footer">Singleton Systems</div>
    </main>
  );
}
