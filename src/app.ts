import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import quoteRoutes from './routes/quoteRoutes';
import emailVerificationRoutes from './routes/emailVerificationRoutes';
import { setupSwagger } from './config/swagger';


const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use('/auth', authRoutes);
app.use('/api', quoteRoutes);
app.use('/auth', emailVerificationRoutes);

setupSwagger(app);

export default app;