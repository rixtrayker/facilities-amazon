const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, 'src');

function fix(file, replaces) {
  let p = path.join(SRC_DIR, file);
  if (!fs.existsSync(p)) return;
  let code = fs.readFileSync(p, 'utf8');
  for (const [search, replace] of replaces) {
    code = code.replace(search, replace);
  }
  fs.writeFileSync(p, code);
}

// 1
fix('views/view-branches.jsx', [
  ['window.BranchesView = BranchesView;', ''],
  ['window.BranchDetail = BranchDetail;', ''],
  ['export default BranchesView;', 'export { BranchesView, BranchDetail };']
]);

// 2
fix('views/view-tickets.jsx', [
  ['export default TicketsView;', 'export { TicketsView, TicketDetail, NewTicket };']
]);

// 3
fix('views/view-ops.jsx', [
  ['window.OpsView = OpsView;', ''],
  ['export default OpsView;', 'export { OpsView };']
]);

// 4
fix('views/view-reports.jsx', [
  ['window.ReportsView = ReportsView;', ''],
  ['export default ReportsView;', 'export { ReportsView };']
]);

// 5
fix('views/view-vendors.jsx', [
  ['window.VendorsView = VendorsView;', ''],
  ['export default VendorsView;', 'export { VendorsView };']
]);

// 6
const oldHtml = fs.readFileSync(path.join(__dirname, '_old', 'index.html'), 'utf8');
const settingsMatch = oldHtml.match(/(function SettingsView[\s\S]*?})\s*(?:\n|\/\/|\Z)/);
if (settingsMatch) {
  const code = `"use client";
import React, { useState } from "react";
import { Card, CardHead } from "../components/Shared";

` + settingsMatch[1] + `

export { SettingsView };
`;
  fs.writeFileSync(path.join(SRC_DIR, 'views', 'view-settings.jsx'), code);
} else {
  console.log("Could not find SettingsView");
}

// 7
let pageCode = fs.readFileSync(path.join(SRC_DIR, 'app', 'page.js'), 'utf8');
pageCode = pageCode.replace('import OpsView from "../views/view-ops";', 'import { OpsView } from "../views/view-ops";');
pageCode = pageCode.replace('import TicketsView from "../views/view-tickets";', 'import { TicketsView, TicketDetail, NewTicket } from "../views/view-tickets";');
pageCode = pageCode.replace('import BranchesView from "../views/view-branches";', 'import { BranchesView, BranchDetail } from "../views/view-branches";');
pageCode = pageCode.replace('import VendorsView from "../views/view-vendors";', 'import { VendorsView } from "../views/view-vendors";');
pageCode = pageCode.replace('import ReportsView from "../views/view-reports";', 'import { ReportsView } from "../views/view-reports";\nimport { SettingsView } from "../views/view-settings";');
pageCode = pageCode.replace(/ReactDOM\.createRoot.*?render\(<App \/>\);/, '');

fs.writeFileSync(path.join(SRC_DIR, 'app', 'page.js'), pageCode);

console.log('fix2 complete.');
