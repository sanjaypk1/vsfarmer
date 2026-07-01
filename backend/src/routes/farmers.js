const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const authenticate = require('../middleware/auth');

router.get('/', async (req, res) => {
  const farmers = await prisma.farmer.findMany({ include: { user: true, products: true } });
  res.json(farmers.map(f => ({
    id: f.id,
    name: f.name,
    location: f.location,
    bio: f.bio,
    sellingCategories: f.sellingCategories ? f.sellingCategories.split(',') : [],
    products: f.products.map(p => ({ id: p.id, name: p.name, priceCents: p.priceCents, quantity: p.quantity, unit: p.unit, category: p.category })),
    sellerEmail: f.user.email
  })));
});

router.get('/:id', async (req, res) => {
  const farmerId = Number(req.params.id);
  const farmer = await prisma.farmer.findUnique({
    where: { id: farmerId },
    include: { user: true, products: true }
  });
  if (!farmer) return res.status(404).json({ error: 'Seller not found' });
  res.json({
    id: farmer.id,
    name: farmer.name,
    location: farmer.location,
    bio: farmer.bio,
    sellingCategories: farmer.sellingCategories ? farmer.sellingCategories.split(',') : [],
    products: farmer.products.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      priceCents: p.priceCents,
      quantity: p.quantity,
      unit: p.unit,
      category: p.category
    })),
    sellerEmail: farmer.user.email
  });
});

router.put('/:id', authenticate, async (req, res) => {
  if (req.user.role !== 'FARMER' && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  const farmerId = Number(req.params.id);
  if (req.user.role === 'FARMER' && req.user.farmer?.id !== farmerId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  const { name, location, bio } = req.body;
  const farmer = await prisma.farmer.update({ where: { id: farmerId }, data: { name, location, bio } });
  res.json(farmer);
});

module.exports = router;
