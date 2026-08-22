// Endpoint que o gateway LoRa/RF chama pela internet pra reportar uma leitura.
// Autenticação é por api_key própria do dispositivo (gerada no cadastro), não
// pela conta do usuário — por isso esta função roda com verify_jwt = false
// (configurado no dashboard, aba "Details" da função) e valida a chave à mão.
//
// POST JSON esperado:
// {
//   "device_id": "uuid do dispositivo (mostrado em Ajustes > dispositivo > Integração)",
//   "api_key": "chave do dispositivo (mesma tela)",
//   "value": 24.5,          // opcional — número bruto, alimenta o histórico/gráfico
//   "reading": "24%",       // opcional — texto mostrado no cartão do app
//   "sub": "abaixo do ideal", // opcional — legenda curta mostrada no cartão
//   "signal": 3,             // opcional — 0 a 4
//   "status": "atencao"      // opcional — "ok" | "atencao" | "alerta"
// }
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

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ error: 'JSON inválido' }, 400)
  }

  const deviceId = body.device_id
  const apiKey = body.api_key
  if (typeof deviceId !== 'string' || typeof apiKey !== 'string') {
    return json({ error: 'device_id e api_key são obrigatórios' }, 400)
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  const { data: device, error: findError } = await supabase
    .from('devices')
    .select('id, api_key')
    .eq('id', deviceId)
    .maybeSingle()

  if (findError) return json({ error: 'Falha ao consultar dispositivo' }, 500)
  if (!device || device.api_key !== apiKey) {
    return json({ error: 'device_id ou api_key inválidos' }, 401)
  }

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (typeof body.reading === 'string') patch.reading = body.reading
  if (typeof body.sub === 'string') patch.sub = body.sub
  if (typeof body.signal === 'number') patch.signal = Math.max(0, Math.min(4, Math.round(body.signal)))
  if (body.status === 'ok' || body.status === 'atencao' || body.status === 'alerta') patch.status = body.status

  const { error: updateError } = await supabase.from('devices').update(patch).eq('id', deviceId)
  if (updateError) return json({ error: 'Falha ao atualizar dispositivo' }, 500)

  if (typeof body.value === 'number') {
    const { error: readingError } = await supabase
      .from('device_readings')
      .insert({ device_id: deviceId, value: body.value })
    if (readingError) return json({ error: 'Falha ao gravar leitura' }, 500)
  }

  return json({ ok: true })
})
