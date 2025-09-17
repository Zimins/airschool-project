-- Create flight schools and related tables
-- Based on mockData.ts structure

-- Flight Schools table
CREATE TABLE flight_schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  rating DECIMAL(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  description TEXT,
  short_description TEXT,
  image_url TEXT,
  gallery JSONB DEFAULT '[]'::jsonb,
  features JSONB DEFAULT '[]'::jsonb,
  contact_phone VARCHAR(50),
  contact_email VARCHAR(255),
  contact_website VARCHAR(255),
  contact_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Programs table
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_school_id UUID REFERENCES flight_schools(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  duration VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_school_id UUID REFERENCES flight_schools(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name VARCHAR(255) NOT NULL,
  user_avatar TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_flight_schools_location ON flight_schools(location);
CREATE INDEX idx_flight_schools_city ON flight_schools(city);
CREATE INDEX idx_flight_schools_rating ON flight_schools(rating);
CREATE INDEX idx_flight_schools_active ON flight_schools(is_active);

CREATE INDEX idx_programs_school ON programs(flight_school_id);

CREATE INDEX idx_reviews_school ON reviews(flight_school_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created ON reviews(created_at);

-- Add constraints
ALTER TABLE flight_schools ADD CONSTRAINT valid_rating CHECK (rating >= 0 AND rating <= 5);
ALTER TABLE flight_schools ADD CONSTRAINT valid_email CHECK (contact_email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$');

-- Add comments
COMMENT ON TABLE flight_schools IS 'Flight schools directory with contact and program information';
COMMENT ON TABLE programs IS 'Flight training programs offered by schools';
COMMENT ON TABLE reviews IS 'User reviews and ratings for flight schools';

-- Function to update rating and review count
CREATE OR REPLACE FUNCTION update_school_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE flight_schools
  SET
    rating = (
      SELECT ROUND(AVG(rating)::numeric, 1)
      FROM reviews
      WHERE flight_school_id = COALESCE(NEW.flight_school_id, OLD.flight_school_id)
    ),
    review_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE flight_school_id = COALESCE(NEW.flight_school_id, OLD.flight_school_id)
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.flight_school_id, OLD.flight_school_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update ratings
CREATE TRIGGER trigger_update_school_rating_on_insert
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_school_rating_stats();

CREATE TRIGGER trigger_update_school_rating_on_update
  AFTER UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_school_rating_stats();

CREATE TRIGGER trigger_update_school_rating_on_delete
  AFTER DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_school_rating_stats();

-- Update timestamp trigger for flight_schools
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_flight_schools_updated_at
  BEFORE UPDATE ON flight_schools
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_programs_updated_at
  BEFORE UPDATE ON programs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();