// ── BRANCHES grid + detail ─────────────────────────────
function BranchesView({ branches, tickets, onOpenBranch }) {
  const [zone, setZone] = useState("");
  const [type, setType] = useState("");
  const [search, setSearch] = useState("");

  const zones = [...new Set(branches.map(b => b.zone))];
  const types = [...new Set(branches.map(b => b.type))];

  let filtered = branches;
  if (zone)   filtered = filtered.filter(b => b.zone === zone);
  if (type)   filtered = filtered.filter(b => b.type === type);
  if (search) filtered = filtered.filter(b => b.name.toLowerCase().includes(search.toLowerCase()) || b.code.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="canvas-inner">
      <div className="filters">
        <input className="input" placeholder="Search branch…" value={search} onChange={e => setSearch(e.target.value)} />
        <Select value={zone} onChange={setZone} options={zones.map(z => ({ value: z, label: z }))} allowEmpty emptyLabel="All zones" icon="ti-map-2" />
        <Select value={type} onChange={setType} options={types.map(t => ({ value: t, label: t }))} allowEmpty emptyLabel="All types" icon="ti-building" />
        <span className="filters-count">{filtered.length} branches</span>
      </div>

      <div className="branch-grid">
        {filtered.map(b => {
          const open = tickets.filter(t => t.branchId === b.id && isOpen(t));
          const crit = open.filter(t => t.priority === "High").length;
          const spend = tickets.filter(t => t.branchId === b.id).reduce((s,t) => s + ticketCost(t), 0);
          const ttlTickets = tickets.filter(t => t.branchId === b.id).length;
          const health = crit > 0 ? "crit" : open.length > 0 ? "warn" : "ok";
          return (
            <div key={b.id} className="branch-card" onClick={() => onOpenBranch(b.id)}>
              <div className={`health-strip ${health}`}></div>
              <div className="b-zone">{b.zone}</div>
              <h3>{b.name}</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: -8, marginBottom: 6 }}>
                <span className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>{b.code}</span>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>· {b.type}</span>
              </div>
              <div className="b-stats">
                <div>
                  <div className="b-stat-l">Open</div>
                  <div className={`b-stat-v ${open.length === 0 ? "zero" : crit > 0 ? "crit" : "warn"}`}>{open.length}</div>
                </div>
                <div>
                  <div className="b-stat-l">High prio</div>
                  <div className={`b-stat-v ${crit > 0 ? "crit" : "zero"}`}>{crit}</div>
                </div>
                <div>
                  <div className="b-stat-l">All-time</div>
                  <div className="b-stat-v">{ttlTickets}</div>
                </div>
                <div>
                  <div className="b-stat-l">Total spend</div>
                  <div className="b-stat-v" style={{ fontSize: 13 }}>{fmtMoneyShort(spend)}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BranchDetail({ branch, tickets, vendors, agents, branches, onOpenTicket }) {
  const branchTickets = tickets.filter(t => t.branchId === branch.id);
  const open = branchTickets.filter(isOpen);
  const closed = branchTickets.filter(t => t.status === "Closed");
  const totalSpend = branchTickets.reduce((s,t) => s + ticketCost(t), 0);
  const avgClose = closed.length ? Math.round((closed.reduce((s,t) => s + daysBetween(t.createdDate, t.closedDate), 0) / closed.length) * 10) / 10 : 0;

  const byCategory = Object.keys(CATEGORIES).map(c => ({
    label: c,
    value: branchTickets.filter(t => t.category === c).reduce((s,t) => s + ticketCost(t), 0),
    color: CATEGORIES[c].color,
  })).filter(c => c.value > 0);

  const branchById = useMemo(() => Object.fromEntries(branches.map(b => [b.id, b])), [branches]);
  const vendorById = useMemo(() => Object.fromEntries(vendors.map(v => [v.id, v])), [vendors]);
  const agentById  = useMemo(() => Object.fromEntries(agents.map(a => [a.id, a])), [agents]);

  return (
    <div className="canvas-inner">
      <div style={{ marginBottom: 22 }}>
        <div className="section-eyebrow">{branch.zone} · {branch.type}</div>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 36, fontWeight: 400, letterSpacing: "-0.01em", margin: "4px 0 4px" }}>{branch.name}</h1>
        <div style={{ fontSize: 13, color: "var(--muted)" }}>
          <span className="mono">{branch.code}</span> · {branch.sqm} m² · Manager: {branch.manager} · Opened {fmtDateFull(branch.openedAt)}
        </div>
      </div>

      <div className="cols-4" style={{ marginBottom: 22 }}>
        <Kpi label="Open tickets" value={open.length} sub={open.length === 0 ? "all clear" : `${open.filter(t => t.priority === "High").length} high prio`} />
        <Kpi label="All-time tickets" value={branchTickets.length} sub={`${closed.length} closed`} />
        <Kpi label="Total spend" value={fmtMoneyShort(totalSpend)} sub="parts + visits" />
        <Kpi label="Avg time to close" value={avgClose} unit="days" sub={`from ${closed.length} closed`} />
      </div>

      <div className="cols-2">
        <Card>
          <CardHead title="All tickets" count={branchTickets.length} />
          <table className="tbl">
            <thead><tr>
              <th>Code</th><th>Title</th><th>Status</th><th>Priority</th><th style={{ textAlign: "right" }}>Cost</th>
            </tr></thead>
            <tbody>
              {branchTickets.map(t => (
                <HoverableRow key={t.id} ticket={t} branch={branchById[t.branchId]} vendor={vendorById[t.vendorId]} agent={agentById[t.agentId]} onClick={() => onOpenTicket(t)}>
                  <td><span className="code">{t.code}</span></td>
                  <td><div className="title-cell">{t.title}</div></td>
                  <td><StatusBadge status={t.status} /></td>
                  <td><PrioBadge priority={t.priority} /></td>
                  <td className="num" style={{ textAlign: "right" }}>{ticketCost(t) ? fmtMoney(ticketCost(t)) : "—"}</td>
                </HoverableRow>
              ))}
              {branchTickets.length === 0 && <tr><td colSpan={5}><div className="empty"><i className="ti ti-checkbox"></i><p>No tickets recorded for this branch yet.</p></div></td></tr>}
            </tbody>
          </table>
        </Card>

        <div className="stack">
          {byCategory.length > 0 && (
            <Card>
              <CardHead title="Spend by category" icon="ti-chart-donut" />
              <DonutWithLegend
                data={byCategory}
                centerValue={fmtMoneyShort(totalSpend).replace("EGP ", "")}
                centerLabel="EGP"
                valueFmt={fmtMoneyShort}
              />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

window.BranchesView = BranchesView;
window.BranchDetail = BranchDetail;
