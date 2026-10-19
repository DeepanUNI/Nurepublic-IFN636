require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRouters = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app= express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouters);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

//404 handler fr unmatched routes//
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

mongoose
.connect(process.env.MONGO_URI)
.then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
.catch((err)=> {
    console.error('MongoDB connection failed', err.message);
    process.exit(1);
});
