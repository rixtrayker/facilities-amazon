export const fmtMoney = (n) => `EGP ${Math.round(n).toLocaleString()}`;
export const fmtMoneyShort = (n) => {
  if (n >= 1_000_000) return `EGP ${(n/1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `EGP ${(n/1_000).toFixed(1)}K`;
  return `EGP ${n}`;
};
export const fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};
export const fmtDateFull = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};
export const daysBetween = (a, b) => {
  if (!a) return 0;
  const end = b ? new Date(b) : new Date("2026-05-15");
  return Math.max(0, Math.round((end - new Date(a)) / 86400000));
};
export const ticketCost = (t) => (Number(t.sparePartsCost)||0) + (Number(t.visitCost)||0);
export const isOpen = (t) => !["Closed","Rejected","Duplicate"].includes(t.status);
export const isOverdue = (t) => isOpen(t) && daysBetween(t.createdDate) >= 7;
export const initials = (name) => (name||"").split(/\s+/).map(s => s[0]).filter(Boolean).slice(0,2).join("").toUpperCase();

export function vendorScore(vendor, allTickets) {
  const ts = allTickets.filter(t => t.vendorId === vendor.id);
  const closed = ts.filter(t => t.status === "Closed");
  const avg = closed.length ? closed.reduce((s, t) => s + daysBetween(t.createdDate, t.closedDate), 0) / closed.length : 0;
  const spend = ts.reduce((s, t) => s + ticketCost(t), 0);
  let grade = "—";
  if (closed.length === 0) grade = "—";
  else if (avg < 4)  grade = "A";
  else if (avg < 7)  grade = "B";
  else if (avg < 12) grade = "C";
  else               grade = "D";
  return { tickets: ts.length, closed: closed.length, avg: Math.round(avg * 10) / 10, spend, grade };
}

export function groupTickets(tickets, dimension, lookups) {
  const { branchById, vendorById, agentById } = lookups;
  const map = new Map();
  const keyOf = (t) => {
    switch (dimension) {
      case "branch":   return [t.branchId, branchById[t.branchId]?.name || "—"];
      case "zone":     return [branchById[t.branchId]?.zone || "—", branchById[t.branchId]?.zone || "—"];
      case "category": return [t.category, t.category];
      case "vendor":   return [t.vendorId || 0, vendorById[t.vendorId]?.name || "Unassigned"];
      case "agent":    return [t.agentId  || 0, agentById[t.agentId]?.name  || "Unassigned"];
      case "status":   return [t.status, t.status];
      case "priority": return [t.priority, t.priority];
      case "maint":    return [t.maintenanceType, t.maintenanceType];
      case "month":    {
        const m = (t.createdDate || "").slice(0, 7);
        return [m, m];
      }
      default: return ["—","—"];
    }
  };
  for (const t of tickets) {
    const [key, label] = keyOf(t);
    if (!map.has(key)) map.set(key, { key, label, count: 0, spend: 0, days: 0, closedCount: 0, openCount: 0 });
    const row = map.get(key);
    row.count += 1;
    row.spend += ticketCost(t);
    if (t.status === "Closed") {
      row.closedCount += 1;
      row.days += daysBetween(t.createdDate, t.closedDate);
    }
    if (isOpen(t)) row.openCount += 1;
  }
  return Array.from(map.values()).map(r => ({
    ...r,
    avgDays: r.closedCount ? Math.round((r.days / r.closedCount) * 10) / 10 : null,
  })).sort((a, b) => b.spend - a.spend || b.count - a.count);
}
