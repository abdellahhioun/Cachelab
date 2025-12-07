import express, { Express } from 'express';
import keysRoutes from './api/keys.routes';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(requestLogger);

// Routes
app.use('/', keysRoutes);

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 API endpoints:`);
  console.log(`   POST   /keys - Create key`);
  console.log(`   GET    /keys/:key - Get key`);
  console.log(`   PUT    /keys/:key - Update key`);
  console.log(`   DELETE /keys/:key - Delete key`);
  console.log(`   GET    /keys - List all keys`);
});

