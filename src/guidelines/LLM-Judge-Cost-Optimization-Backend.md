# LLM Judge 비용 절감 백엔드 구현 가이드

## 개요
V1.0에서 LLM Judge 호출 횟수를 90% 이상 줄이기 위한 2단계 필터링 파이프라인 구현 가이드입니다.

## 아키텍처

```
평가 완료
    ↓
실패 케이스 추출
    ↓
┌─────────────────────────────────────────────┐
│ 1차 필터: 휴리스틱 기반 자동 분류 (비용 $0) │
└─────────────────────────────────────────────┘
    ↓
┌─ Score Threshold Check
│   → answer_correctness < 0.2 또는 faithfulness < 0.2
│   → 자동 분류: "Trivial Failure"
│
└─ Context Volume Check
    → context_recall < 0.1 또는 context_tokens < 50
    → 자동 분류: "Retrieval Failure"
    ↓
애매한 케이스만 추출 (Ambiguous Cases)
    ↓
┌─────────────────────────────────────────┐
│ 2차 필터: 샘플링 (비용 통제)            │
└─────────────────────────────────────────┘
    ↓
┌─ 자동 모드 (mode=auto)
│   → 실패 케이스 수에 따라 비율 조정
│   → <= 50개: 100%
│   → 50~200개: 50%
│   → > 200개: 20%
│
├─ 고정 비율 모드 (mode=fixed_ratio)
│   → 지정된 비율만큼 무작위 샘플링
│   → 예: 20% 지정 시 100개 중 20개 선택
│
└─ 최대 케이스 수 모드 (mode=max_cases)
    → 지정된 개수만큼 무작위 샘플링
    → 예: 100개 지정 시 최대 100개만 선택
    ↓
선택된 케이스만 LLM Judge로 전달
    ↓
┌──────────────────────────────────────┐
│ 3차: LLM Judge 상세 분석             │
└──────────────────────────────────────┘
    ↓
GPT-4가 근본 원인 분석 + 개선 조언
    ↓
결과 병합 및 DB 저장
```

## 1. 데이터베이스 스키마 수정

### 1.1 failed_cases 테이블 수정

```sql
-- 진단 방법 추가
ALTER TABLE failed_cases 
ADD COLUMN diagnosis_method VARCHAR(20) DEFAULT 'Not Analyzed';
-- 가능한 값: 'LLM Judge', 'Heuristic', 'Not Analyzed'

-- LLM Judge 샘플링 여부
ALTER TABLE failed_cases 
ADD COLUMN sampled BOOLEAN DEFAULT FALSE;
-- TRUE: LLM Judge로 분석된 케이스
-- FALSE: 휴리스틱 분류 또는 미분석

-- 휴리스틱 분류 이유
ALTER TABLE failed_cases 
ADD COLUMN heuristic_reason VARCHAR(100);
-- 예: 'Score < 0.2', 'Context Recall < 0.1', 'Context too short'

-- 컨텍스트 토큰 수 (휴리스틱 필터용)
ALTER TABLE failed_cases 
ADD COLUMN context_tokens INTEGER;

-- 인덱스 추가 (성능 최적화)
CREATE INDEX idx_diagnosis_method ON failed_cases(diagnosis_method);
CREATE INDEX idx_sampled ON failed_cases(sampled);
```

### 1.2 evaluations 테이블 수정

```sql
-- LLM Judge 설정 저장
ALTER TABLE evaluations 
ADD COLUMN llm_judge_config JSONB;
-- 예시 JSON:
-- {
--   "enabled": true,
--   "mode": "auto",
--   "fixed_ratio": 20,
--   "max_cases": 100
-- }

-- 진단 요약 정보 (캐싱용)
ALTER TABLE evaluations 
ADD COLUMN diagnosis_summary JSONB;
-- 예시 JSON:
-- {
--   "total_failed": 324,
--   "heuristic_classified": 215,
--   "llm_judge_analyzed": 22,
--   "not_analyzed": 87,
--   "diagnosis_cost": 2.40,
--   "breakdown": {
--     "trivial_failures": 180,
--     "retrieval_failures": 35,
--     "ambiguous_cases": 109
--   }
-- }
```

## 2. Python 백엔드 구현

### 2.1 진단 파이프라인 (diagnosis_pipeline.py)

```python
# evaluation_engine/diagnosis_pipeline.py

from typing import List, Dict, Tuple
import random
from dataclasses import dataclass

@dataclass
class FailedCaseData:
    """실패 케이스 데이터 구조"""
    id: str
    question: str
    expected_answer: str
    generated_answer: str
    retrieved_contexts: List[str]
    scores: Dict[str, float]  # 12가지 지표 점수
    context_tokens: int
    
    # 진단 결과 (채워질 필드)
    diagnosis_method: str = "Not Analyzed"
    heuristic_reason: str | None = None
    sampled: bool = False
    llm_judge_analysis: Dict | None = None


class DiagnosisPipeline:
    """
    LLM Judge 비용 절감을 위한 2단계 필터링 파이프라인
    """
    
    # 기본 임계값 (frontend에서 override 가능)
    DEFAULT_THRESHOLDS = {
        'trivial_failure_score': 0.2,
        'retrieval_failure_score': 0.1,
        'min_context_tokens': 50
    }
    
    def __init__(self, llm_judge_client, config: Dict):
        """
        Args:
            llm_judge_client: LLM Judge API 클라이언트
            config: {
                'enabled': bool,
                'mode': 'auto' | 'fixed_ratio' | 'max_cases',
                'fixed_ratio': int (0-100),
                'max_cases': int,
                'thresholds': Dict (optional)
            }
        """
        self.llm_judge = llm_judge_client
        self.config = config
        self.thresholds = config.get('thresholds', self.DEFAULT_THRESHOLDS)
    
    def process_failed_cases(
        self, 
        failed_cases: List[FailedCaseData]
    ) -> Tuple[List[FailedCaseData], Dict]:
        """
        실패 케이스 진단 파이프라인 실행
        
        Returns:
            (processed_cases, diagnosis_summary)
        """
        if not self.config.get('enabled', True):
            # 진단 비활성화된 경우
            return failed_cases, self._create_summary(failed_cases, [], [])
        
        # 1단계: 휴리스틱 필터링
        ambiguous_cases, heuristic_cases = self._apply_heuristic_filter(failed_cases)
        
        # 2단계: 샘플링
        sampled_cases = self._apply_sampling(ambiguous_cases)
        
        # 3단계: LLM Judge 호출
        llm_analyzed_cases = self._run_llm_judge(sampled_cases)
        
        # 4단계: 결과 병합
        all_cases = heuristic_cases + llm_analyzed_cases
        not_analyzed_cases = [c for c in ambiguous_cases if c not in sampled_cases]
        all_cases.extend(not_analyzed_cases)
        
        # 진단 요약 생성
        summary = self._create_summary(failed_cases, heuristic_cases, llm_analyzed_cases)
        
        return all_cases, summary
    
    def _apply_heuristic_filter(
        self, 
        cases: List[FailedCaseData]
    ) -> Tuple[List[FailedCaseData], List[FailedCaseData]]:
        """
        1차 필터: 휴리스틱 기반 자동 분류
        
        Returns:
            (ambiguous_cases, heuristic_classified_cases)
        """
        ambiguous = []
        heuristic_classified = []
        
        for case in cases:
            # Score Threshold Check
            if self._is_trivial_failure(case):
                case.diagnosis_method = "Heuristic"
                case.heuristic_reason = f"Score < {self.thresholds['trivial_failure_score']}"
                # 간단한 자동 분류 (LLM Judge 없이)
                case.llm_judge_analysis = {
                    'failure_type': 'Generation',
                    'reason': '점수가 매우 낮아 명백한 실패로 판단됨',
                    'root_cause': {
                        'summary_ko': '생성된 답변의 품질이 매우 낮습니다.',
                        'advice_ko': 'LLM 모델 변경 또는 프롬프트 개선을 고려하세요.'
                    },
                    'diagnosis_method': 'Heuristic'
                }
                heuristic_classified.append(case)
                continue
            
            # Context Volume Check
            if self._is_retrieval_failure(case):
                case.diagnosis_method = "Heuristic"
                case.heuristic_reason = f"Context insufficient"
                case.llm_judge_analysis = {
                    'failure_type': 'Retrieval',
                    'reason': '검색된 컨텍스트가 부족함',
                    'root_cause': {
                        'summary_ko': '관련 문서를 충분히 검색하지 못했습니다.',
                        'advice_ko': 'chunk_size 증가 또는 similarity_threshold 낮추기를 권장합니다.'
                    },
                    'diagnosis_method': 'Heuristic'
                }
                heuristic_classified.append(case)
                continue
            
            # 휴리스틱으로 분류할 수 없는 애매한 케이스
            ambiguous.append(case)
        
        return ambiguous, heuristic_classified
    
    def _is_trivial_failure(self, case: FailedCaseData) -> bool:
        """명백한 실패 여부 판단"""
        threshold = self.thresholds['trivial_failure_score']
        
        # answer_correctness 또는 faithfulness가 매우 낮으면 명백한 실패
        if case.scores.get('answer_correctness', 1.0) < threshold:
            return True
        if case.scores.get('faithfulness', 1.0) < threshold:
            return True
        
        return False
    
    def _is_retrieval_failure(self, case: FailedCaseData) -> bool:
        """검색 실패 여부 판단"""
        retrieval_threshold = self.thresholds['retrieval_failure_score']
        min_tokens = self.thresholds['min_context_tokens']
        
        # context_recall이 매우 낮거나 컨텍스트가 너무 짧으면 검색 실패
        if case.scores.get('context_recall', 1.0) < retrieval_threshold:
            return True
        if case.context_tokens < min_tokens:
            return True
        
        return False
    
    def _apply_sampling(self, cases: List[FailedCaseData]) -> List[FailedCaseData]:
        """
        2차 필터: 샘플링
        
        Returns:
            샘플링된 케이스 목록
        """
        if not cases:
            return []
        
        total = len(cases)
        mode = self.config.get('mode', 'auto')
        
        # 샘플 크기 결정
        if mode == 'auto':
            sample_size = self._auto_sample_size(total)
        elif mode == 'fixed_ratio':
            ratio = self.config.get('fixed_ratio', 20) / 100
            sample_size = max(1, int(total * ratio))
        elif mode == 'max_cases':
            max_cases = self.config.get('max_cases', 100)
            sample_size = min(total, max_cases)
        else:
            # 기본값: 자동
            sample_size = self._auto_sample_size(total)
        
        # 무작위 샘플링
        sampled = random.sample(cases, min(sample_size, total))
        
        # sampled 플래그 설정
        for case in sampled:
            case.sampled = True
        
        return sampled
    
    def _auto_sample_size(self, total: int) -> int:
        """
        자동 모드에서 샘플 크기 결정
        
        - <= 50개: 100% 전체 분석
        - 50~200개: 50% 샘플링
        - > 200개: 20% 샘플링
        """
        if total <= 50:
            return total  # 100%
        elif total <= 200:
            return int(total * 0.5)  # 50%
        else:
            return int(total * 0.2)  # 20%
    
    def _run_llm_judge(self, cases: List[FailedCaseData]) -> List[FailedCaseData]:
        """
        3차: LLM Judge 호출 (샘플링된 케이스만)
        """
        for case in cases:
            try:
                # LLM Judge API 호출
                analysis = self.llm_judge.analyze(
                    user_question=case.question,
                    expected_answer=case.expected_answer,
                    generated_answer=case.generated_answer,
                    retrieved_contexts=case.retrieved_contexts,
                    failed_metric='overall'  # 또는 가장 낮은 지표
                )
                
                case.diagnosis_method = "LLM Judge"
                case.llm_judge_analysis = analysis
                
            except Exception as e:
                # LLM Judge 실패 시 휴리스틱으로 대체
                print(f"LLM Judge failed for case {case.id}: {e}")
                case.diagnosis_method = "Heuristic"
                case.heuristic_reason = "LLM Judge API Error"
        
        return cases
    
    def _create_summary(
        self, 
        all_cases: List[FailedCaseData],
        heuristic_cases: List[FailedCaseData],
        llm_cases: List[FailedCaseData]
    ) -> Dict:
        """진단 요약 생성"""
        
        total_failed = len(all_cases)
        heuristic_count = len(heuristic_cases)
        llm_count = len(llm_cases)
        not_analyzed = total_failed - heuristic_count - llm_count
        
        # 휴리스틱 분류 세부 통계
        trivial_failures = len([c for c in heuristic_cases if 'Score' in c.heuristic_reason])
        retrieval_failures = len([c for c in heuristic_cases if 'Context' in c.heuristic_reason])
        ambiguous_cases = total_failed - heuristic_count
        
        # 진단 비용 계산 (GPT-4 기준: $0.03/케이스 가정)
        diagnosis_cost = llm_count * 0.03
        
        return {
            'total_failed': total_failed,
            'heuristic_classified': heuristic_count,
            'llm_judge_analyzed': llm_count,
            'not_analyzed': not_analyzed,
            'diagnosis_cost': round(diagnosis_cost, 2),
            'breakdown': {
                'trivial_failures': trivial_failures,
                'retrieval_failures': retrieval_failures,
                'ambiguous_cases': ambiguous_cases
            }
        }
```

### 2.2 FastAPI 엔드포인트

```python
# api/evaluation_routes.py

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Dict, Optional

router = APIRouter(prefix="/api/evaluations", tags=["evaluations"])


class LLMJudgeConfig(BaseModel):
    """LLM Judge 설정"""
    enabled: bool = True
    mode: str = "auto"  # auto | fixed_ratio | max_cases
    fixed_ratio: Optional[int] = None
    max_cases: Optional[int] = None
    thresholds: Optional[Dict[str, float]] = None


class CreateEvaluationRequest(BaseModel):
    """평가 생성 요청"""
    name: str
    dataset_id: str
    model_id: str
    vector_db_id: str
    metrics: List[Dict]
    rag_system_prompt: str
    rag_hyperparameters: Dict
    llm_judge_config: Optional[LLMJudgeConfig] = LLMJudgeConfig()  # 기본값: 자동 모드


@router.post("")
async def create_evaluation(
    request: CreateEvaluationRequest,
    current_user = Depends(get_current_user)
):
    """
    평가 생성 및 실행
    """
    # 평가 생성
    evaluation_id = create_evaluation_record(
        name=request.name,
        dataset_id=request.dataset_id,
        model_id=request.model_id,
        vector_db_id=request.vector_db_id,
        metrics=request.metrics,
        rag_config={
            'system_prompt': request.rag_system_prompt,
            'hyperparameters': request.rag_hyperparameters
        },
        llm_judge_config=request.llm_judge_config.dict(),  # 🆕 저장
        user_id=current_user.id
    )
    
    # 백그라운드 작업으로 평가 실행
    background_tasks.add_task(
        run_evaluation_with_diagnosis,
        evaluation_id,
        request.llm_judge_config.dict()
    )
    
    return {
        "success": True,
        "data": {
            "evaluation_id": evaluation_id,
            "status": "pending"
        }
    }


@router.get("/{evaluation_id}/results")
async def get_evaluation_results(
    evaluation_id: str,
    current_user = Depends(get_current_user)
):
    """
    평가 결과 조회 (진단 요약 포함)
    """
    # DB에서 평가 결과 조회
    evaluation = get_evaluation_by_id(evaluation_id)
    
    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    
    # 실패 케이스 조회
    failed_cases = get_failed_cases(evaluation_id)
    
    return {
        "success": True,
        "data": {
            "id": evaluation.id,
            "status": evaluation.status,
            "scores": evaluation.scores,
            "diagnosisSummary": evaluation.diagnosis_summary,  # 🆕 진단 요약
            "failedCases": [
                {
                    "id": case.id,
                    "question": case.question,
                    "expectedAnswer": case.expected_answer,
                    "generatedAnswer": case.generated_answer,
                    "score": case.score,
                    "diagnosisMethod": case.diagnosis_method,  # 🆕
                    "sampled": case.sampled,  # 🆕
                    "llmJudgeAnalysis": case.llm_judge_analysis
                }
                for case in failed_cases
            ]
        }
    }
```

### 2.3 백그라운드 작업

```python
# evaluation_engine/worker.py

async def run_evaluation_with_diagnosis(
    evaluation_id: str,
    llm_judge_config: Dict
):
    """
    평가 실행 + LLM Judge 진단
    """
    try:
        # 1. RAG 평가 실행
        evaluation_results = await run_rag_evaluation(evaluation_id)
        
        # 2. 실패 케이스 추출
        failed_cases = extract_failed_cases(evaluation_results)
        
        if not failed_cases:
            # 실패 케이스 없으면 종료
            update_evaluation_status(evaluation_id, "completed")
            return
        
        # 3. 진단 파이프라인 실행
        pipeline = DiagnosisPipeline(
            llm_judge_client=get_llm_judge_client(),
            config=llm_judge_config
        )
        
        diagnosed_cases, summary = pipeline.process_failed_cases(failed_cases)
        
        # 4. DB에 저장
        save_failed_cases(evaluation_id, diagnosed_cases)
        update_diagnosis_summary(evaluation_id, summary)
        
        # 5. 평가 완료
        update_evaluation_status(evaluation_id, "completed")
        
    except Exception as e:
        print(f"Evaluation {evaluation_id} failed: {e}")
        update_evaluation_status(evaluation_id, "failed")
```

## 3. 비용 추적

### 3.1 진단 비용 계산

```python
# cost_tracking/diagnosis_cost.py

def calculate_diagnosis_cost(llm_judge_calls: int, model: str = "gpt-4") -> float:
    """
    LLM Judge 호출 비용 계산
    
    Args:
        llm_judge_calls: LLM Judge 호출 횟수
        model: 사용한 LLM 모델
    
    Returns:
        총 비용 (USD)
    """
    # 모델별 평균 비용 (1회 호출 기준)
    COST_PER_CALL = {
        'gpt-4': 0.035,          # ~1000 토큰 입출력
        'gpt-3.5-turbo': 0.008,
        'claude-3': 0.040
    }
    
    cost_per_call = COST_PER_CALL.get(model, 0.035)
    return round(llm_judge_calls * cost_per_call, 2)
```

## 4. 테스트

### 4.1 단위 테스트

```python
# tests/test_diagnosis_pipeline.py

import pytest
from evaluation_engine.diagnosis_pipeline import DiagnosisPipeline, FailedCaseData


def test_heuristic_filter_trivial_failure():
    """명백한 실패 케이스 자동 분류 테스트"""
    case = FailedCaseData(
        id="test-1",
        question="테스트 질문",
        expected_answer="정답",
        generated_answer="오답",
        retrieved_contexts=["컨텍스트"],
        scores={'answer_correctness': 0.1},  # < 0.2
        context_tokens=100
    )
    
    pipeline = DiagnosisPipeline(
        llm_judge_client=None,
        config={'enabled': True, 'mode': 'auto'}
    )
    
    ambiguous, heuristic = pipeline._apply_heuristic_filter([case])
    
    assert len(heuristic) == 1
    assert len(ambiguous) == 0
    assert heuristic[0].diagnosis_method == "Heuristic"


def test_sampling_auto_mode():
    """자동 샘플링 모드 테스트"""
    # 250개 케이스 → 20% 샘플링 예상
    cases = [
        FailedCaseData(
            id=f"case-{i}",
            question="질문",
            expected_answer="정답",
            generated_answer="오답",
            retrieved_contexts=["컨텍스트"],
            scores={'answer_correctness': 0.5},  # 애매한 케이스
            context_tokens=100
        )
        for i in range(250)
    ]
    
    pipeline = DiagnosisPipeline(
        llm_judge_client=None,
        config={'enabled': True, 'mode': 'auto'}
    )
    
    sampled = pipeline._apply_sampling(cases)
    
    # 20% ± 오차
    assert 45 <= len(sampled) <= 55  # 250 * 0.2 = 50


def test_cost_saving():
    """비용 절감 효과 테스트"""
    # 1000개 실패 케이스 시뮬레이션
    # - 70% 휴리스틱 분류 (700개)
    # - 30% 애매한 케이스 (300개) → 20% 샘플링 (60개)
    
    total_cases = 1000
    heuristic_classified = 700
    llm_judge_analyzed = 60
    
    # 전체 분석 시 예상 비용
    full_cost = total_cases * 0.035  # $35
    
    # 실제 비용
    actual_cost = llm_judge_analyzed * 0.035  # $2.1
    
    # 비용 절감율
    saving_rate = (1 - actual_cost / full_cost) * 100
    
    assert saving_rate > 90  # 90% 이상 절감
```

## 5. 모니터링

### 5.1 진단 파이프라인 메트릭

```python
# monitoring/diagnosis_metrics.py

def log_diagnosis_metrics(summary: Dict):
    """
    진단 파이프라인 메트릭 로깅
    """
    metrics = {
        'total_failed_cases': summary['total_failed'],
        'heuristic_classified': summary['heuristic_classified'],
        'llm_judge_analyzed': summary['llm_judge_analyzed'],
        'not_analyzed': summary['not_analyzed'],
        'diagnosis_cost': summary['diagnosis_cost'],
        'cost_saving_rate': calculate_saving_rate(summary),
        'heuristic_accuracy': calculate_heuristic_accuracy(summary)
    }
    
    # Prometheus, DataDog 등으로 전송
    send_to_monitoring(metrics)
```

## 6. 배포 체크리스트

- [ ] DB 스키마 마이그레이션 실행
- [ ] DiagnosisPipeline 클래스 구현
- [ ] FastAPI 엔드포인트 수정
- [ ] LLM Judge 클라이언트 연동
- [ ] 백그라운드 작업 업데이트
- [ ] 비용 계산 로직 추가
- [ ] 단위 테스트 작성
- [ ] 통합 테스트 실행
- [ ] 모니터링 설정
- [ ] 프로덕션 배포

## 7. 예상 효과

### 시나리오 1: 소규모 평가 (100개 QA)
- 실패 케이스: 30개
- 휴리스틱 분류: 20개 (67%)
- LLM Judge: 10개 (100% 분석)
- **비용: $0.35** (전체 분석 시 $1.05 → 67% 절감)

### 시나리오 2: 중규모 평가 (500개 QA)
- 실패 케이스: 150개
- 휴리스틱 분류: 100개 (67%)
- 애매한 케이스: 50개 → 샘플링 50%
- LLM Judge: 25개
- **비용: $0.88** (전체 분석 시 $5.25 → 83% 절감)

### 시나리오 3: 대규모 평가 (2000개 QA)
- 실패 케이스: 600개
- 휴리스틱 분류: 400개 (67%)
- 애매한 케이스: 200개 → 샘플링 20%
- LLM Judge: 40개
- **비용: $1.40** (전체 분석 시 $21.00 → 93% 절감)

## 8. 향후 개선 사항 (V1.5)

1. **적응형 샘플링**
   - 통계적 신뢰도 기반 샘플 크기 자동 조정
   - Sequential Sampling 기법 적용

2. **휴리스틱 개선**
   - 사용자 피드백 기반 임계값 자동 튜닝
   - 더 정교한 규칙 추가

3. **캐싱**
   - 동일한 케이스 재분석 방지
   - 해시 기반 결과 재활용

4. **예산 기반 샘플링**
   - 총 비용 한도 내에서 최대한 샘플링
   - 우선순위 기반 샘플링 (중요한 케이스 먼저)

## 참고 자료

- 프롬프트 전략: `/guidelines/LLM-Judge-Prompt-Strategy.md`
- 프론트엔드 가이드: `/guidelines/LLM-Judge-Sampling-UI-Guide.md`
- 타입 정의: `/types/index.ts`
