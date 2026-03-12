// QuantSage - Chat Panel Logic (components/chatPanel.js)

const QSChatPanel = (() => {

  const WELCOME_MESSAGE = `👋 Welcome to **QuantSage** — your AI financial analyst!

I'm ready to help with professional stock analysis, trade recommendations, and portfolio management.

**Quick Commands:**
• \`/analyze TICKER\` — Full stock analysis with trade setup
• \`/market\` — Market overview (Indices + Commodities)
• \`/watchlist\` — View your watchlist
• \`/watch TICKER\` — Add stock to watchlist
• \`/unwatch TICKER\` — Remove from watchlist
• \`/alert TICKER PRICE\` — Set price alert
• \`/help\` — Show all commands

Or just type naturally: _"How is TCS doing?"_ or _"Analyze Reliance"_ 🚀`;

  const HELP_MESSAGE = `📖 **QuantSage Commands**

| Command | Description |
|---|---|
| \`/analyze TICKER\` | Full technical + fundamental analysis |
| \`/market\` | Live market overview |
| \`/watchlist\` | View watchlist |
| \`/watch TICKER\` | Add to watchlist |
| \`/unwatch TICKER\` | Remove from watchlist |
| \`/alert TICKER PRICE\` | Set price alert |
| \`/help\` | This help message |

**Supported Stocks (Demo Mode):**
🇮🇳 RELIANCE, TCS, INFY, HDFCBANK, ITC
🇺🇸 AAPL, MSFT, GOOGL, AMZN

_Type any stock name or ticker for analysis!_`;

  // Detect ticker intent from natural language
  function detectTickerIntent(text) {
    const lower = text.toLowerCase().trim();

    // Known company → ticker map
    const nameMap = {
      'reliance': 'RELIANCE', 'reliance industries': 'RELIANCE',
      'tcs': 'TCS', 'tata consultancy': 'TCS', 'tata consultancy services': 'TCS',
      'infosys': 'INFY', 'infy': 'INFY',
      'hdfc bank': 'HDFCBANK', 'hdfc': 'HDFCBANK', 'hdfcbank': 'HDFCBANK',
      'itc': 'ITC',
      'apple': 'AAPL', 'aapl': 'AAPL',
      'microsoft': 'MSFT', 'msft': 'MSFT',
      'google': 'GOOGL', 'alphabet': 'GOOGL', 'googl': 'GOOGL',
      'amazon': 'AMZN', 'amzn': 'AMZN'
    };

    // Check direct name match
    for (const [name, ticker] of Object.entries(nameMap)) {
      if (lower.includes(name)) return ticker;
    }

    // Extract uppercase tickers (1-6 chars)
    const words = text.split(/\s+/);
    for (const word of words) {
      const cleaned = word.replace(/[^A-Za-z]/g, '');
      if (cleaned.length >= 2 && cleaned.length <= 6 && cleaned === cleaned.toUpperCase()) {
        return cleaned;
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

      let msg = `📊 **${quote.name || upperTicker}** (${upperTicker})\n`;
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

    return `I'm not sure what you're asking. Here are some things you can try:\n\n• Type a stock ticker: \`RELIANCE\`, \`TCS\`, \`AAPL\`\n• Use \`/analyze TICKER\` for detailed analysis\n• Use \`/market\` for market overview\n• Type \`/help\` for all commands`;
  }

  return {
    processCommand,
    generateAnalysis,
    WELCOME_MESSAGE,
    HELP_MESSAGE,
    detectTickerIntent
  };
})();

if (typeof window !== 'undefined') {
  window.QSChatPanel = QSChatPanel;
}
