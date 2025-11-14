import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { 
  Link2, 
  Beaker, 
  ArrowRight, 
  Zap, 
  CheckCircle2,
  Clock,
  DollarSign,
  Target,
  Lightbulb
} from 'lucide-react';
import { Badge } from './ui/badge';
import { TooltipProvider } from './ui/tooltip';

interface EvaluationModeSelectionPageProps {
  onSelectMode: (mode: 'external' | 'internal') => void;
}

export function EvaluationModeSelectionPage({
  onSelectMode
}: EvaluationModeSelectionPageProps) {
  return (
    <TooltipProvider>
      <div className="space-y-4 bg-gray-50/30 -m-6 p-6">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-gray-900 font-bold text-[24px]">평가하기</h1>
          <p className="text-gray-600 mt-1 text-sm">
            평가 방식을 선택하세요. 목적에 맞는 평가 모드로 최적의 결과를 얻으실 수 있습니다.
          </p>
        </div>

        {/* 모드 선택 카드 */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* 연동 평가 카드 */}
          <Card 
            className="border-2 border-blue-200 hover:border-blue-400 transition-all hover:shadow-xl bg-white group"
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between mb-3">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Link2 className="h-7 w-7 text-white" />
                </div>
                <Badge className="bg-white text-blue-700 border-blue-300 border">
                  운영 환경
                </Badge>
              </div>
              <CardTitle className="text-gray-900 text-xl">
                External 모드(연동된 시스템 평가)
              </CardTitle>
              <CardDescription className="text-gray-600">
                이미 운영 중인 RAG 시스템의 성능을 측정하고 모니터링합니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 주요 특징 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  <span>API endpoint로 간편 연결</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  <span>VectorDB/하이퍼파라미터 설정 불필요</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  <span>빠른 평가 (3-4단계)</span>
                </div>
              </div>

              {/* 워크플로우 */}
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <p className="text-xs font-medium text-blue-900 mb-2">📋 평가 프로세스</p>
                <div className="flex items-center gap-1 text-xs text-blue-700">
                  <span>데이터셋</span>
                  <ArrowRight className="h-3 w-3" />
                  <span>API 연동</span>
                  <ArrowRight className="h-3 w-3" />
                  <span>평가 지표</span>
                  <ArrowRight className="h-3 w-3" />
                  <span>실행</span>
                </div>
              </div>

              {/* 사용 사례 */}
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-xs font-medium text-blue-900 mb-2 flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  추천 사용 사례
                </p>
                <div className="space-y-1 text-xs text-blue-800">
                  <p>• 프로덕션 시스템 주간/월간 헬스체크</p>
                  <p>• 릴리즈 전 성능 검증</p>
                  <p>• 일일 성능 모니터링</p>
                </div>
              </div>

              {/* 예상 시간 & 비용 */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white rounded border border-blue-200 p-2">
                  <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                    <Clock className="h-3 w-3" />
                    예상 시간
                  </div>
                  <p className="text-sm font-bold text-blue-600">5-10분</p>
                </div>
                <div className="bg-white rounded border border-blue-200 p-2">
                  <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                    <DollarSign className="h-3 w-3" />
                    예상 비용
                  </div>
                  <p className="text-sm font-bold text-blue-600">LLM Judge만</p>
                </div>
              </div>

              <Button 
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white group-hover:shadow-md transition-all"
                onClick={() => onSelectMode('external')}
              >
                연동 평가 시작하기
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* 신규 평가 카드 */}
          <Card 
            className="border-2 border-purple-200 hover:border-purple-400 transition-all hover:shadow-xl bg-white group"
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between mb-3">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Beaker className="h-7 w-7 text-white" />
                </div>
                <Badge className="bg-white text-purple-700 border-purple-300 border">
                  실험 환경
                </Badge>
              </div>
              <CardTitle className="text-gray-900 text-xl">
                Internal 모드(RAG 최적 설정 탐색)
              </CardTitle>
              <CardDescription className="text-gray-600">
                시스템 도입 전 최고 성능의 RAG 파이프라인을 찾는 실험
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 주요 특징 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="h-4 w-4 text-purple-600" />
                  <span>VectorDB 및 모델 선택</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="h-4 w-4 text-purple-600" />
                  <span>RAG 하이퍼파라미터 세밀 조정</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="h-4 w-4 text-purple-600" />
                  <span>상세 설정 (6단계)</span>
                </div>
              </div>

              {/* 워크플로우 */}
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                <p className="text-xs font-medium text-purple-900 mb-2">🔬 평가 프로세스</p>
                <div className="grid grid-cols-2 gap-1 text-xs text-purple-700">
                  <div className="flex items-center gap-1">
                    <span>1. 데이터셋</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>2. 모델/DB</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>3. RAG 설정</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>4. 평가 지표</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>5. AI 분석</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>6. 실행</span>
                  </div>
                </div>
              </div>

              {/* 사용 사례 */}
              <div className="bg-white rounded-lg p-3 border border-purple-100">
                <p className="text-xs font-medium text-purple-900 mb-2 flex items-center gap-1">
                  <Lightbulb className="h-3 w-3" />
                  추천 사용 사례
                </p>
                <div className="space-y-1 text-xs text-purple-800">
                  <p>• 최적 하이퍼파라미터 조합 찾기</p>
                  <p>• 여러 모델 성능 비교 실험</p>
                  <p>• 청크 전략 및 검색 알고리즘 테스트</p>
                </div>
              </div>

              {/* 예상 시간 & 비용 */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white rounded border border-purple-200 p-2">
                  <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                    <Clock className="h-3 w-3" />
                    예상 시간
                  </div>
                  <p className="text-sm font-bold text-purple-600">10-20분</p>
                </div>
                <div className="bg-white rounded border border-purple-200 p-2">
                  <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                    <DollarSign className="h-3 w-3" />
                    예상 비용
                  </div>
                  <p className="text-sm font-bold text-purple-600">RAG + Judge</p>
                </div>
              </div>

              <Button 
                className="w-full h-11 bg-purple-600 hover:bg-purple-700 text-white group-hover:shadow-md transition-all"
                onClick={() => onSelectMode('internal')}
              >
                RAG 최적 설정 탐색 시작하기
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 비교 표 */}
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-900">
              모드별 비교
            </CardTitle>
            <CardDescription className="text-gray-600 text-sm">
              두 평가 모드의 주요 차이점을 확인하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-gray-700">항목</th>
                    <th className="text-center py-2 px-3 text-blue-700">External 모드</th>
                    <th className="text-center py-2 px-3 text-purple-700">Internal 모드</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600">
                  <tr className="border-b border-gray-100">
                    <td className="py-2 px-3 font-medium">목적</td>
                    <td className="py-2 px-3 text-center">운영 시스템 모니터링</td>
                    <td className="py-2 px-3 text-center">최적 설정 탐색</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 px-3 font-medium">VectorDB 설정</td>
                    <td className="py-2 px-3 text-center text-green-600">불필요</td>
                    <td className="py-2 px-3 text-center text-blue-600">필요</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 px-3 font-medium">하이퍼파라미터</td>
                    <td className="py-2 px-3 text-center text-green-600">불필요</td>
                    <td className="py-2 px-3 text-center text-blue-600">세밀 조정</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 px-3 font-medium">설정 단계</td>
                    <td className="py-2 px-3 text-center">3-4단계</td>
                    <td className="py-2 px-3 text-center">6단계</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 px-3 font-medium">예상 비용</td>
                    <td className="py-2 px-3 text-center">낮음 (LLM Judge만)</td>
                    <td className="py-2 px-3 text-center">중간 (RAG + Judge)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">추천 빈도</td>
                    <td className="py-2 px-3 text-center">주간/일일</td>
                    <td className="py-2 px-3 text-center">필요 시</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* 도움말 */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-gray-900 mb-2">💡 선택이 어려우신가요?</h3>
              <div className="text-sm text-gray-700 space-y-1">
                <p className="text-[14px]">• <strong>이미 RAG 시스템이 운영 중</strong>이라면 → <span className="text-blue-600 font-semibold">External 모드(연동된 시스템 평가)</span>를 선택하세요</p>
                <p className="text-[14px]">• <strong>새로운 RAG 시스템을 구축 중</strong>이거나 <strong>최적 설정을 찾고 싶다면</strong> → <span className="text-purple-600 font-semibold">Internal 모드(RAG 최적 설정 탐색)</span>를 선택하세요</p>
                <p className="text-[14px]">• <strong>두 가지 모두 활용 가능</strong>: Internal 모드로 최적 설정을 찾은 후, External 모드로 운영 모니터링</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}