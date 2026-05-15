"use client";
import React, { useState, useMemo } from "react";
import { StatusBadge, PrioBadge, CatPill, Card, CardHead, Select, PulseStrip, LaneItem, HoverPreview, HoverableRow, Kpi, Donut, DonutWithLegend, BarChart, Modal, Switch, DONUT_PALETTE } from "../components";
import { fmtMoney, fmtMoneyShort, fmtDate, fmtDateFull, daysBetween, ticketCost, isOpen, isOverdue, initials, vendorScore, groupTickets } from "../lib/utils";
import { BRANCHES, VENDORS, AGENTS, CATEGORIES, STATUSES, PRIORITIES, MAINT_TYPES, TICKETS } from "../lib/data";

// ── OPS dashboard (the decision inbox) ──────────────────
function OpsView({ tickets, branches, vendors, agents, onOpenTicket, onGotoView, onOpenBranch }) {
  const branchById = useMemo(() => Object.fromEntries(branches.map(b => [b.id, b])), [branches]);
  const vendorById = useMemo(() => Object.fromEntries(vendors.map(v => [v.id, v])), [vendors]);
  const agentById  = useMemo(() => Object.fromEntries(agents.map(a => [a.id, a])), [agents]);

  const newTickets       = tickets.filter(t => t.status === "New");
  const waitingApproval  = tickets.filter(t => t.status === "Waiting Approval");
  const stuck            = tickets.filter(t => isOpen(t) && t.status !== "New" && t.status !== "Waiting Approval" && daysBetween(t.createdDate) >= 4);

  const openTotal   = tickets.filter(isOpen).length;
  const monthSpend  = tickets
    .filter(t => (t.createdDate || "").startsWith("2026-05") || (t.createdDate || "").startsWith("2026-04"))
    .reduce((s,t) => s + ticketCost(t), 0);
  const closedThis  = tickets.filter(t => t.status === "Closed");
  const avgClose    = closedThis.length
    ? Math.round((closedThis.reduce((s,t) => s + daysBetween(t.createdDate, t.closedDate), 0) / closedThis.length) * 10) / 10
    : 0;
  const slaBreach   = tickets.filter(isOverdue).length;

  const now = new Date("2026-05-15T09:14:00");
  const hour = now.getHours();
  const greeting = hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : "Evening";

  // donut: open tickets by category
  const openByCat = Object.keys(CATEGORIES).map(cat => ({
    label: cat,
    value: tickets.filter(t => t.category === cat && isOpen(t)).length,
    color: CATEGORIES[cat].color,
  })).filter(d => d.value > 0);

  return (
    <div className="canvas-inner">
      <div className="ops-header">
        <div>
          <h1 className="ops-greet"><em>{greeting},</em> Khalifa.</h1>
          <div className="ops-sub">
            <strong style={{ color: "var(--ink)" }}>{newTickets.length + waitingApproval.length} items</strong> need a decision · <strong style={{ color: "var(--ink)" }}>{slaBreach}</strong> running long
          </div>
        </div>
        <div className="ops-now">
          <span className="time">{now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>
          {now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
        </div>
      </div>

      <PulseStrip branches={branches} tickets={tickets} onBranchClick={onOpenBranch} />

      <div className="lanes">
        <div className="lane">
          <div className="lane-head">
            <div className="lane-tag triage"><span className="dot"></span> Needs triage</div>
            <div className="lane-title">
              <span className={`num ${newTickets.length === 0 ? "zero" : ""}`}>{newTickets.length}</span>
              <span className="lbl">new · unassigned</span>
            </div>
          </div>
          <div className="lane-body">
            {newTickets.length === 0
              ? <div className="lane-empty">Inbox zero. ✶</div>
              : newTickets.slice(0, 5).map(t => (
                  <LaneItem key={t.id} ticket={t} branch={branchById[t.branchId]} vendor={vendorById[t.vendorId]} agent={agentById[t.agentId]} onClick={onOpenTicket} />
                ))}
          </div>
        </div>

        <div className="lane">
          <div className="lane-head">
            <div className="lane-tag approve"><span className="dot"></span> Awaiting your approval</div>
            <div className="lane-title">
              <span className={`num ${waitingApproval.length === 0 ? "zero" : ""}`}>{waitingApproval.length}</span>
              <span className="lbl">cost sign-off</span>
            </div>
          </div>
          <div className="lane-body">
            {waitingApproval.length === 0
              ? <div className="lane-empty">Nothing pending.</div>
              : waitingApproval.slice(0, 5).map(t => (
                  <LaneItem key={t.id} ticket={t} branch={branchById[t.branchId]} vendor={vendorById[t.vendorId]} agent={agentById[t.agentId]} onClick={onOpenTicket} />
                ))}
          </div>
        </div>

        <div className="lane">
          <div className="lane-head">
            <div className="lane-tag stuck"><span className="dot"></span> Stuck &gt; 4 days</div>
            <div className="lane-title">
              <span className={`num ${stuck.length === 0 ? "zero" : ""}`}>{stuck.length}</span>
              <span className="lbl">follow-up vendor</span>
            </div>
          </div>
          <div className="lane-body">
            {stuck.length === 0
              ? <div className="lane-empty">Nothing stuck.</div>
              : stuck.slice(0, 5).map(t => (
                  <LaneItem key={t.id} ticket={t} branch={branchById[t.branchId]} vendor={vendorById[t.vendorId]} agent={agentById[t.agentId]} onClick={onOpenTicket} />
                ))}
          </div>
        </div>
      </div>

      <div className="cols-4" style={{ marginBottom: 22 }}>
        <Kpi label="Open tickets" value={openTotal} sub={`across ${branches.filter(b => tickets.some(t => t.branchId === b.id && isOpen(t))).length} sites`} />
        <Kpi label="This month spend" value={fmtMoneyShort(monthSpend)} sub="parts + visits" />
        <Kpi label="Avg time to close" value={avgClose} unit="days" sub={`from ${closedThis.length} closed`} />
        <Kpi label="Running over 7 days" value={slaBreach} sub={slaBreach === 0 ? "all on track" : "needs attention"} />
      </div>

      <div className="cols-2">
        <div className="stack">
          <Card>
            <CardHead title="Live tickets" icon="ti-activity" action={<button className="btn btn-sm btn-ghost" onClick={() => onGotoView("tickets")}>All tickets <i className="ti ti-arrow-right"></i></button>} />
            <table className="tbl">
              <thead><tr>
                <th>Ticket</th><th>Title</th><th>Branch</th><th>Status</th><th style={{ textAlign: "right" }}>Cost</th>
              </tr></thead>
              <tbody>
                {tickets.slice(0, 7).map(t => (
                  <HoverableRow key={t.id} ticket={t} branch={branchById[t.branchId]} vendor={vendorById[t.vendorId]} agent={agentById[t.agentId]} onClick={() => onOpenTicket(t)}>
                    <td><span className="code">{t.code}</span></td>
                    <td><div className="title-cell">{t.title}</div></td>
                    <td className="muted">{branchById[t.branchId]?.name || "—"}</td>
                    <td><StatusBadge status={t.status} /></td>
                    <td className="num" style={{ textAlign: "right" }}>{ticketCost(t) ? fmtMoney(ticketCost(t)) : "—"}</td>
                  </HoverableRow>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        <div className="stack">
          <div className="intro-panel">
            <div className="ip-lbl">Today's brief</div>
            <h4>Highest-impact item right now</h4>
            <p>
              {newTickets.find(t => t.priority === "High")?.title ||
               tickets.find(t => t.priority === "High" && isOpen(t))?.title ||
               "No high-priority items right now. Nice."}
            </p>
            <div className="mini-stats">
              <div>
                <div className="ms-l">Active vendors</div>
                <div className="ms-v">{new Set(tickets.filter(isOpen).map(t => t.vendorId).filter(Boolean)).size}</div>
              </div>
              <div>
                <div className="ms-l">Branches on alert</div>
                <div className="ms-v">{branches.filter(b => tickets.some(t => t.branchId === b.id && isOpen(t) && t.priority === "High")).length}</div>
              </div>
            </div>
          </div>

          {openByCat.length > 0 && (
            <Card>
              <CardHead title="Open by category" />
              <DonutWithLegend
                data={openByCat}
                centerValue={openTotal}
                centerLabel="open"
              />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}



export { OpsView };
