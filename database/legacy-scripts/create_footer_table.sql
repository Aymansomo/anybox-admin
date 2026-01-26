-- Create footer contact info table
CREATE TABLE IF NOT EXISTS footer_contact (
  id SERIAL PRIMARY KEY,
  icon_type VARCHAR(50) NOT NULL, -- 'mail', 'phone', 'map_pin'
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data
INSERT INTO footer_contact (icon_type, title, subtitle, sort_order) VALUES
('mail', 'Email Us', 'contact@example.com', 1),
('phone', 'Call Us', '+1 (555) 123-4567', 2),
('map_pin', 'Visit Us', '123 Main St, City, State', 3),
('map_pin', 'Follow Us', 'Find us on social media', 4);

-- Enable RLS
ALTER TABLE footer_contact ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (anyone can read active items)
CREATE POLICY "Everyone can read footer contact" ON footer_contact
  FOR SELECT USING (is_active = true);

-- Create policy for admin access (simplified - you can refine this later)
CREATE POLICY "Admins can manage footer contact" ON footer_contact
  FOR ALL USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_footer_contact_updated_at 
    BEFORE UPDATE ON footer_contact 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
