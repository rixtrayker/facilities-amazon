"use client";
import React from "react";
import { isOpen } from "../../lib/utils";

export function PulseStrip({ branches, tickets, onBranchClick }) {
  const stations = branches.filter(b => b.type === "Amazon Now Station");
  return (
    <div className="pulse">
      <div className="pulse-label"><span className="live-dot"></span>Live · {stations.length} stations</div>
      <div className="pulse-stations">
        {stations.map(b => {
          const open = tickets.filter(t => t.branchId === b.id && isOpen(t));
          const crit = open.filter(t => t.priority === "High").length;
          const cls  = crit > 0 ? "crit" : open.length > 0 ? "warn" : "ok";
          return (
            <div key={b.id} className={`pulse-station ${cls}`} onClick={() => onBranchClick(b.id)} title={b.name}>
              <div className="ps-bar"></div>
              <div className="ps-name">{b.name}</div>
              <div className="ps-stat">
                {open.length === 0 ? "all clear" : `${open.length} open${crit > 0 ? ` · ${crit} hi` : ""}`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
