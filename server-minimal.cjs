"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
const PORT = 3000;
const HOST = '::'; // IPv6 all interfaces
const server = app.listen(PORT, HOST, () => {
    console.log(`Server running on http://[::]:${PORT}`);
});
server.on('error', (err) => {
    console.error('Server error:', err);
});
server.on('listening', () => {
    console.log('Server is listening on port', PORT);
});
