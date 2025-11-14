import { useState } from 'react';
import { AppLayout } from './components/AppLayout';
import { LoginPage } from './components/LoginPage';
import { DashboardPageBlue } from './components/DashboardPageBlue';
import { DatasetsPageBlue } from './components/DatasetsPageBlue';
import { EvaluationModeSelectionPage } from './components/EvaluationModeSelectionPage';
import { ExternalEvaluationPageBlue } from './components/ExternalEvaluationPageBlue';
import { NewEvaluationPageBlue } from './components/NewEvaluationPageBlue';
import { MonitoringPageBlue } from './components/MonitoringPageBlue';
import { EvaluationHistoryPageBlue } from './components/EvaluationHistoryPageBlue';
import { ComparisonPageBlue } from './components/ComparisonPageBlue';
import { EvaluationMonitorPageBlue } from './components/EvaluationMonitorPageBlue';
import { ResultsPageBlue } from './components/ResultsPageBlue';
import { AdminPageBlue } from './components/AdminPageBlue';
import { LogViewerPageBlue } from './components/LogViewerPageBlue';
import { AutoImproveSetupPageBlue } from './components/AutoImproveSetupPageBlue';
import { AutoImproveProgressPageBlue } from './components/AutoImproveProgressPageBlue';
import { AutoImproveResultsPageBlue } from './components/AutoImproveResultsPageBlue';
import { CostDashboardPageBlue } from './components/CostDashboardPageBlue';
import { BudgetSettingsPageBlue } from './components/BudgetSettingsPageBlue';
import { CostAlertsPageBlue } from './components/CostAlertsPageBlue';
import { Toaster } from './components/ui/sonner';
import { useEvaluationStore } from './stores/evaluation-store';

type Page = 'login' | 'dashboard' | 'datasets' | 'evaluation-mode-selection' | 'external-evaluation' | 'new-evaluation' | 'monitoring' | 'history' | 'comparison' | 'monitor' | 'results' | 'admin' | 'logs' | 'auto-improve' | 'auto-improve-progress' | 'auto-improve-results' | 'costs' | 'budget-settings' | 'cost-alerts';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [totalAutoImproveExperiments, setTotalAutoImproveExperiments] = useState(12);
  const [selectedEvaluationId, setSelectedEvaluationId] = useState<string>('1');
  const [currentEvaluationProgress, setCurrentEvaluationProgress] = useState<number>(0);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage('login');
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
  };

  const handleStartEvaluation = () => {
    setCurrentPage('monitor');
  };

  const handleEvaluationComplete = () => {
    setCurrentPage('results');
  };

  const handleViewLogs = () => {
    setCurrentPage('logs');
  };

  const handleStartAutoImprove = (experimentCount: number = 12) => {
    setTotalAutoImproveExperiments(experimentCount);
    setCurrentPage('auto-improve-progress');
  };

  const handleAutoImproveComplete = () => {
    setCurrentPage('auto-improve-results');
  };

  const handleApplyAutoImproveConfig = () => {
    setCurrentPage('new-evaluation');
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPageBlue onNavigate={handleNavigate} />;
      case 'evaluation-mode-selection':
        return <EvaluationModeSelectionPage 
          onSelectMode={(mode) => {
            if (mode === 'external') {
              setCurrentPage('external-evaluation');
            } else {
              setCurrentPage('new-evaluation');
            }
          }} 
        />;
      case 'external-evaluation':
        return <ExternalEvaluationPageBlue 
          onStartEvaluation={handleStartEvaluation}
          onBack={() => setCurrentPage('evaluation-mode-selection')}
        />;
      case 'new-evaluation':
        return <NewEvaluationPageBlue 
          onStartEvaluation={handleStartEvaluation}
          onBack={() => setCurrentPage('evaluation-mode-selection')}
        />;
      case 'monitoring':
        return <MonitoringPageBlue onViewDetails={(id, progress) => {
          setCurrentEvaluationProgress(progress || 0);
          setCurrentPage('monitor');
        }} />;
      case 'history':
        return <EvaluationHistoryPageBlue onViewResults={(evalId) => {
          useEvaluationStore.getState().setSelectedEvaluationId(evalId || '1');
          setCurrentPage('results');
        }} onNavigate={handleNavigate} />;
      case 'comparison':
        return <ComparisonPageBlue onNavigate={handleNavigate} />;
      case 'datasets':
        return <DatasetsPageBlue />;
      case 'monitor':
        return <EvaluationMonitorPageBlue 
          onComplete={handleEvaluationComplete} 
          onBack={() => setCurrentPage('monitoring')}
          initialProgress={currentEvaluationProgress}
        />;
      case 'results':
        return <ResultsPageBlue evaluationId={selectedEvaluationId} onNavigate={handleNavigate} />;
      case 'admin':
        return <AdminPageBlue onViewLogs={handleViewLogs} />;
      case 'logs':
        return <LogViewerPageBlue />;
      case 'auto-improve':
        return <AutoImproveSetupPageBlue onStartAutoImprove={handleStartAutoImprove} />;
      case 'auto-improve-progress':
        return <AutoImproveProgressPageBlue 
          onComplete={handleAutoImproveComplete}
          onCancel={() => setCurrentPage('auto-improve')}
          totalExperiments={totalAutoImproveExperiments}
        />;
      case 'auto-improve-results':
        return <AutoImproveResultsPageBlue onApplyConfig={handleApplyAutoImproveConfig} />;
      case 'costs':
        return <CostDashboardPageBlue onNavigate={handleNavigate} />;
      case 'budget-settings':
        return <BudgetSettingsPageBlue onNavigate={handleNavigate} />;
      case 'cost-alerts':
        return <CostAlertsPageBlue onNavigate={handleNavigate} />;
      default:
        return <DashboardPageBlue onNavigate={handleNavigate} />;
    }
  };

  return (
    <>
      <AppLayout 
        currentPage={currentPage} 
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      >
        {renderPage()}
      </AppLayout>
      <Toaster />
    </>
  );
}