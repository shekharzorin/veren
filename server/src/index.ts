import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

import authRoutes from './routes/auth.routes';

import projectRoutes from './routes/project.routes';

import clientRoutes from './routes/client.routes';

import transactionRoutes from './routes/transaction.routes';

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/transactions', transactionRoutes);

app.get('/', (req, res) => {
    res.send('AMOG Server Running');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
