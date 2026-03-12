// QuantSage - API Client (utils/api.js)
// Multi-source API client: Indian Stock API → Yahoo Finance → Alpha Vantage → Mock data

const QSAPI = (() => {
  const requestQueue = [];
  const requestTimestamps = [];
  let isProcessingQueue = false;
  let lastDataSource = 'mock'; // track where latest data came from

  // Indian NSE tickers list for currency detection
  const INDIAN_TICKERS = new Set([
    'RELIANCE','TCS','INFY','HDFCBANK','ITC','ADANIPOWER','ADANIENT','ADANIPORTS',
    'WIPRO','SBIN','BAJFINANCE','BAJAJ-AUTO','TATAMOTORS','TATASTEEL','SUNPHARMA',
    'LT','MARUTI','HCLTECH','AXISBANK','ICICIBANK','KOTAKBANK','BHARTIARTL',
    'ASIANPAINT','ULTRACEMCO','TITAN','NESTLEIND','POWERGRID','NTPC','ONGC',
    'COALINDIA','JSWSTEEL','TECHM','HINDALCO','DRREDDY','CIPLA','DIVISLAB',
    'HEROMOTOCO','EICHERMOTOR','APOLLOHOSP','BPCL','NIFTY50','BANKNIFTY',
    'SENSEX','VEDL','GRASIM','INDUSINDBK','HDFC','BAJAJFINSV','BRITANNIA',
    'DABUR','HAVELLS','PIDILITIND','MUTHOOTFIN','TATACONSUM','ZOMATO','PAYTM',
    'NYKAA','DELHIVERY','IRCTC','PVR','JUBLFOOD'
  ]);

  function isIndianTicker(ticker) {
    const upper = ticker.toUpperCase().replace(/\.(NS|BO)$/, '');
    return INDIAN_TICKERS.has(upper) || ticker.endsWith('.NS') || ticker.endsWith('.BO');
  }

  function getDataSource() { return lastDataSource; }

  function getRateLimit() {
    const config = (typeof QUANTSAGE_CONFIG !== 'undefined') ? QUANTSAGE_CONFIG.api : null;
    return config ? config.providers.alphaVantage.rateLimit : { requests: 5, windowMs: 60000 };
  }

  function canMakeRequest() {
    const { requests, windowMs } = getRateLimit();
    const now = Date.now();
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
        if (canMakeRequest()) { resolve(); } else { setTimeout(check, 2000); }
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

  // ---- Priority 1: Indian Stock Market API (free, no key) ----
  async function fetchFromIndianAPI(ticker) {
    const baseUrl = 'https://military-jobye-haiqstudios-14f59639.koyeb.app';
    const timeout = 8000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    // Try .NS first, then .BO
    const symbol = ticker.includes('.') ? ticker : `${ticker}.NS`;
    try {
      const response = await fetch(`${baseUrl}/stock?symbol=${encodeURIComponent(symbol)}`, {
        signal: controller.signal
      });
      clearTimeout(timer);
      if (!response.ok) throw new Error(`Indian API HTTP ${response.status}`);
      const data = await response.json();

      // Normalize response — the API returns Yahoo Finance-style data
      const result = data.chart && data.chart.result && data.chart.result[0];
      if (!result) throw new Error('No data in Indian API response');

      const meta = result.meta || {};
      const price = meta.regularMarketPrice || meta.chartPreviousClose;
      if (!price) throw new Error('No price in Indian API response');

      return {
        symbol: ticker.toUpperCase().replace(/\.(NS|BO)$/, ''),
        name: meta.longName || meta.shortName || ticker,
        price: parseFloat(price),
        change: parseFloat(meta.regularMarketChange || 0),
        changePercent: parseFloat(meta.regularMarketChangePercent || 0),
        volume: parseInt(meta.regularMarketVolume || 0),
        high: parseFloat(meta.regularMarketDayHigh || price),
        low: parseFloat(meta.regularMarketDayLow || price),
        open: parseFloat(meta.regularMarketOpen || price),
        prevClose: parseFloat(meta.previousClose || meta.chartPreviousClose || price),
        week52High: parseFloat(meta.fiftyTwoWeekHigh || price * 1.3),
        week52Low: parseFloat(meta.fiftyTwoWeekLow || price * 0.7),
        currency: 'INR',
        exchange: meta.exchangeName || 'NSE',
        dataSource: 'indian-api'
      };
    } catch (err) {
      clearTimeout(timer);
      // Try .BO suffix if .NS failed and no suffix was given
      if (!ticker.includes('.') && symbol.endsWith('.NS')) {
        const boController = new AbortController();
        const boTimer = setTimeout(() => boController.abort(), timeout);
        try {
          const res = await fetch(`${baseUrl}/stock?symbol=${encodeURIComponent(ticker + '.BO')}`, {
            signal: boController.signal
          });
          clearTimeout(boTimer);
          if (!res.ok) throw new Error(`Indian API BSE HTTP ${res.status}`);
          const data = await res.json();
          const result = data.chart && data.chart.result && data.chart.result[0];
          if (!result) throw new Error('No BSE data');
          const meta = result.meta || {};
          const price = meta.regularMarketPrice || meta.chartPreviousClose;
          if (!price) throw new Error('No BSE price');
          return {
            symbol: ticker.toUpperCase(),
            name: meta.longName || meta.shortName || ticker,
            price: parseFloat(price),
            change: parseFloat(meta.regularMarketChange || 0),
            changePercent: parseFloat(meta.regularMarketChangePercent || 0),
            volume: parseInt(meta.regularMarketVolume || 0),
            high: parseFloat(meta.regularMarketDayHigh || price),
            low: parseFloat(meta.regularMarketDayLow || price),
            open: parseFloat(meta.regularMarketOpen || price),
            prevClose: parseFloat(meta.previousClose || meta.chartPreviousClose || price),
            week52High: parseFloat(meta.fiftyTwoWeekHigh || price * 1.3),
            week52Low: parseFloat(meta.fiftyTwoWeekLow || price * 0.7),
            currency: 'INR',
            exchange: 'BSE',
            dataSource: 'indian-api'
          };
        } catch (e2) {
          clearTimeout(boTimer);
          throw new Error(`Indian API failed: ${err.message}`);
        }
      }
      throw new Error(`Indian API failed: ${err.message}`);
    }
  }

  // ---- Priority 2: Yahoo Finance (free, no key) ----
  async function fetchFromYahoo(ticker) {
    const timeout = 8000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    // For Indian stocks append .NS if no suffix
    const symbol = isIndianTicker(ticker) && !ticker.includes('.')
      ? `${ticker}.NS`
      : ticker;

    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timer);
      if (!response.ok) throw new Error(`Yahoo HTTP ${response.status}`);
      const data = await response.json();

      const result = data.chart && data.chart.result && data.chart.result[0];
      if (!result) throw new Error('No Yahoo Finance data');

      const meta = result.meta || {};
      const price = meta.regularMarketPrice || meta.chartPreviousClose;
      if (!price) throw new Error('No price from Yahoo Finance');

      const detectedCurrency = meta.currency || (isIndianTicker(ticker) ? 'INR' : 'USD');

      return {
        symbol: ticker.toUpperCase().replace(/\.(NS|BO)$/, ''),
        name: meta.longName || meta.shortName || ticker,
        price: parseFloat(price),
        change: parseFloat(meta.regularMarketChange || 0),
        changePercent: parseFloat(meta.regularMarketChangePercent || 0),
        volume: parseInt(meta.regularMarketVolume || 0),
        high: parseFloat(meta.regularMarketDayHigh || price),
        low: parseFloat(meta.regularMarketDayLow || price),
        open: parseFloat(meta.regularMarketOpen || price),
        prevClose: parseFloat(meta.previousClose || meta.chartPreviousClose || price),
        week52High: parseFloat(meta.fiftyTwoWeekHigh || price * 1.3),
        week52Low: parseFloat(meta.fiftyTwoWeekLow || price * 0.7),
        currency: detectedCurrency === 'INR' || isIndianTicker(ticker) ? 'INR' : detectedCurrency,
        exchange: meta.exchangeName || (isIndianTicker(ticker) ? 'NSE' : 'Unknown'),
        dataSource: 'yahoo'
      };
    } catch (err) {
      clearTimeout(timer);
      throw new Error(`Yahoo Finance failed: ${err.message}`);
    }
  }

  // ---- Priority 3: Alpha Vantage (requires API key) ----
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

  // ---- Main fetchStockData with fallback chain ----
  async function fetchStockData(ticker) {
    const upperTicker = ticker.toUpperCase().trim();
    const cacheKey = `stock_${upperTicker}`;

    // Check cache first (60s TTL)
    if (typeof QSStorage !== 'undefined') {
      const cached = await QSStorage.getCachedData(cacheKey);
      if (cached) {
        lastDataSource = cached.dataSource || 'cache';
        return cached;
      }
    }

    const mockData = (typeof QUANTSAGE_CONFIG !== 'undefined') ? QUANTSAGE_CONFIG.mockData.stocks : {};

    // --- Priority 1: Indian Stock Market API (for Indian tickers) ---
    if (isIndianTicker(upperTicker)) {
      try {
        const result = await fetchFromIndianAPI(upperTicker);
        // Merge with mock data for missing fundamentals
        const mock = mockData[upperTicker];
        if (mock) {
          result.pe = result.pe || mock.pe;
          result.eps = result.eps || mock.eps;
          result.roe = result.roe || mock.roe;
          result.debtEquity = result.debtEquity !== undefined ? result.debtEquity : mock.debtEquity;
          result.marketCap = result.marketCap || mock.marketCap;
          result.sector = result.sector || mock.sector;
          result.name = result.name !== upperTicker ? result.name : (mock.name || upperTicker);
          result.prices = mock.prices;
        }
        lastDataSource = 'live';
        if (typeof QSStorage !== 'undefined') await QSStorage.setCachedData(cacheKey, result);
        return result;
      } catch (e) {
        // Fall through to Yahoo Finance
      }
    }

    // --- Priority 2: Yahoo Finance ---
    try {
      const result = await fetchFromYahoo(upperTicker);
      const mock = mockData[upperTicker];
      if (mock) {
        result.pe = result.pe || mock.pe;
        result.eps = result.eps || mock.eps;
        result.roe = result.roe || mock.roe;
        result.debtEquity = result.debtEquity !== undefined ? result.debtEquity : mock.debtEquity;
        result.marketCap = result.marketCap || mock.marketCap;
        result.sector = result.sector || mock.sector;
        result.prices = mock.prices;
      }
      lastDataSource = 'live';
      if (typeof QSStorage !== 'undefined') await QSStorage.setCachedData(cacheKey, result);
      return result;
    } catch (e) {
      // Fall through to Alpha Vantage
    }

    // --- Priority 3: Alpha Vantage (if key configured) ---
    if (await isConfigured()) {
      try {
        const data = await fetchFromAlphaVantage({ function: 'GLOBAL_QUOTE', symbol: upperTicker });
        const q = data['Global Quote'];
        if (q && q['05. price']) {
          const currency = isIndianTicker(upperTicker) ? 'INR' : 'USD';
          const result = {
            symbol: upperTicker,
            name: mockData[upperTicker] ? mockData[upperTicker].name : upperTicker,
            price: parseFloat(q['05. price']),
            change: parseFloat(q['09. change']),
            changePercent: parseFloat(q['10. change percent'].replace('%', '')),
            volume: parseInt(q['06. volume']),
            high: parseFloat(q['03. high']),
            low: parseFloat(q['04. low']),
            open: parseFloat(q['02. open']),
            prevClose: parseFloat(q['08. previous close']),
            latestTradingDay: q['07. latest trading day'],
            currency,
            exchange: isIndianTicker(upperTicker) ? 'NSE' : 'Unknown',
            dataSource: 'alpha-vantage'
          };
          if (mockData[upperTicker]) {
            const mock = mockData[upperTicker];
            result.pe = mock.pe; result.eps = mock.eps; result.roe = mock.roe;
            result.debtEquity = mock.debtEquity; result.marketCap = mock.marketCap;
            result.sector = mock.sector; result.prices = mock.prices;
          }
          lastDataSource = 'live';
          if (typeof QSStorage !== 'undefined') await QSStorage.setCachedData(cacheKey, result);
          return result;
        }
      } catch (e) {
        // Fall through to mock
      }
    }

    // --- Priority 4: Mock data fallback ---
    lastDataSource = 'mock';
    if (mockData[upperTicker]) {
      return { ...mockData[upperTicker], dataSource: 'mock' };
    }

    // --- Last resort: synthetic data ---
    return generateSyntheticStock(upperTicker);
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
    const indian = isIndianTicker(ticker);
    const basePrice = indian ? (200 + Math.random() * 1800) : (50 + Math.random() * 500);
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
      currency: indian ? 'INR' : 'USD',
      exchange: indian ? 'NSE' : 'Unknown',
      isSynthetic: true,
      dataSource: 'synthetic',
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
    isIndianTicker,
    getDataSource,
    generateSyntheticHistory
  };
})();

if (typeof window !== 'undefined') {
  window.QSAPI = QSAPI;
}

