import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════
// STRATEGIC SPRINT — Tech/Consumer Intelligence
// NO TABS - Single page with sprint functionality  
// ═══════════════════════════════════════════════════════

const MOCK_MODE = false; // Set to true for testing, false for production
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
  s2.text = `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} window.gtag = gtag; gtag('js', new Date()); gtag('config', '${GA4_ID}');`;
  document.head.appendChild(s2);
};

const P = {
  forest: "#1a3325", forestMid: "#2d5142", forestSoft: "#3d6b54",
  parchment: "#faf8f4", cream: "#f5f2ed", beige: "#e8e4db", white: "#ffffff",
  sand: "#9b8c78", gold: "#c8922a", terra: "#d4724a", terraSoft: "#e8956f",
  ink: "#2b2b2b", inkMid: "#4a4a4a", inkSoft: "#6b6b6b", inkFaint: "#9a9a9a",
};

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
  const base = `CRITICAL FIRST INSTRUCTION - READ THIS BEFORE ANYTHING ELSE:
DO NOT write "I need to search", "I'm unable to find", "Let me search", or ANY explanatory text.
DO NOT explain your process or limitations.
START IMMEDIATELY with ## SECTION HEADER and your analysis.
You HAVE web_search tool - use it silently and write analysis directly.

You are a strategic analyst with web_search access. Find current 2025-2026 data and write tight narrative analysis. Setup → Evidence → Implication. Every sentence adds value. No memo format.`;
  const research = `CRITICAL: Use web_search tool extensively for current data. Search for: "${company} funding 2025", "${company} metrics 2025", "${company} competitors", "${company} news 2025". Cite sources inline: "According to Sacra March 2025" or "per TechCrunch July 2025". 

At the very end, include sources in this EXACT format - COPY THIS EXAMPLE:

**Sources:** TechCrunch July 2025, The Information March 2025, Sacra Research, Bloomberg, Forbes, company blog

RULES FOR SOURCES LINE:
- Must be ONE continuous line of text
- Separate each source with a comma and space
- NO line breaks between sources
- NO bullet points
- NO numbered lists
- Just: **Sources:** source1, source2, source3, source4`;
  const rules = `CRITICAL STYLE: Connect thoughts just enough to lead reader to conclusion, but let THEM complete the thought. Remove "because", "which means", "this is important because" - keep transitions BETWEEN paragraphs, cut over-explanation WITHIN paragraphs. Pack concrete examples (3-5 per claim). Named companies with specific metrics. Match Erik Torenberg's analytical voice: sharp, substantive, connects dots without hand-holding.`;

  const prompts = {
    signals: `${base}\n\nAnalyze market signals for ${company}.\n\nSTART YOUR RESPONSE WITH: ## CATEGORY SNAPSHOT\nDo NOT write any introduction, explanation, or "I need to search" text.\n\n${research}\n\nSearch for "${company}" exactly - use the company name provided, not similar categories.\n\n${rules}\n\n${ctx}\n\nRequired sections:\n## CATEGORY SNAPSHOT (business model, margins, positioning)\n## THE WEDGE EXPANDING (market opportunity, catalyst)\n## UNIT ECONOMICS (top/mid/median tiers with specifics)\n## HIDDEN RISK (competitive pressure, structural issues)\n## CAPITAL ENVIRONMENT (funding, valuation, M&A context)\n## CONTRARIAN INSIGHT (what bulls miss, what bears miss)\n\nWrite 500-600 words. Narrative flow with connected insights. Single page target.\n\nEnd with: **Sources:** [comma-separated list on single line]`,
    
    competitive: `${base}\n\nAnalyze competitive landscape for ${company}.\n\n${research}\n\nYou HAVE web_search tool. Search for:\n- EXACTLY: "${company}" competitors 2025\n- "${company} vs [competitors]" comparisons\n- Market positioning for ${company}\n\nIMPORTANT: Search for the EXACT company "${company}", not similar-sounding companies.\n\n${rules}\n\n${ctx}\n\nRequired sections:\n## COMPETITIVE SET (players, positioning, multiples)\n## WHERE WINS (moat, defensibility with evidence)\n## WHERE LOSES (structural weaknesses, competitive threats)\n## SUBSTITUTION RISK (technology/behavior shifts)\n\nWrite 500-600 words. Connect competitive dynamics - show causality without stating "because." Dense narrative. Single page target.\n\nEnd with: **Sources:** [comma-separated list on single line]`,
    
    channels: `${base}\n\nAnalyze channel strategy for ${company}.\n\n${research}\n\nUse web_search for:\n- "${company}" customer acquisition 2025\n- "${company}" marketing channels\n- Traffic sources for ${company}\n\n${rules}\n\n${ctx}\n\nRequired sections:\n## CURRENT MIX (channel breakdown, concentration)\n## EFFICIENCY (what works, what's broken, CAC by channel)\n## REALLOCATION THESIS (strategic shifts, expected ROI)\n## CHANNEL RISK (dependency, failure modes)\n\nWrite 500-600 words. Flow from current state → problems → solutions. Let reader connect dots. Single page target.\n\nEnd with: **Sources:** [comma-separated list on single line]`,
    
    segments: `${base}\n\nAnalyze customer segments for ${company}.\n\n${research}\n\nUse web_search for:\n- "${company}" customers 2025\n- "${company}" target market\n- User demographics for ${company}\n\n${rules}\n\n${ctx}\n\nRequired sections:\n## CORE SEGMENT (who, TAM, unit economics, proof points)\n## UNDERSERVED ADJACENT (whitespace, why currently underserved)\n## WHITESPACE (entirely new segments, unlock requirements)\n## SEQUENCING (which next, why, timing)\n\nWrite 500-600 words. Narrative builds segment strategy - transitions between segments show logic. Single page target.\n\nEnd with: **Sources:** [comma-separated list on single line]`,
    
    pivot: `${base}\n\nSynthesize GTM strategy for ${company} using prior analysis.\n\nPrior findings:\n${synthCtx || "[Wave 1 analysis]"}\n\n${research}\n\n${rules}\n\n${ctx}\n\nRequired sections:\n## SYNTHESIS (what Agents 1-4 reveal, strategic thesis)\n## WORKING: KEEP (what's validated, why it works)\n## BROKEN: KILL (what's not working, kill criteria)\n## STRATEGIC BET (specific initiative, investment, gates)\n## RISK (primary risk, mitigation)\n\nWrite 600-700 words. Synthesize findings into coherent strategy. Connect previous insights → strategic moves. Tight but flowing narrative. Single page target.\n\nEnd with: **Sources:** [comma-separated list on single line]`,
    
    kpis: `${base}\n\nDefine operating metrics and rhythm for ${company}.\n\nComplete context:\n${synthCtx || "[All prior analysis]"}\n\n${research}\n\n${rules}\n\n${ctx}\n\nRequired sections:\n## NORTH STAR METRIC (precise definition, current/target, why this predicts success)\n## SUPPORTING METRICS (2-3 metrics: definition, current, target, why each matters)\n## OPERATING CADENCE (weekly/monthly/quarterly combined - decisions made at each)\n## VANITY TRAP (misleading metric, why it deceives, what to track instead)\n\nWrite 500-600 words. Framework narrative - show how metrics connect to strategy. Compressed but logical flow. Single page target.\n\nEnd with: **Sources:** [comma-separated list on single line]`,
    
    narrative: `${base}\n\nWrite investment thesis for ${company}.\n\nSTART YOUR RESPONSE WITH: ## SITUATION\n\nComplete analysis:\n${synthCtx || "[All 6 prior agents]"}\n\n${research}\n\nYou HAVE web_search. Search for valuation comps, exit multiples, market size projections.\n\n${rules}\n\n${ctx}\n\nRequired sections:\n## SITUATION (market, unit economics, current state with data)\n## COMPLICATION (structural problems, competitive threats, growth broken)\n## CONVICTION (The Insight, The Wedge, The Moat, The Metrics, The Outcome)\n## BEAR CASE (top 2 risks + counters)\n## THESIS SUMMARY (addressable market, next 18-24mo, outcome, risks)\n\nWrite 1100-1300 words. This is your ONLY 2-page agent. Build investment case with narrative arc. Setup → Problems → Solution → Risks → Thesis. Connected storytelling. Two pages acceptable.\n\nIMPORTANT: Complete ALL sections fully. Do NOT truncate THESIS SUMMARY mid-sentence. Finish the complete analysis.\n\nEnd with: **Sources:** [comma-separated list on single line]`,
  };

  return prompts[id] || "";
};

// MOCK DATA with proper source citations
const MOCK = {
  signals: `## CATEGORY SNAPSHOT

Substack operates in creator monetization infrastructure, specifically the paid email newsletter niche within the broader $15B creator economy (SignalFire, 2024). The business model: writers charge subscribers directly (typically $10/month consumer, $50-200/month institutional), Substack takes 10% and handles payments plus email delivery. This creates software-level margins exceeding 90% - no content production cost, no inventory, minimal support at scale.

## THE WEDGE EXPANDING

The systematic acceleration of media institutional collapse continues through 2025. According to Challenger, Gray & Christmas employment tracking, entertainment and media companies cut over 17,000 jobs in 2025, up 18% from 2024, with news organizations accounting for 2,254 cuts. Press Gazette tracked over 3,000 journalism job cuts in UK and US through 2025. Major outlets affected include People Inc (369 layoffs across two rounds per AdWeek), Forbes (5% workforce cuts per internal memo), Teen Vogue (70% of team per NY Post), and Condé Nast cuts across multiple brands.

Substack reached 5 million paid subscriptions by March 2025 (Sacra research), up from 4 million just four months earlier. Over 50 creators now make $1M+ annually on platform per company blog. The capture rate improving: Jim Acosta amassed 10,000 paid subscribers within weeks of leaving CNN in January 2025 (Axios reporting), bringing his 200K Twitter followers as $0 CAC acquisition.

## UNIT ECONOMICS

Platform GMV reached approximately $450M in writer gross revenue by March 2025 (Sacra estimate), generating estimated $45M in annualized platform revenue. Ben Thompson's Stratechery generates $3M+ annually from 30K paid subscribers per public statements - $100 annual LTV per subscriber, CAC essentially $0, gross margin exceeds 90%.

## HIDDEN RISK

Competitive pressure intensifying from fee structure. According to creator migration data tracked by Beehiiv (company blog, May 2025), roughly 3,000 creators left Substack in 2025, with approximately 1,000 moving to beehiiv in Q1 2025 alone. GRIT Capital migrated 360,000 subscribers in one move per press release. Economic tipping point identified in creator forums: €2-3K/month recurring revenue where 10% fee ($2,400-3,600 annual) begins exceeding flat-fee alternatives ($500-1K annual on Ghost, ConvertKit).

## CAPITAL ENVIRONMENT

Substack raised $100M Series C in July 2025 led by BOND and The Chernin Group (TechCrunch), reaching $1.1B valuation - 70% increase from $650M in 2021. Total funding now $190M-200M across 6 rounds. Company reached positive cash flow in Q1 2025 per CEO Chris Best interview with The Information. At $45M annualized revenue July 2025, valuation implies ~24x revenue multiple - premium to category average of 5-7x.

## CONTRARIAN INSIGHT

Bulls celebrating 5M paid subscriptions miss the retention dynamics and creator exodus. Q1 2025 exodus data (1,000 to beehiiv alone per Beehiiv blog, 3,000 total estimated from platform analytics) reveals fee sensitivity at scale. Bears miss defensibility at top 5%: writers with 5K+ paid subs show <5% annual churn per Substack retention data shared with investors. Question isn't "can it work?" but "at what revenue threshold do economics favor migration?"

**Sources:** SignalFire Creator Economy Report 2024, Challenger Gray & Christmas 2025, Press Gazette UK, Sacra.com Research March 2025, TechCrunch July 2025, The Information Q1 2025, Beehiiv blog May 2025, creator platform forums`,

  competitive: `## COMPETITIVE SET

Current landscape fragments around business model positioning. Beehiiv raised $12.5M Series A at $80M valuation in June 2023 (TechCrunch) at approximately 5x ARR, positioning on growth tools plus ad network model with 0% revenue share. ConvertKit raised $29M at $200M in February 2023 (company announcement) at ~4x ARR, focuses email marketing automation. Ghost bootstrapped at $8M ARR (founder blog 2024), offers open-source self-hosting with 0% platform fees. Patreon raised $415M total (Crunchbase), 5x more than Substack, supports multi-tier memberships targeting creators beyond newsletters.

## WHERE WINS

Brand moat established through 5+ years earned media. According to internal survey shared with The Information (March 2025), 68% of laid-off journalists consider Substack first versus 12% for all alternatives combined. Operational lock-in through radical simplicity: Ben Thompson has stayed since 2014 despite $3M+ in foregone savings by not migrating to Ghost, validating that writers earning $500K-$3M value time at $500-1K/hour opportunity cost.

## WHERE LOSES

Zero discovery creates structural ceiling. According to platform analytics shared in investor deck (leaked to The Information Jan 2025), <1% of Substack writers reach 1K paid subscribers versus approximately 5% of YouTubers achieving monetization thresholds per YouTube Creator Report 2024.

Fee exodus accelerating per creator migration tracking: Economic tipping point emerges around €2-3K/month where 10% platform fee exceeds flat-fee alternatives - at $10K/month, creators pay $12K annually versus $500-1K on competitors.

## SUBSTITUTION RISK

AI audio summarization threatens format. ChatGPT Advanced Voice + NotebookLM already summarize long documents conversationally. Technology trajectory at current pace suggests consumer-grade implementation within 24-36 months per OpenAI roadmap discussions.

**Sources:** TechCrunch June 2023, The Information March 2025, Crunchbase, Ghost founder blog 2024, YouTube Creator Report 2024, OpenAI developer updates`,

  channels: `## CURRENT MIX

SimilarWeb January 2024 traffic analysis reveals extreme concentration: Direct/Email 70-75%, Social (primarily Twitter) 15-20%, Organic Search 5-8%. This distribution hasn't meaningfully shifted since 2022 despite product investments in discovery features per internal analytics.

## EFFICIENCY

Direct works for established writers with existing audiences ($0 CAC). Broken for new: according to Substack creator surveys (leaked to Platformer Nov 2024), 95% of writers maintain <500 social followers entering platform, experiencing 40-60% monthly free subscriber churn before monetization possible.

Twitter dependency creates single point of failure. Analysis of top 50 Substack writers (The Information Jan 2025) shows 43 cite Twitter as #1 growth channel. October 2023 Twitter algorithm modification deprioritizing external links caused 30-40% engagement decline per creator reports to The Verge.

## REALLOCATION THESIS

Cut 80% of paid ad spend (estimated $2-5M annually per AdWeek industry analysis). Double investment in algorithmic cross-promotion engine ($5-10M development investment). Expected ROI: If 20% of 5M paid subscribers adopt cross-subscriptions (realistic based on Spotify's 25% Discover Weekly trial rate), generates $12M incremental platform revenue annually at 10% take rate.

## HIDDEN LEVERAGE

Publisher partnerships represent 1→100 scaling opportunity. Target struggling newsrooms: one successful Axios partnership = 100 writers + established audiences in single deal versus 1-2 years individual recruitment.

**Sources:** SimilarWeb Jan 2024, Platformer Nov 2024 creator survey, The Information Jan 2025, The Verge Oct 2023, AdWeek media spend analysis, Spotify engagement benchmarks`,

  segments: `## CORE: EXILED JOURNALIST

Demographics: Age 35-55, 10-20 years professional journalism, laid off from legacy media. According to LinkedIn analysis by The Information (Jan 2025), approximately 10K journalists laid off 2020-2024. Subset with 10K+ followers enabling monetization: approximately 1,500. Current Substack penetration: approximately 200 generating meaningful income. Remaining TAM: approximately 300 journalists with monetizable audiences.

Proof points from public financials and creator disclosures: Casey Newton generates $800K+ annually (Nieman Lab interview 2024), Heather Cox Richardson estimated $5-6M from 50K paid subs (NY Times profile), Matt Yglesias Slow Boring generates estimated $1M+ (Puck reporting). Top 5 writers estimated $15-20M = approximately 15% of platform GMV per investor deck analysis.

## UNDERSERVED: CORPORATE EXPERT

Demographics: Age 40-60, former McKinsey/Bain/Big4 consultants, Fortune 500 executives. According to McKinsey Alumni Center data, approximately 30K McKinsey alumni globally, with BCG+Bain+Big4 adding 100K combined. Subset with 5K+ LinkedIn followers: 10-15K estimated from LinkedIn premium analytics. Current Substack penetration: <50 per platform search.

Why currently underserved: Missing critical B2B features per enterprise customer feedback to The Information (Feb 2025): team accounts for collaboration, institutional billing allowing company payment, LinkedIn integration for professional network distribution.

## WHITESPACE: YOUTUBE CREATORS

Market sizing from YouTube Creator Report 2024: 50K creators earning $50K+ annually. Subset with engaged audiences likely to pay for newsletter: 10K estimated. Current Substack penetration: <100 per creator surveys.

## SEQUENCING

Corporate experts represent optimal next segment per TAM analysis. Time-to-value shorter (6 months vs 12-18 months for YouTube creators). Segment 2-3x larger than remaining journalist TAM. Higher LTV ($50-200/month vs $10/month consumer) per B2B SaaS benchmarks. Lower churn (80-90% B2B annual retention vs 60-70% consumer per ChartMogul SaaS benchmarks).

**Sources:** The Information Jan 2025 LinkedIn analysis, Nieman Lab 2024, NY Times profile, Puck reporting, McKinsey Alumni Center, LinkedIn Premium analytics, YouTube Creator Report 2024, The Information Feb 2025 enterprise survey, ChartMogul SaaS benchmarks`,

  pivot: `## SYNTHESIS

Analysis from Agents 1-4 reveals: 500 journalists available through media collapse (Agent 1), brand moat but zero discovery mechanism (Agent 2), 60-70% dependent on Twitter creating platform risk (Agent 3), only 200 of 500 addressable journalists captured while 500-1K corporate experts remain underserved due to missing B2B features (Agent 4).

Strategic thesis: Stop pursuing democratization positioning per leaked strategy memo discussion (The Information March 2025). Own top 500-1,000 professional writers globally (journalists + corporate experts) via enterprise B2B features + institutional pricing ($50-200/mo).

## WORKING: KEEP

Simplicity creates operational lock-in validated by revealed preference: NPS 70+ among top-earning writers per internal surveys (leaked to Platformer). Ben Thompson earning $3M+ stays despite $300K/yr foregone savings switching to Ghost - writers at $500K-$3M value time at $500-1K/hour opportunity cost per time-value calculations.

Flat 10% forever creates trust moat built over 7 years. Never changed pricing since 2017 launch. Patreon attempted price change December 2017 leading to creator revolt and permanent brand damage per TechCrunch retrospective analysis.

## BROKEN: KILL

Consumer social features (Notes/Chat/Discover) showing <5% adoption after 12-18 months deployment per internal analytics leaked to The Information. Cannot compete with Twitter's 500M users, Discord's 150M users at Substack's estimated 5K active user scale per web traffic analysis.

Kill all three immediately per strategic recommendation framework. Announce 90-day sunset, provide export tools, reallocate 15-20 engineers to enterprise features, save $3-5M annually in infrastructure costs per AWS billing analysis.

## STRATEGIC BET

Build dedicated B2B product tier "Substack Pro" targeting corporate experts per enterprise roadmap leaked to The Information (March 2025). Required features from customer development interviews: institutional billing $50-200/month where companies pay, team collaboration accounts, LinkedIn integration, enterprise analytics dashboards showing ROI metrics.

90-day pilot structure per lean startup methodology: 200 waitlist signups, 50 activate trial (25% conversion), 15 convert paid (30% trial-to-paid), 10 maintain 2x/month publishing consistency (67% publishing rate). Investment: $3.5-4.5M.

**Sources:** The Information March 2025 strategy memo, Platformer internal survey leak, TechCrunch Patreon retrospective, The Information analytics leak, AWS cost analysis, The Information enterprise roadmap`,

  kpis: `## NORTH STAR: 90-DAY PAID RETENTION

Current baseline: Estimated 68-70% for top-tier writers based on SaaS benchmarks from ChartMogul consumer subscription analysis (2024). Target: 75% by Q3 2025. Impact: 25% higher LTV ($150-180 vs $120) without changing acquisition costs per lifetime value calculations. At 5M paid subscribers × 5pp improvement × $10 monthly = $2.5M monthly revenue improvement = $30M annual revenue impact at scale per financial modeling.

## SUPPORTING 1: CROSS-SUBSCRIPTION RATE

Current: <5% per platform statements to investors (The Information Jan 2025). Target: 20% by Q4 2025. Realistic based on comparable systems per engagement benchmarks: Spotify Discover Weekly achieves approximately 25% trial rate (Spotify engagement report 2024), Netflix recommendations approximately 30% trial rate (Netflix tech blog), Amazon "customers who bought this" approximately 20-25% conversion (Amazon retail case studies).

Impact: Subscribers with 2+ active relationships churn 40-60% lower per multi-sided platform research from Harvard Business Review SaaS retention analysis (2023). At 1M cross-subs × higher retention + ARPU increase = $3-4M incremental annual revenue at 10% take rate per financial projections.

## SUPPORTING 2: PUBLISH CONSISTENCY

Current: 40% maintaining 3+/mo for 3 consecutive months estimated from publishing frequency decay analysis per platform analytics. Target: 60% by Q4 2025. Strongest leading indicator of subscriber retention per correlation analysis: Podcasts maintaining weekly schedule show 75-85% listener retention vs 40-50% for sporadic per Chartable podcast analytics (2024). YouTube channels posting weekly vs monthly show similar retention differentials per YouTube Creator Report 2024.

## SUPPORTING 3: B2B SUBSCRIBER SHARE

Current: <10% of GMV estimated from pricing tier distribution per investor deck analysis. Target: 25% by Q4 2025. Validates corporate expansion thesis from Agent 5. B2B subscriptions show structurally higher retention: Industry benchmarks show B2B SaaS 85-92% annual retention (ChartMogul 2024) vs consumer subscriptions 65-75% annual.

## OPERATING CADENCE

Weekly rhythm (30min, Monday 9am): CEO, Product, Writer Success. Pre-read dashboard: 90-day retention rate top 50 writers, weekly publish rate top 200, cross-sub trend. Decide: which 3 writers get proactive outreach, which product tests roll out or kill.

Monthly rhythm (90min, 1st Tuesday): Full leadership. Deep-dive metrics understanding variance, roadmap alignment (does this move North Star?), strategic bet progress, resource allocation decisions.

Quarterly rhythm (half-day): Leadership + Board. OKR results evaluation, strategic bet go/no-go decision (Day 90 milestones from Agent 5), 12-month product vision, resource planning, red-team exercise identifying vulnerabilities.

**Sources:** ChartMogul 2024 SaaS benchmarks, The Information Jan 2025 investor data, Spotify engagement report 2024, Netflix tech blog, Amazon retail case studies, Harvard Business Review 2023, Chartable podcast analytics 2024, YouTube Creator Report 2024`,

  narrative: `## SITUATION

Creator economy $15B+ per SignalFire 2024 report, paid newsletter segment $500M-1B GMV estimated. Media collapse accelerating: According to Challenger Gray & Christmas tracking, 17K+ jobs cut in entertainment/media 2025. Unit economics at top tier validate venture scale per public creator disclosures: Stratechery $3M ($0 CAC, 90% margin per Ben Thompson blog), Lenny's Newsletter $4M ARR (Lenny Rachitsky interview with Lennybot), Matt Levine estimated $2-3M (NY Times profile).

Extreme Pareto distribution: median <$500/yr per Substack public statements, Gini coefficient estimated >0.8 vs YouTube ~0.7 (YouTube Economics whitepaper), Spotify ~0.73 (Spotify artist economics report). Funding: Substack $190M total at $1.1B valuation July 2025 (TechCrunch) representing approximately 24x revenue multiple on $45M annualized revenue (Sacra estimate).

## COMPLICATION

Growth structurally broken despite 5M paid subs topline per Sacra March 2025 data. According to SimilarWeb Jan 2024, 80% traffic arrives via direct navigation or email clicks - only 8-10% from social referrals, zero from internal discovery. <1% of writers reach 1K paid subscribers vs approximately 5% of YouTubers per platform comparison analysis (The Information investor deck leak).

Creator exodus accelerating per migration tracking: 3,000 creators left Substack in 2025 (estimated from platform analytics), with 1,000 moving to beehiiv in Q1 2025 alone per Beehiiv company blog May 2025. Economic tipping point validated in creator forums and financial modeling: €2-3K/month recurring revenue ($24-36K annually) where 10% platform fee ($2,400-3,600/year) begins exceeding flat-fee alternatives ($500-1,000/year on Ghost, ConvertKit).

## CONVICTION

**The Insight:** This isn't democratization platform per strategic reframing in leaked memo (The Information March 2025) - it's premium infrastructure for top 500-1K professional writers globally earning $100K-$5M annually. Bottom 90% (median <$500/yr) represents R&D expense consuming 80% support resources per internal cost analysis while contributing <10% revenue per GMV breakdown.

**The Wedge:** Enter via immediate supply shock (500+ journalists from media collapse per Challenger Gray tracking, 18-24 month window before supply exhausted), expand to 500-1K corporate experts per TAM analysis in Agent 4 (ex-McKinsey/Bain consultants, Fortune 500 executives, think tank researchers monetizing LinkedIn professional audiences).

**The Moat:** Three defensive layers per competitive analysis framework. (1) Brand positioning as default for serious professionals built over 5+ years through earned media coverage - cannot replicate 5 years of NYT/WSJ/Atlantic coverage establishing category leadership. (2) Operational lock-in through radical simplicity validated by revealed preference - Ben Thompson stayed since 2014 despite $3M+ foregone savings per time-value analysis. (3) Network effects if cross-subscriptions reach 20% target (currently <5% per platform data) - subscribers with 2+ paid subscriptions churn 40-60% lower per multi-sided platform research Harvard Business Review 2023.

**The Metrics:** North Star 90-day retention 68-70%→75% by Q3 2025 per strategic framework. Supporting metrics from Agent 6: Cross-subscription <5%→20% = $3-4M incremental revenue (ChartMogul benchmarks), Writer consistency 40%→60% maintaining 3+/mo (Chartable correlation analysis), B2B subscriber share <10%→25% of GMV validating corporate expansion (enterprise SaaS benchmarks).

**The Outcome:** Becomes Bloomberg Terminal for professional writing per positioning strategy - critical infrastructure for 5K-10K writers globally who cannot operate $500K-$5M businesses without it. Trajectory per financial modeling: Current $450M GMV (Sacra March 2025) → $1-1.5B by 2027-2028 via recruiting remaining professionals + improving monetization through cross-subscriptions + launching B2B institutional tier. At 20-30% net margin (10% take rate minus platform costs) = $200-450M revenue. At 10-15x SaaS multiple (standard for subscription businesses per public comps analysis) = $2-6.75B valuation, representing 2-6x appreciation from current $1.1B over 3-4 years.

## BEAR CASE

**Top writers can abandon without switching costs** per technical analysis. Email lists export via one-click making technical lock-in zero. Ben Thompson earning $3M+ could migrate to WordPress, retain estimated 95% subscribers per email portability analysis, save $300K annually in platform fees. Counter: Switching costs operational + psychological per revealed preference validation, not technical but more durable at high income. Net savings calculation: Gross savings $50-300K minus opportunity cost $20-60K annual operational burden (40-60 hours at $500-1K/hour effective rate) = net $0-240K making switch economically questionable.

**AI eliminates newsletter format** per technology roadmap analysis. ChatGPT Advanced Voice + NotebookLM already summarize documents conversationally per OpenAI product demos. Consumer-grade implementation timeline: 24-36 months at current pace per OpenAI developer discussions. Counter: People subscribe for perspective + voice, not information aggregation per consumer behavior research. Matt Levine's value proposition isn't "what happened in finance" (AI handles trivially) but "what Matt thinks with his specific analytical framework." Historical precedent: Podcasts didn't kill blogs per media format evolution analysis (coexist serving different contexts), YouTube didn't eliminate written content (formats serve different cognitive processing needs).

## THESIS SUMMARY

Substack = infrastructure for media unbundling per strategic positioning, not democratization platform for 500K hobbyists. Addressable market: 5K-10K professional writers globally with audiences, expertise, content discipline per TAM segmentation analysis. Current penetration estimated 5-10% (500-1,000 writers generating meaningful income from 10K-15K addressable). Next 18-24 months per execution roadmap: Own remaining 300 journalists via retention improvements + enterprise features, expand to 500-1K corporate experts via institutional billing + B2B pricing + LinkedIn integration, build algorithmic cross-subscription engine increasing average LTV 50% via multi-subscription relationships (5%→20% adoption target raising ARPU from $10 to $15 monthly average).

Expected outcome per financial modeling: $1-1.5B GMV by 2027-2028 generating $200-450M platform revenue at 20-30% net margins = $2-6.75B valuation at 10-15x SaaS multiples, representing 2-6x appreciation from $1.1B current valuation over 3-4 years. Primary risks requiring monitoring per risk framework: Corporate expert segment may require service wrapper not pure software (ghost-writing to maintain publishing consistency) reducing margins 20-30%, Twitter could eliminate external link sharing blocking primary growth channel for new writer acquisition with no viable substitute identified, AI audio could disrupt text format within 36 months requiring multi-format distribution pivot.

**Sources:** SignalFire 2024, Challenger Gray & Christmas 2025, TechCrunch July 2025, Sacra March 2025, NY Times profiles, SimilarWeb Jan 2024, The Information investor deck, Beehiiv blog May 2025, Harvard Business Review 2023, ChartMogul 2024, Chartable 2024, OpenAI product updates, media format evolution research`,
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
  return data.text;
}

function md(text) {
  if (!text) return "";
  
  // First, fix the Sources line to ensure it's on one line
  let fixedText = text.replace(/\*\*Sources:\*\*([^\n]*(?:\n(?!\n)[^\n]*)*)/g, (match, sources) => {
    const cleaned = sources.replace(/\n/g, ', ').replace(/,\s*,/g, ',').trim();
    return `**Sources:** ${cleaned}`;
  });
  
  // Remove markdown heading
  fixedText = fixedText.replace(/^#+ EXECUTIVE SYNOPSIS\s*\n/gm, '');
  
  // Check if this is synopsis content (has THE VERDICT)
  const isSynopsis = fixedText.includes('**THE VERDICT**');
  
  if (isSynopsis) {
    // Handle synopsis with special layout
    let html = '';
    
    // Extract THE VERDICT
    const verdictMatch = fixedText.match(/\*\*THE VERDICT\*\*\s*\n(.+?)(?=\n◉)/s);
    if (verdictMatch) {
      html += `<div style="margin-bottom:12px;padding:11px;background:white;border:1px solid #d4724a;border-left:3px solid #d4724a">
        <div style="font-size:8px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#d4724a;margin-bottom:4px">THE VERDICT</div>
        <p style="font-size:10px;line-height:1.4;color:#2b2b2b;margin:0">${verdictMatch[1].trim()}</p>
      </div>`;
    }
    
    // Extract all ◉ sections
    const sections = [];
    const sectionRegex = /◉ ([A-Z\s&]+)\s*\n(.+?)(?=\n◉|$)/gs;
    let match;
    while ((match = sectionRegex.exec(fixedText)) !== null) {
      sections.push({ title: match[1].trim(), content: match[2].trim() });
    }
    
    // Wave 1: First 4 sections in 2x2 grid
    if (sections.length >= 4) {
      html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:12px">';
      for (let i = 0; i < 4; i++) {
        html += `<div style="padding:9px;background:white;border:1px solid #3d6b54;border-left:3px solid #3d6b54">
          <div style="font-size:7.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#3d6b54;margin-bottom:4px">◉ ${sections[i].title}</div>
          <p style="font-size:8.5px;line-height:1.35;color:#4a4a4a;margin:0">${sections[i].content}</p>
        </div>`;
      }
      html += '</div>';
    }
    
    // Wave 2: Remaining sections row-wise
    for (let i = 4; i < sections.length; i++) {
      html += `<div style="margin-bottom:8px;padding:10px;background:white;border:1px solid #3d6b54;border-left:3px solid #3d6b54">
        <div style="font-size:7.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#3d6b54;margin-bottom:4px">◉ ${sections[i].title}</div>
        <p style="font-size:9px;line-height:1.4;color:#4a4a4a;margin:0">${sections[i].content}</p>
      </div>`;
    }
    
    return html;
  }
  
  // Regular content (agent analysis)
  // Special case: if content starts with ##, don't add opening <p> tag
  const startsWithHeader = fixedText.trim().startsWith('##');
  const openTag = startsWithHeader ? '' : '<p style="margin:6px 0;">';
  const closeTag = startsWithHeader ? '' : '</p>';
  
  return openTag + fixedText
    .replace(/^## (.+)$/gm, `</p><h3 class="agent-section-header" style="font-family:'Libre Baskerville',serif;font-size:14px;color:${P.forest};margin:16px 0 6px;border-bottom:1px solid ${P.sand};padding-bottom:4px;">$1</h3><p style="margin:6px 0;">`)
    .replace(/\*\*(.+?)\*\*/g, `<strong style="color:${P.ink};">$1</strong>`)
    .replace(/^- (.+)$/gm, `<div style="display:flex;gap:7px;margin:3px 0;"><span style="color:${P.terra};">▸</span><span>$1</span></div>`)
    .replace(/\n\n/g, `</p><p style="margin:6px 0;">`)
    .replace(/\n/g, " ") + closeTag;
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
    <div data-agent={agent.id} className="agent-card" style={{ border: `1.5px solid ${c.border}`, borderRadius: 3, background: c.bg, overflow: "hidden", boxShadow: status === "running" ? `0 3px 20px rgba(200,146,42,0.13)` : "none" }}>
      <div style={{ background: c.bg, padding: "12px 16px", borderBottom: `1px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: c.dot }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: P.ink }}>{agent.icon} {agent.label}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: waveColor, background: `${waveColor}15`, padding: "3px 7px", borderRadius: 10 }}>WAVE {agent.wave}</span>
          {status === "done" && <span style={{ fontSize: 11, color: P.forestSoft }}>✓</span>}
        </div>
      </div>
      {!result && status === "idle" && <div style={{ padding: "10px 16px", fontSize: 11, color: P.inkFaint }}>{agent.sub}</div>}
      {status === "running" && <div style={{ padding: "0 16px" }}><div style={{ height: 2, background: P.sand, position: "relative", overflow: "hidden" }}><div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: "100%", background: `linear-gradient(90deg, ${P.gold} 0%, ${P.gold} 50%, transparent 50%)`, backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} /></div></div>}
      {result && <div className="agent-content" style={{ padding: "16px 20px", fontSize: 13, color: P.inkMid, lineHeight: 1.8, maxHeight: 440, overflowY: "auto" }} dangerouslySetInnerHTML={{ __html: `<p style="margin:0">${md(result)}</p>` }} />}
      {status === "queued" && !result && <div style={{ padding: "12px 18px", display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: P.sand, animation: "pulse 1.5s infinite" }} /><span style={{ fontSize: 12, color: P.inkFaint, fontStyle: "italic" }}>Ready</span></div>}
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

  const downloadPDF = () => { gaEvent("pdf_download", { company }); window.print(); };

  const handlePDF = async (e) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== "application/pdf") return alert("PDF only");
    if (file.size > 20 * 1024 * 1024) return alert("Max 20MB");
    const b64 = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result.split(",")[1]); r.onerror = () => rej(new Error("Read failed")); r.readAsDataURL(file); });
    setPdfs([{ name: file.name, b64, size: file.size }]);
  };

  const runAgent = useCallback(async (id, prompt, signal, docs) => {
    try {
      const text = await callClaude(prompt, docs || [], signal, id);
      if (!signal.aborted) { setResults(r => ({ ...r, [id]: text })); setStatuses(s => ({ ...s, [id]: "done" })); }
      return text;
    } catch (e) {
      if (e.name !== "AbortError") { setStatuses(s => ({ ...s, [id]: "error" })); setResults(r => ({ ...r, [id]: `Error: ${e.message}` })); }
      return "";
    }
  }, []);

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

    const newResults = {};
    for (const id of W1) {
      if (ctrl.signal.aborted) return;
      setStatuses(s => ({ ...s, [id]: "running" }));
      const text = await runAgent(id, makePrompt(id, company, ctx, null), ctrl.signal, pdfs);
      newResults[id] = text;
      await new Promise(r => setTimeout(r, 1500));
    }

    const synthCtx = W1.map(id => `[${AGENTS.find(a => a.id === id).label}]: ${(newResults[id] || "").slice(0, 400)}`).join("\n");

    for (const id of W2) {
      if (ctrl.signal.aborted) return;
      setStatuses(s => ({ ...s, [id]: "running" }));
      const text = await runAgent(id, makePrompt(id, company, ctx, synthCtx), ctrl.signal, pdfs);
      newResults[id] = text;
      await new Promise(r => setTimeout(r, 1500));
    }

    // Generate executive synopsis from all agent findings  
    if (!ctrl.signal.aborted) {
      setStatuses(s => ({ ...s, synopsis: "running" }));
      
      // Wait a moment for state to fully update
      await new Promise(r => setTimeout(r, 500));
      
      // Get fresh results from state
      const currentResults = { ...newResults };
      const allAgentResults = AGENTS.map(a => {
        const result = currentResults[a.id] || "";
        if (!result) console.log(`Missing result for ${a.id}`);
        return `\n━━━ ${a.label.toUpperCase()} ━━━\n${result}`;
      }).join('\n\n');

      console.log("Synopsis receiving data for agents:", AGENTS.map(a => a.id).join(", "));
      console.log("First 200 chars of each agent:", AGENTS.map(a => `${a.id}: ${(currentResults[a.id] || 'EMPTY').substring(0, 200)}`));

      const synopsisPrompt = `You are writing the opening page of a strategic intelligence report on ${company}. You have complete analysis from 7 research agents. Your job: write an EXECUTIVE SYNOPSIS that makes reading the full report irresistible.

COMPLETE AGENT ANALYSIS:
${allAgentResults}

CRITICAL INSTRUCTIONS:

Your synopsis must tell a STORY with narrative arc:
1. Lead with the most provocative insight—what everyone gets wrong about ${company}
2. Build tension by revealing the hidden dynamic or structural shift
3. Connect findings into a coherent narrative (not disconnected bullets)
4. Make each section flow to the next—create momentum
5. End with stakes: what happens if they act on this vs. ignore it

STRUCTURE:

**THE VERDICT** (60-70 words MAXIMUM - this is a HARD LIMIT)
Open with the single most contrarian insight. Lead with specific data. Make it impossible to ignore.

**KEY FINDINGS** (Four sections for Wave 1 in 2x2 grid, two sections for Wave 2 full-width)

Wave 1 sections (35-45 words MAXIMUM per section - HARD LIMIT for grid layout):

◉ MARKET SIGNALS
[Most contrarian market insight with 1-2 key metrics - 35-45 words MAXIMUM]

◉ COMPETITIVE LANDSCAPE  
[Hidden competitive reality with competitor names - 35-45 words MAXIMUM]

◉ CHANNELS
[Channel efficiency insight with CAC data - 35-45 words MAXIMUM]

◉ SEGMENTS
[Customer segment opportunity with TAM/LTV data - 35-45 words MAXIMUM]

Wave 2 sections (50-60 words MAXIMUM per section - HARD LIMIT):

◉ GTM & OPERATIONS
[Synthesize GTM Blueprint + Operating Rhythm: key strategic bet and North Star metric - 50-60 words MAXIMUM]

◉ INVESTMENT THESIS
[From Investment Memo: conviction case and expected outcome with valuation path - 50-60 words MAXIMUM]

CRITICAL: These word limits are HARD MAXIMUMS. Going over will break the page layout. Count your words and stay under limits.
Total synopsis: 290-350 words MAX.

STYLE REQUIREMENTS:

✓ Write in tight, connected prose—not bullets or lists
✓ Lead each section with insight, not description
✓ Use "According to [source]" or "per [data]" for credibility
✓ Create flow: each section sets up the next
✓ Remove hedge words (seems, appears, suggests)—be definitive
✓ Pack density: every sentence adds new information
✓ Match the voice of top-tier VC memos: sharp, substantive, opinionated

BAD EXAMPLE (disconnected, descriptive):
"Market Signals examines the category positioning. The analysis shows that ${company} operates in a growing market. Funding has been raised recently."

GOOD EXAMPLE (narrative, insight-led):
"Bulls celebrating the $15B TAM miss the creator exodus. Three thousand creators left in 2025—revealing the 10% fee creates a $2-3K/month tipping point where economics favor migration. The platform wins at the top 5% (writers earning $500K+ value simplicity over savings) while quietly losing the middle tier."

Write 350-400 words total. Create momentum that makes the reader want to dive into the full analysis.

Output format:
**THE VERDICT**
[Your compelling opening paragraph]

◉ MARKET SIGNALS
[Narrative synthesis paragraph]

◉ COMPETITIVE LANDSCAPE
[Narrative synthesis paragraph]

◉ CHANNELS
[Narrative synthesis paragraph]

◉ SEGMENTS
[Narrative synthesis paragraph]

◉ GTM & OPERATIONS
[Narrative synthesis paragraph]

◉ INVESTMENT THESIS
[Narrative synthesis paragraph]

Start directly with the content. Do NOT include "Here is the synopsis" or explanatory text. Do NOT add "---" dividers or "**KEY FINDINGS**" headers.`;

      const synopsisText = await callClaude(synopsisPrompt, [], ctrl.signal, "synopsis");
      if (!ctrl.signal.aborted) {
        setResults(r => ({ ...r, synopsis: synopsisText }));
        setStatuses(s => ({ ...s, synopsis: "done" }));
      }
    }

    if (!ctrl.signal.aborted) { clearInterval(timerRef.current); setAppState("done"); }
  };

  const stop = () => { abortRef.current?.abort(); clearInterval(timerRef.current); setAppState("idle"); };
  const reset = () => { abortRef.current?.abort(); setAppState("idle"); setResults({}); setStatuses({}); setHasStarted(false); setElapsed(0); setPdfs([]); setCompany(""); setUserName(""); clearInterval(timerRef.current); };

  const formatTime = (s) => { const m = Math.floor(s / 60); const sec = s % 60; return `${m}:${sec.toString().padStart(2, "0")}`; };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: ${P.cream}; color: ${P.ink}; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @keyframes pulse { 0%, 100% { opacity: .4; } 50% { opacity: 1; } }
        @media print {
          @page { 
            margin: 0;
          }
          body { 
            background: white !important; 
            margin: 0 !important;
            padding: 0 !important;
          }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .pdf-header { 
            display: block !important;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 9999;
            background: #1a3325 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          .pdf-header * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          .agent-content { 
            max-height: none !important; 
            overflow: visible !important;
          }
          /* Apply padding ONLY to block elements that could start a page */
          .agent-content p,
          .agent-content h3 {
            padding-top: 110px !important;
            margin-top: -104px !important;
          }
          h2 {
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      {/* Green header - Shows on every PDF page with proper colors */}
      <div className="pdf-header" style={{ display: "none" }}>
        <div style={{ background: P.forest, padding: "14px 20px", borderBottom: `3px solid ${P.forestMid}`, width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 17, fontWeight: 700, color: P.parchment, letterSpacing: ".03em" }}>
                <span style={{ fontWeight: 400, fontStyle: "italic" }}>Strategic</span><span>Sprint</span>
              </div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".15em", textTransform: "uppercase", color: P.parchment, opacity: 0.9 }}>PARALLEL AGENT INTELLIGENCE</div>
            </div>
            <div style={{ background: P.terra, color: P.white, fontSize: 9, fontWeight: 700, letterSpacing: ".1em", padding: "5px 12px", borderRadius: 12 }}>HARSHA BELAVADY</div>
          </div>
        </div>
      </div>

      {/* Header - Dark Green Bar for web view */}
      <div className="no-print" style={{ background: P.forest, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `3px solid ${P.forestMid}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 17, fontWeight: 700, color: P.parchment, letterSpacing: ".03em" }}>
            <i style={{ fontWeight: 400 }}>Strategic</i>Sprint
          </div>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".15em", textTransform: "uppercase", color: `${P.parchment}90` }}>PARALLEL AGENT INTELLIGENCE</div>
        </div>
        <div style={{ background: P.terra, color: P.white, fontSize: 9, fontWeight: 700, letterSpacing: ".1em", padding: "5px 12px", borderRadius: 12 }}>HARSHA BELAVADY</div>
      </div>

      {/* Main Content */}
      <div className="no-print" style={{ padding: "40px 24px 24px", maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".15em", textTransform: "uppercase", color: P.terra, marginBottom: 6 }}>RAPID INTELLIGENCE SPRINT. HUMAN & AI POWERED</div>
          <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 34, fontWeight: 700, color: P.ink, marginBottom: 6, lineHeight: 1.2 }}>Strategy Analysis</h1>
          <p style={{ fontSize: 14, color: P.inkMid, fontStyle: "italic" }}>Analysed By 7 Parallel Agents</p>
        </div>

        {!hasStarted && (
          <>
            <div style={{ marginBottom: 24, padding: "20px", background: P.white, border: `1px solid ${P.sand}`, borderRadius: 3 }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: P.inkSoft, marginBottom: 12 }}>In Wave 1, 4 Analysis Agents Fire Simultaneously Then 3 Synthesis Agents in Wave 2</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div style={{ padding: "14px 16px", background: P.parchment, border: `1px solid ${P.sand}`, borderRadius: 3 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: P.forestSoft, marginBottom: 8 }}>WAVE 1 · 4 ANALYSIS AGENTS</div>
                    {AGENTS.filter(a => a.wave === 1).map(a => (
                      <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: P.forestSoft }} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: P.ink }}>{a.label}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: "14px 16px", background: P.parchment, border: `1px solid ${P.sand}`, borderRadius: 3 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: P.terra, marginBottom: 8 }}>WAVE 2 · 3 SYNTHESIS AGENTS</div>
                    {AGENTS.filter(a => a.wave === 2).map(a => (
                      <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: P.terra }} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: P.ink }}>{a.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 24, padding: "20px", background: P.white, border: `1px solid ${P.sand}`, borderRadius: 3 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: P.inkSoft, marginBottom: 12 }}>SPRINT SETUP</div>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 18 }}>
                <div>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: P.inkSoft, marginBottom: 6 }}>Company <span style={{ color: P.terra }}>*</span></label>
                  <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Substack, Stripe, Notion..." style={{ width: "100%", padding: "11px 14px", fontSize: 13, border: `1px solid ${P.sand}`, borderRadius: 3, background: P.white, color: P.ink }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: P.inkSoft, marginBottom: 6 }}>Context (Optional)</label>
                  <input value={context} onChange={(e) => setContext(e.target.value)} placeholder="e.g. Focus on enterprise GTM" style={{ width: "100%", padding: "11px 14px", fontSize: 13, border: `1px solid ${P.sand}`, borderRadius: 3, background: P.white, color: P.ink }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: P.inkSoft, marginBottom: 6 }}>Your Name (Optional)</label>
                  <input value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Optional" style={{ width: "100%", padding: "11px 14px", fontSize: 13, border: `1px solid ${P.sand}`, borderRadius: 3, background: P.white, color: P.ink }} />
                </div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: P.inkSoft, marginBottom: 6 }}>Reference Document (Optional · 1 PDF · MAX 500KB)</label>
                <input ref={fileRef} type="file" accept=".pdf" onChange={handlePDF} style={{ display: "none" }} />
                <button onClick={() => fileRef.current?.click()} style={{ padding: "10px 16px", fontSize: 12, fontWeight: 600, color: P.inkMid, background: P.white, border: `1.5px dashed ${P.sand}`, borderRadius: 3, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                  <span>📎</span>
                  <span>{pdfs.length ? pdfs[0].name : "Upload PDF"}</span>
                </button>
                {pdfs.length > 0 && <div style={{ marginTop: 6, fontSize: 10, color: P.inkFaint }}>File ready: {(pdfs[0].size / 1024).toFixed(0)} KB</div>}
              </div>

              <button onClick={runSprint} disabled={!company.trim() || appState === "running"} style={{ width: "100%", padding: "15px", fontSize: 13, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: P.white, background: company.trim() && appState !== "running" ? P.forest : P.sand, border: "none", borderRadius: 3, cursor: company.trim() && appState !== "running" ? "pointer" : "not-allowed" }}>
                {appState === "running" ? "Running Sprint..." : "► LAUNCH SPRINT"}
              </button>
            </div>
          </>
        )}

        {hasStarted && (
          <>
            <div style={{ marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: P.ink, marginBottom: 4 }}>{company}</div>
                <div style={{ fontSize: 11, color: P.inkFaint }}>
                  {appState === "running" && `Sprint in progress... ${formatTime(elapsed)}`}
                  {appState === "done" && `Completed in ${formatTime(elapsed)}`}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {appState === "running" && <button onClick={stop} style={{ padding: "8px 16px", fontSize: 11, fontWeight: 600, color: P.terra, background: P.white, border: `1px solid ${P.terra}`, borderRadius: 3, cursor: "pointer" }}>Stop</button>}
                {appState === "done" && <button onClick={downloadPDF} style={{ padding: "8px 16px", fontSize: 11, fontWeight: 600, color: P.white, background: P.forest, border: "none", borderRadius: 3, cursor: "pointer" }}>Download PDF</button>}
                <button onClick={reset} style={{ padding: "8px 16px", fontSize: 11, fontWeight: 600, color: P.inkMid, background: P.white, border: `1px solid ${P.sand}`, borderRadius: 3, cursor: "pointer" }}>New Sprint</button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
              {AGENTS.map(a => <AgentCard key={a.id} agent={a} status={statuses[a.id] || "idle"} result={results[a.id]} />)}
            </div>
          </>
        )}
      </div>

      {/* Print-only synopsis and agents */}
      {appState === "done" && (
        <div style={{ display: "none" }} className="print-only print-content-area">
          {/* Synopsis Page */}
          <div style={{ padding: "70px 50px 20px 50px", pageBreakAfter: "always" }}>
            <div style={{ textAlign: "center", marginBottom: 18 }}>
              <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 32, fontWeight: 700, marginBottom: 8, color: "#1a3325", letterSpacing: "0.05em" }}>{company.toUpperCase()}</h1>
              <p style={{ fontSize: 12, color: "#6b6b6b", marginBottom: 3 }}>7-Agent Parallel Intelligence Analysis</p>
              <p style={{ fontSize: 10, color: "#9a9a9a" }}>Generated {new Date().toLocaleDateString()} in {formatTime(elapsed)}</p>
            </div>

            <div style={{ background: "#faf8f4", border: "2px solid #1a3325", borderRadius: 4, padding: "14px 18px", marginBottom: 14 }}>
              <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 14, color: "#1a3325", marginBottom: 10, textAlign: "center", borderBottom: "1px solid #9b8c78", paddingBottom: 5 }}>EXECUTIVE SYNOPSIS</h2>
              
              {/* Dynamic Synopsis from Agent */}
              {results.synopsis ? (
                <div style={{ fontSize: 10.5, lineHeight: 1.6, color: "#2b2b2b" }} dangerouslySetInnerHTML={{ __html: md(results.synopsis) }} />
              ) : (
                <div style={{ padding: "20px", textAlign: "center", color: "#999", fontStyle: "italic" }}>
                  Synopsis generating...
                </div>
              )}
            </div>

            <div style={{ textAlign: "center", padding: "10px", background: "#f5f2ed", borderRadius: 4 }}>
              <p style={{ fontSize: 10, color: "#6b6b6b", lineHeight: 1.4, margin: 0 }}>
                <strong style={{ color: "#1a3325" }}>The following pages</strong> present detailed findings from 7 parallel intelligence agents
              </p>
            </div>
          </div>

          {/* Agent Pages - First one NO page break before */}
          {AGENTS.map((agent, index) => {
            const result = results[agent.id];
            if (!result) return null;
            
            return (
              <div key={agent.id} style={{ pageBreakBefore: index === 0 ? "auto" : "always", pageBreakAfter: "auto", padding: "70px 50px 30px 50px" }}>
                <div style={{ marginBottom: 20, paddingBottom: 15, borderBottom: "2px solid #1a3325", pageBreakAfter: "avoid", pageBreakInside: "avoid" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                    <span style={{ fontSize: 24, color: agent.wave === 1 ? "#3d6b54" : "#d4724a" }}>{agent.icon}</span>
                    <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, color: "#1a3325", margin: 0 }}>{agent.label}</h2>
                  </div>
                  <p style={{ fontSize: 11, color: "#6b6b6b", fontStyle: "italic", margin: 0 }}>{agent.sub}</p>
                  <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: agent.wave === 1 ? "#3d6b54" : "#d4724a", marginTop: 8 }}>
                    WAVE {agent.wave} · AGENT {index + 1} OF 7
                  </div>
                </div>
                
                <div className="agent-content" style={{ fontSize: 11.5, lineHeight: 1.8, color: "#2b2b2b" }} dangerouslySetInnerHTML={{ __html: md(result) }} />
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
