// QuantSage Configuration
// All API keys must be configured through Settings — never hardcoded here

const QUANTSAGE_CONFIG = {
  version: '1.0.0',
  name: 'QuantSage',

  // API Configuration
  api: {
    providers: {
      indianAPI: {
        name: 'Indian Stock Market API',
        baseUrl: 'https://military-jobye-haiqstudios-14f59639.koyeb.app',
        rateLimit: { requests: 30, windowMs: 60000 }
      },
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
    cacheTTL: 60000, // 60 seconds in ms
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
      },
      ADANIPOWER: {
        symbol: 'ADANIPOWER', name: 'Adani Power Ltd',
        price: 548.25, change: 12.40, changePercent: 2.31, volume: 9823456,
        high: 556.00, low: 534.80, open: 538.00, prevClose: 535.85,
        week52High: 871.00, week52Low: 429.90, marketCap: 2115000000000,
        pe: 8.2, eps: 66.86, roe: 22.4, debtEquity: 1.82,
        sector: 'Energy', exchange: 'NSE', currency: 'INR',
        prices: [490, 505, 518, 510, 525, 530, 522, 535, 542, 538, 545, 540, 548, 544, 548]
      },
      ADANIENT: {
        symbol: 'ADANIENT', name: 'Adani Enterprises Ltd',
        price: 2418.50, change: -32.60, changePercent: -1.33, volume: 1234567,
        high: 2465.00, low: 2405.00, open: 2451.10, prevClose: 2451.10,
        week52High: 3743.90, week52Low: 2025.75, marketCap: 2756000000000,
        pe: 95.3, eps: 25.38, roe: 5.1, debtEquity: 2.65,
        sector: 'Diversified', exchange: 'NSE', currency: 'INR',
        prices: [2180, 2210, 2250, 2230, 2280, 2310, 2295, 2330, 2370, 2350, 2390, 2375, 2420, 2410, 2419]
      },
      ADANIPORTS: {
        symbol: 'ADANIPORTS', name: 'Adani Ports & SEZ Ltd',
        price: 1347.80, change: 18.50, changePercent: 1.39, volume: 2345678,
        high: 1358.00, low: 1325.00, open: 1330.00, prevClose: 1329.30,
        week52High: 1621.40, week52Low: 1064.00, marketCap: 2905000000000,
        pe: 34.2, eps: 39.41, roe: 13.8, debtEquity: 1.05,
        sector: 'Infrastructure', exchange: 'NSE', currency: 'INR',
        prices: [1210, 1230, 1255, 1240, 1270, 1290, 1280, 1300, 1315, 1308, 1325, 1318, 1340, 1335, 1348]
      },
      WIPRO: {
        symbol: 'WIPRO', name: 'Wipro Ltd',
        price: 462.30, change: 5.75, changePercent: 1.26, volume: 7654321,
        high: 468.50, low: 455.20, open: 456.55, prevClose: 456.55,
        week52High: 571.00, week52Low: 408.05, marketCap: 2404000000000,
        pe: 22.4, eps: 20.64, roe: 16.5, debtEquity: 0.18,
        sector: 'Information Technology', exchange: 'NSE', currency: 'INR',
        prices: [420, 428, 435, 430, 440, 448, 444, 452, 458, 454, 460, 457, 464, 461, 462]
      },
      SBIN: {
        symbol: 'SBIN', name: 'State Bank of India',
        price: 782.45, change: -8.30, changePercent: -1.05, volume: 18765432,
        high: 795.00, low: 778.00, open: 790.75, prevClose: 790.75,
        week52High: 912.00, week52Low: 600.65, marketCap: 6982000000000,
        pe: 11.2, eps: 69.86, roe: 17.3, debtEquity: 13.8,
        sector: 'Banking', exchange: 'NSE', currency: 'INR',
        prices: [710, 725, 738, 730, 748, 758, 752, 765, 774, 768, 778, 774, 785, 782, 782]
      },
      BAJFINANCE: {
        symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd',
        price: 7124.60, change: 85.40, changePercent: 1.21, volume: 1876543,
        high: 7180.00, low: 7030.00, open: 7045.00, prevClose: 7039.20,
        week52High: 8192.00, week52Low: 6188.00, marketCap: 4315000000000,
        pe: 33.8, eps: 210.79, roe: 22.6, debtEquity: 3.87,
        sector: 'Financial Services', exchange: 'NSE', currency: 'INR',
        prices: [6500, 6580, 6650, 6620, 6700, 6770, 6740, 6820, 6880, 6850, 6930, 6980, 7050, 7040, 7125]
      },
      'BAJAJ-AUTO': {
        symbol: 'BAJAJ-AUTO', name: 'Bajaj Auto Ltd',
        price: 8732.15, change: 112.30, changePercent: 1.30, volume: 456789,
        high: 8790.00, low: 8610.00, open: 8625.00, prevClose: 8619.85,
        week52High: 12774.00, week52Low: 7049.05, marketCap: 2449000000000,
        pe: 29.4, eps: 297.01, roe: 24.9, debtEquity: 0.03,
        sector: 'Automobile', exchange: 'NSE', currency: 'INR',
        prices: [7900, 8020, 8150, 8080, 8220, 8340, 8280, 8420, 8520, 8480, 8580, 8640, 8710, 8700, 8732]
      },
      TATAMOTORS: {
        symbol: 'TATAMOTORS', name: 'Tata Motors Ltd',
        price: 724.80, change: -9.50, changePercent: -1.29, volume: 12345678,
        high: 740.00, low: 720.00, open: 734.30, prevClose: 734.30,
        week52High: 1179.00, week52Low: 665.05, marketCap: 2673000000000,
        pe: 8.1, eps: 89.48, roe: 38.4, debtEquity: 1.52,
        sector: 'Automobile', exchange: 'NSE', currency: 'INR',
        prices: [660, 675, 688, 680, 695, 705, 698, 710, 718, 713, 722, 718, 728, 724, 725]
      },
      TATASTEEL: {
        symbol: 'TATASTEEL', name: 'Tata Steel Ltd',
        price: 142.35, change: 2.10, changePercent: 1.50, volume: 34567890,
        high: 144.50, low: 139.80, open: 140.25, prevClose: 140.25,
        week52High: 184.60, week52Low: 124.25, marketCap: 1783000000000,
        pe: 14.2, eps: 10.02, roe: 8.6, debtEquity: 1.14,
        sector: 'Metals & Mining', exchange: 'NSE', currency: 'INR',
        prices: [128, 130, 133, 131, 135, 137, 136, 139, 141, 140, 142, 141, 143, 142, 142]
      },
      SUNPHARMA: {
        symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries',
        price: 1678.90, change: 22.40, changePercent: 1.35, volume: 3456789,
        high: 1695.00, low: 1655.00, open: 1658.00, prevClose: 1656.50,
        week52High: 1960.75, week52Low: 1275.00, marketCap: 4027000000000,
        pe: 38.6, eps: 43.49, roe: 18.7, debtEquity: 0.09,
        sector: 'Pharmaceuticals', exchange: 'NSE', currency: 'INR',
        prices: [1520, 1545, 1570, 1555, 1590, 1610, 1600, 1625, 1645, 1638, 1658, 1650, 1672, 1668, 1679]
      },
      LT: {
        symbol: 'LT', name: 'Larsen & Toubro Ltd',
        price: 3542.70, change: 38.90, changePercent: 1.11, volume: 1234567,
        high: 3565.00, low: 3498.00, open: 3505.00, prevClose: 3503.80,
        week52High: 3963.00, week52Low: 2842.85, marketCap: 4860000000000,
        pe: 35.2, eps: 100.65, roe: 14.6, debtEquity: 1.84,
        sector: 'Infrastructure & Engineering', exchange: 'NSE', currency: 'INR',
        prices: [3200, 3250, 3290, 3270, 3320, 3360, 3340, 3390, 3420, 3405, 3450, 3480, 3520, 3510, 3543]
      },
      MARUTI: {
        symbol: 'MARUTI', name: 'Maruti Suzuki India Ltd',
        price: 11845.30, change: 145.60, changePercent: 1.24, volume: 456789,
        high: 11920.00, low: 11680.00, open: 11705.00, prevClose: 11699.70,
        week52High: 13680.00, week52Low: 9884.10, marketCap: 3586000000000,
        pe: 28.1, eps: 421.54, roe: 16.8, debtEquity: 0.02,
        sector: 'Automobile', exchange: 'NSE', currency: 'INR',
        prices: [10700, 10850, 10980, 10900, 11100, 11230, 11180, 11350, 11480, 11420, 11580, 11680, 11780, 11750, 11845]
      },
      HCLTECH: {
        symbol: 'HCLTECH', name: 'HCL Technologies Ltd',
        price: 1612.45, change: -18.30, changePercent: -1.12, volume: 2345678,
        high: 1638.00, low: 1604.00, open: 1630.75, prevClose: 1630.75,
        week52High: 1906.75, week52Low: 1235.00, marketCap: 4376000000000,
        pe: 29.3, eps: 55.03, roe: 24.5, debtEquity: 0.08,
        sector: 'Information Technology', exchange: 'NSE', currency: 'INR',
        prices: [1460, 1485, 1510, 1495, 1530, 1552, 1540, 1568, 1585, 1578, 1598, 1590, 1610, 1605, 1612]
      },
      AXISBANK: {
        symbol: 'AXISBANK', name: 'Axis Bank Ltd',
        price: 1089.75, change: 14.25, changePercent: 1.32, volume: 7654321,
        high: 1098.00, low: 1073.00, open: 1076.00, prevClose: 1075.50,
        week52High: 1340.00, week52Low: 994.55, marketCap: 3363000000000,
        pe: 13.8, eps: 78.97, roe: 17.2, debtEquity: 7.89,
        sector: 'Banking', exchange: 'NSE', currency: 'INR',
        prices: [990, 1005, 1020, 1012, 1030, 1042, 1036, 1052, 1062, 1056, 1072, 1078, 1085, 1082, 1090]
      },
      ICICIBANK: {
        symbol: 'ICICIBANK', name: 'ICICI Bank Ltd',
        price: 1234.60, change: 16.80, changePercent: 1.38, volume: 9876543,
        high: 1245.00, low: 1215.00, open: 1218.00, prevClose: 1217.80,
        week52High: 1392.00, week52Low: 1023.00, marketCap: 8694000000000,
        pe: 18.6, eps: 66.38, roe: 17.8, debtEquity: 6.42,
        sector: 'Banking', exchange: 'NSE', currency: 'INR',
        prices: [1120, 1140, 1158, 1148, 1168, 1182, 1175, 1192, 1205, 1198, 1215, 1222, 1230, 1228, 1235]
      },
      KOTAKBANK: {
        symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank Ltd',
        price: 1845.20, change: -12.40, changePercent: -0.67, volume: 3456789,
        high: 1862.00, low: 1838.00, open: 1857.60, prevClose: 1857.60,
        week52High: 2108.00, week52Low: 1544.15, marketCap: 3673000000000,
        pe: 20.4, eps: 90.45, roe: 14.2, debtEquity: 5.89,
        sector: 'Banking', exchange: 'NSE', currency: 'INR',
        prices: [1680, 1705, 1725, 1712, 1738, 1755, 1745, 1768, 1785, 1778, 1798, 1810, 1838, 1832, 1845]
      },
      BHARTIARTL: {
        symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd',
        price: 1672.35, change: 24.50, changePercent: 1.49, volume: 4567890,
        high: 1685.00, low: 1645.00, open: 1650.00, prevClose: 1647.85,
        week52High: 1779.00, week52Low: 1128.30, marketCap: 9899000000000,
        pe: 76.8, eps: 21.77, roe: 11.5, debtEquity: 2.38,
        sector: 'Telecom', exchange: 'NSE', currency: 'INR',
        prices: [1520, 1545, 1570, 1558, 1590, 1612, 1602, 1628, 1645, 1638, 1655, 1660, 1668, 1665, 1672]
      },
      ASIANPAINT: {
        symbol: 'ASIANPAINT', name: 'Asian Paints Ltd',
        price: 2285.40, change: -28.60, changePercent: -1.24, volume: 1234567,
        high: 2320.00, low: 2278.00, open: 2314.00, prevClose: 2314.00,
        week52High: 3395.00, week52Low: 2172.70, marketCap: 2191000000000,
        pe: 48.6, eps: 47.02, roe: 26.4, debtEquity: 0.11,
        sector: 'Consumer Goods', exchange: 'NSE', currency: 'INR',
        prices: [2080, 2110, 2145, 2125, 2165, 2195, 2180, 2215, 2245, 2235, 2260, 2268, 2295, 2288, 2285]
      },
      ULTRACEMCO: {
        symbol: 'ULTRACEMCO', name: 'UltraTech Cement Ltd',
        price: 10842.50, change: 132.80, changePercent: 1.24, volume: 234567,
        high: 10890.00, low: 10690.00, open: 10715.00, prevClose: 10709.70,
        week52High: 12157.00, week52Low: 9050.00, marketCap: 3134000000000,
        pe: 40.2, eps: 269.72, roe: 14.8, debtEquity: 0.31,
        sector: 'Cement', exchange: 'NSE', currency: 'INR',
        prices: [9800, 9950, 10080, 9990, 10150, 10280, 10220, 10380, 10480, 10450, 10580, 10650, 10780, 10755, 10843]
      },
      TITAN: {
        symbol: 'TITAN', name: 'Titan Company Ltd',
        price: 3248.75, change: 42.30, changePercent: 1.32, volume: 1456789,
        high: 3272.00, low: 3202.00, open: 3208.00, prevClose: 3206.45,
        week52High: 3886.00, week52Low: 2921.00, marketCap: 2890000000000,
        pe: 88.4, eps: 36.75, roe: 28.6, debtEquity: 0.14,
        sector: 'Consumer Goods', exchange: 'NSE', currency: 'INR',
        prices: [2950, 2990, 3030, 3010, 3060, 3090, 3075, 3110, 3140, 3128, 3160, 3185, 3225, 3215, 3249]
      },
      NESTLEIND: {
        symbol: 'NESTLEIND', name: 'Nestle India Ltd',
        price: 2245.60, change: -18.40, changePercent: -0.81, volume: 345678,
        high: 2270.00, low: 2238.00, open: 2264.00, prevClose: 2264.00,
        week52High: 2778.00, week52Low: 2188.85, marketCap: 2165000000000,
        pe: 72.4, eps: 31.02, roe: 109.8, debtEquity: 0.22,
        sector: 'FMCG', exchange: 'NSE', currency: 'INR',
        prices: [2060, 2080, 2100, 2090, 2115, 2132, 2125, 2148, 2165, 2158, 2178, 2195, 2230, 2242, 2246]
      },
      POWERGRID: {
        symbol: 'POWERGRID', name: 'Power Grid Corporation of India',
        price: 328.45, change: 4.20, changePercent: 1.30, volume: 12345678,
        high: 331.00, low: 322.00, open: 324.25, prevClose: 324.25,
        week52High: 366.25, week52Low: 231.00, marketCap: 3059000000000,
        pe: 17.8, eps: 18.45, roe: 19.4, debtEquity: 1.82,
        sector: 'Power & Utilities', exchange: 'NSE', currency: 'INR',
        prices: [298, 303, 308, 305, 311, 315, 313, 318, 322, 320, 325, 323, 327, 326, 328]
      },
      NTPC: {
        symbol: 'NTPC', name: 'NTPC Ltd',
        price: 362.80, change: 5.60, changePercent: 1.57, volume: 15678901,
        high: 366.00, low: 355.50, open: 357.20, prevClose: 357.20,
        week52High: 448.45, week52Low: 256.55, marketCap: 3513000000000,
        pe: 19.2, eps: 18.90, roe: 12.5, debtEquity: 1.64,
        sector: 'Power & Utilities', exchange: 'NSE', currency: 'INR',
        prices: [328, 334, 340, 337, 344, 348, 346, 351, 356, 354, 358, 357, 361, 360, 363]
      },
      ONGC: {
        symbol: 'ONGC', name: 'Oil & Natural Gas Corporation',
        price: 268.35, change: 3.45, changePercent: 1.30, volume: 23456789,
        high: 271.00, low: 263.50, open: 264.90, prevClose: 264.90,
        week52High: 345.00, week52Low: 202.75, marketCap: 3372000000000,
        pe: 8.4, eps: 31.94, roe: 14.8, debtEquity: 0.24,
        sector: 'Oil & Gas', exchange: 'NSE', currency: 'INR',
        prices: [244, 248, 252, 250, 255, 258, 256, 260, 263, 262, 265, 264, 267, 266, 268]
      },
      COALINDIA: {
        symbol: 'COALINDIA', name: 'Coal India Ltd',
        price: 412.60, change: 6.80, changePercent: 1.68, volume: 8765432,
        high: 416.00, low: 404.50, open: 405.80, prevClose: 405.80,
        week52High: 541.00, week52Low: 354.35, marketCap: 2548000000000,
        pe: 8.9, eps: 46.36, roe: 51.2, debtEquity: 0.08,
        sector: 'Mining', exchange: 'NSE', currency: 'INR',
        prices: [375, 381, 387, 384, 391, 395, 393, 399, 404, 402, 407, 406, 410, 409, 413]
      },
      JSWSTEEL: {
        symbol: 'JSWSTEEL', name: 'JSW Steel Ltd',
        price: 945.70, change: 12.80, changePercent: 1.37, volume: 4567890,
        high: 952.00, low: 930.00, open: 933.00, prevClose: 932.90,
        week52High: 1063.00, week52Low: 756.35, marketCap: 2309000000000,
        pe: 18.6, eps: 50.84, roe: 14.2, debtEquity: 1.05,
        sector: 'Metals & Steel', exchange: 'NSE', currency: 'INR',
        prices: [858, 872, 886, 878, 895, 906, 900, 915, 925, 920, 932, 936, 942, 939, 946]
      },
      TECHM: {
        symbol: 'TECHM', name: 'Tech Mahindra Ltd',
        price: 1548.30, change: -14.20, changePercent: -0.91, volume: 2345678,
        high: 1568.00, low: 1540.00, open: 1562.50, prevClose: 1562.50,
        week52High: 1807.00, week52Low: 1087.30, marketCap: 1499000000000,
        pe: 35.8, eps: 43.25, roe: 8.4, debtEquity: 0.18,
        sector: 'Information Technology', exchange: 'NSE', currency: 'INR',
        prices: [1404, 1425, 1448, 1435, 1462, 1480, 1470, 1492, 1508, 1500, 1520, 1528, 1548, 1542, 1548]
      },
      HINDALCO: {
        symbol: 'HINDALCO', name: 'Hindalco Industries Ltd',
        price: 678.45, change: 9.20, changePercent: 1.37, volume: 5678901,
        high: 684.00, low: 667.00, open: 669.25, prevClose: 669.25,
        week52High: 772.65, week52Low: 509.50, marketCap: 1526000000000,
        pe: 12.8, eps: 53.00, roe: 10.2, debtEquity: 0.74,
        sector: 'Metals & Mining', exchange: 'NSE', currency: 'INR',
        prices: [618, 628, 638, 633, 645, 652, 648, 658, 665, 662, 670, 668, 675, 672, 678]
      },
      DRREDDY: {
        symbol: 'DRREDDY', name: "Dr. Reddy's Laboratories",
        price: 1245.80, change: -8.40, changePercent: -0.67, volume: 876543,
        high: 1258.00, low: 1238.00, open: 1254.20, prevClose: 1254.20,
        week52High: 1424.95, week52Low: 1108.35, marketCap: 2075000000000,
        pe: 19.8, eps: 62.92, roe: 18.6, debtEquity: 0.12,
        sector: 'Pharmaceuticals', exchange: 'NSE', currency: 'INR',
        prices: [1130, 1148, 1165, 1155, 1178, 1192, 1185, 1202, 1215, 1210, 1228, 1235, 1248, 1244, 1246]
      },
      CIPLA: {
        symbol: 'CIPLA', name: 'Cipla Ltd',
        price: 1485.20, change: 18.60, changePercent: 1.27, volume: 1234567,
        high: 1498.00, low: 1464.00, open: 1467.00, prevClose: 1466.60,
        week52High: 1702.00, week52Low: 1197.20, marketCap: 1198000000000,
        pe: 29.4, eps: 50.52, roe: 15.8, debtEquity: 0.08,
        sector: 'Pharmaceuticals', exchange: 'NSE', currency: 'INR',
        prices: [1348, 1368, 1388, 1376, 1398, 1412, 1405, 1422, 1438, 1432, 1450, 1460, 1478, 1472, 1485]
      },
      DIVISLAB: {
        symbol: 'DIVISLAB', name: "Divi's Laboratories",
        price: 4892.30, change: 58.40, changePercent: 1.21, volume: 345678,
        high: 4925.00, low: 4830.00, open: 4838.00, prevClose: 4833.90,
        week52High: 5237.50, week52Low: 3350.05, marketCap: 1298000000000,
        pe: 56.2, eps: 87.05, roe: 16.4, debtEquity: 0.02,
        sector: 'Pharmaceuticals', exchange: 'NSE', currency: 'INR',
        prices: [4440, 4498, 4558, 4520, 4590, 4640, 4618, 4680, 4720, 4705, 4760, 4795, 4850, 4838, 4892]
      },
      HEROMOTOCO: {
        symbol: 'HEROMOTOCO', name: 'Hero MotoCorp Ltd',
        price: 4728.50, change: 62.30, changePercent: 1.34, volume: 567890,
        high: 4758.00, low: 4660.00, open: 4670.00, prevClose: 4666.20,
        week52High: 6246.40, week52Low: 3960.00, marketCap: 944800000000,
        pe: 22.8, eps: 207.39, roe: 28.4, debtEquity: 0.04,
        sector: 'Automobile', exchange: 'NSE', currency: 'INR',
        prices: [4298, 4358, 4412, 4380, 4440, 4488, 4468, 4520, 4560, 4545, 4590, 4625, 4695, 4680, 4729]
      },
      EICHERMOTOR: {
        symbol: 'EICHERMOTOR', name: 'Eicher Motors Ltd',
        price: 4852.40, change: 72.60, changePercent: 1.52, volume: 456789,
        high: 4880.00, low: 4776.00, open: 4782.00, prevClose: 4779.80,
        week52High: 5272.65, week52Low: 3659.00, marketCap: 1327000000000,
        pe: 32.6, eps: 148.85, roe: 26.2, debtEquity: 0.02,
        sector: 'Automobile', exchange: 'NSE', currency: 'INR',
        prices: [4408, 4468, 4520, 4492, 4556, 4598, 4578, 4630, 4670, 4655, 4710, 4748, 4808, 4795, 4852]
      },
      APOLLOHOSP: {
        symbol: 'APOLLOHOSP', name: 'Apollo Hospitals Enterprise Ltd',
        price: 6845.70, change: -42.30, changePercent: -0.61, volume: 234567,
        high: 6898.00, low: 6818.00, open: 6888.00, prevClose: 6888.00,
        week52High: 7545.00, week52Low: 5160.20, marketCap: 982300000000,
        pe: 95.4, eps: 71.76, roe: 14.2, debtEquity: 0.82,
        sector: 'Healthcare', exchange: 'NSE', currency: 'INR',
        prices: [6220, 6310, 6395, 6350, 6440, 6510, 6480, 6560, 6620, 6600, 6672, 6720, 6810, 6790, 6846]
      },
      BPCL: {
        symbol: 'BPCL', name: 'Bharat Petroleum Corporation Ltd',
        price: 298.45, change: 4.80, changePercent: 1.63, volume: 18765432,
        high: 302.00, low: 292.50, open: 293.65, prevClose: 293.65,
        week52High: 376.00, week52Low: 248.40, marketCap: 1289000000000,
        pe: 7.8, eps: 38.27, roe: 22.6, debtEquity: 0.89,
        sector: 'Oil & Gas', exchange: 'NSE', currency: 'INR',
        prices: [272, 276, 280, 278, 283, 286, 284, 288, 292, 290, 294, 293, 297, 296, 298]
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
