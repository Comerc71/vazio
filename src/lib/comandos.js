import { supabase } from './supabaseClient'

// Comandos de valvula: a Base (firmware) ja consulta lora_comandos a cada 5s
// e envia por LoRa pro setor certo (ver consultarComandosPendentes em base_main.cpp).
export async function enviarComandoValvula({ setorId, valvulaId, acao, duracaoSegundos }) {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('lora_comandos')
    .insert({
      owner_id: user.id,
      setor_id: setorId,
      valvula_id: valvulaId,
      acao,
      duracao_segundos: duracaoSegundos,
    })
    .select('id')
    .single()
  if (error) throw error
  return data.id
}

export async function consultarStatusComando(id) {
  const { data, error } = await supabase
    .from('lora_comandos')
    .select('status')
    .eq('id', id)
    .single()
  if (error) throw error
  return data.status
}
