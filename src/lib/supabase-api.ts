import { supabase } from '../config/supabase'
import type { Answer } from '../config/questions'
import type { Scores } from './scoring'

const BUCKET = 'plans'
const SIGNED_URL_EXPIRY = 60 * 60 * 24 * 30 // 30 jours

export async function uploadPdf(blob: Blob): Promise<{ path: string; signedUrl: string }> {
  const fileName = `${crypto.randomUUID()}.pdf`

  console.log('[Upload] Début upload PDF:', fileName, 'taille:', blob.size, 'octets')

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, blob, {
      contentType: 'application/pdf',
      upsert: false,
    })

  if (uploadError) {
    console.error('[Upload] ERREUR upload:', uploadError)
    throw new Error(`Upload PDF échoué: ${uploadError.message}`)
  }

  console.log('[Upload] Upload OK:', uploadData)

  const { data: signedData, error: signedError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(fileName, SIGNED_URL_EXPIRY)

  if (signedError || !signedData?.signedUrl) {
    console.error('[Upload] ERREUR URL signée:', signedError)
    throw new Error(`URL signée échouée: ${signedError?.message}`)
  }

  console.log('[Upload] URL signée OK:', signedData.signedUrl.substring(0, 80) + '...')

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
  const edgeFunctionUrl = `${supabaseUrl}/functions/v1/send-email`

  console.log('[Edge Function] Appel vers:', edgeFunctionUrl)

  const payload = {
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
  }

  console.log('[Edge Function] Payload:', JSON.stringify(payload).substring(0, 200) + '...')

  let res: Response
  try {
    res = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(payload),
    })
  } catch (fetchErr) {
    console.error('[Edge Function] ERREUR réseau (fetch échoué):', fetchErr)
    throw new Error(`Edge Function inaccessible: ${fetchErr}`)
  }

  console.log('[Edge Function] Réponse status:', res.status, res.statusText)

  if (!res.ok) {
    const rawText = await res.text()
    console.error('[Edge Function] ERREUR réponse body:', rawText)
    let errMsg = 'Edge Function échouée'
    try {
      const errJson = JSON.parse(rawText)
      errMsg = errJson.error || errJson.message || errMsg
    } catch { /* pas du JSON */ }
    throw new Error(errMsg)
  }

  const result = await res.json()
  console.log('[Edge Function] Succès:', result)
}
