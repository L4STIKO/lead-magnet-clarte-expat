import jsPDF from 'jspdf'
import { steps, checklist } from '../config/plan-data'
import { pillarNames, type Answer } from '../config/questions'
import { q7Phrases, q8Phrases, pillarIntros, getLevel, getLevelLabel } from '../config/personalization'
import type { Scores } from './scoring'

// ── Colors ──
const DARK: RGB = [18, 24, 35]           // #121823
const CARD: RGB = [26, 35, 50]           // #1a2332
const CARD_ALT: RGB = [22, 30, 42]       // alternating row
const ACCENT: RGB = [0, 217, 163]        // #00d9a3
const LIGHT: RGB = [242, 244, 246]       // #f2f4f6
const SECONDARY: RGB = [136, 146, 164]   // #8892a4
const MUTED: RGB = [90, 100, 120]        // #5a6478
const RED: RGB = [239, 68, 68]
const ORANGE: RGB = [249, 115, 22]

type RGB = [number, number, number]

function scoreColor(score: number): RGB {
  if (score <= 33) return RED
  if (score <= 66) return ORANGE
  return ACCENT
}

// ── PDF Context ──
interface Ctx {
  doc: jsPDF
  y: number
  pw: number  // page width
  ph: number  // page height
  m: number   // margin
  cw: number  // content width
}

function darkPage(ctx: Ctx) {
  ctx.doc.addPage()
  ctx.doc.setFillColor(...DARK)
  ctx.doc.rect(0, 0, ctx.pw, ctx.ph, 'F')
  ctx.y = 28
}

function ensure(ctx: Ctx, h: number) {
  if (ctx.y + h > ctx.ph - 22) darkPage(ctx)
}

function text(ctx: Ctx, s: string, size: number, color: RGB, opts?: {
  bold?: boolean; x?: number; maxW?: number; align?: 'left' | 'center'
}) {
  const { doc, m, cw } = ctx
  const x = opts?.x ?? m
  const maxW = opts?.maxW ?? cw
  doc.setFontSize(size)
  doc.setTextColor(...color)
  doc.setFont('helvetica', opts?.bold ? 'bold' : 'normal')

  const lines = doc.splitTextToSize(s, maxW) as string[]
  const lh = size * 0.45

  for (const line of lines) {
    ensure(ctx, lh + 1)
    if (opts?.align === 'center') {
      doc.text(line, ctx.pw / 2, ctx.y, { align: 'center' })
    } else {
      doc.text(line, x, ctx.y)
    }
    ctx.y += lh
  }
}

function measure(ctx: Ctx, s: string, size: number, maxW: number): number {
  ctx.doc.setFontSize(size)
  return (ctx.doc.splitTextToSize(s, maxW) as string[]).length * size * 0.45
}

function gauge(ctx: Ctx, label: string, score: number) {
  const { doc, m, cw } = ctx
  ensure(ctx, 22)

  doc.setFontSize(9.5)
  doc.setTextColor(...LIGHT)
  doc.setFont('helvetica', 'bold')
  doc.text(label, m, ctx.y)

  const color = scoreColor(score)
  const { label: lvl } = getLevelLabel(score)
  doc.setTextColor(...color)
  doc.setFont('helvetica', 'normal')
  doc.text(`${score}% — ${lvl}`, m + cw, ctx.y, { align: 'right' })
  ctx.y += 5

  // bar bg
  doc.setFillColor(255, 255, 255)
  doc.setGState(doc.GState({ opacity: 0.06 }))
  doc.roundedRect(m, ctx.y, cw, 7, 3, 3, 'F')
  // bar fill
  doc.setGState(doc.GState({ opacity: 1 }))
  doc.setFillColor(...color)
  doc.roundedRect(m, ctx.y, Math.max(2, (score / 100) * cw), 7, 3, 3, 'F')
  ctx.y += 14
}

function separator(ctx: Ctx) {
  ctx.doc.setDrawColor(255, 255, 255)
  ctx.doc.setGState(ctx.doc.GState({ opacity: 0.06 }))
  ctx.doc.line(ctx.m, ctx.y, ctx.pw - ctx.m, ctx.y)
  ctx.doc.setGState(ctx.doc.GState({ opacity: 1 }))
  ctx.y += 10
}

// ══════════════════════════════════════
// MAIN EXPORT
// ══════════════════════════════════════

export function generatePdf(
  prenom: string,
  answers: Record<number, Answer>,
  scores: Scores,
): Blob {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pw = doc.internal.pageSize.getWidth()
  const ph = doc.internal.pageSize.getHeight()
  const m = 22
  const cw = pw - m * 2
  const ctx: Ctx = { doc, y: 0, pw, ph, m, cw }

  // ── COVER PAGE ──
  doc.setFillColor(...DARK)
  doc.rect(0, 0, pw, ph, 'F')

  // Logo centered
  ctx.y = 35
  doc.setFontSize(14)
  doc.setTextColor(...ACCENT)
  doc.setFont('helvetica', 'bold')
  doc.text('Clarte Expat', pw / 2, ctx.y, { align: 'center' })
  ctx.y += 25

  // Prenom
  text(ctx, `Bonjour ${prenom}`, 28, LIGHT, { bold: true, align: 'center' })
  ctx.y += 12

  // Q7 / Q8
  const q7 = (answers[7] || 'A') as Answer
  const q8 = (answers[8] || 'A') as Answer
  text(ctx, q7Phrases[q7], 10, SECONDARY, { align: 'center' })
  ctx.y += 4
  text(ctx, q8Phrases[q8], 10, SECONDARY, { align: 'center' })
  ctx.y += 22

  // Score gauges
  gauge(ctx, pillarNames[1], scores.p1)
  gauge(ctx, pillarNames[2], scores.p2)
  gauge(ctx, pillarNames[3], scores.p3)
  ctx.y += 8

  // Pillar intros
  for (const p of [1, 2, 3] as const) {
    const sc = p === 1 ? scores.p1 : p === 2 ? scores.p2 : scores.p3
    const lv = getLevel(sc)
    ensure(ctx, 22)

    // Accent left bar
    doc.setFillColor(...ACCENT)
    doc.rect(m, ctx.y - 4, 2, 12, 'F')

    text(ctx, pillarNames[p], 10, ACCENT, { bold: true, x: m + 7, maxW: cw - 7 })
    ctx.y += 2
    text(ctx, pillarIntros[p][lv], 8.5, SECONDARY, { x: m + 7, maxW: cw - 7 })
    ctx.y += 10
  }

  // ── PLAN PAGES ──
  darkPage(ctx)

  text(ctx, "Ton plan d'action en 6 etapes", 22, LIGHT, { bold: true, align: 'center' })
  ctx.y += 5
  text(ctx, "Suis ces etapes dans l'ordre pour une expatriation propre et sereine.", 9, MUTED, { align: 'center' })
  ctx.y += 18

  for (const step of steps) {
    ensure(ctx, 40)

    // Step header with accent left bar
    const hY = ctx.y
    doc.setFillColor(...ACCENT)
    doc.rect(m, hY - 5, 2.5, 16, 'F')

    text(ctx, `ETAPE ${step.number}`, 8, ACCENT, { bold: true, x: m + 8 })
    ctx.y += 1.5
    text(ctx, step.title, 14, LIGHT, { bold: true, x: m + 8, maxW: cw - 8 })
    ctx.y += 3

    let sub = step.subtitle
    if (step.milestone) sub += ` — ${step.milestone}`
    text(ctx, sub, 8.5, MUTED, { x: m + 8, maxW: cw - 8 })
    ctx.y += 12

    // Action rows as cards with alternating colors
    step.rows.forEach((row, ri) => {
      const colW = (cw - 20 - 8) / 2
      const howH = measure(ctx, row.how, 8.5, colW)
      const whyH = row.why ? measure(ctx, row.why, 8.5, colW) : 0
      const actionH = measure(ctx, row.action, 10.5, cw - 20)
      const colsH = Math.max(howH + 8, whyH + 8)
      const cardH = actionH + 8 + colsH + 12

      ensure(ctx, cardH + 6)

      // Card background — alternating
      const bg = ri % 2 === 0 ? CARD : CARD_ALT
      doc.setFillColor(...bg)
      doc.roundedRect(m, ctx.y, cw, cardH, 3, 3, 'F')

      const top = ctx.y
      ctx.y += 7

      // Action title
      text(ctx, row.action, 10.5, ACCENT, { bold: true, x: m + 10, maxW: cw - 20 })
      ctx.y += 6

      // Two columns
      const colY = ctx.y
      const lx = m + 10
      const rx = m + 10 + colW + 8

      // Left: Comment
      doc.setFontSize(7)
      doc.setTextColor(...MUTED)
      doc.setFont('helvetica', 'bold')
      doc.text('COMMENT LE FAIRE', lx, ctx.y)
      ctx.y += 4
      text(ctx, row.how, 8.5, LIGHT, { x: lx, maxW: colW })
      const leftEnd = ctx.y

      // Right: Pourquoi
      if (row.why) {
        ctx.y = colY
        doc.setFontSize(7)
        doc.setTextColor(...MUTED)
        doc.setFont('helvetica', 'bold')
        doc.text("POURQUOI C'EST IMPORTANT", rx, ctx.y)
        ctx.y += 4
        text(ctx, row.why, 8.5, LIGHT, { x: rx, maxW: colW })
      }

      ctx.y = Math.max(ctx.y, leftEnd)
      ctx.y = top + cardH + 5
    })

    // Result box
    ensure(ctx, 20)
    const rText = `Resultat : ${step.result}`
    const rLines = doc.splitTextToSize(rText, cw - 20) as string[]
    const bH = rLines.length * 4.5 + 12

    doc.setFillColor(...ACCENT)
    doc.setGState(doc.GState({ opacity: 0.1 }))
    doc.roundedRect(m, ctx.y, cw, bH, 3, 3, 'F')
    doc.setGState(doc.GState({ opacity: 1 }))

    ctx.y += 7
    doc.setFontSize(8.5)
    doc.setTextColor(...ACCENT)
    doc.setFont('helvetica', 'normal')
    for (const l of rLines) {
      doc.text(l, m + 10, ctx.y)
      ctx.y += 4.5
    }
    ctx.y += 18
  }

  // ── CHECKLIST ──
  ensure(ctx, 30)
  separator(ctx)
  ctx.y += 5

  text(ctx, 'Ta checklist complete', 18, LIGHT, { bold: true, align: 'center' })
  ctx.y += 14

  for (const cat of checklist) {
    ensure(ctx, 16)
    text(ctx, cat.title, 11, LIGHT, { bold: true })
    ctx.y += 6

    for (const item of cat.items) {
      ensure(ctx, 9)

      // Checkbox
      doc.setDrawColor(...MUTED)
      doc.setLineWidth(0.3)
      doc.roundedRect(m, ctx.y - 3.2, 4, 4, 1, 1)
      doc.setLineWidth(0.2)

      doc.setFontSize(8.5)
      doc.setTextColor(...LIGHT)
      doc.setFont('helvetica', 'normal')
      doc.text(item, m + 8, ctx.y)
      ctx.y += 7
    }
    ctx.y += 8
  }

  // ── CTA FINAL ──
  ensure(ctx, 45)
  separator(ctx)
  ctx.y += 10

  text(ctx, "Tu veux qu'on l'applique ensemble a ta situation precise ?", 11, SECONDARY, { align: 'center' })
  ctx.y += 8
  text(ctx, 'Reserve ton appel decouverte gratuit — 20 min', 14, ACCENT, { bold: true, align: 'center' })
  ctx.y += 6
  doc.setFontSize(9)
  doc.setTextColor(...MUTED)
  doc.text('https://calendly.com/clarte-expat/echange-expatriation-thailande', pw / 2, ctx.y, { align: 'center' })

  // ── FOOTER every page ──
  const total = doc.getNumberOfPages()
  for (let i = 1; i <= total; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setTextColor(...MUTED)
    doc.text('Clarte Expat — go.performiance.fr', m, ph - 10)
    doc.text(`Page ${i} / ${total}`, pw - m, ph - 10, { align: 'right' })
  }

  return doc.output('blob')
}
