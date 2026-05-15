const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, 'src');
const COMPONENTS_DIR = path.join(SRC_DIR, 'components');
const UI_DIR = path.join(COMPONENTS_DIR, 'ui');
const CHARTS_DIR = path.join(COMPONENTS_DIR, 'charts');
const DOMAIN_DIR = path.join(COMPONENTS_DIR, 'domain');
const LAYOUT_DIR = path.join(COMPONENTS_DIR, 'layout');

[UI_DIR, CHARTS_DIR, DOMAIN_DIR, LAYOUT_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ── 1. Create src/lib/utils.js
const utilsCode = `export const fmtMoney = (n) => \`EGP \${Math.round(n).toLocaleString()}\`;
export const fmtMoneyShort = (n) => {
  if (n >= 1_000_000) return \`EGP \${(n/1_000_000).toFixed(1)}M\`;
  if (n >= 1_000)     return \`EGP \${(n/1_000).toFixed(1)}K\`;
  return \`EGP \${n}\`;
};
export const fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};
export const fmtDateFull = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};
export const daysBetween = (a, b) => {
  if (!a) return 0;
  const end = b ? new Date(b) : new Date("2026-05-15");
  return Math.max(0, Math.round((end - new Date(a)) / 86400000));
};
export const ticketCost = (t) => (Number(t.sparePartsCost)||0) + (Number(t.visitCost)||0);
export const isOpen = (t) => !["Closed","Rejected","Duplicate"].includes(t.status);
export const isOverdue = (t) => isOpen(t) && daysBetween(t.createdDate) >= 7;
export const initials = (name) => (name||"").split(/\\s+/).map(s => s[0]).filter(Boolean).slice(0,2).join("").toUpperCase();

export function vendorScore(vendor, allTickets) {
  const ts = allTickets.filter(t => t.vendorId === vendor.id);
  const closed = ts.filter(t => t.status === "Closed");
  const avg = closed.length ? closed.reduce((s, t) => s + daysBetween(t.createdDate, t.closedDate), 0) / closed.length : 0;
  const spend = ts.reduce((s, t) => s + ticketCost(t), 0);
  let grade = "—";
  if (closed.length === 0) grade = "—";
  else if (avg < 4)  grade = "A";
  else if (avg < 7)  grade = "B";
  else if (avg < 12) grade = "C";
  else               grade = "D";
  return { tickets: ts.length, closed: closed.length, avg: Math.round(avg * 10) / 10, spend, grade };
}

export function groupTickets(tickets, dimension, lookups) {
  const { branchById, vendorById, agentById } = lookups;
  const map = new Map();
  const keyOf = (t) => {
    switch (dimension) {
      case "branch":   return [t.branchId, branchById[t.branchId]?.name || "—"];
      case "zone":     return [branchById[t.branchId]?.zone || "—", branchById[t.branchId]?.zone || "—"];
      case "category": return [t.category, t.category];
      case "vendor":   return [t.vendorId || 0, vendorById[t.vendorId]?.name || "Unassigned"];
      case "agent":    return [t.agentId  || 0, agentById[t.agentId]?.name  || "Unassigned"];
      case "status":   return [t.status, t.status];
      case "priority": return [t.priority, t.priority];
      case "maint":    return [t.maintenanceType, t.maintenanceType];
      case "month":    {
        const m = (t.createdDate || "").slice(0, 7);
        return [m, m];
      }
      default: return ["—","—"];
    }
  };
  for (const t of tickets) {
    const [key, label] = keyOf(t);
    if (!map.has(key)) map.set(key, { key, label, count: 0, spend: 0, days: 0, closedCount: 0, openCount: 0 });
    const row = map.get(key);
    row.count += 1;
    row.spend += ticketCost(t);
    if (t.status === "Closed") {
      row.closedCount += 1;
      row.days += daysBetween(t.createdDate, t.closedDate);
    }
    if (isOpen(t)) row.openCount += 1;
  }
  return Array.from(map.values()).map(r => ({
    ...r,
    avgDays: r.closedCount ? Math.round((r.days / r.closedCount) * 10) / 10 : null,
  })).sort((a, b) => b.spend - a.spend || b.count - a.count);
}
`;
fs.writeFileSync(path.join(SRC_DIR, 'lib', 'utils.js'), utilsCode);

// ── 2. Badges.jsx
const badgesCode = `"use client";
import React from "react";
import { STATUSES, PRIORITIES, CATEGORIES } from "../../lib/data";

export function StatusBadge({ status, large }) {
  const cfg = STATUSES.find(s => s.key === status) || STATUSES[0];
  return (
    <span className={\`badge \${large ? "badge-lg" : ""} \${cfg.cls}\`}>
      <span className="dot"></span>
      {status}
    </span>
  );
}

export function PrioBadge({ priority, large }) {
  const cfg = PRIORITIES.find(p => p.key === priority) || PRIORITIES[1];
  return <span className={\`badge \${large ? "badge-lg" : ""} \${cfg.cls}\`}>{priority}</span>;
}

export function CatPill({ category }) {
  const cfg = CATEGORIES[category];
  if (!cfg) return null;
  return (
    <span className="cat-pill" style={{ color: cfg.color, background: cfg.color + "15" }}>
      <i className={\`ti \${cfg.icon}\`}></i>
      {category}
    </span>
  );
}
`;
fs.writeFileSync(path.join(UI_DIR, 'Badges.jsx'), badgesCode);

// ── 3. Card.jsx
const cardCode = `"use client";
import React from "react";

export function Card({ children, className = "" }) {
  return <div className={\`card \${className}\`}>{children}</div>;
}

export function CardHead({ title, count, urgent, action, icon }) {
  return (
    <div className="card-head">
      <div className="card-title">
        {icon && <i className={\`ti \${icon}\`} style={{ color: "var(--muted)" }}></i>}
        {title}
        {count !== undefined && <span className={\`count \${urgent ? "urgent" : ""}\`}>{count}</span>}
      </div>
      {action}
    </div>
  );
}
`;
fs.writeFileSync(path.join(UI_DIR, 'Card.jsx'), cardCode);

// ── 4. Select.jsx
const selectCode = `"use client";
import React, { useState, useEffect, useRef } from "react";

export function Select({ value, onChange, options, placeholder = "Select…", prefix, searchable = false, size = "md", icon, allowEmpty = false, emptyLabel = "Any" }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [kbd, setKbd] = useState(0);
  const root = useRef(null);
  const inputRef = useRef(null);

  const norm = (options || []).map(o => typeof o === "string" ? { value: o, label: o } : o);
  const filt = searchable && q
    ? norm.filter(o => (o.label || "").toLowerCase().includes(q.toLowerCase()))
    : norm;

  useEffect(() => {
    const onDoc = (e) => { if (!root.current?.contains(e.target)) { setOpen(false); setQ(""); } };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (open && searchable) setTimeout(() => inputRef.current?.focus(), 30);
    if (!open) { setQ(""); setKbd(0); }
  }, [open, searchable]);

  const choose = (v) => { onChange(v); setOpen(false); setQ(""); };

  const onKey = (e) => {
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setKbd(k => Math.min(k+1, filt.length - (allowEmpty?0:1) )); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setKbd(k => Math.max(k-1, 0)); }
    else if (e.key === "Enter") {
      e.preventDefault();
      const list = allowEmpty ? [{ value: "", label: emptyLabel }, ...filt] : filt;
      if (list[kbd]) choose(list[kbd].value);
    }
    else if (e.key === "Escape") { setOpen(false); }
  };

  const sel = norm.find(o => String(o.value) === String(value));

  return (
    <div ref={root} className={\`cs \${open ? "open" : ""} \${size === "sm" ? "cs-sm" : ""}\`} onKeyDown={onKey}>
      <button type="button" className={\`cs-trigger \${!sel ? "placeholder" : ""}\`} onClick={() => setOpen(o => !o)}>
        {icon && <i className={\`ti \${icon} cs-icon\`}></i>}
        {prefix && <span className="cs-prefix">{prefix}</span>}
        {sel ? (
          <>
            {sel.icon && <i className={\`ti \${sel.icon}\`} style={{ color: sel.color || "var(--muted)" }}></i>}
            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{sel.label}</span>
          </>
        ) : placeholder}
        <i className="ti ti-chevron-down chev"></i>
      </button>
      {open && (
        <div className="cs-menu">
          {searchable && (
            <div className="cs-search">
              <input ref={inputRef} placeholder="Search…" value={q} onChange={e => { setQ(e.target.value); setKbd(0); }} />
            </div>
          )}
          {allowEmpty && (
            <div className={\`cs-opt \${!value ? "selected" : ""} \${kbd === 0 ? "kbd-focus" : ""}\`} onClick={() => choose("")}>
              <i className="ti ti-circle-off cs-opt-icon"></i>
              {emptyLabel}
              {!value && <i className="ti ti-check cs-opt-check"></i>}
            </div>
          )}
          {filt.length === 0 ? (
            <div className="cs-empty">No matches</div>
          ) : filt.map((o, i) => (
            <div key={o.value}
                 className={\`cs-opt \${String(value) === String(o.value) ? "selected" : ""} \${kbd === (allowEmpty?i+1:i) ? "kbd-focus" : ""}\`}
                 onMouseEnter={() => setKbd(allowEmpty?i+1:i)}
                 onClick={() => choose(o.value)}>
              {o.icon && <i className={\`ti \${o.icon} cs-opt-icon\`} style={{ color: o.color || "var(--muted)" }}></i>}
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{o.label}</span>
              {o.sub && <span className="cs-opt-sub">{o.sub}</span>}
              {String(value) === String(o.value) && !o.sub && <i className="ti ti-check cs-opt-check"></i>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
`;
fs.writeFileSync(path.join(UI_DIR, 'Select.jsx'), selectCode);

// ── 5. Modal.jsx & Switch.jsx
const modalCode = `"use client";
import React, { useEffect } from "react";
import { createPortal } from "react-dom";

export function Modal({ open, onClose, title, sub, children, footer, width }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  
  if (!open) return null;
  if (typeof document === 'undefined') return null; // SSR safety
  
  return createPortal(
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ maxWidth: width || 480 }}>
        <div className="modal-head">
          <div>
            <h2 className="modal-title">{title}</h2>
            {sub && <div className="modal-sub">{sub}</div>}
          </div>
          <div className="x" onClick={onClose}><i className="ti ti-x"></i></div>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
`;
fs.writeFileSync(path.join(UI_DIR, 'Modal.jsx'), modalCode);

const switchCode = `"use client";
import React from "react";

export function Switch({ on, onChange, locked }) {
  return (
    <div className={\`switch \${on ? "on" : ""} \${locked ? "locked" : ""}\`} onClick={() => !locked && onChange(!on)} role="switch" aria-checked={on}></div>
  );
}
`;
fs.writeFileSync(path.join(UI_DIR, 'Switch.jsx'), switchCode);

// ── 6. Charts (Kpi, Donut, BarChart)
const kpiCode = `"use client";
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
            <i className={\`ti ti-\${delta.dir === "up" ? "trending-up" : "trending-down"}\`}></i>
            {delta.value}
          </span>
          <span>{delta.label}</span>
        </div>
      )}
    </div>
  );
}
`;
fs.writeFileSync(path.join(CHARTS_DIR, 'Kpi.jsx'), kpiCode);

const donutCode = `"use client";
import React from "react";

export const DONUT_PALETTE = ["#FF9900","#0E7490","#4338CA","#15803D","#DC2626","#6F37B0","#B45309","#1D4ED8","#7A6A50"];

export function Donut({ data, total, centerLabel, centerValue, size = 140, strokeWidth = 22 }) {
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const cx = size / 2, cy = size / 2;
  const ttl = total ?? data.reduce((s,d) => s + d.value, 0);

  let acc = 0;
  return (
    <svg className="donut-svg" width={size} height={size}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg-sub)" strokeWidth={strokeWidth} />
      {data.map((d, i) => {
        const pct = ttl ? d.value / ttl : 0;
        const dash = pct * c;
        const offset = -acc * c;
        const el = (
          <circle key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={d.color || DONUT_PALETTE[i % DONUT_PALETTE.length]}
            strokeWidth={strokeWidth}
            strokeDasharray={\`\${dash} \${c - dash}\`}
            strokeDashoffset={offset}
            transform={\`rotate(-90 \${cx} \${cy})\`}
            style={{ transition: "stroke-dasharray 0.4s" }}
          />
        );
        acc += pct;
        return el;
      })}
      {centerValue !== undefined && (
        <>
          <text x={cx} y={cy + 2} textAnchor="middle" className="donut-center" style={{ fontSize: 17, fill: "var(--ink)" }}>{centerValue}</text>
          {centerLabel && <text x={cx} y={cy + 18} textAnchor="middle" style={{ fontSize: 9, fill: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{centerLabel}</text>}
        </>
      )}
    </svg>
  );
}

export function DonutWithLegend({ data, centerValue, centerLabel, valueFmt = (v) => v }) {
  const ttl = data.reduce((s,d) => s + d.value, 0);
  return (
    <div className="donut-wrap">
      <Donut data={data} total={ttl} centerValue={centerValue} centerLabel={centerLabel} />
      <div className="donut-legend">
        {data.map((d, i) => (
          <div key={i} className="donut-leg-row">
            <span className="sw" style={{ background: d.color || DONUT_PALETTE[i % DONUT_PALETTE.length] }}></span>
            <span className="ll">{d.label}</span>
            <span className="vv">{valueFmt(d.value)}</span>
            <span className="pp">{ttl ? Math.round((d.value / ttl) * 100) : 0}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
`;
fs.writeFileSync(path.join(CHARTS_DIR, 'Donut.jsx'), donutCode);

const barChartCode = `"use client";
import React from "react";

export function BarChart({ data, valueFmt = (v) => v, dark = false }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="bar-chart">
      <div className="bc-axis">
        {data.map((d, i) => (
          <div className="bc-col" key={i} title={\`\${d.label}: \${valueFmt(d.value)}\`}>
            <div className="bc-val">{d.value > 0 ? valueFmt(d.value) : ""}</div>
            <div className={\`bc-bar \${dark ? "ink" : ""}\`} style={{ height: \`\${(d.value / max) * 100}%\` }}></div>
          </div>
        ))}
      </div>
      <div className="bc-labels">
        {data.map((d, i) => <div className="bc-label" key={i}>{d.label}</div>)}
      </div>
    </div>
  );
}
`;
fs.writeFileSync(path.join(CHARTS_DIR, 'BarChart.jsx'), barChartCode);

// ── 7. Domain components
const pulseStripCode = `"use client";
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
            <div key={b.id} className={\`pulse-station \${cls}\`} onClick={() => onBranchClick(b.id)} title={b.name}>
              <div className="ps-bar"></div>
              <div className="ps-name">{b.name}</div>
              <div className="ps-stat">
                {open.length === 0 ? "all clear" : \`\${open.length} open\${crit > 0 ? \` · \${crit} hi\` : ""}\`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
`;
fs.writeFileSync(path.join(DOMAIN_DIR, 'PulseStrip.jsx'), pulseStripCode);

const hoversCode = `"use client";
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
`;
fs.writeFileSync(path.join(DOMAIN_DIR, 'TicketHovers.jsx'), hoversCode);

// ── 8. Re-export in components/index.js (so we don't break everything instantly, but we can refactor later)
const indexCode = `export * from './ui/Badges';
export * from './ui/Card';
export * from './ui/Select';
export * from './ui/Modal';
export * from './ui/Switch';
export * from './charts/Kpi';
export * from './charts/Donut';
export * from './charts/BarChart';
export * from './domain/PulseStrip';
export * from './domain/TicketHovers';
`;
fs.writeFileSync(path.join(COMPONENTS_DIR, 'index.js'), indexCode);

// ── 9. Layout Components (Sidebar and Topbar)
const sidebarCode = `"use client";
import React from "react";

export function Sidebar({ railItems, railActive, goto }) {
  return (
    <aside className="rail">
      <div className="rail-logo" title="Amazon Now Egypt">a.</div>
      {railItems.map(item => (
        <div key={item.key}
             className={\`rail-item \${railActive === item.key ? "active" : ""}\`}
             title={item.label}
             onClick={() => goto(item.key)}>
          <i className={\`ti \${item.icon}\`}></i>
          {item.pip && <span className="pip"></span>}
        </div>
      ))}
      <div className="rail-spacer"></div>
      <div className="rail-divider"></div>
      <div className={\`rail-item \${railActive === "settings" ? "active" : ""}\`}
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
`;
fs.writeFileSync(path.join(LAYOUT_DIR, 'Sidebar.jsx'), sidebarCode);

const topbarCode = `"use client";
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
`;
fs.writeFileSync(path.join(LAYOUT_DIR, 'Topbar.jsx'), topbarCode);

console.log('Component split complete.');
