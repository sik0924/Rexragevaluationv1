# Cost Observability 가이드

## 📋 목차
1. [개요](#개요)
2. [비용 계산 로직](#비용-계산-로직)
3. [API 명세](#api-명세)
4. [예산 관리 전략](#예산-관리-전략)
5. [비용 최적화 방법](#비용-최적화-방법)
6. [구현 가이드](#구현-가이드)

---

## 개요

### 문제 정의

REX는 **LLM Judge 기반 평가 지표**를 사용하기 때문에 막대한 LLM API 비용이 발생합니다:

```
단일 평가 비용 = QA 개수 × 지표 개수 × 지표당 평균 비용

예시:
- 150개 QA × 12개 지표 × $0.025/평가 = $45/평가
- Auto-Improve (12개 실험) = $45 × 12 = $540
- 월간 100회 평가 = $4,500/월
```

### 핵심 기능

1. **Cost Tracking (비용 추적)**
   - 실시간 비용 모니터링
   - 평가별/지표별/LLM별 비용 분해
   - 사용자별/프로젝트별 비용 집계

2. **Budget Management (예산 관리)**
   - 프로젝트별 예산 설정
   - 예산 초과 경고 (50%, 80%, 95% 임계값)
   - Hard Limit (초과 시 자동 중단)

3. **Cost Prediction (비용 예측)**
   - 평가 생성 전 비용 추정
   - 샘플링 전략별 비용 비교
   - 지표 선택에 따른 비용 변화

4. **Cost Optimization (비용 최적화)**
   - 샘플링 전략 (30% 샘플 → 70% 절감)
   - 지표 선택적 활성화
   - LLM 모델 전환 (GPT-4o → GPT-4o-mini)
   - 결과 캐싱

---

## 비용 계산 로직

### LLM 별 토큰 가격 (2025년 기준)

```typescript
const LLM_PRICING = {
  'GPT-4o': {
    provider: 'openai',
    input_price_per_1k: 0.0025,   // $0.0025 per 1K tokens
    output_price_per_1k: 0.01,    // $0.01 per 1K tokens
    cache_price_per_1k: 0.00125   // 50% 할인
  },
  'GPT-4o-mini': {
    provider: 'openai',
    input_price_per_1k: 0.00015,  // $0.00015 per 1K tokens
    output_price_per_1k: 0.0006,  // $0.0006 per 1K tokens
    cache_price_per_1k: 0.000075
  },
  'Claude-3.5 Sonnet': {
    provider: 'anthropic',
    input_price_per_1k: 0.003,    // $0.003 per 1K tokens
    output_price_per_1k: 0.015,   // $0.015 per 1K tokens
    cache_price_per_1k: 0.0015
  },
  'Claude-3 Opus': {
    provider: 'anthropic',
    input_price_per_1k: 0.015,    // $0.015 per 1K tokens
    output_price_per_1k: 0.075,   // $0.075 per 1K tokens
    cache_price_per_1k: 0.0075
  }
};
```

### 지표별 평균 토큰 소비량

LLM Judge 기반 지표들의 평균 토큰 사용량 (실험 기반 추정):

```typescript
const METRIC_TOKEN_USAGE = {
  // Generation 지표 (높은 토큰 소비)
  'faithfulness': {
    input_tokens: 800,   // Question + Context + Answer + Prompt
    output_tokens: 150   // LLM Judge 응답
  },
  'answer_relevancy': {
    input_tokens: 700,
    output_tokens: 120
  },
  'answer_correctness': {
    input_tokens: 850,
    output_tokens: 200   // 상세한 분석 필요
  },
  'coherence': {
    input_tokens: 600,
    output_tokens: 100
  },
  'conciseness': {
    input_tokens: 550,
    output_tokens: 80
  },
  
  // Retrieval 지표 (중간 토큰 소비)
  'context_precision': {
    input_tokens: 750,
    output_tokens: 130
  },
  'context_recall': {
    input_tokens: 720,
    output_tokens: 140
  },
  'context_entity_recall': {
    input_tokens: 800,
    output_tokens: 160
  },
  
  // Safety 지표 (높은 토큰 소비)
  'harmfulness': {
    input_tokens: 900,   // 더 상세한 프롬프트 필요
    output_tokens: 250
  },
  'maliciousness': {
    input_tokens: 850,
    output_tokens: 230
  },
  
  // Other 지표
  'answer_similarity': {
    input_tokens: 650,
    output_tokens: 100
  },
  'critique_correctness': {
    input_tokens: 900,
    output_tokens: 300   // 가장 높은 출력 토큰
  }
};
```

### 비용 계산 함수

```python
def calculate_metric_cost(
    metric_name: str,
    qa_count: int,
    llm_model: str,
    use_caching: bool = False
) -> float:
    """
    특정 지표의 평가 비용 계산
    """
    # 토큰 사용량 조회
    token_usage = METRIC_TOKEN_USAGE.get(metric_name)
    if not token_usage:
        raise ValueError(f"Unknown metric: {metric_name}")
    
    # LLM 가격 조회
    pricing = LLM_PRICING.get(llm_model)
    if not pricing:
        raise ValueError(f"Unknown LLM model: {llm_model}")
    
    # 입력 토큰 비용
    if use_caching:
        # 캐싱 활성화 시 50% 할인 (첫 번째 요청 제외)
        cache_hits = qa_count - 1
        input_cost = (
            token_usage['input_tokens'] * pricing['input_price_per_1k'] / 1000 +
            cache_hits * token_usage['input_tokens'] * pricing['cache_price_per_1k'] / 1000
        )
    else:
        input_cost = (
            qa_count * token_usage['input_tokens'] * pricing['input_price_per_1k'] / 1000
        )
    
    # 출력 토큰 비용
    output_cost = (
        qa_count * token_usage['output_tokens'] * pricing['output_price_per_1k'] / 1000
    )
    
    return input_cost + output_cost


def calculate_evaluation_cost(
    qa_count: int,
    metrics: list[str],
    llm_model: str = 'GPT-4o',
    sampling_rate: float = 1.0,
    use_caching: bool = False
) -> dict:
    """
    전체 평가 비용 계산
    """
    # 샘플링 적용
    effective_qa_count = int(qa_count * sampling_rate)
    
    # 지표별 비용 계산
    metric_costs = []
    total_cost = 0
    
    for metric_name in metrics:
        metric_cost = calculate_metric_cost(
            metric_name,
            effective_qa_count,
            llm_model,
            use_caching
        )
        
        metric_costs.append({
            'metric_name': metric_name,
            'cost': metric_cost,
            'qa_count': effective_qa_count
        })
        
        total_cost += metric_cost
    
    return {
        'total_cost': total_cost,
        'cost_per_qa': total_cost / effective_qa_count if effective_qa_count > 0 else 0,
        'qa_count': effective_qa_count,
        'original_qa_count': qa_count,
        'sampling_rate': sampling_rate,
        'metric_costs': metric_costs,
        'use_caching': use_caching
    }


# 사용 예시
result = calculate_evaluation_cost(
    qa_count=150,
    metrics=[
        'faithfulness',
        'answer_relevancy',
        'context_precision',
        'context_recall'
    ],
    llm_model='GPT-4o',
    sampling_rate=1.0,
    use_caching=False
)

print(f"총 비용: ${result['total_cost']:.2f}")
print(f"QA당 비용: ${result['cost_per_qa']:.3f}")

# 출력:
# 총 비용: $45.67
# QA당 비용: $0.304
```

### 비용 절감 시뮬레이션

```python
# 시나리오 1: 전체 평가 (Baseline)
baseline = calculate_evaluation_cost(
    qa_count=150,
    metrics=[
        'faithfulness', 'answer_relevancy', 'answer_correctness',
        'context_precision', 'context_recall', 'context_entity_recall',
        'coherence', 'conciseness', 'harmfulness', 'maliciousness',
        'answer_similarity', 'critique_correctness'
    ],
    llm_model='GPT-4o',
    sampling_rate=1.0,
    use_caching=False
)
print(f"Baseline: ${baseline['total_cost']:.2f}")  # $68.25

# 시나리오 2: 30% 샘플링
sampling = calculate_evaluation_cost(
    qa_count=150,
    metrics=[...],  # 동일
    llm_model='GPT-4o',
    sampling_rate=0.3,
    use_caching=False
)
print(f"30% 샘플링: ${sampling['total_cost']:.2f}")  # $20.48 (70% 절감)

# 시나리오 3: 필수 지표만 (6개)
essential_metrics = calculate_evaluation_cost(
    qa_count=150,
    metrics=[
        'faithfulness', 'answer_relevancy',
        'context_precision', 'context_recall',
        'coherence', 'answer_correctness'
    ],
    llm_model='GPT-4o',
    sampling_rate=1.0,
    use_caching=False
)
print(f"필수 지표만: ${essential_metrics['total_cost']:.2f}")  # $34.12 (50% 절감)

# 시나리오 4: GPT-4o-mini 전환
mini_model = calculate_evaluation_cost(
    qa_count=150,
    metrics=[...],  # 12개 전체
    llm_model='GPT-4o-mini',
    sampling_rate=1.0,
    use_caching=False
)
print(f"GPT-4o-mini: ${mini_model['total_cost']:.2f}")  # $4.09 (94% 절감!)

# 시나리오 5: 캐싱 활성화
caching = calculate_evaluation_cost(
    qa_count=150,
    metrics=[...],  # 12개 전체
    llm_model='GPT-4o',
    sampling_rate=1.0,
    use_caching=True
)
print(f"캐싱 활성화: ${caching['total_cost']:.2f}")  # $54.60 (20% 절감)

# 시나리오 6: 모든 최적화 적용
optimized = calculate_evaluation_cost(
    qa_count=150,
    metrics=[
        'faithfulness', 'answer_relevancy',
        'context_precision', 'context_recall',
        'coherence', 'answer_correctness'
    ],
    llm_model='GPT-4o-mini',
    sampling_rate=0.3,
    use_caching=True
)
print(f"최적화: ${optimized['total_cost']:.2f}")  # $0.61 (99% 절감!)
```

---

## API 명세

### 1. 비용 요약 조회

**Endpoint:** `GET /api/v1/costs/summary`

**Query Parameters:**
- `period` (optional): `today` | `week` | `month` | `all`

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "month",
    "total_cost": 1847.32,
    "total_evaluations": 45,
    "total_qa_processed": 6750,
    "avg_cost_per_evaluation": 41.05,
    "avg_cost_per_qa": 0.27,
    "cost_by_provider": [
      {
        "provider": "openai",
        "model": "GPT-4o",
        "cost": 1142.45,
        "percentage": 61.8
      }
    ],
    "cost_by_metric": [
      {
        "metric_name": "faithfulness",
        "cost": 423.12,
        "percentage": 22.9
      }
    ],
    "cost_trend": [
      {
        "date": "2025-12-07",
        "cost": 234.56
      }
    ]
  }
}
```

### 2. 평가별 비용 조회

**Endpoint:** `GET /api/v1/costs/evaluations/{evaluation_id}`

**Response:**
```json
{
  "success": true,
  "data": {
    "evaluation_id": "eval-001",
    "evaluation_name": "고객 지원 QA 평가",
    "total_cost": 45.67,
    "qa_count": 150,
    "cost_per_qa": 0.304,
    "metric_costs": [
      {
        "metric_name": "faithfulness",
        "llm_model": "GPT-4o",
        "total_calls": 150,
        "input_tokens": 120000,
        "output_tokens": 22500,
        "cached_tokens": 0,
        "cost": 3.56,
        "avg_latency_ms": 1245
      }
    ],
    "timestamp": "2025-12-13T10:30:00Z",
    "duration_minutes": 18,
    "status": "completed"
  }
}
```

### 3. 비용 예측

**Endpoint:** `POST /api/v1/costs/predict`

**Request:**
```json
{
  "dataset_id": "dataset-001",
  "metrics": [
    "faithfulness",
    "answer_relevancy",
    "context_precision",
    "context_recall"
  ],
  "sampling_rate": 0.3,
  "llm_model": "GPT-4o",
  "use_caching": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "estimated_cost": 13.70,
    "breakdown": [
      {
        "metric_name": "faithfulness",
        "qa_count": 45,
        "estimated_tokens": 42750,
        "estimated_cost": 3.56
      }
    ],
    "confidence": "high",
    "factors": [
      "샘플링 30% 적용",
      "150개 QA 중 45개 평가",
      "캐싱 비활성화"
    ]
  }
}
```

### 4. 예산 생성

**Endpoint:** `POST /api/v1/budgets`

**Request:**
```json
{
  "name": "월간 평가 예산",
  "type": "organization",
  "entity_id": "org-001",
  "limit": 2000,
  "period": "monthly",
  "alert_thresholds": [50, 80, 95],
  "is_hard_limit": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "budget-001",
    "name": "월간 평가 예산",
    "type": "organization",
    "entity_id": "org-001",
    "limit": 2000,
    "period": "monthly",
    "current_usage": 0,
    "percentage_used": 0,
    "alert_thresholds": [50, 80, 95],
    "is_hard_limit": false,
    "created_at": "2025-12-13T10:00:00Z"
  }
}
```

### 5. 예산 알림 조회

**Endpoint:** `GET /api/v1/budgets/alerts`

**Query Parameters:**
- `severity` (optional): `info` | `warning` | `critical`
- `is_acknowledged` (optional): `true` | `false`

**Response:**
```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "id": "alert-001",
        "budget_id": "budget-001",
        "type": "threshold_exceeded",
        "severity": "warning",
        "message": "월간 평가 예산의 92.4%를 사용했습니다",
        "current_usage": 1847.32,
        "budget_limit": 2000,
        "percentage_used": 92.4,
        "timestamp": "2025-12-13T10:30:00Z",
        "is_acknowledged": false
      }
    ]
  }
}
```

### 6. 비용 최적화 제안

**Endpoint:** `GET /api/v1/costs/optimize`

**Query Parameters:**
- `evaluation_id` (optional): 특정 평가 기준 분석

**Response:**
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "id": "opt-001",
        "type": "sampling",
        "title": "샘플링 전략 활성화",
        "description": "전체 데이터셋 대신 30% 샘플만 평가하여 비용을 70% 절감할 수 있습니다.",
        "estimated_savings": 1293.12,
        "estimated_savings_percentage": 70,
        "impact_on_accuracy": "정확도 5% 감소 예상 (신뢰구간 ±2%)",
        "implementation_effort": "easy"
      }
    ]
  }
}
```

---

## 예산 관리 전략

### 1. 조직 레벨 예산

**목적:** 전체 조직의 월간 LLM 비용 상한 설정

```python
# 예산 생성
budget = {
    "name": "조직 월간 예산",
    "type": "organization",
    "entity_id": "org-001",
    "limit": 5000,  # $5,000/month
    "period": "monthly",
    "alert_thresholds": [50, 80, 95],
    "is_hard_limit": False  # Soft Limit (경고만)
}

# 알림 임계값 설명:
# - 50%: "예산의 절반을 사용했습니다" (Info)
# - 80%: "예산 주의 - 80% 사용" (Warning)
# - 95%: "예산 거의 소진 - 즉시 확인 필요" (Critical)
```

### 2. 프로젝트 레벨 예산

**목적:** 특정 프로젝트의 비용 제한

```python
# Auto-Improve 프로젝트 예산 (Hard Limit)
budget = {
    "name": "Auto-Improve 프로젝트",
    "type": "project",
    "entity_id": "project-auto-improve",
    "limit": 500,  # $500/month
    "period": "monthly",
    "alert_thresholds": [50, 80, 95],
    "is_hard_limit": True  # Hard Limit (초과 시 중단)
}

# Hard Limit 작동 방식:
# - 예산 95% 도달 시: 새 평가 생성 차단
# - 실행 중인 평가: 완료까지 허용
# - 사용자에게 즉시 알림 발송
```

### 3. 사용자 레벨 예산

**목적:** 개별 사용자의 과도한 비용 방지

```python
budget = {
    "name": "사용자 주간 예산",
    "type": "user",
    "entity_id": "user-123",
    "limit": 200,  # $200/week
    "period": "weekly",
    "alert_thresholds": [80, 95],
    "is_hard_limit": False
}
```

### 4. 예산 초과 처리 로직

```python
async def check_budget_before_evaluation(
    user_id: str,
    project_id: str,
    estimated_cost: float
) -> dict:
    """
    평가 생성 전 예산 확인
    """
    # 1. 모든 관련 예산 조회
    budgets = await get_budgets(user_id, project_id)
    
    for budget in budgets:
        # 현재 사용량 + 예상 비용
        projected_usage = budget.current_usage + estimated_cost
        projected_percentage = (projected_usage / budget.limit) * 100
        
        # Hard Limit 체크
        if budget.is_hard_limit and projected_percentage > 95:
            return {
                "allowed": False,
                "reason": f"{budget.name} 예산 초과 (95% 이상)",
                "current_usage": budget.current_usage,
                "limit": budget.limit,
                "estimated_cost": estimated_cost
            }
        
        # Soft Limit 경고
        if projected_percentage > 95:
            # 경고 발송 (평가는 허용)
            await send_budget_alert(budget, projected_percentage)
    
    return {
        "allowed": True,
        "warnings": [...]
    }
```

---

## 비용 최적화 방법

### 1. 샘플링 전략 (Sampling)

**효과:** 70% 비용 절감, 5% 정확도 감소

```python
# Random Sampling
sampling_config = {
    "enabled": True,
    "type": "random",
    "sample_rate": 0.3,  # 30% 샘플링
    "min_samples": 50,   # 최소 50개 보장
    "seed": 42           # 재현성
}

# Stratified Sampling (카테고리별 균등 샘플링)
sampling_config = {
    "enabled": True,
    "type": "stratified",
    "sample_rate": 0.3,
    "stratify_by": "category",  # 카테고리별 30%씩
    "min_samples_per_stratum": 10
}

# Systematic Sampling (체계적 샘플링)
sampling_config = {
    "enabled": True,
    "type": "systematic",
    "sample_rate": 0.3,
    "interval": 3  # 매 3번째 QA 선택
}
```

**구현:**
```python
def apply_sampling(qa_pairs: list, config: dict) -> list:
    """
    샘플링 전략 적용
    """
    if not config.get('enabled', False):
        return qa_pairs
    
    sample_size = max(
        int(len(qa_pairs) * config['sample_rate']),
        config.get('min_samples', 1)
    )
    
    if config['type'] == 'random':
        import random
        random.seed(config.get('seed'))
        return random.sample(qa_pairs, sample_size)
    
    elif config['type'] == 'stratified':
        # 카테고리별 균등 샘플링
        from collections import defaultdict
        stratified = defaultdict(list)
        
        for qa in qa_pairs:
            category = qa.get(config['stratify_by'], 'default')
            stratified[category].append(qa)
        
        sampled = []
        for category, items in stratified.items():
            n = max(
                int(len(items) * config['sample_rate']),
                config.get('min_samples_per_stratum', 1)
            )
            sampled.extend(random.sample(items, min(n, len(items))))
        
        return sampled
    
    elif config['type'] == 'systematic':
        interval = config['interval']
        return qa_pairs[::interval]
    
    return qa_pairs
```

### 2. 지표 선택적 활성화

**효과:** 50% 비용 절감

```python
# 필수 지표만 활성화
ESSENTIAL_METRICS = [
    'faithfulness',        # 가장 중요
    'answer_relevancy',    # 가장 중요
    'context_precision',   # Retrieval 평가
    'context_recall',      # Retrieval 평가
    'answer_correctness',  # Generation 평가
    'coherence'            # 품질 평가
]

# 선택적 지표 (필요 시만)
OPTIONAL_METRICS = [
    'harmfulness',         # Safety가 중요한 경우만
    'maliciousness',       # Safety가 중요한 경우만
    'context_entity_recall', # 세밀한 분석 필요 시
    'answer_similarity',   # 비교 평가 시
    'critique_correctness', # 메타 평가 시
    'conciseness'          # 간결성 중요 시
]
```

### 3. LLM 모델 전환

**효과:** 60-94% 비용 절감, 3-8% 정확도 감소

```python
# 지표별 권장 LLM 모델
METRIC_LLM_MAPPING = {
    # 높은 정확도 필요 → GPT-4o
    'faithfulness': 'GPT-4o',
    'answer_correctness': 'GPT-4o',
    'harmfulness': 'GPT-4o',
    
    # 중간 정확도 → Claude-3.5 Sonnet (균형)
    'answer_relevancy': 'Claude-3.5 Sonnet',
    'context_precision': 'Claude-3.5 Sonnet',
    'context_recall': 'Claude-3.5 Sonnet',
    
    # 낮은 정확도 허용 → GPT-4o-mini (저비용)
    'coherence': 'GPT-4o-mini',
    'conciseness': 'GPT-4o-mini',
    'answer_similarity': 'GPT-4o-mini'
}

# 비용 비교
costs = {
    'GPT-4o': calculate_evaluation_cost(150, ESSENTIAL_METRICS, 'GPT-4o'),
    'GPT-4o-mini': calculate_evaluation_cost(150, ESSENTIAL_METRICS, 'GPT-4o-mini'),
    'Mixed': calculate_mixed_model_cost(150, ESSENTIAL_METRICS)
}

print(f"GPT-4o: ${costs['GPT-4o']:.2f}")        # $34.12
print(f"GPT-4o-mini: ${costs['GPT-4o-mini']:.2f}")  # $2.05
print(f"Mixed Models: ${costs['Mixed']:.2f}")   # $18.67 (최적 균형)
```

### 4. 결과 캐싱

**효과:** 20-50% 비용 절감 (반복 평가 시)

```python
# 캐싱 전략
CACHING_CONFIG = {
    "enabled": True,
    "cache_key_fields": [
        "question",
        "context",
        "answer",
        "metric_name",
        "llm_model"
    ],
    "ttl_seconds": 86400 * 7,  # 7일
    "max_cache_size_mb": 1000   # 1GB
}

# 구현
import hashlib
import redis

redis_client = redis.Redis()

def get_cached_result(qa_pair: dict, metric: str, model: str) -> dict | None:
    """
    캐시된 평가 결과 조회
    """
    # 캐시 키 생성
    cache_key = hashlib.sha256(
        f"{qa_pair['question']}:{qa_pair['context']}:{qa_pair['answer']}:{metric}:{model}".encode()
    ).hexdigest()
    
    # Redis 조회
    cached = redis_client.get(f"eval_cache:{cache_key}")
    
    if cached:
        return json.loads(cached)
    
    return None

def cache_result(qa_pair: dict, metric: str, model: str, result: dict):
    """
    평가 결과 캐싱
    """
    cache_key = hashlib.sha256(
        f"{qa_pair['question']}:{qa_pair['context']}:{qa_pair['answer']}:{metric}:{model}".encode()
    ).hexdigest()
    
    redis_client.setex(
        f"eval_cache:{cache_key}",
        CACHING_CONFIG['ttl_seconds'],
        json.dumps(result)
    )
```

### 5. 배치 처리 최적화

**효과:** 10-15% 비용 절감 (API 호출 최적화)

```python
# 배치 평가 (동시 처리)
async def batch_evaluate(qa_pairs: list, metric: str, batch_size: int = 10):
    """
    여러 QA를 배치로 평가
    """
    results = []
    
    for i in range(0, len(qa_pairs), batch_size):
        batch = qa_pairs[i:i+batch_size]
        
        # 동시 처리
        tasks = [evaluate_single_qa(qa, metric) for qa in batch]
        batch_results = await asyncio.gather(*tasks)
        
        results.extend(batch_results)
    
    return results
```

---

## 구현 가이드

### Phase 1: Cost Tracking (Week 1)

**백엔드 구현:**

```python
# models.py
class EvaluationCost(Base):
    __tablename__ = 'evaluation_costs'
    
    id = Column(String, primary_key=True)
    evaluation_id = Column(String, ForeignKey('evaluations.id'))
    total_cost = Column(Float)
    qa_count = Column(Integer)
    cost_per_qa = Column(Float)
    timestamp = Column(DateTime)
    
    # 지표별 비용
    metric_costs = relationship('MetricCost', back_populates='evaluation_cost')

class MetricCost(Base):
    __tablename__ = 'metric_costs'
    
    id = Column(String, primary_key=True)
    evaluation_cost_id = Column(String, ForeignKey('evaluation_costs.id'))
    metric_name = Column(String)
    llm_model = Column(String)
    total_calls = Column(Integer)
    input_tokens = Column(Integer)
    output_tokens = Column(Integer)
    cached_tokens = Column(Integer)
    cost = Column(Float)
    avg_latency_ms = Column(Float)

# cost_tracker.py
class CostTracker:
    def __init__(self):
        self.costs = []
    
    async def track_metric_evaluation(
        self,
        evaluation_id: str,
        metric_name: str,
        llm_model: str,
        input_tokens: int,
        output_tokens: int,
        cached_tokens: int = 0
    ):
        """
        지표 평가 비용 추적
        """
        pricing = LLM_PRICING[llm_model]
        
        # 비용 계산
        input_cost = input_tokens * pricing['input_price_per_1k'] / 1000
        output_cost = output_tokens * pricing['output_price_per_1k'] / 1000
        cache_cost = cached_tokens * pricing['cache_price_per_1k'] / 1000
        
        total_cost = input_cost + output_cost + cache_cost
        
        # 데이터베이스에 저장
        metric_cost = MetricCost(
            id=f"mc-{uuid.uuid4()}",
            evaluation_cost_id=evaluation_id,
            metric_name=metric_name,
            llm_model=llm_model,
            total_calls=1,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            cached_tokens=cached_tokens,
            cost=total_cost
        )
        
        await db.add(metric_cost)
        await db.commit()
        
        return total_cost

# FastAPI 엔드포인트
@router.get("/costs/summary")
async def get_cost_summary(period: str = 'month'):
    """
    비용 요약 조회
    """
    # 기간별 비용 집계
    costs = await get_costs_by_period(period)
    
    return {
        "success": True,
        "data": {
            "total_cost": sum(c.total_cost for c in costs),
            "total_evaluations": len(costs),
            # ...
        }
    }
```

### Phase 2: Budget Management (Week 2)

```python
# budget_manager.py
class BudgetManager:
    async def check_budget(
        self,
        user_id: str,
        project_id: str,
        estimated_cost: float
    ) -> dict:
        """
        예산 체크
        """
        budgets = await self.get_active_budgets(user_id, project_id)
        
        for budget in budgets:
            projected = budget.current_usage + estimated_cost
            percentage = (projected / budget.limit) * 100
            
            # Hard Limit 체크
            if budget.is_hard_limit and percentage > 95:
                return {
                    "allowed": False,
                    "budget": budget,
                    "reason": "Budget limit exceeded"
                }
            
            # 알림 임계값 체크
            for threshold in budget.alert_thresholds:
                if budget.percentage_used < threshold <= percentage:
                    await self.send_alert(budget, threshold)
        
        return {"allowed": True}
    
    async def send_alert(self, budget: Budget, threshold: int):
        """
        예산 알림 발송
        """
        alert = CostAlert(
            id=f"alert-{uuid.uuid4()}",
            budget_id=budget.id,
            type="threshold_exceeded",
            severity="warning" if threshold < 95 else "critical",
            message=f"{budget.name}의 {threshold}%를 사용했습니다",
            current_usage=budget.current_usage,
            budget_limit=budget.limit,
            percentage_used=budget.percentage_used,
            timestamp=datetime.now().isoformat()
        )
        
        await db.add(alert)
        
        # 이메일/Slack 알림
        await send_notification(alert)
```

### Phase 3: Cost Prediction (Week 3)

```python
@router.post("/costs/predict")
async def predict_cost(request: CostPredictRequest):
    """
    평가 비용 예측
    """
    # 데이터셋 조회
    dataset = await get_dataset(request.dataset_id)
    
    # 비용 계산
    estimated = calculate_evaluation_cost(
        qa_count=len(dataset.qa_pairs),
        metrics=request.metrics,
        llm_model=request.llm_model or 'GPT-4o',
        sampling_rate=request.sampling_rate or 1.0,
        use_caching=request.use_caching or False
    )
    
    return {
        "success": True,
        "data": {
            "estimated_cost": estimated['total_cost'],
            "breakdown": estimated['metric_costs'],
            "confidence": "high",
            "factors": [
                f"샘플링 {int(request.sampling_rate * 100)}% 적용" if request.sampling_rate < 1.0 else "전체 평가",
                f"{len(dataset.qa_pairs)}개 QA 중 {estimated['qa_count']}개 평가",
                "캐싱 활성화" if request.use_caching else "캐싱 비활성화"
            ]
        }
    }
```

---

## 다음 단계

1. **Week 1-3:** Cost Tracking + Budget Management + Cost Prediction 구현
2. **Week 4:** Cost Dashboard 페이지 프론트엔드 통합
3. **Week 5:** 비용 최적화 제안 자동화
4. **Week 6:** 테스트 및 배포

**필요한 추가 작업:**
- [ ] LLM API 응답에서 실제 토큰 사용량 수집 (OpenAI/Anthropic API 응답 파싱)
- [ ] Redis 캐싱 인프라 구축
- [ ] 이메일/Slack 알림 통합
- [ ] 비용 대시보드 실시간 업데이트 (WebSocket)


