'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import { calcSignals, genPrices } from '@/lib/indicators'
import type { Signal, Verdict } from '@/lib/indicators'
import styles from './StockCard.module.css'

const SparklineChart = dynamic(() => import('./SparklineChart'), { ssr: false })

interface Props {
  ticker: string
  type: 'JP' | 'US' | 'ETF'
  name: string
  onRemove: () => void
}

function sigLabel(s: Signal) { return s === 'buy' ? '買い' : s === 'sell' ? '売り' : '中立' }
function vLabel(v: Verdict) { return v === 'BUY' ? '買い場' : v === 'SELL' ? '売り場' : '様子見' }

export default function StockCard({ ticker, type, name, onRemove }: Props) {
  const [open, setOpen] = useState(false)
  const prices = genPrices(ticker)
  const d = calcSignals(prices)
  const up = d.change >= 0
  const priceStr = type === 'US'
    ? `$${d.price.toFixed(2)}`
    : `¥${Math.round(d.price * (type === 'ETF' ? 10 : 1)).toLocaleString()}`

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
          <div className={styles.priceGroup}>
            <div className={styles.priceBlock}>
              <div className={styles.price}>{priceStr}</div>
              <div className={`${styles.chg} ${up ? styles.up : styles.dn}`}>
                {up ? '+' : ''}{d.change.toFixed(2)}%
              </div>
            </div>
            <button className={styles.removeBtn} onClick={onRemove} aria-label="削除">×</button>
          </div>
        </div>

        <div className={styles.signals}>
          {([
            ['MA', d.maS],
            [`RSI ${d.rsiVal}`, d.rsiS],
            ['MACD', d.macdS],
            ['BB', d.bbS],
          ] as [string, Signal][]).map(([label, sig]) => (
            <span key={label} className={`${styles.sig} ${styles[sig]}`}>
              {label}: {sigLabel(sig)}
            </span>
          ))}
        </div>

        <div className={styles.verdictRow}>
          <span className={styles.verdictLabel}>総合判定</span>
          <span className={`${styles.verdictBadge} ${styles[d.verdict]}`}>{vLabel(d.verdict)}</span>
          <span className={styles.scoreNote}>{d.matchCount}/4 一致</span>
          <button className={styles.detailBtn} onClick={() => setOpen(!open)}>
            詳細 {open ? '▴' : '▾'}
          </button>
        </div>
      </div>

      {open && (
        <div className={styles.detail}>
          <SparklineChart prices={d.prices} verdict={d.verdict} />
          <div className={styles.indGrid}>
            {[
              { label: 'MA乖離率', val: `${d.maVal}%`, hint: 'vs 25日MA' },
              { label: 'RSI', val: d.rsiVal, hint: '30↓買 / 70↑売' },
              { label: 'MACD', val: d.macdVal, hint: '0超え＝上昇' },
              { label: 'BB幅(σ)', val: `${d.bbVal}%`, hint: '標準偏差/平均' },
            ].map(({ label, val, hint }) => (
              <div key={label} className={styles.indBox}>
                <div className={styles.indLabel}>{label}</div>
                <div className={styles.indVal}>{val}</div>
                <div className={styles.indHint}>{hint}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
