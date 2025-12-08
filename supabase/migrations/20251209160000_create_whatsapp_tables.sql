CREATE TABLE IF NOT EXISTS whatsapp_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_phone_number TEXT NOT NULL UNIQUE,
    contact_name TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    status TEXT DEFAULT 'open',
    ai_enabled BOOLEAN DEFAULT FALSE,
    unread_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES whatsapp_conversations(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL, -- 'user' (system/agent), 'contact' (whatsapp user), 'ai' (bot)
    message_type TEXT DEFAULT 'text',
    content TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    status TEXT DEFAULT 'sent', -- 'sent', 'delivered', 'read', 'failed', 'received'
    mega_message_id TEXT UNIQUE,
    metadata JSONB
);

ALTER TABLE whatsapp_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Enable all for authenticated" ON whatsapp_conversations FOR ALL USING (auth.role() = 'authenticated');
    CREATE POLICY "Enable all for authenticated" ON whatsapp_messages FOR ALL USING (auth.role() = 'authenticated');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
