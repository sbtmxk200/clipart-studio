# ClipArt Studio — PRD v1.1

- **Status**: Approved for Plan Phase
- **Author**: sbtmxk20
- **Date**: 2026-07-09
- **Version**: 1.1 (계정 모델 재정의)

---

## 1. Overview

| 항목 | 내용 |
|-----|------|
| Product Name | ClipArt Studio |
| Category | 계정 기반 AI 클립아트 생성 및 자산 관리 서비스 (학교 컨텍스트 최적화) |
| **North Star** | **"찾고, 없으면 만들고, 만들면 계정의 자산이 된다. 그리고 Community에서 공유할 수 있다."** |
| 핵심 차별점 | AI 이미지 생성기가 아닌 **계정 단위 반복 재사용 디자인 자산 축적 서비스**. School Profile 옵션으로 학교 컨텍스트를 가진 사용자에게 특별히 최적화됨. 경쟁력은 AI가 아니라 "내 라이브러리가 계속 쌓인다"는 점 |

## 2. Problem & Solution

### Problem
학교·교사·학생·일반 사용자가 클립아트를 지속적으로 필요로 한다. 하지만:
1. 원하는 클립아트가 없다
2. 유료 이미지가 많다
3. 저작권이 불분명하다
4. 매번 같은 이미지를 다시 만든다
5. 생성한 이미지가 계정에 축적되지 않는다 (다른 서비스는 세션 단위 소비형)

### Solution
`검색 → (없으면) 생성 → 자동 저장 → 재사용` 원플로우 통합.
- **School Profile (Optional)** 로 학교 컨텍스트를 가진 사용자는 스타일을 프롬프트에 자동 주입
- **배치 생성** (5~30장, 5장 스텝)으로 후보 pool 확보
- **이미지 체이닝** (i2i)으로 하나의 캐릭터·자산을 사용자의 "세계관"으로 확장
- **라이브러리 축적** = 계정의 디자인 자산화
- **선택적 Community 공유** = 다른 계정의 자산도 참고/재사용 가능

## 3. Users & Persona

### Account Model — v1.1에서 재정의

```
계정 = 사람 1명 (Supabase auth.users)
  ├─ profile (필수) — email, credits, account_type
  └─ school_profile (Optional, 1:0..1)
        └─ 있으면 → "🏫 학교 스타일 적용" 토글 활성화
        └─ 없으면 → 토글 자체가 UI에 없음 (순수 프롬프트 모드)
```

- **팀·조직 개념 없음** — 여러 사용자가 하나의 계정을 공유하려면 로그인 자격 공유
- **"학교 Workspace" 개념 폐기** — 학교는 School Profile 안의 컨텍스트일 뿐, 별도 엔티티 아님

### account_type (Profile 필드)

`'teacher' | 'student' | 'school' | 'school_staff' | 'general'`

- 통계·추천·Community 배지 표시용
- **기능 차별화 없음** — 모든 유형이 동일한 기능 접근

### Personas

- **P1 선생님 (teacher)**: 수업 자료·통신문·학급 활동 자료
- **P2 학생 (student)**: 발표 자료·수행평가·동아리 활동 자료
- **P3 학교 (school)**: 행정 명의의 공식 자산 (안내문·홍보물)
- **P4 학교 관계자 (school_staff)**: 학부모회·교육청·학원 등 학교 주변 이해관계자
- **P5 일반 (general)**: 학교 컨텍스트 없이 클립아트가 필요한 사용자

## 4. Success Metrics (KPI)

| 지표 | 정의 | 목표 |
|-----|-----|-----|
| **재사용률** | (다운로드 이벤트) ÷ (생성 이벤트) | ≥ 30% |
| **체이닝 재사용률** | (parent_image_id NOT NULL) ÷ 전체 생성 | ≥ 20% |
| **배치 선택률** | (다운로드/공개된 이미지) ÷ (배치 총 생성 수) | ≥ 30% |
| **최초 만족까지 시도 횟수** | 원하는 이미지 획득까지 프롬프트 시도 횟수 | 평균 ≤ 2회 |
| **4주 재방문율** | 가입 후 4주 내 2회 이상 접속 사용자 비율 | ≥ 40% |
| **Community 기여율** | (is_public=true 이미지) ÷ (saved 이미지) | ≥ 15% |

## 5. Scope

### ✅ In (MVP)
- 이메일/소셜 로그인 (Supabase Auth)
- **계정 프로필** (email, account_type 선택, credits)
- **School Profile 등록 (Optional)** — 온보딩에서 "학교 컨텍스트가 있나요?" 선택
  - 있음 → 교급/로고/색상/캐릭터/스타일/기본 프롬프트/학교 이미지 등록
  - 없음 → 이 섹션 스킵, 스타일 적용 토글은 UI에서 사라짐
- 이미지 검색 (내 라이브러리 + Community 통합 풀 + 공식 컬렉션, 태그 + PostgreSQL FTS)
- **AI 배치 생성** (5장 기본 + 5장 단위 확장, 최대 30장)
- **다양성 강화 토글** (Phase 1: 랜덤 seed, Phase 2: 프롬프트 자동 변형)
- **참조 이미지 첨부** (i2i 기본)
- **이미지 체이닝**: 라이브러리 이미지 → 새 이미지의 Reference
- **자식 이미지 프롬프트 UX**: 자동 채움 (편집 가능) + 프리셋 칩 3~5개
- **자동 태그 및 카테고리** (AI 기반 메타데이터)
- **고화질 업스케일** (별도 +1 크레딧)
- **크레딧 시스템** (신규 50, 월 30 리셋, 업스케일 +1) — **유형 무관 동일 정책**
- **라이브러리 자동 저장** + 다운로드 (Cloudflare R2)
- **공개/비공개 토글** (기본 Private, 명시적 ON 시 Community 노출)
- **Community 통합 풀** — School Profile 유무 무관 한 풀. 검색 결과 카드에 작성자 유형 배지 (🏫 / 🎒 / 👤) 표시
- **"공식 컬렉션"** (Seed Library 중 저작권 클리어된 항목 노출, 학교 컨텍스트 + 일반 유용 클립아트 모두 포함)
- **School Profile 자동 주입 토글** (School Profile 등록자만, 기본 ON, "🏫 학교 스타일 적용" 스위치)
- **저작권 표시** ("AI 생성" 라벨)

### ❌ Out (Post-MVP)
- 결제 / 환불 / 좋아요 / 관리자 승인 / 이미지 편집 / 버전 관리 / Marketplace / Fine-tuning UI
- 계정 유형별 크레딧 차등
- Community 유형 필터 (배지 표시만 MVP, 필터는 Post-MVP)
- 학교 캐릭터 관리 / 학교 브랜드 키트 / 포스터 자동 생성 / 학교신문 자동 편집
- 문지 자동 편집 / 우리학교인의 연동 / 기업 버전 / 디자인 에이전시 버전
- 팀·조직 협업 기능

## 6. User Flows

### 6.1 골든 패스 A — 검색 → 재사용
```
가입 → 온보딩에서 계정 유형 선택 + School Profile 설정 여부 선택
  → (School Profile 있음 경로) 학교 정보 4~5필드 입력
  → (School Profile 없음 경로) 바로 홈으로
  → 홈 검색바에 "이순신" 입력
  → 결과 표시 (내 라이브러리 + Community 통합 풀 + 공식 컬렉션)
  → 카드에 작성자 유형 배지 표시
  → 마음에 드는 이미지 다운로드 (재사용 이벤트 기록)
```

### 6.2 골든 패스 B — 배치 생성 → 저장
```
검색 결과 없음 or 만족스럽지 않음
  → [+ AI 생성] 버튼
  → 프롬프트 입력
  → [🏫 학교 스타일 적용 ON] 토글 (School Profile 등록자만 노출)
  → Reference Image 옵션
  → [기본 5장] 생성 요청 (5 크레딧 사전 차감)
  → SSE 스트리밍으로 카드가 하나씩 나타남
  → 아쉬우면 [+ 다양성 강화 5장] (추가 5 크레딧)
  → [저장] 확정 시 라이브러리 편입
  → 저장 안 한 이미지는 24시간 후 자동 삭제
```

### 6.3 골든 패스 C — 이미지 체이닝 (킬러 기능)
```
라이브러리에서 "이순신 (걷는 모습)" 이미지 클릭
  → [이 이미지로 새로 생성] 버튼
  → 프롬프트 자동 채움 (편집 가능)
  → 하단 프리셋 칩: [다른 포즈] [다른 표정] [겨울옷] [뛰는 모습]
  → 원클릭 프롬프트 자동 변형
  → 배치 생성 → 캐릭터 세계관 확장
  → parent_image_id 자동 기록 (계보)
```

### 6.4 골든 패스 D — 공개 → Community 기여
```
라이브러리에서 잘 나온 이미지 선택
  → [공개] 토글 ON
  → 다른 계정에서 검색 가능 (유형 무관 통합 풀)
  → 재사용 시 원 작성자에게 기여도 카운트 (KPI: Community 기여율)
```

## 7. Data Model

```sql
-- profiles (Supabase auth.users 확장)
profiles (
  id UUID PK REFERENCES auth.users(id),
  email TEXT,
  account_type TEXT DEFAULT 'general',  -- 'teacher' | 'student' | 'school' | 'school_staff' | 'general'
  credits INT DEFAULT 50,                -- 신규 가입 시 50
  credits_reset_at TIMESTAMP,            -- 매월 1일 리셋 배치 대상
  created_at TIMESTAMP DEFAULT NOW()
)

-- school_profiles (계정에 붙는 Optional 1:0..1 프로필)
school_profiles (
  user_id UUID PK REFERENCES profiles(id),
  school_name TEXT,
  homepage_url TEXT,
  logo_url TEXT,
  primary_color TEXT,
  mascot_desc TEXT,
  mascot_ref_url TEXT,                   -- 학교 캐릭터 참조 이미지
  building_ref_url TEXT,                 -- 학교 건물 참조 이미지
  style_desc TEXT,
  base_prompt TEXT,
  school_level TEXT,                     -- 'elementary' | 'middle' | 'high'
  updated_at TIMESTAMP
)

-- images (통합 이미지 테이블)
images (
  id UUID PK,
  user_id UUID REFERENCES profiles(id),
  prompt TEXT NOT NULL,
  negative_prompt TEXT,
  model TEXT NOT NULL,                   -- 'gpt-image-1' | 'flux-schnell' | ...
  seed BIGINT,
  r2_key TEXT NOT NULL,                  -- Cloudflare R2 object key
  thumbnail_r2_key TEXT,
  is_public BOOLEAN DEFAULT FALSE,       -- Community 공개 토글
  is_upscaled BOOLEAN DEFAULT FALSE,
  upscaled_from_id UUID REFERENCES images(id),
  parent_image_id UUID REFERENCES images(id),        -- 이미지 계보
  batch_id UUID,                         -- 같은 요청에서 생성된 이미지 그룹
  generation_mode TEXT,                  -- 'text2img' | 'img2img'
  reference_image_id UUID REFERENCES images(id),     -- Reference로 쓰인 이미지
  school_profile_applied BOOLEAN DEFAULT FALSE,      -- School Profile 자동 주입 여부
  status TEXT DEFAULT 'pending',         -- 'pending' | 'saved' | 'discarded'
  pending_expires_at TIMESTAMP,          -- 24시간 후 삭제
  created_at TIMESTAMP DEFAULT NOW()
)

-- image_tags (자동 태그, FTS 대상)
image_tags (
  image_id UUID REFERENCES images(id),
  tag TEXT NOT NULL,
  weight FLOAT DEFAULT 1.0,
  PRIMARY KEY (image_id, tag)
)
-- + tsvector 컬럼 + GIN 인덱스

-- image_categories
image_categories (
  image_id UUID REFERENCES images(id),
  category TEXT NOT NULL,                -- '운동회', '이순신', '졸업식', 'general', ...
  PRIMARY KEY (image_id, category)
)

-- generation_jobs (Job Queue)
generation_jobs (
  id UUID PK,
  user_id UUID REFERENCES profiles(id),
  prompt TEXT,
  batch_size INT,                        -- 5의 배수 (5/10/15/20/25/30)
  diversity_level INT,                   -- 0~5
  reference_image_id UUID REFERENCES images(id),
  school_profile_applied BOOLEAN,
  reserved_credits INT,
  refunded_credits INT DEFAULT 0,
  status TEXT,                           -- 'queued' | 'running' | 'partial' | 'done' | 'failed'
  error TEXT,
  created_at TIMESTAMP,
  completed_at TIMESTAMP
)

-- download_events (재사용률 KPI 원천)
download_events (
  id UUID PK,
  user_id UUID REFERENCES profiles(id),
  image_id UUID REFERENCES images(id),
  event_type TEXT,                       -- 'download' | 'copy_link' | 'chain_source'
  created_at TIMESTAMP DEFAULT NOW()
)

-- official_collection (Seed Library 중 공개 노출)
official_collection (
  image_id UUID REFERENCES images(id),
  category TEXT,                         -- 학교 컨텍스트 카테고리 + 일반 카테고리
  curator_note TEXT,
  published_at TIMESTAMP DEFAULT NOW()
)

-- seed_library (내부 학습용, 사용자 미노출)
seed_library (
  id UUID PK,
  r2_key TEXT,
  tags TEXT[],
  category TEXT,
  source TEXT,                           -- 취득 출처 기록
  license_status TEXT,                   -- 'unknown' | 'clear' | 'restricted'
  created_at TIMESTAMP
)

-- Community 검색용 View (작성자 유형 배지 조회)
CREATE VIEW community_images AS
SELECT
  i.*,
  p.account_type AS author_type,
  sp.school_name AS author_school_name  -- NULL 허용
FROM images i
JOIN profiles p ON i.user_id = p.id
LEFT JOIN school_profiles sp ON i.user_id = sp.user_id
WHERE i.is_public = TRUE AND i.status = 'saved';
```

## 8. Technical Architecture

### 8.1 Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Frontend | Next.js 14 App Router + React + Tailwind CSS | 비전 그대로 |
| Auth | Supabase Auth (Email + OAuth) | RLS 통합 |
| Database | Supabase PostgreSQL | RLS로 사용자별 격리 |
| Search | PostgreSQL FTS (tsvector + GIN) | Phase 2에서 pgvector 확장 |
| Storage | Cloudflare R2 (S3 호환) | Egress 무료로 이미지 트래픽 비용 절감 |
| AI (1순위) | OpenAI gpt-image-1 | 프롬프트 이해도 + 캐릭터 유지 우수 |
| AI (2순위) | FLUX schnell (Replicate) | 저비용 대안 |
| Adapter | 이미지 생성 어댑터 패턴 | 모델 교체 가능한 인터페이스 |
| Realtime | Server-Sent Events (SSE) | 배치 생성 진행률 스트리밍 |
| Deploy | Vercel (Frontend/API Routes) + Supabase (BE) | |

### 8.2 Job Queue 처리 흐름
```
[Client] POST /api/jobs (prompt, batch_size, school_profile_applied, ...)
  → [Server] credits >= batch_size 확인 → 사전 차감 → generation_jobs INSERT
  → school_profile_applied=true 이면 school_profiles 조회 후 프롬프트 병합
  → 5장 청크 단위로 이미지 생성
  → 각 이미지 완성 시 R2 업로드 → images INSERT (status='pending')
  → SSE 이벤트 push: {event: 'image_ready', image_id, url}
  → 청크 실패 시 refunded_credits += 실패 개수, 자동 환불
  → 전체 완료 → SSE {event: 'done', summary}
```

### 8.3 이미지 체이닝 처리 흐름
```
[Client] "이 이미지로 생성" 클릭
  → GET /api/images/{id}/prompt (원본 prompt 조회)
  → 사용자 편집 or 프리셋 칩 클릭 → 프롬프트 변형
  → POST /api/jobs (reference_image_id=원본, generation_mode='img2img')
  → gpt-image-1 i2i 엔드포인트 호출 (원본을 base로 캐릭터 유지)
  → 생성 이미지에 parent_image_id = 원본 ID 자동 기록
```

## 9. Behavior Rules

1. **검색 우선**: 홈 진입 시 검색바가 화면 중앙. AI 생성은 검색 결과 하단의 "원하는 결과가 없나요?" 형태로 배치.
2. **자동 저장 아님, 자동 편입 아님**: 배치 생성물은 `status='pending'` 으로 24시간 유지. 명시적 [저장] 한 것만 라이브러리 편입. 저장 안 한 이미지는 24시간 후 자동 삭제 (R2 비용 관리).
3. **School Profile 미보유자 UX**: "🏫 학교 스타일 적용" 토글 자체가 렌더링되지 않음. 프롬프트 입력창만 노출. 온보딩 이후에도 프로필 설정 페이지에서 언제든 School Profile 추가 가능.
4. **School Profile 자동 주입 = 기본 ON** (School Profile 등록자에 한해). 토글 OFF 가능.
5. **Community 노출 = 명시적 [공개] 토글 ON 시에만**. RLS로 강제.
6. **Community 검색 결과 표시**: 카드에 작성자 유형 배지 표시 (🏫 school / 🏫 school_staff / 🎒 student / 👤 teacher / 👤 general). School Profile 등록자는 학교명 함께 표시.
7. **AI 생성 라벨 필수 노출**: 이미지 상세에 "AI 생성" 배지.
8. **크레딧 부족 시**: 배치 요청 차단 + "이번 달 크레딧 소진, 다음 리셋: YYYY-MM-01" 안내.
9. **동시 Job 제한**: 사용자당 활성 Job 1개.
10. **이미지 계보 시각화**: 트리는 3단계까지, 그 이상은 "조상 보기" 링크.

## 10. Milestones

| Phase | 목표 | 주요 Deliverable |
|-------|-----|-----------------|
| **P1: Foundation** | Auth + Profile + School Profile (Optional) 온보딩 | Supabase 세팅, RLS 정책, 프로필 CRUD, 분기 온보딩 UI |
| **P2: Generation Core** | 배치 생성 + 크레딧 + Job Queue + SSE | 이미지 어댑터, gpt-image-1 연결, 크레딧 차감/환불, SSE 스트리밍 |
| **P3: Library & Search** | 라이브러리 + FTS 검색 + 자동 태그 + 공식 컬렉션 | tsvector 인덱스, 카드 UI (배지 포함), 다운로드 이벤트 로깅 |
| **P4: Image Chaining** | i2i + 프리셋 칩 + 계보 시각화 | gpt-image-1 i2i 어댑터, 프롬프트 자동 채움, 프리셋 라이브러리 |
| **P5: Community** | 공개 토글 + Community 통합 풀 + 작성자 배지 | RLS 확장, community_images View, 카드 배지 UI |
| **P6: Polish** | 업스케일 + 크레딧 UX + 온보딩 튜토리얼 | 업스케일 어댑터, 크레딧 잔량 UI, 첫 사용 가이드 |

## 11. Risks & Mitigation

| # | 리스크 | 완화 방안 |
|---|-------|----------|
| R1 | 콜드 스타트 (초기 Community 비어있음) | 공식 컬렉션으로 초기 검색 결과 확보 (학교 + 일반 카테고리) + 파일럿 사용자에게 시드 생성 요청 |
| R2 | AI 생성 비용 폭주 | 크레딧 상한 + 청크 단위 사전 차감/환불 |
| R3 | Reference Image 저작권 리스크 | 업로드 시 "본인 권리 이미지만" 동의 체크박스 + "AI 생성" 라벨 |
| R4 | School Profile 자동 주입이 결과 저해 | 토글 UI + A/B 로깅으로 실측 |
| R5 | 30장 배치 실패 시 크레딧 정합성 | 청크 단위 트랜잭션 + 자동 환불 로직 |
| R6 | 계보 무한 깊이로 UI 복잡화 | 깊이 3까지 시각화, 그 이상은 링크 |
| R7 | Pending 이미지 R2 비용 증가 | 24시간 자동 삭제 배치 |
| R8 | 검색 품질 (FTS 한계) | Phase 2에서 pgvector로 의미 검색 확장 |
| R9 | 계정 유형 다양화로 인한 스코프 위험 | account_type은 태그 필드에 국한, 기능 차별화 금지. Community 유형 필터도 Post-MVP |
| R10 | 학교 정체성 희석 우려 | 공식 컬렉션 초기 큐레이션에서 학교 카테고리 비중 높게 유지, 배지 UI로 학교 사용자 가시성 확보 |

## 12. Appendix — Decision Log

| # | 결정 | 근거 |
|---|-----|------|
| D1 | ~~1계정 = 1학교 = 1사용자~~ → **1계정 = 1사용자** (v1.1에서 변경) | v1.0 "학교 = 계정"은 저자의 자의적 등식이었음. v1.1에서 School Profile을 Optional로 분리 |
| D2 | 기본 Private + 공개 토글 | 사용자 통제권 우선, 저작권 리스크 감소 |
| D3 | 크레딧 시스템 MVP 포함 | 비용 관리 필수, 결제 없이 발급/차감만이면 구현 난이도 낮음 |
| D4 | Seed Library 내부용 + 공식 컬렉션 하이브리드 | 콜드 스타트 대응 + 저작권 리스크 격리 |
| D5 | FTS 우선, pgvector 후행 | MVP 스코프 축소, 태그+키워드로도 초반 충분 |
| D6 | 5장 스텝 배치 (최대 30) | 30장 슬라이더의 심리 저항 회피 + 청크 단위 실행/환불 |
| D7 | i2i + 캐릭터 유지 (gpt-image-1) | MVP 스코프 축소, ControlNet/IP-Adapter는 복잡도 큼 |
| D8 | 자식 프롬프트 = 자동 채움 + 프리셋 칩 | 원본 편집 유연성 + 원클릭 변형 UX |
| D9 | 신규 50 / 월 30 / 업스케일 +1 크레딧 | gpt-image-1 $0.04/장 기준, 마케팅 감당 가능 |
| D10 | 24시간 pending 자동 삭제 | R2 비용 관리 |
| **D11** | **계정 = 사람 (School Profile은 Optional 1:0..1)** — v1.1 | "학교 = 계정" 등식이 학생·일반인 확장 시 붕괴. 계정을 사람 단위로 놓고 School Profile을 옵션 프로필로 분리하면 유형 다양화가 자연스럽게 흡수됨 |
| **D12** | **North Star 재해석: "계정의 자산이 된다. Community에서 공유할 수 있다."** — v1.1 | 소유는 계정, 공유는 선택이라는 두 축을 명확히 분리 |
| **D13** | **Community 통합 풀 + 작성자 유형 배지 (필터는 Post-MVP)** — v1.1 | 풀 분리 시 각 풀 콜드 스타트 심화. 배지만으로 직관적 인지 가능 |
| **D14** | **공식 컬렉션 = 학교 컨텍스트 + 일반 유용 클립아트 모두 포함** — v1.1 | 새 North Star가 계정 자산으로 확장되었으므로 도메인 국한 불필요. 초기 큐레이션은 학교 카테고리 비중 높게 |
| **D15** | **account_type은 태그 필드, 기능 차별화 금지** — v1.1 | 유형별 UX 분기는 스코프 폭발 위험. 크레딧·기능 모두 유형 무관 동일 |

---

**End of PRD v1.1**

**Next Step**: `/pdca plan clipart-studio`
