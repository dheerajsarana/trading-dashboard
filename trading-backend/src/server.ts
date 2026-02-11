import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import multer from 'multer';
import { authenticateToken } from './middleware/auth';
import { AuthController } from './controllers/auth.controller';
import { TradesController } from './controllers/trades.controller';
import { StatsController } from './controllers/stats.controller';
import { JournalController } from './controllers/journal.controller';
import { MT5Controller } from './controllers/mt5.controller';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Middleware
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:5173'];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes
app.post('/api/auth/register', AuthController.register);
app.post('/api/auth/login', AuthController.login);
app.post('/api/auth/logout', AuthController.logout);
app.get('/api/auth/me', authenticateToken, AuthController.me);

// Trade routes (protected)
app.get('/api/trades', authenticateToken, TradesController.getAllTrades);
app.post('/api/trades', authenticateToken, TradesController.createTrade);
app.put('/api/trades/:id', authenticateToken, TradesController.updateTrade);
app.delete('/api/trades/:id', authenticateToken, TradesController.deleteTrade);
app.delete('/api/trades', authenticateToken, TradesController.deleteAllTrades);
app.post('/api/trades/upload', authenticateToken, upload.single('file'), TradesController.uploadExcel);
app.get('/api/trades/symbols', authenticateToken, TradesController.getSymbols);

// Stats routes (protected)
app.get('/api/stats', authenticateToken, StatsController.getAllStats);
app.get('/api/stats/equity', authenticateToken, StatsController.getEquityCurve);
app.get('/api/stats/calendar', authenticateToken, StatsController.getCalendarData);
app.post('/api/stats/invalidate', authenticateToken, StatsController.invalidateCache);

// Journal routes (protected)
app.get('/api/journals', authenticateToken, JournalController.getAllJournals);
app.get('/api/journals/stats', authenticateToken, JournalController.getJournalStats);
app.get('/api/journals/:id', authenticateToken, JournalController.getJournalById);
app.get('/api/journals/trade/:tradeId', authenticateToken, JournalController.getJournalByTradeId);
app.post('/api/journals', authenticateToken, JournalController.createJournal);
app.put('/api/journals/:id', authenticateToken, JournalController.updateJournal);
app.delete('/api/journals/:id', authenticateToken, JournalController.deleteJournal);

// MT5 routes (protected)
app.post('/api/mt5/accounts', authenticateToken, MT5Controller.connectAccount);
app.get('/api/mt5/accounts', authenticateToken, MT5Controller.getAccounts);
app.get('/api/mt5/accounts/:id', authenticateToken, MT5Controller.getAccount);
app.put('/api/mt5/accounts/:id', authenticateToken, MT5Controller.updateAccount);
app.delete('/api/mt5/accounts/:id', authenticateToken, MT5Controller.deleteAccount);
app.post('/api/mt5/accounts/:id/sync', authenticateToken, MT5Controller.syncAccount);
app.get('/api/mt5/accounts/:id/dashboard', authenticateToken, MT5Controller.getDashboard);
app.get('/api/mt5/accounts/:id/equity', authenticateToken, MT5Controller.getEquityCurve);
app.get('/api/mt5/accounts/:id/positions', authenticateToken, MT5Controller.getPositions);
app.get('/api/mt5/accounts/:id/history', authenticateToken, MT5Controller.getHistory);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
});

export default app;
