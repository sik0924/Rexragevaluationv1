# REX UI - Toggle Switch 스타일 가이드

## 📋 개요
REX 시스템의 모든 ON/OFF 토글 스위치에 대한 디자인 스펙 및 구현 가이드입니다.

---

## 🎨 디자인 스펙

### 1. 컨테이너 (토글 영역 전체)

#### 레이아웃 구조
```tsx
<div className="flex items-center justify-between p-3 rounded-lg border">
  <div className="space-y-0.5">
    {/* 레이블 영역 */}
  </div>
  <Switch />
</div>
```

#### 상태별 스타일

**OFF 상태 (비활성화)**
```css
background: #FFFFFF (bg-white)
border: 1px solid #D1D5DB (border-gray-300)
border-radius: 0.5rem (rounded-lg)
padding: 0.75rem (p-3)
```

**ON 상태 (활성화)**
```css
background: #EFF6FF (bg-blue-50)
border: 1px solid #BFDBFE (border-blue-200)
border-radius: 0.5rem (rounded-lg)
padding: 0.75rem (p-3)
```

#### Tailwind 클래스 (조건부)
```tsx
className={`flex items-center justify-between p-3 rounded-lg border ${
  isEnabled 
    ? 'bg-blue-50 border-blue-200'    // ON 상태
    : 'bg-white border-gray-300'       // OFF 상태
}`}
```

---

### 2. 레이블 영역 (좌측)

#### 구조
```tsx
<div className="space-y-0.5">
  <Label className="text-sm text-gray-900 font-medium">
    AI 진단 활성화
  </Label>
  <p className="text-gray-600 text-xs">
    실패 원인 분석 및 개선 조언 제공
  </p>
</div>
```

#### 제목 (Label)
```css
font-size: 0.875rem (text-sm)
font-weight: 500 (font-medium)
color: #111827 (text-gray-900)
line-height: 1.5
```

#### 설명 (Description)
```css
font-size: 0.75rem (text-xs)
font-weight: 400 (normal)
color: #4B5563 (text-gray-600)
line-height: 1.5
margin-top: 0.125rem (space-y-0.5)
```

---

### 3. Switch 컴포넌트 (우측)

#### shadcn/ui Switch 사용
```tsx
import { Switch } from './ui/switch';

<Switch 
  checked={isEnabled} 
  onCheckedChange={setIsEnabled} 
/>
```

#### Switch 기본 스펙 (shadcn/ui 기준)

**OFF 상태**
```css
/* 배경 트랙 */
background: #CBD5E1 (switch-background)
width: 44px
height: 24px
border-radius: 9999px (완전한 원형)

/* 동그란 버튼 */
background: #FFFFFF
width: 20px
height: 20px
position: left (2px offset)
transition: 0.2s ease
```

**ON 상태**
```css
/* 배경 트랙 */
background: #030213 (primary color)
width: 44px
height: 24px
border-radius: 9999px

/* 동그란 버튼 */
background: #FFFFFF
width: 20px
height: 20px
position: right (translate-x-[20px])
transition: 0.2s ease
```

---

## 🔧 Switch 컴포넌트 상세 구현

### /components/ui/switch.tsx 코드

```tsx
import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={`
      peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center 
      rounded-full border-2 border-transparent transition-colors 
      focus-visible:outline-none focus-visible:ring-2 
      focus-visible:ring-ring focus-visible:ring-offset-2 
      focus-visible:ring-offset-background 
      disabled:cursor-not-allowed disabled:opacity-50 
      data-[state=checked]:bg-primary 
      data-[state=unchecked]:bg-switch-background
      ${className}
    `}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={`
        pointer-events-none block h-5 w-5 rounded-full 
        bg-background shadow-lg ring-0 transition-transform 
        data-[state=checked]:translate-x-5 
        data-[state=unchecked]:translate-x-0
      `}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
```

### CSS 변수 설정 (styles/globals.css)

```css
:root {
  --primary: #030213;              /* Switch ON 상태 배경 */
  --switch-background: #cbced4;    /* Switch OFF 상태 배경 */
  --background: #ffffff;           /* Switch 버튼 색상 */
}
```

---

## 📐 크기 및 간격 가이드

### 컨테이너 크기
```
padding: 12px (상하좌우)
min-height: auto (내용에 맞춤)
gap between elements: justify-between (최대 간격)
```

### 레이블 영역
```
제목과 설명 간격: 2px (space-y-0.5)
최대 너비: flex-1 (Switch 제외한 나머지 공간)
```

### Switch 크기
```
width: 44px
height: 24px
thumb: 20px × 20px
```

---

## 🎯 사용 예시

### 예시 1: AI 진단 토글
```tsx
const [llmJudgeSamplingEnabled, setLlmJudgeSamplingEnabled] = useState(false);

<div className={`flex items-center justify-between p-3 rounded-lg border ${
  llmJudgeSamplingEnabled 
    ? 'bg-blue-50 border-blue-200' 
    : 'bg-white border-gray-300'
}`}>
  <div className="space-y-0.5">
    <Label className="text-sm text-gray-900 font-medium">
      AI 진단 활성화
    </Label>
    <p className="text-gray-600 text-xs">
      실패 원인 분석 및 개선 조언 제공
    </p>
  </div>
  <Switch 
    checked={llmJudgeSamplingEnabled} 
    onCheckedChange={setLlmJudgeSamplingEnabled} 
  />
</div>
```

### 예시 2: 스케줄 토글
```tsx
const [scheduleEnabled, setScheduleEnabled] = useState(false);

<div className={`flex items-center justify-between p-3 rounded-lg border ${
  scheduleEnabled 
    ? 'bg-purple-50 border-purple-200' 
    : 'bg-white border-gray-300'
}`}>
  <div className="space-y-0.5">
    <Label className="text-sm text-gray-900 font-medium">
      반복 평가 예약
    </Label>
    <p className="text-gray-600 text-xs">
      주기적으로 자동 실행
    </p>
  </div>
  <Switch 
    checked={scheduleEnabled} 
    onCheckedChange={setScheduleEnabled} 
  />
</div>
```

### 예시 3: 샘플링 토글
```tsx
const [samplingEnabled, setSamplingEnabled] = useState(false);

<div className={`flex items-center justify-between p-3 rounded-lg border ${
  samplingEnabled 
    ? 'bg-green-50 border-green-200' 
    : 'bg-white border-gray-300'
}`}>
  <div className="space-y-0.5">
    <Label className="text-sm text-gray-900 font-medium">
      샘플링 모드
    </Label>
    <p className="text-gray-600 text-xs">
      일부 데이터만 평가하여 비용 절감
    </p>
  </div>
  <Switch 
    checked={samplingEnabled} 
    onCheckedChange={setSamplingEnabled} 
  />
</div>
```

---

## 🎨 색상 변형 가이드

### 기능별 컨테이너 색상

| 기능 영역 | ON 상태 배경 | ON 상태 테두리 | 용도 |
|---------|------------|-------------|------|
| AI/스마트 기능 | `bg-blue-50` | `border-blue-200` | LLM Judge, AI 진단 |
| 자동화/스케줄 | `bg-purple-50` | `border-purple-200` | 반복 평가, 자동 실행 |
| 최적화/비용 절감 | `bg-green-50` | `border-green-200` | 샘플링, 캐싱 |
| 알림/경고 | `bg-amber-50` | `border-amber-200` | 비용 알림, 예산 초과 경고 |

### Switch 색상 (공통)
모든 Switch는 동일한 색상 사용:
- **OFF**: `bg-switch-background` (#CBCED4, Gray)
- **ON**: `bg-primary` (#030213, Dark Blue/Black)

---

## ⚠️ 주의사항

### 1. 컨테이너 색상은 바뀌지만, Switch 색상은 고정
```tsx
// ✅ 올바른 구현
<div className="bg-blue-50 border-blue-200">  {/* 컨테이너만 파란색 */}
  <Switch />  {/* Switch는 항상 primary 색상 */}
</div>

// ❌ 잘못된 구현
<div className="bg-blue-50">
  <Switch className="bg-blue-600" />  {/* Switch 색상 변경 금지 */}
</div>
```

### 2. 레이블은 항상 text-gray-900
```tsx
// ✅ 올바른 구현
<Label className="text-sm text-gray-900 font-medium">제목</Label>

// ❌ 잘못된 구현
<Label className="text-sm text-blue-600 font-medium">제목</Label>
```

### 3. 설명 텍스트는 항상 text-gray-600
```tsx
// ✅ 올바른 구현
<p className="text-gray-600 text-xs">설명</p>

// ❌ 잘못된 구현
<p className="text-blue-500 text-xs">설명</p>
```

---

## 🔍 반응형 고려사항

### 모바일 (< 640px)
```tsx
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 gap-3">
  <div className="space-y-0.5">
    <Label>...</Label>
    <p>...</p>
  </div>
  <Switch className="self-start sm:self-auto" />
</div>
```

### 데스크톱 (>= 640px)
```tsx
<div className="flex items-center justify-between p-3">
  {/* 기본 레이아웃 */}
</div>
```

---

## 🧪 인터랙션 상태

### 1. 기본 상태 (Default)
```
컨테이너: bg-white border-gray-300
Switch: bg-switch-background
```

### 2. 호버 상태 (Hover)
```
컨테이너: 변화 없음
Switch: cursor-pointer (기본 제공)
```

### 3. 포커스 상태 (Focus)
```
Switch: ring-2 ring-ring ring-offset-2 (접근성)
```

### 4. 비활성 상태 (Disabled)
```tsx
<Switch disabled checked={value} />
// opacity-50, cursor-not-allowed 자동 적용
```

### 5. 활성 상태 (Active/Checked)
```
컨테이너: bg-blue-50 border-blue-200
Switch: bg-primary
Thumb: translate-x-5
```

---

## 📦 필수 패키지

```json
{
  "dependencies": {
    "@radix-ui/react-switch": "^1.0.3",
    "lucide-react": "latest"
  }
}
```

---

## 🚀 Replit 통합 체크리스트

### 1단계: Switch 컴포넌트 확인
- [ ] `/components/ui/switch.tsx` 파일 존재
- [ ] `@radix-ui/react-switch` 패키지 설치
- [ ] `globals.css`에 `--switch-background` 변수 정의

### 2단계: 스타일 적용
- [ ] 컨테이너에 `flex items-center justify-between p-3` 클래스
- [ ] 조건부 배경색 (`bg-blue-50` / `bg-white`)
- [ ] 조건부 테두리 (`border-blue-200` / `border-gray-300`)

### 3단계: 레이블 스타일
- [ ] 제목: `text-sm text-gray-900 font-medium`
- [ ] 설명: `text-xs text-gray-600`
- [ ] 간격: `space-y-0.5`

### 4단계: 동작 확인
- [ ] Switch 클릭 시 상태 변경
- [ ] 컨테이너 배경색 즉시 변경
- [ ] Switch thumb 애니메이션 (0.2초)

---

## 🎬 애니메이션 스펙

### Switch Thumb 이동
```css
transition-property: transform
transition-duration: 200ms
transition-timing-function: ease

/* OFF → ON */
transform: translateX(0) → translateX(20px)

/* ON → OFF */
transform: translateX(20px) → translateX(0)
```

### 컨테이너 배경 변화
```css
/* 즉시 변경 (애니메이션 없음) */
background-color: instant change
border-color: instant change
```

---

## 📊 시각적 비교

### Before (이전 UI)
```
┌─────────────────────────────────────┐
│ AI 진단 활성화              [  |  ] │  ← 회색 테두리, 흰색 배경
│ 실패 원인 분석 및 개선 조언 제공      │
└─────────────────────────────────────┘
```

### After (현재 UI - OFF)
```
┌─────────────────────────────────────┐
│ AI 진단 활성화              [  |  ] │  ← 회색 테두리(#D1D5DB), 흰색 배경
│ 실패 원인 분석 및 개선 조언 제공      │
└─────────────────────────────────────┘
```

### After (현재 UI - ON)
```
┌─────────────────────────────────────┐
│ AI 진단 활성화              [ ●| ] │  ← 파란 테두리(#BFDBFE), 파란 배경(#EFF6FF)
│ 실패 원인 분석 및 개선 조언 제공      │  ← Switch는 검정(#030213)
└─────────────────────────────────────┘
```

---

## 🔗 관련 파일

### 구현 위치
```
/components/ExternalEvaluationPageBlue.tsx (Line 835-846)
/components/NewEvaluationPageBlue.tsx (동일 패턴)
/components/AutoImproveSetupPageBlue.tsx (동일 패턴)
/components/BudgetSettingsPageBlue.tsx (동일 패턴)
```

### 참조 파일
```
/components/ui/switch.tsx (Switch 컴포넌트)
/components/ui/label.tsx (Label 컴포넌트)
/styles/globals.css (CSS 변수)
```

---

## 💡 Pro Tips

### 1. 일관성 유지
모든 토글은 동일한 구조와 스타일을 사용하세요.

### 2. 접근성
```tsx
<Switch 
  id="ai-diagnosis-toggle"
  aria-label="AI 진단 활성화"
  checked={enabled}
  onCheckedChange={setEnabled}
/>
```

### 3. 로딩 상태
```tsx
<Switch 
  disabled={isLoading}
  checked={enabled}
  onCheckedChange={setEnabled}
/>
```

### 4. 조건부 렌더링
```tsx
{isPremiumUser && (
  <div className="...">
    <Switch />
  </div>
)}
```

---

**마지막 업데이트:** 2025-11-13  
**문서 버전:** 1.0  
**적용 컴포넌트:** 18개 페이지
