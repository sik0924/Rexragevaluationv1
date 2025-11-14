# LLM Judge 비용 절감 구현 요약

## 🎯 목표
V1.0에서 LLM Judge 비용 폭증을 방지하고 **90% 이상의 비용 절감**을 달성합니다.

## ✅ 구현 완료 사항

### 1. 타입 정의 (/types/index.ts)
- [x] `DiagnosisMethod` 타입 추가
- [x] `LLMJudgeSamplingConfig` 인터페이스 추가
- [x] `HeuristicThresholds` 인터페이스 추가
- [x] `DiagnosisSummary` 인터페이스 추가
- [x] `FailedCase`에 `diagnosisMethod`, `sampled` 필드 추가
- [x] `EvaluationResult`에 `diagnosisSummary` 필드 추가
- [x] `CreateEvaluationRequest`에 `llm_judge_config` 필드 추가

### 2. UI 컴포넌트
- [x] `DiagnosisSummaryCard.tsx` 생성 - 진단 요약 카드
- [x] `DiagnosisSummaryExample.tsx` 생성 - 사용 예제
- [x] `NewEvaluationPageBlue.tsx`에 State 추가

### 3. 가이드 문서
- [x] `/guidelines/LLM-Judge-Sampling-UI-Guide.md` - 프론트엔드 구현 가이드
- [x] `/guidelines/LLM-Judge-Cost-Optimization-Backend.md` - 백엔드 구현 가이드
- [x] `/guidelines/LLM-Judge-Implementation-Summary.md` - 구현 요약 (본 문서)

## 📋 남은 작업

### Frontend (우선순위: 높음)
1. [ ] NewEvaluationPageBlue.tsx에 LLM Judge 샘플링 설정 UI 추가
   - 위치: RAG 하이퍼파라미터 섹션 아래
   - 코드: `/guidelines/LLM-Judge-Sampling-UI-Guide.md` 참조
   - 예상 소요 시간: 30분

2. [ ] ResultsPageBlue.tsx에 DiagnosisSummaryCard 추가
   ```typescript
   import { DiagnosisSummaryCard } from './DiagnosisSummaryCard';
   
   // 실패 케이스 분석 섹션 아래에 추가
   {evaluation.diagnosisSummary && (
     <DiagnosisSummaryCard summary={evaluation.diagnosisSummary} />
   )}
   ```
   - 예상 소요 시간: 10분

3. [ ] NewEvaluationPageBlue.tsx의 `handleStartEvaluation` 함수 수정
   - LLM Judge 설정을 API 요청에 포함
   - 코드: `/guidelines/LLM-Judge-Sampling-UI-Guide.md` 참조
   - 예상 소요 시간: 15분

### Backend (우선순위: 높음)
1. [ ] DB 스키마 마이그레이션
   ```sql
   -- failed_cases 테이블
   ALTER TABLE failed_cases ADD COLUMN diagnosis_method VARCHAR(20);
   ALTER TABLE failed_cases ADD COLUMN sampled BOOLEAN;
   ALTER TABLE failed_cases ADD COLUMN heuristic_reason VARCHAR(100);
   ALTER TABLE failed_cases ADD COLUMN context_tokens INTEGER;
   
   -- evaluations 테이블
   ALTER TABLE evaluations ADD COLUMN llm_judge_config JSONB;
   ALTER TABLE evaluations ADD COLUMN diagnosis_summary JSONB;
   ```
   - 예상 소요 시간: 10분

2. [ ] DiagnosisPipeline 클래스 구현
   - 파일: `evaluation_engine/diagnosis_pipeline.py`
   - 코드: `/guidelines/LLM-Judge-Cost-Optimization-Backend.md` 참조
   - 예상 소요 시간: 2시간

3. [ ] FastAPI 엔드포인트 수정
   - POST /api/evaluations: llm_judge_config 파라미터 추가
   - GET /api/evaluations/{id}/results: diagnosisSummary 응답 추가
   - 예상 소요 시간: 30분

4. [ ] 백그라운드 작업 업데이트
   - `run_evaluation_with_diagnosis` 함수 구현
   - 예상 소요 시간: 1시간

5. [ ] 단위 테스트 작성
   - 휴리스틱 필터 테스트
   - 샘플링 로직 테스트
   - 비용 절감 효과 테스트
   - 예상 소요 시간: 1시간

### Mock Data 업데이트 (우선순위: 중간)
1. [ ] `/lib/mock-data.ts`에 diagnosisSummary 샘플 데이터 추가
   ```typescript
   export const mockEvaluationWithDiagnosis: EvaluationResult = {
     id: 'eval-1',
     status: 'completed',
     scores: {...},
     diagnosisSummary: {
       total_failed: 324,
       heuristic_classified: 215,
       llm_judge_analyzed: 22,
       not_analyzed: 87,
       diagnosis_cost: 2.40,
       breakdown: {
         trivial_failures: 180,
         retrieval_failures: 35,
         ambiguous_cases: 109
       }
     },
     failedCases: [...]
   };
   ```
   - 예상 소요 시간: 15분

## 🔄 구현 흐름

### 사용자 워크플로우
```
1. 평가 설정 페이지 (NewEvaluationPageBlue)
   └─ LLM Judge 샘플링 설정 선택
      ├─ 자동 모드 (권장)
      ├─ 고정 비율 (20%)
      └─ 최대 케이스 수 (100개)
   
2. 평가 실행
   └─ 백엔드로 llm_judge_config 전송
   
3. 백엔드 진단 파이프라인
   ├─ 1차: 휴리스틱 필터링 (비용 $0)
   │   ├─ Score < 0.2 → 명백한 실패
   │   └─ Context 부족 → 검색 실패
   ├─ 2차: 샘플링 (비용 통제)
   │   └─ 자동/고정비율/최대케이스
   └─ 3차: LLM Judge 호출 (샘플만)
       └─ 근본 원인 + 개선 조언
   
4. 결과 페이지 (ResultsPageBlue)
   └─ DiagnosisSummaryCard 표시
      ├─ 전체 실패 케이스: 324개
      ├─ 휴리스틱 분류: 215개 (66%)
      ├─ LLM Judge 분석: 22개 (7%)
      ├─ 미분석: 87개 (27%)
      └─ 진단 비용: $2.40 (93% 절감)
```

## 📊 예상 효과

### Before (현재)
```
실패 케이스 324개 → LLM Judge 324회 호출
비용: 324 × $0.03 = $9.72
```

### After (V1.0)
```
실패 케이스 324개
├─ 휴리스틱 분류: 215개 (비용 $0)
├─ LLM Judge: 22개 (비용 $0.66)
└─ 미분석: 87개 (비용 $0)

총 비용: $0.66
절감율: 93.2%
```

## 🚀 배포 순서

### Phase 1: Frontend (Day 1)
1. NewEvaluationPageBlue.tsx UI 추가
2. ResultsPageBlue.tsx에 DiagnosisSummaryCard 추가
3. Mock 데이터로 로컬 테스트

### Phase 2: Backend (Day 2-3)
1. DB 스키마 마이그레이션
2. DiagnosisPipeline 구현
3. API 엔드포인트 수정
4. 단위 테스트

### Phase 3: 통합 테스트 (Day 4)
1. Frontend-Backend 연동 테스트
2. 실제 LLM Judge 연동 테스트
3. 비용 절감 효과 검증

### Phase 4: 프로덕션 배포 (Day 5)
1. Staging 환경 배포 및 테스트
2. 프로덕션 배포
3. 모니터링 설정

## 📝 Quick Start

### Frontend 개발자
1. `/guidelines/LLM-Judge-Sampling-UI-Guide.md` 읽기
2. NewEvaluationPageBlue.tsx 수정
3. DiagnosisSummaryCard를 ResultsPageBlue.tsx에 추가
4. Mock 데이터로 테스트

### Backend 개발자
1. `/guidelines/LLM-Judge-Cost-Optimization-Backend.md` 읽기
2. DB 스키마 마이그레이션 실행
3. DiagnosisPipeline 클래스 구현
4. API 엔드포인트 수정
5. 단위 테스트 작성

## 🔗 참고 링크

- **타입 정의**: `/types/index.ts`
- **진단 요약 카드**: `/components/DiagnosisSummaryCard.tsx`
- **사용 예제**: `/components/DiagnosisSummaryExample.tsx`
- **프론트엔드 가이드**: `/guidelines/LLM-Judge-Sampling-UI-Guide.md`
- **백엔드 가이드**: `/guidelines/LLM-Judge-Cost-Optimization-Backend.md`
- **LLM Judge 프롬프트**: `/guidelines/LLM-Judge-Prompt-Strategy.md`

## ❓ FAQ

### Q: 샘플링으로 정확도가 떨어지지 않나요?
A: 휴리스틱으로 명백한 케이스를 이미 분류했고, 애매한 케이스만 샘플링합니다. 통계적으로 20% 샘플링이면 95% 신뢰도를 확보할 수 있습니다.

### Q: 자동 모드가 정확히 어떻게 작동하나요?
A: 실패 케이스 수에 따라 샘플링 비율을 조정합니다:
- ≤ 50개: 100% (전체 분석)
- 50~200개: 50%
- > 200개: 20%

### Q: 고급 설정의 임계값을 어떻게 조정하나요?
A: 기본값(Score < 0.2, Context Recall < 0.1)이 대부분의 경우 적절합니다. 특정 도메인에서 조정이 필요하면 고급 설정을 사용하세요.

### Q: V1.5에서 추가될 기능은?
A: 
- 예산 기반 샘플링
- 진단 결과 캐싱
- 적응형 샘플링 (통계적 신뢰도 기반)
- 사용자 피드백 기반 휴리스틱 개선

## ✅ 체크리스트

### Frontend
- [x] 타입 정의 완료
- [x] DiagnosisSummaryCard 컴포넌트 생성
- [x] State 추가 (NewEvaluationPageBlue.tsx)
- [ ] UI 추가 (NewEvaluationPageBlue.tsx)
- [ ] DiagnosisSummaryCard 추가 (ResultsPageBlue.tsx)
- [ ] handleStartEvaluation 수정

### Backend
- [ ] DB 스키마 마이그레이션
- [ ] DiagnosisPipeline 구현
- [ ] API 엔드포인트 수정
- [ ] 백그라운드 작업 수정
- [ ] 단위 테스트

### Documentation
- [x] 프론트엔드 가이드
- [x] 백엔드 가이드
- [x] 구현 요약
- [x] 사용 예제

### Testing
- [ ] 단위 테스트
- [ ] 통합 테스트
- [ ] E2E 테스트
- [ ] 비용 절감 효과 검증

### Deployment
- [ ] Staging 배포
- [ ] 프로덕션 배포
- [ ] 모니터링 설정
- [ ] 문서 업데이트

---

**구현 시작일**: 2025-01-16
**예상 완료일**: 2025-01-20
**담당자**: Frontend Team, Backend Team
**우선순위**: 🔴 Critical (V1.0 필수)
