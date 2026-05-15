"use client";
import React, { useState } from "react";

export function BarChart({ data, valueFmt = (v) => v, dark = false }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  
  // Pad the max value by 15% so the bars don't hit the absolute top
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const chartMax = maxValue * 1.15; 

  return (
    <div className="bar-chart" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '180px' }}>
      <div className="bc-axis" style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', paddingBottom: '8px', borderBottom: '1px solid var(--line)' }}>
        {data.map((d, i) => {
          const isHovered = hoveredIdx === i;
          const isFaded = hoveredIdx !== null && hoveredIdx !== i;
          
          return (
            <div 
              className="bc-col" 
              key={i} 
              title={`${d.label}: ${valueFmt(d.value)}`}
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'flex-end',
                height: '100%',
                width: '100%',
                cursor: 'pointer',
                opacity: isFaded ? 0.4 : 1,
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div 
                className="bc-val" 
                style={{ 
                  fontSize: '11px', 
                  fontFamily: "'IBM Plex Mono', monospace", 
                  color: isHovered ? 'var(--ink)' : 'var(--muted)',
                  marginBottom: '4px',
                  fontWeight: isHovered ? 600 : 400,
                  transition: 'all 0.2s'
                }}
              >
                {d.value > 0 ? valueFmt(d.value) : ""}
              </div>
              <div 
                className={`bc-bar ${dark ? "ink" : ""}`} 
                style={{ 
                  height: `${(d.value / chartMax) * 100}%`,
                  width: '32px',
                  background: dark ? 'var(--ink)' : (isHovered ? 'var(--accent)' : 'var(--bg-sub)'),
                  borderRadius: '4px 4px 0 0',
                  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                  transform: isHovered ? 'scaleX(1.1)' : 'scaleX(1)'
                }}
              ></div>
            </div>
          );
        })}
      </div>
      <div className="bc-labels" style={{ display: 'flex', justifyContent: 'space-around', marginTop: '8px' }}>
        {data.map((d, i) => (
          <div 
            className="bc-label" 
            key={i}
            style={{
              fontSize: '10px',
              color: hoveredIdx === i ? 'var(--ink)' : 'var(--muted)',
              textAlign: 'center',
              width: '32px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              transition: 'color 0.2s'
            }}
            title={d.label}
          >
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
}
