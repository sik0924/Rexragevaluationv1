# REX 개발 로드맵

## 개요
REX(RAG Evaluation eXpert)는 단계별 개발 접근법을 통해 안정적이고 확장 가능한 RAG 성능 평가 솔루션을 구축합니다.

---

## Phase 1: External SaaS Mode 개발 (현재 진행 중)

### 목표
운영 중인 RAG 시스템을 API로 연동하여 평가하는 핵심 기능 구현

### 개발 범위

#### 1. 데이터셋 생성/관리 기능
- **수동 업로드**
  - CSV 파일 업로드 지원
  - JSON 파일 업로드 지원
  - 데이터 포맷 검증 및 에러 핸들링
  
- **자동 생성 (LLM 기반)**
  - 프롬프트 템플릿 기반 생성
  - 도메인별 커스터마이징
  - 생성된 데이터 검수 및 편집
  
- **데이터셋 관리**
  - 데이터셋 목록 조회
  - 데이터셋 상세 보기
  - 데이터셋 삭제 및 수정

#### 2. 평가하기 - External 평가 (연동된 시스템 평가)
- **API 연동 설정**
  - 엔드포인트 URL 입력
  - 인증 방식 설정 (API Key, Bearer Token)
  - 요청/응답 포맷 매핑
  - 연결 테스트
  
- **평가 환경 설정**
  - 데이터셋 선택
  - 평가 지표 선택 (12개 RAG 지표)
  - LLM Judge 모델 선택
  - 비용 최적화 설정
    - 휴리스틱 1차 필터링 (규칙 기반)
    - 고정 비율 샘플링 2차 필터링
    - 예상 비용 계산 및 표시
  
- **평가 실행 및 모니터링**
  - 평가 시작
  - 실시간 진행 상황 모니터링
  - 중간 결과 미리보기
  - 평가 일시정지/재개/취소

#### 3. 평가 이력 및 리포트
- **평가 이력 목록**
  - 전체 평가 이력 조회
  - 필터링 (날짜, 상태, 데이터셋)
  - 정렬 및 검색
  
- **상세 결과 분석**
  - 12개 지표별 점수 및 시각화 (필수 5개 + 선택 7개)
  - 전체 평가 요약 (Pass/Fail 비율, 평균 점수)
  - 질문별 상세 결과
  - ~~오류 케이스 분석~~ → **Phase 3에서 구현**
  - ~~개선 제안사항~~ → **Phase 3에서 구현**
  
- **결과 비교**
  - 여러 평가 결과 비교
  - 지표별 성능 변화 추이
  - A/B 테스트 분석

> ⚠️ **Phase 1 범위 제한사항**
> - LLM Judge 기반 근본 원인 분석(Root Cause Analysis)은 Phase 3에서 구현
> - 자동 개선 제안 및 재평가 기능은 Phase 3에서 구현
> - Phase 1에서는 지표별 점수 측정 및 시각화에 집중

### 백엔드 개발 우선순위

#### 우선순위 1: 데이터셋 API
```
POST   /api/datasets              - 데이터셋 생성 (업로드)
GET    /api/datasets              - 데이터셋 목록 조회
GET    /api/datasets/:id          - 데이터셋 상세 조회
DELETE /api/datasets/:id          - 데이터셋 삭제
POST   /api/datasets/generate     - LLM 기반 자동 생성
```

#### 우선순위 2: External 평가 API
```
POST   /api/evaluations/external  - External 평가 시작
GET    /api/evaluations/:id       - 평가 상태 조회
POST   /api/evaluations/:id/pause - 평가 일시정지
POST   /api/evaluations/:id/resume- 평가 재개
DELETE /api/evaluations/:id       - 평가 취소
```

#### 우선순위 3: 결과 조회 API
```
GET    /api/evaluations           - 평가 이력 목록
GET    /api/evaluations/:id/results - 평가 결과 상세
GET    /api/evaluations/compare   - 여러 평가 결과 비교
```

### UI 상태
**활성화:**
- 통합 대시보드
- 데이터셋 관리
- 평가하기 > 연동된 시스템 평가
- 평가 모니터링
- 평가 이력
- 결과 비교

**비활성화 (Phase 2/3):**
- 평가하기 > RAG 최적 설정 탐색 (Phase 2)
- 자동 개선 (Phase 3)
- 비용 대시보드 (Phase 3)

### 완료 조건
- [ ] 데이터셋 CRUD 완성
- [ ] LLM 기반 자동 생성 작동
- [ ] External API 연동 및 평가 실행
- [ ] LLM Judge 비용 최적화 (90% 절감) 적용
- [ ] 실시간 모니터링 작동
- [ ] 12개 지표 계산 및 시각화 (필수 5개 + 선택 7개)
- [ ] 평가 이력 및 상세 리포트 완성
- [ ] 결과 비교 기능 완성

---

## Phase 2: Internal BMT Mode 개발

### 목표
REX 내부에서 RAG 파이프라인을 실행하여 최적 하이퍼파라미터 조합을 찾는 실험 모드 구현

### 개발 범위

#### 1. RAG 파이프라인 내장
- Vector DB 통합 (Pinecone, Weaviate, ChromaDB 등)
- Embedding 모델 선택 및 실행
- Retrieval 전략 구현
- Generation (LLM 호출) 구현

#### 2. 하이퍼파라미터 실험
- Chunk Size, Overlap 설정
- Top-K, Similarity Threshold 설정
- Reranking 옵션
- Temperature, Max Tokens 설정
- 조합 실험 자동 실행

#### 3. 최적 설정 발견
- 지표 기반 최적 설정 자동 선택
- 성능/비용 트레이드오프 분석
- 최적 설정 추천 및 적용

### 백엔드 개발 우선순위
```
POST   /api/evaluations/internal  - Internal 평가 시작
POST   /api/rag/index             - 문서 인덱싱
POST   /api/rag/search            - 검색 테스트
GET    /api/experiments/:id       - 실험 결과 조회
```

### UI 상태
**활성화:**
- Phase 1의 모든 메뉴
- 평가하기 > RAG 최적 설정 탐색

**비활성화:**
- 자동 개선 (Phase 3)
- 비용 대시보드 (Phase 3)

### 완료 조건
- [ ] Vector DB 통합 완료
- [ ] RAG 파이프라인 실행 가능
- [ ] 하이퍼파라미터 조합 실험 자동화
- [ ] 최적 설정 자동 발견 알고리즘 완성
- [ ] Internal 평가 전체 워크플로우 작동

---

## Phase 3: 자동 개선 및 고급 기능 개발

### 목표
AI 기반 자동 개선과 비용 최적화, 고급 분석 기능 구현

### 개발 범위

#### 1. 자동 개선 알고리즘 ⭐ **Phase 1에서 UI 준비 완료**
- **LLM Judge 기반 근본 원인 분석 (Root Cause Analysis)**
  - 실패한 케이스의 근본 원인 자동 분류 (Retrieval vs Generation)
  - 실패 패턴 분석 및 그룹핑
  - 진단 요약 리포트 생성
  
- **AI 기반 개선 방안 생성**
  - 검색 오류 개선 제안 (Chunk Size, Embedding Model, Top-K 조정)
  - 생성 오류 개선 제안 (Temperature, Prompt, Max Tokens 조정)
  - 개선 우선순위 자동 산정
  
- **자동 실험 및 검증**
  - 제안된 설정으로 자동 재평가
  - 개선 전후 비교 리포트
  - A/B 테스트 자동화

#### 2. 비용 대시보드 및 예산 관리
- 실시간 비용 추적
- 프로젝트별 예산 설정
- 비용 알림 및 임계값 관리
- 비용 최적화 제안

#### 3. 커스텀 지표 생성
- 사용자 정의 평가 지표 생성
- 프롬프트 기반 지표 설정
- 커스텀 지표 관리 및 공유

#### 4. 반복 평가 예약
- 스케줄 기반 자동 평가
- 성능 회귀 감지
- 알림 및 리포트 자동 발송

### 백엔드 개발 우선순위
```
POST   /api/auto-improve          - 자동 개선 시작
GET    /api/auto-improve/:id      - 개선 진행 상황
POST   /api/metrics/custom        - 커스텀 지표 생성
GET    /api/costs                 - 비용 조회
POST   /api/schedules             - 반복 평가 예약
```

### UI 상태
**활성화:**
- 모든 메뉴

### 완료 조건
- [ ] 자동 개선 알고리즘 완성
- [ ] 비용 추적 및 예산 관리 작동
- [ ] 커스텀 지표 생성 기능 완성
- [ ] 반복 평가 스케줄링 작동
- [ ] 전체 시스템 통합 테스트 완료

---

## 개발 환경 설정

### 백엔드 (Replit)
- Python FastAPI 프로젝트
- PostgreSQL 데이터베이스
- Redis (캐싱 및 큐)
- Celery (비동기 작업)

### 프론트엔드 (현재 프로젝트)
- React + TypeScript
- Tailwind CSS
- Zustand (상태 관리)
- Recharts (시각화)

---

## API 연동 가이드

### Phase 1 개발 시 Mock 데이터 사용
백엔드 API가 준비되기 전까지 `/lib/mock-data.ts`의 Mock 데이터 사용

### API 연동 전환
백엔드 API 준비 시 `/lib/api-client.ts`에서 실제 API 호출로 전환

---

## 버전 관리

- **v0.1.0**: Phase 1 개발 시작
- **v1.0.0**: Phase 1 완료 (External Mode)
- **v2.0.0**: Phase 2 완료 (Internal Mode)
- **v3.0.0**: Phase 3 완료 (자동 개선 및 고급 기능)

---

## 다음 단계

### 현재 진행: Phase 1
1. 백엔드: 데이터셋 API 구현
2. 프론트엔드: 데이터셋 관리 페이지 API 연동
3. 백엔드: External 평가 API 구현
4. 프론트엔드: External 평가 페이지 API 연동
5. 백엔드: LLM Judge 비용 최적화 구현
6. 프론트엔드: 평가 이력 및 결과 페이지 완성

**우선순위**: 데이터셋 생성/관리 → External 평가 → 평가 이력/리포트
