// ── TICKETS list with preset filters ───────────────────
function TicketsView({ tickets, branches, vendors, agents, enabledStatuses, onOpenTicket, onNewTicket }) {
  const [tab, setTab] = useState("all");
  const [preset, setPreset] = useState(null);
  const [filters, setFilters] = useState({ search: "", status: "", branchId: "", category: "", priority: "", vendorId: "" });

  const branchById = useMemo(() => Object.fromEntries(branches.map(b => [b.id, b])), [branches]);
  const vendorById = useMemo(() => Object.fromEntries(vendors.map(v => [v.id, v])), [vendors]);
  const agentById  = useMemo(() => Object.fromEntries(agents.map(a => [a.id, a])), [agents]);

  // ── preset filters ───────────────────────────────────
  // Each preset is a function: (ticket) => boolean
  const presets = [
    { key: "attention",   label: "Needs my attention", icon: "ti-flame",       fn: t => t.status === "New" || t.status === "Waiting Approval" },
    { key: "high",        label: "High priority open", icon: "ti-flag-3",      fn: t => t.priority === "High" && isOpen(t) },
    { key: "overdue",     label: "Overdue (>7d)",      icon: "ti-clock-x",     fn: t => isOverdue(t) },
    { key: "vendor-onsite", label: "Vendor on-site",   icon: "ti-tool",        fn: t => t.status === "In Maintenance" },
    { key: "no-vendor",   label: "No vendor assigned", icon: "ti-circle-x",    fn: t => isOpen(t) && !t.vendorId },
    { key: "closed-week", label: "Closed this week",   icon: "ti-checks",      fn: t => t.status === "Closed" && daysBetween(t.closedDate, null) <= 7 },
  ];

  // ── filtering ────────────────────────────────────────
  let filtered = tickets;
  if (tab === "open")   filtered = filtered.filter(isOpen);
  if (tab === "closed") filtered = filtered.filter(t => t.status === "Closed");
  if (tab === "mine")   filtered = filtered.filter(t => t.agentId === 1);
  if (preset)           filtered = filtered.filter(presets.find(p => p.key === preset)?.fn || (() => true));
  if (filters.status)   filtered = filtered.filter(t => t.status === filters.status);
  if (filters.branchId) filtered = filtered.filter(t => t.branchId === Number(filters.branchId));
  if (filters.category) filtered = filtered.filter(t => t.category === filters.category);
  if (filters.priority) filtered = filtered.filter(t => t.priority === filters.priority);
  if (filters.vendorId) filtered = filtered.filter(t => t.vendorId === Number(filters.vendorId));
  if (filters.search) {
    const q = filters.search.toLowerCase();
    filtered = filtered.filter(t => t.title.toLowerCase().includes(q) || t.code.toLowerCase().includes(q));
  }

  const counts = {
    all:    tickets.length,
    open:   tickets.filter(isOpen).length,
    mine:   tickets.filter(t => t.agentId === 1).length,
    closed: tickets.filter(t => t.status === "Closed").length,
  };

  const statusOptions  = (enabledStatuses || STATUSES.map(s=>s.key)).map(k => ({ value: k, label: k }));
  const branchOptions  = branches.map(b => ({ value: b.id, label: b.name, sub: b.zone }));
  const categoryOptions= Object.entries(CATEGORIES).map(([k, c]) => ({ value: k, label: k, icon: c.icon, color: c.color }));
  const prioOptions    = PRIORITIES.map(p => ({ value: p.key, label: p.key }));
  const vendorOptions  = vendors.map(v => ({ value: v.id, label: v.name, sub: v.specialty }));

  return (
    <div className="canvas-inner">
      <div className="tabs">
        {[["all","All"],["open","Open"],["mine","Assigned to me"],["closed","Closed"]].map(([k,l]) => (
          <div key={k} className={`tab ${tab===k?"active":""}`} onClick={() => setTab(k)}>
            {l} <span className="num">{counts[k]}</span>
          </div>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center", paddingBottom: 6 }}>
          <button className="btn btn-accent btn-sm" onClick={onNewTicket}>
            <i className="ti ti-plus"></i> New ticket
          </button>
        </div>
      </div>

      {/* preset filter chips */}
      <div className="presets">
        <span className="lbl">Saved views</span>
        {presets.map(p => {
          const n = tickets.filter(p.fn).length;
          return (
            <div key={p.key} className={`preset ${preset === p.key ? "active" : ""}`} onClick={() => setPreset(preset === p.key ? null : p.key)}>
              <i className={`ti ${p.icon}`}></i>
              {p.label}
              <span className="count">{n}</span>
            </div>
          );
        })}
      </div>

      <div className="filters">
        <input className="input" placeholder="Search title or code…" value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} />
        <Select value={filters.status}   onChange={v => setFilters(f => ({ ...f, status: v }))}   options={statusOptions}   placeholder="Status"    allowEmpty emptyLabel="All statuses" />
        <Select value={filters.branchId} onChange={v => setFilters(f => ({ ...f, branchId: v }))} options={branchOptions}   placeholder="Branch"    searchable allowEmpty emptyLabel="All branches" />
        <Select value={filters.category} onChange={v => setFilters(f => ({ ...f, category: v }))} options={categoryOptions} placeholder="Category"  allowEmpty emptyLabel="All categories" />
        <Select value={filters.priority} onChange={v => setFilters(f => ({ ...f, priority: v }))} options={prioOptions}     placeholder="Priority"  allowEmpty emptyLabel="All priorities" />
        <Select value={filters.vendorId} onChange={v => setFilters(f => ({ ...f, vendorId: v }))} options={vendorOptions}   placeholder="Vendor"    searchable allowEmpty emptyLabel="All vendors" />
        {(Object.values(filters).some(Boolean) || preset) && (
          <button className="btn btn-sm btn-ghost" onClick={() => { setFilters({ search: "", status: "", branchId: "", category: "", priority: "", vendorId: "" }); setPreset(null); }}>
            <i className="ti ti-x"></i> Clear
          </button>
        )}
        <span className="filters-count">{filtered.length} of {tickets.length}</span>
      </div>

      <Card>
        <table className="tbl">
          <thead><tr>
            <th>Code</th>
            <th>Title</th>
            <th>Branch</th>
            <th>Category</th>
            <th>Vendor</th>
            <th>Status</th>
            <th>Priority</th>
            <th style={{ textAlign: "right" }}>Cost</th>
            <th style={{ textAlign: "right" }}>Age</th>
          </tr></thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={9}><div className="empty"><i className="ti ti-search-off"></i><p>No tickets match these filters.</p></div></td></tr>
            ) : filtered.map(t => (
              <HoverableRow key={t.id} ticket={t} branch={branchById[t.branchId]} vendor={vendorById[t.vendorId]} agent={agentById[t.agentId]} onClick={() => onOpenTicket(t)}>
                <td><span className="code">{t.code}</span></td>
                <td><div className="title-cell">{t.title}</div></td>
                <td className="muted" style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{branchById[t.branchId]?.name}</td>
                <td className="muted">{t.category}</td>
                <td className="muted">{vendorById[t.vendorId]?.name || "—"}</td>
                <td><StatusBadge status={t.status} /></td>
                <td><PrioBadge priority={t.priority} /></td>
                <td className="num" style={{ textAlign: "right" }}>{ticketCost(t) ? fmtMoney(ticketCost(t)) : "—"}</td>
                <td className="num muted" style={{ textAlign: "right" }}>{daysBetween(t.createdDate, t.closedDate)}d</td>
              </HoverableRow>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ── TICKET DETAIL (rich with icons/badges) ──────────────
function TicketDetail({ ticket, branches, vendors, agents, enabledStatuses, onUpdate, onRequestClose }) {
  const branch = branches.find(b => b.id === ticket.branchId);
  const vendor = vendors.find(v => v.id === ticket.vendorId);
  const agent  = agents.find(a => a.id === ticket.agentId);
  const catCfg = CATEGORIES[ticket.category];

  const events = [
    { event: "Reported",          icon: "ti-flag-plus",      detail: `By ${ticket.reporter}`, when: ticket.createdDate },
    ticket.agentId ? { event: "Agent assigned",     icon: "ti-user-check",     detail: `${agent?.name || "—"} took ownership`, when: ticket.createdDate } : null,
    ticket.vendorId ? { event: "Vendor dispatched", icon: "ti-truck-delivery", detail: `${vendor?.name || "—"} notified`, when: ticket.createdDate } : null,
    ticket.status === "In Maintenance"   ? { event: "Vendor on-site",       icon: "ti-tool",      detail: "Repair in progress", when: ticket.createdDate, active: true } : null,
    ticket.status === "Waiting Approval" ? { event: "Awaiting approval",    icon: "ti-circle-dollar-sign", detail: `${fmtMoney(ticketCost(ticket))} needs sign-off`, when: ticket.createdDate, active: true } : null,
    ticket.status === "Pending"          ? { event: "Blocked",              icon: "ti-hand-stop", detail: "Waiting for parts / info", when: ticket.createdDate, active: true } : null,
    ticket.closedDate                    ? { event: "Closed",               icon: "ti-checks",    detail: "Signed off & resolved", when: ticket.closedDate, active: true } : null,
  ].filter(Boolean);

  const statusOptions = (enabledStatuses || STATUSES.map(s=>s.key)).map(k => ({ value: k, label: k }));
  const agentOptions  = agents.map(a => ({ value: a.id, label: a.name, sub: a.role }));
  const vendorOptions = vendors.map(v => ({ value: v.id, label: v.name, sub: v.specialty }));

  const handleStatus = (newStatus) => {
    if (newStatus === "Closed" && ticketCost(ticket) === 0) {
      onRequestClose(ticket);
      return;
    }
    onUpdate({ ...ticket, status: newStatus, closedDate: ["Closed","Rejected"].includes(newStatus) ? "2026-05-15" : ticket.closedDate });
  };

  return (
    <div className="canvas-inner">
      <div className="cols-detail">
        <div className="stack">
          <Card>
            <div className={`ticket-head prio-${ticket.priority.toLowerCase()}`}>
              <div className="row1">
                <span className="code">{ticket.code}</span>
                <StatusBadge status={ticket.status} large />
                <PrioBadge priority={ticket.priority} large />
                {catCfg && <CatPill category={ticket.category} />}
                <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--muted)" }}>
                  <i className="ti ti-calendar-event" style={{ marginRight: 4 }}></i>
                  {fmtDateFull(ticket.createdDate)} · {daysBetween(ticket.createdDate, ticket.closedDate)}d
                </span>
              </div>
              <h1>{ticket.title}</h1>
              <p className="desc">{ticket.description || <em>No description provided.</em>}</p>
            </div>

            <div className="cost-grid">
              <div>
                <div className="cost-label"><i className="ti ti-package" style={{ marginRight: 4 }}></i> Spare parts</div>
                <div className="cost-val">{fmtMoney(ticket.sparePartsCost || 0)}</div>
              </div>
              <div>
                <div className="cost-label"><i className="ti ti-route" style={{ marginRight: 4 }}></i> Visit</div>
                <div className="cost-val">{fmtMoney(ticket.visitCost || 0)}</div>
              </div>
              <div className="total">
                <div className="cost-label"><i className="ti ti-wallet" style={{ marginRight: 4 }}></i> Total</div>
                <div className="cost-val">{fmtMoney(ticketCost(ticket))}</div>
              </div>
            </div>
          </Card>

          <Card>
            <CardHead title="Activity timeline" icon="ti-timeline" />
            <div className="timeline">
              {events.map((e, i) => (
                <div key={i} className="timeline-item">
                  <div className={`timeline-dot ${e.active ? "active" : ""}`}></div>
                  <div className="timeline-body">
                    <div className="timeline-event">
                      <i className={`ti ${e.icon}`} style={{ color: "var(--muted)", marginRight: 6, fontSize: 12 }}></i>
                      {e.event}
                    </div>
                    <div className="timeline-detail">{e.detail}</div>
                    <div className="timeline-when">{fmtDateFull(e.when)}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="stack">
          <Card>
            <CardHead title="Status" icon="ti-progress-check" />
            <div style={{ padding: 14 }}>
              <Select value={ticket.status} onChange={handleStatus} options={statusOptions} icon="ti-circle-dot" />
              <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 10, lineHeight: 1.5 }}>
                {STATUSES.find(s => s.key === ticket.status)?.desc}
              </p>
            </div>
          </Card>

          <Card>
            <CardHead title="Details" icon="ti-info-circle" />
            <div className="meta-grid">
              <div className="meta-cell">
                <div className="ml"><i className="ti ti-map-pin"></i> Branch</div>
                <div className="mv mv-link">{branch?.name || "—"}</div>
              </div>
              <div className="meta-cell">
                <div className="ml"><i className="ti ti-map-2"></i> Zone</div>
                <div className="mv">{branch?.zone || "—"}</div>
              </div>
              <div className="meta-cell">
                <div className="ml"><i className="ti ti-building"></i> Type</div>
                <div className="mv">{branch?.type || "—"}</div>
              </div>
              <div className="meta-cell">
                <div className="ml"><i className="ti ti-clipboard-list"></i> Sub-type</div>
                <div className="mv">{ticket.ticketType || "—"}</div>
              </div>
              <div className="meta-cell">
                <div className="ml"><i className="ti ti-tool"></i> Maintenance</div>
                <div className="mv">{ticket.maintenanceType}</div>
              </div>
              <div className="meta-cell">
                <div className="ml"><i className="ti ti-user"></i> Reporter</div>
                <div className="mv" style={{ fontSize: 12 }}>{ticket.reporter}</div>
              </div>
              <div className="meta-cell">
                <div className="ml"><i className="ti ti-user-check"></i> Agent</div>
                <div className="mv">
                  {agent ? <><span className="av">{initials(agent.name)}</span>{agent.name}</> : <span style={{ color: "var(--muted-2)" }}>Unassigned</span>}
                </div>
              </div>
              <div className="meta-cell">
                <div className="ml"><i className="ti ti-truck"></i> Vendor</div>
                <div className="mv">{vendor?.name || <span style={{ color: "var(--muted-2)" }}>Unassigned</span>}</div>
              </div>
              <div className="meta-cell">
                <div className="ml"><i className="ti ti-calendar-plus"></i> Created</div>
                <div className="mv mono">{fmtDateFull(ticket.createdDate)}</div>
              </div>
              <div className="meta-cell">
                <div className="ml"><i className="ti ti-calendar-check"></i> Closed</div>
                <div className="mv mono">{ticket.closedDate ? fmtDateFull(ticket.closedDate) : <span style={{ color: "var(--muted-2)" }}>—</span>}</div>
              </div>
            </div>
          </Card>

          <Card>
            <CardHead title="Reassign" icon="ti-replace" />
            <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
              <div className="field">
                <span className="field-label">Agent</span>
                <Select value={ticket.agentId || ""} onChange={v => onUpdate({ ...ticket, agentId: v ? Number(v) : null })} options={agentOptions} icon="ti-user" allowEmpty emptyLabel="Unassigned" searchable />
              </div>
              <div className="field">
                <span className="field-label">Vendor</span>
                <Select value={ticket.vendorId || ""} onChange={v => onUpdate({ ...ticket, vendorId: v ? Number(v) : null })} options={vendorOptions} icon="ti-truck" allowEmpty emptyLabel="Unassigned" searchable />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── CLOSE-WITH-COST modal ──────────────────────────────
function CloseModal({ ticket, onClose, onConfirm }) {
  const [parts, setParts] = useState(ticket?.sparePartsCost?.toString() || "");
  const [visit, setVisit] = useState(ticket?.visitCost?.toString() || "");
  const [note,  setNote]  = useState("");
  if (!ticket) return null;
  const total = (Number(parts)||0) + (Number(visit)||0);
  return (
    <Modal open={true} onClose={onClose} title="Close ticket" sub={`Record final costs before closing ${ticket.code}.`} width={460}
      footer={<>
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn-accent" onClick={() => onConfirm({ sparePartsCost: Number(parts)||0, visitCost: Number(visit)||0, note })}>
          <i className="ti ti-check"></i> Close ticket
        </button>
      </>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ background: "var(--bg-sub)", padding: 12, borderRadius: 8, fontSize: 12, color: "var(--ink-2)" }}>
          <strong>{ticket.title}</strong>
          <div style={{ color: "var(--muted)", marginTop: 2 }}>{ticket.category} · {ticket.ticketType}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="field">
            <span className="field-label">Spare parts (EGP)</span>
            <input className="input" type="number" min="0" placeholder="0" value={parts} onChange={e => setParts(e.target.value)} autoFocus />
          </div>
          <div className="field">
            <span className="field-label">Visit cost (EGP)</span>
            <input className="input" type="number" min="0" placeholder="0" value={visit} onChange={e => setVisit(e.target.value)} />
          </div>
        </div>
        <div className="field">
          <span className="field-label">Closing note <span style={{ color: "var(--muted-2)" }}>(optional)</span></span>
          <textarea className="textarea" placeholder="What was done, any follow-up needed?" value={note} onChange={e => setNote(e.target.value)} style={{ minHeight: 70 }} />
        </div>
        <div style={{ background: "var(--accent-soft)", padding: "10px 14px", borderRadius: 7, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "var(--warning)", fontWeight: 500 }}>Final total</span>
          <span className="mono" style={{ fontSize: 18, fontWeight: 600, color: "var(--accent-ink)" }}>{fmtMoney(total)}</span>
        </div>
      </div>
    </Modal>
  );
}

// ── NEW TICKET (fast form) ─────────────────────────────
function NewTicket({ branches, vendors, agents, enabledStatuses, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    title: "", description: "",
    branchId: "", category: "HVAC", ticketType: "",
    priority: "Medium", maintenanceType: "Maintenance",
    agentId: "", vendorId: "",
    sparePartsCost: "", visitCost: "",
  });
  const [err, setErr] = useState("");

  const submit = () => {
    if (!form.title.trim() || !form.branchId) { setErr("Title and branch are required."); return; }
    onSubmit(form);
  };

  const branchOptions = branches.map(b => ({ value: b.id, label: b.name, sub: b.zone }));
  const agentOptions  = agents.map(a => ({ value: a.id, label: a.name, sub: a.role }));
  const vendorOptions = vendors.map(v => ({ value: v.id, label: v.name, sub: v.specialty }));

  return (
    <div className="canvas-inner" style={{ maxWidth: 820 }}>
      <div className="fast-form">
        {err && <div style={{ background: "var(--critical-soft)", color: "var(--critical)", padding: "10px 14px", borderRadius: 7, fontSize: 13, marginBottom: 16 }}>{err}</div>}

        <div className="step">
          <div className="step-num">STEP 01 / 03</div>
          <h3>What broke?</h3>
          <div className="stack-sm">
            <input className="input" placeholder="Short headline — e.g. AC dripping water on aisle 5" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} autoFocus />
            <textarea className="textarea" placeholder="Add detail: where exactly, urgency, what's been tried…" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
        </div>

        <div className="step">
          <div className="step-num">STEP 02 / 03</div>
          <h3>Where and what kind?</h3>

          <div className="field" style={{ marginBottom: 14 }}>
            <span className="field-label">Branch <span className="req">*</span></span>
            <Select value={form.branchId} onChange={v => setForm(f => ({ ...f, branchId: v }))} options={branchOptions} placeholder="Pick a branch…" icon="ti-map-pin" searchable />
          </div>

          <div className="field" style={{ marginBottom: 14 }}>
            <span className="field-label">Category</span>
            <div className="chip-row">
              {Object.keys(CATEGORIES).map(c => (
                <button key={c} className={`chip ${form.category === c ? "active" : ""}`} onClick={() => setForm(f => ({ ...f, category: c, ticketType: "" }))}>
                  <i className={`ti ${CATEGORIES[c].icon}`}></i>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="field" style={{ marginBottom: 14 }}>
            <span className="field-label">Type</span>
            <div className="chip-row">
              {(CATEGORIES[form.category]?.types || []).map(t => (
                <button key={t} className={`chip ${form.ticketType === t ? "active" : ""}`} onClick={() => setForm(f => ({ ...f, ticketType: t }))}>{t}</button>
              ))}
            </div>
          </div>

          <div className="field">
            <span className="field-label">Priority</span>
            <div className="chip-row">
              {PRIORITIES.map(p => (
                <button key={p.key} className={`chip ${form.priority === p.key ? "active" : ""}`} onClick={() => setForm(f => ({ ...f, priority: p.key }))}>{p.key}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="step">
          <div className="step-num">STEP 03 / 03 · optional</div>
          <h3>Triage now or later?</h3>
          <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 14 }}>You can assign and cost later from the ticket page.</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div className="field">
              <span className="field-label">Agent</span>
              <Select value={form.agentId} onChange={v => setForm(f => ({ ...f, agentId: v }))} options={agentOptions} icon="ti-user" allowEmpty emptyLabel="Unassigned" searchable />
            </div>
            <div className="field">
              <span className="field-label">Vendor</span>
              <Select value={form.vendorId} onChange={v => setForm(f => ({ ...f, vendorId: v }))} options={vendorOptions} icon="ti-truck" allowEmpty emptyLabel="Unassigned" searchable />
            </div>
            <div className="field">
              <span className="field-label">Spare parts (EGP)</span>
              <input className="input" type="number" placeholder="0" value={form.sparePartsCost} onChange={e => setForm(f => ({ ...f, sparePartsCost: e.target.value }))} />
            </div>
            <div className="field">
              <span className="field-label">Visit (EGP)</span>
              <input className="input" type="number" placeholder="0" value={form.visitCost} onChange={e => setForm(f => ({ ...f, visitCost: e.target.value }))} />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 18, justifyContent: "flex-end" }}>
          <button className="btn" onClick={onCancel}>Cancel</button>
          <button className="btn btn-accent" onClick={submit}><i className="ti ti-check"></i> Create ticket</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { TicketsView, TicketDetail, CloseModal, NewTicket });
