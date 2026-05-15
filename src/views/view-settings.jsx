"use client";
import React, { useState } from "react";
import { Card, CardHead } from "../components";
import { CATEGORIES } from "../lib/data";

function SettingsView({ branches, vendors, agents }) {
  const [tab, setTab] = useState("branches");
  const items = tab === "branches" ? branches : tab === "vendors" ? vendors : agents;

  return (
    <div className="canvas-inner" style={{ maxWidth: 900 }}>
      <div style={{ marginBottom: 18 }}>
        <div className="section-eyebrow">Settings</div>
        <h1 className="section-title">Configure your workspace</h1>
      </div>

      <div className="tabs">
        {[["branches",`Branches`],["vendors",`Vendors`],["agents",`Agents`]].map(([k,l]) => (
          <div key={k} className={`tab ${tab===k?"active":""}`} onClick={() => setTab(k)}>
            {l} <span className="num">{k === "branches" ? branches.length : k === "vendors" ? vendors.length : agents.length}</span>
          </div>
        ))}
      </div>

      <Card>
        <CardHead title={tab[0].toUpperCase() + tab.slice(1)} action={<button className="btn btn-sm"><i className="ti ti-plus"></i> Add</button>} />
        <table className="tbl">
          <thead><tr>
            <th>Name</th>
            {tab === "branches" && <><th>Code</th><th>Zone</th><th>Type</th><th>Manager</th></>}
            {tab === "vendors"  && <><th>Specialty</th><th>Contract</th><th>Contact</th></>}
            {tab === "agents"   && <><th>Role</th><th>Coverage</th></>}
          </tr></thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td style={{ fontWeight: 500 }}>{item.name}</td>
                {tab === "branches" && <>
                  <td><span className="code">{item.code}</span></td>
                  <td className="muted">{item.zone}</td>
                  <td className="muted">{item.type}</td>
                  <td className="muted">{item.manager}</td>
                </>}
                {tab === "vendors" && <>
                  <td className="muted">{item.specialty}</td>
                  <td className="muted">{item.contractType}</td>
                  <td className="mono muted" style={{ fontSize: 11 }}>{item.contact}</td>
                </>}
                {tab === "agents" && <>
                  <td className="muted">{item.role}</td>
                  <td className="muted">{item.zone}</td>
                </>}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div style={{ marginTop: 22 }}>
        <div className="section-eyebrow">Categories & types</div>
        <h2 className="section-title">Ticket taxonomy</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
          {Object.entries(CATEGORIES).map(([cat, cfg]) => (
            <Card key={cat}>
              <div style={{ padding: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <i className={`ti ${cfg.icon}`} style={{ fontSize: 18, color: cfg.color }}></i>
                  <strong style={{ fontSize: 13 }}>{cat}</strong>
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.7 }}>
                  {cfg.types.join(" · ")}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export { SettingsView };
