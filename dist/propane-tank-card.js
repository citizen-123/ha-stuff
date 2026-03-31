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
    if (!this._rendered) {
      this._render();
    } else {
      const picker = this.querySelector("#editor-entity");
      if (picker) picker.hass = hass;
    }
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
    const tankStyle = this._config.tank_style || "vertical";

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
        <label>Entity</label>
        <ha-entity-picker
          id="editor-entity"
          .hass=${null}
          .value="${this._config.entity || ""}"
          allow-custom-entity
        ></ha-entity-picker>
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

        <div class="section-title">Tank Style</div>
        <label for="editor-tank-style">Orientation</label>
        <select id="editor-tank-style">
          <option value="vertical" ${tankStyle === "vertical" ? "selected" : ""}>Vertical (upright cylinder)</option>
          <option value="horizontal" ${tankStyle === "horizontal" ? "selected" : ""}>Horizontal (side cylinder)</option>
        </select>
        <div class="hint">Choose the tank shape that matches your actual tank.</div>

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

    // ── Set hass on entity picker ──
    const picker = this.querySelector("#editor-entity");
    if (picker && this._hass) {
      picker.hass = this._hass;
      picker.value = this._config.entity || "";
    }

    // ── Listeners ──
    picker.addEventListener("value-changed", (e) => {
      this._config.entity = e.detail.value;
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
    this.querySelector("#editor-tank-style").addEventListener("change", (e) => {
      this._config.tank_style = e.target.value;
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
      tank_style: "vertical",
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
      tank_style: "vertical",
      history_hours: 168,
      thresholds: [
        { level: 20, color: "#d9534f", label: "Low" },
        { level: 40, color: "#f0ad4e", label: "Mid" },
        { level: 100, color: "#6ab42d", label: "Good" },
      ],
      ...config,
    };
    this._config.thresholds = [...this._config.thresholds].sort((a, b) => a.level - b.level);
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
    const isHorizontal = this._config.tank_style === "horizontal";

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

        .tank-area {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .badge {
          position: absolute;
          width: 64px;
          height: 64px;
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

        /* ───── Vertical Tank ───── */
        .tank-wrapper.vertical {
          position: relative;
          width: 120px;
          height: 200px;
          margin: 20px 0 0;
        }
        .vertical .valve {
          position: absolute;
          top: -18px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 3;
        }
        .vertical .valve-wheel {
          width: 30px;
          height: 10px;
          background: var(--primary-text-color, #1a1a1a);
          border-radius: 3px;
          margin: 0 auto;
        }
        .vertical .valve-stem {
          width: 8px;
          height: 14px;
          background: var(--primary-text-color, #1a1a1a);
          margin: -1px auto 0;
          border-radius: 2px;
        }
        .vertical .valve-collar {
          width: 22px;
          height: 8px;
          background: var(--primary-text-color, #1a1a1a);
          border-radius: 3px 3px 0 0;
          margin: -1px auto 0;
        }
        .vertical .tank-body {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
        }
        .vertical .tank-dome {
          width: 100%;
          height: 40px;
          background: var(--secondary-background-color, #e8e8e8);
          border: 5px solid var(--primary-text-color, #1a1a1a);
          border-bottom: none;
          border-radius: 60px 60px 0 0;
          box-sizing: border-box;
          position: relative;
          z-index: 1;
        }
        .vertical .tank-cylinder {
          width: 100%;
          height: 148px;
          background: var(--secondary-background-color, #e8e8e8);
          border-left: 5px solid var(--primary-text-color, #1a1a1a);
          border-right: 5px solid var(--primary-text-color, #1a1a1a);
          box-sizing: border-box;
          position: relative;
          overflow: hidden;
          margin-top: -1px;
        }
        .vertical .tank-bottom {
          width: 100%;
          height: 5px;
          background: var(--primary-text-color, #1a1a1a);
          margin-top: -1px;
          position: relative;
          z-index: 1;
        }
        .vertical .tank-fill {
          position: absolute;
          bottom: 0; left: 0;
          width: 100%;
          height: 0%;
          transition: height 1s cubic-bezier(0.4, 0, 0.2, 1), background 0.5s ease;
        }
        .vertical .handle {
          position: absolute;
          top: -4px;
          left: 50%;
          transform: translateX(-50%);
          width: 50px;
          height: 20px;
          border: 4px solid var(--primary-text-color, #1a1a1a);
          border-bottom: none;
          border-radius: 30px 30px 0 0;
          z-index: 2;
        }
        .vertical .foot-ring {
          width: 108px;
          height: 10px;
          background: var(--primary-text-color, #1a1a1a);
          border-radius: 0 0 4px 4px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }
        .vertical .badge {
          right: -20px;
          bottom: 10px;
        }

        /* ───── Horizontal Tank ───── */
        .tank-wrapper.horizontal {
          position: relative;
          width: 260px;
          height: 130px;
          margin: 20px 0 0;
        }
        .horizontal .valve {
          position: absolute;
          top: -18px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 3;
        }
        .horizontal .valve-wheel {
          width: 30px;
          height: 10px;
          background: var(--primary-text-color, #1a1a1a);
          border-radius: 3px;
          margin: 0 auto;
        }
        .horizontal .valve-stem {
          width: 8px;
          height: 14px;
          background: var(--primary-text-color, #1a1a1a);
          margin: -1px auto 0;
          border-radius: 2px;
        }
        .horizontal .valve-collar {
          width: 22px;
          height: 8px;
          background: var(--primary-text-color, #1a1a1a);
          border-radius: 3px 3px 0 0;
          margin: -1px auto 0;
        }
        .horizontal .tank-body {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
        }
        .horizontal .tank-shell {
          width: 100%;
          height: 100px;
          background: var(--secondary-background-color, #e8e8e8);
          border: 5px solid var(--primary-text-color, #1a1a1a);
          border-radius: 50px;
          box-sizing: border-box;
          position: relative;
          overflow: hidden;
        }
        .horizontal .tank-fill {
          position: absolute;
          bottom: 0; left: 0;
          width: 100%;
          height: 0%;
          transition: height 1s cubic-bezier(0.4, 0, 0.2, 1), background 0.5s ease;
        }
        .horizontal .feet {
          position: absolute;
          bottom: -8px;
          left: 0; width: 100%;
          display: flex;
          justify-content: space-between;
          padding: 0 40px;
          box-sizing: border-box;
          z-index: 2;
        }
        .horizontal .foot {
          width: 24px;
          height: 12px;
          background: var(--primary-text-color, #1a1a1a);
          border-radius: 0 0 4px 4px;
        }
        .horizontal .badge {
          right: -14px;
          bottom: -6px;
        }
      </style>

      <ha-card>
        ${this._config.show_title !== false && this._config.title ? `<div class="card-title">${this._config.title}</div>` : ""}
        <div class="tank-area">
          <div class="tank-wrapper ${isHorizontal ? "horizontal" : "vertical"}">
            ${isHorizontal ? this._buildHorizontalTank() : this._buildVerticalTank()}
            <div class="badge" id="badge">
              <span class="badge-text" id="badgeText">--%</span>
            </div>
          </div>
          <div class="updated" id="updated"></div>
        </div>
      </ha-card>
    `;

    // ── Open more-info dialog on tap ──
    s.querySelector("ha-card").addEventListener("click", () => {
      const event = new CustomEvent("hass-more-info", {
        detail: { entityId: this._config.entity },
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(event);
    });
  }

  _buildVerticalTank() {
    return `
      <div class="handle"></div>
      <div class="valve">
        <div class="valve-wheel"></div>
        <div class="valve-stem"></div>
        <div class="valve-collar"></div>
      </div>
      <div class="tank-body">
        <div class="tank-dome"></div>
        <div class="tank-cylinder">
          <div class="tank-fill" id="fill"></div>
        </div>
        <div class="tank-bottom"></div>
      </div>
      <div class="foot-ring"></div>
    `;
  }

  _buildHorizontalTank() {
    return `
      <div class="valve">
        <div class="valve-wheel"></div>
        <div class="valve-stem"></div>
        <div class="valve-collar"></div>
      </div>
      <div class="tank-body">
        <div class="tank-shell">
          <div class="tank-fill" id="fill"></div>
        </div>
      </div>
      <div class="feet">
        <div class="foot"></div>
        <div class="foot"></div>
      </div>
    `;
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

  _relativeTime(d) {
    const sec = Math.floor((Date.now() - d) / 1000);
    if (sec < 60) return "just now";
    if (sec < 3600) return `${Math.floor(sec / 60)} min ago`;
    if (sec < 86400) return `${Math.floor(sec / 3600)} hr ago`;
    if (sec < 2592000) return `${Math.floor(sec / 86400)} days ago`;
    return `${Math.floor(sec / 2592000)} months ago`;
  }

  getCardSize() {
    return 3;
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
