const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const authenticate = require('../middleware/auth');

router.get('/', authenticate, async (req, res) => {
  let orders;
  if (req.user.role === 'ADMIN') {
    orders = await prisma.order.findMany({ include: { items: { include: { product: true } }, customer: true } });
  } else if (req.user.role === 'FARMER') {
    orders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            product: { farmerId: req.user.farmer.id }
          }
        }
      },
      include: { items: { include: { product: true } }, customer: true }
    });
  } else {
    orders = await prisma.order.findMany({ where: { customerId: req.user.id }, include: { items: { include: { product: true } } } });
  }
  res.json(orders);
});

router.post('/', authenticate, async (req, res) => {
  const { items, deliveryType, deliveryAddress } = req.body;
  const customerId = req.user.id;
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'Invalid order' });
  try {
    let total = 0;
    const orderItems = [];
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) return res.status(404).json({ error: 'Product not found' });
      if (product.quantity < item.quantity) return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      total += product.priceCents * item.quantity;
      orderItems.push({ productId: product.id, quantity: item.quantity, unitPrice: product.priceCents });
    }
    const order = await prisma.order.create({ data: { customerId, totalCents: total, status: 'PENDING', deliveryType: deliveryType || 'PICKUP', deliveryAddress, items: { create: orderItems } } });
    for (const item of orderItems) {
      await prisma.product.update({ where: { id: item.productId }, data: { quantity: { decrement: item.quantity } } });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/status', authenticate, async (req, res) => {
  const orderId = Number(req.params.id);
  const { status } = req.body;
  if (!['PENDING', 'PAID', 'FULFILLED', 'CANCELLED'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: { include: { product: true } } } });
  if (!order) return res.status(404).json({ error: 'Order not found' });
  const ownsOrder = order.customerId === req.user.id;
  const managesOrder = req.user.role === 'ADMIN' || (req.user.role === 'FARMER' && order.items.some(item => item.product.farmerId === req.user.farmer?.id));
  if (!managesOrder && !ownsOrder) return res.status(403).json({ error: 'Unauthorized' });
  const updated = await prisma.order.update({ where: { id: orderId }, data: { status } });
  res.json(updated);
});

module.exports = router;
