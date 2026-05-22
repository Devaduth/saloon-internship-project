import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import appointmentRoutes from './routes/appointmentRoutes.js';
import stylistRoutes from './routes/stylistRoutes.js';
import { connectDB } from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(helmet());
app.use(cors({ origin: clientUrl, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));

app.get('/api/health', (_request, response) => {
  response.json({ success: true, message: 'Salon API is running' });
});

app.use('/api/appointments', appointmentRoutes);
app.use('/api/stylists', stylistRoutes);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    console.log(`Environment loaded: ${Boolean(process.env.MONGODB_URI)}`);
    await connectDB();
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    console.error(error.stack || error);
    process.exit(1);
  }
};

startServer();
