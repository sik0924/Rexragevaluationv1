# 백엔드 연동 완료 가이드

## 🎯 개요
프론트엔드가 100% 완성되었으므로, 이제 백엔드 API와 연동하여 실제 데이터를 주고받을 수 있습니다. 이 가이드는 백엔드 개발자가 어떤 API를 구현해야 하는지, 프론트엔드는 어떻게 API를 호출하는지 정리합니다.

## 📋 목차
1. [API 클라이언트 구조](#api-클라이언트-구조)
2. [LLM Judge 비용 절감 API](#llm-judge-비용-절감-api)
3. [프론트엔드 API 호출 방법](#프론트엔드-api-호출-방법)
4. [Mock 모드 전환](#mock-모드-전환)
5. [백엔드 체크리스트](#백엔드-체크리스트)

---

## 1. API 클라이언트 구조

### 파일 위치
- `/lib/api-client.ts`

### 구조
```typescript
// 통합 API 객체
export const api = {
  auth: authApi,           // 인증
  datasets: datasetsApi,   // 데이터셋 관리
  evaluations: evaluationsApi, // 평가 실행
  results: resultsApi,     // 결과 조회
  resources: resourcesApi, // 리소스 관리
  autoImprove: autoImproveApi, // 자동 개선
  admin: adminApi,         // 관리자 기능
  cost: costApi,           // 비용 관리
  budget: budgetApi,       // 예산 관리
  diagnosis: diagnosisApi  // ✨ 새로 추가된 진단 API
};
```

### 환경 변수 설정
`.env` 파일에 다음을 추가:
```env
VITE_API_BASE_URL=https://api.rex.com/api/v1
VITE_USE_MOCK_DATA=false  # true: Mock 데이터 사용, false: 실제 API 호출
```

---

## 2. LLM Judge 비용 절감 API

### 2.1 새 평가 생성 API

**엔드포인트:** `POST /api/v1/evaluations`

**Request Body:**
```typescript
{
  dataset_id: string;
  llm_model_id: string;
  vector_db_id: string;
  metrics: string[];
  rag_config: {
    system_prompt: string;
    top_k: number;
    chunk_size: number;
    chunk_overlap: number;
    retriever_type: 'semantic' | 'hybrid' | 'keyword';
    similarity_threshold: number;
  };
  // 🌟 LLM Judge 샘플링 설정 (새로 추가)
  llm_judge_config: {
    enabled: boolean;
    mode?: 'auto' | 'fixed_ratio' | 'max_cases';
    fixed_ratio?: number;  // mode='fixed_ratio'일 때
    max_cases?: number;    // mode='max_cases'일 때
    enable_heuristics?: boolean;
    heuristic_config?: {
      score_threshold: number;
      context_recall_threshold: number;
      min_context_tokens: number;
    };
  };
  schedule?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    start_date?: string;
  };
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "eval-123",
    "job_id": "job-456",
    "status": "running",
    "created_at": "2025-10-16T10:00:00Z",
    "message": "평가가 시작되었습니다"
  }
}
```

### 2.2 진단 요약 조회 API

**엔드포인트:** `GET /api/v1/results/{evaluation_id}/diagnosis/summary`

**Response:**
```json
{
  "success": true,
  "data": {
    "total_failed_cases": 3,
    "heuristic_classified": 1,
    "llm_judge_analyzed": 2,
    "not_analyzed": 0,
    "total_cost": 0.07,
    "cost_saved": 0.28,
    "cost_saved_percentage": 80,
    "breakdown": {
      "heuristic_reasons": [
        {
          "reason": "Context Recall < 0.1",
          "count": 1,
          "percentage": 33.3
        }
      ],
      "llm_judge_distribution": {
        "retrieval": 1,
        "generation": 1,
        "other": 0
      }
    }
  }
}
```

### 2.3 진단된 실패 케이스 조회 API

**엔드포인트:** `GET /api/v1/results/{evaluation_id}/diagnosis/cases`

**Query Parameters:**
- `diagnosis_method` (optional): `'LLM Judge'` | `'Heuristic'` | `'Not Analyzed'`
- `root_cause` (optional): `'retrieval'` | `'generation'`
- `heuristic_reason` (optional): 필터링할 휴리스틱 이유

**Response:**
```json
{
  "success": true,
  "data": {
    "cases": [
      {
        "id": "case-1",
        "question": "데이터셋은 어떤 형식을 지원하나요?",
        "expectedAnswer": "csv, json, jsonl, txt, yaml을 지원합니다.",
        "generatedAnswer": "CSV와 JSON 형식을 지원합니다.",
        "score": 0.75,
        "reason": "Answer Correctness: 75 (jsonl, txt, yaml 형식 누락)",
        "diagnosis_method": "LLM Judge",
        "sampled": true,
        "llm_analysis": {
          "root_cause": "retrieval",
          "reason": "핵심 정보가 포함된 문서가 검색되지 않음",
          "suggestion": "임베딩 모델을 text-embedding-3-large로 업그레이드하십시오"
        }
      },
      {
        "id": "case-2",
        "question": "...",
        "diagnosis_method": "Heuristic",
        "sampled": false,
        "heuristic_reason": "Context Recall < 0.1",
        "context_tokens": 45
      }
    ],
    "total": 3
  }
}
```

### 2.4 진단 파이프라인 실행 API

**엔드포인트:** `POST /api/v1/diagnosis/{evaluation_id}/run`

**Request Body:**
```json
{
  "mode": "auto",
  "fixed_ratio": 20,
  "max_cases": 100,
  "enable_heuristics": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "evaluation_id": "eval-123",
    "status": "completed",
    "processed_cases": 150,
    "heuristic_classified": 120,
    "llm_judge_analyzed": 30,
    "total_cost": 0.45,
    "message": "진단이 완료되었습니다"
  }
}
```

### 2.5 진단 비용 예측 API

**엔드포인트:** `POST /api/v1/diagnosis/{evaluation_id}/estimate`

**Request Body:**
```json
{
  "mode": "fixed_ratio",
  "fixed_ratio": 20
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_failed_cases": 150,
    "estimated_heuristic": 120,
    "estimated_llm_judge": 30,
    "estimated_cost": 0.45,
    "cost_without_filtering": 2.25,
    "cost_saved": 1.80,
    "cost_saved_percentage": 80
  }
}
```

---

## 3. 프론트엔드 API 호출 방법

### 3.1 새 평가 시작 시 (NewEvaluationPageBlue.tsx)

```typescript
import { api } from '../lib/api-client';

const handleStartEvaluation = async () => {
  // ... 유효성 검사 ...

  const evaluationRequest = {
    dataset_id: selectedDataset,
    llm_model_id: selectedModel,
    vector_db_id: selectedVectorDB,
    metrics: selectedMetrics,
    rag_config: {
      system_prompt: ragSystemPrompt,
      top_k: topK[0],
      chunk_size: parseInt(chunkSize),
      chunk_overlap: chunkOverlap[0],
      retriever_type: retrieverType,
      similarity_threshold: similarityThreshold[0]
    },
    llm_judge_config: llmJudgeSamplingEnabled ? {
      enabled: true,
      mode: llmJudgeSamplingMode,
      ...(llmJudgeSamplingMode === 'fixed_ratio' && { 
        fixed_ratio: llmJudgeFixedRatio 
      }),
      ...(llmJudgeSamplingMode === 'max_cases' && { 
        max_cases: llmJudgeMaxCases 
      }),
      enable_heuristics: llmJudgeEnableHeuristics,
      heuristic_config: {
        score_threshold: llmJudgeScoreThreshold,
        context_recall_threshold: llmJudgeContextThreshold,
        min_context_tokens: llmJudgeMinTokens
      }
    } : {
      enabled: false
    }
  };

  // 🌟 실제 API 호출 (현재는 주석 처리되어 있음)
  const response = await api.evaluations.create(evaluationRequest);
  
  if (response.success) {
    toast.success(`평가가 시작되었습니다! (ID: ${response.data.id})`);
    onStartEvaluation();
  } else {
    toast.error(`평가 시작 실패: ${response.error?.message}`);
  }
};
```

**현재 상태:** 206-272줄에 이미 구현되어 있으나, 실제 API 호출 부분(253-260줄)이 주석 처리됨

**활성화 방법:**
1. 백엔드 API 준비 완료 확인
2. `/components/NewEvaluationPageBlue.tsx` 253-260줄 주석 해제
3. 262-264줄 Mock 코드 제거

### 3.2 진단 요약 조회 (ResultsPageBlue.tsx)

**방법 1: useEffect로 자동 로드**
```typescript
import { api } from '../lib/api-client';
import { useState, useEffect } from 'react';
import { DiagnosisSummary } from '../types';

const [diagnosisSummary, setDiagnosisSummary] = useState<DiagnosisSummary | undefined>();

useEffect(() => {
  const loadDiagnosisSummary = async () => {
    const response = await api.results.getDiagnosisSummary(selectedEvalId);
    
    if (response.success) {
      setDiagnosisSummary(response.data);
    } else {
      console.error('진단 요약 로드 실패:', response.error);
    }
  };

  if (selectedEvalId) {
    loadDiagnosisSummary();
  }
}, [selectedEvalId]);

// 컴포넌트 렌더링
<DiagnosisSummaryCard summary={diagnosisSummary} />
```

**방법 2: Mock 데이터에서 가져오기 (현재 구현)**
```typescript
const latestEvaluation = mockEvaluations.find(e => e.id === selectedEvalId);
<DiagnosisSummaryCard summary={latestEvaluation?.diagnosisSummary} />
```

### 3.3 진단 파이프라인 수동 실행

```typescript
import { api } from '../lib/api-client';
import { toast } from 'sonner@2.0.3';

const handleRunDiagnosis = async () => {
  toast.loading('진단을 실행하는 중...', { id: 'diagnosis' });
  
  const response = await api.diagnosis.runDiagnosisPipeline(evaluationId, {
    mode: 'auto',
    enable_heuristics: true
  });
  
  if (response.success) {
    toast.success(
      `진단 완료! 비용: $${response.data.total_cost}`, 
      { id: 'diagnosis' }
    );
  } else {
    toast.error(`진단 실패: ${response.error?.message}`, { id: 'diagnosis' });
  }
};
```

### 3.4 비용 예측

```typescript
import { api } from '../lib/api-client';

const handleEstimateCost = async () => {
  const response = await api.diagnosis.estimateCost(evaluationId, {
    mode: 'fixed_ratio',
    fixed_ratio: 20
  });
  
  if (response.success) {
    console.log('예상 비용:', response.data.estimated_cost);
    console.log('비용 절감:', response.data.cost_saved_percentage + '%');
  }
};
```

---

## 4. Mock 모드 전환

### 4.1 Mock 모드 활성화 (현재 상태)
`.env` 파일:
```env
VITE_USE_MOCK_DATA=true
```

이 경우:
- 모든 API 호출이 실제로 발생하지 않음
- `/lib/mock-data.ts`의 데이터를 사용
- 백엔드 없이 프론트엔드 개발 가능

### 4.2 실제 API 모드 활성화
`.env` 파일:
```env
VITE_API_BASE_URL=https://api.rex.com/api/v1
VITE_USE_MOCK_DATA=false
```

이 경우:
- 모든 API 호출이 실제 백엔드로 전달됨
- `api-client.ts`의 함수가 실제 HTTP 요청을 생성

### 4.3 하이브리드 모드 (권장)
```typescript
// 특정 API만 실제로 호출하고 싶을 때
import { useMockData } from '../lib/api-client';

const handleLoadData = async () => {
  if (useMockData()) {
    // Mock 데이터 사용
    setData(mockEvaluations);
  } else {
    // 실제 API 호출
    const response = await api.evaluations.getHistory();
    if (response.success) {
      setData(response.data.evaluations);
    }
  }
};
```

---

## 5. 백엔드 체크리스트

### 5.1 필수 구현 API

#### 평가 관련
- ✅ `POST /api/v1/evaluations` - 평가 생성 및 시작
- ✅ `GET /api/v1/evaluations/history` - 평가 이력 조회
- ✅ `GET /api/v1/evaluations/{id}/status` - 실시간 상태 조회
- ✅ `POST /api/v1/evaluations/{id}/stop` - 평가 중단

#### 결과 관련
- ✅ `GET /api/v1/results/{id}` - 결과 보고서 조회
- ✅ `GET /api/v1/results/{id}/failed-cases` - 실패 케이스 조회
- ✅ `GET /api/v1/results/{id}/metrics/{metric_name}` - 지표별 상세 분석
- 🌟 `GET /api/v1/results/{id}/diagnosis/summary` - **진단 요약 조회** (새로 추가)
- 🌟 `GET /api/v1/results/{id}/diagnosis/cases` - **진단된 케이스 조회** (새로 추가)

#### 진단 관련 (새로 추가)
- 🌟 `POST /api/v1/diagnosis/{id}/run` - 진단 파이프라인 실행
- 🌟 `GET /api/v1/diagnosis/{id}/status` - 진단 진행 상태
- 🌟 `POST /api/v1/diagnosis/{id}/estimate` - 비용 예측

#### 자동 개선 관련
- ✅ `POST /api/v1/auto-improve/analyze` - 근본 원인 분석
- ✅ `POST /api/v1/auto-improve/generate-experiments` - 실험 조합 생성
- ✅ `POST /api/v1/auto-improve/jobs` - 자동 개선 작업 시작
- ✅ `GET /api/v1/auto-improve/jobs/{id}` - 작업 조회
- ✅ `GET /api/v1/auto-improve/jobs/{id}/status` - 진행 상태

#### 비용 관련
- ✅ `GET /api/v1/costs/summary` - 비용 요약
- ✅ `GET /api/v1/costs/evaluations/{id}` - 평가별 비용
- ✅ `POST /api/v1/costs/predict` - 비용 예측
- ✅ `GET /api/v1/costs/optimize` - 최적화 제안

#### 리소스 관련
- ✅ `GET /api/v1/models` - LLM 모델 목록
- ✅ `GET /api/v1/vector-dbs` - Vector DB 목록
- ✅ `GET /api/v1/metrics` - 평가 지표 목록

### 5.2 데이터베이스 스키마 업데이트

#### failed_cases 테이블
```sql
ALTER TABLE failed_cases 
ADD COLUMN diagnosis_method VARCHAR(20) DEFAULT 'Not Analyzed';

ALTER TABLE failed_cases 
ADD COLUMN sampled BOOLEAN DEFAULT FALSE;

ALTER TABLE failed_cases 
ADD COLUMN heuristic_reason VARCHAR(100);

ALTER TABLE failed_cases 
ADD COLUMN context_tokens INTEGER;

CREATE INDEX idx_diagnosis_method ON failed_cases(diagnosis_method);
CREATE INDEX idx_sampled ON failed_cases(sampled);
```

#### evaluations 테이블
```sql
ALTER TABLE evaluations 
ADD COLUMN llm_judge_config JSONB;

ALTER TABLE evaluations 
ADD COLUMN diagnosis_summary JSONB;
```

### 5.3 백엔드 구현 우선순위

**1단계: 기본 평가 실행** (이미 완료된 것으로 가정)
- 평가 생성 및 실행
- 실시간 상태 업데이트
- 결과 저장

**2단계: LLM Judge 비용 절감** (백엔드 구현 필요)
- [ ] `llm_judge_config` 파싱 및 저장
- [ ] 휴리스틱 필터링 파이프라인
- [ ] 샘플링 로직 (auto/fixed_ratio/max_cases)
- [ ] LLM Judge 호출 (GPT-4로 근본 원인 분석)
- [ ] 진단 결과 저장 (`diagnosis_method`, `heuristic_reason` 등)
- [ ] 진단 요약 API 구현
- [ ] 비용 추적 및 저장

**3단계: 자동 개선 시스템** (선택 사항)
- [ ] 근본 원인 분석 알고리즘
- [ ] 실험 조합 생성
- [ ] 자동 개선 작업 실행
- [ ] 최적 설정 자동 발견

### 5.4 백엔드 참고 문서
- `/guidelines/LLM-Judge-Cost-Optimization-Backend.md` - 비용 절감 백엔드 구현 상세 가이드
- `/guidelines/API-Specification.md` - 전체 API 명세
- `/guidelines/Auto-Improve-Algorithm-Specification.md` - 자동 개선 알고리즘
- `/types/index.ts` - TypeScript 타입 정의 (백엔드 응답 구조 참고)

---

## 6. 테스트 방법

### 6.1 Mock 모드로 프론트엔드 테스트
```bash
# .env 설정
VITE_USE_MOCK_DATA=true

# 앱 실행
npm run dev

# 테스트 시나리오:
1. 새 평가 만들기 → LLM Judge 샘플링 활성화 → 평가 시작
2. 평가 결과 페이지 → "2025년 3분기 챗봇 평가" 선택
3. 스크롤 다운 → "실패 케이스 진단 요약" 카드 확인
4. 비용 절감 효과 확인 (90% 이상)
```

### 6.2 실제 API 연동 테스트
```bash
# .env 설정
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_USE_MOCK_DATA=false

# 백엔드 서버 실행 (별도 터미널)
cd backend
python main.py  # 또는 npm start

# 프론트엔드 실행
npm run dev

# API 호출 확인:
1. 브라우저 개발자 도구 → Network 탭
2. 평가 시작 버튼 클릭
3. POST /api/v1/evaluations 요청 확인
4. llm_judge_config가 요청 body에 포함되었는지 확인
```

### 6.3 API 응답 검증
```bash
# cURL로 직접 테스트
curl -X POST http://localhost:8000/api/v1/evaluations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "dataset_id": "1",
    "llm_model_id": "gpt-4o",
    "vector_db_id": "pinecone-1",
    "metrics": ["faithfulness", "answer_relevancy"],
    "rag_config": { ... },
    "llm_judge_config": {
      "enabled": true,
      "mode": "auto",
      "enable_heuristics": true
    }
  }'
```

---

## 7. 자주 묻는 질문 (FAQ)

### Q1: 프론트엔드만 먼저 테스트하고 싶어요
**A:** `.env`에서 `VITE_USE_MOCK_DATA=true`로 설정하면 백엔드 없이 테스트 가능합니다.

### Q2: 특정 API만 실제로 호출하고 싶어요
**A:** 각 컴포넌트에서 `useMockData()`로 조건부 분기:
```typescript
if (useMockData()) {
  setData(mockData);
} else {
  const res = await api.xxx.xxx();
  setData(res.data);
}
```

### Q3: 백엔드가 준비되면 어떤 파일을 수정해야 하나요?
**A:** 
1. `.env` 파일: `VITE_USE_MOCK_DATA=false` 설정
2. `/components/NewEvaluationPageBlue.tsx` 253-264줄: 주석 해제 및 Mock 코드 제거
3. `/components/ResultsPageBlue.tsx`: useEffect로 API 호출 추가 (위 3.2 참고)

### Q4: 진단 요약이 표시되지 않아요
**A:** 
- Mock 모드: `/lib/mock-data.ts`의 `mockEvaluations[1]` (id='1')에 `diagnosisSummary`가 있는지 확인
- 실제 API: `GET /api/v1/results/{id}/diagnosis/summary` 응답 확인

### Q5: 백엔드 구현 순서는?
**A:**
1. 기본 평가 API (이미 완료 가정)
2. `llm_judge_config` 저장 및 파싱
3. 휴리스틱 필터링 구현
4. LLM Judge 호출 구현
5. 진단 요약 API 구현

---

## 8. 요약

### ✅ 프론트엔드 완료 사항
- LLM Judge 샘플링 UI (NewEvaluationPageBlue.tsx)
- 진단 요약 카드 (DiagnosisSummaryCard.tsx)
- API 클라이언트 함수 (api-client.ts)
- TypeScript 타입 정의 (types/index.ts)
- Mock 데이터 (mock-data.ts)

### 🔧 백엔드 구현 필요 사항
- 진단 파이프라인 (휴리스틱 + 샘플링 + LLM Judge)
- 진단 요약 API (`GET /results/{id}/diagnosis/summary`)
- 진단 케이스 API (`GET /results/{id}/diagnosis/cases`)
- 비용 예측 API (`POST /diagnosis/{id}/estimate`)

### 🚀 다음 단계
1. 백엔드 개발자에게 이 가이드 공유
2. `/guidelines/LLM-Judge-Cost-Optimization-Backend.md` 참고하여 백엔드 구현
3. 백엔드 준비 완료 후 프론트엔드 주석 해제
4. 통합 테스트

---

## 📞 문의
백엔드 연동 중 문제가 발생하면:
1. 브라우저 개발자 도구 → Console/Network 탭 확인
2. API 응답 구조가 TypeScript 타입과 일치하는지 확인
3. `/types/index.ts`의 타입 정의 참고

**프론트엔드는 100% 준비 완료!** 백엔드만 구현하면 바로 연동 가능합니다. 🎉
