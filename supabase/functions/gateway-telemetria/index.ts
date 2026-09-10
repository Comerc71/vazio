// Endpoint que a Base usa pra gravar telemetria de campo, sem falar direto
// com a tabela lora_telemetria (que exigiria a chave anon aberta pra todo
// mundo). Autenticacao por GATEWAY_TOKEN (Ajustes > Gateway no app) - roda
// com verify_jwt = false e valida o token a mao, igual as outras funcoes
// gateway-*.
//
// POST com header "Authorization: Bearer <token>" e JSON:
// { setor_id, seq, umidade_solo, temperatura_c, umidade_ar, bateria_v, rssi, snr }
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return json({ error: 'Use POST' }, 405)
  }

  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '').trim()
  if (!token) return json({ error: 'token obrigatorio' }, 400)

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ error: 'JSON invalido' }, 400)
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  const { data: gateway, error: gatewayError } = await supabase
    .from('gateway_tokens')
    .select('owner_id')
    .eq('token', token)
    .maybeSingle()

  if (gatewayError) return json({ error: 'Falha ao validar token' }, 500)
  if (!gateway) return json({ error: 'token invalido' }, 401)

  const { error: insertError } = await supabase.from('lora_telemetria').insert({
    owner_id: gateway.owner_id,
    setor_id: body.setor_id,
    seq: body.seq,
    umidade_solo: body.umidade_solo ?? null,
    temperatura_c: body.temperatura_c ?? null,
    umidade_ar: body.umidade_ar ?? null,
    bateria_v: body.bateria_v ?? null,
    rssi: body.rssi ?? null,
    snr: body.snr ?? null,
  })

  if (insertError) return json({ error: 'Falha ao gravar telemetria' }, 500)
  return json({ ok: true })
})
