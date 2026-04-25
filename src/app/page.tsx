'use client'
import { useState, useEffect } from 'react'
import { NAMES, DEFAULT_PORTFOLIO } from '@/lib/indicators'
import GlossaryCard from './components/GlossaryCard'
import StockCard from './components/StockCard'
import styles from './page.module.css'

type AssetType = 'JP' | 'US' | 'ETF'
interface Stock { ticker: string; type: AssetType; name: string }

const GLOSSARY = [
  {
    abbr: 'MA', full: '移動平均線',
    body: '一定期間の平均価格でトレンドを把握',
    extra: '短期MA(5日)が長期MA(25日)を上抜け → <strong>ゴールデンクロス＝買い</strong>。下抜け → デッドクロス＝売り。このアプリでは終値の乖離率も算出します。',
  },
  {
    abbr: 'RSI', full: '相対力指数',
    body: '0〜100で買われすぎ・売られすぎを示す',
    extra: '<strong>30以下 → 売られすぎ＝買いシグナル</strong>。70以上 → 買われすぎ＝売りシグナル。14日間の値動きをもとに計算します。',
  },
  {
    abbr: 'MACD', full: 'Moving Avg. Convergence Divergence',
    body: '短期・長期EMAの差でトレンド転換を検知',
    extra: 'MACDラインが0を<strong>上抜け → 買い</strong>、下抜け → 売り。勢いとトレンド両方を同時に確認できる万能指標です。',
  },
  {
    abbr: 'BB', full: 'ボリンジャーバンド',
    body: '統計的な価格変動幅をバンドで表示',
    extra: '価格が<strong>下のバンド(−2σ)に触れる → 買い</strong>。上のバンド(+2σ) → 売り。バンド幅が広いほど変動が大きい状態です。',
  },
]

export default function Home() {
  const [portfolio, setPortfolio] = useState<Stock[]>([])
  const [ticker, setTicker] = useState('')
  const [type, setType] = useState<AssetType>('JP')
  const [updateTime, setUpdateTime] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('portfolio')
    setPortfolio(saved ? JSON.parse(saved) : DEFAULT_PORTFOLIO)
    setUpdateTime(new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }))
  }, [])

  function save(next: Stock[]) {
    localStorage.setItem('portfolio', JSON.stringify(next))
    setPortfolio(next)
  }

  function addStock() {
    const t = ticker.trim().toUpperCase()
    if (!t) return
    if (portfolio.find(s => s.ticker === t)) { alert('すでに追加されています'); return }
    save([...portfolio, { ticker: t, type, name: NAMES[t] || t }])
    setTicker('')
  }

  function removeStock(idx: number) {
    save(portfolio.filter((_, i) => i !== idx))
  }

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.logo}>portfolio<span className={styles.dot}>.</span>signal</div>
        <div className={styles.tagline}>売買シグナル モニター</div>
      </header>

      {/* Add form */}
      <section className={styles.addSection}>
        <h2 className={styles.sectionTitle}>銘柄を追加</h2>
        <div className={styles.addRow}>
          <input
            className={styles.input}
            value={ticker}
            onChange={e => setTicker(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addStock()}
            placeholder="ティッカー (例: 7203, AAPL, 1306)"
            autoComplete="off"
            spellCheck={false}
          />
          <select className={styles.select} value={type} onChange={e => setType(e.target.value as AssetType)}>
            <option value="JP">日本株</option>
            <option value="US">米国株</option>
            <option value="ETF">ETF</option>
          </select>
          <button className={styles.addBtn} onClick={addStock}>+ 追加</button>
        </div>
      </section>

      {/* Glossary */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>指標ガイド — タップで詳細</h2>
        <div className={styles.glossaryGrid}>
          {GLOSSARY.map(g => <GlossaryCard key={g.abbr} {...g} />)}
        </div>
      </section>

      {/* Portfolio */}
      <section className={styles.section}>
        <div className={styles.portfolioHeader}>
          <h2 className={styles.sectionTitle}>保有銘柄</h2>
          {updateTime && <span className={styles.updateTime}>更新 {updateTime}</span>}
        </div>
        <div className={styles.stockList}>
          {portfolio.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>◎</div>
              銘柄を追加するとシグナルが表示されます
            </div>
          ) : (
            portfolio.map((s, i) => (
              <StockCard key={s.ticker} {...s} onRemove={() => removeStock(i)} />
            ))
          )}
        </div>
      </section>

      <footer className={styles.footer}>
        <span>portfolio.signal — デモ用アプリ</span>
        <span>価格データはシミュレーション値です</span>
      </footer>
    </div>
  )
}
