create table if not exists public.units (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  type text not null,
  sigla text not null,
  address_city text not null,
  address_state text not null,
  active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.units enable row level security;
create policy "Authenticated users can view units" on public.units for select to authenticated using (true);

create table if not exists public.instructors (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  cpf text not null,
  unit_id uuid references public.units(id) on delete set null,
  role text not null,
  area text not null,
  active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.instructors enable row level security;
create policy "Authenticated users can view instructors" on public.instructors for select to authenticated using (true);

create table if not exists public.trainings (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  hours text not null,
  capacity integer default 0 not null,
  status text not null,
  instructor_id uuid references public.instructors(id) on delete set null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.trainings enable row level security;
create policy "Authenticated users can view trainings" on public.trainings for select to authenticated using (true);

create table if not exists public.professionals (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  cpf text unique not null,
  whatsapp text,
  unit_id uuid references public.units(id) on delete set null,
  role text not null,
  status text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.professionals enable row level security;
create policy "Authenticated users can view professionals" on public.professionals for select to authenticated using (true);

create table if not exists public.appointments (
  id uuid default gen_random_uuid() primary key,
  professional_id uuid references public.professionals(id) on delete cascade,
  training_id uuid references public.trainings(id) on delete cascade,
  training_name text not null,
  date timestamp with time zone not null,
  channel text not null,
  status text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.appointments enable row level security;
create policy "Authenticated users can view appointments" on public.appointments for select to authenticated using (true);
create policy "Authenticated users can insert appointments" on public.appointments for insert to authenticated with check (true);
create policy "Authenticated users can update appointments" on public.appointments for update to authenticated using (true);

create table if not exists public.appointment_history (
  id uuid default gen_random_uuid() primary key,
  appointment_id uuid references public.appointments(id) on delete cascade,
  status text not null,
  updated_by text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.appointment_history enable row level security;
create policy "Authenticated users can view appointment history" on public.appointment_history for select to authenticated using (true);
