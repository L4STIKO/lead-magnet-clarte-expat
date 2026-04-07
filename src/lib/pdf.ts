import jsPDF from 'jspdf'
import { steps, checklist, type ActionRow } from '../config/plan-data'
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
const CARD_HEADER: RGB = [35, 47, 66]    // #232f42 — header tableau
const BORDER: RGB = [42, 54, 74]         // #2a364a — bordures grille

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

function drawTable(ctx: Ctx, rows: ActionRow[]) {
  const { doc, m, cw } = ctx
  const col1W = cw * 0.24
  const col2W = cw * 0.44
  const col3W = cw * 0.32
  const padX = 7
  const padY = 7
  const lh = 4.6

  const colXs = [m, m + col1W, m + col1W + col2W]
  const colWs = [col1W - padX * 2, col2W - padX * 2, col3W - padX * 2]

  // ── HEADER TABLEAU ──
  const headerH = 13
  ensure(ctx, headerH)
  const headerY = ctx.y

  // Fond header
  doc.setFillColor(...CARD_HEADER)
  doc.rect(m, headerY, cw, headerH, 'F')

  // Textes header
  const headers = ['CE QUE TU FAIS', 'COMMENT LE FAIRE', "POURQUOI C'EST IMPORTANT"]
  doc.setFontSize(7)
  doc.setTextColor(...ACCENT)
  doc.setFont('helvetica', 'bold')
  headers.forEach((h, i) => {
    doc.text(sanitize(h), colXs[i] + padX, headerY + 9)
  })

  // Ligne accent sous header
  doc.setDrawColor(...ACCENT)
  doc.setLineWidth(0.5)
  doc.line(m, headerY + headerH, m + cw, headerY + headerH)

  // Lignes verticales header
  doc.setDrawColor(...ACCENT)
  doc.setGState(doc.GState({ opacity: 0.25 }))
  doc.setLineWidth(0.3)
  doc.line(m + col1W, headerY, m + col1W, headerY + headerH)
  doc.line(m + col1W + col2W, headerY, m + col1W + col2W, headerY + headerH)
  doc.setGState(doc.GState({ opacity: 1 }))

  ctx.y = headerY + headerH

  // Track table start for outer border
  const tableTopY = headerY

  // ── LIGNES DE DONNÉES ──
  rows.forEach((row, ri) => {
    doc.setFontSize(8.5)
    const l1 = doc.splitTextToSize(sanitize(row.action), colWs[0]) as string[]
    const l2 = doc.splitTextToSize(sanitize(row.how), colWs[1]) as string[]
    const l3 = doc.splitTextToSize(sanitize(row.why), colWs[2]) as string[]
    const rowH = Math.max(l1.length, l2.length, l3.length) * lh + padY * 2

    ensure(ctx, rowH)
    const rowY = ctx.y

    // Fond alternance
    const bg = ri % 2 === 0 ? CARD : CARD_ALT
    doc.setFillColor(...bg)
    doc.rect(m, rowY, cw, rowH, 'F')

    // Col 1 — action bold blanc
    doc.setFontSize(9)
    doc.setTextColor(...LIGHT)
    doc.setFont('helvetica', 'bold')
    l1.forEach((line: string, li: number) => {
      doc.text(line, colXs[0] + padX, rowY + padY + li * lh + 3.5)
    })

    // Col 2 — how normal secondary
    doc.setFontSize(8.5)
    doc.setTextColor(...SECONDARY)
    doc.setFont('helvetica', 'normal')
    l2.forEach((line: string, li: number) => {
      doc.text(line, colXs[1] + padX, rowY + padY + li * lh + 3.5)
    })

    // Col 3 — why italic muted
    doc.setFontSize(8.5)
    doc.setTextColor(...MUTED)
    doc.setFont('helvetica', 'italic')
    l3.forEach((line: string, li: number) => {
      doc.text(line, colXs[2] + padX, rowY + padY + li * lh + 3.5)
    })

    // Lignes verticales de grille
    doc.setDrawColor(...BORDER)
    doc.setGState(doc.GState({ opacity: 0.6 }))
    doc.setLineWidth(0.3)
    doc.line(m + col1W, rowY, m + col1W, rowY + rowH)
    doc.line(m + col1W + col2W, rowY, m + col1W + col2W, rowY + rowH)
    doc.setGState(doc.GState({ opacity: 1 }))

    // Ligne horizontale entre lignes
    doc.setDrawColor(...BORDER)
    doc.setGState(doc.GState({ opacity: 0.8 }))
    doc.setLineWidth(0.25)
    doc.line(m, rowY + rowH, m + cw, rowY + rowH)
    doc.setGState(doc.GState({ opacity: 1 }))

    ctx.y = rowY + rowH
  })

  // Bordure extérieure tableau
  doc.setDrawColor(...BORDER)
  doc.setGState(doc.GState({ opacity: 0.6 }))
  doc.setLineWidth(0.4)
  doc.rect(m, tableTopY, cw, ctx.y - tableTopY)
  doc.setGState(doc.GState({ opacity: 1 }))

  ctx.y += 10
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
  // CHECKLIST — vrai tableau avec grille
  // ══════════════════════════════════════
  ensure(ctx, 30)
  separator(ctx)
  ctx.y += 8

  text(ctx, 'Ta checklist complete', 16, LIGHT, { bold: true, align: 'center' })
  ctx.y += 6
  text(ctx, 'Coche chaque etape au fur et a mesure de ton avancement.', 8.5, MUTED, { align: 'center' })
  ctx.y += 14

  // Colonnes checklist
  const ck1 = cw * 0.30
  const ck2 = cw * 0.45
  const ck3 = cw * 0.125
  const ck4 = cw * 0.125
  const ckXs = [m, m + ck1, m + ck1 + ck2, m + ck1 + ck2 + ck3]
  const ckPadX = 7
  const ckPadY = 6
  const ckLh = 4.4

  // Header checklist
  const ckHeaderH = 13
  ensure(ctx, ckHeaderH)
  const ckHY = ctx.y

  doc.setFillColor(...CARD_HEADER)
  doc.rect(m, ckHY, cw, ckHeaderH, 'F')

  const ckHeaders = ['CATEGORIE', 'TACHE', 'A FAIRE', 'FAIT']
  doc.setFontSize(7)
  doc.setTextColor(...ACCENT)
  doc.setFont('helvetica', 'bold')
  ckHeaders.forEach((h, i) => {
    doc.text(sanitize(h), ckXs[i] + ckPadX, ckHY + 9)
  })

  // Ligne accent sous header
  doc.setDrawColor(...ACCENT)
  doc.setLineWidth(0.5)
  doc.line(m, ckHY + ckHeaderH, m + cw, ckHY + ckHeaderH)

  // Lignes verticales header
  doc.setDrawColor(...ACCENT)
  doc.setGState(doc.GState({ opacity: 0.25 }))
  doc.setLineWidth(0.3)
  doc.line(m + ck1, ckHY, m + ck1, ckHY + ckHeaderH)
  doc.line(m + ck1 + ck2, ckHY, m + ck1 + ck2, ckHY + ckHeaderH)
  doc.line(m + ck1 + ck2 + ck3, ckHY, m + ck1 + ck2 + ck3, ckHY + ckHeaderH)
  doc.setGState(doc.GState({ opacity: 1 }))

  ctx.y = ckHY + ckHeaderH

  // Lignes de données checklist
  let globalRowIndex = 0

  for (const cat of checklist) {
    for (let itemIdx = 0; itemIdx < cat.items.length; itemIdx++) {
      const item = cat.items[itemIdx]
      const isFirstInCat = itemIdx === 0

      doc.setFontSize(8)
      const catLabel = isFirstInCat ? sanitize(`${cat.emoji} ${cat.title}`) : ''
      const itemLabel = sanitize(item)
      const itemLines = doc.splitTextToSize(itemLabel, ck2 - ckPadX * 2) as string[]
      const rowH = Math.max(itemLines.length * ckLh + ckPadY * 2, 12)

      ensure(ctx, rowH)
      const rowY = ctx.y

      // Fond alternance sur globalRowIndex
      const bg = globalRowIndex % 2 === 0 ? CARD : CARD_ALT
      doc.setFillColor(...bg)
      doc.rect(m, rowY, cw, rowH, 'F')

      // Col 1 — catégorie (seulement sur première ligne de la catégorie)
      if (isFirstInCat) {
        doc.setFontSize(8.5)
        doc.setTextColor(...ACCENT)
        doc.setFont('helvetica', 'bold')
        doc.text(catLabel, ckXs[0] + ckPadX, rowY + ckPadY + 3.5)
      }

      // Col 2 — tâche
      doc.setFontSize(8)
      doc.setTextColor(...LIGHT)
      doc.setFont('helvetica', 'normal')
      itemLines.forEach((line: string, li: number) => {
        doc.text(line, ckXs[1] + ckPadX, rowY + ckPadY + li * ckLh + 3.5)
      })

      // Col 3 — À faire : carré vide
      const boxSize = 5
      const boxX = ckXs[2] + (ck3 - boxSize) / 2
      const boxY = rowY + (rowH - boxSize) / 2
      doc.setDrawColor(...MUTED)
      doc.setLineWidth(0.4)
      doc.roundedRect(boxX, boxY, boxSize, boxSize, 1, 1)

      // Col 4 — Fait : carré vide
      const boxX2 = ckXs[3] + (ck4 - boxSize) / 2
      doc.roundedRect(boxX2, boxY, boxSize, boxSize, 1, 1)

      // Lignes verticales grille
      doc.setDrawColor(...BORDER)
      doc.setGState(doc.GState({ opacity: 0.6 }))
      doc.setLineWidth(0.3)
      doc.line(m + ck1, rowY, m + ck1, rowY + rowH)
      doc.line(m + ck1 + ck2, rowY, m + ck1 + ck2, rowY + rowH)
      doc.line(m + ck1 + ck2 + ck3, rowY, m + ck1 + ck2 + ck3, rowY + rowH)
      doc.setGState(doc.GState({ opacity: 1 }))

      // Ligne horizontale
      doc.setDrawColor(...BORDER)
      doc.setGState(doc.GState({ opacity: 0.8 }))
      doc.setLineWidth(0.25)
      doc.line(m, rowY + rowH, m + cw, rowY + rowH)
      doc.setGState(doc.GState({ opacity: 1 }))

      ctx.y = rowY + rowH
      globalRowIndex++
    }
  }

  // Bordure extérieure checklist
  doc.setDrawColor(...BORDER)
  doc.setGState(doc.GState({ opacity: 0.6 }))
  doc.setLineWidth(0.4)
  doc.rect(m, ckHY, cw, ctx.y - ckHY)
  doc.setGState(doc.GState({ opacity: 1 }))

  ctx.y += 16

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
