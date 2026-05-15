"use client";
import React from "react";

export function BarChart({ data, valueFmt = (v) => v, dark = false }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="bar-chart">
      <div className="bc-axis">
        {data.map((d, i) => (
          <div className="bc-col" key={i} title={`${d.label}: ${valueFmt(d.value)}`}>
            <div className="bc-val">{d.value > 0 ? valueFmt(d.value) : ""}</div>
            <div className={`bc-bar ${dark ? "ink" : ""}`} style={{ height: `${(d.value / max) * 100}%` }}></div>
          </div>
        ))}
      </div>
      <div className="bc-labels">
        {data.map((d, i) => <div className="bc-label" key={i}>{d.label}</div>)}
      </div>
    </div>
  );
}
