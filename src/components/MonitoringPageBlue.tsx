import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { 
  Activity, 
  Calendar, 
  Clock, 
  Eye, 
  Edit2,
  StopCircle,
  Play,
  Database,
  Cpu,
  HardDrive,
  CheckCircle2,
  Loader2,
  Info,
  X,
  Zap,
  Plus,
  AlertTriangle
} from 'lucide-react';
import { mockEvaluationHistory, EvaluationHistory } from '../lib/mock-data';
import { toast } from 'sonner@2.0.3';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface MonitoringPageBlueProps {
  onViewDetails: (evaluationId: string, progress?: number) => void;
  onNavigate?: (page: string) => void;
}

export function MonitoringPageBlue({ onViewDetails, onNavigate }: MonitoringPageBlueProps) {
  const [isEditScheduleDialogOpen, setIsEditScheduleDialogOpen] = useState(false);
  const [editingEvaluation, setEditingEvaluation] = useState<EvaluationHistory | null>(null);
  const [stopConfirmDialogOpen, setStopConfirmDialogOpen] = useState(false);
  const [evaluationToStop, setEvaluationToStop] = useState<string | null>(null);
  const [showHelpBanner, setShowHelpBanner] = useState(true);

  const runningEvaluations = mockEvaluationHistory.filter(e => e.status === 'running');
  const scheduledEvaluations = mockEvaluationHistory.filter(e => e.status === 'scheduled');

  const handleEditSchedule = (evaluation: EvaluationHistory) => {
    setEditingEvaluation(evaluation);
    setIsEditScheduleDialogOpen(true);
  };

  const handleStopEvaluation = (id: string) => {
    setEvaluationToStop(id);
    setStopConfirmDialogOpen(true);
  };

  const confirmStopEvaluation = () => {
    toast.success('평가가 중단되었습니다');
    setStopConfirmDialogOpen(false);
    setEvaluationToStop(null);
  };

  // 진행 단계 계산
  const getProgressStage = (progress: number) => {
    if (progress < 10) return { stage: 'loading', label: '데이터 로딩' };
    if (progress < 90) return { stage: 'evaluating', label: '평가 실행 중' };
    return { stage: 'generating', label: '결과 생성 중' };
  };

  // 시간 계산 함수 (EvaluationMonitorPageBlue와 일관성 유지)
  const calculateTimeInfo = (evaluation: EvaluationHistory) => {
    const totalQuestions = 50; // 데이터셋 질문 수
    const totalDurationSeconds = 810; // 13분 30초
    
    // 경과 시간 계산
    const elapsedSeconds = Math.floor((Date.now() - new Date(evaluation.startedAt).getTime()) / 1000);
    
    // 진행률 기반 예상 완료 시간
    const estimatedTotalSeconds = evaluation.progress > 0 
      ? (elapsedSeconds / evaluation.progress) * 100 
      : totalDurationSeconds;
    const remainingSeconds = Math.max(0, estimatedTotalSeconds - elapsedSeconds);
    
    // 처리 완료/남은 질문 수
    const processedQuestions = Math.floor((evaluation.progress / 100) * totalQuestions);
    const remainingQuestions = totalQuestions - processedQuestions;
    
    return {
      elapsedSeconds,
      remainingSeconds,
      processedQuestions,
      remainingQuestions,
    };
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.ceil(seconds)}초`;
    const minutes = Math.floor(seconds / 60);
    const secs = Math.ceil(seconds % 60);
    return `${minutes}분 ${secs}초`;
  };

  return (
    <TooltipProvider>
      <div className="space-y-4 bg-gray-50/30 -m-6 p-6">
        <div>
          <h1 className="text-gray-900 font-bold text-[24px]">평가 모니터링</h1>
          <p className="text-gray-600 mt-1 text-sm">
            진행 중이거나 예약된 평가를 실시간으로 모니터링하세요
          </p>
        </div>

        {/* 도움말 배너 */}
        {showHelpBanner && (
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="flex items-start justify-between gap-2">
              <span className="text-sm text-blue-900">
                평가가 진행되는 동안 실시간으로 진행 상황, 중간 결과, 예상 완료 시간을 확인할 수 있습니다. 
                진행 중인 평가는 언제든지 중단할 수 있으며, 예약된 평가는 수정하거나 즉시 실행할 수 있습니다.
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-blue-100 shrink-0"
                onClick={() => setShowHelpBanner(false)}
              >
                <X className="h-4 w-4 text-blue-600" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

      <Tabs defaultValue="running" className="space-y-4">
        <TabsList>
          <TabsTrigger value="running">
            <Activity className="h-4 w-4 mr-2" />
            진행 중 ({runningEvaluations.length})
          </TabsTrigger>
          <TabsTrigger value="scheduled">
            <Calendar className="h-4 w-4 mr-2" />
            예약됨 ({scheduledEvaluations.length})
          </TabsTrigger>
        </TabsList>

        {/* 진행 중 탭 */}
        <TabsContent value="running" className="space-y-3">
          {runningEvaluations.length > 0 ? (
            runningEvaluations.map((evaluation) => (
              <Card key={evaluation.id} className="border-blue-100 bg-white shadow-sm">
                <CardHeader className="pb-3 border-b border-gray-100">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></div>
                        <CardTitle className="flex items-center gap-2 text-lg truncate text-gray-900">
                          {evaluation.name}
                          <Badge className="bg-blue-600 text-white text-xs shrink-0 border-0">
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            진행 중
                          </Badge>
                        </CardTitle>
                      </div>
                      <CardDescription className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        시작: {new Date(evaluation.startedAt).toLocaleString('ko-KR')}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onViewDetails(evaluation.id, evaluation.progress)}
                        className="h-9 text-sm border-blue-200 text-blue-600 hover:bg-blue-50"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1.5" />
                        상세
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleStopEvaluation(evaluation.id)}
                        className="h-9 text-sm"
                      >
                        <StopCircle className="h-3.5 w-3.5 mr-1.5" />
                        중단
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  {/* 진행 단계 시각화 */}
                  {(() => {
                    const { stage, label } = getProgressStage(evaluation.progress);
                    return (
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                        <div className="flex items-center gap-2 flex-1">
                          <div className={`flex items-center gap-2 ${stage === 'loading' ? 'text-blue-600' : 'text-gray-400'}`}>
                            <div className={`h-2 w-2 rounded-full ${stage === 'loading' ? 'bg-blue-600 animate-pulse' : 'bg-gray-300'}`}></div>
                            <span className="text-xs font-medium">데이터 로딩</span>
                          </div>
                          <div className="h-px flex-1 bg-gray-300"></div>
                          <div className={`flex items-center gap-2 ${stage === 'evaluating' ? 'text-purple-600' : 'text-gray-400'}`}>
                            <div className={`h-2 w-2 rounded-full ${stage === 'evaluating' ? 'bg-purple-600 animate-pulse' : 'bg-gray-300'}`}></div>
                            <span className="text-xs font-medium">평가 실행</span>
                          </div>
                          <div className="h-px flex-1 bg-gray-300"></div>
                          <div className={`flex items-center gap-2 ${stage === 'generating' ? 'text-green-600' : 'text-gray-400'}`}>
                            <div className={`h-2 w-2 rounded-full ${stage === 'generating' ? 'bg-green-600 animate-pulse' : 'bg-gray-300'}`}></div>
                            <span className="text-xs font-medium">결과 생성</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* 설정 정보 - 컴팩트 버전 */}
                  <div className="grid gap-2 md:grid-cols-3">
                    <div className="p-2.5 rounded-lg border border-blue-200 bg-blue-50">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Database className="h-3.5 w-3.5 text-blue-600" />
                        <Label className="text-blue-900 text-xs">데이터셋</Label>
                      </div>
                      <p className="text-sm truncate text-gray-900">{evaluation.datasetName}</p>
                    </div>
                    <div className="p-2.5 rounded-lg border border-purple-200 bg-purple-50">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Cpu className="h-3.5 w-3.5 text-purple-600" />
                        <Label className="text-purple-900 text-xs">LLM 모델</Label>
                      </div>
                      <p className="text-sm truncate text-gray-900">{evaluation.modelName}</p>
                    </div>
                    <div className="p-2.5 rounded-lg border border-indigo-200 bg-indigo-50">
                      <div className="flex items-center gap-1.5 mb-1">
                        <HardDrive className="h-3.5 w-3.5 text-indigo-600" />
                        <Label className="text-indigo-900 text-xs">Vector DB</Label>
                      </div>
                      <p className="text-sm truncate text-gray-900">{evaluation.vectorDbName}</p>
                    </div>
                  </div>
                  
                  {/* 진행률 - 더 큰 프로그레스 바 with Tooltip */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="text-sm text-gray-900 cursor-help flex items-center gap-1">
                            진행률
                            <Info className="h-3 w-3 text-gray-400" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">전체 평가 진행 정도를 나타냅니다</p>
                        </TooltipContent>
                      </Tooltip>
                      <span className="text-blue-600 text-sm font-medium">{evaluation.progress}%</span>
                    </div>
                    <Progress value={evaluation.progress} className="h-2.5" />
                  </div>

                  {/* 중간 결과 - 컴팩트 버전 */}
                  {Object.keys(evaluation.scores).length > 0 && (
                    <div>
                      <Label className="text-gray-600 text-xs mb-2 block">중간 결과</Label>
                      <div className="grid gap-2 grid-cols-3 lg:grid-cols-6">
                        {Object.entries(evaluation.scores).map(([key, value]) => {
                          const scoreValue = value * 100;
                          const getColor = (score: number) => {
                            if (score >= 90) return 'text-green-700 bg-green-50 border-green-200';
                            if (score >= 70) return 'text-blue-700 bg-blue-50 border-blue-200';
                            return 'text-yellow-700 bg-yellow-50 border-yellow-200';
                          };
                          
                          return (
                            <div key={key} className={`p-2.5 rounded-lg border ${getColor(scoreValue)}`}>
                              <div className="text-xs capitalize truncate font-medium" title={key.replace('_', ' ')}>
                                {key.replace('_', ' ').split(' ')[0]}
                              </div>
                              <div className="text-base font-semibold">{scoreValue.toFixed(0)}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 진행 시간 정보 */}
                  {(() => {
                    const timeInfo = calculateTimeInfo(evaluation);
                    return (
                      <div className="pt-2 border-t border-gray-200 space-y-0.5 text-xs text-gray-600">
                        <div className="flex items-center justify-between">
                          <span>처리 완료: <span className="text-gray-900 font-medium">{timeInfo.processedQuestions}/{timeInfo.processedQuestions + timeInfo.remainingQuestions}개 질문</span></span>
                          <span>경과 시간: <span className="text-blue-700 font-medium">{formatTime(timeInfo.elapsedSeconds)}</span></span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>남은 질문: <span className="text-gray-900 font-medium">{timeInfo.remainingQuestions}개</span></span>
                          <span>예상 완료: <span className="text-green-700 font-medium">{formatTime(timeInfo.remainingSeconds)}</span></span>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-blue-100 bg-white shadow-sm">
              <CardContent className="flex flex-col items-center justify-center h-64 text-center py-12">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <Activity className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-base text-gray-900">진행 중인 평가가 없습니다</h3>
                <p className="text-gray-600 mt-2 text-sm max-w-md">
                  새로운 평가를 시작하거나 예약된 평가를 기다려주세요
                </p>
                {onNavigate && (
                  <Button 
                    className="mt-4 bg-blue-600 hover:bg-blue-700"
                    onClick={() => onNavigate('new-evaluation')}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    평가 시작하기
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 예약됨 탭 */}
        <TabsContent value="scheduled" className="space-y-3">
          {scheduledEvaluations.length > 0 ? (
            scheduledEvaluations.map((evaluation) => (
              <Card key={evaluation.id} className="border-blue-100 bg-white shadow-sm">
                <CardHeader className="pb-3 border-b border-gray-100">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-8 w-8 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                          <Calendar className="h-4 w-4 text-violet-600" />
                        </div>
                        <CardTitle className="flex items-center gap-2 text-lg truncate text-gray-900">
                          {evaluation.name}
                          <Badge className="text-xs shrink-0 bg-violet-100 text-violet-700 border-violet-200 border">예약됨</Badge>
                        </CardTitle>
                      </div>
                      <CardDescription className="flex items-center gap-1 text-xs ml-10 text-gray-500">
                        <Clock className="h-3 w-3" />
                        {new Date(evaluation.scheduledTime!).toLocaleString('ko-KR')} 예정
                      </CardDescription>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditSchedule(evaluation)}
                        className="h-9 text-sm border-gray-300 text-gray-700 hover:bg-gray-100"
                      >
                        <Edit2 className="h-3.5 w-3.5 mr-1.5" />
                        수정
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => toast.success('평가가 즉시 시작되었습니다')}
                        className="h-9 text-sm bg-blue-600 hover:bg-blue-700"
                      >
                        <Play className="h-3.5 w-3.5 mr-1.5" />
                        실행
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2.5 pt-4">
                  {/* 설정 정보 - 컴팩트 버전 */}
                  <div className="grid gap-2 md:grid-cols-3">
                    <div className="p-2.5 rounded-lg border border-blue-200 bg-blue-50">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Database className="h-3.5 w-3.5 text-blue-600" />
                        <Label className="text-blue-900 text-xs">데이터셋</Label>
                      </div>
                      <p className="text-sm truncate text-gray-900">{evaluation.datasetName}</p>
                    </div>
                    <div className="p-2.5 rounded-lg border border-purple-200 bg-purple-50">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Cpu className="h-3.5 w-3.5 text-purple-600" />
                        <Label className="text-purple-900 text-xs">LLM 모델</Label>
                      </div>
                      <p className="text-sm truncate text-gray-900">{evaluation.modelName}</p>
                    </div>
                    <div className="p-2.5 rounded-lg border border-indigo-200 bg-indigo-50">
                      <div className="flex items-center gap-1.5 mb-1">
                        <HardDrive className="h-3.5 w-3.5 text-indigo-600" />
                        <Label className="text-indigo-900 text-xs">Vector DB</Label>
                      </div>
                      <p className="text-sm truncate text-gray-900">{evaluation.vectorDbName}</p>
                    </div>
                  </div>
                  
                  {/* 반복 스케줄 */}
                  {evaluation.scheduleFrequency && (
                    <div className="p-3 bg-violet-50 border border-violet-200 rounded-lg flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-violet-600" />
                      <span className="text-violet-900 text-sm font-medium">
                        {evaluation.scheduleFrequency === 'daily' ? '매일' : 
                         evaluation.scheduleFrequency === 'weekly' ? '매주' : '매월'} 자동 반복
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-blue-100 bg-white shadow-sm">
              <CardContent className="flex flex-col items-center justify-center h-64 text-center py-12">
                <div className="h-16 w-16 rounded-full bg-violet-100 flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8 text-violet-600" />
                </div>
                <h3 className="text-base text-gray-900">예약된 평가가 없습니다</h3>
                <p className="text-gray-600 mt-2 text-sm max-w-md">
                  Internal 모드를 생성할 때 스케줄을 설정하면 여기에 표시됩니다
                </p>
                {onNavigate && (
                  <Button 
                    variant="outline"
                    className="mt-4 border-violet-300 text-violet-700 hover:bg-violet-50"
                    onClick={() => onNavigate('new-evaluation')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    평가 예약하기
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* 중단 확인 AlertDialog */}
      <AlertDialog open={stopConfirmDialogOpen} onOpenChange={setStopConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-gray-900">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              평가를 중단하시겠습니까?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              진행 중인 평가를 중단하면 현재까지의 진행 상황이 저장되지 않습니다. 
              부분적인 결과는 보존되지만, 완전한 평가 리포트는 생성되지 않습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmStopEvaluation}
              className="bg-red-600 hover:bg-red-700"
            >
              중단하기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 예약 수정 Dialog */}
      <Dialog open={isEditScheduleDialogOpen} onOpenChange={setIsEditScheduleDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gray-900">예약 수정</DialogTitle>
            <DialogDescription className="text-gray-600">
              평가 예약을 수정하거나 취소할 수 있습니다
            </DialogDescription>
          </DialogHeader>
          {editingEvaluation && (
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>평가 이름</Label>
                <Input value={editingEvaluation.name} readOnly className="bg-gray-50" />
              </div>
              <div className="space-y-2">
                <Label>예약 시간</Label>
                <Input 
                  type="datetime-local" 
                  defaultValue={editingEvaluation.scheduledTime?.slice(0, 16)}
                />
              </div>
              <div className="space-y-2">
                <Label>실행 주기</Label>
                <Select defaultValue={editingEvaluation.scheduleFrequency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">매일</SelectItem>
                    <SelectItem value="weekly">매주</SelectItem>
                    <SelectItem value="monthly">매월</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="destructive" onClick={() => {
                  toast.success('예약이 취소되었습니다');
                  setIsEditScheduleDialogOpen(false);
                }}>
                  예약 취소
                </Button>
                <Button onClick={() => {
                  toast.success('예약이 수정되었습니다');
                  setIsEditScheduleDialogOpen(false);
                }} className="bg-blue-600 hover:bg-blue-700">
                  수정 완료
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </TooltipProvider>
  );
}