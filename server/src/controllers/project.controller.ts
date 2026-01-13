import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
    user?: any;
}

export const createProject = async (req: AuthRequest, res: Response) => {
    try {
        const { name, eoiAmount, maxEOIsPerUnit, eligibilityMode } = req.body;
        const developerId = req.user.id;

        const project = await prisma.project.create({
            data: {
                name,
                developerId,
                eoiAmount: eoiAmount ? parseFloat(eoiAmount) : undefined,
                maxEOIsPerUnit: maxEOIsPerUnit ? parseInt(maxEOIsPerUnit) : undefined,
                eligibilityMode: eligibilityMode !== undefined ? eligibilityMode : true
            }
        });

        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create project' });
    }
};

export const getProjects = async (req: AuthRequest, res: Response) => {
    try {
        // If developer, show own projects. If agent/broker, show all? 
        // PRD: "Agent - Browse verified projects".
        // For now, return all projects.
        const projects = await prisma.project.findMany({
            include: {
                developer: { select: { name: true, email: true } },
                _count: { select: { eois: true, bookings: true } }
            }
        });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
};

export const getMyProjects = async (req: AuthRequest, res: Response) => {
    try {
        const projects = await prisma.project.findMany({
            where: { developerId: req.user.id }
        });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch your projects' });
    }
};
