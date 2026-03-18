// QuantSage - Chat Panel Logic (components/chatPanel.js)

const QSChatPanel = (() => {

  const WELCOME_MESSAGE = `👋 Welcome to **QuantSage** — your AI financial analyst!

I'm ready to help with professional stock analysis, trade recommendations, and portfolio management.

**Quick Commands:**
• \`/analyze TICKER\` — Full stock analysis with trade setup
• \`/page\` — Analyze the current webpage (Screener, Moneycontrol, etc.)
• \`/market\` — Market overview (Indices + Commodities)
• \`/watchlist\` — View your watchlist
• \`/watch TICKER\` — Add stock to watchlist
• \`/unwatch TICKER\` — Remove from watchlist
• \`/alert TICKER PRICE\` — Set price alert
• \`/help\` — Show all commands

Or just type naturally: _"How is TCS doing?"_ or _"Analyze Adani Power"_ 🚀`;

  const HELP_MESSAGE = `📖 **QuantSage Commands**

| Command | Description |
|---|---|
| \`/analyze TICKER\` | Full technical + fundamental analysis |
| \`/page\` | Analyze the current webpage |
| \`/market\` | Live market overview |
| \`/watchlist\` | View watchlist |
| \`/watch TICKER\` | Add to watchlist |
| \`/unwatch TICKER\` | Remove from watchlist |
| \`/alert TICKER PRICE\` | Set price alert |
| \`/help\` | This help message |

**Supported Markets:**
🇮🇳 RELIANCE, TCS, INFY, HDFCBANK, WIPRO, SBIN, ADANIPOWER, BAJFINANCE, TATAMOTORS, SUNPHARMA + 25 more NSE stocks
🇺🇸 AAPL, MSFT, GOOGL, AMZN + any US ticker

_Type any stock name or ticker for analysis!_`;

  // Detect ticker intent from natural language
  function detectTickerIntent(text) {
    const lower = text.toLowerCase().trim();

    // Known company → ticker map (expanded with 35+ Indian companies)
    const nameMap = {
      // Original Indian stocks
      'reliance': 'RELIANCE', 'reliance industries': 'RELIANCE',
      'tcs': 'TCS', 'tata consultancy': 'TCS', 'tata consultancy services': 'TCS',
      'infosys': 'INFY', 'infy': 'INFY',
      'hdfc bank': 'HDFCBANK', 'hdfc': 'HDFCBANK', 'hdfcbank': 'HDFCBANK',
      'itc': 'ITC',
      // Adani Group
      'adani power': 'ADANIPOWER', 'adanipower': 'ADANIPOWER',
      'adani enterprises': 'ADANIENT', 'adanient': 'ADANIENT',
      'adani ports': 'ADANIPORTS', 'adaniports': 'ADANIPORTS', 'adani ports sez': 'ADANIPORTS',
      // IT sector
      'wipro': 'WIPRO',
      'hcl': 'HCLTECH', 'hcl tech': 'HCLTECH', 'hcltech': 'HCLTECH', 'hcl technologies': 'HCLTECH',
      'tech mahindra': 'TECHM', 'techm': 'TECHM',
      // Banking & Finance
      'sbi': 'SBIN', 'state bank': 'SBIN', 'state bank of india': 'SBIN', 'sbin': 'SBIN',
      'bajaj finance': 'BAJFINANCE', 'bajfinance': 'BAJFINANCE',
      'axis bank': 'AXISBANK', 'axisbank': 'AXISBANK',
      'icici bank': 'ICICIBANK', 'icicibank': 'ICICIBANK', 'icici': 'ICICIBANK',
      'kotak': 'KOTAKBANK', 'kotak bank': 'KOTAKBANK', 'kotakbank': 'KOTAKBANK', 'kotak mahindra': 'KOTAKBANK',
      // Automobile
      'tata motors': 'TATAMOTORS', 'tatamotors': 'TATAMOTORS',
      'maruti': 'MARUTI', 'maruti suzuki': 'MARUTI',
      'bajaj auto': 'BAJAJ-AUTO', 'bajaj-auto': 'BAJAJ-AUTO',
      'hero motocorp': 'HEROMOTOCO', 'heromotoco': 'HEROMOTOCO', 'hero moto': 'HEROMOTOCO',
      'eicher': 'EICHERMOTOR', 'eicher motors': 'EICHERMOTOR', 'royal enfield': 'EICHERMOTOR',
      // Metals & Mining
      'tata steel': 'TATASTEEL', 'tatasteel': 'TATASTEEL',
      'jsw steel': 'JSWSTEEL', 'jswsteel': 'JSWSTEEL',
      'hindalco': 'HINDALCO', 'hindalco industries': 'HINDALCO',
      'coal india': 'COALINDIA', 'coalindia': 'COALINDIA',
      // Pharma
      'sun pharma': 'SUNPHARMA', 'sunpharma': 'SUNPHARMA', 'sun pharmaceutical': 'SUNPHARMA',
      'dr reddy': 'DRREDDY', 'drreddy': 'DRREDDY', "dr reddy's": 'DRREDDY',
      'cipla': 'CIPLA',
      "divi's": 'DIVISLAB', 'divislab': 'DIVISLAB', 'divis lab': 'DIVISLAB',
      // Infrastructure & Utilities
      'larsen': 'LT', 'larsen toubro': 'LT', 'l&t': 'LT', 'lt': 'LT',
      'power grid': 'POWERGRID', 'powergrid': 'POWERGRID',
      'ntpc': 'NTPC',
      'ongc': 'ONGC',
      'bpcl': 'BPCL', 'bharat petroleum': 'BPCL',
      // Telecom & Consumer
      'airtel': 'BHARTIARTL', 'bhartiartl': 'BHARTIARTL', 'bharti airtel': 'BHARTIARTL',
      'asian paints': 'ASIANPAINT', 'asianpaint': 'ASIANPAINT',
      'ultratech': 'ULTRACEMCO', 'ultratech cement': 'ULTRACEMCO', 'ultracemco': 'ULTRACEMCO',
      'titan': 'TITAN', 'titan company': 'TITAN',
      'nestle': 'NESTLEIND', 'nestleind': 'NESTLEIND', 'nestle india': 'NESTLEIND',
      'apollo': 'APOLLOHOSP', 'apollo hospitals': 'APOLLOHOSP', 'apollohosp': 'APOLLOHOSP',
      // US stocks
      'apple': 'AAPL', 'aapl': 'AAPL',
      'microsoft': 'MSFT', 'msft': 'MSFT',
      'google': 'GOOGL', 'alphabet': 'GOOGL', 'googl': 'GOOGL',
      'amazon': 'AMZN', 'amzn': 'AMZN'
    };

    // Check direct name match (longest match first to avoid partial matches)
    const sortedKeys = Object.keys(nameMap).sort((a, b) => b.length - a.length);
    for (const name of sortedKeys) {
      if (lower.includes(name)) return nameMap[name];
    }

    // Extract uppercase tickers (2-10 chars, letters and hyphens)
    const words = text.split(/\s+/);
    for (const word of words) {
      const cleaned = word.replace(/[^A-Za-z0-9-]/g, '');
      if (cleaned.length >= 2 && cleaned.length <= 10 && /^[A-Z][A-Z0-9-]+$/.test(cleaned.toUpperCase())) {
        return cleaned.toUpperCase();
      }
    }

    return null;
  }

  function isAnalysisIntent(text) {
    const keywords = ['analyze', 'analysis', 'analyse', 'how is', 'how about', 'tell me about',
      'what about', 'buy', 'sell', 'invest', 'should i', 'target', 'price', 'stock', 'trade'];
    const lower = text.toLowerCase();
    return keywords.some(k => lower.includes(k));
  }

  async function generateAnalysis(ticker) {
    const upperTicker = ticker.toUpperCase().trim();

    try {
      const [quote, history] = await Promise.all([
        QSMarketData.getQuote(upperTicker),
        QSMarketData.getHistoricalData(upperTicker)
      ]);

      if (!quote) return `❌ Could not find data for **${upperTicker}**. Please check the ticker symbol.`;

      const currency = quote.currency === 'INR' ? '₹' : '$';
      const sign = quote.changePercent >= 0 ? '▲' : '▼';
      const changeIcon = quote.changePercent >= 0 ? '📗' : '📕';

      // Generate technical analysis
      let technicalSummary = '';
      let tradeSetup = null;
      if (history && history.length >= 20) {
        technicalSummary = QSTechnical.generateTechnicalSummary(upperTicker, history);
        tradeSetup = QSTechnical.calculateTradeSetup(quote.price, history);
      }

      const riskColors = { Low: '🟢', Medium: '🟡', High: '🔴' };
      const risk = tradeSetup ? tradeSetup.riskRating : 'Medium';

      // Data source indicator
      const src = quote.dataSource || 'mock';
      const srcLabel = src === 'mock' || src === 'synthetic' ? '📊 Demo' : '🟢 Live';

      let msg = `📊 **${quote.name || upperTicker}** (${upperTicker}) ${srcLabel}\n`;
      msg += `${changeIcon} **${currency}${quote.price.toFixed(2)}** ${sign} ${Math.abs(quote.changePercent).toFixed(2)}%\n`;
      msg += `_Vol: ${QSStockCard.formatVolume(quote.volume || 0)} | Exchange: ${quote.exchange || 'NSE/BSE'}_\n\n`;

      if (tradeSetup) {
        msg += `---\n`;
        msg += `🎯 **Entry Range:** ${currency}${tradeSetup.entryLow} — ${currency}${tradeSetup.entryHigh}\n\n`;
        msg += `🎯 **Targets:**\n`;
        msg += `  • Target 1: ${currency}${tradeSetup.target1}\n`;
        msg += `  • Target 2: ${currency}${tradeSetup.target2}\n\n`;
        msg += `🛑 **Stop Loss:** ${currency}${tradeSetup.stopLoss}\n`;
        msg += `${riskColors[risk] || '🟡'} **Risk Rating:** ${risk}\n\n`;
      }

      msg += `---\n📈 **Technical Summary:**\n\n${technicalSummary}\n`;

      if (quote.pe || quote.roe || quote.debtEquity) {
        msg += `---\n💰 **Fundamental Summary:**\n`;
        if (quote.pe) msg += `  • P/E Ratio: **${quote.pe}**\n`;
        if (quote.eps) msg += `  • EPS: **${currency}${quote.eps}**\n`;
        if (quote.roe) msg += `  • ROE: **${quote.roe}%**\n`;
        if (quote.debtEquity !== undefined) msg += `  • Debt/Equity: **${quote.debtEquity}**\n`;
        if (quote.marketCap) msg += `  • Market Cap: **${QSStockCard.formatMarketCap(quote.marketCap)}**\n`;
        if (quote.sector) msg += `  • Sector: **${quote.sector}**\n`;
        msg += '\n';
      }

      msg += `---\n🔥 **Catalysts:**\n`;
      msg += `  • Monitor quarterly earnings releases\n`;
      msg += `  • Track FII/DII institutional flow data\n`;
      msg += `  • Watch sector-specific policy announcements\n\n`;

      msg += `❌ **Invalidation:**\n`;
      if (tradeSetup) {
        msg += `  • Trade is invalidated if price closes below ${currency}${tradeSetup.stopLoss} on daily timeframe\n`;
        msg += `  • Reassess if RSI drops below 30 or trend turns BEARISH\n`;
      }

      msg += `\n_⚠️ This is for educational purposes only. Not financial advice. Always do your own research._`;

      return msg;
    } catch (err) {
      return `❌ Analysis failed for **${ticker}**: ${err.message}\n\nPlease try again or check if the ticker symbol is correct.`;
    }
  }

  async function handlePageCommand() {
    // chatPanel.js runs inside content script context — scrape directly from DOM
    return scrapeCurrentPage();
  }

  async function scrapeCurrentPage() {
    // Scrape the current page directly (runs in content script context)
    const url = window.location.href;
    const title = document.title;

    // Auto-detect ticker from URL
    const ticker = detectTickerFromUrl(url);

    // Scrape visible text content
    const bodyText = document.body ? document.body.innerText : '';

    // Extract financial metrics using regex patterns
    const metrics = extractFinancialMetrics(bodyText);

    // Scrape tables
    const tables = scrapeFinancialTables();

    const pageData = { url, title, ticker, metrics, tables, bodyText: bodyText.slice(0, 3000) };
    return formatPageAnalysis(pageData);
  }

  function detectTickerFromUrl(url) {
    try {
      const u = new URL(url);
      const host = u.hostname.toLowerCase();
      const path = u.pathname.toLowerCase();

      // Helper: check if host matches exactly or is a subdomain
      const hostIs = (domain) => host === domain || host.endsWith('.' + domain);

      // screener.in/company/TCS/
      if (hostIs('screener.in')) {
        const m = path.match(/\/company\/([A-Z0-9-]+)/i);
        if (m) return m[1].toUpperCase();
      }
      // moneycontrol.com/india/stockpricequote/.../TCS
      if (hostIs('moneycontrol.com')) {
        const m = path.match(/stockpricequote\/[^/]+\/([A-Z0-9]+)/i);
        if (m) return m[1].toUpperCase();
      }
      // trendlyne.com/stocks/TCS/
      if (hostIs('trendlyne.com')) {
        const m = path.match(/\/stocks\/([A-Z0-9-]+)/i);
        if (m) return m[1].toUpperCase();
      }
      // finance.yahoo.com/quote/TCS.NS
      if (hostIs('yahoo.com')) {
        const m = path.match(/\/quote\/([A-Z0-9.]+)/i);
        if (m) return m[1].toUpperCase().replace(/\.(NS|BO)$/, '');
      }
      // tradingview.com/symbols/NSE-TCS/
      if (hostIs('tradingview.com')) {
        const m = path.match(/\/symbols\/[A-Z]+-([A-Z0-9]+)/i);
        if (m) return m[1].toUpperCase();
      }
      // groww.in/stocks/bajaj-auto
      if (hostIs('groww.in')) {
        const m = path.match(/\/stocks\/([a-z0-9-]+)/i);
        if (m) return m[1].toUpperCase(); // Keep hyphen, e.g. BAJAJ-AUTO
      }
      // tickertape.in/stocks/TCS-INE467B01029/
      if (hostIs('tickertape.in')) {
        const m = path.match(/\/stocks\/([A-Z0-9]+)-/i);
        if (m) return m[1].toUpperCase();
      }
      // nseindia.com
      if (hostIs('nseindia.com')) {
        const sym = u.searchParams.get('symbol');
        if (sym) return sym.toUpperCase();
      }
    } catch (e) { /* ignore */ }
    return null;
  }

  function extractFinancialMetrics(text) {
    const metrics = {};
    const patterns = [
      { key: 'pe', regex: /P\/E\s*(?:Ratio)?\s*[:\s]+([0-9]+\.?[0-9]*)/i },
      { key: 'eps', regex: /EPS\s*[:\s]+([0-9]+\.?[0-9]*)/i },
      { key: 'roe', regex: /ROE\s*[:\s]+([0-9]+\.?[0-9]*)%?/i },
      { key: 'roa', regex: /ROA\s*[:\s]+([0-9]+\.?[0-9]*)%?/i },
      { key: 'roce', regex: /ROCE\s*[:\s]+([0-9]+\.?[0-9]*)%?/i },
      { key: 'marketCap', regex: /Market\s*Cap\s*[:\s]+(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]+)?)\s*(?:Cr|Lakh)?/i },
      { key: 'debtEquity', regex: /Debt\s*[/to]*\s*Equity\s*[:\s]+([0-9]+\.?[0-9]*)/i },
      { key: 'netProfit', regex: /Net\s*Profit\s*[:\s]+(?:₹|Rs\.?)?\s*([0-9,]+(?:\.[0-9]+)?)/i },
      { key: 'revenue', regex: /(?:Revenue|Sales)\s*[:\s]+(?:₹|Rs\.?)?\s*([0-9,]+(?:\.[0-9]+)?)/i },
      { key: 'dividend', regex: /Dividend\s*Yield\s*[:\s]+([0-9]+\.?[0-9]*)%?/i },
      { key: 'bookValue', regex: /Book\s*Value\s*[:\s]+(?:₹|Rs\.?)?\s*([0-9]+\.?[0-9]*)/i },
      { key: 'promoterHolding', regex: /Promoter\s*(?:Holding)?\s*[:\s]+([0-9]+\.?[0-9]*)%?/i }
    ];
    for (const { key, regex } of patterns) {
      const match = text.match(regex);
      if (match) metrics[key] = match[1].replace(/,/g, '');
    }
    return metrics;
  }

  function scrapeFinancialTables() {
    const tables = [];
    const tableEls = document.querySelectorAll('table');
    let count = 0;
    for (const table of tableEls) {
      if (count >= 4) break;
      const rows = [];
      table.querySelectorAll('tr').forEach(tr => {
        const cells = Array.from(tr.querySelectorAll('th, td')).map(td => td.innerText.trim()).filter(Boolean);
        if (cells.length > 0) rows.push(cells);
      });
      if (rows.length > 1 && rows.length <= 30) {
        tables.push(rows);
        count++;
      }
    }
    return tables;
  }

  async function formatPageAnalysis(pageData) {
    const { url, title, ticker, metrics, tables } = pageData;

    let msg = `🔍 **Page Analysis**\n`;
    msg += `📄 _${title || 'Current Page'}_\n`;
    msg += `🔗 _${url ? url.slice(0, 80) : 'Unknown URL'}_\n\n`;

    if (ticker) {
      msg += `🏷️ **Detected Stock:** \`${ticker}\`\n\n`;
    }

    // Show extracted metrics
    if (metrics && Object.keys(metrics).length > 0) {
      msg += `---\n📊 **Extracted Financial Metrics:**\n`;
      const metricLabels = {
        pe: 'P/E Ratio', eps: 'EPS', roe: 'ROE', roa: 'ROA', roce: 'ROCE',
        marketCap: 'Market Cap', debtEquity: 'Debt/Equity', netProfit: 'Net Profit',
        revenue: 'Revenue', dividend: 'Dividend Yield', bookValue: 'Book Value',
        promoterHolding: 'Promoter Holding'
      };
      for (const [key, val] of Object.entries(metrics)) {
        if (val) msg += `  • ${metricLabels[key] || key}: **${val}**\n`;
      }
      msg += '\n';
    }

    // Show table data (first meaningful table)
    if (tables && tables.length > 0) {
      const t = tables[0];
      msg += `---\n📋 **Financial Data (from page table):**\n`;
      for (const row of t.slice(0, 8)) {
        msg += `  • ${row.join(' | ')}\n`;
      }
      msg += '\n';
    }

    // Fetch live quote if ticker detected
    if (ticker) {
      try {
        msg += `---\n`;
        const liveAnalysis = await generateAnalysis(ticker);
        msg += liveAnalysis;
      } catch (e) {
        msg += `⚠️ Could not fetch live data for ${ticker}: ${e.message}\n`;
      }
    } else {
      msg += `---\n💡 **Tip:** Open a stock page on Screener.in, Moneycontrol, Trendlyne, Yahoo Finance, or TradingView for auto-detected ticker analysis.\n`;
      msg += `Or type \`/analyze TICKER\` to analyze a specific stock.\n`;
    }

    return msg;
  }

  async function processCommand(text) {
    const trimmed = text.trim();
    const lower = trimmed.toLowerCase();

    // --- Slash Commands ---
    if (trimmed.startsWith('/')) {
      const parts = trimmed.slice(1).split(/\s+/);
      const cmd = parts[0].toLowerCase();
      const args = parts.slice(1);

      switch (cmd) {
        case 'analyze':
        case 'a': {
          const ticker = args[0];
          if (!ticker) return '❌ Please provide a ticker. Usage: `/analyze TICKER`\nExample: `/analyze RELIANCE`';
          return generateAnalysis(ticker);
        }

        case 'page':
        case 'pg':
          return handlePageCommand();

        case 'watchlist':
        case 'wl':
          return QSWatchlist.renderWatchlistChat();

        case 'watch':
        case 'w': {
          const ticker = args[0];
          if (!ticker) return '❌ Please provide a ticker. Usage: `/watch TICKER`';
          const result = await QSStorage.addToWatchlist(ticker);
          return result.success ? `✅ ${result.message}` : `❌ ${result.message}`;
        }

        case 'unwatch':
        case 'uw': {
          const ticker = args[0];
          if (!ticker) return '❌ Please provide a ticker. Usage: `/unwatch TICKER`';
          const result = await QSStorage.removeFromWatchlist(ticker);
          return result.success ? `✅ ${result.message}` : `❌ ${result.message}`;
        }

        case 'market':
        case 'm':
          return QSMarketOverview.renderOverviewChat();

        case 'alert': {
          const ticker = args[0];
          const price = args[1];
          if (!ticker || !price) return '❌ Usage: `/alert TICKER PRICE`\nExample: `/alert TCS 4500`';
          const numPrice = parseFloat(price);
          const quote = await QSMarketData.getQuote(ticker.toUpperCase());
          const direction = quote && numPrice > quote.price ? 'above' : 'below';
          const result = await QSStorage.addAlert(ticker, price, direction);
          return result.success ? `🔔 ${result.message}` : `❌ ${result.message}`;
        }

        case 'help':
        case 'h':
          return HELP_MESSAGE;

        case 'clear':
          await QSStorage.clearChatHistory();
          return '🗑️ Chat history cleared.';

        default:
          return `❓ Unknown command: \`/${cmd}\`\n\nType \`/help\` to see all available commands.`;
      }
    }

    // --- Natural Language Processing ---
    const detectedTicker = detectTickerIntent(trimmed);

    if (detectedTicker && isAnalysisIntent(trimmed)) {
      return generateAnalysis(detectedTicker);
    }

    if (detectedTicker) {
      // Ask if they want analysis
      return generateAnalysis(detectedTicker);
    }

    // Market-related queries
    if (lower.includes('market') || lower.includes('nifty') || lower.includes('sensex') ||
        lower.includes('nasdaq') || lower.includes('s&p') || lower.includes('indices')) {
      return QSMarketOverview.renderOverviewChat();
    }

    if (lower.includes('watchlist') || lower.includes('watch list') || lower.includes('portfolio')) {
      return QSWatchlist.renderWatchlistChat();
    }

    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || trimmed === '?') {
      return WELCOME_MESSAGE;
    }

    if (lower.includes('help') || lower.includes('commands') || lower.includes('what can you do')) {
      return HELP_MESSAGE;
    }

    // Gold/commodities
    if (lower.includes('gold') || lower.includes('crude') || lower.includes('oil') || lower.includes('commodit')) {
      return QSMarketOverview.renderOverviewChat();
    }

    return `I'm not sure what you're asking. Here are some things you can try:\n\n• Type a stock ticker: \`RELIANCE\`, \`TCS\`, \`AAPL\`\n• Use \`/analyze TICKER\` for detailed analysis\n• Use \`/page\` to analyze the current webpage\n• Use \`/market\` for market overview\n• Type \`/help\` for all commands`;
  }

  return {
    processCommand,
    generateAnalysis,
    WELCOME_MESSAGE,
    HELP_MESSAGE,
    detectTickerIntent,
    detectTickerFromUrl,
    scrapeCurrentPage
  };
})();

if (typeof window !== 'undefined') {
  window.QSChatPanel = QSChatPanel;
}

