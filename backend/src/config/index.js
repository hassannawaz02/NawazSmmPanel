const dotenv = require('dotenv');
const path = require('path');

// Load env vars - look in backend root directory (two levels up from config folder)
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'SMM_PROVIDER_URL', 'SMM_PROVIDER_API_KEY'];
requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    console.error(`[ERROR] Missing required environment variable: ${key}`);
    process.exit(1);
  }
});

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  cookieExpire: parseInt(process.env.COOKIE_EXPIRE) || 7,
  smmProvider: {
    url: process.env.SMM_PROVIDER_URL,
    apiKey: process.env.SMM_PROVIDER_API_KEY,
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};
