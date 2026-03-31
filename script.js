// ============================================================
// TRINITY ROI CALCULATOR — Trinity Automation
// ============================================================

// ===== MACHINE DATA =====
const MACHINES = [
  // HAAS
  { id:'mm', model:'Mini Mill', brand:'Haas', type:'VMC', axes:3, compat:['AI1','AX1'], rec:'AX1' },
  { id:'dm1', model:'DM-1', brand:'Haas', type:'VMC', axes:3, compat:['AI1','AX1'], rec:'AX1' },
  { id:'dm2', model:'DM-2', brand:'Haas', type:'VMC', axes:3, compat:['AI1','AX1'], rec:'AX1' },
  { id:'dt1', model:'DT-1', brand:'Haas', type:'Drill/Tap', axes:3, compat:['AI1','AX1'], rec:'AX1' },
  { id:'dt2', model:'DT-2', brand:'Haas', type:'Drill/Tap', axes:3, compat:['AI1','AX1'], rec:'AX1' },
  { id:'vf1', model:'VF-1', brand:'Haas', type:'VMC', axes:3, compat:['AI1','AX1','AX2'], rec:'AX2' },
  { id:'vf2', model:'VF-2', brand:'Haas', type:'VMC', axes:3, compat:['AI1','AX2','AX2D'], rec:'AX2' },
  { id:'vf2ss', model:'VF-2SS', brand:'Haas', type:'VMC', axes:3, compat:['AI1','AX2','AX2D'], rec:'AX2' },
  { id:'vf3', model:'VF-3', brand:'Haas', type:'VMC', axes:3, compat:['AI1','AX2','AX5'], rec:'AX2' },
  { id:'vf4', model:'VF-4', brand:'Haas', type:'VMC', axes:3, compat:['AI1','AX5','AX5H','AX2D'], rec:'AX5' },
  { id:'vf4ss', model:'VF-4SS', brand:'Haas', type:'VMC', axes:3, compat:['AI1','AX5','AX5H','AX2D'], rec:'AX5' },
  { id:'vf5', model:'VF-5/40', brand:'Haas', type:'VMC', axes:3, compat:['AI1','AX5H'], rec:'AX5H' },
  { id:'vf6', model:'VF-6/40', brand:'Haas', type:'VMC', axes:3, compat:['AI1','AX5H'], rec:'AX5H' },
  { id:'u350', model:'UMC-350', brand:'Haas', type:'5-Axis', axes:5, compat:['AI1','AX1','AX2'], rec:'AX1' },
  { id:'u500', model:'UMC-500', brand:'Haas', type:'5-Axis', axes:5, compat:['AI1','AX2','AX2D'], rec:'AX2' },
  { id:'u500s', model:'UMC-500SS', brand:'Haas', type:'5-Axis', axes:5, compat:['AI1','AX2','AX2D'], rec:'AX2' },
  { id:'u750', model:'UMC-750', brand:'Haas', type:'5-Axis', axes:5, compat:['AI1','AX4','AX4H','AX5','AX5H','AX2D'], rec:'AX5' },
  { id:'u750s', model:'UMC-750SS', brand:'Haas', type:'5-Axis', axes:5, compat:['AI1','AX4','AX4H','AX5','AX5H','AX2D'], rec:'AX5' },
  { id:'u1000', model:'UMC-1000', brand:'Haas', type:'5-Axis', axes:5, compat:['AI1','AX5H'], rec:'AX5H' },
  // MATSUURA
  { id:'mx330', model:'MX-330', brand:'Matsuura', type:'5-Axis', axes:5, compat:['AX2','AX4'], rec:'AX2' },
  { id:'mx420', model:'MX-420', brand:'Matsuura', type:'5-Axis', axes:5, compat:['AX2','AX4'], rec:'AX4' },
  { id:'mx520', model:'MX-520', brand:'Matsuura', type:'5-Axis', axes:5, compat:['AX4','AX5'], rec:'AX4' },
  { id:'mx850', model:'MX-850', brand:'Matsuura', type:'5-Axis', axes:5, compat:['AX4H','AX5H'], rec:'AX4H' },
  // JTEKT / TOYODA
  { id:'fv1165', model:'FV-1165', brand:'JTEKT/Toyoda', type:'VMC', axes:3, compat:['AI1','AX5','AX5H'], rec:'AX5' },
  { id:'fv1365', model:'FV-1365', brand:'JTEKT/Toyoda', type:'VMC', axes:3, compat:['AI1','AX5H'], rec:'AX5H' },
  // HWACHEON
  { id:'v660', model:'VESTA-660', brand:'Hwacheon', type:'VMC', axes:3, compat:['AI1','AX2','AX5'], rec:'AX2' },
  { id:'v1050', model:'VESTA-1050B', brand:'Hwacheon', type:'VMC', axes:3, compat:['AI1','AX5','AX5H'], rec:'AX5' },
  // SMEC
  { id:'pv83', model:'PV-8300', brand:'SMEC', type:'VMC', axes:3, compat:['AI1','AX2'], rec:'AX2' },
  // ENSHU
  { id:'je40', model:'JE40', brand:'Enshu', type:'HMC', axes:4, compat:['AX4'], rec:'AX4' },
  // COMPETITOR
  { id:'dn45', model:'DNM-4500', brand:'Doosan', type:'VMC', axes:3, compat:['AI1','AX2','AX5'], rec:'AX2' },
  { id:'dn57', model:'DNM-5700', brand:'Doosan', type:'VMC', axes:3, compat:['AI1','AX5','AX5H'], rec:'AX5' },
  { id:'nxv', model:'NXV1020A', brand:'YCM', type:'VMC', axes:3, compat:['AI1','AX2'], rec:'AX2' },
  { id:'robo', model:'Robodrill', brand:'Fanuc', type:'VMC', axes:3, compat:['AI1','AX1'], rec:'AX1' },
  { id:'s700', model:'Speedio S700', brand:'Brother', type:'VMC', axes:3, compat:['AI1','AX1'], rec:'AX1' },
  // GENERIC SIZE OPTIONS (for machines not listed)
  { id:'gen_sm', model:'Small CNC', brand:'Other', type:'VMC', axes:3, compat:['AI1','AX1'], rec:'AX1', generic:true, desc:'Max part: 12" x 9" H · Max weight: 35 lbs' },
  { id:'gen_md', model:'Medium CNC', brand:'Other', type:'VMC', axes:3, compat:['AI1','AX2','AX2D'], rec:'AX2', generic:true, desc:'Max part: 16" x 9" H · Max weight: 55 lbs' },
  { id:'gen_lg', model:'Large CNC', brand:'Other', type:'VMC', axes:3, compat:['AI1','AX5','AX5H','AX2D'], rec:'AX5', generic:true, desc:'Max part: 20" x 12" H · Max weight: 75 lbs' },
  { id:'gen_xl', model:'Extra Large CNC', brand:'Other', type:'VMC', axes:3, compat:['AI1','AX5H'], rec:'AX5H', generic:true, desc:'Max part: 20"+ x 12"+ H · Max weight: 180 lbs' },
];

// ===== TRINITY MODEL DATA =====
const TRINITY = {
  AI1: { id:'AI1', name:'Trinity AI-1', sub:'Automated Part Loader', price:120000, pallets:'Continuous', maxPart:'Various', weight:'Various', hours:0, machines:1, type:'Part Loader', isLoader:true },
  AX1: { id:'AX1', name:'Trinity AX1', sub:'Compact High-Speed', price:136000, pallets:'12-18', maxPart:'12in x 9in H', weight:'35 lbs', hours:7, machines:1, type:'Pallet System', isLoader:false },
  AX2: { id:'AX2', name:'Trinity AX2', sub:'Medium VMC', price:180000, pallets:'16-24', maxPart:'16in x 9in H', weight:'55 lbs', hours:9, machines:1, type:'Pallet System', isLoader:false },
  AX2D: { id:'AX2D', name:'Trinity AX2 Duo', sub:'Dual Machine', price:210000, pallets:'16-24', maxPart:'16in x 9in H (x2)', weight:'55 lbs/stn', hours:10, machines:2, type:'Pallet System', isLoader:false },
  AX4: { id:'AX4', name:'Trinity AX4', sub:'Med/Large Pallet', price:230000, pallets:'12', maxPart:'21.65in x 16.5in H', weight:'75 lbs', hours:9, machines:1, type:'Pallet System', isLoader:false },
  AX4H: { id:'AX4H', name:'Trinity AX4HD', sub:'Heavy-Duty Med/Lg', price:250000, pallets:'12', maxPart:'21.65in x 16.5in H', weight:'180 lbs', hours:9, machines:1, type:'Pallet System', isLoader:false },
  AX5: { id:'AX5', name:'Trinity AX5', sub:'Large Production', price:225000, pallets:'20', maxPart:'20in x 12in H', weight:'75 lbs', hours:10, machines:1, type:'Pallet System', isLoader:false },
  AX5H: { id:'AX5H', name:'Trinity AX5HD', sub:'Heavy-Duty Large', price:250000, pallets:'20', maxPart:'20in x 12in H', weight:'180 lbs', hours:10, machines:1, type:'Pallet System', isLoader:false },
};

// ===== STATE =====
let state = {
  step: 1,
  selectedMachine: null,
  selectedTrinity: null,
  brandFilter: 'All',
  finDown: 10,
  finRate: 6.5,
  finTerm: 60,
};

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  renderBrandFilters();
  renderMachineGrid();
  bindEvents();
  updateSliderDisplays();
});

// ===== BRAND FILTERS =====
function renderBrandFilters() {
  const brands = ['All', ...new Set(MACHINES.map(m => m.brand))];
  const el = document.getElementById('brandFilters');
  el.innerHTML = brands.map(b =>
    `<button class="brand-chip${b === state.brandFilter ? ' active' : ''}" data-brand="${b}">${b}</button>`
  ).join('');
  el.querySelectorAll('.brand-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      state.brandFilter = chip.dataset.brand;
      el.querySelectorAll('.brand-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      renderMachineGrid();
    });
  });
}

// ===== MACHINE GRID =====
function renderMachineGrid() {
  const search = (document.getElementById('machineSearch').value || '').toLowerCase();
  const grid = document.getElementById('machineGrid');
  const filtered = MACHINES.filter(m => {
    const matchBrand = state.brandFilter === 'All' || m.brand === state.brandFilter;
    const matchSearch = !search ||
      m.model.toLowerCase().includes(search) ||
      m.brand.toLowerCase().includes(search) ||
      m.type.toLowerCase().includes(search);
    return matchBrand && matchSearch;
  });
  // Note: machine data is hardcoded (not user input), safe for innerHTML
  grid.innerHTML = filtered.map(m => `
    <div class="machine-card${state.selectedMachine?.id === m.id ? ' selected' : ''}${m.generic ? ' generic' : ''}" data-id="${m.id}">
      <div class="machine-brand">${m.brand}</div>
      <div class="machine-model">${m.model}</div>
      <div class="machine-meta"><span>${m.type}</span><span>${m.axes}-Axis</span></div>
      ${m.generic ? `<div class="machine-desc">${m.desc}</div><div class="generic-warning">Prices may vary — contact us for exact quote</div>` : ''}
    </div>
  `).join('');
  grid.querySelectorAll('.machine-card').forEach(card => {
    card.addEventListener('click', () => {
      state.selectedMachine = MACHINES.find(m => m.id === card.dataset.id);
      state.selectedTrinity = null;
      renderMachineGrid();
      document.getElementById('btnToStep2').disabled = false;
    });
  });
}

// ===== TRINITY GRID =====
function renderTrinityGrid() {
  const machine = state.selectedMachine;
  if (!machine) return;
  document.getElementById('selectedMachineName').textContent = `${machine.brand} ${machine.model}`;
  const grid = document.getElementById('trinityGrid');
  const models = machine.compat.map(id => TRINITY[id]);
  grid.innerHTML = models.map(t => {
    const isRec = t.id === machine.rec;
    const sel = state.selectedTrinity?.id === t.id;
    return `
    <div class="trinity-card${sel ? ' selected' : ''}" data-id="${t.id}">
      <div class="trinity-header">
        <div>
          <div class="trinity-name">${t.name}</div>
          <div class="trinity-sub">${t.sub}</div>
        </div>
        <div>
          ${isRec ? '<span class="badge badge-rec">RECOMMENDED</span>' : ''}
          ${t.isLoader ? '<span class="badge badge-loader">PART LOADER</span>' : ''}
        </div>
      </div>
      <div class="trinity-price">$${t.price.toLocaleString()}</div>
      <div class="trinity-specs">
        <div class="trinity-spec">Pallets<strong>${t.pallets}</strong></div>
        <div class="trinity-spec">Max Part<strong>${t.maxPart}</strong></div>
        <div class="trinity-spec">Weight<strong>${t.weight}</strong></div>
        <div class="trinity-spec">${t.isLoader ? 'Type' : 'Unmanned Hrs'}<strong>${t.isLoader ? 'Part Loader' : t.hours + ' hrs/day'}</strong></div>
      </div>
    </div>`;
  }).join('');
  grid.querySelectorAll('.trinity-card').forEach(card => {
    card.addEventListener('click', () => {
      state.selectedTrinity = TRINITY[card.dataset.id];
      renderTrinityGrid();
      document.getElementById('btnToStep3').disabled = false;
    });
  });
}

// ===== SLIDER DISPLAYS =====
function updateSliderDisplays() {
  ['mannedUtilBefore','mannedUtilAfter','unmannedUtilBefore','unmannedUtilAfter'].forEach(id => {
    const slider = document.getElementById(id);
    const display = document.getElementById(id + 'Val');
    if (slider && display) {
      display.textContent = slider.value + '%';
      slider.addEventListener('input', () => { display.textContent = slider.value + '%'; });
    }
  });
}

// ===== BUTTON GROUP HANDLER =====
function setupBtnGroup(groupId) {
  const group = document.getElementById(groupId);
  group.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      group.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      group.dataset.value = btn.dataset.val;
    });
  });
}

// ===== NAVIGATION =====
function goToStep(n) {
  state.step = n;
  document.querySelectorAll('.step').forEach(s => s.classList.add('hidden'));
  document.getElementById('step' + n).classList.remove('hidden');
  // Progress bar
  document.getElementById('progressFill').style.width = (n * 25) + '%';
  document.querySelectorAll('.step-indicator').forEach(si => {
    const sn = parseInt(si.dataset.step);
    si.classList.remove('active', 'done');
    if (sn < n) si.classList.add('done');
    if (sn === n) si.classList.add('active');
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== BIND EVENTS =====
function bindEvents() {
  document.getElementById('machineSearch').addEventListener('input', renderMachineGrid);

  document.getElementById('btnToStep2').addEventListener('click', () => {
    renderTrinityGrid();
    goToStep(2);
  });
  document.getElementById('btnToStep3').addEventListener('click', () => goToStep(3));
  document.getElementById('btnBackTo1').addEventListener('click', () => goToStep(1));
  document.getElementById('btnBackTo2').addEventListener('click', () => {
    renderTrinityGrid();
    goToStep(2);
  });
  document.getElementById('btnBackTo3').addEventListener('click', () => goToStep(3));
  document.getElementById('btnStartOver').addEventListener('click', () => {
    state.selectedMachine = null;
    state.selectedTrinity = null;
    document.getElementById('btnToStep2').disabled = true;
    document.getElementById('btnToStep3').disabled = true;
    renderMachineGrid();
    goToStep(1);
  });
  document.getElementById('btnCalculate').addEventListener('click', calculate);
  document.getElementById('btnDownload').addEventListener('click', downloadProposal);

  setupBtnGroup('mannedShifts');
  setupBtnGroup('unmannedShifts');
}

// ===== HELPER =====
function fmt(n) { return '$' + Math.round(n).toLocaleString(); }
function fmtK(n) { return n >= 1000 ? '$' + (n/1000).toFixed(0) + 'K' : fmt(n); }
function pct(n) { return n.toFixed(1) + '%'; }

// ===== ROI CALCULATION =====
function calculate() {
  const trinity = state.selectedTrinity;
  const machine = state.selectedMachine;
  if (!trinity || !machine) return;

  const shopRate = parseFloat(document.getElementById('shopRate').value) || 125;
  const hrsPerShift = parseFloat(document.getElementById('hrsPerShift').value) || 8;
  const operatorWage = parseFloat(document.getElementById('operatorWage').value) || 30;
  const workingDays = parseFloat(document.getElementById('workingDays').value) || 250;
  const mannedShifts = parseInt(document.getElementById('mannedShifts').dataset.value) || 0;
  const unmannedShifts = parseInt(document.getElementById('unmannedShifts').dataset.value) || 0;
  const mannedUtilBefore = parseFloat(document.getElementById('mannedUtilBefore').value) / 100;
  const mannedUtilAfter = parseFloat(document.getElementById('mannedUtilAfter').value) / 100;
  const unmannedUtilBefore = parseFloat(document.getElementById('unmannedUtilBefore').value) / 100;
  const unmannedUtilAfter = parseFloat(document.getElementById('unmannedUtilAfter').value) / 100;

  // Manned
  const mannedHrs = mannedShifts * hrsPerShift;
  const mannedBefore = mannedHrs * mannedUtilBefore;
  const mannedAfter = mannedHrs * mannedUtilAfter;
  const mannedGainHrs = mannedAfter - mannedBefore;
  const mannedGainRev = mannedGainHrs * shopRate * workingDays;

  // Unmanned
  const unmannedHrs = unmannedShifts * hrsPerShift;
  const unmannedBefore = unmannedHrs * unmannedUtilBefore;
  const unmannedAfter = unmannedHrs * unmannedUtilAfter;
  const unmannedGainHrs = unmannedAfter - unmannedBefore;
  const unmannedGainRev = unmannedGainHrs * shopRate * workingDays;

  // Combined
  const totalGainHrs = mannedGainHrs + unmannedGainHrs;
  const totalGainRev = mannedGainRev + unmannedGainRev;

  // Operating costs
  const totalAutoHrs = mannedAfter + unmannedAfter;
  const opCost = totalAutoHrs * 5 * workingDays;

  // Labor reallocation
  const laborSaving = operatorWage * mannedGainHrs * workingDays * 0.5;

  // Net
  const grossBenefit = totalGainRev + laborSaving;
  const netBenefit = grossBenefit - opCost;
  const investment = trinity.price;
  const paybackMonths = netBenefit > 0 ? (investment / netBenefit) * 12 : Infinity;
  const year1ROI = ((netBenefit - investment) / investment) * 100;
  const year3ROI = ((netBenefit * 3 - investment) / investment) * 100;
  const year5ROI = ((netBenefit * 5 - investment) / investment) * 100;

  // Capacity
  const totalHrsBefore = mannedBefore > 0 ? mannedBefore : 0.01;
  const totalHrsAfter = mannedAfter + unmannedAfter;
  const capacityMult = totalHrsAfter / totalHrsBefore;

  // Store for proposal
  state.results = {
    shopRate, hrsPerShift, operatorWage, workingDays, mannedShifts, unmannedShifts,
    mannedUtilBefore, mannedUtilAfter, unmannedUtilBefore, unmannedUtilAfter,
    mannedBefore, mannedAfter, mannedGainHrs, mannedGainRev,
    unmannedBefore, unmannedAfter, unmannedGainHrs, unmannedGainRev,
    totalGainHrs, totalGainRev, totalAutoHrs, opCost, laborSaving,
    grossBenefit, netBenefit, investment, paybackMonths,
    year1ROI, year3ROI, year5ROI, totalHrsBefore, totalHrsAfter, capacityMult
  };

  renderResults();
  goToStep(4);
}

// ===== RENDER RESULTS =====
function renderResults() {
  const r = state.results;
  const t = state.selectedTrinity;
  const m = state.selectedMachine;

  // Hero stats
  document.getElementById('heroStats').innerHTML = `
    <div class="hero-card highlight">
      <div class="label">Net Annual Benefit</div>
      <div class="value">${fmt(r.netBenefit)}</div>
      <div class="sub">per year</div>
    </div>
    <div class="hero-card">
      <div class="label">Payback Period</div>
      <div class="value">${r.paybackMonths < 120 ? r.paybackMonths.toFixed(1) : '120+'}</div>
      <div class="sub">months</div>
    </div>
    <div class="hero-card">
      <div class="label">Additional Revenue</div>
      <div class="value">${fmt(r.totalGainRev)}</div>
      <div class="sub">per year</div>
    </div>
    <div class="hero-card">
      <div class="label">Investment</div>
      <div class="value">${fmt(r.investment)}</div>
      <div class="sub">${t.name}</div>
    </div>
  `;

  // ROI Timeline
  document.getElementById('roiTimeline').innerHTML = `
    <div class="roi-item"><div class="label">Year 1 ROI</div><div class="value">${r.year1ROI.toFixed(0)}%</div></div>
    <div class="roi-item"><div class="label">Year 3 ROI</div><div class="value">${r.year3ROI.toFixed(0)}%</div></div>
    <div class="roi-item"><div class="label">Year 5 ROI</div><div class="value">${r.year5ROI.toFixed(0)}%</div></div>
  `;

  // Shift Impact
  const mannedUtilBeforePct = (r.mannedUtilBefore * 100).toFixed(0);
  const mannedUtilAfterPct = (r.mannedUtilAfter * 100).toFixed(0);
  const unmannedUtilBeforePct = (r.unmannedUtilBefore * 100).toFixed(0);
  const unmannedUtilAfterPct = (r.unmannedUtilAfter * 100).toFixed(0);

  let shiftHTML = '';
  if (r.mannedShifts > 0) {
    shiftHTML += `
    <div class="impact-card blue">
      <h4>Manned Shifts (${r.mannedShifts}x ${r.hrsPerShift}hr)</h4>
      <div class="util-bar-row">
        <div class="util-bar-label"><span>Before</span><span>${mannedUtilBeforePct}%</span></div>
        <div class="util-bar-track"><div class="util-bar-fill blue" style="width:0%" data-target="${mannedUtilBeforePct}"></div></div>
      </div>
      <div class="util-bar-row">
        <div class="util-bar-label"><span>After</span><span>${mannedUtilAfterPct}%</span></div>
        <div class="util-bar-track"><div class="util-bar-fill blue" style="width:0%" data-target="${mannedUtilAfterPct}"></div></div>
      </div>
      <div class="impact-stats">
        <div class="impact-stat"><div class="label">Gained hrs/day</div><div class="value">${r.mannedGainHrs.toFixed(1)}</div></div>
        <div class="impact-stat"><div class="label">Annual Revenue</div><div class="value">${fmt(r.mannedGainRev)}</div></div>
      </div>
    </div>`;
  }
  if (r.unmannedShifts > 0) {
    shiftHTML += `
    <div class="impact-card teal">
      <h4>Unmanned Shifts (${r.unmannedShifts}x ${r.hrsPerShift}hr) <span class="new-badge">NEW REVENUE</span></h4>
      <div class="util-bar-row">
        <div class="util-bar-label"><span>Before</span><span>${unmannedUtilBeforePct}%</span></div>
        <div class="util-bar-track"><div class="util-bar-fill teal" style="width:0%" data-target="${unmannedUtilBeforePct}"></div></div>
      </div>
      <div class="util-bar-row">
        <div class="util-bar-label"><span>After</span><span>${unmannedUtilAfterPct}%</span></div>
        <div class="util-bar-track"><div class="util-bar-fill teal" style="width:0%" data-target="${unmannedUtilAfterPct}"></div></div>
      </div>
      <div class="impact-stats">
        <div class="impact-stat"><div class="label">NEW hrs/day</div><div class="value">${r.unmannedGainHrs.toFixed(1)}</div></div>
        <div class="impact-stat"><div class="label">NEW Annual Revenue</div><div class="value">${fmt(r.unmannedGainRev)}</div></div>
      </div>
    </div>`;
  }
  if (r.mannedShifts === 0 && r.unmannedShifts === 0) {
    shiftHTML = '<div class="impact-card blue"><h4>No shifts configured</h4><p style="color:var(--text-dim)">Go back and select at least one manned or unmanned shift.</p></div>';
  }
  document.getElementById('shiftImpact').innerHTML = shiftHTML;

  // Animate bars after render
  requestAnimationFrame(() => {
    setTimeout(() => {
      document.querySelectorAll('.util-bar-fill[data-target]').forEach(bar => {
        bar.style.width = bar.dataset.target + '%';
      });
    }, 100);
  });

  // Shift summary
  document.getElementById('shiftSummary').innerHTML = `
    <div class="sum-item"><div class="label">Productive hrs/day</div><div class="value">${r.totalHrsBefore.toFixed(1)} → ${r.totalHrsAfter.toFixed(1)}</div></div>
    <div class="sum-item"><div class="label">Hours gained/day</div><div class="value">+${r.totalGainHrs.toFixed(1)}</div></div>
    <div class="sum-item"><div class="label">Capacity multiplier</div><div class="value">${r.capacityMult.toFixed(1)}x</div></div>
  `;

  // Annual breakdown
  let breakdownHTML = `
    <div class="breakdown-row">
      <div><span class="label">Manned Shift Improvement</span><br><span class="detail">${r.mannedGainHrs.toFixed(1)} hrs/day × $${r.shopRate} × ${r.workingDays} days</span></div>
      <div class="value">${fmt(r.mannedGainRev)}</div>
    </div>`;
  if (r.unmannedShifts > 0) {
    breakdownHTML += `
    <div class="breakdown-row">
      <div><span class="label">Unmanned Shift NEW Revenue</span><br><span class="detail">${r.unmannedGainHrs.toFixed(1)} hrs/day × $${r.shopRate} × ${r.workingDays} days</span></div>
      <div class="value">${fmt(r.unmannedGainRev)}</div>
    </div>`;
  }
  breakdownHTML += `
    <div class="breakdown-row">
      <div><span class="label">Labor Reallocation Value</span><br><span class="detail">${r.mannedGainHrs.toFixed(1)} hrs × $${r.operatorWage} × ${r.workingDays} days × 50%</span></div>
      <div class="value">${fmt(r.laborSaving)}</div>
    </div>
    <div class="breakdown-row" style="font-weight:600">
      <div class="label">Gross Benefit</div>
      <div class="value">${fmt(r.grossBenefit)}</div>
    </div>
    <div class="breakdown-row cost">
      <div><span class="label">Less: Operating Costs (~$5/hr)</span><br><span class="detail">${r.totalAutoHrs.toFixed(1)} hrs/day × $5 × ${r.workingDays} days</span></div>
      <div class="value">-${fmt(r.opCost)}</div>
    </div>
    <div class="breakdown-row total">
      <div class="label">Net Annual Benefit</div>
      <div class="value">${fmt(r.netBenefit)}</div>
    </div>`;
  document.getElementById('breakdownCard').innerHTML = breakdownHTML;

  // Financing
  renderFinancing();

  // Section 179
  const taxSavings = r.investment * 0.21;
  const effectiveCost = r.investment - taxSavings;
  const adjustedPayback = r.paybackMonths * 0.79;
  state.results.taxSavings = taxSavings;
  state.results.effectiveCost = effectiveCost;
  state.results.adjustedPayback = adjustedPayback;

  document.getElementById('s179Callout').innerHTML = `
    <div class="s179-icon">&#167;</div>
    <div>
      <h4>Section 179 Tax Deduction</h4>
      <p>Equipment purchases may qualify for full first-year expensing under Section 179, significantly reducing effective cost.</p>
      <div class="s179-vals">
        <div class="s179-val"><div class="label">Tax Savings (21%)</div><div class="value">${fmt(taxSavings)}</div></div>
        <div class="s179-val"><div class="label">Effective Cost</div><div class="value">${fmt(effectiveCost)}</div></div>
        <div class="s179-val"><div class="label">Adj. Payback</div><div class="value">${adjustedPayback.toFixed(1)} mo</div></div>
      </div>
    </div>
  `;
}

// ===== FINANCING =====
function renderFinancing() {
  const r = state.results;
  const totalShifts = r.mannedShifts + r.unmannedShifts;

  const finHTML = `
    <div class="fin-inputs">
      <div class="input-group">
        <label>Down Payment %</label>
        <input type="range" id="finDown" min="0" max="50" step="5" value="${state.finDown}" class="slider slider-gold" style="width:100%">
        <span class="mono" id="finDownVal">${state.finDown}%</span>
      </div>
      <div class="input-group">
        <label>Interest Rate %</label>
        <input type="range" id="finRate" min="0" max="15" step="0.25" value="${state.finRate}" class="slider slider-gold" style="width:100%">
        <span class="mono" id="finRateVal">${state.finRate}%</span>
      </div>
      <div class="input-group">
        <label>Term (months)</label>
        <div class="fin-term-btns">
          ${[36,48,60,72,84].map(t => `<button class="fin-term-btn${t===state.finTerm?' active':''}" data-term="${t}">${t}mo</button>`).join('')}
        </div>
      </div>
    </div>
    <div class="fin-stats" id="finStatsCards"></div>
  `;
  document.getElementById('financingSection').innerHTML = finHTML;

  const updateFin = () => {
    const down = parseFloat(document.getElementById('finDown').value);
    const rate = parseFloat(document.getElementById('finRate').value);
    const term = state.finTerm;
    state.finDown = down;
    state.finRate = rate;
    document.getElementById('finDownVal').textContent = down + '%';
    document.getElementById('finRateVal').textContent = rate + '%';

    const principal = r.investment * (1 - down / 100);
    const mr = rate / 100 / 12;
    let monthly;
    if (mr === 0) {
      monthly = principal / term;
    } else {
      monthly = principal * mr * Math.pow(1 + mr, term) / (Math.pow(1 + mr, term) - 1);
    }
    const daily = monthly / 30;
    const hrsPerDay = totalShifts > 0 ? totalShifts * r.hrsPerShift : 8;
    const hourly = daily / hrsPerDay;

    state.results.finMonthly = monthly;
    state.results.finDaily = daily;
    state.results.finHourly = hourly;

    document.getElementById('finStatsCards').innerHTML = `
      <div class="fin-stat"><div class="label">Monthly</div><div class="value">${fmt(monthly)}</div><div class="sub">per month</div></div>
      <div class="fin-stat"><div class="label">Daily</div><div class="value">${fmt(daily)}</div><div class="sub">per working day</div></div>
      <div class="fin-stat"><div class="label">Hourly</div><div class="value">${fmt(hourly)}</div><div class="sub">You charge $${r.shopRate}/hr</div></div>
    `;
  };

  document.getElementById('finDown').addEventListener('input', updateFin);
  document.getElementById('finRate').addEventListener('input', updateFin);
  document.querySelectorAll('.fin-term-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.fin-term-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.finTerm = parseInt(btn.dataset.term);
      updateFin();
    });
  });

  updateFin();
}

// ===== PROPOSAL DOWNLOAD =====
function downloadProposal() {
  const r = state.results;
  const t = state.selectedTrinity;
  const m = state.selectedMachine;
  const custName = document.getElementById('custName').value || 'Valued Customer';
  const custCompany = document.getElementById('custCompany').value || '';
  const repName = document.getElementById('repName').value || 'Trinity Automation Sales Team';
  const today = new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Trinity Automation ROI Proposal — ${custCompany || custName}</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Outfit', sans-serif; color: #1A1A1A; background: #FFFFFF; max-width: 800px; margin: 0 auto; padding: 40px 32px; line-height: 1.5; }
  .mono { font-family: 'DM Mono', monospace; }
  .accent { color: #1A1A1A; font-weight: 700; }
  .header { border-bottom: 3px solid #D4A843; padding-bottom: 20px; margin-bottom: 24px; display: flex; align-items: flex-start; gap: 16px; }
  .header-logo { width: 44px; height: 44px; border-radius: 8px; background: #D4A843; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px; letter-spacing: 1px; flex-shrink: 0; margin-top: 4px; }
  .header-text h1 { font-size: 14px; letter-spacing: 3px; font-weight: 700; color: #1A1A1A; }
  .header-text h2 { font-size: 28px; font-weight: 700; margin-top: 4px; color: #1A1A1A; }
  .header-meta { display: flex; gap: 32px; font-size: 13px; color: #333333; margin-top: 10px; }
  .section { margin-bottom: 28px; }
  .section h3 { font-size: 16px; font-weight: 700; border-bottom: 1px solid #E0E0E0; padding-bottom: 6px; margin-bottom: 12px; color: #1A1A1A; }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
  .grid4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px; }
  .stat { background: #F9F9F9; border: 1px solid #E0E0E0; border-radius: 8px; padding: 14px; }
  .stat .label { font-size: 11px; color: #333333; }
  .stat .value { font-family: 'DM Mono', monospace; font-size: 22px; font-weight: 600; color: #1A1A1A; }
  .stat .sub { font-size: 11px; color: #555555; }
  .stat-highlight { background: rgba(212,168,67,0.08); border-color: #D4A843; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; color: #1A1A1A; }
  th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #E0E0E0; }
  th { font-weight: 600; color: #333333; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
  td.num { font-family: 'DM Mono', monospace; text-align: right; color: #1A1A1A; }
  .total-row { font-weight: 700; border-top: 2px solid #D4A843; }
  .total-row td.num { color: #1A1A1A; font-size: 16px; font-weight: 700; }
  .cost-row td.num { color: #1A1A1A; }
  .callout { background: rgba(212,168,67,0.07); border: 1px solid rgba(212,168,67,0.25); border-radius: 8px; padding: 16px; margin-top: 20px; }
  .callout h4 { color: #1A1A1A; font-size: 14px; font-weight: 700; margin-bottom: 4px; }
  .callout p { font-size: 13px; color: #333333; }
  .cta { background: #D4A843; color: #1A1A1A; border-radius: 8px; padding: 24px; text-align: center; margin-top: 32px; }
  .cta h3 { font-size: 20px; margin-bottom: 6px; font-weight: 700; }
  .cta p { font-size: 14px; opacity: 0.85; }
  .footer { text-align: center; font-size: 11px; color: #333333; margin-top: 40px; padding-top: 16px; border-top: 1px solid #E0E0E0; }
  .bar-row { margin-bottom: 6px; }
  .bar-label { display: flex; justify-content: space-between; font-size: 11px; color: #333333; }
  .bar-track { height: 8px; background: #E0E0E0; border-radius: 4px; }
  .bar-fill { height: 100%; border-radius: 4px; background: #D4A843; }
  .bar-fill.blue { background: #1565C0; }
  @media print { body { padding: 20px; } .cta { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
<div class="header">
  <div class="header-logo">TRA</div>
  <div class="header-text">
    <h1>TRINITY AUTOMATION</h1>
    <h2>Trinity Automation ROI Proposal</h2>
    <div class="header-meta">
      <span>Prepared for: <strong>${custName}</strong>${custCompany ? ' — ' + custCompany : ''}</span>
      <span>Date: ${today}</span>
      <span>Rep: ${repName}</span>
    </div>
  </div>
</div>

<div class="section">
  <h3>System Configuration</h3>
  <div class="grid2">
    <div class="stat"><div class="label">CNC Machine</div><div class="value" style="font-size:18px">${m.brand} ${m.model}</div><div class="sub">${m.type} · ${m.axes}-Axis</div></div>
    <div class="stat"><div class="label">Automation System</div><div class="value" style="font-size:18px">${t.name}</div><div class="sub">${t.sub} · ${t.pallets} pallets · ${t.weight}</div></div>
  </div>
</div>

<div class="section">
  <h3>Production Profile</h3>
  <div class="grid4">
    <div class="stat"><div class="label">Shop Rate</div><div class="value" style="font-size:18px">$${r.shopRate}/hr</div></div>
    <div class="stat"><div class="label">Manned Shifts</div><div class="value" style="font-size:18px">${r.mannedShifts}</div><div class="sub">${r.hrsPerShift} hrs each</div></div>
    <div class="stat"><div class="label">Unmanned Shifts</div><div class="value" style="font-size:18px">${r.unmannedShifts}</div><div class="sub">${r.hrsPerShift} hrs each</div></div>
    <div class="stat"><div class="label">Working Days</div><div class="value" style="font-size:18px">${r.workingDays}</div><div class="sub">per year</div></div>
  </div>
</div>

<div class="section">
  <h3>Return on Investment</h3>
  <div class="grid4">
    <div class="stat stat-highlight"><div class="label">Net Annual Benefit</div><div class="value">${fmt(r.netBenefit)}</div></div>
    <div class="stat"><div class="label">Payback Period</div><div class="value">${r.paybackMonths.toFixed(1)}</div><div class="sub">months</div></div>
    <div class="stat"><div class="label">Year 1 ROI</div><div class="value">${r.year1ROI.toFixed(0)}%</div></div>
    <div class="stat"><div class="label">Year 5 ROI</div><div class="value">${r.year5ROI.toFixed(0)}%</div></div>
  </div>
</div>

<div class="section">
  <h3>Shift-by-Shift Impact</h3>
  <div class="grid2">
    ${r.mannedShifts > 0 ? `<div class="stat">
      <div class="label">Manned Shifts — Utilization</div>
      <div class="bar-row"><div class="bar-label"><span>Before</span><span>${(r.mannedUtilBefore*100).toFixed(0)}%</span></div><div class="bar-track"><div class="bar-fill blue" style="width:${(r.mannedUtilBefore*100)}%"></div></div></div>
      <div class="bar-row"><div class="bar-label"><span>After</span><span>${(r.mannedUtilAfter*100).toFixed(0)}%</span></div><div class="bar-track"><div class="bar-fill blue" style="width:${(r.mannedUtilAfter*100)}%"></div></div></div>
      <div style="margin-top:8px;font-size:12px;color:#6b7280">+${r.mannedGainHrs.toFixed(1)} hrs/day · ${fmt(r.mannedGainRev)}/yr</div>
    </div>` : ''}
    ${r.unmannedShifts > 0 ? `<div class="stat">
      <div class="label">Unmanned (Lights-Out) — NEW REVENUE</div>
      <div class="bar-row"><div class="bar-label"><span>Before</span><span>${(r.unmannedUtilBefore*100).toFixed(0)}%</span></div><div class="bar-track"><div class="bar-fill" style="width:${Math.max(r.unmannedUtilBefore*100,1)}%"></div></div></div>
      <div class="bar-row"><div class="bar-label"><span>After</span><span>${(r.unmannedUtilAfter*100).toFixed(0)}%</span></div><div class="bar-track"><div class="bar-fill" style="width:${(r.unmannedUtilAfter*100)}%"></div></div></div>
      <div style="margin-top:8px;font-size:12px;color:#6b7280">+${r.unmannedGainHrs.toFixed(1)} NEW hrs/day · ${fmt(r.unmannedGainRev)}/yr</div>
    </div>` : ''}
  </div>
</div>

<div class="section">
  <h3>Annual Benefit Breakdown</h3>
  <table>
    <tr><td>Manned Shift Improvement</td><td class="num">${fmt(r.mannedGainRev)}</td></tr>
    ${r.unmannedShifts > 0 ? `<tr><td>Unmanned Shift NEW Revenue</td><td class="num">${fmt(r.unmannedGainRev)}</td></tr>` : ''}
    <tr><td>Labor Reallocation Value</td><td class="num">${fmt(r.laborSaving)}</td></tr>
    <tr style="font-weight:600"><td>Gross Benefit</td><td class="num">${fmt(r.grossBenefit)}</td></tr>
    <tr class="cost-row"><td>Less: Operating Costs (~$5/hr)</td><td class="num">-${fmt(r.opCost)}</td></tr>
    <tr class="total-row"><td>Net Annual Benefit</td><td class="num">${fmt(r.netBenefit)}</td></tr>
  </table>
</div>

<div class="section">
  <h3>Financing</h3>
  <div class="grid3">
    <div class="stat"><div class="label">Monthly Payment</div><div class="value" style="font-size:18px">${fmt(r.finMonthly)}</div><div class="sub">${state.finDown}% down · ${state.finRate}% · ${state.finTerm}mo</div></div>
    <div class="stat"><div class="label">Daily Cost</div><div class="value" style="font-size:18px">${fmt(r.finDaily)}</div></div>
    <div class="stat"><div class="label">Hourly Cost</div><div class="value" style="font-size:18px">${fmt(r.finHourly)}</div><div class="sub">You charge $${r.shopRate}/hr</div></div>
  </div>
  <div class="callout">
    <h4>&#167; Section 179 Tax Deduction</h4>
    <p>Estimated tax savings: <strong class="mono">${fmt(r.taxSavings)}</strong> (21% federal rate). Effective cost after deduction: <strong class="mono">${fmt(r.effectiveCost)}</strong>. Adjusted payback: <strong class="mono">${r.adjustedPayback.toFixed(1)} months</strong>.</p>
  </div>
</div>

<div class="cta">
  <h3>Ready to Automate?</h3>
  <p>${repName} · Trinity Automation</p>
  <p>800-762-6864 · sales@trinityautomation.com</p>
</div>

<div class="footer">
  TRINITY AUTOMATION · Since 2004 · 431 Nelo Street, Santa Clara, CA 95054 · 800-762-6864 · trinityautomation.com
</div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Trinity_ROI_Proposal_${(custCompany || custName).replace(/\s+/g, '_')}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
