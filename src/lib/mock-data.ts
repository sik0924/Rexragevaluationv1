import {
  Dataset,
  EvaluationResult,
  LLMModel,
  VectorDB,
  LogEntry,
  SystemStatus,
  EvaluationMetric,
  User,
  LLMJudgeRootCause,
  FailedCaseWithRootCause
} from '../types';

export const mockUser: User = {
  id: '1',
  email: 'user@example.com',
  name: '홍길동',
  role: 'admin'
};

export const mockDatasets: Dataset[] = [
  {
    id: '1',
    name: '고객 지원 QA 데이터셋',
    type: 'auto-generated',
    qaCount: 50,
    createdAt: '2025-09-25T10:30:00',
    source: 'customer_support_docs.pdf',
    qaPairs: [
      {
        id: '1',
        question: '제품 반품 정책은 무엇인가요?',
        answer: '구매 후 30일 이내에 미사용 제품은 전액 환불이 가능합니다.',
        context: '반품 정책 문서'
      },
      {
        id: '2',
        question: '배송은 얼마나 걸리나요?',
        answer: '일반 배송은 2-3일, 빠른 배송은 당일 또는 익일 배송이 가능합니다.',
        context: '배송 정보 문서'
      },
      {
        id: '3',
        question: '어떤 결제 방법을 사용할 수 있나요?',
        answer: '신용카드, 체크카드, 계좌이체, 무통장입금, 간편결제(카카오페이, 네이버페이, 토스) 등을 지원합니다.',
        context: '결제 정보 문서'
      },
      {
        id: '4',
        question: '회원 가입은 어떻게 하나요?',
        answer: '홈페이지 우측 상단의 "회원가입" 버튼을 클릭하고 이메일, 비밀번호, 이름 등 필수 정보를 입력하시면 됩니다.',
        context: '회원 가입 가이드'
      },
      {
        id: '5',
        question: '비밀번호를 잊어버렸어요.',
        answer: '로그인 페이지의 "비밀번호 찾기"를 클릭하고 가입한 이메일을 입력하시면 재설정 링크가 발송됩니다.',
        context: '계정 관리 문서'
      },
      {
        id: '6',
        question: '적립금은 어떻게 사용하나요?',
        answer: '주문 결제 시 "적립금 사용" 항목에서 원하는 금액을 입력하시면 결제 금액에서 차감됩니다. 최소 사용 금액은 1,000원입니다.',
        context: '적립금 정책 문서'
      },
      {
        id: '7',
        question: '제품 교환은 어떻게 하나요?',
        answer: '마이페이지에서 주문 내역을 확인하고 "교환 신청" 버튼을 클릭하여 사유를 선택하시면 됩니다. 교환 배송비는 상품 하자의 경우 무료이며, 단순 변심의 경우 왕복 배송비가 부과됩니다.',
        context: '교환 정책 문서'
      },
      {
        id: '8',
        question: '주문을 취소하려면 어떻게 해야 하나요?',
        answer: '배송 전 상태에서는 마이페이지에서 직접 취소가 가능하며, 배송 중이거나 배송 완료 후에는 고객센터로 문의해주셔야 합니다.',
        context: '주문 취소 가이드'
      },
      {
        id: '9',
        question: '환불은 언제 받을 수 있나요?',
        answer: '반품 상품 입고 확인 후 2-3영업일 이내에 환불 처리됩니다. 신용카드는 카드사 정책에 따라 영업일 기준 3-7일 정도 소요될 수 있습니다.',
        context: '환불 정책 문서'
      },
      {
        id: '10',
        question: '상품에 대해 문의하고 싶어요.',
        answer: '각 상품 페이지 하단의 "상품 문의" 탭에서 문의를 남기시거나, 고객센터(1588-0000)로 연락주시면 됩니다.',
        context: '고객 지원 가이드'
      },
      {
        id: '11',
        question: '배송지를 변경할 수 있나요?',
        answer: '배송 준비 중 상태까지는 마이페이지에서 배송지 변경이 가능합니다. 배송 시작 후에는 택배사에 직접 연락하여 변경을 요청하셔야 합니다.',
        context: '배송 정보 문서'
      },
      {
        id: '12',
        question: '재고가 없는 상품은 언제 입고되나요?',
        answer: '품절된 상품의 입고 예정일은 상품 페이지에 안내되며, "재입고 알림" 버튼을 클릭하시면 입고 시 알림을 받으실 수 있습니다.',
        context: '재고 관리 정책'
      }
    ]
  },
  {
    id: '2',
    name: '제품 문서 QA',
    type: 'uploaded',
    qaCount: 50,
    createdAt: '2025-09-20T14:20:00',
    source: 'manual_qa_set.csv',
    qaPairs: [
      {
        id: '1',
        question: '제품의 초기 설정은 어떻게 하나요?',
        answer: '전원을 켠 후 화면의 언어 선택 메뉴에서 한국어를 선택하고, Wi-Fi 연결 후 계정을 등록하시면 초기 설정이 완료됩니다.',
        context: '사용 설명서 - 초기 설정'
      },
      {
        id: '2',
        question: '배터리 수명을 늘리려면 어떻게 해야 하나요?',
        answer: '화면 밝기를 낮추고, 사용하지 않는 앱은 종료하며, 절전 모드를 활성화하면 배터리 수명을 연장할 수 있습니다.',
        context: '사용 설명서 - 배터리 관리'
      },
      {
        id: '3',
        question: '제품을 공장 초기화하는 방법은?',
        answer: '설정 메뉴에서 "시스템" > "초기화" > "모든 데이터 삭제"를 선택하고 확인 버튼을 누르면 공장 초기화가 진행됩니다. 초기화 전 중요한 데이터는 반드시 백업하세요.',
        context: '사용 설명서 - 시스템 초기화'
      },
      {
        id: '4',
        question: '소프트웨어 업데이트는 어떻게 하나요?',
        answer: '설정 > 시스템 > 소프트웨어 업데이트 메뉴에서 "업데이트 확인"을 선택하면 최신 버전이 있을 경우 자동으로 다운로드 및 설치됩니다.',
        context: '사용 설명서 - 업데이트'
      },
      {
        id: '5',
        question: '제품이 켜지지 않을 때 해결 방법은?',
        answer: '전원 버튼을 10초 이상 길게 눌러 강제 재시작을 시도하고, 충전기를 연결하여 30분 이상 충전 후 다시 시도해보세요. 문제가 지속되면 고객센터에 문의하세요.',
        context: '문제 해결 가이드'
      },
      {
        id: '6',
        question: '제품의 보증 기간은 얼마나 되나요?',
        answer: '제품 구매일로부터 1년간 무상 보증 서비스가 제공되며, 보증서와 구매 영수증을 함께 보관하셔야 합니다.',
        context: '제품 보증 정보'
      },
      {
        id: '7',
        question: '블루투스 연결이 안 될 때는?',
        answer: '설정에서 블루투스를 끄고 다시 켜거나, 연결하려는 기기를 삭제한 후 재등록을 시도해보세요. 기기 간 거리가 10m 이내인지 확인하세요.',
        context: '문제 해결 가이드 - 연결'
      },
      {
        id: '8',
        question: '제품의 저장 용량을 확인하는 방법은?',
        answer: '설정 > 저장공간 메뉴에서 전체 용량과 사용 중인 용량을 확인할 수 있으며, 카테고리별 사용량도 확인 가능합니다.',
        context: '사용 설명서 - 저장공간'
      },
      {
        id: '9',
        question: '화면이 깨졌을 때 수리 비용은?',
        answer: '화면 수리 비용은 모델에 따라 다르며, 보증 기간 내 제조사 과실인 경우 무상 수리가 가능합니다. 정확한 견적은 서비스센터에 문의하세요.',
        context: 'A/S 정보'
      },
      {
        id: '10',
        question: '제품 사양은 어디서 확인하나요?',
        answer: '제품 박스 또는 사용 설명서 뒷면에 전체 사양이 기재되어 있으며, 공식 홈페이지의 제품 페이지에서도 상세 사양을 확인할 수 있습니다.',
        context: '제품 정보'
      }
    ]
  },
  {
    id: '3',
    name: '기술 FAQ 데이터셋',
    type: 'auto-generated',
    qaCount: 50,
    createdAt: '2025-09-15T09:15:00',
    source: 'technical_docs.txt',
    qaPairs: [
      {
        id: '1',
        question: 'API 호출 시 인증은 어떻게 하나요?',
        answer: 'HTTP 헤더에 "Authorization: Bearer {YOUR_API_KEY}" 형식으로 API 키를 포함하여 요청하시면 됩니다. API 키는 대시보드의 설정 메뉴에서 발급받을 수 있습니다.',
        context: 'API 문서 - 인증'
      },
      {
        id: '2',
        question: 'Rate Limit은 어떻게 되나요?',
        answer: '무료 플랜은 분당 60회, 프로 플랜은 분당 600회, 엔터프라이즈 플랜은 분당 6000회까지 요청할 수 있습니다. 초과 시 429 에러가 반환됩니다.',
        context: 'API 문서 - 제한사항'
      },
      {
        id: '3',
        question: 'Webhook 설정은 어떻게 하나요?',
        answer: '대시보드의 "Webhooks" 메뉴에서 URL과 이벤트 타입을 선택하여 등록할 수 있습니다. POST 요청으로 이벤트 데이터가 전송되며, 서명 검증을 통해 보안을 강화할 수 있습니다.',
        context: 'API 문서 - Webhook'
      },
      {
        id: '4',
        question: '데이터베이스 백업 주기는?',
        answer: '자동 백업은 매일 03:00 AM (UTC)에 실행되며, 최근 30일간의 백업이 보관됩니다. 프로 플랜 이상에서는 수동 백업도 가능합니다.',
        context: '시스템 관리 문서'
      },
      {
        id: '5',
        question: 'CORS 에러가 발생합니다. 어떻게 해결하나요?',
        answer: '대시보드의 "보안 설정"에서 허용할 도메인을 등록하거나, API 서버에서 프록시를 사용하여 우회할 수 있습니다. 개발 환경에서는 "*"를 사용할 수 있습니다.',
        context: '기술 지원 FAQ'
      },
      {
        id: '6',
        question: 'SDK는 어떤 언어를 지원하나요?',
        answer: 'Python, JavaScript/TypeScript, Java, Go, Ruby, PHP 등 주요 언어의 공식 SDK를 제공합니다. GitHub 저장소에서 각 SDK의 문서와 예제 코드를 확인할 수 있습니다.',
        context: 'SDK 문서'
      },
      {
        id: '7',
        question: '응답 시간이 느릴 때는 어떻게 해야 하나요?',
        answer: '쿼리 최적화, 인덱스 추가, 캐싱 활용을 권장합니다. 페이지네이션을 사용하고, 필요한 필드만 선택하여 데이터 전송량을 줄이세요.',
        context: '성능 최적화 가이드'
      },
      {
        id: '8',
        question: '로그는 얼마나 보관되나요?',
        answer: '기본 플랜은 7일, 프로 플랜은 30일, 엔터프라이즈 플랜은 90일간 로그가 보관됩니다. 장기 보관이 필요한 경우 외부 로그 스토리지와 연동할 수 있습니다.',
        context: '로그 관리 정책'
      },
      {
        id: '9',
        question: 'SSL 인증서는 자동으로 갱신되나요?',
        answer: '네, Let\'s Encrypt를 사용하여 SSL 인증서가 자동으로 발급 및 갱신됩니다. 만료 7일 전부터 갱신 작업이 시작되며, 별도 작업이 필요 없습니다.',
        context: '보안 설정 문서'
      },
      {
        id: '10',
        question: '서버 장애 발생 시 알림을 받을 수 있나요?',
        answer: '설정에서 알림 채널(이메일, Slack, Discord 등)을 등록하면 서버 다운타임, 에러율 증가, 리소스 임계치 초과 시 실시간으로 알림을 받을 수 있습니다.',
        context: '모니터링 문서'
      }
    ]
  }
];

export const mockMetrics: EvaluationMetric[] = [
  // 필수 지표 (항상 실행) - 6개
  {
    id: 'faithfulness',
    name: 'Faithfulness',
    nameKo: '충실성',
    description: '생성된 답변이 검색된 문서 내용에 얼마나 충실한지 평가',
    requiresLLMJudge: true,
    category: 'required',
    subCategory: '생성 품질'
  },
  {
    id: 'answer_relevancy',
    name: 'Answer Relevancy',
    nameKo: '답변 관련성',
    description: '답변이 질문과 얼마나 관련성이 있는지 평가',
    requiresLLMJudge: true,
    category: 'required',
    subCategory: '생성 품질'
  },
  {
    id: 'context_precision',
    name: 'Context Precision',
    nameKo: '컨텍스트 정밀도',
    description: '검색된 컨텍스트가 질문에 대해 얼마나 정확한지 평가',
    requiresLLMJudge: false,
    category: 'required',
    subCategory: '검색 품질'
  },
  {
    id: 'context_recall',
    name: 'Context Recall',
    nameKo: '컨텍스트 재현율',
    description: '답변에 필요한 모든 정보가 검색된 컨텍스트에 포함되어 있는지 평가',
    requiresLLMJudge: false,
    category: 'required',
    subCategory: '검색 품질'
  },
  {
    id: 'answer_correctness',
    name: 'Answer Correctness',
    nameKo: '답변 정확성',
    description: '실제 정답과 비교하여 정확도 검증',
    requiresLLMJudge: true,
    category: 'required',
    subCategory: '생성 품질'
  },
  {
    id: 'coherence',
    name: 'Coherence',
    nameKo: '일관성',
    description: '답변의 논리적 일관성과 흐름 평가',
    requiresLLMJudge: true,
    category: 'required',
    subCategory: '생성 품질'
  },
  // 선택 지표 (필요시 활성화) - 6개
  {
    id: 'answer_similarity',
    name: 'Answer Similarity',
    nameKo: '답변 유사도',
    description: '생성된 답변과 정답 간의 의미적 유사도 평가',
    requiresLLMJudge: false,
    category: 'optional',
    subCategory: '생성 품질'
  },
  {
    id: 'context_entity_recall',
    name: 'Context Entity Recall',
    nameKo: '컨텍스트 엔티티 재현율',
    description: '검색된 컨텍스트에 필요한 주요 엔티티(인명, 지명 등)가 포함되었는지 평가',
    requiresLLMJudge: false,
    category: 'optional',
    subCategory: '검색 품질'
  },
  {
    id: 'conciseness',
    name: 'Conciseness',
    nameKo: '간결성',
    description: '답변의 간결성과 불필요한 정보 제거 여부 평가',
    requiresLLMJudge: true,
    category: 'optional',
    subCategory: '생성 품질'
  },
  {
    id: 'critique_correctness',
    name: 'Critique Correctness',
    nameKo: '비평 정확성',
    description: '비평이나 평가의 정확성 검증 (코드리뷰, 문서검토 AI 전용)',
    requiresLLMJudge: true,
    category: 'optional',
    subCategory: '생성 품질'
  },
  {
    id: 'harmfulness',
    name: 'Harmfulness',
    nameKo: '유해성',
    description: '유해하거나 부적절한 콘텐츠 포함 여부 평가',
    requiresLLMJudge: true,
    category: 'optional',
    subCategory: '안전성'
  },
  {
    id: 'maliciousness',
    name: 'Maliciousness',
    nameKo: '악의성',
    description: '악의적이거나 위험한 의도가 포함되어 있는지 평가',
    requiresLLMJudge: true,
    category: 'optional',
    subCategory: '안전성'
  }
];

// 평가 설정(Config) 정보를 포함한 이력 데이터
export interface EvaluationHistory extends EvaluationResult {
  name: string;
  datasetName: string;
  modelName: string;
  vectorDbName: string;
  scheduledTime?: string;
  scheduleFrequency?: 'daily' | 'weekly' | 'monthly';
}

export interface EvaluationResultWithName extends EvaluationResult {
  name: string;
  datasetName?: string;
}

export const mockEvaluations: EvaluationResultWithName[] = [
  // 이전 평가 (3일 전) - 비교를 위한 데이터
  {
    id: '0',
    configId: 'config-1',
    name: '2025년 3분기 챗봇 초기 평가',
    datasetName: '고객 지원 QA 데이터셋',
    status: 'completed',
    startedAt: '2025-09-27T10:00:00',
    completedAt: '2025-09-27T10:15:00',
    progress: 100,
    scores: {
      faithfulness: 0.80,
      answer_relevancy: 0.85,
      context_precision: 0.65,
      context_recall: 0.88,
      answer_correctness: 0.83,
      context_entity_recall: 0.82,
      answer_similarity: 0.84,
      harmfulness: 0.96,
      maliciousness: 0.98,
      coherence: 0.89,
      critique_correctness: 0.87,
      conciseness: 0.90
    },
    summary: 'Context Precision이 낮아 검색 품질 개선이 필요합니다.'
  },
  {
    id: '1',
    configId: 'config-1',
    name: '2025년 3분기 챗봇 평가',
    datasetName: '고객 지원 QA 데이터셋',
    status: 'completed',
    startedAt: '2025-09-30T14:30:00',
    completedAt: '2025-09-30T14:45:00',
    progress: 100,
    scores: {
      faithfulness: 0.92,
      answer_relevancy: 0.88,
      context_precision: 0.95,
      context_recall: 0.94,
      answer_correctness: 0.91,
      context_entity_recall: 0.89,
      answer_similarity: 0.90,
      harmfulness: 0.98,
      maliciousness: 0.99,
      coherence: 0.93,
      critique_correctness: 0.91,
      conciseness: 0.87
    },
    summary: '전반적으로 양호한 성능을 보였으나, Conciseness 지표에서 개선이 필요합니다. 특히 기술 문서 관련 질문에서 답변이 다소 장황한 경향이 있었습니다.',
    diagnosisSummary: {
      total_failed: 3,
      heuristic_classified: 1,
      llm_judge_analyzed: 2,
      not_analyzed: 0,
      diagnosis_cost: 0.07,
      breakdown: {
        trivial_failures: 0,
        retrieval_failures: 1,
        ambiguous_cases: 2
      }
    },
    failedCases: [
      {
        id: '1',
        question: '데이터셋은 어떤 형식을 지원하나요?',
        expectedAnswer: 'csv, json, jsonl, txt, yaml을 지원합니다.',
        generatedAnswer: 'CSV와 JSON 형식을 지원하여 다양한 데이터 구조를 처리할 수 있습니다.',
        score: 0.75,
        reason: 'Answer Correctness: 75 (jsonl, txt, yaml 형식 누락)',
        rootCause: 'retrieval',
        retrievedContext: 'REX는 CSV와 JSON 형식의 데이터셋을 지원합니다...',
        llmJudgeAnalysis: {
          failure_type: 'Retrieval',
          reason: '핵심 정보가 포함된 문서가 검색되지 않음',
          root_cause: {
            summary_ko: '질문이 "어떤 형식을 지원하나요?"를 묻고 있으나, 검색된 컨텍스트에는 CSV와 JSON만 언급되어 있고 jsonl, txt, yaml에 대한 정보가 전혀 포함되지 않았습니다. 이는 임베딩 모델이 의미적 유사성을 제대로 포착하지 못했거나, Vector DB에 해당 정보가 아예 없을 가능성이 높습니다. 결과적으로 생성 모델은 검색된 정보만을 기반으로 답변했기 때문에 불완전한 답변이 생성되었습니다.',
            advice_ko: '먼저 Vector DB에 모든 지원 형식(csv, json, jsonl, txt, yaml)이 명시된 문서가 실제로 존재하는지 확인하십시오. 존재한다면 임베딩 모델을 text-embedding-ada-002에서 text-embedding-3-large로 업그레이드하고, 청킹 전략을 Semantic Chunking으로 변경하여 Retrieval 품질을 개선하십시오.'
          },
          llm_model: 'GPT-4o',
          prompt_version: 'v1.2',
          confidence: 0.92,
          analyzed_at: '2025-09-30T14:46:00'
        }
      },
      {
        id: '2',
        question: '평가 예약 기능이 있나요?',
        expectedAnswer: '아니요, 현재 버전에서는 지원하지 않습니다.',
        generatedAnswer: '네, 평가 예약 기능은 관리자 페이지에서 설정할 수 있으며, 원하는 시간에 자동으로 평가를 실행할 수 있습니다.',
        score: 0.68,
        reason: 'Faithfulness: 68 (존재하지 않는 기능을 설명함)',
        rootCause: 'generation',
        retrievedContext: 'REX는 평가 기능을 제공합니다...',
        llmJudgeAnalysis: {
          failure_type: 'Generation',
          reason: '검색된 컨텍스트를 무시하고 존재하지 않는 기능 설명 (Hallucination)',
          root_cause: {
            summary_ko: '검색된 컨텍스트에는 "평가 기능"만 언급되어 있고 "평가 예약 기능"에 대한 정보가 전혀 없습니다. 그러나 생성 모델이 일반적인 소프트웨어 시스템에서 흔히 볼 수 있는 "예약 기능"을 환각(Hallucination)하여 구체적으로 "관리자 페이지에서 설정"이라는 존재하지 않는 내용까지 생성했습니다. 이는 Generation Prompt에 컨텍스트 충실성 제약이 부족한 것이 주 원인입니다.',
            advice_ko: '생성 프롬프트에 "You MUST answer based ONLY on the retrieved context. If the context does not contain the answer, respond with \'I don\'t have enough information\' instead of guessing or using external knowledge."라는 강력한 제약을 추가하십시오. 또한 Temperature를 0.7에서 0.3으로 낮춰 환각 발생 확률을 줄이십시오.'
          },
          llm_model: 'GPT-4o',
          prompt_version: 'v1.2',
          confidence: 0.95,
          analyzed_at: '2025-09-30T14:46:15'
        }
      },
      {
        id: '3',
        question: 'Context Recall이란 무엇인가요?',
        expectedAnswer: 'Context Recall은 Ground Truth 답변을 생성하는 데 필요한 모든 정보가 검색된 문서에 포함되어 있는지 측정하는 지표입니다.',
        generatedAnswer: 'Context Recall은 검색의 정확도를 평가하는 지표입니다.',
        score: 0.70,
        reason: 'Answer Correctness: 70 (구체적인 설명 부족)',
        rootCause: 'retrieval',
        retrievedContext: 'Context Recall은 검색 품질을 평가합니다...',
        llmJudgeAnalysis: {
          failure_type: 'Retrieval',
          reason: '검색된 컨텍스트가 지표의 구체적인 정의를 포함하지 않음',
          root_cause: {
            summary_ko: '질문이 "Context Recall이란 무엇인가요?"를 묻고 있으며, 기대 답변은 "Ground Truth 답변 생성에 필요한 모든 정보가 검색된 문서에 포함되어 있는지 측정"이라는 구체적인 정의를 요구합니다. 그러나 검색된 컨텍스트는 "검색 품질을 평가합니다"라는 추상적인 설명만 포함하고 있어, 생성 모델이 구체적인 답변을 생성할 수 없었습니다. 이는 문서 청킹 시 정의 부분이 잘려나갔거나, 검색 랭킹 알고리즘이 핵심 문서를 놓쳤을 가능성이 높습니다.',
            advice_ko: 'Chunk Size를 512에서 1024로 증가시켜 정의와 설명이 함께 포함되도록 하고, Top-K를 3에서 5로 늘려 더 많은 관련 문서를 검색하십시오. 또한 Hybrid Search(키워드 + 벡터 검색)를 활성화하여 "Context Recall" 같은 고유 용어를 정확히 찾도록 개선하십시오.'
          },
          llm_model: 'GPT-4o',
          prompt_version: 'v1.2',
          confidence: 0.88,
          analyzed_at: '2025-09-30T14:46:30'
        }
      }
    ]
  },
  {
    id: '2',
    configId: 'config-2',
    name: '고객 지원팀 답변 품질 개선',
    status: 'running',
    startedAt: '2025-10-01T09:00:00',
    progress: 65,
    scores: {
      faithfulness: 0.89,
      answer_relevancy: 0.91,
      context_precision: 0.92,
      coherence: 0.88,
      conciseness: 0.90
    }
  },
  {
    id: '3',
    configId: 'config-3',
    name: '신규 모델 성능 검증',
    status: 'completed',
    startedAt: '2025-09-28T15:20:00',
    completedAt: '2025-09-28T15:35:00',
    progress: 100,
    scores: {
      faithfulness: 0.87,
      answer_relevancy: 0.90,
      context_precision: 0.89,
      context_recall: 0.91,
      answer_correctness: 0.88,
      answer_similarity: 0.89,
      coherence: 0.90,
      conciseness: 0.86
    },
    diagnosisSummary: {
      total_failed: 12,
      heuristic_classified: 8,
      llm_judge_analyzed: 4,
      not_analyzed: 0,
      diagnosis_cost: 0.14,
      breakdown: {
        trivial_failures: 5,
        retrieval_failures: 3,
        ambiguous_cases: 4
      }
    }
  },
  {
    id: '4',
    configId: 'config-4',
    name: '멀티 모델 비교 평가',
    datasetName: '기술 FAQ 데이터셋',
    status: 'completed',
    startedAt: '2025-09-27T10:00:00',
    completedAt: '2025-09-27T10:25:00',
    progress: 100,
    scores: {
      faithfulness: 0.91,
      answer_relevancy: 0.89,
      context_precision: 0.93,
      context_recall: 0.90,
      answer_correctness: 0.92,
      context_entity_recall: 0.88,
      answer_similarity: 0.91,
      harmfulness: 0.97,
      maliciousness: 0.98,
      coherence: 0.90,
      critique_correctness: 0.89,
      conciseness: 0.87
    },
    diagnosisSummary: {
      total_failed: 6,
      heuristic_classified: 3,
      llm_judge_analyzed: 3,
      not_analyzed: 0,
      diagnosis_cost: 0.11,
      breakdown: {
        trivial_failures: 2,
        retrieval_failures: 1,
        ambiguous_cases: 3
      }
    }
  }
];

// 평가 이력 (상세 정보 포함)
export const mockEvaluationHistory: EvaluationHistory[] = [
  {
    id: '1',
    configId: 'config-1',
    name: '2025년 3분기 챗봇 평가',
    datasetName: '고객 지원 QA 데이터셋',
    modelName: 'GPT-4o',
    vectorDbName: 'Pinecone Production',
    status: 'completed',
    startedAt: '2025-09-30T14:30:00',
    completedAt: '2025-09-30T14:45:00',
    progress: 100,
    scores: {
      faithfulness: 0.92,
      answer_relevancy: 0.88,
      context_precision: 0.95,
      context_recall: 0.94,
      answer_correctness: 0.91,
      context_entity_recall: 0.89,
      answer_similarity: 0.90,
      harmfulness: 0.98,
      maliciousness: 0.99,
      coherence: 0.93,
      critique_correctness: 0.91,
      conciseness: 0.87
    },
    summary: '전반적으로 양호한 성능을 보였으나, Conciseness 지표에서 개선이 필요합니다.',
    failedCases: []
  },
  {
    id: '2',
    configId: 'config-2',
    name: '고객 지원팀 답변 품질 개선',
    datasetName: '고객 지원 QA 데이터셋',
    modelName: 'Claude-3 Opus',
    vectorDbName: 'ChromaDB Local',
    status: 'running',
    startedAt: '2025-10-01T09:00:00',
    progress: 65,
    scores: {
      faithfulness: 0.89,
      answer_relevancy: 0.91,
      context_precision: 0.92,
      coherence: 0.88,
      conciseness: 0.90
    }
  },
  {
    id: '3',
    configId: 'config-3',
    name: '신규 모델 성능 검증',
    datasetName: '제품 문서 QA',
    modelName: 'GPT-4o',
    vectorDbName: 'Pinecone Production',
    status: 'completed',
    startedAt: '2025-09-28T15:20:00',
    completedAt: '2025-09-28T15:35:00',
    progress: 100,
    scores: {
      faithfulness: 0.87,
      answer_relevancy: 0.90,
      context_precision: 0.89,
      context_recall: 0.91,
      answer_correctness: 0.88,
      answer_similarity: 0.89,
      coherence: 0.90,
      conciseness: 0.86
    }
  },
  {
    id: '4',
    configId: 'config-4',
    name: '기술 FAQ 자동화 평가',
    datasetName: '기술 FAQ 데이터셋',
    modelName: 'GPT-4 Turbo',
    vectorDbName: 'Pinecone Production',
    status: 'scheduled',
    scheduledTime: '2025-10-02T10:00:00',
    scheduleFrequency: 'daily',
    startedAt: '2025-10-02T10:00:00',
    progress: 0,
    scores: {}
  },
  {
    id: '5',
    configId: 'config-5',
    name: '주간 정기 평가',
    datasetName: '고객 지원 QA 데이터셋',
    modelName: 'Solar-1 Mini',
    vectorDbName: 'ChromaDB Local',
    status: 'scheduled',
    scheduledTime: '2025-10-03T09:00:00',
    scheduleFrequency: 'weekly',
    startedAt: '2025-10-03T09:00:00',
    progress: 0,
    scores: {}
  },
  {
    id: '4',
    configId: 'config-4',
    name: '멀티 모델 비교 평가',
    datasetName: '기술 FAQ 데이터셋',
    modelName: 'Claude-3 Opus',
    vectorDbName: 'Weaviate Cloud',
    status: 'completed',
    startedAt: '2025-09-27T10:00:00',
    completedAt: '2025-09-27T10:25:00',
    progress: 100,
    scores: {
      faithfulness: 0.91,
      answer_relevancy: 0.89,
      context_precision: 0.93,
      context_recall: 0.90,
      answer_correctness: 0.92,
      context_entity_recall: 0.88,
      answer_similarity: 0.91,
      harmfulness: 0.97,
      maliciousness: 0.98,
      coherence: 0.90,
      critique_correctness: 0.89,
      conciseness: 0.87
    },
    summary: '멀티 모델 비교 평가로 GPT-4o, Claude-3, Gemini의 성능을 비교 분석했습니다.',
    failedCases: []
  },
  {
    id: '7',
    configId: 'config-7',
    name: '제품 검색 시스템 최적화',
    datasetName: '제품 문서 QA',
    modelName: 'GPT-4 Turbo',
    vectorDbName: 'Pinecone Production',
    status: 'completed',
    startedAt: '2025-09-25T09:00:00',
    completedAt: '2025-09-25T09:18:00',
    progress: 100,
    scores: {
      faithfulness: 0.91,
      answer_relevancy: 0.87,
      context_precision: 0.88,
      context_recall: 0.86,
      answer_correctness: 0.89,
      answer_similarity: 0.88,
      coherence: 0.90
    }
  },
  {
    id: '8',
    configId: 'config-8',
    name: 'VectorDB 성능 벤치마크',
    datasetName: '기술 FAQ 데이터셋',
    modelName: 'Solar-1 Mini',
    vectorDbName: 'ChromaDB Local',
    status: 'completed',
    startedAt: '2025-09-23T14:00:00',
    completedAt: '2025-09-23T14:25:00',
    progress: 100,
    scores: {
      faithfulness: 0.86,
      answer_relevancy: 0.85,
      context_precision: 0.84,
      context_recall: 0.87,
      coherence: 0.83,
      conciseness: 0.88
    },
    summary: '전체적으로 우수한 성능이나, Coherence 개선이 필요합니다.'
  },
  {
    id: '10',
    configId: 'config-10',
    name: '초기 프로토타입 평가',
    datasetName: '고객 지원 QA 데이터셋',
    modelName: 'GPT-3.5 Turbo',
    vectorDbName: 'ChromaDB Local',
    status: 'completed',
    startedAt: '2025-09-15T10:00:00',
    completedAt: '2025-09-15T10:12:00',
    progress: 100,
    scores: {
      faithfulness: 0.72,
      answer_relevancy: 0.78,
      context_precision: 0.65,
      context_recall: 0.71,
      answer_correctness: 0.74,
      context_entity_recall: 0.69,
      answer_similarity: 0.76,
      harmfulness: 0.95,
      maliciousness: 0.97,
      coherence: 0.80,
      critique_correctness: 0.75,
      conciseness: 0.82
    },
    summary: '⚠️ 주의: Context Precision이 65점으로 임계값 미달. 검색 품질 개선이 시급합니다.',
    failedCases: [
      {
        id: 'fc-10-1',
        question: '환불 절차는 어떻게 되나요?',
        expectedAnswer: '마이페이지에서 주문 내역 확인 후 환불 신청 가능하며, 상품 입고 후 2-3영업일 내 처리됩니다.',
        generatedAnswer: '환불은 고객센터에 문의하시면 됩니다.',
        score: 0.45,
        reason: '구체적인 절차가 누락되었습니다.',
        rootCause: 'retrieval'
      },
      {
        id: 'fc-10-2',
        question: '배송비는 얼마인가요?',
        expectedAnswer: '기본 배송비는 3,000원이며, 50,000원 이상 구매 시 무료입니다.',
        generatedAnswer: '배송비는 상품에 따라 다릅니다.',
        score: 0.38,
        reason: '정확한 금액이 제공되지 않았습니다.',
        rootCause: 'retrieval'
      }
    ]
  },
  {
    id: '11',
    configId: 'config-11',
    name: '레거시 시스템 마이그레이션 테스트',
    datasetName: '제품 문서 QA',
    modelName: 'Llama-2-70B',
    vectorDbName: 'Milvus Local',
    status: 'completed',
    startedAt: '2025-09-26T13:00:00',
    completedAt: '2025-09-26T13:28:00',
    progress: 100,
    scores: {
      faithfulness: 0.58,
      answer_relevancy: 0.62,
      context_precision: 0.55,
      context_recall: 0.60,
      answer_correctness: 0.61,
      context_entity_recall: 0.57,
      answer_similarity: 0.63,
      harmfulness: 0.88,
      maliciousness: 0.90,
      coherence: 0.65,
      critique_correctness: 0.64,
      conciseness: 0.70
    },
    summary: '🔴 미흡: 대부분의 지표가 임계값 미달. 긴급 Root Cause Analysis 필요.',
    failedCases: [
      {
        id: 'fc-11-1',
        question: '제품 A와 B의 차이점은 무엇인가요?',
        expectedAnswer: '제품 A는 기본 기능 중심이며, 제품 B는 고급 분석 기능이 추가되었습니다.',
        generatedAnswer: '제품 A가 더 저렴하고, 제품 B가 더 비쌉니다.',
        score: 0.25,
        reason: '기능적 차이를 설명하지 못하고 가격만 언급했습니다.',
        rootCause: 'generation'
      },
      {
        id: 'fc-11-2',
        question: 'API 인증은 어떻게 하나요?',
        expectedAnswer: 'API 키를 발급받아 Authorization 헤더에 Bearer 토큰으로 전달하면 됩니다.',
        generatedAnswer: 'API 키가 필요합니다.',
        score: 0.30,
        reason: '구체적인 인증 방법이 누락되었습니다.',
        rootCause: 'retrieval'
      },
      {
        id: 'fc-11-3',
        question: '데이터 백업 주기는?',
        expectedAnswer: '자동 백업은 매일 03:00 AM (UTC)에 실행됩니다.',
        generatedAnswer: '정기적으로 백업됩니다.',
        score: 0.35,
        reason: '정확한 시간이 제공되지 않았습니다.',
        rootCause: 'retrieval'
      }
    ]
  },
  {
    id: '9',
    configId: 'config-9',
    name: 'RAG 파이프라인 검증',
    datasetName: '고객 지원 QA 데이터셋',
    modelName: 'GPT-4o',
    vectorDbName: 'Weaviate Cloud',
    status: 'completed',
    startedAt: '2025-09-20T16:30:00',
    completedAt: '2025-09-20T16:48:00',
    progress: 100,
    scores: {
      faithfulness: 0.93,
      answer_relevancy: 0.89,
      context_precision: 0.92,
      context_recall: 0.90,
      answer_correctness: 0.91,
      harmfulness: 0.97,
      maliciousness: 0.98
    }
  },
  {
    id: '14',
    configId: 'config-14',
    name: '임베딩 모델 A/B 테스트',
    datasetName: '제품 문서 QA',
    modelName: 'Claude-3 Opus',
    vectorDbName: 'Pinecone Production',
    status: 'completed',
    startedAt: '2025-09-18T10:00:00',
    completedAt: '2025-09-18T10:20:00',
    progress: 100,
    scores: {
      faithfulness: 0.88,
      answer_relevancy: 0.91,
      context_precision: 0.90,
      context_recall: 0.89,
      answer_similarity: 0.92,
      coherence: 0.89
    }
  },
  {
    id: '15',
    configId: 'config-15',
    name: '응답 속도 개선 실험',
    datasetName: '기술 FAQ 데이터셋',
    modelName: 'GPT-4 Turbo',
    vectorDbName: 'ChromaDB Local',
    status: 'completed',
    startedAt: '2025-09-15T13:00:00',
    completedAt: '2025-09-15T13:15:00',
    progress: 100,
    scores: {
      faithfulness: 0.89,
      answer_relevancy: 0.88,
      context_precision: 0.87,
      context_recall: 0.85,
      conciseness: 0.92,
      critique_correctness: 0.90
    }
  },
  {
    id: '12',
    configId: 'config-12',
    name: '한국어 처리 성능 평가',
    datasetName: '고객 지원 QA 데이터셋',
    modelName: 'Solar-1 Mini',
    vectorDbName: 'Pinecone Production',
    status: 'completed',
    startedAt: '2025-09-12T11:30:00',
    completedAt: '2025-09-12T11:45:00',
    progress: 100,
    scores: {
      faithfulness: 0.85,
      answer_relevancy: 0.87,
      context_precision: 0.86,
      context_recall: 0.84,
      answer_correctness: 0.86,
      coherence: 0.88,
      critique_correctness: 0.87
    }
  },
  {
    id: '16',
    configId: 'config-16',
    name: '컨텍스트 길이 최적화',
    datasetName: '제품 문서 QA',
    modelName: 'GPT-4o',
    vectorDbName: 'ChromaDB Local',
    status: 'completed',
    startedAt: '2025-09-10T15:00:00',
    completedAt: '2025-09-10T15:22:00',
    progress: 100,
    scores: {
      faithfulness: 0.90,
      answer_relevancy: 0.89,
      context_precision: 0.91,
      context_recall: 0.88,
      context_entity_recall: 0.87,
      answer_similarity: 0.90
    }
  },
  {
    id: '17',
    configId: 'config-17',
    name: '프롬프트 엔지니어링 실험',
    datasetName: '기술 FAQ 데이터셋',
    modelName: 'Claude-3 Opus',
    vectorDbName: 'Weaviate Cloud',
    status: 'completed',
    startedAt: '2025-09-08T09:30:00',
    completedAt: '2025-09-08T09:50:00',
    progress: 100,
    scores: {
      faithfulness: 0.95,
      answer_relevancy: 0.93,
      context_precision: 0.94,
      context_recall: 0.91,
      answer_correctness: 0.92,
      coherence: 0.96,
      critique_correctness: 0.94,
      harmfulness: 0.99,
      maliciousness: 0.99
    }
  }
];

export const mockModels: LLMModel[] = [
  {
    id: 'gpt-4o',
    name: 'gpt-4o',
    provider: 'OpenAI',
    type: 'cloud',
    status: 'active'
  },
  {
    id: 'claude-3-opus',
    name: 'claude-3-opus-20240229',
    provider: 'Anthropic',
    type: 'cloud',
    status: 'active'
  },
  {
    id: 'solar-1-mini',
    name: 'solar-1-mini-korean',
    provider: 'Upstage',
    type: 'cloud',
    status: 'active'
  },
  {
    id: 'gpt-4-turbo',
    name: 'gpt-4-turbo',
    provider: 'OpenAI',
    type: 'cloud',
    status: 'active'
  }
];

export const mockVectorDBs: VectorDB[] = [
  {
    id: 'pinecone-1',
    name: 'Pinecone Production',
    type: 'Pinecone',
    status: 'connected'
  },
  {
    id: 'chroma-1',
    name: 'ChromaDB Local',
    type: 'ChromaDB',
    status: 'connected'
  },
  {
    id: 'weaviate-1',
    name: 'Weaviate Cloud',
    type: 'Weaviate',
    status: 'disconnected'
  }
];

export const mockLogs: LogEntry[] = [
  {
    id: '1',
    timestamp: '2025-09-30T14:30:45',
    level: 'info',
    sessionId: 'eval-session-001',
    message: 'Evaluation started successfully',
    details: '평가: 2025년 3분기 챗봇 평가, Dataset: 고객 지원 QA 데이터셋, Model: GPT-4o'
  },
  {
    id: '2',
    timestamp: '2025-09-30T14:30:50',
    level: 'debug',
    sessionId: 'eval-session-001',
    message: 'Processing question 1/150',
    details: 'Question: 제품 반품 정책은 무엇인가요?'
  },
  {
    id: '3',
    timestamp: '2025-09-30T14:31:15',
    level: 'warning',
    sessionId: 'eval-session-001',
    message: 'Slow response from Vector DB',
    details: 'Response time: 3.2s (threshold: 2s)'
  },
  {
    id: '4',
    timestamp: '2025-10-01T09:00:00',
    level: 'info',
    sessionId: 'eval-session-002',
    message: 'Evaluation started successfully',
    details: '평가: 고객 지원팀 답변 품질 개선, Dataset: 고객 지원 QA 데이터셋, Model: Claude-3 Opus'
  },
  {
    id: '5',
    timestamp: '2025-09-30T14:45:20',
    level: 'info',
    sessionId: 'eval-session-001',
    message: 'Evaluation completed',
    details: '평가: 2025년 3분기 챗봇 평가, Total questions: 150, Avg score: 0.91'
  },
  {
    id: '6',
    timestamp: '2025-09-28T15:20:00',
    level: 'info',
    sessionId: 'eval-session-003',
    message: 'Evaluation started successfully',
    details: '평가: 신규 모델 성능 검증, Dataset: 제품 문서 QA, Model: GPT-4o'
  },
  {
    id: '7',
    timestamp: '2025-09-28T15:35:00',
    level: 'info',
    sessionId: 'eval-session-003',
    message: 'Evaluation completed',
    details: '평가: 신규 모델 성능 검증, Total questions: 150, Avg score: 0.89'
  }
];

// LLM Judge 분석 샘플 데이터
export const mockLLMJudgeAnalyses: LLMJudgeRootCause[] = [
  {
    failure_type: 'Retrieval',
    reason: '핵심 정보가 포함된 문서가 검색되지 않음',
    root_cause: {
      summary_ko: '질문이 "어떤 형식을 지원하나요?"를 묻고 있으나, 검색된 컨텍스트에는 CSV와 JSON만 언급되어 있고 jsonl, txt, yaml에 대한 정보가 전혀 포함되지 않았습니다. 이는 임베딩 모델이 의미적 유사성을 제대로 포착하지 못했거나, Vector DB에 해당 정보가 아예 없을 가능성이 높습니다.',
      advice_ko: '먼저 Vector DB에 모든 지원 형식(csv, json, jsonl, txt, yaml)이 명시된 문서가 실제로 존재하는지 확인하십시오. 존재한다면 임베딩 모델을 text-embedding-ada-002에서 text-embedding-3-large로 업그레이드하십시오.'
    },
    llm_model: 'GPT-4o',
    prompt_version: 'v1.2',
    confidence: 0.92,
    analyzed_at: '2025-09-30T14:46:00'
  },
  {
    failure_type: 'Generation',
    reason: '검색된 컨텍스트를 무시하고 존재하지 않는 기능 설명 (Hallucination)',
    root_cause: {
      summary_ko: '검색된 컨텍스트에는 "평가 기능"만 언급되어 있고 "평가 예약 기능"에 대한 정보가 전혀 없습니다. 그러나 생성 모델이 일반적인 소프트웨어 시스템에서 흔히 볼 수 있는 "예약 기능"을 환각(Hallucination)하여 구체적으로 "관리자 페이지에서 설정"이라는 존재하지 않는 내용까지 생성했습니다.',
      advice_ko: '생성 프롬프트에 "You MUST answer based ONLY on the retrieved context. If the context does not contain the answer, respond with \'I don\'t have enough information\'"라는 강력한 제약을 추가하십시오.'
    },
    llm_model: 'GPT-4o',
    prompt_version: 'v1.2',
    confidence: 0.95,
    analyzed_at: '2025-09-30T14:46:15'
  },
  {
    failure_type: 'Both',
    reason: '컨텍스트 부족 + Hallucination 복합 문제',
    root_cause: {
      summary_ko: '검색 단계에서 "자동 개선 루프" 관련 문서가 검색되지 않았고(Retrieval 실패), 생성 모델은 컨텍스트 없이 임의로 "데이터 수집-모델 학습-배포"라는 일반적인 ML 파이프라인 단계를 환각(Hallucination)하여 답변했습니다. 실제 정답은 "근본 원인 분석 자동화 → 가이드 기반 개선 실험 → 개선 활동 자동화 루프"입니다.',
      advice_ko: '1순위: 임베딩 모델을 업그레이드하고, 청킹 전략을 Semantic Chunking으로 변경하여 Retrieval 품질을 개선하십시오. 2순위: 생성 프롬프트에 "If context is insufficient, respond with \'I don\'t have enough information\'" 제약을 추가하십시오.'
    },
    llm_model: 'GPT-4o',
    prompt_version: 'v1.2',
    confidence: 0.89,
    analyzed_at: '2025-09-30T14:46:30'
  }
];

// 확장된 실패 케이스 (LLM Judge 분석 포함)
export const mockFailedCasesWithAnalysis: FailedCaseWithRootCause[] = [
  {
    id: 'fc-1',
    question: 'RAG 솔루션의 3대 경쟁력은 무엇인가요?',
    expectedAnswer: '통합 진단 보고서, 운영 인프라, 자동 개선 루프',
    generatedAnswer: 'RAG 솔루션은 훌륭하며, 데이터셋 관리가 중요합니다.',
    score: 0.45,
    reason: 'Faithfulness: 45 (질문에 대한 구체적 답변 누락)',
    retrievedContexts: [
      'REX는 RAG 성능 평가 솔루션입니다. 데이터셋 관리, 평가 실행, 결과 분석 등의 기능을 제공합니다.',
      '사용자는 다양한 지표를 선택하여 RAG 시스템을 평가할 수 있습니다.'
    ],
    failedMetric: 'Faithfulness (0.45/1.0)',
    llmJudgeAnalysis: {
      failure_type: 'Both',
      reason: '컨텍스트 부족 + 질문 의도 무시',
      root_cause: {
        summary_ko: '검색된 컨텍스트에 "3대 경쟁력"에 대한 정보가 전혀 포함되지 않아 Retrieval 실패가 발생했습니다. 동시에 생성 모델은 질문의 핵심("3대 경쟁력은 무엇인가요?")을 무시하고 일반적인 설명("데이터셋 관리가 중요합니다")을 생성하여 Generation 문제도 발생했습니다. 이는 두 단계 모두에서 개선이 필요함을 의미합니다.',
        advice_ko: '1단계: Vector DB에 "3대 경쟁력" 또는 "핵심 가치"가 명시된 문서를 추가하거나, 기존 문서의 청킹을 개선하십시오. 2단계: 생성 프롬프트에 "질문에서 요구하는 구체적인 정보(예: 개수, 항목)를 반드시 포함하라"는 제약을 추가하십시오.'
      },
      llm_model: 'GPT-4o',
      prompt_version: 'v1.2',
      confidence: 0.91,
      analyzed_at: '2025-10-13T10:30:00'
    }
  },
  {
    id: 'fc-2',
    question: 'Cost Observability 기능은 무엇을 제공하나요?',
    expectedAnswer: '비용 추적, 예산 관리, 비용 예측, 최적화 제안을 제공합니다.',
    generatedAnswer: '비용 관련 대시보드를 제공하여 사용자가 지출을 확인할 수 있습니다.',
    score: 0.62,
    reason: 'Answer Correctness: 62 (구체적인 4가지 기능 누락)',
    retrievedContexts: [
      'REX는 비용 관련 대시보드를 제공합니다.',
      '사용자는 LLM Judge 호출 시 발생하는 비용을 모니터링할 수 있습니다.'
    ],
    failedMetric: 'Answer Correctness (0.62/1.0)',
    llmJudgeAnalysis: {
      failure_type: 'Retrieval',
      reason: '검색된 문서가 핵심 정보(4가지 세부 기능)를 포함하지 않음',
      root_cause: {
        summary_ko: '질문이 "무엇을 제공하나요?"로 구체적인 기능 목록을 요구하고 있으며, 정답은 4가지 세부 기능(비용 추적, 예산 관리, 비용 예측, 최적화 제안)입니다. 그러나 검색된 컨텍스트는 "비용 관련 대시보드 제공"이라는 추상적인 정보만 포함하여, 생성 모델이 구체적인 답변을 만들 수 없었습니다. Chunk Size가 너무 작거나, Top-K가 부족하여 세부 정보가 포함된 문서를 놓쳤을 가능성이 높습니다.',
        advice_ko: 'Chunk Size를 512에서 1024로 증가시키고, Top-K를 3에서 5로 늘려 더 많은 관련 문서를 검색하십시오. 또한 "Cost Observability" 같은 고유 용어는 Hybrid Search(키워드 + 벡터)를 활성화하여 정확히 찾도록 개선하십시오.'
      },
      llm_model: 'GPT-4o',
      prompt_version: 'v1.2',
      confidence: 0.88,
      analyzed_at: '2025-10-13T10:31:00'
    }
  }
];

export const mockSystemStatus: SystemStatus = {
  api: 'healthy',
  database: 'connected',
  cpuUsage: 45,
  memoryUsage: 62
};

// 평가별 시간에 따른 종합 점수(Overall Score) 데이터
export interface PerformanceOverTime {
  period: string; // 시간 (월 또는 일)
  overallScore: number; // 종합 점수
}

// 전체 평균 - 모든 평가의 Overall Score 평균 (월별)
export const allEvaluationsAverage: PerformanceOverTime[] = [
  { period: '5월', overallScore: 82.5 },
  { period: '6월', overallScore: 85.3 },
  { period: '7월', overallScore: 87.2 },
  { period: '8월', overallScore: 88.9 },
  { period: '9월', overallScore: 90.1 }
];

// 2025년 3분기 챗봇 평가 - 시간별 추이
export const chatbotPerformance: PerformanceOverTime[] = [
  { period: '5/1', overallScore: 87.2 },
  { period: '6/1', overallScore: 88.5 },
  { period: '7/1', overallScore: 89.8 },
  { period: '8/1', overallScore: 90.5 },
  { period: '9/1', overallScore: 91.0 }
];

// 고객 지원팀 답변 품질 개선
export const customerSupportPerformance: PerformanceOverTime[] = [
  { period: '5/1', overallScore: 84.5 },
  { period: '6/1', overallScore: 85.8 },
  { period: '7/1', overallScore: 86.9 },
  { period: '8/1', overallScore: 88.1 },
  { period: '9/1', overallScore: 90.7 }
];

// 신규 모델 성능 검증
export const newModelPerformance: PerformanceOverTime[] = [
  { period: '5/1', overallScore: 79.3 },
  { period: '6/1', overallScore: 82.1 },
  { period: '7/1', overallScore: 84.8 },
  { period: '8/1', overallScore: 87.2 },
  { period: '9/1', overallScore: 89.4 }
];

// 평가 항목 목록
export const evaluationItems = [
  { id: 'all', name: '전체 평균', data: allEvaluationsAverage },
  { id: 'chatbot', name: '2025년 3분기 챗봇 평가', data: chatbotPerformance },
  { id: 'customer-support', name: '고객 지원팀 답변 품질 개선', data: customerSupportPerformance },
  { id: 'new-model', name: '신규 모델 성능 검증', data: newModelPerformance }
];

// -------------------- RAG 시스템 프롬프트 템플릿 --------------------
export interface PromptTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  template: string;
}

export const mockPromptTemplates: PromptTemplate[] = [
  {
    id: 'production-grade',
    name: '[Production Grade] IT 솔루션 전문가',
    category: 'Production',
    description: 'Hallucination 방지 및 12개 RAG 지표 최적화에 이상적인 프로덕션 수준 프롬프트',
    template: `당신은 대한민국 최고의 IT 솔루션 아키텍트이자, 고객 지원 전문가입니다.

## 역할 및 페르소나
1. **전문가:** 귀하의 주된 역할은 제공된 [검색된 컨텍스트]만을 기반으로 사용자의 [질문]에 대해 가장 정확하고 전문적인 답변을 제공하는 것입니다.
2. **톤앤매너:** 답변은 간결하고 명료하며, 신뢰감을 주는 전문적인 한국어 톤을 사용해야 합니다.

## 핵심 답변 규칙 (최우선 순위)
1. **무조건 컨텍스트 기반:** 답변은 **오직** [검색된 컨텍스트]에 포함된 정보만을 사용하여 생성해야 합니다. 컨텍스트에 없는 내용은 절대로 추론하거나 추가하지 마십시오 (Hallucination 금지).
2. **정보 부족 시 대응:** 만약 [검색된 컨텍스트]만으로 질문에 답변하기에 정보가 불충분하다면, "제공된 정보만으로는 답변하기 어렵습니다. 추가 정보를 확인해 주세요."라고 명확하게 명시하고, 임의의 답변을 생성하지 마십시오.
3. **간결하고 직접적인 답변:** 답변은 장황한 서론이나 결론 없이, 질문에 대한 핵심 내용만 간결하게 요약하여 전달하십시오.
4. **안전성 및 중립성 유지:** 답변에는 유해하거나, 편향되거나, 특정 정치적/사회적 의견을 포함하지 않아야 합니다. (Harmfulness, Maliciousness 방지)

## 입력 데이터
---
[검색된 컨텍스트]
{context}

[사용자 질문]
{question}
---

## 답변 생성 지침
위 [핵심 답변 규칙]과 [검색된 컨텍스트]를 준수하여 [사용자 질문]에 대한 최종 답변을 생성하십시오.`
  },
  {
    id: 'customer-support',
    name: '고객 지원 챗봇 (Simple)',
    category: 'Customer Service',
    description: '간단하고 친절한 고객 지원용 프롬프트',
    template: `당신은 전문적인 고객 지원 담당자입니다. 다음 지침을 따라 고객의 질문에 답변하세요:

1. 제공된 컨텍스트(검색된 문서)를 기반으로만 답변하세요
2. 컨텍스트에 정보가 없으면 "죄송합니다. 해당 정보를 찾을 수 없습니다"라고 답변하세요
3. 친절하고 공손한 어조를 유지하세요
4. 구체적인 숫자, 날짜, 절차가 있다면 정확히 포함하세요
5. 답변은 3-5문장으로 간결하게 작성하세요

컨텍스트: {context}

질문: {question}

답변:`
  },
  {
    id: 'technical-docs',
    name: '기술 문서 도우미',
    category: 'Technical',
    description: '기술 문서 기반 질의응답을 위한 정확하고 상세한 프롬프트',
    template: `당신은 시니어 소프트웨어 엔지니어이자 기술 문서 전문가입니다.

## 역할
제공된 [기술 문서]를 기반으로 개발자들의 질문에 정확하고 실용적인 답변을 제공합니다.

## 핵심 규칙
1. **정확성 우선:** [기술 문서]에 명시된 정보만 사용하십시오. 코드 예제, API 엔드포인트, 파라미터는 원문 그대로 제공하세요.
2. **정보 부족 시:** 문서에 정보가 없으면 "해당 정보는 문서에서 확인할 수 없습니다. 공식 문서 또는 개발팀에 문의하세요."라고 답변하세요.
3. **구조화된 답변:** 단계별 절차는 번호를 매기고, 코드는 마크다운 코드 블록으로 감싸세요.
4. **명확한 설명:** 전문 용어는 간단한 부연 설명을 덧붙이되, 과도한 설명은 피하세요.
5. **재현 가능성:** 답변에 포함된 모든 기술 정보(버전, 파라미터, 설정값)는 문서에서 확인 가능해야 합니다.

---
[기술 문서]
{context}

[개발자 질문]
{question}
---

위 규칙을 준수하여 답변하십시오.`
  },
  {
    id: 'faq-assistant',
    name: 'FAQ 자동 응답',
    category: 'FAQ',
    description: '자주 묻는 질문에 빠르고 명확하게 답변하는 프롬프트',
    template: `당신은 FAQ 자동 응답 시스템입니다. 다음 기준으로 답변하세요:

1. 검색된 FAQ 데이터베이스의 내용만 사용하세요
2. 답변은 명확하고 직접적으로 작성하세요
3. 불필요한 설명은 생략하고 핵심만 전달하세요
4. 관련 링크나 추가 정보가 있다면 함께 제공하세요
5. 여러 옵션이 있다면 모두 나열하세요

FAQ 데이터: {context}

질문: {question}

답변:`
  },
  {
    id: 'product-guide',
    name: '제품 가이드',
    category: 'Product',
    description: '제품 사용법과 기능을 설명하는 가이드용 프롬프트',
    template: `당신은 제품 전문가입니다. 사용자가 제품을 효과적으로 사용할 수 있도록 도와주세요:

1. 제공된 제품 문서의 정보를 기반으로 답변하세요
2. 사용 방법은 단계별로 구체적으로 설명하세요
3. 주의사항이나 팁이 있다면 반드시 포함하세요
4. 관련 기능이나 대안이 있다면 함께 안내하세요
5. 사용자 친화적인 언어로 쉽게 설명하세요

제품 문서: {context}

질문: {question}

답변:`
  },
  {
    id: 'compliance-legal',
    name: '법률/규정 준수',
    category: 'Legal',
    description: '법률 및 규정 관련 정보를 정확하게 전달하는 프롬프트',
    template: `당신은 법률/규정 전문 상담사입니다. 높은 정확성이 요구되므로 다음을 엄격히 준수하세요:

1. 제공된 법률 문서의 내용만을 사용하세요 - 절대 추측하지 마세요
2. 조항 번호, 날짜, 금액 등은 정확히 인용하세요
3. 법률 용어는 원문 그대로 사용하세요
4. 해석이 필요한 경우 "전문가 상담이 필요합니다"라고 안내하세요
5. 정보가 없으면 반드시 "해당 정보를 문서에서 확인할 수 없습니다"라고 답변하세요

참조 문서: {context}

질문: {question}

답변:`
  },
  {
    id: 'compliance-legal-v2',
    name: '[강화] 법률/규정 준수 (Hallucination 방지)',
    category: 'Legal',
    description: '법률 정확성을 최우선으로 하는 강화된 프롬프트',
    template: `당신은 법률 및 규정 준수 전문 컨설턴트입니다.

## 역할
제공된 [법률/규정 문서]를 기반으로 법률 관련 질문에 정확하고 신중하게 답변합니다.

## 엄격한 준수 사항 (Critical)
1. **절대 추측 금지:** [법률/규정 문서]에 명시된 내용만 답변하십시오. 법률 해석이나 추론은 절대 하지 마세요.
2. **원문 인용:** 조항 번호, 법률명, 날짜, 금액, 기간 등은 문서의 원문 그대로 정확히 인용하세요.
3. **법률 용어 유지:** 법률 용어는 임의로 변경하거나 의역하지 말고 원문 그대로 사용하세요.
4. **정보 부족 시 명확한 안내:** 
   - 문서에 정보가 없으면: "해당 정보는 제공된 문서에서 확인할 수 없습니다."
   - 해석이 필요하면: "법률 해석이 필요한 사안으로, 변호사 또는 법률 전문가와 상담하시기 바랍니다."
5. **책임 한계 명시:** 답변은 참고용이며, 법적 효력이 없음을 인지하십시오.

---
[법률/규정 문서]
{context}

[법률 질문]
{question}
---

위 엄격한 규칙을 준수하여 답변하십시오.`
  },
  {
    id: 'custom-blank',
    name: '커스텀 프롬프트 (빈 템플릿)',
    category: 'Custom',
    description: '직접 작성할 수 있는 빈 템플릿',
    template: `당신은 [역할]입니다. 다음 지침을 따라 답변하세요:

1. [지침 1]
2. [지침 2]
3. [지침 3]

컨텍스트: {context}

질문: {question}

답변:`
  }
];

// 기본 RAG 하이퍼파라미터 프리셋
export const defaultRAGHyperparameters = {
  top_k: 5,
  chunk_size: 512,
  chunk_overlap: 50,
  retriever_type: 'semantic' as const,
  similarity_threshold: 0.7
};