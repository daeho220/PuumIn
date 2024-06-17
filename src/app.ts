import express from 'express';
import bodyParser from 'body-parser';
import authRoutes from './routes/authRoutes';
import quoteRoutes from './routes/quoteRoutes';
import emailVerificationRoutes from './routes/emailVerificationRoutes';
import { setupSwagger } from './config/swagger';


const app = express();

app.use(bodyParser.json());
app.use('/auth', authRoutes);
app.use('/api', quoteRoutes);
app.use('/auth', emailVerificationRoutes);

setupSwagger(app);

export default app;