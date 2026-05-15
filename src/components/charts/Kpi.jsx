"use client";
import React from "react";

export function Kpi({ label, value, unit, sub, delta }) {
  return (
    <div className="kpi">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">
        {value}
        {unit && <span className="unit">{unit}</span>}
      </div>
      {sub && <div className="kpi-sub">{sub}</div>}
      {delta && (
        <div className="kpi-sub">
          <span className={delta.dir === "up" ? "delta-up" : "delta-down"}>
            <i className={`ti ti-${delta.dir === "up" ? "trending-up" : "trending-down"}`}></i>
            {delta.value}
          </span>
          <span>{delta.label}</span>
        </div>
      )}
    </div>
  );
}
