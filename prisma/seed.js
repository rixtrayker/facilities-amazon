const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  // Read and evaluate data.js to get the mock data
  const dataPath = path.join(__dirname, '../src/lib/data.js');
  let dataCode = fs.readFileSync(dataPath, 'utf8');
  // Replace export with module.exports so we can require it in this Node script
  dataCode = dataCode.replace('export {', 'module.exports = {');
  
  const m = { exports: {} };
  const wrapper = new Function('module', 'exports', dataCode);
  wrapper(m, m.exports);
  const { BRANCHES, VENDORS, AGENTS } = m.exports;

  console.log('Seeding Branches...');
  for (const b of BRANCHES) {
    await prisma.branch.upsert({
      where: { id: b.id },
      update: {},
      create: {
        id: b.id,
        code: b.code,
        name: b.name,
        zone: b.zone,
        type: b.type,
        openedAt: b.openedAt ? new Date(b.openedAt) : null,
        sqm: b.sqm,
        manager: b.manager,
      },
    });
  }

  console.log('Seeding Vendors...');
  for (const v of VENDORS) {
    await prisma.vendor.upsert({
      where: { id: v.id },
      update: {},
      create: {
        id: v.id,
        name: v.name,
        specialty: v.specialty,
        contact: v.contact,
        contractType: v.contractType,
      },
    });
  }

  console.log('Seeding Agents...');
  for (const a of AGENTS) {
    await prisma.agent.upsert({
      where: { id: a.id },
      update: {},
      create: {
        id: a.id,
        name: a.name,
        role: a.role,
        zone: a.zone,
      },
    });
  }

  console.log('✅ System data seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
