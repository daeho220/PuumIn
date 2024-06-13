import express from 'express';
import bodyParser from 'body-parser';
import authRoutes from './routes/authRoutes';
import quoteRoutes from './routes/quoteRoutes';
import { setupSwagger } from './config/swagger';


const app = express();

app.use(bodyParser.json());
app.use('/auth', authRoutes);
app.use('/api', quoteRoutes);

setupSwagger(app);

export default app;