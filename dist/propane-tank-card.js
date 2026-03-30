// ─────────────────────────────────────────────
//  PROPANE TANK CARD — Visual Editor
// ─────────────────────────────────────────────
class PropaneTankCardEditor extends HTMLElement {
  _config = {};

  setConfig(config) {
    this._config = { ...config };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._rendered) this._render();
  }

  _dispatch() {
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: { ...this._config } },
        bubbles: true,
        composed: true,
      })
    );
  }

  _render() {
    this._rendered = true;
    const thresholds = this._config.thresholds || [
      { level: 20, color: "#d9534f", label: "Low" },
      { level: 40, color: "#f0ad4e", label: "Mid" },
      { level: 100, color: "#6ab42d", label: "Good" },
    ];
    const historyHours = this._config.history_hours ?? 168;
    const showTitle = this._config.show_title !== false;

    this.innerHTML = `
      <style>
        .editor {
          padding: 16px;
          font-family: var(--paper-font-body1_-_font-family, sans-serif);
          color: var(--primary-text-color, #333);
        }
        .editor label {
          display: block;
          font-weight: 500;
          margin: 14px 0 4px;
          font-size: 14px;
        }
        .editor input, .editor select {
          width: 100%;
          padding: 8px 10px;
          border: 1px solid var(--divider-color, #ccc);
          border-radius: 8px;
          font-size: 14px;
          background: var(--card-background-color, #fff);
          color: var(--primary-text-color, #333);
          box-sizing: border-box;
        }
        .editor input:focus, .editor select:focus {
          outline: none;
          border-color: var(--primary-color, #03a9f4);
        }
        .section-title {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: var(--secondary-text-color, #888);
          margin: 22px 0 6px;
          padding-bottom: 6px;
          border-bottom: 1px solid var(--divider-color, #e0e0e0);
        }
        .hint {
          font-size: 12px;
          color: var(--secondary-text-color, #999);
          margin-top: 3px;
          line-height: 1.4;
        }
        .toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 12px 0;
        }
        .toggle-label {
          font-size: 14px;
          font-weight: 500;
        }
        .toggle {
          position: relative;
          width: 44px;
          height: 24px;
          flex-shrink: 0;
        }
        .toggle input {
          opacity: 0;
          width: 0;
          height: 0;
          position: absolute;
        }
        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background: var(--divider-color, #ccc);
          border-radius: 24px;
          transition: 0.25s;
        }
        .toggle-slider::before {
          content: "";
          position: absolute;
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background: white;
          border-radius: 50%;
          transition: 0.25s;
        }
        .toggle input:checked + .toggle-slider {
          background: var(--primary-color, #03a9f4);
        }
        .toggle input:checked + .toggle-slider::before {
          transform: translateX(20px);
        }
        .threshold-row {
          display: flex;
          gap: 6px;
          align-items: center;
          margin-bottom: 8px;
        }
        .threshold-row input[type="number"] {
          width: 64px;
          flex-shrink: 0;
          text-align: center;
        }
        .threshold-row input[type="text"] {
          flex: 1;
          min-width: 0;
        }
        .threshold-row input[type="color"] {
          width: 40px;
          height: 36px;
          padding: 2px;
          cursor: pointer;
          flex-shrink: 0;
          border-radius: 8px;
          border: 1px solid var(--divider-color, #ccc);
        }
        .btn {
          padding: 6px 14px;
          border: 1px solid var(--divider-color, #ccc);
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          background: var(--card-background-color, #fff);
          color: var(--primary-text-color, #333);
        }
        .btn:hover { background: var(--secondary-background-color, #f5f5f5); }
        .btn-remove {
          color: var(--error-color, #d9534f);
          border-color: var(--error-color, #d9534f);
          padding: 6px 10px;
          flex-shrink: 0;
          background: transparent;
        }
      </style>

      <div class="editor">
        <label for="editor-entity">Entity</label>
        <input id="editor-entity" type="text" placeholder="sensor.propane_tank_level"
               value="${this._config.entity || ""}"/>
        <div class="hint">Sensor reporting 0–100 (propane, water, battery, etc.)</div>

        <div class="toggle-row">
          <span class="toggle-label">Show Title</span>
          <label class="toggle">
            <input type="checkbox" id="editor-show-title" ${showTitle ? "checked" : ""}/>
            <span class="toggle-slider"></span>
          </label>
        </div>

        <label for="editor-title">Card Title</label>
        <input id="editor-title" type="text" placeholder="Propane Tank"
               value="${this._config.title || ""}"/>

        <div class="section-title">History Chart</div>
        <label for="editor-history">Default Time Range</label>
        <select id="editor-history">
          <option value="24"  ${historyHours == 24 ? "selected" : ""}>24 Hours</option>
          <option value="72"  ${historyHours == 72 ? "selected" : ""}>3 Days</option>
          <option value="168" ${historyHours == 168 ? "selected" : ""}>7 Days</option>
          <option value="336" ${historyHours == 336 ? "selected" : ""}>14 Days</option>
          <option value="720" ${historyHours == 720 ? "selected" : ""}>30 Days</option>
        </select>
        <div class="hint">Tap the card to expand the history chart. This sets the default range.</div>

        <div class="section-title">Color Thresholds</div>
        <div class="hint" style="margin-bottom:10px;">
          Each row: "up to <em>level</em>%, use this color." Sorted automatically.
        </div>
        <div id="editor-thresholds">
          ${thresholds
            .map(
              (t, i) => `
            <div class="threshold-row" data-index="${i}">
              <input type="color" class="thr-color" value="${t.color}" title="Color"/>
              <input type="number" class="thr-level" value="${t.level}" min="0" max="100" title="Up to this %"/>
              <input type="text" class="thr-label" value="${t.label || ""}" placeholder="Label"/>
              <button class="btn btn-remove thr-remove" title="Remove">✕</button>
            </div>`
            )
            .join("")}
        </div>
        <button class="btn" id="editor-add-threshold" style="margin-top:4px;">+ Add Threshold</button>
      </div>
    `;

    // ── Listeners ──
    this.querySelector("#editor-entity").addEventListener("change", (e) => {
      this._config.entity = e.target.value.trim();
      this._dispatch();
    });
    this.querySelector("#editor-title").addEventListener("input", (e) => {
      this._config.title = e.target.value;
      this._dispatch();
    });
    this.querySelector("#editor-show-title").addEventListener("change", (e) => {
      this._config.show_title = e.target.checked;
      this._dispatch();
    });
    this.querySelector("#editor-history").addEventListener("change", (e) => {
      this._config.history_hours = parseInt(e.target.value);
      this._dispatch();
    });
    this.querySelectorAll(".thr-level, .thr-color, .thr-label").forEach((el) => {
      el.addEventListener("change", () => this._collectThresholds());
    });
    this.querySelectorAll(".thr-remove").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const idx = parseInt(e.target.closest(".threshold-row").dataset.index);
        const t = [...(this._config.thresholds || thresholds)];
        t.splice(idx, 1);
        this._config.thresholds = t;
        this._dispatch();
        this._render();
      });
    });
    this.querySelector("#editor-add-threshold").addEventListener("click", () => {
      const t = [...(this._config.thresholds || thresholds)];
      t.push({ level: 100, color: "#6ab42d", label: "" });
      this._config.thresholds = t;
      this._dispatch();
      this._render();
    });
  }

  _collectThresholds() {
    const rows = this.querySelectorAll(".threshold-row");
    const t = [];
    rows.forEach((row) => {
      t.push({
        level: parseInt(row.querySelector(".thr-level").value) || 0,
        color: row.querySelector(".thr-color").value,
        label: row.querySelector(".thr-label").value,
      });
    });
    this._config.thresholds = t;
    this._dispatch();
  }
}
customElements.define("propane-tank-card-editor", PropaneTankCardEditor);


// ─────────────────────────────────────────────
//  PROPANE TANK CARD — Main Card
// ─────────────────────────────────────────────
class PropaneTankCard extends HTMLElement {
  static getConfigElement() {
    return document.createElement("propane-tank-card-editor");
  }

  static getStubConfig() {
    return {
      entity: "",
      title: "Propane Tank",
      show_title: true,
      history_hours: 168,
      thresholds: [
        { level: 20, color: "#d9534f", label: "Low" },
        { level: 40, color: "#f0ad4e", label: "Mid" },
        { level: 100, color: "#6ab42d", label: "Good" },
      ],
    };
  }

  setConfig(config) {
    if (!config.entity) throw new Error("Please define an entity.");
    this._config = {
      title: "Propane Tank",
      show_title: true,
      history_hours: 168,
      thresholds: [
        { level: 20, color: "#d9534f", label: "Low" },
        { level: 40, color: "#f0ad4e", label: "Mid" },
        { level: 100, color: "#6ab42d", label: "Good" },
      ],
      ...config,
    };
    this._config.thresholds = [...this._config.thresholds].sort((a, b) => a.level - b.level);
    this._expanded = false;
    this._selectedRange = this._config.history_hours;

    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this._buildCard();
  }

  set hass(hass) {
    this._hass = hass;
    this._updateTank();
  }

  // ── Color helpers ──
  _getColor(level) {
    for (const t of this._config.thresholds) {
      if (level <= t.level) return t.color;
    }
    return this._config.thresholds[this._config.thresholds.length - 1]?.color || "#6ab42d";
  }

  _lighten(hex, amt = 45) {
    const n = parseInt(hex.replace("#", ""), 16);
    const r = Math.min(255, (n >> 16) + amt);
    const g = Math.min(255, ((n >> 8) & 0xff) + amt);
    const b = Math.min(255, (n & 0xff) + amt);
    return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
  }

  // ── Build DOM ──
  _buildCard() {
    const s = this.shadowRoot;
    s.innerHTML = `
      <style>
        :host { display: block; }

        ha-card {
          padding: 16px 16px 12px;
          cursor: pointer;
          overflow: hidden;
        }

        .card-title {
          font-size: 16px;
          font-weight: 500;
          color: var(--primary-text-color, #333);
          margin-bottom: 8px;
        }

        /* ── Tank ── */
        .tank-area {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .tank-wrapper {
          position: relative;
          width: 280px;
          height: 150px;
          margin: 8px 0 0;
        }
        .valve {
          position: absolute;
          top: -16px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 3;
        }
        .valve-handle {
          width: 36px;
          height: 9px;
          background: var(--primary-text-color, #1a1a1a);
          border-radius: 3px;
          margin: 0 auto;
        }
        .valve-base {
          width: 24px;
          height: 18px;
          background: var(--primary-text-color, #1a1a1a);
          border-radius: 3px 3px 0 0;
          margin: -1px auto 0;
        }
        .tank {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 130px;
          background: var(--secondary-background-color, #e8e8e8);
          border: 6px solid var(--primary-text-color, #1a1a1a);
          border-radius: 65px;
          overflow: hidden;
        }
        .tank-fill {
          position: absolute;
          bottom: 0; left: 0;
          width: 100%; height: 0%;
          transition: height 1s cubic-bezier(0.4, 0, 0.2, 1), background 0.5s ease;
        }
        .tank-fill::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 4px;
          opacity: 0.85;
        }
        .feet {
          position: absolute;
          bottom: -7px; left: 0; width: 100%;
          display: flex;
          justify-content: space-between;
          padding: 0 46px;
          z-index: 2;
        }
        .foot {
          width: 22px; height: 10px;
          background: var(--primary-text-color, #1a1a1a);
          border-radius: 0 0 4px 4px;
        }
        .badge {
          position: absolute;
          right: -14px; bottom: -6px;
          width: 64px; height: 64px;
          background: var(--card-background-color, #f0f0f0);
          border: 4px solid #6ab42d;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 4;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
          transition: border-color 0.5s ease;
        }
        .badge-text {
          font-size: 20px;
          font-weight: 700;
          color: var(--primary-text-color, #2c3e50);
          letter-spacing: -0.5px;
        }
        .updated {
          margin-top: 16px;
          font-size: 12px;
          color: var(--secondary-text-color, #888);
        }

        /* ── Expanded History ── */
        .history-panel {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1),
                      opacity 0.3s ease, margin 0.3s ease;
          opacity: 0;
          margin-top: 0;
        }
        .history-panel.open {
          max-height: 400px;
          opacity: 1;
          margin-top: 16px;
        }
        .history-inner {
          border-top: 1px solid var(--divider-color, #e0e0e0);
          padding-top: 14px;
        }
        .range-bar {
          display: flex;
          gap: 0;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid var(--divider-color, #ddd);
          margin-bottom: 14px;
        }
        .range-btn {
          flex: 1;
          padding: 6px 0;
          font-size: 12px;
          font-weight: 500;
          text-align: center;
          cursor: pointer;
          background: var(--card-background-color, #fff);
          color: var(--primary-text-color, #666);
          border: none;
          border-right: 1px solid var(--divider-color, #ddd);
          transition: background 0.2s, color 0.2s;
        }
        .range-btn:last-child { border-right: none; }
        .range-btn:hover { background: var(--secondary-background-color, #f0f0f0); }
        .range-btn.active {
          background: var(--primary-color, #03a9f4);
          color: #fff;
        }
        .chart-container {
          position: relative;
          width: 100%;
          height: 140px;
        }
        .chart-container canvas {
          width: 100% !important;
          height: 100% !important;
        }
        .chart-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 140px;
          font-size: 13px;
          color: var(--secondary-text-color, #999);
        }
        .chart-stats {
          display: flex;
          justify-content: space-around;
          margin-top: 10px;
          font-size: 12px;
          color: var(--secondary-text-color, #888);
        }
        .stat { text-align: center; }
        .stat-val {
          font-weight: 600;
          font-size: 14px;
          color: var(--primary-text-color, #333);
        }
      </style>

      <ha-card>
        ${this._config.show_title !== false && this._config.title ? `<div class="card-title">${this._config.title}</div>` : ""}
        <div class="tank-area">
          <div class="tank-wrapper">
            <div class="valve">
              <div class="valve-handle"></div>
              <div class="valve-base"></div>
            </div>
            <div class="tank">
              <div class="tank-fill" id="fill"></div>
            </div>
            <div class="feet"><div class="foot"></div><div class="foot"></div></div>
            <div class="badge" id="badge">
              <span class="badge-text" id="badgeText">--%</span>
            </div>
          </div>
          <div class="updated" id="updated"></div>
        </div>

        <div class="history-panel" id="historyPanel">
          <div class="history-inner">
            <div class="range-bar" id="rangeBar">
              <button class="range-btn" data-hours="24">24h</button>
              <button class="range-btn" data-hours="72">3d</button>
              <button class="range-btn" data-hours="168">7d</button>
              <button class="range-btn" data-hours="336">14d</button>
              <button class="range-btn" data-hours="720">30d</button>
            </div>
            <div class="chart-container" id="chartContainer">
              <div class="chart-loading" id="chartLoading">Loading history…</div>
              <canvas id="chartCanvas" style="display:none;"></canvas>
            </div>
            <div class="chart-stats" id="chartStats" style="display:none;">
              <div class="stat"><div class="stat-val" id="statMin">--</div>Min</div>
              <div class="stat"><div class="stat-val" id="statAvg">--</div>Avg</div>
              <div class="stat"><div class="stat-val" id="statMax">--</div>Max</div>
              <div class="stat"><div class="stat-val" id="statCur">--</div>Now</div>
            </div>
          </div>
        </div>
      </ha-card>
    `;

    // ── Toggle expand on tap ──
    s.querySelector("ha-card").addEventListener("click", (e) => {
      if (e.target.closest(".range-bar")) return;
      this._expanded = !this._expanded;
      const panel = s.getElementById("historyPanel");
      if (this._expanded) {
        panel.classList.add("open");
        this._setActiveRange(this._selectedRange);
        this._fetchHistory();
      } else {
        panel.classList.remove("open");
      }
    });

    // ── Range buttons ──
    s.getElementById("rangeBar").addEventListener("click", (e) => {
      const btn = e.target.closest(".range-btn");
      if (!btn) return;
      e.stopPropagation();
      this._selectedRange = parseInt(btn.dataset.hours);
      this._setActiveRange(this._selectedRange);
      this._fetchHistory();
    });
  }

  _setActiveRange(hours) {
    this.shadowRoot.querySelectorAll(".range-btn")
      .forEach((b) => b.classList.toggle("active", parseInt(b.dataset.hours) === hours));
  }

  // ── Update Tank ──
  _updateTank() {
    if (!this._hass || !this._config) return;
    const s = this.shadowRoot;
    const stateObj = this._hass.states[this._config.entity];
    const fill = s.getElementById("fill");
    const badge = s.getElementById("badge");
    const badgeText = s.getElementById("badgeText");
    const updated = s.getElementById("updated");
    if (!fill) return;

    if (!stateObj || ["unavailable", "unknown"].includes(stateObj.state)) {
      badgeText.textContent = "N/A";
      fill.style.height = "0%";
      updated.textContent = stateObj ? "Entity unavailable" : "Entity not found";
      return;
    }

    const level = Math.max(0, Math.min(100, parseFloat(stateObj.state) || 0));
    const color = this._getColor(level);
    const highlight = this._lighten(color);

    fill.style.height = level + "%";
    fill.style.background = `linear-gradient(to top, ${color} 85%, ${highlight} 100%)`;
    badge.style.borderColor = color;
    badgeText.textContent = Math.round(level) + "%";

    if (stateObj.last_updated) {
      updated.textContent = `Updated ${this._relativeTime(new Date(stateObj.last_updated))}`;
    }
  }

  // ── Fetch & Render History ──
  async _fetchHistory() {
    const s = this.shadowRoot;
    const loading = s.getElementById("chartLoading");
    const canvas = s.getElementById("chartCanvas");
    const stats = s.getElementById("chartStats");

    loading.textContent = "Loading history…";
    loading.style.display = "flex";
    canvas.style.display = "none";
    stats.style.display = "none";

    try {
      const end = new Date();
      const start = new Date(end.getTime() - this._selectedRange * 3600000);
      const url =
        `history/period/${start.toISOString()}` +
        `?filter_entity_id=${this._config.entity}` +
        `&end_time=${end.toISOString()}` +
        `&minimal_response&no_attributes`;

      const resp = await this._hass.callApi("GET", url);

      if (!resp || !resp[0] || resp[0].length < 2) {
        loading.textContent = "No history data available";
        return;
      }

      const points = resp[0]
        .map((e) => ({
          t: new Date(e.last_changed || e.last_updated).getTime(),
          v: parseFloat(e.state),
        }))
        .filter((p) => !isNaN(p.v));

      if (points.length < 2) {
        loading.textContent = "Not enough data points";
        return;
      }

      loading.style.display = "none";
      canvas.style.display = "block";
      stats.style.display = "flex";
      this._drawChart(points);
      this._drawStats(points);
    } catch (err) {
      console.error("PropaneTankCard history fetch error:", err);
      loading.textContent = "Could not load history";
    }
  }

  _drawChart(points) {
    const s = this.shadowRoot;
    const canvas = s.getElementById("chartCanvas");
    const container = s.getElementById("chartContainer");
    const dpr = window.devicePixelRatio || 1;
    const w = container.clientWidth;
    const h = 140;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const pad = { top: 10, right: 10, bottom: 24, left: 34 };
    const cw = w - pad.left - pad.right;
    const ch = h - pad.top - pad.bottom;

    const tMin = points[0].t;
    const tMax = points[points.length - 1].t;
    const tRange = tMax - tMin || 1;

    const vals = points.map((p) => p.v);
    let vMin = Math.min(...vals);
    let vMax = Math.max(...vals);
    if (vMax - vMin < 5) {
      vMin = Math.max(0, vMin - 5);
      vMax = Math.min(100, vMax + 5);
    }
    const vRange = vMax - vMin || 1;

    const toX = (t) => pad.left + ((t - tMin) / tRange) * cw;
    const toY = (v) => pad.top + ch - ((v - vMin) / vRange) * ch;

    // Threshold background bands
    const sorted = [...this._config.thresholds].sort((a, b) => a.level - b.level);
    let prev = 0;
    for (const t of sorted) {
      const bandTop = Math.min(t.level, vMax);
      const bandBot = Math.max(prev, vMin);
      if (bandTop > bandBot) {
        const yTop = toY(bandTop);
        const yBot = toY(bandBot);
        ctx.fillStyle = t.color + "14";
        ctx.fillRect(pad.left, yTop, cw, yBot - yTop);
      }
      prev = t.level;
    }

    // Horizontal grid
    ctx.strokeStyle = "rgba(128,128,128,0.15)";
    ctx.lineWidth = 1;
    const gridSteps = 4;
    for (let i = 0; i <= gridSteps; i++) {
      const v = vMin + (vRange / gridSteps) * i;
      const y = toY(v);
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(w - pad.right, y);
      ctx.stroke();
      ctx.fillStyle = "rgba(128,128,128,0.55)";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(Math.round(v) + "%", pad.left - 4, y + 3);
    }

    // Time labels
    ctx.fillStyle = "rgba(128,128,128,0.55)";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    const nLabels = Math.min(5, Math.max(2, Math.floor(cw / 60)));
    for (let i = 0; i <= nLabels; i++) {
      const t = tMin + (tRange / nLabels) * i;
      const d = new Date(t);
      const label =
        this._selectedRange <= 24
          ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : d.toLocaleDateString([], { month: "short", day: "numeric" });
      ctx.fillText(label, toX(t), h - 4);
    }

    // Line (colored per threshold)
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];
      ctx.strokeStyle = this._getColor((p0.v + p1.v) / 2);
      ctx.beginPath();
      ctx.moveTo(toX(p0.t), toY(p0.v));
      ctx.lineTo(toX(p1.t), toY(p1.v));
      ctx.stroke();
    }

    // Area fill
    ctx.globalAlpha = 0.1;
    ctx.beginPath();
    ctx.moveTo(toX(points[0].t), toY(points[0].v));
    for (const p of points) ctx.lineTo(toX(p.t), toY(p.v));
    ctx.lineTo(toX(points[points.length - 1].t), pad.top + ch);
    ctx.lineTo(toX(points[0].t), pad.top + ch);
    ctx.closePath();
    ctx.fillStyle = this._getColor(points[points.length - 1].v);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Current value dot
    const last = points[points.length - 1];
    ctx.beginPath();
    ctx.arc(toX(last.t), toY(last.v), 4, 0, Math.PI * 2);
    ctx.fillStyle = this._getColor(last.v);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  _drawStats(points) {
    const s = this.shadowRoot;
    const vals = points.map((p) => p.v);
    s.getElementById("statMin").textContent = Math.round(Math.min(...vals)) + "%";
    s.getElementById("statAvg").textContent = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) + "%";
    s.getElementById("statMax").textContent = Math.round(Math.max(...vals)) + "%";
    s.getElementById("statCur").textContent = Math.round(vals[vals.length - 1]) + "%";
  }

  _relativeTime(d) {
    const sec = Math.floor((Date.now() - d) / 1000);
    if (sec < 60) return "just now";
    if (sec < 3600) return `${Math.floor(sec / 60)} min ago`;
    if (sec < 86400) return `${Math.floor(sec / 3600)} hr ago`;
    if (sec < 2592000) return `${Math.floor(sec / 86400)} days ago`;
    return `${Math.floor(sec / 2592000)} months ago`;
  }

  getCardSize() {
    return this._expanded ? 5 : 3;
  }
}

customElements.define("propane-tank-card", PropaneTankCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "propane-tank-card",
  name: "Propane Tank Card",
  description:
    "Visual tank gauge with configurable thresholds and tap-to-expand history chart.",
  preview: true,
});
