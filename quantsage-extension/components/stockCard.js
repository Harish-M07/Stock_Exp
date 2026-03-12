// QuantSage - Stock Card Component (components/stockCard.js)

const QSStockCard = (() => {

  function formatPrice(price, currency) {
    const symbol = currency === 'INR' ? '₹' : '$';
    if (price >= 10000000) return `${symbol}${(price / 10000000).toFixed(2)}Cr`;
    if (price >= 100000) return `${symbol}${(price / 100000).toFixed(2)}L`;
    if (price >= 1000) return `${symbol}${price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    return `${symbol}${price.toFixed(2)}`;
  }

  function formatVolume(volume) {
    if (volume >= 10000000) return `${(volume / 10000000).toFixed(2)}Cr`;
    if (volume >= 100000) return `${(volume / 100000).toFixed(2)}L`;
    if (volume >= 1000) return `${(volume / 1000).toFixed(0)}K`;
    return volume.toString();
  }

  function formatMarketCap(cap) {
    if (!cap) return 'N/A';
    if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
    if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
    if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`;
    return `$${cap.toLocaleString()}`;
  }

  function getWeek52Position(price, low52, high52) {
    if (!low52 || !high52 || high52 === low52) return 50;
    return Math.round(((price - low52) / (high52 - low52)) * 100);
  }

  function generateSparkline(prices) {
    if (!prices || prices.length < 2) return '';
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;
    const width = 60;
    const height = 20;

    // Build SVG path points
    const points = prices.map((p, i) => {
      const x = (i / (prices.length - 1)) * width;
      const y = height - ((p - min) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    const isPositive = prices[prices.length - 1] >= prices[0];
    const color = isPositive ? '#22c55e' : '#ef4444';

    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="overflow:visible">
      <polyline points="${points}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  }

  function createCard(stock, options) {
    options = options || {};
    const isPositive = stock.changePercent >= 0;
    const changeColor = isPositive ? '#22c55e' : '#ef4444';
    const changeArrow = isPositive ? '▲' : '▼';
    const currency = stock.currency || 'INR';
    const week52Pos = getWeek52Position(stock.price, stock.week52Low, stock.week52High);
    const sparkline = stock.prices ? generateSparkline(stock.prices) : '';

    const showRemoveBtn = options.showRemoveButton !== false;
    const compact = options.compact === true;

    if (compact) {
      return `<div class="qs-stock-card-compact" data-ticker="${stock.symbol}">
        <div class="qs-sc-left">
          <span class="qs-sc-ticker">${stock.symbol}</span>
          <span class="qs-sc-name">${stock.name || stock.symbol}</span>
        </div>
        <div class="qs-sc-right">
          <span class="qs-sc-price">${formatPrice(stock.price, currency)}</span>
          <span class="qs-sc-change" style="color:${changeColor}">${changeArrow} ${Math.abs(stock.changePercent).toFixed(2)}%</span>
        </div>
        ${showRemoveBtn ? `<button class="qs-sc-remove" data-ticker="${stock.symbol}" title="Remove">✕</button>` : ''}
      </div>`;
    }

    return `<div class="qs-stock-card" data-ticker="${stock.symbol}">
      <div class="qs-sc-header">
        <div>
          <div class="qs-sc-ticker">${stock.symbol}</div>
          <div class="qs-sc-name">${stock.name || stock.symbol}</div>
        </div>
        <div class="qs-sc-sparkline">${sparkline}</div>
      </div>
      <div class="qs-sc-price-row">
        <span class="qs-sc-price-large">${formatPrice(stock.price, currency)}</span>
        <span class="qs-sc-change-badge" style="background:${isPositive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}; color:${changeColor}">
          ${changeArrow} ${Math.abs(stock.change).toFixed(2)} (${Math.abs(stock.changePercent).toFixed(2)}%)
        </span>
      </div>
      <div class="qs-sc-stats">
        <div class="qs-sc-stat"><span class="qs-sc-stat-label">Open</span><span>${formatPrice(stock.open || 0, currency)}</span></div>
        <div class="qs-sc-stat"><span class="qs-sc-stat-label">High</span><span style="color:#22c55e">${formatPrice(stock.high || 0, currency)}</span></div>
        <div class="qs-sc-stat"><span class="qs-sc-stat-label">Low</span><span style="color:#ef4444">${formatPrice(stock.low || 0, currency)}</span></div>
        <div class="qs-sc-stat"><span class="qs-sc-stat-label">Vol</span><span>${formatVolume(stock.volume || 0)}</span></div>
      </div>
      ${stock.week52High && stock.week52Low ? `
      <div class="qs-sc-range">
        <span class="qs-sc-stat-label">52W Range</span>
        <div class="qs-sc-range-bar">
          <div class="qs-sc-range-fill" style="left:0; width:${week52Pos}%"></div>
          <div class="qs-sc-range-dot" style="left:${week52Pos}%"></div>
        </div>
        <div class="qs-sc-range-labels">
          <span>${formatPrice(stock.week52Low, currency)}</span>
          <span>${formatPrice(stock.week52High, currency)}</span>
        </div>
      </div>` : ''}
      ${stock.pe || stock.eps ? `
      <div class="qs-sc-fundamentals">
        ${stock.pe ? `<span class="qs-sc-fund-item">P/E: <strong>${stock.pe}</strong></span>` : ''}
        ${stock.eps ? `<span class="qs-sc-fund-item">EPS: <strong>${stock.eps}</strong></span>` : ''}
        ${stock.sector ? `<span class="qs-sc-fund-item">Sector: <strong>${stock.sector}</strong></span>` : ''}
      </div>` : ''}
    </div>`;
  }

  function createMiniCard(data) {
    const isPositive = data.changePercent >= 0;
    const color = isPositive ? '#22c55e' : '#ef4444';
    const arrow = isPositive ? '▲' : '▼';
    const val = typeof data.value !== 'undefined' ? data.value : data.price;

    return `<div class="qs-mini-card">
      <div class="qs-mc-name">${data.name}</div>
      <div class="qs-mc-value">${val ? val.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : 'N/A'}</div>
      <div class="qs-mc-change" style="color:${color}">${arrow} ${Math.abs(data.changePercent || 0).toFixed(2)}%</div>
    </div>`;
  }

  return { createCard, createMiniCard, formatPrice, formatVolume, formatMarketCap };
})();

if (typeof window !== 'undefined') {
  window.QSStockCard = QSStockCard;
}
