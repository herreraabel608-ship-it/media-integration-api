import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import tiktokRoutes from './routes/tiktok.routes';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Media Integration API is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/tiktok', tiktokRoutes);

// Welcome endpoint
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Media Integration API',
    version: '1.0.0',
    endpoints: {
      tiktok: {
        post: 'POST /api/tiktok/post',
        delete: 'DELETE /api/tiktok/video/:videoId',
        analytics: 'GET /api/tiktok/video/:videoId/analytics',
        videos: 'GET /api/tiktok/videos',
        update: 'PATCH /api/tiktok/video/:videoId',
      },
    },
  });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Media Integration API is running on port ${PORT}`);
  console.log(`📚 API Documentation available at http://localhost:${PORT}`);
});

export default app;
