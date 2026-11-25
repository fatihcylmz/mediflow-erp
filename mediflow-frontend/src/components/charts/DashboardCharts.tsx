import React from 'react';

/**
 * Dashboard Charts - Modern ERP Chart Components
 * SVG-based charts with hover tooltips and smooth transitions
 */

interface TrendChartProps {
  data: Array<{ date: string; [key: string]: any }>;
  label: string;
  color: string;
  height?: number;
  fillColor?: string;
}

/**
 * Line/Area Chart with smooth curves and hover tooltips
 */
export function TrendChart({ data, label, color, height = 220, fillColor }: TrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div style={{ width: '100%', height, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#FAFAFA', borderRadius: 8 }}>
        <div style={{ color: '#94A3B8', fontSize: 13 }}>Veri yok</div>
        <div style={{ width: '100%', height: '80%', borderBottom: '1px dashed #E2E8F0', marginTop: 8 }} />
      </div>
    );
  }

  const padX = 20;
  const padY = 20;
  const w = 400;
  const h = height - 40;
  const values = data.map(d => d[label]);
  const max = Math.max(...values, 1) * 1.15;
  const min = 0;

  const stepX = w / Math.max(data.length - 1, 1);

  const points = data.map((d, i) => {
    const x = i * stepX;
    const y = h - ((d[label] - min) / (max - min)) * h;
    return { x, y, value: d[label], date: d.date };
  });

  let dPath = `M ${points[0].x} ${points[0].y}`;
  if (points.length > 1) {
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cp1x = p0.x + (p1.x - p0.x) / 2;
      dPath += ` C ${cp1x} ${p0.y}, ${cp1x} ${p1.y}, ${p1.x} ${p1.y}`;
    }
  }

  const fillPath = `${dPath} L ${w} ${h} L 0 ${h} Z`;
  const gradientColor = fillColor || color;

  return (
    <div style={{ width: '100%', height, position: 'relative' }}>
      <svg viewBox={`-10 -10 ${w + 20} ${h + 40}`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={gradientColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={gradientColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(p => (
          <line key={p} x1="0" y1={h * p} x2={w} y2={h * p} stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4" />
        ))}
        <path d={fillPath} fill={`url(#grad-${color})`} />
        <path d={dPath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="4"
            fill="white"
            stroke={color}
            strokeWidth="2"
            style={{ cursor: 'pointer', transition: 'r 0.2s ease' }}
            onMouseOver={(e) => {
              e.currentTarget.setAttribute('r', '6');
              e.currentTarget.setAttribute('fill', color);
            }}
            onMouseOut={(e) => {
              e.currentTarget.setAttribute('r', '4');
              e.currentTarget.setAttribute('fill', 'white');
            }}
          >
            <title>{p.date}: {p.value.toLocaleString('tr-TR')}</title>
          </circle>
        ))}
        {/* X-axis labels */}
        {data.length > 0 && [0, Math.floor(data.length / 2), data.length - 1].map(idx => (
          <text
            key={idx}
            x={idx * stepX}
            y={h + 20}
            fontSize="10"
            fill="#94A3B8"
            textAnchor={idx === 0 ? "start" : idx === data.length - 1 ? "end" : "middle"}
            fontWeight="500"
          >
            {data[idx].date}
          </text>
        ))}
      </svg>
    </div>
  );
}

interface DonutChartProps {
  data: { name: string; value: number }[];
  colorMap?: Record<string, string>;
  title?: string;
  size?: number;
}

/**
 * Donut Chart using CSS conic-gradient with hover effects
 */
export function DonutChart({ data, colorMap, title = '', size = 170 }: DonutChartProps) {
  const defaultColors = ['#FF7A00', '#1D4ED8', '#059669', '#DC2626', '#64748B', '#0EA5E9', '#D97706', '#EC4899'];

  if (!data || data.length === 0 || data.every(d => d.value === 0)) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 24 }}>
        <div style={{ width: size, height: size, borderRadius: '50%', background: '#F1F5F9', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <span style={{ fontSize: 28, fontWeight: 800, color: '#0F172A' }}>0</span>
          <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94A3B8', fontWeight: 700 }}>TOPLAM</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 160 }}>
          {data.map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: colorMap?.[d.name] || defaultColors[i % defaultColors.length] }} />
              <span style={{ fontSize: 12, color: '#475569', fontWeight: 500 }}>{d.name}</span>
              <span style={{ fontSize: 12, color: '#0F172A', fontWeight: 700, marginLeft: 'auto' }}>{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const total = data.reduce((a, d) => a + d.value, 0);
  const validData = data.filter(d => d.value > 0);

  // Calculate conic-gradient stops
  let currentAngle = 0;
  const gradientStops = validData.map((d, i) => {
    const sliceAngle = (d.value / total) * 360;
    const start = currentAngle;
    const end = currentAngle + sliceAngle;
    currentAngle = end;
    const color = colorMap?.[d.name] || defaultColors[i % defaultColors.length];
    return `${color} ${start}deg ${end}deg`;
  }).join(', ');

  const conicGradient = `conic-gradient(${gradientStops})`;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28, width: '100%', height: '100%', minHeight: 200 }}>
      {/* Donut left side */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{ width: size, height: size, borderRadius: '50%', background: conicGradient, position: 'relative' }}>
          {/* Center white circle */}
          <div style={{
            position: 'absolute',
            top: 30,
            left: 30,
            right: 30,
            bottom: 30,
            borderRadius: '50%',
            background: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>{total.toLocaleString()}</span>
            {title && <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94A3B8', fontWeight: 700, marginTop: 2 }}>{title}</span>}
          </div>
        </div>
      </div>

      {/* Labels on RIGHT side */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 180 }}>
        {validData.map((d, i) => {
          const color = colorMap?.[d.name] || defaultColors[i % defaultColors.length];
          const pct = ((d.value / total) * 100).toFixed(1);
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: color, flexShrink: 0, boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }} />
              <span style={{ fontSize: 13, color: '#334155', fontWeight: 500, whiteSpace: 'nowrap' }}>{d.name}</span>
              <span style={{ fontSize: 13, color: '#94A3B8', marginLeft: 'auto', fontWeight: 500 }}>{d.value} ({pct}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface FunnelChartProps {
  data: { name: string; value: number; conversion?: number }[];
  colors?: string[];
  labelWidth?: number;
}

/**
 * Funnel Chart with conversion rates and hover details
 */
export function FunnelChart({
  data,
  colors = ['#FF7A00', '#1D4ED8', '#059669', '#DC2626', '#64748B', '#0EA5E9', '#D97706', '#EC4899'],
  labelWidth = 140
}: FunnelChartProps) {
  if (!data || data.length === 0 || data.every(d => d.value === 0)) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 16 }}>
        <div style={{ color: '#94A3B8', fontSize: 13 }}>Funnel verisi yok</div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const itemHeight = 52;
  const gap = 10;
  const funnelWidth = 320;
  const minWidth = 60;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, width: '100%', height: '100%', minHeight: 300 }}>
      {/* Left: Funnel visualization */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: gap,
        position: 'relative',
        flexShrink: 0
      }}>
        {data.map((d, i) => {
          const width = Math.max((d.value / maxValue) * funnelWidth, minWidth);
          const color = colors[i % colors.length];
          const pctOfMax = ((d.value / maxValue) * 100).toFixed(1);
          const prevValue = i === 0 ? maxValue : data[i - 1].value;
          const conversion = prevValue > 0 ? ((d.value / prevValue) * 100).toFixed(1) : 100;

          return (
            <div key={i} style={{
              width: width,
              height: itemHeight,
              background: `linear-gradient(90deg, ${color}DD, ${color}AA)`,
              borderRadius: i === 0 ? '8px 8px 0 0' : i === data.length - 1 ? '0 0 8px 8px' : 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: `1px solid ${color}40`
            }}>
              {/* Funnel shape using clip-path for trapezoid effect */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                clipPath: i === 0
                  ? `polygon(10% 0, 90% 0, 100% 100%, 0% 100%)`
                  : i === data.length - 1
                  ? `polygon(20% 0, 80% 0, 90% 100%, 10% 100%)`
                  : `polygon(15% 0, 85% 0, 90% 100%, 10% 100%)`,
                background: `linear-gradient(90deg, ${color}EE, ${color}AA)`,
                zIndex: -1,
                borderRadius: i === 0 ? '8px 8px 0 0' : i === data.length - 1 ? '0 0 8px 8px' : 0,
              }} />
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '0 16px',
                color: '#FFFFFF',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
              }}>
                <span style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>{d.name}</span>
                <span style={{ fontSize: 12, fontWeight: 700 }}>{d.value.toLocaleString()} ({pctOfMax}%)</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Right: Details and conversion rates */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: gap,
        minWidth: 200,
        maxWidth: 280,
        flex: 1
      }}>
        {data.map((d, i) => {
          const color = colors[i % colors.length];
          const prevValue = i === 0 ? maxValue : data[i - 1].value;
          const conversionRate = prevValue > 0 ? ((d.value / prevValue) * 100).toFixed(1) : 100;
          const dropRate = prevValue > 0 ? (100 - (d.value / prevValue) * 100).toFixed(1) : 0;

          return (
            <div key={i} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              padding: '10px 12px',
              background: '#FAFAFA',
              borderRadius: 8,
              borderLeft: `4px solid ${color}`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{d.name}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color }}>{d.value.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                <span style={{ color: '#64748B' }}>Toplamdan: </span>
                <span style={{ color: '#0F172A', fontWeight: 500 }}>{((d.value / maxValue) * 100).toFixed(1)}%</span>
                {i > 0 && (
                  <>
                    <span style={{ color: '#94A3B8' }}>|</span>
                    <span style={{ color: '#64748B' }}>Önceki adım: </span>
                    <span style={{ color: '#059669', fontWeight: 600 }}>{conversionRate}%</span>
                    <span style={{ color: '#DC2626', fontWeight: 500, fontSize: 10 }}>▼ {dropRate}%</span>
                  </>
                )}
              </div>
              <div style={{
                height: 4,
                background: '#E2E8F0',
                borderRadius: 2,
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${((d.value / maxValue) * 100)}%`,
                  height: '100%',
                  background: color,
                  borderRadius: 2,
                  transition: 'width 0.5s ease-out'
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Modern KPI Card for ERP dashboards
 */
export function KPICard({
  title,
  value,
  subtitle,
  color,
  icon,
  trend,
  trendLabel
}: {
  title: string;
  value: any;
  subtitle?: string;
  color: string;
  icon?: React.ReactNode;
  trend?: number;
  trendLabel?: string;
}) {
  return (
    <div style={{
      borderRadius: 12,
      border: '1px solid #E2E8F0',
      background: '#FFFFFF',
      padding: '16px',
      boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
      transition: 'box-shadow 0.2s ease, transform 0.2s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: '#64748B',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '70%'
        }}>
          {title}
        </div>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          background: `${color}15`,
          color: color
        }}>
          {icon}
        </div>
      </div>
      <div style={{
        fontSize: 22,
        fontWeight: 700,
        color: color,
        lineHeight: 1.2,
        marginBottom: 4
      }}>
        {value}
      </div>
      {subtitle && (
        <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500 }}>
          {subtitle}
        </div>
      )}
      {trend !== undefined && trendLabel && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          marginTop: 8,
          paddingTop: 8,
          borderTop: '1px solid #F1F5F9'
        }}>
          <span style={{
            fontSize: 11,
            fontWeight: 600,
            color: trend >= 0 ? '#059669' : '#DC2626'
          }}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
          </span>
          <span style={{ fontSize: 11, color: '#94A3B8' }}>{trendLabel}</span>
        </div>
      )}
    </div>
  );
}