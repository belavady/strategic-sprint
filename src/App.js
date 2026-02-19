// Copy lines 1-912 from original (everything before md function)
import { useState, useEffect, useRef, useCallback } from "react";

// ================================
// STRATEGIC INTELLIGENCE SPRINT
// Tech/Consumer Intelligence for VCs and Founders
// By Harsha Belavady
// ================================

const MOCK_MODE = true;
const GA4_ID = "G-XXXXXXXXXX";
// API calls go through Vercel proxy — no client-side key needed

// Google Analytics
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

// Color palette - Forest/Teal theme
const P = {
  forest: "#1a3325",
  forestMid: "#2d5142",
  forestSoft: "#3d6b54",
  teal: "#2a7d6f",
  tealLight: "#e8f4f1",
  tealDark: "#1a5449",
  parchment: "#faf8f4",
  cream: "#f5f2ed",
  white: "#ffffff",
  sand: "#9b8c78",
  gold: "#c8922a",
  terra: "#d4724a",
  terraSoft: "#e8956f",
  ink: "#2b2b2b",
  inkMid: "#4a4a4a",
  inkSoft: "#6b6b6b",
  inkFaint: "#9a9a9a",
};

// Agent definitions
const AGENTS = [
  { id:"signals",     wave:1, icon:"◈", label:"Market Signals",        sub:"TAM, unit economics, capital environment"              },
  { id:"competitive", wave:1, icon:"◆", label:"Competitive Scan",      sub:"Positioning map, where you win/lose"                   },
  { id:"channels",    wave:1, icon:"◇", label:"Channel Audit",         sub:"Acquisition mix, reallocation thesis"                  },
  { id:"segments",    wave:1, icon:"◊", label:"Segment Whitespace",    sub:"User personas, underserved opportunities"              },
  { id:"pivot",       wave:2, icon:"◆", label:"GTM Strategy",          sub:"Synthesis of all 4 analysis agents"                    },
  { id:"kpis",        wave:2, icon:"◈", label:"Operating Cadence",     sub:"North Star metric, weekly/monthly/quarterly rhythm"    },
  { id:"narrative",   wave:2, icon:"◇", label:"Investment Narrative",  sub:"Situation-Complication-Conviction memo"                },
];
const W1 = AGENTS.filter(a=>a.wave===1).map(a=>a.id);
const W2 = AGENTS.filter(a=>a.wave===2).map(a=>a.id);

// Prompt templates - Tech/Consumer focused
const makePrompt = (id, company, ctx, synthCtx) => {
  const base = `You are a senior VC analyst running a rapid intelligence sprint on ${company}.`;
  
  const prompts = {
    signals: `${base} This is Agent 1 of 7 running in parallel. Your job: surface 3-4 market-level signals that change how investors should think about this space.

CRITICAL RULES TO PREVENT HALLUCINATION:
- If you don't have specific data, write "No public data available" — do NOT make up numbers
- When citing a source, include the publication and approximate date if you know it
- If a claim is based on general market knowledge vs. specific source, say "Based on typical [category] patterns"
- Use ranges instead of precise numbers when uncertain (e.g., "$50-80 CAC" not "$67 CAC")
- Default to "Unknown" rather than guessing


**RESEARCH ACCESS:** You have web search. Use it to find recent data from: a16z, Sequoia, Benchmark research; CB Insights, PitchBook, Crunchbase; Goldman Sachs, Morgan Stanley equity research; Gartner, Forrester, SensorTower; company S-1s/10-Ks. Cite source + date (e.g., "per a16z State of Crypto 2023"). If you can't find data, write "No recent public data" — don't guess.

${ctx}

## OUTPUT FORMAT (strict)

## CATEGORY SNAPSHOT
One sentence defining the category. Then one sentence on where ${company} sits within it.

## THE WEDGE THAT'S EXPANDING
What macro shift is making this space investable *right now*?
- Name the specific behavior change, cost curve shift, or regulation
- Quantify if possible with real examples
- If you don't have numbers, describe the qualitative shift

## UNIT ECONOMICS REALITY CHECK
What do the *actual breakout companies* in this category look like financially?
- Pick 2-3 real named examples if you know them
- State their CAC, LTV, payback, margin (cite source or say "estimated")
- If you don't know specifics, write: "Public unit economics data unavailable"

DO NOT write generic ranges without naming a real company.

## THE RISK NO ONE IS TALKING ABOUT
What's the hidden fragility?
- Platform dependency (Apple, Google, Meta policy risk)
- Channel concentration
- Pareto distribution in revenue
- Category risk

Be specific. Name the mechanism of failure.

## CAPITAL ENVIRONMENT SIGNAL
What does recent funding/exit activity tell us?
- Name 1-2 comparable companies' recent rounds or exits (with rough valuation if known)
- Is capital flowing in or pulling back?
- Any down-rounds or shutdowns signaling category risk?

If you don't know recent funding data, say so explicitly.

## THE CONTRARIAN INSIGHT
One thing bulls are missing AND one thing bears are missing.

Be specific. If you can't think of real contrarian take, write: "No strong contrarian view."

---
Output: 500-700 words. Cite real sources by name or flag uncertainty clearly.`,

    competitive: `${base} This is Agent 2 of 7 running in parallel. Your job: map the competitive landscape with brutal honesty about where ${company} actually stands.

ANTI-HALLUCINATION RULES:
- Name real competitors with specifics, or write "No direct public competitors identified"
- When stating market share, funding, or metrics: cite source or say "estimated"
- Don't invent company names, founding dates, or funding amounts
- If you don't know a competitor's position, say so explicitly


**RESEARCH ACCESS:** You have web search. Use it to find recent data from: a16z, Sequoia, Benchmark research; CB Insights, PitchBook, Crunchbase; Goldman Sachs, Morgan Stanley equity research; Gartner, Forrester, SensorTower; company S-1s/10-Ks. Cite source + date (e.g., "per a16z State of Crypto 2023"). If you can't find data, write "No recent public data" — don't guess.

${ctx}

## OUTPUT FORMAT (strict)

## COMPETITIVE SET (Top 5 Max)
List the 5 most relevant competitors. For each:

| Competitor | Positioning | Last Known Funding | vs. ${company} |
|---|---|---|---|

If you can only identify 2-3 real competitors, list those. Don't pad with tangential companies.

## THE 2×2 POSITIONING MAP
Choose 2 axes that actually matter for this category. Map ${company} and top 3-4 competitors.

Axes must be:
- Specific to this category (not generic "price vs. quality")
- Defensible (not subjective)
- Trade-offs (not "good vs. bad")

Format as ASCII art:
\`\`\`
         AXIS 1 HIGH
               |
    CompetitorA | ${company}
               |
AXIS 2 ←———————+———————→ AXIS 2
  LOW          |          HIGH
    CompetitorB |
               |
         AXIS 1 LOW
\`\`\`

## WHERE ${company.toUpperCase()} WINS
What's the 1-2 things ${company} does structurally better?
- Be specific about the mechanism
- Cite evidence if you have it

## WHERE ${company.toUpperCase()} LOSES  
What's the 1-2 structural disadvantages vs. best competitor?
- Be honest. "Nothing" is never the answer.
- Focus on things that are hard to fix

## THE SUBSTITUTION RISK
What non-obvious thing could kill this entire category?

## COMPETITIVE FUNDING GAP
How does ${company}'s capital compare to best-funded competitor?

State actual amounts if you know them, or write "Funding data unavailable."

## THE BLIND SPOT
What's the one thing this competitive set is collectively ignoring?

If no obvious blind spot, write: "No obvious blind spot — category is well-contested."

---
Output: 600-800 words. Real company names only. Flag uncertainty clearly.`,

    channels: `${base} This is Agent 3 of 7 running in parallel. Your job: diagnose how ${company} acquires users/customers, what's working, what's broken, and where to reallocate.

ANTI-HALLUCINATION RULES:
- Don't invent traffic numbers, conversion rates, or CAC figures
- When stating channel performance, cite source or say "estimated based on [public signal]"
- If you don't have channel data, describe qualitatively
- Real examples only


**RESEARCH ACCESS:** You have web search. Use it to find recent data from: a16z, Sequoia, Benchmark research; CB Insights, PitchBook, Crunchbase; Goldman Sachs, Morgan Stanley equity research; Gartner, Forrester, SensorTower; company S-1s/10-Ks. Cite source + date (e.g., "per a16z State of Crypto 2023"). If you can't find data, write "No recent public data" — don't guess.

${ctx}

## OUTPUT FORMAT (strict)

## CURRENT CHANNEL MIX (Best Guess)
Where does ${company}'s traffic/customers likely come from?
- List top 3-5 channels
- If you have data (SimilarWeb, BuiltWith, public statements), cite it
- If guessing based on observed behavior, say "Inferred from [signal]"

If you don't have signals, write: "Channel mix data unavailable."

## CHANNEL EFFICIENCY DIAGNOSIS
For each major channel:
1. What's working? (specific proof point)
2. What's broken? (specific failure mode)
3. Unit economics (if known)

If you don't have channel-level data, write: "Insufficient public data."

## THE REALLOCATION THESIS
Where should ${company} shift spend/focus?
- Name the underinvested channel with highest ROI potential
- Name the overinvested channel to cut
- Quantify if possible

## THE HIDDEN LEVERAGE
What's the one channel shift that could 10x growth but isn't being done?

## THE CHANNEL RISK
What's the single biggest channel dependency that could break?

## CAPITAL EFFICIENCY CHECK
How does CAC trend compare to category benchmarks?

If you have data, cite it. If not, describe what trajectory should look like.

---
Output: 600-800 words. Don't invent metrics. Use directional logic if no numbers available.`,

    segments: `${base} This is Agent 4 of 7 running in parallel. Your job: identify the user segment(s) ${company} should own — existing or net-new — with conviction about timing and TAM.

ANTI-HALLUCINATION RULES:
- Don't invent user personas or demographics without basis
- When describing segments, cite observable behavior or research
- If you don't have segment data, describe based on category patterns
- Real examples of companies that won segments


**RESEARCH ACCESS:** You have web search. Use it to find recent data from: a16z, Sequoia, Benchmark research; CB Insights, PitchBook, Crunchbase; Goldman Sachs, Morgan Stanley equity research; Gartner, Forrester, SensorTower; company S-1s/10-Ks. Cite source + date (e.g., "per a16z State of Crypto 2023"). If you can't find data, write "No recent public data" — don't guess.

${ctx}

## OUTPUT FORMAT (strict)

## CURRENT CORE SEGMENT
Who is ${company} clearly winning today?
- Describe the persona (job title, use case, pain point)
- Estimated size of this segment
- Why ${company} resonates with them specifically

If unclear who the core user is, say so.

## THE UNDERSERVED ADJACENT
What segment is adjacent to current users but underserved?
- Define the persona
- Why they're not using ${company} today (specific barrier)
- What would it take to win them (product, pricing, positioning shift)
- TAM estimate if possible

## THE NET-NEW WHITESPACE
What segment doesn't use this category at all but should?
- Define who they are
- Why they don't use existing solutions (jobs-to-be-done lens)
- What macro shift could make them addressable
- Risk: why might they never convert?

If no obvious whitespace, write: "Category appears saturated."

## SEGMENT SEQUENCING
If ${company} could only go after one new segment in next 12 months, which one?
- Why this one vs. others?
- What's the unlock mechanism?
- What's the execution risk?

## THE PARETO CHECK
What % of ${company}'s revenue likely comes from top 10% of users?

If you don't know, estimate based on category patterns (e.g., "Consumer subscription apps typically see 60-80% revenue from top 10%").

## THE SEGMENT THAT'S A TRAP
What segment looks attractive but is actually a distraction?

Be specific about why it's a trap (low LTV, high churn, misaligned needs).

---
Output: 600-800 words. Real personas, real examples. Flag when estimating vs. citing data.`,

    pivot: `${base} This is Agent 5 — a synthesis agent. Agents 1-4 (Market Signals, Competitive Scan, Channel Audit, Segment Whitespace) have completed in parallel. Your job: synthesize their findings into a focused GTM strategy with a clear thesis on what to do differently.

You have access to the following intelligence:
${synthCtx || "[Agent outputs will be provided]"}


**RESEARCH ACCESS:** You have web search. Use it to find recent data from: a16z, Sequoia, Benchmark research; CB Insights, PitchBook, Crunchbase; Goldman Sachs, Morgan Stanley equity research; Gartner, Forrester, SensorTower; company S-1s/10-Ks. Cite source + date (e.g., "per a16z State of Crypto 2023"). If you can't find data, write "No recent public data" — don't guess.

${ctx}

## OUTPUT FORMAT (strict)

## THE GTM THESIS (2-3 sentences)
What's the single most important strategic shift ${company} should make based on the intelligence?

This should synthesize across all 4 agents. Be specific and opinionated.

## WHAT'S WORKING (Keep Doing)
Based on Channel Audit and Competitive Scan:
- What 1-2 things is ${company} already doing that create defensible advantage?
- Why these specifically vs. competitors?

## WHAT'S BROKEN (Stop Doing)
Based on all agents:
- What 1-2 things is ${company} doing that waste resources or create risk?
- Why stop vs. fix?

## THE STRATEGIC BET (Start Doing)
Based on Segment Whitespace and Market Signals:
- What's the one net-new initiative that could change the trajectory?
- Why now vs. later?
- What's the 90-day milestone to validate it?

## CAPITAL ALLOCATION SHIFT
How should budget/resources reallocate?
- Cut X% from [channel/segment]
- Reallocate to [channel/segment]
- Expected outcome in 6 months

Be specific with percentages if the data supports it.

## THE RISK IN THIS PLAN
What's the biggest way this thesis could be wrong?

Don't hedge. Name the specific assumption that, if false, breaks the plan.

## 90-DAY ROADMAP
What are the 3-4 must-ship milestones to execute this thesis?

Format:
- **Week 1-4:** [Action]
- **Week 5-8:** [Action]
- **Week 9-12:** [Action]

---
Output: 600-800 words. Synthesize don't summarize. Take a position.`,

    kpis: `${base} This is Agent 6 — a synthesis agent. All analysis and GTM strategy agents have completed. Your job: define the North Star metric and operating cadence for ${company}.

You have access to:
${synthCtx || "[Agent outputs will be provided]"}


**RESEARCH ACCESS:** You have web search. Use it to find recent data from: a16z, Sequoia, Benchmark research; CB Insights, PitchBook, Crunchbase; Goldman Sachs, Morgan Stanley equity research; Gartner, Forrester, SensorTower; company S-1s/10-Ks. Cite source + date (e.g., "per a16z State of Crypto 2023"). If you can't find data, write "No recent public data" — don't guess.

${ctx}

## OUTPUT FORMAT (strict)

## NORTH STAR METRIC
**[Metric Name]** — [one sentence definition]

Why this metric?
- What behavior does it capture that revenue/users miss?
- How does it tie to the GTM thesis from Agent 5?
- What's the target (timebound)?

Example format:
"**Weekly Retained Cohorts** — % of users who return 3+ times in a week. Target: 40% by Q3 (from 28% today). This metric captures habit formation better than MAU, which can be gamed by reactivation campaigns."

## THE 3 SUPPORTING METRICS
What 3 metrics ladder up to the North Star?

For each:
- Name
- Current baseline (if known, or "Establish baseline")
- Target
- Why it matters

## WEEKLY OPERATING RHYTHM (30 min)
Who meets, when, what gets reviewed, what gets decided?

Format:
- **Attendees:** [roles]
- **Cadence:** [day/time]
- **Agenda:** Review [metrics], Discuss [topic], Decide [action]

## MONTHLY OPERATING RHYTHM (90 min)
Same format as weekly.

## QUARTERLY OPERATING RHYTHM (Half day)
Same format, but focus on strategic review vs. tactical execution.

## THE VANITY METRIC TRAP
What metric looks good but doesn't matter?

Name it specifically and explain why it's misleading.

Example: "Total signups. ${company} has 100K signups but 8% activate. Signups is a vanity metric — it makes the team feel good but doesn't predict revenue."

---
Output: 500-600 words. Define clear targets. Be specific about who does what when.`,

    narrative: `${base} This is Agent 7 — the final synthesis agent. All intelligence, strategy, and operating cadence agents have completed. Your job: write an investment-grade narrative memo for this company.

You have access to:
${synthCtx || "[All prior agent outputs]"}


**RESEARCH ACCESS:** You have web search. Use it to find recent data from: a16z, Sequoia, Benchmark research; CB Insights, PitchBook, Crunchbase; Goldman Sachs, Morgan Stanley equity research; Gartner, Forrester, SensorTower; company S-1s/10-Ks. Cite source + date (e.g., "per a16z State of Crypto 2023"). If you can't find data, write "No recent public data" — don't guess.

${ctx}

## OUTPUT FORMAT (strict)

Use the Situation-Complication-Conviction structure.

## SITUATION
What's the market context that makes ${company} interesting?
- Category definition
- TAM and why it's expanding now
- Competitive landscape snapshot

2-3 paragraphs. Set the stage without boosterism.

## COMPLICATION
What's the strategic challenge or inflection point?
- What's not working today?
- What risk/opportunity creates urgency?
- Why status quo fails?

This is where tension lives. Be specific about the problem.

## CONVICTION
Why this company, this team, this approach wins.

Cover:
- **The Insight:** What does ${company} see that others miss?
- **The Wedge:** How they enter and win
- **The Moat:** What makes it defensible over time
- **The Metrics:** What proof points validate the thesis

End with: **Investment Thesis Summary** (2-3 sentences)

## THE BEAR CASE
What's the strongest counter-argument an investor would raise?

Don't soften it. Steel-man the skeptic's position, then address it.

## THE ASK (if applicable)
If this is for fundraising:
- Round size
- Use of funds (3 bullets)
- Key milestones this capital unlocks

If not fundraising, skip this section.

---
Output: 800-1000 words. Write for an investor who's smart but unfamiliar with the company. Conviction + intellectual honesty.`,
  };

  return prompts[id] || "";
};

// Mock data - Substack example
const MOCK = {
  signals: `## CATEGORY SNAPSHOT
Creator monetization platform, specifically paid newsletters. Substack sits at the intersection of media unbundling and direct creator-to-audience economics — it's not just "blogging software," it's distribution + payments + audience ownership in one bundle.

## THE WEDGE THAT'S EXPANDING
Media institutional collapse. Since 2020: BuzzFeed News shut down (May 2023), Vice filed for bankruptcy (May 2023), Sports Illustrated laid off most staff (Jan 2024), The Messenger burned $50M in 6 months and shut down (Jan 2024). Per Pew Research (2023), newsroom employment dropped 26% from 2008 to 2023. Every high-profile journalist laid off = potential Substack migration. Casey Newton (Platformer) went from The Verge to $800K/year on Substack within 12 months. That unit economics — estimated $10-15 CAC via existing audience, $120 annual LTV on $10/mo sub, 85%+ margin — beats Patreon, Medium, and Ghost.

## UNIT ECONOMICS REALITY CHECK
**Stratechery (Ben Thompson):** Estimated $3M+/year revenue on 30K paying subs ($10/mo), effectively $0 CAC (audience built over decade via free weekly posts). ~90% margin (no platform cut).

**Lenny's Newsletter (Lenny Rachitsky):** Public data from 2022: 40K paid subs, $4M+ ARR, estimated $25 CAC via cross-promotion + Twitter. 85% margin after Substack's 10% cut.

**Substack median writer:** Per leaked internal data (The Information, Dec 2020), top 10 writers drive ~15% of GMV. Median writer makes <$500/year. This is Pareto distribution on steroids — not a creator middle class, but winner-take-all.

## THE RISK NO ONE IS TALKING ABOUT
**Discovery is broken.** 80%+ of Substack traffic is direct (typing newsletter URL) or email (outside the platform), per SimilarWeb estimates. There is no feed, no algorithm, no network effect beyond email forwarding. If the top 50 writers leave (to Ghost, Beehiiv, or self-hosted), new writers can't get found. The platform has no acquisition engine beyond the writer's existing audience. Compare to Medium (30% SEO, 25% social referral) or YouTube (70% recommended). Substack's lack of discovery means it can't create breakout writers — only monetize journalists who already have audiences.

## CAPITAL ENVIRONMENT SIGNAL
**a16z Series B (2021): $65M at $650M post-money valuation.** That's ~13x forward GMV based on estimated $50M run-rate (per TechCrunch reporting). For context: Patreon's 2021 Series F was ~8x GMV, Gumroad raised at 4x GMV. Premium pricing suggests a16z bet on network effects from bundled subscriptions and recommendation engine. But 2 years later, Substack still has no working discovery. The moat thesis hasn't materialized.

**Comparable exits:** Medium (bootstrapped, not venture-backed), Ghost (bootstrapped). No major paid newsletter platform has exited at scale. This category hasn't proven venture returns yet.

## THE CONTRARIAN INSIGHT
**Bulls miss:** Substack's 40%+ monthly churn on free subscribers (estimated based on email open rate decay) means writers need constant new signups to maintain free audience. Paid churn is lower (~5% monthly per category benchmarks), but converting free→paid requires trust built over 6-12 months. Most writers give up before monetization.

**Bears miss:** The top 5% of Substack writers have <5% annual churn and 10x higher LTV than median consumer subscriptions. For writers who hit escape velocity (5K+ paid subs), Substack becomes their business infrastructure. Switching costs are massive (email list migration, payment rails, brand risk). The real strategy isn't democratization — it's capturing the 500 writers who matter and building enterprise features for them.`,

  competitive: `## COMPETITIVE SET

| Competitor | Positioning | Last Known Funding | vs. Substack |
|---|---|---|---|
| **Beehiiv** | Newsletter platform with growth tools | $12.5M Series A, 2023 (Lightspeed) | Built-in referral system, ad network vs. pure subscription |
| **Ghost** | Open-source publishing platform | Bootstrapped, ~$8M ARR (2023) | Self-hosted option, membership tiers vs. simple paywall |
| **Medium** | Algorithm-driven content platform | $132M total (last 2015) | Feed-based discovery vs. direct-to-reader |
| **Patreon** | Creator membership platform | $415M Series F, $4B val (2021) | Multi-tier memberships, Discord integration vs. email-first |

## THE 2×2 POSITIONING MAP

\`\`\`
      OWNED AUDIENCE
(Email, no platform dependency)
            |
    Substack | Ghost
            |
SIMPLE ←————+————→ FEATURE-RICH
            |
   Beehiiv  | Patreon
            |
      PLATFORM AUDIENCE
  (Discovery algorithm)
\`\`\`

**Why quadrants matter:** Top-left (Substack/Ghost) = writers who already have audiences and want control. Bottom-right (Patreon) = creators who need platform discovery. Beehiiv is trying to be both (email ownership + growth tools). Medium gave up on subscriptions, went back to algorithm.

## WHERE SUBSTACK WINS
**Simplicity as a moat.** Substack has one job: email + paywall. No tiers, no ads, no complexity. For writers coming from institutional media (The Atlantic, NYT), this is the unlock — they want to write, not become product managers. Substack's NPS among top writers is reportedly 70+ (per investor deck leaks) because it gets out of the way.

**No rev-share dilution.** Beehiiv takes 0% but pushes ad network (which trains readers to expect free content). Patreon takes 5-12%. Substack's flat 10% + Stripe fees is expensive but predictable.

## WHERE SUBSTACK LOSES
**No growth engine.** Beehiiv's "Boost" (referral program) and "Ad Network" solve cold start. New writers can grow on Beehiiv. On Substack, if you don't bring an audience, you stay at 0. Per public Substack writer data, <1% of newsletters have 5K+ paid subs. The other 99% are below minimum wage.

**Feature stagnation.** Ghost ships comments, membership tiers, native analytics, Zapier integrations. Substack's feature velocity is glacial (took 2 years to add basic threading in comments). Writers who want customization leave for Ghost or WordPress.

## THE SUBSTITUTION RISK
**Twitter.** If Elon's creator monetization actually works (subscriptions, Super Follows, long-form posts), Substack's best writers could just publish natively on X and keep 90%+ of revenue. Substack's only defense: email list ownership. But if Twitter lets you export followers → email, that moat evaporates.

## COMPETITIVE FUNDING GAP
Substack raised $82M total. Beehiiv raised $12.5M but growing faster (claimed 3x GMV growth in 2023 vs. Substack's ~50%). Patreon raised $415M and has 8M paying members (vs. Substack's ~2M based on estimates).

**Signal:** Substack's capital isn't the constraint. Execution is. They spent 2 years building "Substack Go" (audio app) instead of fixing discovery. That's a red flag.

## THE BLIND SPOT
**AI-native writing tools.** Every newsletter platform (Substack, Beehiiv, Ghost) treats writing as manual labor. The next winner might be "describe your newsletter idea, we auto-generate drafts, manage subs, A/B test subject lines" (see Jasper for content, Poe for chatbots). First mover on AI-native newsletters wins the next generation of creators who don't want to write 1000 words/week.`,

  channels: `## CURRENT CHANNEL MIX (Best Guess)

Based on public signals (SimilarWeb, Chrome extension installs, social mentions):

- **Direct / Email: ~80%** — Writers bring their existing audiences. Substack doesn't acquire readers; writers do. This is both a strength (owned audience) and a weakness (no platform growth loop).
- **Organic Search: ~10%** — Some long-tail discovery via Google for specific topics (e.g., "climate change newsletter"), but Substack's domain authority is low. Most SEO juice stays with the writer's personal brand.
- **Social (Twitter/X): ~8%** — Writers promote on Twitter. Substack tried a "Recommendations" feature (cross-promotion between newsletters) but adoption is low (<5% of readers click through per estimated data).
- **Paid: <2%** — Minimal ad spend. Substack occasionally runs Twitter ads promoting top writers, but CAC is prohibitive for $10/mo product.

**Caveat:** Channel mix data is inferred from observable behavior. Substack doesn't publish traffic sources.

## CHANNEL EFFICIENCY DIAGNOSIS

**Direct / Email:**
- **Working:** Zero CAC for writers with existing lists. Casey Newton (Platformer) had 50K Twitter followers → 20K paid subs in Year 1. Free content → paid conversion at ~10-15% (strong for subscription products).
- **Broken:** No acquisition for writers without audiences. 80% of Substack newsletters have <100 subs. The writer carries all discovery risk.
- **Economics:** $0 CAC for established writers. $500+ CAC for unknown writers (paid ads → landing page → email → conversion over 6 months).

**Organic Search:**
- **Working:** High-intent queries (e.g., "best tech newsletter") sometimes land on Substack. Free trials convert at ~5-8%.
- **Broken:** Substack's SEO is fragmented across subdomain per writer. Google treats platformer.news and stratechery.com as separate domains. No centralized SEO authority like Medium had.
- **Economics:** $0 CAC but tiny volume. Estimated <500 paid subs/month from pure SEO.

**Social (Twitter):**
- **Working:** Writers tweet threads, link to free posts, build trust over months. Top writers (Matt Levine, Packy McCormick) have 200K+ Twitter followers funneling to Substack.
- **Broken:** Twitter algorithm demotes external links (2023 change). Click-through rates dropped ~40% (per anecdotal reports from writers). Substack's attempt to build its own social layer (Notes) has <5% adoption.
- **Economics:** Variable. If writer already has 50K+ Twitter followers, CAC is near-zero. If starting from scratch, building Twitter audience takes 1-2 years before monetization.

## THE REALLOCATION THESIS

**Cut:** Paid acquisition. Substack ran Meta ads in 2021-2022 promoting top writers (Ben Thompson, Heather Cox Richardson). Estimated $40-80 CAC for $10/mo product = 4-8 month payback, too long for venture scale. Killed in 2023. Correct decision.

**Double Down:** Cross-promotion (Recommendations). Currently only 5% of readers click "Discover" tab. Substack should algorithmically recommend newsletters in-email (like Spotify's "Discover Weekly"). If 20% of readers subscribe to a second newsletter, LTV jumps 50%. This is the only scalable growth channel that doesn't require writers to also be marketers.

**Experiment:** Bundled subscriptions. Substack launched "Substack Subscription" ($15/mo for access to multiple newsletters) in 2023 but barely markets it. This is the Netflix play — reduce churn by creating a "platform sub" vs. individual writer subs. If bundle retention is 10% better than à la carte, it changes unit economics.

## THE HIDDEN LEVERAGE

**Publisher partnerships.** Substack should recruit entire newsrooms to migrate. Example: The Athletic (pre-NYT acquisition) was 500 sports journalists on a single subscription. Substack could offer white-label infrastructure to media companies shedding staff (Vice, Vox Media). One deal = 100 writers + their audiences migrating in bulk. This is how Shopify scaled (entire merchant communities, not one store at a time).

## THE CHANNEL RISK

**Twitter dependency.** Based on public writer data, 60-70% of Substack's top newsletters cite Twitter as their #1 traffic source. If Twitter dies (unlikely but possible) or Elon fully deprioritizes external links, Substack's growth engine breaks. There is no Plan B for discovery. Substack's own "Notes" feature (Twitter clone) has failed to gain traction — writers post on real Twitter, not Substack's walled garden.

## CAPITAL EFFICIENCY CHECK

Healthy creator platforms see CAC drop as network effects kick in (YouTube: creators recruit creators). Substack's CAC is flat or rising because there's no virality between writers. Every new writer starts from zero.

**Red flag:** Substack raised $82M but most top writers were already successful pre-Substack (Matt Levine, Ben Thompson, Heather Cox Richardson). The capital didn't create breakouts — it monetized existing brands. That's not a platform. That's a payment processor.`,

  segments: `## CURRENT CORE SEGMENT

**The Exiled Journalist.** Mid-career media professionals (35-50 years old) laid off from institutional publishers (NYT, BuzzFeed, Vice) with 10-20 years of byline equity. They have:
- Existing Twitter audiences (20K-100K followers)
- Beat expertise (politics, tech, culture)
- Trust with readers (years of institutional credibility)

**Why Substack resonates:** They want editorial independence + economics. At NYT, they made $120K salary and owned nothing. On Substack, $10K paid subs = $1M/year (after Substack cut). This isn't a side hustle — it's a career upgrade.

**Estimated segment size:** ~5K journalists laid off 2020-2024 (per Pew Research). Of those, maybe 500 have audiences large enough to monetize (>10K Twitter followers). Substack has captured ~200 of them. High penetration.

## THE UNDERSERVED ADJACENT

**The Corporate Expert.** Think tank researchers, ex-consultants, academics who've built credibility in niche domains (climate policy, supply chain, AI safety) but have no media platform. They're not "journalists" — they're domain experts who could monetize deep analysis.

**Why they're not using Substack:** They don't think of themselves as "writers." They publish occasional LinkedIn posts or white papers, but haven't made the mental leap to recurring newsletter. Also, unclear who their audience is (not consumers — likely institutions/professionals).

**What it would take to win them:** 
- Positioning shift: "Monetize your expertise" not "start a newsletter"
- B2B pricing tier: $50-200/mo subscriptions (vs. consumer $10/mo)
- Integration with LinkedIn for distribution (70% of B2B thought leaders use LinkedIn as primary channel)

**TAM:** Estimated 50K "corporate experts" in US with monetizable knowledge. If 5% convert, that's 2,500 newsletters at $50/mo avg = $1.5M new MRR/year.

## THE NET-NEW WHITESPACE

**The Full-Time Creator (YouTube/TikTok) who wants recurring revenue.** These are people making $50-200K/year from ads/sponsorships on video platforms but have no subscription business. They could add a paid newsletter as a diversification play — "Free videos on YouTube, in-depth analysis/behind-the-scenes on Substack."

**Why they don't use existing solutions:** Patreon is bloated with tiers/rewards. OnlyFans has stigma. Substack is associated with "serious journalism" not creators. The positioning is wrong.

**What macro shift makes them addressable:** YouTube ad CPMs dropped 30% in 2023 (per Social Blade data). Creators are hunting for revenue diversification. Newsletter = hedge against algorithm changes.

**Risk:** Most creators are bad writers. Email open rates might be terrible. Conversion free→paid could be <2% (vs. 10% for journalists). This segment might look attractive but have terrible unit economics.

## SEGMENT SEQUENCING

**Next 12 months: The Corporate Expert.**

Why this vs. the Creator segment? 
1. Higher LTV ($50/mo B2B sub vs. $10/mo consumer)
2. Lower churn (B2B subscriptions = research budgets, not discretionary spend)
3. Unlock mechanism: Partnership with LinkedIn (or just better LinkedIn embed tools)

**Execution risk:** Substack's brand is "indie journalism." Repositioning to "professional expertise" might dilute the core. Also, B2B customers expect invoicing, team access, analytics — features Substack doesn't have.

## THE PARETO CHECK

Based on leaked internal data (The Information, 2020): **Top 10% of Substack writers = ~70% of total platform GMV.**

This is more concentrated than Spotify (top 10% of artists = 60% of streams) or YouTube (top 10% = 50% of watch time). Substack is winner-take-all, not a creator middle class.

**Implication:** Growth strategy should be "recruit 100 more Ben Thompsons" not "help 10K small writers make $500/year." The economics don't support the democratization narrative.

## THE SEGMENT THAT'S A TRAP

**The Hobbyist Writer.** People who "always wanted to write" and think Substack is their creative outlet. They have no audience, no beat, no expertise. They'll write 3 posts, get 12 subscribers (all friends/family), and quit.

**Why it's a trap:** 
- Zero LTV (they never monetize)
- High support costs (they email support asking "how do I get readers?")
- Dilutes Substack's brand (makes it look like Medium 2.0 — graveyard of abandoned blogs)

Substack should actively discourage this segment (raise barriers to entry) instead of celebrating "everyone can be a writer." The unit economics don't work for hobbyists.`,

  pivot: `## THE GTM THESIS

Substack should stop pretending to be a democratization platform and fully lean into being **infrastructure for the top 500 professional writers globally.** The data is clear: 10% of writers drive 70% of GMV. Growth comes from recruiting more high-value creators (journalists, corporate experts, domain specialists) and building enterprise features that lock them in — not from enabling 10,000 hobbyists who'll never monetize. The strategic shift: from "everyone can start a newsletter" to "the world's best writers publish on Substack."

## WHAT'S WORKING (Keep Doing)

**1. Writer-first simplicity.** Based on Competitive Scan, Substack's NPS among top writers is 70+ because it doesn't bloat with features. Ghost has 50+ settings. Patreon has membership tiers. Substack has "write → publish → paywall." This is the core product moat. Don't touch it.

**2. 10% rev-share model.** Per Channel Audit, Substack's flat take rate is expensive vs. Beehiiv (0%) but creates trust. Writers know the business model isn't ads or hidden fees. It's simple math: make $100K, pay $10K. The transparency is the brand. Competitors who tried "free platform + ad network" (Beehiiv) are training readers to expect free content, which kills writer economics long-term.

## WHAT'S BROKEN (Stop Doing)

**1. Mass-market positioning.** Per Segment Whitespace, 80% of Substack newsletters have <100 subscribers. These writers will never monetize but consume support resources and dilute the brand. Substack should raise barriers to entry — require writers to have existing audience proof (Twitter followers, LinkedIn connections, past bylines) before activating paid subscriptions. Make it exclusive, not open.

**2. Building consumer social features (Notes, Chat).** Per Channel Audit, Substack's attempt to compete with Twitter via "Notes" failed (<5% adoption). Writers already have Twitter. They don't need another timeline. Substack should kill these features and redirect engineering to B2B tools (team collaboration, analytics, CRM for reader engagement). The use case is "professional publishing infrastructure" not "social media."

## THE STRATEGIC BET (Start Doing)

**Launch "Substack Pro" for corporate experts and institutions.**

Based on Segment Whitespace, there are ~50K corporate experts (think tank researchers, ex-consultants, academics, ex-operators) who could monetize analysis at $50-200/mo B2B price points. They're not "journalists" but they have valuable knowledge and LinkedIn audiences.

**Why now:** YouTube ad revenue down 30% in 2023. Corporate layoffs created a pool of experienced operators with time to write. B2B buyers (VCs, strategists, policy analysts) are hungry for expert takes beyond generic news.

**90-day milestone:** Sign 50 corporate expert writers (recruited via LinkedIn outreach). Each has 5K+ LinkedIn connections. Target: 10% convert their network to paid subs at $50/mo avg. If hit, that's 50 writers × 500 subs × $50 = $1.25M ARR in 6 months.

## CAPITAL ALLOCATION SHIFT

**Cut 30% from:**
- Consumer product experiments (Notes, Chat, Substack app)
- Paid acquisition (Meta ads for consumer newsletters)

**Reallocate to:**
- **Enterprise features (40%):** Team collaboration (multi-author newsletters), advanced analytics (cohort retention, LTV tracking), white-label options for institutions
- **B2B sales (30%):** Hire 3 account managers to recruit corporate experts, ex-consultants, think tank researchers
- **Cross-promotion algorithm (30%):** Build "Discover Weekly" for Substack — in-email recommendations that drive 20%+ of readers to subscribe to a second newsletter (increases LTV 50%)

**Expected outcome in 6 months:**
- Average writer LTV increases from $180/year (current est.) to $270/year (+50% from second newsletter subs)
- New segment (corporate experts) adds $5M ARR at higher margin (B2B subs churn 60% less than consumer)

## THE RISK IN THIS PLAN

**The exclusivity play could backfire.** If Substack raises barriers (require proof of audience before activating paid), it could:
- Create backlash ("Substack is elitist, anti-creator")
- Open door for Beehiiv to claim "we welcome everyone"
- Lose the long-tail of writers who generate word-of-mouth even if they don't monetize

**The specific assumption that could break the plan:** That corporate experts will actually write consistently. Journalists write for a living. Consultants write white papers once a quarter. If B2B segment has 60% publish-abandonment rate (vs. 30% for journalists), unit economics don't work. Test this in 90 days with cohort retention data.

## 90-DAY ROADMAP

**Week 1-4: Recruit 50 Corporate Expert Pilot**
- Outreach via LinkedIn to ex-BCG/McKinsey, think tank researchers, ex-startup operators with 5K+ followers
- Pitch: "Monetize your expertise. $50/mo B2B subscriptions for deep analysis."
- Goal: 50 writers commit to publish weekly for 12 weeks

**Week 5-8: Ship B2B Features**
- Team collaboration (multi-author bylines)
- Invoice billing (for corporate subscriptions)
- LinkedIn embed optimization (one-click share to LI with preview)

**Week 9-12: Measure & Iterate**
- Track: Publish rate (% of 50 writers still active at Week 12)
- Track: Conversion rate (LinkedIn followers → paid subs)
- Track: Retention (Month 1 → Month 3 churn for B2B segment)
- Decision gate: If <30 of 50 writers still publishing + <5% conversion, kill B2B bet. If >40 publishing + >8% conversion, double down with $2M sales hiring budget.`,

  kpis: `## NORTH STAR METRIC

**Paid Subscriber Retention (90-Day Cohort)** — % of paid subscribers who renew after 90 days (3 billing cycles).

**Why this metric?**
- Revenue is a lagging indicator. A writer can have 10K paid subs but if 40% churn monthly, the business is a treadmill.
- User growth is gameable (discounts, promotions, one-time readers). Retention measures real value.
- For Substack specifically: the GTM thesis is "lock in top 500 writers." The only way to know if a writer has sticking power is retention. If readers don't renew, the writer doesn't have a sustainable business.

**Current baseline (estimated):** 60-70% for top-tier newsletters (Stratechery, Lenny's), 40-50% for median newsletter. 

**Target:** 75% 90-day retention across top 200 newsletters by Q3 2025. This drives LTV from $120 (current est.) to $180, which changes profitability math for Substack.

## THE 3 SUPPORTING METRICS

**1. Cross-Subscription Rate**
- **Definition:** % of paid subscribers who subscribe to 2+ newsletters on Substack
- **Current:** <5% (estimated based on Substack's failed "bundle" launch)
- **Target:** 20% by Q4 2025
- **Why it matters:** Readers with 2+ subs churn 60% less (they're "Substack users" not "Writer X subscribers"). This is the network effect Substack needs to build.

**2. Writer Publish Consistency**
- **Definition:** % of active writers who publish at least 3x/month for 3 consecutive months
- **Current:** Unknown, likely 30-40% (based on category benchmarks for consumer creators)
- **Target:** 60% for top 500 target segment by Q2 2025
- **Why it matters:** Inconsistent publishing = subscriber churn. If a writer goes dark for 2 weeks, 10-15% of subs cancel. This metric is a leading indicator of retention health.

**3. B2B Subscriber Share**
- **Definition:** % of total GMV from subscriptions priced $30+/month (proxy for corporate/professional subs)
- **Current:** <10% (mostly consumer $10/mo subs)
- **Target:** 25% by Q4 2025
- **Why it matters:** B2B subscribers churn 60% less and have 3x LTV. This metric tracks the segment shift from "exiled journalist" to "corporate expert" outlined in GTM Pivot.

## WEEKLY OPERATING RHYTHM (30 min)

**Attendees:** CEO, Head of Product, Head of Writer Success

**Cadence:** Monday 9 AM

**Agenda:**
- **Review (10 min):** 90-day cohort retention (top 50 newsletters), writer publish rate (last 7 days), cross-sub rate
- **Discuss (15 min):** Any writer in top 50 who missed a publish deadline (flag churn risk), any cross-promotion tests running
- **Decide (5 min):** Which 3 writers to reach out to this week (either high-churn risk or high-growth potential)

## MONTHLY OPERATING RHYTHM (90 min)

**Attendees:** Full leadership team (CEO, Product, Growth, Writer Success, Eng lead)

**Cadence:** First Tuesday of month, 2-3:30 PM

**Agenda:**
- **Review (30 min):** North Star trend (90-day retention), supporting metrics dashboard, cohort analysis (which writer segments retaining best?)
- **Discuss (40 min):** Product roadmap (are we shipping retention-driving features?), writer recruitment pipeline (B2B segment progress), competitive threats (Beehiiv growth, Ghost updates)
- **Decide (20 min):** Budget reallocation (cut underperforming initiatives), roadmap prioritization (ship retention feature X before growth feature Y), writer outreach focus (double down on segment Z)

## QUARTERLY OPERATING RHYTHM (Half day)

**Attendees:** Leadership + Board observers

**Cadence:** Week 1 of Q (4 hours)

**Agenda:**
- **Review (60 min):** GTM thesis scorecard (are we winning top 500 writers?), financial health (GMV growth, take rate trends, cost per writer), competitive landscape (market share shifts, new entrants)
- **Discuss (90 min):** Strategic bets review (B2B segment working? Cross-promotion traction? Enterprise features driving retention?), capital allocation (burn rate, runway, next fundraise timing if applicable), product vision (12-month roadmap)
- **Decide (30 min):** Continue current strategy / pivot / kill underperforming bets, budget for next quarter, hiring priorities

## THE VANITY METRIC TRAP

**Total newsletter signups.** Substack has 500K+ newsletters (estimated). Sounds impressive. But 80% have <100 subscribers and will never monetize. This metric makes the team feel good ("we're growing!") but doesn't predict revenue.

**Why it's misleading:** Easy to game with viral marketing ("start your newsletter!"). Creates support burden (500K writers emailing "how do I get readers?"). Distracts from the real strategy: recruit and retain the top 500.

**What to track instead:** "Active, monetizing newsletters" (defined as: published 3+ times in last 30 days + has 100+ paid subscribers). This is the real business.`,

  narrative: `## SITUATION

**The category:** Creator monetization infrastructure. Substack sits in the $15B+ creator economy, specifically the paid newsletter/subscription segment. This is not "blogging 2.0" — it's the unbundling of media institutions into individual brands with direct economic relationships to audiences.

**TAM expansion:** Media institutional collapse is accelerating. Since 2020: BuzzFeed News (May 2023), Vice bankruptcy (May 2023), Sports Illustrated layoffs (Jan 2024), The Messenger shutdown (Jan 2024). Per Pew Research, newsroom employment dropped 26% from 2008-2023. Every high-profile journalist laid off with a Twitter following is a potential Substack migration. Casey Newton (Platformer): $800K/year revenue within 12 months of leaving The Verge. Ben Thompson (Stratechery): $3M+/year on 30K paid subs. Lenny Rachitsky: $4M ARR in Year 2. Unit economics — $10-25 CAC via existing audience, $120-180 annual LTV, 85%+ gross margin — are better than Patreon, Medium, YouTube, or Spotify.

**Competitive landscape:** Fragmented. Beehiiv (growth tools + ad network), Ghost (open-source + self-hosting), Medium (algorithm-driven discovery), Patreon (membership tiers). No one owns the "serious professional writer" segment. Substack has recruited ~200 of the top 500 journalists/experts globally, but penetration is still <50%.

## COMPLICATION

**The growth engine is broken.** 80% of Substack traffic is direct (typing URL) or email (outside the platform). There is no feed, no algorithm, no network effect beyond email forwarding. If you don't bring an existing audience, you cannot grow on Substack. Per leaked data, <1% of newsletters have 5,000+ paid subscribers. The other 99% are below minimum wage. This is not a platform — it's payment infrastructure for people who already have distribution.

**The Pareto problem is getting worse.** Top 10% of writers drive 70% of GMV (per The Information, 2020 leak). This is more concentrated than Spotify (60%) or YouTube (50%). Substack's product roadmap has focused on mass-market features (Notes app, Chat, Discover tab) that serve the 99% but don't generate revenue. Meanwhile, the top 1% — the writers who actually drive GMV — are underserved. They need analytics, team collaboration, CRM, white-label options. Substack hasn't shipped these because they're chasing "democratization" narrative instead of business reality.

**Capital misallocation risk.** Substack raised $82M (a16z Series B at $650M valuation, ~13x forward GMV). That premium pricing assumed network effects would kick in — readers would discover new writers, subscribe to multiple newsletters, create viral loops. Two years later, cross-subscription rate is <5%. The moat thesis hasn't materialized. Substack's competitive advantage is not discovery (Beehiiv is better), not features (Ghost is better), not creator tools (Patreon is better). The only moat is brand: "serious writers publish on Substack." But brand erodes if the product doesn't evolve.

## CONVICTION

**The Insight:** Substack doesn't need to democratize writing. It needs to own the top 500 professional writers globally (journalists, corporate experts, domain specialists) and build enterprise-grade infrastructure that locks them in. The 99% of hobbyist writers create support burden and dilute the brand. The real business is high-LTV B2B subscriptions ($50-200/mo from institutions) + recurring consumer subs ($10-20/mo from superfans), both driven by writers who publish consistently and have credibility.

**The Wedge:** Substack enters via "exiled journalists" (NYT/Vice/BuzzFeed layoffs) but expands to "corporate experts" (ex-consultants, think tank researchers, academics) who want to monetize analysis. These segments have:
- Existing audiences (10K-100K LinkedIn/Twitter followers)
- Credibility (years of institutional bylines or domain expertise)
- Motivation (layoffs = need for income; YouTube ad decline = need for diversification)

Substack is the only platform positioned as "serious professional publishing" vs. "creator side hustle" (Patreon) or "hobbyist blog" (Medium). This brand is the wedge.

**The Moat:** Network effects via cross-subscriptions. If 20% of readers subscribe to 2+ newsletters (vs. current <5%), LTV jumps 50% and churn drops 60%. This requires an algorithmic recommendation engine ("Discover Weekly for Substack") that surfaces newsletters in-email based on reading behavior. Once a reader has 3+ active subscriptions, switching costs are massive (re-subscribing to each writer individually on a new platform). The moat is "subscription bundle" not "individual writer lock-in."

**Secondary moat:** Enterprise features that make migration painful. Team collaboration (multi-author newsletters), advanced analytics (cohort retention, LTV tracking), white-label options (custom domains, branded apps). These are table stakes for media companies and think tanks migrating entire teams to Substack. Ghost has some of this but lacks the brand. Medium killed it. Substack can own B2B publishing infrastructure.

**The Metrics:**
- **90-day paid subscriber retention:** Currently 60-70% for top writers, 40-50% median. Target: 75% for top 200 writers by Q3 2025. This proves product-market fit for high-value segment.
- **Cross-subscription rate:** Currently <5%. Target: 20% by Q4 2025. This proves network effects are working.
- **B2B subscriber share:** Currently <10% of GMV. Target: 25% by Q4 2025. This proves segment expansion (corporate experts) is working.

If these metrics hit, Substack's GMV grows 3x in 18 months without proportional increase in CAC. That's venture-scale economics.

## THE BEAR CASE

**"The top writers can leave anytime."** True. Email lists are portable. Substack has no technical lock-in. Ben Thompson could migrate Stratechery to self-hosted WordPress tomorrow and keep 95% of subscribers. Ghost is actively recruiting Substack's top writers with migration tools.

**Counter:** Switching costs aren't technical — they're operational. Substack handles payments, email deliverability, spam filtering, subscriber management. Moving to WordPress means becoming a SysAdmin. Top writers value their time at $500-1000/hour. They won't spend 40 hours/year managing servers to save $10K in Substack fees. The moat is "I don't want to think about infrastructure." As long as Substack stays simple and reliable, inertia wins.

**Second bear case:** "AI kills newsletters." If ChatGPT can summarize 10 newsletters into one daily briefing, why would anyone pay $10/mo for individual writers?

**Counter:** People don't subscribe for information — they subscribe for *perspective*. Matt Levine's newsletter isn't "here's what happened in finance today" (ChatGPT can do that). It's "here's what Matt Levine thinks about what happened, with humor and legal nuance only he has." The value is curation + voice + trust, which AI can't replicate (yet). If AI does kill this, it kills all media, not just Substack.

## INVESTMENT THESIS SUMMARY

Substack is infrastructure for the unbundling of media. The TAM is not "everyone who wants to write" (too broad, low monetization). The TAM is "the 10,000 professional writers globally who have audiences and credibility" (journalists, corporate experts, domain specialists). Substack has captured ~2% of this market (200 writers). The next 18 months is about: (1) recruiting the next 300 high-value writers, (2) shipping enterprise features that lock them in, (3) building cross-subscription network effects that increase LTV 50%. If executed, Substack becomes the Bloomberg Terminal of professional writing — the default infrastructure that pros can't operate without.`,
};

// Continue building the rest of the tool...
// (Due to length, I'll continue in next artifact)

// Call Claude API
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
    body: JSON.stringify({
      prompt,
      pdfs: pdfs.map(p => ({ name: p.name, b64: p.b64 })),
      agentId,
    }),
  });

  if (res.status === 429) {
    const error = await res.json();
    throw new Error(error.message || 'Rate limit exceeded. Please try again later.');
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'API request failed' }));
    throw new Error(error.message || `API error: ${res.status}`);
  }

  const data = await res.json();
  
  if (data.usage) {
    console.log(`[Usage] ${data.usage.global}/${data.usage.limit} sprints used. ${data.usage.remaining} remaining.`);
  }

  return data.text;
}

// Markdown parser with table support
function parseTable(block) {
  const rows = block.trim().split("\n").filter(r => r.includes("|"));
  if (rows.length < 2) return null;
  const cells = r => r.split("|").map(c => c.trim()).filter((c, i, a) => i > 0 && i < a.length - 1);
  const header = cells(rows[0]);
  const body   = rows.slice(2);
  if (!header.length) return null;
  const thStyle = `padding:7px 10px;text-align:left;font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:${P.inkSoft};background:${P.parchment};border-bottom:2px solid ${P.sand};white-space:nowrap;`;
  const tdStyle = `padding:7px 10px;font-size:11px;color:${P.inkMid};border-bottom:1px solid ${P.sand};vertical-align:top;line-height:1.5;`;
  const ths = header.map(h => `<th style="${thStyle}">${h}</th>`).join("");
  const trs = body.map((r, i) => {
    const tds = cells(r).map(c => `<td style="${tdStyle}">${c}</td>`).join("");
    return `<tr style="background:${i % 2 === 0 ? P.white : P.cream}">${tds}</tr>`;
  }).join("");
  return `<div style="overflow-x:auto;margin:10px 0;border:1px solid ${P.sand};border-radius:3px;">
    <table style="width:100%;border-collapse:collapse;font-family:'Work Sans',sans-serif;">
      <thead><tr>${ths}</tr></thead>
      <tbody>${trs}</tbody>
    </table>
  </div>`;
}

function parseAxesMap(text) {
  if (!text.includes("←") && !text.includes("AXIS")) return null;
  const lines = text.split("\n");
  const mapLines = [];
  let capturing = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes("AXIS") || line.includes("←") || line.includes("→")) {
      capturing = true;
    }
    if (capturing) {
      mapLines.push(line);
      if (mapLines.length > 15) break; // Safety limit
      if (line.includes("AXIS 1 LOW") || (mapLines.length > 3 && line.trim() === "")) break;
    }
  }
  if (mapLines.length < 3) return null;
  return `<div style="background:${P.parchment};border:1px solid ${P.sand};border-radius:3px;padding:14px 16px;margin:12px 0;overflow-x:auto;">
    <pre style="font-family:'JetBrains Mono',monospace;font-size:10px;color:${P.inkMid};line-height:1.7;margin:0;white-space:pre;">${mapLines.join("\n")}</pre>
  </div>`;
}

function md(text) {
  if (!text) return "";

  // Extract axes maps first
  const axesMap = parseAxesMap(text);
  let processed = text;
  
  if (axesMap) {
    const axesPlaceholder = `%%AXES%%${btoa(unescape(encodeURIComponent(axesMap)))}%%AXES%%`;
    processed = processed.replace(/AXIS 1 HIGH[\s\S]{1,500}?(AXIS 1 LOW|$)/i, axesPlaceholder);
  }

  // Tables
  processed = processed.replace(/^(\|.+\|\n)(\|[-| :]+\|\n)((?:\|.+\|\n?)+)/gm, (match) => {
    const table = parseTable(match);
    return table ? `%%TABLE%%${btoa(unescape(encodeURIComponent(table)))}%%TABLE%%` : match;
  });

  // Standard markdown
  processed = processed
    .replace(/^## (.+)$/gm, `<h3 style="font-family:'Libre Baskerville',serif;font-size:14px;color:${P.forest};margin:16px 0 6px;border-bottom:1px solid ${P.sand};padding-bottom:4px;">$1</h3>`)
    .replace(/\*\*(.+?)\*\*/g, `<strong style="color:${P.ink};">$1</strong>`)
    .replace(/^- (.+)$/gm, `<div style="display:flex;gap:7px;margin:3px 0;"><span style="color:${P.terra};flex-shrink:0;">▸</span><span>$1</span></div>`)
    .replace(/\n\n/g, `</p><p style="margin:6px 0;">`)
    .replace(/\n/g, "<br/>");

  // Restore tables and axes
  processed = processed
    .replace(/%%TABLE%%([^%]+)%%TABLE%%/g, (_, b64) => decodeURIComponent(escape(atob(b64))))
    .replace(/%%AXES%%([^%]+)%%AXES%%/g, (_, b64) => decodeURIComponent(escape(atob(b64))));

  return processed;
}

// Agent card component
function AgentCard({ agent, status, result, index }) {
  const colors = {
    idle:    { border: P.sand,  bg: P.parchment, dot: P.sand       },
    queued:  { border: P.sand,  bg: P.parchment, dot: P.inkFaint   },
    waiting: { border: P.sand,  bg: P.parchment, dot: P.inkFaint   },
    running: { border: P.gold,  bg: "#fffdf8",   dot: P.gold       },
    done:    { border: P.sand,  bg: P.white,     dot: P.forestSoft },
    error:   { border: P.terra, bg: "#fff5f0",   dot: P.terra      },
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
      {/* Header */}
      <div style={{ 
        background: status === "done" || status === "running" 
          ? `linear-gradient(135deg, ${P.teal} 0%, ${P.forestSoft} 100%)` 
          : c.bg, 
        padding: "16px 20px", 
        borderBottom: status === "done" || status === "running" ? "none" : `1px solid ${c.border}`,
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between",
        borderRadius: "3px 3px 0 0",
        boxShadow: status === "running" ? "0 2px 8px rgba(42,125,111,0.2)" : "none"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: c.dot, boxShadow: status==="running" ? `0 0 8px ${c.dot}` : "none" }}/>
          <span style={{ 
            fontSize: status === "done" || status === "running" ? 16 : 14, 
            fontWeight: 700, 
            color: status === "done" || status === "running" ? P.white : P.ink, 
            letterSpacing: "0.02em",
            fontFamily: status === "done" || status === "running" ? "'Libre Baskerville',serif" : "inherit"
          }}>
            {agent.icon} {agent.label}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ 
            fontSize: 7, 
            fontWeight: 700, 
            letterSpacing: ".1em", 
            textTransform: "uppercase", 
            color: status === "done" || status === "running" ? "rgba(255,255,255,0.9)" : waveColor, 
            background: status === "done" || status === "running" ? "rgba(255,255,255,0.15)" : `${waveColor}15`, 
            padding: "3px 7px", 
            borderRadius: 10 
          }}>
            WAVE {agent.wave}
          </span>
          {status === "running" && <span style={{color:"rgba(255,255,255,0.95)",fontSize:11}}>— RUNNING</span>}
          {status === "queued"  && "— READY"}
          {status === "waiting" && "— READY"}
          {status === "done"    && <span style={{fontSize:12,color:"rgba(255,255,255,0.95)"}}>✓ COMPLETE</span>}
          {status === "error"   && <span style={{fontSize:11,color:P.terra}}>⚠</span>}
        </div>
      </div>

      {/* Subtitle */}
      {!result && status === "idle" && (
        <div style={{ padding: "10px 16px", fontSize: 11, color: P.inkFaint, borderBottom: `1px solid ${P.sand}` }}>
          {agent.sub}
        </div>
      )}

      {/* Progress bar */}
      {status === "running" && (
        <div style={{ padding: "0 16px" }}>
          <div style={{ height: 2, background: P.sand, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: "100%", background: `linear-gradient(90deg, ${P.gold} 0%, ${P.gold} 50%, transparent 50%)`, backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }}/>
          </div>
        </div>
      )}

      {/* Content */}
      {result && (
        <div className="agent-content" style={{ padding: "16px 20px", fontSize: 13, color: P.inkMid, lineHeight: 1.8,
          fontFamily: "'Instrument Sans', sans-serif", maxHeight: 440, overflowY: "auto",
        }}
          dangerouslySetInnerHTML={{ __html: `<p style="margin:0">${md(result)}</p>` }}
        />
      )}

      {/* Ready placeholder */}
      {(status === "queued" || status === "waiting") && !result && (
        <div style={{ padding: "12px 18px", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: P.sand, animation: "pulse 1.5s infinite" }}/>
          <span style={{ fontSize: 12, color: P.inkFaint, fontStyle: "italic" }}>
            Ready · Firing in parallel with other agents
          </span>
        </div>
      )}
    </div>
  );
}

// Progress bar

// Print-only header
function PrintHeader({ company, date }) {
  return (
    <div className="print-header" style={{ display: "none" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span>Strategic Intelligence Sprint</span>
          <span style={{ marginLeft: 16, fontSize: 12, opacity: 0.85 }}>{company}</span>
        </div>
        <div style={{ fontSize: 11, opacity: 0.75 }}>
          {date} · Harsha Belavady
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ statuses, elapsed, estMins }) {
  const total   = AGENTS.length;
  const done    = AGENTS.filter(a => statuses[a.id] === "done").length;
  const current = AGENTS.find(a => statuses[a.id] === "running");
  const pct     = Math.round((done / total) * 100);
  const w1done  = W1.filter(id => statuses[id] === "done").length;
  const wave    = w1done < W1.length ? 1 : 2;
  const mm  = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss  = String(elapsed % 60).padStart(2, "0");
  const etaSecs  = estMins ? estMins * 60 : 0;
  const remSecs  = Math.max(0, etaSecs - elapsed);
  const remMm    = String(Math.floor(remSecs / 60)).padStart(2, "0");
  const remSs    = String(remSecs % 60).padStart(2, "0");

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
        <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${P.gold} 0%, ${P.terra} 100%)`, transition: "width 0.4s ease", borderRadius: 3 }}/>
      </div>
    </div>
  );
}

// Main App
export default function App() {
  const [company,   setCompany]   = useState("");
  const [userName,  setUserName]  = useState("");
  const [pdfs,      setPdfs]      = useState([]);
  const [appState,  setAppState]  = useState("idle");
  const [results,   setResults]   = useState({});
  const [statuses,  setStatuses]  = useState({});
  const [showDash,  setShowDash]  = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [elapsed,   setElapsed]   = useState(0);
  const abortRef     = useRef(null);
  const timerRef     = useRef(null);
  const fileRef      = useRef(null);

  useEffect(() => { initGA(); gaEvent("page_view", { tool: "AdvisorSprint Tech" }); }, []);

  const downloadPDF = () => {
    gaEvent("pdf_download", { company });
    window.print();
  };

  const handlePDF = async (e) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== "application/pdf") return alert("Please upload a PDF file");
    if (file.size > 20*1024*1024) return alert("PDF must be under 20MB");
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
        setResults(r  => ({ ...r,  [id]: text  }));
        setStatuses(s => ({ ...s, [id]: "done" }));
        gaEvent("agent_completed", { agent: id, company, chars: text.length });
      }
      return text;
    } catch (e) {
      if (e.name !== "AbortError") {
        setStatuses(s => ({ ...s, [id]: "error" }));
        setResults(r  => ({ ...r,  [id]: `Error: ${e.message}` }));
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
    setShowDash(false);
    setElapsed(0);

    const initStatus = {};
    AGENTS.forEach(a => initStatus[a.id] = "queued");
    setStatuses(initStatus);

    const co = company;
    const ctx = pdfs.length 
      ? `User uploaded document: "${pdfs[0].name}". Extract data from this document and cite it by name when using its information.`
      : "No document uploaded. Use your training knowledge and flag when information might be outdated.";

    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);

    gaEvent("sprint_launched", {
      company: co,
      user: userName || "anonymous",
      hasDoc: pdfs.length > 0,
      timestamp: new Date().toISOString(),
    });

    // Wave 1
    for (const id of W1) {
      if (signal.aborted) return;
      setStatuses(s => ({ ...s, [id]: "running" }));
      await runAgent(id, makePrompt(id, co, ctx, null), signal, pdfs);
      await new Promise(r => setTimeout(r, 1500));
    }

    // Build synthesis context
    const synthCtx = W1.map(id => {
      const lines = (results[id] || "").split("\n").filter(Boolean);
      let start = 0;
      for (let j = lines.length - 1; j >= 0; j--) {
        if (lines[j].startsWith("##")) { start = j; break; }
      }
      return `[${AGENTS.find(a=>a.id===id).label}]:\n${lines.slice(start).join(" ").slice(0, 400)}`;
    }).join("\n\n");

    setShowDash(true);
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
    setShowDash(false);
    setHasStarted(false);
    setElapsed(0);
    setPdfs([]);
    setCompany("");
    setUserName("");
  };

  const isDone      = appState === "done";
  const isActive    = appState === "running";
  const estMins     = pdfs.length ? 4.5 : 3.5;

  return (
    <div style={{ minHeight: "100vh", background: P.parchment, fontFamily: "'Work Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Work+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:200% 0}100%{background-position:-200% 0} }
        @keyframes pulse { 0%,100%{opacity:.4}50%{opacity:1} }
        body { margin: 0; }
        
        @media print {
          @page { size: landscape; margin: 0.6in 0.5in; }
          
          .agent-grid { display: block !important; column-count: 1 !important; }
          
          * { animation: none !important; }
          body { background: white; margin: 0; padding: 0; }
          
          .no-print { display: none !important; }
          button { display: none !important; }
          
          .print-header { 
            display: block !important;
            border: 2px solid #2a7d6f;
            background: linear-gradient(135deg, #1a3325 0%, #2a7d6f 100%);
            color: white;
            padding: 18px 24px;
            border-radius: 6px;
            margin-bottom: 24px;
          }
          
          .print-header span:first-child {
            font-family: 'Libre Baskerville', serif;
            font-size: 20px;
            font-weight: 700;
          }
          
          [data-agent] { 
            page-break-before: always !important;
            page-break-inside: avoid !important;
            width: 100% !important;
            max-width: 100% !important;
            display: block !important;
            margin: 0 0 16px 0 !important;
            border: 2px solid #2a7d6f !important;
            border-radius: 6px;
            overflow: visible !important;
            box-sizing: border-box !important;
          }
          
          [data-agent="signals"] { page-break-before: avoid !important; }
          
          [data-agent] > div:first-child {
            background: linear-gradient(135deg, #2a7d6f 0%, #3d6b54 100%) !important;
            color: white !important;
            border-bottom: none !important;
            padding: 14px 20px !important;
            font-size: 16pt !important;
            font-weight: 700 !important;
          }
          
          [data-agent] > div:first-child * {
            color: white !important;
          }
          
          .agent-content { 
            max-height: none !important; 
            overflow: visible !important; 
            height: auto !important;
            font-size: 9.5pt !important;
            line-height: 1.5 !important;
            padding: 14px 18px !important;
            page-break-inside: avoid !important;
            box-sizing: border-box !important;
            word-wrap: break-word !important;
          }
          
          .agent-content h3 {
            font-size: 11pt;
            margin-top: 12px;
            margin-bottom: 6px;
            color: #1a3325;
            page-break-after: avoid !important;
          }
          
          .agent-content p { margin: 6px 0; }
          
          .agent-content table {
            font-size: 8.5pt;
            page-break-inside: avoid !important;
            max-width: 100% !important;
            table-layout: fixed !important;
          }
          
          .agent-content pre {
            max-width: 100% !important;
            overflow-x: hidden !important;
            white-space: pre-wrap !important;
            font-size: 8pt !important;
          }
        }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 80px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: P.inkFaint, marginBottom: 12 }}>
            Rapid Intelligence Sprint · Human & AI Powered
          </div>
          <h1 style={{ fontFamily: "'Libre Baskerville',serif", fontSize: 48, fontWeight: 700, color: P.forest, margin: "0 0 14px", lineHeight: 1.1 }}>
            <span style={{ color: P.forestSoft }}>Advisor</span>Sprint
          </h1>
          <div style={{ fontSize: 15, color: P.inkMid, lineHeight: 1.6, maxWidth: 520, margin: "0 auto 6px" }}>
            Tech & Consumer Company Intelligence<br/>
            <em style={{ color: P.terra }}>Analysed By 7 Parallel Agents</em>
          </div>
          {MOCK_MODE && (
            <div style={{ marginTop: 16, padding: "8px 16px", background: "#fff3cd", border: "1px solid #ffc107", borderRadius: 3, display: "inline-block", fontSize: 12, color: "#856404" }}>
              <strong>Mock Mode:</strong> Using sample data (Substack). Set MOCK_MODE=false for real analysis.
            </div>
          )}
        </div>

        {/* Input Panel */}
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
                Reference Document
              </label>
              <div style={{ fontSize: 11, color: P.inkMid, marginBottom: 8, lineHeight: 1.5 }}>
                Optional · 1 PDF · max 500KB · ~25 pages
              </div>
              <input ref={fileRef} type="file" accept=".pdf" onChange={handlePDF} style={{ display: "none" }} />
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button onClick={() => fileRef.current?.click()} style={{ background: P.white, border: `1.5px solid ${P.sand}`, color: P.ink, padding: "10px 18px", borderRadius: 3, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Work Sans',sans-serif", transition: "all .2s" }}>
                  {pdfs.length ? "✓ Replace PDF" : "📎 Attach PDF"}
                </button>
                {pdfs.length > 0 && (
                  <div style={{ fontSize: 12, color: P.inkMid }}>
                    {pdfs[0].name} ({(pdfs[0].size/1024).toFixed(0)} KB)
                    <button onClick={() => setPdfs([])} style={{ marginLeft: 8, background: "none", border: "none", color: P.terra, cursor: "pointer", fontSize: 12 }}>✕ Remove</button>
                  </div>
                )}
              </div>
              {pdfs.length > 0 && (
                <div style={{ marginTop: 8, padding: "8px 12px", background: P.cream, borderRadius: 3, fontSize: 11, color: P.inkMid }}>
                  ✓ All 7 agents will read and cite this document. Estimated sprint time: ~{estMins} min.
                </div>
              )}
              {pdfs.length === 0 && (
                <div style={{ marginTop: 8, fontSize: 10, color: P.inkFaint, lineHeight: 1.6 }}>
                  <strong>Want agents to access latest reports?</strong> Upload company deck, S-1, research report, etc.<br/>
                  <em>To reduce size:</em> Open PDF → Select key pages (exec summary + data) → File → Print → Save as PDF
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
            <div style={{ textAlign: "center", fontSize: 12, color: P.inkFaint, marginBottom: 20, fontStyle: "italic" }}>
              {pdfs.length
                ? `Reading "${pdfs[0].name}" and setting up 7 agents — ~30 seconds before analysis begins`
                : "Setting up 7 agents — analysis begins in a few seconds"}
            </div>
          </div>
        )}

        {/* Completion Banner */}
        {isDone && (
          <div className="no-print" style={{ background: P.forestMid, borderRadius: 4, padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, animation: "fadeUp 0.4s ease" }}>
            <div>
              <div style={{ fontSize: 14, color: "white", fontWeight: 600 }}>✓ Sprint complete · {company} · {Math.floor(elapsed / 60)}m {elapsed % 60}s</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.7)", marginTop: 3 }}>All 7 agents complete · Full intelligence sprint ready to present</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={downloadPDF} style={{ background: "transparent", border: "1px solid rgba(255,255,255,.4)", color: "white", padding: "9px 18px", borderRadius: 3, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Work Sans',sans-serif", transition: "all .2s" }}>
                  ⬇ Download PDF
                </button>
                <button onClick={reset} style={{ background: P.terra, color: "white", border: "none", padding: "9px 20px", borderRadius: 3, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Work Sans',sans-serif" }}>
                  → New Sprint
                </button>
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.45)", fontStyle: "italic" }}>Best in Safari or Edge · Chrome may truncate</div>
            </div>
          </div>
        )}

        {/* Agent Grid */}
        {hasStarted && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            {/* Wave 1 */}
            {AGENTS.filter(a=>a.wave===1).map((a,i) => (
              <AgentCard key={a.id} agent={a} status={statuses[a.id]||"idle"} result={results[a.id]} index={i} />
            ))}

            {/* Wave 2 */}
            {AGENTS.filter(a=>a.wave===2).map((a,i) => (
              <div key={a.id} style={{ gridColumn:"1 / -1" }}>
                <AgentCard agent={a} status={statuses[a.id]||"idle"} result={results[a.id]} index={i+4} />
              </div>
            ))}
          </div>
        </>
        )}

        {/* Bottom completion section */}
        {isDone && (
          <div className="no-print" style={{ marginTop:40, background:`linear-gradient(135deg, ${P.forest} 0%, ${P.forestMid} 100%)`, borderRadius:4, padding:"24px 28px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <div style={{ fontFamily:"'Libre Baskerville',serif", fontSize:18, color:P.cream, fontStyle:"italic", marginBottom:3 }}>Intelligence Sprint Complete</div>
              <div style={{ fontSize:12, color:P.sand }}>7 agents · GTM strategy · Operating cadence · Investment narrative · Ready to present</div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6 }}>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={downloadPDF} style={{ background:"transparent", border:`1.5px solid rgba(255,255,255,0.3)`, color:P.cream, padding:"10px 20px", borderRadius:2, fontSize:12, fontWeight:700, cursor:"pointer", letterSpacing:"0.05em", fontFamily:"'Instrument Sans',sans-serif", display:"flex", alignItems:"center", gap:7 }}>
                  ⬇ DOWNLOAD PDF
                </button>
                <button onClick={reset} style={{ background:P.terra, color:P.cream, border:"none", padding:"10px 22px", borderRadius:2, fontSize:12, fontWeight:700, cursor:"pointer", letterSpacing:"0.05em", fontFamily:"'Instrument Sans',sans-serif" }}>
                  NEW SPRINT →
                </button>
              </div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,.45)", fontStyle:"italic" }}>Best in Safari or Edge · Chrome may truncate</div>
            </div>
          </div>
        )}

        {/* Methodology */}
        {!hasStarted && (
          <div style={{ marginTop:52, borderTop:`1px solid ${P.sand}`, paddingTop:34 }}>
            <div style={{ fontSize:10, color:P.inkFaint, textAlign:"center", fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", marginBottom:26 }}>The Advisory Methodology</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
              {[
                { icon:"◈", title:"4 Analysis Agents", sub:"Market signals, competitive scan, channel audit, segment whitespace — all fire in parallel" },
                { icon:"◆", title:"3 Synthesis Agents", sub:"GTM strategy, operating cadence, investment narrative — synthesize the analysis" },
                { icon:"◇", title:"Sharp Prompts", sub:"Designed to produce insight, not information. Forces specifics, flags uncertainty" },
                { icon:"◊", title:"Anti-Hallucination", sub:"Real examples only, cite sources, ranges over precision, unknown > guessing" },
              ].map((m,i) => (
                <div key={i} style={{ textAlign:"center", padding:"20px 16px", background:P.white, border:`1px solid ${P.sand}`, borderRadius:3 }}>
                  <div style={{ fontSize:24, color:P.forestSoft, marginBottom:8 }}>{m.icon}</div>
                  <div style={{ fontSize:12, fontWeight:700, color:P.ink, marginBottom:6 }}>{m.title}</div>
                  <div style={{ fontSize:11, color:P.inkMid, lineHeight:1.5 }}>{m.sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop:60, paddingTop:32, borderTop:`1px solid ${P.sand}`, textAlign:"center", fontSize:11, color:P.inkFaint, lineHeight:1.7 }}>
          <div style={{ maxWidth:720, margin:"0 auto", marginBottom:16 }}>
            Built by <strong style={{ color:P.forest }}>Harsha Belavady</strong>. In Wave 1, 4 Analysis Agents fire in parallel. In Wave 2, 3 Synthesis Agents fire simultaneously — providing the quickest strategic analysis for tech and consumer companies.
          </div>
          <div style={{ fontSize:10, color:P.inkFaint }}>
            Powered by Claude Sonnet 4 · 7 parallel agents · ~4 minutes per sprint
          </div>
        </div>
      </div>
    </div>
  );
}
