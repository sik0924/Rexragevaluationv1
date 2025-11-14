import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { 
  Activity,
  CheckCircle2,
  AlertCircle,
  Pause,
  Play,
  XCircle,
  Terminal,
  Clock,
  Zap,
  TrendingUp,
  Cpu,
  ArrowLeft
} from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';

interface EvaluationMonitorPageBlueProps {
  onComplete: () => void;
  onBack?: () => void;
  initialProgress?: number;
}

interface LogMessage {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

export function EvaluationMonitorPageBlue({ onComplete, onBack, initialProgress = 0 }: EvaluationMonitorPageBlueProps) {
  const [progress, setProgress] = useState(initialProgress);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime] = useState(Date.now());
  
  // 초기 로그 설정 (초기 진행률에 따라 로그 추가)
  const getInitialLogs = () => {
    const baseLogs: LogMessage[] = [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        type: 'info',
        message: '평가 시작: Customer Support QA Dataset'
      },
      {
        id: '2',
        timestamp: new Date().toISOString(),
        type: 'info',
        message: 'LLM 모델: GPT-4, Vector DB: Pinecone Production'
      },
      {
        id: '3',
        timestamp: new Date().toISOString(),
        type: 'success',
        message: '데이터셋 로드 완료 (50 QA)'
      }
    ];
    
    // 초기 진행률이 있으면 진행 중 로그 추가
    if (initialProgress > 0) {
      const initialQuestion = Math.floor((initialProgress / 100) * 50);
      baseLogs.push({
        id: '4',
        timestamp: new Date().toISOString(),
        type: 'info',
        message: `평가 진행 중... (${initialQuestion}/50 질문 처리 완료)`
      });
    }
    
    return baseLogs;
  };
  
  const [logs, setLogs] = useState<LogMessage[]>(getInitialLogs());

  const totalQuestions = 50;
  const selectedMetrics = 12; // 선택된 평가 지표 개수

  // API 호출 횟수 계산
  const apiCallsPerQuestion = 1 + 1 + selectedMetrics; // Vector DB(1) + LLM 생성(1) + Judge(N)
  const totalApiCalls = apiCallsPerQuestion * totalQuestions;
  const completedApiCalls = apiCallsPerQuestion * currentQuestion;

  // 초기 예상 시간 계산 (API 호출 기반)
  const avgVectorDBTime = 0.3; // 초 (임베딩 + 벡터 검색)
  const avgLLMGenerationTime = 1.5; // 초 (GPT-4 응답 생성)
  const avgLLMJudgeTime = 1.2; // 초 (각 지표당 LLM Judge 평가)
  const estimatedTimePerQuestion = avgVectorDBTime + avgLLMGenerationTime + (avgLLMJudgeTime * selectedMetrics);
  const initialEstimatedTotalTime = estimatedTimePerQuestion * totalQuestions;

  // 실제 처리 속도 및 예상 시간 계산
  const elapsedTime = (Date.now() - startTime) / 1000; // 초 단위
  const avgTimePerQuestion = currentQuestion > 0 ? elapsedTime / currentQuestion : estimatedTimePerQuestion;
  const remainingQuestions = totalQuestions - currentQuestion;
  const estimatedRemainingTime = avgTimePerQuestion * remainingQuestions;

  // 예상과 실제 속도 비교
  const speedDifference = currentQuestion > 5 
    ? ((estimatedTimePerQuestion - avgTimePerQuestion) / estimatedTimePerQuestion * 100)
    : 0;

  // 시간 포맷 함수
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.ceil(seconds)}초`;
    const minutes = Math.floor(seconds / 60);
    const secs = Math.ceil(seconds % 60);
    if (minutes < 60) return `${minutes}분 ${secs}초`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}시간 ${mins}분`;
  };

  // 초기 질문 번호 설정
  useEffect(() => {
    const initialQuestion = Math.floor((initialProgress / 100) * totalQuestions);
    setCurrentQuestion(initialQuestion || 1);
  }, [initialProgress, totalQuestions]);

  useEffect(() => {
    if (isPaused || progress >= 100) return;

    // 13분 30초 = 810초 = 810000ms
    // 100% 완료까지 810초 소요
    // 810000ms / 100 = 8100ms per 1%
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = Math.min(prev + 1, 100);
        
        // Simulate question progress
        const newCurrentQuestion = Math.floor((newProgress / 100) * totalQuestions);
        setCurrentQuestion(newCurrentQuestion);

        // Add random logs
        if (newProgress % 10 === 0 && newProgress < 100) {
          const logTypes: Array<'info' | 'success' | 'warning'> = ['info', 'success', 'warning'];
          const messages = [
            `질문 ${newCurrentQuestion}/${totalQuestions} 처리 중...`,
            `메트릭 계산 완료: Faithfulness = 0.${Math.floor(Math.random() * 100)}`,
            `Vector DB 검색 완료 (${(Math.random() * 2 + 0.5).toFixed(2)}s)`,
            `LLM 응답 생성 완료`,
          ];
          
          setLogs(prev => [...prev, {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            type: logTypes[Math.floor(Math.random() * logTypes.length)],
            message: messages[Math.floor(Math.random() * messages.length)]
          }]);
        }

        if (newProgress >= 100) {
          setLogs(prev => [...prev, {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            type: 'success',
            message: '평가 완료! 결과 리포트를 생성하는 중...'
          }]);
          setTimeout(() => onComplete(), 2000);
        }

        return newProgress;
      });
    }, 8100);

    return () => clearInterval(interval);
  }, [isPaused, progress, onComplete]);

  const handleStop = () => {
    if (confirm('평가를 중지하시겠습니까? 진행 중인 데이터는 저장되지 않습니다.')) {
      setLogs(prev => [...prev, {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        type: 'error',
        message: '사용자에 의해 평가가 중지되었습니다'
      }]);
      setTimeout(() => onComplete(), 1000);
    }
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl bg-gray-50/30 -m-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-gray-900 text-[28px] font-bold">고객 지원팀 답변 품질 개선</h1>
            <Badge className="bg-blue-600 text-white border-0 shrink-0">
              평가 진행 중
            </Badge>
          </div>
          <p className="text-gray-600 text-sm">
            실시간으로 평가 진행 상황을 모니터링합니다
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsPaused(!isPaused)}
              disabled={progress >= 100}
              className="border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              {isPaused ? (
                <>
                  <Play className="h-4 w-4 mr-1.5" />
                  재개
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4 mr-1.5" />
                  일시정지
                </>
              )}
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleStop}
              disabled={progress >= 100}
            >
              <XCircle className="h-4 w-4 mr-1.5" />
              중지
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <Card className="border-blue-100 bg-white shadow-sm">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-gray-900">전체 진행률</CardTitle>
              <CardDescription className="text-gray-600">
                현재 {currentQuestion}/{totalQuestions} 질문 처리 중 · API 호출: {completedApiCalls.toLocaleString()}/{totalApiCalls.toLocaleString()}회
              </CardDescription>
            </div>
            {speedDifference !== 0 && (
              <Badge className={`${
                speedDifference > 0 
                  ? 'bg-green-100 text-green-700 border-green-200' 
                  : 'bg-orange-100 text-orange-700 border-orange-200'
              } border`}>
                {speedDifference > 0 ? '예상보다 빠름' : '예상보다 느림'} ({Math.abs(speedDifference).toFixed(0)}%)
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">진행률</span>
              <span className="text-blue-600 font-semibold">{progress}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          <div className="grid grid-cols-4 gap-4 pt-4">
            <div className="text-center p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-gray-600 mb-1 text-sm">처리 완료</p>
              <p className="text-gray-900 text-xl font-semibold">{currentQuestion}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-gray-600 mb-1 text-sm">남은 질문</p>
              <p className="text-gray-900 text-xl font-semibold">{totalQuestions - currentQuestion}</p>
            </div>
            <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-gray-600 mb-1 text-sm flex items-center justify-center gap-1">
                <Zap className="h-3.5 w-3.5" />
                평균 속도
              </p>
              <p className="text-blue-700 text-xl font-semibold">
                {avgTimePerQuestion > 0 ? `${avgTimePerQuestion.toFixed(1)}초` : '--'}
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-gray-600 mb-1 text-sm flex items-center justify-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                예상 완료
              </p>
              <p className="text-green-700 text-xl font-semibold">
                {progress < 100 ? formatTime(estimatedRemainingTime) : '완료'}
              </p>
            </div>
          </div>

          {/* 예상 시간 근거 */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-900">예상 시간 계산 근거</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">• Vector DB 검색</span>
                  <span className="text-gray-900 font-medium">{totalQuestions}회 × {avgVectorDBTime}초</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">• LLM 답변 생성</span>
                  <span className="text-gray-900 font-medium">{totalQuestions}회 × {avgLLMGenerationTime}초</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">• LLM Judge 평가</span>
                  <span className="text-gray-900 font-medium">{(totalQuestions * selectedMetrics).toLocaleString()}회 × {avgLLMJudgeTime}초</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">총 API 호출</span>
                  <span className="text-blue-700 font-semibold">{totalApiCalls.toLocaleString()}회</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">초기 예상 시간</span>
                  <span className="text-gray-900 font-medium">{formatTime(initialEstimatedTotalTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">실시간 재계산</span>
                  <span className="text-green-700 font-semibold">{formatTime(elapsedTime + estimatedRemainingTime)}</span>
                </div>
              </div>
            </div>
            <div className="pt-2 border-t border-blue-300">
              <p className="text-xs text-gray-600">
                ⓘ 실제 소요 시간은 네트워크 상태, API 응답 속도, 데이터 복잡도에 따라 달라질 수 있습니다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Processing & Inference Details */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-blue-100 bg-white shadow-sm">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-gray-900">현재 처리 중</CardTitle>
            <CardDescription className="text-gray-600">실시간 처리 정보</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-gray-700 text-sm">현재 질문</span>
              <span className="text-gray-900 font-medium">질문 #{currentQuestion}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <span className="text-gray-700 text-sm">처리 단계</span>
              <Badge className="bg-purple-100 text-purple-700 border-purple-200 border">
                {progress < 30 ? 'Vector DB 검색' :
                 progress < 60 ? 'LLM 응답 생성' :
                 progress < 90 ? '메트릭 계산' : '결과 저장'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-100 bg-white shadow-sm">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <Cpu className="h-5 w-5 text-purple-600" />
              추론 상세 정보
            </CardTitle>
            <CardDescription className="text-gray-600">LLM 및 Vector DB 성능</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <span className="text-gray-700 text-sm flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4" />
                LLM 응답 속도
              </span>
              <span className="text-purple-700 font-medium">
                {avgTimePerQuestion > 0 ? `~${(avgTimePerQuestion * 0.6).toFixed(2)}초` : '--'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-gray-700 text-sm flex items-center gap-1.5">
                <Zap className="h-4 w-4" />
                Vector DB 검색
              </span>
              <span className="text-blue-700 font-medium">
                {avgTimePerQuestion > 0 ? `~${(avgTimePerQuestion * 0.3).toFixed(2)}초` : '--'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-gray-700 text-sm">평균 토큰/응답</span>
              <span className="text-green-700 font-medium">~450 토큰</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs */}
      <Card className="border-blue-100 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100">
          <div>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Terminal className="h-5 w-5" />
              실시간 로그
            </CardTitle>
            <CardDescription className="text-gray-600">평가 프로세스의 상세 로그</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setLogs([])}
            className="border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            로그 지우기
          </Button>
        </CardHeader>
        <CardContent className="pt-4">
          <ScrollArea className="h-[400px] w-full rounded-md border border-gray-200 bg-gray-50 p-4">
            <div className="space-y-2">
              {logs.map((log, index) => (
                <div key={log.id}>
                  <div className="flex items-start gap-3 py-2">
                    {getLogIcon(log.type)}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 text-xs">
                          {new Date(log.timestamp).toLocaleTimeString('ko-KR')}
                        </span>
                        <Badge className={`text-xs ${
                          log.type === 'success' ? 'bg-green-100 text-green-700 border-green-200 border' :
                          log.type === 'warning' ? 'bg-yellow-100 text-yellow-700 border-yellow-200 border' :
                          log.type === 'error' ? 'bg-red-100 text-red-700 border-red-200 border' :
                          'bg-blue-100 text-blue-700 border-blue-200 border'
                        }`}>
                          {log.type.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-900">{log.message}</p>
                    </div>
                  </div>
                  {index < logs.length - 1 && <Separator className="my-2" />}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* 이전 화면으로 돌아가기 버튼 */}
      {onBack && (
        <div className="flex justify-start pt-2">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            평가 목록으로 돌아가기
          </Button>
        </div>
      )}
    </div>
  );
}
