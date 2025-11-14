# REX 프론트엔드 통합 가이드

## 개요
이 문서는 REX 프론트엔드에서 API 클라이언트와 상태 관리 스토어를 사용하는 방법을 설명합니다.

---

## 1. 환경 설정

### 1.1 환경 변수 설정
`.env.example` 파일을 `.env`로 복사하고 필요한 값을 설정합니다.

```bash
cp .env.example .env
```

```env
VITE_API_BASE_URL=https://api.rex.com/api/v1
VITE_USE_MOCK_DATA=true  # 개발 중에는 true, 프로덕션에서는 false
```

### 1.2 의존성 설치
```bash
npm install zustand
```

---

## 2. API 클라이언트 사용법

### 2.1 기본 사용법

```typescript
import { api } from '../lib/api-client';

// 데이터셋 목록 조회
const response = await api.datasets.list({ page: 1, limit: 20 });

if (response.success) {
  console.log(response.data.datasets);
} else {
  console.error(response.error);
}
```

### 2.2 인증
```typescript
import { authApi } from '../lib/api-client';

// 로그인
const loginResponse = await authApi.login('user@example.com', 'password');

if (loginResponse.success) {
  const token = loginResponse.data.token;
  
  // 토큰 설정 (이후 모든 API 호출에 자동으로 포함됨)
  authApi.setToken(token);
}

// 로그아웃
await authApi.logout();
authApi.clearToken();
```

### 2.3 평가 생성

```typescript
import { evaluationsApi } from '../lib/api-client';
import { CreateEvaluationRequest } from '../types';

const request: CreateEvaluationRequest = {
  name: '2025년 3분기 챗봇 평가',
  dataset_id: 'dataset-001',
  model_id: 'gpt-4o',
  vector_db_id: 'pinecone-1',
  metrics: [
    {
      name: 'faithfulness',
      is_enabled: true,
      weight: 1.0,
      threshold: 0.8,
    },
    {
      name: 'answer_relevancy',
      is_enabled: true,
      weight: 1.2,
      threshold: 0.75,
    },
  ],
  schedule_config: {
    max_iterations: 1,
    start_time: null,
  },
};

const response = await evaluationsApi.create(request);

if (response.success) {
  const evaluationId = response.data.id;
  const jobId = response.data.job_id;
  
  console.log('평가 시작:', evaluationId, jobId);
}
```

### 2.4 실시간 상태 조회 (Polling)

```typescript
import { evaluationsApi } from '../lib/api-client';

// Polling 함수
const pollEvaluationStatus = async (evaluationId: string) => {
  const interval = setInterval(async () => {
    const response = await evaluationsApi.getStatus(evaluationId);
    
    if (response.success) {
      const status = response.data;
      
      console.log(`진행률: ${status.progress}%`);
      console.log(`현재 작업: ${status.currentTask}`);
      
      // 완료되면 polling 중지
      if (status.status === 'completed' || status.status === 'failed') {
        clearInterval(interval);
      }
    }
  }, 3000); // 3초마다
};

pollEvaluationStatus('eval-001');
```

### 2.5 WebSocket 사용 (실시간 모니터링)

```typescript
import { EvaluationWebSocket } from '../lib/api-client';

const ws = new EvaluationWebSocket('eval-001', 'your-jwt-token');

ws.connect(
  (message) => {
    console.log('메시지 수신:', message);
    
    if (message.type === 'progress_update') {
      console.log(`진행률: ${message.data.progress}%`);
    }
  },
  (error) => {
    console.error('WebSocket 에러:', error);
  },
  () => {
    console.log('WebSocket 연결 종료');
  }
);

// 연결 해제
ws.disconnect();
```

---

## 3. 상태 관리 (Zustand) 사용법

### 3.1 Evaluation Store - 평가 설정 관리

**평가 모드:**
REX는 2가지 평가 모드를 지원합니다:
1. **연동된 시스템 평가 (External Evaluation):** 기존 RAG 시스템 API 연동
2. **신규 평가 (New Evaluation):** REX 내부 RAG 파이프라인 실험

**사용 예시:**

```typescript
import { useEvaluationStore } from '../stores/evaluation-store';

function NewEvaluationPage() {
  // Store에서 상태와 액션 가져오기
  const {
    selectedDatasetId,
    selectedModelId,
    selectedVectorDbId,
    evaluationName,
    selectedMetrics,
    setDataset,
    setModel,
    setVectorDb,
    setEvaluationName,
    toggleMetric,
    isConfigValid,
    getCurrentRequest,
    resetConfig,
  } = useEvaluationStore();

  // 데이터셋 선택
  const handleDatasetChange = (datasetId: string) => {
    setDataset(datasetId);
  };

  // 지표 활성화/비활성화
  const handleToggleMetric = (metricName: MetricName) => {
    toggleMetric(metricName);
  };

  // 평가 시작
  const handleStartEvaluation = async () => {
    if (!isConfigValid()) {
      alert('필수 항목을 모두 선택해주세요.');
      return;
    }

    const request = getCurrentRequest();
    if (request) {
      const response = await evaluationsApi.create(request);
      
      if (response.success) {
        // 성공 처리
        resetConfig(); // 설정 초기화
      }
    }
  };

  return (
    <div>
      <h1>신규 평가 생성</h1>
      
      {/* 데이터셋 선택 */}
      <select onChange={(e) => handleDatasetChange(e.target.value)}>
        <option value="">데이터셋 선택</option>
        {/* ... */}
      </select>

      {/* 지표 선택 */}
      {selectedMetrics.map((metric) => (
        <div key={metric.name}>
          <input
            type="checkbox"
            checked={metric.is_enabled}
            onChange={() => handleToggleMetric(metric.name)}
          />
          <label>{metric.name}</label>
        </div>
      ))}

      {/* 시작 버튼 */}
      <button onClick={handleStartEvaluation} disabled={!isConfigValid()}>
        평가 시작
      </button>
    </div>
  );
}
```

### 3.2 Selector 사용 (성능 최적화)

```typescript
import { 
  useSelectedDataset, 
  useEnabledMetrics, 
  useIsConfigValid 
} from '../stores/evaluation-store';

function EvaluationSummary() {
  // 필요한 상태만 선택적으로 구독
  const datasetId = useSelectedDataset();
  const enabledMetrics = useEnabledMetrics();
  const isValid = useIsConfigValid();

  return (
    <div>
      <p>선택된 데이터셋: {datasetId}</p>
      <p>활성화된 지표: {enabledMetrics.length}개</p>
      <p>설정 상태: {isValid ? '완료' : '미완료'}</p>
    </div>
  );
}
```

### 3.3 Monitor Store - 실시간 모니터링

```typescript
import { useMonitorStore } from '../stores/monitor-store';

function EvaluationMonitor() {
  const {
    activeEvaluations,
    addEvaluation,
    updateEvaluationStatus,
    connectWebSocket,
    disconnectWebSocket,
  } = useMonitorStore();

  // 평가 추가 및 WebSocket 연결
  const startMonitoring = (evaluationId: string, name: string) => {
    // Store에 평가 추가
    addEvaluation({
      id: evaluationId,
      name,
      status: 'running',
      progress: 0,
      startedAt: new Date().toISOString(),
    });

    // WebSocket 연결 (실시간 업데이트 수신)
    connectWebSocket(evaluationId, 'your-jwt-token');
  };

  // Polling 방식 사용 (WebSocket 대신)
  const startPollingMonitoring = (evaluationId: string, name: string) => {
    addEvaluation({
      id: evaluationId,
      name,
      status: 'running',
      progress: 0,
      startedAt: new Date().toISOString(),
    });

    // 3초마다 상태 조회
    const interval = setInterval(async () => {
      const response = await evaluationsApi.getStatus(evaluationId);
      
      if (response.success) {
        updateEvaluationStatus(evaluationId, response.data);
        
        if (response.data.status === 'completed' || response.data.status === 'failed') {
          clearInterval(interval);
        }
      }
    }, 3000);
  };

  // 연결 해제
  const stopMonitoring = (evaluationId: string) => {
    disconnectWebSocket(evaluationId);
  };

  return (
    <div>
      <h2>실시간 평가 모니터링</h2>
      {activeEvaluations.map((evaluation) => (
        <div key={evaluation.id}>
          <h3>{evaluation.name}</h3>
          <p>상태: {evaluation.status}</p>
          <p>진행률: {evaluation.progress}%</p>
          <p>현재 작업: {evaluation.currentTask}</p>
          <button onClick={() => stopMonitoring(evaluation.id)}>중단</button>
        </div>
      ))}
    </div>
  );
}
```

### 3.4 실시간 로그 표시

```typescript
import { useRealtimeLogs } from '../stores/monitor-store';

function RealtimeLogs({ evaluationId }: { evaluationId: string }) {
  const logs = useRealtimeLogs(evaluationId);

  return (
    <div className="logs-container">
      <h3>실시간 로그</h3>
      {logs.map((log, index) => (
        <div key={index} className="log-entry">
          <span className="timestamp">{log.timestamp}</span>
          <span className="message">{log.message}</span>
        </div>
      ))}
    </div>
  );
}
```

---

## 4. 실전 예제 - 평가 생성부터 결과 조회까지

### 4.1 전체 플로우 구현

```typescript
import { useState } from 'react';
import { useEvaluationStore } from '../stores/evaluation-store';
import { useMonitorStore } from '../stores/monitor-store';
import { api } from '../lib/api-client';

function EvaluationFlow() {
  const [currentStep, setCurrentStep] = useState<'config' | 'monitor' | 'result'>('config');
  const [evaluationId, setEvaluationId] = useState<string | null>(null);

  // Evaluation Store
  const { getCurrentRequest, isConfigValid, resetConfig } = useEvaluationStore();

  // Monitor Store
  const { addEvaluation, updateEvaluationStatus } = useMonitorStore();

  // Step 1: 평가 생성
  const handleCreateEvaluation = async () => {
    if (!isConfigValid()) {
      alert('필수 항목을 선택해주세요.');
      return;
    }

    const request = getCurrentRequest();
    if (!request) return;

    const response = await api.evaluations.create(request);

    if (response.success) {
      const id = response.data.id;
      setEvaluationId(id);

      // Monitor Store에 추가
      addEvaluation({
        id,
        name: request.name,
        status: 'running',
        progress: 0,
        startedAt: new Date().toISOString(),
      });

      // 모니터링 화면으로 이동
      setCurrentStep('monitor');

      // Polling 시작
      startPolling(id);
    }
  };

  // Step 2: 실시간 모니터링 (Polling)
  const startPolling = (id: string) => {
    const interval = setInterval(async () => {
      const response = await api.evaluations.getStatus(id);

      if (response.success) {
        updateEvaluationStatus(id, response.data);

        // 완료되면 결과 화면으로 이동
        if (response.data.status === 'completed') {
          clearInterval(interval);
          setCurrentStep('result');
        }
      }
    }, 3000);
  };

  // Step 3: 결과 조회
  const [result, setResult] = useState(null);

  const loadResult = async () => {
    if (!evaluationId) return;

    const response = await api.results.get(evaluationId);

    if (response.success) {
      setResult(response.data);
    }
  };

  // 결과 화면 진입 시 데이터 로드
  if (currentStep === 'result' && evaluationId && !result) {
    loadResult();
  }

  return (
    <div>
      {currentStep === 'config' && (
        <div>
          <h2>Step 1: 평가 설정</h2>
          {/* 설정 UI */}
          <button onClick={handleCreateEvaluation}>평가 시작</button>
        </div>
      )}

      {currentStep === 'monitor' && (
        <div>
          <h2>Step 2: 실시간 모니터링</h2>
          {/* 모니터링 UI */}
        </div>
      )}

      {currentStep === 'result' && (
        <div>
          <h2>Step 3: 결과 확인</h2>
          {result && (
            <div>
              <h3>종합 점수: {result.overallScore}</h3>
              {/* 결과 상세 표시 */}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## 5. 에러 처리

### 5.1 API 에러 처리

```typescript
const response = await api.datasets.list();

if (!response.success) {
  switch (response.error.code) {
    case 'UNAUTHORIZED':
      // 로그인 페이지로 리다이렉트
      break;
    case 'DATASET_NOT_FOUND':
      // 데이터셋을 찾을 수 없음
      alert(response.error.message);
      break;
    default:
      // 일반 에러
      console.error(response.error);
  }
}
```

### 5.2 네트워크 에러 처리

```typescript
try {
  const response = await api.evaluations.create(request);
  // ...
} catch (error) {
  if (error.code === 'NETWORK_ERROR') {
    alert('네트워크 연결을 확인해주세요.');
  }
}
```

---

## 6. 성능 최적화

### 6.1 Selector 사용으로 불필요한 리렌더링 방지

```typescript
// ❌ 나쁜 예: 전체 store 구독
const store = useEvaluationStore();

// ✅ 좋은 예: 필요한 데이터만 구독
const datasetId = useSelectedDataset();
const isValid = useIsConfigValid();
```

### 6.2 Polling 최적화

```typescript
// Polling 주기를 상황에 맞게 조정
const POLLING_INTERVALS = {
  starting: 1000,   // 시작 단계: 1초
  running: 3000,    // 실행 중: 3초
  finishing: 1000,  // 거의 완료: 1초
};

const getPollingInterval = (progress: number) => {
  if (progress < 10) return POLLING_INTERVALS.starting;
  if (progress > 90) return POLLING_INTERVALS.finishing;
  return POLLING_INTERVALS.running;
};
```

---

## 7. 디버깅

### 7.1 Zustand DevTools

브라우저 개발자 도구에서 Redux DevTools를 사용하여 상태 변화를 추적할 수 있습니다.

```typescript
// Store에 이미 devtools 미들웨어가 적용되어 있음
export const useEvaluationStore = create<EvaluationStore>()(
  devtools(
    // ...
  )
);
```

### 7.2 API 디버그 모드

```typescript
// .env 파일에서 설정
VITE_DEBUG=true

// 또는 코드에서 직접 로그 추가
console.log('API Request:', request);
console.log('API Response:', response);
```

---

## 8. Mock Data vs Real API

### 8.1 개발 중 Mock Data 사용

`.env` 파일에서 설정:
```env
VITE_USE_MOCK_DATA=true
```

### 8.2 프로덕션에서 Real API 사용

```env
VITE_USE_MOCK_DATA=false
VITE_API_BASE_URL=https://api.rex.com/api/v1
```

### 8.3 Mock Data 검증

```typescript
import { useMockData } from '../lib/api-client';

if (useMockData()) {
  console.warn('⚠️ Mock 데이터를 사용 중입니다.');
}
```

---

## 9. 타입 안전성

모든 API 호출과 상태 관리는 TypeScript로 타입이 정의되어 있어 컴파일 시점에 에러를 방지할 수 있습니다.

```typescript
// ✅ 타입 체크 통과
const request: CreateEvaluationRequest = {
  name: '평가',
  dataset_id: 'dataset-001',
  model_id: 'gpt-4o',
  vector_db_id: 'pinecone-1',
  metrics: [
    { name: 'faithfulness', is_enabled: true }
  ],
  schedule_config: { max_iterations: 1, start_time: null }
};

// ❌ 타입 에러 발생
const invalidRequest = {
  name: '평가',
  // dataset_id 누락
};
```

---

## 10. 추가 참고 자료

- **API 명세서:** `/guidelines/API-Specification.md`
- **타입 정의:** `/types/index.ts`
- **Mock 데이터:** `/lib/mock-data.ts`
- **환경 설정 예시:** `/.env.example`

---

