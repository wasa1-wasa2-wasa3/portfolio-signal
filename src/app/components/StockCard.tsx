"use client"
import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { calcSignals, fetchPrices } from "@/lib/indicators"
import type { Signal, Verdict, SignalResult } from "@/lib/indicators"
import styles from "./StockCard.module.css"

const SparklineChart = dynamic(() => import("./SparklineChart"), { ssr: false })

interface Props {
  ticker: string
  type: "JP" | "US" | "ETF"
  name: string
  onRemove: () => void
}

function sigLabel(s: Signal) {
  if (s === "buy") return "buy"
  if (s === "sell") return "sell"
  return "neutral"
}

function vLabel(v: Verdict) {
  if (v === "BUY") return "BUY"
  if (v === "SELL") return "SELL"
  return "HOLD"
}

export default function StockCard({ ticker, type, name, onRemove }: Props) {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState<SignalResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchPrices(ticker, type).then(prices => {
      setData(calcSignals(prices))
      setLoading(false)
    })
  }, [ticker, type])

  if (loading) {
    return (
      <div className={styles.card}>
        <div className={styles.main}>
          <span className={styles.ticker}>{ticker}</span>
          <span> loading...</span>
        </div>
      </div>
    )
  }

  if (!data) return null

  const d = data
  const up = d.change >= 0

    const priceStr = type === "US" ? ("$" + d.price.toFixed(2)) : (d.price.toFixed(0))


  return (
    <div className={styles.card}>
      <div className={styles.main}>
        <div className={styles.top}>
          <div className={styles.tickerBlock}>
            <div className={styles.tickerRow}>
              <span className={styles.ticker}>{ticker}</span>
              <span className={styles.typeTag}>{type}</span>
            </div>
            <div className={styles.name}>{name}</div>
          </div>
          <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
            <div className={styles.priceBlock}>
              <div className={styles.price}>{priceStr}</div>
              <div className={up ? styles.up : styles.dn}>
                {up ? "+" : ""}{d.change.toFixed(2)}%
              </div>
            </div>
            <button className={styles.removeBtn} onClick={onRemove}>x</button>
          </div>
        </div>

        <div className={styles.signals}>
{([["MA", d.maS], ["RSI " + d.rsiVal, d.rsiS], ["MACD", d.macdS], ["BB", d.bbS]] as [string, Signal][])
            <span key={label} className={styles.sig + " " + styles[sig]}>
              {label}: {sigLabel(sig)}
            </span>
          ))}
        </div>

        <div className={styles.verdictRow}>
          <span className={styles.verdictLabel}>verdict</span>
          <span className={styles.verdictBadge + " " + styles[d.verdict]}>{vLabel(d.verdict)}</span>
          <span className={styles.scoreNote}>{d.matchCount}/4</span>
          <button className={styles.detailBtn} onClick={() => setOpen(!open)}>
            {open ? "close" : "detail"}
          </button>
        </div>
      </div>

      {open && (
        <div className={styles.detail}>
          <SparklineChart prices={d.prices} verdict={d.verdict} />
          <div className={styles.indGrid}>
            <div className={styles.indBox}>
              <div className={styles.indLabel}>MA</div>
              <div className={styles.indVal}>{d.maVal}%</div>
            </div>
            <div className={styles.indBox}>
              <div className={styles.indLabel}>RSI</div>
              <div className={styles.indVal}>{d.rsiVal}</div>
            </div>
            <div className={styles.indBox}>
              <div className={styles.indLabel}>MACD</div>
              <div className={styles.indVal}>{d.macdVal}</div>
            </div>
            <div className={styles.indBox}>
              <div className={styles.indLabel}>BB</div>
              <div className={styles.indVal}>{d.bbVal}%</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}