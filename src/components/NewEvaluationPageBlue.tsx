import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { 
  Play, 
  Settings, 
  Cpu,
  Database as DatabaseIcon,
  Target,
  Plus,
  FileText,
  Sliders,
  Trash2,
  HelpCircle,
  Info,
  Lightbulb,
  X,
  CheckCircle2,
  Eye,
  Zap,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Scale,
  Crosshair,
  BookOpen,
  DollarSign,
  TrendingUp,
  Shield,
  Clock
} from 'lucide-react';
import { mockDatasets, mockModels, mockVectorDBs, mockMetrics, mockPromptTemplates, defaultRAGHyperparameters } from '../lib/mock-data';
import { Textarea } from './ui/textarea';
import { Slider } from './ui/slider';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Separator } from './ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { toast } from 'sonner@2.0.3';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

interface NewEvaluationPageBlueProps {
  onStartEvaluation: () => void;
  onBack?: () => void;
}

interface SavedConfiguration {
  id: string;
  name: string;
  createdAt: string;
  dataset: string;
  model: string;
  vectorDB: string;
  metrics: string[];
  promptTemplate: string;
  customPromptEnabled: boolean;
  customPrompt: string;
  ragHyperparameters: {
    top_k: number;
    chunk_size: number;
    chunk_overlap: number;
    retriever_type: 'semantic' | 'hybrid' | 'keyword';
    similarity_threshold: number;
  };
}

export function NewEvaluationPageBlue({ onStartEvaluation, onBack }: NewEvaluationPageBlueProps) {
  // 평가 이름 자동 생성 함수
  const getDefaultEvaluationName = () => {
    const now = new Date();
    const date = now.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '-').replace('.', '');
    const time = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `Internal 모드 ${date} ${time}`;
  };
  
  // 평가 이름 (사용자가 입력하지 않으면 자동 생성)
  const [evaluationName, setEvaluationName] = useState('');
  
  // Quick Start 가이드 배너 state
  const [showQuickStart, setShowQuickStart] = useState(true);
  
  // 1. 데이터셋은 선택할 수 있도록 그대로 둠
  const [selectedDataset, setSelectedDataset] = useState('');
  
  // 2. LLM 모델은 첫 번째 항목이 기본 선택
  const [selectedModel, setSelectedModel] = useState(
    mockModels.length > 0 ? mockModels[0].id : ''
  );
  
  // 3. Vector DB는 연결된 첫 번째 항목이 기본 선택
  const connectedVectorDBs = mockVectorDBs.filter(db => db.status === 'connected');
  const [selectedVectorDB, setSelectedVectorDB] = useState(
    connectedVectorDBs.length > 0 ? connectedVectorDBs[0].id : ''
  );
  
  // 4. 평가 지표는 필수 지표만 기본 선택 (6개)
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(
    mockMetrics
      .filter(metric => metric.category === 'required')
      .map(metric => metric.id)
  );
  const [isCustomMetricDialogOpen, setIsCustomMetricDialogOpen] = useState(false);
  const [maxRetries, setMaxRetries] = useState('3');
  const [decimalPlaces, setDecimalPlaces] = useState('2');
  const [errorCaseCount, setErrorCaseCount] = useState('10');
  
  // LLM Judge 샘플링 설정 (V1.0)
  const [llmJudgeSamplingEnabled, setLlmJudgeSamplingEnabled] = useState(true);
  const [llmJudgePreset, setLlmJudgePreset] = useState<'fast' | 'balanced' | 'precise'>('balanced');
  const [llmJudgeSamplingMode, setLlmJudgeSamplingMode] = useState<'auto' | 'fixed_ratio' | 'max_cases'>('auto');
  const [llmJudgeFixedRatio, setLlmJudgeFixedRatio] = useState(20); // 20%
  const [llmJudgeMaxCases, setLlmJudgeMaxCases] = useState(100);
  const [showAdvancedDiagnosis, setShowAdvancedDiagnosis] = useState(false);
  
  // Dialog state
  const [showModeGuideDialog, setShowModeGuideDialog] = useState(false);
  const [showDetailGuideDialog, setShowDetailGuideDialog] = useState(false);
  
  // LLM Judge 휴리스틱 설정
  const [llmJudgeEnableHeuristics, setLlmJudgeEnableHeuristics] = useState(true);
  const [llmJudgeScoreThreshold, setLlmJudgeScoreThreshold] = useState(0.3);
  const [llmJudgeContextThreshold, setLlmJudgeContextThreshold] = useState(0.2);
  const [llmJudgeMinTokens, setLlmJudgeMinTokens] = useState(50);
  
  // RAG 설정
  const [ragSystemPrompt, setRagSystemPrompt] = useState('');
  const [selectedPromptTemplate, setSelectedPromptTemplate] = useState('');
  const [topK, setTopK] = useState([defaultRAGHyperparameters.top_k]);
  const [chunkSize, setChunkSize] = useState(defaultRAGHyperparameters.chunk_size.toString());
  const [chunkOverlap, setChunkOverlap] = useState([defaultRAGHyperparameters.chunk_overlap]);
  const [retrieverType, setRetrieverType] = useState<'semantic' | 'hybrid' | 'keyword'>(defaultRAGHyperparameters.retriever_type);
  const [similarityThreshold, setSimilarityThreshold] = useState([defaultRAGHyperparameters.similarity_threshold]);
  
  // 구성 저장/불러오기 관련 state
  const [savedConfigurations, setSavedConfigurations] = useState<SavedConfiguration[]>([]);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [configName, setConfigName] = useState('');
  const [selectedSavedConfig, setSelectedSavedConfig] = useState('');

  // 프롬프트 미리보기 다이얼로그
  const [isPromptPreviewOpen, setIsPromptPreviewOpen] = useState(false);

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
  
  const handlePromptTemplateChange = (templateId: string) => {
    setSelectedPromptTemplate(templateId);
    const template = mockPromptTemplates.find(t => t.id === templateId);
    if (template) {
      setRagSystemPrompt(template.template);
    }
  };

  // 구성 저장
  const handleSaveConfiguration = () => {
    if (!configName.trim()) {
      toast.error('구성 이름을 입력해주세요');
      return;
    }

    const newConfig: SavedConfiguration = {
      id: `config-${Date.now()}`,
      name: configName,
      createdAt: new Date().toISOString(),
      dataset: selectedDataset,
      model: selectedModel,
      vectorDB: selectedVectorDB,
      metrics: selectedMetrics,
      promptTemplate: selectedPromptTemplate,
      customPromptEnabled: false,
      customPrompt: ragSystemPrompt,
      ragHyperparameters: {
        top_k: topK[0],
        chunk_size: parseInt(chunkSize),
        chunk_overlap: chunkOverlap[0],
        retriever_type: retrieverType,
        similarity_threshold: similarityThreshold[0]
      }
    };

    setSavedConfigurations(prev => [...prev, newConfig]);
    setIsSaveDialogOpen(false);
    setConfigName('');
    toast.success(`✅ '${newConfig.name}' 구성이 저장되었습니다`, {
      description: '저장된 구성에서 언제든지 불러올 수 있습니다.'
    });
  };

  // 구성 불러오기
  const handleLoadConfiguration = (configId: string) => {
    const config = savedConfigurations.find(c => c.id === configId);
    if (!config) return;

    setSelectedDataset(config.dataset);
    setSelectedModel(config.model);
    setSelectedVectorDB(config.vectorDB);
    setSelectedMetrics(config.metrics);
    setSelectedPromptTemplate(config.promptTemplate);
    setRagSystemPrompt(config.customPrompt);
    setTopK([config.ragHyperparameters.top_k]);
    setChunkSize(config.ragHyperparameters.chunk_size.toString());
    setChunkOverlap([config.ragHyperparameters.chunk_overlap]);
    setRetrieverType(config.ragHyperparameters.retriever_type);
    setSimilarityThreshold([config.ragHyperparameters.similarity_threshold]);
    setSelectedSavedConfig(configId);

    toast.success(`📋 '${config.name}' 구성을 불러왔습니다`, {
      description: '모든 설정이 자동으로 적용되었습니다.'
    });
  };

  // 구성 삭제
  const handleDeleteConfiguration = (configId: string) => {
    const config = savedConfigurations.find(c => c.id === configId);
    if (!config) return;

    setSavedConfigurations(prev => prev.filter(c => c.id !== configId));
    if (selectedSavedConfig === configId) {
      setSelectedSavedConfig('');
    }
    toast.success(`🗑️ '${config.name}' 구성이 삭제되었습니다`);
  };

  const handleStartEvaluation = async () => {
    if (!selectedDataset || !selectedModel || !selectedVectorDB || selectedMetrics.length === 0) {
      toast.error('모든 필수 항목을 선택해주세요');
      return;
    }
    
    if (!ragSystemPrompt.trim()) {
      toast.error('RAG 시스템 프롬프트를 입력해주세요');
      return;
    }
    
    // API 호출을 위한 요청 데이터 준비
    const evaluationRequest = {
      dataset_id: selectedDataset,
      llm_model_id: selectedModel,
      vector_db_id: selectedVectorDB,
      metrics: selectedMetrics,
      rag_config: {
        system_prompt: ragSystemPrompt,
        top_k: topK[0],
        chunk_size: parseInt(chunkSize),
        chunk_overlap: chunkOverlap[0],
        retriever_type: retrieverType,
        similarity_threshold: similarityThreshold[0]
      },
      // LLM Judge 샘플링 설정
      llm_judge_config: llmJudgeSamplingEnabled ? {
        enabled: true,
        mode: llmJudgeSamplingMode,
        ...(llmJudgeSamplingMode === 'fixed_ratio' && { fixed_ratio: llmJudgeFixedRatio }),
        ...(llmJudgeSamplingMode === 'max_cases' && { max_cases: llmJudgeMaxCases }),
        enable_heuristics: llmJudgeEnableHeuristics,
        heuristic_config: {
          score_threshold: llmJudgeScoreThreshold,
          context_recall_threshold: llmJudgeContextThreshold,
          min_context_tokens: llmJudgeMinTokens
        }
      } : {
        enabled: false
      }
    };
    
    // 즉시 실행
    toast.loading('평가를 시작하는 중...', { id: 'start-evaluation' });
    
    try {
      // TODO: 실제 백엔드 연동 시 아래 주석 해제
      // const response = await api.evaluations.create(evaluationRequest);
      // if (response.success) {
      //   toast.success(`평가가 시작되었습니다! (ID: ${response.data.id})`, { id: 'start-evaluation' });
      //   onStartEvaluation();
      // } else {
      //   toast.error(`평가 시작 실패: ${response.error?.message}`, { id: 'start-evaluation' });
      // }
      
      // Mock 모드: 1초 후 성공
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('평가가 시작되었습니다!', { id: 'start-evaluation' });
      onStartEvaluation();
    } catch (error) {
      console.error('평가 시작 오류:', error);
      toast.error('평가 시작 중 오류가 발생했습니다', { id: 'start-evaluation' });
    }
  };

  // 권장 설정 적용
  const applyRecommendedSettings = (preset: 'quick' | 'standard' | 'precise') => {
    switch (preset) {
      case 'quick':
        setTopK([3]);
        setChunkSize('512');
        setChunkOverlap([50]);
        setRetrieverType('semantic');
        setSimilarityThreshold([0.7]);
        toast.success('⚡ 빠른 테스트 설정이 적용되었습니다');
        break;
      case 'standard':
        setTopK([5]);
        setChunkSize('1024');
        setChunkOverlap([100]);
        setRetrieverType('hybrid');
        setSimilarityThreshold([0.75]);
        toast.success('⭐ 표준 평가 설정이 적용되었습니다 (권장)');
        break;
      case 'precise':
        setTopK([10]);
        setChunkSize('2048');
        setChunkOverlap([200]);
        setRetrieverType('hybrid');
        setSimilarityThreshold([0.8]);
        toast.success('🎯 정밀 평가 설정이 적용되었습니다');
        break;
    }
  };

  // 평가 지표 그룹핑 - 새로운 구조
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

  // 한국어 지표명
  const koreanMetricNames: Record<string, string> = {
    'faithfulness': '충실성',
    'answer_relevancy': '답변 관련성',
    'context_precision': '컨텍스트 정밀도',
    'context_recall': '컨텍스트 재현율',
    'answer_correctness': '답변 정확성',
    'response_completeness': '답변 완전성',
    'hallucination_score': '환각 점수',
    'bias_detection': '편향 감지',
    'noise_sensitivity': '노이즈 민감도',
    'context_relevancy': '컨텍스트 관련성',
    'context_entity_recall': '컨텍스트 엔티티 재현율',
    'answer_similarity': '답변 유사도'
  };

  return (
    <TooltipProvider>
      <div className="space-y-4 max-w-5xl bg-gray-50/30 -m-6 p-6">
        <div>
          {onBack && (
            <Button
              variant="ghost"
              onClick={onBack}
              className="mb-4 text-gray-600 hover:text-purple-600"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              모드 선택으로 돌아가기
            </Button>
          )}
          <h1 className="text-gray-900 font-bold text-[24px]">Internal 모드(RAG 최적 설정 탐색)</h1>
          <p className="text-gray-600 mt-1 text-sm">
            최적의 RAG 설정을 찾기 위한 하이퍼파라미터 튜닝 및 실험
          </p>
        </div>

        {/* Quick Start 가이드 배너 */}
        {showQuickStart && (
          <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Lightbulb className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">
                      Quick Start 가이드
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-blue-100"
                      onClick={() => setShowQuickStart(false)}
                    >
                      <X className="h-4 w-4 text-gray-400" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    평가 실행을 위해 4개 필수 항목을 설정하세요.
                  </p>
                  
                  {/* 필수 설정 - 플로우 레이아웃 */}
                  <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1">
                    <div className="flex items-start gap-2 bg-blue-50/70 p-2 rounded-lg border border-blue-200 min-w-[140px]">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-semibold">
                        1
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 leading-tight">데이터셋</p>
                        <p className="text-xs text-gray-600 mt-0.5 leading-tight">QA 데이터</p>
                      </div>
                    </div>
                    
                    <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    
                    <div className="flex items-start gap-2 bg-purple-50/70 p-2 rounded-lg border border-purple-200 min-w-[140px]">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-semibold">
                        2
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 leading-tight">LLM 모델</p>
                        <p className="text-xs text-gray-600 mt-0.5 leading-tight">답변 생성</p>
                      </div>
                    </div>
                    
                    <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    
                    <div className="flex items-start gap-2 bg-purple-50/70 p-2 rounded-lg border border-purple-200 min-w-[140px]">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-semibold">
                        3
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 leading-tight">VectorDB</p>
                        <p className="text-xs text-gray-600 mt-0.5 leading-tight">문서 검색</p>
                      </div>
                    </div>
                    
                    <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    
                    <div className="flex items-start gap-2 bg-emerald-50/70 p-2 rounded-lg border border-emerald-200 min-w-[140px]">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-semibold">
                        4
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 leading-tight">평가 지표</p>
                        <p className="text-xs text-gray-600 mt-0.5 leading-tight">성능 측정</p>
                      </div>
                    </div>
                  </div>

                  {/* 선택 설정 */}
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-2.5">
                    <p className="text-xs text-gray-600">
                      <span className="font-medium text-gray-700">선택 항목:</span> RAG 파라미터, LLM Judge 샘플링 (기본값 제공)
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 저장된 구성 불러오기 */}
        {savedConfigurations.length > 0 && (
          <Card className="border-blue-200 bg-blue-50/30">
            <CardHeader className="py-3">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-blue-600" />
                <CardTitle className="text-sm text-gray-900">💾 저장된 구성</CardTitle>
                <Badge variant="outline" className="bg-white text-blue-700 border-blue-200 text-xs h-5">
                  {savedConfigurations.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {savedConfigurations.map(config => (
                <div 
                  key={config.id} 
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer hover:shadow-sm ${
                    selectedSavedConfig === config.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <div 
                    className="flex-1 flex items-center gap-3 min-w-0"
                    onClick={() => handleLoadConfiguration(config.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{config.name}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-gray-500 truncate">
                          {mockDatasets.find(d => d.id === config.dataset)?.name || '데이터셋'}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500 truncate">
                          {mockModels.find(m => m.id === config.model)?.name || 'LLM'}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">
                          {config.metrics.length}개 지표
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-gray-400">
                        {new Date(config.createdAt).toLocaleDateString('ko-KR', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 ml-2 hover:bg-red-100 hover:text-red-600 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteConfiguration(config.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

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

        {/* Step 1: Dataset Selection */}
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
                <CardDescription className="text-sm ml-10 text-gray-600">평가에 사용할 QA 데이터셋을 선택하세요</CardDescription>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help">
                    <HelpCircle className="h-4 w-4 text-gray-400 hover:text-blue-600 transition-colors" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm font-medium">QA 데이터셋이란?</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Question(질문)과 Answer(정답)이 쌍을 이루는 데이터입니다. RAG 시스템의 답변을 정답과 비교하여 성능을 평가합니다.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    💡 데이터셋 관리 페이지에서 자동 생성하거나 CSV 파일로 업로드할 수 있습니다.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardHeader>
          <CardContent>
            <Select value={selectedDataset} onValueChange={setSelectedDataset}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="데이터셋을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {mockDatasets.map(dataset => (
                  <SelectItem key={dataset.id} value={dataset.id}>
                    {dataset.name} ({dataset.qaCount} QA)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!selectedDataset && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-800">
                  먼저 평가할 QA 데이터셋을 선택해주세요. 데이터셋이 없다면 "데이터셋 관리" 페이지에서 생성할 수 있습니다.
                </p>
              </div>
            )}
            {selectedDataset && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                {(() => {
                  const dataset = mockDatasets.find(d => d.id === selectedDataset);
                  return dataset ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">QA 개수</span>
                        <span className="text-blue-700 font-medium">{dataset.qaCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">유형</span>
                        <Badge className={`text-xs h-6 ${
                          dataset.type === 'auto-generated' 
                            ? 'bg-violet-100 text-violet-700 border-violet-200 border' 
                            : 'bg-blue-100 text-blue-700 border-blue-200 border'
                        }`}>
                          {dataset.type === 'auto-generated' ? '자동 생성' : '업로드'}
                        </Badge>
                      </div>
                      {dataset.source && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">소스</span>
                          <span className="text-blue-700 text-xs">{dataset.source}</span>
                        </div>
                      )}
                    </div>
                  ) : null;
                })()}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Model & Vector DB Selection */}
        <Card className="border-l-4 border-l-purple-500 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2 text-base text-gray-900">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500 text-white text-sm shrink-0">
                    2
                  </div>
                  LLM 모델 및 Vector DB 선택
                </CardTitle>
                <CardDescription className="text-sm ml-10 text-gray-600">평가에 사용할 LLM 모델과 Vector DB를 선택하세요</CardDescription>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help">
                    <HelpCircle className="h-4 w-4 text-gray-400 hover:text-purple-600 transition-colors" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm font-medium">LLM과 VectorDB의 역할</p>
                  <p className="text-xs text-gray-400 mt-1">
                    <strong>• LLM Judge:</strong> 평가 지표를 측정하는데 사용됩니다 (GPT-4, Claude 등)
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    <strong>• VectorDB:</strong> RAG 시스템이 컨텍스트를 검색하는 데이터베이스입니다
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm text-gray-700">
                <Cpu className="h-4 w-4" />
                LLM 모델 (Judge)
              </Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="LLM 모델을 선택하세요" />
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

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm text-gray-700">
                <DatabaseIcon className="h-4 w-4" />
                Vector DB
              </Label>
              <Select value={selectedVectorDB} onValueChange={setSelectedVectorDB}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Vector DB를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {mockVectorDBs.filter(db => db.status === 'connected').map(db => (
                    <SelectItem key={db.id} value={db.id}>
                      {db.name} ({db.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Step 2.5: RAG System Configuration */}
        <Card className="border-l-4 border-l-indigo-500 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2 text-base text-gray-900">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500 text-white text-sm shrink-0">
                    <FileText className="h-4 w-4" />
                  </div>
                  RAG 시스템 프롬프트 설정
                </CardTitle>
                <CardDescription className="text-sm ml-10 text-gray-600">
                  RAG 파이프라인이 답변 생성에 사용할 시스템 프롬프트를 작성하세요
                </CardDescription>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help">
                    <HelpCircle className="h-4 w-4 text-gray-400 hover:text-indigo-600 transition-colors" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm font-medium">시스템 프롬프트란?</p>
                  <p className="text-xs text-gray-400 mt-1">
                    RAG 시스템이 검색된 컨텍스트와 질문을 조합하여 답변을 생성할 때 사용하는 지시문입니다.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    <strong>{'{context}'}</strong>와 <strong>{'{question}'}</strong> 변수는 필수로 포함되어야 합니다.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 프롬프트 템플릿 선택 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-sm text-gray-700">
                  <FileText className="h-4 w-4" />
                  프롬프트 템플릿
                </Label>
                {selectedPromptTemplate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={() => setIsPromptPreviewOpen(true)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    미리보기
                  </Button>
                )}
              </div>
              <Select value={selectedPromptTemplate} onValueChange={handlePromptTemplateChange}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="템플릿을 선택하거나 직접 작성하세요" />
                </SelectTrigger>
                <SelectContent>
                  {mockPromptTemplates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{template.name}</span>
                        <span className="text-xs text-gray-500">{template.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 프롬프트 입력 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-gray-700">시스템 프롬프트 *</Label>
                <span className="text-xs text-gray-500">{ragSystemPrompt.length} 자</span>
              </div>
              <Textarea
                value={ragSystemPrompt}
                onChange={(e) => setRagSystemPrompt(e.target.value)}
                placeholder="RAG 시스템이 사용할 프롬프트를 입력하세요. {context}와 {question} 변수를 포함해야 합니다."
                className="h-[180px] font-mono text-sm resize-none"
              />
              {ragSystemPrompt && (!ragSystemPrompt.includes('{context}') || !ragSystemPrompt.includes('{question}')) && (
                <div className="flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded">
                  <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-800">
                    프롬프트에 <code className="bg-amber-100 px-1 rounded">{'{context}'}</code>와 <code className="bg-amber-100 px-1 rounded">{'{question}'}</code> 변수가 포함되어야 합니다.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Step 2.6: RAG Hyperparameters */}
        <Card className="border-l-4 border-l-cyan-500 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2 text-base text-gray-900">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-500 text-white text-sm shrink-0">
                    <Sliders className="h-4 w-4" />
                  </div>
                  RAG 하이퍼파라미터 설정
                </CardTitle>
                <CardDescription className="text-sm ml-10 text-gray-600">
                  검색(Retrieval) 성능에 영향을 주는 주요 파라미터를 설정하세요
                </CardDescription>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help">
                    <HelpCircle className="h-4 w-4 text-gray-400 hover:text-cyan-600 transition-colors" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm font-medium">하이퍼파라미터란?</p>
                  <p className="text-xs text-gray-400 mt-1">
                    RAG 시스템의 검색 성능을 조정하는 설정값들입니다. 각 파라미터는 정확도, 속도, 비용에 영향을 줍니다.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    💡 아래 "권장 설정"을 사용하면 빠르게 시작할 수 있습니다.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* 권장 설정 버튼 */}
            <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-cyan-200">
              <Zap className="h-4 w-4 text-cyan-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">권장 설정 빠르게 적용</p>
                <p className="text-xs text-gray-600 mt-0.5">사용 사례에 맞는 최적화된 설정을 한 번에 적용합니다</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs border-gray-300 hover:bg-white"
                  onClick={() => applyRecommendedSettings('quick')}
                >
                  ⚡ 빠른 테스트
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs border-cyan-300 bg-cyan-50 hover:bg-cyan-100 text-cyan-700"
                  onClick={() => applyRecommendedSettings('standard')}
                >
                  ⭐ 표준 평가
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs border-gray-300 hover:bg-white"
                  onClick={() => applyRecommendedSettings('precise')}
                >
                  🎯 정밀 평가
                </Button>
              </div>
            </div>

            {/* Top-K */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label className="text-sm text-gray-700">Top-K (검색 결과 개수)</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help">
                        <HelpCircle className="h-3.5 w-3.5 text-gray-400 hover:text-cyan-600 transition-colors" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs font-medium">Top-K의 영향</p>
                      <p className="text-xs text-gray-400 mt-1">
                        <strong>높을수록:</strong> 더 많은 컨텍스트 확보 → 정확도↑, 비용↑, 속도↓
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        <strong>낮을수록:</strong> 빠른 응답 → 정확도↓, 비용↓, 속도↑
                      </p>
                      <p className="text-xs text-cyan-600 mt-1">💡 권장: 3-5개 (일반 용도)</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Badge className="bg-blue-100 text-blue-700 border-blue-200 border">{topK[0]}</Badge>
              </div>
              <Slider
                value={topK}
                onValueChange={setTopK}
                min={1}
                max={20}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-gray-500">검색 시 가져올 문서의 개수를 설정합니다 (1-20)</p>
            </div>

            {/* Chunk Size */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-sm text-gray-700">Chunk Size (청크 크기)</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      <HelpCircle className="h-3.5 w-3.5 text-gray-400 hover:text-cyan-600 transition-colors" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs font-medium">Chunk Size의 영향</p>
                    <p className="text-xs text-gray-400 mt-1">
                      <strong>작을수록 (256-512):</strong> 세밀한 검색, 구체적 정보 추출에 유리
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      <strong>클수록 (1024-2048):</strong> 문맥 파악, 전체적인 이해에 유리
                    </p>
                    <p className="text-xs text-cyan-600 mt-1">💡 권장: 512-1024 tokens</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                type="number"
                value={chunkSize}
                onChange={(e) => setChunkSize(e.target.value)}
                min={128}
                max={2048}
                step={64}
                className="h-10"
              />
              <p className="text-xs text-gray-500">문서를 나눌 청크의 크기를 설정합니다 (128-2048 tokens)</p>
            </div>

            {/* Chunk Overlap */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label className="text-sm text-gray-700">Chunk Overlap (청크 오버랩)</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help">
                        <HelpCircle className="h-3.5 w-3.5 text-gray-400 hover:text-cyan-600 transition-colors" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs font-medium">Chunk Overlap의 영향</p>
                      <p className="text-xs text-gray-400 mt-1">
                        <strong>많을수록:</strong> 청크 간 정보 연속성↑, 중복 위험↑
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        <strong>적을수록:</strong> 저장 공간 효율↑, 맥락 손실 위험↑
                      </p>
                      <p className="text-xs text-cyan-600 mt-1">💡 권장: Chunk Size의 10-20%</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Badge className="bg-purple-100 text-purple-700 border-purple-200 border">{chunkOverlap[0]}</Badge>
              </div>
              <Slider
                value={chunkOverlap}
                onValueChange={setChunkOverlap}
                min={0}
                max={200}
                step={10}
                className="w-full"
              />
              <p className="text-xs text-gray-500">청크 간 중복되는 토큰 수를 설정합니다 (0-200)</p>
            </div>

            {/* Retriever Type */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-sm text-gray-700">Retriever Type (검색 알고리즘)</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      <HelpCircle className="h-3.5 w-3.5 text-gray-400 hover:text-cyan-600 transition-colors" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs font-medium">검색 알고리즘 비교</p>
                    <p className="text-xs text-gray-400 mt-1">
                      <strong>Semantic:</strong> 의미 기반, 유사 개념 검색에 강함
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      <strong>Hybrid:</strong> 의미+키워드 조합, 가장 균형잡힌 성능
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      <strong>Keyword:</strong> 정확한 단어 매칭, 전문 용어 검색에 유리
                    </p>
                    <p className="text-xs text-cyan-600 mt-1">💡 권장: Hybrid (대부분의 경우)</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select value={retrieverType} onValueChange={(value: 'semantic' | 'hybrid' | 'keyword') => setRetrieverType(value)}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semantic">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Semantic (의미 기반)</span>
                      <span className="text-xs text-gray-500">벡터 유사도 검색</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="hybrid">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Hybrid (하이브리드) ⭐</span>
                      <span className="text-xs text-gray-500">벡터 + 키워드 검색 (권장)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="keyword">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Keyword (키워드)</span>
                      <span className="text-xs text-gray-500">BM25 기반 검색</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Similarity Threshold */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label className="text-sm text-gray-700">Similarity Threshold (유사도 임계값)</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help">
                        <HelpCircle className="h-3.5 w-3.5 text-gray-400 hover:text-cyan-600 transition-colors" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs font-medium">유사도 임계값의 영향</p>
                      <p className="text-xs text-gray-400 mt-1">
                        <strong>높을수록 (0.8-1.0):</strong> 정밀도↑, 재현율↓ (엄격한 필터링)
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        <strong>낮을수록 (0.5-0.7):</strong> 정밀도↓, 재현율↑ (관대한 필터링)
                      </p>
                      <p className="text-xs text-cyan-600 mt-1">💡 권장: 0.7-0.8 (균형잡힌 설정)</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Badge className="bg-green-100 text-green-700 border-green-200 border">{similarityThreshold[0].toFixed(2)}</Badge>
              </div>
              <Slider
                value={similarityThreshold}
                onValueChange={setSimilarityThreshold}
                min={0}
                max={1}
                step={0.05}
                className="w-full"
              />
              <p className="text-xs text-gray-500">검색 결과로 포함할 최소 유사도 점수 (0.0-1.0)</p>
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Metrics Selection */}
        <Card className="border-l-4 border-l-emerald-500 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <CardTitle className="flex items-center gap-2 text-base text-gray-900">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500 text-white text-sm shrink-0">
                      3
                    </div>
                    평가 지표 선택
                  </CardTitle>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help">
                        <HelpCircle className="h-4 w-4 text-gray-400 hover:text-emerald-600 transition-colors" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-sm font-medium">평가 지표란?</p>
                      <p className="text-xs text-gray-400 mt-1">
                        RAG 시스템의 성능을 다양한 관점에서 측정하는 기준입니다. 각 지표는 LLM Judge가 자동으로 평가합니다.
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        💡 최소 1개 이상 선택해야 하며, 여러 지표를 선택하면 종합적인 평가가 가능합니다.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <CardDescription className="text-sm ml-10 text-gray-600">측정할 RAG 성능 지표를 선택하세요</CardDescription>
              </div>
              <Dialog open={isCustomMetricDialogOpen} onOpenChange={setIsCustomMetricDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 text-sm shrink-0 border-blue-200 text-blue-600 hover:bg-blue-50">
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    커스텀 지표
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-lg text-gray-900">커스텀 평가 지표 생성</DialogTitle>
                    <DialogDescription className="text-sm text-gray-600">
                      새로운 평가 지표를 정의하고 LLM이 사용할 평가 프롬프트를 작성하세요
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="metric-name" className="text-sm">지표 이름</Label>
                      <Input id="metric-name" placeholder="예: 톤앤매너 일관성" className="h-10" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="metric-desc" className="text-sm">설명</Label>
                      <Input id="metric-desc" placeholder="이 지표가 측정하는 내용" className="h-10" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="metric-prompt" className="text-sm">평가 프롬프트</Label>
                      <textarea 
                        id="metric-prompt"
                        className="w-full min-h-[120px] p-3 border border-gray-300 rounded-md bg-gray-50 whitespace-normal break-words text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="LLM이 이 지표를 평가하기 위해 사용할 프롬프트를 입력하세요"
                      />
                    </div>
                    <Button className="w-full h-10 bg-blue-600 hover:bg-blue-700">지표 추가</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
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
                  <span className="font-semibold text-gray-900">
                    {selectedMetrics.length}개 (필수 {selectedMetrics.filter(id => metricGroups.required.metrics.includes(id)).length} + 선택 {selectedMetrics.filter(id => metricGroups.optional.metrics.includes(id)).length})
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-700">예상 실행 시간:</span>
                  <span className="font-semibold text-gray-900">
                    약 {Math.round(5 + selectedMetrics.length * 0.8)}-{Math.round(7 + selectedMetrics.length * 1.2)}분
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 4: Evaluation Settings */}
        <Card className="border-l-4 border-l-amber-500 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2 text-base text-gray-900">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500 text-white text-sm shrink-0">
                    4
                  </div>
                  평가 실행 설정
                </CardTitle>
                <CardDescription className="text-sm ml-10 text-gray-600">평가 실행 시 적용될 상세 옵션을 설정하세요</CardDescription>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help">
                    <HelpCircle className="h-4 w-4 text-gray-400 hover:text-amber-600 transition-colors" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm font-medium">평가 실행 옵션</p>
                  <p className="text-xs text-gray-400 mt-1">
                    API 오류 처리, 결과 표시 형식, 오류 분석 범위 등을 세밀하게 조정할 수 있습니다.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    💡 기본값으로도 충분하지만, 대량 평가 시에는 조정이 필요할 수 있습니다.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="max-retries" className="text-sm text-gray-700">최대 반복 횟수</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help">
                        <HelpCircle className="h-3 w-3 text-gray-400 hover:text-amber-600 transition-colors" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs">LLM API 호출 실패 시 재시도할 횟수입니다. 네트워크 불안정 시 유용합니다.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input 
                  id="max-retries"
                  type="number"
                  min="1"
                  max="10"
                  value={maxRetries}
                  onChange={(e) => setMaxRetries(e.target.value)}
                  placeholder="3"
                  className="h-10"
                />
                <p className="text-gray-600 text-xs">API 오류 시 재시도 횟수</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="decimal-places" className="text-sm text-gray-700">결과 소수점</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help">
                        <HelpCircle className="h-3 w-3 text-gray-400 hover:text-amber-600 transition-colors" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs">평가 점수를 표시할 때 소수점 몇 자리까지 보여줄지 설정합니다.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input 
                  id="decimal-places"
                  type="number"
                  min="1"
                  max="4"
                  value={decimalPlaces}
                  onChange={(e) => setDecimalPlaces(e.target.value)}
                  placeholder="2"
                  className="h-10"
                />
                <p className="text-gray-600 text-xs">점수 표시 소수점 자릿수</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="error-case-count" className="text-sm text-gray-700">분석할 오류 항목 개수</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help">
                        <HelpCircle className="h-3 w-3 text-gray-400 hover:text-amber-600 transition-colors" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs">낮은 점수를 받은 케이스 중 상세하게 분석할 케이스 수입니다. 너무 많으면 분석 시간이 오래 걸립니다.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input 
                  id="error-case-count"
                  type="number"
                  min="1"
                  max="100"
                  value={errorCaseCount}
                  onChange={(e) => setErrorCaseCount(e.target.value)}
                  placeholder="10"
                  className="h-10"
                />
                <p className="text-gray-600 text-xs">상세 분석할 실패 케이스 수</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 5: LLM Judge Analysis Settings */}
        <Card className="border-l-4 border-l-purple-500 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2 text-base text-gray-900">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500 text-white text-sm shrink-0">
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
                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
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
                ? 'bg-purple-50 border-purple-200' 
                : 'bg-gray-50 border-gray-200'
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
                      <Lightbulb className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        어떤 모드를 선택해야 할지 모르겠나요?
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowModeGuideDialog(true)}
                      className="border-gray-300 text-gray-600 hover:bg-gray-50"
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
                        ? 'border-purple-500 bg-purple-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                    onClick={() => handlePresetChange('fast')}
                  >
                    <div className="text-center space-y-2">
                      <div className="flex justify-center">
                        <div className={`p-2 rounded-full ${
                          llmJudgePreset === 'fast' ? 'bg-purple-100' : 'bg-gray-100'
                        }`}>
                          <Zap className={`h-5 w-5 ${
                            llmJudgePreset === 'fast' ? 'text-purple-600' : 'text-gray-600'
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
                        ? 'border-purple-500 bg-purple-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                    onClick={() => handlePresetChange('balanced')}
                  >
                    <div className="text-center space-y-2">
                      <div className="flex justify-center">
                        <div className={`p-2 rounded-full ${
                          llmJudgePreset === 'balanced' ? 'bg-purple-100' : 'bg-gray-100'
                        }`}>
                          <Scale className={`h-5 w-5 ${
                            llmJudgePreset === 'balanced' ? 'text-purple-600' : 'text-gray-600'
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
                        ? 'border-purple-500 bg-purple-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                    onClick={() => handlePresetChange('precise')}
                  >
                    <div className="text-center space-y-2">
                      <div className="flex justify-center">
                        <div className={`p-2 rounded-full ${
                          llmJudgePreset === 'precise' ? 'bg-purple-100' : 'bg-gray-100'
                        }`}>
                          <Crosshair className={`h-5 w-5 ${
                            llmJudgePreset === 'precise' ? 'text-purple-600' : 'text-gray-600'
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
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <div className="flex items-start gap-3">
                    <Info className="h-4 w-4 text-purple-600 mt-0.5 shrink-0" />
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-medium text-purple-900">
                        {llmJudgePreset === 'fast' ? '⚡ 빠른 분석' : 
                         llmJudgePreset === 'balanced' ? '⚖️ 균형 분석' : 
                         '🎯 정밀 분석'} 모드 선택됨
                      </p>
                      <p className="text-xs text-purple-700">
                        {llmJudgePreset === 'fast' && '대부분의 실패 원인을 빠르게 파악합니다. 일상적인 실험에 적합합니다.'}
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

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleStartEvaluation}
            disabled={!selectedDataset || !selectedModel || !selectedVectorDB || selectedMetrics.length === 0}
          >
            <Play className="h-4 w-4 mr-2" />
            평가 시작하기
          </Button>
          <Button 
            variant="outline" 
            className="h-11 border-blue-200 text-blue-600 hover:bg-blue-50"
            onClick={() => setIsSaveDialogOpen(true)}
            disabled={!selectedDataset || !selectedModel || !selectedVectorDB || selectedMetrics.length === 0}
          >
            <Settings className="h-4 w-4 mr-2" />
            구성 저장
          </Button>
        </div>

        {/* 구성 저장 다이얼로그 */}
        <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>평가 구성 저장</DialogTitle>
              <DialogDescription>
                현재 설정을 저장하여 나중에 빠르게 불러올 수 있습니다
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="config-name">구성 이름 *</Label>
                <Input
                  id="config-name"
                  placeholder="예: 고객지원 평가 v1"
                  value={configName}
                  onChange={(e) => setConfigName(e.target.value)}
                  className="h-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)} className="flex-1">
                취소
              </Button>
              <Button onClick={handleSaveConfiguration} className="flex-1 bg-blue-600 hover:bg-blue-700">
                저장
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* 프롬프트 미리보기 다이얼로그 */}
        <Dialog open={isPromptPreviewOpen} onOpenChange={setIsPromptPreviewOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-600" />
                프롬프트 미리보기
              </DialogTitle>
              <DialogDescription>
                {mockPromptTemplates.find(t => t.id === selectedPromptTemplate)?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
                <pre className="text-sm whitespace-pre-wrap font-mono text-gray-700">
                  {ragSystemPrompt}
                </pre>
              </div>
              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 text-xs text-blue-800">
                  <p className="font-medium mb-1">변수 설명:</p>
                  <p><code className="bg-blue-100 px-1 rounded">{'{context}'}</code> - Vector DB에서 검색된 관련 문서 조각들</p>
                  <p className="mt-1"><code className="bg-blue-100 px-1 rounded">{'{question}'}</code> - 사용자가 입력한 질문</p>
                </div>
              </div>
            </div>
            <Button onClick={() => setIsPromptPreviewOpen(false)} className="w-full">
              닫기
            </Button>
          </DialogContent>
        </Dialog>

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
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                    <Zap className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900">⚡ 빠른 분석</h4>
                      <Badge className="bg-green-100 text-green-700 border-green-200">권장</Badge>
                    </div>
                    <p className="text-sm text-gray-700">일상적인 실험에 최적화된 모드입니다.</p>
                    <div className="space-y-1 text-xs text-gray-600">
                      <p>✅ 대부분의 실패 패턴을 빠르게 파악</p>
                      <p>✅ 최소 비용으로 주요 이슈 발견</p>
                      <p>✅ 매일 실행하기에 적합</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg shrink-0">
                    <Scale className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900">⚖️ 균형 분석</h4>
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200">추천</Badge>
                    </div>
                    <p className="text-sm text-gray-700">비용과 정확도의 최적 균형을 제공하는 모드입니다.</p>
                  </div>
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg shrink-0">
                    <Crosshair className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900">🎯 정밀 분석</h4>
                      <Badge className="bg-red-100 text-red-700 border-red-200">고비용</Badge>
                    </div>
                    <p className="text-sm text-gray-700">모든 실패 케이스를 상세히 분석하는 완전 분석 모드입니다.</p>
                  </div>
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
                <BookOpen className="h-5 w-5 text-purple-500" />
                AI 분석 상세 가이드
              </DialogTitle>
              <DialogDescription>
                LLM Judge 기반 진단의 동작 원리와 비용 최적화 전략
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 mt-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4 text-purple-600" />
                  평가 프로세스
                </h3>
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-500 text-white text-xs shrink-0 mt-0.5">
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
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-500 text-white text-xs shrink-0 mt-0.5">
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
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-500 text-white text-xs shrink-0 mt-0.5">
                        3
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">LLM Judge 분석</p>
                        <p className="text-xs text-gray-600 mt-1">
                          GPT-4가 각 실패 케이스의 근본 원인을 분석하고 개선 방향 제시
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-amber-900">💡 Pro Tips</p>
                    <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
                      <li>일상적인 실험은 "빠른 모드"로 설정하고 매일 실행</li>
                      <li>중요한 업데이트 후에는 "정밀 모드"로 완전 검증</li>
                      <li>고급 설정에서 샘플링 비율을 조정하여 비용 최적화 가능</li>
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
