export type Signal = "buy" | "sell" | "neutral"
export type Verdict = "BUY" | "SELL" | "HOLD"

export interface SignalResult {
  maS: Signal; rsiS: Signal; macdS: Signal; bbS: Signal
  verdict: Verdict; matchCount: number
  rsiVal: string; maVal: string; macdVal: string; bbVal: string
  price: number; change: number; prices: number[]
}

export async function fetchPrices(ticker: string, type: string): Promise<number[]> {
  try {
    if (type === "JP" || type === "ETF") {
      const symbol = ticker + ".T"
      const url = "https://query1.finance.yahoo.com/v8/finance/chart/" + symbol + "?interval=1d&range=3mo"
      const res = await fetch(url)
      const data = await res.json()
      const closes = data.chart.result[0].indicators.quote[0].close
      return closes.filter((v: number | null) => v !== null)
    } else {
      const apiKey = process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY
      const url = "https://api.twelvedata.com/time_series?symbol=" + ticker + "&interval=1day&outputsize=60&apikey=" + apiKey
      const res = await fetch(url)
      const data = await res.json()
      if (!data.values || data.status === "error") throw new Error("no data")
      return data.values.map((v: { close: string }) => parseFloat(v.close)).reverse()
    }
  } catch {
    return genPrices(ticker)
  }
}

function seeded(seed: number) {
  let s = seed % 2147483647
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 }
}
function hash(str: string) { return str.split("").reduce((a, c) => a + c.charCodeAt(0), 0) }

export function genPrices(ticker: string): number[] {
  const r = seeded(hash(ticker))
  const base = ticker.length > 4 ? 3000 + r() * 47000 : 80 + r() * 500
  const arr: number[] = []
  let p = base
  for (let i = 0; i < 60; i++) { p = p * (1 + (r() - 0.49) * 0.022); arr.push(Math.max(1, p)) }
  return arr
}

function ema(arr: number[], k: number): number {
  return arr.reduce((p, c, i) => i === 0 ? c : p * (1 - 2 / (k + 1)) + c * (2 / (k + 1)), arr[0])
}

export function calcSignals(prices: number[]): SignalResult {
  const n = prices.length, close = prices[n - 1]
  const ma5 = prices.slice(-5).reduce((a, b) => a + b, 0) / 5
  const ma25 = prices.slice(-25).reduce((a, b) => a + b, 0) / 25
  const maS: Signal = close > ma5 && ma5 > ma25 ? "buy" : close < ma5 && ma5 < ma25 ? "sell" : "neutral"
  let g = 0, l = 0
  for (let i = n - 14; i < n; i++) { const d = prices[i] - prices[i - 1]; d > 0 ? g += d : l -= d }
  const rsi = l === 0 ? 100 : 100 - 100 / (1 + g / l)
  const rsiS: Signal = rsi < 30 ? "buy" : rsi > 70 ? "sell" : "neutral"
  const macdVal = ema(prices.slice(-12), 12) - ema(prices.slice(-26), 26)
  const prevMacd = ema(prices.slice(-13, -1), 12) - ema(prices.slice(-27, -1), 26)
  const macdS: Signal = macdVal > 0 && prevMacd <= 0 ? "buy" : macdVal < 0 && prevMacd >= 0 ? "sell" : "neutral"
  const sma20 = prices.slice(-20).reduce((a, b) => a + b, 0) / 20
  const std = Math.sqrt(prices.slice(-20).reduce((a, b) => a + (b - sma20) ** 2, 0) / 20)
  const bbS: Signal = close < sma20 - 2 * std ? "buy" : close > sma20 + 2 * std ? "sell" : "neutral"
  const sc = { buy: 0, sell: 0, neutral: 0 }
  ;[maS, rsiS, macdS, bbS].forEach(s => sc[s]++)
  const verdict: Verdict = sc.buy >= 3 ? "BUY" : sc.sell >= 3 ? "SELL" : sc.buy > sc.sell ? "BUY" : sc.sell > sc.buy ? "SELL" : "HOLD"
  const matchCount = verdict === "BUY" ? sc.buy : verdict === "SELL" ? sc.sell : sc.neutral
  return { maS, rsiS, macdS, bbS, verdict, matchCount, rsiVal: rsi.toFixed(1), maVal: (close / ma25 * 100).toFixed(1), macdVal: macdVal.toFixed(2), bbVal: (std / sma20 * 100).toFixed(1), price: close, change: (close - prices[n - 2]) / prices[n - 2] * 100, prices }
}

export const NAMES: Record<string, string> = {
  "7203": "トヨタ自動車", "6758": "ソニーグループ", "9984": "ソフトバンクG",
  "6861": "キーエンス", "4063": "信越化学", "8306": "三菱UFJ",
  "AAPL": "Apple Inc.", "MSFT": "Microsoft", "NVDA": "NVIDIA",
  "TSLA": "Tesla", "GOOGL": "Alphabet", "AMZN": "Amazon",
  "1306": "TOPIX連動 ETF", "1321": "日経225 ETF", "2558": "S&P500 ETF",
}

export const DEFAULT_PORTFOLIO = [
  { ticker: "7203", type: "JP" as const, name: "トヨタ自動車" },
  { ticker: "AAPL", type: "US" as const, name: "Apple Inc." },
  { ticker: "1306", type: "ETF" as const, name: "TOPIX連動 ETF" },
]