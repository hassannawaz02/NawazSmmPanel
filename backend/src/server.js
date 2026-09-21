const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const config = require('./config');
const prisma = require('./lib/prisma');
const { errorHandler } = require('./middleware');
const { startCronJobs } = require('./services/cronJobs');

const {
  authRoutes,
  serviceRoutes,
  orderRoutes,
  walletRoutes,
  adminRoutes,
  messageRoutes,
} = require('./routes');

const paymentMethodRoutes = require('./routes/paymentMethodRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const providerRoutes = require('./routes/providerRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const siteSettingsRoutes = require('./routes/siteSettingsRoutes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/payment-methods', paymentMethodRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/site-settings', siteSettingsRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

app.use(errorHandler);

const PORT = config.port;

const server = app.listen(PORT, async () => {
  console.log(`Server running in ${config.nodeEnv} mode on port ${PORT}`);

  try {
    await prisma.$connect();
    console.log('Neon PostgreSQL Connected');
  } catch (err) {
    console.error('Database connection error:', err.message);
    process.exit(1);
  }

  if (config.nodeEnv !== 'test') {
    startCronJobs();
  }
});

process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;
