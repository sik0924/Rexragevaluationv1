import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Input } from './ui/input';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { 
  Download,
  FileText,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  FileJson,
  FileSpreadsheet,
  Clock,
  GitCompare,
  Target,
  CheckCircle2,
  XCircle,
  Search,
  MessageSquare,
  Zap,
  Lightbulb,
  ArrowRight,
  Settings,
  Info,
  X,
  Filter,
  Sparkles
} from 'lucide-react';
import { mockEvaluations, mockMetrics, mockEvaluationHistory } from '../lib/mock-data';
import { getScoreGrade, analyzeEvaluation } from '../lib/score-analysis';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { FailedCaseWithRootCause } from '../types';
import { LLMJudgeAnalysisCard } from './LLMJudgeAnalysisCard';
import { DiagnosisSummaryCard } from './DiagnosisSummaryCard';
import { useEvaluationStore } from '../stores/evaluation-store';

interface ResultsPageBlueProps {
  onNavigate: (page: string) => void;
}

export function ResultsPageBlue({ onNavigate }: ResultsPageBlueProps) {
  const { selectedEvaluationId } = useEvaluationStore();
  
  // 스토어에서 선택된 평가 ID가 있으면 사용, 없으면 첫 번째 완료된 평가 사용
  const completedEvals = mockEvaluations.filter(e => e.status === 'completed');
  const defaultId = selectedEvaluationId || completedEvals[0]?.id || '1';
  
  const [selectedEvalId, setSelectedEvalId] = useState(defaultId);
  const [compareEvalId, setCompareEvalId] = useState('');
  const [selectedFailedCase, setSelectedFailedCase] = useState<FailedCaseWithRootCause | null>(null);
  const [showPromptPreview, setShowPromptPreview] = useState(false);
  const [showHelpBanner, setShowHelpBanner] = useState(true);
  const [failedCaseSearch, setFailedCaseSearch] = useState('');
  const [rootCauseFilter, setRootCauseFilter] = useState<'all' | 'retrieval' | 'generation'>('all');

  // 다운로드 함수들
  const downloadCSV = (evaluation: any) => {
    const headers = ['Metric', 'Score'];
    const rows = Object.entries(evaluation.scores).map(([key, value]: [string, any]) => {
      const metric = mockMetrics.find(m => m.id === key);
      return [metric?.name || key, (value * 100).toFixed(2)];
    });
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${evaluation.name}_results.csv`;
    link.click();
  };

  const downloadJSON = (evaluation: any) => {
    const data = {
      evaluationName: evaluation.name,
      completedAt: evaluation.completedAt || evaluation.startedAt,
      scores: evaluation.scores,
      metrics: Object.keys(evaluation.scores).map(key => ({
        id: key,
        name: mockMetrics.find(m => m.id === key)?.name || key,
        score: evaluation.scores[key],
        percentage: (evaluation.scores[key] * 100).toFixed(2)
      })),
      failedCases: evaluation.failedCases || []
    };
    
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${evaluation.name}_results.json`;
    link.click();
  };

  const downloadPDF = (evaluation: any) => {
    // PDF 생성을 위한 간단한 HTML 기반 접근
    const avgScore = Object.values(evaluation.scores).reduce((a: any, b: any) => a + b, 0) / 
                     Object.values(evaluation.scores).length * 100;
    const gradeInfo = getScoreGrade(avgScore);
    const analysis = analyzeEvaluation(evaluation, previousEvaluation);
    
    // 점수 계산
    const retrievalScore = [
      evaluation.scores.context_precision,
      evaluation.scores.context_recall,
      evaluation.scores.context_entity_recall
    ].filter(Boolean).reduce((a, b) => a + b, 0) / 
    [evaluation.scores.context_precision, evaluation.scores.context_recall, evaluation.scores.context_entity_recall]
    .filter(Boolean).length * 100;

    const generationScore = [
      evaluation.scores.faithfulness,
      evaluation.scores.answer_correctness,
      evaluation.scores.answer_relevancy,
      evaluation.scores.conciseness
    ].filter(Boolean).reduce((a, b) => a + b, 0) /
    [evaluation.scores.faithfulness, evaluation.scores.answer_correctness, evaluation.scores.answer_relevancy, evaluation.scores.conciseness]
    .filter(Boolean).length * 100;

    // 실패 케이스 통계
    const failedCases = evaluation.failedCases || [];
    const retrievalFailures = failedCases.filter((fc: any) => fc.rootCause === 'retrieval').length;
    const generationFailures = failedCases.filter((fc: any) => fc.rootCause === 'generation').length;
    
    // 비용 계산 (diagnosisSummary 사용)
    const diagnosisSummary = evaluation.diagnosisSummary || {};
    const totalFailed = diagnosisSummary.total_failed || failedCases.length || 0;
    const llmJudgeAnalyzed = diagnosisSummary.llm_judge_analyzed || failedCases.length || 0;
    const samplingRatio = totalFailed > 0 ? ((llmJudgeAnalyzed / totalFailed) * 100).toFixed(1) : '0.0';
    const costSaved = totalFailed > 0 ? (((totalFailed - llmJudgeAnalyzed) / totalFailed) * 100).toFixed(1) : '0.0';
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${evaluation.name} - RAG 평가 결과 리포트</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
            padding: 40px; 
            max-width: 900px; 
            margin: 0 auto; 
            background: #ffffff;
            color: #1f2937;
            line-height: 1.6;
          }
          .header {
            background: #1e40af;
            color: white;
            padding: 32px 40px;
            margin: -40px -40px 40px -40px;
            border-bottom: 3px solid #1e3a8a;
          }
          h1 { 
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 12px;
            letter-spacing: -0.02em;
          }
          .header-meta {
            font-size: 14px;
            opacity: 0.95;
            margin-top: 12px;
            line-height: 1.8;
          }
          .header-meta div {
            margin: 4px 0;
          }
          h2 { 
            color: #111827; 
            font-size: 20px;
            font-weight: 700;
            margin: 40px 0 20px 0;
            padding-bottom: 12px;
            border-bottom: 2px solid #1e40af;
            letter-spacing: -0.01em;
          }
          h3 {
            color: #374151;
            font-size: 16px;
            font-weight: 600;
            margin: 28px 0 16px 0;
            letter-spacing: -0.01em;
          }
          .section {
            background: #ffffff;
            padding: 32px;
            margin-bottom: 24px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
            margin: 24px 0;
          }
          .summary-item {
            background: #f9fafb;
            padding: 20px;
            border-radius: 6px;
            border-left: 3px solid #1e40af;
          }
          .summary-item label {
            display: block;
            font-size: 11px;
            color: #6b7280;
            margin-bottom: 8px;
            text-transform: uppercase;
            font-weight: 600;
            letter-spacing: 0.05em;
          }
          .summary-item .value {
            font-size: 18px;
            font-weight: 600;
            color: #111827;
          }
          .grade-box {
            background: #f8fafc;
            padding: 32px;
            border-radius: 6px;
            text-align: center;
            border: 2px solid #1e40af;
            margin: 24px 0;
          }
          .grade-score {
            font-size: 56px;
            font-weight: 700;
            color: #1e40af;
            letter-spacing: -0.03em;
          }
          .grade-label {
            font-size: 18px;
            color: #374151;
            margin-top: 12px;
            font-weight: 600;
          }
          .metric-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            border: 1px solid #e5e7eb;
          }
          .metric-table th {
            background: #f3f4f6;
            padding: 14px 16px;
            text-align: left;
            font-size: 12px;
            color: #111827;
            font-weight: 600;
            border-bottom: 2px solid #d1d5db;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .metric-table td {
            padding: 14px 16px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 14px;
            color: #374151;
          }
          .metric-table tr:last-child td {
            border-bottom: none;
          }
          .metric-table tbody tr:hover {
            background: #f9fafb;
          }
          .score-high { color: #1e40af; font-weight: 600; }
          .score-medium { color: #d97706; font-weight: 600; }
          .score-low { color: #6b7280; font-weight: 600; }
          .insight-box {
            background: #fffbeb;
            border-left: 3px solid #d97706;
            padding: 18px 20px;
            border-radius: 4px;
            margin: 16px 0;
          }
          .insight-box strong {
            color: #78350f;
          }
          .failed-case {
            background: #f9fafb;
            border-left: 3px solid #6b7280;
            padding: 18px 20px;
            border-radius: 4px;
            margin: 16px 0;
            page-break-inside: avoid;
          }
          .failed-case .question {
            font-weight: 600;
            color: #111827;
            margin-bottom: 12px;
            font-size: 14px;
          }
          .failed-case .answers {
            font-size: 13px;
            color: #4b5563;
            margin: 10px 0;
            line-height: 1.7;
          }
          .failed-case .root-cause {
            display: inline-block;
            background: #374151;
            color: white;
            padding: 4px 12px;
            border-radius: 3px;
            font-size: 11px;
            margin-top: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.03em;
          }
          .cost-optimization {
            background: #f0f9ff;
            border-left: 3px solid #1e40af;
            padding: 18px 20px;
            border-radius: 4px;
            margin: 16px 0;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            margin: 24px 0;
          }
          .stat-card {
            background: #f9fafb;
            padding: 20px;
            border-radius: 6px;
            text-align: center;
            border: 1px solid #e5e7eb;
          }
          .stat-card .number {
            font-size: 28px;
            font-weight: 700;
            color: #1e40af;
            margin-bottom: 8px;
            letter-spacing: -0.02em;
          }
          .stat-card .label {
            font-size: 11px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            font-weight: 600;
          }
          .footer { 
            margin-top: 60px; 
            padding-top: 24px; 
            border-top: 2px solid #e5e7eb; 
            text-align: center;
            color: #6b7280; 
            font-size: 12px;
            line-height: 1.8;
          }
          .page-break { page-break-after: always; }
          .badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.03em;
          }
          .badge-blue { background: #dbeafe; color: #1e40af; }
          .badge-amber { background: #fef3c7; color: #92400e; }
          .badge-gray { background: #f3f4f6; color: #374151; }
          @media print {
            body { background: white; }
            .section { box-shadow: none; page-break-inside: avoid; }
            .header { margin: -40px -40px 40px -40px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>RAG 평가 결과 리포트</h1>
          <div class="header-meta">
            <div><strong>평가명:</strong> ${evaluation.name}</div>
            <div><strong>생성 일시:</strong> ${new Date().toLocaleString('ko-KR', { 
              year: 'numeric', month: 'long', day: 'numeric', 
              hour: '2-digit', minute: '2-digit' 
            })}</div>
          </div>
        </div>

        <!-- 평가 개요 -->
        <div class="section">
          <h2>평가 개요</h2>
          <div class="summary-grid">
            <div class="summary-item">
              <label>평가 ID</label>
              <div class="value">${evaluation.id}</div>
            </div>
            <div class="summary-item">
              <label>평가 시작</label>
              <div class="value">${new Date(evaluation.startedAt).toLocaleString('ko-KR', {
                month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
              })}</div>
            </div>
            <div class="summary-item">
              <label>평가 완료</label>
              <div class="value">${new Date(evaluation.completedAt || evaluation.startedAt).toLocaleString('ko-KR', {
                month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
              })}</div>
            </div>
            <div class="summary-item">
              <label>소요 시간</label>
              <div class="value">${(() => {
                const start = new Date(evaluation.startedAt).getTime();
                const end = new Date(evaluation.completedAt || evaluation.startedAt).getTime();
                const minutes = Math.round((end - start) / 1000 / 60);
                return `${minutes}분`;
              })()}</div>
            </div>
          </div>
        </div>

        <!-- 데이터셋 & 시스템 정보 -->
        <div class="section">
          <h2>데이터셋 & 시스템 정보</h2>
          <div class="summary-grid">
            <div class="summary-item">
              <label>데이터셋</label>
              <div class="value">${evaluation.datasetName || 'N/A'}</div>
            </div>
            <div class="summary-item">
              <label>LLM 모델</label>
              <div class="value">${evaluation.modelName || 'N/A'}</div>
            </div>
            <div class="summary-item">
              <label>Vector DB</label>
              <div class="value">${evaluation.vectorDbName || 'N/A'}</div>
            </div>
            <div class="summary-item">
              <label>설정 ID</label>
              <div class="value">${evaluation.configId || 'N/A'}</div>
            </div>
          </div>
        </div>

        <!-- 종합 점수 -->
        <div class="section">
          <h2>종합 평가 점수</h2>
          <div class="grade-box">
            <div class="grade-score">${avgScore.toFixed(1)}</div>
            <div class="grade-label">${gradeInfo.label}</div>
          </div>
          
          <div class="stats-grid">
            <div class="stat-card">
              <div class="number">${retrievalScore.toFixed(1)}점</div>
              <div class="label">검색 성능</div>
            </div>
            <div class="stat-card">
              <div class="number">${generationScore.toFixed(1)}점</div>
              <div class="label">생성 성능</div>
            </div>
            <div class="stat-card">
              <div class="number">${Object.keys(evaluation.scores).length}</div>
              <div class="label">평가 지표</div>
            </div>
          </div>

          ${analysis.insights.length > 0 ? `
            <h3>주요 인사이트</h3>
            ${analysis.insights.map(insight => `
              <div class="insight-box">
                <strong>${insight.message}</strong>
                ${insight.actionable ? `<div style="margin-top: 10px; font-size: 13px; color: #4b5563;">권장사항: ${insight.actionable}</div>` : ''}
              </div>
            `).join('')}
          ` : ''}
        </div>

        <!-- 상세 지표 분석 -->
        <div class="section page-break">
          <h2>상세 지표 분석</h2>
          <p style="color: #6b7280; font-size: 13px; margin-bottom: 24px;">12개 RAG 평가 지표에 대한 상세 분석 결과</p>
          
          <h3>검색 품질 지표 (Retrieval Quality)</h3>
          <table class="metric-table">
            <thead>
              <tr>
                <th>지표명</th>
                <th>점수</th>
                <th>등급</th>
                <th>설명</th>
              </tr>
            </thead>
            <tbody>
              ${[
                { id: 'context_precision', name: 'Context Precision', desc: '검색된 문맥의 정확도' },
                { id: 'context_recall', name: 'Context Recall', desc: '검색된 문맥의 재현율' },
                { id: 'context_entity_recall', name: 'Context Entity Recall', desc: '개체명 재현율' }
              ].filter(m => evaluation.scores[m.id] !== undefined).map(metric => {
                const score = (evaluation.scores[metric.id] * 100).toFixed(1);
                const scoreNum = parseFloat(score);
                const scoreClass = scoreNum >= 85 ? 'score-high' : scoreNum >= 70 ? 'score-medium' : 'score-low';
                const grade = scoreNum >= 85 ? '우수' : scoreNum >= 70 ? '양호' : '개선필요';
                return `
                  <tr>
                    <td><strong>${metric.name}</strong></td>
                    <td class="${scoreClass}">${score}점</td>
                    <td>${grade}</td>
                    <td style="font-size: 12px; color: #6b7280;">${metric.desc}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <h3>생성 품질 지표 (Generation Quality)</h3>
          <table class="metric-table">
            <thead>
              <tr>
                <th>지표명</th>
                <th>점수</th>
                <th>등급</th>
                <th>설명</th>
              </tr>
            </thead>
            <tbody>
              ${[
                { id: 'faithfulness', name: 'Faithfulness', desc: '답변의 사실 충실성' },
                { id: 'answer_relevancy', name: 'Answer Relevancy', desc: '답변의 관련성' },
                { id: 'answer_correctness', name: 'Answer Correctness', desc: '답변의 정확성' },
                { id: 'answer_similarity', name: 'Answer Similarity', desc: '답변의 유사도' },
                { id: 'coherence', name: 'Coherence', desc: '답변의 일관성' },
                { id: 'conciseness', name: 'Conciseness', desc: '답변의 간결성' },
                { id: 'critique_correctness', name: 'Critique Correctness', desc: '비평의 정확성' }
              ].filter(m => evaluation.scores[m.id] !== undefined).map(metric => {
                const score = (evaluation.scores[metric.id] * 100).toFixed(1);
                const scoreNum = parseFloat(score);
                const scoreClass = scoreNum >= 85 ? 'score-high' : scoreNum >= 70 ? 'score-medium' : 'score-low';
                const grade = scoreNum >= 85 ? '우수' : scoreNum >= 70 ? '양호' : '개선필요';
                return `
                  <tr>
                    <td><strong>${metric.name}</strong></td>
                    <td class="${scoreClass}">${score}점</td>
                    <td>${grade}</td>
                    <td style="font-size: 12px; color: #6b7280;">${metric.desc}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <h3>안전성 지표 (Safety)</h3>
          <table class="metric-table">
            <thead>
              <tr>
                <th>지표명</th>
                <th>점수</th>
                <th>등급</th>
                <th>설명</th>
              </tr>
            </thead>
            <tbody>
              ${[
                { id: 'harmfulness', name: 'Harmfulness', desc: '유해성 점수 (높을수록 안전)' },
                { id: 'maliciousness', name: 'Maliciousness', desc: '악의성 점수 (높을수록 안전)' }
              ].filter(m => evaluation.scores[m.id] !== undefined).map(metric => {
                const score = (evaluation.scores[metric.id] * 100).toFixed(1);
                const scoreNum = parseFloat(score);
                const scoreClass = scoreNum >= 85 ? 'score-high' : scoreNum >= 70 ? 'score-medium' : 'score-low';
                const grade = scoreNum >= 85 ? '우수' : scoreNum >= 70 ? '양호' : '개선필요';
                return `
                  <tr>
                    <td><strong>${metric.name}</strong></td>
                    <td class="${scoreClass}">${score}점</td>
                    <td>${grade}</td>
                    <td style="font-size: 12px; color: #6b7280;">${metric.desc}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- 오류 분석 -->
        ${failedCases.length > 0 ? `
        <div class="section page-break">
          <h2>오류 분석</h2>
          
          <div class="stats-grid">
            <div class="stat-card">
              <div class="number">${failedCases.length}</div>
              <div class="label">총 실패 케이스</div>
            </div>
            <div class="stat-card">
              <div class="number">${retrievalFailures}</div>
              <div class="label">검색 오류</div>
            </div>
            <div class="stat-card">
              <div class="number">${generationFailures}</div>
              <div class="label">생성 오류</div>
            </div>
          </div>

          <h3>실패 케이스 상세</h3>
          ${failedCases.slice(0, 10).map((fc: any, idx: number) => `
            <div class="failed-case">
              <div class="question">Case ${idx + 1}: ${fc.question}</div>
              <div class="answers">
                <div style="margin-bottom: 6px;"><strong>예상 답변:</strong> ${fc.expectedAnswer}</div>
                <div style="margin-bottom: 6px;"><strong>생성 답변:</strong> ${fc.generatedAnswer}</div>
                <div style="margin-bottom: 6px;"><strong>평가 점수:</strong> ${(fc.score * 100).toFixed(1)}점</div>
                <div style="margin-bottom: 6px;"><strong>실패 원인:</strong> ${fc.reason}</div>
              </div>
              <span class="root-cause">${fc.rootCause === 'retrieval' ? 'Retrieval Issue' : 'Generation Issue'}</span>
            </div>
          `).join('')}
          ${failedCases.length > 10 ? `<p style="margin-top: 15px; color: #6b7280; font-size: 13px;">※ 총 ${failedCases.length}개 중 상위 10개 케이스만 표시됨</p>` : ''}
        </div>
        ` : ''}

        <!-- 비용 최적화 -->
        ${diagnosisSummary.total_failed ? `
        <div class="section">
          <h2>LLM Judge 비용 최적화</h2>
          <div class="cost-optimization">
            <h3 style="color: #1e40af; margin-bottom: 12px;">비용 절감 전략 적용</h3>
            <p style="font-size: 14px; margin-bottom: 16px; color: #4b5563; line-height: 1.7;">
              휴리스틱 기반 1차 필터링과 고정 비율 샘플링을 통해 LLM Judge 호출을 최소화하여 평가 비용을 절감합니다.
            </p>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="number">${totalFailed}</div>
                <div class="label">전체 실패 케이스</div>
              </div>
              <div class="stat-card">
                <div class="number">${llmJudgeAnalyzed}</div>
                <div class="label">LLM Judge 분석</div>
              </div>
              <div class="stat-card">
                <div class="number" style="color: #10b981;">${costSaved}%</div>
                <div class="label">비용 절감</div>
              </div>
            </div>
            <p style="font-size: 12px; color: #6b7280; margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
              <strong>샘플링 비율:</strong> ${samplingRatio}% | 
              <strong>적용 전략:</strong> 휴리스틱 필터링 + 고정 비율 샘플링
            </p>
          </div>
        </div>
        ` : ''}

        <!-- 요약 및 권장사항 -->
        <div class="section">
          <h2>요약 및 권장사항</h2>
          ${evaluation.summary ? `
            <div class="insight-box">
              <strong>평가 요약</strong>
              <div style="margin-top: 8px; font-size: 14px; color: #4b5563;">${evaluation.summary}</div>
            </div>
          ` : ''}
          
          <h3>권장 조치사항</h3>
          <ul style="margin-left: 20px; color: #4b5563; line-height: 2;">
            ${avgScore >= 85 ? `
              <li>우수한 성능을 유지하고 있습니다. 주기적인 모니터링을 권장합니다.</li>
              <li>현재 설정을 프로덕션 환경에 적용할 수 있습니다.</li>
              <li>성능 유지를 위한 정기적인 평가 일정을 수립하세요.</li>
            ` : avgScore >= 70 ? `
              <li>전반적으로 양호한 성능이나 일부 지표 개선이 필요합니다.</li>
              <li>${retrievalScore < 70 ? 'Vector DB 설정 및 검색 알고리즘 점검이 필요합니다.' : '검색 품질은 양호한 수준입니다.'}</li>
              <li>${generationScore < 70 ? 'LLM 모델 프롬프트 및 파라미터 최적화를 권장합니다.' : '생성 품질은 양호한 수준입니다.'}</li>
              <li>실패 케이스를 분석하여 개선 우선순위를 결정하세요.</li>
            ` : `
              <li>긴급 개선이 필요합니다. Root Cause Analysis를 즉시 수행하세요.</li>
              <li>검색 품질이 낮다면 청크 전략과 임베딩 모델을 재검토하세요.</li>
              <li>생성 품질이 낮다면 프롬프트 엔지니어링과 모델 선택을 재평가하세요.</li>
              <li>실패 케이스를 분석하여 데이터셋 품질을 개선하세요.</li>
              <li>시스템 전반의 설정 및 구성을 점검하세요.</li>
            `}
          </ul>
        </div>

        <div class="footer">
          <p style="font-weight: 600; color: #1e40af; margin-bottom: 8px;">REX - RAG Performance Evaluation Solution</p>
          <p style="margin-bottom: 12px;">Report ID: ${evaluation.id} | Generated on ${new Date().toLocaleString('ko-KR')}</p>
          <p style="font-size: 11px; line-height: 1.6; color: #9ca3af;">
            본 리포트는 12개 RAG 평가 지표를 기반으로 자동 생성되었습니다.<br>
            LLM Judge 비용 최적화를 위해 휴리스틱 필터링 및 샘플링 전략이 적용되었습니다.<br>
            <span style="margin-top: 8px; display: block;">© ${new Date().getFullYear()} REX. All rights reserved.</span>
          </p>
        </div>
      </body>
      </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `REX_Report_${evaluation.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`;
    link.click();
  };
  
  // 스토어의 selectedEvaluationId가 변경될 때 selectedEvalId 업데이트
  useEffect(() => {
    if (selectedEvaluationId) {
      setSelectedEvalId(selectedEvaluationId);
    }
  }, [selectedEvaluationId]);
  
  // mockEvaluationHistory를 사용 (더 상세한 데이터)
  const completedEvalsHistory = mockEvaluationHistory.filter(e => e.status === 'completed');
  const latestEvaluation = completedEvalsHistory.find(e => e.id === selectedEvalId);
  const compareEvaluation = compareEvalId ? completedEvalsHistory.find(e => e.id === compareEvalId) : null;
  
  if (!latestEvaluation) {
    return (
      <TooltipProvider>
        <div className="space-y-6 bg-gray-50/30 -m-6 p-6">
          <h1 className="text-gray-900 font-bold text-[24px]">평가 결과</h1>
          <Card className="border-blue-100 bg-white shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <FileText className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-lg text-gray-900 mb-2">완료된 평가가 없습니다</h3>
              <p className="text-gray-600 text-sm max-w-md mb-6">
                첫 번째 RAG 평가를 시작하고 상세한 성능 분석 결과를 확인해보세요
              </p>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => onNavigate('new-evaluation')}
              >
                <Zap className="h-4 w-4 mr-2" />
                첫 평가 시작하기
              </Button>
            </CardContent>
          </Card>
        </div>
      </TooltipProvider>
    );
  }

  const radarData = Object.entries(latestEvaluation.scores).map(([key, value]) => ({
    metric: mockMetrics.find(m => m.id === key)?.name || key,
    score: (value * 100).toFixed(0),
    fullMark: 100
  }));

  const barData = Object.entries(latestEvaluation.scores).map(([key, value]) => ({
    name: mockMetrics.find(m => m.id === key)?.name || key,
    점수: (value * 100).toFixed(1)
  }));

  const avgScore = Object.values(latestEvaluation.scores).reduce((a, b) => a + b, 0) / 
                   Object.values(latestEvaluation.scores).length * 100;

  const avgLatency = 1.2;

  // 개별 지표별 뱃지 (간단한 3단계)
  const getScoreBadge = (score: number) => {
    if (score >= 90) return { variant: 'default' as const, label: '우수', icon: TrendingUp };
    if (score >= 70) return { variant: 'secondary' as const, label: '양호', icon: TrendingUp };
    return { variant: 'destructive' as const, label: '개선필요', icon: TrendingDown };
  };

  const retrievalScores = {
    context_precision: latestEvaluation.scores.context_precision || 0,
    context_recall: latestEvaluation.scores.context_recall || 0,
    context_entity_recall: latestEvaluation.scores.context_entity_recall || 0
  };

  const generationScores = {
    faithfulness: latestEvaluation.scores.faithfulness || 0,
    answer_correctness: latestEvaluation.scores.answer_correctness || 0,
    answer_relevancy: latestEvaluation.scores.answer_relevancy || 0,
    conciseness: latestEvaluation.scores.conciseness || 0
  };

  // 이전 평가 찾기 (현재 평가 이전의 가장 최근 평가)
  const previousEvaluation = completedEvals
    .filter(e => e.id !== selectedEvalId && new Date(e.completedAt || e.startedAt) < new Date(latestEvaluation.completedAt || latestEvaluation.startedAt))
    .sort((a, b) => new Date(b.completedAt || b.startedAt).getTime() - new Date(a.completedAt || a.startedAt).getTime())[0];

  // 종합 분석
  const analysis = analyzeEvaluation(latestEvaluation, previousEvaluation);
  const grade = analysis.grade;
  
  // 등급별 색상 매핑
  const gradeColorMap = {
    excellent: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300', icon: 'text-green-600' },
    good: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300', icon: 'text-blue-600' },
    fair: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', icon: 'text-yellow-600' },
    poor: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300', icon: 'text-orange-600' },
    critical: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', icon: 'text-red-600' }
  };
  
  const gradeColors = gradeColorMap[grade.level];

  // Failed Cases 필터링
  const filteredFailedCases = (latestEvaluation.failedCases || [])
    .filter(fc => {
      const matchesSearch = fc.question.toLowerCase().includes(failedCaseSearch.toLowerCase()) ||
                           fc.expectedAnswer.toLowerCase().includes(failedCaseSearch.toLowerCase()) ||
                           fc.generatedAnswer.toLowerCase().includes(failedCaseSearch.toLowerCase());
      const matchesFilter = rootCauseFilter === 'all' || fc.rootCause === rootCauseFilter;
      return matchesSearch && matchesFilter;
    });

  // LLM Judge 샘플링 정보 렌더링 헬퍼
  const renderSamplingBadge = (metricId: string) => {
    const metric = mockMetrics.find(m => m.id === metricId);
    if (!metric?.requiresLLMJudge || !latestEvaluation.diagnosisSummary) return null;

    const { llm_judge_analyzed, total_failed } = latestEvaluation.diagnosisSummary;
    if (total_failed === 0) return null;

    const samplingRatio = ((llm_judge_analyzed / total_failed) * 100).toFixed(0);
    
    return (
      <UITooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help">
            <Sparkles className="h-3 w-3 text-purple-500" />
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-xs font-medium mb-1">🤖 LLM Judge 분석 기반</p>
          <p className="text-xs text-gray-400">
            {llm_judge_analyzed}/{total_failed} 실패 케이스 분석 ({samplingRatio}% 샘플링)
          </p>
          <p className="text-xs text-gray-300 mt-1">
            평가 점수는 전체 데이터셋 기반이며, 실패 원인 분석만 샘플링되었습니다.
          </p>
        </TooltipContent>
      </UITooltip>
    );
  };

  return (
    <TooltipProvider>
      <div className="space-y-4 bg-gray-50/30 -m-6 p-6">
        {/* 도움말 배너 */}
        {showHelpBanner && (
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="flex items-start justify-between gap-2">
              <span className="text-sm text-blue-900">
                평가 등급은 <strong>탁월(90+)</strong>, <strong>우수(80+)</strong>, <strong>주의(70+)</strong>, <strong>미흡(60+)</strong>, <strong>심각(60 미만)</strong>으로 구분됩니다. 
                가중치 기반 종합 점수로 평가되며, 핵심 지표(3.0배), 중요 지표(2.0배), 보조 지표(1.5배), 부가 지표(1.0배)가 차등 반영됩니다.
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-blue-100 shrink-0"
                onClick={() => setShowHelpBanner(false)}
              >
                <X className="h-4 w-4 text-blue-600" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs">
                <FileText className="h-3 w-3 mr-1" />
                평가 결과 리포트
              </Badge>
              {latestEvaluation.status === 'completed' && (
                <Badge variant="outline" className="border-[#DEDEDE] text-[#666666] text-xs">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  완료
                </Badge>
              )}
            </div>



            <h1 className="text-2xl font-bold text-gray-900 leading-tight mt-3">
              {latestEvaluation.name}
            </h1>
            <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>
                  {latestEvaluation.completedAt 
                    ? new Date(latestEvaluation.completedAt).toLocaleString('ko-KR', { 
                        year: 'numeric', 
                        month: '2-digit', 
                        day: '2-digit', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })
                    : new Date(latestEvaluation.startedAt).toLocaleString('ko-KR', { 
                        year: 'numeric', 
                        month: '2-digit', 
                        day: '2-digit', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })
                  }
                </span>
              </div>
            </div>
            
            {/* 데이터셋 정보 */}
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
              <FileText className="h-4 w-4" />
              <span>
                데이터셋: {latestEvaluation.datasetName || 'N/A'}
                {latestEvaluation.testCases && ` (${latestEvaluation.testCases}문항)`}
              </span>
            </div>
          </div>
          
          {/* 액션 버튼 */}
          <div className="flex gap-2 flex-wrap shrink-0">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-gray-300">
                <GitCompare className="h-4 w-4 mr-2" />
                결과 비교
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-gray-900">평가 결과 비교</DialogTitle>
                <DialogDescription className="text-gray-600">
                  두 개의 평가 결과를 비교하여 성능 변화를 확인하세요
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-700">평가 1</label>
                    <Select value={selectedEvalId} onValueChange={setSelectedEvalId}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {completedEvals.map(e => {
                          const score = Object.values(e.scores).reduce((a, b) => a + b, 0) / Object.values(e.scores).length * 100;
                          const gradeInfo = getScoreGrade(score);
                          return (
                            <SelectItem key={e.id} value={e.id}>
                              <div className="flex items-center gap-2">
                                <span>{e.name}</span>
                                <span className="text-xs text-gray-500">({score.toFixed(0)}점 - {gradeInfo.emoji} {gradeInfo.label})</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-700">평가 2</label>
                    <Select value={compareEvalId} onValueChange={setCompareEvalId}>
                      <SelectTrigger>
                        <SelectValue placeholder="비교할 평가 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {completedEvals.filter(e => e.id !== selectedEvalId).map(e => {
                          const score = Object.values(e.scores).reduce((a, b) => a + b, 0) / Object.values(e.scores).length * 100;
                          const gradeInfo = getScoreGrade(score);
                          return (
                            <SelectItem key={e.id} value={e.id}>
                              <div className="flex items-center gap-2">
                                <span>{e.name}</span>
                                <span className="text-xs text-gray-500">({score.toFixed(0)}점 - {gradeInfo.emoji} {gradeInfo.label})</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {compareEvaluation && (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <Card className="border-blue-100 bg-white shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-gray-900">평가 1 - Overall Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-blue-600 text-3xl font-semibold">{avgScore.toFixed(2)}</div>
                        </CardContent>
                      </Card>
                      <Card className="border-blue-100 bg-white shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-gray-900">평가 2 - Overall Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-blue-600 text-3xl font-semibold">
                            {(Object.values(compareEvaluation.scores).reduce((a, b) => a + b, 0) / 
                              Object.values(compareEvaluation.scores).length * 100).toFixed(2)}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="border-blue-100 bg-white shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-gray-900">주요 차이점 요약</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="leading-relaxed whitespace-normal break-words text-gray-700">
                          평가 2는 Answer Relevancy가 3점 높지만, Faithfulness와 Context Precision은 
                          각각 2점, 8점 낮습니다. 전반적으로 답변의 관련성은 개선되었으나, 
                          사실 충실성과 검색 정확도는 감소한 것으로 나타났습니다.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
          <UITooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                className="border-gray-300"
                onClick={() => downloadCSV(latestEvaluation)}
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                CSV
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">평가 결과를 CSV 파일로 다운로드</p>
            </TooltipContent>
          </UITooltip>

          <UITooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                className="border-gray-300"
                onClick={() => downloadJSON(latestEvaluation)}
              >
                <FileJson className="h-4 w-4 mr-2" />
                JSON
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">평가 결과를 JSON 파일로 다운로드</p>
            </TooltipContent>
          </UITooltip>

          <UITooltip>
            <TooltipTrigger asChild>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => downloadPDF(latestEvaluation)}
              >
                <Download className="h-4 w-4 mr-2" />
                PDF 리포트
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">평가 결과를 HTML 리포트로 다운로드</p>
            </TooltipContent>
          </UITooltip>
          </div>
        </div>

      {/* 점수 분석 & 인사이트 */}
      <Card className={`border-2 ${gradeColors.border} ${gradeColors.bg} shadow-sm`}>
        <CardHeader className={`pb-3 border-b ${gradeColors.border}`}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className={`text-4xl ${gradeColors.icon}`}>{grade.emoji}</div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className={`text-2xl ${gradeColors.text}`}>
                    {analysis.score.toFixed(1)}점
                  </CardTitle>
                  <Badge className={`${gradeColors.bg} ${gradeColors.text} ${gradeColors.border} border`}>
                    {grade.label}
                  </Badge>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <Info className={`h-4 w-4 ${gradeColors.icon} cursor-help`} />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <div className="text-xs space-y-2">
                        <p className="font-semibold">🎯 가중치 기반 종합 점수</p>
                        <p className="text-gray-300">각 지표의 중요도에 따라 차등 반영:</p>
                        <ul className="space-y-1 ml-2">
                          <li>🔴 <strong>핵심</strong> (3.0배): Faithfulness, Answer Correctness</li>
                          <li>🟠 <strong>중요</strong> (2.0배): Answer Relevancy, Context Precision 등</li>
                          <li>🔵 <strong>보조</strong> (1.5배): Coherence, Answer Similarity</li>
                          <li>⚪ <strong>부가</strong> (1.0배): 특수 진단 지표</li>
                        </ul>
                        <p className="pt-2 border-t border-gray-600 text-gray-300">
                          평가된 지표만 사용하여 동적으로 계산됩니다.
                        </p>
                        <p className="font-semibold mt-2">📊 등급 기준:</p>
                        <ul className="space-y-0.5 ml-2">
                          <li>• 탁월: 90점 이상</li>
                          <li>• 우수: 80~89점</li>
                          <li>• 주의: 70~79점</li>
                          <li>• 미흡: 60~69점</li>
                          <li>• 심각: 60점 미만</li>
                        </ul>
                      </div>
                    </TooltipContent>
                  </UITooltip>
                </div>
                
                {/* 신뢰도 및 평가 지표 수 */}
                <div className="flex items-center gap-3 mt-2">
                  <Badge 
                    variant={
                      analysis.weightedResult.reliability.level === 'high' ? 'default' :
                      analysis.weightedResult.reliability.level === 'medium' ? 'secondary' : 
                      'outline'
                    }
                    className={`text-xs ${
                      analysis.weightedResult.reliability.level === 'high' ? 'bg-green-100 text-green-700 border-green-300' :
                      analysis.weightedResult.reliability.level === 'medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' : 
                      'bg-gray-100 text-gray-700 border-gray-300'
                    }`}
                  >
                    신뢰도: {
                      analysis.weightedResult.reliability.level === 'high' ? '🟢 높음' :
                      analysis.weightedResult.reliability.level === 'medium' ? '🟡 중간' : 
                      '🔴 낮음'
                    }
                  </Badge>
                  <span className="text-xs text-gray-600">
                    평가: {analysis.weightedResult.evaluatedMetrics}/12개 지표
                  </span>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs">{analysis.weightedResult.reliability.message}</p>
                    </TooltipContent>
                  </UITooltip>
                </div>
                
                <p className={`text-sm ${gradeColors.text} mt-2`}>{grade.description}</p>
              </div>
            </div>
            
            {analysis.comparison && (
              <div className="flex items-center gap-2">
                {analysis.comparison.trend === 'improving' && (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                )}
                {analysis.comparison.trend === 'degrading' && (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                )}
                <span className={`text-sm font-medium ${analysis.comparison.scoreDelta > 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {analysis.comparison.scoreDelta > 0 ? '+' : ''}{analysis.comparison.scoreDelta.toFixed(1)}점
                </span>
                <span className="text-xs text-gray-600">vs 이전 평가</span>
              </div>
            )}
          </div>
          
          {/* 경고 메시지 */}
          {grade.warnings && grade.warnings.length > 0 && (
            <Alert className="mt-4 bg-yellow-50 border-yellow-300">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription>
                <p className="font-semibold text-yellow-900 text-sm mb-2">⚠️ 주의 필요</p>
                <ul className="text-sm space-y-1 text-yellow-800">
                  {grade.warnings.map((warning, idx) => (
                    <li key={idx}>{warning}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>
        
        <CardContent className="pt-4 space-y-3">
          {/* 인사이트 메시지 */}
          {analysis.insights.map((insight, idx) => {
            const severityStyles = {
              success: 'bg-green-50 border-green-200 text-green-900',
              info: 'bg-blue-50 border-blue-200 text-blue-900',
              warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
              error: 'bg-red-50 border-red-200 text-red-900'
            };
            
            return (
              <div key={idx} className={`p-3 rounded-lg border ${severityStyles[insight.severity]}`}>
                <p className="text-sm font-medium">{insight.message}</p>
                {insight.actionable && (
                  <div className="flex items-start gap-2 mt-2">
                    <Lightbulb className="h-4 w-4 shrink-0 mt-0.5" />
                    <p className="text-xs">{insight.actionable}</p>
                  </div>
                )}
              </div>
            );
          })}
          
          {/* 비교 상세 정보 */}
          {analysis.comparison && (analysis.comparison.topImprovement || analysis.comparison.topRegression) && (
            <div className="grid sm:grid-cols-2 gap-3 mt-3">
              {analysis.comparison.topImprovement && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <p className="text-xs font-medium text-green-900">가장 개선된 지표</p>
                  </div>
                  <p className="text-sm text-green-800">
                    {analysis.comparison.topImprovement.metricName}
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    +{analysis.comparison.topImprovement.delta.toFixed(1)}점 ({analysis.comparison.topImprovement.percentChange > 0 ? '+' : ''}{analysis.comparison.topImprovement.percentChange.toFixed(1)}%)
                  </p>
                </div>
              )}
              
              {analysis.comparison.topRegression && (
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingDown className="h-4 w-4 text-orange-600" />
                    <p className="text-xs font-medium text-orange-900">주의 필요 지표</p>
                  </div>
                  <p className="text-sm text-orange-800">
                    {analysis.comparison.topRegression.metricName}
                  </p>
                  <p className="text-xs text-orange-700 mt-1">
                    {analysis.comparison.topRegression.delta.toFixed(1)}점 ({analysis.comparison.topRegression.percentChange.toFixed(1)}%)
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 종합 평가 해석 */}
      <Card className="border-blue-100 bg-white shadow-sm">
        <CardHeader className="pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg text-gray-900">종합 평가 해석</CardTitle>
              <UITooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Retrieval과 Generation 단계를 분리하여 분석합니다</p>
                </TooltipContent>
              </UITooltip>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <UITooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 cursor-help">
                    <div className={`h-3 w-3 rounded-full ${gradeColorMap[analysis.breakdown.retrieval.grade].bg}`}></div>
                    <span className="text-gray-600">Retrieval: {analysis.breakdown.retrieval.avgScore.toFixed(0)}점</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">검색 품질 - 관련 문서를 찾는 능력</p>
                </TooltipContent>
              </UITooltip>
              <UITooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 cursor-help">
                    <div className={`h-3 w-3 rounded-full ${gradeColorMap[analysis.breakdown.generation.grade].bg}`}></div>
                    <span className="text-gray-600">Generation: {analysis.breakdown.generation.avgScore.toFixed(0)}점</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">생성 품질 - 답변을 만드는 능력</p>
                </TooltipContent>
              </UITooltip>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div>
            <h3 className="mb-2 text-base text-gray-900">종합 분석</h3>
            <p className="text-gray-700 leading-relaxed text-sm">
              {grade.recommendation} 
              {analysis.breakdown.retrieval.avgScore < analysis.breakdown.generation.avgScore 
                ? ' 검색 단계 개선이 우선순위입니다.' 
                : ' 생성 단계 최적화에 집중하세요.'}
            </p>
          </div>

          {/* 검색 품질 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-cyan-100 flex items-center justify-center">
                <Search className="h-4 w-4 text-cyan-600" />
              </div>
              <h3 className="text-base text-gray-900">검색 품질 (Retrieval)</h3>
            </div>
            
            <div className="grid gap-3 mb-3 sm:grid-cols-3">
              <div className="p-3 rounded-lg border border-cyan-200 bg-cyan-50">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-cyan-900 text-sm font-medium">Context Precision</p>
                  {renderSamplingBadge('context_precision')}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-cyan-600 text-2xl font-semibold">
                    {(retrievalScores.context_precision * 100).toFixed(0)}
                  </div>
                  <span className="text-cyan-700 text-sm">점</span>
                </div>
                <div className="h-2 bg-cyan-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyan-500 rounded-full transition-all"
                    style={{ width: `${retrievalScores.context_precision * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="p-3 rounded-lg border border-teal-200 bg-teal-50">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-teal-900 text-sm font-medium">Context Recall</p>
                  {renderSamplingBadge('context_recall')}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-teal-600 text-2xl font-semibold">
                    {(retrievalScores.context_recall * 100).toFixed(0)}
                  </div>
                  <span className="text-teal-700 text-sm">점</span>
                </div>
                <div className="h-2 bg-teal-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-teal-500 rounded-full transition-all"
                    style={{ width: `${retrievalScores.context_recall * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="p-3 rounded-lg border border-sky-200 bg-sky-50">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sky-900 text-sm font-medium">Context Entity Recall</p>
                  {renderSamplingBadge('context_entity_recall')}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-sky-600 text-2xl font-semibold">
                    {(retrievalScores.context_entity_recall * 100).toFixed(0)}
                  </div>
                  <span className="text-sky-700 text-sm">점</span>
                </div>
                <div className="h-2 bg-sky-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-sky-500 rounded-full transition-all"
                    style={{ width: `${retrievalScores.context_entity_recall * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <p className="text-gray-700 leading-relaxed text-sm">
              질문에 대해 정확하고 포괄적인 문서를 찾아내는 능력이 뛰어납니다. 
              필요한 정보를 거의 누락 없이 검색하고 있으며, 관련 엔티티 추출도 우수합니다.
            </p>
          </div>

          {/* 생성 품질 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-purple-600" />
              </div>
              <h3 className="text-base text-gray-900">생성 품질 (Generation)</h3>
            </div>
            
            <div className="grid gap-3 mb-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="p-3 rounded-lg border border-purple-200 bg-purple-50">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-purple-900 text-sm font-medium">Faithfulness</p>
                  {renderSamplingBadge('faithfulness')}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-purple-600 text-2xl font-semibold">
                    {(generationScores.faithfulness * 100).toFixed(0)}
                  </div>
                  <span className="text-purple-700 text-sm">점</span>
                </div>
                <div className="h-2 bg-purple-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 rounded-full transition-all"
                    style={{ width: `${generationScores.faithfulness * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="p-3 rounded-lg border border-pink-200 bg-pink-50">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-pink-900 text-sm font-medium">Answer Correctness</p>
                  {renderSamplingBadge('answer_correctness')}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-pink-600 text-2xl font-semibold">
                    {(generationScores.answer_correctness * 100).toFixed(0)}
                  </div>
                  <span className="text-pink-700 text-sm">점</span>
                </div>
                <div className="h-2 bg-pink-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-pink-500 rounded-full transition-all"
                    style={{ width: `${generationScores.answer_correctness * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="p-3 rounded-lg border border-indigo-200 bg-indigo-50">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-indigo-900 text-sm font-medium">Answer Relevancy</p>
                  {renderSamplingBadge('answer_relevancy')}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-indigo-600 text-2xl font-semibold">
                    {(generationScores.answer_relevancy * 100).toFixed(0)}
                  </div>
                  <span className="text-indigo-700 text-sm">점</span>
                </div>
                <div className="h-2 bg-indigo-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full transition-all"
                    style={{ width: `${generationScores.answer_relevancy * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="p-3 rounded-lg border border-fuchsia-200 bg-fuchsia-50">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-fuchsia-900 text-sm font-medium">Conciseness</p>
                  {renderSamplingBadge('conciseness')}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-fuchsia-600 text-2xl font-semibold">
                    {(generationScores.conciseness * 100).toFixed(0)}
                  </div>
                  <span className="text-fuchsia-700 text-sm">점</span>
                </div>
                <div className="h-2 bg-fuchsia-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-fuchsia-500 rounded-full transition-all"
                    style={{ width: `${generationScores.conciseness * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <p className="text-gray-700 leading-relaxed text-sm">
              검색된 문서를 기반으로 사실에 입각하여 질문 의도에 맞는 답변을 생성하는 능력이 우수합니다. 
              답변의 정확성과 관련성이 높으나, 간결성 측면에서 불필요한 정보가 포함되는 경향이 있습니다.
            </p>
          </div>

          <div>
            <h3 className="mb-2 text-base text-gray-900">안전성 및 유창성</h3>
            <p className="text-gray-700 leading-relaxed text-sm">
              답변의 유해성, 논리적 일관성, 문법적 정확성 모두 우수한 수준을 유지하고 있습니다. 
              특별한 안전성 문제는 발견되지 않았습니다.
            </p>
          </div>

          <div>
            <h3 className="mb-2 text-base text-gray-900">결론</h3>
            <p className="text-gray-700 leading-relaxed text-sm">
              현재 모델은 프로덕션 환경에 배포 가능한 수준의 성능을 보이고 있습니다. 
              향후 개선을 위한 핵심 과제는 답변의 간결성을 높이고, 불필요한 정보를 제거하는 것입니다. 
              또한 특정 도메인 지식이 필요한 질문에 대한 정확도를 더욱 향상시킬 필요가 있습니다.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 핵심 지표 카드 (축소 & 간소화) */}
      <div className="grid gap-3 md:grid-cols-3">
        <Card className="relative overflow-hidden border-blue-100 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-700 text-sm">종합 점수</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex items-center gap-3">
              <div className="text-blue-600 text-3xl font-semibold">
                {avgScore.toFixed(1)}
              </div>
              <p className="text-gray-600 text-xs">
                {Object.keys(latestEvaluation.scores).length}개 지표 평균
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-blue-100 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-700 text-sm">평균 지연 시간</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex items-center gap-3">
              <div className="text-purple-600 text-3xl font-semibold">{avgLatency}s</div>
              <p className="text-gray-600 text-xs">답변 생성</p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-blue-100 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-700 text-sm">평가 완료</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              <p className="text-gray-900 text-sm">
                {new Date(latestEvaluation.completedAt || latestEvaluation.startedAt).toLocaleDateString('ko-KR')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 선택된 지표 상세 분석 */}
      <Tabs defaultValue="radar" className="space-y-3">
        <TabsList>
          <TabsTrigger value="radar">레이더 차트</TabsTrigger>
          <TabsTrigger value="bar">막대 그래프</TabsTrigger>
          <TabsTrigger value="cards">개별 지표</TabsTrigger>
        </TabsList>

        <TabsContent value="radar">
          <Card className="border-blue-100 bg-white shadow-sm">
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-lg text-gray-900">성능 레이더 차트</CardTitle>
              <CardDescription className="text-sm text-gray-600">각 평가 지표의 점수를 시각화</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgb(156, 163, 175)" strokeOpacity={0.2} />
                    <PolarAngleAxis 
                      dataKey="metric" 
                      tick={{ fill: 'rgb(55, 65, 81)', fontSize: 12 }}
                    />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 100]} 
                      tick={{ fill: 'rgb(107, 114, 128)' }}
                    />
                    <Radar 
                      name="점수" 
                      dataKey="score" 
                      stroke="rgb(37, 99, 235)" 
                      fill="rgb(37, 99, 235)" 
                      fillOpacity={0.5}
                      strokeWidth={2}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid rgb(229, 231, 235)',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bar">
          <Card className="border-blue-100 bg-white shadow-sm">
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-lg text-gray-900">지표별 점수 비교</CardTitle>
              <CardDescription className="text-sm text-gray-600">각 평가 지표의 점수를 막대 그래프로 비교</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={barData}>
                    <defs>
                      <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="rgb(37, 99, 235)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="rgb(37, 99, 235)" stopOpacity={0.3}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgb(209, 213, 219)" opacity={0.5} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: 'rgb(107, 114, 128)', fontSize: 11 }}
                      angle={-15}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      tick={{ fill: 'rgb(107, 114, 128)' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid rgb(229, 231, 235)',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="점수" 
                      fill="url(#colorBar)"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cards">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(latestEvaluation.scores).map(([metricId, score]) => {
              const metric = mockMetrics.find(m => m.id === metricId);
              const badge = getScoreBadge(score * 100);
              const Icon = badge.icon;
              const scoreValue = score * 100;
              
              const getColorClasses = (score: number) => {
                if (score >= 90) return {
                  border: 'border-green-200',
                  bg: 'bg-green-50',
                  text: 'text-green-900',
                  desc: 'text-green-700',
                  number: 'text-green-600',
                  progress: 'bg-green-500',
                  progressBg: 'bg-green-200'
                };
                if (score >= 70) return {
                  border: 'border-blue-200',
                  bg: 'bg-blue-50',
                  text: 'text-blue-900',
                  desc: 'text-blue-700',
                  number: 'text-blue-600',
                  progress: 'bg-blue-500',
                  progressBg: 'bg-blue-200'
                };
                return {
                  border: 'border-yellow-200',
                  bg: 'bg-yellow-50',
                  text: 'text-yellow-900',
                  desc: 'text-yellow-700',
                  number: 'text-yellow-600',
                  progress: 'bg-yellow-500',
                  progressBg: 'bg-yellow-200'
                };
              };
              
              const colors = getColorClasses(scoreValue);
              
              return (
                <Card key={metricId} className={`${colors.border} ${colors.bg} shadow-sm`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className={`${colors.text} text-base truncate`}>
                        {metric?.name || metricId}
                      </CardTitle>
                      <div className="flex items-center gap-2 shrink-0">
                        {renderSamplingBadge(metricId)}
                        <Badge variant={badge.variant} className="gap-1 text-xs">
                          <Icon className="h-3 w-3" />
                          {badge.label}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription className={`${colors.desc} text-xs`}>{metric?.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className={`text-3xl mb-2 ${colors.number} font-semibold`}>
                      {scoreValue.toFixed(1)}
                    </div>
                    <div className={`h-2 ${colors.progressBg} rounded-full overflow-hidden`}>
                      <div 
                        className={`h-full ${colors.progress} rounded-full transition-all`}
                        style={{ width: `${scoreValue}%` }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* 진단 요약 */}
      {latestEvaluation.failedCases && latestEvaluation.failedCases.length > 0 && (
        <DiagnosisSummaryCard summary={latestEvaluation.diagnosisSummary} />
      )}

      {/* 오류 분석 - Phase 3 예정 */}
      {latestEvaluation.failedCases && latestEvaluation.failedCases.length > 0 && (
        <Card className="border-gray-200 bg-gray-50/50 shadow-sm relative overflow-hidden">
          {/* Phase 3 오버레이 */}
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
            <div className="text-center p-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-100 border-2 border-blue-300 mb-3">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-900">Phase 3에서 제공 예정</span>
              </div>
              <p className="text-sm text-gray-600 max-w-md">
                LLM Judge 기반 근본 원인 분석 및 자동 개선 제안 기능은<br />
                Phase 3: Auto-Improve 단계에서 구현됩니다.
              </p>
            </div>
          </div>
          
          <CardHeader className="pb-3 border-b border-gray-100 opacity-40">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-orange-900 text-lg">오류 분석 (Failure Analysis)</CardTitle>
                  <CardDescription className="text-orange-700 text-sm">
                    낮은 점수를 받은 케이스 분석 ({filteredFailedCases.length}/{latestEvaluation.failedCases.length}건)
                  </CardDescription>
                </div>
              </div>
              <Badge className="border-orange-300 text-orange-700 text-xs bg-orange-50 border">
                {latestEvaluation.failedCases.length}건 발견
              </Badge>
            </div>

            {/* 검색 및 필터 */}
            <div className="flex gap-3 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="질문, 답변 검색..."
                  value={failedCaseSearch}
                  onChange={(e) => setFailedCaseSearch(e.target.value)}
                  className="pl-9 h-9 text-sm border-gray-300"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select value={rootCauseFilter} onValueChange={(value) => setRootCauseFilter(value as any)}>
                  <SelectTrigger className="w-40 h-9 text-sm border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 원인</SelectItem>
                    <SelectItem value="retrieval">Retrieval</SelectItem>
                    <SelectItem value="generation">Generation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 opacity-40">
            {filteredFailedCases.length === 0 ? (
              <div className="text-center text-gray-500 py-8 text-sm">
                <Search className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>검색 결과가 없습니다</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFailedCases.map((failedCase, index) => (
                  <div 
                    key={failedCase.id} 
                    className="p-4 rounded-lg border border-orange-200 bg-orange-50 hover:shadow-md transition-shadow"
                  >
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                      <span className="text-orange-700 text-sm font-medium">{index + 1}</span>
                    </div>
                    
                    <div className="flex-1 space-y-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <MessageSquare className="h-4 w-4 text-gray-600" />
                          <span className="text-gray-600 text-sm font-medium">질문</span>
                        </div>
                        <p className="text-gray-900 text-sm">{failedCase.question}</p>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-green-900 text-sm font-medium">정답 (Ground Truth)</span>
                          </div>
                          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-green-900 leading-relaxed break-words text-sm">
                              {failedCase.expectedAnswer}
                            </p>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <XCircle className="h-4 w-4 text-red-600" />
                            <span className="text-red-900 text-sm font-medium">생성된 답변</span>
                          </div>
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-900 leading-relaxed break-words text-sm">
                              {failedCase.generatedAnswer}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-600" />
                          <Badge variant="destructive" className="gap-1.5 text-xs">
                            <span>주요 실패 지표:</span>
                            <span>{failedCase.reason}</span>
                          </Badge>
                        </div>
                        
                        {/* 1단계: 예상 실패 원인 표시 */}
                        {failedCase.rootCause && (
                          <Badge 
                            className={`gap-1.5 text-xs border ${failedCase.rootCause === 'generation' ? 'bg-orange-50 border-orange-300 text-orange-700' : 'bg-purple-50 border-purple-300 text-purple-700'}`}
                          >
                            <span>예상 실패 원인:</span>
                            <span>{failedCase.rootCause === 'generation' ? '생성 오류' : '검색 오류'}</span>
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 2단계: 개선 제안 및 실험 섹션 - Phase 3 예정 */}
      {latestEvaluation.failedCases && latestEvaluation.failedCases.length > 0 && (
        <Card className="border-gray-200 bg-gray-50/50 shadow-sm relative overflow-hidden">
          {/* Phase 3 오버레이 */}
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
            <div className="text-center p-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-100 border-2 border-blue-300 mb-3">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-900">Phase 3에서 제공 예정</span>
              </div>
              <p className="text-sm text-gray-600 max-w-md">
                AI 기반 파라미터 최적화 및 자동 재평가 기능은<br />
                Phase 3: Auto-Improve 단계에서 구현됩니다.
              </p>
            </div>
          </div>
          
          <CardHeader className="pb-3 border-b border-gray-100 opacity-40">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Lightbulb className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-blue-900 text-lg">개선 제안 및 실험</CardTitle>
                <CardDescription className="text-blue-700 text-sm">
                  분석된 원인을 기반으로 한 구체적인 개선 방안
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 opacity-40">
            <div className="grid md:grid-cols-2 gap-4">
              {/* 검색 오류 개선 제안 */}
              {latestEvaluation.failedCases.some(fc => fc.rootCause === 'retrieval') && (
                <div className="p-4 rounded-lg border border-purple-200 bg-purple-50/30">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                      <Search className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <h4 className="text-purple-900 font-medium text-sm mb-1">검색 성능 개선</h4>
                        <p className="text-purple-700 text-xs leading-relaxed">
                          Context Recall 및 Precision 점수가 낮습니다. 문서 청크 크기를 조정하거나 임베딩 모델을 변경하여 검색 정확도를 향상시킬 수 있습니다.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-purple-700">
                          <Settings className="h-3.5 w-3.5" />
                          <span className="font-medium">제안 변경:</span>
                        </div>
                        <ul className="space-y-1 text-xs text-purple-700 ml-5">
                          <li>• Chunk Size: 512 → 256</li>
                          <li>• Embedding Model: text-embedding-ada-002 → text-embedding-3-large</li>
                          <li>• Top-K: 5 → 10</li>
                        </ul>
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs"
                        onClick={() => {
                          // TODO: 설정을 적용하고 평가 화면으로 이동
                          alert('검색 개선 설정이 적용되었습니다. 평가 설정 화면으로 이동합니다.');
                        }}
                      >
                        이 설정으로 재평가하기
                        <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* 생성 오류 개선 제안 */}
              {latestEvaluation.failedCases.some(fc => fc.rootCause === 'generation') && (
                <div className="p-4 rounded-lg border border-orange-200 bg-orange-50/30">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                      <Zap className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <h4 className="text-orange-900 font-medium text-sm mb-1">생성 품질 개선</h4>
                        <p className="text-orange-700 text-xs leading-relaxed">
                          Faithfulness 및 Answer Relevancy 점수가 낮습니다. 시스템 프롬프트를 수정하거나 LLM 파라미터를 조정하여 답변 품질을 향상시킬 수 있습니다.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-orange-700">
                          <Settings className="h-3.5 w-3.5" />
                          <span className="font-medium">제안 변경:</span>
                        </div>
                        <ul className="space-y-1 text-xs text-orange-700 ml-5">
                          <li>• LLM Temperature: 0.7 → 0.3</li>
                          <li>• System Prompt: "검색된 문서에만 기반하여 답변"으로 수정</li>
                          <li>• Max Tokens: 512 → 256</li>
                        </ul>
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white text-xs"
                        onClick={() => {
                          // TODO: 설정을 적용하고 평가 화면으로 이동
                          alert('생성 개선 설정이 적용되었습니다. 평가 설정 화면으로 이동합니다.');
                        }}
                      >
                        이 설정으로 재평가하기
                        <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </TooltipProvider>
  );
}
