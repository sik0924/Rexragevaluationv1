# Auto-Improve 빠른 시작 가이드

## 🎯 핵심 요약

### 선택된 알고리즘: **Level 1 - Rule-based Optimization**

| 항목               | 내용                              |
| ------------------ | --------------------------------- |
| **개발 기간**      | 2주 (백엔드 1주 + 프론트엔드 1주) |
| **구현 난이도**    | ⭐⭐☆☆☆ (쉬움)                    |
| **예상 성능 개선** | 15-25%                            |
| **실험 횟수**      | 8-12회                            |
| **비용**           | $12-18 per job                    |
| **소요 시간**      | 2-3시간 per job                   |

---

## 📊 작동 원리

### 3단계 프로세스

```
1단계: 근본 원인 분석
   ↓
평가 결과 → 낮은 지표 파악 → 원인 분류 (Retrieval/Generation)
   ↓
2단계: 스마트 실험 생성
   ↓
우선순위 파라미터 선택 → 순차 최적화 경로 생성
   ↓
3단계: 평가 실행 및 Early Stopping
   ↓
실험 실행 → 개선 확인 → 조기 종료 또는 계속
```

### 근본 원인 분석 로직

```typescript
// 의사 코드
function analyzeRootCause(scores) {
  // Retrieval 지표 체크
  if (context_recall < 0.7 || context_precision < 0.7) {
    return {
      problem: "retrieval",
      severity: "high",
      params: ["top_k", "chunk_size", "embedding_model"],
    };
  }

  // Generation 지표 체크
  if (faithfulness < 0.7 || answer_correctness < 0.7) {
    return {
      problem: "generation",
      severity: "high",
      params: ["temperature", "llm_model", "max_tokens"],
    };
  }

  return { problem: "balanced" };
}
```

### 실험 생성 예시

**시나리오: Retrieval 문제 (Context Recall = 0.62)**

```python
# 생성되는 실험 목록
experiments = [
  # Phase 1: Top-K 최적화
  { "name": "Baseline", "config": { "top_k": 5 } },
  { "name": "Top-K=3", "config": { "top_k": 3 } },
  { "name": "Top-K=10", "config": { "top_k": 10 } },
  { "name": "Top-K=15", "config": { "top_k": 15 } },

  # Phase 2: Chunk Size 최적화 (Top-K=10 고정)
  { "name": "ChunkSize=256", "config": { "top_k": 10, "chunk_size": 256 } },
  { "name": "ChunkSize=512", "config": { "top_k": 10, "chunk_size": 512 } },
  { "name": "ChunkSize=1024", "config": { "top_k": 10, "chunk_size": 1024 } },

  # Phase 3: Embedding 모델 (Top-K=10, ChunkSize=512)
  { "name": "Embedding=3-large", "config": {
    "top_k": 10,
    "chunk_size": 512,
    "embedding_model": "text-embedding-3-large"
  }}
]

# 총 8개 실험 → 약 2시간, $12
```

---

## 🛠️ 구현 체크리스트

### Week 1: 백엔드 (Python FastAPI)

#### Day 1-2: 근본 원인 분석

- [ ] `analyze_root_cause()` 함수 구현
  - [ ] Retrieval 지표 계산
  - [ ] Generation 지표 계산
  - [ ] Severity 결정 로직
  - [ ] 우선순위 파라미터 선택
- [ ] API 엔드포인트: `POST /api/v1/auto-improve/analyze`
- [ ] 유닛 테스트 작성

#### Day 3-4: 실험 생성 로직

- [ ] `generate_retrieval_first_experiments()` 구현
- [ ] `generate_generation_first_experiments()` 구현
- [ ] `generate_balanced_experiments()` 구현
- [ ] API 엔드포인트: `POST /api/v1/auto-improve/generate-experiments`
- [ ] 유닛 테스트 작성

#### Day 5-7: 비동기 실행 및 WebSocket

- [ ] Celery 태스크: `run_auto_improve_job()`
  - [ ] Early Stopping 로직
  - [ ] Redis Pub/Sub 통합
- [ ] WebSocket 서버 구현
- [ ] API 엔드포인트: `POST /api/v1/auto-improve/jobs`
- [ ] API 엔드포인트: `GET /api/v1/auto-improve/jobs/{job_id}`
- [ ] 통합 테스트

### Week 2: 프론트엔드 (React + TypeScript)

#### Day 1-2: Setup 페이지 업데이트

- [ ] `AutoImproveSetupPageBlue.tsx` 수정
  - [ ] 근본 원인 분석 API 연동
  - [ ] 분석 결과 UI 표시
  - [ ] 추정 정보 (비용, 시간) 표시
- [ ] 사용자 테스트

#### Day 3-4: Progress 페이지 업데이트

- [ ] `AutoImproveProgressPageBlue.tsx` 수정
  - [ ] WebSocket 연결 및 실시간 업데이트
  - [ ] 실험별 진행 상황 표시
  - [ ] Early Stopping 메시지 표시
- [ ] 사용자 테스트

#### Day 5-7: Results 페이지 업데이트

- [ ] `AutoImproveResultsPageBlue.tsx` 수정
  - [ ] 개선 비교 차트
  - [ ] 파라미터별 성능 비교
  - [ ] 최적 설정 적용 기능
- [ ] E2E 테스트
- [ ] 성능 최적화

---

## 📝 API 사용 예시

### 1. 근본 원인 분석

```bash
curl -X POST https://api.rex.com/api/v1/auto-improve/analyze \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "evaluation_id": "eval-001"
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "root_causes": {
      "retrieval": {
        "severity": "high",
        "affected_metrics": ["context_recall"],
        "priority_params": ["top_k", "chunk_size"]
      }
    },
    "recommended_strategy": "retrieval_first",
    "estimated_experiments": 8,
    "estimated_cost": 12.00,
    "estimated_duration_minutes": 120
  }
}
```

### 2. 자동 개선 시작

```bash
curl -X POST https://api.rex.com/api/v1/auto-improve/jobs \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "base_evaluation_id": "eval-001",
    "strategy": "retrieval_first",
    "optimization_level": "rule_based",
    "early_stopping": {
      "enabled": true,
      "min_improvement": 0.05,
      "patience": 3,
      "target_score": 0.9
    }
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "job_id": "auto-improve-job-001",
    "status": "pending",
    "websocket_url": "wss://api.rex.com/ws/auto-improve/auto-improve-job-001"
  }
}
```

### 3. WebSocket 연결 (프론트엔드)

```typescript
import { AutoImproveWebSocket } from "../lib/api-client";

// WebSocket 연결
const ws = new AutoImproveWebSocket(
  "auto-improve-job-001",
  token,
);

ws.connect(
  // onMessage
  (message) => {
    if (message.type === "experiment_completed") {
      console.log("실험 완료:", message.data.score);
      updateUI(message.data);
    }

    if (message.type === "job_completed") {
      console.log("자동 개선 완료!");
      showResults(message.data);
    }
  },
  // onError
  (error) => {
    console.error("WebSocket 에러:", error);
  },
  // onClose
  () => {
    console.log("WebSocket 연결 종료");
  },
);

// 연결 해제
ws.disconnect();
```

### 4. 결과 조회

```bash
curl https://api.rex.com/api/v1/auto-improve/jobs/auto-improve-job-001 \
  -H "Authorization: Bearer {token}"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "job_id": "auto-improve-job-001",
    "status": "completed",
    "experiments_completed": 8,
    "best_config": {
      "top_k": 10,
      "chunk_size": 512,
      "embedding_model": "text-embedding-3-large"
    },
    "improvement": {
      "baseline_score": 0.62,
      "best_score": 0.85,
      "improvement_rate": 0.371
    },
    "total_cost": 12.00,
    "duration_minutes": 125
  }
}
```

### 5. 최적 설정 적용

```bash
curl -X POST https://api.rex.com/api/v1/auto-improve/jobs/auto-improve-job-001/apply \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "dataset_id": "dataset-002"
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "evaluation_id": "eval-003",
    "config": {
      "top_k": 10,
      "chunk_size": 512,
      "embedding_model": "text-embedding-3-large"
    },
    "status": "pending"
  }
}
```

---

## 🧪 테스트 시나리오

### 시나리오 1: Retrieval 문제

**입력:**

```json
{
  "scores": {
    "context_recall": 0.62,
    "context_precision": 0.68,
    "faithfulness": 0.82,
    "answer_relevancy": 0.85
  }
}
```

**예상 출력:**

- 전략: `retrieval_first`
- 실험 횟수: 8개
- 개선 목표: Context Recall 0.62 → 0.85 이상

**예상 결과:**

- 최적 파라미터: `top_k=10`, `chunk_size=512`
- 개선율: +37%
- 소요 시간: 120분

### 시나리오 2: Generation 문제

**입력:**

```json
{
  "scores": {
    "context_recall": 0.85,
    "faithfulness": 0.65,
    "answer_correctness": 0.68,
    "coherence": 0.72
  }
}
```

**예상 출력:**

- 전략: `generation_first`
- 실험 횟수: 10개
- 개선 목표: Faithfulness 0.65 → 0.85 이상

**예상 결과:**

- 최적 파라미터: `temperature=0.3`, `llm_model=Claude-3.5 Sonnet`
- 개선율: +35%
- 소요 시간: 150분

### 시나리오 3: 균형 문제

**입력:**

```json
{
  "scores": {
    "context_recall": 0.72,
    "context_precision": 0.75,
    "faithfulness": 0.73,
    "answer_relevancy": 0.76
  }
}
```

**예상 출력:**

- 전략: `balanced`
- 실험 횟수: 12개
- 개선 목표: 전체 점수 0.74 → 0.88 이상

---

## 🚀 배포 준비

### 환경 변수 설정

```bash
# .env
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
REDIS_HOST=localhost
REDIS_PORT=6379
API_BASE_URL=https://api.rex.com/api/v1
WEBSOCKET_URL=wss://api.rex.com
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  # FastAPI Backend
  api:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/rex
      - REDIS_HOST=redis
    depends_on:
      - db
      - redis

  # Celery Worker
  celery_worker:
    build: ./backend
    command: celery -A app.celery worker --loglevel=info
    environment:
      - CELERY_BROKER_URL=redis://redis:6379/0
    depends_on:
      - redis

  # Redis
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  # PostgreSQL
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=rex
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### 시작 명령어

```bash
# 백엔드 시작
docker-compose up -d

# Celery Worker 확인
docker-compose logs -f celery_worker

# 프론트엔드 시작
cd frontend
npm run dev
```

---

## 📚 참고 문서

1. **알고리즘 명세:** `/guidelines/Auto-Improve-Algorithm-Specification.md`
2. **구현 가이드:** `/guidelines/Auto-Improve-Implementation-Guide.md`
3. **API 명세:** `/guidelines/API-Specification.md` (섹션 5)
4. **타입 정의:** `/types/index.ts` (Auto-Improve Types)
5. **API 클라이언트:** `/lib/api-client.ts` (autoImproveApi)

---

## ❓ FAQ

### Q1: Level 2, Level 3는 언제 구현하나요?

**A:** Level 1로 MVP 출시 후, 사용자 피드백을 받아 결정합니다. 일반적으로 Level 1만으로도 충분한 개선 효과를 얻을 수 있습니다.

### Q2: Early Stopping이 작동하지 않으면?

**A:** `patience` 값을 늘리거나 (3 → 5), `min_improvement`를 낮추세요 (0.05 → 0.03).

### Q3: 비용이 예산을 초과하면?

**A:** `budget.max_experiments`를 설정하여 실험 횟수를 제한하거나, `budget.max_cost`로 최대 비용을 설정하세요.

### Q4: WebSocket 연결이 끊기면?

**A:** `AutoImproveWebSocket` 클래스가 자동으로 재연결을 시도합니다 (최대 5회). 수동으로 연결하려면 `ws.connect()`를 다시 호출하세요.

### Q5: 어떤 파라미터를 최적화할지 모르겠어요.

**A:** 근본 원인 분석 API (`/auto-improve/analyze`)를 호출하면 자동으로 권장 파라미터를 제시합니다.

---

## 완료

이제 REX의 Auto-Improve 기능을 구현할 준비가 완료되었습니다!

**다음 단계:**

1. 백엔드 팀: Week 1 체크리스트 시작
2. 프론트엔드 팀: Week 2 체크리스트 준비
3. QA 팀: 테스트 시나리오 검토