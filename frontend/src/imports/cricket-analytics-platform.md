Act as a *senior full-stack architect, sports analytics engineer, ML product designer, UI/UX strategist, and prompt-driven implementation expert*.

Build a *complete end-to-end web application* for a cricket analytics platform with *two major modules*:

1. *Player Impact Metric Analyzer* (historical + rolling impact score over last N innings)
2. *Live Match Tactical Recommendation Engine* (suggest best player matchup in ongoing match context)

The final output must be a *working, hackathon-ready, modern web app* with a *clear user journey, **attractive and unique UI, **explainable analytics, and **production-style modular code*.

---

# PROJECT TITLE

*Cricket Impact Metric & Live Tactical Matchup Intelligence Platform*

---

# CORE OBJECTIVE

Create a data-driven platform that:

### Feature 1 — Player Impact Metric Analyzer

Calculates a player’s *Impact Metric (IM)* using:

* *Performance*
* *Match Context*
* *Pressure / Situation*

Then normalizes the score to *0–100* with:

* *50 = neutral baseline*
* Aggregates over *last 10 innings (default)* using recency weighting

### Feature 2 — Live Match Tactical Recommendation Engine

Analyzes an *ongoing match* (start / middle / end phase) and recommends the *best player from one team* to counter a *specific opponent player*, based on:

* Pitch
* Match phase
* Score / wickets / overs
* Pressure situation
* Recent form
* Impact metric
* Historical matchup or player-type matchup suitability

Example:

* Best bowler from Team A to bowl to current batter from Team B
* Best batter from Team A to attack / survive against a specific bowler in current chase/defense scenario

---

# IMPORTANT REQUIREMENT

This must be built as a *proper web app flow* with *UI structure from start to end, beginning with a **Landing Page* that introduces the platform and guides users to the two modules.

The UI must be:

* Attractive
* Unique
* Modern
* Responsive
* Hackathon-impressive
* Explainable and user-friendly (not just technical)

---

# COMPLETE WEB APP UI FLOW (MANDATORY)

Design the app with a *full user journey* in proper web app style:

## 1) Landing Page (Intro / Hero Page)

This is the first page users see.

### Purpose

Introduce the platform and clearly explain the two core features.

### Must include

* Hero section with strong title + subtitle
* Short intro explaining:

  * What the Impact Metric is
  * What Live Tactical Recommendation does
* CTA buttons:

  * *Analyze Player Impact*
  * *Analyze Live Match*
* Visual preview cards of both modules
* “How it works” 3-step section
* Key benefits (data-driven, explainable, live tactical suggestions)
* Sample stats or animated metric widgets (mock values for wow effect)
* Footer with team/hackathon/project credits

### Design direction

* Premium sports analytics feel
* Dynamic gradients / glassmorphism / dark modern UI
* Cricket-inspired but not cliché
* Clean typography + strong contrast
* Smooth hover animations + subtle transitions

---

## 2) Authentication / Entry Layer (Optional but recommended)

If implemented:

* Login / guest mode
* “Continue as Guest” for hackathon demo
* Save analysis history if logged in

If not implementing auth, still create the UI shell for it (future-ready).

---

## 3) Main Dashboard / Home Hub (Post-Landing)

After entering, user lands on a dashboard with access to both modules.

### Must include

* Top navigation bar
* Sidebar or tab navigation for modules
* Quick search (player name)
* Quick launch cards:

  * Player Impact Analyzer
  * Live Match Tactical Analyzer
* Recent analyses (optional)
* Saved players / quick compare (optional)
* Metric summary cards (e.g., top impact player, clutch player, recent trend)
* One mini chart preview

### Navigation structure

* Home / Dashboard
* Player Impact Analyzer
* Live Tactical Analyzer
* Compare (optional)
* Data Upload / Admin (optional)
* Settings / Weight Config (optional)

---

## 4) Feature 1 Page — Player Impact Metric Analyzer

This is a dedicated page/module for impact score calculation and analysis.

### Input Panel (Left or Top)

User should be able to input/select:

* Player name (searchable dropdown)
* Team (optional)
* Match format (T20 / ODI / Test)
* Tournament
* Season / date range (optional)
* Innings window (default = 10)
* Analysis type:

  * Overall
  * Batting
  * Bowling
  * Fielding
  * All-round
* Optional filters:

  * Opposition
  * Venue
  * Home/Away
  * Pitch type
* Advanced settings toggle:

  * Recency weighting type (equal / linear / exponential)
  * Normalization method (min-max / percentile / z-score)
  * Weight sliders for performance/context/pressure (optional advanced mode)

### Result Panel

Must display:

* *Final IM Score (0–100)* as a prominent visual meter/gauge
* Neutral baseline indicator at *50*
* “Impact Tier” label (e.g., low / neutral / high / elite)
* Confidence score / data completeness indicator

### Analytics Sections

* Last N innings trend line chart
* Innings-wise table with IM score and summary
* Breakdown chart:

  * Performance contribution
  * Context contribution
  * Pressure contribution
* Explainability panel:

  * Top positive drivers
  * Risk factors / uncertainty
  * Why score increased/decreased
* Optional compare mode:

  * Compare 2 players side-by-side

### UI Notes

* Split layout (filters + results)
* Sticky filter panel (desktop)
* Responsive stacked layout (mobile)
* Use cards, tabs, charts, expandable rows

---

## 5) Feature 2 Page — Live Match Tactical Recommendation Engine

This is a dedicated page/module for ongoing match tactical analysis.

### Step-based Input Flow (important for usability)

Design as a *guided multi-step form* or clear sections:

#### Step 1: Match Setup

* Match stage:

  * Start of match
  * Mid match
  * End / death overs
* Format (T20 / ODI / Test)
* Tournament
* Venue
* Pitch type
* Weather (optional)
* Toss result + decision (optional)

#### Step 2: Teams & Playing XI

* Team A
* Team B
* Playing XI for both teams
* Current available players / bench (if modeled)

#### Step 3: Live Match State

* Current score
* Overs completed
* Wickets fallen
* Target (if chase)
* Required run rate
* Current innings (1st/2nd)
* Match phase (Powerplay / Middle / Death)

#### Step 4: Tactical Target Selection

User selects:

* Opponent player to counter (batter or bowler)
* Type of recommendation needed:

  * Best bowler vs batter
  * Best batter vs bowler
  * Best tactical matchup
  * Top 3 options

Optional:

* Batter hand
* Bowler style/type
* Field setting intent (aggressive / defensive) if modeled

### Output / Recommendation Panel

Must show:

* *Top 3 recommended players*
* TacticalScore / confidence
* Suitability tags (e.g., “Death-over specialist”, “Spin-on-slow-pitch”, “Strong vs left-hand batters”)
* Reasoning for each recommendation
* Risk / uncertainty warning
* Alternative scenario suggestions (“If wicket falls, switch to X”)

### Visuals

* Live pressure indicator
* Tactical matchup radar/spider chart (optional)
* Phase-wise suitability bars
* Head-to-head / type matchup mini chart
* Recommended sequence (e.g., next-over suggestion)

### Explainability (mandatory)

Every recommendation must include:

* Why this player is recommended *right now*
* Which factors contributed most
* Confidence level
* Data sufficiency warning if sparse history

---

## 6) Comparison Page (Optional but highly valuable)

A separate page to compare:

* Two players’ IM trend
* Pressure handling
* Phase performance
* Tactical suitability in given match condition

This can impress judges if done cleanly.

---

## 7) Data Upload / Admin Page (Optional but strong bonus)

Allow CSV upload for custom data and demos:

* Upload scorecard / ball-by-ball / player summary files
* Column mapping helper
* Validation preview
* Import status
* Error rows summary
* “Use sample demo dataset” toggle

---

## 8) Results History / Saved Sessions (Optional)

Show previous analyses with:

* Timestamp
* Feature type used
* Input summary
* Quick reopen button

---

## 9) Final UX State / End Journey

At the end of any analysis, user should be able to:

* Export results (PDF/CSV/image)
* Share screenshot-ready summary
* Save session
* Compare with another player
* Launch live tactical analysis directly from player result
* Return to dashboard

This completes the proper web app flow from landing to insights to action.

---

# MANDATORY IMPACT FORMULAS (USE THESE EXACTLY AS BASE)

Use these formulas in implementation and explain them in UI/documentation.

## 1) Innings-level Raw Impact

*RawImpact_i = IPS_i × CM_i × PM_i*

Where:

* *IPS_i* = Innings Performance Score (batting + bowling + fielding impact, normalized)
* *CM_i* = Context Multiplier (format, opposition strength, pitch difficulty, phase, chase/defense context, entry state)
* *PM_i* = Pressure Multiplier (required RR pressure, wickets, clutch overs, match importance, recent form pressure)

## 2) Innings-level Impact Metric

*IM_i = NormalizeTo0to100(RawImpact_i)*

Constraint:

* *Neutral / average expected impact = 50*

## 3) Rolling Player Impact Metric (default last 10 innings)

*IM_player = (Σ (w_k × IM_k)) / (Σ w_k)*

Where:

* *w_k* = recency weights (recent innings get higher importance)
* Support at least one weighting strategy (prefer exponential; allow equal/linear as advanced option)

### Important implementation constraints

* Bound CM_i and PM_i (e.g., 0.75–1.25) to prevent score explosion
* Role-aware normalization
* Format-aware calibration
* Anti-gaming thresholds and clipping
* Graceful fallback if some data is missing

---

# FEATURE 1 — PLAYER IMPACT METRIC ANALYZER (BACKEND + LOGIC REQUIREMENTS)

System should:

1. Fetch historical data (ball-by-ball preferred, scorecard fallback)
2. Engineer features
3. Compute IPS, CM, PM
4. Compute RawImpact and normalize to IM (0–100)
5. Aggregate rolling IM for last N innings
6. Provide explainability + confidence + warnings

### Minimum feature groups

## A) Performance features

* Runs, balls, strike rate
* Boundary %
* Wickets, overs, economy
* Dot ball % (if available)
* Fielding impact (catch/run-out/stumping)
* Contribution share (team runs/wickets influence)

## B) Context features

* Format
* Innings number
* Match phase
* Opposition strength
* Pitch difficulty proxy
* Venue
* Chase/defend state
* Entry situation (score/wickets/over when player comes in)

## C) Pressure features

* Required RR vs current RR
* Wickets in hand
* Clutch overs / death overs
* Match importance
* Collapse rescue condition
* Recent form slump/comeback indicator
* Pressure index

---

# FEATURE 2 — LIVE MATCH TACTICAL RECOMMENDATION ENGINE (BACKEND + LOGIC REQUIREMENTS)

Design a tactical recommendation system that ranks available players for a given live situation.

## Suggested composite score (required logic style)

*TacticalScore = MatchupHistoryScore × LiveContextFit × PitchFit × PhaseSuitability × FormImpactScore × PressureSuitability × AvailabilityConstraint*

Where:

* *MatchupHistoryScore* = player-vs-player or player-vs-type suitability
* *LiveContextFit* = fit for current score/overs/wickets/target
* *PitchFit* = venue/pitch suitability
* *PhaseSuitability* = powerplay/middle/death suitability
* *FormImpactScore* = recent form using Feature 1 IM output
* *PressureSuitability* = clutch performance ability
* *AvailabilityConstraint* = valid choice given current state (overs left, lineup availability, etc.)

### Must return

* Top 3 recommended players
* Confidence score
* Explainability reasons
* Risk flags
* Alternative recommendation if conditions change

### Important integration requirement

Feature 2 must *reuse outputs from Feature 1* (Impact Metric engine) as a major input.

---

# SYSTEM REQUIREMENTS (END-TO-END)

Build a full working application with:

## 1) Frontend

* Attractive, unique, modern UI
* Responsive design
* Proper navigation flow from landing page to modules to results
* Charts, cards, forms, explainability panels
* Smooth transitions and polished interactions

## 2) Backend API

* REST APIs (preferred)
* Validation + error handling
* Scoring engine endpoints
* Tactical recommendation endpoints
* Data retrieval endpoints
* Optional caching

## 3) Analytics / ML Layer

* Feature engineering pipeline
* Scoring + normalization
* Tactical ranking engine
* Weight configuration support
* Explainability generation

## 4) Database / Storage

Store:

* Players
* Teams
* Matches
* Innings summaries
* Venue profiles
* Computed impact scores
* Tactical recommendation cache
* Session history (optional)

---

# DATA SUPPORT REQUIREMENTS

Support (priority order):

1. Ball-by-ball data (preferred)
2. Scorecard/innings summary data (fallback)
3. Synthetic sample demo dataset (mandatory fallback so app always runs locally)

---

# NORMALIZATION & ROBUSTNESS (MANDATORY)

Implement:

* Role-aware normalization
* Format-aware normalization
* Outlier clipping / winsorization
* Minimum participation thresholds
* Confidence flags for sparse data
* Missing-feature fallback logic
* Clear assumptions in output

Scale behavior:

* 0–100 final IM
* 50 neutral baseline
* > 50 above expected impact
* <50 below expected impact

---

# EXPLAINABILITY (MANDATORY FOR BOTH FEATURES)

Every score and recommendation must include human-readable reasons.

### Examples

* “High impact due to strong strike rate in death overs under high chase pressure.”
* “Recommended bowler because left-arm pace on this pitch and batter weakness vs short-of-length pace in middle overs.”
* “Confidence reduced due to limited matchup history.”

### Must include

* Contribution breakdown
* Top drivers
* Risks / uncertainty
* Confidence score

---

# UI/UX DESIGN SYSTEM REQUIREMENTS (MAKE IT UNIQUE & ATTRACTIVE)

Design a premium cricket intelligence aesthetic:

## Visual identity

* Modern sports analytics dashboard style
* Dark theme primary + optional light theme
* Accent colors inspired by cricket broadcast tech overlays (not generic neon overload)
* Glassmorphism / gradient cards used tastefully
* Clean typography hierarchy
* Rounded cards + subtle shadows
* Motion/micro-interactions for engagement

## UX quality

* Step-based forms for complex inputs
* Clear labels and helper text
* Smart defaults (last 10 innings, T20, sample tournament)
* Loading states/skeletons
* Empty states
* Validation messages
* Export/share options
* Mobile responsiveness without clutter

## UI uniqueness ideas (implement at least a few)

* Animated Impact Meter with neutral marker at 50
* Live “Pressure Pulse” widget
* Tactical recommendation cards with confidence ring
* What-if scenario toggles
* Hover tooltips explaining metrics
* Timeline/story mode for innings impact evolution

---

# API DESIGN (MINIMUM ENDPOINTS)

Implement and document endpoints such as:

* *POST /api/impact/calculate*
* *POST /api/impact/batch*
* *GET /api/player/:id/impact-history*
* *POST /api/live/recommend*
* *GET /api/players/search*
* *GET /api/venues*
* *GET /api/config/weights*
* *POST /api/data/upload* (optional)
* *GET /api/session/history* (optional)

Return JSON containing:

* score(s)
* breakdown
* reasons
* confidence
* warnings/assumptions
* metadata
* debug fields (optional in dev mode)

---

# TECH STACK (PREFERRED, BUT YOU MAY CHOOSE EQUIVALENT)

Choose a practical, hackathon-feasible stack and build cleanly.

### Preferred stack

* *Frontend:* React + TypeScript + Tailwind + chart library
* *Backend:* FastAPI (preferred) or Node.js Express/NestJS
* *Analytics engine:* Python (Pandas/Numpy/Scikit-learn) preferred
* *Database:* PostgreSQL (SQLite okay for MVP demo)
* *Caching:* Redis (optional)
* *Charts:* Recharts / Plotly / Chart.js

If using React + FastAPI hybrid:

* Keep clean folder separation
* Define clear API contracts
* Provide local setup instructions

---

# DELIVERABLES (MANDATORY)

Provide all of the following:

1. Finalized product understanding
2. Assumptions
3. Full *UI flow map* (Landing → Dashboard → Module pages → Results → Export/Save)
4. High-level architecture
5. Folder structure (frontend + backend)
6. Database schema / models
7. Feature engineering design
8. Impact metric engine implementation
9. Tactical recommendation engine implementation
10. API contracts (request/response examples)
11. Frontend pages + component structure
12. Sample dataset / seed data format
13. Validation and test cases
14. Edge-case handling
15. README setup instructions
16. Demo usage flow (judge demo script)
17. Future improvements / scalability notes

---

# QUALITY RULES

* Build MVP first, then advanced enhancements
* Production-style but hackathon-feasible
* Modular and readable code
* Clear comments and naming
* Validate all user inputs
* Graceful handling of missing/sparse data
* Configurable weights
* Explainable outputs > black-box outputs
* Include sample data so app runs locally end-to-end

---

# OUTPUT FORMAT (STRICT)

Respond in this exact sequence:

1. *Product understanding (brief)*
2. *Assumptions*
3. *Complete UI/UX flow (from Landing Page to end actions)*
4. *Information architecture / navigation map*
5. *Visual design system and UI styling direction*
6. *Tech stack choice and justification*
7. *System architecture (text diagram)*
8. *Database schema / models*
9. *Feature 1: Impact Metric engine design*
10. *Feature 2: Live Tactical recommendation engine design*
11. *API contracts (with sample JSON requests/responses)*
12. *Frontend page structure and component tree*
13. *Step-by-step implementation plan (MVP → advanced)*
14. *Backend code (MVP working version)*
15. *Frontend code (MVP working version)*
16. *Sample data + test cases*
17. *README + setup guide*
18. *Hackathon demo script / pitch points*
19. *Future enhancements*

If anything is ambiguous, make strong reasonable assumptions and continue without stopping.
Prioritize a working, polished end-to-end flow over over-engineering.