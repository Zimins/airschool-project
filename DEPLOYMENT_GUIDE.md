# Netlify 배포 가이드

## 현재 상황
Expo 53 버전은 기본적으로 Metro bundler를 사용하며, 기존의 expo export:web 명령은 더 이상 지원되지 않습니다.

## 권장 배포 방법

### 방법 1: Expo Application Services (EAS) 사용 (권장)
```bash
# EAS CLI 설치
npm install -g eas-cli

# EAS 로그인
eas login

# 프로젝트 초기화
eas build:configure

# 웹 빌드
eas build --platform web
```

### 방법 2: Vercel 사용
1. Vercel 계정 생성 (https://vercel.com)
2. GitHub에 프로젝트 푸시
3. Vercel에서 "Import Project" 클릭
4. Framework Preset으로 "Other" 선택
5. Build Command: `expo export --platform web`
6. Output Directory: `dist` 

### 방법 3: 개발 서버 직접 배포 (임시)
현재 프로젝트는 개발 모드로만 실행 가능합니다:

```bash
# 로컬에서 실행
npm run web

# ngrok 등을 사용하여 임시 배포
npx ngrok http 8081
```

## 프로덕션 배포를 위한 추가 설정 필요사항

1. **Static Export 설정**
   - Expo Router 설치 및 설정
   - 또는 Next.js로 마이그레이션

2. **대체 방법: Create React App으로 변환**
   - React Native Web 컴포넌트를 일반 React 앱으로 변환
   - Webpack 설정 직접 구성

## 현재 파일 구조
```
- netlify.toml: Netlify 설정 파일 (준비됨)
- _redirects: SPA 리다이렉트 설정 (준비됨)
- package.json: 빌드 스크립트 추가됨
```

## 다음 단계
1. 위 방법 중 하나를 선택하여 배포
2. 프로덕션 빌드를 위한 추가 설정 진행
3. 환경 변수 및 도메인 설정

## 참고 링크
- [Expo Web 문서](https://docs.expo.dev/workflow/web/)
- [EAS Build 문서](https://docs.expo.dev/build/introduction/)
- [Vercel Expo 가이드](https://vercel.com/guides/deploying-expo-with-vercel)