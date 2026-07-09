# ClipArt Studio Planning Document

> **Summary**: 계정 기반 AI 클립아트 생성·재사용 서비스. School Profile은 Optional, 킬러 기능은 이미지 체이닝.
>
> **Project**: ClipArt Studio
> **Version**: 0.1.0 (MVP)
> **Author**: sbtmxk20
> **Date**: 2026-07-09
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 학교·교사·학생·일반 사용자가 클립아트를 반복 제작하지만, 저작권 리스크가 있고 생성한 이미지가 계정에 축적되지 않아 매번 처음부터 다시 만든다 |
| **Solution** | `검색 → (없으면) 배치 생성 → 자동 저장 → 재사용` 원플로우 통합. School Profile로 학교 컨텍스트 사용자에게 스타일 자동 주입. 이미지 체이닝(i2i)으로 하나의 캐릭터를 세계관으로 확장 |
| **Function/UX Effect** | 5장 스텝 배치 생성 + SSE 스트리밍으로 완성된 카드부터 노출. 라이브러리 이미지 클릭 → 자동 프롬프트 채움 + 프리셋 칩(원클릭 변형)으로 재생성. Community 통합 풀에서 다른 계정 이미지도 참고 |
| **Core Value** | "만들면 계정의 자산이 된다. 그리고 Community에서 공유할 수 있다." |

---

## Context Anchor

> Auto-generated. Propagated to Design/Do documents for context continuity.

| Key | Value |
|-----|-------|
| **WHY** | 클립아트가 계정에 축적되지 않는 문제 해결 — 소비형 이미지 생성기가 아닌 자산형 라이브러리 |
| **WHO** | 초/중/고 교사·학생·학교·학교관계자·일반 (5개 account_type, 기능 차별화 없음). School Profile은 Optional |
| **RISK** | Community 콜드 스타트 (초기 이미지 풀 비어있음), AI 생성 비용 폭주, 학교 정체성 희석 우려 |
| **SUCCESS** | 재사용률 ≥30%, 체이닝 재사용률 ≥20%, 배치 선택률 ≥30%, 4주 재방문율 ≥40%, Community 기여율 ≥15% |
| **SCOPE** | 6 Phase MVP — P1 Foundation → P2 Generation → P3 Library&Search → P4 Chaining → P5 Community → P6 Polish |

---

## 1. Overview

### 1.1 Purpose

학교 컨텍스트를 가진 사용자와 일반 사용자 모두를 위한 **계정 단위 디자인 자산 축적 서비스**를 구축한다. AI 이미지 생성기(Midjourney/DALL-E)와의 차별점은 **"내 계정에 이미지가 계속 쌓인다"**는 점 — 세션 소비형이 아닌 자산 축적형.

### 1.2 Background

- **기존 대안의 한계**: Midjourney/DALL-E는 이미지가 계정에 자산으로 남지 않음. 유료 스톡 사이트는 원하는 이미지 부족 + 학교 스타일 적용 불가.
- **새로운 기회**: LLM 이미지 모델 (gpt-image-1, FLUX) 품질이 학교 클립아트 수요를 충족할 수준. i2i로 캐릭터 정체성 유지 가능.
- **차별화 축**: (1) School Profile 자동 주입, (2) 이미지 체이닝, (3) 계정 자산화, (4) 선택적 Community 공유.

### 1.3 Related Documents

- **PRD (SSoT)**: [docs/00-pm/clipart-studio.prd.md](../../00-pm/clipart-studio.prd.md) v1.1
- **Design** (다음 단계): docs/02-design/features/clipart-studio.design.md

---

## 2. Scope

### 2.1 In Scope

**P1 Foundation**
- [ ] Supabase 프로젝트 세팅 (Auth + PostgreSQL + RLS)
- [ ] 이메일/소셜 로그인 UI
- [ ] Profile 생성 트리거 (auth.users → profiles 자동 생성)
- [ ] 온보딩 UI (계정 유형 선택 + School Profile 등록 여부 분기)
- [ ] School Profile 등록 폼 (Optional)
- [ ] account_type: teacher/student/school/school_staff/general

**P2 Generation Core**
- [ ] 이미지 생성 어댑터 인터페이스 (gpt-image-1 + FLUX 교체 가능)
- [ ] Job Queue 테이블 + API (`POST /api/jobs`)
- [ ] 크레딧 사전 차감 + 청크 단위 환불 로직
- [ ] SSE 진행률 스트리밍 (`GET /api/jobs/:id/stream`)
- [ ] 5장 스텝 배치 UI (다양성 강화 토글)
- [ ] School Profile 자동 주입 (등록자만, 기본 ON)
- [ ] 참조 이미지 첨부 (i2i 모드)
- [ ] Pending 24시간 자동 삭제 배치 (Supabase Edge Function or Cron)

**P3 Library & Search**
- [ ] Cloudflare R2 업로드 파이프라인 (Presigned URL)
- [ ] 이미지 자동 태그 (gpt-4o-mini 기반 메타데이터 추출)
- [ ] PostgreSQL FTS (tsvector + GIN 인덱스)
- [ ] 라이브러리 UI (카드 그리드, 무한 스크롤)
- [ ] 검색 UI (통합 풀: 내 라이브러리 + Community + 공식 컬렉션)
- [ ] 다운로드 이벤트 로깅 (KPI 원천)
- [ ] 공식 컬렉션 관리 (Seed Library → 큐레이션 → 공개)

**P4 Image Chaining (Killer)**
- [ ] gpt-image-1 i2i 어댑터
- [ ] 라이브러리 이미지 → "이 이미지로 새로 생성" 액션
- [ ] 프롬프트 자동 채움 UI (편집 가능)
- [ ] 프리셋 칩 3~5개 (다른 포즈/표정/의상 등)
- [ ] parent_image_id 자동 기록
- [ ] 계보 시각화 (3단계까지, 그 이상은 링크)

**P5 Community**
- [ ] 공개/비공개 토글 UI (기본 Private)
- [ ] Community RLS 정책 (is_public=TRUE만 타 계정 노출)
- [ ] community_images View
- [ ] 검색 결과 카드에 작성자 유형 배지 (🏫 / 🎒 / 👤)
- [ ] 재사용 이벤트 로깅 (Community 기여율 KPI)

**P6 Polish**
- [ ] 고화질 업스케일 (별도 어댑터 + 1 크레딧)
- [ ] 크레딧 잔량 UI (Header 상시 표시)
- [ ] 월 리셋 배치 (매월 1일 00:00 KST)
- [ ] "AI 생성" 라벨 필수 노출
- [ ] 첫 사용 온보딩 튜토리얼

### 2.2 Out of Scope

- 결제 / 환불 / 좋아요 / 관리자 승인
- 이미지 편집(Photoshop 스타일) / 버전 관리 / Marketplace / Fine-tuning UI
- 계정 유형별 크레딧 차등 / Community 유형 필터
- 팀·조직 협업 / 학교 브랜드 키트 / 포스터 자동 생성
- 학교신문 자동 편집 / 우리학교인의 연동 / 기업 버전 / 디자인 에이전시 버전

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | 이메일/소셜 로그인 (Supabase Auth) | High | Pending |
| FR-02 | Profile 자동 생성 (auth.users → profiles 트리거) | High | Pending |
| FR-03 | School Profile 등록 (Optional 1:0..1) | High | Pending |
| FR-04 | 통합 검색 (내 라이브러리 + Community + 공식 컬렉션, FTS) | High | Pending |
| FR-05 | AI 배치 생성 (5장 기본 + 5장 단위 확장, 최대 30) | High | Pending |
| FR-06 | 다양성 강화 토글 (P1 랜덤 seed, P2 프롬프트 변형) | Medium | Pending |
| FR-07 | 참조 이미지 첨부 (i2i 모드) | High | Pending |
| FR-08 | 이미지 체이닝 (parent_image_id 자동 기록) | High | Pending |
| FR-09 | 자식 프롬프트 UX (자동 채움 + 프리셋 칩 3~5개) | High | Pending |
| FR-10 | 자동 태그·카테고리 (gpt-4o-mini 기반) | Medium | Pending |
| FR-11 | 고화질 업스케일 (별도 +1 크레딧) | Low | Pending |
| FR-12 | 크레딧 시스템 (신규 50, 월 30 리셋, 사전 차감/환불) | High | Pending |
| FR-13 | 라이브러리 저장 + 다운로드 (R2 CDN) | High | Pending |
| FR-14 | 공개/비공개 토글 (기본 Private, RLS 강제) | High | Pending |
| FR-15 | Community 통합 풀 + 작성자 유형 배지 | Medium | Pending |
| FR-16 | 공식 컬렉션 (Seed Library → 큐레이션 노출) | Medium | Pending |
| FR-17 | School Profile 자동 주입 토글 (등록자만 UI 노출) | High | Pending |
| FR-18 | AI 생성 라벨 필수 노출 | Medium | Pending |
| FR-19 | Pending 이미지 24시간 자동 삭제 | High | Pending |
| FR-20 | SSE 스트리밍 (배치 생성 진행률 실시간 노출) | High | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| **Performance (Generation)** | 이미지 1장 생성 응답 < 30초 (gpt-image-1 medium) | 서버 로그 latency_ms 측정 |
| **Performance (Search)** | 검색 결과 응답 < 500ms (p95) | Vercel Analytics + DB 쿼리 로깅 |
| **Performance (Batch SSE)** | 첫 이미지 스트리밍 도착 < 15초 | SSE 이벤트 타임스탬프 측정 |
| **Security (RLS)** | 모든 테이블에 RLS 정책 적용, Private 이미지 타 계정 조회 불가 | Playwright 통합 테스트 (다중 계정) |
| **Security (Credit Integrity)** | 크레딧 차감/환불 시 데이터베이스 트랜잭션 원자성 보장 | 부하 테스트로 동시 요청 시 정합성 확인 |
| **Security (Auth)** | Supabase Auth JWT 검증, OWASP Top 10 준수 | Server Actions에서 세션 검증 통일 |
| **Accessibility** | WCAG 2.1 AA (키보드 네비게이션, alt 텍스트) | Lighthouse 자동 점검 |
| **Scalability** | 초기 100명 동시 접속 지원, Job Queue 병목 없음 | Supabase Free tier + Vercel Hobby 한계 인지 |
| **Cost Control** | 월 총 AI 생성 비용 < $200 (파일럿 단계) | 크레딧 상한 + Job Queue 사용자당 1개 제한 |
| **Storage Cost** | 24시간 Pending 자동 삭제로 R2 부담 최소화 | 월간 R2 storage 사이즈 모니터링 |

---

## 4. Success Criteria

### 4.1 Definition of Done (MVP)

- [ ] 6 Phase 모든 FR 구현 완료
- [ ] 6개 KPI 측정 인프라 구축 (download_events + generation_jobs 로깅)
- [ ] Vitest 단위 테스트 커버리지 ≥ 60% (크레딧 로직, 어댑터 계층 우선)
- [ ] Playwright E2E: 4개 골든 패스 (검색·배치·체이닝·공개) 모두 통과
- [ ] RLS 정책 통합 테스트 (Private/Public 격리 검증)
- [ ] Vercel Production 배포 성공, Custom domain 연결
- [ ] Supabase Production 프로젝트 마이그레이션 적용
- [ ] "AI 생성" 라벨 노출 확인 (저작권 대응)

### 4.2 Quality Criteria

- [ ] TypeScript strict mode, 0 `any` (외부 SDK 제외)
- [ ] ESLint 0 error / 0 warning
- [ ] Prettier 통일 포맷
- [ ] Next.js build 성공, Lighthouse Performance ≥ 80

### 4.3 KPI Baseline (측정 인프라)

| KPI | 원천 이벤트 | 계산 방식 |
|-----|-----------|----------|
| 재사용률 | download_events (event_type='download') | `count(download) / count(images.saved)` |
| 체이닝 재사용률 | images.parent_image_id NOT NULL | `count(chained) / count(all_generated)` |
| 배치 선택률 | 배치 이미지의 저장/공개율 | `count(saved OR is_public) / count(batch_total)` |
| 시도 횟수 | generation_jobs per user per feature intent | 클러스터링 필요, 초기 approximate |
| 4주 재방문율 | auth.sessions + user_id | Supabase Analytics 조회 |
| Community 기여율 | images.is_public=TRUE / images.status='saved' | 매일 배치 집계 |

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| **콜드 스타트** (초기 Community 비어있음) | High | High | 공식 컬렉션 초기 100개 큐레이션 (학교 카테고리 비중 60%+) + 파일럿 사용자에게 시드 이미지 생성 요청 |
| **AI 생성 비용 폭주** | High | Medium | 크레딧 상한 (신규 50, 월 30) + 청크 단위 사전 차감/환불 + 사용자당 활성 Job 1개 |
| **Reference Image 저작권** | Medium | Medium | 업로드 시 "본인 권리 이미지만" 동의 체크박스 + "AI 생성" 라벨 |
| **School Profile 주입이 결과 저해** | Medium | Low | 토글 기본 ON, OFF 자유. A/B 테스트로 실측 |
| **30장 배치 실패 시 크레딧 정합성** | High | Low | 청크 단위 트랜잭션 + 자동 환불 로직 + generation_jobs 상태 머신 |
| **계보 무한 깊이 UI 복잡화** | Low | Medium | 시각화는 3단계까지, 그 이상은 "조상 보기" 링크 |
| **Pending R2 스토리지 비용 증가** | Medium | Medium | 24시간 자동 삭제 배치 (Supabase pg_cron 또는 Edge Function scheduled) |
| **FTS 검색 품질 한계** | Medium | Medium | Phase 2에서 pgvector 확장 로드맵 명시 |
| **계정 유형 다양화 스코프 폭발** | Medium | Low | account_type 태그 필드에 국한, 기능 차별화 금지 |
| **학교 정체성 희석** | Medium | Low | 공식 컬렉션 초기 큐레이션 학교 카테고리 우선, 배지 UI로 학교 사용자 가시성 확보 |
| **Vercel Hobby / Supabase Free tier 한계** | High | Medium | 파일럿 규모(100명)까지는 무료 티어. 100명 초과 시 유료 전환 결정 필요 |
| **OpenAI gpt-image-1 서비스 안정성** | High | Low | 어댑터 패턴으로 FLUX schnell 즉시 fallback 가능하게 설계 |

---

## 6. Impact Analysis

### 6.1 Changed Resources

**신규 프로젝트이므로 영향받는 기존 코드는 없음.** 그러나 외부 서비스에 대한 사용 관계는 다음과 같이 정리:

| Resource | Type | Change Description |
|----------|------|--------------------|
| Supabase Auth (신규) | Auth Provider | 신규 프로젝트 생성 |
| Supabase PostgreSQL (신규) | DB Schema | 8개 테이블 + 1 View + RLS 정책 신규 생성 |
| Cloudflare R2 (신규) | Object Storage | 신규 버킷 생성, Presigned URL 정책 |
| OpenAI API (신규) | External API | gpt-image-1 + gpt-4o-mini (태그) 호출 |
| Replicate API (신규) | External API | FLUX schnell fallback 호출 |

### 6.2 Current Consumers

**해당 없음** — 신규 프로젝트, 기존 소비자 없음.

### 6.3 Verification

- [x] 신규 프로젝트임을 확인 (기존 코드 영향 없음)
- [ ] Supabase Free tier 리소스 한도 확인 (500MB DB, 50k MAU)
- [ ] Cloudflare R2 Free tier 확인 (10GB storage, 1M Class A ops/월)
- [ ] OpenAI API 조직 계정 결제 수단 확인
- [ ] Replicate 계정 결제 수단 확인 (선택)

---

## 7. Architecture Considerations

### 7.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| Starter | Simple structure | Static sites | ☐ |
| **Dynamic** | Feature-based, BaaS integration | Web apps with backend, SaaS MVPs | ✅ |
| Enterprise | Strict layer separation, DI, microservices | High-traffic, complex | ☐ |

**Rationale**: Supabase(BaaS) 기반 SaaS MVP → Dynamic 정확히 매칭.

### 7.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| **Framework** | Next.js / Remix / Vite+React | **Next.js 14 (App Router)** | Server Actions + SSE 자연 지원, Vercel 배포 이점 |
| **State Management** | Zustand / Jotai / Context+useReducer | **Zustand + TanStack Query** | Zustand로 UI 로컬 상태, TanStack Query로 서버 상태 캐싱/무효화. SSE 배치 결과 관리 최적 |
| **API Client** | fetch / axios / react-query | **fetch (Next.js API Routes) + TanStack Query 래핑** | Next.js API Routes로 서버 로직, TanStack Query로 클라이언트 캐싱 |
| **Form Handling** | react-hook-form / formik / native | **react-hook-form + Zod** | 스키마 기반 검증, 성능(비제어 컴포넌트) 이점 |
| **Styling** | Tailwind / CSS Modules / styled-components | **Tailwind CSS** | 비전 문서 확정, 빠른 프로토타이핑 |
| **UI Components** | shadcn/ui / Radix / 자체 제작 | **shadcn/ui (Radix 기반)** | 접근성 기본, Tailwind 통합 |
| **Testing** | Jest / **Vitest** / Playwright | **Vitest + Playwright** | Vitest는 Next.js 14와 궁합, Playwright는 SSE 테스트 강함 |
| **Backend** | BaaS(Supabase) / Custom / Serverless | **Supabase** | Auth+DB+RLS+Storage 통합, 개발 속도 |
| **Object Storage** | Supabase Storage / **R2** / S3 | **Cloudflare R2** | Egress 무료 (이미지 트래픽 비용 절감) |
| **AI (1순위)** | gpt-image-1 / DALL-E 3 / FLUX | **OpenAI gpt-image-1** | 프롬프트 이해도 + 캐릭터 유지 우수, i2i 지원 |
| **AI (2순위)** | FLUX schnell / SDXL | **FLUX schnell (Replicate)** | 저비용 fallback |
| **AI (Tagging)** | gpt-4o-mini / claude-haiku | **gpt-4o-mini** | 비용/속도/품질 균형 |
| **Realtime** | WebSocket / **SSE** / Polling | **Server-Sent Events** | 단방향 진행률 스트리밍에 최적, Next.js Route Handler 자연 지원 |
| **Package Manager** | npm / yarn / **pnpm** | **pnpm** | 디스크·속도 이점, workspace 지원 |
| **Deployment** | Vercel / Netlify / 자체 호스팅 | **Vercel** | Next.js 최적화, SSE 지원, 무료 티어 |
| **DB Env** | Local Docker / **Cloud only** | **Supabase Cloud (dev + prod)** | 초기 오버헤드 최소화, RLS 정책 검증 안전 |

### 7.3 Clean Architecture Approach (Dynamic Level)

```
Selected Level: Dynamic

Folder Structure Preview:
src/
├─ app/                        # Next.js App Router
│  ├─ (auth)/                  # 인증 라우트 그룹
│  ├─ (main)/                  # 메인 앱 라우트 그룹
│  │  ├─ page.tsx              # 홈 (검색바)
│  │  ├─ library/              # 라이브러리
│  │  ├─ generate/             # 배치 생성 UI
│  │  ├─ image/[id]/           # 이미지 상세 + 체이닝
│  │  └─ profile/              # School Profile 설정
│  ├─ api/                     # Route Handlers
│  │  ├─ jobs/                 # POST 생성 요청 / SSE 스트림
│  │  ├─ images/               # 라이브러리 CRUD
│  │  ├─ search/               # FTS 검색
│  │  └─ community/            # 공개 이미지 조회
│  └─ layout.tsx
├─ features/                   # 도메인 기능별 모듈
│  ├─ auth/
│  ├─ profile/
│  ├─ generation/              # 배치 생성 + 크레딧
│  ├─ library/                 # 저장 + 검색
│  ├─ chaining/                # i2i + 프리셋
│  └─ community/               # 공개 풀
├─ services/                   # 외부 서비스 어댑터
│  ├─ image-gen/               # gpt-image-1 / FLUX 어댑터 인터페이스
│  ├─ r2/                      # R2 업로드 유틸
│  ├─ tagging/                 # gpt-4o-mini 태깅
│  └─ credit/                  # 크레딧 트랜잭션
├─ components/
│  └─ ui/                      # shadcn/ui
├─ lib/
│  ├─ supabase/                # 클라이언트/서버 인스턴스
│  ├─ store/                   # Zustand stores
│  └─ query/                   # TanStack Query 설정
├─ types/                      # 공용 타입 정의
└─ styles/
supabase/
├─ migrations/                 # SQL 마이그레이션
└─ config.toml
tests/
├─ unit/                       # Vitest
└─ e2e/                        # Playwright
```

---

## 8. Convention Prerequisites

### 8.1 Existing Project Conventions

신규 프로젝트이므로 아래 항목 모두 신규 정의 필요:

- [ ] CLAUDE.md 생성 (프로젝트 코딩 컨벤션 요약)
- [ ] ESLint 설정 (`.eslintrc.json`)
- [ ] Prettier 설정 (`.prettierrc`)
- [ ] TypeScript strict mode (`tsconfig.json`)
- [ ] Husky + lint-staged (pre-commit 훅)

### 8.2 Conventions to Define/Verify

| Category | Current State | To Define | Priority |
|----------|---------------|-----------|:--------:|
| **Naming** | missing | 파일: kebab-case, 컴포넌트: PascalCase, 변수: camelCase, 상수: UPPER_SNAKE | High |
| **Folder structure** | missing | 위 7.3 구조 준수, `features/*` 도메인 격리 | High |
| **Import order** | missing | 1) 표준 라이브러리, 2) 외부, 3) 절대 경로(`@/`), 4) 상대, 5) 타입 (eslint-plugin-import) | Medium |
| **Environment variables** | missing | 아래 8.3 참조 | High |
| **Error handling** | missing | Server Actions: try/catch → `{ ok: false, error }` 반환. Client: TanStack Query onError 통일 | Medium |
| **Type definition** | missing | Zod schema 우선, `type` 파생. 이중 관리 금지 | Medium |
| **Commit convention** | missing | Conventional Commits (feat/fix/chore/docs/refactor/test) | Medium |

### 8.3 Environment Variables Needed

| Variable | Purpose | Scope | To Be Created |
|----------|---------|-------|:-------------:|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | Client | ☐ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Client | ☐ |
| `SUPABASE_SERVICE_ROLE_KEY` | RLS bypass (배치/크론용) | Server | ☐ |
| `R2_ACCOUNT_ID` | Cloudflare R2 계정 ID | Server | ☐ |
| `R2_ACCESS_KEY_ID` | R2 액세스 키 | Server | ☐ |
| `R2_SECRET_ACCESS_KEY` | R2 시크릿 키 | Server | ☐ |
| `R2_BUCKET_NAME` | R2 버킷 이름 | Server | ☐ |
| `R2_PUBLIC_URL` | R2 CDN 엔드포인트 | Client | ☐ |
| `OPENAI_API_KEY` | OpenAI (gpt-image-1, gpt-4o-mini) | Server | ☐ |
| `REPLICATE_API_TOKEN` | FLUX fallback | Server | ☐ |
| `INITIAL_CREDITS` | 신규 가입 크레딧 (기본 50) | Server | ☐ |
| `MONTHLY_RESET_CREDITS` | 월 리셋 크레딧 (기본 30) | Server | ☐ |

### 8.4 Pipeline Integration

**해당 없음** — 9-phase Development Pipeline은 사용하지 않음. PDCA만 사용.

---

## 9. Next Steps

1. [ ] `/pdca design clipart-studio` 실행 → 3안 아키텍처 비교 → 선택
2. [ ] Design 문서에 8개 테이블 + RLS 정책 상세, API 계약(OpenAPI 스타일), Component tree 정의
3. [ ] Design 승인 후 `/pdca do clipart-studio --scope module-1` (Foundation Phase 시작)
4. [ ] Phase별 마일스톤 리뷰 (matchRate 90%+ 도달 시 다음 Phase 진입)

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-07-09 | 초안 (PRD v1.1 기반 Plan 문서) | sbtmxk20 |
