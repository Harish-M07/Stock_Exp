// QuantSage - Watchlist Component (components/watchlist.js)

const QSWatchlist = (() => {

  let sortBy = 'default';

  async function renderWatchlist(container) {
    if (!container) return;
    container.innerHTML = '<div class="qs-loading">Loading watchlist...</div>';

    try {
      const tickers = await QSStorage.getWatchlist();
      if (tickers.length === 0) {
        container.innerHTML = `<div class="qs-empty-state">
          <div style="font-size:2rem; margin-bottom:8px">👁</div>
          <div>Your watchlist is empty.</div>
          <div style="font-size:0.75rem; color:#94a3b8; margin-top:4px">Type <code>/watch TICKER</code> to add stocks.</div>
        </div>`;
        return;
      }

      const quotes = await QSMarketData.getBatchQuotes(tickers);
      let stocks = tickers.map(t => quotes[t]).filter(Boolean);

      // Sort
      if (sortBy === 'change') {
        stocks.sort((a, b) => b.changePercent - a.changePercent);
      } else if (sortBy === 'name') {
        stocks.sort((a, b) => a.symbol.localeCompare(b.symbol));
      }

      const html = `
        <div class="qs-wl-toolbar">
          <span class="qs-wl-count">${tickers.length}/${20} stocks</span>
          <div class="qs-wl-sort-btns">
            <button class="qs-sort-btn ${sortBy === 'default' ? 'active' : ''}" data-sort="default">Default</button>
            <button class="qs-sort-btn ${sortBy === 'change' ? 'active' : ''}" data-sort="change">% Change</button>
            <button class="qs-sort-btn ${sortBy === 'name' ? 'active' : ''}" data-sort="name">A-Z</button>
          </div>
        </div>
        <div class="qs-wl-list">
          ${stocks.map(s => QSStockCard.createCard(s, { compact: true, showRemoveButton: true })).join('')}
        </div>
        <div class="qs-wl-refresh">
          <button class="qs-btn-secondary qs-wl-refresh-btn">↻ Refresh</button>
          <span class="qs-wl-updated">Updated: ${new Date().toLocaleTimeString()}</span>
        </div>`;

      container.innerHTML = html;

      // Sort button listeners
      container.querySelectorAll('.qs-sort-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          sortBy = btn.dataset.sort;
          renderWatchlist(container);
        });
      });

      // Remove button listeners
      container.querySelectorAll('.qs-sc-remove').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const ticker = btn.dataset.ticker;
          await QSStorage.removeFromWatchlist(ticker);
          renderWatchlist(container);
        });
      });

      // Refresh button
      const refreshBtn = container.querySelector('.qs-wl-refresh-btn');
      if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
          // Clear cache and re-render
          renderWatchlist(container);
        });
      }
    } catch (err) {
      container.innerHTML = `<div class="qs-error">Failed to load watchlist: ${err.message}</div>`;
    }
  }

  async function renderWatchlistChat() {
    const tickers = await QSStorage.getWatchlist();
    if (tickers.length === 0) {
      return '👁 Your watchlist is empty.\n\nUse `/watch TICKER` to add stocks.\nExample: `/watch RELIANCE`';
    }

    const quotes = await QSMarketData.getBatchQuotes(tickers);
    const currency = (t) => quotes[t] ? (quotes[t].currency === 'INR' ? '₹' : '$') : '₹';

    let response = `👁 **Your Watchlist** (${tickers.length} stocks)\n\n`;
    for (const ticker of tickers) {
      const q = quotes[ticker];
      if (!q) { response += `• ${ticker}: Data unavailable\n`; continue; }
      const sign = q.changePercent >= 0 ? '▲' : '▼';
      const color = q.changePercent >= 0 ? '📗' : '📕';
      response += `${color} **${ticker}** — ${currency(ticker)}${q.price.toFixed(2)} ${sign} ${Math.abs(q.changePercent).toFixed(2)}%\n`;
    }
    response += `\n_Use_ \`/analyze TICKER\` _for detailed analysis_`;
    return response;
  }

  return { renderWatchlist, renderWatchlistChat };
})();

if (typeof window !== 'undefined') {
  window.QSWatchlist = QSWatchlist;
}
