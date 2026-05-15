// ── REPORTS — group-by + filters + charts ──────────────
function ReportsView({ tickets, branches, vendors, agents }) {
  const [groupBy, setGroupBy] = useState("branch");
  const [metric, setMetric]   = useState("spend");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo,   setDateTo]   = useState("");
  const [filters, setFilters] = useState({ status: "", branchId: "", category: "", priority: "", vendorId: "", zone: "", maintenanceType: "" });
  const [preset, setPreset] = useState(null);

  const branchById = useMemo(() => Object.fromEntries(branches.map(b => [b.id, b])), [branches]);
  const vendorById = useMemo(() => Object.fromEntries(vendors.map(v => [v.id, v])), [vendors]);
  const agentById  = useMemo(() => Object.fromEntries(agents.map(a => [a.id, a])), [agents]);

  // ── preset reports ───────────────────────────────────
  const reportPresets = [
    { key: "spend-branch",   label: "Spend by branch",   icon: "ti-map-pin",   apply: () => { setGroupBy("branch");   setMetric("spend"); } },
    { key: "spend-vendor",   label: "Spend by vendor",   icon: "ti-truck",     apply: () => { setGroupBy("vendor");   setMetric("spend"); } },
    { key: "spend-category", label: "Spend by category", icon: "ti-tools",     apply: () => { setGroupBy("category"); setMetric("spend"); } },
    { key: "volume-month",   label: "Volume by month",   icon: "ti-calendar",  apply: () => { setGroupBy("month");    setMetric("count"); } },
    { key: "speed-vendor",   label: "Vendor speed",      icon: "ti-clock-bolt",apply: () => { setGroupBy("vendor");   setMetric("avgDays"); } },
    { key: "spend-zone",     label: "Spend by zone",     icon: "ti-map-2",     apply: () => { setGroupBy("zone");     setMetric("spend"); } },
  ];

  let scoped = tickets;
  if (dateFrom) scoped = scoped.filter(t => t.createdDate >= dateFrom);
  if (dateTo)   scoped = scoped.filter(t => t.createdDate <= dateTo);
  if (filters.status)          scoped = scoped.filter(t => t.status === filters.status);
  if (filters.branchId)        scoped = scoped.filter(t => t.branchId === Number(filters.branchId));
  if (filters.category)        scoped = scoped.filter(t => t.category === filters.category);
  if (filters.priority)        scoped = scoped.filter(t => t.priority === filters.priority);
  if (filters.vendorId)        scoped = scoped.filter(t => t.vendorId === Number(filters.vendorId));
  if (filters.zone)            scoped = scoped.filter(t => branchById[t.branchId]?.zone === filters.zone);
  if (filters.maintenanceType) scoped = scoped.filter(t => t.maintenanceType === filters.maintenanceType);

  const rows = groupTickets(scoped, groupBy, { branchById, vendorById, agentById });
  rows.sort((a, b) => {
    if (metric === "spend")   return b.spend - a.spend;
    if (metric === "count")   return b.count - a.count;
    if (metric === "avgDays") return (b.avgDays ?? -1) - (a.avgDays ?? -1);
    return 0;
  });

  const totals = {
    count: scoped.length,
    spend: scoped.reduce((s,t) => s + ticketCost(t), 0),
    open:  scoped.filter(isOpen).length,
    closed:scoped.filter(t => t.status === "Closed").length,
  };
  const maxValue = Math.max(
    ...rows.map(r => metric === "spend" ? r.spend : metric === "count" ? r.count : r.avgDays || 0),
    1
  );

  const zones = [...new Set(branches.map(b => b.zone))];

  // ── monthly trend bar chart ─────────────────────────
  const months = {};
  scoped.forEach(t => {
    const m = (t.createdDate || "").slice(0,7);
    if (!m) return;
    if (!months[m]) months[m] = { count: 0, spend: 0 };
    months[m].count += 1;
    months[m].spend += ticketCost(t);
  });
  const trendData = Object.keys(months).sort().slice(-12).map(m => ({
    label: new Date(m + "-01").toLocaleString("en-US", { month: "short" }).toUpperCase(),
    value: metric === "count" ? months[m].count : months[m].spend,
  }));

  // ── donut: top 6 groups + Other ──────────────────────
  const top6 = rows.slice(0, 6);
  const rest = rows.slice(6);
  const restSum = rest.reduce((s,r) => s + (metric === "spend" ? r.spend : metric === "count" ? r.count : 0), 0);
  const donutData = [
    ...top6.map((r, i) => ({ label: r.label, value: metric === "spend" ? r.spend : metric === "count" ? r.count : (r.avgDays || 0), color: DONUT_PALETTE[i % DONUT_PALETTE.length] })),
    ...(restSum > 0 ? [{ label: `Other (${rest.length})`, value: restSum, color: "var(--muted-2)" }] : []),
  ];

  const exportCsv = () => {
    const head = [`Group by: ${groupBy}`, "label", "count", "openCount", "closedCount", "spend (EGP)", "avgDays"].join(",");
    const lines = rows.map(r => ["", JSON.stringify(r.label), r.count, r.openCount, r.closedCount, r.spend, r.avgDays ?? ""].join(","));
    const csv = [head, ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `report-${groupBy}-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const groupLabels = {
    branch:   "Branch",
    zone:     "Zone",
    category: "Category",
    vendor:   "Vendor",
    agent:    "Agent",
    status:   "Status",
    priority: "Priority",
    maint:    "Maintenance type",
    month:    "Month",
  };

  const groupOptions  = Object.entries(groupLabels).map(([k,l]) => ({ value: k, label: l }));
  const metricOptions = [
    { value: "spend",   label: "Total spend",       icon: "ti-coin" },
    { value: "count",   label: "Ticket count",      icon: "ti-tickets" },
    { value: "avgDays", label: "Avg time to close", icon: "ti-clock" },
  ];

  const valueFmt = metric === "spend" ? fmtMoneyShort : (v) => v.toString();

  return (
    <div className="canvas-inner">
      <div style={{ marginBottom: 18, display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div className="section-eyebrow">Reports</div>
          <h1 className="section-title">Breakdown · by {groupLabels[groupBy].toLowerCase()}</h1>
        </div>
        <button className="btn" onClick={exportCsv}><i className="ti ti-download"></i> Export CSV</button>
      </div>

      {/* report presets */}
      <div className="presets">
        <span className="lbl">Preset reports</span>
        {reportPresets.map(p => (
          <div key={p.key} className={`preset ${preset === p.key ? "active" : ""}`}
               onClick={() => { p.apply(); setPreset(p.key); }}>
            <i className={`ti ${p.icon}`}></i>
            {p.label}
          </div>
        ))}
      </div>

      {/* group-by / sort-by row */}
      <div className="filters" style={{ marginBottom: 14 }}>
        <Select prefix="Group by" value={groupBy} onChange={v => { setGroupBy(v); setPreset(null); }} options={groupOptions} icon="ti-layout-grid" />
        <Select prefix="Sort by"  value={metric}  onChange={v => { setMetric(v); setPreset(null); }} options={metricOptions} icon="ti-arrows-sort" />
        <div style={{ flex: 1 }}></div>
      </div>

      {/* filters row */}
      <div className="filters">
        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Filters</span>
        <input type="date" className="input" style={{ width: "auto", minWidth: 0 }} value={dateFrom} onChange={e => setDateFrom(e.target.value)} title="From date" />
        <span style={{ color: "var(--muted)" }}>→</span>
        <input type="date" className="input" style={{ width: "auto", minWidth: 0 }} value={dateTo} onChange={e => setDateTo(e.target.value)} title="To date" />
        <Select value={filters.zone}             onChange={v => setFilters(f => ({ ...f, zone: v }))}             options={zones.map(z => ({ value:z, label:z }))} placeholder="Zone" allowEmpty emptyLabel="All zones" />
        <Select value={filters.branchId}         onChange={v => setFilters(f => ({ ...f, branchId: v }))}         options={branches.map(b => ({ value:b.id, label:b.name, sub:b.zone }))} placeholder="Branch" allowEmpty emptyLabel="All branches" searchable />
        <Select value={filters.category}         onChange={v => setFilters(f => ({ ...f, category: v }))}         options={Object.keys(CATEGORIES).map(c => ({ value:c, label:c, icon:CATEGORIES[c].icon, color:CATEGORIES[c].color }))} placeholder="Category" allowEmpty emptyLabel="All categories" />
        <Select value={filters.vendorId}         onChange={v => setFilters(f => ({ ...f, vendorId: v }))}         options={vendors.map(v => ({ value:v.id, label:v.name, sub:v.specialty }))} placeholder="Vendor" allowEmpty emptyLabel="All vendors" searchable />
        <Select value={filters.status}           onChange={v => setFilters(f => ({ ...f, status: v }))}           options={STATUSES.map(s => ({ value:s.key, label:s.key }))} placeholder="Status" allowEmpty emptyLabel="All statuses" />
        <Select value={filters.priority}         onChange={v => setFilters(f => ({ ...f, priority: v }))}         options={PRIORITIES.map(p => ({ value:p.key, label:p.key }))} placeholder="Priority" allowEmpty emptyLabel="All priorities" />
        <Select value={filters.maintenanceType}  onChange={v => setFilters(f => ({ ...f, maintenanceType: v }))}  options={MAINT_TYPES.map(m => ({ value:m, label:m }))} placeholder="Maint." allowEmpty emptyLabel="All maint. types" />
        {(Object.values(filters).some(Boolean) || dateFrom || dateTo) && (
          <button className="btn btn-sm btn-ghost" onClick={() => { setFilters({ status: "", branchId: "", category: "", priority: "", vendorId: "", zone: "", maintenanceType: "" }); setDateFrom(""); setDateTo(""); }}>
            <i className="ti ti-x"></i> Clear filters
          </button>
        )}
      </div>

      {/* totals strip */}
      <div className="cols-4" style={{ marginBottom: 18 }}>
        <Kpi label="Tickets in scope" value={totals.count} />
        <Kpi label="Open" value={totals.open} />
        <Kpi label="Closed" value={totals.closed} />
        <div className="kpi" style={{ background: "var(--accent-soft)", borderColor: "var(--accent-line)" }}>
          <div className="kpi-label" style={{ color: "var(--warning)" }}>Total spend</div>
          <div className="kpi-value" style={{ color: "var(--accent-ink)" }}>{fmtMoneyShort(totals.spend)}</div>
          <div className="kpi-sub" style={{ color: "var(--warning)" }}>parts + visits</div>
        </div>
      </div>

      {/* donut + monthly trend */}
      <div className="cols-2" style={{ marginBottom: 22 }}>
        <Card>
          <CardHead title={`${groupLabels[groupBy]} · ${metric === 'spend' ? 'spend' : metric === 'count' ? 'volume' : 'avg close'} mix`} icon="ti-chart-pie" />
          {donutData.length > 0 ? (
            <DonutWithLegend data={donutData} centerValue={rows.length} centerLabel="groups" valueFmt={valueFmt} />
          ) : (
            <div className="empty"><i className="ti ti-chart-pie"></i><p>No data in scope.</p></div>
          )}
        </Card>

        <Card>
          <CardHead title={`Trend · ${metric === 'count' ? 'tickets opened' : 'spend'} per month`} icon="ti-chart-bar" />
          {trendData.length > 0 ? (
            <BarChart data={trendData} valueFmt={metric === "count" ? (v) => v : (v) => v >= 1000 ? `${Math.round(v/1000)}K` : v.toString()} />
          ) : (
            <div className="empty"><i className="ti ti-chart-bar"></i><p>No data in scope.</p></div>
          )}
        </Card>
      </div>

      {/* breakdown table */}
      <Card>
        <CardHead title={`Breakdown · ${groupLabels[groupBy]} × ${metric === 'spend' ? 'spend' : metric === 'count' ? 'count' : 'avg close'}`} icon="ti-list-details" count={rows.length} />
        <table className="tbl">
          <thead><tr>
            <th style={{ width: "26%" }}>{groupLabels[groupBy]}</th>
            <th>Share</th>
            <th style={{ textAlign: "right" }}>Tickets</th>
            <th style={{ textAlign: "right" }}>Open</th>
            <th style={{ textAlign: "right" }}>Closed</th>
            <th style={{ textAlign: "right" }}>Avg close</th>
            <th style={{ textAlign: "right" }}>Spend</th>
          </tr></thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={7}><div className="empty"><i className="ti ti-chart-bar"></i><p>No data matches your filters.</p></div></td></tr>
            ) : rows.map((r, i) => {
              const val = metric === "spend" ? r.spend : metric === "count" ? r.count : (r.avgDays || 0);
              const pct = (val / maxValue) * 100;
              return (
                <tr key={r.key}>
                  <td style={{ fontWeight: 500 }}>
                    <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: DONUT_PALETTE[i % DONUT_PALETTE.length], marginRight: 8, verticalAlign: "middle" }}></span>
                    {r.label}
                  </td>
                  <td>
                    <div className="progress accent" style={{ minWidth: 120 }}>
                      <span style={{ width: `${pct}%`, background: metric === "spend" ? "var(--accent)" : "var(--ink)" }}></span>
                    </div>
                  </td>
                  <td className="num" style={{ textAlign: "right" }}>{r.count}</td>
                  <td className="num" style={{ textAlign: "right", color: r.openCount ? "var(--warning)" : "var(--muted)" }}>{r.openCount}</td>
                  <td className="num muted" style={{ textAlign: "right" }}>{r.closedCount}</td>
                  <td className="num muted" style={{ textAlign: "right" }}>{r.avgDays !== null ? `${r.avgDays}d` : "—"}</td>
                  <td className="num" style={{ textAlign: "right", fontWeight: 600 }}>{fmtMoney(r.spend)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <div style={{ marginTop: 28 }}>
        <div className="section-eyebrow">Cross-tab</div>
        <h2 className="section-title">{groupLabels[groupBy]} × Category</h2>
        <CrossTab rows={rows.slice(0, 8)} tickets={scoped} groupBy={groupBy} branchById={branchById} />
      </div>
    </div>
  );
}

function CrossTab({ rows, tickets, groupBy, branchById }) {
  const cats = Object.keys(CATEGORIES);
  const keyOf = (t) => {
    switch (groupBy) {
      case "branch":   return t.branchId;
      case "zone":     return branchById[t.branchId]?.zone;
      case "category": return t.category;
      case "vendor":   return t.vendorId || 0;
      case "agent":    return t.agentId || 0;
      case "status":   return t.status;
      case "priority": return t.priority;
      case "maint":    return t.maintenanceType;
      case "month":    return (t.createdDate || "").slice(0,7);
      default:         return null;
    }
  };

  const cell = (rowKey, cat) => tickets.filter(t => keyOf(t) === rowKey && t.category === cat).reduce((s,t) => s + ticketCost(t), 0);
  const maxCell = Math.max(...rows.flatMap(r => cats.map(c => cell(r.key, c))), 1);

  return (
    <Card>
      <table className="tbl heatmap" style={{ tableLayout: "fixed" }}>
        <thead><tr>
          <th style={{ width: 180 }}>{groupBy === "branch" ? "Branch" : groupBy}</th>
          {cats.map(c => <th key={c} style={{ textAlign: "right", fontSize: 9 }} title={c}>{c.split(" ")[0]}</th>)}
          <th style={{ textAlign: "right" }}>Total</th>
        </tr></thead>
        <tbody>
          {rows.map(r => {
            const total = cats.reduce((s,c) => s + cell(r.key, c), 0);
            return (
              <tr key={r.key}>
                <td style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.label}</td>
                {cats.map(c => {
                  const v = cell(r.key, c);
                  const intensity = v / maxCell;
                  return (
                    <td key={c} style={{ textAlign: "right", background: v > 0 ? `rgba(255,153,0,${0.08 + intensity * 0.45})` : "transparent" }}>
                      <span className="mono" style={{ fontSize: 11, color: v > 0 ? "var(--ink)" : "var(--muted-2)" }}>
                        {v > 0 ? fmtMoneyShort(v).replace("EGP ", "") : "·"}
                      </span>
                    </td>
                  );
                })}
                <td className="num" style={{ textAlign: "right", fontWeight: 600 }}>{fmtMoneyShort(total)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}

window.ReportsView = ReportsView;
