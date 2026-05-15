"use client";
import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { daysBetween, ticketCost } from "../../lib/utils";
import { fmtMoney } from "../../lib/utils";
import { StatusBadge, PrioBadge } from "../ui/Badges";

export function HoverPreview({ ticket, branch, vendor, agent, pos }) {
  if (typeof document === 'undefined') return null;
  return createPortal(
    <div style={{
      position: "fixed",
      left: pos.left, top: pos.top,
      width: 320,
      background: "var(--surface)",
      border: "1px solid var(--line)",
      borderRadius: 10,
      boxShadow: "var(--shadow-lg)",
      padding: 14,
      zIndex: 300,
      pointerEvents: "none",
    }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
        <span className="mono" style={{ fontSize: 11, background: "var(--bg-sub)", padding: "2px 7px", borderRadius: 4, color: "var(--muted)" }}>{ticket.code}</span>
        <StatusBadge status={ticket.status} />
        <PrioBadge priority={ticket.priority} />
      </div>
      <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 16, lineHeight: 1.25, marginBottom: 6, color: "var(--ink)" }}>{ticket.title}</div>
      <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5, marginBottom: 10 }}>{ticket.description}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 11, color: "var(--muted)" }}>
        <div><span style={{ color: "var(--muted-2)" }}>Branch · </span><span style={{ color: "var(--ink-2)" }}>{branch?.name || "—"}</span></div>
        <div><span style={{ color: "var(--muted-2)" }}>Vendor · </span><span style={{ color: "var(--ink-2)" }}>{vendor?.name || "—"}</span></div>
        <div><span style={{ color: "var(--muted-2)" }}>Agent · </span><span style={{ color: "var(--ink-2)" }}>{agent?.name || "Unassigned"}</span></div>
        <div><span style={{ color: "var(--muted-2)" }}>Age · </span><span style={{ color: "var(--ink-2)" }} className="mono">{daysBetween(ticket.createdDate)}d</span></div>
        <div style={{ gridColumn: "1 / -1", paddingTop: 8, borderTop: "1px dashed var(--line)", marginTop: 4 }}>
          <span style={{ color: "var(--muted-2)" }}>Cost · </span>
          <span className="mono" style={{ color: "var(--accent-ink)", fontWeight: 600 }}>{ticketCost(ticket) ? fmtMoney(ticketCost(ticket)) : "—"}</span>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function LaneItem({ ticket, branch, vendor, agent, onClick }) {
  const [hov, setHov] = useState(false);
  const itemRef = useRef(null);
  const [popPos, setPopPos] = useState(null);

  const onEnter = () => {
    setHov(true);
    if (itemRef.current) {
      const r = itemRef.current.getBoundingClientRect();
      let left = r.right + 8;
      let top = r.top;
      if (left + 320 > window.innerWidth) left = r.left - 328;
      if (top + 280 > window.innerHeight) top = window.innerHeight - 290;
      setPopPos({ left, top });
    }
  };
  const onLeave = () => { setHov(false); setPopPos(null); };

  return (
    <>
      <div ref={itemRef} className="lane-item" onClick={() => onClick(ticket)} onMouseEnter={onEnter} onMouseLeave={onLeave}>
        <div className="li-code mono">{ticket.code.replace("ANW-26-", "")}</div>
        <div className="li-body">
          <div className="li-title">{ticket.title}</div>
          <div className="li-meta">
            {branch?.name || "—"} · {ticket.category} · {daysBetween(ticket.createdDate)}d
          </div>
        </div>
      </div>
      {hov && popPos && <HoverPreview ticket={ticket} branch={branch} vendor={vendor} agent={agent} pos={popPos} />}
    </>
  );
}

export function HoverableRow({ ticket, branch, vendor, agent, onClick, children }) {
  const [hov, setHov] = useState(false);
  const rowRef = useRef(null);
  const [pos, setPos] = useState(null);
  const timer = useRef(null);

  const onEnter = () => {
    timer.current = setTimeout(() => {
      if (rowRef.current) {
        const r = rowRef.current.getBoundingClientRect();
        let left = r.right - 320;
        let top = r.bottom + 8;
        if (top + 280 > window.innerHeight) top = r.top - 280 - 8;
        if (left < 12) left = 12;
        setPos({ left, top });
        setHov(true);
      }
    }, 250);
  };
  const onLeave = () => {
    clearTimeout(timer.current);
    setHov(false); setPos(null);
  };

  return (
    <>
      <tr ref={rowRef} className="clickable" onClick={onClick} onMouseEnter={onEnter} onMouseLeave={onLeave}>
        {children}
      </tr>
      {hov && pos && <HoverPreview ticket={ticket} branch={branch} vendor={vendor} agent={agent} pos={pos} />}
    </>
  );
}
