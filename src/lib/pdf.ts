import jsPDF from 'jspdf'
import { steps, checklist } from '../config/plan-data'
import { pillarNames, type Answer } from '../config/questions'
import { q7Phrases, q8Phrases, pillarIntros, getLevel, getLevelLabel } from '../config/personalization'
import type { Scores } from './scoring'

// ── Colors ──
const DARK = [18, 24, 35] as const       // #121823
const ACCENT = [0, 217, 163] as const    // #00d9a3
const LIGHT = [242, 244, 246] as const   // #f2f4f6
const MUTED = [160, 165, 175] as const   // light/60
const RED = [239, 68, 68] as const
const ORANGE = [245, 158, 11] as const

type RGB = readonly [number, number, number]

function scoreColor(score: number): RGB {
  if (score <= 33) return RED
  if (score <= 66) return ORANGE
  return ACCENT
}

// ── PDF Builder ──

interface PdfContext {
  doc: jsPDF
  y: number
  pageW: number
  pageH: number
  margin: number
  contentW: number
}

function checkPage(ctx: PdfContext, needed: number) {
  if (ctx.y + needed > ctx.pageH - 25) {
    ctx.doc.addPage()
    // Dark background
    ctx.doc.setFillColor(...DARK)
    ctx.doc.rect(0, 0, ctx.pageW, ctx.pageH, 'F')
    ctx.y = 25
  }
}

function addWrappedText(ctx: PdfContext, text: string, fontSize: number, color: RGB, opts?: { bold?: boolean; maxWidth?: number }) {
  const { doc } = ctx
  const maxW = opts?.maxWidth || ctx.contentW
  doc.setFontSize(fontSize)
  doc.setTextColor(...color)
  doc.setFont('helvetica', opts?.bold ? 'bold' : 'normal')

  const lines = doc.splitTextToSize(text, maxW) as string[]
  const lineH = fontSize * 0.45

  for (const line of lines) {
    checkPage(ctx, lineH + 2)
    doc.text(line, ctx.margin, ctx.y)
    ctx.y += lineH
  }
}

function addGauge(ctx: PdfContext, label: string, score: number) {
  const { doc, margin } = ctx
  const barH = 6
  const barW = ctx.contentW - 90

  checkPage(ctx, 18)

  // Label
  doc.setFontSize(9)
  doc.setTextColor(...LIGHT)
  doc.setFont('helvetica', 'bold')
  doc.text(label, margin, ctx.y)

  // Score text
  const { label: levelLabel } = getLevelLabel(score)
  const color = scoreColor(score)
  doc.setTextColor(...color)
  doc.setFont('helvetica', 'normal')
  doc.text(`${score}% — ${levelLabel}`, margin + ctx.contentW - 50, ctx.y, { align: 'right' })

  ctx.y += 4

  // Bar background
  doc.setFillColor(255, 255, 255)
  doc.setGState(doc.GState({ opacity: 0.1 }))
  doc.roundedRect(margin, ctx.y, barW, barH, 3, 3, 'F')

  // Bar fill
  doc.setGState(doc.GState({ opacity: 1 }))
  const fillW = Math.max(1, (score / 100) * barW)
  doc.setFillColor(...color)
  doc.roundedRect(margin, ctx.y, fillW, barH, 3, 3, 'F')

  ctx.y += barH + 8
}

// ── Main Export ──

export function generatePdf(
  prenom: string,
  answers: Record<number, Answer>,
  scores: Scores,
): Blob {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentW = pageW - margin * 2

  const ctx: PdfContext = { doc, y: 0, pageW, pageH, margin, contentW }

  // ── Page 1 background ──
  doc.setFillColor(...DARK)
  doc.rect(0, 0, pageW, pageH, 'F')

  // ── Header ──
  ctx.y = 25
  doc.setFontSize(11)
  doc.setTextColor(...ACCENT)
  doc.setFont('helvetica', 'bold')
  doc.text('Clarte Expat', margin, ctx.y)
  ctx.y += 15

  // ── Score gauges ──
  addGauge(ctx, pillarNames[1], scores.p1)
  addGauge(ctx, pillarNames[2], scores.p2)
  addGauge(ctx, pillarNames[3], scores.p3)
  ctx.y += 5

  // ── Personalized header ──
  addWrappedText(ctx, `Bonjour ${prenom}`, 22, LIGHT, { bold: true })
  ctx.y += 6

  const q7 = (answers[7] || 'A') as Answer
  const q8 = (answers[8] || 'A') as Answer
  addWrappedText(ctx, q7Phrases[q7], 10, MUTED)
  ctx.y += 3
  addWrappedText(ctx, q8Phrases[q8], 10, MUTED)
  ctx.y += 10

  // ── Pillar intros ──
  for (const pillar of [1, 2, 3] as const) {
    const score = pillar === 1 ? scores.p1 : pillar === 2 ? scores.p2 : scores.p3
    const level = getLevel(score)

    checkPage(ctx, 25)

    // Pillar name
    addWrappedText(ctx, pillarNames[pillar], 11, ACCENT, { bold: true })
    ctx.y += 2
    addWrappedText(ctx, pillarIntros[pillar][level], 9, MUTED)
    ctx.y += 8
  }

  // ── Separator ──
  ctx.y += 5
  doc.setDrawColor(255, 255, 255)
  doc.setGState(doc.GState({ opacity: 0.1 }))
  doc.line(margin, ctx.y, pageW - margin, ctx.y)
  doc.setGState(doc.GState({ opacity: 1 }))
  ctx.y += 10

  // ── Title ──
  addWrappedText(ctx, "Ton plan d'action en 6 etapes", 18, LIGHT, { bold: true })
  ctx.y += 10

  // ── Steps ──
  for (const step of steps) {
    checkPage(ctx, 30)

    // Step header
    addWrappedText(ctx, `ETAPE ${step.number}`, 8, ACCENT, { bold: true })
    ctx.y += 1
    addWrappedText(ctx, step.title, 13, LIGHT, { bold: true })
    ctx.y += 2

    let subtitle = step.subtitle
    if (step.milestone) subtitle += ` — ${step.milestone}`
    addWrappedText(ctx, subtitle, 9, MUTED)
    ctx.y += 6

    // Rows
    for (const row of step.rows) {
      checkPage(ctx, 25)

      // Action name
      addWrappedText(ctx, row.action, 10, ACCENT, { bold: true })
      ctx.y += 2

      // How
      doc.setFontSize(8)
      doc.setTextColor(...MUTED)
      doc.setFont('helvetica', 'bold')
      doc.text('Comment le faire', margin, ctx.y)
      ctx.y += 3.5
      addWrappedText(ctx, row.how, 8.5, LIGHT)
      ctx.y += 3

      // Why
      if (row.why) {
        doc.setFontSize(8)
        doc.setTextColor(...MUTED)
        doc.setFont('helvetica', 'bold')
        doc.text("Pourquoi c'est important", margin, ctx.y)
        ctx.y += 3.5
        addWrappedText(ctx, row.why, 8.5, LIGHT)
        ctx.y += 5
      }
    }

    // Result box
    checkPage(ctx, 15)
    doc.setFillColor(...ACCENT)
    doc.setGState(doc.GState({ opacity: 0.1 }))
    const resultLines = doc.splitTextToSize(`Resultat : ${step.result}`, contentW - 10) as string[]
    const boxH = resultLines.length * 4.5 + 6
    doc.roundedRect(margin, ctx.y, contentW, boxH, 3, 3, 'F')
    doc.setGState(doc.GState({ opacity: 1 }))

    ctx.y += 5
    doc.setFontSize(8.5)
    doc.setTextColor(...ACCENT)
    doc.setFont('helvetica', 'normal')
    for (const line of resultLines) {
      doc.text(line, margin + 5, ctx.y)
      ctx.y += 4.5
    }
    ctx.y += 8
  }

  // ── Separator ──
  checkPage(ctx, 20)
  doc.setDrawColor(255, 255, 255)
  doc.setGState(doc.GState({ opacity: 0.1 }))
  doc.line(margin, ctx.y, pageW - margin, ctx.y)
  doc.setGState(doc.GState({ opacity: 1 }))
  ctx.y += 10

  // ── Checklist ──
  addWrappedText(ctx, 'Ta checklist complete', 16, LIGHT, { bold: true })
  ctx.y += 8

  for (const cat of checklist) {
    checkPage(ctx, 15)

    addWrappedText(ctx, `${cat.title}`, 11, LIGHT, { bold: true })
    ctx.y += 4

    for (const item of cat.items) {
      checkPage(ctx, 7)

      // Checkbox square
      doc.setDrawColor(...LIGHT)
      doc.setGState(doc.GState({ opacity: 0.3 }))
      doc.rect(margin, ctx.y - 3, 3.5, 3.5)
      doc.setGState(doc.GState({ opacity: 1 }))

      // Item text
      doc.setFontSize(8.5)
      doc.setTextColor(...LIGHT)
      doc.setFont('helvetica', 'normal')
      doc.text(item, margin + 6, ctx.y)
      ctx.y += 5.5
    }

    ctx.y += 4
  }

  // ── CTA final ──
  checkPage(ctx, 35)
  ctx.y += 5

  addWrappedText(ctx, "Tu veux qu'on l'applique ensemble a ta situation precise ?", 11, MUTED)
  ctx.y += 5
  addWrappedText(ctx, 'Reserve ton appel decouverte gratuit — 20 min', 12, ACCENT, { bold: true })
  ctx.y += 4
  doc.setFontSize(8)
  doc.setTextColor(...MUTED)
  doc.text('https://calendly.com/clarte-expat/echange-expatriation-thailande', margin, ctx.y)

  // ── Footer on every page ──
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setTextColor(...MUTED)
    doc.text('Clarte Expat — go.performiance.fr', margin, pageH - 10)
    doc.text(`${i}/${totalPages}`, pageW - margin, pageH - 10, { align: 'right' })
  }

  return doc.output('blob')
}
