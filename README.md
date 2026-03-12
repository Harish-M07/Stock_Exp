# QuantSage — AI Financial Analyst Chrome Extension

> 🧠 **Professional-grade AI financial analyst** for portfolio management and real-time market intelligence — delivered as a Chrome Browser Extension.

---

## ✨ Features

- 🗨️ **Floating In-App Chat Panel** — Draggable overlay on any webpage with Shadow DOM isolation
- 📊 **Full Technical Analysis** — EMA, SMA, RSI, MACD, Bollinger Bands, ATR (all computed locally)
- 💹 **Trade Recommendations** — Entry range, targets, stop-loss, risk rating
- 👁️ **Watchlist** — Persistent watchlist with live price updates
- 🌍 **Market Overview** — Nifty 50, Bank Nifty, Sensex, S&P 500, NASDAQ, commodities
- 🔔 **Price Alerts** — Background alarm-based alerts with Chrome notifications
- 🖱️ **Right-Click Context Menu** — "Analyze with QuantSage" on any selected text
- 🌑 **Demo Mode** — Works fully out of the box with realistic mock data (no API key needed)
- ⚙️ **Settings** — Configure API keys, preferences via the popup

---

## 📦 Directory Structure

```
quantsage-extension/
├── manifest.json              # Manifest V3 config
├── background.js              # Service worker (alarms, notifications, context menus)
├── content.js                 # Floating chat panel injection (Shadow DOM)
├── content.css                # Host-page minimal styles
├── popup.html                 # Extension popup dashboard
├── popup.css                  # Popup styles
├── popup.js                   # Popup logic
├── config.js                  # Configuration & demo data
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   ├── icon128.png
│   └── icon-generator.html    # Generate custom icons
├── utils/
│   ├── api.js                 # API client (Alpha Vantage, rate limiting, caching)
│   ├── marketData.js          # Market data (quotes, historical, indices)
│   ├── technicalAnalysis.js   # EMA, SMA, RSI, MACD, Bollinger Bands, ATR
│   └── storage.js             # Chrome storage wrapper
└── components/
    ├── chatPanel.js           # Chat logic, NLP, slash commands
    ├── stockCard.js           # Reusable stock card HTML components
    ├── watchlist.js           # Watchlist rendering & management
    └── marketOverview.js      # Market overview dashboard
```

---

## 🚀 Installation

### Step 1: Get the Extension Files

```bash
git clone https://github.com/Harish-M07/Stock_Exp.git
cd Stock_Exp/quantsage-extension
```

### Step 2: Generate Icons (Optional)

Open `icons/icon-generator.html` in your browser and download the three icon files to the `icons/` folder.

### Step 3: Load in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer Mode** (toggle in top-right corner)
3. Click **"Load unpacked"**
4. Select the `quantsage-extension/` folder
5. The QuantSage extension will appear in your browser toolbar

---

## ⚙️ Configuration

### Demo Mode (Default)
QuantSage works **out of the box without any API keys** using realistic mock data for:
- 🇮🇳 **Indian stocks**: RELIANCE, TCS, INFY, HDFCBANK, ITC
- 🇺🇸 **US stocks**: AAPL, MSFT, GOOGL, AMZN
- 📈 **Indices**: Nifty 50, Bank Nifty, Sensex, S&P 500, NASDAQ, DJI
- 🏅 **Commodities**: Gold, Crude Oil, Silver

### Live Data (Optional)
For real-time data, get a free API key from [Alpha Vantage](https://www.alphavantage.co/support/#api-key) and enter it in Settings.

1. Click the QuantSage icon in Chrome toolbar
2. Go to **⚙ Settings** tab
3. Enter your Alpha Vantage API Key
4. Disable Demo Mode
5. Click **Save Settings**

---

## 💬 Usage Guide

### Floating Chat Panel
Click the **QS button** (bottom-right of any webpage) to open the chat panel. It's draggable and works on any site.

### Slash Commands

| Command | Description | Example |
|---|---|---|
| `/analyze TICKER` | Full stock analysis with trade setup | `/analyze RELIANCE` |
| `/market` | Live market overview | `/market` |
| `/watchlist` | View your watchlist | `/watchlist` |
| `/watch TICKER` | Add stock to watchlist | `/watch TCS` |
| `/unwatch TICKER` | Remove from watchlist | `/unwatch TCS` |
| `/alert TICKER PRICE` | Set a price alert | `/alert TCS 4500` |
| `/help` | Show all commands | `/help` |

### Natural Language
You can also type naturally:
- _"How is TCS doing?"_ → Runs analysis on TCS
- _"Analyze Reliance"_ → Full analysis for RELIANCE
- _"Show me the market"_ → Market overview
- _"AAPL"_ → Analysis for Apple Inc.

### Right-Click
Select any ticker text on a webpage → Right-click → **"Analyze with QuantSage"**

---

## 📊 Analysis Output Format

```
📊 Company Name (TICKER)
📗 ₹2,847.35 ▲ 1.50%

🎯 Entry Range: ₹2,780 — ₹2,860
🎯 Targets:
  • Target 1: ₹3,020
  • Target 2: ₹3,190
🛑 Stop Loss: ₹2,650
🟡 Risk Rating: Medium

📈 Technical Summary:
  📈 Trend: BULLISH
  📊 Moving Averages: EMA(20), SMA(50), SMA(200)
  ⚡ RSI (14), MACD, Bollinger Bands, ATR
  🎯 Support & Resistance levels

💰 Fundamental Summary:
  P/E, EPS, ROE, Debt/Equity, Market Cap, Sector

🔥 Catalysts
❌ Invalidation conditions
```

---

## 🏗️ Technical Architecture

```
┌─────────────────────────────────────────┐
│          Chrome Extension               │
│                                         │
│  ┌─────────────┐  ┌──────────────────┐  │
│  │  Popup UI   │  │  Content Script  │  │
│  │  (popup.js) │  │  (content.js)    │  │
│  └──────┬──────┘  └────────┬─────────┘  │
│         │                  │            │
│         └────────┬─────────┘            │
│                  │                      │
│         ┌────────▼─────────┐            │
│         │ Background Worker│            │
│         │ (background.js)  │            │
│         └────────┬─────────┘            │
│                  │                      │
│    ┌─────────────┼──────────────┐       │
│    │             │              │       │
│  ┌─▼──┐  ┌──────▼──┐  ┌───────▼──┐    │
│  │API │  │  Chrome │  │Technical │    │
│  │(AV)│  │ Storage │  │Analysis  │    │
│  └────┘  └─────────┘  └──────────┘    │
└─────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Component | Technology |
|---|---|
| Extension Platform | Chrome Extension Manifest V3 |
| Chat Injection | Shadow DOM (full style isolation) |
| Technical Analysis | Pure JavaScript (no external libraries) |
| Storage | Chrome Storage API (`chrome.storage.local`) |
| Background Tasks | Chrome Alarms API |
| Notifications | Chrome Notifications API |
| Data Source | Alpha Vantage (free tier) / Demo mode |
| UI Framework | Vanilla JS + CSS (no dependencies) |

---

## 📡 API Providers

| Provider | Usage | Free Tier |
|---|---|---|
| [Alpha Vantage](https://www.alphavantage.co/) | Stock quotes, historical data, fundamentals | 25 req/day, 5 req/min |
| Demo Mode | Built-in realistic mock data | Unlimited (no key needed) |

---

## 🔒 Privacy & Security

- **No tracking** — QuantSage does not collect or transmit any personal data
- **API keys** are stored locally in `chrome.storage.local` only
- **No external scripts** — everything runs locally, no CDN dependencies
- **Shadow DOM** — chat panel is fully isolated from host page styles/scripts
- All network requests go only to configured financial APIs
- **Demo mode** makes zero network requests

---

## 📋 Available Permissions

| Permission | Reason |
|---|---|
| `storage` | Save watchlist, chat history, settings locally |
| `activeTab` | Inject chat panel into current page |
| `alarms` | Periodic data refresh and price alert checks |
| `notifications` | Show price alert notifications |
| `contextMenus` | Right-click "Analyze with QuantSage" |
| Host permissions | Fetch data from financial APIs |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes in the `quantsage-extension/` directory
4. Test by loading the extension unpacked in Chrome
5. Submit a pull request

---

## ⚠️ Disclaimer

QuantSage is for **educational and informational purposes only**. This is not financial advice. Always conduct your own research and consult a qualified financial advisor before making investment decisions. The creators are not responsible for any financial losses.

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

*Built with ❤️ for the Indian retail investor community*