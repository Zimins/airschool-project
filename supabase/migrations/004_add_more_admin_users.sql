-- 추가 어드민 사용자 생성 예제
-- Add more admin users as needed

-- 새로운 어드민 계정 추가 방법:
-- 1. 비밀번호를 SHA-256으로 해시 (salt: 'AIRSCHOOL_SALT_2024' 포함)
-- 2. 아래 템플릿을 사용하여 INSERT

-- 예시: 새로운 어드민 추가
/*
INSERT INTO users (
  email, 
  password_hash, 
  role, 
  is_active,
  created_at
) VALUES (
  'newadmin@airschool.com',
  -- 비밀번호를 해시하여 여기에 입력
  'your_hashed_password_here',
  'admin',
  true,
  NOW()
)
ON CONFLICT (email) DO NOTHING;
*/

-- 또는 기존 사용자를 어드민으로 승격
/*
UPDATE users 
SET role = 'admin' 
WHERE email = 'user@example.com' 
  AND is_active = true;
*/