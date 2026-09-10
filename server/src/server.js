import app from './app.js';
import { config } from './config/env.js';
import { connectDB } from './config/db.js';
import { initCronJobs } from './services/cronService.js';
import { initEmailTransporter } from './config/email.js';

const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Initialize email transporter
    await initEmailTransporter();

    // 3. Start background cron sweepers
    initCronJobs();

    // 4. Start HTTP Server
    const server = app.listen(config.port, () => {
      console.log(`=========================================`);
      console.log(`🚀 FoodRescue Server Running`);
      console.log(`🌍 Environment: ${config.env}`);
      console.log(`📡 URL: http://localhost:${config.port}`);
      console.log(`=========================================`);
    });

    // Graceful shutdown handling
    const shutdown = () => {
      console.log('\n[FoodRescue] Gracefully shutting down...');
      server.close(() => {
        console.log('[FoodRescue] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('Fatal Server Error:', error);
    process.exit(1);
  }
};

startServer();
