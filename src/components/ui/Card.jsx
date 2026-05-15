"use client";
import React from "react";

export function Card({ children, className = "" }) {
  return <div className={`card ${className}`}>{children}</div>;
}

export function CardHead({ title, count, urgent, action, icon }) {
  return (
    <div className="card-head">
      <div className="card-title">
        {icon && <i className={`ti ${icon}`} style={{ color: "var(--muted)" }}></i>}
        {title}
        {count !== undefined && <span className={`count ${urgent ? "urgent" : ""}`}>{count}</span>}
      </div>
      {action}
    </div>
  );
}
