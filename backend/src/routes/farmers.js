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
    products: f.products.map(p => ({ id: p.id, name: p.name, priceCents: p.priceCents, quantity: p.quantity, unit: p.unit })),
    sellerEmail: f.user.email
  })));
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
