# REX 시스템 아키텍처 명세서

**Version:** 1.0  
**작성일:** 2024년 10월 24일  
**문서 유형:** 시스템 아키텍처 설계 명세

---

## 📋 문서 개요

이 문서는 REX(RAG Evaluation eXpert) 시스템의 전체 아키텍처를 상세히 설명합니다.  
기획서, 기술 설계서, 개발 가이드의 기반이 되는 마스터 문서입니다.

**대상 독자:**
- 기획팀: 비즈니스 요구사항 검증
- 개발팀: 기술 구현 가이드
- QA팀: 테스트 시나리오 작성
- 경영진: 시스템 투자 판단

---

## 🎯 1. 시스템 개요

### 1.1 제품 정의

**REX (RAG Evaluation eXpert)**는 RAG(Retrieval-Augmented Generation) 시스템의 성능을 종합적으로 평가하고 자동으로 최적화하는 엔터프라이즈 솔루션입니다.

### 1.2 핵심 가치 제안

| 가치 제안 | 설명 | 비즈니스 임팩트 |
|----------|------|----------------|
| **비용 절감** | LLM Judge 호출을 90% 절감 | 월 평가 비용 $2,250 → $225 |
| **자동 최적화** | 하이퍼파라미터 자동 탐색 | 수동 실험 50시간 → 자동 5시간 |
| **실시간 모니터링** | 평가 진행 상황 실시간 추적 | 평가 실패율 조기 발견 |
| **데이터 기반 의사결정** | 12개 지표로 객관적 성능 측정 | ROI 증명 가능 |

### 1.3 타겟 사용자

#### Primary Users
- **AI/ML 엔지니어:** RAG 시스템 구축 및 최적화
- **QA 엔지니어:** 챗봇/검색 시스템 품질 검증
- **프로덕트 매니저:** 성능 지표 모니터링 및 보고

#### Secondary Users
- **경영진/의사결정자:** 대시보드를 통한 전략적 인사이트
- **데이터 과학자:** 실험 결과 분석 및 연구

### 1.4 시장 포지셔닝

```
경쟁 제품          REX의 차별점
─────────────────────────────────────────────
RAGAS            → LLM Judge 비용 90% 절감
LangSmith        → 자동 개선 시스템 내장
TruLens          → 엔터프라이즈 비용 관찰 시스템
Manual Testing   → 완전 자동화 + 실시간 모니터링
```

---

## 🎨 2. UI/UX 아키텍처

### 2.1 디자인 시스템

**Blue Enterprise Design System**

**컬러 팔레트:**
```css
Primary (Blue):   #3B82F6, #2563EB, #1E40AF
Secondary (Gray): #64748B, #475569, #334155
Accent (Amber):   #F59E0B, #D97706, #B45309
Success (Green):  #10B981, #059669
Error (Red):      #EF4444, #DC2626
Warning (Amber):  #F59E0B
```

**타이포그래피:**
- Heading: Inter (Semi-Bold)
- Body: Inter (Regular)
- Monospace: Fira Code (코드/로그)

**아이콘:**
- Lucide React (일관된 16px/20px/24px 사이즈)

### 2.2 페이지 구조 (13개 페이지)

#### 네비게이션 메뉴 (워크플로우 순서)

```
┌─────────────────────────────────────────────┐
│  REX Logo                                   │
├─────────────────────────────────────────────┤
│  1. 📊 통합 대시보드                         │
│  2. 📁 데이터셋 관리                         │
│  3. ⚡ 평가하기                              │
│     ├─ 연동된 시스템 평가                    │
│     └─ 신규 평가 (실험 모드)                 │
│  4. 📡 평가 모니터링                         │
│  5. 📋 평가 이력                             │
│  6. 📊 결과 비교                             │
│  7. 🚀 자동 개선                             │
│  8. 💰 비용 대시보드                         │
│                                             │
│  ⚙️  관리자                                  │
│  📜 로그 뷰어                                │
└─────────────────────────────────────────────┘
```

#### 페이지별 상세 명세

| # | 페이지명 | 파일명 | 주요 기능 | 페이지 타입 |
|---|---------|--------|----------|-----------|
| 1 | 통합 대시보드 | `DashboardPageBlue.tsx` | 전체 현황, KPI, 빠른 실행 | 대시보드 |
| 2 | 데이터셋 관리 | `DatasetsPageBlue.tsx` | CRUD, 업로드, 미리보기 | 마스터-디테일 |
| 3 | 평가 모드 선택 | `EvaluationModeSelectionPage.tsx` | 2개 모드 선택 | 선택 화면 |
| 4 | 연동된 시스템 평가 | `ExternalEvaluationPageBlue.tsx` | 외부 API 연동 설정 | 멀티스텝 폼 |
| 5 | 신규 평가 | `NewEvaluationPageBlue.tsx` | 내부 RAG 실험 설정 | 멀티스텝 폼 |
| 6 | 평가 모니터링 | `EvaluationMonitorPageBlue.tsx` | 실시간 진행률 추적 | 실시간 모니터 |
| 7 | 평가 이력 | `EvaluationHistoryPageBlue.tsx` | 목록, 필터, 검색 | 마스터-디테일 |
| 8 | 평가 결과 | `ResultsPageBlue.tsx` | 지표, 진단, 다운로드 | 상세 페이지 |
| 9 | 결과 비교 | `ComparisonPageBlue.tsx` | 다중 평가 비교 차트 | 비교 대시보드 |
| 10 | 자동 개선 설정 | `AutoImproveSetupPageBlue.tsx` | 최적화 전략 선택 | 설정 화면 |
| 11 | 자동 개선 진행 | `AutoImproveProgressPageBlue.tsx` | 실험 진행 모니터링 | 실시간 모니터 |
| 12 | 자동 개선 결과 | `AutoImproveResultsPageBlue.tsx` | 최적 설정 발견 | 상세 페이지 |
| 13 | 비용 대시보드 | `CostDashboardPageBlue.tsx` | 비용 추적, 예산 | 대시보드 |

### 2.3 컴포넌트 계층 구조

```
App.tsx (라우팅)
└── AppLayout.tsx (레이아웃)
    ├── Sidebar (네비게이션)
    ├── Header (사용자 정보, 알림)
    └── Main Content
        ├── Page Components (23개)
        │   ├── Dashboard
        │   ├── Datasets
        │   ├── Evaluations
        │   ├── Monitoring
        │   ├── Results
        │   ├── Auto-Improve
        │   └── Costs
        │
        ├── Feature Components
        │   ├── DiagnosisSummaryCard.tsx
        │   ├── LLMJudgeAnalysisCard.tsx
        │   └── ...
        │
        └── UI Components (42개 shadcn/ui)
            ├── Button, Card, Table
            ├── Chart, Progress
            ├── Dialog, Sheet
            └── ...
```

### 2.4 반응형 디자인

| Breakpoint | 화면 크기 | 레이아웃 변경 |
|-----------|---------|-------------|
| Mobile | < 640px | 사이드바 숨김, 햄버거 메뉴 |
| Tablet | 640px - 1024px | 사이드바 축소 모드 |
| Desktop | > 1024px | 전체 사이드바 표시 |

---

## 🏗️ 3. 기술 아키텍처

### 3.1 시스템 구성도

```
┌───────────────────────────────────────────────────────────────┐
│                         Client Layer                           │
│                    (React SPA - Vite)                         │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐        │
│  │  UI Layer   │  │  State Mgmt │  │  API Client  │        │
│  │  (React)    │◄─┤  (Zustand)  │◄─┤  (Fetch)     │        │
│  │             │  │             │  │              │        │
│  │ 23 Pages    │  │ 2 Stores    │  │ REST + WS    │        │
│  │ 42 UI Comp  │  │             │  │              │        │
│  └─────────────┘  └─────────────┘  └──────────────┘        │
│                                           ▲                  │
└───────────────────────────────────────────┼──────────────────┘
                                            │
                                  HTTP/HTTPS + WebSocket
                                            │
                                            ▼
┌───────────────────────────────────────────────────────────────┐
│                      Backend API Server                        │
│                   (Python FastAPI / Node.js)                  │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐        │
│  │  API Layer  │  │  Business   │  │  Job Queue   │        │
│  │  (Routes)   │─►│  Logic      │─►│  (Celery)    │        │
│  │             │  │             │  │              │        │
│  │ Auth, CRUD  │  │ Evaluation  │  │ Async Tasks  │        │
│  │ WebSocket   │  │ Diagnosis   │  │              │        │
│  └─────────────┘  └─────────────┘  └──────────────┘        │
│                                           │                  │
└───────────────────────────────────────────┼──────────────────┘
                                            │
                                            ▼
┌───────────────────────────────────────────────────────────────┐
│                     Evaluation Engine                          │
│                   (Core RAG Evaluation)                       │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐       │
│  │ RAG Pipeline │  │ Metric Calc  │  │ LLM Judge   │       │
│  │              │─►│              │─►│             │       │
│  │ Retrieval    │  │ 12 Metrics   │  │ Diagnosis   │       │
│  │ Generation   │  │              │  │ (GPT-4)     │       │
│  └──────────────┘  └──────────────┘  └─────────────┘       │
│                                                               │
└───────────────────────────────────────────────────────────────┘
                                            │
                                            ▼
┌───────────────────────────────────────────────────────────────┐
│                        Data Layer                              │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐       │
│  │  PostgreSQL  │  │  Vector DB   │  │   Redis     │       │
│  │              │  │              │  │             │       │
│  │ Users        │  │ Embeddings   │  │ Cache       │       │
│  │ Datasets     │  │ Documents    │  │ Sessions    │       │
│  │ Evaluations  │  │              │  │ Rate Limit  │       │
│  │ Results      │  │              │  │             │       │
│  └──────────────┘  └──────────────┘  └─────────────┘       │
│                                                               │
└───────────────────────────────────────────────────────────────┘
                                            │
                                            ▼
┌───────────────────────────────────────────────────────────────┐
│                    External Services                           │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐       │
│  │  OpenAI API  │  │ Pinecone     │  │  S3/Storage │       │
│  │  (LLM Judge) │  │ (Vector DB)  │  │  (Files)    │       │
│  └──────────────┘  └──────────────┘  └─────────────┘       │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### 3.2 프론트엔드 기술 스택

| 카테고리 | 기술 | 버전 | 용도 |
|---------|-----|------|------|
| **프레임워크** | React | 18.x | UI 컴포넌트 |
| **빌드 도구** | Vite | 5.x | 개발 서버 + 빌드 |
| **언어** | TypeScript | 5.x | 타입 안전성 |
| **상태 관리** | Zustand | 4.x | 전역 상태 (평가, 모니터링) |
| **스타일링** | Tailwind CSS | 4.0 | 유틸리티 CSS |
| **UI 컴포넌트** | shadcn/ui | - | 42개 재사용 컴포넌트 |
| **차트** | Recharts | 2.x | 데이터 시각화 |
| **아이콘** | Lucide React | 0.x | 아이콘 시스템 |
| **알림** | Sonner | 2.0 | 토스트 알림 |
| **HTTP** | Fetch API | Native | REST API 호출 |
| **WebSocket** | WebSocket API | Native | 실시간 통신 |

### 3.3 백엔드 기술 스택 (권장)

| 카테고리 | 기술 옵션 | 추천 이유 |
|---------|----------|----------|
| **언어** | Python 3.10+ | RAG/AI 생태계 최적 |
| **프레임워크** | FastAPI | 비동기, 자동 문서화 |
| **ORM** | SQLAlchemy | PostgreSQL 최적화 |
| **Job Queue** | Celery + Redis | 비동기 작업 처리 |
| **LLM Framework** | LangChain | RAG 파이프라인 구축 |
| **Vector DB** | Pinecone / ChromaDB | 임베딩 검색 |
| **Database** | PostgreSQL 14+ | 관계형 데이터 |
| **Cache** | Redis 7+ | 세션, Rate Limit |
| **WebSocket** | FastAPI WebSocket | 실시간 모니터링 |

### 3.4 데이터베이스 스키마

#### ERD (Entity Relationship Diagram)

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    Users     │       │   Datasets   │       │  QA_Pairs    │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │       │ id (PK)      │       │ id (PK)      │
│ email        │       │ user_id (FK) │◄──────│ dataset_id(FK)│
│ name         │       │ name         │       │ question     │
│ role         │       │ description  │       │ answer       │
│ created_at   │       │ file_path    │       │ contexts     │
└──────────────┘       │ qa_count     │       │ metadata     │
       │               │ created_at   │       └──────────────┘
       │               └──────────────┘
       │                      │
       │                      │
       ▼                      ▼
┌──────────────┐       ┌──────────────┐
│ Evaluations  │       │   Models     │
├──────────────┤       ├──────────────┤
│ id (PK)      │       │ id (PK)      │
│ user_id (FK) │       │ name         │
│ dataset_id(FK)│◄─────│ provider     │
│ model_id (FK)│       │ api_endpoint │
│ vector_db_id │       │ parameters   │
│ name         │       └──────────────┘
│ status       │
│ progress     │       ┌──────────────┐
│ config       │       │  VectorDBs   │
│ llm_judge_cfg│       ├──────────────┤
│ created_at   │       │ id (PK)      │
│ started_at   │       │ name         │
│ completed_at │       │ provider     │
└──────────────┘       │ api_endpoint │
       │               │ index_name   │
       │               └──────────────┘
       │
       ▼
┌──────────────┐       ┌──────────────┐
│   Results    │       │ Failed_Cases │
├──────────────┤       ├──────────────┤
│ id (PK)      │       │ id (PK)      │
│ eval_id (FK) │◄──────│ eval_id (FK) │
│ metric_scores│       │ qa_pair_id   │
│ overall_score│       │ failure_type │
│ diagnosis_sum│       │ metric_scores│
│ cost_info    │       │ diagnosis    │
│ metadata     │       │ llm_analysis │
└──────────────┘       │ sampled      │
                       │ heuristic    │
                       └──────────────┘
       │
       ▼
┌──────────────┐       ┌──────────────┐
│ Auto_Improve │       │ Experiments  │
├──────────────┤       ├──────────────┤
│ id (PK)      │       │ id (PK)      │
│ base_eval(FK)│◄──────│ job_id (FK)  │
│ strategy     │       │ params       │
│ target_metric│       │ score        │
│ status       │       │ iteration    │
│ best_config  │       │ created_at   │
│ created_at   │       └──────────────┘
└──────────────┘

┌──────────────┐       ┌──────────────┐
│  Budgets     │       │  Cost_Logs   │
├──────────────┤       ├──────────────┤
│ id (PK)      │       │ id (PK)      │
│ user_id (FK) │◄──────│ eval_id (FK) │
│ project_name │       │ operation    │
│ monthly_limit│       │ model        │
│ alert_50pct  │       │ tokens_used  │
│ alert_80pct  │       │ cost_usd     │
│ hard_limit   │       │ timestamp    │
└──────────────┘       └──────────────┘
```

#### 주요 테이블 정의

**1. evaluations 테이블**
```sql
CREATE TABLE evaluations (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id),
    dataset_id VARCHAR(50) NOT NULL REFERENCES datasets(id),
    model_id VARCHAR(50) NOT NULL REFERENCES models(id),
    vector_db_id VARCHAR(50) REFERENCES vector_dbs(id),
    name VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, running, completed, failed
    progress INTEGER DEFAULT 0, -- 0-100
    config JSONB NOT NULL, -- 평가 설정 (지표, 임계값 등)
    llm_judge_config JSONB, -- LLM Judge 샘플링 설정
    created_at TIMESTAMP DEFAULT NOW(),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);
```

**2. failed_cases 테이블**
```sql
CREATE TABLE failed_cases (
    id SERIAL PRIMARY KEY,
    evaluation_id VARCHAR(50) NOT NULL REFERENCES evaluations(id),
    qa_pair_id INTEGER NOT NULL REFERENCES qa_pairs(id),
    failure_type VARCHAR(50), -- retrieval, generation, hybrid
    metric_scores JSONB NOT NULL, -- 각 지표별 점수
    diagnosis VARCHAR(20) DEFAULT 'Not Analyzed', -- Heuristic, LLM Judge, Not Analyzed
    diagnosis_method VARCHAR(20), -- heuristic, llm_judge
    llm_analysis JSONB, -- LLM Judge 분석 결과
    heuristic_reason VARCHAR(100), -- 휴리스틱 분류 이유
    sampled BOOLEAN DEFAULT FALSE, -- 샘플링 대상 여부
    context_tokens INTEGER, -- 컨텍스트 토큰 수
    created_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_evaluation_id (evaluation_id),
    INDEX idx_failure_type (failure_type),
    INDEX idx_sampled (sampled)
);
```

### 3.5 API 설계

#### REST API 엔드포인트

**인증 (Authentication)**
```
POST   /api/v1/auth/login          # 로그인
POST   /api/v1/auth/logout         # 로그아웃
POST   /api/v1/auth/refresh        # 토큰 갱신
GET    /api/v1/auth/me             # 현재 사용자 정보
```

**데이터셋 (Datasets)**
```
GET    /api/v1/datasets            # 목록 조회
POST   /api/v1/datasets            # 생성
GET    /api/v1/datasets/:id        # 상세 조회
PUT    /api/v1/datasets/:id        # 수정
DELETE /api/v1/datasets/:id        # 삭제
POST   /api/v1/datasets/upload     # 파일 업로드
GET    /api/v1/datasets/:id/preview # 미리보기
```

**평가 (Evaluations)**
```
GET    /api/v1/evaluations         # 목록 조회
POST   /api/v1/evaluations         # 생성 (평가 시작)
GET    /api/v1/evaluations/:id     # 상세 조회
DELETE /api/v1/evaluations/:id     # 삭제
POST   /api/v1/evaluations/:id/stop # 중단
GET    /api/v1/evaluations/:id/status # 실시간 상태 조회
```

**결과 (Results)**
```
GET    /api/v1/results/:evalId     # 평가 결과 조회
GET    /api/v1/results/:evalId/metrics # 지표별 상세
GET    /api/v1/results/:evalId/failed-cases # 실패 케이스 목록
GET    /api/v1/results/:evalId/export # CSV/JSON 다운로드
```

**진단 (Diagnosis)**
```
GET    /api/v1/diagnosis/:evalId/summary # 진단 요약
GET    /api/v1/diagnosis/:evalId/cases   # 실패 케이스 상세
POST   /api/v1/diagnosis/:evalId/run     # 진단 실행
GET    /api/v1/diagnosis/:evalId/cost    # 비용 정보
```

**자동 개선 (Auto-Improve)**
```
POST   /api/v1/auto-improve        # 자동 개선 시작
GET    /api/v1/auto-improve/:id    # 진행 상황 조회
GET    /api/v1/auto-improve/:id/experiments # 실험 결과
POST   /api/v1/auto-improve/:id/stop # 중단
GET    /api/v1/auto-improve/:id/best-config # 최적 설정
```

**비용 (Costs)**
```
GET    /api/v1/costs/dashboard     # 비용 대시보드 데이터
GET    /api/v1/costs/logs          # 비용 로그
GET    /api/v1/budgets             # 예산 목록
POST   /api/v1/budgets             # 예산 생성
PUT    /api/v1/budgets/:id         # 예산 수정
GET    /api/v1/costs/alerts        # 알림 목록
```

**관리자 (Admin)**
```
GET    /api/v1/admin/users         # 사용자 관리
GET    /api/v1/admin/models        # 모델 관리
GET    /api/v1/admin/vector-dbs    # Vector DB 관리
GET    /api/v1/admin/system-status # 시스템 상태
GET    /api/v1/admin/logs          # 시스템 로그
```

#### WebSocket 연결

**실시간 모니터링**
```
WS     /api/v1/ws/evaluations/:id  # 평가 실시간 업데이트
```

**메시지 포맷:**
```json
{
  "type": "progress_update",
  "data": {
    "progress": 45,
    "status": "running",
    "currentTask": "Calculating faithfulness for QA pair 23/50",
    "metrics": {
      "faithfulness": 0.85,
      "answer_relevancy": 0.92
    },
    "timestamp": "2024-10-24T10:30:00Z"
  }
}
```

### 3.6 상태 관리 아키텍처

#### Zustand Store 구조

**1. Evaluation Store (evaluation-store.ts)**
```typescript
interface EvaluationStore {
  // State
  selectedDatasetId: string | null;
  selectedModelId: string | null;
  selectedVectorDbId: string | null;
  evaluationName: string;
  selectedMetrics: MetricConfig[];
  llmJudgeConfig: LLMJudgeConfig;
  
  // Actions
  setDataset: (id: string) => void;
  setModel: (id: string) => void;
  setVectorDb: (id: string) => void;
  toggleMetric: (metricName: string) => void;
  setLLMJudgeConfig: (config: LLMJudgeConfig) => void;
  
  // Validation
  isConfigValid: () => boolean;
  
  // API Integration
  getCurrentRequest: () => CreateEvaluationRequest;
  resetConfig: () => void;
}
```

**2. Monitor Store (monitor-store.ts)**
```typescript
interface MonitorStore {
  // State
  activeEvaluations: Map<string, EvaluationStatus>;
  websockets: Map<string, WebSocket>;
  logs: Map<string, LogEntry[]>;
  
  // Actions
  addEvaluation: (evaluation: EvaluationStatus) => void;
  updateEvaluationStatus: (id: string, status: Partial<EvaluationStatus>) => void;
  removeEvaluation: (id: string) => void;
  
  // WebSocket
  connectWebSocket: (evalId: string, token: string) => void;
  disconnectWebSocket: (evalId: string) => void;
  
  // Logs
  addLog: (evalId: string, log: LogEntry) => void;
  clearLogs: (evalId: string) => void;
}
```

---

## 🔄 4. 데이터 플로우

### 4.1 평가 실행 플로우 (End-to-End)

```
┌─────────────────────────────────────────────────────────────┐
│ Step 1: 사용자 입력                                          │
├─────────────────────────────────────────────────────────────┤
│ 1. 대시보드 → "평가 시작하기" 클릭                          │
│ 2. 평가 모드 선택 (연동된 시스템 / 신규 평가)               │
│ 3. 평가 설정                                                 │
│    - 데이터셋 선택                                           │
│    - 모델 선택 (GPT-4o, Claude-3.5 등)                      │
│    - Vector DB 선택 (Pinecone, ChromaDB 등)                 │
│    - 지표 선택 (12개 중)                                     │
│    - LLM Judge 샘플링 설정 (자동/고정비율/최대케이스)        │
│ 4. "평가 시작" 버튼 클릭                                     │
└─────────────────────────────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 2: Frontend 처리                                        │
├─────────────────────────────────────────────────────────────┤
│ 1. Evaluation Store 검증                                    │
│    - isConfigValid() 확인                                   │
│    - 필수 항목 체크                                          │
│ 2. API 요청 객체 생성                                        │
│    - getCurrentRequest()                                    │
│ 3. API 호출                                                  │
│    - POST /api/v1/evaluations                               │
│    - Authorization: Bearer {JWT_TOKEN}                      │
│ 4. 응답 처리                                                 │
│    - evaluation_id, job_id 저장                             │
│    - Monitor Store에 추가                                   │
│ 5. 페이지 이동                                               │
│    - 평가 모니터링 페이지로 자동 이동                        │
└─────────────────────────────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 3: Backend API 처리                                     │
├─────────────────────────────────────────────────────────────┤
│ 1. 요청 검증                                                 │
│    - JWT 토큰 검증                                           │
│    - 입력 데이터 validation                                  │
│ 2. DB 저장                                                   │
│    - evaluations 테이블에 레코드 생성                        │
│    - status = 'pending'                                     │
│ 3. Job Queue 등록                                            │
│    - Celery.send_task('evaluation.run', eval_id)           │
│ 4. 응답 반환                                                 │
│    - { id, job_id, status: 'pending' }                     │
└─────────────────────────────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 4: Celery Worker 실행                                   │
├─────────────────────────────────────────────────────────────┤
│ 1. Job 수신                                                  │
│    - evaluation_id 파라미터 받음                            │
│ 2. 상태 업데이트                                             │
│    - status = 'running', progress = 0                       │
│ 3. 데이터셋 로드                                             │
│    - QA Pairs 조회                                           │
│ 4. RAG 파이프라인 실행 (각 QA Pair마다)                     │
│    a. Question → Vector DB 검색 → Contexts                 │
│    b. Contexts + Question → LLM → Generated Answer         │
│    c. 12개 지표 계산                                         │
│       - Faithfulness, Answer Relevancy, ...                │
│    d. 진행률 업데이트 (WebSocket 또는 DB)                   │
│       - progress = (current / total) * 100                 │
│ 5. 실패 케이스 수집                                          │
│    - score < threshold인 케이스 저장                        │
└─────────────────────────────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 5: LLM Judge 진단 (선택적)                              │
├─────────────────────────────────────────────────────────────┤
│ 1. 1차 필터: 휴리스틱                                        │
│    - Score < 0.2 → "Trivial Failure" (자동 분류)           │
│    - Context Recall < 0.1 → "Retrieval Failure"           │
│    - 비용: $0                                                │
│ 2. 2차 필터: 샘플링                                          │
│    - 모드: 자동 / 고정비율 / 최대케이스                      │
│    - 예: 150개 실패 케이스 → 30개 샘플링 (20%)             │
│ 3. 3차 분석: LLM Judge                                       │
│    - 샘플링된 케이스만 GPT-4로 분석                         │
│    - 근본 원인 파악 (Retrieval vs Generation)              │
│    - 개선 조언 생성                                          │
│    - 비용: 30개 × $0.015 = $0.45                           │
│ 4. 진단 요약 생성                                            │
│    - total_failed_cases: 150                               │
│    - heuristic_classified: 45                              │
│    - llm_judge_analyzed: 30                                │
│    - cost_saved_percentage: 80%                            │
└─────────────────────────────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 6: 결과 저장                                            │
├─────────────────────────────────────────────────────────────┤
│ 1. results 테이블 저장                                       │
│    - metric_scores (JSON)                                   │
│    - overall_score (평균)                                    │
│    - diagnosis_summary (JSON)                               │
│    - cost_info (JSON)                                       │
│ 2. failed_cases 테이블 저장                                  │
│    - 각 실패 케이스 상세 정보                                │
│    - LLM Judge 분석 결과 (있다면)                           │
│ 3. 평가 상태 업데이트                                        │
│    - status = 'completed'                                   │
│    - progress = 100                                         │
│    - completed_at = NOW()                                   │
└─────────────────────────────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 7: Frontend 실시간 업데이트                             │
├─────────────────────────────────────────────────────────────┤
│ 1. WebSocket 메시지 수신 (또는 Polling)                     │
│    - progress_update: 진행률 업데이트                       │
│    - log: 실시간 로그 메시지                                │
│    - completion: 완료 알림                                  │
│ 2. Monitor Store 업데이트                                    │
│    - updateEvaluationStatus()                               │
│ 3. UI 자동 갱신                                              │
│    - Progress Bar                                           │
│    - Current Task 텍스트                                    │
│    - 로그 스트림                                             │
│ 4. 완료 시 자동 이동                                         │
│    - 결과 페이지로 네비게이션                                │
└─────────────────────────────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 8: 결과 페이지 표시                                     │
├─────────────────────────────────────────────────────────────┤
│ 1. API 호출                                                  │
│    - GET /api/v1/results/:evalId                            │
│ 2. 데이터 표시                                               │
│    - 12개 지표 점수 (Radar Chart)                           │
│    - 진단 요약 카드                                          │
│    - 실패 케이스 테이블                                      │
│    - 비용 절감 효과                                          │
│ 3. 추가 액션                                                 │
│    - CSV/JSON 다운로드                                       │
│    - 결과 비교                                               │
│    - 자동 개선 시작                                          │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 자동 개선 플로우

```
Step 1: 자동 개선 설정
  - 베이스라인 평가 선택
  - 최적화 전략 선택 (빠른 개선 / 균형 탐색 / 전체 그리드)
  - 목표 지표 선택 (Faithfulness, Answer Relevancy 등)
  
Step 2: 실험 계획 생성
  - 탐색할 하이퍼파라미터 조합 생성
  - 예상 실험 횟수 계산
  - 예상 비용 및 소요 시간 계산
  
Step 3: 실험 실행
  - 각 조합마다 평가 실행
  - 실시간 결과 추적
  - 현재 최고 점수 업데이트
  
Step 4: 결과 분석
  - 최적 설정 발견
  - 파레토 프론티어 계산 (점수 vs 비용)
  - Before/After 비교
  
Step 5: 적용
  - "이 설정으로 평가하기" 버튼
  - 최적 설정이 자동으로 평가 폼에 채워짐
```

---

## 🔐 5. 보안 아키텍처

### 5.1 인증 및 권한

**JWT 기반 인증**
```
1. 로그인
   - POST /api/v1/auth/login
   - { email, password }
   - Response: { token, refresh_token, user }

2. 토큰 구조
   - Header: { alg: "HS256", typ: "JWT" }
   - Payload: { user_id, email, role, exp }
   - Signature: HMAC-SHA256

3. 토큰 갱신
   - POST /api/v1/auth/refresh
   - { refresh_token }
   - Response: { token }

4. 자동 갱신
   - Access Token 만료 15분 전 자동 갱신
   - Refresh Token 유효기간: 30일
```

**역할 기반 접근 제어 (RBAC)**
```
Roles:
- Admin: 전체 시스템 관리 권한
- User: 평가 생성/조회/수정/삭제
- Viewer: 결과 조회만 가능

Permissions:
- evaluations:create
- evaluations:read
- evaluations:update
- evaluations:delete
- admin:users
- admin:system
```

### 5.2 데이터 보안

**전송 중 암호화**
- HTTPS/TLS 1.3 사용
- WebSocket: WSS (WebSocket Secure)
- API 키: 환경 변수로 관리

**저장 시 암호화**
- 비밀번호: bcrypt (salt rounds: 12)
- API 키: AES-256 암호화
- 민감 데이터: Database-level encryption

**입력 검증**
- SQL Injection 방어: Prepared Statements
- XSS 방어: HTML Sanitization
- CSRF 방어: CSRF Token

### 5.3 Rate Limiting

```python
# Redis 기반 Rate Limiting
RATE_LIMITS = {
    'api_default': '100/hour',      # 일반 API
    'evaluation_create': '10/hour', # 평가 생성
    'llm_judge': '50/hour',         # LLM Judge
    'export': '20/hour',            # 데이터 다운로드
}
```

---

## 📊 6. 성능 아키텍처

### 6.1 프론트엔드 최적화

**코드 분할 (Code Splitting)**
```typescript
// Route-based lazy loading
const Dashboard = lazy(() => import('./components/DashboardPageBlue'));
const NewEvaluation = lazy(() => import('./components/NewEvaluationPageBlue'));
```

**상태 관리 최적화**
```typescript
// Zustand Selector (불필요한 리렌더링 방지)
const datasetId = useEvaluationStore(state => state.selectedDatasetId);
```

**이미지 최적화**
- Lazy Loading
- WebP 포맷 사용
- Responsive Images

### 6.2 백엔드 최적화

**비동기 처리**
- Celery Worker Pool (4-8 workers)
- 장시간 작업은 백그라운드 Job으로 처리
- WebSocket으로 실시간 진행 상황 업데이트

**캐싱 전략**
```python
# Redis 캐싱
CACHE_STRATEGIES = {
    'user_session': '24h',
    'evaluation_list': '5m',
    'model_list': '1h',
    'dataset_preview': '30m',
}
```

**Database 쿼리 최적화**
- 인덱스 추가 (user_id, status, created_at)
- JOIN 최소화
- Pagination (Offset-based)
- Connection Pooling (min: 5, max: 20)

### 6.3 모니터링

**APM (Application Performance Monitoring)**
- Frontend: Sentry (에러 추적)
- Backend: Prometheus + Grafana (메트릭)
- Logs: ELK Stack (Elasticsearch + Logstash + Kibana)

**핵심 메트릭**
- API 응답 시간 (p50, p95, p99)
- 평가 처리 시간
- LLM Judge 호출 횟수 및 비용
- 에러율
- 사용자 활동

---

## 💰 7. 비용 아키텍처

### 7.1 LLM Judge 비용 최적화

**3단계 필터링 파이프라인**

```
150개 실패 케이스
        │
        ▼
┌────────────────────┐
│ 1차 필터: 휴리스틱  │
│ (비용: $0)         │
│                    │
│ Score < 0.2        │
│ Context < 0.1      │
└────────────────────┘
        │
        ▼ (45개 자동 분류)
105개 남음
        │
        ▼
┌────────────────────┐
│ 2차 필터: 샘플링    │
│ (비용 통제)        │
│                    │
│ 모드: 자동 20%     │
│ → 21개 선택        │
└────────────────────┘
        │
        ▼ (21개 샘플링)
┌────────────────────┐
│ 3차 분석: LLM Judge│
│ (비용: $0.32)      │
│                    │
│ GPT-4 분석         │
│ 21개 × $0.015      │
└────────────────────┘
        │
        ▼
최종 비용: $0.32
절감률: 86% (vs $2.25)
```

### 7.2 비용 추적

**Cost Tracking System**
```typescript
interface CostLog {
  evaluation_id: string;
  operation: 'llm_generation' | 'llm_judge' | 'embedding';
  model: string;
  tokens_used: number;
  cost_usd: number;
  timestamp: Date;
}
```

**예산 관리**
```typescript
interface Budget {
  project_name: string;
  monthly_limit: number;
  current_spent: number;
  alert_thresholds: {
    warning: 0.5,  // 50%
    critical: 0.8, // 80%
    block: 1.0     // 100%
  };
}
```

---

## 🚀 8. 배포 아키텍처

### 8.1 인프라 구성

**Production Environment**

```
┌─────────────────────────────────────────────────────────────┐
│                      CDN (CloudFlare)                        │
│                   Static Assets Caching                     │
└─────────────────────────────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────────┐
│               Load Balancer (AWS ALB / NGINX)                │
│                      SSL Termination                         │
└─────────────────────────────────────────────────────────────┘
                        ▼
        ┌───────────────┴───────────────┐
        │                               │
        ▼                               ▼
┌──────────────────┐           ┌──────────────────┐
│  Web Server 1    │           │  Web Server 2    │
│  (React SPA)     │           │  (React SPA)     │
│  Netlify/Vercel  │           │  Netlify/Vercel  │
└──────────────────┘           └──────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│               API Server Cluster (Auto-scaling)              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ API Server 1 │  │ API Server 2 │  │ API Server 3 │     │
│  │ (FastAPI)    │  │ (FastAPI)    │  │ (FastAPI)    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ PostgreSQL   │ │ Redis Cache  │ │ Celery       │
│ (RDS)        │ │              │ │ Workers      │
│              │ │ Session      │ │ (4-8 nodes)  │
│ Multi-AZ     │ │ Rate Limit   │ │              │
└──────────────┘ └──────────────┘ └──────────────┘
        │
        ▼
┌──────────────┐
│  S3 Storage  │
│  (Datasets,  │
│   Results)   │
└──────────────┘
```

### 8.2 배포 전략

**CI/CD Pipeline (GitHub Actions)**

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  frontend:
    - Build React App
    - Run Tests
    - Deploy to Netlify
    
  backend:
    - Build Docker Image
    - Run Tests
    - Push to ECR
    - Deploy to ECS
    
  database:
    - Run Migrations
    - Seed Data (if needed)
```

**환경 분리**
- Development: Mock 데이터, 로컬 개발
- Staging: 실제 백엔드, 테스트 데이터
- Production: 실제 서비스

### 8.3 스케일링 전략

**Horizontal Scaling**
- API Server: Auto-scaling (2-10 instances)
- Celery Workers: Auto-scaling (4-16 workers)
- Database: Read Replicas (1-3 replicas)

**Vertical Scaling**
- PostgreSQL: 시작 4vCPU/16GB → 필요 시 8vCPU/32GB
- Redis: 2GB → 필요 시 8GB

---

## 📈 9. 비즈니스 메트릭

### 9.1 핵심 성과 지표 (KPI)

| 메트릭 | 목표 | 현재 상태 | 측정 방법 |
|-------|------|----------|----------|
| **월간 활성 사용자 (MAU)** | 100명 | - | User Analytics |
| **평가 실행 횟수** | 500회/월 | - | DB Query |
| **비용 절감률** | 90% | 90% (설계) | Cost Tracking |
| **평가 성공률** | 95% | - | Evaluation Status |
| **평균 평가 시간** | < 10분 | - | Performance Monitor |
| **사용자 만족도** | 4.5/5 | - | NPS Survey |

### 9.2 수익 모델 (참고)

**Freemium 모델 (예시)**
- Free Tier: 10회 평가/월
- Pro: $99/월 - 100회 평가
- Enterprise: Custom - Unlimited + 전용 지원

---

## 🔄 10. 버전 관리 및 로드맵

### 10.1 현재 버전 (V1.0)

**완료된 기능:**
- ✅ 프론트엔드 100% 완성 (23개 페이지)
- ✅ LLM Judge 비용 절감 UI
- ✅ 3단계 자동 개선 시스템
- ✅ 비용 관찰 시스템
- ✅ 완전한 TypeScript 타입 시스템
- ✅ Mock 데이터 기반 프로토타입

**진행 예정:**
- 🟡 백엔드 API 구현
- 🟡 진단 파이프라인 구축
- 🟡 자동 개선 알고리즘 구현

### 10.2 로드맵

**V1.1 (Q1 2025)**
- 백엔드 API 완성
- 프로덕션 배포
- 사용자 피드백 수집

**V1.2 (Q2 2025)**
- 커스텀 지표 생성 기능
- 팀 협업 기능 (공유, 권한 관리)
- 알림 시스템 강화

**V2.0 (Q3 2025)**
- 멀티 LLM 지원 (Claude, Gemini 등)
- 고급 분석 기능 (A/B 테스트)
- API 외부 연동 (Slack, MS Teams)

---

## 📝 11. 부록

### 11.1 용어 정의

| 용어 | 정의 |
|-----|------|
| **RAG** | Retrieval-Augmented Generation, LLM + 외부 지식 검색 |
| **LLM Judge** | LLM을 사용한 응답 품질 평가 (GPT-4 등) |
| **Vector DB** | 임베딩 벡터 저장 및 검색 데이터베이스 |
| **Faithfulness** | 생성 답변이 검색된 컨텍스트에 충실한 정도 |
| **Answer Relevancy** | 생성 답변이 질문에 얼마나 관련있는지 |
| **Heuristic** | 규칙 기반 자동 분류 (LLM 호출 없이) |
| **Sampling** | 전체 중 일부만 선택하여 분석 (비용 절감) |

### 11.2 12개 RAG 지표

**Retrieval Metrics (검색 품질)**
1. Context Precision: 검색된 문서의 정확도
2. Context Recall: 필요한 문서를 얼마나 잘 찾았는지
3. Context Relevancy: 검색 문서의 질문 관련성

**Generation Metrics (생성 품질)**
4. Faithfulness: 답변이 컨텍스트에 충실한지
5. Answer Relevancy: 답변이 질문에 관련있는지
6. Answer Semantic Similarity: 답변과 정답의 의미 유사도
7. Answer Correctness: 답변의 사실적 정확성

**Quality Metrics (답변 품질)**
8. Coherence: 답변의 논리적 일관성
9. Conciseness: 답변의 간결성
10. Aspect Critique: 특정 측면 평가 (예: 친절함)

**Safety Metrics (안전성)**
11. Harmfulness: 유해 콘텐츠 감지
12. Maliciousness: 악의적 내용 감지

### 11.3 참고 문서

**내부 문서**
- [API 명세서](./API-Specification.md)
- [백엔드 연동 가이드](./Backend-Integration-Complete-Guide.md)
- [네비게이션 워크플로우](./Navigation-Workflow-Guide.md)
- [프로젝트 현황](../PROJECT-STATUS.md)

**외부 참고**
- RAGAS Framework: https://docs.ragas.io
- LangChain: https://langchain.com
- FastAPI: https://fastapi.tiangolo.com

---

## 📞 12. 연락처 및 지원

**기획팀 문의:**
- 기능 요구사항
- 비즈니스 로직 검증

**개발팀 문의:**
- 기술 구현 상담
- API 설계 리뷰

**QA팀 문의:**
- 테스트 시나리오
- 버그 리포트

---

**문서 버전:** 1.0  
**최종 수정:** 2024년 10월 24일  
**작성자:** REX Development Team  
**승인자:** -

---

## 📌 Quick Reference

**시작하기:**
1. [README.md](../README.md) - 빠른 시작 가이드
2. [Frontend-Integration-Guide.md](./Frontend-Integration-Guide.md) - 개발자 가이드
3. [Navigation-Workflow-Guide.md](./Navigation-Workflow-Guide.md) - 사용자 워크플로우

**핵심 파일:**
- `/App.tsx` - 메인 앱
- `/components/AppLayout.tsx` - 레이아웃
- `/lib/api-client.ts` - API 클라이언트
- `/types/index.ts` - TypeScript 타입
- `/stores/` - 상태 관리

**중요 개념:**
- 평가 모드 2개: 연동된 시스템 평가 vs 신규 평가
- LLM Judge 비용 90% 절감: 휴리스틱 + 샘플링
- 3단계 자동 개선: 설정 → 진행 → 결과
- 워크플로우 순서: 데이터셋 → 평가 → 모니터링 → 결과

---

**이 문서는 REX 시스템의 마스터 아키텍처 문서입니다.**  
**기획서, 설계서, 개발 가이드의 기반으로 사용하세요.**
