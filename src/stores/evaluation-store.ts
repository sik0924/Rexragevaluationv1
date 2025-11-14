/**
 * Evaluation Store
 * 평가 설정 및 구성 중인 평가 데이터를 전역으로 관리
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { 
  EvaluationConfig, 
  MetricConfig,
  MetricName,
  CreateEvaluationRequest 
} from '../types';

// ============================================
// Store State Interface
// ============================================

interface EvaluationStore {
  // 현재 구성 중인 평가 설정
  currentConfig: Partial<CreateEvaluationRequest>;
  
  // 선택된 데이터셋
  selectedDatasetId: string | null;
  
  // 선택된 LLM 모델
  selectedModelId: string | null;
  
  // 선택된 Vector DB
  selectedVectorDbId: string | null;
  
  // 선택된 평가 지표 설정
  selectedMetrics: MetricConfig[];
  
  // 평가 이름
  evaluationName: string;
  
  // 선택된 평가 결과 ID (결과 페이지용)
  selectedEvaluationId: string | null;
  
  // 스케줄 설정
  scheduleConfig: {
    max_iterations: number;
    start_time: string | null;
  };
  
  // Actions
  setDataset: (datasetId: string) => void;
  setModel: (modelId: string) => void;
  setVectorDb: (vectorDbId: string) => void;
  setEvaluationName: (name: string) => void;
  setSelectedEvaluationId: (id: string | null) => void;
  
  // 지표 관련
  toggleMetric: (metricName: MetricName) => void;
  updateMetricConfig: (metricName: MetricName, config: Partial<MetricConfig>) => void;
  setAllMetrics: (enabled: boolean) => void;
  
  // 스케줄 설정
  setScheduleConfig: (config: { max_iterations: number; start_time: string | null }) => void;
  
  // 전체 설정 관리
  resetConfig: () => void;
  loadConfig: (config: EvaluationConfig) => void;
  getCurrentRequest: () => CreateEvaluationRequest | null;
  
  // 유효성 검사
  isConfigValid: () => boolean;
}

// ============================================
// Default Values
// ============================================

const DEFAULT_METRICS: MetricConfig[] = [
  { name: 'faithfulness', is_enabled: true, weight: 1.0, threshold: 0.8 },
  { name: 'answer_relevancy', is_enabled: true, weight: 1.0, threshold: 0.75 },
  { name: 'context_precision', is_enabled: true, weight: 1.0, threshold: 0.85 },
  { name: 'context_recall', is_enabled: true, weight: 1.0, threshold: 0.8 },
  { name: 'answer_correctness', is_enabled: true, weight: 1.0, threshold: 0.8 },
  { name: 'context_entity_recall', is_enabled: false, weight: 1.0, threshold: 0.75 },
  { name: 'answer_similarity', is_enabled: false, weight: 1.0, threshold: 0.8 },
  { name: 'harmfulness', is_enabled: false, weight: 1.0, threshold: 0.9 },
  { name: 'maliciousness', is_enabled: false, weight: 1.0, threshold: 0.9 },
  { name: 'coherence', is_enabled: false, weight: 1.0, threshold: 0.8 },
  { name: 'critique_correctness', is_enabled: false, weight: 1.0, threshold: 0.8 },
  { name: 'conciseness', is_enabled: false, weight: 1.0, threshold: 0.75 },
];

const INITIAL_STATE = {
  currentConfig: {},
  selectedDatasetId: null,
  selectedModelId: null,
  selectedVectorDbId: null,
  selectedMetrics: DEFAULT_METRICS,
  evaluationName: '',
  selectedEvaluationId: null,
  scheduleConfig: {
    max_iterations: 1,
    start_time: null,
  },
};

// ============================================
// Zustand Store
// ============================================

export const useEvaluationStore = create<EvaluationStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...INITIAL_STATE,

        // Dataset 설정
        setDataset: (datasetId) =>
          set({ selectedDatasetId: datasetId }, false, 'setDataset'),

        // Model 설정
        setModel: (modelId) =>
          set({ selectedModelId: modelId }, false, 'setModel'),

        // Vector DB 설정
        setVectorDb: (vectorDbId) =>
          set({ selectedVectorDbId: vectorDbId }, false, 'setVectorDb'),

        // 평가 이름 설정
        setEvaluationName: (name) =>
          set({ evaluationName: name }, false, 'setEvaluationName'),

        // 선택된 평가 결과 ID 설정
        setSelectedEvaluationId: (id) =>
          set({ selectedEvaluationId: id }, false, 'setSelectedEvaluationId'),

        // 특정 지표 토글
        toggleMetric: (metricName) => {
          const metrics = get().selectedMetrics;
          const updatedMetrics = metrics.map((m) =>
            m.name === metricName ? { ...m, is_enabled: !m.is_enabled } : m
          );
          set({ selectedMetrics: updatedMetrics }, false, 'toggleMetric');
        },

        // 지표 설정 업데이트 (가중치, 임계값 등)
        updateMetricConfig: (metricName, config) => {
          const metrics = get().selectedMetrics;
          const updatedMetrics = metrics.map((m) =>
            m.name === metricName ? { ...m, ...config } : m
          );
          set({ selectedMetrics: updatedMetrics }, false, 'updateMetricConfig');
        },

        // 모든 지표 활성화/비활성화
        setAllMetrics: (enabled) => {
          const metrics = get().selectedMetrics;
          const updatedMetrics = metrics.map((m) => ({ ...m, is_enabled: enabled }));
          set({ selectedMetrics: updatedMetrics }, false, 'setAllMetrics');
        },

        // 스케줄 설정
        setScheduleConfig: (config) =>
          set({ scheduleConfig: config }, false, 'setScheduleConfig'),

        // 설정 초기화
        resetConfig: () =>
          set(INITIAL_STATE, false, 'resetConfig'),

        // 기존 설정 불러오기
        loadConfig: (config) => {
          set(
            {
              selectedDatasetId: config.datasetId,
              selectedModelId: config.modelId,
              selectedVectorDbId: config.vectorDbId,
              evaluationName: config.name,
              selectedMetrics: config.metricsConfig || DEFAULT_METRICS,
            },
            false,
            'loadConfig'
          );
        },

        // API 요청용 객체 생성
        getCurrentRequest: () => {
          const state = get();
          
          if (!state.isConfigValid()) {
            return null;
          }

          const enabledMetrics = state.selectedMetrics.filter((m) => m.is_enabled);

          return {
            name: state.evaluationName,
            dataset_id: state.selectedDatasetId!,
            model_id: state.selectedModelId!,
            vector_db_id: state.selectedVectorDbId!,
            metrics: enabledMetrics,
            schedule_config: state.scheduleConfig,
          };
        },

        // 유효성 검사
        isConfigValid: () => {
          const state = get();
          const hasEnabledMetrics = state.selectedMetrics.some((m) => m.is_enabled);
          
          return (
            !!state.evaluationName &&
            !!state.selectedDatasetId &&
            !!state.selectedModelId &&
            !!state.selectedVectorDbId &&
            hasEnabledMetrics
          );
        },
      }),
      {
        name: 'evaluation-storage', // localStorage key
        partialize: (state) => ({
          // 영구 저장할 필드만 선택
          selectedMetrics: state.selectedMetrics,
          scheduleConfig: state.scheduleConfig,
        }),
      }
    )
  )
);

// ============================================
// Selectors (성능 최적화)
// ============================================

export const useSelectedDataset = () =>
  useEvaluationStore((state) => state.selectedDatasetId);

export const useSelectedModel = () =>
  useEvaluationStore((state) => state.selectedModelId);

export const useSelectedVectorDb = () =>
  useEvaluationStore((state) => state.selectedVectorDbId);

export const useEnabledMetrics = () =>
  useEvaluationStore((state) =>
    state.selectedMetrics.filter((m) => m.is_enabled)
  );

export const useIsConfigValid = () =>
  useEvaluationStore((state) => state.isConfigValid());
