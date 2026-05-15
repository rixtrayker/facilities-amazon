"use client";
import React, { useState, useMemo } from "react";
import { TICKETS, BRANCHES, VENDORS, AGENTS } from "../lib/data";
import { isOpen } from "../lib/utils";
import { Sidebar } from "../components/layout/Sidebar";
import { Topbar } from "../components/layout/Topbar";
import { OpsView } from "../views/view-ops";
import { TicketsView, TicketDetail, NewTicket } from "../views/view-tickets";
import { BranchesView, BranchDetail } from "../views/view-branches";
import { VendorsView } from "../views/view-vendors";
import { ReportsView } from "../views/view-reports";
import { SettingsView } from "../views/view-settings";
// Note: TicketDetail, NewTicket, BranchDetail, SettingsView might need extracting or exist in other files.
// ── App root ───────────────────────────────────────────
const useState_ = useState;
const useMemo_ = useMemo;

function App() {
  const [tickets, setTickets] = useState_(TICKETS);
  const [branches]            = useState_(BRANCHES);
  const [vendors]             = useState_(VENDORS);
  const [agents]              = useState_(AGENTS);

  // Routing: { view, params }
  const [route, setRoute] = useState_({ view: "ops" });

  const goto = (view, params = {}) => setRoute({ view, ...params });

  const openTicket = (t) => goto("ticket", { ticketId: t.id });
  const openBranch = (id) => goto("branch", { branchId: id });
  const newTicket  = ()   => goto("new-ticket");

  const selectedTicket = useMemo_(() => tickets.find(t => t.id === route.ticketId), [tickets, route.ticketId]);
  const selectedBranch = useMemo_(() => branches.find(b => b.id === route.branchId), [branches, route.branchId]);

  const updateTicket = (t) => setTickets(prev => prev.map(x => x.id === t.id ? t : x));
  const submitTicket = (form) => {
    const code = `ANW-26-${String(149 + tickets.length - 30).padStart(4, "0")}`;
    const t = {
      id: Date.now(),
      code,
      title: form.title,
      description: form.description,
      branchId: Number(form.branchId),
      category: form.category,
      ticketType: form.ticketType,
      priority: form.priority,
      maintenanceType: form.maintenanceType,
      agentId: form.agentId ? Number(form.agentId) : null,
      vendorId: form.vendorId ? Number(form.vendorId) : null,
      sparePartsCost: Number(form.sparePartsCost) || 0,
      visitCost: Number(form.visitCost) || 0,
      status: "New",
      createdDate: "2026-05-15",
      closedDate: "",
      reporter: "You (Facilities)",
    };
    setTickets(prev => [t, ...prev]);
    goto("ticket", { ticketId: t.id });
  };

  // — sidebar rail items ─────────────────────────────────
  const openCount = tickets.filter(isOpen).length;
  const needsDecision = tickets.filter(t => t.status === "New" || t.status === "Waiting Approval").length;

  const railItems = [
    { key: "ops",       icon: "ti-layout-dashboard", label: "Operations", pip: needsDecision > 0 },
    { key: "tickets",   icon: "ti-ticket",           label: "Tickets",    pip: false },
    { key: "branches",  icon: "ti-building-store",   label: "Branches",   pip: false },
    { key: "vendors",   icon: "ti-tools",            label: "Vendors",    pip: false },
    { key: "reports",   icon: "ti-chart-histogram",  label: "Reports",    pip: false },
  ];

  // — crumb title for top bar ─────────────────────────────
  let crumbs;
  if (route.view === "ops")        crumbs = <span><strong>Operations</strong></span>;
  if (route.view === "tickets")    crumbs = <span><strong>Tickets</strong></span>;
  if (route.view === "new-ticket") crumbs = <><span className="back" onClick={() => goto("tickets")}><i className="ti ti-arrow-left"></i> Tickets</span><span className="sep">/</span><strong>New ticket</strong></>;
  if (route.view === "ticket")     crumbs = <><span className="back" onClick={() => goto("tickets")}><i className="ti ti-arrow-left"></i> Tickets</span><span className="sep">/</span><strong className="mono">{selectedTicket?.code}</strong></>;
  if (route.view === "branches")   crumbs = <span><strong>Branches</strong></span>;
  if (route.view === "branch")     crumbs = <><span className="back" onClick={() => goto("branches")}><i className="ti ti-arrow-left"></i> Branches</span><span className="sep">/</span><strong>{selectedBranch?.name}</strong></>;
  if (route.view === "vendors")    crumbs = <span><strong>Vendors</strong></span>;
  if (route.view === "reports")    crumbs = <span><strong>Reports</strong></span>;
  if (route.view === "settings")   crumbs = <span><strong>Settings</strong></span>;

  // active rail key
  const railActive =
    ["ops"].includes(route.view) ? "ops" :
    ["tickets","new-ticket","ticket"].includes(route.view) ? "tickets" :
    ["branches","branch"].includes(route.view) ? "branches" :
    route.view;

  return (
    <div className="app">

      {/* ── RAIL ── */}
      <Sidebar railItems={railItems} railActive={railActive} goto={goto} />

      {/* ── WORKSPACE ── */}
      <div className="workspace">
        <Topbar crumbs={crumbs} openCount={openCount} needsDecision={needsDecision} inMaintenanceCount={tickets.filter(t => t.status === "In Maintenance").length} newTicket={newTicket} />

        <main className="canvas">
          {route.view === "ops" && <OpsView
            tickets={tickets} branches={branches} vendors={vendors} agents={agents}
            onOpenTicket={openTicket} onOpenBranch={openBranch} onGotoView={goto} />}

          {route.view === "tickets" && <TicketsView
            tickets={tickets} branches={branches} vendors={vendors} agents={agents}
            onOpenTicket={openTicket} onNewTicket={newTicket} />}

          {route.view === "ticket" && selectedTicket && <TicketDetail
            ticket={selectedTicket} branches={branches} vendors={vendors} agents={agents}
            onUpdate={updateTicket} />}

          {route.view === "new-ticket" && <NewTicket
            branches={branches} vendors={vendors} agents={agents}
            onSubmit={submitTicket} onCancel={() => goto("tickets")} />}

          {route.view === "branches" && <BranchesView
            branches={branches} tickets={tickets}
            onOpenBranch={openBranch} />}

          {route.view === "branch" && selectedBranch && <BranchDetail
            branch={selectedBranch} branches={branches} tickets={tickets}
            vendors={vendors} agents={agents}
            onOpenTicket={openTicket} />}

          {route.view === "vendors" && <VendorsView
            vendors={vendors} tickets={tickets} branches={branches} />}

          {route.view === "reports" && <ReportsView
            tickets={tickets} branches={branches} vendors={vendors} agents={agents} />}

          {route.view === "settings" && <SettingsView
            branches={branches} vendors={vendors} agents={agents} />}
        </main>
      </div>

    </div>
  );
}



export default App;
