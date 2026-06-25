const state = {
  data: [],
  filtered: []
};

const els = {
  stats: document.getElementById("stats"),
  search: document.getElementById("search"),
  scopeFilter: document.getElementById("scopeFilter"),
  opennessFilter: document.getElementById("opennessFilter"),
  modalityFilter: document.getElementById("modalityFilter"),
  resetBtn: document.getElementById("resetBtn"),
  tbody: document.querySelector("#catalogueTable tbody"),
  details: document.getElementById("details")
};

function uniq(arr) {
  return [...new Set(arr.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function tag(text, cls = "") {
  return `<span class="badge ${cls}">${escapeHtml(text || "unknown")}</span>`;
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[c]));
}

function truncate(s, n = 95) {
  s = String(s ?? "");
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

function buildFilters() {
  const scopes = uniq(state.data.map(d => d.scope));
  const openness = uniq(state.data.map(d => d.openness));
  const modalities = uniq(state.data.flatMap(d => d.modality_tags || []));

  for (const s of scopes) els.scopeFilter.insertAdjacentHTML("beforeend", `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`);
  for (const o of openness) els.opennessFilter.insertAdjacentHTML("beforeend", `<option value="${escapeHtml(o)}">${escapeHtml(o)}</option>`);
  for (const m of modalities) els.modalityFilter.insertAdjacentHTML("beforeend", `<option value="${escapeHtml(m)}">${escapeHtml(m)}</option>`);
}

function renderStats() {
  const total = state.data.length;
  const open = state.data.filter(d => d.openness === "open").length;
  const strong = state.data.filter(d => String(d.fm_strength || "").toLowerCase().includes("strong")).length;
  const vlm = state.data.filter(d => String(d.scope || "").toLowerCase().includes("language")).length;

  els.stats.innerHTML = `
    <div class="stat-card"><div class="num">${total}</div><div class="label">Catalogue entries</div></div>
    <div class="stat-card"><div class="num">${open}</div><div class="label">Marked open</div></div>
    <div class="stat-card"><div class="num">${strong}</div><div class="label">Strong or strong/emerging</div></div>
    <div class="stat-card"><div class="num">${vlm}</div><div class="label">Vision-language / MLLM entries</div></div>
  `;
}

function rowText(d) {
  return [
    d.name, d.scope, d.input_modality, d.architecture, d.downstream_tasks,
    d.training_scale, d.openness_text, d.fm_strength, d.notes, d.primary_source_url,
    ...(d.modality_tags || []), ...(d.architecture_tags || [])
  ].join(" ").toLowerCase();
}

function applyFilters() {
  const q = els.search.value.trim().toLowerCase();
  const scope = els.scopeFilter.value;
  const open = els.opennessFilter.value;
  const mod = els.modalityFilter.value;

  state.filtered = state.data.filter(d => {
    if (q && !rowText(d).includes(q)) return false;
    if (scope && d.scope !== scope) return false;
    if (open && d.openness !== open) return false;
    if (mod && !(d.modality_tags || []).includes(mod)) return false;
    return true;
  });
  renderTable();
}

function renderTable() {
  els.tbody.innerHTML = "";
  for (const d of state.filtered) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="name">${escapeHtml(d.name)}</td>
      <td>${escapeHtml(d.scope)}</td>
      <td>${(d.modality_tags || []).map(x => tag(x)).join("") || escapeHtml(truncate(d.input_modality, 60))}</td>
      <td>${(d.architecture_tags || []).map(x => tag(x)).join("") || escapeHtml(truncate(d.architecture, 60))}</td>
      <td>${tag(d.openness || "unknown", d.openness || "unknown")}</td>
      <td>${escapeHtml(d.review_status)}</td>
      <td>${d.primary_source_url ? `<a href="${escapeHtml(d.primary_source_url)}" target="_blank" rel="noreferrer">source</a>` : ""}</td>
    `;
    tr.addEventListener("click", () => renderDetails(d));
    els.tbody.appendChild(tr);
  }
}

function renderDetails(d) {
  els.details.classList.remove("empty");
  els.details.innerHTML = `
    <h3>${escapeHtml(d.name)}</h3>
    <div class="detail-grid">
      <div class="detail-key">Scope</div><div>${escapeHtml(d.scope)}</div>
      <div class="detail-key">Input modality</div><div>${escapeHtml(d.input_modality)}</div>
      <div class="detail-key">Architecture</div><div>${escapeHtml(d.architecture)}</div>
      <div class="detail-key">Tasks</div><div>${escapeHtml(d.downstream_tasks)}</div>
      <div class="detail-key">Training scale</div><div>${escapeHtml(d.training_scale)}</div>
      <div class="detail-key">Openness</div><div>${escapeHtml(d.openness_text)}</div>
      <div class="detail-key">FM strength</div><div>${escapeHtml(d.fm_strength)}</div>
      <div class="detail-key">Notes</div><div>${escapeHtml(d.notes)}</div>
      <div class="detail-key">Source</div><div>${d.primary_source_url ? `<a href="${escapeHtml(d.primary_source_url)}" target="_blank" rel="noreferrer">${escapeHtml(d.primary_source_url)}</a>` : ""}</div>
    </div>
  `;
}

async function init() {
  const res = await fetch("data/catalogue.json");
  state.data = await res.json();
  state.filtered = state.data.slice();
  buildFilters();
  renderStats();
  renderTable();

  [els.search, els.scopeFilter, els.opennessFilter, els.modalityFilter].forEach(el => {
    el.addEventListener("input", applyFilters);
    el.addEventListener("change", applyFilters);
  });
  els.resetBtn.addEventListener("click", () => {
    els.search.value = "";
    els.scopeFilter.value = "";
    els.opennessFilter.value = "";
    els.modalityFilter.value = "";
    applyFilters();
  });
}

init().catch(err => {
  console.error(err);
  document.querySelector(".container").insertAdjacentHTML(
    "afterbegin",
    `<div class="panel"><b>Could not load data.</b> Serve this folder with a local web server or deploy it on GitHub Pages.</div>`
  );
});
