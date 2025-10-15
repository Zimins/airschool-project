# Delete Account Setup Guide

계정 삭제 기능이 제대로 작동하려면 Supabase 데이터베이스에 함수를 추가해야 합니다.

## Supabase 대시보드에서 SQL 실행

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택: `fsbwbxlqzdkhapnuypxd`

2. **SQL Editor 열기**
   - 왼쪽 메뉴에서 **SQL Editor** 클릭

3. **아래 SQL 코드 실행**
   - **New query** 버튼 클릭
   - 아래 코드를 복사하여 붙여넣기
   - **RUN** 버튼 클릭

```sql
-- Create a function to allow users to delete their own account
-- This function uses SECURITY DEFINER to run with elevated privileges

CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Get the current user's ID
  user_id := auth.uid();

  -- Check if user is authenticated
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete user's data from profiles table
  DELETE FROM profiles WHERE id = user_id;

  -- Delete user's reviews
  DELETE FROM reviews WHERE user_id = user_id;

  -- Delete user's posts
  DELETE FROM community_posts WHERE user_id = user_id;

  -- Delete the user from auth.users
  -- This requires SECURITY DEFINER to have permission
  DELETE FROM auth.users WHERE id = user_id;

  -- Log the deletion
  RAISE NOTICE 'User % deleted successfully', user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user() TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION delete_user() IS 'Allows authenticated users to delete their own account and all associated data';
```

## 작동 방식

1. 사용자가 Profile Settings에서 "Delete Account" 클릭
2. 이메일 주소를 입력하여 확인
3. "Delete My Account" 버튼 클릭
4. `delete_user()` 함수 실행:
   - 프로필 삭제
   - 리뷰 삭제
   - 커뮤니티 게시물 삭제
   - Auth 사용자 삭제
5. 자동으로 로그아웃
6. 홈 화면으로 이동

## 삭제되는 데이터

- ✅ 사용자 프로필 (profiles)
- ✅ 작성한 리뷰 (reviews)
- ✅ 작성한 게시물 (community_posts)
- ✅ 인증 정보 (auth.users)

## 보안

- `SECURITY DEFINER`: 함수가 소유자 권한으로 실행되어 auth.users 테이블 삭제 가능
- `auth.uid()`: 현재 로그인한 사용자만 자신의 계정 삭제 가능
- 다른 사용자의 계정은 삭제할 수 없음

## 테스트

1. 테스트 계정으로 로그인
2. 우측 상단 프로필 아이콘 → "Profile Settings"
3. "Delete Account" 클릭
4. 이메일 입력하여 확인
5. 삭제 완료 확인

## 문제 해결

### 함수 실행 오류
```
ERROR: permission denied for table auth.users
```

**해결**: SQL을 다시 실행하여 `SECURITY DEFINER` 설정 확인

### RPC 호출 오류
```
Failed to delete account
```

**해결**:
1. Supabase 대시보드 → Database → Functions 에서 `delete_user` 함수 확인
2. 함수가 없으면 위의 SQL을 다시 실행

## 롤백 (함수 삭제)

필요한 경우 함수를 삭제할 수 있습니다:

```sql
DROP FUNCTION IF EXISTS delete_user();
```

⚠️ **주의**: 함수를 삭제하면 사용자가 계정을 삭제할 수 없게 됩니다.
