import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Separator } from './ui/separator';
import { Label } from './ui/label';
import { 
  Brain,
  AlertCircle,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Eye,
  FileText,
  ArrowRight
} from 'lucide-react';
import type { LLMJudgeRootCause, LLMJudgeFailureType } from '../types';

interface LLMJudgeAnalysisCardProps {
  analysis: LLMJudgeRootCause;
  question: string;
  generatedAnswer: string;
  expectedAnswer?: string;
  retrievedContexts?: string[];
  failedMetric: string;
  onFeedback?: (rating: 'accurate' | 'inaccurate' | 'suggestion', comment?: string) => void;
  onViewContext?: () => void;
  onImproveExperiment?: () => void;
}

export function LLMJudgeAnalysisCard({
  analysis,
  question,
  generatedAnswer,
  expectedAnswer,
  retrievedContexts,
  failedMetric,
  onFeedback,
  onViewContext,
  onImproveExperiment
}: LLMJudgeAnalysisCardProps) {
  
  const getBadgeVariant = (failureType: LLMJudgeFailureType) => {
    switch (failureType) {
      case 'Retrieval':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'Generation':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'Both':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getFailureTypeIcon = (failureType: LLMJudgeFailureType) => {
    switch (failureType) {
      case 'Retrieval':
        return '🔍';
      case 'Generation':
        return '🤖';
      case 'Both':
        return '⚠️';
      default:
        return '📊';
    }
  };

  return (
    <Card className="border-blue-100 bg-white shadow-sm">
      <CardHeader className="pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Brain className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <CardTitle className="text-base text-gray-900">LLM Judge 근본 원인 분석</CardTitle>
              <CardDescription className="text-xs text-gray-600">
                AI 기반 자동 진단 결과
              </CardDescription>
            </div>
          </div>
          <Badge className={`${getBadgeVariant(analysis.failure_type)} border`}>
            {getFailureTypeIcon(analysis.failure_type)} {analysis.failure_type} 문제
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* 질문 및 답변 컨텍스트 */}
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="space-y-2">
            <div>
              <Label className="text-xs text-gray-600">질문</Label>
              <p className="text-sm text-gray-900 mt-1">{question}</p>
            </div>
            <Separator />
            <div>
              <Label className="text-xs text-gray-600">생성된 답변</Label>
              <p className="text-sm text-gray-900 mt-1">{generatedAnswer}</p>
            </div>
            {expectedAnswer && (
              <>
                <Separator />
                <div>
                  <Label className="text-xs text-gray-600">기대 답변</Label>
                  <p className="text-sm text-gray-900 mt-1">{expectedAnswer}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 실패 지표 */}
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <span className="text-sm text-gray-700">
            실패 지표: <span className="font-medium text-orange-700">{failedMetric}</span>
          </span>
        </div>

        <Separator />

        {/* 요약 */}
        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-sm text-amber-900">문제 요약</AlertTitle>
          <AlertDescription className="text-sm text-amber-800 mt-1">
            {analysis.reason}
          </AlertDescription>
        </Alert>

        {/* 상세 분석 */}
        <div className="space-y-2">
          <Label className="text-sm text-gray-900 flex items-center gap-2">
            <FileText className="h-4 w-4 text-indigo-600" />
            상세 분석
          </Label>
          <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
              {analysis.root_cause.summary_ko}
            </p>
          </div>
        </div>

        {/* 개선 조언 */}
        <div className="space-y-2">
          <Label className="text-sm text-gray-900 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-green-600" />
            개선 조언
          </Label>
          <Alert className="bg-green-50 border-green-200">
            <Lightbulb className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-sm text-green-800 leading-relaxed">
              {analysis.root_cause.advice_ko}
            </AlertDescription>
          </Alert>
        </div>

        {/* 메타데이터 */}
        {(analysis.llm_model || analysis.prompt_version || analysis.confidence) && (
          <div className="pt-2 border-t border-gray-200">
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
              {analysis.llm_model && (
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">모델:</span>
                  <Badge variant="outline" className="text-xs">{analysis.llm_model}</Badge>
                </div>
              )}
              {analysis.prompt_version && (
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">프롬프트:</span>
                  <Badge variant="outline" className="text-xs">{analysis.prompt_version}</Badge>
                </div>
              )}
              {analysis.confidence && (
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">신뢰도:</span>
                  <Badge variant="outline" className="text-xs">
                    {(analysis.confidence * 100).toFixed(0)}%
                  </Badge>
                </div>
              )}
            </div>
          </div>
        )}

        <Separator />

        {/* 액션 버튼 */}
        <div className="space-y-3">
          {/* 컨텍스트 보기 & 개선 실험 */}
          <div className="flex items-center gap-2">
            {onViewContext && retrievedContexts && retrievedContexts.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onViewContext}
                className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <Eye className="h-4 w-4 mr-2" />
                검색된 컨텍스트 보기 ({retrievedContexts.length})
              </Button>
            )}
            {onImproveExperiment && (
              <Button
                size="sm"
                onClick={onImproveExperiment}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                개선 실험 시작
              </Button>
            )}
          </div>

          {/* 피드백 */}
          {onFeedback && (
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-700 mb-2">이 분석이 도움이 되었나요?</p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onFeedback('accurate')}
                  className="flex-1 border-green-300 text-green-700 hover:bg-green-50"
                >
                  <ThumbsUp className="h-3 w-3 mr-1" />
                  정확함
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onFeedback('inaccurate')}
                  className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                >
                  <ThumbsDown className="h-3 w-3 mr-1" />
                  부정확함
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onFeedback('suggestion')}
                  className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  <MessageSquare className="h-3 w-3 mr-1" />
                  개선 제안
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
