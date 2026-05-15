"use client";
import React, { useState } from "react";

export const DONUT_PALETTE = ["#FF9900","#0E7490","#4338CA","#15803D","#DC2626","#6F37B0","#B45309","#1D4ED8","#7A6A50"];

export function Donut({ data, total, centerLabel, centerValue, size = 140, strokeWidth = 22 }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const cx = size / 2, cy = size / 2;
  const ttl = total ?? data.reduce((s,d) => s + d.value, 0);

  let acc = 0;
  return (
    <svg className="donut-svg" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg-sub)" strokeWidth={strokeWidth} />
      {ttl > 0 && data.map((d, i) => {
        const pct = ttl ? d.value / ttl : 0;
        if (pct === 0) return null; // don't render 0-value slices
        
        const dash = pct * c;
        const offset = -acc * c;
        const gap = data.filter(item => item.value > 0).length > 1 ? Math.min(2.5, dash) : 0;
        
        const isHovered = hoveredIdx === i;
        const isFaded = hoveredIdx !== null && hoveredIdx !== i;

        const el = (
          <circle key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={d.color || DONUT_PALETTE[i % DONUT_PALETTE.length]}
            strokeWidth={isHovered ? strokeWidth + 2 : strokeWidth}
            strokeDasharray={`${Math.max(0, dash - gap)} ${c}`}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ 
              transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)", 
              cursor: "pointer",
              opacity: isFaded ? 0.3 : 1
            }}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <title>{d.label}: {d.value} ({Math.round(pct * 100)}%)</title>
          </circle>
        );
        acc += pct;
        return el;
      })}
      {centerValue !== undefined && (
        <>
          <text x={cx} y={cy + 2} textAnchor="middle" className="donut-center" style={{ fontSize: 17, fill: "var(--ink)", fontWeight: 600 }}>
            {hoveredIdx !== null ? data[hoveredIdx].value : centerValue}
          </text>
          {centerLabel && (
            <text x={cx} y={cy + 18} textAnchor="middle" style={{ fontSize: 9, fill: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {hoveredIdx !== null ? data[hoveredIdx].label.substring(0, 12) : centerLabel}
            </text>
          )}
        </>
      )}
    </svg>
  );
}

export function DonutWithLegend({ data, centerValue, centerLabel, valueFmt = (v) => v }) {
  const ttl = data.reduce((s,d) => s + d.value, 0);
  return (
    <div className="donut-wrap">
      <Donut data={data} total={ttl} centerValue={centerValue} centerLabel={centerLabel} />
      <div className="donut-legend">
        {data.map((d, i) => (
          <div key={i} className="donut-leg-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '12px' }}>
            <span className="sw" style={{ width: '8px', height: '8px', borderRadius: '50%', background: d.color || DONUT_PALETTE[i % DONUT_PALETTE.length] }}></span>
            <span className="ll" style={{ color: 'var(--ink)', flex: 1 }}>{d.label}</span>
            <span className="vv" style={{ fontWeight: 500, fontFamily: "'IBM Plex Mono', monospace" }}>{valueFmt(d.value)}</span>
            <span className="pp" style={{ color: 'var(--muted)', width: '32px', textAlign: 'right' }}>{ttl ? Math.round((d.value / ttl) * 100) : 0}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
