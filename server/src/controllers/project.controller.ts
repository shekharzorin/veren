import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { SettingsService } from '../services/settings.service';
import { AuditService } from '../services/audit.service';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
    user?: any;
}

export const createProject = async (req: AuthRequest, res: Response) => {
    try {
        const {
            name, eoiAmount, maxEOIsPerUnit, eligibilityMode, brochureUrl,
            // Rich Data Fields
            units, paymentPlan, amenities, gallery
        } = req.body;

        const developerId = req.user.id;

        // Construct Asset create operations from gallery array
        const assetsToCreate = [];
        if (brochureUrl) {
            assetsToCreate.push({ type: 'brochure', url: brochureUrl, label: 'Project Brochure' });
        }
        if (gallery && Array.isArray(gallery)) {
            gallery.forEach((url: string) => {
                assetsToCreate.push({ type: 'image', url, label: 'Gallery Image' });
            });
        }

        const project = await prisma.project.create({
            data: {
                name,
                developerId,
                eoiAmount: eoiAmount ? parseFloat(eoiAmount) : undefined,
                maxEOIsPerUnit: maxEOIsPerUnit ? parseInt(maxEOIsPerUnit) : undefined,
                eligibilityMode: eligibilityMode !== undefined ? eligibilityMode : true,
                commissionRate: req.body.commissionRate ? parseFloat(req.body.commissionRate) : await SettingsService.get('DEFAULT_COMMISSION_RATE', 2.0),

                // Nested Writes
                assets: assetsToCreate.length > 0 ? { create: assetsToCreate } : undefined,

                units: units ? {
                    create: units.map((u: any) => ({
                        name: u.name,
                        size: u.size,
                        price: u.price,
                        type: u.type,
                        count: u.count ? parseInt(u.count) : 0
                    }))
                } : undefined,

                paymentPlan: paymentPlan ? {
                    create: paymentPlan.map((p: any, idx: number) => ({
                        name: p.name,
                        percentage: parseFloat(p.percentage),
                        order: idx
                    }))
                } : undefined,

                amenities: amenities ? {
                    create: amenities.map((a: string) => ({
                        name: a
                    }))
                } : undefined
            },
            include: {
                units: true,
                paymentPlan: true,
                amenities: true,
                assets: true
            }
        });

        // Generate Individual Units for the Project
        if (project.units && project.units.length > 0) {
            const unitData: any[] = [];

            project.units.forEach((uType) => {
                const count = uType.count || 0;
                for (let i = 1; i <= count; i++) {
                    unitData.push({
                        unitNumber: `${uType.type}-${uType.name}-${i}`.replace(/\s+/g, '').toUpperCase(),
                        status: 'AVAILABLE',
                        unitTypeId: uType.id,
                        projectId: project.id
                    });
                }
            });

            if (unitData.length > 0) {
                await prisma.unit.createMany({
                    data: unitData
                });
            }
        }

        // Audit Log
        AuditService.logEvent('PROJECT_CREATED', { projectId: project.id, name: project.name }, req.user.id);

        res.status(201).json(project);
    } catch (error) {
        console.error("Create Project Error:", error);
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
                units: true,
                paymentPlan: true,
                amenities: true,
                assets: true,
                unitInstances: true,
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

export const joinProject = async (req: AuthRequest, res: Response) => {
    try {
        const { projectId } = req.body;
        const agentId = req.user.id;

        // Check availability? Already joined?
        const existing = await prisma.projectAgent.findUnique({
            where: {
                projectId_agentId: { projectId, agentId }
            }
        });

        if (existing) {
            return res.json({ message: 'Already joined', status: existing.status });
        }

        await prisma.projectAgent.create({
            data: {
                projectId,
                agentId,
                status: 'ACTIVE'
            }
        });

        res.status(201).json({ message: 'Successfully joined project' });
    } catch (error) {
        console.error('Join Project Error', error);
        res.status(500).json({ error: 'Failed to join project' });
    }
};
