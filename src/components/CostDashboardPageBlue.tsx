import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "./ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Zap,
  Database,
  BarChart3,
  PieChart,
  Settings,
  Bell,
  ArrowRight,
  Lightbulb,
  Info,
  HelpCircle,
  Calendar,
  RefreshCw,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface CostDashboardPageBlueProps {
  onNavigate?: (page: string) => void;
}

export function CostDashboardPageBlue({
  onNavigate,
}: CostDashboardPageBlueProps) {
  const [period, setPeriod] = useState<
    "today" | "week" | "month" | "all"
  >("month");

  // Mock 데이터: 비용 요약
  const costSummary = {
    total_cost: 1847.32,
    total_evaluations: 45,
    total_qa_processed: 6750,
    avg_cost_per_evaluation: 41.05,
    avg_cost_per_qa: 0.27,
    cost_by_provider: [
      {
        provider: "OpenAI",
        model: "GPT-4o",
        cost: 1142.45,
        percentage: 61.8,
      },
      {
        provider: "Anthropic",
        model: "Claude-3.5 Sonnet",
        cost: 542.87,
        percentage: 29.4,
      },
      {
        provider: "OpenAI",
        model: "GPT-4o-mini",
        cost: 162.0,
        percentage: 8.8,
      },
    ],
    cost_by_metric: [
      {
        metric_name: "Faithfulness",
        cost: 423.12,
        percentage: 22.9,
      },
      {
        metric_name: "Answer Relevancy",
        cost: 389.45,
        percentage: 21.1,
      },
      {
        metric_name: "Answer Correctness",
        cost: 356.78,
        percentage: 19.3,
      },
      {
        metric_name: "Context Precision",
        cost: 234.56,
        percentage: 12.7,
      },
      {
        metric_name: "Context Recall",
        cost: 201.23,
        percentage: 10.9,
      },
      { metric_name: "Others", cost: 242.18, percentage: 13.1 },
    ],
    cost_trend: [
      { date: "12/07", cost: 234.56 },
      { date: "12/08", cost: 289.34 },
      { date: "12/09", cost: 312.45 },
      { date: "12/10", cost: 267.89 },
      { date: "12/11", cost: 345.12 },
      { date: "12/12", cost: 298.67 },
      { date: "12/13", cost: 99.29 },
    ],
  };

  // Mock 데이터: 예산 정보
  const budgets = [
    {
      id: "budget-001",
      name: "월간 평가 예산",
      type: "organization",
      limit: 2000,
      current_usage: 1847.32,
      percentage_used: 92.4,
      period: "monthly",
      alert_thresholds: [50, 80, 95],
      is_hard_limit: false,
    },
    {
      id: "budget-002",
      name: "Auto-Improve 프로젝트",
      type: "project",
      limit: 500,
      current_usage: 234.56,
      percentage_used: 46.9,
      period: "monthly",
      alert_thresholds: [50, 80, 95],
      is_hard_limit: true,
    },
  ];

  // Mock 데이터: 비용 알림
  const costAlerts = [
    {
      id: "alert-001",
      budget_id: "budget-001",
      type: "threshold_exceeded",
      severity: "warning",
      message: "월간 평가 예산의 92.4%를 사용했습니다",
      current_usage: 1847.32,
      budget_limit: 2000,
      percentage_used: 92.4,
      timestamp: "2025-12-13T10:30:00Z",
      is_acknowledged: false,
    },
    {
      id: "alert-002",
      budget_id: "budget-001",
      type: "threshold_warning",
      severity: "info",
      message: "오늘 비용이 평균보다 20% 높습니다",
      current_usage: 345.12,
      budget_limit: 2000,
      percentage_used: 92.4,
      timestamp: "2025-12-13T08:15:00Z",
      is_acknowledged: false,
    },
  ];

  // Mock 데이터: 최적화 제안
  const optimizationSuggestions = [
    {
      id: "opt-001",
      type: "sampling",
      title: "샘플링 전략 활성화",
      description:
        "전체 데이터셋 대신 30% 샘플만 평가하여 비용을 70% 절감할 수 있습니다.",
      estimated_savings: 1293.12,
      estimated_savings_percentage: 70,
      impact_on_accuracy: "정확도 5% 감소 예상 (신뢰구간 ±2%)",
      implementation_effort: "easy",
    },
    {
      id: "opt-002",
      type: "metric_selection",
      title: "필수 지표만 선택",
      description:
        "12개 지표 중 핵심 6개만 활성화하여 비용을 50% 절감할 수 있습니다.",
      estimated_savings: 923.66,
      estimated_savings_percentage: 50,
      impact_on_accuracy: "전체적인 평가 범위 축소",
      implementation_effort: "easy",
    },
    {
      id: "opt-003",
      type: "model_switch",
      title: "GPT-4o → GPT-4o-mini 전환",
      description:
        "Generation 지표를 GPT-4o-mini로 평가하여 비용을 60% 절감할 수 있습니다.",
      estimated_savings: 685.47,
      estimated_savings_percentage: 60,
      impact_on_accuracy: "정확도 3% 감소 예상",
      implementation_effort: "easy",
    },
    {
      id: "opt-004",
      type: "caching",
      title: "평가 결과 캐싱",
      description:
        "동일 질문 재평가 시 캐시된 결과를 사용하여 비용을 20% 절감할 수 있습니다.",
      estimated_savings: 369.46,
      estimated_savings_percentage: 20,
      impact_on_accuracy: "영향 없음",
      implementation_effort: "medium",
    },
  ];

  // 차트 색상
  const COLORS = [
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#f59e0b",
    "#10b981",
    "#6366f1",
  ];

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-50 border-red-300 text-red-800";
      case "warning":
        return "bg-orange-50 border-orange-300 text-orange-800";
      case "info":
        return "bg-blue-50 border-blue-300 text-blue-800";
      default:
        return "bg-gray-50 border-gray-300 text-gray-800";
    }
  };

  const getBudgetColor = (percentage: number) => {
    if (percentage >= 95) return "text-red-600";
    if (percentage >= 80) return "text-orange-600";
    if (percentage >= 50) return "text-yellow-600";
    return "text-green-600";
  };

  const getBudgetBgColor = (percentage: number) => {
    if (percentage >= 95) return "bg-red-50 border-red-200";
    if (percentage >= 80)
      return "bg-orange-50 border-orange-200";
    if (percentage >= 50)
      return "bg-yellow-50 border-yellow-200";
    return "bg-green-50 border-green-200";
  };

  return (
    <div className="space-y-6 max-w-7xl bg-gray-50/30 -m-6 p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 font-bold text-[24px]">
            비용 대시보드
          </h1>
          <p className="text-gray-600 mt-1 text-sm">
            LLM API 비용 추적 및 예산 관리
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={period}
            onValueChange={(val) => setPeriod(val as any)}
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">오늘</SelectItem>
              <SelectItem value="week">최근 7일</SelectItem>
              <SelectItem value="month">최근 30일</SelectItem>
              <SelectItem value="all">전체</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate?.("budget-settings")}
          >
            <Settings className="h-4 w-4 mr-2" />
            예산 설정
          </Button>
        </div>
      </div>

      {/* 알림 배너 */}
      {costAlerts.filter((a) => !a.is_acknowledged).length >
        0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-900">
            비용 알림
          </AlertTitle>
          <AlertDescription className="text-orange-800 text-sm">
            {
              costAlerts.filter((a) => !a.is_acknowledged)
                .length
            }
            개의 새로운 비용 알림이 있습니다.
            <Button
              variant="link"
              className="text-orange-700 h-auto p-0 ml-2"
              onClick={() => onNavigate?.("cost-alerts")}
            >
              모두 보기 →
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* 핵심 지표 카드 */}
      <div className="grid md:grid-cols-4 gap-4">
        {/* 총 비용 */}
        <Card className="border-blue-100 bg-white shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">
                  총 비용 (30일)
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  ${costSummary.total_cost.toFixed(2)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600">
                +12.5%
              </span>
              <span className="text-xs text-gray-500">
                지난 달 대비
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 평가당 평균 비용 */}
        <Card className="border-purple-100 bg-white shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">
                  평가당 평균
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  $
                  {costSummary.avg_cost_per_evaluation.toFixed(
                    2,
                  )}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3">
              <TrendingDown className="h-3 w-3 text-red-600" />
              <span className="text-xs text-red-600">
                -3.2%
              </span>
              <span className="text-xs text-gray-500">
                지난 달 대비
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 총 평가 횟수 */}
        <Card className="border-cyan-100 bg-white shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">
                  총 평가 횟수
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {costSummary.total_evaluations}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-cyan-100 flex items-center justify-center">
                <Database className="h-6 w-6 text-cyan-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3">
              <span className="text-xs text-gray-600">
                {costSummary.total_qa_processed}개 QA 처리
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 예산 사용률 */}
        <Card
          className={`border-2 ${getBudgetBgColor(budgets[0].percentage_used)} shadow-sm`}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">
                  예산 사용률
                </p>
                <p
                  className={`text-2xl font-bold ${getBudgetColor(budgets[0].percentage_used)}`}
                >
                  {budgets[0].percentage_used.toFixed(1)}%
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center">
                <PieChart
                  className={`h-6 w-6 ${getBudgetColor(budgets[0].percentage_used)}`}
                />
              </div>
            </div>
            <div className="mt-3">
              <Progress
                value={budgets[0].percentage_used}
                className="h-2"
              />
              <p className="text-xs text-gray-600 mt-1">
                ${budgets[0].current_usage.toFixed(2)} / $
                {budgets[0].limit}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 탭 컨텐츠 */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-white border border-gray-200">
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="breakdown">비용 분석</TabsTrigger>
          <TabsTrigger value="budget">예산 관리</TabsTrigger>
          <TabsTrigger value="optimize">
            최적화 제안
          </TabsTrigger>
        </TabsList>

        {/* 개요 탭 */}
        <TabsContent value="overview" className="space-y-4">
          {/* 비용 추이 차트 */}
          <Card className="border-blue-100 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">
                비용 추이
              </CardTitle>
              <CardDescription>
                일별 LLM API 비용 변화
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={costSummary.cost_trend}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                  />
                  <XAxis
                    dataKey="date"
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [
                      `${value.toFixed(2)}`,
                      "비용",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="cost"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            {/* LLM 제공사별 비용 */}
            <Card className="border-purple-100 bg-white shadow-sm">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-base">
                        LLM 제공사별 비용
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] h-5"
                      >
                        추정 비용
                      </Badge>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="cursor-help">
                              <HelpCircle className="h-4 w-4 text-gray-400" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent
                            className="max-w-xs"
                            side="bottom"
                          >
                            <div className="space-y-2">
                              <p className="text-xs font-medium">
                                💡 비용 계산 방식
                              </p>
                              <p className="text-xs text-gray-300">
                                실제 토큰 사용량 (API 추적) ×
                                공개 가격표 (정기 업데이트)
                              </p>
                              <p className="text-xs text-gray-300 mt-2">
                                ✓ 토큰 사용량: 실시간 정확 추적
                                <br />✓ 가격 정보: 각 제공사
                                공식 홈페이지 기준
                              </p>
                              <div className="mt-3 pt-2 border-t border-gray-600">
                                <p className="text-xs font-medium text-amber-200">
                                  ⚠️ 청구 방식 안내
                                </p>
                                <p className="text-xs text-gray-300 mt-1">
                                  • 실제 청구는 각 LLM
                                  제공사에서 개별 진행
                                  <br />
                                  • OpenAI, Anthropic, Google
                                  등의 대시보드에서
                                  <br />
                                  &nbsp;&nbsp;실제 청구 금액을
                                  확인하세요
                                  <br />• REX는 추정 비용만
                                  제공합니다
                                </p>
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <CardDescription className="flex items-center gap-2 flex-wrap">
                      <span>
                        총 ${costSummary.total_cost.toFixed(2)}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="flex items-center gap-1 text-[11px] text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>가격 기준: 2025-10-15</span>
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="flex items-center gap-1 text-[11px] text-green-600">
                        <RefreshCw className="h-3 w-3" />
                        <span>최근 업데이트: 2시간 전</span>
                      </span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {costSummary.cost_by_provider.map(
                    (item, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{
                                backgroundColor: COLORS[index],
                              }}
                            />
                            <span className="text-sm text-gray-700">
                              {item.provider} - {item.model}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            ${item.cost.toFixed(2)}
                          </span>
                        </div>
                        <Progress
                          value={item.percentage}
                          className="h-2"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {item.percentage.toFixed(1)}%
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 지표별 비용 */}
            <Card className="border-cyan-100 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">
                  지표별 비용
                </CardTitle>
                <CardDescription>
                  평가 지표별 API 비용 분포
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {costSummary.cost_by_metric.map(
                    (item, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{
                                backgroundColor: COLORS[index],
                              }}
                            />
                            <span className="text-sm text-gray-700">
                              {item.metric_name}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            ${item.cost.toFixed(2)}
                          </span>
                        </div>
                        <Progress
                          value={item.percentage}
                          className="h-2"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {item.percentage.toFixed(1)}%
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 비용 분석 탭 */}
        <TabsContent value="breakdown" className="space-y-4">
          <Card className="border-blue-100 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">
                평가별 상세 비용
              </CardTitle>
              <CardDescription>
                최근 평가의 비용 분해
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Mock 평가 비용 목록 */}
                {[
                  {
                    name: "고객 지원 QA 평가",
                    date: "2025-12-13",
                    cost: 45.67,
                    qa_count: 150,
                    metrics_used: 8,
                  },
                  {
                    name: "E-commerce 검색 평가",
                    date: "2025-12-12",
                    cost: 52.34,
                    qa_count: 200,
                    metrics_used: 10,
                  },
                  {
                    name: "의료 FAQ 평가",
                    date: "2025-12-11",
                    cost: 38.91,
                    qa_count: 120,
                    metrics_used: 7,
                  },
                ].map((evaluation, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {evaluation.name}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-600">
                            {evaluation.date}
                          </span>
                          <span className="text-xs text-gray-600">
                            •
                          </span>
                          <span className="text-xs text-gray-600">
                            {evaluation.qa_count} QA
                          </span>
                          <span className="text-xs text-gray-600">
                            •
                          </span>
                          <span className="text-xs text-gray-600">
                            {evaluation.metrics_used}개 지표
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">
                          ${evaluation.cost.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-600">
                          $
                          {(
                            evaluation.cost /
                            evaluation.qa_count
                          ).toFixed(3)}
                          /QA
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 예산 관리 탭 */}
        <TabsContent value="budget" className="space-y-4">
          {/* 예산 목록 */}
          {budgets.map((budget) => (
            <Card
              key={budget.id}
              className={`border-2 ${getBudgetBgColor(budget.percentage_used)} shadow-sm`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">
                      {budget.name}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {budget.type === "organization"
                        ? "조직"
                        : "프로젝트"}{" "}
                      •{" "}
                      {budget.period === "monthly"
                        ? "월간"
                        : "연간"}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      budget.is_hard_limit
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {budget.is_hard_limit
                      ? "강제 제한"
                      : "소프트 제한"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* 사용률 */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-700">
                        사용 현황
                      </span>
                      <span
                        className={`text-sm font-semibold ${getBudgetColor(budget.percentage_used)}`}
                      >
                        {budget.percentage_used.toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={budget.percentage_used}
                      className="h-3"
                    />
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs text-gray-600">
                        ${budget.current_usage.toFixed(2)} 사용
                      </span>
                      <span className="text-xs text-gray-600">
                        $
                        {(
                          budget.limit - budget.current_usage
                        ).toFixed(2)}{" "}
                        남음
                      </span>
                    </div>
                  </div>

                  {/* 알림 임계값 */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-gray-600" />
                      <span className="text-xs text-gray-700">
                        알림 임계값
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {budget.alert_thresholds.map(
                        (threshold, index) => (
                          <Badge
                            key={index}
                            variant={
                              budget.percentage_used >=
                              threshold
                                ? "default"
                                : "outline"
                            }
                            className="text-xs"
                          >
                            {threshold}%
                          </Badge>
                        ),
                      )}
                    </div>
                  </div>

                  {/* 경고 메시지 */}
                  {budget.percentage_used >= 80 && (
                    <Alert
                      className={getAlertColor(
                        budget.percentage_used >= 95
                          ? "critical"
                          : "warning",
                      )}
                    >
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle className="text-sm">
                        {budget.percentage_used >= 95
                          ? "예산 거의 소진"
                          : "예산 주의"}
                      </AlertTitle>
                      <AlertDescription className="text-xs">
                        {budget.is_hard_limit
                          ? `${(100 - budget.percentage_used).toFixed(1)}% 남았습니다. 초과 시 평가가 자동으로 중단됩니다.`
                          : `${(100 - budget.percentage_used).toFixed(1)}% 남았습니다. 알림만 발송됩니다.`}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* 새 예산 추가 버튼 */}
          <Button variant="outline" className="w-full">
            <Settings className="h-4 w-4 mr-2" />새 예산 추가
          </Button>
        </TabsContent>

        {/* 최적화 제안 탭 */}
        <TabsContent value="optimize" className="space-y-4">
          <Card className="border-green-100 bg-green-50/30">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-green-900 font-semibold">
                    총 $
                    {optimizationSuggestions
                      .reduce(
                        (sum, s) => sum + s.estimated_savings,
                        0,
                      )
                      .toFixed(2)}{" "}
                    절감 가능
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    아래 제안을 모두 적용하면 월간 비용을 크게
                    절감할 수 있습니다.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {optimizationSuggestions.map((suggestion, index) => (
            <Card
              key={suggestion.id}
              className="border-blue-100 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <Zap className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base">
                        {suggestion.title}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {suggestion.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant={
                        suggestion.implementation_effort ===
                        "easy"
                          ? "default"
                          : "secondary"
                      }
                      className="shrink-0"
                    >
                      {suggestion.implementation_effort ===
                      "easy"
                        ? "쉬움"
                        : suggestion.implementation_effort ===
                            "medium"
                          ? "보통"
                          : "어려움"}
                    </Badge>
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      적용하기
                      <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {/* 예상 절감액 */}
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-xs text-green-700 mb-1">
                      예상 절감액
                    </p>
                    <p className="text-xl font-bold text-green-900">
                      ${suggestion.estimated_savings.toFixed(2)}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      {suggestion.estimated_savings_percentage}%
                      절감
                    </p>
                  </div>

                  {/* 정확도 영향 */}
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-700 mb-1">
                      정확도 영향
                    </p>
                    <p className="text-sm text-blue-900 mt-2">
                      {suggestion.impact_on_accuracy}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}