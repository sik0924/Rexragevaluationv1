# 종합 점수 분석 알고리즘 명세서

## 📊 개요

RAG 성능 평가 결과의 종합 점수를 **5단계 등급 체계**로 분류하고, 이전 평가와 비교하여 **자동화된 인사이트**를 제공하는 알고리즘입니다.

---

## 🎯 1. 점수 등급 체계 (Score Grading System)

### 1.1 5단계 등급 정의

| 등급 | 점수 범위 | 영문명 | 설명 | 권장 조치 | 배지 색상 |
|------|----------|--------|------|----------|----------|
| 🏆 탁월 | 95-100점 | Excellent | 모든 평가 지표에서 최상위 성능을 보이며, 현존하는 최적의 RAG 파이프라인으로 즉시 프로덕션 배포가 가능함 | 현행 설정 유지 및 핵심 지표 정기 모니터링을 통한 성능 기준(Baseline) 확립 | Green |
| ✅ 우수 | 85-94점 | Good | 안정적인 성능을 확보하였으며, 사소한 튜닝 또는 A/B 테스트 후 단기 배포 가능한 수준 | 성능 저하 위험 요소 점검 (Failed Cases 분석), 선택적 최적화 이후 배포 승인 | Blue |
| ⚠️ 주의 | 70-84점 | Fair | 일부 핵심 지표에서 개선의 여지가 명확하며, 잠재적 리스크를 안고 있어 튜닝 및 재평가가 필수적임 | 즉시 주의 지표(Alerting Metric) 식별 및 해당 파이프라인 컴포넌트(청킹, 프롬프트) 집중 튜닝 실행 | Yellow |
| 🔴 미흡 | 60-69점 | Poor | 중대한 결함이 발견되었거나, 환각(Hallucination) 및 검색 오류율이 높아 신뢰성 확보가 어려운 수준 | 긴급 문제 분석 (Root Cause Analysis)을 통한 근본 원인 파악 및 주요 파라미터 개선 루프 (Auto-Improvement) 실행 | Orange |
| 🚨 심각 | 0-59점 | Critical | RAG 파이프라인의 구조적 결함 또는 기본 설정 오류로 판단되며, 운영 환경 배포 시 심각한 비즈니스 리스크를 초래함 | 전면 재검토 및 아키텍처 재설계 필수. 데이터셋 품질, 임베딩 모델 선택, 프롬프트 전략 등 기반 요소 재확인 | Red |

### 1.2 등급별 상세 가이드

#### 🏆 탁월 (95-100점)
```yaml
특징:
  - 모든 핵심 지표가 90점 이상
  - Retrieval/Generation 모두 최상위 성능
  - 안전성 지표 만점에 근접
  - 현존하는 최적의 RAG 파이프라인

권장 사항:
  - 현행 설정 문서화 및 베스트 프랙티스 공유
  - 핵심 지표 정기 모니터링을 통한 성능 기준(Baseline) 확립
  - A/B 테스트로 지속적 품질 보증
  - 엣지 케이스 추가 검증

비즈니스 의미:
  - 사용자 만족도 95% 이상 예상
  - 즉시 프로덕션 배포 승인 가능
  - 경쟁사 대비 기술적 우위 확보
  - 산업 벤치마크 기준 설정 가능
```

#### ✅ 우수 (85-94점)
```yaml
특징:
  - 대부분 지표가 80점 이상
  - 안정적인 성능 확보
  - 프로덕션 배포 가능 수준
  - 사소한 튜닝 여지 존재

권장 사항:
  - 성능 저하 위험 요소 점검 (Failed Cases 심층 분석)
  - 70점 미만 지표 선택적 최적화
  - A/B 테스트 또는 카나리 배포 전략 수립
  - 배포 승인 후 2주 내 프로덕션 반영

비즈니스 의미:
  - 사용자 만족도 85-95% 예상
  - 사소한 불편 사항 존재 가능
  - 단기 배포 후 지속 개선으로 탁월 등급 달성 가능
```

#### ⚠️ 주의 (70-84점)
```yaml
특징:
  - 일부 핵심 지표에서 명확한 개선 여지 존재
  - Retrieval 또는 Generation 중 한 영역 부족
  - 잠재적 리스크를 안고 있는 상태
  - 튜닝 및 재평가 필수

권장 사항:
  - 즉시 주의 지표(Alerting Metric) 식별 및 우선순위 설정
  - 해당 파이프라인 컴포넌트(청킹, 프롬프트, 검색 전략) 집중 튜닝
  - 자동 개선 기능(Auto-Improvement) 실험 시작
  - 1개월 내 85점 이상 목표 설정 및 추적

비즈니스 의미:
  - 사용자 만족도 70-85% 예상
  - 일부 사용자 불만 발생 가능
  - 개선 여지 충분, ROI 높음
  - 배포 시 리스크 관리 필요
```

#### 🔴 미흡 (60-69점)
```yaml
특징:
  - 중대한 결함 발견
  - 환각(Hallucination) 및 검색 오류율 높음
  - 다수 지표가 임계값 미달
  - 신뢰성 확보 어려움

권장 사항:
  - 긴급 문제 분석 (Root Cause Analysis) 회의 소집
  - 근본 원인 파악 (데이터 품질, 모델 선택, 프롬프트 설계)
  - 주요 파라미터 개선 루프 (Auto-Improvement) 즉시 실행
  - 배포 연기, 2-4주 집중 개선 기간 설정

비즈니스 의미:
  - 사용자 만족도 60% 미만 예상
  - 사용자 이탈 위험 높음
  - 평판 리스크 존재
  - 배포 시 비즈니스 손실 가능
```

#### 🚨 심각 (0-59점)
```yaml
특징:
  - RAG 파이프라인의 구조적 결함 또는 기본 설정 오류
  - 대부분 지표 실패
  - 시스템 전반 문제
  - 운영 환경 배포 시 심각한 비즈니스 리스크

권장 사항:
  - 전면 재검토 및 아키텍처 재설계 필수
  - 데이터셋 품질 검증 (중복, 노이즈, 불완전성)
  - 임베딩 모델 선택, 프롬프트 전략 등 기반 요소 재확인
  - Vector DB, LLM 모델 교체 검토
  - 3-6개월 장기 개선 계획 수립

비즈니스 의미:
  - 배포 불가
  - 프로젝트 재기획 필요
  - 대체 솔루션 또는 외부 전문가 컨설팅 검토
  - 비즈니스 목표 재평가
```

---

## 📈 2. 히스토리 비교 로직 (Historical Comparison Logic)

### 2.1 비교 알고리즘

```typescript
interface ComparisonResult {
  scoreDelta: number;           // 점수 변화량 (현재 - 이전)
  gradeChange: string;          // 등급 변화 (예: "양호 → 우수")
  trend: 'improving' | 'stable' | 'degrading';  // 트렌드
  topImprovement: string;       // 가장 개선된 지표
  topRegression: string;        // 가장 악화된 지표
  insight: string;              // 자동 생성 인사이트
}

function compareEvaluations(current: Evaluation, previous: Evaluation): ComparisonResult {
  // 1. 점수 변화 계산
  const scoreDelta = current.avgScore - previous.avgScore;
  
  // 2. 등급 변화 감지
  const currentGrade = getScoreGrade(current.avgScore);
  const previousGrade = getScoreGrade(previous.avgScore);
  
  // 3. 트렌드 판단
  const trend = scoreDelta > 2 ? 'improving' 
              : scoreDelta < -2 ? 'degrading' 
              : 'stable';
  
  // 4. 지표별 변화 분석
  const metricDeltas = calculateMetricDeltas(current, previous);
  const topImprovement = findTopChange(metricDeltas, 'max');
  const topRegression = findTopChange(metricDeltas, 'min');
  
  // 5. 인사이트 생성
  const insight = generateInsight(scoreDelta, gradeChange, topImprovement, topRegression);
  
  return { scoreDelta, gradeChange, trend, topImprovement, topRegression, insight };
}
```

### 2.2 트렌드 판단 기준

| 점수 변화 | 트렌드 | 아이콘 | 설명 |
|----------|--------|--------|------|
| +5점 이상 | 🚀 급상승 | TrendingUp (Green) | 대폭 개선, 핵심 문제 해결됨 |
| +2 ~ +4점 | 📈 개선 | TrendingUp (Blue) | 점진적 개선, 올바른 방향 |
| -1 ~ +1점 | ➡️ 유지 | Minus (Gray) | 안정적, 추가 최적화 고려 |
| -2 ~ -4점 | 📉 악화 | TrendingDown (Orange) | 회귀 감지, 원인 분석 필요 |
| -5점 이하 | ⚠️ 급락 | AlertTriangle (Red) | 심각한 문제, 긴급 조치 필요 |

### 2.3 지표별 변화 분석

```typescript
interface MetricChange {
  metricId: string;
  metricName: string;
  delta: number;              // 점수 변화
  percentChange: number;      // 변화율 (%)
  impact: 'high' | 'medium' | 'low';  // 영향도
}

function calculateMetricDeltas(current: Evaluation, previous: Evaluation): MetricChange[] {
  const changes: MetricChange[] = [];
  
  for (const [metricId, currentScore] of Object.entries(current.scores)) {
    const previousScore = previous.scores[metricId] || 0;
    const delta = (currentScore - previousScore) * 100;
    const percentChange = previousScore > 0 ? (delta / (previousScore * 100)) * 100 : 0;
    
    // 영향도 판단: Context Precision, Faithfulness는 high
    const impact = ['context_precision', 'faithfulness', 'answer_correctness'].includes(metricId)
      ? 'high'
      : delta > 10 ? 'medium' : 'low';
    
    changes.push({
      metricId,
      metricName: getMetricName(metricId),
      delta,
      percentChange,
      impact
    });
  }
  
  return changes.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
}
```

---

## 💡 3. 자동 인사이트 생성 규칙 (Insight Generation Rules)

### 3.1 인사이트 템플릿

#### 등급 상승 (Grade Upgrade)
```
"{이전등급}에서 {현재등급}으로 개선되었습니다! 🎉
{주요개선지표}가 +{점수}점 상승하여 전체 성능이 향상되었습니다.
{추가조언}"
```

**예시:**
```
"주의에서 우수로 개선되었습니다! 🎉
Faithfulness가 +12점 상승하여 전체 성능이 향상되었습니다.
Context Precision을 추가 개선하면 탁월 등급 달성 가능합니다."
```

#### 등급 유지 (Grade Maintained)
```
"{현재등급} 등급을 유지하고 있습니다. 
{긍정요소} 그러나 {개선요소}에 주의가 필요합니다."
```

**예시:**
```
"우수 등급을 유지하고 있습니다.
Answer Relevancy가 안정적으로 유지되고 있습니다. 그러나 Conciseness가 -3점 하락하여 주의가 필요합니다."
```

#### 등급 하락 (Grade Downgrade)
```
"⚠️ {이전등급}에서 {현재등급}으로 하락했습니다.
{주요악화지표}가 -{점수}점 하락한 것이 주요 원인입니다.
{긴급조치}: {구체적개선방안}"
```

**예시:**
```
"⚠️ 우수에서 주의로 하락했습니다.
Context Precision이 -15점 하락한 것이 주요 원인입니다.
긴급조치: 즉시 주의 지표(Alerting Metric) 식별 및 Auto-Improvement 실행하세요."
```

### 3.2 인사이트 생성 의사결정 트리

```
IF scoreDelta >= 5:
  → "급상승! {topImprovement} 개선 성공"
  
ELIF scoreDelta >= 2 AND gradeChange:
  → "등급 상승! {gradeChange} 달성"
  
ELIF scoreDelta >= 2:
  → "점진적 개선 추세"
  
ELIF -1 < scoreDelta < 2:
  IF hasRegression:
    → "안정적 유지, 그러나 {topRegression} 주의"
  ELSE:
    → "안정적 성능 유지"
    
ELIF scoreDelta <= -5:
  → "급락 경고! {topRegression} 긴급 점검 필요"
  
ELIF scoreDelta <= -2 AND gradeChange:
  → "등급 하락! {gradeChange} 원인 분석 필요"
  
ELSE:
  → "소폭 하락, {topRegression} 모니터링"
```

### 3.3 도메인별 특화 인사이트

#### Retrieval 문제 감지
```
IF context_precision < 0.7 OR context_recall < 0.7:
  insight += "
  🔍 검색 품질 개선 방안:
  - Chunk Size: 현재 512 → 1024로 증가
  - Top-K: 현재 3 → 5로 확대
  - Hybrid Search (BM25 + Vector) 활성화
  - Reranking 모델 적용 검토
  "
```

#### Generation 문제 감지
```
IF faithfulness < 0.8 OR answer_correctness < 0.8:
  insight += "
  💬 생성 품질 개선 방안:
  - Temperature: 현재 0.7 → 0.3으로 감소
  - 프롬프트에 '반드시 제공된 컨텍스트만 사용' 제약 추가
  - System Message에 사실 충실성 강조
  - Few-shot 예시 추가 (정확한 답변 패턴)
  "
```

#### 안전성 문제 감지
```
IF harmfulness > 0.1 OR maliciousness > 0.1:
  insight += "
  ⚠️ 안전성 문제 감지! 즉시 조치 필요:
  - 유해성 필터링 강화
  - Content Moderation API 통합
  - 안전 가드레일 프롬프트 추가
  - 배포 연기 권고
  "
```

---

## 🔧 4. 백엔드 구현 가이드

### 4.1 API 엔드포인트

#### `GET /api/evaluations/{id}/analysis`
```json
{
  "evaluationId": "eval-123",
  "score": 87.3,
  "grade": {
    "level": "good",
    "label": "우수",
    "emoji": "✅",
    "color": "blue",
    "description": "사소한 조정 후 배포 가능한 양호한 성능",
    "recommendation": "선택적 최적화, 2주 내 배포 가능"
  },
  "comparison": {
    "previousEvaluationId": "eval-122",
    "scoreDelta": 5.2,
    "gradeChange": "양호 → 우수",
    "trend": "improving",
    "trendIcon": "trending_up",
    "topImprovement": {
      "metricId": "faithfulness",
      "metricName": "Faithfulness",
      "delta": 12.0,
      "percentChange": 15.8
    },
    "topRegression": {
      "metricId": "conciseness",
      "metricName": "Conciseness",
      "delta": -3.0,
      "percentChange": -3.8
    }
  },
  "insights": [
    {
      "type": "grade_upgrade",
      "severity": "info",
      "message": "양호에서 우수로 개선되었습니다! 🎉 Faithfulness가 +12점 상승하여 전체 성능이 향상되었습니다.",
      "actionable": "Context Precision을 추가 개선하면 탁월 등급 달성 가능합니다."
    },
    {
      "type": "metric_improvement",
      "severity": "success",
      "message": "Faithfulness: 76점 → 88점 (+12점)",
      "detail": "프롬프트 개선으로 사실 충실성이 크게 향상됨"
    },
    {
      "type": "metric_warning",
      "severity": "warning",
      "message": "Conciseness: 82점 → 79점 (-3점)",
      "detail": "답변 길이가 증가하여 간결성 소폭 하락"
    }
  ],
  "breakdown": {
    "retrieval": {
      "avgScore": 82.3,
      "grade": "fair",
      "trend": "stable",
      "bottleneck": "context_precision"
    },
    "generation": {
      "avgScore": 92.1,
      "grade": "good",
      "trend": "improving",
      "strength": "faithfulness"
    }
  },
  "recommendations": [
    {
      "priority": "high",
      "category": "retrieval",
      "title": "검색 정확도 개선",
      "description": "Context Precision이 65점으로 임계값 미달",
      "actions": [
        "Chunk Size를 512에서 1024로 증가",
        "Top-K를 3에서 5로 확대",
        "Hybrid Search 활성화"
      ],
      "expectedImpact": "+8~10점"
    }
  ]
}
```

### 4.2 데이터베이스 스키마

```sql
-- 평가 분석 결과 테이블
CREATE TABLE evaluation_analysis (
  id SERIAL PRIMARY KEY,
  evaluation_id INTEGER REFERENCES evaluations(id) NOT NULL,
  score DECIMAL(5,2) NOT NULL,
  grade VARCHAR(20) NOT NULL,  -- excellent, good, fair, poor, critical
  grade_label VARCHAR(50) NOT NULL,  -- 탁월, 우수, 양호, 미흡, 심각
  
  -- 비교 데이터
  previous_evaluation_id INTEGER REFERENCES evaluations(id),
  score_delta DECIMAL(5,2),
  grade_change VARCHAR(100),
  trend VARCHAR(20),  -- improving, stable, degrading
  
  -- 인사이트 (JSON)
  insights JSONB,
  
  -- 분야별 분석
  retrieval_score DECIMAL(5,2),
  retrieval_grade VARCHAR(20),
  generation_score DECIMAL(5,2),
  generation_grade VARCHAR(20),
  
  -- 권장 사항
  recommendations JSONB,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_evaluation_analysis_eval_id ON evaluation_analysis(evaluation_id);
CREATE INDEX idx_evaluation_analysis_grade ON evaluation_analysis(grade);
```

### 4.3 분석 함수 (Python 예시)

```python
from typing import Dict, List, Optional
from dataclasses import dataclass
from enum import Enum

class ScoreGrade(Enum):
    EXCELLENT = ("excellent", "탁월", "🏆", 95, 100)
    GOOD = ("good", "우수", "✅", 85, 94)
    FAIR = ("fair", "양호", "⚠️", 70, 84)
    POOR = ("poor", "미흡", "🔴", 60, 69)
    CRITICAL = ("critical", "심각", "🚨", 0, 59)
    
    def __init__(self, level, label, emoji, min_score, max_score):
        self.level = level
        self.label = label
        self.emoji = emoji
        self.min_score = min_score
        self.max_score = max_score
    
    @classmethod
    def from_score(cls, score: float) -> 'ScoreGrade':
        for grade in cls:
            if grade.min_score <= score <= grade.max_score:
                return grade
        return cls.CRITICAL

@dataclass
class EvaluationAnalysis:
    evaluation_id: str
    score: float
    grade: ScoreGrade
    comparison: Optional[Dict]
    insights: List[Dict]
    breakdown: Dict
    recommendations: List[Dict]

def analyze_evaluation(
    evaluation: Dict,
    previous_evaluation: Optional[Dict] = None
) -> EvaluationAnalysis:
    """평가 결과를 종합 분석"""
    
    # 1. 등급 산정
    score = evaluation['avg_score']
    grade = ScoreGrade.from_score(score)
    
    # 2. 이전 평가와 비교 (있는 경우)
    comparison = None
    if previous_evaluation:
        comparison = compare_evaluations(evaluation, previous_evaluation)
    
    # 3. 인사이트 생성
    insights = generate_insights(evaluation, comparison)
    
    # 4. Retrieval/Generation 분석
    breakdown = analyze_breakdown(evaluation)
    
    # 5. 개선 권장 사항
    recommendations = generate_recommendations(evaluation, breakdown)
    
    return EvaluationAnalysis(
        evaluation_id=evaluation['id'],
        score=score,
        grade=grade,
        comparison=comparison,
        insights=insights,
        breakdown=breakdown,
        recommendations=recommendations
    )

def compare_evaluations(current: Dict, previous: Dict) -> Dict:
    """두 평가 결과 비교"""
    score_delta = current['avg_score'] - previous['avg_score']
    
    current_grade = ScoreGrade.from_score(current['avg_score'])
    previous_grade = ScoreGrade.from_score(previous['avg_score'])
    
    # 트렌드 판단
    if score_delta > 2:
        trend = "improving"
    elif score_delta < -2:
        trend = "degrading"
    else:
        trend = "stable"
    
    # 지표별 변화 계산
    metric_deltas = {}
    for metric_id in current['scores']:
        delta = (current['scores'][metric_id] - previous['scores'].get(metric_id, 0)) * 100
        metric_deltas[metric_id] = delta
    
    # 가장 개선/악화된 지표
    sorted_deltas = sorted(metric_deltas.items(), key=lambda x: x[1], reverse=True)
    top_improvement = sorted_deltas[0] if sorted_deltas else None
    top_regression = sorted_deltas[-1] if sorted_deltas else None
    
    return {
        "previous_evaluation_id": previous['id'],
        "score_delta": score_delta,
        "grade_change": f"{previous_grade.label} → {current_grade.label}" if previous_grade != current_grade else None,
        "trend": trend,
        "top_improvement": {
            "metric_id": top_improvement[0],
            "delta": top_improvement[1]
        } if top_improvement else None,
        "top_regression": {
            "metric_id": top_regression[0],
            "delta": top_regression[1]
        } if top_regression else None
    }

def generate_insights(evaluation: Dict, comparison: Optional[Dict]) -> List[Dict]:
    """자동 인사이트 생성"""
    insights = []
    
    # 등급 변화 인사이트
    if comparison and comparison.get('grade_change'):
        score_delta = comparison['score_delta']
        if score_delta > 0:
            insights.append({
                "type": "grade_upgrade",
                "severity": "info",
                "message": f"{comparison['grade_change']}! 🎉 전체 성능이 {score_delta:.1f}점 향상되었습니다."
            })
        else:
            insights.append({
                "type": "grade_downgrade",
                "severity": "warning",
                "message": f"⚠️ {comparison['grade_change']}. 원인 분석이 필요합니다."
            })
    
    # 지표별 문제 감지
    scores = evaluation['scores']
    
    # Retrieval 문제
    if scores.get('context_precision', 1.0) < 0.7:
        insights.append({
            "type": "retrieval_issue",
            "severity": "warning",
            "message": "Context Precision이 임계값 미달입니다.",
            "actionable": "Chunk Size 증가 및 Top-K 확대를 권장합니다."
        })
    
    # Generation 문제
    if scores.get('faithfulness', 1.0) < 0.8:
        insights.append({
            "type": "generation_issue",
            "severity": "warning",
            "message": "Faithfulness가 낮습니다. 사실 충실성 개선이 필요합니다.",
            "actionable": "Temperature 감소 및 프롬프트 제약 강화를 권장합니다."
        })
    
    return insights
```

---

## 📊 5. 프론트엔드 표시 가이드

### 5.1 등급 뱃지 컴포넌트

```tsx
interface ScoreGradeBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

function ScoreGradeBadge({ score, size = 'md' }: ScoreGradeBadgeProps) {
  const grade = getScoreGrade(score);
  
  const colorMap = {
    excellent: 'bg-green-100 text-green-800 border-green-300',
    good: 'bg-blue-100 text-blue-800 border-blue-300',
    fair: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    poor: 'bg-orange-100 text-orange-800 border-orange-300',
    critical: 'bg-red-100 text-red-800 border-red-300'
  };
  
  return (
    <Badge className={`${colorMap[grade.level]} ${size === 'lg' ? 'text-lg px-4 py-2' : ''}`}>
      {grade.emoji} {grade.label}
    </Badge>
  );
}
```

### 5.2 비교 카드 레이아웃

```tsx
{analysis.comparison && (
  <Card className="border-blue-100 bg-blue-50">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        {analysis.comparison.trend === 'improving' && <TrendingUp className="text-green-600" />}
        {analysis.comparison.trend === 'degrading' && <TrendingDown className="text-red-600" />}
        이전 평가 대비 {Math.abs(analysis.comparison.scoreDelta).toFixed(1)}점 
        {analysis.comparison.scoreDelta > 0 ? '상승' : '하락'}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-gray-700">
        {analysis.insights[0]?.message}
      </p>
      {analysis.insights[0]?.actionable && (
        <p className="text-sm text-blue-700 mt-2">
          💡 {analysis.insights[0].actionable}
        </p>
      )}
    </CardContent>
  </Card>
)}
```

---

## 🚀 6. 구현 우선순위

### Phase 1: 기본 등급 시스템 (1주)
- [ ] `getScoreGrade()` 함수 구현
- [ ] 5단계 등급 뱃지 UI 적용
- [ ] 등급별 설명 표시

### Phase 2: 히스토리 비교 (2주)
- [ ] 이전 평가 조회 로직
- [ ] `compareEvaluations()` 함수 구현
- [ ] 트렌드 아이콘 및 델타 표시

### Phase 3: 자동 인사이트 (3주)
- [ ] 인사이트 생성 알고리즘 구현
- [ ] 도메인별 특화 인사이트
- [ ] 개선 권장 사항 자동 생성

### Phase 4: 고도화 (4주)
- [ ] 장기 트렌드 분석 (최근 10회 평가)
- [ ] 예측 기능 (다음 평가 예상 점수)
- [ ] 벤치마크 비교 (산업 평균 대비)

---

## 📝 7. 테스트 시나리오

### 시나리오 1: 등급 상승
```
이전: 72점 (주의)
현재: 88점 (우수)

예상 결과:
- 등급: ✅ 우수
- 인사이트: "주의에서 우수로 개선되었습니다! 🎉 +16점 상승"
- 주요 개선: Faithfulness +20점
- 권장 조치: "성능 저하 위험 요소 점검 후 배포 승인"
```

### 시나리오 2: 안정 유지
```
이전: 91점 (우수)
현재: 92점 (우수)

예상 결과:
- 등급: ✅ 우수
- 인사이트: "우수 등급을 안정적으로 유지하고 있습니다."
- 트렌드: ➡️ 유지
- 권장 조치: "성능 기준(Baseline) 확립 및 정기 모니터링"
```

### 시나리오 3: 등급 하락
```
이전: 89점 (우수)
현재: 67점 (미흡)

예상 결과:
- 등급: 🔴 미흡
- 인사이트: "⚠️ 우수에서 미흡으로 급락했습니다!"
- 주요 악화: Context Precision -25점
- 긴급 조치: "Root Cause Analysis 및 Auto-Improvement 즉시 실행"
```

---

## 💡 8. 등급별 실무 적용 가이드 (Practical Application Guide)

### 8.1 탁월(Excellent) 등급 도달 시 체크리스트

```markdown
✅ 배포 전 최종 점검:
- [ ] 현행 설정 전체 문서화 완료
- [ ] 성능 기준(Baseline) 수립 및 대시보드 등록
- [ ] Failed Cases 0건 또는 Edge Case만 존재
- [ ] 안전성 지표 (Harmfulness, Maliciousness) 98점 이상
- [ ] Latency 및 Cost 벤치마크 기록

✅ 배포 후 운영 계획:
- [ ] 주간 단위 성능 모니터링 대시보드 설정
- [ ] 회귀(Regression) 감지 알림 설정
- [ ] A/B 테스트 계획 수립 (신규 개선안 검증)
- [ ] 베스트 프랙티스 사내 공유
```

### 8.2 우수(Good) 등급 개선 로드맵

```markdown
목표: 2주 내 탁월(95점) 등급 달성

Week 1:
- [ ] Failed Cases 상세 분석 (LLM Judge Root Cause)
- [ ] 70-80점대 지표 집중 튜닝
- [ ] 소규모 실험 (3-5개 파라미터 조합)
- [ ] 중간 점검 (90점 이상 달성 목표)

Week 2:
- [ ] 최적 설정 적용 및 재평가
- [ ] 프로덕션 카나리 배포 (10% 트래픽)
- [ ] 사용자 피드백 수집
- [ ] 최종 배포 승인 회의
```

### 8.3 주의(Fair) 등급 긴급 개선 프로세스

```markdown
🚨 즉시 실행 (24시간 이내):
1. 주의 지표(Alerting Metric) 식별
   - Context Precision < 70점
   - Faithfulness < 75점
   - Answer Correctness < 75점

2. 해당 컴포넌트 집중 진단
   - Retrieval 문제: Chunk Size, Top-K, Hybrid Search
   - Generation 문제: Temperature, Prompt Engineering
   - 데이터 품질: 중복, 노이즈, 라벨링 오류

3. Auto-Improvement 실행
   - 우선순위: Retrieval First (검색 품질이 생성 품질 좌우)
   - 실험 규모: 10-15개 조합 (Sequential Greedy)
   - 목표: 1개월 내 85점 이상 달성

4. 진행 상황 추적
   - 주 2회 재평가 및 진척도 리뷰
   - 개선 효과 미미 시 베이지안 최적화로 전환
```

### 8.4 미흡(Poor)/심각(Critical) 등급 대응 프레임워크

```markdown
⚠️ 긴급 대응 체계 (Emergency Response)

Phase 1: 근본 원인 분석 (3-5일)
- [ ] 전체 팀 긴급 회의 소집
- [ ] 데이터셋 품질 검증 (Ground Truth 정확도)
- [ ] 임베딩 모델 성능 검증 (Retrieval Recall@10)
- [ ] LLM 모델 선택 재검토 (Prompt Following 능력)
- [ ] Vector DB 설정 검증 (Index Type, Similarity Metric)

Phase 2: 집중 개선 (2-4주)
- [ ] 구조적 결함 해결 (청킹 전략, 프롬프트 재설계)
- [ ] Auto-Improvement Bayesian 모드 실행
- [ ] 외부 전문가 리뷰 (선택 사항)
- [ ] 주간 재평가 및 진척도 보고

Phase 3: 검증 및 재평가 (1주)
- [ ] 전체 지표 재평가
- [ ] 목표 달성 시 주의(70점) 등급 이상 확인
- [ ] 미달성 시 Phase 1 재실행 또는 대체 솔루션 검토
```

---

## 🎯 9. 성공 지표 (KPI)

### 9.1 정량 지표

1. **사용자 만족도**
   - 등급 시스템 직관성 평가 > 90%
   - 인사이트 유용성 평가 > 85%
   - 권장 조치 실행 의향 > 80%

2. **의사결정 효율성**
   - 문제 파악 시간 < 30초
   - 개선 방향 결정 시간 < 2분
   - 배포 승인 시간 단축 > 50%

3. **개선 효과**
   - 등급 상승률 > 65% (1개월 내)
   - 재평가 빈도 증가 > 50%
   - 자동 개선 실행률 > 70% (주의 등급 이하)

4. **비즈니스 임팩트**
   - 프로덕션 배포 성공률 > 90% (우수 등급 이상)
   - 사용자 이탈 방지 (미흡 등급 조기 탐지)
   - RAG 시스템 운영 비용 절감 > 30%

### 9.2 정성 지표

- **명확성**: 등급 설명이 누구나 이해 가능한가?
- **실행 가능성**: 권장 조치가 구체적이고 실행 가능한가?
- **신뢰성**: 인사이트가 실제 문제를 정확히 짚어내는가?
- **연계성**: REX 기능(Auto-Improvement)과 유기적으로 연결되는가?

---

## 🚀 10. 빠른 참조 (Quick Reference)

### 내 점수는 어떤 등급? (1초 판단)
```
95-100점 → 🏆 탁월 (즉시 배포)
85-94점  → ✅ 우수 (2주 내 배포)
70-84점  → ⚠️ 주의 (1개월 튜닝)
60-69점  → 🔴 미흡 (긴급 개선)
0-59점   → 🚨 심각 (재설계)
```

### 등급별 첫 번째 액션
| 등급 | 첫 번째 액션 | 예상 소요 시간 |
|------|-------------|---------------|
| 🏆 탁월 | 성능 기준(Baseline) 문서화 | 1일 |
| ✅ 우수 | Failed Cases 분석 | 2-3일 |
| ⚠️ 주의 | 주의 지표 식별 및 Auto-Improvement 실행 | 1주 |
| 🔴 미흡 | Root Cause Analysis 회의 | 즉시 |
| 🚨 심각 | 전체 파이프라인 재검토 | 즉시 |

### 자주 묻는 질문 (FAQ)

**Q1. 등급이 '주의'인데 배포해도 되나요?**
- ❌ 권장하지 않습니다. 잠재적 리스크가 있으며, 1개월 튜닝 후 '우수' 등급 달성을 목표로 하세요.

**Q2. 85점과 94점 모두 '우수'인데 차이가 있나요?**
- ✅ 있습니다. 94점은 탁월(95점)에 근접하여 즉시 배포 가능하지만, 85점은 선택적 최적화가 권장됩니다.

**Q3. '미흡' 등급에서 '우수'까지 얼마나 걸리나요?**
- 일반적으로 2-4주 집중 개선 + Auto-Improvement로 가능하지만, 구조적 문제가 있다면 6-8주 소요될 수 있습니다.

**Q4. 등급이 하락했어요. 무엇을 먼저 확인해야 하나요?**
- 1️⃣ 데이터셋 변경 여부 확인
- 2️⃣ 모델 버전 변경 여부 확인
- 3️⃣ 가장 악화된 지표(Top Regression) 확인
- 4️⃣ Failed Cases 비교 분석

**Q5. Auto-Improvement를 실행하면 무조건 등급이 올라가나요?**
- 대부분 향상되지만, 데이터 품질 문제나 모델 한계가 있다면 제한적일 수 있습니다. Sequential Greedy → Bayesian 단계적 접근을 권장합니다.

---

## 📚 11. 참고 자료

### 공식 문서
- **RAGAS Metrics**: https://docs.ragas.io/en/stable/concepts/metrics/
- **LLM Evaluation Best Practices**: OpenAI Evals
- **RAG Performance Benchmarks**: LangChain Hub

### REX 내부 문서
- `Auto-Improve-Algorithm-Specification.md`: 자동 개선 알고리즘 상세
- `API-Specification.md`: 평가 API 명세
- `LLM-Judge-Prompt-Strategy.md`: 근본 원인 분석 프롬프트

### 관련 논문
- "RAGAS: Automated Evaluation of Retrieval Augmented Generation" (2023)
- "Evaluating the Quality of Generated Text" (OpenAI, 2024)
- "Root Cause Analysis for RAG Systems" (Internal Research)

---

## 📝 12. 개정 이력 (Revision History)

### v1.1 (2025-10-13)
**주요 개선 사항:**
1. **등급명 정제**: '양호' → '주의(Fair)' 변경으로 경고 의미 명확화
2. **설명 구체화**: 
   - 탁월: "현존하는 최적의 RAG 파이프라인" 강조
   - 심각: "구조적 결함" 및 "비즈니스 리스크" 명시
3. **권장 조치 실무화**:
   - REX 핵심 기능 연계 (Root Cause Analysis, Auto-Improvement)
   - 운영 관점 조치 추가 (성능 기준 확립, 배포 승인)
   - 구체적 실행 기간 및 목표 명시
4. **실무 가이드 추가**:
   - 등급별 실무 적용 가이드 (체크리스트, 로드맵, 프로세스)
   - 빠른 참조 섹션 (Quick Reference)
   - FAQ 섹션 (자주 묻는 질문)
5. **KPI 확장**:
   - 정량/정성 지표 분리
   - 비즈니스 임팩트 지표 추가

### v1.0 (2025-10-13)
- 초기 버전 작성
- 5단계 등급 체계 정의
- 히스토리 비교 로직 설계
- 자동 인사이트 생성 규칙 수립

---

**문서 버전:** 1.1  
**작성일:** 2025-10-13  
**작성자:** 박찬식  
**최종 수정일:** 2025-10-13  
