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
          width: 130px;
          height: 230px;
          margin: 20px 0 0;
        }
        .vertical .tank-svg {
          width: 100%;
          height: 100%;
          overflow: visible;
        }
        .vertical .badge {
          right: -20px;
          bottom: 20px;
        }

        /* ───── Horizontal Tank ───── */
        .tank-wrapper.horizontal {
          position: relative;
          width: 260px;
          height: 150px;
          margin: 20px 0 0;
        }
        .horizontal .tank-svg {
          width: 100%;
          height: 100%;
          overflow: visible;
        }
        .horizontal .badge {
          right: -14px;
          bottom: 6px;
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
    // SVG propane tank: upright cylinder with smooth dome top
    // viewBox: 0 0 130 230, tank body from y=30 to y=210
    const tankColor = "var(--secondary-background-color, #e8e8e8)";
    const strokeColor = "var(--primary-text-color, #1a1a1a)";
    return `
      <svg class="tank-svg" viewBox="0 0 130 240" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="vtank-clip">
            <!-- Rounded rect for cylinder body + dome -->
            <path d="
              M 25,70
              L 25,200
              Q 25,220 45,220
              L 85,220
              Q 105,220 105,200
              L 105,70
              Q 105,30 65,30
              Q 25,30 25,70
              Z
            "/>
          </clipPath>
        </defs>

        <!-- Handle arch -->
        <path d="M 45,28 Q 45,8 65,8 Q 85,8 85,28" fill="none" stroke="${strokeColor}" stroke-width="5" stroke-linecap="round"/>

        <!-- Valve wheel -->
        <rect x="52" y="12" width="26" height="8" rx="3" fill="${strokeColor}"/>
        <!-- Valve stem -->
        <rect x="61" y="18" width="8" height="14" rx="2" fill="${strokeColor}"/>
        <!-- Valve collar -->
        <rect x="55" y="30" width="20" height="6" rx="2" fill="${strokeColor}"/>

        <!-- Tank outline -->
        <path d="
          M 25,70
          L 25,200
          Q 25,220 45,220
          L 85,220
          Q 105,220 105,200
          L 105,70
          Q 105,30 65,30
          Q 25,30 25,70
          Z
        " fill="${tankColor}" stroke="${strokeColor}" stroke-width="5"/>

        <!-- Fill (clipped to tank shape) -->
        <rect id="fill" x="20" y="220" width="90" height="0"
              clip-path="url(#vtank-clip)"
              style="transition: y 1s cubic-bezier(0.4,0,0.2,1), height 1s cubic-bezier(0.4,0,0.2,1), fill 0.5s ease;"/>

        <!-- Foot ring -->
        <rect x="22" y="220" width="86" height="8" rx="3" fill="${strokeColor}"/>

        <!-- Collar ring near top -->
        <ellipse cx="65" cy="68" rx="42" ry="4" fill="none" stroke="${strokeColor}" stroke-width="2.5" opacity="0.4"/>
      </svg>
    `;
  }

  _buildHorizontalTank() {
    // SVG horizontal propane tank: side-lying cylinder with rounded ends
    const tankColor = "var(--secondary-background-color, #e8e8e8)";
    const strokeColor = "var(--primary-text-color, #1a1a1a)";
    return `
      <svg class="tank-svg" viewBox="0 0 260 150" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="htank-clip">
            <rect x="15" y="20" width="230" height="100" rx="50" ry="50"/>
          </clipPath>
        </defs>

        <!-- Valve wheel -->
        <rect x="117" y="2" width="26" height="8" rx="3" fill="${strokeColor}"/>
        <!-- Valve stem -->
        <rect x="126" y="8" width="8" height="14" rx="2" fill="${strokeColor}"/>

        <!-- Tank outline -->
        <rect x="15" y="20" width="230" height="100" rx="50" ry="50"
              fill="${tankColor}" stroke="${strokeColor}" stroke-width="5"/>

        <!-- Fill (clipped to tank shape) -->
        <rect id="fill" x="10" y="120" width="240" height="0"
              clip-path="url(#htank-clip)"
              style="transition: y 1s cubic-bezier(0.4,0,0.2,1), height 1s cubic-bezier(0.4,0,0.2,1), fill 0.5s ease;"/>

        <!-- Feet -->
        <rect x="55" y="120" width="20" height="14" rx="3" fill="${strokeColor}"/>
        <rect x="185" y="120" width="20" height="14" rx="3" fill="${strokeColor}"/>
      </svg>
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
      fill.setAttribute("height", "0");
      updated.textContent = stateObj ? "Entity unavailable" : "Entity not found";
      return;
    }

    const level = Math.max(0, Math.min(100, parseFloat(stateObj.state) || 0));
    const color = this._getColor(level);
    const isHorizontal = this._config.tank_style === "horizontal";

    // SVG fill: animate rect y and height
    if (isHorizontal) {
      // Tank body from y=20 to y=120, height=100
      const fillH = (level / 100) * 100;
      fill.setAttribute("y", String(120 - fillH));
      fill.setAttribute("height", String(fillH));
    } else {
      // Tank body from y=30 to y=220, height=190
      const fillH = (level / 100) * 190;
      fill.setAttribute("y", String(220 - fillH));
      fill.setAttribute("height", String(fillH));
    }
    fill.style.fill = color;
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
