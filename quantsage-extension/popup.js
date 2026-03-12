// QuantSage - Popup Script (popup.js)

document.addEventListener('DOMContentLoaded', async () => {
  let currentTab = 'overview';

  // ---- Tab switching ----
  document.querySelectorAll('.qs-popup-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.dataset.tab);
    });
  });

  function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.qs-popup-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    document.querySelectorAll('.qs-popup-panel').forEach(p => p.classList.toggle('active', p.id === `qs-tab-${tab}`));

    if (tab === 'overview') loadMarketOverview();
    else if (tab === 'watchlist') loadWatchlist();
    else if (tab === 'search') { /* nothing to load initially */ }
    else if (tab === 'settings') loadSettings();
  }

  // ---- "Open Chat" button ----
  document.getElementById('qs-open-chat').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      chrome.tabs.sendMessage(tab.id, { type: 'OPEN_PANEL' });
    }
    window.close();
  });

  // ---- Market Overview ----
  async function loadMarketOverview() {
    const indianEl = document.getElementById('qs-indian-indices');
    const globalEl = document.getElementById('qs-global-indices');
    const commodEl = document.getElementById('qs-commodities');
    const updatedEl = document.getElementById('qs-last-updated');

    try {
      const [indices, commodities] = await Promise.all([
        QSMarketData.getMarketIndices(),
        QSMarketData.getCommodities()
      ]);

      const renderGrid = (el, items) => {
        el.innerHTML = items.map(d => {
          const isPos = d.changePercent >= 0;
          const color = isPos ? '#22c55e' : '#ef4444';
          const arrow = isPos ? '▲' : '▼';
          const val = typeof d.value !== 'undefined' ? d.value : d.price;
          const formattedVal = d.unit
            ? `$${val.toFixed(2)}`
            : val.toLocaleString('en-IN', { maximumFractionDigits: 2 });
          return `<div class="qs-index-card">
            <div class="qs-ic-name">${d.name}</div>
            <div class="qs-ic-value">${formattedVal}</div>
            <div class="qs-ic-change" style="color:${color}">${arrow} ${Math.abs(d.changePercent).toFixed(2)}%</div>
          </div>`;
        }).join('');
      };

      renderGrid(indianEl, ['NIFTY50', 'BANKNIFTY', 'SENSEX'].map(k => indices[k]).filter(Boolean));
      renderGrid(globalEl, ['SPX', 'NDX', 'DJI'].map(k => indices[k]).filter(Boolean));
      renderGrid(commodEl, ['GOLD', 'CRUDE', 'SILVER'].map(k => commodities[k]).filter(Boolean));

      if (updatedEl) updatedEl.textContent = `Updated: ${new Date().toLocaleTimeString()}`;
    } catch (err) {
      indianEl.innerHTML = `<div class="qs-error" style="grid-column:1/-1">Failed to load market data</div>`;
    }
  }

  document.getElementById('qs-refresh-btn').addEventListener('click', loadMarketOverview);

  // ---- Watchlist ----
  async function loadWatchlist() {
    const container = document.getElementById('qs-watchlist-content');
    container.innerHTML = '<div class="qs-loading">Loading...</div>';

    try {
      const tickers = await QSStorage.getWatchlist();

      if (tickers.length === 0) {
        container.innerHTML = `<div class="qs-empty">
          <div style="font-size:2rem;margin-bottom:8px">👁</div>
          <div>Your watchlist is empty.</div>
          <div style="font-size:11px;color:#64748b;margin-top:4px">Add stocks using the chat panel</div>
        </div>
        <div class="qs-wl-add-row">
          <input type="text" class="qs-wl-add-input" id="qs-wl-add-input" placeholder="Enter ticker (e.g. RELIANCE)" style="text-transform:uppercase">
          <button class="qs-wl-add-btn" id="qs-wl-add-btn">+ Add</button>
        </div>`;
        bindAddButton();
        return;
      }

      const quotes = await QSMarketData.getBatchQuotes(tickers);

      const items = tickers.map(ticker => {
        const q = quotes[ticker];
        if (!q) return `<div class="qs-wl-item"><div class="qs-wl-left"><div class="qs-wl-ticker">${ticker}</div></div><div style="color:#64748b;font-size:11px">N/A</div></div>`;
        const isPos = q.changePercent >= 0;
        const color = isPos ? '#22c55e' : '#ef4444';
        const arrow = isPos ? '▲' : '▼';
        const sym = q.currency === 'INR' ? '₹' : '$';
        return `<div class="qs-wl-item" data-ticker="${ticker}">
          <div class="qs-wl-left">
            <div class="qs-wl-ticker">${ticker}</div>
            <div class="qs-wl-name">${q.name || ticker}</div>
          </div>
          <div class="qs-wl-right">
            <div class="qs-wl-price">${sym}${q.price.toFixed(2)}</div>
            <div class="qs-wl-change" style="color:${color}">${arrow} ${Math.abs(q.changePercent).toFixed(2)}%</div>
          </div>
          <button class="qs-wl-remove" data-ticker="${ticker}" title="Remove">✕</button>
        </div>`;
      }).join('');

      container.innerHTML = `${items}
        <div class="qs-wl-add-row">
          <input type="text" class="qs-wl-add-input" id="qs-wl-add-input" placeholder="Add ticker..." style="text-transform:uppercase">
          <button class="qs-wl-add-btn" id="qs-wl-add-btn">+ Add</button>
        </div>`;

      container.querySelectorAll('.qs-wl-remove').forEach(btn => {
        btn.addEventListener('click', async () => {
          await QSStorage.removeFromWatchlist(btn.dataset.ticker);
          loadWatchlist();
        });
      });

      bindAddButton();
    } catch (err) {
      container.innerHTML = `<div class="qs-error">Error: ${err.message}</div>`;
    }
  }

  function bindAddButton() {
    const addInput = document.getElementById('qs-wl-add-input');
    const addBtn = document.getElementById('qs-wl-add-btn');
    if (!addBtn) return;

    addBtn.addEventListener('click', async () => {
      const val = addInput.value.trim().toUpperCase();
      if (!val) return;
      const result = await QSStorage.addToWatchlist(val);
      if (result.success) {
        addInput.value = '';
        loadWatchlist();
      } else {
        addInput.style.borderColor = '#ef4444';
        setTimeout(() => { addInput.style.borderColor = ''; }, 2000);
      }
    });

    addInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') addBtn.click();
    });
  }

  // ---- Search ----
  document.getElementById('qs-search-btn').addEventListener('click', performSearch);
  document.getElementById('qs-search-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') performSearch();
  });

  document.querySelectorAll('.qs-ticker-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('qs-search-input').value = btn.dataset.ticker;
      performSearch();
    });
  });

  async function performSearch() {
    const input = document.getElementById('qs-search-input').value.trim().toUpperCase();
    if (!input) return;

    const resultEl = document.getElementById('qs-search-result');
    resultEl.innerHTML = '<div class="qs-loading">Fetching data...</div>';

    try {
      const quote = await QSMarketData.getQuote(input);
      if (!quote) {
        resultEl.innerHTML = `<div class="qs-error">No data found for "${input}". Check the ticker symbol.</div>`;
        return;
      }

      const isPos = quote.changePercent >= 0;
      const color = isPos ? '#22c55e' : '#ef4444';
      const arrow = isPos ? '▲' : '▼';
      const sym = quote.currency === 'INR' ? '₹' : '$';

      resultEl.innerHTML = `<div class="qs-search-result-card">
        <div class="qs-src-header">
          <div>
            <div class="qs-src-ticker">${quote.symbol}</div>
            <div class="qs-src-name">${quote.name || quote.symbol}</div>
          </div>
          <div style="font-size:10px;color:#64748b">${quote.exchange || ''}</div>
        </div>
        <div class="qs-src-price-row">
          <div class="qs-src-price">${sym}${quote.price.toFixed(2)}</div>
          <div class="qs-src-change" style="color:${color}">${arrow} ${Math.abs(quote.change || 0).toFixed(2)} (${Math.abs(quote.changePercent).toFixed(2)}%)</div>
        </div>
        <div class="qs-src-stats">
          <div class="qs-src-stat">
            <div class="qs-src-stat-label">High</div>
            <div class="qs-src-stat-value" style="color:#22c55e">${sym}${(quote.high || 0).toFixed(2)}</div>
          </div>
          <div class="qs-src-stat">
            <div class="qs-src-stat-label">Low</div>
            <div class="qs-src-stat-value" style="color:#ef4444">${sym}${(quote.low || 0).toFixed(2)}</div>
          </div>
          <div class="qs-src-stat">
            <div class="qs-src-stat-label">Volume</div>
            <div class="qs-src-stat-value">${QSStockCard.formatVolume(quote.volume || 0)}</div>
          </div>
          <div class="qs-src-stat">
            <div class="qs-src-stat-label">P/E</div>
            <div class="qs-src-stat-value">${quote.pe || 'N/A'}</div>
          </div>
        </div>
        ${quote.sector ? `<div style="margin-top:8px;font-size:11px;color:#64748b">Sector: ${quote.sector}</div>` : ''}
      </div>`;
    } catch (err) {
      resultEl.innerHTML = `<div class="qs-error">Error: ${err.message}</div>`;
    }
  }

  // ---- Settings ----
  async function loadSettings() {
    const settings = await QSStorage.getSettings();
    const avKey = document.getElementById('qs-av-key');
    const fhKey = document.getElementById('qs-fh-key');
    const demoMode = document.getElementById('qs-demo-mode');
    const notifications = document.getElementById('qs-notifications');

    if (avKey) avKey.value = settings.alphaVantageKey || '';
    if (fhKey) fhKey.value = settings.finnhubKey || '';
    if (demoMode) demoMode.checked = settings.demoMode !== false;
    if (notifications) notifications.checked = settings.notifications !== false;
  }

  document.getElementById('qs-save-btn').addEventListener('click', async () => {
    const avKey = document.getElementById('qs-av-key').value.trim();
    const fhKey = document.getElementById('qs-fh-key').value.trim();
    const demoMode = document.getElementById('qs-demo-mode').checked;
    const notifications = document.getElementById('qs-notifications').checked;

    const current = await QSStorage.getSettings();
    await QSStorage.saveSettings({
      ...current,
      alphaVantageKey: avKey,
      finnhubKey: fhKey,
      demoMode,
      notifications
    });

    const btn = document.getElementById('qs-save-btn');
    btn.textContent = '✓ Settings Saved!';
    setTimeout(() => { btn.textContent = 'Save Settings'; }, 2000);
  });

  // ---- Initial load ----
  loadMarketOverview();
});
