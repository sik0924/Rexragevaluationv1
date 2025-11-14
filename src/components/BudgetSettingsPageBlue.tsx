import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Bell,
  Shield,
  Info,
  TrendingUp,
  Save,
  HelpCircle
} from 'lucide-react';

interface BudgetSettingsPageBlueProps {
  onNavigate?: (page: string) => void;
}

interface Budget {
  id: string;
  name: string;
  type: 'organization' | 'project' | 'user';
  limit: number;
  current_usage: number;
  percentage_used: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  alert_thresholds: number[];
  is_hard_limit: boolean;
  notification_emails: string[];
  created_at: string;
  updated_at: string;
}

export function BudgetSettingsPageBlue({ onNavigate }: BudgetSettingsPageBlueProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>('all');

  // Mock 데이터: 예산 목록
  const [budgets, setBudgets] = useState<Budget[]>([
    {
      id: 'budget-001',
      name: '월간 평가 예산',
      type: 'organization',
      limit: 2000,
      current_usage: 1847.32,
      percentage_used: 92.4,
      period: 'monthly',
      alert_thresholds: [50, 80, 95],
      is_hard_limit: false,
      notification_emails: ['admin@example.com', 'finance@example.com'],
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-10-13T10:30:00Z'
    },
    {
      id: 'budget-002',
      name: 'Auto-Improve 프로젝트',
      type: 'project',
      limit: 500,
      current_usage: 234.56,
      percentage_used: 46.9,
      period: 'monthly',
      alert_thresholds: [50, 80, 95],
      is_hard_limit: true,
      notification_emails: ['project-lead@example.com'],
      created_at: '2025-09-15T00:00:00Z',
      updated_at: '2025-10-12T15:20:00Z'
    },
    {
      id: 'budget-003',
      name: '주간 테스트 예산',
      type: 'project',
      limit: 100,
      current_usage: 45.23,
      percentage_used: 45.2,
      period: 'weekly',
      alert_thresholds: [60, 85],
      is_hard_limit: false,
      notification_emails: ['test-team@example.com'],
      created_at: '2025-10-01T00:00:00Z',
      updated_at: '2025-10-13T09:00:00Z'
    }
  ]);

  // 새 예산 폼 상태
  const [newBudgetForm, setNewBudgetForm] = useState({
    name: '',
    type: 'project' as 'organization' | 'project' | 'user',
    limit: 1000,
    period: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    alert_thresholds: [50, 80, 95],
    is_hard_limit: false,
    notification_emails: ['']
  });

  const getBudgetColor = (percentage: number) => {
    if (percentage >= 95) return 'text-red-600';
    if (percentage >= 80) return 'text-orange-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getBudgetBgColor = (percentage: number) => {
    if (percentage >= 95) return 'bg-red-50 border-red-200';
    if (percentage >= 80) return 'bg-orange-50 border-orange-200';
    if (percentage >= 50) return 'bg-yellow-50 border-yellow-200';
    return 'bg-green-50 border-green-200';
  };

  const handleCreateBudget = () => {
    const newBudget: Budget = {
      id: `budget-${Date.now()}`,
      name: newBudgetForm.name,
      type: newBudgetForm.type,
      limit: newBudgetForm.limit,
      current_usage: 0,
      percentage_used: 0,
      period: newBudgetForm.period,
      alert_thresholds: newBudgetForm.alert_thresholds,
      is_hard_limit: newBudgetForm.is_hard_limit,
      notification_emails: newBudgetForm.notification_emails.filter(e => e.trim() !== ''),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setBudgets([...budgets, newBudget]);
    setIsCreateDialogOpen(false);
    
    // 폼 초기화
    setNewBudgetForm({
      name: '',
      type: 'project',
      limit: 1000,
      period: 'monthly',
      alert_thresholds: [50, 80, 95],
      is_hard_limit: false,
      notification_emails: ['']
    });
  };

  const handleDeleteBudget = (id: string) => {
    setBudgets(budgets.filter(b => b.id !== id));
  };

  const filteredBudgets = selectedTab === 'all' 
    ? budgets 
    : budgets.filter(b => b.type === selectedTab);

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
            <h1 className="text-gray-900">예산 설정</h1>
            <p className="text-gray-600 mt-1 text-sm">
              예산 제한 및 알림 설정 관리
            </p>
          </div>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              새 예산 추가
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>새 예산 추가</DialogTitle>
              <DialogDescription>
                프로젝트 또는 조직 단위의 예산 제한을 설정합니다.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {/* 예산 이름 */}
              <div className="space-y-2">
                <Label>예산 이름</Label>
                <Input
                  placeholder="예: Q4 마케팅 평가 예산"
                  value={newBudgetForm.name}
                  onChange={(e) => setNewBudgetForm({ ...newBudgetForm, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* 예산 타입 */}
                <div className="space-y-2">
                  <Label>예산 타입</Label>
                  <Select
                    value={newBudgetForm.type}
                    onValueChange={(val) => setNewBudgetForm({ ...newBudgetForm, type: val as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="organization">조직</SelectItem>
                      <SelectItem value="project">프로젝트</SelectItem>
                      <SelectItem value="user">사용자</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 기간 */}
                <div className="space-y-2">
                  <Label>적용 기간</Label>
                  <Select
                    value={newBudgetForm.period}
                    onValueChange={(val) => setNewBudgetForm({ ...newBudgetForm, period: val as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">일간</SelectItem>
                      <SelectItem value="weekly">주간</SelectItem>
                      <SelectItem value="monthly">월간</SelectItem>
                      <SelectItem value="yearly">연간</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 예산 한도 */}
              <div className="space-y-2">
                <Label>예산 한도 (USD)</Label>
                <Input
                  type="number"
                  value={newBudgetForm.limit}
                  onChange={(e) => setNewBudgetForm({ ...newBudgetForm, limit: Number(e.target.value) })}
                />
              </div>

              {/* 알림 임계값 */}
              <div className="space-y-2">
                <Label>알림 임계값 (%)</Label>
                <div className="flex items-center gap-2">
                  {newBudgetForm.alert_thresholds.map((threshold, index) => (
                    <div key={index} className="flex-1">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={threshold}
                        onChange={(e) => {
                          const newThresholds = [...newBudgetForm.alert_thresholds];
                          newThresholds[index] = Number(e.target.value);
                          setNewBudgetForm({ ...newBudgetForm, alert_thresholds: newThresholds });
                        }}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  예산의 지정된 비율 도달 시 알림이 발송됩니다.
                </p>
              </div>

              {/* 강제 제한 */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <Label>강제 제한 (Hard Limit)</Label>
                    <p className="text-xs text-gray-600 mt-1">
                      활성화 시 예산 초과 시 자동으로 평가가 중단됩니다.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={newBudgetForm.is_hard_limit}
                  onCheckedChange={(checked) => setNewBudgetForm({ ...newBudgetForm, is_hard_limit: checked })}
                />
              </div>

              {/* 알림 이메일 */}
              <div className="space-y-2">
                <Label>알림 수신 이메일</Label>
                {newBudgetForm.notification_emails.map((email, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => {
                        const newEmails = [...newBudgetForm.notification_emails];
                        newEmails[index] = e.target.value;
                        setNewBudgetForm({ ...newBudgetForm, notification_emails: newEmails });
                      }}
                    />
                    {newBudgetForm.notification_emails.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newEmails = newBudgetForm.notification_emails.filter((_, i) => i !== index);
                          setNewBudgetForm({ ...newBudgetForm, notification_emails: newEmails });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setNewBudgetForm({
                      ...newBudgetForm,
                      notification_emails: [...newBudgetForm.notification_emails, '']
                    });
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  이메일 추가
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                취소
              </Button>
              <Button onClick={handleCreateBudget} disabled={!newBudgetForm.name.trim()}>
                <Save className="h-4 w-4 mr-2" />
                생성
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* 통계 요약 */}
      <TooltipProvider>
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="border-blue-100 bg-white shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <p className="text-xs text-gray-600">등록된 예산</p>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">시스템에 등록된 총 예산 항목 수입니다.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-2xl text-gray-900">
                    {budgets.length}개
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-100 bg-white shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <p className="text-xs text-gray-600">정상 범위</p>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">예산 사용률이 80% 미만인 예산입니다.</p>
                        <p className="text-xs text-green-600 mt-1">안정적인 상태로 모니터링만 필요합니다.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-2xl text-green-600">
                    {budgets.filter(b => b.percentage_used < 80).length}개
                  </p>
                  <p className="text-xs text-gray-500 mt-1">&lt; 80% 사용</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-100 bg-white shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <p className="text-xs text-gray-600">주의 필요</p>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">예산 사용률이 80% ~ 95% 미만인 예산입니다.</p>
                        <p className="text-xs text-orange-600 mt-1">예산 초과 위험이 있어 주의가 필요합니다.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-2xl text-orange-600">
                    {budgets.filter(b => b.percentage_used >= 80 && b.percentage_used < 95).length}개
                  </p>
                  <p className="text-xs text-gray-500 mt-1">80% ~ 95% 사용</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-orange-600" />
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
                        <p className="text-xs">예산 사용률이 95% 이상인 예산입니다.</p>
                        <p className="text-xs text-red-600 mt-1">즉시 조치가 필요하며, 강제 제한 시 평가가 중단될 수 있습니다.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-2xl text-red-600">
                    {budgets.filter(b => b.percentage_used >= 95).length}개
                  </p>
                  <p className="text-xs text-gray-500 mt-1">≥ 95% 사용</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TooltipProvider>

      {/* 예산 목록 */}
      <Card className="border-blue-100 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">예산 목록</CardTitle>
          <CardDescription>등록된 모든 예산 제한 및 현황</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="bg-gray-100">
              <TabsTrigger value="all">전체 ({budgets.length})</TabsTrigger>
              <TabsTrigger value="organization">
                조직 ({budgets.filter(b => b.type === 'organization').length})
              </TabsTrigger>
              <TabsTrigger value="project">
                프로젝트 ({budgets.filter(b => b.type === 'project').length})
              </TabsTrigger>
              <TabsTrigger value="user">
                사용자 ({budgets.filter(b => b.type === 'user').length})
              </TabsTrigger>
            </TabsList>

            <div className="mt-6 space-y-4">
              {filteredBudgets.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>등록된 예산이 없습니다.</p>
                </div>
              ) : (
                filteredBudgets.map((budget) => (
                  <Card
                    key={budget.id}
                    className={`border-2 ${getBudgetBgColor(budget.percentage_used)}`}
                  >
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {/* 헤더 */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-gray-900">{budget.name}</h3>
                              <Badge variant="outline" className="text-xs">
                                {budget.type === 'organization' ? '조직' : budget.type === 'project' ? '프로젝트' : '사용자'}
                              </Badge>
                              <Badge variant={budget.is_hard_limit ? 'destructive' : 'secondary'} className="text-xs">
                                {budget.is_hard_limit ? '강제 제한' : '소프트 제한'}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600">
                              {budget.period === 'daily' ? '일간' : 
                               budget.period === 'weekly' ? '주간' : 
                               budget.period === 'monthly' ? '월간' : '연간'} 예산 • 
                              마지막 업데이트: {new Date(budget.updated_at).toLocaleDateString('ko-KR')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteBudget(budget.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </div>

                        {/* 사용률 프로그레스 */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-700">사용 현황</span>
                            <span className={`font-semibold ${getBudgetColor(budget.percentage_used)}`}>
                              {budget.percentage_used.toFixed(1)}%
                            </span>
                          </div>
                          <Progress value={budget.percentage_used} className="h-3" />
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-xs text-gray-600">
                              ${budget.current_usage.toFixed(2)} 사용
                            </span>
                            <span className="text-xs text-gray-600">
                              ${(budget.limit - budget.current_usage).toFixed(2)} 남음 / ${budget.limit}
                            </span>
                          </div>
                        </div>

                        {/* 세부 정보 */}
                        <div className="grid md:grid-cols-2 gap-4">
                          {/* 알림 임계값 */}
                          <div className="p-3 bg-white rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Bell className="h-4 w-4 text-gray-600" />
                              <span className="text-xs text-gray-700">알림 임계값</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {budget.alert_thresholds.map((threshold, index) => (
                                <Badge
                                  key={index}
                                  variant={budget.percentage_used >= threshold ? 'default' : 'outline'}
                                  className="text-xs"
                                >
                                  {threshold}%
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* 알림 수신자 */}
                          <div className="p-3 bg-white rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Info className="h-4 w-4 text-gray-600" />
                              <span className="text-xs text-gray-700">알림 수신자</span>
                            </div>
                            <p className="text-xs text-gray-600">
                              {budget.notification_emails.length}명 등록됨
                            </p>
                          </div>
                        </div>

                        {/* 경고 메시지 */}
                        {budget.percentage_used >= 80 && (
                          <Alert className={budget.percentage_used >= 95 ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-orange-50'}>
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle className="text-sm">
                              {budget.percentage_used >= 95 ? '예산 거의 소진' : '예산 주의'}
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
                ))
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* 예산 상태 가이드 */}
      <Card className="border-blue-100 bg-blue-50/30">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-900">예산 상태 분류 기준</p>
                <p className="text-xs text-blue-800 mt-1">
                  REX는 예산 사용률에 따라 예산을 3가지 상태로 자동 분류하여 관리합니다.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              {/* 정상 범위 */}
              <div className="p-3 bg-white rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-green-900">정상 범위</span>
                </div>
                <p className="text-xs text-gray-600 mb-1">사용률 &lt; 80%</p>
                <p className="text-xs text-gray-700">
                  안정적인 상태로 정기 모니터링만 필요합니다.
                </p>
              </div>

              {/* 주의 필요 */}
              <div className="p-3 bg-white rounded-lg border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <span className="text-xs text-orange-900">주의 필요</span>
                </div>
                <p className="text-xs text-gray-600 mb-1">사용률 80% ~ 95%</p>
                <p className="text-xs text-gray-700">
                  예산 초과 위험이 있어 비용 최적화 검토가 필요합니다.
                </p>
              </div>

              {/* 위험 */}
              <div className="p-3 bg-white rounded-lg border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-xs text-red-900">위험</span>
                </div>
                <p className="text-xs text-gray-600 mb-1">사용률 ≥ 95%</p>
                <p className="text-xs text-gray-700">
                  즉시 조치 필요. 강제 제한 시 평가가 자동 중단될 수 있습니다.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-3 border-t border-blue-200">
              <TrendingUp className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-900">예산 관리 모범 사례</p>
                <ul className="text-xs text-blue-800 mt-2 space-y-1 list-disc list-inside">
                  <li><span className="font-semibold">프로젝트별 분리:</span> 각 프로젝트에 독립적인 예산을 할당하여 비용을 효과적으로 추적하세요.</li>
                  <li><span className="font-semibold">알림 임계값:</span> 50%, 80%, 95% 단계별 알림으로 예산 초과를 사전에 방지하세요.</li>
                  <li><span className="font-semibold">강제 제한:</span> 테스트 환경은 Soft Limit, 프로덕션은 Hard Limit을 권장합니다.</li>
                  <li><span className="font-semibold">정기 검토:</span> 월간 예산 사용 패턴을 분석하고 다음 달 예산을 조정하세요.</li>
                  <li><span className="font-semibold">최적화 활용:</span> 비용 대시보드의 최적화 제안을 참고하여 불필요한 비용을 절감하세요.</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
