create table if not exists public.whatsapp_conversations (
    id uuid default gen_random_uuid() primary key,
    contact_phone_number text unique not null,
    contact_name text,
    status text default 'open',
    unread_count integer default 0,
    last_message_at timestamp with time zone default timezone('utc'::text, now()),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.whatsapp_conversations enable row level security;
create policy "Authenticated users can view conversations" on public.whatsapp_conversations for select to authenticated using (true);

create table if not exists public.whatsapp_messages (
    id uuid default gen_random_uuid() primary key,
    conversation_id uuid references public.whatsapp_conversations(id) on delete cascade,
    sender_type text not null,
    message_type text default 'text' not null,
    content text,
    media_url text,
    status text default 'sent',
    timestamp timestamp with time zone default timezone('utc'::text, now()),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.whatsapp_messages enable row level security;
create policy "Authenticated users can view messages" on public.whatsapp_messages for select to authenticated using (true);
