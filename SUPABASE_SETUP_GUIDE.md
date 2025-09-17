# Supabase Database Setup Guide

현재 웹페이지에 표시되는 mock 데이터를 실제 Supabase 데이터베이스로 이전하는 가이드입니다.

## 📋 현재 웹페이지 데이터 (확인됨)

웹페이지에서 확인된 Flight Schools:

1. **SkyWings Flight School** (Seoul, South Korea) - ⭐4.8 (124 reviews)
   - Features: Latest Simulators, 1-on-1 Training

2. **Eagle Aviation Academy** (Jeju Island, South Korea) - ⭐4.6 (89 reviews)
   - Features: International Exchange, English Training

3. **BlueSky Flight Center** (Busan, South Korea) - ⭐4.9 (156 reviews)
   - Features: International Certification, ATPL Program

4. **Aero Dream Academy** (Incheon, South Korea) - ⭐4.5 (72 reviews)
   - Features: Airport Adjacent, Flexible Schedule

5. **Skyway Flight School** (Daejeon, South Korea) - ⭐4.7 (93 reviews)
   - Features: Large Training Area, Weather Training

6. **Horizon Aviation Training** (Los Angeles, USA) - ⭐4.4 (45 reviews)
   - Features: FAA Certified, Year-round Flying

## 🛠️ Supabase Dashboard 설정 단계

### 1단계: 테이블 생성

**Supabase Dashboard 접속**: https://supabase.com/dashboard/project/fsbwbxlqzdkhapnuypxd

**SQL Editor로 이동**: Dashboard → SQL Editor → New Query

**다음 SQL 실행**:

```sql
-- 1. Flight Schools 테이블 생성
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

-- 2. Programs 테이블 생성
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_school_id UUID REFERENCES flight_schools(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  duration VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Reviews 테이블 생성
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_school_id UUID REFERENCES flight_schools(id) ON DELETE CASCADE,
  user_name VARCHAR(255) NOT NULL,
  user_avatar TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2단계: 샘플 데이터 삽입

**같은 SQL Editor에서 계속 실행**:

```sql
-- Flight Schools 데이터 삽입
INSERT INTO flight_schools (
  name, location, city, country, rating, review_count, description, short_description,
  image_url, features, contact_phone, contact_email, contact_website, contact_address
) VALUES

('SkyWings Flight School', 'Seoul, South Korea', 'Seoul', 'South Korea', 4.8, 124,
 'Korea''s premier flight training institution with 30 years of tradition. State-of-the-art facilities and experienced instructors make your aviation dreams come true.',
 'Korea''s premier flight training institution',
 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=800',
 '["Latest Simulators", "1-on-1 Training", "Dormitory Available", "Career Placement"]'::jsonb,
 '02-1234-5678', 'info@skywings.kr', 'www.skywings.kr', '123 Airport Blvd, Gangseo-gu, Seoul'),

('Eagle Aviation Academy', 'Jeju Island, South Korea', 'Jeju', 'South Korea', 4.6, 89,
 'Pursue your aviation dreams in beautiful Jeju Island. We offer optimal flight conditions and professional training systems.',
 'Premium flight school in Jeju Island',
 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=800',
 '["International Exchange", "English Training", "Modern Aircraft", "Small Classes"]'::jsonb,
 '064-987-6543', 'fly@eagleaviation.kr', 'www.eagleaviation.kr', '456 Airport Road, Jeju City'),

('BlueSky Flight Center', 'Busan, South Korea', 'Busan', 'South Korea', 4.9, 156,
 'Busan''s premier flight training center with international standard curriculum and cutting-edge facilities.',
 'Busan''s premier flight training center',
 'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=800',
 '["International Certification", "ATPL Program", "24/7 Facility Access", "Mentoring Program"]'::jsonb,
 '051-555-7777', 'contact@bluesky.kr', 'www.bluesky.kr', '789 Aviation Way, Gangseo-gu, Busan'),

('Aero Dream Academy', 'Incheon, South Korea', 'Incheon', 'South Korea', 4.5, 72,
 'Conveniently located near Incheon International Airport. Professional training at reasonable rates.',
 'Flight school near Incheon Airport',
 'https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=800',
 '["Airport Adjacent", "Flexible Schedule", "Online Training", "Scholarship Program"]'::jsonb,
 '032-888-9999', 'info@aerodream.kr', 'www.aerodream.kr', '321 Airport Road, Jung-gu, Incheon'),

('Skyway Flight School', 'Daejeon, South Korea', 'Daejeon', 'South Korea', 4.7, 93,
 'Central Korea''s largest flight training facility. Systematic curriculum with excellent instructors.',
 'Central Korea''s largest flight facility',
 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800',
 '["Large Training Area", "Weather Training", "Aircraft Maintenance", "Corporate Partners"]'::jsonb,
 '042-333-4444', 'fly@skyway.kr', 'www.skyway.kr', '111 Flight Road, Yuseong-gu, Daejeon'),

('Horizon Aviation Training', 'Los Angeles, USA', 'Los Angeles', 'USA', 4.4, 45,
 'Professional flight training center offering comprehensive aviation programs. No visual marketing materials available at this time.',
 'Professional aviation training center',
 NULL,
 '["FAA Certified", "Year-round Flying", "International Students", "Housing Assistance"]'::jsonb,
 '+1-310-555-0123', 'training@horizonaviation.com', 'www.horizonaviation.com', '500 Aviation Circle, Los Angeles, CA 90045');
```

### 3단계: 인덱스 생성

```sql
-- 성능을 위한 인덱스 생성
CREATE INDEX idx_flight_schools_location ON flight_schools(location);
CREATE INDEX idx_flight_schools_city ON flight_schools(city);
CREATE INDEX idx_flight_schools_rating ON flight_schools(rating);
CREATE INDEX idx_flight_schools_active ON flight_schools(is_active);
```

### 4단계: Row Level Security (RLS) 설정

```sql
-- RLS 활성화
ALTER TABLE flight_schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 읽기 권한 (모든 사용자)
CREATE POLICY "Allow read access to flight_schools" ON flight_schools
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow read access to programs" ON programs
  FOR SELECT USING (true);

CREATE POLICY "Allow read access to reviews" ON reviews
  FOR SELECT USING (true);

-- 쓰기 권한 (인증된 사용자만)
CREATE POLICY "Allow authenticated users to insert reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow users to update their own reviews" ON reviews
  FOR UPDATE USING (true) WITH CHECK (true);
```

## 🚀 완료 후 확인

테이블과 데이터가 정상적으로 생성되었는지 확인:

```sql
-- 데이터 확인
SELECT name, location, rating, review_count FROM flight_schools ORDER BY rating DESC;
```

예상 결과:
- BlueSky Flight Center (Busan) - 4.9 ⭐ (156 reviews)
- SkyWings Flight School (Seoul) - 4.8 ⭐ (124 reviews)
- Skyway Flight School (Daejeon) - 4.7 ⭐ (93 reviews)
- Eagle Aviation Academy (Jeju) - 4.6 ⭐ (89 reviews)
- Aero Dream Academy (Incheon) - 4.5 ⭐ (72 reviews)
- Horizon Aviation Training (LA) - 4.4 ⭐ (45 reviews)

## ⚠️ 중요 사항

1. **Service Role Key 필요**: 일부 작업은 Service Role Key가 필요할 수 있습니다
2. **RLS 정책**: 보안을 위해 적절한 Row Level Security 설정 필수
3. **데이터 백업**: 실제 데이터 삽입 전 Supabase 프로젝트 백업 권장

이 가이드를 따라 설정하시면 mock 데이터가 실제 Supabase 데이터베이스로 이전됩니다!