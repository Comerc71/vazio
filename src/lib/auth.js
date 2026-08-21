import { supabase } from './supabaseClient'

export async function signUp({ email, password, name, farmName, city, hectares, phone, activity }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: window.location.origin,
      data: {
        name,
        farm_name: farmName,
        city,
        hectares: hectares || null,
        phone,
        activity,
      },
    },
  })
  if (error) throw error
  return data
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function resendConfirmation(email) {
  const { error } = await supabase.auth.resend({ type: 'signup', email })
  if (error) throw error
}

export async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('name, farm_name, city, hectares, phone, activity')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}

const ERROR_MESSAGES = [
  [/invalid login credentials/i, 'E-mail ou senha incorretos.'],
  [/email not confirmed/i, 'Confirme seu e-mail antes de entrar — veja sua caixa de entrada.'],
  [/user already registered/i, 'Já existe uma conta com este e-mail.'],
  [/password should be at least/i, 'A senha deve ter pelo menos 6 caracteres.'],
  [/unable to validate email address/i, 'Digite um e-mail válido.'],
  [/for security purposes/i, 'Aguarde alguns segundos antes de tentar de novo.'],
]

export function authErrorMessage(error) {
  const msg = error?.message || ''
  const match = ERROR_MESSAGES.find(([re]) => re.test(msg))
  return match ? match[1] : 'Algo deu errado. Tente novamente em instantes.'
}
