// QuantSage - Technical Analysis Engine (utils/technicalAnalysis.js)
// All calculations are mathematically accurate implementations

const QSTechnical = (() => {

  // --- EMA: Exponential Moving Average ---
  function calculateEMA(data, period) {
    if (!data || data.length < period) return [];
    const k = 2 / (period + 1);
    const ema = [];

    // Seed with SMA for first value
    let sum = 0;
    for (let i = 0; i < period; i++) sum += data[i];
    ema.push(sum / period);

    for (let i = period; i < data.length; i++) {
      ema.push(data[i] * k + ema[ema.length - 1] * (1 - k));
    }
    return ema;
  }

  // --- SMA: Simple Moving Average ---
  function calculateSMA(data, period) {
    if (!data || data.length < period) return [];
    const sma = [];
    for (let i = period - 1; i < data.length; i++) {
      let sum = 0;
      for (let j = i - period + 1; j <= i; j++) sum += data[j];
      sma.push(sum / period);
    }
    return sma;
  }

  // --- RSI: Relative Strength Index (0-100) ---
  function calculateRSI(data, period) {
    period = period || 14;
    if (!data || data.length < period + 1) return [];

    const rsi = [];
    let avgGain = 0;
    let avgLoss = 0;

    // Initial average gain/loss (first `period` changes)
    for (let i = 1; i <= period; i++) {
      const change = data[i] - data[i - 1];
      if (change > 0) avgGain += change;
      else avgLoss += Math.abs(change);
    }
    avgGain /= period;
    avgLoss /= period;

    let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi.push(100 - (100 / (1 + rs)));

    // Subsequent values use Wilder's smoothing
    for (let i = period + 1; i < data.length; i++) {
      const change = data[i] - data[i - 1];
      const gain = change > 0 ? change : 0;
      const loss = change < 0 ? Math.abs(change) : 0;

      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;

      rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      rsi.push(100 - (100 / (1 + rs)));
    }
    return rsi;
  }

  // --- MACD: Moving Average Convergence Divergence ---
  function calculateMACD(data, fastPeriod, slowPeriod, signalPeriod) {
    fastPeriod = fastPeriod || 12;
    slowPeriod = slowPeriod || 26;
    signalPeriod = signalPeriod || 9;

    if (!data || data.length < slowPeriod + signalPeriod) return { macdLine: [], signalLine: [], histogram: [] };

    const fastEMA = calculateEMA(data, fastPeriod);
    const slowEMA = calculateEMA(data, slowPeriod);

    // Align: fastEMA starts at index (fastPeriod-1), slowEMA starts at index (slowPeriod-1)
    // MACD line starts where slowEMA starts
    const offset = slowPeriod - fastPeriod;
    const macdLine = [];
    for (let i = 0; i < slowEMA.length; i++) {
      macdLine.push(fastEMA[i + offset] - slowEMA[i]);
    }

    const signalLine = calculateEMA(macdLine, signalPeriod);

    // Histogram: align signal (starts after signalPeriod-1 macd values)
    const histogram = [];
    for (let i = signalPeriod - 1; i < macdLine.length; i++) {
      histogram.push(macdLine[i] - signalLine[i - (signalPeriod - 1)]);
    }

    return { macdLine, signalLine, histogram };
  }

  // --- Bollinger Bands ---
  function calculateBollingerBands(data, period, multiplier) {
    period = period || 20;
    multiplier = multiplier || 2;

    if (!data || data.length < period) return { upper: [], middle: [], lower: [] };

    const middle = calculateSMA(data, period);
    const upper = [];
    const lower = [];

    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const mean = middle[i - (period - 1)];
      const variance = slice.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / period;
      const stdDev = Math.sqrt(variance);
      upper.push(mean + multiplier * stdDev);
      lower.push(mean - multiplier * stdDev);
    }

    return { upper, middle, lower };
  }

  // --- ATR: Average True Range ---
  function calculateATR(highs, lows, closes, period) {
    period = period || 14;
    if (!highs || highs.length < period + 1) return [];

    const trueRanges = [];
    for (let i = 1; i < highs.length; i++) {
      const tr = Math.max(
        highs[i] - lows[i],
        Math.abs(highs[i] - closes[i - 1]),
        Math.abs(lows[i] - closes[i - 1])
      );
      trueRanges.push(tr);
    }

    if (trueRanges.length < period) return [];

    // First ATR is simple average
    let atr = trueRanges.slice(0, period).reduce((a, b) => a + b, 0) / period;
    const atrValues = [atr];

    for (let i = period; i < trueRanges.length; i++) {
      atr = (atr * (period - 1) + trueRanges[i]) / period;
      atrValues.push(atr);
    }
    return atrValues;
  }

  // --- Support & Resistance Levels ---
  function findSupportResistance(data, window) {
    window = window || 20;
    if (!data || data.length < window * 2) return { support: [], resistance: [] };

    const highs = data.map(d => (typeof d === 'object') ? d.high : d);
    const lows = data.map(d => (typeof d === 'object') ? d.low : d);
    const closes = data.map(d => (typeof d === 'object') ? d.close : d);

    const pivotHighs = [];
    const pivotLows = [];

    for (let i = window; i < data.length - window; i++) {
      const localHigh = Math.max(...highs.slice(i - window, i + window + 1));
      const localLow = Math.min(...lows.slice(i - window, i + window + 1));

      if (highs[i] === localHigh) pivotHighs.push(highs[i]);
      if (lows[i] === localLow) pivotLows.push(lows[i]);
    }

    // Cluster nearby levels
    const cluster = (levels, tolerance) => {
      if (levels.length === 0) return [];
      levels.sort((a, b) => a - b);
      const clusters = [[levels[0]]];
      for (let i = 1; i < levels.length; i++) {
        const last = clusters[clusters.length - 1];
        const avg = last.reduce((a, b) => a + b, 0) / last.length;
        if (Math.abs(levels[i] - avg) / avg < tolerance) {
          last.push(levels[i]);
        } else {
          clusters.push([levels[i]]);
        }
      }
      return clusters.map(c => parseFloat((c.reduce((a, b) => a + b, 0) / c.length).toFixed(2)));
    };

    const currentPrice = closes[closes.length - 1];
    const tolerance = 0.02; // 2%

    return {
      resistance: cluster(pivotHighs, tolerance).filter(l => l > currentPrice).slice(0, 3),
      support: cluster(pivotLows, tolerance).filter(l => l < currentPrice).slice(-3).reverse()
    };
  }

  // --- Trend Identification ---
  function identifyTrend(data) {
    const closes = data.map(d => (typeof d === 'object') ? d.close : d);
    if (closes.length < 50) return 'SIDEWAYS';

    const ema20 = calculateEMA(closes, 20);
    const sma50 = calculateSMA(closes, 50);

    if (ema20.length === 0 || sma50.length === 0) return 'SIDEWAYS';

    const lastEMA20 = ema20[ema20.length - 1];
    const lastSMA50 = sma50[sma50.length - 1];
    const prevEMA20 = ema20[ema20.length - 5] || ema20[0];
    const prevSMA50 = sma50[sma50.length - 5] || sma50[0];
    const currentClose = closes[closes.length - 1];

    // Bullish: price > EMA20 > SMA50, both trending up
    if (currentClose > lastEMA20 && lastEMA20 > lastSMA50 && lastEMA20 > prevEMA20 && lastSMA50 > prevSMA50) {
      return 'BULLISH';
    }
    // Bearish: price < EMA20 < SMA50, both trending down
    if (currentClose < lastEMA20 && lastEMA20 < lastSMA50 && lastEMA20 < prevEMA20 && lastSMA50 < prevSMA50) {
      return 'BEARISH';
    }
    return 'SIDEWAYS';
  }

  // --- Full Technical Summary ---
  function generateTechnicalSummary(ticker, priceData) {
    if (!priceData || priceData.length < 20) {
      return 'Insufficient data for technical analysis.';
    }

    const closes = priceData.map(d => (typeof d === 'object') ? d.close : d);
    const highs = priceData.map(d => (typeof d === 'object') ? (d.high || d.close * 1.01) : d * 1.01);
    const lows = priceData.map(d => (typeof d === 'object') ? (d.low || d.close * 0.99) : d * 0.99);

    const currentPrice = closes[closes.length - 1];

    const ema20 = calculateEMA(closes, 20);
    const sma50 = calculateSMA(closes, 50);
    const sma200 = calculateSMA(closes, 200);
    const rsi = calculateRSI(closes, 14);
    const macd = calculateMACD(closes, 12, 26, 9);
    const bb = calculateBollingerBands(closes, 20, 2);
    const atr = calculateATR(highs, lows, closes, 14);
    const levels = findSupportResistance(priceData.length >= 40 ? priceData : priceData.map((p, i) => ({ high: highs[i], low: lows[i], close: closes[i] })), 5);
    const trend = identifyTrend(closes);

    const lastEMA20 = ema20[ema20.length - 1];
    const lastSMA50 = sma50.length > 0 ? sma50[sma50.length - 1] : null;
    const lastSMA200 = sma200.length > 0 ? sma200[sma200.length - 1] : null;
    const lastRSI = rsi.length > 0 ? rsi[rsi.length - 1] : null;
    const lastMACD = macd.macdLine.length > 0 ? macd.macdLine[macd.macdLine.length - 1] : null;
    const lastSignal = macd.signalLine.length > 0 ? macd.signalLine[macd.signalLine.length - 1] : null;
    const lastHist = macd.histogram.length > 0 ? macd.histogram[macd.histogram.length - 1] : null;
    const lastBBUpper = bb.upper.length > 0 ? bb.upper[bb.upper.length - 1] : null;
    const lastBBMiddle = bb.middle.length > 0 ? bb.middle[bb.middle.length - 1] : null;
    const lastBBLower = bb.lower.length > 0 ? bb.lower[bb.lower.length - 1] : null;
    const lastATR = atr.length > 0 ? atr[atr.length - 1] : null;

    const fmt = (v, d) => v !== null ? v.toFixed(d || 2) : 'N/A';

    let summary = `📈 Trend: ${trend}\n\n`;

    summary += `📊 Moving Averages:\n`;
    summary += `  • 20 EMA: ${fmt(lastEMA20)} — Price is ${currentPrice > lastEMA20 ? 'ABOVE ✅' : 'BELOW ❌'}\n`;
    if (lastSMA50) summary += `  • 50 SMA: ${fmt(lastSMA50)} — Price is ${currentPrice > lastSMA50 ? 'ABOVE ✅' : 'BELOW ❌'}\n`;
    if (lastSMA200) summary += `  • 200 SMA: ${fmt(lastSMA200)} — ${currentPrice > lastSMA200 ? 'Bull market zone ✅' : 'Bear market zone ❌'}\n`;

    if (lastRSI !== null) {
      let rsiSignal = lastRSI > 70 ? 'Overbought ⚠️' : lastRSI < 30 ? 'Oversold 🟢' : 'Neutral ➡️';
      summary += `\n⚡ Momentum:\n`;
      summary += `  • RSI (14): ${fmt(lastRSI, 1)} — ${rsiSignal}\n`;
    }

    if (lastMACD !== null && lastSignal !== null) {
      const macdSignal = lastMACD > lastSignal ? 'Bullish crossover 🟢' : 'Bearish crossover 🔴';
      summary += `  • MACD: ${fmt(lastMACD, 3)} | Signal: ${fmt(lastSignal, 3)} | Hist: ${fmt(lastHist, 3)} — ${macdSignal}\n`;
    }

    if (lastBBUpper !== null) {
      let bbPos;
      if (currentPrice > lastBBUpper) bbPos = 'Above upper band — overbought zone ⚠️';
      else if (currentPrice < lastBBLower) bbPos = 'Below lower band — oversold zone 🟢';
      else if (currentPrice > lastBBMiddle) bbPos = 'Upper half of bands';
      else bbPos = 'Lower half of bands';
      summary += `\n📉 Bollinger Bands:\n`;
      summary += `  • Upper: ${fmt(lastBBUpper)} | Mid: ${fmt(lastBBMiddle)} | Lower: ${fmt(lastBBLower)}\n`;
      summary += `  • Position: ${bbPos}\n`;
    }

    if (lastATR !== null) {
      const atrPct = (lastATR / currentPrice * 100).toFixed(2);
      summary += `\n🌊 Volatility:\n`;
      summary += `  • ATR (14): ${fmt(lastATR)} (${atrPct}% of price) — ${parseFloat(atrPct) > 3 ? 'High volatility ⚠️' : 'Normal volatility'}\n`;
    }

    if (levels.support.length > 0 || levels.resistance.length > 0) {
      summary += `\n🎯 Key Levels:\n`;
      if (levels.resistance.length > 0) summary += `  • Resistance: ${levels.resistance.join(' | ')}\n`;
      if (levels.support.length > 0) summary += `  • Support: ${levels.support.join(' | ')}\n`;
    }

    return summary;
  }

  // Calculate entry range, targets, and stop-loss based on technicals
  function calculateTradeSetup(currentPrice, priceData) {
    if (!priceData || priceData.length < 20) return null;

    const closes = priceData.map(d => (typeof d === 'object') ? d.close : d);
    const highs = priceData.map(d => (typeof d === 'object') ? (d.high || d.close * 1.01) : d * 1.01);
    const lows = priceData.map(d => (typeof d === 'object') ? (d.low || d.close * 0.99) : d * 0.99);

    const atr = calculateATR(highs, lows, closes, 14);
    const lastATR = atr.length > 0 ? atr[atr.length - 1] : currentPrice * 0.02;
    const rsi = calculateRSI(closes, 14);
    const lastRSI = rsi.length > 0 ? rsi[rsi.length - 1] : 50;
    const levels = findSupportResistance(priceData.length >= 20 ? priceData : priceData.map((p, i) => ({
      high: highs[i], low: lows[i], close: closes[i]
    })), 5);
    const trend = identifyTrend(closes);

    const entryLow = parseFloat((currentPrice - lastATR * 0.5).toFixed(2));
    const entryHigh = parseFloat((currentPrice + lastATR * 0.3).toFixed(2));
    const stopLoss = parseFloat((currentPrice - lastATR * 2).toFixed(2));
    const target1 = parseFloat((currentPrice + lastATR * 2.5).toFixed(2));
    const target2 = parseFloat((currentPrice + lastATR * 4.5).toFixed(2));

    // Risk rating
    const atrPct = lastATR / currentPrice * 100;
    let riskRating = 'Medium';
    if (atrPct > 4 || lastRSI > 72) riskRating = 'High';
    else if (atrPct < 1.5 && lastRSI < 65 && lastRSI > 35) riskRating = 'Low';

    return {
      entryLow, entryHigh, target1, target2, stopLoss, riskRating,
      trend, rsi: lastRSI, atr: lastATR,
      nearestSupport: levels.support[0] || stopLoss,
      nearestResistance: levels.resistance[0] || target1
    };
  }

  return {
    calculateEMA,
    calculateSMA,
    calculateRSI,
    calculateMACD,
    calculateBollingerBands,
    calculateATR,
    findSupportResistance,
    identifyTrend,
    generateTechnicalSummary,
    calculateTradeSetup
  };
})();

if (typeof window !== 'undefined') {
  window.QSTechnical = QSTechnical;
}
