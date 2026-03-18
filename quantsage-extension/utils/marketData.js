// QuantSage - Market Data (utils/marketData.js)

const QSMarketData = (() => {

  async function getQuote(ticker) {
    if (typeof QSAPI === 'undefined') return null;
    return QSAPI.fetchStockData(ticker);
  }

  async function getHistoricalData(ticker, period) {
    if (typeof QSAPI === 'undefined') return [];
    const outputSize = (period === 'full') ? 'full' : 'compact';
    return QSAPI.fetchHistoricalData(ticker, outputSize);
  }

  async function getCompanyOverview(ticker) {
    if (typeof QSAPI === 'undefined') return null;
    return QSAPI.fetchCompanyOverview(ticker);
  }

  async function getMarketIndices() {
    const config = (typeof QUANTSAGE_CONFIG !== 'undefined') ? QUANTSAGE_CONFIG : null;
    if (!config) return {};

    // Always use demo data for indices (free APIs don't provide real-time index data easily)
    const indices = config.mockData.indices;

    // Add small randomness to simulate live data
    const result = {};
    for (const [key, data] of Object.entries(indices)) {
      const fluctuation = (Math.random() - 0.5) * data.value * 0.002;
      result[key] = {
        ...data,
        value: parseFloat((data.value + fluctuation).toFixed(2)),
        change: parseFloat((data.change + fluctuation).toFixed(2)),
        changePercent: parseFloat(((data.change + fluctuation) / data.value * 100).toFixed(2)),
        lastUpdated: new Date().toLocaleTimeString()
      };
    }
    return result;
  }

  async function getCommodities() {
    const config = (typeof QUANTSAGE_CONFIG !== 'undefined') ? QUANTSAGE_CONFIG : null;
    if (!config) return {};

    const commodities = config.mockData.commodities;
    const result = {};
    for (const [key, data] of Object.entries(commodities)) {
      const fluctuation = (Math.random() - 0.5) * data.price * 0.003;
      result[key] = {
        ...data,
        price: parseFloat((data.price + fluctuation).toFixed(2)),
        change: parseFloat((data.change + fluctuation).toFixed(2)),
        changePercent: parseFloat(((fluctuation + data.change) / (data.price - data.change) * 100).toFixed(2)),
        lastUpdated: new Date().toLocaleTimeString()
      };
    }
    return result;
  }

  async function getBatchQuotes(tickers) {
    const results = {};
    for (const ticker of tickers) {
      try {
        results[ticker] = await getQuote(ticker);
      } catch (e) {
        results[ticker] = null;
      }
    }
    return results;
  }

  function getDataSource() {
    if (typeof QSAPI !== 'undefined' && QSAPI.getDataSource) {
      return QSAPI.getDataSource();
    }
    return 'mock';
  }

  return {
    getQuote,
    getHistoricalData,
    getCompanyOverview,
    getMarketIndices,
    getCommodities,
    getBatchQuotes,
    getDataSource
  };
})();

if (typeof window !== 'undefined') {
  window.QSMarketData = QSMarketData;
}

