/**
 * REX v3.0 지표 중요도 티어 시스템
 * - Tier 1 (Critical): 시스템 신뢰도 핵심 - 가중치 3.0x
 * - Tier 2 (Important): 품질 직접 영향 - 가중치 2.0x
 * - Tier 3 (Supporting): 사용자 경험 - 가중치 1.5x
 * - Tier 4 (Additional): 특수 진단용 - 가중치 1.0x
 */

export const METRIC_TIERS = {
  critical: {
    weight: 3.0,
    metrics: [
      'faithfulness',        // 환각 방지 (최우선)
      'answer_correctness',  // 정확도
    ],
    description: '시스템 신뢰도의 핵심. 낮으면 즉시 수정 필수',
    color: 'red'
  },
  
  important: {
    weight: 2.0,
    metrics: [
      'answer_relevancy',    // 답변 관련성
      'context_precision',   // 검색 정확도
      'context_recall',      // 검색 재현율
    ],
    description: '품질에 직접적 영향. 개선 권장',
    color: 'orange'
  },
  
  supporting: {
    weight: 1.5,
    metrics: [
      'coherence',           // 일관성
      'answer_similarity',   // 답변 유사도
    ],
    description: '사용자 경험 향상. 선택적 개선',
    color: 'blue'
  },
  
  additional: {
    weight: 1.0,
    metrics: [
      'context_entity_recall',
      'context_utilization',
      'noise_sensitivity',
      'answer_conciseness',
      'summarization',
    ],
    description: '특수 상황 진단용. 참고 자료',
    color: 'gray'
  }
} as const;

/**
 * 지표별 가중치 맵 (자동 생성)
 */
export const METRIC_WEIGHTS: Record<string, number> = (() => {
  const weights: Record<string, number> = {};
  Object.values(METRIC_TIERS).forEach(tier => {
    tier.metrics.forEach(metric => {
      weights[metric] = tier.weight;
    });
  });
  return weights;
})();

/**
 * 지표의 티어 정보 조회
 */
export function getMetricTier(metricName: string): {
  tier: 'critical' | 'important' | 'supporting' | 'additional';
  weight: number;
  description: string;
  color: string;
} | null {
  for (const [tierName, tierInfo] of Object.entries(METRIC_TIERS)) {
    if (tierInfo.metrics.includes(metricName)) {
      return {
        tier: tierName as any,
        weight: tierInfo.weight,
        description: tierInfo.description,
        color: tierInfo.color
      };
    }
  }
  return null;
}

/**
 * 지표명 한글 변환 (UI 표시용)
 */
export const METRIC_LABELS: Record<string, string> = {
  faithfulness: '신뢰성 (Faithfulness)',
  answer_correctness: '정확도 (Answer Correctness)',
  answer_relevancy: '답변 관련성 (Answer Relevancy)',
  context_precision: '컨텍스트 정확도 (Context Precision)',
  context_recall: '컨텍스트 재현율 (Context Recall)',
  coherence: '일관성 (Coherence)',
  answer_similarity: '답변 유사도 (Answer Similarity)',
  context_entity_recall: '엔티티 재현율 (Context Entity Recall)',
  context_utilization: '컨텍스트 활용도 (Context Utilization)',
  noise_sensitivity: '노이즈 민감도 (Noise Sensitivity)',
  answer_conciseness: '간결성 (Answer Conciseness)',
  summarization: '요약 품질 (Summarization)',
};
