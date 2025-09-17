-- Seed flight schools data from mockData.ts
-- Insert flight schools with their programs and sample reviews

-- Insert flight schools
INSERT INTO flight_schools (
  id, name, location, city, country, rating, review_count, description, short_description,
  image_url, gallery, features, contact_phone, contact_email, contact_website, contact_address
) VALUES

-- SkyWings Flight School
('11111111-1111-1111-1111-111111111111',
 'SkyWings Flight School',
 'Seoul, South Korea',
 'Seoul',
 'South Korea',
 4.8,
 124,
 'Korea''s premier flight training institution with 30 years of tradition. State-of-the-art facilities and experienced instructors make your aviation dreams come true.',
 'Korea''s premier flight training institution',
 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=800',
 '["https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=800", "https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=800", "https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=800"]'::jsonb,
 '["Latest Simulators", "1-on-1 Training", "Dormitory Available", "Career Placement"]'::jsonb,
 '02-1234-5678',
 'info@skywings.kr',
 'www.skywings.kr',
 '123 Airport Blvd, Gangseo-gu, Seoul'),

-- Eagle Aviation Academy
('22222222-2222-2222-2222-222222222222',
 'Eagle Aviation Academy',
 'Jeju Island, South Korea',
 'Jeju',
 'South Korea',
 4.6,
 89,
 'Pursue your aviation dreams in beautiful Jeju Island. We offer optimal flight conditions and professional training systems.',
 'Premium flight school in Jeju Island',
 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=800',
 '[]'::jsonb,
 '["International Exchange", "English Training", "Modern Aircraft", "Small Classes"]'::jsonb,
 '064-987-6543',
 'fly@eagleaviation.kr',
 'www.eagleaviation.kr',
 '456 Airport Road, Jeju City'),

-- BlueSky Flight Center
('33333333-3333-3333-3333-333333333333',
 'BlueSky Flight Center',
 'Busan, South Korea',
 'Busan',
 'South Korea',
 4.9,
 156,
 'Busan''s premier flight training center with international standard curriculum and cutting-edge facilities.',
 'Busan''s premier flight training center',
 'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=800',
 '[]'::jsonb,
 '["International Certification", "ATPL Program", "24/7 Facility Access", "Mentoring Program"]'::jsonb,
 '051-555-7777',
 'contact@bluesky.kr',
 'www.bluesky.kr',
 '789 Aviation Way, Gangseo-gu, Busan'),

-- Aero Dream Academy
('44444444-4444-4444-4444-444444444444',
 'Aero Dream Academy',
 'Incheon, South Korea',
 'Incheon',
 'South Korea',
 4.5,
 72,
 'Conveniently located near Incheon International Airport. Professional training at reasonable rates.',
 'Flight school near Incheon Airport',
 'https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=800',
 '[]'::jsonb,
 '["Airport Adjacent", "Flexible Schedule", "Online Training", "Scholarship Program"]'::jsonb,
 '032-888-9999',
 'info@aerodream.kr',
 'www.aerodream.kr',
 '321 Airport Road, Jung-gu, Incheon'),

-- Skyway Flight School
('55555555-5555-5555-5555-555555555555',
 'Skyway Flight School',
 'Daejeon, South Korea',
 'Daejeon',
 'South Korea',
 4.7,
 93,
 'Central Korea''s largest flight training facility. Systematic curriculum with excellent instructors.',
 'Central Korea''s largest flight facility',
 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800',
 '[]'::jsonb,
 '["Large Training Area", "Weather Training", "Aircraft Maintenance", "Corporate Partners"]'::jsonb,
 '042-333-4444',
 'fly@skyway.kr',
 'www.skyway.kr',
 '111 Flight Road, Yuseong-gu, Daejeon'),

-- Horizon Aviation Training
('66666666-6666-6666-6666-666666666666',
 'Horizon Aviation Training',
 'Los Angeles, USA',
 'Los Angeles',
 'USA',
 4.4,
 45,
 'Professional flight training center offering comprehensive aviation programs. No visual marketing materials available at this time.',
 'Professional aviation training center',
 NULL,
 '[]'::jsonb,
 '["FAA Certified", "Year-round Flying", "International Students", "Housing Assistance"]'::jsonb,
 '+1-310-555-0123',
 'training@horizonaviation.com',
 'www.horizonaviation.com',
 '500 Aviation Circle, Los Angeles, CA 90045')

ON CONFLICT (id) DO NOTHING;

-- Insert programs
INSERT INTO programs (
  id, flight_school_id, name, duration, description
) VALUES

-- SkyWings programs
('p1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
 'Private Pilot License (PPL)', '6 months', 'Foundation course for personal flying'),
('p1111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111',
 'Commercial Pilot License (CPL)', '18 months', 'Professional course for airline careers'),

-- Eagle Aviation programs
('p2222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222',
 'Recreational Flying Course', '3 months', 'Introduction course for hobby flying'),

-- Horizon Aviation programs
('p6666666-6666-6666-6666-666666666661', '66666666-6666-6666-6666-666666666666',
 'Integrated ATPL Program', '24 months', 'Complete airline pilot training from zero to ATPL'),
('p6666666-6666-6666-6666-666666666662', '66666666-6666-6666-6666-666666666666',
 'Instrument Rating (IR)', '2 months', 'Advanced navigation and weather flying')

ON CONFLICT (id) DO NOTHING;

-- Create indexes after data insertion
CREATE INDEX IF NOT EXISTS idx_flight_schools_name ON flight_schools USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_flight_schools_description ON flight_schools USING gin(to_tsvector('english', description));

-- Add full-text search function
CREATE OR REPLACE FUNCTION search_flight_schools(search_query TEXT)
RETURNS TABLE(
  id UUID,
  name VARCHAR(255),
  location VARCHAR(255),
  city VARCHAR(100),
  country VARCHAR(100),
  rating DECIMAL(2,1),
  review_count INTEGER,
  description TEXT,
  short_description TEXT,
  image_url TEXT,
  features JSONB,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    fs.id,
    fs.name,
    fs.location,
    fs.city,
    fs.country,
    fs.rating,
    fs.review_count,
    fs.description,
    fs.short_description,
    fs.image_url,
    fs.features,
    ts_rank(
      to_tsvector('english', fs.name || ' ' || fs.location || ' ' || fs.description),
      plainto_tsquery('english', search_query)
    ) as rank
  FROM flight_schools fs
  WHERE
    fs.is_active = true
    AND (
      search_query = ''
      OR to_tsvector('english', fs.name || ' ' || fs.location || ' ' || fs.description) @@ plainto_tsquery('english', search_query)
      OR fs.name ILIKE '%' || search_query || '%'
      OR fs.location ILIKE '%' || search_query || '%'
    )
  ORDER BY
    CASE WHEN search_query = '' THEN fs.rating ELSE rank END DESC,
    fs.review_count DESC,
    fs.name;
END;
$$ LANGUAGE plpgsql;