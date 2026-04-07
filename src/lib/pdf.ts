import jsPDF from 'jspdf'
import { steps, checklist, type ActionRow } from '../config/plan-data'
import { pillarNames, type Answer } from '../config/questions'
import { q7Phrases, q8Phrases, pillarIntros, getLevel, getLevelLabel } from '../config/personalization'
import type { Scores } from './scoring'

// ── Colors ──
type RGB = [number, number, number]
const DARK: RGB = [18, 24, 35]
const CARD: RGB = [26, 35, 50]
const CARD2: RGB = [22, 30, 44]
const HEADER: RGB = [35, 47, 66]
const ACCENT: RGB = [0, 217, 163]
const LIGHT: RGB = [242, 244, 246]
const SECOND: RGB = [200, 206, 216]
const TERTIARY: RGB = [160, 168, 180]
const MUTED: RGB = [110, 118, 130]
const BORDER: RGB = [42, 54, 74]
const RED: RGB = [239, 68, 68]
const ORANGE: RGB = [249, 115, 22]

function scoreColor(s: number): RGB {
  if (s <= 33) return RED
  if (s <= 66) return ORANGE
  return ACCENT
}

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

// ── Context ──
interface Ctx { doc: jsPDF; y: number; pw: number; ph: number; m: number; cw: number }

function newPage(ctx: Ctx) {
  ctx.doc.addPage()
  ctx.doc.setFillColor(...DARK)
  ctx.doc.rect(0, 0, ctx.pw, ctx.ph, 'F')
  ctx.y = 22
}

function ensure(ctx: Ctx, h: number) {
  if (ctx.y + h > ctx.ph - 20) newPage(ctx)
}

function sep(ctx: Ctx) {
  ctx.doc.setDrawColor(255, 255, 255)
  ctx.doc.setGState(ctx.doc.GState({ opacity: 0.06 }))
  ctx.doc.line(ctx.m, ctx.y, ctx.pw - ctx.m, ctx.y)
  ctx.doc.setGState(ctx.doc.GState({ opacity: 1 }))
}

// ── Gauge ──
function gauge(ctx: Ctx, label: string, score: number) {
  const { doc, m, cw } = ctx
  ensure(ctx, 16)
  doc.setFontSize(9)
  doc.setTextColor(...LIGHT)
  doc.setFont('helvetica', 'bold')
  doc.text(sanitize(label), m, ctx.y)
  const c = scoreColor(score)
  const { label: lvl } = getLevelLabel(score)
  doc.setTextColor(...c)
  doc.setFont('helvetica', 'normal')
  doc.text(sanitize(`${score}% - ${lvl}`), m + cw, ctx.y, { align: 'right' })
  ctx.y += 4
  doc.setFillColor(255, 255, 255)
  doc.setGState(doc.GState({ opacity: 0.06 }))
  doc.roundedRect(m, ctx.y, cw, 5, 2.5, 2.5, 'F')
  doc.setGState(doc.GState({ opacity: 1 }))
  doc.setFillColor(...c)
  doc.roundedRect(m, ctx.y, Math.max(2, (score / 100) * cw), 5, 2.5, 2.5, 'F')
  ctx.y += 11
}

// ── drawTable ──
function drawTable(ctx: Ctx, rows: ActionRow[]) {
  const { doc, m, cw } = ctx
  const c1W = cw * 0.24, c2W = cw * 0.44, c3W = cw * 0.32
  const pX = 4, pY = 2.5, lh = 3.5
  const xs = [m, m + c1W, m + c1W + c2W]
  const ws = [c1W - pX * 2, c2W - pX * 2, c3W - pX * 2]

  // Header 8mm
  const hH = 8
  ensure(ctx, hH)
  const hY = ctx.y
  doc.setFillColor(...HEADER)
  doc.rect(m, hY, cw, hH, 'F')
  doc.setFontSize(7)
  doc.setTextColor(...ACCENT)
  doc.setFont('helvetica', 'bold')
  doc.text(sanitize('CE QUE TU FAIS'), xs[0] + pX, hY + 5.5)
  doc.text(sanitize('COMMENT LE FAIRE'), xs[1] + pX, hY + 5.5)
  doc.text(sanitize("POURQUOI C'EST IMPORTANT"), xs[2] + pX, hY + 5.5)
  // Accent line under header
  doc.setDrawColor(...ACCENT)
  doc.setLineWidth(0.5)
  doc.line(m, hY + hH, m + cw, hY + hH)
  // Vertical lines header
  doc.setGState(doc.GState({ opacity: 0.2 }))
  doc.setLineWidth(0.3)
  doc.line(xs[1], hY, xs[1], hY + hH)
  doc.line(xs[2], hY, xs[2], hY + hH)
  doc.setGState(doc.GState({ opacity: 1 }))
  ctx.y = hY + hH

  rows.forEach((row, ri) => {
    doc.setFontSize(8.5)
    const l1 = doc.splitTextToSize(sanitize(row.action), ws[0]) as string[]
    doc.setFontSize(8)
    const l2 = doc.splitTextToSize(sanitize(row.how), ws[1]) as string[]
    const l3 = doc.splitTextToSize(sanitize(row.why), ws[2]) as string[]
    const rH = Math.max(l1.length, l2.length, l3.length) * lh + pY * 2

    ensure(ctx, rH)
    const rY = ctx.y
    doc.setFillColor(...(ri % 2 === 0 ? CARD : CARD2))
    doc.rect(m, rY, cw, rH, 'F')

    // Col 1
    doc.setFontSize(8.5)
    doc.setTextColor(...LIGHT)
    doc.setFont('helvetica', 'bold')
    l1.forEach((l, i) => doc.text(l, xs[0] + pX, rY + pY + i * lh + 2.5))
    // Col 2
    doc.setFontSize(8)
    doc.setTextColor(...SECOND)
    doc.setFont('helvetica', 'normal')
    l2.forEach((l, i) => doc.text(l, xs[1] + pX, rY + pY + i * lh + 2.5))
    // Col 3
    doc.setFontSize(8)
    doc.setTextColor(...TERTIARY)
    doc.setFont('helvetica', 'italic')
    l3.forEach((l, i) => doc.text(l, xs[2] + pX, rY + pY + i * lh + 2.5))

    // Vertical grid
    doc.setDrawColor(...BORDER)
    doc.setGState(doc.GState({ opacity: 0.6 }))
    doc.setLineWidth(0.3)
    doc.line(xs[1], rY, xs[1], rY + rH)
    doc.line(xs[2], rY, xs[2], rY + rH)
    doc.setGState(doc.GState({ opacity: 1 }))
    // Horizontal separator
    doc.setDrawColor(...BORDER)
    doc.setGState(doc.GState({ opacity: 0.8 }))
    doc.setLineWidth(0.25)
    doc.line(m, rY + rH, m + cw, rY + rH)
    doc.setGState(doc.GState({ opacity: 1 }))

    ctx.y = rY + rH
  })

  ctx.y += 3
}

// ══════════════════════════════════════
// MAIN
// ══════════════════════════════════════
export function generatePdf(
  prenom: string,
  answers: Record<number, Answer>,
  scores: Scores,
): Blob {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pw = doc.internal.pageSize.getWidth()
  const ph = doc.internal.pageSize.getHeight()
  const m = 18
  const cw = pw - m * 2
  const ctx: Ctx = { doc, y: 0, pw, ph, m, cw }

  // ══════════════════════════════════════
  // PAGE 1 — COVER
  // ══════════════════════════════════════
  doc.setFillColor(...DARK)
  doc.rect(0, 0, pw, ph, 'F')

  // Logo
  doc.setFontSize(14)
  doc.setTextColor(...ACCENT)
  doc.setFont('helvetica', 'bold')
  doc.text(sanitize('Clarte Expat'), pw / 2, 30, { align: 'center' })

  // Accent line
  doc.setDrawColor(...ACCENT)
  doc.setLineWidth(1)
  doc.line(pw / 2 - 20, 36, pw / 2 + 20, 36)
  doc.setLineWidth(0.2)

  // Bonjour
  doc.setFontSize(28)
  doc.setTextColor(...LIGHT)
  doc.setFont('helvetica', 'bold')
  doc.text(sanitize(`Bonjour ${prenom}`), pw / 2, 52, { align: 'center' })

  // Score global
  const gc = scoreColor(scores.global)
  doc.setFontSize(52)
  doc.setTextColor(...gc)
  doc.setFont('helvetica', 'bold')
  doc.text(`${scores.global}%`, pw / 2, 72, { align: 'center' })

  // Label
  doc.setFontSize(9)
  doc.setTextColor(...TERTIARY)
  doc.setFont('helvetica', 'bold')
  doc.text(sanitize('TON SCORE GLOBAL'), pw / 2, 82, { align: 'center' })

  // Score bar
  const bW = 120, bX = (pw - bW) / 2
  doc.setFillColor(255, 255, 255)
  doc.setGState(doc.GState({ opacity: 0.06 }))
  doc.roundedRect(bX, 87, bW, 5, 2.5, 2.5, 'F')
  doc.setGState(doc.GState({ opacity: 1 }))
  doc.setFillColor(...gc)
  doc.roundedRect(bX, 87, Math.max(2, (scores.global / 100) * bW), 5, 2.5, 2.5, 'F')

  // Q7 phrase
  ctx.y = 106
  const q7 = (answers[7] || 'A') as Answer
  const q8 = (answers[8] || 'A') as Answer
  doc.setFontSize(10)
  doc.setTextColor(...SECOND)
  doc.setFont('helvetica', 'normal')
  const q7L = doc.splitTextToSize(sanitize(q7Phrases[q7]), 160) as string[]
  q7L.forEach(l => { doc.text(l, pw / 2, ctx.y, { align: 'center' }); ctx.y += 4.5 })

  ctx.y += 5

  // Q8 phrase
  const q8L = doc.splitTextToSize(sanitize(q8Phrases[q8]), 160) as string[]
  q8L.forEach(l => { doc.text(l, pw / 2, ctx.y, { align: 'center' }); ctx.y += 4.5 })

  ctx.y += 16
  sep(ctx)
  ctx.y += 12

  // 3 gauges
  gauge(ctx, pillarNames[1], scores.p1)
  gauge(ctx, pillarNames[2], scores.p2)
  gauge(ctx, pillarNames[3], scores.p3)

  // ══════════════════════════════════════
  // PAGE 2 — INTRO PLAN
  // ══════════════════════════════════════
  newPage(ctx)
  doc.setFontSize(20)
  doc.setTextColor(...LIGHT)
  doc.setFont('helvetica', 'bold')
  doc.text(sanitize("Ton plan d'action"), pw / 2, ctx.y, { align: 'center' })
  ctx.y += 6
  doc.setFontSize(9)
  doc.setTextColor(...MUTED)
  doc.setFont('helvetica', 'normal')
  doc.text(sanitize("6 etapes pour une expatriation propre et sereine."), pw / 2, ctx.y, { align: 'center' })
  ctx.y += 12

  // ── Pillars ──
  const pillars = [
    { num: 1 as const, name: pillarNames[1], score: scores.p1, stepNums: [1, 2] },
    { num: 2 as const, name: pillarNames[2], score: scores.p2, stepNums: [3] },
    { num: 3 as const, name: pillarNames[3], score: scores.p3, stepNums: [4, 5, 6] },
  ]

  for (const p of pillars) {
    const level = getLevel(p.score)
    const intro = pillarIntros[p.num][level]

    // ── Pillar header (dynamic height) ──
    doc.setFontSize(8)
    const iLines = doc.splitTextToSize(sanitize(intro), cw - 7) as string[]
    const pillarH = 12 + iLines.length * 3.5 + 2
    ensure(ctx, pillarH)
    const phY = ctx.y

    // Background
    doc.setFillColor(...HEADER)
    doc.rect(m, phY, cw, pillarH, 'F')
    // Accent left bar
    doc.setFillColor(...ACCENT)
    doc.rect(m, phY, 3, pillarH, 'F')
    // "PILIER X"
    doc.setFontSize(7)
    doc.setTextColor(...ACCENT)
    doc.setFont('helvetica', 'bold')
    doc.text(sanitize(`PILIER ${p.num}`), m + 5, phY + 7)
    // Vertical separator
    doc.setDrawColor(...ACCENT)
    doc.setGState(doc.GState({ opacity: 0.3 }))
    doc.setLineWidth(0.3)
    doc.line(m + 28, phY + 2, m + 28, phY + pillarH - 2)
    doc.setGState(doc.GState({ opacity: 1 }))
    // Pillar name
    doc.setFontSize(11)
    doc.setTextColor(...LIGHT)
    doc.setFont('helvetica', 'bold')
    doc.text(sanitize(p.name), m + 32, phY + 7)
    // Intro phrase
    doc.setFontSize(8)
    doc.setTextColor(...SECOND)
    doc.setFont('helvetica', 'italic')
    iLines.forEach((l, i) => doc.text(l, m + 5, phY + 12 + i * 3.5))

    ctx.y = phY + pillarH + 4

    // ── Steps ──
    for (const sn of p.stepNums) {
      const step = steps[sn - 1]

      // Step header 14mm
      ensure(ctx, 14)
      const shY = ctx.y
      doc.setFillColor(255, 255, 255)
      doc.setGState(doc.GState({ opacity: 0.03 }))
      doc.rect(m, shY, cw, 14, 'F')
      doc.setGState(doc.GState({ opacity: 1 }))

      doc.setFontSize(7)
      doc.setTextColor(...ACCENT)
      doc.setFont('helvetica', 'bold')
      doc.text(sanitize(`ETAPE ${step.number}`), m + 5, shY + 4.5)

      doc.setFontSize(10)
      doc.setTextColor(...LIGHT)
      doc.setFont('helvetica', 'bold')
      doc.text(sanitize(step.title), m + 5, shY + 9.5)

      let sub = step.subtitle
      if (step.milestone) sub += ` - ${step.milestone}`
      doc.setFontSize(7.5)
      doc.setTextColor(...TERTIARY)
      doc.setFont('helvetica', 'italic')
      doc.text(sanitize(sub), m + 5, shY + 13)

      ctx.y = shY + 14 + 3

      // Table
      drawTable(ctx, step.rows)

      // Result box
      const rText = sanitize(step.result)
      doc.setFontSize(8.5)
      const rLines = doc.splitTextToSize(rText, cw - 30) as string[]
      const rH = Math.max(rLines.length * 4.2 + 12, 14)
      ensure(ctx, rH)
      const rY = ctx.y

      // Background
      doc.setFillColor(...ACCENT)
      doc.setGState(doc.GState({ opacity: 0.10 }))
      doc.roundedRect(m, rY, cw, rH, 2, 2, 'F')
      doc.setGState(doc.GState({ opacity: 1 }))
      // Left bar
      doc.setFillColor(...ACCENT)
      doc.rect(m, rY, 3, rH, 'F')

      // "Resultat :" inline with text
      doc.setFontSize(8.5)
      doc.setTextColor(...ACCENT)
      doc.setFont('helvetica', 'bold')
      doc.text(sanitize('Resultat :'), m + 8, rY + 6 + 3)
      doc.setTextColor(...LIGHT)
      doc.setFont('helvetica', 'normal')
      rLines.forEach((l, i) => doc.text(l, m + 30, rY + 6 + 3 + i * 4.2))

      ctx.y = rY + rH + 8
    }
  }

  // ══════════════════════════════════════
  // CHECKLIST
  // ══════════════════════════════════════
  ensure(ctx, 30)
  sep(ctx)
  ctx.y += 6
  doc.setFontSize(16)
  doc.setTextColor(...LIGHT)
  doc.setFont('helvetica', 'bold')
  doc.text(sanitize('Ta checklist complete'), pw / 2, ctx.y, { align: 'center' })
  ctx.y += 10

  const ck1 = cw * 0.26, ck2 = cw * 0.54, ck3 = cw * 0.10, ck4 = cw * 0.10
  const ckXs = [m, m + ck1, m + ck1 + ck2, m + ck1 + ck2 + ck3]
  const ckPX = 6

  // Checklist header 9mm
  const ckHH = 9
  ensure(ctx, ckHH)
  const ckHY = ctx.y
  doc.setFillColor(...HEADER)
  doc.rect(m, ckHY, cw, ckHH, 'F')
  doc.setFontSize(7)
  doc.setTextColor(...ACCENT)
  doc.setFont('helvetica', 'bold')
  doc.text(sanitize('CATEGORIE'), ckXs[0] + ckPX, ckHY + 6)
  doc.text(sanitize('TACHE'), ckXs[1] + ckPX, ckHY + 6)
  doc.text(sanitize('A FAIRE'), ckXs[2] + ckPX, ckHY + 6)
  doc.text(sanitize('FAIT'), ckXs[3] + ckPX, ckHY + 6)
  // Accent line
  doc.setDrawColor(...ACCENT)
  doc.setLineWidth(0.5)
  doc.line(m, ckHY + ckHH, m + cw, ckHY + ckHH)
  // Vertical lines
  doc.setGState(doc.GState({ opacity: 0.2 }))
  doc.setLineWidth(0.3)
  doc.line(ckXs[1], ckHY, ckXs[1], ckHY + ckHH)
  doc.line(ckXs[2], ckHY, ckXs[2], ckHY + ckHH)
  doc.line(ckXs[3], ckHY, ckXs[3], ckHY + ckHH)
  doc.setGState(doc.GState({ opacity: 1 }))
  ctx.y = ckHY + ckHH

  let ri = 0
  for (const cat of checklist) {
    for (const item of cat.items) {
      const rH = 8
      ensure(ctx, rH)
      const rY = ctx.y

      doc.setFillColor(...(ri % 2 === 0 ? CARD : CARD2))
      doc.rect(m, rY, cw, rH, 'F')

      // Col 1 — category on every row (no emoji)
      doc.setFontSize(8)
      doc.setTextColor(...ACCENT)
      doc.setFont('helvetica', 'bold')
      doc.text(sanitize(cat.title), ckXs[0] + ckPX, rY + 5.5)

      // Col 2 — task
      doc.setFontSize(8)
      doc.setTextColor(...LIGHT)
      doc.setFont('helvetica', 'normal')
      doc.text(sanitize(item), ckXs[1] + ckPX, rY + 5.5)

      // Col 3 — checkbox
      const bSz = 3.5, bxY = rY + (rH - bSz) / 2
      doc.setDrawColor(...MUTED)
      doc.setLineWidth(0.3)
      doc.roundedRect(ckXs[2] + (ck3 - bSz) / 2, bxY, bSz, bSz, 0.7, 0.7)
      // Col 4 — checkbox
      doc.roundedRect(ckXs[3] + (ck4 - bSz) / 2, bxY, bSz, bSz, 0.7, 0.7)

      // Vertical grid
      doc.setDrawColor(...BORDER)
      doc.setGState(doc.GState({ opacity: 0.6 }))
      doc.setLineWidth(0.3)
      doc.line(ckXs[1], rY, ckXs[1], rY + rH)
      doc.line(ckXs[2], rY, ckXs[2], rY + rH)
      doc.line(ckXs[3], rY, ckXs[3], rY + rH)
      doc.setGState(doc.GState({ opacity: 1 }))
      // Horizontal
      doc.setDrawColor(...BORDER)
      doc.setGState(doc.GState({ opacity: 0.8 }))
      doc.setLineWidth(0.25)
      doc.line(m, rY + rH, m + cw, rY + rH)
      doc.setGState(doc.GState({ opacity: 1 }))

      ctx.y = rY + rH
      ri++
    }
  }

  ctx.y += 10

  // ══════════════════════════════════════
  // CTA FINAL
  // ══════════════════════════════════════
  ensure(ctx, 60)
  sep(ctx)
  ctx.y += 10

  const ctaH = 50
  // Card background
  doc.setFillColor(...ACCENT)
  doc.setGState(doc.GState({ opacity: 0.06 }))
  doc.roundedRect(m, ctx.y, cw, ctaH, 5, 5, 'F')
  doc.setGState(doc.GState({ opacity: 1 }))
  // Card border
  doc.setDrawColor(...ACCENT)
  doc.setLineWidth(0.8)
  doc.roundedRect(m, ctx.y, cw, ctaH, 5, 5)
  doc.setLineWidth(0.2)

  // Title
  doc.setFontSize(13)
  doc.setTextColor(...LIGHT)
  doc.setFont('helvetica', 'bold')
  doc.text(sanitize("Tu veux qu'on l'applique ensemble a ta situation ?"), pw / 2, ctx.y + 14, { align: 'center' })

  // Button
  const btnW = 120, btnX = (pw - btnW) / 2
  doc.setFillColor(...ACCENT)
  doc.roundedRect(btnX, ctx.y + 22, btnW, 14, 4, 4, 'F')
  doc.setFontSize(9.5)
  doc.setTextColor(...DARK)
  doc.setFont('helvetica', 'bold')
  doc.text(sanitize('Reserve ton appel decouverte gratuit - 20 min'), pw / 2, ctx.y + 31.5, { align: 'center' })

  ctx.y += ctaH + 8
  // URL
  doc.setFontSize(8)
  doc.setTextColor(...MUTED)
  doc.setFont('helvetica', 'normal')
  doc.text('calendly.com/clarte-expat/echange-expatriation-thailande', pw / 2, ctx.y, { align: 'center' })

  // ══════════════════════════════════════
  // FOOTER
  // ══════════════════════════════════════
  const total = doc.getNumberOfPages()
  for (let i = 1; i <= total; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setTextColor(...MUTED)
    doc.text(sanitize('Clarte Expat - go.performiance.fr'), m, ph - 8)
    doc.text(`Page ${i} / ${total}`, pw - m, ph - 8, { align: 'right' })
  }

  return doc.output('blob')
}
