"use client";
import React from "react";
import { STATUSES, PRIORITIES, CATEGORIES } from "../../lib/data";

export function StatusBadge({ status, large }) {
  const cfg = STATUSES.find(s => s.key === status) || STATUSES[0];
  return (
    <span className={`badge ${large ? "badge-lg" : ""} ${cfg.cls}`}>
      <span className="dot"></span>
      {status}
    </span>
  );
}

export function PrioBadge({ priority, large }) {
  const cfg = PRIORITIES.find(p => p.key === priority) || PRIORITIES[1];
  return <span className={`badge ${large ? "badge-lg" : ""} ${cfg.cls}`}>{priority}</span>;
}

export function CatPill({ category }) {
  const cfg = CATEGORIES[category];
  if (!cfg) return null;
  return (
    <span className="cat-pill" style={{ color: cfg.color, background: cfg.color + "15" }}>
      <i className={`ti ${cfg.icon}`}></i>
      {category}
    </span>
  );
}
