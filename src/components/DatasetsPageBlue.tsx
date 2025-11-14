import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { 
  Plus, 
  Upload, 
  FileText, 
  Calendar,
  Eye,
  Trash2,
  Sparkles,
  Edit2,
  MessageSquare,
  Database,
  Check,
  X,
  Info,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Download,
  TrendingUp,
  Loader2,
  CheckCircle,
  FileCheck,
  Zap
} from 'lucide-react';
import { mockDatasets } from '../lib/mock-data';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { Dataset } from '../types';
import { toast } from 'sonner@2.0.3';

export function DatasetsPageBlue() {
  const [datasets, setDatasets] = useState(mockDatasets);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [renameDatasetId, setRenameDatasetId] = useState<string>('');
  const [newDatasetName, setNewDatasetName] = useState('');
  const [showHelpBanner, setShowHelpBanner] = useState(true);
  
  // 검색 및 필터
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'auto-generated' | 'uploaded'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'qaCount'>('date');
  
  // QA 편집 상태
  const [editingQaId, setEditingQaId] = useState<string | null>(null);
  const [editedQuestion, setEditedQuestion] = useState('');
  const [editedAnswer, setEditedAnswer] = useState('');
  
  // QA 상세보기 검색 및 페이지네이션
  const [qaSearchQuery, setQaSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // 파일 선택 Refs
  const autoGenFileInputRef = useRef<HTMLInputElement>(null);
  const uploadFileInputRef = useRef<HTMLInputElement>(null);
  
  // 위자드 단계 관리
  const [autoGenStep, setAutoGenStep] = useState(1);
  const [uploadStep, setUploadStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // 드래그 앤 드롭 상태
  const [isDragging, setIsDragging] = useState(false);
  const [isUploadDragging, setIsUploadDragging] = useState(false);
  
  // 생성/업로드 진행 상태
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<'parsing' | 'generating' | 'validating' | 'complete'>('parsing');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [generatedQAs, setGeneratedQAs] = useState<Array<{id: string; question: string; answer: string}>>([]);
  const [createdDatasetName, setCreatedDatasetName] = useState('');
  
  // 데이터 보강 옵션 (업로드 탭)
  const [enhancementType, setEnhancementType] = useState<string>('none');
  const [enhancementPrompt, setEnhancementPrompt] = useState<string>('');
  
  // QA 자동 생성 옵션 (자동 생성 탭)
  const [selectedDomain, setSelectedDomain] = useState<string>('general');
  const [promptTemplate, setPromptTemplate] = useState<string>('default');
  const [customPrompt, setCustomPrompt] = useState<string>('');

  // 보강 옵션별 기본 프롬프트 템플릿
  const enhancementPromptTemplates: Record<string, string> = {
    'none': '',
    'expand-answers': `다음 답변을 더 상세하고 전문적으로 확장하세요.

질문: {question}
기존 답변: {answer}

요구사항:
- 핵심 내용은 유지하되 더 자세한 설명 추가
- 관련 예시나 배경 정보 포함
- 전문적이고 명확한 문체 유지

확장된 답변:`,
    'rephrase-questions': `다음 질문을 더 명확하고 구체적으로 재구성하세요.

원래 질문: {question}

요구사항:
- 질문의 의도를 유지하되 더 명확하게 표현
- 애매한 표현 제거
- 필요시 맥락 정보 추가

재구성된 질문:`,
    'add-variations': `다음 질문에 대해 의미가 유사한 변형 질문 3개를 생성하세요.

원래 질문: {question}
답변: {answer}

요구사항:
- 같은 답변을 얻을 수 있는 다른 표현 방식
- 형식적/비형식적 톤 변형
- 다양한 질문 구조 사용

변형 질문들:
1.
2.
3.`,
    'full': `다음 QA 쌍을 전체적으로 보강하세요.

질문: {question}
답변: {answer}

작업:
1. 질문을 더 명확하게 재구성
2. 답변을 상세하게 확장
3. 유사한 변형 질문 2개 생성

결과 (JSON 형식):
{
  "improved_question": "...",
  "expanded_answer": "...",
  "variations": ["...", "..."]
}`
  };

  // 보강 옵션 변경 핸들러 (업로드 탭)
  const handleEnhancementTypeChange = (value: string) => {
    setEnhancementType(value);
    setEnhancementPrompt(enhancementPromptTemplates[value] || '');
  };

  // QA 자동 생성 프롬프트 템플릿 (자동 생성 탭)
  const qaGenerationPromptTemplates: Record<string, Record<string, string>> = {
    default: {
      general: `다음 문서를 읽고 고객이 자주 물어볼 만한 질문과 정확한 답변을 생성하세요.

문서 내용:
{document}

요구사항:
- 질문은 명확하고 구체적이어야 합니다
- 답변은 문서 내용에 충실하고 완전해야 합니다
- 고객 지원 시나리오를 고려하세요
- 각 질문-답변 쌍은 독립적으로 이해 가능해야 합니다`,
      technical: `다음 기술 문서를 기반으로 개발자가 궁금해할 만한 질문과 답변을 생성하세요.

문서 내용:
{document}

요구사항:
- 기술적으로 정확한 질문과 답변 생성
- API, 설정, 트러블슈팅 등을 포함
- 코드 예시가 있다면 관련 질문 포함
- 전문 용어를 적절히 사용`,
      medical: `다음 의료 정보를 기반으로 환자나 의료진이 물어볼 만한 질문과 답변을 생성하세요.

문서 내용:
{document}

요구사항:
- 의학적으로 정확하고 신중한 답변
- 일반인도 이해하기 쉽게 설명
- 주의사항이나 면책사항 포함
- 전문 의료 용어에 대한 설명 추가`,
      legal: `다음 법률 문서를 기반으로 일반인이나 법률 전문가가 물어볼 만한 질문과 답변을 생성하세요.

문서 내용:
{document}

요구사항:
- 법적으로 정확한 답변 제공
- 복잡한 법률 용어를 쉽게 설명
- 관련 조항이나 근거 명시
- 일반적인 오해나 주의사항 포함`,
      finance: `다음 금융 정보를 기반으로 투자자나 고객이 물어볼 만한 질문과 답변을 생성하세요.

문서 내용:
{document}

요구사항:
- 금융 상품, 투자 전략, 리스크에 대한 질문
- 정확한 수치와 조건 명시
- 면책사항 포함
- 일반인도 이해 가능한 설명`,
      education: `다음 학습 자료를 기반으로 학생이나 교육자가 물어볼 만한 질문과 답변을 생성하세요.

문서 내용:
{document}

요구사항:
- 학습 목표와 연계된 질문
- 단계적이고 명확한 설명
- 예시와 비유 활용
- 이해도를 확인할 수 있는 질문 포함`,
      ecommerce: `다음 제품 정보를 기반으로 고객이 물어볼 만한 질문과 답변을 생성하세요.

문서 내용:
{document}

요구사항:
- 제품 사양, 사용법, 배송/반품 등 포함
- 구매 결정에 도움이 되는 정보 제공
- 자주 묻는 질문(FAQ) 형식
- 친근하고 설득력 있는 톤`,
      custom: ''
    },
    factual: {
      general: `문서에서 사실적 정보를 추출하여 "무엇", "누가", "언제", "어디서" 형태의 질문과 답변을 생성하세요.

문서 내용:
{document}

요구사항:
- 검증 가능한 사실에 기반
- 명확한 근거가 있는 답변만 생성
- 추측이나 해석 배제
- 정확한 날짜, 수치, 이름 등 포함`
    },
    reasoning: {
      general: `문서 내용을 기반으로 "왜", "어떻게" 형태의 추론 및 분석 질문과 답변을 생성하세요.

문서 내용:
{document}

요구사항:
- 원인과 결과 관계 설명
- 논리적 추론 과정 포함
- 여러 요소 간의 연관성 분석
- 심층적이고 통찰력 있는 답변`
    },
    procedural: {
      general: `문서에서 절차나 방법을 추출하여 "어떻게 하나요" 형태의 질문과 단계별 답변을 생성하세요.

문서 내용:
{document}

요구사항:
- 명확한 단계별 지침
- 순서대로 정리된 절차
- 필요한 도구나 전제조건 명시
- 주의사항이나 팁 포함`
    },
    comparative: {
      general: `문서 내용을 기반으로 비교 및 차이점에 대한 질문과 답변을 생성하세요.

문서 내용:
{document}

요구사항:
- "A와 B의 차이는?" 형태의 질문
- 장단점 비교
- 유사점과 차이점 명확히 구분
- 비교 표나 기준 제시`
    },
    custom: {
      general: ''
    }
  };

  // 프롬프트 템플릿 변경 핸들러 (자동 생성 탭)
  const handlePromptTemplateChange = (value: string) => {
    setPromptTemplate(value);
    if (value === 'custom') {
      setCustomPrompt('');
    } else {
      const templateGroup = qaGenerationPromptTemplates[value] || qaGenerationPromptTemplates['default'];
      const prompt = templateGroup[selectedDomain] || templateGroup['general'] || '';
      setCustomPrompt(prompt);
    }
  };

  // 도메인 변경 핸들러 (자동 생성 탭)
  const handleDomainChange = (value: string) => {
    setSelectedDomain(value);
    if (promptTemplate !== 'custom') {
      const templateGroup = qaGenerationPromptTemplates[promptTemplate] || qaGenerationPromptTemplates['default'];
      const prompt = templateGroup[value] || templateGroup['general'] || '';
      setCustomPrompt(prompt);
    }
  };

  // 초기 프롬프트 설정 (자동 생성 탭)
  useEffect(() => {
    if (promptTemplate !== 'custom') {
      const templateGroup = qaGenerationPromptTemplates[promptTemplate] || qaGenerationPromptTemplates['default'];
      const prompt = templateGroup[selectedDomain] || templateGroup['general'] || '';
      setCustomPrompt(prompt);
    }
  }, []);

  // 파일 선택 핸들러
  const handleAutoGenFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      toast.success(`${file.name} 파일이 선택되었습니다`);
      setAutoGenStep(2); // 다음 단계로
    }
  };

  const handleUploadFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      toast.success(`${file.name} 파일이 선택되었습니다`);
      setUploadStep(2); // 다음 단계로
    }
  };

  // 드래그 앤 드롭 핸들러 (자동 생성 탭)
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      const allowedTypes = ['.pdf', '.txt', '.docx'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (allowedTypes.includes(fileExtension)) {
        setSelectedFile(file);
        toast.success(`${file.name} 파일이 선택되었습니다`);
        setAutoGenStep(2);
      } else {
        toast.error('PDF, TXT, DOCX 파일만 업로드 가능합니다');
      }
    }
  };

  // 드래그 앤 드롭 핸들러 (업로드 탭)
  const handleUploadDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleUploadDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsUploadDragging(true);
  };

  const handleUploadDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsUploadDragging(false);
  };

  const handleUploadDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsUploadDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      const allowedTypes = ['.csv', '.json', '.jsonl', '.txt', '.yaml', '.yml'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (allowedTypes.includes(fileExtension)) {
        setSelectedFile(file);
        toast.success(`${file.name} 파일이 선택되었습니다`);
        setUploadStep(2);
      } else {
        toast.error('CSV, JSON, JSONL, TXT, YAML 파일만 업로드 가능합니다');
      }
    }
  };

  // 다이얼로그 닫기 시 초기화
  const handleDialogClose = (open: boolean) => {
    setIsCreateDialogOpen(open);
    if (!open) {
      setAutoGenStep(1);
      setUploadStep(1);
      setSelectedFile(null);
      setIsProcessing(false);
      setProcessingProgress(0);
      setGeneratedQAs([]);
    }
  };

  // QA 자동 생성 시작
  const handleStartAutoGeneration = () => {
    setIsProcessing(true);
    setProcessingStage('parsing');
    setProcessingProgress(0);

    // 시뮬레이션: 문서 파싱
    setTimeout(() => {
      setProcessingProgress(25);
      setProcessingStage('generating');
      
      // 시뮬레이션: QA 생성
      setTimeout(() => {
        setProcessingProgress(60);
        
        // 시뮬레이션: QA 생성 (점진적으로)
        const mockQAs = Array.from({ length: 100 }, (_, i) => ({
          id: `qa-${Date.now()}-${i}`,
          question: `${selectedFile?.name} 문서 기반 질문 ${i + 1}번`,
          answer: `이것은 자동 생성된 답변입니다. 문서의 내용을 바탕으로 정확하고 상세하게 답변을 제공합니다.`
        }));
        
        setGeneratedQAs(mockQAs);
        setProcessingProgress(85);
        setProcessingStage('validating');
        
        // 시뮬레이션: 검증
        setTimeout(() => {
          setProcessingProgress(100);
          setProcessingStage('complete');
        }, 1500);
      }, 3000);
    }, 2000);
  };

  // QA 업로드 및 처리 시작
  const handleStartUpload = () => {
    setIsProcessing(true);
    setProcessingStage('parsing');
    setProcessingProgress(0);

    // 시뮬레이션: 파일 파싱
    setTimeout(() => {
      setProcessingProgress(40);
      setProcessingStage('validating');
      
      // 시뮬레이션: 데이터 검증 및 처리
      setTimeout(() => {
        const mockQAs = Array.from({ length: 150 }, (_, i) => ({
          id: `qa-upload-${Date.now()}-${i}`,
          question: `업로드된 질문 ${i + 1}번`,
          answer: `업로드된 답변 ${i + 1}번입니다.`
        }));
        
        setGeneratedQAs(mockQAs);
        setProcessingProgress(100);
        setProcessingStage('complete');
      }, 2500);
    }, 2000);
  };

  // 최종 데이터셋 생성 및 등록
  const handleFinalizeDataset = () => {
    const newDataset: Dataset = {
      id: `dataset-${Date.now()}`,
      name: createdDatasetName || `데이터셋 ${datasets.length + 1}`,
      type: isProcessing && autoGenStep > 0 ? 'auto-generated' : 'uploaded',
      createdAt: new Date().toISOString().split('T')[0],
      qaCount: generatedQAs.length,
      qaPairs: generatedQAs.map(qa => ({
        id: qa.id,
        question: qa.question,
        answer: qa.answer,
        context: ''
      }))
    };

    setDatasets(prev => [newDataset, ...prev]);
    toast.success('데이터셋이 생성되었습니다', {
      description: `${generatedQAs.length}개의 QA가 등록되었습니다.`
    });
    
    handleDialogClose(false);
  };

  const getTypeBadge = (type: string) => {
    return type === 'auto-generated' ? (
      <Badge className="gap-1.5 bg-white text-violet-700 border-violet-200 border">
        <Sparkles className="h-3 w-3" />
        자동 생성
      </Badge>
    ) : (
      <Badge className="gap-1.5 bg-white text-blue-700 border-blue-200 border">
        <Upload className="h-3 w-3" />
        수동 등록
      </Badge>
    );
  };

  const handleRenameDataset = (datasetId: string) => {
    const dataset = datasets.find(d => d.id === datasetId);
    if (dataset) {
      setRenameDatasetId(datasetId);
      setNewDatasetName(dataset.name);
      setIsRenameDialogOpen(true);
    }
  };

  const confirmRename = () => {
    if (!newDatasetName.trim()) {
      toast.error('데이터셋 이름을 입력해주세요');
      return;
    }
    setDatasets(datasets.map(d => 
      d.id === renameDatasetId ? { ...d, name: newDatasetName } : d
    ));
    toast.success('데이터셋 이름이 변경되었습니다');
    setIsRenameDialogOpen(false);
  };

  const handleDeleteDataset = (datasetId: string, datasetName: string) => {
    if (confirm(`"${datasetName}" 데이터셋을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
      setDatasets(datasets.filter(d => d.id !== datasetId));
      toast.success('데이터셋이 삭제되었습니다');
    }
  };

  // QA 편집 시작
  const handleEditQa = (qaId: string, question: string, answer: string) => {
    setEditingQaId(qaId);
    setEditedQuestion(question);
    setEditedAnswer(answer);
  };

  // QA 편집 저장
  const handleSaveQa = (datasetId: string) => {
    if (!editedQuestion.trim() || !editedAnswer.trim()) {
      toast.error('질문과 답변을 모두 입력해주세요');
      return;
    }

    setDatasets(datasets.map(d => 
      d.id === datasetId 
        ? { 
            ...d, 
            qaPairs: d.qaPairs.map(qa => 
              qa.id === editingQaId 
                ? { ...qa, question: editedQuestion.trim(), answer: editedAnswer.trim() }
                : qa
            )
          }
        : d
    ));
    
    toast.success('QA가 수정되었습니다');
    setEditingQaId(null);
    setEditedQuestion('');
    setEditedAnswer('');
  };

  // QA 편집 취소
  const handleCancelEdit = () => {
    setEditingQaId(null);
    setEditedQuestion('');
    setEditedAnswer('');
  };

  // 데이터셋 Export
  const handleExportDataset = (dataset: Dataset) => {
    const data = {
      name: dataset.name,
      type: dataset.type,
      createdAt: dataset.createdAt,
      qaCount: dataset.qaCount,
      qaPairs: dataset.qaPairs.map(qa => ({
        question: qa.question,
        answer: qa.answer
      }))
    };
    
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${dataset.name}_dataset.json`;
    link.click();
    
    toast.success('데이터셋이 다운로드되었습니다');
  };

  // 필터링 및 정렬
  const filteredDatasets = datasets
    .filter(d => {
      const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'all' || d.type === typeFilter;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else {
        return b.qaCount - a.qaCount;
      }
    });

  // 통계 계산
  const totalDatasets = datasets.length;
  const totalQAs = datasets.reduce((sum, d) => sum + d.qaCount, 0);
  const autoGeneratedCount = datasets.filter(d => d.type === 'auto-generated').length;
  const uploadedCount = datasets.filter(d => d.type === 'uploaded').length;

  // QA 상세보기 필터링 및 페이지네이션
  const getFilteredQAs = (dataset: Dataset) => {
    const filtered = dataset.qaPairs.filter(qa => 
      qa.question.toLowerCase().includes(qaSearchQuery.toLowerCase()) ||
      qa.answer.toLowerCase().includes(qaSearchQuery.toLowerCase())
    );
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedQAs = filtered.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    
    return { paginatedQAs, totalPages, totalCount: filtered.length };
  };

  return (
    <TooltipProvider>
      <div className="space-y-4 bg-gray-50/30 -m-6 p-6">
        {/* 도움말 배너 */}
        {showHelpBanner && (
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="flex items-start justify-between gap-2">
              <span className="text-sm text-blue-900">
                <strong>데이터셋 가이드:</strong> QA는 <strong>최소 50개 이상</strong> 권장됩니다. 
                자동 생성은 원본 문서에서 AI가 추출하며, 업로드는 CSV/JSON 형식을 지원합니다. 
                생성 후 <strong>QA 품질 검토</strong>를 권장합니다.
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

        {/* 헤더 */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-gray-900 font-bold text-[24px]">데이터셋 관리</h1>
            <p className="text-gray-600 mt-1 text-sm">
              평가에 사용할 QA 데이터셋을 생성하고 관리하세요
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                신규 데이터셋 생성
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle className="text-gray-900">신규 데이터셋 생성</DialogTitle>
                <DialogDescription className="text-gray-600">
                  원본 문서에서 QA를 자동 생성하거나 기존 QA 데이터셋을 업로드하세요
                </DialogDescription>
              </DialogHeader>
              {!isProcessing ? (
                <Tabs defaultValue="auto" className="mt-4 flex-1 flex flex-col overflow-hidden">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="auto">
                      <Sparkles className="h-4 w-4 mr-2" />
                      신규 QA 자동 생성
                    </TabsTrigger>
                    <TabsTrigger value="upload">
                      <Upload className="h-4 w-4 mr-2" />
                      기존 QA 데이터셋 업로드
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="auto" className="flex-1 flex flex-col overflow-hidden">
                  {/* Progress Indicator */}
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`flex items-center gap-2 ${autoGenStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${autoGenStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                          {autoGenStep > 1 ? <Check className="h-3 w-3" /> : '1'}
                        </div>
                        <span className="text-sm">파일 업로드</span>
                      </div>
                      <div className={`flex-1 h-0.5 mx-2 ${autoGenStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                      <div className={`flex items-center gap-2 ${autoGenStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${autoGenStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                          {autoGenStep > 2 ? <Check className="h-3 w-3" /> : '2'}
                        </div>
                        <span className="text-sm">도메인 설정</span>
                      </div>
                      <div className={`flex-1 h-0.5 mx-2 ${autoGenStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                      <div className={`flex items-center gap-2 ${autoGenStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${autoGenStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                          {autoGenStep > 3 ? <Check className="h-3 w-3" /> : '3'}
                        </div>
                        <span className="text-sm">생성 옵션</span>
                      </div>
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 overflow-y-auto px-1">
                    {/* Step 1: 파일 업로드 */}
                    {autoGenStep === 1 && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="dataset-name">데이터셋 이름</Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">구분하기 쉬운 이름을 사용하세요</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <Input id="dataset-name" placeholder="예: 고객 지원 FAQ" />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="source-doc">원본 문서</Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">PDF, TXT, DOCX 지원 (최대 10MB)</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <div 
                            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                              isDragging 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-300 bg-gray-50'
                            }`}
                            onDragOver={handleDragOver}
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                          >
                            <FileText className={`h-12 w-12 mx-auto mb-3 ${isDragging ? 'text-blue-600' : 'text-gray-500'}`} />
                            <p className="text-gray-900 mb-1">
                              PDF, TXT, DOCX 파일을 드래그하거나 클릭하여 업로드
                            </p>
                            <p className="text-gray-500 text-sm mb-4">최대 10MB</p>
                            {selectedFile && (
                              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mb-3">
                                <FileText className="h-4 w-4 text-blue-600" />
                                <span className="text-sm text-blue-900">{selectedFile.name}</span>
                              </div>
                            )}
                            <input 
                              type="file"
                              ref={autoGenFileInputRef}
                              onChange={handleAutoGenFileSelect}
                              accept=".pdf,.txt,.docx"
                              className="hidden"
                            />
                            <Button 
                              variant="outline" 
                              className="border-gray-300"
                              onClick={() => autoGenFileInputRef.current?.click()}
                            >
                              파일 선택
                            </Button>
                          </div>
                        </div>

                        <Alert className="bg-blue-50 border-blue-200">
                          <Info className="h-4 w-4 text-blue-600" />
                          <AlertDescription className="text-sm text-blue-900">
                            업로드한 문서를 기반으로 LLM이 질문-답변 쌍을 자동 생성합니다.
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}

                    {/* Step 2: 도메인 및 모델 설정 */}
                    {autoGenStep === 2 && (
                      <div className="space-y-4">
                        {selectedFile && (
                          <Alert className="bg-gray-50 border-gray-200">
                            <FileText className="h-4 w-4 text-gray-600" />
                            <AlertDescription className="text-sm text-gray-700">
                              <strong>선택된 파일:</strong> {selectedFile.name}
                            </AlertDescription>
                          </Alert>
                        )}

                        {/* 도메인 선택 */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="domain">도메인</Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs max-w-xs">도메인에 따라 질문 스타일과 전문 용어가 달라집니다</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <Select value={selectedDomain} onValueChange={handleDomainChange}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="general">일반 / 고객 지원</SelectItem>
                              <SelectItem value="technical">기술 문서 / 개발</SelectItem>
                              <SelectItem value="medical">의료 / 헬스케어</SelectItem>
                              <SelectItem value="legal">법률 / 계약</SelectItem>
                              <SelectItem value="finance">금융 / 투자</SelectItem>
                              <SelectItem value="education">교육 / 학습</SelectItem>
                              <SelectItem value="ecommerce">이커머스 / 제품</SelectItem>
                              <SelectItem value="custom">커스텀 (직접 설정)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* LLM 모델 선택 */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="llm-model">QA 생성 LLM 모델</Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs max-w-xs">GPT-4 권장 (높은 품질), GPT-3.5 (빠른 생성)</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <Select defaultValue="gpt-4o">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="gpt-4o">GPT-4o (권장)</SelectItem>
                              <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                              <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (빠름)</SelectItem>
                              <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                              <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* 프롬프트 템플릿 */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="prompt-template">프롬프트 템플릿</Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs max-w-xs">도메인별 최적화된 템플릿 또는 직접 작성</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <Select value={promptTemplate} onValueChange={handlePromptTemplateChange}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="default">기본 템플릿 (도메인 기반)</SelectItem>
                              <SelectItem value="factual">사실 확인 중심</SelectItem>
                              <SelectItem value="reasoning">추론 및 분석 중심</SelectItem>
                              <SelectItem value="procedural">절차 및 방법 중심</SelectItem>
                              <SelectItem value="comparative">비교 및 차이점 중심</SelectItem>
                              <SelectItem value="custom">커스텀 프롬프트</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* 프롬프트 프리뷰/편집 */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="custom-prompt">
                              {promptTemplate === 'custom' || selectedDomain === 'custom' 
                                ? '커스텀 프롬프트' 
                                : '프롬프트 프리뷰'}
                            </Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs max-w-xs">
                                  {promptTemplate === 'custom' || selectedDomain === 'custom'
                                    ? '{context}, {document} 변수를 사용하여 프롬프트 작성 가능'
                                    : '선택한 템플릿의 프롬프트입니다. 수정하려면 도메인이나 템플릿을 커스텀으로 선택하세요.'}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <Textarea 
                            id="custom-prompt"
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            readOnly={promptTemplate !== 'custom' && selectedDomain !== 'custom'}
                            placeholder={promptTemplate === 'custom' || selectedDomain === 'custom'
                              ? '프롬프트를 직접 작성하세요...' 
                              : '템플릿 선택 시 프롬프트가 표시됩니다'}
                            className={`min-h-[120px] font-mono text-sm ${
                              promptTemplate !== 'custom' && selectedDomain !== 'custom'
                                ? 'bg-gray-50 cursor-default' 
                                : ''
                            }`}
                          />
                          <p className="text-xs text-gray-500">
                            {promptTemplate === 'custom' || selectedDomain === 'custom'
                              ? '도메인과 목적에 맞는 프롬프트를 직접 작성하세요'
                              : '이 프롬프트는 선택한 도메인과 템플릿에 최적화되어 있습니다'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Step 3: 생성 옵션 */}
                    {autoGenStep === 3 && (
                      <div className="space-y-4">
                        {/* 질문 유형 */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Label>질문 유형 선택</Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs max-w-xs">여러 유형을 선택하면 균등하게 분배됩니다</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <label className="flex items-center gap-2 text-sm">
                              <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                              <span>사실 확인형</span>
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                              <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                              <span>절차/방법형</span>
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                              <input type="checkbox" className="rounded border-gray-300" />
                              <span>비교/대조형</span>
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                              <input type="checkbox" className="rounded border-gray-300" />
                              <span>원인/이유형</span>
                            </label>
                          </div>
                        </div>

                        {/* 난이도 설정 */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Label>난이도 분포</Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs max-w-xs">다양한 난이도로 시스템을 테스트할 수 있습니다</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-1">
                              <Label htmlFor="easy-ratio" className="text-xs text-gray-600">쉬움</Label>
                              <Input id="easy-ratio" type="number" defaultValue="30" min="0" max="100" />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor="medium-ratio" className="text-xs text-gray-600">보통</Label>
                              <Input id="medium-ratio" type="number" defaultValue="50" min="0" max="100" />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor="hard-ratio" className="text-xs text-gray-600">어려움</Label>
                              <Input id="hard-ratio" type="number" defaultValue="20" min="0" max="100" />
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">합계가 100%가 되도록 조정됩니다</p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="qa-count">생성할 QA 개수</Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">정확한 평가를 위해 최소 50개 이상 권장</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <Input id="qa-count" type="number" defaultValue="100" min="10" max="1000" />
                        </div>

                        <Alert className="bg-blue-50 border-blue-200">
                          <Sparkles className="h-4 w-4 text-blue-600" />
                          <AlertDescription className="text-sm text-blue-900">
                            <strong>프리뷰:</strong> 선택한 도메인과 템플릿을 기반으로 고품질 QA가 생성됩니다. 
                            생성 후 품질 검토를 권장합니다.
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-200">
                    <Button
                      variant="outline"
                      onClick={() => setAutoGenStep(Math.max(1, autoGenStep - 1))}
                      disabled={autoGenStep === 1}
                      className="border-gray-300"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      이전
                    </Button>
                    
                    {autoGenStep < 3 ? (
                      <Button
                        onClick={() => setAutoGenStep(autoGenStep + 1)}
                        disabled={autoGenStep === 1 && !selectedFile}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        다음
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    ) : (
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={handleStartAutoGeneration}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        QA 자동 생성 시작
                      </Button>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="upload" className="flex-1 flex flex-col overflow-hidden">
                  {/* Progress Indicator */}
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`flex items-center gap-2 ${uploadStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${uploadStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                          {uploadStep > 1 ? <Check className="h-3 w-3" /> : '1'}
                        </div>
                        <span className="text-sm">파일 업로드</span>
                      </div>
                      <div className={`flex-1 h-0.5 mx-2 ${uploadStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                      <div className={`flex items-center gap-2 ${uploadStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${uploadStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                          {uploadStep > 2 ? <Check className="h-3 w-3" /> : '2'}
                        </div>
                        <span className="text-sm">데이터 처리</span>
                      </div>
                      <div className={`flex-1 h-0.5 mx-2 ${uploadStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                      <div className={`flex items-center gap-2 ${uploadStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${uploadStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                          {uploadStep > 3 ? <Check className="h-3 w-3" /> : '3'}
                        </div>
                        <span className="text-sm">보강 옵션</span>
                      </div>
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 overflow-y-auto px-1">
                    {/* Step 1: 파일 업로드 */}
                    {uploadStep === 1 && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="dataset-name-upload">데이터셋 이름</Label>
                          <Input id="dataset-name-upload" placeholder="예: 기존 QA 데이터" />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="qa-file">QA 파일</Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs max-w-xs">
                                  question, answer 컬럼 필수<br/>
                                  context 컬럼 선택 (Ground Truth용)
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <div 
                            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                              isUploadDragging 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-300 bg-gray-50'
                            }`}
                            onDragOver={handleUploadDragOver}
                            onDragEnter={handleUploadDragEnter}
                            onDragLeave={handleUploadDragLeave}
                            onDrop={handleUploadDrop}
                          >
                            <Upload className={`h-12 w-12 mx-auto mb-3 ${isUploadDragging ? 'text-blue-600' : 'text-gray-500'}`} />
                            <p className="text-gray-900 mb-1">
                              CSV, JSON, JSONL, TXT, YAML 파일 업로드
                            </p>
                            <p className="text-gray-500 text-sm mb-4">
                              <strong>필수 컬럼:</strong> question, answer <span className="text-gray-400">(선택: context)</span>
                            </p>
                            {selectedFile && (
                              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mb-3">
                                <FileText className="h-4 w-4 text-blue-600" />
                                <span className="text-sm text-blue-900">{selectedFile.name}</span>
                              </div>
                            )}
                            <input 
                              type="file"
                              ref={uploadFileInputRef}
                              onChange={handleUploadFileSelect}
                              accept=".csv,.json,.jsonl,.txt,.yaml,.yml"
                              className="hidden"
                            />
                            <Button 
                              variant="outline" 
                              className="border-gray-300"
                              onClick={() => uploadFileInputRef.current?.click()}
                            >
                              파일 선택
                            </Button>
                          </div>
                        </div>

                        <Alert className="bg-blue-50 border-blue-200">
                          <Info className="h-4 w-4 text-blue-600" />
                          <AlertDescription className="text-sm text-blue-900">
                            기존 QA 데이터셋을 업로드하여 즉시 평가에 사용할 수 있습니다.
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}

                    {/* Step 2: 데이터 처리 옵션 */}
                    {uploadStep === 2 && (
                      <div className="space-y-4">
                        {selectedFile && (
                          <Alert className="bg-gray-50 border-gray-200">
                            <FileText className="h-4 w-4 text-gray-600" />
                            <AlertDescription className="text-sm text-gray-700">
                              <strong>선택된 파일:</strong> {selectedFile.name}
                            </AlertDescription>
                          </Alert>
                        )}

                        {/* 파일 형식 설정 */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Label>파일 형식 설정</Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs max-w-xs">파일의 컬럼명이 다른 경우 매핑하세요</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label htmlFor="question-col" className="text-xs text-gray-600">질문 컬럼명</Label>
                              <Input id="question-col" defaultValue="question" placeholder="예: query, q" />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor="answer-col" className="text-xs text-gray-600">답변 컬럼명</Label>
                              <Input id="answer-col" defaultValue="answer" placeholder="예: response, a" />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="context-col" className="text-xs text-gray-600">컨텍스트 컬럼명 (선택)</Label>
                            <Input id="context-col" defaultValue="context" placeholder="예: ground_truth, reference" />
                          </div>
                        </div>

                        {/* 데이터 처리 옵션 */}
                        <div className="space-y-2">
                          <Label>데이터 처리 옵션</Label>
                          <div className="space-y-2">
                            <label className="flex items-start gap-2 text-sm">
                              <input type="checkbox" defaultChecked className="mt-0.5 rounded border-gray-300" />
                              <div>
                                <div className="font-medium">중복 제거</div>
                                <div className="text-xs text-gray-500">동일한 질문 자동 제거</div>
                              </div>
                            </label>
                            <label className="flex items-start gap-2 text-sm">
                              <input type="checkbox" defaultChecked className="mt-0.5 rounded border-gray-300" />
                              <div>
                                <div className="font-medium">품질 검증</div>
                                <div className="text-xs text-gray-500">빈 값, 너무 짧은 답변 필터링</div>
                              </div>
                            </label>
                            <label className="flex items-start gap-2 text-sm">
                              <input type="checkbox" className="mt-0.5 rounded border-gray-300" />
                              <div>
                                <div className="font-medium">공백 정규화</div>
                                <div className="text-xs text-gray-500">앞뒤 공백 제거, 연속 공백 정리</div>
                              </div>
                            </label>
                          </div>
                        </div>

                        {/* 프리뷰 옵션 */}
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                            <span>다음 단계에서 데이터 프리뷰 표시</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Step 3: 데이터 보강 옵션 */}
                    {uploadStep === 3 && (
                      <div className="space-y-4">
                        {/* 데이터 보강 옵션 */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Label>데이터 보강 (LLM 사용)</Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs max-w-xs">
                                  LLM을 사용하여 데이터 품질을 향상시킵니다<br/>
                                  (추가 비용 발생)
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <Select value={enhancementType} onValueChange={handleEnhancementTypeChange}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">사용 안 함</SelectItem>
                              <SelectItem value="expand-answers">짧은 답변 확장</SelectItem>
                              <SelectItem value="rephrase-questions">질문 재구성 (명확성 향상)</SelectItem>
                              <SelectItem value="add-variations">질문 변형 추가 (데이터 증강)</SelectItem>
                              <SelectItem value="full">전체 보강 (확장 + 재구성 + 변형)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* LLM 모델 선택 (보강 사용 시) */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="llm-model-upload">LLM 모델 (보강용)</Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs max-w-xs">데이터 보강 시에만 사용됩니다</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <Select defaultValue="gpt-3.5-turbo" disabled={enhancementType === 'none'}>
                            <SelectTrigger className={enhancementType === 'none' ? 'opacity-50 cursor-not-allowed' : ''}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="gpt-4o">GPT-4o (최고 품질)</SelectItem>
                              <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                              <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (권장)</SelectItem>
                              <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* 커스텀 보강 프롬프트 */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="enhancement-prompt">보강 프롬프트 (선택)</Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs max-w-xs">
                                  {'{question}'}, {'{answer}'} 변수 사용 가능
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <Textarea 
                            id="enhancement-prompt" 
                            value={enhancementPrompt}
                            onChange={(e) => setEnhancementPrompt(e.target.value)}
                            disabled={enhancementType === 'none'}
                            placeholder={enhancementType === 'none' ? '보강 옵션을 선택하면 기본 프롬프트가 표시됩니다' : '기본 프롬프트를 수정하거나 직접 작성하세요'}
                            className={`min-h-[100px] font-mono text-sm ${enhancementType === 'none' ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`}
                          />
                          <p className="text-xs text-gray-500">
                            {enhancementType === 'none' 
                              ? '보강 옵션 선택 시 해당 기본 프롬프트가 자동으로 입력됩니다'
                              : '기본 프롬프트를 수정하거나 비워두면 선택한 보강 옵션의 기본 프롬프트 사용'}
                          </p>
                        </div>

                        <Alert className="bg-amber-50 border-amber-200">
                          <TrendingUp className="h-4 w-4 text-amber-600" />
                          <AlertDescription className="text-sm text-amber-900">
                            <strong>팁:</strong> 데이터 보강을 사용하지 않으면 바로 업로드됩니다. 
                            보강 사용 시 처리 시간이 추가로 소요됩니다.
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-200">
                    <Button
                      variant="outline"
                      onClick={() => setUploadStep(Math.max(1, uploadStep - 1))}
                      disabled={uploadStep === 1}
                      className="border-gray-300"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      이전
                    </Button>
                    
                    {uploadStep < 3 ? (
                      <Button
                        onClick={() => setUploadStep(uploadStep + 1)}
                        disabled={uploadStep === 1 && !selectedFile}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        다음
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    ) : (
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={handleStartUpload}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        업로드 및 처리 시작
                      </Button>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
              ) : (
                /* Processing & Preview Screen */
                <div className="mt-4 flex-1 flex flex-col overflow-hidden">
                  {processingStage !== 'complete' ? (
                    /* Processing Screen */
                    <div className="flex-1 flex flex-col items-center justify-center p-8">
                      <div className="w-full max-w-md space-y-6">
                        {/* Processing Animation */}
                        <div className="flex flex-col items-center gap-4">
                          {processingStage === 'parsing' && (
                            <>
                              <div className="relative">
                                <FileText className="h-16 w-16 text-blue-600" />
                                <Loader2 className="h-8 w-8 text-blue-600 animate-spin absolute -bottom-2 -right-2" />
                              </div>
                              <h3 className="text-gray-900">문서 분석 중...</h3>
                              <p className="text-sm text-gray-600 text-center">
                                업로드된 문서를 읽고 내용을 분석하고 있습니다
                              </p>
                            </>
                          )}
                          {processingStage === 'generating' && (
                            <>
                              <div className="relative">
                                <Sparkles className="h-16 w-16 text-blue-600" />
                                <Loader2 className="h-8 w-8 text-blue-600 animate-spin absolute -bottom-2 -right-2" />
                              </div>
                              <h3 className="text-gray-900">QA 생성 중...</h3>
                              <p className="text-sm text-gray-600 text-center">
                                LLM이 문서 내용을 기반으로 질문과 답변을 생성하고 있습니다
                              </p>
                            </>
                          )}
                          {processingStage === 'validating' && (
                            <>
                              <div className="relative">
                                <FileCheck className="h-16 w-16 text-blue-600" />
                                <Loader2 className="h-8 w-8 text-blue-600 animate-spin absolute -bottom-2 -right-2" />
                              </div>
                              <h3 className="text-gray-900">품질 검증 중...</h3>
                              <p className="text-sm text-gray-600 text-center">
                                생성된 QA의 품질을 검증하고 최적화하고 있습니다
                              </p>
                            </>
                          )}
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">진행률</span>
                            <span className="text-blue-600 font-medium">{processingProgress}%</span>
                          </div>
                          <Progress value={processingProgress} className="h-2" />
                        </div>

                        {/* Status Steps */}
                        <div className="space-y-2 pt-4">
                          <div className="flex items-center gap-3 text-sm">
                            {processingProgress > 0 ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                            )}
                            <span className={processingProgress > 0 ? 'text-gray-900' : 'text-gray-400'}>
                              문서 파싱
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            {processingProgress > 25 ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : processingProgress > 0 ? (
                              <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                            )}
                            <span className={processingProgress > 25 ? 'text-gray-900' : processingProgress > 0 ? 'text-blue-600' : 'text-gray-400'}>
                              QA 생성
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            {processingProgress > 85 ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : processingProgress > 60 ? (
                              <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                            )}
                            <span className={processingProgress > 85 ? 'text-gray-900' : processingProgress > 60 ? 'text-blue-600' : 'text-gray-400'}>
                              품질 검증
                            </span>
                          </div>
                        </div>

                        <Alert className="bg-blue-50 border-blue-200">
                          <Info className="h-4 w-4 text-blue-600" />
                          <AlertDescription className="text-sm text-blue-900">
                            처리 시간은 문서 크기와 생성할 QA 개수에 따라 달라집니다
                          </AlertDescription>
                        </Alert>
                      </div>
                    </div>
                  ) : (
                    /* Preview & Finalize Screen */
                    <div className="flex-1 flex flex-col overflow-hidden">
                      <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-6 w-6 text-green-600" />
                          <div>
                            <h3 className="text-gray-900">QA 생성 완료</h3>
                            <p className="text-sm text-gray-600">
                              총 <strong className="text-blue-600">{generatedQAs.length}개</strong>의 QA가 생성되었습니다
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-green-50 text-green-700 border-green-200">
                          <Zap className="h-3 w-3 mr-1" />
                          생성 완료
                        </Badge>
                      </div>

                      {/* Dataset Name Input */}
                      <div className="p-4 border-b border-gray-200 space-y-2">
                        <Label htmlFor="final-dataset-name">데이터셋 이름</Label>
                        <Input 
                          id="final-dataset-name" 
                          value={createdDatasetName}
                          onChange={(e) => setCreatedDatasetName(e.target.value)}
                          placeholder="예: 고객 지원 FAQ v1"
                        />
                      </div>

                      {/* QA Preview */}
                      <div className="flex-1 overflow-y-auto p-4">
                        <div className="space-y-3">
                          {generatedQAs.slice(0, 10).map((qa, index) => (
                            <Card key={qa.id} className="border-gray-200">
                              <CardContent className="p-4">
                                <div className="space-y-2">
                                  <div className="flex items-start gap-2">
                                    <Badge variant="outline" className="text-xs shrink-0 mt-0.5">
                                      Q{index + 1}
                                    </Badge>
                                    <p className="text-sm text-gray-900">{qa.question}</p>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <Badge variant="outline" className="text-xs shrink-0 mt-0.5">
                                      A
                                    </Badge>
                                    <p className="text-sm text-gray-600">{qa.answer}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                          {generatedQAs.length > 10 && (
                            <div className="text-center py-2">
                              <p className="text-sm text-gray-500">
                                ... 외 {generatedQAs.length - 10}개 QA
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="p-4 border-t border-gray-200 space-y-3">
                        <Alert className="bg-blue-50 border-blue-200">
                          <Info className="h-4 w-4 text-blue-600" />
                          <AlertDescription className="text-sm text-blue-900">
                            생성된 QA를 확인하고 데이터셋으로 등록하세요. 등록 후 언제든지 수정할 수 있습니다.
                          </AlertDescription>
                        </Alert>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsProcessing(false);
                              setProcessingProgress(0);
                              setGeneratedQAs([]);
                            }}
                            className="flex-1 border-gray-300"
                          >
                            취소
                          </Button>
                          <Button
                            onClick={handleFinalizeDataset}
                            disabled={!createdDatasetName.trim()}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                          >
                            <Check className="h-4 w-4 mr-2" />
                            데이터셋 등록
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* 검색 및 필터 */}
        {datasets.length > 0 && (
          <Card className="border-blue-100 bg-white shadow-sm">
            <CardContent className="pt-4">
              {/* 통계 요약 */}
              <div className="flex flex-wrap items-center gap-4 mb-3 pb-3 border-b border-gray-200">
                <div className="flex items-center gap-1.5 text-sm">
                  <Database className="h-4 w-4 text-blue-600" />
                  <span className="text-gray-600">전체</span>
                  <span className="font-semibold text-gray-900">{totalDatasets}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <MessageSquare className="h-4 w-4 text-green-600" />
                  <span className="text-gray-600">총 QA</span>
                  <span className="font-semibold text-gray-900">{totalQAs}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <Sparkles className="h-4 w-4 text-violet-600" />
                  <span className="text-gray-600">자동생성</span>
                  <span className="font-semibold text-gray-900">{autoGeneratedCount}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <Upload className="h-4 w-4 text-blue-600" />
                  <span className="text-gray-600">업로드</span>
                  <span className="font-semibold text-gray-900">{uploadedCount}</span>
                </div>
              </div>

              {/* 검색 및 필터 */}
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="데이터셋 이름 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 text-sm border-gray-300"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as any)}>
                    <SelectTrigger className="w-40 h-9 text-sm border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체 타입</SelectItem>
                      <SelectItem value="auto-generated">자동 생성</SelectItem>
                      <SelectItem value="uploaded">업로드</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-gray-500" />
                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                    <SelectTrigger className="w-40 h-9 text-sm border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">최신순</SelectItem>
                      <SelectItem value="name">이름순</SelectItem>
                      <SelectItem value="qaCount">QA 개수순</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dataset List */}
        {filteredDatasets.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredDatasets.map((dataset) => {
              const isAutoGenerated = dataset.type === 'auto-generated';
              
              return (
                <Card key={dataset.id} className="border-blue-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2 overflow-hidden">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className={`h-9 w-9 rounded-lg ${isAutoGenerated ? 'bg-violet-100' : 'bg-blue-100'} flex items-center justify-center shrink-0`}>
                          {isAutoGenerated ? (
                            <Sparkles className="h-4 w-4 text-violet-600" />
                          ) : (
                            <Database className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                        <CardTitle className="text-base truncate text-gray-900">{dataset.name}</CardTitle>
                      </div>
                      <div className="shrink-0">
                        {getTypeBadge(dataset.type)}
                      </div>
                    </div>
                    <CardDescription className="flex items-center gap-1 text-xs ml-11 text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {new Date(dataset.createdAt).toLocaleDateString('ko-KR')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    {/* QA 개수와 소스 정보 */}
                    <div className={`p-3 rounded-lg ${isAutoGenerated ? 'bg-violet-50 border border-violet-200' : 'bg-blue-50 border border-blue-200'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className={`h-3.5 w-3.5 ${isAutoGenerated ? 'text-violet-600' : 'text-blue-600'}`} />
                        <span className={`text-xs font-medium ${isAutoGenerated ? 'text-violet-900' : 'text-blue-900'}`}>QA 개수</span>
                      </div>
                      <div className={`text-xl font-semibold ${isAutoGenerated ? 'text-violet-600' : 'text-blue-600'}`}>{dataset.qaCount}</div>
                    </div>
                    
                    {dataset.source && (
                      <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                        <div className="text-xs text-gray-600 mb-0.5 font-medium">소스</div>
                        <div className="text-sm truncate text-gray-900" title={dataset.source}>
                          {dataset.source}
                        </div>
                      </div>
                    )}
                    
                    {/* 액션 버튼 */}
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="flex-1 h-9 text-sm border-blue-200 text-blue-600 hover:bg-blue-50"
                            onClick={() => {
                              setSelectedDataset(dataset);
                              setQaSearchQuery('');
                              setCurrentPage(1);
                            }}
                          >
                            <Eye className="h-3.5 w-3.5 mr-1.5" />
                            상세
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="!max-w-[90vw] max-h-[85vh] overflow-y-auto">
                          <DialogHeader>
                            <div className="flex items-center justify-between gap-4 pr-10">
                              <div className="flex-1 min-w-0">
                                <DialogTitle className="text-lg text-gray-900">{dataset.name}</DialogTitle>
                                <DialogDescription className="text-sm text-gray-600">
                                  데이터셋의 QA 쌍을 확인하고 편집할 수 있습니다
                                </DialogDescription>
                              </div>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-gray-300 shrink-0"
                                    onClick={() => handleExportDataset(dataset)}
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Export
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                  <p className="text-xs">JSON 형식으로 다운로드</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </DialogHeader>
                          
                          {/* QA 검색 */}
                          <div className="relative mt-4">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <Input
                              placeholder="QA 검색 (질문 또는 답변)..."
                              value={qaSearchQuery}
                              onChange={(e) => {
                                setQaSearchQuery(e.target.value);
                                setCurrentPage(1);
                              }}
                              className="pl-9 h-9 text-sm border-gray-300"
                            />
                          </div>

                          <div className="mt-4">
                            {(() => {
                              const { paginatedQAs, totalPages, totalCount } = getFilteredQAs(dataset);
                              
                              return (
                                <>
                                  {/* 검색 결과 표시 */}
                                  {qaSearchQuery && (
                                    <p className="text-sm text-gray-600 mb-3">
                                      {totalCount}개의 QA 발견
                                    </p>
                                  )}

                                  <Table>
                                    <TableHeader>
                                      <TableRow className="border-gray-200">
                                        <TableHead className="w-[60px] text-xs text-gray-700">번호</TableHead>
                                        <TableHead className="w-[45%] text-xs text-gray-700">질문</TableHead>
                                        <TableHead className="w-[45%] text-xs text-gray-700">답변</TableHead>
                                        <TableHead className="w-[100px] text-xs text-gray-700">작업</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {paginatedQAs.length > 0 ? (
                                        paginatedQAs.map((qa, index) => {
                                          const isEditing = editingQaId === qa.id;
                                          const actualIndex = (currentPage - 1) * itemsPerPage + index + 1;
                                          
                                          return (
                                            <TableRow key={qa.id} className="border-gray-200">
                                              <TableCell className="align-top text-sm text-gray-900">{actualIndex}</TableCell>
                                              <TableCell className="align-top text-sm text-gray-900">
                                                {isEditing ? (
                                                  <Textarea
                                                    value={editedQuestion}
                                                    onChange={(e) => setEditedQuestion(e.target.value)}
                                                    className="min-h-[100px] text-sm"
                                                    placeholder="질문을 입력하세요"
                                                  />
                                                ) : (
                                                  <div className="whitespace-normal break-words">{qa.question}</div>
                                                )}
                                              </TableCell>
                                              <TableCell className="align-top text-sm text-gray-700">
                                                {isEditing ? (
                                                  <Textarea
                                                    value={editedAnswer}
                                                    onChange={(e) => setEditedAnswer(e.target.value)}
                                                    className="min-h-[100px] text-sm"
                                                    placeholder="답변을 입력하세요"
                                                  />
                                                ) : (
                                                  <div className="whitespace-normal break-words">{qa.answer}</div>
                                                )}
                                              </TableCell>
                                              <TableCell className="align-top">
                                                {isEditing ? (
                                                  <div className="flex gap-1">
                                                    <Button 
                                                      variant="ghost" 
                                                      size="sm" 
                                                      className="h-7 w-7 p-0 text-green-600 hover:bg-green-50"
                                                      onClick={() => handleSaveQa(dataset.id)}
                                                      title="저장"
                                                    >
                                                      <Check className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                      variant="ghost" 
                                                      size="sm" 
                                                      className="h-7 w-7 p-0 text-gray-600 hover:bg-gray-100"
                                                      onClick={handleCancelEdit}
                                                      title="취소"
                                                    >
                                                      <X className="h-4 w-4" />
                                                    </Button>
                                                  </div>
                                                ) : (
                                                  <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="h-7 text-xs text-blue-600 hover:bg-blue-50"
                                                    onClick={() => handleEditQa(qa.id, qa.question, qa.answer)}
                                                  >
                                                    수정
                                                  </Button>
                                                )}
                                              </TableCell>
                                            </TableRow>
                                          );
                                        })
                                      ) : (
                                        <TableRow>
                                          <TableCell colSpan={4} className="text-center text-gray-500 text-sm py-8">
                                            {qaSearchQuery ? '검색 결과가 없습니다' : 'QA 데이터가 없습니다'}
                                          </TableCell>
                                        </TableRow>
                                      )}
                                    </TableBody>
                                  </Table>

                                  {/* 페이지네이션 */}
                                  {totalPages > 1 && (
                                    <div className="flex items-center justify-between mt-4">
                                      <p className="text-sm text-gray-600">
                                        페이지 {currentPage} / {totalPages}
                                      </p>
                                      <div className="flex gap-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                          disabled={currentPage === 1}
                                          className="border-gray-300"
                                        >
                                          <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                          disabled={currentPage === totalPages}
                                          className="border-gray-300"
                                        >
                                          <ChevronRight className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleRenameDataset(dataset.id)}
                            className="h-9 w-9 text-gray-600 hover:bg-gray-100"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">이름 변경</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteDataset(dataset.id, dataset.name)}
                            className="h-9 w-9 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">삭제</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : datasets.length === 0 ? (
          // Empty State
          <Card className="border-blue-100 bg-white shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-base text-gray-900 mb-1">등록된 데이터셋이 없습니다</h3>
              <p className="text-gray-600 mb-4 text-sm">
                신규 데이터셋을 생성하여 시작하세요
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="h-9 text-sm bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                데이터셋 생성
              </Button>
            </CardContent>
          </Card>
        ) : (
          // 검색 결과 없음
          <Card className="border-blue-100 bg-white shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-base text-gray-900 mb-1">검색 결과가 없습니다</h3>
              <p className="text-gray-600 mb-4 text-sm">
                다른 검색어나 필터를 시도해보세요
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery('');
                  setTypeFilter('all');
                }}
                className="border-gray-300"
              >
                필터 초기화
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 이름 변경 Dialog */}
        <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-gray-900">데이터셋 이름 변경</DialogTitle>
              <DialogDescription className="text-gray-600">
                새로운 데이터셋 이름을 입력하세요
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="new-name">데이터셋 이름</Label>
                <Input 
                  id="new-name" 
                  value={newDatasetName}
                  onChange={(e) => setNewDatasetName(e.target.value)}
                  placeholder="신규 데이터셋 이름"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      confirmRename();
                    }
                  }}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)} className="border-gray-300">
                  취소
                </Button>
                <Button onClick={confirmRename} className="bg-blue-600 hover:bg-blue-700">
                  변경
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
