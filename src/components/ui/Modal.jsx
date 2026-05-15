"use client";
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
