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
import paymentRoutes from './routes/payment.routes';
import walletRoutes from './routes/wallet.routes';
import publicRoutes from './routes/public.routes';
import adminRoutes from './routes/admin.routes';

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api', transactionRoutes); // eoi, booking
app.use('/api/public', publicRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
    res.send('AMOG Server Running');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

