import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { 
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './ui/pagination';
import { 
  History, 
  Target, 
  Search,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  BarChart3,
  Award,
  Calendar,
  Info,
  X,
  Zap,
  ArrowUpDown
} from 'lucide-react';
import { mockEvaluationHistory, EvaluationHistory } from '../lib/mock-data';

interface EvaluationHistoryPageBlueProps {
  onViewResults: (evaluationId?: string) => void;
  onNavigate?: (page: string) => void;
}

export function EvaluationHistoryPageBlue({ onViewResults, onNavigate }: EvaluationHistoryPageBlueProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');
  const [showHelpBanner, setShowHelpBanner] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const completedEvaluations = mockEvaluationHistory.filter(e => e.status === 'completed');

  const filteredEvaluations = completedEvaluations
    .filter(evaluation =>
      evaluation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evaluation.datasetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evaluation.modelName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime();
      } else {
        return getOverallScore(b.scores) - getOverallScore(a.scores);
      }
    });

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredEvaluations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEvaluations = filteredEvaluations.slice(startIndex, endIndex);

  // 검색이나 정렬이 변경되면 첫 페이지로
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value: 'date' | 'score') => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const getOverallScore = (scores: Record<string, number>) => {
    const values = Object.values(scores);
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  };

  const getScoreTrend = (score: number) => {
    const scorePercent = score * 100;
    if (scorePercent >= 95) return { icon: Award, color: 'text-green-600', label: '탁월', bg: 'bg-green-50' };
    if (scorePercent >= 85) return { icon: TrendingUp, color: 'text-blue-600', label: '우수', bg: 'bg-blue-50' };
    if (scorePercent >= 70) return { icon: TrendingUp, color: 'text-yellow-600', label: '주의', bg: 'bg-yellow-50' };
    if (scorePercent >= 60) return { icon: TrendingDown, color: 'text-orange-600', label: '미흡', bg: 'bg-orange-50' };
    return { icon: TrendingDown, color: 'text-red-600', label: '심각', bg: 'bg-red-50' };
  };

  return (
    <TooltipProvider>
      <div className="space-y-4 bg-gray-50/30 -m-6 p-6">
        <div>
          <h1 className="text-gray-900 font-bold text-[24px]">평가 이력</h1>
          <p className="text-gray-600 mt-1 text-sm">
            완료된 평가 기록을 확인하고 결과를 분석하세요
          </p>
        </div>

        {/* 도움말 배너 */}
        {showHelpBanner && completedEvaluations.length > 0 && (
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="flex items-start justify-between gap-2">
              <span className="text-sm text-blue-900">
                평가 점수는 12개 RAG 지표의 평균값입니다. 
                <strong className="mx-1">탁월(95+)</strong>, 
                <strong className="mx-1">우수(85+)</strong>, 
                <strong className="mx-1">주의(70+)</strong>, 
                <strong className="mx-1">미흡(60+)</strong>, 
                <strong className="mx-1">심각(60 미만)</strong>으로 구분됩니다.
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

      {/* 통계 요약 - 상단 이동 */}
      {completedEvaluations.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-3">
          <Card className="border-blue-100 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-gray-700" />
                </div>
                <CardTitle className="text-gray-900 text-base">총 평가 횟수</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-gray-900 text-3xl font-semibold">{completedEvaluations.length}</div>
              <p className="text-gray-600 text-xs mt-0.5">완료된 평가</p>
            </CardContent>
          </Card>
          
          <Card className="border-blue-100 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-lg bg-blue-100 flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                </div>
                <CardTitle className="text-gray-900 text-base">평균 점수</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-blue-600 text-3xl font-semibold">
                {(
                  completedEvaluations.reduce((sum, e) => sum + getOverallScore(e.scores), 0) / 
                  completedEvaluations.length * 100
                ).toFixed(0)}
              </div>
              <p className="text-gray-600 text-xs mt-0.5">전체 평가 평균</p>
            </CardContent>
          </Card>
          
          <Card className="border-blue-100 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-lg bg-green-100 flex items-center justify-center">
                  <Award className="h-4 w-4 text-green-600" />
                </div>
                <CardTitle className="text-gray-900 text-base">우수 평가</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-green-600 text-3xl font-semibold">
                {completedEvaluations.filter(e => getOverallScore(e.scores) >= 0.85).length}
              </div>
              <p className="text-gray-600 text-xs mt-0.5">85점 이상</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {completedEvaluations.length > 0 ? (
        <Card className="border-blue-100 bg-white shadow-sm">
        <CardHeader className="pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg text-gray-900">완료된 평가</CardTitle>
              <CardDescription className="text-sm text-gray-600">총 {completedEvaluations.length}개의 평가 기록</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="평가 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 text-sm border-gray-300"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200 bg-gray-50">
                  <TableHead className="w-[200px] text-xs text-gray-700">평가 이름</TableHead>
                  <TableHead className="text-xs text-gray-700">데이터셋</TableHead>
                  <TableHead className="text-xs text-gray-700">모델</TableHead>
                  <TableHead className="text-xs text-gray-700">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 cursor-help">
                          종합 점수
                          <Info className="h-3 w-3 text-gray-400" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">12개 RAG 지표의 평균값</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableHead>
                  <TableHead className="text-xs text-gray-700">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 cursor-help">
                          평가
                          <Info className="h-3 w-3 text-gray-400" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-xs space-y-1">
                          <p>• 탁월: 95점 이상</p>
                          <p>• 우수: 85점 이상</p>
                          <p>• 주의: 70점 이상</p>
                          <p>• 미흡: 60점 이상</p>
                          <p>• 심각: 60점 미만</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TableHead>
                  <TableHead className="text-xs text-gray-700">완료 시간</TableHead>
                  <TableHead className="text-right text-xs text-gray-700">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentEvaluations.length > 0 ? (
                  currentEvaluations.map((evaluation) => {
                    const overallScore = getOverallScore(evaluation.scores);
                    const scorePercent = overallScore * 100;
                    const trend = getScoreTrend(overallScore);
                    const TrendIcon = trend.icon;
                    
                    // 점수별 색상
                    const getScoreColor = (score: number) => {
                      if (score >= 95) return 'bg-green-50 border-green-200 text-green-700';
                      if (score >= 85) return 'bg-blue-50 border-blue-200 text-blue-700';
                      if (score >= 70) return 'bg-yellow-50 border-yellow-200 text-yellow-700';
                      if (score >= 60) return 'bg-orange-50 border-orange-200 text-orange-700';
                      return 'bg-red-50 border-red-200 text-red-700';
                    };
                    
                    return (
                      <TableRow key={evaluation.id} className="border-gray-200">
                        <TableCell>
                          <div className="space-y-0.5">
                            <div className="text-sm truncate text-gray-900">{evaluation.name}</div>
                            <div className="text-xs text-gray-500">
                              ID: {evaluation.id}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-900">{evaluation.datasetName}</TableCell>
                        <TableCell className="text-sm text-gray-900">{evaluation.modelName}</TableCell>
                        <TableCell>
                          <div className={`w-16 h-16 flex items-center justify-center rounded-lg border-2 ${getScoreColor(scorePercent)}`}>
                            <span className="text-xl font-semibold">{scorePercent.toFixed(0)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <TrendIcon className={`h-4 w-4 ${trend.color}`} />
                            <span className={`${trend.color} text-sm font-medium`}>{trend.label}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(evaluation.completedAt!).toLocaleString('ko-KR')}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => onViewResults(evaluation.id)}
                            className="h-9 text-sm border-blue-200 text-blue-600 hover:bg-blue-50"
                          >
                            <Target className="h-3.5 w-3.5 mr-1.5" />
                            결과 보기
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500 h-64">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                          <History className="h-8 w-8 text-gray-500" />
                        </div>
                        <h3 className="text-base text-gray-900">
                          {searchQuery ? '검색 결과가 없습니다' : '완료된 평가 기록이 없습니다'}
                        </h3>
                        {!searchQuery && (
                          <>
                            <p className="text-sm text-gray-600 max-w-md">
                              첫 번째 RAG 평가를 시작하고 성능 분석 결과를 확인해보세요
                            </p>
                            {onNavigate && (
                              <Button 
                                className="mt-2 bg-blue-600 hover:bg-blue-700"
                                onClick={() => onNavigate('new-evaluation')}
                              >
                                <Zap className="h-4 w-4 mr-2" />
                                첫 평가 시작하기
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* 페이지네이션 */}
          {filteredEvaluations.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                총 {filteredEvaluations.length}개 중 {startIndex + 1}-{Math.min(endIndex, filteredEvaluations.length)}개 표시
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    // 첫 페이지, 마지막 페이지, 현재 페이지 근처만 표시
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                    ) {
                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationLink
                            onClick={() => setCurrentPage(pageNumber)}
                            isActive={currentPage === pageNumber}
                            className="cursor-pointer"
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    } else if (
                      pageNumber === currentPage - 2 ||
                      pageNumber === currentPage + 2
                    ) {
                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
      ) : (
        <Card className="border-blue-100 bg-white shadow-sm">
          <CardContent className="flex flex-col items-center justify-center h-96 text-center py-12">
            <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <History className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-lg text-gray-900">완료된 평가 기록이 없습니다</h3>
            <p className="text-gray-600 mt-2 text-sm max-w-md">
              첫 번째 RAG 평가를 시작하고 성능 분석 결과를 확인해보세요. <br />
              평가가 완료되면 여기에 전체 이력이 표시됩니다.
            </p>
            {onNavigate && (
              <Button 
                className="mt-6 bg-blue-600 hover:bg-blue-700"
                onClick={() => onNavigate('new-evaluation')}
                size="lg"
              >
                <Zap className="h-5 w-5 mr-2" />
                첫 평가 시작하기
              </Button>
            )}
          </CardContent>
        </Card>
      )}
      </div>
    </TooltipProvider>
  );
}