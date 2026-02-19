import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════
// STRATEGIC SPRINT — Tech/Consumer Intelligence
// Design matches AdvisorSprint (CPG tool) exactly
// ═══════════════════════════════════════════════════════

const MOCK_MODE = true;
const GA4_ID = "G-XXXXXXXXXX";

const gaEvent = (name, params = {}) => {
  if (typeof window.gtag === "function" && GA4_ID !== "G-XXXXXXXXXX") {
    window.gtag("event", name, params);
  }
};

const initGA = () => {
  if (GA4_ID === "G-XXXXXXXXXX") return;
  const s1 = document.createElement("script");
  const s2 = document.createElement("script");
  s1.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
  s1.async = true;
  document.head.appendChild(s1);
  s2.text = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', '${GA4_ID}');
  `;
  document.head.appendChild(s2);
};

// Color palette (matches AdvisorSprint exactly)
const P = {
  forest: "#1a3325",
  forestMid: "#2d5142",
  forestSoft: "#3d6b54",
  parchment: "#faf8f4",
  cream: "#f5f2ed",
  white: "#ffffff",
  sand: "#9b8c78",
  gold: "#c8922a",
  terra: "#d4724a",
  terraSoft: "#e8956f",
  terracream: "#f4c4b0",
  ink: "#2b2b2b",
  inkMid: "#4a4a4a",
  inkSoft: "#6b6b6b",
  inkFaint: "#9a9a9a",
};

// Agents for Strategic Sprint
const AGENTS = [
  { id:"signals",     wave:1, icon:"◈", label:"Market Signals",        sub:"TAM expansion, unit economics, capital environment"        },
  { id:"competitive", wave:1, icon:"◈", label:"Competitive Landscape", sub:"Positioning map, where you win & lose"                     },
  { id:"channels",    wave:1, icon:"◈", label:"Channel Strategy",      sub:"Acquisition mix, CAC efficiency, reallocation"             },
  { id:"segments",    wave:1, icon:"◈", label:"Customer Segments",     sub:"Core users, adjacent opportunities, whitespace"            },
  { id:"pivot",       wave:2, icon:"◈", label:"GTM Blueprint",         sub:"Strategic synthesis from Wave 1 agents"                    },
  { id:"kpis",        wave:2, icon:"◈", label:"Operating Rhythm",      sub:"North Star metric, weekly/monthly/quarterly cadence"       },
  { id:"narrative",   wave:2, icon:"◈", label:"Investment Memo",       sub:"Situation-Complication-Conviction narrative"               },
];

const W1 = AGENTS.filter(a=>a.wave===1).map(a=>a.id);
const W2 = AGENTS.filter(a=>a.wave===2).map(a=>a.id);

// Prompt templates
const makePrompt = (id, company, ctx, synthCtx) => {
  const base = `You are a senior VC analyst running a rapid intelligence sprint on ${company}.`;
  const research = `\n\n**RESEARCH ACCESS:** You have web search. Use it to find data from: a16z, Sequoia, Benchmark, CB Insights, PitchBook, Crunchbase, Goldman Sachs equity research, Gartner, Forrester, SensorTower, company S-1s/10-Ks. Cite source + date. If no data: write "No recent public data."\n`;

  const prompts = {
    signals: `${base} Agent 1/7. Surface market signals that change how investors think about this space.${research}${ctx}\n\nOUTPUT: Category snapshot, wedge expanding, unit economics (2-3 real companies with CAC/LTV), hidden risk, capital environment, contrarian insight. 500-700 words.`,
    
    competitive: `${base} Agent 2/7. Map competitive landscape honestly.${research}${ctx}\n\nOUTPUT: Competitive table (top 5), 2×2 positioning map in code block, where ${company} wins/loses, substitution risk, funding gap, blind spot. 600-800 words.`,
    
    channels: `${base} Agent 3/7. Diagnose acquisition channels.${research}${ctx}\n\nOUTPUT: Current mix (cite SimilarWeb/BuiltWith), efficiency per channel, reallocation thesis, hidden leverage, channel risk, CAC trends. 600-800 words.`,
    
    segments: `${base} Agent 4/7. Identify segments ${company} should own.${research}${ctx}\n\nOUTPUT: Core segment today, underserved adjacent, net-new whitespace, sequencing (which segment first), Pareto check, segment trap. 600-800 words.`,
    
    pivot: `${base} Agent 5/7 - SYNTHESIS. Wave 1 complete.\n${synthCtx || "[Analysis provided]"}${research}${ctx}\n\nOUTPUT: GTM thesis (2-3 sentences), what's working, what's broken, strategic bet, capital reallocation, risk, 90-day roadmap. 600-800 words.`,
    
    kpis: `${base} Agent 6/7 - SYNTHESIS. All analysis complete.\n${synthCtx || "[Outputs provided]"}${research}${ctx}\n\nOUTPUT: North Star metric (why/target), 3 supporting metrics, weekly/monthly/quarterly rhythm, vanity metric trap. 500-600 words.`,
    
    narrative: `${base} Agent 7/7 - FINAL SYNTHESIS.\n${synthCtx || "[Complete]"}${research}${ctx}\n\nOUTPUT: Situation-Complication-Conviction memo, bear case, the ask (if fundraising). 800-1000 words.`,
  };

  return prompts[id] || "";
};

// Mock data (abbreviated - use full Substack data in production)
const MOCK = {
  signals: `## CATEGORY SNAPSHOT\nCreator monetization, paid newsletters. Substack = media unbundling + direct economics.\n\n## WEDGE EXPANDING\nMedia collapse: BuzzFeed, Vice shut down. Pew: -26% newsroom jobs. Casey Newton: $800K/yr in 12mo.\n\n## UNIT ECONOMICS\nStratechery: $3M/yr, $0 CAC, 90% margin. Lenny: $4M ARR, $25 CAC. Top 10 writers = 15% GMV.\n\n## RISK\n80% traffic direct/email. No discovery. If top 50 leave, new writers can't grow.\n\n## CAPITAL\na16z $65M at $650M (13x GMV vs Patreon 8x).\n\n## CONTRARIAN\nBulls miss: 40% free churn. Bears miss: Top 5% <5% churn, 10x LTV.`,
  
  competitive: `## COMPETITIVE SET\n| Competitor | Positioning | Funding |\n|---|---|---|\n| Beehiiv | Growth tools | $12.5M |\n| Ghost | Open-source | Bootstrap |\n| Medium | Algorithm | $132M |\n| Patreon | Membership | $415M |\n\n## 2×2 MAP\n\`\`\`\n    OWNED\n      |\n Sub | Ghost\n     |\n← ——+—— →\nBee | Pat\n     |\n  PLATFORM\n\`\`\`\n\n## WHERE WINS\nSimplicity. NPS 70+.\n\n## WHERE LOSES\nNo growth engine.\n\n## RISK\nTwitter/X competition.`,
  
  channels: `## CURRENT MIX\nDirect 80%, SEO 10%, Twitter 8%, Paid <2%.\n\n## EFFICIENCY\nDirect: $0 CAC for established. SEO: Fragmented. Twitter: Algorithm hurts links.\n\n## REALLOCATION\nCut paid ads. Double cross-promo.\n\n## LEVERAGE\nPublisher partnerships.\n\n## RISK\nTwitter dependency (60-70% traffic).`,
  
  segments: `## CORE SEGMENT\nExiled journalists (35-50, laid off, 20K-100K Twitter). Want independence + economics.\n\n## UNDERSERVED\nCorporate experts (consultants, academics, LinkedIn 5K+). Need B2B pricing.\n\n## WHITESPACE\nYouTube creators diversifying revenue.\n\n## SEQUENCING\nCorporate experts next (higher LTV, lower churn).\n\n## PARETO\nTop 10% = 70% GMV. Winner-take-all.`,
  
  pivot: `## GTM THESIS\nStop democratization. Own top 500 professional writers. 10% drive 70% GMV.\n\n## WORKING\nSimplicity (NPS 70+), 10% transparent pricing.\n\n## BROKEN\nMass-market positioning, consumer social features.\n\n## BET\nSubstack Pro for corporate experts at $50-200/mo.\n\n## REALLOCATION\nCut 30% from consumer experiments. Reallocate to enterprise features + B2B sales.\n\n## RISK\nExclusivity could backfire.\n\n## ROADMAP\nWk 1-4: Recruit 50 experts. Wk 5-8: Ship B2B features. Wk 9-12: Measure + iterate.`,
  
  kpis: `## NORTH STAR\nPaid Subscriber Retention (90-day). Current 60-70% top-tier. Target: 75% by Q3.\n\n## SUPPORTING\n1. Cross-sub rate: <5% → 20%\n2. Publish consistency: 60% target\n3. B2B share: <10% → 25%\n\n## WEEKLY\nCEO/Product/Writer Success. Mon 9AM. Review retention, discuss churn risks, decide outreach.\n\n## MONTHLY\nFull leadership. First Tue. Review trends, discuss roadmap, decide budget.\n\n## QUARTERLY\nLeadership + Board. Review GTM scorecard, discuss strategic bets, decide continue/pivot.\n\n## VANITY TRAP\nTotal signups (500K+ but 80% <100 subs, never monetize).`,
  
  narrative: `## SITUATION\nCreator monetization. $15B+ economy. Media collapse accelerating. Unit economics beat Patreon/YouTube.\n\n## COMPLICATION\nGrowth engine broken. 80% direct traffic. <1% have 5K+ paid subs. Top 10% drive 70% GMV but underserved.\n\n## CONVICTION\n**Insight:** Own top 500 writers, not democratize. **Wedge:** Exiled journalists → corporate experts. **Moat:** Cross-sub network effects (20% subscribe to 2+). **Metrics:** 90-day retention 75%, cross-sub 20%, B2B 25%.\n\n## BEAR CASE\nTop writers can leave (email portable). Counter: Switching costs operational. Infrastructure value > fees.\n\n## THESIS\nSubstack = Bloomberg Terminal of professional writing. TAM = 10K writers with audiences. Captured 2%. Next 18mo: recruit 300, ship enterprise, build network effects. GMV 3x without proportional CAC.`,
};

async function callClaude(prompt, pdfs, signal, agentId = "signals") {
  if (MOCK_MODE) {
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
    return MOCK[agentId] || MOCK.signals;
  }

  const API_ENDPOINT = "https://advisorsprint-api.vercel.app/api/claude";
  const res = await fetch(API_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal,
    body: JSON.stringify({ prompt, pdfs: pdfs.map(p => ({ name: p.name, b64: p.b64 })), agentId }),
  });

  if (res.status === 429) {
    const error = await res.json();
    throw new Error(error.message || 'Rate limit exceeded');
  }
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'API failed' }));
    throw new Error(error.message || `API error: ${res.status}`);
  }

  const data = await res.json();
  if (data.usage) {
    console.log(`[Usage] ${data.usage.global}/${data.usage.limit} sprints. ${data.usage.remaining} remaining.`);
  }
  return data.text;
}

function parseTable(block) {
  const rows = block.trim().split("\n").filter(r => r.includes("|"));
  if (rows.length < 2) return null;
  const cells = r => r.split("|").map(c => c.trim()).filter((c, i, a) => i > 0 && i < a.length - 1);
  const header = cells(rows[0]);
  const body = rows.slice(2);
  if (!header.length) return null;
  const thStyle = `padding:7px 10px;text-align:left;font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:${P.inkSoft};background:${P.parchment};border-bottom:2px solid ${P.sand};white-space:nowrap;`;
  const tdStyle = `padding:7px 10px;font-size:11px;color:${P.inkMid};border-bottom:1px solid ${P.sand};vertical-align:top;line-height:1.5;`;
  const ths = header.map(h => `<th style="${thStyle}">${h}</th>`).join("");
  const trs = body.map((r, i) => {
    const tds = cells(r).map(c => `<td style="${tdStyle}">${c}</td>`).join("");
    return `<tr style="background:${i % 2 === 0 ? P.white : P.cream}">${tds}</tr>`;
  }).join("");
  return `<div style="overflow-x:auto;margin:10px 0;border:1px solid ${P.sand};border-radius:3px;"><table style="width:100%;border-collapse:collapse;font-family:'Work Sans',sans-serif;"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table></div>`;
}

function parseAxesMap(text) {
  if (!text.includes("←") && !text.includes("AXIS") && !text.includes("HIGH") && !text.includes("OWNED") && !text.includes("PLATFORM")) return null;
  const lines = text.split("\n");
  const mapLines = [];
  let capturing = false;
  for (const line of lines) {
    if (line.trim() === "```" || line.trim() === "```plaintext") continue;
    if (line.includes("OWNED") || line.includes("PLATFORM") || line.includes("AXIS") || line.includes("←") || line.includes("→") || (capturing && line.includes("|"))) {
      capturing = true;
      mapLines.push(line);
      if (mapLines.length > 15) break;
    }
    if (capturing && line.trim() === "" && mapLines.length > 3) break;
  }
  while (mapLines.length && !mapLines[0].trim()) mapLines.shift();
  while (mapLines.length && !mapLines[mapLines.length - 1].trim()) mapLines.pop();
  if (!mapLines.length) return null;
  return `<div style="background:${P.parchment};border:1px solid ${P.sand};border-radius:3px;padding:12px 14px;margin:10px 0;overflow-x:auto;"><pre style="font-family:'JetBrains Mono',monospace;font-size:11px;color:${P.inkMid};line-height:1.8;margin:0;white-space:pre;">${mapLines.join("\n")}</pre></div>`;
}

function md(text) {
  if (!text) return "";
  let processed = text.replace(/^(\|.+\|\n)(\|[-| :]+\|\n)((?:\|.+\|\n?)+)/gm, (match) => {
    const table = parseTable(match);
    return table ? `%%TABLE%%${btoa(unescape(encodeURIComponent(table)))}%%TABLE%%` : match;
  });
  const axesMap = parseAxesMap(text);
  if (axesMap) {
    processed = processed.replace(/```[^\n]*\n([\s\S]*?)```/g, (match, content) => {
      if (content.includes("AXIS") || content.includes("←") || content.includes("OWNED") || content.includes("PLATFORM")) {
        return `%%AXES%%${btoa(unescape(encodeURIComponent(axesMap)))}%%AXES%%`;
      }
      return match;
    });
  }
  processed = processed
    .replace(/^## (.+)$/gm, `<h3 style="font-family:'Libre Baskerville',serif;font-size:14px;color:${P.forest};margin:16px 0 6px;border-bottom:1px solid ${P.sand};padding-bottom:4px;">$1</h3>`)
    .replace(/\*\*(.+?)\*\*/g, `<strong style="color:${P.ink};">$1</strong>`)
    .replace(/^- (.+)$/gm, `<div style="display:flex;gap:7px;margin:3px 0;"><span style="color:${P.terra};flex-shrink:0;">▸</span><span>$1</span></div>`)
    .replace(/\n\n/g, `</p><p style="margin:6px 0;">`)
    .replace(/\n/g, "<br/>");
  processed = processed
    .replace(/%%TABLE%%([^%]+)%%TABLE%%/g, (_, b64) => decodeURIComponent(escape(atob(b64))))
    .replace(/%%AXES%%([^%]+)%%AXES%%/g, (_, b64) => decodeURIComponent(escape(atob(b64))));
  return processed;
}

function AgentCard({ agent, status, result, index }) {
  const colors = {
    idle:    { border: P.sand, bg: P.parchment, dot: P.sand },
    queued:  { border: P.sand, bg: P.parchment, dot: P.inkFaint },
    waiting: { border: P.sand, bg: P.parchment, dot: P.inkFaint },
    running: { border: P.gold, bg: "#fffdf8", dot: P.gold },
    done:    { border: P.sand, bg: P.white, dot: P.forestSoft },
    error:   { border: P.terra, bg: "#fff5f0", dot: P.terra },
  };
  const c = colors[status] || colors.idle;
  const waveColor = agent.wave === 1 ? P.forestSoft : P.terra;

  return (
    <div data-agent={agent.id} className="print-section" style={{
      border: `1.5px solid ${c.border}`, borderRadius: 3, background: c.bg,
      overflow: "hidden", transition: "all 0.3s",
      boxShadow: status === "running" ? `0 3px 20px rgba(200,146,42,0.13)` : "none",
      animation: status === "done" ? "fadeUp 0.4s ease" : "none",
    }}>
      <div style={{ background: c.bg, padding: "12px 16px", borderBottom: `1px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: c.dot, boxShadow: status === "running" ? `0 0 8px ${c.dot}` : "none" }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: P.ink, letterSpacing: "0.02em" }}>
            {agent.icon} {agent.label}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: waveColor, background: `${waveColor}15`, padding: "3px 7px", borderRadius: 10 }}>
            WAVE {agent.wave}
          </span>
          {status === "running" && "— RUNNING"}
          {status === "queued" && "— READY"}
          {status === "waiting" && "— READY"}
          {status === "done" && <span style={{ fontSize: 11, color: P.forestSoft }}>✓</span>}
          {status === "error" && <span style={{ fontSize: 11, color: P.terra }}>⚠</span>}
        </div>
      </div>

      {!result && status === "idle" && (
        <div style={{ padding: "10px 16px", fontSize: 11, color: P.inkFaint, borderBottom: `1px solid ${P.sand}` }}>
          {agent.sub}
        </div>
      )}

      {status === "running" && (
        <div style={{ padding: "0 16px" }}>
          <div style={{ height: 2, background: P.sand, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: "100%", background: `linear-gradient(90deg, ${P.gold} 0%, ${P.gold} 50%, transparent 50%)`, backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
          </div>
        </div>
      )}

      {result && (
        <div className="agent-content" style={{
          padding: "16px 20px", fontSize: 13, color: P.inkMid, lineHeight: 1.8,
          fontFamily: "'Instrument Sans', sans-serif", maxHeight: 440, overflowY: "auto",
        }}
          dangerouslySetInnerHTML={{ __html: `<p style="margin:0">${md(result)}</p>` }}
        />
      )}

      {(status === "queued" || status === "waiting") && !result && (
        <div style={{ padding: "12px 18px", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: P.sand, animation: "pulse 1.5s infinite" }} />
          <span style={{ fontSize: 12, color: P.inkFaint, fontStyle: "italic" }}>
            Ready · Firing in parallel
          </span>
        </div>
      )}
    </div>
  );
}

function ProgressBar({ statuses, elapsed, estMins }) {
  const total = AGENTS.length;
  const done = AGENTS.filter(a => statuses[a.id] === "done").length;
  const current = AGENTS.find(a => statuses[a.id] === "running");
  const pct = Math.round((done / total) * 100);
  const w1done = W1.filter(id => statuses[id] === "done").length;
  const wave = w1done < W1.length ? 1 : 2;
  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");
  const etaSecs = estMins ? estMins * 60 : 0;
  const remSecs = Math.max(0, etaSecs - elapsed);
  const remMm = String(Math.floor(remSecs / 60)).padStart(2, "0");
  const remSs = String(remSecs % 60).padStart(2, "0");

  return (
    <div style={{ background: P.forest, borderRadius: 3, padding: "14px 20px", marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 10, color: P.sand, fontWeight: 700, letterSpacing: "0.1em" }}>
            WAVE {wave} · {done}/{total} COMPLETE
          </span>
          {current && (
            <span style={{ fontSize: 10, color: P.gold, fontStyle: "italic" }}>
              → {current.label}
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 12, fontSize: 10, color: P.sand }}>
          <span>Elapsed: {mm}:{ss}</span>
          {estMins > 0 && <span>ETA: {remMm}:{remSs}</span>}
        </div>
      </div>
      <div style={{ height: 6, background: P.forestMid, borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${P.gold} 0%, ${P.terra} 100%)`, transition: "width 0.4s ease", borderRadius: 3 }} />
      </div>
    </div>
  );
}

export default function App() {
  const [company, setCompany] = useState("");
  const [userName, setUserName] = useState("");
  const [pdfs, setPdfs] = useState([]);
  const [appState, setAppState] = useState("idle");
  const [results, setResults] = useState({});
  const [statuses, setStatuses] = useState({});
  const [hasStarted, setHasStarted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const abortRef = useRef(null);
  const timerRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    initGA();
    gaEvent("page_view", { tool: "Strategic Sprint" });
  }, []);

  const downloadPDF = () => {
    gaEvent("pdf_download", { company });
    window.print();
  };

  const handlePDF = async (e) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== "application/pdf") return alert("Please upload a PDF file");
    if (file.size > 20 * 1024 * 1024) return alert("PDF must be under 20MB");
    const b64 = await new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result.split(",")[1]);
      r.onerror = () => rej(new Error("Read failed"));
      r.readAsDataURL(file);
    });
    setPdfs([{ name: file.name, b64, size: file.size }]);
  };

  const runAgent = useCallback(async (id, prompt, signal, docs) => {
    try {
      const text = await callClaude(prompt, docs || [], signal, id);
      if (!signal.aborted) {
        setResults(r => ({ ...r, [id]: text }));
        setStatuses(s => ({ ...s, [id]: "done" }));
        gaEvent("agent_completed", { agent: id, company, chars: text.length });
      }
      return text;
    } catch (e) {
      if (e.name !== "AbortError") {
        setStatuses(s => ({ ...s, [id]: "error" }));
        setResults(r => ({ ...r, [id]: `Error: ${e.message}` }));
      }
      return "";
    }
  }, [company]);

  const runSprint = async () => {
    if (!company.trim() || appState === "running") return;

    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const signal = ctrl.signal;

    setHasStarted(true);
    setAppState("running");
    setResults({});
    setElapsed(0);

    const initStatus = {};
    AGENTS.forEach(a => initStatus[a.id] = "queued");
    setStatuses(initStatus);

    const co = company;
    const ctx = pdfs.length
      ? `User uploaded document: "${pdfs[0].name}". Extract data and cite by name.`
      : "No document uploaded. Use training knowledge, flag when outdated.";

    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);

    gaEvent("sprint_launched", {
      company: co,
      user: userName || "anonymous",
      hasDoc: pdfs.length > 0,
      timestamp: new Date().toISOString(),
    });

    for (const id of W1) {
      if (signal.aborted) return;
      setStatuses(s => ({ ...s, [id]: "running" }));
      await runAgent(id, makePrompt(id, co, ctx, null), signal, pdfs);
      await new Promise(r => setTimeout(r, 1500));
    }

    const synthCtx = W1.map(id => {
      const lines = (results[id] || "").split("\n").filter(Boolean);
      let start = 0;
      for (let j = lines.length - 1; j >= 0; j--) {
        if (lines[j].startsWith("##")) { start = j; break; }
      }
      return `[${AGENTS.find(a => a.id === id).label}]:\n${lines.slice(start).join(" ").slice(0, 400)}`;
    }).join("\n\n");

    for (const id of W2) {
      if (signal.aborted) return;
      setStatuses(s => ({ ...s, [id]: "running" }));
      await runAgent(id, makePrompt(id, co, ctx, synthCtx), signal, pdfs);
      await new Promise(r => setTimeout(r, 1500));
    }

    if (!signal.aborted) {
      clearInterval(timerRef.current);
      setStatuses(s => {
        const errorCount = Object.values(s).filter(v => v === "error").length;
        if (errorCount >= 4) {
          setAppState("idle");
        } else {
          setAppState("done");
        }
        return s;
      });
    }
  };

  const stop = () => {
    abortRef.current?.abort();
    clearInterval(timerRef.current);
    setAppState("idle");
  };

  const reset = () => {
    abortRef.current?.abort();
    setAppState("idle");
    setResults({});
    setStatuses({});
    setHasStarted(false);
    setElapsed(0);
    setPdfs([]);
    setCompany("");
    setUserName("");
  };

  const isDone = appState === "done";
  const isActive = appState === "running";
  const estMins = pdfs.length ? 4.5 : 3.5;

  return (
    <div style={{ minHeight: "100vh", background: P.parchment, fontFamily: "'Work Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Work+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:200% 0}100%{background-position:-200% 0} }
        @keyframes pulse { 0%,100%{opacity:.4}50%{opacity:1} }
        body { margin: 0; }
        @media print {
          body { background: #fff !important; }
          .no-print { display: none !important; }
          @page { size: landscape; margin: 0.6in 0.5in; }
          [data-agent] {
            page-break-before: always !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            border: 1px solid #ccc !important;
            margin-bottom: 20px !important;
            width: 100% !important;
            display: block !important;
          }
          [data-agent="signals"] { page-break-before: avoid !important; }
          .agent-content {
            max-height: none !important;
            overflow: visible !important;
            height: auto !important;
            page-break-inside: avoid !important;
          }
          .agent-content h3,
          .agent-content p,
          .agent-content div {
            page-break-inside: avoid !important;
            orphans: 3;
            widows: 3;
          }
        }
      `}</style>
{/*
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 80px" }}>
        {/* Header - matches AdvisorSprint exactly */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: P.inkFaint, marginBottom: 12 }}>
            S T R A T E G I C &nbsp; S P R I N T<br />
            P A R A L L E L &nbsp; A G E N T &nbsp; I N T E L L I G E N C E
          </div>
          <h1 style={{ fontFamily: "'Libre Baskerville',serif", fontSize: 48, fontWeight: 700, color: P.forest, margin: "0 0 14px", lineHeight: 1.1 }}>
            <span style={{ color: P.forestSoft }}>Strategy</span>Analysis
          </h1>
          <div style={{ fontSize: 15, color: P.inkMid, lineHeight: 1.6, maxWidth: 520, margin: "0 auto 6px" }}>
            Tech & Consumer Company Intelligence<br />
            <em style={{ color: P.terra }}>Analysed By 7 Parallel Agents</em>
          </div>
          <div style={{ fontSize: 12, color: P.inkSoft, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", marginTop: 12 }}>
            HARSHA BELAVADY
          </div>
          {MOCK_MODE && (
            <div style={{ marginTop: 16, padding: "8px 16px", background: "#fff3cd", border: "1px solid #ffc107", borderRadius: 3, display: "inline-block", fontSize: 12, color: "#856404" }}>
              <strong>Mock Mode:</strong> Using sample data (Substack). Set MOCK_MODE=false for real analysis.
            </div>
          )}
        </div>
*/}


      {/* ── HEADER ── */}
      <div style={{ background: P.forest, borderBottom: `3px solid ${P.terra}`, padding: "0 36px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, color: P.cream, fontStyle: "italic" }}>
            <span style={{ color: P.terraSoft }}>Advisor</span>Sprint
          </span>
          <span style={{ marginLeft: 12, fontSize: 10, color: P.sand, letterSpacing: "0.14em", textTransform: "uppercase" }}>
            Parallel Agent Intelligence
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {isRunning && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: P.gold, animation: "pulse 1s infinite" }}/>
              <span style={{ fontSize: 11, color: P.gold, fontWeight: 700 }}>
                {(() => { const cur = AGENTS.find(a => statuses[a.id] === "running"); return cur ? cur.label.toUpperCase() + " RUNNING" : "RUNNING"; })()}
              </span>
            </div>
          )}
          <div style={{ background: P.terra, color: P.cream, fontSize: 10, padding: "4px 10px", borderRadius: 2, fontWeight: 700, letterSpacing: "0.05em" }}>
            HARSHA BELAVADY
          </div>
        </div>
      </div>

      {/* ── TAB BAR ── */}
      <div style={{ background: "white", borderBottom: `1px solid ${P.sand}`, padding: "0 32px", display: "flex", gap: 2 }}>
        <div
          onClick={() => setActiveTab("sprint")}
          style={{
            padding: "14px 20px",
            fontSize: 13,
            fontWeight: 600,
            color: activeTab === "sprint" ? P.forest : P.inkSoft,
            cursor: "pointer",
            borderBottom: `2px solid ${activeTab === "sprint" ? P.forest : "transparent"}`,
            background: activeTab === "sprint" ? "#faf8f4" : "transparent",
            transition: "all .2s",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 15, opacity: activeTab === "sprint" ? 1 : 0.7 }}>◈</span>
          Intelligence Sprint
          <span style={{
            fontSize: 10,
            background: activeTab === "sprint" ? P.forestSoft : P.sand,
            color: activeTab === "sprint" ? "white" : P.inkMid,
            padding: "2px 7px",
            borderRadius: 10,
            fontWeight: 600
          }}>7</span>
        </div>
        <div
          onClick={() => { setActiveTab("dashboard"); gaEvent("dashboard_opened", { company }); }}
          style={{
            padding: "14px 20px",
            fontSize: 13,
            fontWeight: 600,
            color: activeTab === "dashboard" ? P.forest : P.inkSoft,
            cursor: "pointer",
            borderBottom: `2px solid ${activeTab === "dashboard" ? P.forest : "transparent"}`,
            background: activeTab === "dashboard" ? "#faf8f4" : "transparent",
            transition: "all .2s",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 15, opacity: activeTab === "dashboard" ? 1 : 0.7 }}>◇</span>
          Operating Dashboard
          <span style={{
            fontSize: 10,
            background: activeTab === "dashboard" ? P.forestSoft : P.sand,
            color: activeTab === "dashboard" ? "white" : P.inkMid,
            padding: "2px 7px",
            borderRadius: 10,
            fontWeight: 600
          }}>21</span>
        </div>
      </div>

      {/* ── SPRINT TAB CONTENT ── */}
      {activeTab === "sprint" && (
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "36px 20px" }}>

        {/* ── HERO (only before sprint starts) ── */}
        {!hasStarted && (
          <div style={{ textAlign: "center", marginBottom: 44, animation: "fadeUp 0.5s ease" }}>
            {MOCK_MODE && (
              <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#fff3cd", border:"1.5px solid #c8922a", borderRadius:2, padding:"7px 14px", marginBottom:16, fontSize:12, color:"#7a5800", fontWeight:700 }}>
                🧪 MOCK MODE — Sample output only. Set MOCK_MODE = false in App.js to use real Claude API.
              </div>
            )}
            <div style={{ fontSize: 12, color: P.terra, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 14 }}>
              Rapid Intelligence Sprint. Human &amp; AI Powered
            </div>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 38, color: P.forest, lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: 16 }}>
              CPG Brand &amp; Market Insights<br/>
              <em style={{ color: P.terra }}>Analysed By 7 Parallel Agents</em>
            </h1>
            <p style={{ fontSize: 14, color: P.inkSoft, maxWidth: 535, margin: "0 auto 28px", lineHeight: 1.8 }}>
              In Wave 1, 4 Analysis Agents Fire Simultaneously Then 3 Synthesis Agents in Wave 2
            </p>

            {/* Architecture diagram */}
            <div style={{ display: "inline-flex", background: P.parchment, border: `1px solid ${P.sand}`, borderRadius: 3, overflow: "hidden", fontSize: 12 }}>
              <div style={{ padding: "14px 20px", borderRight: `1px solid ${P.sand}` }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: P.inkFaint, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>Wave 1 · 4 Analysis Agents</div>
                {AGENTS.filter(a=>a.wave===1).map(a=>(
                  <div key={a.id} style={{ color: P.forestSoft, fontWeight: 600, marginBottom: 5, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 14, height: 14, borderRadius: "50%", background: P.forestSoft, color: P.white, fontSize: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>●</span>
                    {a.label}
                  </div>
                ))}
              </div>
              <div style={{ padding: "14px 10px", display: "flex", alignItems: "center", color: P.sand, fontSize: 18 }}>→</div>
              <div style={{ padding: "14px 20px" }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: P.inkFaint, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>Wave 2 · 3 Synthesis Agents</div>
                {AGENTS.filter(a=>a.wave===2).map(a=>(
                  <div key={a.id} style={{ color: P.terra, fontWeight: 600, marginBottom: 5, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 14, height: 14, borderRadius: "50%", background: P.terra, color: P.white, fontSize: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>◆</span>
                    {a.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Input Panel - matches AdvisorSprint */}
        {!hasStarted && (
          <div style={{ background: P.white, border: `1.5px solid ${P.sand}`, borderRadius: 4, padding: "28px 32px", marginBottom: 32 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: P.inkSoft, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 6 }}>
                  Company Name *
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  placeholder="e.g., Substack, Notion, BeReal"
                  style={{ width: "100%", padding: "10px 14px", fontSize: 14, border: `1.5px solid ${P.sand}`, borderRadius: 3, fontFamily: "'Work Sans',sans-serif", outline: "none" }}
                  onFocus={e => e.target.style.borderColor = P.forest}
                  onBlur={e => e.target.style.borderColor = P.sand}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: P.inkSoft, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 6 }}>
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                  placeholder="For analytics tracking"
                  style={{ width: "100%", padding: "10px 14px", fontSize: 14, border: `1.5px solid ${P.sand}`, borderRadius: 3, fontFamily: "'Work Sans',sans-serif", outline: "none" }}
                  onFocus={e => e.target.style.borderColor = P.forest}
                  onBlur={e => e.target.style.borderColor = P.sand}
                />
              </div>
            </div>

            <div style={{ marginBottom: 22 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: P.inkSoft, letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 6 }}>
                Upload Report (Optional)
              </label>
              <input ref={fileRef} type="file" accept=".pdf" onChange={handlePDF} style={{ display: "none" }} />
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button onClick={() => fileRef.current?.click()} style={{ background: P.white, border: `1.5px solid ${P.sand}`, color: P.ink, padding: "10px 18px", borderRadius: 3, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Work Sans',sans-serif", transition: "all .2s" }}>
                  {pdfs.length ? "✓ Replace PDF" : "📎 Attach PDF"}
                </button>
                {pdfs.length > 0 && (
                  <div style={{ fontSize: 12, color: P.inkMid }}>
                    {pdfs[0].name} ({(pdfs[0].size / 1024).toFixed(0)} KB)
                    <button onClick={() => setPdfs([])} style={{ marginLeft: 8, background: "none", border: "none", color: P.terra, cursor: "pointer", fontSize: 12 }}>✕ Remove</button>
                  </div>
                )}
              </div>
              {pdfs.length > 0 && (
                <div style={{ marginTop: 8, padding: "8px 12px", background: P.cream, borderRadius: 3, fontSize: 11, color: P.inkMid }}>
                  ✓ All 7 agents will read and cite this document. Estimated sprint time: ~{estMins} min.
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={runSprint}
                disabled={!company.trim()}
                style={{ flex: 1, background: company.trim() ? P.forest : P.sand, color: "white", border: "none", padding: "14px 28px", borderRadius: 3, fontSize: 14, fontWeight: 700, cursor: company.trim() ? "pointer" : "not-allowed", fontFamily: "'Work Sans',sans-serif", letterSpacing: ".03em", transition: "all .2s" }}
              >
                {isActive ? "● RUNNING..." : "→ LAUNCH SPRINT"}
              </button>
              {isActive && (
                <button onClick={stop} style={{ background: P.terra, color: "white", border: "none", padding: "14px 22px", borderRadius: 3, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Work Sans',sans-serif" }}>
                  ✕ STOP
                </button>
              )}
            </div>

            <div style={{ marginTop: 16, fontSize: 11, color: P.inkFaint, textAlign: "center" }}>
              {pdfs.length
                ? ` · 7 agents will read "${pdfs[0].name}" and generate analysis`
                : " · 7 agents will analyse using Claude training knowledge (mid-2025)"}
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {isActive && (
          <div className="no-print">
            <ProgressBar statuses={statuses} elapsed={elapsed} estMins={estMins} />
          </div>
        )}

        {/* Completion Banner */}
        {isDone && (
          <div className="no-print" style={{ background: P.forestMid, borderRadius: 4, padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, animation: "fadeUp 0.4s ease" }}>
            <div>
              <div style={{ fontSize: 14, color: "white", fontWeight: 600 }}>✓ Sprint complete · {company} · {Math.floor(elapsed / 60)}m {elapsed % 60}s</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.7)", marginTop: 3 }}>All 7 agents complete · Full intelligence sprint ready</div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={downloadPDF} style={{ background: "transparent", border: "1px solid rgba(255,255,255,.4)", color: "white", padding: "9px 18px", borderRadius: 3, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Work Sans',sans-serif" }}>
                ⬇ Download PDF
              </button>
              <button onClick={reset} style={{ background: P.terra, color: "white", border: "none", padding: "9px 20px", borderRadius: 3, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Work Sans',sans-serif" }}>
                → New Sprint
              </button>
            </div>
          </div>
        )}

        {/* Agent Grid */}
        {hasStarted && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {AGENTS.filter(a => a.wave === 1).map((a, i) => (
              <AgentCard key={a.id} agent={a} status={statuses[a.id] || "idle"} result={results[a.id]} index={i} />
            ))}
            {AGENTS.filter(a => a.wave === 2).map((a, i) => (
              <div key={a.id} style={{ gridColumn: "1 / -1" }}>
                <AgentCard agent={a} status={statuses[a.id] || "idle"} result={results[a.id]} index={i + 4} />
              </div>
            ))}
          </div>
        )}

        {/* Bottom completion */}
        {isDone && (
          <div className="no-print" style={{ marginTop: 40, background: `linear-gradient(135deg, ${P.forest} 0%, ${P.forestMid} 100%)`, borderRadius: 4, padding: "24px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontFamily: "'Libre Baskerville',serif", fontSize: 18, color: P.cream, fontStyle: "italic", marginBottom: 3 }}>Intelligence Sprint Complete</div>
              <div style={{ fontSize: 12, color: P.sand }}>7 agents · GTM strategy · Operating cadence · Investment narrative · Ready to present</div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={downloadPDF} style={{ background: "transparent", border: `1.5px solid rgba(255,255,255,0.3)`, color: P.cream, padding: "10px 20px", borderRadius: 2, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                ⬇ DOWNLOAD PDF
              </button>
              <button onClick={reset} style={{ background: P.terra, color: P.cream, border: "none", padding: "10px 22px", borderRadius: 2, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                NEW SPRINT →
              </button>
            </div>
          </div>
        )}

        {/* Methodology */}
        {!hasStarted && (
          <div style={{ marginTop: 52, borderTop: `1px solid ${P.sand}`, paddingTop: 34 }}>
            <div style={{ fontSize: 10, color: P.inkFaint, textAlign: "center", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 26 }}>The Advisory Methodology</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
              {[
                { icon: "◈", title: "4 Analysis Agents", sub: "Market signals, competitive landscape, channel strategy, customer segments" },
                { icon: "◆", title: "3 Synthesis Agents", sub: "GTM blueprint, operating rhythm, investment memo" },
                { icon: "◇", title: "Sharp Prompts", sub: "Forces specifics, flags uncertainty, produces insight" },
                { icon: "◊", title: "Anti-Hallucination", sub: "Real examples, cite sources, unknown > guessing" },
              ].map((m, i) => (
                <div key={i} style={{ textAlign: "center", padding: "20px 16px", background: P.white, border: `1px solid ${P.sand}`, borderRadius: 3 }}>
                  <div style={{ fontSize: 24, color: P.forestSoft, marginBottom: 8 }}>{m.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: P.ink, marginBottom: 6 }}>{m.title}</div>
                  <div style={{ fontSize: 11, color: P.inkMid, lineHeight: 1.5 }}>{m.sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 60, paddingTop: 32, borderTop: `1px solid ${P.sand}`, textAlign: "center", fontSize: 11, color: P.inkFaint, lineHeight: 1.7 }}>
          <div style={{ maxWidth: 720, margin: "0 auto", marginBottom: 16 }}>
            Built by <strong style={{ color: P.forest }}>Harsha Belavady</strong>. In Wave 1, 4 Analysis Agents fire in parallel. In Wave 2, 3 Synthesis Agents fire simultaneously — providing the quickest strategic analysis for tech and consumer companies.
          </div>
          <div style={{ fontSize: 10, color: P.inkFaint }}>
            Powered by Claude Sonnet 4 · 7 parallel agents · ~4 minutes per sprint
          </div>
        </div>
      </div>
    </div>
  );
}
