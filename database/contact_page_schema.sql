-- Contact Us Page Management Schema
-- This SQL creates the necessary tables for the Contact Us editor functionality

-- 1. Contact Page Content Table
-- Stores the main content for the contact page
CREATE TABLE IF NOT EXISTS contact_page_content (
    id SERIAL PRIMARY KEY,
    hero_title VARCHAR(255) NOT NULL DEFAULT 'Contact Us',
    hero_description TEXT NOT NULL DEFAULT 'Have questions about our products? Need technical support? We''re here to help!',
    form_title VARCHAR(255) NOT NULL DEFAULT 'Send us a Message',
    business_hours_title VARCHAR(255) NOT NULL DEFAULT 'Business Hours',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Contact Business Hours Table
-- Stores business hours information
CREATE TABLE IF NOT EXISTS contact_business_hours (
    id SERIAL PRIMARY KEY,
    day VARCHAR(100) NOT NULL,
    hours VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Contact Form Subjects Table
-- Stores the dropdown options for the contact form
CREATE TABLE IF NOT EXISTS contact_form_subjects (
    id SERIAL PRIMARY KEY,
    value VARCHAR(100) NOT NULL UNIQUE, -- The form value (e.g., 'general', 'technical')
    label VARCHAR(100) NOT NULL, -- The display label (e.g., 'General Inquiry')
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default data for contact page content
INSERT INTO contact_page_content (hero_title, hero_description, form_title, business_hours_title, is_active)
VALUES (
    'Contact Us',
    'Have questions about our products? Need technical support? We''re here to help!',
    'Send us a Message',
    'Business Hours',
    true
)
ON CONFLICT DO NOTHING;

-- Insert default business hours
INSERT INTO contact_business_hours (day, hours, is_active, sort_order)
VALUES 
    ('Monday - Friday', '9:00 AM - 6:00 PM', true, 1),
    ('Saturday', '10:00 AM - 4:00 PM', true, 2),
    ('Sunday', 'Closed', true, 3)
ON CONFLICT DO NOTHING;

-- Insert default form subjects
INSERT INTO contact_form_subjects (value, label, is_active, sort_order)
VALUES 
    ('general', 'General Inquiry', true, 1),
    ('technical', 'Technical Support', true, 2),
    ('order', 'Order Status', true, 3),
    ('return', 'Returns & Refunds', true, 4),
    ('partnership', 'Partnership', true, 5)
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contact_business_hours_active ON contact_business_hours(is_active);
CREATE INDEX IF NOT EXISTS idx_contact_business_hours_sort ON contact_business_hours(sort_order);
CREATE INDEX IF NOT EXISTS idx_contact_form_subjects_active ON contact_form_subjects(is_active);
CREATE INDEX IF NOT EXISTS idx_contact_form_subjects_sort ON contact_form_subjects(sort_order);
CREATE INDEX IF NOT EXISTS idx_contact_form_subjects_value ON contact_form_subjects(value);

-- Add RLS (Row Level Security) policies if using Supabase
-- Uncomment these lines if you're using Supabase and need RLS

-- ALTER TABLE contact_page_content ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE contact_business_hours ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE contact_form_subjects ENABLE ROW LEVEL SECURITY;

-- -- Policy for contact_page_content
-- CREATE POLICY "Admins can manage contact page content" ON contact_page_content
--     FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- -- Policy for contact_business_hours  
-- CREATE POLICY "Admins can manage business hours" ON contact_business_hours
--     FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- -- Policy for contact_form_subjects
-- CREATE POLICY "Admins can manage form subjects" ON contact_form_subjects
--     FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Create updated_at trigger function (PostgreSQL)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_contact_page_content_updated_at 
    BEFORE UPDATE ON contact_page_content 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_business_hours_updated_at 
    BEFORE UPDATE ON contact_business_hours 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_form_subjects_updated_at 
    BEFORE UPDATE ON contact_form_subjects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
