import { ReactNode, useState, useEffect, useRef } from 'react';
import { Shield, Home, Database, Settings, Zap, BarChart3, FileText, Menu, X, LogOut, ChevronRight, Activity, History, GitCompare, Sparkles, DollarSign } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from './ui/breadcrumb';
import { mockUser } from '../lib/mock-data';

interface AppLayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function AppLayout({ children, currentPage, onNavigate, onLogout }: AppLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  
  // 페이지 전환 시 스크롤을 맨 위로 이동
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [currentPage]);
  
  const navigationItems = [
    { id: 'dashboard', label: '통합 대시보드', icon: Home },
    { id: 'datasets', label: '데이터셋 관리', icon: Database },
    { id: 'evaluation-mode-selection', label: '평가하기', icon: Zap },
    { id: 'monitoring', label: '평가 모니터링', icon: Activity },
    { id: 'history', label: '평가 이력', icon: History },
    { id: 'comparison', label: '결과 비교', icon: GitCompare },
    { id: 'auto-improve', label: '자동 개선', icon: Sparkles, disabled: true, phase: 'Phase 3' },
    { id: 'costs', label: '비용 대시보드', icon: DollarSign, disabled: true, phase: 'Phase 3' },
  ];

  const adminItems = mockUser.role === 'admin' ? [
    { id: 'admin', label: '관리자', icon: Shield },
  ] : [];

  // Breadcrumb 매핑
  const breadcrumbs: Record<string, { label: string; parent?: string }> = {
    dashboard: { label: '통합 대시보드' },
    'evaluation-mode-selection': { label: '평가하기' },
    'external-evaluation': { label: 'External 모드(연동된 시스템 평가)', parent: 'evaluation-mode-selection' },
    'new-evaluation': { label: 'Internal 모드(RAG 최적 설정 탐색)', parent: 'evaluation-mode-selection' },
    monitoring: { label: '평가 모니터링' },
    history: { label: '평가 이력' },
    comparison: { label: '결과 비교' },
    datasets: { label: '데이터셋 관리' },
    'auto-improve': { label: '자동 개선' },
    'auto-improve-results': { label: '자동 개선 결과', parent: 'auto-improve' },
    costs: { label: '비용 대시보드' },
    monitor: { label: '실시간 모니터링', parent: 'monitoring' },
    results: { label: '평가 결과', parent: 'history' },
    admin: { label: '관리자 대시보드' },
    logs: { label: '시스템 로그', parent: 'admin' },
  };

  const getCurrentBreadcrumb = () => {
    const current = breadcrumbs[currentPage];
    if (!current) return null;

    const items = [];
    
    if (current.parent) {
      const parent = breadcrumbs[current.parent];
      if (parent) {
        items.push({ label: parent.label, id: current.parent });
      }
    }
    
    items.push({ label: current.label, id: currentPage });
    
    return items;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-gray-200 bg-white flex-col shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-blue-600 font-bold text-[24px] not-italic">REX</h1>
            <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded text-[10px]">BETA</span>
          </div>
          <p className="text-gray-600 mt-1 text-sm">RAG 성능 평가 시스템</p>
        </div>
        
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const isActive = currentPage === item.id;
            const isDisabled = item.disabled;
            return (
              <button
                key={item.id}
                onClick={() => !isDisabled && onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isDisabled
                    ? 'text-gray-400 cursor-not-allowed opacity-50'
                    : isActive 
                      ? 'bg-blue-500 text-white shadow-sm' 
                      : 'text-gray-700 hover:bg-gray-100'
                }`}
                disabled={isDisabled}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-sm">{item.label}</span>
                  {isDisabled && (
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">{item.phase}</span>
                  )}
                </div>
              </button>
            );
          })}
          
          {adminItems.length > 0 && (
            <>
              <div className="pt-3 pb-2 px-3">
                <div className="h-px bg-gray-200" />
              </div>
              {adminItems.map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      isActive 
                        ? 'bg-blue-500 text-white shadow-sm' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">{item.label}</span>
                  </button>
                );
              })}
            </>
          )}
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <div className="w-full flex items-center gap-3 p-3 rounded-lg">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">{mockUser.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm text-gray-900 truncate">{mockUser.name}</p>
              <p className="text-xs text-gray-500 truncate">{mockUser.email}</p>
            </div>
            <button
              onClick={onLogout}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="로그아웃"
            >
              <LogOut className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <h1 className="text-blue-600 font-bold text-[18px]">REX</h1>
            <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded">BETA</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
        
        {isMobileMenuOpen && (
          <div className="border-t border-gray-200 bg-white">
            <nav className="p-3 space-y-1">
              {[...navigationItems, ...adminItems].map((item) => {
                const isActive = currentPage === item.id;
                const isDisabled = item.disabled;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (!isDisabled) {
                        onNavigate(item.id);
                        setIsMobileMenuOpen(false);
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      isDisabled
                        ? 'text-gray-400 cursor-not-allowed opacity-50'
                        : isActive 
                          ? 'bg-blue-500 text-white shadow-sm' 
                          : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    disabled={isDisabled}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-sm">{item.label}</span>
                      {isDisabled && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">{item.phase}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </nav>
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => {
                  onLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">{mockUser.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm text-gray-900 truncate">{mockUser.name}</p>
                  <p className="text-xs text-gray-500 truncate">{mockUser.email}</p>
                </div>
                <LogOut className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main ref={mainRef} className="flex-1 overflow-auto">
        <div className="p-6 pt-20 md:pt-6">
          {/* Breadcrumb */}
          {getCurrentBreadcrumb() && (
            <div className="mb-6">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink 
                      onClick={() => onNavigate('dashboard')}
                      className="cursor-pointer"
                    >
                      <Home className="h-4 w-4" />
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  {getCurrentBreadcrumb()!.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <BreadcrumbSeparator>
                        <ChevronRight className="h-4 w-4" />
                      </BreadcrumbSeparator>
                      <BreadcrumbItem>
                        {index === getCurrentBreadcrumb()!.length - 1 ? (
                          <BreadcrumbPage>{item.label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink 
                            onClick={() => onNavigate(item.id)}
                            className="cursor-pointer"
                          >
                            {item.label}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </div>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          )}
          
          {children}
        </div>
      </main>
    </div>
  );
}