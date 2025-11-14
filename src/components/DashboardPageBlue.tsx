import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { 
  Activity, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Play,
  TrendingUp,
  Database,
  FileText,
  FileCheck,
  PlusCircle,
  Zap,
  ArrowRight,
  AlertTriangle,
  XCircle,
  Wifi,
  TrendingDown,
  Minus,
  Target,
  BarChart3,
  LineChart as LineChartIcon,
  DollarSign,
  Info,
  HelpCircle,
  Lightbulb,
  X,
  Settings,
  FileSearch,
  Sparkles
} from 'lucide-react';
import { mockEvaluations, mockDatasets, mockSystemStatus, mockModels, mockVectorDBs, evaluationItems, mockEvaluationHistory } from '../lib/mock-data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { useEvaluationStore } from '../stores/evaluation-store';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface DashboardPageBlueProps {
  onNavigate: (page: string) => void;
}

interface ActivityLog {
  id: string;
  message: string;
  time: string;
  icon: any;
  type: 'evaluation' | 'dataset' | 'system';
}

export function DashboardPageBlue({ onNavigate }: DashboardPageBlueProps) {
  const [selectedEvaluation, setSelectedEvaluation] = useState<string>('all');
  
  const runningEvals = mockEvaluations.filter(e => e.status === 'running');
  const completedEvals = mockEvaluations.filter(e => e.status === 'completed');
  // 최근 평가 = 완료된 평가만 (completedAt 기준 정렬)
  const recentEvals = completedEvals
    .sort((a, b) => 
      new Date(b.completedAt || b.startedAt).getTime() - new Date(a.completedAt || a.startedAt).getTime()
    )
    .slice(0, 3);

  // 선택된 평가의 데이터 가져오기
  const selectedData = evaluationItems.find(item => item.id === selectedEvaluation)?.data || evaluationItems[0].data;
  const firstScore = selectedData[0].overallScore;
  const lastScore = selectedData[selectedData.length - 1].overallScore;
  const changeRate = ((lastScore - firstScore) / firstScore * 100).toFixed(1);

  // 활동 로그 - 최근 평가와 일치
  const activityLogs: ActivityLog[] = [
    {
      id: '1',
      message: '"2025년 3분기 챗봇 평가" 완료',
      time: '10분 전',
      icon: CheckCircle2,
      type: 'evaluation'
    },
    {
      id: '2',
      message: '"고객 지원팀 답변 품질 개선" 평가 시작',
      time: '1일 전',
      icon: Play,
      type: 'evaluation'
    },
    {
      id: '3',
      message: '"신규 모델 성능 검증" 평가 완료',
      time: '3일 전',
      icon: CheckCircle2,
      type: 'evaluation'
    }
  ];

  // 현재 연결된 시스템
  const connectedLLM = mockModels.find(m => m.id === 'gpt-4o');
  const connectedVectorDB = mockVectorDBs.find(db => db.id === 'chroma-1');

  // 통계 계산
  const totalEvaluations = mockEvaluationHistory.filter(e => e.status === 'completed').length;
  const thisMonthEvaluations = mockEvaluations.filter(e => {
    const evalDate = new Date(e.startedAt);
    const now = new Date();
    return evalDate.getMonth() === now.getMonth() && evalDate.getFullYear() === now.getFullYear();
  }).length;
  
  const avgScore = completedEvals.length > 0
    ? completedEvals.reduce((acc, e) => {
        const scores = Object.values(e.scores);
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        return acc + avg;
      }, 0) / completedEvals.length * 100
    : 0;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      running: { variant: 'default', icon: Activity, label: '진행중', color: 'bg-blue-100 text-blue-700 border-blue-200' },
      completed: { variant: 'outline', icon: CheckCircle2, label: '완료', color: 'bg-green-100 text-green-700 border-green-200' },
      pending: { variant: 'secondary', icon: Clock, label: '대기중', color: 'bg-gray-100 text-gray-700 border-gray-200' },
      failed: { variant: 'destructive', icon: AlertCircle, label: '실패', color: 'bg-red-100 text-red-700 border-red-200' }
    };
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    
    return (
      <Badge className={`gap-1.5 ${config.color} border`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <TooltipProvider>
      <div className="space-y-6 bg-gray-50/30 -m-6 p-6">
        {/* Quick Start 가이드 (첫 사용자용) */}
        {totalEvaluations === 0 && (
          <Card className="border-blue-200 bg-blue-50/50 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-blue-900 mb-1">REX 시작하기</h3>
                  <p className="text-sm text-blue-800 mb-3">
                    RAG 시스템 평가를 시작하려면 다음 단계를 따라주세요:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-blue-300 bg-white text-blue-700 hover:bg-blue-50"
                      onClick={() => onNavigate('datasets')}
                    >
                      <Database className="h-3.5 w-3.5 mr-1.5" />
                      1. 데이터셋 준비
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-blue-300 bg-white text-blue-700 hover:bg-blue-50"
                      onClick={() => onNavigate('new-evaluation')}
                    >
                      <Zap className="h-3.5 w-3.5 mr-1.5" />
                      2. 평가 시작
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-blue-300 bg-white text-blue-700 hover:bg-blue-50"
                      onClick={() => onNavigate('monitoring')}
                    >
                      <Activity className="h-3.5 w-3.5 mr-1.5" />
                      3. 결과 확인
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header */}
        <div>
          <h1 className="text-gray-900 font-bold text-[24px]">통합 대시보드</h1>
          <p className="text-gray-600 mt-1 text-sm">
            REX 시스템의 현황을 확인하세요
          </p>
        </div>

      {/* Hero CTA Section with Workflow Integration */}
      <Card className="bg-gradient-to-br from-violet-500 to-purple-600 border-0 text-white">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2">
                <Zap className="h-8 w-8" />
                <h2 className="text-white">평가 시작하기</h2>
              </div>
              <p className="text-white/90 max-w-xl">
                RAG 성능을 측정하고 최적의 개선 방안을 찾아보세요. <br />
                통합 환경에서 데이터셋부터 평가 지표까지 손쉽게 구성하고 실행할 수 있습니다.
              </p>
              <div className="flex gap-3 pt-2">
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                  onClick={() => onNavigate('datasets')}
                >
                  <Database className="h-5 w-5 mr-2" />
                  데이터셋 생성
                </Button>
                <Button 
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-white/90"
                  onClick={() => onNavigate('evaluation-mode-selection')}
                >
                  <Zap className="h-5 w-5 mr-2" />
                  평가 시작하기
                </Button>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center">
                <Play className="h-16 w-16 text-white" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 시스템 종합 현황 - 간소화 (2개 카드) */}
      <Card className="border-blue-100 bg-white shadow-sm">
        <CardHeader className="border-b border-gray-100 pb-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="text-base text-gray-900">시스템 종합 현황</CardTitle>
              <CardDescription className="text-sm text-gray-600 mt-0.5">실시간 시스템 상태 모니터링</CardDescription>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Info className="h-4 w-4 text-gray-400" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">LLM과 VectorDB의 실시간 연동 상태입니다.</p>
                <p className="text-xs text-gray-400 mt-1">• LLM Judge: 평가 지표 측정에 사용되는 LLM</p>
                <p className="text-xs text-gray-400">• VectorDB: RAG 컨텍스트 검색 데이터베이스</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid gap-3 md:grid-cols-2 mb-3">
            {/* 시스템 상태 (통합) - 초록색 신호등 */}
            <div className="relative overflow-hidden rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-4">
              <div className="flex items-start gap-3">
                <div className="relative">
                  <div className="h-11 w-11 rounded-full bg-green-500 flex items-center justify-center shadow-md">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <div className="absolute inset-0 h-11 w-11 rounded-full bg-green-500 animate-ping opacity-20"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-900 mb-0.5">시스템 상태</p>
                  <p className="text-base font-semibold text-green-600 mb-0.5">정상 작동</p>
                  <p className="text-xs text-green-700/70">평가 시스템 및 인프라 정상</p>
                </div>
              </div>
            </div>

            {/* 연결된 서비스 - 파란색 */}
            <div className="relative overflow-hidden rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50 p-4">
              <div className="flex items-start gap-3">
                <div className="relative">
                  <div className="h-11 w-11 rounded-full bg-blue-500 flex items-center justify-center shadow-md">
                    <Wifi className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-blue-900 mb-0.5">연결된 서비스</p>
                  <p className="text-base font-semibold text-blue-600 mb-0.5">모두 연결됨</p>
                  <p className="text-xs text-blue-700/70">LLM API, VectorDB 정상</p>
                </div>
              </div>
            </div>
          </div>

          {/* 서비스 상세 정보 */}
          <div className="grid gap-2.5 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-700">LLM Judge</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <code className="text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200">
                    {connectedLLM?.name || 'gpt-4o'}
                  </code>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-700">VectorDB</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <code className="text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200">
                    {connectedVectorDB?.type || 'ChromaDB'}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics - 5개 카드 (비용 추가) */}
      <div className="grid gap-4 md:grid-cols-5">
        {/* 총 평가 횟수 */}
        <Card 
          className="border-blue-100 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onNavigate('history')}
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help" onClick={(e) => e.stopPropagation()}>
                    <HelpCircle className="h-4 w-4 text-gray-400 hover:text-blue-600 transition-colors" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">지금까지 완료된 총 평가 횟수입니다.</p>
                  <p className="text-xs text-gray-400 mt-1">클릭하면 평가 이력 페이지로 이동합니다.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="space-y-1 min-h-[68px]">
              <p className="text-sm text-gray-600">총 평가 횟수</p>
              <p className="text-2xl font-semibold text-gray-900">{totalEvaluations}</p>
            </div>
          </CardContent>
        </Card>

        {/* 이번 달 평가 */}
        <Card 
          className="border-blue-100 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onNavigate('history')}
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Activity className="h-5 w-5 text-purple-600" />
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help" onClick={(e) => e.stopPropagation()}>
                    <HelpCircle className="h-4 w-4 text-gray-400 hover:text-purple-600 transition-colors" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">이번 달에 실행된 평가 횟수입니다.</p>
                  <p className="text-xs text-gray-400 mt-1">월별 사용량을 확인하여 비용을 관리할 수 있습니다.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="space-y-1 min-h-[68px]">
              <p className="text-sm text-gray-600">이번 달 평가</p>
              <p className="text-2xl font-semibold text-gray-900">{thisMonthEvaluations}</p>
            </div>
          </CardContent>
        </Card>

        {/* 평균 점수 */}
        <Card 
          className="border-blue-100 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onNavigate('comparison')}
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help" onClick={(e) => e.stopPropagation()}>
                    <HelpCircle className="h-4 w-4 text-gray-400 hover:text-emerald-600 transition-colors" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">완료된 모든 평가의 평균 점수입니다.</p>
                  <p className="text-xs text-gray-400 mt-1">12개 RAG 지표의 평균값으로 계산됩니다.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="space-y-1 min-h-[68px]">
              <p className="text-sm text-gray-600">평균 점수</p>
              <p className="text-2xl font-semibold text-gray-900">{avgScore.toFixed(1)}</p>
            </div>
          </CardContent>
        </Card>

        {/* 등록된 데이터셋 */}
        <Card 
          className="border-blue-100 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onNavigate('datasets')}
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Database className="h-5 w-5 text-orange-600" />
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help" onClick={(e) => e.stopPropagation()}>
                    <HelpCircle className="h-4 w-4 text-gray-400 hover:text-orange-600 transition-colors" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">평가에 사용 가능한 QA 데이터셋 개수입니다.</p>
                  <p className="text-xs text-gray-400 mt-1">자동 생성하거나 기존 데이터를 업로드할 수 있습니다.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="space-y-1 min-h-[68px]">
              <p className="text-sm text-gray-600">등록된 데이터셋</p>
              <p className="text-2xl font-semibold text-gray-900">{mockDatasets.length}</p>
            </div>
          </CardContent>
        </Card>

        {/* 이번 달 비용 - Phase 3 예정 */}
        <Card 
          className="border-gray-200 bg-gray-50/50 shadow-sm relative overflow-hidden"
          onClick={() => onNavigate('costs')}
        >
          {/* Phase 3 오버레이 */}
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
            <div className="text-center p-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-100 border-2 border-blue-300 mb-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-semibold text-blue-900">Phase 3</span>
              </div>
              <p className="text-[10px] text-gray-600 leading-tight">
                비용 대시보드는<br />Phase 3에서 제공
              </p>
            </div>
          </div>
          
          <CardContent className="p-5 opacity-40">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help" onClick={(e) => e.stopPropagation()}>
                    <HelpCircle className="h-4 w-4 text-gray-400 hover:text-green-600 transition-colors" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">이번 달 LLM API 사용 비용입니다.</p>
                  <p className="text-xs text-gray-400 mt-1">OpenAI, Anthropic 등 제공사별 비용을 확인할 수 있습니다.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="space-y-1 min-h-[68px]">
              <p className="text-sm text-gray-600">이번 달 비용</p>
              <p className="text-2xl font-semibold text-gray-900">$1,847</p>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                예산 92.4% 사용
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 활동 로그와 최근 평가를 좌우 배치 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* 활동 로그 */}
        <Card className="border-blue-100 bg-white shadow-sm">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-base text-gray-900">활동 로그</CardTitle>
            <CardDescription className="text-sm text-gray-600">최근 시스템 활동 내역</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2">
              {activityLogs.map((log) => {
                const Icon = log.icon;
                return (
                  <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer border border-transparent hover:border-blue-200">
                    <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{log.message}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{log.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 최근 평가 */}
        <Card className="border-blue-100 bg-white shadow-sm">
          <CardHeader className="border-b border-gray-100 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base text-gray-900">최근 평가</CardTitle>
                <CardDescription className="text-sm text-gray-600">최근 완료된 평가 3개</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={() => onNavigate('history')}
              >
                전체보기
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {recentEvals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 mb-1">완료된 평가가 없습니다</p>
                <p className="text-xs text-gray-500 mb-4">새로운 평가를 시작해보세요</p>
                <Button 
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => onNavigate('new-evaluation')}
                >
                  <Zap className="h-3.5 w-3.5 mr-1.5" />
                  평가 시작하기
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {recentEvals.map((evaluation) => (
                <div 
                  key={evaluation.id} 
                  className="p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 cursor-pointer transition-all"
                  onClick={() => {
                    useEvaluationStore.getState().setSelectedEvaluationId(evaluation.id);
                    onNavigate('results');
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{evaluation.name}</h4>
                        {getStatusBadge(evaluation.status)}
                      </div>
                      <p className="text-xs text-gray-500">
                        완료: {new Date(evaluation.completedAt || evaluation.startedAt).toLocaleString('ko-KR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xl font-semibold text-blue-600">
                        {(Object.values(evaluation.scores).reduce((a, b) => a + b, 0) / Object.values(evaluation.scores).length * 100).toFixed(0)}
                      </div>
                      <div className="text-xs text-gray-500">종합 점수</div>
                    </div>
                  </div>
                </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 진행 중인 평가 */}
      {runningEvals.length > 0 && (
        <Card className="border-blue-100 bg-white shadow-sm">
          <CardHeader className="border-b border-gray-100 pb-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base text-gray-900">진행 중인 평가 현황</CardTitle>
                <CardDescription className="text-sm text-gray-600 mt-0.5">실시간으로 진행되는 평가를 모니터링하세요</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="border-blue-200 text-blue-600 hover:bg-blue-50 flex-shrink-0"
                onClick={() => onNavigate('monitoring')}
              >
                모니터링 페이지로
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0 pb-0">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200">
                  <TableHead className="text-gray-700 py-3 text-xs">평가 이름 (세션 ID)</TableHead>
                  <TableHead className="text-gray-700 py-3 text-xs">실행자</TableHead>
                  <TableHead className="text-gray-700 py-3 text-xs">시작 시간</TableHead>
                  <TableHead className="text-gray-700 py-3 text-xs">진행률</TableHead>
                  <TableHead className="text-gray-700 py-3 text-xs">바로가기</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runningEvals.map((evaluation) => (
                  <TableRow key={evaluation.id} className="border-gray-200">
                    <TableCell className="py-3">
                      <div>
                        <p className="text-sm text-gray-900">{evaluation.name}</p>
                        <code className="text-xs text-gray-500">
                          session_{evaluation.configId}
                        </code>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-700 py-3">admin@rex.com</TableCell>
                    <TableCell className="text-sm text-gray-700 py-3">
                      {new Date(evaluation.startedAt).toLocaleString('ko-KR')}
                    </TableCell>
                    <TableCell className="py-3">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="space-y-0.5 cursor-help">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-900">{evaluation.progress}%</span>
                              <span className="text-gray-500 text-xs">
                                ({Math.round(evaluation.progress * 1.5)}/150)
                              </span>
                            </div>
                            <Progress value={evaluation.progress} className="h-1.5" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm">현재 평가 진행 상황입니다.</p>
                          <p className="text-xs text-gray-400 mt-1">전체 QA 쌍 중 몇 개를 처리했는지 표시합니다.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell className="py-3">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-blue-200 text-blue-600 hover:bg-blue-50 h-8"
                        onClick={() => onNavigate('monitor')}
                      >
                        모니터링
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* 성능 변화 추이 */}
      <Card className="border-blue-100 bg-white shadow-sm">
        <CardHeader className="border-b border-gray-100 pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-base text-gray-900">성능 변화 추이</CardTitle>
              <CardDescription className="text-sm text-gray-600">선택한 평가의 종합 점수(Overall Score) 변화</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">평가 선택:</span>
              <Select value={selectedEvaluation} onValueChange={setSelectedEvaluation}>
                <SelectTrigger className="w-[280px] border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {evaluationItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          {/* 핵심 지표 요약 - 신호등 색상 유지 */}
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            {/* 시작 점수 */}
            <div className="relative overflow-hidden rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50 p-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-blue-900 mb-1">시작 점수</p>
                  <div className="text-xl font-semibold text-blue-600">{firstScore.toFixed(1)}점</div>
                  <p className="text-xs text-blue-600/60 mt-0.5">{selectedData[0].period}</p>
                </div>
              </div>
            </div>

            {/* 현재 점수 */}
            <div className="relative overflow-hidden rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50 p-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-purple-900 mb-1">현재 점수</p>
                  <div className="text-xl font-semibold text-purple-600">{lastScore.toFixed(1)}점</div>
                  <p className="text-xs text-purple-600/60 mt-0.5">{selectedData[selectedData.length - 1].period}</p>
                </div>
              </div>
            </div>

            {/* 변화량 - 신호등 색상 */}
            <div className={`relative overflow-hidden rounded-xl border p-4 ${
              lastScore > firstScore 
                ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50'
                : lastScore < firstScore
                ? 'border-red-200 bg-gradient-to-br from-red-50 to-rose-50'
                : 'border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                  lastScore > firstScore 
                    ? 'bg-green-100'
                    : lastScore < firstScore
                    ? 'bg-red-100'
                    : 'bg-gray-100'
                }`}>
                  {lastScore > firstScore ? (
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  ) : lastScore < firstScore ? (
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  ) : (
                    <Minus className="h-5 w-5 text-gray-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs mb-1 ${lastScore > firstScore ? 'text-green-900' : lastScore < firstScore ? 'text-red-900' : 'text-gray-900'}`}>
                    변화량
                  </p>
                  <div className={`text-xl font-semibold ${lastScore > firstScore ? 'text-green-600' : lastScore < firstScore ? 'text-red-600' : 'text-gray-600'}`}>
                    {lastScore > firstScore ? '+' : ''}{(lastScore - firstScore).toFixed(1)}점
                  </div>
                  <p className={`text-xs mt-0.5 ${lastScore > firstScore ? 'text-green-600/60' : lastScore < firstScore ? 'text-red-600/60' : 'text-gray-600/60'}`}>
                    {lastScore > firstScore ? '개선' : lastScore < firstScore ? '하락' : '유지'}
                  </p>
                </div>
              </div>
            </div>

            {/* 변화율 - 신호등 색상 */}
            <div className={`relative overflow-hidden rounded-xl border p-4 ${
              parseFloat(changeRate) > 0 
                ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50'
                : parseFloat(changeRate) < 0
                ? 'border-red-200 bg-gradient-to-br from-red-50 to-rose-50'
                : 'border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                  parseFloat(changeRate) > 0 
                    ? 'bg-green-100'
                    : parseFloat(changeRate) < 0
                    ? 'bg-red-100'
                    : 'bg-gray-100'
                }`}>
                  <TrendingUp className={`h-5 w-5 ${
                    parseFloat(changeRate) > 0 
                      ? 'text-green-600'
                      : parseFloat(changeRate) < 0
                      ? 'text-red-600'
                      : 'text-gray-600'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs mb-1 ${parseFloat(changeRate) > 0 ? 'text-green-900' : parseFloat(changeRate) < 0 ? 'text-red-900' : 'text-gray-900'}`}>
                    변화율
                  </p>
                  <div className={`text-xl font-semibold ${parseFloat(changeRate) > 0 ? 'text-green-600' : parseFloat(changeRate) < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                    {parseFloat(changeRate) > 0 ? '+' : ''}{changeRate}%
                  </div>
                  <p className={`text-xs mt-0.5 ${parseFloat(changeRate) > 0 ? 'text-green-600/60' : parseFloat(changeRate) < 0 ? 'text-red-600/60' : 'text-gray-600/60'}`}>
                    {parseFloat(changeRate) > 0 ? '상승 추세' : parseFloat(changeRate) < 0 ? '하락 추세' : '변화 없음'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 차트 영역 */}
          <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50/30 to-purple-50/30 p-6">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={selectedData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorScoreBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="period" 
                    stroke="#6b7280"
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <YAxis 
                    domain={[70, 100]}
                    stroke="#6b7280"
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    label={{ 
                      value: '종합 점수', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { fill: '#6b7280', fontSize: 12 }
                    }}
                  />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                    formatter={(value: number) => [`${value.toFixed(1)}점`, '종합 점수']}
                  />
                  <Area
                    type="monotone"
                    dataKey="overallScore"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fill="url(#colorScoreBlue)"
                    name="Overall Score"
                    dot={{ 
                      r: 6, 
                      fill: '#3b82f6', 
                      strokeWidth: 3, 
                      stroke: '#fff' 
                    }}
                    activeDot={{ 
                      r: 8,
                      fill: '#3b82f6',
                      strokeWidth: 3,
                      stroke: '#fff'
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </TooltipProvider>
  );
}