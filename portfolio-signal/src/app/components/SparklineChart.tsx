'use client'
import { useEffect, useRef } from 'react'
import type { Verdict } from '@/lib/indicators'

interface Props {
  prices: number[]
  verdict: Verdict
}

export default function SparklineChart({ prices, verdict }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const W = canvas.offsetWidth
    const H = 64
    canvas.width = W * dpr
    canvas.height = H * dpr
    const ctx = canvas.getContext('2d')!
    ctx.scale(dpr, dpr)

    const mn = Math.min(...prices), mx = Math.max(...prices)
    const x = (i: number) => (i / (prices.length - 1)) * W
    const y = (v: number) => H - ((v - mn) / (mx - mn)) * H * 0.82 - H * 0.09
    const col = verdict === 'BUY' ? '#2a7a2a' : verdict === 'SELL' ? '#c04040' : '#888'

    ctx.beginPath()
    prices.forEach((p, i) => i === 0 ? ctx.moveTo(x(i), y(p)) : ctx.lineTo(x(i), y(p)))
    ctx.strokeStyle = col
    ctx.lineWidth = 1.5
    ctx.lineJoin = 'round'
    ctx.stroke()

    const grad = ctx.createLinearGradient(0, 0, 0, H)
    grad.addColorStop(0, col + '28')
    grad.addColorStop(1, col + '00')
    ctx.lineTo(W, H)
    ctx.lineTo(0, H)
    ctx.closePath()
    ctx.fillStyle = grad
    ctx.fill()
  }, [prices, verdict])

  return (
    <canvas
      ref={ref}
      style={{ display: 'block', width: '100%', height: 64, marginBottom: 12 }}
    />
  )
}
