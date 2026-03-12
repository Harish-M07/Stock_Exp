// QuantSage - Background Service Worker (background.js)
// Handles alarms, notifications, context menus, and message routing
// Note: This service worker is self-contained — utils/*.js are loaded only in content scripts.

// ---- Install / Update Handler ----
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    chrome.notifications.create('qs-welcome', {
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'QuantSage Installed!',
      message: 'Your AI financial analyst is ready. Click the extension icon or use the floating chat panel on any webpage.'
    });

    // Set up default alarm
    chrome.alarms.create('qs-data-refresh', { periodInMinutes: 5 });
    chrome.alarms.create('qs-alert-check', { periodInMinutes: 1 });
  } else if (details.reason === 'update') {
    chrome.alarms.create('qs-data-refresh', { periodInMinutes: 5 });
    chrome.alarms.create('qs-alert-check', { periodInMinutes: 1 });
  }

  // Create context menu
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'qs-analyze',
      title: 'Analyze "%s" with QuantSage',
      contexts: ['selection']
    });
  });
});

// ---- Alarm Handler ----
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'qs-data-refresh') {
    await refreshWatchlistCache();
  } else if (alarm.name === 'qs-alert-check') {
    await checkPriceAlerts();
  }
});

// ---- Context Menu Handler ----
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'qs-analyze' && info.selectionText) {
    const text = info.selectionText.trim().toUpperCase();
    // Send message to content script on the active tab
    chrome.tabs.sendMessage(tab.id, {
      type: 'CONTEXT_ANALYZE',
      ticker: text
    });
  }
});

// ---- Message Router ----
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_SETTINGS') {
    getSettings().then(sendResponse);
    return true;
  }

  if (message.type === 'SAVE_SETTINGS') {
    saveSettings(message.settings).then(sendResponse);
    return true;
  }

  if (message.type === 'FETCH_QUOTE') {
    fetchQuoteBackground(message.ticker).then(sendResponse);
    return true;
  }

  if (message.type === 'GET_WATCHLIST') {
    getWatchlist().then(sendResponse);
    return true;
  }

  if (message.type === 'CHECK_ALERTS') {
    checkPriceAlerts().then(() => sendResponse({ success: true }));
    return true;
  }
});

// ---- Storage Helpers ----
async function getSettings() {
  return new Promise((resolve) => {
    const defaults = {
      theme: 'dark',
      refreshInterval: 300000,
      defaultMarket: 'IN',
      demoMode: true,
      notifications: true,
      alphaVantageKey: '',
      finnhubKey: ''
    };
    chrome.storage.local.get('qs_settings', (result) => {
      resolve({ ...defaults, ...(result['qs_settings'] || {}) });
    });
  });
}

async function saveSettings(settings) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ 'qs_settings': settings }, resolve);
  });
}

async function getWatchlist() {
  return new Promise((resolve) => {
    chrome.storage.local.get('qs_watchlist', (result) => {
      resolve(result['qs_watchlist'] || []);
    });
  });
}

async function getAlerts() {
  return new Promise((resolve) => {
    chrome.storage.local.get('qs_alerts', (result) => {
      resolve(result['qs_alerts'] || []);
    });
  });
}

async function saveAlerts(alerts) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ 'qs_alerts': alerts }, resolve);
  });
}

// ---- Price Alert Check ----
async function checkPriceAlerts() {
  const alerts = await getAlerts();
  const activeAlerts = alerts.filter(a => !a.triggered);

  if (activeAlerts.length === 0) return;

  const settings = await getSettings();
  if (!settings.notifications) return;

  for (const alert of activeAlerts) {
    try {
      const quote = await fetchQuoteBackground(alert.ticker);
      if (!quote) continue;

      const currentPrice = quote.price;
      let triggered = false;

      if (alert.direction === 'above' && currentPrice >= alert.price) {
        triggered = true;
      } else if (alert.direction === 'below' && currentPrice <= alert.price) {
        triggered = true;
      }

      if (triggered) {
        const currency = quote.currency === 'INR' ? '₹' : '$';
        chrome.notifications.create(`qs-alert-${alert.id}`, {
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: `QuantSage Alert: ${alert.ticker}`,
          message: `${alert.ticker} has reached ${currency}${currentPrice.toFixed(2)} (alert: ${alert.direction} ${currency}${alert.price})`
        });

        // Mark alert as triggered
        alert.triggered = true;

        // Broadcast to any open tabs
        chrome.tabs.query({}, (tabs) => {
          tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, {
              type: 'PRICE_ALERT',
              ticker: alert.ticker,
              price: `${currency}${currentPrice.toFixed(2)}`
            }).catch((err) => {
              // Tab may not have content script — this is expected for some pages
              console.debug('QuantSage: Could not send alert to tab', tab.id, err.message);
            });
          });
        });
      }
    } catch (e) {
      // Silently skip individual alert errors
    }
  }

  await saveAlerts(alerts);
}

// ---- Watchlist Cache Refresh ----
async function refreshWatchlistCache() {
  const watchlist = await getWatchlist();
  const settings = await getSettings();

  // Clear stale cache
  chrome.storage.local.get(null, (all) => {
    const cacheKeys = Object.keys(all).filter(k =>
      k.startsWith('qs_cache_stock_') || k.startsWith('qs_cache_hist_')
    );
    if (cacheKeys.length > 0) {
      chrome.storage.local.remove(cacheKeys);
    }
  });
}

// ---- Fetch Quote (background context) ----
async function fetchQuoteBackground(ticker) {
  const settings = await getSettings();
  const config = {
    demoMode: settings.demoMode !== false,
    alphaVantageKey: settings.alphaVantageKey
  };

  // Always use demo mode in background (no window.QUANTSAGE_CONFIG)
  const mockStocks = {
    RELIANCE: { price: 2847.35, currency: 'INR' },
    TCS: { price: 4123.80, currency: 'INR' },
    INFY: { price: 1876.45, currency: 'INR' },
    HDFCBANK: { price: 1698.20, currency: 'INR' },
    ITC: { price: 464.75, currency: 'INR' },
    AAPL: { price: 189.30, currency: 'USD' },
    MSFT: { price: 415.50, currency: 'USD' },
    GOOGL: { price: 175.85, currency: 'USD' },
    AMZN: { price: 198.45, currency: 'USD' }
  };

  if (config.demoMode || !config.alphaVantageKey) {
    return mockStocks[ticker.toUpperCase()] || null;
  }

  try {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${config.alphaVantageKey}`;
    const response = await fetch(url);
    const data = await response.json();
    const q = data['Global Quote'];
    if (!q || !q['05. price']) return mockStocks[ticker.toUpperCase()] || null;
    return {
      price: parseFloat(q['05. price']),
      currency: ticker.endsWith('.NS') || ticker.endsWith('.BO') ? 'INR' : 'USD'
    };
  } catch (e) {
    return mockStocks[ticker.toUpperCase()] || null;
  }
}
