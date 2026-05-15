"use client";
import React from "react";

export const DONUT_PALETTE = ["#FF9900","#0E7490","#4338CA","#15803D","#DC2626","#6F37B0","#B45309","#1D4ED8","#7A6A50"];

export function Donut({ data, total, centerLabel, centerValue, size = 140, strokeWidth = 22 }) {
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const cx = size / 2, cy = size / 2;
  const ttl = total ?? data.reduce((s,d) => s + d.value, 0);

  let acc = 0;
  return (
    <svg className="donut-svg" width={size} height={size}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg-sub)" strokeWidth={strokeWidth} />
      {data.map((d, i) => {
        const pct = ttl ? d.value / ttl : 0;
        const dash = pct * c;
        const offset = -acc * c;
        const el = (
          <circle key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={d.color || DONUT_PALETTE[i % DONUT_PALETTE.length]}
            strokeWidth={strokeWidth}
            strokeDasharray={`${dash} ${c - dash}`}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ transition: "stroke-dasharray 0.4s" }}
          />
        );
        acc += pct;
        return el;
      })}
      {centerValue !== undefined && (
        <>
          <text x={cx} y={cy + 2} textAnchor="middle" className="donut-center" style={{ fontSize: 17, fill: "var(--ink)" }}>{centerValue}</text>
          {centerLabel && <text x={cx} y={cy + 18} textAnchor="middle" style={{ fontSize: 9, fill: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{centerLabel}</text>}
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
          <div key={i} className="donut-leg-row">
            <span className="sw" style={{ background: d.color || DONUT_PALETTE[i % DONUT_PALETTE.length] }}></span>
            <span className="ll">{d.label}</span>
            <span className="vv">{valueFmt(d.value)}</span>
            <span className="pp">{ttl ? Math.round((d.value / ttl) * 100) : 0}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
