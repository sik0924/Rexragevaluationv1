# REX Production Deployment Checklist

## 📋 상업용 출시 준비 완료!

모든 **필수 구현 사항**이 완료되었습니다. 아래 체크리스트를 통해 배포 준비 상태를 확인하세요.

---

## ✅ 완료된 구현 항목

### 1. 데이터베이스 스키마 ✅

**파일:** `/guidelines/Cost-Tracking-Production-Implementation.md`

- [x] **LLM 가격 정보 테이블** (`llm_pricing`)
  - OpenAI, Anthropic 모델별 토큰 가격
  - 캐싱 할인 가격 포함
  - 가격 변동 이력 추적

- [x] **평가 비용 추적 테이블** (`evaluation_costs`)
  - 평가별 총 비용 집계
  - 토큰 사용량 (입력/출력/캐시)
  - QA당 평균 비용 자동 계산

- [x] **지표별 비용 분해 테이블** (`metric_costs`)
  - 지표별 LLM API 호출 추적
  - 토큰 사용량 및 응답 시간
  - 실패율 추적

- [x] **예산 관리 테이블** (`budgets`)
  - 사용자/프로젝트/조직별 예산 설정
  - 자동 사용률 계산 (Computed Column)
  - 기간별 예산 (일간/주간/월간/분기/연간)

- [x] **비용 알림 테이블** (`cost_alerts`)
  - 임계값 초과 자동 알림
  - 심각도별 분류 (Info/Warning/Critical)
  - 확인 처리 기능

- [x] **PostgreSQL 트리거**
  - 예산 사용량 자동 업데이트
  - 임계값 체크 및 알림 자동 생성

- [x] **Materialized View**
  - 일별 비용 요약 (성능 최적화)
  - LLM 제공사별/지표별 비용 집계

**배포 방법:**
```bash
# 1. PostgreSQL 연결
psql -U rex -d rex_db

# 2. 스키마 생성
\i backend/migrations/001_cost_tracking_schema.sql

# 3. 초기 데이터 삽입 (LLM 가격)
\i backend/migrations/002_insert_llm_pricing.sql
```

---

### 2. LLM API 토큰 사용량 수집 ✅

**파일:** `/guidelines/Cost-Tracking-Production-Implementation.md` (Section 2)

- [x] **OpenAI API 파싱**
  - `response.usage.prompt_tokens` 수집
  - `response.usage.completion_tokens` 수집
  - `response.usage.prompt_tokens_details.cached_tokens` 수집
  - 실제 API Response 구조 반영

- [x] **Anthropic API 파싱**
  - `response.usage.input_tokens` 수집
  - `response.usage.output_tokens` 수집
  - `response.usage.cache_read_input_tokens` 수집
  - Prompt Caching 지원

- [x] **Unified LLM Client**
  - 모든 Provider 통합
  - 일관된 token_info 응답 형식
  - 에러 핸들링 및 로깅

**구현 코드:**
```python
# services/llm_clients/openai_client.py
async def chat_completion(self, messages, model, **kwargs):
    response = await self.client.chat.completions.create(...)
    
    return {
        'content': response.choices[0].message.content,
        'token_info': {
            'input_tokens': response.usage.prompt_tokens,
            'output_tokens': response.usage.completion_tokens,
            'cached_tokens': response.usage.prompt_tokens_details.cached_tokens,
            'provider': 'openai',
            'model': model
        }
    }
```

---

### 3. 비용 추적 미들웨어 ✅

**파일:** `/guidelines/Cost-Tracking-Production-Implementation.md` (Section 3)

- [x] **CostTracker 싱글톤 클래스**
  - 평가 시작/완료 추적
  - 지표별 비용 자동 집계
  - 실시간 토큰 사용량 기록

- [x] **@track_llm_cost 데코레이터**
  - LLM API 호출 자동 추적
  - 응답 시간 측정
  - 비용 자동 계산 및 DB 저장

- [x] **자동 비용 계산**
  - LLM 가격 정보 자동 조회
  - 캐싱 할인 적용
  - 평가별 총 비용 실시간 업데이트

**사용 예시:**
```python
@track_llm_cost(metric_name='faithfulness')
async def evaluate(self, db, question, context, answer):
    result = await self.llm_client.complete(...)
    return {
        'score': score,
        'token_info': result['token_info']  # 자동 추적됨
    }
```

---

### 4. 예산 관리 백엔드 ✅

**파일:** `/guidelines/Cost-Tracking-Production-Implementation.md` (Section 4)

- [x] **BudgetService**
  - 예산 생성/수정/삭제
  - 활성 예산 조회
  - 기간별 자동 리셋

- [x] **예산 체크 로직**
  - 평가 전 예산 검증
  - Hard Limit 강제 차단
  - Soft Limit 경고만 표시

- [x] **Budget API Endpoints**
  - `POST /api/v1/budgets` - 예산 생성
  - `GET /api/v1/budgets` - 예산 목록
  - `PUT /api/v1/budgets/{id}` - 예산 수정
  - `DELETE /api/v1/budgets/{id}` - 예산 삭제
  - `GET /api/v1/budgets/alerts` - 알림 조회

**핵심 기능:**
```python
# 평가 생성 전 예산 체크
budget_check = await BudgetService.check_budget_before_evaluation(
    user_id=user_id,
    estimated_cost=estimated_cost
)

if not budget_check['allowed']:
    return {"error": "Budget limit exceeded"}
```

---

### 5. 알림 통합 (이메일/Slack) ✅

**파일:** `/guidelines/Cost-Tracking-Production-Implementation.md` (Section 5)

- [x] **이메일 서비스 (SMTP)**
  - Gmail, SendGrid, AWS SES 지원
  - HTML 템플릿 (Jinja2)
  - 심각도별 디자인 (색상, 아이콘)
  - 예산 현황 표시

- [x] **Slack 서비스 (Webhook)**
  - Block Kit 메시지 포맷
  - 대시보드 링크 버튼
  - 채널별 알림 전송

- [x] **NotificationManager**
  - 이메일 + Slack 통합 관리
  - 알림 전송 로그 기록
  - 실패 재시도 (선택 사항)

**이메일 템플릿 예시:**
```
🚨 REX 비용 알림

월간 평가 예산의 92.4%를 사용했습니다

예산 현황:
- 현재 사용량: $1,847.32
- 예산 한도: $2,000.00
- 사용률: 92.4%

[비용 대시보드 보기]
```

---

### 6. 통합 예시 ✅

**파일:** `/guidelines/Cost-Tracking-Production-Implementation.md` (Section 6)

- [x] **EvaluationRunner**
  - 비용 예측 → 예산 체크 → 평가 실행 → 비용 추적 완료
  - 전체 워크플로우 통합

- [x] **Celery Background Tasks**
  - 만료된 예산 자동 리셋 (매일 자정)
  - Celery Beat 스케줄러 설정

- [x] **Docker Compose 설정**
  - PostgreSQL, Redis, FastAPI, Celery Worker, Celery Beat
  - 환경 변수 관리

**전체 평가 플로우:**
```python
async def run_evaluation(evaluation_id, qa_pairs, metrics):
    # 1. 비용 예측
    estimated_cost = calculate_cost(qa_pairs, metrics)
    
    # 2. 예산 체크
    if not check_budget(estimated_cost):
        return {"error": "Budget exceeded"}
    
    # 3. 비용 추적 시작
    cost_tracker.start_evaluation(evaluation_id)
    
    # 4. 평가 실행 (자동 추적)
    results = await evaluate_all(qa_pairs, metrics)
    
    # 5. 비용 추적 완료
    cost_tracker.complete_evaluation()
    
    return results
```

---

## 🚀 배포 단계

### Week 1: 인프라 설정

**Day 1-2: 데이터베이스**
```bash
# PostgreSQL 설치 및 설정
docker-compose up -d db

# 스키마 생성
psql -U rex -d rex_db -f migrations/001_cost_tracking_schema.sql

# 초기 데이터
psql -U rex -d rex_db -f migrations/002_insert_llm_pricing.sql

# 테스트
psql -U rex -d rex_db -c "SELECT * FROM llm_pricing;"
```

**Day 3-4: 백엔드 API**
```bash
# FastAPI 앱 시작
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# API 테스트
curl http://localhost:8000/api/v1/costs/pricing
curl http://localhost:8000/api/v1/budgets
```

**Day 5: Celery Worker**
```bash
# Celery Worker 시작
celery -A tasks.celery_app worker --loglevel=info

# Celery Beat 시작
celery -A tasks.celery_app beat --loglevel=info

# 테스트
celery -A tasks.celery_app inspect active
```

**Day 6-7: 알림 설정**
```bash
# 환경 변수 설정
export SMTP_HOST=smtp.gmail.com
export SMTP_USERNAME=your-email@gmail.com
export SMTP_PASSWORD=your-app-password
export SLACK_WEBHOOK_URL=https://hooks.slack.com/...

# 알림 테스트
python -c "from services.notification.email_service import EmailService; \
           service = EmailService(...); \
           service.send_budget_alert(...)"
```

---

### Week 2: 비용 추적 통합

**Day 1-2: LLM 클라이언트 통합**
```python
# OpenAI 테스트
from services.llm_clients.openai_client import OpenAIClient

client = OpenAIClient(api_key=OPENAI_API_KEY)
result = await client.chat_completion(
    messages=[{"role": "user", "content": "Test"}],
    model="gpt-4o"
)

print(result['token_info'])
# {'input_tokens': 10, 'output_tokens': 5, ...}
```

**Day 3-4: 비용 추적 테스트**
```python
# 비용 추적 테스트
tracker = CostTracker()

# 평가 시작
eval_cost = await tracker.start_evaluation(db, eval_id, 150)

# 지표 평가 (자동 추적)
@track_llm_cost('faithfulness')
async def evaluate_faithfulness(db, qa_pair):
    result = await llm_client.complete(...)
    return result

# 평가 완료
await tracker.complete_evaluation(db, eval_cost.id)

# 비용 확인
print(f"Total cost: ${eval_cost.total_cost}")
```

**Day 5-7: 전체 워크플로우 테스트**
```bash
# 1. 평가 생성 API 호출
curl -X POST http://localhost:8000/api/v1/evaluations \
  -H "Content-Type: application/json" \
  -d '{
    "dataset_id": "dataset-001",
    "metrics": ["faithfulness", "answer_relevancy"]
  }'

# 2. 비용 조회
curl http://localhost:8000/api/v1/costs/evaluations/eval-001

# 3. 예산 현황 확인
curl http://localhost:8000/api/v1/budgets/budget-001
```

---

### Week 3: 예산 관리 및 알림

**Day 1-2: 예산 설정**
```bash
# 예산 생성
curl -X POST http://localhost:8000/api/v1/budgets \
  -H "Content-Type: application/json" \
  -d '{
    "name": "월간 평가 예산",
    "type": "organization",
    "entity_id": "org-001",
    "limit_amount": 2000,
    "period": "monthly",
    "is_hard_limit": false
  }'
```

**Day 3-4: 알림 테스트**
```python
# 예산 초과 시뮬레이션
budget.current_usage = 1900  # 95% 사용
await db.commit()

# 알림 자동 발송 확인 (PostgreSQL 트리거)
alerts = await db.query(CostAlert).filter(
    CostAlert.budget_id == budget.id
).all()

print(f"Alerts: {len(alerts)}")  # 95% 임계값 알림 생성됨
```

**Day 5-7: End-to-End 테스트**
```bash
# 시나리오: 예산 거의 소진 상태에서 평가 생성
# 1. 예산 설정 (Hard Limit)
curl -X POST /api/v1/budgets -d '{"limit_amount": 100, "is_hard_limit": true}'

# 2. 사용량 증가
# ... 평가 여러 번 실행 ...

# 3. 예산 초과 시도
curl -X POST /api/v1/evaluations -d '{...}'

# 예상 응답:
# {
#   "success": false,
#   "error": {
#     "code": "BUDGET_EXCEEDED",
#     "message": "월간 평가 예산 한도 초과"
#   }
# }

# 4. 이메일/Slack 알림 수신 확인
```

---

### Week 4: 프론트엔드 통합

**Day 1-3: Cost Dashboard 연동**
```typescript
// components/CostDashboardPageBlue.tsx
import { api } from '../lib/api-client';

const CostDashboardPage = () => {
  const [costSummary, setCostSummary] = useState(null);
  
  useEffect(() => {
    const fetchCostSummary = async () => {
      const response = await api.cost.getSummary({ period: 'month' });
      if (response.success) {
        setCostSummary(response.data);
      }
    };
    
    fetchCostSummary();
  }, []);
  
  return (
    <div>
      <h1>총 비용: ${costSummary?.total_cost}</h1>
      {/* ... */}
    </div>
  );
};
```

**Day 4-5: 예산 관리 UI**
```typescript
// 예산 생성
const handleCreateBudget = async () => {
  const response = await api.budget.create({
    name: '월간 예산',
    limit_amount: 2000,
    period: 'monthly'
  });
  
  if (response.success) {
    toast.success('예산이 생성되었습니다');
  }
};

// 예산 알림 조회
const alerts = await api.budget.getAlerts({ is_acknowledged: false });
```

**Day 6-7: 비용 예측 통합**
```typescript
// NewEvaluationPage에 비용 예측 추가
const [estimatedCost, setEstimatedCost] = useState(null);

const handleDatasetChange = async (datasetId) => {
  const response = await api.cost.predictCost({
    dataset_id: datasetId,
    metrics: selectedMetrics
  });
  
  setEstimatedCost(response.data.estimated_cost);
};

return (
  <div>
    <p>예상 비용: ${estimatedCost}</p>
    {budgetWarning && (
      <Alert variant="warning">예산 초과 예상</Alert>
    )}
  </div>
);
```

---

### Week 5: Production 배포

**Day 1: 환경 변수 설정**
```bash
# Production 환경 변수
cat > .env.production <<EOF
DATABASE_URL=postgresql+asyncpg://rex:PROD_PASSWORD@db.rex.com:5432/rex_prod
REDIS_URL=redis://redis.rex.com:6379/0
OPENAI_API_KEY=sk-prod-...
ANTHROPIC_API_KEY=sk-ant-prod-...
SMTP_HOST=smtp.sendgrid.net
SMTP_USERNAME=apikey
SMTP_PASSWORD=SG.prod...
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/PROD/WEBHOOK/URL
SECRET_KEY=production-secret-key-change-this
DEBUG=False
EOF
```

**Day 2: Docker 빌드 및 배포**
```bash
# Docker 이미지 빌드
docker-compose -f docker-compose.prod.yml build

# 이미지 태그
docker tag rex-backend:latest registry.rex.com/rex-backend:v1.0

# 푸시
docker push registry.rex.com/rex-backend:v1.0

# 배포
kubectl apply -f k8s/deployment.yaml
```

**Day 3: 데이터베이스 마이그레이션**
```bash
# Production DB 백업
pg_dump -U rex rex_prod > backup_before_migration.sql

# 마이그레이션 실행
alembic upgrade head

# 검증
psql -U rex -d rex_prod -c "SELECT COUNT(*) FROM llm_pricing;"
```

**Day 4: 모니터링 설정**
```bash
# Prometheus + Grafana
docker-compose -f monitoring/docker-compose.yml up -d

# 메트릭 확인
curl http://localhost:9090/api/v1/query?query=cost_tracking_total_cost

# Grafana 대시보드 임포트
# dashboard/cost-observability.json
```

**Day 5: 로드 테스트**
```bash
# Locust 로드 테스트
pip install locust
locust -f tests/load_test.py --host=https://api.rex.com

# 목표:
# - 100 users, 10 req/s
# - 평균 응답 시간 < 2초
# - 비용 추적 정확도 100%
```

**Day 6-7: 프로덕션 검증**
```bash
# 1. API 헬스 체크
curl https://api.rex.com/health

# 2. 비용 추적 검증
# - 실제 평가 실행
# - 비용 데이터 확인
# - 예산 알림 수신 확인

# 3. 알림 테스트
# - 이메일 발송 테스트
# - Slack 메시지 확인

# 4. 성능 모니터링
# - Grafana 대시보드 확인
# - Sentry 에러 모니터링
```

---

## 📊 검증 체크리스트

### 기능 검증

- [ ] **비용 추적**
  - [ ] OpenAI API 호출 시 토큰 정확히 수집
  - [ ] Anthropic API 호출 시 토큰 정확히 수집
  - [ ] 비용 계산 정확도 (±0.1% 이내)
  - [ ] 평가별 총 비용 자동 집계

- [ ] **예산 관리**
  - [ ] 예산 생성/수정/삭제 정상 작동
  - [ ] Hard Limit 강제 차단 확인
  - [ ] Soft Limit 경고 발송 확인
  - [ ] 기간별 자동 리셋 확인

- [ ] **알림**
  - [ ] 이메일 발송 성공률 > 95%
  - [ ] Slack 메시지 발송 성공률 > 95%
  - [ ] 임계값 알림 정상 발송
  - [ ] 알림 전송 로그 기록

### 성능 검증

- [ ] **응답 시간**
  - [ ] 비용 요약 조회 < 500ms
  - [ ] 예산 체크 < 100ms
  - [ ] 비용 추적 오버헤드 < 50ms

- [ ] **동시성**
  - [ ] 100명 동시 사용자 지원
  - [ ] 초당 10회 평가 실행 가능
  - [ ] 데이터베이스 커넥션 풀 안정성

### 보안 검증

- [ ] **데이터 보안**
  - [ ] API Key 암호화 저장
  - [ ] 비용 데이터 사용자별 격리
  - [ ] 예산 정보 권한 제어

- [ ] **API 보안**
  - [ ] JWT 인증 적용
  - [ ] Rate Limiting 설정
  - [ ] HTTPS 강제

---

##  상업용 출시 준비 완료!

모든 필수 구현 사항이 완료되었습니다:

✅ **데이터베이스 스키마** - PostgreSQL 완전 구현  
✅ **LLM API 토큰 수집** - OpenAI/Anthropic 파싱  
✅ **비용 추적 미들웨어** - 자동 추적 데코레이터  
✅ **예산 관리 백엔드** - 완전한 CRUD + 체크 로직  
✅ **알림 통합** - 이메일 + Slack  

**다음 단계:**
1. Week 1-5 배포 플랜 실행
2. 프로덕션 환경 검증
3. 베타 사용자 테스트
4. 공식 출시! 


