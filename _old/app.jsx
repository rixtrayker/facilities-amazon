// ── App root ───────────────────────────────────────────
const { useState: useState_, useMemo: useMemo_ } = React;

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
      <aside className="rail">
        <div className="rail-logo" title="Amazon Now Egypt">a.</div>
        {railItems.map(item => (
          <div key={item.key}
               className={`rail-item ${railActive === item.key ? "active" : ""}`}
               title={item.label}
               onClick={() => goto(item.key)}>
            <i className={`ti ${item.icon}`}></i>
            {item.pip && <span className="pip"></span>}
          </div>
        ))}
        <div className="rail-spacer"></div>
        <div className="rail-divider"></div>
        <div className={`rail-item ${railActive === "settings" ? "active" : ""}`}
             title="Settings"
             onClick={() => goto("settings")}>
          <i className="ti ti-settings"></i>
        </div>
        <div className="rail-item" title="Khalifa" style={{ background: "#FF9900", color: "#14130F", fontWeight: 700, fontSize: 13 }}>
          MK
        </div>
      </aside>

      {/* ── WORKSPACE ── */}
      <div className="workspace">
        <header className="topbar">
          <div className="crumbs">{crumbs}</div>

          <div className="ticker">
            <div className="ticker-item"><span className="tdot" style={{ background: "var(--ok)" }}></span>{openCount} open tickets</div>
            <div className="ticker-item"><span className="tdot" style={{ background: "var(--accent)" }}></span>{needsDecision} need your call</div>
            <div className="ticker-item"><span className="tdot" style={{ background: "var(--info)" }}></span>{tickets.filter(t => t.status === "In Maintenance").length} vendors on-site</div>
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

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
