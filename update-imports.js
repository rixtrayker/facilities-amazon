const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, 'src');

function fixViews() {
  const views = fs.readdirSync(path.join(SRC_DIR, 'views')).filter(f => f.endsWith('.jsx'));
  for (const view of views) {
    const p = path.join(SRC_DIR, 'views', view);
    let code = fs.readFileSync(p, 'utf8');

    // Replace old Shared import
    const importMatch = code.match(/import\s+\{([^}]+)\}\s+from\s+["']\.\.\/components\/Shared["'];/);
    if (importMatch) {
      const allImports = importMatch[1].split(',').map(s => s.trim()).filter(Boolean);
      const utilsList = ["fmtMoney", "fmtMoneyShort", "fmtDate", "fmtDateFull", "daysBetween", "ticketCost", "isOpen", "isOverdue", "initials", "vendorScore", "groupTickets"];
      
      const compImports = allImports.filter(i => !utilsList.includes(i));
      const utilImports = allImports.filter(i => utilsList.includes(i));

      let newImports = "";
      if (compImports.length > 0) {
        newImports += `import { ${compImports.join(", ")} } from "../components";\n`;
      }
      if (utilImports.length > 0) {
        newImports += `import { ${utilImports.join(", ")} } from "../lib/utils";\n`;
      }

      code = code.replace(importMatch[0], newImports.trim());
    }
    
    // Check if view-settings.jsx needs updates (it might have a different import)
    if (view === 'view-settings.jsx') {
      code = code.replace(/import\s+\{([^}]+)\}\s+from\s+["']\.\.\/components\/Shared["'];/, 'import { $1 } from "../components";');
    }

    fs.writeFileSync(p, code);
  }
}

function fixPage() {
  const p = path.join(SRC_DIR, 'app', 'page.js');
  let code = fs.readFileSync(p, 'utf8');

  // Replace import isOpen from Shared
  code = code.replace(/import\s+\{\s*isOpen\s*\}\s+from\s+["']\.\.\/components\/Shared["'];/, 'import { isOpen } from "../lib/utils";\\nimport { Sidebar } from "../components/layout/Sidebar";\\nimport { Topbar } from "../components/layout/Topbar";');

  // Replace <aside className="rail">...</aside>
  code = code.replace(/<aside className="rail">[\s\S]*?<\/aside>/, '<Sidebar railItems={railItems} railActive={railActive} goto={goto} />');

  // Replace <header className="topbar">...</header>
  code = code.replace(/<header className="topbar">[\s\S]*?<\/header>/, '<Topbar crumbs={crumbs} openCount={openCount} needsDecision={needsDecision} inMaintenanceCount={tickets.filter(t => t.status === "In Maintenance").length} newTicket={newTicket} />');

  fs.writeFileSync(p, code);
}

fixViews();
fixPage();

// Also remove Shared.jsx
const sharedPath = path.join(SRC_DIR, 'components', 'Shared.jsx');
if (fs.existsSync(sharedPath)) {
  fs.unlinkSync(sharedPath);
}

console.log('Imports and page updated.');
