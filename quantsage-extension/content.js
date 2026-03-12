// QuantSage - Content Script (content.js)
// Injects the floating chat panel into any webpage using Shadow DOM for full style isolation

(function () {
  'use strict';

  // Prevent multiple injections
  if (document.getElementById('quantsage-shadow-host')) return;

  // ---- Shadow DOM styles (fully isolated from host page) ----
  const SHADOW_STYLES = `
    :host { all: initial; display: block; }
    *, *::before, *::after { box-sizing: border-box; }

    #qs-panel {
      width: 380px;
      height: 560px;
      background: rgba(14, 18, 28, 0.96);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      box-shadow: 0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,212,170,0.08);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
      font-size: 13px;
      color: #e2e8f0;
      transform: translateY(20px) scale(0.97);
      opacity: 0;
      transition: transform 0.28s cubic-bezier(0.34,1.56,0.64,1), opacity 0.22s ease;
      pointer-events: none;
      position: relative;
    }

    #qs-panel.qs-visible {
      transform: translateY(0) scale(1);
      opacity: 1;
      pointer-events: all;
    }

    /* Header */
    #qs-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 14px;
      background: linear-gradient(135deg, rgba(0,212,170,0.12) 0%, rgba(59,130,246,0.10) 100%);
      border-bottom: 1px solid rgba(255,255,255,0.07);
      cursor: grab;
      user-select: none;
      flex-shrink: 0;
    }
    #qs-header:active { cursor: grabbing; }

    .qs-brand {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .qs-logo {
      width: 28px; height: 28px;
      background: linear-gradient(135deg, #00d4aa 0%, #3b82f6 100%);
      border-radius: 7px;
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 800; color: #fff; letter-spacing: 0.04em;
      flex-shrink: 0;
    }
    .qs-title { font-size: 14px; font-weight: 700; color: #e2e8f0; }
    .qs-subtitle { font-size: 10px; color: #94a3b8; margin-top: 1px; }

    .qs-status {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 10px; color: #00d4aa;
      background: rgba(0,212,170,0.1); border-radius: 10px; padding: 2px 7px;
    }
    .qs-status-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: #00d4aa;
      animation: qs-blink 2s infinite;
    }
    @keyframes qs-blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.35; }
    }

    .qs-header-btns { display: flex; gap: 4px; }
    .qs-icon-btn {
      width: 26px; height: 26px;
      background: rgba(255,255,255,0.06);
      border: none; border-radius: 7px;
      color: #94a3b8; font-size: 13px;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: background 0.15s, color 0.15s;
    }
    .qs-icon-btn:hover { background: rgba(255,255,255,0.12); color: #e2e8f0; }

    /* Tab Navigation */
    .qs-tabs {
      display: flex;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      background: rgba(10,14,26,0.6);
      flex-shrink: 0;
    }
    .qs-tab {
      flex: 1;
      padding: 8px 4px;
      text-align: center;
      font-size: 11px;
      color: #64748b;
      cursor: pointer;
      border: none;
      background: none;
      border-bottom: 2px solid transparent;
      transition: color 0.15s, border-color 0.15s;
    }
    .qs-tab.active { color: #00d4aa; border-bottom-color: #00d4aa; }
    .qs-tab:hover:not(.active) { color: #94a3b8; }

    /* Chat area */
    #qs-messages {
      flex: 1; overflow-y: auto;
      padding: 12px 10px;
      display: flex; flex-direction: column; gap: 10px;
      scroll-behavior: smooth;
    }
    #qs-messages::-webkit-scrollbar { width: 4px; }
    #qs-messages::-webkit-scrollbar-track { background: transparent; }
    #qs-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

    /* Tab content panels */
    .qs-tab-panel { flex: 1; overflow-y: auto; display: none; padding: 10px; }
    .qs-tab-panel.active { display: block; }
    .qs-tab-panel::-webkit-scrollbar { width: 4px; }
    .qs-tab-panel::-webkit-scrollbar-track { background: transparent; }
    .qs-tab-panel::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

    /* Message bubbles */
    .qs-msg { display: flex; flex-direction: column; max-width: 88%; }
    .qs-msg.user { align-self: flex-end; align-items: flex-end; }
    .qs-msg.bot { align-self: flex-start; align-items: flex-start; }
    .qs-msg.system { align-self: center; align-items: center; max-width: 100%; }

    .qs-bubble {
      padding: 9px 12px;
      border-radius: 12px;
      line-height: 1.55;
      word-wrap: break-word;
      white-space: pre-wrap;
    }
    .qs-msg.user .qs-bubble {
      background: linear-gradient(135deg, #00d4aa 0%, #059669 100%);
      color: #fff;
      border-bottom-right-radius: 3px;
    }
    .qs-msg.bot .qs-bubble {
      background: rgba(26,34,53,0.95);
      border: 1px solid rgba(255,255,255,0.07);
      color: #e2e8f0;
      border-bottom-left-radius: 3px;
    }
    .qs-msg.system .qs-bubble {
      background: rgba(59,130,246,0.08);
      border: 1px solid rgba(59,130,246,0.2);
      color: #94a3b8;
      font-size: 11px;
      padding: 5px 10px;
      border-radius: 8px;
    }
    .qs-msg-time {
      font-size: 10px; color: #475569;
      margin-top: 3px; padding: 0 4px;
    }

    /* Text formatting in bot messages */
    .qs-bubble strong { color: #00d4aa; font-weight: 600; }
    .qs-bubble em { color: #94a3b8; font-style: italic; }
    .qs-bubble code {
      background: rgba(0,212,170,0.1); color: #00d4aa;
      padding: 1px 5px; border-radius: 4px; font-size: 0.9em; font-family: monospace;
    }
    .qs-bubble a { color: #3b82f6; text-decoration: none; }
    .qs-bubble hr { border: none; border-top: 1px solid rgba(255,255,255,0.07); margin: 8px 0; }

    /* Typing indicator */
    .qs-typing {
      display: flex; align-items: center; gap: 4px;
      padding: 8px 12px;
      background: rgba(26,34,53,0.9);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 12px;
      width: fit-content;
    }
    .qs-typing span {
      width: 6px; height: 6px; border-radius: 50%;
      background: #00d4aa; opacity: 0.6;
      animation: qs-typing-dot 1.4s infinite;
    }
    .qs-typing span:nth-child(2) { animation-delay: 0.2s; }
    .qs-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes qs-typing-dot {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.6; }
      30% { transform: translateY(-5px); opacity: 1; }
    }

    /* Quick actions */
    .qs-quick-actions {
      display: flex; gap: 5px;
      padding: 7px 10px;
      background: rgba(10,14,26,0.5);
      border-top: 1px solid rgba(255,255,255,0.05);
      flex-wrap: wrap;
      flex-shrink: 0;
    }
    .qs-quick-btn {
      padding: 4px 9px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.09);
      border-radius: 20px;
      color: #94a3b8; font-size: 11px;
      cursor: pointer; white-space: nowrap;
      transition: background 0.15s, color 0.15s, border-color 0.15s;
    }
    .qs-quick-btn:hover {
      background: rgba(0,212,170,0.1);
      border-color: rgba(0,212,170,0.3);
      color: #00d4aa;
    }

    /* Input area */
    .qs-input-area {
      display: flex; gap: 7px;
      padding: 10px;
      background: rgba(10,14,26,0.8);
      border-top: 1px solid rgba(255,255,255,0.06);
      flex-shrink: 0;
    }
    #qs-input {
      flex: 1;
      background: rgba(26,34,53,0.8);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 10px;
      padding: 8px 12px;
      color: #e2e8f0; font-size: 13px;
      font-family: inherit;
      outline: none;
      resize: none;
      transition: border-color 0.15s;
      min-height: 36px; max-height: 80px;
      line-height: 1.4;
    }
    #qs-input::placeholder { color: #475569; }
    #qs-input:focus { border-color: rgba(0,212,170,0.4); }

    #qs-send-btn {
      width: 36px; height: 36px;
      background: linear-gradient(135deg, #00d4aa 0%, #059669 100%);
      border: none; border-radius: 10px;
      color: #fff; font-size: 15px;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      transition: transform 0.15s, box-shadow 0.15s;
      align-self: flex-end;
    }
    #qs-send-btn:hover { transform: scale(1.06); box-shadow: 0 3px 12px rgba(0,212,170,0.4); }
    #qs-send-btn:disabled { background: rgba(255,255,255,0.1); cursor: not-allowed; transform: none; box-shadow: none; }

    /* Stock card styles */
    .qs-stock-card {
      background: rgba(26,34,53,0.9);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 10px; padding: 12px;
      margin: 4px 0;
    }
    .qs-stock-card-compact {
      display: flex; align-items: center; gap: 8px;
      background: rgba(26,34,53,0.8);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 8px; padding: 8px 10px;
      margin-bottom: 6px;
    }
    .qs-sc-left { flex: 1; min-width: 0; }
    .qs-sc-right { text-align: right; }
    .qs-sc-ticker { font-size: 13px; font-weight: 700; color: #e2e8f0; }
    .qs-sc-name { font-size: 10px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .qs-sc-price { font-size: 13px; font-weight: 600; color: #e2e8f0; }
    .qs-sc-price-large { font-size: 18px; font-weight: 700; color: #e2e8f0; }
    .qs-sc-change { font-size: 11px; font-weight: 600; }
    .qs-sc-change-badge { padding: 2px 7px; border-radius: 8px; font-size: 11px; font-weight: 600; }
    .qs-sc-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
    .qs-sc-price-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
    .qs-sc-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 6px; margin-bottom: 8px; }
    .qs-sc-stat { display: flex; flex-direction: column; gap: 2px; }
    .qs-sc-stat-label { font-size: 10px; color: #64748b; }
    .qs-sc-remove {
      background: none; border: none; color: #475569; cursor: pointer;
      font-size: 12px; padding: 4px; border-radius: 4px;
      transition: color 0.15s; flex-shrink: 0;
    }
    .qs-sc-remove:hover { color: #ef4444; }
    .qs-sc-sparkline { line-height: 0; }
    .qs-sc-fundamentals { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
    .qs-sc-fund-item { font-size: 11px; color: #94a3b8; }
    .qs-sc-fund-item strong { color: #e2e8f0; }
    .qs-sc-range { margin-top: 8px; }
    .qs-sc-range-bar {
      position: relative; height: 4px;
      background: rgba(255,255,255,0.1); border-radius: 2px; margin: 4px 0;
    }
    .qs-sc-range-fill { position: absolute; left: 0; top: 0; bottom: 0; background: rgba(0,212,170,0.3); border-radius: 2px; }
    .qs-sc-range-dot {
      position: absolute; top: 50%; transform: translate(-50%,-50%);
      width: 8px; height: 8px; background: #00d4aa; border-radius: 50%;
    }
    .qs-sc-range-labels { display: flex; justify-content: space-between; font-size: 10px; color: #64748b; }

    /* Mini cards */
    .qs-mini-cards-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 6px; margin: 6px 0; }
    .qs-mini-card {
      background: rgba(26,34,53,0.8);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 8px; padding: 8px;
    }
    .qs-mc-name { font-size: 10px; color: #64748b; margin-bottom: 3px; }
    .qs-mc-value { font-size: 13px; font-weight: 700; color: #e2e8f0; }
    .qs-mc-change { font-size: 11px; font-weight: 600; margin-top: 2px; }

    /* Watchlist & overview */
    .qs-wl-toolbar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 6px 2px; margin-bottom: 8px;
    }
    .qs-wl-count { font-size: 11px; color: #64748b; }
    .qs-wl-sort-btns { display: flex; gap: 4px; }
    .qs-sort-btn {
      padding: 3px 8px; font-size: 10px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 8px; color: #64748b; cursor: pointer;
      transition: background 0.15s, color 0.15s;
    }
    .qs-sort-btn.active, .qs-sort-btn:hover { background: rgba(0,212,170,0.1); color: #00d4aa; border-color: rgba(0,212,170,0.25); }
    .qs-wl-refresh { display: flex; align-items: center; justify-content: space-between; margin-top: 8px; }
    .qs-wl-updated { font-size: 10px; color: #475569; }
    .qs-btn-secondary {
      padding: 4px 10px; font-size: 11px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px; color: #94a3b8; cursor: pointer;
      transition: background 0.15s;
    }
    .qs-btn-secondary:hover { background: rgba(255,255,255,0.1); }

    /* Overview */
    .qs-overview-section { margin-bottom: 14px; }
    .qs-overview-label { font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; }
    .qs-overview-footer { display: flex; justify-content: space-between; margin-top: 8px; font-size: 11px; color: #475569; }

    /* States */
    .qs-loading { text-align: center; color: #64748b; padding: 24px; font-size: 12px; }
    .qs-empty-state { text-align: center; color: #64748b; padding: 24px; }
    .qs-error { color: #ef4444; padding: 12px; background: rgba(239,68,68,0.08); border-radius: 8px; font-size: 12px; }

    /* Settings tab */
    .qs-settings { padding: 4px 2px; }
    .qs-settings-group { margin-bottom: 16px; }
    .qs-settings-label { font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px; }
    .qs-settings-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
    .qs-settings-row label { font-size: 12px; color: #94a3b8; }
    .qs-input-text {
      width: 100%;
      background: rgba(26,34,53,0.8);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 8px; padding: 7px 10px;
      color: #e2e8f0; font-size: 12px; font-family: inherit;
      outline: none; margin-bottom: 6px;
      transition: border-color 0.15s;
    }
    .qs-input-text:focus { border-color: rgba(0,212,170,0.4); }
    .qs-input-text::placeholder { color: #475569; }
    .qs-save-btn {
      width: 100%; padding: 8px;
      background: linear-gradient(135deg, #00d4aa 0%, #059669 100%);
      border: none; border-radius: 8px;
      color: #fff; font-size: 13px; font-weight: 600;
      cursor: pointer; margin-top: 4px;
      transition: opacity 0.15s;
    }
    .qs-save-btn:hover { opacity: 0.9; }
    .qs-toggle {
      width: 36px; height: 20px;
      background: rgba(255,255,255,0.1);
      border-radius: 10px; border: none; cursor: pointer;
      position: relative; transition: background 0.2s;
    }
    .qs-toggle.on { background: #00d4aa; }
    .qs-toggle::after {
      content: ''; position: absolute;
      width: 14px; height: 14px;
      background: #fff; border-radius: 50%;
      top: 3px; left: 3px;
      transition: left 0.2s;
    }
    .qs-toggle.on::after { left: 19px; }
    .qs-settings-footer { text-align: center; color: #475569; font-size: 10px; margin-top: 12px; }
  `;

  // ---- Create DOM elements ----
  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'quantsage-toggle-btn';
  toggleBtn.title = 'QuantSage - AI Financial Analyst';
  toggleBtn.textContent = 'QS';
  document.body.appendChild(toggleBtn);

  const shadowHost = document.createElement('div');
  shadowHost.id = 'quantsage-shadow-host';
  document.body.appendChild(shadowHost);

  const shadow = shadowHost.attachShadow({ mode: 'open' });

  const styleEl = document.createElement('style');
  styleEl.textContent = SHADOW_STYLES;
  shadow.appendChild(styleEl);

  // ---- Panel HTML ----
  const panel = document.createElement('div');
  panel.id = 'qs-panel';
  panel.innerHTML = `
    <div id="qs-header">
      <div class="qs-brand">
        <div class="qs-logo">QS</div>
        <div>
          <div class="qs-title">QuantSage</div>
          <div class="qs-subtitle">AI Financial Analyst</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <div class="qs-status" id="qs-data-status"><div class="qs-status-dot" id="qs-status-dot"></div><span id="qs-status-label">Demo</span></div>
        <div class="qs-header-btns">
          <button class="qs-icon-btn" id="qs-minimize-btn" title="Minimize">−</button>
          <button class="qs-icon-btn" id="qs-close-btn" title="Close">✕</button>
        </div>
      </div>
    </div>

    <div class="qs-tabs">
      <button class="qs-tab active" data-tab="chat">💬 Chat</button>
      <button class="qs-tab" data-tab="market">📊 Market</button>
      <button class="qs-tab" data-tab="watchlist">👁 Watchlist</button>
      <button class="qs-tab" data-tab="settings">⚙</button>
    </div>

    <div class="qs-tab-panel active" id="qs-chat-panel">
      <div id="qs-messages"></div>
    </div>

    <div class="qs-tab-panel" id="qs-market-panel"></div>
    <div class="qs-tab-panel" id="qs-watchlist-panel"></div>

    <div class="qs-tab-panel" id="qs-settings-panel">
      <div class="qs-settings">
        <div class="qs-settings-group">
          <div class="qs-settings-label">API Configuration</div>
          <label style="font-size:11px;color:#94a3b8;display:block;margin-bottom:4px">Alpha Vantage API Key</label>
          <input class="qs-input-text" id="qs-av-key" type="password" placeholder="Enter your Alpha Vantage API key...">
          <div style="font-size:10px;color:#475569;margin-bottom:8px">
            Get a free key at <span style="color:#3b82f6">alphavantage.co</span>
          </div>
          <label style="font-size:11px;color:#94a3b8;display:block;margin-bottom:4px">Finnhub API Key (optional)</label>
          <input class="qs-input-text" id="qs-fh-key" type="password" placeholder="Enter your Finnhub API key...">
        </div>
        <div class="qs-settings-group">
          <div class="qs-settings-label">Preferences</div>
          <div class="qs-settings-row">
            <label>Demo Mode (mock data)</label>
            <button class="qs-toggle on" id="qs-demo-toggle"></button>
          </div>
          <div class="qs-settings-row">
            <label>Price Notifications</label>
            <button class="qs-toggle on" id="qs-notif-toggle"></button>
          </div>
        </div>
        <button class="qs-save-btn" id="qs-save-settings">Save Settings</button>
        <div class="qs-settings-footer">QuantSage v1.0.0 — For educational purposes only</div>
      </div>
    </div>

    <div class="qs-quick-actions" id="qs-quick-actions">
      <button class="qs-quick-btn" data-cmd="/market">📊 Market</button>
      <button class="qs-quick-btn" data-cmd="/watchlist">👁 Watchlist</button>
      <button class="qs-quick-btn" data-cmd="/page">🔍 Page</button>
      <button class="qs-quick-btn" data-cmd="/analyze ">🔎 Analyze</button>
      <button class="qs-quick-btn" data-cmd="/help">❓ Help</button>
    </div>

    <div class="qs-input-area">
      <textarea id="qs-input" placeholder="Type a command or ask about any stock..." rows="1"></textarea>
      <button id="qs-send-btn" title="Send">▶</button>
    </div>
  `;
  shadow.appendChild(panel);

  // ---- State ----
  let isOpen = false;
  let isMinimized = false;
  let isDragging = false;
  let dragOffset = { x: 0, y: 0 };
  let panelPos = { right: 24, bottom: 90 };
  let messages = [];
  let isTyping = false;
  let currentTab = 'chat';
  let settingsLoaded = false;

  // ---- Helpers ----
  function formatTime(timestamp) {
    return new Date(timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function formatMessageText(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/_(.+?)_/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/^---$/gm, '<hr>')
      .replace(/\n/g, '<br>');
  }

  function scrollToBottom() {
    const msgs = shadow.getElementById('qs-messages');
    if (msgs) {
      setTimeout(() => { msgs.scrollTop = msgs.scrollHeight; }, 30);
    }
  }

  function addMessage(type, text, skipSave) {
    const msg = { type, text, time: Date.now() };
    messages.push(msg);
    renderMessage(msg);
    scrollToBottom();
    if (!skipSave) {
      QSStorage.saveChatHistory(messages);
    }
    return msg;
  }

  function renderMessage(msg) {
    const container = shadow.getElementById('qs-messages');
    if (!container) return;

    const div = document.createElement('div');
    div.className = `qs-msg ${msg.type}`;

    const timeStr = formatTime(msg.time);

    if (msg.type === 'user') {
      div.innerHTML = `<div class="qs-bubble">${formatMessageText(msg.text)}</div><div class="qs-msg-time">${timeStr}</div>`;
    } else if (msg.type === 'bot') {
      div.innerHTML = `<div class="qs-bubble">${formatMessageText(msg.text)}</div><div class="qs-msg-time">QuantSage · ${timeStr}</div>`;
    } else {
      div.innerHTML = `<div class="qs-bubble">${formatMessageText(msg.text)}</div>`;
    }

    container.appendChild(div);
  }

  function showTypingIndicator() {
    const container = shadow.getElementById('qs-messages');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'qs-msg bot';
    div.id = 'qs-typing-indicator';
    div.innerHTML = `<div class="qs-typing"><span></span><span></span><span></span></div>`;
    container.appendChild(div);
    scrollToBottom();
  }

  function hideTypingIndicator() {
    const ind = shadow.getElementById('qs-typing-indicator');
    if (ind) ind.remove();
  }

  async function sendMessage(text) {
    if (!text.trim() || isTyping) return;

    addMessage('user', text);
    const input = shadow.getElementById('qs-input');
    if (input) { input.value = ''; input.style.height = 'auto'; }

    isTyping = true;
    const sendBtn = shadow.getElementById('qs-send-btn');
    if (sendBtn) sendBtn.disabled = true;

    showTypingIndicator();

    // Simulate thinking delay for realism
    const delay = 600 + Math.random() * 800;

    setTimeout(async () => {
      try {
        const response = await QSChatPanel.processCommand(text);
        hideTypingIndicator();
        addMessage('bot', response);
        // Update connection status indicator based on data source
        if (typeof QSMarketData !== 'undefined' && QSMarketData.getDataSource) {
          updateConnectionStatus(QSMarketData.getDataSource());
        }
      } catch (err) {
        hideTypingIndicator();
        addMessage('bot', `❌ Error: ${err.message}`);
      } finally {
        isTyping = false;
        if (sendBtn) sendBtn.disabled = false;
      }
    }, delay);
  }

  // ---- Open / Close ----
  function openPanel() {
    isOpen = true;
    shadowHost.classList.add('qs-open');
    panel.classList.add('qs-visible');
    toggleBtn.innerHTML = '✕';
    if (messages.length === 0) {
      loadChatHistory();
    }
  }

  function closePanel() {
    isOpen = false;
    shadowHost.classList.remove('qs-open');
    panel.classList.remove('qs-visible');
    toggleBtn.innerHTML = 'QS';
  }

  async function loadChatHistory() {
    const history = await QSStorage.getChatHistory();
    if (history.length > 0) {
      messages = history;
      const container = shadow.getElementById('qs-messages');
      if (container) container.innerHTML = '';
      messages.forEach(m => renderMessage(m));
      scrollToBottom();
      addMessage('system', '— Previous session restored —', true);
    } else {
      addMessage('bot', QSChatPanel.WELCOME_MESSAGE, true);
    }
  }

  // ---- Tab switching ----
  function switchTab(tabName) {
    currentTab = tabName;
    shadow.querySelectorAll('.qs-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tabName);
    });
    shadow.querySelectorAll('.qs-tab-panel').forEach(p => {
      p.classList.toggle('active', p.id === `qs-${tabName}-panel`);
    });

    // Show/hide quick actions and input based on tab
    const quickActions = shadow.getElementById('qs-quick-actions');
    const inputArea = shadow.querySelector('.qs-input-area');
    if (tabName === 'chat') {
      if (quickActions) quickActions.style.display = '';
      if (inputArea) inputArea.style.display = '';
    } else {
      if (quickActions) quickActions.style.display = 'none';
      if (inputArea) inputArea.style.display = 'none';
    }

    // Load content for non-chat tabs
    if (tabName === 'market') {
      QSMarketOverview.renderOverview(shadow.getElementById('qs-market-panel'));
    } else if (tabName === 'watchlist') {
      QSWatchlist.renderWatchlist(shadow.getElementById('qs-watchlist-panel'));
    } else if (tabName === 'settings' && !settingsLoaded) {
      loadSettings();
    }
  }

  async function loadSettings() {
    settingsLoaded = true;
    const settings = await QSStorage.getSettings();
    const avKey = shadow.getElementById('qs-av-key');
    const fhKey = shadow.getElementById('qs-fh-key');
    const demoToggle = shadow.getElementById('qs-demo-toggle');
    const notifToggle = shadow.getElementById('qs-notif-toggle');

    if (avKey) avKey.value = settings.alphaVantageKey || '';
    if (fhKey) fhKey.value = settings.finnhubKey || '';
    if (demoToggle) demoToggle.classList.toggle('on', !!settings.demoMode);
    if (notifToggle) notifToggle.classList.toggle('on', !!settings.notifications);
  }

  // ---- Dragging ----
  function initDrag() {
    const header = shadow.getElementById('qs-header');
    if (!header) return;

    header.addEventListener('mousedown', (e) => {
      if (e.target.tagName === 'BUTTON') return;
      isDragging = true;
      const rect = shadowHost.getBoundingClientRect();
      dragOffset.x = e.clientX - rect.left;
      dragOffset.y = e.clientY - rect.top;
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const x = e.clientX - dragOffset.x;
      const y = e.clientY - dragOffset.y;

      // Clamp to viewport
      const maxX = window.innerWidth - 400;
      const maxY = window.innerHeight - 580;
      const clampedX = Math.max(0, Math.min(x, maxX));
      const clampedY = Math.max(0, Math.min(y, maxY));

      shadowHost.style.left = `${clampedX}px`;
      shadowHost.style.top = `${clampedY}px`;
      shadowHost.style.right = 'auto';
      shadowHost.style.bottom = 'auto';
    });

    document.addEventListener('mouseup', () => { isDragging = false; });
  }

  // ---- Event listeners ----
  toggleBtn.addEventListener('click', () => {
    if (isOpen) closePanel(); else openPanel();
  });

  shadow.getElementById('qs-close-btn').addEventListener('click', closePanel);

  shadow.getElementById('qs-minimize-btn').addEventListener('click', () => {
    isMinimized = !isMinimized;
    const panelHeight = panel.style.height;
    if (isMinimized) {
      panel.style.height = '52px';
      panel.style.overflow = 'hidden';
    } else {
      panel.style.height = '';
      panel.style.overflow = '';
    }
  });

  // Tab buttons
  shadow.querySelectorAll('.qs-tab').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Quick action buttons
  shadow.querySelectorAll('.qs-quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cmd = btn.dataset.cmd;
      if (cmd.endsWith(' ')) {
        // Focus input and pre-fill
        const input = shadow.getElementById('qs-input');
        if (input) { input.value = cmd; input.focus(); }
      } else {
        sendMessage(cmd);
      }
    });
  });

  // Send button
  shadow.getElementById('qs-send-btn').addEventListener('click', () => {
    const input = shadow.getElementById('qs-input');
    if (input) sendMessage(input.value);
  });

  // Input: Enter to send, Shift+Enter for newline
  shadow.getElementById('qs-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const input = shadow.getElementById('qs-input');
      if (input) sendMessage(input.value);
    }
  });

  // Auto-resize textarea
  shadow.getElementById('qs-input').addEventListener('input', (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px';
  });

  // Settings toggles
  shadow.getElementById('qs-demo-toggle').addEventListener('click', (e) => {
    e.target.classList.toggle('on');
  });
  shadow.getElementById('qs-notif-toggle').addEventListener('click', (e) => {
    e.target.classList.toggle('on');
  });

  // Save settings
  shadow.getElementById('qs-save-settings').addEventListener('click', async () => {
    const avKey = shadow.getElementById('qs-av-key').value.trim();
    const fhKey = shadow.getElementById('qs-fh-key').value.trim();
    const demoMode = shadow.getElementById('qs-demo-toggle').classList.contains('on');
    const notifications = shadow.getElementById('qs-notif-toggle').classList.contains('on');

    const currentSettings = await QSStorage.getSettings();
    await QSStorage.saveSettings({
      ...currentSettings,
      alphaVantageKey: avKey,
      finnhubKey: fhKey,
      demoMode,
      notifications
    });

    if (avKey) QUANTSAGE_CONFIG.demoMode = false;

    const btn = shadow.getElementById('qs-save-settings');
    btn.textContent = '✓ Saved!';
    setTimeout(() => { btn.textContent = 'Save Settings'; }, 2000);
  });

  // Listen for messages from background
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'PRICE_ALERT') {
      toggleBtn.classList.add('qs-has-alert');
      if (!isOpen) openPanel();
      addMessage('system', `🔔 Price Alert: ${msg.ticker} has reached ${msg.price}`);
    }
    if (msg.type === 'CONTEXT_ANALYZE') {
      if (!isOpen) openPanel();
      sendMessage(`/analyze ${msg.ticker}`);
    }
    if (msg.type === 'OPEN_PANEL') {
      if (!isOpen) openPanel();
    }
    if (msg.type === 'SCRAPE_PAGE') {
      // Respond with scraped page data (synchronous, no async needed)
      const data = scrapePageForAnalysis();
      sendResponse(data);
      return true; // Required to keep message channel open
    }
  });

  // ---- Connection status indicator ----
  function updateConnectionStatus(source) {
    const dot = shadow.getElementById('qs-status-dot');
    const label = shadow.getElementById('qs-status-label');
    if (!dot || !label) return;
    if (source === 'live') {
      dot.style.background = '#22c55e';
      dot.style.animation = 'none';
      label.textContent = 'Live';
    } else if (source === 'cache') {
      dot.style.background = '#eab308';
      dot.style.animation = 'none';
      label.textContent = 'Cached';
    } else {
      dot.style.background = '#ef4444';
      dot.style.animation = 'qs-blink 2s infinite';
      label.textContent = 'Demo';
    }
  }

  // ---- Scrape current page for /page command ----
  function scrapePageForAnalysis() {
    const url = window.location.href;
    const title = document.title;

    // Use chatPanel's ticker detection if available
    const ticker = (typeof QSChatPanel !== 'undefined' && QSChatPanel.detectTickerFromUrl)
      ? QSChatPanel.detectTickerFromUrl(url)
      : null;

    const bodyText = document.body ? document.body.innerText.slice(0, 5000) : '';

    // Extract tables
    const tables = [];
    let tableCount = 0;
    document.querySelectorAll('table').forEach(table => {
      if (tableCount >= 4) return;
      const rows = [];
      table.querySelectorAll('tr').forEach(tr => {
        const cells = Array.from(tr.querySelectorAll('th, td')).map(td => td.innerText.trim()).filter(Boolean);
        if (cells.length > 0) rows.push(cells);
      });
      if (rows.length > 1 && rows.length <= 30) { tables.push(rows); tableCount++; }
    });

    return { url, title, ticker, bodyText, tables };
  }



  initDrag();

})();
