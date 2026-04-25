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

function sigLabel(s: Signal) { return s === "buy" ? "\u8CB7\u3044" : s === "sell" ? "\u58F2\u308A" : "\u4E2D\u7ACB" }
function vLabel(v: Verdict) { return v === "BUY" ? "\u8CB7\u3044\u5834" : v === "SELL" ? "\u58F2\u308A\u5834" : "\u69D8\u5B50\u898B" }

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

  if (loading) return (
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
        </div>
        <div style={{color:"var(--muted)",fontSize:12,fontFamily:"var(--mono)}}">\u30C7\u30FC\u30BF\u53D6\u5F97\u4E2D...</div>
      </div>
    </div>
  )

  if (!data) return null
  const d = data
  const up = d.change >= 0
  const priceStr = type === "US" ? ("$" + d.price.toFixed(2)) : ("\u00A5" + Math.round(d.price).toLocaleString())

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
              <div className={styles.chg + " " + (up ? styles.up : styles.dn)}>{up ? "+" : ""}{d.change.toFixed(2)}%</div>
            </div>
            <button className={styles.removeBtn} onClick={onRemove} aria-label="\u524A\u9664">x</button>
          </div>
        </div>
        <div className={styles.signals}>
          {([["MA", d.maS], ["RSI " + d.rsiVal, d.rsiS], ["MACD", d.macdS], ["BB", d.bbS]] as [string, Signal][]).map(([label, sig]) => (
            <span key={label} className={styles.sig + " " + styles[sig]}>{label}: {sigLabel(sig)}</span>
          ))}
        </div>
        <div className={styles.verdictRow}>
          <span className={styles.verdictLabel}>\u7DCF\u5408\u5224\u5B9A</span>
          <span className={styles.verdictBadge + " " + styles[d.verdict]}>{vLabel(d.verdict)}</span>
          <span className={styles.scoreNote}>{d.matchCount}/4 \u4E00\u81F4</span>
          <button className={styles.detailBtn} onClick={() => setOpen(!open)}>\u8A73\u7D30 {open ? "\u25B4" : "\u25BE"}</button>
        </div>
      </div>
      {open && (
        <div className={styles.detail}>
          <SparklineChart prices={d.prices} verdict={d.verdict} />
          <div className={styles.indGrid}>
            {[
              { label: "MA\u4E56\u96E2\u7387", val: (d.maVal + "%"), hint: "vs 25\u65E5MA" },
              { label: "RSI", val: d.rsiVal, hint: "30\u2193\u8CB7 / 70\u2191\u58F2" },
              { label: "MACD", val: d.macdVal, hint: "0\u8D85\u3048\uFF1D\u4E0A\u6607" },
              { label: "BB\u5E45(\u03C3)", val: (d.bbVal + "%"), hint: "\u6A19\u6E96\u504F\u5DEE/\u5E73\u5747" },
            ].map(({ label, val, hint }) => (
              <div key={label} className={styles.indBox}>
                <div className={styles.indLabel}>{label}</div>
                <div className={styles.indVal}>{val}</div>