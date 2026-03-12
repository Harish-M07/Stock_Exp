// QuantSage - Chrome Storage Wrapper (utils/storage.js)

const QSStorage = (() => {
  const KEYS = {
    CHAT_HISTORY: 'qs_chat_history',
    WATCHLIST: 'qs_watchlist',
    ALERTS: 'qs_alerts',
    SETTINGS: 'qs_settings',
    CACHE_PREFIX: 'qs_cache_'
  };

  const MAX_CHAT_HISTORY = 100;
  const MAX_WATCHLIST = 20;

  // --- Chat History ---
  async function getChatHistory() {
    return new Promise((resolve) => {
      chrome.storage.local.get(KEYS.CHAT_HISTORY, (result) => {
        resolve(result[KEYS.CHAT_HISTORY] || []);
      });
    });
  }

  async function saveChatHistory(messages) {
    const trimmed = messages.slice(-MAX_CHAT_HISTORY);
    return new Promise((resolve) => {
      chrome.storage.local.set({ [KEYS.CHAT_HISTORY]: trimmed }, resolve);
    });
  }

  async function clearChatHistory() {
    return new Promise((resolve) => {
      chrome.storage.local.remove(KEYS.CHAT_HISTORY, resolve);
    });
  }

  // --- Watchlist ---
  async function getWatchlist() {
    return new Promise((resolve) => {
      chrome.storage.local.get(KEYS.WATCHLIST, (result) => {
        resolve(result[KEYS.WATCHLIST] || []);
      });
    });
  }

  async function addToWatchlist(ticker) {
    const watchlist = await getWatchlist();
    const upperTicker = ticker.toUpperCase().trim();
    if (watchlist.includes(upperTicker)) {
      return { success: false, message: `${upperTicker} is already in your watchlist.` };
    }
    if (watchlist.length >= MAX_WATCHLIST) {
      return { success: false, message: `Watchlist is full (max ${MAX_WATCHLIST} stocks). Remove a stock first.` };
    }
    watchlist.push(upperTicker);
    return new Promise((resolve) => {
      chrome.storage.local.set({ [KEYS.WATCHLIST]: watchlist }, () => {
        resolve({ success: true, message: `${upperTicker} added to watchlist.` });
      });
    });
  }

  async function removeFromWatchlist(ticker) {
    const watchlist = await getWatchlist();
    const upperTicker = ticker.toUpperCase().trim();
    const updated = watchlist.filter(t => t !== upperTicker);
    if (updated.length === watchlist.length) {
      return { success: false, message: `${upperTicker} was not in your watchlist.` };
    }
    return new Promise((resolve) => {
      chrome.storage.local.set({ [KEYS.WATCHLIST]: updated }, () => {
        resolve({ success: true, message: `${upperTicker} removed from watchlist.` });
      });
    });
  }

  // --- Price Alerts ---
  async function getAlerts() {
    return new Promise((resolve) => {
      chrome.storage.local.get(KEYS.ALERTS, (result) => {
        resolve(result[KEYS.ALERTS] || []);
      });
    });
  }

  async function addAlert(ticker, price, direction) {
    const alerts = await getAlerts();
    const upperTicker = ticker.toUpperCase().trim();
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return { success: false, message: 'Invalid price for alert.' };
    }
    const alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      ticker: upperTicker,
      price: numPrice,
      direction: direction || 'above',
      createdAt: Date.now(),
      triggered: false
    };
    alerts.push(alert);
    return new Promise((resolve) => {
      chrome.storage.local.set({ [KEYS.ALERTS]: alerts }, () => {
        resolve({ success: true, message: `Alert set: ${upperTicker} ${alert.direction} ₹${numPrice.toFixed(2)}`, alert });
      });
    });
  }

  async function removeAlert(id) {
    const alerts = await getAlerts();
    const updated = alerts.filter(a => a.id !== id);
    return new Promise((resolve) => {
      chrome.storage.local.set({ [KEYS.ALERTS]: updated }, () => {
        resolve({ success: true });
      });
    });
  }

  async function markAlertTriggered(id) {
    const alerts = await getAlerts();
    const updated = alerts.map(a => a.id === id ? { ...a, triggered: true } : a);
    return new Promise((resolve) => {
      chrome.storage.local.set({ [KEYS.ALERTS]: updated }, resolve);
    });
  }

  // --- Settings ---
  async function getSettings() {
    const defaults = (typeof QUANTSAGE_CONFIG !== 'undefined') ? QUANTSAGE_CONFIG.defaults : {
      theme: 'dark',
      refreshInterval: 300000,
      defaultMarket: 'IN',
      demoMode: true,
      notifications: true
    };
    return new Promise((resolve) => {
      chrome.storage.local.get(KEYS.SETTINGS, (result) => {
        resolve({ ...defaults, ...(result[KEYS.SETTINGS] || {}) });
      });
    });
  }

  async function saveSettings(settings) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [KEYS.SETTINGS]: settings }, resolve);
    });
  }

  // --- Cache ---
  async function getCachedData(key) {
    const cacheKey = KEYS.CACHE_PREFIX + key;
    return new Promise((resolve) => {
      chrome.storage.local.get(cacheKey, (result) => {
        const cached = result[cacheKey];
        if (!cached) { resolve(null); return; }
        if (Date.now() > cached.expiresAt) {
          chrome.storage.local.remove(cacheKey);
          resolve(null);
          return;
        }
        resolve(cached.data);
      });
    });
  }

  async function setCachedData(key, data, ttl) {
    const cacheKey = KEYS.CACHE_PREFIX + key;
    const cacheTTL = ttl || ((typeof QUANTSAGE_CONFIG !== 'undefined') ? QUANTSAGE_CONFIG.api.cacheTTL : 300000);
    const entry = { data, expiresAt: Date.now() + cacheTTL, cachedAt: Date.now() };
    return new Promise((resolve) => {
      chrome.storage.local.set({ [cacheKey]: entry }, resolve);
    });
  }

  async function clearCache() {
    return new Promise((resolve) => {
      chrome.storage.local.get(null, (all) => {
        const cacheKeys = Object.keys(all).filter(k => k.startsWith(KEYS.CACHE_PREFIX));
        if (cacheKeys.length === 0) { resolve(); return; }
        chrome.storage.local.remove(cacheKeys, resolve);
      });
    });
  }

  return {
    getChatHistory, saveChatHistory, clearChatHistory,
    getWatchlist, addToWatchlist, removeFromWatchlist,
    getAlerts, addAlert, removeAlert, markAlertTriggered,
    getSettings, saveSettings,
    getCachedData, setCachedData, clearCache
  };
})();

if (typeof window !== 'undefined') {
  window.QSStorage = QSStorage;
}
