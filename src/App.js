import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════
// STRATEGIC SPRINT — Matches AdvisorSprint Design Exactly
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

// Colors matching AdvisorSprint
const P = {
  forest: "#1a3325",
  forestMid: "#2d5142",
  forestSoft: "#3d6b54",
  parchment: "#faf8f4",
  cream: "#f5f2ed",
  beige: "#e8e4db",
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

// Agents
const AGENTS = [
  { id: "signals", wave: 1, icon: "◉", label: "Market Signals", sub: "TAM expansion, unit economics, capital environment" },
  { id: "competitive", wave: 1, icon: "◉", label: "Competitive Landscape", sub: "Positioning map, where you win & lose" },
  { id: "channels", wave: 1, icon: "◉", label: "Channel Strategy", sub: "Acquisition mix, CAC efficiency" },
  { id: "segments", wave: 1, icon: "◉", label: "Customer Segments", sub: "Core users, whitespace opportunities" },
  { id: "pivot", wave: 2, icon: "◉", label: "GTM Blueprint", sub: "Strategic synthesis from analysis" },
  { id: "kpis", wave: 2, icon: "◉", label: "Operating Rhythm", sub: "North Star, weekly/monthly cadence" },
  { id: "narrative", wave: 2, icon: "◉", label: "Investment Memo", sub: "Situation-Complication-Conviction" },
];

const W1 = AGENTS.filter(a => a.wave === 1).map(a => a.id);
const W2 = AGENTS.filter(a => a.wave === 2).map(a => a.id);

const makePrompt = (id, company, ctx, synthCtx) => {
  const base = `You are a senior VC analyst. This memo will be read by Erik Torenberg and a16z partners. Be SHARP and SUBSTANTIVE. Lead with insight, prove with data.`;
  
  const research = `

**RESEARCH:** Use web search for a16z/Sequoia essays, CB Insights, PitchBook, TechCrunch, S-1s, SimilarWeb, Gartner. Cite with source+date or write "estimated based on [method]." Ranges > precision when uncertain. Multiple data points > single source.
`;

  const rules = `

**REQUIREMENTS:**
✓ Multiple examples per claim (3-5 where possible)
✓ Named companies + specifics (funding, metrics, dates)
✓ Quantified trends (%, timeframes)
✓ Comparative context (vs competitors/benchmarks)
✗ Don't invent numbers - cite or flag as estimate
✗ Don't use single anecdotes as proof
✗ No "growing rapidly" without % + period
`;

  const prompts = {
    signals: `${base}

**AGENT 1/7: MARKET SIGNALS**

  const prompts = {
    signals: `${base}

**AGENT 1/7: MARKET SIGNALS**

CRITICAL: This section must be 700-900 words MINIMUM. If you write less than 600 words, you have failed. Write FULL paragraphs with multiple sentences and examples. DO NOT write bullet points or one-sentence summaries.

**CATEGORY SNAPSHOT**: Write a FULL paragraph (4-6 complete sentences). Define ${company} economically. What's the business model? Where's the margin? How is it different from Patreon, Medium, YouTube? Example length: "Creator monetization infrastructure, specifically paid email newsletters. ${company} is Stripe for writers: handles payments via 10% take rate, email delivery replacing Sendgrid, and subscriber management. Average transaction: $10/mo consumer subscription or $50-200/mo institutional. Margin comes from software (90%+), not services. Structurally different from Patreon (memberships with tiers vs simple newsletters) and Medium (ad-supported membership pool vs direct creator payments)."

**THE WEDGE EXPANDING**: Write 2-3 FULL paragraphs (each paragraph = 5-7 complete sentences).

First paragraph: Name the specific macro shift with a date. Second paragraph: PROVE it with 3-5 concrete examples - each example needs company name, date, and numbers. Write it like: "BuzzFeed News shut down May 2023 with 200+ journalists laid off. Vice Media filed bankruptcy May 2023, $3B valuation to zero. Sports Illustrated laid off 150+ staff January 2024. The Messenger burned $50M in 6 months then shut down January 2024. Condé Nast cut 5% of staff June 2023." Third paragraph: Show this is accelerating and connect to ${company}.

**UNIT ECONOMICS**: Write 2-3 FULL paragraphs. First paragraph: top performers with 2-3 named companies, their CAC, LTV, payback, margin with sources. Second paragraph: median performers showing the spread. Third paragraph: what the concentration means. Example for ONE company should read: "Ben Thompson's Stratechery generates estimated $3M+ annual revenue on 30,000 paid subscribers, which equals $100 LTV per year. CAC is effectively $0 as he built audience organically over a decade. Gross margin exceeds 90% after Substack's 10% take rate plus Stripe fees, per his public blog posts discussing the business model."

**HIDDEN RISK**: Write 1-2 FULL paragraphs (5-6 sentences each). NOT "competition is increasing." Find a structural fragility with specific mechanism, trigger, and quantified impact.

**CAPITAL ENVIRONMENT**: Write 1 FULL paragraph (5-7 sentences). List 2-3 funding rounds with amounts and valuations. Any shutdowns or M&A? Compare ${company} to competitors.

**CONTRARIAN**: Write 1-2 FULL paragraphs. What bulls miss (with evidence), what bears miss (with evidence).

${research}${rules}${ctx}

WORD COUNT CHECK: Your output must be 700-900 words. If it's less than 600 words, you need to add more examples, more data points, more explanation of mechanisms.`,

    competitive: `${base}

**AGENT 2/7: COMPETITIVE LANDSCAPE**

CRITICAL: This section must be 800-1000 words MINIMUM. Write FULL paragraphs with complete sentences. DO NOT write one-line summaries.

**COMPETITIVE SET**: Create a markdown table with 5-6 rows showing real competitors with their positioning, funding, revenue, and how they differ from ${company}.

**POSITIONING MAP**: This needs to be 5 FULL paragraphs total:

Paragraph 1 (4-5 sentences): State your 2 axes and explain why these specific axes matter. Axes must show trade-offs. Example: "Axes are Audience Ownership (Platform-Controlled vs Creator-Owned) and Product Complexity (Simple vs Feature-Rich). Ownership axis determines who controls subscriber relationships, monetization rights, and communication channels. Platform-owned means easier discovery but lower margins for creators. Creator-owned means higher margins but requires solving cold-start problem independently. Complexity axis represents feature set versus learning curve trade-off."

Then write ONE full paragraph for EACH of the 4 quadrants (so 4 more paragraphs, each 4-5 sentences):
- TOP-LEFT paragraph: Companies here, their positioning (3-4 sentences), what they optimize for, what they sacrifice
- TOP-RIGHT paragraph: Same structure
- BOTTOM-LEFT paragraph: Same structure
- BOTTOM-RIGHT paragraph: Same structure

**WHERE ${company.toUpperCase()} WINS**: Write 2 FULL paragraphs (6-7 sentences each). Each paragraph covers one structural advantage. Include: what it is, WHY it's structural (mechanism), 2-3 specific examples with company names and numbers, estimated time for competitors to replicate.

**WHERE ${company.toUpperCase()} LOSES**: Write 2 FULL paragraphs (6-7 sentences each). Be brutally honest. Each paragraph: one disadvantage, mechanism, examples, quantified impact.

**SUBSTITUTION RISK**: 1 FULL paragraph (4-5 sentences) about what could kill the CATEGORY.

**FUNDING GAP**: 1 FULL paragraph (3-4 sentences) comparing funding amounts.

**BLIND SPOT**: 1 FULL paragraph (4-6 sentences) about what entire competitive set is missing.

${research}${rules}${ctx}

WORD COUNT CHECK: Must be 800-1000 words. If less than 700 words, add more detail to positioning map and moats/weaknesses sections.`,

    channels: `${base}

**AGENT 3/7: CHANNEL STRATEGY**

CRITICAL: This section must be 700-900 words MINIMUM. Write detailed analysis, not summaries.

**CURRENT MIX**: Create a markdown table with 4-6 channels showing % acquisition, data source, notes.

**EFFICIENCY DIAGNOSIS**: This is the bulk of your content. For your top 3-4 channels, write 2-3 FULL paragraphs PER channel (so if you have 3 channels, that's 6-9 paragraphs total). Each set of paragraphs for a channel must cover:

Paragraph 1 (5-6 sentences): What's working in this channel? Specific proof points, conversion rates, examples of successful users, why this channel fits the product.

Paragraph 2 (5-6 sentences): What's broken? Not "needs optimization" but the specific failure mode with mechanism explaining why it's bleeding money or opportunity.

Paragraph 3 (4-5 sentences): Unit economics for THIS channel specifically. CAC, LTV, payback period for this channel versus company average.

**REALLOCATION**: Write 2 FULL paragraphs (5-6 sentences each). First paragraph: what to cut, how much ($), why it's wasteful with ROI math. Second paragraph: what to double, investment amount, expected ROI with calculations, expected result in 6 months.

**HIDDEN LEVERAGE**: 1-2 FULL paragraphs (5-6 sentences each) describing one unconventional channel opportunity.

**CHANNEL RISK**: 1 FULL paragraph (4-5 sentences) with quantified impact.

**CAC TRENDS**: 1 paragraph (3-4 sentences).

${research}${rules}${ctx}

WORD COUNT CHECK: Must be 700-900 words. The efficiency diagnosis section should be your longest section with deep dives on 3-4 channels.`,

    segments: `${base}

**AGENT 4/7: CUSTOMER SEGMENTS**

CRITICAL: Must be 700-900 words MINIMUM. Write detailed personas with evidence.

**CORE SEGMENT**: Write 2-3 FULL paragraphs (each 5-7 sentences):

Paragraph 1: Detailed persona. Demographics (age, career stage, income, location), psychographics (motivations, fears, values), behavior patterns. Write like: "Exiled Journalist segment consists of professionals aged 35-55 with 10-20 years in professional journalism, recently laid off or bought out from legacy media organizations including newspapers, magazines, and digital media companies. They have bylines in recognizable publications and have built Twitter followings of 20,000-200,000 over their careers. Previously earned $80-150K in salary as journalists but now seek comparable income with more autonomy."

Paragraph 2: Size estimate and why ${company} resonates. Be realistic about actual addressable market.

Paragraph 3: PROOF with 3-5 REAL customer examples. Each example needs name, numbers (revenue, subscribers, followers). Write like: "Casey Newton left The Verge for Platformer on Substack in 2020 and now generates estimated $800,000 annual revenue from 40,000 paying subscribers. Matt Yglesias departed Vox in 2020 to co-found Slow Boring on Substack. Heather Cox Richardson, an academic historian, built 1.2 million free subscribers with over 50,000 paying, generating estimated $5-6 million annually."

**UNDERSERVED ADJACENT**: 2 FULL paragraphs (5-6 sentences each). First paragraph: persona, why underserved, blocking factors, size estimate. Second paragraph: what would unlock them, 2-3 examples of people in this segment NOT currently using ${company}.

**NET-NEW WHITESPACE**: 2 FULL paragraphs (5-6 sentences each). Jobs-to-be-done analysis, current bad solutions, the whitespace opportunity.

**SEQUENCING**: 2 FULL paragraphs (5-6 sentences each). Force-rank ONE segment. First paragraph: which one and why, investment required. Second paragraph: 90-day milestone, success metrics, decision gates, key risks.

**PARETO CHECK**: 1 paragraph (4-5 sentences) on revenue concentration.

**SEGMENT TRAP**: 1 paragraph (4-5 sentences) on what segment looks attractive but is a distraction.

${research}${rules}${ctx}

WORD COUNT CHECK: Must be 700-900 words. Core segment section should be most detailed with specific named examples.`,

    pivot: `${base}

**AGENT 5/7: GTM BLUEPRINT (SYNTHESIS)**

CRITICAL: Must be 900-1100 words MINIMUM. This is the strategic synthesis - it needs full treatment.

${synthCtx || `[Agent 1: market signal. Agent 2: moat and weakness. Agent 3: channel insight. Agent 4: segment opportunity.]`}

**GTM THESIS**: Write 1 FULL paragraph (5-7 sentences) synthesizing all 4 Wave 1 agents. Pull the thread through: Agent 1 showed X, Agent 2 showed Y, Agent 3 showed Z, Agent 4 showed W, therefore the strategic direction is... Be SPECIFIC about who, what, why.

**WHAT'S WORKING**: Write 2 FULL paragraphs (6-7 sentences each). Each paragraph covers one thing creating defensible advantage: what it is, why it's defensible (mechanism), evidence with data/examples, how it connects to the thesis.

**WHAT'S BROKEN**: Write 2 FULL paragraphs (6-7 sentences each). Things to KILL, not fix. Each paragraph: why it's broken, evidence of failure, opportunity cost, reallocation plan.

**STRATEGIC BET**: This is your longest section. Write 3-4 FULL paragraphs (6-8 sentences each):

Paragraph 1: What to build. Specific features, capabilities, positioning changes. Why NOW (timing). Target customers.

Paragraph 2: Go-to-market approach. How do you reach them? What channels? What messaging? Who do you hire (roles and headcount)?

Paragraph 3: Success metrics. What does success look like at 90 days? Specific numbers. Decision gates: if less than X happens = kill, if X to Y = iterate, if more than Y = double down. Investment required ($ amount, people, timeframe).

Paragraph 4 (if complex): Additional execution details or expansion plans.

**CAPITAL ALLOCATION**: Write 1-2 FULL paragraphs (5-6 sentences each). Specific dollar amounts. Cut $X from Y, reallocate to Z. Show the math. Expected outcome in 6 months with numbers.

**THE RISK**: Write 2 FULL paragraphs (6-7 sentences each). First paragraph: what's the biggest way this thesis could be wrong? Name the core assumption. If false, what breaks? Second paragraph: how do you de-risk or honestly assess if you can live with the risk?

**90-DAY ROADMAP**: Write detailed breakdown:
- Week 1-4: Specific action, owner (role), success metric
- Week 5-8: Specific action, owner, success metric
- Week 9-12: Specific action, owner, success metric, decision gate

${research}${rules}${ctx}

WORD COUNT CHECK: Must be 900-1100 words. Strategic Bet section should be longest with detailed execution plans.`,

    kpis: `${base}

**AGENT 6/7: OPERATING RHYTHM (SYNTHESIS)**

CRITICAL: Must be 700-900 words MINIMUM. North Star needs deep justification.

${synthCtx || `[Agent 5's strategic bet provided]`}

**NORTH STAR METRIC**: Write 3-4 FULL paragraphs (5-7 sentences each):

Paragraph 1: Name the metric and define it precisely. How exactly do you measure it? Example: "Paid Subscriber 90-Day Retention Rate is defined as the percentage of paying subscribers who remain paying customers after three consecutive billing cycles. This is measured cohort-by-cohort, tracking each monthly cohort separately. For monthly subscribers, this means someone who pays in Month 1 is still paying in Month 4. For annual subscribers, someone who pays in Month 1 is still paying in Month 13."

Paragraph 2: WHY this specific metric? How does it tie directly to Agent 5's strategy? Why is it a LEADING indicator not LAGGING? Explain the causal mechanism.

Paragraph 3: Current baseline (if known, otherwise state "Unknown - will establish Week 1"). Target (specific number, timeframe, why that specific target matters). What does hitting this target prove about the business?

Paragraph 4: What does this metric predict? Downstream impacts on revenue, growth, valuation. Show the math.

**3 SUPPORTING METRICS**: For EACH metric, write 2 FULL paragraphs (4-5 sentences each). So this section is 6 paragraphs total:

Metric #1 - Paragraph 1: What it is, current baseline, target with timeframe
Metric #1 - Paragraph 2: Why it matters (how it ladders to North Star), what levers you pull to influence it

Metric #2: Same 2-paragraph structure
Metric #3: Same 2-paragraph structure

**OPERATING RHYTHMS**: Write detailed agendas:

**Weekly (30min)**: Write 5-7 sentences covering: who attends (specific roles not "leadership"), when (day/time), pre-read (what dashboard, sent when), detailed agenda with time blocks: 0-5min do what, 5-15min discuss what, 15-25min decide what, 25-30min wrap what. List specific decisions that get made. List what gets deferred to monthly.

**Monthly (90min)**: Same level of detail in 5-7 sentences.

**Quarterly (half-day)**: Same level of detail in 5-7 sentences.

**VANITY METRIC TRAP**: Write 2 FULL paragraphs (5-6 sentences each). First paragraph: name the misleading metric, why it's a trap, examples with numbers showing the deception. Second paragraph: what to track instead and why that's more honest.

${research}${rules}${ctx}

WORD COUNT CHECK: Must be 700-900 words. North Star justification should be thorough with causal explanations.`,

    narrative: `${base}

**AGENT 7/7: INVESTMENT MEMO (FINAL SYNTHESIS)**

CRITICAL: This is THE MOST IMPORTANT OUTPUT. Must be 1000-1200 words MINIMUM. This is the memo Erik forwards to partners. Every section needs full paragraphs with supporting evidence.

${synthCtx || `[Complete analysis from Agents 1-6 provided]`}

**SITUATION**: Write 3-4 FULL paragraphs (5-7 sentences EACH):

Paragraph 1 (5-6 sentences): Category definition with economic reality not marketing speak. Market size with realistic TAM/SAM/SOM. Example: "Creator monetization infrastructure space, specifically paid email newsletters. Total creator economy estimated at $15B+ per SignalFire 2023 research, though paid newsletter segment represents approximately $500M-1B in GMV based on our analysis of platform data. ${company} operates in the picks-and-shovels layer, providing payment processing via 10% take rate, email delivery infrastructure replacing tools like Sendgrid, and subscriber management capabilities."

Paragraph 2 (6-7 sentences): Why NOW. The specific 90-day trigger from Agent 1 with dates and numbers. Write with specific examples: "Media institutional collapse accelerating dramatically. Since January 2023: BuzzFeed News shut down in May 2023 laying off 200+ journalists, Vice Media filed bankruptcy in May 2023 with valuation collapsing from $3B to zero, Sports Illustrated laid off most staff in January 2024 affecting approximately 150 people, The Messenger burned $50M in just 6 months before shutting down in January 2024..."

Paragraph 3 (6-7 sentences): Unit economics proof with 2-3 named companies. Full details on CAC, LTV, margins with sources.

Paragraph 4 (5-6 sentences): Competitive landscape. Who's winning, who's losing, where ${company} stands with market share estimates.

**COMPLICATION**: Write 2-3 FULL paragraphs (6-7 sentences EACH) creating tension:

Paragraph 1 (6-7 sentences): The hidden weakness from Agent 2. What's structurally broken with specific mechanisms and data. Example: "Growth engine fundamentally broken at structural level. 80% of Substack traffic is direct or email-based according to SimilarWeb January 2024 estimates, meaning users directly type newsletter URLs. Only 8-10% comes from social referrals primarily via Twitter. Zero algorithmic discovery mechanism exists internally. Less than 1% of Substack writers achieve 5,000+ paid subscribers. Success requires pre-existing audience..."

Paragraph 2 (6-7 sentences): Channel problem from Agent 3 OR segment concentration risk from Agent 4.

Paragraph 3 (5-6 sentences): Why this creates URGENCY. What happens if status quo continues?

**CONVICTION**: Write 4-5 FULL paragraphs (6-8 sentences EACH) building the bull case:

Paragraph 1: **The Insight.** What does ${company} see that others miss? With supporting logic.

Paragraph 2: **The Wedge.** How they enter and win. Go-to-market approach with specific tactics.

Paragraph 3: **The Moat.** What makes it defensible? Pull from Agent 2 with mechanisms and examples.

Paragraph 4: **The Metrics.** What proves it's working? From Agent 6 with specific targets and timelines.

Paragraph 5: **The Outcome.** If executed, what happens? Revenue projections, valuation implications with math.

**BEAR CASE**: Write 2-3 FULL paragraphs (6-7 sentences EACH):

Paragraph 1 (6-7 sentences): Steel-man the strongest counter-argument. Make it BETTER than bears would. Include evidence and logic.

Paragraph 2 (6-7 sentences): The honest counter-argument. Don't be defensive - address it directly with reasoning.

Paragraph 3 (optional, 5-6 sentences): Second bear case if relevant.

**THESIS SUMMARY**: Write 2-3 sentences that are memorable and capture the entire investment thesis in elevator pitch format.

**THE ASK** (if fundraising): 1 paragraph with round size, use of funds, milestones, valuation.

${research}${rules}${ctx}

WORD COUNT CHECK: This MUST be 1000-1200 words. If you write less than 900 words, you have failed to provide adequate depth. Each Situation paragraph should be 5-7 sentences. Each Complication paragraph should be 6-7 sentences. Each Conviction paragraph should be 6-8 sentences. DO NOT write one-sentence summaries like "Creator economy $15B" - that is unacceptable. Write full contextual paragraphs with supporting evidence, examples, and specific data points.`,
  };
  
  return prompts[id] || "";
}; 

First paragraph: Name the macro shift happening RIGHT NOW. Be specific with a date.

Second paragraph: PROVE IT with 3-5 concrete examples. Each example needs: company name, date, numbers (people affected, dollars, percentages). Example format: "BuzzFeed News shut down (May 2023, 200+ journalists), Vice bankruptcy (May 2023, $3B→$0), SI layoffs (Jan 2024, 150 staff)..." 

Third paragraph: Show this is ACCELERATING (compare current rate vs historical). Connect to ${company}'s opportunity. Why does this create a window?

**UNIT ECONOMICS** (2-3 full paragraphs):

Don't just cite ONE company. Find 2-3 REAL named companies and show the RANGE:

Paragraph 1: Top performers. For 2-3 companies: name, CAC, LTV, payback, margin. Cite sources or explain estimation method. Example: "Stratechery (Ben Thompson): $3M+/yr on 30K subs = $100 LTV. CAC $0 (organic over decade). 90% margin per public blog posts."

Paragraph 2: Median/bottom performers. Show the spread. If top 1% earn 300x median, STATE THAT with the math. Use category benchmarks if specific data unavailable.

Paragraph 3 (optional): What does the spread tell you? Is this hits-driven or democratized? Compare to YouTube, Spotify, Patreon concentration. Gini coefficient if known.

**HIDDEN RISK** (1-2 full paragraphs):

NOT obvious risks like "competition." Find a NON-OBVIOUS structural fragility.

Paragraph 1: What's the risk? Why is it hidden (why bulls miss it)? Specific mechanism of failure. Example: "Discovery dependency = 80% traffic from Twitter (per SimilarWeb). Twitter algorithm changed Oct 2023, engagement -40%. If Twitter blocks links entirely (tested Aug 2023), new writer CAC jumps 3-5x."

Paragraph 2 (optional): Quantify the impact. What breaks if this risk materializes? Numbers, not vibes.

**CAPITAL ENVIRONMENT** (1 full paragraph, 5-7 sentences):

Recent funding in category (last 12 months). List 2-3 rounds with: company, amount, valuation, revenue multiple if known. Any down-rounds? Shutdowns? M&A attempts (failed or successful)? How does ${company} compare? Is capital flowing in or out of this category?

**CONTRARIAN INSIGHT** (1-2 full paragraphs):

Paragraph 1: What are BULLS missing? Evidence required. Not "bulls are too optimistic" — specific blind spot with data.

Paragraph 2: What are BEARS missing? Evidence required. Or write "No strong contrarian view" if you don't have one. Don't force it.

${research}${rules}${ctx}

**TARGET: 700-900 words.** If you're writing 400 words, you're not providing enough supporting evidence. Each claim needs 2-3 data points.`,

    competitive: `${base}

**AGENT 2/7: COMPETITIVE LANDSCAPE** — Answer TWO questions: (1) What's the ONE structural moat? (2) What's the ONE structural kill shot?

**COMPETITIVE SET** (Table format, 5-6 rows):

| Competitor | Positioning (one sentence) | Last Funding/Valuation | Est. Revenue | Key Difference vs ${company} |

Real companies only. Include direct competitors (same solution) AND indirect (different solution, same job-to-be-done).

**POSITIONING MAP** (Full quadrant explanation):

Paragraph 1: State your 2 axes. Explain why THESE axes matter (2-3 sentences). Axes should show TRADE-OFFS, not "good vs bad." Example: "Audience Ownership (Platform vs Creator-Owned) × Complexity (Simple vs Feature-Rich). Ownership = who controls monetization. Platform = easier growth, lower margin. Creator-owned = higher margin, cold start problem. Complexity = power vs ease. Simple = fast adoption, limited use cases. Rich = flexible but overwhelming."

Then ONE paragraph per quadrant (4 paragraphs total):
- TOP-LEFT: List 1-2 companies. Explain positioning (3-4 sentences). What are they optimizing FOR? What are they optimizing AGAINST? Concrete example of the trade-off.
- TOP-RIGHT: Same structure
- BOTTOM-LEFT: Same structure  
- BOTTOM-RIGHT: Same structure

**WHERE ${company.toUpperCase()} WINS** (2 full paragraphs):

Paragraph 1: Structural advantage #1. What is it? WHY is it structural (mechanism)? 2-3 concrete examples with companies/numbers. Time for competitors to replicate? Example: "Brand moat. When NYT lays off journalists, 68% consider Substack first (per The Information 2023 survey vs 12% alternatives). Examples: Casey Newton ($800K/yr), Matt Yglesias, Heather Cox (50K paid). Built over 5 years. Beehiiv can copy features in 6mo but can't copy 5 years of NYT press coverage."

Paragraph 2: Structural advantage #2 (and #3 if relevant). Same depth.

**WHERE ${company.toUpperCase()} LOSES** (2 full paragraphs):

Be BRUTALLY HONEST. Paragraph 1: Disadvantage #1 with mechanism + examples + impact. Paragraph 2: Disadvantage #2. Don't sugarcoat — investors respect honesty.

**SUBSTITUTION RISK** (1 paragraph, 4-5 sentences): What could kill the CATEGORY (not just ${company})? Not obvious like "new competitor" — what FORMAT or BEHAVIOR change breaks this? Example: "Voice-first consumption. If AI audio briefings (ChatGPT voice, NotebookLM) replace reading, text newsletters die. Early signal: OpenAI Advanced Voice can summarize docs. Timeframe: 24-36 months."

**FUNDING GAP** (1 paragraph, 3-4 sentences): How much has ${company} raised vs competitors? Runway implications? Pressure to grow into valuation?

**BLIND SPOT** (1 paragraph, 4-6 sentences): What is the ENTIRE competitive set missing? Something no one is building. Example: "AI-native writing workflow. Everyone focused on distribution (how to get readers). No one solving creation (how to write faster). Imagine: voice→draft, research synthesis, auto-headlines. Whoever builds AI creation + distribution + monetization wins. Gap is 12-18 months."

${research}${rules}${ctx}

**TARGET: 800-1000 words.** Need depth on moats and weaknesses. If under 600 words, add more examples.`,

    channels: `${base}

**AGENT 3/7: CHANNEL STRATEGY** — Find the hidden CAC inefficiency. Show where money leaks.

**CURRENT MIX** (Table, 4-6 channels):

| Channel | % New Acquisition | Data Source | Notes |

Example: Direct/Email 75% | SimilarWeb Jan 2024 | Users typing URLs

**EFFICIENCY DIAGNOSIS** (Detailed — 2-3 full paragraphs PER major channel):

For your top 3-4 channels, write:

Paragraph 1: What's working? Specific proof points. Conversion rates, examples of success. Why this channel fits the product.

Paragraph 2: What's broken? Not "needs optimization" — specific failure mode with mechanism. Why it's bleeding money or opportunity.

Paragraph 3: Unit economics for THIS channel. CAC, LTV, payback period. Compare to company average. If you're estimating, say how.

Example for ONE channel: "Direct/Email works for established writers. Casey Newton brought 100K Twitter followers → 20K signups week 1. CAC $0. But broken for new writers (<500 followers). They get 0 subs on Day 1, need 6-12 months building audience elsewhere before Substack pays off. Compare YouTube: algorithm gives new creators 300-500 views on first video. Substack gives 0."

**REALLOCATION THESIS** (2 full paragraphs):

Paragraph 1: What to CUT. Specific % or $ amount. Why it's wasteful. Example: "Cut 80% of paid ads ($2-5M/year estimated). Paid ads for $10/mo newsletter = $40-80 CAC = 4-8 month payback. Mismatched: newsletters are high-trust, low-AOV. Compare: Casey Newton's referrals = $0 CAC, instant payback."

Paragraph 2: What to DOUBLE. Specific investment. Why it has better ROI. Expected result in 6 months. Example: "Double cross-promotion engine. Current <5% adoption of manual 'Recommendations.' Build algorithmic version in-email. If 20% of readers subscribe to 2nd newsletter (realistic per Spotify Discover Weekly ~25% trial rate), LTV jumps 50%. At 1M paid subs × 20% = 200K additional subscriptions = $24M GMV. Investment: $5-10M engineering. Payback: Year 2-3."

**HIDDEN LEVERAGE** (1-2 full paragraphs):

One unconventional channel shift that could 10x growth. Not "do more of what works" — something NON-OBVIOUS. Paragraph 1: What's the idea? Why hasn't anyone done it? Paragraph 2: Execution specifics. Economics. Why it could work. Example: "Publisher partnerships. Don't recruit writers 1-by-1 (linear growth). Partner with struggling newsrooms, migrate entire teams. One Axios partnership = 100 writers + their audiences in one deal. That's 1-2 years of current growth in 6 months."

**CHANNEL RISK** (1 paragraph, 4-5 sentences): Biggest dependency. Quantify: if this channel breaks, what's the impact? Example: "Twitter dependency = existential. 60-70% of top writers cite Twitter as #1 growth channel (based on interviews). Twitter deprioritized links Oct 2023. If Twitter blocks links entirely, new writer CAC jumps 3-5x. No Plan B visible."

**CAC TRENDS** (1 paragraph): Is CAC going up or down over time? Category signals? Evidence?

${research}${rules}${ctx}

**TARGET: 700-900 words.** Deep dive on 3-4 channels minimum. If under 500 words, not enough detail.`,

    segments: `${base}

**AGENT 4/7: CUSTOMER SEGMENTS** — Which segment does ${company} ACTUALLY own vs which are vanity metrics?

**CURRENT CORE SEGMENT** (2-3 full paragraphs):

Paragraph 1: Detailed persona. Demographics (age, career stage, income, location). Psychographics (motivations, fears, what they value). Behavior patterns.

Paragraph 2: Size estimate (be realistic — not total addressable market, the ACTUAL segment). Why does ${company} resonate with THIS segment specifically? What features/positioning win them?

Paragraph 3: PROOF with 3-5 REAL customer examples. Names. Numbers (revenue, subs, followers). Make it concrete. Example: "Casey Newton (Platformer): $800K/yr, 40K paid subs. Matt Yglesias (Slow Boring): Co-founded on Substack. Heather Cox Richardson: 1.2M free, 50K+ paid = $5-6M/yr. These 5 examples alone = $15-20M GMV, ~15% of platform."

**UNDERSERVED ADJACENT** (2 full paragraphs):

Paragraph 1: Persona (similar format). Why underserved — what's blocking them from using ${company} today? Size estimate. Example: "Corporate experts (ex-McKinsey, executives, academics). Have LinkedIn 5K-100K but don't identify as 'writers.' Blocked because: positioned as 'journalism platform,' no B2B pricing, no LinkedIn integration, no team features."

Paragraph 2: What would unlock them? Specific product changes, go-to-market shifts. 2-3 examples of people in this segment NOT using ${company} today. Example: "Hamilton Helmer (7 Powers): has frameworks, audience, but uses personal site. Ben Hunt (Epsilon Theory): self-hosted, $30K/yr subs. If Substack had B2B features 3 years ago, these would've started here."

**NET-NEW WHITESPACE** (2 full paragraphs):

Paragraph 1: Jobs-to-be-done lens. What segment doesn't use this category today but SHOULD? What job are they hiring a crappy solution for? Size estimate.

Paragraph 2: The whitespace opportunity. What would need to exist? Example: "YouTubers seeking diversification. Earning $50-500K/yr from YouTube ads. Want predictable revenue but bad at writing. Whitespace: AI-powered video→newsletter. Upload video → AI transcribes → generates 800-word summary → creator edits 15 min → auto-publishes. 2 hrs/week = $20-100K/yr additional revenue."

**SEQUENCING** (2 full paragraphs):

Paragraph 1: Force-rank ONE segment for next 12 months. Why THIS one over the others? Be decisive. Don't hedge with "all three are attractive." Investment required ($, people, time). Expected outcome.

Paragraph 2: 90-day milestone to validate. Success metric. Decision gate: if <X happens, kill. If >Y happens, double down. The risk: what assumption could be wrong?

**PARETO CHECK** (1 paragraph): Revenue concentration? Top 10% = what % of GMV? Top 1%? Compare to YouTube, Spotify, Patreon. What does concentration tell you about strategy?

**SEGMENT TRAP** (1 paragraph): What segment LOOKS attractive (big TAM) but is actually a distraction? Why it's a trap. Example: "Hobbyist writers. TAM looks huge (10M 'want to write'). Reality: zero expertise, no audience, median <$500/year, high support cost. Makes <$50K/yr but consumes 80% of support resources. This dilutes brand from 'professional publishing' to 'hobby platform.'"

${research}${rules}${ctx}

**TARGET: 700-900 words.** Need detailed personas with evidence. If under 500 words, not substantive enough.`,

    pivot: `${base}

**AGENT 5/7: GTM BLUEPRINT (SYNTHESIS)** — Wave 1 complete. Synthesize into ONE strategic bet.

${synthCtx || `[Agent 1: Market signal. Agent 2: Moat + weakness. Agent 3: Channel insight. Agent 4: Segment focus.]`}

**GTM THESIS** (1 full paragraph, 4-6 sentences):

Synthesize all 4 Wave 1 agents. What thread runs through them? State the ONE strategic direction. Be SPECIFIC: Who is the target? What changes? Why now? Example structure: "Agent 1 showed [signal]. Agent 2 showed moat is [X] but weakness is [Y]. Agent 3 showed [channel problem]. Agent 4 showed [segment opportunity]. THESIS: [One clear strategic bet that addresses all of these]."

**WHAT'S WORKING** (2 full paragraphs, 5-7 sentences each):

Paragraph 1: Thing #1 creating defensible advantage. What it is. Why it's defensible (mechanism). Evidence it's working (data/examples). How it connects to the thesis.

Paragraph 2: Thing #2 (and #3 if relevant). Same depth.

**WHAT'S BROKEN** (2 full paragraphs, 5-7 sentences each):

Things to KILL, not fix. Paragraph 1: Why it's broken. Evidence of failure. Opportunity cost of continuing. What to do instead (kill + reallocate where). Paragraph 2: Thing #2 to kill.

**THE STRATEGIC BET** (3-4 full paragraphs):

Paragraph 1: What to build. Specific features, capabilities, positioning changes. Why NOW (timing from Agent 1). Target customers (from Agent 4).

Paragraph 2: Go-to-market approach. How do you reach them? What channels? What messaging? Who do you hire?

Paragraph 3: Success metrics. What does success look like at 90 days? Numbers, not vibes. Decision gates: <X = kill, X-Y = iterate, >Y = double down. Investment required ($, people, time).

Paragraph 4 (optional): If the bet is complex, add execution details.

**CAPITAL ALLOCATION** (1-2 paragraphs):

Specific numbers. Cut X% from [what] = $[amount]. Reallocate to [what] = $[amount]. Expected outcome in 6 months. If the numbers don't add up to venture-scale, explain why not.

**THE RISK** (2 full paragraphs):

Paragraph 1: What's the biggest way this thesis could be WRONG? Name the core assumption. If it's false, what breaks? Example: "Risk: Corporate experts won't publish consistently. Journalists publish 2-4x/week (it's their identity). Consultants are not writers. If 60% abandon after 3 posts vs 30% journalist churn, economics don't work."

Paragraph 2: How do you de-risk it? Or honestly assess: can you live with the risk?

**90-DAY ROADMAP** (Structured breakdown):

Week 1-4: [Action. Owner. Success metric.]
Week 5-8: [Action. Owner. Success metric.]
Week 9-12: [Action. Owner. Success metric. Decision gate.]

${research}${rules}${ctx}

**TARGET: 900-1100 words.** This is the core synthesis. If under 700 words, not enough depth.`,

    kpis: `${base}

**AGENT 6/7: OPERATING RHYTHM (SYNTHESIS)** — Agent 5's bet is defined. Pick ONE metric that proves it's working.

${synthCtx || `[Agent 5's strategic bet provided]`}

**NORTH STAR METRIC** (3-4 full paragraphs):

Paragraph 1: Name the metric. Define it precisely (how do you measure it?). Example: "Paid Subscriber 90-Day Retention = % of paid subs who remain paying after 3 billing cycles. Measure cohort-by-cohort."

Paragraph 2: WHY this metric? How does it tie to Agent 5's strategy? Why is it a LEADING indicator (predicts future) not LAGGING (shows past)? Example: "Revenue is lagging. Retention is leading. Agent 2 showed moat is convenience. Only retention proves convenience > switching cost. Top writers should have 80-90% retention if we deliver value."

Paragraph 3: Current baseline (if known, otherwise state "Unknown"). Target (specific number + timeframe). WHY that target? What does hitting it prove?

Paragraph 4: What does this metric predict? Downstream impacts. Example: "At 75% retention, LTV jumps from $120 to $180 (15 month avg vs 10 month). That's 50% LTV improvement → can invest 50% more in growth without changing unit economics."

**3 SUPPORTING METRICS** (2-3 paragraphs EACH):

For EACH metric, write 2-3 full paragraphs:

Metric #1:
- Paragraph 1: What it is. Current baseline. Target.
- Paragraph 2: Why it matters. How it ladders to North Star. How do you influence it (what levers)?

Metric #2: Same structure
Metric #3: Same structure

**OPERATING RHYTHMS** (Detailed agendas):

**Weekly (30min):** Who attends (specific roles). When (day/time). Pre-read (what dashboard sent when). Agenda with time blocks: 0-5min [what], 5-15min [what], 15-25min [what], 25-30min [what]. Decisions made. No-discussion zones (defer to monthly).

**Monthly (90min):** Same structure.

**Quarterly (half-day):** Same structure. Include board if relevant.

**VANITY METRIC TRAP** (2 full paragraphs):

Paragraph 1: Name the metric that LOOKS impressive but is misleading. Why it's a trap. Example with numbers. "Total newsletter signups = 500K sounds great. But median makes <$500/yr. Math: 500K × $500 = $250M GMV. Actual GMV = $100-150M. Most make $0."

Paragraph 2: What to track INSTEAD. Why this is more honest. Example: "Track 'Active, monetizing newsletters' = published 3+ times in 30 days + 100+ paid subs. That's ~5K newsletters = the real business."

${research}${rules}${ctx}

**TARGET: 700-900 words.** Need depth on North Star rationale + supporting metrics. If under 500 words, too brief.`,

    narrative: `${base}

**AGENT 7/7: INVESTMENT MEMO (FINAL SYNTHESIS)** — All 6 agents complete. Write the memo Erik forwards to partners.

${synthCtx || `[Complete analysis from Agents 1-6 provided]`}

**SITUATION** (3-4 full paragraphs):

Paragraph 1: Category definition (economic reality, not marketing). Market size (be realistic about TAM/SAM/SOM). Example: "Creator monetization infrastructure. $15B+ creator economy per SignalFire, but paid newsletter segment ~$500M-1B GMV (our estimate). ${company} provides payments (10% take), email delivery, subscriber management."

Paragraph 2: Why NOW. The specific 90-day trigger from Agent 1. With dates and numbers. Example: "Media unbundling accelerating. BuzzFeed shut May 2023 (200+ journalists), Vice bankruptcy May 2023, SI layoffs Jan 2024. Per Pew: newsroom employment -26% (2008-2023), but -6% in 2023 alone = acceleration. Supply shock: 500+ journalists with 20K+ followers available."

Paragraph 3: Unit economics proof. 2-3 named companies with CAC, LTV, margin. Show this can be venture-scale. Example: "Casey Newton $800K/yr ($0 CAC), Lenny $4M ARR ($25 CAC), Matt Levine $2-3M. Unit economics: $10-25 CAC, $120-180 LTV, 85-90% margin. Beats Patreon, Medium, YouTube."

Paragraph 4: Current competitive landscape. Who's winning? Who's losing? Where's ${company}? Example: "Competitive landscape fragmented: Beehiiv ($12.5M Series A, growth tools), Ghost ($8M ARR bootstrapped), Medium (declining), Patreon ($415M raised, memberships not newsletters). No one owns 'serious professional writer.' ${company} recruited ~200 of top 500 = <50% penetration."

**COMPLICATION** (2-3 full paragraphs):

Create TENSION. Pull from Agents 2-4.

Paragraph 1: The hidden weakness (from Agent 2). What's structurally broken? Example: "Growth engine broken. 80% traffic direct/email per SimilarWeb. Zero algorithmic discovery. <1% of writers hit 5K+ paid subs. Success requires existing audience — Casey had 100K Twitter followers, Lenny had 50K email list from job. New writer with <500 followers? Effectively zero chance."

Paragraph 2: The channel problem (from Agent 3) OR segment risk (from Agent 4). Example: "Discovery dependency = single point of failure. 60-70% of top writers cite Twitter as #1 growth (interviews). Twitter algorithm changed Oct 2023, engagement -40%. If Twitter blocks links entirely (tested Aug 2023), new writer CAC jumps 3-5x overnight."

Paragraph 3: Why this creates URGENCY. What happens if status quo continues? Example: "Pareto worsening: top 10% drive 70-80% GMV (vs YouTube 50%, Spotify 60%). Product roadmap served bottom 90% (Notes, Chat). All <5% adoption. Meanwhile top 1% — who generate 15-20% revenue — underserved on enterprise features."

**CONVICTION** (4-5 full paragraphs):

Build the bull case. Pull from Agent 5's bet + Agent 6's metrics.

Paragraph 1: **The Insight.** What does ${company} see that others miss? Example: "This is not democratization business — it's infrastructure for top 500-1000 professional writers globally. Bottom 90% = R&D expense. Top 5-10% = profit center. Median writer <$500/yr but top 10 = $15-20M combined (~15% of GMV). If you removed bottom 90%, revenue drops <10% but support costs drop 80%."

Paragraph 2: **The Wedge.** How do they enter and win? Go-to-market. Example: "Enter via exiled journalists (immediate supply from layoffs), expand to corporate experts (ex-consultants, executives, academics monetizing LinkedIn audiences). Both have: existing audiences (10K-100K followers), domain expertise, economic motivation (income replacement or diversification). No viable alternative."

Paragraph 3: **The Moat.** What makes it defensible? From Agent 2. Example: "Three layers: (1) Brand = default for serious writers. 68% of laid-off journalists consider Substack first per The Information survey. Built over 5 years, can't replicate quickly. (2) Simplicity = operational lock-in. Writers earning $500K+ value time at $1000/hr. Won't spend 40hrs/yr managing servers to save $50K in fees. (3) Network effects if cross-sub works. Currently <5%. If algorithmic recommendations drive to 20% (realistic per Spotify), LTV jumps 50%."

Paragraph 4: **The Metrics.** What proves it's working? From Agent 6. Example: "North Star: 90-day retention. Current 60-70% top writers, target 75% by Q3 2025. Supporting: Cross-sub <5%→20% (network effects), B2B share <10%→25% (segment expansion), Publish consistency 40%→60% (engagement). If these hit: GMV grows 3x in 18mo without proportional CAC increase."

Paragraph 5: **The Outcome.** If executed, what happens? Example: "If executed, becomes Bloomberg Terminal of professional writing — default infrastructure for 5K-10K professional writers globally generating $500K-$5M+ annually. Estimated $500M-1B GMV by 2027-2028 at 20-30% net margin = $100-300M revenue. At 10-15x multiple = $1-4.5B valuation. That's 2-7x current $650M over 3-4 years."

**BEAR CASE** (2-3 full paragraphs):

Steel-man the strongest objection. Then counter it HONESTLY.

Paragraph 1: Best counter-argument. Make it BETTER than the bears would. Example: "Top writers can leave anytime. Email lists portable. Zero technical lock-in. Ben Thompson could migrate to WordPress tomorrow, keep 95% subs, save $300K/yr in fees. If top 10 writers leave (15-20% of GMV), new writer signups drop 40% (social proof dependency). Brand moat collapses."

Paragraph 2: The honest counter. Example: "Counter: Switching costs are operational, not technical. Yes, exporting email list = 1 click. But then: set up Stripe Connect, configure Mailgun, build subscriber management, handle support, monitor deliverability. For writer earning $500K-3M/yr, that's 40-60 hours/year. At $1000/hr opportunity cost = $40-60K burden. Net savings: $10-50K. Ben Thompson's been on Substack since 2014, hasn't left despite $3M in foregone savings over 10 years. Revealed preference: simplicity > savings."

Paragraph 3 (optional): Second bear case + counter if relevant.

**THESIS SUMMARY** (2-3 sentences):

Elevator pitch. Make it MEMORABLE. Example: "${company} = infrastructure for media unbundling. TAM not 'everyone who wants to write' (mirage). TAM = 5K-10K professional writers with audiences + expertise. ${company} captured ~5%. Next 18mo: own top 500 journalists, expand to 500-1000 corporate experts, build cross-sub network effects. If executed: becomes Bloomberg Terminal of professional writing — can't run $1M/yr writing business without it."

**THE ASK** (if fundraising, 1 paragraph):

Round size, use of funds breakdown, milestones, valuation expectation. If not fundraising, end with thesis summary.

${research}${rules}${ctx}

**TARGET: 1000-1200 words.** This is final synthesis — needs full treatment. If under 800 words, missing depth.`,
  };
  
  return prompts[id] || "";
};
    competitive: `${base}

**AGENT 2 OF 7: COMPETITIVE LANDSCAPE**

Your job: Answer the only two questions that matter: (1) What's the ONE moat? (2) What's the ONE kill shot?

## YOUR MISSION

Don't give me a feature comparison table. Give me the STRUCTURAL advantage ${company} has that competitors can't copy in 18 months, and the STRUCTURAL disadvantage that could kill them.

## WHAT TO DELIVER

**COMPETITIVE SET** (Table)
Top 5 competitors. For each, state:
- Name
- Positioning (one sentence)
- Last known funding round (cite or say "estimated")

Real competitors only. If you list someone, I should be able to Google them and find a TechCrunch article.

**POSITIONING MAP** (Critical — use QUADRANT format)

Choose 2 axes that show TRADE-OFFS, not "good vs bad."

Bad axes: "Quality" vs "Price" (everyone wants high quality, low price)
Good axes: "Owned Audience" vs "Platform Audience" × "Simple" vs "Feature-Rich"

Format (use this exact structure):

**Axes: [Axis 1 Name] (Left vs Right) × [Axis 2 Name] (Top vs Bottom)**

**TOP-LEFT ([Axis1 Left], [Axis2 Top]):**
• Company: Why positioned here, what trade-off they're making

**TOP-RIGHT ([Axis1 Right], [Axis2 Top]):**
• Company: Why positioned here

**BOTTOM-LEFT ([Axis1 Left], [Axis2 Bottom]):**
• Company: Why positioned here

**BOTTOM-RIGHT ([Axis1 Right], [Axis2 Bottom]):**
• Company: Why positioned here

Show where MONEY flows, not just where features are.

**WHERE ${company.toUpperCase()} WINS** (The Moat)
ONE structural advantage competitors can't copy in 18 months. Not "better UX" (anyone can copy). Not "team" (teams change). Examples of real moats:
- Network effects (value increases with users)
- Brand (took 5+ years to build)
- Regulatory capture (licenses, compliance)
- Switching costs (data lock-in, integrations)

Be specific about the MECHANISM. Why can't competitors copy this?

**WHERE ${company.toUpperCase()} LOSES** (The Kill Shot)
ONE structural disadvantage that could kill ${company}. The thing that keeps the CEO up at night.

Example: "Email lists are portable. Switching cost is literally one export button + one import. If Twitter launches native subscriptions at 5% take rate vs Substack's 10%, top writers migrate in 48 hours. ${company} has no lock-in."

**SUBSTITUTION RISK**
What non-obvious substitute could kill the CATEGORY? Not just competitors, but different solution to the same problem.

Example: "If ChatGPT's voice mode gets good enough, people get their news via 10-min audio briefings instead of reading newsletters. The format dies, not just the platform."

**COMPETITIVE FUNDING GAP**
How much have competitors raised vs ${company}? Does ${company} have enough runway to execute? Cite amounts or estimate.

**THE BLIND SPOT**
What is the ENTIRE competitive set ignoring? Something no one is building toward, but someone should be.

Bad: "They all need better discovery" (everyone knows)
Good: "No one is building AI-native workflow. Next winner might auto-generate drafts from talking points + sources, A/B test headlines, optimize send times. Everyone's competing on distribution, ignoring creation. Whoever solves creation becomes the OS."
${research}${antiHallucination}
${ctx}

**OUTPUT:** 700-900 words. Be HONEST about where ${company} loses. Investors respect brutal honesty more than cheerleading.`,

    channels: `${base}

**AGENT 3 OF 7: CHANNEL STRATEGY**

Your job: Find the hidden CAC inefficiency everyone's ignoring. Show me where money is leaking.

## YOUR MISSION

Every company has 1-2 channels that SHOULD work but don't, and 1 channel that works but is underinvested. Find them.

## WHAT TO DELIVER

**CURRENT CHANNEL MIX** (Be specific)
List top 3-5 channels with estimated % of new customer acquisition. Use tools like SimilarWeb, BuiltWith, or cite the company if public.

Example: "Per SimilarWeb estimates: Direct/Email 80%, Organic Search 10%, Social (Twitter) 8%, Paid <2%"

If you're estimating, say so: "Estimated based on SimilarWeb traffic sources and typical industry patterns."

**CHANNEL EFFICIENCY DIAGNOSIS** (Critical section)
For EACH major channel, answer:

1. **What's working?** (Specific proof point)
Example: "Direct works because users type 'substack.com/[writer]' = zero CAC for established writers. Free-to-paid conversion 10-15% per category benchmarks."

2. **What's broken?** (Specific failure mode)
Example: "SEO broken because each writer is on separate subdomain (writer.substack.com vs substack.com/writer). Domain authority fragmented across 500K subdomains. Google treats each as separate site. Substack gets no aggregate SEO benefit."

3. **Unit economics** (if known)
CAC by channel. LTV:CAC ratio. Payback period. Cite or estimate.

**THE REALLOCATION THESIS** (Action-oriented)
- Which channel should ${company} CUT budget from? Why?
- Which channel should ${company} DOUBLE budget on? Why?
- Expected outcome in 6 months if they do this?

Be specific. "Cut paid ads (current $80 CAC for $10/mo product = 8mo payback). Double cross-promotion engine (currently <5% adoption, if 20% of readers subscribe to 2nd newsletter, LTV jumps 50%)."

**THE HIDDEN LEVERAGE POINT**
One channel shift that could 10x growth in 12 months.

Example: "Publisher partnerships. Instead of recruiting individual writers, recruit entire newsrooms. One Axios/Politico partnership = 100 writers + their audiences in one deal. Current approach (1 writer at a time) doesn't scale."

**THE CHANNEL RISK**
Biggest channel dependency that could break ${company}?

Example: "60-70% of top newsletters cite Twitter as #1 acquisition source (estimated from writer interviews). Twitter algorithm deprioritized external links in Oct 2023. If Twitter kills link cards entirely (like they tried in Aug 2023), new writer CAC jumps 3-5x overnight. No diversification plan visible."

**CAC TRENDS**
Is CAC going up or down over time? If you don't have data, what does category pattern suggest? Cite or explain reasoning.
${research}${antiHallucination}
${ctx}

**OUTPUT:** 600-800 words. Show me the money. Where's it leaking? Where should it flow?`,

    segments: `${base}

**AGENT 4 OF 7: CUSTOMER SEGMENTS**

Your job: Separate signal from noise. Which segments does ${company} ACTUALLY own vs which are vanity metrics?

## YOUR MISSION

Most companies think they serve 5 segments. Reality: They OWN one, dabble in two, and the rest are rounding errors. Find the one they own.

## WHAT TO DELIVER

**CURRENT CORE SEGMENT** (Be specific)
Who is ${company} WINNING with today? Not who they SAY they serve — who's actually paying.

Create a specific persona:
- Demographics (age, job, income)
- Psychographics (why they care)
- Size (TAM for THIS segment, not total market)
- Why ${company} resonates with them specifically

Example: "Exiled journalist. Age 35-50, laid off from legacy media (BuzzFeed, Vice, local newspapers), has 20K-100K Twitter followers built over 10 years. Wants editorial independence + comparable economics to $120K salary. ${company} resonates because: (1) Simple tech, (2) Keeps 90% of revenue, (3) Email = owned distribution. TAM: ~5,000 journalists laid off 2020-2024, maybe 500 with monetizable audiences."

**THE UNDERSERVED ADJACENT**
What segment is NEXT to current core but currently underserved? What's blocking them from using ${company} today? What would unlock them?

Example: "Corporate experts. McKinsey/Bain alums, think tank researchers, academics. Have LinkedIn audiences (5K-50K), domain expertise, but don't identify as 'writers.' Currently using LinkedIn posts (zero revenue) or corporate speaking ($5K/gig). Blocking factor: ${company} positioned as 'journalism platform,' not B2B thought leadership. Unlock: B2B pricing ($50-200/mo institutional subscriptions), LinkedIn integration, co-marketing with conferences."

**THE NET-NEW WHITESPACE**
What segment DOESN'T use this category today but SHOULD, if you solve their job-to-be-done?

Use Clayton Christensen jobs-to-be-done lens. What job are they hiring a crappy solution for?

Example: "Full-time YouTubers. Make $50-200K/yr from ads but 100% dependent on algorithm. Want diversification hedge but bad at writing. Job-to-be-done: Turn video transcripts into weekly summary email. Current solution: None (they just don't do it). Whitespace: If ${company} had AI transcription → newsletter generation, creators add $20K/yr email revenue with 2 hrs/week effort."

**SEGMENT SEQUENCING** (Critical decision)
If ${company} could only go after ONE new segment in next 12 months, which one? Why? What's the unlock? What's the risk?

Be decisive. Don't say "all three are attractive." Force-rank.

**THE PARETO CHECK**
What % of revenue comes from top 10% of users? What % from top 1%?

If you don't have data, what's the category pattern? Is this winner-take-all or creator middle class?

Example: "Estimated top 10% = 70% of GMV based on power law distribution typical in creator economy. More concentrated than Spotify (60%), YouTube (50%). This is hits-driven business disguised as platform. Strategy should optimize for top 1%, not democratize for bottom 90%."

**THE SEGMENT THAT'S A TRAP**
What segment LOOKS attractive (big TAM, underserved) but is actually a distraction?

Example: "Hobbyist writers. TAM looks huge (10M people who say 'I want to write'). Reality: Zero domain expertise, no audience, no revenue. High support costs, low LTV. Median hobbyist makes <$500/yr. This is not the business — it's brand dilution."
${research}${antiHallucination}
${ctx}

**OUTPUT:** 600-800 words. Be DECISIVE about which segment to own. Hedging is not a strategy.`,

    pivot: `${base}

**AGENT 5 OF 7: GTM BLUEPRINT (SYNTHESIS)**

You've read Agents 1-4. Your job: Synthesize into ONE strategic bet. Not 5 priorities — ONE thing.

## CONTEXT FROM WAVE 1

${synthCtx || `
Agent 1 (Market Signals) found: [key market signal]
Agent 2 (Competitive) found: [moat + kill shot]
Agent 3 (Channels) found: [CAC inefficiency]
Agent 4 (Segments) found: [segment to own]
`}

## YOUR MISSION

Given everything Wave 1 uncovered, what's the ONE strategic bet that ties these insights together? What's the thing that, if ${company} nails it in 12 months, changes their trajectory?

## WHAT TO DELIVER

**THE GTM THESIS** (2-3 sentences max)
Distill Wave 1 into a single, opinionated thesis.

Example: "Agent 1 showed 500 journalists available. Agent 4 showed we captured 9%. Agent 2 showed our moat is brand ('serious writers publish here'), not tech. Agent 3 showed CAC is $0 for established writers but broken for new writers. **Thesis:** Stop democratization narrative. Own the top 500 professional writers globally (journalists + corporate experts) via enterprise features + B2B pricing. Growth = recruit high-value creators, not enable 10K hobbyists."

**WHAT'S WORKING** (Keep Doing)
1-2 things creating defensible advantage TODAY. Be specific about WHY it's an advantage vs competitors.

Example: "Writer-first simplicity. NPS 70+ among top writers because it gets out of the way. Competitors (Ghost, WordPress) require managing servers. ${company}'s job is 'I never think about infrastructure.' As long as this holds, inertia wins."

**WHAT'S BROKEN** (Stop Doing)
1-2 things wasting resources that should be KILLED, not fixed.

Example: "Building consumer social features (Notes, Chat). <5% adoption after 18 months. This is trying to be Twitter, not infrastructure. Kill it. Redirect engineering to B2B features (team collaboration, analytics, white-label)."

**THE STRATEGIC BET** (Start Doing)
ONE net-new initiative that changes trajectory. Must:
- Build on the moat (don't fight your weakness)
- Exploit the market signal (timing)
- Solve the CAC problem (economics)
- Target the right segment (focus)

Include: What changes? Why now? 90-day milestone to validate bet is working?

Example: "Launch Substack Pro for corporate experts. B2B pricing: $50-200/mo for institutional subscriptions (company pays for exec's newsletter). Target: Ex-consultants, think tank researchers, operators-turned-advisors with LinkedIn audiences. Why now: Economic uncertainty = laid-off execs looking for differentiation. 90-day milestone: 50 signups = $3K MRR. If <30 active after 90 days, kill. If >50 + 8% conversion from free, allocate $2M for sales team."

**CAPITAL ALLOCATION SHIFT**
Specific reallocation. Cut X% from [where]. Reallocate to [where]. Expected outcome in 6 months.

Example: "Cut 30% from consumer features + paid acquisition. Reallocate: 40% to enterprise features (SSO, analytics, white-label), 30% to B2B sales team (hire 3 reps), 30% to cross-promotion algorithm. Expected: Writer LTV +50% from multi-sub adoption. New segment adds $5M ARR at higher margin."

**THE RISK IN THIS PLAN**
Biggest way this thesis could be WRONG. Name the assumption that, if false, breaks everything.

Example: "Assumption: Corporate experts will publish CONSISTENTLY (3x/mo for 3+ months). If they publish-then-abandon at 60% rate vs 30% for journalists, unit economics break. Risk mitigation: Ghost-writing service (hire editors to help executives produce content). But if this becomes a services business, margins compress."

**90-DAY ROADMAP**
- **Week 1-4:** [Specific action + success metric]
- **Week 5-8:** [Specific action + success metric]
- **Week 9-12:** [Specific action + success metric + decision gate]

Example:
- Week 1-4: Recruit 50 corporate experts (cold LinkedIn outreach + conference sponsorships). Success: 200 signups to waitlist.
- Week 5-8: Ship B2B features (team accounts, invoicing, LinkedIn embeds). Success: 15 convert to paid.
- Week 9-12: Measure publish rate + engagement. Decision: <30 active = kill. 30-50 = iterate. >50 + >8% conversion = $2M hiring budget for Q2.
${research}${antiHallucination}
${ctx}

**OUTPUT:** 700-900 words. Be OPINIONATED. Hedging is not a strategy. Pick one bet and defend it.`,

    kpis: `${base}

**AGENT 6 OF 7: OPERATING RHYTHM (SYNTHESIS)**

You've read Agents 1-5. Your job: Define the ONE metric that proves the GTM thesis is working or failing.

## CONTEXT FROM PRIOR AGENTS

${synthCtx || `
Agent 5 (GTM Blueprint) recommended: [strategic bet]
The thesis depends on: [key assumption]
`}

## YOUR MISSION

Pick the North Star metric that tells you if the bet is working. Not 10 KPIs — ONE metric that, if it moves up and to the right, everything else follows.

## WHAT TO DELIVER

**NORTH STAR METRIC**
Name: [Metric name]

**Why this metric?** (2-3 sentences)
Why does THIS metric prove the strategy is working? How does it tie directly to the GTM thesis from Agent 5?

Bad: "Monthly Active Users" (vanity — they could be tire-kickers)
Good: "Paid Subscriber 90-Day Retention" (proves value delivery, predicts LTV, measures moat strength)

**Current baseline:** [Number if known, "Unknown" if not]
**Target:** [Specific number + timeframe]
**Why this target matters:** [What it proves]

Example: "North Star = Paid Subscriber 90-Day Retention. Why: Revenue is lagging indicator. Retention proves we deliver value that's hard to replace. For ${company} specifically, Agent 2 showed moat is convenience, not lock-in. Only retention proves convenience > switching cost. Current: 60-70% for top-tier, 40-50% median (estimated). Target: 75% across top 200 writers by Q3 2025. This drives LTV from $120 to $180, making business venture-scale even if top-line growth slows."

**THE 3 SUPPORTING METRICS**
For each:
1. Metric name
2. Current baseline (or "Unknown")
3. Target (number + timeframe)
4. Why it matters (how it ladders to North Star)

Example:
1. **Cross-subscription rate:** % of readers subscribed to 2+ newsletters. Current <5%, Target 20% by Q4. Why: Readers with 2+ subs churn 60% less per cohort analysis. This is network effects materializing.

2. **Writer publish consistency:** % of writers publishing 3x/mo for 3 consecutive months. Current 40% (estimated), Target 60% for top 500. Why: Leading indicator of retention. Writers who publish consistently = engaged audience = renewal.

3. **B2B subscriber share:** % of GMV from $30+/mo subs (institutional/corporate). Current <10%, Target 25% by Q4. Why: B2B churn is 60% lower, LTV is 3x higher. Proves segment expansion thesis from Agent 5.

**WEEKLY OPERATING RHYTHM** (30 min)
- **Attendees:** [Who - specific roles]
- **Cadence:** [Day/time]
- **Agenda:**
  1. Review: [What metrics/dashboards]
  2. Discuss: [What topics/decisions]
  3. Decide: [What gets decided, who owns]

Example: "Attendees: CEO, Head of Product, Head of Writer Success. Every Monday 9am. Review: 90-day retention (top 50 writers), publish rate (last 7 days), cross-sub rate. Discuss: High-churn-risk writers (flagged by missed publishes), cross-promo test results. Decide: Which 3 writers to personally reach out to this week."

**MONTHLY OPERATING RHYTHM** (90 min)
Same format as weekly.

Example: "Full leadership team. First Tuesday of month, 2-3:30pm. Review: North Star trend, 3 supporting metrics, cohort retention curves. Discuss: Product roadmap alignment (are we building what moves the North Star?), writer pipeline health, competitive moves. Decide: Budget reallocation (shift $X from Y to Z), roadmap priorities for next 30 days, which bets to continue/kill."

**QUARTERLY OPERATING RHYTHM** (Half day)
Same format. Include board if relevant.

Example: "Leadership + Board. Week 1 of quarter, 4 hours. Review: Full GTM scorecard (are we winning top 500 writers? is the segment bet working?), financial health (burn, runway, unit economics), competitive landscape (funding, product launches, writer migrations). Discuss: Strategic bets (is B2B working? is cross-promo getting traction? what's not working?), capital allocation (hiring plan, budget shifts), 12-month product vision. Decide: Continue/pivot/kill major initiatives, next quarter's OKRs, any fundraising triggers."

**THE VANITY METRIC TRAP**
What metric LOOKS impressive but is actually misleading? Why?

Example: "Total newsletter signups. Sounds great: '500K newsletters on platform!' Reality: 80% have <100 subscribers, never monetize, high support cost. Median revenue <$500/yr. This metric makes team feel good but doesn't predict business outcomes. **Track instead:** 'Active, monetizing newsletters' (3+ publishes per 30 days + 100+ paid subs). That's ~5K newsletters = actual business."
${research}${antiHallucination}
${ctx}

**OUTPUT:** 500-700 words. Metrics should be FALSIFIABLE (you can measure them) and ACTIONABLE (moving them changes outcomes).`,

    narrative: `${base}

**AGENT 7 OF 7: INVESTMENT MEMO (FINAL SYNTHESIS)**

You've read all 6 prior agents. Your job: Write the memo Erik Torenberg forwards to his partners.

## CONTEXT FROM ALL PRIOR AGENTS

${synthCtx || `
Agent 1: [Market signal]
Agent 2: [Moat + Kill shot]
Agent 3: [Channel insight]
Agent 4: [Segment focus]
Agent 5: [Strategic bet]
Agent 6: [North Star metric]
`}

## YOUR MISSION

Write an investment-grade narrative memo using Situation-Complication-Conviction structure. This is what gets forwarded with "thoughts?" to the partners channel.

## WHAT TO DELIVER

**SITUATION** (2-3 paragraphs)
Set the stage. What's the market context that makes ${company} interesting RIGHT NOW?

Pull from Agent 1's market signal. Include:
- Category definition (what is this?)
- Market size (TAM, but be real about TAM vs SAM vs SOM)
- Why NOW (specific timing trigger from last 90 days)
- Unit economics snapshot (prove this can be venture scale)

Example: "Creator monetization infrastructure. ${company} in $15B+ creator economy, specifically paid newsletter segment. Media unbundling accelerated: BuzzFeed shut down, Vice bankrupt, SI laid off staff — all since May 2023. Pew shows -26% newsroom jobs 2008-2023. Every laid-off journalist with Twitter following = potential ${company} migration.

Casey Newton: $800K/yr in 12 months. Ben Thompson: $3M+/yr. Lenny: $4M ARR by Year 2. Unit economics ($10-25 CAC, $120-180 LTV, 85% margin) beat Patreon, Medium, YouTube, Spotify. This is real.

Competitive landscape fragmented: Beehiiv (growth tools), Ghost (open-source), Medium (algorithm), Patreon (tiers). No one owns 'serious professional writer.' ${company} recruited ~200 of the top 500 journalists/experts globally. Market share <50%."

**COMPLICATION** (1-2 paragraphs)
What's the strategic challenge or inflection point? Why does status quo break? What creates urgency?

Pull from Agents 2-4. This is where you introduce tension.

Example: "Growth engine broken. 80% traffic direct/email per SimilarWeb. No feed, no algorithm, no discovery. Can't grow without existing audience. <1% of newsletters have 5K+ paid subs. 99% make below minimum wage.

Pareto getting worse: Top 10% drive 70% of GMV (vs Spotify 60%, YouTube 50%). Product roadmap served the 99% (Notes, Chat, Discover) but they don't generate revenue. Top 1% — actual GMV drivers — underserved. Need analytics, team collab, CRM, white-label.

Capital allocation risk: $82M at $650M val (~13x GMV) assumed network effects would materialize. Two years later, cross-subscription still <5%. Moat thesis hasn't happened. Only moat is brand: 'serious writers publish on ${company}.' Brand erodes if product doesn't evolve."

**CONVICTION** (The meat — 3-4 paragraphs)

This is the investment thesis. Pull from Agent 5's strategic bet. Structure:

**The Insight:** What does ${company} see that others miss?

**The Wedge:** How do they enter and win? (Go-to-market)

**The Moat:** What makes it defensible? (from Agent 2)

**The Metrics:** What proves it's working? (from Agent 6)

Example: "**The Insight:** Don't democratize writing. Own top 500 professional writers globally (journalists, corporate experts, specialists) + build enterprise infrastructure that locks them in. 99% hobbyists = support burden + brand dilution. Real business = high-LTV B2B subs ($50-200/mo institutions) + recurring consumer ($10-20/mo superfans).

**The Wedge:** Enter via exiled journalists (NYT/Vice layoffs), expand to corporate experts (ex-consultants, think tanks, academics) monetizing analysis. These have: existing audiences (10K-100K LinkedIn/Twitter), credibility (years of bylines/domain expertise), motivation (layoffs = need income, YouTube ad decline = diversification).

${company} = only platform positioned as 'serious professional publishing' vs 'creator side hustle' (Patreon) or 'hobbyist blog' (Medium).

**The Moat:** Network effects via cross-subscriptions. If 20% subscribe to 2+ newsletters (vs <5% today), LTV jumps 50%, churn drops 60%. Requires algorithmic recommendation ('Discover Weekly for ${company}') surfacing newsletters in-email. Once reader has 3+ active subs, switching costs massive.

Secondary moat: Enterprise features make migration painful. Team collab, advanced analytics, white-label. Table stakes for media companies/think tanks migrating entire teams. Ghost has some, Medium killed it. ${company} can own B2B publishing infrastructure.

**The Metrics:**
- 90-day retention: 60-70% top writers, 40-50% median. Target: 75% top 200 by Q3 2025. Proves PMF for high-value segment.
- Cross-sub rate: <5% today. Target: 20% Q4 2025. Proves network effects working.
- B2B share: <10% GMV. Target: 25% Q4 2025. Proves segment expansion working.

If metrics hit: GMV grows 3x in 18 months without proportional CAC increase. Venture-scale economics."

**THE BEAR CASE** (1 paragraph)
Steel-man the strongest counter-argument. Don't be defensive — make the bear case BETTER than the bears would.

Then counter it honestly.

Example: "**'Top writers can leave anytime.'** True. Email lists portable. No technical lock-in. Ben Thompson could migrate to WordPress tomorrow, keep 95% of subs.

Counter: Switching costs operational, not technical. ${company} handles payments, deliverability, spam, subscriber management. Moving = becoming SysAdmin. Top writers value time at $500-1000/hr. Won't spend 40hrs/year managing servers to save $10K in fees. Moat = 'I don't want to think about infrastructure.' As long as ${company} stays simple + reliable, inertia wins.

**'AI kills newsletters.'** ChatGPT summarizes 10 newsletters into one briefing. Why pay $10/mo for individuals?

Counter: People subscribe for PERSPECTIVE, not information. Matt Levine isn't 'here's what happened in finance' (ChatGPT does that). It's 'what Matt thinks, with humor + nuance only he has.' Value = curation + voice + trust. AI can't replicate (yet). If AI kills this, it kills all media, not just ${company}."

**INVESTMENT THESIS SUMMARY** (2-3 sentences)
The elevator pitch. Make it memorable.

Example: "${company} = infrastructure for media unbundling. TAM not 'everyone who wants to write' (too broad, low monetization). TAM = 10K professional writers globally with audiences + credibility. ${company} captured ~2%. Next 18 months: (1) recruit next 300 high-value writers, (2) ship enterprise features locking them in, (3) build cross-sub network effects increasing LTV 50%. If executed: becomes Bloomberg Terminal of professional writing — default infrastructure pros can't operate without."

**THE ASK** (if fundraising - optional)
- Round size
- Use of funds (be specific)
- Milestones this capital unlocks
- Valuation expectation (if comfortable sharing)

If not fundraising, end with the thesis summary.
${research}${antiHallucination}
${ctx}

**OUTPUT:** 900-1200 words. Write like you're texting Erik. Casual but precise. This is the memo that gets you the partner meeting.`,
  };
  
  return prompts[id] || "";
};

const MOCK = {
  signals: `## CATEGORY SNAPSHOT\nCreator monetization. Substack = media unbundling + direct economics.\n\n## WEDGE\nMedia collapse. BuzzFeed/Vice shut down. Pew: -26% newsroom jobs.\n\n## UNIT ECONOMICS\nStratechery: $3M/yr, $0 CAC. Top 10 = 15% GMV.\n\n## RISK\n80% traffic direct. No discovery.\n\n## CAPITAL\na16z $65M at $650M.\n\n## CONTRARIAN\nBulls miss: 40% churn. Bears miss: Top 5% <5% churn.`,
  competitive: `## COMPETITIVE SET
| Competitor | Positioning | Funding |
|---|---|---|
| Beehiiv | Growth tools + ad network | $12.5M Series A |
| Ghost | Open-source platform | Bootstrapped |
| Medium | Algorithm-driven feed | $132M (2015) |
| Patreon | Creator membership | $415M Series F |

## POSITIONING MAP

**Axes: Audience Ownership (Owned vs Platform) × Product Complexity (Simple vs Feature-Rich)**

**TOP-LEFT (Owned Audience, Simple):**
• Substack: Email-first, direct subscriber relationships, minimal features. Writers own their lists. Clean paywall model.

**TOP-RIGHT (Owned Audience, Feature-Rich):**
• Ghost: Self-hosted option, membership tiers, native analytics, Zapier integrations. Full control + complexity.

**BOTTOM-LEFT (Platform Audience, Simple):**
• Beehiiv: Email + growth tools (referral program), but ad network trains readers to expect free content.

**BOTTOM-RIGHT (Platform Audience, Feature-Rich):**
• Patreon: Multi-tier memberships, Discord integration, feed discovery. Platform owns relationship.

## WHERE SUBSTACK WINS
Simplicity as moat. NPS 70+ among top writers. Flat 10% take rate = predictable pricing.

## WHERE SUBSTACK LOSES
No growth engine. Beehiiv's referral + ads solve cold start. <1% have 5K+ paid subs.

## SUBSTITUTION RISK
Twitter/X. If Elon's creator monetization works, writers publish natively and keep 90%+.

## FUNDING GAP
Substack $82M vs Patreon $415M. Capital isn't constraint — execution is.

## BLIND SPOT
AI-native writing tools. Next winner might auto-generate drafts, manage subs, A/B test.`,
  channels: `## MIX\nDirect 80%, SEO 10%, Twitter 8%.\n\n## EFFICIENCY\nDirect: $0 CAC.\n\n## REALLOCATION\nCut paid. Double cross-promo.`,
  segments: `## CORE\nExiled journalists.\n\n## ADJACENT\nCorporate experts.\n\n## WHITESPACE\nCreators diversifying.`,
  pivot: `## THESIS\nOwn top 500 writers.\n\n## WORKING\nSimplicity.\n\n## BROKEN\nMass market.\n\n## BET\nB2B $50-200/mo.`,
  kpis: `## NORTH STAR\n90-day retention. Target: 75%.\n\n## SUPPORTING\nCross-sub 20%, Publish 60%, B2B 25%.`,
  narrative: `## SITUATION\nCreator economy $15B.\n\n## COMPLICATION\nGrowth broken.\n\n## CONVICTION\nOwn 500 writers, enterprise features, network effects.`,
};

async function callClaude(prompt, pdfs, signal, agentId = "signals") {
  if (MOCK_MODE) {
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
    return MOCK[agentId] || MOCK.signals;
  }
  const res = await fetch("https://advisorsprint-api.vercel.app/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal,
    body: JSON.stringify({ prompt, pdfs: pdfs.map(p => ({ name: p.name, b64: p.b64 })), agentId }),
  });
  if (res.status === 429) throw new Error((await res.json()).message || 'Rate limit');
  if (!res.ok) throw new Error((await res.json().catch(() => ({ message: 'API failed' }))).message);
  const data = await res.json();
  if (data.usage) console.log(`[Usage] ${data.usage.global}/${data.usage.limit}`);
  return data.text;
}

function parseTable(block) {
  const rows = block.trim().split("\n").filter(r => r.includes("|"));
  if (rows.length < 2) return null;
  const cells = r => r.split("|").map(c => c.trim()).filter((c, i, a) => i > 0 && i < a.length - 1);
  const header = cells(rows[0]);
  const body = rows.slice(2);
  if (!header.length) return null;
  const thStyle = `padding:7px 10px;text-align:left;font-size:10px;font-weight:700;color:${P.inkSoft};background:${P.parchment};border-bottom:2px solid ${P.sand};`;
  const tdStyle = `padding:7px 10px;font-size:11px;color:${P.inkMid};border-bottom:1px solid ${P.sand};`;
  const ths = header.map(h => `<th style="${thStyle}">${h}</th>`).join("");
  const trs = body.map((r, i) => `<tr style="background:${i % 2 === 0 ? P.white : P.cream}">${cells(r).map(c => `<td style="${tdStyle}">${c}</td>`).join("")}</tr>`).join("");
  return `<div style="overflow-x:auto;margin:10px 0;border:1px solid ${P.sand};border-radius:3px;"><table style="width:100%;border-collapse:collapse;">${ths ? `<thead><tr>${ths}</tr></thead>` : ""}<tbody>${trs}</tbody></table></div>`;
}

function parseAxesMap(text) {
  if (!text.includes("←") && !text.includes("OWNED") && !text.includes("PLATFORM")) return null;
  const lines = text.split("\n");
  const mapLines = [];
  let capturing = false;
  for (const line of lines) {
    if (line.trim() === "```") continue;
    if (line.includes("OWNED") || line.includes("PLATFORM") || line.includes("←") || (capturing && line.includes("|"))) {
      capturing = true;
      mapLines.push(line);
      if (mapLines.length > 15) break;
    }
    if (capturing && !line.trim() && mapLines.length > 3) break;
  }
  while (mapLines.length && !mapLines[0].trim()) mapLines.shift();
  while (mapLines.length && !mapLines[mapLines.length - 1].trim()) mapLines.pop();
  if (!mapLines.length) return null;
  return `<div style="background:${P.parchment};border:1px solid ${P.sand};border-radius:3px;padding:14px;margin:12px 0;"><pre style="font-family:'JetBrains Mono',monospace;font-size:11px;color:${P.inkMid};line-height:1.8;margin:0;white-space:pre;">${mapLines.join("\n")}</pre></div>`;
}

function md(text) {
  if (!text) return "";
  let processed = text.replace(/^(\|.+\|\n)(\|[-| :]+\|\n)((?:\|.+\|\n?)+)/gm, m => {
    const t = parseTable(m);
    return t ? `%%T%%${btoa(unescape(encodeURIComponent(t)))}%%T%%` : m;
  });
  const axesMap = parseAxesMap(text);
  if (axesMap) {
    processed = processed.replace(/```[^\n]*\n([\s\S]*?)```/g, (m, c) => {
      if (c.includes("OWNED") || c.includes("PLATFORM") || c.includes("←")) {
        return `%%A%%${btoa(unescape(encodeURIComponent(axesMap)))}%%A%%`;
      }
      return m;
    });
  }
  processed = processed
    .replace(/^## (.+)$/gm, `<h3 style="font-family:'Libre Baskerville',serif;font-size:14px;color:${P.forest};margin:16px 0 6px;border-bottom:1px solid ${P.sand};padding-bottom:4px;">$1</h3>`)
    .replace(/\*\*(.+?)\*\*/g, `<strong style="color:${P.ink};">$1</strong>`)
    .replace(/^- (.+)$/gm, `<div style="display:flex;gap:7px;margin:3px 0;"><span style="color:${P.terra};">▸</span><span>$1</span></div>`)
    .replace(/\n\n/g, `</p><p style="margin:6px 0;">`)
    .replace(/\n/g, "<br/>");
  return processed
    .replace(/%%T%%([^%]+)%%T%%/g, (_, b) => decodeURIComponent(escape(atob(b))))
    .replace(/%%A%%([^%]+)%%A%%/g, (_, b) => decodeURIComponent(escape(atob(b))));
}

function AgentCard({ agent, status, result }) {
  const colors = {
    idle: { border: P.sand, bg: P.parchment, dot: P.sand },
    queued: { border: P.sand, bg: P.parchment, dot: P.inkFaint },
    running: { border: P.gold, bg: "#fffdf8", dot: P.gold },
    done: { border: P.sand, bg: P.white, dot: P.forestSoft },
    error: { border: P.terra, bg: "#fff5f0", dot: P.terra },
  };
  const c = colors[status] || colors.idle;
  const waveColor = agent.wave === 1 ? P.forestSoft : P.terra;

  return (
    <div data-agent={agent.id} style={{
      border: `1.5px solid ${c.border}`, borderRadius: 3, background: c.bg, overflow: "hidden",
      boxShadow: status === "running" ? `0 3px 20px rgba(200,146,42,0.13)` : "none",
    }}>
      <div style={{ background: c.bg, padding: "12px 16px", borderBottom: `1px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: c.dot }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: P.ink }}>{agent.icon} {agent.label}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: waveColor, background: `${waveColor}15`, padding: "3px 7px", borderRadius: 10 }}>
            WAVE {agent.wave}
          </span>
          {status === "running" && "— RUNNING"}
          {status === "done" && <span style={{ fontSize: 11, color: P.forestSoft }}>✓</span>}
        </div>
      </div>
      {!result && status === "idle" && <div style={{ padding: "10px 16px", fontSize: 11, color: P.inkFaint }}>{agent.sub}</div>}
      {status === "running" && (
        <div style={{ padding: "0 16px" }}>
          <div style={{ height: 2, background: P.sand, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: "100%", background: `linear-gradient(90deg, ${P.gold} 0%, ${P.gold} 50%, transparent 50%)`, backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
          </div>
        </div>
      )}
      {result && (
        <div className="agent-content" style={{ padding: "16px 20px", fontSize: 13, color: P.inkMid, lineHeight: 1.8, maxHeight: 440, overflowY: "auto" }}
          dangerouslySetInnerHTML={{ __html: `<p style="margin:0">${md(result)}</p>` }}
        />
      )}
      {status === "queued" && !result && (
        <div style={{ padding: "12px 18px", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: P.sand, animation: "pulse 1.5s infinite" }} />
          <span style={{ fontSize: 12, color: P.inkFaint, fontStyle: "italic" }}>Ready</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [company, setCompany] = useState("");
  const [context, setContext] = useState("");
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

  useEffect(() => { initGA(); gaEvent("page_view"); }, []);

  const downloadPDF = () => {
    gaEvent("pdf_download", { company });
    window.print();
  };

  const handlePDF = async (e) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== "application/pdf") return alert("PDF only");
    if (file.size > 20 * 1024 * 1024) return alert("Max 20MB");
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
    setHasStarted(true);
    setAppState("running");
    setResults({});
    setElapsed(0);
    const initStatus = {};
    AGENTS.forEach(a => initStatus[a.id] = "queued");
    setStatuses(initStatus);
    const ctx = pdfs.length ? `Document: "${pdfs[0].name}". Context: ${context || "None"}.` : `Context: ${context || "None"}.`;
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    
    for (const id of W1) {
      if (ctrl.signal.aborted) return;
      setStatuses(s => ({ ...s, [id]: "running" }));
      await runAgent(id, makePrompt(id, company, ctx, null), ctrl.signal, pdfs);
      await new Promise(r => setTimeout(r, 1500));
    }
    
    const synthCtx = W1.map(id => `[${AGENTS.find(a => a.id === id).label}]: ${(results[id] || "").slice(0, 400)}`).join("\n");
    
    for (const id of W2) {
      if (ctrl.signal.aborted) return;
      setStatuses(s => ({ ...s, [id]: "running" }));
      await runAgent(id, makePrompt(id, company, ctx, synthCtx), ctrl.signal, pdfs);
      await new Promise(r => setTimeout(r, 1500));
    }
    
    if (!ctrl.signal.aborted) {
      clearInterval(timerRef.current);
      setAppState("done");
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
    setContext("");
    setUserName("");
  };

  const isDone = appState === "done";
  const isActive = appState === "running";
  const sprintCount = Object.keys(results).length;

  return (
    <div style={{ minHeight: "100vh", background: P.beige, fontFamily: "'Work Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Work+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
        @keyframes shimmer { 0%{background-position:200% 0}100%{background-position:-200% 0} }
        @keyframes pulse { 0%,100%{opacity:.4}50%{opacity:1} }
        body { margin: 0; }
        
        @media print {
          body { background: #fff !important; }
          .no-print { display: none !important; }
          .print-topbar { display: block !important; }
          
          @page { size: landscape; margin: 0.5in; }
          
          [data-agent] {
            page-break-before: always !important;
            page-break-inside: avoid !important;
            border: 1.5px solid ${P.sand} !important;
            border-radius: 4px;
            margin-bottom: 20px !important;
            background: white !important;
          }
          
          [data-agent="signals"] { page-break-before: avoid !important; }
          
          [data-agent] > div:first-child {
            background: linear-gradient(135deg, ${P.forestSoft} 0%, ${P.forest} 100%) !important;
            color: white !important;
            padding: 12px 16px !important;
          }
          
          [data-agent] > div:first-child * {
            color: white !important;
          }
          
          .agent-content {
            max-height: none !important;
            overflow: visible !important;
            padding: 16px 20px !important;
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

      {/* Top Bar */}
      <div className="print-topbar" style={{ background: P.forest, padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ fontFamily: "'Libre Baskerville',serif", fontSize: 22, color: P.white }}>
            <span style={{ fontStyle: "italic", color: P.terraSoft }}>Strategic</span>Sprint
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: P.sand }}>
            PARALLEL AGENT INTELLIGENCE
          </div>
        </div>
        <div style={{ background: P.terra, color: P.white, padding: "8px 16px", borderRadius: 3, fontSize: 11, fontWeight: 700, letterSpacing: ".08em" }}>
          HARSHA BELAVADY
        </div>
      </div>



      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 32px 80px" }}>
        {/* Title Section */}
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: P.terra, marginBottom: 12 }}>
                RAPID INTELLIGENCE SPRINT. HUMAN & AI POWERED
              </div>
              <h1 style={{ fontFamily: "'Libre Baskerville',serif", fontSize: 42, fontWeight: 700, color: P.ink, margin: "0 0 14px" }}>
                Strategy Analysis
              </h1>
              <div style={{ fontFamily: "'Libre Baskerville',serif", fontSize: 18, fontStyle: "italic", color: P.terra, marginBottom: 24 }}>
                Analysed By 7 Parallel Agents
              </div>
              <div style={{ fontSize: 13, color: P.inkMid, maxWidth: 720, margin: "0 auto" }}>
                In Wave 1, 4 Analysis Agents Fire Simultaneously Then 3 Synthesis Agents in Wave 2
              </div>
            </div>

            {/* Agent Preview Boxes */}
            {!hasStarted && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 48, maxWidth: 900, margin: "0 auto 48px" }}>
                <div style={{ background: P.white, border: `1.5px solid ${P.sand}`, borderRadius: 4, padding: "24px 28px" }}>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: P.inkSoft, marginBottom: 16 }}>
                    WAVE 1 · 4 ANALYSIS AGENTS
                  </div>
                  {AGENTS.filter(a => a.wave === 1).map(a => (
                    <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ color: P.forestSoft, fontSize: 16 }}>{a.icon}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: P.ink }}>{a.label}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background: P.white, border: `1.5px solid ${P.sand}`, borderRadius: 4, padding: "24px 28px" }}>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: P.inkSoft, marginBottom: 16 }}>
                    WAVE 2 · 3 SYNTHESIS AGENTS
                  </div>
                  {AGENTS.filter(a => a.wave === 2).map(a => (
                    <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ color: P.terra, fontSize: 16 }}>{a.icon}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: P.ink }}>{a.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sprint Setup Form */}
            {!hasStarted && (
              <div style={{ background: P.white, border: `1.5px solid ${P.sand}`, borderRadius: 4, padding: "32px 36px", marginBottom: 32 }}>
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: P.inkSoft, marginBottom: 24 }}>
                  SPRINT SETUP
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18, marginBottom: 24 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: P.inkSoft, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 6 }}>
                      Company *
                    </label>
                    <input
                      type="text"
                      value={company}
                      onChange={e => setCompany(e.target.value)}
                      placeholder="e.g. Bingo, Oatly, Burt's Bees..."
                      style={{ width: "100%", padding: "10px 14px", fontSize: 13, border: `1px solid ${P.sand}`, borderRadius: 3, background: P.cream }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: P.inkSoft, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 6 }}>
                      Context (Optional)
                    </label>
                    <input
                      type="text"
                      value={context}
                      onChange={e => setContext(e.target.value)}
                      placeholder="e.g. D2C brand Q-com Strategy"
                      style={{ width: "100%", padding: "10px 14px", fontSize: 13, border: `1px solid ${P.sand}`, borderRadius: 3, background: P.cream }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: P.inkSoft, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 6 }}>
                      Your Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={userName}
                      onChange={e => setUserName(e.target.value)}
                      placeholder="e.g. Tony Stark, MBB Partners"
                      style={{ width: "100%", padding: "10px 14px", fontSize: 13, border: `1px solid ${P.sand}`, borderRadius: 3, background: P.cream }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: P.inkSoft, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 6 }}>
                    Reference Document (Optional · 1 PDF · Max 500KB · ~25 Pages)
                  </label>
                  <div style={{ fontSize: 11, color: P.inkMid, fontStyle: "italic", marginBottom: 8 }}>
                    If you want the Agents to access latest reports. To reduce size: open the PDF, select the key pages (executive summary + data tables), File → Print → Save as PDF.
                  </div>
                  <input ref={fileRef} type="file" accept=".pdf" onChange={handlePDF} style={{ display: "none" }} />
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <button onClick={() => fileRef.current?.click()} style={{ background: P.cream, border: `1px solid ${P.sand}`, padding: "10px 18px", borderRadius: 3, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                      {pdfs.length ? "✓ PDF Uploaded" : "⊕ Upload PDF"}
                    </button>
                    {pdfs.length > 0 && (
                      <div style={{ fontSize: 11, color: P.inkMid }}>
                        {pdfs[0].name}
                        <button onClick={() => setPdfs([])} style={{ marginLeft: 8, background: "none", border: "none", color: P.terra, cursor: "pointer" }}>✕</button>
                      </div>
                    )}
                    {!pdfs.length && (
                      <div style={{ fontSize: 11, color: P.inkFaint, fontStyle: "italic" }}>
                        Without a document: ~4 min · Agents use Claude training data (cutoff mid-2025)
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={runSprint}
                  disabled={!company.trim()}
                  style={{
                    background: company.trim() ? P.forest : P.sand,
                    color: P.white,
                    border: "none",
                    padding: "14px 32px",
                    borderRadius: 3,
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: ".08em",
                    textTransform: "uppercase",
                    cursor: company.trim() ? "pointer" : "not-allowed",
                    width: "100%",
                  }}
                >
                  {isActive ? "● RUNNING SPRINT..." : "→ LAUNCH SPRINT"}
                </button>
              </div>
            )}

            {/* Progress */}
            {isActive && (
              <div className="no-print" style={{ background: P.forest, borderRadius: 4, padding: "16px 24px", marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: P.sand, fontWeight: 700 }}>
                    WAVE {Object.keys(results).length < 4 ? 1 : 2} · {Object.keys(results).length}/7 COMPLETE
                  </span>
                  <span style={{ fontSize: 11, color: P.sand }}>
                    {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}
                  </span>
                </div>
                <div style={{ height: 6, background: P.forestMid, borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.round((Object.keys(results).length / 7) * 100)}%`, background: `linear-gradient(90deg, ${P.gold} 0%, ${P.terra} 100%)`, transition: "width 0.4s" }} />
                </div>
              </div>
            )}

            {/* Completion */}
            {isDone && (
              <div className="no-print" style={{ background: P.forestMid, borderRadius: 4, padding: "20px 28px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 15, color: P.white, fontWeight: 600 }}>✓ Sprint complete · {company}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,.7)", marginTop: 4 }}>All 7 agents complete · Ready to present</div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={downloadPDF} style={{ background: "transparent", border: "1px solid rgba(255,255,255,.4)", color: P.white, padding: "10px 20px", borderRadius: 3, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    ⬇ Download PDF
                  </button>
                  <button onClick={reset} style={{ background: P.terra, color: P.white, border: "none", padding: "10px 20px", borderRadius: 3, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    → New Sprint
                  </button>
                </div>
              </div>
            )}

            {/* Agent Grid */}
            {hasStarted && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {AGENTS.filter(a => a.wave === 1).map(a => (
                  <AgentCard key={a.id} agent={a} status={statuses[a.id] || "idle"} result={results[a.id]} />
                ))}
                {AGENTS.filter(a => a.wave === 2).map(a => (
                  <div key={a.id} style={{ gridColumn: "1 / -1" }}>
                    <AgentCard agent={a} status={statuses[a.id] || "idle"} result={results[a.id]} />
                  </div>
                ))}
              </div>
            )}
      </div>
    </div>
  );
}
