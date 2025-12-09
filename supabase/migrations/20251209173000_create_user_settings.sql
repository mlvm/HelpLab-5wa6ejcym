create table if not exists public.user_settings (
    user_id uuid references auth.users(id) on delete cascade primary key,
    mega_api_instance_key text,
    mega_api_token text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.user_settings enable row level security;
create policy "Users can view own settings" on public.user_settings for select to authenticated using (auth.uid() = user_id);
create policy "Users can update own settings" on public.user_settings for update to authenticated using (auth.uid() = user_id);
create policy "Users can insert own settings" on public.user_settings for insert to authenticated with check (auth.uid() = user_id);
