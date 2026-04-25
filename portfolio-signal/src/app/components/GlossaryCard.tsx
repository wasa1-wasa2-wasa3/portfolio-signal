'use client'
import { useState } from 'react'
import styles from './GlossaryCard.module.css'

interface Props {
  abbr: string
  full: string
  body: string
  extra: string
}

export default function GlossaryCard({ abbr, full, body, extra }: Props) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`${styles.card} ${open ? styles.open : ''}`} onClick={() => setOpen(!open)}>
      <div className={styles.abbr}>{abbr}</div>
      <div className={styles.full}>{full}</div>
      <div className={styles.body}>{body}</div>
      {open && <div className={styles.extra} dangerouslySetInnerHTML={{ __html: extra }} />}
    </div>
  )
}
