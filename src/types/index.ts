// ============================================
// REX Type Definitions
// ============================================

// -------------------- User Types --------------------
export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

// -------------------- Dataset Types --------------------
export type DatasetType = 'auto-generated' | 'uploaded';

export interface QAPair {
  id: string;
  question: string;
  answer: string;
  context?: string;
}

export interface Dataset {
  id: string;
  name: string;
  type: DatasetType;
  qaCount: number;
  createdAt: string;
  source?: string;
  qaPairs: QAPair[];
}

// -------------------- Evaluation Metric Types --------------------
export type MetricName = 
  | 'faithfulness'
  | 'answer_relevancy'
  | 'context_precision'
  | 'context_recall'
  | 'answer_correctness'
  | 'context_entity_recall'
  | 'answer_similarity'
  | 'harmfulness'
  | 'maliciousness'
  | 'coherence'
  | 'critique_correctness'
  | 'conciseness';

export type MetricCategory = 'retrieval' | 'generation' | 'quality' | 'safety';

export interface EvaluationMetric {
  id: string;
  name: string;
  nameKo?: string;
  description: string;
  category?: MetricCategory | 'required' | 'recommended' | 'optional';
  subCategory?: string;
  isCustom?: boolean;
  requiresLLMJudge?: boolean;  // LLM Judge가 필요한 지표인지 (true) vs 단순 계산 가능 (false)
  recommendationLevel?: 'critical' | 'important' | 'optional';
  recommendationText?: string;
}

/**
 * 평가 설정 요청 시 사용될 Metric Configuration 구조
 * API Request Body에 포함됨
 */
export interface MetricConfig {
  name: MetricName;
  is_enabled: boolean;           // 평가에 포함할지 여부
  weight?: number;                // 지표별 가중치 (선택 사항, 복합 점수 계산 시)
  threshold?: number;             // 합격/불합격 기준 (선택 사항, 0-1 범위)
}

// -------------------- RAG Configuration Types --------------------
export type RetrieverType = 'semantic' | 'hybrid' | 'keyword';

export interface RAGHyperparameters {
  top_k: number;                    // 검색 결과 개수 (1-20)
  chunk_size: number;               // 청크 크기 (128-2048)
  chunk_overlap: number;            // 청크 오버랩 (0-200)
  retriever_type: RetrieverType;    // 검색 알고리즘
  similarity_threshold: number;     // 유사도 임계값 (0.0-1.0)
}

// -------------------- Evaluation Config Types --------------------
export type EvaluationMode = 'external' | 'internal';  // 연동 시스템 평가 vs 신규 평가
export type EvaluationStatus = 'pending' | 'running' | 'completed' | 'failed' | 'stopped' | 'scheduled' | 'retrying';

export interface ScheduleConfig {
  enabled: boolean;
  frequency?: 'daily' | 'weekly' | 'monthly';
  start_time?: string | null;    // ISO 8601 format
  max_iterations?: number;
}

/**
 * 외부 RAG 시스템 연동 설정
 */
export interface ExternalRAGConfig {
  endpoint: string;                // API endpoint URL
  method?: 'POST' | 'GET';         // HTTP method (default: POST)
  auth_type: 'none' | 'api_key' | 'bearer' | 'basic';
  api_key?: string;                // API Key (auth_type이 api_key일 때)
  bearer_token?: string;           // Bearer Token
  username?: string;               // Basic Auth username
  password?: string;               // Basic Auth password
  request_format: {
    question_field: string;        // 질문을 담을 필드명 (예: "query", "question")
    context_field?: string;        // 컨텍스트 필드명 (선택)
  };
  response_format: {
    answer_field: string;          // 답변을 추출할 필드명 (예: "answer", "response")
    context_field?: string;        // 컨텍스트 추출 필드명 (선택)
  };
  timeout_seconds?: number;        // 요청 타임아웃 (default: 30)
  max_retries?: number;            // 재시도 횟수 (default: 3)
}

export interface EvaluationConfig {
  id: string;
  name: string;
  mode?: EvaluationMode;          // 평가 모드 (external: 연동 시스템, internal: 신규 평가)
  datasetId: string;
  modelId: string;
  vectorDbId: string;
  metrics: string[];              // 기본 버전 (하위 호환성)
  metricsConfig?: MetricConfig[]; // 향상된 버전 (가중치 및 임계값 포함)
  schedule?: ScheduleConfig;
  rag_system_prompt: string;      // RAG 시스템 프롬프트 (필수)
  rag_hyperparameters: RAGHyperparameters;  // RAG 하이퍼파라미터 (필수)
  external_rag_api?: ExternalRAGConfig;  // 연동 평가 시 필요
}

/**
 * 신규 평가 생성 요청 Body
 */
export interface CreateEvaluationRequest {
  name: string;
  mode: EvaluationMode;                   // 평가 모드 (external/internal)
  dataset_id: string;
  model_id: string;
  vector_db_id?: string;                  // internal 모드에서만 필수
  metrics: MetricConfig[];
  rag_system_prompt?: string;             // internal 모드에서만 필수
  rag_hyperparameters?: RAGHyperparameters; // internal 모드에서만 필수
  external_rag_api?: ExternalRAGConfig;   // external 모드에서만 필수
  schedule_config?: {
    max_iterations: number;
    start_time: string | null;
  };
  sampling_strategy?: SamplingStrategy;  // 비용 절감을 위한 샘플링
  budget_limit?: number;                  // 평가별 예산 한도 ($)
  llm_judge_config?: LLMJudgeSamplingConfig; // LLM Judge 샘플링 설정 (V1.0)
  heuristic_thresholds?: HeuristicThresholds; // 휴리스틱 필터 임계값 (고급)
}

/**
 * LLM Judge 샘플링 설정 (V1.0)
 */
export interface LLMJudgeSamplingConfig {
  enabled: boolean;                      // 샘플링 활성화
  mode: 'auto' | 'fixed_ratio' | 'max_cases'; // 샘플링 모드
  fixed_ratio?: number;                  // 고정 비율 (10, 20, 50, 100) %
  max_cases?: number;                    // 최대 분석 케이스 수
  budget_limit?: number;                 // (V1.5) 최대 허용 비용 (USD)
}

/**
 * 휴리스틱 필터 임계값 (고급 설정)
 */
export interface HeuristicThresholds {
  trivial_failure_score: number;         // default: 0.2 (Score Threshold)
  retrieval_failure_score: number;       // default: 0.1 (Context Recall)
  min_context_tokens: number;            // default: 50 (Context Volume Check)
}

// -------------------- Evaluation Result Types --------------------
export interface EvaluationResult {
  id: string;
  configId: string;
  status: EvaluationStatus;
  startedAt: string;
  completedAt?: string;
  progress: number;                       // 0-100
  scores: Record<string, number>;         // { [metricId]: score }
  overallScore?: number;                  // 종합 점수 (weighted average)
  summary?: string;
  failedCases?: FailedCase[];
  totalQuestions?: number;
  failedCasesCount?: number;
  diagnosisSummary?: DiagnosisSummary;   // 진단 요약 (V1.0)
}

/**
 * 진단 요약 정보
 */
export interface DiagnosisSummary {
  total_failed: number;                  // 전체 실패 케이스 수
  heuristic_classified: number;          // 휴리스틱 자동 분류 수
  llm_judge_analyzed: number;            // LLM Judge 분석 수
  not_analyzed: number;                  // 미분석 수
  diagnosis_cost: number;                // 진단 비용 ($)
  breakdown: {
    trivial_failures: number;            // 명백한 실패 (Score < threshold)
    retrieval_failures: number;          // 검색 실패 (Context 누락)
    ambiguous_cases: number;             // 애매한 케이스 (샘플링 대상)
  };
}

export interface FailedCase {
  id: string;
  question: string;
  expectedAnswer: string;
  generatedAnswer: string;
  score: number;
  reason?: string;
  rootCause?: 'retrieval' | 'generation'; // 근본 원인 분석
  retrievedContext?: string;               // 검색된 컨텍스트
  llmJudgeAnalysis?: LLMJudgeRootCause;   // LLM Judge의 상세 분석 결과
  diagnosisMethod?: DiagnosisMethod;      // 진단 방법
  sampled?: boolean;                      // LLM Judge 샘플링 대상 여부
}

/**
 * 실시간 평가 상태 조회 응답
 */
export interface EvaluationStatusResponse {
  id: string;
  status: EvaluationStatus;
  progress: number;
  currentTask?: string;
  metricsProcessed?: Record<string, number>;
  estimatedCompletion?: string;
  retry_count?: number;        // 🌟 재시도 횟수
  max_retries?: number;        // 🌟 최대 재시도 횟수
  last_error?: string;         // 🌟 마지막 오류 메시지
}

// -------------------- Resource Types --------------------
export interface LLMModel {
  id: string;
  name: string;
  provider: string;
  type: 'cloud' | 'on-premise';
  status: 'active' | 'inactive';
}

export interface VectorDB {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected';
}

// -------------------- Log Types --------------------
export type LogLevel = 'info' | 'warning' | 'error' | 'debug';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  sessionId: string;
  message: string;
  details?: string;
}

// -------------------- System Types --------------------
export interface SystemStatus {
  api: 'healthy' | 'unhealthy';
  database: 'connected' | 'disconnected';
  cpuUsage: number;
  memoryUsage: number;
  activeEvaluations?: number;
  queueSize?: number;
}

// -------------------- Auto-Improve Types --------------------
export type OptimizationLevel = 'rule_based' | 'sequential_greedy' | 'bayesian';
export type OptimizationStrategy = 'retrieval_first' | 'generation_first' | 'balanced';
export type RootCauseSeverity = 'low' | 'medium' | 'high';

/**
 * 근본 원인 분석 결과
 */
export interface RootCauseAnalysis {
  retrieval?: {
    severity: RootCauseSeverity;
    affected_metrics: MetricName[];
    scores: Record<string, number>;
    priority_params: string[];
  };
  generation?: {
    severity: RootCauseSeverity;
    affected_metrics: MetricName[];
    scores: Record<string, number>;
    priority_params: string[];
  };
  recommended_strategy: OptimizationStrategy;
  estimated_experiments: number;
  estimated_cost: number;
  estimated_duration_minutes: number;
}

/**
 * 개선 제안
 */
export interface ImprovementSuggestion {
  id: string;
  type: 'retrieval' | 'generation';
  title: string;
  description: string;
  parameters: Record<string, any>;
}

/**
 * 자동 개선 작업
 */
export interface AutoImproveJob {
  id: string;
  baseEvaluationId: string;
  targetMetric: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  strategy: OptimizationStrategy;
  optimization_level: OptimizationLevel;
  createdAt: string;
  completedAt?: string;
  experiments: AutoImproveExperiment[];
  totalExperiments?: number;
  currentExperimentIndex?: number;
  bestConfig?: Record<string, any>;
  improvement?: {
    baseline_score: number;
    best_score: number;
    improvement_rate: number;
    improved_metrics: Record<string, { before: number; after: number }>;
  };
}

/**
 * 자동 개선 실험
 */
export interface AutoImproveExperiment {
  id: string;
  name: string;
  order: number;
  config: {
    llm_model?: string;
    chunk_size?: number;
    temperature?: number;
    top_k?: number;
    embedding_model?: string;
    max_tokens?: number;
    [key: string]: any;
  };
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  score?: number;
  scores?: Record<string, number>;
  avgScore?: number;
  startTime?: string;
  endTime?: string;
  currentStep?: string;
  rank?: number;
  improvement?: string; // 예: "+2.1%"
}

/**
 * 자동 개선 작업 생성 요청
 */
export interface CreateAutoImproveRequest {
  base_evaluation_id: string;
  target_metric?: MetricName;
  strategy: OptimizationStrategy;
  optimization_level: OptimizationLevel;
  selected_params?: Record<string, string[]>; // { chunk_size: ['256', '512'] }
  early_stopping?: {
    enabled: boolean;
    min_improvement: number;
    patience: number;
    target_score?: number;
  };
  budget?: {
    max_experiments?: number;
    max_cost?: number;
    max_duration_minutes?: number;
  };
}

/**
 * 근본 원인 분석 요청
 */
export interface AnalyzeRootCauseRequest {
  evaluation_id: string;
  target_metrics?: MetricName[];
}

/**
 * 실험 생성 요청
 */
export interface GenerateExperimentsRequest {
  base_evaluation_id: string;
  strategy: OptimizationStrategy;
  optimization_level: OptimizationLevel;
  budget?: {
    max_experiments?: number;
    max_cost?: number;
    max_duration_minutes?: number;
  };
}

// -------------------- API Response Types --------------------
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  pagination?: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    has_next?: boolean;
    has_prev?: boolean;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

// -------------------- WebSocket Message Types --------------------
export type WebSocketMessageType = 'progress_update' | 'status_change' | 'error' | 'log';

export interface WebSocketMessage {
  type: WebSocketMessageType;
  data: {
    evaluation_id: string;
    progress?: number;
    status?: EvaluationStatus;
    current_task?: string;
    message?: string;
    timestamp: string;
    [key: string]: any;
  };
}

// -------------------- Extended Types (UI용) --------------------
/**
 * 평가 이력 화면에서 사용되는 확장된 타입
 */
export interface EvaluationHistory extends EvaluationResult {
  name: string;
  datasetName: string;
  modelName: string;
  vectorDbName: string;
  scheduledTime?: string;
  scheduleFrequency?: 'daily' | 'weekly' | 'monthly';
}

/**
 * 이름이 포함된 평가 결과
 */
export interface EvaluationResultWithName extends EvaluationResult {
  name: string;
}

/**
 * 시간별 성능 추이 데이터
 */
export interface PerformanceOverTime {
  period: string;      // 시간 (월 또는 일)
  overallScore: number; // 종합 점수
}

// -------------------- Cost Tracking Types --------------------
export type LLMProvider = 'openai' | 'anthropic' | 'cohere' | 'custom';

/**
 * LLM별 토큰 가격 정보
 */
export interface LLMPricing {
  provider: LLMProvider;
  model: string;
  input_price_per_1k: number;   // 입력 토큰 $0.005 per 1K
  output_price_per_1k: number;  // 출력 토큰 $0.015 per 1K
  cache_price_per_1k?: number;  // 캐시 토큰 (할인율)
}

/**
 * 지표별 비용 분해
 */
export interface MetricCostBreakdown {
  metric_name: MetricName;
  llm_model: string;
  total_calls: number;               // API 호출 횟수
  input_tokens: number;              // 입력 토큰 총량
  output_tokens: number;             // 출력 토큰 총량
  cached_tokens?: number;            // 캐시된 토큰 (비용 절감)
  cost: number;                      // 총 비용 ($)
  avg_latency_ms?: number;           // 평균 응답 시간
}

/**
 * 평가별 비용 요약
 */
export interface EvaluationCost {
  evaluation_id: string;
  evaluation_name: string;
  total_cost: number;                // 총 비용
  qa_count: number;                  // QA 쌍 개수
  cost_per_qa: number;               // QA당 평균 비용
  metric_costs: MetricCostBreakdown[]; // 지표별 상세 비용
  timestamp: string;
  duration_minutes: number;
  status: 'completed' | 'running' | 'failed';
}

/**
 * 비용 요약 (대시보드용)
 */
export interface CostSummary {
  period: 'today' | 'week' | 'month' | 'all';
  total_cost: number;
  total_evaluations: number;
  total_qa_processed: number;
  avg_cost_per_evaluation: number;
  avg_cost_per_qa: number;
  cost_by_provider: Array<{
    provider: LLMProvider;
    model: string;
    cost: number;
    percentage: number;
  }>;
  cost_by_metric: Array<{
    metric_name: MetricName;
    cost: number;
    percentage: number;
  }>;
  cost_trend: Array<{
    date: string;
    cost: number;
  }>;
}

/**
 * 비용 예측
 */
export interface CostEstimate {
  estimated_cost: number;
  breakdown: Array<{
    metric_name: MetricName;
    qa_count: number;
    estimated_tokens: number;
    estimated_cost: number;
  }>;
  confidence: 'high' | 'medium' | 'low';
  factors: string[];  // 예: ["샘플링 30%", "캐싱 활성화"]
}

/**
 * 예산 설정
 */
export interface Budget {
  id: string;
  name: string;
  type: 'project' | 'user' | 'organization';
  entity_id: string;             // 프로젝트 ID, 사용자 ID 등
  limit: number;                 // 예산 한도 ($)
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  current_usage: number;         // 현재 사용량 ($)
  percentage_used: number;       // 사용률 (%)
  alert_thresholds: number[];    // 알림 임계값 [50, 80, 95]
  is_hard_limit: boolean;        // true면 초과 시 평가 중단
  created_at: string;
  updated_at: string;
}

/**
 * 비용 알림
 */
export interface CostAlert {
  id: string;
  budget_id: string;
  type: 'threshold_warning' | 'threshold_exceeded' | 'limit_reached';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  current_usage: number;
  budget_limit: number;
  percentage_used: number;
  timestamp: string;
  is_acknowledged: boolean;
}

/**
 * 비용 최적화 제안
 */
export interface CostOptimizationSuggestion {
  id: string;
  type: 'sampling' | 'metric_selection' | 'model_switch' | 'caching';
  title: string;
  description: string;
  estimated_savings: number;      // 예상 절감액 ($)
  estimated_savings_percentage: number; // 예상 절감률 (%)
  impact_on_accuracy?: string;    // "정확도 5% 감소 예상"
  implementation_effort: 'easy' | 'medium' | 'hard';
}

/**
 * 샘플링 전략
 */
export interface SamplingStrategy {
  enabled: boolean;
  type: 'random' | 'stratified' | 'systematic';
  sample_rate: number;            // 0.0 ~ 1.0 (30% = 0.3)
  min_samples: number;            // 최소 샘플 개수
  seed?: number;                  // 재현성을 위한 시드
}

// -------------------- Score Analysis Types --------------------
/**
 * 점수 등급 (5단계 평가 체계)
 */
export type ScoreGradeLevel = 'excellent' | 'good' | 'fair' | 'poor' | 'critical';

export interface ScoreGrade {
  level: ScoreGradeLevel;
  label: string;           // 한국어 라벨: 탁월, 우수, 양호, 미흡, 심각
  emoji: string;           // 🏆, ✅, ⚠️, 🔴, 🚨
  color: string;           // green, blue, yellow, orange, red
  minScore: number;        // 최소 점수
  maxScore: number;        // 최대 점수
  description: string;     // 등급 설명
  recommendation: string;  // 권장 조치
}

/**
 * 평가 비교 결과
 */
export interface EvaluationComparison {
  previousEvaluationId: string;
  scoreDelta: number;              // 점수 변화량
  gradeChange: string | null;      // 등급 변화 (예: "양호 → 우수")
  trend: 'improving' | 'stable' | 'degrading';
  trendIcon: string;               // trending_up, minus, trending_down
  topImprovement: MetricChange | null;
  topRegression: MetricChange | null;
}

/**
 * 지표 변화
 */
export interface MetricChange {
  metricId: string;
  metricName: string;
  delta: number;                   // 점수 변화
  percentChange: number;           // 변화율 (%)
  impact: 'high' | 'medium' | 'low';
}

/**
 * 평가 분석 인사이트
 */
export interface EvaluationInsight {
  type: 'grade_upgrade' | 'grade_downgrade' | 'grade_maintained' | 
        'metric_improvement' | 'metric_warning' | 'metric_regression' |
        'retrieval_issue' | 'generation_issue' | 'safety_issue';
  severity: 'info' | 'success' | 'warning' | 'error';
  message: string;
  detail?: string;
  actionable?: string;             // 실행 가능한 조언
}

/**
 * 분야별 성능 분석 (Retrieval/Generation)
 */
export interface PerformanceBreakdown {
  avgScore: number;
  grade: ScoreGradeLevel;
  trend: 'improving' | 'stable' | 'degrading';
  bottleneck?: string;             // 병목 지표 ID
  strength?: string;               // 강점 지표 ID
}

/**
 * 종합 평가 분석 결과
 */
export interface EvaluationAnalysis {
  evaluationId: string;
  score: number;
  grade: ScoreGrade;
  comparison: EvaluationComparison | null;
  insights: EvaluationInsight[];
  breakdown: {
    retrieval: PerformanceBreakdown;
    generation: PerformanceBreakdown;
  };
  recommendations: ImprovementRecommendation[];
}

/**
 * 개선 권장 사항
 */
export interface ImprovementRecommendation {
  priority: 'high' | 'medium' | 'low';
  category: 'retrieval' | 'generation' | 'data' | 'infrastructure';
  title: string;
  description: string;
  actions: string[];
  expectedImpact: string;          // 예: "+8~10점"
  estimatedEffort: 'easy' | 'medium' | 'hard';
}

// -------------------- Helper Types --------------------
/**
 * 평가 지표별 점수 분포
 */
export interface MetricDistribution {
  metric_name: string;
  overall_score: number;
  distribution: {
    '0.9-1.0': number;
    '0.8-0.9': number;
    '0.7-0.8': number;
    'below_0.7': number;
  };
  top_performers: Array<{
    question_id: string;
    score: number;
  }>;
  bottom_performers: Array<{
    question_id: string;
    score: number;
  }>;
}

/**
 * Rate Limit 정보
 */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp
}

// -------------------- LLM Judge Types --------------------
/**
 * LLM Judge가 분석한 실패의 근본 원인
 */
export type LLMJudgeFailureType = 'Retrieval' | 'Generation' | 'Both';

/**
 * LLM Judge 진단 방법론
 */
export type DiagnosisMethod = 'LLM Judge' | 'Heuristic' | 'Not Analyzed';

export interface LLMJudgeRootCause {
  failure_type: LLMJudgeFailureType;
  reason: string;                        // 50자 요약
  root_cause: {
    summary_ko: string;                  // 상세 분석 (한국어)
    advice_ko: string;                   // 개선 조언 (한국어)
  };
  llm_model?: string;                    // 사용된 LLM Judge 모델
  prompt_version?: string;               // 사용된 프롬프트 버전
  confidence?: number;                   // 진단 신뢰도 (0-1)
  analyzed_at?: string;                  // 분석 시각
  diagnosis_method?: DiagnosisMethod;    // 진단 방법
}

/**
 * LLM Judge 프롬프트 템플릿
 */
export interface LLMJudgePromptTemplate {
  id: string;
  version: string;                       // 예: "v1.2"
  name: string;
  system_persona: string;                // 시스템 역할 정의
  diagnostic_steps: string[];            // CoT 단계
  output_format: string;                 // JSON 출력 형식
  is_active: boolean;
  created_at: string;
  updated_at: string;
  performance_metrics?: {
    accuracy: number;                    // 진단 정확도 (0-1)
    advice_success_rate: number;         // 조언 실행 성공률 (0-1)
    test_cases: number;                  // 테스트한 케이스 수
  };
}

/**
 * LLM Judge 근본 원인 분석 요청
 */
export interface LLMJudgeAnalysisRequest {
  user_question: string;
  expected_answer?: string;
  generated_answer: string;
  retrieved_contexts: string[];
  failed_metric: string;
  prompt_version?: string;               // 특정 버전 사용 (선택 사항)
}

/**
 * LLM Judge 피드백
 */
export interface LLMJudgeFeedback {
  id: string;
  failed_case_id: string;
  user_id: string;
  rating: 'accurate' | 'inaccurate' | 'suggestion';
  comment?: string;
  created_at: string;
}

/**
 * 확장된 실패 케이스 (LLM Judge 분석 포함)
 */
export interface FailedCaseWithRootCause extends FailedCase {
  llmJudgeAnalysis: LLMJudgeRootCause;
  retrievedContexts: string[];           // 검색된 모든 컨텍스트
  failedMetric: string;                  // 실패한 지표명
}
