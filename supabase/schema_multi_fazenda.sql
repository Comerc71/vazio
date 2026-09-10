-- Isola lora_telemetria/lora_comandos por fazenda (owner_id), pra varias contas
-- poderem usar o mesmo backend ao mesmo tempo sem uma ver/controlar a outra.
-- Rode em: Supabase Dashboard > SQL Editor > New query > Run.
--
-- Depois deste script, a Base NAO fala mais direto com /rest/v1/lora_telemetria
-- nem /rest/v1/lora_comandos usando a chave anon (isso ficaria aberto pra
-- qualquer fazenda). Ela passa a falar so com as Edge Functions
-- gateway-telemetria e gateway-comandos, autenticadas pelo GATEWAY_TOKEN -
-- veja supabase/functions/gateway-telemetria/index.ts e
-- supabase/functions/gateway-comandos/index.ts.

alter table public.lora_telemetria add column if not exists owner_id uuid references auth.users (id) on delete cascade;
alter table public.lora_comandos add column if not exists owner_id uuid references auth.users (id) on delete cascade;

create index if not exists lora_telemetria_owner_idx on public.lora_telemetria (owner_id, criado_em desc);
create index if not exists lora_comandos_owner_idx on public.lora_comandos (owner_id, status, criado_em);

-- Remove as politicas antigas, abertas pra qualquer chave anon.
drop policy if exists lora_telemetria_anon_all on public.lora_telemetria;
drop policy if exists lora_comandos_anon_all on public.lora_comandos;

-- lora_telemetria: so a propria Base grava (via gateway-telemetria, com
-- service_role - ignora RLS). O dono pode ler seus proprios registros, caso o
-- app queira mostrar isso no futuro.
drop policy if exists "lora_telemetria: dono ve suas leituras" on public.lora_telemetria;
create policy "lora_telemetria: dono ve suas leituras"
  on public.lora_telemetria for select
  using (auth.uid() = owner_id);

-- lora_comandos: o dono cria e ve seus proprios comandos (o botao Abrir/Fechar
-- no app faz isso direto, autenticado). A Base le/atualiza via
-- gateway-comandos (service_role), sempre filtrando pelo owner_id do token.
drop policy if exists "lora_comandos: dono cria seus comandos" on public.lora_comandos;
create policy "lora_comandos: dono cria seus comandos"
  on public.lora_comandos for insert
  with check (auth.uid() = owner_id);

drop policy if exists "lora_comandos: dono ve seus comandos" on public.lora_comandos;
create policy "lora_comandos: dono ve seus comandos"
  on public.lora_comandos for select
  using (auth.uid() = owner_id);
