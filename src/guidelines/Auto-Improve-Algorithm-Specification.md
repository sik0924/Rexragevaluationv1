# REX Auto-Improve 알고리즘 명세서

## 📋 목차
1. [개요](#개요)
2. [Level 1: Rule-based Optimization (추천)](#level-1-rule-based-optimization-추천)
3. [Level 2: Sequential Greedy Optimization](#level-2-sequential-greedy-optimization)
4. [Level 3: Bayesian Optimization](#level-3-bayesian-optimization)
5. [구현 로드맵](#구현-로드맵)
6. [API 설계](#api-설계)

---

## 개요

### 문제 정의
RAG 시스템의 12개 지표 중 낮은 점수를 받은 지표를 개선하기 위해, Retrieval 및 Generation 파라미터를 자동으로 최적화합니다.

### 핵심 도전 과제
- **탐색 공간:** 6개 파라미터 × 평균 4개 옵션 = 4,096가지 조합
- **평가 비용:** 1회 평가 = 150 QA × $0.01 = $1.5, 전체 탐색 = $6,144
- **시간 제약:** 1회 평가 = 15분, 전체 탐색 = 1,024시간 (42일)

### 해결 전략
- **Level 1:** 규칙 기반 + 제한적 Grid Search → 12-24회 평가 (3-6시간, $18-36)
- **Level 2:** Greedy 순차 최적화 → 18-30회 평가 (5-8시간, $27-45)
- **Level 3:** Bayesian Optimization → 30-50회 평가 (8-13시간, $45-75)

---

## Level 1: Rule-based Optimization (추천)

### ✅ 추천 이유
- **개발 기간:** 1-2주
- **구현 난이도:** ⭐⭐☆☆☆ (쉬움)
- **성능:** 평균 15-25% 개선
- **비용:** $18-36
- **MVP에 적합:** 즉시 실용 가능

### 📊 알고리즘 설계

#### Step 1: 근본 원인 분석 (Root Cause Analysis)

**입력:** 기준 평가 결과 (Baseline Evaluation)

**지표 → 원인 매핑 테이블:**
| 지표 | 임계값 | 근본 원인 | 관련 파라미터 |
|------|--------|-----------|--------------|
| Context Precision | < 0.7 | Retrieval 품질 | `top_k`, `chunk_size` |
| Context Recall | < 0.7 | Retrieval 범위 | `top_k`, `embedding_model` |
| Context Entity Recall | < 0.7 | Retrieval 세밀도 | `chunk_size`, `embedding_model` |
| Faithfulness | < 0.7 | Generation 환각 | `temperature`, `llm_model` |
| Answer Relevancy | < 0.7 | Generation 정확도 | `temperature`, `llm_model` |
| Answer Correctness | < 0.7 | Generation 품질 | `llm_model`, `max_tokens` |
| Coherence | < 0.7 | Generation 일관성 | `temperature` |
| Conciseness | < 0.7 | Generation 간결성 | `max_tokens`, `temperature` |

**출력:** 문제 카테고리 및 우선순위 파라미터
```typescript
{
  "root_causes": {
    "retrieval": {
      "severity": "high",  // low, medium, high
      "affected_metrics": ["context_recall", "context_precision"],
      "priority_params": ["top_k", "chunk_size"]
    },
    "generation": {
      "severity": "medium",
      "affected_metrics": ["faithfulness"],
      "priority_params": ["temperature"]
    }
  },
  "recommended_strategy": "retrieval_first"  // retrieval_first, generation_first, balanced
}
```

#### Step 2: 파라미터 조합 생성 (Smart Grid Search)

**전략 1: Retrieval 우선 (retrieval_first)**
```typescript
// Severity가 'high'인 경우
const retrievalExperiments = [
  // 1. Top-K 최적화 (Chunk Size 고정)
  { top_k: 3, chunk_size: 512 },   // 베이스라인 설정
  { top_k: 5, chunk_size: 512 },
  { top_k: 10, chunk_size: 512 },
  
  // 2. Chunk Size 최적화 (Top-K 고정 - 이전 최고값)
  { top_k: 5, chunk_size: 256 },   // 5가 최고였다고 가정
  { top_k: 5, chunk_size: 1024 },
  
  // 3. Embedding 모델 변경 (Top-K, Chunk Size 고정)
  { top_k: 5, chunk_size: 512, embedding_model: 'text-embedding-3-large' }
];
// 총 6회 평가 ($9, 1.5시간)
```

**전략 2: Generation 우선 (generation_first)**
```typescript
const generationExperiments = [
  // 1. Temperature 최적화 (LLM 고정)
  { temperature: 0.1, llm_model: 'GPT-4o' },
  { temperature: 0.3, llm_model: 'GPT-4o' },
  { temperature: 0.5, llm_model: 'GPT-4o' },
  { temperature: 0.7, llm_model: 'GPT-4o' },
  
  // 2. LLM 모델 변경 (Temperature 고정 - 이전 최고값)
  { temperature: 0.3, llm_model: 'Claude-3.5 Sonnet' },
  { temperature: 0.3, llm_model: 'GPT-4o-mini' },
  
  // 3. Max Tokens 조정
  { temperature: 0.3, llm_model: 'GPT-4o', max_tokens: 256 },
  { temperature: 0.3, llm_model: 'GPT-4o', max_tokens: 512 }
];
// 총 8회 평가 ($12, 2시간)
```

**전략 3: 균형 접근 (balanced)**
```typescript
// Severity가 둘 다 'medium'인 경우
const balancedExperiments = [
  // Phase 1: Retrieval (4회)
  { top_k: 3 },
  { top_k: 5 },
  { top_k: 10 },
  { chunk_size: 256 },  // Top-K는 이전 최고값 사용
  
  // Phase 2: Generation (4회)
  { temperature: 0.3 },
  { temperature: 0.5 },
  { temperature: 0.7 },
  { llm_model: 'Claude-3.5 Sonnet' }
];
// 총 8회 평가 ($12, 2시간)
```

#### Step 3: 평가 실행 및 조기 종료

**Early Stopping 규칙:**
```typescript
interface EarlyStoppingConfig {
  min_improvement: 0.05;      // 최소 5% 개선
  patience: 3;                 // 3회 연속 개선 없으면 중단
  target_score: 0.9;          // 목표 점수 달성 시 즉시 종료
}

// 예시
if (currentScore >= baselineScore * 1.05) {
  console.log('개선 달성! 다음 파라미터로 진행');
} else if (noImprovementCount >= 3) {
  console.log('조기 종료: 개선 없음');
  return bestConfigSoFar;
} else if (currentScore >= 0.9) {
  console.log('목표 달성! 최적화 완료');
  return currentConfig;
}
```

#### Step 4: 최종 검증 및 권장 설정

**출력:**
```typescript
{
  "best_config": {
    "top_k": 5,
    "chunk_size": 512,
    "embedding_model": "text-embedding-3-large",
    "temperature": 0.3,
    "llm_model": "Claude-3.5 Sonnet",
    "max_tokens": 512
  },
  "improvement": {
    "baseline_score": 0.72,
    "best_score": 0.89,
    "improvement_rate": 0.236,  // 23.6% 개선
    "improved_metrics": {
      "context_recall": { "before": 0.65, "after": 0.88 },
      "faithfulness": { "before": 0.70, "after": 0.92 }
    }
  },
  "experiments_run": 12,
  "total_cost": 18.00,
  "duration_minutes": 180
}
```

---

## Level 2: Sequential Greedy Optimization

### ✅ 특징
- **개발 기간:** 2-4주
- **구현 난이도:** ⭐⭐⭐☆☆ (중간)
- **성능:** 평균 25-35% 개선
- **비용:** $27-45

### 📊 알고리즘 설계

#### Greedy 순차 최적화 전략

**핵심 아이디어:**
1. 한 번에 하나의 파라미터만 최적화
2. 이전 단계의 최적값을 다음 단계에 적용
3. 파라미터 간 의존성을 고려한 순서 결정

**파라미터 최적화 순서:**
```
1. Embedding Model (영향력 큼, 옵션 적음) → 3회 평가
2. Chunk Size (Embedding에 의존) → 4회 평가
3. Top-K (Chunk Size에 의존) → 4회 평가
4. LLM Model (독립적) → 4회 평가
5. Temperature (LLM에 의존) → 5회 평가
6. Max Tokens (Temperature에 의존) → 4회 평가

총 24회 평가
```

**의사 코드:**
```typescript
async function sequentialGreedyOptimization(
  baselineEvaluation: Evaluation
): Promise<OptimizationResult> {
  let currentConfig = baselineEvaluation.config;
  let currentScore = baselineEvaluation.avgScore;
  
  const parameterSequence = [
    { name: 'embedding_model', options: ['ada-002', '3-small', '3-large'] },
    { name: 'chunk_size', options: [128, 256, 512, 1024] },
    { name: 'top_k', options: [3, 5, 10, 15] },
    { name: 'llm_model', options: ['GPT-4o', 'GPT-4o-mini', 'Claude-3.5 Sonnet'] },
    { name: 'temperature', options: [0.1, 0.3, 0.5, 0.7, 0.9] },
    { name: 'max_tokens', options: [128, 256, 512, 1024] }
  ];
  
  for (const param of parameterSequence) {
    console.log(`Optimizing ${param.name}...`);
    
    let bestOptionScore = currentScore;
    let bestOption = currentConfig[param.name];
    
    for (const option of param.options) {
      // 현재 최적 설정에서 하나의 파라미터만 변경
      const testConfig = { ...currentConfig, [param.name]: option };
      
      // 평가 실행
      const score = await runEvaluation(testConfig);
      
      if (score > bestOptionScore) {
        bestOptionScore = score;
        bestOption = option;
      }
    }
    
    // 최적값으로 업데이트
    currentConfig[param.name] = bestOption;
    currentScore = bestOptionScore;
    
    console.log(`Best ${param.name}: ${bestOption} (score: ${bestOptionScore})`);
  }
  
  return {
    best_config: currentConfig,
    final_score: currentScore
  };
}
```

**장점:**
- 파라미터 간 상호작용 고려
- 전체 Grid Search 대비 1/170로 평가 횟수 감소
- 구현이 직관적

**단점:**
- Local Optima에 빠질 가능성
- 파라미터 순서에 민감

---

## Level 3: Bayesian Optimization

### ✅ 특징
- **개발 기간:** 4-8주
- **구현 난이도:** ⭐⭐⭐⭐⭐ (어려움)
- **성능:** 평균 30-40% 개선
- **비용:** $45-75

### 📊 알고리즘 설계

#### Bayesian Optimization with Gaussian Process

**필요 라이브러리:**
```bash
# Python 백엔드
pip install scikit-optimize  # Bayesian Optimization
pip install optuna           # Alternative (추천)
```

**Optuna 기반 구현:**
```python
import optuna
from optuna.samplers import TPESampler

def objective(trial):
    # 파라미터 제안
    config = {
        'embedding_model': trial.suggest_categorical(
            'embedding_model', 
            ['ada-002', '3-small', '3-large']
        ),
        'chunk_size': trial.suggest_int('chunk_size', 128, 1024, step=128),
        'top_k': trial.suggest_int('top_k', 3, 15),
        'llm_model': trial.suggest_categorical(
            'llm_model',
            ['GPT-4o', 'GPT-4o-mini', 'Claude-3.5 Sonnet']
        ),
        'temperature': trial.suggest_float('temperature', 0.1, 0.9),
        'max_tokens': trial.suggest_int('max_tokens', 128, 1024, step=128)
    }
    
    # 평가 실행
    score = run_evaluation(config)
    
    return score

# Bayesian Optimization 실행
study = optuna.create_study(
    direction='maximize',
    sampler=TPESampler(seed=42)
)

study.optimize(
    objective,
    n_trials=50,           # 50회 평가
    timeout=3600 * 12,     # 12시간 제한
    callbacks=[
        # Early Stopping
        optuna.pruners.MedianPruner(n_startup_trials=10)
    ]
)

print(f"Best config: {study.best_params}")
print(f"Best score: {study.best_value}")
```

**장점:**
- 최소 평가 횟수로 최적해 탐색
- 파라미터 간 복잡한 상호작용 학습
- Early Stopping 지원

**단점:**
- 구현 복잡도 높음
- Python 백엔드 필수
- 소규모 데이터셋에는 오버킬

---

## 구현 로드맵

### Phase 1: Level 1 구현 (Week 1-2)

**Week 1: 백엔드 API**
- [ ] Root Cause Analysis API
- [ ] Smart Grid Search 로직
- [ ] Early Stopping 구현

**Week 2: 프론트엔드 통합**
- [ ] AutoImproveSetupPage 로직 연동
- [ ] AutoImproveProgressPage 실시간 업데이트
- [ ] AutoImproveResultsPage 개선 비교 차트

### Phase 2: Level 2 구현 (Week 3-6)

**Week 3-4: Sequential Greedy**
- [ ] 파라미터 의존성 그래프 정의
- [ ] 순차 최적화 엔진

**Week 5-6: 고급 기능**
- [ ] 파라미터 중요도 분석
- [ ] 민감도 분석 (Sensitivity Analysis)

### Phase 3: Level 3 구현 (Week 7-12)

**Week 7-9: Optuna 통합**
- [ ] Python 백엔드 Optuna 설정
- [ ] Hyperparameter 공간 정의
- [ ] 병렬 평가 ��원

**Week 10-12: 최적화 및 시각화**
- [ ] 최적화 히스토리 시각화
- [ ] 파라미터 중요도 플롯
- [ ] Optuna Dashboard 통합

---

## API 설계

### 1. Root Cause Analysis API

**Endpoint:** `POST /api/v1/auto-improve/analyze`

**Request:**
```json
{
  "evaluation_id": "eval-001",
  "target_metrics": ["context_recall", "faithfulness"]
}
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
        "scores": {
          "context_recall": 0.62,
          "context_precision": 0.75
        },
        "priority_params": ["top_k", "chunk_size"]
      },
      "generation": {
        "severity": "medium",
        "affected_metrics": ["faithfulness"],
        "scores": {
          "faithfulness": 0.68,
          "answer_relevancy": 0.80
        },
        "priority_params": ["temperature", "llm_model"]
      }
    },
    "recommended_strategy": "retrieval_first",
    "estimated_experiments": 12,
    "estimated_cost": 18.00,
    "estimated_duration_minutes": 180
  }
}
```

### 2. Generate Experiments API

**Endpoint:** `POST /api/v1/auto-improve/generate-experiments`

**Request:**
```json
{
  "base_evaluation_id": "eval-001",
  "strategy": "retrieval_first",
  "optimization_level": "rule_based",
  "budget": {
    "max_experiments": 20,
    "max_cost": 30.00,
    "max_duration_minutes": 300
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "job_id": "auto-improve-job-001",
    "experiments": [
      {
        "id": "exp-001",
        "name": "Baseline",
        "config": {
          "top_k": 5,
          "chunk_size": 512,
          "temperature": 0.7
        },
        "order": 1
      },
      {
        "id": "exp-002",
        "name": "Top-K=3",
        "config": {
          "top_k": 3,
          "chunk_size": 512,
          "temperature": 0.7
        },
        "order": 2
      }
    ],
    "total_experiments": 12,
    "estimated_cost": 18.00
  }
}
```

### 3. Start Auto-Improve Job API

**Endpoint:** `POST /api/v1/auto-improve/jobs`

**Request:**
```json
{
  "base_evaluation_id": "eval-001",
  "strategy": "retrieval_first",
  "optimization_level": "rule_based",
  "early_stopping": {
    "enabled": true,
    "min_improvement": 0.05,
    "patience": 3
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "job_id": "auto-improve-job-001",
    "status": "pending",
    "created_at": "2025-10-13T10:00:00Z",
    "websocket_url": "wss://api.rex.com/ws/auto-improve/auto-improve-job-001"
  }
}
```

### 4. Get Auto-Improve Results API

**Endpoint:** `GET /api/v1/auto-improve/jobs/{job_id}`

**Response:**
```json
{
  "success": true,
  "data": {
    "job_id": "auto-improve-job-001",
    "status": "completed",
    "experiments_completed": 12,
    "best_config": {
      "top_k": 5,
      "chunk_size": 512,
      "embedding_model": "text-embedding-3-large",
      "temperature": 0.3,
      "llm_model": "Claude-3.5 Sonnet"
    },
    "improvement": {
      "baseline_score": 0.72,
      "best_score": 0.89,
      "improvement_rate": 0.236
    },
    "detailed_results": [
      {
        "experiment_id": "exp-001",
        "config": { "top_k": 5 },
        "score": 0.72
      },
      {
        "experiment_id": "exp-002",
        "config": { "top_k": 3 },
        "score": 0.75
      }
    ]
  }
}
```

---

## 최종 추천

### 🎯 MVP (최소 기능 제품)
**→ Level 1: Rule-based Optimization**

**이유:**
1. ✅ 2주 내 구현 가능
2. ✅ 즉시 실용적인 결과 (15-25% 개선)
3. ✅ 낮은 비용 ($18-36)
4. ✅ 사용자 이해하기 쉬움

**구현 우선순위:**
1. Week 1: Root Cause Analysis + Smart Grid Search
2. Week 2: 프론트엔드 통합 + Early Stopping
3. Week 3-4: 성능 최적화 + 사용자 테스트

### 🚀 Long-term (장기 목표)
**→ Level 2: Sequential Greedy**

**이유:**
1. ✅ Level 1 대비 10-15% 추가 개선
2. ✅ 추가 4주 투자로 큰 효과
3. ✅ 여전히 이해 가능한 로직

### 🔬 Research (연구 프로젝트)
**→ Level 3: Bayesian Optimization**

**조건:**
- 대규모 사용자 베이스 (월 1000회 이상 평가)
- 전문 데이터 과학팀 보유
- 충분한 개발 리소스 (8주 이상)

---

## 다음 단계

1. **의사 결정:** Level 1, 2, 3 중 선택
2. **API 구현:** `/guidelines/API-Specification.md`에 추가
3. **프론트엔드 연동:** 기존 페이지와 통합
4. **테스트:** Mock 데이터로 워크플로우 검증

**질문이나 추가 설명이 필요하면 말씀해주세요!**
