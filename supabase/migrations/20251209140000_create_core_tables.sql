-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Units Table
CREATE TABLE IF NOT EXISTS units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    sigla TEXT,
    address_city TEXT,
    address_state TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Professionals Table
CREATE TABLE IF NOT EXISTS professionals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    cpf TEXT NOT NULL,
    whatsapp TEXT,
    unit_id UUID REFERENCES units(id),
    role TEXT,
    status TEXT DEFAULT 'Ativo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(cpf)
);

-- Instructors Table
CREATE TABLE IF NOT EXISTS instructors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    cpf TEXT,
    unit_id UUID REFERENCES units(id),
    role TEXT,
    area TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trainings Table
CREATE TABLE IF NOT EXISTS trainings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    hours TEXT,
    capacity INTEGER,
    status TEXT DEFAULT 'Ativo',
    instructor_id UUID REFERENCES instructors(id),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professional_id UUID REFERENCES professionals(id) NOT NULL,
    training_id UUID REFERENCES trainings(id),
    training_name TEXT, -- Fallback if training_id is not used or denormalized
    date DATE NOT NULL,
    channel TEXT,
    status TEXT DEFAULT 'Agendado',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Appointment History
CREATE TABLE IF NOT EXISTS appointment_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    updated_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Communications (Notifications)
CREATE TABLE IF NOT EXISTS communications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_name TEXT,
    recipient_contact TEXT,
    channel TEXT,
    content TEXT,
    status TEXT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    metadata JSONB
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT,
    entity TEXT,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed Storage Buckets (Attempt)
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('materials', 'materials', true) ON CONFLICT DO NOTHING;

-- RLS Setup
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ BEGIN
    CREATE POLICY "Enable all for authenticated" ON units FOR ALL USING (auth.role() = 'authenticated');
    CREATE POLICY "Enable all for authenticated" ON professionals FOR ALL USING (auth.role() = 'authenticated');
    CREATE POLICY "Enable all for authenticated" ON instructors FOR ALL USING (auth.role() = 'authenticated');
    CREATE POLICY "Enable all for authenticated" ON trainings FOR ALL USING (auth.role() = 'authenticated');
    CREATE POLICY "Enable all for authenticated" ON appointments FOR ALL USING (auth.role() = 'authenticated');
    CREATE POLICY "Enable all for authenticated" ON appointment_history FOR ALL USING (auth.role() = 'authenticated');
    CREATE POLICY "Enable all for authenticated" ON communications FOR ALL USING (auth.role() = 'authenticated');
    CREATE POLICY "Enable all for authenticated" ON audit_logs FOR ALL USING (auth.role() = 'authenticated');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Storage Policies
DO $$ BEGIN
    CREATE POLICY "Public Access Avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
    CREATE POLICY "Auth Upload Avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
    CREATE POLICY "Public Access Materials" ON storage.objects FOR SELECT USING (bucket_id = 'materials');
    CREATE POLICY "Auth Upload Materials" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'materials' AND auth.role() = 'authenticated');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
