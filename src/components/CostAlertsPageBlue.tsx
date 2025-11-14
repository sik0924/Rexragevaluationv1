import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Info,
  AlertTriangle,
  XCircle,
  Clock,
  Filter,
  Search,
  Trash2,
  Bell,
  BellOff,
  TrendingUp,
  DollarSign,
  Calendar,
  HelpCircle
} from 'lucide-react';

interface CostAlertsPageBlueProps {
  onNavigate?: (page: string) => void;
}

interface CostAlert {
  id: string;
  budget_id: string;
  budget_name: string;
  type: 'threshold_exceeded' | 'threshold_warning' | 'daily_spike' | 'approaching_limit' | 'hard_limit_reached';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  current_usage: number;
  budget_limit: number;
  percentage_used: number;
  timestamp: string;
  is_acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
  details?: string;
}

export function CostAlertsPageBlue({ onNavigate }: CostAlertsPageBlueProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'info' | 'warning' | 'critical'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unacknowledged' | 'acknowledged'>('all');
  const [selectedTab, setSelectedTab] = useState('all');

  // Mock 데이터: 비용 알림
  const [alerts, setAlerts] = useState<CostAlert[]>([
    {
      id: 'alert-001',
      budget_id: 'budget-001',
      budget_name: '월간 평가 예산',
      type: 'threshold_exceeded',
      severity: 'warning',
      message: '월간 평가 예산의 92.4%를 사용했습니다',
      current_usage: 1847.32,
      budget_limit: 2000,
      percentage_used: 92.4,
      timestamp: '2025-10-13T10:30:00Z',
      is_acknowledged: false,
      details: '95% 임계값에 근접하고 있습니다. 예산 초과를 방지하기 위해 평가 일정을 조정하거나 추가 예산 승인이 필요할 수 있습니다.'
    },
    {
      id: 'alert-002',
      budget_id: 'budget-001',
      budget_name: '월간 평가 예산',
      type: 'daily_spike',
      severity: 'info',
      message: '오늘 비용이 평균보다 20% 높습니다',
      current_usage: 345.12,
      budget_limit: 2000,
      percentage_used: 92.4,
      timestamp: '2025-10-13T08:15:00Z',
      is_acknowledged: false,
      details: '오늘 하루 동안 $345.12가 사용되어 일평균 $280 대비 20% 증가했습니다.'
    },
    {
      id: 'alert-003',
      budget_id: 'budget-002',
      budget_name: 'Auto-Improve 프로젝트',
      type: 'threshold_warning',
      severity: 'info',
      message: 'Auto-Improve 프로젝트 예산의 50%를 사용했습니다',
      current_usage: 250.00,
      budget_limit: 500,
      percentage_used: 50.0,
      timestamp: '2025-10-12T15:45:00Z',
      is_acknowledged: true,
      acknowledged_by: 'admin@example.com',
      acknowledged_at: '2025-10-12T16:00:00Z',
      details: '첫 번째 알림 임계값에 도달했습니다. 예산 사용량을 모니터링하세요.'
    },
    {
      id: 'alert-004',
      budget_id: 'budget-001',
      budget_name: '월간 평가 예산',
      type: 'threshold_exceeded',
      severity: 'warning',
      message: '월간 평가 예산의 80%를 사용했습니다',
      current_usage: 1600.00,
      budget_limit: 2000,
      percentage_used: 80.0,
      timestamp: '2025-10-10T09:20:00Z',
      is_acknowledged: true,
      acknowledged_by: 'admin@example.com',
      acknowledged_at: '2025-10-10T10:30:00Z',
      details: '두 번째 알림 임계값에 도달했습니다.'
    },
    {
      id: 'alert-005',
      budget_id: 'budget-003',
      budget_name: '개발팀 테스트 예산',
      type: 'approaching_limit',
      severity: 'critical',
      message: '개발팀 테스트 예산의 98%를 사용했습니다',
      current_usage: 980.00,
      budget_limit: 1000,
      percentage_used: 98.0,
      timestamp: '2025-10-11T14:30:00Z',
      is_acknowledged: false,
      details: '강제 제한(Hard Limit)이 설정된 예산입니다. 예산 초과 시 자동으로 평가가 중단됩니다.'
    },
    {
      id: 'alert-006',
      budget_id: 'budget-004',
      budget_name: 'Q4 마케팅 평가',
      type: 'hard_limit_reached',
      severity: 'critical',
      message: 'Q4 마케팅 평가 예산이 100%에 도달했습니다',
      current_usage: 1500.00,
      budget_limit: 1500,
      percentage_used: 100.0,
      timestamp: '2025-10-09T11:00:00Z',
      is_acknowledged: true,
      acknowledged_by: 'manager@example.com',
      acknowledged_at: '2025-10-09T11:30:00Z',
      details: '강제 제한에 도달하여 모든 평가가 일시 중단되었습니다. 예산을 증액하거나 다음 주기를 기다려주세요.'
    },
    {
      id: 'alert-007',
      budget_id: 'budget-001',
      budget_name: '월간 평가 예산',
      type: 'daily_spike',
      severity: 'warning',
      message: '어제 비용이 평균보다 35% 높았습니다',
      current_usage: 378.00,
      budget_limit: 2000,
      percentage_used: 92.4,
      timestamp: '2025-10-12T00:05:00Z',
      is_acknowledged: true,
      acknowledged_by: 'admin@example.com',
      acknowledged_at: '2025-10-12T09:00:00Z',
      details: '10월 11일 비용이 $378로 일평균 $280 대비 35% 증가했습니다. GPT-4o 사용량이 급증한 것으로 확인됩니다.'
    }
  ]);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'hard_limit_reached':
        return <XCircle className="h-5 w-5" />;
      case 'threshold_exceeded':
      case 'approaching_limit':
        return <AlertCircle className="h-5 w-5" />;
      case 'threshold_warning':
        return <AlertTriangle className="h-5 w-5" />;
      case 'daily_spike':
        return <TrendingUp className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-900',
          icon: 'text-red-600',
          badge: 'bg-red-100 text-red-800 border-red-300'
        };
      case 'warning':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          text: 'text-orange-900',
          icon: 'text-orange-600',
          badge: 'bg-orange-100 text-orange-800 border-orange-300'
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-900',
          icon: 'text-blue-600',
          badge: 'bg-blue-100 text-blue-800 border-blue-300'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-900',
          icon: 'text-gray-600',
          badge: 'bg-gray-100 text-gray-800 border-gray-300'
        };
    }
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'warning':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const handleAcknowledge = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId
        ? { 
            ...alert, 
            is_acknowledged: true,
            acknowledged_by: 'current-user@example.com',
            acknowledged_at: new Date().toISOString()
          }
        : alert
    ));
  };

  const handleDelete = (alertId: string) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId));
  };

  // 필터링 로직
  let filteredAlerts = alerts;

  // 상태 필터
  if (statusFilter === 'unacknowledged') {
    filteredAlerts = filteredAlerts.filter(a => !a.is_acknowledged);
  } else if (statusFilter === 'acknowledged') {
    filteredAlerts = filteredAlerts.filter(a => a.is_acknowledged);
  }

  // 심각도 필터
  if (severityFilter !== 'all') {
    filteredAlerts = filteredAlerts.filter(a => a.severity === severityFilter);
  }

  // 검색 필터
  if (searchQuery.trim()) {
    filteredAlerts = filteredAlerts.filter(a =>
      a.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.budget_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // 탭별 필터
  if (selectedTab !== 'all') {
    filteredAlerts = filteredAlerts.filter(a => a.severity === selectedTab);
  }

  // 통계
  const stats = {
    total: alerts.length,
    unacknowledged: alerts.filter(a => !a.is_acknowledged).length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    warning: alerts.filter(a => a.severity === 'warning').length,
    info: alerts.filter(a => a.severity === 'info').length
  };

  return (
    <div className="space-y-6 max-w-7xl bg-gray-50/30 -m-6 p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate?.('costs')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            비용 대시보드로
          </Button>
          <div>
            <h1 className="text-gray-900">비용 알림</h1>
            <p className="text-gray-600 mt-1 text-sm">
              모든 비용 알림 및 경고 내역
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setAlerts(alerts.map(a => ({ ...a, is_acknowledged: true })));
            }}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            모두 확인
          </Button>
        </div>
      </div>

      {/* 통계 카드 */}
      <TooltipProvider>
        <div className="grid md:grid-cols-5 gap-4">
          <Card className="border-blue-100 bg-white shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <p className="text-xs text-gray-600">전체 알림</p>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">시스템에서 발생한 모든 비용 알림의 총 개수입니다.</p>
                        <p className="text-xs text-gray-500 mt-1">확인됨/미확인 알림을 모두 포함합니다.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-2xl text-gray-900">
                    {stats.total}개
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Bell className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-100 bg-white shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <p className="text-xs text-gray-600">미확인</p>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">아직 확인하지 않은 알림의 개수입니다.</p>
                        <p className="text-xs text-purple-600 mt-1">대시보드 상단에 알림 배너로 표시됩니다.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-2xl text-purple-600">
                    {stats.unacknowledged}개
                  </p>
                  <p className="text-xs text-gray-500 mt-1">조치 필요</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <BellOff className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-100 bg-white shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <p className="text-xs text-gray-600">위험</p>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">심각도가 Critical인 알림입니다.</p>
                        <p className="text-xs text-red-600 mt-1">예산 95% 이상 사용 또는 강제 제한 도달 시 발생합니다.</p>
                        <p className="text-xs text-red-600">즉시 조치가 필요합니다.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-2xl text-red-600">
                    {stats.critical}개
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Critical</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-100 bg-white shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <p className="text-xs text-gray-600">경고</p>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">심각도가 Warning인 알림입니다.</p>
                        <p className="text-xs text-orange-600 mt-1">예산 80% 도달 또는 일일 비용 급증 시 발생합니다.</p>
                        <p className="text-xs text-orange-600">주의가 필요합니다.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-2xl text-orange-600">
                    {stats.warning}개
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Warning</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-cyan-100 bg-white shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <p className="text-xs text-gray-600">정보</p>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">심각도가 Info인 알림입니다.</p>
                        <p className="text-xs text-cyan-600 mt-1">예산 50% 도달 등 참고용 알림입니다.</p>
                        <p className="text-xs text-cyan-600">정보 확인 수준으로 충분합니다.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-2xl text-cyan-600">
                    {stats.info}개
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Info</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-cyan-100 flex items-center justify-center">
                  <Info className="h-6 w-6 text-cyan-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TooltipProvider>

      {/* 필터 및 검색 */}
      <Card className="border-blue-100 bg-white shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="알림 메시지 또는 예산 이름 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={severityFilter} onValueChange={(val) => setSeverityFilter(val as any)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="심각도" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 심각도</SelectItem>
                <SelectItem value="critical">위험</SelectItem>
                <SelectItem value="warning">경고</SelectItem>
                <SelectItem value="info">정보</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val as any)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 상태</SelectItem>
                <SelectItem value="unacknowledged">미확인</SelectItem>
                <SelectItem value="acknowledged">확인됨</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 알림 목록 */}
      <Card className="border-blue-100 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">알림 목록</CardTitle>
          <CardDescription>
            {filteredAlerts.length}개의 알림 ({stats.unacknowledged}개 미확인)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="bg-gray-100">
              <TabsTrigger value="all">전체 ({alerts.length})</TabsTrigger>
              <TabsTrigger value="critical">위험 ({stats.critical})</TabsTrigger>
              <TabsTrigger value="warning">경고 ({stats.warning})</TabsTrigger>
              <TabsTrigger value="info">정보 ({stats.info})</TabsTrigger>
            </TabsList>

            <div className="mt-6 space-y-3">
              {filteredAlerts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>알림이 없습니다.</p>
                </div>
              ) : (
                filteredAlerts
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map((alert) => {
                    const colors = getAlertColor(alert.severity);
                    return (
                      <Card
                        key={alert.id}
                        className={`border ${colors.border} ${colors.bg} ${
                          alert.is_acknowledged ? 'opacity-60' : ''
                        }`}
                      >
                        <CardContent className="pt-4">
                          <div className="space-y-3">
                            {/* 헤더 */}
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3 flex-1">
                                <div className={`${colors.icon} shrink-0 mt-0.5`}>
                                  {getAlertIcon(alert.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant={getSeverityBadgeVariant(alert.severity)} className="text-xs">
                                      {alert.severity === 'critical' ? '위험' :
                                       alert.severity === 'warning' ? '경고' : '정보'}
                                    </Badge>
                                    {alert.is_acknowledged && (
                                      <Badge variant="outline" className="text-xs bg-white">
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                        확인됨
                                      </Badge>
                                    )}
                                    <span className="text-xs text-gray-600">{alert.budget_name}</span>
                                  </div>
                                  <p className={`text-sm ${colors.text} mb-1`}>
                                    {alert.message}
                                  </p>
                                  {alert.details && (
                                    <p className="text-xs text-gray-600 mb-2">
                                      {alert.details}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {new Date(alert.timestamp).toLocaleString('ko-KR')}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <DollarSign className="h-3 w-3" />
                                      ${alert.current_usage.toFixed(2)} / ${alert.budget_limit}
                                    </span>
                                    <span className={colors.text}>
                                      {alert.percentage_used.toFixed(1)}%
                                    </span>
                                  </div>
                                  {alert.is_acknowledged && alert.acknowledged_by && (
                                    <p className="text-xs text-gray-500 mt-2">
                                      {alert.acknowledged_by}님이 {new Date(alert.acknowledged_at!).toLocaleString('ko-KR')}에 확인
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                {!alert.is_acknowledged && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleAcknowledge(alert.id)}
                                  >
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(alert.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* 안내 */}
      <Card className="border-blue-100 bg-blue-50/30">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-900">알림 관리 안내</p>
              <ul className="text-xs text-blue-800 mt-2 space-y-1 list-disc list-inside">
                <li>알림은 예산 설정에서 지정한 임계값에 도달하면 자동으로 생성됩니다.</li>
                <li>미확인 알림은 대시보드 상단에 표시됩니다.</li>
                <li>확인된 알림은 투명도가 낮아져 구분됩니다.</li>
                <li>불필요한 알림은 삭제할 수 있지만, 이력 추적을 위해 보관을 권장합니다.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
