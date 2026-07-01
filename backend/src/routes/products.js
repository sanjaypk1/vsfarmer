const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const authenticate = require('../middleware/auth');

router.get('/', async (req, res) => {
  const { search, farmerId, category } = req.query;
  const filters = {};
  if (search) {
    filters.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ];
  }
  if (farmerId) {
    filters.farmerId = Number(farmerId);
  }
  if (category) {
    filters.category = category;
  }
  const products = await prisma.product.findMany({ where: filters, include: { farmer: true }, take: 200 });
  res.json(products.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    priceCents: p.priceCents,
    quantity: p.quantity,
    unit: p.unit,
    category: p.category,
    farmer: { id: p.farmer.id, name: p.farmer.name },
    harvestDate: p.harvestDate,
    images: p.images ? p.images.split(',') : []
  })));
});

router.post('/', authenticate, async (req, res) => {
  if (req.user.role !== 'FARMER') return res.status(403).json({ error: 'Only farmers may add products' });
  const { name, description, priceCents, quantity, unit, category, images, harvestDate } = req.body;
  if (!name || !priceCents) return res.status(400).json({ error: 'Missing required fields' });
  const product = await prisma.product.create({ data: {
    farmerId: req.user.farmer.id,
    name,
    description,
    priceCents,
    quantity: quantity || 0,
    unit: unit || 'unit',
    category: category || 'OTHER',
    images: images ? images.join(',') : null,
    harvestDate: harvestDate ? new Date(harvestDate) : null
  } });
  res.json(product);
});

router.put('/:id', authenticate, async (req, res) => {
  const productId = Number(req.params.id);
  const existing = await prisma.product.findUnique({ where: { id: productId }, include: { farmer: true } });
  if (!existing) return res.status(404).json({ error: 'Product not found' });
  if (req.user.role !== 'FARMER' || req.user.farmer?.id !== existing.farmerId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  const { name, description, priceCents, quantity, unit, category, images, harvestDate } = req.body;
  const product = await prisma.product.update({ where: { id: productId }, data: {
    name,
    description,
    priceCents,
    quantity,
    unit,
    category: category || existing.category,
    images: images ? images.join(',') : existing.images,
    harvestDate: harvestDate ? new Date(harvestDate) : existing.harvestDate
  } });
  res.json(product);
});

module.exports = router;
