import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { 
  GitCompare, 
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  LineChart as LineChartIcon,
  Search,
  RefreshCw,
  Info,
  X,
  ArrowUpDown,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { mockEvaluationHistory, EvaluationHistory } from '../lib/mock-data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line } from 'recharts';

interface ComparisonPageBlueProps {
  onNavigate?: (page: string) => void;
}

export function ComparisonPageBlue({ onNavigate }: ComparisonPageBlueProps = {}) {
  const [selectedEvaluations, setSelectedEvaluations] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');
  const [showHelpBanner, setShowHelpBanner] = useState(true);

  // 함수를 먼저 정의
  const getOverallScore = (scores: Record<string, number>) => {
    const values = Object.values(scores);
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  };

  const completedEvaluations = mockEvaluationHistory
    .filter(e => e.status === 'completed')
    .filter(e => 
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.datasetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.modelName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime();
      } else {
        return getOverallScore(b.scores) - getOverallScore(a.scores);
      }
    });

  const toggleEvaluation = (id: string) => {
    setSelectedEvaluations(prev => {
      if (prev.includes(id)) {
        return prev.filter(evalId => evalId !== id);
      } else {
        if (prev.length >= 4) {
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  const selectedData = completedEvaluations.filter(e => selectedEvaluations.includes(e.id));

  const getComparisonData = () => {
    if (selectedData.length === 0) return [];

    const allMetrics = new Set<string>();
    selectedData.forEach(evaluation => {
      Object.keys(evaluation.scores).forEach(metric => allMetrics.add(metric));
    });

    return Array.from(allMetrics).map(metric => {
      const dataPoint: any = { metric: metric.replace('_', ' ') };
      selectedData.forEach(evaluation => {
        dataPoint[evaluation.name] = (evaluation.scores[metric] || 0) * 100;
      });
      return dataPoint;
    });
  };

  const getRadarData = () => {
    if (selectedData.length === 0) return [];

    const allMetrics = new Set<string>();
    selectedData.forEach(evaluation => {
      Object.keys(evaluation.scores).forEach(metric => allMetrics.add(metric));
    });

    return Array.from(allMetrics).map(metric => {
      const dataPoint: any = { metric: metric.replace('_', ' ') };
      selectedData.forEach(evaluation => {
        dataPoint[evaluation.name] = (evaluation.scores[metric] || 0) * 100;
      });
      return dataPoint;
    });
  };

  const getTrendData = () => {
    return selectedData.map((evaluation, index) => ({
      name: evaluation.name.substring(0, 15) + '...',
      score: getOverallScore(evaluation.scores) * 100,
      date: new Date(evaluation.completedAt!).toLocaleDateString('ko-KR')
    }));
  };

  const getDifference = (eval1: EvaluationHistory, eval2: EvaluationHistory) => {
    const score1 = getOverallScore(eval1.scores);
    const score2 = getOverallScore(eval2.scores);
    const diff = ((score2 - score1) / score1) * 100;
    return diff;
  };

  const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'];

  const handleReset = () => {
    setSelectedEvaluations([]);
    setSearchQuery('');
  };

  const allCompletedEvaluations = mockEvaluationHistory.filter(e => e.status === 'completed');
  const maxSelectionReached = selectedEvaluations.length >= 4;

  return (
    <TooltipProvider>
      <div className="space-y-6 max-w-7xl bg-gray-50/30 -m-6 p-6">
        <div>
          <h1 className="text-gray-900 font-bold text-[24px]">결과 비교</h1>
          <p className="text-gray-600 mt-1 text-sm">
            여러 평가 결과를 선택하여 성능을 비교하고 인사이트를 얻으세요
          </p>
        </div>

        {/* 도움말 배너 */}
        {showHelpBanner && allCompletedEvaluations.length > 0 && (
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="flex items-start justify-between gap-2">
              <span className="text-sm text-blue-900">
                최대 <strong>4개</strong>의 평가를 선택하여 비교할 수 있습니다. 
                첫 번째 선택한 평가가 <strong>기준점</strong>이 되어 나머지 평가와 성능 차이를 계산합니다.
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 평가 선택 패널 */}
        <Card className="lg:col-span-1 border-blue-100 bg-white shadow-sm">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  평가 선택
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">최대 4개까지 선택 가능</p>
                    </TooltipContent>
                  </UITooltip>
                </CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  비교할 평가를 선택하세요 ({selectedEvaluations.length}/4)
                </CardDescription>
              </div>
              {selectedEvaluations.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="shrink-0 text-xs h-8 border-gray-300"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  초기화
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {/* 검색 및 정렬 */}
            {allCompletedEvaluations.length > 0 && (
              <div className="space-y-2 pb-2 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                  <Input
                    placeholder="평가 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 text-sm border-gray-300"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-3.5 w-3.5 text-gray-500" />
                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'date' | 'score')}>
                    <SelectTrigger className="h-8 text-xs border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">최신순</SelectItem>
                      <SelectItem value="score">점수순</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* 최대 선택 알림 */}
            {maxSelectionReached && (
              <Alert className="border-amber-200 bg-amber-50 py-2">
                <CheckCircle2 className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-xs text-amber-900">
                  최대 4개까지 선택되었습니다
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              {completedEvaluations.length > 0 ? (
                completedEvaluations.map((evaluation, index) => {
                  const isSelected = selectedEvaluations.includes(evaluation.id);
                  const isDisabled = !isSelected && maxSelectionReached;
                  
                  return (
                    <div
                      key={evaluation.id}
                      className={`p-3 border rounded-lg transition-all ${
                        isDisabled 
                          ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                          : isSelected
                            ? 'border-blue-400 bg-blue-50 shadow-sm cursor-pointer'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 cursor-pointer'
                      }`}
                      onClick={() => !isDisabled && toggleEvaluation(evaluation.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => !isDisabled && toggleEvaluation(evaluation.id)}
                          className="mt-1"
                          disabled={isDisabled}
                        />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            {isSelected && (
                              <UITooltip>
                                <TooltipTrigger asChild>
                                  <div 
                                    className="w-3 h-3 rounded-full cursor-help" 
                                    style={{ backgroundColor: colors[selectedEvaluations.indexOf(evaluation.id)] }}
                                  />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">
                                    {selectedEvaluations.indexOf(evaluation.id) === 0 ? '기준점' : `비교 ${selectedEvaluations.indexOf(evaluation.id)}`}
                                  </p>
                                </TooltipContent>
                              </UITooltip>
                            )}
                            <span className="text-sm text-gray-900 line-clamp-1">{evaluation.name}</span>
                          </div>
                          <div className="text-xs text-gray-600">
                            {new Date(evaluation.completedAt!).toLocaleDateString('ko-KR')}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className="text-xs bg-blue-100 text-blue-700 border-blue-200 border">
                              {(getOverallScore(evaluation.scores) * 100).toFixed(0)}점
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : searchQuery ? (
                <div className="text-center text-gray-500 py-8 text-sm">
                  <Search className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>검색 결과가 없습니다</p>
                </div>
              ) : allCompletedEvaluations.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <GitCompare className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <h3 className="text-sm text-gray-900 mb-1">비교할 평가 기록이 없습니다</h3>
                  <p className="text-xs text-gray-600 mb-4">
                    먼저 평가를 완료해주세요
                  </p>
                  {onNavigate && (
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => onNavigate('evaluation-history')}
                    >
                      <Zap className="h-3.5 w-3.5 mr-1.5" />
                      평가 이력 보기
                    </Button>
                  )}
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {/* 비교 결과 패널 */}
        <div className="lg:col-span-2 space-y-6">
          {selectedData.length === 0 ? (
            <Card className="border-blue-100 bg-white shadow-sm">
              <CardContent className="flex flex-col items-center justify-center h-96 text-center">
                <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <GitCompare className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-gray-900 mb-2">평가를 선택하여 비교를 시작하세요</h3>
                <p className="text-gray-600 text-sm max-w-md">
                  왼쪽에서 최소 2개의 평가를 선택하면 비교 결과가 표시됩니다
                </p>
                {allCompletedEvaluations.length === 0 && onNavigate && (
                  <Button
                    className="mt-6 bg-blue-600 hover:bg-blue-700"
                    onClick={() => onNavigate('evaluation-history')}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    평가 이력에서 선택하기
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : selectedData.length === 1 ? (
            <Card className="border-blue-100 bg-white shadow-sm">
              <CardContent className="flex flex-col items-center justify-center h-96 text-center">
                <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <GitCompare className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-gray-900 mb-2">하나 더 선택해주세요</h3>
                <p className="text-gray-600 text-sm max-w-md">
                  비교하려면 최소 2개의 평가를 선택해야 합니다
                </p>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-900">
                    💡 팁: 다양한 모델이나 설정의 평가를 비교하면 최적의 구성을 찾을 수 있습니다
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* 종합 점수 비교 */}
              <Card className="border-blue-100 bg-white shadow-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-gray-900 flex items-center gap-2">
                    종합 점수 비교
                    <UITooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">12개 RAG 지표의 평균값</p>
                      </TooltipContent>
                    </UITooltip>
                  </CardTitle>
                  <CardDescription className="text-gray-600">선택한 평가들의 전체 성능 비교</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    {selectedData.map((evaluation, index) => {
                      const overallScore = getOverallScore(evaluation.scores);
                      return (
                        <div key={evaluation.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: colors[index] }}
                              />
                              <span className="text-sm text-gray-900 font-medium">{evaluation.name}</span>
                            </div>
                          </div>
                          <div className="text-3xl font-semibold text-gray-900 mb-1">{(overallScore * 100).toFixed(0)}점</div>
                          <div className="text-xs text-gray-600 mb-3">
                            {evaluation.modelName}
                          </div>
                          {index > 0 && (
                            <div className="flex items-center gap-1 text-sm">
                              {(() => {
                                const diff = getDifference(selectedData[0], evaluation);
                                if (diff > 0) {
                                  return (
                                    <>
                                      <TrendingUp className="h-4 w-4 text-green-600" />
                                      <span className="text-green-600 font-medium">+{diff.toFixed(1)}%</span>
                                    </>
                                  );
                                } else if (diff < 0) {
                                  return (
                                    <>
                                      <TrendingDown className="h-4 w-4 text-red-600" />
                                      <span className="text-red-600 font-medium">{diff.toFixed(1)}%</span>
                                    </>
                                  );
                                } else {
                                  return (
                                    <>
                                      <Minus className="h-4 w-4 text-gray-500" />
                                      <span className="text-gray-500">동일</span>
                                    </>
                                  );
                                }
                              })()}
                              <span className="text-gray-600 ml-1">vs 첫 번째</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* 지표별 막대 차트 */}
              <Card className="border-blue-100 bg-white shadow-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <BarChart3 className="h-5 w-5" />
                    지표별 상세 비교
                  </CardTitle>
                  <CardDescription className="text-gray-600">각 평가 지표별 점수 비교</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={getComparisonData()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgb(209, 213, 219)" />
                        <XAxis 
                          dataKey="metric" 
                          angle={-45}
                          textAnchor="end"
                          height={100}
                          tick={{ fill: 'rgb(107, 114, 128)', fontSize: 11 }}
                        />
                        <YAxis domain={[0, 100]} tick={{ fill: 'rgb(107, 114, 128)' }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid rgb(229, 231, 235)',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                          }}
                        />
                        <Legend />
                        {selectedData.map((evaluation, index) => (
                          <Bar
                            key={evaluation.id}
                            dataKey={evaluation.name}
                            fill={colors[index]}
                            radius={[4, 4, 0, 0]}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* 레이더 차트 */}
              <Card className="border-blue-100 bg-white shadow-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-gray-900">성능 프로필 비교</CardTitle>
                  <CardDescription className="text-gray-600">전체 성능 밸런스 한눈에 보기</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <ResponsiveContainer width="100%" height={400}>
                      <RadarChart data={getRadarData()}>
                        <PolarGrid stroke="rgb(156, 163, 175)" strokeOpacity={0.3} />
                        <PolarAngleAxis dataKey="metric" tick={{ fill: 'rgb(55, 65, 81)', fontSize: 12 }} />
                        <PolarRadiusAxis domain={[0, 100]} tick={{ fill: 'rgb(107, 114, 128)' }} />
                        {selectedData.map((evaluation, index) => (
                          <Radar
                            key={evaluation.id}
                            name={evaluation.name}
                            dataKey={evaluation.name}
                            stroke={colors[index]}
                            fill={colors[index]}
                            fillOpacity={0.3}
                            strokeWidth={2}
                          />
                        ))}
                        <Legend />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid rgb(229, 231, 235)',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                          }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* 점수 추이 */}
              {selectedData.length >= 2 && (
                <Card className="border-blue-100 bg-white shadow-sm">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                      <LineChartIcon className="h-5 w-5" />
                      성능 변화 추이
                    </CardTitle>
                    <CardDescription className="text-gray-600">시간에 따른 점수 변화</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={getTrendData()}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgb(209, 213, 219)" />
                          <XAxis dataKey="name" tick={{ fill: 'rgb(107, 114, 128)' }} />
                          <YAxis domain={[0, 100]} tick={{ fill: 'rgb(107, 114, 128)' }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid rgb(229, 231, 235)',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="score" 
                            stroke="#8b5cf6" 
                            strokeWidth={2}
                            dot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* AI 인사이트 */}
              <Card className="border-blue-100 bg-white shadow-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-gray-900">비교 인사이트</CardTitle>
                  <CardDescription className="text-gray-600">AI가 분석한 주요 차이점</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="text-blue-900 mb-1 font-medium">최고 성능</h4>
                        <p className="text-sm text-blue-700">
                          {selectedData.reduce((best, current) => 
                            getOverallScore(current.scores) > getOverallScore(best.scores) ? current : best
                          ).name}이(가) 가장 높은 종합 점수를 기록했습니다.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <BarChart3 className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div>
                        <h4 className="text-amber-900 mb-1 font-medium">성능 편차</h4>
                        <p className="text-sm text-amber-700">
                          선택한 평가들 간 최대 {Math.max(...selectedData.map((e, i) => 
                            i > 0 ? Math.abs(getDifference(selectedData[0], e)) : 0
                          )).toFixed(1)}%의 성능 차이가 있습니다.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <GitCompare className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="text-green-900 mb-1 font-medium">추천</h4>
                        <p className="text-sm text-green-700">
                          가장 최근 평가에서 성능 개선이 확인되었습니다. 현재 설정을 유지하는 것을 권장합니다.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
      </div>
    </TooltipProvider>
  );
}
