// QuantSage - Market Overview Component (components/marketOverview.js)

const QSMarketOverview = (() => {

  async function renderOverview(container) {
    if (!container) return;
    container.innerHTML = '<div class="qs-loading">Loading market data...</div>';

    try {
      const [indices, commodities] = await Promise.all([
        QSMarketData.getMarketIndices(),
        QSMarketData.getCommodities()
      ]);

      const indexOrder = ['NIFTY50', 'BANKNIFTY', 'SENSEX', 'SPX', 'NDX', 'DJI'];
      const commodityOrder = ['GOLD', 'CRUDE', 'SILVER'];

      const html = `
        <div class="qs-overview-section">
          <div class="qs-overview-label">🇮🇳 Indian Markets</div>
          <div class="qs-mini-cards-grid">
            ${['NIFTY50', 'BANKNIFTY', 'SENSEX'].map(k => indices[k] ? QSStockCard.createMiniCard(indices[k]) : '').join('')}
          </div>
        </div>
        <div class="qs-overview-section">
          <div class="qs-overview-label">🌍 Global Markets</div>
          <div class="qs-mini-cards-grid">
            ${['SPX', 'NDX', 'DJI'].map(k => indices[k] ? QSStockCard.createMiniCard(indices[k]) : '').join('')}
          </div>
        </div>
        <div class="qs-overview-section">
          <div class="qs-overview-label">🏅 Commodities</div>
          <div class="qs-mini-cards-grid">
            ${commodityOrder.map(k => commodities[k] ? QSStockCard.createMiniCard(commodities[k]) : '').join('')}
          </div>
        </div>
        <div class="qs-overview-footer">
          <span>Last updated: ${new Date().toLocaleTimeString()}</span>
          <span style="color:#94a3b8; font-size:0.7rem">Demo data</span>
        </div>`;

      container.innerHTML = html;
    } catch (err) {
      container.innerHTML = `<div class="qs-error">Failed to load market data: ${err.message}</div>`;
    }
  }

  async function renderOverviewChat() {
    const [indices, commodities] = await Promise.all([
      QSMarketData.getMarketIndices(),
      QSMarketData.getCommodities()
    ]);

    const fmt = (v) => v.toLocaleString('en-IN', { maximumFractionDigits: 2 });
    const sign = (p) => p >= 0 ? '▲' : '▼';
    const icon = (p) => p >= 0 ? '📗' : '📕';

    let msg = `📊 **Market Overview** — ${new Date().toLocaleString()}\n\n`;

    msg += `🇮🇳 **Indian Markets**\n`;
    for (const key of ['NIFTY50', 'BANKNIFTY', 'SENSEX']) {
      if (indices[key]) {
        const i = indices[key];
        msg += `${icon(i.changePercent)} ${i.name}: **${fmt(i.value)}** ${sign(i.changePercent)} ${Math.abs(i.changePercent).toFixed(2)}%\n`;
      }
    }

    msg += `\n🌍 **Global Markets**\n`;
    for (const key of ['SPX', 'NDX', 'DJI']) {
      if (indices[key]) {
        const i = indices[key];
        msg += `${icon(i.changePercent)} ${i.name}: **${fmt(i.value)}** ${sign(i.changePercent)} ${Math.abs(i.changePercent).toFixed(2)}%\n`;
      }
    }

    msg += `\n🏅 **Commodities**\n`;
    for (const key of ['GOLD', 'CRUDE', 'SILVER']) {
      if (commodities[key]) {
        const c = commodities[key];
        msg += `${icon(c.changePercent)} ${c.name}: **$${c.price.toFixed(2)}** ${sign(c.changePercent)} ${Math.abs(c.changePercent).toFixed(2)}%\n`;
      }
    }

    msg += `\n_Data refreshes every 5 minutes_`;
    return msg;
  }

  return { renderOverview, renderOverviewChat };
})();

if (typeof window !== 'undefined') {
  window.QSMarketOverview = QSMarketOverview;
}
