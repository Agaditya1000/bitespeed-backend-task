import express from 'express';
import identityRoutes from './routes/identity.routes';
import { errorHandler } from './utils/error.handler';

const app = express();

app.use(express.json());

// Main identity router
app.use('/identify', identityRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
