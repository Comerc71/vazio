// Endpoint que a Base usa pra buscar comandos pendentes (val­vula) e reportar
// o resultado, sem falar direto com a tabela lora_comandos. Autenticacao por
// GATEWAY_TOKEN (Ajustes > Gateway no app) - roda com verify_jwt = false e
// valida o token a mao, igual as outras funcoes gateway-*.
//
// GET com header "Authorization: Bearer <token>":
//   Retorna ate 5 comandos pendentes do dono do token (os mais antigos primeiro).
//   Nao muda o status - quem marca "enviado" e a propria Base, via POST, so
//   depois de conseguir enfileirar o comando pra transmissao (mesmo fluxo de
//   antes, quando ela falava direto com a tabela).
//
// POST com header "Authorization: Bearer <token>" e JSON { id, status }:
//   Atualiza o status de um comando ("enviado", "confirmado" ou "falhou") - so
//   funciona se o comando pertencer ao dono do token.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

async function buscarOwnerId(supabase: ReturnType<typeof createClient>, token: string) {
  const { data, error } = await supabase
    .from('gateway_tokens')
    .select('owner_id')
    .eq('token', token)
    .maybeSingle()
  if (error) throw new Response(JSON.stringify({ error: 'Falha ao validar token' }), { status: 500 })
  if (!data) throw new Response(JSON.stringify({ error: 'token invalido' }), { status: 401 })
  return data.owner_id as string
}

Deno.serve(async (req) => {
  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '').trim()
  if (!token) return json({ error: 'token obrigatorio' }, 400)

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  let ownerId: string
  try {
    ownerId = await buscarOwnerId(supabase, token)
  } catch (resp) {
    return resp as Response
  }

  if (req.method === 'GET') {
    const { data: pendentes, error: selectError } = await supabase
      .from('lora_comandos')
      .select('id, setor_id, valvula_id, acao, duracao_segundos')
      .eq('owner_id', ownerId)
      .eq('status', 'pendente')
      .order('criado_em', { ascending: true })
      .limit(5)

    if (selectError) return json({ error: 'Falha ao consultar comandos' }, 500)
    return json(pendentes ?? [])
  }

  if (req.method === 'POST') {
    let body: Record<string, unknown>
    try {
      body = await req.json()
    } catch {
      return json({ error: 'JSON invalido' }, 400)
    }

    const id = body.id
    const status = body.status
    if (typeof id !== 'number' && typeof id !== 'string') return json({ error: 'id obrigatorio' }, 400)
    if (status !== 'confirmado' && status !== 'falhou' && status !== 'enviado') {
      return json({ error: 'status invalido' }, 400)
    }

    const { error: updateError } = await supabase
      .from('lora_comandos')
      .update({ status })
      .eq('id', id)
      .eq('owner_id', ownerId)

    if (updateError) return json({ error: 'Falha ao atualizar comando' }, 500)
    return json({ ok: true })
  }

  return json({ error: 'Use GET ou POST' }, 405)
})
