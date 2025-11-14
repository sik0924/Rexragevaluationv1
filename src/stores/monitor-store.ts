/**
 * Monitor Store
 * 실시간 평가 모니터링 및 진행 상태 관리
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  EvaluationResult, 
  EvaluationStatus,
  EvaluationStatusResponse,
  WebSocketMessage 
} from '../types';
import { EvaluationWebSocket } from '../lib/api-client';

// ============================================
// Store State Interface
// ============================================

interface MonitoringEvaluation {
  id: string;
  name: string;
  status: EvaluationStatus;
  progress: number;
  startedAt: string;
  currentTask?: string;
  estimatedCompletion?: string;
  metricsProcessed?: Record<string, number>;
}

interface MonitorStore {
  // 모니터링 중인 평가 목록
  activeEvaluations: MonitoringEvaluation[];
  
  // 현재 선택된 평가 ID
  selectedEvaluationId: string | null;
  
  // WebSocket 연결 상태
  wsConnections: Map<string, EvaluationWebSocket>;
  
  // 실시간 로그 메시지
  realtimeLogs: Array<{
    timestamp: string;
    message: string;
    evaluation_id: string;
  }>;
  
  // Actions
  addEvaluation: (evaluation: MonitoringEvaluation) => void;
  removeEvaluation: (evaluationId: string) => void;
  updateEvaluationStatus: (evaluationId: string, status: Partial<EvaluationStatusResponse>) => void;
  selectEvaluation: (evaluationId: string | null) => void;
  
  // WebSocket 관리
  connectWebSocket: (evaluationId: string, token?: string) => void;
  disconnectWebSocket: (evaluationId: string) => void;
  disconnectAllWebSockets: () => void;
  
  // 로그 관리
  addLog: (log: { timestamp: string; message: string; evaluation_id: string }) => void;
  clearLogs: (evaluationId?: string) => void;
  
  // Polling 관리 (WebSocket 대안)
  startPolling: (evaluationId: string, onUpdate: (status: EvaluationStatusResponse) => void) => void;
  stopPolling: (evaluationId: string) => void;
  
  // 초기화
  reset: () => void;
}

// ============================================
// Polling Manager
// ============================================

class PollingManager {
  private intervals: Map<string, NodeJS.Timeout> = new Map();

  start(
    evaluationId: string,
    callback: () => Promise<void>,
    intervalMs: number = 3000
  ) {
    // 이미 실행 중이면 중단
    this.stop(evaluationId);

    const interval = setInterval(async () => {
      try {
        await callback();
      } catch (error) {
        console.error(`Polling error for ${evaluationId}:`, error);
      }
    }, intervalMs);

    this.intervals.set(evaluationId, interval);
  }

  stop(evaluationId: string) {
    const interval = this.intervals.get(evaluationId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(evaluationId);
    }
  }

  stopAll() {
    this.intervals.forEach((interval) => clearInterval(interval));
    this.intervals.clear();
  }
}

const pollingManager = new PollingManager();

// ============================================
// Initial State
// ============================================

const INITIAL_STATE = {
  activeEvaluations: [],
  selectedEvaluationId: null,
  wsConnections: new Map<string, EvaluationWebSocket>(),
  realtimeLogs: [],
};

// ============================================
// Zustand Store
// ============================================

export const useMonitorStore = create<MonitorStore>()(
  devtools(
    (set, get) => ({
      ...INITIAL_STATE,

      // 평가 추가
      addEvaluation: (evaluation) => {
        set(
          (state) => ({
            activeEvaluations: [
              ...state.activeEvaluations.filter((e) => e.id !== evaluation.id),
              evaluation,
            ],
          }),
          false,
          'addEvaluation'
        );
      },

      // 평가 제거
      removeEvaluation: (evaluationId) => {
        // WebSocket 연결 해제
        get().disconnectWebSocket(evaluationId);
        
        // Polling 중단
        pollingManager.stop(evaluationId);

        set(
          (state) => ({
            activeEvaluations: state.activeEvaluations.filter(
              (e) => e.id !== evaluationId
            ),
          }),
          false,
          'removeEvaluation'
        );
      },

      // 평가 상태 업데이트
      updateEvaluationStatus: (evaluationId, status) => {
        set(
          (state) => ({
            activeEvaluations: state.activeEvaluations.map((e) =>
              e.id === evaluationId ? { ...e, ...status } : e
            ),
          }),
          false,
          'updateEvaluationStatus'
        );

        // 완료되면 자동으로 제거
        if (status.status === 'completed' || status.status === 'failed') {
          setTimeout(() => {
            get().removeEvaluation(evaluationId);
          }, 5000); // 5초 후 제거
        }
      },

      // 평가 선택
      selectEvaluation: (evaluationId) => {
        set({ selectedEvaluationId: evaluationId }, false, 'selectEvaluation');
      },

      // WebSocket 연결
      connectWebSocket: (evaluationId, token) => {
        const ws = new EvaluationWebSocket(evaluationId, token);
        
        ws.connect(
          (message: WebSocketMessage) => {
            // 메시지 타입에 따라 처리
            switch (message.type) {
              case 'progress_update':
                get().updateEvaluationStatus(evaluationId, {
                  progress: message.data.progress,
                  currentTask: message.data.current_task,
                });
                break;
              
              case 'status_change':
                get().updateEvaluationStatus(evaluationId, {
                  status: message.data.status,
                });
                break;
              
              case 'log':
                get().addLog({
                  timestamp: message.data.timestamp,
                  message: message.data.message || '',
                  evaluation_id: evaluationId,
                });
                break;
              
              case 'error':
                console.error('WebSocket error:', message.data);
                get().updateEvaluationStatus(evaluationId, {
                  status: 'failed',
                });
                break;
            }
          },
          (error) => {
            console.error('WebSocket connection error:', error);
          },
          () => {
            console.log('WebSocket disconnected');
          }
        );

        // Store에 저장
        const connections = get().wsConnections;
        connections.set(evaluationId, ws);
        set({ wsConnections: new Map(connections) }, false, 'connectWebSocket');
      },

      // WebSocket 연결 해제
      disconnectWebSocket: (evaluationId) => {
        const connections = get().wsConnections;
        const ws = connections.get(evaluationId);
        
        if (ws) {
          ws.disconnect();
          connections.delete(evaluationId);
          set({ wsConnections: new Map(connections) }, false, 'disconnectWebSocket');
        }
      },

      // 모든 WebSocket 연결 해제
      disconnectAllWebSockets: () => {
        const connections = get().wsConnections;
        connections.forEach((ws) => ws.disconnect());
        set({ wsConnections: new Map() }, false, 'disconnectAllWebSockets');
      },

      // 로그 추가
      addLog: (log) => {
        set(
          (state) => ({
            realtimeLogs: [...state.realtimeLogs, log].slice(-100), // 최근 100개만 유지
          }),
          false,
          'addLog'
        );
      },

      // 로그 삭제
      clearLogs: (evaluationId) => {
        set(
          (state) => ({
            realtimeLogs: evaluationId
              ? state.realtimeLogs.filter((log) => log.evaluation_id !== evaluationId)
              : [],
          }),
          false,
          'clearLogs'
        );
      },

      // Polling 시작 (WebSocket 대안)
      startPolling: (evaluationId, onUpdate) => {
        pollingManager.start(
          evaluationId,
          async () => {
            // API 호출은 외부에서 주입받음
            // 이는 api-client 순환 참조를 방지하기 위함
            onUpdate({
              id: evaluationId,
              status: 'running',
              progress: 0,
            });
          },
          3000 // 3초마다 polling
        );
      },

      // Polling 중단
      stopPolling: (evaluationId) => {
        pollingManager.stop(evaluationId);
      },

      // 초기화
      reset: () => {
        get().disconnectAllWebSockets();
        pollingManager.stopAll();
        set(INITIAL_STATE, false, 'reset');
      },
    }),
    {
      name: 'monitor-store',
    }
  )
);

// ============================================
// Selectors
// ============================================

export const useActiveEvaluations = () =>
  useMonitorStore((state) => state.activeEvaluations);

export const useSelectedEvaluation = () => {
  const selectedId = useMonitorStore((state) => state.selectedEvaluationId);
  const evaluations = useMonitorStore((state) => state.activeEvaluations);
  return evaluations.find((e) => e.id === selectedId) || null;
};

export const useRealtimeLogs = (evaluationId?: string) =>
  useMonitorStore((state) =>
    evaluationId
      ? state.realtimeLogs.filter((log) => log.evaluation_id === evaluationId)
      : state.realtimeLogs
  );

export const useIsWebSocketConnected = (evaluationId: string) =>
  useMonitorStore((state) => state.wsConnections.has(evaluationId));
