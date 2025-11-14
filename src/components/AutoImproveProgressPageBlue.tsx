import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  TrendingUp,
  ArrowRight,
  Pause,
  Play,
  StopCircle
} from 'lucide-react';

interface Experiment {
  id: string;
  name: string;
  config: Record<string, string>;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  score?: number;
  startTime?: Date;
  endTime?: Date;
  currentStep?: string;
}

interface AutoImproveProgressPageBlueProps {
  onComplete: () => void;
  onCancel: () => void;
  totalExperiments: number;
}

export function AutoImproveProgressPageBlue({ 
  onComplete,
  onCancel,
  totalExperiments = 12 
}: AutoImproveProgressPageBlueProps) {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [currentExperimentIndex, setCurrentExperimentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [bestScore, setBestScore] = useState<number>(0);
  const [startTime] = useState(new Date());

  // 실험 목록 초기화
  useEffect(() => {
    const initialExperiments: Experiment[] = Array.from({ length: totalExperiments }, (_, i) => ({
      id: `exp-${i + 1}`,
      name: `실험 #${i + 1}`,
      config: generateRandomConfig(i),
      status: 'pending',
      progress: 0
    }));
    setExperiments(initialExperiments);
  }, [totalExperiments]);

  // 비동기 평가 시뮬레이션
  useEffect(() => {
    if (isPaused) return;
    if (currentExperimentIndex >= experiments.length) {
      // 모든 실험 완료 - 5초 대기 후 결과 페이지로 이동
      setTimeout(() => onComplete(), 5000);
      return;
    }

    const currentExp = experiments[currentExperimentIndex];
    if (currentExp.status === 'completed' || currentExp.status === 'failed') {
      setCurrentExperimentIndex(prev => prev + 1);
      return;
    }

    // 실험 시작
    if (currentExp.status === 'pending') {
      setExperiments(prev => prev.map((exp, idx) => 
        idx === currentExperimentIndex 
          ? { ...exp, status: 'running', startTime: new Date(), currentStep: '데이터 로딩 중...' }
          : exp
      ));
    }

    // 진행률 업데이트 시뮬레이션 (약 10초 동안 진행)
    const progressInterval = setInterval(() => {
      setExperiments(prev => {
        const updated = [...prev];
        const exp = updated[currentExperimentIndex];
        
        if (exp.status !== 'running') {
          clearInterval(progressInterval);
          return prev;
        }

        // 진행률을 천천히 증가 (10초 정도 소요)
        const newProgress = Math.min(exp.progress + Math.random() * 4 + 8, 100);
        
        // 진행률에 따른 단계 업데이트
        let currentStep = '데이터 로딩 중...';
        if (newProgress > 20) currentStep = '평가 환경 설정 중...';
        if (newProgress > 40) currentStep = '평가 실행 중...';
        if (newProgress > 70) currentStep = '결과 분석 중...';
        if (newProgress > 90) currentStep = '완료 처리 중...';

        updated[currentExperimentIndex] = {
          ...exp,
          progress: newProgress,
          currentStep
        };

        // 완료 처리
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          
          // 90% 확률로 성공
          const isSuccess = Math.random() > 0.1;
          const score = isSuccess ? 0.6 + Math.random() * 0.35 : 0;
          
          updated[currentExperimentIndex] = {
            ...exp,
            status: isSuccess ? 'completed' : 'failed',
            progress: 100,
            score,
            endTime: new Date(),
            currentStep: isSuccess ? '완료' : '실패'
          };

          // 최고 점수 업데이트
          if (isSuccess && score > bestScore) {
            setBestScore(score);
          }
        }

        return updated;
      });
    }, 1000); // 1초마다 업데이트하여 천천히 진행 (약 10초 소요)

    return () => clearInterval(progressInterval);
  }, [currentExperimentIndex, experiments, isPaused, onComplete, bestScore]);

  const completedCount = experiments.filter(e => e.status === 'completed').length;
  const failedCount = experiments.filter(e => e.status === 'failed').length;
  const overallProgress = (completedCount + failedCount) / totalExperiments * 100;
  const elapsedTime = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
  const estimatedTotal = totalExperiments > 0 ? Math.ceil(elapsedTime / (completedCount + failedCount || 1) * totalExperiments) : 0;
  const remainingTime = estimatedTotal - elapsedTime;

  return (
    <div className="space-y-6 max-w-7xl bg-gray-50/30 -m-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 font-bold text-[24px]">자동 개선 진행 중</h1>
          <p className="text-gray-600 mt-1 text-sm">
            다양한 파라미터 조합을 실험하여 최적의 설정을 찾고 있습니다
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPaused(!isPaused)}
            className="border-gray-300"
          >
            {isPaused ? (
              <>
                <Play className="h-4 w-4 mr-2" />
                재개
              </>
            ) : (
              <>
                <Pause className="h-4 w-4 mr-2" />
                일시정지
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="border-red-300 text-red-700 hover:bg-red-50"
          >
            <StopCircle className="h-4 w-4 mr-2" />
            중지
          </Button>
        </div>
      </div>

      {/* 전체 진행 현황 */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">전체 진행률</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(overallProgress)}%
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
              </div>
            </div>
            <Progress value={overallProgress} className="mt-3 h-2" />
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">완료</p>
                <p className="text-2xl font-bold text-green-600">
                  {completedCount}/{totalExperiments}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {failedCount}개 실패
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">현재 최고 점수</p>
                <p className="text-2xl font-bold text-purple-600">
                  {(bestScore * 100).toFixed(1)}%
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Answer Relevancy
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">예상 남은 시간</p>
                <p className="text-2xl font-bold text-orange-600">
                  {remainingTime > 0 ? `${Math.ceil(remainingTime / 60)}분` : '-'}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              경과: {Math.floor(elapsedTime / 60)}분 {elapsedTime % 60}초
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 실험 목록 */}
      <Card className="border-blue-100 bg-white shadow-sm">
        <CardHeader className="pb-3 border-b border-gray-100">
          <CardTitle className="text-base text-gray-900">실험 목록</CardTitle>
          <CardDescription className="text-xs text-gray-600">
            각 파라미터 조합에 대한 평가 진행 상황
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {experiments.map((exp, index) => (
              <div
                key={exp.id}
                className={`p-4 rounded-lg border transition-all ${
                  exp.status === 'running'
                    ? 'border-blue-300 bg-blue-50 shadow-sm'
                    : exp.status === 'completed'
                    ? 'border-green-200 bg-green-50/50'
                    : exp.status === 'failed'
                    ? 'border-red-200 bg-red-50/50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    {/* 상태 아이콘 */}
                    <div className="shrink-0 mt-1">
                      {exp.status === 'running' && (
                        <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                      )}
                      {exp.status === 'completed' && (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      )}
                      {exp.status === 'failed' && (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      {exp.status === 'pending' && (
                        <Clock className="h-5 w-5 text-gray-400" />
                      )}
                    </div>

                    {/* 실험 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-sm font-medium text-gray-900">{exp.name}</p>
                        {exp.status === 'running' && (
                          <Badge className="bg-blue-100 text-blue-700 text-xs">
                            진행 중
                          </Badge>
                        )}
                        {exp.status === 'completed' && exp.score && exp.score === bestScore && (
                          <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                            🏆 최고 점수
                          </Badge>
                        )}
                      </div>

                      {/* 설정 정보 */}
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {Object.entries(exp.config).map(([key, value]) => (
                          <Badge 
                            key={key} 
                            variant="outline" 
                            className="text-xs border-gray-300 text-gray-700"
                          >
                            {key}: {value}
                          </Badge>
                        ))}
                      </div>

                      {/* 현재 단계 */}
                      {exp.status === 'running' && exp.currentStep && (
                        <p className="text-xs text-blue-700 mb-2">
                          {exp.currentStep}
                        </p>
                      )}

                      {/* 진행률 바 */}
                      {(exp.status === 'running' || exp.status === 'completed') && (
                        <Progress 
                          value={exp.progress} 
                          className="h-1.5"
                        />
                      )}
                    </div>

                    {/* 점수 */}
                    {exp.status === 'completed' && exp.score !== undefined && (
                      <div className="text-right shrink-0">
                        <p className="text-lg font-bold text-green-600">
                          {(exp.score * 100).toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-600">점수</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 완료 시 버튼 */}
      {overallProgress === 100 && (
        <div className="flex justify-center">
          <Button
            onClick={onComplete}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            <Zap className="h-4 w-4 mr-2" />
            결과 확인하기
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}

// 랜덤 설정 생성 (시뮬레이션용)
function generateRandomConfig(index: number): Record<string, string> {
  const llmModels = ['GPT-4o', 'GPT-4o-mini', 'Claude-3 Opus', 'Claude-3.5 Sonnet'];
  const temperatures = ['0.1', '0.3', '0.5', '0.7', '0.9'];
  const chunkSizes = ['128', '256', '512', '1024'];
  const topKs = ['3', '5', '10', '15'];

  return {
    'LLM': llmModels[index % llmModels.length],
    'Temp': temperatures[Math.floor(index / llmModels.length) % temperatures.length],
    'Chunk': chunkSizes[Math.floor(index / 2) % chunkSizes.length],
    'Top-K': topKs[index % topKs.length]
  };
}
