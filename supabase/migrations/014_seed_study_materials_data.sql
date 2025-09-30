-- Seed study materials with sample data
INSERT INTO public.study_materials (title, author, category, content, attachments, likes, comments, views, created_at)
VALUES
  (
    'PPL Written Test Complete Study Guide',
    'David Kim',
    'Written Test',
    'Comprehensive study guide covering all topics for PPL written test. Includes practice questions and detailed explanations for aerodynamics, meteorology, navigation, regulations, and aircraft systems.',
    3,
    89,
    23,
    1234,
    NOW() - INTERVAL '1 day'
  ),
  (
    'Aviation English Phraseology Handbook',
    'Emma Park',
    'Language',
    'Complete collection of standard aviation phraseology with Korean translations and pronunciation guides. Essential for radio communication and ATC interaction.',
    1,
    67,
    15,
    890,
    NOW() - INTERVAL '2 days'
  ),
  (
    'VFR Navigation Chart Reading Tutorial',
    'Captain Jung',
    'Navigation',
    'Step-by-step guide to reading VFR sectional charts. Includes symbol explanations and practical examples for cross-country flight planning.',
    5,
    56,
    12,
    678,
    NOW() - INTERVAL '3 days'
  ),
  (
    'Weather Patterns and Flight Planning',
    'Lisa Chen',
    'Weather',
    'Understanding weather systems for safe flight planning. Covers METAR/TAF interpretation, weather hazards, and decision-making for VFR conditions.',
    2,
    45,
    8,
    567,
    NOW() - INTERVAL '4 days'
  ),
  (
    'Aircraft Systems Study Notes - Cessna 172',
    'Mike Johnson',
    'Aircraft',
    'Detailed study notes on Cessna 172 systems including engine, electrical, hydraulic, and avionics. Perfect for pre-flight preparation and checkride review.',
    4,
    72,
    19,
    923,
    NOW() - INTERVAL '5 days'
  ),
  (
    'Emergency Procedures Checklist',
    'Sarah Williams',
    'Other',
    'Comprehensive emergency procedures checklist for various scenarios including engine failure, electrical fire, and emergency landings. Must-know for all pilots.',
    2,
    103,
    31,
    1456,
    NOW() - INTERVAL '6 days'
  ),
  (
    'Radio Communication Practice Scripts',
    'James Lee',
    'Language',
    'Practice scripts for common radio communications including departure, arrival, and emergency situations. Includes both English and Korean examples.',
    0,
    58,
    14,
    712,
    NOW() - INTERVAL '1 week'
  ),
  (
    'Cross-Country Flight Planning Guide',
    'Rachel Kim',
    'Navigation',
    'Complete guide to planning cross-country flights including route selection, fuel calculations, weather briefings, and filing flight plans.',
    3,
    91,
    25,
    1089,
    NOW() - INTERVAL '1 week'
  )
ON CONFLICT (id) DO NOTHING;