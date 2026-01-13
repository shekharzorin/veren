import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
    user?: any;
}

export const checkEligibility = async (req: AuthRequest, res: Response) => {
    try {
        const { projectId, phone, name } = req.body;
        const agentId = req.user.id;

        // 1. Check if Blocked by Developer (Direct Client)
        const blocked = await prisma.blockedClient.findFirst({
            where: { projectId, phone }
        });

        if (blocked) {
            return res.status(200).json({ status: 'REJECTED', reason: 'Direct Client' });
        }

        // 2. Check if Claimed by another Agent
        // Need to find if this phone is associated with ANY agent for this project context?
        // Current Claim model is: Client is linked to Agent. 
        // Does a Client record imply a claim on ALL projects?
        // PRD: "Client Claim – An agent saying 'this buyer is mine'".
        // Usually Claims are per project or global validity period. MVP: Let's assume Global Claim for simplicity or Project-based if we had a Claim model.
        // Our Schema: Client { phone, agentId }. This implies Global Claim.
        // If Client exists for another agent, they 'own' the client globally.

        const existingClient = await prisma.client.findFirst({
            where: { phone }
        });

        if (existingClient) {
            if (existingClient.agentId !== agentId) {
                return res.status(200).json({ status: 'REJECTED', reason: 'Claimed by another agent' });
            } else {
                return res.status(200).json({ status: 'APPROVED', clientId: existingClient.id, reason: 'Already your client' });
            }
        }

        // 3. If not exists, create new Client (Claim it)
        // "Agent submits client... System shows eligibility status instantly"
        // Does checking create the claim? Yes, "Agent submits...".
        const newClient = await prisma.client.create({
            data: {
                name,
                phone,
                agentId
            }
        });

        return res.status(201).json({ status: 'APPROVED', clientId: newClient.id });

    } catch (error) {
        res.status(500).json({ error: 'Eligibility check failed' });
    }
};

export const getMyClients = async (req: AuthRequest, res: Response) => {
    try {
        const clients = await prisma.client.findMany({
            where: { agentId: req.user.id },
            include: {
                eois: true,
                bookings: true
            }
        });
        res.json(clients);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch clients' });
    }
};
