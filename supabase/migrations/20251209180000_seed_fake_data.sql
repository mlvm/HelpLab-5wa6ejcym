-- Seed Units
INSERT INTO units (name, type, sigla, address_city, address_state, active)
VALUES
    ('Hospital Santa Casa', 'Hospital', 'HSC', 'São Paulo', 'SP', true),
    ('UBS Vila Mariana', 'UBS', 'UBSVM', 'São Paulo', 'SP', true),
    ('Clínica Bem Estar', 'Clínica', 'CBE', 'Campinas', 'SP', true),
    ('Hospital Regional', 'Hospital', 'HR', 'Santos', 'SP', true),
    ('Centro de Treinamento', 'Outros', 'CT', 'São Paulo', 'SP', true);

-- Seed Instructors
INSERT INTO instructors (name, cpf, unit_id, role, area, active)
SELECT
    'Instrutor ' || n,
    lpad(n::text, 11, '0'),
    (SELECT id FROM units ORDER BY random() LIMIT 1),
    CASE WHEN n % 2 = 0 THEN 'Instrutor Senior' ELSE 'Instrutor Junior' END,
    CASE WHEN n % 3 = 0 THEN 'Enfermagem' WHEN n % 3 = 1 THEN 'Primeiros Socorros' ELSE 'Administrativo' END,
    true
FROM generate_series(1, 5) n;

-- Seed Trainings
INSERT INTO trainings (name, hours, capacity, status, instructor_id, description)
SELECT
    'Treinamento de ' || area,
    (floor(random() * 8 + 1)::int)::text || 'h',
    20,
    'Ativo',
    id,
    'Treinamento prático e teórico focado em ' || area
FROM instructors;

-- Seed Professionals
INSERT INTO professionals (name, cpf, whatsapp, unit_id, role, status)
SELECT
    'Profissional ' || n,
    lpad((n + 1000)::text, 11, '0'),
    '55119' || lpad(n::text, 8, '0'),
    (SELECT id FROM units ORDER BY random() LIMIT 1),
    CASE WHEN n % 4 = 0 THEN 'Médico' WHEN n % 4 = 1 THEN 'Enfermeiro' WHEN n % 4 = 2 THEN 'Técnico' ELSE 'Recepcionista' END,
    'Ativo'
FROM generate_series(1, 15) n
ON CONFLICT (cpf) DO NOTHING;

-- Seed Appointments
-- Generate 30 random appointments in the next/past 15 days
INSERT INTO appointments (professional_id, training_id, training_name, date, channel, status)
SELECT
    p.id,
    t.id,
    t.name,
    CURRENT_DATE + ((floor(random() * 30) - 15) || ' days')::interval,
    CASE WHEN random() > 0.5 THEN 'WhatsApp' ELSE 'Portal' END,
    CASE WHEN random() > 0.8 THEN 'Cancelado' WHEN random() > 0.5 THEN 'Concluído' ELSE 'Agendado' END
FROM generate_series(1, 30) i
CROSS JOIN LATERAL (SELECT id FROM professionals ORDER BY random() LIMIT 1) p
CROSS JOIN LATERAL (SELECT id, name FROM trainings ORDER BY random() LIMIT 1) t;

-- Seed Appointment History
-- Add history entry for each appointment created
INSERT INTO appointment_history (appointment_id, status, updated_by, created_at)
SELECT
    id,
    status,
    'Sistema (Seed)',
    created_at
FROM appointments
WHERE id NOT IN (SELECT appointment_id FROM appointment_history);

-- Seed Whatsapp Conversations
INSERT INTO whatsapp_conversations (contact_phone_number, contact_name, status, unread_count, last_message_at)
SELECT
    '551198' || lpad(n::text, 7, '0'),
    'Contato WhatsApp ' || n,
    CASE WHEN n % 3 = 0 THEN 'closed' ELSE 'open' END,
    floor(random() * 5)::int,
    NOW() - ((floor(random() * 1000)) || ' minutes')::interval
FROM generate_series(1, 10) n
ON CONFLICT (contact_phone_number) DO NOTHING;

-- Seed Whatsapp Messages
-- Add random messages to conversations
INSERT INTO whatsapp_messages (conversation_id, sender_type, message_type, content, status, timestamp)
SELECT
    c.id,
    CASE WHEN m % 2 = 0 THEN 'contact' ELSE 'user' END,
    'text',
    CASE 
        WHEN m % 2 = 0 THEN 'Olá, gostaria de saber mais sobre o agendamento.' 
        ELSE 'Claro, como posso ajudar?' 
    END,
    'sent',
    c.last_message_at - ((5 - m) || ' minutes')::interval
FROM whatsapp_conversations c
CROSS JOIN generate_series(1, 4) m;

-- Seed Profiles and User Settings
-- Iterates over existing Auth Users to create profiles and settings if missing
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN SELECT id, email FROM auth.users LOOP
        -- Create Profile if not exists
        INSERT INTO public.profiles (id, name, cpf, unit, status, avatar_url)
        VALUES (
            user_record.id,
            COALESCE(split_part(user_record.email, '@', 1), 'Usuário'),
            lpad(floor(random() * 10000000000)::text, 11, '0'), -- Random CPF
            'Hospital Santa Casa',
            'active',
            'https://github.com/shadcn.png'
        )
        ON CONFLICT (id) DO NOTHING;

        -- Create User Settings if not exists
        INSERT INTO public.user_settings (user_id, mega_api_instance_key, mega_api_token)
        VALUES (
            user_record.id,
            'mega_api_key_' || substr(md5(random()::text), 1, 8),
            'mega_api_token_' || substr(md5(random()::text), 1, 8)
        )
        ON CONFLICT (user_id) DO NOTHING;
    END LOOP;
END $$;
