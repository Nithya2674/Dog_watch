import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'DogWatch API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, _next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`DogWatch server running on http://localhost:${PORT}`);
});
