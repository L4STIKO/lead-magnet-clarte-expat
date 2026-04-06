import jsPDF from 'jspdf'
import { steps, checklist } from '../config/plan-data'
import { pillarNames, type Answer } from '../config/questions'
import { q7Phrases, q8Phrases, pillarIntros, getLevel, getLevelLabel } from '../config/personalization'
import type { Scores } from './scoring'

// ── Colors ──
const DARK = [18, 24, 35] as const       // #121823
const CARD = [28, 35, 50] as const       // slightly lighter for cards
const ACCENT = [0, 217, 163] as const    // #00d9a3
const LIGHT = [242, 244, 246] as const   // #f2f4f6
const MUTED = [160, 165, 175] as const
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

function newPage(ctx: PdfContext) {
  ctx.doc.addPage()
  ctx.doc.setFillColor(...DARK)
  ctx.doc.rect(0, 0, ctx.pageW, ctx.pageH, 'F')
  ctx.y = 25
}

function checkPage(ctx: PdfContext, needed: number) {
  if (ctx.y + needed > ctx.pageH - 20) {
    newPage(ctx)
  }
}

function addText(ctx: PdfContext, text: string, fontSize: number, color: RGB, opts?: { bold?: boolean; maxWidth?: number; align?: 'left' | 'center'; x?: number }) {
  const { doc } = ctx
  const maxW = opts?.maxWidth || ctx.contentW
  const x = opts?.x ?? ctx.margin
  doc.setFontSize(fontSize)
  doc.setTextColor(...color)
  doc.setFont('helvetica', opts?.bold ? 'bold' : 'normal')

  const lines = doc.splitTextToSize(text, maxW) as string[]
  const lineH = fontSize * 0.45

  for (const line of lines) {
    checkPage(ctx, lineH + 2)
    if (opts?.align === 'center') {
      doc.text(line, ctx.pageW / 2, ctx.y, { align: 'center' })
    } else {
      doc.text(line, x, ctx.y)
    }
    ctx.y += lineH
  }
}

function addGauge(ctx: PdfContext, label: string, score: number) {
  const { doc, margin } = ctx
  const barH = 7
  const barW = ctx.contentW

  checkPage(ctx, 20)

  // Label
  doc.setFontSize(9)
  doc.setTextColor(...LIGHT)
  doc.setFont('helvetica', 'bold')
  doc.text(label, margin, ctx.y)

  // Score text right-aligned
  const { label: levelLabel } = getLevelLabel(score)
  const color = scoreColor(score)
  doc.setTextColor(...color)
  doc.setFont('helvetica', 'normal')
  doc.text(`${score}% — ${levelLabel}`, margin + barW, ctx.y, { align: 'right' })

  ctx.y += 5

  // Bar background
  doc.setFillColor(255, 255, 255)
  doc.setGState(doc.GState({ opacity: 0.08 }))
  doc.roundedRect(margin, ctx.y, barW, barH, 3, 3, 'F')

  // Bar fill
  doc.setGState(doc.GState({ opacity: 1 }))
  const fillW = Math.max(2, (score / 100) * barW)
  doc.setFillColor(...color)
  doc.roundedRect(margin, ctx.y, fillW, barH, 3, 3, 'F')

  ctx.y += barH + 10
}

function drawSeparator(ctx: PdfContext) {
  ctx.doc.setDrawColor(255, 255, 255)
  ctx.doc.setGState(ctx.doc.GState({ opacity: 0.08 }))
  ctx.doc.line(ctx.margin, ctx.y, ctx.pageW - ctx.margin, ctx.y)
  ctx.doc.setGState(ctx.doc.GState({ opacity: 1 }))
  ctx.y += 8
}

// Measure how tall wrapped text will be without drawing it
function measureText(ctx: PdfContext, text: string, fontSize: number, maxW: number): number {
  ctx.doc.setFontSize(fontSize)
  const lines = ctx.doc.splitTextToSize(text, maxW) as string[]
  return lines.length * fontSize * 0.45
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

  // ══════════════════════════════════════
  // COVER PAGE
  // ��═════════════════════════════════════
  doc.setFillColor(...DARK)
  doc.rect(0, 0, pageW, pageH, 'F')

  // Logo
  ctx.y = 30
  doc.setFontSize(14)
  doc.setTextColor(...ACCENT)
  doc.setFont('helvetica', 'bold')
  doc.text('Clarte Expat', pageW / 2, ctx.y, { align: 'center' })
  ctx.y += 20

  // Prenom
  addText(ctx, `Bonjour ${prenom}`, 26, LIGHT, { bold: true, align: 'center' })
  ctx.y += 10

  // Q7 / Q8 phrases
  const q7 = (answers[7] || 'A') as Answer
  const q8 = (answers[8] || 'A') as Answer
  addText(ctx, q7Phrases[q7], 10, MUTED, { align: 'center' })
  ctx.y += 4
  addText(ctx, q8Phrases[q8], 10, MUTED, { align: 'center' })
  ctx.y += 18

  // Score gauges
  addGauge(ctx, pillarNames[1], scores.p1)
  addGauge(ctx, pillarNames[2], scores.p2)
  addGauge(ctx, pillarNames[3], scores.p3)
  ctx.y += 5

  // Pillar intros
  for (const pillar of [1, 2, 3] as const) {
    const score = pillar === 1 ? scores.p1 : pillar === 2 ? scores.p2 : scores.p3
    const level = getLevel(score)

    checkPage(ctx, 22)
    addText(ctx, pillarNames[pillar], 10, ACCENT, { bold: true })
    ctx.y += 2
    addText(ctx, pillarIntros[pillar][level], 9, MUTED)
    ctx.y += 8
  }

  // ══════════════════════════════════════
  // PLAN CONTENT — starts on new page
  // ═══════════��══════════════════════════
  newPage(ctx)

  addText(ctx, "Ton plan d'action en 6 etapes", 20, LIGHT, { bold: true, align: 'center' })
  ctx.y += 4
  addText(ctx, "Suis ces etapes dans l'ordre pour une expatriation propre et sereine.", 9, MUTED, { align: 'center' })
  ctx.y += 15

  // ── Steps ──
  for (const step of steps) {
    checkPage(ctx, 35)

    // Step number + title with accent left border
    const stepHeaderY = ctx.y
    doc.setFillColor(...ACCENT)
    doc.rect(margin, stepHeaderY - 5, 2, 14, 'F')

    addText(ctx, `ETAPE ${step.number}`, 8, ACCENT, { bold: true, x: margin + 6 })
    ctx.y += 1
    addText(ctx, step.title, 13, LIGHT, { bold: true, x: margin + 6, maxWidth: contentW - 6 })
    ctx.y += 3

    let subtitle = step.subtitle
    if (step.milestone) subtitle += ` — ${step.milestone}`
    addText(ctx, subtitle, 9, MUTED, { x: margin + 6, maxWidth: contentW - 6 })
    ctx.y += 10

    // Action rows as cards
    for (const row of step.rows) {
      // Measure card height
      const colW = (contentW - 16 - 6) / 2  // two columns with padding and gap
      const actionH = measureText(ctx, row.action, 10, contentW - 16)
      const howH = measureText(ctx, row.how, 8.5, colW)
      const whyH = row.why ? measureText(ctx, row.why, 8.5, colW) : 0
      const labelH = 4
      const columnsH = Math.max(howH + labelH + 2, whyH + labelH + 2)
      const cardH = actionH + 6 + columnsH + 10

      checkPage(ctx, cardH + 4)

      // Card background
      doc.setFillColor(...CARD)
      doc.roundedRect(margin, ctx.y, contentW, cardH, 3, 3, 'F')

      const cardTop = ctx.y
      ctx.y += 6

      // Action title
      addText(ctx, row.action, 10, ACCENT, { bold: true, x: margin + 8, maxWidth: contentW - 16 })
      ctx.y += 5

      // Two-column layout
      const colStartY = ctx.y
      const leftX = margin + 8
      const rightX = margin + 8 + colW + 6

      // Left column: Comment
      doc.setFontSize(7)
      doc.setTextColor(...MUTED)
      doc.setFont('helvetica', 'bold')
      doc.text('COMMENT LE FAIRE', leftX, ctx.y)
      ctx.y += labelH
      addText(ctx, row.how, 8.5, LIGHT, { x: leftX, maxWidth: colW })

      // Right column: Pourquoi (reset Y to column start)
      if (row.why) {
        const leftEndY = ctx.y
        ctx.y = colStartY
        doc.setFontSize(7)
        doc.setTextColor(...MUTED)
        doc.setFont('helvetica', 'bold')
        doc.text("POURQUOI C'EST IMPORTANT", rightX, ctx.y)
        ctx.y += labelH
        addText(ctx, row.why, 8.5, LIGHT, { x: rightX, maxWidth: colW })

        // Take the taller column
        ctx.y = Math.max(ctx.y, leftEndY)
      }

      ctx.y = cardTop + cardH + 5
    }

    // Result box
    checkPage(ctx, 18)
    const resultText = `Resultat : ${step.result}`
    const resultLines = doc.splitTextToSize(resultText, contentW - 16) as string[]
    const boxH = resultLines.length * 4.5 + 10

    doc.setFillColor(...ACCENT)
    doc.setGState(doc.GState({ opacity: 0.1 }))
    doc.roundedRect(margin, ctx.y, contentW, boxH, 3, 3, 'F')
    doc.setGState(doc.GState({ opacity: 1 }))

    ctx.y += 6
    doc.setFontSize(8.5)
    doc.setTextColor(...ACCENT)
    doc.setFont('helvetica', 'normal')
    for (const line of resultLines) {
      doc.text(line, margin + 8, ctx.y)
      ctx.y += 4.5
    }
    ctx.y += 15
  }

  // ══════════════════════════════════════
  // CHECKLIST
  // ═══════════════��══════════════════════
  checkPage(ctx, 25)
  drawSeparator(ctx)
  ctx.y += 5

  addText(ctx, 'Ta checklist complete', 16, LIGHT, { bold: true, align: 'center' })
  ctx.y += 12

  for (const cat of checklist) {
    checkPage(ctx, 18)

    addText(ctx, cat.title, 11, LIGHT, { bold: true })
    ctx.y += 5

    for (const item of cat.items) {
      checkPage(ctx, 8)

      // Checkbox
      doc.setDrawColor(...MUTED)
      doc.setLineWidth(0.3)
      doc.roundedRect(margin, ctx.y - 3.2, 3.8, 3.8, 0.8, 0.8)
      doc.setLineWidth(0.2)

      // Item text
      doc.setFontSize(8.5)
      doc.setTextColor(...LIGHT)
      doc.setFont('helvetica', 'normal')
      doc.text(item, margin + 7, ctx.y)
      ctx.y += 6.5
    }

    ctx.y += 6
  }

  // ══��═══════════════════════════════════
  // CTA FINAL
  // ═══════════════════���══════════════════
  checkPage(ctx, 40)
  drawSeparator(ctx)
  ctx.y += 8

  addText(ctx, "Tu veux qu'on l'applique ensemble a ta situation precise ?", 11, MUTED, { align: 'center' })
  ctx.y += 6
  addText(ctx, 'Reserve ton appel decouverte gratuit — 20 min', 13, ACCENT, { bold: true, align: 'center' })
  ctx.y += 5
  doc.setFontSize(9)
  doc.setTextColor(...MUTED)
  doc.text('https://calendly.com/clarte-expat/echange-expatriation-thailande', pageW / 2, ctx.y, { align: 'center' })

  // ═══════════════════════════��══════════
  // FOOTER on every page
  // ═══════════════════���══════════════════
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setTextColor(...MUTED)
    doc.text('Clarte Expat — go.performiance.fr', margin, pageH - 10)
    doc.text(`${i} / ${totalPages}`, pageW - margin, pageH - 10, { align: 'right' })
  }

  return doc.output('blob')
}
