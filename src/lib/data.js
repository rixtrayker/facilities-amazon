/* cache-bust */
// ── Amazon Now Egypt — facilities data ─────────────────
// Amazon Now = quick-commerce dark stores. Smaller, more numerous than FCs.

const BRANCHES = [
  { id: 1,  code: "ANW-CAI-01", name: "Maadi Degla",         zone: "South Cairo", type: "Amazon Now Station", openedAt: "2023-04-12", sqm: 420, manager: "Karem Adel" },
  { id: 2,  code: "ANW-CAI-02", name: "Maadi Sarayat",       zone: "South Cairo", type: "Amazon Now Station", openedAt: "2023-06-02", sqm: 380, manager: "Karem Adel" },
  { id: 3,  code: "ANW-CAI-03", name: "Zamalek",             zone: "Central Cairo", type: "Amazon Now Station", openedAt: "2023-08-21", sqm: 360, manager: "M. Khalifa" },
  { id: 4,  code: "ANW-CAI-04", name: "Heliopolis Korba",    zone: "East Cairo", type: "Amazon Now Station", openedAt: "2024-01-15", sqm: 410, manager: "Ali Werdany" },
  { id: 5,  code: "ANW-CAI-05", name: "Nasr City — Makram",  zone: "East Cairo", type: "Amazon Now Station", openedAt: "2024-02-08", sqm: 440, manager: "Ali Werdany" },
  { id: 6,  code: "ANW-CAI-06", name: "New Cairo — 90th St", zone: "New Cairo", type: "Amazon Now Station", openedAt: "2023-11-04", sqm: 520, manager: "Abdelrahman" },
  { id: 7,  code: "ANW-CAI-07", name: "Rehab",               zone: "New Cairo", type: "Amazon Now Station", openedAt: "2024-04-30", sqm: 390, manager: "Abdelrahman" },
  { id: 8,  code: "ANW-CAI-08", name: "Madinaty",            zone: "New Cairo", type: "Amazon Now Station", openedAt: "2024-07-19", sqm: 420, manager: "Abdelrahman" },
  { id: 9,  code: "ANW-GZA-01", name: "Mohandessin",         zone: "Giza", type: "Amazon Now Station", openedAt: "2023-09-12", sqm: 370, manager: "Mostafa Khaled" },
  { id: 10, code: "ANW-GZA-02", name: "Dokki",               zone: "Giza", type: "Amazon Now Station", openedAt: "2023-10-25", sqm: 340, manager: "Mostafa Khaled" },
  { id: 11, code: "ANW-GZA-03", name: "6th October — Hosary",zone: "October & Zayed", type: "Amazon Now Station", openedAt: "2024-03-12", sqm: 480, manager: "Mostafa Khaled" },
  { id: 12, code: "ANW-GZA-04", name: "Sheikh Zayed — Arkan",zone: "October & Zayed", type: "Amazon Now Station", openedAt: "2024-05-08", sqm: 510, manager: "M. Khalifa" },
  { id: 13, code: "ANW-ALX-01", name: "Smouha",              zone: "Alexandria", type: "Amazon Now Station", openedAt: "2024-08-21", sqm: 400, manager: "Mostafa Khaled" },
  { id: 14, code: "ANW-ALX-02", name: "Stanley",             zone: "Alexandria", type: "Amazon Now Station", openedAt: "2024-09-10", sqm: 380, manager: "Mostafa Khaled" },
  { id: 15, code: "ANW-HQ-01",  name: "Smart Village HQ",    zone: "October & Zayed", type: "Office", openedAt: "2022-11-01", sqm: 1800, manager: "M. Khalifa" },
  { id: 16, code: "ANW-DC-01",  name: "Obour Dark-DC",       zone: "East Cairo", type: "Distribution Center", openedAt: "2023-02-14", sqm: 2400, manager: "M. Khalifa" },
];

const VENDORS = [
  { id: 1, name: "EL Hayah",      specialty: "Civil & Doors",        contact: "+20 100 555 0123", contractType: "Variable" },
  { id: 2, name: "DAR",           specialty: "Network & IT",         contact: "+20 100 555 0145", contractType: "SLA" },
  { id: 3, name: "MERGI",         specialty: "HVAC & Refrigeration", contact: "+20 100 555 0167", contractType: "Variable" },
  { id: 4, name: "Electric Fire", specialty: "Electrical",           contact: "+20 100 555 0189", contractType: "Variable" },
  { id: 5, name: "ORA",           specialty: "FF&E & Carpentry",     contact: "+20 100 555 0201", contractType: "PO-based" },
  { id: 6, name: "Ice Berg",      specialty: "Cold Chain",           contact: "+20 100 555 0223", contractType: "SLA" },
  { id: 7, name: "Internal",      specialty: "Tier-1 (in-house)",    contact: "ops@amazon-now.eg", contractType: "Salaried" },
];

const AGENTS = [
  { id: 1, name: "M. Khalifa",      role: "Facilities Lead",     zone: "October & Zayed, Central Cairo" },
  { id: 2, name: "Karem Adel",      role: "Site Coordinator",    zone: "South Cairo" },
  { id: 3, name: "Ali Werdany",     role: "Site Coordinator",    zone: "East Cairo" },
  { id: 4, name: "Abdelrahman M.",  role: "Site Coordinator",    zone: "New Cairo" },
  { id: 5, name: "Mostafa Khaled",  role: "Regional Coordinator",zone: "Giza, Alex" },
];

const CATEGORIES = {
  "HVAC":              { icon: "ti-snowflake",    color: "#0E6BA8", types: ["AC unit", "Walk-in chiller", "Walk-in freezer", "Ice maker", "Air curtain", "Ventilation"] },
  "Civil":             { icon: "ti-tools",        color: "#7A6A50", types: ["Plumbing", "Painting", "Flooring", "Ceiling", "Wall / partition", "General civil"] },
  "Doors & Glass":     { icon: "ti-door",         color: "#0E6BA8", types: ["Glass door", "Roll-up door", "Door mechanism", "Window", "Storefront"] },
  "Electrical":        { icon: "ti-bolt",         color: "#B45309", types: ["Wiring", "Lighting", "UPS / battery", "Breaker / panel", "Generator"] },
  "Network & IT":      { icon: "ti-wifi",         color: "#1D4ED8", types: ["WiFi / network", "CCTV cameras", "Printer", "POS / scanner", "Cabling"] },
  "FF&E":              { icon: "ti-armchair-2",   color: "#6F37B0", types: ["Shelving", "Picking cart", "Workbench", "Office furniture"] },
  "Cleaning & Pest":   { icon: "ti-spray",        color: "#1F7A4D", types: ["Deep cleaning", "Pest control", "Waste removal"] },
  "Safety & Security": { icon: "ti-shield",       color: "#C92A2A", types: ["Fire system", "Alarm", "Access control", "Signage"] },
};

const STATUSES = [
  { key: "New",              cls: "badge-status-new",       desc: "Just reported, awaiting triage." },
  { key: "In Progress",      cls: "badge-status-progress",  desc: "Assigned, work underway." },
  { key: "Pending",          cls: "badge-status-pending",   desc: "Blocked — waiting for parts or info." },
  { key: "Waiting Approval", cls: "badge-status-waiting",   desc: "Cost over threshold — needs sign-off." },
  { key: "In Maintenance",   cls: "badge-status-maint",     desc: "Vendor on-site, repairing." },
  { key: "Closed",           cls: "badge-status-closed",    desc: "Resolved and signed off." },
  { key: "Rejected",         cls: "badge-status-rejected",  desc: "Not actionable / out of scope." },
  { key: "Duplicate",        cls: "badge-status-duplicate", desc: "Same as another open ticket." },
];

const PRIORITIES = [
  { key: "Low",       cls: "badge-prio-low"       },
  { key: "Medium",    cls: "badge-prio-medium"    },
  { key: "High",      cls: "badge-prio-high"      },
  { key: "Quotation", cls: "badge-prio-quotation" },
];

const MAINT_TYPES = ["Maintenance", "Modification", "Installation", "Supply", "Removal", "Inspection", "Emergency"];

// helpers used to build sample tickets
const d = (offsetDays) => {
  const x = new Date("2026-05-15");
  x.setDate(x.getDate() + offsetDays);
  return x.toISOString().split("T")[0];
};

const TICKETS = [
  // — Active / urgent ────────────────────────────────────────
  { id: 1,  code: "ANW-26-0148", title: "Walk-in freezer F-02 temp alarm",         description: "Freezer holding +4°C, should be -18°C. Frozen SKUs at risk. Vendor en route.",                              branchId: 1,  category: "HVAC",              ticketType: "Walk-in freezer", agentId: 1, vendorId: 6, status: "In Maintenance",    maintenanceType: "Emergency",     priority: "High",      sparePartsCost: 4200, visitCost: 1800, createdDate: d(-1),  closedDate: "", reporter: "Store Lead — Maadi Degla" },
  { id: 2,  code: "ANW-26-0147", title: "Storefront glass cracked overnight",      description: "Right pane of main entrance cracked. Suspected vandalism. Photos attached.",                             branchId: 3,  category: "Doors & Glass",     ticketType: "Glass door",      agentId: 1, vendorId: 1, status: "Waiting Approval",  maintenanceType: "Modification",  priority: "High",      sparePartsCost: 8500, visitCost: 1500, createdDate: d(-2),  closedDate: "", reporter: "Security — Zamalek" },
  { id: 3,  code: "ANW-26-0146", title: "Half lighting dead in picking area",       description: "Track on aisle 3 not working. Pickers using phone torches. Tested breaker, not the cause.",              branchId: 6,  category: "Electrical",        ticketType: "Lighting",        agentId: 4, vendorId: 4, status: "In Progress",       maintenanceType: "Maintenance",   priority: "High",      sparePartsCost: 950,  visitCost: 800,  createdDate: d(-1),  closedDate: "", reporter: "Shift Lead — New Cairo" },
  { id: 4,  code: "ANW-26-0145", title: "POS scanner #3 not reading",                description: "Scanner doesn't read barcodes. Restarted POS, no change. Likely hardware.",                             branchId: 4,  category: "Network & IT",      ticketType: "POS / scanner",   agentId: 3, vendorId: 2, status: "In Progress",       maintenanceType: "Maintenance",   priority: "Medium",    sparePartsCost: 0,    visitCost: 600,  createdDate: d(-1),  closedDate: "", reporter: "Store Lead — Heliopolis" },
  { id: 5,  code: "ANW-26-0144", title: "WiFi drops every ~20 minutes",              description: "Repeated WiFi outages disrupting handheld scanners. Reported by 3 picking staff today.",               branchId: 11, category: "Network & IT",      ticketType: "WiFi / network",  agentId: 5, vendorId: 2, status: "Pending",           maintenanceType: "Maintenance",   priority: "High",      sparePartsCost: 0,    visitCost: 0,    createdDate: d(-3),  closedDate: "", reporter: "Store Lead — 6 October" },
  { id: 6,  code: "ANW-26-0143", title: "Roll-up door won't fully close",            description: "Loading bay roll-up door stops 30cm above ground. Manual close possible.",                              branchId: 16, category: "Doors & Glass",     ticketType: "Roll-up door",    agentId: 1, vendorId: 1, status: "Pending",           maintenanceType: "Maintenance",   priority: "Medium",    sparePartsCost: 0,    visitCost: 0,    createdDate: d(-4),  closedDate: "", reporter: "DC Supervisor — Obour" },
  { id: 7,  code: "ANW-26-0142", title: "Office chairs — replace damaged set",       description: "8 ergonomic chairs in OOC room beyond repair. Supply requested.",                                     branchId: 15, category: "FF&E",              ticketType: "Office furniture",agentId: 1, vendorId: 5, status: "Waiting Approval",  maintenanceType: "Supply",        priority: "Low",       sparePartsCost: 9600, visitCost: 0,    createdDate: d(-3),  closedDate: "", reporter: "Admin — Smart Village HQ" },

  // — New (not yet triaged) ─────────────────────────────────
  { id: 8,  code: "ANW-26-0141", title: "AC dripping water on stock — aisle 5",      description: "Indoor unit dripping condensate. Tarps placed under, but FMCG stock area below.",                       branchId: 7,  category: "HVAC",              ticketType: "AC unit",         agentId: null, vendorId: null, status: "New",          maintenanceType: "Maintenance",   priority: "High",      sparePartsCost: 0,    visitCost: 0,    createdDate: d(0),  closedDate: "", reporter: "Store Lead — Rehab" },
  { id: 9,  code: "ANW-26-0140", title: "Ceiling tile water stain forming",          description: "Brown stain appeared on ceiling tile near server cabinet. No active leak visible yet.",                 branchId: 9,  category: "Civil",             ticketType: "Ceiling",         agentId: null, vendorId: null, status: "New",          maintenanceType: "Inspection",    priority: "Medium",    sparePartsCost: 0,    visitCost: 0,    createdDate: d(0),  closedDate: "", reporter: "Store Lead — Mohandessin" },
  { id: 10, code: "ANW-26-0139", title: "Camera #7 offline — back room",             description: "Camera covering rear stockroom offline since this morning shift change.",                              branchId: 5,  category: "Network & IT",      ticketType: "CCTV cameras",    agentId: null, vendorId: null, status: "New",          maintenanceType: "Maintenance",   priority: "Medium",    sparePartsCost: 0,    visitCost: 0,    createdDate: d(0),  closedDate: "", reporter: "Security — Nasr City" },

  // — Recently closed ───────────────────────────────────────
  { id: 11, code: "ANW-26-0138", title: "Replaced UPS battery — server cabinet",     description: "Preventive replacement before quarterly load test.",                                                  branchId: 15, category: "Electrical",        ticketType: "UPS / battery",   agentId: 1, vendorId: 4, status: "Closed",            maintenanceType: "Supply",        priority: "Medium",    sparePartsCost: 3800, visitCost: 1200, createdDate: d(-9),  closedDate: d(-2), reporter: "IT — HQ" },
  { id: 12, code: "ANW-26-0137", title: "Quarterly pest control — all Cairo East",    description: "Scheduled pest control visit for East Cairo branches (4 stations).",                                  branchId: 4,  category: "Cleaning & Pest",   ticketType: "Pest control",    agentId: 3, vendorId: 7, status: "Closed",            maintenanceType: "Maintenance",   priority: "Low",       sparePartsCost: 0,    visitCost: 2400, createdDate: d(-12), closedDate: d(-5), reporter: "Schedule — Auto" },
  { id: 13, code: "ANW-26-0136", title: "Repainted picking floor markings",          description: "Yellow & blue floor markings faded. Repainted overnight.",                                            branchId: 2,  category: "Civil",             ticketType: "Painting",        agentId: 2, vendorId: 1, status: "Closed",            maintenanceType: "Maintenance",   priority: "Low",       sparePartsCost: 600,  visitCost: 1500, createdDate: d(-15), closedDate: d(-9), reporter: "Store Lead — Maadi Sarayat" },
  { id: 14, code: "ANW-26-0135", title: "Walk-in chiller compressor service",         description: "Annual service. Cleaned coils, replaced filters, tested defrost cycle.",                              branchId: 6,  category: "HVAC",              ticketType: "Walk-in chiller", agentId: 4, vendorId: 3, status: "Closed",            maintenanceType: "Maintenance",   priority: "Medium",    sparePartsCost: 1800, visitCost: 2200, createdDate: d(-18), closedDate: d(-11), reporter: "Store Lead — New Cairo" },
  { id: 15, code: "ANW-26-0134", title: "Smouha — install new shelving section",     description: "Added 4 m of additional shelving in dry goods zone for new SKU expansion.",                            branchId: 13, category: "FF&E",              ticketType: "Shelving",        agentId: 5, vendorId: 5, status: "Closed",            maintenanceType: "Installation",  priority: "Medium",    sparePartsCost: 5400, visitCost: 1200, createdDate: d(-21), closedDate: d(-14), reporter: "Regional Ops" },
  { id: 16, code: "ANW-26-0133", title: "Fixed leaky tap — back staff WC",            description: "Replaced cartridge in cold tap; leak stopped.",                                                       branchId: 10, category: "Civil",             ticketType: "Plumbing",        agentId: 5, vendorId: 7, status: "Closed",            maintenanceType: "Maintenance",   priority: "Low",       sparePartsCost: 120,  visitCost: 0,    createdDate: d(-22), closedDate: d(-21), reporter: "Store Lead — Dokki" },
  { id: 17, code: "ANW-26-0132", title: "Replaced 12 LED tubes",                      description: "Aging LED tubes — bulk swap.",                                                                       branchId: 9,  category: "Electrical",        ticketType: "Lighting",        agentId: 5, vendorId: 4, status: "Closed",            maintenanceType: "Supply",        priority: "Low",       sparePartsCost: 1440, visitCost: 800,  createdDate: d(-25), closedDate: d(-18), reporter: "Store Lead — Mohandessin" },
  { id: 18, code: "ANW-26-0131", title: "Door mechanism replaced — Rehab",            description: "Sliding door auto-close mechanism replaced after 18 months.",                                        branchId: 7,  category: "Doors & Glass",     ticketType: "Door mechanism",  agentId: 4, vendorId: 1, status: "Closed",            maintenanceType: "Modification",  priority: "Medium",    sparePartsCost: 2200, visitCost: 1500, createdDate: d(-28), closedDate: d(-20), reporter: "Store Lead — Rehab" },
  { id: 19, code: "ANW-26-0130", title: "Fire alarm panel quarterly test",            description: "Scheduled inspection. All zones operational.",                                                       branchId: 16, category: "Safety & Security", ticketType: "Fire system",     agentId: 1, vendorId: 7, status: "Closed",            maintenanceType: "Inspection",    priority: "Medium",    sparePartsCost: 0,    visitCost: 1200, createdDate: d(-30), closedDate: d(-29), reporter: "Compliance" },
  { id: 20, code: "ANW-26-0129", title: "Painted entrance wall — Stanley",            description: "Front wall scuffed from cart traffic. Repainted.",                                                   branchId: 14, category: "Civil",             ticketType: "Painting",        agentId: 5, vendorId: 1, status: "Closed",            maintenanceType: "Maintenance",   priority: "Low",       sparePartsCost: 400,  visitCost: 1000, createdDate: d(-32), closedDate: d(-27), reporter: "Store Lead — Stanley" },
  { id: 21, code: "ANW-26-0128", title: "Stanley — replaced WiFi access point",       description: "AP showing intermittent issues for weeks; swapped under warranty.",                                  branchId: 14, category: "Network & IT",      ticketType: "WiFi / network",  agentId: 5, vendorId: 2, status: "Closed",            maintenanceType: "Maintenance",   priority: "Medium",    sparePartsCost: 0,    visitCost: 800,  createdDate: d(-35), closedDate: d(-30), reporter: "IT — Remote" },
  { id: 22, code: "ANW-26-0127", title: "Madinaty — air curtain installation",        description: "New air curtain at main entrance to reduce HVAC load.",                                              branchId: 8,  category: "HVAC",              ticketType: "Air curtain",     agentId: 4, vendorId: 3, status: "Closed",            maintenanceType: "Installation",  priority: "Medium",    sparePartsCost: 6800, visitCost: 1800, createdDate: d(-40), closedDate: d(-34), reporter: "Regional Ops" },
  { id: 23, code: "ANW-26-0126", title: "Smart Village HQ — server room AC service",  description: "Critical AC service. Cleaned, regassed, full diagnostic.",                                           branchId: 15, category: "HVAC",              ticketType: "AC unit",         agentId: 1, vendorId: 3, status: "Closed",            maintenanceType: "Maintenance",   priority: "High",      sparePartsCost: 2400, visitCost: 2200, createdDate: d(-42), closedDate: d(-38), reporter: "IT — HQ" },
  { id: 24, code: "ANW-26-0125", title: "Korba — new picking cart batch",             description: "10 new picking carts supplied to replace damaged fleet.",                                            branchId: 4,  category: "FF&E",              ticketType: "Picking cart",    agentId: 3, vendorId: 5, status: "Closed",            maintenanceType: "Supply",        priority: "Low",       sparePartsCost: 7500, visitCost: 0,    createdDate: d(-45), closedDate: d(-40), reporter: "Regional Ops" },
  { id: 25, code: "ANW-26-0124", title: "Annual safety signage refresh",              description: "Across-network signage refresh for compliance.",                                                    branchId: 1,  category: "Safety & Security", ticketType: "Signage",         agentId: 1, vendorId: 5, status: "Closed",            maintenanceType: "Supply",        priority: "Medium",    sparePartsCost: 3200, visitCost: 0,    createdDate: d(-50), closedDate: d(-44), reporter: "Compliance" },

  // — Older mix (for historical breakdown) ─────────────────
  { id: 26, code: "ANW-26-0123", title: "Generator monthly test — Obour",             description: "Routine load test passed.",                                                                          branchId: 16, category: "Electrical",        ticketType: "Generator",       agentId: 1, vendorId: 4, status: "Closed",            maintenanceType: "Inspection",    priority: "Medium",    sparePartsCost: 0,    visitCost: 1500, createdDate: d(-58), closedDate: d(-57), reporter: "Compliance" },
  { id: 27, code: "ANW-26-0122", title: "Smouha access control panel replaced",       description: "RFID reader at staff entrance failed; replaced with new model.",                                    branchId: 13, category: "Safety & Security", ticketType: "Access control",  agentId: 5, vendorId: 2, status: "Closed",            maintenanceType: "Modification",  priority: "High",      sparePartsCost: 2800, visitCost: 1200, createdDate: d(-60), closedDate: d(-55), reporter: "Security" },
  { id: 28, code: "ANW-26-0121", title: "Maadi Sarayat — pest inspection",            description: "Monthly inspection. No issues.",                                                                     branchId: 2,  category: "Cleaning & Pest",   ticketType: "Pest control",    agentId: 2, vendorId: 7, status: "Closed",            maintenanceType: "Inspection",    priority: "Low",       sparePartsCost: 0,    visitCost: 800,  createdDate: d(-62), closedDate: d(-61), reporter: "Compliance" },
  { id: 29, code: "ANW-26-0120", title: "Zamalek — repaint cashier wall",             description: "Marks from POS station; repainted.",                                                                 branchId: 3,  category: "Civil",             ticketType: "Painting",        agentId: 1, vendorId: 1, status: "Closed",            maintenanceType: "Maintenance",   priority: "Low",       sparePartsCost: 350,  visitCost: 900,  createdDate: d(-65), closedDate: d(-60), reporter: "Store Lead — Zamalek" },
  { id: 30, code: "ANW-26-0119", title: "Dokki — replace freezer door gasket",         description: "Door not sealing properly. Gasket replaced.",                                                       branchId: 10, category: "HVAC",              ticketType: "Walk-in freezer", agentId: 5, vendorId: 6, status: "Closed",            maintenanceType: "Maintenance",   priority: "Medium",    sparePartsCost: 1100, visitCost: 1500, createdDate: d(-70), closedDate: d(-65), reporter: "Store Lead — Dokki" },
];

// Make available on window for other scripts
export {
  BRANCHES, VENDORS, AGENTS, CATEGORIES, STATUSES, PRIORITIES, MAINT_TYPES, TICKETS,
};
