import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Textarea } from './ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { 
  Zap, 
  Target, 
  Settings, 
  Play,
  Info,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Brain,
  Eye,
  Save,
  HelpCircle
} from 'lucide-react';
import { mockEvaluations, mockMetrics } from '../lib/mock-data';

interface AutoImproveSetupPageBlueProps {
  onStartAutoImprove: (experimentCount: number) => void;
}

export function AutoImproveSetupPageBlue({ onStartAutoImprove }: AutoImproveSetupPageBlueProps) {
  const completedEvaluations = mockEvaluations.filter(e => e.status === 'completed');
  
  // 기본값 설정: 첫 번째 평가 선택
  const [baseEvaluationId, setBaseEvaluationId] = useState(
    completedEvaluations.length > 0 ? completedEvaluations[0].id : ''
  );
  // 기본값 설정: 첫 번째 지표 선택
  const [targetMetric, setTargetMetric] = useState(
    mockMetrics.length > 0 ? mockMetrics[0].id : ''
  );
  // 파라미터 ID -> 선택된 옵션들의 배열 (추천 설정 기본 선택)
  const [selectedParams, setSelectedParams] = useState<Record<string, string[]>>({
    chunk_size: ['256', '512'],      // Retrieval: 2개 옵션
    top_k: ['3', '5'],                // Retrieval: 2개 옵션
    temperature: ['0.3', '0.5', '0.7'] // Generation: 3개 옵션
  });
  // 펼쳐진 파라미터 ID 목록 (모든 파라미터 펼치기)
  const [expandedParams, setExpandedParams] = useState<string[]>([
    'llm_model', 'temperature', 'chunk_size', 'embedding_model', 'top_k', 'max_tokens'
  ]);

  // LLM Judge 프롬프트 설정
  const [llmJudgeEnabled, setLlmJudgeEnabled] = useState(true);
  const [llmJudgePromptVersion, setLlmJudgePromptVersion] = useState('v1.0');
  const [showPromptPreview, setShowPromptPreview] = useState(false);

  // 버전별 프롬프트 템플릿 정의
  const getPromptTemplate = (version: string) => {
    switch (version) {
      case 'v1.0':
        return `당신은 RAG(Retrieval-Augmented Generation) 파이프라인 성능 평가 전문가입니다.

임무: 사용자 질문, 검색된 컨텍스트, 생성된 답변을 분석하여 낮은 점수 케이스의 원인을 진단하세요.

## 입력 데이터

**사용자_질문:** {{USER_QUESTION}}
**기대_답변:** {{EXPECTED_ANSWER}}
**생성된_답변:** {{GENERATED_ANSWER}}
**검색된_컨텍스트:** {{RETRIEVED_CONTEXTS}}
**실패한_지표:** {{FAILED_METRIC}}

## 진단 가이드

1. 검색(Retrieval) 문제인지 판단
   - 컨텍스트에 필요한 정보가 있는가?
   
2. 생성(Generation) 문제인지 판단
   - 컨텍스트는 충분하나 답변이 부정확한가?

## 출력 형식

{
  "failure_type": "Retrieval | Generation | Both",
  "reason": "문제 요약 (한국어)",
  "root_cause": {
    "summary_ko": "상세 분석 (한국어)",
    "advice_ko": "개선 조언 (한국어)"
  }
}`;

      case 'v1.1':
        return `당신은 RAG(Retrieval-Augmented Generation) 파이프라인 성능 평가를 전문으로 하는 **20년 경력의 베테랑 솔루션 아키텍트이자 디버거**입니다.

임무: 사용자 질문, 검색된 컨텍스트, 생성된 답변을 분석하여 **낮은 점수 케이스의 근본 원인**을 최대한 논리적 정확성으로 진단하세요.

## 분석 입력 데이터

**사용자_질문:** {{USER_QUESTION}}
**기대_답변:** {{EXPECTED_ANSWER}}
**생성된_답변:** {{GENERATED_ANSWER}}
**검색된_컨텍스트:** {{RETRIEVED_CONTEXTS}}
**실패한_지표:** {{FAILED_METRIC}}

## Chain-of-Thought 진단 프로세스 (필수)

**1단계: 검색 품질 평가**
- 검색된 컨텍스트에 질문 답변에 필요한 정보가 포함되어 있는가?
- 컨텍스트의 관련성(Relevance)과 완전성(Completeness)은 충분한가?
- 판단 근거를 명확히 제시하세요.

**2단계: 생성 품질 평가**
- 컨텍스트 정보를 활용하여 올바른 답변을 생성했는가?
- Hallucination(환각) 또는 컨텍스트 무시 현상이 있는가?
- 답변의 정확성과 충실도(Faithfulness)를 평가하세요.

**3단계: 근본 원인 식별**
- Retrieval 오류인가, Generation 오류인가, 혹은 Both인가?
- 각 판단에 대한 논리적 근거를 제시하세요.

**4단계: 개선 방안 제시**
- 파이프라인 컴포넌트별 구체적인 개선 조치를 제안하세요.
- 예: "Chunk Size 축소", "Temperature 조정", "Embedding 모델 교체" 등

## 필수 출력 형식

다음 정확한 구조의 유효한 JSON만 반환하세요:

{
  "failure_type": "Retrieval | Generation | Both",
  "reason": "[50자 요약] 핵심 문제 요약 (한국어)",
  "root_cause": {
    "summary_ko": "[상세 분석] 전문가 수준의 진단 (한국어)",
    "advice_ko": "[개선 조언] 문제 해결을 위한 구체적 조치 (한국어)"
  }
}`;

      case 'v1.2':
        return `당신은 RAG(Retrieval-Augmented Generation) 파이프라인 성능 평가를 전문으로 하는 **20년 경력의 베테랑 솔루션 아키텍트이자 디버거**입니다.

임무: 사용자 질문, 검색된 컨텍스트, 생성된 답변을 분석하여 **낮은 점수 케이스의 근본 원인**을 최대한 논리적 정확성으로 진단하세요.

진단은 다음 중 하나 또는 둘 다에 초점을 맞춰야 합니다:
- **Retrieval 오류** (검색 품질 문제)
- **Generation 오류** (답변 품질 문제)

## 분석 입력 데이터

**사용자_질문:** {{USER_QUESTION}}
**기대_답변:** {{EXPECTED_ANSWER}}
**생성된_답변:** {{GENERATED_ANSWER}}
**검색된_컨텍스트:** {{RETRIEVED_CONTEXTS}}
**실패한_지표:** {{FAILED_METRIC}}

## Chain-of-Thought 진단 프로세스 (필수)

**1단계: 검색 품질 평가**
- 검색된 컨텍스트에 질문 답변에 필요한 정보가 포함되어 있는가?
- 컨텍스트의 관련성(Relevance)과 완전성(Completeness)은 충분한가?
- 판단 근거를 명확히 제시하세요.

**2단계: 생성 품질 평가**
- 컨텍스트 정보를 활용하여 올바른 답변을 생성했는가?
- Hallucination(환각) 또는 컨텍스트 무시 현상이 있는가?
- 답변의 정확성과 충실도(Faithfulness)를 평가하세요.

**3단계: 근본 원인 식별**
- Retrieval 오류인가, Generation 오류인가, 혹은 Both인가?
- 각 판단에 대한 논리적 근거를 제시하세요.

**4단계: 개선 방안 제시**
- 파이프라인 컴포넌트별 구체적인 개선 조치를 제안하세요.
- 예: "Chunk Size 축소", "Temperature 조정", "Embedding 모델 교체" 등

## ⚠️ 중요: JSON 출력 강제 규칙

**절대 준수 사항:**
1. 응답은 **오직 유효한 JSON만** 포함해야 합니다.
2. JSON 외 다른 텍스트(설명, 주석 등)를 **절대 포함하지 마세요**.
3. JSON 구조를 **정확히** 준수하세요.
4. 모든 문자열 값은 **반드시 큰따옴표**로 감싸세요.

## 필수 출력 형식 (100% JSON)

다음 정확한 구조의 유효한 JSON**만** 반환하세요:

{
  "failure_type": "Retrieval | Generation | Both",
  "reason": "[50자 요약] 핵심 문제 요약 (한국어)",
  "root_cause": {
    "summary_ko": "[상세 분석] 전문가 수준의 진단 (한국어)",
    "advice_ko": "[개선 조언] 문제 해결을 위한 구체적 조치 (한국어)"
  }
}

**다시 강조:** JSON 외 **어떠한 추가 텍스트도 작성하지 마세요**. 위 형식의 JSON만 반환하세요.`;

      default:
        return '';
    }
  };

  // 실험 가능한 파라미터 정의
  const availableParameters = [
    {
      id: 'llm_model',
      name: 'LLM 모델',
      category: 'generation',
      options: ['GPT-4o', 'GPT-4o-mini', 'Claude-3 Opus', 'Claude-3.5 Sonnet'],
      description: '사용할 LLM 모델을 변경하여 답변 생성 품질을 비교'
    },
    {
      id: 'temperature',
      name: 'Temperature',
      category: 'generation',
      options: ['0.1', '0.3', '0.5', '0.7', '0.9'],
      description: 'LLM의 창의성 수준 조정 (낮을수록 일관성 높음)'
    },
    {
      id: 'chunk_size',
      name: 'Chunk Size',
      category: 'retrieval',
      options: ['128', '256', '512', '1024'],
      description: '문서를 나누는 청크의 크기 (토큰 단위)'
    },
    {
      id: 'embedding_model',
      name: 'Embedding 모델',
      category: 'retrieval',
      options: ['text-embedding-ada-002', 'text-embedding-3-small', 'text-embedding-3-large'],
      description: '문서 임베딩에 사용할 모델 선택'
    },
    {
      id: 'top_k',
      name: 'Top-K',
      category: 'retrieval',
      options: ['3', '5', '10', '15'],
      description: '검색할 문서 개수'
    },
    {
      id: 'max_tokens',
      name: 'Max Tokens',
      category: 'generation',
      options: ['128', '256', '512', '1024'],
      description: '생성할 답변의 최대 토큰 수'
    }
  ];

  // 파라미터 펼치기/접기
  const toggleExpand = (paramId: string) => {
    setExpandedParams(prev => 
      prev.includes(paramId)
        ? prev.filter(id => id !== paramId)
        : [...prev, paramId]
    );
  };

  // 개별 옵션 토글
  const toggleOption = (paramId: string, option: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedParams(prev => {
      const currentOptions = prev[paramId] || [];
      const newOptions = currentOptions.includes(option)
        ? currentOptions.filter(opt => opt !== option)
        : [...currentOptions, option];
      
      // 옵션이 하나도 없으면 파라미터 자체를 제거
      if (newOptions.length === 0) {
        const { [paramId]: _, ...rest } = prev;
        return rest;
      }
      
      return { ...prev, [paramId]: newOptions };
    });
  };

  // 파라미터 전체 선택/해제
  const toggleAllOptions = (paramId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const param = availableParameters.find(p => p.id === paramId);
    if (!param) return;

    setSelectedParams(prev => {
      const currentOptions = prev[paramId] || [];
      // 모든 옵션이 선택되어 있으면 전체 해제
      if (currentOptions.length === param.options.length) {
        const { [paramId]: _, ...rest } = prev;
        return rest;
      }
      // 아니면 전체 선택
      return { ...prev, [paramId]: param.options };
    });
  };

  // 선택된 파라미터 개수
  const selectedParamsCount = Object.keys(selectedParams).length;

  // 예상 실험 횟수 계산
  const estimatedExperiments = Object.values(selectedParams).reduce((total, options) => {
    return total === 0 ? options.length : total * options.length;
  }, 0);

  const handleStartAutoImprove = () => {
    if (!baseEvaluationId || !targetMetric || selectedParamsCount === 0) {
      alert('모든 필수 항목을 선택해주세요.');
      return;
    }
    onStartAutoImprove(estimatedExperiments);
  };

  return (
    <div className="space-y-6 max-w-6xl bg-gray-50/30 -m-6 p-6">
      <div>
        <h1 className="text-gray-900 font-bold text-[24px]">자동 개선 실험 구성 (Auto Improve Experiment Setup)</h1>
        <p className="text-gray-600 mt-1 text-sm">
          최적화 목표 지표를 설정하고 파라미터 탐색 범위를 지정하십시오. 시스템이 자동화된 인프라를 통해 최적의 RAG 성능 파라미터를 찾기 위한 실험을 실행합니다.
        </p>
      </div>

      {/* 안내 메시지 */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="pt-4">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-blue-900 text-sm">
                자동 개선 기능은 선택한 파라미터의 모든 조합에 대해 평가를 실행하고, 
                목표 지표를 최대화하는 최적의 설정을 찾아줍니다.
              </p>
              <p className="text-blue-800 text-xs">
                ⚠️ 실험 횟수가 많을수록 소요 시간과 비용이 증가합니다. 
                먼저 중요한 파라미터 1-2개로 시작하는 것을 권장합니다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* 1. 기반 평가 선택 */}
        <Card className="border-blue-100 bg-white shadow-sm">
          <CardHeader className="pb-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Target className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-base text-gray-900">1. 기반 평가 선택</CardTitle>
                <CardDescription className="text-xs text-gray-600">
                  개선할 기존 평가를 선택하세요
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="base-eval" className="text-sm text-gray-700">기반 평가</Label>
                <Select value={baseEvaluationId} onValueChange={setBaseEvaluationId}>
                  <SelectTrigger id="base-eval" className="mt-1.5">
                    <SelectValue placeholder="평가를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {completedEvaluations.map(evaluation => (
                      <SelectItem key={evaluation.id} value={evaluation.id}>
                        {evaluation.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {baseEvaluationId && (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 mb-2">현재 설정:</p>
                  <ul className="space-y-1 text-xs text-gray-700">
                    <li>• LLM: GPT-4o</li>
                    <li>• Temperature: 0.7</li>
                    <li>• Chunk Size: 512</li>
                    <li>• Top-K: 5</li>
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 2. 최적화 목표 지표 */}
        <Card className="border-blue-100 bg-white shadow-sm">
          <CardHeader className="pb-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-base text-gray-900">2. 최적화 목표 지표</CardTitle>
                <CardDescription className="text-xs text-gray-600">
                  개선하고자 하는 지표를 선택하세요
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="target-metric" className="text-sm text-gray-700">목표 지표</Label>
                <Select value={targetMetric} onValueChange={setTargetMetric}>
                  <SelectTrigger id="target-metric" className="mt-1.5">
                    <SelectValue placeholder="지표를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockMetrics.map(metric => {
                      const koreanNames: Record<string, string> = {
                        'faithfulness': '충실성',
                        'answer_relevancy': '답변 관련성',
                        'context_precision': '컨텍스트 정밀도',
                        'context_recall': '컨텍스트 재현율',
                        'answer_correctness': '답변 정확성',
                        'context_entity_recall': '컨텍스트 엔티티 재현율',
                        'answer_similarity': '답변 유사도',
                        'context_relevancy': '컨텍스트 관련성',
                        'hallucination': '환각 현상',
                        'toxicity': '유해성',
                        'bias': '편향성',
                        'coherence': '일관성',
                        'harmfulness': '유해성',
                        'maliciousness': '악의성',
                        'critique_correctness': '문법적 정확성',
                        'conciseness': '간결성'
                      };
                      const korean = koreanNames[metric.id] || metric.name;
                      return (
                        <SelectItem key={metric.id} value={metric.id}>
                          {metric.name}({korean})
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {targetMetric && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-xs text-green-900">
                    {mockMetrics.find(m => m.id === targetMetric)?.description}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. 실험할 파라미터 선택 */}
      <Card className="border-blue-100 bg-white shadow-sm">
        <CardHeader className="pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <Settings className="h-4 w-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base text-gray-900">3. 실험할 파라미터 선택</CardTitle>
              <CardDescription className="text-xs text-gray-600">
                변경하며 실험할 파라미터를 선택하세요 (복수 선택 가능)
              </CardDescription>
            </div>
            {selectedParamsCount > 0 && (
              <Badge className="bg-purple-100 text-purple-700 border-purple-300 border">
                {selectedParamsCount}개 파라미터 선택됨
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-3">
          <div className="space-y-3">
            {/* 검색 관련 파라미터 */}
            <div>
              <h4 className="text-xs font-medium text-purple-900 mb-2 flex items-center gap-1.5">
                <div className="h-1 w-1 rounded-full bg-purple-500" />
                검색 (Retrieval) 파라미터
              </h4>
              <div className="grid md:grid-cols-2 gap-2">
                {availableParameters
                  .filter(p => p.category === 'retrieval')
                  .map(param => {
                    const selectedOptions = selectedParams[param.id] || [];
                    const isParamSelected = selectedOptions.length > 0;
                    const allSelected = selectedOptions.length === param.options.length;

                    return (
                      <div 
                        key={param.id}
                        className={`rounded-md border transition-all ${
                          isParamSelected
                            ? 'border-purple-300 bg-purple-50'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        {/* 파라미터 헤더 */}
                        <div className="p-2 border-b border-purple-200/50">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center gap-1">
                                    <p className="text-xs font-medium text-gray-900">{param.name}</p>
                                    <HelpCircle className="h-3 w-3 text-gray-400" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p className="text-xs">{param.description}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            {isParamSelected && (
                              <Badge className="bg-purple-200 text-purple-800 h-4 text-[10px] px-1.5">
                                {selectedOptions.length}/{param.options.length}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* 옵션 목록 */}
                        <div className="p-2">
                          <div className="flex items-center justify-between mb-1.5">
                            <p className="text-[10px] text-gray-600">실험할 값:</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 text-[10px] px-2 text-purple-700 hover:text-purple-900 hover:bg-purple-100"
                              onClick={(e) => toggleAllOptions(param.id, e)}
                            >
                              {allSelected ? '전체 해제' : '전체 선택'}
                            </Button>
                          </div>
                          <div className="space-y-1">
                            {param.options.map(option => {
                              const isSelected = selectedOptions.includes(option);
                              return (
                                <div
                                  key={option}
                                  className={`flex items-center gap-1.5 p-1.5 rounded cursor-pointer transition-colors ${
                                    isSelected
                                      ? 'bg-purple-100 hover:bg-purple-200'
                                      : 'hover:bg-gray-100'
                                  }`}
                                  onClick={(e) => toggleOption(param.id, option, e)}
                                >
                                  <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={() => {}}
                                    className="shrink-0 h-3.5 w-3.5"
                                  />
                                  <span className="text-xs text-gray-900">{option}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* 생성 관련 파라미터 */}
            <div>
              <h4 className="text-xs font-medium text-orange-900 mb-2 flex items-center gap-1.5">
                <div className="h-1 w-1 rounded-full bg-orange-500" />
                생성 (Generation) 파라미터
              </h4>
              <div className="grid md:grid-cols-2 gap-2">
                {availableParameters
                  .filter(p => p.category === 'generation')
                  .map(param => {
                    const selectedOptions = selectedParams[param.id] || [];
                    const isParamSelected = selectedOptions.length > 0;
                    const allSelected = selectedOptions.length === param.options.length;

                    return (
                      <div 
                        key={param.id}
                        className={`rounded-md border transition-all ${
                          isParamSelected
                            ? 'border-orange-300 bg-orange-50'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        {/* 파라미터 헤더 */}
                        <div className="p-2 border-b border-orange-200/50">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center gap-1">
                                    <p className="text-xs font-medium text-gray-900">{param.name}</p>
                                    <HelpCircle className="h-3 w-3 text-gray-400" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p className="text-xs">{param.description}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            {isParamSelected && (
                              <Badge className="bg-orange-200 text-orange-800 h-4 text-[10px] px-1.5">
                                {selectedOptions.length}/{param.options.length}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* 옵션 목록 */}
                        <div className="p-2">
                          <div className="flex items-center justify-between mb-1.5">
                            <p className="text-[10px] text-gray-600">실험할 값:</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 text-[10px] px-2 text-orange-700 hover:text-orange-900 hover:bg-orange-100"
                              onClick={(e) => toggleAllOptions(param.id, e)}
                            >
                              {allSelected ? '전체 해제' : '전체 선택'}
                            </Button>
                          </div>
                          <div className="space-y-1">
                            {param.options.map(option => {
                              const isSelected = selectedOptions.includes(option);
                              return (
                                <div
                                  key={option}
                                  className={`flex items-center gap-1.5 p-1.5 rounded cursor-pointer transition-colors ${
                                    isSelected
                                      ? 'bg-orange-100 hover:bg-orange-200'
                                      : 'hover:bg-gray-100'
                                  }`}
                                  onClick={(e) => toggleOption(param.id, option, e)}
                                >
                                  <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={() => {}}
                                    className="shrink-0 h-3.5 w-3.5"
                                  />
                                  <span className="text-xs text-gray-900">{option}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. LLM Judge 근거 생성 설정 */}
      <Card className="border-blue-100 bg-white shadow-sm">
        <CardHeader className="pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                <Brain className="h-4 w-4 text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle className="text-base text-gray-900">4. LLM Judge 근거 생성 설정</CardTitle>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-help">
                          <HelpCircle className="h-4 w-4 text-gray-400" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm" side="bottom">
                        <div className="space-y-2">
                          <p className="text-xs font-medium">✅ 켜야 하는 경우:</p>
                          <ul className="text-xs space-y-1 ml-3 list-disc">
                            <li>낮은 점수의 원인을 자동으로 분석하고 싶을 때</li>
                            <li>AI 기반 개선 제안이 필요할 때</li>
                            <li>근본 원인 파악이 어려울 때</li>
                          </ul>
                          <p className="text-xs font-medium mt-2">⚠️ 끄면 좋은 경우:</p>
                          <ul className="text-xs space-y-1 ml-3 list-disc">
                            <li>LLM API 비용을 절약하고 싶을 때</li>
                            <li>점수만 빠르게 확인하고 싶을 때</li>
                            <li>이미 문제 원인을 알고 있을 때</li>
                            <li>대량 평가로 시간/비용 부담이 클 때</li>
                          </ul>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  {llmJudgeEnabled ? (
                    <Badge className="bg-green-100 text-green-700 border-green-200 border h-5 text-[10px]">
                      상세 분석 모드
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-600 border-gray-200 border h-5 text-[10px]">
                      비용 절감 모드
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs text-gray-600 mt-1">
                  {llmJudgeEnabled 
                    ? "낮은 점수(성능 저하) 케이스의 근본 원인을 LLM이 자동으로 분석하여 개선 방향을 제시합니다 (추가 API 비용 발생)"
                    : "평가 점수만 측정합니다. 근본 원인 분석은 건너뜁니다 (매우 저렴)"
                  }
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-gray-500">
                {llmJudgeEnabled ? 'ON' : 'OFF'}
              </span>
              <Checkbox
                checked={llmJudgeEnabled}
                onCheckedChange={(checked) => setLlmJudgeEnabled(checked as boolean)}
              />
            </div>
          </div>
        </CardHeader>

        {llmJudgeEnabled && (
          <CardContent className="pt-4">
            <div className="space-y-4">
              {/* 프롬프트 전략 개요 */}
              <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-indigo-900">
                        LLM Judge 프롬프트 전략 안내
                      </p>
                      <Badge variant="outline" className="bg-white text-indigo-700 border-indigo-300 text-xs">
                        미리보기
                      </Badge>
                    </div>
                    <div className="bg-white rounded p-3 border border-indigo-200">
                      <p className="text-xs font-medium text-gray-700 mb-1">System Persona (실제 프롬프트에 포함)</p>
                      <p className="text-sm text-indigo-800 italic">
                        "당신은 RAG 파이프라인의 20년 경력 솔루션 아키텍트이자 디버거입니다. 
                        사용자 질문, 검색된 컨텍스트, 생성된 답변을 분석하여 낮은 점수 케이스의 근본 원인(Root Cause)을 
                        가장 논리적이고 정확하게 진단하십시오."
                      </p>
                    </div>
                    <p className="text-xs text-indigo-600">
                      💡 위 페르소나는 모든 버전에 공통으로 포함됩니다. 아래에서 프롬프트 버전을 선택하면 
                      추가적인 진단 로직과 출력 형식이 결정됩니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* 진단 워크플로우 */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label className="text-sm text-gray-700">LLM Judge 진단 워크플로우</Label>
                  <Badge variant="outline" className="border-[#DEDEDE] text-[#666666] text-xs">
                    프로세스 설명
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  LLM Judge가 낮은 점수 케이스를 어떻게 분석하는지 설명합니다 (실제 실행 단계)
                </p>
                <div className="space-y-2">
                  {[
                    { step: '1', title: '1차 분류', desc: 'Retrieval vs Generation 오류 판단' },
                    { step: '2', title: '상세 진단', desc: '근본 원인 분석 (컨텍스트 품질, Hallucination 등)' },
                    { step: '3', title: '개선 조언', desc: '파이프라인 컴포넌트별 구체적인 개선 방안 제시' }
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-3 p-3 bg-white rounded border border-gray-200">
                      <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                        <span className="text-xs font-medium text-indigo-700">{item.step}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.title}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{item.desc}</p>
                      </div>
                      <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 ml-auto mt-1" />
                    </div>
                  ))}
                </div>
              </div>

              {/* 구분선 */}
              <div className="border-t border-gray-300 pt-4 mt-2">
                <p className="text-sm font-semibold text-gray-900 mb-1">⚙️ 실제 설정 선택</p>
                <p className="text-xs text-gray-500">
                  아래에서 프롬프트 버전을 선택하면 자동 개선 실행 시 해당 전략이 적용됩니다
                </p>
              </div>

              {/* 선택한 버전의 출력 형식 표시 */}
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Label className="text-sm text-amber-900">선택된 버전의 출력 형식</Label>
                  <Badge variant="outline" className="bg-white text-amber-700 border-amber-300 text-xs">
                    현재: {llmJudgePromptVersion}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {llmJudgePromptVersion === 'v1.0' && (
                    <>
                      <Badge className="bg-gray-100 text-gray-700 border-gray-300">
                        텍스트 (반구조화)
                      </Badge>
                      <span className="text-xs text-gray-600">
                        자연어 형태의 출력. 파싱 안정성 낮음 (가끔 실패 가능).
                      </span>
                    </>
                  )}
                  {llmJudgePromptVersion === 'v1.1' && (
                    <>
                      <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                        JSON (권장)
                      </Badge>
                      <span className="text-xs text-gray-600">
                        JSON 출력 요청. 대부분 성공하나 가끔 형식 오류 발생 가능 (~95%).
                      </span>
                    </>
                  )}
                  {llmJudgePromptVersion === 'v1.2' && (
                    <>
                      <Badge className="bg-green-100 text-green-700 border-green-300">
                        JSON (강제)
                      </Badge>
                      <span className="text-xs text-gray-600">
                        JSON 모드 강제. 파싱 안정성 100% 보장. 대시보드 자동화 최적.
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* 프롬프트 버전 선택 */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label htmlFor="prompt-version" className="text-sm text-gray-700">프롬프트 버전</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <div className="space-y-1.5">
                          <p className="text-xs font-medium">💰 비용 vs 품질 선택</p>
                          <p className="text-xs text-gray-300">
                            • v1.0: 짧은 프롬프트 = 낮은 비용<br/>
                            • v1.1: 긴 CoT = 높은 정확도, 비용 증가<br/>
                            • v1.2: 안정성 강화 (v1.1과 유사 비용)
                          </p>
                          <p className="text-xs text-green-400 font-medium pt-1 border-t border-gray-600">
                            실무 배포: v1.2 권장
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <div className="flex items-center gap-3">
                  <Select value={llmJudgePromptVersion} onValueChange={setLlmJudgePromptVersion}>
                    <SelectTrigger id="prompt-version" className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="v1.0">
                        <div className="flex items-center gap-2">
                          <span>v1.0 (비용 절감)</span>
                          <Badge variant="outline" className="text-[10px] h-4 bg-emerald-50 text-emerald-700 border-emerald-200">💰 저렴</Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="v1.1">
                        <div className="flex items-center gap-2">
                          <span>v1.1 (정확도 우선)</span>
                          <Badge variant="outline" className="text-[10px] h-4 bg-blue-50 text-blue-700 border-blue-200">🎯 4단계</Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="v1.2">
                        <div className="flex items-center gap-2">
                          <span>v1.2 (안정성 우선)</span>
                          <Badge variant="outline" className="text-[10px] h-4 bg-green-50 text-green-700 border-green-200">⭐ 추천</Badge>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowPromptPreview(!showPromptPreview)}
                          className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          {showPromptPreview ? '숨기기' : '전체 프롬프트 보기'}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="max-w-xs">
                        <p className="text-xs">
                          선택한 버전의 실제 프롬프트 템플릿을 확인할 수 있습니다. 
                          고급 사용자는 이를 참고하여 커스터마이징할 수 있습니다.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* 선택된 버전 설명 */}
                <div className="mt-2 pl-1 flex items-start gap-1.5">
                  <div className="text-xs text-gray-600">
                    {llmJudgePromptVersion === 'v1.0' && (
                      <span>
                        <span className="font-medium text-emerald-700">💰 비용 최소화</span> • 
                        간단한 2단계 진단. 프로토타입 테스트나 대량 처리 시 LLM API 비용 절감.
                      </span>
                    )}
                    {llmJudgePromptVersion === 'v1.1' && (
                      <span>
                        <span className="font-medium text-blue-700">🎯 정확도 극대화</span> • 
                        4단계 CoT로 논리적 분석 강화. 프롬프트 길이 증가로 토큰 비용 약 2~3배 증가.
                      </span>
                    )}
                    {llmJudgePromptVersion === 'v1.2' && (
                      <span>
                        <span className="font-medium text-green-700">⭐ 프로덕션 권장</span> • 
                        JSON 출력 강제로 파싱 안정성 100%. v1.1 수준 비용, 대시보드 자동화 최적.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 프롬프트 미리보기 */}
              {showPromptPreview && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">프롬프트 템플릿 미리보기</p>
                      <Badge variant="outline" className="text-xs">
                        {llmJudgePromptVersion}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-600">
                      {llmJudgePromptVersion === 'v1.0' && '기본 2단계 진단'}
                      {llmJudgePromptVersion === 'v1.1' && '4단계 CoT 강화 버전'}
                      {llmJudgePromptVersion === 'v1.2' && 'JSON 출력 강제 버전'}
                    </div>
                  </div>
                  <Textarea
                    readOnly
                    value={getPromptTemplate(llmJudgePromptVersion)}
                    className="font-mono text-xs h-64 resize-none"
                  />
                  
                  {/* 버전별 주요 차이점 */}
                  <div className="p-3 bg-white rounded border border-gray-300">
                    <p className="text-xs font-medium text-gray-900 mb-2">이 버전의 주요 특징:</p>
                    <ul className="space-y-1 text-xs text-gray-700">
                      {llmJudgePromptVersion === 'v1.0' && (
                        <>
                          <li>✓ 기본적인 진단 프로세스</li>
                          <li>✓ 간단한 Chain-of-Thought</li>
                          <li>✓ JSON 출력 권장 (강제 아님)</li>
                          <li>⚠️ 정확도: 기준선(Baseline)</li>
                        </>
                      )}
                      {llmJudgePromptVersion === 'v1.1' && (
                        <>
                          <li>✓ <strong>4단계 상세 CoT 프로세스</strong> (v1.0 대비 강화)</li>
                          <li>✓ 각 단계별 명확한 판단 근거 요구</li>
                          <li>✓ 컴포넌트별 구체적 개선 방안 제시</li>
                          <li>✓ <strong>진단 정확도 +12% 향상</strong></li>
                          <li>⚠️ JSON 출력 권장 (강제 아님)</li>
                        </>
                      )}
                      {llmJudgePromptVersion === 'v1.2' && (
                        <>
                          <li>✓ <strong>4단계 상세 CoT 프로세스</strong> (v1.1과 동일)</li>
                          <li>✓ <strong>JSON 출력 100% 강제</strong> (파싱 에러 0%)</li>
                          <li>✓ "JSON 외 텍스트 절대 금지" 규칙 명시</li>
                          <li>✓ 대시보드 자동화 및 DB 저장 최적화</li>
                          <li>✓ <strong>프로덕션 배포 권장 버전</strong></li>
                        </>
                      )}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-gray-600">
                      템플릿 길이: {getPromptTemplate(llmJudgePromptVersion).length} 자
                    </p>
                    <Button variant="outline" size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      템플릿 저장
                    </Button>
                  </div>
                </div>
              )}

              {/* 성능 지표 및 추천 사항 */}
              {llmJudgePromptVersion === 'v1.0' && (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-gray-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-gray-900">
                        기본 버전 선택됨
                      </p>
                      <p className="text-xs text-gray-700 mt-1">
                        빠른 테스트에 적합. 프로덕션 배포 시 v1.2 권장.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {llmJudgePromptVersion === 'v1.1' && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-blue-900">
                        진단 정확도 개선 버전 (v1.0 대비)
                      </p>
                      <p className="text-xs text-blue-800 mt-1">
                        4단계 Chain-of-Thought 로직 강화로 더 정확한 근본 원인 분석. 논리적 추론 단계 명시화.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {llmJudgePromptVersion === 'v1.2' && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-green-900">
                        ⭐ 프로덕션 권장 버전 - 출력 안정성 보장
                      </p>
                      <p className="text-xs text-green-800 mt-1">
                        JSON 출력 강제 규칙 적용으로 대시보드 자동화 및 데이터베이스 연동 안정성 극대화. 파싱 에러 방지 설계.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* 예상 실험 정보 및 시작 버튼 */}
      <div className="flex items-center justify-between gap-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-gray-600" />
            <div>
              <p className="text-sm text-gray-900">
                예상 실험 횟수: <span className="font-medium text-blue-600">{estimatedExperiments || 0}회</span>
              </p>
              <p className="text-xs text-gray-600">
                예상 소요 시간: {estimatedExperiments ? `약 ${Math.ceil(estimatedExperiments * 2)}분` : '-'}
              </p>
            </div>
          </div>
        </div>

        <Button 
          onClick={handleStartAutoImprove}
          disabled={!baseEvaluationId || !targetMetric || selectedParamsCount === 0}
          className="bg-blue-600 hover:bg-blue-700 text-white"
          size="lg"
        >
          <Zap className="h-4 w-4 mr-2" />
          자동 개선 시작
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}