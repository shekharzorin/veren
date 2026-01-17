import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
import { WalletService } from '../services/wallet.service';

export const register = async (req: Request, res: Response) => {
    const { email, password, name, role, phone } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: 'AGENT', // Forced for public registration
                phone
            }
        });

        // Guaranteed Wallet Creation
        const walletType = WalletService.getWalletTypeFromRole(user.role);
        await WalletService.ensureWallet(user.id, walletType);

        res.status(201).json({ message: 'User created', userId: user.id });
    } catch (error) {
        res.status(500).json({ error: 'User creation failed. Email might be in use.' });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET as string,
            { expiresIn: '24h' }
        );

        res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};
