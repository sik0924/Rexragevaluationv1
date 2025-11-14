# LLM Judge 근거 생성 프롬프트 설계 전략

## 1. 프롬프트 설계 목표

### 1.1 정확한 진단
실패한 케이스의 원인을 **Retrieval (검색) 문제**와 **Generation (생성) 문제**로 명확히 분류하고, 세부적인 근거를 제시합니다.

### 1.2 파싱 용이성
백엔드 시스템이 결과를 쉽게 파싱하여 `failed_cases` 테이블의 `reason` (요약), `root_cause` (상세 분석) 필드에 정확히 저장할 수 있도록 **JSON 형식** 출력을 강제합니다.

### 1.3 일관성
어떤 질문에도 일관된 진단 기준과 톤을 유지하도록 LLM Judge의 페르소나를 정의합니다.

---

## 2. 근거 생성 프롬프트 (Root Cause Generation Prompt) 구조

### A. 시스템 역할 정의 (System Persona)

LLM Judge에게 **RAG 파이프라인의 전문가 디버거** 역할을 부여하여 진단의 깊이를 높습니다.

| 항목 | 내용 |
|------|------|
| **역할** | 당신은 RAG(검색 증강 생성) 파이프라인의 성능을 평가하는 **20년 경력의 솔루션 아키텍트이자 디버거**입니다. |
| **목표** | 사용자 질문, 검색된 컨텍스트, 생성된 답변을 분석하여 **평가 실패의 근본 원인(Root Cause)**을 가장 논리적이고 정확하게 진단하십시오. |
| **기준** | 진단은 항상 **Retrieval(검색)** 오류와 **Generation(생성)** 오류 중 하나 또는 모두에 초점을 맞춰야 합니다. |

#### 프롬프트 템플릿

```
You are a **20-year veteran solution architect and debugger** specializing in RAG (Retrieval-Augmented Generation) pipeline performance evaluation.

Your mission: Analyze user questions, retrieved contexts, and generated answers to diagnose the **root cause of evaluation failures** with maximum logical precision.

Your diagnosis MUST focus on one or both of:
- **Retrieval errors** (search quality issues)
- **Generation errors** (answer quality issues)
```

---

### B. 입력 데이터 (Input Variables)

LLM이 판단할 수 있는 모든 정보를 제공합니다. 이는 `qa_pairs`와 `evaluation_results` 테이블에서 가져옵니다.

| 변수 | 설명 | 예시 |
|------|------|------|
| **`USER_QUESTION`** | 사용자가 질의한 원본 질문 | "RAG 솔루션의 3대 경쟁력은 무엇인가요?" |
| **`EXPECTED_ANSWER`** | (옵션) Ground Truth 또는 기대 답변 | "통합 진단 보고서, 운영 인프라, 자동 개선 루프" |
| **`GENERATED_ANSWER`** | RAG 모델이 생성한 실제 답변 | "RAG 솔루션은 훌륭하며, 데이터셋 관리가 중요합니다." |
| **`RETRIEVED_CONTEXTS`** | RAG 모델이 검색 단계에서 가져온 원본 문서 청크 목록 | "[Doc 1: REX는 3대 경쟁력이...] [Doc 2: V1.0의 목표는...]" |
| **`FAILED_METRIC`** | 실패를 유발한 핵심 지표 (예: Faithfulness, Context Precision) | "Faithfulness (0.2/1.0)" |

#### 프롬프트 템플릿

```
## Input Data for Analysis

**USER_QUESTION:** {{USER_QUESTION}}

**EXPECTED_ANSWER (Ground Truth):** {{EXPECTED_ANSWER}}

**GENERATED_ANSWER:** {{GENERATED_ANSWER}}

**RETRIEVED_CONTEXTS:**
{{RETRIEVED_CONTEXTS}}

**FAILED_METRIC:** {{FAILED_METRIC}}
```

---

### C. 단계별 진단 요청 (Chain-of-Thought Instruction)

CoT를 통해 LLM이 심층적인 사고 과정을 거치도록 유도합니다.

#### 프롬프트 템플릿

```
## Diagnostic Steps (Chain-of-Thought)

Follow these steps to diagnose the failure:

### Step 1: Causal Analysis
Determine whether the primary failure cause lies in:
- **Retrieval stage** (search quality)
- **Generation stage** (answer quality)
- **Both stages**

### Step 2: Detailed Root Cause Diagnosis

**If Retrieval Problem:**
- Was the retrieved context sufficient to answer USER_QUESTION?
- Was relevance/fidelity/quantity of context inadequate?
- Example issues: Missing critical information, irrelevant documents retrieved

**If Generation Problem:**
- Did GENERATED_ANSWER include content NOT present in RETRIEVED_CONTEXTS? (Hallucination)
- Did it misinterpret context information?
- Did it miss the question's intent? (Irrelevance)

### Step 3: Actionable Advice
Provide ONE specific recommendation for which RAG pipeline component (chunking strategy, prompt template, embedding model) should be improved first to resolve this issue.
```

---

### D. 최종 출력 형식 강제 (JSON Output)

`failed_cases` 테이블에 삽입될 데이터 구조를 강제합니다.

#### 프롬프트 템플릿

```
## Required Output Format

Return ONLY valid JSON with this exact structure:

{
  "failure_type": "Retrieval | Generation | Both",
  "reason": "[50-char summary] Core problem summary (Korean)",
  "root_cause": {
    "summary_ko": "[Detailed analysis] Expert-level detailed diagnosis based on Step 1-2 results (Korean)",
    "advice_ko": "[Improvement advice] Specific first action to resolve this issue (Korean)"
  }
}

Example output:
{
  "failure_type": "Generation",
  "reason": "검색된 컨텍스트를 무시하고 일반적 답변 생성 (Hallucination)",
  "root_cause": {
    "summary_ko": "검색된 Doc 1에는 '3대 경쟁력: 통합 진단, 운영 인프라, 자동 개선 루프'가 명시되어 있으나, 생성 모델이 이를 무시하고 모호한 답변을 생성했습니다. 이는 Generation Prompt에 컨텍스트 충실성 제약이 부족한 것이 원인입니다.",
    "advice_ko": "생성 프롬프트에 '반드시 검색된 컨텍스트만 사용하라'는 지시를 강화하고, 시스템 프롬프트에 'Do not hallucinate' 제약을 추가하십시오."
  }
}
```

---

## 3. 완전한 프롬프트 템플릿

### 전체 프롬프트

```
You are a **20-year veteran solution architect and debugger** specializing in RAG (Retrieval-Augmented Generation) pipeline performance evaluation.

Your mission: Analyze user questions, retrieved contexts, and generated answers to diagnose the **root cause of evaluation failures** with maximum logical precision.

Your diagnosis MUST focus on one or both of:
- **Retrieval errors** (search quality issues)
- **Generation errors** (answer quality issues)

---

## Input Data for Analysis

**USER_QUESTION:** {{USER_QUESTION}}

**EXPECTED_ANSWER (Ground Truth):** {{EXPECTED_ANSWER}}

**GENERATED_ANSWER:** {{GENERATED_ANSWER}}

**RETRIEVED_CONTEXTS:**
{{RETRIEVED_CONTEXTS}}

**FAILED_METRIC:** {{FAILED_METRIC}}

---

## Diagnostic Steps (Chain-of-Thought)

Follow these steps to diagnose the failure:

### Step 1: Causal Analysis
Determine whether the primary failure cause lies in:
- **Retrieval stage** (search quality)
- **Generation stage** (answer quality)
- **Both stages**

### Step 2: Detailed Root Cause Diagnosis

**If Retrieval Problem:**
- Was the retrieved context sufficient to answer USER_QUESTION?
- Was relevance/fidelity/quantity of context inadequate?
- Example issues: Missing critical information, irrelevant documents retrieved

**If Generation Problem:**
- Did GENERATED_ANSWER include content NOT present in RETRIEVED_CONTEXTS? (Hallucination)
- Did it misinterpret context information?
- Did it miss the question's intent? (Irrelevance)

### Step 3: Actionable Advice
Provide ONE specific recommendation for which RAG pipeline component (chunking strategy, prompt template, embedding model) should be improved first to resolve this issue.

---

## Required Output Format

Return ONLY valid JSON with this exact structure:

{
  "failure_type": "Retrieval | Generation | Both",
  "reason": "[50-char summary] Core problem summary (Korean)",
  "root_cause": {
    "summary_ko": "[Detailed analysis] Expert-level detailed diagnosis based on Step 1-2 results (Korean)",
    "advice_ko": "[Improvement advice] Specific first action to resolve this issue (Korean)"
  }
}
```

---

## 4. 지속적인 튜닝 및 관리 전략

### 4.1 프롬프트 버전 관리

| 버전 | 날짜 | 주요 변경사항 | 성능 개선 |
|------|------|---------------|-----------|
| v1.0 | 2025-01-15 | 초기 프롬프트 설계 | Baseline |
| v1.1 | 2025-02-01 | CoT 단계 상세화 | +12% 진단 정확도 |
| v1.2 | 2025-03-01 | JSON 출력 형식 강제 | 100% 파싱 성공률 |

### 4.2 A/B 테스트 전략

**목표:** 프롬프트 변경이 진단 품질에 미치는 영향을 정량화

1. **테스트 셋 구축:** 실패 케이스 100개를 수동으로 레이블링 (Ground Truth Root Cause)
2. **메트릭 정의:**
   - 진단 정확도 (Accuracy): LLM Judge의 `failure_type`이 Ground Truth와 일치하는 비율
   - 조언 실행 성공률: LLM Judge의 `advice_ko`를 따랐을 때 실제로 성능이 개선된 비율
3. **실험 주기:** 매월 1회 프롬프트 튜닝 실험

### 4.3 휴먼 피드백 루프

**Auto-Improve Results 페이지에 피드백 버튼 추가:**

```
┌─────────────────────────────────────────┐
│ 🔍 LLM Judge 근본 원인 분석             │
├─────────────────────────────────────────┤
│ [분석 내용...]                          │
│                                          │
│ 이 분석이 도움이 되었나요?              │
│ 👍 정확함  👎 부정확함  💡 개선 제안    │
└─────────────────────────────────────────┘
```

**피드백 데이터를 `llm_judge_feedback` 테이블에 저장:**

```sql
CREATE TABLE llm_judge_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  failed_case_id UUID REFERENCES failed_cases(id),
  user_id UUID REFERENCES users(id),
  rating ENUM('accurate', 'inaccurate', 'suggestion'),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4.4 자동화된 프롬프트 최적화 (Advanced)

**DSPy를 활용한 프롬프트 자동 튜닝 (V2.0 로드맵):**

```python
import dspy

class RootCauseAnalyzer(dspy.Signature):
    """RAG 실패 케이스의 근본 원인을 진단합니다."""
    user_question = dspy.InputField()
    generated_answer = dspy.InputField()
    retrieved_contexts = dspy.InputField()
    failed_metric = dspy.InputField()
    
    failure_type = dspy.OutputField(desc="Retrieval | Generation | Both")
    reason = dspy.OutputField(desc="50자 요약")
    root_cause = dspy.OutputField(desc="상세 분석 JSON")

# DSPy가 자동으로 최적 프롬프트 탐색
turbo = dspy.OpenAI(model='gpt-4-turbo')
compiled_analyzer = dspy.Compile(
    RootCauseAnalyzer,
    metric=diagnosis_accuracy_metric,
    trainset=labeled_failure_cases
)
```

---

## 5. 활용 가이드

### 5.1 백엔드 통합

**API 엔드포인트 예시 (`/api/llm-judge/analyze`):**

```typescript
interface RootCauseRequest {
  user_question: string;
  expected_answer?: string;
  generated_answer: string;
  retrieved_contexts: string[];
  failed_metric: string;
}

interface RootCauseResponse {
  failure_type: 'Retrieval' | 'Generation' | 'Both';
  reason: string;
  root_cause: {
    summary_ko: string;
    advice_ko: string;
  };
  llm_model: string; // 사용된 LLM Judge 모델
  prompt_version: string; // 사용된 프롬프트 버전
}
```

### 5.2 프론트엔드 표시

**AutoImprove Results 페이지에서 시각화:**

```tsx
<Card>
  <CardHeader>
    <Badge variant={getBadgeVariant(failureType)}>
      {failureType}
    </Badge>
    <CardTitle>근본 원인 분석</CardTitle>
  </CardHeader>
  <CardContent>
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>요약</AlertTitle>
      <AlertDescription>{reason}</AlertDescription>
    </Alert>
    
    <Separator className="my-4" />
    
    <div className="space-y-4">
      <div>
        <Label>상세 분석</Label>
        <p className="text-sm text-gray-600">{root_cause.summary_ko}</p>
      </div>
      
      <div>
        <Label>개선 조언</Label>
        <Alert variant="default">
          <Lightbulb className="h-4 w-4" />
          <AlertDescription>{root_cause.advice_ko}</AlertDescription>
        </Alert>
      </div>
    </div>
  </CardContent>
</Card>
```

---

## 6. 참고 자료

- [OpenAI Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering)
- [Anthropic Claude Prompt Library](https://docs.anthropic.com/claude/prompt-library)
- [DSPy: Programming with Foundation Models](https://github.com/stanfordnlp/dspy)
- [LangChain Output Parsers](https://python.langchain.com/docs/modules/model_io/output_parsers/)

---

## Appendix: 실패 유형별 예시

### A. Retrieval 문제 예시

**케이스:**
- USER_QUESTION: "REX의 3대 경쟁력은 무엇인가요?"
- RETRIEVED_CONTEXTS: ["Doc 1: V1.0 로드맵은...", "Doc 2: 사용자 흐름은..."]
- GENERATED_ANSWER: "정보가 부족하여 답변할 수 없습니다."

**LLM Judge 출력:**
```json
{
  "failure_type": "Retrieval",
  "reason": "핵심 정보가 포함된 문서가 검색되지 않음",
  "root_cause": {
    "summary_ko": "질문이 '3대 경쟁력'을 묻고 있으나, 검색된 컨텍스트에는 경쟁력 관련 정보가 전혀 포함되지 않았습니다. 이는 임베딩 모델이 의미적 유사성을 제대로 포착하지 못했거나, Vector DB에 해당 정보가 아예 없을 가능성이 높습니다.",
    "advice_ko": "먼저 Vector DB에 '3대 경쟁력' 관련 문서가 실제로 존재하는지 확인하고, 없다면 데이터 수집 단계로 돌아가십시오. 존재한다면 임베딩 모델을 text-embedding-ada-002에서 text-embedding-3-large로 업그레이드하십시오."
  }
}
```

### B. Generation 문제 예시

**케이스:**
- USER_QUESTION: "REX의 3대 경쟁력은 무엇인가요?"
- RETRIEVED_CONTEXTS: ["Doc 1: REX의 3대 경쟁력은 1) 통합 진단 보고서, 2) 운영 인프라, 3) 자동 개선 루프입니다."]
- GENERATED_ANSWER: "REX는 훌륭한 RAG 솔루션이며, 데이터셋 관리가 중요합니다."

**LLM Judge 출력:**
```json
{
  "failure_type": "Generation",
  "reason": "검색된 컨텍스트를 무시하고 일반적 답변 생성 (Hallucination)",
  "root_cause": {
    "summary_ko": "검색된 Doc 1에는 정확한 답변('3대 경쟁력: 통합 진단 보고서, 운영 인프라, 자동 개선 루프')이 명시되어 있으나, 생성 모델이 이를 완전히 무시하고 질문과 무관한 일반론적 답변을 생성했습니다. 이는 Generation Prompt에 컨텍스트 충실성 제약이 부족한 것이 주 원인입니다.",
    "advice_ko": "생성 프롬프트에 'You MUST answer based ONLY on the retrieved context. Do not use external knowledge or provide generic responses.'라는 강력한 제약을 추가하십시오."
  }
}
```

### C. Both 문제 예시

**케이스:**
- USER_QUESTION: "자동 개선 루프의 3단계는 무엇인가요?"
- RETRIEVED_CONTEXTS: ["Doc 1: 운영 인프라는...", "Doc 2: 비용 관리 기능은..."]
- GENERATED_ANSWER: "자동 개선 루프는 1) 데이터 수집, 2) 모델 학습, 3) 배포로 구성됩니다."

**LLM Judge 출력:**
```json
{
  "failure_type": "Both",
  "reason": "컨텍스트 부족 + Hallucination 복합 문제",
  "root_cause": {
    "summary_ko": "검색 단계에서 '자동 개선 루프' 관련 문서가 검색되지 않았고(Retrieval 실패), 생성 모델은 컨텍스트 없이 임의로 '데이터 수집-모델 학습-배포'라는 일반적인 ML 파이프라인 단계를 환각(Hallucination)하여 답변했습니다. 실제 정답은 '근본 원인 분석 자동화 → 가이드 기반 개선 실험 → 개선 활동 자동화 루프'입니다.",
    "advice_ko": "1순위: 임베딩 모델을 업그레이드하고, 청킹 전략을 Semantic Chunking으로 변경하여 Retrieval 품질을 개선하십시오. 2순위: 생성 프롬프트에 'If context is insufficient, respond with \"I don't have enough information\"' 제약을 추가하십시오."
  }
}
```

---

## 버전 이력

| 버전 | 날짜 | 작성자 | 변경사항 |
|------|------|--------|----------|
| 1.0 | 2025-01-15 | REX Team | 초기 문서 작성 |
