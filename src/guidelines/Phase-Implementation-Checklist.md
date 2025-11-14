# REX Phase별 기능 구현 체크리스트

> 📋 이 문서는 Replit 개발 시 Phase별로 구현해야 할 기능과 구현하지 말아야 할 기능을 명확히 구분합니다.

---

## Phase 1: External SaaS Mode (현재 단계)

### ✅ 구현해야 할 기능

#### 데이터셋 관리
- [x] CSV/JSON 파일 업로드
- [x] 데이터셋 목록 조회
- [x] 데이터셋 상세 보기
- [x] 데이터셋 삭제
- [ ] LLM 기반 자동 생성 (백엔드)

#### External 평가
- [x] API 연동 설정 UI
- [x] 인증 방식 설정 (API Key, Bearer Token, Basic Auth)
- [x] 요청/응답 필드 매핑
- [ ] 연결 테스트 기능 (백엔드)
- [ ] 평가 시작 API 연동 (백엔드)
- [ ] 실시간 진행 모니터링 WebSocket (백엔드)

#### 평가 지표
- [x] 필수 지표 5개 (Faithfulness, Answer Relevancy, Context Precision, Context Recall, Answer Similarity)
- [x] 선택 지표 7개 (Answer Correctness, Context Entity Recall, Coherence, Conciseness, Critique Correctness, Harmfulness, Maliciousness)
- [x] 지표 선택 UI
- [ ] 지표 계산 로직 (백엔드)

#### LLM Judge 비용 최적화
- [x] 프리셋 선택 UI (Fast, Balanced, Precise)
- [x] 샘플링 모드 선택 (Auto, Fixed Ratio, Max Cases)
- [x] 예상 비용 계산 UI
- [ ] 1차 휴리스틱 필터링 (백엔드)
- [ ] 2차 고정 비율 샘플링 (백엔드)

#### 평가 결과
- [x] 전체 평가 요약 (평균 점수, Pass/Fail 비율)
- [x] 12개 지표별 점수 및 시각화
- [x] 레이더 차트, 막대 그래프, 개별 카드
- [x] 검색 품질 vs 생성 품질 분석
- [x] 결과 비교 기능
- [x] CSV/JSON/HTML 다운로드
- [ ] 실제 평가 결과 API 연동 (백엔드)

#### 예약 및 자동화
- [x] 평가 예약 UI (Once, Daily, Weekly, Monthly, Cron)
- [ ] 예약 실행 스케줄러 (백엔드)

### ❌ 구현하지 말아야 할 기능 (Phase 3에서 구현)

#### 오류 분석 (Failure Analysis)
- ❌ LLM Judge 기반 근본 원인 분석
- ❌ 실패 케이스 Root Cause 자동 분류 (Retrieval vs Generation)
- ❌ 실패 패턴 그룹핑
- ❌ 진단 요약 리포트
- 📝 **UI는 준비되어 있으며, Phase 3 오버레이로 비활성화됨**

#### 개선 제안 및 실험
- ❌ AI 기반 파라미터 최적화 제안
- ❌ 검색 오류 개선 제안 (Chunk Size, Embedding Model 조정)
- ❌ 생성 오류 개선 제안 (Temperature, Prompt 조정)
- ❌ 제안된 설정으로 자동 재평가
- 📝 **UI는 준비되어 있으며, Phase 3 오버레이로 비활성화됨**

#### 기타 고급 기능
- ❌ RAG 최적 설정 탐색 (Internal 평가 모드)
- ❌ Vector DB 연동
- ❌ 비용 대시보드
  - 📝 **대시보드의 "이번 달 비용" 카드는 Phase 3 오버레이로 비활성화됨**
- ❌ 커스텀 지표 생성

---

## Phase 2: Internal BMT Mode

### ✅ 구현해야 할 기능

#### Vector DB 연동
- [ ] Pinecone, Weaviate, Milvus 연동
- [ ] 문서 업로드 및 인덱싱
- [ ] 임베딩 모델 선택

#### Internal 평가
- [ ] REX 내부에서 RAG 파이프라인 실행
- [ ] 하이퍼파라미터 조합 실험
- [ ] 최적 설정 자동 발견

#### 실험 관리
- [ ] 실험 이력 관리
- [ ] 파라미터 조합별 성능 비교
- [ ] 최적 설정 적용

### ❌ Phase 2에서 구현하지 않을 기능
- Phase 1의 모든 미완성 기능은 Phase 2 이전에 완료
- Phase 3 기능은 여전히 비활성화 유지

---

## Phase 3: Auto-Improve & Advanced Features

### ✅ 구현해야 할 기능

#### 자동 개선 알고리즘
- [ ] **LLM Judge 기반 근본 원인 분석**
  - [ ] 실패 케이스 Root Cause 분류 API 구현
  - [ ] 실패 패턴 분석 알고리즘
  - [ ] 진단 요약 자동 생성
  - [ ] ResultsPageBlue의 "오류 분석" 섹션 오버레이 제거
  
- [ ] **AI 기반 개선 제안**
  - [ ] 검색 오류 개선 제안 로직 (LLM API 호출)
  - [ ] 생성 오류 개선 제안 로직 (LLM API 호출)
  - [ ] 개선 우선순위 자동 산정
  - [ ] ResultsPageBlue의 "개선 제안 및 실험" 섹션 오버레이 제거
  
- [ ] **자동 재평가**
  - [ ] 제안된 설정 자동 적용
  - [ ] 재평가 API 호출
  - [ ] 개선 전후 비교 리포트

#### 비용 대시보드
- [ ] 실시간 비용 추적
- [ ] 프로젝트별 예산 설정
- [ ] 비용 알림 및 임계값 관리

#### 커스텀 지표
- [ ] 사용자 정의 지표 생성 UI
- [ ] 프롬프트 기반 지표 설정
- [ ] 커스텀 지표 실행 엔진

#### 반복 평가 예약
- [ ] 스케줄러 백엔드 구현
- [ ] 성능 회귀 감지
- [ ] 알림 및 리포트 자동 발송

---

## UI 상태 관리 가이드

### Phase 1 오버레이 처리 방법

ResultsPageBlue.tsx의 "오류 분석"과 "개선 제안 및 실험" 섹션은 다음과 같이 처리되어 있습니다:

```tsx
<Card className="border-gray-200 bg-gray-50/50 shadow-sm relative overflow-hidden">
  {/* Phase 3 오버레이 */}
  <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
    <div className="text-center p-6">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-100 border-2 border-blue-300 mb-3">
        <Sparkles className="h-5 w-5 text-blue-600" />
        <span className="font-semibold text-blue-900">Phase 3에서 제공 예정</span>
      </div>
      <p className="text-sm text-gray-600 max-w-md">
        LLM Judge 기반 근본 원인 분석 및 자동 개선 제안 기능은<br />
        Phase 3: Auto-Improve 단계에서 구현됩니다.
      </p>
    </div>
  </div>
  
  {/* 실제 UI (opacity-40으로 흐리게 표시) */}
  <CardHeader className="pb-3 border-b border-gray-100 opacity-40">
    ...
  </CardHeader>
</Card>
```

### Phase 3 구현 시 제거할 코드

Phase 3 개발 시 다음을 수행하세요:

1. **오버레이 div 전체 제거**
```tsx
// 이 부분을 삭제
<div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
  ...
</div>
```

2. **opacity-40 클래스 제거**
```tsx
// opacity-40 제거
<CardHeader className="pb-3 border-b border-gray-100">
<CardContent className="pt-4">
```

3. **Card 스타일 원복**
```tsx
// border-gray-200 bg-gray-50/50 → 원래 색상으로
<Card className="border-orange-200 bg-white shadow-sm">  // 오류 분석
<Card className="border-blue-100 bg-white shadow-sm">     // 개선 제안
```

4. **백엔드 API 연동**
- `/api/evaluations/:id/root-cause-analysis` 구현
- `/api/evaluations/:id/improvement-suggestions` 구현
- LLM Judge 호출 로직 추가

---

## 백엔드 개발 우선순위

### Phase 1 필수 구현
```
우선순위 1: 평가 실행 엔진
- POST   /api/evaluations/external
- WebSocket /ws/evaluations/:id
- GET    /api/evaluations/:id/status

우선순위 2: 지표 계산 엔진
- 12개 RAG 지표 계산 로직
- LLM Judge 샘플링 (1차 휴리스틱, 2차 고정비율)

우선순위 3: 데이터셋 관리
- POST   /api/datasets
- POST   /api/datasets/generate
- GET    /api/datasets
```

### Phase 3 필수 구현
```
우선순위 1: 자동 개선
- POST   /api/evaluations/:id/root-cause-analysis
- POST   /api/evaluations/:id/improvement-suggestions
- POST   /api/auto-improve

우선순위 2: 비용 관리
- GET    /api/costs
- POST   /api/budgets
- WebSocket /ws/cost-alerts
```

---

## 개발 시 주의사항

### ⚠️ Phase 혼동 방지

1. **Phase 1 개발 중**
   - "오류 분석"이나 "개선 제안" 관련 백엔드 API 개발 금지
   - UI는 이미 준비되어 있으므로 건드리지 말 것
   - Phase 3 오버레이가 제대로 표시되는지 확인

2. **Phase 2 개발 중**
   - Phase 1의 모든 기능이 완성되었는지 확인
   - Phase 3 기능은 여전히 비활성화 유지

3. **Phase 3 개발 시작 전**
   - Phase 1, 2의 모든 완료 조건 체크
   - 이 체크리스트의 "Phase 3 구현 시 제거할 코드" 섹션 참고

---

## 완료 조건 체크

### Phase 1 완료 기준
- [ ] External 평가 전체 워크플로우 작동
- [ ] 12개 지표 계산 완료
- [ ] LLM Judge 샘플링 90% 이상 비용 절감 확인
- [ ] 실시간 모니터링 WebSocket 작동
- [ ] 평가 결과 시각화 완성
- [ ] CSV/JSON/HTML 다운로드 작동
- [ ] 결과 비교 기능 작동

### Phase 2 완료 기준
- [ ] Vector DB 연동 완료
- [ ] Internal 평가 전체 워크플로우 작동
- [ ] 하이퍼파라미터 조합 실험 자동화
- [ ] 최적 설정 자동 발견 완료

### Phase 3 완료 기준
- [ ] LLM Judge 기반 근본 원인 분석 작동
- [ ] AI 기반 개선 제안 생성 작동
- [ ] 자동 재평가 워크플로우 완성
- [ ] 비용 대시보드 완성
- [ ] 커스텀 지표 생성 기능 완성
- [ ] 반복 평가 예약 완성

---

## 참고 문서

- `/guidelines/Development-Roadmap.md` - 전체 로드맵
- `/guidelines/Architecture-Overview.md` - 시스템 아키텍처
- `/guidelines/API-Specification.md` - API 명세서
- `/guidelines/Auto-Improve-Algorithm-Specification.md` - Auto-Improve 알고리즘
- `/guidelines/Cost-Observability-Guide.md` - 비용 최적화 가이드

---

**마지막 업데이트:** 2025-11-07  
**작성자:** REX Development Team