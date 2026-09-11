# ⚡ 개발자로 살아남기 (Dev Survival Blog)

> **iOS 개발자에서 Product Engineer(PE)로의 전환기, 실전 AI 에이전트 활용법, 변화하는 개발자 시장 트렌드와 생존 팁을 기록하는 기술 블로그입니다.**

Astro v5 기반으로 구축된 고성능 모던 정적 블로그로, GitHub Pages에 자동 배포되도록 설정되어 있습니다.

---

## 📌 주요 카테고리

1. **🚀 커리어 전환 (`/category/career`)**  
   iOS 네이티브 개발자에서 프로덕트 엔지니어(PE)로 영역을 확장하며 겪은 경험과 회고
2. **🤖 AI 에이전트 & 워크플로우 (`/category/ai`)**  
   실무 엔지니어링을 혁신하는 AI 도구(Claude, Cursor 등) 활용법과 페어 프로그래밍 실전 가이드
3. **📈 시장 분석 & 트렌드 (`/category/market`)**  
   AI 시대에 재편되는 개발자 채용 시장 분석과 롱런하기 위한 생존 전략
4. **💡 실전 엔지니어링 팁 (`/category/tips`)**  
   빠른 프로토타이핑, 가설 검증, 프로덕트 개발 생산성을 극대화하는 실전 노하우

---

## 🛠️ 기술 스택

- **Framework:** [Astro v5](https://astro.build/)
- **Styling:** CSS Variables + 다크 모드(Dark Mode) 지원 + Pretendard 웹폰트
- **Content:** Markdown / MDX + Content Collections (Type-safe Schema)
- **Deployment:** GitHub Pages (GitHub Actions 자동 배포)

---

## 💻 로컬 개발 환경 실행

```bash
# 의존성 패키지 설치
npm install

# 로컬 개발 서버 실행 (AGENTS.md 규칙: 백그라운드 모드)
astro dev --background

# 상태 확인 및 로그
astro dev status
astro dev logs

# 개발 서버 종료
astro dev stop

# 프로덕션 빌드 테스트
npm run build
```

---

## 🚀 GitHub Pages 배포 방법

1. **GitHub에 리포지토리 생성 후 원격 저장소 연결**:
   ```bash
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```

2. **GitHub 저장소 Settings에서 Pages 설정**:
   - 저장소 페이지 `Settings` → `Pages` 메뉴 진입
   - **Source**: `GitHub Actions` 선택 (자동으로 워크플로우에 의해 배포됨)

3. **자동 배포 확인**:
   - `main` 브랜치에 코드가 푸시되면 `.github/workflows/deploy.yml`이 실행되어 자동으로 GitHub Pages에 배포됩니다.
   - `https://<your-username>.github.io/<repo-name>` 주소로 블로그가 서비스됩니다.
   - (만약 저장소 이름이 `<your-username>.github.io`라면 `https://<your-username>.github.io`로 서비스됩니다.)

---

## ✍️ 새 글 작성 방법

`src/content/blog/` 디렉토리에 새 `.md` 또는 `.mdx` 파일을 생성하고 아래와 같은 프론트매터를 작성합니다:

```markdown
---
title: "새 글 제목"
description: "글의 요약 설명"
pubDate: 2026-03-15
category: "career" # career | ai | market | tips 중 선택
tags: ["태그1", "태그2"]
---

여기에 마크다운 본문을 작성합니다.
```

