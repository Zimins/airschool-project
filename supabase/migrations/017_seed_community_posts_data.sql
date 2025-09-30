-- Seed community posts data
-- Note: We'll use the test user's ID for author_id
-- Make sure to update the author_id with actual user IDs after users are created

INSERT INTO public.community_posts (title, author_id, author_name, category, content, likes, views, created_at) VALUES
(
  'First Solo Flight Experience!',
  (SELECT id FROM auth.users WHERE email = 'test@airschool.com' LIMIT 1),
  'John Pilot',
  'Experience',
  'Just completed my first solo flight today. It was amazing! The feeling of being alone in the sky for the first time is indescribable. Everything went smoothly and I can''t wait to continue my training.',
  45,
  234,
  NOW() - INTERVAL '10 days'
),
(
  'Tips for PPL Written Test',
  (SELECT id FROM auth.users WHERE email = 'test@airschool.com' LIMIT 1),
  'Sarah Wings',
  'Tips',
  'Here are some study tips that helped me pass the written test with a high score:

1. Use multiple study resources - don''t rely on just one book
2. Practice with online question banks daily
3. Focus on understanding concepts, not just memorizing
4. Join study groups for better retention
5. Review weather and charts extensively

Good luck to everyone preparing!',
  67,
  567,
  NOW() - INTERVAL '11 days'
),
(
  'Best Flight Schools in Korea?',
  (SELECT id FROM auth.users WHERE email = 'test@airschool.com' LIMIT 1),
  'Mike Air',
  'Question',
  'Looking for recommendations for flight schools in Korea. I''m interested in getting my PPL and eventually CPL. What are your experiences with different schools? Budget is a consideration but quality training is most important.',
  23,
  456,
  NOW() - INTERVAL '12 days'
),
(
  'Weather Minimums Discussion',
  (SELECT id FROM auth.users WHERE email = 'test@airschool.com' LIMIT 1),
  'Captain Lee',
  'Discussion',
  'What are your personal minimums for VFR flights? I know the regulatory minimums, but I''m curious what experienced pilots use as their personal limits. Do you have different minimums for different types of flights?',
  12,
  123,
  NOW() - INTERVAL '13 days'
),
(
  'Cross-Country Flight Planning Tips',
  (SELECT id FROM auth.users WHERE email = 'admin@airschool.com' LIMIT 1),
  'Emma Navigator',
  'Tips',
  'Planning your first cross-country can be overwhelming. Here''s what I learned:

- Always have a backup plan (alternate airports)
- Check weather along the entire route, not just departure/arrival
- Calculate fuel with generous reserves
- Brief yourself on airspace restrictions
- Have emergency procedures ready

Happy flying!',
  89,
  723,
  NOW() - INTERVAL '5 days'
),
(
  'How to Handle Crosswind Landings?',
  (SELECT id FROM auth.users WHERE email = 'test@airschool.com' LIMIT 1),
  'David Student',
  'Question',
  'I''m struggling with crosswind landings. Any tips from more experienced pilots? My instructor says I''m over-correcting. What helped you master this skill?',
  34,
  298,
  NOW() - INTERVAL '3 days'
),
(
  'Passed My Checkride Today!',
  (SELECT id FROM auth.users WHERE email = 'admin@airschool.com' LIMIT 1),
  'Lisa Success',
  'Experience',
  'Just passed my PPL checkride! The examiner was fair and professional. The oral exam took about 2 hours, and we covered everything from weather to aerodynamics. Flight portion went smoothly despite some nervousness. Dream achieved!',
  156,
  892,
  NOW() - INTERVAL '1 day'
);

-- Add some comments to posts
INSERT INTO public.community_comments (post_id, author_id, author_name, content, created_at) VALUES
(
  (SELECT id FROM public.community_posts WHERE title = 'First Solo Flight Experience!' LIMIT 1),
  (SELECT id FROM auth.users WHERE email = 'admin@airschool.com' LIMIT 1),
  'Instructor Kim',
  'Congratulations on your first solo! That''s a milestone you''ll never forget. Keep up the great work!',
  NOW() - INTERVAL '9 days'
),
(
  (SELECT id FROM public.community_posts WHERE title = 'Tips for PPL Written Test' LIMIT 1),
  (SELECT id FROM auth.users WHERE email = 'test@airschool.com' LIMIT 1),
  'Study Buddy',
  'Thanks for sharing these tips! The study group suggestion is really helpful.',
  NOW() - INTERVAL '10 days'
),
(
  (SELECT id FROM public.community_posts WHERE title = 'Passed My Checkride Today!' LIMIT 1),
  (SELECT id FROM auth.users WHERE email = 'test@airschool.com' LIMIT 1),
  'Future Pilot',
  'Congratulations! This gives me hope for my upcoming checkride. How long did you prepare?',
  NOW() - INTERVAL '12 hours'
);