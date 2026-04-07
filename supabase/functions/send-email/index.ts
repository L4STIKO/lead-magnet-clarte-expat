import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  prenom: string;
  email: string;
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  q5: string;
  q6: string;
  q7: string;
  q8: string;
  score_global: number;
  score_p1: number;
  score_p2: number;
  score_p3: number;
  pdf_url: string;
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body: RequestBody = await req.json();

    // ── 1. Insert contact ──
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: insertedContact, error: insertError } = await supabase.from("contacts").insert({
      prenom: body.prenom,
      email: body.email,
      q1: body.q1,
      q2: body.q2,
      q3: body.q3,
      q4: body.q4,
      q5: body.q5,
      q6: body.q6,
      q7: body.q7,
      q8: body.q8,
      score_global: body.score_global,
      score_p1: body.score_p1,
      score_p2: body.score_p2,
      score_p3: body.score_p3,
      source: "lead-magnet",
      pdf_url: body.pdf_url,
      pdf_generated: true,
      email_sent: false,
    }).select("id").single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Insert contact échoué", details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ── 1b. Log activity for dashboard ──
    if (insertedContact?.id) {
      await supabase.from("activity_log").insert({
        contact_id: insertedContact.id,
        type: "stage_change",
        metadata: { from: null, to: "lead", source: "lead-magnet" },
      });
    }

    // ── 2. Send email via Resend ──
    const emailHtml = buildEmailHtml(body.prenom, body.pdf_url);

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Grégoire · Clarté Expat <gregoire@performiance.fr>",
        to: [body.email],
        subject: `${body.prenom}, ton plan d'expatriation en Thaïlande 🧭`,
        html: emailHtml,
      }),
    });

    if (!resendRes.ok) {
      const resendError = await resendRes.text();
      console.error("Resend error:", resendError);
      return new Response(
        JSON.stringify({ error: "Email échoué", details: resendError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ── 3. Update email_sent ──
    await supabase
      .from("contacts")
      .update({ email_sent: true })
      .eq("email", body.email)
      .order("created_at", { ascending: false })
      .limit(1);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Erreur interne" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

// ── Email template ──
function buildEmailHtml(prenom: string, pdfUrl: string): string {
  const calendlyUrl = "https://calendly.com/clarte-expat/echange-expatriation-thailande";

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#f5f5f5; font-family:Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5; padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="700" cellpadding="0" cellspacing="0" style="max-width:700px; width:100%; background-color:#ffffff; border-radius:12px; padding:40px;">

          <!-- Logo -->
          <tr>
            <td style="padding-bottom:30px;">
              <span style="color:#00b589; font-size:20px; font-weight:bold;">🧭 Clarté Expat</span>
            </td>
          </tr>

          <!-- Titre -->
          <tr>
            <td style="padding-bottom:20px;">
              <h1 style="color:#1a1a1a; font-size:26px; margin:0; line-height:1.3;">
                ${prenom}, ton plan d'expatriation est prêt
              </h1>
            </td>
          </tr>

          <!-- Corps -->
          <tr>
            <td style="color:#555555; font-size:16px; line-height:1.6; padding-bottom:30px;">
              Tu as répondu aux 8 questions — ton plan d'action personnalisé a été généré.<br><br>
              Il contient les 6 étapes concrètes pour sortir proprement de France, structurer ton activité et t'installer en Thaïlande sereinement.
            </td>
          </tr>

          <!-- CTA PDF -->
          <tr>
            <td style="padding-bottom:40px;">
              <a href="${pdfUrl}" target="_blank" style="
                display:inline-block;
                background-color:#00d9a3;
                color:#121823;
                font-size:16px;
                font-weight:bold;
                padding:16px 32px;
                border-radius:12px;
                text-decoration:none;
              ">Télécharger mon plan en PDF →</a>
            </td>
          </tr>

          <!-- Separator -->
          <tr>
            <td style="border-top:1px solid #e5e5e5; padding-top:30px; padding-bottom:20px;">
              <p style="color:#555555; font-size:15px; line-height:1.6; margin:0;">
                Tu veux qu'on applique ce plan ensemble à ta situation précise ?<br>
                Réserve un échange gratuit de 20 minutes :
              </p>
            </td>
          </tr>

          <!-- CTA Calendly -->
          <tr>
            <td style="padding-bottom:40px;">
              <a href="${calendlyUrl}" target="_blank" style="
                display:inline-block;
                border:2px solid #00d9a3;
                color:#00b589;
                font-size:15px;
                font-weight:bold;
                padding:14px 28px;
                border-radius:12px;
                text-decoration:none;
              ">Réserver mon appel découverte →</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top:1px solid #e5e5e5; padding-top:20px;">
              <p style="color:#999999; font-size:12px; margin:0; line-height:1.5;">
                Grégoire · Clarté Expat<br>
                <a href="https://performiance.fr" target="_blank" style="color:#00b589; text-decoration:none;">performiance.fr</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
