// QuantSage Configuration
// All API keys must be configured through Settings — never hardcoded here

const QUANTSAGE_CONFIG = {
  version: '1.0.0',
  name: 'QuantSage',

  // API Configuration
  api: {
    providers: {
      alphaVantage: {
        name: 'Alpha Vantage',
        baseUrl: 'https://www.alphavantage.co/query',
        keyParam: 'apikey',
        rateLimit: { requests: 5, windowMs: 60000 },
        docUrl: 'https://www.alphavantage.co/support/#api-key'
      },
      yahooFinance: {
        name: 'Yahoo Finance',
        baseUrl: 'https://query1.finance.yahoo.com/v8/finance/chart',
        rateLimit: { requests: 10, windowMs: 60000 }
      },
      finnhub: {
        name: 'Finnhub',
        baseUrl: 'https://finnhub.io/api/v1',
        keyParam: 'token',
        rateLimit: { requests: 30, windowMs: 60000 },
        docUrl: 'https://finnhub.io/register'
      }
    },
    defaultProvider: 'alphaVantage',
    cacheTTL: 300000, // 5 minutes in ms
    requestTimeout: 10000
  },

  // Default Settings
  defaults: {
    theme: 'dark',
    refreshInterval: 300000, // 5 minutes
    defaultMarket: 'IN',
    maxChatHistory: 100,
    maxWatchlist: 20,
    demoMode: true,
    notifications: true,
    soundAlerts: false
  },

  // Demo mode flag — true means use mock data, no API calls needed
  demoMode: true,

  // QuantSage AI Personality
  systemPrompt: `You are QuantSage, a professional-grade AI financial analyst specialising in Indian and global stock markets. You provide data-driven, risk-aware trade analysis. Always include stop-loss levels. Never recommend trades without proper risk management. Be precise, professional, and evidence-based.`,

  // Mock / Demo Data
  mockData: {
    stocks: {
      RELIANCE: {
        symbol: 'RELIANCE',
        name: 'Reliance Industries Ltd',
        price: 2847.35,
        change: 42.15,
        changePercent: 1.50,
        volume: 8234567,
        high: 2865.00,
        low: 2812.50,
        open: 2818.00,
        prevClose: 2805.20,
        week52High: 3024.90,
        week52Low: 2220.30,
        marketCap: 1924890000000,
        pe: 28.4,
        eps: 100.25,
        roe: 9.8,
        debtEquity: 0.34,
        sector: 'Energy & Conglomerates',
        exchange: 'NSE',
        currency: 'INR',
        prices: [2650, 2680, 2710, 2695, 2730, 2755, 2740, 2780, 2800, 2815, 2790, 2820, 2835, 2810, 2847]
      },
      TCS: {
        symbol: 'TCS',
        name: 'Tata Consultancy Services',
        price: 4123.80,
        change: -28.60,
        changePercent: -0.69,
        volume: 3456789,
        high: 4165.00,
        low: 4105.50,
        open: 4152.40,
        prevClose: 4152.40,
        week52High: 4592.25,
        week52Low: 3311.00,
        marketCap: 1508760000000,
        pe: 32.1,
        eps: 128.45,
        roe: 47.5,
        debtEquity: 0.08,
        sector: 'Information Technology',
        exchange: 'NSE',
        currency: 'INR',
        prices: [3980, 4010, 4050, 4020, 4075, 4100, 4080, 4120, 4145, 4130, 4160, 4140, 4180, 4155, 4124]
      },
      INFY: {
        symbol: 'INFY',
        name: 'Infosys Limited',
        price: 1876.45,
        change: 15.30,
        changePercent: 0.82,
        volume: 5678901,
        high: 1892.00,
        low: 1858.20,
        open: 1861.15,
        prevClose: 1861.15,
        week52High: 2039.50,
        week52Low: 1358.35,
        marketCap: 780430000000,
        pe: 26.8,
        eps: 70.01,
        roe: 31.2,
        debtEquity: 0.05,
        sector: 'Information Technology',
        exchange: 'NSE',
        currency: 'INR',
        prices: [1720, 1745, 1770, 1755, 1790, 1815, 1800, 1835, 1850, 1842, 1860, 1848, 1870, 1862, 1876]
      },
      HDFCBANK: {
        symbol: 'HDFCBANK',
        name: 'HDFC Bank Limited',
        price: 1698.20,
        change: 22.40,
        changePercent: 1.34,
        volume: 6789012,
        high: 1715.00,
        low: 1678.50,
        open: 1675.80,
        prevClose: 1675.80,
        week52High: 1880.00,
        week52Low: 1363.55,
        marketCap: 1290560000000,
        pe: 19.2,
        eps: 88.45,
        roe: 16.8,
        debtEquity: 6.5,
        sector: 'Banking & Financial Services',
        exchange: 'NSE',
        currency: 'INR',
        prices: [1580, 1605, 1625, 1610, 1640, 1658, 1645, 1668, 1675, 1660, 1680, 1672, 1690, 1685, 1698]
      },
      ITC: {
        symbol: 'ITC',
        name: 'ITC Limited',
        price: 464.75,
        change: -3.25,
        changePercent: -0.70,
        volume: 12345678,
        high: 472.00,
        low: 462.50,
        open: 468.00,
        prevClose: 468.00,
        week52High: 529.70,
        week52Low: 391.50,
        marketCap: 580340000000,
        pe: 27.3,
        eps: 17.02,
        roe: 29.4,
        debtEquity: 0.01,
        sector: 'FMCG',
        exchange: 'NSE',
        currency: 'INR',
        prices: [430, 440, 448, 445, 455, 462, 458, 468, 472, 466, 470, 463, 468, 468, 465]
      },
      AAPL: {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        price: 189.30,
        change: 2.15,
        changePercent: 1.15,
        volume: 45678901,
        high: 191.50,
        low: 187.20,
        open: 187.55,
        prevClose: 187.15,
        week52High: 199.62,
        week52Low: 164.08,
        marketCap: 2940000000000,
        pe: 31.2,
        eps: 6.07,
        roe: 160.1,
        debtEquity: 1.87,
        sector: 'Technology',
        exchange: 'NASDAQ',
        currency: 'USD',
        prices: [175, 178, 181, 179, 183, 185, 184, 187, 188, 186, 189, 187, 190, 188, 189]
      },
      MSFT: {
        symbol: 'MSFT',
        name: 'Microsoft Corporation',
        price: 415.50,
        change: -1.80,
        changePercent: -0.43,
        volume: 23456789,
        high: 420.00,
        low: 413.50,
        open: 417.30,
        prevClose: 417.30,
        week52High: 430.82,
        week52Low: 309.45,
        marketCap: 3090000000000,
        pe: 36.8,
        eps: 11.29,
        roe: 39.2,
        debtEquity: 0.35,
        sector: 'Technology',
        exchange: 'NASDAQ',
        currency: 'USD',
        prices: [385, 390, 395, 392, 398, 403, 400, 407, 410, 408, 413, 411, 417, 416, 416]
      },
      GOOGL: {
        symbol: 'GOOGL',
        name: 'Alphabet Inc.',
        price: 175.85,
        change: 3.45,
        changePercent: 2.00,
        volume: 34567890,
        high: 177.00,
        low: 172.50,
        open: 172.40,
        prevClose: 172.40,
        week52High: 191.75,
        week52Low: 120.21,
        marketCap: 2180000000000,
        pe: 27.4,
        eps: 6.42,
        roe: 29.8,
        debtEquity: 0.06,
        sector: 'Technology',
        exchange: 'NASDAQ',
        currency: 'USD',
        prices: [155, 158, 162, 160, 164, 167, 165, 169, 171, 170, 173, 172, 174, 172, 176]
      },
      AMZN: {
        symbol: 'AMZN',
        name: 'Amazon.com Inc.',
        price: 198.45,
        change: 4.20,
        changePercent: 2.16,
        volume: 56789012,
        high: 200.00,
        low: 194.80,
        open: 194.25,
        prevClose: 194.25,
        week52High: 201.20,
        week52Low: 118.35,
        marketCap: 2080000000000,
        pe: 62.5,
        eps: 3.17,
        roe: 24.3,
        debtEquity: 0.61,
        sector: 'Consumer Discretionary / Technology',
        exchange: 'NASDAQ',
        currency: 'USD',
        prices: [170, 175, 178, 176, 180, 183, 181, 185, 188, 187, 190, 192, 195, 194, 198]
      }
    },

    indices: {
      'NIFTY50': { name: 'Nifty 50', value: 22150.20, change: 185.40, changePercent: 0.84 },
      'BANKNIFTY': { name: 'Bank Nifty', value: 47823.55, change: -124.30, changePercent: -0.26 },
      'SENSEX': { name: 'Sensex', value: 73128.77, change: 612.45, changePercent: 0.84 },
      'SPX': { name: 'S&P 500', value: 5217.49, change: 28.35, changePercent: 0.55 },
      'NDX': { name: 'NASDAQ', value: 18339.44, change: 142.80, changePercent: 0.79 },
      'DJI': { name: 'Dow Jones', value: 39170.24, change: 96.50, changePercent: 0.25 }
    },

    commodities: {
      GOLD: { name: 'Gold', price: 2345.60, change: 12.30, changePercent: 0.53, unit: 'USD/oz' },
      CRUDE: { name: 'Crude Oil (WTI)', price: 82.45, change: -0.85, changePercent: -1.02, unit: 'USD/bbl' },
      SILVER: { name: 'Silver', price: 27.85, change: 0.42, changePercent: 1.53, unit: 'USD/oz' }
    }
  }
};

// Make config available globally (content scripts share a namespace per page)
if (typeof window !== 'undefined') {
  window.QUANTSAGE_CONFIG = QUANTSAGE_CONFIG;
}
