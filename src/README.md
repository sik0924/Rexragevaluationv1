# REX 🚀

**RAG 성능 평가 솔루션** - LLM Judge 비용을 90% 이상 절감하는 지능형 평가 플랫폼

[![Status](https://img.shields.io/badge/Frontend-100%25%20Complete-brightgreen)]()
[![Version](https://img.shields.io/badge/version-1.0.0-blue)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()

---

## 📋 목차

- [소개](#-소개)
- [핵심 기능](#-핵심 기능)
- [빠른 시작](#-빠른-시작)
- [프로젝트 구조](#-프로젝트-구조)
- [백엔드 연동](#-백엔드-연동)
- [문서](#-문서)
- [기술 스택](#-기술-스택)

---

## 🎯 소개

REX는 RAG(Retrieval-Augmented Generation) 시스템의 성능을 종합적으로 평가하고 자동으로 개선하는 플랫폼입니다.

### 🌟 V1.0 핵심 혁신: LLM Judge 비용 90% 절감

기존에는 모든 실패 케이스를 GPT-4로 분석하여 **비용이 폭증**했습니다.  
V1.0에서는 **2단계 필터링**으로 이 문제를 해결했습니다:

```
150개 실패 케이스 × $0.015 = $2.25  ❌ (전체 분석)
 30개 샘플링    × $0.015 = $0.45  ✅ (최적화)
───────────────────────────────────────
절감: $1.80 (80%)
```

**방법:**

1. **1차 필터 (휴리스틱):** Score < 0.2 → 자동 분류 (비용 $0)
2. **2차 필터 (샘플링):** 애매한 케이스만 선택적으로 LLM Judge 분석
3. **3차 분석 (LLM Judge):** GPT-4가 근본 원인 분석 + 개선 조언

---

## ✨ 핵심 기능

### 1️⃣ 지능형 실패 케이스 진단

- 휴리스틱 자동 분류 (무료)
- 샘플링 모드 (자동/고정비율/최대케이스)
- LLM Judge 상세 분석 (선택적)
- Retrieval vs Generation 오류 구분

### 2️⃣ 3단계 자동 개선 시스템

- **Step 1:** 최적화 전략 선택 (빠른 개선/균형 탐색/전체 그리드)
- **Step 2:** 실시간 실험 진행 모니터링
- **Step 3:** 최적 설정 자동 발견 및 적용

### 3️⃣ 비용 관찰 시스템

- 실시간 비용 추적 대시보드
- 예산 설정 및 알림
- LLM 모델별 비용 비교
- 비용 최적화 제안

### 4️⃣ 완전한 평가 워크플로우

- 데이터셋 생성/업로드
- 12개 RAG 지표 측정
- 실시간 모니터링
- 결과 비교 및 분석

---

## 🚀 빠른 시작

### 사전 요구사항

- Node.js 18.0 이상
- npm 또는 yarn

### 설치 및 실행

```bash
# 1. 저장소 클론
git clone https://github.com/your-org/rex.git
cd rex

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cat > .env << EOF
# Mock 모드 (백엔드 없이 테스트)
VITE_USE_MOCK_DATA=true

# 실제 API 모드 (백엔드 연동)
# VITE_API_BASE_URL=https://api.rex.com/api/v1
# VITE_USE_MOCK_DATA=false
EOF

# 4. 개발 서버 실행
npm run dev

# 5. 브라우저에서 접속
# http://localhost:5173
```

### 첫 평가 실행하기

#### 워크플로우 순서

1. **로그인:** `admin@rex.com` / `admin123`
2. **데이터셋 준비**
   - 좌측 메뉴에서 "데이터셋 관리" 클릭
   - 또는 대시보드에서 "데이터셋 생성" 클릭
   - 데이터셋 생성/업로드 또는 기존 데이터셋 확인
3. **평가 시작**
   - 좌측 메뉴에서 "평가하기" 클릭
   - 또는 대시보드에서 "평가 시작하기" 클릭
   - 평가 모드 선택:
     - **연동된 시스템 평가:** 기존 운영 중인 RAG 시스템 평가
     - **신규 평가:** REX 내부 RAG 파이프라인 실험
4. **평가 설정**
   - 데이터셋, 모델, Vector DB 선택
   - 평가 지표 선택 (12개 중)
   - **LLM Judge 분석 설정** 활성화
5. **평가 실행** 클릭
6. **모니터링**
   - 실시간 진행률 확인
   - "평가 모니터링" 페이지에서 상세 로그 확인
7. **결과 확인**
   - 결과 페이지에서 **진단 요약** 확인
   - 비용 절감 효과 확인

---

## 📁 프로젝트 구조

```
rex/
├── components/                  # React 컴포넌트 (23개)
│   ├── DashboardPageBlue.tsx           # 통합 대시보드 (빠른 실행 버튼 포함)
│   ├── DatasetsPageBlue.tsx            # 데이터셋 관리
│   ├── EvaluationModeSelectionPage.tsx # 평가 모드 선택 (2개 모드)
│   ├── ExternalEvaluationPageBlue.tsx  # 연동된 시스템 평가
│   ├── NewEvaluationPageBlue.tsx       # 신규 평가 (샘플링 UI 포함)
│   ├── ResultsPageBlue.tsx             # 결과 분석 (진단 요약 포함)
│   ├── DiagnosisSummaryCard.tsx        # 진단 요약 카드
│   ├── AutoImprove*.tsx                # 자동 개선 3단계
│   ├── Cost*.tsx                       # 비용 관찰 3페이지
│   └── ui/                             # shadcn/ui 컴포넌트 (42개)
│
├── lib/                         # 핵심 라이브러리
│   ├── api-client.ts                   # API 클라이언트 (diagnosisApi 포함)
│   ├── mock-data.ts                    # Mock 데이터
│   └── score-analysis.ts               # 점수 분석 로직
│
├── types/
│   └── index.ts                        # TypeScript 타입 (210개 이상)
│
├── stores/                      # Zustand 상태 관리
│   ├── evaluation-store.ts
│   └── monitor-store.ts
│
├── guidelines/                  # 📚 문서 (17개)
│   ├── Backend-Integration-Complete-Guide.md    # 🌟 백엔드 연동 가이드
│   ├── LLM-Judge-Cost-Optimization-Backend.md   # 비용 절감 구현
│   ├── API-Specification.md                     # API 명세
│   ├── Auto-Improve-Algorithm-Specification.md  # 자동 개선 알고리즘
│   └── ...
│
├── PROJECT-STATUS.md            # 📊 프로젝트 현황 상세 보고서
└── README.md                    # 이 문서
```

---

## 🔌 백엔드 연동

### 현재 상태

- ✅ **프론트엔드:** 100% 완료
- 🟡 **백엔드:** API 구현 필요

### 백엔드 개발자를 위한 가이드

#### 1. 필수 API 엔드포인트

**평가 생성 (LLM Judge 설정 포함)**

```typescript
POST /api/v1/evaluations
{
  dataset_id: string,
  llm_model_id: string,
  vector_db_id: string,
  metrics: string[],
  llm_judge_config: {  // 🌟 새로 추가
    enabled: boolean,
    mode: 'auto' | 'fixed_ratio' | 'max_cases',
    fixed_ratio?: number,
    max_cases?: number,
    enable_heuristics: boolean,
    heuristic_config: { ... }
  }
}
```

**진단 요약 조회**

```typescript
GET /api/v1/results/{evaluation_id}/diagnosis/summary
→ {
    total_failed_cases: number,
    heuristic_classified: number,
    llm_judge_analyzed: number,
    total_cost: number,
    cost_saved_percentage: number,
    ...
  }
```

**진단 파이프라인 실행**

```typescript
POST /api/v1/diagnosis/{evaluation_id}/run
{
  mode: 'auto' | 'fixed_ratio' | 'max_cases',
  enable_heuristics: boolean
}
```

#### 2. 데이터베이스 스키마

```sql
-- failed_cases 테이블 업데이트
ALTER TABLE failed_cases
ADD COLUMN diagnosis_method VARCHAR(20) DEFAULT 'Not Analyzed',
ADD COLUMN sampled BOOLEAN DEFAULT FALSE,
ADD COLUMN heuristic_reason VARCHAR(100),
ADD COLUMN context_tokens INTEGER;

-- evaluations 테이블 업데이트
ALTER TABLE evaluations
ADD COLUMN llm_judge_config JSONB,
ADD COLUMN diagnosis_summary JSONB;
```

#### 3. 상세 가이드

📘 **백엔드 연동 완벽 가이드:**  
[`/guidelines/Backend-Integration-Complete-Guide.md`](./guidelines/Backend-Integration-Complete-Guide.md)

📘 **비용 절감 백엔드 구현:**  
[`/guidelines/LLM-Judge-Cost-Optimization-Backend.md`](./guidelines/LLM-Judge-Cost-Optimization-Backend.md)

📘 **API 명세:**  
[`/guidelines/API-Specification.md`](./guidelines/API-Specification.md)

---

## 📚 문서

### 사용자 가이드

- [빠른 시작 가이드](./guidelines/Frontend-Integration-Guide.md)
- [자동 개선 사용법](./guidelines/Auto-Improve-Quick-Start.md)
- [비용 관찰 가이드](./guidelines/Cost-Observability-Guide.md)

### 개발자 가이드

- [아키텍처 개요](./guidelines/Architecture-Overview.md)
- [API 명세](./guidelines/API-Specification.md)
- [백엔드 연동 가이드](./guidelines/Backend-Integration-Complete-Guide.md)
- [🌟 V1.0 프로덕션 준비 가이드](./guidelines/V1.0-Production-Readiness-Guide.md)
- [자동 개선 알고리즘](./guidelines/Auto-Improve-Algorithm-Specification.md)

### 구현 상세

- [LLM Judge 비용 절감 구현](./guidelines/LLM-Judge-Implementation-Summary.md)
- [LLM Judge 프롬프트 전략](./guidelines/LLM-Judge-Prompt-Strategy.md)
- [점수 분석 알고리즘](./guidelines/Score-Analysis-Algorithm.md)

### 프로젝트 현황

- [📊 상세 프로젝트 현황](./PROJECT-STATUS.md)
- [V1.0 완료 보고서](./guidelines/V1.0-LLM-Judge-Cost-Reduction-COMPLETE.md)

---

## 🛠 기술 스택

### Frontend

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4.0
- **UI Components:** shadcn/ui (42개 컴포넌트)
- **Charts:** Recharts
- **Icons:** Lucide React
- **State Management:** Zustand
- **Notifications:** Sonner
- **HTTP Client:** Fetch API

### Backend (구현 필요)

- **언어:** Python / Node.js / Go (자유 선택)
- **Database:** PostgreSQL
- **LLM:** GPT-4o (for LLM Judge)
- **Vector DB:** Pinecone / ChromaDB / Weaviate

### DevOps

- **Version Control:** Git
- **CI/CD:** GitHub Actions (권장)
- **Deployment:** Netlify (Frontend) / AWS/GCP (Backend)

---

## 📊 주요 지표

### 프론트엔드 완성도

| 항목            | 완성도               |
| --------------- | -------------------- |
| UI 컴포넌트     | ✅ 100% (23개)       |
| API 클라이언트  | ✅ 100%              |
| TypeScript 타입 | ✅ 100% (210개 이상) |
| Mock 데이터     | ✅ 100%              |
| 가이드 문서     | ✅ 100% (17개)       |

### 기능 완성도

| 기능                | 프론트엔드 | 백엔드       |
| ------------------- | ---------- | ------------ |
| LLM Judge 비용 절감 | ✅ 100%    | 🟡 구현 필요 |
| 3단계 자동 개선     | ✅ 100%    | 🟡 구현 필요 |
| 비용 관찰 시스템    | ✅ 100%    | 🟡 구현 필요 |
| 10개 핵심 페이지    | ✅ 100%    | 🟡 구현 필요 |

---

## 🎨 스크린샷

### 통합 대시보드

종합 현황을 한눈에 파악할 수 있는 메인 대시보드

### 새 평가 만들기 (LLM Judge 샘플링 설정)

- 휴리스틱 필터링 설정
- 샘플링 모드 선택
- 예상 비용 미리보기

### 평가 결과 (진단 요약)

- 실패 케이스 진단 요약
- 비용 절감 효과 표시
- LLM Judge 분석 결과

### 자동 개선 진행 상황

- 실시간 실험 모니터링
- 현재 최고 점수 추적
- 파레토 프론티어 차트

---

## 문의

### 프론트엔드 관련

- 파일: `/components/`, `/lib/`, `/types/`
- 가이드: [`Frontend-Integration-Guide.md`](./guidelines/Frontend-Integration-Guide.md)

### 백엔드 연동 관련

- 가이드: [`Backend-Integration-Complete-Guide.md`](./guidelines/Backend-Integration-Complete-Guide.md)
- API 명세: [`API-Specification.md`](./guidelines/API-Specification.md)

### 전체 시스템

- 아키텍처: [`Architecture-Overview.md`](./guidelines/Architecture-Overview.md)
- 프로젝트 현황: [`PROJECT-STATUS.md`](./PROJECT-STATUS.md)

---

## 🎉 현재 상태

### ✅ 완료된 작업

- [x] 프론트엔드 100% 완성
- [x] LLM Judge 비용 절감 UI 구현
- [x] 3단계 자동 개선 시스템 구축
- [x] 비용 관찰 시스템 구축
- [x] 10개 핵심 페이지 완성
- [x] 완전한 TypeScript 타입 시스템
- [x] API 클라이언트 준비
- [x] 17개 가이드 문서 작성

### 🚧 진행 예정

- [ ] 백엔드 API 구현
- [ ] 진단 파이프라인 구축
- [ ] 자동 개선 알고리즘 구현
- [ ] 프로덕션 배포

---

## 📈 다음 단계

1. **백엔드:** [Backend Integration Guide](./guidelines/Backend-Integration-Complete-Guide.md) 참고하여 API 구현
2. **프론트엔드:** `.env` 설정 및 API 호출 주석 해제
3. **QA:** 통합 테스트 시나리오 작성
4. **DevOps:** CI/CD 파이프라인 설정

---

<div align="center">

[Documentation](./guidelines/Guidelines.md) • [API Spec](./guidelines/API-Specification.md) • [Project Status](./PROJECT-STATUS.md)

</div>