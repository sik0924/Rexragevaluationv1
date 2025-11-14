# LLM Judge 샘플링 설정 UI 구현 가이드

## 개요
V1.0에서 LLM Judge 비용 폭증을 방지하기 위한 샘플링 설정 UI를 NewEvaluationPageBlue.tsx에 추가합니다.

## 1. State 추가 (완료 ✅)

NewEvaluationPageBlue.tsx의 88줄 근처에 다음 state가 추가되었습니다:

```typescript
// LLM Judge 샘플링 설정 (V1.0)
const [llmJudgeSamplingEnabled, setLlmJudgeSamplingEnabled] = useState(true);
const [llmJudgeSamplingMode, setLlmJudgeSamplingMode] = useState<'auto' | 'fixed_ratio' | 'max_cases'>('auto');
const [llmJudgeFixedRatio, setLlmJudgeFixedRatio] = useState(20); // 20%
const [llmJudgeMaxCases, setLlmJudgeMaxCases] = useState(100);
const [showAdvancedDiagnosis, setShowAdvancedDiagnosis] = useState(false);
```

## 2. UI 컴포넌트 추가할 위치

NewEvaluationPageBlue.tsx에서 **RAG 하이퍼파라미터 설정 섹션 바로 아래**에 추가합니다.

### 예상 위치
```typescript
{/* Step 4: RAG Hyperparameters */}
<Card>
  ...
</Card>

{/* 🆕 Step 5: LLM Judge 분석 설정 */}
<Card className="border-l-4 border-l-blue-500 bg-white shadow-sm">
  ...
</Card>

{/* 평가 시작 버튼 */}
<Button onClick={handleStartEvaluation}>
  평가 시작
</Button>
```

## 3. UI 컴포넌트 코드

다음 코드를 NewEvaluationPageBlue.tsx의 적절한 위치에 추가하세요:

```tsx
{/* Step 5: LLM Judge 분석 설정 */}
<Card className="border-l-4 border-l-purple-500 bg-white shadow-sm">
  <CardHeader className="pb-3">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <CardTitle className="flex items-center gap-2 text-base text-gray-900">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500 text-white text-sm shrink-0">
            5
          </div>
          LLM Judge 분석 설정
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 ml-2">
            비용 절감
          </Badge>
        </CardTitle>
        <CardDescription className="text-sm ml-10 text-gray-600">
          실패 케이스 진단 방법과 샘플링 비율을 설정하세요
        </CardDescription>
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help">
            <HelpCircle className="h-4 w-4 text-gray-400 hover:text-purple-600 transition-colors" />
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-sm font-medium">LLM Judge 샘플링이란?</p>
          <p className="text-xs text-gray-400 mt-1">
            모든 실패 케이스를 LLM Judge로 분석하면 비용이 많이 듭니다. 
            휴리스틱 필터링과 샘플링으로 90% 이상의 비용을 절감할 수 있습니다.
          </p>
        </TooltipContent>
      </Tooltip>
    </div>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* 샘플링 활성화 토글 */}
    <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
      <div className="flex-1">
        <Label htmlFor="llm-judge-sampling" className="text-sm font-medium text-purple-900">
          실패 케이스 자동 진단 활성화
        </Label>
        <p className="text-xs text-purple-700 mt-1">
          LLM Judge가 실패 케이스의 근본 원인을 분석하고 개선 조언을 제공합니다
        </p>
      </div>
      <Switch
        id="llm-judge-sampling"
        checked={llmJudgeSamplingEnabled}
        onCheckedChange={setLlmJudgeSamplingEnabled}
      />
    </div>

    {llmJudgeSamplingEnabled && (
      <>
        {/* 샘플링 모드 선택 */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">샘플링 모드</Label>
          <div className="grid grid-cols-1 gap-3">
            {/* 자동 모드 */}
            <div
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                llmJudgeSamplingMode === 'auto'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
              onClick={() => setLlmJudgeSamplingMode('auto')}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="sampling-mode"
                  checked={llmJudgeSamplingMode === 'auto'}
                  onChange={() => setLlmJudgeSamplingMode('auto')}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">자동 (권장)</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      최적화됨
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    실패 케이스 수에 따라 샘플링 비율을 자동 조정합니다
                  </p>
                  <div className="mt-2 p-2 bg-white rounded border border-purple-200">
                    <p className="text-xs text-purple-700">
                      • 50개 이하: 100% 전체 분석 <br />
                      • 50~200개: 50% 샘플링 <br />
                      • 200개 이상: 20% 샘플링
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 고정 비율 모드 */}
            <div
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                llmJudgeSamplingMode === 'fixed_ratio'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
              onClick={() => setLlmJudgeSamplingMode('fixed_ratio')}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="sampling-mode"
                  checked={llmJudgeSamplingMode === 'fixed_ratio'}
                  onChange={() => setLlmJudgeSamplingMode('fixed_ratio')}
                  className="mt-1"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">고정 비율</span>
                  <p className="text-xs text-gray-600 mt-1">
                    지정한 비율만큼 무작위로 샘플링합니다
                  </p>
                  {llmJudgeSamplingMode === 'fixed_ratio' && (
                    <div className="mt-3 space-y-2">
                      <Label htmlFor="sampling-ratio" className="text-xs text-gray-700">
                        샘플링 비율: {llmJudgeFixedRatio}%
                      </Label>
                      <Slider
                        id="sampling-ratio"
                        value={[llmJudgeFixedRatio]}
                        onValueChange={(value) => setLlmJudgeFixedRatio(value[0])}
                        min={5}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>5%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 최대 케이스 수 모드 */}
            <div
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                llmJudgeSamplingMode === 'max_cases'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
              onClick={() => setLlmJudgeSamplingMode('max_cases')}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="sampling-mode"
                  checked={llmJudgeSamplingMode === 'max_cases'}
                  onChange={() => setLlmJudgeSamplingMode('max_cases')}
                  className="mt-1"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">최대 케이스 수</span>
                  <p className="text-xs text-gray-600 mt-1">
                    분석할 최대 케이스 개수를 지정합니다
                  </p>
                  {llmJudgeSamplingMode === 'max_cases' && (
                    <div className="mt-3">
                      <Label htmlFor="max-cases" className="text-xs text-gray-700">
                        최대 분석 케이스
                      </Label>
                      <Input
                        id="max-cases"
                        type="number"
                        value={llmJudgeMaxCases}
                        onChange={(e) => setLlmJudgeMaxCases(parseInt(e.target.value) || 100)}
                        min={1}
                        max={1000}
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 예상 비용 안내 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">예상 비용 안내</p>
              <p className="text-xs text-blue-700 mt-1">
                {llmJudgeSamplingMode === 'auto' && '자동 모드는 실패 케이스 수에 따라 최적의 비율로 비용을 절감합니다.'}
                {llmJudgeSamplingMode === 'fixed_ratio' && `${llmJudgeFixedRatio}% 샘플링 시, 약 ${(llmJudgeFixedRatio / 100 * 3.5).toFixed(2)}$의 비용이 예상됩니다. (100개 실패 케이스 기준)`}
                {llmJudgeSamplingMode === 'max_cases' && `최대 ${llmJudgeMaxCases}개 케이스 분석 시, 약 ${(llmJudgeMaxCases * 0.035).toFixed(2)}$의 비용이 예상됩니다.`}
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="bg-white rounded p-2 border border-blue-200">
                  <p className="text-xs text-blue-700">예상 분석 케이스</p>
                  <p className="text-sm font-bold text-blue-900 mt-0.5">
                    {llmJudgeSamplingMode === 'auto' && '상황별 자동'}
                    {llmJudgeSamplingMode === 'fixed_ratio' && `~${llmJudgeFixedRatio}%`}
                    {llmJudgeSamplingMode === 'max_cases' && `최대 ${llmJudgeMaxCases}개`}
                  </p>
                </div>
                <div className="bg-white rounded p-2 border border-blue-200">
                  <p className="text-xs text-blue-700">비용 절감율</p>
                  <p className="text-sm font-bold text-green-600 mt-0.5">
                    {llmJudgeSamplingMode === 'auto' && '~80%'}
                    {llmJudgeSamplingMode === 'fixed_ratio' && `~${100 - llmJudgeFixedRatio}%`}
                    {llmJudgeSamplingMode === 'max_cases' && '상황별'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 고급 설정 (선택사항) */}
        <div className="border-t border-gray-200 pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvancedDiagnosis(!showAdvancedDiagnosis)}
            className="text-gray-600 hover:text-purple-600"
          >
            {showAdvancedDiagnosis ? <X className="h-4 w-4 mr-2" /> : <Settings className="h-4 w-4 mr-2" />}
            고급 설정 {showAdvancedDiagnosis ? '닫기' : '열기'}
          </Button>
          
          {showAdvancedDiagnosis && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
              <p className="text-xs text-gray-600 font-medium">휴리스틱 필터 임계값 (고급 사용자용)</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="trivial-threshold" className="text-xs text-gray-600">
                    명백한 실패 점수
                  </Label>
                  <Input
                    id="trivial-threshold"
                    type="number"
                    defaultValue={0.2}
                    min={0}
                    max={1}
                    step={0.1}
                    className="h-8 text-sm"
                  />
                  <p className="text-xs text-gray-500">Score < 이 값인 케이스는 자동 분류</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="retrieval-threshold" className="text-xs text-gray-600">
                    검색 실패 점수
                  </Label>
                  <Input
                    id="retrieval-threshold"
                    type="number"
                    defaultValue={0.1}
                    min={0}
                    max={1}
                    step={0.1}
                    className="h-8 text-sm"
                  />
                  <p className="text-xs text-gray-500">Context Recall < 이 값은 자동 분류</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="min-tokens" className="text-xs text-gray-600">
                    최소 컨텍스트 토큰
                  </Label>
                  <Input
                    id="min-tokens"
                    type="number"
                    defaultValue={50}
                    min={1}
                    max={500}
                    className="h-8 text-sm"
                  />
                  <p className="text-xs text-gray-500">이보다 짧으면 검색 실패로 분류</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    )}

    {!llmJudgeSamplingEnabled && (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-900">진단 비활성화됨</p>
            <p className="text-xs text-amber-700 mt-1">
              실패 케이스의 근본 원인 분석이 수행되지 않습니다. 
              평가 결과에서 개선 조언을 받으려면 이 기능을 활성화하세요.
            </p>
          </div>
        </div>
      </div>
    )}
  </CardContent>
</Card>
```

## 4. 평가 시작 시 데이터 전송

`handleStartEvaluation` 함수에서 API에 전송할 때 다음 데이터를 포함하세요:

```typescript
const handleStartEvaluation = () => {
  // ... 기존 검증 로직 ...

  const evaluationRequest = {
    name: '...',
    dataset_id: selectedDataset,
    model_id: selectedModel,
    vector_db_id: selectedVectorDB,
    metrics: selectedMetrics.map(m => ({
      name: m,
      is_enabled: true
    })),
    rag_system_prompt: ragSystemPrompt,
    rag_hyperparameters: {
      top_k: topK[0],
      chunk_size: parseInt(chunkSize),
      chunk_overlap: chunkOverlap[0],
      retriever_type: retrieverType,
      similarity_threshold: similarityThreshold[0]
    },
    // 🆕 LLM Judge 샘플링 설정
    llm_judge_config: llmJudgeSamplingEnabled ? {
      enabled: true,
      mode: llmJudgeSamplingMode,
      fixed_ratio: llmJudgeSamplingMode === 'fixed_ratio' ? llmJudgeFixedRatio : undefined,
      max_cases: llmJudgeSamplingMode === 'max_cases' ? llmJudgeMaxCases : undefined
    } : {
      enabled: false
    }
  };

  // API 호출
  // ...
};
```

## 5. 백엔드 연동 참고사항

### API Request
```
POST /api/evaluations
Content-Type: application/json

{
  "name": "평가-2025-01-16",
  ...
  "llm_judge_config": {
    "enabled": true,
    "mode": "auto",  // 또는 "fixed_ratio", "max_cases"
    "fixed_ratio": 20,  // mode가 "fixed_ratio"일 때만
    "max_cases": 100    // mode가 "max_cases"일 때만
  }
}
```

### API Response (평가 결과 조회 시)
```
GET /api/evaluations/{id}/results

{
  "id": "eval-123",
  "status": "completed",
  "diagnosisSummary": {
    "total_failed": 324,
    "heuristic_classified": 215,
    "llm_judge_analyzed": 22,
    "not_analyzed": 87,
    "diagnosis_cost": 2.40,
    "breakdown": {
      "trivial_failures": 180,
      "retrieval_failures": 35,
      "ambiguous_cases": 109
    }
  }
}
```

## 6. 테스트 시나리오

1. **자동 모드 테스트**
   - 샘플링 모드를 "자동"으로 선택
   - 평가 시작
   - 결과 페이지에서 진단 요약 확인

2. **고정 비율 모드 테스트**
   - 샘플링 모드를 "고정 비율"로 선택
   - 슬라이더로 20% 설정
   - 평가 시작
   - 약 20%의 케이스만 LLM Judge 분석되었는지 확인

3. **최대 케이스 수 모드 테스트**
   - 샘플링 모드를 "최대 케이스 수"로 선택
   - 100개로 설정
   - 평가 시작
   - 최대 100개만 분석되었는지 확인

4. **비활성화 테스트**
   - LLM Judge 분석 토글을 OFF
   - 평가 시작
   - 진단 요약이 표시되지 않는지 확인

## 7. 완료 체크리스트

- [x] State 추가 완료
- [x] DiagnosisSummaryCard 컴포넌트 생성
- [ ] NewEvaluationPageBlue.tsx에 UI 추가
- [ ] handleStartEvaluation 함수 수정
- [ ] ResultsPageBlue.tsx에 DiagnosisSummaryCard 추가
- [ ] 백엔드 API 연동
- [ ] 테스트 완료

## 8. 참고 자료

- 타입 정의: `/types/index.ts`
- 진단 요약 카드: `/components/DiagnosisSummaryCard.tsx`
- 사용 예제: `/components/DiagnosisSummaryExample.tsx`
- 백엔드 가이드: `/guidelines/LLM-Judge-Prompt-Strategy.md`
