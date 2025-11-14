# REX API 명세서 v1.0

**최종 업데이트:** 2024년 10월 29일  
**버전:** 1.0  
**상태:** Production Ready

---

## 📋 개요

REX RAG 성능 평가 시스템의 백엔드 API 명세서입니다. RESTful API 설계 원칙을 따르며, 비동기 평가 처리를 위한 Job Queue 아키텍처를 기반으로 합니다.

**Base URL:** `https://api.rex.com/api/v1`

**인증 방식:** Bearer Token (JWT)
```
Authorization: Bearer {access_token}
```

**핵심 특징:**
- ✅ 평가 모드 2가지 (연동된 시스템 / 신규 평가)
- ✅ LLM Judge 비용 90% 절감 시스템
- ✅ 실시간 WebSocket 모니터링
- ✅ 자동 개선 파이프라인
- ✅ 비용 관찰 시스템

---

## 목차

1. [인증 (Authentication)](#1-인증-authentication)
2. [데이터셋 관리 (Datasets)](#2-데이터셋-관리-datasets)
3. [평가 실행 (Evaluations)](#3-평가-실행-evaluations)
4. [평가 결과 (Results)](#4-평가-결과-results)
5. [진단 시스템 (Diagnosis)](#5-진단-시스템-diagnosis)
6. [자동 개선 (Auto-Improve)](#6-자동-개선-auto-improve)
7. [비용 관리 (Cost Observability)](#7-비용-관리-cost-observability)
8. [예산 관리 (Budget Management)](#8-예산-관리-budget-management)
9. [리소스 관리 (Resources)](#9-리소스-관리-resources)
10. [관리자 (Admin)](#10-관리자-admin)
11. [WebSocket](#11-websocket)
12. [에러 코드](#12-에러-코드)

---

## 1. 인증 (Authentication)

### 1.1 로그인
- **Endpoint:** `POST /api/v1/auth/login`
- **설명:** 사용자 인증 및 JWT 토큰 발급

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "refresh_token_here",
    "user": {
      "id": "user-001",
      "email": "user@example.com",
      "name": "김민수",
      "role": "admin"
    },
    "expires_in": 3600
  }
}
```

### 1.2 로그아웃
- **Endpoint:** `POST /api/v1/auth/logout`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 1.3 토큰 갱신
- **Endpoint:** `POST /api/v1/auth/refresh`

**Request Body:**
```json
{
  "refresh_token": "refresh_token_here"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "new_access_token",
    "expires_in": 3600
  }
}
```

### 1.4 현재 사용자 정보
- **Endpoint:** `GET /api/v1/auth/me`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "user-001",
    "email": "user@example.com",
    "name": "김민수",
    "role": "admin",
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

---

## 2. 데이터셋 관리 (Datasets)

### 2.1 데이터셋 목록 조회
- **Endpoint:** `GET /api/v1/datasets`
- **설명:** 사용자가 보유한 모든 데이터셋 목록을 조회합니다.

**Query Parameters:**
- `page` (optional): 페이지 번호 (default: 1)
- `limit` (optional): 페이지당 항목 수 (default: 20)
- `type` (optional): 데이터셋 타입 필터 (`auto-generated` | `uploaded`)
- `search` (optional): 검색어

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "datasets": [
      {
        "id": "dataset-001",
        "name": "고객 지원 QA 데이터셋",
        "type": "auto-generated",
        "qa_count": 150,
        "created_at": "2025-09-25T10:30:00Z",
        "updated_at": "2025-09-25T10:30:00Z",
        "source": "customer_support_docs.pdf",
        "description": "고객 지원 문서 기반 자동 생성 데이터셋"
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 20,
      "total_pages": 3
    }
  }
}
```

### 2.2 데이터셋 상세 조회
- **Endpoint:** `GET /api/v1/datasets/{id}`
- **설명:** 특정 데이터셋의 상세 정보 및 QA 쌍 데이터를 조회합니다.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "dataset-001",
    "name": "고객 지원 QA 데이터셋",
    "type": "auto-generated",
    "qa_count": 150,
    "created_at": "2025-09-25T10:30:00Z",
    "source": "customer_support_docs.pdf",
    "description": "고객 지원 문서 기반 자동 생성 데이터셋",
    "qa_pairs": [
      {
        "id": "qa-001",
        "question": "제품 반품 정책은 무엇인가요?",
        "answer": "구매 후 30일 이내에 미사용 제품은 전액 환불이 가능합니다.",
        "contexts": [
          "반품 정책 문서의 관련 내용..."
        ],
        "metadata": {
          "source_page": 5,
          "confidence": 0.95
        }
      }
    ]
  }
}
```

### 2.3 데이터셋 생성
- **Endpoint:** `POST /api/v1/datasets`
- **설명:** 파일 업로드 또는 자동 생성으로 신규 데이터셋을 등록합니다.
- **Content-Type:** `multipart/form-data`

**Request Body:**
```json
{
  "name": "신규 데이터셋",
  "type": "uploaded",
  "file": "<binary_file_data>",
  "description": "수동 작성 QA 세트"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "dataset-002",
    "name": "신규 데이터셋",
    "qa_count": 200,
    "status": "processing",
    "message": "Dataset is being processed"
  }
}
```

### 2.4 데이터셋 수정
- **Endpoint:** `PUT /api/v1/datasets/{id}`

**Request Body:**
```json
{
  "name": "업데이트된 데이터셋 이름",
  "description": "새로운 설명"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "dataset-001",
    "name": "업데이트된 데이터셋 이름",
    "description": "새로운 설명",
    "updated_at": "2025-10-29T10:00:00Z"
  }
}
```

### 2.5 데이터셋 삭제
- **Endpoint:** `DELETE /api/v1/datasets/{id}`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Dataset deleted successfully"
}
```

### 2.6 데이터셋 미리보기
- **Endpoint:** `GET /api/v1/datasets/{id}/preview`
- **설명:** 데이터셋의 샘플 QA 쌍을 미리 봅니다.

**Query Parameters:**
- `limit` (optional): 미리보기 개수 (default: 10)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "dataset_id": "dataset-001",
    "total_qa_count": 150,
    "preview_count": 10,
    "qa_pairs": [
      {
        "id": "qa-001",
        "question": "제품 반품 정책은 무엇인가요?",
        "answer": "구매 후 30일 이내에 미사용 제품은 전액 환불이 가능합니다."
      }
    ]
  }
}
```

---

## 3. 평가 실행 (Evaluations)

### 🆕 3.1 평가 모드 선택 정보
- **Endpoint:** `GET /api/v1/evaluations/modes`
- **설명:** 사용 가능한 평가 모드 정보를 조회합니다.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "modes": [
      {
        "id": "external",
        "name": "연동된 시스템 평가",
        "description": "이미 운영 중인 RAG 시스템을 API로 연결하여 평가합니다.",
        "icon": "link",
        "use_cases": [
          "운영 중인 챗봇 성능 측정",
          "외부 RAG API 벤치마크"
        ]
      },
      {
        "id": "internal",
        "name": "신규 평가 (실험 모드)",
        "description": "REX 내부에서 RAG 파이프라인을 실행하여 최적 설정을 찾습니다.",
        "icon": "flask",
        "use_cases": [
          "하이퍼파라미터 최적화",
          "새로운 RAG 시스템 구축"
        ]
      }
    ]
  }
}
```

### 3.2 신규 평가 생성 (연동된 시스템)
- **Endpoint:** `POST /api/v1/evaluations/external`
- **설명:** 외부 RAG API를 연동하여 평가를 실행합니다.
- **처리 방식:** Job Queue에 등록 후 즉시 Job ID 반환 (202 Accepted)

**Request Body:**
```json
{
  "name": "고객 지원 챗봇 평가",
  "dataset_id": "dataset-001",
  "external_api": {
    "endpoint": "https://api.example.com/rag/query",
    "method": "POST",
    "headers": {
      "Authorization": "Bearer external_api_key",
      "Content-Type": "application/json"
    },
    "request_template": {
      "query": "{{question}}",
      "session_id": "eval-session"
    },
    "response_mapping": {
      "answer": "$.data.answer",
      "contexts": "$.data.retrieved_docs"
    }
  },
  "metrics": [
    {
      "name": "Faithfulness",
      "is_enabled": true,
      "weight": 1.0,
      "threshold": 0.8
    },
    {
      "name": "Answer Relevancy",
      "is_enabled": true,
      "weight": 1.2,
      "threshold": 0.75
    }
  ],
  "llm_judge_config": {
    "mode": "auto",
    "heuristic_enabled": true,
    "sampling_rate": 0.2,
    "max_cases": 100
  }
}
```

**Response (202 Accepted):**
```json
{
  "success": true,
  "data": {
    "id": "eval-001",
    "job_id": "job-abc123",
    "mode": "external",
    "status": "pending",
    "created_at": "2025-10-29T10:30:00Z",
    "message": "External evaluation job created successfully"
  }
}
```

### 3.3 신규 평가 생성 (내부 실험)
- **Endpoint:** `POST /api/v1/evaluations/internal`
- **설명:** REX 내부 RAG 파이프라인으로 평가를 실행합니다.

**Request Body:**
```json
{
  "name": "RAG 파라미터 최적화 실험",
  "dataset_id": "dataset-001",
  "model_id": "gpt-4o",
  "vector_db_id": "pinecone-1",
  "rag_config": {
    "top_k": 5,
    "chunk_size": 512,
    "chunk_overlap": 50,
    "embedding_model": "text-embedding-3-small",
    "temperature": 0.7,
    "max_tokens": 500
  },
  "metrics": [
    {
      "name": "Faithfulness",
      "is_enabled": true,
      "weight": 1.0,
      "threshold": 0.8
    },
    {
      "name": "Answer Relevancy",
      "is_enabled": true,
      "weight": 1.2,
      "threshold": 0.75
    },
    {
      "name": "Context Precision",
      "is_enabled": true,
      "weight": 1.0,
      "threshold": 0.85
    },
    {
      "name": "Context Recall",
      "is_enabled": true,
      "weight": 1.0,
      "threshold": 0.8
    }
  ],
  "llm_judge_config": {
    "mode": "auto",
    "heuristic_enabled": true,
    "sampling_rate": 0.2,
    "max_cases": 100
  }
}
```

**Response (202 Accepted):**
```json
{
  "success": true,
  "data": {
    "id": "eval-002",
    "job_id": "job-def456",
    "mode": "internal",
    "status": "pending",
    "created_at": "2025-10-29T10:30:00Z",
    "estimated_duration_minutes": 15,
    "estimated_cost": 12.50,
    "message": "Internal evaluation job created successfully"
  }
}
```

### 3.4 평가 이력 조회
- **Endpoint:** `GET /api/v1/evaluations`
- **설명:** 모든 평가 이력을 조회합니다.

**Query Parameters:**
- `status` (optional): 상태 필터 (`pending` | `running` | `completed` | `failed`)
- `mode` (optional): 모드 필터 (`external` | `internal`)
- `page` (optional): 페이지 번호
- `limit` (optional): 페이지당 항목 수
- `sort` (optional): 정렬 기준 (`created_at` | `name`)
- `order` (optional): 정렬 순서 (`asc` | `desc`)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "evaluations": [
      {
        "id": "eval-001",
        "name": "고객 지원 챗봇 평가",
        "mode": "external",
        "dataset_name": "고객 지원 QA 데이터셋",
        "model_name": "External API",
        "status": "completed",
        "overall_score": 0.91,
        "started_at": "2025-09-30T14:30:00Z",
        "completed_at": "2025-09-30T14:45:00Z",
        "duration_minutes": 15,
        "progress": 100,
        "cost": 8.50
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 20,
      "total_pages": 3
    }
  }
}
```

### 3.5 평가 상세 조회
- **Endpoint:** `GET /api/v1/evaluations/{id}`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "eval-001",
    "name": "고객 지원 챗봇 평가",
    "mode": "external",
    "dataset_id": "dataset-001",
    "dataset_name": "고객 지원 QA 데이터셋",
    "status": "completed",
    "progress": 100,
    "config": {
      "metrics": [...],
      "llm_judge_config": {...}
    },
    "created_at": "2025-09-30T14:30:00Z",
    "started_at": "2025-09-30T14:30:00Z",
    "completed_at": "2025-09-30T14:45:00Z",
    "duration_minutes": 15
  }
}
```

### 3.6 실시간 평가 상태 조회 (Polling)
- **Endpoint:** `GET /api/v1/evaluations/{id}/status`
- **설명:** 특정 평가의 실시간 진행 상태를 조회합니다.
- **권장 Polling 주기:** 2-5초

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "eval-001",
    "status": "running",
    "progress": 65,
    "current_task": "Processing question 98/150",
    "current_phase": "metric_calculation",
    "metrics_processed": {
      "faithfulness": 98,
      "answer_relevancy": 98,
      "context_precision": 65
    },
    "estimated_completion": "2025-10-29T11:15:00Z",
    "elapsed_minutes": 10
  }
}
```

### 3.7 평가 중단
- **Endpoint:** `POST /api/v1/evaluations/{id}/stop`
- **설명:** 실행 중인 평가를 중단합니다.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Evaluation stopped successfully",
  "data": {
    "id": "eval-001",
    "status": "stopped",
    "progress": 45,
    "partial_results_available": true
  }
}
```

### 3.8 평가 삭제
- **Endpoint:** `DELETE /api/v1/evaluations/{id}`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Evaluation deleted successfully"
}
```

---

## 4. 평가 결과 (Results)

### 4.1 최종 결과 보고서 조회
- **Endpoint:** `GET /api/v1/results/{evaluation_id}`
- **설명:** 완료된 평가의 최종 점수, 요약, 실패 케이스 정보를 조회합니다.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "result-001",
    "evaluation_id": "eval-001",
    "evaluation_name": "고객 지원 챗봇 평가",
    "status": "completed",
    "started_at": "2025-09-30T14:30:00Z",
    "completed_at": "2025-09-30T14:45:00Z",
    "duration_minutes": 15,
    "scores": {
      "faithfulness": 0.92,
      "answer_relevancy": 0.88,
      "context_precision": 0.95,
      "context_recall": 0.94,
      "answer_correctness": 0.91,
      "context_entity_recall": 0.89,
      "answer_similarity": 0.90,
      "harmfulness": 0.98,
      "maliciousness": 0.99,
      "coherence": 0.93,
      "critique_correctness": 0.91,
      "conciseness": 0.87
    },
    "overall_score": 0.91,
    "grade": "A",
    "summary": "전반적으로 양호한 성능을 보였으나, Conciseness 지표에서 개선이 필요합니다.",
    "failed_cases_count": 12,
    "total_questions": 150,
    "success_rate": 0.92,
    "cost_info": {
      "total_cost": 8.50,
      "llm_judge_cost": 0.45,
      "cost_saved": 4.05,
      "savings_percentage": 90
    }
  }
}
```

### 4.2 실패 케이스 상세 조회
- **Endpoint:** `GET /api/v1/results/{evaluation_id}/failed-cases`
- **설명:** 평가 결과 중 점수가 낮은 실패 케이스들을 조회합니다.

**Query Parameters:**
- `threshold` (optional): 실패 기준 점수 (default: 0.7)
- `failure_type` (optional): 원인 필터 (`retrieval` | `generation` | `hybrid`)
- `diagnosis_status` (optional): 진단 상태 (`heuristic` | `llm_judge` | `not_analyzed`)
- `page` (optional): 페이지 번호
- `limit` (optional): 페이지당 항목 수

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "failed_cases": [
      {
        "id": "case-001",
        "qa_pair_id": "qa-045",
        "question": "데이터셋은 어떤 형식을 지원하나요?",
        "expected_answer": "csv, json, jsonl, txt, yaml을 지원합니다.",
        "generated_answer": "CSV와 JSON 형식을 지원합니다.",
        "retrieved_context": "REX는 CSV와 JSON 형식의 데이터셋을 지원합니다...",
        "scores": {
          "faithfulness": 0.95,
          "answer_relevancy": 0.85,
          "answer_correctness": 0.55,
          "overall": 0.78
        },
        "failure_type": "retrieval",
        "diagnosis_method": "heuristic",
        "diagnosis": {
          "issue": "Context Recall 낮음 (0.45)",
          "reason": "필요한 정보(jsonl, txt, yaml)가 검색되지 않음",
          "suggestion": "Top-K 값을 5에서 10으로 증가 권장"
        },
        "sampled_for_llm_judge": false
      },
      {
        "id": "case-002",
        "qa_pair_id": "qa-067",
        "question": "평가 결과를 어떻게 다운로드하나요?",
        "expected_answer": "결과 페이지에서 CSV 또는 JSON 형식으로 다운로드할 수 있습니다.",
        "generated_answer": "평가 결과는 다양한 형식으로 제공됩니다.",
        "retrieved_context": "REX는 평가 결과 다운로드 기능을 제공합니다...",
        "scores": {
          "faithfulness": 0.65,
          "answer_relevancy": 0.70,
          "answer_correctness": 0.45,
          "overall": 0.60
        },
        "failure_type": "generation",
        "diagnosis_method": "llm_judge",
        "diagnosis": {
          "issue": "생성 답변이 불충분함",
          "reason": "검색된 컨텍스트에는 정보가 있으나 LLM이 제대로 활용하지 못함",
          "suggestion": "Temperature를 0.7에서 0.3으로 낮추고, 프롬프트 개선 필요",
          "llm_analysis": "LLM이 컨텍스트의 핵심 정보(CSV, JSON)를 추출하지 못했습니다..."
        },
        "sampled_for_llm_judge": true
      }
    ],
    "total": 12,
    "diagnosis_summary": {
      "total_failed": 12,
      "heuristic_classified": 5,
      "llm_judge_analyzed": 3,
      "not_analyzed": 4,
      "failure_types": {
        "retrieval": 7,
        "generation": 4,
        "hybrid": 1
      }
    }
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_pages": 1
  }
}
```

### 4.3 지표별 상세 분석
- **Endpoint:** `GET /api/v1/results/{evaluation_id}/metrics/{metric_name}`
- **설명:** 특정 지표의 상세 분석 데이터를 조회합니다.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "metric_name": "Context Recall",
    "overall_score": 0.94,
    "grade": "A",
    "distribution": {
      "0.9-1.0": 120,
      "0.8-0.9": 18,
      "0.7-0.8": 8,
      "below_0.7": 4
    },
    "statistics": {
      "mean": 0.94,
      "median": 0.96,
      "std_dev": 0.08,
      "min": 0.45,
      "max": 1.0
    },
    "top_performers": [
      {
        "qa_pair_id": "qa-012",
        "question": "...",
        "score": 0.98
      }
    ],
    "bottom_performers": [
      {
        "qa_pair_id": "qa-045",
        "question": "...",
        "score": 0.65
      }
    ]
  }
}
```

### 4.4 결과 내보내기
- **Endpoint:** `GET /api/v1/results/{evaluation_id}/export`
- **설명:** 평가 결과를 CSV 또는 JSON 형식으로 다운로드합니다.

**Query Parameters:**
- `format`: `csv` | `json` | `excel`
- `include_failed_cases` (optional): `true` | `false` (default: true)

**Response (200 OK):**
```
Content-Type: application/csv
Content-Disposition: attachment; filename="evaluation-001-results.csv"

[CSV Data]
```

### 4.5 결과 비교
- **Endpoint:** `POST /api/v1/results/compare`
- **설명:** 여러 평가 결과를 비교합니다.

**Request Body:**
```json
{
  "evaluation_ids": ["eval-001", "eval-002", "eval-003"]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "evaluations": [
      {
        "id": "eval-001",
        "name": "Baseline",
        "overall_score": 0.75,
        "scores": {...}
      },
      {
        "id": "eval-002",
        "name": "Optimized",
        "overall_score": 0.89,
        "scores": {...}
      }
    ],
    "comparison": {
      "best_evaluation_id": "eval-002",
      "improvement": 0.14,
      "improvement_percentage": 18.7,
      "metric_improvements": {
        "faithfulness": {
          "before": 0.70,
          "after": 0.92,
          "change": 0.22
        }
      }
    }
  }
}
```

---

## 5. 진단 시스템 (Diagnosis)

### 🆕 5.1 진단 요약 조회
- **Endpoint:** `GET /api/v1/diagnosis/{evaluation_id}/summary`
- **설명:** 평가의 진단 요약 정보를 조회합니다.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "evaluation_id": "eval-001",
    "total_qa_pairs": 150,
    "failed_cases_count": 12,
    "diagnosis_summary": {
      "heuristic_classified": 5,
      "llm_judge_analyzed": 3,
      "not_analyzed": 4,
      "total_diagnosed": 8
    },
    "failure_breakdown": {
      "retrieval": {
        "count": 7,
        "percentage": 58.3,
        "avg_score": 0.62
      },
      "generation": {
        "count": 4,
        "percentage": 33.3,
        "avg_score": 0.65
      },
      "hybrid": {
        "count": 1,
        "percentage": 8.4,
        "avg_score": 0.55
      }
    },
    "cost_info": {
      "total_llm_judge_calls": 3,
      "llm_judge_cost": 0.45,
      "potential_cost_without_optimization": 5.40,
      "cost_saved": 4.95,
      "savings_percentage": 91.7
    },
    "sampling_config": {
      "mode": "auto",
      "heuristic_enabled": true,
      "sampling_rate": 0.2,
      "max_cases": 100
    }
  }
}
```

### 🆕 5.2 진단 실행
- **Endpoint:** `POST /api/v1/diagnosis/{evaluation_id}/run`
- **설명:** 실패 케이스에 대한 진단을 실행합니다.

**Request Body:**
```json
{
  "case_ids": ["case-001", "case-002"],
  "force_llm_judge": false
}
```

**Response (202 Accepted):**
```json
{
  "success": true,
  "data": {
    "diagnosis_job_id": "diag-job-001",
    "status": "pending",
    "cases_to_analyze": 2,
    "estimated_cost": 0.30
  }
}
```

### 🆕 5.3 휴리스틱 분류 규칙 조회
- **Endpoint:** `GET /api/v1/diagnosis/heuristic-rules`
- **설명:** 휴리스틱 자동 분류 규칙을 조회합니다.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "rules": [
      {
        "id": "rule-001",
        "name": "Trivial Failure",
        "condition": "overall_score < 0.2",
        "classification": "low_priority",
        "skip_llm_judge": true
      },
      {
        "id": "rule-002",
        "name": "Clear Retrieval Issue",
        "condition": "context_recall < 0.1 AND context_precision < 0.2",
        "classification": "retrieval",
        "skip_llm_judge": true
      },
      {
        "id": "rule-003",
        "name": "Clear Generation Issue",
        "condition": "context_recall > 0.9 AND faithfulness < 0.3",
        "classification": "generation",
        "skip_llm_judge": true
      }
    ]
  }
}
```

---

## 6. 자동 개선 (Auto-Improve)

### 6.1 근본 원인 분석 (Root Cause Analysis)
- **Endpoint:** `POST /api/v1/auto-improve/analyze`
- **설명:** 평가 결과를 분석하여 성능 저하의 근본 원인을 파악하고 최적화 전략을 제안합니다.

**Request Body:**
```json
{
  "evaluation_id": "eval-001",
  "target_metrics": ["context_recall", "faithfulness"]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "evaluation_id": "eval-001",
    "current_score": 0.72,
    "root_causes": {
      "retrieval": {
        "severity": "high",
        "affected_metrics": ["context_recall", "context_precision"],
        "scores": {
          "context_recall": 0.62,
          "context_precision": 0.68,
          "context_entity_recall": 0.71
        },
        "avg_score": 0.67,
        "priority_params": ["top_k", "chunk_size", "embedding_model"]
      },
      "generation": {
        "severity": "medium",
        "affected_metrics": ["faithfulness"],
        "scores": {
          "faithfulness": 0.68,
          "answer_relevancy": 0.80,
          "answer_correctness": 0.75
        },
        "avg_score": 0.74,
        "priority_params": ["temperature", "llm_model"]
      }
    },
    "recommended_strategy": "retrieval_first",
    "optimization_plan": {
      "phase_1": {
        "focus": "retrieval",
        "parameters": ["top_k", "chunk_size"],
        "estimated_experiments": 6
      },
      "phase_2": {
        "focus": "generation",
        "parameters": ["temperature"],
        "estimated_experiments": 4
      }
    },
    "estimated_experiments": 12,
    "estimated_cost": 18.00,
    "estimated_duration_minutes": 180,
    "expected_improvement": "15-25%"
  }
}
```

### 6.2 자동 개선 작업 생성
- **Endpoint:** `POST /api/v1/auto-improve/jobs`
- **설명:** 자동 개선 작업을 생성하고 비동기로 실행을 시작합니다.

**Request Body:**
```json
{
  "base_evaluation_id": "eval-001",
  "name": "고객 지원 RAG 최적화",
  "strategy": "retrieval_first",
  "optimization_level": "rule_based",
  "target_metrics": ["context_recall", "faithfulness"],
  "early_stopping": {
    "enabled": true,
    "min_improvement": 0.05,
    "patience": 3,
    "target_score": 0.9
  },
  "budget": {
    "max_experiments": 15,
    "max_cost": 25.00,
    "max_duration_minutes": 240
  }
}
```

**Response (202 Accepted):**
```json
{
  "success": true,
  "data": {
    "job_id": "auto-improve-job-001",
    "name": "고객 지원 RAG 최적화",
    "status": "pending",
    "created_at": "2025-10-29T10:00:00Z",
    "planned_experiments": 12,
    "estimated_cost": 18.00,
    "estimated_duration_minutes": 180,
    "websocket_url": "wss://api.rex.com/ws/auto-improve/auto-improve-job-001"
  }
}
```

### 6.3 자동 개선 작업 목록 조회
- **Endpoint:** `GET /api/v1/auto-improve/jobs`

**Query Parameters:**
- `page` (optional): 페이지 번호
- `limit` (optional): 페이지당 항목 수
- `status` (optional): 상태 필터 (`pending` | `running` | `completed` | `failed` | `cancelled`)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "job_id": "auto-improve-job-001",
        "name": "고객 지원 RAG 최적화",
        "base_evaluation_id": "eval-001",
        "strategy": "retrieval_first",
        "status": "running",
        "created_at": "2025-10-29T10:00:00Z",
        "progress": 45,
        "experiments_completed": 5,
        "total_experiments": 12,
        "current_best_score": 0.85,
        "improvement_rate": 0.18
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 20,
      "total_pages": 2
    }
  }
}
```

### 6.4 자동 개선 작업 상세 조회
- **Endpoint:** `GET /api/v1/auto-improve/jobs/{job_id}`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "job_id": "auto-improve-job-001",
    "name": "고객 지원 RAG 최적화",
    "base_evaluation_id": "eval-001",
    "strategy": "retrieval_first",
    "optimization_level": "rule_based",
    "status": "completed",
    "created_at": "2025-10-29T10:00:00Z",
    "started_at": "2025-10-29T10:05:00Z",
    "completed_at": "2025-10-29T13:15:00Z",
    "duration_minutes": 190,
    "experiments_completed": 12,
    "baseline_score": 0.72,
    "best_score": 0.89,
    "improvement_rate": 0.236,
    "best_config": {
      "top_k": 10,
      "chunk_size": 512,
      "embedding_model": "text-embedding-3-large",
      "temperature": 0.3,
      "llm_model": "Claude-3.5 Sonnet",
      "max_tokens": 512
    },
    "improvement_details": {
      "context_recall": { "before": 0.65, "after": 0.88, "change": 0.23 },
      "faithfulness": { "before": 0.70, "after": 0.92, "change": 0.22 },
      "answer_relevancy": { "before": 0.80, "after": 0.87, "change": 0.07 }
    },
    "experiments": [
      {
        "id": "exp-001",
        "name": "Baseline",
        "order": 1,
        "config": { "top_k": 5, "chunk_size": 512 },
        "status": "completed",
        "overall_score": 0.72,
        "rank": 12,
        "is_baseline": true
      },
      {
        "id": "exp-002",
        "name": "Top-K=10",
        "order": 2,
        "config": { "top_k": 10, "chunk_size": 512 },
        "status": "completed",
        "overall_score": 0.89,
        "rank": 1,
        "improvement": "+23.6%",
        "is_best": true
      }
    ],
    "total_cost": 18.50,
    "early_stopped": false
  }
}
```

### 6.5 자동 개선 진행 상태 조회
- **Endpoint:** `GET /api/v1/auto-improve/jobs/{job_id}/status`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "job_id": "auto-improve-job-001",
    "status": "running",
    "progress": 58,
    "current_experiment_index": 7,
    "total_experiments": 12,
    "experiments_completed": 7,
    "current_best_score": 0.85,
    "baseline_score": 0.72,
    "current_improvement_rate": 0.18,
    "current_experiment": {
      "id": "exp-007",
      "name": "Embedding=3-large",
      "progress": 45,
      "status": "running"
    },
    "elapsed_minutes": 110,
    "estimated_remaining_minutes": 80
  }
}
```

### 6.6 자동 개선 작업 취소
- **Endpoint:** `POST /api/v1/auto-improve/jobs/{job_id}/cancel`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "job_id": "auto-improve-job-001",
    "status": "cancelled",
    "experiments_completed": 7,
    "current_best_score": 0.85,
    "partial_results_available": true,
    "message": "Auto-improve job cancelled successfully"
  }
}
```

### 6.7 자동 개선 작업 일시정지
- **Endpoint:** `POST /api/v1/auto-improve/jobs/{job_id}/pause`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "job_id": "auto-improve-job-001",
    "status": "paused",
    "experiments_completed": 5,
    "message": "Auto-improve job paused successfully"
  }
}
```

### 6.8 자동 개선 작업 재개
- **Endpoint:** `POST /api/v1/auto-improve/jobs/{job_id}/resume`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "job_id": "auto-improve-job-001",
    "status": "running",
    "message": "Auto-improve job resumed successfully"
  }
}
```

### 6.9 최적 설정 적용
- **Endpoint:** `POST /api/v1/auto-improve/jobs/{job_id}/apply`
- **설명:** 자동 개선으로 찾은 최적 설정을 새 평가에 적용합니다.

**Request Body:**
```json
{
  "dataset_id": "dataset-002",
  "evaluation_name": "최적 설정 적용 평가"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "evaluation_id": "eval-003",
    "name": "최적 설정 적용 평가",
    "config": {
      "top_k": 10,
      "chunk_size": 512,
      "embedding_model": "text-embedding-3-large",
      "temperature": 0.3,
      "llm_model": "Claude-3.5 Sonnet"
    },
    "status": "pending",
    "job_id": "job-xyz789",
    "message": "Best configuration applied to new evaluation"
  }
}
```

---

## 7. 비용 관리 (Cost Observability)

### 7.1 비용 대시보드 데이터
- **Endpoint:** `GET /api/v1/costs/dashboard`
- **설명:** 비용 대시보드에 표시할 전체 데이터를 조회합니다.

**Query Parameters:**
- `period` (optional): 기간 필터 (`today` | `week` | `month` | `all`) (default: `month`)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "period": "month",
    "summary": {
      "total_cost": 1847.32,
      "total_evaluations": 45,
      "total_qa_processed": 6750,
      "avg_cost_per_evaluation": 41.05,
      "avg_cost_per_qa": 0.27,
      "total_saved": 16625.88,
      "savings_percentage": 90
    },
    "cost_by_provider": [
      {
        "provider": "openai",
        "model": "GPT-4o",
        "cost": 1142.45,
        "percentage": 61.8,
        "evaluations": 30
      },
      {
        "provider": "anthropic",
        "model": "Claude-3.5 Sonnet",
        "cost": 542.87,
        "percentage": 29.4,
        "evaluations": 12
      }
    ],
    "cost_by_category": [
      {
        "category": "metric_calculation",
        "cost": 1402.20,
        "percentage": 75.9
      },
      {
        "category": "llm_judge",
        "cost": 445.12,
        "percentage": 24.1
      }
    ],
    "cost_trend": [
      {
        "date": "2025-10-22",
        "cost": 234.56,
        "evaluations": 5
      },
      {
        "date": "2025-10-23",
        "cost": 289.34,
        "evaluations": 7
      }
    ],
    "top_expensive_evaluations": [
      {
        "id": "eval-042",
        "name": "대규모 평가",
        "cost": 125.50,
        "qa_count": 500,
        "date": "2025-10-25"
      }
    ]
  }
}
```

### 7.2 평가별 비용 상세 조회
- **Endpoint:** `GET /api/v1/costs/evaluations/{evaluation_id}`
- **설명:** 특정 평가의 상세 비용 분석을 조회합니다.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "evaluation_id": "eval-001",
    "evaluation_name": "고객 지원 QA 평가",
    "total_cost": 45.67,
    "qa_count": 150,
    "cost_per_qa": 0.304,
    "breakdown": {
      "metric_calculation": {
        "cost": 42.10,
        "percentage": 92.2
      },
      "llm_judge": {
        "cost": 3.57,
        "percentage": 7.8,
        "calls": 12,
        "potential_cost": 67.50,
        "saved": 63.93,
        "savings_percentage": 94.7
      }
    },
    "metric_costs": [
      {
        "metric_name": "faithfulness",
        "llm_model": "GPT-4o",
        "total_calls": 150,
        "input_tokens": 120000,
        "output_tokens": 22500,
        "cached_tokens": 0,
        "cost": 3.56,
        "avg_latency_ms": 1245
      },
      {
        "metric_name": "answer_relevancy",
        "llm_model": "GPT-4o",
        "total_calls": 150,
        "input_tokens": 105000,
        "output_tokens": 18000,
        "cached_tokens": 0,
        "cost": 3.12,
        "avg_latency_ms": 1120
      }
    ],
    "timestamp": "2025-10-29T10:30:00Z",
    "duration_minutes": 18,
    "status": "completed"
  }
}
```

### 7.3 비용 예측
- **Endpoint:** `POST /api/v1/costs/predict`
- **설명:** 평가 생성 전 예상 비용을 계산합니다.

**Request Body:**
```json
{
  "dataset_id": "dataset-001",
  "metrics": [
    "faithfulness",
    "answer_relevancy",
    "context_precision",
    "context_recall"
  ],
  "llm_model": "GPT-4o",
  "llm_judge_config": {
    "mode": "auto",
    "sampling_rate": 0.3
  },
  "use_caching": false
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "estimated_cost": 13.70,
    "breakdown": {
      "metric_calculation": 12.50,
      "llm_judge": 1.20,
      "potential_llm_judge_cost": 13.50,
      "llm_judge_savings": 12.30,
      "savings_percentage": 91.1
    },
    "metric_breakdown": [
      {
        "metric_name": "faithfulness",
        "qa_count": 150,
        "estimated_tokens": 142750,
        "estimated_cost": 3.56
      },
      {
        "metric_name": "answer_relevancy",
        "qa_count": 150,
        "estimated_tokens": 123900,
        "estimated_cost": 3.12
      }
    ],
    "confidence": "high",
    "assumptions": [
      "150개 QA 평가",
      "LLM Judge 샘플링 30%",
      "캐싱 비활성화"
    ]
  }
}
```

### 7.4 비용 로그 조회
- **Endpoint:** `GET /api/v1/costs/logs`
- **설명:** 상세 비용 로그를 조회합니다.

**Query Parameters:**
- `evaluation_id` (optional): 특정 평가 필터
- `operation` (optional): 작업 타입 (`metric_calculation` | `llm_judge`)
- `start_date` (optional): 시작 날짜 (ISO 8601)
- `end_date` (optional): 종료 날짜 (ISO 8601)
- `page` (optional): 페이지 번호
- `limit` (optional): 페이지당 항목 수

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "log-001",
        "evaluation_id": "eval-001",
        "operation": "metric_calculation",
        "metric_name": "faithfulness",
        "model": "GPT-4o",
        "tokens_used": 142750,
        "input_tokens": 120000,
        "output_tokens": 22750,
        "cached_tokens": 0,
        "cost_usd": 3.56,
        "timestamp": "2025-10-29T10:30:00Z"
      }
    ],
    "total_cost": 45.67
  },
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 50,
    "total_pages": 3
  }
}
```

### 7.5 LLM 가격 정보
- **Endpoint:** `GET /api/v1/costs/pricing`
- **설명:** 지원하는 LLM 모델의 토큰 가격 정보를 조회합니다.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "pricing": [
      {
        "provider": "openai",
        "model": "GPT-4o",
        "input_price_per_1k": 0.0025,
        "output_price_per_1k": 0.01,
        "cache_price_per_1k": 0.00125
      },
      {
        "provider": "openai",
        "model": "GPT-4o-mini",
        "input_price_per_1k": 0.00015,
        "output_price_per_1k": 0.0006,
        "cache_price_per_1k": 0.000075
      },
      {
        "provider": "anthropic",
        "model": "Claude-3.5 Sonnet",
        "input_price_per_1k": 0.003,
        "output_price_per_1k": 0.015,
        "cache_price_per_1k": 0.0015
      }
    ],
    "last_updated": "2025-10-01T00:00:00Z"
  }
}
```

### 7.6 비용 최적화 제안
- **Endpoint:** `GET /api/v1/costs/optimize`
- **설명:** 비용 절감을 위한 최적화 제안을 생성합니다.

**Query Parameters:**
- `evaluation_id` (optional): 특정 평가 기준 분석

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "current_monthly_cost": 1847.32,
    "suggestions": [
      {
        "id": "opt-001",
        "type": "llm_judge_sampling",
        "priority": "high",
        "title": "LLM Judge 샘플링 최적화",
        "description": "현재 50% 샘플링 중입니다. 20%로 낮춰도 진단 정확도는 5% 이내 감소합니다.",
        "estimated_savings": 923.66,
        "estimated_savings_percentage": 50,
        "impact_on_accuracy": "진단 정확도 5% 감소 예상",
        "implementation_effort": "easy"
      },
      {
        "id": "opt-002",
        "type": "model_switch",
        "priority": "medium",
        "title": "GPT-4o → GPT-4o-mini 부분 전환",
        "description": "Generation 지표를 GPT-4o-mini로 평가하여 비용을 60% 절감할 수 있습니다.",
        "estimated_savings": 685.47,
        "estimated_savings_percentage": 37,
        "impact_on_accuracy": "정확도 3% 감소 예상",
        "implementation_effort": "easy"
      },
      {
        "id": "opt-003",
        "type": "metric_selection",
        "priority": "low",
        "title": "필수 지표만 선택",
        "description": "12개 지표 중 핵심 6개만 활성화하여 비용을 50% 절감할 수 있습니다.",
        "estimated_savings": 461.83,
        "estimated_savings_percentage": 25,
        "impact_on_accuracy": "전체적인 평가 범위 축소",
        "implementation_effort": "medium"
      }
    ],
    "potential_total_savings": 2070.96,
    "potential_total_savings_percentage": 112
  }
}
```

---

## 8. 예산 관리 (Budget Management)

### 8.1 예산 목록 조회
- **Endpoint:** `GET /api/v1/budgets`

**Query Parameters:**
- `type` (optional): `project` | `user` | `organization`
- `page` (optional): 페이지 번호
- `limit` (optional): 페이지당 항목 수

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "budgets": [
      {
        "id": "budget-001",
        "name": "월간 평가 예산",
        "type": "organization",
        "entity_id": "org-001",
        "limit": 2000,
        "current_usage": 1847.32,
        "percentage_used": 92.4,
        "period": "monthly",
        "reset_date": "2025-11-01T00:00:00Z",
        "alert_thresholds": [50, 80, 95],
        "is_hard_limit": false,
        "created_at": "2025-10-01T00:00:00Z",
        "updated_at": "2025-10-29T10:00:00Z"
      }
    ]
  },
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 20,
    "total_pages": 1
  }
}
```

### 8.2 예산 상세 조회
- **Endpoint:** `GET /api/v1/budgets/{budget_id}`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "budget-001",
    "name": "월간 평가 예산",
    "type": "organization",
    "entity_id": "org-001",
    "limit": 2000,
    "current_usage": 1847.32,
    "percentage_used": 92.4,
    "remaining": 152.68,
    "period": "monthly",
    "reset_date": "2025-11-01T00:00:00Z",
    "alert_thresholds": [50, 80, 95],
    "is_hard_limit": false,
    "usage_history": [
      {
        "date": "2025-10-22",
        "cost": 234.56,
        "cumulative": 1234.56
      },
      {
        "date": "2025-10-23",
        "cost": 289.34,
        "cumulative": 1523.90
      }
    ],
    "created_at": "2025-10-01T00:00:00Z",
    "updated_at": "2025-10-29T10:00:00Z"
  }
}
```

### 8.3 예산 생성
- **Endpoint:** `POST /api/v1/budgets`

**Request Body:**
```json
{
  "name": "월간 평가 예산",
  "type": "organization",
  "entity_id": "org-001",
  "limit": 2000,
  "period": "monthly",
  "alert_thresholds": [50, 80, 95],
  "is_hard_limit": false
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "budget-001",
    "name": "월간 평가 예산",
    "type": "organization",
    "entity_id": "org-001",
    "limit": 2000,
    "period": "monthly",
    "current_usage": 0,
    "percentage_used": 0,
    "alert_thresholds": [50, 80, 95],
    "is_hard_limit": false,
    "created_at": "2025-10-29T10:00:00Z"
  }
}
```

### 8.4 예산 수정
- **Endpoint:** `PUT /api/v1/budgets/{budget_id}`

**Request Body:**
```json
{
  "limit": 2500,
  "alert_thresholds": [60, 85, 95],
  "is_hard_limit": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "budget-001",
    "name": "월간 평가 예산",
    "limit": 2500,
    "alert_thresholds": [60, 85, 95],
    "is_hard_limit": true,
    "updated_at": "2025-10-29T11:00:00Z"
  }
}
```

### 8.5 예산 삭제
- **Endpoint:** `DELETE /api/v1/budgets/{budget_id}`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Budget deleted successfully"
}
```

### 8.6 예산 알림 조회
- **Endpoint:** `GET /api/v1/budgets/alerts`

**Query Parameters:**
- `severity` (optional): `info` | `warning` | `critical`
- `is_acknowledged` (optional): `true` | `false`
- `page` (optional): 페이지 번호
- `limit` (optional): 페이지당 항목 수

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "id": "alert-001",
        "budget_id": "budget-001",
        "budget_name": "월간 평가 예산",
        "type": "threshold_exceeded",
        "severity": "critical",
        "message": "월간 평가 예산의 92.4%를 사용했습니다 (Hard Limit 도달 임박)",
        "current_usage": 1847.32,
        "budget_limit": 2000,
        "percentage_used": 92.4,
        "threshold": 80,
        "timestamp": "2025-10-29T10:30:00Z",
        "is_acknowledged": false
      }
    ]
  },
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 20,
    "total_pages": 1
  }
}
```

### 8.7 알림 확인 처리
- **Endpoint:** `POST /api/v1/budgets/alerts/{alert_id}/acknowledge`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "alert-001",
    "is_acknowledged": true,
    "acknowledged_at": "2025-10-29T11:00:00Z",
    "acknowledged_by": "user-001"
  }
}
```

---

## 9. 리소스 관리 (Resources)

### 9.1 LLM 모델 목록 조회
- **Endpoint:** `GET /api/v1/models`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "models": [
      {
        "id": "gpt-4o",
        "name": "GPT-4o",
        "provider": "OpenAI",
        "type": "cloud",
        "status": "active",
        "max_tokens": 4096,
        "supports_caching": true
      },
      {
        "id": "gpt-4o-mini",
        "name": "GPT-4o-mini",
        "provider": "OpenAI",
        "type": "cloud",
        "status": "active",
        "max_tokens": 4096,
        "supports_caching": true
      },
      {
        "id": "claude-3.5-sonnet",
        "name": "Claude-3.5 Sonnet",
        "provider": "Anthropic",
        "type": "cloud",
        "status": "active",
        "max_tokens": 4096,
        "supports_caching": true
      }
    ]
  }
}
```

### 9.2 Vector DB 목록 조회
- **Endpoint:** `GET /api/v1/vector-dbs`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "vector_dbs": [
      {
        "id": "pinecone-1",
        "name": "Pinecone Production",
        "type": "Pinecone",
        "status": "connected",
        "index_name": "rag-production",
        "dimension": 1536,
        "total_vectors": 125000
      },
      {
        "id": "chromadb-1",
        "name": "ChromaDB Local",
        "type": "ChromaDB",
        "status": "connected",
        "collection_name": "rag-local",
        "dimension": 1536,
        "total_vectors": 50000
      }
    ]
  }
}
```

### 9.3 평가 지표 목록 조회
- **Endpoint:** `GET /api/v1/metrics`
- **설명:** 시스템에서 지원하는 모든 평가 지표 목록을 조회합니다.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "metrics": [
      {
        "id": "faithfulness",
        "name": "Faithfulness",
        "description": "생성된 답변이 검색된 문서 내용에 얼마나 충실한지 평가",
        "category": "generation",
        "requires_llm": true,
        "default_weight": 1.0,
        "default_threshold": 0.8
      },
      {
        "id": "answer_relevancy",
        "name": "Answer Relevancy",
        "description": "생성된 답변이 질문에 얼마나 관련있는지 평가",
        "category": "generation",
        "requires_llm": true,
        "default_weight": 1.2,
        "default_threshold": 0.75
      },
      {
        "id": "context_precision",
        "name": "Context Precision",
        "description": "검색된 컨텍스트가 질문에 대해 얼마나 정확한지 평가",
        "category": "retrieval",
        "requires_llm": true,
        "default_weight": 1.0,
        "default_threshold": 0.85
      },
      {
        "id": "context_recall",
        "name": "Context Recall",
        "description": "필요한 정보를 얼마나 잘 검색했는지 평가",
        "category": "retrieval",
        "requires_llm": true,
        "default_weight": 1.0,
        "default_threshold": 0.8
      },
      {
        "id": "answer_correctness",
        "name": "Answer Correctness",
        "description": "답변의 사실적 정확성 평가",
        "category": "quality",
        "requires_llm": true,
        "default_weight": 1.0,
        "default_threshold": 0.75
      },
      {
        "id": "answer_similarity",
        "name": "Answer Similarity",
        "description": "생성된 답변과 정답의 의미 유사도",
        "category": "quality",
        "requires_llm": false,
        "default_weight": 0.8,
        "default_threshold": 0.7
      },
      {
        "id": "context_entity_recall",
        "name": "Context Entity Recall",
        "description": "검색 문서에서 주요 엔티티를 얼마나 잘 찾았는지",
        "category": "retrieval",
        "requires_llm": false,
        "default_weight": 0.9,
        "default_threshold": 0.75
      },
      {
        "id": "coherence",
        "name": "Coherence",
        "description": "답변의 논리적 일관성",
        "category": "quality",
        "requires_llm": true,
        "default_weight": 0.8,
        "default_threshold": 0.8
      },
      {
        "id": "conciseness",
        "name": "Conciseness",
        "description": "답변의 간결성",
        "category": "quality",
        "requires_llm": true,
        "default_weight": 0.7,
        "default_threshold": 0.75
      },
      {
        "id": "critique_correctness",
        "name": "Critique Correctness",
        "description": "특정 측면에 대한 평가 (예: 친절함, 정확함)",
        "category": "quality",
        "requires_llm": true,
        "default_weight": 0.8,
        "default_threshold": 0.75
      },
      {
        "id": "harmfulness",
        "name": "Harmfulness",
        "description": "유해 콘텐츠 감지",
        "category": "safety",
        "requires_llm": true,
        "default_weight": 1.5,
        "default_threshold": 0.9
      },
      {
        "id": "maliciousness",
        "name": "Maliciousness",
        "description": "악의적 내용 감지",
        "category": "safety",
        "requires_llm": true,
        "default_weight": 1.5,
        "default_threshold": 0.9
      }
    ],
    "categories": [
      {
        "id": "retrieval",
        "name": "Retrieval Metrics",
        "description": "검색 품질 평가 지표"
      },
      {
        "id": "generation",
        "name": "Generation Metrics",
        "description": "생성 품질 평가 지표"
      },
      {
        "id": "quality",
        "name": "Quality Metrics",
        "description": "답변 품질 평가 지표"
      },
      {
        "id": "safety",
        "name": "Safety Metrics",
        "description": "안전성 평가 지표"
      }
    ]
  }
}
```

---

## 10. 관리자 (Admin)

### 10.1 사용자 관리
- **Endpoint:** `GET /api/v1/admin/users`
- **권한:** Admin만 접근 가능

**Query Parameters:**
- `role` (optional): 역할 필터 (`admin` | `user` | `viewer`)
- `page` (optional): 페이지 번호
- `limit` (optional): 페이지당 항목 수

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user-001",
        "email": "admin@example.com",
        "name": "김관리자",
        "role": "admin",
        "created_at": "2025-01-01T00:00:00Z",
        "last_login": "2025-10-29T09:00:00Z",
        "total_evaluations": 45
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 20,
      "total_pages": 2
    }
  }
}
```

### 10.2 시스템 상태 조회
- **Endpoint:** `GET /api/v1/admin/system-status`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "uptime_seconds": 86400,
    "services": {
      "api": "healthy",
      "database": "healthy",
      "redis": "healthy",
      "celery": "healthy"
    },
    "queue_status": {
      "pending_jobs": 5,
      "running_jobs": 3,
      "failed_jobs": 0
    },
    "database_stats": {
      "total_evaluations": 1250,
      "total_datasets": 150,
      "total_users": 25
    }
  }
}
```

### 10.3 로그 조회
- **Endpoint:** `GET /api/v1/admin/logs`

**Query Parameters:**
- `level` (optional): 로그 레벨 (`DEBUG` | `INFO` | `WARNING` | `ERROR`)
- `service` (optional): 서비스 이름
- `start_time` (optional): 시작 시간 (ISO 8601)
- `end_time` (optional): 종료 시간 (ISO 8601)
- `page` (optional): 페이지 번호
- `limit` (optional): 페이지당 항목 수

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "log-001",
        "timestamp": "2025-10-29T10:30:00Z",
        "level": "INFO",
        "service": "api",
        "message": "Evaluation eval-001 completed successfully",
        "user_id": "user-001",
        "request_id": "req-abc123"
      }
    ]
  },
  "pagination": {
    "total": 5000,
    "page": 1,
    "limit": 100,
    "total_pages": 50
  }
}
```

---

## 11. WebSocket

### 11.1 평가 실시간 모니터링
- **Endpoint:** `wss://api.rex.com/ws/evaluations/{evaluation_id}`
- **설명:** 평가 진행 상황을 실시간으로 수신합니다.
- **인증:** Query Parameter로 토큰 전달 `?token={access_token}`

**연결 확인:**
```json
{
  "type": "connection_established",
  "data": {
    "evaluation_id": "eval-001",
    "timestamp": "2025-10-29T10:00:00Z"
  }
}
```

**진행률 업데이트:**
```json
{
  "type": "progress_update",
  "data": {
    "evaluation_id": "eval-001",
    "progress": 45,
    "status": "running",
    "current_task": "Calculating faithfulness for QA pair 68/150",
    "current_phase": "metric_calculation",
    "metrics": {
      "faithfulness": 0.85,
      "answer_relevancy": 0.92
    },
    "timestamp": "2025-10-29T10:30:00Z"
  }
}
```

**로그 메시지:**
```json
{
  "type": "log",
  "data": {
    "evaluation_id": "eval-001",
    "level": "info",
    "message": "Starting metric calculation for QA pair 68",
    "timestamp": "2025-10-29T10:30:05Z"
  }
}
```

**완료 알림:**
```json
{
  "type": "completion",
  "data": {
    "evaluation_id": "eval-001",
    "status": "completed",
    "overall_score": 0.91,
    "duration_minutes": 15,
    "cost": 8.50,
    "timestamp": "2025-10-29T10:45:00Z"
  }
}
```

**오류 발생:**
```json
{
  "type": "error",
  "data": {
    "evaluation_id": "eval-001",
    "error": "LLM API rate limit exceeded",
    "timestamp": "2025-10-29T10:35:00Z"
  }
}
```

### 11.2 자동 개선 실시간 모니터링
- **Endpoint:** `wss://api.rex.com/ws/auto-improve/{job_id}`
- **설명:** 자동 개선 작업의 실시간 진행 상황을 수신합니다.

**실험 시작:**
```json
{
  "type": "experiment_start",
  "data": {
    "job_id": "auto-improve-job-001",
    "experiment_id": "exp-002",
    "experiment_name": "Top-K=10",
    "experiment_index": 2,
    "total_experiments": 12,
    "progress": 16,
    "timestamp": "2025-10-29T10:15:00Z"
  }
}
```

**실험 진행:**
```json
{
  "type": "experiment_progress",
  "data": {
    "job_id": "auto-improve-job-001",
    "experiment_id": "exp-002",
    "progress": 45,
    "current_step": "Processing QA 68/150",
    "timestamp": "2025-10-29T10:20:00Z"
  }
}
```

**실험 완료:**
```json
{
  "type": "experiment_completed",
  "data": {
    "job_id": "auto-improve-job-001",
    "experiment_id": "exp-002",
    "overall_score": 0.89,
    "is_best": true,
    "improvement_rate": 0.236,
    "timestamp": "2025-10-29T10:25:00Z"
  }
}
```

**작업 완료:**
```json
{
  "type": "job_completed",
  "data": {
    "job_id": "auto-improve-job-001",
    "status": "completed",
    "experiments_completed": 12,
    "best_score": 0.89,
    "improvement_rate": 0.236,
    "total_cost": 18.00,
    "duration_minutes": 195,
    "timestamp": "2025-10-29T13:15:00Z"
  }
}
```

---

## 12. 에러 코드

### HTTP 상태 코드

| 코드 | 설명 | 사용 예 |
|-----|------|--------|
| 200 | OK | 성공적인 요청 |
| 201 | Created | 리소스 생성 성공 |
| 202 | Accepted | 비동기 작업 수락 |
| 400 | Bad Request | 잘못된 요청 파라미터 |
| 401 | Unauthorized | 인증 실패 |
| 403 | Forbidden | 권한 없음 |
| 404 | Not Found | 리소스를 찾을 수 없음 |
| 409 | Conflict | 리소스 충돌 (예: 중복 생성) |
| 429 | Too Many Requests | Rate Limit 초과 |
| 500 | Internal Server Error | 서버 내부 오류 |
| 503 | Service Unavailable | 서비스 이용 불가 |

### 에러 응답 형식

```json
{
  "success": false,
  "error": {
    "code": "EVALUATION_NOT_FOUND",
    "message": "Evaluation with ID 'eval-999' not found",
    "details": {
      "evaluation_id": "eval-999"
    },
    "timestamp": "2025-10-29T10:30:00Z",
    "request_id": "req-abc123"
  }
}
```

### 커스텀 에러 코드

| 에러 코드 | HTTP 코드 | 설명 |
|----------|----------|------|
| `INVALID_TOKEN` | 401 | JWT 토큰이 유효하지 않음 |
| `TOKEN_EXPIRED` | 401 | JWT 토큰이 만료됨 |
| `DATASET_NOT_FOUND` | 404 | 데이터셋을 찾을 수 없음 |
| `EVALUATION_NOT_FOUND` | 404 | 평가를 찾을 수 없음 |
| `INSUFFICIENT_PERMISSIONS` | 403 | 권한 부족 |
| `BUDGET_EXCEEDED` | 400 | 예산 초과 |
| `INVALID_PARAMETERS` | 400 | 잘못된 파라미터 |
| `RESOURCE_CONFLICT` | 409 | 리소스 충돌 |
| `RATE_LIMIT_EXCEEDED` | 429 | Rate Limit 초과 |
| `EXTERNAL_API_ERROR` | 502 | 외부 API 오류 |
| `LLM_API_ERROR` | 502 | LLM API 오류 |
| `DATABASE_ERROR` | 500 | 데이터베이스 오류 |

---

## 📚 부록

### A. Request/Response 예제

**평가 생성 전체 플로우:**

1. **데이터셋 업로드**
```bash
curl -X POST https://api.rex.com/api/v1/datasets \
  -H "Authorization: Bearer {token}" \
  -F "name=Test Dataset" \
  -F "file=@dataset.csv"
```

2. **평가 생성 (내부 모드)**
```bash
curl -X POST https://api.rex.com/api/v1/evaluations/internal \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Evaluation",
    "dataset_id": "dataset-001",
    "model_id": "gpt-4o",
    "vector_db_id": "pinecone-1",
    "metrics": [...],
    "llm_judge_config": {...}
  }'
```

3. **WebSocket 연결로 실시간 모니터링**
```javascript
const ws = new WebSocket('wss://api.rex.com/ws/evaluations/eval-001?token={token}');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data.type, data.data);
};
```

4. **결과 조회**
```bash
curl -X GET https://api.rex.com/api/v1/results/eval-001 \
  -H "Authorization: Bearer {token}"
```

### B. Rate Limiting

| 엔드포인트 그룹 | Rate Limit |
|----------------|-----------|
| 인증 | 5 requests/minute |
| 평가 생성 | 10 requests/hour |
| 데이터 조회 | 100 requests/minute |
| WebSocket 연결 | 5 connections/user |

### C. 버전 관리

**API 버전:**
- 현재 버전: v1.0
- Base URL에 버전 포함: `/api/v1/`
- Breaking Changes 시 새 버전 릴리스 (v2.0)

**변경 이력:**
- 2024-10-29: v1.0 Initial Release
  - 평가 모드 2가지 지원
  - LLM Judge 비용 절감 시스템
  - 자동 개선 파이프라인
  - 비용 관찰 시스템

---

**문서 버전:** 1.0  
**최종 업데이트:** 2024년 10월 29일  
**작성자:** REX Development Team

**문의:**
- 기술 지원: tech-support@rex.com
- API 문의: api@rex.com
- 버그 리포트: bugs@rex.com
