"use client";
import React from "react";

export function Switch({ on, onChange, locked }) {
  return (
    <div className={`switch ${on ? "on" : ""} ${locked ? "locked" : ""}`} onClick={() => !locked && onChange(!on)} role="switch" aria-checked={on}></div>
  );
}
