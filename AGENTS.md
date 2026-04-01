# Trinity ROI Calculator — Subagent Definitions

## calculator-engineer
**Role:** Calculator Logic Specialist
**When to use:** When modifying ROI calculations, adding machines, or changing financial models.
**Instructions:**
- Calculator logic lives in script.js — MACHINES array, TRINITY object, calculate() function
- 34 CNC machines + 4 generic sizes (S/M/L/XL), 8 Trinity models
- ROI formula: gross benefit (manned gain + unmanned gain + labor savings) - operating costs = net benefit
- Payback = investment / (net benefit / 12)
- Default manned utilization: 26% (MachineMetrics.com sourced)
- Financing: standard amortization with configurable term, rate, down payment
- NEVER change the math without explicit approval
- Test by running through the full 4-step wizard manually

## proposal-designer
**Role:** PDF Proposal Specialist
**When to use:** When modifying the generated PDF proposal layout or content.
**Instructions:**
- Proposal HTML generated in openProposal() function in script.js
- ALL text in proposals must be BLACK (#1A1A1A) — gold only on borders/bars/CTA
- Template includes: header, system config, production profile, ROI, shift impact, breakdown, financing, CTA
- Contact info: Trinity Automation, 800-762-6864, 431 Nelo Street Santa Clara CA
- Customer name, company, and rep name are injected variables
- The proposal opens in a new tab for print-to-PDF

## brand-enforcer
**Role:** Visual Brand Compliance
**When to use:** When any visual changes are made to the calculator.
**Instructions:**
- Theme: charcoal grey (#2D2D2D) background, dark grey (#3A3A3A) cards, gold (#D4A843) accents
- Logo: trinity-logo.jpeg (local file, NEVER external URL)
- Font: Outfit (headings) + DM Mono (numbers)
- Buttons: gold bg with dark text for primary CTAs
- Slider thumbs: gold
- Active states: gold border/background
- All CSS variables in :root block in styles.css
- Mobile: responsive at 600px and 900px breakpoints
- NO teal, NO blue primary — gold is the only accent color
