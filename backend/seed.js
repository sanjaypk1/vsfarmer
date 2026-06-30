require('dotenv').config();
const prisma = require('./src/prisma');
const bcrypt = require('bcrypt');

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.farmer.deleteMany();
  await prisma.user.deleteMany();

  const pw = await bcrypt.hash('password', 10);
  const alice = await prisma.user.create({ data: { email: 'alice@example.com', password: pw, role: 'FARMER' } });
  const bob = await prisma.user.create({ data: { email: 'bob@example.com', password: pw, role: 'CUSTOMER' } });
  const admin = await prisma.user.create({ data: { email: 'admin@example.com', password: pw, role: 'ADMIN' } });
  const farmer = await prisma.farmer.create({ data: { userId: alice.id, name: 'Green Valley Farm', location: 'Localtown', bio: 'Family-owned organic produce.' } });
  await prisma.product.createMany({ data: [
    { farmerId: farmer.id, name: 'Tomatoes', priceCents: 300, quantity: 100, unit: 'kg' },
    { farmerId: farmer.id, name: 'Eggs', priceCents: 120, quantity: 200, unit: 'dozen' }
  ]});
  console.log('Seed complete with admin:', admin.email);
  console.log('Seed complete');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
