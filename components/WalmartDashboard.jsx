// components/WalmartDashboard.jsx
// EXACT code from dashboard-NEON/frontend/index.html
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';

const API_BASE = 'https://tsf-demand-back.onrender.com';

// Styles injected at runtime
const cssText = `* { box-sizing: border-box; }
.wm-root { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; min-height: 100vh; }
.wm-root .header { background: #1a1a2e; color: white; padding: 20px 30px; margin-bottom: 20px; }
.wm-root .header h1 { margin: 0; font-size: 24px; }
.wm-root .header-sub { margin: 5px 0 0; font-size: 14px; color: #aaa; }
.wm-root .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
.wm-root .controls { display: flex; gap: 20px; align-items: flex-end; margin-bottom: 20px; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); flex-wrap: wrap; }
.wm-root .control-group { display: flex; flex-direction: column; gap: 6px; }
.wm-root .control-group label { font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase; }
.wm-root .control-group select { padding: 8px 12px; font-size: 14px; border: 1px solid #ddd; border-radius: 4px; min-width: 160px; }
.wm-root .card { background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 20px; overflow: hidden; }
.wm-root .card-header { padding: 16px 20px; border-bottom: 1px solid #eee; background: #fafafa; }
.wm-root .card-header h2 { margin: 0; font-size: 18px; font-weight: 600; }
.wm-root .card-header h3 { margin: 0; font-size: 14px; font-weight: 500; color: #666; }
.wm-root .card-body { padding: 20px; }
.wm-root .charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.wm-root table { width: 100% !important; border-collapse: collapse !important; }
.wm-root table th, .wm-root table td { padding: 10px 12px !important; border-bottom: 1px solid #f0f0f0 !important; font-size: 13px !important; text-align: center !important; vertical-align: middle !important; }
.wm-root table th { border-bottom: 2px solid #eee !important; font-size: 11px !important; font-weight: 600 !important; color: #666 !important; text-transform: uppercase !important; }
.wm-root table th.left, .wm-root table td.left { text-align: left !important; }
.wm-root table td.left { font-weight: 600 !important; }
.wm-root table tr.clickable { cursor: pointer !important; }
.wm-root table tr.clickable:hover { background: #f8f9fa !important; }
.wm-root table thead th[colspan] { border-bottom: 1px solid #ddd !important; }
.wm-root .loading { padding: 40px; text-align: center; color: #666; }
.wm-root .chart-title { margin: 0 0 10px; font-size: 14px; font-weight: 600; }
.wm-root .legend { display: flex; gap: 20px; justify-content: center; margin-top: 10px; font-size: 12px; }
.wm-root .legend-item { display: flex; align-items: center; gap: 6px; }
.wm-root .metric-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px; }
.wm-root .metric-card { background: #f8f9fa; padding: 15px; border-radius: 6px; text-align: center; }
.wm-root .metric-card.alert { background: #fff0f0; }
.wm-root .metric-card.warning { background: #fff8e6; }
.wm-root .metric-value { font-size: 24px; font-weight: 700; color: #1a1a2e; }
.wm-root .metric-label { font-size: 11px; color: #666; text-transform: uppercase; margin-top: 5px; }
.wm-root .break-high { color: #c00; font-weight: 700; }
.wm-root .break-med { color: #e65c00; font-weight: 600; }
.wm-root .break-low { color: #080; }
.wm-root .break-cell { font-variant-numeric: tabular-nums; }
.wm-root .consec { font-size: 10px; color: #666; display: block; }
.wm-root .sku-note { background: #fff3cd; padding: 10px 15px; border-radius: 6px; margin-bottom: 15px; font-size: 13px; color: #856404; }
.wm-root .download-btn { padding: 8px 16px; font-size: 14px; background-color: #1a1a2e; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600; }
.wm-root .download-btn:disabled { background-color: #666; cursor: not-allowed; }
.wm-root .download-btn:hover:not(:disabled) { background-color: #2a2a4e; }
.wm-root .legend-box { background: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 6px; padding: 12px 16px; margin-bottom: 15px; font-size: 12px; color: #555; }
.wm-root .legend-box strong { color: #1a1a2e; }
.wm-root .legend-box .stockout { color: #c00; font-weight: 600; }
.wm-root .legend-box .overstock { color: #e65c00; font-weight: 600; }`;

if (typeof document !== 'undefined' && !document.getElementById('wm-styles')) {
  const s = document.createElement('style'); s.id = 'wm-styles'; s.textContent = cssText; document.head.appendChild(s);
}

function loadJsPDF() {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.jspdf) { resolve(window.jspdf.jsPDF); return; }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = () => resolve(window.jspdf.jsPDF);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

    // =============================================================================
    // CHART COMPONENT
    // =============================================================================
    function useContainerWidth() {
      const ref = useRef(null);
      const [w, setW] = useState(0);
      useLayoutEffect(() => {
        if (!ref.current) return;
        const el = ref.current;
        const ro = new ResizeObserver(entries => {
          for (const e of entries) {
            const box = e.contentBoxSize ? (Array.isArray(e.contentBoxSize) ? e.contentBoxSize[0] : e.contentBoxSize) : null;
            const width = box ? box.inlineSize : el.clientWidth || 0;
            setW(width);
          }
        });
        ro.observe(el);
        setW(el.clientWidth || 0);
        return () => ro.disconnect();
      }, []);
      return [ref, w];
    }

    function ForecastChart({ data, title }) {
      const [wrapRef, W] = useContainerWidth();
      if (!data || !data.length) return <div ref={wrapRef} style={{ padding: 20, color: '#999' }}>No data</div>;

      const H = 280;
      const pad = { top: 30, right: 20, bottom: 60, left: 70 };
      const innerW = Math.max(1, W - pad.left - pad.right);
      const innerH = Math.max(1, H - pad.top - pad.bottom);

      const allVals = data.flatMap(d => [d.actual, d.forecast, d.ci85_low, d.ci85_high, d.ci95_low, d.ci95_high]).filter(v => v != null && isFinite(v));
      const yMin = allVals.length ? Math.min(...allVals) : 0;
      const yMax = allVals.length ? Math.max(...allVals) : 100;
      const yPad = (yMax - yMin) * 0.1 || 10;
      const Y0 = Math.max(0, yMin - yPad);
      const Y1 = yMax + yPad;

      const xScale = (i) => pad.left + (i / Math.max(1, data.length - 1)) * innerW;
      const yScale = (v) => pad.top + innerH * (1 - ((v - Y0) / Math.max(1e-9, Y1 - Y0)));
      const makePath = (pts) => pts.length ? pts.map((p, i) => (i ? 'L' : 'M') + xScale(p.i) + ' ' + yScale(p.y)).join(' ') : '';

      const actualPts = data.map((d, i) => d.actual != null ? { i, y: d.actual } : null).filter(Boolean);
      const forecastPts = data.map((d, i) => d.forecast != null ? { i, y: d.forecast } : null).filter(Boolean);
      const ci95LowPts = data.map((d, i) => d.ci95_low != null ? { i, y: d.ci95_low } : null).filter(Boolean);
      const ci95HighPts = data.map((d, i) => d.ci95_high != null ? { i, y: d.ci95_high } : null).filter(Boolean);
      const ci85LowPts = data.map((d, i) => d.ci85_low != null ? { i, y: d.ci85_low } : null).filter(Boolean);
      const ci85HighPts = data.map((d, i) => d.ci85_high != null ? { i, y: d.ci85_high } : null).filter(Boolean);

      let poly95 = '', poly85 = '';
      if (ci95LowPts.length && ci95HighPts.length) {
        poly95 = ci95HighPts.map(p => `${xScale(p.i)},${yScale(p.y)}`).join(' ') + ' ' + [...ci95LowPts].reverse().map(p => `${xScale(p.i)},${yScale(p.y)}`).join(' ');
      }
      if (ci85LowPts.length && ci85HighPts.length) {
        poly85 = ci85HighPts.map(p => `${xScale(p.i)},${yScale(p.y)}`).join(' ') + ' ' + [...ci85LowPts].reverse().map(p => `${xScale(p.i)},${yScale(p.y)}`).join(' ');
      }

      const yTicks = [0,1,2,3,4,5].map(i => Y0 + (Y1 - Y0) * (i / 5));
      const fmt = (n) => n >= 1000000 ? (n/1000000).toFixed(1)+'M' : n >= 1000 ? (n/1000).toFixed(1)+'K' : n.toFixed(0);

      return (
        <div ref={wrapRef} style={{ width: '100%' }}>
          <h4 className="chart-title">{title}</h4>
          <svg width={W} height={H} style={{ display: 'block' }}>
            {yTicks.map((v, i) => (
              <g key={i}>
                <line x1={pad.left} y1={yScale(v)} x2={W - pad.right} y2={yScale(v)} stroke="#eee" />
                <text x={pad.left - 8} y={yScale(v) + 4} fontSize={11} fill="#666" textAnchor="end">{fmt(v)}</text>
              </g>
            ))}
            <line x1={pad.left} y1={H - pad.bottom} x2={W - pad.right} y2={H - pad.bottom} stroke="#999" />
            <line x1={pad.left} y1={pad.top} x2={pad.left} y2={H - pad.bottom} stroke="#999" />
            {poly95 && <polygon points={poly95} fill="rgba(46, 204, 113, 0.25)" stroke="none" />}
            {poly85 && <polygon points={poly85} fill="rgba(46, 204, 113, 0.45)" stroke="none" />}
            <path d={makePath(forecastPts)} fill="none" stroke="#FFD700" strokeWidth={2.5} />
            <path d={makePath(actualPts)} fill="none" stroke="#000" strokeWidth={2} />
            {data.map((d, i) => {
              if (i % 7 !== 0 && i !== data.length - 1) return null;
              return (
                <g key={i} transform={`translate(${xScale(i)}, ${H - pad.bottom})`}>
                  <line x1={0} y1={0} x2={0} y2={5} stroke="#999" />
                  <text x={0} y={18} fontSize={10} fill="#666" textAnchor="middle" transform="rotate(45 0 18)">{d.date.slice(5)}</text>
                </g>
              );
            })}
          </svg>
          <div className="legend">
            <div className="legend-item"><svg width={30} height={10}><line x1={0} y1={5} x2={30} y2={5} stroke="#000" strokeWidth={2} /></svg><span>Actual</span></div>
            <div className="legend-item"><svg width={30} height={10}><line x1={0} y1={5} x2={30} y2={5} stroke="#FFD700" strokeWidth={2.5} /></svg><span>Forecast</span></div>
            <div className="legend-item"><svg width={30} height={10}><rect x={0} y={0} width={30} height={10} fill="rgba(46,204,113,0.45)" /></svg><span>85% CI</span></div>
            <div className="legend-item"><svg width={30} height={10}><rect x={0} y={0} width={30} height={10} fill="rgba(46,204,113,0.25)" /></svg><span>95% CI</span></div>
          </div>
        </div>
      );
    }

    // =============================================================================
    // HELPERS
    // =============================================================================
    const breakClass = (count, total) => {
      if (count === 0 || count === null || count === undefined) return { color: '#008800', weight: 400 };
      if (!total) total = 30;
      const pct = count / total;
      if (pct > 0.15 || count >= 5) return { color: '#cc0000', weight: 700 };
      if (pct > 0.05 || count >= 2) return { color: '#e65c00', weight: 600 };
      return { color: '#008800', weight: 400 };
    };

    const BreakCell = ({ count, consec, total }) => {
      const { color, weight } = breakClass(count, total);
      return (
        <td style={{ textAlign: 'center', padding: '10px 12px', borderBottom: '1px solid #f0f0f0', fontSize: '13px', color: color, fontWeight: weight, fontVariantNumeric: 'tabular-nums' }}>
          {count || 0}
          {consec > 1 && <span style={{ fontSize: '10px', color: '#666', display: 'block' }}>({consec} consec)</span>}
        </td>
      );
    };

    // =============================================================================
    // PDF GENERATION (CLIENT-SIDE)
    // =============================================================================
    function renderChartToCanvas(data, title, width = 500, height = 200) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      if (!data || !data.length) {
        ctx.fillStyle = '#999';
        ctx.font = '12px sans-serif';
        ctx.fillText('No data', 20, height/2);
        return canvas;
      }

      const pad = { top: 25, right: 15, bottom: 35, left: 55 };
      const innerW = width - pad.left - pad.right;
      const innerH = height - pad.top - pad.bottom;

      const allVals = data.flatMap(d => [d.actual, d.forecast, d.ci85_low, d.ci85_high, d.ci95_low, d.ci95_high]).filter(v => v != null && isFinite(v));
      const yMin = allVals.length ? Math.min(...allVals) : 0;
      const yMax = allVals.length ? Math.max(...allVals) : 100;
      const yPad = (yMax - yMin) * 0.1 || 10;
      const Y0 = Math.max(0, yMin - yPad);
      const Y1 = yMax + yPad;

      const xScale = (i) => pad.left + (i / Math.max(1, data.length - 1)) * innerW;
      const yScale = (v) => pad.top + innerH * (1 - ((v - Y0) / Math.max(1e-9, Y1 - Y0)));

      // Background
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, width, height);

      // Title
      ctx.fillStyle = '#000';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(title, pad.left, 15);

      // Grid
      ctx.strokeStyle = '#eee';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 5; i++) {
        const v = Y0 + (Y1 - Y0) * (i / 5);
        const y = yScale(v);
        ctx.beginPath();
        ctx.moveTo(pad.left, y);
        ctx.lineTo(width - pad.right, y);
        ctx.stroke();
        
        ctx.fillStyle = '#666';
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'right';
        const fmt = v >= 1000000 ? (v/1000000).toFixed(1)+'M' : v >= 1000 ? (v/1000).toFixed(1)+'K' : v.toFixed(0);
        ctx.fillText(fmt, pad.left - 5, y + 3);
      }

      // Axes
      ctx.strokeStyle = '#999';
      ctx.beginPath();
      ctx.moveTo(pad.left, height - pad.bottom);
      ctx.lineTo(width - pad.right, height - pad.bottom);
      ctx.moveTo(pad.left, pad.top);
      ctx.lineTo(pad.left, height - pad.bottom);
      ctx.stroke();

      // 95% CI band
      const ci95Points = data.map((d, i) => ({ i, low: d.ci95_low, high: d.ci95_high })).filter(p => p.low != null && p.high != null);
      if (ci95Points.length > 1) {
        ctx.fillStyle = 'rgba(46, 204, 113, 0.25)';
        ctx.beginPath();
        ctx.moveTo(xScale(ci95Points[0].i), yScale(ci95Points[0].high));
        ci95Points.forEach(p => ctx.lineTo(xScale(p.i), yScale(p.high)));
        [...ci95Points].reverse().forEach(p => ctx.lineTo(xScale(p.i), yScale(p.low)));
        ctx.closePath();
        ctx.fill();
      }

      // 85% CI band
      const ci85Points = data.map((d, i) => ({ i, low: d.ci85_low, high: d.ci85_high })).filter(p => p.low != null && p.high != null);
      if (ci85Points.length > 1) {
        ctx.fillStyle = 'rgba(46, 204, 113, 0.45)';
        ctx.beginPath();
        ctx.moveTo(xScale(ci85Points[0].i), yScale(ci85Points[0].high));
        ci85Points.forEach(p => ctx.lineTo(xScale(p.i), yScale(p.high)));
        [...ci85Points].reverse().forEach(p => ctx.lineTo(xScale(p.i), yScale(p.low)));
        ctx.closePath();
        ctx.fill();
      }

      // Forecast line
      const fcPoints = data.map((d, i) => ({ i, y: d.forecast })).filter(p => p.y != null);
      if (fcPoints.length > 1) {
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(xScale(fcPoints[0].i), yScale(fcPoints[0].y));
        fcPoints.forEach(p => ctx.lineTo(xScale(p.i), yScale(p.y)));
        ctx.stroke();
      }

      // Actual line
      const actPoints = data.map((d, i) => ({ i, y: d.actual })).filter(p => p.y != null);
      if (actPoints.length > 1) {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(xScale(actPoints[0].i), yScale(actPoints[0].y));
        actPoints.forEach(p => ctx.lineTo(xScale(p.i), yScale(p.y)));
        ctx.stroke();
      }

      // X-axis labels
      ctx.fillStyle = '#666';
      ctx.font = '8px sans-serif';
      ctx.textAlign = 'center';
      data.forEach((d, i) => {
        if (i % 7 === 0 || i === data.length - 1) {
          ctx.fillText(d.date.slice(5), xScale(i), height - pad.bottom + 12);
        }
      });

      return canvas;
    }

    async function generatePDFReport(week, forecastType, setProgress) {
      const jsPDF = await loadJsPDF(); const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 40;
      const contentW = pageW - 2 * margin;
      const windowDays = forecastType === 'monthly' ? 30 : 90;

      setProgress('Fetching geo levels...');

      // Get all geo IDs
      const statesRes = await fetch(`${API_BASE}/api/walmart/geo-ids?geo_level=state_id&forecast_type=${forecastType}`);
      const states = await statesRes.json();
      
      const storesRes = await fetch(`${API_BASE}/api/walmart/geo-ids?geo_level=location_id&forecast_type=${forecastType}`);
      const stores = await storesRes.json();

      // Cover page
      pdf.setFontSize(28);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Walmart Forecast Report', pageW / 2, 180, { align: 'center' });
      
      pdf.setFontSize(18);
      pdf.text('Band Break Analysis', pageW / 2, 220, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100);
      pdf.text('Actionable exceptions requiring attention today', pageW / 2, 250, { align: 'center' });
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 128, 100);
      pdf.text(`Data through: ${week}`, pageW / 2, 310, { align: 'center' });
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0);
      pdf.text(`Forecast Type: ${forecastType.charAt(0).toUpperCase() + forecastType.slice(1)}`, pageW / 2, 340, { align: 'center' });
      pdf.text(`Rolling ${windowDays}-Day Window`, pageW / 2, 360, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.setTextColor(100);
      pdf.text(`Report generated: ${new Date().toLocaleString()}`, pageW / 2, 420, { align: 'center' });

      // Executive Summary / How to Read This Report
      pdf.addPage();
      let ey = margin;
      
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('How to Read This Report', margin, ey);
      ey += 35;
      
      // What You're Looking At
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(26, 26, 46);
      pdf.text('What You\'re Looking At', margin, ey);
      ey += 20;
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(60, 60, 60);
      const lookingAt = [
        `• Data through: ${week}`,
        '• Forecasts generated daily at SKU level',
        `• ${windowDays}-day rolling window for band break analysis`,
      ];
      lookingAt.forEach(line => {
        pdf.text(line, margin + 10, ey);
        ey += 16;
      });
      ey += 15;
      
      // What Band Breaks Mean
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(26, 26, 46);
      pdf.text('What Band Breaks Mean', margin, ey);
      ey += 20;
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(60, 60, 60);
      const bandBreaks = [
        '• Band break = actual sales fell outside the statistical confidence interval',
        '• 85% CI: Expect ~15% of days to fall outside naturally. Breaks here = worth watching.',
        '• 95% CI: Expect ~5% of days outside. Breaks here = significant deviation.',
        '',
        '• UPPER break (Stockout Risk): Selling FASTER than forecast. Check inventory.',
        '• LOWER break (Overstock Risk): Selling SLOWER than forecast. Markdown risk.',
        '• Consecutive breaks: Sustained pattern, not noise. Escalate priority.',
      ];
      bandBreaks.forEach(line => {
        if (line.includes('UPPER')) pdf.setTextColor(200, 0, 0);
        else if (line.includes('LOWER')) pdf.setTextColor(230, 92, 0);
        else pdf.setTextColor(60, 60, 60);
        pdf.text(line, margin + 10, ey);
        ey += 16;
      });
      pdf.setTextColor(60, 60, 60);
      ey += 15;
      
      // Your Job Today
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(26, 26, 46);
      pdf.text('Your Job Today', margin, ey);
      ey += 20;
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(60, 60, 60);
      const yourJob = [
        '• Investigate items with breaks (especially consecutive)',
        '• Check inventory position for stockout risks',
        '• Flag overstock items for markdown/reallocation review',
        '• Assign actions and owners',
        '',
        'The math is done. The judgment is yours.',
      ];
      yourJob.forEach(line => {
        if (line.includes('math is done')) {
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(26, 26, 46);
        }
        pdf.text(line, margin + 10, ey);
        ey += 16;
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(60, 60, 60);
      });
      ey += 25;
      
      // Report Contents
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(26, 26, 46);
      pdf.text('Report Contents', margin, ey);
      ey += 20;
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(60, 60, 60);
      const contents = [
        '1. Executive Summary (All Locations) — Total portfolio view',
        `2. State Reports (${states.length} states) — Regional rollup`,
        `3. Store Reports (${stores.length} stores) — Location-level detail`,
        '   • Store CA_1 includes SKU-level alerts for items with breaks',
      ];
      contents.forEach(line => {
        pdf.text(line, margin + 10, ey);
        ey += 16;
      });

      // Helper to add a location section
      async function addLocationSection(geoLevel, geoId, sectionTitle, includeSKUs = false) {
        pdf.addPage();
        let y = margin;

        // Section header
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(sectionTitle, margin, y);
        y += 15;
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Rolling ${windowDays}-day window ending ${week}`, margin, y);
        y += 25;

        // Fetch chart data
        const [chartU, chartR] = await Promise.all([
          fetch(`${API_BASE}/api/walmart/chart/location?week=${week}&forecast_type=${forecastType}&type_id=U&geo_level=${geoLevel}&geo_id=${geoId}`).then(r => r.json()),
          fetch(`${API_BASE}/api/walmart/chart/location?week=${week}&forecast_type=${forecastType}&type_id=R&geo_level=${geoLevel}&geo_id=${geoId}`).then(r => r.json())
        ]);

        // Render charts
        const chartW = contentW;
        const chartH = 140;

        if (chartU && chartU.length) {
          const canvasU = renderChartToCanvas(chartU, 'Units Forecast vs Actual', chartW, chartH);
          const imgU = canvasU.toDataURL('image/png');
          pdf.addImage(imgU, 'PNG', margin, y, chartW, chartH);
          y += chartH + 10;
        }

        if (chartR && chartR.length) {
          const canvasR = renderChartToCanvas(chartR, 'Revenue Forecast vs Actual', chartW, chartH);
          const imgR = canvasR.toDataURL('image/png');
          pdf.addImage(imgR, 'PNG', margin, y, chartW, chartH);
          y += chartH + 15;
        }

        // Fetch band break data
        const [depts, cats] = await Promise.all([
          fetch(`${API_BASE}/api/walmart/departments?week=${week}&forecast_type=${forecastType}&geo_level=${geoLevel}&geo_id=${geoId}`).then(r => r.json()),
          fetch(`${API_BASE}/api/walmart/categories?week=${week}&forecast_type=${forecastType}&geo_level=${geoLevel}&geo_id=${geoId}`).then(r => r.json())
        ]);

        // Department table
        if (y > pageH - 200) { pdf.addPage(); y = margin; }
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Department Band Breaks', margin, y);
        y += 15;

        y = addBreakTable(pdf, depts, 'department_id', margin, y, contentW);

        // Category table  
        if (y > pageH - 200) { pdf.addPage(); y = margin; }
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Category Band Breaks', margin, y);
        y += 15;

        y = addBreakTable(pdf, cats, 'category_id', margin, y, contentW);

        // SKU table for CA_1 only
        if (includeSKUs) {
          // Get all categories and fetch SKUs for each
          const categories = [...new Set(cats.map(c => c.category_id))];
          
          for (const catId of categories) {
            const skuRes = await fetch(`${API_BASE}/api/walmart/skus?week=${week}&forecast_type=${forecastType}&category_id=${catId}&limit=100`);
            const skus = await skuRes.json();
            
            // Only include if there are SKUs with breaks
            const skusWithBreaks = skus.filter(s => 
              (s.units?.upper_85 || 0) + (s.units?.lower_85 || 0) + (s.revenue?.lower_85 || 0) > 0
            );
            
            if (skusWithBreaks.length > 0) {
              if (y > pageH - 150) { pdf.addPage(); y = margin; }
              
              pdf.setFontSize(11);
              pdf.setFont('helvetica', 'bold');
              pdf.text(`SKU Alerts: ${catId}`, margin, y);
              y += 12;
              
              y = addBreakTable(pdf, skusWithBreaks, 'sku_id', margin, y, contentW, true);
            }
          }
        }
      }

      function addBreakTable(pdf, data, idField, x, y, w, smallText = false) {
        if (!data || !data.length) {
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          pdf.text('No data available', x, y);
          return y + 15;
        }

        const colWidths = [w * 0.25, w * 0.125, w * 0.125, w * 0.125, w * 0.125, w * 0.125, w * 0.125];
        const rowH = smallText ? 14 : 16;
        const fontSize = smallText ? 7 : 8;
        
        // Header row 1
        pdf.setFillColor(255, 240, 240);
        pdf.rect(x + colWidths[0], y, colWidths[1] + colWidths[2], rowH, 'F');
        pdf.setFillColor(255, 248, 230);
        pdf.rect(x + colWidths[0] + colWidths[1] + colWidths[2], y, colWidths[3] + colWidths[4], rowH, 'F');
        pdf.setFillColor(240, 248, 255);
        pdf.rect(x + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], y, colWidths[5] + colWidths[6], rowH, 'F');
        
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0);
        pdf.text('Stockout Risk', x + colWidths[0] + (colWidths[1] + colWidths[2]) / 2, y + 10, { align: 'center' });
        pdf.text('Overstock Risk', x + colWidths[0] + colWidths[1] + colWidths[2] + (colWidths[3] + colWidths[4]) / 2, y + 10, { align: 'center' });
        pdf.text('Rev Shortfall', x + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + (colWidths[5] + colWidths[6]) / 2, y + 10, { align: 'center' });
        y += rowH;

        // Header row 2
        pdf.setFillColor(250, 250, 250);
        pdf.rect(x, y, w, rowH, 'F');
        
        const headers = ['Name', '85%', '95%', '85%', '95%', '85%', '95%'];
        let cx = x;
        headers.forEach((h, i) => {
          pdf.text(h, cx + colWidths[i] / 2, y + 10, { align: 'center' });
          cx += colWidths[i];
        });
        y += rowH;

        // Data rows
        pdf.setFont('helvetica', 'normal');
        data.forEach(row => {
          if (y > pageH - 50) {
            pdf.addPage();
            y = margin;
          }

          const u = row.units || {};
          const r = row.revenue || {};
          
          const fmt = (count, consec) => {
            if (!count) return '0';
            return consec > 1 ? `${count} (${consec})` : String(count);
          };

          const name = row[idField] || row.id;
          const vals = [
            name,
            fmt(u.upper_85, u.upper_85_consec),
            String(u.upper_95 || 0),
            fmt(u.lower_85, u.lower_85_consec),
            String(u.lower_95 || 0),
            fmt(r.lower_85, r.lower_85_consec),
            String(r.lower_95 || 0)
          ];

          cx = x;
          vals.forEach((v, i) => {
            // Color coding for breaks - both 85% and 95%
            if ((i === 1 || i === 2) && (i === 1 ? u.upper_85 : u.upper_95) > 0) pdf.setTextColor(200, 0, 0);
            else if ((i === 3 || i === 4) && (i === 3 ? u.lower_85 : u.lower_95) > 0) pdf.setTextColor(230, 92, 0);
            else if ((i === 5 || i === 6) && (i === 5 ? r.lower_85 : r.lower_95) > 0) pdf.setTextColor(200, 0, 0);
            else pdf.setTextColor(0);

            if (i === 0) {
              // Truncate long names
              const maxLen = smallText ? 18 : 20;
              const displayName = String(v).length > maxLen ? String(v).substring(0, maxLen) + '...' : String(v);
              pdf.text(displayName, cx + 3, y + 10);
            } else {
              pdf.text(v, cx + colWidths[i] / 2, y + 10, { align: 'center' });
            }
            cx += colWidths[i];
          });
          
          // Row border
          pdf.setDrawColor(220);
          pdf.line(x, y + rowH, x + w, y + rowH);
          y += rowH;
        });

        pdf.setTextColor(0);
        return y + 10;
      }

      // Generate sections
      const totalSections = 1 + states.length + stores.length;
      let sectionNum = 0;

      setProgress(`Generating All Locations (1/${totalSections})...`);
      await addLocationSection('all_locations', 'ALL', '1. Executive Summary - All Locations');
      sectionNum++;

      for (let i = 0; i < states.length; i++) {
        sectionNum++;
        setProgress(`Generating State ${states[i]} (${sectionNum}/${totalSections})...`);
        await addLocationSection('state_id', states[i], `2.${i + 1}. State: ${states[i]}`);
      }

      for (let i = 0; i < stores.length; i++) {
        sectionNum++;
        const isCA1 = stores[i] === 'CA_1';
        setProgress(`Generating Store ${stores[i]}${isCA1 ? ' + SKUs' : ''} (${sectionNum}/${totalSections})...`);
        await addLocationSection('location_id', stores[i], `3.${i + 1}. Store: ${stores[i]}`, isCA1);
      }

      setProgress('Saving PDF...');
      pdf.save(`walmart_report_${week}_${forecastType}.pdf`);
      setProgress(null);
    }

    // =============================================================================
    // LOCATION REPORT
    // =============================================================================
    function LocationReport({ week, forecastType, geoLevel, geoId, onSelectDepartment, onSelectCategory }) {
      const [loading, setLoading] = useState(true);
      const [departments, setDepartments] = useState([]);
      const [categories, setCategories] = useState([]);
      const [chartUnits, setChartUnits] = useState([]);
      const [chartRevenue, setChartRevenue] = useState([]);
      const [summary, setSummary] = useState({ units: {}, revenue: {} });

      useEffect(() => { loadData(); }, [week, forecastType, geoLevel, geoId]);

      async function loadData() {
        setLoading(true);
        try {
          const [deptRes, catRes, chartU, chartR, sumRes] = await Promise.all([
            fetch(`${API_BASE}/api/walmart/departments?week=${week}&forecast_type=${forecastType}&geo_level=${geoLevel}&geo_id=${geoId}`),
            fetch(`${API_BASE}/api/walmart/categories?week=${week}&forecast_type=${forecastType}&geo_level=${geoLevel}&geo_id=${geoId}`),
            fetch(`${API_BASE}/api/walmart/chart/location?week=${week}&forecast_type=${forecastType}&type_id=U&geo_level=${geoLevel}&geo_id=${geoId}`),
            fetch(`${API_BASE}/api/walmart/chart/location?week=${week}&forecast_type=${forecastType}&type_id=R&geo_level=${geoLevel}&geo_id=${geoId}`),
            fetch(`${API_BASE}/api/walmart/location-summary?week=${week}&forecast_type=${forecastType}&geo_level=${geoLevel}&geo_id=${geoId}`)
          ]);
          setDepartments(await deptRes.json());
          setCategories(await catRes.json());
          setChartUnits(await chartU.json());
          setChartRevenue(await chartR.json());
          setSummary(await sumRes.json());
        } catch (e) { console.error(e); }
        setLoading(false);
      }

      if (loading) return <div className="loading">Loading...</div>;

      const geoLabel = geoLevel === 'all_locations' ? 'All Locations' : geoLevel === 'state_id' ? `State: ${geoId}` : `Store: ${geoId}`;
      const u = summary.units || {};
      const r = summary.revenue || {};
      const windowDays = forecastType === 'monthly' ? 30 : 90;

      return (
        <div>
          <div className="card">
            <div className="card-header">
              <h2>{geoLabel} - Band Break Summary</h2>
              <h3>Data through: {week} • Rolling {windowDays}-day window • {u.total_days || 0} days analyzed</h3>
            </div>
            <div className="card-body">
              <div className="metric-grid">
                <div className={`metric-card ${u.upper_85 > 0 ? 'alert' : ''}`}>
                  <div className="metric-value">{u.upper_85 || 0}</div>
                  <div className="metric-label">Units Stockout Risk (Upper 85%)</div>
                  {u.upper_85_consec > 1 && <div style={{fontSize:11,color:'#c00'}}>{u.upper_85_consec} consecutive</div>}
                </div>
                <div className={`metric-card ${u.lower_85 > 0 ? 'warning' : ''}`}>
                  <div className="metric-value">{u.lower_85 || 0}</div>
                  <div className="metric-label">Units Overstock Risk (Lower 85%)</div>
                  {u.lower_85_consec > 1 && <div style={{fontSize:11,color:'#e65c00'}}>{u.lower_85_consec} consecutive</div>}
                </div>
                <div className={`metric-card ${r.lower_85 > 0 ? 'alert' : ''}`}>
                  <div className="metric-value">{r.lower_85 || 0}</div>
                  <div className="metric-label">Revenue Shortfall (Lower 85%)</div>
                  {r.lower_85_consec > 1 && <div style={{fontSize:11,color:'#c00'}}>{r.lower_85_consec} consecutive</div>}
                </div>
                <div className="metric-card">
                  <div className="metric-value">${((r.total||0)/1000000).toFixed(1)}M</div>
                  <div className="metric-label">Total Revenue</div>
                </div>
              </div>
              <div className="charts-row">
                <ForecastChart data={chartUnits} title="Units Forecast vs Actual" />
                <ForecastChart data={chartRevenue} title="Revenue Forecast vs Actual" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h2>Department Band Breaks</h2></div>
            <div className="card-body" style={{ padding: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                <thead>
                  <tr>
                    <th rowSpan={2} style={{ width: '20%', textAlign: 'left', padding: '10px 12px', backgroundColor: '#fafafa', borderBottom: '2px solid #eee', fontSize: '11px', fontWeight: 600, color: '#666', textTransform: 'uppercase' }}>Department</th>
                    <th colSpan={2} style={{ width: '26.6%', textAlign: 'center', padding: '10px 12px', borderBottom: '1px solid #ddd', backgroundColor: '#fff0f0', fontSize: '11px', fontWeight: 600, color: '#666', textTransform: 'uppercase' }}>Stockout Risk</th>
                    <th colSpan={2} style={{ width: '26.6%', textAlign: 'center', padding: '10px 12px', borderBottom: '1px solid #ddd', backgroundColor: '#fff8e6', fontSize: '11px', fontWeight: 600, color: '#666', textTransform: 'uppercase' }}>Overstock Risk</th>
                    <th colSpan={2} style={{ width: '26.6%', textAlign: 'center', padding: '10px 12px', borderBottom: '1px solid #ddd', backgroundColor: '#f0f8ff', fontSize: '11px', fontWeight: 600, color: '#666', textTransform: 'uppercase' }}>Revenue Shortfall</th>
                  </tr>
                  <tr>
                    <th style={{ textAlign: 'center', padding: '10px 12px', backgroundColor: '#fff0f0', borderBottom: '2px solid #eee', fontSize: '11px', fontWeight: 600, color: '#666' }}>85%</th>
                    <th style={{ textAlign: 'center', padding: '10px 12px', backgroundColor: '#fff0f0', borderBottom: '2px solid #eee', fontSize: '11px', fontWeight: 600, color: '#666' }}>95%</th>
                    <th style={{ textAlign: 'center', padding: '10px 12px', backgroundColor: '#fff8e6', borderBottom: '2px solid #eee', fontSize: '11px', fontWeight: 600, color: '#666' }}>85%</th>
                    <th style={{ textAlign: 'center', padding: '10px 12px', backgroundColor: '#fff8e6', borderBottom: '2px solid #eee', fontSize: '11px', fontWeight: 600, color: '#666' }}>95%</th>
                    <th style={{ textAlign: 'center', padding: '10px 12px', backgroundColor: '#f0f8ff', borderBottom: '2px solid #eee', fontSize: '11px', fontWeight: 600, color: '#666' }}>85%</th>
                    <th style={{ textAlign: 'center', padding: '10px 12px', backgroundColor: '#f0f8ff', borderBottom: '2px solid #eee', fontSize: '11px', fontWeight: 600, color: '#666' }}>95%</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map(row => (
                    <tr key={row.department_id} style={{ cursor: 'pointer' }} onClick={() => onSelectDepartment(row.department_id)}>
                      <td style={{ textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid #f0f0f0', fontSize: '13px', fontWeight: 600 }}>{row.department_id}</td>
                      <BreakCell count={row.units?.upper_85} consec={row.units?.upper_85_consec} total={row.units?.total_days} />
                      <BreakCell count={row.units?.upper_95} consec={0} total={row.units?.total_days} />
                      <BreakCell count={row.units?.lower_85} consec={row.units?.lower_85_consec} total={row.units?.total_days} />
                      <BreakCell count={row.units?.lower_95} consec={0} total={row.units?.total_days} />
                      <BreakCell count={row.revenue?.lower_85} consec={row.revenue?.lower_85_consec} total={row.revenue?.total_days} />
                      <BreakCell count={row.revenue?.lower_95} consec={0} total={row.revenue?.total_days} />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h2>Category Band Breaks</h2></div>
            <div className="card-body" style={{ padding: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                <thead>
                  <tr>
                    <th rowSpan={2} style={{ width: '20%', textAlign: 'left', padding: '10px 12px', backgroundColor: '#fafafa', borderBottom: '2px solid #eee', fontSize: '11px', fontWeight: 600, color: '#666', textTransform: 'uppercase' }}>Category</th>
                    <th colSpan={2} style={{ width: '26.6%', textAlign: 'center', padding: '10px 12px', borderBottom: '1px solid #ddd', backgroundColor: '#fff0f0', fontSize: '11px', fontWeight: 600, color: '#666', textTransform: 'uppercase' }}>Stockout Risk</th>
                    <th colSpan={2} style={{ width: '26.6%', textAlign: 'center', padding: '10px 12px', borderBottom: '1px solid #ddd', backgroundColor: '#fff8e6', fontSize: '11px', fontWeight: 600, color: '#666', textTransform: 'uppercase' }}>Overstock Risk</th>
                    <th colSpan={2} style={{ width: '26.6%', textAlign: 'center', padding: '10px 12px', borderBottom: '1px solid #ddd', backgroundColor: '#f0f8ff', fontSize: '11px', fontWeight: 600, color: '#666', textTransform: 'uppercase' }}>Revenue Shortfall</th>
                  </tr>
                  <tr>
                    <th style={{ textAlign: 'center', padding: '10px 12px', backgroundColor: '#fff0f0', borderBottom: '2px solid #eee', fontSize: '11px', fontWeight: 600, color: '#666' }}>85%</th>
                    <th style={{ textAlign: 'center', padding: '10px 12px', backgroundColor: '#fff0f0', borderBottom: '2px solid #eee', fontSize: '11px', fontWeight: 600, color: '#666' }}>95%</th>
                    <th style={{ textAlign: 'center', padding: '10px 12px', backgroundColor: '#fff8e6', borderBottom: '2px solid #eee', fontSize: '11px', fontWeight: 600, color: '#666' }}>85%</th>
                    <th style={{ textAlign: 'center', padding: '10px 12px', backgroundColor: '#fff8e6', borderBottom: '2px solid #eee', fontSize: '11px', fontWeight: 600, color: '#666' }}>95%</th>
                    <th style={{ textAlign: 'center', padding: '10px 12px', backgroundColor: '#f0f8ff', borderBottom: '2px solid #eee', fontSize: '11px', fontWeight: 600, color: '#666' }}>85%</th>
                    <th style={{ textAlign: 'center', padding: '10px 12px', backgroundColor: '#f0f8ff', borderBottom: '2px solid #eee', fontSize: '11px', fontWeight: 600, color: '#666' }}>95%</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(row => (
                    <tr key={row.category_id} style={{ cursor: 'pointer' }} onClick={() => onSelectCategory(row.category_id)}>
                      <td style={{ textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid #f0f0f0', fontSize: '13px', fontWeight: 600 }}>{row.category_id}</td>
                      <BreakCell count={row.units?.upper_85} consec={row.units?.upper_85_consec} total={row.units?.total_days} />
                      <BreakCell count={row.units?.upper_95} consec={0} total={row.units?.total_days} />
                      <BreakCell count={row.units?.lower_85} consec={row.units?.lower_85_consec} total={row.units?.total_days} />
                      <BreakCell count={row.units?.lower_95} consec={0} total={row.units?.total_days} />
                      <BreakCell count={row.revenue?.lower_85} consec={row.revenue?.lower_85_consec} total={row.revenue?.total_days} />
                      <BreakCell count={row.revenue?.lower_95} consec={0} total={row.revenue?.total_days} />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    // =============================================================================
    // DEPARTMENT REPORT
    // =============================================================================
    function DepartmentReport({ week, forecastType, geoLevel, geoId, departmentId, onSelectCategory }) {
      const [loading, setLoading] = useState(true);
      const [categories, setCategories] = useState([]);
      const [chartUnits, setChartUnits] = useState([]);
      const [chartRevenue, setChartRevenue] = useState([]);

      useEffect(() => { loadData(); }, [week, forecastType, geoLevel, geoId, departmentId]);

      async function loadData() {
        setLoading(true);
        try {
          const [catRes, chartU, chartR] = await Promise.all([
            fetch(`${API_BASE}/api/walmart/categories?week=${week}&forecast_type=${forecastType}&geo_level=${geoLevel}&geo_id=${geoId}&department_id=${departmentId}`),
            fetch(`${API_BASE}/api/walmart/chart/department?week=${week}&forecast_type=${forecastType}&type_id=U&geo_level=${geoLevel}&geo_id=${geoId}&department_id=${departmentId}`),
            fetch(`${API_BASE}/api/walmart/chart/department?week=${week}&forecast_type=${forecastType}&type_id=R&geo_level=${geoLevel}&geo_id=${geoId}&department_id=${departmentId}`)
          ]);
          setCategories(await catRes.json());
          setChartUnits(await chartU.json());
          setChartRevenue(await chartR.json());
        } catch (e) { console.error(e); }
        setLoading(false);
      }

      if (loading) return <div className="loading">Loading...</div>;

      const windowDays = forecastType === 'monthly' ? 30 : 90;

      return (
        <div>
          <div className="card">
            <div className="card-header">
              <h2>Department: {departmentId}</h2>
              <h3>Data through: {week} • Rolling {windowDays}-day window</h3>
            </div>
            <div className="card-body">
              <div className="charts-row">
                <ForecastChart data={chartUnits} title="Units Forecast vs Actual" />
                <ForecastChart data={chartRevenue} title="Revenue Forecast vs Actual" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h2>Category Band Breaks in {departmentId}</h2></div>
            <div className="card-body" style={{ padding: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                <thead>
                  <tr>
                    <th rowSpan={2} style={{ width: '20%', textAlign: 'left', padding: '10px 12px', backgroundColor: '#fafafa', borderBottom: '2px solid #eee', fontSize: '11px', fontWeight: 600, color: '#666', textTransform: 'uppercase' }}>Category</th>
                    <th colSpan={2} style={{ width: '26.6%', textAlign: 'center', padding: '10px 12px', borderBottom: '1px solid #ddd', backgroundColor: '#fff0f0', fontSize: '11px', fontWeight: 600, color: '#666', textTransform: 'uppercase' }}>Stockout Risk</th>
                    <th colSpan={2} style={{ width: '26.6%', textAlign: 'center', padding: '10px 12px', borderBottom: '1px solid #ddd', backgroundColor: '#fff8e6', fontSize: '11px', fontWeight: 600, color: '#666', textTransform: 'uppercase' }}>Overstock Risk</th>
                    <th colSpan={2} style={{ width: '26.6%', textAlign: 'center', padding: '10px 12px', borderBottom: '1px solid #ddd', backgroundColor: '#f0f8ff', fontSize: '11px', fontWeight: 600, color: '#666', textTransform: 'uppercase' }}>Revenue Shortfall</th>
                  </tr>
                  <tr>
                    <th style={{ textAlign: 'center', padding: '10px 12px', backgroundColor: '#fff0f0', borderBottom: '2px solid #eee', fontSize: '11px', fontWeight: 600, color: '#666' }}>85%</th>
                    <th style={{ textAlign: 'center', padding: '10px 12px', backgroundColor: '#fff0f0', borderBottom: '2px solid #eee', fontSize: '11px', fontWeight: 600, color: '#666' }}>95%</th>
                    <th style={{ textAlign: 'center', padding: '10px 12px', backgroundColor: '#fff8e6', borderBottom: '2px solid #eee', fontSize: '11px', fontWeight: 600, color: '#666' }}>85%</th>
                    <th style={{ textAlign: 'center', padding: '10px 12px', backgroundColor: '#fff8e6', borderBottom: '2px solid #eee', fontSize: '11px', fontWeight: 600, color: '#666' }}>95%</th>
                    <th style={{ textAlign: 'center', padding: '10px 12px', backgroundColor: '#f0f8ff', borderBottom: '2px solid #eee', fontSize: '11px', fontWeight: 600, color: '#666' }}>85%</th>
                    <th style={{ textAlign: 'center', padding: '10px 12px', backgroundColor: '#f0f8ff', borderBottom: '2px solid #eee', fontSize: '11px', fontWeight: 600, color: '#666' }}>95%</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(row => (
                    <tr key={row.category_id} style={{ cursor: 'pointer' }} onClick={() => onSelectCategory(row.category_id)}>
                      <td style={{ textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid #f0f0f0', fontSize: '13px', fontWeight: 600 }}>{row.category_id}</td>
                      <BreakCell count={row.units?.upper_85} consec={row.units?.upper_85_consec} total={row.units?.total_days} />
                      <BreakCell count={row.units?.upper_95} consec={0} total={row.units?.total_days} />
                      <BreakCell count={row.units?.lower_85} consec={row.units?.lower_85_consec} total={row.units?.total_days} />
                      <BreakCell count={row.units?.lower_95} consec={0} total={row.units?.total_days} />
                      <BreakCell count={row.revenue?.lower_85} consec={row.revenue?.lower_85_consec} total={row.revenue?.total_days} />
                      <BreakCell count={row.revenue?.lower_95} consec={0} total={row.revenue?.total_days} />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    // =============================================================================
    // CATEGORY REPORT
    // =============================================================================
    function CategoryReport({ week, forecastType, geoLevel, geoId, categoryId, onSelectSKU }) {
      const [loading, setLoading] = useState(true);
      const [skus, setSKUs] = useState([]);
      const [chartUnits, setChartUnits] = useState([]);
      const [chartRevenue, setChartRevenue] = useState([]);

      useEffect(() => { loadData(); }, [week, forecastType, geoLevel, geoId, categoryId]);

      async function loadData() {
        setLoading(true);
        try {
          const [chartU, chartR] = await Promise.all([
            fetch(`${API_BASE}/api/walmart/chart/category?week=${week}&forecast_type=${forecastType}&type_id=U&geo_level=${geoLevel}&geo_id=${geoId}&category_id=${categoryId}`),
            fetch(`${API_BASE}/api/walmart/chart/category?week=${week}&forecast_type=${forecastType}&type_id=R&geo_level=${geoLevel}&geo_id=${geoId}&category_id=${categoryId}`)
          ]);
          setChartUnits(await chartU.json());
          setChartRevenue(await chartR.json());
          if (geoLevel === 'location_id' && geoId === 'CA_1') {
            const skuRes = await fetch(`${API_BASE}/api/walmart/skus?week=${week}&forecast_type=${forecastType}&category_id=${categoryId}&limit=50`);
            setSKUs(await skuRes.json());
          } else {
            setSKUs([]);
          }
        } catch (e) { console.error(e); }
        setLoading(false);
      }

      if (loading) return <div className="loading">Loading...</div>;
      const showSKUs = geoLevel === 'location_id' && geoId === 'CA_1';
      const windowDays = forecastType === 'monthly' ? 30 : 90;

      return (
        <div>
          <div className="card">
            <div className="card-header">
              <h2>Category: {categoryId}</h2>
              <h3>Data through: {week} • Rolling {windowDays}-day window</h3>
            </div>
            <div className="card-body">
              <div className="charts-row">
                <ForecastChart data={chartUnits} title="Units Forecast vs Actual" />
                <ForecastChart data={chartRevenue} title="Revenue Forecast vs Actual" />
              </div>
            </div>
          </div>

          {!showSKUs && <div className="sku-note"><strong>Note:</strong> SKU drill-down only available for Store CA_1.</div>}

          {showSKUs && skus.length > 0 && (
            <div className="card">
              <div className="card-header"><h2>SKU Band Breaks (Top 50 by breaks)</h2></div>
              <div className="card-body" style={{ padding: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                  <thead>
                    <tr>
                      <th rowSpan={2} style={{ width: '20%', textAlign: 'left', padding: '10px 12px', backgroundColor: '#fafafa', borderBottom: '2px solid #eee', fontSize: '11px', fontWeight: 600, color: '#666', textTransform: 'uppercase' }}>SKU</th>
                      <th colSpan={2} style={{ width: '26.6%', textAlign: 'center', padding: '10px 12px', borderBottom: '1px solid #ddd', backgroundColor: '#fff0f0', fontSize: '11px', fontWeight: 600, color: '#666', textTransform: 'uppercase' }}>Stockout</th>
                      <th colSpan={2} style={{ width: '26.6%', textAlign: 'center', padding: '10px 12px', borderBottom: '1px solid #ddd', backgroundColor: '#fff8e6', fontSize: '11px', fontWeight: 600, color: '#666', textTransform: 'uppercase' }}>Overstock</th>
                      <th colSpan={2} style={{ width: '26.6%', textAlign: 'center', padding: '10px 12px', borderBottom: '1px solid #ddd', backgroundColor: '#f0f8ff', fontSize: '11px', fontWeight: 600, color: '#666', textTransform: 'uppercase' }}>Rev Shortfall</th>
                    </tr>
                    <tr>
                      <th style={{ textAlign: 'center', padding: '10px 12px', backgroundColor: '#fff0f0', borderBottom: '2px solid #eee', fontSize: '11px', fontWeight: 600, color: '#666' }}>85%</th>
                      <th style={{ textAlign: 'center', padding: '10px 12px', backgroundColor: '#fff0f0', borderBottom: '2px solid #eee', fontSize: '11px', fontWeight: 600, color: '#666' }}>95%</th>
                      <th style={{ textAlign: 'center', padding: '10px 12px', backgroundColor: '#fff8e6', borderBottom: '2px solid #eee', fontSize: '11px', fontWeight: 600, color: '#666' }}>85%</th>
                      <th style={{ textAlign: 'center', padding: '10px 12px', backgroundColor: '#fff8e6', borderBottom: '2px solid #eee', fontSize: '11px', fontWeight: 600, color: '#666' }}>95%</th>
                      <th style={{ textAlign: 'center', padding: '10px 12px', backgroundColor: '#f0f8ff', borderBottom: '2px solid #eee', fontSize: '11px', fontWeight: 600, color: '#666' }}>85%</th>
                      <th style={{ textAlign: 'center', padding: '10px 12px', backgroundColor: '#f0f8ff', borderBottom: '2px solid #eee', fontSize: '11px', fontWeight: 600, color: '#666' }}>95%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {skus.map(row => (
                      <tr key={row.sku_id} style={{ cursor: 'pointer' }} onClick={() => onSelectSKU(row.sku_id)}>
                        <td style={{ textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid #f0f0f0', fontSize: '11px', fontWeight: 600 }}>{row.sku_id}</td>
                        <BreakCell count={row.units?.upper_85} consec={row.units?.upper_85_consec} total={row.units?.total_days} />
                        <BreakCell count={row.units?.upper_95} consec={0} total={row.units?.total_days} />
                        <BreakCell count={row.units?.lower_85} consec={row.units?.lower_85_consec} total={row.units?.total_days} />
                        <BreakCell count={row.units?.lower_95} consec={0} total={row.units?.total_days} />
                        <BreakCell count={row.revenue?.lower_85} consec={row.revenue?.lower_85_consec} total={row.revenue?.total_days} />
                        <BreakCell count={row.revenue?.lower_95} consec={0} total={row.revenue?.total_days} />
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      );
    }

    // =============================================================================
    // SKU REPORT
    // =============================================================================
    function SKUReport({ week, forecastType, skuId }) {
      const [loading, setLoading] = useState(true);
      const [chartUnits, setChartUnits] = useState([]);
      const [chartRevenue, setChartRevenue] = useState([]);
      const [skuInfo, setSKUInfo] = useState(null);

      useEffect(() => { if (skuId) loadData(); }, [week, forecastType, skuId]);

      async function loadData() {
        setLoading(true);
        try {
          const [chartU, chartR, infoRes] = await Promise.all([
            fetch(`${API_BASE}/api/walmart/chart/sku?week=${week}&forecast_type=${forecastType}&type_id=U&sku_id=${encodeURIComponent(skuId)}`),
            fetch(`${API_BASE}/api/walmart/chart/sku?week=${week}&forecast_type=${forecastType}&type_id=R&sku_id=${encodeURIComponent(skuId)}`),
            fetch(`${API_BASE}/api/walmart/sku-info?week=${week}&forecast_type=${forecastType}&sku_id=${encodeURIComponent(skuId)}`)
          ]);
          setChartUnits(await chartU.json());
          setChartRevenue(await chartR.json());
          setSKUInfo(await infoRes.json());
        } catch (e) { console.error(e); }
        setLoading(false);
      }

      if (!skuId) return <div className="loading">Select a SKU</div>;
      if (loading) return <div className="loading">Loading...</div>;

      const u = skuInfo?.units || {};
      const r = skuInfo?.revenue || {};
      const windowDays = forecastType === 'monthly' ? 30 : 90;

      return (
        <div>
          <div className="card">
            <div className="card-header">
              <h2>SKU: {skuId}</h2>
              <h3>Store: CA_1 • Data through: {week} • Rolling {windowDays}-day window</h3>
            </div>
            <div className="card-body">
              <div className="metric-grid">
                <div className={`metric-card ${u.upper_85 > 0 ? 'alert' : ''}`}>
                  <div className="metric-value">{u.upper_85 || 0}</div>
                  <div className="metric-label">Stockout Days (85%)</div>
                  {u.upper_85_consec > 1 && <div style={{fontSize:11,color:'#c00'}}>{u.upper_85_consec} consecutive</div>}
                </div>
                <div className={`metric-card ${u.lower_85 > 0 ? 'warning' : ''}`}>
                  <div className="metric-value">{u.lower_85 || 0}</div>
                  <div className="metric-label">Overstock Days (85%)</div>
                  {u.lower_85_consec > 1 && <div style={{fontSize:11,color:'#e65c00'}}>{u.lower_85_consec} consecutive</div>}
                </div>
                <div className={`metric-card ${r.lower_85 > 0 ? 'alert' : ''}`}>
                  <div className="metric-value">{r.lower_85 || 0}</div>
                  <div className="metric-label">Rev Shortfall Days (85%)</div>
                  {r.lower_85_consec > 1 && <div style={{fontSize:11,color:'#c00'}}>{r.lower_85_consec} consecutive</div>}
                </div>
                <div className="metric-card">
                  <div className="metric-value">{u.total_days || 0}/{windowDays}</div>
                  <div className="metric-label">Days with Data</div>
                </div>
              </div>
              <div className="charts-row">
                <ForecastChart data={chartUnits} title="Units Forecast vs Actual" />
                <ForecastChart data={chartRevenue} title="Revenue Forecast vs Actual" />
              </div>
            </div>
          </div>
        </div>
      );
    }

    // =============================================================================
    // MAIN APP
    // =============================================================================
    export function WalmartDashboard() {
      const [weeks, setWeeks] = useState([]);
      const [selectedWeek, setSelectedWeek] = useState('');
      const [forecastType, setForecastType] = useState('monthly');
      const [geoLevel, setGeoLevel] = useState('all_locations');
      const [geoIds, setGeoIds] = useState(['ALL']);
      const [selectedGeoId, setSelectedGeoId] = useState('ALL');
      const [reportType, setReportType] = useState('location');
      const [departments, setDepartments] = useState([]);
      const [categories, setCategories] = useState([]);
      const [skuList, setSKUList] = useState([]);
      const [selectedDepartment, setSelectedDepartment] = useState('');
      const [selectedCategory, setSelectedCategory] = useState('');
      const [selectedSKU, setSelectedSKU] = useState('');
      const [pdfProgress, setPdfProgress] = useState(null);

      useEffect(() => {
        fetch(`${API_BASE}/api/walmart/weeks?forecast_type=${forecastType}`)
          .then(r => r.json())
          .then(data => { setWeeks(data); if (data.length && !selectedWeek) setSelectedWeek(data[Math.floor(data.length / 2)]); });
      }, [forecastType]);

      useEffect(() => {
        fetch(`${API_BASE}/api/walmart/geo-ids?geo_level=${geoLevel}&forecast_type=${forecastType}`)
          .then(r => r.json())
          .then(data => { setGeoIds(data); if (data.length) setSelectedGeoId(data[0]); });
      }, [geoLevel, forecastType]);

      useEffect(() => {
        if (!selectedWeek) return;
        fetch(`${API_BASE}/api/walmart/departments?week=${selectedWeek}&forecast_type=${forecastType}&geo_level=${geoLevel}&geo_id=${selectedGeoId}`)
          .then(r => r.json())
          .then(data => { setDepartments(data); if (data.length && !selectedDepartment) setSelectedDepartment(data[0].department_id); });
      }, [selectedWeek, forecastType, geoLevel, selectedGeoId]);

      useEffect(() => {
        if (!selectedWeek) return;
        fetch(`${API_BASE}/api/walmart/categories?week=${selectedWeek}&forecast_type=${forecastType}&geo_level=${geoLevel}&geo_id=${selectedGeoId}`)
          .then(r => r.json())
          .then(data => { setCategories(data); if (data.length && !selectedCategory) setSelectedCategory(data[0].category_id); });
      }, [selectedWeek, forecastType, geoLevel, selectedGeoId]);

      useEffect(() => {
        if (geoLevel !== 'location_id' || selectedGeoId !== 'CA_1') { setSKUList([]); return; }
        fetch(`${API_BASE}/api/walmart/sku-list?forecast_type=${forecastType}`)
          .then(r => r.json())
          .then(data => { setSKUList(data); if (data.length && !selectedSKU) setSelectedSKU(data[0].sku_id); });
      }, [forecastType, geoLevel, selectedGeoId]);

      const showSKUOption = geoLevel === 'location_id' && selectedGeoId === 'CA_1';

      return (
        <div className="wm-root">
          <div className="header">
            <h1>Walmart Forecast Dashboard</h1>
            <div className="header-sub">Band Break Analysis: Stockouts • Overstocks • Revenue Shortfalls</div>
            {selectedWeek && <div className="header-sub" style={{marginTop: 8, color: '#4ecdc4', fontWeight: 600}}>Data through: {selectedWeek} • Forecasts generated daily at SKU level</div>}
          </div>
          <div className="container">
            <div className="controls">
              <div className="control-group">
                <label>Report</label>
                <select value={reportType} onChange={e => setReportType(e.target.value)}>
                  <option value="location">Location Overview</option>
                  <option value="department">Department</option>
                  <option value="category">Category</option>
                  {showSKUOption && <option value="sku">SKU</option>}
                </select>
              </div>
              <div className="control-group">
                <label>Geo Level</label>
                <select value={geoLevel} onChange={e => { setGeoLevel(e.target.value); setReportType('location'); }}>
                  <option value="all_locations">All Locations</option>
                  <option value="state_id">State</option>
                  <option value="location_id">Store</option>
                </select>
              </div>
              {geoLevel !== 'all_locations' && (
                <div className="control-group">
                  <label>{geoLevel === 'state_id' ? 'State' : 'Store'}</label>
                  <select value={selectedGeoId} onChange={e => setSelectedGeoId(e.target.value)}>
                    {geoIds.map(id => <option key={id} value={id}>{id}</option>)}
                  </select>
                </div>
              )}
              {reportType === 'department' && (
                <div className="control-group">
                  <label>Department</label>
                  <select value={selectedDepartment} onChange={e => setSelectedDepartment(e.target.value)}>
                    {departments.map(d => <option key={d.department_id} value={d.department_id}>{d.department_id}</option>)}
                  </select>
                </div>
              )}
              {reportType === 'category' && (
                <div className="control-group">
                  <label>Category</label>
                  <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                    {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_id}</option>)}
                  </select>
                </div>
              )}
              {reportType === 'sku' && showSKUOption && (
                <div className="control-group">
                  <label>SKU</label>
                  <select value={selectedSKU} onChange={e => setSelectedSKU(e.target.value)}>
                    {skuList.map(s => <option key={s.sku_id} value={s.sku_id}>{s.sku_id}</option>)}
                  </select>
                </div>
              )}
              <div className="control-group">
                <label>Forecast</label>
                <select value={forecastType} onChange={e => setForecastType(e.target.value)}>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>
              <div className="control-group">
                <label>Week Ending</label>
                <select value={selectedWeek} onChange={e => setSelectedWeek(e.target.value)}>
                  {weeks.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
              <div className="control-group">
                <label>&nbsp;</label>
                <button 
                  className="download-btn"
                  disabled={!!pdfProgress}
                  onClick={() => generatePDFReport(selectedWeek, forecastType, setPdfProgress)}
                >
                  {pdfProgress || '📄 Download PDF Report'}
                </button>
              </div>
            </div>

            <div className="legend-box">
              <strong>Band Break</strong> = Actual sales outside forecast confidence interval. 
              <span className="stockout">Upper break (Stockout Risk)</span>: Selling faster than forecast — check inventory. 
              <span className="overstock">Lower break (Overstock Risk)</span>: Selling slower than forecast — markdown/overstock risk. 
              <strong>Consecutive breaks</strong> = sustained pattern requiring action.
            </div>

            {selectedWeek && reportType === 'location' && (
              <LocationReport week={selectedWeek} forecastType={forecastType} geoLevel={geoLevel} geoId={selectedGeoId}
                onSelectDepartment={d => { setSelectedDepartment(d); setReportType('department'); }}
                onSelectCategory={c => { setSelectedCategory(c); setReportType('category'); }} />
            )}
            {selectedWeek && reportType === 'department' && selectedDepartment && (
              <DepartmentReport week={selectedWeek} forecastType={forecastType} geoLevel={geoLevel} geoId={selectedGeoId}
                departmentId={selectedDepartment}
                onSelectCategory={c => { setSelectedCategory(c); setReportType('category'); }} />
            )}
            {selectedWeek && reportType === 'category' && selectedCategory && (
              <CategoryReport week={selectedWeek} forecastType={forecastType} geoLevel={geoLevel} geoId={selectedGeoId}
                categoryId={selectedCategory}
                onSelectSKU={s => { setSelectedSKU(s); setReportType('sku'); }} />
            )}
            {selectedWeek && reportType === 'sku' && selectedSKU && showSKUOption && (
              <SKUReport week={selectedWeek} forecastType={forecastType} skuId={selectedSKU} />
            )}
          </div>
        </div>
      );
    }


export default WalmartDashboard;
