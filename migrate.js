const fs = require('fs');
const path = require('path');

const OLD_DIR = path.join(__dirname, '_old');
const SRC_DIR = path.join(__dirname, 'src');

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

ensureDir(path.join(SRC_DIR, 'lib'));
ensureDir(path.join(SRC_DIR, 'components'));
ensureDir(path.join(SRC_DIR, 'views'));

// 1. facility-data.js -> src/lib/data.js
let dataJs = fs.readFileSync(path.join(OLD_DIR, 'facility-data.js'), 'utf8');
dataJs = dataJs.replace('Object.assign(window, {', 'export {');
dataJs = dataJs.replace('});', '};');
fs.writeFileSync(path.join(SRC_DIR, 'lib', 'data.js'), dataJs);

// 2. components.jsx -> src/components/Shared.jsx
let compJsx = fs.readFileSync(path.join(OLD_DIR, 'components.jsx'), 'utf8');
compJsx = `"use client";\nimport React, { useState, useMemo, useEffect, useRef, useCallback } from "react";\nimport { STATUSES, PRIORITIES, CATEGORIES } from "../lib/data";\n\n` + compJsx;
compJsx = compJsx.replace(/const { useState, useMemo, useEffect, useRef, useCallback } = React;/g, '');
compJsx = compJsx.replace('Object.assign(window, {', 'export {');
compJsx = compJsx.replace('});', '};');
fs.writeFileSync(path.join(SRC_DIR, 'components', 'Shared.jsx'), compJsx);

// 3. view-*.jsx -> src/views/*.jsx
const views = fs.readdirSync(OLD_DIR).filter(f => f.startsWith('view-') && f.endsWith('.jsx'));
for (const view of views) {
  let vCode = fs.readFileSync(path.join(OLD_DIR, view), 'utf8');
  vCode = `"use client";\nimport React, { useState, useMemo } from "react";\nimport { fmtMoney, fmtMoneyShort, fmtDate, fmtDateFull, daysBetween, ticketCost, isOpen, isOverdue, initials, StatusBadge, PrioBadge, CatPill, Card, CardHead, Select, PulseStrip, LaneItem, HoverPreview, HoverableRow, Kpi, Donut, DonutWithLegend, BarChart, Modal, Switch, vendorScore, groupTickets, DONUT_PALETTE } from "../components/Shared";\nimport { BRANCHES, VENDORS, AGENTS, CATEGORIES, STATUSES, PRIORITIES, MAINT_TYPES, TICKETS } from "../lib/data";\n\n` + vCode;
  
  vCode = vCode.replace(/const \{ useState, useMemo \} = React;/g, '');
  vCode = vCode.replace(/Object\.assign\(window,\s*\{[\s\S]*?\}\);/g, '');
  
  // also export the main function
  const funcNameMatch = vCode.match(/function\s+([A-Z]\w+)\s*\(/);
  if (funcNameMatch) {
    vCode += `\nexport default ${funcNameMatch[1]};\n`;
  }
  
  fs.writeFileSync(path.join(SRC_DIR, 'views', view), vCode);
}

// 4. app.jsx -> src/app/page.js
let appCode = fs.readFileSync(path.join(OLD_DIR, 'app.jsx'), 'utf8');
appCode = `"use client";\nimport React, { useState, useMemo } from "react";\nimport { TICKETS, BRANCHES, VENDORS, AGENTS } from "../lib/data";\nimport OpsView from "../views/view-ops";\nimport TicketsView from "../views/view-tickets";\nimport BranchesView from "../views/view-branches";\nimport VendorsView from "../views/view-vendors";\nimport ReportsView from "../views/view-reports";\n// Note: TicketDetail, NewTicket, BranchDetail, SettingsView might need extracting or exist in other files.\n` + appCode;
appCode = appCode.replace(/const \{ useState:\s*useState_,\s*useMemo:\s*useMemo_\s*\} = React;/g, 'const useState_ = useState;\nconst useMemo_ = useMemo;');
appCode = appCode.replace(/ReactDOM\.createRoot.*$/g, '');
appCode += `\nexport default App;\n`;

fs.writeFileSync(path.join(SRC_DIR, 'app', 'page.js'), appCode);

// 5. extract CSS from index.html to globals.css
const html = fs.readFileSync(path.join(OLD_DIR, 'index.html'), 'utf8');
const cssMatch = html.match(/<style>([\s\S]*?)<\/style>/);
if (cssMatch) {
  let css = cssMatch[1];
  // Next.js requires tailwind by default if we selected it, but we said --no-tailwind.
  fs.writeFileSync(path.join(SRC_DIR, 'app', 'globals.css'), css);
}

// 6. layout.js
let layoutCode = fs.readFileSync(path.join(SRC_DIR, 'app', 'layout.js'), 'utf8');
// add tabler icons webfont
layoutCode = layoutCode.replace(
  '</head>',
  `  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.34.1/dist/tabler-icons.min.css" />\n      </head>`
);
// replace standard next.js fonts with Geist, Geist Mono, Instrument Serif
layoutCode = `import "./globals.css";

export const metadata = {
  title: "FacilityOps — Amazon Now Egypt",
  description: "Amazon Now Egypt FacilityOps",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.34.1/dist/tabler-icons.min.css" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
`;
fs.writeFileSync(path.join(SRC_DIR, 'app', 'layout.js'), layoutCode);

console.log('Migration complete.');
