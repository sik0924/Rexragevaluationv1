import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { 
  Play, 
  Link2, 
  Target,
  HelpCircle,
  Info,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  Shield,
  Code,
  Sliders,
  Calendar,
  Clock,
  Repeat,
  Zap,
  Scale,
  Crosshair,
  ChevronDown,
  BookOpen,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { mockDatasets, mockModels, mockMetrics } from '../lib/mock-data';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { toast } from 'sonner@2.0.3';
import type { ExternalRAGConfig } from '../types';

interface ExternalEvaluationPageBlueProps {
  onStartEvaluation: () => void;
  onBack: () => void;
}

export function ExternalEvaluationPageBlue({ onStartEvaluation, onBack }: ExternalEvaluationPageBlueProps) {
  // 평가 이름 자동 생성 함수
  const getDefaultEvaluationName = () => {
    const now = new Date();
    const date = now.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '-').replace('.', '');
    const time = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `External 모드 ${date} ${time}`;
  };
  
  // 평가 이름 (사용자가 입력하지 않으면 자동 생성)
  const [evaluationName, setEvaluationName] = useState('');
  
  // Step 1: 데이터셋 선택
  const [selectedDataset, setSelectedDataset] = useState('');

  // Step 2: RAG API 연동 설정
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [authType, setAuthType] = useState<'none' | 'api_key' | 'bearer' | 'basic'>('api_key');
  const [apiKey, setApiKey] = useState('');
  const [bearerToken, setBearerToken] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [questionField, setQuestionField] = useState('query');
  const [answerField, setAnswerField] = useState('answer');
  const [timeoutSeconds, setTimeoutSeconds] = useState('30');
  const [maxRetries, setMaxRetries] = useState('3');

  // Step 3: LLM Judge 모델 선택
  const [selectedModel, setSelectedModel] = useState(
    mockModels.length > 0 ? mockModels[0].id : ''
  );

  // Step 4: 평가 지표 선택 (필수 지표만 기본 선택)
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(
    mockMetrics
      .filter(metric => metric.category === 'required')
      .map(metric => metric.id)
  );

  // Step 5: LLM Judge 샘플링 설정
  const [llmJudgeSamplingEnabled, setLlmJudgeSamplingEnabled] = useState(true);
  const [llmJudgePreset, setLlmJudgePreset] = useState<'fast' | 'balanced' | 'precise'>('balanced');
  const [llmJudgeSamplingMode, setLlmJudgeSamplingMode] = useState<'auto' | 'fixed_ratio' | 'max_cases'>('auto');
  const [llmJudgeFixedRatio, setLlmJudgeFixedRatio] = useState(20);
  const [llmJudgeMaxCases, setLlmJudgeMaxCases] = useState(100);
  
  // Dialog state
  const [showModeGuideDialog, setShowModeGuideDialog] = useState(false);
  const [showDetailGuideDialog, setShowDetailGuideDialog] = useState(false);

  // Step 6: 예약 및 자동화
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleType, setScheduleType] = useState<'once' | 'daily' | 'weekly' | 'monthly' | 'cron'>('daily');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [scheduleWeekday, setScheduleWeekday] = useState('monday');
  const [scheduleDayOfMonth, setScheduleDayOfMonth] = useState('1');
  const [scheduleCron, setScheduleCron] = useState('0 9 * * 1');

  const toggleMetric = (metricId: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metricId) 
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId]
    );
  };

  // 프리셋 변경 핸들러
  const handlePresetChange = (preset: 'fast' | 'balanced' | 'precise') => {
    setLlmJudgePreset(preset);
    
    // 프리셋에 따라 자동으로 샘플링 설정 조정
    switch (preset) {
      case 'fast':
        setLlmJudgeSamplingMode('auto');
        setLlmJudgeFixedRatio(5);
        break;
      case 'balanced':
        setLlmJudgeSamplingMode('auto');
        setLlmJudgeFixedRatio(20);
        break;
      case 'precise':
        setLlmJudgeSamplingMode('fixed_ratio');
        setLlmJudgeFixedRatio(100);
        break;
    }
  };

  // 프리셋별 예상 정보 계산
  const getPresetInfo = (preset: 'fast' | 'balanced' | 'precise') => {
    const baseTime = 5 + selectedMetrics.length * 0.5;
    
    switch (preset) {
      case 'fast':
        return {
          time: `${Math.round(baseTime * 0.3)}-${Math.round(baseTime * 0.5)}분`,
          cost: '5%',
          calls: '~20회',
          reliability: 3
        };
      case 'balanced':
        return {
          time: `${Math.round(baseTime * 0.6)}-${Math.round(baseTime * 0.8)}분`,
          cost: '20%',
          calls: '~80회',
          reliability: 4
        };
      case 'precise':
        return {
          time: `${Math.round(baseTime * 1.5)}-${Math.round(baseTime * 2)}분`,
          cost: '100%',
          calls: '~400회',
          reliability: 5
        };
    }
  };

  // 다음 실행 시간 계산
  const getNextRuns = () => {
    const runs: string[] = [];
    const now = new Date();
    
    if (!scheduleEnabled) return [];
    
    switch (scheduleType) {
      case 'once':
        if (scheduleDate && scheduleTime) {
          runs.push(`${scheduleDate} ${scheduleTime}`);
        }
        break;
      case 'daily':
        for (let i = 0; i < 5; i++) {
          const next = new Date(now);
          next.setDate(now.getDate() + i);
          const [hour, minute] = scheduleTime.split(':');
          next.setHours(parseInt(hour), parseInt(minute), 0, 0);
          runs.push(next.toLocaleString('ko-KR'));
        }
        break;
      case 'weekly':
        const weekdayMap = { monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, sunday: 0 };
        const targetDay = weekdayMap[scheduleWeekday as keyof typeof weekdayMap];
        for (let i = 0; i < 5; i++) {
          const next = new Date(now);
          const currentDay = next.getDay();
          const daysUntilTarget = (targetDay - currentDay + 7) % 7 || 7;
          next.setDate(now.getDate() + daysUntilTarget + (i * 7));
          const [hour, minute] = scheduleTime.split(':');
          next.setHours(parseInt(hour), parseInt(minute), 0, 0);
          runs.push(next.toLocaleString('ko-KR'));
        }
        break;
      case 'monthly':
        for (let i = 0; i < 5; i++) {
          const next = new Date(now);
          next.setMonth(now.getMonth() + i);
          next.setDate(parseInt(scheduleDayOfMonth));
          const [hour, minute] = scheduleTime.split(':');
          next.setHours(parseInt(hour), parseInt(minute), 0, 0);
          runs.push(next.toLocaleString('ko-KR'));
        }
        break;
      case 'cron':
        runs.push('크론 표현식: ' + scheduleCron);
        break;
    }
    
    return runs;
  };

  const handleTestConnection = () => {
    if (!apiEndpoint) {
      toast.error('API Endpoint를 입력해주세요');
      return;
    }
    
    toast.success('🔗 연결 테스트 중...', {
      description: '외부 RAG API와 연결을 확인하고 있습니다.'
    });

    // 실제로는 API 테스트 요청을 보냄
    setTimeout(() => {
      toast.success('✅ 연결 성공!', {
        description: 'API가 정상적으로 응답했습니다.'
      });
    }, 1500);
  };

  const handleStartEvaluation = () => {
    // 유효성 검사
    if (!selectedDataset) {
      toast.error('데이터셋을 선택해주세요');
      return;
    }
    if (!apiEndpoint) {
      toast.error('API Endpoint를 입력해주세요');
      return;
    }
    if (authType === 'api_key' && !apiKey) {
      toast.error('API Key를 입력해주세요');
      return;
    }
    if (selectedMetrics.length === 0) {
      toast.error('최소 1개 이상의 평가 지표를 선택해주세요');
      return;
    }

    const externalConfig: ExternalRAGConfig = {
      endpoint: apiEndpoint,
      method: 'POST',
      auth_type: authType,
      api_key: authType === 'api_key' ? apiKey : undefined,
      bearer_token: authType === 'bearer' ? bearerToken : undefined,
      username: authType === 'basic' ? username : undefined,
      password: authType === 'basic' ? password : undefined,
      request_format: {
        question_field: questionField,
      },
      response_format: {
        answer_field: answerField,
      },
      timeout_seconds: parseInt(timeoutSeconds),
      max_retries: parseInt(maxRetries),
    };

    console.log('External Evaluation Config:', {
      mode: 'external',
      dataset_id: selectedDataset,
      model_id: selectedModel,
      metrics: selectedMetrics,
      external_rag_api: externalConfig,
      llm_judge_config: {
        enabled: llmJudgeSamplingEnabled,
        mode: llmJudgeSamplingMode,
        fixed_ratio: llmJudgeSamplingMode === 'fixed_ratio' ? llmJudgeFixedRatio : undefined,
        max_cases: llmJudgeSamplingMode === 'max_cases' ? llmJudgeMaxCases : undefined,
      },
      schedule: scheduleEnabled ? {
        enabled: true,
        type: scheduleType,
        date: scheduleType === 'once' ? scheduleDate : undefined,
        time: scheduleTime,
        weekday: scheduleType === 'weekly' ? scheduleWeekday : undefined,
        day_of_month: scheduleType === 'monthly' ? parseInt(scheduleDayOfMonth) : undefined,
        cron_expression: scheduleType === 'cron' ? scheduleCron : undefined,
      } : undefined
    });

    if (scheduleEnabled) {
      const scheduleTypeText = 
        scheduleType === 'once' ? '일회성 실행' :
        scheduleType === 'daily' ? '매일 자동 실행' :
        scheduleType === 'weekly' ? '매주 자동 실행' :
        scheduleType === 'monthly' ? '매달 자동 실행' : '크론 스케줄';
      
      toast.success('📅 평가가 예약되었습니다!', {
        description: `${scheduleTypeText} - 다음 실행: ${getNextRuns()[0] || '설정 확인 필요'}`
      });
    } else {
      toast.success('🚀 External 모드 시작!', {
        description: '외부 RAG 시스템과 연결하여 평가를 시작합니다.'
      });
    }

    onStartEvaluation();
  };

  // 지표 그룹화 - 새로운 구조
  const metricGroups = {
    required: {
      name: '✅ 필수 지표 (6개)',
      description: '권장 항목',
      color: 'blue',
      metrics: mockMetrics.filter(m => m.category === 'required').map(m => m.id)
    },
    optional: {
      name: '📌 선택 지표 (6개)',
      description: '필요시 활성화',
      color: 'purple',
      metrics: mockMetrics.filter(m => m.category === 'optional').map(m => m.id)
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-4 max-w-5xl bg-gray-50/30 -m-6 p-6">
        {/* 헤더 */}
        <div>
          {onBack && (
            <Button
              variant="ghost"
              onClick={onBack}
              className="mb-4 text-gray-600 hover:text-blue-600"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              모드 선택으로 돌아가기
            </Button>
          )}
          <h1 className="text-gray-900 font-bold text-[24px]">External 모드(연동된 시스템 평가)</h1>
          <p className="text-gray-600 mt-1 text-sm">
            운영 중인 RAG 시스템과 연결하여 성능을 평가합니다
          </p>
        </div>

        <div className="space-y-6">
            {/* 평가 이름 지정 */}
            <Card className="border-l-4 border-l-gray-400 bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-gray-900">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-400 text-white text-sm shrink-0">
                    📝
                  </div>
                  평가 이름 지정
                </CardTitle>
                <CardDescription className="text-sm ml-10 text-gray-600">
                  평가를 식별할 이름을 입력하세요 (비워두면 자동 생성됩니다)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="evaluation-name" className="text-sm text-gray-700">평가 이름</Label>
                  <Input
                    id="evaluation-name"
                    type="text"
                    placeholder={getDefaultEvaluationName()}
                    value={evaluationName}
                    onChange={(e) => setEvaluationName(e.target.value)}
                    className="h-10"
                  />
                  <p className="text-xs text-gray-500">
                    {evaluationName 
                      ? `"${evaluationName}"로 저장됩니다` 
                      : `비워두면 "${getDefaultEvaluationName()}"로 자동 생성됩니다`}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Step 1: 데이터셋 선택 */}
            <Card className="border-l-4 border-l-blue-500 bg-white shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 text-base text-gray-900">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white text-sm shrink-0">
                        1
                      </div>
                      데이터셋 선택
                    </CardTitle>
                    <CardDescription className="text-sm ml-10 text-gray-600">
                      평가에 사용할 질문 데이터셋을 선택하세요
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label className="text-sm text-gray-700">데이터셋</Label>
                  <Select value={selectedDataset} onValueChange={setSelectedDataset}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="데이터셋을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockDatasets.map(dataset => (
                        <SelectItem key={dataset.id} value={dataset.id}>
                          {dataset.name} ({dataset.qaCount}개 질문)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedDataset && (() => {
                    const dataset = mockDatasets.find(d => d.id === selectedDataset);
                    return dataset ? (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-blue-900">{dataset.name}</span>
                          <Badge className={`${
                            dataset.type === 'auto-generated' 
                              ? 'bg-violet-100 text-violet-700 border-violet-200 border' 
                              : 'bg-blue-100 text-blue-700 border-blue-200 border'
                          }`}>
                            {dataset.type === 'auto-generated' ? '자동 생성' : '업로드'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">질문 개수</span>
                          <span className="text-sm font-semibold text-blue-700">{dataset.qaCount}개</span>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              </CardContent>
            </Card>

            {/* Step 2: RAG API 연동 설정 */}
            <Card className="border-l-4 border-l-green-500 bg-white shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 text-base text-gray-900">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white text-sm shrink-0">
                        2
                      </div>
                      RAG API 연동 설정
                      <Badge variant="outline" className="border-[#DEDEDE] text-[rgb(102,102,102)]">
                        핵심
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-sm ml-10 text-gray-600">
                      운영 중인 RAG 시스템의 API 정보를 입력하세요
                    </CardDescription>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help">
                        <HelpCircle className="h-4 w-4 text-gray-400 hover:text-green-600 transition-colors" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-sm font-medium">API 연동이란?</p>
                      <p className="text-xs text-gray-400 mt-1">
                        REX는 여러분의 RAG API에 질문을 보내고 답변을 받아 평가합니다. 
                        VectorDB나 하이퍼파라미터 설정은 불필요합니다.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* API Endpoint */}
                <div className="space-y-2">
                  <Label htmlFor="api-endpoint" className="text-sm text-gray-700 flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    API Endpoint
                  </Label>
                  <Input
                    id="api-endpoint"
                    type="url"
                    placeholder="https://api.your-rag-system.com/v1/query"
                    value={apiEndpoint}
                    onChange={(e) => setApiEndpoint(e.target.value)}
                    className="h-10 font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500">
                    RAG 시스템의 API endpoint URL을 입력하세요
                  </p>
                </div>

                {/* Authentication */}
                <div className="space-y-2">
                  <Label className="text-sm text-gray-700 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    인증 방식
                  </Label>
                  <Select value={authType} onValueChange={(value: any) => setAuthType(value)}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">인증 없음</SelectItem>
                      <SelectItem value="api_key">API Key</SelectItem>
                      <SelectItem value="bearer">Bearer Token</SelectItem>
                      <SelectItem value="basic">Basic Auth</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Auth Fields */}
                {authType === 'api_key' && (
                  <div className="space-y-2">
                    <Label htmlFor="api-key" className="text-sm text-gray-700">API Key</Label>
                    <Input
                      id="api-key"
                      type="password"
                      placeholder="sk-..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="h-10 font-mono text-sm"
                    />
                  </div>
                )}

                {authType === 'bearer' && (
                  <div className="space-y-2">
                    <Label htmlFor="bearer-token" className="text-sm text-gray-700">Bearer Token</Label>
                    <Input
                      id="bearer-token"
                      type="password"
                      placeholder="eyJ..."
                      value={bearerToken}
                      onChange={(e) => setBearerToken(e.target.value)}
                      className="h-10 font-mono text-sm"
                    />
                  </div>
                )}

                {authType === 'basic' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-sm text-gray-700">Username</Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm text-gray-700">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-10"
                      />
                    </div>
                  </div>
                )}

                {/* Request/Response Format */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="question-field" className="text-sm text-gray-700">
                      질문 필드명
                    </Label>
                    <Input
                      id="question-field"
                      value={questionField}
                      onChange={(e) => setQuestionField(e.target.value)}
                      className="h-10 font-mono text-sm"
                      placeholder="query"
                    />
                    <p className="text-xs text-gray-500">Request의 질문 필드명</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="answer-field" className="text-sm text-gray-700">
                      답변 필드명
                    </Label>
                    <Input
                      id="answer-field"
                      value={answerField}
                      onChange={(e) => setAnswerField(e.target.value)}
                      className="h-10 font-mono text-sm"
                      placeholder="answer"
                    />
                    <p className="text-xs text-gray-500">Response의 답변 필드명</p>
                  </div>
                </div>

                {/* Advanced Settings */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="timeout" className="text-sm text-gray-700">
                      타임아웃 (초)
                    </Label>
                    <Input
                      id="timeout"
                      type="number"
                      value={timeoutSeconds}
                      onChange={(e) => setTimeoutSeconds(e.target.value)}
                      className="h-10"
                      min="5"
                      max="300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-retries" className="text-sm text-gray-700">
                      최대 재시도
                    </Label>
                    <Input
                      id="max-retries"
                      type="number"
                      value={maxRetries}
                      onChange={(e) => setMaxRetries(e.target.value)}
                      className="h-10"
                      min="0"
                      max="10"
                    />
                  </div>
                </div>

                {/* Example Request/Response */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-xs font-medium text-gray-700 mb-2">📋 예상 API 요청 형식</p>
                  <pre className="text-xs bg-gray-800 text-green-400 p-2 rounded overflow-x-auto">
{`POST ${apiEndpoint || 'https://api.example.com/query'}
Content-Type: application/json
${authType === 'api_key' ? `X-API-Key: ${apiKey || 'YOUR_API_KEY'}` : ''}
${authType === 'bearer' ? `Authorization: Bearer ${bearerToken || 'YOUR_TOKEN'}` : ''}

{
  "${questionField}": "질문 내용..."
}`}
                  </pre>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full border-green-300 text-green-700 hover:bg-green-50"
                  onClick={handleTestConnection}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  연결 테스트
                </Button>
              </CardContent>
            </Card>

            {/* Step 3: LLM Judge 모델 */}
            <Card className="border-l-4 border-l-purple-500 bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-gray-900">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500 text-white text-sm shrink-0">
                    3
                  </div>
                  LLM Judge 모델 선택
                </CardTitle>
                <CardDescription className="text-sm ml-10 text-gray-600">
                  평가 지표를 측정할 LLM 모델을 선택하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label className="text-sm text-gray-700">LLM 모델</Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {mockModels.map(model => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name} ({model.provider})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Step 4: 평가 지표 선택 */}
            <Card className="border-l-4 border-l-emerald-500 bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-gray-900">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500 text-white text-sm shrink-0">
                    4
                  </div>
                  평가 지표 선택
                </CardTitle>
                <CardDescription className="text-sm ml-10 text-gray-600">
                  측정할 RAG 성능 지표를 선택하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedMetrics.length === 0 && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                    <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-amber-800">
                      최소 1개 이상의 평가 지표를 선택해주세요.
                    </p>
                  </div>
                )}
                
                <div className="space-y-6">
                  {/* 필수 지표 */}
                  {(() => {
                    const group = metricGroups.required;
                    const groupMetrics = mockMetrics.filter(m => group.metrics.includes(m.id));
                    const selectedCount = groupMetrics.filter(m => selectedMetrics.includes(m.id)).length;
                    
                    return (
                      <div>
                        <div className="mb-4 pb-2 border-b-2 border-blue-300">
                          <div className="flex items-center justify-between">
                            <h3 className="text-gray-900 font-semibold">{group.name}</h3>
                            <span className="text-xs text-blue-600 font-medium">
                              {selectedCount}/{groupMetrics.length} 선택
                            </span>
                          </div>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          {groupMetrics.map(metric => (
                            <div 
                              key={metric.id}
                              className={`p-3 border rounded-lg cursor-pointer transition-all ${
                                selectedMetrics.includes(metric.id)
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300 bg-white'
                              }`}
                              onClick={() => toggleMetric(metric.id)}
                            >
                              <div className="flex items-start gap-2">
                                <Checkbox
                                  checked={selectedMetrics.includes(metric.id)}
                                  onCheckedChange={() => toggleMetric(metric.id)}
                                  className="mt-0.5"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2 mb-1">
                                    <p className="text-sm font-medium text-gray-900">
                                      {metric.nameKo ? `${metric.name} (${metric.nameKo})` : metric.name}
                                    </p>
                                    {metric.subCategory && (
                                      <span className={`text-xs shrink-0 ${
                                        selectedMetrics.includes(metric.id) ? 'text-blue-600' : 'text-gray-500'
                                      }`}>
                                        {metric.subCategory}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-600">{metric.description}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                  
                  {/* 선택 지표 */}
                  {(() => {
                    const group = metricGroups.optional;
                    const groupMetrics = mockMetrics.filter(m => group.metrics.includes(m.id));
                    const selectedCount = groupMetrics.filter(m => selectedMetrics.includes(m.id)).length;
                    
                    return (
                      <div>
                        <div className="mb-4 pb-2 border-b-2 border-gray-300">
                          <div className="flex items-center justify-between">
                            <h3 className="text-gray-900 font-semibold">{group.name}</h3>
                            <span className="text-xs text-gray-500">
                              {selectedCount}/{groupMetrics.length} 선택
                            </span>
                          </div>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          {groupMetrics.map(metric => (
                            <div 
                              key={metric.id}
                              className={`p-3 border rounded-lg cursor-pointer transition-all ${
                                selectedMetrics.includes(metric.id)
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300 bg-white'
                              }`}
                              onClick={() => toggleMetric(metric.id)}
                            >
                              <div className="flex items-start gap-2">
                                <Checkbox
                                  checked={selectedMetrics.includes(metric.id)}
                                  onCheckedChange={() => toggleMetric(metric.id)}
                                  className="mt-0.5"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2 mb-1">
                                    <p className="text-sm font-medium text-gray-900">
                                      {metric.nameKo ? `${metric.name} (${metric.nameKo})` : metric.name}
                                    </p>
                                    {metric.subCategory && (
                                      <span className="text-xs text-gray-500 shrink-0">
                                        {metric.subCategory}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-600">{metric.description}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                  
                  {/* 요약 정보 */}
                  <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">선택된 지표:</span>
                      <span className="font-semibold text-[rgb(51,51,51)] text-[14px]">
                        {selectedMetrics.length}개 (필수 {selectedMetrics.filter(id => metricGroups.required.metrics.includes(id)).length} + 선택 {selectedMetrics.filter(id => metricGroups.optional.metrics.includes(id)).length})
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-gray-700">예상 실행 시간:</span>
                      <span className="font-semibold text-[rgb(51,51,51)]">
                        약 {Math.round(5 + selectedMetrics.length * 0.8)}-{Math.round(7 + selectedMetrics.length * 1.2)}분
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 5: LLM Judge 분석 설정 */}
            <Card className="border-l-4 border-l-blue-500 bg-white shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 text-base text-gray-900">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white text-sm shrink-0">
                        5
                      </div>
                      AI 분석 설정
                      <Badge variant="outline" className="border-[#DEDEDE] text-[#666666]">
                        선택사항
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-sm ml-10 text-gray-600">
                      실패 케이스를 AI가 분석하여 개선 방향을 제공합니다
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDetailGuideDialog(true)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <BookOpen className="h-4 w-4 mr-1" />
                    상세 가이드
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* AI 분석 활성화 토글 */}
                <div className={`flex items-center justify-between p-3 rounded-lg border ${
                  llmJudgeSamplingEnabled 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-white border-gray-300'
                }`}>
                  <div className="space-y-0.5">
                    <Label className="text-sm text-gray-900 font-medium">AI 진단 활성화</Label>
                    <p className="text-gray-600 text-xs">실패 원인 분석 및 개선 조언 제공</p>
                  </div>
                  <Switch checked={llmJudgeSamplingEnabled} onCheckedChange={setLlmJudgeSamplingEnabled} />
                </div>

                {llmJudgeSamplingEnabled && (
                  <>
                    {/* 모드 선택 도우미 버튼 */}
                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-700">
                            어떤 모드를 선택해야 할지 모르겠나요?
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowModeGuideDialog(true)}
                          className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          모드 선택 도우미
                        </Button>
                      </div>
                    </div>

                    {/* 프리셋 선택 카드 */}
                    <div className="grid grid-cols-3 gap-3">
                      {/* 빠른 모드 */}
                      <div
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          llmJudgePreset === 'fast'
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        }`}
                        onClick={() => handlePresetChange('fast')}
                      >
                        <div className="text-center space-y-2">
                          <div className="flex justify-center">
                            <div className={`p-2 rounded-full ${
                              llmJudgePreset === 'fast' ? 'bg-blue-100' : 'bg-gray-100'
                            }`}>
                              <Zap className={`h-5 w-5 ${
                                llmJudgePreset === 'fast' ? 'text-blue-600' : 'text-gray-600'
                              }`} />
                            </div>
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-gray-900">빠른 분석</p>
                            <p className="text-xs text-gray-500 mt-0.5">권장</p>
                          </div>
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center justify-center gap-1 text-gray-600">
                              <Clock className="h-3 w-3" />
                              <span>{getPresetInfo('fast').time}</span>
                            </div>
                            <div className="flex items-center justify-center gap-1 text-gray-600">
                              <DollarSign className="h-3 w-3" />
                              <span>비용 {getPresetInfo('fast').cost}</span>
                            </div>
                            <div className="flex items-center justify-center gap-1 text-gray-600">
                              <TrendingUp className="h-3 w-3" />
                              <span>{'⭐'.repeat(getPresetInfo('fast').reliability)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 균형 모드 */}
                      <div
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          llmJudgePreset === 'balanced'
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        }`}
                        onClick={() => handlePresetChange('balanced')}
                      >
                        <div className="text-center space-y-2">
                          <div className="flex justify-center">
                            <div className={`p-2 rounded-full ${
                              llmJudgePreset === 'balanced' ? 'bg-blue-100' : 'bg-gray-100'
                            }`}>
                              <Scale className={`h-5 w-5 ${
                                llmJudgePreset === 'balanced' ? 'text-blue-600' : 'text-gray-600'
                              }`} />
                            </div>
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-gray-900">균형 분석</p>
                            <p className="text-xs text-gray-500 mt-0.5">추천</p>
                          </div>
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center justify-center gap-1 text-gray-600">
                              <Clock className="h-3 w-3" />
                              <span>{getPresetInfo('balanced').time}</span>
                            </div>
                            <div className="flex items-center justify-center gap-1 text-gray-600">
                              <DollarSign className="h-3 w-3" />
                              <span>비용 {getPresetInfo('balanced').cost}</span>
                            </div>
                            <div className="flex items-center justify-center gap-1 text-gray-600">
                              <TrendingUp className="h-3 w-3" />
                              <span>{'⭐'.repeat(getPresetInfo('balanced').reliability)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 정밀 모드 */}
                      <div
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          llmJudgePreset === 'precise'
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        }`}
                        onClick={() => handlePresetChange('precise')}
                      >
                        <div className="text-center space-y-2">
                          <div className="flex justify-center">
                            <div className={`p-2 rounded-full ${
                              llmJudgePreset === 'precise' ? 'bg-blue-100' : 'bg-gray-100'
                            }`}>
                              <Crosshair className={`h-5 w-5 ${
                                llmJudgePreset === 'precise' ? 'text-blue-600' : 'text-gray-600'
                              }`} />
                            </div>
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-gray-900">정밀 분석</p>
                            <p className="text-xs text-gray-500 mt-0.5">전체 분석</p>
                          </div>
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center justify-center gap-1 text-gray-600">
                              <Clock className="h-3 w-3" />
                              <span>{getPresetInfo('precise').time}</span>
                            </div>
                            <div className="flex items-center justify-center gap-1 text-gray-600">
                              <DollarSign className="h-3 w-3" />
                              <span>비용 {getPresetInfo('precise').cost}</span>
                            </div>
                            <div className="flex items-center justify-center gap-1 text-gray-600">
                              <TrendingUp className="h-3 w-3" />
                              <span>{'⭐'.repeat(getPresetInfo('precise').reliability)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 선택된 모드 요약 */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-start gap-3">
                        <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                        <div className="space-y-1 flex-1">
                          <p className="text-sm font-medium text-blue-900">
                            {llmJudgePreset === 'fast' ? '⚡ 빠른 분석' : 
                             llmJudgePreset === 'balanced' ? '⚖️ 균형 분석' : 
                             '🎯 정밀 분석'} 모드 선택됨
                          </p>
                          <p className="text-xs text-blue-700">
                            {llmJudgePreset === 'fast' && '대부분의 실패 원인을 빠르게 파악합니다. 일상적인 모니터링에 적합합니다.'}
                            {llmJudgePreset === 'balanced' && '비용과 정확도의 최적 균형을 제공합니다. 대부분의 경우에 권장됩니다.'}
                            {llmJudgePreset === 'precise' && '모든 실패 케이스를 상세히 분석합니다. 중요한 이슈 해결 시 사용하세요.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 고급 설정 (접힌 상태) */}
                    <div className="border border-gray-200 rounded-lg">
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="advanced" className="border-0 px-3">
                          <AccordionTrigger className="text-sm font-medium text-gray-700 hover:text-gray-900 py-3">
                            <div className="flex items-center gap-2">
                              <Sliders className="h-4 w-4" />
                              고급 설정
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="space-y-3">
                            {/* 샘플링 모드 */}
                            <div className="space-y-2">
                              <Label className="text-sm text-gray-700">샘플링 모드</Label>
                              <Select value={llmJudgeSamplingMode} onValueChange={(value: any) => setLlmJudgeSamplingMode(value)}>
                                <SelectTrigger className="h-9">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="auto">자동 (권장)</SelectItem>
                                  <SelectItem value="fixed_ratio">고정 비율</SelectItem>
                                  <SelectItem value="max_cases">최대 케이스 수</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* 고정 비율 설정 */}
                            {llmJudgeSamplingMode === 'fixed_ratio' && (
                              <div className="space-y-2">
                                <Label className="text-sm text-gray-700">
                                  분석 비율: {llmJudgeFixedRatio}%
                                </Label>
                                <Slider
                                  value={[llmJudgeFixedRatio]}
                                  onValueChange={(v) => setLlmJudgeFixedRatio(v[0])}
                                  min={5}
                                  max={100}
                                  step={5}
                                  className="py-2"
                                />
                                <p className="text-xs text-gray-500">
                                  실패 케이스의 {llmJudgeFixedRatio}%를 샘플링하여 분석합니다
                                </p>
                              </div>
                            )}

                            {/* 최대 케이스 수 설정 */}
                            {llmJudgeSamplingMode === 'max_cases' && (
                              <div className="space-y-2">
                                <Label className="text-sm text-gray-700">최대 분석 케이스 수</Label>
                                <Input
                                  type="number"
                                  value={llmJudgeMaxCases}
                                  onChange={(e) => setLlmJudgeMaxCases(Number(e.target.value))}
                                  min={10}
                                  max={1000}
                                  step={10}
                                  className="h-9"
                                />
                                <p className="text-xs text-gray-500">
                                  최대 {llmJudgeMaxCases}개의 실패 케이스를 분석합니다
                                </p>
                              </div>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  </>
                )}

                {!llmJudgeSamplingEnabled && (
                  <div className="bg-amber-50 border border-amber-300 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-900">AI 진단 비활성화</p>
                        <p className="text-xs text-gray-700">
                          점수만 제공되며, 실패 원인과 개선 방향을 알 수 없습니다.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Step 6: 예약 및 자동화 */}
            <Card className="border-l-4 border-l-amber-500 bg-white shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 text-base text-gray-900">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500 text-white text-sm shrink-0">
                        6
                      </div>
                      예약 및 자동화
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        선택사항
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-sm ml-10 text-gray-600">
                      정기적인 평가 모니터링을 위한 스케줄을 설정하세요
                    </CardDescription>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help">
                        <HelpCircle className="h-4 w-4 text-gray-400 hover:text-amber-600 transition-colors" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-sm font-medium">정기 평가란?</p>
                      <p className="text-xs text-gray-400 mt-1">
                        운영 중인 RAG 시스템의 품질을 지속적으로 모니터링하기 위해 
                        자동으로 평가를 실행합니다.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 예약 활성화 토글 */}
                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="space-y-0.5">
                    <Label className="text-sm text-gray-900 font-medium">반복 평가 예약</Label>
                    <p className="text-gray-600 text-xs">설정한 주기로 자동 평가를 실행합니다</p>
                  </div>
                  <Switch checked={scheduleEnabled} onCheckedChange={setScheduleEnabled} />
                </div>

                {scheduleEnabled && (
                  <>
                    <Separator />
                    
                    {/* 스케줄 타입 선택 */}
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-700">실행 주기</Label>
                      <Select value={scheduleType} onValueChange={(value: any) => setScheduleType(value)}>
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="once">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              일회성 실행
                            </div>
                          </SelectItem>
                          <SelectItem value="daily">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              매일
                            </div>
                          </SelectItem>
                          <SelectItem value="weekly">
                            <div className="flex items-center gap-2">
                              <Repeat className="h-4 w-4" />
                              매주
                            </div>
                          </SelectItem>
                          <SelectItem value="monthly">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              매달
                            </div>
                          </SelectItem>
                          <SelectItem value="cron">
                            <div className="flex items-center gap-2">
                              <Code className="h-4 w-4" />
                              크론 표현식 (고급)
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 일회성 실행 설정 */}
                    {scheduleType === 'once' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-sm text-gray-700">실행 날짜</Label>
                          <Input 
                            type="date" 
                            value={scheduleDate}
                            onChange={(e) => setScheduleDate(e.target.value)}
                            className="h-10"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm text-gray-700">실행 시간</Label>
                          <Input 
                            type="time" 
                            value={scheduleTime}
                            onChange={(e) => setScheduleTime(e.target.value)}
                            className="h-10"
                          />
                        </div>
                      </div>
                    )}

                    {/* 매일 실행 설정 */}
                    {scheduleType === 'daily' && (
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-700">실행 시간</Label>
                        <Select value={scheduleTime} onValueChange={setScheduleTime}>
                          <SelectTrigger className="h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 24 }, (_, i) => {
                              const hour = i.toString().padStart(2, '0');
                              return (
                                <SelectItem key={hour} value={`${hour}:00`}>
                                  {hour}:00 ({i < 12 ? '오전' : '오후'} {i % 12 || 12}시)
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* 매주 실행 설정 */}
                    {scheduleType === 'weekly' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-sm text-gray-700">요일</Label>
                          <Select value={scheduleWeekday} onValueChange={setScheduleWeekday}>
                            <SelectTrigger className="h-10">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monday">월요일</SelectItem>
                              <SelectItem value="tuesday">화요일</SelectItem>
                              <SelectItem value="wednesday">수요일</SelectItem>
                              <SelectItem value="thursday">목요일</SelectItem>
                              <SelectItem value="friday">금요일</SelectItem>
                              <SelectItem value="saturday">토요일</SelectItem>
                              <SelectItem value="sunday">일요일</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm text-gray-700">실행 시간</Label>
                          <Select value={scheduleTime} onValueChange={setScheduleTime}>
                            <SelectTrigger className="h-10">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 24 }, (_, i) => {
                                const hour = i.toString().padStart(2, '0');
                                return (
                                  <SelectItem key={hour} value={`${hour}:00`}>
                                    {hour}:00
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {/* 매달 실행 설정 */}
                    {scheduleType === 'monthly' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-sm text-gray-700">날짜</Label>
                          <Select value={scheduleDayOfMonth} onValueChange={setScheduleDayOfMonth}>
                            <SelectTrigger className="h-10">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 31 }, (_, i) => (
                                <SelectItem key={i + 1} value={String(i + 1)}>
                                  {i + 1}일
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm text-gray-700">실행 시간</Label>
                          <Select value={scheduleTime} onValueChange={setScheduleTime}>
                            <SelectTrigger className="h-10">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 24 }, (_, i) => {
                                const hour = i.toString().padStart(2, '0');
                                return (
                                  <SelectItem key={hour} value={`${hour}:00`}>
                                    {hour}:00
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {/* 크론 표현식 설정 */}
                    {scheduleType === 'cron' && (
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-700">크론 표현식</Label>
                        <Input 
                          value={scheduleCron}
                          onChange={(e) => setScheduleCron(e.target.value)}
                          className="h-10 font-mono text-sm"
                          placeholder="0 9 * * 1"
                        />
                        <p className="text-xs text-gray-500">
                          예: 0 9 * * 1 = 매주 월요일 오전 9시
                        </p>
                      </div>
                    )}

                    {/* 다음 실행 시간 미리보기 */}
                    {getNextRuns().length > 0 && (
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <p className="text-sm font-medium text-blue-900 mb-2">
                          📅 다음 실행 예정 시간
                        </p>
                        <div className="space-y-1">
                          {getNextRuns().slice(0, 3).map((run, idx) => (
                            <p key={idx} className="text-xs text-blue-700">
                              {idx + 1}. {run}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* 평가 시작 버튼 */}
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-none shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="text-white">
                    <h3 className="text-lg font-semibold mb-1">평가 준비 완료</h3>
                    <p className="text-sm text-blue-100">
                      {scheduleEnabled 
                        ? '스케줄 설정을 확인하고 예약하세요' 
                        : '설정을 확인하고 평가를 시작하세요'}
                    </p>
                  </div>
                  <Button
                    size="lg"
                    className="bg-white text-blue-600 hover:bg-blue-50 h-12 px-8"
                    onClick={handleStartEvaluation}
                  >
                    {scheduleEnabled ? (
                      <>
                        <Calendar className="h-5 w-5 mr-2" />
                        평가 예약하기
                      </>
                    ) : (
                      <>
                        <Play className="h-5 w-5 mr-2" />
                        평가 시작
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

        {/* 모드 선택 도우미 Dialog */}
        <Dialog open={showModeGuideDialog} onOpenChange={setShowModeGuideDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              어떤 분석 모드를 선택해야 하나요?
            </DialogTitle>
            <DialogDescription>
              평가 목적과 상황에 맞는 최적의 모드를 찾아보세요
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* 빠른 분석 */}
            <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                  <Zap className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">⚡ 빠른 분석</h4>
                    <Badge className="bg-green-100 text-green-700 border-green-200">권장</Badge>
                  </div>
                  <p className="text-sm text-gray-700">
                    일상적인 품질 모니터링에 최적화된 모드입니다.
                  </p>
                  <div className="space-y-1 text-xs text-gray-600">
                    <p>✅ 대부분의 실패 패턴을 빠르게 파악</p>
                    <p>✅ 최소 비용으로 주요 이슈 발견</p>
                    <p>✅ 매일 실행하기에 적합</p>
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-700">이런 경우 선택하세요:</p>
                    <p className="text-xs text-gray-600 mt-1">
                      • 정기적인 품질 체크<br/>
                      • 주요 이슈만 빠르게 확인<br/>
                      • 예산이 제한적인 경우
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 균형 분석 */}
            <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 rounded-lg shrink-0">
                  <Scale className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">⚖️ 균형 분석</h4>
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200">추천</Badge>
                  </div>
                  <p className="text-sm text-gray-700">
                    비용과 정확도의 최적 균형을 제공하는 모드입니다.
                  </p>
                  <div className="space-y-1 text-xs text-gray-600">
                    <p>✅ 실패 원인을 충분히 상세하게 분석</p>
                    <p>✅ 합리적인 비용으로 높은 신뢰도 확보</p>
                    <p>✅ 주간 단위 모니터링에 적합</p>
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-700">이런 경우 선택하세요:</p>
                    <p className="text-xs text-gray-600 mt-1">
                      • 일반적인 평가 작업<br/>
                      • 품질 개선 작업 진행 중<br/>
                      • 상세 분석이 필요하지만 비용도 고려
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 정밀 분석 */}
            <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-100 rounded-lg shrink-0">
                  <Crosshair className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">🎯 정밀 분석</h4>
                    <Badge className="bg-red-100 text-red-700 border-red-200">고비용</Badge>
                  </div>
                  <p className="text-sm text-gray-700">
                    모든 실패 케이스를 상세히 분석하는 완전 분석 모드입니다.
                  </p>
                  <div className="space-y-1 text-xs text-gray-600">
                    <p>✅ 100% 모든 실패 케이스 분석</p>
                    <p>✅ 최고 수준의 진단 신뢰도</p>
                    <p>✅ 심층적인 문제 해결에 적합</p>
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-700">이런 경우 선택하세요:</p>
                    <p className="text-xs text-gray-600 mt-1">
                      • 중요한 이슈 디버깅<br/>
                      • 프로덕션 배포 전 최종 검증<br/>
                      • 완벽한 품질이 필요한 경우
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 비교 표 */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">모드 비교</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="text-left py-2 px-2 text-gray-700">항목</th>
                      <th className="text-center py-2 px-2 text-gray-700">빠른</th>
                      <th className="text-center py-2 px-2 text-gray-700">균형</th>
                      <th className="text-center py-2 px-2 text-gray-700">정밀</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600">
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-2">실행 시간</td>
                      <td className="text-center py-2 px-2">2-3분</td>
                      <td className="text-center py-2 px-2">5-8분</td>
                      <td className="text-center py-2 px-2">15-30분</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-2">LLM 호출</td>
                      <td className="text-center py-2 px-2">~20회</td>
                      <td className="text-center py-2 px-2">~80회</td>
                      <td className="text-center py-2 px-2">~400회</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-2">예상 비용</td>
                      <td className="text-center py-2 px-2">$0.2</td>
                      <td className="text-center py-2 px-2">$0.8</td>
                      <td className="text-center py-2 px-2">$4.0</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-2">신뢰도</td>
                      <td className="text-center py-2 px-2">⭐⭐⭐</td>
                      <td className="text-center py-2 px-2">⭐⭐⭐⭐</td>
                      <td className="text-center py-2 px-2">⭐⭐⭐⭐⭐</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 상세 가이드 Dialog */}
      <Dialog open={showDetailGuideDialog} onOpenChange={setShowDetailGuideDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              AI 분석 상세 가이드
            </DialogTitle>
            <DialogDescription>
              LLM Judge 기반 진단의 동작 원리와 비용 최적화 전략
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* 평가 프로세스 */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600" />
                평가 프로세스
              </h3>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-xs shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">휴리스틱 필터링</p>
                      <p className="text-xs text-gray-600 mt-1">
                        점수 임계값, 키워드 매칭 등으로 명백한 실패 케이스를 자동 분류
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-xs shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">스마트 샘플링</p>
                      <p className="text-xs text-gray-600 mt-1">
                        선택한 모드에 따라 대표적인 실패 케이스를 추출
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-xs shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">LLM Judge 분석</p>
                      <p className="text-xs text-gray-600 mt-1">
                        GPT-4가 각 실패 케이스의 근본 원인을 분석하고 개선 방향 제시
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-xs shrink-0 mt-0.5">
                      4
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">패턴 집계</p>
                      <p className="text-xs text-gray-600 mt-1">
                        유사한 실패 원인을 그룹화하여 우선순위별 개선 과제 도출
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 비용 최적화 */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                비용 최적화 전략
              </h3>
              <div className="space-y-2 text-sm">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="font-medium text-green-900 mb-1">2단계 필터링 시스템</p>
                  <p className="text-xs text-green-700">
                    휴리스틱 필터(1차) + 샘플링(2차)으로 LLM 호출을 90% 이상 절감하면서도 
                    주요 이슈는 모두 발견합니다.
                  </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="font-medium text-green-900 mb-1">자동 모드 최적화</p>
                  <p className="text-xs text-green-700">
                    실패 케이스 수에 따라 분석 비율을 자동 조정하여 항상 최적의 
                    비용 효율성을 유지합니다.
                  </p>
                </div>
              </div>
            </div>

            {/* 신뢰도 정보 */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4 text-purple-600" />
                진단 신뢰도
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="text-center">
                    <div className="text-2xl mb-1">⭐⭐⭐</div>
                    <p className="text-xs font-medium text-gray-900 mb-1">빠른 모드</p>
                    <p className="text-xs text-gray-600">주요 패턴 발견</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="text-center">
                    <div className="text-2xl mb-1">⭐⭐⭐⭐</div>
                    <p className="text-xs font-medium text-gray-900 mb-1">균형 모드</p>
                    <p className="text-xs text-gray-600">상세 분석</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="text-center">
                    <div className="text-2xl mb-1">⭐⭐⭐⭐⭐</div>
                    <p className="text-xs font-medium text-gray-900 mb-1">정밀 모드</p>
                    <p className="text-xs text-gray-600">완전 분석</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 팁 */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-amber-900">💡 Pro Tips</p>
                  <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
                    <li>일상적인 모니터링은 "빠른 모드"로 설정하고 매일 실행</li>
                    <li>중요한 업데이트 후에는 "정밀 모드"로 완전 검증</li>
                    <li>고급 설정에서 샘플링 비율을 조정하여 비용 최적화 가능</li>
                    <li>실패 패턴이 유사한 경우 빠른 모드로도 충분히 진단 가능</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </TooltipProvider>
  );
}
