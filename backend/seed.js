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
  const farmer = await prisma.farmer.create({ data: { userId: alice.id, name: 'Green Valley Farm', location: 'Localtown', bio: 'Family-owned organic produce.', sellingCategories: 'SEEDS,PESTICIDES,FERTILIZERS' } });
  await prisma.product.createMany({ data: [
    { farmerId: farmer.id, name: 'High Yield Tomato Seeds', priceCents: 499, quantity: 100, unit: 'packet', category: 'SEEDS' },
    { farmerId: farmer.id, name: 'Neem Spray', priceCents: 399, quantity: 80, unit: 'bottle', category: 'PESTICIDES' },
    { farmerId: farmer.id, name: 'Organic Compost', priceCents: 599, quantity: 60, unit: 'kg', category: 'FERTILIZERS' },
    { farmerId: farmer.id, name: 'Hand Weeder', priceCents: 299, quantity: 50, unit: 'unit', category: 'TOOLS' }
  ]});
  console.log('Seed complete with admin:', admin.email);
  console.log('Seed complete');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
