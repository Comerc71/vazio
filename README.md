# Yassena Campo

App de monitoramento e controle remoto de sensores agrícolas (RF/LoRa), construído com React + Vite, Supabase (autenticação e banco de dados) e empacotado como PWA instalável.

## Rodando localmente

```bash
npm install
cp .env.example .env   # preencha com as chaves do seu projeto Supabase
npm run dev
```

Abre em `http://localhost:5173`.

## Estrutura

- [`src/YassenaCampoApp.jsx`](src/YassenaCampoApp.jsx) — componente principal do app (telas e estilos).
- [`src/App.jsx`](src/App.jsx) — ponto de entrada que renderiza `YassenaCampoApp`.
- [`src/lib/`](src/lib/) — integração com Supabase: `auth.js` (login/cadastro/verificação), `devices.js` (CRUD + sincronização em tempo real de dispositivos), `geolocation.js` (captura de GPS).
- [`supabase/schema.sql`](supabase/schema.sql) — schema do banco (tabelas `profiles`, `devices`, `device_readings`, `alerts`, todas com Row Level Security).
- [`public/icon.svg`](public/icon.svg) — ícone-fonte do PWA; os demais tamanhos (`pwa-*.png`, `favicon.ico`, `apple-touch-icon`) são gerados automaticamente a cada `npm run build` pelo `vite-plugin-pwa`.
- Ícones de interface via [`lucide-react`](https://lucide.dev/); mapa via [`react-leaflet`](https://react-leaflet.js.org/) + OpenStreetMap.

## Deploy no Netlify

1. Suba este repositório para o GitHub.
2. No Netlify: **Add new site → Import an existing project → GitHub** e escolha o repositório. As configurações de build já vêm do [`netlify.toml`](netlify.toml) (`npm run build`, pasta `dist`).
3. Em **Site settings → Environment variables**, adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (os mesmos valores do seu `.env` local).
4. Depois do primeiro deploy, copie a URL do site (ex: `https://seu-site.netlify.app`) e adicione em **Supabase → Authentication → URL Configuration**, tanto em "Site URL" quanto em "Redirect URLs" — sem isso, o link de confirmação de e-mail não vai voltar para o site publicado.
5. Cada push para a branch principal do GitHub gera um novo deploy automático.
