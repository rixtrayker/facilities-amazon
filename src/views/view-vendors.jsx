"use client";
import React, { useState, useMemo } from "react";
import { StatusBadge, PrioBadge, CatPill, Card, CardHead, Select, PulseStrip, LaneItem, HoverPreview, HoverableRow, Kpi, Donut, DonutWithLegend, BarChart, Modal, Switch, DONUT_PALETTE } from "../components";
import { fmtMoney, fmtMoneyShort, fmtDate, fmtDateFull, daysBetween, ticketCost, isOpen, isOverdue, initials, vendorScore, groupTickets } from "../lib/utils";
import { BRANCHES, VENDORS, AGENTS, CATEGORIES, STATUSES, PRIORITIES, MAINT_TYPES, TICKETS } from "../lib/data";

// ── VENDORS scorecard ──────────────────────────────────
function VendorsView({ vendors, tickets, branches }) {
  const rows = vendors.map(v => ({ vendor: v, ...vendorScore(v, tickets) })).sort((a,b) => b.spend - a.spend);
  const maxSpend = Math.max(...rows.map(r => r.spend), 1);
  const totalSpend = rows.reduce((s,r) => s + r.spend, 0);

  // donut: vendor share of total spend
  const donutData = rows
    .filter(r => r.spend > 0)
    .map((r, i) => ({ label: r.vendor.name, value: r.spend, color: DONUT_PALETTE[i % DONUT_PALETTE.length] }));

  return (
    <div className="canvas-inner">
      <div style={{ marginBottom: 22 }}>
        <div className="section-eyebrow">Vendor performance</div>
        <h1 className="section-title">{vendors.length} active vendors · {fmtMoneyShort(totalSpend)} all-time</h1>
      </div>

      <div className="cols-2" style={{ marginBottom: 22 }}>
        <Card>
          <CardHead title="Scorecard" icon="ti-list-numbers" />
          <div className="vendor-row" style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--line)" }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", color: "var(--muted)", textTransform: "uppercase" }}>Vendor</div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", color: "var(--muted)", textTransform: "uppercase" }}>Share of spend</div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", color: "var(--muted)", textTransform: "uppercase", textAlign: "right" }}>Tickets</div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", color: "var(--muted)", textTransform: "uppercase", textAlign: "right" }}>Avg close</div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", color: "var(--muted)", textTransform: "uppercase", textAlign: "right" }}>Spend</div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", color: "var(--muted)", textTransform: "uppercase", textAlign: "right" }}>Grade</div>
          </div>
          {rows.map(r => (
            <div key={r.vendor.id} className="vendor-row">
              <div className="v-name">
                {r.vendor.name}
                <div className="v-sub">{r.vendor.specialty} · {r.vendor.contractType}</div>
              </div>
              <div className="v-bar"><span style={{ width: `${(r.spend / maxSpend) * 100}%` }}></span></div>
              <div className="v-num">{r.tickets}</div>
              <div className="v-num">{r.avg ? `${r.avg}d` : "—"}</div>
              <div className="v-num">{fmtMoneyShort(r.spend)}</div>
              <div style={{ textAlign: "right" }}><span className={`v-grade ${r.grade}`}>{r.grade}</span></div>
            </div>
          ))}
        </Card>

        <div className="stack">
          <Card>
            <CardHead title="Share of spend" icon="ti-chart-pie" />
            <DonutWithLegend data={donutData} centerValue={fmtMoneyShort(totalSpend).replace("EGP ","")} centerLabel="EGP" valueFmt={fmtMoneyShort} />
          </Card>
        </div>
      </div>
    </div>
  );
}



export { VendorsView };
