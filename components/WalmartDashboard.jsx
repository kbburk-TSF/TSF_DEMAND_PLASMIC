// components/WalmartDashboard.jsx
// Drop this file into your components folder

import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';

// UPDATE THIS to your Render backend URL
const API_BASE = 'https://tsf-demand-back.onrender.com/api/walmart';

const styles = {
  container: { maxWidth: 1400, margin: '0 auto', padding: 20, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
  header: { background: '#1a1a2e', color: 'white', padding: '20px 30px', marginBottom: 20, borderRadius: 8 },
  headerTitle: { margin: 0, fontSize: 24 },
  headerSub: { margin: '5px 0 0', fontSize: 14, color: '#aaa' },
  headerData: { marginTop: 8, color: '#4ecdc4', fontWeight: 600, fontSize: 14 },
  controls: { display: 'flex', gap: 20, alignItems: 'flex-end', marginBottom: 20, padding: 20, background: 'white', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', flexWrap: 'wrap' },
  controlGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 12, fontWeight: 600, color: '#666', textTransform: 'uppercase' },
  select: { padding: '8px 12px', fontSize: 14, border: '1px solid #ddd', borderRadius: 4, minWidth: 160 },
  card: { background: 'white', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: 20, overflow: 'hidden' },
  cardHeader: { padding: '16px 20px', borderBottom: '1px solid #eee', background: '#fafafa' },
  cardTitle: { margin: 0, fontSize: 18, fontWeight: 600 },
  cardSubtitle: { margin: 0, fontSize: 14, fontWeight: 500, color: '#666' },
  cardBody: { padding: 20 },
  chartsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  metricGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 15, marginBottom: 20 },
  metricCard: { background: '#f8f9fa', padding: 15, borderRadius: 6, textAlign: 'center' },
  metricCardAlert: { background: '#fff0f0' },
  metricCardWarning: { background: '#fff8e6' },
  metricValue: { fontSize: 24, fontWeight: 700, color: '#1a1a2e' },
  metricLabel: { fontSize: 11, color: '#666', textTransform: 'uppercase', marginTop: 5 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '10px 12px', textAlign: 'center', borderBottom: '2px solid #eee', fontSize: 11, fontWeight: 600, color: '#666', textTransform: 'uppercase', background: '#fafafa' },
  thLeft: { textAlign: 'left' },
  td: { padding: '10px 12px', borderBottom: '1px solid #f0f0f0', fontSize: 13, textAlign: 'center' },
  tdLeft: { textAlign: 'left', fontWeight: 600 },
  clickableRow: { cursor: 'pointer' },
  loading: { padding: 40, textAlign: 'center', color: '#666' },
  legendBox: { background: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: 6, padding: '12px 16px', marginBottom: 15, fontSize: 12, color: '#555' },
  chartTitle: { margin: '0 0 10px', fontSize: 14, fontWeight: 600 },
  legend: { display: 'flex', gap: 20, justifyContent: 'center', marginTop: 10, fontSize: 12 },
  legendItem: { display: 'flex', alignItems: 'center', gap: 6 },
};

const breakClass = (count, total) => {
  if (!total || count === 0) return {};
  const pct = count / total;
  if (pct > 0.15 || count >= 5) return { color: '#c00', fontWeight: 700 };
  if (pct > 0.05 || count >= 2) return { color: '#e65c00', fontWeight: 600 };
  return { color: '#080' };
};

const BreakCell = ({ count, consec, total }) => (
  <td style={{ ...styles.td, ...breakClass(count, total), fontVariantNumeric: 'tabular-nums' }}>
    {count || 0}
    {consec > 1 && <span style={{ fontSize: 10, color: '#666', display: 'block' }}>({consec} consec)</span>}
  </td>
);

function useContainerWidth() {
  const ref = useRef(null);
  const [w, setW] = useState(400);
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const ro = new ResizeObserver(entries => {
      for (const e of entries) {
        setW(e.contentRect.width || 400);
      }
    });
    ro.observe(el);
    setW(el.clientWidth || 400);
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
      <h4 style={styles.chartTitle}>{title}</h4>
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
              <text x={0} y={18} fontSize={10} fill="#666" textAnchor="middle" transform="rotate(45 0 18)">{d.date?.slice(5)}</text>
            </g>
          );
        })}
      </svg>
      <div style={styles.legend}>
        <div style={styles.legendItem}><svg width={30} height={10}><line x1={0} y1={5} x2={30} y2={5} stroke="#000" strokeWidth={2} /></svg><span>Actual</span></div>
        <div style={styles.legendItem}><svg width={30} height={10}><line x1={0} y1={5} x2={30} y2={5} stroke="#FFD700" strokeWidth={2.5} /></svg><span>Forecast</span></div>
        <div style={styles.legendItem}><svg width={30} height={10}><rect x={0} y={0} width={30} height={10} fill="rgba(46,204,113,0.45)" /></svg><span>85% CI</span></div>
        <div style={styles.legendItem}><svg width={30} height={10}><rect x={0} y={0} width={30} height={10} fill="rgba(46,204,113,0.25)" /></svg><span>95% CI</span></div>
      </div>
    </div>
  );
}

function LocationReport({ week, forecastType, geoLevel, geoId, apiBase }) {
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
      const base = apiBase || API_BASE;
      const [deptRes, catRes, chartU, chartR, sumRes] = await Promise.all([
        fetch(`${base}/departments?week=${week}&forecast_type=${forecastType}&geo_level=${geoLevel}&geo_id=${geoId}`),
        fetch(`${base}/categories?week=${week}&forecast_type=${forecastType}&geo_level=${geoLevel}&geo_id=${geoId}`),
        fetch(`${base}/chart/location?week=${week}&forecast_type=${forecastType}&type_id=U&geo_level=${geoLevel}&geo_id=${geoId}`),
        fetch(`${base}/chart/location?week=${week}&forecast_type=${forecastType}&type_id=R&geo_level=${geoLevel}&geo_id=${geoId}`),
        fetch(`${base}/location-summary?week=${week}&forecast_type=${forecastType}&geo_level=${geoLevel}&geo_id=${geoId}`)
      ]);
      setDepartments(await deptRes.json());
      setCategories(await catRes.json());
      setChartUnits(await chartU.json());
      setChartRevenue(await chartR.json());
      setSummary(await sumRes.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  if (loading) return <div style={styles.loading}>Loading...</div>;

  const geoLabel = geoLevel === 'all_locations' ? 'All Locations' : geoLevel === 'state_id' ? `State: ${geoId}` : `Store: ${geoId}`;
  const u = summary.units || {};
  const r = summary.revenue || {};
  const windowDays = forecastType === 'monthly' ? 30 : 90;

  return (
    <div>
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>{geoLabel} - Band Break Summary</h2>
          <h3 style={styles.cardSubtitle}>Data through: {week} • Rolling {windowDays}-day window • {u.total_days || 0} days analyzed</h3>
        </div>
        <div style={styles.cardBody}>
          <div style={styles.metricGrid}>
            <div style={{ ...styles.metricCard, ...(u.upper_85 > 0 ? styles.metricCardAlert : {}) }}>
              <div style={styles.metricValue}>{u.upper_85 || 0}</div>
              <div style={styles.metricLabel}>Units Stockout Risk (Upper 85%)</div>
              {u.upper_85_consec > 1 && <div style={{ fontSize: 11, color: '#c00' }}>{u.upper_85_consec} consecutive</div>}
            </div>
            <div style={{ ...styles.metricCard, ...(u.lower_85 > 0 ? styles.metricCardWarning : {}) }}>
              <div style={styles.metricValue}>{u.lower_85 || 0}</div>
              <div style={styles.metricLabel}>Units Overstock Risk (Lower 85%)</div>
              {u.lower_85_consec > 1 && <div style={{ fontSize: 11, color: '#e65c00' }}>{u.lower_85_consec} consecutive</div>}
            </div>
            <div style={{ ...styles.metricCard, ...(r.lower_85 > 0 ? styles.metricCardAlert : {}) }}>
              <div style={styles.metricValue}>{r.lower_85 || 0}</div>
              <div style={styles.metricLabel}>Revenue Shortfall (Lower 85%)</div>
              {r.lower_85_consec > 1 && <div style={{ fontSize: 11, color: '#c00' }}>{r.lower_85_consec} consecutive</div>}
            </div>
            <div style={styles.metricCard}>
              <div style={styles.metricValue}>${((r.total || 0) / 1000000).toFixed(1)}M</div>
              <div style={styles.metricLabel}>Total Revenue</div>
            </div>
          </div>
          <div style={styles.chartsRow}>
            <ForecastChart data={chartUnits} title="Units Forecast vs Actual" />
            <ForecastChart data={chartRevenue} title="Revenue Forecast vs Actual" />
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.cardHeader}><h2 style={styles.cardTitle}>Department Band Breaks</h2></div>
        <div style={{ padding: 0 }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th rowSpan={2} style={{ ...styles.th, ...styles.thLeft }}>Department</th>
                <th colSpan={2} style={{ ...styles.th, borderBottom: '1px solid #ddd', background: '#fff0f0' }}>Stockout Risk</th>
                <th colSpan={2} style={{ ...styles.th, borderBottom: '1px solid #ddd', background: '#fff8e6' }}>Overstock Risk</th>
                <th colSpan={2} style={{ ...styles.th, borderBottom: '1px solid #ddd', background: '#f0f8ff' }}>Revenue Shortfall</th>
              </tr>
              <tr>
                <th style={{ ...styles.th, background: '#fff0f0' }}>85%</th>
                <th style={{ ...styles.th, background: '#fff0f0' }}>95%</th>
                <th style={{ ...styles.th, background: '#fff8e6' }}>85%</th>
                <th style={{ ...styles.th, background: '#fff8e6' }}>95%</th>
                <th style={{ ...styles.th, background: '#f0f8ff' }}>85%</th>
                <th style={{ ...styles.th, background: '#f0f8ff' }}>95%</th>
              </tr>
            </thead>
            <tbody>
              {departments.map(row => (
                <tr key={row.department_id}>
                  <td style={{ ...styles.td, ...styles.tdLeft }}>{row.department_id}</td>
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

      <div style={styles.card}>
        <div style={styles.cardHeader}><h2 style={styles.cardTitle}>Category Band Breaks</h2></div>
        <div style={{ padding: 0 }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th rowSpan={2} style={{ ...styles.th, ...styles.thLeft }}>Category</th>
                <th colSpan={2} style={{ ...styles.th, borderBottom: '1px solid #ddd', background: '#fff0f0' }}>Stockout Risk</th>
                <th colSpan={2} style={{ ...styles.th, borderBottom: '1px solid #ddd', background: '#fff8e6' }}>Overstock Risk</th>
                <th colSpan={2} style={{ ...styles.th, borderBottom: '1px solid #ddd', background: '#f0f8ff' }}>Revenue Shortfall</th>
              </tr>
              <tr>
                <th style={{ ...styles.th, background: '#fff0f0' }}>85%</th>
                <th style={{ ...styles.th, background: '#fff0f0' }}>95%</th>
                <th style={{ ...styles.th, background: '#fff8e6' }}>85%</th>
                <th style={{ ...styles.th, background: '#fff8e6' }}>95%</th>
                <th style={{ ...styles.th, background: '#f0f8ff' }}>85%</th>
                <th style={{ ...styles.th, background: '#f0f8ff' }}>95%</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(row => (
                <tr key={row.category_id}>
                  <td style={{ ...styles.td, ...styles.tdLeft }}>{row.category_id}</td>
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

export function WalmartDashboard({ apiBase }) {
  const base = apiBase || API_BASE;
  
  const [weeks, setWeeks] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState('');
  const [forecastType, setForecastType] = useState('monthly');
  const [geoLevel, setGeoLevel] = useState('all_locations');
  const [geoIds, setGeoIds] = useState(['ALL']);
  const [selectedGeoId, setSelectedGeoId] = useState('ALL');

  useEffect(() => {
    fetch(`${base}/weeks?forecast_type=${forecastType}`)
      .then(r => r.json())
      .then(data => { 
        setWeeks(data); 
        if (data.length && !selectedWeek) setSelectedWeek(data[Math.floor(data.length / 2)]); 
      })
      .catch(console.error);
  }, [forecastType, base]);

  useEffect(() => {
    if (geoLevel === 'all_locations') {
      setGeoIds(['ALL']);
      setSelectedGeoId('ALL');
      return;
    }
    fetch(`${base}/geo-ids?geo_level=${geoLevel}&forecast_type=${forecastType}`)
      .then(r => r.json())
      .then(data => { setGeoIds(data); if (data.length) setSelectedGeoId(data[0]); })
      .catch(console.error);
  }, [geoLevel, forecastType, base]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Walmart Forecast Dashboard</h1>
        <div style={styles.headerSub}>Band Break Analysis: Stockouts • Overstocks • Revenue Shortfalls</div>
        {selectedWeek && <div style={styles.headerData}>Data through: {selectedWeek} • Forecasts generated daily at SKU level</div>}
      </div>

      <div style={styles.controls}>
        <div style={styles.controlGroup}>
          <label style={styles.label}>Geo Level</label>
          <select style={styles.select} value={geoLevel} onChange={e => setGeoLevel(e.target.value)}>
            <option value="all_locations">All Locations</option>
            <option value="state_id">State</option>
            <option value="location_id">Store</option>
          </select>
        </div>
        {geoLevel !== 'all_locations' && (
          <div style={styles.controlGroup}>
            <label style={styles.label}>{geoLevel === 'state_id' ? 'State' : 'Store'}</label>
            <select style={styles.select} value={selectedGeoId} onChange={e => setSelectedGeoId(e.target.value)}>
              {geoIds.map(id => <option key={id} value={id}>{id}</option>)}
            </select>
          </div>
        )}
        <div style={styles.controlGroup}>
          <label style={styles.label}>Forecast</label>
          <select style={styles.select} value={forecastType} onChange={e => setForecastType(e.target.value)}>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>
        </div>
        <div style={styles.controlGroup}>
          <label style={styles.label}>Week Ending</label>
          <select style={styles.select} value={selectedWeek} onChange={e => setSelectedWeek(e.target.value)}>
            {weeks.map(w => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>
      </div>

      <div style={styles.legendBox}>
        <strong>Band Break</strong> = Actual sales outside forecast confidence interval. 
        <span style={{ color: '#c00', fontWeight: 600 }}> Upper break (Stockout Risk)</span>: Selling faster than forecast — check inventory. 
        <span style={{ color: '#e65c00', fontWeight: 600 }}> Lower break (Overstock Risk)</span>: Selling slower than forecast — markdown/overstock risk. 
        <strong> Consecutive breaks</strong> = sustained pattern requiring action.
      </div>

      {selectedWeek && (
        <LocationReport 
          week={selectedWeek} 
          forecastType={forecastType} 
          geoLevel={geoLevel} 
          geoId={selectedGeoId}
          apiBase={base}
        />
      )}
    </div>
  );
}

export default WalmartDashboard;
