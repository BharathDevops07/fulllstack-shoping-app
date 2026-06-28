const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const Product = require('./models/Product');

const app = express();
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shop';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/products', async (req, res) => {
  const products = await Product.find().sort({ name: 1 });
  res.json(products);
});

app.get('/api/products/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json(product);
});

app.post('/api/orders', (req, res) => {
  const { items, total } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Order must include items' });
  }
  res.json({
    message: 'Order received successfully',
    order: {
      id: new Date().getTime().toString(),
      items,
      total,
      createdAt: new Date().toISOString(),
    },
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

async function seedProducts() {
  const count = await Product.countDocuments();
  if (count > 0) return;

  await Product.create([
    {
      name: 'City Tote Bag',
      description: 'A stylish tote for everyday essentials.',
      price: 29.99,
      image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
      inventory: 15,
    },
    {
      name: 'Noise Canceling Headphones',
      description: 'Comfortable headphones with superior sound.',
      price: 89.0,
      image: 'https://images.unsplash.com/photo-1518441902112-7f5294f21285?auto=format&fit=crop&w=800&q=80',
      inventory: 10,
    },
    {
      name: 'Wireless Keyboard',
      description: 'Slim keyboard for fast typing and portability.',
      price: 45.5,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
      inventory: 20,
    },
    {
      name: 'Coffee Mug',
      description: 'Ceramic mug for your favorite hot drinks.',
      price: 12.75,
      image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=80',
      inventory: 30,
    },
  ]);
  console.log('Seeded sample products.');
}

async function start() {
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
    await seedProducts();
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Startup error:', error);
    process.exit(1);
  }
}

start();
