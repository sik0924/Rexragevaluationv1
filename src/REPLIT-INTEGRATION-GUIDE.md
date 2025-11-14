# REX UI - Replit 프로젝트 통합 가이드

## 📋 개요
이 문서는 Figma Make에서 개발된 REX UI를 Replit 프로젝트에 통합하는 방법을 안내합니다.

---

## 🎯 통합 전 체크리스트

### 1. Replit 프로젝트 환경 확인
- [ ] React + TypeScript 프로젝트
- [ ] Vite 또는 Create React App 사용 여부
- [ ] 기존 라우팅 구조 (React Router 등)
- [ ] 상태 관리 라이브러리 (Redux, Zustand 등)

### 2. 현재 UI 스펙
- **프레임워크**: React 18 + TypeScript
- **스타일링**: Tailwind CSS v4.0
- **UI 라이브러리**: shadcn/ui
- **폰트**: Pretendard (한국어 최적화)
- **아이콘**: lucide-react
- **차트**: recharts
- **토스트**: sonner

---

## 📦 1단계: 필수 패키지 설치

### package.json에 추가할 의존성

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "latest",
    "recharts": "^2.12.0",
    "sonner": "^2.0.3",
    "zustand": "^4.5.0",
    "react-hook-form": "^7.55.0",
    "@radix-ui/react-accordion": "latest",
    "@radix-ui/react-alert-dialog": "latest",
    "@radix-ui/react-avatar": "latest",
    "@radix-ui/react-checkbox": "latest",
    "@radix-ui/react-collapsible": "latest",
    "@radix-ui/react-dialog": "latest",
    "@radix-ui/react-dropdown-menu": "latest",
    "@radix-ui/react-label": "latest",
    "@radix-ui/react-popover": "latest",
    "@radix-ui/react-progress": "latest",
    "@radix-ui/react-radio-group": "latest",
    "@radix-ui/react-select": "latest",
    "@radix-ui/react-separator": "latest",
    "@radix-ui/react-slider": "latest",
    "@radix-ui/react-switch": "latest",
    "@radix-ui/react-tabs": "latest",
    "@radix-ui/react-tooltip": "latest"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.3.0",
    "tailwindcss": "^4.0.0"
  }
}
```

### 설치 명령어
```bash
npm install
# 또는
yarn install
```

---

## 🎨 2단계: Tailwind CSS v4.0 설정

### 1) `styles/globals.css` 복사
현재 프로젝트의 `/styles/globals.css` 파일 전체를 Replit 프로젝트에 복사합니다.

**중요 포인트:**
- Pretendard 폰트 CDN 로드
- Tailwind v4.0 사용 (별도 config 파일 불필요)
- 커스텀 CSS 변수로 디자인 토큰 정의
- Blue/Gray/Amber 3색 체계

### 2) `index.html` 또는 메인 엔트리에 CSS 임포트
```tsx
import './styles/globals.css'
```

---

## 🧩 3단계: shadcn/ui 컴포넌트 복사

### 복사할 디렉토리
```
/components/ui/  → Replit 프로젝트의 /src/components/ui/
```

### 포함된 컴포넌트 (40개)
- accordion.tsx
- alert-dialog.tsx
- alert.tsx
- avatar.tsx
- badge.tsx
- breadcrumb.tsx
- button.tsx
- card.tsx
- checkbox.tsx
- dialog.tsx
- dropdown-menu.tsx
- input.tsx
- label.tsx
- progress.tsx
- select.tsx
- separator.tsx
- slider.tsx
- switch.tsx
- table.tsx
- tabs.tsx
- tooltip.tsx
- ... (전체 목록은 /components/ui 참조)

**주의:** 
- `ImageWithFallback.tsx`는 시스템 보호 파일이므로 그대로 사용
- 경로는 프로젝트 구조에 맞게 조정

---

## 📁 4단계: 페이지 컴포넌트 통합

### 복사할 주요 컴포넌트

#### 1) 레이아웃
```
/components/AppLayout.tsx       → 전체 앱 레이아웃 (사이드바, 헤더, 브레드크럼)
/components/LoginPage.tsx       → 로그인 페이지
```

#### 2) 핵심 페이지 (11개)
```
/components/DashboardPageBlue.tsx              → 대시보드
/components/DatasetsPageBlue.tsx               → 데이터셋 관리
/components/EvaluationModeSelectionPage.tsx    → 평가 모드 선택
/components/ExternalEvaluationPageBlue.tsx     → External 모드(연동 평가)
/components/NewEvaluationPageBlue.tsx          → Internal 모드(신규 평가)
/components/MonitoringPageBlue.tsx             → 평가 모니터링
/components/EvaluationMonitorPageBlue.tsx      → 실시간 평가 진행
/components/ResultsPageBlue.tsx                → 평가 결과 상세
/components/EvaluationHistoryPageBlue.tsx      → 평가 이력
/components/ComparisonPageBlue.tsx             → 평가 비교
/components/AdminPageBlue.tsx                  → 관리자 설정
```

#### 3) 자동 개선 기능 (3개)
```
/components/AutoImproveSetupPageBlue.tsx       → 자동 개선 설정
/components/AutoImproveProgressPageBlue.tsx    → 자동 개선 진행
/components/AutoImproveResultsPageBlue.tsx     → 자동 개선 결과
```

#### 4) 비용 관리 기능 (3개)
```
/components/CostDashboardPageBlue.tsx          → 비용 대시보드
/components/BudgetSettingsPageBlue.tsx         → 예산 설정
/components/CostAlertsPageBlue.tsx             → 비용 알림
```

#### 5) 기타 페이지
```
/components/LogViewerPageBlue.tsx              → 로그 뷰어
```

#### 6) 공통 컴포넌트
```
/components/DiagnosisSummaryCard.tsx           → 진단 요약 카드
/components/LLMJudgeAnalysisCard.tsx           → LLM Judge 분석 카드
```

---

## 🔧 5단계: 타입 정의 및 유틸리티

### 1) 타입 정의
```
/types/index.ts  → Replit 프로젝트의 /src/types/index.ts
```

**포함 내용:**
- 평가 관련 타입 (EvaluationConfig, EvaluationResult 등)
- 데이터셋 타입 (Dataset, QAPair 등)
- LLM Judge 타입
- 비용 추적 타입
- 자동 개선 타입

### 2) Mock 데이터 (개발용)
```
/lib/mock-data.ts  → 임시 데이터 (실제 API 연동 전)
```

### 3) 유틸리티 함수
```
/lib/score-analysis.ts  → 점수 분석 알고리즘
/lib/api-client.ts      → API 클라이언트 (백엔드 연동용)
```

### 4) 상태 관리 (Zustand)
```
/stores/evaluation-store.ts  → 평가 상태 관리
/stores/monitor-store.ts     → 모니터링 상태 관리
```

---

## 🔌 6단계: 백엔드 API 연동

### API Client 설정 (`/lib/api-client.ts`)

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const apiClient = {
  // 평가 관련
  createEvaluation: (data: CreateEvaluationRequest) => 
    fetch(`${API_BASE_URL}/api/evaluations`, { method: 'POST', body: JSON.stringify(data) }),
  
  getEvaluationStatus: (id: string) => 
    fetch(`${API_BASE_URL}/api/evaluations/${id}/status`),
  
  // 데이터셋 관련
  getDatasets: () => 
    fetch(`${API_BASE_URL}/api/datasets`),
  
  // 기타 엔드포인트...
};
```

### 환경 변수 설정 (`.env`)
```bash
VITE_API_BASE_URL=https://your-backend-url.replit.dev
VITE_WS_URL=wss://your-backend-url.replit.dev/ws
```

---

## 🚀 7단계: 라우팅 설정

### React Router 예시

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { DashboardPageBlue } from './components/DashboardPageBlue';
// ... 기타 import

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<AppLayout />}>
          <Route index element={<DashboardPageBlue />} />
          <Route path="datasets" element={<DatasetsPageBlue />} />
          <Route path="evaluation-mode" element={<EvaluationModeSelectionPage />} />
          <Route path="evaluation/external" element={<ExternalEvaluationPageBlue />} />
          <Route path="evaluation/internal" element={<NewEvaluationPageBlue />} />
          <Route path="monitoring" element={<MonitoringPageBlue />} />
          <Route path="evaluation/:id" element={<EvaluationMonitorPageBlue />} />
          <Route path="results/:id" element={<ResultsPageBlue />} />
          <Route path="history" element={<EvaluationHistoryPageBlue />} />
          <Route path="comparison" element={<ComparisonPageBlue />} />
          <Route path="auto-improve/setup" element={<AutoImproveSetupPageBlue />} />
          <Route path="auto-improve/:id" element={<AutoImproveProgressPageBlue />} />
          <Route path="auto-improve/:id/results" element={<AutoImproveResultsPageBlue />} />
          <Route path="cost-dashboard" element={<CostDashboardPageBlue />} />
          <Route path="budget-settings" element={<BudgetSettingsPageBlue />} />
          <Route path="cost-alerts" element={<CostAlertsPageBlue />} />
          <Route path="logs" element={<LogViewerPageBlue />} />
          <Route path="admin" element={<AdminPageBlue />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

---

## 📐 8단계: 레이아웃 통일 원칙

### AppLayout의 메인 컨테이너
```tsx
// AppLayout.tsx
<main className="flex-1 p-6 overflow-auto">
  <Outlet />
</main>
```

### 모든 페이지 컴포넌트
```tsx
// 각 페이지의 최상위 div
<div className="space-y-4 max-w-5xl bg-gray-50/30 -m-6 p-6">
  {/* 페이지 콘텐츠 */}
</div>
```

**원리:**
- AppLayout의 `p-6`과 페이지의 `-m-6`이 상쇄
- 페이지마다 일관된 하늘색 배경(`bg-gray-50/30`)
- 최대 폭 5xl로 제한하여 가독성 확보

---

## 🎨 9단계: 디자인 시스템

### 색상 체계
```css
/* 주요 색상 */
Blue (메인):    #2563EB (blue-600), #3B82F6 (blue-500)
Gray (서브):    #6B7280 (gray-500), #9CA3AF (gray-400)
Amber (포인트): #F59E0B (amber-500), #FBBF24 (amber-400)

/* 상태 색상 */
Success: #10B981 (green-500)
Warning: #F59E0B (amber-500)
Error:   #EF4444 (red-500)
```

### 타이포그래피
```css
/* 페이지 제목 */
font-bold text-[24px] text-gray-900

/* 카드 제목 */
text-base text-gray-900

/* 본문 */
text-sm text-gray-600

/* 라벨 */
text-sm text-gray-700
```

### 간격 및 레이아웃
```css
/* 페이지 간격 */
space-y-4 또는 space-y-6

/* 카드 패딩 */
p-4 또는 p-6

/* 그리드 간격 */
gap-4 또는 gap-6
```

---

## 🔄 10단계: Mock 데이터 → 실제 API 전환

### 단계적 마이그레이션

#### Phase 1: Mock 데이터로 개발
```tsx
import { mockDatasets, mockEvaluationHistory } from '../lib/mock-data';

function DatasetsPage() {
  const [datasets, setDatasets] = useState(mockDatasets);
  // ...
}
```

#### Phase 2: API 연동
```tsx
import { apiClient } from '../lib/api-client';

function DatasetsPage() {
  const [datasets, setDatasets] = useState([]);
  
  useEffect(() => {
    apiClient.getDatasets()
      .then(res => res.json())
      .then(data => setDatasets(data));
  }, []);
}
```

#### Phase 3: React Query 도입 (권장)
```tsx
import { useQuery } from '@tanstack/react-query';

function DatasetsPage() {
  const { data: datasets, isLoading } = useQuery({
    queryKey: ['datasets'],
    queryFn: () => apiClient.getDatasets().then(res => res.json())
  });
}
```

---

## 📊 11단계: 실시간 업데이트 (WebSocket)

### WebSocket 연결 예시
```typescript
// stores/monitor-store.ts
const ws = new WebSocket(import.meta.env.VITE_WS_URL);

ws.onmessage = (event) => {
  const message: WebSocketMessage = JSON.parse(event.data);
  
  if (message.type === 'progress_update') {
    // 진행률 업데이트
    updateEvaluationProgress(message.data.evaluation_id, message.data.progress);
  }
};
```

---

## 🧪 12단계: 테스트 및 검증

### 체크리스트

#### UI 레이아웃
- [ ] 모든 페이지의 배경색과 패딩이 일관됨
- [ ] 사이드바 네비게이션 정상 작동
- [ ] 브레드크럼 표시 확인
- [ ] 모바일 반응형 동작 확인

#### 페이지별 기능
- [ ] 대시보드: 통계 카드, 최근 평가 표시
- [ ] 데이터셋: 생성, 업로드, 삭제 기능
- [ ] 평가 모드 선택: External/Internal 모드 카드 표시
- [ ] 평가 설정: 폼 입력 및 유효성 검사
- [ ] 평가 모니터링: 실시간 진행률 표시
- [ ] 평가 결과: 차트, 테이블, 실패 케이스 분석

#### 상호작용
- [ ] 버튼 클릭 응답
- [ ] 폼 제출 처리
- [ ] 모달/다이얼로그 열기/닫기
- [ ] 탭 전환
- [ ] 토스트 알림 표시

#### 성능
- [ ] 페이지 로딩 속도
- [ ] 차트 렌더링 성능
- [ ] 대량 데이터 테이블 렌더링

---

## 🐛 문제 해결 가이드

### 1. Tailwind 클래스가 적용되지 않음
**원인:** Tailwind v4.0 미설정  
**해결:** `globals.css`에 `@theme inline` 블록 확인

### 2. shadcn/ui 컴포넌트 import 오류
**원인:** 경로 문제  
**해결:** 
```tsx
// ❌ 잘못된 예
import { Button } from "@/components/ui/button"

// ✅ 올바른 예
import { Button } from "./components/ui/button"
```

### 3. 폰트가 적용되지 않음
**원인:** Pretendard CDN 미로드  
**해결:** `globals.css` 첫 줄 확인
```css
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css');
```

### 4. 아이콘이 표시되지 않음
**원인:** lucide-react 미설치  
**해결:** `npm install lucide-react`

### 5. 레이아웃이 깨짐
**원인:** `-m-6` 네거티브 마진 누락  
**해결:** 각 페이지 최상위 div에 `-m-6 p-6` 클래스 추가

---

## 📚 참고 문서

### 프로젝트 문서
- `/guidelines/Navigation-Workflow-Guide.md` - 전체 네비게이션 구조
- `/guidelines/Frontend-Integration-Guide.md` - 프론트엔드 통합 가이드
- `/guidelines/Backend-Integration-Complete-Guide.md` - 백엔드 API 연동
- `/guidelines/System-Architecture-Specification.md` - 시스템 아키텍처

### 기능별 가이드
- `/guidelines/LLM-Judge-Implementation-Summary.md` - LLM Judge 구현
- `/guidelines/Cost-Observability-Frontend-Guide.md` - 비용 추적 UI
- `/guidelines/Auto-Improve-Implementation-Guide.md` - 자동 개선 기능

### API 명세
- `/guidelines/API-Specification.md` - 전체 API 엔드포인트

---

## 🎯 단계별 통합 전략

### Week 1: 기본 설정 및 레이아웃
1. 패키지 설치
2. Tailwind CSS 설정
3. shadcn/ui 컴포넌트 복사
4. AppLayout 통합
5. 로그인 페이지 통합

### Week 2: 핵심 페이지 통합
1. 대시보드
2. 데이터셋 관리
3. 평가 모드 선택
4. External/Internal 평가 페이지

### Week 3: 모니터링 및 결과
1. 평가 모니터링
2. 실시간 진행 화면
3. 결과 상세 페이지
4. 평가 이력

### Week 4: 고급 기능
1. 자동 개선 기능
2. 비용 관리
3. 관리자 설정
4. 로그 뷰어

### Week 5: 통합 및 최적화
1. 백엔드 API 연동
2. WebSocket 실시간 업데이트
3. 성능 최적화
4. 테스트 및 버그 수정

---

## 📞 지원

### 코드 구조 질문
- AppLayout과 페이지 간 props 전달 방식
- 상태 관리 패턴 (Zustand 사용법)
- API 연동 구조

### 디자인 질문
- 컬러 팔레트 확장
- 새로운 컴포넌트 추가
- 반응형 레이아웃 조정

### 통합 이슈
- Import 경로 문제
- 타입 충돌
- 빌드 오류

---

## ✅ 체크리스트: 통합 완료 확인

- [ ] 모든 패키지 설치 완료
- [ ] Tailwind CSS 정상 작동
- [ ] shadcn/ui 컴포넌트 모두 import 가능
- [ ] 11개 핵심 페이지 렌더링 성공
- [ ] 페이지 간 네비게이션 동작
- [ ] 로그인/로그아웃 플로우 구현
- [ ] Mock 데이터로 모든 화면 확인
- [ ] API 클라이언트 설정 완료
- [ ] 환경 변수 설정 완료
- [ ] 프로덕션 빌드 성공

---

## 🎉 완료 후 다음 단계

1. **백엔드 API 연동 테스트**
   - 평가 생성 → 실행 → 결과 조회 플로우
   
2. **실시간 모니터링 구현**
   - WebSocket 연결
   - 진행률 실시간 업데이트

3. **성능 최적화**
   - 차트 렌더링 최적화
   - 대량 데이터 페이지네이션

4. **배포 준비**
   - 환경별 설정 분리
   - 빌드 최적화
   - 에러 로깅 설정

---

**마지막 업데이트:** 2025-11-11  
**문서 버전:** 1.0
