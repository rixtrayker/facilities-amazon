"use client";
import React from "react";

export function Topbar({ crumbs, openCount, needsDecision, inMaintenanceCount, newTicket }) {
  return (
    <header className="topbar">
      <div className="crumbs">{crumbs}</div>

      <div className="ticker">
        <div className="ticker-item"><span className="tdot" style={{ background: "var(--ok)" }}></span>{openCount} open tickets</div>
        <div className="ticker-item"><span className="tdot" style={{ background: "var(--accent)" }}></span>{needsDecision} need your call</div>
        <div className="ticker-item"><span className="tdot" style={{ background: "var(--info)" }}></span>{inMaintenanceCount} vendors on-site</div>
      </div>

      <div className="search">
        <i className="ti ti-search"></i>
        <input placeholder="Search anything…" />
        <span className="kbd">⌘K</span>
      </div>

      <button className="btn btn-accent" onClick={newTicket}>
        <i className="ti ti-plus"></i> New ticket
      </button>
    </header>
  );
}
