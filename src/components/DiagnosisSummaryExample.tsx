/**
 * DiagnosisSummaryCard 사용 예제
 * 
 * ResultsPageBlue.tsx에서 사용하는 방법:
 */

import { DiagnosisSummaryCard } from './DiagnosisSummaryCard';
import type { DiagnosisSummary } from '../types';

// 예제 진단 요약 데이터
const exampleDiagnosisSummary: DiagnosisSummary = {
  total_failed: 324,
  heuristic_classified: 215,
  llm_judge_analyzed: 22,
  not_analyzed: 87,
  diagnosis_cost: 2.40,
  breakdown: {
    trivial_failures: 180,      // Score < 0.2
    retrieval_failures: 35,     // Context Recall < 0.1
    ambiguous_cases: 109        // 1차 필터 통과한 애매한 케이스
  }
};

export function DiagnosisSummaryExample() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">진단 요약 사용 예제</h2>
      
      {/* 사용 방법 1: 진단 데이터가 있는 경우 */}
      <DiagnosisSummaryCard summary={exampleDiagnosisSummary} />
      
      {/* 사용 방법 2: 진단 데이터가 없는 경우 */}
      <DiagnosisSummaryCard summary={undefined} />
    </div>
  );
}

/**
 * ResultsPageBlue.tsx에 추가할 코드:
 * 
 * 1. Import 추가:
 * ```typescript
 * import { DiagnosisSummaryCard } from './DiagnosisSummaryCard';
 * ```
 * 
 * 2. 실패 케이스 분석 섹션 아래에 추가:
 * ```typescript
 * {evaluation.diagnosisSummary && (
 *   <DiagnosisSummaryCard summary={evaluation.diagnosisSummary} />
 * )}
 * ```
 * 
 * 3. 또는 항상 표시:
 * ```typescript
 * <DiagnosisSummaryCard summary={evaluation.diagnosisSummary} />
 * ```
 */

/**
 * API 응답에서 진단 요약 데이터 구조:
 * 
 * GET /api/evaluations/{id}/results
 * 
 * Response:
 * {
 *   "id": "eval-123",
 *   "status": "completed",
 *   "scores": {...},
 *   "diagnosisSummary": {
 *     "total_failed": 324,
 *     "heuristic_classified": 215,
 *     "llm_judge_analyzed": 22,
 *     "not_analyzed": 87,
 *     "diagnosis_cost": 2.40,
 *     "breakdown": {
 *       "trivial_failures": 180,
 *       "retrieval_failures": 35,
 *       "ambiguous_cases": 109
 *     }
 *   },
 *   "failedCases": [
 *     {
 *       "id": "case-1",
 *       "question": "...",
 *       "score": 0.15,
 *       "diagnosisMethod": "Heuristic",  // 또는 "LLM Judge" 또는 "Not Analyzed"
 *       "sampled": false,
 *       "llmJudgeAnalysis": null
 *     },
 *     {
 *       "id": "case-2",
 *       "question": "...",
 *       "score": 0.65,
 *       "diagnosisMethod": "LLM Judge",
 *       "sampled": true,
 *       "llmJudgeAnalysis": {
 *         "failure_type": "Retrieval",
 *         "reason": "필요한 컨텍스트를 검색하지 못함",
 *         "root_cause": {
 *           "summary_ko": "검색 쿼리가 너무 일반적이어서...",
 *           "advice_ko": "chunk_size를 512로 조정하고..."
 *         },
 *         "diagnosis_method": "LLM Judge"
 *       }
 *     }
 *   ]
 * }
 */
