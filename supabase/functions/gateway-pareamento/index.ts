// Endpoint que a Base (gateway) chama periodicamente pra saber, pra cada setor de
// radio LoRa, qual dispositivo do app deve receber os dados (e com qual api_key).
// Autenticacao e por um token de gateway (um por conta, gerado em Ajustes > Gateway
// no app) - por isso esta funcao roda com verify_jwt = false (aba "Details" da
// funcao no dashboard) e valida o token a mao, igual a swift-api valida a api_key.
//
// GET com header "Authorization: Bearer <token>" (ou "?token=..." na query).
//
// Resposta: array de { setor_id, device_id, api_key } - um item por dispositivo
// do dono do token que ja tem um setor configurado (Ajustes > dispositivo > Setor).
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
  if (req.method !== 'GET') {
    return json({ error: 'Use GET' }, 405)
  }

  const url = new URL(req.url)
  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '').trim() || url.searchParams.get('token') || ''
  if (!token) {
    return json({ error: 'token obrigatorio' }, 400)
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  const { data: gateway, error: gatewayError } = await supabase
    .from('gateway_tokens')
    .select('owner_id')
    .eq('token', token)
    .maybeSingle()

  if (gatewayError) return json({ error: 'Falha ao validar token' }, 500)
  if (!gateway) return json({ error: 'token invalido' }, 401)

  const { data: devices, error: devicesError } = await supabase
    .from('devices')
    .select('id, api_key, setor_id')
    .eq('owner_id', gateway.owner_id)
    .not('setor_id', 'is', null)

  if (devicesError) return json({ error: 'Falha ao consultar dispositivos' }, 500)

  return json(
    (devices ?? []).map((d) => ({
      setor_id: d.setor_id,
      device_id: d.id,
      api_key: d.api_key,
    }))
  )
})
