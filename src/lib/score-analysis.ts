// ============================================
// Score Analysis Utility Functions
// ============================================

import {
  ScoreGrade,
  ScoreGradeLevel,
  EvaluationComparison,
  MetricChange,
  EvaluationInsight,
  PerformanceBreakdown,
  EvaluationAnalysis,
  ImprovementRecommendation,
  EvaluationResultWithName
} from '../types';
import { METRIC_WEIGHTS, getMetricTier, METRIC_TIERS } from './metric-weights';

/**
 * 가중치 계산 결과 인터페이스
 */
export interface WeightedScoreResult {
  overallScore: number;
  weightedSum: number;
  totalWeight: number;
  tierBreakdown: {
    critical: { count: number; avgScore: number; weight: number };
    important: { count: number; avgScore: number; weight: number };
    supporting: { count: number; avgScore: number; weight: number };
    additional: { count: number; avgScore: number; weight: number };
  };
  evaluatedMetrics: number;
  reliability: {
    level: 'high' | 'medium' | 'low';
    message: string;
  };
}

/**
 * 점수 등급 체계 정의 (v3.0 - 90/80/70 기준)
 */
const SCORE_GRADES: Record<ScoreGradeLevel, ScoreGrade> = {
  excellent: {
    level: 'excellent',
    label: '탁월',
    emoji: '🏆',
    color: 'green',
    minScore: 90,
    maxScore: 100,
    description: '모든 핵심 지표가 산업 표준(0.9+)을 충족하며, 즉시 프로덕션 배포가 가능한 최상위 수준',
    recommendation: '현행 설정 유지 및 핵심 지표 정기 모니터링을 통한 성능 기준(Baseline) 확립'
  },
  good: {
    level: 'good',
    label: '우수',
    emoji: '✅',
    color: 'blue',
    minScore: 80,
    maxScore: 89,
    description: '안정적인 성능(0.8+)을 확보하였으며, 프로덕션 배포가 가능한 수준',
    recommendation: '성능 저하 위험 요소 점검 (Failed Cases 분석), 선택적 최적화 이후 배포 승인'
  },
  fair: {
    level: 'fair',
    label: '주의',
    emoji: '⚠️',
    color: 'yellow',
    minScore: 70,
    maxScore: 79,
    description: '최소 품질 기준(0.7)은 충족했으나, 일부 지표에서 개선의 여지가 명확하여 튜닝이 권장됨',
    recommendation: '즉시 주의 지표(Alerting Metric) 식별 및 해당 파이프라인 컴포넌트(청킹, 프롬프트) 집중 튜닝 실행'
  },
  poor: {
    level: 'poor',
    label: '미흡',
    emoji: '🔴',
    color: 'orange',
    minScore: 60,
    maxScore: 69,
    description: '핵심 지표가 최소 임계값(0.7) 미만이거나, 전반적인 신뢰성 확보가 어려운 수준',
    recommendation: '긴급 문제 분석 (Root Cause Analysis)을 통한 근본 원인 파악 및 주요 파라미터 개선 루프 (Auto-Improvement) 실행'
  },
  critical: {
    level: 'critical',
    label: '심각',
    emoji: '🚨',
    color: 'red',
    minScore: 0,
    maxScore: 59,
    description: 'RAG 파이프라인의 구조적 결함 또는 핵심 지표의 심각한 오류로 배포 시 비즈니스 리스크 초래',
    recommendation: '전면 재검토 및 아키텍처 재설계 필수. 데이터셋 품질, 임베딩 모델 선택, 프롬프트 전략 등 기반 요소 재확인'
  }
};

/**
 * v3.0 가중치 기반 종합 점수 계산
 */
export function calculateWeightedScore(
  scores: Record<string, number>
): WeightedScoreResult {
  const evaluatedMetrics = Object.entries(scores);
  
  // 평가 지표가 없는 경우
  if (evaluatedMetrics.length === 0) {
    return {
      overallScore: 0,
      weightedSum: 0,
      totalWeight: 0,
      tierBreakdown: {
        critical: { count: 0, avgScore: 0, weight: METRIC_TIERS.critical.weight },
        important: { count: 0, avgScore: 0, weight: METRIC_TIERS.important.weight },
        supporting: { count: 0, avgScore: 0, weight: METRIC_TIERS.supporting.weight },
        additional: { count: 0, avgScore: 0, weight: METRIC_TIERS.additional.weight },
      },
      evaluatedMetrics: 0,
      reliability: { level: 'low', message: '평가된 지표가 없습니다' }
    };
  }
  
  // 가중 합계 계산
  let weightedSum = 0;
  let totalWeight = 0;
  
  // 티어별 데이터 수집
  const tierData: Record<string, { scores: number[]; weight: number }> = {
    critical: { scores: [], weight: METRIC_TIERS.critical.weight },
    important: { scores: [], weight: METRIC_TIERS.important.weight },
    supporting: { scores: [], weight: METRIC_TIERS.supporting.weight },
    additional: { scores: [], weight: METRIC_TIERS.additional.weight },
  };
  
  evaluatedMetrics.forEach(([metric, score]) => {
    const weight = METRIC_WEIGHTS[metric] || 1.0;
    const scorePercent = score * 100; // 0-1 → 0-100
    const tierInfo = getMetricTier(metric);
    
    // 가중 합계
    weightedSum += scorePercent * weight;
    totalWeight += weight;
    
    // 티어별 집계
    const targetTier = tierInfo ? tierInfo.tier : 'additional';
    tierData[targetTier].scores.push(scorePercent);
  });
  
  // 가중 평균
  const overallScore = totalWeight > 0 ? (weightedSum / totalWeight) : 0;
  
  // 티어별 평균 계산
  const tierBreakdown: any = {};
  Object.entries(tierData).forEach(([tier, data]) => {
    const count = data.scores.length;
    const avgScore = count > 0
      ? data.scores.reduce((a, b) => a + b, 0) / count
      : 0;
    tierBreakdown[tier] = { count, avgScore, weight: data.weight };
  });
  
  // 신뢰도 판단
  const criticalCount = tierBreakdown.critical.count;
  const importantCount = tierBreakdown.important.count;
  const totalCount = evaluatedMetrics.length;
  
  let reliability: any;
  if (criticalCount >= 2 && importantCount >= 3 && totalCount >= 8) {
    reliability = {
      level: 'high',
      message: '핵심 지표 포함, 신뢰도 높은 종합 평가'
    };
  } else if (criticalCount >= 1 && importantCount >= 2 && totalCount >= 5) {
    reliability = {
      level: 'medium',
      message: '주요 지표 포함, 제한적 종합 평가'
    };
  } else {
    reliability = {
      level: 'low',
      message: '핵심 지표 부족, 참고용 평가'
    };
  }
  
  return {
    overallScore,
    weightedSum,
    totalWeight,
    tierBreakdown,
    evaluatedMetrics: evaluatedMetrics.length,
    reliability
  };
}

/**
 * 점수에 해당하는 등급 계산 (v3.0 - Soft Warning)
 */
export function getScoreGrade(
  avgScore: number,
  allScores?: Record<string, number>
): ScoreGrade & { 
  warnings?: string[]; 
  criticalIssues?: Array<{ metric: string; score: number; tier: string }>;
} {
  const warnings: string[] = [];
  const criticalIssues: Array<{ metric: string; score: number; tier: string }> = [];
  
  // Soft Warning 체크
  if (allScores) {
    const CRITICAL_METRICS = METRIC_TIERS.critical.metrics;
    const IMPORTANT_METRICS = METRIC_TIERS.important.metrics;
    
    // 핵심 지표 70점 미만
    CRITICAL_METRICS.forEach(metric => {
      if (allScores[metric] !== undefined) {
        const score = allScores[metric] * 100;
        if (score < 70) {
          criticalIssues.push({ metric, score, tier: 'critical' });
          warnings.push(`⚠️ ${metric}: ${score.toFixed(1)}점 - 즉시 개선 필요`);
        }
      }
    });
    
    // 중요 지표 70점 미만
    IMPORTANT_METRICS.forEach(metric => {
      if (allScores[metric] !== undefined) {
        const score = allScores[metric] * 100;
        if (score < 70) {
          criticalIssues.push({ metric, score, tier: 'important' });
        }
      }
    });
    
    // 중요 지표만 문제일 경우 경고 추가
    if (criticalIssues.length > 0 && warnings.length === 0) {
      const importantIssues = criticalIssues
        .filter(issue => issue.tier === 'important')
        .map(issue => issue.metric);
      if (importantIssues.length > 0) {
        warnings.push(`중요 지표 개선 권장: ${importantIssues.join(', ')}`);
      }
    }
  }
  
  // 등급 판정 (90/80/70 기준)
  for (const grade of Object.values(SCORE_GRADES)) {
    if (avgScore >= grade.minScore && avgScore <= grade.maxScore) {
      return {
        ...grade,
        ...(warnings.length > 0 && { warnings, criticalIssues })
      };
    }
  }
  
  return {
    ...SCORE_GRADES.critical,
    ...(warnings.length > 0 && { warnings, criticalIssues })
  };
}

/**
 * 두 평가 결과 비교
 */
export function compareEvaluations(
  current: EvaluationResultWithName,
  previous: EvaluationResultWithName
): EvaluationComparison {
  // 1. 종합 점수 계산
  const currentAvgScore = calculateAvgScore(current.scores);
  const previousAvgScore = calculateAvgScore(previous.scores);
  const scoreDelta = currentAvgScore - previousAvgScore;

  // 2. 등급 변화
  const currentGrade = getScoreGrade(currentAvgScore);
  const previousGrade = getScoreGrade(previousAvgScore);
  const gradeChange = currentGrade.level !== previousGrade.level
    ? `${previousGrade.label} → ${currentGrade.label}`
    : null;

  // 3. 트렌드 판단
  let trend: 'improving' | 'stable' | 'degrading';
  if (scoreDelta > 2) {
    trend = 'improving';
  } else if (scoreDelta < -2) {
    trend = 'degrading';
  } else {
    trend = 'stable';
  }

  // 4. 지표별 변화 분석
  const metricChanges = calculateMetricChanges(current.scores, previous.scores);
  
  // 5. 가장 개선/악화된 지표
  const sortedByDelta = [...metricChanges].sort((a, b) => b.delta - a.delta);
  const topImprovement = sortedByDelta[0]?.delta > 0 ? sortedByDelta[0] : null;
  const topRegression = sortedByDelta[sortedByDelta.length - 1]?.delta < 0 
    ? sortedByDelta[sortedByDelta.length - 1] 
    : null;

  // 6. 트렌드 아이콘
  let trendIcon = 'minus';
  if (scoreDelta > 5) trendIcon = 'trending_up';
  else if (scoreDelta > 2) trendIcon = 'trending_up';
  else if (scoreDelta < -5) trendIcon = 'alert_triangle';
  else if (scoreDelta < -2) trendIcon = 'trending_down';

  return {
    previousEvaluationId: previous.id,
    scoreDelta,
    gradeChange,
    trend,
    trendIcon,
    topImprovement,
    topRegression
  };
}

/**
 * 지표별 변화 계산
 */
function calculateMetricChanges(
  currentScores: Record<string, number>,
  previousScores: Record<string, number>
): MetricChange[] {
  const changes: MetricChange[] = [];
  
  // 지표 이름 매핑
  const metricNames: Record<string, string> = {
    faithfulness: 'Faithfulness',
    answer_relevancy: 'Answer Relevancy',
    context_precision: 'Context Precision',
    context_recall: 'Context Recall',
    answer_correctness: 'Answer Correctness',
    context_entity_recall: 'Context Entity Recall',
    answer_similarity: 'Answer Similarity',
    harmfulness: 'Harmfulness',
    maliciousness: 'Maliciousness',
    coherence: 'Coherence',
    critique_correctness: 'Critique Correctness',
    conciseness: 'Conciseness'
  };

  for (const [metricId, currentScore] of Object.entries(currentScores)) {
    const previousScore = previousScores[metricId] || 0;
    const delta = (currentScore - previousScore) * 100;
    const percentChange = previousScore > 0 
      ? (delta / (previousScore * 100)) * 100 
      : 0;

    // 영향도 판단
    const isHighImpactMetric = ['context_precision', 'faithfulness', 'answer_correctness'].includes(metricId);
    let impact: 'high' | 'medium' | 'low';
    if (isHighImpactMetric) {
      impact = 'high';
    } else if (Math.abs(delta) > 10) {
      impact = 'medium';
    } else {
      impact = 'low';
    }

    changes.push({
      metricId,
      metricName: metricNames[metricId] || metricId,
      delta,
      percentChange,
      impact
    });
  }

  return changes;
}

/**
 * 평균 점수 계산
 */
function calculateAvgScore(scores: Record<string, number>): number {
  const values = Object.values(scores);
  const sum = values.reduce((a, b) => a + b, 0);
  return (sum / values.length) * 100;
}

/**
 * 자동 인사이트 생성
 */
export function generateInsights(
  current: EvaluationResultWithName,
  comparison: EvaluationComparison | null
): EvaluationInsight[] {
  const insights: EvaluationInsight[] = [];
  const currentAvgScore = calculateAvgScore(current.scores);

  // 1. 등급 변화 인사이트
  if (comparison && comparison.gradeChange) {
    const { scoreDelta, gradeChange } = comparison;
    
    if (scoreDelta > 0) {
      // 등급 상승
      const improvementMetric = comparison.topImprovement;
      let message = `${gradeChange}! 🎉 전체 성능이 ${scoreDelta.toFixed(1)}점 향상되었습니다.`;
      let actionable = '';
      
      if (improvementMetric) {
        message += ` ${improvementMetric.metricName}이(가) ${improvementMetric.delta > 0 ? '+' : ''}${improvementMetric.delta.toFixed(1)}점 개선되었습니다.`;
      }
      
      // 추가 조언
      if (currentAvgScore < 95) {
        const nextGrade = currentAvgScore >= 85 ? '탁월' : '우수';
        actionable = `Context Precision을 추가 개선하면 ${nextGrade} 등급 달성 가능합니다.`;
      }
      
      insights.push({
        type: 'grade_upgrade',
        severity: 'success',
        message,
        actionable: actionable || undefined
      });
    } else {
      // 등급 하락
      const regressionMetric = comparison.topRegression;
      let message = `⚠️ ${gradeChange}. 성능이 ${Math.abs(scoreDelta).toFixed(1)}점 하락했습니다.`;
      let actionable = '';
      
      if (regressionMetric) {
        message += ` ${regressionMetric.metricName}이(가) ${regressionMetric.delta.toFixed(1)}점 하락한 것이 주요 원인입니다.`;
        actionable = `긴급조치: ${getImprovementAdvice(regressionMetric.metricId)}`;
      }
      
      insights.push({
        type: 'grade_downgrade',
        severity: 'error',
        message,
        actionable: actionable || undefined
      });
    }
  } else if (comparison && !comparison.gradeChange) {
    // 등급 유지
    const currentGrade = getScoreGrade(currentAvgScore);
    let message = `${currentGrade.label} 등급을 유지하고 있습니다.`;
    
    if (comparison.topRegression && comparison.topRegression.delta < -2) {
      message += ` 그러나 ${comparison.topRegression.metricName}이(가) ${comparison.topRegression.delta.toFixed(1)}점 하락하여 주의가 필요합니다.`;
    } else if (comparison.topImprovement && comparison.topImprovement.delta > 2) {
      message += ` ${comparison.topImprovement.metricName}이(가) 안정적으로 개선되고 있습니다.`;
    }
    
    insights.push({
      type: 'grade_maintained',
      severity: 'info',
      message
    });
  }

  // 2. 지표별 문제 감지
  const scores = current.scores;

  // Retrieval 문제
  if ((scores.context_precision || 1) < 0.7) {
    insights.push({
      type: 'retrieval_issue',
      severity: 'warning',
      message: 'Context Precision이 임계값(70점) 미달입니다.',
      actionable: 'Chunk Size 증가(512→1024), Top-K 확대(3→5), Hybrid Search 활성화를 권장합니다.'
    });
  }

  if ((scores.context_recall || 1) < 0.7) {
    insights.push({
      type: 'retrieval_issue',
      severity: 'warning',
      message: 'Context Recall이 낮습니다. 필요한 정보를 충분히 검색하지 못하고 있습니다.',
      actionable: 'Top-K를 증가시키고, Document Reranking을 활성화하세요.'
    });
  }

  // Generation 문제
  if ((scores.faithfulness || 1) < 0.8) {
    insights.push({
      type: 'generation_issue',
      severity: 'warning',
      message: 'Faithfulness가 낮습니다. 생성된 답변이 검색된 문서에 충실하지 않습니다.',
      actionable: 'Temperature 감소(0.7→0.3), 프롬프트에 "반드시 제공된 컨텍스트만 사용" 제약 추가를 권장합니다.'
    });
  }

  if ((scores.answer_correctness || 1) < 0.8) {
    insights.push({
      type: 'generation_issue',
      severity: 'warning',
      message: 'Answer Correctness가 낮습니다. 답변의 정확도 개선이 필요합니다.',
      actionable: 'Few-shot 예시 추가, System Message에 정확성 강조를 권장합니다.'
    });
  }

  // 안전성 문제
  if ((scores.harmfulness || 0) > 0.1 || (scores.maliciousness || 0) > 0.1) {
    insights.push({
      type: 'safety_issue',
      severity: 'error',
      message: '⚠️ 안전성 문제 감지! 유해하거나 악의적인 답변이 발견되었습니다.',
      actionable: '즉시 조치 필요: 유해성 필터링 강화, Content Moderation API 통합, 배포 연기 권고'
    });
  }

  return insights;
}

/**
 * 분야별 성능 분석 (Retrieval/Generation)
 */
export function analyzePerformanceBreakdown(
  scores: Record<string, number>,
  previousScores?: Record<string, number>
): { retrieval: PerformanceBreakdown; generation: PerformanceBreakdown } {
  // Retrieval 지표
  const retrievalMetrics = ['context_precision', 'context_recall', 'context_entity_recall'];
  const retrievalScores = retrievalMetrics
    .map(m => scores[m] || 0)
    .filter(s => s > 0);
  const retrievalAvg = retrievalScores.length > 0
    ? (retrievalScores.reduce((a, b) => a + b, 0) / retrievalScores.length) * 100
    : 0;

  // Generation 지표
  const generationMetrics = ['faithfulness', 'answer_correctness', 'answer_relevancy', 'conciseness'];
  const generationScores = generationMetrics
    .map(m => scores[m] || 0)
    .filter(s => s > 0);
  const generationAvg = generationScores.length > 0
    ? (generationScores.reduce((a, b) => a + b, 0) / generationScores.length) * 100
    : 0;

  // 트렌드 계산
  let retrievalTrend: 'improving' | 'stable' | 'degrading' = 'stable';
  let generationTrend: 'improving' | 'stable' | 'degrading' = 'stable';

  if (previousScores) {
    const prevRetrievalScores = retrievalMetrics
      .map(m => previousScores[m] || 0)
      .filter(s => s > 0);
    const prevRetrievalAvg = prevRetrievalScores.length > 0
      ? (prevRetrievalScores.reduce((a, b) => a + b, 0) / prevRetrievalScores.length) * 100
      : 0;

    const prevGenerationScores = generationMetrics
      .map(m => previousScores[m] || 0)
      .filter(s => s > 0);
    const prevGenerationAvg = prevGenerationScores.length > 0
      ? (prevGenerationScores.reduce((a, b) => a + b, 0) / prevGenerationScores.length) * 100
      : 0;

    const retrievalDelta = retrievalAvg - prevRetrievalAvg;
    const generationDelta = generationAvg - prevGenerationAvg;

    retrievalTrend = retrievalDelta > 2 ? 'improving' : retrievalDelta < -2 ? 'degrading' : 'stable';
    generationTrend = generationDelta > 2 ? 'improving' : generationDelta < -2 ? 'degrading' : 'stable';
  }

  // 병목/강점 지표 찾기
  const retrievalBottleneck = retrievalMetrics
    .map(m => ({ id: m, score: (scores[m] || 0) * 100 }))
    .sort((a, b) => a.score - b.score)[0]?.id;

  const generationBottleneck = generationMetrics
    .map(m => ({ id: m, score: (scores[m] || 0) * 100 }))
    .sort((a, b) => a.score - b.score)[0]?.id;

  const retrievalStrength = retrievalMetrics
    .map(m => ({ id: m, score: (scores[m] || 0) * 100 }))
    .sort((a, b) => b.score - a.score)[0]?.id;

  const generationStrength = generationMetrics
    .map(m => ({ id: m, score: (scores[m] || 0) * 100 }))
    .sort((a, b) => b.score - a.score)[0]?.id;

  return {
    retrieval: {
      avgScore: retrievalAvg,
      grade: getScoreGrade(retrievalAvg).level,
      trend: retrievalTrend,
      bottleneck: retrievalBottleneck,
      strength: retrievalStrength
    },
    generation: {
      avgScore: generationAvg,
      grade: getScoreGrade(generationAvg).level,
      trend: generationTrend,
      bottleneck: generationBottleneck,
      strength: generationStrength
    }
  };
}

/**
 * 개선 권장 사항 생성
 */
export function generateRecommendations(
  scores: Record<string, number>,
  breakdown: { retrieval: PerformanceBreakdown; generation: PerformanceBreakdown }
): ImprovementRecommendation[] {
  const recommendations: ImprovementRecommendation[] = [];

  // Retrieval 개선
  if (breakdown.retrieval.avgScore < 85) {
    const priority = breakdown.retrieval.avgScore < 70 ? 'high' : 'medium';
    recommendations.push({
      priority,
      category: 'retrieval',
      title: '검색 정확도 개선',
      description: `Context Precision이 ${((scores.context_precision || 0) * 100).toFixed(0)}점으로 개선이 필요합니다.`,
      actions: [
        'Chunk Size를 512에서 1024로 증가',
        'Top-K를 3에서 5로 확대',
        'Hybrid Search (BM25 + Vector) 활성화',
        'Reranking 모델 적용 검토'
      ],
      expectedImpact: '+8~10점',
      estimatedEffort: 'medium'
    });
  }

  // Generation 개선
  if (breakdown.generation.avgScore < 85) {
    const priority = breakdown.generation.avgScore < 70 ? 'high' : 'medium';
    recommendations.push({
      priority,
      category: 'generation',
      title: '답변 생성 품질 개선',
      description: `Faithfulness가 ${((scores.faithfulness || 0) * 100).toFixed(0)}점으로 개선이 필요합니다.`,
      actions: [
        'Temperature를 0.7에서 0.3으로 감소',
        '프롬프트에 "반드시 제공된 컨텍스트만 사용" 제약 추가',
        'System Message에 사실 충실성 강조',
        'Few-shot 예시 추가 (정확한 답변 패턴)'
      ],
      expectedImpact: '+5~8점',
      estimatedEffort: 'easy'
    });
  }

  // 간결성 개선
  if ((scores.conciseness || 1) < 0.85) {
    recommendations.push({
      priority: 'low',
      category: 'generation',
      title: '답변 간결성 개선',
      description: '답변에 불필요한 정보가 포함되는 경향이 있습니다.',
      actions: [
        'Max Tokens를 현재 값의 70%로 감소',
        '프롬프트에 "간결하게 답변" 지시 추가',
        '후처리 단계에서 중복 문장 제거'
      ],
      expectedImpact: '+3~5점',
      estimatedEffort: 'easy'
    });
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

/**
 * 종합 평가 분석 (v3.0 - 가중치 기반)
 */
export function analyzeEvaluation(
  current: EvaluationResultWithName,
  previous?: EvaluationResultWithName
): EvaluationAnalysis & { weightedResult: WeightedScoreResult } {
  // v3.0: 가중치 기반 점수 계산
  const weightedResult = calculateWeightedScore(current.scores);
  const grade = getScoreGrade(weightedResult.overallScore, current.scores);
  
  const comparison = previous ? compareEvaluations(current, previous) : null;
  const insights = generateInsights(current, comparison);
  const breakdown = analyzePerformanceBreakdown(
    current.scores,
    previous?.scores
  );
  const recommendations = generateRecommendations(current.scores, breakdown);

  return {
    evaluationId: current.id,
    score: weightedResult.overallScore,
    grade,
    weightedResult,
    comparison,
    insights,
    breakdown,
    recommendations
  };
}

/**
 * 지표별 개선 조언
 */
function getImprovementAdvice(metricId: string): string {
  const adviceMap: Record<string, string> = {
    context_precision: 'Chunk Size 증가, Top-K 확대, Hybrid Search 활성화',
    context_recall: 'Top-K 증가, Document Reranking 활성화',
    faithfulness: 'Temperature 감소, 프롬프트 제약 강화',
    answer_correctness: 'Few-shot 예시 추가, System Message 개선',
    conciseness: 'Max Tokens 감소, 간결성 지시 추가'
  };
  
  return adviceMap[metricId] || '자동 개선 기능을 실행하여 최적 설정을 찾으세요.';
}