# Selway Intelligence Platform — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a competitive intelligence platform that scrapes 6 data sources 3x daily, scores leads, and presents them in a polished dashboard with email digests.

**Architecture:** Cloudflare Workers (single worker, 3 cron triggers) + D1 database for backend. Static vanilla JS frontend on GitHub Pages. Resend for email digests. All API endpoints authenticated via X-API-Key header.

**Tech Stack:** TypeScript (Workers), vanilla HTML/CSS/JS (frontend), Cloudflare D1 (SQLite), Resend (email), SerpAPI (jobs), Google News RSS, wrangler CLI.

**Spec:** `docs/superpowers/specs/2026-03-24-selway-intelligence-platform-design.md`

---

## Phase 1: Foundation — Repo, Tooling, Database, Deploy Skeleton

### Task 1: Create GitHub Repo & Project Structure

**Files:**
- Create: `selway-intelligence/frontend/index.html`
- Create: `selway-intelligence/frontend/styles.css`
- Create: `selway-intelligence/frontend/app.js`
- Create: `selway-intelligence/frontend/api.js`
- Create: `selway-intelligence/workers/package.json`
- Create: `selway-intelligence/workers/wrangler.toml`
- Create: `selway-intelligence/workers/src/index.ts`
- Create: `selway-intelligence/workers/tsconfig.json`

- [ ] **Step 1: Create new GitHub repo**

```bash
cd /Users/madden
mkdir selway-intelligence && cd selway-intelligence
git init
gh repo create Jonnymadden21/selway-intelligence --public --source=. --push
```

- [ ] **Step 2: Create frontend skeleton**

Create `frontend/index.html` — minimal HTML shell with Selway branding, Inter font import, nav bar with 5 tabs, empty content area. Include the teal (#008C9A) theme.

Create `frontend/styles.css` — full stylesheet matching the approved dashboard mockup design (clean light professional, white cards, Selway teal accent, Inter font, stat cards, signal feed, pipeline, territory list).

Create `frontend/app.js` — tab router (hash-based: `#dashboard`, `#ucc`, `#pipeline`, `#signals`, `#competitors`), renders placeholder content per tab.

Create `frontend/api.js` — API client module with `API_BASE` constant and `fetchAPI(endpoint)` helper that adds X-API-Key header. Export functions: `getStats()`, `getSignals(filters)`, `getLeads(filters)`, `getUCC(filters)`, `getCompetitors()`, `createLead(signalId)`, `updateLead(id, data)`, `getRefreshLog()`.

- [ ] **Step 3: Create workers skeleton**

Create `workers/package.json`:
```json
{
  "name": "selway-intelligence-worker",
  "private": true,
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy",
    "test": "vitest"
  },
  "devDependencies": {
    "wrangler": "^4.0.0",
    "vitest": "^3.0.0",
    "@cloudflare/workers-types": "^4.0.0",
    "typescript": "^5.0.0"
  },
  "dependencies": {
    "resend": "^4.0.0"
  }
}
```

Create `workers/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "types": ["@cloudflare/workers-types"],
    "strict": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

Create `workers/wrangler.toml`:
```toml
name = "selway-intelligence"
main = "src/index.ts"
compatibility_date = "2024-01-01"

# Cron triggers: 6am, 12pm, 5pm Pacific
# PST (Nov-Mar): UTC-8 → 14:00, 20:00, 01:00+1
# PDT (Mar-Nov): UTC-7 → 13:00, 19:00, 00:00+1
# Current: PDT
[triggers]
crons = ["0 13 * * *", "0 19 * * *", "0 0 * * *"]

[[d1_databases]]
binding = "DB"
database_name = "selway-intel"
database_id = "" # filled after wrangler d1 create

[vars]
FRONTEND_URL = "https://jonnymadden21.github.io/selway-intelligence"
```

Create `workers/src/index.ts` — minimal worker that handles `fetch` and `scheduled` events. Fetch handler: CORS middleware + API key auth check + route dispatch. Returns 401 if missing/invalid key. Scheduled handler: placeholder that logs which cron fired.

- [ ] **Step 4: Commit and deploy frontend to GitHub Pages**

```bash
cd /Users/madden/selway-intelligence
git add -A
git commit -m "feat: initial project structure with frontend shell and workers config"
git push origin main
# Enable GitHub Pages from frontend/ directory
gh api repos/Jonnymadden21/selway-intelligence/pages -X POST -f source.branch=main -f source.path=/frontend
```

Verify: `https://jonnymadden21.github.io/selway-intelligence/` loads the shell.

---

### Task 2: Set Up Cloudflare Workers + D1 Database

**Files:**
- Create: `workers/src/db/schema.sql`
- Create: `workers/src/db/seed.sql`
- Modify: `workers/wrangler.toml` (add D1 database_id)

- [ ] **Step 1: Install wrangler and authenticate**

```bash
cd /Users/madden/selway-intelligence/workers
npm install
```

Then user runs: `! npx wrangler login` (opens browser for Cloudflare OAuth)

- [ ] **Step 2: Create D1 database**

```bash
cd /Users/madden/selway-intelligence/workers
npx wrangler d1 create selway-intel
```

Copy the returned `database_id` into `wrangler.toml`.

- [ ] **Step 3: Write database schema**

Create `workers/src/db/schema.sql`:
```sql
-- Companies
CREATE TABLE IF NOT EXISTS companies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  territory INTEGER CHECK(territory BETWEEN 1 AND 6),
  is_customer INTEGER DEFAULT 0,
  first_seen TEXT DEFAULT (datetime('now')),
  signal_count INTEGER DEFAULT 0,
  heat_score TEXT DEFAULT 'COOL'
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_name_state ON companies(name, state);

-- Signals
CREATE TABLE IF NOT EXISTS signals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER REFERENCES companies(id),
  source TEXT NOT NULL CHECK(source IN ('ucc','job','defense','news','permit','marketplace')),
  title TEXT NOT NULL,
  detail TEXT,
  url TEXT,
  heat TEXT DEFAULT 'COOL' CHECK(heat IN ('HOT','WARM','COOL')),
  territory INTEGER,
  discovered_at TEXT DEFAULT (datetime('now')),
  refresh_cycle TEXT CHECK(refresh_cycle IN ('morning','noon','afternoon')),
  is_new INTEGER DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_signals_source ON signals(source);
CREATE INDEX IF NOT EXISTS idx_signals_territory ON signals(territory);
CREATE INDEX IF NOT EXISTS idx_signals_heat ON signals(heat);
CREATE INDEX IF NOT EXISTS idx_signals_discovered ON signals(discovered_at);

-- Leads
CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER REFERENCES companies(id),
  status TEXT DEFAULT 'new' CHECK(status IN ('new','contacted','engaged','quoted','won','lost')),
  assigned_rep TEXT,
  score INTEGER DEFAULT 0,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_territory ON leads(company_id);

-- Lead-Signal junction
CREATE TABLE IF NOT EXISTS lead_signals (
  lead_id INTEGER REFERENCES leads(id),
  signal_id INTEGER REFERENCES signals(id),
  PRIMARY KEY (lead_id, signal_id)
);

-- UCC Filings
CREATE TABLE IF NOT EXISTS ucc_filings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER REFERENCES companies(id),
  state TEXT NOT NULL,
  file_number TEXT,
  filing_date TEXT,
  lapse_date TEXT,
  secured_party TEXT,
  collateral_description TEXT,
  is_competitor INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_ucc_state ON ucc_filings(state);
CREATE INDEX IF NOT EXISTS idx_ucc_secured ON ucc_filings(secured_party);

-- Competitors
CREATE TABLE IF NOT EXISTS competitors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  headquarters TEXT,
  sales_model TEXT,
  strengths TEXT,
  weaknesses TEXT,
  displacement_strategy TEXT,
  lender_names TEXT
);

-- Refresh Log
CREATE TABLE IF NOT EXISTS refresh_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cycle TEXT CHECK(cycle IN ('morning','noon','afternoon')),
  started_at TEXT DEFAULT (datetime('now')),
  completed_at TEXT,
  source TEXT,
  signals_found INTEGER DEFAULT 0,
  errors TEXT
);
```

- [ ] **Step 4: Write seed data**

Create `workers/src/db/seed.sql` — insert the 5 primary competitor profiles (Mazak, DMG MORI, Okuma, Doosan/DN Solutions, Makino) with full displacement strategies and lender names. Also insert the 7 additional tracked competitors (Matsuura, Kitamura, Toyoda, Methods, Ellison, Hurco) with lender names only.

Seed with the confirmed prototype data:
- Stubborn Mule Manufacturing UCC filing (Mazak, Grants Pass OR)
- Custom Machine Works LLC UCC filing (Clackamas OR)
- Covert Engineers Inc UCC filing (Beaverton OR)
- The 46 job postings from the prototype
- The 17 building permits from the prototype
- The 20 new/expanding shop prospects

For competitor seed: 5 primary competitors with full profiles (Mazak, DMG MORI, Okuma, Doosan/DN Solutions, Makino). 6 additional tracked competitors for UCC-only tracking (Matsuura, Kitamura, Toyoda, Methods, Ellison, Hurco) — note: Makino appears in both primary and the original spec's "7 additional" list, so the actual additional count is 6, not 7.

- [ ] **Step 5: Apply schema and seed to D1**

```bash
cd /Users/madden/selway-intelligence/workers
npx wrangler d1 execute selway-intel --file=src/db/schema.sql --remote
npx wrangler d1 execute selway-intel --file=src/db/seed.sql --remote
```

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: D1 database schema and seed data with prototype intel"
```

---

### Task 3: Workers API Router + Auth + CORS

**Files:**
- Modify: `workers/src/index.ts` (full implementation)
- Create: `workers/src/middleware.ts`
- Create: `workers/src/routes/signals.ts`
- Create: `workers/src/routes/leads.ts`
- Create: `workers/src/routes/ucc.ts`
- Create: `workers/src/routes/stats.ts`
- Create: `workers/src/routes/competitors.ts`
- Create: `workers/src/routes/refresh.ts`

- [ ] **Step 1: Write auth + CORS middleware**

Create `workers/src/middleware.ts`:
- `corsHeaders(origin)` — returns CORS headers allowing the GitHub Pages frontend origin
- `authCheck(request, env)` — checks `X-API-Key` header against `env.API_KEY` secret. Returns 401 response if invalid, null if valid.
- `jsonResponse(data, status)` — helper to return JSON with CORS headers

- [ ] **Step 2: Write route handlers**

Each route file exports handler functions that take `(request, env)` and return a Response.

`routes/stats.ts` — `GET /api/stats`: query D1 for counts of signals (total, today, by source), leads by status, UCC filings, signals by territory. Return summary object.

`routes/signals.ts` — `GET /api/signals`: query signals table with optional filters (source, territory, heat, date range via query params). Join with companies for name. Paginate (limit 50, offset param). `GET /api/signals/:id`: single signal with company details.

`routes/leads.ts` — `GET /api/leads`: query leads joined with companies, filterable by status/territory/score. `POST /api/leads`: create lead from signal_id, auto-populate company_id from signal, insert lead_signals row. `PATCH /api/leads/:id`: update status, notes, assigned_rep, set updated_at.

`routes/ucc.ts` — `GET /api/ucc`: query ucc_filings joined with companies, filterable by state, secured_party, is_competitor, date range.

`routes/competitors.ts` — `GET /api/competitors`: return all competitor profiles.

`routes/refresh.ts` — `GET /api/refresh-log`: return last 20 refresh logs. `POST /api/refresh/:source`: rate limit check (1/hour/source via D1 query on refresh_log), then trigger collector for given source. Handle special value `source=all` to run all 6 collectors sequentially (same as cron handler) — rate limited to 1/hour.

`routes/ucc.ts` — also add `POST /api/ucc/upload`: accepts JSON body with pasted UCC filing data from non-Oregon states (company name, state, file number, filing date, secured party, collateral description). Parses, validates, runs competitor name matching, upserts company, inserts signal + ucc_filing record. Returns count of filings imported. This powers the semi-manual upload form on the UCC Scanner tab.

- [ ] **Step 3: Wire up main router**

Modify `workers/src/index.ts`:
- Parse URL pathname
- Match against routes: `/api/stats`, `/api/signals`, `/api/leads`, `/api/ucc`, `/api/competitors`, `/api/refresh-log`, `/api/refresh/:source`
- Handle OPTIONS preflight requests
- Run auth middleware on all routes
- 404 for unknown routes

- [ ] **Step 4: Set API key secret and deploy**

```bash
cd /Users/madden/selway-intelligence/workers
# Generate a random API key
echo "API_KEY=$(openssl rand -hex 32)"
# Set it as a secret
npx wrangler secret put API_KEY
# Deploy
npx wrangler deploy
```

Note the deployed worker URL (e.g., `selway-intelligence.{account}.workers.dev`).

- [ ] **Step 5: Update frontend API client with worker URL and key**

Modify `frontend/api.js`: set `API_BASE` to the deployed worker URL. Set `API_KEY` to the generated key.

Note: API key in frontend JS is visible to anyone who views source. This is acceptable for MVP — it prevents casual discovery but not determined access. Future upgrade: add Cloudflare Access or proper auth.

- [ ] **Step 6: Test API endpoints**

```bash
# Test stats endpoint
curl -H "X-API-Key: <key>" https://selway-intelligence.<account>.workers.dev/api/stats
# Test signals
curl -H "X-API-Key: <key>" https://selway-intelligence.<account>.workers.dev/api/signals
# Test without key (should 401)
curl https://selway-intelligence.<account>.workers.dev/api/stats
```

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: Workers API router with auth, CORS, and all route handlers"
```

---

## Phase 2: Frontend Dashboard

### Task 4: Dashboard Tab — Stats, Signal Feed, Sidebar

**Files:**
- Create: `frontend/components/dashboard.js`
- Modify: `frontend/index.html` (flesh out structure)
- Modify: `frontend/styles.css` (add dashboard-specific styles)
- Modify: `frontend/app.js` (wire up dashboard component)

- [ ] **Step 1: Build dashboard component**

Create `frontend/components/dashboard.js` — exports `renderDashboard(container)` function:

1. Fetch `/api/stats` and `/api/signals?limit=20` in parallel
2. Render 5 stat cards row (Total Signals, Hot Leads, UCC Filings, Job Postings, News/Permits) with daily change indicators
3. Render territory filter bar
4. Render main signal feed (left panel) — each signal shows: icon by source type, company name, detail text, heat badge (HOT red / WARM amber / COOL blue), source tag, territory badge, relative time
5. Render right sidebar: UCC conquest targets (fetch `/api/ucc?is_competitor=1&limit=5`), lead pipeline mini (fetch `/api/leads` and count by status), signals by territory breakdown
6. Wire up territory filter to re-fetch with territory param

All styles match the approved dashboard-layout.html mockup exactly: white cards, Selway teal (#008C9A) accent, Inter font, subtle box-shadow, colored stat card top borders, heat badge colors.

- [ ] **Step 2: Wire up to app.js and test**

Modify `app.js` to import and call `renderDashboard()` when on `#dashboard` or default route. Deploy to GitHub Pages and verify it loads real data from the Workers API.

- [ ] **Step 3: Commit**

```bash
git add frontend/ && git commit -m "feat: dashboard tab with stats, signal feed, and sidebar"
```

---

### Task 5: UCC Scanner Tab

**Files:**
- Create: `frontend/components/ucc-scanner.js`

- [ ] **Step 1: Build UCC scanner component**

Exports `renderUCCScanner(container)`:

1. State database links section — 5 cards (OR, WA, CA, UT, NV) each with:
   - State name and Secretary of State URL (clickable)
   - Status indicator (green = automated, yellow = semi-manual)
   - Last scan date from refresh_log
2. Competitor lender search list — 12 names in a grid, each clickable to filter the filing log
3. Filing log table — fetch `/api/ucc`, display: company name, city/state, file number, filing date, secured party, competitor match badge
4. Filter bar: state dropdown, competitor dropdown, date range
5. Manual UCC upload form — textarea for pasting filing data from non-Oregon states, parse button that sends to a POST endpoint

- [ ] **Step 2: Commit**

```bash
git add frontend/ && git commit -m "feat: UCC scanner tab with filing log and upload form"
```

---

### Task 6: Lead Pipeline Tab

**Files:**
- Create: `frontend/components/pipeline.js`

- [ ] **Step 1: Build pipeline component**

Exports `renderPipeline(container)`:

1. 6-column layout: New, Contacted, Engaged, Quoted, Won, Lost
2. Each column header shows count and column color
3. Lead cards within columns: company name, territory badge, heat score bar, source icons (which data sources contributed), assigned rep name
4. Click card → expand inline showing: full signal history, notes textarea, rep assignment dropdown, status change buttons (advance/regress)
5. "Convert to Lead" button creates a new lead via `POST /api/leads`
6. Status changes via `PATCH /api/leads/:id`
7. Button-based stage advancement (not drag — simpler for MVP)

- [ ] **Step 2: Commit**

```bash
git add frontend/ && git commit -m "feat: lead pipeline tab with status management"
```

---

### Task 7: Market Signals Tab

**Files:**
- Create: `frontend/components/signals.js`

- [ ] **Step 1: Build signals component**

Exports `renderSignals(container)`:

1. Filter bar: source type checkboxes (UCC, Job, Defense, News, Permit, Marketplace), territory dropdown, heat dropdown, date range picker
2. Results table: company name, signal title, source tag, heat badge, territory, discovered date, action button
3. Action column: "Convert to Lead" button per row (calls `POST /api/leads`)
4. Pagination (50 per page)
5. Export button — generates CSV of current filtered results (client-side)
6. Bulk select checkboxes + bulk "Convert to Leads" action

- [ ] **Step 2: Commit**

```bash
git add frontend/ && git commit -m "feat: market signals tab with filters and lead conversion"
```

---

### Task 8: Competitors Tab

**Files:**
- Create: `frontend/components/competitors.js`

- [ ] **Step 1: Build competitors component**

Exports `renderCompetitors(container)`:

1. Fetch `/api/competitors`
2. 5 primary competitor cards (Mazak, DMG MORI, Okuma, Doosan/DN, Makino) — each shows:
   - Company name, HQ, sales model
   - Strengths (green list), Weaknesses (red list)
   - Displacement strategy (teal highlighted box) — which Haas/Selway machines to pitch
   - UCC activity count (number of recent filings for this competitor's lender names)
3. Section below: "Additional Tracked Competitors" — simple table of 7 names with lender name aliases and UCC filing counts
4. Each competitor card links to UCC Scanner filtered by that competitor

- [ ] **Step 2: Commit**

```bash
git add frontend/ && git commit -m "feat: competitors tab with profiles and displacement strategies"
```

---

## Phase 3: Data Collectors

### Task 9: Oregon UCC Collector

**Files:**
- Create: `workers/src/collectors/ucc.ts`
- Create: `workers/src/engine/territory.ts`
- Create: `workers/src/db/queries.ts`

- [ ] **Step 1: Write territory assignment logic**

Create `workers/src/engine/territory.ts`:
- `assignTerritory(state: string, zip?: string): number` — returns territory 1-6
- OR → 1, WA → 2, UT → 5, NV → 6
- CA: ZIP in range 90000-93599 → 4 (SoCal), ZIP >= 94000 → 3 (NorCal)
- If CA with no ZIP → 3 (default NorCal, flagged for manual review)

- [ ] **Step 2: Write DB query helpers**

Create `workers/src/db/queries.ts`:
- `upsertCompany(db, company)` — INSERT OR IGNORE on (name, state), return id
- `insertSignal(db, signal)` — insert signal, return id
- `insertUCCFiling(db, filing)` — insert UCC record
- `updateCompanyHeat(db, companyId)` — recalculate heat score based on all signals
- `logRefresh(db, cycle, source, count, errors)` — insert refresh_log entry

- [ ] **Step 3: Write Oregon UCC collector**

Create `workers/src/collectors/ucc.ts`:
- `collectOregonUCC(db)` — fetch from data.oregon.gov SODA API:
  - First, discover the correct dataset ID: search `https://data.oregon.gov/api/views/metadata/v1?q=UCC` or browse the Oregon SOS data catalog. The UCC filing dataset may be under "Business" category. If no SODA endpoint exists, fall back to downloading the monthly CSV dump from the Oregon SOS website and parsing it.
  - URL pattern: `https://data.oregon.gov/resource/{DATASET_ID}.json`
  - Filter: `$where=filing_date > 'YYYY-MM-DD'` (last 30 days)
  - For each filing: check if secured_party matches any competitor lender name (case-insensitive partial match)
  - Upsert company, insert signal (source='ucc', heat='HOT' if competitor match, 'WARM' otherwise), insert ucc_filing record
  - Return count of new filings found
- `getCompetitorLenderNames()` — returns the 12 competitor lender name strings for matching

- [ ] **Step 4: Test with real data**

```bash
cd /Users/madden/selway-intelligence/workers
npx wrangler dev
# In another terminal:
curl http://localhost:8787/api/refresh/ucc -X POST -H "X-API-Key: <key>"
curl http://localhost:8787/api/ucc -H "X-API-Key: <key>"
```

- [ ] **Step 5: Commit**

```bash
git add workers/ && git commit -m "feat: Oregon UCC collector via data.oregon.gov API"
```

---

### Task 10: Defense Contracts Collector

**Files:**
- Create: `workers/src/collectors/defense.ts`

- [ ] **Step 1: Write defense contract collector**

Create `workers/src/collectors/defense.ts`:
- `collectDefenseContracts(db)` — fetch from `https://www.defense.gov/News/Contracts/`
- Parse the HTML for daily contract entries
- Filter for entries mentioning: manufacturing, machining, fabrication, CNC, machine tool, or containing city/state in OR, WA, CA, UT, NV
- For each match: extract company name, contract value, description
- Upsert company, insert signal (source='defense', heat='WARM' default, 'HOT' if > $5M)
- Return count

- [ ] **Step 2: Test with real data**

```bash
curl http://localhost:8787/api/refresh/defense -X POST -H "X-API-Key: <key>"
curl http://localhost:8787/api/signals?source=defense -H "X-API-Key: <key>"
```

- [ ] **Step 3: Commit**

```bash
git add workers/ && git commit -m "feat: defense contracts collector from defense.gov"
```

---

### Task 11: News & Industry Collector

**Files:**
- Create: `workers/src/collectors/news.ts`

- [ ] **Step 1: Write news collector**

Create `workers/src/collectors/news.ts`:
- `collectNews(db)` — fetch multiple Google News RSS feeds:
  - `https://news.google.com/rss/search?q=CNC+machine+tool+Oregon`
  - `https://news.google.com/rss/search?q=CNC+machine+tool+Washington`
  - `https://news.google.com/rss/search?q=CNC+machine+tool+California`
  - `https://news.google.com/rss/search?q=CNC+machine+tool+Utah`
  - `https://news.google.com/rss/search?q=CNC+machine+tool+Nevada`
  - `https://news.google.com/rss/search?q=manufacturing+expansion+West+Coast`
  - `https://news.google.com/rss/search?q=reshoring+manufacturing+CNC`
- Also fetch trade pub RSS feeds:
  - Modern Machine Shop, American Machinist, Production Machining RSS URLs
- Parse RSS XML, extract title, link, pubDate, description
- Deduplicate by URL (check if signal with same URL already exists)
- Insert signals (source='news', heat='COOL' default)
- Try to extract company names from title/description for company association
- Return count

- [ ] **Step 2: Test and commit**

```bash
git add workers/ && git commit -m "feat: news and industry RSS collector"
```

---

### Task 12: Job Postings Collector

**Files:**
- Create: `workers/src/collectors/jobs.ts`

- [ ] **Step 1: Write job postings collector**

Create `workers/src/collectors/jobs.ts`:
- `collectJobPostings(db)` — use SerpAPI Google Jobs endpoint:
  - If SERPAPI_KEY is set in env, use it. Otherwise, fall back to scraping state workforce boards.
  - SerpAPI path: `https://serpapi.com/search.json?engine=google_jobs&q=CNC+machinist&location=Oregon&api_key=KEY`
  - Run for each state + keyword combo (budget the 100/month free tier across searches)
  - Extract: job title, company name, location, posting date
  - Upsert company, insert signal (source='job', heat='WARM')
- Fallback: scrape state workforce board search results (WorkSource OR/WA, CalJOBS CA)
- Return count

- [ ] **Step 2: Set SerpAPI key secret**

```bash
cd /Users/madden/selway-intelligence/workers
npx wrangler secret put SERPAPI_KEY
```

User signs up at serpapi.com (free tier: 100 searches/month), gets API key, pastes it.

- [ ] **Step 3: Test and commit**

```bash
git add workers/ && git commit -m "feat: job postings collector via SerpAPI and state boards"
```

---

### Task 13: Building Permits Collector

**Files:**
- Create: `workers/src/collectors/permits.ts`

- [ ] **Step 1: Write permits collector**

Create `workers/src/collectors/permits.ts`:
- `collectPermits(db)` — fetch Google News RSS feeds filtered for building permits/facility expansions:
  - `https://news.google.com/rss/search?q="manufacturing+facility"+OR+"industrial+expansion"+Oregon`
  - Same pattern for WA, CA, UT, NV
  - Also fetch Construction Dive RSS and ENR RSS
- Parse RSS, filter for results mentioning manufacturing, machining, industrial, CNC
- Deduplicate by URL
- Insert signals (source='permit', heat='WARM')
- Return count

- [ ] **Step 2: Test and commit**

```bash
git add workers/ && git commit -m "feat: building permits collector via construction news RSS"
```

---

### Task 14: Used Machine Marketplace Collector

**Files:**
- Create: `workers/src/collectors/marketplace.ts`

- [ ] **Step 1: Write marketplace collector**

Create `workers/src/collectors/marketplace.ts`:
- `collectMarketplace(db)` — scrape Machinio search results:
  - URL pattern: `https://www.machinio.com/cat/cnc-machining-centers?q=mazak&country=us`
  - Search for each competitor brand (Mazak, Okuma, DMG MORI, Doosan, Makino)
  - Filter results by location (OR, WA, CA, UT, NV)
  - Extract: machine model, seller company, location, listing URL
  - Upsert company (the seller), insert signal (source='marketplace', heat='WARM')
- Return count

- [ ] **Step 2: Test and commit**

```bash
git add workers/ && git commit -m "feat: used machine marketplace collector from Machinio"
```

---

## Phase 4: Processing Engine

### Task 15: Lead Scoring Engine

**Files:**
- Create: `workers/src/engine/scorer.ts`
- Create: `workers/src/engine/dedup.ts`
- Create: `workers/src/engine/correlator.ts`
- Create: `workers/tests/scorer.test.ts`

- [ ] **Step 1: Write scoring test**

Create `workers/tests/scorer.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { scoreSignal, scoreCompany } from '../src/engine/scorer';

describe('scoreSignal', () => {
  it('scores competitor UCC filing as HOT (80)', () => {
    expect(scoreSignal({ source: 'ucc', is_competitor: true })).toBe(80);
  });
  it('scores general UCC filing as WARM (50)', () => {
    expect(scoreSignal({ source: 'ucc', is_competitor: false })).toBe(50);
  });
  it('scores job posting as WARM (45)', () => {
    expect(scoreSignal({ source: 'job' })).toBe(45);
  });
  it('scores defense contract as WARM (55)', () => {
    expect(scoreSignal({ source: 'defense' })).toBe(55);
  });
  it('scores news as COOL (20)', () => {
    expect(scoreSignal({ source: 'news' })).toBe(20);
  });
});

describe('scoreCompany', () => {
  it('adds +15 multi-signal bonus per additional source type', () => {
    const signals = [
      { source: 'ucc', score: 80 },
      { source: 'job', score: 45 },
      { source: 'permit', score: 40 },
    ];
    expect(scoreCompany(signals)).toBe(100); // 80 + 15 + 15 = 110, capped at 100
  });
  it('caps at 100', () => {
    const signals = [
      { source: 'ucc', score: 80 },
      { source: 'job', score: 45 },
      { source: 'permit', score: 40 },
      { source: 'defense', score: 55 },
    ];
    expect(scoreCompany(signals)).toBe(100);
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

```bash
cd /Users/madden/selway-intelligence/workers
npx vitest run tests/scorer.test.ts
```
Expected: FAIL — modules don't exist yet.

- [ ] **Step 3: Implement scorer**

Create `workers/src/engine/scorer.ts`:
- `scoreSignal(signal)` — returns numeric score based on source type and flags:
  - ucc + competitor: 80, ucc: 50, defense: 55, job: 45, permit: 40, marketplace: 40, news: 20
- `scoreCompany(signals)` — takes all signals for a company, finds max single score, adds +15 per additional unique source type, caps at 100
- `heatLevel(score)` — returns 'HOT' (80+), 'WARM' (40-79), 'COOL' (1-39)

- [ ] **Step 4: Run tests, verify pass**

```bash
npx vitest run tests/scorer.test.ts
```
Expected: PASS

- [ ] **Step 5: Implement dedup and correlator**

Create `workers/src/engine/dedup.ts`:
- `isDuplicate(db, signal)` — check if signal with same source + URL already exists, or same source + company_id + title within 7 days

Create `workers/src/engine/correlator.ts`:
- `correlateSignals(db, companyId)` — query all signals for a company, recalculate company heat score, update companies table
- `runPostProcessing(db)` — called after all collectors finish: for each company with new signals, run correlateSignals

- [ ] **Step 6: Commit**

```bash
git add workers/ && git commit -m "feat: lead scoring engine with multi-signal correlation"
```

---

### Task 16: Wire Up Cron Handler

**Files:**
- Modify: `workers/src/index.ts` (scheduled handler)

- [ ] **Step 1: Implement scheduled handler**

Modify the `scheduled` event handler in `workers/src/index.ts`:
- Determine which cycle (morning/noon/afternoon) based on cron trigger time
- Run all 6 collectors sequentially: ucc → jobs → defense → news → permits → marketplace
- After all collectors: run `runPostProcessing(db)` to recalculate scores
- Send email digest via Resend (if any new signals found)
- Log each step to refresh_log table
- Wrap in try/catch — log errors to refresh_log but don't crash

- [ ] **Step 2: Deploy and verify cron fires**

```bash
cd /Users/madden/selway-intelligence/workers
npx wrangler deploy
# Check logs
npx wrangler tail
```

Wait for next cron trigger or manually test via:
```bash
curl -X POST http://localhost:8787/api/refresh/all -H "X-API-Key: <key>"
```

- [ ] **Step 3: Commit**

```bash
git add workers/ && git commit -m "feat: cron handler dispatching all collectors with post-processing"
```

---

## Phase 5: Email Digest

### Task 17: Email Digest via Resend

**Files:**
- Create: `workers/src/email/digest.ts`

- [ ] **Step 1: Write email digest**

Create `workers/src/email/digest.ts`:
- `sendDigest(db, env, cycle)`:
  - Query signals where is_new = 1
  - Build HTML email:
    - Header: "Selway Intelligence — [Morning/Noon/Afternoon] Digest"
    - Summary line: "X new signals found"
    - HOT leads section (red border) — list any HOT signals with company, type, territory
    - New UCC filings section (purple border) — if any new UCC filings
    - Signal breakdown: count by source type
    - Footer: link to dashboard URL
  - Style: clean HTML email matching Selway teal branding, works in Gmail/Outlook
  - Send via Resend API: `POST https://api.resend.com/emails` with `Authorization: Bearer RESEND_API_KEY`
  - From: `onboarding@resend.dev` for initial testing (Resend's default sender, works immediately)
  - To: `jonnymadden21@cloud.com`
  - Future: verify a custom domain in Resend dashboard (add DNS records) to send from `intel@selwayintel.com` or similar
  - On failure: wait 5 seconds, retry once
  - After send: mark all is_new signals as is_new = 0

- [ ] **Step 2: Set Resend API key secret**

```bash
npx wrangler secret put RESEND_API_KEY
```

User creates free account at resend.com, gets API key, pastes it.

- [ ] **Step 3: Test email manually**

Trigger a refresh and verify email arrives:
```bash
curl -X POST https://selway-intelligence.<account>.workers.dev/api/refresh/all -H "X-API-Key: <key>"
```

- [ ] **Step 4: Commit**

```bash
git add workers/ && git commit -m "feat: email digest via Resend with retry logic"
```

---

## Phase 6: Polish & Go Live

### Task 18: Frontend Polish Pass

**Files:**
- Modify: all `frontend/` files

- [ ] **Step 1: Responsive design**

Add responsive CSS: mobile breakpoints for stat cards (2-column on tablet, 1-column on phone), signal feed full-width on mobile, sidebar stacks below.

- [ ] **Step 2: Loading states**

Add skeleton loaders / spinners while API data loads. Each component shows a subtle loading animation before data appears.

- [ ] **Step 3: Error handling**

If API calls fail: show a "Connection error — retrying..." message with automatic retry after 5 seconds. If API key is invalid: show "Authentication error" message.

- [ ] **Step 4: Empty states**

If no signals/leads/UCC filings yet: show helpful empty state messages ("No signals found yet — next refresh at 12:00 PM PT").

- [ ] **Step 5: Commit**

```bash
git add frontend/ && git commit -m "feat: responsive design, loading states, error handling"
```

---

### Task 19: Final Deploy & Verify

- [ ] **Step 1: Deploy workers to production**

```bash
cd /Users/madden/selway-intelligence/workers
npx wrangler deploy
```

- [ ] **Step 2: Push frontend to GitHub Pages**

```bash
cd /Users/madden/selway-intelligence
git push origin main
```

Verify: `https://jonnymadden21.github.io/selway-intelligence/` loads with real data.

- [ ] **Step 3: Trigger full data refresh**

```bash
curl -X POST https://selway-intelligence.<account>.workers.dev/api/refresh/all -H "X-API-Key: <key>"
```

Verify: dashboard updates with fresh data, email digest arrives.

- [ ] **Step 4: Verify cron triggers**

Check Cloudflare dashboard → Workers → selway-intelligence → Triggers tab. Confirm 3 cron triggers are active. Check `npx wrangler tail` to see next trigger fire.

- [ ] **Step 5: Commit final state**

```bash
git add -A && git commit -m "feat: Selway Intelligence Platform v1.0 — live"
git push origin main
```
