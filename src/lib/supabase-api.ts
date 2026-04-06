import { supabase } from '../config/supabase'
import type { Answer } from '../config/questions'
import type { Scores } from './scoring'

const BUCKET = 'plans'
const SIGNED_URL_EXPIRY = 60 * 60 * 24 * 30 // 30 jours

export async function uploadPdf(blob: Blob): Promise<{ path: string; signedUrl: string }> {
  const fileName = `${crypto.randomUUID()}.pdf`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, blob, {
      contentType: 'application/pdf',
      upsert: false,
    })

  if (uploadError) throw new Error(`Upload PDF échoué: ${uploadError.message}`)

  const { data: signedData, error: signedError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(fileName, SIGNED_URL_EXPIRY)

  if (signedError || !signedData?.signedUrl) {
    throw new Error(`URL signée échouée: ${signedError?.message}`)
  }

  return { path: fileName, signedUrl: signedData.signedUrl }
}

interface SubmitData {
  prenom: string
  email: string
  answers: Record<number, Answer>
  scores: Scores
  pdfUrl: string
}

export async function submitLead(data: SubmitData) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL

  const res = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      prenom: data.prenom,
      email: data.email,
      q1: data.answers[1] || null,
      q2: data.answers[2] || null,
      q3: data.answers[3] || null,
      q4: data.answers[4] || null,
      q5: data.answers[5] || null,
      q6: data.answers[6] || null,
      q7: data.answers[7] || null,
      q8: data.answers[8] || null,
      score_global: data.scores.global,
      score_p1: data.scores.p1,
      score_p2: data.scores.p2,
      score_p3: data.scores.p3,
      pdf_url: data.pdfUrl,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Erreur inconnue' }))
    throw new Error(err.error || 'Edge Function échouée')
  }
}
