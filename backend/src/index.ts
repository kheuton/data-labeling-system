import express from 'express';
import cors from 'cors';
import { Database } from 'sqlite';
import { initializeDb } from './db';

const app = express();
const port = process.env.PORT || 4001;

app.use(cors());
app.use(express.json());

// Initialize database on startup
let db: Database;

(async () => {
  try {
    db = await initializeDb();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
})();

// Test endpoint
app.get('/api/health', async (req, res) => {
  try {
    const result = await db.get('SELECT datetime("now") as now') as { now: string };
    res.json({ status: 'healthy', timestamp: result.now });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});