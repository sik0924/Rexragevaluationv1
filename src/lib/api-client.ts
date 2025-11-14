/**
 * REX API Client
 * 백엔드 API와 통신하기 위한 클라이언트 레이어
 */

import {
  ApiResponse,
  Dataset,
  QAPair,
  EvaluationConfig,
  EvaluationResult,
  EvaluationHistory,
  EvaluationStatusResponse,
  FailedCase,
  MetricDistribution,
  LLMModel,
  VectorDB,
  EvaluationMetric,
  LogEntry,
  SystemStatus,
  AutoImproveJob,
  AutoImproveExperiment,
  CreateEvaluationRequest,
  CreateAutoImproveRequest,
  AnalyzeRootCauseRequest,
  GenerateExperimentsRequest,
  RootCauseAnalysis,
  PaginationParams,
  CostSummary,
  EvaluationCost,
  CostEstimate,
  Budget,
  CostAlert,
  CostOptimizationSuggestion,
  LLMPricing,
} from '../types';

// ============================================
// API Configuration
// ============================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.rex.com/api/v1';
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || true; // 개발 중에는 true

// ============================================
// HTTP Client Utilities
// ============================================

interface RequestOptions extends RequestInit {
  params?: Record<string, any>;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    try {
      const { params, ...fetchOptions } = options;
      const url = this.buildUrl(endpoint, params);

      const response = await fetch(url, {
        ...fetchOptions,
        headers: {
          ...this.getHeaders(),
          ...fetchOptions.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || {
            code: `HTTP_${response.status}`,
            message: response.statusText,
          },
        };
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  get<T>(endpoint: string, params?: Record<string, any>) {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  post<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  put<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

const apiClient = new ApiClient(API_BASE_URL);

// ============================================
// API Functions
// ============================================

// -------------------- Authentication --------------------
export const authApi = {
  /**
   * 로그인
   */
  login: async (email: string, password: string) => {
    return apiClient.post<{ token: string; user: any }>('/auth/login', {
      email,
      password,
    });
  },

  /**
   * 로그아웃
   */
  logout: async () => {
    return apiClient.post('/auth/logout');
  },

  /**
   * 토큰 설정
   */
  setToken: (token: string) => {
    apiClient.setToken(token);
  },

  /**
   * 토큰 제거
   */
  clearToken: () => {
    apiClient.clearToken();
  },
};

// -------------------- Datasets --------------------
export const datasetsApi = {
  /**
   * 데이터셋 목록 조회
   */
  list: async (params?: PaginationParams & { type?: string }) => {
    return apiClient.get<{ datasets: Dataset[] }>('/datasets', params);
  },

  /**
   * 데이터셋 상세 조회
   */
  get: async (id: string) => {
    return apiClient.get<Dataset>(`/datasets/${id}`);
  },

  /**
   * 데이터셋 생성
   */
  create: async (formData: FormData) => {
    // FormData는 별도 처리 필요
    const response = await fetch(`${API_BASE_URL}/datasets`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiClient['token']}`,
      },
      body: formData,
    });
    return response.json();
  },

  /**
   * 데이터셋 삭제
   */
  delete: async (id: string) => {
    return apiClient.delete<{ message: string }>(`/datasets/${id}`);
  },
};

// -------------------- Evaluations --------------------
export const evaluationsApi = {
  /**
   * 신규 평가 생성 및 실행
   */
  create: async (request: CreateEvaluationRequest) => {
    return apiClient.post<{
      id: string;
      job_id: string;
      status: string;
      created_at: string;
      message: string;
    }>('/evaluations', request);
  },

  /**
   * 평가 이력 조회
   */
  getHistory: async (params?: PaginationParams & { status?: string }) => {
    return apiClient.get<{ evaluations: EvaluationHistory[] }>(
      '/evaluations/history',
      params
    );
  },

  /**
   * 실시간 평가 상태 조회 (Polling용)
   */
  getStatus: async (id: string) => {
    return apiClient.get<EvaluationStatusResponse>(`/evaluations/${id}/status`);
  },

  /**
   * 평가 중단
   */
  stop: async (id: string) => {
    return apiClient.post<{ id: string; status: string }>(
      `/evaluations/${id}/stop`
    );
  },
};

// -------------------- Results --------------------
export const resultsApi = {
  /**
   * 최종 결과 보고서 조회
   */
  get: async (id: string) => {
    return apiClient.get<EvaluationResult>(`/results/${id}`);
  },

  /**
   * 실패 케이스 상세 조회
   */
  getFailedCases: async (
    id: string,
    params?: { threshold?: number; root_cause?: 'retrieval' | 'generation' }
  ) => {
    return apiClient.get<{ failed_cases: FailedCase[]; total: number }>(
      `/results/${id}/failed-cases`,
      params
    );
  },

  /**
   * 지표별 상세 분석
   */
  getMetricDetails: async (id: string, metricName: string) => {
    return apiClient.get<MetricDistribution>(
      `/results/${id}/metrics/${metricName}`
    );
  },

  /**
   * 진단 요약 조회 (LLM Judge 비용 절감)
   */
  getDiagnosisSummary: async (id: string) => {
    return apiClient.get<{
      total_failed_cases: number;
      heuristic_classified: number;
      llm_judge_analyzed: number;
      not_analyzed: number;
      total_cost: number;
      cost_saved: number;
      cost_saved_percentage: number;
      breakdown: {
        heuristic_reasons: Array<{
          reason: string;
          count: number;
          percentage: number;
        }>;
        llm_judge_distribution: {
          retrieval: number;
          generation: number;
          other: number;
        };
      };
    }>(`/results/${id}/diagnosis/summary`);
  },

  /**
   * 진단된 실패 케이스 상세 조회
   */
  getDiagnosedCases: async (
    id: string,
    params?: {
      diagnosis_method?: 'LLM Judge' | 'Heuristic' | 'Not Analyzed';
      root_cause?: 'retrieval' | 'generation';
      heuristic_reason?: string;
    }
  ) => {
    return apiClient.get<{
      cases: Array<FailedCase & {
        diagnosis_method: 'LLM Judge' | 'Heuristic' | 'Not Analyzed';
        sampled: boolean;
        heuristic_reason?: string;
        context_tokens?: number;
        llm_analysis?: {
          root_cause: 'retrieval' | 'generation';
          reason: string;
          suggestion: string;
        };
      }>;
      total: number;
    }>(`/results/${id}/diagnosis/cases`, params);
  },
};

// -------------------- Resources --------------------
export const resourcesApi = {
  /**
   * LLM 모델 목록 조회
   */
  getModels: async () => {
    return apiClient.get<{ models: LLMModel[] }>('/models');
  },

  /**
   * Vector DB 목록 조회
   */
  getVectorDBs: async () => {
    return apiClient.get<{ vector_dbs: VectorDB[] }>('/vector-dbs');
  },

  /**
   * 평가 지표 목록 조회
   */
  getMetrics: async () => {
    return apiClient.get<{ metrics: EvaluationMetric[] }>('/metrics');
  },

  /**
   * 🌟 RAG 파라미터 설정 메타데이터 조회 (동적 범위)
   */
  getConfigMetadata: async (params?: { model_id?: string }) => {
    return apiClient.get<{
      rag_params: {
        top_k: { min: number; max: number; default: number; step: number };
        chunk_size: { min: number; max: number; default: number; step: number };
        chunk_overlap: { min: number; max: number; default: number; step: number };
        similarity_threshold: { min: number; max: number; default: number; step: number };
        retriever_types: Array<'semantic' | 'hybrid' | 'keyword'>;
      };
      llm_judge_params: {
        score_threshold: { min: number; max: number; default: number };
        context_recall_threshold: { min: number; max: number; default: number };
        min_context_tokens: { min: number; max: number; default: number };
      };
    }>('/config/params', params);
  },
};

// -------------------- Auto-Improve --------------------
export const autoImproveApi = {
  /**
   * 근본 원인 분석 (Root Cause Analysis)
   * 평가 결과를 분석하여 어떤 파라미터를 개선해야 하는지 제안
   */
  analyzeRootCause: async (request: AnalyzeRootCauseRequest) => {
    return apiClient.post<RootCauseAnalysis>('/auto-improve/analyze', request);
  },

  /**
   * 실험 조합 생성
   * 선택된 전략에 따라 최적화할 파라미터 조합을 생성
   */
  generateExperiments: async (request: GenerateExperimentsRequest) => {
    return apiClient.post<{
      job_id: string;
      experiments: AutoImproveExperiment[];
      total_experiments: number;
      estimated_cost: number;
      estimated_duration_minutes: number;
    }>('/auto-improve/generate-experiments', request);
  },

  /**
   * 자동 개선 작업 생성 및 시작
   */
  create: async (request: CreateAutoImproveRequest) => {
    return apiClient.post<{
      job_id: string;
      status: string;
      created_at: string;
      websocket_url: string;
    }>('/auto-improve/jobs', request);
  },

  /**
   * 자동 개선 작업 목록 조회
   */
  list: async (params?: PaginationParams & { status?: string }) => {
    return apiClient.get<{
      jobs: AutoImproveJob[];
    }>('/auto-improve/jobs', params);
  },

  /**
   * 자동 개선 작업 상세 조회
   */
  get: async (jobId: string) => {
    return apiClient.get<AutoImproveJob>(`/auto-improve/jobs/${jobId}`);
  },

  /**
   * 자동 개선 진행 상태 조회
   */
  getStatus: async (jobId: string) => {
    return apiClient.get<{
      job_id: string;
      status: string;
      progress: number;
      current_experiment_index: number;
      total_experiments: number;
      current_best_score?: number;
      experiments_completed: number;
    }>(`/auto-improve/jobs/${jobId}/status`);
  },

  /**
   * 자동 개선 결과 조회
   */
  getResults: async (jobId: string) => {
    return apiClient.get<{
      job_id: string;
      status: string;
      experiments_completed: number;
      best_config: Record<string, any>;
      improvement: {
        baseline_score: number;
        best_score: number;
        improvement_rate: number;
        improved_metrics: Record<string, { before: number; after: number }>;
      };
      detailed_results: AutoImproveExperiment[];
      total_cost: number;
      duration_minutes: number;
    }>(`/auto-improve/jobs/${jobId}`);
  },

  /**
   * 자동 개선 작업 취소
   */
  cancel: async (jobId: string) => {
    return apiClient.post<{
      job_id: string;
      status: string;
    }>(`/auto-improve/jobs/${jobId}/cancel`, {});
  },

  /**
   * 자동 개선 작업 일시정지
   */
  pause: async (jobId: string) => {
    return apiClient.post<{
      job_id: string;
      status: string;
    }>(`/auto-improve/jobs/${jobId}/pause`, {});
  },

  /**
   * 자동 개선 작업 재개
   */
  resume: async (jobId: string) => {
    return apiClient.post<{
      job_id: string;
      status: string;
    }>(`/auto-improve/jobs/${jobId}/resume`, {});
  },

  /**
   * 최적 설정을 새 평가에 적용
   */
  applyBestConfig: async (jobId: string, datasetId: string) => {
    return apiClient.post<{
      evaluation_id: string;
      config: Record<string, any>;
    }>(`/auto-improve/jobs/${jobId}/apply`, { dataset_id: datasetId });
  },
};

// -------------------- Admin & Logs --------------------
export const adminApi = {
  /**
   * 로그 조회
   */
  getLogs: async (
    params?: PaginationParams & {
      level?: string;
      session_id?: string;
      start_date?: string;
      end_date?: string;
    }
  ) => {
    return apiClient.get<{ logs: LogEntry[] }>('/logs', params);
  },

  /**
   * 시스템 상태 조회
   */
  getSystemStatus: async () => {
    return apiClient.get<SystemStatus>('/system/status');
  },
};

// ============================================
// WebSocket Client (실시간 모니터링)
// ============================================

export class EvaluationWebSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;

  constructor(evaluationId: string, token?: string) {
    const wsUrl = API_BASE_URL.replace('http', 'ws');
    this.url = `${wsUrl}/ws/evaluations/${evaluationId}${token ? `?token=${token}` : ''}`;
  }

  connect(
    onMessage: (data: any) => void,
    onError?: (error: Event) => void,
    onClose?: () => void
  ) {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      onError?.(error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      onClose?.();
      this.attemptReconnect(onMessage, onError, onClose);
    };
  }

  private attemptReconnect(
    onMessage: (data: any) => void,
    onError?: (error: Event) => void,
    onClose?: () => void
  ) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect(onMessage, onError, onClose);
      }, this.reconnectDelay);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }
}

/**
 * Auto-Improve WebSocket Client
 * 자동 개선 작업의 실시간 진행 상황을 모니터링
 */
export class AutoImproveWebSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;

  constructor(jobId: string, token?: string) {
    const wsUrl = API_BASE_URL.replace('http', 'ws');
    this.url = `${wsUrl}/ws/auto-improve/${jobId}${token ? `?token=${token}` : ''}`;
  }

  connect(
    onMessage: (data: any) => void,
    onError?: (error: Event) => void,
    onClose?: () => void
  ) {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log('Auto-Improve WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('Auto-Improve WebSocket error:', error);
      onError?.(error);
    };

    this.ws.onclose = () => {
      console.log('Auto-Improve WebSocket disconnected');
      onClose?.();
      this.attemptReconnect(onMessage, onError, onClose);
    };
  }

  private attemptReconnect(
    onMessage: (data: any) => void,
    onError?: (error: Event) => void,
    onClose?: () => void
  ) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect Auto-Improve WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect(onMessage, onError, onClose);
      }, this.reconnectDelay);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }
}

// ============================================
// Mock Mode Handling
// ============================================

/**
 * Mock 데이터 사용 여부 확인
 */
export const useMockData = () => USE_MOCK_DATA;

/**
 * API 클라이언트 내보내기 (고급 사용자용)
 */
export { apiClient };

// -------------------- Cost Management --------------------
export const costApi = {
  /**
   * 비용 요약 조회
   */
  getSummary: async (params?: { period?: 'today' | 'week' | 'month' | 'all' }) => {
    return apiClient.get<CostSummary>('/costs/summary', params);
  },

  /**
   * 평가별 비용 조회
   */
  getByEvaluation: async (evaluationId: string) => {
    return apiClient.get<EvaluationCost>(`/costs/evaluations/${evaluationId}`);
  },

  /**
   * 평가 비용 예측
   */
  predictCost: async (request: {
    dataset_id: string;
    metrics: string[];
    sampling_rate?: number;
  }) => {
    return apiClient.post<CostEstimate>('/costs/predict', request);
  },

  /**
   * 전체 평가 비용 내역
   */
  listEvaluationCosts: async (params?: PaginationParams & {
    start_date?: string;
    end_date?: string;
    min_cost?: number;
    max_cost?: number;
  }) => {
    return apiClient.get<{
      costs: EvaluationCost[];
      total_cost: number;
    }>('/costs/evaluations', params);
  },

  /**
   * LLM 가격 정보 조회
   */
  getPricing: async () => {
    return apiClient.get<{
      pricing: LLMPricing[];
      last_updated: string;
    }>('/costs/pricing');
  },

  /**
   * 비용 최적화 제안
   */
  getOptimizationSuggestions: async (evaluationId?: string) => {
    return apiClient.get<{
      suggestions: CostOptimizationSuggestion[];
    }>('/costs/optimize', evaluationId ? { evaluation_id: evaluationId } : undefined);
  },
};

// -------------------- Budget Management --------------------
export const budgetApi = {
  /**
   * 예산 목록 조회
   */
  list: async (params?: PaginationParams & {
    type?: 'project' | 'user' | 'organization';
  }) => {
    return apiClient.get<{
      budgets: Budget[];
    }>('/budgets', params);
  },

  /**
   * 예산 상세 조회
   */
  get: async (budgetId: string) => {
    return apiClient.get<Budget>(`/budgets/${budgetId}`);
  },

  /**
   * 예산 생성
   */
  create: async (request: {
    name: string;
    type: 'project' | 'user' | 'organization';
    entity_id: string;
    limit: number;
    period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    alert_thresholds?: number[];
    is_hard_limit?: boolean;
  }) => {
    return apiClient.post<Budget>('/budgets', request);
  },

  /**
   * 예산 수정
   */
  update: async (budgetId: string, request: {
    limit?: number;
    alert_thresholds?: number[];
    is_hard_limit?: boolean;
  }) => {
    return apiClient.put<Budget>(`/budgets/${budgetId}`, request);
  },

  /**
   * 예산 삭제
   */
  delete: async (budgetId: string) => {
    return apiClient.delete<void>(`/budgets/${budgetId}`);
  },

  /**
   * 예산 알림 조회
   */
  getAlerts: async (params?: PaginationParams & {
    severity?: 'info' | 'warning' | 'critical';
    is_acknowledged?: boolean;
  }) => {
    return apiClient.get<{
      alerts: CostAlert[];
    }>('/budgets/alerts', params);
  },

  /**
   * 알림 확인 처리
   */
  acknowledgeAlert: async (alertId: string) => {
    return apiClient.post<CostAlert>(`/budgets/alerts/${alertId}/acknowledge`, {});
  },
};

// -------------------- Diagnosis --------------------
export const diagnosisApi = {
  /**
   * 진단 파이프라인 실행 (수동 트리거)
   * 평가 완료 후 자동으로 실행되지만, 필요시 수동으로 재실행 가능
   */
  runDiagnosisPipeline: async (
    evaluationId: string,
    options?: {
      mode?: 'auto' | 'fixed_ratio' | 'max_cases';
      fixed_ratio?: number;
      max_cases?: number;
      enable_heuristics?: boolean;
    }
  ) => {
    return apiClient.post<{
      evaluation_id: string;
      status: string;
      processed_cases: number;
      heuristic_classified: number;
      llm_judge_analyzed: number;
      total_cost: number;
      message: string;
    }>(`/diagnosis/${evaluationId}/run`, options);
  },

  /**
   * 진단 진행 상태 조회
   */
  getStatus: async (evaluationId: string) => {
    return apiClient.get<{
      evaluation_id: string;
      status: 'pending' | 'running' | 'completed' | 'failed';
      progress: number;
      current_phase: 'heuristic' | 'sampling' | 'llm_judge' | 'complete';
      processed_cases: number;
      total_cases: number;
      estimated_cost: number;
    }>(`/diagnosis/${evaluationId}/status`);
  },

  /**
   * 비용 예측 (진단 실행 전 미리보기)
   */
  estimateCost: async (
    evaluationId: string,
    options?: {
      mode?: 'auto' | 'fixed_ratio' | 'max_cases';
      fixed_ratio?: number;
      max_cases?: number;
    }
  ) => {
    return apiClient.post<{
      total_failed_cases: number;
      estimated_heuristic: number;
      estimated_llm_judge: number;
      estimated_cost: number;
      cost_without_filtering: number;
      cost_saved: number;
      cost_saved_percentage: number;
    }>(`/diagnosis/${evaluationId}/estimate`, options);
  },
};

/**
 * 통합 API 객체
 */
export const api = {
  auth: authApi,
  datasets: datasetsApi,
  evaluations: evaluationsApi,
  results: resultsApi,
  resources: resourcesApi,
  autoImprove: autoImproveApi,
  admin: adminApi,
  cost: costApi,
  budget: budgetApi,
  diagnosis: diagnosisApi,
};
