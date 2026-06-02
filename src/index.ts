import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import tiktokRoutes from './routes/tiktok.routes';
import automationRoutes from './routes/automation.routes';
import { initializeDatabase } from './services/database.service';
import { initializeScheduler } from './services/scheduler.service';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;
const ENABLE_AUTO_SCHEDULER = process.env.ENABLE_AUTO_SCHEDULER === 'true';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Media Integration API is running',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/tiktok', tiktokRoutes);
app.use('/api/automation', automationRoutes);

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Media Integration API with AI Automation',
    version: '2.0.0',
    features: {
      ai_powered: true,
      auto_scheduling: true,
      performance_analytics: true,
      smart_posting: true,
    },
  });
});

app.use((err: any, req: Request, res: Response) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
  });
});

async function startServer() {
  try {
    await initializeDatabase();
    console.log('✅ Database initialized');

    if (ENABLE_AUTO_SCHEDULER) {
      initializeScheduler();
      console.log('✅ Auto-scheduler enabled');
    } else {
      console.log('⚠️  Auto-scheduler disabled');
    }

    app.listen(PORT, () => {
      console.log(`\n🚀 Media Integration API v2.0 on port ${PORT}`);
      console.log(`\n🤖 Features:`);
      console.log('   ✅ TikTok Video Management');
      console.log('   ✅ Smart Automation (5+ posts/day)');
      console.log('   ✅ Performance Analytics');
      console.log('   ✅ Intelligent Scheduling');
      console.log('\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;