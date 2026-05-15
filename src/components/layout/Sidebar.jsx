"use client";
import React from "react";

export function Sidebar({ railItems, railActive, goto }) {
  return (
    <aside className="rail">
      <div className="rail-logo" title="Amazon Now Egypt">a.</div>
      {railItems.map(item => (
        <div key={item.key}
             className={`rail-item ${railActive === item.key ? "active" : ""}`}
             title={item.label}
             onClick={() => goto(item.key)}>
          <i className={`ti ${item.icon}`}></i>
          {item.pip && <span className="pip"></span>}
        </div>
      ))}
      <div className="rail-spacer"></div>
      <div className="rail-divider"></div>
      <div className={`rail-item ${railActive === "settings" ? "active" : ""}`}
           title="Settings"
           onClick={() => goto("settings")}>
        <i className="ti ti-settings"></i>
      </div>
      <div className="rail-item" title="Khalifa" style={{ background: "#FF9900", color: "#14130F", fontWeight: 700, fontSize: 13 }}>
        MK
      </div>
    </aside>
  );
}
