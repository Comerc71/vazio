-- Yassena Campo — schema inicial do Supabase
-- Rode este arquivo inteiro em: Supabase Dashboard > SQL Editor > New query > Run
-- (projeto novo, execução única)

-- ---------------------------------------------------------
-- Perfis (dados da fazenda/usuário, 1:1 com auth.users)
-- ---------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  farm_name text,
  city text,
  hectares numeric,
  phone text,
  activity text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: usuário vê o próprio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: usuário edita o próprio perfil"
  on public.profiles for update
  using (auth.uid() = id);

-- Cria o perfil automaticamente quando alguém completa o cadastro,
-- copiando os dados extras enviados em auth.signUp({ options: { data: {...} } })
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, farm_name, city, hectares, phone, activity)
  values (
    new.id,
    new.raw_user_meta_data ->> 'name',
    new.raw_user_meta_data ->> 'farm_name',
    new.raw_user_meta_data ->> 'city',
    nullif(new.raw_user_meta_data ->> 'hectares', '')::numeric,
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'activity'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------
-- Dispositivos (sensores e atuadores da fazenda, por usuário)
-- ---------------------------------------------------------
create table public.devices (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  location text,
  type text not null default 'outro'
    check (type in ('umidade', 'silo', 'cerca', 'bomba', 'clima', 'valvula', 'outro')),
  kind text not null default 'sensor' check (kind in ('sensor', 'actuator')),
  status text not null default 'ok' check (status in ('ok', 'atencao', 'alerta')),
  signal smallint not null default 4 check (signal between 0 and 4),
  reading text,
  sub text,
  lat double precision not null,
  lon double precision not null,
  actuator_state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.devices enable row level security;

create policy "devices: dono gerencia seus dispositivos"
  on public.devices for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger devices_set_updated_at
  before update on public.devices
  for each row execute procedure public.set_updated_at();

-- ---------------------------------------------------------
-- Histórico de leituras (alimenta o sparkline de cada sensor)
-- ---------------------------------------------------------
create table public.device_readings (
  id bigint generated always as identity primary key,
  device_id uuid not null references public.devices (id) on delete cascade,
  value numeric not null,
  recorded_at timestamptz not null default now()
);

alter table public.device_readings enable row level security;

create policy "device_readings: dono vê leituras dos seus dispositivos"
  on public.device_readings for select
  using (
    exists (
      select 1 from public.devices d
      where d.id = device_readings.device_id and d.owner_id = auth.uid()
    )
  );

create policy "device_readings: dono insere leituras dos seus dispositivos"
  on public.device_readings for insert
  with check (
    exists (
      select 1 from public.devices d
      where d.id = device_readings.device_id and d.owner_id = auth.uid()
    )
  );

-- ---------------------------------------------------------
-- Alertas
-- ---------------------------------------------------------
create table public.alerts (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users (id) on delete cascade,
  device_id uuid references public.devices (id) on delete set null,
  title text not null,
  level text not null default 'info' check (level in ('ok', 'atencao', 'info')),
  created_at timestamptz not null default now()
);

alter table public.alerts enable row level security;

create policy "alerts: dono vê seus alertas"
  on public.alerts for select
  using (auth.uid() = owner_id);

create policy "alerts: dono cria seus alertas"
  on public.alerts for insert
  with check (auth.uid() = owner_id);

-- ---------------------------------------------------------
-- Realtime: permite que o app sincronize a lista de dispositivos
-- entre abas/dispositivos assim que uma linha muda
-- ---------------------------------------------------------
alter publication supabase_realtime add table public.devices;
