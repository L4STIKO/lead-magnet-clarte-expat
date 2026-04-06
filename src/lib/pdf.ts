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

// ── CORRECTION 1: sanitize accents ──
function sanitize(s: string): string {
  return s
    .replace(/é|è|ê|ë/g, 'e')
    .replace(/à|â|ä/g, 'a')
    .replace(/ù|û|ü/g, 'u')
    .replace(/î|ï/g, 'i')
    .replace(/ô|ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/É|È|Ê/g, 'E')
    .replace(/À|Â/g, 'A')
    .replace(/Ù|Û/g, 'U')
    .replace(/Î/g, 'I')
    .replace(/Ô/g, 'O')
    .replace(/Ç/g, 'C')
    .replace(/«|»/g, '"')
    .replace(/\u2019/g, "'")
    .replace(/\u2014/g, '-')
}

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

  const lines = doc.splitTextToSize(sanitize(s), maxW) as string[]
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

function gauge(ctx: Ctx, label: string, score: number) {
  const { doc, m, cw } = ctx
  ensure(ctx, 22)

  doc.setFontSize(9.5)
  doc.setTextColor(...LIGHT)
  doc.setFont('helvetica', 'bold')
  doc.text(sanitize(label), m, ctx.y)

  const color = scoreColor(score)
  const { label: lvl } = getLevelLabel(score)
  doc.setTextColor(...color)
  doc.setFont('helvetica', 'normal')
  doc.text(sanitize(`${score}% - ${lvl}`), m + cw, ctx.y, { align: 'right' })
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

interface TableRow {
  action: string
  how: string
  why: string
}

// ── CORRECTION 5: increased padding in drawTable ──
function drawTable(ctx: Ctx, rows: TableRow[]) {
  const { doc, m, cw } = ctx
  const cellPadX = 8
  const cellPadY = 12
  const lh = 4.8
  const col1W = cw * 0.25
  const col2W = cw * 0.45
  const col3W = cw * 0.30
  const col1X = m + cellPadX
  const col2X = m + col1W + cellPadX
  const col3X = m + col1W + col2W + cellPadX
  const innerCol1 = col1W - cellPadX * 2
  const innerCol2 = col2W - cellPadX * 2
  const innerCol3 = col3W - cellPadX * 2

  // ── Header row ──
  ensure(ctx, 14)
  doc.setFillColor(255, 255, 255)
  doc.setGState(doc.GState({ opacity: 0.06 }))
  doc.rect(m, ctx.y, cw, 10, 'F')
  doc.setGState(doc.GState({ opacity: 1 }))

  const headerY = ctx.y + 7
  doc.setFontSize(7)
  doc.setTextColor(...MUTED)
  doc.setFont('helvetica', 'bold')
  doc.text(sanitize('CE QUE TU FAIS'), col1X, headerY)
  doc.text(sanitize('COMMENT LE FAIRE'), col2X, headerY)
  doc.text(sanitize("POURQUOI C'EST IMPORTANT"), col3X, headerY)
  ctx.y += 10

  // Header accent line
  doc.setDrawColor(...ACCENT)
  doc.setGState(doc.GState({ opacity: 0.3 }))
  doc.setLineWidth(0.5)
  doc.line(m, ctx.y, m + cw, ctx.y)
  doc.setGState(doc.GState({ opacity: 1 }))
  doc.setLineWidth(0.2)

  // ── Data rows ──
  rows.forEach((row, ri) => {
    // Measure row height with new lh and padding
    doc.setFontSize(9)
    const actionLines = doc.splitTextToSize(sanitize(row.action), innerCol1) as string[]
    doc.setFontSize(8.5)
    const howLines = doc.splitTextToSize(sanitize(row.how), innerCol2) as string[]
    const whyLines = row.why ? doc.splitTextToSize(sanitize(row.why), innerCol3) as string[] : []

    const h1 = actionLines.length * lh + cellPadY * 2 + 4
    const h2 = howLines.length * lh + cellPadY * 2 + 4
    const h3 = whyLines.length > 0 ? whyLines.length * lh + cellPadY * 2 + 4 : 0
    const rowH = Math.max(h1, h2, h3)

    ensure(ctx, rowH + 6)

    // Alternating background
    const bg = ri % 2 === 0 ? CARD : CARD_ALT
    doc.setFillColor(...bg)
    doc.rect(m, ctx.y, cw, rowH, 'F')

    const cellTop = ctx.y + cellPadY

    // Col 1: action
    doc.setFontSize(9)
    doc.setTextColor(...LIGHT)
    doc.setFont('helvetica', 'bold')
    let drawY = cellTop
    for (const line of actionLines) {
      doc.text(line, col1X, drawY)
      drawY += lh
    }

    // Col 2: how
    doc.setFontSize(8.5)
    doc.setTextColor(...SECONDARY)
    doc.setFont('helvetica', 'normal')
    drawY = cellTop
    for (const line of howLines) {
      doc.text(line, col2X, drawY)
      drawY += lh
    }

    // Col 3: why (italic)
    if (whyLines.length > 0) {
      doc.setFontSize(8.5)
      doc.setTextColor(...MUTED)
      doc.setFont('helvetica', 'italic')
      drawY = cellTop
      for (const line of whyLines) {
        doc.text(line, col3X, drawY)
        drawY += lh
      }
    }

    ctx.y += rowH + 4 // 4px gap between rows

    // Row separator
    if (ri < rows.length - 1) {
      doc.setDrawColor(255, 255, 255)
      doc.setGState(doc.GState({ opacity: 0.04 }))
      doc.line(m, ctx.y - 4, m + cw, ctx.y - 4)
      doc.setGState(doc.GState({ opacity: 1 }))
    }
  })
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

  // ══════════════════════════════════════
  // CORRECTION 2: COVER PAGE
  // ══════════════════════════════════════
  doc.setFillColor(...DARK)
  doc.rect(0, 0, pw, ph, 'F')

  // Logo centered
  ctx.y = 28
  doc.setFontSize(14)
  doc.setTextColor(...ACCENT)
  doc.setFont('helvetica', 'bold')
  doc.text(sanitize('Clarte Expat'), pw / 2, ctx.y, { align: 'center' })

  // Accent line under logo
  ctx.y = 36
  doc.setDrawColor(...ACCENT)
  doc.setLineWidth(1)
  doc.line(pw / 2 - 20, ctx.y, pw / 2 + 20, ctx.y)
  doc.setLineWidth(0.2)

  // "Bonjour [Prenom]"
  ctx.y = 52
  doc.setFontSize(32)
  doc.setTextColor(...LIGHT)
  doc.setFont('helvetica', 'bold')
  doc.text(sanitize(`Bonjour ${prenom}`), pw / 2, ctx.y, { align: 'center' })

  // Score global
  const globalColor = scoreColor(scores.global)
  ctx.y = 72
  doc.setFontSize(52)
  doc.setTextColor(...globalColor)
  doc.setFont('helvetica', 'bold')
  doc.text(`${scores.global}%`, pw / 2, ctx.y, { align: 'center' })

  // Label "TON SCORE GLOBAL"
  ctx.y = 82
  doc.setFontSize(9)
  doc.setTextColor(...MUTED)
  doc.setFont('helvetica', 'bold')
  doc.text(sanitize('TON SCORE GLOBAL'), pw / 2, ctx.y, { align: 'center' })

  // Score bar global
  ctx.y = 88
  const barW = 120
  const barX = (pw - barW) / 2
  doc.setFillColor(255, 255, 255)
  doc.setGState(doc.GState({ opacity: 0.06 }))
  doc.roundedRect(barX, ctx.y, barW, 6, 3, 3, 'F')
  doc.setGState(doc.GState({ opacity: 1 }))
  doc.setFillColor(...globalColor)
  doc.roundedRect(barX, ctx.y, Math.max(2, (scores.global / 100) * barW), 6, 3, 3, 'F')

  // Space 16px
  ctx.y = 108

  // Q7 phrase
  const q7 = (answers[7] || 'A') as Answer
  const q8 = (answers[8] || 'A') as Answer
  doc.setFontSize(10)
  doc.setTextColor(...SECONDARY)
  doc.setFont('helvetica', 'normal')
  const q7Lines = doc.splitTextToSize(sanitize(q7Phrases[q7]), 140) as string[]
  for (const line of q7Lines) {
    doc.text(line, pw / 2, ctx.y, { align: 'center' })
    ctx.y += 4.5
  }

  // Space 6px
  ctx.y += 6

  // Q8 phrase
  const q8Lines = doc.splitTextToSize(sanitize(q8Phrases[q8]), 140) as string[]
  for (const line of q8Lines) {
    doc.text(line, pw / 2, ctx.y, { align: 'center' })
    ctx.y += 4.5
  }

  // Space 20px
  ctx.y += 20

  // Separator
  doc.setDrawColor(255, 255, 255)
  doc.setGState(doc.GState({ opacity: 0.1 }))
  doc.line(m, ctx.y, pw - m, ctx.y)
  doc.setGState(doc.GState({ opacity: 1 }))

  // Space 14px
  ctx.y += 14

  // 3 pillar gauges
  gauge(ctx, pillarNames[1], scores.p1)
  gauge(ctx, pillarNames[2], scores.p2)
  gauge(ctx, pillarNames[3], scores.p3)

  // ══════════════════════════════════════
  // PLAN PAGES — organized by pillar
  // ══════════════════════════════════════
  darkPage(ctx)

  text(ctx, "Ton plan d'action en 6 etapes", 22, LIGHT, { bold: true, align: 'center' })
  ctx.y += 5
  text(ctx, "Suis ces etapes dans l'ordre pour une expatriation propre et sereine.", 9, MUTED, { align: 'center' })
  ctx.y += 18

  const pillars = [
    { num: 1 as const, name: pillarNames[1], score: scores.p1, stepNumbers: [1, 2] },
    { num: 2 as const, name: pillarNames[2], score: scores.p2, stepNumbers: [3] },
    { num: 3 as const, name: pillarNames[3], score: scores.p3, stepNumbers: [4, 5, 6] },
  ]

  for (const pillar of pillars) {
    const level = getLevel(pillar.score)

    // ══════════════════════════════════════
    // CORRECTION 3: PILLAR HEADER
    // ══════════════════════════════════════
    const intro = pillarIntros[pillar.num][level]
    doc.setFontSize(8.5)
    const introLines = doc.splitTextToSize(sanitize(intro), cw - 18) as string[]
    const cardH = 28 + introLines.length * 4.5 + 8
    ensure(ctx, cardH + 14)

    doc.setFillColor(...CARD)
    doc.roundedRect(m, ctx.y, cw, cardH, 4, 4, 'F')

    // Accent left bar
    doc.setFillColor(...ACCENT)
    doc.rect(m, ctx.y, 4, cardH, 'F')

    // Badge "PILIER X"
    doc.setFillColor(...ACCENT)
    doc.setGState(doc.GState({ opacity: 0.15 }))
    doc.roundedRect(m + 12, ctx.y + 8, 36, 10, 3, 3, 'F')
    doc.setGState(doc.GState({ opacity: 1 }))
    doc.setFontSize(7.5)
    doc.setTextColor(...ACCENT)
    doc.setFont('helvetica', 'bold')
    doc.text(sanitize(`PILIER ${pillar.num}`), m + 14, ctx.y + 15)

    // Pillar name
    doc.setFontSize(14)
    doc.setTextColor(...LIGHT)
    doc.setFont('helvetica', 'bold')
    doc.text(sanitize(pillar.name), m + 52, ctx.y + 15)

    // Personalized phrase
    doc.setFontSize(8.5)
    doc.setTextColor(...SECONDARY)
    doc.setFont('helvetica', 'italic')
    introLines.forEach((line: string, i: number) => {
      doc.text(line, m + 12, ctx.y + 28 + i * 4.5)
    })

    ctx.y += cardH + 14

    // ── Steps within this pillar ──
    for (const stepNum of pillar.stepNumbers) {
      const step = steps[stepNum - 1]

      // ══════════════════════════════════════
      // CORRECTION 4: STEP HEADER
      // ══════════════════════════════════════
      ensure(ctx, 28)
      doc.setFillColor(255, 255, 255)
      doc.setGState(doc.GState({ opacity: 0.04 }))
      doc.roundedRect(m, ctx.y, cw, 26, 3, 3, 'F')
      doc.setGState(doc.GState({ opacity: 1 }))

      // Step number
      doc.setFontSize(8)
      doc.setTextColor(...ACCENT)
      doc.setFont('helvetica', 'bold')
      doc.text(sanitize(`ETAPE ${step.number}`), m + 10, ctx.y + 10)

      // Step title
      doc.setFontSize(12)
      doc.setTextColor(...LIGHT)
      doc.setFont('helvetica', 'bold')
      doc.text(sanitize(step.title), m + 10, ctx.y + 20)

      ctx.y += 26

      // Subtitle + milestone
      if (step.subtitle || step.milestone) {
        let sub = step.subtitle
        if (step.milestone) sub += ` - ${step.milestone}`
        doc.setFontSize(8)
        doc.setTextColor(...MUTED)
        doc.setFont('helvetica', 'italic')
        const subLines = doc.splitTextToSize(sanitize(sub), cw - 10) as string[]
        subLines.forEach((l: string) => { doc.text(l, m + 10, ctx.y); ctx.y += 4.2 })
      }
      ctx.y += 10

      // Table
      drawTable(ctx, step.rows)
      ctx.y += 6

      // ══════════════════════════════════════
      // CORRECTION 6: RESULT BOX
      // ══════════════════════════════════════
      ensure(ctx, 22)
      const rText = sanitize(`Resultat : ${step.result}`)
      const rLines = doc.splitTextToSize(rText, cw - 20) as string[]
      const bH = rLines.length * 5 + 16

      // Background
      doc.setFillColor(...ACCENT)
      doc.setGState(doc.GState({ opacity: 0.12 }))
      doc.roundedRect(m, ctx.y, cw, bH, 3, 3, 'F')
      doc.setGState(doc.GState({ opacity: 1 }))

      // Left bar
      doc.setFillColor(...ACCENT)
      doc.rect(m, ctx.y, 3.5, bH, 'F')

      // "Resultat :" in bold accent
      ctx.y += 10
      doc.setFontSize(9)
      doc.setTextColor(...ACCENT)
      doc.setFont('helvetica', 'bold')
      doc.text(sanitize('Resultat :'), m + 10, ctx.y)

      // Result text
      doc.setFont('helvetica', 'normal')
      const resultOnly = sanitize(step.result)
      const resultLines = doc.splitTextToSize(resultOnly, cw - 32) as string[]
      resultLines.forEach((l: string) => {
        doc.text(l, m + 32, ctx.y)
        ctx.y += 5
      })
      ctx.y += 14
    }

    // Space between pillars
    ctx.y += 6
  }

  // ══════════════════════════════════════
  // CORRECTION 8: CHECKLIST SPACING
  // ══════════════════════════════════════
  ensure(ctx, 30)
  separator(ctx)
  ctx.y += 5

  text(ctx, 'Ta checklist complete', 18, LIGHT, { bold: true, align: 'center' })
  ctx.y += 14

  for (const cat of checklist) {
    ensure(ctx, 20)

    // Category title with background
    doc.setFillColor(255, 255, 255)
    doc.setGState(doc.GState({ opacity: 0.04 }))
    doc.roundedRect(m, ctx.y - 5, cw, 16, 3, 3, 'F')
    doc.setGState(doc.GState({ opacity: 1 }))

    doc.setFontSize(12)
    doc.setTextColor(...LIGHT)
    doc.setFont('helvetica', 'bold')
    doc.text(sanitize(cat.title), m + 8, ctx.y + 4)
    ctx.y += 16

    for (const item of cat.items) {
      ensure(ctx, 11)

      // Checkbox 5x5
      doc.setDrawColor(...MUTED)
      doc.setLineWidth(0.3)
      doc.roundedRect(m, ctx.y - 3.5, 5, 5, 1, 1)
      doc.setLineWidth(0.2)

      doc.setFontSize(8.5)
      doc.setTextColor(...LIGHT)
      doc.setFont('helvetica', 'normal')
      doc.text(sanitize(item), m + 9, ctx.y)
      ctx.y += 9
    }
    ctx.y += 14
  }

  // ══════════════════════════════════════
  // CORRECTION 7: CTA FINAL
  // ══════════════════════════════════════
  ensure(ctx, 55)
  separator(ctx)
  ctx.y += 12

  // Card CTA
  const ctaH = 48
  doc.setFillColor(...ACCENT)
  doc.setGState(doc.GState({ opacity: 0.08 }))
  doc.roundedRect(m, ctx.y, cw, ctaH, 6, 6, 'F')
  doc.setGState(doc.GState({ opacity: 1 }))
  doc.setDrawColor(...ACCENT)
  doc.setLineWidth(0.5)
  doc.roundedRect(m, ctx.y, cw, ctaH, 6, 6)
  doc.setLineWidth(0.2)

  // CTA text
  doc.setFontSize(11)
  doc.setTextColor(...LIGHT)
  doc.setFont('helvetica', 'bold')
  doc.text(
    sanitize("Tu veux qu'on l'applique ensemble a ta situation ?"),
    pw / 2, ctx.y + 14,
    { align: 'center' }
  )

  // Simulated button
  const btnW = 110
  const btnX = (pw - btnW) / 2
  doc.setFillColor(...ACCENT)
  doc.roundedRect(btnX, ctx.y + 20, btnW, 14, 4, 4, 'F')
  doc.setFontSize(9)
  doc.setTextColor(...DARK)
  doc.setFont('helvetica', 'bold')
  doc.text(
    sanitize('Reserve ton appel decouverte gratuit - 20 min'),
    pw / 2, ctx.y + 29,
    { align: 'center' }
  )

  ctx.y += ctaH + 10

  // URL below
  doc.setFontSize(8)
  doc.setTextColor(...MUTED)
  doc.setFont('helvetica', 'normal')
  doc.text(
    'calendly.com/clarte-expat/echange-expatriation-thailande',
    pw / 2, ctx.y,
    { align: 'center' }
  )

  // ── FOOTER every page ──
  const total = doc.getNumberOfPages()
  for (let i = 1; i <= total; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setTextColor(...MUTED)
    doc.text(sanitize('Clarte Expat - go.performiance.fr'), m, ph - 10)
    doc.text(`Page ${i} / ${total}`, pw - m, ph - 10, { align: 'right' })
  }

  return doc.output('blob')
}
