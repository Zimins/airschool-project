# Vercel 배포 가이드

## 준비 사항
- GitHub 계정
- Vercel 계정 (https://vercel.com 에서 무료로 가입)

## 배포 단계

### 1. GitHub에 코드 푸시

```bash
# Git 초기화 (이미 되어있다면 스킵)
git init

# 모든 파일 추가
git add .

# 커밋
git commit -m "Initial commit for AirSchool project"

# GitHub에 새 저장소 생성 후
git remote add origin https://github.com/YOUR_USERNAME/airschool-project.git
git branch -M main
git push -u origin main
```

### 2. Vercel에서 프로젝트 가져오기

1. [Vercel Dashboard](https://vercel.com/dashboard)로 이동
2. "Add New..." → "Project" 클릭
3. GitHub 저장소 연결 및 권한 부여
4. "airschool-project" 저장소 선택

### 3. 빌드 설정

Vercel이 자동으로 설정을 감지하지만, 확인해야 할 사항:

- **Framework Preset**: Other
- **Build Command**: `expo export --platform web --output-dir web-build`
- **Output Directory**: `web-build`
- **Install Command**: `npm install`

### 4. 환경 변수 설정 (필요한 경우)

환경 변수가 필요한 경우 Vercel 대시보드에서 설정:
- Settings → Environment Variables

### 5. 배포

"Deploy" 버튼을 클릭하면 자동으로 빌드 및 배포가 시작됩니다.

## 현재 프로젝트 설정

✅ **vercel.json** - Vercel 설정 파일
```json
{
  "buildCommand": "expo export --platform web --output-dir web-build",
  "outputDirectory": "web-build",
  "devCommand": "expo start --web",
  "cleanUrls": true,
  "framework": null,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

✅ **package.json** - 빌드 스크립트
- `vercel-build`: Vercel 전용 빌드 명령어

✅ **.gitignore** - web-build 폴더 제외

## 배포 후 확인사항

1. **빌드 로그 확인**: Vercel 대시보드에서 빌드 과정 모니터링
2. **도메인 설정**: 기본 제공되는 `.vercel.app` 도메인 또는 커스텀 도메인 설정
3. **성능 모니터링**: Vercel Analytics 활용

## 트러블슈팅

### 빌드 실패 시
1. Node.js 버전 확인 (18.x 권장)
2. 로컬에서 `npm run build` 테스트
3. 빌드 로그에서 에러 메시지 확인

### Static Export 에러
Expo 53의 경우 static export가 제한적일 수 있습니다. 이 경우:
1. Expo Router 설치 검토
2. 또는 개발 모드로 배포 (성능 제한 있음)

## 추가 최적화

1. **이미지 최적화**: Vercel의 이미지 최적화 기능 활용
2. **캐싱 설정**: vercel.json에 headers 추가
3. **분석 도구**: Vercel Analytics 연동

## 유용한 링크

- [Vercel 문서](https://vercel.com/docs)
- [Expo Web 배포 가이드](https://docs.expo.dev/distribution/publishing-websites/)
- [Vercel CLI](https://vercel.com/cli) - 로컬에서 배포하기