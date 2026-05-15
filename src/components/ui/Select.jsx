"use client";
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
    <div ref={root} className={`cs ${open ? "open" : ""} ${size === "sm" ? "cs-sm" : ""}`} onKeyDown={onKey}>
      <button type="button" className={`cs-trigger ${!sel ? "placeholder" : ""}`} onClick={() => setOpen(o => !o)}>
        {icon && <i className={`ti ${icon} cs-icon`}></i>}
        {prefix && <span className="cs-prefix">{prefix}</span>}
        {sel ? (
          <>
            {sel.icon && <i className={`ti ${sel.icon}`} style={{ color: sel.color || "var(--muted)" }}></i>}
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
            <div className={`cs-opt ${!value ? "selected" : ""} ${kbd === 0 ? "kbd-focus" : ""}`} onClick={() => choose("")}>
              <i className="ti ti-circle-off cs-opt-icon"></i>
              {emptyLabel}
              {!value && <i className="ti ti-check cs-opt-check"></i>}
            </div>
          )}
          {filt.length === 0 ? (
            <div className="cs-empty">No matches</div>
          ) : filt.map((o, i) => (
            <div key={o.value}
                 className={`cs-opt ${String(value) === String(o.value) ? "selected" : ""} ${kbd === (allowEmpty?i+1:i) ? "kbd-focus" : ""}`}
                 onMouseEnter={() => setKbd(allowEmpty?i+1:i)}
                 onClick={() => choose(o.value)}>
              {o.icon && <i className={`ti ${o.icon} cs-opt-icon`} style={{ color: o.color || "var(--muted)" }}></i>}
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
