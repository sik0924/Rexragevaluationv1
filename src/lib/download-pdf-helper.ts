/**
 * PDF 다운로드 헬퍼 함수
 */

import { calculateWeightedScore, getScoreGrade, analyzeEvaluation } from './score-analysis';
import { generatePDFTemplate } from './pdf-template';

export function downloadPDFReport(evaluation: any, previousEvaluation?: any) {
  // v3.0 가중치 기반 세련된 PDF 리포트 생성
  const weightedResult = calculateWeightedScore(evaluation.scores);
  const avgScore = weightedResult.overallScore;
  const gradeInfo = getScoreGrade(avgScore, evaluation.scores);
  const analysis = analyzeEvaluation(evaluation, previousEvaluation);
  
  // 새로운 디자인 템플릿 사용
  const htmlContent = generatePDFTemplate(evaluation, weightedResult, gradeInfo, analysis);
  
  // PDF 다운로드
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `REX_Report_${evaluation.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`;
  link.click();
}
