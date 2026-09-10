-- Pareamento setor (radio LoRa) <-> dispositivo do app, pelo proprio produtor.
-- Rode este script inteiro em: Supabase Dashboard > SQL Editor > New query > Run.
-- (nao mexe em nenhuma tabela/politica existente, so adiciona)

-- ---------------------------------------------------------
-- Numero do setor de radio de cada dispositivo (digitado no app,
-- deve bater com o numero configurado no DIP switch da placa de Campo).
-- ---------------------------------------------------------
alter table public.devices add column if not exists setor_id smallint;

-- Nao ha indice unico aqui de proposito: um setor pode ter mais de um
-- dispositivo (ex: um sensor de umidade e uma valvula no mesmo talhao).

-- ---------------------------------------------------------
-- Token do gateway (Base): um por conta/fazenda, configurado uma unica vez
-- no firmware da Base (nao por setor/dispositivo). A Base usa esse token
-- pra buscar, via Edge Function, a lista atualizada de "setor -> device_id/api_key"
-- sem precisar de credenciais de login completas gravadas no dispositivo.
-- ---------------------------------------------------------
create table if not exists public.gateway_tokens (
  owner_id uuid primary key references auth.users (id) on delete cascade,
  token text not null unique default encode(gen_random_bytes(24), 'hex'),
  created_at timestamptz not null default now()
);

alter table public.gateway_tokens enable row level security;

drop policy if exists "gateway_tokens: dono ve seu token" on public.gateway_tokens;
create policy "gateway_tokens: dono ve seu token"
  on public.gateway_tokens for select
  using (auth.uid() = owner_id);

drop policy if exists "gateway_tokens: dono cria seu token" on public.gateway_tokens;
create policy "gateway_tokens: dono cria seu token"
  on public.gateway_tokens for insert
  with check (auth.uid() = owner_id);

drop policy if exists "gateway_tokens: dono atualiza seu token" on public.gateway_tokens;
create policy "gateway_tokens: dono atualiza seu token"
  on public.gateway_tokens for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);
