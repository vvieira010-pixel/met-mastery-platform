import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = 3000;
const HOST = '::';  // IPv6 all interfaces

const server = app.listen(PORT, HOST, () => {
  console.log(`Server running on http://[::]:${PORT}`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

server.on('listening', () => {
  console.log('Server is listening on port', PORT);
});