import { supabase } from './supabaseClient'

const SELECT_COLUMNS = 'id, name, location, type, status, signal, reading, sub, lat, lon, updated_at'

export async function listDevices() {
  const { data, error } = await supabase
    .from('devices')
    .select(SELECT_COLUMNS)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function insertDevice({ name, location, type, lat, lon }) {
  const { data: { user } } = await supabase.auth.getUser()
  const { error } = await supabase.from('devices').insert({
    owner_id: user.id,
    name,
    location,
    type,
    lat,
    lon,
  })
  if (error) throw error
}

export async function updateDevice(id, patch) {
  const { error } = await supabase.from('devices').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteDevice(id) {
  const { error } = await supabase.from('devices').delete().eq('id', id)
  if (error) throw error
}

export function subscribeToDevices(ownerId, onChange) {
  const channel = supabase
    .channel(`devices-${ownerId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'devices', filter: `owner_id=eq.${ownerId}` },
      onChange
    )
    .subscribe()
  return () => supabase.removeChannel(channel)
}
