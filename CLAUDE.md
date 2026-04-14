# Trinity ROI Calculator — Sales Rep Version

## Project Overview
ROI calculator for Trinity Automation CNC pallet systems. Used by Selway Machine Tool sales reps to demonstrate automation value to customers.

**Live:** selway.live | **Stack:** Vanilla HTML/CSS/JS (no framework)

## Brand
- **Theme:** Charcoal grey (#2D2D2D) + Gold (#D4A843)
- **Logo:** trinity-logo.jpeg (local file, never external URL)
- **Contact:** 800-762-6864, 431 Nelo Street, Santa Clara, CA 95054
- **Email:** sales@trinityautomation.com
- **Only NorCal address** — no SoCal unless asked

## Key Files
- `index.html` — structure, content, forms
- `styles.css` — charcoal/gold theme, all CSS variables in :root
- `script.js` — calculator logic, machine data, Trinity models, proposal PDF generation

## Design Rules
- Charcoal background (#2D2D2D), dark grey cards (#3A3A3A), gold accents (#D4A843)
- All PDF proposal text must be BLACK (#1A1A1A) — gold only on borders/bars
- Default manned utilization: 26% (sourced by MachineMetrics.com)
- Generic CNC options (S/M/L/XL) have dashed borders and price warning
- No external image URLs — use local files only

## Never Do
- Change the calculator math/logic without explicit approval
- Use any color besides the charcoal/gold palette
- Remove the MachineMetrics.com source note
- Reference "Selway Machine Tool" in the UI — this is Trinity Automation branded
- Use SoCal address

## Customer Version
Located at: ~/claude code selway/customer-roi/ (separate git repo)
- Same charcoal/gold theme
- Has Web3Forms lead capture (sends to jonmadden@selwaytool.com)
- Web3Forms key: b00ba4eb-0735-408c-bc0f-192d4c094285
- Customer-friendly language
