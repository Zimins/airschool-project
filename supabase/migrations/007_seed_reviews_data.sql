-- Seed sample review data
-- Create some test users first, then add their reviews

-- Create sample reviewer users (these will be used for reviews)
-- Note: In production, these would be real users from auth.users
INSERT INTO auth.users (
  id, email, email_confirmed_at, created_at, updated_at, raw_user_meta_data, is_anonymous
) VALUES
('r1111111-1111-1111-1111-111111111111', 'john.kim@example.com', NOW(), NOW(), NOW(), '{"name": "John Kim", "role": "user"}'::jsonb, false),
('r2222222-2222-2222-2222-222222222222', 'sarah.lee@example.com', NOW(), NOW(), NOW(), '{"name": "Sarah Lee", "role": "user"}'::jsonb, false),
('r3333333-3333-3333-3333-333333333333', 'mike.park@example.com', NOW(), NOW(), NOW(), '{"name": "Mike Park", "role": "user"}'::jsonb, false),
('r4444444-4444-4444-4444-444444444444', 'david.choi@example.com', NOW(), NOW(), NOW(), '{"name": "David Choi", "role": "user"}'::jsonb, false),
('r5555555-5555-5555-5555-555555555555', 'jennifer.jung@example.com', NOW(), NOW(), NOW(), '{"name": "Jennifer Jung", "role": "user"}'::jsonb, false),
('r6666666-6666-6666-6666-666666666666', 'alex.thompson@example.com', NOW(), NOW(), NOW(), '{"name": "Alex Thompson", "role": "user"}'::jsonb, false)
ON CONFLICT (id) DO NOTHING;

-- Insert sample reviews
INSERT INTO reviews (
  id, flight_school_id, user_id, user_name, user_avatar, rating, title, content, helpful_count, created_at
) VALUES

-- SkyWings Flight School reviews
('rev11111-1111-1111-1111-111111111111',
 '11111111-1111-1111-1111-111111111111',
 'r1111111-1111-1111-1111-111111111111',
 'John Kim',
 'https://i.pravatar.cc/150?img=1',
 5,
 'Best decision ever!',
 'Completed my PPL at SkyWings. The instructors are professional and friendly, making even difficult lessons enjoyable. Facilities are clean and modern.',
 23,
 '2024-01-15 10:30:00+00'),

('rev11111-1111-1111-1111-111111111112',
 '11111111-1111-1111-1111-111111111111',
 'r2222222-2222-2222-2222-222222222222',
 'Sarah Lee',
 'https://i.pravatar.cc/150?img=2',
 4,
 'Overall satisfactory training',
 'The curriculum is well-structured and comprehensive. The training is thorough and prepares you well for your aviation career.',
 15,
 '2024-02-20 14:15:00+00'),

('rev11111-1111-1111-1111-111111111113',
 '11111111-1111-1111-1111-111111111111',
 'r3333333-3333-3333-3333-333333333333',
 'Mike Park',
 'https://i.pravatar.cc/150?img=3',
 5,
 'Where dreams come true',
 'Always dreamed of becoming a pilot, and SkyWings made it happen. The career placement program was extremely helpful.',
 34,
 '2024-03-10 09:45:00+00'),

-- Eagle Aviation Academy reviews
('rev22222-2222-2222-2222-222222222221',
 '22222222-2222-2222-2222-222222222222',
 'r4444444-4444-4444-4444-444444444444',
 'David Choi',
 'https://i.pravatar.cc/150?img=4',
 5,
 'Amazing experience in Jeju',
 'Learning to fly while enjoying the beautiful scenery of Jeju Island was incredible. Great education quality and small class sizes meant lots of personal attention.',
 18,
 '2024-01-20 16:20:00+00'),

('rev22222-2222-2222-2222-222222222222',
 '22222222-2222-2222-2222-222222222222',
 'r5555555-5555-5555-5555-555555555555',
 'Jennifer Jung',
 'https://i.pravatar.cc/150?img=5',
 4,
 'Perfect for recreational flying',
 'Wanted to learn flying as a hobby and this was perfect. Instructors are patient and facilities are well-maintained.',
 12,
 '2024-02-15 11:30:00+00'),

-- Horizon Aviation Training review
('rev66666-6666-6666-6666-666666666661',
 '66666666-6666-6666-6666-666666666666',
 'r6666666-6666-6666-6666-666666666666',
 'Alex Thompson',
 'https://i.pravatar.cc/150?img=6',
 4,
 'Solid training program',
 'Horizon Aviation provides comprehensive training despite not having fancy marketing materials. The focus is on quality instruction and that shows.',
 8,
 '2024-03-05 13:10:00+00')

ON CONFLICT (id) DO NOTHING;

-- Update school ratings based on inserted reviews
-- This will trigger the automatic rating calculation functions
UPDATE flight_schools SET updated_at = NOW() WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '66666666-6666-6666-6666-666666666666'
);

-- Add some additional sample reviews to make data more realistic
INSERT INTO reviews (
  flight_school_id, user_id, user_name, user_avatar, rating, title, content, helpful_count, created_at
) VALUES

-- More SkyWings reviews
('11111111-1111-1111-1111-111111111111', 'r1111111-1111-1111-1111-111111111111', 'Emma Wilson', 'https://i.pravatar.cc/150?img=10', 5, 'Excellent training quality', 'Professional instructors and modern equipment. Highly recommend for serious aviation students.', 12, '2024-03-20 08:30:00+00'),
('11111111-1111-1111-1111-111111111111', 'r2222222-2222-2222-2222-222222222222', 'James Brown', 'https://i.pravatar.cc/150?img=11', 4, 'Good value for money', 'Training is thorough and facilities are well-maintained. Good preparation for commercial aviation.', 8, '2024-03-25 15:45:00+00'),

-- More Eagle Aviation reviews
('22222222-2222-2222-2222-222222222222', 'r3333333-3333-3333-3333-333333333333', 'Lisa Chen', 'https://i.pravatar.cc/150?img=12', 5, 'Beautiful location, great training', 'Learning to fly in Jeju was amazing. The weather is perfect for training most of the year.', 16, '2024-03-15 12:20:00+00'),

-- More BlueSky reviews
('33333333-3333-3333-3333-333333333333', 'r4444444-4444-4444-4444-444444444444', 'Robert Kim', 'https://i.pravatar.cc/150?img=13', 5, 'Top-notch facilities', 'State-of-the-art simulators and excellent maintenance. The ATPL program is comprehensive.', 21, '2024-03-18 10:15:00+00'),
('33333333-3333-3333-3333-333333333333', 'r5555555-5555-5555-5555-555555555555', 'Grace Park', 'https://i.pravatar.cc/150?img=14', 4, 'Professional environment', 'Good training environment with experienced instructors. The mentoring program is very helpful.', 9, '2024-03-22 14:30:00+00')

ON CONFLICT (id) DO NOTHING;