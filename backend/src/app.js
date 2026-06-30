require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const ordersRoutes = require('./routes/orders');
const farmersRoutes = require('./routes/farmers');
const usersRoutes = require('./routes/users');
const Razorpay = require('razorpay');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/farmers', farmersRoutes);
app.use('/api/users', usersRoutes);

app.post('/api/payments/razorpay/create-order', async (req, res) => {
  const { amountCents, currency = 'INR' } = req.body;
  try {
    const rzp = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    const order = await rzp.orders.create({ amount: amountCents, currency, receipt: `rcpt_${Date.now()}` });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = app;
