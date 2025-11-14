import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { 
  Brain, 
  Filter, 
  Microscope, 
  FileQuestion, 
  DollarSign, 
  Info,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import type { DiagnosisSummary } from '../types';

interface DiagnosisSummaryCardProps {
  summary?: DiagnosisSummary;
}

export function DiagnosisSummaryCard({ summary }: DiagnosisSummaryCardProps) {
  if (!summary) {
    return (
      <Card className="border-gray-200 bg-white shadow-sm">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Brain className="h-5 w-5 text-blue-600" />
            실패 케이스 진단 요약
          </CardTitle>
          <CardDescription className="text-gray-600">
            LLM Judge 분석 및 휴리스틱 필터링 결과
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8 text-gray-500">
            <FileQuestion className="h-8 w-8 mr-2" />
            <span>진단 데이터가 없습니다</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const heuristicPercentage = summary.total_failed > 0 
    ? Math.round((summary.heuristic_classified / summary.total_failed) * 100) 
    : 0;
  const llmJudgePercentage = summary.total_failed > 0 
    ? Math.round((summary.llm_judge_analyzed / summary.total_failed) * 100) 
    : 0;
  const notAnalyzedPercentage = summary.total_failed > 0 
    ? Math.round((summary.not_analyzed / summary.total_failed) * 100) 
    : 0;

  return (
    <TooltipProvider>
      <Card className="border-blue-100 bg-white shadow-sm">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Brain className="h-5 w-5 text-blue-600" />
                실패 케이스 진단 요약
              </CardTitle>
              <CardDescription className="text-gray-600 mt-1">
                LLM Judge 분석 및 휴리스틱 필터링 결과
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-green-700 bg-green-50 border-green-200">
              비용 ${summary.diagnosis_cost.toFixed(2)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* 전체 실패 케이스 수 */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">전체 실패 케이스</span>
              <span className="text-2xl font-bold text-gray-900">{summary.total_failed}개</span>
            </div>
            <Progress value={100} className="h-2" />
          </div>

          {/* 진단 방법별 분류 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 휴리스틱 자동 분류 */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-medium text-blue-900">휴리스틱 분류</span>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-blue-500 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">규칙 기반으로 자동 분류된 명백한 실패 케이스입니다. LLM 호출 없이 CPU 연산만으로 처리되어 비용이 들지 않습니다.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-900">{summary.heuristic_classified}</span>
                  <Badge variant="outline" className="border-[#DEDEDE] text-[#666666]">
                    {heuristicPercentage}%
                  </Badge>
                </div>
                <Progress value={heuristicPercentage} className="h-2" />
                <div className="space-y-1 mt-3 pt-3 border-t border-blue-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-700">명백한 실패</span>
                    <span className="font-medium text-blue-900">{summary.breakdown.trivial_failures}개</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-700">검색 실패</span>
                    <span className="font-medium text-blue-900">{summary.breakdown.retrieval_failures}개</span>
                  </div>
                </div>
              </div>
            </div>

            {/* LLM Judge 분석 */}
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Microscope className="h-4 w-4 text-purple-600" />
                  <span className="text-xs font-medium text-purple-900">LLM Judge 분석</span>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-purple-500 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">애매한 실패 케이스를 LLM Judge가 상세히 분석한 결과입니다. 샘플링을 통해 비용을 절감했습니다.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-purple-900">{summary.llm_judge_analyzed}</span>
                  <Badge variant="outline" className="border-[#DEDEDE] text-[#666666]">
                    {llmJudgePercentage}%
                  </Badge>
                </div>
                <Progress value={llmJudgePercentage} className="h-2 bg-purple-200" />
                <div className="mt-3 pt-3 border-t border-purple-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-purple-700">샘플링 대상</span>
                    <span className="font-medium text-purple-900">{summary.breakdown.ambiguous_cases}개 중</span>
                  </div>
                  <p className="text-xs text-purple-600 mt-1">
                    {summary.breakdown.ambiguous_cases > 0 
                      ? `${Math.round((summary.llm_judge_analyzed / summary.breakdown.ambiguous_cases) * 100)}% 샘플링`
                      : '샘플링 없음'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* 미분석 */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileQuestion className="h-4 w-4 text-gray-600" />
                  <span className="text-xs font-medium text-gray-900">미분석</span>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-gray-500 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">샘플링으로 인해 LLM Judge 분석에서 제외된 케이스입니다. 비용 절감을 위해 일부만 분석했습니다.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900">{summary.not_analyzed}</span>
                  <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">
                    {notAnalyzedPercentage}%
                  </Badge>
                </div>
                <Progress value={notAnalyzedPercentage} className="h-2 bg-gray-200" />
              </div>
            </div>
          </div>

          {/* 비용 절감 안내 */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex gap-3">
              <Sparkles className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900">비용 절감 효과</p>
                <p className="text-xs text-green-700 mt-1">
                  휴리스틱 필터링과 샘플링을 통해 전체 케이스를 분석했을 때 대비{' '}
                  <strong>
                    {summary.total_failed > 0 
                      ? `${Math.round((1 - (summary.llm_judge_analyzed / summary.total_failed)) * 100)}%`
                      : '0%'
                    }
                  </strong>{' '}
                  의 LLM Judge 호출을 절감했습니다.
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="bg-white rounded p-2 border border-green-200">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                      <span className="text-xs text-green-700">실제 비용</span>
                    </div>
                    <p className="text-sm font-bold text-green-900 mt-1">${summary.diagnosis_cost.toFixed(2)}</p>
                  </div>
                  <div className="bg-white rounded p-2 border border-green-200">
                    <div className="flex items-center gap-1.5">
                      <XCircle className="h-3.5 w-3.5 text-gray-500" />
                      <span className="text-xs text-gray-600">전체 분석 시 예상</span>
                    </div>
                    <p className="text-sm font-bold text-gray-700 mt-1 line-through">
                      ${(summary.diagnosis_cost * (summary.total_failed / Math.max(summary.llm_judge_analyzed, 1))).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 방법론 설명 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-blue-900">진단 방법론</p>
                <ul className="text-xs text-blue-800 space-y-1.5 ml-1">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 shrink-0">1️⃣</span>
                    <span><strong>휴리스틱 필터:</strong> Score &lt; 0.2 또는 Context Recall &lt; 0.1인 명백한 실패 케이스를 자동 분류 (비용 $0)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 shrink-0">2️⃣</span>
                    <span><strong>샘플링:</strong> 애매한 케이스 중 일부만 선택하여 LLM Judge로 전달 (비용 절감)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 shrink-0">3️⃣</span>
                    <span><strong>LLM Judge:</strong> 선택된 케이스를 GPT-4가 상세 분석하여 근본 원인과 개선 조언 제공</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
