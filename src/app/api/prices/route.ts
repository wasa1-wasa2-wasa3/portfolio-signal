import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const ticker = searchParams.get("ticker") || ""
  const type = searchParams.get("type") || ""

  try {
    if (type === "JP") {
      const symbol = ticker + ".T"
      const url = "https://query1.finance.yahoo.com/v8/finance/chart/" + symbol + "?interval=1d&range=3mo"
      const res = await fetch(url)
      const data = await res.json()
      const closes = data.chart.result[0].indicators.quote[0].close
      const prices = closes.filter((v: number | null) => v !== null)
      return NextResponse.json({ prices })
    } else {
      const apiKey = process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY
      const url = "https://api.twelvedata.com/time_series?symbol=" + ticker + "&interval=1day&outputsize=60&apikey=" + apiKey
      const res = await fetch(url)
      const data = await res.json()
      if (!data.values || data.status === "error") throw new Error("no data")
      const prices = data.values.map((v: { close: string }) => parseFloat(v.close)).reverse()
      return NextResponse.json({ prices })
    }
  } catch {
    return NextResponse.json({ prices: [] })
  }
}