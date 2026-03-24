# Selway Intelligence Platform — Design Spec

## 1. Purpose

A competitive intelligence platform for Selway Machine Tool that aggregates buying signals from 6 public data sources, scores leads, assigns them to territory reps, and delivers actionable intelligence via a live dashboard and 3x daily email digests. No CNC dealer on the West Coast has anything like this.

## 2. Architecture

**Stack:** Cloudflare Workers + D1 + GitHub Pages + Resend

- **Data Collection:** Single Cloudflare Worker with 3 Cron Triggers (6:00 AM, 12:00 PM, 5:00 PM Pacific). Each trigger dispatches all 6 collectors sequentially within one invocation. Requires Workers Paid plan ($5/month) for 50ms CPU time limit — free tier's 10ms is insufficient for scraping + processing.
- **Processing:** Intelligence Engine runs after collection — deduplication, lead scoring (HOT/WARM/COOL), territory assignment, multi-signal correlation, competitor identification
- **Storage:** Cloudflare D1 (SQLite) — tables: `companies`, `signals`, `leads`, `lead_signals`, `ucc_filings`, `competitors`, `refresh_log`
- **Frontend:** Static site on GitHub Pages, fetches data from Workers REST API
- **Email:** Resend free tier (100 emails/day) — digest sent after each refresh cycle to jonnymadden21@cloud.com, with one retry on failure
- **Authentication:** All API endpoints require an API key header (`X-API-Key`), stored as a Cloudflare Worker secret. Frontend includes the key in requests.
- **Cost:** ~$5/month (Workers Paid plan)

### Upgrade Path

Frontend and Workers API are decoupled. To upgrade to Approach A (hosted web app), swap GitHub Pages for Vercel/Railway and D1 for Postgres. No frontend rewrite needed.

## 3. Data Sources

### 3.1 UCC Filings (CRITICAL)

Competitor purchase tracking via state Secretary of State UCC-1 financing statements.

**Oregon:** Bulk data via data.oregon.gov API — monthly UCC dumps, filter by competitor secured party names.

**CA, WA, UT, NV:** These states have bot protection (CAPTCHAs, Incapsula). Implementation approach:
- Semi-automated workflow for MVP: Worker generates pre-filled search URLs for each state + competitor name combo. User opens links, completes CAPTCHA, and pastes results into a simple upload form on the dashboard. Worker parses and stores the filings.
- Future: Investigate official state bulk data access programs or paid API services as they become available.
- Monthly cadence: 5 states × 12 competitor names = ~60 searches/month (manageable manually)

**Competitor lender names to search:**
Mazak Corporation, DMG MORI Finance, Okuma Credit Corporation, Doosan Industrial Vehicle, DN Solutions, Makino Inc, Matsuura Machinery, Kitamura Machinery, Toyoda Americas, Methods Machine Tools, Ellison Technologies, Hurco Companies

**Search cadence:** Weekly minimum, daily for Oregon bulk data

### 3.2 Job Postings (HIGH)

CNC hiring signals indicating shop growth and machine demand.

**Sources (in priority order):**
- SerpAPI Google Jobs (free tier: 100 searches/month) — aggregates Indeed, LinkedIn, ZipRecruiter, Glassdoor into one structured API
- State workforce agency boards: WorkSource (OR/WA), CalJOBS (CA), jobs.utah.gov, EmployNV — these are public and scrapeable
- Niche manufacturing job boards with RSS feeds

**Keywords:** "CNC Operator", "CNC Machinist", "CNC Programmer", "5-axis", "VMC Operator", "turning center"
**Geography:** OR, WA, CA, UT, NV
**Method:** SerpAPI for aggregated results + direct scraping of state workforce boards. No direct scraping of Indeed/LinkedIn (TOS violation).
**Cadence:** Daily

### 3.3 Defense Contracts (HIGH)

Contract awards revealing which manufacturers are winning work requiring CNC capacity.

**Source:** defense.gov/News/Contracts — daily structured feed
**Filter:** Awards mentioning manufacturing, machining, fabrication, or companies in Selway's 5 states
**Method:** RSS/HTML parsing of daily contract announcements
**Cadence:** Daily

### 3.4 News & Industry (MEDIUM-HIGH)

Market intelligence from trade publications, tariff updates, reshoring news.

**Sources:**
- Google News RSS feeds (`news.google.com/rss/search?q=...`) — filtered for CNC, machine tool, manufacturing + state names. Free, no API key needed.
- Manufacturing trade pub RSS: Modern Machine Shop, American Machinist, Production Machining, Manufacturing Engineering
- AMT USMTO report summaries
- Tariff/reshoring news feeds
- NewsAPI.org (free tier: 100 requests/day, 1-day delay) as supplementary source

**Method:** RSS parsing of Google News feeds + trade pub feeds. NewsAPI as backup.
**Cadence:** Daily

### 3.5 Building Permits & Facility Expansions (MEDIUM-HIGH)

New and expanding manufacturing facilities.

**Sources — scoped to top manufacturing counties:**
- **Oregon:** Multnomah, Washington, Clackamas, Lane counties
- **Washington:** King, Snohomish, Pierce, Clark counties
- **California:** Los Angeles, Santa Clara, Orange, San Diego, Sacramento counties
- **Utah:** Salt Lake, Utah, Davis counties
- **Nevada:** Clark, Washoe counties
- State economic development agency press releases (Business Oregon, WA Commerce, CA GO-Biz, etc.)
- Construction industry RSS: Construction Dive, ENR, local business journals (Portland Business Journal, Puget Sound Business Journal, etc.)

**Method:** RSS feeds from construction news, Google News RSS filtered for "manufacturing facility" + state, scraping of county permit portals where structured data is available
**Cadence:** Weekly

### 3.6 Used Machine Marketplaces (MEDIUM)

Shops selling competitor machines — likely buying replacements.

**Sources:** Machinio.com, CNCMachines.com, MachineStation
**Filter:** Competitor brands (Mazak, Okuma, DMG MORI, Doosan, Makino) located in OR, WA, CA, UT, NV
**Method:** Structured listing scraping — Machinio has parseable data
**Cadence:** Daily

## 4. Database Schema

### companies
- `id` — primary key
- `name` — company name (deduped)
- `address` — full address
- `city`, `state`, `zip`
- `territory` — assigned Selway territory (1-6)
- `is_customer` — boolean, existing Selway customer
- `first_seen` — date first detected
- `signal_count` — total signals associated
- `heat_score` — computed HOT/WARM/COOL

### signals
- `id` — primary key
- `company_id` — FK to companies
- `source` — enum: ucc, job, defense, news, permit, marketplace
- `title` — signal headline
- `detail` — full detail text
- `url` — source URL
- `heat` — HOT/WARM/COOL
- `territory` — territory number
- `discovered_at` — timestamp
- `refresh_cycle` — morning/noon/afternoon
- `is_new` — boolean, new since last digest

### leads
- `id` — primary key
- `company_id` — FK to companies
- `status` — enum: new, contacted, engaged, quoted, won, lost
- `assigned_rep` — rep name
- *(signals linked via `lead_signals` junction table)*
- `score` — numeric score based on multi-signal correlation
- `notes` — rep notes
- `created_at`, `updated_at`

### ucc_filings
- `id` — primary key
- `company_id` — FK to companies
- `state` — filing state
- `file_number` — state file number
- `filing_date` — date filed
- `lapse_date` — expiration date
- `secured_party` — lender/manufacturer name
- `collateral_description` — equipment description from filing
- `is_competitor` — boolean, matched against competitor lender list

### competitors
- `id` — primary key
- `name` — competitor name
- `headquarters` — location
- `sales_model` — direct/dealer/hybrid
- `strengths`, `weaknesses` — text
- `displacement_strategy` — how to sell against them
- `lender_names` — names as they appear in UCC filings

### refresh_log
- `id` — primary key
- `cycle` — morning/noon/afternoon
- `started_at`, `completed_at`
- `source` — which collector ran
- `signals_found` — count of new signals
- `errors` — any errors encountered

### lead_signals (junction table)
- `lead_id` — FK to leads
- `signal_id` — FK to signals
- Primary key: (`lead_id`, `signal_id`)

## 5. Lead Scoring

**HOT (score 80-100):**
- Confirmed competitor machine purchase (UCC filing with competitor secured party)
- Major facility expansion with confirmed CNC component
- Multiple corroborating signals (UCC + job posting + permit)

**WARM (score 40-79):**
- Job posting for CNC positions
- General equipment financing (non-competitor UCC)
- Used machine listing on marketplace
- Facility expansion in CNC-adjacent industry
- Defense contract award to company in territory

**COOL (score 1-39):**
- Single news signal without corroboration
- Social media mention
- General industry trend data

**Multi-signal bonus:** Each additional signal type for the same company adds +15 to score. A company with UCC filing (80) + job posting (+15) + building permit (+15) = 110, capped at 100.

## 6. Territory Assignment

Automatic based on company state + county/ZIP matching to Selway's 6 territories:
- **Territory 1:** Oregon (all counties)
- **Territory 2:** Washington (all counties)
- **Territory 3:** Northern California — counties north of and including Monterey, Kings, Tulare, Inyo (ZIP prefixes 93600-93999 and below are SoCal, 94000+ are NorCal)
- **Territory 4:** Southern California — counties south of and including San Luis Obispo, Kern, San Bernardino (ZIP prefixes 900xx-935xx)
- **Territory 5:** Utah (all counties)
- **Territory 6:** Nevada (all counties)

Boundary rule: Assignment uses state first, then ZIP prefix for California split. If ZIP is unavailable, default to NorCal and flag for manual review.

## 7. Frontend — Dashboard

**Tech:** Static HTML/CSS/JS on GitHub Pages. No framework — vanilla JS with fetch calls to Workers API. Matches the ROI calculator deployment pattern.

**Design:** Clean light professional theme. Selway teal (#008C9A) primary accent, white cards, Inter font, subtle shadows. Not a generic AI look — polished SaaS-quality interface.

**5 tabs:**

### Dashboard (home)
- 5 stat cards: Total Signals, Hot Leads, UCC Filings, Job Postings, News/Permits — each with daily change indicator
- Territory filter bar (All, OR/WA, N.CA, S.CA, UT/NV) + Export button
- Live Signal Feed (main panel) — chronological feed of all signals with company, detail, source tag, territory, heat badge
- Right sidebar: Latest UCC Conquest Targets, Lead Pipeline mini-view (5-stage funnel with counts), Signals by Territory breakdown

### UCC Scanner
- 5 state database links with status indicators
- Competitor lender search list (12 names)
- Filing log — all UCC filings with company, state, file number, secured party, filing date, competitor match flag
- Filter by state, competitor, date range

### Lead Pipeline
- 6-stage Kanban: New → Contacted → Engaged → Quoted → Won → Lost
- Each lead card shows: company name, territory, heat score, signal sources, assigned rep
- Click to expand: full signal history, notes, action plan
- Drag to advance stage (or button-based for simplicity)

### Market Signals
- Filterable table of all signals across all sources
- Filter by: source type, territory, heat level, date range
- One-click "Convert to Lead" action on any signal
- Bulk actions for export

### Competitors
- 5 primary competitor profiles: Mazak, DMG MORI, Okuma, Doosan/DN Solutions, Makino — full profiles with strengths, weaknesses, displacement strategy, which Haas/Selway machines to pitch against
- 7 additional tracked competitors (Matsuura, Kitamura, Toyoda, Methods, Ellison, Hurco, Makino) — UCC tracking only, no full profiles
- UCC filing activity per competitor (count of recent filings)

## 8. Email Digest

**Frequency:** 3x daily — after each refresh cycle completes (approximately 6:15 AM, 12:15 PM, 5:15 PM PT)

**Recipient:** jonnymadden21@cloud.com (expandable to per-rep filtered digests later)

**Format:** Clean HTML email with:
- Cycle summary: "Morning Refresh — 8 new signals found"
- Hot leads section (if any) with company, signal type, territory
- New UCC filings section (if any)
- Signal count by source type
- Link to full dashboard

**Provider:** Resend (free tier: 100 emails/day, 3,000/month)

## 9. API Endpoints (Workers)

All endpoints served from Cloudflare Workers. Every endpoint requires `X-API-Key` header matching the Worker secret. Requests without a valid key receive 401 Unauthorized.

- `GET /api/signals` — list signals, filterable by source, territory, heat, date
- `GET /api/signals/:id` — single signal detail
- `GET /api/leads` — list leads, filterable by status, territory, score
- `POST /api/leads` — create lead from signal
- `PATCH /api/leads/:id` — update lead status/notes
- `GET /api/ucc` — list UCC filings, filterable by state, competitor
- `GET /api/stats` — dashboard summary stats
- `GET /api/competitors` — competitor profiles
- `GET /api/refresh-log` — recent refresh history
- `POST /api/refresh/:source` — manually trigger a source refresh (rate limited: max 1 per source per hour)

## 10. Project Structure

```
selway-intelligence/
├── frontend/                  # GitHub Pages static site
│   ├── index.html
│   ├── styles.css
│   ├── app.js                 # Main app logic + routing
│   ├── api.js                 # Workers API client
│   └── components/            # Tab-specific JS modules
│       ├── dashboard.js
│       ├── ucc-scanner.js
│       ├── pipeline.js
│       ├── signals.js
│       └── competitors.js
├── workers/                   # Cloudflare Workers
│   ├── wrangler.toml          # Cloudflare config
│   ├── src/
│   │   ├── index.ts           # Main API router
│   │   ├── collectors/        # Data source scrapers
│   │   │   ├── ucc.ts
│   │   │   ├── jobs.ts
│   │   │   ├── defense.ts
│   │   │   ├── news.ts
│   │   │   ├── permits.ts
│   │   │   └── marketplace.ts
│   │   ├── engine/            # Processing logic
│   │   │   ├── scorer.ts
│   │   │   ├── dedup.ts
│   │   │   ├── territory.ts
│   │   │   └── correlator.ts
│   │   ├── email/
│   │   │   └── digest.ts
│   │   └── db/
│   │       ├── schema.sql
│   │       └── queries.ts
│   └── package.json
└── README.md
```

## 11. Deployment

- **Frontend:** Push to GitHub repo → auto-deploy to GitHub Pages (same as ROI calculators)
- **Workers:** `wrangler deploy` from workers/ directory → deploys to Cloudflare edge
- **Database:** D1 created via `wrangler d1 create selway-intel` → schema applied via migration
- **Cron:** Configured in wrangler.toml in UTC. Set to `0 14 * * *`, `0 20 * * *`, `0 1 * * *` (6am/12pm/5pm PT during PST). Needs manual adjustment for DST: shift 1 hour back in March, forward in November. Document both sets of UTC times in wrangler.toml comments.
- **Email:** Resend API key stored as Cloudflare Worker secret

## 12. Accounts Needed

- **Cloudflare:** Workers Paid plan ($5/month) for Workers, D1, Cron Triggers
- **Resend:** Free account for email delivery (resend.com)
- **GitHub:** Already set up (Jonnymadden21) — new repo for this project
