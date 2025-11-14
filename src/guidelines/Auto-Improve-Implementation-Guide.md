# Auto-Improve 구현 가이드

## 📋 목차
1. [Level 1 구현 예시 (권장)](#level-1-구현-예시-권장)
2. [백엔드 구현 (Python FastAPI)](#백엔드-구현-python-fastapi)
3. [프론트엔드 통합](#프론트엔드-통합)
4. [테스트 시나리오](#테스트-시나리오)

---

## Level 1 구현 예시 (권장)

### 1단계: 근본 원인 분석 (Root Cause Analysis)

#### 백엔드 로직 (Python)

```python
from typing import Dict, List, Literal
from dataclasses import dataclass

@dataclass
class RootCauseAnalysis:
    retrieval: Dict | None
    generation: Dict | None
    recommended_strategy: Literal['retrieval_first', 'generation_first', 'balanced']
    estimated_experiments: int
    estimated_cost: float
    estimated_duration_minutes: int

def analyze_root_cause(evaluation_result: dict) -> RootCauseAnalysis:
    """
    평가 결과를 분석하여 근본 원인을 파악하고 최적화 전략을 제안
    """
    scores = evaluation_result['scores']
    
    # 1. Retrieval 지표 분석
    retrieval_metrics = {
        'context_precision': scores.get('context_precision', 0),
        'context_recall': scores.get('context_recall', 0),
        'context_entity_recall': scores.get('context_entity_recall', 0)
    }
    retrieval_avg = sum(retrieval_metrics.values()) / len(retrieval_metrics)
    
    # 2. Generation 지표 분석
    generation_metrics = {
        'faithfulness': scores.get('faithfulness', 0),
        'answer_relevancy': scores.get('answer_relevancy', 0),
        'answer_correctness': scores.get('answer_correctness', 0),
        'coherence': scores.get('coherence', 0),
        'conciseness': scores.get('conciseness', 0)
    }
    generation_avg = sum(generation_metrics.values()) / len(generation_metrics)
    
    # 3. Severity 결정
    def get_severity(avg_score: float) -> str:
        if avg_score < 0.6:
            return 'high'
        elif avg_score < 0.75:
            return 'medium'
        else:
            return 'low'
    
    retrieval_severity = get_severity(retrieval_avg)
    generation_severity = get_severity(generation_avg)
    
    # 4. 우선순위 파라미터 결정
    retrieval_priority_params = []
    if retrieval_metrics['context_recall'] < 0.7:
        retrieval_priority_params.extend(['top_k', 'embedding_model'])
    if retrieval_metrics['context_precision'] < 0.7:
        retrieval_priority_params.extend(['chunk_size', 'top_k'])
    
    generation_priority_params = []
    if generation_metrics['faithfulness'] < 0.7:
        generation_priority_params.extend(['temperature', 'llm_model'])
    if generation_metrics['answer_correctness'] < 0.7:
        generation_priority_params.extend(['llm_model', 'max_tokens'])
    
    # 5. 전략 결정
    if retrieval_severity == 'high' and generation_severity != 'high':
        strategy = 'retrieval_first'
        estimated_experiments = 8
    elif generation_severity == 'high' and retrieval_severity != 'high':
        strategy = 'generation_first'
        estimated_experiments = 10
    else:
        strategy = 'balanced'
        estimated_experiments = 12
    
    # 6. 비용 및 시간 추정
    cost_per_experiment = 1.5  # $1.5 per evaluation (150 QA pairs)
    time_per_experiment = 15   # 15 minutes per evaluation
    
    return RootCauseAnalysis(
        retrieval={
            'severity': retrieval_severity,
            'affected_metrics': [
                k for k, v in retrieval_metrics.items() if v < 0.7
            ],
            'scores': retrieval_metrics,
            'priority_params': list(set(retrieval_priority_params))
        } if retrieval_severity != 'low' else None,
        generation={
            'severity': generation_severity,
            'affected_metrics': [
                k for k, v in generation_metrics.items() if v < 0.7
            ],
            'scores': generation_metrics,
            'priority_params': list(set(generation_priority_params))
        } if generation_severity != 'low' else None,
        recommended_strategy=strategy,
        estimated_experiments=estimated_experiments,
        estimated_cost=estimated_experiments * cost_per_experiment,
        estimated_duration_minutes=estimated_experiments * time_per_experiment
    )
```

#### FastAPI 엔드포인트

```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/auto-improve", tags=["auto-improve"])

class AnalyzeRequest(BaseModel):
    evaluation_id: str
    target_metrics: list[str] | None = None

@router.post("/analyze")
async def analyze_root_cause_endpoint(request: AnalyzeRequest):
    """
    근본 원인 분석 API
    """
    # 1. 평가 결과 조회
    evaluation = await get_evaluation_by_id(request.evaluation_id)
    
    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    
    if evaluation['status'] != 'completed':
        raise HTTPException(
            status_code=400, 
            detail="Evaluation must be completed"
        )
    
    # 2. 근본 원인 분석 수행
    analysis = analyze_root_cause(evaluation)
    
    # 3. 결과 반환
    return {
        "success": True,
        "data": {
            "root_causes": {
                "retrieval": analysis.retrieval,
                "generation": analysis.generation
            },
            "recommended_strategy": analysis.recommended_strategy,
            "estimated_experiments": analysis.estimated_experiments,
            "estimated_cost": analysis.estimated_cost,
            "estimated_duration_minutes": analysis.estimated_duration_minutes
        }
    }
```

---

### 2단계: 실험 조합 생성 (Smart Grid Search)

#### 백엔드 로직

```python
from typing import List, Dict
from itertools import product

def generate_retrieval_first_experiments(
    baseline_config: dict,
    priority_params: List[str]
) -> List[Dict]:
    """
    Retrieval 우선 최적화 전략
    """
    experiments = []
    current_config = baseline_config.copy()
    
    # Phase 1: Top-K 최적화 (3-4회)
    if 'top_k' in priority_params:
        for top_k in [3, 5, 10, 15]:
            exp_config = current_config.copy()
            exp_config['top_k'] = top_k
            experiments.append({
                'name': f'Top-K={top_k}',
                'config': exp_config,
                'phase': 'retrieval_top_k'
            })
        
        # 최고 성능 Top-K 값 결정 (시뮬레이션)
        # 실제로는 평가 후 결정
        current_config['top_k'] = 5
    
    # Phase 2: Chunk Size 최적화 (3-4회)
    if 'chunk_size' in priority_params:
        for chunk_size in [128, 256, 512, 1024]:
            if chunk_size == baseline_config.get('chunk_size'):
                continue
            exp_config = current_config.copy()
            exp_config['chunk_size'] = chunk_size
            experiments.append({
                'name': f'ChunkSize={chunk_size}',
                'config': exp_config,
                'phase': 'retrieval_chunk_size'
            })
        
        current_config['chunk_size'] = 512
    
    # Phase 3: Embedding Model 변경 (2-3회)
    if 'embedding_model' in priority_params:
        for model in ['text-embedding-3-small', 'text-embedding-3-large']:
            if model == baseline_config.get('embedding_model'):
                continue
            exp_config = current_config.copy()
            exp_config['embedding_model'] = model
            experiments.append({
                'name': f'Embedding={model}',
                'config': exp_config,
                'phase': 'retrieval_embedding'
            })
    
    return experiments[:12]  # 최대 12개 실험

def generate_generation_first_experiments(
    baseline_config: dict,
    priority_params: List[str]
) -> List[Dict]:
    """
    Generation 우선 최적화 전략
    """
    experiments = []
    current_config = baseline_config.copy()
    
    # Phase 1: Temperature 최적화 (4-5회)
    if 'temperature' in priority_params:
        for temp in [0.1, 0.3, 0.5, 0.7, 0.9]:
            exp_config = current_config.copy()
            exp_config['temperature'] = temp
            experiments.append({
                'name': f'Temperature={temp}',
                'config': exp_config,
                'phase': 'generation_temperature'
            })
        
        current_config['temperature'] = 0.3
    
    # Phase 2: LLM Model 변경 (3-4회)
    if 'llm_model' in priority_params:
        for model in ['GPT-4o', 'GPT-4o-mini', 'Claude-3.5 Sonnet', 'Claude-3 Opus']:
            if model == baseline_config.get('llm_model'):
                continue
            exp_config = current_config.copy()
            exp_config['llm_model'] = model
            experiments.append({
                'name': f'LLM={model}',
                'config': exp_config,
                'phase': 'generation_llm'
            })
        
        current_config['llm_model'] = 'Claude-3.5 Sonnet'
    
    # Phase 3: Max Tokens 조정 (3-4회)
    if 'max_tokens' in priority_params:
        for tokens in [128, 256, 512, 1024]:
            if tokens == baseline_config.get('max_tokens'):
                continue
            exp_config = current_config.copy()
            exp_config['max_tokens'] = tokens
            experiments.append({
                'name': f'MaxTokens={tokens}',
                'config': exp_config,
                'phase': 'generation_max_tokens'
            })
    
    return experiments[:12]

def generate_balanced_experiments(
    baseline_config: dict,
    retrieval_params: List[str],
    generation_params: List[str]
) -> List[Dict]:
    """
    균형 잡힌 최적화 전략
    """
    experiments = []
    
    # Retrieval (6회)
    ret_exp = generate_retrieval_first_experiments(baseline_config, retrieval_params)
    experiments.extend(ret_exp[:6])
    
    # Generation (6회)
    gen_exp = generate_generation_first_experiments(baseline_config, generation_params)
    experiments.extend(gen_exp[:6])
    
    return experiments[:12]
```

#### FastAPI 엔드포인트

```python
class GenerateExperimentsRequest(BaseModel):
    base_evaluation_id: str
    strategy: Literal['retrieval_first', 'generation_first', 'balanced']
    optimization_level: Literal['rule_based'] = 'rule_based'
    budget: dict | None = None

@router.post("/generate-experiments")
async def generate_experiments_endpoint(request: GenerateExperimentsRequest):
    """
    실험 조합 생성 API
    """
    # 1. 기준 평가 조회
    baseline_eval = await get_evaluation_by_id(request.base_evaluation_id)
    
    if not baseline_eval:
        raise HTTPException(status_code=404, detail="Baseline evaluation not found")
    
    # 2. 근본 원인 분석
    analysis = analyze_root_cause(baseline_eval)
    
    # 3. 전략에 따라 실험 생성
    if request.strategy == 'retrieval_first':
        retrieval_params = analysis.retrieval['priority_params'] if analysis.retrieval else []
        experiments = generate_retrieval_first_experiments(
            baseline_eval['config'],
            retrieval_params
        )
    elif request.strategy == 'generation_first':
        generation_params = analysis.generation['priority_params'] if analysis.generation else []
        experiments = generate_generation_first_experiments(
            baseline_eval['config'],
            generation_params
        )
    else:  # balanced
        retrieval_params = analysis.retrieval['priority_params'] if analysis.retrieval else []
        generation_params = analysis.generation['priority_params'] if analysis.generation else []
        experiments = generate_balanced_experiments(
            baseline_eval['config'],
            retrieval_params,
            generation_params
        )
    
    # 4. 예산 제약 적용
    if request.budget:
        max_exp = request.budget.get('max_experiments')
        if max_exp and len(experiments) > max_exp:
            experiments = experiments[:max_exp]
    
    # 5. Job ID 생성
    job_id = f"auto-improve-job-{uuid.uuid4()}"
    
    # 6. 데이터베이스에 저장
    await save_auto_improve_job({
        'job_id': job_id,
        'base_evaluation_id': request.base_evaluation_id,
        'strategy': request.strategy,
        'experiments': experiments,
        'status': 'pending'
    })
    
    return {
        "success": True,
        "data": {
            "job_id": job_id,
            "experiments": [
                {
                    "id": f"exp-{i+1}",
                    "name": exp['name'],
                    "config": exp['config'],
                    "order": i + 1
                }
                for i, exp in enumerate(experiments)
            ],
            "total_experiments": len(experiments),
            "estimated_cost": len(experiments) * 1.5,
            "estimated_duration_minutes": len(experiments) * 15
        }
    }
```

---

### 3단계: 평가 실행 및 Early Stopping

#### Celery 태스크 (비동기 평가)

```python
from celery import Celery, Task
import redis

celery_app = Celery('rex', broker='redis://localhost:6379/0')
redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)

class EarlyStoppingChecker:
    def __init__(self, config: dict):
        self.min_improvement = config.get('min_improvement', 0.05)
        self.patience = config.get('patience', 3)
        self.target_score = config.get('target_score', 0.9)
        self.no_improvement_count = 0
        self.best_score = 0.0
    
    def should_stop(self, current_score: float) -> tuple[bool, str]:
        """
        조기 종료 여부 판단
        Returns: (should_stop, reason)
        """
        # 목표 점수 달성
        if current_score >= self.target_score:
            return True, f"목표 점수 {self.target_score} 달성!"
        
        # 개선 확인
        improvement = (current_score - self.best_score) / self.best_score if self.best_score > 0 else 0
        
        if improvement >= self.min_improvement:
            # 개선됨
            self.best_score = current_score
            self.no_improvement_count = 0
            return False, ""
        else:
            # 개선 없음
            self.no_improvement_count += 1
            
            if self.no_improvement_count >= self.patience:
                return True, f"{self.patience}회 연속 개선 없음"
        
        return False, ""

@celery_app.task(bind=True)
def run_auto_improve_job(self: Task, job_id: str, config: dict):
    """
    자동 개선 작업 실행 (Celery Task)
    """
    job = get_auto_improve_job(job_id)
    experiments = job['experiments']
    baseline_score = job['baseline_score']
    
    early_stopping = EarlyStoppingChecker(config.get('early_stopping', {}))
    completed_experiments = []
    best_config = None
    best_score = baseline_score
    
    for i, experiment in enumerate(experiments):
        # 진행 상황 발행 (Redis Pub/Sub)
        redis_client.publish(
            f"auto-improve-{job_id}",
            json.dumps({
                'type': 'experiment_start',
                'experiment_id': experiment['id'],
                'experiment_name': experiment['name'],
                'progress': int((i / len(experiments)) * 100)
            })
        )
        
        # 평가 실행
        try:
            eval_result = run_evaluation(experiment['config'])
            current_score = eval_result['avg_score']
            
            experiment_result = {
                **experiment,
                'score': current_score,
                'scores': eval_result['scores'],
                'status': 'completed'
            }
            completed_experiments.append(experiment_result)
            
            # 최고 점수 업데이트
            if current_score > best_score:
                best_score = current_score
                best_config = experiment['config']
            
            # Early Stopping 체크
            should_stop, reason = early_stopping.should_stop(current_score)
            
            if should_stop:
                redis_client.publish(
                    f"auto-improve-{job_id}",
                    json.dumps({
                        'type': 'early_stopping',
                        'reason': reason,
                        'experiments_completed': i + 1
                    })
                )
                break
        
        except Exception as e:
            # 실험 실패
            experiment_result = {
                **experiment,
                'status': 'failed',
                'error': str(e)
            }
            completed_experiments.append(experiment_result)
    
    # 최종 결과 저장
    final_result = {
        'job_id': job_id,
        'status': 'completed',
        'experiments_completed': len(completed_experiments),
        'best_config': best_config,
        'improvement': {
            'baseline_score': baseline_score,
            'best_score': best_score,
            'improvement_rate': (best_score - baseline_score) / baseline_score
        },
        'detailed_results': completed_experiments
    }
    
    save_auto_improve_result(job_id, final_result)
    
    # 완료 알림
    redis_client.publish(
        f"auto-improve-{job_id}",
        json.dumps({
            'type': 'job_completed',
            'best_score': best_score,
            'improvement_rate': final_result['improvement']['improvement_rate']
        })
    )
    
    return final_result
```

---

## 프론트엔드 통합

### AutoImproveSetupPage 수정

```typescript
// components/AutoImproveSetupPageBlue.tsx
import { useState, useEffect } from 'react';
import { api } from '../lib/api-client';
import { RootCauseAnalysis } from '../types';

export function AutoImproveSetupPageBlue() {
  const [baseEvaluationId, setBaseEvaluationId] = useState('');
  const [rootCauseAnalysis, setRootCauseAnalysis] = useState<RootCauseAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // 근본 원인 분석 실행
  const handleAnalyze = async () => {
    if (!baseEvaluationId) return;
    
    setIsAnalyzing(true);
    try {
      const response = await api.autoImprove.analyzeRootCause({
        evaluation_id: baseEvaluationId
      });
      
      if (response.success && response.data) {
        setRootCauseAnalysis(response.data);
      }
    } catch (error) {
      console.error('Failed to analyze root cause:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // 자동 개선 시작
  const handleStartAutoImprove = async () => {
    if (!baseEvaluationId || !rootCauseAnalysis) return;
    
    try {
      const response = await api.autoImprove.create({
        base_evaluation_id: baseEvaluationId,
        strategy: rootCauseAnalysis.recommended_strategy,
        optimization_level: 'rule_based',
        early_stopping: {
          enabled: true,
          min_improvement: 0.05,
          patience: 3,
          target_score: 0.9
        }
      });
      
      if (response.success && response.data) {
        // Progress 페이지로 이동
        onNavigate('progress', response.data.job_id);
      }
    } catch (error) {
      console.error('Failed to start auto-improve:', error);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* 1. 기준 평가 선택 */}
      <Card>
        <CardHeader>
          <CardTitle>1. 기준 평가 선택</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={baseEvaluationId} onValueChange={setBaseEvaluationId}>
            {/* ... */}
          </Select>
          
          <Button 
            onClick={handleAnalyze} 
            disabled={!baseEvaluationId || isAnalyzing}
            className="mt-4"
          >
            {isAnalyzing ? '분석 중...' : '근본 원인 분석'}
          </Button>
        </CardContent>
      </Card>
      
      {/* 2. 근본 원인 분석 결과 */}
      {rootCauseAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle>2. 분석 결과</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Retrieval 문제 */}
              {rootCauseAnalysis.root_causes?.retrieval && (
                <div className="p-4 bg-cyan-50 rounded-lg">
                  <h4 className="font-semibold text-cyan-900">검색 품질 개선 필요</h4>
                  <p className="text-sm text-cyan-700 mt-1">
                    심각도: {rootCauseAnalysis.root_causes.retrieval.severity}
                  </p>
                  <p className="text-sm text-cyan-700">
                    영향 받은 지표: {rootCauseAnalysis.root_causes.retrieval.affected_metrics.join(', ')}
                  </p>
                  <p className="text-sm text-cyan-700">
                    우선 최적화 파라미터: {rootCauseAnalysis.root_causes.retrieval.priority_params.join(', ')}
                  </p>
                </div>
              )}
              
              {/* Generation 문제 */}
              {rootCauseAnalysis.root_causes?.generation && (
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-900">생성 품질 개선 필요</h4>
                  <p className="text-sm text-purple-700 mt-1">
                    심각도: {rootCauseAnalysis.root_causes.generation.severity}
                  </p>
                  <p className="text-sm text-purple-700">
                    영향 받은 지표: {rootCauseAnalysis.root_causes.generation.affected_metrics.join(', ')}
                  </p>
                  <p className="text-sm text-purple-700">
                    우선 최적화 파라미터: {rootCauseAnalysis.root_causes.generation.priority_params.join(', ')}
                  </p>
                </div>
              )}
              
              {/* 추정 정보 */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-xs text-blue-600">예상 실험 횟수</p>
                  <p className="text-xl font-semibold text-blue-900">
                    {rootCauseAnalysis.estimated_experiments}회
                  </p>
                </div>
                <div>
                  <p className="text-xs text-blue-600">예상 비용</p>
                  <p className="text-xl font-semibold text-blue-900">
                    ${rootCauseAnalysis.estimated_cost.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-blue-600">예상 소요 시간</p>
                  <p className="text-xl font-semibold text-blue-900">
                    {Math.floor(rootCauseAnalysis.estimated_duration_minutes / 60)}시간 {rootCauseAnalysis.estimated_duration_minutes % 60}분
                  </p>
                </div>
              </div>
              
              {/* 시작 버튼 */}
              <Button 
                onClick={handleStartAutoImprove}
                className="w-full"
              >
                자동 개선 시작 ({rootCauseAnalysis.recommended_strategy})
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

---

## 테스트 시나리오

### 시나리오 1: Retrieval 문제 중심

**초기 상태:**
```json
{
  "context_recall": 0.62,
  "context_precision": 0.68,
  "faithfulness": 0.82,
  "answer_relevancy": 0.85
}
```

**예상 동작:**
1. 근본 원인 분석 → `retrieval_first` 전략 선택
2. 실험 순서:
   - Top-K=3 (0.65점)
   - Top-K=5 (0.72점) ← 개선!
   - Top-K=10 (0.75점) ← 개선!
   - Top-K=15 (0.74점)
   - Chunk Size=256 (Top-K=10) (0.78점) ← 개선!
   - Chunk Size=1024 (0.76점)
   - Embedding=3-large (0.85점) ← 개선!
3. Early Stopping: 3회 연속 개선 없음 → 8번째 실험에서 종료
4. 최종 개선율: +37% (0.62 → 0.85)

### 시나리오 2: Generation 문제 중심

**초기 상태:**
```json
{
  "context_recall": 0.85,
  "faithfulness": 0.65,
  "answer_correctness": 0.68,
  "coherence": 0.72
}
```

**예상 동작:**
1. 근본 원인 분석 → `generation_first` 전략 선택
2. 실험 순서:
   - Temperature=0.1 (0.70점) ← 개선!
   - Temperature=0.3 (0.75점) ← 개선!
   - Temperature=0.5 (0.73점)
   - Temperature=0.7 (0.68점)
   - LLM=Claude-3.5 Sonnet (Temp=0.3) (0.88점) ← 개선!
3. Early Stopping: 목표 점수 0.9에 근접 → 6번째 실험에서 종료
4. 최종 개선율: +35% (0.65 → 0.88)

---

## 다음 단계

1. **백엔드 구현** (Week 1-2)
   - [ ] 근본 원인 분석 로직
   - [ ] 실험 생성 로직
   - [ ] Celery 태스크
   - [ ] WebSocket 서버

2. **프론트엔드 통합** (Week 2-3)
   - [ ] AutoImproveSetupPage API 연동
   - [ ] AutoImproveProgressPage WebSocket 연동
   - [ ] AutoImproveResultsPage 결과 시각화

3. **테스트** (Week 3-4)
   - [ ] 유닛 테스트
   - [ ] 통합 테스트
   - [ ] End-to-End 테스트

4. **배포** (Week 4)
   - [ ] Staging 환경 배포
   - [ ] 성능 테스트
   - [ ] Production 배포

---

**질문이나 추가 설명이 필요하면 언제든 말씀해주세요!**
