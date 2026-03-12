// QuantSage - API Client (utils/api.js)
// Handles Alpha Vantage API requests with rate limiting, caching, and demo mode fallback

const QSAPI = (() => {
  const requestQueue = [];
  const requestTimestamps = [];
  let isProcessingQueue = false;

  function getRateLimit() {
    const config = (typeof QUANTSAGE_CONFIG !== 'undefined') ? QUANTSAGE_CONFIG.api : null;
    return config ? config.providers.alphaVantage.rateLimit : { requests: 5, windowMs: 60000 };
  }

  function canMakeRequest() {
    const { requests, windowMs } = getRateLimit();
    const now = Date.now();
    // Remove timestamps outside the window
    while (requestTimestamps.length > 0 && requestTimestamps[0] < now - windowMs) {
      requestTimestamps.shift();
    }
    return requestTimestamps.length < requests;
  }

  function recordRequest() {
    requestTimestamps.push(Date.now());
  }

  async function waitForRateLimit() {
    return new Promise((resolve) => {
      const check = () => {
        if (canMakeRequest()) {
          resolve();
        } else {
          setTimeout(check, 2000);
        }
      };
      check();
    });
  }

  async function getApiKey() {
    if (typeof QSStorage !== 'undefined') {
      const settings = await QSStorage.getSettings();
      return settings.alphaVantageKey || settings.finnhubKey || null;
    }
    return null;
  }

  async function isConfigured() {
    const key = await getApiKey();
    return !!key;
  }

  function isDemoMode() {
    if (typeof QUANTSAGE_CONFIG !== 'undefined') return QUANTSAGE_CONFIG.demoMode;
    return true;
  }

  async function fetchFromAlphaVantage(params) {
    const settings = typeof QSStorage !== 'undefined' ? await QSStorage.getSettings() : {};
    const apiKey = settings.alphaVantageKey;
    if (!apiKey) throw new Error('Alpha Vantage API key not configured');

    const baseUrl = (typeof QUANTSAGE_CONFIG !== 'undefined')
      ? QUANTSAGE_CONFIG.api.providers.alphaVantage.baseUrl
      : 'https://www.alphavantage.co/query';

    const url = new URL(baseUrl);
    Object.entries({ ...params, apikey: apiKey }).forEach(([k, v]) => url.searchParams.set(k, v));

    await waitForRateLimit();
    recordRequest();

    const timeout = (typeof QUANTSAGE_CONFIG !== 'undefined') ? QUANTSAGE_CONFIG.api.requestTimeout : 10000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url.toString(), { signal: controller.signal });
      clearTimeout(timer);
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const data = await response.json();
      if (data['Note']) throw new Error('Rate limit reached. Please wait before making more requests.');
      if (data['Error Message']) throw new Error(data['Error Message']);
      return data;
    } catch (err) {
      clearTimeout(timer);
      if (err.name === 'AbortError') throw new Error('Request timed out. Please try again.');
      throw err;
    }
  }

  async function fetchStockData(ticker) {
    const upperTicker = ticker.toUpperCase().trim();
    const cacheKey = `stock_${upperTicker}`;

    // Check cache first
    if (typeof QSStorage !== 'undefined') {
      const cached = await QSStorage.getCachedData(cacheKey);
      if (cached) return cached;
    }

    // Demo mode: return mock data
    const mockData = (typeof QUANTSAGE_CONFIG !== 'undefined') ? QUANTSAGE_CONFIG.mockData.stocks : {};
    if (isDemoMode() || !(await isConfigured())) {
      const stock = mockData[upperTicker];
      if (stock) {
        if (typeof QSStorage !== 'undefined') await QSStorage.setCachedData(cacheKey, stock);
        return stock;
      }
      // Generate synthetic data for unknown tickers
      return generateSyntheticStock(upperTicker);
    }

    // Real API call
    try {
      const data = await fetchFromAlphaVantage({ function: 'GLOBAL_QUOTE', symbol: upperTicker });
      const q = data['Global Quote'];
      if (!q || !q['05. price']) throw new Error(`No data found for ${upperTicker}`);

      const result = {
        symbol: upperTicker,
        name: upperTicker,
        price: parseFloat(q['05. price']),
        change: parseFloat(q['09. change']),
        changePercent: parseFloat(q['10. change percent'].replace('%', '')),
        volume: parseInt(q['06. volume']),
        high: parseFloat(q['03. high']),
        low: parseFloat(q['04. low']),
        open: parseFloat(q['02. open']),
        prevClose: parseFloat(q['08. previous close']),
        latestTradingDay: q['07. latest trading day'],
        currency: upperTicker.endsWith('.NS') || upperTicker.endsWith('.BO') ? 'INR' : 'USD'
      };

      if (typeof QSStorage !== 'undefined') await QSStorage.setCachedData(cacheKey, result);
      return result;
    } catch (err) {
      // Fallback to mock data if available
      if (mockData[upperTicker]) return mockData[upperTicker];
      throw err;
    }
  }

  async function fetchHistoricalData(ticker, outputSize = 'compact') {
    const upperTicker = ticker.toUpperCase().trim();
    const cacheKey = `hist_${upperTicker}_${outputSize}`;

    if (typeof QSStorage !== 'undefined') {
      const cached = await QSStorage.getCachedData(cacheKey);
      if (cached) return cached;
    }

    if (isDemoMode() || !(await isConfigured())) {
      return generateSyntheticHistory(upperTicker);
    }

    try {
      const data = await fetchFromAlphaVantage({
        function: 'TIME_SERIES_DAILY_ADJUSTED',
        symbol: upperTicker,
        outputsize: outputSize
      });

      const series = data['Time Series (Daily)'];
      if (!series) throw new Error(`No historical data for ${upperTicker}`);

      const result = Object.entries(series)
        .slice(0, 100)
        .map(([date, d]) => ({
          date,
          open: parseFloat(d['1. open']),
          high: parseFloat(d['2. high']),
          low: parseFloat(d['3. low']),
          close: parseFloat(d['4. close']),
          volume: parseInt(d['6. volume'])
        }))
        .reverse();

      if (typeof QSStorage !== 'undefined') await QSStorage.setCachedData(cacheKey, result);
      return result;
    } catch (err) {
      return generateSyntheticHistory(upperTicker);
    }
  }

  async function fetchCompanyOverview(ticker) {
    const upperTicker = ticker.toUpperCase().trim();
    const cacheKey = `overview_${upperTicker}`;

    if (typeof QSStorage !== 'undefined') {
      const cached = await QSStorage.getCachedData(cacheKey);
      if (cached) return cached;
    }

    const mockData = (typeof QUANTSAGE_CONFIG !== 'undefined') ? QUANTSAGE_CONFIG.mockData.stocks : {};
    if (isDemoMode() || !(await isConfigured())) {
      return mockData[upperTicker] || null;
    }

    try {
      const data = await fetchFromAlphaVantage({ function: 'OVERVIEW', symbol: upperTicker });
      if (!data.Symbol) throw new Error(`No overview for ${upperTicker}`);

      const result = {
        symbol: data.Symbol,
        name: data.Name,
        sector: data.Sector,
        industry: data.Industry,
        pe: parseFloat(data.PERatio) || null,
        eps: parseFloat(data.EPS) || null,
        roe: parseFloat(data.ReturnOnEquityTTM) * 100 || null,
        debtEquity: parseFloat(data.DebtToEquityRatio) || null,
        marketCap: parseInt(data.MarketCapitalization) || null,
        revenueGrowth: parseFloat(data.QuarterlyRevenueGrowthYOY) * 100 || null,
        description: data.Description
      };

      if (typeof QSStorage !== 'undefined') await QSStorage.setCachedData(cacheKey, result);
      return result;
    } catch (err) {
      return mockData[upperTicker] || null;
    }
  }

  function generateSyntheticStock(ticker) {
    const basePrice = 100 + Math.random() * 900;
    const change = (Math.random() - 0.45) * basePrice * 0.04;
    return {
      symbol: ticker,
      name: ticker,
      price: parseFloat(basePrice.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat((change / basePrice * 100).toFixed(2)),
      volume: Math.floor(500000 + Math.random() * 5000000),
      high: parseFloat((basePrice * 1.02).toFixed(2)),
      low: parseFloat((basePrice * 0.98).toFixed(2)),
      open: parseFloat((basePrice + change * 0.3).toFixed(2)),
      prevClose: parseFloat((basePrice - change).toFixed(2)),
      week52High: parseFloat((basePrice * 1.35).toFixed(2)),
      week52Low: parseFloat((basePrice * 0.72).toFixed(2)),
      pe: parseFloat((15 + Math.random() * 25).toFixed(1)),
      eps: parseFloat((basePrice / (15 + Math.random() * 25)).toFixed(2)),
      sector: 'Unknown',
      currency: 'USD',
      isSynthetic: true,
      prices: generatePriceSeries(basePrice, 15)
    };
  }

  function generateSyntheticHistory(ticker) {
    const mockStocks = (typeof QUANTSAGE_CONFIG !== 'undefined') ? QUANTSAGE_CONFIG.mockData.stocks : {};
    const basePrice = mockStocks[ticker] ? mockStocks[ticker].price : 100 + Math.random() * 900;
    const series = [];
    let price = basePrice * 0.8;

    for (let i = 100; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const open = price;
      price = price * (1 + (Math.random() - 0.48) * 0.03);
      const close = price;
      const high = Math.max(open, close) * (1 + Math.random() * 0.015);
      const low = Math.min(open, close) * (1 - Math.random() * 0.015);
      series.push({
        date: date.toISOString().split('T')[0],
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        volume: Math.floor(500000 + Math.random() * 5000000)
      });
    }
    return series;
  }

  function generatePriceSeries(basePrice, count) {
    const prices = [];
    let p = basePrice * 0.9;
    for (let i = 0; i < count; i++) {
      p = p * (1 + (Math.random() - 0.47) * 0.03);
      prices.push(parseFloat(p.toFixed(2)));
    }
    return prices;
  }

  return {
    fetchStockData,
    fetchHistoricalData,
    fetchCompanyOverview,
    isConfigured,
    isDemoMode,
    generateSyntheticHistory
  };
})();

if (typeof window !== 'undefined') {
  window.QSAPI = QSAPI;
}
