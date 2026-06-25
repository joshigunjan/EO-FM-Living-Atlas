const landscape = {
  data: [],
  filtered: [],
  selectedId: null,
  labelMode: false
};

const L = {
  search: document.getElementById("landscapeSearch"),
  open: document.getElementById("landscapeOpen"),
  modality: document.getElementById("landscapeModality"),
  architecture: document.getElementById("landscapeArchitecture"),
  labels: document.getElementById("showLabels"),
  reset: document.getElementById("landscapeReset"),
  plot: document.getElementById("landscapePlot"),
  count: document.getElementById("landscapeCount"),
  legend: document.getElementById("landscapeLegend"),
  title: document.getElementById("landscapeTitle"),
  details: document.getElementById("landscapeDetails")
};

function uniq(arr) {
  return [...new Set(arr.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[c]));
}

function truncate(s, n = 145) {
  s = String(s ?? "");
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

function tag(text, cls = "") {
  return `<span class="badge ${cls}">${escapeHtml(text || "unknown")}</span>`;
}

function linkButton(label, url) {
  if (!url) return "";
  return `<a class="link-pill" href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${escapeHtml(label)}</a>`;
}

function hash01(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

function modalityCount(d) {
  const tags = (d.modality_tags || []).length;
  const text = String(d.input_modality || "");
  const match = text.match(/(^|\s)(\d{1,2})\s+(?:reported\s+)?(?:geospatial\s+)?modalit/i);
  const reported = match ? Number(match[2]) : 0;
  return Math.max(tags, reported, 1);
}

function taskCount(d) {
  return Math.max((d.task_tags || []).length, 1);
}

function rowText(d) {
  return [d.name, d.category, d.scope, d.input_modality, d.architecture, d.downstream_tasks, d.openness_label, d.openness, ...(d.modality_tags || []), ...(d.architecture_tags || []), ...(d.task_tags || [])].join(" ").toLowerCase();
}

function buildFilters() {
  for (const o of uniq(landscape.data.map(d => d.openness_label || d.openness))) {
    L.open.insertAdjacentHTML("beforeend", `<option value="${escapeHtml(o)}">${escapeHtml(o)}</option>`);
  }
  for (const m of uniq(landscape.data.flatMap(d => d.modality_tags || []))) {
    L.modality.insertAdjacentHTML("beforeend", `<option value="${escapeHtml(m)}">${escapeHtml(m)}</option>`);
  }
  for (const a of uniq(landscape.data.flatMap(d => d.architecture_tags || []))) {
    L.architecture.insertAdjacentHTML("beforeend", `<option value="${escapeHtml(a)}">${escapeHtml(a)}</option>`);
  }
}

function applyFilters() {
  const q = L.search.value.trim().toLowerCase();
  const open = L.open.value;
  const modality = L.modality.value;
  const architecture = L.architecture.value;

  landscape.filtered = landscape.data.filter(d => {
    if (q && !rowText(d).includes(q)) return false;
    if (open && (d.openness_label || d.openness) !== open) return false;
    if (modality && !(d.modality_tags || []).includes(modality)) return false;
    if (architecture && !(d.architecture_tags || []).includes(architecture)) return false;
    return true;
  });
  renderLandscape();
}

function opennessClass(d) {
  return `point-${(d.openness || "unknown").toLowerCase()}`;
}

function renderLegend() {
  L.legend.innerHTML = [
    ["open", "Open"],
    ["partial", "Partial"],
    ["closed", "Closed"],
    ["unknown", "Unknown"]
  ].map(([cls, label]) => `<span class="legend-item"><span class="legend-dot point-${cls}"></span>${label}</span>`).join("");
}

function renderLandscape() {
  const w = 1000, h = 620;
  const m = { left: 74, right: 34, top: 32, bottom: 78 };
  const innerW = w - m.left - m.right;
  const innerH = h - m.top - m.bottom;
  const all = landscape.data;
  const visible = landscape.filtered;
  const xMax = Math.max(...all.map(modalityCount), 4);
  const yMax = Math.max(...all.map(taskCount), 6);
  const xScale = x => m.left + ((x - 1) / Math.max(1, xMax - 1)) * innerW;
  const yScale = y => m.top + (1 - ((y - 1) / Math.max(1, yMax - 1))) * innerH;
  const ticksX = Array.from({length: xMax}, (_, i) => i + 1);
  const ticksY = Array.from({length: yMax}, (_, i) => i + 1).filter(v => v === 1 || v === yMax || v % 2 === 0);

  L.count.textContent = `${visible.length} of ${all.length} entries shown`;

  let svg = `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet">`;
  svg += `<defs><filter id="softShadow" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#0f172a" flood-opacity="0.14"/></filter></defs>`;
  svg += `<rect x="0" y="0" width="${w}" height="${h}" rx="22" fill="#ffffff"/>`;
  svg += `<rect x="${m.left}" y="${m.top}" width="${innerW}" height="${innerH}" rx="14" fill="#f8fafc"/>`;

  for (const t of ticksX) {
    const x = xScale(t);
    svg += `<line x1="${x}" y1="${m.top}" x2="${x}" y2="${m.top + innerH}" stroke="#e2e8f0"/>`;
    svg += `<text x="${x}" y="${m.top + innerH + 28}" text-anchor="middle" class="axis-label">${t}</text>`;
  }
  for (const t of ticksY) {
    const y = yScale(t);
    svg += `<line x1="${m.left}" y1="${y}" x2="${m.left + innerW}" y2="${y}" stroke="#e2e8f0"/>`;
    svg += `<text x="${m.left - 16}" y="${y + 5}" text-anchor="end" class="axis-label">${t}</text>`;
  }

  svg += `<line x1="${m.left}" y1="${m.top + innerH}" x2="${m.left + innerW}" y2="${m.top + innerH}" stroke="#94a3b8"/>`;
  svg += `<line x1="${m.left}" y1="${m.top}" x2="${m.left}" y2="${m.top + innerH}" stroke="#94a3b8"/>`;
  svg += `<text x="${m.left + innerW / 2}" y="${h - 24}" text-anchor="middle" class="axis-title">Reported modality breadth</text>`;
  svg += `<text transform="translate(24 ${m.top + innerH / 2}) rotate(-90)" text-anchor="middle" class="axis-title">Downstream-task labels</text>`;

  visible.forEach(d => {
    const jitterX = (hash01(d.id + "x") - 0.5) * 28;
    const jitterY = (hash01(d.id + "y") - 0.5) * 22;
    const cx = xScale(modalityCount(d)) + jitterX;
    const cy = yScale(taskCount(d)) + jitterY;
    const r = Math.min(15, 5.5 + Math.sqrt(taskCount(d)) * 1.8);
    const selected = d.id === landscape.selectedId ? " selected-point" : "";
    svg += `<g class="model-node${selected}" data-id="${escapeHtml(d.id)}" tabindex="0" role="button" aria-label="${escapeHtml(d.name)}">`;
    svg += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" class="landscape-point ${opennessClass(d)}" filter="url(#softShadow)"></circle>`;
    svg += `<title>${escapeHtml(d.name)}\nModalities: ${modalityCount(d)}\nTask labels: ${taskCount(d)}\n${escapeHtml(d.openness_label || d.openness || "")}</title>`;
    if (landscape.labelMode || selected) {
      const labelY = cy - r - 8;
      svg += `<text x="${cx.toFixed(1)}" y="${labelY.toFixed(1)}" text-anchor="middle" class="point-label">${escapeHtml(d.name)}</text>`;
    }
    svg += `</g>`;
  });

  svg += `</svg>`;
  L.plot.innerHTML = svg;

  L.plot.querySelectorAll(".model-node").forEach(node => {
    node.addEventListener("click", () => {
      const d = landscape.data.find(x => x.id === node.dataset.id);
      if (d) renderDetails(d);
    });
    node.addEventListener("keydown", ev => {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        const d = landscape.data.find(x => x.id === node.dataset.id);
        if (d) renderDetails(d);
      }
    });
  });
}

function renderDetails(d) {
  landscape.selectedId = d.id;
  L.title.textContent = d.name;
  L.details.classList.remove("empty");
  L.details.innerHTML = `
    <div class="detail-actions">${linkButton("Paper", d.paper_url)}${linkButton("Code", d.code_url)}${linkButton("Weights", d.weights_url)}${linkButton("Project", d.project_url)}</div>
    <div class="detail-section"><h3>Position on map</h3><p>${modalityCount(d)} recorded modality inputs; ${taskCount(d)} downstream task labels.</p></div>
    <div class="detail-section"><h3>Scope</h3><p>${escapeHtml(d.scope)}</p></div>
    <div class="detail-section"><h3>Modalities</h3><p>${escapeHtml(d.input_modality)}</p><div>${(d.modality_tags || []).map(x => tag(x)).join("")}</div></div>
    <div class="detail-section"><h3>Architecture</h3><p>${escapeHtml(d.architecture)}</p><div>${(d.architecture_tags || []).map(x => tag(x, "arch")).join("")}</div></div>
    <div class="detail-section"><h3>Downstream tasks</h3><div>${(d.task_tags || []).map(x => tag(x, "task")).join("")}</div><p>${escapeHtml(truncate(d.downstream_tasks, 360))}</p></div>
    <div class="detail-section"><h3>Openness</h3><p>${escapeHtml(d.openness_text || d.openness_label || "Unknown")}</p></div>
  `;
  renderLandscape();
}

async function initLandscape() {
  const res = await fetch("data/catalogue.json");
  landscape.data = await res.json();
  landscape.filtered = landscape.data.slice();
  buildFilters();
  renderLegend();
  renderLandscape();
  [L.search, L.open, L.modality, L.architecture].forEach(el => {
    el.addEventListener("input", applyFilters);
    el.addEventListener("change", applyFilters);
  });
  L.labels.addEventListener("change", () => {
    landscape.labelMode = L.labels.checked;
    renderLandscape();
  });
  L.reset.addEventListener("click", () => {
    L.search.value = "";
    L.open.value = "";
    L.modality.value = "";
    L.architecture.value = "";
    L.labels.checked = false;
    landscape.labelMode = false;
    landscape.selectedId = null;
    L.title.textContent = "No model selected";
    L.details.className = "details empty";
    L.details.textContent = "Click a point on the landscape. The model summary and source links will open here.";
    applyFilters();
  });
}

initLandscape().catch(err => {
  console.error(err);
  document.querySelector(".container").insertAdjacentHTML("afterbegin", `<div class="panel"><b>Could not load data.</b> Serve this folder with a local web server or deploy it on GitHub Pages.</div>`);
});
