import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Trophy, 
  TrendingUp,
  CheckCircle2,
  Settings,
  ArrowRight,
  Download,
  Zap,
  Target,
  Award
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Progress } from './ui/progress';

interface AutoImproveResultsPageBlueProps {
  onApplyConfig?: () => void;
}

export function AutoImproveResultsPageBlue({ onApplyConfig }: AutoImproveResultsPageBlueProps) {
  const [sortBy, setSortBy] = useState<'rank' | 'faithfulness' | 'answer_relevancy'>('rank');

  // 모의 실험 결과 데이터
  const experimentResults = [
    {
      id: 'exp-1',
      rank: 1,
      parameters: {
        llmModel: 'Claude-3.5 Sonnet',
        temperature: 0.3,
        chunkSize: 256,
        embeddingModel: 'text-embedding-3-large'
      },
      scores: {
        faithfulness: 0.96,
        answer_relevancy: 0.94,
        context_precision: 0.97,
        context_recall: 0.95,
        answer_correctness: 0.94,
        coherence: 0.95,
        conciseness: 0.92
      },
      avgScore: 0.948
    },
    {
      id: 'exp-2',
      rank: 2,
      parameters: {
        llmModel: 'GPT-4o',
        temperature: 0.3,
        chunkSize: 256,
        embeddingModel: 'text-embedding-3-large'
      },
      scores: {
        faithfulness: 0.94,
        answer_relevancy: 0.93,
        context_precision: 0.96,
        context_recall: 0.94,
        answer_correctness: 0.93,
        coherence: 0.94,
        conciseness: 0.91
      },
      avgScore: 0.936
    },
    {
      id: 'exp-3',
      rank: 3,
      parameters: {
        llmModel: 'GPT-4o',
        temperature: 0.5,
        chunkSize: 256,
        embeddingModel: 'text-embedding-3-small'
      },
      scores: {
        faithfulness: 0.92,
        answer_relevancy: 0.91,
        context_precision: 0.95,
        context_recall: 0.93,
        answer_correctness: 0.91,
        coherence: 0.93,
        conciseness: 0.89
      },
      avgScore: 0.920
    },
    {
      id: 'exp-4',
      rank: 4,
      parameters: {
        llmModel: 'Claude-3 Opus',
        temperature: 0.3,
        chunkSize: 512,
        embeddingModel: 'text-embedding-ada-002'
      },
      scores: {
        faithfulness: 0.90,
        answer_relevancy: 0.89,
        context_precision: 0.93,
        context_recall: 0.91,
        answer_correctness: 0.89,
        coherence: 0.91,
        conciseness: 0.87
      },
      avgScore: 0.900
    },
    {
      id: 'exp-5',
      rank: 5,
      parameters: {
        llmModel: 'GPT-4o-mini',
        temperature: 0.7,
        chunkSize: 512,
        embeddingModel: 'text-embedding-ada-002'
      },
      scores: {
        faithfulness: 0.87,
        answer_relevancy: 0.86,
        context_precision: 0.91,
        context_recall: 0.89,
        answer_correctness: 0.86,
        coherence: 0.88,
        conciseness: 0.85
      },
      avgScore: 0.874
    }
  ];

  const bestExperiment = experimentResults[0];
  const baselineScore = 0.88; // 기존 평가 점수

  const handleApplyConfig = (experiment: typeof experimentResults[0]) => {
    alert(`다음 설정이 적용되었습니다:\n\nLLM 모델: ${experiment.parameters.llmModel}\nTemperature: ${experiment.parameters.temperature}\nChunk Size: ${experiment.parameters.chunkSize}\nEmbedding: ${experiment.parameters.embeddingModel}\n\n평가 설정 화면으로 이동합니다.`);
    onApplyConfig?.();
  };

  return (
    <div className="space-y-6 max-w-7xl bg-gray-50/30 -m-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 font-bold text-[24px]">자동 개선 결과</h1>
          <p className="text-gray-600 mt-1 text-sm">
            총 {experimentResults.length}개의 실험이 완료되었습니다
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          결과 다운로드
        </Button>
      </div>

      {/* 최고 성능 카드 */}
      <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-yellow-500 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-yellow-900 text-lg flex items-center gap-2">
                  최고 성능 설정
                  <Badge className="bg-yellow-200 text-yellow-900 border-yellow-300 border">
                    🏆 1위
                  </Badge>
                </CardTitle>
                <CardDescription className="text-yellow-800 text-sm">
                  목표 지표(Answer Relevancy)에서 가장 높은 점수를 기록했습니다
                </CardDescription>
              </div>
            </div>
            <Button 
              onClick={() => handleApplyConfig(bestExperiment)}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              이 설정 적용하기
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-yellow-900 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                파라미터 설정
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-white/60 rounded border border-yellow-200">
                  <span className="text-xs text-gray-700">LLM 모델</span>
                  <Badge variant="outline" className="border-yellow-400 text-yellow-900">
                    {bestExperiment.parameters.llmModel}
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-white/60 rounded border border-yellow-200">
                  <span className="text-xs text-gray-700">Temperature</span>
                  <Badge variant="outline" className="border-yellow-400 text-yellow-900">
                    {bestExperiment.parameters.temperature}
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-white/60 rounded border border-yellow-200">
                  <span className="text-xs text-gray-700">Chunk Size</span>
                  <Badge variant="outline" className="border-yellow-400 text-yellow-900">
                    {bestExperiment.parameters.chunkSize}
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-white/60 rounded border border-yellow-200">
                  <span className="text-xs text-gray-700">Embedding 모델</span>
                  <Badge variant="outline" className="border-yellow-400 text-yellow-900 text-xs">
                    {bestExperiment.parameters.embeddingModel}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-yellow-900 flex items-center gap-2">
                <Target className="h-4 w-4" />
                성능 개선 결과
              </h4>
              <div className="space-y-3">
                <div className="p-3 bg-white/60 rounded-lg border border-yellow-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-700">목표 지표 (Answer Relevancy)</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {(baselineScore * 100).toFixed(0)}%
                      </span>
                      <ArrowRight className="h-3 w-3 text-green-600" />
                      <span className="text-sm font-medium text-green-700">
                        {(bestExperiment.scores.answer_relevancy * 100).toFixed(0)}%
                      </span>
                      <Badge className="bg-green-100 text-green-700 border-green-300 border text-xs">
                        +{((bestExperiment.scores.answer_relevancy - baselineScore) * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                  <Progress 
                    value={bestExperiment.scores.answer_relevancy * 100} 
                    className="h-2"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 bg-white/60 rounded border border-yellow-200 text-center">
                    <p className="text-xs text-gray-600">Faithfulness</p>
                    <p className="text-sm font-medium text-gray-900">
                      {(bestExperiment.scores.faithfulness * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div className="p-2 bg-white/60 rounded border border-yellow-200 text-center">
                    <p className="text-xs text-gray-600">Coherence</p>
                    <p className="text-sm font-medium text-gray-900">
                      {(bestExperiment.scores.coherence * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div className="p-2 bg-white/60 rounded border border-yellow-200 text-center">
                    <p className="text-xs text-gray-600">평균 점수</p>
                    <p className="text-sm font-medium text-gray-900">
                      {(bestExperiment.avgScore * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 전체 실험 결과 리더보드 */}
      <Card className="border-blue-100 bg-white shadow-sm">
        <CardHeader className="pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Award className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-base text-gray-900">실험 결과 리더보드</CardTitle>
                <CardDescription className="text-xs text-gray-600">
                  모든 파라미터 조합의 성능을 비교합니다
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">순위</TableHead>
                  <TableHead>LLM 모델</TableHead>
                  <TableHead className="text-center">Temperature</TableHead>
                  <TableHead className="text-center">Chunk Size</TableHead>
                  <TableHead>Embedding 모델</TableHead>
                  <TableHead className="text-center">Answer Relevancy</TableHead>
                  <TableHead className="text-center">Faithfulness</TableHead>
                  <TableHead className="text-center">평균 점수</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {experimentResults.map((exp, index) => (
                  <TableRow 
                    key={exp.id}
                    className={index === 0 ? 'bg-yellow-50/50' : ''}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {index === 0 && <Trophy className="h-4 w-4 text-yellow-600" />}
                        {index === 1 && <Award className="h-4 w-4 text-gray-400" />}
                        {index === 2 && <Award className="h-4 w-4 text-orange-600" />}
                        <span className="text-sm font-medium">{exp.rank}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-blue-300 text-blue-700 text-xs">
                        {exp.parameters.llmModel}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-sm">{exp.parameters.temperature}</TableCell>
                    <TableCell className="text-center text-sm">{exp.parameters.chunkSize}</TableCell>
                    <TableCell>
                      <span className="text-xs text-gray-700">{exp.parameters.embeddingModel}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-sm font-medium">
                          {(exp.scores.answer_relevancy * 100).toFixed(1)}%
                        </span>
                        {exp.scores.answer_relevancy > baselineScore && (
                          <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {(exp.scores.faithfulness * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        className={`${
                          index === 0 
                            ? 'bg-green-100 text-green-700 border-green-300' 
                            : 'bg-gray-100 text-gray-700 border-gray-300'
                        } border text-xs`}
                      >
                        {(exp.avgScore * 100).toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleApplyConfig(exp)}
                        className="text-xs"
                      >
                        적용
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 인사이트 및 권장사항 */}
      <Card className="border-blue-100 bg-white shadow-sm">
        <CardHeader className="pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Zap className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-base text-gray-900">인사이트 및 권장사항</CardTitle>
              <CardDescription className="text-xs text-gray-600">
                실험 결과를 기반으로 한 주요 발견사항
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-3">
            <div className="flex gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-900">최적 Temperature 값</p>
                <p className="text-xs text-green-800 mt-1">
                  Temperature 0.3에서 가장 높은 일관성과 정확도를 보였습니다. 
                  낮은 Temperature는 환각을 줄이고 Faithfulness를 향상시킵니다.
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Chunk Size의 영향</p>
                <p className="text-xs text-blue-800 mt-1">
                  256 토큰의 작은 청크 크기가 더 정확한 검색 결과를 제공했습니다. 
                  작은 청크는 Context Precision을 향상시킵니다.
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <CheckCircle2 className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-purple-900">Embedding 모델 선택</p>
                <p className="text-xs text-purple-800 mt-1">
                  text-embedding-3-large 모델이 가장 우수한 검색 성능을 보였습니다. 
                  더 큰 임베딩 차원이 의미적 유사도를 더 잘 포착합니다.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}