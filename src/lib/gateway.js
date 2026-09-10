import { supabase } from './supabaseClient'

// Token de gateway: um por conta, usado pela Base (firmware) pra buscar o
// pareamento "setor -> device_id/api_key" na função gateway-pareamento.
export async function getOrCreateGatewayToken() {
  const { data: { user } } = await supabase.auth.getUser()

  const { data: existing, error: selectError } = await supabase
    .from('gateway_tokens')
    .select('token')
    .eq('owner_id', user.id)
    .maybeSingle()
  if (selectError) throw selectError
  if (existing) return existing.token

  const { data: created, error: insertError } = await supabase
    .from('gateway_tokens')
    .insert({ owner_id: user.id })
    .select('token')
    .single()
  if (insertError) throw insertError
  return created.token
}

export async function regenerateGatewayToken() {
  const { data: { user } } = await supabase.auth.getUser()
  const bytes = crypto.getRandomValues(new Uint8Array(24))
  const token = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')

  const { error } = await supabase
    .from('gateway_tokens')
    .upsert({ owner_id: user.id, token })
  if (error) throw error
  return token
}
