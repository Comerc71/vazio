-- Permite disparar comandos de valvula pelo dashboard.
-- Rode em: Supabase Dashboard > SQL Editor > New query > Run.

-- Numero da valvula que este dispositivo controla (bate com o rele/saida no
-- Campo daquele setor - ver PINOS_VALVULA em campo_main.cpp).
alter table public.devices add column if not exists valvula_id smallint not null default 1;
