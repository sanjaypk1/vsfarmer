const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/prisma');
const bcrypt = require('bcrypt');

let farmerModel;

beforeAll(async () => {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.farmer.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash('password', 10);
  const farmerUser = await prisma.user.create({ data: { email: 'farm@test.com', password, role: 'FARMER' } });
  farmerModel = await prisma.farmer.create({ data: { userId: farmerUser.id, name: 'Test Farm' } });
  await prisma.product.create({ data: { farmerId: farmerModel.id, name: 'Test Tomato', priceCents: 250, quantity: 40, unit: 'kg' } });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Backend API', () => {
  it('returns product listings', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('name', 'Test Tomato');
  });

  it('allows a new user to register and login', async () => {
    const register = await request(app).post('/api/auth/register').send({ email: 'testuser@example.com', password: 'password', role: 'CUSTOMER' });
    expect(register.statusCode).toBe(200);
    expect(register.body).toHaveProperty('token');

    const login = await request(app).post('/api/auth/login').send({ email: 'testuser@example.com', password: 'password' });
    expect(login.statusCode).toBe(200);
    expect(login.body).toHaveProperty('token');
  });
});
