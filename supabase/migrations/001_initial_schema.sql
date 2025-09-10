-- Create flight_schools table
CREATE TABLE IF NOT EXISTS flight_schools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  rating DECIMAL(2, 1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  description TEXT,
  short_description VARCHAR(500),
  image TEXT,
  gallery TEXT[],
  features TEXT[],
  phone VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(255),
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create programs table
CREATE TABLE IF NOT EXISTS programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES flight_schools(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  duration VARCHAR(100),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create study_materials table
CREATE TABLE IF NOT EXISTS study_materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  attachments INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(20) CHECK (role IN ('admin', 'super_admin')) DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_flight_schools_city ON flight_schools(city);
CREATE INDEX idx_flight_schools_country ON flight_schools(country);
CREATE INDEX idx_programs_school_id ON programs(school_id);
CREATE INDEX idx_study_materials_category ON study_materials(category);
CREATE INDEX idx_study_materials_created_at ON study_materials(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_flight_schools_updated_at 
  BEFORE UPDATE ON flight_schools 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_programs_updated_at 
  BEFORE UPDATE ON programs 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_materials_updated_at 
  BEFORE UPDATE ON study_materials 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE flight_schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to flight_schools" 
  ON flight_schools 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow public read access to programs" 
  ON programs 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow public read access to study_materials" 
  ON study_materials 
  FOR SELECT 
  USING (true);

-- Create policies for admin write access
CREATE POLICY "Allow admin insert to flight_schools" 
  ON flight_schools 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Allow admin update to flight_schools" 
  ON flight_schools 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Allow admin delete from flight_schools" 
  ON flight_schools 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Allow admin insert to programs" 
  ON programs 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Allow admin update to programs" 
  ON programs 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Allow admin delete from programs" 
  ON programs 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Allow admin insert to study_materials" 
  ON study_materials 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Allow admin update to study_materials" 
  ON study_materials 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Allow admin delete from study_materials" 
  ON study_materials 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid()
    )
  );

-- Admin users can only be viewed by other admins
CREATE POLICY "Allow admin read access to admin_users" 
  ON admin_users 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid()
    )
  );

-- Insert sample data
INSERT INTO flight_schools (name, location, city, country, rating, review_count, description, short_description, features, phone, email, website, address)
VALUES 
  ('SkyWings Flight School', 'Seoul, South Korea', 'Seoul', 'South Korea', 4.8, 124, 
   'Korea''s premier flight training institution with 30 years of tradition. State-of-the-art facilities and experienced instructors make your aviation dreams come true.',
   'Korea''s premier flight training institution',
   ARRAY['Latest Simulators', '1-on-1 Training', 'Dormitory Available', 'Career Placement'],
   '02-1234-5678', 'info@skywings.kr', 'www.skywings.kr', '123 Airport Blvd, Gangseo-gu, Seoul'),
  
  ('Eagle Aviation Academy', 'Jeju Island, South Korea', 'Jeju', 'South Korea', 4.6, 89,
   'Pursue your aviation dreams in beautiful Jeju Island. We offer optimal flight conditions and professional training systems.',
   'Premium flight school in Jeju Island',
   ARRAY['International Exchange', 'English Training', 'Modern Aircraft', 'Small Classes'],
   '064-987-6543', 'fly@eagleaviation.kr', 'www.eagleaviation.kr', '456 Airport Road, Jeju City');

INSERT INTO study_materials (title, author, category, content, likes, comments, views, attachments)
VALUES
  ('PPL Written Test Complete Study Guide', 'David Kim', 'Written Test',
   'Comprehensive study guide covering all topics for PPL written test. Includes practice questions and detailed explanations.',
   89, 23, 1234, 3),
  
  ('Aviation English Phraseology Handbook', 'Emma Park', 'Language',
   'Complete collection of standard aviation phraseology with Korean translations and pronunciation guides.',
   67, 15, 890, 1),
  
  ('VFR Navigation Chart Reading Tutorial', 'Captain Jung', 'Navigation',
   'Step-by-step guide to reading VFR sectional charts. Includes symbol explanations and practical examples.',
   56, 12, 678, 5);