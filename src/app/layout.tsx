import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'portfolio.signal — 売買シグナル モニター',
  description: '日本株・米国株・ETFの売買シグナルをMA・RSI・MACD・BBで確認',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
