// Envia pelo Netlify Forms (form estático "sugestoes" declarado em index.html) —
// o Netlify intercepta esse POST no servidor e dispara a notificação por e-mail
// configurada em Site configuration > Forms > Form notifications.
export async function submitSuggestion({ type, name, email, message, preferredDate }) {
  const body = new URLSearchParams({
    'form-name': 'sugestoes',
    tipo: type,
    nome: name || '',
    email: email || '',
    mensagem: message,
    data_preferida: preferredDate || '',
    empresa: '',
  })
  const res = await fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })
  if (!res.ok) throw new Error('Falha ao enviar sugestão')
}
