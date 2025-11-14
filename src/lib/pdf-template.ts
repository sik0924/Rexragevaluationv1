/**
 * REX PDF 리포트 템플릿 생성기
 * 벤치마킹 디자인을 반영한 세련된 PDF 리포트 HTML
 */

import { getMetricTier, METRIC_LABELS } from './metric-weights';

export function generatePDFTemplate(evaluation: any, weightedResult: any, gradeInfo: any, analysis: any): string {
  // 점수 계산
  const avgScore = weightedResult.overallScore;
  
  const retrievalScore = [
    evaluation.scores.context_precision,
    evaluation.scores.context_recall,
    evaluation.scores.context_entity_recall
  ].filter(Boolean).reduce((a: number, b: number) => a + b, 0) / 
  [evaluation.scores.context_precision, evaluation.scores.context_recall, evaluation.scores.context_entity_recall]
  .filter(Boolean).length * 100;

  const generationScore = [
    evaluation.scores.faithfulness,
    evaluation.scores.answer_correctness,
    evaluation.scores.answer_relevancy,
    evaluation.scores.answer_similarity
  ].filter(Boolean).reduce((a: number, b: number) => a + b, 0) /
  [evaluation.scores.faithfulness, evaluation.scores.answer_correctness, evaluation.scores.answer_relevancy, evaluation.scores.answer_similarity]
  .filter(Boolean).length * 100;

  // 실패 케이스 통계
  const failedCases = evaluation.failedCases || [];
  const diagnosisSummary = evaluation.diagnosisSummary || {};
  const totalFailed = diagnosisSummary.total_failed || failedCases.length || 0;
  const llmJudgeAnalyzed = diagnosisSummary.llm_judge_analyzed || failedCases.length || 0;
  const samplingRatio = totalFailed > 0 ? ((llmJudgeAnalyzed / totalFailed) * 100).toFixed(1) : '0.0';
  
  // 평가 지표를 점수별로 정렬
  const sortedMetrics = Object.entries(evaluation.scores)
    .map(([id, score]) => ({
      id,
      name: METRIC_LABELS[id] || id,
      score: (score as number) * 100,
      tier: getMetricTier(id)
    }))
    .sort((a, b) => b.score - a.score);
  
  // 점수에 따른 바 색상
  const getBarGradient = (score: number) => {
    if (score >= 90) return 'metric-bar-gradient-excellent';
    if (score >= 80) return 'metric-bar-gradient-good';
    if (score >= 70) return 'metric-bar-gradient-fair';
    return 'metric-bar-gradient-poor';
  };
  
  // 점수에 따른 등급 레이블
  const getGradeLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Fair';
    if (score >= 60) return 'Poor';
    return 'Critical';
  };
  
  // 별점 생성
  const stars = Math.round(avgScore / 20);
  const starHtml = '★'.repeat(stars) + '☆'.repeat(5 - stars);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${evaluation.name} - RAG 평가 결과 리포트</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
          background: #f8fafc;
          color: #1f2937;
          line-height: 1.6;
        }
        .container {
          max-width: 900px;
          margin: 0 auto;
          background: white;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }
        
        /* Header */
        .header {
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
          color: white;
          padding: 48px 48px 40px 48px;
          position: relative;
          overflow: hidden;
        }
        .header::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 400px;
          height: 400px;
          background: rgba(255,255,255,0.05);
          border-radius: 50%;
          transform: translate(30%, -30%);
        }
        .logo {
          font-size: 32px;
          font-weight: 900;
          letter-spacing: 0.15em;
          margin-bottom: 4px;
          position: relative;
          z-index: 1;
        }
        .logo-sub {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.3em;
          opacity: 0.9;
          text-transform: uppercase;
        }
        .divider {
          height: 1px;
          background: rgba(255,255,255,0.2);
          margin: 28px 0;
        }
        .report-title {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 16px;
          letter-spacing: -0.02em;
          position: relative;
          z-index: 1;
        }
        .header-meta {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          font-size: 13px;
          opacity: 0.95;
          position: relative;
          z-index: 1;
          margin-top: 20px;
        }
        .header-meta-item {
          display: flex;
          align-items: baseline;
          gap: 8px;
        }
        .header-meta-label {
          opacity: 0.8;
          font-weight: 500;
          min-width: 70px;
        }
        .header-meta-value {
          font-weight: 600;
        }
        
        /* Content */
        .content {
          padding: 48px;
        }
        .section {
          margin-bottom: 48px;
        }
        .section-title {
          font-size: 20px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          letter-spacing: -0.01em;
        }
        .section-title::before {
          content: '';
          width: 4px;
          height: 24px;
          background: #1e40af;
          margin-right: 12px;
          border-radius: 2px;
        }
        .section-subtitle {
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
          margin: 32px 0 16px 0;
        }
        
        /* Info Grid */
        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          padding: 24px;
          background: #f9fafb;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }
        .info-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .info-label {
          font-size: 11px;
          color: #6b7280;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .info-value {
          font-size: 14px;
          font-weight: 500;
          color: #111827;
        }
        
        /* Score Section */
        .score-hero {
          background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%);
          padding: 48px;
          border-radius: 12px;
          border: 1px solid #c7d2fe;
          text-align: center;
          margin: 32px 0;
        }
        .score-value {
          font-size: 96px;
          font-weight: 900;
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.05em;
          line-height: 1;
        }
        .score-label {
          font-size: 24px;
          color: #1e40af;
          margin-top: 16px;
          font-weight: 700;
        }
        .score-stars {
          font-size: 32px;
          margin-top: 16px;
          letter-spacing: 4px;
          color: #fbbf24;
        }
        .score-meta {
          margin-top: 24px;
          font-size: 13px;
          color: #6b7280;
        }
        .score-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-top: 32px;
        }
        .score-card {
          background: white;
          padding: 24px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          text-align: center;
        }
        .score-card-value {
          font-size: 36px;
          font-weight: 700;
          color: #1e40af;
          letter-spacing: -0.02em;
        }
        .score-card-label {
          font-size: 11px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
          margin-top: 8px;
        }
        
        /* Metric Bars */
        .metrics-visual {
          display: grid;
          gap: 16px;
          margin: 24px 0;
        }
        .metric-bar-item {
          background: white;
          padding: 20px 24px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }
        .metric-bar-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 12px;
        }
        .metric-name {
          font-size: 14px;
          font-weight: 600;
          color: #111827;
        }
        .metric-tier {
          font-size: 10px;
          color: #6b7280;
          font-weight: 500;
          margin-left: 8px;
        }
        .metric-score {
          font-size: 24px;
          font-weight: 700;
          color: #1e40af;
          letter-spacing: -0.02em;
        }
        .metric-bar-container {
          position: relative;
          height: 28px;
          background: #e5e7eb;
          border-radius: 14px;
          overflow: hidden;
        }
        .metric-bar-fill {
          height: 100%;
          border-radius: 14px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 12px;
        }
        .metric-bar-gradient-excellent {
          background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
        }
        .metric-bar-gradient-good {
          background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);
        }
        .metric-bar-gradient-fair {
          background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%);
        }
        .metric-bar-gradient-poor {
          background: linear-gradient(90deg, #ef4444 0%, #f87171 100%);
        }
        .metric-grade {
          font-size: 11px;
          font-weight: 700;
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          text-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        
        /* Insights */
        .insight-box {
          background: #fffbeb;
          border-left: 4px solid #f59e0b;
          padding: 20px 24px;
          border-radius: 6px;
          margin: 16px 0;
        }
        .insight-title {
          font-weight: 600;
          color: #78350f;
          font-size: 14px;
          margin-bottom: 8px;
        }
        .insight-text {
          font-size: 13px;
          color: #6b7280;
          line-height: 1.6;
        }
        
        /* Recommendations */
        .recommendation-list {
          list-style: none;
          padding-left: 0;
          margin: 16px 0;
        }
        .recommendation-list li {
          padding: 12px 16px;
          margin: 8px 0;
          background: #f9fafb;
          border-left: 3px solid #3b82f6;
          border-radius: 4px;
          font-size: 14px;
          color: #374151;
        }
        .recommendation-list li::before {
          content: '✓';
          color: #3b82f6;
          font-weight: 700;
          margin-right: 12px;
        }
        
        /* Warning Box */
        .warning-box {
          background: #fef2f2;
          border-left: 4px solid #ef4444;
          padding: 20px 24px;
          border-radius: 6px;
          margin: 16px 0;
        }
        .warning-title {
          font-weight: 600;
          color: #991b1b;
          font-size: 14px;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        /* Footer */
        .footer {
          background: #f9fafb;
          padding: 32px 48px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
        }
        .footer-logo {
          font-size: 20px;
          font-weight: 800;
          color: #1e40af;
          letter-spacing: 0.1em;
          margin-bottom: 12px;
        }
        .footer-text {
          font-size: 12px;
          color: #6b7280;
          line-height: 1.8;
        }
        .footer-meta {
          font-size: 11px;
          color: #9ca3af;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #e5e7eb;
        }
        
        @media print {
          body { background: white; }
          .container { box-shadow: none; }
          .section { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <div class="logo">
            REX
            <div class="logo-sub">Performance Evaluation</div>
          </div>
          <div class="divider"></div>
          <div class="report-title">RAG 평가 결과 리포트</div>
          <div class="header-meta">
            <div class="header-meta-item">
              <span class="header-meta-label">평가명</span>
              <span class="header-meta-value">${evaluation.name}</span>
            </div>
            <div class="header-meta-item">
              <span class="header-meta-label">생성 일시</span>
              <span class="header-meta-value">${new Date().toLocaleString('ko-KR', { 
                year: 'numeric', month: 'long', day: 'numeric', 
                hour: '2-digit', minute: '2-digit' 
              })}</span>
            </div>
            ${evaluation.datasetName ? `
            <div class="header-meta-item">
              <span class="header-meta-label">데이터셋</span>
              <span class="header-meta-value">${evaluation.datasetName}</span>
            </div>
            ` : ''}
            <div class="header-meta-item">
              <span class="header-meta-label">평가 ID</span>
              <span class="header-meta-value">${evaluation.id}</span>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="content">
          <!-- 평가 개요 -->
          <div class="section">
            <h2 class="section-title">평가 개요</h2>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">평가 시작</div>
                <div class="info-value">${new Date(evaluation.startedAt).toLocaleString('ko-KR', {
                  month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                })}</div>
              </div>
              <div class="info-item">
                <div class="info-label">평가 완료</div>
                <div class="info-value">${new Date(evaluation.completedAt || evaluation.startedAt).toLocaleString('ko-KR', {
                  month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                })}</div>
              </div>
              <div class="info-item">
                <div class="info-label">소요 시간</div>
                <div class="info-value">${(() => {
                  const start = new Date(evaluation.startedAt).getTime();
                  const end = new Date(evaluation.completedAt || evaluation.startedAt).getTime();
                  const minutes = Math.round((end - start) / 1000 / 60);
                  return `${minutes}분`;
                })()}</div>
              </div>
              <div class="info-item">
                <div class="info-label">평가 지표 수</div>
                <div class="info-value">${Object.keys(evaluation.scores).length}개</div>
              </div>
            </div>
          </div>

          <!-- 데이터셋 & 시스템 정보 -->
          <div class="section">
            <h2 class="section-title">데이터셋 & 시스템 정보</h2>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">LLM 모델</div>
                <div class="info-value">${evaluation.modelName || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Vector DB</div>
                <div class="info-value">${evaluation.vectorDbName || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">설정 ID</div>
                <div class="info-value">${evaluation.configId || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">평가 모드</div>
                <div class="info-value">${evaluation.mode || 'Standard'}</div>
              </div>
            </div>
          </div>

          <!-- 종합 평가 점수 -->
          <div class="section">
            <h2 class="section-title">종합 평가 점수</h2>
            <div class="score-hero">
              <div class="score-value">${avgScore.toFixed(1)}</div>
              <div class="score-label">${gradeInfo.label}</div>
              <div class="score-stars">${starHtml}</div>
              <div class="score-meta">
                ${weightedResult.evaluatedMetrics}개 지표 평가 • 신뢰도: ${
                  weightedResult.reliability.level === 'high' ? '🟢 높음' :
                  weightedResult.reliability.level === 'medium' ? '🟡 중간' : '🔴 낮음'
                }
              </div>
              
              <div class="score-grid">
                <div class="score-card">
                  <div class="score-card-value">${retrievalScore.toFixed(1)}</div>
                  <div class="score-card-label">검색 성능</div>
                </div>
                <div class="score-card">
                  <div class="score-card-value">${generationScore.toFixed(1)}</div>
                  <div class="score-card-label">생성 성능</div>
                </div>
                <div class="score-card">
                  <div class="score-card-value">${weightedResult.tierBreakdown.critical.count + weightedResult.tierBreakdown.important.count}</div>
                  <div class="score-card-label">핵심 지표</div>
                </div>
              </div>
            </div>

            ${gradeInfo.warnings && gradeInfo.warnings.length > 0 ? `
            <div class="warning-box">
              <div class="warning-title">⚠️ 주의 필요한 지표</div>
              ${gradeInfo.warnings.map((w: string) => `<div class="insight-text">${w}</div>`).join('')}
            </div>
            ` : ''}

            ${analysis.insights.length > 0 ? `
            <div class="section-subtitle">주요 인사이트</div>
            ${analysis.insights.map((insight: any) => `
              <div class="insight-box">
                <div class="insight-title">${insight.message}</div>
                ${insight.actionable ? `<div class="insight-text">권장사항: ${insight.actionable}</div>` : ''}
              </div>
            `).join('')}
            ` : ''}
          </div>

          <!-- 상세 지표 분석 -->
          <div class="section">
            <h2 class="section-title">상세 지표 분석</h2>
            <div class="metrics-visual">
              ${sortedMetrics.map(metric => `
                <div class="metric-bar-item">
                  <div class="metric-bar-header">
                    <div>
                      <span class="metric-name">${metric.name}</span>
                      ${metric.tier ? `<span class="metric-tier">${
                        metric.tier.tier === 'critical' ? '🔴 핵심' :
                        metric.tier.tier === 'important' ? '🟠 중요' :
                        metric.tier.tier === 'supporting' ? '🔵 보조' : '⚪ 부가'
                      } (${metric.tier.weight}x)</span>` : ''}
                    </div>
                    <div class="metric-score">${metric.score.toFixed(1)}%</div>
                  </div>
                  <div class="metric-bar-container">
                    <div class="metric-bar-fill ${getBarGradient(metric.score)}" style="width: ${metric.score}%">
                      <div class="metric-grade">${getGradeLabel(metric.score)}</div>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- 요약 및 권장사항 -->
          <div class="section">
            <h2 class="section-title">요약 및 권장사항</h2>
            <div class="insight-box">
              <div class="insight-title">종합 평가</div>
              <div class="insight-text">${gradeInfo.description}</div>
            </div>
            
            <div class="section-subtitle">개선 권장사항</div>
            <ul class="recommendation-list">
              ${gradeInfo.recommendation ? `<li>${gradeInfo.recommendation}</li>` : ''}
              ${analysis.recommendations.slice(0, 3).map((rec: any) => 
                `<li>${rec.title}: ${rec.description}</li>`
              ).join('')}
              ${avgScore < 85 ? `
              <li>Failed Cases 분석을 통해 구체적인 개선점을 파악하세요.</li>
              <li>중요도가 높은 지표(핵심/중요)부터 우선적으로 개선하세요.</li>
              ` : ''}
            </ul>

            ${totalFailed > 0 ? `
            <div class="insight-box">
              <div class="insight-title">💡 LLM Judge 비용 최적화</div>
              <div class="insight-text">
                전체 ${totalFailed}개 실패 케이스 중 ${llmJudgeAnalyzed}개를 분석하여 
                ${samplingRatio}%의 샘플링 전략을 적용했습니다. 
                휴리스틱 필터링으로 비용을 절감하면서도 높은 정확도를 유지합니다.
              </div>
            </div>
            ` : ''}
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <div class="footer-logo">REX</div>
          <div class="footer-text">
            RAG Performance Evaluation Solution<br>
            본 리포트는 가중치 기반 RAG 평가 지표를 사용하여 자동 생성되었습니다.
          </div>
          <div class="footer-meta">
            Report ID: ${evaluation.id} | Generated on ${new Date().toLocaleString('ko-KR')}<br>
            © ${new Date().getFullYear()} REX. All rights reserved.
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
